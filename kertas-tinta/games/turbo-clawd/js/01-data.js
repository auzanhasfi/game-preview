/* Turbo Clawd: data game — pengaturan, teks dua bahasa (ID/BM), mobil, arena, cerita */

const KUNCI = 'turbo-clawd-v1';
const awal = { bhs: 'id', level: 'sedang', suara: true, mobil: 0, buka: 1, bintang: [0, 0, 0, 0], waktu: [0, 0, 0, 0] };
function muat() { try { return Object.assign({}, awal, JSON.parse(localStorage.getItem(KUNCI) || '{}')); } catch (e) { return Object.assign({}, awal); } }
export const SET = muat();
export function simpan() { try { localStorage.setItem(KUNCI, JSON.stringify(SET)); } catch (e) { /* mode privat */ } }

export const TEKS = {
  id: {
    sub: 'Arena Lintasan Angka', mulai: 'Mulai Cerita', arena: 'Pilih Arena', garasi: 'Garasi', atur: 'Pengaturan',
    level: 'Tingkat soal', mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit', bahasa: 'Bahasa', suara: 'Suara', nyala: 'Nyala', mati: 'Mati',
    levelKet: { mudah: 'Tambah & kurang sampai 20', sedang: 'Tambah, kurang sampai 100, perkalian', sulit: 'Perkalian, pembagian, operasi campuran' },
    kembali: 'Kembali', pilih: 'Pakai mobil ini', dipakai: 'Dipakai', lanjut: 'Lanjut', lewati: 'Lewati', balapan: 'Mulai Balap',
    kecepatan: 'Kecepatan', akselerasi: 'Akselerasi', kendali: 'Kendali', bobot: 'Bobot',
    terkunci: 'Menangkan arena sebelumnya (posisi 1–3) untuk membuka', putaran: 'Putaran', posisi: 'Posisi', waktu: 'Waktu',
    benar: 'Benar', salah: 'Salah', jawaban: 'Jawaban', gerbang: 'Gerbang Angka', pilihLajur: 'Masuk lajur jawaban yang benar',
    turboBenar: 'Turbo Benar!', ulangi: 'Ulangi', menu: 'Menu', jeda: 'Jeda', teruskan: 'Teruskan', keluar: 'Keluar ke menu',
    finis: 'FINIS', hasil: 'Hasil Balapan', arenaBerikut: 'Arena berikutnya', terbuka: 'Arena baru terbuka', putaranAkhir: 'PUTARAN TERAKHIR',
    item: { roket: 'Roket', bom: 'Bom', dorong: 'Dorong', nitro: 'Nitro', perisai: 'Perisai' },
    itemKet: { roket: 'Mengejar mobil di depanmu', bom: 'Dilempar ke depan, meledak saat disentuh', dorong: 'Gelombang yang mendorong mobil di dekatmu', nitro: 'Dorongan kecepatan 2 detik', perisai: 'Menahan satu serangan' },
    kontrol: 'Kiri/kanan: A D atau panah · Drift: Shift · Item: Spasi · Rem: S',
    kena: 'Kena!', perisaiPecah: 'Perisai menahan serangan', driftTurbo: 'Drift Turbo', loop: 'Gas penuh di loop!',
    juaraTarget: 'Target: posisi 1–3', juaraTargetAkhir: 'Target: juara 1 untuk merebut Piala Angka', tamat: 'Tamat',
    bantuan: 'Cara main', bantuanIsi: [
      'Mobil melaju sendiri. Belokkan ke kiri dan kanan supaya tidak terlempar ke pagar di tikungan.',
      'Tahan drift di tikungan untuk mengisi turbo. Lepas drift, mobil melesat.',
      'Tabrak kotak berkilau untuk dapat item: Roket, Bom, Dorong, Nitro, atau Perisai.',
      'Di tengah lintasan ada Gerbang Angka. Baca soal di atas, lalu masuk lajur jawaban yang benar untuk Turbo Benar.'
    ],
    pos: ['1st', '2nd', '3rd', '4th', '5th', '6th'], ke: 'ke-'
  },
  ms: {
    sub: 'Arena Litar Nombor', mulai: 'Mula Cerita', arena: 'Pilih Arena', garasi: 'Garaj', atur: 'Tetapan',
    level: 'Tahap soalan', mudah: 'Mudah', sedang: 'Sederhana', sulit: 'Sukar', bahasa: 'Bahasa', suara: 'Bunyi', nyala: 'Hidup', mati: 'Senyap',
    levelKet: { mudah: 'Tambah & tolak hingga 20', sedang: 'Tambah, tolak hingga 100, darab', sulit: 'Darab, bahagi, operasi bergabung' },
    kembali: 'Kembali', pilih: 'Guna kereta ini', dipakai: 'Sedang diguna', lanjut: 'Seterusnya', lewati: 'Langkau', balapan: 'Mula Lumba',
    kecepatan: 'Kelajuan', akselerasi: 'Pecutan', kendali: 'Kawalan', bobot: 'Berat',
    terkunci: 'Menangi arena sebelumnya (tempat 1–3) untuk membuka', putaran: 'Pusingan', posisi: 'Kedudukan', waktu: 'Masa',
    benar: 'Betul', salah: 'Salah', jawaban: 'Jawapan', gerbang: 'Gerbang Nombor', pilihLajur: 'Masuk lorong jawapan yang betul',
    turboBenar: 'Turbo Betul!', ulangi: 'Cuba lagi', menu: 'Menu', jeda: 'Jeda', teruskan: 'Sambung', keluar: 'Keluar ke menu',
    finis: 'TAMAT', hasil: 'Keputusan Lumba', arenaBerikut: 'Arena seterusnya', terbuka: 'Arena baharu dibuka', putaranAkhir: 'PUSINGAN AKHIR',
    item: { roket: 'Roket', bom: 'Bom', dorong: 'Tolak', nitro: 'Nitro', perisai: 'Perisai' },
    itemKet: { roket: 'Mengejar kereta di hadapanmu', bom: 'Dibaling ke hadapan, meletup bila disentuh', dorong: 'Gelombang yang menolak kereta berdekatan', nitro: 'Pecutan laju 2 saat', perisai: 'Menahan satu serangan' },
    kontrol: 'Kiri/kanan: A D atau anak panah · Drift: Shift · Item: Space · Brek: S',
    kena: 'Terkena!', perisaiPecah: 'Perisai menahan serangan', driftTurbo: 'Drift Turbo', loop: 'Pecut penuh dalam gelung!',
    juaraTarget: 'Sasaran: tempat 1–3', juaraTargetAkhir: 'Sasaran: johan untuk merampas Piala Nombor', tamat: 'Tamat',
    bantuan: 'Cara main', bantuanIsi: [
      'Kereta bergerak sendiri. Belok ke kiri dan kanan supaya tidak tercampak ke pagar di selekoh.',
      'Tahan drift di selekoh untuk mengisi turbo. Lepaskan drift, kereta memecut.',
      'Langgar kotak berkilau untuk dapat item: Roket, Bom, Tolak, Nitro atau Perisai.',
      'Di tengah litar ada Gerbang Nombor. Baca soalan di atas, kemudian masuk lorong jawapan yang betul untuk Turbo Betul.'
    ],
    pos: ['1st', '2nd', '3rd', '4th', '5th', '6th'], ke: 'ke-'
  }
};
export const t = (k) => (TEKS[SET.bhs] || TEKS.id)[k];

/* mobil pemain: v = kecepatan maks (unit/detik), a = akselerasi, g = kendali (kecepatan belok lateral), b = bobot */
export const MOBIL = [
  { id: 'kilat', nama: 'Kilat Oranye', col: '#ff7a1a', c2: '#1d2340', supir: 'clawd', v: 64, a: 0.9, g: 15, b: 1.0, ket: { id: 'Seimbang, cocok untuk mulai.', ms: 'Seimbang, sesuai untuk bermula.' } },
  { id: 'hiu', nama: 'Hiu Biru', col: '#2f8cff', c2: '#f4f6ff', supir: 'clawd', v: 69, a: 0.8, g: 13, b: 0.95, ket: { id: 'Paling kencang di lurusan, tapi licin di tikungan.', ms: 'Paling laju di jalan lurus, tetapi licin di selekoh.' } },
  { id: 'kumbang', nama: 'Kumbang Hijau', col: '#29c06f', c2: '#14251c', supir: 'clawd', v: 62, a: 1.05, g: 18, b: 0.9, ket: { id: 'Lincah, mudah dikendalikan.', ms: 'Lincah, mudah dikawal.' } },
  { id: 'badak', nama: 'Badak Ungu', col: '#8b5cf6', c2: '#ffd23a', supir: 'clawd', v: 65, a: 0.85, g: 14, b: 1.35, ket: { id: 'Berat, tidak mudah terdorong mobil lain.', ms: 'Berat, tidak mudah ditolak kereta lain.' } }
];

/* lawan: geng Comot */
export const LAWAN = [
  { nama: 'Bolu', col: '#e63b46', c2: '#2a1418', skill: 0.93, akur: 0.55 },
  { nama: 'Cilok', col: '#ffc531', c2: '#3b2a10', skill: 0.95, akur: 0.6 },
  { nama: 'Kerupuk', col: '#21c4c4', c2: '#0f2930', skill: 0.91, akur: 0.5 },
  { nama: 'Rempeyek', col: '#f06bb5', c2: '#2c1224', skill: 0.96, akur: 0.65 },
  { nama: 'Lemper', col: '#7dd34a', c2: '#1d2a12', skill: 0.94, akur: 0.6 },
  { nama: 'Raja Comot', col: '#3a3f4c', c2: '#ffd23a', skill: 1.0, akur: 0.75, raja: true }
];

/* arena: titik [x, z, y, tanda] — 'L' = loop di titik ini, 'J' = lompatan (celah) mulai di titik ini */
function delapan() {
  const p = [];
  for (let i = 0; i < 22; i++) {
    const tt = i / 22 * Math.PI * 2;
    const tanda = i === 11 ? 'J' : undefined; // lompat melintas di atas lintasan bawah
    p.push([155 * Math.sin(tt), 82 * Math.sin(2 * tt), 8 - 6 * Math.cos(tt), tanda]);
  }
  return p;
}
export const ARENA = [
  { id: 'kamar', nama: { id: 'Rak Mainan', ms: 'Rak Mainan' }, tempat: { id: 'Kamar Tidur', ms: 'Bilik Tidur' }, tema: 'kamar', putaran: 4,
    titik: [[-120, 60, 2], [-60, 60, 2], [-10, 60, 2, 'L'], [80, 60, 2], [130, 40, 4], [150, 0, 8], [135, -45, 12], [90, -70, 13], [40, -70, 15, 'J'], [0, -70, 10], [-50, -75, 6], [-100, -70, 4], [-140, -40, 3], [-152, 10, 2], [-142, 45, 2]],
    gerbang: [0.36, 0.78], kotak: [0.14, 0.56, 0.9], pad: [0.26, 0.66, 0.96], lawan: [0, 1, 2, 3, 4] },
  { id: 'dapur', nama: { id: 'Jembatan Wastafel', ms: 'Jambatan Sinki' }, tempat: { id: 'Dapur Raksasa', ms: 'Dapur Gergasi' }, tema: 'dapur', putaran: 4,
    titik: delapan(), gerbang: [0.25, 0.75], kotak: [0.1, 0.4, 0.62, 0.9], pad: [0.05, 0.55], lawan: [1, 0, 3, 2, 4] },
  { id: 'kebun', nama: { id: 'Bukit Bunga', ms: 'Bukit Bunga' }, tempat: { id: 'Kebun Belakang', ms: 'Laman Belakang' }, tema: 'kebun', putaran: 4,
    titik: [[-150, 0, 2], [-150, -60, 4], [-122, -108, 8], [-60, -120, 10], [0, -120, 10, 'L'], [90, -120, 10], [140, -100, 12], [162, -50, 16], [150, 0, 21], [162, 50, 16], [140, 100, 12], [80, 120, 7], [20, 120, 5], [-40, 120, 7, 'J'], [-80, 116, 3], [-130, 84, 2], [-152, 40, 2]],
    gerbang: [0.42, 0.8], kotak: [0.12, 0.52, 0.88], pad: [0.3, 0.62, 0.97], lawan: [3, 2, 1, 0, 4] },
  { id: 'benteng', nama: { id: 'Benteng Comot', ms: 'Kubu Comot' }, tempat: { id: 'Istana Kaleng', ms: 'Istana Tin' }, tema: 'benteng', putaran: 4, akhir: true,
    titik: [[-160, -20, 3], [-160, -80, 3], [-122, -128, 6], [-60, -140, 8], [0, -140, 8, 'L'], [100, -140, 8], [150, -120, 10], [172, -70, 14], [145, -22, 18], [100, 8, 18], [60, 28, 19, 'J'], [20, 48, 12], [-30, 62, 8], [-62, 100, 6], [-110, 122, 4], [-160, 92, 3], [-176, 32, 3]],
    gerbang: [0.3, 0.72], kotak: [0.12, 0.46, 0.84], pad: [0.22, 0.6, 0.93], lawan: [0, 1, 2, 3, 5] }
];

/* cerita: siapa = clawd | nini | comot | raja | narator */
export const CERITA = {
  prolog: {
    id: [
      ['narator', 'Kota Mainan punya satu pesta yang paling ditunggu: Piala Angka, balapan di lintasan oranye yang melingkari seluruh rumah.'],
      ['raja', 'Mulai hari ini Piala Angka milikku! Siapa mau merebutnya, kalahkan geng Comot di empat arena.'],
      ['clawd', 'Tantangan diterima. Mesin Kilat Oranye sudah panas!'],
      ['nini', 'Ingat, Clawd. Di tengah lintasan ada Gerbang Angka. Masuk lajur jawaban yang benar, mesinmu dapat Turbo Benar.']
    ],
    ms: [
      ['narator', 'Kota Mainan ada satu pesta yang paling dinanti: Piala Nombor, perlumbaan di litar oren yang mengelilingi seluruh rumah.'],
      ['raja', 'Mulai hari ini Piala Nombor milik beta! Siapa mahu merampasnya, kalahkan geng Comot di empat arena.'],
      ['clawd', 'Cabaran diterima. Enjin Kilat Oranye sudah panas!'],
      ['nini', 'Ingat, Clawd. Di tengah litar ada Gerbang Nombor. Masuk lorong jawapan yang betul, enjinmu dapat Turbo Betul.']
    ]
  },
  bab: [
    { id: [['nini', 'Arena pertama: Rak Mainan di kamar tidur. Ada loop di lurusan utama. Jangan lepas gas di dalam loop!'], ['comot', 'Aku Bolu, pelari tercepat geng Comot. Roketku sudah menunggu di belakangmu!'], ['clawd', 'Kalau begitu aku tidak akan berada di depanmu terlalu lama... aku akan jauh di depan.']],
      ms: [['nini', 'Arena pertama: Rak Mainan di bilik tidur. Ada gelung di jalan lurus utama. Jangan lepas minyak dalam gelung!'], ['comot', 'Aku Bolu, pelumba terpantas geng Comot. Roketku sedang menunggu di belakangmu!'], ['clawd', 'Kalau begitu aku tidak lama di hadapanmu... aku akan jauh di depan.']],
      menang: { id: 'Rak Mainan dikuasai! Peta ke dapur sudah terbuka.', ms: 'Rak Mainan dikuasai! Peta ke dapur sudah terbuka.' } },
    { id: [['nini', 'Dapur Raksasa punya lintasan angka delapan. Di jembatan atas ada lompatan melewati lintasan bawah.'], ['raja', 'Aku menaruh bom di sepanjang dapur. Selamat menyeberang, Clawd!'], ['clawd', 'Bom bisa dilempar balik. Terima kasih hadiahnya!']],
      ms: [['nini', 'Dapur Gergasi ada litar angka lapan. Di jambatan atas ada lompatan merentasi litar bawah.'], ['raja', 'Beta letak bom di seluruh dapur. Selamat menyeberang, Clawd!'], ['clawd', 'Bom boleh dibaling semula. Terima kasih atas hadiahnya!']],
      menang: { id: 'Dapur aman. Tinggal kebun dan benteng Raja Comot.', ms: 'Dapur selamat. Tinggal laman dan kubu Raja Comot.' } },
    { id: [['nini', 'Kebun Belakang penuh bukit. Lintasannya naik setinggi pagar, ada loop dan lompatan di ujung.'], ['comot', 'Gelombang dorongku akan melempar kalian ke pagar bunga!'], ['clawd', 'Pegang kemudi kuat-kuat, Nini. Kita naik!']],
      ms: [['nini', 'Laman Belakang penuh bukit. Litarnya naik setinggi pagar, ada gelung dan lompatan di hujung.'], ['comot', 'Gelombang tolakku akan mencampak kalian ke pagar bunga!'], ['clawd', 'Pegang stereng kuat-kuat, Nini. Kita naik!']],
      menang: { id: 'Gerbang Istana Kaleng terbuka. Raja Comot menunggu.', ms: 'Gerbang Istana Tin terbuka. Raja Comot menunggu.' } },
    { id: [['raja', 'Selamat datang di bentengku. Truk Mahkota tidak pernah kalah!'], ['nini', 'Ini arena terakhir. Untuk merebut Piala Angka, kamu harus juara satu.'], ['clawd', 'Satu lagi balapan. Satu lagi hitungan. Ayo!']],
      ms: [['raja', 'Selamat datang ke kubu beta. Trak Mahkota tidak pernah kalah!'], ['nini', 'Ini arena terakhir. Untuk merampas Piala Nombor, kamu mesti johan.'], ['clawd', 'Satu lagi perlumbaan. Satu lagi kiraan. Jom!']],
      menang: { id: '', ms: '' } }
  ],
  tamat: {
    id: [['raja', 'Baiklah... kau lebih cepat. Dan hitunganmu lebih cepat lagi.'], ['clawd', 'Piala Angka kembali ke Kota Mainan. Tahun depan kita balapan lagi, main adil ya!'], ['nini', 'Semua jawaban benar tadi itulah bahan bakar kita. Hebat, Clawd!']],
    ms: [['raja', 'Baiklah... kau lebih pantas. Dan kiraanmu lebih pantas lagi.'], ['clawd', 'Piala Nombor kembali ke Kota Mainan. Tahun depan kita berlumba lagi, main adil ya!'], ['nini', 'Semua jawapan betul tadi itulah bahan api kita. Hebat, Clawd!']]
  },
  kalahAkhir: { id: [['raja', 'Ha! Piala tetap di bentengku. Coba lagi kalau berani!']], ms: [['raja', 'Ha! Piala kekal di kubu beta. Cuba lagi kalau berani!']] }
};
export const NAMA_TOKOH = { clawd: 'Clawd', nini: 'Nini', comot: 'Bolu', raja: 'Raja Comot', narator: '' };
