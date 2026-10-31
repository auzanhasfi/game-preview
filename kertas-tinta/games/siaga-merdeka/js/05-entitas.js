/* Siaga Merdeka: entitas (unit & bangunan), produksi, daya, panen rempah, gerak, tempur, dan langkah dunia. */
'use strict';

var KAP_TRUK = 400;

function buatSisi(s, fak, dana) {
  return { s: s, fak: fak, dana: dana, hasil: 0, pakai: 0, kurang: false,
    antri: { bgn: null, tahan: null, inf: [], kend: [] }, siap: { bgn: null, tahan: null },
    kuasa: { serbu: { isi: 0, buka: false }, mortir: { isi: 0, buka: false } }, serbuT: 0,
    stat: { dibuat: 0, hilang: 0, hancur: 0, dana: 0, bangunanHancur: 0 } };
}
function lawanDari(s) { return G.sisi[1 - s]; }

/* ---------- pembuatan ---------- */
function buatBangunan(s, tipe, tx, ty, instan) {
  var d = BANGUN[tipe], sisi = G.sisi[s];
  var e = { id: ++G.idBaru, k: 'bgn', s: s, tipe: tipe, fak: sisi.fak, tx: tx, ty: ty, w: d.w, h: d.h,
    x: (tx + d.w / 2) * TS, y: (ty + d.h / 2) * TS, hp: d.hp, hpMaks: d.hp, tumbuh: instan ? 1 : 0,
    tang: s === 0 ? -Math.PI / 4 : Math.PI * 0.75, cd: 0, target: 0, cariT: Math.random(), kenaT: 0, mundur: 0, lihat: d.lihat || 5, senjata: d.senjata || null, perbaiki: false, acak: Math.random() * 10 };
  for (var y = ty; y < ty + d.h; y++) for (var x = tx; x < tx + d.w; x++) G.blok[idx(x, y)] = e.id;
  G.ents.push(e); G.byId[e.id] = e;
  hitungDaya(sisi);
  if (d.gratis) {
    var p = pintuKeluar(e); var tr = buatUnit(s, d.gratis, p.x, p.y); tr.perintah = 'panen'; tr.fase = 'cari';
  }
  return e;
}

function buatUnit(s, tipe, x, y) {
  var d = UNIT[tipe], sisi = G.sisi[s];
  var e = { id: ++G.idBaru, k: 'unit', s: s, tipe: tipe, fak: sisi.fak, x: x, y: y, hp: d.hp, hpMaks: d.hp,
    ang: s === 0 ? -Math.PI / 2 : Math.PI / 2, tang: s === 0 ? -Math.PI / 2 : Math.PI / 2, jalur: [], perintah: 'diam', tujuan: null, target: 0,
    cd: Math.random() * 0.5, cariT: Math.random() * 0.4, repathT: 0, kenaT: 0, mundur: 0, langkah: 0, muat: 0, fase: null, timer: 0,
    senjata: nilaiFak(d.senjata, sisi.fak), jenis: d.jenis, lihat: d.lihat, laju: d.laju, bunuh: 0, diamT: 0, jagaX: x, jagaY: y, acak: Math.random() * 10 };
  G.ents.push(e); G.byId[e.id] = e;
  sisi.stat.dibuat++;
  return e;
}

function pintuKeluar(b) {
  var tx = b.tx + Math.floor(b.w / 2), ty = b.ty + b.h;
  var t = ubinBebasDekat(tx, ty) || { x: tx, y: ty };
  return { x: (t.x + 0.5) * TS, y: (t.y + 0.5) * TS, tx: t.x, ty: t.y };
}

/* ---------- daya dan syarat ---------- */
function hitungDaya(sisi) {
  var h = 0, p = 0;
  G.ents.forEach(function (e) {
    if (e.k !== 'bgn' || e.s !== sisi.s || e.mati) return;
    var dv = BANGUN[e.tipe].daya;
    if (dv > 0) h += e.tumbuh >= 1 ? dv * (0.5 + 0.5 * e.hp / e.hpMaks) : 0; else p -= dv;
  });
  sisi.hasil = Math.round(h); sisi.pakai = p; sisi.kurang = p > h;
}
function bangunanMilik(s, tipe) { for (var i = 0; i < G.ents.length; i++) { var e = G.ents[i]; if (e.k === 'bgn' && e.s === s && e.tipe === tipe && !e.mati && e.tumbuh >= 1) return e; } return null; }
function hitungMilik(s, tipe) { var n = 0; G.ents.forEach(function (e) { if (e.s === s && e.tipe === tipe && !e.mati) n++; }); return n; }

/* alasan tidak bisa membuat (string) atau '' jika boleh */
function alasanTolak(s, tipe) {
  var sisi = G.sisi[s], d = UNIT[tipe] || BANGUN[tipe];
  if (BANGUN[tipe]) { if (!bangunanMilik(s, 'hq')) return 'Butuh Markas Komando'; }
  else {
    if (d.hanyaMusuh && s === 0) return 'Tidak tersedia';
    if (!bangunanMilik(s, d.dari)) return 'Butuh ' + namaUnit(d.dari, sisi.fak);
    if (d.maks) { var ada = hitungMilik(s, tipe) + sisi.antri[d.jenis === 'inf' ? 'inf' : 'kend'].filter(function (q) { return q.tipe === tipe; }).length; if (ada >= d.maks) return 'Hanya boleh ' + d.maks; }
  }
  var butuh = d.butuh || [];
  for (var i = 0; i < butuh.length; i++) if (!bangunanMilik(s, butuh[i])) return 'Butuh ' + namaUnit(butuh[i], sisi.fak);
  return '';
}
function katDari(tipe) { if (BANGUN[tipe]) return BANGUN[tipe].kat; return UNIT[tipe].dari === 'barak' ? 'inf' : 'kend'; }

function mulaiBuat(s, tipe) {
  var sisi = G.sisi[s], kat = katDari(tipe);
  if (alasanTolak(s, tipe)) return false;
  var item = { tipe: tipe, biaya: biayaDari(tipe, sisi.fak), waktu: waktuBuat(tipe, sisi.fak), bayar: 0 };
  if (kat === 'bgn' || kat === 'tahan') { if (sisi.antri[kat] || sisi.siap[kat]) return false; sisi.antri[kat] = item; }
  else { if (sisi.antri[kat].length >= 9) return false; sisi.antri[kat].push(item); }
  return true;
}
function batalBuat(s, tipe) {
  var sisi = G.sisi[s], kat = katDari(tipe);
  if (kat === 'bgn' || kat === 'tahan') {
    if (sisi.siap[kat] === tipe) { sisi.siap[kat] = null; sisi.dana += biayaDari(tipe, sisi.fak); if (G.taruh && G.taruh.tipe === tipe) G.taruh = null; return true; }
    if (sisi.antri[kat] && sisi.antri[kat].tipe === tipe) { sisi.dana += sisi.antri[kat].bayar; sisi.antri[kat] = null; return true; }
  } else {
    var q = sisi.antri[kat];
    for (var i = q.length - 1; i >= 0; i--) if (q[i].tipe === tipe) { sisi.dana += q[i].bayar; q.splice(i, 1); return true; }
  }
  return false;
}

function langkahProduksi(sisi, dt) {
  var kali = (sisi.kurang ? 0.45 : 1) * (G.cepat || 1) * (sisi.s === 1 ? G.ai.kaliProduksi : 1);
  function maju(item) {
    var mau = item.biaya / item.waktu * dt * kali, bayar = Math.min(mau, item.biaya - item.bayar, Math.max(0, sisi.dana));
    sisi.dana -= bayar; item.bayar += bayar;
    return item.bayar >= item.biaya - 0.01;
  }
  ['bgn', 'tahan'].forEach(function (k) {
    var it = sisi.antri[k]; if (!it) return;
    if (alasanTolak(sisi.s, it.tipe)) return;
    if (maju(it)) { sisi.antri[k] = null; sisi.siap[k] = it.tipe; if (sisi.s === 0) { bunyi('selesai'); pesan('Konstruksi selesai: ' + namaUnit(it.tipe, sisi.fak), 'baik'); lapor('Konstruksi selesai'); } }
  });
  ['inf', 'kend'].forEach(function (k) {
    var it = sisi.antri[k][0]; if (!it) return;
    var d = UNIT[it.tipe], pabrik = pilihPabrik(sisi.s, d.dari); if (!pabrik) return;
    if (maju(it)) {
      sisi.antri[k].shift();
      var p = pintuKeluar(pabrik), u = buatUnit(sisi.s, it.tipe, p.x, p.y);
      if (u.tipe === 'truk') { u.perintah = 'panen'; u.fase = 'cari'; }
      else {
        var titik = pabrik.titikKumpul || { x: p.tx + (sisi.s === 0 ? 2 : -2), y: p.ty + (sisi.s === 0 ? 1 : 2) };
        perintahGerak(u, titik.x, titik.y, 'serbu');
      }
      if (sisi.s === 0) { bunyi('selesai'); lapor(d.jenis === 'inf' ? 'Pasukan siap' : 'Kendaraan siap'); }
      if (sisi.s === 1 && G.ai) G.ai.baru(u);
    }
  });
}
function pilihPabrik(s, tipe) {
  var pilihan = null;
  G.ents.forEach(function (e) { if (e.k === 'bgn' && e.s === s && e.tipe === tipe && !e.mati && e.tumbuh >= 1 && (!pilihan || e.utama)) pilihan = e; });
  return pilihan;
}

/* ---------- penempatan bangunan ---------- */
function bolehTaruh(s, tipe, tx, ty) {
  var d = BANGUN[tipe];
  for (var y = ty; y < ty + d.h; y++) for (var x = tx; x < tx + d.w; x++) {
    if (!tanahBisaBangun(x, y) || G.blok[idx(x, y)] || G.rempah[idx(x, y)] > 0) return false;
    if (s === 0 && !G.jelajah[idx(x, y)]) return false;
  }
  for (var i = 0; i < G.ents.length; i++) {
    var e = G.ents[i]; if (e.k !== 'unit' || e.mati) continue;
    var ux = Math.floor(e.x / TS), uy = Math.floor(e.y / TS);
    if (ux >= tx && ux < tx + d.w && uy >= ty && uy < ty + d.h) return false;
  }
  var jarak = d.tembok ? 6 : 4;
  for (var j = 0; j < G.ents.length; j++) {
    var b = G.ents[j]; if (b.k !== 'bgn' || b.s !== s || b.mati || b.tipe === 'karung') continue;
    var gx = Math.max(b.tx - tx - d.w + 1, tx - (b.tx + b.w - 1), 0), gy = Math.max(b.ty - ty - d.h + 1, ty - (b.ty + b.h - 1), 0);
    if (Math.max(gx, gy) <= jarak) return true;
  }
  return false;
}
function taruhBangunan(s, tipe, tx, ty) {
  var sisi = G.sisi[s];
  if (sisi.siap[BANGUN[tipe].kat] !== tipe || !bolehTaruh(s, tipe, tx, ty)) return false;
  sisi.siap[BANGUN[tipe].kat] = null;
  var b = buatBangunan(s, tipe, tx, ty, false);
  bunyi('taruh');
  for (var i = 0; i < 14; i++) partikel(b.x + (Math.random() - 0.5) * b.w * TS, b.y + b.h * TS / 2 - 4, (Math.random() - 0.5) * 40, -Math.random() * 30, 0.9, 'debu', 6 + Math.random() * 6);
  /* truk yang sedang menganggur ikut bekerja jika gudang baru dibangun */
  return true;
}

/* ---------- perintah ---------- */
function perintahGerak(u, tx, ty, jenis) {
  u.perintah = jenis || 'gerak'; u.target = 0; u.tujuan = { x: tx, y: ty }; u.fase = null;
  u.jalur = cariJalan(Math.floor(u.x / TS), Math.floor(u.y / TS), tx, ty);
  u.diamT = 0;
}
function perintahSerang(u, t) {
  if (!u.senjata) return;
  u.perintah = 'serang'; u.target = t.id; u.tujuan = null; u.repathT = 0; u.jalur = []; u.diamT = 0;
}
function perintahPanen(u, tx, ty) {
  if (!UNIT[u.tipe].panen) return;
  u.perintah = 'panen'; u.fase = 'cari'; u.target = 0; u.jalur = []; u.ladangX = tx; u.ladangY = ty;
}
/* sebar tujuan sekelompok unit agar tidak berebut satu ubin */
function perintahKelompok(units, tx, ty, jenis) {
  var terpakai = {};
  units.slice().sort(function (a, b) { return Math.hypot(a.x / TS - tx, a.y / TS - ty) - Math.hypot(b.x / TS - tx, b.y / TS - ty); })
    .forEach(function (u) {
      var t = units.length === 1 ? { x: tx, y: ty } : (ubinBebasDekat(tx, ty, terpakai) || { x: tx, y: ty });
      terpakai[idx(t.x, t.y)] = 1;
      if (UNIT[u.tipe].panen && G.rempah[idx(tx, ty)] > 0) perintahPanen(u, tx, ty);
      else perintahGerak(u, t.x, t.y, jenis);
    });
}

/* ---------- geometri bantu ---------- */
function jenisDari(e) { return e.k === 'bgn' ? 'bgn' : e.jenis; }
function jariDari(e) { return e.k === 'bgn' ? Math.max(e.w, e.h) * TS * 0.42 : (e.jenis === 'inf' ? 6 : 12); }
function jarakTepi(a, b) {
  if (b.k === 'bgn') { var dx = Math.max(b.tx * TS - a.x, 0, a.x - (b.tx + b.w) * TS), dy = Math.max(b.ty * TS - a.y, 0, a.y - (b.ty + b.h) * TS); return Math.hypot(dx, dy); }
  return Math.max(0, Math.hypot(a.x - b.x, a.y - b.y) - jariDari(b) * 0.5);
}
function terlihat(e) { if (e.s === 0) return true; var i = idx(Math.floor(e.x / TS), Math.floor(e.y / TS)); return e.k === 'bgn' ? !!G.jelajah[i] : !!G.vis[i]; }
function selisihSudut(a, b) { var d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
function putarKe(cur, tuju, laju) { var d = selisihSudut(cur, tuju); return Math.abs(d) <= laju ? tuju : cur + Math.sign(d) * laju; }

function cariMusuh(e, radius) {
  var w = SENJATA[e.senjata]; if (!w) return null;
  var terbaik = null, skor = 1e9;
  for (var i = 0; i < G.ents.length; i++) {
    var t = G.ents[i]; if (t.s === e.s || t.mati) continue;
    if (e.s === 0 && t.k === 'unit' && !G.vis[idx(Math.floor(t.x / TS), Math.floor(t.y / TS))]) continue;
    var d = jarakTepi(e, t); if (d > radius) continue;
    if (w.min && d < w.min * TS) continue;
    var vs = w.vs[jenisDari(t)] || 0.5, sk = d / TS * (1.6 - vs);
    if (t.k === 'bgn') sk += t.senjata ? 1 : (t.tipe === 'karung' ? 9 : 4);
    else if (!t.senjata) sk += 2;
    if (sk < skor) { skor = sk; terbaik = t; }
  }
  return terbaik;
}

/* ---------- tempur ---------- */
function tembak(src, tgt) {
  var w = SENJATA[src.senjata], sisi = G.sisi[src.s];
  var kali = (sisi.serbuT > 0 ? 1.5 : 1) * (src.bunuh >= 3 ? 1.25 : 1) * (src.s === 1 ? G.ai.kaliDmg : 1);
  var dmg = w.dmg * (w.vs[jenisDari(tgt)] || 1) * kali;
  var pj = src.k === 'bgn' ? 14 : (src.jenis === 'inf' ? 7 : 16), mx = src.x + Math.cos(src.tang) * pj, my = src.y + Math.sin(src.tang) * pj - (src.k === 'bgn' ? 6 : 0);
  var hx = tgt.x + (Math.random() - 0.5) * (tgt.k === 'bgn' ? tgt.w * 14 : 8), hy = tgt.y + (Math.random() - 0.5) * (tgt.k === 'bgn' ? tgt.h * 14 : 8);
  src.mundur = 1; src.kilat = 0.07;
  bunyi(w.bunyi, src.x, src.y);
  if (w.proj === 'tusuk') {
    lukai(tgt, dmg, src);
    if (src.senjata === 'peledak') ledakan(hx, hy, 1.4); else percik(hx, hy, '#e8e0c8', 4);
  } else if (w.proj === 'peluru') {
    G.jejak.push({ x0: mx, y0: my, x1: hx, y1: hy, t: 0.07, besar: !!w.besar });
    kilatMoncong(mx, my, src.tang, w.besar ? 1.2 : 0.6);
    lukai(tgt, dmg, src);
    if (w.besar) ledakan(hx, hy, 0.45); else percik(hx, hy, '#ffd27a', 3);
  } else {
    kilatMoncong(mx, my, src.tang, w.proj === 'lengkung' ? 1.8 : 1.3);
    var p = { x: mx, y: my, x0: mx, y0: my, tx: hx, ty: hy, target: tgt.id, laju: (w.laju || 10) * TS, dmg: dmg, w: w, s: src.s, src: src.id, jenis: w.proj, umur: 0 };
    if (w.proj === 'lengkung') {
      var sb = (w.sebar || 1) * TS * 0.6; p.tx += (Math.random() - 0.5) * sb; p.ty += (Math.random() - 0.5) * sb;
      p.durasi = Math.max(0.6, Math.hypot(p.tx - mx, p.ty - my) / p.laju); p.target = 0; p.dmg = w.dmg * kali;
    }
    G.proj.push(p);
  }
}

function langkahProyektil(dt) {
  for (var i = G.proj.length - 1; i >= 0; i--) {
    var p = G.proj[i]; p.umur += dt;
    var t = p.target ? G.byId[p.target] : null;
    if (t && !t.mati) { p.tx = t.x; p.ty = t.y; }
    var kena = false;
    if (p.jenis === 'lengkung') {
      var f = Math.min(1, p.umur / p.durasi);
      p.x = p.x0 + (p.tx - p.x0) * f; p.y = p.y0 + (p.ty - p.y0) * f; p.tinggi = Math.sin(f * Math.PI) * Math.min(160, p.durasi * 90);
      if (Math.random() < 0.6) partikel(p.x, p.y - p.tinggi, 0, 0, 0.5, 'asapTipis', 3);
      kena = f >= 1;
    } else {
      var dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy), s = p.laju * dt;
      p.sudut = Math.atan2(dy, dx);
      if (d <= s) { p.x = p.tx; p.y = p.ty; kena = true; } else { p.x += dx / d * s; p.y += dy / d * s; }
      if (p.jenis === 'roket') partikel(p.x, p.y, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, 0.6, 'asapTipis', 4);
      if (p.umur > 3) kena = true;
    }
    if (!kena) continue;
    G.proj.splice(i, 1);
    var src = G.byId[p.src] || { s: p.s, mati: true, x: p.x0, y: p.y0 };
    if (p.jenis === 'lengkung' || p.mortir) {
      var r = (p.w.sebar || 1.3) * TS;
      G.ents.forEach(function (e) {
        if (e.mati || e.s === p.s) return;
        var d = jarakTepi({ x: p.x, y: p.y }, e); if (d > r) return;
        lukai(e, p.dmg * (p.w.vs[jenisDari(e)] || 1) * (1 - d / r * 0.6), src);
      });
      ledakan(p.x, p.y, 1.2); bekasHangus(p.x, p.y, 22); getar(4);
    } else {
      if (t && !t.mati) lukai(t, p.dmg, src);
      ledakan(p.x, p.y, p.jenis === 'roket' ? 0.8 : 0.7);
    }
  }
}

function lukai(e, dmg, src) {
  if (e.mati) return;
  if (e.s === 0 && G.misiKebal) dmg *= 0.5;
  e.hp -= dmg; e.kenaT = 0.15;
  if (e.k === 'bgn' && e.tipe !== 'karung' && e.s === 0 && G.t - (G.akhirDiserang || -99) > 18) {
    G.akhirDiserang = G.t; G.titikSerang = { x: e.x, y: e.y };
    pesan('Pangkalan kita diserang! Tekan Spasi untuk melihat.', 'bahaya'); lapor('Pangkalan kita diserang'); bunyi('peringatan');
  }
  if (e.k === 'bgn' && e.s === 0) hitungDaya(G.sisi[0]);
  if (e.k === 'unit' && src && !src.mati && src.s !== e.s && e.senjata && !e.target && e.perintah !== 'gerak' && e.perintah !== 'panen') e.target = src.id;
  if (e.k === 'unit' && e.perintah === 'panen' && e.s === 1 && G.ai) G.ai.minta(e, src);
  if (e.hp <= 0) matikan(e, src);
}

function matikan(e, src) {
  if (e.mati) return;
  e.mati = true; e.hp = 0;
  var sisi = G.sisi[e.s];
  if (src && src.s != null && src.s !== e.s) { G.sisi[src.s].stat.hancur++; if (src.k === 'unit' && !src.mati) { src.bunuh++; if (src.bunuh === 3 && src.s === 0) pesan(namaUnit(src.tipe, src.fak) + ' naik pangkat menjadi veteran!', 'baik'); } }
  if (e.k === 'bgn') {
    for (var y = e.ty; y < e.ty + e.h; y++) for (var x = e.tx; x < e.tx + e.w; x++) G.blok[idx(x, y)] = 0;
    var n = e.w * e.h;
    for (var i = 0; i < Math.min(6, n + 1); i++) tunda(i * 0.14, (function (k) { return function () { ledakan(e.x + (Math.random() - 0.5) * e.w * TS * 0.8, e.y + (Math.random() - 0.5) * e.h * TS * 0.8, 1 + Math.random() * 0.6); }; })(i));
    tunda(0.3, function () { ledakanBesar(e.x, e.y, Math.max(e.w, e.h)); });
    puingBangunan(e);
    sisi.stat.bangunanHancur++;
    hitungDaya(sisi);
    if (e.s === 0) { pesan(namaUnit(e.tipe, e.fak) + ' hancur.', 'bahaya'); lapor('Bangunan hilang'); }
    else if (e.tipe === 'hq') { pesan('Markas musuh runtuh!', 'baik'); lapor('Markas musuh hancur'); }
  } else {
    sisi.stat.hilang++;
    if (e.jenis === 'inf') { bunyi('jatuh', e.x, e.y); G.gugur.push({ x: e.x, y: e.y, ang: e.ang, fak: e.fak, s: e.s, t: 3 }); for (var k = 0; k < 6; k++) partikel(e.x, e.y, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, 0.6, 'debu', 4); }
    else { ledakan(e.x, e.y, 1.3); bekasHangus(e.x, e.y, 20); G.bangkai.push({ x: e.x, y: e.y, ang: e.ang, t: 9, w: e.tipe }); getar(5); }
  }
  G.pilih = G.pilih.filter(function (p) { return p !== e; });
}

/* ---------- panen rempah ---------- */
function logikaTruk(u, dt) {
  switch (u.fase) {
    case 'cari': {
      if (u.muat >= KAP_TRUK) { u.fase = 'pulang'; break; }
      var bx = u.ladangX != null ? u.ladangX : Math.floor(u.x / TS), by = u.ladangY != null ? u.ladangY : Math.floor(u.y / TS);
      var t = cariRempah(bx, by, u);
      if (!t && u.ladangX != null) { u.ladangX = null; t = cariRempah(Math.floor(u.x / TS), Math.floor(u.y / TS), u); }
      if (t) { u.ubinPanen = t; u.ladangX = t.x; u.ladangY = t.y; u.jalur = cariJalan(Math.floor(u.x / TS), Math.floor(u.y / TS), t.x, t.y); u.fase = 'jalan'; }
      else if (u.muat > 0) u.fase = 'pulang';
      else { u.timer += dt; if (u.timer > 3) { u.timer = 0; } }
      break;
    }
    case 'jalan': {
      var t2 = u.ubinPanen;
      if (G.rempah[idx(t2.x, t2.y)] <= 1) { u.fase = 'cari'; break; }
      if (!u.jalur.length) {
        if (Math.floor(u.x / TS) === t2.x && Math.floor(u.y / TS) === t2.y) { u.fase = 'ambil'; u.timer = 0; }
        else if (Math.hypot((t2.x + 0.5) * TS - u.x, (t2.y + 0.5) * TS - u.y) < TS * 1.5) { u.jalur = [{ x: t2.x, y: t2.y }]; }
        else u.fase = 'cari';
      }
      break;
    }
    case 'ambil': {
      u.timer += dt;
      var i = idx(u.ubinPanen.x, u.ubinPanen.y);
      if (u.timer >= 0.3) {
        u.timer = 0; var ambil = Math.min(25, G.rempah[i], KAP_TRUK - u.muat); G.rempah[i] -= ambil; u.muat += ambil;
        if (terlihatLayar(u)) partikel(u.x + (Math.random() - 0.5) * 16, u.y + 6, (Math.random() - 0.5) * 20, -20, 0.6, 'rempah', 3);
      }
      if (u.muat >= KAP_TRUK) u.fase = 'pulang'; else if (G.rempah[i] <= 1) u.fase = 'cari';
      break;
    }
    case 'pulang': {
      var g = null, dTerbaik = 1e9;
      G.ents.forEach(function (e) { if (e.k === 'bgn' && e.s === u.s && e.tipe === 'gudang' && !e.mati && e.tumbuh >= 1) { var d = Math.hypot(e.x - u.x, e.y - u.y); if (d < dTerbaik) { dTerbaik = d; g = e; } } });
      if (!g) { u.timer += dt; break; }
      var p = pintuKeluar(g); u.gudang = g.id; u.dok = p;
      u.jalur = cariJalan(Math.floor(u.x / TS), Math.floor(u.y / TS), p.tx, p.ty); u.fase = 'kePulang';
      break;
    }
    case 'kePulang': {
      var g2 = G.byId[u.gudang]; if (!g2 || g2.mati) { u.fase = 'pulang'; break; }
      if (!u.jalur.length) { if (Math.hypot(u.dok.x - u.x, u.dok.y - u.y) < TS * 1.2) { u.fase = 'bongkar'; u.timer = 0; } else u.fase = 'pulang'; }
      break;
    }
    case 'bongkar': {
      u.timer += dt; u.ang = putarKe(u.ang, -Math.PI / 2, dt * 4);
      if (u.timer >= 0.2) {
        u.timer = 0; var v = Math.min(50, u.muat); u.muat -= v;
        var sisi = G.sisi[u.s], dapat = v * (u.s === 1 ? G.ai.kaliPanen : 1);
        sisi.dana += dapat; sisi.stat.dana += dapat;
        if (u.s === 0 && u.muat <= 0) bunyi('uang');
      }
      if (u.muat <= 0) u.fase = 'cari';
      break;
    }
  }
}
function cariRempah(bx, by, u) {
  var terbaik = null, skor = 1e9;
  for (var r = 0; r <= 26; r++) {
    for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
      if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
      var x = bx + dx, y = by + dy; if (!dalamPeta(x, y)) continue;
      var i = idx(x, y); if (G.rempah[i] <= 20 || !bisaLewat(x, y)) continue;
      var dipakai = 0; G.ents.forEach(function (o) { if (o !== u && o.tipe === 'truk' && o.ubinPanen && o.ubinPanen.x === x && o.ubinPanen.y === y && (o.fase === 'jalan' || o.fase === 'ambil')) dipakai = 1; });
      var sk = Math.hypot(dx, dy) + dipakai * 6; if (sk < skor) { skor = sk; terbaik = { x: x, y: y }; }
    }
    if (terbaik && r > skor + 1) break;
  }
  return terbaik;
}
function langkahRempah(dt) {
  G.tumbuhT = (G.tumbuhT || 0) + dt; if (G.tumbuhT < 2) return; G.tumbuhT = 0;
  for (var i = 0; i < G.rempah.length; i++) if (G.rempahMaks[i] > 0 && G.rempah[i] < G.rempahMaks[i]) G.rempah[i] = Math.min(G.rempahMaks[i], G.rempah[i] + 2.5);
}

/* ---------- gerak ---------- */
function gerak(u, dt) {
  if (!u.jalur.length) { u.bergerak = false; return true; }
  var n = u.jalur[0], tx = (n.x + 0.5) * TS, ty = (n.y + 0.5) * TS, dx = tx - u.x, dy = ty - u.y, d = Math.hypot(dx, dy);
  if (d < 3) { u.jalur.shift(); if (!u.jalur.length) { u.bergerak = false; return true; } return false; }
  var sisi = G.sisi[u.s], laju = u.laju * TS * (sisi.serbuT > 0 ? 1.3 : 1) * (G.tanah[idx(Math.floor(u.x / TS), Math.floor(u.y / TS))] === T_JALAN ? 1.2 : 1);
  var a = Math.atan2(dy, dx);
  if (u.jenis === 'inf') u.ang = a;
  else {
    u.ang = putarKe(u.ang, a, dt * 4.5);
    var beda = Math.abs(selisihSudut(u.ang, a)); laju *= beda > 1.1 ? 0.1 : 1 - beda * 0.55;
    if (!u.target) u.tang = putarKe(u.tang, u.ang, dt * 4);
  }
  var s = Math.min(laju * dt, d), nx = u.x + dx / d * s, ny = u.y + dy / d * s;
  if (!bisaLewat(Math.floor(nx / TS), Math.floor(ny / TS))) {
    var akhir = u.jalur[u.jalur.length - 1];
    u.jalur = cariJalan(Math.floor(u.x / TS), Math.floor(u.y / TS), akhir.x, akhir.y);
    return false;
  }
  u.x = nx; u.y = ny; u.bergerak = true; u.langkah += s;
  if (u.jenis !== 'inf' && Math.random() < dt * 6 && terlihatLayar(u)) partikel(u.x - Math.cos(u.ang) * 12, u.y - Math.sin(u.ang) * 12, 0, 0, 0.7, 'debu', 4);
  return false;
}

/* dorong unit yang bertumpuk agar terpisah */
function pisahkanUnit() {
  var ember = {}, us = [];
  G.ents.forEach(function (e) { if (e.k !== 'unit' || e.mati) return; var k = Math.floor(e.x / 48) + ',' + Math.floor(e.y / 48); (ember[k] || (ember[k] = [])).push(e); us.push(e); });
  us.forEach(function (a) {
    var bx = Math.floor(a.x / 48), by = Math.floor(a.y / 48);
    for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) {
      var l = ember[(bx + ox) + ',' + (by + oy)]; if (!l) continue;
      for (var i = 0; i < l.length; i++) {
        var b = l[i]; if (b.id <= a.id) continue;
        var ra = jariDari(a), rb = jariDari(b), dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), min = ra + rb;
        if (d < 0.5) { var acakA = (a.id * 2.399) % 6.283; dx = Math.cos(acakA); dy = Math.sin(acakA); d = 1; }
        if (d >= min) continue;
        var dorong = (min - d) * 0.35, ka = a.bergerak && !b.bergerak ? 0.25 : 0.5, kb = 1 - ka;
        geserAman(a, -dx / d * dorong * ka * 2, -dy / d * dorong * ka * 2);
        geserAman(b, dx / d * dorong * kb * 2, dy / d * dorong * kb * 2);
      }
    }
  });
}
function geserAman(u, dx, dy) { var nx = u.x + dx, ny = u.y + dy; if (bisaLewat(Math.floor(nx / TS), Math.floor(ny / TS))) { u.x = nx; u.y = ny; } }

/* ---------- pembaruan per entitas ---------- */
function perbaruiUnit(u, dt) {
  var d = UNIT[u.tipe];
  u.cd -= dt; u.kenaT -= dt; u.mundur = Math.max(0, u.mundur - dt * 5); u.kilat -= dt;
  if (!u.bergerak && !u.target) u.diamT += dt; else u.diamT = 0;
  if (d.sembuh && u.hp < u.hpMaks && u.diamT > 2) u.hp = Math.min(u.hpMaks, u.hp + d.sembuh * dt);
  if (u.perintah === 'panen') { logikaTruk(u, dt); gerak(u, dt); return; }
  var tgt = u.target ? G.byId[u.target] : null;
  if (tgt && tgt.mati) { tgt = null; u.target = 0; if (u.perintah === 'serang') { u.perintah = 'diam'; u.jagaX = u.x; u.jagaY = u.y; } }
  if (tgt && u.s === 0 && tgt.k === 'unit' && !terlihat(tgt) && u.perintah !== 'serang') { tgt = null; u.target = 0; }
  if (!tgt && u.senjata && u.perintah !== 'gerak') {
    u.cariT -= dt;
    if (u.cariT <= 0) {
      u.cariT = 0.35 + Math.random() * 0.25;
      var w = SENJATA[u.senjata], rad = (u.perintah === 'diam' ? Math.max(w.jarak + 1.5, u.lihat) : u.lihat) * TS;
      var m = cariMusuh(u, rad); if (m) { u.target = m.id; tgt = m; u.repathT = 0; }
    }
  }
  if (tgt) {
    var w2 = SENJATA[u.senjata], dist = jarakTepi(u, tgt), a = Math.atan2(tgt.y - u.y, tgt.x - u.x);
    if (dist <= w2.jarak * TS) {
      u.jalur = []; u.bergerak = false;
      if (u.jenis === 'inf') { u.ang = a; u.tang = a; } else u.tang = putarKe(u.tang, a, dt * 5);
      if (u.cd <= 0 && Math.abs(selisihSudut(u.tang, a)) < 0.25) { u.cd = w2.rof * (0.9 + Math.random() * 0.2); tembak(u, tgt); }
    } else {
      if (u.perintah === 'diam' && Math.hypot(u.x - u.jagaX, u.y - u.jagaY) > 8 * TS) {
        u.target = 0; u.jalur = cariJalan(Math.floor(u.x / TS), Math.floor(u.y / TS), Math.floor(u.jagaX / TS), Math.floor(u.jagaY / TS)); u.perintah = 'kembali';
      } else {
        u.repathT -= dt;
        if (u.repathT <= 0 || !u.jalur.length) { u.repathT = 0.8 + Math.random() * 0.5; u.jalur = cariJalan(Math.floor(u.x / TS), Math.floor(u.y / TS), Math.floor(tgt.x / TS), Math.floor(tgt.y / TS)); }
        gerak(u, dt);
      }
    }
    return;
  }
  var sampai = gerak(u, dt);
  if (sampai) {
    if (u.perintah === 'serbu' && u.tujuan && Math.hypot(u.x / TS - u.tujuan.x - 0.5, u.y / TS - u.tujuan.y - 0.5) > 2.5) {
      u.repathT -= dt; if (u.repathT <= 0) { u.repathT = 1.5; u.jalur = cariJalan(Math.floor(u.x / TS), Math.floor(u.y / TS), u.tujuan.x, u.tujuan.y); }
    } else if (u.perintah !== 'diam') { u.perintah = 'diam'; u.jagaX = u.x; u.jagaY = u.y; }
  }
}

function perbaruiBangunan(b, dt) {
  var d = BANGUN[b.tipe], sisi = G.sisi[b.s];
  b.kenaT -= dt; b.mundur = Math.max(0, b.mundur - dt * 4); b.kilat -= dt;
  if (b.tumbuh < 1) { b.tumbuh = Math.min(1, b.tumbuh + dt / 1.1); if (b.tumbuh >= 1) hitungDaya(sisi); return; }
  if (b.perbaiki) {
    var biaya = d.biaya * 0.25 * dt / 12, tambah = b.hpMaks * dt / 12;
    if (b.hp >= b.hpMaks || sisi.dana < biaya) b.perbaiki = false;
    else { sisi.dana -= biaya; b.hp = Math.min(b.hpMaks, b.hp + tambah); if (Math.random() < dt * 4) partikel(b.x + (Math.random() - 0.5) * b.w * 20, b.y - 10, 0, -20, 0.5, 'kunci', 3); }
  }
  if (b.hp < b.hpMaks * 0.5 && Math.random() < dt * (b.hp < b.hpMaks * 0.25 ? 9 : 4)) {
    var px = b.x + (Math.random() - 0.5) * b.w * TS * 0.6, py = b.y + (Math.random() - 0.5) * b.h * TS * 0.6 - 8;
    partikel(px, py, 4, -18, 2.2, 'asap', 8 + Math.random() * 8);
    if (b.hp < b.hpMaks * 0.3) partikel(px, py, 0, -25, 0.45, 'api', 5 + Math.random() * 4);
  }
  if (b.tipe === 'daya' && !sisi.kurang && Math.random() < dt * 2.5) partikel(b.x + 8, b.y - 26, 6, -14, 2.4, 'asapPutih', 6);
  if (!b.senjata) return;
  if (d.listrik && sisi.kurang) return;
  b.cd -= dt;
  var tgt = b.target ? G.byId[b.target] : null, w = SENJATA[b.senjata];
  if (tgt && (tgt.mati || jarakTepi(b, tgt) > w.jarak * TS)) { tgt = null; b.target = 0; }
  if (!tgt) { b.cariT -= dt; if (b.cariT <= 0) { b.cariT = 0.3; var m = cariMusuh(b, w.jarak * TS); if (m) { b.target = m.id; tgt = m; } } }
  if (!tgt) { b.tang += dt * 0.25; return; }
  var a = Math.atan2(tgt.y - b.y, tgt.x - b.x); b.tang = putarKe(b.tang, a, dt * 4);
  if (b.cd <= 0 && Math.abs(selisihSudut(b.tang, a)) < 0.2) { b.cd = w.rof; tembak(b, tgt); }
}

/* ---------- jual & perbaiki ---------- */
function jualBangunan(b) {
  if (b.mati || b.s !== 0 || b.tipe === 'hq' && hitungMilik(0, 'hq') <= 1 && false) return;
  var sisi = G.sisi[b.s], uang = Math.round(BANGUN[b.tipe].biaya * 0.5 * b.hp / b.hpMaks);
  sisi.dana += uang; bunyi('uang');
  b.mati = true;
  for (var y = b.ty; y < b.ty + b.h; y++) for (var x = b.tx; x < b.tx + b.w; x++) G.blok[idx(x, y)] = 0;
  var jumlah = b.tipe === 'karung' ? 0 : Math.min(3, Math.ceil(b.w * b.h / 3));
  for (var i = 0; i < jumlah; i++) { var u = buatUnit(b.s, 'inf1', b.x + (i - 1) * 10, b.y + b.h * TS / 2 - 6); u.jagaX = u.x; u.jagaY = u.y; }
  for (var k = 0; k < 16; k++) partikel(b.x + (Math.random() - 0.5) * b.w * TS, b.y + (Math.random() - 0.5) * b.h * TS, (Math.random() - 0.5) * 30, -Math.random() * 30, 1, 'debu', 8);
  hitungDaya(sisi);
  pesan('Dijual: +' + angkaID(uang) + ' Dana', 'baik');
  G.pilih = G.pilih.filter(function (p) { return p !== b; });
}

/* ---------- penglihatan pemain (kabut perang) ---------- */
function hitungLihat() {
  G.vis.fill(0);
  var mw = G.mw;
  G.ents.forEach(function (e) {
    if (e.s !== 0 || e.mati) return;
    var r = e.lihat, cx = e.x / TS, cy = e.y / TS;
    for (var y = Math.max(0, Math.floor(cy - r)); y <= Math.min(G.mh - 1, Math.ceil(cy + r)); y++)
      for (var x = Math.max(0, Math.floor(cx - r)); x <= Math.min(mw - 1, Math.ceil(cx + r)); x++)
        if ((x + 0.5 - cx) * (x + 0.5 - cx) + (y + 0.5 - cy) * (y + 0.5 - cy) <= r * r) { var i = y * mw + x; G.vis[i] = 1; G.jelajah[i] = 1; }
  });
}

/* ---------- penundaan kejadian ---------- */
function tunda(detik, fn) { G.tundaan.push({ t: detik, fn: fn }); }

/* ---------- satu langkah dunia (dt tetap) ---------- */
function langkahDunia(dt) {
  G.t += dt;
  for (var i = G.tundaan.length - 1; i >= 0; i--) { var td = G.tundaan[i]; td.t -= dt; if (td.t <= 0) { G.tundaan.splice(i, 1); td.fn(); } }
  G.sisi.forEach(function (sisi) {
    langkahProduksi(sisi, dt);
    if (sisi.serbuT > 0) sisi.serbuT -= dt;
  });
  for (var j = 0; j < G.ents.length; j++) { var e = G.ents[j]; if (e.mati) continue; if (e.k === 'unit') perbaruiUnit(e, dt); else perbaruiBangunan(e, dt); }
  pisahkanUnit();
  langkahProyektil(dt);
  langkahRempah(dt);
  if (G.ents.some(function (e) { return e.mati; })) {
    G.ents = G.ents.filter(function (e) { if (e.mati) delete G.byId[e.id]; return !e.mati; });
  }
  G.lihatT -= dt; if (G.lihatT <= 0) { G.lihatT = 0.2; hitungLihat(); }
  if (G.ai) G.ai.langkah(dt);
  langkahKuasa(dt);
  langkahMisi(dt);
}
