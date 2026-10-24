/* Arena Clawd Pro: gambar kanvas untuk layar ML — latar masuk, panggung hero + pratinjau skill, kartu potret, kartu Comot, spanduk hasil.
   Setiap <canvas data-art="..."> digambar ulang tiap frame bila punya atribut data-anim. */
'use strict';

function artPrep(c) {
  var w = c.clientWidth, h = c.clientHeight; if (!w || !h) return null;
  var W = Math.round(w * DPR), H = Math.round(h * DPR);
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  ctx = c.getContext('2d'); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, w, h);
  return { w: w, h: h };
}
function drawArt(c) { var keep = ctx, d = artPrep(c); if (d && ARTS[c.getAttribute('data-art')]) ARTS[c.getAttribute('data-art')](c, d.w, d.h); ctx = keep; }
function artAll(semua) { document.querySelectorAll('canvas[data-art]').forEach(function (c) { if (semua || c.hasAttribute('data-anim')) drawArt(c); }); }

function skyNight(w, h, top, bot) { var g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top || '#0b1730'); g.addColorStop(1, bot || '#22406f'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
function starsSky(w, h, n) { for (var i = 0; i < n; i++) { var x = hsh(i * 3.1) * w, y = hsh(i * 7.7) * h * 0.6, a = 0.35 + 0.65 * Math.abs(Math.sin(time * (0.8 + hsh(i) * 2) + i)); ctx.globalAlpha = a; ctx.fillStyle = '#fff6d8'; ctx.fillRect(x, y, 1.6, 1.6); } ctx.globalAlpha = 1; }
function rays(cx, cy, R, col, n, spd, alpha) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(time * spd); ctx.globalAlpha = alpha; ctx.fillStyle = col; for (var i = 0; i < n; i++) { ctx.rotate(6.2832 / n); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R, -R * 0.09); ctx.lineTo(R, R * 0.09); ctx.closePath(); ctx.fill(); } ctx.restore(); }
function hills(w, h, y0, amp, col, u) { ctx.beginPath(); ctx.moveTo(0, h); for (var x = 0; x <= w + 20; x += 20) ctx.lineTo(x, y0 - Math.abs(Math.sin(x * 0.006 + u)) * amp - Math.sin(x * 0.021 + u * 3) * amp * 0.25); ctx.lineTo(w, h); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
function towerSil(x, y, s, col) { ctx.fillStyle = col; ctx.fillRect(x - 9 * s, y - 60 * s, 18 * s, 60 * s); ctx.fillRect(x - 13 * s, y - 68 * s, 26 * s, 9 * s); ctx.beginPath(); ctx.moveTo(x, y - 90 * s); ctx.lineTo(x + 7 * s, y - 76 * s); ctx.lineTo(x, y - 70 * s); ctx.lineTo(x - 7 * s, y - 76 * s); ctx.closePath(); ctx.fill(); }

var ARTS = {
  /* layar masuk: malam arena, bulan tinta, tiga hero di depan pasukan Comot */
  splash: function (c, w, h) {
    ctx.fillStyle = '#0c1526'; ctx.fillRect(0, 0, w, h); starsSky(w, h, 60);
    var mr = Math.min(w, h) * 0.045, mx = w * 0.88, my = h * 0.12;
    ctx.fillStyle = '#e9dfc6'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.3); ctx.fill(); ctx.fillStyle = '#0c1526'; ctx.beginPath(); ctx.arc(mx + mr * 0.42, my - mr * 0.2, mr * 0.9, 0, 6.3); ctx.fill();
    hills(w, h, h * 0.6, h * 0.1, '#121d33', 1); hills(w, h, h * 0.68, h * 0.06, '#0f182b', 4);
    towerSil(w * 0.1, h * 0.66, h / 560, '#1a2640'); towerSil(w * 0.9, h * 0.63, h / 560, '#1a2640');
    ctx.fillStyle = '#0a1120'; ctx.fillRect(0, h * 0.73, w, h * 0.27);
    ctx.strokeStyle = 'rgba(217,178,95,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, h * 0.73); ctx.lineTo(w, h * 0.73); ctx.stroke();
    var s = Math.min(h * 0.2 / 50, w * 0.2 / 44), fy = h * 0.72;
    drawClawd(w / 2 - 70 * s, fy, { s: s * 0.78, hero: 'pemanah', face: 1, t: time, shadow: false });
    drawClawd(w / 2 + 70 * s, fy, { s: s * 0.78, hero: 'nini', face: -1, t: time, shadow: false });
    drawClawd(w / 2, fy + Math.sin(time * 1.6) * 1.5, { s: s, hero: 'pahlawan', face: 0.4, t: time, shadow: false, blink: Math.sin(time * 1.7) > 0.985 });
  },
  /* panggung hero: lampu sorot, alas emas berputar, pratinjau skill */
  hero: function (c, w, h) {
    var id = c.getAttribute('data-hero'), S = skinObj(id, c.getAttribute('data-skin') || 'dasar');
    var g = ctx.createRadialGradient(w / 2, h * 0.55, 10, w / 2, h * 0.55, Math.max(w, h) * 0.6); g.addColorStop(0, S.aura ? S.aura + '33' : 'rgba(217,178,95,0.14)'); g.addColorStop(1, 'rgba(8,17,31,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    var fy = h * (c.hasAttribute('data-nameless') ? 0.86 : 0.7), rx = Math.min(w * 0.36, h * 0.42), ry = rx * 0.22;
    ctx.fillStyle = 'rgba(4,9,18,0.65)'; ctx.beginPath(); ctx.ellipse(w / 2, fy, rx, ry, 0, 0, 6.3); ctx.fill();
    ctx.save(); ctx.translate(w / 2, fy); ctx.scale(1, 0.22); ctx.rotate(time * 0.4); ctx.setLineDash([2, 10]); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(217,178,95,0.8)'; ctx.beginPath(); ctx.arc(0, 0, rx * 0.92, 0, 6.3); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(217,178,95,0.35)'; ctx.beginPath(); ctx.arc(0, 0, rx * 0.7, 0, 6.3); ctx.stroke(); ctx.restore();
    var s = Math.min(h * 0.6 / 56, w * 0.3 / 34), fx = c._fx, p = fx ? Math.min(1, fx.t / fx.dur) : 0, hx = w / 2, hz = 0, atk = false;
    var tx0 = Math.min(w - 30, w / 2 + Math.max(90, w * 0.3)), hasT = fx && w > 220;
    if (fx) { fx.t += artDt; if (fx.t > fx.dur + 0.5) c._fx = null; }
    if (fx && (fx.type === 'dash' || fx.type === 'double')) { hx = w / 2 + Math.sin(Math.PI * p) * (tx0 - w / 2 - 30 * s * 0.5); atk = p > 0.35 && p < 0.7; for (var gI = 1; gI < 4 && p < 0.7; gI++) { ctx.save(); ctx.globalAlpha = 0.18; drawClawd(hx - gI * 14, fy, { s: s, hero: id, skin: S, face: 1, t: time, detail: false, shadow: false }); ctx.restore(); } }
    if (fx && fx.type === 'slam') { hz = Math.sin(Math.PI * Math.min(1, p / 0.55)) * h * 0.18 * (p < 0.55 ? 1 : 0); }
    if (fx && fx.type !== 'dash') atk = p < 0.5 && Math.sin(time * 20) > 0;
    if (hasT && fx.type === 'mochi' && p > 0.4) drawMochi(tx0, fy - 6 * s * 0.6, s * 0.75, time, '#e4dcf6', -1);
    else if (hasT) { var hit = fx && p > 0.45 && p < 0.75; drawComot(tx0, fy - 8 * s * 0.6, 15 * s * 0.6, { t: time, flash: hit && Math.sin(time * 40) > 0, stun: fx.type === 'ring' && p > 0.5, detail: true }); }
    drawClawd(hx, fy + Math.sin(time * 2) * 2 - hz, { s: s, hero: id, skin: S, face: hasT ? 1 : 0.4, t: time, atk: atk, angry: !!fx, blink: Math.sin(time * 1.7) > 0.985, mood: fx && fx.type === 'heal' ? 'happy' : '' });
    if (fx) skillFx(fx, p, hx, fy, s, tx0, h);
  },
  /* kartu potret hero (zoom ke badan) */
  face: function (c, w, h) {
    var id = c.getAttribute('data-hero'), S = skinObj(id, c.getAttribute('data-skin') || 'dasar'), sq = w / h > 0.9;
    ctx.fillStyle = '#182641'; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = S.aura || S.col || HEROES[id].col; ctx.beginPath(); ctx.arc(w / 2, sq ? h * 0.48 : h * 0.5, Math.min(w, h) * 0.42, 0, 6.3); ctx.fill(); ctx.restore();
    var s = sq ? w / 30 : Math.min(w / 46, h / 74), fy = sq ? h * 0.5 + 21 * s : h * 0.74;
    drawClawd(w / 2, fy, { s: s, hero: id, skin: S, face: 0.5, t: c.hasAttribute('data-anim') ? time : 1, angry: !sq, shadow: false });
  },
  /* kartu Si Comot / Raja Comot / minion kita */
  comot: function (c, w, h) {
    var k = c.getAttribute('data-kind');
    ctx.fillStyle = k === 'raja' ? '#1d1c3d' : '#141f3a'; ctx.fillRect(0, 0, w, h);
    var r = Math.min(w * 0.3, h * 0.2) * (k === 'raja' ? 1.25 : 1);
    drawComot(w / 2, h * 0.52, r, { t: c.hasAttribute('data-anim') ? time : 1, i: 3, king: k === 'raja' || k === 'super', staff: k === 'jauh', cannon: k === 'meriam', col: k === 'jauh' ? PLUM : k === 'super' || k === 'raja' ? '#1f2b4d' : NAVY, lx: -0.6 });
  },
  minion: function (c, w, h) {
    var k = c.getAttribute('data-kind');
    ctx.fillStyle = '#231813'; ctx.fillRect(0, 0, w, h);
    var s = Math.min(w / 46, h / 64);
    drawClawd(w / 2, h * 0.5 + 18 * s, { s: s, face: 0.5, t: c.hasAttribute('data-anim') ? time : 1, pencil: k === 'jauh', crown: k === 'super', cannon: k === 'meriam', col: k === 'super' ? '#e9945f' : CL, shadow: false });
  },
  /* spanduk hasil: sinar berputar + sayap */
  banner: function (c, w, h) {
    var win = c.getAttribute('data-win') === '1', col = win ? '217,178,95' : '169,180,201';
    var g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.5); g.addColorStop(0, 'rgba(' + col + ',0.12)'); g.addColorStop(1, 'rgba(12,21,38,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    var lw = Math.min(w * 0.32, 300), y = h * 0.5;
    ctx.strokeStyle = 'rgba(' + col + ',0.55)'; ctx.lineWidth = 1;
    [-1, 1].forEach(function (sd) { var x0 = w / 2 + sd * Math.min(w * 0.24, 230); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + sd * lw * 0.6, y); ctx.stroke(); ctx.save(); ctx.translate(x0 + sd * lw * 0.6 + sd * 6, y); ctx.rotate(Math.PI / 4); ctx.strokeRect(-3, -3, 6, 6); ctx.restore(); });
    if (win) for (var i = 0; i < 18; i++) { var k = (time * 0.06 + hsh(i)) % 1; ctx.globalAlpha = Math.sin(k * Math.PI) * 0.7; ctx.fillStyle = '#d9b25f'; ctx.beginPath(); ctx.arc(hsh(i * 3.3) * w, h - k * h, 1.2 + hsh(i * 7) * 1.4, 0, 6.3); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
};

/* efek pratinjau skill di panggung hero */
function skillFx(fx, p, hx, fy, s, tx0, h) {
  var cy = fy - 20 * s, ty = fy - 10 * s, T = fx.type;
  ctx.save();
  if (T === 'spin') { for (var i = 0; i < 6; i++) { var a = time * 14 + i; ctx.globalAlpha = (1 - p) * 0.8; ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx, cy, 30 * s, a, a + 0.6); ctx.stroke(); } }
  if (T === 'slam' && p > 0.55) { var q = (p - 0.55) / 0.45; ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#d9534a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(hx, fy, 60 * s * q + 10, 14 * s * q + 3, 0, 0, 6.3); ctx.stroke(); }
  if (T === 'ring') { ctx.globalAlpha = 1 - p; ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(hx, fy, 90 * s * p + 10, 22 * s * p + 3, 0, 0, 6.3); ctx.stroke(); }
  if (T === 'shield') { ctx.globalAlpha = 0.35 + Math.sin(time * 8) * 0.1; ctx.fillStyle = '#cfe0f4'; ctx.beginPath(); ctx.arc(hx, cy, 34 * s, 0, 6.3); ctx.fill(); ctx.globalAlpha = 0.9; ctx.strokeStyle = '#8d9bbf'; ctx.lineWidth = 2; ctx.stroke(); }
  if (T === 'bolt' && p < 0.6) { var bx = hx + (tx0 - hx) * (p / 0.6); star4(bx, ty, 10 * s * 0.5 + 4, time * 10, GOLD, 3); ctx.globalAlpha = 0.4; ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx + 20, ty); ctx.lineTo(bx, ty); ctx.stroke(); }
  if (T === 'bolt' && p >= 0.6) { ctx.globalAlpha = 1 - (p - 0.6) / 0.4; inkCircle(tx0, ty, 30 * (p - 0.4), 1, 3, 2, INK, '#f8dd8a'); }
  if (T === 'chain' && p > 0.2 && p < 0.8) { ctx.strokeStyle = '#b6d4ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx + 15, cy); for (var k = 1; k <= 6; k++) ctx.lineTo(hx + (tx0 - hx) * k / 6, cy + (k % 2 ? -12 : 12) * Math.random() + (ty - cy) * k / 6); ctx.stroke(); }
  if (T === 'rain') { for (var r = 0; r < 8; r++) { var rp = (p * 2 + r / 8) % 1; star4(tx0 + (hsh(r) - 0.5) * 70, ty - 160 + rp * 160, 5, time * 6, GOLD, 2); } }
  if (T === 'double' && p > 0.4 && p < 0.8) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; [0, 1].forEach(function (d) { ctx.beginPath(); ctx.arc(tx0 - 6 + d * 12, ty, 22, -1 + d, 0.6 + d); ctx.stroke(); }); }
  if (T === 'heal') { for (var hI = 0; hI < 6; hI++) { var hp = (p * 1.5 + hI / 6) % 1; ctx.globalAlpha = 1 - hp; heart(hx + Math.sin(hI * 2) * 30 * s * 0.6, cy + 10 - hp * 70, 6, '#e8607e'); } ctx.globalAlpha = 0.5; ctx.strokeStyle = '#7ed87a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(hx, fy, 50 * s * 0.6, 12, 0, 0, 6.3); ctx.stroke(); }
  if (T === 'boomerang') { var bq = p < 0.5 ? p / 0.5 : 1 - (p - 0.5) / 0.5, bx2 = hx + 24 * s * 0.5 + (tx0 - hx) * bq; ctx.save(); ctx.translate(bx2, ty - Math.sin(Math.PI * bq) * 20); ctx.rotate(time * 18); drawBoomerang(0, 0, 0.9 + s * 0.25, '#f19bb4'); ctx.restore(); }
  if (T === 'mochi' && p < 0.4) { var mq = p / 0.4; drawMochi(hx + (tx0 - hx) * mq, cy - Math.sin(Math.PI * mq) * 70, s * 0.6, time, '#ffffff', 1); }
  if (T === 'mochi' && p >= 0.4) { ctx.globalAlpha = 1 - (p - 0.4) / 0.6; ctx.strokeStyle = '#f19bb4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(tx0, fy, 40 + 50 * (p - 0.4), 10 + 12 * (p - 0.4), 0, 0, 6.3); ctx.stroke(); ctx.globalAlpha = 1; }
  if (T === 'storm') { for (var w2 = 0; w2 < 3; w2++) { var wp = p * 3 - w2; if (wp < 0 || wp > 0.6) continue; ctx.globalAlpha = 1 - wp / 0.6; ctx.strokeStyle = '#b59ae8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx0 + 14, ty - 170); ctx.lineTo(tx0 - 8, ty - 100); ctx.lineTo(tx0 + 10, ty - 60); ctx.lineTo(tx0 - 4, ty); ctx.stroke(); ctx.strokeStyle = '#d9b25f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(tx0, fy, 30 + wp * 60, 8 + wp * 14, 0, 0, 6.3); ctx.stroke(); } ctx.globalAlpha = 1; }
  if (T === 'summon') { for (var m = 0; m < 3; m++) { var mp = Math.min(1, p * 2 - m * 0.2); if (mp <= 0) continue; ctx.globalAlpha = mp; drawClawd(hx + 40 + m * 34 + mp * 20, fy, { s: s * 0.45, face: 1, t: time + m, run: true, crown: true, col: '#e9945f' }); } }
  ctx.restore();
  if (p > 0.5 && p < 0.95 && tx0 && T !== 'shield' && T !== 'heal' && T !== 'summon' && T !== 'mochi') { ctx.save(); ctx.globalAlpha = 1 - (p - 0.5) * 2; ctx.font = '700 ' + Math.round(26 + s * 4) + 'px Caveat, cursive'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#0a1428'; var dmgTx = '−' + (120 + Math.round(hsh(fx.seed || 1) * 300)); ctx.strokeText(dmgTx, tx0, ty - 50 - (p - 0.5) * 60); ctx.fillStyle = '#ffd36b'; ctx.fillText(dmgTx, tx0, ty - 50 - (p - 0.5) * 60); ctx.restore(); }
}
function playSkill(c, n) { var id = c.getAttribute('data-hero'); c._fx = { type: SKFX[id][n], t: 0, dur: n === 2 ? 1.6 : 1.1, seed: Math.random() * 99 }; var S = SFX_SKILL[SKFX[id][n]]; if (S) sfx(S); }
var SFX_SKILL = { boomerang: 'dash', mochi: 'pop', storm: 'thunder', dash: 'dash', spin: 'spin', slam: 'slam', shield: 'heal', ring: 'boom', bolt: 'zap', chain: 'thunder', rain: 'star', double: 'slash', heal: 'heal', summon: 'ult' };
