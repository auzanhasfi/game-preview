/* Siaga Merdeka: daftar misi kampanye, memulai pertempuran, tujuan, menang/kalah, dan laporan. */
'use strict';

var MISI = [
  { id: 'semarang', judul: 'Pertempuran Lima Hari', tempat: 'Semarang', tahun: '15–19 Oktober 1945', pelajaran: 'semarang', topik: 'semarang', musuh: 'jp', namaMusuh: 'Tentara Jepang', benih: 1945, dana: 4500, tingkat: 0,
    ai: { lvl: 0, jedaAwal: 210 }, tujuan: { tipe: 'hq' }, awal: { bgn: ['daya'], unit: ['inf1', 'inf1', 'inf1', 'inf2', 'inf2'] },
    ringkas: 'Pemuda dan TKR melucuti senjata tentara Jepang di Semarang. Hancurkan markas Jepang di timur laut.',
    petunjuk: [[6, 'Bangun Gudang Rempah dulu. Truk Rempah gratis akan memanen ladang oranye dan mengubahnya jadi Dana.'], [45, 'Latih prajurit di Barak. Laskar Bambu Runcing murah dan cepat, Penembak TKR menembak dari jauh.'], [100, 'Bengkel Kendaraan membuka Panser dan Tank Rampasan. Regu Granat Tangan ampuh melawan tank Jepang.'], [160, 'Tip: tekan Q untuk memilih semua pasukan, lalu klik markas musuh untuk menyerang.']] },
  { id: 'surabaya', judul: 'Arek-arek Suroboyo', tempat: 'Surabaya', tahun: '10 November 1945', pelajaran: 'surabaya', topik: 'surabaya', musuh: 'nl', namaMusuh: 'Sekutu & NICA', benih: 1110, dana: 5000, tingkat: 0,
    ai: { lvl: 0, jedaAwal: 160, pendaratan: 100, jedaPendaratan: 85 }, tujuan: { tipe: 'tahan', detik: 420 }, awal: { bgn: ['daya', 'barak'], unit: ['inf1', 'inf1', 'inf1', 'inf1', 'inf2', 'inf2', 'inf2', 'at', 'at'] },
    ringkas: 'Ultimatum Sekutu ditolak. Pasukan mendarat dari laut. Pertahankan Surabaya selama 7 menit.',
    petunjuk: [[6, 'Musuh akan mendarat dari timur laut. Bangun Sarang Senapan dan Meriam Benteng di jalan masuk.'], [50, 'Karung Pasir murah untuk menutup jalan dan memperlambat musuh.'], [120, 'Bung Tomo menyemangati rakyat lewat radio. Jangan lupa jawab Soal Logistik untuk tambahan Dana.']] },
  { id: 'ambarawa', judul: 'Palagan Ambarawa', tempat: 'Ambarawa', tahun: '20 Oktober – 15 Desember 1945', pelajaran: 'ambarawa', topik: 'ambarawa', musuh: 'nl', namaMusuh: 'Sekutu & NICA', benih: 1512, dana: 5000, tingkat: 1,
    ai: { lvl: 1, jedaAwal: 170 }, tujuan: { tipe: 'semua' }, awal: { bgn: ['daya'], unit: ['inf1', 'inf1', 'inf2', 'inf2', 'inf2', 'at', 'ringan'] },
    ringkas: 'Kolonel Soedirman memimpin siasat Supit Urang. Kepung dan hancurkan semua bangunan musuh.',
    petunjuk: [[8, 'Siasat Supit Urang: bagi pasukan jadi dua kelompok (Ctrl+1 dan Ctrl+2), lalu serang dari dua jembatan sekaligus.'], [80, 'Pos Radio Pengintai menyalakan peta mini sehingga kamu bisa melihat gerak musuh.'], [150, 'Meriam Gunung bisa menembak bunker musuh dari jarak sangat jauh.']] },
  { id: 'agresi', judul: 'Agresi Militer II', tempat: 'Yogyakarta', tahun: '19 Desember 1948', pelajaran: 'agresi2', topik: 'agresi', musuh: 'nl', namaMusuh: 'Tentara Belanda', benih: 1948, dana: 6000, tingkat: 1,
    ai: { lvl: 2, jedaAwal: 130, pesawat: 170, jedaPesawat: 150, pendaratan: 240, jedaPendaratan: 120 }, tujuan: { tipe: 'tahan', detik: 480 }, awal: { bgn: ['daya', 'barak', 'gudang'], unit: ['inf1', 'inf1', 'inf2', 'inf2', 'inf2', 'at', 'at', 'ringan'] },
    ringkas: 'Belanda menyerbu ibu kota dengan pesawat dan tank. Bertahanlah 8 menit seperti pasukan gerilya Jenderal Soedirman.',
    petunjuk: [[8, 'Pesawat pembom akan datang. Sebarkan bangunan dan siapkan Dana untuk memperbaiki.'], [70, 'Gerilya: serang truk logistik musuh dengan Panser yang cepat, lalu mundur.'], [140, 'Pusat Siasat membuka Komandan Gerilya yang bisa meledakkan bangunan.']] },
  { id: 'seranganumum', judul: 'Serangan Umum 1 Maret', tempat: 'Yogyakarta', tahun: '1 Maret 1949', pelajaran: 'seranganumum', topik: 'seranganumum', musuh: 'nl', namaMusuh: 'Tentara Belanda', benih: 1349, dana: 7000, tingkat: 2,
    ai: { lvl: 2, jedaAwal: 150 }, tujuan: { tipe: 'hq', batas: 900 }, kuasaAwal: true, awal: { bgn: ['daya', 'daya', 'barak', 'gudang', 'bengkel'], unit: ['inf1', 'inf1', 'inf1', 'inf2', 'inf2', 'inf2', 'at', 'at', 'ringan', 'tank', 'tank'] },
    ringkas: 'Buktikan kepada dunia bahwa Republik masih ada. Rebut kota dengan menghancurkan markas Belanda dalam 15 menit.',
    petunjuk: [[6, 'Kekuatan Serangan Umum sudah tersedia sejak awal. Kumpulkan pasukan dulu, lalu lepaskan saat menyerbu.'], [90, 'Hujan Mortir cocok untuk melumpuhkan bunker di depan markas musuh.']] }
];

var TATA_KITA = { hq: [-1, -1], daya: [[3, 0], [3, 3]], barak: [-4, -3], gudang: [2, -5], bengkel: [-5, 1] };

function progres() { try { return JSON.parse(localStorage.getItem('siaga-merdeka-progres') || '{}'); } catch (e) { return {}; } }
function simpanProgres(p) { try { localStorage.setItem('siaga-merdeka-progres', JSON.stringify(p)); } catch (e) { } }

function ratakan(tx, ty, w, h) { for (var y = ty - 1; y <= ty + h; y++) for (var x = tx - 1; x <= tx + w; x++) if (dalamPeta(x, y)) { if (G.tanah[idx(x, y)] !== T_JALAN) G.tanah[idx(x, y)] = T_TANAH; G.rempah[idx(x, y)] = 0; G.rempahMaks[idx(x, y)] = 0; } }

function mulaiMisi(misi) {
  G = { misi: misi, t: 0, waktuNyata: 0, idBaru: 0, ents: [], byId: {}, proj: [], part: [], jejak: [], gugur: [], bangkai: [], bara: [], tundaan: [], pesawat: [], tanda: [], pilih: [], grup: {},
    cam: { x: 0, y: 0 }, view: { w: 800, h: 600 }, zoom: 1, dpr: 1, mouse: null, seret: null, taruh: null, jeda: false, berjalan: true, selesai: false,
    logistik: 1, logistikT: 70, beruntun: 0, statSoal: { benar: 0, total: 0, topik: {} }, lihatT: 0, garisT: 0, benih: misi.benih || (Math.random() * 1e6 | 0), petunjukI: 0, tahukahT: 75, cepat: PENGATURAN.cepat ? 1.4 : 1 };
  G.sisi = [buatSisi(0, 'id', misi.dana), buatSisi(1, misi.musuh, 2500)];
  buatPeta(G.benih, 64, 64); siapkanAStar();
  G.vis = new Uint8Array(G.mw * G.mh); G.jelajah = new Uint8Array(G.mw * G.mh);
  var P = G.pangkalan[0];
  ratakan(P.x - 1, P.y - 1, 3, 3); buatBangunan(0, 'hq', P.x - 1, P.y - 1, true);
  var nDaya = 0;
  (misi.awal.bgn || []).forEach(function (t) {
    var o = t === 'daya' ? TATA_KITA.daya[nDaya++] : TATA_KITA[t], d = BANGUN[t];
    ratakan(P.x + o[0], P.y + o[1], d.w, d.h); buatBangunan(0, t, P.x + o[0], P.y + o[1], true);
  });
  (misi.awal.unit || []).forEach(function (t, i) {
    var ub = ubinBebasDekat(P.x + 3 + (i % 4), P.y - 3 - Math.floor(i / 4)) || { x: P.x + 3, y: P.y - 3 };
    var u = buatUnit(0, t, (ub.x + 0.5) * TS, (ub.y + 0.5) * TS); u.jagaX = u.x; u.jagaY = u.y;
  });
  G.sisi[0].stat.dibuat = 0;
  siapkanPangkalanMusuh(misi.ai.lvl);
  G.ai = buatAI(misi.ai);
  if (misi.kuasaAwal) { G.sisi[0].kuasa.serbu.isi = KUASA.serbu.isi; G.sisi[0].kuasa.mortir.isi = 30; }
  lukisTanah();
  hitungLihat(); perbaruiKabut();
  tampilLayar('layar-game');
  ukurKanvas();
  pusatkanKamera((P.x + 3) * TS, (P.y - 3) * TS);
  siapkanHUD();
  G.berjalan = true;
  pesan(misi.judul + ' — ' + misi.tahun, 'baik');
  pesan(misi.ringkas, '');
  lapor('Komandan, pasukan siap bertempur');
  musikMulai();
}

function teksTujuan() {
  var m = G.misi, tj = m.tujuan, s;
  if (tj.tipe === 'hq') s = ic('target', 15) + '<span>Hancurkan ' + namaUnit('hq', m.musuh) + '</span>';
  else if (tj.tipe === 'semua') { var n = G.ents.filter(function (e) { return e.s === 1 && e.k === 'bgn' && e.tipe !== 'karung' && !e.mati; }).length; s = ic('target', 15) + '<span>Hancurkan semua bangunan musuh <b>(' + n + ' tersisa)</b></span>'; }
  else s = ic('shield', 15) + '<span>Bertahan <b>' + formatWaktu(Math.max(0, tj.detik - G.t)) + '</b></span>';
  if (tj.batas) s += '<span class="batas">' + ic('clock', 14) + formatWaktu(Math.max(0, tj.batas - G.t)) + '</span>';
  return s;
}
function formatWaktu(d) { d = Math.ceil(d); return Math.floor(d / 60) + ':' + ('0' + d % 60).slice(-2); }

function langkahMisi(dt) {
  if (G.selesai) return;
  var m = G.misi;
  if (m.petunjuk && G.petunjukI < m.petunjuk.length && G.t >= m.petunjuk[G.petunjukI][0]) { pesan(m.petunjuk[G.petunjukI][1], 'petunjuk'); G.petunjukI++; }
  G.tahukahT -= dt;
  if (G.tahukahT <= 0 && m.pelajaran) { G.tahukahT = 110; var L = PELAJARAN[m.pelajaran]; pesan('Tahukah kamu? ' + pilihAcak(L.isi.concat([L.tahukah])), 'sejarah'); }
  G.cekT = (G.cekT || 0) - dt; if (G.cekT > 0) return; G.cekT = 0.5;
  var kitaBgn = G.ents.some(function (e) { return e.s === 0 && e.k === 'bgn' && e.tipe !== 'karung' && !e.mati; });
  var kitaUnit = G.ents.some(function (e) { return e.s === 0 && e.k === 'unit' && e.senjata && !e.mati; });
  if (!kitaBgn && !kitaUnit) return akhiri(false, 'Semua pasukan dan bangunan kita hilang.');
  if (m.tujuan.batas && G.t >= m.tujuan.batas) return akhiri(false, 'Waktu habis sebelum markas musuh direbut.');
  var tj = m.tujuan;
  if (tj.tipe === 'hq' && !G.ents.some(function (e) { return e.s === 1 && e.tipe === 'hq' && !e.mati; })) return akhiri(true);
  if (tj.tipe === 'semua' && !G.ents.some(function (e) { return e.s === 1 && e.k === 'bgn' && e.tipe !== 'karung' && !e.mati; })) return akhiri(true);
  if (tj.tipe === 'tahan' && G.t >= tj.detik) return akhiri(true);
}

function akhiri(menang, alasan) {
  G.selesai = true; G.menang = menang;
  bunyi(menang ? 'benar' : 'salah'); lapor(menang ? 'Misi berhasil. Merdeka!' : 'Misi gagal');
  pesan(menang ? 'MISI BERHASIL!' : 'MISI GAGAL. ' + (alasan || ''), menang ? 'baik' : 'bahaya');
  if (menang) for (var i = 0; i < 6; i++) tunda(i * 0.25, function () { var e = G.ents.filter(function (x) { return x.s === 1 && !x.mati; }); if (e.length) { var t = pilihAcak(e); ledakan(t.x, t.y, 1.5); } });
  setTimeout(function () { tampilHasil(menang, alasan); }, 2600);
}

function tampilHasil(menang, alasan) {
  G.berjalan = false; musikBerhenti();
  var m = G.misi, s = G.sisi[0].stat, q = G.statSoal, akurasi = q.total ? q.benar / q.total : 0;
  var bintang = menang ? 1 + (q.total >= 2 && akurasi >= 0.6 ? 1 : 0) + (q.total >= 4 && akurasi >= 0.85 ? 1 : 0) : 0;
  if (menang && m.id) { var p = progres(); p[m.id] = Math.max(p[m.id] || 0, bintang); simpanProgres(p); }
  var L = PELAJARAN[m.pelajaran];
  var idxMisi = MISI.indexOf(m), lanjut = menang && idxMisi >= 0 && idxMisi < MISI.length - 1 ? MISI[idxMisi + 1] : null;
  var bintangHTML = ''; for (var b = 0; b < 3; b++) bintangHTML += '<span class="bintang' + (b < bintang ? ' nyala' : '') + '">' + ic('star', 34) + '</span>';
  $('#hasil-isi').innerHTML = '<p class="kicker">' + (m.tempat ? m.tempat + ' · ' + m.tahun : 'Pertempuran Bebas') + '</p><h1>' + (menang ? 'Misi Berhasil' : 'Misi Gagal') + '</h1>' +
    (alasan && !menang ? '<p class="hasil-alasan">' + alasan + '</p>' : '') + '<div class="bintang-baris">' + bintangHTML + '</div>' +
    '<div class="statistik">' + [['clock', 'Lama bertempur', formatWaktu(G.t)], ['soldier', 'Unit dibuat', s.dibuat], ['target', 'Musuh dihancurkan', s.hancur], ['skull', 'Unit gugur', s.hilang], ['dollar', 'Dana terkumpul', angkaID(Math.round(s.dana))], ['book', 'Soal benar', q.benar + ' / ' + q.total]]
      .map(function (r) { return '<div class="stat">' + ic(r[0], 18) + '<span>' + r[1] + '</span><b>' + r[2] + '</b></div>'; }).join('') + '</div>' +
    (L ? '<div class="kartu-pelajaran kecil"><p class="kicker">' + ic('book', 14) + ' Yang kamu pelajari</p><h3>' + L.judul + '</h3><p>' + L.tahukah + '</p></div>' : '') +
    '<p class="hasil-catatan">Bintang: 1 untuk menang, +1 jika akurasi soal 60% (minimal 2 soal), +1 jika akurasi 85% (minimal 4 soal).</p>' +
    '<div class="hasil-tombol">' + (lanjut ? '<button class="tombol utama" id="h-lanjut">' + ic('next', 16) + ' Misi berikutnya</button>' : '') +
    '<button class="tombol" id="h-ulang">' + ic('spin', 16) + ' Main lagi</button><button class="tombol" id="h-menu">' + ic('home', 16) + ' Menu utama</button></div>';
  tampilLayar('layar-hasil');
  if (lanjut) $('#h-lanjut').onclick = function () { bukaBriefing(lanjut); };
  $('#h-ulang').onclick = function () { if (m.id) bukaBriefing(m); else mulaiMisi(m); };
  $('#h-menu').onclick = function () { tampilLayar('layar-judul'); };
}

/* misi pertempuran bebas dirakit dari pilihan pemain */
function misiBebas(musuh, lvl) {
  return { judul: 'Pertempuran Bebas', tempat: '', tahun: '', pelajaran: musuh === 'jp' ? 'jepang' : 'agresi1', topik: null, musuh: musuh, namaMusuh: FAKSI[musuh].pasukan, benih: (Math.random() * 1e6) | 0, dana: 5000, tingkat: lvl,
    ai: { lvl: lvl, pesawat: musuh === 'nl' && lvl > 0 ? 300 : 0, banzai: musuh === 'jp' && lvl > 0 ? 240 : 0 }, tujuan: { tipe: 'semua' }, awal: { bgn: ['daya'], unit: ['inf1', 'inf1', 'inf2', 'inf2', 'at'] },
    ringkas: 'Hancurkan semua bangunan ' + FAKSI[musuh].pasukan + '.', petunjuk: [] };
}
