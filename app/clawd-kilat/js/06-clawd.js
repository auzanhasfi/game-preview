/* Clawd Kilat: model 3D Clawd (badan kotak, 4 kaki, mata garis) + aksesori hero + kucing Mochi + animasi */
import * as THREE from 'three';
import { R, mat } from './04-render.js';
import { HEROES } from './01-data.js';

const kotak = new THREE.BoxGeometry(1, 1, 1);
const TINTA = '#2e2620';

export function buatClawd(heroId) {
  const H = HEROES[heroId];
  const akar = new THREE.Group();        // posisi lajur & tinggi
  const tubuh = new THREE.Group();       // squash/stretch + putar saat guling/lompat
  tubuh.position.y = 0.55; akar.add(tubuh);
  const mBadan = mat(H.col, { kasar: 0.55 }), mTinta = mat(TINTA, { kasar: 0.9 }), m2 = mat(H.c2, { kasar: 0.6 });

  const badan = new THREE.Mesh(kotak, mBadan); badan.scale.set(1.7, 1.0, 1.05); badan.position.y = 0.45; tubuh.add(badan);
  // pipi/ujung membulat: tepi gelap tipis memberi kesan garis tinta
  const garis = new THREE.LineSegments(new THREE.EdgesGeometry(kotak), new THREE.LineBasicMaterial({ color: TINTA }));
  garis.scale.copy(badan.scale).multiplyScalar(1.002); garis.position.copy(badan.position); tubuh.add(garis);
  // mata (menghadap -z = arah lari)
  const mata = [];
  for (const x of [-0.36, 0.36]) { const e = new THREE.Mesh(kotak, mTinta); e.scale.set(0.13, 0.3, 0.05); e.position.set(x, 0.55, -0.54); tubuh.add(e); mata.push(e); }
  // lengan
  const lengan = [];
  for (const x of [-0.98, 0.98]) { const l = new THREE.Mesh(kotak, mBadan); l.scale.set(0.28, 0.36, 0.36); l.position.set(x, 0.38, 0); tubuh.add(l); lengan.push(l); }
  // kaki
  const kaki = [];
  for (const [x, z] of [[-0.6, -0.3], [-0.25, 0.3], [0.25, -0.3], [0.6, 0.3]]) {
    const p = new THREE.Group(); p.position.set(x, 0, z);
    const k = new THREE.Mesh(kotak, mBadan); k.scale.set(0.2, 0.5, 0.22); k.position.y = -0.25; p.add(k);
    tubuh.add(p); kaki.push(p);
  }
  // aksesori
  let jubah = null, syal = null, lingkar = null;
  if (H.aks === 'jubah') { jubah = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.1, 1, 4), mat(H.c2, { dua: true })); jubah.position.set(0, 0.55, 0.56); jubah.geometry.translate(0, -0.5, 0); jubah.position.y = 0.95; tubuh.add(jubah); }
  if (H.aks === 'topi') { const t = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.7, 4), m2); t.position.set(0, 1.25, 0); t.rotation.set(-0.2, Math.PI / 4, 0); tubuh.add(t); const b = new THREE.Mesh(kotak, mat('#d9534a')); b.scale.set(0.1, 0.5, 0.05); b.position.set(0.3, 1.35, 0.1); b.rotation.z = -0.5; tubuh.add(b);
    const panah = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.9, 8), mat('#8a5a34')); panah.position.set(0.45, 0.65, 0.55); panah.rotation.z = 0.5; tubuh.add(panah); }
  if (H.aks === 'topiSihir') { const t = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 8), m2); t.position.set(0, 1.5, 0); t.rotation.z = 0.15; tubuh.add(t); const pin = new THREE.Mesh(kotak, mat('#e2a93b', { pijar: '#e2a93b', pijarK: 0.8 })); pin.scale.setScalar(0.16); pin.position.set(0.05, 1.45, -0.42); pin.rotation.z = 0.78; tubuh.add(pin);
    const tepi = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.06, 16), m2); tepi.position.set(0, 0.97, 0); tubuh.add(tepi); }
  if (H.aks === 'tameng') { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 6), m2); t.rotation.x = Math.PI / 2; t.position.set(0, 0.5, 0.62); tubuh.add(t); const s = new THREE.Mesh(kotak, mat('#6f8440')); s.scale.set(0.12, 0.6, 0.05); s.position.set(0, 0.5, 0.69); tubuh.add(s); }
  if (H.aks === 'syal') { syal = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 1.8, 1, 6), mat(H.c2, { dua: true })); syal.geometry.translate(0, -0.9, 0); syal.position.set(0.3, 0.9, 0.5); syal.rotation.x = -1.2; tubuh.add(syal);
    const ikat = new THREE.Mesh(kotak, mat(H.c2)); ikat.scale.set(1.74, 0.22, 1.09); ikat.position.y = 0.8; tubuh.add(ikat); }
  if (H.aks === 'lingkar') { lingkar = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 6, 28), mat(H.c2, { pijar: H.c2, pijarK: 1.6 })); lingkar.rotation.x = Math.PI / 2; lingkar.position.y = 1.35; tubuh.add(lingkar); }
  if (H.aks === 'telinga') { for (const x of [-0.5, 0.5]) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.5, 4), mat('#f19bb4')); t.position.set(x, 1.15, 0); t.rotation.y = Math.PI / 4; tubuh.add(t); }
    const tudung = new THREE.Mesh(kotak, mat('#ffffff')); tudung.scale.set(1.76, 0.2, 1.1); tudung.position.y = 0.92; tubuh.add(tudung); }

  // bola putar (saat guling/lompat): cangkang bercahaya warna hero
  const putar = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), mat(H.col, { dasar: true, transparan: true, opacity: 0.35, tambah: true }));
  putar.position.y = 0.55; putar.visible = false; akar.add(putar);
  const putarCincin = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.07, 6, 32), mat('#ffffff', { dasar: true, transparan: true, opacity: 0.7, tambah: true }));
  putarCincin.position.y = 0.55; putarCincin.visible = false; akar.add(putarCincin);
  // perisai gelembung
  const gelembung = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45, 2), mat('#7fd8ff', { dasar: true, transparan: true, opacity: 0.22, tambah: true }));
  gelembung.position.y = 0.7; gelembung.visible = false; akar.add(gelembung);
  // bayangan bulat
  const bayang = new THREE.Mesh(new THREE.CircleGeometry(1, 20), mat('#000000', { dasar: true, transparan: true, opacity: 0.28 }));
  bayang.rotation.x = -Math.PI / 2; bayang.position.y = 0.02; akar.add(bayang);

  return { akar, tubuh, badan, mata, lengan, kaki, jubah, syal, lingkar, putar, putarCincin, gelembung, bayang, mBadan, heroId };
}

/* kucing Mochi (hero Nini) */
export function buatMochi() {
  const g = new THREE.Group(), m = mat('#ffffff'), mp = mat('#f19bb4'), mt = mat(TINTA);
  const b = new THREE.Mesh(kotak, m); b.scale.set(0.5, 0.4, 0.75); b.position.y = 0.45; g.add(b);
  const k = new THREE.Mesh(kotak, m); k.scale.set(0.5, 0.45, 0.45); k.position.set(0, 0.8, -0.4); g.add(k);
  for (const x of [-0.16, 0.16]) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 4), mp); t.position.set(x, 1.1, -0.4); g.add(t); const e = new THREE.Mesh(kotak, mt); e.scale.set(0.06, 0.1, 0.02); e.position.set(x * 0.8, 0.85, -0.63); g.add(e); }
  const ekor = new THREE.Mesh(kotak, m); ekor.scale.set(0.1, 0.1, 0.5); ekor.position.set(0, 0.7, 0.55); ekor.rotation.x = 0.7; g.add(ekor);
  const kaki = [];
  for (const [x, z] of [[-0.15, -0.25], [0.15, -0.25], [-0.15, 0.25], [0.15, 0.25]]) { const p = new THREE.Mesh(kotak, m); p.scale.set(0.12, 0.3, 0.12); p.position.set(x, 0.15, z); g.add(p); kaki.push(p); }
  g.userData.kaki = kaki;
  return g;
}

/* animasi tiap frame. s = keadaan pemain dari 99-main */
export function animasiClawd(C, s, t, dt) {
  const lari = !s.guling && !s.diUdara;
  const f = t * (10 + s.laju * 0.32);
  C.kaki.forEach((k, i) => { k.rotation.x = lari ? Math.sin(f + (i % 2 ? Math.PI : 0)) * 0.9 : (s.diUdara ? 0.6 * (i % 2 ? 1 : -1) : 0); });
  C.lengan.forEach((l, i) => { l.position.z = lari ? Math.sin(f + (i ? 0 : Math.PI)) * 0.25 : 0; l.position.y = s.diUdara ? 0.6 : 0.38; });
  // squash & stretch
  const sq = s.squash; // >0 pipih, <0 memanjang
  C.tubuh.scale.set(1 + sq * 0.35, 1 - sq * 0.45, 1 + sq * 0.2);
  // badan memantul saat lari
  C.tubuh.position.y = 0.55 + (lari ? Math.abs(Math.sin(f)) * 0.12 : 0);
  // guling/lompat putar
  const bola = s.guling || (s.diUdara && s.putarLompat);
  C.putar.visible = bola; C.putarCincin.visible = bola;
  if (bola) { s.rotPutar -= dt * 22; C.tubuh.rotation.x = s.rotPutar; C.putarCincin.rotation.set(s.rotPutar, 0.6, 0); C.putar.rotation.x = s.rotPutar;
    if (s.guling) { C.tubuh.position.y = 0.35; C.putar.position.y = 0.6; C.putar.scale.setScalar(0.7); C.putarCincin.position.y = 0.6; C.putarCincin.scale.setScalar(0.7); }
    else { C.putar.position.y = 0.55; C.putar.scale.setScalar(1); C.putarCincin.position.y = 0.55; C.putarCincin.scale.setScalar(1); } }
  else { C.tubuh.rotation.x += (0 - C.tubuh.rotation.x) * Math.min(1, dt * 18); s.rotPutar = 0; }
  // miring saat pindah lajur
  C.tubuh.rotation.z += ((-s.vx * 0.06) - C.tubuh.rotation.z) * Math.min(1, dt * 12);
  // aksesori berkibar
  if (C.jubah) C.jubah.rotation.x = 0.5 + Math.sin(t * 18) * 0.12 + s.laju * 0.012;
  if (C.syal) C.syal.rotation.x = -1.35 + Math.sin(t * 20) * 0.15;
  if (C.lingkar) C.lingkar.rotation.z = t * 2;
  C.gelembung.visible = s.perisai > 0; if (s.perisai > 0) { const p = 1 + Math.sin(t * 8) * 0.04; C.gelembung.scale.setScalar(p); C.gelembung.rotation.y = t; }
  // berkedip saat kebal setelah kena
  C.tubuh.visible = !(s.kebal > 0 && !s.kilat && Math.floor(t * 18) % 2 === 0);
  // bayangan mengecil saat di udara
  const sk = Math.max(0.35, 1 - s.y * 0.12); C.bayang.scale.setScalar(sk); C.bayang.position.y = 0.02 - s.y; C.bayang.material.opacity = 0.28 * sk;
}
