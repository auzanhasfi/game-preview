/* Turbo Clawd: model mobil mainan (depan = -z) dengan supir Clawd atau Comot, roda berputar, api knalpot, perisai */
import * as THREE from 'three';

const kotak = new THREE.BoxGeometry(1, 1, 1);
const geoRoda = new THREE.CylinderGeometry(1, 1, 1, 18); geoRoda.rotateZ(Math.PI / 2);
const TINTA = '#14182b';
const cache = {};
const mat = (col, o = {}) => { const k = col + JSON.stringify(o); return cache[k] || (cache[k] = new THREE.MeshStandardMaterial(Object.assign({ color: col, roughness: 0.4 }, o))); };
function box(parent, m, sx, sy, sz, x, y, z) { const b = new THREE.Mesh(kotak, m); b.scale.set(sx, sy, sz); b.position.set(x, y, z); parent.add(b); return b; }

export function buatMobil({ col, c2, supir = 'clawd', raja = false }) {
  const akar = new THREE.Group();
  const badan = new THREE.Group(); akar.add(badan);
  const skala = raja ? 1.35 : 1;
  badan.scale.setScalar(skala);
  const mUtama = mat(col, { roughness: 0.28, metalness: 0.25 }), mAksen = mat(c2, { roughness: 0.4 }), mHitam = mat('#151821', { roughness: 0.8 }), mKrom = mat('#d9dee8', { metalness: 0.9, roughness: 0.2 });
  // sasis dan bodi
  box(badan, mHitam, 2.0, 0.3, 4.1, 0, 0.42, 0);
  box(badan, mUtama, 2.15, 0.55, 3.0, 0, 0.78, 0.25);
  const hidung = box(badan, mUtama, 1.9, 0.4, 1.5, 0, 0.66, -1.75); hidung.rotation.x = -0.12;
  box(badan, mAksen, 0.5, 0.05, 4.4, 0, 1.07, -0.3);               // garis tengah
  box(badan, mUtama, 0.42, 0.5, 1.3, -1.05, 0.72, -1.35); box(badan, mUtama, 0.42, 0.5, 1.3, 1.05, 0.72, -1.35); // spatbor depan
  // mesin krom di belakang (gaya hot rod)
  box(badan, mKrom, 1.0, 0.45, 0.9, 0, 1.22, 1.15);
  for (const x of [-0.3, 0, 0.3]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8), mKrom); p.position.set(x, 1.6, 1.15); badan.add(p); }
  // knalpot
  for (const x of [-0.7, 0.7]) { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.6, 10), mKrom); k.rotation.x = Math.PI / 2; k.position.set(x, 0.62, 2.0); badan.add(k); }
  // spoiler
  box(badan, mHitam, 0.14, 0.6, 0.14, -0.7, 1.3, 1.85); box(badan, mHitam, 0.14, 0.6, 0.14, 0.7, 1.3, 1.85);
  box(badan, mAksen, 2.4, 0.12, 0.7, 0, 1.62, 1.9);
  // kaca depan
  const kaca = box(badan, mat('#bfe6ff', { transparent: true, opacity: 0.55, roughness: 0.05 }), 1.6, 0.55, 0.06, 0, 1.25, -0.55); kaca.rotation.x = -0.6;
  // supir
  const supirG = new THREE.Group(); supirG.position.set(0, 1.35, 0.15); badan.add(supirG);
  if (supir === 'clawd') {
    box(supirG, mat('#d8714f', { roughness: 0.6 }), 1.1, 0.62, 0.7, 0, 0.12, 0);
    box(supirG, mat(TINTA), 0.09, 0.22, 0.04, -0.24, 0.18, -0.36); box(supirG, mat(TINTA), 0.09, 0.22, 0.04, 0.24, 0.18, -0.36);
    box(supirG, mat('#d8714f', { roughness: 0.6 }), 0.2, 0.22, 0.3, -0.62, 0.05, -0.15); box(supirG, mat('#d8714f', { roughness: 0.6 }), 0.2, 0.22, 0.3, 0.62, 0.05, -0.15);
    box(supirG, mat('#ffd23a'), 1.16, 0.12, 0.76, 0, 0.47, 0); // helm/ikat kepala
  } else {
    const kepala = new THREE.Mesh(new THREE.SphereGeometry(0.48, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), mat(raja ? '#3a3f4c' : col, { roughness: 0.7 })); kepala.position.y = -0.05; supirG.add(kepala);
    for (const x of [-0.18, 0.18]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), mat('#ff3344', { emissive: '#ff2233', emissiveIntensity: 0.8 })); e.position.set(x, 0.16, -0.4); supirG.add(e); }
    if (raja) {
      const mk = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 8, 1, true), mat('#ffd23a', { metalness: 0.8, roughness: 0.25, side: THREE.DoubleSide })); mk.position.y = 0.5; supirG.add(mk);
      for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 4), mat('#ffd23a', { metalness: 0.8 })); const a = i / 5 * Math.PI * 2; c.position.set(Math.cos(a) * 0.42, 0.78, Math.sin(a) * 0.42); supirG.add(c); }
    } else { const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5), mat(TINTA)); ant.position.y = 0.55; supirG.add(ant); const bl = new THREE.Mesh(new THREE.SphereGeometry(0.09), mat(c2)); bl.position.y = 0.82; supirG.add(bl); }
  }
  // roda
  const roda = [];
  for (const [x, z, r] of [[-1.12, -1.35, 0.48], [1.12, -1.35, 0.48], [-1.15, 1.35, 0.58], [1.15, 1.35, 0.58]]) {
    const w = new THREE.Group(); w.position.set(x, r, z);
    const ban = new THREE.Mesh(geoRoda, mHitam); ban.scale.set(0.46, r, r); w.add(ban);
    const velg = new THREE.Mesh(geoRoda, mAksen); velg.scale.set(0.48, r * 0.55, r * 0.55); w.add(velg);
    const jari = box(w, mKrom, 0.5, r * 1.3, 0.12, 0, 0, 0);
    badan.add(w); roda.push(w);
  }
  // api knalpot (turbo)
  const api = new THREE.Group();
  for (const x of [-0.7, 0.7]) {
    const a = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.6, 10), new THREE.MeshBasicMaterial({ color: '#39d0ff', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    a.rotation.x = Math.PI / 2; a.position.set(x, 0.62, 3.0); api.add(a);
    const b = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.0, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    b.rotation.x = Math.PI / 2; b.position.set(x, 0.62, 2.7); api.add(b);
  }
  api.visible = false; badan.add(api);
  // perisai
  const perisai = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5, 1), new THREE.MeshBasicMaterial({ color: '#7fd8ff', wireframe: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  perisai.position.y = 1.0; perisai.scale.z = 1.25; perisai.visible = false; badan.add(perisai);
  // bayangan
  const bayang = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 4.8), new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.3, depthWrite: false }));
  bayang.rotation.x = -Math.PI / 2; bayang.position.y = 0.04; akar.add(bayang);
  return { akar, badan, roda, api, perisai, bayang, supir: supirG, skala };
}
