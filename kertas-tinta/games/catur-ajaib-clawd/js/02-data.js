/* Catur Ajaib Clawd: data hero, sinergi, item, kartu Go Go, komandan, peluang toko, monster */
'use strict';
var INK = '#2e2620', PAPER = '#efebe2', PAPER2 = '#faf8f2', GOLD = '#e2a93b', CL = '#d8714f', CL_H = '#a94c33', NAVY = '#2c3e6b', RED = '#c2483a', SKY = '#6fa8dc';

/* ---------- 5 faksi + 5 peran (ic = ikon garis) ---------- */
var FAKSI = {
  tinta:  { ic: 'drop',    col: '#3d4a7a', tier: [2, 4], val: [0.2, 0.45] },   /* +% kerusakan */
  kertas: { ic: 'book',    col: '#b9a37a', tier: [2, 4], val: [150, 350] },    /* perisai awal */
  hutan:  { ic: 'leaf',    col: '#6fa83c', tier: [2, 4], val: [0.02, 0.04] },  /* pulih % nyawa/detik */
  mesin:  { ic: 'hexagon', col: '#5aa6a0', tier: [2, 4], val: [0.2, 0.45] },   /* +% kecepatan serang */
  bintang:{ ic: 'star',    col: '#e2a93b', tier: [2, 4], val: [20, 40] }       /* mana awal (+ per serangan /4) */
};
var PERAN = {
  pengawal: { ic: 'shield',    tier: [2, 4], val: [0.2, 0.4] },   /* kurangi kerusakan diterima */
  pendekar: { ic: 'sword',     tier: [2, 4], val: [0.15, 0.3] },  /* curi nyawa */
  pemanah:  { ic: 'crosshair', tier: [2, 4], val: [0.2, 0.4] },   /* peluang kritikal ×1.8 */
  penyihir: { ic: 'wand',      tier: [2, 4], val: [0.3, 0.7] },   /* kekuatan skill */
  penyokong:{ ic: 'heart',     tier: [2],    val: [200] }         /* seluruh tim +nyawa */
};

/* ---------- 20 hero (biaya 1–5). acc = aksesori di drawClawd. range dalam petak. sk = jenis skill ---------- */
var HEROES = {
  pena:    { c: 1, f: 'tinta',   p: 'pendekar',  acc: 'pahlawan', col: '#d8714f', colH: '#a94c33', hp: 600, atk: 50, as: 0.8, rng: 1, mana: 70, sk: 'tebas', pw: 160 },
  kapur:   { c: 1, f: 'kertas',  p: 'pengawal',  acc: 'penjaga',  col: '#cfc6b0', colH: '#8d846e', hp: 750, atk: 40, as: 0.95, rng: 1, mana: 80, sk: 'perisai', pw: 260 },
  biji:    { c: 1, f: 'hutan',   p: 'penyokong', acc: 'penawar',  col: '#9cc96b', colH: '#5f8a3a', hp: 520, atk: 32, as: 0.9, rng: 3, mana: 70, sk: 'pulih', pw: 200 },
  baut:    { c: 1, f: 'mesin',   p: 'pemanah',   acc: 'jurutera', col: '#5aa6a0', colH: '#33706b', hp: 480, atk: 48, as: 0.75, rng: 4, mana: 70, sk: 'panah', pw: 190 },
  kilau:   { c: 1, f: 'bintang', p: 'penyihir',  acc: 'sihir',    col: '#7f9fd9', colH: '#45639e', hp: 470, atk: 34, as: 0.9, rng: 3, mana: 60, sk: 'bola', pw: 170 },
  kuas:    { c: 2, f: 'tinta',   p: 'penyihir',  acc: 'nini',     col: '#e79bb6', colH: '#b2627f', hp: 560, atk: 38, as: 0.85, rng: 3, mana: 70, sk: 'pengsan', pw: 200 },
  lipat:   { c: 2, f: 'kertas',  p: 'pemanah',   acc: 'pemanah',  col: '#f2c14e', colH: '#b8861c', hp: 560, atk: 56, as: 0.7, rng: 4, mana: 70, sk: 'panah', pw: 240 },
  akar:    { c: 2, f: 'hutan',   p: 'pengawal',  acc: 'penjaga',  col: '#8fb07a', colH: '#4f6e3f', hp: 880, atk: 46, as: 0.95, rng: 1, mana: 90, sk: 'perisai', pw: 380 },
  gir:     { c: 2, f: 'mesin',   p: 'pendekar',  acc: 'pahlawan', col: '#9aa3ad', colH: '#5c646d', hp: 760, atk: 60, as: 0.75, rng: 1, mana: 70, sk: 'tebas', pw: 230 },
  komet:   { c: 2, f: 'bintang', p: 'pemanah',   acc: 'pemanah',  col: '#9fc3ea', colH: '#5a82b0', hp: 540, atk: 58, as: 0.72, rng: 4, mana: 70, sk: 'panah', pw: 250 },
  bayang:  { c: 3, f: 'tinta',   p: 'pendekar',  acc: 'bayang',   col: '#6c6487', colH: '#3f3a55', hp: 820, atk: 78, as: 0.65, rng: 1, mana: 60, sk: 'lompat', pw: 360 },
  origami: { c: 3, f: 'kertas',  p: 'penyokong', acc: 'penawar',  col: '#f3e3c3', colH: '#b49b6b', hp: 760, atk: 42, as: 0.85, rng: 3, mana: 70, sk: 'pulih', pw: 380 },
  paku:    { c: 3, f: 'mesin',   p: 'pengawal',  acc: 'jurutera', col: '#c78a4a', colH: '#8a5826', hp: 1050, atk: 56, as: 0.9, rng: 1, mana: 80, sk: 'pengsan', pw: 260 },
  bulan:   { c: 3, f: 'bintang', p: 'penyihir',  acc: 'sihir',    col: '#b7a6e0', colH: '#6f5ea8', hp: 680, atk: 44, as: 0.85, rng: 3, mana: 80, sk: 'hujan', pw: 300 },
  dakwat:  { c: 4, f: 'tinta',   p: 'pemanah',   acc: 'pemanah',  col: '#4d5a8f', colH: '#28325a', hp: 820, atk: 90, as: 0.65, rng: 4, mana: 80, sk: 'hujan', pw: 380 },
  rimba:   { c: 4, f: 'hutan',   p: 'pendekar',  acc: 'pahlawan', col: '#5f9e4a', colH: '#356628', hp: 1250, atk: 92, as: 0.7, rng: 1, mana: 80, sk: 'tebas', pw: 480 },
  robo:    { c: 4, f: 'mesin',   p: 'penyihir',  acc: 'jurutera', col: '#7a8fa6', colH: '#45576b', hp: 900, atk: 52, as: 0.85, rng: 3, mana: 90, sk: 'hujan', pw: 420 },
  naga:    { c: 5, f: 'kertas',  p: 'pengawal',  acc: 'penjaga',  col: '#e58a5f', colH: '#a8552e', hp: 1700, atk: 88, as: 0.85, rng: 1, mana: 90, sk: 'gempa', pw: 420 },
  utara:   { c: 5, f: 'bintang', p: 'pendekar',  acc: 'bayang',   col: '#f2d36b', colH: '#b8961c', hp: 1250, atk: 125, as: 0.6, rng: 1, mana: 60, sk: 'lompat', pw: 620 },
  ratu:    { c: 5, f: 'hutan',   p: 'penyihir',  acc: 'nini',     col: '#7dbb5a', colH: '#4c7f33', hp: 1000, atk: 60, as: 0.85, rng: 3, mana: 90, sk: 'badai', pw: 520 }
};
var HERO_ID = Object.keys(HEROES);
var POOL_N = [0, 18, 15, 12, 9, 6];                   /* salinan per biaya di kolam bersama */
var STAR_K = [0, 1, 1.8, 3.2];                         /* pengali nyawa & serangan per bintang */
/* peluang biaya 1..5 menurut level (%) */
var ODDS = [null, [100, 0, 0, 0, 0], [100, 0, 0, 0, 0], [75, 25, 0, 0, 0], [55, 30, 15, 0, 0], [45, 33, 20, 2, 0], [30, 40, 25, 5, 0], [19, 30, 35, 15, 1], [15, 20, 35, 25, 5], [10, 15, 30, 30, 15]];
var XPNEED = [0, 2, 2, 6, 10, 20, 36, 56, 80, 0];     /* XP untuk naik dari level i ke i+1 */
var MAXLV = 9, SHOP_N = 5, BENCH_N = 8, ROLL_COST = 2, XP_COST = 4;

/* ---------- item (dari monster). Maks 3 per hero ---------- */
var ITEMS = {
  pedang: { ic: 'sword',     atk: 15 },
  busur:  { ic: 'bow',       as: 0.18 },
  tongkat:{ ic: 'wand',      sp: 0.25 },
  jaket:  { ic: 'vest',      red: 0.15 },
  kalung: { ic: 'pendant',   hp: 180 },
  jam:    { ic: 'hourglass', mana: 20 }
};
var ITEM_ID = Object.keys(ITEMS);

/* ---------- kartu Go Go (biru / ungu / emas). Kartu emas dikunci soal ---------- */
var CARDS = {
  kantong: { r: 'biru', ic: 'coin' },     /* +6 emas */
  latihan: { r: 'biru', ic: 'book' },     /* +6 XP */
  senjata: { r: 'biru', ic: 'sword' },    /* 1 item acak */
  kawan:   { r: 'biru', ic: 'user' },     /* hero 2 emas acak */
  semangat:{ r: 'ungu', ic: 'zap' },      /* +15% kecepatan serang semua hero */
  darah:   { r: 'ungu', ic: 'flame' },    /* +25% kerusakan setelah 8 detik */
  kembar:  { r: 'ungu', ic: 'stars' },    /* 2 salinan hero biaya 1 acak yang dimiliki */
  peti:    { r: 'ungu', ic: 'bag' },      /* 2 item acak */
  slot:    { r: 'emas', ic: 'crown' },    /* +1 hero di papan */
  pesta:   { r: 'emas', ic: 'gem' },      /* +15 emas */
  ajaib:   { r: 'emas', ic: 'sparkle' },  /* +20% kerusakan & +200 nyawa semua hero */
  mahkota: { r: 'emas', ic: 'trophy' }    /* hero 4 emas acak + 1 item */
};
var CARD_ID = Object.keys(CARDS);

/* ---------- komandan (pasif + skill aktif sekali per tempur) ---------- */
var KOMANDAN = {
  petualang: { acc: 'pahlawan', col: '#d8714f', colH: '#a94c33', ic: 'coin' },   /* pasif +1 emas/ronde; aktif: tinta 3 musuh */
  penjaga:   { acc: 'penjaga',  col: '#9aa86a', colH: '#5f6b3a', ic: 'shield' }, /* pasif kerusakan ke komandan −25%; aktif: perisai semua */
  bintang:   { acc: 'sihir',    col: '#7f9fd9', colH: '#45639e', ic: 'stars' }   /* pasif 1 segarkan gratis/ronde; aktif: hujan bintang + pengsan */
};

/* ---------- lawan AI (7 komandan Comot) ---------- */
var LAWAN = [
  { nama: 'Si Noda',      col: '#2c3e6b', gaya: 'cepat' },
  { nama: 'Si Coret',     col: '#5a2d58', gaya: 'hemat' },
  { nama: 'Si Gumpal',    col: '#3a5a40', gaya: 'seimbang' },
  { nama: 'Si Luntur',    col: '#6b4e2c', gaya: 'hemat' },
  { nama: 'Si Belepotan', col: '#7a2e3a', gaya: 'cepat' },
  { nama: 'Si Bocor',     col: '#2c5f6b', gaya: 'seimbang' },
  { nama: 'Raja Comot',   col: '#3a2f50', gaya: 'kuat' }
];

/* ---------- monster ronde creep ---------- */
var CREEP = {
  kecil:   { hp: 260, atk: 22, as: 1.0, rng: 1, r: 13, col: '#2c3e6b' },
  sedang:  { hp: 420, atk: 34, as: 1.0, rng: 1, r: 16, col: '#3a2f50' },
  pemanah: { hp: 300, atk: 30, as: 1.1, rng: 3, r: 14, col: '#5a2d58' },
  besar:   { hp: 900, atk: 55, as: 1.1, rng: 1, r: 22, col: '#22304f' }
};

/* ---------- struktur ronde: tahap 1 = 3 creep; tahap 2+ = PvP, PvP, Kotak Go Go, PvP, PvP, Creep ---------- */
function roundType(stage, r) {
  if (stage === 1) return 'creep';
  return ['pvp', 'pvp', 'kotak', 'pvp', 'pvp', 'creep'][r - 1];
}
function roundsIn(stage) { return stage === 1 ? 3 : 6; }
function stageDmg(stage) { return [0, 0, 2, 4, 6, 9, 12, 15, 18][Math.min(stage, 8)]; }
