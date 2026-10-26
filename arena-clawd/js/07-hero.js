/* Arena Clawd: Clawd: serangan, skill, spell */
'use strict';
/* ---------- Clawd ---------- */
function heroDown() {
  var h = G.hero; h.dead = true; h.hp = 0; G.deaths++; h.respT = 6 + h.lvl * 0.6; h.dash = h.leap = null; h.recall = 0;
  burst(h.x, h.y, 20, 'paper'); sfx('over');
  setTimeout(function () { if (G && G.state === 'main' && G.hero.dead) ask('mati'); }, 900);
}
function respawn() { var h = G.hero; h.dead = false; h.hp = h.max; h.x = 330; h.y = 1680; h.respT = 0; burst(h.x, h.y, 14, 'star'); toast('Clawd kembali beraksi!'); }
function heroAttack() {
  var h = G.hero, H = HEROES[h.id]; if (h.dead || h.atkT > 0 || h.dash || h.leap || h.dance || h.stunT > 0) return false;
  var t = findTarget(h, H.range + 10); if (!t) return false;
  h.atkT = H.atkCd / (1 + h.as + (G.buffs.laju > 0 ? 0.25 : 0)); h.atkAnim = 0.2; h.face = t.x >= h.x ? 1 : -1; h.recall = 0;
  var dmg = atkPower() * (h.emp > 0 ? 1.6 : 1); if (h.emp > 0) h.emp--;
  if (h.invis > 0) { dmg *= 2; h.invis = 0; G.buffs.halimunan = 0; floatText(h.x, h.y - 80, 'Serang hendap!', '#6c6487', true); }
  var crit = h.crit > 0 && Math.random() < h.crit; if (crit) dmg *= 1.8;
  var opt = { slow: h.ais ? 1 : 0, crit: crit };
  if (H.melee) { hurt(t, dmg, h, opt); G.fx.push({ kind: 'slash', x: t.x, y: t.y - 16, t: 0, a: Math.random() * 6 }); sfx('slash', 80); }
  else G.proj.push({ kind: h.id === 'pemanah' ? 'arrow' : (h.id === 'jurutera' ? 'pellet' : (h.id === 'penawar' ? 'leafshot' : 'orb')), x: h.x + h.face * 18, y: h.y - 30, target: t, spd: 950, dmg: dmg, src: h, team: 0, emp: h.emp > 0, opt: opt }), sfx('shot', 80);
  return true;
}
function aimDir(range) {
  var h = G.hero, t = findTarget(h, range);
  if (t) { var d = Math.hypot(t.x - h.x, t.y - h.y) || 1; return { x: (t.x - h.x) / d, y: (t.y - h.y) / d, t: t, d: d }; }
  var mv = Math.hypot(G.input.x, G.input.y); if (mv > 0.1) return { x: G.input.x / mv, y: G.input.y / mv };
  return { x: 0.707 * h.face, y: -0.707 };
}
function skill(n) {
  var h = G && G.hero; if (!G || G.state !== 'main' || h.dead || h.cd[n] > 0 || h.dash || h.leap || h.dance || h.stunT > 0) return false;
  if (h.sl[n] === 0) { toast('Ultimate terbuka pada Tahap 4.'); return false; }
  h.cd[n] = skillCd(n); h.atkAnim = 0.3; h.recall = 0;
  var id = h.id, a, i;
  if (id === 'pahlawan') {
    if (n === 0) { a = aimDir(420); h.face = a.x >= 0 ? 1 : -1; h.dash = { vx: a.x * 1300, vy: a.y * 1300, t: 0.2, hits: [], dmg: skillDmg(70, 1.2, 0), slow: 1.5 }; sfx('dash'); }
    else if (n === 1) { sfx('spin'); G.fx.push({ kind: 'spin', x: h.x, y: h.y, t: 0, r: 175, col: CL }); areaDmg(h.x, h.y - 10, 175, skillDmg(60, 1.1, 1), {}); h.hp = Math.min(h.max, h.hp + h.max * 0.09); G.buffs.kebal = 3; floatText(h.x, h.y - 70, '+' + Math.round(h.max * 0.09), '#3f6b22'); }
    else { a = aimDir(480); var tx = a.t ? a.t.x : h.x + a.x * 260, ty = a.t ? a.t.y : h.y + a.y * 260; h.leap = { x0: h.x, y0: h.y, x1: tx, y1: ty, t: 0, dur: 0.5 }; sfx('ult'); floatText(h.x, h.y - 80, HEROES[id].sk[2].n + '!', GOLD, true); }
  } else if (id === 'pemanah') {
    if (n === 0) { a = aimDir(700); h.face = a.x >= 0 ? 1 : -1; G.proj.push({ kind: 'bigarrow', x: h.x, y: h.y - 26, vx: a.x * 1000, vy: a.y * 1000, life: 0.75, dmg: skillDmg(85, 1.3, 0), src: h, team: 0, hits: [], r: 26 }); sfx('dash'); }
    else if (n === 1) { var mv = Math.hypot(G.input.x, G.input.y), dx, dy; if (mv > 0.1) { dx = G.input.x / mv; dy = G.input.y / mv; } else { var e = findTarget(h, 400); if (e) { var dd = Math.hypot(h.x - e.x, h.y - e.y) || 1; dx = (h.x - e.x) / dd; dy = (h.y - e.y) / dd; } else { dx = -h.face; dy = 0; } } h.dash = { vx: dx * 1000, vy: dy * 1000, t: 0.18, hits: null }; h.emp = 3; sfx('dash'); G.fx.push({ kind: 'wind', x: h.x, y: h.y, t: 0 }); }
    else { a = aimDir(620); var cx = a.t ? a.t.x : h.x + a.x * 280, cy = a.t ? a.t.y : h.y + a.y * 280; for (i = 0; i < 8; i++) G.fx.push({ kind: 'volley', x: cx, y: cy, t: -i * 0.25, r: 200, dmg: skillDmg(36, 0.5, 2), done: false }); sfx('ult'); floatText(h.x, h.y - 80, 'Hujan Panah!', GOLD, true); }
  } else if (id === 'penjaga') {
    if (n === 0) { a = aimDir(340); h.face = a.x >= 0 ? 1 : -1; h.dash = { vx: a.x * 1100, vy: a.y * 1100, t: 0.17, hits: [], dmg: skillDmg(60, 1, 0), slow: 1, stun: 0.8 + 0.1 * (h.sl[0] - 1) }; sfx('dash'); }
    else if (n === 1) { h.shield = Math.max(h.shield, h.max * (0.22 + 0.03 * (h.sl[1] - 1))); G.buffs.tembok = 4; sfx('heal'); G.fx.push({ kind: 'ring', x: h.x, y: h.y, t: 0, r: 260 }); pullAround(h.x, h.y, 260, 0.55, { slow: 2, dmg: skillDmg(40, 0.6, 1) }); floatText(h.x, h.y - 80, 'Tembok Buku!', '#5f6b3a', true); }
    else { sfx('ult'); shake = 0.9; G.fx.push({ kind: 'fort', x: h.x, y: h.y, t: 0, r: 290 }); pullAround(h.x, h.y, 290, 0.85, { stun: 1.4, dmg: skillDmg(120, 1.2, 2) }); floatText(h.x, h.y - 80, 'Benteng Kertas!', GOLD, true); }
  } else if (id === 'bayang') {
    if (n === 0) { var tg = findTarget(h, 400, true) || findTarget(h, 400); if (!tg) { h.cd[0] = 0.5; toast('Tiada musuh dekat untuk Tikam Bayang.'); return false; } var ddx = tg.x - h.x, ddy = tg.y - h.y, dl = Math.hypot(ddx, ddy) || 1; G.fx.push({ kind: 'blink', x: h.x, y: h.y, t: 0, col: '#6c6487' }); h.x = tg.x + ddx / dl * (tg.r + 24); h.y = tg.y + ddy / dl * (tg.r + 10); collide(h); h.face = ddx >= 0 ? -1 : 1; G.fx.push({ kind: 'slash', x: tg.x, y: tg.y - 16, t: 0, a: 1, col: '#c9b8f0' }); hurt(tg, skillDmg(90, 1.4, 0), h, { skill: true }); sfx('slash'); }
    else if (n === 1) { h.invis = 3; G.buffs.halimunan = 3; sfx('blink'); G.fx.push({ kind: 'blink', x: h.x, y: h.y, t: 0, col: '#6c6487' }); G.units.concat(G.structs).forEach(function (u) { if (u.target === h) u.target = null; }); floatText(h.x, h.y - 80, 'Halimunan', '#6c6487', true); }
    else { var list = G.units.filter(function (u) { return alive(u) && u.team !== 0 && u.kind !== 'boss' && (u.kind !== 'monster' || u.aggro || Math.hypot(u.x - h.x, u.y - h.y) < 250) && Math.hypot(u.x - h.x, u.y - h.y) < 360; }).sort(function (p, q) { return p.hp - q.hp; }).slice(0, 5); if (!list.length) { h.cd[2] = 1; toast('Tiada musuh dekat untuk Tarian Pisau.'); return false; } h.dance = { list: list, i: 0, t: 0, dmg: skillDmg(55, 0.8, 2) }; sfx('ult'); floatText(h.x, h.y - 80, 'Tarian Pisau!', GOLD, true); }
  } else if (id === 'penawar') {
    if (n === 0) { var heal = h.max * (0.12 + 0.02 * (h.sl[0] - 1)) * h.sp; h.hp = Math.min(h.max, h.hp + heal); floatText(h.x, h.y - 70, '+' + Math.round(heal), '#3f6b22', true); G.units.forEach(function (u) { if (u.team === 0 && u.kind === 'minion' && alive(u) && Math.hypot(u.x - h.x, u.y - h.y) < 320) { u.hp = Math.min(u.max, u.hp + u.max * 0.35); G.fx.push({ kind: 'plus', x: u.x, y: u.y - 20, t: 0 }); } }); G.fx.push({ kind: 'spin', x: h.x, y: h.y, t: 0, r: 170, col: '#7dbb5a' }); burst(h.x, h.y, 10, 'leaf'); areaDmg(h.x, h.y - 10, 170, skillDmg(50, 0.8, 0), {}); sfx('heal'); }
    else if (n === 1) { a = aimDir(520); var mx = a.t ? a.t.x : h.x + a.x * 260, my = a.t ? a.t.y : h.y + a.y * 260; G.fx.push({ kind: 'mud', x: mx, y: my, t: 0, r: 150, dmg: skillDmg(28, 0.35, 1), tick: 0 }); sfx('pop'); }
    else { h.hp = Math.min(h.max, h.hp + h.max * 0.45); h.shield = Math.max(h.shield, h.max * 0.3); G.buffs.semangat = 8; G.units.forEach(function (u) { if (u.team === 0 && u.kind === 'minion' && alive(u) && Math.hypot(u.x - h.x, u.y - h.y) < 560) u.hp = u.max; }); G.fx.push({ kind: 'bloom', x: h.x, y: h.y, t: 0, r: 260 }); pushAround(h.x, h.y, 260, 130, { stun: 0.8, dmg: skillDmg(80, 0.8, 2) }); sfx('ult'); floatText(h.x, h.y - 80, 'Mekar Bunga!', '#4c7f33', true); }
  } else if (id === 'jurutera') {
    if (n === 0) { var minis = G.structs.filter(function (q) { return q.kind === 'mini' && q.hp > 0; }); if (minis.length >= 2) minis[0].hp = 0; var px = Math.max(60, Math.min(WS - 60, h.x + h.face * 55)), py = h.y + 10, mh = 520 + h.lvl * 60; G.structs.push({ kind: 'mini', team: 0, x: px, y: py, r: 16, hp: mh, max: mh, range: 270, cdT: 0.3, target: null, hitT: 0, life: 12, dmg: skillDmg(30, 0.45, 0) }); burst(px, py, 8, 'chip'); sfx('slam'); }
    else if (n === 1) { a = aimDir(560); var bx = a.t ? a.t.x : h.x + a.x * 300, by = a.t ? a.t.y : h.y + a.y * 300; h.face = bx >= h.x ? 1 : -1; G.proj.push({ kind: 'bomb', x: h.x, y: h.y - 30, x0: h.x, y0: h.y - 30, x1: bx, y1: by, t: 0, dur: 0.55, dmg: skillDmg(80, 1.2, 1), src: h, team: 0 }); sfx('shot'); }
    else { var foes = enemiesOf(0).filter(function (u) { return !shielded(u) && u.team !== 2 && Math.hypot(u.x - h.x, u.y - h.y) < 650; }); if (!foes.length) { h.cd[2] = 1; toast('Tiada musuh untuk Roket Kertas.'); return false; } for (i = 0; i < 6; i++) G.proj.push({ kind: 'rocket', x: h.x, y: h.y - 40, target: foes[i % foes.length], spd: 640, dmg: skillDmg(70, 0.8, 2), src: h, team: 0, delay: i * 0.13, aoe: 90, ang: -1.57 + (i - 2.5) * 0.4 }); sfx('ult'); floatText(h.x, h.y - 80, 'Roket Kertas!', GOLD, true); }
  } else if (id === 'nini') {
    if (n === 0) { a = aimDir(600); h.face = a.x >= 0 ? 1 : -1; G.proj.push({ kind: 'boomer', x: h.x, y: h.y - 26, vx: a.x * 820, vy: a.y * 820, t: 0, out: 0.5, hits: [], hits2: [], dmg: skillDmg(70, 1.1, 0), src: h, team: 0 }); sfx('dash'); }
    else if (n === 1) { var cat = findTarget(h, 430, true); if (!cat || cat.kind === 'boss') { h.cd[1] = 0.5; toast('Tiada musuh dekat untuk Kucing Mochi.'); return false; } var dur = 2 + 0.25 * (h.sl[1] - 1); cat.catT = dur; cat.stunT = Math.max(cat.stunT || 0, dur); G.fx.push({ kind: 'blink', x: cat.x, y: cat.y, t: 0, col: '#e79bb6' }); hurt(cat, skillDmg(40, 0.5, 1), h, { skill: true }); floatText(cat.x, cat.y - 60, 'Meow!', '#b2627f', true); sfx('blink'); }
    else { a = aimDir(600); var cx2 = a.t ? a.t.x : h.x + a.x * 260, cy2 = a.t ? a.t.y : h.y + a.y * 260; for (i = 0; i < 3; i++) G.fx.push({ kind: 'storm', x: cx2, y: cy2, t: -i * 0.7, r: 200, dmg: skillDmg(80, 0.9, 2), done: false }); sfx('ult'); floatText(h.x, h.y - 80, 'Badai Bintang!', GOLD, true); }
  } else {
    if (n === 0) { a = aimDir(650); h.face = a.x >= 0 ? 1 : -1; G.proj.push({ kind: 'starball', x: h.x, y: h.y - 30, vx: a.x * 650, vy: a.y * 650, life: 0.95, dmg: skillDmg(100, 1.6, 0), src: h, team: 0 }); sfx('dash'); }
    else if (n === 1) { var first = findTarget(h, 400); if (!first) { h.cd[1] = 0.5; toast('Tiada musuh dekat untuk Rantai Kilat.'); return false; } var chain = [first], cur = first; for (i = 0; i < 3; i++) { var nx = null, nd = 230; enemiesOf(0).forEach(function (u) { if (chain.indexOf(u) >= 0 || u.kind === 'turret' || u.kind === 'core') return; var d = Math.hypot(u.x - cur.x, u.y - cur.y); if (d < nd) { nd = d; nx = u; } }); if (!nx) break; chain.push(nx); cur = nx; }
      var pts = [[h.x, h.y - 40]]; chain.forEach(function (u) { pts.push([u.x, u.y - 16]); hurt(u, skillDmg(75, 1.2, 1), h, { stun: 0.7, skill: true }); }); G.fx.push({ kind: 'bolt', pts: pts, t: 0 }); sfx('thunder'); }
    else { a = aimDir(620); var sx = a.t ? a.t.x : h.x + a.x * 260, sy = a.t ? a.t.y : h.y + a.y * 260; for (i = 0; i < 8; i++) G.fx.push({ kind: 'star', x: sx + (Math.random() - 0.5) * 240, y: sy + (Math.random() - 0.5) * 170, t: -i * 0.15, r: 115, dmg: skillDmg(110, 1.3, 2), done: false }); sfx('ult'); shake = 0.4; floatText(h.x, h.y - 80, 'Hujan Bintang!', GOLD, true); }
  }
  return true;
}
function areaDmg(x, y, R, dmg, opt) { enemiesOf(0).forEach(function (u) { if (Math.hypot(u.x - x, u.y - y) < R + u.r) hurt(u, dmg, G.hero, Object.assign({ skill: true }, opt || {})); }); }
function useSpell() {
  var h = G && G.hero; if (!G || G.state !== 'main' || h.dead || h.spellCd > 0 || (h.stunT > 0 && pickSpell !== 'bersih')) return false;
  var S = SPELLS[pickSpell]; h.spellCd = S.cd; h.recall = 0;
  if (pickSpell === 'kilas') { var a = aimDir(0), mv = Math.hypot(G.input.x, G.input.y); if (mv > 0.1) a = { x: G.input.x / mv, y: G.input.y / mv }; G.fx.push({ kind: 'blink', x: h.x, y: h.y, t: 0 }); h.x = Math.max(40, Math.min(WS - 40, h.x + a.x * 240)); h.y = Math.max(60, Math.min(WS - 30, h.y + a.y * 240)); G.fx.push({ kind: 'blink', x: h.x, y: h.y, t: 0 }); sfx('blink'); }
  else if (pickSpell === 'pulih') { h.hp = Math.min(h.max, h.hp + h.max * 0.3); sfx('heal'); G.fx.push({ kind: 'pillar', x: h.x, y: h.y, t: 0, col: '#6fa83c' }); floatText(h.x, h.y - 70, '+' + Math.round(h.max * 0.3), '#3f6b22', true); }
  else if (pickSpell === 'hukuman') { var t = null, bd = 260; G.units.forEach(function (u) { if (!alive(u) || u.team === 0 || u.kind === 'boss') return; var d = Math.hypot(u.x - h.x, u.y - h.y); if (d < bd) { bd = d; t = u; } }); if (!t) { h.spellCd = 1; toast('Hukuman perlukan monster atau minion dekat.'); return false; } G.fx.push({ kind: 'bolt', pts: [[t.x, t.y - 240], [t.x + 10, t.y - 120], [t.x - 8, t.y - 60], [t.x, t.y - 10]], t: 0 }); hurt(t, t.kind === 'monster' ? 650 + h.lvl * 40 : 500, h, { skill: true }); sfx('thunder'); }
  else if (pickSpell === 'pecut') { G.buffs.pecut = 5; sfx('dash'); G.fx.push({ kind: 'wind', x: h.x, y: h.y, t: 0 }); }
  else if (pickSpell === 'bersih') { h.stunT = 0; h.slowT = 0; G.buffs.bersih = 2; G.buffs.pecut = Math.max(G.buffs.pecut || 0, 1.5); burst(h.x, h.y, 12, 'star'); sfx('heal'); floatText(h.x, h.y - 70, 'Bersih!', SKY, true); }
  else if (pickSpell === 'api') { var fa = aimDir(800); h.face = fa.x >= 0 ? 1 : -1; G.proj.push({ kind: 'fireball', x: h.x, y: h.y - 30, vx: fa.x * 900, vy: fa.y * 900, life: 0.9, dmg: 200 + h.lvl * 25, src: h, team: 0 }); sfx('dash'); }
  else { h.shield = Math.max(h.shield, h.max * 0.3); G.buffs.aegis = 4; sfx('heal'); }
  return true;
}
function upSkill(n) {
  var h = G.hero; if (h.pts <= 0) return false;
  var max = n === 2 ? 3 : 5; if (h.sl[n] >= max || h.sl[n] === 0) return false;
  if (n === 2 && h.lvl < 4 * (h.sl[2] + 1)) { toast('Ultimate tahap ' + (h.sl[2] + 1) + ' perlukan Clawd Tahap ' + 4 * (h.sl[2] + 1) + '.'); return false; }
  h.pts--; h.sl[n]++; sfx('lvl'); floatText(h.x, h.y - 80, HEROES[h.id].sk[n].n + ' Lv ' + h.sl[n], '#7a4a9a', true); return true;
}
function canUp(n) { var h = G.hero; if (h.pts <= 0 || h.sl[n] === 0) return false; if (n === 2) return h.sl[2] < 3 && h.lvl >= 4 * (h.sl[2] + 1); return h.sl[n] < 5; }

/* tarik / tolak musuh (bukan menara atau Raja Comot) */
function pullAround(x, y, R, k, opt) { G.units.forEach(function (u) { if (!alive(u) || u.team === 0 || u.kind === 'boss' || (u.kind === 'monster' && !u.aggro)) return; var dx = x - u.x, dy = y - u.y, d = Math.hypot(dx, dy); if (d > R + u.r) return; var keep = Math.max(50, d * (1 - k)); if (d > 1) { u.x = x - dx / d * keep; u.y = y - dy / d * keep; } hurt(u, opt.dmg, G.hero, { stun: opt.stun, slow: opt.slow, skill: true }); }); }
function pushAround(x, y, R, dist, opt) { G.units.forEach(function (u) { if (!alive(u) || u.team === 0 || u.kind === 'boss' || (u.kind === 'monster' && !u.aggro)) return; var dx = u.x - x, dy = u.y - y, d = Math.hypot(dx, dy) || 1; if (d > R + u.r) return; u.x = Math.max(40, Math.min(WS - 40, u.x + dx / d * dist)); u.y = Math.max(60, Math.min(WS - 30, u.y + dy / d * dist)); hurt(u, opt.dmg, G.hero, { stun: opt.stun, skill: true }); }); }
