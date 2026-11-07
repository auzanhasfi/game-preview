/* Misi Detektif Nyamuk: watak. Badan Clawd & Si Comot diambil dari Arena Clawd Pro, ditambah topi detektif, kanta,
   nyamuk Aedes/tiruk, penduduk taman dan bekas air. Semua fungsi melukis pada `ctx` semasa. */
'use strict';

/* Clawd detektif: o = {s, face(-1..1), t, run, mood:'happy'|'hurt'|'think', blink, lens, cape} */
function drawClawd(cx, fy, o) {
  var s = o.s || 1, face = o.face || 0, t = o.t || 0, col = CL, fr = face >= 0, dir = fr ? 1 : -1;
  ctx.save(); ctx.translate(cx, fy); ctx.scale(s, s);
  if (o.shadow !== false) { ctx.fillStyle = 'rgba(46,38,32,0.18)'; ctx.beginPath(); ctx.ellipse(0, 1, 20, 4.5, 0, 0, 6.3); ctx.fill(); }
  var lx = [-14, -8.6, 5, 10.4], ph = o.run ? Math.sin(t * 20) : 0;
  ctx.lineWidth = 1.1; ctx.strokeStyle = INK;
  for (var i = 0; i < 4; i++) { var lift = o.run ? Math.max(0, (i % 2 ? ph : -ph)) * 3 : 0; ctx.fillStyle = col; ctx.fillRect(lx[i], -10, 3.6, 10 - lift); ctx.strokeRect(lx[i], -10, 3.6, 10 - lift); }
  /* jubah detektif pendek */
  if (o.cape !== false) { ctx.beginPath(); ctx.moveTo(-17, -24); ctx.lineTo(17, -24); ctx.lineTo(19, -12 + Math.sin(t * 8) * 1); ctx.lineTo(-19, -12 + Math.sin(t * 8 + 1) * 1); ctx.closePath(); ctx.fillStyle = '#8a6a43'; ctx.fill(); ctx.lineWidth = 1.1; ctx.strokeStyle = INK; ctx.stroke(); }
  var armUp = o.lens ? -5 : 0;
  ctx.fillStyle = col; ctx.fillRect(-21.5, -21 + (!fr ? armUp : 0), 5, 6.5); ctx.strokeRect(-21.5, -21 + (!fr ? armUp : 0), 5, 6.5);
  ctx.fillRect(16.5, -21 + (fr ? armUp : 0), 5, 6.5); ctx.strokeRect(16.5, -21 + (fr ? armUp : 0), 5, 6.5);
  wobRect(-17, -29, 34, 17, 7, 0.45); ctx.fillStyle = col; ctx.fill();
  ctx.save(); ctx.clip(); scratch(-17, -29, 34, 17, 26, CL_H, 0.55, -0.9, 3); ctx.restore();
  wobRect(-17, -29, 34, 17, 7, 0.45); stroke(1.5 / Math.max(0.6, s) * 0.9, INK);
  var e1 = -6.5 + face * 2, e2 = 6.5 + face * 2;
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  if (o.mood === 'happy') { ctx.beginPath(); ctx.moveTo(e1 - 2.6, -19); ctx.lineTo(e1, -22.4); ctx.lineTo(e1 + 2.6, -19); ctx.moveTo(e2 - 2.6, -19); ctx.lineTo(e2, -22.4); ctx.lineTo(e2 + 2.6, -19); ctx.stroke(); }
  else if (o.mood === 'hurt') { ctx.beginPath(); ctx.moveTo(e1 - 2, -23); ctx.lineTo(e1 + 2, -19); ctx.moveTo(e1 + 2, -23); ctx.lineTo(e1 - 2, -19); ctx.moveTo(e2 - 2, -23); ctx.lineTo(e2 + 2, -19); ctx.moveTo(e2 + 2, -23); ctx.lineTo(e2 - 2, -19); ctx.stroke(); }
  else if (o.blink) { ctx.fillRect(e1 - 1.5, -20.5, 3, 1.3); ctx.fillRect(e2 - 1.5, -20.5, 3, 1.3); }
  else { ctx.fillRect(e1 - 1.4, -24, 2.9, 6.2); ctx.fillRect(e2 - 1.4, -24, 2.9, 6.2); if (o.mood === 'think') { ctx.beginPath(); ctx.moveTo(e2 - 3, -27.5); ctx.lineTo(e2 + 3, -26); ctx.stroke(); } }
  /* topi detektif (deerstalker) */
  ctx.beginPath(); ctx.moveTo(-19, -28); ctx.quadraticCurveTo(-16, -42, 0, -43); ctx.quadraticCurveTo(16, -42, 19, -28); ctx.closePath();
  ctx.fillStyle = '#b8935c'; ctx.fill(); ctx.save(); ctx.clip(); ctx.strokeStyle = '#8a6a43'; ctx.lineWidth = 1;
  for (var k = -20; k < 22; k += 5) { ctx.beginPath(); ctx.moveTo(k, -44); ctx.lineTo(k + 8, -27); ctx.stroke(); ctx.beginPath(); ctx.moveTo(k + 8, -44); ctx.lineTo(k, -27); ctx.stroke(); }
  ctx.restore(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-22 * dir, -29); ctx.lineTo(-12 * dir, -31); ctx.lineTo(-12 * dir, -28); ctx.closePath(); ctx.fillStyle = '#8a6a43'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -43); ctx.lineTo(0, -46); ctx.stroke();
  /* kanta pembesar */
  var hx = fr ? 21 : -21;
  ctx.save(); ctx.translate(hx, -18 + armUp * 0.6); ctx.rotate(dir * (o.lens ? -0.2 : 0.5));
  ctx.fillStyle = '#5a3d22'; ctx.fillRect(-1.5, 0, 3, 9); ctx.strokeRect(-1.5, 0, 3, 9);
  ctx.beginPath(); ctx.arc(0, -6, 6.5, 0, 6.3); ctx.fillStyle = 'rgba(190,225,240,0.75)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = GOLD; ctx.stroke(); ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, -6, 7.5, 0, 6.3); ctx.stroke();
  ctx.beginPath(); ctx.arc(-2, -8, 2, 3.4, 4.6); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/* Si Comot (dari Arena), o = {t, king, flash, i} */
function drawComot(x, y, r, o) {
  var tt = o.t || 0, k = r / 15;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(46,38,32,0.18)'; ctx.beginPath(); ctx.ellipse(0, 16, 15, 3.5, 0, 0, 6.3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-15, 2);
  for (var a = Math.PI; a <= Math.PI * 2 + 0.01; a += 0.3) { var rr = 15 + Math.sin(a * 5 + tt * 7 + (o.i || 0)) * 1.2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 1.05 + 2); }
  for (var q = 0; q <= 6; q++) ctx.lineTo(15 - q * 5, 15 + ((q % 2) ? -3.5 : 0) + Math.sin(tt * 12 + q + (o.i || 0)) * 1.2);
  ctx.closePath(); ctx.fillStyle = o.flash ? '#fff' : (o.col || NAVY); ctx.fill(); stroke(1.4 / k * 1.1, INK);
  ctx.save(); ctx.clip(); scratch(-15, -15, 30, 30, 18, '#fff', 0.18, -0.8, (o.i || 0) * 3); ctx.restore();
  [-5.5, 5.5].forEach(function (sx) { ctx.beginPath(); ctx.ellipse(sx, -3, 4.3, 5.3, 0, 0, 6.3); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); if (o.stun) { ctx.beginPath(); ctx.arc(sx, -3, 2, 0, 5); ctx.stroke(); } else { ctx.beginPath(); ctx.arc(sx + (o.lx || 0), -3, 2.1, 0, 6.3); ctx.fillStyle = INK; ctx.fill(); } });
  ctx.beginPath(); ctx.moveTo(-9, -10); ctx.lineTo(-3, -8); ctx.moveTo(9, -10); ctx.lineTo(3, -8); ctx.lineWidth = 1.6; ctx.strokeStyle = '#fff'; ctx.stroke();
  if (o.king) { ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-8, -22); ctx.lineTo(-4, -17); ctx.lineTo(0, -24); ctx.lineTo(4, -17); ctx.lineTo(8, -22); ctx.lineTo(8, -14); ctx.closePath(); ctx.fillStyle = GOLD; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.stroke(); }
  if (o.baldi) { ctx.save(); ctx.translate(15, 6); ctx.beginPath(); ctx.moveTo(-4, -5); ctx.lineTo(4, -5); ctx.lineTo(3, 4); ctx.lineTo(-3, 4); ctx.closePath(); ctx.fillStyle = '#9aa3a8'; ctx.fill(); ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = AIR; ctx.fillRect(-3.5, -4, 7, 2); ctx.restore(); }
  ctx.restore();
}

/* nyamuk: jenis 'aedes' | 'tiruk', s skala, t masa, o.hinggap (pose diam), o.jantan */
function drawNyamuk(x, y, s, jenis, t, o) {
  o = o || {};
  var aedes = jenis === 'aedes', badan = aedes ? '#22201f' : '#7b6a55';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (!aedes && o.hinggap) ctx.rotate(-0.55);
  var fl = o.hinggap ? 0 : Math.sin(t * 60) * 0.5;
  /* sayap */
  ctx.fillStyle = 'rgba(210,225,235,0.55)'; ctx.strokeStyle = 'rgba(46,38,32,0.6)'; ctx.lineWidth = 0.7;
  [[-1, fl], [1, -fl]].forEach(function (w) { ctx.save(); ctx.translate(-2, -4); ctx.rotate(-0.35 + w[1] * 0.6 + (w[0] > 0 ? 0.35 : 0)); ctx.beginPath(); ctx.ellipse(-9, -5, 11, 3.6, -0.15, 0, 6.3); ctx.fill(); ctx.stroke(); ctx.restore(); });
  /* kaki */
  ctx.lineWidth = 1; ctx.strokeStyle = INK;
  for (var i = 0; i < 6; i++) {
    var bx = -4 + (i % 3) * 3, sd = i < 3 ? 1 : -1, ax = bx + (i % 3 - 1) * 9, ay = 13 + (i % 3 === 1 ? 2 : 0);
    ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx + (ax - bx) * 0.5, 6 * sd > 0 ? 7 : 7); ctx.lineTo(ax, ay); ctx.stroke();
    if (aedes) { ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.1; for (var b = 0.55; b < 1; b += 0.18) { var px = bx + (ax - bx) * b, py = 7 + (ay - 7) * ((b - 0.5) * 2); ctx.beginPath(); ctx.moveTo(px - 0.8, py - 0.8); ctx.lineTo(px + 0.8, py + 0.8); ctx.stroke(); } ctx.restore(); }
  }
  /* abdomen */
  ctx.beginPath(); ctx.ellipse(-12, -1, 10, 3.6, 0.15, 0, 6.3); ctx.fillStyle = badan; ctx.fill(); ctx.lineWidth = 0.9; ctx.strokeStyle = INK; ctx.stroke();
  if (aedes) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; for (var r = -18; r < -4; r += 3.6) { ctx.beginPath(); ctx.moveTo(r, -3.6); ctx.lineTo(r + 0.8, 2.2); ctx.stroke(); } }
  /* toraks + kepala + belalai */
  ctx.beginPath(); ctx.ellipse(0, -2, 5, 4.4, 0, 0, 6.3); ctx.fillStyle = badan; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke();
  if (aedes) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-1.5, -5.5); ctx.quadraticCurveTo(0, -2, -1.5, 1); ctx.moveTo(1.5, -5.5); ctx.quadraticCurveTo(0, -2, 1.5, 1); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(6.5, -3, 2.6, 0, 6.3); ctx.fillStyle = badan; ctx.fill(); ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8.5, -2.5); ctx.lineTo(17, o.hinggap && !aedes ? 2 : 1); ctx.lineWidth = 1.1; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -4.5); ctx.lineTo(13, -9); ctx.moveTo(8, -4.5); ctx.lineTo(14, -6.5); ctx.lineWidth = 0.7; ctx.stroke();
  if (o.mata !== false) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(7.2, -3.6, 1.1, 0, 6.3); ctx.fill(); }
  ctx.restore();
}

/* penduduk: rambut, baju, kulit; o.sakit (pipi merah, termometer), o.tudung, o.uban, o.kot (doktor) */
function drawOrang(x, y, s, o) {
  o = o || {}; var t = o.t || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(46,38,32,0.16)'; ctx.beginPath(); ctx.ellipse(0, 1, 14, 3.5, 0, 0, 6.3); ctx.fill();
  ctx.lineWidth = 1.1; ctx.strokeStyle = INK;
  ctx.fillStyle = o.seluar || '#3d4f74'; ctx.fillRect(-7, -14, 5, 14); ctx.strokeRect(-7, -14, 5, 14); ctx.fillRect(2, -14, 5, 14); ctx.strokeRect(2, -14, 5, 14);
  wobRect(-11, -36, 22, 24, 5, 0.4); ctx.fillStyle = o.kot ? '#ffffff' : (o.baju || '#7fb8d9'); ctx.fill(); stroke(1.2, INK);
  if (o.kot) { ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(0, -12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-4, -30); ctx.arc(-4, -26, 4, -1.57, 1.57); ctx.strokeStyle = '#6b7a8f'; ctx.stroke(); ctx.strokeStyle = INK; }
  var kepY = -46 + Math.sin(t * 2) * 0.6;
  if (o.tudung) { ctx.beginPath(); ctx.ellipse(0, kepY + 2, 12, 13, 0, 0, 6.3); ctx.fillStyle = o.tudung; ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, kepY, 9, 0, 6.3); ctx.fillStyle = o.kulit || '#c98f62'; ctx.fill(); ctx.stroke();
  if (!o.tudung) { ctx.beginPath(); ctx.arc(0, kepY - 1, 9.4, 3.3, 6.1); ctx.lineTo(9, kepY - 3); ctx.quadraticCurveTo(0, kepY - 6, -9, kepY - 3); ctx.closePath(); ctx.fillStyle = o.uban ? '#d8d4cc' : (o.rambut || '#2e2620'); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = INK;
  if (o.lemah) { ctx.fillRect(-4.5, kepY, 3, 1.2); ctx.fillRect(1.5, kepY, 3, 1.2); }
  else { ctx.fillRect(-4, kepY - 1.5, 2, 3); ctx.fillRect(2, kepY - 1.5, 2, 3); }
  ctx.beginPath(); if (o.sakit || o.lemah) ctx.arc(0, kepY + 6, 2.4, 3.4, 6); else ctx.arc(0, kepY + 3, 2.6, 0.3, 2.8); ctx.lineWidth = 1; ctx.stroke();
  if (o.sakit) { ctx.fillStyle = 'rgba(214,73,106,0.55)'; ctx.beginPath(); ctx.arc(-5.5, kepY + 3, 2.2, 0, 6.3); ctx.arc(5.5, kepY + 3, 2.2, 0, 6.3); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(-7, kepY - 8, 14, 4); ctx.strokeRect(-7, kepY - 8, 14, 4); }
  if (o.ruam) { ctx.fillStyle = DENG; for (var i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-8 + hsh(i) * 16, -32 + hsh(i + 9) * 18, 1.1, 0, 6.3); ctx.fill(); } }
  if (o.gigil) ctx.translate(Math.sin(t * 50) * 0.8, 0);
  ctx.restore();
}

/* bekas air (tempat pembiakan) */
function drawBekas(jenis, x, y, s, o) {
  o = o || {}; var t = o.t || 0, bersih = o.bersih;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineWidth = 1.2; ctx.strokeStyle = INK;
  function air(cx, cy, rx, ry) { if (bersih) return; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.3); ctx.fillStyle = AIR; ctx.fill(); ctx.lineWidth = 0.8; ctx.stroke(); ctx.strokeStyle = INK; for (var j = 0; j < 3; j++) { var jx = cx - rx * 0.5 + j * rx * 0.5, jy = cy + Math.sin(t * 4 + j) * ry * 0.3; ctx.beginPath(); ctx.moveTo(jx - 2, jy); ctx.quadraticCurveTo(jx, jy - 1.5 + Math.sin(t * 9 + j), jx + 2, jy); ctx.lineWidth = 1; ctx.stroke(); } }
  if (jenis === 'pasu') { ctx.beginPath(); ctx.ellipse(0, 0, 16, 5, 0, 0, 6.3); ctx.fillStyle = '#b8643f'; ctx.fill(); ctx.stroke(); air(0, -0.5, 12, 3.2); ctx.beginPath(); ctx.moveTo(-9, -2); ctx.lineTo(-7, -20); ctx.lineTo(7, -20); ctx.lineTo(9, -2); ctx.closePath(); ctx.fillStyle = '#c8774f'; ctx.fill(); ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = HIJAU; [[-5, -28], [0, -33], [5, -27]].forEach(function (p) { ctx.beginPath(); ctx.ellipse(p[0], p[1], 3.5, 7, p[0] * 0.08, 0, 6.3); ctx.fill(); ctx.stroke(); }); }
  else if (jenis === 'tayar') { ctx.beginPath(); ctx.ellipse(0, -6, 18, 9, 0, 0, 6.3); ctx.fillStyle = '#2f2d2c'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -7, 9, 4, 0, 0, 6.3); ctx.fillStyle = '#5a5552'; ctx.fill(); ctx.stroke(); air(0, -6.5, 8, 3); }
  else if (jenis === 'tempayan') { ctx.beginPath(); ctx.moveTo(-10, -30); ctx.quadraticCurveTo(-20, -14, -10, 0); ctx.lineTo(10, 0); ctx.quadraticCurveTo(20, -14, 10, -30); ctx.closePath(); ctx.fillStyle = '#a65a36'; ctx.fill(); ctx.stroke(); if (bersih) { ctx.beginPath(); ctx.ellipse(0, -31, 12, 3.5, 0, 0, 6.3); ctx.fillStyle = '#6b4a2f'; ctx.fill(); ctx.stroke(); } else air(0, -30, 10, 3); }
  else if (jenis === 'tin') { ctx.fillStyle = '#c9ccd1'; ctx.fillRect(-12, -12, 9, 12); ctx.strokeRect(-12, -12, 9, 12); if (!bersih) air(-7.5, -12, 4.5, 1.5); ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(4, -10); ctx.lineTo(14, -10); ctx.lineTo(16, 0); ctx.closePath(); ctx.fillStyle = '#f2c14e'; ctx.fill(); ctx.stroke(); if (!bersih) air(9, -10, 5, 1.6); }
  else if (jenis === 'tong') { ctx.fillStyle = '#4c6b4a'; ctx.fillRect(-11, -26, 22, 26); ctx.strokeRect(-11, -26, 22, 26); ctx.save(); if (!bersih) { ctx.translate(-12, -27); ctx.rotate(-0.6); } else ctx.translate(-12, -28); ctx.fillStyle = '#3a5539'; ctx.fillRect(0, 0, 24, 4); ctx.strokeRect(0, 0, 24, 4); ctx.restore(); if (!bersih) { ctx.fillStyle = '#d6c9a8'; ctx.fillRect(-7, -30, 6, 5); ctx.strokeRect(-7, -30, 6, 5); } }
  else if (jenis === 'longkang') { ctx.fillStyle = '#9aa3a8'; ctx.fillRect(-28, -6, 56, 10); ctx.strokeRect(-28, -6, 56, 10); ctx.fillStyle = bersih ? '#c7d9e3' : '#6f8a5c'; ctx.fillRect(-26, -4, 52, 6); if (!bersih) { ctx.fillStyle = '#8a6a43'; ctx.beginPath(); ctx.arc(-6, -1, 4, 0, 6.3); ctx.arc(4, 0, 3, 0, 6.3); ctx.fill(); ctx.stroke(); } }
  else if (jenis === 'baldi') { ctx.beginPath(); ctx.moveTo(-9, -14); ctx.lineTo(9, -14); ctx.lineTo(7, 0); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fillStyle = '#7f9fd9'; ctx.fill(); ctx.stroke(); air(0, -14, 8.5, 2.6); }
  ctx.restore();
}

/* jentik-jentik, telur, pupa (untuk kitaran) */
function drawJentik(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 5) * 0.3); ctx.beginPath(); ctx.moveTo(0, -10); for (var i = 0; i <= 10; i++) ctx.lineTo(Math.sin(i * 0.9 + t * 8) * 1.6, -10 + i * 2); ctx.lineWidth = 2.4; ctx.strokeStyle = '#6b5a45'; ctx.stroke(); ctx.beginPath(); ctx.arc(0, -11, 2.6, 0, 6.3); ctx.fillStyle = '#4a3d30'; ctx.fill(); ctx.restore(); }
function drawPupa(x, y, s, t) { ctx.save(); ctx.translate(x, y + Math.sin(t * 2) * 2); ctx.scale(s, s); ctx.beginPath(); ctx.arc(0, 0, 6, 0, 6.3); ctx.moveTo(4, 3); ctx.quadraticCurveTo(8, 10, 2, 13); ctx.lineWidth = 3; ctx.strokeStyle = '#5a4a3a'; ctx.stroke(); ctx.fillStyle = '#6b5a45'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 6.3); ctx.fill(); ctx.restore(); }
function drawTelur(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#2e2620'; for (var i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(-9 + i * 3, Math.sin(i) * 1.5, 1, 2.2, 0.3, 0, 6.3); ctx.fill(); } ctx.restore(); }
/* kuman (virus bulat berduri / parasit lonjong) */
function drawKuman(x, y, r, jenis, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.8); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; if (jenis === 'virus') { for (var i = 0; i < 10; i++) { var a = i * 0.628; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a) * r * 1.45, Math.sin(a) * r * 1.45); ctx.stroke(); ctx.beginPath(); ctx.arc(Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5, r * 0.13, 0, 6.3); ctx.fillStyle = DENG; ctx.fill(); } inkCircle(0, 0, r, 3, r * 0.06, 1.3, INK, '#f19bb4'); } else { ctx.beginPath(); ctx.ellipse(0, 0, r * 1.5, r * 0.6, 0, 0, 6.3); ctx.fillStyle = '#8fd1c9'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(r * 0.4, 0, r * 0.28, 0, 6.3); ctx.fillStyle = MAL; ctx.fill(); } ctx.restore(); }
