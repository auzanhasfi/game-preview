/* Siaga Merdeka: pembuatan peta (sungai, jembatan, jalan, hutan, sawah, ladang rempah), pencarian jalan A*, dan lukisan tanah. */
'use strict';

var T_RUMPUT = 0, T_SAWAH = 1, T_JALAN = 2, T_HUTAN = 3, T_AIR = 4, T_JEMBATAN = 5, T_TANAH = 6, T_BATU = 7;
var BLOK_TANAH = [false, false, false, true, true, false, false, true];
var WARNA_TANAH = ['#5f7a3a', '#86a24a', '#9b8458', '#2f4a25', '#2f5f6b', '#7a5b3a', '#8a7a52', '#6d6a60'];

function rngBenih(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* derau nilai halus 2D dari kisi acak */
function buatDerau(rng, skala, mw, mh) {
  var gw = Math.ceil(mw / skala) + 2, gh = Math.ceil(mh / skala) + 2, kisi = new Float32Array(gw * gh);
  for (var i = 0; i < kisi.length; i++) kisi[i] = rng();
  return function (x, y) {
    var fx = x / skala, fy = y / skala, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
    tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
    var a = kisi[y0 * gw + x0], b = kisi[y0 * gw + x0 + 1], c = kisi[(y0 + 1) * gw + x0], d = kisi[(y0 + 1) * gw + x0 + 1];
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
  };
}

function idx(x, y) { return y * G.mw + x; }
function dalamPeta(x, y) { return x >= 0 && y >= 0 && x < G.mw && y < G.mh; }
function bisaLewat(x, y) { if (!dalamPeta(x, y)) return false; var i = y * G.mw + x; return !BLOK_TANAH[G.tanah[i]] && !G.blok[i]; }
function tanahBisaBangun(x, y) { if (!dalamPeta(x, y)) return false; var t = G.tanah[idx(x, y)]; return t === T_RUMPUT || t === T_SAWAH || t === T_TANAH || t === T_JALAN; }

function buatPeta(seed, mw, mh) {
  var rng = rngBenih(seed);
  G.mw = mw; G.mh = mh;
  var n = mw * mh;
  G.tanah = new Uint8Array(n); G.blok = new Int32Array(n); G.rempah = new Float32Array(n); G.rempahMaks = new Float32Array(n);
  var dHutan = buatDerau(rng, 7, mw, mh), dSawah = buatDerau(rng, 9, mw, mh), dBatu = buatDerau(rng, 5, mw, mh);
  var fase = rng() * 6, amp = 2.5 + rng() * 2;
  function sungaiY(x) { return mh * 0.25 + x * 0.5 * (mh / mw) + Math.sin(x * 0.16 + fase) * amp; }
  G.sungaiY = sungaiY;
  var P = { x: 9, y: mh - 10 }, E = { x: mw - 10, y: 9 };
  G.pangkalan = [P, E];

  for (var y = 0; y < mh; y++) for (var x = 0; x < mw; x++) {
    var i = y * mw + x, t = T_RUMPUT;
    var dy = y - sungaiY(x), lebar = 1.3 + 0.6 * Math.sin(x * 0.3 + fase * 2);
    if (Math.abs(dy) < lebar) t = T_AIR;
    else if (dHutan(x, y) > 0.66) t = T_HUTAN;
    else if (dBatu(x, y) > 0.83) t = T_BATU;
    else if (dSawah(x, y) > 0.64) t = T_SAWAH;
    else if (dSawah(x + 40, y + 40) < 0.2) t = T_TANAH;
    G.tanah[i] = t;
  }
  /* bersihkan daerah pangkalan */
  [P, E].forEach(function (b) {
    for (var y = b.y - 9; y <= b.y + 9; y++) for (var x = b.x - 9; x <= b.x + 9; x++) {
      if (!dalamPeta(x, y)) continue; var d = Math.hypot(x - b.x, y - b.y);
      if (d < 8.5 && G.tanah[idx(x, y)] !== T_AIR) G.tanah[idx(x, y)] = d < 6 ? T_TANAH : T_RUMPUT;
    }
  });
  /* jalan melewati tiga jembatan, menjamin kedua pangkalan terhubung */
  var jembatan = [Math.round(mw * 0.2), Math.round(mw * 0.5), Math.round(mw * 0.8)];
  jembatan.forEach(function (bx) {
    var ry = sungaiY(bx);
    garisJalan(P.x, P.y, bx, Math.round(ry + 5));
    garisJalan(bx, Math.round(ry + 5), bx, Math.round(ry - 5));
    garisJalan(bx, Math.round(ry - 5), E.x, E.y);
  });
  function garisJalan(x0, y0, x1, y1) {
    var langkah = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
    for (var s = 0; s <= langkah; s++) {
      var x = Math.round(x0 + (x1 - x0) * s / langkah), y = Math.round(y0 + (y1 - y0) * s / langkah);
      for (var oy = 0; oy <= 1; oy++) for (var ox = 0; ox <= 1; ox++) {
        var xx = x + ox, yy = y + oy; if (!dalamPeta(xx, yy)) continue;
        var i = idx(xx, yy), t = G.tanah[i];
        G.tanah[i] = (t === T_AIR || t === T_JEMBATAN) ? T_JEMBATAN : T_JALAN;
      }
    }
  }
  /* ladang rempah */
  var ladang = [
    { x: P.x + 9, y: P.y - 1, r: 3.3, kaya: 1 }, { x: E.x - 9, y: E.y + 1, r: 3.3, kaya: 1 },
    { x: mw - 9, y: mh - 7, r: 3.6, kaya: 1.4 }, { x: 8, y: 7, r: 3.6, kaya: 1.4 },
    { x: Math.round(mw * 0.36), y: Math.round(sungaiY(mw * 0.36) + 7), r: 2.8, kaya: 1.2 },
    { x: Math.round(mw * 0.64), y: Math.round(sungaiY(mw * 0.64) - 7), r: 2.8, kaya: 1.2 }
  ];
  G.ladang = ladang;
  ladang.forEach(function (l) {
    for (var y = Math.floor(l.y - l.r - 1); y <= l.y + l.r + 1; y++) for (var x = Math.floor(l.x - l.r - 1); x <= l.x + l.r + 1; x++) {
      if (!dalamPeta(x, y)) continue; var i = idx(x, y), d = Math.hypot(x - l.x, y - l.y);
      if (d > l.r + rng() * 0.8 || BLOK_TANAH[G.tanah[i]] || G.tanah[i] === T_JEMBATAN) continue;
      if (G.tanah[i] !== T_JALAN) G.tanah[i] = T_RUMPUT;
      var v = (260 + rng() * 260) * l.kaya * (1 - d / (l.r + 2) * 0.5);
      G.rempah[i] = v; G.rempahMaks[i] = v;
    }
  });
}

/* ---------- A* 8 arah dengan tumpukan biner ---------- */
var _aG, _aF, _aDari, _aGen, _aTutup, _aId = 0, _heap = [];
function siapkanAStar() { var n = G.mw * G.mh; _aG = new Float32Array(n); _aF = new Float32Array(n); _aDari = new Int32Array(n); _aGen = new Int32Array(n); _aTutup = new Int32Array(n); }
function heapPush(i) { var h = _heap; h.push(i); var k = h.length - 1; while (k > 0) { var p = (k - 1) >> 1; if (_aF[h[p]] <= _aF[i]) break; h[k] = h[p]; k = p; } h[k] = i; }
function heapPop() { var h = _heap, top = h[0], last = h.pop(); if (h.length) { var k = 0, n = h.length; while (true) { var l = 2 * k + 1, r = l + 1, m = k; var fm = _aF[last]; if (l < n && _aF[h[l]] < fm) { m = l; fm = _aF[h[l]]; } if (r < n && _aF[h[r]] < fm) m = r; if (m === k) break; h[k] = h[m]; k = m; } h[k] = last; } return top; }

function ubinBebasDekat(tx, ty, terpakai) {
  if (bisaLewat(tx, ty) && !(terpakai && terpakai[idx(tx, ty)])) return { x: tx, y: ty };
  for (var r = 1; r < 14; r++) for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
    if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
    var x = tx + dx, y = ty + dy;
    if (bisaLewat(x, y) && !(terpakai && terpakai[idx(x, y)])) return { x: x, y: y };
  }
  return null;
}

function cariJalan(sx, sy, gx, gy) {
  var mw = G.mw;
  var tujuan = ubinBebasDekat(gx, gy); if (!tujuan) return [];
  gx = tujuan.x; gy = tujuan.y;
  if (sx === gx && sy === gy) return [];
  _aId++; _heap.length = 0;
  var s = sy * mw + sx, g = gy * mw + gx;
  _aG[s] = 0; _aF[s] = Math.hypot(gx - sx, gy - sy); _aGen[s] = _aId; _aDari[s] = -1; heapPush(s);
  var terbaik = s, hTerbaik = _aF[s], buka = 0;
  while (_heap.length && buka < 6000) {
    var c = heapPop(); if (_aTutup[c] === _aId) continue; _aTutup[c] = _aId; buka++;
    if (c === g) { terbaik = g; break; }
    var cx = c % mw, cy = (c / mw) | 0;
    var h = Math.hypot(gx - cx, gy - cy); if (h < hTerbaik) { hTerbaik = h; terbaik = c; }
    for (var d = 0; d < 8; d++) {
      var dx = [1, -1, 0, 0, 1, 1, -1, -1][d], dy = [0, 0, 1, -1, 1, -1, 1, -1][d];
      var nx = cx + dx, ny = cy + dy; if (!bisaLewat(nx, ny)) continue;
      if (dx && dy && (!bisaLewat(cx + dx, cy) || !bisaLewat(cx, cy + dy))) continue;
      var ni = ny * mw + nx; if (_aTutup[ni] === _aId) continue;
      var ng = _aG[c] + (dx && dy ? 1.414 : 1);
      if (_aGen[ni] === _aId && ng >= _aG[ni]) continue;
      _aGen[ni] = _aId; _aG[ni] = ng; _aDari[ni] = c; _aF[ni] = ng + Math.hypot(gx - nx, gy - ny) * 1.05; heapPush(ni);
    }
  }
  var jalur = [], k = terbaik;
  while (k !== -1 && k !== s) { jalur.push({ x: k % mw, y: (k / mw) | 0 }); k = _aDari[k]; }
  jalur.reverse();
  return haluskanJalan(sx, sy, jalur);
}

/* buang titik antara jika garis lurus tetap aman */
function garisAman(x0, y0, x1, y1) {
  var d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d * 3);
  for (var i = 1; i <= n; i++) {
    var x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
    for (var o = 0; o < 4; o++) { var ox = (o & 1 ? 0.3 : -0.3), oy = (o & 2 ? 0.3 : -0.3); if (!bisaLewat(Math.floor(x + 0.5 + ox), Math.floor(y + 0.5 + oy))) return false; }
  }
  return true;
}
function haluskanJalan(sx, sy, jalur) {
  if (jalur.length < 3) return jalur;
  var hasil = [], ax = sx, ay = sy, i = 0;
  while (i < jalur.length) {
    var j = jalur.length - 1;
    while (j > i && !garisAman(ax, ay, jalur[j].x, jalur[j].y)) j--;
    hasil.push(jalur[j]); ax = jalur[j].x; ay = jalur[j].y; i = j + 1;
  }
  return hasil;
}

/* ---------- lukisan tanah sekali jadi ---------- */
function lukisTanah() {
  var mw = G.mw, mh = G.mh, rng = rngBenih(G.benih * 7 + 3);
  /* peta mini dan dasar yang dihaluskan */
  var mini = document.createElement('canvas'); mini.width = mw; mini.height = mh;
  var mc = mini.getContext('2d'), img = mc.createImageData(mw, mh);
  for (var i = 0; i < mw * mh; i++) {
    var c = hexKeRgb(WARNA_TANAH[G.tanah[i]]), v = (rng() - 0.5) * 14;
    img.data[i * 4] = c[0] + v; img.data[i * 4 + 1] = c[1] + v; img.data[i * 4 + 2] = c[2] + v; img.data[i * 4 + 3] = 255;
  }
  mc.putImageData(img, 0, 0);
  G.miniTanah = mini;
  var cv = document.createElement('canvas'); cv.width = mw * TS; cv.height = mh * TS;
  var c = cv.getContext('2d');
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(mini, 0, 0, mw * TS, mh * TS);
  /* butiran rumput dan tanah */
  for (var y = 0; y < mh; y++) for (var x = 0; x < mw; x++) {
    var t = G.tanah[idx(x, y)], px = x * TS, py = y * TS;
    if (t === T_RUMPUT || t === T_TANAH) {
      for (var k = 0; k < 7; k++) {
        c.fillStyle = rng() < 0.5 ? 'rgba(20,35,10,0.22)' : 'rgba(190,200,120,0.14)';
        c.fillRect(px + rng() * TS, py + rng() * TS, 2, 2 + rng() * 2);
      }
    } else if (t === T_SAWAH) {
      c.strokeStyle = 'rgba(60,80,30,0.45)'; c.lineWidth = 1;
      for (var k = 4; k < TS; k += 6) { c.beginPath(); c.moveTo(px + 1, py + k); c.lineTo(px + TS - 1, py + k); c.stroke(); }
      c.fillStyle = 'rgba(210,220,140,0.25)'; for (var k = 0; k < 10; k++) c.fillRect(px + rng() * TS, py + rng() * TS, 1, 3);
      if (G.tanah[idx(x, y) - 1] !== T_SAWAH) { c.fillStyle = 'rgba(120,100,60,0.5)'; c.fillRect(px, py, 2, TS); }
      if (y > 0 && G.tanah[idx(x, y - 1)] !== T_SAWAH) { c.fillStyle = 'rgba(120,100,60,0.5)'; c.fillRect(px, py, TS, 2); }
    } else if (t === T_JALAN) {
      c.fillStyle = 'rgba(80,60,35,0.25)';
      c.fillRect(px + 7, py, 3, TS); c.fillRect(px + TS - 10, py, 3, TS);
      for (var k = 0; k < 6; k++) { c.fillStyle = 'rgba(230,210,160,0.18)'; c.fillRect(px + rng() * TS, py + rng() * TS, 2, 2); }
    } else if (t === T_AIR) {
      for (var k = 0; k < 3; k++) { c.strokeStyle = 'rgba(160,210,210,0.18)'; c.beginPath(); var yy = py + rng() * TS; c.moveTo(px + rng() * 10, yy); c.lineTo(px + 14 + rng() * 16, yy); c.stroke(); }
    } else if (t === T_BATU) {
      for (var k = 0; k < 3; k++) {
        var bx = px + 6 + rng() * 20, by = py + 6 + rng() * 20, br = 5 + rng() * 6;
        c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(bx + 3, by + 3, br, br * 0.7, 0, 0, 7); c.fill();
        c.fillStyle = '#7d7a70'; c.beginPath(); c.ellipse(bx, by, br, br * 0.75, rng(), 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(bx - br * 0.3, by - br * 0.3, br * 0.4, br * 0.25, 0, 0, 7); c.fill();
      }
    }
  }
  /* jembatan kayu */
  for (var y = 0; y < mh; y++) for (var x = 0; x < mw; x++) {
    if (G.tanah[idx(x, y)] !== T_JEMBATAN) continue;
    var px = x * TS, py = y * TS;
    c.fillStyle = '#6e4f30'; c.fillRect(px, py, TS, TS);
    for (var k = 0; k < TS; k += 6) { c.fillStyle = k % 12 ? '#87623c' : '#7b5835'; c.fillRect(px, py + k, TS, 5); }
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(px, py, 2, TS); c.fillRect(px + TS - 2, py, 2, TS);
  }
  /* pepohonan: tajuk bertumpuk dengan bayang */
  var pohon = [];
  for (var y = 0; y < mh; y++) for (var x = 0; x < mw; x++) if (G.tanah[idx(x, y)] === T_HUTAN) for (var k = 0; k < 2; k++) pohon.push({ x: x * TS + 4 + rng() * 24, y: y * TS + 4 + rng() * 24, r: 9 + rng() * 7, kelapa: rng() < 0.25 });
  pohon.sort(function (a, b) { return a.y - b.y; });
  pohon.forEach(function (p) { c.fillStyle = 'rgba(0,0,0,0.32)'; c.beginPath(); c.ellipse(p.x + 6, p.y + 7, p.r, p.r * 0.75, 0, 0, 7); c.fill(); });
  pohon.forEach(function (p) {
    if (p.kelapa) {
      c.strokeStyle = '#3f6b2a'; c.lineWidth = 3;
      for (var a = 0; a < 6; a++) { var s = a / 6 * Math.PI * 2 + p.x; c.beginPath(); c.moveTo(p.x, p.y); c.quadraticCurveTo(p.x + Math.cos(s) * p.r * 0.7, p.y + Math.sin(s) * p.r * 0.7 - 3, p.x + Math.cos(s) * p.r * 1.25, p.y + Math.sin(s) * p.r * 1.25); c.stroke(); }
      c.fillStyle = '#6b4a2a'; c.beginPath(); c.arc(p.x, p.y, 2.5, 0, 7); c.fill();
      return;
    }
    c.fillStyle = '#2b4a22'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill();
    c.fillStyle = '#3c6a2c'; c.beginPath(); c.arc(p.x - p.r * 0.25, p.y - p.r * 0.25, p.r * 0.72, 0, 7); c.fill();
    c.fillStyle = 'rgba(150,190,90,0.35)'; c.beginPath(); c.arc(p.x - p.r * 0.4, p.y - p.r * 0.4, p.r * 0.32, 0, 7); c.fill();
  });
  G.kanvasTanah = cv; G.ctxTanah = c;
}

function hexKeRgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }

/* bekas ledakan dicat langsung ke tanah supaya permanen */
function bekasHangus(x, y, r) {
  var c = G.ctxTanah, g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, 'rgba(20,16,12,0.55)'); g.addColorStop(0.6, 'rgba(30,24,16,0.3)'); g.addColorStop(1, 'rgba(30,24,16,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
}
