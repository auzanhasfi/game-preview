/* Pinball Clawd: tata letak meja (satuan piksel meja, 520 x 1040, y ke bawah = ke arah pemain).
   Murni data, tanpa DOM, dipakai bersama oleh fisika (05), aturan (06), render (08), dan uji Node. */

export const MEJA = { W: 520, H: 1040, BR: 13, G: 1550 };

const v = (x, y) => ({ x, y });
let nid = 0;
function seg(x1, y1, x2, y2, o = {}) {
  return Object.assign({ id: 's' + nid++, a: v(x1, y1), b: v(x2, y2), r: 4, e: 0.42, jenis: 'dinding' }, o);
}
function garis(pts, o = {}) { const out = []; for (let i = 0; i < pts.length - 1; i++) out.push(seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], o)); return out; }
const cerminX = (x) => 490 - x; // meja simetris di sekitar x = 245 (tanpa lorong plunger)

/* busur atas: pusat (262.5, 262), jari-jari 242.5, dari kiri ke kanan lewat puncak */
export const BUSUR = { cx: 262.5, cy: 262, R: 242.5 };
const titikBusur = [];
for (let i = 0; i <= 40; i++) { const t = Math.PI + (Math.PI * i) / 40; titikBusur.push([BUSUR.cx + BUSUR.R * Math.cos(t), BUSUR.cy + BUSUR.R * Math.sin(t)]); }

export const DINDING = [
  ...garis(titikBusur, { r: 4, e: 0.35, jenis: 'rel', bagian: 'busur' }),
  seg(20, 262, 20, 1070, { e: 0.15, bagian: 'luar' }),
  seg(505, 262, 505, 1070, { e: 0.35, bagian: 'luar' }),
  seg(470, 300, 470, 1070, { r: 3, e: 0.15, bagian: 'plunger' }),
  // gerbang satu arah: bola dari bawah lewat, bola dari busur dibelokkan ke meja
  seg(22, 231, 60, 300, { r: 2, e: 0.3, jenis: 'gerbang', depan: { x: 0.873, y: -0.488 }, bagian: 'gerbangKiri' }),
  seg(430, 300, 503, 231, { r: 2, e: 0.3, jenis: 'gerbang', depan: { x: -0.681, y: -0.733 }, bagian: 'gerbangKanan' }),
  // pemandu lorong orbit
  seg(60, 300, 60, 470, { r: 5, e: 0.55, jenis: 'karet', bagian: 'pemandu' }),
  seg(430, 300, 430, 470, { r: 5, e: 0.55, jenis: 'karet', bagian: 'pemandu' }),
  seg(60, 470, 73, 508, { r: 5, e: 0.3, bagian: 'sayap' }), seg(430, 470, 417, 508, { r: 5, e: 0.3, bagian: 'sayap' }),
  // tiang lajur atas
  ...[170, 220, 270, 320].map((x) => seg(x, 100, x, 140, { r: 4, e: 0.5, jenis: 'karet', bagian: 'tiang' })),
  // ramp kiri (mulut menghadap flipper kanan)
  seg(142, 546, 112, 456, { r: 4, bagian: 'ramp' }), seg(112, 456, 148, 444, { r: 4, bagian: 'ramp' }),
  // blok kiri + lorong Kotak Clawd
  seg(178, 534, 148, 444, { r: 4, bagian: 'blok' }), seg(178, 534, 205, 530, { r: 4, bagian: 'blok' }),
  seg(205, 530, 215, 440, { r: 4, bagian: 'blok' }), seg(215, 440, 148, 444, { r: 4, bagian: 'blok' }),
  seg(215, 440, 275, 440, { r: 4, bagian: 'blok' }),
  // blok kanan + ramp kanan (cermin)
  seg(312, 534, 342, 444, { r: 4, bagian: 'blok' }), seg(312, 534, 285, 530, { r: 4, bagian: 'blok' }),
  seg(285, 530, 275, 440, { r: 4, bagian: 'blok' }), seg(275, 440, 342, 444, { r: 4, bagian: 'blok' }),
  seg(348, 546, 378, 456, { r: 4, bagian: 'ramp' }), seg(378, 456, 342, 444, { r: 4, bagian: 'ramp' }),
  // pembatas outlane (karet)
  seg(62, 700, 62, 840, { r: 5, e: 0.55, jenis: 'karet', bagian: 'pembatas' }),
  seg(428, 700, 428, 840, { r: 5, e: 0.55, jenis: 'karet', bagian: 'pembatas' }),
  // pemandu inlane ke pangkal flipper
  seg(62, 840, 146, 922, { r: 4, e: 0.3, bagian: 'inlane' }),
  seg(428, 840, 344, 922, { r: 4, e: 0.3, bagian: 'inlane' }),
  // slingshot kiri & kanan: sisi miring = penendang
  seg(100, 735, 100, 820, { r: 5, e: 0.55, jenis: 'karet', bagian: 'sling' }),
  seg(100, 820, 145, 852, { r: 4, bagian: 'sling' }),
  seg(100, 735, 145, 852, { r: 5, e: 0.6, jenis: 'sling', idx: 0, bagian: 'sling' }),
  seg(390, 735, 390, 820, { r: 5, e: 0.55, jenis: 'karet', bagian: 'sling' }),
  seg(390, 820, 345, 852, { r: 4, bagian: 'sling' }),
  seg(390, 735, 345, 852, { r: 5, e: 0.6, jenis: 'sling', idx: 1, bagian: 'sling' })
];

/* drop target di mulut lorong Kotak Clawd */
export const TARGET = [[209, 230], [234.5, 255.5], [260, 281]].map(([x1, x2], i) => seg(x1, 528, x2, 528, { r: 4, e: 0.3, jenis: 'target', idx: i, bagian: 'target' }));

export const LINGKARAN = [
  { x: 195, y: 200, r: 24, jenis: 'bumper', idx: 0, e: 0.5 },
  { x: 295, y: 200, r: 24, jenis: 'bumper', idx: 1, e: 0.5 },
  { x: 245, y: 285, r: 24, jenis: 'bumper', idx: 2, e: 0.5 },
  { x: 245, y: 385, r: 22, jenis: 'clawd', e: 0.55 }
];

/* flipper: sudut 0 = menunjuk ke kanan, positif = searah jarum jam (ke bawah) */
const RAD = Math.PI / 180;
export const FLIPPER = [
  { sisi: 0, px: 150, py: 930, L: 82, r1: 14, r2: 7, diam: 30 * RAD, naik: -28 * RAD },
  { sisi: 1, px: 340, py: 930, L: 82, r1: 14, r2: 7, diam: 150 * RAD, naik: 208 * RAD }
];

export const PLUNGER = { x: 487.5, y0: 1003, x1: 473, x2: 502, tarik: 40 };

/* sensor: lorong orbit, mulut ramp, Kotak Clawd, lajur atas, inlane, outlane, spinner */
export const SENSOR = {
  orbit: [{ x1: 20, x2: 60, y1: 370, y2: 415 }, { x1: 430, x2: 470, y1: 370, y2: 415 }],
  ramp: [{ x: 130, y: 470, r: 17 }, { x: 360, y: 470, r: 17 }],
  kotak: { x: 245, y: 462, r: 15 },
  lajurAtas: [195, 245, 295].map((x) => ({ x1: x - 21, x2: x + 21, y: 120 })),
  inlane: [{ x1: 64, x2: 100, y1: 745, y2: 790 }, { x1: 390, x2: 426, y1: 745, y2: 790 }],
  outlane: [{ x1: 20, x2: 62, y1: 860, y2: 905 }, { x1: 428, x2: 470, y1: 860, y2: 905 }],
  spinner: { x1: 20, x2: 60, y: 440 }
};

/* lintasan rel ramp (x, y, tinggi dalam satuan meja/100) — dari mulut ramp ke inlane sisi yang sama */
const RAMP_KIRI = [[130, 466, 0], [125, 420, 0.22], [118, 360, 0.42], [104, 322, 0.52], [88, 330, 0.55], [80, 380, 0.52], [80, 480, 0.44], [81, 600, 0.3], [81, 690, 0.14], [81, 752, 0.02]];
export const RAMP = [RAMP_KIRI, RAMP_KIRI.map(([x, y, h]) => [cerminX(x), y, h])];
export const RAMP_KELUAR = [{ x: 81, y: 756, vx: 0, vy: 380 }, { x: cerminX(81), y: 756, vx: 0, vy: 380 }];

/* 4 tembakan jawaban dari kiri ke kanan: orbit kiri, ramp kiri, ramp kanan, orbit kanan */
export const TEMBAKAN = [
  { nama: 'orbitKiri', x: 40, y: 500, label: { x: 40, y: 520 } },
  { nama: 'rampKiri', x: 145, y: 555, label: { x: 145, y: 585 } },
  { nama: 'rampKanan', x: 345, y: 555, label: { x: 345, y: 585 } },
  { nama: 'orbitKanan', x: 450, y: 500, label: { x: 450, y: 520 } }
];
export const WARNA_JAWAB = ['#2f8cff', '#29c06f', '#ffc531', '#e94bd6'];
