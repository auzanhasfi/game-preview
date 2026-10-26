/* Catur Ajaib Clawd: alat tinta + watak Clawd (aksesori per hero) + Comot (monster), diambil dari Arena Clawd v3 */
'use strict';
/* ---------- alat tinta ---------- */
var ctx = null, seed = 0;
function hsh(n) { var s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); }
function jt(i, u) { return hsh(i * 7.13 + u * 3.71 + seed * 5.17) - 0.5; }
function trace(pts, close) { ctx.beginPath(); for (var i = 0; i < pts.length; i++) { if (i) ctx.lineTo(pts[i][0], pts[i][1]); else ctx.moveTo(pts[i][0], pts[i][1]); } if (close) ctx.closePath(); }
function stroke(w, col) { ctx.lineWidth = w || 1.5; ctx.strokeStyle = col || INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
function wobRect(x, y, w, h, u, amp) { var pts = [], i, n; function edge(ax, ay, bx, by, uu) { n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / 8)); for (i = 0; i < n; i++) { var t = i / n; pts.push([ax + (bx - ax) * t + jt(i, uu) * amp, ay + (by - ay) * t + jt(i, uu + 40) * amp]); } } edge(x, y, x + w, y, u); edge(x + w, y, x + w, y + h, u + 1); edge(x + w, y + h, x, y + h, u + 2); edge(x, y + h, x, y, u + 3); trace(pts, true); }
function inkCircle(cx, cy, r, u, amp, lw, col, fill) { var n = Math.max(10, Math.round(r * 0.8)), pts = []; for (var i = 0; i <= n; i++) { var a = (i / n) * 6.2832 + u, rr = r + jt(i % n, u) * amp; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } trace(pts, true); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) stroke(lw, col); }
function scratch(x, y, w, h, n, col, alpha, ang, u) { ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = 0.8; ctx.lineCap = 'round'; ctx.beginPath(); for (var i = 0; i < n; i++) { var px = x + hsh(i * 3.1 + u) * w, py = y + hsh(i * 5.7 + u + 9) * h, l = 2.5 + hsh(i + u * 2) * 5, a = ang + (hsh(i * 1.3 + u) - 0.5) * 0.3; ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); } ctx.stroke(); ctx.restore(); }
function star4(x, y, r, rot, col, lw) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.strokeStyle = col; ctx.lineWidth = lw || 1.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.moveTo(-r * 0.45, -r * 0.45); ctx.lineTo(r * 0.45, r * 0.45); ctx.moveTo(r * 0.45, -r * 0.45); ctx.lineTo(-r * 0.45, r * 0.45); ctx.stroke(); ctx.restore(); }
var grain = (function () { var c = document.createElement('canvas'); c.width = 128; c.height = 128; var g = c.getContext('2d'), d = g.createImageData(128, 128); for (var i = 0; i < d.data.length; i += 4) { var v = 80 + Math.random() * 80; d.data[i] = v; d.data[i + 1] = v - 6; d.data[i + 2] = v - 14; d.data[i + 3] = Math.random() < 0.55 ? 0 : 8 + Math.random() * 16; } g.putImageData(d, 0, 0); return c; })();

/* ---------- watak ---------- */
function drawClawd(cx, fy, o) {
  var s = o.s || 1, face = o.face || 0, t = o.t || 0, col = o.col || CL, colH = o.colH || CL_H;
  ctx.save(); ctx.translate(cx, fy); ctx.scale(s, s);
  if (o.shadow !== false) { ctx.fillStyle = 'rgba(46,38,32,0.18)'; ctx.beginPath(); ctx.ellipse(0, 1, 20, 4.5, 0, 0, 6.3); ctx.fill(); }
  var lx = [-14, -8.6, 5, 10.4], ph = o.run ? Math.sin(t * 20) : 0;
  ctx.lineWidth = 1.1; ctx.strokeStyle = INK;
  for (var i = 0; i < 4; i++) { var lift = o.run ? Math.max(0, (i % 2 ? ph : -ph)) * 3 : 0; ctx.fillStyle = col; ctx.fillRect(lx[i], -10, 3.6, 10 - lift); ctx.strokeRect(lx[i], -10, 3.6, 10 - lift); }
  var armUp = o.atk ? -6 : 0, fr = face >= 0;
  if (o.acc === 'pahlawan' && o.cape !== false) { ctx.beginPath(); ctx.moveTo(-15 * (fr ? 1 : -1), -27); ctx.quadraticCurveTo(-26 * (fr ? 1 : -1), -20 + Math.sin(t * 12) * 3, -28 * (fr ? 1 : -1), -6 + Math.sin(t * 12 + 1) * 2); ctx.lineTo(-14 * (fr ? 1 : -1), -12); ctx.closePath(); ctx.fillStyle = '#d9534a'; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.fillStyle = col; ctx.fillRect(-21.5, -21 + (!fr ? armUp : 0), 5, 6.5); ctx.strokeRect(-21.5, -21 + (!fr ? armUp : 0), 5, 6.5);
  ctx.fillRect(16.5, -21 + (fr ? armUp : 0), 5, 6.5); ctx.strokeRect(16.5, -21 + (fr ? armUp : 0), 5, 6.5);
  wobRect(-17, -29, 34, 20, 7, 0.45); ctx.fillStyle = col; ctx.fill();
  if (o.detail !== false) { ctx.save(); ctx.clip(); scratch(-17, -29, 34, 20, 30, colH, 0.55, -0.9, 3); ctx.restore(); }
  wobRect(-17, -29, 34, 20, 7, 0.45); stroke(1.5 / Math.max(0.6, s) * 0.9, INK);
  var e1 = -6.5 + face * 2, e2 = 6.5 + face * 2;
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  if (o.mood === 'happy') { ctx.beginPath(); ctx.moveTo(e1 - 2.6, -19); ctx.lineTo(e1, -22.4); ctx.lineTo(e1 + 2.6, -19); ctx.moveTo(e2 - 2.6, -19); ctx.lineTo(e2, -22.4); ctx.lineTo(e2 + 2.6, -19); ctx.stroke(); }
  else if (o.mood === 'hurt') { ctx.beginPath(); ctx.moveTo(e1 - 2, -23); ctx.lineTo(e1 + 2, -19); ctx.moveTo(e1 + 2, -23); ctx.lineTo(e1 - 2, -19); ctx.moveTo(e2 - 2, -23); ctx.lineTo(e2 + 2, -19); ctx.moveTo(e2 + 2, -23); ctx.lineTo(e2 - 2, -19); ctx.stroke(); }
  else if (o.blink) { ctx.fillRect(e1 - 1.5, -20.5, 3, 1.3); ctx.fillRect(e2 - 1.5, -20.5, 3, 1.3); }
  else { ctx.fillRect(e1 - 1.4, -24, 2.9, 6.2); ctx.fillRect(e2 - 1.4, -24, 2.9, 6.2); }
  if (o.angry) { ctx.beginPath(); ctx.moveTo(e1 - 4, -28); ctx.lineTo(e1 + 2.5, -25.5); ctx.moveTo(e2 + 4, -28); ctx.lineTo(e2 - 2.5, -25.5); ctx.lineWidth = 1.8; ctx.stroke(); }
  var hx = fr ? 21 : -21, dir = fr ? 1 : -1;
  if (o.acc === 'pahlawan') { ctx.save(); ctx.translate(hx, -18 + armUp * 0.5); ctx.rotate(dir * (o.atk ? 0.4 : -0.7)); ctx.fillStyle = '#f2c14e'; ctx.fillRect(-2, -26, 5, 26); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-2, -26, 5, 26); ctx.beginPath(); ctx.moveTo(-2, -26); ctx.lineTo(0.5, -33); ctx.lineTo(3, -26); ctx.closePath(); ctx.fillStyle = '#f6e3c4'; ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(-4, -2, 9, 3); ctx.restore(); }
  else if (o.acc === 'pemanah') { ctx.strokeStyle = '#d9534a'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-17, -26.5); ctx.lineTo(17, -26.5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-17 * dir, -26.5); ctx.quadraticCurveTo(-24 * dir, -30 + Math.sin(t * 16) * 2, -28 * dir, -24 + Math.sin(t * 16 + 1) * 3); ctx.lineWidth = 1.6; ctx.stroke(); ctx.save(); ctx.translate(hx + dir * 3, -18); ctx.beginPath(); ctx.arc(0, 0, 13, -1.3, 1.3); if (!fr) { ctx.restore(); ctx.save(); ctx.translate(hx + dir * 3, -18); ctx.beginPath(); ctx.arc(0, 0, 13, Math.PI - 1.3, Math.PI + 1.3); } ctx.lineWidth = 2.2; ctx.strokeStyle = '#8f5a1f'; ctx.stroke(); ctx.beginPath(); ctx.moveTo(Math.cos(1.3) * 13 * dir, -Math.sin(1.3) * 13); ctx.lineTo(Math.cos(1.3) * 13 * dir, Math.sin(1.3) * 13); ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  else if (o.acc === 'sihir') { ctx.beginPath(); ctx.moveTo(-15, -29); ctx.lineTo(15, -29); ctx.lineTo(4, -48); ctx.quadraticCurveTo(10, -52, 12, -46); ctx.lineTo(3, -50); ctx.closePath(); ctx.fillStyle = '#5a3d8f'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke(); star4(-1, -38, 3, t * 2, GOLD, 1.3); ctx.save(); ctx.translate(hx, -16); ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(dir * 4, -20); ctx.lineWidth = 2.2; ctx.strokeStyle = '#8f5a1f'; ctx.stroke(); star4(dir * 4, -22, 5 + Math.sin(t * 8) * 1.2, t * 3, GOLD, 1.8); ctx.restore(); }
  else if (o.acc === 'penjaga') {
    /* topi keledar + perisai besar di tangan */
    ctx.beginPath(); ctx.moveTo(-18, -29); ctx.quadraticCurveTo(0, -46, 18, -29); ctx.closePath(); ctx.fillStyle = '#b9b4ab'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -43); ctx.lineTo(0, -50); ctx.stroke(); ctx.fillStyle = '#d9534a'; ctx.beginPath(); ctx.arc(0, -51, 3, 0, 6.3); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(hx + dir * 2, -17 + armUp * 0.4); ctx.beginPath(); ctx.moveTo(-9, -13); ctx.lineTo(9, -13); ctx.lineTo(9, 3); ctx.quadraticCurveTo(0, 14, -9, 3); ctx.closePath(); ctx.fillStyle = '#e8e1d2'; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 6); ctx.moveTo(-6, -3); ctx.lineTo(6, -3); ctx.strokeStyle = '#5f6b3a'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  }
  else if (o.acc === 'bayang') {
    /* topeng mata + skaf berkibar + pisau */
    ctx.fillStyle = '#2b2638'; ctx.fillRect(-17, -26, 34, 7); ctx.fillStyle = '#fff'; ctx.fillRect(e1 - 2, -24.5, 4, 3); ctx.fillRect(e2 - 2, -24.5, 4, 3);
    ctx.beginPath(); ctx.moveTo(-16 * dir, -14); ctx.quadraticCurveTo(-26 * dir, -12 + Math.sin(t * 14) * 3, -32 * dir, -16 + Math.sin(t * 14 + 1) * 4); ctx.lineTo(-30 * dir, -10); ctx.closePath(); ctx.fillStyle = '#8a3346'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke();
    ctx.save(); ctx.translate(hx, -17 + armUp * 0.5); ctx.rotate(dir * (o.atk ? 0.9 : 0.2)); ctx.beginPath(); ctx.moveTo(-1.5, 0); ctx.lineTo(0, -17); ctx.lineTo(2.5, 0); ctx.closePath(); ctx.fillStyle = '#dfe6f0'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(-3, 0, 7, 2.5); ctx.restore();
  }
  else if (o.acc === 'penawar') {
    /* mahkota daun + tongkat berdaun */
    for (var lf = -2; lf <= 2; lf++) { ctx.save(); ctx.translate(lf * 7, -30); ctx.rotate(lf * 0.35); ctx.beginPath(); ctx.ellipse(0, -5, 3.2, 6.5, 0, 0, 6.3); ctx.fillStyle = lf % 2 ? '#6fa83c' : '#9cc96b'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.translate(hx, -16); ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(dir * 3, -20); ctx.lineWidth = 2.2; ctx.strokeStyle = '#8f5a1f'; ctx.stroke(); ctx.beginPath(); ctx.ellipse(dir * 3, -24, 5 + Math.sin(t * 6), 7, dir * 0.4, 0, 6.3); ctx.fillStyle = '#9cc96b'; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  }
  else if (o.acc === 'jurutera') {
    /* topi keselamatan + gogal + sepana */
    ctx.beginPath(); ctx.moveTo(-17, -29); ctx.quadraticCurveTo(0, -44, 17, -29); ctx.closePath(); ctx.fillStyle = '#f2c14e'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = '#f2c14e'; ctx.fillRect(-21, -31, 42, 3); ctx.strokeRect(-21, -31, 42, 3);
    ctx.lineWidth = 1.4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(e1, -21, 4.2, 0, 6.3); ctx.moveTo(e2 + 4.2, -21); ctx.arc(e2, -21, 4.2, 0, 6.3); ctx.stroke();
    ctx.save(); ctx.translate(hx, -18 + armUp * 0.5); ctx.rotate(dir * (o.atk ? 0.6 : -0.4)); ctx.lineWidth = 3; ctx.strokeStyle = '#7a7f86'; ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, -16); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -19, 4.5, 0.6, 5.7); ctx.lineWidth = 2.6; ctx.stroke(); ctx.restore();
  }
  else if (o.acc === 'nini') {
    /* tudung telinga kucing + bumerang */
    [-1, 1].forEach(function (sd) { ctx.beginPath(); ctx.moveTo(sd * 6, -29); ctx.lineTo(sd * 14, -42); ctx.lineTo(sd * 17, -28); ctx.closePath(); ctx.fillStyle = '#f6d1dd'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.moveTo(sd * 10, -31); ctx.lineTo(sd * 13.5, -38); ctx.lineTo(sd * 15, -30); ctx.fillStyle = '#e79bb6'; ctx.fill(); });
    ctx.save(); ctx.translate(hx + dir * 3, -20); ctx.rotate(o.atk ? t * 20 : -0.5); ctx.beginPath(); ctx.moveTo(-8, 6); ctx.quadraticCurveTo(-2, -2, 8, -8); ctx.lineTo(10, -5); ctx.quadraticCurveTo(0, 0, -5, 9); ctx.closePath(); ctx.fillStyle = '#f2c14e'; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  }
  if (o.pencil) { ctx.save(); ctx.translate(21, -18); ctx.rotate(-0.6); ctx.fillStyle = '#f2c14e'; ctx.fillRect(0, -2, 14, 4); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(0, -2, 14, 4); ctx.restore(); }
  ctx.restore();
}
function drawComot(x, y, r, o) {
  var tt = o.t || 0, k = r / 15;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(46,38,32,0.18)'; ctx.beginPath(); ctx.ellipse(0, 16, 15, 3.5, 0, 0, 6.3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-15, 2);
  for (var a = Math.PI; a <= Math.PI * 2 + 0.01; a += 0.3) { var rr = 15 + Math.sin(a * 5 + tt * 7 + (o.i || 0)) * 1.2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 1.05 + 2); }
  for (var q = 0; q <= 6; q++) ctx.lineTo(15 - q * 5, 15 + ((q % 2) ? -3.5 : 0) + Math.sin(tt * 12 + q + (o.i || 0)) * 1.2);
  ctx.closePath(); ctx.fillStyle = o.flash ? '#fff' : (o.col || NAVY); ctx.fill(); stroke(1.4 / k * 1.1, INK);
  if (o.detail !== false) { ctx.save(); ctx.clip(); scratch(-15, -15, 30, 30, 18, '#fff', 0.18, -0.8, (o.i || 0) * 3); ctx.restore(); }
  var lx = (o.lx || 0) * 1.8, ly = (o.ly || 0) * 1.8;
  [-5.5, 5.5].forEach(function (sx) { ctx.beginPath(); ctx.ellipse(sx, -3, 4.3, 5.3, 0, 0, 6.3); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); if (o.stun) { ctx.beginPath(); ctx.arc(sx, -3, 2, 0, 5); ctx.stroke(); } else { ctx.beginPath(); ctx.arc(sx + lx, -3 + ly, 2.1, 0, 6.3); ctx.fillStyle = INK; ctx.fill(); } });
  ctx.beginPath(); ctx.moveTo(-9, -10); ctx.lineTo(-3, -8); ctx.moveTo(9, -10); ctx.lineTo(3, -8); ctx.lineWidth = 1.6; ctx.strokeStyle = '#fff'; ctx.stroke();
  if (o.king) { ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-8, -22); ctx.lineTo(-4, -17); ctx.lineTo(0, -24); ctx.lineTo(4, -17); ctx.lineTo(8, -22); ctx.lineTo(8, -14); ctx.closePath(); ctx.fillStyle = GOLD; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.stroke(); }
  if (o.staff) { ctx.beginPath(); ctx.moveTo(14, 8); ctx.lineTo(20, -10); ctx.lineWidth = 2; ctx.strokeStyle = '#8f5a1f'; ctx.stroke(); ctx.beginPath(); ctx.arc(20, -12, 3, 0, 6.3); ctx.fillStyle = '#b06ad0'; ctx.fill(); }
  ctx.restore();
}
