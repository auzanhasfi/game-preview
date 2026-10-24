/* Arena Clawd Pro: Kamera + menggambar arena, menara, minion, hero, efek */
'use strict';

/* ---------- lukisan ---------- */
var cam = { x: SPAWN.x, y: SPAWN.y, z: 1 };
function onScreen(x, y) { return Math.abs(x - cam.x) * cam.z < CW / 2 + 90 && Math.abs(y - cam.y) * cam.z < CH / 2 + 130; }
function draw() {
  if (!G) return;
  ctx = mctx; var h = G.hero;
  cam.z = Math.min(CW, CH) / VIEW * (CW > CH * 1.3 ? 1.08 : 1);
  var tx0 = h.dead ? SPAWN.x : h.x, ty0 = h.dead ? SPAWN.y : h.y;
  cam.x += (tx0 - cam.x) * 0.15; cam.y += (ty0 - cam.y) * 0.15;
  var hw = CW / 2 / cam.z, hh = CH / 2 / cam.z;
  cam.x = Math.max(hw, Math.min(WS - hw, cam.x)); cam.y = Math.max(hh, Math.min(WS - hh, cam.y));
  if (hw * 2 > WS) cam.x = WS / 2; if (hh * 2 > WS) cam.y = WS / 2;
  var sx = shake > 0 ? (Math.random() - 0.5) * 14 * shake : 0, sy = shake > 0 ? (Math.random() - 0.5) * 14 * shake : 0;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#c7cfae'; ctx.fillRect(0, 0, CW, CH);
  ctx.setTransform(DPR * cam.z, 0, 0, DPR * cam.z, DPR * (CW / 2 - cam.x * cam.z + sx), DPR * (CH / 2 - cam.y * cam.z + sy));
  var vx0 = Math.max(0, cam.x - hw - 10), vy0 = Math.max(0, cam.y - hh - 10), vw = Math.min(WS - vx0, hw * 2 + 20), vh = Math.min(WS - vy0, hh * 2 + 20);
  ctx.drawImage(MAP, vx0, vy0, vw, vh, vx0, vy0, vw, vh);
  var hid = heroHidden();
  G.structs.forEach(function (s) { if (s.hp > 0 && s.team === 1 && !h.dead && Math.hypot(h.x - s.x, h.y - s.y) < s.range + 140) { ctx.save(); ctx.setLineDash([8, 10]); ctx.beginPath(); ctx.arc(s.x, s.y, s.range, 0, 6.3); ctx.lineWidth = 2.5; ctx.strokeStyle = s.target === h ? '#d9534a' : 'rgba(44,62,107,0.45)'; ctx.stroke(); ctx.restore(); } });
  G.fx.forEach(function (f) { if ((f.kind === 'star' && f.t < 0.45) || (f.kind === 'volley' && f.t < 0.3 && f.t > -0.3) || (f.kind === 'mstorm' && f.t < 0 && f.t > -0.6)) { ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = f.kind === 'star' ? GOLD : f.kind === 'mstorm' ? '#b59ae8' : '#b8861c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (f.kind === 'star' ? Math.max(0.2, f.t / 0.45) : 1), 0, 6.3); ctx.stroke(); ctx.restore(); } });
  G.fx.forEach(function (f) { if (f.kind === 'quake' || f.kind === 'ghost' || f.kind === 'blink') drawFx(f); });
  var list = [];
  G.structs.forEach(function (s) { if (onScreen(s.x, s.y)) list.push(s); });
  G.units.forEach(function (u) { if (alive(u) && onScreen(u.x, u.y)) list.push(u); });
  list.sort(function (a, c) { return a.y - c.y; });
  list.forEach(function (e) {
    if (e.kind === 'turret' || e.kind === 'core') drawTower(e);
    else if (e.kind === 'minion') drawMinion(e);
    else if (e.kind === 'monster') drawMonster(e);
    else if (e.kind === 'hero') drawHero(e, hid);
  });
  G.proj.forEach(drawProj);
  G.fx.forEach(function (f) { if (f.kind !== 'quake' && f.kind !== 'ghost' && f.kind !== 'blink') drawFx(f); });
  G.floats.forEach(function (f) { if (!onScreen(f.x, f.y)) return; ctx.save(); ctx.globalAlpha = Math.min(1, f.life * 2); ctx.font = '700 ' + (f.big ? 30 : 21) + 'px Caveat, cursive'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = PAPER2; ctx.strokeText(f.s, f.x, f.y); ctx.fillStyle = f.col; ctx.fillText(f.s, f.x, f.y); ctx.restore(); });
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawHud();
}
function hpBar(x, y, w, frac, col, sh, shield) { ctx.fillStyle = 'rgba(46,38,32,0.75)'; ctx.fillRect(x - w / 2 - 1.5, y - 1.5, w + 3, 8); ctx.fillStyle = '#efe7d6'; ctx.fillRect(x - w / 2, y, w, 5); ctx.fillStyle = sh ? '#8d9bbf' : col; ctx.fillRect(x - w / 2, y, w * Math.max(0, Math.min(1, frac)), 5); if (shield) { ctx.fillStyle = '#e8eef8'; ctx.fillRect(x - w / 2 + w * Math.max(0, frac), y, Math.min(w * (1 - frac), w * shield), 5); } }
function drawTower(s) {
  var col = s.team ? NAVY : CL, light = s.team ? '#9fb1d8' : '#f6c3a6';
  if (s.hp <= 0) { inkCircle(s.x, s.y, 34, 4, 3, 1.4, INK, '#b9b4ab'); for (var i = 0; i < 5; i++) { ctx.fillStyle = '#9b958c'; ctx.fillRect(s.x - 24 + i * 11, s.y - 8 - (i % 2) * 6, 10, 8); } return; }
  var big = s.kind === 'core' ? 1.45 : (s.tier === 3 ? 1.12 : 1), H = 74 * big, w = 34 * big;
  ctx.fillStyle = 'rgba(46,38,32,0.2)'; ctx.beginPath(); ctx.ellipse(s.x, s.y + 4, w * 1.1, 12 * big, 0, 0, 6.3); ctx.fill();
  inkCircle(s.x, s.y, w * 0.95, 2, 2, 1.5, INK, '#c9c2b5');
  wobRect(s.x - w / 2, s.y - H, w, H, s.x | 0, 0.7); ctx.fillStyle = s.hitT > 0 ? '#fff' : light; ctx.fill();
  ctx.save(); ctx.clip(); scratch(s.x - w / 2, s.y - H, w, H, 50, col, 0.55, -0.9, s.y | 0); ctx.restore();
  wobRect(s.x - w / 2, s.y - H, w, H, s.x | 0, 0.7); stroke(1.6, INK);
  wobRect(s.x - w / 2 - 6, s.y - H - 10, w + 12, 12, 3, 0.5); ctx.fillStyle = col; ctx.fill(); stroke(1.4, INK);
  if (s.kind === 'core' && s.team === 1) { for (var c = 0; c < 4; c++) { ctx.fillStyle = NAVY; ctx.fillRect(s.x - w / 2 - 6 + c * (w + 4) / 3.2, s.y - H - 20, 8, 10); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(s.x - w / 2 - 6 + c * (w + 4) / 3.2, s.y - H - 20, 8, 10); } }
  var gy = s.y - H - 26 + Math.sin(time * 3 + s.x) * 3;
  ctx.beginPath(); ctx.moveTo(s.x, gy - 16 * big); ctx.lineTo(s.x + 10 * big, gy); ctx.lineTo(s.x, gy + 12 * big); ctx.lineTo(s.x - 10 * big, gy); ctx.closePath(); ctx.fillStyle = s.team ? '#6b8fe0' : GOLD; ctx.fill(); stroke(1.3, INK);
  ctx.font = '700 ' + (s.kind === 'core' ? 22 : 17) + 'px Caveat, cursive'; ctx.fillStyle = INK; ctx.textAlign = 'center';
  if (s.kind === 'core') ctx.fillText(s.team ? L('Inti Istana Comot', 'Inti Istana Comot') : L('Inti Markas', 'Teras Pangkalan'), s.x, s.y + 30);
  else if (nearHero(s, 520)) ctx.fillText('T' + s.tier, s.x, s.y + 24);
  var sh = shielded(s);
  if (sh) { ctx.save(); ctx.globalAlpha = 0.25 + Math.sin(time * 4) * 0.08; ctx.fillStyle = '#9fb1d8'; ctx.beginPath(); ctx.ellipse(s.x, s.y - H / 2 - 10, w * 1.3, H * 0.75, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
  hpBar(s.x, s.y - H - 52 * big, 64 * big, s.hp / s.max, s.team ? '#5b78c2' : '#6fa83c', sh);
}
function drawMinion(u) {
  var near = cam.z > 0.55, mt = u.mt, sc = mt === 'super' ? 0.9 : mt === 'meriam' ? 0.72 : 0.6;
  if (u.bubT > 0) { ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#f6c6d4'; ctx.beginPath(); ctx.arc(u.x, u.y - 12, u.r + 14, 0, 6.3); ctx.fill(); ctx.globalAlpha = 0.8; ctx.lineWidth = 1.5; ctx.strokeStyle = '#c0607e'; ctx.stroke(); ctx.restore(); }
  if (u.catT > 0 && u.team === 1) { drawMochi(u.x, u.y - 2, 1.15, time + u.i, '#e4dcf6', u.face); hpBar(u.x, u.y - 30, 30, u.hp / u.max, '#5b78c2'); return; }
  if (u.team === 0) drawClawd(u.x, u.y + 6, { s: sc, face: u.face, t: time + u.i, run: !u.target, atk: u.atk > 0, pencil: mt === 'jauh', detail: near, crown: mt === 'super', cannon: mt === 'meriam', col: u.hitT > 0 ? '#fff' : (mt === 'super' ? '#e9945f' : CL) });
  else drawComot(u.x, u.y - 8, mt === 'super' ? 20 : mt === 'meriam' ? 17 : 14, { t: time, i: u.i, col: u.hitT > 0 ? '#fff' : (u.burnT > 0 ? '#8a3a3a' : (mt === 'jauh' ? PLUM : mt === 'super' ? '#1f2b4d' : NAVY)), staff: mt === 'jauh', king: mt === 'super', cannon: mt === 'meriam', detail: near, lx: u.face * 0.6, stun: u.stunT > 0 });
  if (u.stunT > 0) stunStars(u.x, u.y - 38);
  if (u.slowT > 0) { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = SKY; ctx.beginPath(); ctx.ellipse(u.x, u.y + 6, 18, 5, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
  if (u.hp < u.max || mt === 'super' || mt === 'meriam') hpBar(u.x, u.y - (mt === 'super' ? 44 : 34), mt === 'super' ? 40 : 30, u.hp / u.max, u.team ? '#5b78c2' : '#6fa83c');
}
function drawHero(h, hid) {
  if (h.dead) return;
  var z = h.z || 0;
  if (G.buffs.merah > 0 || G.buffs.biru > 0) { for (var i = 0; i < 2; i++) if (Math.random() < 0.3) G.fx.push({ kind: 'p', type: G.buffs.merah > 0 && (i === 0 || !(G.buffs.biru > 0)) ? 'fire' : 'water', x: h.x + (Math.random() - 0.5) * 34, y: h.y - 10, vx: 0, vy: -40, t: 0, life: 0.6, r: 3, rot: 0 }); }
  if (G.buffs.kuasa > 0 || G.buffs.laju > 0 || G.buffs.perisai > 0 || G.buffs.kebal > 0 || G.buffs.tembok > 0) { ctx.save(); ctx.globalAlpha = 0.3 + Math.sin(time * 8) * 0.1; ctx.fillStyle = G.buffs.perisai > 0 || G.buffs.kebal > 0 || G.buffs.tembok > 0 ? '#9fb1d8' : (G.buffs.kuasa > 0 ? '#f2b04a' : '#bfe08a'); ctx.beginPath(); ctx.ellipse(h.x, h.y, 34, 12, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
  if (h.recall > 0) { ctx.save(); ctx.strokeStyle = SKY; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(h.x, h.y - 20, 46, -Math.PI / 2, -Math.PI / 2 + 6.283 * h.recall / 3); ctx.stroke(); ctx.globalAlpha = 0.25; ctx.fillStyle = SKY; ctx.fillRect(h.x - 30, h.y - 120, 60, 120); ctx.restore(); }
  if (z) { ctx.fillStyle = 'rgba(46,38,32,0.25)'; ctx.beginPath(); ctx.ellipse(h.x, h.y + 2, 26 - z * 0.08, 8, 0, 0, 6.3); ctx.fill(); }
  ctx.save(); if (hid) ctx.globalAlpha = 0.5;
  if (h.mochi > 0) { ctx.save(); ctx.globalAlpha = 0.6 + Math.sin(time * 12) * 0.2; drawMochi(h.x, h.y - 6, 2.2, time, '#ffffff', h.face); ctx.restore(); } else drawClawd(h.x, h.y + 4 - z, { s: 1.35, hero: h.id, skin: G.skin, face: h.face, t: time, run: h.moving || !!h.dash, atk: h.atkAnim > 0, angry: h.atkAnim > 0 || !!h.leap || h.dance > 0, mood: h.hitT > 0 ? 'hurt' : '', blink: Math.sin(time * 1.7) > 0.985, shadow: !z });
  ctx.restore();
  if (h.shield > 0) { ctx.save(); ctx.globalAlpha = 0.25 + Math.sin(time * 5) * 0.06; ctx.fillStyle = '#e8eef8'; ctx.beginPath(); ctx.arc(h.x, h.y - 24 - z, 44, 0, 6.3); ctx.fill(); ctx.globalAlpha = 0.8; ctx.lineWidth = 2; ctx.strokeStyle = '#8d9bbf'; ctx.stroke(); ctx.restore(); }
  hpBar(h.x, h.y - 70 - z, 64, h.hp / h.max, '#6fa83c', false, h.shield / h.max);
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(h.x - 42, h.y - 67 - z, 9, 0, 6.3); ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = INK; ctx.stroke();
  ctx.font = '800 11px Geist, sans-serif'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(h.lvl, h.x - 42, h.y - 63 - z);
  if (h.inBush) { ctx.font = '700 18px Caveat, cursive'; ctx.fillStyle = hid ? '#3f6b22' : '#a94c33'; ctx.fillText(hid ? L('tersembunyi', 'tersorok') : L('terlihat (baru menyerang)', 'kelihatan (baru menyerang)'), h.x, h.y + 26); }
}
function drawProj(p) {
  if (!onScreen(p.x, p.y)) return;
  ctx.save(); ctx.translate(p.x, p.y);
  if (p.kind === 'boom') { ctx.rotate(time * 18); drawBoomerang(0, 0, 1.5, '#f19bb4'); }
  else if (p.kind === 'bigarrow') { ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillStyle = '#b8861c'; ctx.fillRect(-30, -3, 40, 6); ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(28, 0); ctx.lineTo(10, 10); ctx.closePath(); ctx.fillStyle = NAVY; ctx.fill(); stroke(1.4, INK); ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-30, -8); ctx.lineTo(-22, 0); ctx.lineTo(-30, 8); ctx.stroke(); }
  else if (p.kind === 'starball') { inkCircle(0, 0, 16, time * 4, 2, 1.6, INK, '#f6d77a'); star4(0, 0, 12, time * 8, '#fff', 2); }
  else if (p.kind === 'arrow') { ctx.rotate(p.ang || 0); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(10, 0); ctx.stroke(); ctx.fillStyle = p.emp ? '#d9534a' : NAVY; ctx.beginPath(); ctx.moveTo(10, -5); ctx.lineTo(18, 0); ctx.lineTo(10, 5); ctx.fill(); }
  else if (p.kind === 'orb') { ctx.beginPath(); ctx.arc(0, 0, 8, 0, 6.3); ctx.fillStyle = '#c9b8f0'; ctx.fill(); stroke(1.2, INK); star4(0, 0, 6, time * 9, '#fff', 1.4); }
  else if (p.kind === 'heart') heart(0, 0, 7, '#f19bb4');
  else if (p.kind === 'pellet') { ctx.beginPath(); ctx.arc(0, 0, 4, 0, 6.3); ctx.fillStyle = '#f2c14e'; ctx.fill(); stroke(1.2, INK); }
  else if (p.kind === 'shell') { ctx.beginPath(); ctx.arc(0, 0, 7, 0, 6.3); ctx.fillStyle = '#3a3530'; ctx.fill(); stroke(1.2, INK); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(-2, -2, 2, 0, 6.3); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(0, 0, 5, 0, 6.3); ctx.fillStyle = PLUM; ctx.fill(); stroke(1.2, INK); }
  ctx.restore();
}
function drawFx(f) {
  if (f.x !== undefined && !onScreen(f.x, f.y)) return;
  if (f.kind === 'mochi') { if (f.t < 0.4) { var me = f.t / 0.4; drawMochi(f.x0 + (f.x - f.x0) * me, f.y0 + (f.y - f.y0) * me - Math.sin(Math.PI * me) * 140, 1.8, time, '#ffffff', f.x >= f.x0 ? 1 : -1); } return; }
  ctx.save();
  var k;
  if (f.kind === 'beam') { ctx.globalAlpha = 1 - f.t / 0.18; ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = f.col; ctx.stroke(); }
  else if (f.kind === 'spin') { k = f.t / 0.45; ctx.globalAlpha = 1 - k; for (var i = 0; i < 4; i++) { ctx.lineWidth = 9 - i * 2; ctx.strokeStyle = i % 2 ? '#fff' : f.col; ctx.beginPath(); ctx.arc(f.x, f.y - 10, f.r * (0.35 + k * 0.65), k * 12 + i * 1.57, k * 12 + i * 1.57 + 1.1); ctx.stroke(); } inkCircle(f.x, f.y - 10, f.r * (0.4 + k * 0.6), 2, 4, 2, INK, null); }
  else if (f.kind === 'ring') { k = f.t / 0.5; ctx.globalAlpha = 1 - k; inkCircle(f.x, f.y, f.r * (0.5 + k * 0.6), 3, 6, 5 * (1 - k) + 1, INK, f.col || 'rgba(90,45,88,' + 0.3 * (1 - k) + ')'); }
  else if (f.kind === 'wall') { k = f.t / 0.7; ctx.globalAlpha = 1 - k; for (var wb = 0; wb < 6; wb++) { var wa = wb / 6 * 6.283; ctx.save(); ctx.translate(f.x + Math.cos(wa) * 50, f.y - 20 + Math.sin(wa) * 24); wobRect(-9, -26 - k * 20, 18, 30, wb, 0.6); ctx.fillStyle = '#f4efe2'; ctx.fill(); stroke(1.4, INK); ctx.restore(); } }
  else if (f.kind === 'star' && f.t > 0) { var e = Math.min(1, f.t / 0.45), y = f.y - 420 * (1 - e); ctx.globalAlpha = f.t > 0.45 ? 1 - (f.t - 0.45) / 0.35 : 1; ctx.strokeStyle = 'rgba(242,193,78,0.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(f.x + 60 * (1 - e), y - 80); ctx.lineTo(f.x, y); ctx.stroke(); star4(f.x, y, 20, time * 8, GOLD, 4.5); star4(f.x, y, 20, time * 8, INK, 1.2); if (f.t > 0.45) inkCircle(f.x, f.y, f.r * (0.6 + (f.t - 0.45)), 4, 5, 3, GOLD, 'rgba(242,176,74,0.25)'); }
  else if (f.kind === 'volley' && f.t > 0) { for (var v = 0; v < 6; v++) { var ax = f.x + (hsh(v + f.r + Math.floor(f.t * 3)) - 0.5) * f.r * 1.6, ay = f.y + (hsh(v * 3.1 + f.r) - 0.5) * f.r, prog2 = Math.min(1, f.t / 0.3), py = ay - 300 * (1 - prog2); ctx.globalAlpha = f.t > 0.3 ? 1 - (f.t - 0.3) / 0.3 : 1; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ax - 6, py - 26); ctx.lineTo(ax, py); ctx.stroke(); ctx.fillStyle = NAVY; ctx.beginPath(); ctx.moveTo(ax - 4, py - 6); ctx.lineTo(ax + 2, py + 6); ctx.lineTo(ax + 5, py - 3); ctx.fill(); } }
  else if (f.kind === 'pencil') {
    var fall = Math.min(1, f.t / 0.5), py2 = f.y - 520 * (1 - fall * fall);
    ctx.globalAlpha = f.t > 0.8 ? 1 - (f.t - 0.8) / 0.3 : 1;
    if (fall < 1) { ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#d9534a'; ctx.beginPath(); ctx.ellipse(f.x, f.y, 60 * fall + 10, 20 * fall + 4, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
    ctx.translate(f.x, py2); ctx.rotate(0.12);
    ctx.fillStyle = '#f2c14e'; ctx.fillRect(-16, -190, 32, 150); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-16, -190, 32, 150);
    ctx.fillStyle = '#e8a33a'; ctx.fillRect(-5, -190, 10, 150);
    ctx.fillStyle = '#f19bb4'; ctx.fillRect(-16, -214, 32, 24); ctx.strokeRect(-16, -214, 32, 24); ctx.fillStyle = '#b9b4ab'; ctx.fillRect(-16, -196, 32, 8); ctx.strokeRect(-16, -196, 32, 8);
    ctx.beginPath(); ctx.moveTo(-16, -40); ctx.lineTo(0, 0); ctx.lineTo(16, -40); ctx.closePath(); ctx.fillStyle = '#f6e3c4'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-5, -12); ctx.lineTo(0, 0); ctx.lineTo(5, -12); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
  }
  else if (f.kind === 'dot') { ctx.globalAlpha = 1 - f.t / 0.35; ctx.fillStyle = f.col || NAVY; ctx.beginPath(); ctx.arc(f.x, f.y, 5 * (1 - f.t / 0.35), 0, 6.3); ctx.fill(); }
  else if (f.kind === 'plus') { ctx.globalAlpha = 1 - f.t / 0.6; ctx.font = '800 18px Geist, sans-serif'; ctx.fillStyle = '#3f6b22'; ctx.fillText('+', f.x, f.y - f.t * 40); }
  else if (f.kind === 'slash') { k = f.t / 0.22; ctx.globalAlpha = 1 - k; ctx.translate(f.x, f.y); ctx.rotate(f.a); ctx.lineCap = 'round'; ctx.lineWidth = 7 * (1 - k) + 1; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, 0, 26, -1 + k, 0.9 + k); ctx.stroke(); ctx.lineWidth = 4 * (1 - k) + 0.5; ctx.strokeStyle = f.col || '#fff'; ctx.stroke(); }
  else if (f.kind === 'ghost') { ctx.globalAlpha = 0.35 * (1 - f.t / 0.3); drawClawd(f.x, f.y + 4, { s: 1.35, hero: G.hero.id, face: f.face, t: time, shadow: false, detail: false, col: G.hero.id === 'bayang' ? '#b8aade' : '#f6d1bd', cape: false }); }
  else if (f.kind === 'wind') { k = f.t / 0.5; ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#8fc0a8'; ctx.lineWidth = 3; for (var w = 0; w < 3; w++) { ctx.beginPath(); ctx.arc(f.x, f.y - 20, 20 + k * 50 + w * 10, w * 2 + k * 6, w * 2 + k * 6 + 2.2); ctx.stroke(); } }
  else if (f.kind === 'bolt') { k = f.t / 0.35; ctx.globalAlpha = 1 - k; for (var pass = 0; pass < 2; pass++) { ctx.beginPath(); for (var j = 0; j < f.pts.length - 1; j++) { var a = f.pts[j], c = f.pts[j + 1]; if (!j) ctx.moveTo(a[0], a[1]); for (var s = 1; s <= 5; s++) { var q = s / 5; ctx.lineTo(a[0] + (c[0] - a[0]) * q + (s < 5 ? (Math.random() - 0.5) * 22 : 0), a[1] + (c[1] - a[1]) * q + (s < 5 ? (Math.random() - 0.5) * 22 : 0)); } } ctx.lineWidth = pass ? 2.5 : 7; ctx.strokeStyle = pass ? '#fff' : '#7f9fd9'; ctx.stroke(); } }
  else if (f.kind === 'explode') { k = f.t / 0.45; ctx.globalAlpha = 1 - k; inkCircle(f.x, f.y, f.r * (0.3 + k * 0.8), 2, 6, 3, INK, 'rgba(246,215,122,' + 0.6 * (1 - k) + ')'); for (var st = 0; st < 6; st++) star4(f.x + Math.cos(st) * f.r * k, f.y + Math.sin(st) * f.r * k * 0.7, 6, time * 6, GOLD, 2); }
  else if (f.kind === 'quake') { k = f.t / 0.7; ctx.globalAlpha = 1 - k; inkCircle(f.x, f.y, f.r * (0.4 + k * 0.7), 1, 8, 4, INK, 'rgba(201,159,107,' + 0.4 * (1 - k) + ')'); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; for (var cr = 0; cr < 8; cr++) { var ca = cr / 8 * 6.283 + 0.3; ctx.beginPath(); ctx.moveTo(f.x + Math.cos(ca) * 20, f.y + Math.sin(ca) * 10); ctx.lineTo(f.x + Math.cos(ca + 0.15) * f.r * 0.5, f.y + Math.sin(ca + 0.15) * f.r * 0.25); ctx.lineTo(f.x + Math.cos(ca - 0.1) * f.r * 0.85, f.y + Math.sin(ca - 0.1) * f.r * 0.45); ctx.stroke(); } }
  else if (f.kind === 'pillar') { k = f.t / 0.9; ctx.globalAlpha = 0.5 * (1 - k); ctx.fillStyle = f.col || GOLD; ctx.fillRect(f.x - 30 + k * 10, f.y - 200, 60 - k * 20, 200); for (var ps = 0; ps < 4; ps++) star4(f.x + (ps - 1.5) * 18, f.y - 40 - k * 150 - ps * 20, 5, time * 5 + ps, GOLD, 1.6); }
  else if (f.kind === 'blink') { k = f.t / 0.4; ctx.globalAlpha = 1 - k; inkCircle(f.x, f.y - 20, 20 + k * 40, 2, 3, 2, SKY, 'rgba(159,200,240,' + 0.4 * (1 - k) + ')'); for (var bs = 0; bs < 5; bs++) star4(f.x + Math.cos(bs * 1.26) * (20 + k * 40), f.y - 20 + Math.sin(bs * 1.26) * (20 + k * 40), 4, 0, '#fff', 1.4); }
  else if (f.kind === 'p') {
    var al = 1 - f.t / f.life; ctx.globalAlpha = al;
    if (f.type === 'star') star4(f.x, f.y, f.r + 1, f.rot + time * 4, GOLD, 1.4);
    else if (f.type === 'ink') { ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.3); ctx.fill(); }
    else if (f.type === 'paper') { ctx.fillStyle = CL; ctx.fillRect(f.x, f.y, f.r * 1.5, f.r); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.strokeRect(f.x, f.y, f.r * 1.5, f.r); }
    else if (f.type === 'chip') { ctx.translate(f.x, f.y); ctx.rotate(f.rot + f.t * 8); ctx.fillStyle = '#b9b4ab'; ctx.fillRect(-f.r, -f.r * 0.6, f.r * 2, f.r * 1.2); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.strokeRect(-f.r, -f.r * 0.6, f.r * 2, f.r * 1.2); }
    else if (f.type === 'smoke') { ctx.globalAlpha = al * 0.7; inkCircle(f.x, f.y, f.r * 4 * (1.4 - al), f.rot, 2, 1, INK, '#d8d0c3'); }
    else if (f.type === 'fire') { ctx.fillStyle = al > 0.5 ? '#f2b04a' : '#d9534a'; ctx.beginPath(); ctx.moveTo(f.x, f.y - f.r * 2.4); ctx.quadraticCurveTo(f.x + f.r * 1.4, f.y, f.x, f.y + f.r); ctx.quadraticCurveTo(f.x - f.r * 1.4, f.y, f.x, f.y - f.r * 2.4); ctx.fill(); }
    else if (f.type === 'water') { ctx.fillStyle = SKY; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.3); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke(); }
  }
  ctx.restore();
}
