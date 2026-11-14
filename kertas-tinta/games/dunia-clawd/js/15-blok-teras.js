/* Dunia Clawd v2: teras dunia blok (voxel). Grid Uint8, tekstur piksel dijana kanvas (lukisan sendiri),
   mesh per ketulan 16×16 dengan bayang sudut (AO), raycast DDA, kotak tabrakan untuk enjin AABB.
   Satu blok = 4 unit (pemain tinggi 5 unit = 1¼ blok, lompat 6.4 unit = 1 blok). */
import * as THREE from 'three';
import { t } from './01-teks.js';

export const B = 4, CH = 16;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ---------- atlas tekstur 8×8 jubin, 16 px setiap jubin ---------- */
const JUB = 16, NJ = 8, AT = JUB * NJ;
let atlasKanvas = null, atlasTx = null;
function hashPx(x, y, s) { let h = Math.imul(x + 31, 374761393) ^ Math.imul(y + 17, 668265263) ^ Math.imul(s + 7, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
/* setiap jubin: fungsi (x, y, r) → [warna, alfa] ; r = bising 0..1 */
const JUBIN = {
  0: (x, y, r) => [mix('#5f9e46', '#7cbc58', r), 1], // rumput atas
  1: (x, y, r) => y < 3 + (hashPx(x, 0, 9) < 0.5 ? 1 : 0) ? [mix('#5f9e46', '#7cbc58', r), 1] : [mix('#7d5536', '#9a6a44', r), 1], // rumput sisi
  2: (x, y, r) => [mix('#7d5536', '#9a6a44', r), 1],
  3: (x, y, r) => [mix('#7f8288', '#9a9da3', r), 1],
  4: (x, y, r) => [mix('#d9c385', '#ead79f', r), 1],
  5: (x, y, r) => [x % 4 === 0 || (x + y * 3) % 11 === 0 ? mix('#4e331d', '#5c3d24', r) : mix('#6d4a2a', '#7e5733', r), 1], // kulit kayu
  6: (x, y) => { const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)); return [d > 6.5 ? '#6d4a2a' : Math.floor(d) % 2 ? '#a77b4b' : '#c4955e', 1]; }, // hujung kayu
  7: (x, y, r) => r < 0.12 ? ['#000000', 0] : [mix('#2f6e33', '#4f9a4a', r), 1], // daun berlubang
  8: (x, y, r) => [y % 4 === 3 ? '#86602f' : (x + (Math.floor(y / 4) % 2) * 8) % 16 === 0 ? '#8f6735' : mix('#b8874e', '#c99a5e', r), 1], // papan
  9: (x, y) => (x === 0 || y === 0 || x === 15 || y === 15) ? ['#d9eefc', 1] : (x === y + 3 && x < 8) || (x === y + 4 && x < 9) ? ['#ffffff', 0.9] : ['#000000', 0], // kaca
  10: (x, y, r) => { const b = Math.floor(y / 4), o = b % 2 ? 4 : 0; return [y % 4 === 0 || (x + o) % 8 === 0 ? '#d4c7b0' : mix('#a84a35', '#c25e45', r), 1]; }, // bata
  11: (x, y, r) => [mix('#e6edf6', '#ffffff', r), 1],
  12: (x, y, r) => y < 4 + (hashPx(x, 1, 3) < 0.5 ? 1 : 0) ? [mix('#e6edf6', '#ffffff', r), 1] : [mix('#7d5536', '#9a6a44', r), 1],
  13: (x, y, r) => [mix('#2f6fc4', '#4b8be0', r), 1], // air
  14: (x, y, r) => [bijih(x, y, 21) ? mix('#1d1d22', '#34343c', r) : mix('#7f8288', '#9a9da3', r), 1],
  15: (x, y, r) => [bijih(x, y, 33) ? mix('#c88a5c', '#e7b08a', r) : mix('#7f8288', '#9a9da3', r), 1],
  16: (x, y, r) => [bijih(x, y, 47) ? (r > 0.6 ? '#c9fff6' : '#48d6c4') : mix('#7f8288', '#9a9da3', r), 1],
  17: (x, y, r) => [x === 0 || y === 0 ? '#fff0b8' : x === 15 || y === 15 ? '#b48f42' : mix('#d9ad4a', '#efc865', r), 1],
  18: (x, y, r) => [x < 2 || y < 2 || x > 13 || y > 13 ? '#8a5a1e' : mix('#ffd36b', '#fff1b8', r), 1], // lampu
  19: (x, y, r) => [mix('#24242c', '#3b3b46', r), 1],
  20: (x, y, r) => [mix('#e8531f', '#ffb43c', (r + Math.sin((x + y) * 0.7) * 0.3 + 0.3) % 1), 1], // lava
  21: (x, y, r) => [mix('#dedede', '#ffffff', r * 0.8 + ((x + y) % 3 === 0 ? 0.2 : 0)), 1], // bulu (diwarnakan verteks)
  22: (x, y, r) => [x === 0 || y === 0 || x === 15 || y === 15 || x === 7 || y === 7 ? '#5c3d24' : mix('#b8874e', '#c99a5e', r), 1], // meja atas
  23: (x, y, r) => [y < 3 ? '#5c3d24' : (x > 3 && x < 7 && y > 5 && y < 12) ? '#8a9099' : (x > 9 && x < 12 && y > 4) ? '#6d4a2a' : mix('#b8874e', '#c99a5e', r), 1],
  24: (x, y, r) => [y === 6 || y === 7 ? '#3e2a17' : (x > 6 && x < 9 && y > 4 && y < 9) ? '#d9b25f' : (x === 0 || x === 15 || y === 0 || y === 15) ? '#5c3d24' : mix('#a0703a', '#b98447', r), 1], // peti
  25: (x, y, r) => [x % 5 === 2 ? '#2f6e33' : mix('#4f9a4a', '#5fae58', r), 1],
  26: (x, y, r) => [x === 0 || y === 0 || x === 15 || y === 15 ? '#2f6e33' : mix('#5fae58', '#74c26a', r), 1],
  27: (x, y, r) => y > 10 ? [mix('#5c3d24', '#7e5733', r), 1] : [mix('#ff9a2e', '#ffe08a', (r + y / 10) % 1), Math.abs(x - 7.5) < 7 - y * 0.3 ? 1 : 0.0], // unggun
  28: (x, y, r) => { const b = Math.floor(y / 8), o = b % 2 ? 8 : 0; return [y % 8 === 0 || (x + o) % 16 === 0 ? '#5d6066' : mix('#878a90', '#a2a5ab', r), 1]; },
  29: (x, y, r) => [hashPx(x >> 1, y >> 1, 5) < 0.35 ? mix('#4f7d3a', '#6a9a4a', r) : mix('#7f8288', '#9a9da3', r), 1],
  30: (x, y, r) => [x % 4 === 1 ? '#b8611f' : mix('#e2862e', '#f09a3e', r), 1], // labu sisi
  31: (x, y, r) => [(x - 7.5) ** 2 + (y - 7.5) ** 2 < 4 ? '#4f7d3a' : mix('#e2862e', '#f09a3e', r), 1],
  32: (x, y, r) => [mix('#3d2a5c', '#5a4290', r), 1] // portal ungu
};
function bijih(x, y, s) { const cx = (Math.floor(x / 4) * 4 + 2), cy = (Math.floor(y / 4) * 4 + 2); return hashPx(cx, cy, s) < 0.55 && Math.abs(x - cx) + Math.abs(y - cy) < 2.2; }
function mix(a, b, k) { const A = hx(a), Bc = hx(b); return [A[0] + (Bc[0] - A[0]) * k, A[1] + (Bc[1] - A[1]) * k, A[2] + (Bc[2] - A[2]) * k]; }
export function atlas() {
  if (atlasTx) return atlasTx;
  const c = document.createElement('canvas'); c.width = c.height = AT; const g = c.getContext('2d'), im = g.createImageData(AT, AT);
  for (const k in JUBIN) {
    const i = Number(k), ox = (i % NJ) * JUB, oy = Math.floor(i / NJ) * JUB;
    for (let y = 0; y < JUB; y++) for (let x = 0; x < JUB; x++) {
      const r = hashPx(x, y, i * 13 + 1);
      let [w, a] = JUBIN[k](x, y, r); if (typeof w === 'string') w = hx(w);
      const p = ((oy + y) * AT + ox + x) * 4; im.data[p] = w[0]; im.data[p + 1] = w[1]; im.data[p + 2] = w[2]; im.data[p + 3] = Math.round(a * 255);
    }
  }
  g.putImageData(im, 0, 0); atlasKanvas = c;
  const tx = new THREE.CanvasTexture(c); tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.NearestFilter; tx.generateMipmaps = false; tx.colorSpace = THREE.SRGBColorSpace; tx.userData = {};
  atlasTx = tx; return tx;
}

const WB = {};
export function warnaBlok(id) {
  if (WB[id]) return WB[id]; atlas(); const d = BLOK[id]; if (!d) return '#888888';
  if (d.tint) return WB[id] = d.tint;
  const i = d.t[1], g = atlasKanvas.getContext('2d'), im = g.getImageData((i % NJ) * JUB + 4, Math.floor(i / NJ) * JUB + 6, 8, 8).data; let r = 0, gg = 0, b = 0, n = 0;
  for (let k = 0; k < im.length; k += 4) if (im[k + 3] > 100) { r += im[k]; gg += im[k + 1]; b += im[k + 2]; n++; }
  n = n || 1; return WB[id] = '#' + [r, gg, b].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('');
}
export function bahanTangan(id) {
  const d = BLOK[id]; if (!d) return null; const key = 'tg' + id; if (WB[key]) return WB[key];
  const tx = atlas().clone(); const i = d.t[1]; tx.repeat.set((JUB - 1) / AT, (JUB - 1) / AT); tx.offset.set((i % NJ) * JUB / AT + 0.5 / AT, 1 - (Math.floor(i / NJ) + 1) * JUB / AT + 0.5 / AT); tx.needsUpdate = true; tx.userData = {};
  const m = new THREE.MeshLambertMaterial({ map: tx, color: d.tint || '#ffffff' }); m.userData.kongsi = true; return WB[key] = m;
}

/* ---------- jenis blok ---------- */
// t: [atas, sisi, bawah]; k: kekerasan (pukulan, Infinity = tak boleh pecah); p: pas (padu/potong/cair/cahaya)
export const BLOK = [];
const blk = (id, k, n, tl, o = {}) => { BLOK[id] = { id, k: k, n, t: tl, keras: o.keras ?? 1, pas: o.pas || 'padu', pepejal: o.pepejal ?? true, tint: o.tint || null, dapat: o.dapat ?? id, kreatif: o.kreatif ?? true, kunci: o.kunci || false, mati: o.mati || false, cecair: o.cecair || false }; };
blk(1, 'rumput', ['Rumput', 'Grass', 'Rumput'], [0, 1, 2], { dapat: 2 });
blk(2, 'tanah', ['Tanah', 'Dirt', 'Tanah'], [2, 2, 2]);
blk(3, 'batu', ['Batu', 'Stone', 'Batu'], [3, 3, 3], { keras: 3 });
blk(4, 'pasir', ['Pasir', 'Sand', 'Pasir'], [4, 4, 4]);
blk(5, 'kayu', ['Kayu Balak', 'Log', 'Kayu Gelondong'], [6, 5, 6], { keras: 2 });
blk(6, 'daun', ['Daun', 'Leaves', 'Daun'], [7, 7, 7], { pas: 'potong', dapat: 0 });
blk(7, 'papan', ['Papan', 'Planks', 'Papan'], [8, 8, 8], { keras: 2 });
blk(8, 'kaca', ['Kaca', 'Glass', 'Kaca'], [9, 9, 9], { pas: 'potong', dapat: 0 });
blk(9, 'bata', ['Bata', 'Bricks', 'Bata'], [10, 10, 10], { keras: 3 });
blk(10, 'salji', ['Salji', 'Snow', 'Salju'], [11, 12, 2]);
blk(11, 'air', ['Air', 'Water', 'Air'], [13, 13, 13], { pas: 'cair', pepejal: false, cecair: true, dapat: 0 });
blk(12, 'arang', ['Bijih Arang', 'Coal Ore', 'Bijih Arang'], [14, 14, 14], { keras: 3, dapat: 100, kreatif: false });
blk(13, 'besi', ['Bijih Besi', 'Iron Ore', 'Bijih Besi'], [15, 15, 15], { keras: 4, dapat: 101, kreatif: false });
blk(14, 'permata', ['Bijih Permata', 'Gem Ore', 'Bijih Permata'], [16, 16, 16], { keras: 5, dapat: 102, kreatif: false });
blk(15, 'emas', ['Blok Emas', 'Gold Block', 'Blok Emas'], [17, 17, 17], { keras: 3, kunci: true });
blk(16, 'lampu', ['Lampu', 'Lamp', 'Lampu'], [18, 18, 18], { pas: 'cahaya' });
blk(17, 'dasar', ['Batu Dasar', 'Bedrock', 'Batu Dasar'], [19, 19, 19], { keras: Infinity, kreatif: false });
blk(18, 'lava', ['Lava', 'Lava', 'Lava'], [20, 20, 20], { pas: 'cahaya', pepejal: false, cecair: true, mati: true, dapat: 0, kunci: true });
blk(19, 'meja', ['Meja Rakit', 'Crafting Table', 'Meja Rakit'], [22, 23, 8], { keras: 2 });
blk(20, 'peti', ['Peti', 'Chest', 'Peti'], [8, 24, 8], { keras: 2, kunci: true });
blk(21, 'kaktus', ['Kaktus', 'Cactus', 'Kaktus'], [26, 25, 26]);
blk(22, 'unggun', ['Unggun Api', 'Campfire', 'Api Unggun'], [27, 27, 8], { pas: 'cahaya', kunci: true });
blk(23, 'bataBatu', ['Bata Batu', 'Stone Bricks', 'Bata Batu'], [28, 28, 28], { keras: 3 });
blk(24, 'lumut', ['Batu Berlumut', 'Mossy Stone', 'Batu Berlumut'], [29, 29, 29], { keras: 3, kunci: true });
blk(25, 'labu', ['Labu', 'Pumpkin', 'Labu'], [31, 30, 30], { kunci: true });
blk(26, 'portal', ['Blok Ungu', 'Purple Block', 'Blok Ungu'], [32, 32, 32], { kunci: true });
const BULU = [['putih', '#f2f2f2', 'Putih', 'White', 'Putih'], ['merah', '#c8473a', 'Merah', 'Red', 'Merah'], ['oren', '#e58a3a', 'Oren', 'Orange', 'Oranye'], ['kuning', '#efcf4a', 'Kuning', 'Yellow', 'Kuning'], ['hijau', '#6aa84f', 'Hijau', 'Green', 'Hijau'], ['biru', '#4a78c8', 'Biru', 'Blue', 'Biru'], ['ungu', '#8a62c0', 'Ungu', 'Purple', 'Ungu'], ['hitam', '#2a2a30', 'Hitam', 'Black', 'Hitam'], ['merahJambu', '#ee9ab6', 'Merah Jambu', 'Pink', 'Merah Muda'], ['coklat', '#7d5536', 'Coklat', 'Brown', 'Cokelat']];
BULU.forEach(([k, w, a, b, c], i) => blk(30 + i, 'bulu_' + k, ['Bulu ' + a, b + ' Wool', 'Wol ' + c], [21, 21, 21], { tint: w, kunci: i > 3 }));
/* barang (bukan blok) */
export const BARANG = {
  100: { n: ['Arang', 'Coal', 'Arang'] }, 101: { n: ['Besi', 'Iron', 'Besi'] }, 102: { n: ['Permata', 'Gem', 'Permata'] }, 103: { n: ['Lendir', 'Slime', 'Lendir'] },
  110: { n: ['Beliung Kayu', 'Wood Pickaxe', 'Beliung Kayu'], alat: 'beliung', tahap: 1 }, 111: { n: ['Beliung Batu', 'Stone Pickaxe', 'Beliung Batu'], alat: 'beliung', tahap: 2 }, 112: { n: ['Beliung Besi', 'Iron Pickaxe', 'Beliung Besi'], alat: 'beliung', tahap: 3 },
  120: { n: ['Pedang Kayu', 'Wood Sword', 'Pedang Kayu'], alat: 'pedang', tahap: 1 }, 121: { n: ['Pedang Batu', 'Stone Sword', 'Pedang Batu'], alat: 'pedang', tahap: 2 }, 122: { n: ['Pedang Besi', 'Iron Sword', 'Pedang Besi'], alat: 'pedang', tahap: 3 }
};
export const namaId = (id) => { const d = BLOK[id] || BARANG[id]; return d ? t(...d.n) : '?'; };
export const padat = (id) => id > 0 && BLOK[id] && BLOK[id].pas !== 'potong' && BLOK[id].pas !== 'cair' && !BLOK[id].cecair;
export const pepejal = (id) => id > 0 && BLOK[id] && BLOK[id].pepejal;

/* ikon kecil isometrik untuk hotbar / beg (dataURL) */
const IKON = {};
export function ikon(id) {
  if (IKON[id]) return IKON[id]; atlas();
  const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const d = BLOK[id];
  if (d) {
    const tile = (i) => [(i % NJ) * JUB, Math.floor(i / NJ) * JUB];
    const muka = (i, m, gelap) => { const [sx, sy] = tile(i); g.save(); g.setTransform(...m); g.drawImage(atlasKanvas, sx, sy, JUB, JUB, 0, 0, JUB, JUB); if (gelap) { g.fillStyle = `rgba(0,0,0,${gelap})`; g.fillRect(0, 0, JUB, JUB); } g.restore(); };
    muka(d.t[0], [0.9, 0.45, -0.9, 0.45, 16, 2], 0); // atas
    muka(d.t[1], [0.9, 0.45, 0, 0.95, 1.6, 9.2], 0.22); // kiri
    muka(d.t[1], [0.9, -0.45, 0, 0.95, 16, 16.4], 0.38); // kanan
    if (d.tint) { g.globalCompositeOperation = 'multiply'; g.fillStyle = d.tint; g.fillRect(0, 0, 32, 32); g.globalCompositeOperation = 'destination-in'; muka(d.t[0], [0.9, 0.45, -0.9, 0.45, 16, 2]); muka(d.t[1], [0.9, 0.45, 0, 0.95, 1.6, 9.2]); muka(d.t[1], [0.9, -0.45, 0, 0.95, 16, 16.4]); g.globalCompositeOperation = 'source-over'; }
  } else lukisBarang(g, id);
  return IKON[id] = c.toDataURL();
}
function lukisBarang(g, id) {
  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x * 2, y * 2, w * 2, h * 2); };
  const b = BARANG[id] || {};
  if (id === 100) { px(4, 5, 8, 7, '#1d1d22'); px(5, 4, 5, 2, '#34343c'); px(6, 7, 2, 2, '#4a4a55'); }
  else if (id === 101) { px(3, 7, 10, 4, '#c9cdd4'); px(4, 6, 8, 2, '#e8ebef'); px(3, 10, 10, 1, '#8a9099'); }
  else if (id === 102) { px(5, 4, 6, 2, '#c9fff6'); px(4, 6, 8, 3, '#48d6c4'); px(5, 9, 6, 2, '#2fb3a3'); px(7, 11, 2, 2, '#1f8a7e'); }
  else if (id === 103) { px(4, 6, 8, 7, '#8a62c0'); px(5, 5, 6, 1, '#a985d8'); px(6, 8, 1, 2, '#1c1612'); px(9, 8, 1, 2, '#1c1612'); }
  else if (b.alat) {
    const w = ['#b8874e', '#9a9da3', '#e8ebef'][b.tahap - 1];
    if (b.alat === 'beliung') { px(7, 5, 2, 9, '#6d4a2a'); px(3, 3, 10, 2, w); px(2, 4, 2, 2, w); px(12, 4, 2, 2, w); }
    else { px(7, 2, 2, 9, w); px(6, 3, 1, 7, w); px(5, 11, 6, 1, '#d9b25f'); px(7, 12, 2, 3, '#6d4a2a'); }
  }
}

/* ---------- bising untuk medan ---------- */
function hash(x, y, s) { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function hash3(x, y, z, s) { return hash(x + Math.imul(z, 7919), y, s); }
const lic = (k) => k * k * (3 - 2 * k);
function vn(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), u = lic(x - xi), v = lic(y - yi); const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function vn3(x, y, z, s) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), u = lic(x - xi), v = lic(y - yi), w = lic(z - zi), L = (a, b, k) => a + (b - a) * k;
  const c = (i, j, k) => hash3(xi + i, yi + j, zi + k, s);
  return L(L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v), L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
function fbm(x, y, s, o = 4) { let tt = 0, a = 1, f = 1, n = 0; for (let i = 0; i < o; i++) { tt += vn(x * f, y * f, s + i * 17) * a; n += a; a *= 0.5; f *= 2; } return tt / n; }
export function rng(seed) { let s = seed >>> 0 || 1; return () => { s = Math.imul(s ^ (s >>> 15), 1 | s); s ^= s + Math.imul(s ^ (s >>> 7), 61 | s); return ((s ^ (s >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- grid ---------- */
export class Grid {
  constructor(nx, ny, nz) { this.nx = nx; this.ny = ny; this.nz = nz; this.d = new Uint8Array(nx * ny * nz); this.ox = -nx * B / 2; this.oz = -nz * B / 2; this.kotor = new Set(); this.ubah = new Map(); }
  dalam(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < this.nx && y < this.ny && z < this.nz; }
  get(x, y, z) { return this.dalam(x, y, z) ? this.d[x + this.nx * (z + this.nz * y)] : 0; }
  setMentah(x, y, z, id) { if (this.dalam(x, y, z)) this.d[x + this.nx * (z + this.nz * y)] = id; }
  set(x, y, z, id, rekod = true) {
    if (!this.dalam(x, y, z)) return false; const i = x + this.nx * (z + this.nz * y); if (this.d[i] === id) return false;
    this.d[i] = id; if (rekod) this.ubah.set(i, id);
    const cx = Math.floor(x / CH), cz = Math.floor(z / CH); this.kotor.add(cx + ',' + cz);
    if (x % CH === 0) this.kotor.add((cx - 1) + ',' + cz); if (x % CH === CH - 1) this.kotor.add((cx + 1) + ',' + cz);
    if (z % CH === 0) this.kotor.add(cx + ',' + (cz - 1)); if (z % CH === CH - 1) this.kotor.add(cx + ',' + (cz + 1));
    return true;
  }
  sel(wx, wy, wz) { return [Math.floor((wx - this.ox) / B), Math.floor(wy / B), Math.floor((wz - this.oz) / B)]; }
  pusat(x, y, z) { return V(this.ox + (x + 0.5) * B, (y + 0.5) * B, this.oz + (z + 0.5) * B); }
  /* pepejal untuk tabrakan: luar sempadan mendatar = dinding */
  pej(x, y, z) { if (y < 0) return true; if (y >= this.ny) return false; if (x < 0 || z < 0 || x >= this.nx || z >= this.nz) return true; return pepejal(this.get(x, y, z)); }
  atas(x, z) { for (let y = this.ny - 1; y >= 0; y--) if (pepejal(this.get(x, y, z))) return y; return -1; }
}

/* ---------- penjana medan ---------- */
export const JENIS_DUNIA = {
  padang: { n: ['Padang', 'Plains', 'Padang'], asas: 9, amp: 8, sk: 1 / 22, air: 8, pokok: 0.022 },
  hutan: { n: ['Hutan', 'Forest', 'Hutan'], asas: 9, amp: 5, sk: 1 / 26, air: 6, pokok: 0.075 },
  gurun: { n: ['Gurun', 'Desert', 'Gurun'], asas: 8, amp: 5, sk: 1 / 18, air: 5, pokok: 0.012, pasir: true },
  salji: { n: ['Gunung Salji', 'Snow Peaks', 'Gunung Salju'], asas: 9, amp: 12, sk: 1 / 20, air: 8, pokok: 0.018, salji: true },
  pulau: { n: ['Pulau', 'Islands', 'Pulau'], asas: 5, amp: 11, sk: 1 / 16, air: 9, pokok: 0.03, pulau: true },
  rata: { n: ['Rata', 'Flat', 'Datar'], asas: 6, amp: 0, sk: 1, air: -1, pokok: 0 },
  gua: { n: ['Gua', 'Caves', 'Gua'], gua: true }
};
export function jana(G, jenis, seed) {
  const J = JENIS_DUNIA[jenis] || JENIS_DUNIA.padang, R = rng(seed * 7 + 3), { nx, ny, nz } = G;
  if (J.gua) return janaGua(G, seed, R);
  const tinggi = new Int16Array(nx * nz);
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    let h = J.asas + (fbm(x * J.sk, z * J.sk, seed) - 0.5) * 2 * J.amp;
    if (J.pulau) { const dx = (x - nx / 2) / (nx / 2), dz = (z - nz / 2) / (nz / 2); const r = Math.hypot(dx, dz); h = J.asas + (fbm(x * J.sk, z * J.sk, seed) * 1.2 - r * 0.9) * J.amp + 3; }
    if (J.salji) h += Math.max(0, fbm(x / 40, z / 40, seed + 9) - 0.55) * 30;
    h = Math.max(2, Math.min(ny - 8, Math.round(h))); tinggi[x + z * nx] = h;
    for (let y = 0; y <= h; y++) {
      let id = 3;
      if (y === 0) id = 17;
      else if (y === h) id = J.pasir || h <= J.air + 1 ? 4 : J.salji && h > J.asas + 3 ? 10 : 1;
      else if (y > h - 3) id = J.pasir || h <= J.air + 1 ? 4 : 2;
      else { const r = hash3(x, y, z, seed + 5); if (r < 0.012) id = 12; else if (y < 7 && r < 0.019) id = 13; else if (y < 5 && r < 0.0215) id = 14; }
      G.setMentah(x, y, z, id);
    }
    for (let y = h + 1; y <= J.air; y++) G.setMentah(x, y, z, 11);
  }
  // gua kecil di bawah tanah
  for (let z = 1; z < nz - 1; z++) for (let x = 1; x < nx - 1; x++) for (let y = 2; y < tinggi[x + z * nx] - 3; y++) if (vn3(x / 7, y / 5, z / 7, seed + 11) > 0.74) G.setMentah(x, y, z, 0);
  // pokok / kaktus
  for (let z = 3; z < nz - 3; z++) for (let x = 3; x < nx - 3; x++) {
    const h = tinggi[x + z * nx], atas = G.get(x, h, z); if (R() > J.pokok) continue;
    if (atas === 4 && J.pasir) { const k = 2 + Math.floor(R() * 2); for (let i = 1; i <= k; i++) G.setMentah(x, h + i, z, 21); continue; }
    if (atas !== 1 && atas !== 10) continue;
    pokok(G, x, h + 1, z, J.salji ? 'cemara' : 'biasa', R);
  }
  return tinggi;
}
export function pokok(G, x, y, z, jenis, R) {
  const tg = 4 + Math.floor(R() * 2);
  for (let i = 0; i < tg; i++) G.setMentah(x, y + i, z, 5);
  if (jenis === 'cemara') { for (let l = 0; l < 4; l++) { const r = l < 2 ? 2 - l : 1, yy = y + tg - 2 + l; for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if ((dx || dz || l === 3) && !G.get(x + dx, yy, z + dz)) G.setMentah(x + dx, yy, z + dz, 6); } G.setMentah(x, y + tg + 2, z, 6); return; }
  for (let l = -2; l <= 1; l++) {
    const r = l < 0 ? 2 : 1, yy = y + tg + l;
    for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { if (Math.abs(dx) === r && Math.abs(dz) === r && (r === 2 || R() < 0.5)) continue; if (!G.get(x + dx, yy, z + dz)) G.setMentah(x + dx, yy, z + dz, 6); }
  }
}
function janaGua(G, seed, R) {
  const { nx, ny, nz } = G;
  for (let y = 0; y < ny; y++) for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    let id = y === 0 || y >= ny - 2 ? 17 : 3;
    if (id === 3) {
      const n = vn3(x / 6, y / 4, z / 6, seed) * 0.65 + vn3(x / 13, y / 8, z / 13, seed + 4) * 0.35;
      const tengah = Math.hypot(x - nx / 2, z - nz / 2) < 5 && y > 2 && y < 7;
      if (n > 0.56 || tengah) id = 0;
      else { const r = hash3(x, y, z, seed + 5); if (r < 0.03) id = 12; else if (r < 0.048) id = 13; else if (r < 0.06 && y > 6) id = 24; }
    }
    G.setMentah(x, y, z, id);
  }
  // lampu & permata pada dinding gua yang terdedah
  const tepi = [];
  for (let y = 2; y < ny - 3; y++) for (let z = 1; z < nz - 1; z++) for (let x = 1; x < nx - 1; x++) {
    if (G.get(x, y, z) !== 3) continue;
    if (!G.get(x + 1, y, z) || !G.get(x - 1, y, z) || !G.get(x, y + 1, z) || !G.get(x, y, z + 1) || !G.get(x, y, z - 1)) tepi.push([x, y, z]);
  }
  for (let i = 0; i < tepi.length; i++) { const r = R(); const [x, y, z] = tepi[i]; if (r < 0.03) G.setMentah(x, y, z, 16); }
  return tepi;
}

/* ---------- mesh ---------- */
const MUKA = [
  { n: [-1, 0, 0], c: [[0, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 1]], uv: [[0, 1], [0, 0], [1, 1], [1, 0]], j: 1 },
  { n: [1, 0, 0], c: [[1, 1, 1], [1, 0, 1], [1, 1, 0], [1, 0, 0]], uv: [[0, 1], [0, 0], [1, 1], [1, 0]], j: 1 },
  { n: [0, -1, 0], c: [[1, 0, 1], [0, 0, 1], [1, 0, 0], [0, 0, 0]], uv: [[1, 0], [0, 0], [1, 1], [0, 1]], j: 2 },
  { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [0, 1, 0], [1, 1, 0]], uv: [[1, 1], [0, 1], [1, 0], [0, 0]], j: 0 },
  { n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [1, 1, 0], [0, 1, 0]], uv: [[0, 0], [1, 0], [0, 1], [1, 1]], j: 1 },
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]], uv: [[0, 0], [1, 0], [0, 1], [1, 1]], j: 1 }
];
const AO = [0.52, 0.68, 0.84, 1];
const _w = new THREE.Color();
let BAHAN = null;
export function bahanBlok() {
  if (BAHAN) return BAHAN; const map = atlas();
  const ks = (m) => { m.userData.kongsi = true; return m; };
  BAHAN = {
    padu: ks(new THREE.MeshLambertMaterial({ map, vertexColors: true })),
    potong: ks(new THREE.MeshLambertMaterial({ map, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide })),
    cair: ks(new THREE.MeshLambertMaterial({ map, vertexColors: true, transparent: true, opacity: 0.74, depthWrite: false })),
    cahaya: ks(new THREE.MeshBasicMaterial({ map, vertexColors: true, toneMapped: false }))
  };
  return BAHAN;
}
export class Penyusun {
  constructor(G, induk, bayang) { this.G = G; this.induk = induk; this.bayang = bayang; this.m = new Map(); }
  semua() { const { nx, nz } = this.G; for (let cz = 0; cz < Math.ceil(nz / CH); cz++) for (let cx = 0; cx < Math.ceil(nx / CH); cx++) this.bina(cx, cz); this.G.kotor.clear(); }
  kemas(maks = 3) { let n = 0; for (const k of this.G.kotor) { this.G.kotor.delete(k); const [cx, cz] = k.split(',').map(Number); if (cx >= 0 && cz >= 0 && cx * CH < this.G.nx && cz * CH < this.G.nz) { this.bina(cx, cz); if (++n >= maks) break; } } }
  bina(cx, cz) {
    const G = this.G, K = cx + ',' + cz, lama = this.m.get(K); if (lama) for (const m of lama) { this.induk.remove(m); m.geometry.dispose(); }
    const buf = { padu: baru(), potong: baru(), cair: baru(), cahaya: baru() }, u0 = 0.5 / AT, us = (JUB - 1) / AT;
    const x0 = cx * CH, z0 = cz * CH, x1 = Math.min(G.nx, x0 + CH), z1 = Math.min(G.nz, z0 + CH);
    for (let y = 0; y < G.ny; y++) for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) {
      const id = G.d[x + G.nx * (z + G.nz * y)]; if (!id) continue; const D = BLOK[id]; if (!D) continue;
      const pas = D.pas, bf = buf[pas];
      const airAtas = D.cecair && G.get(x, y + 1, z) !== id;
      for (const F of MUKA) {
        const nb = G.get(x + F.n[0], y + F.n[1], z + F.n[2]);
        if (y + F.n[1] < 0) continue;
        if (pas === 'padu' || pas === 'cahaya') { if (padat(nb)) continue; }
        else if (pas === 'potong') { if (nb === id && id === 8) continue; if (padat(nb)) continue; }
        else if (pas === 'cair') { if (nb === id || padat(nb)) continue; if (nb && BLOK[nb] && BLOK[nb].pas === 'potong') continue; }
        const tile = D.t[F.j], tu = (tile % NJ) * JUB / AT + u0, tv = 1 - (Math.floor(tile / NJ) + 1) * JUB / AT + u0;
        if (D.tint) _w.set(D.tint); else _w.setRGB(1, 1, 1);
        const k = bf.p.length / 3;
        for (let c = 0; c < 4; c++) {
          const C = F.c[c]; let py = (y + C[1]) * B; if (airAtas && C[1] === 1) py -= B * 0.14;
          bf.p.push(G.ox + (x + C[0]) * B, py, G.oz + (z + C[2]) * B); bf.n.push(F.n[0], F.n[1], F.n[2]);
          bf.u.push(tu + F.uv[c][0] * us, tv + F.uv[c][1] * us);
          let ao = 1;
          if (pas === 'padu') {
            const ax = F.n[0] ? [1, 2] : F.n[1] ? [0, 2] : [0, 1], o = [x + F.n[0], y + F.n[1], z + F.n[2]];
            const d1 = C[ax[0]] ? 1 : -1, d2 = C[ax[1]] ? 1 : -1;
            const a = o.slice(); a[ax[0]] += d1; const b2 = o.slice(); b2[ax[1]] += d2; const cc = o.slice(); cc[ax[0]] += d1; cc[ax[1]] += d2;
            const s1 = padat(G.get(a[0], a[1], a[2])) ? 1 : 0, s2 = padat(G.get(b2[0], b2[1], b2[2])) ? 1 : 0, s3 = padat(G.get(cc[0], cc[1], cc[2])) ? 1 : 0;
            ao = AO[s1 && s2 ? 0 : 3 - (s1 + s2 + s3)];
          }
          bf.c.push(_w.r * ao, _w.g * ao, _w.b * ao);
        }
        bf.i.push(k, k + 1, k + 2, k + 2, k + 1, k + 3);
      }
    }
    const M = bahanBlok(), out = [];
    for (const pas of ['padu', 'potong', 'cair', 'cahaya']) {
      const b = buf[pas]; if (!b.i.length) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(b.u, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(b.c, 3)); g.setIndex(b.i);
      g.computeBoundingSphere();
      const m = new THREE.Mesh(g, M[pas]); m.castShadow = this.bayang && pas !== 'cair'; m.receiveShadow = this.bayang && pas !== 'cahaya'; m.userData.blok = true;
      if (pas === 'cair') m.renderOrder = 3;
      this.induk.add(m); out.push(m);
    }
    this.m.set(K, out);
  }
  buang() { for (const arr of this.m.values()) for (const m of arr) { this.induk.remove(m); m.geometry.dispose(); } this.m.clear(); }
}
function baru() { return { p: [], n: [], u: [], c: [], i: [] }; }

/* ---------- raycast DDA ----------
   pilih: blok pertama bukan udara/cecair; kembali {x,y,z, nx,ny,nz, t} */
export function ddaa(G, o, d, maks, uji) {
  let gx = (o.x - G.ox) / B, gy = o.y / B, gz = (o.z - G.oz) / B;
  let x = Math.floor(gx), y = Math.floor(gy), z = Math.floor(gz);
  const sx = d.x > 0 ? 1 : -1, sy = d.y > 0 ? 1 : -1, sz = d.z > 0 ? 1 : -1;
  const tdx = d.x ? Math.abs(1 / d.x) : Infinity, tdy = d.y ? Math.abs(1 / d.y) : Infinity, tdz = d.z ? Math.abs(1 / d.z) : Infinity;
  let tmx = d.x ? (sx > 0 ? x + 1 - gx : gx - x) * tdx : Infinity, tmy = d.y ? (sy > 0 ? y + 1 - gy : gy - y) * tdy : Infinity, tmz = d.z ? (sz > 0 ? z + 1 - gz : gz - z) * tdz : Infinity;
  let tt = 0, nX = 0, nY = 0, nZ = 0; const lim = maks / B;
  for (let i = 0; i < 256 && tt <= lim; i++) {
    if (i > 0 && uji(x, y, z)) return { x, y, z, nx: nX, ny: nY, nz: nZ, t: tt * B };
    if (tmx < tmy && tmx < tmz) { x += sx; tt = tmx; tmx += tdx; nX = -sx; nY = 0; nZ = 0; }
    else if (tmy < tmz) { y += sy; tt = tmy; tmy += tdy; nX = 0; nY = -sy; nZ = 0; }
    else { z += sz; tt = tmz; tmz += tdz; nX = 0; nY = 0; nZ = -sz; }
  }
  return null;
}

/* ---------- penyambung ke enjin: E.dunia.vox ---------- */
export function sambungVox(G) {
  const kolam = []; let guna = 0;
  const kotak = () => { if (guna >= kolam.length) kolam.push({ aktif: true, vox: true, min: V(0, 0, 0), max: V(0, 0, 0) }); return kolam[guna++]; };
  return {
    G,
    sekitar(p) {
      guna = 0; const out = [];
      const x0 = Math.floor((p.x - 2 - G.ox) / B), x1 = Math.floor((p.x + 2 - G.ox) / B), z0 = Math.floor((p.z - 2 - G.oz) / B), z1 = Math.floor((p.z + 2 - G.oz) / B), y0 = Math.floor((p.y - 1.5) / B), y1 = Math.floor((p.y + 6.5) / B);
      for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
        if (!G.pej(x, y, z)) continue; const k = kotak();
        k.min.set(G.ox + x * B, y * B, G.oz + z * B); k.max.set(G.ox + (x + 1) * B, (y + 1) * B, G.oz + (z + 1) * B); out.push(k);
      }
      return out;
    },
    tanahDi(wx, wy, wz) { const [x, y0, z] = G.sel(wx, wy, wz); for (let y = Math.min(G.ny - 1, y0); y >= 0; y--) if (pepejal(G.get(x, y, z)) && (y + 1) * B <= wy + 0.01) return (y + 1) * B; return -Infinity; },
    ray(o, d, maks) { const h = ddaa(G, o, d, maks, (x, y, z) => padat(G.get(x, y, z))); return h ? h.t : -1; }
  };
}
