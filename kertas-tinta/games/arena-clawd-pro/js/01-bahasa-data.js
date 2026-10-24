/* Arena Clawd Pro: Bahasa (Indonesia/Melayu) + data hero, spell, item, monster */
'use strict';

/* warna & ukuran dunia */
var INK = '#2e2620', PAPER = '#efebe2', PAPER2 = '#faf8f2', GOLD = '#e2a93b', CL = '#d8714f', CL_H = '#a94c33', NAVY = '#2c3e6b', PLUM = '#5a2d58', SKY = '#6fa8dc';
var WS = 2000, VIEW = 760;
var paperEl = document.getElementById('paper'), sheet = document.getElementById('sheet');

/* ---------- bahasa: Indonesia (lalai) + Melayu ---------- */
var lang = 'id';
try { if (localStorage.getItem('arena-pro-lang') === 'ms') lang = 'ms'; } catch (e) {}
function L(id, ms) { return lang === 'ms' ? ms : id; }
function tx(v) { return typeof v === 'string' ? v : v[lang === 'ms' ? 1 : 0]; }

/* ---------- data hero, spell, item, monster ---------- */
var HEROES = {
  pahlawan: { nama: ['Clawd Pahlawan', 'Clawd Pahlawan'], role: ['Petarung · jarak dekat', 'Pejuang · jarak dekat'], col: '#d8714f', colH: '#a94c33', hp: 1150, hpL: 125, atk: 58, atkL: 8, range: 95, atkCd: 0.75, spd: 255, melee: true,
    sk: [{ n: ['Terjang Pensil', 'Terjah Pensel'], i: 'dash', cd: 6, t: ['Melesat ke depan, melukai dan memperlambat musuh.', 'Meluru ke depan, cederakan dan perlahankan musuh.'] }, { n: ['Putar Gasing', 'Pusing Puting'], i: 'spin', cd: 9, t: ['Berputar kuat, pulihkan nyawa, damage diterima berkurang 3 s.', 'Pusing kuat, pulih nyawa, kurang cedera 3 s.'] }, { n: ['Hentakan Bumi', 'Hentakan Bumi'], i: 'slam', cd: 30, t: ['Melompat dan menghentak, musuh pingsan.', 'Lompat dan hentak, musuh pengsan.'] }] },
  perisai: { nama: ['Clawd Perisai', 'Clawd Perisai'], role: ['Tank · nyawa tebal', 'Kebal · nyawa tebal'], col: '#a3b86c', colH: '#6f8440', hp: 1500, hpL: 150, atk: 44, atkL: 6, range: 90, atkCd: 0.85, spd: 240, melee: true,
    sk: [{ n: ['Hantam Perisai', 'Hentam Perisai'], i: 'bash', cd: 6, t: ['Menghantam area di depan, musuh pingsan 0,8 s.', 'Hentam kawasan di depan, musuh pengsan 0,8 s.'] }, { n: ['Tembok Kertas', 'Tembok Kertas'], i: 'bricks', cd: 12, t: ['Perisai 30% dan kebal 4 s; minion musuh dekat menyerangmu.', 'Perisai 30% dan kebal 4 s; minion musuh dekat menyerang kamu.'] }, { n: ['Benteng Raksasa', 'Benteng Gergasi'], i: 'fortress', cd: 32, t: ['Cincin besar di sekitarmu, musuh pingsan 1,6 s.', 'Gelang besar di sekeliling, musuh pengsan 1,6 s.'] }] },
  pemanah: { nama: ['Clawd Pemanah', 'Clawd Pemanah'], role: ['Penembak · jarak jauh', 'Penembak · jarak jauh'], col: '#f2c14e', colH: '#b8861c', hp: 860, hpL: 95, atk: 52, atkL: 8, range: 270, atkCd: 0.62, spd: 250,
    sk: [{ n: ['Panah Tinta', 'Panah Dakwat'], i: 'arrow', cd: 5, t: ['Panah panjang menembus barisan musuh.', 'Panah panjang menembusi barisan musuh.'] }, { n: ['Langkah Angin', 'Langkah Angin'], i: 'wind', cd: 8, t: ['Melompat menghindar, 3 serangan berikutnya lebih kuat.', 'Lompat elak, 3 serangan seterusnya lebih kuat.'] }, { n: ['Hujan Panah', 'Hujan Panah'], i: 'arrows', cd: 28, t: ['Panah turun bertubi-tubi, musuh melambat.', 'Panah turun bertubi-tubi, musuh perlahan.'] }] },
  sihir: { nama: ['Clawd Penyihir', 'Clawd Ahli Sihir'], role: ['Penyihir · kuat di skill', 'Ahli sihir · kuasa skill'], col: '#7f9fd9', colH: '#45639e', hp: 820, hpL: 90, atk: 46, atkL: 7, range: 235, atkCd: 0.85, spd: 245, sp: 1.25,
    sk: [{ n: ['Bola Bintang', 'Bola Bintang'], i: 'orb', cd: 4, t: ['Bola bintang meledak mengenai kerumunan musuh.', 'Bola bintang meletup kena kumpulan musuh.'] }, { n: ['Rantai Petir', 'Rantai Kilat'], i: 'chain', cd: 8, t: ['Petir melompat ke 4 musuh, pingsan sebentar.', 'Kilat melompat ke 4 musuh, pengsan sekejap.'] }, { n: ['Hujan Bintang', 'Hujan Bintang'], i: 'stars', cd: 30, t: ['Bintang besar jatuh di area musuh.', 'Bintang besar jatuh atas kawasan musuh.'] }] },
  bayang: { nama: ['Clawd Bayangan', 'Clawd Bayang'], role: ['Pembunuh · cepat & lincah', 'Pembunuh · pantas & tangkas'], col: '#8a78b8', colH: '#5a4a88', hp: 820, hpL: 92, atk: 62, atkL: 9, range: 92, atkCd: 0.6, spd: 278, melee: true,
    sk: [{ n: ['Lompat Bayangan', 'Lompat Bayang'], i: 'shadow', cd: 7, t: ['Meluncur ke musuh terdekat; siap lagi bila musuh itu kalah.', 'Meluncur ke musuh terdekat; sedia semula jika musuh itu tumpas.'] }, { n: ['Tusuk Kembar', 'Tikam Kembar'], i: 'swords', cd: 5, t: ['Dua tusukan cepat beruntun.', 'Dua tikaman pantas berturut-turut.'] }, { n: ['Tarian Bayangan', 'Tarian Bayang'], i: 'dance', cd: 30, t: ['1,6 s tak bisa diserang, memukul semua musuh di sekitar.', '1,6 s tidak boleh diserang, memukul semua musuh sekeliling.'] }] },
  penyembuh: { nama: ['Clawd Penyembuh', 'Clawd Penyembuh'], role: ['Pendukung · memulihkan', 'Sokongan · memulihkan'], col: '#f19bb4', colH: '#c0607e', hp: 900, hpL: 100, atk: 40, atkL: 6, range: 240, atkCd: 0.8, spd: 248, sp: 1.1,
    sk: [{ n: ['Cahaya Pulih', 'Cahaya Pulih'], i: 'heal', cd: 8, t: ['Pulihkan dirimu dan minion kawan di sekitar.', 'Pulih diri dan minion kawan di sekeliling.'] }, { n: ['Gelembung Lindung', 'Gelembung Lindung'], i: 'bubble', cd: 14, t: ['Minion kawan: damage diterima −50%, serangan +50% selama 6 s.', 'Minion kawan: cedera diterima −50%, serangan +50% selama 6 s.'] }, { n: ['Panggil Pasukan', 'Panggil Pasukan'], i: 'banner', cd: 40, t: ['Memanggil 3 minion super (5 bila soalnya benar).', 'Panggil 3 minion super (5 jika soalan betul).'] }] }
};
HEROES.nini = { nama: ['Clawd Nini', 'Clawd Nini'], role: ['Penyihir · pengendali', 'Ahli sihir · pengawal'], col: '#f6e2a8', colH: '#c9a35a', hp: 860, hpL: 94, atk: 44, atkL: 7, range: 240, atkCd: 0.8, spd: 252, sp: 1.2,
  sk: [{ n: ['Bumerang Ajaib', 'Bumerang Ajaib'], i: 'boomerang', cd: 5, t: ['Bumerang terbang lurus lalu kembali ke tangan, mengenai musuh dua kali.', 'Bumerang terbang lurus lalu kembali ke tangan, kena musuh dua kali.'] }, { n: ['Lompatan Mochi', 'Lompatan Mochi'], i: 'cat', cd: 11, t: ['Mochi si kucing melompat ke musuh: minion berubah jadi anak kucing dan tidak bisa menyerang 1,6 s.', 'Mochi si kucing melompat ke musuh: minion bertukar jadi anak kucing dan tidak boleh menyerang 1,6 s.'] }, { n: ['Badai Mochi', 'Ribut Mochi'], i: 'storm', cd: 34, t: ['Tiga gelombang petir sihir di area musuh; gelombang terakhir membuat pingsan.', 'Tiga gelombang kilat sihir di kawasan musuh; gelombang terakhir membuat pengsan.'] }] };
var HERO_IDS = ['pahlawan', 'perisai', 'pemanah', 'sihir', 'bayang', 'penyembuh', 'nini'];
var SPELLS = {
  kilas: { nama: ['Kilas', 'Kilas'], ikon: 'zap', cd: 40, t: ['Berpindah sekejap ke depan.', 'Berpindah sekelip mata ke depan.'] },
  pulih: { nama: ['Pulih', 'Pulih'], ikon: 'heart', cd: 50, t: ['Pulihkan 30% nyawa seketika.', 'Pulih 30% nyawa serta-merta.'] },
  hukuman: { nama: ['Hukuman', 'Hukuman'], ikon: 'crosshair', cd: 30, t: ['Pukulan besar ke monster hutan atau minion dekat.', 'Pukulan besar pada monster hutan atau minion dekat.'] },
  pecut: { nama: ['Lari Kencang', 'Pecut'], ikon: 'wind', cd: 45, t: ['Lari 60% lebih cepat selama 5 s.', 'Lari 60% lebih laju selama 5 s.'] },
  perisai: { nama: ['Perisai', 'Perisai'], ikon: 'shield', cd: 50, t: ['Perisai menahan damage selama 4 s.', 'Perisai menahan cedera selama 4 s.'] }
};
var ITEMS = [
  { id: 'pedang', ikon: 'sword', nama: ['Pedang Pensil', 'Pedang Pensel'], t: ['+22 serangan', '+22 serangan'], harga: 300, atk: 22 },
  { id: 'kasut', ikon: 'boot', nama: ['Sepatu Lari', 'Kasut Lari'], t: ['+40 kecepatan gerak', '+40 laju gerak'], harga: 250, spd: 40 },
  { id: 'jaket', ikon: 'vest', nama: ['Jaket Kertas', 'Jaket Kertas'], t: ['+350 nyawa', '+350 nyawa'], harga: 300, hp: 350 },
  { id: 'jam', ikon: 'hourglass', nama: ['Jam Pasir', 'Jam Pasir'], t: ['Skill siap 15% lebih cepat', 'Skill sedia 15% lebih cepat'], harga: 400, cdr: 0.15 },
  { id: 'tongkat', ikon: 'wand', nama: ['Tongkat Bintang', 'Tongkat Bintang'], t: ['Skill 30% lebih kuat', 'Skill 30% lebih kuat'], harga: 450, sp: 0.3 },
  { id: 'buku', ikon: 'book', nama: ['Perisai Buku', 'Perisai Buku'], t: ['Damage diterima −15%', 'Kecederaan diterima −15%'], harga: 400, dr: 0.15 },
  { id: 'pisau', ikon: 'leaf', nama: ['Daun Penawar', 'Daun Penawar'], t: ['Pulih 12% dari damage yang diberikan', 'Pulih 12% daripada kecederaan diberi'], harga: 450, ls: 0.12 },
  { id: 'busur', ikon: 'bow', nama: ['Busur Cepat', 'Busur Laju'], t: ['Serangan 20% lebih cepat', 'Serangan 20% lebih laju'], harga: 350, as: 0.2 },
  { id: 'ramuan', ikon: 'flask', nama: ['Ramuan Nyawa', 'Ramuan Nyawa'], t: ['Langsung +40% nyawa, tidak memakai slot', 'Terus +40% nyawa, tidak guna slot'], harga: 90, potion: true }
];
function itemById(id) { return ITEMS.filter(function (x) { return x.id === id; })[0]; }
var MON = {
  kelomang: { nama: ['Kelomang', 'Kelomang'], hp: 520, dmg: 0, r: 22, resp: 45, gold: 60, xp: 30, range: 0 },
  merah: { nama: ['Kumbang Merah', 'Kumbang Merah'], hp: 1300, dmg: 32, r: 28, resp: 70, gold: 110, xp: 80, range: 72 },
  biru: { nama: ['Siput Biru', 'Siput Biru'], hp: 1300, dmg: 28, r: 28, resp: 70, gold: 110, xp: 80, range: 72 },
  penyu: { nama: ['Penyu Tinta', 'Penyu Dakwat'], hp: 3200, dmg: 60, r: 44, resp: 120, first: 60, gold: 260, xp: 160, range: 150 }
};
