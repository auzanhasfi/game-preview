/* Arena Clawd: lukisan dunia */
'use strict';
/* ---------- lukisan ---------- */
var cam = { x: 330, y: 1680, z: 1 };
function onScreen(x, y) { return Math.abs(x - cam.x) * cam.z < CW / 2 + 90 && Math.abs(y - cam.y) * cam.z < CH / 2 + 130; }
function draw() {
  if (!G) return;
  ctx = mctx; var h = G.hero;
  cam.z = Math.min(CW, CH) / VIEW * (CW > CH * 1.3 ? 1.08 : 1);
  var tx = h.dead ? 330 : h.x, ty = h.dead ? 1680 : h.y;
  cam.x += (tx - cam.x) * 0.15; cam.y += (ty - cam.y) * 0.15;
  var hw = CW / 2 / cam.z, hh = CH / 2 / cam.z;
  cam.x = Math.max(hw, Math.min(WS - hw, cam.x)); cam.y = Math.max(hh, Math.min(WS - hh, cam.y));
  if (hw * 2 > WS) cam.x = WS / 2; if (hh * 2 > WS) cam.y = WS / 2;
  var sx = shake > 0 ? (Math.random() - 0.5) * 14 * shake : 0, sy = shake > 0 ? (Math.random() - 0.5) * 14 * shake : 0;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#c7cfae'; ctx.fillRect(0, 0, CW, CH);
  ctx.setTransform(DPR * cam.z, 0, 0, DPR * cam.z, DPR * (CW / 2 - cam.x * cam.z + sx), DPR * (CH / 2 - cam.y * cam.z + sy));
  var vx0 = Math.max(0, cam.x - hw - 10), vy0 = Math.max(0, cam.y - hh - 10), vw = Math.min(WS - vx0, hw * 2 + 20), vh = Math.min(WS - vy0, hh * 2 + 20);
  ctx.drawImage(MAP, vx0, vy0, vw, vh, vx0, vy0, vw, vh);
  G.structs.forEach(function (s) { if (s.hp > 0 && s.team === 1 && !h.dead && Math.hypot(h.x - s.x, h.y - s.y) < s.range + 140) { ctx.save(); ctx.setLineDash([8, 10]); ctx.beginPath(); ctx.arc(s.x, s.y, s.range, 0, 6.3); ctx.lineWidth = 2.5; ctx.strokeStyle = s.target === h ? '#d9534a' : 'rgba(44,62,107,0.45)'; ctx.stroke(); ctx.restore(); } });
  var b = G.boss; if (alive(b) && b.tele > 0) { ctx.save(); ctx.globalAlpha = 0.25 + (1.1 - b.tele) * 0.5; ctx.fillStyle = '#d9534a'; ctx.beginPath(); ctx.arc(b.x, b.y, 240 * (1 - b.tele / 1.1 * 0.3), 0, 6.3); ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.arc(b.x, b.y, 240, 0, 6.3); ctx.lineWidth = 3; ctx.strokeStyle = '#d9534a'; ctx.stroke(); }
  G.fx.forEach(function (f) { if ((f.kind === 'star' && f.t < 0.45) || (f.kind === 'volley' && f.t < 0.3 && f.t > -0.3)) { ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = f.kind === 'star' ? GOLD : '#b8861c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (f.kind === 'star' ? Math.max(0.2, f.t / 0.45) : 1), 0, 6.3); ctx.stroke(); ctx.restore(); } });
  var rv = G.rival; if (rv && rv.tele) { var T = rv.tele, kt = 1 - T.t / 1.15; ctx.save(); ctx.globalAlpha = 0.18 + kt * 0.35; ctx.fillStyle = '#d9534a'; ctx.beginPath(); ctx.arc(T.x, T.y, T.r * kt, 0, 6.3); ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.arc(T.x, T.y, T.r, 0, 6.3); ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.strokeStyle = '#d9534a'; ctx.stroke(); ctx.setLineDash([]); }
  G.fx.forEach(function (f) { if (f.kind === 'quake' || f.kind === 'ghost' || f.kind === 'ghostR' || f.kind === 'blink' || f.kind === 'mud' || f.kind === 'fort' || f.kind === 'bloom') drawFx(f); });
  var list = [];
  G.structs.forEach(function (s) { if (onScreen(s.x, s.y)) list.push(s); });
  G.units.forEach(function (u) { if (alive(u) && onScreen(u.x, u.y)) list.push(u); });
  list.sort(function (a, c) { return a.y - c.y; });
  list.forEach(function (e) {
    if (e.kind === 'turret' || e.kind === 'core') drawTower(e);
    else if (e.kind === 'minion') drawMinion(e);
    else if (e.kind === 'boss') drawBoss(e);
    else if (e.kind === 'monster') drawMonster(e);
    else if (e.kind === 'hero') drawHero(e);
    else if (e.kind === 'rival') drawRival(e);
  });
  G.proj.forEach(drawProj);
  G.fx.forEach(function (f) { if (f.kind !== 'quake' && f.kind !== 'ghost' && f.kind !== 'ghostR' && f.kind !== 'blink' && f.kind !== 'mud' && f.kind !== 'fort' && f.kind !== 'bloom') drawFx(f); });
  G.floats.forEach(function (f) { if (!onScreen(f.x, f.y)) return; ctx.save(); ctx.globalAlpha = Math.min(1, f.life * 2); ctx.font = '700 ' + (f.big ? 30 : 21) + 'px Caveat, cursive'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = PAPER2; ctx.strokeText(f.s, f.x, f.y); ctx.fillStyle = f.col; ctx.fillText(f.s, f.x, f.y); ctx.restore(); });
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawHud();
}
function hpBar(x, y, w, frac, col, sh, shield) { ctx.fillStyle = 'rgba(46,38,32,0.75)'; ctx.fillRect(x - w / 2 - 1.5, y - 1.5, w + 3, 8); ctx.fillStyle = '#efe7d6'; ctx.fillRect(x - w / 2, y, w, 5); ctx.fillStyle = sh ? '#8d9bbf' : col; ctx.fillRect(x - w / 2, y, w * Math.max(0, Math.min(1, frac)), 5); if (shield) { ctx.fillStyle = '#e8eef8'; ctx.fillRect(x - w / 2 + w * Math.max(0, frac), y, Math.min(w * (1 - frac), w * shield), 5); } }
function drawTower(s) {
  if (s.kind === 'mini') { drawMini(s); return; }
  var col = s.team ? NAVY : CL, light = s.team ? '#9fb1d8' : '#f6c3a6';
  if (s.hp <= 0) { inkCircle(s.x, s.y, 34, 4, 3, 1.4, INK, '#b9b4ab'); for (var i = 0; i < 5; i++) { ctx.fillStyle = '#9b958c'; ctx.fillRect(s.x - 24 + i * 11, s.y - 8 - (i % 2) * 6, 10, 8); } return; }
  var big = s.kind === 'core' ? 1.4 : 1, H = 74 * big, w = 34 * big;
  ctx.fillStyle = 'rgba(46,38,32,0.2)'; ctx.beginPath(); ctx.ellipse(s.x, s.y + 4, w * 1.1, 12 * big, 0, 0, 6.3); ctx.fill();
  inkCircle(s.x, s.y, w * 0.95, 2, 2, 1.5, INK, '#c9c2b5');
  wobRect(s.x - w / 2, s.y - H, w, H, s.x | 0, 0.7); ctx.fillStyle = s.hitT > 0 ? '#fff' : light; ctx.fill();
  ctx.save(); ctx.clip(); scratch(s.x - w / 2, s.y - H, w, H, 50, col, 0.55, -0.9, s.y | 0); ctx.restore();
  wobRect(s.x - w / 2, s.y - H, w, H, s.x | 0, 0.7); stroke(1.6, INK);
  wobRect(s.x - w / 2 - 6, s.y - H - 10, w + 12, 12, 3, 0.5); ctx.fillStyle = col; ctx.fill(); stroke(1.4, INK);
  var gy = s.y - H - 26 + Math.sin(time * 3 + s.x) * 3;
  ctx.beginPath(); ctx.moveTo(s.x, gy - 16 * big); ctx.lineTo(s.x + 10 * big, gy); ctx.lineTo(s.x, gy + 12 * big); ctx.lineTo(s.x - 10 * big, gy); ctx.closePath(); ctx.fillStyle = s.team ? '#6b8fe0' : GOLD; ctx.fill(); stroke(1.3, INK);
  if (s.kind === 'core') { ctx.font = '700 22px Caveat, cursive'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText('Pangkalan', s.x, s.y + 28); }
  var sh = shielded(s);
  if (sh) { ctx.save(); ctx.globalAlpha = 0.25 + Math.sin(time * 4) * 0.08; ctx.fillStyle = '#9fb1d8'; ctx.beginPath(); ctx.ellipse(s.x, s.y - H / 2 - 10, w * 1.3, H * 0.75, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
  hpBar(s.x, s.y - H - 52 * big, 64 * big, s.hp / s.max, s.team ? '#5b78c2' : '#6fa83c', sh);
}
function drawMinion(u) {
  var near = cam.z > 0.55;
  if (u.catT > 0) { drawKitten(u.x, u.y, 0.8); if (u.hp < u.max) hpBar(u.x, u.y - 34, 30, u.hp / u.max, '#5b78c2'); return; }
  if (u.naga) { drawNagaKawan(u); if (u.stunT > 0) stunStars(u.x, u.y - 60); hpBar(u.x, u.y - 66, 60, u.hp / u.max, '#e58a5f'); return; }
  if (u.team === 0 && G.buffs.semangat > 0) { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#9cc96b'; ctx.beginPath(); ctx.ellipse(u.x, u.y + 6, 20, 6, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
  if (u.team === 0) drawClawd(u.x, u.y + 6, { s: 0.6, face: u.face, t: time + u.i, run: !u.target, atk: u.atk > 0, pencil: u.ranged, detail: near, col: u.hitT > 0 ? '#fff' : CL });
  else drawComot(u.x, u.y - 8, 14, { t: time, i: u.i, col: u.hitT > 0 ? '#fff' : (u.burnT > 0 ? '#8a3a3a' : (u.ranged ? PLUM : NAVY)), staff: u.ranged, detail: near, lx: u.face * 0.6, stun: u.stunT > 0 });
  if (u.stunT > 0) stunStars(u.x, u.y - 38);
  if (u.slowT > 0) { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = SKY; ctx.beginPath(); ctx.ellipse(u.x, u.y + 6, 18, 5, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
  if (u.hp < u.max) hpBar(u.x, u.y - 34, 30, u.hp / u.max, u.team ? '#5b78c2' : '#6fa83c');
}
function drawBoss(b) {
  var sh = shielded(b), h = G.hero, lx = 0, ly = 0;
  if (alive(h)) { var d = Math.hypot(h.x - b.x, h.y - b.y) || 1; lx = (h.x - b.x) / d; ly = (h.y - b.y) / d; }
  drawComot(b.x, b.y - 40, b.r, { t: time, i: 7, king: true, col: b.hitT > 0 ? '#fff' : '#3a2f50', lx: lx, ly: ly, stun: b.stunT > 0 });
  if (b.stunT > 0) stunStars(b.x, b.y - 150);
  if (sh) { ctx.save(); ctx.globalAlpha = 0.22 + Math.sin(time * 4) * 0.08; ctx.fillStyle = '#9fb1d8'; ctx.beginPath(); ctx.arc(b.x, b.y - 40, b.r + 26, 0, 6.3); ctx.fill(); ctx.globalAlpha = 0.7; ctx.lineWidth = 2; ctx.strokeStyle = '#6b7fb0'; ctx.stroke(); ctx.restore(); }
  ctx.font = '700 26px Caveat, cursive'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText('Raja Comot', b.x, b.y + 50);
}
function drawHero(h) {
  if (h.dead) return;
  var z = h.z || 0;
  if (G.buffs.merah > 0 || G.buffs.biru > 0) { for (var i = 0; i < 2; i++) if (Math.random() < 0.3) G.fx.push({ kind: 'p', type: G.buffs.merah > 0 && (i === 0 || !(G.buffs.biru > 0)) ? 'fire' : 'water', x: h.x + (Math.random() - 0.5) * 34, y: h.y - 10, vx: 0, vy: -40, t: 0, life: 0.6, r: 3, rot: 0 }); }
  if (G.buffs.kuasa > 0 || G.buffs.laju > 0 || G.buffs.perisai > 0 || G.buffs.kebal > 0) { ctx.save(); ctx.globalAlpha = 0.3 + Math.sin(time * 8) * 0.1; ctx.fillStyle = G.buffs.perisai > 0 || G.buffs.kebal > 0 ? '#9fb1d8' : (G.buffs.kuasa > 0 ? '#f2b04a' : '#bfe08a'); ctx.beginPath(); ctx.ellipse(h.x, h.y, 34, 12, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
  if (h.recall > 0) { ctx.save(); ctx.strokeStyle = SKY; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(h.x, h.y - 20, 46, -Math.PI / 2, -Math.PI / 2 + 6.283 * h.recall / 3); ctx.stroke(); ctx.globalAlpha = 0.25; ctx.fillStyle = SKY; ctx.fillRect(h.x - 30, h.y - 120, 60, 120); ctx.restore(); }
  if (z) { ctx.fillStyle = 'rgba(46,38,32,0.25)'; ctx.beginPath(); ctx.ellipse(h.x, h.y + 2, 26 - z * 0.08, 8, 0, 0, 6.3); ctx.fill(); }
  if (h.invis > 0) ctx.globalAlpha = 0.35;
  drawClawd(h.x, h.y + 4 - z, { s: 1.35, hero: h.id, face: h.face, t: time, run: h.moving || !!h.dash, atk: h.atkAnim > 0, angry: h.atkAnim > 0 || !!h.leap, mood: h.hitT > 0 ? 'hurt' : '', blink: Math.sin(time * 1.7) > 0.985, shadow: !z });
  ctx.globalAlpha = 1;
  if (h.stunT > 0) stunStars(h.x, h.y - 84 - z);
  if (h.slowT > 0) { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = PLUM; ctx.beginPath(); ctx.ellipse(h.x, h.y + 6, 30, 9, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
  if (h.shield > 0) { ctx.save(); ctx.globalAlpha = 0.25 + Math.sin(time * 5) * 0.06; ctx.fillStyle = '#e8eef8'; ctx.beginPath(); ctx.arc(h.x, h.y - 24 - z, 44, 0, 6.3); ctx.fill(); ctx.globalAlpha = 0.8; ctx.lineWidth = 2; ctx.strokeStyle = '#8d9bbf'; ctx.stroke(); ctx.restore(); }
  hpBar(h.x, h.y - 70 - z, 64, h.hp / h.max, '#6fa83c', false, h.shield / h.max);
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(h.x - 42, h.y - 67 - z, 9, 0, 6.3); ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = INK; ctx.stroke();
  ctx.font = '800 11px Geist, sans-serif'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(h.lvl, h.x - 42, h.y - 63 - z);
}
function drawProj(p) {
  if (!onScreen(p.x, p.y)) return;
  ctx.save(); ctx.translate(p.x, p.y);
  if (p.kind === 'bigarrow') { ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillStyle = '#b8861c'; ctx.fillRect(-30, -3, 40, 6); ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(28, 0); ctx.lineTo(10, 10); ctx.closePath(); ctx.fillStyle = NAVY; ctx.fill(); stroke(1.4, INK); ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-30, -8); ctx.lineTo(-22, 0); ctx.lineTo(-30, 8); ctx.stroke(); }
  else if (p.kind === 'starball') { inkCircle(0, 0, 16, time * 4, 2, 1.6, INK, '#f6d77a'); star4(0, 0, 12, time * 8, '#fff', 2); }
  else if (p.kind === 'arrow') { ctx.rotate(p.ang || 0); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(10, 0); ctx.stroke(); ctx.fillStyle = p.emp ? '#d9534a' : NAVY; ctx.beginPath(); ctx.moveTo(10, -5); ctx.lineTo(18, 0); ctx.lineTo(10, 5); ctx.fill(); }
  else if (p.kind === 'orb') { ctx.beginPath(); ctx.arc(0, 0, 8, 0, 6.3); ctx.fillStyle = '#c9b8f0'; ctx.fill(); stroke(1.2, INK); star4(0, 0, 6, time * 9, '#fff', 1.4); }
  else if (p.kind === 'inkblob') { inkCircle(0, 0, 14, time * 5, 3, 1.6, INK, PLUM); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(-4, -4, 4, 0, 6.3); ctx.fill(); }
  else if (p.kind === 'fireball') { inkCircle(0, 0, 16, time * 6, 3, 1.6, INK, '#f2b04a'); inkCircle(0, 0, 8, time * 9, 2, 0, null, '#d9534a'); }
  else if (p.kind === 'bomb') { ctx.rotate(time * 8); ctx.beginPath(); ctx.arc(0, 0, 11, 0, 6.3); ctx.fillStyle = '#3a3a3a'; ctx.fill(); stroke(1.4, INK); ctx.fillStyle = '#f2b04a'; ctx.fillRect(-2, -16, 4, 6); }
  else if (p.kind === 'rocket') { ctx.rotate(p.ang || 0); ctx.fillStyle = PAPER2; ctx.fillRect(-12, -4, 20, 8); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(-12, -4, 20, 8); ctx.beginPath(); ctx.moveTo(8, -4); ctx.lineTo(15, 0); ctx.lineTo(8, 4); ctx.fillStyle = '#d9534a'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#f2b04a'; ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(-20 - Math.random() * 6, 0); ctx.lineTo(-12, 3); ctx.fill(); }
  else if (p.kind === 'boomer') { ctx.rotate(time * 18); ctx.beginPath(); ctx.moveTo(-12, 8); ctx.quadraticCurveTo(-3, -3, 12, -12); ctx.lineTo(15, -8); ctx.quadraticCurveTo(0, 0, -7, 13); ctx.closePath(); ctx.fillStyle = '#f2c14e'; ctx.fill(); stroke(1.3, INK); }
  else if (p.kind === 'rivalshot') { ctx.rotate(p.ang || 0); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(8, 0); ctx.lineWidth = 3; ctx.strokeStyle = RIVAL; ctx.stroke(); ctx.beginPath(); ctx.arc(9, 0, 4, 0, 6.3); ctx.fillStyle = RIVAL; ctx.fill(); stroke(1, INK); }
  else if (p.kind === 'leafshot') { ctx.rotate((p.ang || 0) + time * 6); ctx.beginPath(); ctx.ellipse(0, 0, 8, 4, 0, 0, 6.3); ctx.fillStyle = '#9cc96b'; ctx.fill(); stroke(1.1, INK); }
  else if (p.kind === 'pellet') { ctx.beginPath(); ctx.arc(0, 0, 4, 0, 6.3); ctx.fillStyle = '#f2c14e'; ctx.fill(); stroke(1.2, INK); }
  else { ctx.beginPath(); ctx.arc(0, 0, p.big ? 11 : 5, 0, 6.3); ctx.fillStyle = p.big ? '#3a2f50' : PLUM; ctx.fill(); stroke(1.2, INK); }
  ctx.restore();
}
function drawFx(f) {
  if (f.x !== undefined && !onScreen(f.x, f.y)) return;
  ctx.save();
  var k;
  if (f.kind === 'beam') { ctx.globalAlpha = 1 - f.t / 0.18; ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = f.col; ctx.stroke(); }
  else if (f.kind === 'spin') { k = f.t / 0.45; ctx.globalAlpha = 1 - k; for (var i = 0; i < 4; i++) { ctx.lineWidth = 9 - i * 2; ctx.strokeStyle = i % 2 ? '#fff' : f.col; ctx.beginPath(); ctx.arc(f.x, f.y - 10, f.r * (0.35 + k * 0.65), k * 12 + i * 1.57, k * 12 + i * 1.57 + 1.1); ctx.stroke(); } inkCircle(f.x, f.y - 10, f.r * (0.4 + k * 0.6), 2, 4, 2, INK, null); }
  else if (f.kind === 'ring') { k = f.t / 0.5; ctx.globalAlpha = 1 - k; inkCircle(f.x, f.y, f.r * (0.5 + k * 0.6), 3, 6, 5 * (1 - k) + 1, INK, 'rgba(90,45,88,' + 0.3 * (1 - k) + ')'); }
  else if (f.kind === 'star' && f.t > 0) { var e = Math.min(1, f.t / 0.45), y = f.y - 420 * (1 - e); ctx.globalAlpha = f.t > 0.45 ? 1 - (f.t - 0.45) / 0.35 : 1; ctx.strokeStyle = 'rgba(242,193,78,0.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(f.x + 60 * (1 - e), y - 80); ctx.lineTo(f.x, y); ctx.stroke(); star4(f.x, y, 20, time * 8, GOLD, 4.5); star4(f.x, y, 20, time * 8, INK, 1.2); if (f.t > 0.45) inkCircle(f.x, f.y, f.r * (0.6 + (f.t - 0.45)), 4, 5, 3, GOLD, 'rgba(242,176,74,0.25)'); }
  else if (f.kind === 'volley' && f.t > 0) { for (var v = 0; v < 6; v++) { var ax = f.x + (hsh(v + f.r + Math.floor(f.t * 3)) - 0.5) * f.r * 1.6, ay = f.y + (hsh(v * 3.1 + f.r) - 0.5) * f.r, prog = Math.min(1, f.t / 0.3), py = ay - 300 * (1 - prog); ctx.globalAlpha = f.t > 0.3 ? 1 - (f.t - 0.3) / 0.3 : 1; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ax - 6, py - 26); ctx.lineTo(ax, py); ctx.stroke(); ctx.fillStyle = NAVY; ctx.beginPath(); ctx.moveTo(ax - 4, py - 6); ctx.lineTo(ax + 2, py + 6); ctx.lineTo(ax + 5, py - 3); ctx.fill(); } }
  else if (f.kind === 'dot') { ctx.globalAlpha = 1 - f.t / 0.35; ctx.fillStyle = f.col || NAVY; ctx.beginPath(); ctx.arc(f.x, f.y, 5 * (1 - f.t / 0.35), 0, 6.3); ctx.fill(); }
  else if (f.kind === 'plus') { ctx.globalAlpha = 1 - f.t / 0.6; ctx.font = '800 18px Geist, sans-serif'; ctx.fillStyle = '#3f6b22'; ctx.fillText('+', f.x, f.y - f.t * 40); }
  else if (f.kind === 'slash') { k = f.t / 0.22; ctx.globalAlpha = 1 - k; ctx.translate(f.x, f.y); ctx.rotate(f.a); ctx.lineCap = 'round'; ctx.lineWidth = 7 * (1 - k) + 1; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, 0, 26, -1 + k, 0.9 + k); ctx.stroke(); ctx.lineWidth = 4 * (1 - k) + 0.5; ctx.strokeStyle = f.col || '#fff'; ctx.stroke(); }
  else if (f.kind === 'ghost') { ctx.globalAlpha = 0.35 * (1 - f.t / 0.3); drawClawd(f.x, f.y + 4, { s: 1.35, hero: G.hero.id, face: f.face, t: time, shadow: false, detail: false, col: '#f6d1bd', cape: false }); }
  else if (f.kind === 'wind') { k = f.t / 0.5; ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#8fc0a8'; ctx.lineWidth = 3; for (var w = 0; w < 3; w++) { ctx.beginPath(); ctx.arc(f.x, f.y - 20, 20 + k * 50 + w * 10, w * 2 + k * 6, w * 2 + k * 6 + 2.2); ctx.stroke(); } }
  else if (f.kind === 'bolt') { k = f.t / 0.35; ctx.globalAlpha = 1 - k; for (var pass = 0; pass < 2; pass++) { ctx.beginPath(); for (var j = 0; j < f.pts.length - 1; j++) { var a = f.pts[j], c = f.pts[j + 1]; if (!j) ctx.moveTo(a[0], a[1]); for (var s = 1; s <= 5; s++) { var q = s / 5; ctx.lineTo(a[0] + (c[0] - a[0]) * q + (s < 5 ? (Math.random() - 0.5) * 22 : 0), a[1] + (c[1] - a[1]) * q + (s < 5 ? (Math.random() - 0.5) * 22 : 0)); } } ctx.lineWidth = pass ? 2.5 : 7; ctx.strokeStyle = pass ? '#fff' : '#7f9fd9'; ctx.stroke(); } }
  else if (f.kind === 'explode') { k = f.t / 0.45; ctx.globalAlpha = 1 - k; inkCircle(f.x, f.y, f.r * (0.3 + k * 0.8), 2, 6, 3, INK, 'rgba(246,215,122,' + 0.6 * (1 - k) + ')'); for (var st = 0; st < 6; st++) star4(f.x + Math.cos(st) * f.r * k, f.y + Math.sin(st) * f.r * k * 0.7, 6, time * 6, GOLD, 2); }
  else if (f.kind === 'quake') { k = f.t / 0.7; ctx.globalAlpha = 1 - k; inkCircle(f.x, f.y, f.r * (0.4 + k * 0.7), 1, 8, 4, INK, 'rgba(201,159,107,' + 0.4 * (1 - k) + ')'); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; for (var cr = 0; cr < 8; cr++) { var ca = cr / 8 * 6.283 + 0.3; ctx.beginPath(); ctx.moveTo(f.x + Math.cos(ca) * 20, f.y + Math.sin(ca) * 10); ctx.lineTo(f.x + Math.cos(ca + 0.15) * f.r * 0.5, f.y + Math.sin(ca + 0.15) * f.r * 0.25); ctx.lineTo(f.x + Math.cos(ca - 0.1) * f.r * 0.85, f.y + Math.sin(ca - 0.1) * f.r * 0.45); ctx.stroke(); } }
  else if (f.kind === 'pillar') { k = f.t / 0.9; ctx.globalAlpha = 0.5 * (1 - k); ctx.fillStyle = f.col || GOLD; ctx.fillRect(f.x - 30 + k * 10, f.y - 200, 60 - k * 20, 200); for (var ps = 0; ps < 4; ps++) star4(f.x + (ps - 1.5) * 18, f.y - 40 - k * 150 - ps * 20, 5, time * 5 + ps, GOLD, 1.6); }
  else if (f.kind === 'mud') { ctx.globalAlpha = Math.min(1, (4 - f.t) * 2) * 0.55; inkCircle(f.x, f.y, f.r, 2, 6, 2, '#5b4a2e', '#8a6f45'); for (var mb = 0; mb < 5; mb++) { var ma = mb * 1.3 + f.t, mr = (mb * 23) % (f.r - 20); ctx.beginPath(); ctx.arc(f.x + Math.cos(ma) * mr, f.y + Math.sin(ma) * mr * 0.6, 4 + Math.sin(f.t * 4 + mb) * 2, 0, 6.3); ctx.strokeStyle = '#5b4a2e'; ctx.lineWidth = 1.2; ctx.stroke(); } }
  else if (f.kind === 'fort') { k = f.t / 0.6; ctx.globalAlpha = 1 - k * 0.8; inkCircle(f.x, f.y, f.r * (1 - k * 0.6), 3, 5, 4, '#5f6b3a', 'rgba(154,168,106,' + 0.35 * (1 - k) + ')'); for (var fb = 0; fb < 10; fb++) { var fa = fb / 10 * 6.283, fr = f.r * (1 - k * 0.6); ctx.fillStyle = '#e8e1d2'; ctx.fillRect(f.x + Math.cos(fa) * fr - 7, f.y + Math.sin(fa) * fr * 0.7 - 18, 14, 18); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(f.x + Math.cos(fa) * fr - 7, f.y + Math.sin(fa) * fr * 0.7 - 18, 14, 18); } }
  else if (f.kind === 'bloom') { k = f.t / 0.8; ctx.globalAlpha = 1 - k; for (var pl = 0; pl < 8; pl++) { var pa = pl / 8 * 6.283 + k; ctx.beginPath(); ctx.ellipse(f.x + Math.cos(pa) * f.r * k, f.y + Math.sin(pa) * f.r * k * 0.6, 22, 11, pa, 0, 6.3); ctx.fillStyle = pl % 2 ? '#f6c3d4' : '#9cc96b'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke(); } inkCircle(f.x, f.y, 18, 1, 2, 1.4, INK, GOLD); }
  else if (f.kind === 'storm' && f.t > 0) { k = Math.min(1, f.t / 0.35); ctx.globalAlpha = f.t > 0.35 ? 1 - (f.t - 0.35) / 0.55 : 0.8; ctx.strokeStyle = '#b2627f'; ctx.lineWidth = 3; for (var sw = 0; sw < 4; sw++) { ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.3 + sw * 0.22) * k, time * 4 + sw, time * 4 + sw + 3.6); ctx.stroke(); } for (var ss = 0; ss < 6; ss++) star4(f.x + Math.cos(ss + time * 3) * f.r * 0.6 * k, f.y + Math.sin(ss + time * 3) * f.r * 0.4 * k, 6, time * 6, GOLD, 2); }
  else if (f.kind === 'ghostR') { ctx.globalAlpha = 0.35 * (1 - f.t / 0.3); drawPendekar(f.x, f.y, { t: time, face: f.face, col: '#9a8fb8' }); }
  else if (f.kind === 'blink') { k = f.t / 0.4; ctx.globalAlpha = 1 - k; inkCircle(f.x, f.y - 20, 20 + k * 40, 2, 3, 2, f.col || SKY, 'rgba(159,200,240,' + 0.4 * (1 - k) + ')'); for (var bs = 0; bs < 5; bs++) star4(f.x + Math.cos(bs * 1.26) * (20 + k * 40), f.y - 20 + Math.sin(bs * 1.26) * (20 + k * 40), 4, 0, '#fff', 1.4); }
  else if (f.kind === 'p') {
    var al = 1 - f.t / f.life; ctx.globalAlpha = al;
    if (f.type === 'star') star4(f.x, f.y, f.r + 1, f.rot + time * 4, GOLD, 1.4);
    else if (f.type === 'ink') { ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.3); ctx.fill(); }
    else if (f.type === 'paper') { ctx.fillStyle = CL; ctx.fillRect(f.x, f.y, f.r * 1.5, f.r); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.strokeRect(f.x, f.y, f.r * 1.5, f.r); }
    else if (f.type === 'chip') { ctx.translate(f.x, f.y); ctx.rotate(f.rot + f.t * 8); ctx.fillStyle = '#b9b4ab'; ctx.fillRect(-f.r, -f.r * 0.6, f.r * 2, f.r * 1.2); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.strokeRect(-f.r, -f.r * 0.6, f.r * 2, f.r * 1.2); }
    else if (f.type === 'smoke') { ctx.globalAlpha = al * 0.7; inkCircle(f.x, f.y, f.r * 4 * (1.4 - al), f.rot, 2, 1, INK, '#d8d0c3'); }
    else if (f.type === 'fire') { ctx.fillStyle = al > 0.5 ? '#f2b04a' : '#d9534a'; ctx.beginPath(); ctx.moveTo(f.x, f.y - f.r * 2.4); ctx.quadraticCurveTo(f.x + f.r * 1.4, f.y, f.x, f.y + f.r); ctx.quadraticCurveTo(f.x - f.r * 1.4, f.y, f.x, f.y - f.r * 2.4); ctx.fill(); }
    else if (f.type === 'leaf') { ctx.translate(f.x, f.y); ctx.rotate(f.rot + f.t * 5); ctx.beginPath(); ctx.ellipse(0, 0, f.r * 1.6, f.r * 0.8, 0, 0, 6.3); ctx.fillStyle = '#9cc96b'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke(); }
    else if (f.type === 'water') { ctx.fillStyle = SKY; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.3); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke(); }
  }
  ctx.restore();
}

function drawRival(R) {
  if (R.catT > 0) { drawKitten(R.x, R.y, 1.2); hpBar(R.x, R.y - 56, 64, R.hp / R.max, '#d9534a'); return; }
  var h = G.hero, lx = 0, ly = 0;
  if (alive(h)) { var d = Math.hypot(h.x - R.x, h.y - R.y) || 1; lx = (h.x - R.x) / d * 0.7; ly = (h.y - R.y) / d * 0.7; }
  if (R.lari) { ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = SKY; ctx.beginPath(); ctx.ellipse(R.x, R.y + 4, 30, 9, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = 0.85; ctx.setLineDash([6, 5]); ctx.lineWidth = 2.5; ctx.strokeStyle = RIVAL; ctx.beginPath(); ctx.ellipse(R.x, R.y + 4, 34, 11, 0, 0, 6.3); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  drawPendekar(R.x, R.y, { t: time, face: R.face, col: R.hitT > 0 ? '#fff' : '#3a2f50', lx: lx, ly: ly, stun: R.stunT > 0, atk: R.atkAnim > 0 });
  if (R.stunT > 0) stunStars(R.x, R.y - 80);
  if (R.slowT > 0) { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = SKY; ctx.beginPath(); ctx.ellipse(R.x, R.y + 6, 26, 8, 0, 0, 6.3); ctx.fill(); ctx.restore(); }
  hpBar(R.x, R.y - 82, 64, R.hp / R.max, '#d9534a');
  ctx.fillStyle = RIVAL; ctx.beginPath(); ctx.arc(R.x - 42, R.y - 79, 9, 0, 6.3); ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = INK; ctx.stroke();
  ctx.font = '800 11px Geist, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(R.lvl, R.x - 42, R.y - 75);
  ctx.font = '700 19px Caveat, cursive'; ctx.fillStyle = RIVAL; ctx.fillText('Pendekar Comot', R.x, R.y + 32);
}
function drawKitten(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(46,38,32,0.18)'; ctx.beginPath(); ctx.ellipse(0, 2, 16, 4, 0, 0, 6.3); ctx.fill();
  var bob = Math.sin(time * 10) * 1.5;
  ctx.beginPath(); ctx.ellipse(0, -10 + bob, 14, 10, 0, 0, 6.3); ctx.fillStyle = '#f6d1dd'; ctx.fill(); stroke(1.4, INK);
  ctx.beginPath(); ctx.moveTo(-11, -16 + bob); ctx.lineTo(-9, -27 + bob); ctx.lineTo(-3, -19 + bob); ctx.moveTo(11, -16 + bob); ctx.lineTo(9, -27 + bob); ctx.lineTo(3, -19 + bob); ctx.fillStyle = '#e79bb6'; ctx.fill(); stroke(1.2, INK);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-5, -11 + bob, 1.8, 0, 6.3); ctx.arc(5, -11 + bob, 1.8, 0, 6.3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-2, -7 + bob); ctx.lineTo(0, -5.5 + bob); ctx.lineTo(2, -7 + bob); stroke(1, INK);
  ctx.beginPath(); ctx.moveTo(13, -6 + bob); ctx.quadraticCurveTo(22, -12 + Math.sin(time * 8) * 4, 18, -22); stroke(1.6, INK);
  ctx.restore();
}
function drawMini(s) {
  var H = 40, w = 22;
  ctx.fillStyle = 'rgba(46,38,32,0.2)'; ctx.beginPath(); ctx.ellipse(s.x, s.y + 3, 22, 7, 0, 0, 6.3); ctx.fill();
  wobRect(s.x - w / 2, s.y - H, w, H, s.x | 0, 0.5); ctx.fillStyle = s.hitT > 0 ? '#fff' : '#bfe0dc'; ctx.fill(); stroke(1.4, INK);
  ctx.beginPath(); ctx.moveTo(s.x - 14, s.y - H); ctx.lineTo(s.x, s.y - H - 14); ctx.lineTo(s.x + 14, s.y - H); ctx.closePath(); ctx.fillStyle = '#5aa6a0'; ctx.fill(); stroke(1.3, INK);
  ctx.fillStyle = INK; ctx.fillRect(s.x - 3, s.y - H + 10, 6, 8);
  hpBar(s.x, s.y - H - 26, 40, s.hp / s.max, '#5aa6a0');
  ctx.fillStyle = '#e8e1d2'; ctx.fillRect(s.x - 20, s.y - H - 17, 40, 3); ctx.fillStyle = INK; ctx.fillRect(s.x - 20, s.y - H - 17, 40 * Math.max(0, s.life / 12), 3);
}
