/* 03 — Alat am + alat lukis dakwat (garis bergetar 7 kali sesaat), dari enjin Petualangan Fotosintesis. */
var ctx = null, W = 480, H = 270;
var INK = '#2e2620', PAPER = '#efebe2', PAPER2 = '#faf8f2';
var CL = '#d8714f', CL_D = '#b4553a', CL_H = '#a94c33';
var LG = '#6fa83c', LG_D = '#4c8128', GOLD = '#e2a93b', SKY = '#8cc8d6';
var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function rf(a, b) { return a + Math.random() * (b - a); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function eOut(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
function fmtTime(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

/* bijirin kertas */
var grain = (function () {
  var c = document.createElement('canvas'); c.width = 128; c.height = 128;
  var g = c.getContext('2d'), d = g.createImageData(128, 128);
  for (var i = 0; i < d.data.length; i += 4) { var v = 80 + Math.random() * 80; d.data[i] = v; d.data[i + 1] = v - 6; d.data[i + 2] = v - 14; d.data[i + 3] = Math.random() < 0.55 ? 0 : 8 + Math.random() * 16; }
  g.putImageData(d, 0, 0); return c;
})();
function grainOver(a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore(); }

/* garis dakwat */
var INKSEED = 0;
function hsh(n) { var s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); }
function jt(i, u) { return hsh(i * 7.13 + u * 3.71 + INKSEED * 5.17) - 0.5; }
function trace(pts, close) { ctx.beginPath(); for (var i = 0; i < pts.length; i++) { if (i) ctx.lineTo(pts[i][0], pts[i][1]); else ctx.moveTo(pts[i][0], pts[i][1]); } if (close) ctx.closePath(); }
function stroke(w, col) { ctx.lineWidth = w || 1.5; ctx.strokeStyle = col || INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
function inkLine(x1, y1, x2, y2, u, amp, w, col) {
  var len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.round(len / 9)), pts = [];
  for (var i = 0; i <= n; i++) { var t = i / n, e = (i === 0 || i === n) ? 0.4 : 1; pts.push([x1 + (x2 - x1) * t + jt(i, u) * amp * e, y1 + (y2 - y1) * t + jt(i, u + 50) * amp * e]); }
  trace(pts); stroke(w, col);
}
function wobRect(x, y, w, h, u, amp) {
  var pts = [], i, n;
  function edge(ax, ay, bx, by, uu) { n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / 8)); for (i = 0; i < n; i++) { var t = i / n; pts.push([ax + (bx - ax) * t + jt(i, uu) * amp, ay + (by - ay) * t + jt(i, uu + 40) * amp]); } }
  edge(x, y, x + w, y, u); edge(x + w, y, x + w, y + h, u + 1); edge(x + w, y + h, x, y + h, u + 2); edge(x, y + h, x, y, u + 3);
  trace(pts, true);
}
function inkCircle(cx, cy, r, u, amp, lw, col, fill) {
  var n = Math.max(10, Math.round(r * 1.2)), pts = [];
  for (var i = 0; i <= n; i++) { var a = (i / n) * 6.2832 + u, rr = r + jt(i % n, u) * amp; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  trace(pts, true);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw) stroke(lw, col);
}
function scratch(x, y, w, h, n, col, alpha, ang, u) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = 0.7; ctx.lineCap = 'round';
  ctx.beginPath();
  for (var i = 0; i < n; i++) {
    var px = x + hsh(i * 3.1 + u) * w, py = y + hsh(i * 5.7 + u + 9) * h, l = 2.5 + hsh(i + u * 2) * 4.5, a = ang + (hsh(i * 1.3 + u) - 0.5) * 0.3;
    ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l);
  }
  ctx.stroke(); ctx.restore();
}
function hatch(x, y, w, h, gap, col, alpha, lw) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = lw || 0.8; ctx.beginPath();
  for (var k = -h; k < w; k += gap) { ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h, y); }
  ctx.stroke(); ctx.restore();
}
function star4(x, y, r, rot, col, lw) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = col; ctx.lineWidth = lw || 1.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r * 0.45, -r * 0.45); ctx.lineTo(r * 0.45, r * 0.45); ctx.moveTo(r * 0.45, -r * 0.45); ctx.lineTo(-r * 0.45, r * 0.45); ctx.stroke();
  ctx.restore();
}
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/* Clawd: kotak oren, dua mata, lengan pendek, empat kaki (asal o.fy = tapak kaki) */
function drawClawd(cx, fy, o) {
  var s = o.s || 1, face = o.face || 1, t = o.t || 0;
  ctx.save(); ctx.translate(cx, fy); ctx.scale(s, s);
  var lx = [-14, -8.6, 5, 10.4], ph = o.run ? Math.sin(t * 20) : 0;
  ctx.lineWidth = 1.1; ctx.strokeStyle = INK;
  for (var i = 0; i < 4; i++) {
    var lift = o.run ? Math.max(0, (i % 2 ? ph : -ph)) * 3 : 0;
    ctx.fillStyle = CL; ctx.fillRect(lx[i], -10, 3.6, 10 - lift); ctx.strokeRect(lx[i], -10, 3.6, 10 - lift);
  }
  var armUp = o.wave ? Math.sin(t * 14) * 2 : 0;
  ctx.fillStyle = CL; ctx.fillRect(-21.5, -21 - armUp, 5, 6.5); ctx.strokeRect(-21.5, -21 - armUp, 5, 6.5);
  ctx.fillRect(16.5, -21 + armUp, 5, 6.5); ctx.strokeRect(16.5, -21 + armUp, 5, 6.5);
  wobRect(-17, -29, 34, 20, 7, 0.45); ctx.fillStyle = CL; ctx.fill();
  ctx.save(); ctx.clip(); scratch(-17, -29, 34, 20, 34, CL_H, 0.55, -0.9, 3); ctx.restore();
  wobRect(-17, -29, 34, 20, 7, 0.45); stroke(1.5, INK);
  var e1 = -6.5 + face * 1.6, e2 = 6.5 + face * 1.6;
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  if (o.mood === 'happy') {
    ctx.beginPath(); ctx.moveTo(e1 - 2.6, -19); ctx.lineTo(e1, -22.4); ctx.lineTo(e1 + 2.6, -19); ctx.moveTo(e2 - 2.6, -19); ctx.lineTo(e2, -22.4); ctx.lineTo(e2 + 2.6, -19); ctx.stroke();
  } else if (o.mood === 'hurt') {
    ctx.beginPath(); ctx.moveTo(e1 - 2, -23); ctx.lineTo(e1 + 2, -19); ctx.moveTo(e1 + 2, -23); ctx.lineTo(e1 - 2, -19); ctx.moveTo(e2 - 2, -23); ctx.lineTo(e2 + 2, -19); ctx.moveTo(e2 + 2, -23); ctx.lineTo(e2 - 2, -19); ctx.stroke();
  } else if (o.blink) {
    ctx.fillRect(e1 - 1.5, -20.5, 3, 1.3); ctx.fillRect(e2 - 1.5, -20.5, 3, 1.3);
  } else {
    ctx.fillRect(e1 - 1.4, -24, 2.9, 6.2); ctx.fillRect(e2 - 1.4, -24, 2.9, 6.2);
    ctx.fillStyle = '#fff'; ctx.fillRect(e1 - 0.6, -23.3, 1, 1.5); ctx.fillRect(e2 - 0.6, -23.3, 1, 1.5);
  }
  ctx.restore();
}
