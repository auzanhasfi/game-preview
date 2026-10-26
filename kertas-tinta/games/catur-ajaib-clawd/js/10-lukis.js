/* Catur Ajaib Clawd: lukisan papan 8×8 + bangku, hero, monster Comot, proyektil, efek */
'use strict';
var cv = document.getElementById('cv'), CW = 0, CH = 0, DPR = 1, LY = { cell: 50, ox: 0, oy: 0, by: 0 }, time = 0;
ctx = cv.getContext('2d');
function resize() {
  var r = cv.getBoundingClientRect(); DPR = Math.min(2, window.devicePixelRatio || 1);
  CW = Math.max(200, r.width); CH = Math.max(200, r.height);
  cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR);
  var cell = Math.min(CW / 8.3, CH / 9.75);
  LY.cell = cell; LY.ox = (CW - cell * 8) / 2; LY.oy = Math.max(cell * 0.3, (CH - cell * 9.75) / 2 + cell * 0.3); LY.by = LY.oy + cell * 8.35;
}
window.addEventListener('resize', function () { resize(); });
function cx(x) { return LY.ox + (x + 0.5) * LY.cell; }
function cy(y) { return LY.oy + (y + 0.5) * LY.cell; }
function benchX(i) { return LY.ox + (i + 0.5) * LY.cell; }
function benchY() { return LY.by + LY.cell * 0.5; }

/* ---------- efek ---------- */
function popNum(f, txt, col, big) { G.fxs.push({ k: 'num', x: f.x, y: f.y, txt: txt, col: col, big: big, t: 0, life: 0.8, dx: (Math.random() - 0.5) * 0.4 }); }
function burst(x, y, col) { for (var i = 0; i < 10; i++) { var a = Math.random() * 6.28, s = 1 + Math.random() * 2; G.fxs.push({ k: 'dot', x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, col: col, t: 0, life: 0.5 }); } }
function ring(x, y, col, r) { G.fxs.push({ k: 'ring', x: x, y: y, col: col, r: r || 1, t: 0, life: 0.45 }); }
function spark(u) { if (u.b === 'board') ring(u.x, u.y, GOLD, 1.2); }
function updFx(dt) { for (var i = G.fxs.length - 1; i >= 0; i--) { var e = G.fxs[i]; e.t += dt; if (e.k === 'dot') { e.x += e.vx * dt; e.y += e.vy * dt; } if (e.t >= e.life) G.fxs.splice(i, 1); } }

/* ---------- unit ---------- */
function unitScale() { return LY.cell / 46; }
function drawStars(x, y, n, s) {
  for (var i = 0; i < n; i++) { var sx = x + (i - (n - 1) / 2) * 11 * s; ctx.save(); ctx.translate(sx, y); ctx.scale(s * 0.5, s * 0.5); ctx.beginPath(); var P = new Path2D(ICONS.star); ctx.translate(-12, -12); ctx.fillStyle = n === 3 ? '#e2a93b' : n === 2 ? '#c9ccd2' : '#c7895a'; ctx.fill(P); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke(P); ctx.restore(); }
}
function bar(x, y, w, frac, col, h) { h = h || 4; ctx.fillStyle = 'rgba(46,38,32,.25)'; ctx.fillRect(x - w / 2, y, w, h); ctx.fillStyle = col; ctx.fillRect(x - w / 2, y, w * Math.max(0, Math.min(1, frac)), h); ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.strokeRect(x - w / 2, y, w, h); }
function drawHero(px, py, id, star, o) {
  var H = HEROES[id], s = unitScale() * (o.big ? 1.05 : 0.92) * (1 + (star - 1) * 0.08);
  if (o.side === 1) { ctx.fillStyle = 'rgba(194,72,58,.22)'; ctx.beginPath(); ctx.ellipse(px, py + 1, 19 * s, 6 * s, 0, 0, 6.3); ctx.fill(); }
  else if (o.side === 0) { ctx.fillStyle = 'rgba(226,169,59,.25)'; ctx.beginPath(); ctx.ellipse(px, py + 1, 19 * s, 6 * s, 0, 0, 6.3); ctx.fill(); }
  if (o.sel) { ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(px, py + 1, 23 * s, 8 * s, 0, 0, 6.3); ctx.stroke(); ctx.restore(); }
  drawClawd(px, py, { s: s, acc: H.acc, col: o.flash ? '#fff' : H.col, colH: H.colH, face: o.face || 0, t: time + (o.seed || 0), atk: o.atk, run: o.run, mood: o.mood, blink: ((time + (o.seed || 0)) % 4) < 0.12, shadow: false });
  var top = py - (H.acc === 'sihir' || H.acc === 'penjaga' ? 52 : 40) * s;
  drawStars(px, top - 4 * s, star, s);
  return top;
}
function drawCreep(f, px, py) {
  var s = unitScale(), r = f.C.r * s * 1.25;
  drawComot(px, py - r, r, { t: time + f.x, i: f.x * 3, col: f.C.col, stun: f.stun > 0, king: f.id === 'besar', staff: f.id === 'pemanah', flash: f.hitT > 0.07 });
  return py - r * 2.1;
}

/* ---------- papan ---------- */
function drawBoard() {
  var c = LY.cell, x0 = LY.ox, y0 = LY.oy;
  for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) {
    var mine = y >= 4, dark = (x + y) % 2 === 1;
    ctx.fillStyle = mine ? (dark ? '#e6d9bd' : '#f3ead6') : (dark ? '#d3d8de' : '#e4e7ea');
    ctx.fillRect(x0 + x * c, y0 + y * c, c, c);
  }
  /* tepi tinta */
  seed = 1; wobRect(x0, y0, c * 8, c * 8, 11, 0.8); stroke(1.8, INK);
  ctx.beginPath(); ctx.moveTo(x0, y0 + c * 4); ctx.lineTo(x0 + c * 8, y0 + c * 4); ctx.setLineDash([5, 5]); stroke(1.2, 'rgba(46,38,32,.55)'); ctx.setLineDash([]);
  /* bangku */
  for (var i = 0; i < BENCH_N; i++) { ctx.fillStyle = '#efe6d2'; ctx.fillRect(x0 + i * c + 3, LY.by + 3, c - 6, c - 6); ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(46,38,32,.5)'; ctx.strokeRect(x0 + i * c + 3, LY.by + 3, c - 6, c - 6); ctx.setLineDash([]); }
}
function dropTarget(px, py) {
  var c = LY.cell, gx = Math.floor((px - LY.ox) / c), gy = Math.floor((py - LY.oy) / c);
  if (gx >= 0 && gx < 8 && gy >= 0 && gy < 8) return { b: 'board', x: gx, y: gy };
  if (gx >= 0 && gx < 8 && py >= LY.oy + c * 8 && py <= LY.by + c) return { b: 'bench', x: gx, y: 0 };
  return null;
}
function draw() {
  if (!G) return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, CW, CH);
  ctx.drawImage(grain, 0, 0, CW, CH);
  drawBoard();
  var c = LY.cell, me = G.me, list = [];
  if (G.phase === 'tempur' || (G.phase === 'jeda' && G.sim)) {
    G.sim.f.forEach(function (f) { if (!f.dead) list.push({ y: f.y, f: f }); });
    list.sort(function (a, b) { return a.y - b.y; }).forEach(function (o) {
      var f = o.f, px = cx(f.x), py = cy(f.y) + c * 0.32, top;
      if (f.kind === 'creep') top = drawCreep(f, px, py);
      else top = drawHero(px, py, f.id, f.star, { side: f.side, face: f.face, atk: f.atkT > 0, run: f.moving > 0, flash: f.hitT > 0, mood: f.castT > 0 ? 'happy' : null, seed: f.x * 1.7 + f.side });
      var w = c * 0.7; bar(px, top - c * 0.24, w, f.hp / f.max, f.side === 0 ? '#5f9e4a' : RED, Math.max(3, c * 0.07));
      if (f.shield > 1) bar(px, top - c * 0.24 - 3, w * Math.min(1, f.shield / f.max), 1, '#cfd6e6', 2);
      if (f.kind === 'hero') bar(px, top - c * 0.24 + Math.max(3, c * 0.07) + 1, w, f.mana / f.maxMana, '#6f8fd9', Math.max(2, c * 0.04));
      if (f.stun > 0) stunStars(px, top - c * 0.35);
    });
    me.units.forEach(function (u) { if (u.b === 'bench') drawHero(benchX(u.x), benchY() + c * 0.32, u.id, u.star, { side: -1, seed: u.uid }); });
    G.sim.proj.forEach(function (p) {
      var k = p.t / p.dur, x = cx(p.src.x + (p.tg.x - p.src.x) * k), y = cy(p.src.y + (p.tg.y - p.src.y) * k) - c * 0.25;
      if (p.kind === 'hujan') { var yy = cy(p.tg.y) - c * (1.6 - 1.4 * k); star4(cx(p.tg.x), yy, c * 0.15, time * 6, p.side === 0 ? GOLD : '#7f9fd9', 2); return; }
      ctx.fillStyle = p.skill ? (p.side === 0 ? GOLD : '#7f9fd9') : INK;
      ctx.beginPath(); ctx.arc(x, y, p.skill ? c * 0.09 : c * 0.05, 0, 6.3); ctx.fill();
    });
  } else {
    /* persiapan: musuh / monster berikutnya di separuh atas */
    if (G.type === 'creep' && G.phase === 'persiapan') creepWave(G.stage, G.round).forEach(function (f) { ctx.globalAlpha = 0.45; drawCreep(f, cx(f.x), cy(f.y) + c * 0.32); ctx.globalAlpha = 1; });
    else if (G.opp && G.phase === 'persiapan') { ctx.font = '700 ' + Math.round(c * 0.42) + 'px Caveat, cursive'; ctx.fillStyle = 'rgba(46,38,32,.55)'; ctx.textAlign = 'center'; ctx.fillText(T('lawanKamu', G.opp.nama), LY.ox + c * 4, LY.oy + c * 2); }
    me.units.forEach(function (u) {
      if (G.drag && G.drag.u === u && G.drag.moved) return;
      var px = u.b === 'board' ? cx(u.x) : benchX(u.x), py = (u.b === 'board' ? cy(u.y) : benchY()) + c * 0.32;
      var top = drawHero(px, py, u.id, u.star, { side: u.b === 'board' ? 0 : -1, sel: G.sel === u, seed: u.uid, face: 0 });
      u.items.forEach(function (it, k) { var ix = px + (k - (u.items.length - 1) / 2) * c * 0.26; ctx.fillStyle = PAPER2; ctx.fillRect(ix - c * 0.12, py - c * 0.04, c * 0.24, c * 0.24); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.strokeRect(ix - c * 0.12, py - c * 0.04, c * 0.24, c * 0.24); drawIcon(ITEMS[it].ic, ix, py + c * 0.08, c * 0.2, INK, 1.4); });
    });
    if (G.drag && G.drag.moved) {
      var dt = dropTarget(G.drag.px, G.drag.py);
      if (dt) { ctx.fillStyle = 'rgba(226,169,59,.35)'; if (dt.b === 'board' && dt.y >= 4) ctx.fillRect(LY.ox + dt.x * c, LY.oy + dt.y * c, c, c); else if (dt.b === 'bench') ctx.fillRect(LY.ox + dt.x * c, LY.by, c, c); }
      drawHero(G.drag.px, G.drag.py + c * 0.3, G.drag.u.id, G.drag.u.star, { side: 0, big: true, seed: 1 });
    }
  }
  /* efek */
  G.fxs.forEach(function (e) {
    var k = e.t / e.life;
    if (e.k === 'num') { ctx.globalAlpha = 1 - k * k; ctx.font = (e.big ? '800 ' : '700 ') + Math.round(c * (e.big ? 0.32 : 0.24)) + 'px Geist, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = PAPER2; var yy = cy(e.y) - c * (0.6 + k * 0.5); ctx.strokeText(e.txt, cx(e.x + e.dx), yy); ctx.fillStyle = e.col; ctx.fillText(e.txt, cx(e.x + e.dx), yy); ctx.globalAlpha = 1; }
    else if (e.k === 'dot') { ctx.globalAlpha = 1 - k; ctx.fillStyle = e.col; ctx.beginPath(); ctx.arc(cx(e.x), cy(e.y), c * 0.06, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1; }
    else if (e.k === 'ring') { ctx.globalAlpha = 1 - k; ctx.lineWidth = 3; ctx.strokeStyle = e.col; ctx.beginPath(); ctx.ellipse(cx(e.x), cy(e.y) + c * 0.2, c * e.r * (0.3 + k * 0.7), c * e.r * (0.15 + k * 0.35), 0, 0, 6.3); ctx.stroke(); ctx.globalAlpha = 1; }
  });
}
function stunStars(x, y) { for (var i = 0; i < 3; i++) { var a = time * 5 + i * 2.1; star4(x + Math.cos(a) * 10, y + Math.sin(a) * 3, 3.5, a, GOLD, 1.4); } }

/* potret hero untuk toko / info (dijana sekali ke dataURL) */
var _portrait = {};
function portrait(id, comot) {
  var key = id + (comot ? 'c' : ''); if (_portrait[key]) return _portrait[key];
  var c = document.createElement('canvas'); c.width = 128; c.height = 128; var keep = ctx; ctx = c.getContext('2d');
  var H = HEROES[id] || KOMANDAN[id];
  ctx.fillStyle = PAPER2; ctx.fillRect(0, 0, 128, 128);
  drawClawd(64, 112, { s: 1.95, acc: H.acc, col: H.col, colH: H.colH, face: 0.4, t: 0.3, shadow: true });
  _portrait[key] = c.toDataURL('image/png'); ctx = keep; return _portrait[key];
}
