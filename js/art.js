/* =========================================================
   art.js — 캐릭터 그림 불러오기 + 배경(코드로 그린 SVG)
   ========================================================= */
(function () {
  'use strict';

  /* =========================================================
     캐릭터 그림 (img 폴더)
     전신   img/<id>.webp            기본(업무) 옷
            img/<id>_<옷>.webp       상황별 옷: casual · coat · pt …
     얼굴   img/<id>_<표정>.webp      표정별 얼굴: smile · sad · surprised …
            img/<id>_work.webp       표정 파일이 없을 때 쓰는 업무 모드 얼굴
            img/<id>_love.webp       표정 파일이 없을 때 쓰는 로맨스 모드 얼굴
     파일이 없으면 자동으로 다음 후보로 넘어갑니다.
     ========================================================= */
  const LOVE = { smile: 1, grin: 1, blush: 1, shy: 1 };
  function mode(expr) { return LOVE[expr] ? 'love' : 'work'; }

  const failed = new Set();
  // 후보 목록 중 실제로 쓸 수 있는 첫 그림. 한 파일 버전은 window.IMG에 그림이 내장됨
  function pick(list) {
    list = list.filter(p => p && !failed.has(p));
    if (window.IMG) {
      const hit = list.find(p => window.IMG[p]);
      return { src: hit ? window.IMG[hit] : list[list.length - 1], path: hit, rest: [] };
    }
    return { src: list[0], path: list[0], rest: list.slice(1) };
  }
  function img(cls, list) {
    const r = pick(list);
    return `<img class="${cls}" src="${r.src}" data-path="${r.path || ''}" data-fb="${r.rest.join('|')}" onerror="ART.fb(this)" alt="" draggable="false">`;
  }
  // 그림 파일이 없을 때 다음 후보로
  function fb(el) {
    if (el.dataset.path) failed.add(el.dataset.path);
    const rest = (el.dataset.fb || '').split('|').filter(Boolean);
    if (!rest.length) { el.onerror = null; return; }
    el.dataset.path = rest[0];
    el.dataset.fb = rest.slice(1).join('|');
    el.src = rest[0];
  }
  // 그림 경로 → 실제 주소 (한 파일 버전은 내장된 그림)
  function src(p) { return (window.IMG && window.IMG[p]) || p; }
  function cast(id) { return (window.CAST && window.CAST[id]) || {}; }

  /** 전신 그림 (outfit: 'work' | 'casual' | 'coat' | 'pt' …) */
  function sprite(id, outfit) {
    const c = cast(id);
    const list = [];
    if (outfit && outfit !== 'work') list.push(`img/${id}_${outfit}.webp`);
    list.push(c.sprite || `img/${id}.webp`);
    return img('char-img', list);
  }
  /** 표정에 맞는 얼굴: 표정 전용 그림 → 업무/로맨스 모드 그림 */
  function face(id, expr) {
    expr = expr || 'normal';
    const c = cast(id), m = mode(expr);
    const list = [`img/${id}_${expr}.webp`];
    list.push((c.faces && c.faces[m]) || `img/${id}_${m}.webp`);
    return img('face-img', list);
  }
  // 예전 코드와의 호환: viewBox를 주면 얼굴, 아니면 전신
  function character(id, expr, viewBox) { return viewBox ? face(id, expr) : sprite(id); }

  /* ---------- 표정 효과 (웹툰식 기호) ---------- */
  const EMO = {
    smile: `<g fill="#fff" stroke="#e8b04f" stroke-width="1.2"><path d="M84 12 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z"/><path d="M93 30 l1.4 3.4 3.4 1.4 -3.4 1.4 -1.4 3.4 -1.4 -3.4 -3.4 -1.4 3.4 -1.4z"/></g>`,
    grin: `<g fill="#fff3c4" stroke="#e8b04f" stroke-width="1.2"><path d="M82 10 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z"/><path d="M94 30 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z"/><path d="M10 14 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z"/></g>`,
    blush: `<g stroke="#e0607d" stroke-width="2" stroke-linecap="round"><path d="M80 14 l-4 9 M86 14 l-4 9 M92 14 l-4 9"/></g><path d="M90 30 c-3 -4 -9 -1 -6 4 l6 6 6 -6 c3 -5 -3 -8 -6 -4z" fill="#ff8fa6"/>`,
    shy: `<g stroke="#e0607d" stroke-width="2" stroke-linecap="round"><path d="M78 12 l-4 9 M84 12 l-4 9 M90 12 l-4 9 M96 12 l-4 9"/></g>`,
    surprised: `<g stroke="#2f2a2e" stroke-width="2.4" stroke-linecap="round"><path d="M84 6 l-2 12 M93 10 l-6 10 M98 22 l-9 4"/></g>`,
    sad: `<g stroke="#5a6f9a" stroke-width="1.6" stroke-linecap="round" opacity=".75"><path d="M14 0 v22 M22 0 v30 M30 0 v18 M70 0 v20 M78 0 v28 M86 0 v16"/></g>`,
    teary: `<path d="M88 14 c-5 8 -5 14 0 14 s5 -6 0 -14z" fill="#cfe8ff" stroke="#5a83b8" stroke-width="1.4"/><path d="M14 0 v20 M22 0 v28 M30 0 v16" stroke="#5a6f9a" stroke-width="1.5" opacity=".6"/>`,
    angry: `<g stroke="#d23b4f" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M80 10 q5 5 0 10 M98 10 q-5 5 0 10 M84 6 q5 5 10 0 M84 24 q5 -5 10 0"/></g>`,
    serious: `<path d="M0 0 H100 V26 Q50 34 0 26 Z" fill="#2f2a2e" opacity=".14"/>`,
  };
  /** 얼굴 위에 덧그리는 표정 기호 */
  function emote(expr) {
    const g = EMO[expr];
    return g ? `<svg class="emo emo-${expr}" viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true">${g}</svg>` : '';
  }

  /* =========================================================
     배경
     ========================================================= */
  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  // 도시 스카이라인 (건물 + 창문 불빛)
  function skyline(opt) {
    const r = rng(opt.seed || 7);
    let x = -10, s = '';
    while (x < 410) {
      const w = 24 + r() * 46;
      const h = opt.minH + r() * (opt.maxH - opt.minH);
      const y = opt.base - h;
      s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${(h + 400).toFixed(1)}" fill="${opt.color}"/>`;
      if (opt.lit) {
        for (let wy = y + 8; wy < opt.base - 6; wy += 11) {
          for (let wx = x + 5; wx < x + w - 6; wx += 9) {
            if (r() < opt.density) s += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="4" height="5" fill="${opt.lit}" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
          }
        }
      }
      x += w + r() * 6;
    }
    return s;
  }

  function stars(seed, n, maxY) {
    const r = rng(seed);
    let s = '';
    for (let i = 0; i < n; i++) {
      s += `<circle cx="${(r() * 400).toFixed(1)}" cy="${(r() * maxY).toFixed(1)}" r="${(0.5 + r() * 1.3).toFixed(2)}" fill="#fff" opacity="${(0.3 + r() * 0.7).toFixed(2)}"/>`;
    }
    return s;
  }

  function grad(id, stops, x2, y2) {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 || 0}" y2="${y2 === undefined ? 1 : y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  }

  function pots(y, dark) {
    const r = rng(42);
    const potC = dark ? '#6b4a3e' : '#c27a5a';
    const leafC = dark ? ['#2f5c4a', '#3a6e57'] : ['#5fae6e', '#7cc47d'];
    let s = '';
    const xs = [24, 70, 112, 300, 344];
    xs.forEach((x, i) => {
      const w = 30 + r() * 10, h = 26 + r() * 12;
      const lc = leafC[i % 2];
      for (let k = 0; k < 5; k++) {
        const a = -1.2 + k * 0.6 + (r() - 0.5) * 0.3;
        const len = 26 + r() * 22;
        s += `<ellipse cx="${(x + w / 2 + Math.sin(a) * len * 0.5).toFixed(1)}" cy="${(y - Math.cos(a) * len * 0.6).toFixed(1)}" rx="7" ry="${(len * 0.45).toFixed(1)}" transform="rotate(${(a * 57).toFixed(1)} ${(x + w / 2 + Math.sin(a) * len * 0.5).toFixed(1)} ${(y - Math.cos(a) * len * 0.6).toFixed(1)})" fill="${lc}"/>`;
      }
      s += `<path d="M${x} ${y} L${x + w} ${y} L${x + w - 4} ${y + h} L${x + 4} ${y + h} Z" fill="${potC}"/>`;
      s += `<rect x="${x - 2}" y="${y - 4}" width="${w + 4}" height="7" rx="2" fill="${potC}" opacity=".85"/>`;
    });
    return s;
  }

  function desks(y, dark) {
    const top = dark ? '#2a2f48' : '#d9dce6';
    const front = dark ? '#1c2034' : '#b9bfcf';
    const mon = dark ? '#0d1020' : '#3b4152';
    const screen = dark ? '#7fb4ff' : '#c9def7';
    let s = `<rect x="-10" y="${y}" width="420" height="16" fill="${top}"/><rect x="-10" y="${y + 16}" width="420" height="300" fill="${front}"/>`;
    [40, 250].forEach((x, i) => {
      s += `<rect x="${x}" y="${y - 78}" width="110" height="70" rx="5" fill="${mon}"/>`;
      s += `<rect x="${x + 6}" y="${y - 72}" width="98" height="56" rx="2" fill="${screen}" opacity="${dark ? 0.85 : 1}"/>`;
      if (dark && i === 0) s += `<rect x="${x + 14}" y="${y - 64}" width="60" height="4" fill="#fff" opacity=".6"/><rect x="${x + 14}" y="${y - 56}" width="44" height="4" fill="#fff" opacity=".4"/>`;
      s += `<rect x="${x + 48}" y="${y - 8}" width="14" height="10" fill="${mon}"/>`;
    });
    if (dark) s += `<ellipse cx="95" cy="${y - 40}" rx="120" ry="70" fill="#7fb4ff" opacity=".12"/>`;
    s += `<rect x="176" y="${y - 30}" width="22" height="28" rx="3" fill="${dark ? '#3a3f58' : '#fff'}"/><path d="M198 ${y - 24} q8 2 0 12" fill="none" stroke="${dark ? '#3a3f58' : '#fff'}" stroke-width="3"/>`;
    return s;
  }

  const BG = {
    // 타이틀용: 해 질 녘 9층 창가
    dusk() {
      return `<defs>${grad('g', [[0, '#2d2850'], [0.38, '#7b4a7d'], [0.62, '#e8837a'], [0.8, '#ffc28a']])}</defs>
        <rect width="400" height="760" fill="url(#g)"/>
        <circle cx="290" cy="420" r="70" fill="#ffd9a0" opacity=".9"/>
        ${skyline({ seed: 3, base: 560, minH: 90, maxH: 260, color: '#5a3b66', lit: '#ffd28a', density: 0.12 })}
        ${skyline({ seed: 11, base: 620, minH: 60, maxH: 200, color: '#3a2a4f', lit: '#ffcf7a', density: 0.22 })}
        <rect y="610" width="400" height="160" fill="#231c36"/>
        <rect x="0" y="0" width="400" height="18" fill="#1b1630"/>
        <rect x="128" y="0" width="12" height="620" fill="#1b1630"/><rect x="268" y="0" width="12" height="620" fill="#1b1630"/>
        <rect y="604" width="400" height="12" fill="#1b1630"/>`;
    },
    lobby() {
      return `<defs>${grad('m', [[0, '#d3d8e2'], [0.5, '#f4f6fa'], [1, '#c6ccd8']], 1, 0)}${grad('f', [[0, '#9aa2b4'], [1, '#e6e9f0']])}</defs>
        <rect width="400" height="760" fill="#e9e6ef"/>
        <rect x="60" y="120" width="280" height="500" rx="6" fill="#b7bdca"/>
        <rect x="76" y="140" width="122" height="480" fill="url(#m)"/>
        <rect x="202" y="140" width="122" height="480" fill="url(#m)"/>
        <rect x="170" y="78" width="60" height="32" rx="6" fill="#262a3c"/>
        <text x="200" y="102" text-anchor="middle" font-family="monospace" font-size="22" fill="#ff9b6a">9</text>
        <path d="M222 94 l6 -7 l6 7z" fill="#ff9b6a"/>
        <rect x="350" y="330" width="22" height="50" rx="4" fill="#cfd4de"/><circle cx="361" cy="345" r="5" fill="#ffd28a"/><circle cx="361" cy="365" r="5" fill="#9aa2b4"/>
        <rect y="620" width="400" height="140" fill="url(#f)"/>
        <rect x="76" y="630" width="248" height="60" fill="#fff" opacity=".25"/>`;
    },
    office() {
      return `<defs>${grad('s', [[0, '#9ec8f0'], [1, '#e5f1fb']])}</defs>
        <rect width="400" height="760" fill="#eef0f5"/>
        <rect x="0" y="40" width="400" height="400" fill="url(#s)"/>
        <ellipse cx="90" cy="120" rx="60" ry="16" fill="#fff" opacity=".8"/><ellipse cx="300" cy="90" rx="44" ry="12" fill="#fff" opacity=".7"/>
        ${skyline({ seed: 5, base: 440, minH: 80, maxH: 240, color: '#b9cbe0', lit: '#e6eef8', density: 0.25 })}
        ${skyline({ seed: 9, base: 440, minH: 40, maxH: 150, color: '#9fb3cc' })}
        <rect x="0" y="30" width="400" height="14" fill="#dfe2ea"/>
        ${[0, 133, 266, 396].map(x => `<rect x="${x - 4}" y="40" width="10" height="404" fill="#dfe2ea"/>`).join('')}
        <rect x="0" y="440" width="400" height="18" fill="#dfe2ea"/>
        <rect x="0" y="0" width="400" height="30" fill="#f6f7fa"/>
        <rect x="60" y="8" width="90" height="8" rx="4" fill="#fff" stroke="#e1e4ec"/><rect x="250" y="8" width="90" height="8" rx="4" fill="#fff" stroke="#e1e4ec"/>
        ${desks(560, false)}
        <path d="M352 470 q-20 -50 4 -90 q10 40 -4 90z M362 470 q20 -60 -2 -110 q-14 50 2 110z" fill="#6bb07a"/>
        <rect x="340" y="468" width="36" height="40" rx="4" fill="#e5e7ee"/>`;
    },
    office_night() {
      return `<defs>${grad('s', [[0, '#0d1230'], [1, '#2c2552']])}</defs>
        <rect width="400" height="760" fill="#171a2e"/>
        <rect x="0" y="40" width="400" height="400" fill="url(#s)"/>
        ${stars(4, 40, 200)}
        <circle cx="320" cy="100" r="18" fill="#fff6d8" opacity=".9"/>
        ${skyline({ seed: 5, base: 440, minH: 80, maxH: 240, color: '#1d2240', lit: '#ffd27a', density: 0.18 })}
        ${skyline({ seed: 9, base: 440, minH: 40, maxH: 150, color: '#141832', lit: '#ffe0a0', density: 0.1 })}
        <rect x="0" y="30" width="400" height="14" fill="#11142a"/>
        ${[0, 133, 266, 396].map(x => `<rect x="${x - 4}" y="40" width="10" height="404" fill="#11142a"/>`).join('')}
        <rect x="0" y="440" width="400" height="18" fill="#11142a"/>
        <rect x="0" y="0" width="400" height="30" fill="#0f1224"/>
        ${desks(560, true)}
        <path d="M330 520 L350 470 L372 470 L392 520 Z" fill="#ffcf7a" opacity=".18"/>
        <rect x="352" y="452" width="18" height="20" rx="3" fill="#3a3f58"/>`;
    },
    meeting() {
      return `<rect width="400" height="760" fill="#e8ebf2"/>
        <rect x="0" y="0" width="400" height="60" fill="#f4f5f9"/>
        <rect x="40" y="120" width="320" height="200" rx="6" fill="#fff" stroke="#c9cedb" stroke-width="4"/>
        <path d="M70 170 q30 -20 60 0 t60 0" fill="none" stroke="#5a7bd8" stroke-width="3"/>
        <rect x="70" y="200" width="120" height="6" rx="3" fill="#ff8f87"/><rect x="70" y="216" width="90" height="6" rx="3" fill="#c3c8d6"/>
        <circle cx="280" cy="210" r="40" fill="none" stroke="#5fae6e" stroke-width="5"/>
        <text x="280" y="217" text-anchor="middle" font-size="18" fill="#5fae6e" font-family="sans-serif">D-21</text>
        <rect x="60" y="320" width="280" height="10" fill="#b7bdca"/>
        <rect x="0" y="560" width="400" height="200" fill="#d1d6e2"/>
        <path d="M-20 600 L420 600 L380 700 L20 700 Z" fill="#8f7766"/>
        <path d="M-20 600 L420 600 L414 614 L-14 614 Z" fill="#a68c79"/>
        <rect x="150" y="560" width="100" height="40" rx="6" fill="#fff" opacity=".9"/>
        <path d="M170 560 q10 -40 30 -40 q20 0 30 40" fill="#9fd29a"/>`;
    },
    cafeteria() {
      return `<defs>${grad('w', [[0, '#fff1d6'], [1, '#ffe2b8']])}</defs>
        <rect width="400" height="760" fill="url(#w)"/>
        <rect x="30" y="80" width="340" height="140" rx="10" fill="#3b3a47"/>
        <text x="200" y="118" text-anchor="middle" font-size="18" fill="#ffd28a" font-family="sans-serif">오늘의 메뉴</text>
        <rect x="80" y="140" width="240" height="8" rx="4" fill="#fff" opacity=".8"/><rect x="110" y="162" width="180" height="8" rx="4" fill="#fff" opacity=".6"/><rect x="140" y="184" width="120" height="8" rx="4" fill="#ff8f87"/>
        ${[60, 200, 340].map(x => `<circle cx="${x}" cy="280" r="18" fill="#fff6e0"/><path d="M${x} 250 L${x} 262" stroke="#b08c5c" stroke-width="3"/>`).join('')}
        <rect y="500" width="400" height="260" fill="#e7c49a"/>
        <rect x="-10" y="560" width="200" height="20" rx="4" fill="#fffaf0"/><rect x="220" y="560" width="200" height="20" rx="4" fill="#fffaf0"/>
        <rect x="20" y="580" width="12" height="180" fill="#c9a274"/><rect x="368" y="580" width="12" height="180" fill="#c9a274"/>
        <ellipse cx="90" cy="556" rx="38" ry="8" fill="#fff"/><ellipse cx="310" cy="556" rx="38" ry="8" fill="#fff"/>`;
    },
    rooftop_day() {
      return `<defs>${grad('s', [[0, '#7ab8f5'], [0.7, '#d9ecff'], [1, '#fff4e4']])}</defs>
        <rect width="400" height="760" fill="url(#s)"/>
        <ellipse cx="80" cy="140" rx="70" ry="20" fill="#fff" opacity=".9"/><ellipse cx="120" cy="128" rx="40" ry="18" fill="#fff" opacity=".9"/>
        <ellipse cx="320" cy="220" rx="56" ry="14" fill="#fff" opacity=".8"/>
        ${skyline({ seed: 21, base: 520, minH: 60, maxH: 200, color: '#a9c2dc' })}
        ${skyline({ seed: 22, base: 540, minH: 30, maxH: 120, color: '#8ea9c6' })}
        <rect y="540" width="400" height="220" fill="#c9c4bc"/>
        <rect y="540" width="400" height="6" fill="#b4aea4"/>
        ${[...Array(11)].map((_, i) => `<rect x="${i * 40}" y="470" width="5" height="72" fill="#7d8597"/>`).join('')}
        <rect y="466" width="400" height="7" rx="3" fill="#7d8597"/><rect y="506" width="400" height="4" fill="#7d8597"/>
        ${pots(640, false)}
        <rect x="150" y="610" width="100" height="10" rx="3" fill="#a0785a"/><rect x="160" y="620" width="8" height="40" fill="#7e5d45"/><rect x="232" y="620" width="8" height="40" fill="#7e5d45"/>`;
    },
    rooftop_night() {
      return `<defs>${grad('s', [[0, '#0b0f2a'], [0.7, '#2a2756'], [1, '#4a3a6a']])}</defs>
        <rect width="400" height="760" fill="url(#s)"/>
        ${stars(8, 90, 420)}
        <circle cx="90" cy="130" r="22" fill="#fff6d8"/><circle cx="98" cy="124" r="20" fill="#121637" opacity=".15"/>
        ${skyline({ seed: 21, base: 520, minH: 60, maxH: 220, color: '#1c2146', lit: '#ffd27a', density: 0.2 })}
        ${skyline({ seed: 22, base: 540, minH: 30, maxH: 120, color: '#131736', lit: '#ffe5a8', density: 0.15 })}
        <rect y="540" width="400" height="220" fill="#2a2a3e"/>
        ${[...Array(11)].map((_, i) => `<rect x="${i * 40}" y="470" width="5" height="72" fill="#3c4058"/>`).join('')}
        <rect y="466" width="400" height="7" rx="3" fill="#3c4058"/><rect y="506" width="400" height="4" fill="#3c4058"/>
        <path d="M0 440 Q100 470 200 446 T400 444" fill="none" stroke="#3c4058" stroke-width="1.5"/>
        ${[20, 70, 120, 170, 220, 270, 320, 370].map((x, i) => `<circle cx="${x}" cy="${452 + Math.sin(i) * 8}" r="5" fill="#ffd28a"/><circle cx="${x}" cy="${452 + Math.sin(i) * 8}" r="12" fill="#ffd28a" opacity=".18"/>`).join('')}
        ${pots(640, true)}`;
    },
    pub() {
      return `<defs>${grad('w', [[0, '#3a1f1a'], [1, '#6b3a26']])}</defs>
        <rect width="400" height="760" fill="url(#w)"/>
        <path d="M0 60 Q100 100 200 70 T400 80" fill="none" stroke="#2a1410" stroke-width="2"/>
        ${[30, 110, 190, 270, 350].map((x, i) => `<line x1="${x}" y1="${70 + (i % 2) * 14}" x2="${x}" y2="${110 + (i % 2) * 14}" stroke="#2a1410" stroke-width="2"/><ellipse cx="${x}" cy="${130 + (i % 2) * 14}" rx="18" ry="22" fill="#ff7a4a"/><ellipse cx="${x}" cy="${130 + (i % 2) * 14}" rx="40" ry="40" fill="#ffb35a" opacity=".15"/>`).join('')}
        <rect x="20" y="220" width="360" height="12" fill="#2a1410"/><rect x="20" y="320" width="360" height="12" fill="#2a1410"/>
        ${[40, 70, 100, 130, 220, 250, 280, 310, 340].map((x, i) => `<rect x="${x}" y="${170 + (i % 3) * 6}" width="16" height="${50 - (i % 3) * 6}" rx="4" fill="${['#2f8a5b', '#d8a13a', '#5a7bd8'][i % 3]}"/>`).join('')}
        ${[50, 90, 150, 200, 260, 320].map((x, i) => `<rect x="${x}" y="${276 + (i % 2) * 4}" width="20" height="${44 - (i % 2) * 4}" rx="4" fill="${['#2f8a5b', '#d6d6d6'][i % 2]}"/>`).join('')}
        <rect y="540" width="400" height="220" fill="#4a2a1c"/>
        <ellipse cx="200" cy="600" rx="240" ry="50" fill="#8a5434"/>
        <ellipse cx="200" cy="590" rx="230" ry="44" fill="#a0653f"/>
        <ellipse cx="200" cy="584" rx="60" ry="14" fill="#333"/><ellipse cx="200" cy="580" rx="52" ry="10" fill="#ff7a4a" opacity=".6"/>
        <rect x="80" y="550" width="14" height="30" rx="3" fill="#2f8a5b"/><rect x="306" y="552" width="14" height="28" rx="3" fill="#2f8a5b"/>`;
    },
    karaoke() {
      return `<rect width="400" height="760" fill="#1d1238"/>
        <rect x="40" y="90" width="320" height="190" rx="8" fill="#0b0820" stroke="#8d5cff" stroke-width="4"/>
        <rect x="70" y="200" width="260" height="10" rx="5" fill="#ff6fb5"/><rect x="70" y="200" width="150" height="10" rx="5" fill="#ffe36f"/>
        <rect x="90" y="226" width="220" height="8" rx="4" fill="#fff" opacity=".5"/>
        ${stars(31, 30, 760)}
        <path d="M0 360 L400 320" stroke="#ff6fb5" stroke-width="3" opacity=".7"/><path d="M0 380 L400 420" stroke="#6ff0ff" stroke-width="3" opacity=".7"/>
        <circle cx="330" cy="40" r="26" fill="#ff6fb5" opacity=".3"/><circle cx="60" cy="50" r="20" fill="#6ff0ff" opacity=".3"/>
        <rect y="540" width="400" height="220" fill="#2a1a4a"/>
        <rect x="-10" y="600" width="420" height="160" rx="30" fill="#5a2a7a"/>
        <rect x="120" y="560" width="160" height="30" rx="8" fill="#140c28"/><circle cx="150" cy="575" r="6" fill="#6ff0ff"/><circle cx="250" cy="575" r="6" fill="#ff6fb5"/>`;
    },
    street_night() {
      return `<defs>${grad('s', [[0, '#0d1029'], [1, '#2a2148']])}</defs>
        <rect width="400" height="760" fill="url(#s)"/>
        ${stars(55, 30, 200)}
        ${skyline({ seed: 61, base: 360, minH: 120, maxH: 280, color: '#1a1c38', lit: '#ffd27a', density: 0.15 })}
        <rect x="20" y="300" width="230" height="250" fill="#24263f"/>
        <rect x="20" y="300" width="230" height="40" fill="#3fbfa8"/>
        <rect x="34" y="312" width="80" height="14" rx="3" fill="#fff" opacity=".85"/>
        <rect x="40" y="360" width="190" height="150" fill="#fff3c8" opacity=".85"/>
        ${[60, 100, 140, 180].map(x => `<rect x="${x}" y="380" width="26" height="110" fill="#f4d9a0"/>`).join('')}
        <ellipse cx="135" cy="560" rx="160" ry="30" fill="#fff3c8" opacity=".15"/>
        <rect x="320" y="200" width="6" height="360" fill="#3a3d5a"/><path d="M323 200 q0 -20 -30 -20" fill="none" stroke="#3a3d5a" stroke-width="6"/>
        <ellipse cx="292" cy="186" rx="12" ry="6" fill="#ffe7a8"/><ellipse cx="292" cy="320" rx="70" ry="160" fill="#ffe7a8" opacity=".08"/>
        <rect y="550" width="400" height="210" fill="#1b1c2e"/>
        <rect y="620" width="400" height="140" fill="#14151f"/>
        ${[0, 90, 180, 270, 360].map(x => `<rect x="${x}" y="686" width="50" height="6" fill="#e9e3a0" opacity=".6"/>`).join('')}
        <rect x="270" y="520" width="60" height="44" rx="4" fill="#d24a5a"/><circle cx="286" cy="530" r="5" fill="#fff" opacity=".3"/>`;
    },
    room() {
      return `<defs>${grad('s', [[0, '#ffd9b0'], [1, '#ffecd2']])}</defs>
        <rect width="400" height="760" fill="#f2e6f0"/>
        <rect x="200" y="90" width="170" height="220" rx="6" fill="url(#s)" stroke="#fff" stroke-width="8"/>
        <path d="M285 90 L285 310 M200 200 L370 200" stroke="#fff" stroke-width="6"/>
        <path d="M200 90 L250 90 L230 310 L200 310 Z" fill="#c9b8e8" opacity=".8"/><path d="M370 90 L330 90 L350 310 L370 310 Z" fill="#c9b8e8" opacity=".8"/>
        <path d="M200 310 L370 310 L420 760 L150 760 Z" fill="#ffe0b8" opacity=".25"/>
        <rect x="30" y="170" width="120" height="8" fill="#d6c4d9"/>
        <rect x="40" y="130" width="14" height="40" fill="#8a7bd8"/><rect x="58" y="138" width="12" height="32" fill="#ff8f87"/><rect x="74" y="126" width="16" height="44" fill="#5fae6e"/>
        <rect y="560" width="400" height="200" fill="#d9c6b0"/>
        <rect x="-20" y="470" width="260" height="130" rx="20" fill="#fff"/><rect x="-20" y="440" width="120" height="70" rx="24" fill="#f6f0ff"/>
        <rect x="-20" y="520" width="260" height="90" rx="10" fill="#b9a6e8"/>`;
    },
    hanriver() {
      return `<defs>${grad('s', [[0, '#5a6ad8'], [0.45, '#e88aa8'], [0.75, '#ffc28a'], [1, '#ffe3b0']])}${grad('w', [[0, '#e7a0a8'], [1, '#4a5aa8']])}</defs>
        <rect width="400" height="760" fill="url(#s)"/>
        <circle cx="120" cy="420" r="46" fill="#fff0c8"/>
        ${skyline({ seed: 71, base: 440, minH: 30, maxH: 130, color: '#7a5a92', lit: '#ffe0a0', density: 0.06 })}
        <rect y="440" width="400" height="140" fill="url(#w)"/>
        <rect x="80" y="460" width="80" height="4" rx="2" fill="#fff0c8" opacity=".6"/><rect x="100" y="480" width="40" height="3" rx="2" fill="#fff0c8" opacity=".5"/>
        <rect y="380" width="400" height="14" fill="#4a3a6a"/>
        ${[0, 1, 2, 3, 4].map(i => `<path d="M${i * 100 - 10} 394 Q${i * 100 + 40} 440 ${i * 100 + 90} 394" fill="none" stroke="#4a3a6a" stroke-width="10"/>`).join('')}
        ${[...Array(20)].map((_, i) => `<circle cx="${i * 20 + 10}" cy="378" r="2" fill="#ffe7a8"/>`).join('')}
        <path d="M0 580 Q200 550 400 590 L400 760 L0 760 Z" fill="#5f9a62"/>
        <path d="M0 640 Q200 610 400 650 L400 760 L0 760 Z" fill="#4f8a55"/>
        <rect x="0" y="600" width="400" height="12" fill="#b8a48a" opacity=".6"/>`;
    },
    hanriver_night() {
      return `<defs>${grad('s', [[0, '#0b0f2a'], [1, '#2c2856']])}${grad('w', [[0, '#1d2350'], [1, '#0a0d22']])}</defs>
        <rect width="400" height="760" fill="url(#s)"/>
        ${stars(73, 80, 360)}
        ${skyline({ seed: 71, base: 440, minH: 50, maxH: 170, color: '#151a3a', lit: '#ffd27a', density: 0.22 })}
        <rect y="440" width="400" height="140" fill="url(#w)"/>
        ${[...Array(14)].map((_, i) => `<rect x="${i * 30 + 8}" y="${452 + (i % 3) * 18}" width="${8 + (i % 4) * 4}" height="2" fill="#ffd27a" opacity=".5"/>`).join('')}
        <rect y="380" width="400" height="14" fill="#262a52"/>
        ${[0, 1, 2, 3, 4].map(i => `<path d="M${i * 100 - 10} 394 Q${i * 100 + 40} 440 ${i * 100 + 90} 394" fill="none" stroke="#262a52" stroke-width="10"/>`).join('')}
        ${[...Array(20)].map((_, i) => `<circle cx="${i * 20 + 10}" cy="378" r="2.4" fill="${i % 2 ? '#7fd8ff' : '#ffb3d0'}"/>`).join('')}
        <path d="M0 580 Q200 550 400 590 L400 760 L0 760 Z" fill="#1d2a2a"/>
        <rect x="300" y="420" width="6" height="200" fill="#2a2d48"/><ellipse cx="303" cy="418" rx="12" ry="6" fill="#ffe7a8"/>`;
    },
    pt() {
      return `<rect width="400" height="760" fill="#14162a"/>
        <path d="M200 0 L60 760 L340 760 Z" fill="#fff" opacity=".04"/>
        <rect x="30" y="80" width="340" height="230" rx="6" fill="#f4fbf2"/>
        <circle cx="200" cy="170" r="44" fill="#6cc27a"/>
        <path d="M200 206 C176 186 176 150 200 128 C224 150 224 186 200 206 Z" fill="#fff"/>
        <path d="M200 206 L200 150" stroke="#6cc27a" stroke-width="3"/>
        <text x="200" y="260" text-anchor="middle" font-size="22" font-weight="700" fill="#2f6655" font-family="sans-serif">봄빛음료</text>
        <text x="200" y="286" text-anchor="middle" font-size="12" fill="#7a8a80" font-family="sans-serif">RE-BRANDING PROPOSAL</text>
        <rect x="160" y="310" width="80" height="10" fill="#0d0f1e"/>
        ${[0, 1, 2].map(row => [...Array(9)].map((_, i) => `<rect x="${i * 46 + 2 - row * 6}" y="${560 + row * 64}" width="40" height="70" rx="12" fill="${row === 2 ? '#0a0b18' : '#1d2038'}"/>`).join('')).join('')}
        <rect x="300" y="420" width="60" height="120" fill="#262a46"/><rect x="290" y="410" width="80" height="14" rx="3" fill="#323758"/>`;
    },
  };

  let uid = 0;
  function background(name) {
    // story.js의 BG_IMAGES에 파일을 지정하면 그림 파일을 대신 씁니다. 예: office: 'img/bg_office.jpg'
    const file = window.BG_IMAGES && window.BG_IMAGES[name];
    if (file) return `<img class="bg-svg" src="${file}" alt="" style="width:100%;height:100%;object-fit:cover">`;
    const f = BG[name] || BG.office;
    // 배경이 두 장 겹쳐 있어도 그라디언트 id가 섞이지 않도록 고유 접두어를 붙임
    const pre = 'b' + (++uid) + '_';
    const body = f().replace(/id="/g, 'id="' + pre).replace(/url\(#/g, 'url(#' + pre);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 760" preserveAspectRatio="xMidYMid slice" class="bg-svg" aria-hidden="true">${body}</svg>`;
  }

  window.ART = { character, sprite, face, emote, mode, fb, background, BG_NAMES: Object.keys(BG) , src };
})();
