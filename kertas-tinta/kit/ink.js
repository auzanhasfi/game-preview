/* ink.js — kit bersama 5 game Kertas & Tinta (remake gaya "Lompat Hitung · ink kertas").
   Isi: alat gambar tinta bergetar (boil 7 gambar/detik), Si Bulat, monster tinta, efek TING!/SPLAT!/PLOK!,
   suara sintesis, kerangka layar menu → main → hasil, mode demo (?demo=1) dan pratinjau (?preview=1). */
(function () {
  'use strict';
  var I = window.INK = {};
  var QS = new URLSearchParams(location.search);
  /* main otomatis dimatikan untuk pengguna: hanya aktif bila ada ?uji=1 (dipakai untuk tangkapan layar) */
  I.preview = QS.has('preview') && QS.has('uji');
  I.demo = I.preview || (QS.has('demo') && QS.has('uji'));
  I.REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) && !I.preview;
  var INK = '#2b2a28', PAPER = '#f4f2ee', PAPER2 = '#fbfaf7', ORG = '#d97757', ORG_D = '#b85c3a';
  I.C = { ink: INK, paper: PAPER, paper2: PAPER2, org: ORG, orgD: ORG_D, line: '#d9d4c9', muted: '#6d695f', wash: '#e4e0d8', blush: '#e7b8a4' };
  I.W = 480; I.H = 270;
  var ctx = null;
  I.time = 0;
  var seed = 0;

  /* ---------- util ---------- */
  I.ri = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  I.rf = function (a, b) { return a + Math.random() * (b - a); };
  I.pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  I.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  I.approach = function (v, t, d) { return v < t ? Math.min(v + d, t) : Math.max(v - d, t); };
  I.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  I.ov = function (a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; };
  I.store = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  var ri = I.ri, rf = I.rf, pick = I.pick;

  /* ---------- suara ---------- */
  var ac = null; I.muted = I.preview;
  function audioInit() {
    if (I.preview) return;
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
  }
  function tone(f1, f2, dur, type, vol, delay) {
    if (!ac || I.muted) return;
    var t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f1, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol || 0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  var SFX = {
    jump: function () { tone(300, 620, 0.14, 'triangle', 0.09); },
    land: function () { tone(130, 80, 0.07, 'triangle', 0.08); },
    coin: function () { tone(1760, 0, 0.22, 'sine', 0.07); tone(2349, 0, 0.3, 'sine', 0.05, 0.06); },
    bump: function () { tone(170, 100, 0.1, 'triangle', 0.1); },
    tick: function () { tone(880, 0, 0.06, 'triangle', 0.05); },
    pop: function () { tone(520, 1400, 0.08, 'triangle', 0.08); },
    whoosh: function () { tone(200, 900, 0.22, 'sine', 0.05); },
    correct: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0, 0.22, 'triangle', 0.08, i * 0.08); tone(f * 2, 0, 0.3, 'sine', 0.03, i * 0.08); }); },
    wrong: function () { tone(210, 90, 0.35, 'sawtooth', 0.06); },
    stomp: function () { tone(420, 70, 0.14, 'triangle', 0.1); },
    hurt: function () { tone(330, 80, 0.3, 'sawtooth', 0.06); },
    over: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, 0, 0.2, 'triangle', 0.08, i * 0.16); }); },
    win: function () { [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0, 0.14, 'triangle', 0.08, i * 0.1); }); }
  };
  I.sfx = function (n) { try { SFX[n](); } catch (e) { /* tanpa suara */ } };

  /* ---------- alat gambar tinta ---------- */
  function hsh(n) { var s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); }
  I.hsh = hsh;
  function jt(i, u) { return hsh(i * 7.13 + u * 3.71 + seed * 5.17) - 0.5; }
  I.jt = jt;
  function trace(pts) { ctx.beginPath(); for (var i = 0; i < pts.length; i++) { if (i) ctx.lineTo(pts[i][0], pts[i][1]); else ctx.moveTo(pts[i][0], pts[i][1]); } }
  function stroke(w, col) { ctx.lineWidth = w || 1.5; ctx.strokeStyle = col || INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
  I.trace = trace; I.stroke = stroke;
  I.line = function (x1, y1, x2, y2, u, amp, w, col) {
    var len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.round(len / 9)), pts = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, e = (i === 0 || i === n) ? 0.4 : 1;
      pts.push([x1 + (x2 - x1) * t + jt(i, u) * amp * e, y1 + (y2 - y1) * t + jt(i, u + 50) * amp * e]);
    }
    trace(pts); stroke(w, col);
  };
  I.rect = function (x, y, w, h, u, amp, lw, col) {
    I.line(x, y, x + w, y, u, amp, lw, col); I.line(x + w, y, x + w, y + h, u + 1, amp, lw, col);
    I.line(x + w, y + h, x, y + h, u + 2, amp, lw, col); I.line(x, y + h, x, y, u + 3, amp, lw, col);
  };
  I.circle = function (cx, cy, r, u, amp, lw, col, fill) {
    var n = Math.max(10, Math.round(r * 1.3)), pts = [];
    for (var i = 0; i <= n + 1; i++) {
      var a = (i / n) * 6.2832 + u, rr = r + jt(i % n, u) * amp;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    trace(pts);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (lw) stroke(lw, col);
  };
  I.hatch = function (x, y, w, h, gap, col, lw, alpha) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.globalAlpha = alpha === undefined ? 0.5 : alpha; ctx.strokeStyle = col || INK; ctx.lineWidth = lw || 0.8;
    for (var d = -h; d < w; d += gap) { ctx.beginPath(); ctx.moveTo(x + d, y + h); ctx.lineTo(x + d + h, y); ctx.stroke(); }
    ctx.restore();
  };
  I.star4 = function (x, y, r, rot, col, lw) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.strokeStyle = col; ctx.lineWidth = lw || 1.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.5); ctx.lineTo(r * 0.5, r * 0.5); ctx.moveTo(r * 0.5, -r * 0.5); ctx.lineTo(-r * 0.5, r * 0.5); ctx.stroke();
    ctx.restore();
  };
  I.cloud = function (x, y, s, u) {
    var w = 48 * s, h = 12 * s, pts = [];
    for (var i = 0; i <= 24; i++) {
      var t = i / 24;
      pts.push([x + t * w + jt(i, u) * 0.8, y - Math.abs(Math.sin(t * Math.PI * 3)) * h * (0.55 + 0.45 * Math.sin(t * Math.PI))]);
    }
    pts.push([x + w, y + 3]); pts.push([x, y + 3]);
    trace(pts); ctx.fillStyle = PAPER2; ctx.fill(); stroke(1.3, INK);
  };
  /* kartu label kertas berisi teks */
  I.card = function (x, y, w, h, u, o) {
    o = o || {};
    ctx.fillStyle = o.fill || PAPER2; ctx.fillRect(x, y, w, h);
    if (o.hatch) I.hatch(x, y, w, h, 4, INK, 0.8, 0.5);
    I.rect(x, y, w, h, u, o.amp === undefined ? 0.7 : o.amp, o.lw || 1.8, INK);
    if (o.mark) I.line(x + 2, y - 1, x + Math.min(12, w * 0.4), y - 1, u + 8, 0.3, 3, ORG);
    if (o.text !== undefined) I.text(String(o.text), x + w / 2, y + h / 2 + 1, { size: o.size || 16, col: o.col || INK, font: o.font });
    if (o.cross) { I.line(x + 5, y + 5, x + w - 5, y + h - 5, u + 11, 1, 2.2, INK); I.line(x + w - 5, y + 5, x + 5, y + h - 5, u + 12, 1, 2.2, INK); }
  };
  I.text = function (t, x, y, o) {
    o = o || {};
    ctx.font = (o.font || 'serif') === 'serif' ? '700 ' + (o.size || 16) + 'px "Source Serif 4", Georgia, serif'
      : o.font === 'hand' ? 'italic 700 ' + (o.size || 18) + 'px Caveat, "Segoe Print", cursive'
      : o.font === 'mono' ? '500 ' + (o.size || 8) + 'px "IBM Plex Mono", monospace' : o.font;
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
    ctx.fillStyle = o.col || INK; ctx.fillText(t, x, y);
  };
  /* pecahan bertumpuk: pembilang / garis / penyebut */
  I.frac = function (a, b, x, y, size, col) {
    size = size || 14;
    I.text(String(a), x, y - size * 0.62, { size: size, col: col });
    I.line(x - size * 0.55, y, x + size * 0.55, y, 77 + a, 0.3, 1.6, col || INK);
    I.text(String(b), x, y + size * 0.66, { size: size, col: col });
  };

  /* kertas: dasar + vinyet + butiran */
  var grain = null;
  (function () {
    var c = document.createElement('canvas'); c.width = 96; c.height = 96;
    var g = c.getContext('2d'), d = g.createImageData(96, 96);
    for (var i = 0; i < d.data.length; i += 4) { var v = 90 + Math.random() * 60; d.data[i] = v; d.data[i + 1] = v - 4; d.data[i + 2] = v - 10; d.data[i + 3] = Math.random() < 0.5 ? 0 : 10 + Math.random() * 14; }
    g.putImageData(d, 0, 0); grain = c;
  })();
  I.paper = function (tint) {
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, I.W, I.H);
    var vg = ctx.createRadialGradient(I.W / 2, I.H * 0.45, 24, I.W / 2, I.H / 2, I.W * 0.62);
    vg.addColorStop(0, 'rgba(255,255,252,0.95)'); vg.addColorStop(1, 'rgba(216,209,196,0.6)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, I.W, I.H);
    if (grain) { ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, I.W, I.H); }
    if (tint) { ctx.fillStyle = 'rgba(217,119,87,' + tint + ')'; ctx.fillRect(0, 0, I.W, I.H); }
  };
  I.grass = function (gy, u) {
    I.line(0, gy, I.W, gy, u || 3, 1, 1.7, INK);
    for (var i = 0; i < 16; i++) {
      var tx = 12 + i * 30 + hsh(i + (u || 0)) * 14;
      I.line(tx, gy, tx - 2.5, gy - 5, i + 60, 0.4, 1.1, INK); I.line(tx, gy, tx + 0.5, gy - 6.5, i + 80, 0.4, 1.1, INK); I.line(tx, gy, tx + 3, gy - 4.5, i + 100, 0.4, 1.1, INK);
    }
  };
  I.sun = function (x, y, r) {
    I.circle(x, y, r, 2, 0.8, 1.5, INK, 'rgba(217,119,87,0.92)');
    for (var k = 0; k < 8; k++) { var a = k / 8 * 6.2832 + 0.2; I.line(x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6), x + Math.cos(a) * (r + 13), y + Math.sin(a) * (r + 13), k + 20, 0.6, 1.2, INK); }
  };

  /* ---------- Si Bulat (maskot bulat oranye, mata lengkung, senyum lebar) ---------- */
  I.bulat = function (cx, fy, o) {
    o = o || {};
    var r = o.r || 13, sq = o.sq || 0, face = o.face || 1, t = o.t || 0, mood = o.mood || 'happy';
    ctx.save();
    ctx.translate(cx, fy); ctx.scale(1 + sq * 0.6, 1 - sq);
    if (o.rot) { ctx.translate(0, -r); ctx.rotate(o.rot); ctx.translate(0, r); }
    var step = o.run ? Math.sin(t * 16) * r * 0.22 : 0;
    if (!o.noFeet) {
      ctx.fillStyle = INK;
      var fyy = o.air ? -r * 0.22 : -r * 0.1;
      ctx.beginPath(); ctx.ellipse(-r * 0.42 + step, fyy, r * 0.3, r * 0.17, 0, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.ellipse(r * 0.42 - step, fyy, r * 0.3, r * 0.17, 0, 0, 6.3); ctx.fill();
    }
    var by = -r - r * 0.18;
    I.circle(0, by, r, 4, Math.min(1.1, r * 0.08), 1.8, INK, ORG);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-r * 0.42, by - r * 0.5, r * 0.26, r * 0.14, -0.6, 0, 6.3); ctx.fill();
    var ex = face * r * 0.14, ey = by - r * 0.18, sep = r * 0.36, lw = Math.max(1.3, r * 0.13);
    ctx.strokeStyle = '#3a1608'; ctx.lineWidth = lw; ctx.lineCap = 'round';
    if (mood === 'hurt') {
      [-1, 1].forEach(function (s) { var x0 = ex + s * sep; ctx.beginPath(); ctx.moveTo(x0 - r * 0.12, ey - r * 0.12); ctx.lineTo(x0 + r * 0.12, ey + r * 0.12); ctx.moveTo(x0 + r * 0.12, ey - r * 0.12); ctx.lineTo(x0 - r * 0.12, ey + r * 0.12); ctx.stroke(); });
      ctx.beginPath(); ctx.ellipse(ex, by + r * 0.38, r * 0.16, r * 0.2, 0, 0, 6.3); ctx.stroke();
    } else if (mood === 'wow' || o.blink === 'open') {
      ctx.fillStyle = '#3a1608';
      ctx.beginPath(); ctx.arc(ex - sep, ey, r * 0.12, 0, 6.3); ctx.arc(ex + sep, ey, r * 0.12, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.ellipse(ex, by + r * 0.38, r * 0.15, r * 0.19, 0, 0, 6.3); ctx.stroke();
    } else {
      var lift = o.blink ? 0 : r * 0.13;
      [-1, 1].forEach(function (s) { var x0 = ex + s * sep; ctx.beginPath(); ctx.moveTo(x0 - r * 0.16, ey + r * 0.05); ctx.quadraticCurveTo(x0, ey - lift - r * 0.08, x0 + r * 0.16, ey + r * 0.05); ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(ex - r * 0.45, by + r * 0.18); ctx.quadraticCurveTo(ex, by + r * 0.78, ex + r * 0.45, by + r * 0.18); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(231,120,100,0.45)';
    ctx.beginPath(); ctx.ellipse(ex - r * 0.66, by + r * 0.16, r * 0.15, r * 0.09, 0, 0, 6.3); ctx.ellipse(ex + r * 0.66, by + r * 0.16, r * 0.15, r * 0.09, 0, 0, 6.3); ctx.fill();
    ctx.restore();
  };

  /* ---------- monster tinta (gumpalan hitam bermata) ---------- */
  I.blob = function (cx, by, o) {
    o = o || {};
    var s = o.s || 1, t = o.t || 0, dead = o.dead > 0;
    var sqY = dead ? 0.4 : 1 + Math.sin(t * 8) * 0.06, sqX = dead ? 1.35 : 1 - Math.sin(t * 8) * 0.04;
    ctx.save();
    if (dead) ctx.globalAlpha = Math.max(0, o.dead / 0.5);
    ctx.translate(cx, by); ctx.scale(sqX * s, sqY * s); ctx.translate(-cx, -by);
    if (o.wings) {
      var fl = Math.sin(t * 14) * 7;
      [-1, 1].forEach(function (d) {
        var pts = [[cx + d * 10, by - 14], [cx + d * 26, by - 22 - fl], [cx + d * 22, by - 12 - fl * 0.4], [cx + d * 30, by - 8 - fl * 0.2], [cx + d * 12, by - 6]];
        trace(pts); ctx.fillStyle = INK; ctx.fill(); stroke(1.1, INK);
      });
    }
    var pts = [], i;
    for (i = 0; i <= 10; i++) { var a = Math.PI + (i / 10) * Math.PI; pts.push([cx + Math.cos(a) * 15 + jt(i, 3) * 1.1, by - 3 + Math.sin(a) * 18 + jt(i, 8) * 1.1]); }
    for (i = 1; i <= 4; i++) pts.push([cx + 15 - i * 7.5, by - 1 + (i % 2 ? 2.5 : -1) + jt(i, 15) * 0.8]);
    trace(pts); ctx.fillStyle = INK; ctx.fill(); stroke(1.2, INK);
    if (o.crown) {
      var cy0 = by - 20;
      trace([[cx - 9, cy0], [cx - 9, cy0 - 9], [cx - 4, cy0 - 4], [cx, cy0 - 11], [cx + 4, cy0 - 4], [cx + 9, cy0 - 9], [cx + 9, cy0]]);
      ctx.closePath(); ctx.fillStyle = ORG; ctx.fill(); stroke(1.2, INK);
    }
    ctx.fillStyle = 'rgba(244,242,238,0.45)'; ctx.beginPath(); ctx.ellipse(cx - 6, by - 15, 4, 2.2, -0.5, 0, 6.3); ctx.fill();
    var ey = by - 10, ed = (o.dir || 1) > 0 ? 1.4 : -1.4;
    if (o.hurt) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      [-5.5, 5.5].forEach(function (dx) { ctx.beginPath(); ctx.moveTo(cx + dx - 2.5, ey - 2.5); ctx.lineTo(cx + dx + 2.5, ey + 2.5); ctx.moveTo(cx + dx + 2.5, ey - 2.5); ctx.lineTo(cx + dx - 2.5, ey + 2.5); ctx.stroke(); });
    } else {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx - 5.5, ey, 3.6, 0, 6.3); ctx.arc(cx + 5.5, ey, 3.6, 0, 6.3); ctx.fill();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(cx - 5.5 + ed, ey + 0.6, 1.7, 0, 6.3); ctx.arc(cx + 5.5 + ed, ey + 0.6, 1.7, 0, 6.3); ctx.fill();
      I.line(cx - 9, ey - 5.5, cx - 2.5, ey - 4, 40, 0.3, 1.3, PAPER); I.line(cx + 9, ey - 5.5, cx + 2.5, ey - 4, 41, 0.3, 1.3, PAPER);
    }
    ctx.restore();
  };

  /* ---------- efek: lingkar debu, sinar, bintang, tetes tinta, sobekan kertas, teks bunyi ---------- */
  var parts = [], texts = [], splats = [];
  function emit(o) { parts.push(o); }
  I.rings = function (x, y, n) { for (var i = 0; i < n; i++) emit({ kind: 'ring', x: x + rf(-4, 4), y: y + rf(-2, 2), r: rf(2, 4), grow: rf(18, 30), life: 0, max: rf(0.35, 0.6) }); };
  I.rays = function (x, y, n, col, len, spd) {
    var off = Math.random() * 6;
    for (var i = 0; i < n; i++) emit({ kind: 'ray', x: x, y: y, ang: off + (i / n) * 6.2832 + rf(-0.1, 0.1), d: 4, len: len || 9, sp: spd || 70, col: col || ORG, life: 0, max: rf(0.35, 0.55) });
  };
  I.sparkles = function (x, y, n, spread) {
    if (I.REDUCE) n = Math.ceil(n / 3);
    for (var i = 0; i < n; i++) emit({ kind: 'star', x: x + rf(-spread, spread), y: y + rf(-spread, spread * 0.6), vx: rf(-30, 30), vy: rf(-70, -20), r: rf(2.5, 5), rot: rf(0, 1), col: Math.random() < 0.6 ? ORG : INK, life: 0, max: rf(0.6, 1.1), g: 40 });
  };
  I.drops = function (x, y, n, spd, g) {
    if (I.REDUCE) n = Math.ceil(n / 3);
    for (var i = 0; i < n; i++) { var a = rf(-3.2, 0.1), s = rf(0.3, 1) * (spd || 120); emit({ kind: 'drop', x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rf(1, 2.8), life: 0, max: rf(0.6, 1), g: g || 420 }); }
  };
  I.scraps = function (x, y, n) {
    if (I.REDUCE) n = Math.ceil(n / 3);
    for (var i = 0; i < n; i++) { var a = rf(0, 6.28), s = rf(0.3, 1) * 190; emit({ kind: 'scrap', x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 110, rot: rf(0, 6), vr: rf(-9, 9), col: pick([ORG, ORG, INK, '#e7b8a4']), life: 0, max: rf(0.9, 1.5), g: 330 }); }
  };
  I.coinFx = function (x, y) {
    emit({ kind: 'star', x: x, y: y, vx: 0, vy: -26, r: 6, rot: 0.4, col: ORG, life: 0, max: 0.55, g: 0 });
    I.rays(x, y, 6, ORG, 6, 50);
  };
  I.say = function (x, y, txt, col, size, rot) { texts.push({ x: x, y: y, txt: txt, col: col || ORG, size: size || 20, rot: rot === undefined ? rf(-0.2, 0.15) : rot, t: 0, kind: 'sfx' }); };
  I.small = function (x, y, txt) { texts.push({ x: x, y: y, txt: txt, col: INK, size: 9, rot: 0, t: 0, kind: 'score' }); };
  I.splat = function (x, y, big) {
    var radii = []; for (var i = 0; i < 12; i++) radii.push(rf(0.6, 1.25));
    var dr = []; for (var j = 0; j < 6; j++) dr.push({ dx: rf(-1, 1), dy: rf(-0.5, 0.2), r: rf(1, 2.6) });
    splats.push({ x: x, y: y, r: big, radii: radii, dr: dr, a: 0.9, born: I.time });
  };
  /* gumpalan tinta bundar (untuk jawaban salah di kartu) */
  I.blot = function (cx, cy, r, u) {
    ctx.save(); ctx.fillStyle = INK; ctx.globalAlpha = 0.9; var pts = [];
    for (var i = 0; i <= 10; i++) { var an = i / 10 * 6.2832, rr = r * (0.8 + hsh(i + u) * 0.45); pts.push([cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * 0.8]); }
    trace(pts); ctx.fill(); ctx.restore();
  };
  I.drawSplats = function () {
    splats.forEach(function (s) {
      var age = I.time - s.born, a = s.a * Math.min(1, (6 - age) * 0.8);
      ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.fillStyle = INK;
      var grow = Math.min(1, age * 7), pts = [];
      for (var i = 0; i <= 12; i++) { var an = i / 12 * 6.2832; var rr = s.r * s.radii[i % 12] * (0.4 + 0.6 * grow); pts.push([s.x + Math.cos(an) * rr * 1.5, s.y + Math.sin(an) * rr * 0.35]); }
      trace(pts); ctx.fill();
      s.dr.forEach(function (d) { ctx.beginPath(); ctx.ellipse(s.x + d.dx * s.r * 2.2 * grow, s.y + d.dy * s.r * 0.5, d.r, d.r * 0.55, 0, 0, 6.3); ctx.fill(); });
      ctx.restore();
    });
  };
  I.shake = 0; I.flash = 0; I.hitstop = 0;
  I.doShake = function (v) { I.shake = I.REDUCE ? 0 : Math.max(I.shake, v); };
  function fxUpdate(dt) {
    for (var k = parts.length - 1; k >= 0; k--) {
      var q = parts[k];
      q.life += dt;
      if (q.kind === 'ring') q.r += q.grow * dt;
      else if (q.kind === 'ray') q.d += q.sp * dt;
      else { q.vy += (q.g || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.vr) q.rot += q.vr * dt; }
      if (q.life > q.max) parts.splice(k, 1);
    }
    for (var m = texts.length - 1; m >= 0; m--) { texts[m].t += dt; if (texts[m].t > 1.2) texts.splice(m, 1); }
    for (var s = splats.length - 1; s >= 0; s--) if (I.time - splats[s].born > 6) splats.splice(s, 1);
    if (I.shake > 0) I.shake = Math.max(0, I.shake - 22 * dt);
    if (I.flash > 0) I.flash -= dt * 1.8;
  }
  function fxDraw() {
    parts.forEach(function (q) {
      var k = 1 - q.life / q.max;
      ctx.globalAlpha = Math.max(0, Math.min(1, k * 1.5));
      if (q.kind === 'ring') { ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.3); stroke(1.2, INK); }
      else if (q.kind === 'ray') { var d0 = q.d, d1 = q.d + q.len * k; ctx.beginPath(); ctx.moveTo(q.x + Math.cos(q.ang) * d0, q.y + Math.sin(q.ang) * d0); ctx.lineTo(q.x + Math.cos(q.ang) * d1, q.y + Math.sin(q.ang) * d1); stroke(1.8, q.col); }
      else if (q.kind === 'star') I.star4(q.x, q.y, q.r * (0.6 + 0.4 * Math.sin(q.life * 14)), q.rot + q.life, q.col, 1.4);
      else if (q.kind === 'drop') { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (0.5 + 0.5 * k), 0, 6.3); ctx.fill(); }
      else if (q.kind === 'scrap') { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillStyle = q.col; ctx.fillRect(-3, -2, 6, 4); ctx.strokeStyle = INK; ctx.lineWidth = 0.7; ctx.strokeRect(-3, -2, 6, 4); ctx.restore(); }
      ctx.globalAlpha = 1;
    });
    texts.forEach(function (t) {
      var pop = Math.min(1, t.t * 7), sc = t.kind === 'sfx' ? (0.6 + 0.4 * pop + Math.sin(Math.min(1, t.t * 5) * Math.PI) * 0.25) : 1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, (1.2 - t.t) * 2));
      ctx.translate(t.x, t.y - t.t * (t.kind === 'sfx' ? 14 : 22)); ctx.rotate(t.rot); ctx.scale(sc, sc);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = t.col;
      ctx.font = t.kind === 'sfx' ? 'italic 700 ' + t.size + 'px Caveat, "Segoe Print", cursive' : '500 ' + t.size + 'px "IBM Plex Mono", monospace';
      ctx.fillText(t.txt, 0, 0);
      ctx.restore();
    });
  }
  function fxClear() { parts = []; texts = []; splats = []; I.shake = 0; I.flash = 0; }

  /* ---------- soal matematika (dipakai beberapa game) ---------- */
  I.mathQ = function (diff, n) {
    n = n || 3;
    var a, b, c, text, ans;
    if (diff === 'mudah') {
      a = ri(2, 12); b = ri(2, 12);
      if (Math.random() < 0.5) { text = a + ' + ' + b; ans = a + b; }
      else { if (b > a) { var t = a; a = b; b = t; } text = a + ' − ' + b; ans = a - b; }
    } else if (diff === 'sedang') {
      if (Math.random() < 0.6) { a = ri(2, 9); b = ri(2, 9); text = a + ' × ' + b; ans = a * b; }
      else if (Math.random() < 0.5) { a = ri(12, 35); b = ri(8, 25); text = a + ' + ' + b; ans = a + b; }
      else { a = ri(30, 60); b = ri(8, 28); text = a + ' − ' + b; ans = a - b; }
    } else {
      var k = ri(0, 2);
      if (k === 0) { a = ri(4, 12); b = ri(4, 12); text = a + ' × ' + b; ans = a * b; }
      else if (k === 1) { ans = ri(3, 12); b = ri(3, 12); a = ans * b; text = a + ' ÷ ' + b; }
      else { a = ri(2, 9); b = ri(2, 9); c = ri(3, 20); text = a + ' × ' + b + ' + ' + c; ans = a * b + c; }
    }
    var set = {}; set[ans] = true;
    var cand = I.shuffle([ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans + 3, ans - 3, ans + 5]);
    var opts = [ans];
    for (var i = 0; i < cand.length && opts.length < n; i++) if (cand[i] >= 0 && !set[cand[i]]) { set[cand[i]] = true; opts.push(cand[i]); }
    var m = ans + 4;
    while (opts.length < n) { if (!set[m]) { set[m] = true; opts.push(m); } m++; }
    return { text: text + ' = ?', ans: ans, options: I.shuffle(opts), say: String(ans) };
  };

  /* ---------- kerangka game ---------- */
  var cfg = null, cv, SC = 2, $ = function (id) { return document.getElementById(id); };
  var S = I.S = { q: 0, hearts: 3, score: 0, streak: 0, best: 0, ok: 0, diff: 'mudah', total: 10 };
  I.state = 'menu';
  var between = 0, afterBetween = null;
  I.key = {}; var hits = {};
  I.take = function (k) { if (hits[k]) { hits[k] = false; return true; } return false; };
  I.press = function (k) { hits[k] = true; };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function build() {
    var pad = cfg.pad || [];
    var cols = pad.map(function (b) { return b.main || b.wide ? '1fr' : 'auto'; }).join(' ');
    var html =
      '<main>' +
      '<section id="menu" class="card" aria-labelledby="ttl">' +
      '<div class="brand"><canvas id="heroPrev" width="300" height="200" aria-hidden="true"></canvas><div>' +
      '<span class="tag">' + esc(cfg.tag) + '</span><h1 id="ttl">' + esc(cfg.title) + '</h1><p>' + esc(cfg.desc) + '</p></div></div>' +
      '<div class="levels" role="group" aria-label="Pilih tingkat">' +
      cfg.levels.map(function (l) { return '<button type="button" class="lv" data-d="' + l.d + '"><b>' + esc(l.b) + '</b><small>' + esc(l.s) + '</small><span class="best" data-best="' + l.d + '"></span></button>'; }).join('') +
      '</div><p class="note">' + esc(cfg.note) + '</p>' +
      '</section>' +
      '<section id="game" hidden aria-label="Permainan"><div class="card">' +
      '<div class="hud" aria-live="off"><span id="hQ"></span><span class="hearts" id="hH"></span><span id="hS"></span><span id="hC"></span></div>' +
      '<div id="question" role="status" aria-live="polite"></div>' +
      '<p class="tip note" id="tip">' + esc(cfg.tip) + '</p>' +
      '<div class="stage"><canvas id="cv" width="960" height="540" role="img" aria-label="' + esc(cfg.aria || 'Arena permainan bergaya sketsa tinta') + '"></canvas></div>' +
      (pad.length ? '<div class="pad" style="grid-template-columns:' + cols + '">' + pad.map(function (b) { return '<button type="button" data-k="' + b.k + '"' + (b.main ? ' class="main"' : '') + ' aria-label="' + esc(b.aria || b.label) + '">' + b.label + '</button>'; }).join('') + '</div>' : '') +
      '<div class="tools"><span class="muted">' + cfg.keyHelp + '</span><span><button type="button" id="bSnd">Suara: hidup</button> <button type="button" id="bQuit">Keluar</button></span></div>' +
      '</div></section>' +
      '<section id="end" class="card" hidden aria-labelledby="eh">' +
      '<span class="tag" id="eTag">Selesai</span><h2 id="eh">Selesai</h2><div class="stars" id="eStars"></div><p id="eMsg"></p>' +
      '<div class="stats"><div><b id="eScore">0</b><span>Skor</span></div><div><b id="eOk">0</b><span>Jawaban benar</span></div><div><b id="eStreak">0</b><span>Beruntun terbaik</span></div></div>' +
      '<p class="muted" id="eBest"></p><div class="row"><button type="button" class="primary" id="bAgain">Main lagi</button><button type="button" id="bMenu">Ganti tingkat</button></div>' +
      '</section></main>';
    document.body.insertAdjacentHTML('afterbegin', html);
    if (I.preview) document.body.classList.add('preview');
  }

  function hud() {
    $('hQ').textContent = (cfg.unit || 'Soal') + ' ' + Math.min(S.q + 1, S.total) + '/' + S.total;
    var h = '';
    for (var i = 0; i < 3; i++) h += '<span class="' + (i < S.hearts ? 'on' : 'off') + '">♥</span>';
    $('hH').innerHTML = h; $('hH').setAttribute('aria-label', 'Nyawa ' + S.hearts + ' dari 3');
    $('hS').textContent = 'Skor ' + S.score;
    $('hC').textContent = 'Beruntun ' + S.streak;
  }
  I.hud = hud;
  I.setQ = function (html, noPop) {
    var q = $('question'); q.innerHTML = html;
    if (!noPop) { q.classList.remove('pop'); void q.offsetWidth; q.classList.add('pop'); }
  };
  I.setTip = function (t) { $('tip').textContent = t; };
  function show(id) { ['menu', 'game', 'end'].forEach(function (s) { $(s).hidden = s !== id; }); }

  function start(d) {
    S.diff = d; audioInit();
    S.q = 0; S.hearts = 3; S.score = 0; S.streak = 0; S.best = 0; S.ok = 0; S.total = cfg.total || 10;
    fxClear(); between = 0; afterBetween = null; I.time = 0; clearInput();
    I.state = 'play';
    show('game'); fit();
    cfg.start(d);
    cfg.stage();
    hud();
    if (!I.preview) { var st = document.querySelector('.stage'); try { st.scrollIntoView({ block: 'nearest' }); } catch (e) { /* abaikan */ } }
  }
  I.wait = function (sec, fn) { I.state = 'between'; between = sec; afterBetween = fn; };
  I.next = function () { S.q++; if (S.q >= S.total) end(true); else { I.state = 'play'; cfg.stage(); hud(); } };
  /* jawaban benar: skor + efek besar, lalu soal berikutnya */
  I.good = function (x, y, o) {
    o = o || {};
    var gain = (o.base || 10) + Math.min(S.streak, 5) * 2;
    S.streak++; if (S.streak > S.best) S.best = S.streak;
    S.ok++; S.score += gain;
    I.rays(x, y, 14, ORG, 12, 110); I.rays(x, y, 10, INK, 7, 70);
    I.sparkles(x, y - 6, 14, 26); I.scraps(x, y, 22);
    I.say(x + 6, y - 28, o.word || 'TING!', ORG, 26, -0.14);
    I.small(x, y - 50, '+' + gain);
    if (S.streak >= 3) I.say(I.W / 2, 60, 'beruntun x' + S.streak, INK, 22, 0.04);
    I.doShake(2.5); I.sfx('correct');
    hud();
    if (!o.noWait) I.wait(o.wait || 1.5, I.next);
    return gain;
  };
  /* jawaban salah: nyawa berkurang. Mengembalikan true kalau masih hidup. */
  I.bad = function (x, y, o) {
    o = o || {};
    S.hearts--; S.streak = 0;
    I.flash = 0.5; I.doShake(6); I.sfx(o.sound || 'wrong');
    I.say(x + 4, y - 24, o.word || 'SPLAT!', INK, 22, 0.1);
    I.drops(x, y, 14, 150, 360);
    hud();
    if (S.hearts <= 0) { I.wait(1.6, function () { end(false); }); return false; }
    return true;
  };
  I.addScore = function (n, x, y) { S.score += n; if (x !== undefined) I.small(x, y - 10, '+' + n); hud(); };
  I.restart = function () { start(S.diff); };

  function end(done) {
    I.state = 'over';
    if (I.preview) { setTimeout(function () { start(S.diff); }, 900); return; }
    var key = 'ink-' + cfg.id + '-best-' + S.diff, prev = parseInt(I.store(key) || '0', 10) || 0, rec = S.score > prev;
    if (rec) I.store(key, String(S.score));
    var acc = S.ok / S.total, stars = done ? (acc >= 0.9 ? 3 : acc >= 0.6 ? 2 : 1) : (S.ok >= S.total * 0.6 ? 2 : S.ok >= S.total * 0.3 ? 1 : 0);
    var sh = ''; for (var i = 0; i < 3; i++) sh += '<span class="' + (i < stars ? '' : 'off') + '">★</span>';
    $('eStars').innerHTML = sh; $('eStars').setAttribute('aria-label', stars + ' dari 3 bintang');
    $('eTag').textContent = 'Tingkat ' + S.diff;
    $('eh').textContent = done ? (cfg.winTitle || 'Level selesai') : 'Nyawa habis';
    $('eMsg').textContent = done
      ? (acc >= 0.9 ? 'Hebat sekali! Hampir semua jawabanmu benar.' : acc >= 0.6 ? 'Bagus! Sedikit lagi sempurna.' : 'Selesai! Coba lagi untuk skor yang lebih tinggi.')
      : 'Tidak apa-apa. ' + (cfg.answer ? 'Jawaban yang benar tadi: ' + cfg.answer() + '. ' : '') + 'Coba lagi!';
    $('eScore').textContent = S.score; $('eOk').textContent = S.ok + '/' + S.total; $('eStreak').textContent = S.best;
    $('eBest').textContent = rec ? 'Rekor baru untuk tingkat ' + S.diff + '!' : 'Rekor tingkat ' + S.diff + ': ' + prev;
    I.sfx(done ? 'win' : 'over');
    show('end'); refreshBest();
  }
  function refreshBest() {
    document.querySelectorAll('[data-best]').forEach(function (el) { var v = I.store('ink-' + cfg.id + '-best-' + el.getAttribute('data-best')); el.textContent = v ? 'rekor ' + v : ''; });
  }

  function fit() {
    var w = cv.clientWidth; if (!w) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1), pw = Math.round(w * dpr);
    if (cv.width !== pw) { cv.width = pw; cv.height = Math.round(pw * 9 / 16); }
    SC = cv.width / I.W;
  }
  I.useCtx = function (c) { var old = ctx; ctx = c; return old; };
  I.ctx = function () { return ctx; };

  function step(dt) {
    I.time += dt;
    if (I.state === 'play' || I.state === 'between') {
      if (I.demo && cfg.demo && I.state === 'play') cfg.demo(dt);
      cfg.update(dt);
    }
    fxUpdate(dt);
    if (I.state === 'between') { between -= dt; if (between <= 0) { var fn = afterBetween; afterBetween = null; if (fn) fn(); } }
  }
  function render() {
    seed = I.REDUCE ? 0 : Math.floor(I.time * 7);
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    ctx.save();
    if (I.shake > 0) ctx.translate((Math.random() - 0.5) * I.shake, (Math.random() - 0.5) * I.shake);
    cfg.draw();
    fxDraw();
    if (!I.preview) {
      ctx.globalAlpha = 0.75;
      I.text((cfg.unit || 'Soal').toUpperCase() + ' ' + Math.min(S.q + 1, S.total) + '-' + S.total + ' · ' + S.diff.toUpperCase(), 9, 8, { font: 'mono', size: 6.5, align: 'left', base: 'top' });
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (I.flash > 0) { ctx.globalAlpha = Math.min(0.22, I.flash * 0.4); ctx.fillStyle = INK; ctx.fillRect(0, 0, I.W, I.H); ctx.globalAlpha = 1; }
  }
  var hp, hctx, menuT = 0;
  function drawMini() {
    var saved = ctx; ctx = hctx;
    seed = I.REDUCE ? 0 : Math.floor(menuT * 7);
    hctx.setTransform(2, 0, 0, 2, 0, 0);
    hctx.clearRect(0, 0, 150, 100);
    hctx.fillStyle = PAPER2; hctx.fillRect(0, 0, 150, 100);
    if (cfg.mini) cfg.mini(menuT);
    else {
      var jump = Math.max(0, Math.sin(menuT * 3)) * 22, gy = 86;
      I.line(4, gy, 146, gy, 5, 0.8, 1.6, INK);
      I.cloud(96, 24, 0.7, 3);
      I.bulat(75, gy - jump, { r: 14, run: jump < 1, air: jump > 1, t: menuT, sq: jump < 1 ? 0.06 : -0.08 });
    }
    ctx = saved;
  }

  var last = 0, accT = 0, STEP = 1 / 120;
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (I.state === 'menu') { menuT += dt; drawMini(); }
    else if (!$('game').hidden) {
      fit();
      if (I.hitstop > 0) I.hitstop -= dt;
      else { accT += dt; while (accT >= STEP) { step(STEP); accT -= STEP; } }
      render();
    }
    requestAnimationFrame(frame);
  }

  var KEYS = { ArrowLeft: 'L', KeyA: 'L', ArrowRight: 'R', KeyD: 'R', ArrowUp: 'U', KeyW: 'U', ArrowDown: 'D', KeyS: 'D', Space: 'A', Enter: 'A', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4' };
  function clearInput() { I.key = {}; hits = {}; document.querySelectorAll('.pad button').forEach(function (b) { b.classList.remove('on'); }); }
  function inGame() { return !$('game').hidden; }

  I.game = function (G) {
    cfg = G;
    build();
    cv = $('cv'); ctx = cv.getContext('2d');
    hp = $('heroPrev'); hctx = hp.getContext('2d');
    var keys = Object.assign({}, KEYS, G.keys || {});
    window.addEventListener('keydown', function (e) {
      var k = keys[e.code]; if (!k || !inGame()) return;
      e.preventDefault();
      if (!I.key[k]) hits[k] = true;
      I.key[k] = true;
    });
    window.addEventListener('keyup', function (e) { var k = keys[e.code]; if (k) I.key[k] = false; });
    window.addEventListener('blur', clearInput);
    document.addEventListener('visibilitychange', clearInput);
    document.querySelectorAll('.pad button').forEach(function (el) {
      var k = el.getAttribute('data-k');
      el.addEventListener('pointerdown', function (e) { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ } el.classList.add('on'); hits[k] = true; I.key[k] = true; });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { el.addEventListener(ev, function () { el.classList.remove('on'); I.key[k] = false; }); });
      el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    });
    function lp(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * I.W / r.width, (e.clientY - r.top) * I.H / r.height]; }
    var down = false;
    cv.addEventListener('pointerdown', function (e) { if (!G.pointer || I.preview) return; e.preventDefault(); down = true; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ } var p = lp(e); G.pointer('down', p[0], p[1]); });
    cv.addEventListener('pointermove', function (e) { if (!G.pointer || !down) return; var p = lp(e); G.pointer('move', p[0], p[1]); });
    ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function (e) { if (!G.pointer || !down) return; down = false; var p = lp(e); G.pointer('up', p[0], p[1]); }); });
    document.querySelectorAll('.lv').forEach(function (b) { b.addEventListener('click', function () { start(b.getAttribute('data-d')); }); });
    $('bAgain').addEventListener('click', function () { start(S.diff); });
    $('bMenu').addEventListener('click', function () { I.state = 'menu'; clearInput(); show('menu'); refreshBest(); });
    $('bQuit').addEventListener('click', function () { this.blur(); I.state = 'menu'; clearInput(); show('menu'); refreshBest(); });
    $('bSnd').addEventListener('click', function () { this.blur(); I.muted = !I.muted; this.textContent = 'Suara: ' + (I.muted ? 'mati' : 'hidup'); if (!I.muted) { audioInit(); I.sfx('coin'); } });
    window.addEventListener('resize', fit);
    try { if (document.fonts && document.fonts.load) { document.fonts.load('700 16px "Source Serif 4"'); document.fonts.load('italic 700 22px Caveat'); document.fonts.load('500 8px "IBM Plex Mono"'); } } catch (e) { /* abaikan */ }
    refreshBest();
    if (I.demo) start(QS.get('lv') || G.levels[0].d);
    requestAnimationFrame(function (t) { last = t; frame(t); });
    window.__G = function () { return { S: S, state: I.state }; };
  };
})();
