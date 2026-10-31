/* Siaga Merdeka: lawan komputer (pangkalan awal, produksi, gelombang serangan, pendaratan, serangan udara). */
'use strict';

var TATA_MUSUH = [
  ['hq', -1, -1], ['daya', 3, -1], ['daya', 3, 2], ['barak', -4, -3], ['gudang', -4, 3], ['bengkel', 0, 3], ['radar', 3, -4],
  ['bunker', -7, 3], ['bunker', -3, 7], ['siasat', -1, -4, 1], ['meriam', -6, 6, 1], ['meriam', 1, 7, 1], ['daya', 5, 1, 1], ['bunker', -7, -1, 2], ['meriam', -5, 9, 2]
];

function siapkanPangkalanMusuh(lvl) {
  var E = G.pangkalan[1];
  TATA_MUSUH.forEach(function (t) {
    if ((t[3] || 0) > lvl) return;
    var d = BANGUN[t[0]], tx = E.x + t[1], ty = E.y + t[2];
    for (var y = ty - 1; y <= ty + d.h; y++) for (var x = tx - 1; x <= tx + d.w; x++) if (dalamPeta(x, y) && G.tanah[idx(x, y)] !== T_JALAN) { G.tanah[idx(x, y)] = T_TANAH; G.rempah[idx(x, y)] = 0; G.rempahMaks[idx(x, y)] = 0; }
    buatBangunan(1, t[0], tx, ty, true);
  });
  for (var i = 0; i < 2 + lvl; i++) buatUnit(1, 'inf2', (E.x - 3 + i) * TS, (E.y + 2) * TS);
  buatUnit(1, 'tank', (E.x - 2) * TS, (E.y + 1) * TS);
}

function buatAI(cfg) {
  var lvl = cfg.lvl;
  var ai = {
    lvl: lvl,
    kaliProduksi: [0.55, 0.8, 1.05][lvl], kaliDmg: [0.8, 1, 1.12][lvl], kaliPanen: [1, 1.15, 1.35][lvl],
    pendapatan: [3, 6, 10][lvl] * (cfg.kaliDana || 1), batas: [7, 11, 16][lvl], batasTambah: [1, 2, 3][lvl],
    gelombangT: cfg.jedaAwal != null ? cfg.jedaAwal : [170, 120, 85][lvl],
    jeda: [100, 80, 60][lvl] * (cfg.kaliJeda || 1),
    ukuran: [4, 6, 8][lvl], tambah: [1, 1, 2][lvl],
    pikirT: 0, pendaratanT: cfg.pendaratan ? cfg.pendaratan : 0, pesawatT: cfg.pesawat || 0, banzaiT: cfg.banzai || 0,
    gelombang: 0, cfg: cfg,
    baru: function (u) { u.kumpul = true; },
    minta: function (truk, src) {
      if (!src || src.mati || G.t - (ai.mintaT || 0) < 6) return; ai.mintaT = G.t;
      var pembela = G.ents.filter(function (e) { return e.s === 1 && e.k === 'unit' && !e.mati && e.senjata && e.kumpul && Math.hypot(e.x - truk.x, e.y - truk.y) < 18 * TS; }).slice(0, 4);
      pembela.forEach(function (e) { perintahSerang(e, src); });
    },
    langkah: function (dt) { langkahAI(ai, dt); }
  };
  return ai;
}

function pasukanAI(hanyaKumpul) {
  return G.ents.filter(function (e) { return e.s === 1 && e.k === 'unit' && !e.mati && e.senjata && (!hanyaKumpul || e.kumpul); });
}
function targetSerbu() {
  var E = G.pangkalan[1], kandidat = G.ents.filter(function (e) { return e.s === 0 && !e.mati && e.tipe !== 'karung'; });
  if (!kandidat.length) return null;
  kandidat.sort(function (a, b) { return (Math.hypot(a.x - E.x * TS, a.y - E.y * TS) + (a.k === 'bgn' ? 0 : 300)) - (Math.hypot(b.x - E.x * TS, b.y - E.y * TS) + (b.k === 'bgn' ? 0 : 300)); });
  return kandidat[Math.min(kandidat.length - 1, acak(3))];
}

function langkahAI(ai, dt) {
  var sisi = G.sisi[1];
  if (!bangunanMilik(1, 'hq') && !G.ents.some(function (e) { return e.s === 1 && e.k === 'bgn' && !e.mati; })) return;
  sisi.dana += ai.pendapatan * dt;
  ai.pikirT -= dt;
  if (ai.pikirT <= 0) {
    ai.pikirT = 1;
    /* produksi */
    if (bangunanMilik(1, 'bengkel') && bangunanMilik(1, 'gudang') && hitungMilik(1, 'truk') + sisi.antri.kend.filter(function (q) { return q.tipe === 'truk'; }).length < 2) mulaiBuat(1, 'truk');
    var tentara = pasukanAI(false).length, batas = ai.batas + ai.gelombang * ai.batasTambah;
    if (sisi.antri.inf.length < 1 && sisi.dana > 200 && tentara < batas) {
      var r = Math.random(), t = r < 0.38 ? 'inf1' : r < 0.75 ? 'inf2' : 'at';
      mulaiBuat(1, t);
    }
    if (sisi.antri.kend.length < 1 && sisi.dana > 600 && G.t > 45 && tentara < batas) {
      var r2 = Math.random(), t2 = r2 < 0.3 ? 'ringan' : r2 < 0.75 ? 'tank' : r2 < 0.9 ? 'arty' : 'berat';
      if (alasanTolak(1, t2)) t2 = 'tank';
      mulaiBuat(1, t2);
    }
    /* bangunan yang selesai langsung ditaruh di dekat markas */
    ['bgn', 'tahan'].forEach(function (k) { if (sisi.siap[k]) aiTaruh(sisi.siap[k]); });
    if (!sisi.antri.bgn && !sisi.siap.bgn && sisi.dana > 1200) { if (sisi.kurang) mulaiBuat(1, 'daya'); else if (!bangunanMilik(1, 'barak')) mulaiBuat(1, 'barak'); else if (!bangunanMilik(1, 'bengkel')) mulaiBuat(1, 'bengkel'); }
    if (!sisi.antri.tahan && !sisi.siap.tahan && sisi.dana > 1500 && hitungMilik(1, 'bunker') + hitungMilik(1, 'meriam') < 3 + ai.lvl * 2) mulaiBuat(1, Math.random() < 0.5 ? 'bunker' : 'meriam');
    /* bertahan: musuh di dekat pangkalan */
    var E = G.pangkalan[1], penyusup = G.ents.find(function (e) { return e.s === 0 && !e.mati && e.k === 'unit' && Math.hypot(e.x / TS - E.x, e.y / TS - E.y) < 13; });
    if (penyusup) pasukanAI(true).forEach(function (u) { if (!u.target && Math.hypot(u.x - penyusup.x, u.y - penyusup.y) < 16 * TS) perintahSerang(u, penyusup); });
    /* gelombang serangan */
    var siap = pasukanAI(true);
    if (G.t >= ai.gelombangT && siap.length >= Math.min(ai.ukuran, 4 + ai.gelombang)) kirimGelombang(siap, ai);
    else if (G.t >= ai.gelombangT + 60 && siap.length >= 3) kirimGelombang(siap, ai);
  }
  if (ai.pendaratanT && G.t >= ai.pendaratanT) { ai.pendaratanT = G.t + (ai.cfg.jedaPendaratan || 75); pendaratan(ai); }
  if (ai.pesawatT && G.t >= ai.pesawatT) { ai.pesawatT = G.t + (ai.cfg.jedaPesawat || 150); seranganUdara(); }
  if (ai.banzaiT && G.t >= ai.banzaiT) { ai.banzaiT = G.t + (ai.cfg.jedaBanzai || 140); serbuanBanzai(ai); }
}

function aiTaruh(tipe) {
  var E = G.pangkalan[1], d = BANGUN[tipe];
  for (var r = 3; r < 14; r++) for (var k = 0; k < 24; k++) {
    var a = Math.random() * Math.PI * 2, tx = Math.round(E.x + Math.cos(a) * r - d.w / 2), ty = Math.round(E.y + Math.sin(a) * r - d.h / 2);
    if (d.kat === 'tahan' && (tx > E.x || ty < E.y - 2)) continue;
    if (!dalamPeta(tx, ty) || !dalamPeta(tx + d.w, ty + d.h)) continue;
    var ok = true;
    for (var y = ty - 1; y <= ty + d.h && ok; y++) for (var x = tx - 1; x <= tx + d.w; x++) if (!dalamPeta(x, y) || G.blok[idx(x, y)] || !tanahBisaBangun(x, y) || G.rempah[idx(x, y)] > 0) { ok = false; break; }
    if (ok && bolehTaruh(1, tipe, tx, ty)) { taruhBangunan(1, tipe, tx, ty); return; }
  }
}

function kirimGelombang(pasukan, ai) {
  var tgt = targetSerbu(); if (!tgt) return;
  ai.gelombang++; ai.gelombangT = G.t + ai.jeda; pasukan = pasukan.slice(0, ai.ukuran); ai.ukuran += ai.tambah;
  pasukan.forEach(function (u) { u.kumpul = false; });
  perintahKelompok(pasukan, Math.floor(tgt.x / TS), Math.floor(tgt.y / TS), 'serbu');
  if (ai.gelombang === 1) pesan('Pengintai melaporkan pasukan ' + G.misi.namaMusuh + ' mulai bergerak!', 'bahaya');
}

/* pasukan datang dari tepi peta (pendaratan dari laut / bala bantuan) */
function pendaratan(ai) {
  var jumlah = 3 + ai.lvl + Math.min(5, Math.floor(G.t / 120)), x0 = G.mw - 3, y0 = 4 + acak(10), unit = [];
  for (var i = 0; i < jumlah; i++) {
    var r = Math.random(), t = r < 0.35 ? 'inf1' : r < 0.6 ? 'inf2' : r < 0.75 ? 'at' : r < 0.92 ? 'tank' : 'ringan';
    var ub = ubinBebasDekat(x0 - (i % 3), y0 + Math.floor(i / 3)); if (!ub) continue;
    unit.push(buatUnit(1, t, (ub.x + 0.5) * TS, (ub.y + 0.5) * TS));
  }
  var tgt = targetSerbu(); if (tgt) perintahKelompok(unit, Math.floor(tgt.x / TS), Math.floor(tgt.y / TS), 'serbu');
  pesan('Bala bantuan ' + G.misi.namaMusuh + ' mendarat di timur laut!', 'bahaya'); bunyi('peringatan');
}

function serbuanBanzai(ai) {
  var unit = [], P = G.pangkalan[0];
  for (var i = 0; i < 5 + ai.lvl * 2; i++) { var ub = ubinBebasDekat(G.mw - 4 - (i % 3), 3 + Math.floor(i / 3)); if (ub) unit.push(buatUnit(1, 'inf1', (ub.x + 0.5) * TS, (ub.y + 0.5) * TS)); }
  unit.forEach(function (u) { u.laju *= 1.25; });
  perintahKelompok(unit, P.x + 2, P.y - 2, 'serbu');
  pesan('Serbuan infanteri Jepang menuju pangkalan kita!', 'bahaya'); bunyi('peringatan');
}

/* pesawat musuh menyeberang dan menjatuhkan bom di garis lurus */
function seranganUdara() {
  var sasaran = G.ents.filter(function (e) { return e.s === 0 && e.k === 'bgn' && !e.mati; });
  if (!sasaran.length) return;
  var t = pilihAcak(sasaran), x0 = G.mw * TS + 100, y0 = t.y - (G.mw * TS + 100 - t.x) * 0.55;
  var a = Math.atan2(t.y - y0, t.x - x0);
  G.pesawat.push({ x: x0, y: y0, a: a, laju: 300, bom: 6, tx: t.x, ty: t.y, jatuhT: 0 });
  pesan('Pesawat pembom musuh terlihat! Lindungi pangkalan.', 'bahaya'); lapor('Awas serangan udara'); bunyi('pesawat');
}
function langkahPesawat(dt) {
  for (var i = G.pesawat.length - 1; i >= 0; i--) {
    var p = G.pesawat[i]; p.x += Math.cos(p.a) * p.laju * dt; p.y += Math.sin(p.a) * p.laju * dt;
    var d = Math.hypot(p.tx - p.x, p.ty - p.y);
    if (p.bom > 0 && d < 110) {
      p.jatuhT -= dt;
      if (p.jatuhT <= 0) {
        p.jatuhT = 0.11; p.bom--;
        G.proj.push({ x: p.x, y: p.y, x0: p.x, y0: p.y, tx: p.x + Math.cos(p.a) * 30, ty: p.y + Math.sin(p.a) * 30, laju: 60, dmg: 130, w: SENJATA.artileri, s: 1, src: 0, jenis: 'lengkung', durasi: 0.55, umur: 0, target: 0, bom: true });
        bunyi('peluit', p.x, p.y);
      }
    }
    if (p.x < -200 || p.y > G.mh * TS + 300 || p.y < -400) G.pesawat.splice(i, 1);
  }
}
