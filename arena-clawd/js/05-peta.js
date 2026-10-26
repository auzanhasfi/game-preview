/* Arena Clawd: peta dilukis sekali */
'use strict';
/* ---------- peta dilukis sekali ---------- */
var TREES = [];
(function () {
  var tries = 0;
  while (TREES.length < 140 && tries++ < 7000) {
    var x = 60 + hsh(tries * 1.7) * 1880, y = 60 + hsh(tries * 2.9 + 4) * 1880, r = 26 + hsh(tries * 5.1) * 26;
    if (distLanes(x, y) < 115 + r || distRiver(x, y) < 95 + r) continue;
    if (Math.hypot(x - BASE0.x, y - BASE0.y) < 330 || Math.hypot(x - BASE1.x, y - BASE1.y) < 330) continue;
    if (CAMPS.some(function (c) { return Math.hypot(c.x - x, c.y - y) < 150 + r; })) continue;
    if (TREES.some(function (t) { return Math.hypot(t.x - x, t.y - y) < t.r + r + 8; })) continue;
    TREES.push({ x: x, y: y, r: r });
  }
})();
var MAP = document.createElement('canvas'); MAP.width = WS; MAP.height = WS;
var MINI = document.createElement('canvas'); MINI.width = 220; MINI.height = 220;
function buildMap() {
  var keep = ctx; ctx = MAP.getContext('2d'); seed = 3;
  ctx.fillStyle = '#dfe5c6'; ctx.fillRect(0, 0, WS, WS);
  ctx.save(); ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, WS, WS); ctx.restore();
  scratch(0, 0, WS, WS, 9000, '#8fae64', 0.35, -1.0, 2);
  function band(pts, w, fill) { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.lineWidth = w + 5; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = fill; ctx.stroke(); }
  var riv = []; for (var i = 0; i <= 40; i++) { var t = i / 40; riv.push([260 + 1480 * t + Math.sin(t * 9) * 30, 260 + 1480 * t - Math.sin(t * 9) * 30]); }
  band([[0, 0]].concat(riv).concat([[WS, WS]]), 130, '#bcd8e3');
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
  for (i = 0; i < 60; i++) { var u = hsh(i * 3.3), px = u * WS, py = u * WS, off = (hsh(i * 7.7) - 0.5) * 80; ctx.beginPath(); ctx.moveTo(px + off - 12, py - off - 6); ctx.quadraticCurveTo(px + off, py - off - 4, px + off + 12, py - off + 6); ctx.stroke(); }
  LANE_IDS.forEach(function (k) { band(LANES[k], 150, '#ecd9ae'); });
  LANE_IDS.forEach(function (k) { var L = LANES[k]; ctx.save(); ctx.setLineDash([10, 18]); ctx.beginPath(); L.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(46,38,32,0.25)'; ctx.stroke(); ctx.restore(); });
  CAMPS.forEach(function (c, j) { inkCircle(c.x, c.y, c.t === 'penyu' || c.t === 'naga' ? 95 : 70, j, 3, 1.5, 'rgba(46,38,32,0.5)', c.t === 'kelomang' || c.t === 'penyu' || c.t === 'naga' ? 'rgba(236,217,174,0.65)' : 'rgba(200,210,160,0.9)'); ctx.save(); ctx.setLineDash([4, 8]); inkCircle(c.x, c.y, c.t === 'penyu' || c.t === 'naga' ? 80 : 58, j + 3, 2, 1, 'rgba(46,38,32,0.4)', null); ctx.restore(); });
  [[BASE0, '#f6d1bd', CL], [BASE1, '#c9d2e8', NAVY]].forEach(function (b) {
    inkCircle(b[0].x, b[0].y, 250, 1, 3, 3, INK, b[1]); inkCircle(b[0].x, b[0].y, 200, 2, 3, 1.5, b[2], null);
    ctx.save(); ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(b[0].x, b[0].y, 250, 0, 6.3); ctx.clip(); scratch(b[0].x - 250, b[0].y - 250, 500, 500, 700, b[2], 0.35, 0.8, 5); ctx.restore();
  });
  TREES.forEach(function (t, j) {
    ctx.fillStyle = 'rgba(46,38,32,0.18)'; ctx.beginPath(); ctx.ellipse(t.x + 6, t.y + t.r * 0.6, t.r * 0.9, t.r * 0.35, 0, 0, 6.3); ctx.fill();
    inkCircle(t.x, t.y, t.r, j, 4, 1.6, INK, j % 3 ? '#8cb35a' : '#7aa64c');
    ctx.save(); ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, 6.3); ctx.clip(); scratch(t.x - t.r, t.y - t.r, t.r * 2, t.r * 2, Math.round(t.r * 3), '#3f6b22', 0.55, -0.9, j); ctx.fillStyle = 'rgba(220,240,170,0.5)'; ctx.beginPath(); ctx.arc(t.x - t.r * 0.3, t.y - t.r * 0.35, t.r * 0.45, 0, 6.3); ctx.fill(); ctx.restore();
  });
  ctx.font = '700 40px Caveat, cursive'; ctx.fillStyle = 'rgba(46,38,32,0.45)'; ctx.textAlign = 'center';
  ctx.fillText('Pangkalan Clawd', BASE0.x + 30, BASE0.y + 230); ctx.fillText('Istana Raja Comot', BASE1.x - 40, BASE1.y + 240);
  ctx.save(); ctx.translate(1000, 1000); ctx.rotate(Math.PI / 4); ctx.fillText('~ sungai dakwat ~', 0, -78); ctx.restore();
  var m = MINI.getContext('2d'); m.drawImage(MAP, 0, 0, 220, 220);
  ctx = keep;
}
buildMap();
try { document.fonts.ready.then(buildMap); } catch (e) {}
