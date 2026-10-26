/* Arena Clawd: kemas kini dunia */
'use strict';
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
  G.waveT -= dt; if (G.waveT <= 0) { G.waveT = 28; spawnWave(); if (G.waveN === 1) toast('Askar sudah keluar! Ikut mereka ke lorong.'); }
  var nMin = G.units.length;
  G.queue = G.queue.filter(function (s) { if (s.at <= G.t) { if (nMin < 160) { spawnMinion(s); nMin++; } return false; } return true; });
  if (!h.dead) { G.qT -= dt; if (G.qT <= 0) { G.qT = 60 + Math.random() * 15; ask('kilat'); return; } }
  for (var b in G.buffs) if (G.buffs[b] > 0) G.buffs[b] -= dt;
  if (G.alarmT > 0) G.alarmT -= dt;
  G.gold += dt * 1.6;
  if (h.dead) { h.respT -= dt; if (h.respT <= 0) respawn(); }
  else heroStep(h, dt);
  G.units.forEach(function (u) {
    if (u.hitT > 0) u.hitT -= dt;
    if (u.catT > 0) u.catT -= dt;
    if (u.burnT > 0 && alive(u)) { u.burnT -= dt; if (Math.random() < dt * 3) { hurt(u, 18 * 0.33 + atkPower() * 0.05, h); G.fx.push({ kind: 'p', type: 'fire', x: u.x, y: u.y - 20, vx: 0, vy: -50, t: 0, life: 0.5, r: 3, rot: 0 }); } }
    if (u.slowT > 0) u.slowT -= dt;
    if (u.stunT > 0) { u.stunT -= dt; return; }
    if (u.kind === 'minion' && alive(u)) minionStep(u, dt);
    else if (u.kind === 'boss' && alive(u)) bossStep(u, dt);
    else if (u.kind === 'monster') monsterStep(u, dt);
    else if (u.kind === 'rival') rivalStep(u, dt);
  });
  separate();
  G.units = G.units.filter(function (u) { return u.kind !== 'minion' || u.hp > 0; });
  G.structs.forEach(function (s) { if (s.hitT > 0) s.hitT -= dt; if (s.kind === 'mini') { s.life -= dt; if (s.life <= 0 && s.hp > 0) { s.hp = 0; burst(s.x, s.y, 8, 'chip'); } } if (s.hp > 0) turretStep(s, dt); });
  G.structs = G.structs.filter(function (s) { return s.kind !== 'mini' || s.hp > 0; });
  G.feed.forEach(function (f) { f.t += dt; }); G.feed = G.feed.filter(function (f) { return f.t < 5; });
  G.misiT -= dt; if (G.misiT <= 0) { G.misiT = 1; cekMisi(); }
  G.proj = G.proj.filter(function (p) { return projStep(p, dt); });
}
function heroStep(h, dt) {
  if (h.invis > 0) { h.invis -= dt; if (h.invis <= 0) G.buffs.halimunan = 0; }
  for (var i = 0; i < 3; i++) if (h.cd[i] > 0) h.cd[i] = Math.max(0, h.cd[i] - dt);
  if (h.spellCd > 0) h.spellCd = Math.max(0, h.spellCd - dt);
  if (h.atkT > 0) h.atkT -= dt; if (h.atkAnim > 0) h.atkAnim -= dt;
  if (h.shield > 0 && !(G.buffs.aegis > 0) && !(G.buffs.penyu > 0) && !(G.buffs.tembok > 0)) h.shield = Math.max(0, h.shield - h.max * 0.05 * dt);
  h.hp = Math.min(h.max, h.hp + h.max * ((G.buffs.biru > 0 ? 0.012 : 0.004) + (G.bakat === 'tabah' && h.hp < h.max * 0.4 ? 0.012 : 0)) * dt);
  if (h.dance) { danceStep(h, dt); return; }
  if (h.leap) {
    var L = h.leap; L.t += dt; var k = Math.min(1, L.t / L.dur); h.x = L.x0 + (L.x1 - L.x0) * k; h.y = L.y0 + (L.y1 - L.y0) * k; h.z = Math.sin(k * Math.PI) * 120;
    if (k >= 1) { h.leap = null; h.z = 0; sfx('slam'); shake = 1; G.fx.push({ kind: 'quake', x: h.x, y: h.y, t: 0, r: 230 }); burst(h.x, h.y, 24, 'chip'); areaDmg(h.x, h.y, 230, skillDmg(170, 2, 2), { stun: 1.3 }); }
    return;
  }
  if (h.dash) {
    var D = h.dash; D.t -= dt; h.x += D.vx * dt; h.y += D.vy * dt; collide(h);
    G.fx.push({ kind: 'ghost', x: h.x, y: h.y, t: 0, face: h.face });
    if (D.hits) enemiesOf(0).forEach(function (u) { if (D.hits.indexOf(u) >= 0 || u.kind === 'turret' || u.kind === 'core') return; if (Math.hypot(u.x - h.x, u.y - h.y) < u.r + 50) { D.hits.push(u); hurt(u, D.dmg, h, { slow: D.slow, stun: D.stun, skill: true }); burst(u.x, u.y, 4, 'star'); } });
    if (D.t <= 0) h.dash = null;
    return;
  }
  if (h.recall > 0) {
    if (Math.hypot(G.input.x, G.input.y) > 0.12 || G.input.atk) { h.recall = 0; toast('Balik dibatalkan.'); }
    else { h.recall += dt; if (h.recall >= 3) { h.recall = 0; G.fx.push({ kind: 'blink', x: h.x, y: h.y, t: 0 }); h.x = 330; h.y = 1680; G.fx.push({ kind: 'blink', x: h.x, y: h.y, t: 0 }); sfx('blink'); } return; }
  }
  if (h.stunT > 0) { h.moving = false; return; }
  var ix = G.input.x, iy = G.input.y, m = Math.hypot(ix, iy);
  h.moving = m > 0.12;
  if (h.moving) {
    if (m > 1) { ix /= m; iy /= m; }
    var sp = h.spd * (G.buffs.laju > 0 ? 1.3 : 1) * (G.buffs.pecut > 0 ? 1.6 : 1) * (h.slowT > 0 ? 0.6 : 1) * (G.buffs.halimunan > 0 ? 1.3 : 1);
    h.x += ix * sp * dt; h.y += iy * sp * dt; if (Math.abs(ix) > 0.2) h.face = ix > 0 ? 1 : -1;
    collide(h);
    if (G.buffs.pecut > 0 && Math.random() < 0.5) G.fx.push({ kind: 'ghost', x: h.x, y: h.y, t: 0, face: h.face });
  }
  if (G.input.atk || !h.moving) heroAttack();
  if (Math.hypot(h.x - BASE0.x, h.y - BASE0.y) < 250 && h.hp < h.max) { h.hp = Math.min(h.max, h.hp + h.max * 0.22 * dt); if (Math.random() < dt * 4) G.fx.push({ kind: 'plus', x: h.x + (Math.random() - 0.5) * 40, y: h.y - 20, t: 0 }); }
}
function collide(h) {
  h.x = Math.max(40, Math.min(WS - 40, h.x)); h.y = Math.max(60, Math.min(WS - 30, h.y));
  TREES.forEach(function (t) { var dx = h.x - t.x, dy = h.y - t.y, d = Math.hypot(dx, dy), md = t.r + h.r * 0.7; if (d < md && d > 0) { h.x = t.x + dx / d * md; h.y = t.y + dy / d * md; } });
  G.structs.concat([G.boss]).forEach(function (s) { if (!alive(s) || s.kind === 'mini') return; var dx = h.x - s.x, dy = h.y - s.y, d = Math.hypot(dx, dy), md = s.r + h.r; if (d < md && d > 0) { h.x = s.x + dx / d * md; h.y = s.y + dy / d * md; } });
}
function spd(u) { return u.spd * (u.slowT > 0 ? 0.55 : 1); }
function moveUnit(u, x, y, dt, sp) { var dx = x - u.x, dy = y - u.y, d = Math.hypot(dx, dy); if (d < 1) return d; var s = Math.min(d, (sp || spd(u)) * dt); u.x += dx / d * s; u.y += dy / d * s; if (Math.abs(dx) > 2) u.face = dx > 0 ? 1 : -1; return d; }
function minionStep(u, dt) {
  u.atkT -= dt; u.scanT -= dt;
  if (u.scanT <= 0) { u.scanT = 0.3; u.target = findTarget(u, u.range + 150); }
  var t = u.target;
  if (alive(t)) {
    var d = Math.hypot(t.x - u.x, t.y - u.y) - t.r;
    if (d > u.range) moveUnit(u, t.x, t.y, dt);
    else if (u.atkT <= 0) { u.atkT = u.ranged ? 1.3 : 1.0; u.atk = 0.15; if (u.ranged) G.proj.push({ kind: u.team ? 'drop' : 'pellet', x: u.x, y: u.y - 14, target: t, spd: 520, dmg: u.dmg, src: u, team: u.team, small: true }); else hurt(t, u.dmg * (u.team === 0 && G.buffs.semangat > 0 ? 1.5 : 1), u); }
    if (u.atk > 0) u.atk -= dt;
    return;
  }
  u.target = null;
  var wp = u.path[u.wi]; if (!wp) return;
  if (moveUnit(u, wp[0], wp[1], dt) < 24 && u.wi < u.path.length - 1) u.wi++;
}
function monsterStep(m, dt) {
  var M = MON[m.type], h = G.hero;
  if (m.dead) { m.respT -= dt; if (m.respT <= 0) { m.dead = false; m.hp = m.max; m.x = m.hx; m.y = m.hy; if (m.type === 'penyu') banner('Penyu Dakwat muncul di sungai!'); if (m.type === 'naga') { banner('Naga Tinta muncul di sungai kiri!'); pushFeed('Naga Tinta muncul', '#3f8f86'); } } return; }
  var leash = Math.hypot(m.x - m.hx, m.y - m.hy) > 380 || h.dead || Math.hypot(h.x - m.hx, h.y - m.hy) > 520;
  if (m.aggro && leash) { m.aggro = false; }
  m.moving = false;
  if (!m.aggro) { if (Math.hypot(m.x - m.hx, m.y - m.hy) > 4) { moveUnit(m, m.hx, m.hy, dt, 220); m.moving = true; } m.hp = Math.min(m.max, m.hp + m.max * 0.25 * dt); return; }
  if (m.type === 'kelomang') { var dx = m.x - h.x, dy = m.y - h.y, d = Math.hypot(dx, dy) || 1; if (Math.hypot(m.x - m.hx, m.y - m.hy) < 160) { m.x += dx / d * 70 * dt; m.y += dy / d * 70 * dt; m.moving = true; } return; }
  m.atkT -= dt;
  if (m.type === 'penyu' || m.type === 'naga') {
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
      var b = us[j]; if (b.hp <= 0 || b.kind === 'boss' || b.kind === 'monster') continue;
      var dx = b.x - a.x, dy = b.y - a.y, d = dx * dx + dy * dy, md = a.r + b.r;
      if (d < md * md && d > 0.01) { d = Math.sqrt(d); var p = (md - d) / 2, nx = dx / d, ny = dy / d; a.x -= nx * p; a.y -= ny * p; if (b.kind === 'minion') { b.x += nx * p; b.y += ny * p; } }
    }
  }
}
function turretStep(s, dt) {
  s.cdT -= dt;
  var t = s.target;
  if (!alive(t) || Math.hypot(t.x - s.x, t.y - s.y) - t.r > s.range) {
    t = null; var bd = s.range;
    G.units.forEach(function (u) { if (u.team === s.team || u.team === 2 || !alive(u) || (u.kind !== 'minion' && !(s.kind === 'mini' && u.kind === 'rival'))) return; var d = Math.hypot(u.x - s.x, u.y - s.y) - u.r; if (d < bd) { bd = d; t = u; } });
    if (!t && s.team === 1) { var h = G.hero; if (alive(h) && !(h.invis > 0) && Math.hypot(h.x - s.x, h.y - s.y) - h.r < s.range) t = h; }
    if (!t && s.team === 0) { var rv = G.rival; if (alive(rv) && Math.hypot(rv.x - s.x, rv.y - s.y) - rv.r < s.range) t = rv; }
    s.target = t;
  }
  if (t && s.cdT <= 0) {
    s.cdT = s.kind === 'mini' ? 0.8 : 1.2; var dmg = s.kind === 'mini' ? s.dmg : (t.kind === 'hero' ? Math.min(110, 55 + G.t * 0.06) : (t.kind === 'rival' ? 130 + G.t * 0.08 : 85));
    G.fx.push({ kind: 'beam', x1: s.x, y1: s.y - (s.kind === 'mini' ? 34 : 64), x2: t.x, y2: t.y - 14, t: 0, col: s.kind === 'mini' ? '#5aa6a0' : (s.team ? '#6b7fb0' : '#f2b04a') });
    hurt(t, dmg, s); if (onScreen(s.x, s.y)) sfx('zap', 120);
  }
}
function bossStep(b, dt) {
  var h = G.hero, near = alive(h) && Math.hypot(h.x - b.x, h.y - b.y) < 520;
  b.atkT -= dt; b.slamT -= dt; b.sumT -= dt;
  if (b.tele > 0) { b.tele -= dt; if (b.tele <= 0) { sfx('slam'); shake = 0.8; G.fx.push({ kind: 'ring', x: b.x, y: b.y, t: 0, r: 240 }); G.units.concat(G.structs).forEach(function (u) { if (u.team === 0 && alive(u) && Math.hypot(u.x - b.x, u.y - b.y) < 240 + u.r) hurt(u, u.kind === 'hero' ? 120 : 110, b); }); } }
  var t = findTarget(b, b.range, true);
  if (t && b.atkT <= 0) { b.atkT = 1.5; G.proj.push({ kind: 'drop', x: b.x, y: b.y - 40, target: t, spd: 480, dmg: t.kind === 'hero' ? 65 : 60, src: b, team: 1, big: true }); }
  if (near && b.slamT <= 0 && b.tele <= 0) { b.slamT = 4.5; b.tele = 1.1; }
  if (near && b.sumT <= 0) { b.sumT = 14; for (var i = 0; i < 2; i++) G.units.push({ kind: 'minion', team: 1, ranged: false, x: b.x - 90 + i * 50, y: b.y + 90, r: 15, hp: 300, max: 300, dmg: 20, range: 52, spd: 115, path: LANES.tengah.slice().reverse(), wi: 1, atkT: 0.5, scanT: 0, target: null, hitT: 0, i: i, face: -1, lane: 'tengah', stunT: 0, slowT: 0, burnT: 0 }); floatText(b.x, b.y - 100, 'Askar, serang!', NAVY, true); }
}
function projStep(p, dt) {
  if (p.kind === 'inkblob' || p.kind === 'fireball') {
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    G.fx.push({ kind: 'dot', x: p.x, y: p.y, t: 0, col: p.kind === 'inkblob' ? PLUM : '#e2733b' });
    var foes = p.team === 1 ? G.units.concat(G.structs).filter(function (u) { return u.team === 0 && alive(u) && u.kind !== 'core' && u.kind !== 'turret'; }) : G.units.filter(function (u) { return u.team === 1 && alive(u) && u.kind !== 'boss'; });
    for (var q = 0; q < foes.length; q++) { var u = foes[q]; if (Math.hypot(u.x - p.x, u.y - 14 - p.y) < u.r + 20) {
      if (p.kind === 'inkblob') { hurt(u, u.kind === 'hero' ? p.dmg : p.dmg * 0.7, p.src, { slow: 1.2 }); burst(p.x, p.y, 8, 'ink'); }
      else { var vl = Math.hypot(p.vx, p.vy) || 1; u.x = Math.max(40, Math.min(WS - 40, u.x + p.vx / vl * 110)); u.y = Math.max(60, Math.min(WS - 30, u.y + p.vy / vl * 110)); hurt(u, p.dmg, p.src, { skill: true }); burst(p.x, p.y, 12, 'fire'); sfx('boom'); }
      return false; } }
    return p.life > 0;
  }
  if (p.kind === 'bomb') {
    p.t += dt; var kb = Math.min(1, p.t / p.dur); p.x = p.x0 + (p.x1 - p.x0) * kb; p.y = p.y0 + (p.y1 - p.y0) * kb - Math.sin(kb * Math.PI) * 120;
    if (kb >= 1) { G.fx.push({ kind: 'explode', x: p.x1, y: p.y1, t: 0, r: 125 }); burst(p.x1, p.y1, 14, 'fire'); areaDmg(p.x1, p.y1, 125, p.dmg, { stun: 0.6 }); sfx('boom'); shake = Math.max(shake, 0.3); return false; }
    return true;
  }
  if (p.kind === 'rocket' && p.delay > 0) { p.delay -= dt; return true; }
  if (p.kind === 'rocket' && !alive(p.target)) { var nt = findTarget({ x: p.x, y: p.y, team: 0, kind: 'rocket' }, 500); if (!nt) return false; p.target = nt; }
  if (p.kind === 'boomer') {
    p.t += dt;
    if (p.t > p.out) { var h0 = G.hero, bx = h0.x - p.x, by = h0.y - 26 - p.y, bl = Math.hypot(bx, by) || 1; p.vx = bx / bl * 900; p.vy = by / bl * 900; if (bl < 30 || p.t > 1.8) return false; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    var hl = p.t > p.out ? p.hits2 : p.hits;
    enemiesOf(0).forEach(function (u) { if (hl.indexOf(u) >= 0 || u.kind === 'core') return; if (Math.hypot(u.x - p.x, u.y - 14 - p.y) < u.r + 22) { hl.push(u); hurt(u, p.dmg, p.src, { skill: true }); burst(p.x, p.y, 4, 'star'); } });
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
  var tx = t.x, ty = t.y - (t.kind === 'turret' ? 40 : 14), dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy), s = p.spd * dt;
  p.ang = Math.atan2(dy, dx);
  if (d <= s + 4) { if (p.aoe) { G.fx.push({ kind: 'explode', x: tx, y: ty, t: 0, r: p.aoe }); areaDmg(tx, ty + 14, p.aoe, p.dmg, {}); sfx('star', 80); return false; } hurt(t, p.dmg, p.src, p.opt); if (p.src === G.hero) { burst(tx, ty, p.emp ? 6 : 3, 'star'); sfx('hit', 70); } return false; }
  p.x += dx / d * s; p.y += dy / d * s; return true;
}
function fxStep(f, dt) {
  f.t += dt;
  if (f.kind === 'star') { if (f.t >= 0.45 && !f.done) { f.done = true; areaDmg(f.x, f.y, f.r, f.dmg, {}); burst(f.x, f.y, 8, 'star'); sfx('star', 90); shake = Math.max(shake, 0.25); } return f.t < 0.8; }
  if (f.kind === 'storm') { if (f.t >= 0.35 && !f.done) { f.done = true; areaDmg(f.x, f.y, f.r, f.dmg, { stun: 0.5 }); sfx('thunder', 90); shake = Math.max(shake, 0.3); } return f.t < 0.9; }
  if (f.kind === 'mud') { f.tick -= dt; if (f.tick <= 0) { f.tick = 0.5; areaDmg(f.x, f.y, f.r, f.dmg, { slow: 0.8 }); } return f.t < 4; }
  if (f.kind === 'volley') { if (f.t >= 0.3 && !f.done) { f.done = true; areaDmg(f.x, f.y, f.r, f.dmg, { slow: 1.2 }); sfx('slash', 60); } return f.t < 0.6; }
  var life = { fort: 0.6, bloom: 0.8, ghostR: 0.3, beam: 0.18, spin: 0.45, ring: 0.5, dot: 0.35, plus: 0.6, slash: 0.22, ghost: 0.3, wind: 0.5, bolt: 0.35, explode: 0.45, quake: 0.7, pillar: 0.9, blink: 0.4 }[f.kind];
  if (life) return f.t < life;
  if (f.kind === 'p') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.g || 0) * dt; f.vx *= 0.96; return f.t < f.life; }
  return false;
}
function burst(x, y, n, type) { if (!G) return; for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = 60 + Math.random() * 170; G.fx.push({ kind: 'p', type: type, x: x, y: y - 14, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: type === 'chip' ? 300 : 0, t: 0, life: 0.4 + Math.random() * 0.5, r: 2 + Math.random() * 4, rot: Math.random() * 6 }); } }
function floatText(x, y, s, col, big) { if (G && G.floats.length < 90) G.floats.push({ x: x, y: y, s: String(s), col: col || INK, life: 1, big: big }); }
var toastT = 0;
function toast(html) { var t = document.getElementById('toast'); t.innerHTML = html; t.hidden = false; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = ''; toastT = 2.8; }


/* Tarian Pisau: melompat antara sasaran */
function danceStep(h, dt) {
  var D = h.dance; D.t -= dt; if (D.t > 0) return;
  while (D.i < D.list.length * 2 && !alive(D.list[D.i % D.list.length])) D.i++;
  if (D.i >= D.list.length * 2) { h.dance = null; return; }
  var u = D.list[D.i % D.list.length]; D.i++; D.t = 0.13;
  G.fx.push({ kind: 'ghost', x: h.x, y: h.y, t: 0, face: h.face });
  var ang = D.i * 2.1; h.x = u.x + Math.cos(ang) * (u.r + 26); h.y = u.y + Math.sin(ang) * (u.r + 14); h.face = u.x >= h.x ? 1 : -1;
  G.fx.push({ kind: 'slash', x: u.x, y: u.y - 16, t: 0, a: ang, col: '#c9b8f0' }); hurt(u, D.dmg, h, { skill: true }); sfx('slash', 50);
}
/* misi dalam game */
function cekMisi() {
  MISI.forEach(function (m) { if (G.misi[m.id] || (m.lawan && G.lawan === 'tiada')) return; if (m.cek()) { G.misi[m.id] = true; G.gold += m.emas; banner('Misi selesai: ' + m.t); sfx('win'); pushFeed('Misi +' + m.emas + ' syiling', '#a87516'); } });
}
