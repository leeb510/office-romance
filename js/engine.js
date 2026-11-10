/* =========================================================
   engine.js — 비주얼 노벨 엔진
   대사 출력, 선택지, 분기, 호감도, 저장/불러오기, 엔딩 수집
   ========================================================= */
(function () {
  'use strict';

  const STORY = window.STORY, CAST = window.CAST, ENDINGS = window.ENDINGS, ART = window.ART;
  const KEY = 'pm6-9f';            // 저장 키 앞부분 (게임마다 다르게)
  const FIRST_SCENE = 'prologue';

  /* ---------- 저장소 (실패해도 게임은 동작) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(KEY + ':' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(KEY + ':' + k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경 */ } },
    del(k) { try { localStorage.removeItem(KEY + ':' + k); } catch (e) { /* noop */ } },
  };

  const settings = Object.assign({ speed: 'normal', auto: 'normal', hints: true }, store.get('settings', {}));
  const SPEED = { slow: 55, normal: 32, fast: 14, instant: 0 };
  const AUTO_WAIT = { slow: 2600, normal: 1600, fast: 900 };

  /* ---------- DOM ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const el = {
    stage: $('#stage'), bgA: $('#bgA'), bgB: $('#bgB'), sprite: $('#sprite'), fx: $('#fx'),
    dialog: $('#dialog'), tag: $('#nametag'), portrait: $('#portrait'), closeup: $('#closeup'), cg: $('#cg'), text: $('#dialogText'), next: $('#nextMark'),
    choices: $('#choices'), toasts: $('#toasts'), chapter: $('#chapterLabel'),
    overlay: $('#overlay'), topbar: $('#topbar'),
    btnAuto: $('#btnAuto'), btnSkip: $('#btnSkip'),
  };

  /* ---------- 상태 ---------- */
  let S = null;              // 진행 상태 (저장되는 것)
  let mode = 'idle';         // idle | text | choice | card | ending
  let typing = false, typeTimer = 0, fullText = '', autoTimer = 0, skipTimer = 0;
  let auto = false, skip = false;
  let log = [];
  let frontBg = 'A';

  function freshState(name) {
    return {
      name: name,
      v: Object.assign({}, window.START_VARS),
      stack: [{ scene: FIRST_SCENE, path: [], i: 0 }],
      bg: null, fx: 'none', sprite: null, chapter: null,
      outfits: {},   // 캐릭터별 지금 입은 옷 (work · casual · coat · pt)
    };
  }

  /* ---------- 텍스트 치환 ---------- */
  function hasBatchim(str) {
    const c = str.charCodeAt(str.length - 1);
    if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 !== 0;
    return false;
  }
  function fmt(t) {
    if (!t) return '';
    const n = S ? S.name : '';
    return t
      .replace(/\{name\|([^|}]*)\|([^}]*)\}/g, (_, a, b) => (hasBatchim(n) ? a : b))
      .replace(/\{name\}/g, n);
  }

  /* ---------- 스크립트 탐색 ---------- */
  function cmdsOf(frame) {
    let a = STORY[frame.scene];
    for (const k of frame.path) a = a[k];
    return a;
  }
  function top() { return S.stack[S.stack.length - 1]; }
  function gotoScene(id) {
    if (!STORY[id]) { console.error('없는 장면:', id); return; }
    S.stack = [{ scene: id, path: [], i: 0 }];
  }
  function resolveGo(g) { return typeof g === 'function' ? g(S.v) : g; }

  function applyAdd(add) {
    if (!add) return;
    for (const k in add) {
      S.v[k] = (S.v[k] || 0) + add[k];
      if (!settings.hints || skip) continue;
      const n = add[k], sign = n > 0 ? '+' : '';
      if (CAST[k]) {
        if (n < 0) toast(`<span class="heart broken">♥</span>${CAST[k].short} 호감도 ${n}`, 'down');
        else toast(`<span class="heart" style="--c:${CAST[k].color}">♥</span>${CAST[k].short} 호감도 ${sign}${n}`);
      } else if (k === 'work') toast(`<span class="heart" style="--c:#7fb4ff">✦</span>업무력 ${sign}${n}`, n < 0 ? 'down' : '');
      else if (k === 'bad' && n > 0) toast(`<span class="heart" style="--c:#c4344f">!</span>평판이 나빠졌다`, 'down');
    }
  }
  function applySet(set) { if (set) Object.assign(S.v, set); }

  /* ---------- 메인 루프 ---------- */
  function step() {
    clearTimeout(autoTimer); clearTimeout(skipTimer);
    let guard = 0;
    while (guard++ < 500) {
      const f = top();
      if (!f) return;
      const cmds = cmdsOf(f);
      if (f.i >= cmds.length) {
        S.stack.pop();
        if (f.goAfter) {
          const opt = cmdsOf({ scene: f.scene, path: f.path.slice(0, -1) });
          gotoScene(resolveGo(opt.go));
          continue;
        }
        if (!S.stack.length) { console.warn('스토리 끝: go나 ending이 빠졌어요 →', f.scene); return; }
        continue;
      }
      const idx = f.i;
      const c = cmds[idx];
      f.i++;

      if ('bg' in c) { if (S.cg && !('cg' in c)) setCg(null); setBg(c.bg); }
      if ('fx' in c) setFx(c.fx);
      if (c.hide) { setSprite(null); if (S.cg && !('cg' in c)) setCg(null); }
      if ('cg' in c) setCg(c.cg);
      if (c.show && !S.cg) setSprite(c.show, c.e);
      if (c.add) applyAdd(c.add);
      if (c.set) applySet(c.set);
      if (c.sfx) showSfx(c.sfx);
      if (c.outfit) setOutfit(c.outfit);

      if (c.if) {
        const branch = c.if(S.v) ? 'then' : 'else';
        if (c[branch]) S.stack.push({ scene: f.scene, path: f.path.concat([idx, branch]), i: 0 });
        continue;
      }
      if ('go' in c && !c.choice) { gotoScene(resolveGo(c.go)); continue; }
      if (c.title) { if (S.cg) setCg(null); showCard(c); return; }
      if (c.choice) { showChoice(c, f, idx); return; }
      if (c.ending) { showEnding(c.ending); return; }
      if ('t' in c || 'me' in c) { say(c); return; }
    }
    console.error('명령이 너무 많이 반복돼요. go 순환을 확인하세요.');
  }

  /* ---------- 배경 / 캐릭터 / 효과 ---------- */
  function setBg(name, instant) {
    if (S.bg === name && !instant) return;
    S.bg = name;
    const front = frontBg === 'A' ? el.bgA : el.bgB;
    const back = frontBg === 'A' ? el.bgB : el.bgA;
    back.innerHTML = ART.background(name);
    if (instant) { back.style.transition = 'none'; front.style.transition = 'none'; }
    back.classList.remove('hidden');
    front.classList.add('hidden');
    if (instant) requestAnimationFrame(() => { back.style.transition = ''; front.style.transition = ''; });
    frontBg = frontBg === 'A' ? 'B' : 'A';
  }

  let spriteTimer = 0;
  function setSprite(id, e) {
    const cur = S.sprite;
    if (!id) {
      S.sprite = null;
      setCloseup(null);
      el.sprite.classList.add('out');
      clearTimeout(spriteTimer);
      spriteTimer = setTimeout(() => { if (!S.sprite) el.sprite.innerHTML = ''; }, 260);
      return;
    }
    e = e || 'normal';
    S.sprite = { id, e };
    clearTimeout(spriteTimer);
    el.sprite.classList.toggle('love', ART.mode(e) === 'love');
    el.sprite.className = el.sprite.className.replace(/\bemo-\S+/g, '').trim();
    el.sprite.classList.add('emo-' + e);
    setCloseup(needCloseup(id, e) ? id : null, e);
    if (cur && cur.id === id && el.sprite.innerHTML) {
      if (cur.e !== e) {
        spriteEmo(e);
        el.sprite.classList.remove('bump'); void el.sprite.offsetWidth; el.sprite.classList.add('bump');
      }
      el.sprite.classList.remove('out');
      return;
    }
    if (cur && el.sprite.innerHTML) {
      el.sprite.classList.add('out');
      spriteTimer = setTimeout(() => { renderSprite(id); el.sprite.classList.remove('out'); }, 200);
    } else {
      el.sprite.classList.add('out');
      renderSprite(id);
      requestAnimationFrame(() => requestAnimationFrame(() => el.sprite.classList.remove('out')));
    }
  }

  /* ---------- 얼굴 클로즈업 ----------
     전신 그림의 얼굴(CAST.look)과 어울리지 않는 표정이면 웹툰 컷처럼 얼굴을 크게 보여 줌 */
  const CLOSE = {
    smile: { blush: 1, shy: 1, sad: 1, teary: 1, surprised: 1, serious: 1, angry: 1 },
    calm:  { blush: 1, shy: 1, sad: 1, teary: 1, surprised: 1, angry: 1, grin: 1 },
  };
  function needCloseup(id, e) {
    const look = (CAST[id] && CAST[id].look) || 'calm';
    return !!(CLOSE[look] && CLOSE[look][e]);
  }
  let cuTimer = 0;
  function setCloseup(id, e) {
    const box = el.closeup;
    clearTimeout(cuTimer);
    if (!id) {
      if (box.hidden) return;
      box.classList.add('cu-out');
      el.sprite.classList.remove('dim');
      cuTimer = setTimeout(() => { box.hidden = true; box.innerHTML = ''; box.dataset.key = ''; }, 220);
      return;
    }
    const key = id + ':' + e;
    el.sprite.classList.add('dim');
    box.style.setProperty('--tint', CAST[id].tint || '#eee');
    box.className = 'closeup cu-' + e;
    box.hidden = false;
    if (box.dataset.key !== key) {
      box.dataset.key = key;
      box.innerHTML = `<div class="cu-lines"></div><div class="cu-panel">${ART.face(id, e)}<div class="cu-tint"></div>${ART.emote(e)}</div>`;
      void box.offsetWidth;
      box.classList.add('cu-in');
    }
  }

  /* ---------- 장면 일러스트 (컷신) ---------- */
  function setCg(id, instant) {
    const box = el.cg, frame = box.firstElementChild;
    if (!id || !(window.CGS || {})[id]) {
      S.cg = null;
      if (box.hidden) return;
      box.classList.add('cg-out');
      el.sprite.classList.remove('under-cg');
      setTimeout(() => { if (!S.cg) { box.hidden = true; frame.innerHTML = ''; box.classList.remove('cg-out'); } }, 300);
      return;
    }
    S.cg = id;
    S.lastCg = id;
    if (S.sprite) setSprite(null);
    setCloseup(null);
    const meta = CGS[id];
    box.style.setProperty('--tint', (CAST[meta.who] && CAST[meta.who].tint) || '#eee');
    frame.innerHTML = `<img src="${ART.src('img/cg/' + id + '.webp')}" alt="${esc(meta.title)}" draggable="false">`;
    box.classList.remove('cg-out', 'cg-in');
    box.hidden = false;
    if (!instant) { void box.offsetWidth; box.classList.add('cg-in'); }
    const seen = store.get('cgs', []);
    if (!seen.includes(id)) { seen.push(id); store.set('cgs', seen); if (!skip) toast('<span class="heart" style="--c:#b97482">✦</span>장면 일러스트 수집'); }
  }

  /* ---------- 옷 갈아입기 ---------- */
  function outfitOf(id) { return (S.outfits && S.outfits[id]) || 'work'; }
  function setOutfit(map) {
    S.outfits = S.outfits || {};
    const before = S.sprite ? outfitOf(S.sprite.id) : null;
    for (const k in map) {
      if (k === 'all') Object.keys(CAST).forEach(id => { S.outfits[id] = map.all; });
      else S.outfits[k] = map[k];
    }
    // 화면에 있는 캐릭터의 옷이 바뀌면 다시 그림
    if (S.sprite && outfitOf(S.sprite.id) !== before && el.sprite.innerHTML) {
      const id = S.sprite.id;
      el.sprite.classList.add('out');
      clearTimeout(spriteTimer);
      spriteTimer = setTimeout(() => { renderSprite(id); el.sprite.classList.remove('out'); }, 200);
    }
  }
  // 전신 그림 + 머리 위 표정 기호
  function renderSprite(id) {
    el.sprite.innerHTML = ART.sprite(id, outfitOf(id)) + '<div class="sprite-emo"></div>';
    spriteEmo(S.sprite ? S.sprite.e : 'normal');
  }
  function spriteEmo(e) {
    const box = el.sprite.querySelector('.sprite-emo');
    if (box) box.innerHTML = e === 'serious' ? '' : ART.emote(e);
  }

  /* 눈 / 꽃잎 */
  const FX = { kind: 'none', parts: [], raf: 0 };
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setFx(kind) {
    S.fx = kind;
    FX.kind = kind;
    cancelAnimationFrame(FX.raf);
    const cv = el.fx, ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (kind === 'none' || !kind) return;
    const resize = () => { const r = cv.getBoundingClientRect(); cv.width = r.width * devicePixelRatio; cv.height = r.height * devicePixelRatio; };
    resize();
    const n = reduced ? 18 : 60;
    FX.parts = Array.from({ length: n }, () => newPart(cv, true));
    const loop = () => {
      if (FX.kind !== kind) return;
      if (cv.width !== Math.round(cv.getBoundingClientRect().width * devicePixelRatio)) resize();
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const p of FX.parts) {
        p.y += p.vy * (reduced ? 0.4 : 1); p.x += Math.sin((p.t += 0.02)) * p.sway; p.r += p.vr;
        if (p.y > cv.height + 20) Object.assign(p, newPart(cv, false));
        ctx.save(); ctx.translate(p.x, p.y);
        if (kind === 'snow') {
          ctx.globalAlpha = p.a; ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(0, 0, p.s, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.rotate(p.r); ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.ellipse(0, 0, p.s * 1.6, p.s, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
      FX.raf = requestAnimationFrame(loop);
    };
    loop();
  }
  function newPart(cv, anywhere) {
    const d = devicePixelRatio;
    return {
      x: Math.random() * cv.width, y: anywhere ? Math.random() * cv.height : -20,
      vy: (0.6 + Math.random() * 1.4) * d, sway: (0.2 + Math.random() * 0.8) * d,
      s: (1.5 + Math.random() * 3) * d, a: 0.5 + Math.random() * 0.5, t: Math.random() * 6,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.05,
      c: ['#ffc4d6', '#ffd9e4', '#ffb3c8'][Math.floor(Math.random() * 3)],
    };
  }

  /* ---------- 효과음 글자 ---------- */
  function showSfx(text) {
    if (skip) return;
    const d = document.createElement('div');
    d.className = 'sfx';
    d.textContent = text;
    const left = 52 + Math.random() * 22, top = 18 + Math.random() * 14;
    d.style.left = left + '%';
    d.style.top = top + '%';
    d.style.setProperty('--r', (Math.random() * 16 - 8).toFixed(1) + 'deg');
    el.stage.appendChild(d);
    setTimeout(() => d.remove(), 1700);
  }

  /* ---------- 대사 ---------- */
  function say(c) {
    mode = 'text';
    el.dialog.classList.remove('is-hidden', 'is-narration', 'is-me', 'is-msg', 'is-speech', 'has-face');
    let who = null, color = null, role = '', faceId = null, faceE = 'normal';
    if (c.msg) {
      const p = CAST[c.msg];
      who = (p ? p.name : c.msg) + ' · 메시지'; color = p ? p.color : null;
      if (p) { faceId = c.msg; faceE = 'smile'; }
      el.dialog.classList.add('is-msg');
      if (S.sprite) setSprite(null);
    } else if (c.s) {
      const p = CAST[c.s];
      if (p) {
        who = p.name; color = p.color; role = p.age + ' · ' + p.role;
        el.dialog.classList.add('is-speech');
        if (S.cg) { if (S.sprite) setSprite(null); }   // 일러스트가 떠 있으면 캐릭터 그림은 쉼
        else { setSprite(c.s, c.e); faceId = c.s; faceE = c.e; }
      }
      else { who = c.s; color = '#a99aa1'; }
    } else if ('me' in c) {
      who = S.name; color = 'var(--rose-deep)'; role = '나';
      el.dialog.classList.add('is-me');
    } else {
      el.dialog.classList.add('is-narration');
    }
    const text = fmt('me' in c ? c.me : c.t);
    if (faceId && c.s && needCloseup(c.s, c.e || 'normal')) faceId = null;
    if (faceId) {
      el.dialog.classList.add('has-face');
      el.portrait.hidden = false;
      el.portrait.style.setProperty('--tint', CAST[faceId].tint || '#eee');
      const key = faceId + ':' + faceE;
      if (el.portrait.dataset.key !== key) {
        el.portrait.dataset.key = key;
        el.portrait.innerHTML = ART.face(faceId, faceE) + ART.emote(faceE);
        el.portrait.classList.remove('pop'); void el.portrait.offsetWidth; el.portrait.classList.add('pop');
      }
    } else { el.portrait.hidden = true; el.portrait.dataset.key = ''; }
    if (who) {
      el.tag.hidden = false;
      el.tag.style.setProperty('--tag', color || 'var(--rose)');
      el.tag.innerHTML = `${esc(who)}${role ? `<span class="role">${esc(role)}</span>` : ''}`;
    } else el.tag.hidden = true;

    log.push({ who, color, text });
    if (log.length > 150) log.shift();
    typeText(text);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }

  function typeText(str) {
    clearTimeout(typeTimer);
    fullText = str;
    el.next.classList.remove('show');
    const chars = Array.from(str);
    const sp = SPEED[settings.speed];
    if (skip || !sp) { el.text.textContent = str; doneTyping(); return; }
    typing = true;
    let i = 0;
    el.text.textContent = '';
    const tick = () => {
      i++;
      el.text.textContent = chars.slice(0, i).join('');
      if (i >= chars.length) doneTyping();
      else typeTimer = setTimeout(tick, /[.…!?,]/.test(chars[i - 1]) ? sp * 4 : sp);
    };
    tick();
  }
  function doneTyping() {
    clearTimeout(typeTimer);
    typing = false;
    el.text.textContent = fullText;
    el.next.classList.add('show');
    if (skip) { skipTimer = setTimeout(() => { if (mode === 'text') step(); }, 70); return; }
    if (auto) {
      const wait = AUTO_WAIT[settings.auto] + Array.from(fullText).length * 35;
      autoTimer = setTimeout(() => { if (mode === 'text' && !overlayOpen()) step(); }, wait);
    }
  }

  function advance() {
    if (overlayOpen()) return;
    if (mode === 'text') {
      if (typing) doneTyping(); else step();
    } else if (mode === 'card') {
      closeCard();
    }
  }

  /* ---------- 선택지 ---------- */
  function showChoice(c, f, idx) {
    mode = 'choice';
    stopSkip();
    clearTimeout(autoTimer);
    autosave();
    el.next.classList.remove('show');
    const box = el.choices;
    box.innerHTML = '<div class="memo-head">선택</div>';
    box.classList.remove('leaving');
    c.choice.forEach((opt, oi) => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.style.animationDelay = (oi * 70) + 'ms';
      b.innerHTML = `<span class="box" aria-hidden="true"></span><span>${esc(fmt(opt.t))}</span>`;
      b.addEventListener('click', ev => { ev.stopPropagation(); pick(oi, b); });
      box.appendChild(b);
    });
    box.hidden = false;
  }
  function pick(oi, btn) {
    if (mode !== 'choice') return;
    mode = 'picking';
    const f = top();
    const idx = f.i - 1;
    const opt = cmdsOf(f)[idx].choice[oi];
    btn.classList.add('picked');
    el.choices.classList.add('leaving');
    log.push({ who: null, text: '▸ ' + fmt(opt.t), choice: true });
    setTimeout(() => {
      el.choices.hidden = true;
      el.choices.innerHTML = '';
      // 상처 주는 선택이면 설레는 장면 일러스트는 걷어 낸다
      const a = opt.add || {};
      if (S.cg && (Object.keys(CAST).some(k => a[k] < 0) || a.bad > 0 || a.rs < 0)) setCg(null);
      applyAdd(opt.add);
      applySet(opt.set);
      if (opt.then) {
        S.stack.push({ scene: f.scene, path: f.path.concat([idx, 'choice', oi, 'then']), i: 0, goAfter: 'go' in opt });
      } else if ('go' in opt) {
        gotoScene(resolveGo(opt.go));
      }
      step();
    }, 320);
  }

  /* ---------- 챕터 카드 ---------- */
  let cardEl = null, cardTimer = 0;
  function showCard(c) {
    mode = 'card';
    S.chapter = { title: c.title, sub: c.sub || '' };
    renderChapter();
    // 카드 명령 위치로 저장 (불러오면 카드부터 다시 보여 줌)
    autosave();
    el.dialog.classList.add('is-hidden');
    cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.innerHTML = `<div><div class="no">${esc(c.title)}</div><div class="sub">${esc(fmt(c.sub || ''))}</div><div class="rule"></div></div>`;
    cardEl.addEventListener('click', ev => { ev.stopPropagation(); closeCard(); });
    el.stage.appendChild(cardEl);
    cardTimer = setTimeout(closeCard, skip ? 500 : 2200);
  }
  function closeCard() {
    if (mode !== 'card') return;
    clearTimeout(cardTimer);
    if (cardEl) { cardEl.remove(); cardEl = null; }
    el.dialog.classList.remove('is-hidden');
    step();
  }
  function renderChapter() {
    const c = S && S.chapter;
    el.chapter.innerHTML = c ? `<b>${esc(c.title)}</b>${esc(fmt(c.sub))}` : '';
  }

  /* ---------- 엔딩 ---------- */
  function showEnding(id) {
    mode = 'ending';
    stopSkip(); setAuto(false);
    const meta = ENDINGS.find(e => e.id === id) || { title: id, desc: '' };
    const got = store.get('endings', []);
    const isNew = !got.includes(id);
    if (isNew) { got.push(id); store.set('endings', got); }
    const pic = S.lastCg && CGS[S.lastCg] ? S.lastCg : null;
    if (S.cg) setCg(null);
    if (pic) { const ec = store.get('endcg', {}); ec[id] = pic; store.set('endcg', ec); }
    const no = ENDINGS.findIndex(e => e.id === id) + 1;
    el.dialog.classList.add('is-hidden');
    openOverlay(`
      <div class="overlay ending-screen" role="dialog" aria-label="엔딩">
        ${pic ? `<div class="end-cg is-scene" style="--tint:${meta.who ? CAST[meta.who].tint : '#ece6e0'}"><img src="${ART.src('img/cg/' + pic + '.webp')}" alt="${esc(CGS[pic].title)}"></div>`
          : meta.who ? `<div class="end-cg" style="--tint:${CAST[meta.who].tint}">${ART.face(meta.who, id.endsWith('happy') ? 'blush' : 'normal')}</div>` : ''}
        <div class="kicker">ENDING ${String(no).padStart(2, '0')}</div>
        <h2>${esc(meta.title)}</h2>
        <p>${esc(meta.desc)}</p>
        <div>${isNew ? '<span class="newbadge">새 엔딩 수집</span>' : ''}</div>
        <div class="count">수집한 엔딩 ${got.length} / ${ENDINGS.length}</div>
        <div class="ending-actions">
          <button class="btn" data-act="album">엔딩 앨범</button>
          <button class="btn primary" data-act="title">타이틀로</button>
        </div>
      </div>`, { album: () => openAlbum(true), title: () => toTitle() }, true);
  }

  /* ---------- 저장 ---------- */
  function snapshot() {
    const s = JSON.parse(JSON.stringify(S));
    // 현재 보고 있는 명령부터 다시 시작하도록 한 칸 되돌림
    const t = s.stack[s.stack.length - 1];
    if (t && t.i > 0) t.i -= 1;
    s.time = Date.now();
    s.preview = fullText.slice(0, 40);
    return s;
  }
  function autosave() { if (S) store.set('slot:auto', snapshot()); }
  function saveTo(slot) { store.set('slot:' + slot, snapshot()); }
  function loadFrom(slot) {
    const d = store.get('slot:' + slot, null);
    if (!d) return false;
    startWith(d);
    return true;
  }
  function startWith(data) {
    closeOverlay(true);
    stopSkip(); setAuto(false);
    S = data;
    S.outfits = S.outfits || {};
    log = [];
    mode = 'idle';
    el.choices.hidden = true; el.choices.innerHTML = '';
    el.dialog.classList.remove('is-hidden');
    el.text.textContent = '';
    el.tag.hidden = true;
    if (S.bg) setBg(S.bg, true); else { el.bgA.innerHTML = ''; el.bgB.innerHTML = ''; }
    el.sprite.innerHTML = '';
    el.sprite.classList.remove('dim');
    el.closeup.hidden = true; el.closeup.innerHTML = ''; el.closeup.dataset.key = '';
    el.cg.hidden = true; el.cg.firstElementChild.innerHTML = '';
    const sp = S.sprite; S.sprite = null;
    const cg = S.cg; S.cg = null;
    if (cg) setCg(cg, true);
    else if (sp) setSprite(sp.id, sp.e);
    setFx(S.fx || 'none');
    renderChapter();
    $('#titleScreen').hidden = true;
    step();
  }

  /* ---------- 상단 버튼 ---------- */
  function setAuto(on) {
    auto = on;
    el.btnAuto.classList.toggle('on', on);
    el.btnAuto.setAttribute('aria-pressed', on);
    if (on && mode === 'text' && !typing) doneTyping();
    if (!on) clearTimeout(autoTimer);
  }
  function stopSkip() { skip = false; el.btnSkip.classList.remove('on'); el.btnSkip.setAttribute('aria-pressed', false); clearTimeout(skipTimer); }
  function toggleSkip() {
    if (skip) { stopSkip(); return; }
    skip = true; el.btnSkip.classList.add('on'); el.btnSkip.setAttribute('aria-pressed', true);
    if (mode === 'text') { if (typing) doneTyping(); else step(); }
    else if (mode === 'card') closeCard();
  }

  /* ---------- 알림 ---------- */
  function toast(html, kind) {
    const t = document.createElement('div');
    t.className = 'toast' + (kind ? ' ' + kind : '');
    t.innerHTML = html;
    el.toasts.appendChild(t);
    setTimeout(() => t.remove(), 2300);
  }

  /* ---------- 오버레이 ---------- */
  let overlayEl = null, overlayLocked = false;
  function overlayOpen() { return !!overlayEl; }
  function openOverlay(html, actions, locked) {
    closeOverlay(true);
    const wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    overlayEl = wrap.firstElementChild;
    overlayLocked = !!locked;
    el.stage.appendChild(overlayEl);
    overlayEl.addEventListener('click', ev => {
      ev.stopPropagation();
      const a = ev.target.closest('[data-act]');
      if (a && actions && actions[a.dataset.act]) actions[a.dataset.act](a, ev);
      else if (ev.target.classList.contains('scrim') && !overlayLocked) closeOverlay();
    });
    clearTimeout(autoTimer);
    return overlayEl;
  }
  function closeOverlay(force) {
    if (!overlayEl) return;
    if (overlayLocked && !force) return;
    overlayEl.remove(); overlayEl = null; overlayLocked = false;
    if (auto && mode === 'text' && !typing) doneTyping();
  }
  function sheet(title, body, actions) {
    return openOverlay(`
      <div class="overlay" role="dialog" aria-label="${esc(title)}">
        <div class="scrim"></div>
        <div class="sheet">
          <div class="sheet-head"><h2>${esc(title)}</h2><button class="icon-btn" data-act="close" aria-label="닫기">✕</button></div>
          <div class="sheet-body">${body}</div>
        </div>
      </div>`, Object.assign({ close: () => closeOverlay() }, actions));
  }

  function openMenu() {
    if (mode === 'ending') return;
    stopSkip();
    sheet('메뉴', `
      <div class="menu-grid">
        <button data-act="save"><b>저장</b><span>슬롯 3개</span></button>
        <button data-act="load"><b>불러오기</b><span>자동 저장 포함</span></button>
        <button data-act="status"><b>호감도</b><span>지금 마음 상태</span></button>
        <button data-act="log"><b>대화 기록</b><span>지난 대사 보기</span></button>
        <button data-act="settings"><b>설정</b><span>글자 속도, 알림</span></button>
        <button data-act="title"><b>타이틀로</b><span>진행은 자동 저장됨</span></button>
      </div>`, {
      save: () => openSlots('save'), load: () => openSlots('load'),
      status: openStatus, log: openLog, settings: openSettings,
      title: () => { autosaveIfText(); toTitle(); },
    });
  }
  function autosaveIfText() { if (S && (mode === 'text' || mode === 'choice')) autosave(); }

  function slotThumb(d) {
    if (!d) return '';
    if (d.sprite) return ART.face(d.sprite.id, d.sprite.e);
    return ART.background(d.bg || 'office');
  }
  function fmtTime(t) {
    const d = new Date(t);
    const p = n => String(n).padStart(2, '0');
    return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function openSlots(kind) {
    const slots = kind === 'load' ? ['auto', '1', '2', '3'] : ['1', '2', '3'];
    let pending = null;
    const render = () => slots.map(k => {
      const d = store.get('slot:' + k, null);
      const label = k === 'auto' ? '자동 저장' : '슬롯 ' + k;
      const disabled = kind === 'load' && !d;
      const confirm = pending === k;
      const title = d ? (d.chapter ? d.chapter.title + ' · ' + d.chapter.sub : '프롤로그') : '빈 슬롯';
      const desc = confirm ? '한 번 더 누르면 덮어써요' : d ? d.name + ' · ' + (d.preview || '') : (kind === 'save' ? '눌러서 저장' : '');
      return `<button class="slot ${confirm ? 'confirm' : ''}" data-act="slot" data-k="${k}" ${disabled ? 'disabled' : ''}>
        <span class="thumb">${slotThumb(d)}</span>
        <div><div class="k">${label}${d ? ' · ' + fmtTime(d.time) : ''}</div>
        <div class="t">${esc(title)}</div>
        <div class="d">${esc(desc)}</div></div>
      </button>`;
    }).join('');
    const ov = sheet(kind === 'save' ? '저장' : '불러오기', `<div id="slotList">${render()}</div>`, {
      slot: (b) => {
        const k = b.dataset.k;
        if (kind === 'load') { loadFrom(k); return; }
        const exists = store.get('slot:' + k, null);
        if (exists && pending !== k) { pending = k; $('#slotList', ov).innerHTML = render(); return; }
        saveTo(k); pending = null;
        $('#slotList', ov).innerHTML = render();
        toast('저장했어요');
      },
    });
  }

  function openLog() {
    const items = log.length ? log.map(l => l.choice
      ? `<div class="log-item choice-log">${esc(l.text)}</div>`
      : `<div class="log-item" style="--c:${l.color || 'var(--muted)'}">${l.who ? `<span class="who">${esc(l.who)}</span>` : ''}${esc(l.text)}</div>`).join('')
      : '<div class="empty">아직 기록이 없어요.</div>';
    const ov = sheet('대화 기록', items);
    const body = $('.sheet-body', ov);
    requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
  }

  function openStatus() {
    const v = S ? S.v : window.START_VARS;
    const MAX = 15;
    const rows = Object.keys(CAST).map(id => {
      const p = CAST[id], n = v[id] || 0;
      return `<div class="person" style="--c:${p.color}">
        <div class="face">${ART.face(id, n >= 6 ? 'smile' : 'normal')}</div>
        <div><div class="nm">${esc(p.name)}<small>${p.age} · ${esc(p.role)}</small></div>
        <div class="ds">${esc(p.desc)}</div>
        <div class="meter"><i style="width:${Math.min(100, n / MAX * 100)}%"></i></div>
        <div class="meter-row"><span>호감도</span><span>${n}</span></div></div></div>`;
    }).join('');
    const w = v.work || 0;
    sheet('호감도', rows + `<div class="person" style="--c:#7fb4ff">
      <div class="face" style="display:grid;place-items:center;font-size:26px;color:#15172b">✦</div>
      <div><div class="nm">${esc(S ? S.name : '나')}<small>마케팅팀 신입</small></div>
      <div class="ds">일에 몰두한 만큼 오르는 업무력.</div>
      <div class="meter"><i style="width:${Math.min(100, w / 8 * 100)}%"></i></div>
      <div class="meter-row"><span>업무력</span><span>${w}</span></div></div></div>`);
  }

  function openSettings() {
    const seg = (key, opts) => `<div class="seg">${opts.map(([val, lbl]) =>
      `<button data-act="set" data-k="${key}" data-v="${val}" class="${String(settings[key]) === String(val) ? 'on' : ''}">${lbl}</button>`).join('')}</div>`;
    const body = () => `
      <div class="setting"><div class="lbl">글자 속도</div>${seg('speed', [['slow', '느림'], ['normal', '보통'], ['fast', '빠름'], ['instant', '즉시']])}</div>
      <div class="setting"><div class="lbl">자동 진행 속도</div>${seg('auto', [['slow', '느림'], ['normal', '보통'], ['fast', '빠름']])}</div>
      <div class="setting"><div class="lbl">호감도 변화 알림</div>${seg('hints', [[true, '보기'], [false, '숨기기']])}</div>
      <div class="setting"><div class="lbl">데이터</div><div class="seg"><button data-act="wipe" class="danger" id="wipeBtn">저장·엔딩 기록 모두 지우기</button></div></div>`;
    let wipeArmed = false;
    const ov = sheet('설정', `<div id="setBody">${body()}</div>`, {
      set: (b) => {
        let val = b.dataset.v;
        if (val === 'true') val = true; else if (val === 'false') val = false;
        settings[b.dataset.k] = val;
        store.set('settings', settings);
        $('#setBody', ov).innerHTML = body();
      },
      wipe: (b) => {
        if (!wipeArmed) { wipeArmed = true; b.textContent = '정말 지울까요? 한 번 더 누르세요'; return; }
        ['slot:auto', 'slot:1', 'slot:2', 'slot:3', 'endings'].forEach(k => store.del(k));
        b.textContent = '모두 지웠어요';
        refreshTitle();
      },
    });
  }

  function openAlbum(fromEnding) {
    const got = store.get('endings', []);
    const endCg = store.get('endcg', {});
    const cards = ENDINGS.map((e, i) => {
      const open = got.includes(e.id);
      const c = e.who ? CAST[e.who].tint : '#e9e4ee';
      let pic;
      if (!open) pic = '<span class="lock">?</span>';
      else if (endCg[e.id] && CGS[endCg[e.id]]) pic = `<img src="${ART.src('img/cg/' + endCg[e.id] + '.webp')}" alt="" style="object-position:50% 50%">`;
      else if (e.who) pic = ART.face(e.who, e.id.endsWith('happy') ? 'blush' : 'normal');
      else pic = ART.background({ career: 'office', bad: 'lobby', missed: 'street_night' }[e.id] || 'dusk');
      return `<div class="album-card ${open ? '' : 'locked'}" style="--c:${open ? c : 'var(--ink-2)'}">
        <div class="pic"><span class="no">${String(i + 1).padStart(2, '0')}</span>${pic}</div>
        <div class="cap"><b>${open ? esc(e.title) : '아직 못 본 엔딩'}</b><span>${esc(open ? e.desc : '힌트: ' + e.hint)}</span></div></div>`;
    }).join('');
    const seenCg = store.get('cgs', []);
    const cgIds = Object.keys(window.CGS || {});
    const cgCards = cgIds.map(id => {
      const m = CGS[id], open = seenCg.includes(id);
      return open
        ? `<button class="cg-thumb" data-act="cgview" data-id="${id}" aria-label="${esc(m.title)} 크게 보기"><img src="${ART.src('img/cg/' + id + '.webp')}" alt=""><span>${esc(m.title)}</span></button>`
        : `<div class="cg-thumb locked" style="--c:${m.who ? CAST[m.who].tint : '#ece6e0'}"><b>?</b><span>${m.who ? esc(CAST[m.who].short) + ' 이야기에서' : '어느 하루에서'}</span></div>`;
    }).join('');
    const ov = sheet('엔딩 앨범', `<div class="album-sum">모은 엔딩 <b>${got.length}</b> / ${ENDINGS.length}</div><div class="album">${cards}</div>
      <div class="album-sum" style="margin-top:22px">장면 일러스트 <b>${seenCg.length}</b> / ${cgIds.length}</div><div class="cg-grid">${cgCards}</div>`,
      Object.assign({ cgview: (b) => viewCg(b.dataset.id, fromEnding) }, fromEnding ? { close: () => toTitle() } : {}));
    if (fromEnding) overlayLocked = true;
    return ov;
  }

  function viewCg(id, fromEnding) {
    const m = CGS[id];
    openOverlay(`<div class="overlay cg-viewer" role="dialog" aria-label="${esc(m.title)}">
      <div class="scrim"></div>
      <figure><img src="${ART.src('img/cg/' + id + '.webp')}" alt="${esc(m.title)}"><figcaption>${esc(m.title)}${m.who ? ' · ' + esc(CAST[m.who].name) : ''}</figcaption></figure>
      <button class="btn" data-act="back">앨범으로</button></div>`, { back: () => openAlbum(fromEnding) }, true);
  }

  function openAbout() {
    sheet('게임 정보', `<div class="about">
      <p>(주)루멘 9층 마케팅팀에 입사한 신입이 되어, 3주 뒤 경쟁 PT까지의 시간을 보내는 사내 로맨스 어드벤처예요.</p>
      <p>누구와 점심을 먹고, 야근 커피를 누구에게 건네는지에 따라 이야기가 달라져요. 공략할 수 있는 사람은 다섯 명, 엔딩은 모두 ${ENDINGS.length}개.</p>
      <p>마지막 선택 직전에 자동 저장되니, 이어하기로 다른 엔딩도 찾아보세요.</p>
      <p class="credit">제작 Leeb · 2026</p></div>`);
  }

  /* ---------- 타이틀 / 이름 입력 ---------- */
  function refreshTitle() {
    const has = !!store.get('slot:auto', null);
    $('#btnContinue').disabled = !has;
    const got = store.get('endings', []).length;
    $('#albumCount').textContent = `${got} / ${ENDINGS.length}`;
  }
  function toTitle() {
    closeOverlay(true);
    stopSkip(); setAuto(false);
    clearTimeout(typeTimer); clearTimeout(cardTimer);
    if (cardEl) { cardEl.remove(); cardEl = null; }
    mode = 'idle';
    FX.kind = 'none'; cancelAnimationFrame(FX.raf);
    if (S) S.cg = null;
    el.cg.hidden = true; el.cg.firstElementChild.innerHTML = '';
    $('#titleScreen').hidden = false;
    refreshTitle();
  }
  function askName() {
    const silhouette = `<svg viewBox="0 0 70 86"><circle cx="35" cy="30" r="17" fill="#fff" stroke="#3d2f33" stroke-width="2"/><path d="M4 86 C6 60 20 52 35 52 C50 52 64 60 66 86 Z" fill="#fff" stroke="#3d2f33" stroke-width="2"/></svg>`;
    const d = new Date();
    const no = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}09`;
    const ov = openOverlay(`
      <div class="overlay" role="dialog" aria-label="사원증 발급">
        <div class="scrim"></div>
        <div class="badge-wrap">
          <form class="badge" id="badgeForm">
            <div class="badge-top"><span class="co">LUMEN</span><span class="hole"></span></div>
            <div class="badge-body">
              <div class="badge-photo">${silhouette}</div>
              <div>
                <label class="badge-field" for="nameInput">이름</label>
                <input id="nameInput" maxlength="6" autocomplete="off" value="지우" aria-label="주인공 이름">
                <div class="badge-field">소속<b>마케팅팀 · 신입 마케터</b></div>
                <div class="badge-field">사번<b style="font-variant-numeric:tabular-nums">${no}</b></div>
              </div>
            </div>
            <div class="badge-note">주인공 이름을 정해 주세요. 최대 6글자.</div>
            <div class="badge-actions">
              <button type="button" class="btn ghost" data-act="cancel">취소</button>
              <button type="submit" class="btn primary">출근하기</button>
            </div>
          </form>
        </div>
      </div>`, { cancel: () => closeOverlay() });
    const input = $('#nameInput', ov);
    setTimeout(() => { try { input.focus(); input.select(); } catch (e) { /* noop */ } }, 350);
    $('#badgeForm', ov).addEventListener('submit', ev => {
      ev.preventDefault();
      const name = (input.value || '').trim().slice(0, 6) || '지우';
      startWith(freshState(name));
    });
  }

  /* ---------- 이벤트 연결 ---------- */
  function bind() {
    $('#titleArt').src = ART.src('img/title.webp');
    $('#btnNew').addEventListener('click', askName);
    $('#btnContinue').addEventListener('click', () => loadFrom('auto'));
    $('#btnAlbum').addEventListener('click', () => openAlbum(false));
    $('#btnAbout').addEventListener('click', openAbout);
    $('#btnMenu').addEventListener('click', ev => { ev.stopPropagation(); openMenu(); });
    $('#btnLog').addEventListener('click', ev => { ev.stopPropagation(); stopSkip(); openLog(); });
    el.btnAuto.addEventListener('click', ev => { ev.stopPropagation(); setAuto(!auto); });
    el.btnSkip.addEventListener('click', ev => { ev.stopPropagation(); toggleSkip(); });
    el.stage.addEventListener('click', ev => {
      if (ev.target.closest('button, input, .overlay, .title-screen')) return;
      if (skip) { stopSkip(); return; }
      advance();
    });
    document.addEventListener('keydown', ev => {
      if (ev.target.tagName === 'INPUT') return;
      if (ev.key === 'Escape') { if (overlayOpen()) closeOverlay(); else if (!$('#titleScreen').hidden) return; else openMenu(); return; }
      if ((ev.key === ' ' || ev.key === 'Enter') && $('#titleScreen').hidden && !overlayOpen()) { ev.preventDefault(); advance(); }
      if (mode === 'choice' && /^[1-4]$/.test(ev.key)) {
        const b = el.choices.querySelectorAll('.choice')[+ev.key - 1];
        if (b) b.click();
      }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) autosaveIfText(); });
    refreshTitle();
  }

  bind();

  // 디버그/테스트용 (콘솔에서 GAME.state() 등)
  window.GAME = { state: () => S, start: name => startWith(freshState(name || '지우')), goto: id => { gotoScene(id); step(); } };
})();
