/* Arena Clawd: keadaan, statistik, askar, sasaran, cedera */
'use strict';
/* ---------- keadaan ---------- */
var cv = document.getElementById('cv'), mctx = cv.getContext('2d'), DPR = Math.min(2, window.devicePixelRatio || 1), CW = 800, CH = 500;
function resize() { var r = cv.getBoundingClientRect(); if (!r.width) return; CW = r.width; CH = r.height; cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR); }
window.addEventListener('resize', resize);
var diff = 'mudah', pickHero = 'pahlawan', pickSpell = 'kilas', pickBakat = 'perkasa', pickLawan = 'santai', G = null, best = 0;
try { best = +localStorage.getItem('arena-best') || 0; } catch (e) {}
var time = 0, shake = 0;

function newGame() {
  G = { state: 'main', t: 0, units: [], structs: [], proj: [], fx: [], floats: [], waveT: 3, waveN: 0, queue: [], qT: 50, kills: 0, towers: 0, correct: 0, asked: 0, buffs: {}, bossShieldMsg: false, deaths: 0, alarmT: 0, gold: 300, items: [], banner: null, recent: [], monsKilled: 0, rk: 0, feed: [], misi: {}, misiT: 1, nagaKills: 0 };
  TURRETS.forEach(function (d) { var hp = d.team ? (d.tier === 2 ? 2600 : 1900) : 2400; G.structs.push({ kind: 'turret', team: d.team, tier: d.tier, lane: d.lane, x: d.p[0], y: d.p[1], r: 34, hp: hp, max: hp, range: 300, cdT: 0, target: null, hitT: 0 }); });
  G.structs.push({ kind: 'core', team: 0, x: BASE0.x + 20, y: BASE0.y - 20, r: 46, hp: 4500, max: 4500, range: 320, cdT: 0, target: null, hitT: 0 });
  G.boss = { kind: 'boss', team: 1, x: BASE1.x - 100, y: BASE1.y + 120, r: 66, hp: 7000, max: 7000, range: 340, atkT: 2, slamT: 4, sumT: 10, tele: 0, hitT: 0, spd: 0, stunT: 0, slowT: 0 };
  G.units.push(G.boss);
  CAMPS.forEach(function (c, i) { var M = MON[c.t]; G.units.push({ kind: 'monster', type: c.t, team: 2, x: c.x, y: c.y, hx: c.x, hy: c.y, r: M.r, hp: M.first ? 0 : M.hp, max: M.hp, dead: !!M.first, respT: M.first || 0, aggro: false, atkT: 1, hitT: 0, i: i, stunT: 0, slowT: 0, tele: 0 }); });
  var H = HEROES[pickHero];
  G.bakat = pickBakat; G.lawan = pickLawan;
  G.hero = { kind: 'hero', id: pickHero, team: 0, x: 330, y: 1680, r: 22, lvl: 1, xp: 0, hp: H.hp, max: H.hp, face: 1, atkT: 0, atkAnim: 0, cd: [0, 0, 0], sl: [1, 1, 0], pts: 0, spellCd: 0, dead: false, respT: 0, hitT: 0, moving: false, shield: 0, emp: 0, dash: null, leap: null, recall: 0, regenT: 0, stunT: 0, slowT: 0, invis: 0, cc: 0 };
  G.units.push(G.hero);
  if (pickLawan !== 'tiada') spawnRival();
  G.input = { x: 0, y: 0, atk: false };
  calc(); G.hero.hp = G.hero.max;
  resize();
}
/* ---------- statistik Clawd ---------- */
function calc() {
  var h = G.hero, H = HEROES[h.id], ratio = h.max ? h.hp / h.max : 1, st = { atk: 0, hp: 0, spd: 0, cdr: 0, sp: 0, dr: 0, ls: 0, as: 0, crit: 0, duri: 0, ais: 0, mahkota: 0 };
  G.items.forEach(function (id) { var it = ITEMS.filter(function (x) { return x.id === id; })[0]; for (var k in st) if (it[k]) st[k] += it[k]; });
  var bk = G.bakat;
  h.atk = (H.atk + (h.lvl - 1) * H.atkL + st.atk) * (bk === 'perkasa' ? 1.08 : 1);
  h.max = (H.hp + (h.lvl - 1) * H.hpL + st.hp) * (bk === 'tabah' ? 1.1 : 1) * (st.mahkota ? 1.1 : 1); h.hp = Math.min(h.max, Math.max(1, ratio * h.max));
  h.spd = H.spd + st.spd; h.cdr = st.cdr; h.sp = (H.sp || 1) * (1 + st.sp) * (bk === 'perkasa' ? 1.08 : 1); h.dr = st.dr; h.ls = st.ls; h.as = st.as; h.crit = st.crit; h.duri = st.duri; h.ais = st.ais; h.mahkota = st.mahkota;
}
function atkPower() { var h = G.hero; return h.atk * (G.buffs.kuasa > 0 ? 1.4 : 1) * (G.buffs.merah > 0 ? 1.1 : 1); }
function cdMult() { var h = G.hero; return Math.max(0.4, 1 - h.cdr - (G.buffs.biru > 0 ? 0.25 : 0)); }
function skillCd(n) { return HEROES[G.hero.id].sk[n].cd * cdMult() * (1 - 0.06 * (G.hero.sl[n] - 1)); }
function skillDmg(base, ratio, n) { var h = G.hero; return (base + atkPower() * ratio) * (1 + 0.22 * (h.sl[n] - 1)) * h.sp; }

/* ---------- askar ---------- */
function spawnWave() {
  G.waveN++; var sc = 1 + G.waveN * 0.05;
  LANE_IDS.forEach(function (k, li) { for (var j = 0; j < 4; j++) [0, 1].forEach(function (team) { G.queue.push({ at: G.t + j * 0.7 + li * 0.1, lane: k, team: team, ranged: j === 3, sc: team ? sc : 1 + G.waveN * 0.035 }); }); });
}
function spawnMinion(s) {
  var path = s.team ? LANES[s.lane].slice().reverse() : LANES[s.lane].slice(), p0 = path[0], p1 = path[1], dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.hypot(dx, dy), hp = (s.ranged ? 190 : 280) * s.sc;
  G.units.push({ kind: 'minion', team: s.team, ranged: s.ranged, x: p0[0] + dx / d * 150 + (Math.random() - 0.5) * 30, y: p0[1] + dy / d * 150 + (Math.random() - 0.5) * 30, r: 15, hp: hp, max: hp, dmg: (s.ranged ? 24 : 18) * s.sc, range: s.ranged ? 210 : 52, spd: 105, path: path, wi: 1, atkT: Math.random(), scanT: 0, target: null, hitT: 0, i: Math.floor(Math.random() * 9), face: 1, lane: s.lane, stunT: 0, slowT: 0, burnT: 0 });
}

/* ---------- sasaran ---------- */
function alive(e) { return e && e.hp > 0 && !e.dead; }
function nearHero(e, R) { var h = G && G.hero; return h && !h.dead && Math.hypot(e.x - h.x, e.y - h.y) < R; }
function laneCleared() { return LANE_IDS.some(function (k) { return G.structs.filter(function (s) { return s.kind === 'turret' && s.team === 1 && s.lane === k && s.hp > 0; }).length === 0; }); }
function shielded(e) {
  if (e.kind === 'turret' && e.team === 1 && e.tier === 2) return G.structs.some(function (s) { return s.kind === 'turret' && s.team === 1 && s.lane === e.lane && s.tier === 1 && s.hp > 0; });
  if (e.kind === 'boss') return !laneCleared();
  if (e.kind === 'core') return G.structs.every(function (s) { return s.kind !== 'turret' || s.team !== 0 || s.hp > 0; });
  return false;
}
function findTarget(me, R, unitsOnly) {
  var best = null, bd = R, neutralOk = me.kind === 'hero';
  G.units.forEach(function (u) { if (u.team === me.team || !alive(u) || (u.team === 2 && !neutralOk) || hidden(u, me)) return; var d = Math.hypot(u.x - me.x, u.y - me.y) - u.r; if (d < bd) { bd = d; best = u; } });
  if (best || unitsOnly) return best;
  G.structs.forEach(function (s) { if (s.team === me.team || s.hp <= 0) return; var d = Math.hypot(s.x - me.x, s.y - me.y) - s.r; if (d < bd) { bd = d; best = s; } });
  return best;
}
function hidden(u, me) { return u.kind === 'hero' && u.invis > 0 && Math.hypot(u.x - me.x, u.y - me.y) > 70; }
function enemiesOf(team) { return G.units.concat(G.structs).filter(function (u) { return alive(u) && u.team !== team && !(team === 1 && u.team === 2); }); }
function hurt(t, dmg, src, opt) {
  if (!alive(t) || G.state === 'menang' || G.state === 'kalah') return;
  if (t.kind === 'hero' && (t.leap || t.dance)) return;
  if (shielded(t)) { if (Math.random() < 0.15) floatText(t.x, t.y - t.r - 20, 'Perisai!', '#6b7fb0'); return; }
  var h = G.hero;
  if (t.kind === 'monster' && src === h && G.bakat === 'pemburu') dmg *= 1.25;
  if (t === h) {
    if (opt && (opt.stun || opt.slow) && G.buffs.bersih > 0) opt = { skill: opt.skill };
    if (h.duri > 0 && src && src !== h && alive(src) && (src.kind === 'minion' || src.kind === 'rival' || src.kind === 'monster')) { var rf = dmg * h.duri; src.hp -= rf; src.hitT = 0.1; if (src.hp <= 0) die(src, h); }
    dmg *= (1 - h.dr) * (G.buffs.perisai > 0 ? 0.5 : 1) * (G.buffs.kebal > 0 ? 0.7 : 1);
    if (h.shield > 0) { var ab = Math.min(h.shield, dmg); h.shield -= ab; dmg -= ab; if (dmg <= 0) return; }
    h.recall = 0;
  }
  t.hp -= dmg; t.hitT = 0.15;
  if (src === h && h.ls > 0) h.hp = Math.min(h.max, h.hp + dmg * h.ls);
  if (t.kind === 'monster' && src === h) t.aggro = true;
  if (t.kind === 'rival') t.lastHit = src;
  if (src === h || t === h || t.kind !== 'minion') floatText(t.x + (Math.random() - 0.5) * 16, t.y - t.r - 14, Math.round(dmg), t.team === 0 ? '#d9534a' : (src === h ? (opt && opt.skill ? '#7a4a9a' : GOLD) : INK), src === h && dmg > 150);
  if (t === h) { sfx('hurt', 400); if (h.hp < h.max * 0.3 && G.alarmT <= 0) { G.alarmT = 9; toast('Nyawa rendah! Tekan butang Balik, atau buru Kelomang di sungai.'); } }
  if (opt && opt.stun) t.stunT = Math.max(t.stunT || 0, opt.stun);
  if (opt && opt.slow) t.slowT = Math.max(t.slowT || 0, opt.slow);
  if (src === h && G.buffs.merah > 0 && t.kind !== 'turret' && t.kind !== 'core') { t.burnT = 3; t.slowT = Math.max(t.slowT || 0, 0.8); }
  if (t.hp <= 0) die(t, src);
}
function die(t, src) {
  var h = G.hero;
  if (t.kind === 'minion') {
    burst(t.x, t.y, 8, t.team ? 'ink' : 'paper');
    if (t.team === 1 && !h.dead && Math.hypot(t.x - h.x, t.y - h.y) < 700) {
      gainXp(src === h ? 34 : 22); gainGold(src === h ? 28 : 12, t.x, t.y, src === h);
      if (src === h) { G.kills++; sfx('pop', 60); G.recent.push(G.t); G.recent = G.recent.filter(function (x) { return G.t - x < 2.5; }); if (G.recent.length === 3) banner('Tiga Sekaligus!'); else if (G.recent.length === 5) banner('Ganas! Lima minion!'); }
    }
  } else if (t.kind === 'monster') {
    var M = MON[t.type]; t.dead = true; t.respT = M.resp; t.aggro = false; G.monsKilled++;
    burst(t.x, t.y, 18, 'star'); sfx('boom'); gainXp(M.xp); gainGold(Math.round(M.gold * (G.bakat === 'pemburu' ? 1.4 : 1)), t.x, t.y, true);
    if (t.type === 'kelomang') { h.hp = Math.min(h.max, h.hp + h.max * 0.35); G.buffs.laju = Math.max(G.buffs.laju || 0, 8); sfx('heal'); toast('Kelomang beri tenaga: nyawa +35% dan lari laju!'); }
    else if (t.type === 'merah') { G.buffs.merah = 70; banner('Buff Merah! Serangan membakar'); }
    else if (t.type === 'biru') { G.buffs.biru = 70; banner('Buff Biru! Skill cepat sedia'); }
    else if (t.type === 'penyu') { h.shield = h.max * 0.4; G.buffs.penyu = 30; banner('Penyu Dakwat tumbang! Perisai + syiling'); }
    else if (t.type === 'naga') { G.nagaKills++; spawnNagaKawan(); banner('Naga Tinta tunduk! Dia bantu tolak lorong tengah'); pushFeed('Clawd tundukkan Naga Tinta', CL); }
  } else if (t.kind === 'turret') {
    sfx('boom'); shake = 0.9; burst(t.x, t.y, 34, 'smoke'); burst(t.x, t.y, 24, 'chip');
    if (t.team === 1) { G.towers++; gainXp(160); gainGold(220, t.x, t.y, true); banner('Menara musuh runtuh! (' + G.towers + '/6)');
      if (laneCleared() && !G.bossShieldMsg) { G.bossShieldMsg = true; setTimeout(function () { toast('Perisai Raja Comot pecah! Serang dia di istana kanan atas.'); }, 1600); }
    } else toast('Alamak, menara kita runtuh! Pertahankan pangkalan.');
  } else if (t.kind === 'core') lose();
  else if (t.kind === 'boss') { burst(t.x, t.y, 60, 'ink'); burst(t.x, t.y, 30, 'star'); sfx('boom'); shake = 1.4; win(); }
  else if (t.kind === 'hero') { if (src && src.kind === 'rival') { pushFeed('Pendekar Comot tumbangkan Clawd', RIVAL); src.kills = (src.kills || 0) + 1; } heroDown(); }
  else if (t.kind === 'rival') rivalDown(t, src);
  else if (t.kind === 'mini') burst(t.x, t.y, 10, 'chip');
}
function gainXp(n) {
  var h = G.hero; if (h.lvl >= 15) return;
  h.xp += n; var need = 90 + h.lvl * 60;
  while (h.xp >= need && h.lvl < 15) {
    h.xp -= need; h.lvl++; need = 90 + h.lvl * 60; calc(); h.hp = Math.min(h.max, h.hp + 200);
    sfx('lvl'); floatText(h.x, h.y - 80, 'Tahap ' + h.lvl + '!', GOLD, true); G.fx.push({ kind: 'pillar', x: h.x, y: h.y, t: 0 });
    if (h.lvl === 4 && h.sl[2] === 0) { h.sl[2] = 1; banner('Ultimate terbuka! ' + HEROES[h.id].sk[2].n); }
    else { h.pts++; if (h.pts === 1) toast('Tekan + kuning atas skill untuk kuatkannya.'); }
  }
}
function gainGold(n, x, y, show) { G.gold += n; if (show) { floatText(x + 20, y - 40, '+' + n + ' syiling', '#a87516'); sfx('coin', 90); } }
var bannerQ = [];
function banner(s) { G.banner = { s: s, t: 0 }; }

function pushFeed(s, col) { G.feed.push({ s: s, col: col || INK, t: 0 }); if (G.feed.length > 3) G.feed.shift(); }
/* naga sekutu menolak lorong tengah */
function spawnNagaKawan() {
  var path = LANES.tengah.slice(), x = 815, y = 815, hp = 3200 + G.t * 2;
  G.units.push({ kind: 'minion', naga: true, team: 0, ranged: false, x: x, y: y, r: 30, hp: hp, max: hp, dmg: 110, range: 80, spd: 95, path: [[x, y], [1000, 1000]].concat([path[1]]), wi: 1, atkT: 0, scanT: 0, target: null, hitT: 0, i: 4, face: 1, lane: 'tengah', stunT: 0, slowT: 0, burnT: 0 });
}
