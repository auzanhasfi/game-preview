/* Arena Clawd: data hero, spell, item, bakat, monster, lawan AI, peta */
'use strict';
var INK = '#2e2620', PAPER = '#efebe2', PAPER2 = '#faf8f2', GOLD = '#e2a93b', CL = '#d8714f', CL_H = '#a94c33', NAVY = '#2c3e6b', PLUM = '#5a2d58', SKY = '#6fa8dc', RIVAL = '#8a3346';
var WS = 2000, VIEW = 760;
var paperEl = document.getElementById('paper'), sheet = document.getElementById('sheet');

/* ---------- hero (ic = nama ikon garis di 00-ikon.js) ---------- */
var HEROES = {
  pahlawan: { nama: 'Clawd Pahlawan', role: 'Pejuang · jarak dekat', peranan: 'pejuang', col: '#d8714f', colH: '#a94c33', hp: 1150, hpL: 125, atk: 58, atkL: 8, range: 95, atkCd: 0.75, spd: 255, melee: true,
    sk: [{ n: 'Terjah Pensel', ic: 'dash', cd: 6, t: 'Meluru ke depan, cederakan dan perlahankan musuh.' }, { n: 'Pusing Puting', ic: 'spin', cd: 9, t: 'Pusing kuat, pulih nyawa, kurang cedera 3 s.' }, { n: 'Hentakan Bumi', ic: 'slam', cd: 30, t: 'Lompat dan hentak, musuh pengsan.' }],
    build: ['pedang', 'kasut', 'jaket', 'pisau', 'buku', 'duri'] },
  pemanah: { nama: 'Clawd Pemanah', role: 'Penembak · jarak jauh', peranan: 'penembak', col: '#f2c14e', colH: '#b8861c', hp: 860, hpL: 95, atk: 52, atkL: 8, range: 270, atkCd: 0.62, spd: 250,
    sk: [{ n: 'Panah Tinta', ic: 'arrow', cd: 5, t: 'Panah panjang menembusi barisan musuh.' }, { n: 'Langkah Angin', ic: 'wind', cd: 8, t: 'Lompat elak, 3 serangan seterusnya lebih kuat.' }, { n: 'Hujan Panah', ic: 'arrows', cd: 28, t: 'Panah turun bertubi-tubi, musuh perlahan.' }],
    build: ['busur', 'kasut', 'kritikal', 'pedang', 'pisau', 'ais'] },
  sihir: { nama: 'Clawd Ahli Sihir', role: 'Ahli sihir · kuasa skill', peranan: 'sihir', col: '#7f9fd9', colH: '#45639e', hp: 820, hpL: 90, atk: 46, atkL: 7, range: 235, atkCd: 0.85, spd: 245, sp: 1.25,
    sk: [{ n: 'Bola Bintang', ic: 'orb', cd: 4, t: 'Bola bintang meletup kena kumpulan musuh.' }, { n: 'Rantai Kilat', ic: 'chain', cd: 8, t: 'Kilat melompat ke 4 musuh, pengsan sekejap.' }, { n: 'Hujan Bintang', ic: 'stars', cd: 30, t: 'Bintang besar jatuh atas kawasan musuh.' }],
    build: ['tongkat', 'kasut', 'jam', 'mahkota', 'jaket', 'buku'] },
  penjaga: { nama: 'Clawd Penjaga', role: 'Kereta kebal · pelindung', peranan: 'kebal', col: '#9aa86a', colH: '#5f6b3a', hp: 1450, hpL: 150, atk: 44, atkL: 6, range: 92, atkCd: 0.85, spd: 240, melee: true,
    sk: [{ n: 'Hentak Perisai', ic: 'bash', cd: 7, t: 'Terjah pendek dengan perisai, musuh pertama pengsan.' }, { n: 'Tembok Buku', ic: 'shield', cd: 11, t: 'Dapat perisai besar, musuh dekat ditarik dan perlahan.' }, { n: 'Benteng Kertas', ic: 'fortress', cd: 32, t: 'Gelang benteng tarik semua musuh ke tengah dan pengsan.' }],
    build: ['jaket', 'kasut', 'buku', 'duri', 'mahkota', 'pedang'] },
  bayang: { nama: 'Clawd Bayang', role: 'Pembunuh · lincah', peranan: 'pembunuh', col: '#6c6487', colH: '#3f3a55', hp: 900, hpL: 95, atk: 62, atkL: 9, range: 95, atkCd: 0.7, spd: 270, melee: true,
    sk: [{ n: 'Tikam Bayang', ic: 'sword', cd: 6, t: 'Lompat terus ke musuh terdekat dan tikam kuat.' }, { n: 'Halimunan', ic: 'shadow', cd: 14, t: 'Hilang dari pandangan 3 s, lari laju, serangan seterusnya ganda.' }, { n: 'Tarian Pisau', ic: 'dance', cd: 30, t: 'Melompat antara 5 musuh, setiap satu ditikam berkali-kali.' }],
    build: ['pedang', 'kasut', 'kritikal', 'pisau', 'busur', 'jaket'] },
  penawar: { nama: 'Clawd Penawar', role: 'Penyokong · pemulih', peranan: 'penyokong', col: '#7dbb5a', colH: '#4c7f33', hp: 960, hpL: 105, atk: 40, atkL: 6, range: 240, atkCd: 0.85, spd: 250, sp: 1.1,
    sk: [{ n: 'Daun Pulih', ic: 'leaf', cd: 7, t: 'Pulih diri dan askar sekutu, cederakan musuh dekat.' }, { n: 'Lumpur Ajaib', ic: 'drop', cd: 10, t: 'Kolam lumpur: musuh di dalamnya perlahan dan cedera.' }, { n: 'Mekar Bunga', ic: 'heal', cd: 40, t: 'Pulih besar + perisai, askar sekutu bersemangat, musuh tertolak.' }],
    build: ['jam', 'kasut', 'tongkat', 'jaket', 'mahkota', 'buku'] },
  jurutera: { nama: 'Clawd Jurutera', role: 'Penembak · binaan', peranan: 'penembak', col: '#5aa6a0', colH: '#33706b', hp: 900, hpL: 95, atk: 50, atkL: 7, range: 250, atkCd: 0.75, spd: 245,
    sk: [{ n: 'Menara Mini', ic: 'castle', cd: 10, t: 'Pasang menara kecil yang menembak musuh selama 12 s.' }, { n: 'Periuk Api', ic: 'bomb', cd: 7, t: 'Baling periuk yang meletup, musuh pengsan sekejap.' }, { n: 'Roket Kertas', ic: 'flame', cd: 32, t: 'Enam roket mengejar musuh di sekeliling.' }],
    build: ['busur', 'kasut', 'tongkat', 'kritikal', 'jam', 'jaket'] },
  nini: { nama: 'Clawd Nini', role: 'Ahli sihir · kawalan', peranan: 'sihir', col: '#e79bb6', colH: '#b2627f', hp: 860, hpL: 95, atk: 44, atkL: 7, range: 240, atkCd: 0.82, spd: 250, sp: 1.15,
    sk: [{ n: 'Bumerang Tinta', ic: 'boomerang', cd: 5, t: 'Bumerang pergi dan balik, kena musuh dua kali.' }, { n: 'Kucing Mochi', ic: 'cat', cd: 12, t: 'Musuh terdekat jadi anak kucing 2 s, tak boleh menyerang.' }, { n: 'Badai Bintang', ic: 'storm', cd: 32, t: 'Tiga gelombang badai di kawasan musuh, pengsan.' }],
    build: ['tongkat', 'kasut', 'jam', 'mahkota', 'ais', 'jaket'] }
};
var SPELLS = {
  kilas: { nama: 'Kilas', ikon: 'zap', cd: 40, t: 'Berpindah sekelip mata ke depan.' },
  pulih: { nama: 'Pulih', ikon: 'heart', cd: 50, t: 'Pulih 30% nyawa serta-merta.' },
  hukuman: { nama: 'Hukuman', ikon: 'sword', cd: 30, t: 'Pukulan besar pada monster hutan atau minion dekat.' },
  pecut: { nama: 'Pecut', ikon: 'boot', cd: 45, t: 'Lari 60% lebih laju selama 5 s.' },
  perisai: { nama: 'Perisai', ikon: 'shield', cd: 50, t: 'Perisai menahan kecederaan selama 4 s.' },
  bersih: { nama: 'Bersih', ikon: 'sparkle', cd: 60, t: 'Buang pengsan & perlahan, kebal kawalan 2 s.' },
  api: { nama: 'Tembakan Api', ikon: 'flame', cd: 45, t: 'Tembak bola api jauh, musuh tertolak.' }
};
var ITEMS = [
  { id: 'pedang', ikon: 'sword', nama: 'Pedang Pensel', t: '+22 serangan', harga: 300, atk: 22 },
  { id: 'kasut', ikon: 'boot', nama: 'Kasut Lari', t: '+40 laju gerak', harga: 250, spd: 40 },
  { id: 'jaket', ikon: 'vest', nama: 'Jaket Kertas', t: '+350 nyawa', harga: 300, hp: 350 },
  { id: 'jam', ikon: 'hourglass', nama: 'Jam Pasir', t: 'Skill sedia 15% lebih cepat', harga: 400, cdr: 0.15 },
  { id: 'tongkat', ikon: 'wand', nama: 'Tongkat Bintang', t: 'Skill 30% lebih kuat', harga: 450, sp: 0.3 },
  { id: 'buku', ikon: 'book', nama: 'Perisai Buku', t: 'Kecederaan diterima −15%', harga: 400, dr: 0.15 },
  { id: 'pisau', ikon: 'leaf', nama: 'Daun Penawar', t: 'Pulih 12% daripada kecederaan diberi', harga: 450, ls: 0.12 },
  { id: 'busur', ikon: 'bow', nama: 'Busur Laju', t: 'Serangan 20% lebih laju', harga: 350, as: 0.2 },
  { id: 'kritikal', ikon: 'crosshair', nama: 'Cincin Tuah', t: '25% peluang serangan kritikal ×1.8', harga: 400, crit: 0.25 },
  { id: 'duri', ikon: 'bricks', nama: 'Jaket Duri', t: 'Pantul 25% kecederaan kepada penyerang', harga: 450, duri: 0.25, hp: 150 },
  { id: 'ais', ikon: 'drop', nama: 'Loceng Ais', t: 'Serangan biasa memperlahan musuh 1 s', harga: 350, ais: 1 },
  { id: 'mahkota', ikon: 'crown', nama: 'Mahkota Ilmu', t: '+10% nyawa & skill, jawapan betul +100 syiling', harga: 500, mahkota: 1, sp: 0.1 }
];
/* bakat (macam emblem): dipilih sebelum masuk */
var BAKAT = {
  perkasa: { nama: 'Perkasa', ikon: 'swords', t: 'Serangan dan skill +8%.' },
  tabah: { nama: 'Tabah', ikon: 'heart', t: 'Nyawa +10%, pulih laju bila nyawa bawah 40%.' },
  pemburu: { nama: 'Pemburu Hutan', ikon: 'target', t: 'Monster hutan beri 40% lebih syiling, cedera monster +25%.' },
  bijak: { nama: 'Bijak', ikon: 'book', t: 'Kuasa soalan kilat 35 s (bukan 25) dan +50 syiling.' }
};
/* lawan AI: Pendekar Comot. Santai sengaja lembut untuk kanak-kanak. */
var LAWAN = {
  santai: { nama: 'Santai', t: 'Pendekar Comot lembut, cepat lari bila cedera.', dmg: 0.62, hp: 0.85, react: 0.55, lari: 0.5, skill: 0.7 },
  seimbang: { nama: 'Seimbang', t: 'Lebih berani dan guna ultimate.', dmg: 0.85, hp: 1, react: 0.35, lari: 0.32, skill: 1 },
  tiada: { nama: 'Tiada', t: 'Main tanpa hero musuh.' }
};
var MON = {
  kelomang: { nama: 'Kelomang', hp: 520, dmg: 0, r: 22, resp: 45, gold: 60, xp: 30, range: 0 },
  merah: { nama: 'Kumbang Merah', hp: 1300, dmg: 32, r: 28, resp: 70, gold: 110, xp: 80, range: 72 },
  biru: { nama: 'Siput Biru', hp: 1300, dmg: 28, r: 28, resp: 70, gold: 110, xp: 80, range: 72 },
  penyu: { nama: 'Penyu Dakwat', hp: 3200, dmg: 60, r: 44, resp: 120, first: 60, gold: 260, xp: 160, range: 150 },
  naga: { nama: 'Naga Tinta', hp: 6000, dmg: 75, r: 52, resp: 150, first: 240, gold: 320, xp: 220, range: 175 }
};
var MON_COL = { kelomang: '#f2b07a', merah: '#d9534a', biru: SKY, penyu: '#5f7d6a', naga: '#3f8f86' };
var CAMPS = [{ t: 'biru', x: 520, y: 1050 }, { t: 'merah', x: 1050, y: 1480 }, { t: 'biru', x: 1050, y: 520 }, { t: 'merah', x: 1480, y: 1050 }, { t: 'kelomang', x: 560, y: 560 }, { t: 'kelomang', x: 1440, y: 1440 }, { t: 'penyu', x: 1185, y: 1185 }, { t: 'naga', x: 815, y: 815 }];
/* misi dalam game */
var MISI = [
  { id: 'minion', t: 'Kalahkan 25 minion', ikon: 'swords', emas: 150, cek: function () { return G.kills >= 25; } },
  { id: 'pendekar', t: 'Tumbangkan Pendekar Comot 2 kali', ikon: 'trophy', emas: 250, cek: function () { return G.rk >= 2; }, lawan: true },
  { id: 'hutan', t: 'Kalahkan 4 monster hutan', ikon: 'turtle', emas: 200, cek: function () { return G.monsKilled >= 4; } },
  { id: 'soalan', t: 'Jawab 3 soalan kilat dengan betul', ikon: 'book', emas: 200, cek: function () { return G.correct >= 3; } }
];

/* ---------- peta ---------- */
var BASE0 = { x: 190, y: 1810 }, BASE1 = { x: 1810, y: 190 };
var LANES = {
  atas: [[190, 1810], [205, 1500], [205, 205], [1500, 205], [1810, 190]],
  tengah: [[190, 1810], [1810, 190]],
  bawah: [[190, 1810], [500, 1795], [1795, 1795], [1795, 500], [1810, 190]]
};
var LANE_IDS = ['atas', 'tengah', 'bawah'];
function midP(t) { return [190 + 1620 * t, 1810 - 1620 * t]; }
var TURRETS = [
  { lane: 'atas', team: 1, tier: 1, p: [820, 205] }, { lane: 'atas', team: 1, tier: 2, p: [1360, 205] },
  { lane: 'tengah', team: 1, tier: 1, p: midP(0.62) }, { lane: 'tengah', team: 1, tier: 2, p: midP(0.78) },
  { lane: 'bawah', team: 1, tier: 1, p: [1795, 1180] }, { lane: 'bawah', team: 1, tier: 2, p: [1795, 640] },
  { lane: 'atas', team: 0, tier: 1, p: [205, 1120] }, { lane: 'tengah', team: 0, tier: 1, p: midP(0.3) }, { lane: 'bawah', team: 0, tier: 1, p: [880, 1795] }
];
function distSeg(px, py, ax, ay, bx, by) { var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0; return Math.hypot(px - ax - dx * t, py - ay - dy * t); }
function distLanes(x, y) { var m = 1e9; LANE_IDS.forEach(function (k) { var L = LANES[k]; for (var i = 0; i < L.length - 1; i++) m = Math.min(m, distSeg(x, y, L[i][0], L[i][1], L[i + 1][0], L[i + 1][1])); }); return m; }
function distRiver(x, y) { return distSeg(x, y, 260, 260, 1740, 1740); }
