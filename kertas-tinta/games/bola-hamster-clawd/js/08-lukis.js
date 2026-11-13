/* 08 — Lukisan: langit kertas, trek terapung bertepi dakwat, gerbang jawapan, objek, bola lutsinar + Clawd, zarah. */
var cam = { x: 0, y: 0 }, parts = [], texts = [];

function emit(o) { parts.push(o); }
function sparkles(x, y, n, spread, col) { if (REDUCE) n = Math.ceil(n / 3); for (var i = 0; i < n; i++) emit({ kind: 'star', x: x + rf(-spread, spread), y: y + rf(-spread, spread), vx: rf(-40, 40), vy: rf(-60, -10), r: rf(2.5, 5), rot: rf(0, 1), col: col || (Math.random() < 0.6 ? '#ffd76a' : '#fff'), life: 0, max: rf(0.6, 1.1), g: 40 }); }
function rings(x, y, n, col) { for (var i = 0; i < n; i++) emit({ kind: 'ring', x: x + rf(-3, 3), y: y + rf(-3, 3), r: rf(2, 4), grow: rf(18, 30), life: 0, max: rf(0.35, 0.6), col: col }); }
function confetti(x, y, n, cols) { if (REDUCE) n = Math.ceil(n / 3); for (var i = 0; i < n; i++) { var a = rf(0, 6.28), s = rf(0.3, 1) * 190; emit({ kind: 'scrap', x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 90, rot: rf(0, 6), vr: rf(-9, 9), col: pick(cols), life: 0, max: rf(0.9, 1.5), g: 260 }); } }
function sfxText(x, y, txt, col, size) { texts.push({ x: x, y: y, txt: txt, col: col || CL, size: size || 20, rot: rf(-0.2, 0.15), t: 0 }); }

function camUpdate(dt, snap) {
  var lead = 0.35, tx = ball.x + ball.vx * lead - W / 2, ty = ball.y + ball.vy * lead - H / 2 + 10;
  var maxX = world.cols * TS - W + 40, maxY = world.rows * TS - H + 60;
  tx = clamp(tx, -40, Math.max(-40, maxX)); ty = clamp(ty, -60, Math.max(-60, maxY));
  if (snap) { cam.x = tx; cam.y = ty; return; }
  var k = 1 - Math.exp(-4 * dt); cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
}

function partsUpdate(dt) {
  for (var i = parts.length - 1; i >= 0; i--) {
    var p = parts[i]; p.life += dt;
    if (p.vx !== undefined) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; }
    if (p.vr) p.rot += p.vr * dt;
    if (p.life > p.max) parts.splice(i, 1);
  }
  for (i = texts.length - 1; i >= 0; i--) { texts[i].t += dt; if (texts[i].t > 1) texts.splice(i, 1); }
}

/* ---------- langit ---------- */
function drawSky(pal) {
  ctx.fillStyle = pal.sky; ctx.fillRect(0, 0, W, H);
  var vg = ctx.createRadialGradient(W / 2, H * 0.45, 30, W / 2, H / 2, W * 0.7);
  vg.addColorStop(0, 'rgba(255,253,246,0.6)'); vg.addColorStop(1, 'rgba(190,180,160,0.35)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  /* awan parallaks */
  var t = world ? world.t : 0;
  for (var k = 0; k < 9; k++) {
    var span = W + 220, x = ((hsh(k * 3.3) * span - cam.x * 0.25 + t * (4 + k)) % span + span) % span - 110, y = ((hsh(k * 7.1) * (H + 160) - cam.y * 0.25) % (H + 160) + H + 160) % (H + 160) - 80;
    var r = 16 + hsh(k) * 18;
    ctx.save(); ctx.globalAlpha = 0.9;
    [[0, 0, r], [r * 0.9, 4, r * 0.75], [-r * 0.9, 5, r * 0.7]].forEach(function (b, j) { inkCircle(x + b[0], y + b[1], b[2], k + j, 0.8, 0, null, pal.cloud); });
    ctx.globalAlpha = 0.35; [[0, 0, r], [r * 0.9, 4, r * 0.75], [-r * 0.9, 5, r * 0.7]].forEach(function (b, j) { ctx.beginPath(); ctx.arc(x + b[0], y + b[1], b[2], Math.PI * 1.05, Math.PI * 1.85); stroke(0.9, INK); });
    ctx.restore();
  }
  /* garis arsiran jauh */
  ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath();
  var off = (-cam.x * 0.1 - cam.y * 0.1) % 14;
  for (var q = -H; q < W + H; q += 14) { ctx.moveTo(q + off, H); ctx.lineTo(q + off + H * 0.6, 0); }
  ctx.stroke(); ctx.restore();
}

/* ---------- trek ---------- */
function solidFloor(c, r) { return isFloorCh(tileAt(c, r)) || tileAt(c, r) === 'x'; }
function drawTrack(pal, tm) {
  var c0 = Math.max(0, Math.floor(cam.x / TS) - 1), c1 = Math.min(world.cols - 1, Math.ceil((cam.x + W) / TS) + 1);
  var r0 = Math.max(0, Math.floor(cam.y / TS) - 1), r1 = Math.min(world.rows - 1, Math.ceil((cam.y + H) / TS) + 1);
  var r, c, ch, x, y, D = 14;
  /* landasan pelantar */
  for (r = r0; r <= r1; r++) for (c = c0; c <= c1; c++) {
    if (tileAt(c, r) !== '=') continue;
    x = c * TS - cam.x; y = r * TS - cam.y;
    ctx.save(); ctx.setLineDash([3, 4]); ctx.globalAlpha = 0.45;
    var hz = tileAt(c - 1, r) === '=' || tileAt(c + 1, r) === '=';
    var vt = tileAt(c, r - 1) === '=' || tileAt(c, r + 1) === '=';
    ctx.beginPath();
    if (vt && !hz) { ctx.moveTo(x + TS / 2, y); ctx.lineTo(x + TS / 2, y + TS); }
    else { ctx.moveTo(x, y + TS / 2); ctx.lineTo(x + TS, y + TS / 2); }
    stroke(1, INK); ctx.restore();
  }
  /* muka sisi (tebal trek) */
  for (r = r0; r <= r1; r++) for (c = c0; c <= c1; c++) {
    if (!solidFloor(c, r) || solidFloor(c, r + 1)) continue;
    x = c * TS - cam.x; y = (r + 1) * TS - cam.y;
    ctx.fillStyle = pal.side; ctx.fillRect(x - 0.5, y, TS + 1, D);
    hatch(x, y, TS, D, 4, pal.side2, 0.6, 0.8);
    inkLine(x, y + D, x + TS, y + D, c * 3 + r, 0.6, 1.3, INK);
    if (!solidFloor(c - 1, r)) inkLine(x, y, x, y + D, c + r * 5, 0.4, 1.2, INK);
    if (!solidFloor(c + 1, r)) inkLine(x + TS, y, x + TS, y + D, c + r * 7, 0.4, 1.2, INK);
  }
  /* muka atas */
  for (r = r0; r <= r1; r++) for (c = c0; c <= c1; c++) {
    ch = tileAt(c, r);
    if (!isFloorCh(ch)) continue;
    x = c * TS - cam.x; y = r * TS - cam.y;
    ctx.fillStyle = (c + r) % 2 ? pal.floor : pal.floor2; ctx.fillRect(x - 0.3, y - 0.3, TS + 0.6, TS + 0.6);
    if (ch === 'i') {
      ctx.fillStyle = '#cfeaf1'; ctx.fillRect(x - 0.3, y - 0.3, TS + 0.6, TS + 0.6);
      ctx.save(); ctx.globalAlpha = 0.8; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.beginPath();
      var o2 = hsh(c * 9 + r) * 10; ctx.moveTo(x + 4 + o2, y + 18); ctx.lineTo(x + 12 + o2, y + 8); ctx.moveTo(x + 9 + o2, y + 21); ctx.lineTo(x + 14 + o2, y + 15); ctx.stroke(); ctx.restore();
    } else if (ch === '>' || ch === '<' || ch === '^' || ch === 'v') {
      ctx.fillStyle = '#d2c2a4'; ctx.fillRect(x - 0.3, y - 0.3, TS + 0.6, TS + 0.6);
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, TS, TS); ctx.clip();
      ctx.translate(x + TS / 2, y + TS / 2); ctx.rotate(ch === '>' ? 0 : ch === '<' ? Math.PI : ch === '^' ? -Math.PI / 2 : Math.PI / 2);
      var sh = (tm * 26) % 13;
      ctx.strokeStyle = '#7a6448'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (var k = -2; k <= 2; k++) { var cx = k * 13 + sh - 4; ctx.beginPath(); ctx.moveTo(cx - 4, -6); ctx.lineTo(cx + 1, 0); ctx.lineTo(cx - 4, 6); ctx.stroke(); }
      ctx.restore();
    } else if (ch === 'F') {
      var cs = TS / 4;
      for (var a = 0; a < 4; a++) for (var b2 = 0; b2 < 4; b2++) { ctx.fillStyle = (a + b2) % 2 ? INK : PAPER2; ctx.fillRect(x + a * cs, y + b2 * cs, cs, cs); }
    } else if (ch === 'C') {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(x + TS / 2, y + TS / 2, 9, 0, 6.29); stroke(1.2, LG_D); ctx.restore();
    } else if ((c * 7 + r * 13) % 9 === 0) {
      scratch(x + 2, y + 2, TS - 4, TS - 4, 6, pal.side, 0.35, -0.8, c + r);
    }
  }
  /* gerbang jawapan */
  world.gates.forEach(function (g) { drawGate(g, pal, tm); });
  /* tepi dakwat */
  for (r = r0; r <= r1; r++) for (c = c0; c <= c1; c++) {
    if (!isFloorCh(tileAt(c, r))) continue;
    x = c * TS - cam.x; y = r * TS - cam.y;
    var u = c * 11 + r * 17;
    if (!solidFloor(c, r - 1)) inkLine(x, y, x + TS, y, u, 0.7, 1.5, INK);
    if (!solidFloor(c, r + 1)) inkLine(x, y + TS, x + TS, y + TS, u + 1, 0.7, 1.5, INK);
    if (!solidFloor(c - 1, r)) inkLine(x, y, x, y + TS, u + 2, 0.7, 1.5, INK);
    if (!solidFloor(c + 1, r)) inkLine(x + TS, y, x + TS, y + TS, u + 3, 0.7, 1.5, INK);
  }
  /* pelantar */
  world.objs.forEach(function (o) {
    if (o.k !== 'lift') return;
    x = o.x - cam.x; y = o.y - cam.y;
    var pw = o.w * TS, ph = o.h * TS;
    ctx.fillStyle = pal.side; ctx.fillRect(x, y + ph, pw, 10); hatch(x, y + ph, pw, 10, 4, pal.side2, 0.6, 0.8);
    wobRect(x, y, pw, ph, 31 + o.a[0], 0.5); ctx.fillStyle = '#f6efdc'; ctx.fill();
    ctx.save(); ctx.clip(); hatch(x, y, pw, ph, 9, GOLD, 0.35, 1.2); ctx.restore();
    wobRect(x, y, pw, ph, 31 + o.a[0], 0.5); stroke(1.6, INK);
    inkLine(x, y + ph + 10, x + pw, y + ph + 10, 5, 0.5, 1.2, INK);
    ctx.save(); ctx.fillStyle = INK; [[6, 6], [pw - 6, 6], [6, ph - 6], [pw - 6, ph - 6]].forEach(function (p) { ctx.beginPath(); ctx.arc(x + p[0], y + p[1], 1.6, 0, 6.29); ctx.fill(); }); ctx.restore();
  });
}

function drawGate(g, pal, tm) {
  var y = g.r * TS - cam.y;
  if (y < -TS * 2 || y > H + TS) return;
  g.runs.forEach(function (ru, j) {
    var x = ru.c0 * TS - cam.x, w = (ru.c1 - ru.c0 + 1) * TS;
    var base = g.solved ? (ru.ok ? '#cfe6ae' : '#e9e4d6') : PAPER2;
    ctx.fillStyle = base; ctx.fillRect(x, y, w, TS);
    if (ru.wrong && !g.solved) { ctx.fillStyle = '#f2d2c4'; ctx.fillRect(x, y, w, TS); hatch(x, y, w, TS, 5, CL_D, 0.55, 1); }
    if (ru.glow > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, ru.glow); ctx.fillStyle = '#fff6c8'; ctx.fillRect(x, y, w, TS); ctx.restore(); }
    wobRect(x + 2, y + 2, w - 4, TS - 4, j * 5 + g.r, 0.5); stroke(1.3, INK);
    /* nombor jawapan */
    ctx.save();
    ctx.font = '700 ' + (String(ru.val).length > 3 ? 12 : 15) + 'px "Source Serif 4", Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = g.solved && !ru.ok ? 0.35 : 1;
    ctx.fillStyle = INK; ctx.fillText(String(ru.val), x + w / 2, y + TS / 2 + 1);
    ctx.restore();
    if (ru.wrong && !g.solved) { inkLine(x + 8, y + 6, x + w - 8, y + TS - 6, j + 3, 0.6, 2, CL_D); inkLine(x + w - 8, y + 6, x + 8, y + TS - 6, j + 9, 0.6, 2, CL_D); }
    if (g.solved && ru.ok) { ctx.save(); ctx.strokeStyle = LG_D; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w - 13, y + 13); ctx.lineTo(x + w - 9, y + 17); ctx.lineTo(x + w - 3, y + 8); ctx.stroke(); ctx.restore(); }
  });
  /* label huruf A/B/C di atas pintu bila belum selesai */
  if (!g.solved) {
    g.runs.forEach(function (ru, j) {
      var x = ru.c0 * TS - cam.x, w = (ru.c1 - ru.c0 + 1) * TS;
      ctx.save(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + 8, y + 8, 5.5, 0, 6.29); ctx.fill();
      ctx.fillStyle = PAPER; ctx.font = '700 7.5px "IBM Plex Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ABC'[j], x + 8, y + 8.5); ctx.restore();
    });
  }
}

/* ---------- objek yang disusun ikut kedalaman (y) ---------- */
function drawWall(c, r, pal) {
  var x = c * TS - cam.x, y = r * TS - cam.y, hgt = 9;
  ctx.fillStyle = '#9b8a74'; ctx.fillRect(x, y + TS - hgt, TS, hgt);
  hatch(x, y + TS - hgt, TS, hgt, 3.5, INK, 0.35, 0.7);
  wobRect(x, y - hgt, TS, TS, c * 3 + r, 0.4); ctx.fillStyle = '#e4dccb'; ctx.fill();
  ctx.save(); ctx.clip(); scratch(x, y - hgt, TS, TS, 8, '#8f7f68', 0.5, -0.7, c + r); ctx.restore();
  wobRect(x, y - hgt, TS, TS, c * 3 + r, 0.4); stroke(1.4, INK);
  inkLine(x, y + TS, x + TS, y + TS, c + r, 0.4, 1.3, INK);
  inkLine(x, y + TS - hgt, x, y + TS, c + r + 2, 0.3, 1.2, INK); inkLine(x + TS, y + TS - hgt, x + TS, y + TS, c + r + 4, 0.3, 1.2, INK);
}
function drawBump(o) {
  var x = o.x * TS - cam.x, y = o.y * TS - cam.y, s = 1 + o.hit * 0.25;
  ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(x, y + 6, 10, 4, 0, 0, 6.29); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#f3e6c4'; ctx.fillRect(-4, -2, 8, 8); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(-4, -2, 8, 8);
  ctx.beginPath(); ctx.arc(0, -2, 10, Math.PI, 0); ctx.closePath(); ctx.fillStyle = CL; ctx.fill(); stroke(1.5, INK);
  ctx.fillStyle = PAPER2; [[-5, -6, 2.2], [2, -9, 1.8], [6, -4, 1.6]].forEach(function (d) { ctx.beginPath(); ctx.arc(d[0], d[1], d[2], 0, 6.29); ctx.fill(); });
  ctx.restore();
}
function drawSapu(o, pal) {
  var px = o.x * TS - cam.x, py = o.y * TS - cam.y, ex = Math.cos(o.ang) * o.len * TS, ey = Math.sin(o.ang) * o.len * TS;
  ctx.save(); ctx.globalAlpha = 0.22; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(px - ex, py - ey + 6); ctx.lineTo(px + ex, py + ey + 6); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 8.5; ctx.beginPath(); ctx.moveTo(px - ex, py - ey - 6); ctx.lineTo(px + ex, py + ey - 6); ctx.stroke();
  ctx.strokeStyle = '#c98a4b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px - ex, py - ey - 6); ctx.lineTo(px + ex, py + ey - 6); ctx.stroke();
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 0.8; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(px - ex, py - ey - 6); ctx.lineTo(px + ex, py + ey - 6); ctx.stroke();
  ctx.restore();
  inkCircle(px, py - 6, 5, 2, 0.4, 1.4, INK, '#e4dccb');
}
function drawComot(o, tm) {
  var x = o.x - cam.x, y = o.y - cam.y, sq = o.squish, wob = Math.sin(tm * 6 + o.a[0]) * 1.2;
  ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(x, y + 8, 11, 4, 0, 0, 6.29); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x, y - 4); ctx.scale(1 + sq * 0.3, 1 - sq * 0.25);
  var pts = []; for (var i = 0; i < 14; i++) { var a = i / 14 * 6.283, rr = 11 + Math.sin(a * 3 + tm * 5) * 1.6 + (a > 3.4 && a < 6 ? wob : 0); pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.9]); }
  trace(pts, true); ctx.fillStyle = '#3a3330'; ctx.fill(); stroke(1.4, INK);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-4 * o.dir, -2, 3, 0, 6.29); ctx.arc(4 * o.dir, -2, 3, 0, 6.29); ctx.fill();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-3 * o.dir + o.dir, -2, 1.4, 0, 6.29); ctx.arc(5 * o.dir, -2, 1.4, 0, 6.29); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, 4); ctx.quadraticCurveTo(0, 2.5, 3, 4); ctx.stroke();
  ctx.restore();
}
function drawSeed(sd) {
  if (sd.got) return;
  var x = sd.x - cam.x, y = sd.y - cam.y + Math.sin(sd.t * 3) * 1.5;
  ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(x, sd.y - cam.y + 7, 5, 2, 0, 0, 6.29); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x, y - 2); ctx.rotate(0.35 + Math.sin(sd.t * 2) * 0.15);
  ctx.beginPath(); ctx.moveTo(0, -7); ctx.quadraticCurveTo(5.5, -2, 3.2, 5); ctx.quadraticCurveTo(0, 7.5, -3.2, 5); ctx.quadraticCurveTo(-5.5, -2, 0, -7); ctx.closePath();
  ctx.fillStyle = '#3d3632'; ctx.fill(); stroke(1.1, INK);
  ctx.strokeStyle = '#efe6d2'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-1.6, -3.5); ctx.lineTo(-1.6, 4.5); ctx.moveTo(1.6, -3.5); ctx.lineTo(1.6, 4.5); ctx.stroke();
  ctx.restore();
  if (Math.sin(sd.t * 2.3) > 0.93) star4(x + 5, y - 7, 3, sd.t, '#e2a93b', 1.1);
}
function drawFlag(k) {
  var x = k.x - cam.x + 7, y = k.y - cam.y + 6;
  inkLine(x, y, x, y - 26, 4, 0.3, 1.6, INK);
  var wv = Math.sin(k.wave * 5) * 2;
  ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.quadraticCurveTo(x + 8, y - 26 + wv, x + 15, y - 22); ctx.lineTo(x, y - 17); ctx.closePath();
  ctx.fillStyle = k.on ? LG : '#d8d0bd'; ctx.fill(); stroke(1.2, INK);
}
function drawFinishFlag() {
  var fc = null;
  for (var r = 0; r < world.rows && !fc; r++) for (var c = 0; c < world.cols; c++) if (world.g[r][c] === 'F') { fc = { c: c, r: r }; break; }
  if (!fc) return;
  var x = (fc.c + 1) * TS - cam.x, y = fc.r * TS - cam.y + 4, wv = Math.sin(world.t * 4) * 2.5;
  inkLine(x, y, x, y - 40, 8, 0.4, 2, INK);
  ctx.save(); ctx.beginPath(); ctx.moveTo(x, y - 40); ctx.quadraticCurveTo(x + 14, y - 40 + wv, x + 26, y - 34); ctx.lineTo(x + 24, y - 22); ctx.quadraticCurveTo(x + 12, y - 26 - wv, x, y - 24); ctx.closePath();
  ctx.fillStyle = CL; ctx.fill(); ctx.clip(); hatch(x, y - 42, 28, 22, 5, CL_D, 0.6, 1); ctx.restore();
  ctx.beginPath(); ctx.moveTo(x, y - 40); ctx.quadraticCurveTo(x + 14, y - 40 + wv, x + 26, y - 34); ctx.lineTo(x + 24, y - 22); ctx.quadraticCurveTo(x + 12, y - 26 - wv, x, y - 24); ctx.closePath(); stroke(1.4, INK);
}

/* ---------- bola hamster + Clawd di dalamnya ---------- */
function drawBall(bx, by, b, tm) {
  var f = b.fall, s = f > 0 ? Math.max(0.15, 1 - f * 0.85) : 1, yo = f > 0 ? f * f * 40 : 0;
  var flick = b.inv > 0 && Math.floor(tm * 16) % 2 === 0;
  if (f <= 0) { ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(bx + 2, by + BR - 1, BR * 0.95, BR * 0.38, 0, 0, 6.29); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.translate(bx, by + yo); ctx.scale(s, s);
  if (flick) ctx.globalAlpha = 0.55;
  /* Clawd di dalam (berlari ikut laju bola) */
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, BR - 0.8, 0, 6.29); ctx.clip();
  ctx.fillStyle = 'rgba(214,238,244,0.55)'; ctx.fillRect(-BR, -BR, BR * 2, BR * 2);
  var bob = Math.abs(Math.sin(b.roll * 2)) * (b.speed > 20 ? 0.8 : 0);
  drawClawd(0, 6 - bob, { s: 0.36, face: b.face, run: b.speed > 20, t: tm + b.roll * 0.3, mood: b.mood || (b.speed < 5 && Math.sin(tm * 0.7) > 0.95 ? '' : ''), blink: Math.sin(tm * 1.7) > 0.985 });
  ctx.restore();
  /* garis meridian berputar */
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, BR, 0, 6.29); ctx.clip();
  ctx.strokeStyle = 'rgba(46,38,32,0.45)'; ctx.lineWidth = 0.9;
  var ang = Math.atan2(b.vy, b.vx || 0.0001);
  ctx.rotate(b.speed > 4 ? ang + Math.PI / 2 : 0);
  for (var k = 0; k < 3; k++) {
    var ph = b.roll + k * 2.094, sx = Math.sin(ph) * BR, cz = Math.cos(ph);
    if (cz < 0) continue;
    ctx.beginPath(); ctx.ellipse(0, sx * 0.0, BR, Math.abs(sx) + 0.6, 0, 0, Math.PI * 2); ctx.globalAlpha = 0.25 + cz * 0.4; ctx.stroke();
  }
  ctx.restore();
  /* kilauan + rangka */
  ctx.save(); ctx.globalAlpha = 0.85; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, BR - 3, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-BR * 0.25, -BR * 0.62, 1.2, 0, 6.29); ctx.fill(); ctx.restore();
  inkCircle(0, 0, BR, 3, 0.35, 1.6, INK);
  ctx.restore();
}

function drawParts() {
  parts.forEach(function (p) {
    var k = p.life / p.max, x = p.x - cam.x, y = p.y - cam.y;
    ctx.save(); ctx.globalAlpha = 1 - k;
    if (p.kind === 'star') star4(x, y, p.r, p.rot, p.col, 1.3);
    else if (p.kind === 'ring') { ctx.beginPath(); ctx.arc(x, y, p.r + p.grow * eOut(k), 0, 6.29); stroke(1.2, p.col || INK); }
    else if (p.kind === 'scrap') { ctx.translate(x, y); ctx.rotate(p.rot); ctx.fillStyle = p.col; ctx.fillRect(-3, -2, 6, 4); ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.strokeRect(-3, -2, 6, 4); }
    ctx.restore();
  });
  texts.forEach(function (t) {
    var k = t.t, x = t.x - cam.x, y = t.y - cam.y - eOut(k) * 18;
    ctx.save(); ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1; ctx.translate(x, y); ctx.rotate(t.rot);
    var sc = k < 0.15 ? 0.6 + k / 0.15 * 0.5 : 1.1 - Math.min(0.1, (k - 0.15));
    ctx.scale(sc, sc);
    ctx.font = '700 ' + t.size + 'px Caveat, "Segoe Print", cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 4; ctx.strokeStyle = PAPER2; ctx.strokeText(t.txt, 0, 0);
    ctx.fillStyle = t.col; ctx.fillText(t.txt, 0, 0);
    ctx.restore();
  });
}

/* ---------- satu bingkai ---------- */
HB.lukis = function (tm) {
  var pal = world.tr.pal;
  INKSEED = Math.floor(tm * 7) % 3;
  drawSky(pal);
  var bx = ball.x - cam.x, by = ball.y - cam.y;
  if (ball.fall > 0) drawBall(bx, by, ball, tm);
  drawTrack(pal, tm);
  /* senarai objek ikut y */
  var L = [];
  var c0 = Math.max(0, Math.floor(cam.x / TS) - 1), c1 = Math.min(world.cols - 1, Math.ceil((cam.x + W) / TS) + 1);
  var r0 = Math.max(0, Math.floor(cam.y / TS) - 1), r1 = Math.min(world.rows - 1, Math.ceil((cam.y + H) / TS) + 1);
  for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) if (tileAt(c, r) === 'x' && !world.objs.some(function (o) { return o.k === 'sapu' && Math.floor(o.x) === c && Math.floor(o.y) === r; })) L.push({ y: (r + 1) * TS - 2, f: drawWall.bind(null, c, r, pal) });
  world.objs.forEach(function (o) {
    if (o.k === 'bump') L.push({ y: o.y * TS + 6, f: drawBump.bind(null, o) });
    else if (o.k === 'sapu') { L.push({ y: o.y * TS + 1, f: drawWall.bind(null, Math.floor(o.x), Math.floor(o.y), pal) }); L.push({ y: o.y * TS + 999, f: drawSapu.bind(null, o, pal) }); }
    else if (o.k === 'comot') L.push({ y: o.y + 8, f: drawComot.bind(null, o, tm) });
  });
  world.seeds.forEach(function (sd) { if (!sd.got) L.push({ y: sd.y + 4, f: drawSeed.bind(null, sd) }); });
  world.chks.forEach(function (k) { L.push({ y: k.y + 6, f: drawFlag.bind(null, k) }); });
  L.push({ y: 1e9 - 1, f: drawFinishFlag });
  if (ball.fall <= 0) L.push({ y: ball.y + BR, f: function () { drawBall(bx, by, ball, tm); } });
  L.sort(function (a, b) { return a.y - b.y; });
  L.forEach(function (o) { o.f(); });
  drawParts();
  grainOver(1);
};
