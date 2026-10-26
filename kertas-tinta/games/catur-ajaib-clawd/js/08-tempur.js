/* Catur Ajaib Clawd: simulasi tempur otomatis (dipakai untuk tempur yang ditonton dan tempur AI vs AI di latar).
   Koordinat tempur: kolom 0..7, baris 0..7. Pasukan pemilik (side 0) di baris 4..7 seperti disusun; lawan (side 1) dicerminkan ke baris 0..3. */
'use strict';
var SK_K = [0, 1, 1.6, 2.6];

function teamBonus(owner, units) {
  var cnt = synCount(units), b = {};
  Object.keys(cnt).forEach(function (k) { b[k] = synVal(k, cnt[k]); });
  b.penyokongAll = b.penyokong || 0;
  return b;
}
function mkFighter(u, side, owner, bonus) {
  var H = HEROES[u.id], k = STAR_K[u.star], fx = owner ? owner.fx : { semangat: 0, ajaib: false };
  var it = function (n) { return u.items.filter(function (x) { return x === n; }).length; };
  var mine = function (key) { return (H.f === key || H.p === key) ? (bonus[key] || 0) : 0; };
  var f = { side: side, id: u.id, star: u.star, items: u.items.slice(), H: H, kind: 'hero',
    x: side === 0 ? u.x : 7 - u.x, y: side === 0 ? u.y : 7 - u.y,
    max: H.hp * k + it('kalung') * 180 + (bonus.penyokongAll || 0) + (fx.ajaib ? 200 : 0),
    atk: H.atk * k + it('pedang') * 15, as: H.as, asB: it('busur') * 0.18 + mine('mesin') + (fx.semangat || 0),
    rng: H.rng, red: Math.min(0.6, it('jaket') * 0.15 + mine('pengawal')), ls: mine('pendekar'), crit: 0.05 + mine('pemanah'),
    sp: 1 + it('tongkat') * 0.25 + mine('penyihir'), dmgMul: 1 + mine('tinta') + (fx.ajaib ? 0.2 : 0), regen: mine('hutan'),
    shield: mine('kertas'), mana: it('jam') * 20 + mine('bintang'), manaHit: 10 + mine('bintang') / 4, maxMana: H.mana,
    pw: H.pw * SK_K[u.star], sk: H.sk, cd: 0.25 + Math.random() * 0.3, stun: 0, taunt: 0, dead: false, tg: null,
    atkT: 0, hitT: 0, castT: 0, face: side === 0 ? 1 : -1, darah: !!fx.darah, dealt: 0 };
  f.hp = f.max; return f;
}
function mkCreep(type, x, y, scale) {
  var C = CREEP[type];
  var f = { side: 1, id: type, star: 1, items: [], kind: 'creep', C: C, x: x, y: y, max: C.hp * scale, atk: C.atk * scale, as: C.as, asB: 0, rng: C.rng,
    red: 0, ls: 0, crit: 0, sp: 1, dmgMul: 1, regen: 0, shield: 0, mana: 0, manaHit: 0, maxMana: 9999, pw: 0, sk: null, cd: 0.4, stun: 0, taunt: 0,
    dead: false, tg: null, atkT: 0, hitT: 0, castT: 0, face: -1, darah: false, dealt: 0 };
  f.hp = f.max; return f;
}
function creepWave(stage, round) {
  var L;
  if (stage === 1) L = round === 1 ? [['kecil', 3, 2], ['kecil', 4, 2]] : round === 2 ? [['kecil', 2, 2], ['kecil', 5, 2], ['pemanah', 4, 0]] : [['sedang', 3, 2], ['sedang', 4, 2], ['pemanah', 3, 0], ['pemanah', 5, 0]];
  else L = [['besar', 3, 2], ['sedang', 2, 2], ['sedang', 5, 2], ['pemanah', 1, 0], ['pemanah', 6, 0]].concat(stage >= 4 ? [['sedang', 4, 1], ['pemanah', 3, 0]] : []);
  var sc = stage === 1 ? 1 : 1 + (stage - 1) * 0.85;
  return L.map(function (c) { return mkCreep(c[0], c[1], c[2], sc); });
}
function newSim(a, b, creeps) {
  var fa = onBoard(a), sim = { f: [], proj: [], fx: [], t: 0, done: false, winner: -1, a: a, b: b, visible: false };
  var ba = teamBonus(a, fa); fa.forEach(function (u) { sim.f.push(mkFighter(u, 0, a, ba)); });
  if (creeps) sim.f = sim.f.concat(creeps);
  else { var fb = onBoard(b), bb = teamBonus(b, fb); fb.forEach(function (u) { sim.f.push(mkFighter(u, 1, b, bb)); }); }
  return sim;
}
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function foes(sim, f) { return sim.f.filter(function (o) { return !o.dead && o.side !== f.side; }); }
function allies(sim, f) { return sim.f.filter(function (o) { return !o.dead && o.side === f.side; }); }
function nearest(sim, f) {
  var list = foes(sim, f), tn = list.filter(function (o) { return o.taunt > 0 && dist(o, f) < 2.6; });
  if (tn.length) list = tn;
  var best = null, bd = 1e9; list.forEach(function (o) { var d = dist(o, f) + Math.random() * 0.01; if (d < bd) { bd = d; best = o; } }); return best;
}
function healF(sim, f, n) { if (f.dead) return; var before = f.hp; f.hp = Math.min(f.max, f.hp + n); if (sim.visible && f.hp - before > 25) popNum(f, '+' + Math.round(f.hp - before), '#4c7f33'); }
function hurtF(sim, src, tg, amt, skill) {
  if (tg.dead) return;
  var crit = false;
  amt *= src.dmgMul * (src.darah && sim.t > 8 ? 1.25 : 1);
  if (!skill && Math.random() < src.crit) { amt *= 1.8; crit = true; }
  amt *= 1 - tg.red;
  if (tg.shield > 0) { var ab = Math.min(tg.shield, amt); tg.shield -= ab; amt -= ab; }
  tg.hp -= amt; tg.hitT = 0.12; src.dealt += amt;
  if (tg.kind === 'hero') tg.mana += Math.min(8, amt / 25);
  if (src.ls) healF(sim, src, amt * src.ls);
  if (sim.visible && amt >= 1) popNum(tg, Math.round(amt), crit ? '#c2483a' : skill ? '#5a3d8f' : INK, crit || skill);
  if (tg.hp <= 0) { tg.dead = true; tg.hp = 0; if (sim.visible) { sfx('pop', 60); burst(tg.x, tg.y, tg.side === 0 ? CL : '#4d5a8f'); } }
}
function addProj(sim, f, tg, dmg, skill, kind) {
  sim.proj.push({ x: f.x, y: f.y, src: f, tg: tg, dmg: dmg, skill: skill, t: 0, dur: Math.max(0.12, dist(f, tg) / 10), kind: kind || 'basic', side: f.side });
}
function cast(sim, f) {
  var tg = f.tg && !f.tg.dead ? f.tg : nearest(sim, f), pw = f.pw * f.sp, fo = foes(sim, f);
  f.castT = 0.5; if (sim.visible) { sfx(f.sk === 'pulih' || f.sk === 'badai' ? 'heal' : f.sk === 'perisai' ? 'spin' : f.sk === 'gempa' ? 'slam' : 'zap', 80); ring(f.x, f.y, f.side === 0 ? GOLD : '#7f9fd9'); }
  if (f.sk === 'perisai') { f.shield += pw; f.taunt = 3; return; }
  if (f.sk === 'pulih') { allies(sim, f).sort(function (a, b) { return a.hp / a.max - b.hp / b.max; }).slice(0, 2).forEach(function (o) { healF(sim, o, pw); if (sim.visible) ring(o.x, o.y, '#6fa83c'); }); return; }
  if (f.sk === 'badai') { fo.forEach(function (o) { hurtF(sim, f, o, pw * 0.6, true); }); allies(sim, f).forEach(function (o) { healF(sim, o, o.max * 0.15); }); if (sim.visible) fo.forEach(function (o) { ring(o.x, o.y, '#6fa83c'); }); return; }
  if (f.sk === 'gempa') { fo.filter(function (o) { return dist(o, f) < 2.3; }).forEach(function (o) { hurtF(sim, f, o, pw, true); o.stun = Math.max(o.stun, 1); }); if (sim.visible) ring(f.x, f.y, '#a8552e', 2.3); return; }
  if (f.sk === 'hujan') { shuffle(fo).slice(0, 4).forEach(function (o) { addProj(sim, f, o, pw * 0.8, true, 'hujan'); }); return; }
  if (!tg) return;
  if (f.sk === 'lompat') { var w = fo.sort(function (a, b) { return a.hp - b.hp; })[0] || tg; f.x = w.x + (f.side === 0 ? 0 : 0); f.y = w.y + (f.side === 0 ? 0.8 : -0.8); f.tg = w; hurtF(sim, f, w, pw, true); if (sim.visible) ring(w.x, w.y, '#3f3a55'); return; }
  if (f.sk === 'tebas') { hurtF(sim, f, tg, pw, true); fo.forEach(function (o) { if (o !== tg && dist(o, tg) < 1.6) hurtF(sim, f, o, pw * 0.6, true); }); if (sim.visible) ring(tg.x, tg.y, CL, 1.4); return; }
  if (f.sk === 'pengsan') { addProj(sim, f, tg, pw, true, 'pengsan'); return; }
  if (f.sk === 'bola') { addProj(sim, f, tg, pw, true, 'bola'); return; }
  if (f.sk === 'panah') {
    addProj(sim, f, tg, pw, true, 'panah');
    var dx = tg.x - f.x, dy = tg.y - f.y, L = Math.hypot(dx, dy) || 1, bx = tg.x + dx / L, by = tg.y + dy / L;
    var behind = fo.filter(function (o) { return o !== tg && Math.hypot(o.x - bx, o.y - by) < 1.3; })[0]; if (behind) addProj(sim, f, behind, pw * 0.7, true, 'panah');
  }
}
function stepSim(sim, dt) {
  if (sim.done) return;
  sim.t += dt;
  for (var i = 0; i < sim.f.length; i++) {
    var f = sim.f[i]; if (f.dead) continue;
    f.atkT = Math.max(0, f.atkT - dt); f.hitT = Math.max(0, f.hitT - dt); f.castT = Math.max(0, f.castT - dt); f.taunt = Math.max(0, f.taunt - dt);
    if (f.regen) healF(sim, f, f.max * f.regen * dt);
    if (f.stun > 0) { f.stun -= dt; continue; }
    if (!f.tg || f.tg.dead || Math.random() < dt * 0.5) f.tg = nearest(sim, f);
    var tg = f.tg; if (!tg) continue;
    var d = dist(f, tg), reach = f.rng === 1 ? 1.5 : f.rng + 0.4;
    if (tg.x !== f.x) f.face = tg.x > f.x ? 1 : -1;
    if (d <= reach) {
      f.cd -= dt;
      if (f.cd <= 0) {
        f.cd = f.as / (1 + f.asB); f.atkT = 0.2;
        if (f.rng > 1) addProj(sim, f, tg, f.atk, false); else { hurtF(sim, f, tg, f.atk, false); if (sim.visible) sfx('hit', 70); }
        if (f.kind === 'hero') f.mana += f.manaHit;
      }
    } else {
      var sp = 2.2 * dt, nx = (tg.x - f.x) / d, ny = (tg.y - f.y) / d;
      f.x += nx * sp; f.y += ny * sp; f.moving = 0.15;
      /* jangan bertumpuk */
      for (var j = 0; j < sim.f.length; j++) { var o = sim.f[j]; if (o === f || o.dead) continue; var dd = dist(o, f); if (dd < 0.8 && dd > 0.0001) { var push = (0.8 - dd) * 0.5; f.x -= (o.x - f.x) / dd * push; f.y -= (o.y - f.y) / dd * push; } }
      f.x = Math.max(0, Math.min(7, f.x)); f.y = Math.max(0, Math.min(7, f.y));
    }
    if (f.moving) f.moving = Math.max(0, f.moving - dt);
    if (f.kind === 'hero' && f.mana >= f.maxMana) { f.mana = 0; cast(sim, f); }
  }
  for (var p = sim.proj.length - 1; p >= 0; p--) {
    var pr = sim.proj[p]; pr.t += dt;
    if (pr.t >= pr.dur) {
      sim.proj.splice(p, 1);
      if (!pr.tg.dead) { hurtF(sim, pr.src, pr.tg, pr.dmg, pr.skill); if (pr.kind === 'pengsan') pr.tg.stun = Math.max(pr.tg.stun, 1.5); if (pr.kind === 'bola') { foes(sim, pr.src).forEach(function (o) { if (o !== pr.tg && dist(o, pr.tg) < 1.4) hurtF(sim, pr.src, o, pr.dmg * 0.7, true); }); if (sim.visible) ring(pr.tg.x, pr.tg.y, '#7f9fd9', 1.3); } }
    }
  }
  var a0 = sim.f.some(function (f) { return !f.dead && f.side === 0; }), a1 = sim.f.some(function (f) { return !f.dead && f.side === 1; });
  if (!a0 || !a1) { sim.done = true; sim.winner = a0 ? 0 : a1 ? 1 : 1; }
  else if (sim.t >= 40) {
    sim.done = true; var s0 = 0, s1 = 0;
    sim.f.forEach(function (f) { if (!f.dead) { if (f.side === 0) s0 += f.hp / f.max; else s1 += f.hp / f.max; } });
    sim.winner = s0 > s1 ? 0 : 1; sim.timeout = true;
  }
}
function survivors(sim, side) { return sim.f.filter(function (f) { return !f.dead && f.side === side; }); }
/* tempur di latar (AI vs AI) */
function runSim(a, b) {
  if (!onBoard(a).length && !onBoard(b).length) return { winner: Math.random() < 0.5 ? 0 : 1, surv: [] };
  var sim = newSim(a, b), n = 0;
  while (!sim.done && n++ < 1000) stepSim(sim, 1 / 20);
  return { winner: sim.winner, surv: survivors(sim, sim.winner) };
}
function lossDmg(surv) { var s = 0; surv.forEach(function (f) { s += f.kind === 'hero' ? f.star : 1; }); return stageDmg(G.stage) + s; }
