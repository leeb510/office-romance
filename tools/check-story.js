// 스토리 검사기: node tools/check-story.js  [--runs=20000] [--examples]
// 여러 성향으로 수십만 번 플레이해서 (1) 없는 장면으로 가는 go (2) 끝나지 않는 흐름
// (3) 도달 못 하는 엔딩·장면 (4) 아무도 안 고르는 선택지를 찾아냅니다.
const path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'js', 'story.js'));
const { STORY, ENDINGS, START_VARS, CAST } = window;

const errors = [];
const reachedEnd = {};
const reachedScene = new Set();
const sceneIds = Object.keys(STORY);
const KNOWN_E = ['normal', 'smile', 'grin', 'blush', 'shy', 'sad', 'teary', 'surprised', 'serious', 'angry'];
const KNOWN_OUTFIT = ['work', 'casual', 'coat', 'pt'];
const BG = ['dusk', 'lobby', 'office', 'office_night', 'meeting', 'cafeteria', 'rooftop_day', 'rooftop_night', 'pub', 'karaoke', 'street_night', 'room', 'hanriver', 'hanriver_night', 'pt'];

// 정적 검사
function walk(cmds, where) {
  cmds.forEach((c, i) => {
    const at = `${where}[${i}]`;
    if (typeof c.go === 'string' && !STORY[c.go]) errors.push(`${at}: 없는 장면 "${c.go}"`);
    if (c.bg && !BG.includes(c.bg)) errors.push(`${at}: 없는 배경 "${c.bg}"`);
    if (c.e && !KNOWN_E.includes(c.e)) errors.push(`${at}: 없는 표정 "${c.e}"`);
    if (c.msg && !CAST[c.msg]) errors.push(`${at}: 메시지 보낸 사람 "${c.msg}"`);
    if (c.s && /^[a-z]+$/.test(c.s) && !CAST[c.s]) errors.push(`${at}: CAST에 없는 캐릭터 "${c.s}"`);
    if (c.outfit) for (const k in c.outfit) {
      if (k !== 'all' && !CAST[k]) errors.push(`${at}: 옷 바꿀 캐릭터 "${k}"`);
      if (!KNOWN_OUTFIT.includes(c.outfit[k])) errors.push(`${at}: 처음 보는 옷 "${c.outfit[k]}" (KNOWN_OUTFIT에 추가하세요)`);
    }
    if (c.ending && !ENDINGS.find(e => e.id === c.ending)) errors.push(`${at}: ENDINGS에 없는 엔딩 "${c.ending}"`);
    if (c.cg) {
      if (!(window.CGS || {})[c.cg]) errors.push(`${at}: CGS에 없는 일러스트 "${c.cg}"`);
      else if (!require('fs').existsSync(path.join(__dirname, '..', 'img', 'cg', c.cg + '.webp'))) errors.push(`${at}: 그림 파일 없음 img/cg/${c.cg}.webp`);
    }
    const len = (c.t || c.me || '').length;
    if (len > 80) errors.push(`${at}: 대사가 길어요 (${len}자) — 모바일에서 넘칠 수 있음`);
    if (c.then) walk(c.then, at + '.then');
    if (c.else) walk(c.else, at + '.else');
    if (c.choice) c.choice.forEach((o, oi) => {
      if (typeof o.go === 'string' && !STORY[o.go]) errors.push(`${at}.choice[${oi}]: 없는 장면 "${o.go}"`);
      if (o.then) walk(o.then, `${at}.choice[${oi}].then`);
    });
  });
}
sceneIds.forEach(id => walk(STORY[id], id));

// 실행 시뮬레이션 (엔진과 같은 규칙)
// 선택지 조합이 수억 가지라 전부 따라가는 대신, 여러 성향의 플레이어로 수십만 번 플레이해 봅니다.
//  - 무작위로 고르는 플레이어
//  - 한 사람만 파는 플레이어 (5명 각각), 일만 하는 플레이어, 아무것도 안 하는 플레이어, 사고만 치는 플레이어
const cmdsOf = f => { let a = STORY[f.scene]; for (const k of f.path) a = a[k]; return a; };
const resolveGo = (g, v) => (typeof g === 'function' ? g(v) : g);
const optionHits = new Map();
const cgSeen = new Set();   // 선택지별로 한 번이라도 골랐는지
let rngState = 12345;   // mulberry32
const rand = () => {
  let t = (rngState = (rngState + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function score(opt, policy) {
  const a = opt.add || {};
  if (policy === 'random') return rand();
  if (policy === 'work') return (a.work || 0) * 3 - Object.keys(CAST).reduce((t, k) => t + Math.max(0, a[k] || 0), 0) - (a.bad || 0) * 5 + rand() * 0.5;
  if (policy === 'none') return -Object.values(a).reduce((t, n) => t + Math.abs(n), 0) - (opt.go && !opt.then ? 0 : 0) + rand() * 0.5;
  if (policy === 'bad') return (a.bad || 0) * 3 - (a.work || 0) + rand() * 0.5;
  // 한 사람 공략: 그 사람 호감도와 마음 점수(rs)를 최대로
  return (a[policy] || 0) * 2 + (a.rs || 0) * 3 + rand() * 0.8;
}

function play(policy, eps) {
  let stack = [{ scene: 'prologue', path: [], i: 0 }];
  const v = { ...START_VARS };
  const trail = [];
  for (let guard = 0; guard < 4000; guard++) {
    const f = stack[stack.length - 1];
    if (!f) { errors.push(`흐름이 끝남 (go/ending 없음): ${trail.slice(-3).join(' > ')}`); return; }
    reachedScene.add(f.scene);
    const cmds = cmdsOf(f);
    if (f.i >= cmds.length) {
      stack.pop();
      if (f.goAfter) {
        const opt = cmdsOf({ scene: f.scene, path: f.path.slice(0, -1) });
        const g = resolveGo(opt.go, v);
        if (!STORY[g]) { errors.push(`없는 장면 "${g}" (${f.scene})`); return; }
        stack = [{ scene: g, path: [], i: 0 }];
      }
      continue;
    }
    const idx = f.i, c = cmds[idx]; f.i++;
    if (c.cg) cgSeen.add(c.cg);
    if (c.add) for (const k in c.add) v[k] = (v[k] || 0) + c.add[k];
    if (c.set) Object.assign(v, c.set);
    if (c.if) { const b = c.if(v) ? 'then' : 'else'; if (c[b]) stack.push({ scene: f.scene, path: f.path.concat([idx, b]), i: 0 }); continue; }
    if ('go' in c && !c.choice) {
      const g = resolveGo(c.go, v);
      if (!STORY[g]) { errors.push(`없는 장면 "${g}" (${f.scene})`); return; }
      stack = [{ scene: g, path: [], i: 0 }]; continue;
    }
    if (c.ending) {
      const r = (reachedEnd[c.ending] = reachedEnd[c.ending] || { n: 0, by: {} });
      r.n++; r.by[policy] = (r.by[policy] || 0) + 1;
      if (!r.example) r.example = trail.slice();
      return;
    }
    if (c.choice) {
      let oi;
      if (rand() < eps) oi = Math.floor(rand() * c.choice.length);
      else { let best = -1e9; c.choice.forEach((o, j) => { const sc = score(o, policy); if (sc > best) { best = sc; oi = j; } }); }
      const opt = c.choice[oi];
      const hitKey = `${f.scene}${f.path.length ? '[' + f.path.join('.') + ']' : ''}[${idx}] ${oi + 1}번 "${opt.t.slice(0, 24)}"`;
      optionHits.set(hitKey, (optionHits.get(hitKey) || 0) + 1);
      c.choice.forEach((o, j) => { const k = `${f.scene}${f.path.length ? '[' + f.path.join('.') + ']' : ''}[${idx}] ${j + 1}번 "${o.t.slice(0, 24)}"`; if (!optionHits.has(k)) optionHits.set(k, 0); });
      trail.push(`${f.scene}#${oi + 1}`);
      if (opt.add) for (const k in opt.add) v[k] = (v[k] || 0) + opt.add[k];
      if (opt.set) Object.assign(v, opt.set);
      if (opt.then) stack.push({ scene: f.scene, path: f.path.concat([idx, 'choice', oi, 'then']), i: 0, goAfter: 'go' in opt });
      else if ('go' in opt) {
        const g = resolveGo(opt.go, v);
        if (!STORY[g]) { errors.push(`없는 장면 "${g}"`); return; }
        stack = [{ scene: g, path: [], i: 0 }];
      }
      continue;
    }
  }
  errors.push('무한 반복 의심: ' + trail.slice(-3).join(' > '));
}

const RUNS = Number(process.argv.find(a => /^--runs=/.test(a))?.split('=')[1] || 20000);
const t0 = Date.now();
for (let i = 0; i < RUNS * 4; i++) play('random', 1);
for (const pol of [...Object.keys(CAST), 'work', 'none', 'bad'])
  for (const eps of [0, 0.1, 0.25]) for (let i = 0; i < RUNS / 3; i++) play(pol, eps);
let total = 0; for (const k in reachedEnd) total += reachedEnd[k].n;

console.log(`플레이 ${total.toLocaleString()}번 (${((Date.now() - t0) / 1000).toFixed(1)}초)`);
for (const e of ENDINGS) {
  const r = reachedEnd[e.id];
  console.log(`${r ? '✔' : '✘'} ${e.id.padEnd(14)} ${e.title}${r ? `  (${r.n.toLocaleString()}번)` : '  ← 도달 못 함!'}`);
  if (!r) errors.push(`엔딩 도달 못 함: ${e.id}`);
}
const never = [...optionHits].filter(([, n]) => n === 0).map(([k]) => k);
if (never.length) errors.push('한 번도 안 골라진 선택지:\n     ' + never.join('\n     '));
const cgNever = Object.keys(window.CGS || {}).filter(id => !cgSeen.has(id));
if (cgNever.length) errors.push('한 번도 안 나오는 일러스트: ' + cgNever.join(', '));
console.log(`장면 일러스트 ${cgSeen.size} / ${Object.keys(window.CGS || {}).length}장 등장`);
const unreached = sceneIds.filter(id => !reachedScene.has(id));
if (unreached.length) errors.push('한 번도 안 가는 장면: ' + unreached.join(', '));
const uniq = [...new Set(errors)];
if (uniq.length) { console.log('\n문제 ' + uniq.length + '개'); uniq.forEach(e => console.log(' - ' + e)); process.exitCode = 1; }
else console.log(`\n문제 없음 ✔  (선택지 ${optionHits.size}개 모두 한 번 이상 골라짐)`);
if (process.argv.includes('--examples')) for (const e of ENDINGS) if (reachedEnd[e.id]) console.log(e.id, reachedEnd[e.id].example.join(' '));
