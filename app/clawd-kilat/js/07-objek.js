/* Clawd Kilat: bentuk 3D semua objek di jalur (koin, rintangan, Si Comot, power-up, gerbang angka, bom & bola jawaban) + pool */
import * as THREE from 'three';
import { R, mat, teksturTeks } from './04-render.js';
import { LAJUR } from './05-dunia.js';

const kotak = new THREE.BoxGeometry(1, 1, 1);
const silinder = new THREE.CylinderGeometry(1, 1, 1, 12);
const kerucut = new THREE.ConeGeometry(1, 1, 8);
const bola = new THREE.IcosahedronGeometry(1, 2);

function bintangGeo(r1, r2, tebal) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; i ? s.lineTo(Math.cos(a) * r, -Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, -Math.sin(a) * r); }
  const g = new THREE.ExtrudeGeometry(s, { depth: tebal, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
  g.center(); return g;
}
const geoBintang = bintangGeo(0.48, 0.22, 0.12), geoBintangBesar = bintangGeo(0.75, 0.34, 0.18);
const geoPetir = (() => { const s = new THREE.Shape(); s.moveTo(0.1, 0.5); s.lineTo(-0.25, -0.05); s.lineTo(0, -0.05); s.lineTo(-0.1, -0.5); s.lineTo(0.25, 0.08); s.lineTo(0, 0.08); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }); g.center(); return g; })();

const M = {};
function m() {
  if (M.koin) return;
  M.koin = mat('#ffcf3a', { pijar: '#ffb000', pijarK: 0.9, logam: 0.6, kasar: 0.3 });
  M.merah = mat('#ff4a5a', { pijar: '#ff2040', pijarK: 1.2, logam: 0.4, kasar: 0.3 });
  M.tinta = mat('#3a2f5a'); M.tinta2 = mat('#2e2620');
  M.duri = mat('#e9e4f5', { logam: 0.5, kasar: 0.3 }); M.duriMerah = mat('#ff5a5a', { pijar: '#ff2a2a', pijarK: 0.6 });
  M.bata = mat('#c46a4a'); M.bata2 = mat('#a85538'); M.bataAtas = mat('#ffd36a', { pijar: '#ffb000', pijarK: 0.8 });
  M.comot = mat('#5f7fd8', { kasar: 0.45, logam: 0.2 }); M.comot2 = mat('#3d56a8'); M.mataComot = mat('#ff4060', { pijar: '#ff2040', pijarK: 2 });
  M.putih = mat('#ffffff'); M.kuning = mat('#ffd23a', { pijar: '#ffb000', pijarK: 0.4 }); M.merahPegas = mat('#e8423a');
  M.pad = mat('#ffd23a', { pijar: '#ffcc00', pijarK: 1.6, dasar: false });
  M.kolam = mat('#1b0f3a', { kasar: 0.1, logam: 0.6, pijar: '#3a1a7a', pijarK: 0.6 });
  M.kaca = mat('#ffffff', { dasar: true, transparan: true, opacity: 0.25, tambah: true });
  M.magnet = mat('#ff4a4a', { pijar: '#ff2a2a', pijarK: 0.6 }); M.perisai = mat('#5ec8ff', { pijar: '#2aa8ff', pijarK: 1 }); M.petir = mat('#ffe14a', { pijar: '#ffcc00', pijarK: 1.4 });
  M.bom = mat('#2a2238', { logam: 0.5, kasar: 0.3 }); M.sumbu = mat('#ff8a2a', { pijar: '#ff6a00', pijarK: 2 });
  M.peringatan = mat('#ff3040', { dasar: true, transparan: true, opacity: 0.5, tambah: true });
  M.garisKuning = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 32; const g = c.getContext('2d'); for (let i = -2; i < 10; i++) { g.fillStyle = i % 2 ? '#2e2620' : '#ffd23a'; g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16 + 16, 0); g.lineTo(i * 16, 32); g.lineTo(i * 16 - 16, 32); g.fill(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return mat('#ffffff', { map: t }); })();
}

const BUAT = {
  koin() { const g = new THREE.Group(); const b = new THREE.Mesh(geoBintang, M.koin); g.add(b); g.userData.putar = b; return g; },
  merah() { const g = new THREE.Group(); const b = new THREE.Mesh(geoBintangBesar, M.merah); g.add(b); g.userData.putar = b; return g; },
  pagar() {
    const g = new THREE.Group();
    const dasar = new THREE.Mesh(kotak, M.tinta); dasar.scale.set(2.3, 0.45, 0.5); dasar.position.y = 0.22; g.add(dasar);
    const strip = new THREE.Mesh(kotak, M.garisKuning); strip.scale.set(2.32, 0.18, 0.52); strip.position.y = 0.3; g.add(strip);
    for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(kerucut, i % 2 ? M.duri : M.duriMerah); d.scale.set(0.2, 0.55, 0.2); d.position.set(-0.9 + i * 0.45, 0.72, 0); g.add(d); }
    return g;
  },
  gapura() {
    const g = new THREE.Group();
    for (const x of [-1.15, 1.15]) { const t = new THREE.Mesh(kotak, M.tinta); t.scale.set(0.3, 2.7, 0.3); t.position.set(x, 1.35, 0); g.add(t); }
    const p = new THREE.Mesh(kotak, M.garisKuning); p.scale.set(2.6, 0.75, 0.4); p.position.y = 2.05; g.add(p);
    const mata = new THREE.Mesh(kotak, M.mataComot); mata.scale.set(0.5, 0.22, 0.1); mata.position.set(0, 2.05, 0.22); g.add(mata);
    return g;
  },
  tembok() {
    const g = new THREE.Group();
    for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) { const b = new THREE.Mesh(kotak, (x + y) % 2 ? M.bata : M.bata2); b.scale.set(0.74, 0.58, 1.1); b.position.set(-0.76 + x * 0.76 + (y % 2 ? 0.1 : -0.1), 0.3 + y * 0.6, 0); g.add(b); }
    const atas = new THREE.Mesh(kotak, M.bataAtas); atas.scale.set(2.4, 0.12, 1.15); atas.position.y = 3.05; g.add(atas);
    return g;
  },
  comot() {
    const g = new THREE.Group(), tb = new THREE.Group(); g.add(tb); g.userData.tb = tb;
    const b = new THREE.Mesh(kotak, M.comot); b.scale.set(1.3, 1.0, 1.0); b.position.y = 0.75; tb.add(b);
    const k = new THREE.Mesh(kotak, M.comot2); k.scale.set(1.36, 0.2, 1.04); k.position.y = 0.42; tb.add(k);
    const e = new THREE.Mesh(bola, M.mataComot); e.scale.set(0.22, 0.22, 0.1); e.position.set(0, 0.85, 0.52); tb.add(e);
    const a = new THREE.Mesh(silinder, M.comot2); a.scale.set(0.04, 0.5, 0.04); a.position.set(0.3, 1.45, 0); tb.add(a);
    const ab = new THREE.Mesh(bola, M.mataComot); ab.scale.setScalar(0.1); ab.position.set(0.3, 1.72, 0); tb.add(ab);
    for (const x of [-0.45, 0.45]) { const r = new THREE.Mesh(silinder, M.tinta2); r.scale.set(0.24, 0.18, 0.24); r.rotation.z = Math.PI / 2; r.position.set(x, 0.24, 0); tb.add(r); }
    for (const x of [-0.78, 0.78]) { const c = new THREE.Mesh(kotak, M.comot2); c.scale.set(0.2, 0.2, 0.5); c.position.set(x, 0.7, 0.15); tb.add(c); }
    return g;
  },
  terbang() {
    const g = BUAT.comot(); const tb = g.userData.tb; tb.position.y = 1.35;
    tb.children[5].visible = tb.children[6].visible = false;
    const baling = new THREE.Group(); baling.position.y = 1.32;
    for (let i = 0; i < 2; i++) { const p = new THREE.Mesh(kotak, M.putih); p.scale.set(1.6, 0.04, 0.16); p.rotation.y = i * Math.PI / 2; baling.add(p); }
    tb.add(baling); g.userData.baling = baling;
    return g;
  },
  bola() {
    const g = new THREE.Group();
    const inti = new THREE.Mesh(bola, M.tinta); inti.scale.setScalar(0.7); inti.position.y = 0.9; g.add(inti);
    const dir = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < 14; i++) { const d = new THREE.Mesh(kerucut, M.duri); d.scale.set(0.16, 0.5, 0.16); dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(); d.quaternion.setFromUnitVectors(up, dir); d.position.copy(dir).multiplyScalar(0.8).add(inti.position); g.add(d); }
    const rantai = new THREE.Mesh(silinder, M.tinta2); rantai.scale.set(0.05, 6, 0.05); rantai.position.y = 4.3; g.add(rantai);
    return g;
  },
  kolam() {
    const g = new THREE.Group();
    const k = new THREE.Mesh(kotak, M.kolam); k.scale.set(8.4, 0.06, 4); k.position.y = 0.03; g.add(k);
    for (const x of [-4.4, 4.4]) { const t = new THREE.Mesh(kotak, M.peringatan); t.scale.set(0.2, 0.1, 4); t.position.set(x, 0.1, 0); g.add(t); }
    for (let i = 0; i < 6; i++) { const gl = new THREE.Mesh(bola, M.kolam); gl.scale.setScalar(0.18 + Math.random() * 0.2); gl.position.set(-3.5 + Math.random() * 7, 0.05, -1.5 + Math.random() * 3); g.add(gl); }
    return g;
  },
  pegas() {
    const g = new THREE.Group();
    const d = new THREE.Mesh(silinder, M.tinta); d.scale.set(0.9, 0.2, 0.9); d.position.y = 0.1; g.add(d);
    for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 6, 18), M.putih); c.rotation.x = Math.PI / 2; c.position.y = 0.3 + i * 0.16; g.add(c); }
    const atas = new THREE.Mesh(silinder, M.merahPegas); atas.scale.set(0.95, 0.18, 0.95); atas.position.y = 0.95; g.add(atas);
    const kuning = new THREE.Mesh(silinder, M.kuning); kuning.scale.set(0.6, 0.2, 0.6); kuning.position.y = 1.0; g.add(kuning);
    g.userData.atas = atas; return g;
  },
  pad() {
    const g = new THREE.Group();
    const d = new THREE.Mesh(kotak, M.tinta); d.scale.set(2.2, 0.06, 3); d.position.y = 0.03; g.add(d);
    const s = new THREE.Shape(); s.moveTo(0, 0.5); s.lineTo(0.8, -0.1); s.lineTo(0.55, -0.1); s.lineTo(0, 0.28); s.lineTo(-0.55, -0.1); s.lineTo(-0.8, -0.1); s.closePath();
    const geo = new THREE.ShapeGeometry(s);
    for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(geo, M.pad); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.08, 0.9 - i * 0.9); g.add(p); }
    return g;
  },
  magnet() { return kapsul(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 6, 16, Math.PI), M.magnet), 0); },
  perisai() { return kapsul(new THREE.Mesh(bola, M.perisai), 1); },
  isiKilat() { return kapsul(new THREE.Mesh(geoPetir, M.petir), 2); },
  jawab() {
    const g = new THREE.Group();
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.9), mat('#ffffff', { dasar: true, transparan: true, dua: true }));
    p.position.y = 1.9; g.add(p); g.userData.panel = p;
    const rangka = new THREE.Mesh(kotak, mat('#d9b25f', { pijar: '#d9b25f', pijarK: 1.4 })); rangka.scale.set(2.5, 0.12, 0.12); rangka.position.y = 2.92; g.add(rangka);
    const bawah = rangka.clone(); bawah.position.y = 0.88; g.add(bawah);
    for (const x of [-1.25, 1.25]) { const t = new THREE.Mesh(kotak, rangka.material); t.scale.set(0.14, 2.9, 0.14); t.position.set(x, 1.45, 0); g.add(t); }
    g.userData.rangka = rangka.material;
    return g;
  },
  bom() {
    const g = new THREE.Group();
    const b = new THREE.Mesh(bola, M.bom); b.scale.setScalar(0.6); b.position.y = 0.6; g.add(b); g.userData.b = b;
    const s = new THREE.Mesh(silinder, M.tinta2); s.scale.set(0.08, 0.3, 0.08); s.position.y = 1.25; g.add(s);
    const api = new THREE.Mesh(bola, M.sumbu); api.scale.setScalar(0.14); api.position.y = 1.45; g.add(api); g.userData.api = api;
    const tanda = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.2, 28), M.peringatan); tanda.rotation.x = -Math.PI / 2; tanda.position.y = 0.05; g.add(tanda); g.userData.tanda = tanda;
    return g;
  },
  bolaJawab() {
    const g = new THREE.Group();
    const b = new THREE.Mesh(bola, mat('#7f9fd9', { pijar: '#5a7ad8', pijarK: 0.9, logam: 0.3, kasar: 0.3 })); b.scale.setScalar(0.85); b.position.y = 1.1; g.add(b); g.userData.b = b;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), mat('#ffffff', { dasar: true, transparan: true })); p.position.set(0, 1.1, 0.9); g.add(p); g.userData.panel = p;
    return g;
  },
  bendera() {
    const g = new THREE.Group();
    const t = new THREE.Mesh(silinder, M.putih); t.scale.set(0.08, 4, 0.08); t.position.y = 2; g.add(t);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), mat('#ffffff', { dasar: true, dua: true })); f.position.set(1.1, 3.4, 0); g.add(f); g.userData.panel = f;
    return g;
  }
};
function kapsul(isi, jenis) {
  const g = new THREE.Group();
  const k = new THREE.Mesh(bola, M.kaca); k.scale.setScalar(0.62); k.position.y = 1.1; g.add(k);
  const c = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.04, 6, 28), [M.magnet, M.perisai, M.petir][jenis]); c.position.y = 1.1; g.add(c); g.userData.cincin = c;
  isi.position.y = 1.1; if (jenis === 1) isi.scale.setScalar(0.3); g.add(isi); g.userData.putar = isi;
  return g;
}

const pool = {};
export function siapkanObjek() { m(); }
export function ambil(tipe) {
  const s = pool[tipe] || (pool[tipe] = []);
  const g = s.pop() || BUAT[tipe]();
  g.visible = true; g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); g.scale.setScalar(1);
  R.scene.add(g); return g;
}
export function lepas(tipe, g) { R.scene.remove(g); (pool[tipe] ||= []).push(g); }

/* panel angka: tekstur baru tiap pakai, yang lama dibuang */
export function aturPanel(g, teks, gaya) {
  const p = g.userData.panel; if (p.material.map) p.material.map.dispose();
  p.material.map = teksturTeks(String(teks), gaya); p.material.needsUpdate = true;
}
export const X_LAJUR = (l) => l * LAJUR;
