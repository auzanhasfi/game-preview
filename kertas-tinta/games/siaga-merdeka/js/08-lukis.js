/* Siaga Merdeka: lukisan dunia (tanah, rempah, unit, bangunan, proyektil, kabut, pilihan) dan gambar ikon produksi. */
'use strict';

/* ---------- bendera berkibar ---------- */
function bendera(c, x, y, fak, t, w, h) {
  w = w || 14; h = h || 9;
  c.strokeStyle = '#2a2520'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h - 12); c.stroke();
  var top = y - h - 12, n = 6;
  function baris(y0, y1, warna) {
    c.fillStyle = warna; c.beginPath();
    for (var i = 0; i <= n; i++) { var px = x + w * i / n, o = Math.sin(t * 6 + i * 0.9) * 1.6 * i / n; c.lineTo(px, y0 + o); }
    for (var j = n; j >= 0; j--) { var px2 = x + w * j / n, o2 = Math.sin(t * 6 + j * 0.9) * 1.6 * j / n; c.lineTo(px2, y1 + o2); }
    c.fill();
  }
  if (fak === 'id') { baris(top, top + h / 2, '#d7272e'); baris(top + h / 2, top + h, '#f4f1ea'); }
  else if (fak === 'nl') { baris(top, top + h / 3, '#c4262e'); baris(top + h / 3, top + h * 2 / 3, '#f4f1ea'); baris(top + h * 2 / 3, top + h, '#2a4b9b'); }
  else { baris(top, top + h, '#f4f1ea'); var o = Math.sin(t * 6 + 3) * 0.8; c.fillStyle = '#c8202f'; c.beginPath(); c.arc(x + w / 2, top + h / 2 + o, h * 0.28, 0, 7); c.fill(); }
}

function warnaGelap(hex, k) { var r = hexKeRgb(hex); return 'rgb(' + Math.round(r[0] * k) + ',' + Math.round(r[1] * k) + ',' + Math.round(r[2] * k) + ')'; }

/* ---------- unit ---------- */
function gambarUnit(c, tipe, fak, x, y, ang, tang, o) {
  o = o || {}; var F = FAKSI[fak], d = UNIT[tipe];
  if (d.jenis === 'inf') return gambarPrajurit(c, tipe, fak, x, y, ang, o);
  var L = { ringan: 22, tank: 26, arty: 24, truk: 26, berat: 30 }[tipe], W = { ringan: 14, tank: 18, arty: 15, truk: 14, berat: 21 }[tipe];
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(3, 4, L * 0.58, W * 0.62, ang, 0, 7); c.fill();
  c.rotate(ang);
  var mundur = (o.mundur || 0) * 3;
  if (tipe === 'truk') {
    c.fillStyle = '#2a2a24'; [-8, 8].forEach(function (wx) { c.fillRect(wx - 3, -W / 2 - 1, 6, 3); c.fillRect(wx - 3, W / 2 - 2, 6, 3); });
    c.fillStyle = F.badan2; rr(c, -L / 2, -W / 2, L * 0.62, W, 2); c.fill();
    c.fillStyle = '#4b3a28'; c.fillRect(-L / 2 + 2, -W / 2 + 2, L * 0.62 - 4, W - 4);
    var muat = Math.min(1, (o.muat || 0) / KAP_TRUK);
    if (muat > 0) { c.fillStyle = '#c4622a'; c.beginPath(); c.ellipse(-L / 2 + L * 0.31, 0, (L * 0.27) * (0.4 + muat * 0.6), (W / 2 - 3) * (0.4 + muat * 0.6), 0, 0, 7); c.fill(); c.fillStyle = '#8f3d1d'; c.fillRect(-L / 2 + 6, -2, 3, 3); c.fillRect(-L / 2 + 10, 1, 3, 3); }
    c.fillStyle = F.badan; rr(c, L * 0.14, -W / 2 + 1, L * 0.34, W - 2, 3); c.fill();
    c.fillStyle = 'rgba(160,200,210,0.75)'; c.fillRect(L * 0.36, -W / 2 + 3, 3, W - 6);
    c.fillStyle = o.tim || F.tim; c.fillRect(-L / 2 + 1, -1.5, 3, 3);
  } else {
    var roda = tipe === 'ringan' && fak !== 'jp';
    c.fillStyle = '#26241f';
    if (roda) { [-L / 3, 0, L / 3].forEach(function (wx) { c.beginPath(); c.ellipse(wx, -W / 2, 3.6, 2.2, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(wx, W / 2, 3.6, 2.2, 0, 0, 7); c.fill(); }); }
    else {
      c.fillRect(-L / 2, -W / 2 - 1, L, 5); c.fillRect(-L / 2, W / 2 - 4, L, 5);
      c.fillStyle = '#4a463d'; var off = (o.langkah || 0) % 4;
      for (var k = -L / 2 + off; k < L / 2; k += 4) { c.fillRect(k, -W / 2 - 1, 1.5, 5); c.fillRect(k, W / 2 - 4, 1.5, 5); }
    }
    c.fillStyle = F.badan2; rr(c, -L / 2 + 1, -W / 2 + 3, L - 2, W - 6, 3); c.fill();
    c.fillStyle = F.badan; rr(c, -L / 2 + 3, -W / 2 + 4, L - 7, W - 8, 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(-L / 2 + 3, -W / 2 + 4, L - 7, 2);
    /* tanda faksi di buritan */
    if (fak === 'id') { c.fillStyle = '#d7272e'; c.fillRect(-L / 2 + 3, -3, 4, 3); c.fillStyle = '#f2efe6'; c.fillRect(-L / 2 + 3, 0, 4, 3); }
    else if (fak === 'nl') { c.fillStyle = '#f08a24'; c.beginPath(); c.moveTo(-L / 2 + 3, -3); c.lineTo(-L / 2 + 8, 0); c.lineTo(-L / 2 + 3, 3); c.fill(); }
    else { c.fillStyle = '#f2efe6'; c.beginPath(); c.arc(-L / 2 + 6, 0, 3, 0, 7); c.fill(); c.fillStyle = '#c8202f'; c.beginPath(); c.arc(-L / 2 + 6, 0, 1.6, 0, 7); c.fill(); }
    c.fillStyle = o.tim || F.tim; c.fillRect(L / 2 - 6, -W / 2 + 4, 3, 2); c.fillRect(L / 2 - 6, W / 2 - 6, 3, 2);
    /* menara */
    c.rotate(tang - ang);
    var pjLaras = { ringan: 9, tank: 15, arty: 20, berat: 17 }[tipe], lbLaras = { ringan: 1.8, tank: 3, arty: 3.4, berat: 3.8 }[tipe];
    var tr = { ringan: 4.5, tank: 6.5, arty: 5.5, berat: 8 }[tipe];
    c.fillStyle = '#2c2a24'; c.fillRect(tr - 2 - mundur, -lbLaras / 2, pjLaras, lbLaras);
    if (tipe === 'arty') { c.fillRect(tr + pjLaras - 4 - mundur, -lbLaras / 2 - 1, 4, lbLaras + 2); }
    c.fillStyle = warnaGelap(F.badan, 0.82); c.beginPath();
    if (tipe === 'arty') { rr(c, -tr, -tr * 0.9, tr * 1.8, tr * 1.8, 2); } else c.arc(0, 0, tr, 0, 7);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.arc(-tr * 0.3, -tr * 0.3, tr * 0.45, 0, 7); c.fill();
    c.fillStyle = '#26241f'; c.beginPath(); c.arc(-tr * 0.2, 0, tr * 0.28, 0, 7); c.fill();
  }
  c.restore();
}

function gambarPrajurit(c, tipe, fak, x, y, ang, o) {
  var F = FAKSI[fak], jalan = o.bergerak ? Math.sin((o.langkah || 0) * 0.45) : 0;
  c.save(); c.translate(x, y); c.scale(1.35, 1.35);
  c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(2, 3, 5, 3.4, 0, 0, 7); c.fill();
  c.rotate(ang);
  c.fillStyle = '#2a2620'; c.fillRect(-2 + jalan * 2.5, -3, 3.5, 2); c.fillRect(-2 - jalan * 2.5, 1, 3.5, 2);
  var baju = fak === 'id' ? (tipe === 'inf1' ? '#c9b98f' : tipe === 'hero' ? '#4e5b32' : '#6d7a45') : fak === 'nl' ? '#5f6a4c' : '#a08a52';
  c.fillStyle = baju; c.beginPath(); c.ellipse(0, 0, 3.6, 4.6, 0, 0, 7); c.fill();
  /* senjata */
  var s = UNIT[tipe] ? nilaiFak(UNIT[tipe].senjata, fak) : 'senapan';
  if (s === 'tusuk') { c.strokeStyle = '#c8b46a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-4, 3); c.lineTo(14 - (o.mundur || 0) * 4, 3); c.stroke(); c.fillStyle = '#e9dfb8'; c.beginPath(); c.moveTo(14 - (o.mundur || 0) * 4, 2); c.lineTo(17 - (o.mundur || 0) * 4, 3); c.lineTo(14 - (o.mundur || 0) * 4, 4); c.fill(); }
  else if (s === 'roket') { c.fillStyle = '#3d4230'; c.fillRect(-4, 1.5, 15, 3.4); c.fillStyle = '#2a2a22'; c.fillRect(9, 1, 3, 4.4); }
  else if (s === 'peledak') { c.fillStyle = '#2a2620'; c.fillRect(1, 2, 8, 1.8); c.fillStyle = '#b2382c'; c.fillRect(-4, -5, 4, 3); }
  else { c.fillStyle = '#2a2620'; c.fillRect(1, 1.8, s === 'jitu' ? 13 : 10, 1.6); }
  /* kepala dan penutup kepala */
  c.fillStyle = '#b07d55'; c.beginPath(); c.arc(0.6, 0, 2.6, 0, 7); c.fill();
  if (fak === 'id') {
    if (tipe === 'inf1') { c.fillStyle = '#d7272e'; c.fillRect(-1.2, -2.7, 2.2, 5.4); c.fillStyle = '#f2efe6'; c.fillRect(-2.6, -0.6, 1.6, 1.2); }
    else if (tipe === 'inf2') { c.fillStyle = '#1d1b18'; c.beginPath(); c.ellipse(0.3, 0, 2.5, 2.7, 0, 0, 7); c.fill(); }
    else if (tipe === 'hero') { c.fillStyle = '#b3222b'; c.beginPath(); c.ellipse(0, -0.5, 3, 3, 0, 0, 7); c.fill(); c.fillStyle = '#e5c54a'; c.fillRect(0.4, -1.8, 1.4, 1.4); }
    else { c.fillStyle = '#4c5733'; c.beginPath(); c.arc(0.3, 0, 3, 0, 7); c.fill(); }
  } else if (fak === 'nl') { c.fillStyle = '#4d553f'; c.beginPath(); c.arc(0.2, 0, 3.2, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.15)'; c.beginPath(); c.arc(-0.6, -0.8, 1.2, 0, 7); c.fill(); }
  else { c.fillStyle = '#8b7a46'; c.beginPath(); c.arc(0.4, 0, 2.9, 0, 7); c.fill(); c.fillStyle = '#7a6a3c'; c.fillRect(-3.6, -2.4, 2, 4.8); c.fillStyle = '#c8202f'; c.fillRect(1.6, -0.6, 1.2, 1.2); }
  c.fillStyle = o.tim || F.tim; c.fillRect(-3.4, -4.2, 2.2, 1.6);
  c.restore();
}

function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

/* ---------- bangunan ---------- */
function blok3d(c, x, y, w, h, H, atap, dinding) {
  c.fillStyle = 'rgba(0,0,0,0.32)'; c.beginPath(); c.moveTo(x + w, y - H + 4); c.lineTo(x + w + H * 0.6, y + 4); c.lineTo(x + w + H * 0.6, y + h + 4); c.lineTo(x + 4, y + h + 4); c.lineTo(x, y + h); c.closePath(); c.fill();
  c.fillStyle = dinding; c.fillRect(x, y + h - H, w, H);
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x, y + h - 3, w, 3);
  c.fillStyle = atap; c.fillRect(x, y - H, w, h);
}
function atapLimas(c, x, y, w, h, warna, warna2) {
  c.fillStyle = warna2; c.fillRect(x, y, w, h);
  c.fillStyle = warna; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * 0.3, y + h * 0.5); c.lineTo(x + w * 0.7, y + h * 0.5); c.lineTo(x + w, y); c.closePath(); c.fill();
  c.fillStyle = warnaGelap(warna, 0.82); c.beginPath(); c.moveTo(x, y + h); c.lineTo(x + w * 0.3, y + h * 0.5); c.lineTo(x + w * 0.7, y + h * 0.5); c.lineTo(x + w, y + h); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + w * 0.3, y + h * 0.5); c.lineTo(x + w * 0.7, y + h * 0.5); c.stroke();
}
function karungPasir(c, x, y, n, panjang, vertikal) {
  for (var i = 0; i < n; i++) {
    var px = vertikal ? x : x + i * panjang / n, py = vertikal ? y + i * panjang / n : y;
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(px + 4, py + 2, panjang / n * 0.55, 3, 0, 0, 7); c.fill();
    c.fillStyle = i % 2 ? '#b5a27a' : '#a8946c'; c.beginPath(); c.ellipse(px + 3, py, panjang / n * 0.55, 3.2, 0, 0, 7); c.fill();
  }
}

function gambarBangunan(c, tipe, fak, x, y, w, h, o) {
  o = o || {}; var F = FAKSI[fak], t = o.t || 0;
  switch (tipe) {
    case 'hq': {
      karungPasir(c, x + 2, y + h - 4, 7, w - 6);
      blok3d(c, x + 6, y + 14, w - 12, h - 26, 22, F.atap, F.dinding);
      if (fak === 'id') atapLimas(c, x + 4, y - 10, w - 8, h - 24, F.atap, F.atap2); else { c.fillStyle = F.atap2; c.fillRect(x + 6, y - 8, w - 12, h - 26); c.fillStyle = F.atap; c.fillRect(x + 10, y - 4, w - 20, h - 34); }
      c.fillStyle = '#3a2f24'; c.fillRect(x + w / 2 - 6, y + h - 22, 12, 10);
      c.fillStyle = 'rgba(40,40,30,0.6)'; for (var i = 0; i < 4; i++) c.fillRect(x + 12 + i * 18, y + h - 26, 6, 5);
      c.fillStyle = o.tim || F.tim; c.fillRect(x + 8, y + h - 14, 6, 3);
      bendera(c, x + w - 16, y + 4, fak, t, 16, 10);
      break;
    }
    case 'daya': {
      blok3d(c, x + 4, y + 10, w - 8, h - 16, 14, '#6c6a60', F.dinding);
      c.fillStyle = '#58564d'; c.fillRect(x + 6, y - 2, w - 12, h - 18);
      [[x + 18, y + 4], [x + 44, y + 4]].forEach(function (p) {
        c.fillStyle = '#4a463e'; c.beginPath(); c.ellipse(p[0], p[1], 7, 5, 0, 0, 7); c.fill();
        c.fillStyle = '#7d786c'; c.fillRect(p[0] - 6, p[1] - 14, 12, 14); c.fillStyle = '#2a2724'; c.beginPath(); c.ellipse(p[0], p[1] - 14, 6, 3.5, 0, 0, 7); c.fill();
      });
      c.fillStyle = o.kurang ? '#7a3a2a' : '#e8c35a'; c.beginPath(); c.arc(x + w / 2, y + h - 12, 3 + (o.kurang ? 0 : Math.sin(t * 4) * 0.8), 0, 7); c.fill();
      c.fillStyle = o.tim || F.tim; c.fillRect(x + 6, y + h - 10, 5, 3);
      break;
    }
    case 'gudang': {
      blok3d(c, x + 4, y + 8, w - 8, h * 0.55, 20, F.atap, F.dinding);
      c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 1; for (var k = x + 8; k < x + w - 6; k += 5) { c.beginPath(); c.moveTo(k, y - 12); c.lineTo(k, y - 12 + h * 0.55); c.stroke(); }
      c.fillStyle = '#7a6448'; c.fillRect(x + 6, y + h * 0.66, w - 12, h * 0.3);
      c.fillStyle = '#c4622a'; [[16, 0.78], [34, 0.82], [64, 0.78]].forEach(function (p) { c.beginPath(); c.ellipse(x + p[0], y + h * p[1], 8, 5, 0, 0, 7); c.fill(); });
      c.fillStyle = '#8f3d1d'; c.beginPath(); c.ellipse(x + 34, y + h * 0.8, 4, 2.4, 0, 0, 7); c.fill();
      c.strokeStyle = '#3a3128'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w - 10, y + h - 4); c.lineTo(x + w - 10, y - 14); c.lineTo(x + w - 24, y - 6); c.stroke();
      c.fillStyle = o.tim || F.tim; c.fillRect(x + 8, y + 2, 6, 3);
      break;
    }
    case 'barak': {
      blok3d(c, x + 4, y + 10, w - 8, h - 18, 12, F.atap, F.dinding);
      c.fillStyle = F.atap2; for (var j = 0; j < 4; j++) c.fillRect(x + 4, y - 2 + j * 7, w - 8, 3);
      c.fillStyle = '#3a2f24'; c.fillRect(x + w / 2 - 4, y + h - 18, 8, 10);
      karungPasir(c, x + 2, y + h - 4, 4, w - 6);
      bendera(c, x + 6, y + 2, fak, t, 11, 7);
      c.fillStyle = o.tim || F.tim; c.fillRect(x + w - 12, y + h - 14, 5, 3);
      break;
    }
    case 'bengkel': {
      blok3d(c, x + 4, y + 18, w - 8, h - 26, 22, F.atap, F.dinding);
      for (var b = 0; b < 6; b++) { c.fillStyle = b % 2 ? F.atap : warnaGelap(F.atap, 0.85); c.fillRect(x + 4, y - 4 + b * ((h - 26) / 6), w - 8, (h - 26) / 6); }
      c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(x + 4, y - 4, w - 8, 3);
      c.fillStyle = '#26231e'; c.fillRect(x + w / 2 - 16, y + h - 26, 32, 18);
      c.fillStyle = '#d6b23e'; for (var s = 0; s < 4; s++) { c.beginPath(); c.moveTo(x + w / 2 - 16 + s * 8, y + h - 8); c.lineTo(x + w / 2 - 12 + s * 8, y + h - 8); c.lineTo(x + w / 2 - 8 + s * 8, y + h - 4); c.lineTo(x + w / 2 - 12 + s * 8, y + h - 4); c.fill(); }
      c.fillStyle = o.tim || F.tim; c.fillRect(x + 8, y + h - 14, 6, 3);
      break;
    }
    case 'radar': {
      blok3d(c, x + 6, y + 18, w - 12, h - 24, 10, F.atap2, F.dinding);
      c.strokeStyle = '#3d3a33'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x + 22, y + 20); c.lineTo(x + 32, y - 22); c.lineTo(x + 42, y + 20); c.moveTo(x + 25, y + 6); c.lineTo(x + 39, y + 6); c.moveTo(x + 28, y - 8); c.lineTo(x + 36, y - 8); c.stroke();
      var aktif = !o.kurang, a = aktif ? t * 1.6 : 0.5;
      c.save(); c.translate(x + 32, y - 22); c.fillStyle = '#9aa0a0'; c.beginPath(); c.ellipse(0, 0, 11 * Math.abs(Math.cos(a)) + 2, 5, 0, 0, 7); c.fill();
      c.strokeStyle = '#5a5e5e'; c.lineWidth = 1; c.stroke(); c.restore();
      c.fillStyle = aktif && Math.sin(t * 5) > 0 ? '#ff5544' : '#5a2a22'; c.beginPath(); c.arc(x + 32, y - 26, 2, 0, 7); c.fill();
      c.fillStyle = o.tim || F.tim; c.fillRect(x + 10, y + h - 10, 5, 3);
      break;
    }
    case 'siasat': {
      blok3d(c, x + 4, y + 14, w - 8, h - 20, 14, F.atap, F.dinding);
      c.fillStyle = '#8f9488'; c.beginPath(); c.arc(x + w / 2, y + 6, 14, Math.PI, 0); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.arc(x + w / 2 - 4, y + 2, 6, Math.PI, 0); c.fill();
      c.strokeStyle = '#3d3a33'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 10, y + 4); c.lineTo(x + 10, y - 20); c.moveTo(x + w - 10, y + 4); c.lineTo(x + w - 10, y - 14); c.stroke();
      c.fillStyle = Math.sin(t * 3) > 0 ? '#ffd35a' : '#6b5a2a'; c.beginPath(); c.arc(x + 10, y - 20, 2, 0, 7); c.fill();
      c.fillStyle = o.tim || F.tim; c.fillRect(x + w / 2 - 3, y + h - 12, 6, 3);
      break;
    }
    case 'bunker': {
      karungPasir(c, x + 1, y + h - 4, 3, w - 2);
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(x + w / 2 + 3, y + h / 2 + 3, 14, 11, 0, 0, 7); c.fill();
      c.fillStyle = '#8b887c'; c.beginPath(); c.ellipse(x + w / 2, y + h / 2 - 2, 14, 11, 0, 0, 7); c.fill();
      c.fillStyle = '#a3a093'; c.beginPath(); c.ellipse(x + w / 2 - 3, y + h / 2 - 5, 8, 5, 0, 0, 7); c.fill();
      c.save(); c.translate(x + w / 2, y + h / 2 - 2); c.rotate(o.tang || 0);
      c.fillStyle = '#1e1c19'; c.fillRect(6, -2, 7, 4); c.fillStyle = '#2a2724'; c.fillRect(8 - (o.mundur || 0) * 2, -1, 11, 2); c.restore();
      c.fillStyle = o.tim || F.tim; c.fillRect(x + 4, y + 4, 4, 3);
      break;
    }
    case 'meriam': {
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x + 4, y + 6, w - 2, h - 4);
      c.fillStyle = '#7d7a6e'; c.fillRect(x + 1, y + 1, w - 2, h - 4); c.fillStyle = '#5f5d54'; c.fillRect(x + 1, y + h - 6, w - 2, 3);
      c.save(); c.translate(x + w / 2, y + h / 2 - 3); c.rotate(o.tang || 0);
      c.fillStyle = '#2a2724'; c.fillRect(2 - (o.mundur || 0) * 4, -2, 20, 4);
      c.fillStyle = o.kurang ? '#5b5a52' : warnaGelap(F.badan, 0.9); c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); c.arc(-2, -2, 4, 0, 7); c.fill(); c.restore();
      c.fillStyle = o.tim || F.tim; c.fillRect(x + 3, y + 3, 4, 3);
      if (o.kurang) { c.fillStyle = 'rgba(30,20,10,0.4)'; c.fillRect(x + 1, y + 1, w - 2, h - 4); }
      break;
    }
    case 'karung': {
      karungPasir(c, x, y + 8, 3, w - 2); karungPasir(c, x + 3, y + 16, 3, w - 6); karungPasir(c, x, y + 24, 3, w - 2);
      c.fillStyle = o.tim || F.tim; c.fillRect(x + w / 2 - 1, y + 4, 2, 2);
      break;
    }
  }
}

/* ---------- ikon produksi (dibuat sekali, disimpan) ---------- */
var _ikonCache = {};
function ikonProduksi(tipe, fak) {
  var key = tipe + fak; if (_ikonCache[key]) return _ikonCache[key];
  var cv = document.createElement('canvas'), s = 2; cv.width = 64 * s; cv.height = 40 * s;
  var c = cv.getContext('2d'); c.scale(s, s);
  var g = c.createLinearGradient(0, 0, 0, 40); g.addColorStop(0, '#3b4530'); g.addColorStop(1, '#262c1e'); c.fillStyle = g; c.fillRect(0, 0, 64, 40);
  c.fillStyle = 'rgba(255,255,255,0.04)'; for (var i = 0; i < 64; i += 6) c.fillRect(i, 0, 1, 40);
  if (BANGUN[tipe]) {
    var d = BANGUN[tipe], k = Math.min(54 / (d.w * TS), 32 / (d.h * TS + 22));
    c.save(); c.translate(30 - d.w * TS * k / 2, 38 - d.h * TS * k); c.scale(k, k); gambarBangunan(c, tipe, fak, 0, 0, d.w * TS, d.h * TS, { t: 0.4, tang: -0.6 }); c.restore();
  } else {
    var inf = UNIT[tipe].jenis === 'inf', k2 = inf ? 2.6 : 1.5;
    c.save(); c.translate(32, 21); c.scale(k2, k2); gambarUnit(c, tipe, fak, 0, 0, -0.5, -0.5, { muat: KAP_TRUK }); c.restore();
  }
  _ikonCache[key] = cv; return cv;
}

/* ---------- rempah ---------- */
function lukisRempah(c, x0, y0, x1, y1) {
  for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
    var i = idx(x, y), v = G.rempah[i]; if (v <= 0 || !G.jelajah[i]) continue;
    var n = Math.min(4, Math.ceil(v / 110)), px = x * TS, py = y * TS;
    for (var k = 0; k < n; k++) {
      var h = (i * 31 + k * 17) % 97, bx = px + 6 + (h % 20), by = py + 6 + ((h * 7) % 20);
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(bx + 2, by + 3, 6, 3.5, 0, 0, 7); c.fill();
      c.fillStyle = '#3f6b2c'; c.beginPath(); c.ellipse(bx - 2, by, 4, 2.5, -0.6, 0, 7); c.ellipse(bx + 2, by, 4, 2.5, 0.6, 0, 7); c.fill();
      c.fillStyle = k % 2 ? '#d2692a' : '#b8372d'; c.beginPath(); c.arc(bx, by - 2, 2.4, 0, 7); c.arc(bx + 3, by + 1, 1.8, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,220,160,0.5)'; c.fillRect(bx - 1, by - 3.5, 1, 1);
    }
  }
}

/* ---------- kabut perang ---------- */
function perbaruiKabut() {
  if (!G.kabut) { G.kabut = document.createElement('canvas'); G.kabut.width = G.mw; G.kabut.height = G.mh; G.kabutData = G.kabut.getContext('2d').createImageData(G.mw, G.mh); }
  var d = G.kabutData.data;
  for (var i = 0; i < G.mw * G.mh; i++) { d[i * 4] = 8; d[i * 4 + 1] = 9; d[i * 4 + 2] = 6; d[i * 4 + 3] = G.vis[i] ? 0 : G.jelajah[i] ? 125 : 255; }
  G.kabut.getContext('2d').putImageData(G.kabutData, 0, 0);
}

/* ---------- lukisan dunia per bingkai ---------- */
function lukisDunia() {
  var c = ctx, z = G.zoom, vw = G.view.w / z, vh = G.view.h / z;
  c.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
  c.fillStyle = '#080907'; c.fillRect(0, 0, G.view.w, G.view.h);
  var gx = G.getar > 0.3 ? (Math.random() - 0.5) * G.getar : 0, gy = G.getar > 0.3 ? (Math.random() - 0.5) * G.getar : 0;
  c.save(); c.scale(z, z); c.translate(-G.cam.x + gx / z, -G.cam.y + gy / z);
  var sx = Math.max(0, G.cam.x), sy = Math.max(0, G.cam.y), sw = Math.min(vw + 2, G.mw * TS - sx), sh = Math.min(vh + 2, G.mh * TS - sy);
  if (sw > 0 && sh > 0) c.drawImage(G.kanvasTanah, sx, sy, sw, sh, sx, sy, sw, sh);
  var x0 = Math.max(0, Math.floor(G.cam.x / TS)), y0 = Math.max(0, Math.floor(G.cam.y / TS)), x1 = Math.min(G.mw - 1, Math.floor((G.cam.x + vw) / TS)), y1 = Math.min(G.mh - 1, Math.floor((G.cam.y + vh) / TS));
  /* kilau air */
  c.strokeStyle = 'rgba(190,230,230,0.22)'; c.lineWidth = 1.2;
  for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) if (G.tanah[idx(x, y)] === T_AIR && (x + y) % 2 === 0) {
    var o = (G.waktuNyata * 12 + x * 7 + y * 13) % TS; c.beginPath(); c.moveTo(x * TS + o * 0.5, y * TS + o); c.lineTo(x * TS + o * 0.5 + 8, y * TS + o); c.stroke();
  }
  lukisRempah(c, x0, y0, x1, y1);
  /* bangkai dan prajurit gugur */
  G.bangkai.forEach(function (b) { if (!G.jelajah[idx(Math.floor(b.x / TS), Math.floor(b.y / TS))]) return; c.save(); c.translate(b.x, b.y); c.rotate(b.ang); c.fillStyle = '#25221d'; rr(c, -12, -8, 24, 16, 3); c.fill(); c.fillStyle = '#3a342c'; c.beginPath(); c.arc(0, 0, 5, 0, 7); c.fill(); c.restore(); });
  G.gugur.forEach(function (g) { if (!terlihatTitik(g.x, g.y)) return; c.globalAlpha = Math.min(1, g.t); c.save(); c.translate(g.x, g.y); c.rotate(g.ang + 1.4); c.fillStyle = g.fak === 'id' ? '#7d6f4f' : g.fak === 'nl' ? '#55604a' : '#8a7a4c'; c.beginPath(); c.ellipse(0, 0, 5, 2.4, 0, 0, 7); c.fill(); c.restore(); c.globalAlpha = 1; });
  /* lingkar pilihan di kaki unit */
  G.pilih.forEach(function (e) { if (e.k !== 'unit') return; c.strokeStyle = e.s === 0 ? 'rgba(140,240,140,0.85)' : 'rgba(255,120,100,0.85)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(e.x, e.y + 2, jariDari(e) + 4, (jariDari(e) + 4) * 0.62, 0, 0, 7); c.stroke(); });
  /* entitas urut kedalaman */
  var tampil = G.ents.filter(function (e) { return !e.mati && terlihatLayar(e) && terlihat(e); });
  tampil.sort(function (a, b) { return (a.k === 'bgn' ? (a.ty + a.h) * TS - 4 : a.y) - (b.k === 'bgn' ? (b.ty + b.h) * TS - 4 : b.y); });
  var t = G.waktuNyata;
  tampil.forEach(function (e) {
    if (e.k === 'bgn') {
      var bx = e.tx * TS, by = e.ty * TS, bw = e.w * TS, bh = e.h * TS, sisi = G.sisi[e.s];
      c.save();
      if (e.tumbuh < 1) { var tinggi = (bh + 40) * e.tumbuh; c.beginPath(); c.rect(bx - 10, by + bh + 8 - tinggi, bw + 40, tinggi); c.clip(); }
      gambarBangunan(c, e.tipe, e.fak, bx, by, bw, bh, { t: t + e.acak, tang: e.tang, mundur: e.mundur, kurang: sisi.kurang && (BANGUN[e.tipe].listrik || e.tipe === 'radar' || e.tipe === 'daya') });
      c.restore();
      if (e.tumbuh < 1) { c.strokeStyle = 'rgba(230,210,150,0.6)'; c.lineWidth = 1; c.strokeRect(bx + 1, by + bh * (1 - e.tumbuh), bw - 2, bh * e.tumbuh); }
      if (e.kenaT > 0) { c.fillStyle = 'rgba(255,255,255,' + (e.kenaT * 1.2) + ')'; c.fillRect(bx + 4, by - 6, bw - 8, bh); }
      if (e.utama && e.s === 0) { c.fillStyle = '#e8c35a'; c.font = '700 9px system-ui'; c.fillText('UTAMA', bx + 3, by + bh - 3); }
    } else {
      gambarUnit(c, e.tipe, e.fak, e.x, e.y, e.ang, e.tang, { langkah: e.langkah, mundur: e.mundur, muat: e.muat, bergerak: e.bergerak });
      if (e.kenaT > 0 && e.jenis !== 'inf') { c.fillStyle = 'rgba(255,255,255,' + e.kenaT * 2 + ')'; c.beginPath(); c.arc(e.x, e.y, 10, 0, 7); c.fill(); }
    }
  });
  /* proyektil */
  G.proj.forEach(function (p) {
    if (!terlihatTitik(p.x, p.y)) return;
    if (p.jenis === 'lengkung') {
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(p.x, p.y, 3, 2, 0, 0, 7); c.fill();
      c.fillStyle = p.bom ? '#2c2c28' : '#3a3630'; c.beginPath(); c.arc(p.x, p.y - (p.tinggi || 0), p.bom ? 3.5 : 2.6, 0, 7); c.fill();
    } else if (p.jenis === 'roket') {
      c.save(); c.translate(p.x, p.y); c.rotate(p.sudut || 0); c.fillStyle = '#4a4a40'; c.fillRect(-5, -1.5, 9, 3); c.fillStyle = '#ffcf5a'; c.beginPath(); c.arc(-6, 0, 2.2 + Math.random(), 0, 7); c.fill(); c.restore();
    } else {
      c.save(); c.translate(p.x, p.y); c.rotate(p.sudut || 0); c.fillStyle = '#ffe9a8'; c.fillRect(-6, -1, 8, 2); c.restore();
    }
  });
  lukisPartikel(c, 'bawah');
  G.jejak.forEach(function (j) {
    c.strokeStyle = j.besar ? 'rgba(255,220,140,' + (j.t * 12) + ')' : 'rgba(255,236,170,' + (j.t * 11) + ')'; c.lineWidth = j.besar ? 2 : 1.1;
    c.beginPath(); var f = 0.35; c.moveTo(j.x0 + (j.x1 - j.x0) * f, j.y0 + (j.y1 - j.y0) * f); c.lineTo(j.x1, j.y1); c.stroke();
  });
  lukisPartikel(c, 'atas');
  /* pesawat */
  G.pesawat.forEach(function (p) {
    c.save(); c.translate(p.x + 40, p.y + 70); c.rotate(p.a); c.fillStyle = 'rgba(0,0,0,0.22)'; bentukPesawat(c); c.restore();
    c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = '#6f7766'; bentukPesawat(c); c.fillStyle = '#f08a24'; c.fillRect(-14, -12, 4, 3); c.fillRect(-14, 9, 4, 3); c.restore();
  });
  /* kabut */
  if (G.kabut) { c.imageSmoothingEnabled = true; c.drawImage(G.kabut, 0, 0, G.mw * TS, G.mh * TS); }
  /* bilah nyawa dan siku pilihan */
  G.pilih.forEach(function (e) { if (!e.mati) sikuPilihan(c, e); });
  if (G.sorot && !G.sorot.mati && G.pilih.indexOf(G.sorot) < 0 && terlihat(G.sorot)) bilahNyawa(c, G.sorot);
  G.ents.forEach(function (e) { if (e.k === 'bgn' && e.s === 0 && e.hp < e.hpMaks * 0.6 && !e.mati && G.pilih.indexOf(e) < 0 && terlihatLayar(e)) bilahNyawa(c, e); });
  /* garis perintah untuk pilihan */
  if (G.garisT > 0) {
    c.globalAlpha = Math.min(1, G.garisT * 2);
    G.pilih.forEach(function (e) {
      if (e.k !== 'unit') return; var tg = e.target && G.byId[e.target];
      var ke = tg ? tg : (e.jalur.length ? { x: (e.jalur[e.jalur.length - 1].x + 0.5) * TS, y: (e.jalur[e.jalur.length - 1].y + 0.5) * TS } : null); if (!ke) return;
      c.strokeStyle = tg ? 'rgba(255,90,70,0.7)' : 'rgba(140,240,140,0.6)'; c.setLineDash([4, 4]); c.lineWidth = 1; c.beginPath(); c.moveTo(e.x, e.y); c.lineTo(ke.x, ke.y); c.stroke(); c.setLineDash([]);
      c.fillStyle = c.strokeStyle; c.beginPath(); c.arc(ke.x, ke.y, 3, 0, 7); c.fill();
    });
    c.globalAlpha = 1;
  }
  /* penanda perintah */
  G.tanda.forEach(function (m) { var f = m.t / 0.6; c.strokeStyle = m.serang ? 'rgba(255,90,70,' + f + ')' : 'rgba(140,240,140,' + f + ')'; c.lineWidth = 2; c.beginPath(); c.arc(m.x, m.y, 4 + (1 - f) * 10, 0, 7); c.stroke(); });
  /* bayangan penempatan bangunan */
  if (G.taruh && G.mouse && G.mouse.dunia) {
    var d = BANGUN[G.taruh.tipe], tx = Math.floor(G.mouse.dunia.x / TS - d.w / 2 + 0.5), ty = Math.floor(G.mouse.dunia.y / TS - d.h / 2 + 0.5);
    G.taruh.tx = tx; G.taruh.ty = ty;
    var ok = bolehTaruh(0, G.taruh.tipe, tx, ty);
    c.globalAlpha = 0.55; gambarBangunan(c, G.taruh.tipe, 'id', tx * TS, ty * TS, d.w * TS, d.h * TS, { t: t }); c.globalAlpha = 1;
    for (var yy = ty; yy < ty + d.h; yy++) for (var xx = tx; xx < tx + d.w; xx++) {
      var bisa = tanahBisaBangun(xx, yy) && !G.blok[idx(xx, yy)] && !(G.rempah[idx(xx, yy)] > 0) && G.jelajah[idx(xx, yy)];
      c.fillStyle = ok && bisa ? 'rgba(120,230,120,0.28)' : 'rgba(240,80,60,0.38)'; c.fillRect(xx * TS + 1, yy * TS + 1, TS - 2, TS - 2);
    }
  }
  /* sasaran mortir */
  if (G.bidikMortir && G.mouse && G.mouse.dunia) { c.strokeStyle = 'rgba(255,110,80,0.9)'; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath(); c.arc(G.mouse.dunia.x, G.mouse.dunia.y, 3 * TS, 0, 7); c.stroke(); c.setLineDash([]); drawIcon('crosshair', G.mouse.dunia.x, G.mouse.dunia.y, 26, '#ff7a5a', 2); }
  c.restore();
  /* kotak seret */
  if (G.seret && G.seret.kotak) {
    var s = G.seret; c.strokeStyle = 'rgba(160,250,160,0.95)'; c.lineWidth = 1; c.fillStyle = 'rgba(160,250,160,0.08)';
    c.fillRect(Math.min(s.x0, s.x1), Math.min(s.y0, s.y1), Math.abs(s.x1 - s.x0), Math.abs(s.y1 - s.y0));
    c.strokeRect(Math.min(s.x0, s.x1) + 0.5, Math.min(s.y0, s.y1) + 0.5, Math.abs(s.x1 - s.x0), Math.abs(s.y1 - s.y0));
  }
  if (G.sisi[0].serbuT > 0) { c.fillStyle = 'rgba(215,39,46,' + (0.08 + Math.sin(G.waktuNyata * 6) * 0.04) + ')'; c.fillRect(0, 0, G.view.w, G.view.h); }
}

function bentukPesawat(c) { c.beginPath(); c.moveTo(22, 0); c.lineTo(10, -3); c.lineTo(4, -26); c.lineTo(-2, -26); c.lineTo(-2, -3); c.lineTo(-16, -3); c.lineTo(-20, -10); c.lineTo(-23, -10); c.lineTo(-21, 0); c.lineTo(-23, 10); c.lineTo(-20, 10); c.lineTo(-16, 3); c.lineTo(-2, 3); c.lineTo(-2, 26); c.lineTo(4, 26); c.lineTo(10, 3); c.closePath(); c.fill(); }

function bilahNyawa(c, e) {
  var w = e.k === 'bgn' ? e.w * TS - 8 : (e.jenis === 'inf' ? 16 : 26), x = e.k === 'bgn' ? e.tx * TS + 4 : e.x - w / 2, y = e.k === 'bgn' ? e.ty * TS - 14 - (e.h > 2 ? 10 : 4) : e.y - (e.jenis === 'inf' ? 13 : 19);
  var f = Math.max(0, e.hp / e.hpMaks);
  c.fillStyle = 'rgba(0,0,0,0.65)'; c.fillRect(x - 1, y - 1, w + 2, 5);
  c.fillStyle = f > 0.6 ? '#62c14a' : f > 0.3 ? '#e2c23a' : '#e04a32'; c.fillRect(x, y, w * f, 3);
  if (e.k === 'unit' && e.tipe === 'truk' && e.s === 0) { c.fillStyle = '#d2692a'; c.fillRect(x, y + 4, w * e.muat / KAP_TRUK, 2); }
  if (e.bunuh >= 3) { c.strokeStyle = '#e8c35a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + w + 2, y - 1); c.lineTo(x + w + 5, y + 2); c.lineTo(x + w + 8, y - 1); c.stroke(); }
}
function sikuPilihan(c, e) {
  var r = e.k === 'bgn' ? null : jariDari(e) + 5;
  var x0 = e.k === 'bgn' ? e.tx * TS : e.x - r, y0 = e.k === 'bgn' ? e.ty * TS - (e.h > 2 ? 18 : 10) : e.y - r, x1 = e.k === 'bgn' ? (e.tx + e.w) * TS : e.x + r, y1 = e.k === 'bgn' ? (e.ty + e.h) * TS : e.y + r, k = e.k === 'bgn' ? 8 : 4;
  c.strokeStyle = 'rgba(245,245,235,0.95)'; c.lineWidth = 1.3; c.beginPath();
  c.moveTo(x0, y0 + k); c.lineTo(x0, y0); c.lineTo(x0 + k, y0); c.moveTo(x1 - k, y0); c.lineTo(x1, y0); c.lineTo(x1, y0 + k);
  c.moveTo(x1, y1 - k); c.lineTo(x1, y1); c.lineTo(x1 - k, y1); c.moveTo(x0 + k, y1); c.lineTo(x0, y1); c.lineTo(x0, y1 - k); c.stroke();
  bilahNyawa(c, e);
}
