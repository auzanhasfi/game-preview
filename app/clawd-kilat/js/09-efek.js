/* Clawd Kilat: juice — partikel, garis kecepatan, jejak bayangan, gelombang kejut, getar layar, kilat, teks melayang */
import * as THREE from 'three';
import { R, mat } from './04-render.js';

const MAKS = 420;
let partikel, dataP = [], garis, dataG = [], gelombang = [], hantu = [], trauma = 0;
const dum = new THREE.Object3D(), warna = new THREE.Color();
export const kurangGerak = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function siapkanEfek() {
  partikel = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat('#ffffff', { dasar: true }), MAKS);
  partikel.instanceMatrix.setUsage(THREE.DynamicDrawUsage); partikel.frustumCulled = false;
  for (let i = 0; i < MAKS; i++) { dataP.push({ hidup: 0 }); dum.scale.setScalar(0); dum.updateMatrix(); partikel.setMatrixAt(i, dum.matrix); partikel.setColorAt(i, warna.set('#ffffff')); }
  R.scene.add(partikel);
  // garis kecepatan: tidak melengkung, menempel di kamera
  garis = new THREE.InstancedMesh(new THREE.BoxGeometry(0.018, 0.018, 1), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), 120);
  garis.frustumCulled = false;
  for (let i = 0; i < 120; i++) { const a = Math.random() * Math.PI * 2, r = 3.6 + Math.random() * 5; dataG.push({ a, r, z: -Math.random() * 60, p: 3 + Math.random() * 6 }); }
  R.camera.add(garis); R.scene.add(R.camera);
  // jejak bayangan (8 kotak transparan warna hero)
  for (let i = 0; i < 10; i++) { const h = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1, 1.05), mat('#ffffff', { dasar: true, transparan: true, opacity: 0, tambah: true })); h.visible = false; R.scene.add(h); hantu.push({ m: h, umur: 0 }); }
}

let iP = 0;
export function semburan(x, y, z, n, o = {}) {
  for (let k = 0; k < n; k++) {
    const p = dataP[iP]; iP = (iP + 1) % MAKS;
    const a = Math.random() * Math.PI * 2, kec = (o.kec || 6) * (0.4 + Math.random() * 0.8);
    p.hidup = p.umur = (o.umur || 0.7) * (0.6 + Math.random() * 0.6);
    p.x = x + (Math.random() - 0.5) * (o.sebar || 0.4); p.y = y + (Math.random() - 0.5) * (o.sebar || 0.4); p.z = z + (Math.random() - 0.5) * (o.sebar || 0.4);
    p.vx = Math.cos(a) * kec * (o.datar ? 1 : 0.8); p.vz = Math.sin(a) * kec * 0.8 + (o.vz || 0); p.vy = (o.naik ?? 0.6) * kec + Math.random() * 2;
    p.g = o.gravitasi ?? 14; p.s = (o.ukuran || 0.18) * (0.6 + Math.random() * 0.8); p.r = Math.random() * 6;
    const w = Array.isArray(o.warna) ? o.warna[Math.floor(Math.random() * o.warna.length)] : (o.warna || '#ffd23a');
    partikel.setColorAt((iP + MAKS - 1) % MAKS, warna.set(w));
  }
  partikel.instanceColor.needsUpdate = true;
}

export function gelombangKejut(x, y, z, w = '#ffffff', besar = 6) {
  const g = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 40), mat(w, { dasar: true, transparan: true, opacity: 0.9, tambah: true }));
  g.position.set(x, y, z); g.rotation.x = Math.PI / 2; R.scene.add(g); gelombang.push({ g, t: 0, besar });
}
export function goyang(v) { if (!kurangGerak) trauma = Math.min(1, trauma + v); }
let iH = 0, jedaH = 0;
export function jejak(C, warnaHero, dt) {
  jedaH -= dt; if (jedaH > 0) return; jedaH = 0.035;
  const h = hantu[iH]; iH = (iH + 1) % hantu.length;
  h.m.visible = true; h.umur = 0.3; h.m.material.color.set(warnaHero);
  C.badan.getWorldPosition(h.m.position); h.m.quaternion.copy(C.tubuh.quaternion); h.m.scale.copy(C.tubuh.scale);
}

export function perbaruiEfek(dt, laju, lajuGeser, kilat) {
  for (let i = 0; i < MAKS; i++) {
    const p = dataP[i]; if (p.hidup <= 0) continue;
    p.hidup -= dt; p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += (p.vz + lajuGeser) * dt; p.r += dt * 8;
    if (p.y < 0.05 && p.g > 0) { p.y = 0.05; p.vy *= -0.35; p.vx *= 0.7; }
    const s = p.hidup > 0 ? p.s * Math.min(1, p.hidup / p.umur * 2) : 0;
    dum.position.set(p.x, p.y, p.z); dum.rotation.set(p.r, p.r * 0.7, 0); dum.scale.setScalar(s); dum.updateMatrix(); partikel.setMatrixAt(i, dum.matrix);
  }
  partikel.instanceMatrix.needsUpdate = true;
  // garis kecepatan
  const kuat = Math.max(0, (laju - 26) / 26) * 0.5 + (kilat ? 0.6 : 0);
  garis.material.opacity += (Math.min(0.42, kuat * 0.6) - garis.material.opacity) * Math.min(1, dt * 6);
  for (let i = 0; i < 120; i++) {
    const d = dataG[i]; d.z += laju * dt * (kilat ? 2.4 : 1.4);
    if (d.z > 2) { d.z = -40 - Math.random() * 20; d.a = Math.random() * Math.PI * 2; d.r = 3.6 + Math.random() * 5; }
    dum.position.set(Math.cos(d.a) * d.r, Math.sin(d.a) * d.r * 0.7, d.z); dum.rotation.set(0, 0, 0); dum.scale.set(1, 1, d.p * (0.5 + kuat)); dum.updateMatrix(); garis.setMatrixAt(i, dum.matrix);
  }
  garis.instanceMatrix.needsUpdate = true;
  for (let i = gelombang.length - 1; i >= 0; i--) {
    const w = gelombang[i]; w.t += dt; const k = w.t / 0.5;
    w.g.scale.setScalar(1 + k * w.besar); w.g.material.opacity = 0.9 * (1 - k); w.g.position.z += lajuGeser * dt;
    if (k >= 1) { R.scene.remove(w.g); w.g.geometry.dispose(); w.g.material.dispose(); gelombang.splice(i, 1); }
  }
  for (const h of hantu) if (h.umur > 0) { h.umur -= dt; h.m.position.z += lajuGeser * dt; h.m.material.opacity = Math.max(0, h.umur / 0.3) * 0.22; if (h.umur <= 0) h.m.visible = false; }
  trauma = Math.max(0, trauma - dt * 1.6);
}
export function getaran(t) {
  const k = trauma * trauma;
  return { x: (Math.sin(t * 61) + Math.sin(t * 37)) * 0.18 * k, y: (Math.sin(t * 53) + Math.sin(t * 29)) * 0.14 * k, r: Math.sin(t * 47) * 0.03 * k };
}

/* lapisan DOM: kilat putih, vignette merah, teks melayang */
const lap = () => document.getElementById('fx');
export function kilatLayar(w = '#ffffff', kuat = 0.7) {
  if (kurangGerak) kuat *= 0.3;
  const d = document.createElement('div'); d.className = 'flash'; d.style.background = w; d.style.opacity = kuat; lap().appendChild(d);
  requestAnimationFrame(() => { d.style.opacity = 0; }); setTimeout(() => d.remove(), 450);
}
export function vignette() { const v = document.getElementById('vig'); v.classList.remove('on'); void v.offsetWidth; v.classList.add('on'); }
const _v = new THREE.Vector3();
export function teksMelayang(teks, pos3, kelas = '') {
  _v.copy(pos3).project(R.camera);
  const x = (_v.x * 0.5 + 0.5) * window.innerWidth, y = (-_v.y * 0.5 + 0.5) * window.innerHeight;
  const d = document.createElement('div'); d.className = 'apung ' + kelas; d.textContent = teks; d.style.left = x + 'px'; d.style.top = y + 'px';
  lap().appendChild(d); setTimeout(() => d.remove(), 900);
}
