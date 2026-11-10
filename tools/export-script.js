// 대본 내보내기: node tools/export-script.js > script.json
// story.js의 장면·대사·선택지를 읽기 좋은 JSON으로 바꿉니다. (조건 함수는 사람이 읽는 문장으로)
const path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'js', 'story.js'));
const { STORY, CAST, ENDINGS } = window;

const BG = { dusk: '해 질 녘 창가', lobby: '1층 로비', office: '9층 사무실', office_night: '밤 사무실', meeting: '회의실',
  cafeteria: '구내식당', rooftop_day: '옥상 (낮)', rooftop_night: '옥상 (밤)', pub: '회식 자리', karaoke: '노래방',
  street_night: '밤거리', room: '내 방', hanriver: '한강 (해 질 녘)', hanriver_night: '한강 (밤)', pt: 'PT 발표장' };
const OUTFIT = { work: '업무복', casual: '주말 사복', coat: '코트', pt: 'PT 정장' };
const FX = { snow: '눈', petal: '꽃잎', none: '효과 끔' };
const EXPR = { normal: '평소', smile: '미소', grin: '활짝', blush: '설렘', shy: '수줍음', sad: '슬픔', teary: '울먹임',
  surprised: '놀람', serious: '진지', angry: '화남' };
const FLAG = {
  fan: '유진에게 "1화부터 결제할게요"라고 했으면', duck: '준호에게 고무 오리를 해 줬으면', metRoof: '1화에 옥상에 가 봤으면',
  cocky: '유진에게 "금방 해요"라고 했으면', harinCold: '첫날 하린에게 차갑게 굴었으면', duckHidden: '준호의 오리를 비웃었으면',
  gossip: '탕비실에서 유진 흉을 봤으면', seenSketch: '스케치를 봤으면',
};
const short = id => (CAST[id] ? CAST[id].short : id);

function cond(fn) {
  const src = fn.toString().replace(/\s+/g, ' ');
  let m;
  if ((m = src.match(/v\.rs\s*>=\s*1/))) return '루트에서 마음을 한 번 이상 전했으면';
  if ((m = src.match(/v\.rs\s*<\s*0/))) return '루트에서 상처 준 말이 더 많으면';
  if ((m = src.match(/v\.rs\s*>=\s*0/))) return '루트에서 상처 준 말이 더 많지 않으면';
  if ((m = src.match(/v\.route\s*===\s*'(\w+)'/))) return `${short(m[1])} 루트였으면`;
  if ((m = src.match(/=>\s*v\.(\w+)\s*$/))) return FLAG[m[1]] || `${m[1]} 이면`;
  return src.replace(/^v\s*=>\s*/, '');
}
function goText(g) {
  if (typeof g === 'string') return { to: g };
  const src = g.toString().replace(/\s+/g, ' ');
  let m;
  if ((m = src.match(/HAPPY_RS \? '(\w+)' : '(\w+)'/)))
    return { to: m[1], alt: m[2], rule: `마음 점수 ${window.HAPPY_RS} 이상이면` };
  if (src.includes('ROUTE_THRESHOLD'))
    return { rule: `사고 ${window.BAD_LIMIT}번 이상 → 수습 연장 엔딩 · 호감도 ${window.ROUTE_THRESHOLD} 이상인 사람 중 가장 높은 사람의 루트 · 아무도 없으면 업무력 4 이상은 커리어, 아니면 솔로`,
      targets: ['end_bad', ...Object.keys(CAST).map(k => 'route_' + k), 'end_career', 'end_solo'] };
  return { rule: src };
}
function effects(add, set) {
  const out = [];
  for (const k in add || {}) {
    const n = add[k];
    if (CAST[k]) out.push({ k: 'aff', who: k, n, label: `${short(k)} ${n > 0 ? '+' : ''}${n}` });
    else if (k === 'work') out.push({ k: 'work', n, label: `업무력 ${n > 0 ? '+' : ''}${n}` });
    else if (k === 'bad') out.push({ k: 'bad', n, label: `사고 +${n}` });
    else if (k === 'rs') out.push({ k: 'rs', n, label: `마음 ${n > 0 ? '+' : ''}${n}` });
  }
  for (const k in set || {}) if (FLAG[k] || k === 'last') out.push({ k: 'flag', label: k === 'last' ? `마지막에 도운 사람: ${short(set[k])}` : '기억됨: ' + FLAG[k].replace(/으면$|면$/, '') });
  return out;
}
function conv(cmds) {
  const out = [];
  for (const c of cmds) {
    if (c.title) out.push({ type: 'title', title: c.title, sub: c.sub || '' });
    if (c.bg) out.push({ type: 'dir', text: '배경 · ' + (BG[c.bg] || c.bg) });
    if (c.outfit) out.push({ type: 'dir', text: '옷 · ' + Object.entries(c.outfit).map(([k, o]) => `${k === 'all' ? '모두' : short(k)} ${OUTFIT[o] || o}`).join(', ') });
    if (c.fx) out.push({ type: 'dir', text: '효과 · ' + (FX[c.fx] || c.fx) });
    if (c.sfx) out.push({ type: 'sfx', text: c.sfx });
    if (c.cg) out.push({ type: 'cg', id: c.cg, title: (window.CGS[c.cg] || {}).title || c.cg });
    if (c.add && !c.choice) out.push({ type: 'fx', eff: effects(c.add) });
    if (c.if) out.push({ type: 'if', cond: cond(c.if), then: c.then ? conv(c.then) : [], else: c.else ? conv(c.else) : [] });
    if (c.choice) out.push({ type: 'choice', options: c.choice.map(o => ({
      t: o.t, eff: effects(o.add, o.set), then: o.then ? conv(o.then) : [], go: 'go' in o ? goText(o.go) : null,
      bad: !!(o.add && (Object.keys(CAST).some(k => o.add[k] < 0) || o.add.bad > 0 || o.add.rs < 0 || o.add.work < 0)),
    })) });
    if ('go' in c && !c.choice) out.push({ type: 'go', ...goText(c.go) });
    if (c.ending) { const e = ENDINGS.find(x => x.id === c.ending); out.push({ type: 'ending', id: c.ending, title: e.title, desc: e.desc, who: e.who }); }
    if (c.msg) out.push({ type: 'msg', who: c.msg, t: c.t });
    else if (c.s && 't' in c) out.push({ type: 'line', who: c.s, e: c.e ? EXPR[c.e] || c.e : null, t: c.t });
    else if ('me' in c) out.push({ type: 'me', t: c.me });
    else if ('t' in c && !c.title) out.push({ type: 'narr', t: c.t });
  }
  return out;
}

const NAMES = { alone: '혼자', sleep: '낮잠', skip: '몰래 퇴근', karaoke: '노래방', home: '조용히 귀가', study: '주말 공부',
  ghost: '주말 잠수', leave: '먼저 퇴근', work: '혼자 다시 작업' };
function label(id, cmds) {
  const t = cmds.find(c => c.title);
  if (t) return `${t.title} · ${t.sub}`;
  const end = cmds.find(c => c.ending);
  if (id.startsWith('end_') && end) return '엔딩 · ' + ENDINGS.find(e => e.id === end.ending).title;
  let m;
  if ((m = id.match(/^ch(\d)_(\w+)$/))) return `${m[1]}화 갈래 · ${CAST[m[2]] ? CAST[m[2]].short : NAMES[m[2]] || m[2]}`;
  if ((m = id.match(/^(\w+)_miss$/))) return `${short(m[1])} 9화 · 고백이 아직 닿지 않을 때`;
  if (id === 'route_check') return '루트 결정';
  return id;
}
function group(id) {
  if (id === 'prologue' || /^ch\d/.test(id) || id === 'route_check') return 'common';
  for (const k of Object.keys(CAST)) if (id === 'route_' + k || id.startsWith(k + '_') || id.startsWith('end_' + k)) return k;
  return 'other';
}

let lines = 0, choices = 0, badOpts = 0;
(function count(list) { for (const x of list) {
  if (['line', 'me', 'narr', 'msg'].includes(x.type)) lines++;
  if (x.type === 'choice') { choices++; x.options.forEach(o => { if (o.bad) badOpts++; count(o.then); }); }
  if (x.type === 'if') { count(x.then); count(x.else); }
} })(Object.keys(STORY).flatMap(id => conv(STORY[id])));

const scenes = Object.keys(STORY).map(id => ({ id, label: label(id, STORY[id]), group: group(id), body: conv(STORY[id]) }));
const cast = Object.fromEntries(Object.entries(CAST).map(([k, c]) => [k, { name: c.name, short: c.short, color: c.color, tint: c.tint, role: c.role, age: c.age }]));
process.stdout.write(JSON.stringify({ cast, scenes, endings: ENDINGS, stats: { scenes: scenes.length, lines, choices, badOpts, endings: ENDINGS.length } }));
