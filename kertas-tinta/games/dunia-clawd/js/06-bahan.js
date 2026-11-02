/* Dunia Clawd: blok berstud ala bata mainan. Semua blok statik disatukan jadi satu geometri berwarna verteks
   supaya draw call kecil (ratusan blok = 2 draw call). Tekstur dijana kanvas. */
import * as THREE from 'three';

function kanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function teksturStud() {
  const c = kanvas(128, 128), g = c.getContext('2d');
  g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(0,0,0,.09)'; g.lineWidth = 2; g.strokeRect(1, 1, 126, 126);
  g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(66, 68, 38, 38, 0, 0, 7); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(62, 62, 36, 0, 7); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 3; g.beginPath(); g.arc(62, 62, 36, 0.3, 2.6); g.stroke();
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function teksturSisi() {
  const c = kanvas(64, 64), g = c.getContext('2d');
  g.fillStyle = '#f0f0f0'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, 60, 64, 4); g.fillRect(60, 0, 4, 64);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
}
export const M = {};
export function siapkanBahan() {
  const top = teksturStud(), sisi = teksturSisi();
  M.atas = new THREE.MeshStandardMaterial({ map: top, vertexColors: true, roughness: 0.78, metalness: 0 });
  M.sisi = new THREE.MeshStandardMaterial({ map: sisi, vertexColors: true, roughness: 0.82, metalness: 0 });
  M.neon = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  M.kaca = new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.32, roughness: 0.2, depthWrite: false });
  M.licin = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 });
}
const warna = new THREE.Color();
const SKALA_STUD = 2; // satu stud setiap 2 unit

/* pengumpul permukaan: dua buffer (sisi, atas) */
export class Batch {
  constructor() { this.s = { p: [], n: [], u: [], c: [], i: [] }; this.a = { p: [], n: [], u: [], c: [], i: [] }; }
  get kosong() { return this.s.p.length + this.a.p.length === 0; }
  _muka(b, v, n, uu, vv, r, g, bl) {
    const k = b.p.length / 3;
    for (const q of v) b.p.push(q[0], q[1], q[2]);
    for (let i = 0; i < 4; i++) { b.n.push(n[0], n[1], n[2]); b.c.push(r, g, bl); }
    b.u.push(0, 0, uu, 0, uu, vv, 0, vv); b.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
  }
  /* kotak dari min ke max */
  tambah(x0, y0, z0, x1, y1, z1, warnaHex, warnaAtas) {
    warna.set(warnaHex); const r = warna.r, g = warna.g, b = warna.b;
    warna.set(warnaAtas || warnaHex); const ra = warna.r, ga = warna.g, ba = warna.b;
    const w = (x1 - x0) / SKALA_STUD, h = (y1 - y0) / SKALA_STUD, d = (z1 - z0) / SKALA_STUD;
    this._muka(this.a, [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], [0, 1, 0], w, d, ra, ga, ba);
    this._muka(this.s, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [0, -1, 0], w, d, r * 0.8, g * 0.8, b * 0.8);
    this._muka(this.s, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], w, h, r, g, b);
    this._muka(this.s, [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], [0, 0, -1], w, h, r, g, b);
    this._muka(this.s, [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], [1, 0, 0], d, h, r, g, b);
    this._muka(this.s, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], d, h, r, g, b);
  }
  geometri() {
    const s = this.s, a = this.a, off = s.p.length / 3, g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(s.p.concat(a.p), 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(s.n.concat(a.n), 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(s.u.concat(a.u), 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(s.c.concat(a.c), 3));
    g.setIndex(s.i.concat(a.i.map((i) => i + off)));
    g.addGroup(0, s.i.length, 0); g.addGroup(s.i.length, a.i.length, 1);
    return g;
  }
}
/* satu kotak berpusat di asal, untuk blok yang bergerak */
export function geoKotak(w, h, d, warnaHex, warnaAtas) { const b = new Batch(); b.tambah(-w / 2, -h / 2, -d / 2, w / 2, h / 2, d / 2, warnaHex, warnaAtas); return b.geometri(); }
export function bahanStud(lutsinar) {
  if (!lutsinar) return [M.sisi, M.atas];
  const a = M.atas.clone(), s = M.sisi.clone(); a.transparent = s.transparent = true; return [s, a];
}

/* ---------- teks atas kanvas: label lantai, papan tanda, tag nama ---------- */
const FON = '"Geist", system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF = '"Source Serif 4", Georgia, serif';
export function lukisTeks(c, baris, o = {}) {
  const g = c.getContext('2d'), W = c.width, H = c.height;
  g.clearRect(0, 0, W, H);
  if (o.bg) {
    g.fillStyle = o.bg;
    if (o.bucu) { g.beginPath(); g.roundRect(2, 2, W - 4, H - 4, o.bucu); g.fill(); if (o.garis) { g.strokeStyle = o.garis; g.lineWidth = o.tebalGaris || 4; g.stroke(); } }
    else g.fillRect(0, 0, W, H);
  }
  const arr = Array.isArray(baris) ? baris : [baris], jum = arr.reduce((s, b) => s + (b.s || 1), 0);
  let y = (o.padY ?? 0.1) * H; const tinggi = (H - y * 2) / jum;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const b0 of arr) {
    const b = typeof b0 === 'object' ? b0 : { t: String(b0) }, sc = b.s || 1, tb = tinggi * sc;
    let px = tb * 0.82; const fon = b.serif || o.serif ? SERIF : FON;
    g.font = `${b.b === false ? 500 : 700} ${px}px ${fon}`;
    const lebar = g.measureText(b.t).width, maks = W * 0.92; if (lebar > maks) { px *= maks / lebar; g.font = `${b.b === false ? 500 : 700} ${px}px ${fon}`; }
    g.fillStyle = b.c || o.fg || '#efe6d2'; g.fillText(b.t, W / 2, y + tb / 2 + px * 0.04); y += tb;
  }
}
export function teksTekstur(baris, o = {}) {
  const c = kanvas(o.w || 256, o.h || 128); lukisTeks(c, baris, o);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData = { c, o }; return t;
}
export function tukarTeks(t, baris, o2) { const o = o2 ? Object.assign(t.userData.o, o2) : t.userData.o; lukisTeks(t.userData.c, baris, o); t.needsUpdate = true; }
/* papan yang sentiasa menghadap kamera */
export function papanTeks(baris, lebar, o = {}) {
  const w = o.w || 512, h = o.h || Math.round(512 / (o.nisbah || 2)), tx = teksTekstur(baris, { bg: '#0c1526', bucu: 26, garis: '#d9b25f', ...o, w, h });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: o.tembusDepan ? false : true, depthWrite: false, fog: false, toneMapped: false }));
  sp.scale.set(lebar, lebar * h / w, 1); sp.userData.tx = tx; return sp;
}
/* label rata di atas permukaan */
export function labelRata(baris, w, d, o = {}) {
  const tx = teksTekstur(baris, { w: Math.round(256 * Math.max(1, w / d)), h: Math.round(256 * Math.max(1, d / w)), ...o });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, fog: true, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.userData.tx = tx; m.renderOrder = 2; return m;
}
/* label tegak (dinding/pintu), menghadap +z */
export function labelTegak(baris, w, h, o = {}) {
  const tx = teksTekstur(baris, { w: Math.round(256 * Math.max(1, w / h)), h: Math.round(256 * Math.max(1, h / w)), ...o });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false }));
  m.userData.tx = tx; m.renderOrder = 2; return m;
}
export function buangObjek(o) {
  o.traverse?.((c) => {
    if (c.geometry && !c.geometry.userData.kongsi) c.geometry.dispose();
    const ms = Array.isArray(c.material) ? c.material : c.material ? [c.material] : [];
    for (const m of ms) { if (m === M.atas || m === M.sisi || m === M.neon || m === M.kaca || m === M.licin || m.userData?.kongsi) continue; if (m.map && m.map.userData?.c) m.map.dispose(); m.dispose(); }
  });
}
