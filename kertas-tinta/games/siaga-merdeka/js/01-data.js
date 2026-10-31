/* Siaga Merdeka: data faksi, senjata, unit, bangunan.
   Semua angka jarak dalam ubin (1 ubin = TS piksel), laju dalam ubin/detik, waktu dalam detik. */
'use strict';

var TS = 32;
var G = null;          /* keadaan permainan yang sedang berjalan */
var ctx = null;        /* konteks kanvas utama (dipakai juga oleh drawIcon) */

/* ikon tambahan gaya garis yang belum ada di 00-ikon.js */
ICONS.wrench = 'M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8a2.8 2.8 0 0 1-4-4l8-8-1.3-1.3a4 4 0 0 0-5-5l2.8 2.8-1.4 2.8-2.8 1.4L6.3 6.9';
ICONS.dollar = 'M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6';
ICONS.radio = cir(12, 12, 2) + 'M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5';
ICONS.crate = 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10M7.5 5l9 4';
ICONS.factory = 'M3 21V10l6 4V10l6 4V6h6v15zM7 17h2M12 17h2M17 17h2';
ICONS.tank = 'M3 15h18a2 2 0 0 1 0 4H3a2 2 0 0 1 0-4zM6 15v-3h11v3M10 12V9h5l6-2';
ICONS.soldier = cir(12, 5, 3) + 'M7 21l1-8 4-3 4 3 1 8M8 13l-3-2M12 10v11';
ICONS.plane = 'M2 12h20M12 4v16M8 9l4-5 4 5M9 20h6M20 12l-3-2v4z';
ICONS.question = cir(12, 12, 9) + 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01';
ICONS.map = 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14';
ICONS.clock = cir(12, 12, 9) + 'M12 7v5l3 2';
ICONS.power = 'M13 2 4 14h7l-1 8 9-12h-7z';
ICONS.skull = 'M12 3a8 8 0 0 0-5 14v3h10v-3a8 8 0 0 0-5-14zM9 12h.01M15 12h.01M10 20v-2M14 20v-2';

var FAKSI = {
  id: { nama: 'Indonesia', pasukan: 'Pejuang Republik', tim: '#d8413a', badan: '#5f6d3b', badan2: '#46522a', atap: '#a24a2e', atap2: '#7a3520', dinding: '#d9cdb0', aksen: '#f3efe6' },
  nl: { nama: 'Belanda (NICA)', pasukan: 'Pasukan NICA', tim: '#f08a24', badan: '#6c705c', badan2: '#52564a', atap: '#56677c', atap2: '#3d4a5b', dinding: '#c9c3b4', aksen: '#2c4f9e' },
  jp: { nama: 'Jepang', pasukan: 'Tentara Jepang', tim: '#e8cf62', badan: '#8a7a4c', badan2: '#6b5f3a', atap: '#5d6650', atap2: '#454c3c', dinding: '#cfc6a6', aksen: '#c8202f' }
};

/* lawan: inf = infanteri, ringan = kendaraan ringan, berat = tank, bgn = bangunan */
var SENJATA = {
  tusuk:   { dmg: 15, rof: 0.75, jarak: 1.25, vs: { inf: 1, ringan: 0.35, berat: 0.15, bgn: 0.35 }, proj: 'tusuk', bunyi: 'tusuk' },
  senapan: { dmg: 9,  rof: 0.95, jarak: 4.5, vs: { inf: 1, ringan: 0.35, berat: 0.12, bgn: 0.2 }, proj: 'peluru', bunyi: 'senapan' },
  jitu:    { dmg: 24, rof: 1.9,  jarak: 6.5, vs: { inf: 1.2, ringan: 0.2, berat: 0.08, bgn: 0.1 }, proj: 'peluru', bunyi: 'senapan' },
  roket:   { dmg: 42, rof: 2.3,  jarak: 5,   vs: { inf: 0.3, ringan: 1, berat: 1, bgn: 0.7 }, proj: 'roket', laju: 9, bunyi: 'roket' },
  mg:      { dmg: 6,  rof: 0.28, jarak: 4.8, vs: { inf: 1, ringan: 0.45, berat: 0.12, bgn: 0.15 }, proj: 'peluru', bunyi: 'mg' },
  kanonR:  { dmg: 24, rof: 1.3,  jarak: 5,   vs: { inf: 0.55, ringan: 1, berat: 0.7, bgn: 0.55 }, proj: 'peluru', besar: true, bunyi: 'kanonR' },
  kanon:   { dmg: 46, rof: 1.9,  jarak: 5.5, vs: { inf: 0.4, ringan: 1, berat: 1, bgn: 0.8 }, proj: 'shell', laju: 13, bunyi: 'kanon' },
  kanonB:  { dmg: 70, rof: 2.3,  jarak: 5.8, vs: { inf: 0.45, ringan: 1, berat: 1, bgn: 0.9 }, proj: 'shell', laju: 13, bunyi: 'kanon' },
  artileri:{ dmg: 75, rof: 4,    jarak: 9.5, min: 2.5, sebar: 1.3, vs: { inf: 1, ringan: 0.8, berat: 0.55, bgn: 1 }, proj: 'lengkung', laju: 7, bunyi: 'artileri' },
  peledak: { dmg: 420, rof: 3,   jarak: 1.3, vs: { inf: 0.6, ringan: 0.7, berat: 0.7, bgn: 1 }, proj: 'tusuk', bunyi: 'ledak' },
  mgBunker:{ dmg: 9,  rof: 0.3,  jarak: 5.2, vs: { inf: 1, ringan: 0.4, berat: 0.1, bgn: 0.1 }, proj: 'peluru', bunyi: 'mg' },
  meriamB: { dmg: 55, rof: 1.9,  jarak: 6.2, vs: { inf: 0.35, ringan: 1, berat: 1, bgn: 0.5 }, proj: 'shell', laju: 15, bunyi: 'kanon' }
};

/* nilai yang berbeda per faksi ditulis {id:..,nl:..,jp:..} */
var UNIT = {
  inf1: { jenis: 'inf', hp: 70, laju: 1.35, lihat: 5, biaya: { id: 100, nl: 120, jp: 110 }, dari: 'barak', senjata: { id: 'tusuk', nl: 'senapan', jp: 'senapan' },
    nama: { id: 'Laskar Bambu Runcing', nl: 'Infanteri KNIL', jp: 'Infanteri Jepang' },
    ket: { id: 'Murah dan cepat. Kuat menyerbu prajurit dari dekat.', nl: 'Prajurit bersenapan.', jp: 'Prajurit bersenapan.' } },
  inf2: { jenis: 'inf', hp: 80, laju: 1.15, lihat: 6, biaya: 160, dari: 'barak', senjata: { id: 'senapan', nl: 'senapan', jp: 'jitu' },
    nama: { id: 'Penembak TKR', nl: 'Marinir Belanda', jp: 'Penembak Jitu' },
    ket: { id: 'Senapan jarak menengah. Lawan terbaik untuk prajurit musuh.', nl: 'Prajurit terlatih.', jp: 'Jarak tembak jauh.' } },
  at: { jenis: 'inf', hp: 75, laju: 1.0, lihat: 6, biaya: 300, dari: 'barak', senjata: 'roket',
    nama: { id: 'Regu Granat Tangan', nl: 'Regu Bazooka', jp: 'Regu Ranjau Tangan' },
    ket: { id: 'Peledak anti-kendaraan. Pakai untuk menghancurkan tank.', nl: 'Anti-kendaraan.', jp: 'Anti-kendaraan.' } },
  hero: { jenis: 'inf', hp: 260, laju: 1.45, lihat: 7, biaya: 1200, dari: 'barak', senjata: 'peledak', butuh: ['siasat'], maks: 1, sembuh: 3,
    nama: { id: 'Komandan Gerilya' }, ket: { id: 'Hanya satu. Meledakkan bangunan dalam sekejap, pulih sendiri saat diam.' } },
  truk: { jenis: 'ringan', hp: 600, laju: 1.15, lihat: 4, biaya: 1000, dari: 'bengkel', senjata: null, panen: true,
    nama: { id: 'Truk Rempah', nl: 'Truk Logistik', jp: 'Truk Logistik' },
    ket: { id: 'Memanen ladang rempah dan membawanya ke gudang menjadi Dana.' } },
  ringan: { jenis: 'ringan', hp: 240, laju: 2.1, lihat: 6, biaya: 500, dari: 'bengkel', senjata: { id: 'mg', nl: 'mg', jp: 'kanonR' },
    nama: { id: 'Panser Rakitan', nl: 'Bren Carrier', jp: 'Tank Te-Ke' },
    ket: { id: 'Kendaraan lapis baja ringan dengan senapan mesin. Cepat untuk mengintai.' } },
  tank: { jenis: 'berat', hp: 460, laju: 1.25, lihat: 5, biaya: 800, dari: 'bengkel', senjata: 'kanon',
    nama: { id: 'Tank Rampasan', nl: 'Tank Stuart', jp: 'Tank Ha-Go' },
    ket: { id: 'Tank hasil rampasan dari tentara Jepang. Tulang punggung serangan.' } },
  arty: { jenis: 'ringan', hp: 200, laju: 0.95, lihat: 6, biaya: 900, dari: 'bengkel', senjata: 'artileri', butuh: ['radar'],
    nama: { id: 'Meriam Gunung', nl: 'Howitzer 25-pon', jp: 'Meriam Tipe 91' },
    ket: { id: 'Menembak sangat jauh dengan ledakan lebar. Lemah dari dekat.' } },
  berat: { jenis: 'berat', hp: 720, laju: 0.95, lihat: 5, biaya: 1400, dari: 'bengkel', senjata: 'kanonB', butuh: ['siasat'], hanyaMusuh: true,
    nama: { nl: 'Tank Sherman', jp: 'Tank Chi-Ha' }, ket: { nl: 'Tank berat.', jp: 'Tank berat.' } }
};

var BANGUN = {
  hq:     { w: 3, h: 3, hp: 1700, daya: 10, biaya: 3000, kat: null, lihat: 7,
    nama: { id: 'Markas Komando', nl: 'Markas NICA', jp: 'Markas Tentara Ke-16' }, ket: { id: 'Pusat pembangunan. Jika runtuh, kamu tidak bisa membangun lagi.' } },
  daya:   { w: 2, h: 2, hp: 500, daya: 100, biaya: 300, kat: 'bgn', lihat: 4,
    nama: { id: 'Pembangkit Listrik', nl: 'Pembangkit', jp: 'Pembangkit' }, ket: { id: 'Memberi +100 daya. Daya kurang membuat produksi lambat dan radar mati.' } },
  gudang: { w: 3, h: 3, hp: 900, daya: -30, biaya: 1500, kat: 'bgn', butuh: ['daya'], lihat: 5, gratis: 'truk',
    nama: { id: 'Gudang Rempah', nl: 'Kilang Logistik', jp: 'Gudang Logistik' }, ket: { id: 'Mengolah rempah jadi Dana. Datang dengan satu Truk Rempah gratis.' } },
  barak:  { w: 2, h: 2, hp: 600, daya: -20, biaya: 300, kat: 'bgn', butuh: ['daya'], lihat: 5,
    nama: { id: 'Barak Laskar', nl: 'Tangsi KNIL', jp: 'Barak Infanteri' }, ket: { id: 'Melatih prajurit.' } },
  bengkel:{ w: 3, h: 3, hp: 1000, daya: -30, biaya: 1500, kat: 'bgn', butuh: ['gudang'], lihat: 5,
    nama: { id: 'Bengkel Kendaraan', nl: 'Bengkel Lapis Baja', jp: 'Bengkel Lapis Baja' }, ket: { id: 'Merakit truk, panser, tank, dan meriam.' } },
  radar:  { w: 2, h: 2, hp: 700, daya: -40, biaya: 800, kat: 'bgn', butuh: ['gudang'], lihat: 9,
    nama: { id: 'Pos Radio Pengintai', nl: 'Menara Radio', jp: 'Menara Radio' }, ket: { id: 'Menyalakan peta mini dan membuka Meriam Gunung.' } },
  siasat: { w: 2, h: 2, hp: 800, daya: -80, biaya: 1500, kat: 'bgn', butuh: ['radar', 'bengkel'], lihat: 6,
    nama: { id: 'Pusat Siasat', nl: 'Markas Besar', jp: 'Markas Besar' }, ket: { id: 'Membuka Komandan Gerilya dan dua kekuatan khusus: Serangan Umum dan Hujan Mortir.' } },
  bunker: { w: 1, h: 1, hp: 450, daya: 0, biaya: 400, kat: 'tahan', butuh: ['barak'], senjata: 'mgBunker', lihat: 6,
    nama: { id: 'Sarang Senapan', nl: 'Bunker Beton', jp: 'Bunker Beton' }, ket: { id: 'Senapan mesin. Mencegat prajurit musuh.' } },
  meriam: { w: 1, h: 1, hp: 520, daya: -20, biaya: 650, kat: 'tahan', butuh: ['bengkel'], senjata: 'meriamB', listrik: true, lihat: 7,
    nama: { id: 'Meriam Benteng', nl: 'Meriam Pantai', jp: 'Meriam Pantai' }, ket: { id: 'Anti-tank. Butuh daya cukup untuk menembak.' } },
  karung: { w: 1, h: 1, hp: 260, daya: 0, biaya: 40, kat: 'tahan', butuh: ['barak'], tembok: true, lihat: 1,
    nama: { id: 'Karung Pasir', nl: 'Karung Pasir', jp: 'Karung Pasir' }, ket: { id: 'Tembok murah untuk menahan musuh.' } }
};

var URUT_BGN = ['daya', 'gudang', 'barak', 'bengkel', 'radar', 'siasat'];
var URUT_TAHAN = ['karung', 'bunker', 'meriam'];
var URUT_INF = ['inf1', 'inf2', 'at', 'hero'];
var URUT_KEND = ['truk', 'ringan', 'tank', 'arty'];

function nilaiFak(v, fak) { return (v && typeof v === 'object') ? (v[fak] != null ? v[fak] : v.id) : v; }
function namaUnit(tipe, fak) { var d = UNIT[tipe] || BANGUN[tipe]; return nilaiFak(d.nama, fak); }
function biayaDari(tipe, fak) { var d = UNIT[tipe] || BANGUN[tipe]; return nilaiFak(d.biaya, fak); }
/* bangunan butuh waktu biaya/100 detik, unit biaya/75 detik (minimal 3 detik) */
function waktuBuat(tipe, fak) { var b = biayaDari(tipe, fak); return BANGUN[tipe] ? Math.max(2, b / 100) : Math.max(3, b / 75); }

var KUASA = {
  serbu: { nama: 'Serangan Umum', ket: 'Semua pasukan +50% daya tembak dan +30% laju selama 20 detik.', isi: 120, ikon: 'flag' },
  mortir: { nama: 'Hujan Mortir', ket: 'Pilih titik di peta: 10 peluru mortir menghujani daerah itu.', isi: 95, ikon: 'bomb' }
};
