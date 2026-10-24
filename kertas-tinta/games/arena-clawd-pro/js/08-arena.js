/* Arena Clawd Pro: Keadaan pertandingan, statistik, minion, sasaran, skill, kemas kini */
'use strict';

/* ---------- keadaan ---------- */
var cv = document.getElementById('cv'), mctx = cv.getContext('2d'), DPR = Math.min(2, window.devicePixelRatio || 1), CW = 800, CH = 500;
function resize() { var r = cv.getBoundingClientRect(); if (!r.width) return; CW = r.width; CH = r.height; cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR); }
window.addEventListener('resize', resize);
var SET = { hero: 'pahlawan', spell: 'kilas', mode: 'satu', topik: 'campur', diff: 'mudah' };
try { var ss = JSON.parse(localStorage.getItem('arena-pro-set') || 'null'); if (ss) Object.keys(SET).forEach(function (k) { if (ss[k]) SET[k] = ss[k]; }); } catch (e) {}
if (!HEROES[SET.hero]) SET.hero = 'pahlawan'; if (!SPELLS[SET.spell]) SET.spell = 'kilas'; if (!MODES[SET.mode]) SET.mode = 'satu'; if (TOPICS.indexOf(SET.topik) < 0) SET.topik = 'campur'; if (DIFFS.indexOf(SET.diff) < 0) SET.diff = 'mudah';
function saveSet() { try { localStorage.setItem('arena-pro-set', JSON.stringify(SET)); } catch (e) {} }
var G = null, time = 0, shake = 0;

function newGame() {
  buildMap(SET.mode);
  G = { state: 'main', t: 0, units: [], structs: [], proj: [], fx: [], floats: [], waveT: 3, waveN: 0, queue: [], qT: 55, kills: 0, towers: 0, towerTotal: 0, correct: 0, asked: 0, buffs: {}, deaths: 0, alarmT: 0, gold: 300, items: [], banner: null, recent: [], monsKilled: 0, combo: 0, comboMax: 0, combos: 0, gempurCd: 8, gempurHit: 0, log: [], coreMsg: false, dmg: 0, taken: 0, emblem: AKUN.emblem, skin: heroSkin(SET.hero), build: AKUN.build[SET.hero].slice(), mode: SET.mode };
  MODES[mode].turrets.forEach(function (d) { var hp = d.team ? [0, 1900, 2600, 3000][d.tier] : [0, 2400, 2800, 3200][d.tier]; G.structs.push({ kind: 'turret', team: d.team, tier: d.tier, lane: d.lane, x: d.p[0], y: d.p[1], r: 34, hp: hp, max: hp, range: 300, cdT: 0, target: null, hitT: 0 }); if (d.team) G.towerTotal++; });
  G.structs.push({ kind: 'core', team: 0, x: BASE0.x + 20, y: BASE0.y - 20, r: 46, hp: 4500, max: 4500, range: 320, cdT: 0, target: null, hitT: 0 });
  G.core1 = { kind: 'core', team: 1, x: BASE1.x - 20, y: BASE1.y + 20, r: 50, hp: 6000, max: 6000, range: 330, cdT: 0, target: null, hitT: 0 };
  G.structs.push(G.core1);
  CAMPS.forEach(function (c, i) { var M = MON[c.t]; G.units.push({ kind: 'monster', type: c.t, team: 2, x: c.x, y: c.y, hx: c.x, hy: c.y, r: M.r, hp: M.first ? 0 : M.hp, max: M.hp, dead: !!M.first, respT: M.first || 0, aggro: false, atkT: 1, hitT: 0, i: i, stunT: 0, slowT: 0, tele: 0 }); });
  var H = HEROES[SET.hero];
  G.hero = { kind: 'hero', id: SET.hero, team: 0, x: SPAWN.x, y: SPAWN.y, r: 22, lvl: 1, xp: 0, hp: H.hp, max: H.hp, face: 1, atkT: 0, atkAnim: 0, cd: [0, 0, 0], sl: [1, 1, 0], pts: 0, spellCd: 0, dead: false, respT: 0, hitT: 0, moving: false, shield: 0, emp: 0, dash: null, leap: null, dance: 0, recall: 0, lastAtk: -9, inBush: false };
  G.units.push(G.hero);
  G.input = { x: 0, y: 0, atk: false };
  calc(); G.hero.hp = G.hero.max;
  resize();
}
/* ---------- statistik Clawd ---------- */
function calc() {
  var h = G.hero, H = HEROES[h.id], ratio = h.max ? h.hp / h.max : 1, st = { atk: 0, hp: 0, spd: 0, cdr: 0, sp: 0, dr: 0, ls: 0, as: 0 };
  G.items.forEach(function (id) { var it = itemById(id); for (var k in st) if (it[k]) st[k] += it[k]; });
  var em = EMBLEM[G.emblem]; if (em) for (var ek in st) if (em[ek]) st[ek] += em[ek];
  h.atk = H.atk + (h.lvl - 1) * H.atkL + st.atk;
  h.max = H.hp + (h.lvl - 1) * H.hpL + st.hp; h.hp = Math.min(h.max, Math.max(1, ratio * h.max));
  h.spd = H.spd + st.spd; h.cdr = st.cdr; h.sp = (H.sp || 1) * (1 + st.sp); h.dr = st.dr; h.ls = st.ls; h.as = st.as;
}
var skMult = 1;
function atkPower() { var h = G.hero; return h.atk * (G.buffs.kuasa > 0 ? 1.4 : 1) * (G.buffs.merah > 0 ? 1.1 : 1); }
function cdMult() { var h = G.hero; return Math.max(0.4, 1 - h.cdr - (G.buffs.biru > 0 ? 0.25 : 0)); }
function skillCd(n) { return HEROES[G.hero.id].sk[n].cd * cdMult() * (1 - 0.06 * (G.hero.sl[n] - 1)); }
function skillDmg(base, ratio, n) { var h = G.hero; return (base + atkPower() * ratio) * (1 + 0.22 * (h.sl[n] - 1)) * h.sp * skMult; }
function qTier() { return Math.min(2, Math.floor((G.hero.lvl - 1) / 5)); }

/* ---------- minion: dekat, jauh, meriam, super ---------- */
function spawnWave() {
  G.waveN++; var sc1 = 1 + G.waveN * 0.05, sc0 = 1 + G.waveN * 0.035, siege = G.waveN % 3 === 0;
  LANE_IDS.forEach(function (k, li) {
    [0, 1].forEach(function (team) {
      var list = ['dekat', 'dekat', 'dekat', 'jauh']; if (siege) list.push('meriam');
      list.forEach(function (ty, j) { G.queue.push({ at: G.t + j * 0.7 + li * 0.1, lane: k, team: team, ty: ty, sc: team ? sc1 : sc0 }); });
    });
  });
}
var MTYPE = { dekat: { hp: 280, dmg: 18, range: 52, spd: 105, r: 15, cd: 1.0 }, jauh: { hp: 190, dmg: 24, range: 210, spd: 105, r: 15, cd: 1.3 }, meriam: { hp: 520, dmg: 30, range: 240, spd: 85, r: 18, cd: 1.8 }, super: { hp: 900, dmg: 45, range: 60, spd: 110, r: 20, cd: 0.9 } };
function spawnMinion(s) {
  var M = MTYPE[s.ty], path = s.team ? LANES[s.lane].slice().reverse() : LANES[s.lane].slice(), x, y, wi = 1;
  if (s.at0) { x = s.at0[0]; y = s.at0[1]; wi = s.wi; }
  else { var p0 = path[0], p1 = path[1], dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.hypot(dx, dy); x = p0[0] + dx / d * 150 + (Math.random() - 0.5) * 30; y = p0[1] + dy / d * 150 + (Math.random() - 0.5) * 30; }
  var hp = M.hp * s.sc;
  G.units.push({ kind: 'minion', mt: s.ty, team: s.team, ranged: s.ty === 'jauh' || s.ty === 'meriam', x: x, y: y, r: M.r, hp: hp, max: hp, dmg: M.dmg * s.sc, range: M.range, spd: M.spd, acd: M.cd, path: path, wi: wi, atkT: Math.random(), scanT: 0, target: null, hitT: 0, i: Math.floor(Math.random() * 9), face: s.team ? -1 : 1, lane: s.lane, stunT: 0, slowT: 0, burnT: 0, bubT: 0 });
}
function spawnAtHero(ty, n, sc) {
  var h = G.hero, nl = nearestLane(h.x, h.y);
  for (var i = 0; i < n; i++) spawnMinion({ team: 0, ty: ty, lane: nl.lane, sc: sc, at0: [h.x + (i - (n - 1) / 2) * 34, h.y + 30], wi: nl.wi });
}
function spawnAtBase(ty, sc) { LANE_IDS.forEach(function (k) { spawnMinion({ team: 0, ty: ty, lane: k, sc: sc }); }); }

/* ---------- sasaran ---------- */
function alive(e) { return e && e.hp > 0 && !e.dead; }
function nearHero(e, R) { var h = G && G.hero; return h && !h.dead && Math.hypot(e.x - h.x, e.y - h.y) < R; }
function heroHidden() { var h = G.hero; return !h.dead && (h.dance > 0 || (h.inBush && G.t - h.lastAtk > 1.2)); }
function laneClearedOf(team) { return LANE_IDS.some(function (k) { return !G.structs.some(function (s) { return s.kind === 'turret' && s.team === team && s.lane === k && s.tier < 3 && s.hp > 0; }); }); }
/* rantai perisai: tier 2 ← tier 1 lorong sama; tier 3 ← satu lorong bersih; inti ← tier 3 */
function shielded(e) {
  if (e.kind === 'turret') {
    if (e.tier === 2) return G.structs.some(function (s) { return s.kind === 'turret' && s.team === e.team && s.lane === e.lane && s.tier === 1 && s.hp > 0; });
    if (e.tier === 3) return !laneClearedOf(e.team);
    return false;
  }
  if (e.kind === 'core') return G.structs.some(function (s) { return s.kind === 'turret' && s.team === e.team && s.tier === 3 && s.hp > 0; });
  return false;
}
function findTarget(me, R, unitsOnly) {
  var best = null, bd = R, neutralOk = me.kind === 'hero';
  G.units.forEach(function (u) { if (u.team === me.team || !alive(u) || (u.team === 2 && !neutralOk)) return; if (u.kind === 'hero' && heroHidden()) return; var d = Math.hypot(u.x - me.x, u.y - me.y) - u.r; if (d < bd) { bd = d; best = u; } });
  if (best || unitsOnly) return best;
  G.structs.forEach(function (s) { if (s.team === me.team || s.hp <= 0) return; var d = Math.hypot(s.x - me.x, s.y - me.y) - s.r; if (d < bd) { bd = d; best = s; } });
  return best;
}
function enemiesOf(team) { return G.units.concat(G.structs).filter(function (u) { return alive(u) && u.team !== team && !(team === 1 && u.team === 2); }); }
function hurt(t, dmg, src, opt) {
  if (!alive(t) || G.state === 'menang' || G.state === 'kalah') return;
  var h = G.hero;
  if (t === h && (h.leap || h.dance > 0 || h.mochi > 0)) return;
  if (shielded(t)) { if (Math.random() < 0.15) floatText(t.x, t.y - t.r - 20, L('Terlindung!', 'Dilindungi!'), '#6b7fb0'); return; }
  if (t === h) {
    dmg *= (1 - h.dr) * (G.buffs.perisai > 0 ? 0.5 : 1) * (G.buffs.kebal > 0 ? 0.7 : 1) * (G.buffs.tembok > 0 ? 0.5 : 1);
    if (h.shield > 0) { var ab = Math.min(h.shield, dmg); h.shield -= ab; dmg -= ab; if (dmg <= 0) return; }
    h.recall = 0;
  }
  if (t.bubT > 0) dmg *= 0.5;
  t.hp -= dmg; t.hitT = 0.15;
  if (src === h) G.dmg += dmg; else if (t === h) G.taken += dmg;
  if (src === h && h.ls > 0) h.hp = Math.min(h.max, h.hp + dmg * h.ls);
  if (t.kind === 'monster' && src === h) t.aggro = true;
  if (src === h || t === h || t.kind !== 'minion') floatText(t.x + (Math.random() - 0.5) * 16, t.y - t.r - 14, Math.round(dmg), t.team === 0 ? '#d9534a' : (src === h ? (opt && opt.skill ? '#7a4a9a' : GOLD) : INK), src === h && dmg > 150);
  if (t === h) { sfx('hurt', 400); if (h.hp < h.max * 0.3 && G.alarmT <= 0) { G.alarmT = 9; toast(L('Nyawa tinggal sedikit! Tekan Pulang, minum ramuan, atau sembunyi di semak.', 'Nyawa rendah! Tekan Balik, minum ramuan, atau sorok dalam semak.')); } }
  if (opt && opt.stun) t.stunT = Math.max(t.stunT || 0, opt.stun);
  if (opt && opt.slow) t.slowT = Math.max(t.slowT || 0, opt.slow);
  if (src === h && G.buffs.merah > 0 && t.kind !== 'turret' && t.kind !== 'core') { t.burnT = 3; t.slowT = Math.max(t.slowT || 0, 0.8); }
  if (t.hp <= 0) die(t, src);
}
function die(t, src) {
  var h = G.hero;
  if (t.kind === 'minion') {
    burst(t.x, t.y, t.mt === 'super' || t.mt === 'meriam' ? 14 : 8, t.team ? 'ink' : 'paper');
    if (t.team === 1 && !h.dead && Math.hypot(t.x - h.x, t.y - h.y) < 700) {
      var big = t.mt === 'meriam' ? 2 : 1;
      gainXp((src === h ? 34 : 22) * big); gainGold((src === h ? 28 : 12) * big, t.x, t.y, src === h);
      if (src === h) { G.kills++; sfx('pop', 60); G.recent.push(G.t); G.recent = G.recent.filter(function (x) { return G.t - x < 2.5; }); if (G.recent.length === 3) banner(L('Tiga Sekaligus!', 'Tiga Sekali Gus!')); else if (G.recent.length === 5) banner(L('Ganas! Lima minion!', 'Ganas! Lima minion!')); }
    }
  } else if (t.kind === 'monster') {
    var M = MON[t.type]; t.dead = true; t.respT = M.resp; t.aggro = false; G.monsKilled++;
    burst(t.x, t.y, 18, 'star'); sfx('boom'); gainXp(M.xp); gainGold(M.gold, t.x, t.y, true);
    if (t.type === 'kelomang') { h.hp = Math.min(h.max, h.hp + h.max * 0.35); G.buffs.laju = Math.max(G.buffs.laju || 0, 8); sfx('heal'); toast(L('Kelomang memberi tenaga: nyawa +35% dan lari cepat!', 'Kelomang beri tenaga: nyawa +35% dan lari laju!')); }
    else if (t.type === 'merah') { G.buffs.merah = 70; banner(L('Buff Merah! Serangan membakar', 'Buff Merah! Serangan membakar')); }
    else if (t.type === 'biru') { G.buffs.biru = 70; banner(L('Buff Biru! Skill cepat siap', 'Buff Biru! Skill cepat sedia')); }
    else if (t.type === 'penyu') { h.shield = h.max * 0.4; G.buffs.penyu = 30; spawnAtBase('super', 1 + G.waveN * 0.04); banner(L('Penyu Tinta kalah! Perisai + minion super', 'Penyu Dakwat tumpas! Perisai + minion super')); }
  } else if (t.kind === 'turret') {
    sfx('boom'); shake = 0.9; burst(t.x, t.y, 34, 'smoke'); burst(t.x, t.y, 24, 'chip');
    if (t.team === 1) {
      G.towers++; gainXp(160); gainGold(220, t.x, t.y, true); banner(L('Menara musuh roboh! (', 'Menara musuh runtuh! (') + G.towers + '/' + G.towerTotal + ')');
      if (!shielded(G.core1) && !G.coreMsg) { G.coreMsg = true; setTimeout(function () { if (G) toast(L('Perisai Inti Istana Comot pecah! Serang inti di kanan atas', 'Perisai Inti Istana Comot pecah! Serang inti di kanan atas')); }, 1600); }
    } else toast(L('Aduh, menara kita roboh! Pertahankan markas.', 'Alamak, menara kita runtuh! Pertahankan pangkalan.'));
  } else if (t.kind === 'core') {
    sfx('boom'); shake = 1.4; burst(t.x, t.y, 60, t.team ? 'ink' : 'paper'); burst(t.x, t.y, 30, 'star');
    if (t.team === 1) win(); else lose();
  } else if (t.kind === 'hero') heroDown();
}
function gainXp(n) {
  var h = G.hero; if (h.lvl >= 15) return;
  var t0 = qTier();
  h.xp += n; var need = 90 + h.lvl * 60;
  while (h.xp >= need && h.lvl < 15) {
    h.xp -= need; h.lvl++; need = 90 + h.lvl * 60; calc(); h.hp = Math.min(h.max, h.hp + 200);
    sfx('lvl'); floatText(h.x, h.y - 80, L('Level ', 'Tahap ') + h.lvl + '!', GOLD, true); G.fx.push({ kind: 'pillar', x: h.x, y: h.y, t: 0 });
    if (h.lvl === 4 && h.sl[2] === 0) { h.sl[2] = 1; banner(L('Ultimate terbuka! ', 'Ultimate terbuka! ') + tx(HEROES[h.id].sk[2].n)); }
    else { h.pts++; if (h.pts === 1) toast(L('Tekan + kuning di atas skill untuk memperkuatnya.', 'Tekan + kuning atas skill untuk kuatkannya.')); }
  }
  if (qTier() > t0) setTimeout(function () { if (G) toast(L('Soal naik tingkat! Sekarang lebih menantang', 'Soalan naik tahap! Kini lebih mencabar')); }, 2600);
}
function gainGold(n, x, y, show) { G.gold += n; if (show) { floatText(x + 20, y - 40, '+' + n, '#a87516'); sfx('coin', 90); } }
function banner(s) { G.banner = { s: s, t: 0 }; }

/* ---------- Clawd ---------- */
function heroDown() {
  var h = G.hero;
  if (h.id === 'nini' && !G.mochiPakai) { G.mochiPakai = true; h.hp = h.max * 0.25; h.mochi = 2; h.dash = h.leap = null; burst(h.x, h.y, 14, 'star'); banner(L('Hadiah Mochi! Nini selamat', 'Hadiah Mochi! Nini selamat')); sfx('heal'); return; } h.dead = true; h.hp = 0; G.deaths++; h.respT = 6 + h.lvl * 0.6; h.dash = h.leap = null; h.dance = 0; h.recall = 0;
  burst(h.x, h.y, 20, 'paper'); sfx('over');
  setTimeout(function () { if (G && G.state === 'main' && G.hero.dead && G.hero.respT > 1.5) ask('mati'); }, 900);
}
function respawn() { var h = G.hero; h.dead = false; h.hp = h.max; h.x = SPAWN.x; h.y = SPAWN.y; h.respT = 0; burst(h.x, h.y, 14, 'star'); toast(L('Clawd kembali beraksi!', 'Clawd kembali beraksi!')); }
function heroAttack() {
  var h = G.hero, H = HEROES[h.id]; if (h.dead || h.atkT > 0 || h.dash || h.leap) return false;
  var t = findTarget(h, H.range + 10); if (!t) return false;
  h.atkT = H.atkCd / (1 + h.as + (G.buffs.laju > 0 ? 0.25 : 0)); h.atkAnim = 0.2; h.face = t.x >= h.x ? 1 : -1; h.recall = 0; h.lastAtk = G.t;
  var dmg = atkPower() * (h.emp > 0 ? 1.6 : 1); if (h.emp > 0) h.emp--;
  if (H.melee) { hurt(t, dmg, h); G.fx.push({ kind: 'slash', x: t.x, y: t.y - 16, t: 0, a: Math.random() * 6, col: h.id === 'bayang' ? '#c9b8f0' : null }); sfx('slash', 80); }
  else { G.proj.push({ kind: h.id === 'pemanah' ? 'arrow' : h.id === 'penyembuh' ? 'heart' : 'orb', x: h.x + h.face * 18, y: h.y - 30, target: t, spd: 950, dmg: dmg, src: h, team: 0, emp: h.emp > 0 }); sfx('shot', 80); }
  return true;
}
function aimDir(range) {
  var h = G.hero, t = findTarget(h, range);
  if (t) { var d = Math.hypot(t.x - h.x, t.y - h.y) || 1; return { x: (t.x - h.x) / d, y: (t.y - h.y) / d, t: t, d: d }; }
  var mv = Math.hypot(G.input.x, G.input.y); if (mv > 0.1) return { x: G.input.x / mv, y: G.input.y / mv };
  return { x: 0.707 * h.face, y: -0.707 };
}
/* skill: ultimate (n=2) memunculkan soal Ultimate Matematika dulu */
function skill(n, direct) {
  var h = G && G.hero; if (!G || G.state !== 'main' || h.dead || h.cd[n] > 0 || h.dash || h.leap) return false;
  if (h.sl[n] === 0) { toast(L('Ultimate terbuka di Level 4.', 'Ultimate terbuka pada Tahap 4.')); return false; }
  if (n === 2 && !direct) { ask('ult'); return true; }
  return cast(n, 1);
}
function cast(n, mult) {
  var h = G.hero; skMult = mult || 1;
  h.cd[n] = skillCd(n); h.atkAnim = 0.3; h.recall = 0; h.lastAtk = G.t;
  var id = h.id, a, i, ok = true;
  if (n === 2) floatText(h.x, h.y - 80, tx(HEROES[id].sk[2].n) + (mult > 1 ? ' ×1,5!' : '!'), GOLD, true);
  if (id === 'pahlawan') {
    if (n === 0) { a = aimDir(420); h.face = a.x >= 0 ? 1 : -1; h.dash = { vx: a.x * 1300, vy: a.y * 1300, t: 0.2, hits: [], dmg: skillDmg(70, 1.2, 0), slow: 1.5 }; sfx('dash'); }
    else if (n === 1) { sfx('spin'); G.fx.push({ kind: 'spin', x: h.x, y: h.y, t: 0, r: 175, col: CL }); areaDmg(h.x, h.y - 10, 175, skillDmg(60, 1.1, 1), {}); h.hp = Math.min(h.max, h.hp + h.max * 0.09); G.buffs.kebal = 3; floatText(h.x, h.y - 70, '+' + Math.round(h.max * 0.09), '#3f6b22'); }
    else { a = aimDir(480); var lx = a.t ? a.t.x : h.x + a.x * 260, ly = a.t ? a.t.y : h.y + a.y * 260; h.leap = { x0: h.x, y0: h.y, x1: lx, y1: ly, t: 0, dur: 0.5, dmg: skillDmg(170, 2, 2) }; sfx('ult'); }
  } else if (id === 'perisai') {
    if (n === 0) { a = aimDir(260); h.face = a.x >= 0 ? 1 : -1; var px = h.x + a.x * 90, py = h.y + a.y * 90; G.fx.push({ kind: 'quake', x: px, y: py, t: 0, r: 150 }); areaDmg(px, py, 150, skillDmg(60, 1.0, 0), { stun: 0.8 }); sfx('slam'); shake = Math.max(shake, 0.3); }
    else if (n === 1) { h.shield = Math.max(h.shield, h.max * 0.3); G.buffs.tembok = 4; sfx('heal'); G.fx.push({ kind: 'wall', x: h.x, y: h.y, t: 0 }); floatText(h.x, h.y - 80, L('Ayo serang aku!', 'Mari serang aku!'), '#6f8440', true); }
    else { G.fx.push({ kind: 'ring', x: h.x, y: h.y, t: 0, r: 270 }); G.fx.push({ kind: 'quake', x: h.x, y: h.y, t: 0, r: 270 }); areaDmg(h.x, h.y, 270, skillDmg(150, 1.6, 2), { stun: 1.6 }); h.shield = Math.max(h.shield, h.max * 0.25); sfx('slam'); shake = 1; }
  } else if (id === 'pemanah') {
    if (n === 0) { a = aimDir(700); h.face = a.x >= 0 ? 1 : -1; G.proj.push({ kind: 'bigarrow', x: h.x, y: h.y - 26, vx: a.x * 1000, vy: a.y * 1000, life: 0.75, dmg: skillDmg(85, 1.3, 0), src: h, team: 0, hits: [], r: 26 }); sfx('dash'); }
    else if (n === 1) { var mv = Math.hypot(G.input.x, G.input.y), dx, dy; if (mv > 0.1) { dx = G.input.x / mv; dy = G.input.y / mv; } else { var e = findTarget(h, 400); if (e) { var dd = Math.hypot(h.x - e.x, h.y - e.y) || 1; dx = (h.x - e.x) / dd; dy = (h.y - e.y) / dd; } else { dx = -h.face; dy = 0; } } h.dash = { vx: dx * 1000, vy: dy * 1000, t: 0.18, hits: null }; h.emp = 3; sfx('dash'); G.fx.push({ kind: 'wind', x: h.x, y: h.y, t: 0 }); }
    else { a = aimDir(620); var cx = a.t ? a.t.x : h.x + a.x * 280, cy = a.t ? a.t.y : h.y + a.y * 280; for (i = 0; i < 8; i++) G.fx.push({ kind: 'volley', x: cx, y: cy, t: -i * 0.25, r: 200, dmg: skillDmg(36, 0.5, 2), done: false }); sfx('ult'); }
  } else if (id === 'sihir') {
    if (n === 0) { a = aimDir(650); h.face = a.x >= 0 ? 1 : -1; G.proj.push({ kind: 'starball', x: h.x, y: h.y - 30, vx: a.x * 650, vy: a.y * 650, life: 0.95, dmg: skillDmg(100, 1.6, 0), src: h, team: 0 }); sfx('dash'); }
    else if (n === 1) {
      var first = findTarget(h, 400); if (!first) { h.cd[1] = 0.5; toast(L('Tidak ada musuh dekat untuk Rantai Petir.', 'Tiada musuh dekat untuk Rantai Kilat.')); ok = false; }
      else { var chain = [first], cur = first; for (i = 0; i < 3; i++) { var nx = null, nd = 230; enemiesOf(0).forEach(function (u) { if (chain.indexOf(u) >= 0 || u.kind === 'turret' || u.kind === 'core') return; var d = Math.hypot(u.x - cur.x, u.y - cur.y); if (d < nd) { nd = d; nx = u; } }); if (!nx) break; chain.push(nx); cur = nx; }
        var pts = [[h.x, h.y - 40]], cd2 = skillDmg(75, 1.2, 1); chain.forEach(function (u) { pts.push([u.x, u.y - 16]); hurt(u, cd2, h, { stun: 0.7, skill: true }); }); G.fx.push({ kind: 'bolt', pts: pts, t: 0 }); sfx('thunder'); }
    }
    else { a = aimDir(620); var sx = a.t ? a.t.x : h.x + a.x * 260, sy = a.t ? a.t.y : h.y + a.y * 260; for (i = 0; i < 8; i++) G.fx.push({ kind: 'star', x: sx + (Math.random() - 0.5) * 240, y: sy + (Math.random() - 0.5) * 170, t: -i * 0.15, r: 115, dmg: skillDmg(110, 1.3, 2), done: false }); sfx('ult'); shake = 0.4; }
  } else if (id === 'bayang') {
    if (n === 0) {
      var tg = findTarget(h, 420, true);
      if (tg) { var tdx = tg.x - h.x, tdy = tg.y - h.y, tdd = Math.hypot(tdx, tdy) || 1; h.face = tdx >= 0 ? 1 : -1; h.dash = { vx: tdx / tdd * 1500, vy: tdy / tdd * 1500, t: Math.max(0.06, (tdd - 34) / 1500), hits: [], dmg: skillDmg(80, 1.3, 0), target: tg }; }
      else { a = aimDir(0); h.dash = { vx: a.x * 1500, vy: a.y * 1500, t: 0.16, hits: [], dmg: skillDmg(80, 1.3, 0) }; }
      sfx('dash');
    }
    else if (n === 1) {
      var st = findTarget(h, HEROES.bayang.range + 60); if (!st) { h.cd[1] = 0.5; toast(L('Dekati musuh dulu untuk Tusuk Kembar.', 'Dekati musuh dahulu untuk Tikam Kembar.')); ok = false; }
      else { var sd = skillDmg(55, 1.0, 1); h.face = st.x >= h.x ? 1 : -1; hurt(st, sd, h, { skill: true }); G.fx.push({ kind: 'slash', x: st.x, y: st.y - 16, t: 0, a: 0.4, col: '#c9b8f0' }); G.fx.push({ kind: 'stab', target: st, t: 0, dmg: sd, done: false }); sfx('slash'); }
    }
    else { h.dance = 1.6; h.danceT = 0; h.danceDmg = skillDmg(40, 0.55, 2); sfx('ult'); }
  } else if (id === 'nini') {
    if (n === 0) { a = aimDir(600); h.face = a.x >= 0 ? 1 : -1; G.proj.push({ kind: 'boom', x: h.x, y: h.y - 26, vx: a.x * 950, vy: a.y * 950, dist: 0, max: 440, t: 0, back: false, dmg: skillDmg(75, 1.1, 0), src: h, team: 0, hits: [] }); sfx('dash'); }
    else if (n === 1) { a = aimDir(520); var mx2 = a.t ? a.t.x : h.x + a.x * 260, my2 = a.t ? a.t.y : h.y + a.y * 260; G.fx.push({ kind: 'mochi', x0: h.x, y0: h.y - 30, x: mx2, y: my2, t: 0, dmg: skillDmg(70, 1.0, 1), done: false }); sfx('pop'); }
    else { a = aimDir(620); var wx = a.t ? a.t.x : h.x + a.x * 260, wy = a.t ? a.t.y : h.y + a.y * 260; for (i = 0; i < 3; i++) G.fx.push({ kind: 'mstorm', x: wx, y: wy, t: -i * 0.6, r: 170, last: i === 2, dmg: skillDmg(120, 1.2, 2), done: false }); sfx('ult'); }
  } else {
    if (n === 0) { var heal = h.max * 0.15; h.hp = Math.min(h.max, h.hp + heal); floatText(h.x, h.y - 70, '+' + Math.round(heal), '#3f6b22'); G.units.forEach(function (u) { if (u.kind === 'minion' && u.team === 0 && alive(u) && Math.hypot(u.x - h.x, u.y - h.y) < 320) { u.hp = Math.min(u.max, u.hp + u.max * 0.4); G.fx.push({ kind: 'plus', x: u.x, y: u.y - 20, t: 0 }); } }); areaDmg(h.x, h.y, 180, skillDmg(40, 0.6, 0), {}); G.fx.push({ kind: 'pillar', x: h.x, y: h.y, t: 0, col: '#f19bb4' }); sfx('heal'); }
    else if (n === 1) { var nb = 0; G.units.forEach(function (u) { if (u.kind === 'minion' && u.team === 0 && alive(u) && Math.hypot(u.x - h.x, u.y - h.y) < 350) { u.bubT = 6; nb++; } }); G.fx.push({ kind: 'ring', x: h.x, y: h.y, t: 0, r: 350, col: 'rgba(241,155,180,0.3)' }); sfx('heal'); if (!nb) toast(L('Tidak ada minion kawan dekat. Dekati pasukanmu dulu.', 'Tiada minion kawan dekat. Dekati pasukan kamu dahulu.')); }
    else { var cnt = mult >= 1.5 ? 5 : 3; spawnAtHero('super', cnt, 1 + 0.25 * (h.sl[2] - 1)); G.fx.push({ kind: 'pillar', x: h.x, y: h.y, t: 0, col: GOLD }); sfx('ult'); banner(L(cnt + ' minion super datang!', cnt + ' minion super tiba!')); }
  }
  skMult = 1;
  if (!ok) { h.cd[n] = Math.min(h.cd[n], 0.5); return false; }
  return true;
}
function areaDmg(x, y, R, dmg, opt) { enemiesOf(0).forEach(function (u) { if (Math.hypot(u.x - x, u.y - y) < R + u.r) hurt(u, dmg, G.hero, Object.assign({ skill: true }, opt || {})); }); }
function useSpell() {
  var h = G && G.hero; if (!G || G.state !== 'main' || h.dead || h.spellCd > 0) return false;
  var S = SPELLS[SET.spell]; h.spellCd = S.cd; h.recall = 0;
  if (SET.spell === 'kilas') { var a = aimDir(0), mv = Math.hypot(G.input.x, G.input.y); if (mv > 0.1) a = { x: G.input.x / mv, y: G.input.y / mv }; G.fx.push({ kind: 'blink', x: h.x, y: h.y, t: 0 }); h.x = Math.max(40, Math.min(WS - 40, h.x + a.x * 240)); h.y = Math.max(60, Math.min(WS - 30, h.y + a.y * 240)); G.fx.push({ kind: 'blink', x: h.x, y: h.y, t: 0 }); sfx('blink'); }
  else if (SET.spell === 'pulih') { h.hp = Math.min(h.max, h.hp + h.max * 0.3); sfx('heal'); G.fx.push({ kind: 'pillar', x: h.x, y: h.y, t: 0, col: '#6fa83c' }); floatText(h.x, h.y - 70, '+' + Math.round(h.max * 0.3), '#3f6b22', true); }
  else if (SET.spell === 'hukuman') { var t = null, bd = 260; G.units.forEach(function (u) { if (!alive(u) || u.team === 0) return; var d = Math.hypot(u.x - h.x, u.y - h.y); if (d < bd) { bd = d; t = u; } }); if (!t) { h.spellCd = 1; toast(L('Hukuman butuh monster atau minion di dekatmu.', 'Hukuman perlukan monster atau minion dekat.')); return false; } G.fx.push({ kind: 'bolt', pts: [[t.x, t.y - 240], [t.x + 10, t.y - 120], [t.x - 8, t.y - 60], [t.x, t.y - 10]], t: 0 }); hurt(t, t.kind === 'monster' ? 650 + h.lvl * 40 : 500, h, { skill: true }); sfx('thunder'); }
  else if (SET.spell === 'pecut') { G.buffs.pecut = 5; sfx('dash'); G.fx.push({ kind: 'wind', x: h.x, y: h.y, t: 0 }); }
  else { h.shield = Math.max(h.shield, h.max * 0.3); G.buffs.aegis = 4; sfx('heal'); }
  return true;
}
function upSkill(n) {
  var h = G.hero; if (!canUp(n)) { if (n === 2 && h.pts > 0 && h.sl[2] > 0 && h.sl[2] < 3) toast(L('Ultimate level ' + (h.sl[2] + 1) + ' butuh Clawd Level ' + 4 * (h.sl[2] + 1) + '.', 'Ultimate tahap ' + (h.sl[2] + 1) + ' perlukan Clawd Tahap ' + 4 * (h.sl[2] + 1) + '.')); return false; }
  h.pts--; h.sl[n]++; sfx('lvl'); floatText(h.x, h.y - 80, tx(HEROES[h.id].sk[n].n) + ' Lv ' + h.sl[n], '#7a4a9a', true); return true;
}
function canUp(n) { var h = G.hero; if (h.pts <= 0 || h.sl[n] === 0) return false; if (n === 2) return h.sl[2] < 3 && h.lvl >= 4 * (h.sl[2] + 1); return h.sl[n] < 5; }
/* Soal Gempur: target = menara/inti musuh terdekat yang tidak terlindung */
function gempurTarget() {
  var h = G.hero; if (h.dead) return null;
  var best = null, bd = 1e9;
  G.structs.forEach(function (s) { if (s.team !== 1 || s.hp <= 0 || shielded(s)) return; var d = Math.hypot(s.x - h.x, s.y - h.y); if (d < s.range + 130 && d < bd) { bd = d; best = s; } });
  return best;
}
function gempur() {
  if (!G || G.state !== 'main' || G.gempurCd > 0) return false;
  var t = gempurTarget(); if (!t) return false;
  ask('gempur', t); return true;
}
function comboBlast() {
  var h = G.hero; G.combos++; sfx('combo'); shake = 0.8; banner(L('LEDAKAN KOMBO! 3 benar beruntun', 'LETUPAN KOMBO! 3 betul berturut'));
  gainGold(150, h.x, h.y, true);
  if (!h.dead) { G.fx.push({ kind: 'explode', x: h.x, y: h.y, t: 0, r: 280 }); G.fx.push({ kind: 'ring', x: h.x, y: h.y, t: 0, r: 280 }); burst(h.x, h.y, 30, 'star'); var d = 220 + atkPower() * 2.2; enemiesOf(0).forEach(function (u) { if (u.kind !== 'core' && Math.hypot(u.x - h.x, u.y - h.y) < 280 + u.r) hurt(u, d, h, { skill: true }); }); }
}

/* ---------- kemas kini ---------- */
function update(dt) {
  time += dt; seed = Math.floor(time * 7);
  if (shake > 0) shake = Math.max(0, shake - dt * 2.4);
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) document.getElementById('toast').hidden = true; }
  if (!G) return;
  G.floats = G.floats.filter(function (f) { f.life -= dt; f.y -= 40 * dt; return f.life > 0; });
  if (G.banner) { G.banner.t += dt; if (G.banner.t > 2.4) G.banner = null; }
  G.fx = G.fx.filter(function (f) { return fxStep(f, dt); });
  if (G.state !== 'main') return;
  G.t += dt;
  var h = G.hero;
  G.waveT -= dt; if (G.waveT <= 0) { G.waveT = 28; spawnWave(); if (G.waveN === 1) toast(L('Minion sudah keluar! Ikuti mereka di lorong.', 'Minion sudah keluar! Ikut mereka ke lorong.')); if (G.waveN % 3 === 0) floatText(h.x, h.y - 90, L('Minion meriam datang!', 'Minion meriam tiba!'), '#4a4440', true); }
  var nMin = G.units.length;
  G.queue = G.queue.filter(function (s) { if (s.at <= G.t) { if (nMin < 170) { spawnMinion(s); nMin++; } return false; } return true; });
  if (G.gempurCd > 0) G.gempurCd -= dt;
  if (!h.dead) { G.qT -= dt; if (G.qT <= 0) { G.qT = 60 + Math.random() * 15; ask('kilat'); return; } }
  for (var b in G.buffs) if (G.buffs[b] > 0) G.buffs[b] -= dt;
  if (G.alarmT > 0) G.alarmT -= dt;
  G.gold += dt * 1.6;
  if (h.dead) { h.respT -= dt; if (h.respT <= 0) respawn(); }
  else heroStep(h, dt);
  G.units.forEach(function (u) {
    if (u.hitT > 0) u.hitT -= dt;
    if (u.bubT > 0) u.bubT -= dt;
    if (u.burnT > 0 && alive(u)) { u.burnT -= dt; if (Math.random() < dt * 3) { hurt(u, 6 + atkPower() * 0.05, h); G.fx.push({ kind: 'p', type: 'fire', x: u.x, y: u.y - 20, vx: 0, vy: -50, t: 0, life: 0.5, r: 3, rot: 0 }); } }
    if (u.slowT > 0) u.slowT -= dt;
    if (u.stunT > 0) { u.stunT -= dt; return; }
    if (u.kind === 'minion' && alive(u)) minionStep(u, dt);
    else if (u.kind === 'monster') monsterStep(u, dt);
  });
  separate();
  G.units = G.units.filter(function (u) { return u.kind !== 'minion' || u.hp > 0; });
  G.structs.forEach(function (s) { if (s.hitT > 0) s.hitT -= dt; if (s.hp > 0) turretStep(s, dt); });
  G.proj = G.proj.filter(function (p) { return projStep(p, dt); });
}
function heroStep(h, dt) {
  if (h.mochi > 0) h.mochi -= dt;
  for (var i = 0; i < 3; i++) if (h.cd[i] > 0) h.cd[i] = Math.max(0, h.cd[i] - dt);
  if (h.spellCd > 0) h.spellCd = Math.max(0, h.spellCd - dt);
  if (h.atkT > 0) h.atkT -= dt; if (h.atkAnim > 0) h.atkAnim -= dt;
  if (h.shield > 0 && !(G.buffs.aegis > 0) && !(G.buffs.penyu > 0) && !(G.buffs.tembok > 0)) h.shield = Math.max(0, h.shield - h.max * 0.05 * dt);
  h.hp = Math.min(h.max, h.hp + h.max * (G.buffs.biru > 0 ? 0.012 : 0.004) * dt);
  h.inBush = inBush(h.x, h.y);
  if (h.dance > 0) {
    h.dance -= dt; h.danceT -= dt;
    if (h.danceT <= 0) { h.danceT = 0.2; areaDmg(h.x, h.y, 230, h.danceDmg, {}); G.fx.push({ kind: 'slash', x: h.x + (Math.random() - 0.5) * 200, y: h.y - 16 + (Math.random() - 0.5) * 120, t: 0, a: Math.random() * 6, col: '#c9b8f0' }); sfx('slash', 60); }
    if (Math.random() < 0.6) G.fx.push({ kind: 'ghost', x: h.x + (Math.random() - 0.5) * 120, y: h.y + (Math.random() - 0.5) * 70, t: 0, face: Math.random() < 0.5 ? 1 : -1 });
  }
  if (h.leap) {
    var Lp = h.leap; Lp.t += dt; var k = Math.min(1, Lp.t / Lp.dur); h.x = Lp.x0 + (Lp.x1 - Lp.x0) * k; h.y = Lp.y0 + (Lp.y1 - Lp.y0) * k; h.z = Math.sin(k * Math.PI) * 120;
    if (k >= 1) { h.leap = null; h.z = 0; sfx('slam'); shake = 1; G.fx.push({ kind: 'quake', x: h.x, y: h.y, t: 0, r: 230 }); burst(h.x, h.y, 24, 'chip'); areaDmg(h.x, h.y, 230, Lp.dmg, { stun: 1.3 }); }
    return;
  }
  if (h.dash) {
    var D = h.dash; D.t -= dt; h.x += D.vx * dt; h.y += D.vy * dt; collide(h);
    G.fx.push({ kind: 'ghost', x: h.x, y: h.y, t: 0, face: h.face });
    if (D.hits) enemiesOf(0).forEach(function (u) { if (D.hits.indexOf(u) >= 0 || u.kind === 'turret' || u.kind === 'core') return; if (Math.hypot(u.x - h.x, u.y - h.y) < u.r + 50) { D.hits.push(u); hurt(u, D.dmg, h, { slow: D.slow, skill: true }); burst(u.x, u.y, 4, 'star'); } });
    if (D.t <= 0) {
      h.dash = null;
      if (D.target && D.hits.indexOf(D.target) < 0 && alive(D.target)) { D.hits.push(D.target); hurt(D.target, D.dmg, h, { skill: true }); }
      if (D.target && !alive(D.target)) { h.cd[0] = 0.3; floatText(h.x, h.y - 80, L('Siap lagi!', 'Sedia semula!'), '#5a4a88', true); }
    }
    return;
  }
  if (h.recall > 0) {
    if (Math.hypot(G.input.x, G.input.y) > 0.12 || G.input.atk) { h.recall = 0; toast(L('Pulang dibatalkan.', 'Balik dibatalkan.')); }
    else { h.recall += dt; if (h.recall >= 3) { h.recall = 0; G.fx.push({ kind: 'blink', x: h.x, y: h.y, t: 0 }); h.x = SPAWN.x; h.y = SPAWN.y; G.fx.push({ kind: 'blink', x: h.x, y: h.y, t: 0 }); sfx('blink'); } return; }
  }
  var ix = G.input.x, iy = G.input.y, m = Math.hypot(ix, iy);
  h.moving = m > 0.12;
  if (h.moving) {
    if (m > 1) { ix /= m; iy /= m; }
    var sp = h.spd * (G.buffs.laju > 0 ? 1.3 : 1) * (G.buffs.pecut > 0 ? 1.6 : 1);
    h.x += ix * sp * dt; h.y += iy * sp * dt; if (Math.abs(ix) > 0.2) h.face = ix > 0 ? 1 : -1;
    collide(h);
    if (G.buffs.pecut > 0 && Math.random() < 0.5) G.fx.push({ kind: 'ghost', x: h.x, y: h.y, t: 0, face: h.face });
  }
  /* di semak: tidak menyerang otomatis supaya tetap tersembunyi */
  if (G.input.atk || (!h.moving && !h.inBush)) heroAttack();
  if (Math.hypot(h.x - BASE0.x, h.y - BASE0.y) < 250 && h.hp < h.max) { h.hp = Math.min(h.max, h.hp + h.max * 0.22 * dt); if (Math.random() < dt * 4) G.fx.push({ kind: 'plus', x: h.x + (Math.random() - 0.5) * 40, y: h.y - 20, t: 0 }); }
}
function collide(h) {
  h.x = Math.max(40, Math.min(WS - 40, h.x)); h.y = Math.max(60, Math.min(WS - 30, h.y));
  TREES.forEach(function (t) { var dx = h.x - t.x, dy = h.y - t.y, d = Math.hypot(dx, dy), md = t.r + h.r * 0.7; if (d < md && d > 0) { h.x = t.x + dx / d * md; h.y = t.y + dy / d * md; } });
  G.structs.forEach(function (s) { if (!alive(s)) return; var dx = h.x - s.x, dy = h.y - s.y, d = Math.hypot(dx, dy), md = s.r + h.r; if (d < md && d > 0) { h.x = s.x + dx / d * md; h.y = s.y + dy / d * md; } });
}
function spd(u) { return u.spd * (u.slowT > 0 ? 0.55 : 1); }
function moveUnit(u, x, y, dt, sp) { var dx = x - u.x, dy = y - u.y, d = Math.hypot(dx, dy); if (d < 1) return d; var s = Math.min(d, (sp || spd(u)) * dt); u.x += dx / d * s; u.y += dy / d * s; if (Math.abs(dx) > 2) u.face = dx > 0 ? 1 : -1; return d; }
function minionStep(u, dt) {
  if (u.catT > 0) u.catT -= dt;
  u.atkT -= dt; u.scanT -= dt;
  if (u.scanT <= 0) {
    u.scanT = 0.3; u.target = findTarget(u, u.range + 150);
    /* Tembok Kertas: minion musuh dekat dipancing menyerang Clawd Perisai */
    if (u.team === 1 && G.buffs.tembok > 0 && !G.hero.dead && Math.hypot(G.hero.x - u.x, G.hero.y - u.y) < u.range + 220) u.target = G.hero;
  }
  var t = u.target;
  if (alive(t) && !(t.kind === 'hero' && heroHidden())) {
    var d = Math.hypot(t.x - u.x, t.y - u.y) - t.r;
    if (d > u.range) moveUnit(u, t.x, t.y, dt);
    else if (u.atkT <= 0) {
      u.atkT = u.acd; u.atk = 0.15;
      var dmg = u.dmg * (u.bubT > 0 ? 1.5 : 1) * (u.mt === 'meriam' && (t.kind === 'turret' || t.kind === 'core') ? 2.6 : 1);
      if (u.ranged) G.proj.push({ kind: u.mt === 'meriam' ? 'shell' : (u.team ? 'drop' : 'pellet'), x: u.x, y: u.y - 14, target: t, spd: u.mt === 'meriam' ? 420 : 520, dmg: dmg, src: u, team: u.team, small: true });
      else hurt(t, dmg, u);
    }
    if (u.atk > 0) u.atk -= dt;
    return;
  }
  u.target = null;
  var wp = u.path[u.wi]; if (!wp) return;
  if (moveUnit(u, wp[0], wp[1], dt) < 24 && u.wi < u.path.length - 1) u.wi++;
}
function monsterStep(m, dt) {
  var M = MON[m.type], h = G.hero;
  if (m.dead) { m.respT -= dt; if (m.respT <= 0) { m.dead = false; m.hp = m.max; m.x = m.hx; m.y = m.hy; if (m.type === 'penyu') banner(L('Penyu Tinta muncul di sungai!', 'Penyu Dakwat muncul di sungai!')); } return; }
  var leash = Math.hypot(m.x - m.hx, m.y - m.hy) > 380 || h.dead || Math.hypot(h.x - m.hx, h.y - m.hy) > 520;
  if (m.aggro && leash) m.aggro = false;
  m.moving = false;
  if (!m.aggro) { if (Math.hypot(m.x - m.hx, m.y - m.hy) > 4) { moveUnit(m, m.hx, m.hy, dt, 220); m.moving = true; } m.hp = Math.min(m.max, m.hp + m.max * 0.25 * dt); return; }
  if (m.type === 'kelomang') { var dx = m.x - h.x, dy = m.y - h.y, d = Math.hypot(dx, dy) || 1; if (Math.hypot(m.x - m.hx, m.y - m.hy) < 160) { m.x += dx / d * 70 * dt; m.y += dy / d * 70 * dt; m.moving = true; } return; }
  m.atkT -= dt;
  if (m.type === 'penyu') {
    if (m.tele > 0) { m.tele -= dt; if (m.tele <= 0) { sfx('slam'); G.fx.push({ kind: 'ring', x: m.x, y: m.y, t: 0, r: M.range }); if (Math.hypot(h.x - m.x, h.y - m.y) < M.range + h.r) hurt(h, M.dmg, m); } return; }
    if (m.atkT <= 0) { m.atkT = 2.4; m.tele = 0.8; }
    return;
  }
  var dd = Math.hypot(h.x - m.x, h.y - m.y) - h.r - m.r;
  if (dd > M.range - 20) { moveUnit(m, h.x, h.y, dt, 150); m.moving = true; }
  else if (m.atkT <= 0) { m.atkT = 1.1; hurt(h, M.dmg, m); G.fx.push({ kind: 'slash', x: h.x, y: h.y - 16, t: 0, a: Math.random() * 6, col: m.type === 'merah' ? '#d9534a' : SKY }); }
}
function separate() {
  var us = G.units;
  for (var i = 0; i < us.length; i++) {
    var a = us[i]; if (a.kind !== 'minion' || a.hp <= 0) continue;
    for (var j = i + 1; j < us.length; j++) {
      var b = us[j]; if (b.hp <= 0 || b.kind === 'monster') continue;
      var dx = b.x - a.x, dy = b.y - a.y, d = dx * dx + dy * dy, md = a.r + b.r;
      if (d < md * md && d > 0.01) { d = Math.sqrt(d); var p = (md - d) / 2, nx = dx / d, ny = dy / d; a.x -= nx * p; a.y -= ny * p; if (b.kind === 'minion') { b.x += nx * p; b.y += ny * p; } }
    }
  }
}
function turretStep(s, dt) {
  s.cdT -= dt;
  var t = s.target, h = G.hero;
  if (!alive(t) || Math.hypot(t.x - s.x, t.y - s.y) - t.r > s.range || (t === h && heroHidden())) {
    t = null; var bd = s.range;
    G.units.forEach(function (u) { if (u.team === s.team || u.team === 2 || !alive(u) || u.kind !== 'minion') return; var d = Math.hypot(u.x - s.x, u.y - s.y) - u.r; if (d < bd) { bd = d; t = u; } });
    if (!t && s.team === 1 && alive(h) && !heroHidden() && Math.hypot(h.x - s.x, h.y - s.y) - h.r < s.range) t = h;
    s.target = t;
  }
  if (t && s.cdT <= 0) {
    s.cdT = s.kind === 'core' ? 1.0 : 1.2; var dmg = t.kind === 'hero' ? Math.min(s.kind === 'core' ? 140 : 110, 55 + G.t * 0.06 + (s.kind === 'core' ? 30 : 0)) : (s.kind === 'core' ? 110 : 85);
    G.fx.push({ kind: 'beam', x1: s.x, y1: s.y - (s.kind === 'core' ? 96 : 64), x2: t.x, y2: t.y - 14, t: 0, col: s.team ? '#6b7fb0' : '#f2b04a' });
    hurt(t, dmg, s); if (onScreen(s.x, s.y)) sfx('zap', 120);
  }
}
function projStep(p, dt) {
  if (p.kind === 'boom') {
    var hh = G.hero; p.t += dt;
    if (!p.back) { p.x += p.vx * dt; p.y += p.vy * dt; p.dist += Math.hypot(p.vx, p.vy) * dt; if (p.dist >= p.max) { p.back = true; p.hits = []; } }
    else { var bdx = hh.x - p.x, bdy = hh.y - 26 - p.y, bd = Math.hypot(bdx, bdy); if (bd < 30 || p.t > 3 || hh.dead) return false; p.x += bdx / bd * 1050 * dt; p.y += bdy / bd * 1050 * dt; }
    enemiesOf(0).forEach(function (u) { if (u.kind === 'turret' || u.kind === 'core' || p.hits.indexOf(u) >= 0) return; if (Math.hypot(u.x - p.x, u.y - 14 - p.y) < u.r + 26) { p.hits.push(u); hurt(u, p.back ? p.dmg * 0.8 : p.dmg, p.src, { skill: true }); burst(p.x, p.y, 4, 'star'); sfx('hit', 60); } });
    return true;
  }
  if (p.kind === 'bigarrow' || p.kind === 'starball') {
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.kind === 'bigarrow') { enemiesOf(0).forEach(function (u) { if (p.hits.indexOf(u) >= 0) return; if (Math.hypot(u.x - p.x, u.y - 14 - p.y) < u.r + p.r) { p.hits.push(u); hurt(u, p.dmg, p.src, { skill: true }); burst(p.x, p.y, 4, 'ink'); } }); G.fx.push({ kind: 'dot', x: p.x, y: p.y, t: 0, col: '#b8861c' }); return p.life > 0; }
    var hit = enemiesOf(0).some(function (u) { return Math.hypot(u.x - p.x, u.y - 14 - p.y) < u.r + 18; });
    if (Math.random() < 0.8) G.fx.push({ kind: 'dot', x: p.x, y: p.y, t: 0, col: GOLD });
    if (hit || p.life <= 0) { G.fx.push({ kind: 'explode', x: p.x, y: p.y, t: 0, r: 115 }); areaDmg(p.x, p.y + 14, 115, p.dmg, {}); sfx('star'); burst(p.x, p.y, 10, 'star'); return false; }
    return true;
  }
  var t = p.target; if (!alive(t)) return false;
  if (t.kind === 'hero' && heroHidden()) return false;
  var tx2 = t.x, ty2 = t.y - (t.kind === 'turret' || t.kind === 'core' ? 40 : 14), dx = tx2 - p.x, dy = ty2 - p.y, d = Math.hypot(dx, dy), s = p.spd * dt;
  p.ang = Math.atan2(dy, dx);
  if (d <= s + 4) { hurt(t, p.dmg, p.src); if (p.src === G.hero) { burst(tx2, ty2, p.emp ? 6 : 3, 'star'); sfx('hit', 70); } if (p.kind === 'shell') burst(tx2, ty2, 6, 'smoke'); return false; }
  p.x += dx / d * s; p.y += dy / d * s; return true;
}
function fxStep(f, dt) {
  f.t += dt;
  if (f.kind === 'star') { if (f.t >= 0.45 && !f.done) { f.done = true; areaDmg(f.x, f.y, f.r, f.dmg, {}); burst(f.x, f.y, 8, 'star'); sfx('star', 90); shake = Math.max(shake, 0.25); } return f.t < 0.8; }
  if (f.kind === 'mochi') { if (f.t >= 0.4 && !f.done) { f.done = true; enemiesOf(0).forEach(function (u) { if (u.kind === 'minion' && Math.hypot(u.x - f.x, u.y - f.y) < 150 + u.r) u.catT = 1.6; }); areaDmg(f.x, f.y, 150, f.dmg, { stun: 1.6 }); G.fx.push({ kind: 'ring', x: f.x, y: f.y, t: 0, r: 150, col: 'rgba(241,155,180,0.35)' }); burst(f.x, f.y, 10, 'star'); sfx('pop'); } return f.t < 0.9; }
  if (f.kind === 'mstorm') { if (f.t >= 0 && !f.done) { f.done = true; var bp = [[f.x + 30, f.y - 420]]; for (var bi = 1; bi < 6; bi++) bp.push([f.x + (Math.random() - 0.5) * 50, f.y - 420 + bi * 84]); G.fx.push({ kind: 'bolt', pts: bp, t: 0 }); G.fx.push({ kind: 'explode', x: f.x, y: f.y, t: 0, r: f.r }); areaDmg(f.x, f.y, f.r, f.dmg, f.last ? { stun: 1.2 } : { slow: 1 }); sfx('thunder'); shake = Math.max(shake, f.last ? 0.6 : 0.3); } return f.t < 0.5; }
  if (f.kind === 'volley') { if (f.t >= 0.3 && !f.done) { f.done = true; areaDmg(f.x, f.y, f.r, f.dmg, { slow: 1.2 }); sfx('slash', 60); } return f.t < 0.6; }
  if (f.kind === 'stab') { if (f.t >= 0.18 && !f.done) { f.done = true; if (alive(f.target)) { hurt(f.target, f.dmg, G.hero, { skill: true }); G.fx.push({ kind: 'slash', x: f.target.x, y: f.target.y - 16, t: 0, a: 2.4, col: '#c9b8f0' }); sfx('slash'); } } return f.t < 0.2; }
  if (f.kind === 'pencil') {
    if (f.t >= 0.5 && !f.done) { f.done = true; var tg = f.target; if (alive(tg)) { var dmg = tg.max * f.pct; G.gempurHit++; tg.hp -= dmg; tg.hitT = 0.3; floatText(tg.x, tg.y - 110, '−' + Math.round(dmg), '#d9534a', true); if (tg.hp <= 0) { tg.hp = 0; die(tg, G.hero); } } sfx('boom'); shake = 1.1; burst(f.x, f.y, 26, 'chip'); burst(f.x, f.y, 16, 'star'); G.fx.push({ kind: 'quake', x: f.x, y: f.y, t: 0, r: 160 }); }
    return f.t < 1.1;
  }
  var life = { beam: 0.18, spin: 0.45, ring: 0.5, dot: 0.35, plus: 0.6, slash: 0.22, ghost: 0.3, wind: 0.5, bolt: 0.35, explode: 0.45, quake: 0.7, pillar: 0.9, blink: 0.4, wall: 0.7 }[f.kind];
  if (life) return f.t < life;
  if (f.kind === 'p') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.g || 0) * dt; f.vx *= 0.96; return f.t < f.life; }
  return false;
}
function burst(x, y, n, type) { if (!G) return; for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = 60 + Math.random() * 170; G.fx.push({ kind: 'p', type: type, x: x, y: y - 14, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: type === 'chip' ? 300 : 0, t: 0, life: 0.4 + Math.random() * 0.5, r: 2 + Math.random() * 4, rot: Math.random() * 6 }); } }
function floatText(x, y, s, col, big) { if (G && G.floats.length < 90) G.floats.push({ x: x, y: y, s: String(s), col: col || INK, life: 1, big: big }); }
var toastT = 0;
function toast(html) { var t = document.getElementById('toast'); t.innerHTML = html; t.hidden = false; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = ''; toastT = 3; }
