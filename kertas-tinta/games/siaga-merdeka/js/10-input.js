/* Siaga Merdeka: kamera, tetikus, sentuhan, dan papan ketik. */
'use strict';

var TOMBOL = {};
var KONFIRM = ['Siap!', 'Laksanakan!', 'Bergerak!', 'Merdeka!', 'Diterima!'];

function ukurKanvas() {
  var cv = $('#kanvas'), r = cv.parentNode.getBoundingClientRect();
  G.dpr = Math.min(2, window.devicePixelRatio || 1);
  G.view = { w: Math.max(100, r.width), h: Math.max(100, r.height) };
  cv.width = G.view.w * G.dpr; cv.height = G.view.h * G.dpr;
  cv.style.width = G.view.w + 'px'; cv.style.height = G.view.h + 'px';
  if (!G.zoomDiatur) G.zoom = G.view.w < 700 ? 0.8 : 1;
  jepitKamera();
}
function jepitKamera() {
  var vw = G.view.w / G.zoom, vh = G.view.h / G.zoom, m = 64;
  G.cam.x = Math.max(-m, Math.min(G.mw * TS - vw + m, G.cam.x));
  G.cam.y = Math.max(-m, Math.min(G.mh * TS - vh + m, G.cam.y));
}
function pusatkanKamera(x, y) { G.cam.x = x - G.view.w / G.zoom / 2; G.cam.y = y - G.view.h / G.zoom / 2; jepitKamera(); }
function keDunia(sx, sy) { return { x: G.cam.x + sx / G.zoom, y: G.cam.y + sy / G.zoom }; }
function aturZoom(z, sx, sy) {
  var w = keDunia(sx, sy); G.zoom = Math.max(0.55, Math.min(1.5, z)); G.zoomDiatur = true;
  G.cam.x = w.x - sx / G.zoom; G.cam.y = w.y - sy / G.zoom; jepitKamera();
}

/* entitas di bawah titik dunia: unit dulu, lalu bangunan */
function entitasDi(wx, wy) {
  var terbaik = null, dTerbaik = 1e9;
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i]; if (e.mati || e.k !== 'unit' || !terlihat(e)) continue;
    var d = Math.hypot(e.x - wx, e.y - wy); if (d < jariDari(e) + 7 && d < dTerbaik) { dTerbaik = d; terbaik = e; }
  }
  if (terbaik) return terbaik;
  for (var j = 0; j < G.ents.length; j++) {
    var b = G.ents[j]; if (b.mati || b.k !== 'bgn' || !terlihat(b)) continue;
    if (wx >= b.tx * TS && wx <= (b.tx + b.w) * TS && wy >= b.ty * TS - (b.h > 1 ? 16 : 6) && wy <= (b.ty + b.h) * TS) return b;
  }
  return null;
}

function unitKitaTerpilih() { return G.pilih.filter(function (e) { return e.s === 0 && e.k === 'unit' && !e.mati; }); }

function perintahPilihan(tx, ty, ent) {
  var us = unitKitaTerpilih(); if (!us.length) return false;
  if (ent && ent.s !== 0) {
    us.forEach(function (u) { if (u.senjata) perintahSerang(u, ent); else perintahGerak(u, Math.floor(ent.x / TS), Math.floor(ent.y / TS)); });
    G.tanda.push({ x: ent.x, y: ent.y, t: 0.6, serang: true });
  } else {
    perintahKelompok(us, tx, ty, G.modeSerbu ? 'serbu' : 'gerak');
    G.tanda.push({ x: (tx + 0.5) * TS, y: (ty + 0.5) * TS, t: 0.6, serang: G.modeSerbu });
  }
  G.modeSerbu = false; G.garisT = 1.2;
  bunyi('perintah');
  if (Math.random() < 0.35) lapor(pilihAcak(KONFIRM));
  return true;
}

function klikDunia(wx, wy, shift) {
  var tx = Math.floor(wx / TS), ty = Math.floor(wy / TS);
  if (!dalamPeta(tx, ty)) return;
  if (G.taruh) {
    var t = G.taruh; G.mouse.dunia = { x: wx, y: wy };
    var d = BANGUN[t.tipe], px = Math.floor(wx / TS - d.w / 2 + 0.5), py = Math.floor(wy / TS - d.h / 2 + 0.5);
    if (taruhBangunan(0, t.tipe, px, py)) { G.taruh = null; perbaruiHUD(true); } else { bunyi('salah'); pesan('Tidak bisa membangun di situ. Harus dekat bangunanmu, di tanah kosong yang sudah terlihat.', 'bahaya'); }
    return;
  }
  if (G.bidikMortir) { lepasMortir(wx, wy); return; }
  var ent = entitasDi(wx, wy), us = unitKitaTerpilih();
  if (G.modeSerbu && us.length) { perintahPilihan(tx, ty, ent && ent.s !== 0 ? ent : null); return; }
  if (ent && ent.s === 0) {
    if (shift) { var i = G.pilih.indexOf(ent); if (i >= 0) G.pilih.splice(i, 1); else G.pilih.push(ent); }
    else if (us.length && ent.k === 'bgn' && ent.tipe === 'gudang' && us.every(function (u) { return u.tipe === 'truk'; })) { us.forEach(function (u) { u.perintah = 'panen'; u.fase = 'pulang'; }); bunyi('perintah'); return; }
    else G.pilih = [ent];
    bunyi('pilih');
    if (ent.k === 'unit' && Math.random() < 0.3) lapor(pilihAcak(['Siap komandan', 'Melapor', 'Menunggu perintah']));
    return;
  }
  if (ent && ent.s !== 0) { if (us.length) perintahPilihan(tx, ty, ent); else { G.pilih = [ent]; bunyi('pilih'); } return; }
  if (us.length) { perintahPilihan(tx, ty, null); return; }
  if (G.pilih.length === 1 && G.pilih[0].s === 0 && (G.pilih[0].tipe === 'barak' || G.pilih[0].tipe === 'bengkel')) {
    G.pilih[0].titikKumpul = { x: tx, y: ty }; G.tanda.push({ x: (tx + 0.5) * TS, y: (ty + 0.5) * TS, t: 0.6 }); pesan('Titik kumpul diatur.', ''); bunyi('perintah'); return;
  }
  G.pilih = [];
}

function pilihKotak(x0, y0, x1, y1, tambah) {
  var a = keDunia(Math.min(x0, x1), Math.min(y0, y1)), b = keDunia(Math.max(x0, x1), Math.max(y0, y1));
  var dapat = G.ents.filter(function (e) { return e.s === 0 && e.k === 'unit' && !e.mati && e.x >= a.x && e.x <= b.x && e.y >= a.y && e.y <= b.y; });
  var tempur = dapat.filter(function (e) { return e.senjata; }); if (tempur.length) dapat = tempur;
  if (tambah) dapat.forEach(function (e) { if (G.pilih.indexOf(e) < 0) G.pilih.push(e); }); else G.pilih = dapat;
  if (dapat.length) { bunyi('pilih'); if (dapat.length > 2) lapor('Pasukan siap'); }
}
function pilihSejenisDiLayar(e) {
  G.pilih = G.ents.filter(function (o) { return o.s === 0 && !o.mati && o.tipe === e.tipe && terlihatLayar(o); }); bunyi('pilih');
}

function pasangInput() {
  var cv = $('#kanvas');
  cv.oncontextmenu = function (ev) { ev.preventDefault(); };
  cv.addEventListener('mousedown', function (ev) {
    if (!G || G.jeda) return; audioSiap();
    var r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    G.seret = { x0: x, y0: y, x1: x, y1: y, kotak: false, tombol: ev.button, geser: false, camX: G.cam.x, camY: G.cam.y };
  });
  window.addEventListener('mousemove', function (ev) {
    if (!G || !G.berjalan) return;
    var r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    G.mouse = { x: x, y: y, dalam: x >= 0 && y >= 0 && x <= r.width && y <= r.height, dunia: keDunia(x, y), sentuh: false };
    var s = G.seret;
    if (s) {
      s.x1 = x; s.y1 = y;
      var jauh = Math.hypot(x - s.x0, y - s.y0) > 6;
      if (s.tombol === 0 && jauh && !G.taruh && !G.bidikMortir) s.kotak = true;
      if ((s.tombol === 2 || s.tombol === 1) && jauh) { s.geser = true; G.cam.x = s.camX - (x - s.x0) / G.zoom; G.cam.y = s.camY - (y - s.y0) / G.zoom; jepitKamera(); }
    }
    G.sorot = G.mouse.dalam ? entitasDi(G.mouse.dunia.x, G.mouse.dunia.y) : null;
    var kursor = 'default';
    if (G.taruh || G.bidikMortir) kursor = 'crosshair';
    else if (G.sorot && G.sorot.s !== 0 && unitKitaTerpilih().length) kursor = 'crosshair';
    else if (G.sorot) kursor = 'pointer';
    else if (unitKitaTerpilih().length) kursor = 'cell';
    cv.style.cursor = kursor;
  });
  window.addEventListener('mouseup', function (ev) {
    if (!G || !G.seret) return;
    var s = G.seret; G.seret = null;
    if (G.jeda) return;
    if (s.tombol === 0) {
      if (s.kotak) pilihKotak(s.x0, s.y0, s.x1, s.y1, ev.shiftKey);
      else { var w = keDunia(s.x0, s.y0); klikDunia(w.x, w.y, ev.shiftKey); }
    } else if (s.tombol === 2 && !s.geser) {
      if (G.taruh || G.bidikMortir || G.modeSerbu) { G.taruh = null; G.bidikMortir = false; G.modeSerbu = false; perbaruiHUD(true); return; }
      var w2 = keDunia(s.x0, s.y0), ent = entitasDi(w2.x, w2.y);
      if (!perintahPilihan(Math.floor(w2.x / TS), Math.floor(w2.y / TS), ent && ent.s !== 0 ? ent : null)) G.pilih = [];
    }
  });
  cv.addEventListener('dblclick', function (ev) {
    var r = cv.getBoundingClientRect(), w = keDunia(ev.clientX - r.left, ev.clientY - r.top), e = entitasDi(w.x, w.y);
    if (e && e.s === 0 && e.k === 'unit') pilihSejenisDiLayar(e);
  });
  cv.addEventListener('wheel', function (ev) { ev.preventDefault(); var r = cv.getBoundingClientRect(); aturZoom(G.zoom * (ev.deltaY > 0 ? 0.9 : 1.1), ev.clientX - r.left, ev.clientY - r.top); }, { passive: false });

  /* sentuhan: satu jari geser = gulir peta, tahan lalu geser = kotak pilih, ketuk = klik, dua jari = zoom */
  var sen = null;
  cv.addEventListener('touchstart', function (ev) {
    ev.preventDefault(); audioSiap(); if (G.jeda) return;
    var r = cv.getBoundingClientRect();
    if (ev.touches.length === 2) {
      var a = ev.touches[0], b = ev.touches[1];
      sen = { dua: true, jarak: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), zoom: G.zoom, cx: (a.clientX + b.clientX) / 2 - r.left, cy: (a.clientY + b.clientY) / 2 - r.top, camX: G.cam.x, camY: G.cam.y };
      G.seret = null; return;
    }
    var t = ev.touches[0], x = t.clientX - r.left, y = t.clientY - r.top;
    sen = { x0: x, y0: y, x: x, y: y, mulai: performance.now(), geser: false, kotak: false, camX: G.cam.x, camY: G.cam.y };
    G.mouse = { x: x, y: y, dalam: true, dunia: keDunia(x, y), sentuh: true };
    sen.tahan = setTimeout(function () { if (sen && !sen.geser && !sen.dua) { sen.kotak = true; G.seret = { x0: sen.x0, y0: sen.y0, x1: sen.x, y1: sen.y, kotak: true }; if (navigator.vibrate) navigator.vibrate(15); } }, 380);
  }, { passive: false });
  cv.addEventListener('touchmove', function (ev) {
    ev.preventDefault(); if (!sen) return;
    var r = cv.getBoundingClientRect();
    if (sen.dua && ev.touches.length === 2) {
      var a = ev.touches[0], b = ev.touches[1], j = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      var cx = (a.clientX + b.clientX) / 2 - r.left, cy = (a.clientY + b.clientY) / 2 - r.top;
      G.zoom = Math.max(0.55, Math.min(1.5, sen.zoom * j / sen.jarak)); G.zoomDiatur = true;
      G.cam.x = sen.camX + (sen.cx / sen.zoom - cx / G.zoom); G.cam.y = sen.camY + (sen.cy / sen.zoom - cy / G.zoom); jepitKamera(); return;
    }
    var t = ev.touches[0], x = t.clientX - r.left, y = t.clientY - r.top; sen.x = x; sen.y = y;
    G.mouse = { x: x, y: y, dalam: true, dunia: keDunia(x, y), sentuh: true };
    if (sen.kotak) { G.seret.x1 = x; G.seret.y1 = y; return; }
    if (G.taruh || G.bidikMortir) return;
    if (Math.hypot(x - sen.x0, y - sen.y0) > 10) { sen.geser = true; clearTimeout(sen.tahan); }
    if (sen.geser) { G.cam.x = sen.camX - (x - sen.x0) / G.zoom; G.cam.y = sen.camY - (y - sen.y0) / G.zoom; jepitKamera(); }
  }, { passive: false });
  cv.addEventListener('touchend', function (ev) {
    ev.preventDefault(); if (!sen) return;
    clearTimeout(sen.tahan);
    var s = sen; if (ev.touches.length === 0) sen = null;
    if (s.dua || G.jeda) return;
    if (s.kotak) { pilihKotak(s.x0, s.y0, s.x, s.y, false); G.seret = null; return; }
    if (!s.geser || G.taruh || G.bidikMortir) {
      var w = keDunia(s.x, s.y);
      if (G.taruh) { G.mouse.dunia = w; }
      var sekarang = performance.now();
      if (G.ketukAkhir && sekarang - G.ketukAkhir.t < 320 && Math.hypot(s.x - G.ketukAkhir.x, s.y - G.ketukAkhir.y) < 20) { var e = entitasDi(w.x, w.y); if (e && e.s === 0 && e.k === 'unit') { pilihSejenisDiLayar(e); G.ketukAkhir = null; return; } }
      G.ketukAkhir = { t: sekarang, x: s.x, y: s.y };
      klikDunia(w.x, w.y, false);
    }
  }, { passive: false });

  window.addEventListener('keydown', function (ev) {
    if (!G || !G.berjalan) return;
    if (document.querySelector('.modal.buka')) { if (ev.key === 'Escape' && $('#modal-jeda').classList.contains('buka')) tutupJeda(); return; }
    TOMBOL[ev.key] = true;
    var k = ev.key.toLowerCase();
    if (k === 'escape') { if (G.taruh || G.bidikMortir || G.modeSerbu) { G.taruh = null; G.bidikMortir = false; G.modeSerbu = false; } else if (G.pilih.length) G.pilih = []; else bukaJeda(); perbaruiHUD(true); }
    else if (k === 'a') { if (unitKitaTerpilih().length) { G.modeSerbu = true; pesan('Mode serbu: klik tujuan.', ''); } }
    else if (k === 's') { G.pilih.forEach(function (e) { if (e.k === 'unit' && e.s === 0) { e.jalur = []; e.target = 0; e.perintah = 'diam'; e.jagaX = e.x; e.jagaY = e.y; } }); }
    else if (k === 'h' || k === 'home') { var hq = bangunanMilik(0, 'hq') || G.ents.find(function (e) { return e.s === 0; }); if (hq) pusatkanKamera(hq.x, hq.y); }
    else if (k === ' ') { ev.preventDefault(); if (G.titikSerang) pusatkanKamera(G.titikSerang.x, G.titikSerang.y); }
    else if (k === 'p') bukaJeda();
    else if (k === 'q') pilihSemuaPasukan();
    else if (k === 'l') jawabLogistik();
    else if (/^[1-9]$/.test(k)) {
      if (ev.ctrlKey || ev.metaKey) { ev.preventDefault(); G.grup[k] = G.pilih.slice(); pesan('Grup ' + k + ' disimpan (' + G.pilih.length + ' unit).', ''); }
      else if (G.grup[k]) {
        var g = G.grup[k].filter(function (e) { return !e.mati; });
        if (G.grupAkhir === k && performance.now() - G.grupT < 400 && g.length) pusatkanKamera(g[0].x, g[0].y);
        G.pilih = g; G.grupAkhir = k; G.grupT = performance.now(); bunyi('pilih');
      }
    }
  });
  window.addEventListener('keyup', function (ev) { TOMBOL[ev.key] = false; });
  window.addEventListener('resize', function () { if (G && G.berjalan) ukurKanvas(); });
}

function gulirKamera(dt) {
  var v = 720 * dt / G.zoom, dx = 0, dy = 0;
  if (TOMBOL.ArrowLeft) dx -= v; if (TOMBOL.ArrowRight) dx += v; if (TOMBOL.ArrowUp) dy -= v; if (TOMBOL.ArrowDown) dy += v;
  var m = G.mouse;
  if (m && m.dalam && !m.sentuh && !G.seret && PENGATURAN.tepi) {
    var tepi = 14;
    if (m.x < tepi) dx -= v; if (m.x > G.view.w - tepi) dx += v; if (m.y < tepi) dy -= v; if (m.y > G.view.h - tepi) dy += v;
  }
  if (dx || dy) { G.cam.x += dx; G.cam.y += dy; jepitKamera(); if (m) m.dunia = keDunia(m.x, m.y); }
}
