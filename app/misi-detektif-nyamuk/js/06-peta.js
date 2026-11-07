/* Misi Detektif Nyamuk: peta Taman Seri Bersih. Clawd berjalan (ketik / anak panah / WASD), tangkap nyamuk,
   bersihkan takungan yang ditinggalkan Si Comot, dan masuk ke stesen siasatan. */
'use strict';

var DUNIA = { w: 1600, h: 1200 };
var PAYA = { x: 780, y: 520, r: 120 };
var P = { x: 760, y: 1090, tx: null, ty: null, face: 1, run: false, laju: 240 };
var KAM = { x: 0, y: 0 };
var NYAMUK = [], TAKUNG = [], FX = [];
var COMOT = { x: 1000, y: 700, tx: 1000, ty: 700, jatuhT: 12, larikanT: 0, cakap: '', cakapT: 0 };
var KEKUNCI = {}, faktaT = 18, faktaI = 0, dengungT = 0;
var cv, cw = 0, ch = 0, dprP = 1;
var POKOK = [];
(function () { for (var i = 0; i < 46; i++) { var x = 60 + hsh(i * 3.3) * 1480, y = 60 + hsh(i * 7.7) * 1080, ok = true; STESEN.forEach(function (s) { if (Math.hypot(x - s.x, y - s.y) < 170) ok = false; }); if (Math.hypot(x - PAYA.x, y - PAYA.y) < 200 || Math.abs(y - 1090) < 50 || Math.abs(x - 780) < 40) ok = false; if (ok) POKOK.push([x, y, 0.8 + hsh(i) * 0.6]); } })();

function pintu(s) { return { x: s.x, y: s.y + 70 }; }
function stesenBuka(i) { return i === 0 ? G.prolog : G.selesai.indexOf(STESEN[i - 1].id) >= 0; }
function stesenSeterusnya() { for (var i = 0; i < STESEN.length; i++) if (G.selesai.indexOf(STESEN[i].id) < 0) return i; return -1; }
function payaBuka() { return G.selesai.length >= STESEN.length; }

function petaInit() {
  cv = document.getElementById('peta');
  for (var i = 0; i < 5; i++) tambahNyamuk(P.x + (hsh(i) - 0.5) * 500, P.y - 120 - hsh(i + 2) * 260);
  cv.addEventListener('pointerdown', ketikPeta);
  addEventListener('keydown', function (e) { if (G.keadaan !== 'peta') return; KEKUNCI[e.key.toLowerCase()] = 1; if (e.key === 'Enter' || e.key === ' ') { var b = document.getElementById('btn-masuk'); if (!b.hidden) { b.click(); e.preventDefault(); } } });
  addEventListener('keyup', function (e) { KEKUNCI[e.key.toLowerCase()] = 0; });
  addEventListener('resize', ukurPeta); ukurPeta();
}
function ukurPeta() { if (!cv) return; dprP = Math.min(2, devicePixelRatio || 1); cw = cv.clientWidth; ch = cv.clientHeight; cv.width = Math.round(cw * dprP); cv.height = Math.round(ch * dprP); }
function keDunia(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left + KAM.x, y: e.clientY - r.top + KAM.y }; }

function ketikPeta(e) {
  if (G.keadaan !== 'peta') return; audioInit();
  var p = keDunia(e);
  for (var i = 0; i < NYAMUK.length; i++) { var n = NYAMUK[i]; if (Math.hypot(n.x - p.x, n.y - p.y) < 34) { tangkapNyamuk(i); return; } }
  if (Math.hypot(COMOT.x - p.x, COMOT.y - p.y) < 34) { usikComot(); return; }
  for (var j = 0; j < STESEN.length; j++) { var s = STESEN[j]; if (Math.abs(p.x - s.x) < 90 && p.y > s.y - 90 && p.y < s.y + 80) { var d = pintu(s); P.tx = d.x; P.ty = d.y; return; } }
  P.tx = Math.max(30, Math.min(DUNIA.w - 30, p.x)); P.ty = Math.max(40, Math.min(DUNIA.h - 20, p.y));
}

function tambahNyamuk(x, y, jenis) { NYAMUK.push({ x: x, y: y, hx: x, hy: y, j: jenis || (Math.random() < 0.7 ? 'aedes' : 'tiruk'), ph: Math.random() * 9, sp: 0.8 + Math.random() * 0.8 }); }
function tangkapNyamuk(i) {
  var n = NYAMUK.splice(i, 1)[0]; G.tangkap++; sfx('tangkap'); FX.push({ x: n.x, y: n.y, t: 0, jenis: 'tangkap' });
  if (!G.prolog) {
    var baki = 3 - G.tangkap;
    if (baki > 0) toast('Tangkap! Lagi ' + baki + ' ekor.', 'ok');
    else { G.prolog = true; simpan(); sfx('bukti'); toast('Bagus, Detektif! Kini pergi ke Rumah Mira. Ikut anak panah emas.', 'ok', 5000); kemasHud(); }
  } else toast(n.j === 'aedes' ? 'Aedes ditangkap. Kakinya berbelang putih.' : 'Nyamuk tiruk ditangkap. Ia suka menggigit waktu malam.', 'ok');
  kemasHud(); simpan();
}
function usikComot() { COMOT.larikanT = 2.5; COMOT.cakap = ['Alamak, detektif!', 'Saya cuma letak baldi...', 'Air bertakung? Mana ada!'][Math.floor(Math.random() * 3)]; COMOT.cakapT = 2.5; sfx('wrong'); }

function petaKemas(dt) {
  /* gerak pemain */
  var vx = (KEKUNCI.arrowright || KEKUNCI.d ? 1 : 0) - (KEKUNCI.arrowleft || KEKUNCI.a ? 1 : 0), vy = (KEKUNCI.arrowdown || KEKUNCI.s ? 1 : 0) - (KEKUNCI.arrowup || KEKUNCI.w ? 1 : 0);
  if (vx || vy) { P.tx = null; var l = Math.hypot(vx, vy); P.x += vx / l * P.laju * dt; P.y += vy / l * P.laju * dt; P.run = true; if (vx) P.face = vx; }
  else if (P.tx !== null) { var dx = P.tx - P.x, dy = P.ty - P.y, d = Math.hypot(dx, dy); if (d < 4) { P.tx = null; P.run = false; } else { var st = Math.min(d, P.laju * dt); P.x += dx / d * st; P.y += dy / d * st; P.run = true; if (Math.abs(dx) > 2) P.face = dx > 0 ? 1 : -1; } }
  else P.run = false;
  P.x = Math.max(30, Math.min(DUNIA.w - 30, P.x)); P.y = Math.max(40, Math.min(DUNIA.h - 20, P.y));
  if (P.run) sfx('langkah', 260);
  KAM.x = Math.max(0, Math.min(DUNIA.w - cw, P.x - cw / 2)); KAM.y = Math.max(0, Math.min(DUNIA.h - ch, P.y - ch * 0.55));
  if (cw > DUNIA.w) KAM.x = (DUNIA.w - cw) / 2; if (ch > DUNIA.h) KAM.y = (DUNIA.h - ch) / 2;

  /* nyamuk: berlegar dekat takungan / rumah, kadang mendekati Clawd */
  var sasaran = 4 + TAKUNG.filter(function (k) { return !k.bersih; }).length * 2;
  if (NYAMUK.length < Math.min(14, sasaran) && Math.random() < dt * 0.4) { var src = TAKUNG.filter(function (k) { return !k.bersih; }); var o = src.length ? src[Math.floor(Math.random() * src.length)] : STESEN[Math.floor(Math.random() * STESEN.length)]; tambahNyamuk(o.x + (Math.random() - 0.5) * 80, o.y - 40); }
  NYAMUK.forEach(function (n) { n.ph += dt * n.sp; var dekat = Math.hypot(P.x - n.hx, P.y - n.hy) < 260; if (dekat) { n.hx += (P.x - n.hx) * dt * 0.25; n.hy += (P.y - 40 - n.hy) * dt * 0.25; } n.x = n.hx + Math.cos(n.ph * 1.9) * 36; n.y = n.hy + Math.sin(n.ph * 3.1) * 18; });
  for (var i = NYAMUK.length - 1; i >= 0; i--) if (Math.hypot(NYAMUK[i].x - P.x, NYAMUK[i].y - (P.y - 30)) < 26) tangkapNyamuk(i);
  dengungT -= dt; if (dengungT < 0 && NYAMUK.some(function (n) { return Math.hypot(n.x - P.x, n.y - P.y) < 160; })) { sfx('dengung'); dengungT = 2.2; }

  /* Si Comot: merayau dan tinggalkan takungan (selepas prolog) */
  var spC = COMOT.larikanT > 0 ? 200 : 60; COMOT.larikanT -= dt; COMOT.cakapT -= dt;
  if (COMOT.larikanT > 0) { var ax = COMOT.x - P.x, ay = COMOT.y - P.y, al = Math.hypot(ax, ay) || 1; COMOT.tx = COMOT.x + ax / al * 120; COMOT.ty = COMOT.y + ay / al * 120; }
  var cdx = COMOT.tx - COMOT.x, cdy = COMOT.ty - COMOT.y, cd = Math.hypot(cdx, cdy);
  if (cd < 6) { COMOT.tx = 120 + Math.random() * 1360; COMOT.ty = 120 + Math.random() * 960; } else { COMOT.x += cdx / cd * spC * dt; COMOT.y += cdy / cd * spC * dt; }
  COMOT.x = Math.max(30, Math.min(DUNIA.w - 30, COMOT.x)); COMOT.y = Math.max(40, Math.min(DUNIA.h - 20, COMOT.y));
  if (G.prolog && !payaBuka()) { COMOT.jatuhT -= dt; if (COMOT.jatuhT < 0 && TAKUNG.filter(function (k) { return !k.bersih; }).length < 6 && Math.hypot(COMOT.x - P.x, COMOT.y - P.y) > 200) { var jn = ['baldi', 'tin', 'tayar', 'pasu'][Math.floor(Math.random() * 4)]; TAKUNG.push({ x: COMOT.x, y: COMOT.y + 14, j: jn, bersih: false, t: 0 }); COMOT.jatuhT = 16 + Math.random() * 10; COMOT.cakap = 'Hehe, simpan air sikit...'; COMOT.cakapT = 2; } }
  if (Math.hypot(COMOT.x - P.x, COMOT.y - P.y) < 40 && COMOT.larikanT <= 0) usikComot();

  /* takungan */
  TAKUNG.forEach(function (k) {
    k.t += dt; if (k.bersih) return;
    if (Math.hypot(k.x - P.x, k.y - P.y) < 38) {
      if (G.selesai.indexOf('ronda') >= 0) { k.bersih = true; G.bersih++; sfx('bersih'); FX.push({ x: k.x, y: k.y - 20, t: 0, jenis: 'bersih' }); var nama = { baldi: 'Baldi diterbalikkan', tin: 'Tin dibuang ke tong bertutup', tayar: 'Air tayar dibuang', pasu: 'Piring pasu dibersihkan' }[k.j]; toast(nama + '. Tempat pembiakan musnah!', 'ok'); kemasHud(); simpan(); }
      else if (!k.amaran) { k.amaran = true; toast('Air bertakung! Belajar caranya di Laman Belakang dahulu.', 'info'); }
    }
  });
  TAKUNG = TAKUNG.filter(function (k) { return !k.bersih || k.t < 999; });

  /* fakta semasa meronda */
  if (G.prolog) { faktaT -= dt; if (faktaT < 0) { toast('Tahukah kamu? ' + FAKTA[faktaI++ % FAKTA.length], 'fakta', 5200); faktaT = 32; } }

  /* butang masuk stesen */
  var dekat = -1; STESEN.forEach(function (s, i) { var d = pintu(s); if (Math.hypot(d.x - P.x, d.y - P.y) < 80) dekat = i; });
  var dekatPaya = Math.hypot(PAYA.x - P.x, PAYA.y + PAYA.r - P.y) < 110 || Math.hypot(PAYA.x - P.x, PAYA.y - P.y) < PAYA.r + 30;
  var b = document.getElementById('btn-masuk'), lbl = '', aksi = null;
  if (dekat >= 0) { var s = STESEN[dekat]; if (!stesenBuka(dekat)) { lbl = 'Berkunci: selesaikan ' + (dekat ? STESEN[dekat - 1].nama : 'tangkap 3 nyamuk') + ' dahulu'; } else { lbl = (G.selesai.indexOf(s.id) >= 0 ? 'Ulang siasatan: ' : 'Siasat: ') + s.nama; aksi = dekat; } }
  else if (dekatPaya) { lbl = payaBuka() ? 'Serbu Sarang Raja Comot' : 'Sarang Raja Comot (perlu 6 bukti)'; aksi = payaBuka() ? 'paya' : null; }
  if (lbl) { b.hidden = false; b.querySelector('span').textContent = lbl; b.disabled = aksi === null; b.dataset.aksi = aksi === null ? '' : aksi; } else b.hidden = true;

  FX.forEach(function (f) { f.t += dt; }); FX = FX.filter(function (f) { return f.t < 1; });
}

function bangunan(s, i, t) {
  var x = s.x, y = s.y, buka = stesenBuka(i), siap = G.selesai.indexOf(s.id) >= 0;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(46,38,32,0.15)'; ctx.beginPath(); ctx.ellipse(0, 52, 92, 14, 0, 0, 6.3); ctx.fill();
  if (s.id === 'ronda') {
    ctx.fillStyle = '#b7cf9a'; ctx.fillRect(-90, -40, 180, 92); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(-90, -40, 180, 92);
    for (var f = -90; f <= 90; f += 15) { ctx.beginPath(); ctx.moveTo(f, -40); ctx.lineTo(f, -56); stroke(1.4, '#8a6a43'); } ctx.beginPath(); ctx.moveTo(-90, -50); ctx.lineTo(90, -50); stroke(1.4, '#8a6a43');
    var bs = siap; drawBekas('pasu', -50, 30, 1, { t: t, bersih: bs }); drawBekas('tayar', 40, 36, 1, { t: t, bersih: bs }); drawBekas('tempayan', 0, 20, 0.9, { t: t, bersih: bs });
  } else {
    var dinding = { kenal: '#f3e3c8', rantai: '#ffffff', simptom: '#e6f1ef', cerita: '#efe0d0', poster: '#f6efe2' }[s.id], atap = { kenal: CL, rantai: DENG, simptom: MAL, cerita: '#8a6a43', poster: NAVY }[s.id];
    wobRect(-72, -38, 144, 88, i + 2, 0.7); ctx.fillStyle = dinding; ctx.fill(); stroke(1.4, INK);
    ctx.beginPath(); ctx.moveTo(-86, -36); ctx.lineTo(0, -96); ctx.lineTo(86, -36); ctx.closePath(); ctx.fillStyle = atap; ctx.fill(); stroke(1.4, INK);
    ctx.save(); ctx.clip(); scratch(-86, -96, 172, 60, 30, '#fff', 0.25, -0.7, i); ctx.restore();
    ctx.fillStyle = '#6b4a2f'; ctx.fillRect(-14, 10, 28, 40); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(-14, 10, 28, 40);
    [-48, 34].forEach(function (wx) { ctx.fillStyle = '#cfe3ee'; ctx.fillRect(wx, -16, 16, 16); ctx.strokeRect(wx, -16, 16, 16); });
    if (s.id === 'rantai' || s.id === 'simptom') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -56, 13, 0, 6.3); ctx.fill(); ctx.stroke(); ctx.fillStyle = DENG; ctx.fillRect(-3, -64, 6, 16); ctx.fillRect(-8, -59, 16, 6); }
    if (s.id === 'poster') { ctx.beginPath(); ctx.moveTo(70, -36); ctx.lineTo(70, -110); stroke(1.4, INK); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(70, -110); ctx.lineTo(98, -100 + Math.sin(t * 4) * 3); ctx.lineTo(70, -90); ctx.fill(); ctx.stroke(); }
  }
  /* papan nama */
  ctx.font = '700 15px Nunito, system-ui, sans-serif'; var tw = ctx.measureText(s.nama).width + 24;
  wobRect(-tw / 2, 58, tw, 26, i, 0.5); ctx.fillStyle = siap ? '#e7f2df' : '#fffaf0'; ctx.fill(); stroke(1.2, INK);
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(s.nama, 0, 76);
  /* penanda */
  if (siap) { ctx.beginPath(); ctx.arc(66, -60, 15, 0, 6.3); ctx.fillStyle = '#8fc987'; ctx.fill(); stroke(1.3, INK); drawIcon('check', 66, -60, 18, INK, 2.4); }
  else if (!buka) { ctx.beginPath(); ctx.arc(66, -60, 15, 0, 6.3); ctx.fillStyle = '#d9d2c4'; ctx.fill(); stroke(1.3, INK); drawIcon('lock', 66, -60, 16, INK, 2); }
  else { var b = Math.sin(t * 4) * 5; ctx.beginPath(); ctx.arc(0, -126 + b, 17, 0, 6.3); ctx.fillStyle = GOLD; ctx.fill(); stroke(1.4, INK); drawIcon('search', 0, -126 + b, 20, INK, 2.2); }
  ctx.restore();
}

function lukisPaya(t) {
  ctx.save(); ctx.translate(PAYA.x, PAYA.y);
  ctx.beginPath(); for (var a = 0; a <= 6.3; a += 0.25) { var r = PAYA.r + Math.sin(a * 5) * 10; ctx.lineTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.8); } ctx.closePath();
  ctx.fillStyle = payaBuka() ? '#4f6b6a' : '#6f8a7f'; ctx.fill(); stroke(1.6, INK);
  ctx.save(); ctx.clip(); scratch(-160, -100, 320, 200, 60, '#fff', 0.15, 0.1, 9); ctx.restore();
  for (var i = 0; i < 14; i++) { var rx = Math.cos(i * 0.45) * PAYA.r * 1.25, ry = Math.sin(i * 0.45) * PAYA.r * 0.8; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + Math.sin(t + i) * 3, ry - 26); stroke(1.6, '#4c6b4a'); ctx.fillStyle = '#8a6a43'; ctx.fillRect(rx - 2 + Math.sin(t + i) * 3, ry - 30, 4, 9); }
  if (payaBuka()) { drawComot(0, -6 + Math.sin(t * 2) * 4, 30, { t: t, king: true }); }
  else { ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.ellipse(0, 0, PAYA.r * 1.35, PAYA.r * 0.92, 0, 0, 6.3); stroke(2, '#8a6a43'); ctx.setLineDash([]); }
  ctx.font = '700 15px Nunito, system-ui, sans-serif'; ctx.textAlign = 'center'; var nm = 'Paya Raja Comot', tw = ctx.measureText(nm).width + 24;
  wobRect(-tw / 2, PAYA.r * 0.8 + 12, tw, 26, 4, 0.5); ctx.fillStyle = '#fffaf0'; ctx.fill(); stroke(1.2, INK); ctx.fillStyle = INK; ctx.fillText(nm, 0, PAYA.r * 0.8 + 30);
  ctx.restore();
}

function petaLukis(t) {
  if (!cv || !cw) return;
  ctx = cv.getContext('2d'); ctx.setTransform(dprP, 0, 0, dprP, 0, 0); seed = 1;
  ctx.fillStyle = '#d9e3c4'; ctx.fillRect(0, 0, cw, ch);
  ctx.save(); ctx.translate(-Math.round(KAM.x), -Math.round(KAM.y));
  ctx.fillStyle = '#dfe8c9'; ctx.fillRect(0, 0, DUNIA.w, DUNIA.h);
  for (var gx = 0; gx < DUNIA.w; gx += 128) for (var gy = 0; gy < DUNIA.h; gy += 128) { ctx.globalAlpha = 0.6; ctx.drawImage(grain, gx, gy); } ctx.globalAlpha = 1;
  /* jalan */
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  var jalan = [[760, 1150, 760, 380], [230, 820, 1340, 700], [430, 360, 1120, 320], [1120, 320, 1340, 700], [760, 880, 1160, 1050], [430, 360, 230, 820]];
  jalan.forEach(function (j) { ctx.beginPath(); ctx.moveTo(j[0], j[1]); ctx.lineTo(j[2], j[3]); ctx.lineWidth = 46; ctx.strokeStyle = '#c9b48f'; ctx.stroke(); });
  jalan.forEach(function (j) { ctx.beginPath(); ctx.moveTo(j[0], j[1]); ctx.lineTo(j[2], j[3]); ctx.lineWidth = 36; ctx.strokeStyle = '#e8dcc0'; ctx.stroke(); ctx.setLineDash([10, 14]); ctx.lineWidth = 1.2; ctx.strokeStyle = '#b8a27a'; ctx.stroke(); ctx.setLineDash([]); });
  lukisPaya(t);
  /* susun ikut y supaya bertindih betul */
  var obj = [];
  POKOK.forEach(function (p) { obj.push({ y: p[1], f: function () { pokok(p[0], p[1], p[2], t); } }); });
  STESEN.forEach(function (s, i) { obj.push({ y: s.y + 40, f: function () { bangunan(s, i, t); } }); });
  TAKUNG.forEach(function (k) { if (!k.bersih) obj.push({ y: k.y, f: function () { drawBekas(k.j, k.x, k.y, 0.9, { t: t }); ctx.beginPath(); ctx.arc(k.x, k.y - 34 + Math.sin(t * 5) * 3, 8, 0, 6.3); ctx.fillStyle = AIR; ctx.fill(); stroke(1, INK); } }); });
  obj.push({ y: COMOT.y, f: function () { drawComot(COMOT.x, COMOT.y - 16, 15, { t: t, baldi: true, lx: (P.x > COMOT.x ? 1.5 : -1.5) }); if (COMOT.cakapT > 0) gelembung(COMOT.x, COMOT.y - 46, COMOT.cakap); } });
  obj.push({ y: P.y, f: function () { drawClawd(P.x, P.y, { s: 1.15, face: P.face * 0.6, t: t, run: P.run, blink: (t % 4) < 0.12 }); } });
  obj.sort(function (a, b) { return a.y - b.y; }).forEach(function (o) { o.f(); });
  NYAMUK.forEach(function (n) { drawNyamuk(n.x, n.y, 0.95, n.j, t + n.ph); });
  FX.forEach(function (f) { ctx.globalAlpha = 1 - f.t; if (f.jenis === 'tangkap') { for (var k = 0; k < 6; k++) star4(f.x + Math.cos(k) * f.t * 40, f.y + Math.sin(k) * f.t * 40, 5, k, GOLD, 2); } else { inkCircle(f.x, f.y, 10 + f.t * 40, 2, 1, 2, '#8fc987'); } ctx.globalAlpha = 1; });
  if (P.tx !== null) { ctx.beginPath(); ctx.ellipse(P.tx, P.ty, 14, 5, 0, 0, 6.3); stroke(1.6, GOLD); }
  ctx.restore();
  /* anak panah ke sasaran seterusnya */
  var nx = stesenSeterusnya(), sas = !G.prolog ? null : nx >= 0 ? pintu(STESEN[nx]) : { x: PAYA.x, y: PAYA.y + PAYA.r };
  if (sas) { var sx = sas.x - KAM.x, sy = sas.y - KAM.y; if (sx < 20 || sx > cw - 20 || sy < 70 || sy > ch - 90) { var a = Math.atan2(sy - ch / 2, sx - cw / 2), ex = cw / 2 + Math.cos(a) * (cw / 2 - 40), ey = ch / 2 + Math.sin(a) * (ch / 2 - 90); ctx.save(); ctx.translate(ex, ey); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-10, -13); ctx.lineTo(-4, 0); ctx.lineTo(-10, 13); ctx.closePath(); ctx.fillStyle = GOLD; ctx.fill(); stroke(1.6, INK); ctx.restore(); } }
}
function pokok(x, y, k, t) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = 'rgba(46,38,32,0.15)'; ctx.beginPath(); ctx.ellipse(0, 2, 22, 6, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = '#8a6a43'; ctx.fillRect(-4, -26, 8, 28); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(-4, -26, 8, 28); inkCircle(Math.sin(t * 0.8 + x) * 1.5, -44, 26, x, 2, 1.4, INK, '#7aa64c'); ctx.save(); ctx.beginPath(); ctx.arc(0, -44, 26, 0, 6.3); ctx.clip(); scratch(-26, -70, 52, 52, 20, '#4c6b4a', 0.5, -0.8, x); ctx.restore(); ctx.restore(); }
function gelembung(x, y, teks) { ctx.font = '700 13px Nunito, system-ui, sans-serif'; var w = ctx.measureText(teks).width + 20; ctx.fillStyle = '#fffaf0'; wobRect(x - w / 2, y - 24, w, 24, 7, 0.4); ctx.fill(); stroke(1.1, INK); ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(teks, x, y - 7); }

/* seni menu: Clawd detektif mengintai nyamuk */
SENI.menu = function (w, h, t) {
  ctx.fillStyle = '#dfe8c9'; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 0.6; ctx.drawImage(grain, 0, 0, w, h); ctx.globalAlpha = 1;
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(0, h * 0.72, w, h * 0.28); ctx.beginPath(); ctx.moveTo(0, h * 0.72); ctx.lineTo(w, h * 0.72); stroke(1.2, INK);
  pokok(w * 0.1, h * 0.74, 1.1, t); pokok(w * 0.92, h * 0.76, 1.3, t);
  drawBekas('tayar', w * 0.75, h * 0.86, 1.6, { t: t }); drawBekas('pasu', w * 0.6, h * 0.84, 1.3, { t: t });
  var k = Math.min(w / 300, h / 330);
  drawClawd(w * 0.33, h * 0.86, { s: 2.6 * k, face: 0.8, t: t, lens: true, mood: 'think', blink: (t % 3.5) < 0.12 });
  for (var i = 0; i < 3; i++) { var a = terbang(w * (0.55 + i * 0.12), h * (0.35 + (i % 2) * 0.12), 26, 14, t + i * 2, 1.2 + i * 0.2); drawNyamuk(a[0], a[1], 1.4 * k, i === 1 ? 'tiruk' : 'aedes', t); }
  drawComot(w * 0.9, h * 0.6 + Math.sin(t * 2) * 3, 16 * k, { t: t, baldi: true, lx: -1.5 });
};
