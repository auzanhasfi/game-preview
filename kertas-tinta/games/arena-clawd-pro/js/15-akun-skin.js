/* Arena Clawd Pro: akun pemain, skin, emblem, build item, rank, misi harian (semua tersimpan di perangkat) */
'use strict';

/* ---------- item tambahan + kategori item ---------- */
ITEMS.splice(ITEMS.length - 1, 0,
  { id: 'sabit', ikon: 'axe', nama: ['Kapak Penghapus', 'Kapak Pemadam'], t: ['+38 serangan', '+38 serangan'], harga: 600, atk: 38 },
  { id: 'kalung', ikon: 'pendant', nama: ['Kalung Bintang', 'Kalung Bintang'], t: ['Skill 18% lebih kuat, siap 8% lebih cepat', 'Skill 18% lebih kuat, sedia 8% lebih cepat'], harga: 650, sp: 0.18, cdr: 0.08 },
  { id: 'zirah', ikon: 'shirt', nama: ['Zirah Kardus', 'Baju Besi Kadbod'], t: ['+220 nyawa, damage diterima −8%', '+220 nyawa, kecederaan diterima −8%'], harga: 550, hp: 220, dr: 0.08 },
  { id: 'sepatusihir', ikon: 'boot', nama: ['Sepatu Sihir', 'Kasut Sihir'], t: ['+30 kecepatan, skill siap 8% lebih cepat', '+30 laju, skill sedia 8% lebih cepat'], harga: 450, spd: 30, cdr: 0.08 }
);
var ITEM_KAT = { pedang: 'serang', sabit: 'serang', pisau: 'serang', busur: 'serang', jam: 'sihir', tongkat: 'sihir', kalung: 'sihir', jaket: 'tahan', buku: 'tahan', zirah: 'tahan', kasut: 'gerak', sepatusihir: 'gerak' };
var KAT_TX = { semua: ['Semua', 'Semua'], serang: ['Serangan', 'Serangan'], sihir: ['Sihir', 'Sihir'], tahan: ['Pertahanan', 'Pertahanan'], gerak: ['Gerak', 'Gerak'] };
var BUILD_DEF = {
  pahlawan: ['kasut', 'pedang', 'jaket', 'sabit', 'pisau', 'buku'],
  perisai: ['kasut', 'jaket', 'buku', 'zirah', 'jam', 'pedang'],
  pemanah: ['kasut', 'busur', 'pedang', 'sabit', 'pisau', 'jaket'],
  sihir: ['sepatusihir', 'tongkat', 'jam', 'kalung', 'jaket', 'buku'],
  bayang: ['kasut', 'pedang', 'sabit', 'pisau', 'busur', 'zirah'],
  penyembuh: ['sepatusihir', 'jam', 'kalung', 'jaket', 'zirah', 'tongkat'],
  nini: ['sepatusihir', 'tongkat', 'kalung', 'jam', 'jaket', 'buku']
};
var ROLE_OF = { pahlawan: 'petarung', perisai: 'tank', pemanah: 'penembak', sihir: 'penyihir', bayang: 'pembunuh', penyembuh: 'pendukung', nini: 'penyihir' };
var ROLE_TX = { semua: ['Semua', 'Semua'], tank: ['Tank', 'Kebal'], petarung: ['Petarung', 'Pejuang'], pembunuh: ['Pembunuh', 'Pembunuh'], penyihir: ['Penyihir', 'Ahli sihir'], penembak: ['Penembak', 'Penembak'], pendukung: ['Pendukung', 'Sokongan'] };
/* atribut ala layar hero: daya tahan, serangan, efek skill, kesulitan (0–100) */
var ATTR = { pahlawan: [70, 75, 55, 30], perisai: [95, 40, 60, 25], pemanah: [40, 85, 45, 45], sihir: [35, 55, 95, 55], bayang: [40, 90, 60, 80], penyembuh: [55, 35, 80, 40], nini: [45, 50, 85, 35] };
var PASIF = {
  pahlawan: ['Semangat Pensil', 'Semangat Pensel', 'Setiap skill yang kena membuat serangan biasa berikutnya lebih sakit.', 'Setiap skill yang kena menjadikan serangan biasa seterusnya lebih sakit.'],
  perisai: ['Kulit Kardus', 'Kulit Kadbod', 'Nyawa paling tebal; menarik perhatian minion musuh supaya kawan aman.', 'Nyawa paling tebal; menarik perhatian minion musuh supaya kawan selamat.'],
  pemanah: ['Mata Elang', 'Mata Helang', 'Jangkauan serangan terjauh di antara semua hero.', 'Jarak serangan paling jauh antara semua hero.'],
  sihir: ['Tinta Ajaib', 'Dakwat Ajaib', 'Semua skill 25% lebih kuat dari hero lain.', 'Semua skill 25% lebih kuat daripada hero lain.'],
  bayang: ['Langkah Senyap', 'Langkah Senyap', 'Paling cepat; Lompat Bayangan siap lagi saat musuh kalah.', 'Paling pantas; Lompat Bayang sedia semula bila musuh tumpas.'],
  nini: ['Hadiah Mochi', 'Hadiah Mochi', 'Sekali per pertandingan, saat nyawa habis Nini berubah jadi Mochi 2 detik (kebal) lalu bangkit dengan 25% nyawa.', 'Sekali setiap perlawanan, bila nyawa habis Nini bertukar jadi Mochi 2 saat (kebal) lalu bangkit dengan 25% nyawa.'],
  penyembuh: ['Hati Hangat', 'Hati Hangat', 'Skill memulihkan diri dan menguatkan minion kawan.', 'Skill memulihkan diri dan menguatkan minion kawan.']
};
/* jenis pratinjau skill di layar hero */
var SKFX = { pahlawan: ['dash', 'spin', 'slam'], perisai: ['slam', 'shield', 'ring'], pemanah: ['bolt', 'dash', 'rain'], sihir: ['bolt', 'chain', 'rain'], bayang: ['dash', 'double', 'spin'], penyembuh: ['heal', 'shield', 'summon'], nini: ['boomerang', 'mochi', 'storm'] };

/* ---------- emblem ---------- */
var EMBLEM = {
  petarung: { ikon: 'swords', nama: ['Petarung', 'Pejuang'], t: ['+10 serangan, +100 nyawa', '+10 serangan, +100 nyawa'], atk: 10, hp: 100 },
  tank: { ikon: 'shield', nama: ['Tank', 'Kebal'], t: ['+250 nyawa, damage diterima −5%', '+250 nyawa, kecederaan diterima −5%'], hp: 250, dr: 0.05 },
  penyihir: { ikon: 'wand', nama: ['Penyihir', 'Ahli sihir'], t: ['Skill +12% kuat, siap 5% lebih cepat', 'Skill +12% kuat, sedia 5% lebih cepat'], sp: 0.12, cdr: 0.05 },
  pembunuh: { ikon: 'shadow', nama: ['Pembunuh', 'Pembunuh'], t: ['+8 serangan, +15 kecepatan', '+8 serangan, +15 laju'], atk: 8, spd: 15 },
  penembak: { ikon: 'bow', nama: ['Penembak', 'Penembak'], t: ['Serangan 12% lebih cepat, +4 serangan', 'Serangan 12% lebih laju, +4 serangan'], as: 0.12, atk: 4 },
  pendukung: { ikon: 'heal', nama: ['Pendukung', 'Sokongan'], t: ['Skill siap 10% lebih cepat, +120 nyawa', 'Skill sedia 10% lebih cepat, +120 nyawa'], cdr: 0.1, hp: 120 }
};

/* ---------- skin: warna badan + aksesori tinta ---------- */
var TIER = { normal: ['Dasar', 'Asas'], elit: ['Elit', 'Elit'], spesial: ['Spesial', 'Istimewa'], epik: ['Epik', 'Epik'], legenda: ['Legenda', 'Lagenda'] };
var HARGA_TIER = { normal: null, elit: { koin: 400 }, spesial: { koin: 900 }, epik: { berlian: 40 }, legenda: { berlian: 100 } };
function sk(id, tier, nama, col, colH, c2, acc, aura) { return { id: id, tier: tier, nama: nama, col: col, colH: colH, c2: c2, acc: acc || [], aura: aura || null, harga: HARGA_TIER[tier] }; }
var SKINS = {
  pahlawan: [sk('dasar', 'normal', ['Pahlawan', 'Pahlawan']),
    sk('ksatria', 'elit', ['Ksatria Emas', 'Kesatria Emas'], '#cdb27a', '#8a7440', '#2c4f8f', ['helm']),
    sk('samurai', 'spesial', ['Samurai Senja', 'Samurai Senja'], '#b8322a', '#7a1d18', '#1f1a17', ['topeng', 'syal']),
    sk('naga', 'epik', ['Naga Zamrud', 'Naga Zamrud'], '#3f8f5a', '#22573a', '#e2a93b', ['tanduk', 'sayap'], '#7fe0a0'),
    sk('matahari', 'legenda', ['Raja Matahari', 'Raja Matahari'], '#f2c14e', '#c08a1c', '#d9534a', ['mahkota', 'halo', 'kilau'], '#ffd36b')],
  perisai: [sk('dasar', 'normal', ['Perisai', 'Perisai']),
    sk('robot', 'elit', ['Robot Baja', 'Robot Keluli'], '#9fb3c8', '#5f7896', '#d0d8e0', ['antena', 'kacamata']),
    sk('beruang', 'spesial', ['Beruang Kutub', 'Beruang Kutub'], '#eef2f5', '#a9b8c6', '#6fa8dc', ['telinga', 'syal']),
    sk('lava', 'epik', ['Golem Lava', 'Golem Lava'], '#5a4a44', '#2e2620', '#ff7a2f', ['tanduk'], '#ff7a2f'),
    sk('paladin', 'legenda', ['Paladin Cahaya', 'Paladin Cahaya'], '#f5efe0', '#c9b98f', '#e2a93b', ['halo', 'sayap', 'kilau'], '#fff1b8')],
  pemanah: [sk('dasar', 'normal', ['Pemanah', 'Pemanah']),
    sk('hutan', 'elit', ['Pemburu Hutan', 'Pemburu Hutan'], '#7aa64c', '#3f6b22', '#8f5a1f', ['syal']),
    sk('bajak', 'spesial', ['Bajak Laut', 'Lanun'], '#e8d9b0', '#a8925a', '#1f1a17', ['topeng', 'mahkota']),
    sk('astronot', 'epik', ['Astronot', 'Angkasawan'], '#f0f3f8', '#9aa8bf', '#3f7fc4', ['helmkaca', 'antena'], '#9fd0ff'),
    sk('phoenix', 'legenda', ['Phoenix Api', 'Phoenix Api'], '#ff8a3d', '#c2451c', '#ffd36b', ['sayap', 'mahkota', 'kilau'], '#ffb04a')],
  sihir: [sk('dasar', 'normal', ['Penyihir', 'Ahli Sihir']),
    sk('salju', 'elit', ['Penyihir Salju', 'Ahli Sihir Salji'], '#cfe6f7', '#7fa6c4', '#3f6fb0', ['syal']),
    sk('dj', 'spesial', ['DJ Bintang', 'DJ Bintang'], '#2f2a4a', '#14112a', '#ff5fa2', ['headphone', 'kacamata']),
    sk('kosmos', 'epik', ['Kosmos', 'Kosmos'], '#3b2f7a', '#1d1650', '#e2a93b', ['halo', 'kilau'], '#a58cff'),
    sk('waktu', 'legenda', ['Raja Waktu', 'Raja Masa'], '#e6d3a3', '#a8925a', '#5a2d58', ['mahkota', 'sayap', 'kilau'], '#e2a93b')],
  bayang: [sk('dasar', 'normal', ['Bayangan', 'Bayang']),
    sk('ninja', 'elit', ['Ninja Merah', 'Ninja Merah'], '#b8322a', '#6e1d18', '#1f1a17', ['topeng']),
    sk('kucing', 'spesial', ['Kucing Malam', 'Kucing Malam'], '#3a3150', '#1f1a2e', '#e2a93b', ['telinga', 'kacamata']),
    sk('hantu', 'epik', ['Hantu Bulan', 'Hantu Bulan'], '#dfe6ff', '#9aa6d8', '#5b4a9a', ['halo'], '#b9c4ff'),
    sk('iblis', 'legenda', ['Iblis Tinta', 'Iblis Dakwat'], '#2a2420', '#0e0b09', '#d9534a', ['tanduk', 'sayap', 'kilau'], '#d9534a')],
  penyembuh: [sk('dasar', 'normal', ['Penyembuh', 'Penyembuh']),
    sk('peri', 'elit', ['Peri Bunga', 'Pari-pari Bunga'], '#ffd1e0', '#e48aa8', '#7aa64c', ['telinga']),
    sk('perawat', 'spesial', ['Perawat Cilik', 'Jururawat Cilik'], '#ffffff', '#c9c2b5', '#d9534a', ['topiperawat', 'syal']),
    sk('malaikat', 'epik', ['Malaikat Kecil', 'Malaikat Kecil'], '#fff6e0', '#d9c79a', '#e2a93b', ['halo', 'sayap'], '#fff1b8'),
    sk('pelangi', 'legenda', ['Ratu Pelangi', 'Ratu Pelangi'], '#b98cff', '#7a52c4', '#ffd36b', ['mahkota', 'kilau', 'sayap'], '#ff9ad5')],
  nini: [sk('dasar', 'normal', ['Nini', 'Nini']),
    sk('stroberi', 'elit', ['Nini Stroberi', 'Nini Strawberi'], '#ffd1dc', '#e48aa8', '#d9534a', []),
    sk('bulan', 'spesial', ['Nini Bulan Biru', 'Nini Bulan Biru'], '#cfd8f7', '#8f9fd8', '#5b4a9a', ['kacamata']),
    sk('sakura', 'epik', ['Nini Sakura', 'Nini Sakura'], '#ffe9ef', '#e6a3b8', '#e86f9a', ['sayap'], '#ffb6cf'),
    sk('bintang', 'legenda', ['Nini Peri Bintang', 'Nini Pari-pari Bintang'], '#fff1c2', '#d9b25f', '#b59ae8', ['mahkota', 'kilau', 'sayap'], '#ffd36b')]
};
function skinObj(hero, id) { var list = SKINS[hero] || []; return list.filter(function (s) { return s.id === id; })[0] || list[0]; }
/* aksesori di belakang badan (aura, sayap) dan di depan (mahkota, helm, dst.); koordinat lokal drawClawd */
function skinBack(S, t, dir) {
  if (S.aura) { ctx.save(); ctx.globalAlpha = 0.28 + Math.sin(t * 3) * 0.08; ctx.fillStyle = S.aura; ctx.beginPath(); ctx.ellipse(0, -20, 36, 30, 0, 0, 6.3); ctx.fill(); ctx.globalAlpha = 0.8; for (var i = 0; i < 6; i++) { var k = ((t * 0.7 + i / 6) % 1), x = Math.sin(i * 2.3 + t) * 22; ctx.globalAlpha = (1 - k) * 0.9; ctx.beginPath(); ctx.arc(x, -6 - k * 44, 1.6 + (1 - k) * 1.4, 0, 6.3); ctx.fill(); } ctx.restore(); }
  if (S.acc.indexOf('sayap') >= 0) {
    var fl = Math.sin(t * 6) * 0.18;
    [-1, 1].forEach(function (sd) {
      ctx.save(); ctx.translate(sd * 12, -24); ctx.rotate(sd * (0.35 + fl)); ctx.scale(sd, 1);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(18, -26, 40, -22); ctx.quadraticCurveTo(34, -14, 38, -8); ctx.quadraticCurveTo(28, -6, 30, 2); ctx.quadraticCurveTo(18, 0, 16, 8); ctx.quadraticCurveTo(8, 4, 0, 6); ctx.closePath();
      ctx.fillStyle = S.c2 || '#fff'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, 0); ctx.quadraticCurveTo(20, -12, 34, -16); ctx.moveTo(6, 3); ctx.quadraticCurveTo(18, -4, 28, -4); ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();
    });
  }
}
function skinFront(S, t, dir, hero) {
  var c2 = S.c2 || GOLD, a = S.acc;
  ctx.lineWidth = 1.1; ctx.strokeStyle = INK;
  var topY = hero === 'sihir' ? -50 : hero === 'perisai' ? -46 : -29;
  if (a.indexOf('telinga') >= 0) { [-1, 1].forEach(function (sd) { ctx.beginPath(); ctx.moveTo(sd * 15, -28); ctx.lineTo(sd * 13, -39); ctx.lineTo(sd * 5, -29); ctx.closePath(); ctx.fillStyle = S.col; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sd * 13, -29); ctx.lineTo(sd * 12.5, -35); ctx.lineTo(sd * 8, -29.5); ctx.fillStyle = c2; ctx.fill(); }); }
  if (a.indexOf('tanduk') >= 0) { [-1, 1].forEach(function (sd) { ctx.beginPath(); ctx.moveTo(sd * 13, -29); ctx.quadraticCurveTo(sd * 22, -36, sd * 19, -46); ctx.quadraticCurveTo(sd * 15, -38, sd * 7, -29); ctx.closePath(); ctx.fillStyle = '#f6e3c4'; ctx.fill(); ctx.stroke(); }); }
  if (a.indexOf('helm') >= 0) { ctx.beginPath(); ctx.moveTo(-17.5, -22); ctx.lineTo(-17.5, -30); ctx.quadraticCurveTo(0, -40, 17.5, -30); ctx.lineTo(17.5, -22); ctx.lineTo(10, -22); ctx.lineTo(10, -26); ctx.lineTo(-10, -26); ctx.lineTo(-10, -22); ctx.closePath(); ctx.fillStyle = c2; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -36); ctx.quadraticCurveTo(-6 * dir, -50, -16 * dir, -44 + Math.sin(t * 8) * 2); ctx.lineWidth = 4; ctx.strokeStyle = '#d9534a'; ctx.stroke(); ctx.lineWidth = 1.1; ctx.strokeStyle = INK; }
  if (a.indexOf('helmkaca') >= 0) { ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#cfe8ff'; ctx.beginPath(); ctx.arc(0, -20, 23, 0, 6.3); ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.arc(0, -20, 23, 0, 6.3); ctx.lineWidth = 1.6; ctx.stroke(); ctx.beginPath(); ctx.arc(-8, -30, 5, 3.6, 4.6); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; }
  if (a.indexOf('topeng') >= 0) { ctx.fillStyle = c2; ctx.fillRect(-17.5, -25.5, 35, 7); ctx.strokeRect(-17.5, -25.5, 35, 7); ctx.fillStyle = '#fff'; ctx.fillRect(-9, -23.5, 5, 2.5); ctx.fillRect(4, -23.5, 5, 2.5); ctx.beginPath(); ctx.moveTo(-17.5 * dir, -24); ctx.quadraticCurveTo(-24 * dir, -26 + Math.sin(t * 12) * 2, -27 * dir, -20); ctx.lineWidth = 2.4; ctx.strokeStyle = c2; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; }
  if (a.indexOf('kacamata') >= 0) { ctx.fillStyle = '#1f1a17'; ctx.fillRect(-11, -25, 9, 6); ctx.fillRect(2, -25, 9, 6); ctx.fillRect(-2, -23.5, 4, 1.5); ctx.fillStyle = c2; ctx.fillRect(-9.5, -24, 3, 1.5); ctx.fillRect(3.5, -24, 3, 1.5); }
  if (a.indexOf('syal') >= 0) { ctx.beginPath(); ctx.moveTo(-17, -14); ctx.lineTo(17, -14); ctx.lineTo(17, -10); ctx.lineTo(-17, -10); ctx.closePath(); ctx.fillStyle = c2; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10 * dir, -11); ctx.quadraticCurveTo(-18 * dir, -6 + Math.sin(t * 10) * 2, -24 * dir, -9 + Math.sin(t * 10 + 1) * 3); ctx.lineTo(-22 * dir, -4); ctx.quadraticCurveTo(-16 * dir, -4, -8 * dir, -10); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  if (a.indexOf('headphone') >= 0) { ctx.beginPath(); ctx.arc(0, -26, 19, 3.4, 6.03); ctx.lineWidth = 3; ctx.strokeStyle = '#1f1a17'; ctx.stroke(); ctx.lineWidth = 1.1; ctx.strokeStyle = INK; [-1, 1].forEach(function (sd) { ctx.fillStyle = c2; ctx.fillRect(sd > 0 ? 16 : -21, -27, 5, 9); ctx.strokeRect(sd > 0 ? 16 : -21, -27, 5, 9); }); }
  if (a.indexOf('antena') >= 0) { ctx.beginPath(); ctx.moveTo(6, topY); ctx.lineTo(9, topY - 11); ctx.lineWidth = 1.4; ctx.stroke(); ctx.fillStyle = Math.sin(t * 6) > 0 ? '#ff5f5f' : '#ffd36b'; ctx.beginPath(); ctx.arc(9, topY - 12, 2.6, 0, 6.3); ctx.fill(); ctx.lineWidth = 1; ctx.stroke(); }
  if (a.indexOf('topiperawat') >= 0) { ctx.fillStyle = '#fff'; ctx.fillRect(-10, -36, 20, 8); ctx.strokeRect(-10, -36, 20, 8); ctx.fillStyle = c2; ctx.fillRect(-1.5, -35, 3, 6); ctx.fillRect(-3.5, -33, 7, 2); }
  if (a.indexOf('mahkota') >= 0) { var my = topY; ctx.beginPath(); ctx.moveTo(-10, my); ctx.lineTo(-10, my - 9); ctx.lineTo(-5, my - 4); ctx.lineTo(0, my - 12); ctx.lineTo(5, my - 4); ctx.lineTo(10, my - 9); ctx.lineTo(10, my); ctx.closePath(); ctx.fillStyle = GOLD; ctx.fill(); ctx.stroke(); ctx.fillStyle = c2 === GOLD ? '#d9534a' : c2; ctx.beginPath(); ctx.arc(0, my - 4, 1.8, 0, 6.3); ctx.fill(); }
  if (a.indexOf('halo') >= 0) { ctx.save(); ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.ellipse(0, topY - 10 + Math.sin(t * 3) * 1.5, 12, 3.5, 0, 0, 6.3); ctx.lineWidth = 2.6; ctx.strokeStyle = '#ffd36b'; ctx.stroke(); ctx.restore(); }
  if (a.indexOf('kilau') >= 0) { for (var i = 0; i < 3; i++) { var an = t * 1.6 + i * 2.09, r = 30; star4(Math.cos(an) * r, -20 + Math.sin(an) * 18, 3 + Math.sin(t * 5 + i) * 1.2, an, S.aura || GOLD, 1.3); } }
}

/* ---------- akun ---------- */
var AKUN_KEY = 'arena-pro-akun';
function blankAkun() {
  var o = { nama: '', avatar: 'pahlawan', lv: 1, xp: 0, koin: 600, berlian: 15, bintang: 0, emblem: 'petarung', main: 0, menang: 0, mvp: 0, skins: {}, pakai: {}, build: {}, misi: null };
  HERO_IDS.forEach(function (h) { o.skins[h] = ['dasar']; o.pakai[h] = 'dasar'; o.build[h] = BUILD_DEF[h].slice(); });
  return o;
}
var AKUN = blankAkun();
try { var _ak = JSON.parse(localStorage.getItem(AKUN_KEY) || 'null'); if (_ak && typeof _ak === 'object') { var _b = blankAkun(); AKUN = Object.assign(_b, _ak); HERO_IDS.forEach(function (h) { AKUN.skins[h] = AKUN.skins[h] || ['dasar']; AKUN.pakai[h] = AKUN.pakai[h] || 'dasar'; AKUN.build[h] = (AKUN.build[h] || BUILD_DEF[h]).filter(itemById); }); if (!EMBLEM[AKUN.emblem]) AKUN.emblem = 'petarung'; } } catch (e) {}
function saveAkun() { try { localStorage.setItem(AKUN_KEY, JSON.stringify(AKUN)); } catch (e) {} }
function xpNeed(lv) { return 150 + lv * 100; }
function addAkunXp(n) { var naik = 0; AKUN.xp += n; while (AKUN.xp >= xpNeed(AKUN.lv)) { AKUN.xp -= xpNeed(AKUN.lv); AKUN.lv++; naik++; } return naik; }
function heroSkin(h) { return skinObj(h, AKUN.pakai[h]); }
function punyaSkin(h, id) { return AKUN.skins[h].indexOf(id) >= 0; }
function bisaBeli(S) { if (!S.harga) return true; return S.harga.koin ? AKUN.koin >= S.harga.koin : AKUN.berlian >= S.harga.berlian; }
function beliSkin(h, S) { if (punyaSkin(h, S.id) || !bisaBeli(S)) return false; if (S.harga.koin) AKUN.koin -= S.harga.koin; else AKUN.berlian -= S.harga.berlian; AKUN.skins[h].push(S.id); AKUN.pakai[h] = S.id; saveAkun(); return true; }
function hargaTx(S) { return !S.harga ? L('Gratis', 'Percuma') : S.harga.koin ? ic('coin', 14) + ' ' + S.harga.koin : ic('gem', 14) + ' ' + S.harga.berlian; }

/* ---------- rank: 7 tingkat × 5 bintang ---------- */
var RANKS = [['Prajurit', 'Perajurit', '#9fb0cc'], ['Elit', 'Elit', '#7fc3a0'], ['Master', 'Master', '#5fb3ff'], ['Grandmaster', 'Grandmaster', '#c08cff'], ['Epik', 'Epik', '#ff7ad1'], ['Legenda', 'Lagenda', '#ffb648'], ['Mitos', 'Mitos', '#ff6b5e']];
function rankInfo(b) { var i = Math.min(RANKS.length - 1, Math.floor(b / 5)), r = RANKS[i]; return { i: i, nama: L(r[0], r[1]), warna: r[2], bintang: i === RANKS.length - 1 ? b - 30 : b % 5, mitos: i === RANKS.length - 1 }; }
function rankHtml() { var r = rankInfo(AKUN.bintang); return '<span class="rk" style="--rk:' + r.warna + '"><span class="ico">' + r.nama[0] + '</span><span><small>' + L('RANK', 'RANK') + '</small><b>' + r.nama + '</b> <span class="stars5">' + (r.mitos ? ic('star', 12) + r.bintang : [0, 1, 2, 3, 4].map(function (i) { return '<span class="' + (i < r.bintang ? '' : 'off') + '">' + ic('star', 12) + '</span>'; }).join('')) + '</span></span></span>'; }

/* ---------- misi harian ---------- */
var MISI = [
  { id: 'benar', ikon: 'pencil', t: ['Jawab 10 soal dengan benar', 'Jawab 10 soalan dengan betul'], n: 10, hadiah: { berlian: 5 } },
  { id: 'menara', ikon: 'castle', t: ['Robohkan 3 menara musuh', 'Runtuhkan 3 menara musuh'], n: 3, hadiah: { koin: 150 } },
  { id: 'menang', ikon: 'trophy', t: ['Menangkan 1 pertandingan', 'Menangi 1 perlawanan'], n: 1, hadiah: { berlian: 10 } }
];
function hariIni() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function misiData() { if (!AKUN.misi || AKUN.misi.tgl !== hariIni()) AKUN.misi = { tgl: hariIni(), benar: 0, menara: 0, menang: 0, ambil: {} }; return AKUN.misi; }
function misiSiap() { var m = misiData(); return MISI.some(function (x) { return m[x.id] >= x.n && !m.ambil[x.id]; }); }
