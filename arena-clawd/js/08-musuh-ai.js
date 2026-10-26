/* Arena Clawd: Pendekar Comot, hero lawan dikawal AI.
   Sengaja tidak terlalu sukar: berfikir setiap ~0.4-0.55 s, tidak meramal gerak Clawd,
   ultimate sentiasa diberi amaran bulatan merah, dan lari balik bila nyawa rendah. */
'use strict';
var RIVAL_HOME = { x: 1670, y: 330 };

function rivalStats(lvl) { var L = LAWAN[G.lawan]; return { max: (820 + lvl * 85) * L.hp, atk: (26 + lvl * 4.5) * L.dmg }; }
function spawnRival() {
  var R = { kind: 'rival', team: 1, x: RIVAL_HOME.x, y: RIVAL_HOME.y, r: 22, lvl: 1, hp: 0, max: 0, atk: 0, range: 200, spd: 225, face: -1, atkT: 1, atkAnim: 0,
    cd: [4, 8, 20], think: 0, lane: 'tengah', laneT: 0, goal: null, foe: null, dead: false, respT: 0, hitT: 0, stunT: 0, slowT: 0, catT: 0, kills: 0, deaths: 0, tele: null, lastHit: null, lari: false, moving: false, i: 3 };
  rivalLevel(R); R.hp = R.max; G.rival = R; G.units.push(R);
}
function rivalLevel(R) { var s = rivalStats(R.lvl), ratio = R.max ? R.hp / R.max : 1; R.max = s.max; R.atk = s.atk; R.hp = Math.min(R.max, ratio * R.max); }
function d2(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function ourTowerCovers(x, y, pad) { return G.structs.some(function (s) { return s.team === 0 && s.hp > 0 && s.kind !== 'mini' && Math.hypot(s.x - x, s.y - y) < s.range + (pad || 0); }); }
function ownMinionNear(x, y, R) { return G.units.some(function (u) { return u.kind === 'minion' && u.team === 1 && alive(u) && Math.hypot(u.x - x, u.y - y) < R; }); }

function rivalStep(R, dt) {
  var L = LAWAN[G.lawan], h = G.hero;
  if (R.dead) { R.respT -= dt; if (R.respT <= 0) { R.dead = false; R.hp = R.max; R.x = RIVAL_HOME.x; R.y = RIVAL_HOME.y; R.lari = false; R.tele = null; pushFeed('Pendekar Comot kembali ke arena', RIVAL); } return; }
  var cap = Math.min(15, h.lvl + (G.lawan === 'seimbang' ? 1 : 0)), tl = Math.max(1, Math.min(cap, 1 + Math.floor(G.t / 50)));
  if (tl > R.lvl) { R.lvl = tl; rivalLevel(R); if (onScreen(R.x, R.y)) floatText(R.x, R.y - 80, 'Tahap ' + R.lvl, RIVAL, true); }
  for (var i = 0; i < 3; i++) if (R.cd[i] > 0) R.cd[i] -= dt;
  if (R.atkT > 0) R.atkT -= dt; if (R.atkAnim > 0) R.atkAnim -= dt;
  /* ultimate: amaran dulu, baru meletup */
  if (R.tele) { R.tele.t -= dt; if (R.tele.t <= 0) { var T = R.tele; R.tele = null; sfx('slam'); shake = Math.max(shake, 0.5); G.fx.push({ kind: 'ring', x: T.x, y: T.y, t: 0, r: T.r }); G.units.concat(G.structs).forEach(function (u) { if (u.team === 0 && alive(u) && Math.hypot(u.x - T.x, u.y - T.y) < T.r + u.r) hurt(u, u.kind === 'hero' ? T.dmg : T.dmg * 0.6, R, { slow: 1.5 }); }); } }
  if (d2(R, RIVAL_HOME) < 260) R.hp = Math.min(R.max, R.hp + R.max * 0.2 * dt);
  else R.hp = Math.min(R.max, R.hp + R.max * 0.006 * dt);
  if (R.hp < R.max * L.lari) { if (!R.lari && onScreen(R.x, R.y)) floatText(R.x, R.y - 80, 'Lari!', RIVAL, true); R.lari = true; }
  if (R.lari && R.hp >= R.max * 0.92) R.lari = false;
  R.think -= dt;
  if (R.think <= 0) { R.think = L.react * (0.85 + Math.random() * 0.3); rivalDecide(R, L); }
  var foe = R.foe, dH = alive(h) ? d2(R, h) : 1e9;
  /* skill */
  if (!R.lari && foe === h && alive(h)) {
    if (R.cd[0] <= 0 && dH < 500) { R.cd[0] = 7; var dx = h.x - R.x, dy = h.y - R.y, dl = Math.hypot(dx, dy) || 1; R.face = dx >= 0 ? 1 : -1; R.atkAnim = 0.3; G.proj.push({ kind: 'inkblob', x: R.x, y: R.y - 30, vx: dx / dl * 560, vy: dy / dl * 560, life: 1, r: 22, dmg: R.atk * 1.6 * L.skill, src: R, team: 1 }); if (onScreen(R.x, R.y)) sfx('shot'); }
    if (G.lawan === 'seimbang' && R.cd[1] <= 0 && dH > 210 && dH < 380) { R.cd[1] = 12; rivalDash(R, h.x, h.y, 200); }
    if (R.lvl >= 4 && R.cd[2] <= 0 && dH < 430) { R.cd[2] = G.lawan === 'seimbang' ? 30 : 40; R.tele = { x: h.x, y: h.y, r: 165, t: 1.15, dmg: R.atk * 3 * L.skill }; floatText(h.x, h.y - 90, 'Elak bulatan merah!', '#d9534a', true); }
  }
  if (R.lari && R.cd[1] <= 0 && dH < 330) { R.cd[1] = 12; rivalDash(R, RIVAL_HOME.x, RIVAL_HOME.y, 240); }
  if (R.dash) { var D = R.dash; D.t -= dt; R.x += D.vx * dt; R.y += D.vy * dt; R.x = Math.max(40, Math.min(WS - 40, R.x)); R.y = Math.max(60, Math.min(WS - 30, R.y)); G.fx.push({ kind: 'ghostR', x: R.x, y: R.y, t: 0, face: R.face }); if (D.t <= 0) R.dash = null; return; }
  /* serang atau gerak */
  if (alive(foe) && !(foe.kind === 'hero' && hidden(foe, R))) {
    var reach = Math.hypot(foe.x - R.x, foe.y - R.y) - foe.r;
    if (reach <= R.range) {
      R.moving = false; R.face = foe.x >= R.x ? 1 : -1;
      if (R.atkT <= 0) { R.atkT = 1.15; R.atkAnim = 0.25; G.proj.push({ kind: 'rivalshot', x: R.x + R.face * 16, y: R.y - 34, target: foe, spd: 720, dmg: foe.kind === 'hero' ? R.atk : R.atk * 1.4, src: R, team: 1 }); }
      return;
    }
    if (!R.lari) { steer(R, foe.x, foe.y, dt); return; }
  }
  if (R.goal) { if (d2(R, R.goal) > 20) steer(R, R.goal.x, R.goal.y, dt); else R.moving = false; }
}
function rivalDash(R, tx, ty, dist) { var dx = tx - R.x, dy = ty - R.y, d = Math.hypot(dx, dy) || 1, k = Math.min(dist, d) / 0.2; R.face = dx >= 0 ? 1 : -1; R.dash = { vx: dx / d * k, vy: dy / d * k, t: 0.2 }; if (onScreen(R.x, R.y)) sfx('dash'); }
/* gerak dengan elak pokok: cuba arah lurus, kemudian sudut ±35°, ±70° */
function steer(R, tx, ty, dt) {
  var dx = tx - R.x, dy = ty - R.y, d = Math.hypot(dx, dy); if (d < 2) return;
  var base = Math.atan2(dy, dx), sp = spd(R) * dt, tries = [0, 0.6, -0.6, 1.2, -1.2, 1.8, -1.8];
  for (var k = 0; k < tries.length; k++) {
    var a = base + tries[k], nx = R.x + Math.cos(a) * 28, ny = R.y + Math.sin(a) * 28;
    if (!TREES.some(function (t) { return Math.hypot(nx - t.x, ny - t.y) < t.r + 14; })) { R.x += Math.cos(a) * Math.min(sp, d); R.y += Math.sin(a) * Math.min(sp, d); R.face = Math.cos(a) >= 0 ? 1 : -1; R.moving = true; return; }
  }
  R.x += dx / d * sp; R.y += dy / d * sp; R.moving = true;
}
function rivalDecide(R, L) {
  var h = G.hero, heroOk = alive(h) && !hidden(h, R), dH = heroOk ? d2(R, h) : 1e9;
  if (R.lari) { R.foe = null; R.goal = RIVAL_HOME; return; }
  var brave = G.lawan === 'seimbang' ? 0.25 : 0.05, chase = G.lawan === 'seimbang' ? 430 : 340;
  if (heroOk && dH < chase && !ourTowerCovers(h.x, h.y, 20) && h.hp / h.max < R.hp / R.max + brave) { R.foe = h; R.goal = { x: h.x, y: h.y }; return; }
  /* pilih lorong: biasanya lorong Clawd supaya mereka bertembung */
  R.laneT -= L.react;
  if (R.laneT <= 0) { R.laneT = 18 + Math.random() * 10; if (alive(h) && Math.random() < 0.75) { var bl = 'tengah', bd = 1e9; LANE_IDS.forEach(function (k) { var Ln = LANES[k], m = 1e9; for (var j = 0; j < Ln.length - 1; j++) m = Math.min(m, distSeg(h.x, h.y, Ln[j][0], Ln[j][1], Ln[j + 1][0], Ln[j + 1][1])); if (m < bd) { bd = m; bl = k; } }); R.lane = bl; } else R.lane = LANE_IDS[ri(0, 2)]; }
  /* barisan depan: minion kita (pasukan Comot) paling jauh di lorong ini */
  var front = null, fd = -1, path = LANES[R.lane].slice().reverse();
  G.units.forEach(function (u) { if (u.kind === 'minion' && u.team === 1 && alive(u) && u.lane === R.lane) { var prog = u.wi * 10000 - Math.hypot(u.x - (path[u.wi] || path[0])[0], u.y - (path[u.wi] || path[0])[1]); if (prog > fd) { fd = prog; front = u; } } });
  var goal;
  if (front) goal = { x: front.x + (RIVAL_HOME.x - front.x) * 0.08, y: front.y + (RIVAL_HOME.y - front.y) * 0.08 };
  else { var tw = G.structs.filter(function (s) { return s.kind === 'turret' && s.team === 1 && s.lane === R.lane && s.hp > 0; }).sort(function (a, b) { return a.tier - b.tier; })[0]; goal = tw ? { x: tw.x + (RIVAL_HOME.x - tw.x) * 0.15, y: tw.y + (RIVAL_HOME.y - tw.y) * 0.15 + 40 } : { x: RIVAL_HOME.x, y: RIVAL_HOME.y }; }
  /* jangan masuk julat menara Clawd tanpa minion pelindung */
  G.structs.forEach(function (s) { if (s.team !== 0 || s.hp <= 0 || s.kind === 'mini') return; var dd = Math.hypot(goal.x - s.x, goal.y - s.y), safe = s.range + 40; if (dd < safe && !ownMinionNear(s.x, s.y, s.range)) { var k = safe / (dd || 1); goal = { x: s.x + (goal.x - s.x) * k, y: s.y + (goal.y - s.y) * k }; } });
  R.goal = goal;
  /* sasaran dekat: minion/menara mini Clawd, atau Clawd sendiri bila dekat sekali */
  var foe = null, best = R.range + 120;
  G.units.concat(G.structs).forEach(function (u) { if (u.team !== 0 || !alive(u) || u.kind === 'core' || (u.kind === 'turret' && !ownMinionNear(u.x, u.y, u.range)) || (u.kind === 'hero' && hidden(u, R))) return; var d = d2(u, R) - u.r - (u.kind === 'hero' ? 40 : 0); if (d < best) { best = d; foe = u; } });
  if (foe && foe.kind !== 'turret' && ourTowerCovers(foe.x, foe.y, 0) && !ownMinionNear(foe.x, foe.y, 260)) foe = null;
  R.foe = foe;
}
function rivalDown(R, src) {
  var h = G.hero, byHero = src === h || R.lastHit === h;
  R.dead = true; R.hp = 0; R.deaths++; R.tele = null; R.dash = null; R.respT = 9 + R.lvl * 0.8; R.foe = null;
  burst(R.x, R.y, 26, 'ink'); burst(R.x, R.y, 12, 'star'); sfx('boom'); shake = Math.max(shake, 0.6);
  if (byHero && !h.dead) { G.rk++; gainXp(120 + R.lvl * 15); gainGold(240 + R.lvl * 10, R.x, R.y, true); banner(G.rk === 1 ? 'Darah Pertama! Pendekar Comot tumbang' : (G.rk === 3 ? 'Hebat! Pendekar tumbang 3 kali' : 'Pendekar Comot tumbang!')); pushFeed('Clawd tumbangkan Pendekar Comot', CL); }
  else { G.gold += 100; pushFeed('Pendekar Comot tumbang', CL); }
}
