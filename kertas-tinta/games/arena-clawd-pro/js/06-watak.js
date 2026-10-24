/* Arena Clawd Pro: Gambar Clawd, Si Comot, monster hutan */
'use strict';

/* ---------- watak ---------- */
function drawClawd(cx, fy, o) {
  var s = o.s || 1, face = o.face || 0, t = o.t || 0, H = o.hero ? HEROES[o.hero] : null, SK = o.skin && o.skin.col ? o.skin : null, col = o.col || (SK ? SK.col : H ? H.col : CL), colH = SK ? SK.colH : H ? H.colH : CL_H, C2 = SK ? SK.c2 : null;
  ctx.save(); ctx.translate(cx, fy); ctx.scale(s, s);
  if (o.shadow !== false) { ctx.fillStyle = 'rgba(46,38,32,0.18)'; ctx.beginPath(); ctx.ellipse(0, 1, 20, 4.5, 0, 0, 6.3); ctx.fill(); }
  if (SK) skinBack(SK, t, face >= 0 ? 1 : -1);
  var lx = [-14, -8.6, 5, 10.4], ph = o.run ? Math.sin(t * 20) : 0;
  ctx.lineWidth = 1.1; ctx.strokeStyle = INK;
  for (var i = 0; i < 4; i++) { var lift = o.run ? Math.max(0, (i % 2 ? ph : -ph)) * 3 : 0; ctx.fillStyle = col; ctx.fillRect(lx[i], -10, 3.6, 10 - lift); ctx.strokeRect(lx[i], -10, 3.6, 10 - lift); }
  var armUp = o.atk ? -6 : 0, fr = face >= 0, dir = fr ? 1 : -1;
  if (o.hero === 'pahlawan' && o.cape !== false) { ctx.beginPath(); ctx.moveTo(-15 * dir, -27); ctx.quadraticCurveTo(-26 * dir, -20 + Math.sin(t * 12) * 3, -28 * dir, -6 + Math.sin(t * 12 + 1) * 2); ctx.lineTo(-14 * dir, -12); ctx.closePath(); ctx.fillStyle = C2 || '#d9534a'; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = INK; ctx.stroke(); }
  if (o.hero === 'bayang' && o.cape !== false) { ctx.beginPath(); ctx.moveTo(-12 * dir, -26); ctx.quadraticCurveTo(-24 * dir, -30 + Math.sin(t * 14) * 3, -32 * dir, -22 + Math.sin(t * 14 + 1) * 4); ctx.lineTo(-30 * dir, -16 + Math.sin(t * 14 + 2) * 3); ctx.quadraticCurveTo(-22 * dir, -22, -12 * dir, -21); ctx.closePath(); ctx.fillStyle = C2 || '#3a3150'; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.fillStyle = col; ctx.fillRect(-21.5, -21 + (!fr ? armUp : 0), 5, 6.5); ctx.strokeRect(-21.5, -21 + (!fr ? armUp : 0), 5, 6.5);
  ctx.fillRect(16.5, -21 + (fr ? armUp : 0), 5, 6.5); ctx.strokeRect(16.5, -21 + (fr ? armUp : 0), 5, 6.5);
  wobRect(-17, -29, 34, 20, 7, 0.45); ctx.fillStyle = col; ctx.fill();
  if (o.detail !== false) { ctx.save(); ctx.clip(); scratch(-17, -29, 34, 20, 30, colH, 0.55, -0.9, 3); ctx.restore(); }
  wobRect(-17, -29, 34, 20, 7, 0.45); stroke(1.5 / Math.max(0.6, s) * 0.9, INK);
  if (o.hero === 'bayang') { ctx.fillStyle = C2 || '#3a3150'; ctx.fillRect(-17.5, -27.5, 35, 5); ctx.lineWidth = 0.9; ctx.strokeStyle = INK; ctx.strokeRect(-17.5, -27.5, 35, 5); }
  var e1 = -6.5 + face * 2, e2 = 6.5 + face * 2, ey = o.hero === 'bayang' ? 1.5 : 0;
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  if (o.mood === 'happy') { ctx.beginPath(); ctx.moveTo(e1 - 2.6, -19); ctx.lineTo(e1, -22.4); ctx.lineTo(e1 + 2.6, -19); ctx.moveTo(e2 - 2.6, -19); ctx.lineTo(e2, -22.4); ctx.lineTo(e2 + 2.6, -19); ctx.stroke(); }
  else if (o.mood === 'hurt') { ctx.beginPath(); ctx.moveTo(e1 - 2, -23); ctx.lineTo(e1 + 2, -19); ctx.moveTo(e1 + 2, -23); ctx.lineTo(e1 - 2, -19); ctx.moveTo(e2 - 2, -23); ctx.lineTo(e2 + 2, -19); ctx.moveTo(e2 + 2, -23); ctx.lineTo(e2 - 2, -19); ctx.stroke(); }
  else if (o.blink) { ctx.fillRect(e1 - 1.5, -20.5 + ey, 3, 1.3); ctx.fillRect(e2 - 1.5, -20.5 + ey, 3, 1.3); }
  else { ctx.fillRect(e1 - 1.4, -24 + ey * 2, 2.9, 6.2 - ey); ctx.fillRect(e2 - 1.4, -24 + ey * 2, 2.9, 6.2 - ey); }
  if (o.angry) { ctx.beginPath(); ctx.moveTo(e1 - 4, -28); ctx.lineTo(e1 + 2.5, -25.5); ctx.moveTo(e2 + 4, -28); ctx.lineTo(e2 - 2.5, -25.5); ctx.lineWidth = 1.8; ctx.stroke(); }
  var hx = fr ? 21 : -21;
  if (o.hero === 'pahlawan') { ctx.save(); ctx.translate(hx, -18 + armUp * 0.5); ctx.rotate(dir * (o.atk ? 0.4 : -0.7)); ctx.fillStyle = '#f2c14e'; ctx.fillRect(-2, -26, 5, 26); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-2, -26, 5, 26); ctx.beginPath(); ctx.moveTo(-2, -26); ctx.lineTo(0.5, -33); ctx.lineTo(3, -26); ctx.closePath(); ctx.fillStyle = '#f6e3c4'; ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(-4, -2, 9, 3); ctx.restore(); }
  else if (o.hero === 'pemanah') { ctx.strokeStyle = C2 || '#d9534a'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-17, -26.5); ctx.lineTo(17, -26.5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-17 * dir, -26.5); ctx.quadraticCurveTo(-24 * dir, -30 + Math.sin(t * 16) * 2, -28 * dir, -24 + Math.sin(t * 16 + 1) * 3); ctx.lineWidth = 1.6; ctx.stroke(); ctx.save(); ctx.translate(hx + dir * 3, -18); ctx.beginPath(); if (fr) ctx.arc(0, 0, 13, -1.3, 1.3); else ctx.arc(0, 0, 13, Math.PI - 1.3, Math.PI + 1.3); ctx.lineWidth = 2.2; ctx.strokeStyle = '#8f5a1f'; ctx.stroke(); ctx.beginPath(); ctx.moveTo(Math.cos(1.3) * 13 * dir, -Math.sin(1.3) * 13); ctx.lineTo(Math.cos(1.3) * 13 * dir, Math.sin(1.3) * 13); ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  else if (o.hero === 'sihir') { ctx.beginPath(); ctx.moveTo(-15, -29); ctx.lineTo(15, -29); ctx.lineTo(4, -48); ctx.quadraticCurveTo(10, -52, 12, -46); ctx.lineTo(3, -50); ctx.closePath(); ctx.fillStyle = C2 || '#5a3d8f'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke(); star4(-1, -38, 3, t * 2, GOLD, 1.3); ctx.save(); ctx.translate(hx, -16); ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(dir * 4, -20); ctx.lineWidth = 2.2; ctx.strokeStyle = '#8f5a1f'; ctx.stroke(); star4(dir * 4, -22, 5 + Math.sin(t * 8) * 1.2, t * 3, GOLD, 1.8); ctx.restore(); }
  else if (o.hero === 'perisai') {
    ctx.beginPath(); ctx.moveTo(-15, -29); ctx.quadraticCurveTo(0, -46, 15, -29); ctx.closePath(); ctx.fillStyle = C2 || '#9aa3a8'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(0, -46); ctx.stroke(); ctx.fillStyle = '#d9534a'; ctx.beginPath(); ctx.arc(0, -47, 2.6, 0, 6.3); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(hx + dir * 4, -15 + armUp * 0.4); inkCircle(0, 0, 11.5, 1, 0.6, 1.4, INK, '#c9d2a0'); inkCircle(0, 0, 6, 2, 0.4, 1, INK, GOLD); ctx.restore();
  }
  else if (o.hero === 'bayang') { ctx.save(); ctx.translate(hx, -18 + armUp * 0.5); ctx.rotate(dir * (o.atk ? 0.9 : 0.3)); ctx.fillStyle = '#d6dbe3'; ctx.beginPath(); ctx.moveTo(-1.5, 0); ctx.lineTo(0.5, -17); ctx.lineTo(2.5, 0); ctx.closePath(); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(-3.5, -1, 8, 3); ctx.restore(); }
  else if (o.hero === 'penyembuh') {
    for (var lf = 0; lf < 5; lf++) { var la = -2.3 + lf * 0.4; ctx.save(); ctx.translate(Math.cos(la) * 16, -29 + Math.sin(la) * 6 - 2); ctx.rotate(la + 1.57); ctx.beginPath(); ctx.ellipse(0, -4, 2.8, 5.5, 0, 0, 6.3); ctx.fillStyle = lf % 2 ? '#7aa64c' : '#8cb35a'; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.translate(hx, -16); ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(dir * 3, -18); ctx.lineWidth = 2.2; ctx.strokeStyle = '#8f5a1f'; ctx.stroke(); heart(dir * 3, -22, 5.5 + Math.sin(t * 6) * 0.8, '#e8607e'); ctx.restore();
  }
  else if (o.hero === 'nini') {
    var HC = C2 || '#f19bb4';
    [-1, 1].forEach(function (sd) { ctx.beginPath(); ctx.moveTo(sd * 16.5, -27); ctx.lineTo(sd * 15, -41); ctx.lineTo(sd * 5, -29); ctx.closePath(); ctx.fillStyle = HC; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.moveTo(sd * 14, -29.5); ctx.lineTo(sd * 13.6, -37); ctx.lineTo(sd * 8.5, -29.5); ctx.closePath(); ctx.fillStyle = '#fff3f6'; ctx.fill(); });
    ctx.fillStyle = HC; ctx.fillRect(-17.5, -30, 35, 4.5); ctx.lineWidth = 0.9; ctx.strokeStyle = INK; ctx.strokeRect(-17.5, -30, 35, 4.5);
    ctx.fillStyle = '#fff3f6'; [-10, -3, 4, 11].forEach(function (bx) { ctx.beginPath(); ctx.arc(bx, -27.7, 1, 0, 6.3); ctx.fill(); });
    ctx.save(); ctx.translate(hx, -18 + armUp * 0.4); ctx.rotate(dir * (o.atk ? 0.9 : -0.35) + (o.atk ? t * 14 : 0)); drawBoomerang(0, -4, 0.72, HC); ctx.restore();
    if (o.cape !== false) drawMochi(-dir * 27, -40 + Math.sin(t * 3) * 3, 0.62, t, '#ffffff', -dir);
  }
  if (o.pencil) { ctx.save(); ctx.translate(21, -18); ctx.rotate(-0.6); ctx.fillStyle = '#f2c14e'; ctx.fillRect(0, -2, 14, 4); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(0, -2, 14, 4); ctx.restore(); }
  if (o.crown) { ctx.beginPath(); ctx.moveTo(-9, -29); ctx.lineTo(-9, -37); ctx.lineTo(-4.5, -32); ctx.lineTo(0, -39); ctx.lineTo(4.5, -32); ctx.lineTo(9, -37); ctx.lineTo(9, -29); ctx.closePath(); ctx.fillStyle = GOLD; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); }
  if (SK) skinFront(SK, t, dir, o.hero);
  if (o.cannon) { ctx.save(); ctx.translate(-dir * 20, -6); ctx.fillStyle = '#4a4440'; ctx.save(); ctx.rotate(-dir * 0.35); ctx.fillRect(dir > 0 ? -2 : -16, -5, 18, 10); ctx.restore(); ctx.beginPath(); ctx.arc(0, 4, 5, 0, 6.3); ctx.fillStyle = '#8f5a1f'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
/* bumerang Nini dan Mochi si kucing (juga bentuk minion yang disihir) */
function drawBoomerang(x, y, k, tip) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); ctx.moveTo(-12, 6); ctx.quadraticCurveTo(-2, -14, 0, -14); ctx.quadraticCurveTo(2, -14, 12, 6); ctx.lineTo(8, 8); ctx.quadraticCurveTo(0, -6, -8, 8); ctx.closePath();
  ctx.fillStyle = '#f2c14e'; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = tip || '#f19bb4'; ctx.beginPath(); ctx.arc(-10, 7, 2.4, 0, 6.3); ctx.arc(10, 7, 2.4, 0, 6.3); ctx.fill(); ctx.restore();
}
function drawMochi(x, y, k, t, col, face) {
  var f = face || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(k * f, k);
  ctx.beginPath(); ctx.moveTo(-10, 4); ctx.quadraticCurveTo(-20, 2 + Math.sin(t * 4) * 3, -18, -8); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 1.6; ctx.strokeStyle = col; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-2, 4, 11, 7.5, 0, 0, 6.3); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1, -6); ctx.lineTo(3, -15); ctx.lineTo(7, -9); ctx.lineTo(11, -15); ctx.lineTo(13, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(7, -3, 7.5, 0, 6.3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f19bb4'; ctx.beginPath(); ctx.moveTo(3.4, -11); ctx.lineTo(4, -13.6); ctx.lineTo(5.6, -10.6); ctx.fill(); ctx.beginPath(); ctx.moveTo(10.4, -10.6); ctx.lineTo(10.8, -13.6); ctx.lineTo(12.2, -11); ctx.fill();
  ctx.fillStyle = INK; ctx.fillRect(4, -5, 1.6, 2.6); ctx.fillRect(9, -5, 1.6, 2.6);
  ctx.fillStyle = '#e8607e'; ctx.beginPath(); ctx.arc(7.3, -1.2, 1, 0, 6.3); ctx.fill();
  ctx.restore();
}
function drawComot(x, y, r, o) {
  var tt = o.t || 0, k = r / 15;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(46,38,32,0.18)'; ctx.beginPath(); ctx.ellipse(0, 16, 15, 3.5, 0, 0, 6.3); ctx.fill();
  if (o.cannon) { ctx.save(); ctx.translate(-14, 10); ctx.rotate(0.35); ctx.fillStyle = '#2a2a36'; ctx.fillRect(-14, -4, 16, 8); ctx.restore(); ctx.beginPath(); ctx.arc(-12, 13, 4, 0, 6.3); ctx.fillStyle = '#8f5a1f'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); }
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
function stunStars(x, y) { for (var i = 0; i < 3; i++) { var a = time * 5 + i * 2.1; star4(x + Math.cos(a) * 14, y + Math.sin(a) * 4, 4, a, GOLD, 1.5); } }
function drawMonster(m) {
  var tt = time, x = m.x, y = m.y, flash = m.hitT > 0;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(46,38,32,0.2)'; ctx.beginPath(); ctx.ellipse(0, 4, m.r * 1.1, m.r * 0.35, 0, 0, 6.3); ctx.fill();
  if (m.type === 'kelomang') {
    var w = Math.sin(tt * 10 + m.i) * (m.moving ? 3 : 1);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; for (var l = 0; l < 3; l++) { ctx.beginPath(); ctx.moveTo(-6, -6 + l * 4); ctx.lineTo(-20, 2 + l * 4 + w); ctx.moveTo(6, -6 + l * 4); ctx.lineTo(20, 2 + l * 4 - w); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(-17, -14, 6, 0, 6.3); ctx.arc(17, -14, 6, 0, 6.3); ctx.fillStyle = '#e8705a'; ctx.fill(); ctx.lineWidth = 1.2; ctx.stroke();
    inkCircle(0, -14, 15, 2, 1.5, 1.6, INK, flash ? '#fff' : '#f2b07a');
    ctx.beginPath(); for (var a = 0; a < 9; a += 0.25) { var rr = 13 - a * 1.3; ctx.lineTo(Math.cos(a) * rr, -14 + Math.sin(a) * rr); } stroke(1.2, '#a8552e');
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(-6, 4); ctx.moveTo(4, -2); ctx.lineTo(6, 4); ctx.lineWidth = 1.4; ctx.stroke(); ctx.beginPath(); ctx.arc(-6, 5, 2.2, 0, 6.3); ctx.arc(6, 5, 2.2, 0, 6.3); ctx.fill();
  } else if (m.type === 'merah') {
    ctx.beginPath(); ctx.ellipse(0, -16, 26, 20, 0, 0, 6.3); ctx.fillStyle = flash ? '#fff' : '#d9534a'; ctx.fill(); stroke(1.8, INK);
    ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(0, 4); stroke(1.4, INK);
    [[-10, -22], [10, -12], [-8, -6], [12, -26]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, 6.3); ctx.fillStyle = INK; ctx.fill(); });
    ctx.beginPath(); ctx.moveTo(-8, -34); ctx.quadraticCurveTo(-16, -48, -6, -52); ctx.moveTo(8, -34); ctx.quadraticCurveTo(16, -48, 6, -52); stroke(2, INK);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-8, -30, 3.5, 0, 6.3); ctx.arc(8, -30, 3.5, 0, 6.3); ctx.fill(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-8, -30, 1.6, 0, 6.3); ctx.arc(8, -30, 1.6, 0, 6.3); ctx.fill();
  } else if (m.type === 'biru') {
    ctx.beginPath(); ctx.ellipse(-6, -4, 26, 8, 0, 0, 6.3); ctx.fillStyle = flash ? '#fff' : '#9cc3e6'; ctx.fill(); stroke(1.5, INK);
    ctx.beginPath(); ctx.moveTo(-26, -6); ctx.lineTo(-34, -24); ctx.moveTo(-22, -6); ctx.lineTo(-26, -26); stroke(1.4, INK); ctx.beginPath(); ctx.arc(-34, -26, 2.6, 0, 6.3); ctx.arc(-26, -28, 2.6, 0, 6.3); ctx.fillStyle = INK; ctx.fill();
    inkCircle(6, -22, 20, 3, 1.5, 1.8, INK, flash ? '#fff' : SKY);
    ctx.beginPath(); for (var b = 0; b < 10; b += 0.25) { var r2 = 17 - b * 1.6; ctx.lineTo(6 + Math.cos(b + tt) * r2, -22 + Math.sin(b + tt) * r2); } stroke(1.4, '#2f5d8e');
    ctx.globalAlpha = 0.4 + Math.sin(tt * 4) * 0.2; star4(6, -22, 6, tt, '#fff', 1.5); ctx.globalAlpha = 1;
  } else if (m.type === 'penyu') {
    var hx = Math.sin(tt * 2) * 3;
    ctx.fillStyle = '#8fb07a'; [[-30, 4], [30, 4], [-26, -26], [26, -26]].forEach(function (p) { ctx.beginPath(); ctx.ellipse(p[0], p[1], 10, 7, 0, 0, 6.3); ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = INK; ctx.stroke(); });
    ctx.beginPath(); ctx.ellipse(hx, -48, 13, 11, 0, 0, 6.3); ctx.fillStyle = '#8fb07a'; ctx.fill(); stroke(1.4, INK);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(hx - 5, -50, 2.2, 0, 6.3); ctx.arc(hx + 5, -50, 2.2, 0, 6.3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -12, 40, 32, 0, 0, 6.3); ctx.fillStyle = flash ? '#fff' : '#5f7d6a'; ctx.fill(); stroke(2, INK);
    ctx.strokeStyle = '#2f4a3a'; ctx.lineWidth = 1.5; for (var hI = 0; hI < 6; hI++) { var ha = hI / 6 * 6.283, hr = 18; ctx.beginPath(); for (var v = 0; v < 6; v++) { var va = v / 6 * 6.283; ctx.lineTo(Math.cos(ha) * hr + Math.cos(va) * 9, -12 + Math.sin(ha) * hr * 0.8 + Math.sin(va) * 7); } ctx.closePath(); ctx.stroke(); }
    if (m.tele > 0) { ctx.globalAlpha = 0.3; ctx.fillStyle = '#d9534a'; ctx.beginPath(); ctx.arc(0, 0, MON.penyu.range * (1 - m.tele), 0, 6.3); ctx.fill(); ctx.globalAlpha = 1; }
  }
  ctx.restore();
  if (m.type === 'merah' && Math.random() < 0.3) G.fx.push({ kind: 'p', type: 'fire', x: x + (Math.random() - 0.5) * 30, y: y - 30, vx: 0, vy: -40, t: 0, life: 0.5, r: 3, rot: 0 });
  if (m.stunT > 0) stunStars(x, y - m.r - 30);
  if (m.hp < m.max || nearHero(m, 300)) hpBar(x, y - m.r - 26 - (m.type === 'penyu' ? 30 : 0), m.type === 'penyu' ? 80 : 52, m.hp / m.max, '#c9a227');
  if (nearHero(m, 260)) { ctx.font = '700 18px Caveat, cursive'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(tx(MON[m.type].nama), x, y + 24); }
}
