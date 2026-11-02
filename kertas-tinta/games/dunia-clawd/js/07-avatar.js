/* Dunia Clawd: avatar blok 6 bahagian (tinggi 5 unit): kepala, badan, 2 lengan, 2 kaki.
   Bergerak kaku seperti patung mainan; bila mati, bahagian badan bercerai. */
import * as THREE from 'three';
import { papanTeks } from './06-bahan.js';

const kotak = new THREE.BoxGeometry(1, 1, 1); kotak.userData.kongsi = true;
const bahan = {};
function mat(w, o = {}) {
  const k = w + JSON.stringify(o);
  if (!bahan[k]) { bahan[k] = new THREE.MeshStandardMaterial({ color: w, roughness: o.r ?? 0.62, metalness: o.m ?? 0, emissive: o.e || 0, emissiveIntensity: o.ei || 0, side: o.dua ? THREE.DoubleSide : THREE.FrontSide }); bahan[k].userData.kongsi = true; }
  return bahan[k];
}
function kp(w, h, d, m, x = 0, y = 0, z = 0) { const b = new THREE.Mesh(kotak, m); b.scale.set(w, h, d); b.position.set(x, y, z); b.castShadow = true; return b; }

/* tekstur muka, dikongsi antara avatar */
const muka = {};
function tekMuka(id) {
  if (muka[id]) return muka[id];
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = g.strokeStyle = '#1c1612'; g.lineCap = 'round';
  if (id === 'clawd') { g.fillRect(32, 42, 14, 44); g.fillRect(82, 42, 14, 44); }
  else if (id === 'senyum') { g.beginPath(); g.arc(42, 50, 8, 0, 7); g.arc(86, 50, 8, 0, 7); g.fill(); g.lineWidth = 7; g.beginPath(); g.arc(64, 64, 28, 0.35, 2.8); g.stroke(); }
  else if (id === 'kaca') { g.beginPath(); g.roundRect(16, 38, 44, 24, 6); g.roundRect(68, 38, 44, 24, 6); g.fill(); g.fillRect(56, 42, 16, 6); g.lineWidth = 6; g.beginPath(); g.arc(70, 76, 18, 0.2, 2.2); g.stroke(); }
  else if (id === 'kagum') { g.fillStyle = '#fff'; g.beginPath(); g.arc(42, 50, 15, 0, 7); g.arc(86, 50, 15, 0, 7); g.fill(); g.fillStyle = '#1c1612'; g.beginPath(); g.arc(42, 50, 7, 0, 7); g.arc(86, 50, 7, 0, 7); g.fill(); g.beginPath(); g.ellipse(64, 92, 11, 15, 0, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = {}; muka[id] = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }); muka[id].userData.kongsi = true; return muka[id];
}

function aksesoriTopi(id, kepala, kk) {
  const a = (o) => { kepala.add(o); return o; }, y = kk.h / 2;
  if (id === 'kupluk') { a(kp(kk.w + 0.1, 0.42, kk.d + 0.1, mat('#d9b25f'), 0, y + 0.1)); a(kp(0.32, 0.22, 0.32, mat('#efe6d2'), 0, y + 0.42)); }
  if (id === 'topiKeledar') { a(kp(kk.w + 0.14, 0.5, kk.d + 0.14, mat('#9aa5b8', { r: 0.3, m: 0.5 }), 0, y + 0.1)); a(kp(0.18, 0.5, 0.18, mat('#c0392b'), 0, y + 0.55)); }
  if (id === 'topiSihir') { const m = mat('#2c3e6b'); const b = new THREE.Mesh(new THREE.ConeGeometry(0.72, 1.5, 12), m); b.position.set(0, y + 0.8, 0); b.rotation.z = 0.12; b.castShadow = true; a(b); const t = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.08, 20), m); t.position.y = y + 0.08; a(t); a(kp(0.26, 0.26, 0.05, mat('#d9b25f', { e: '#d9b25f', ei: 0.7 }), 0.1, y + 0.75, -0.48)); }
  if (id === 'halo') { const h = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.09, 8, 28), mat('#f6e2a8', { e: '#f6e2a8', ei: 1 })); h.rotation.x = Math.PI / 2; h.position.y = y + 0.6; a(h); }
  if (id === 'telinga') { for (const x of [-0.62, 0.62]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 4), mat('#ffffff')); c.position.set(x, y + 0.24, 0); c.rotation.y = Math.PI / 4; a(c); const i = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 4), mat('#f19bb4')); i.position.set(x, y + 0.18, -0.16); i.rotation.y = Math.PI / 4; a(i); } }
  if (id === 'mahkota') { const m = mat('#d9b25f', { r: 0.25, m: 0.7 }); a(kp(kk.w * 0.9, 0.22, kk.d * 0.9, m, 0, y + 0.11)); for (const [px, pz] of [[-0.7, -0.4], [0, -0.4], [0.7, -0.4], [-0.7, 0.4], [0, 0.4], [0.7, 0.4]]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 4), m); c.position.set(px * kk.w / 2, y + 0.42, pz * 1.1); a(c); } a(kp(0.16, 0.16, 0.05, mat('#c0392b', { e: '#c0392b', ei: 0.5 }), 0, y + 0.12, -kk.d * 0.46)); }
  if (id === 'sarjana') { a(kp(kk.w + 0.04, 0.3, kk.d + 0.04, mat('#1c1828'), 0, y + 0.05)); const p = kp(2.1, 0.08, 2.1, mat('#1c1828'), 0, y + 0.28); p.rotation.y = Math.PI / 4; a(p); a(kp(0.08, 0.7, 0.08, mat('#d9b25f'), 0.8, y - 0.05, 0)); }
  if (id === 'kon') { const c = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.2, 12), mat('#e8732c')); c.position.y = y + 0.66; c.castShadow = true; a(c); const r = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.2, 12), mat('#ffffff')); r.position.y = y + 0.6; a(r); a(kp(1.5, 0.1, 1.5, mat('#e8732c'), 0, y + 0.08)); }
  if (id === 'songkok') { a(kp(kk.w + 0.06, 0.55, kk.d + 0.06, mat('#1c1828', { r: 0.9 }), 0, y + 0.22)); }
}
function aksesoriBelakang(id, badan) {
  if (id === 'jubah') { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 3, 1, 3), mat('#2c3e6b', { dua: true })); m.geometry.translate(0, -1.5, 0); m.position.set(0, 1, 0.56); m.castShadow = true; badan.add(m); badan.userData.jubah = m; }
  if (id === 'sayap') { for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.set(s * 0.3, 0.3, 0.55); [[1.6, 0.42, 0.5, 0.6], [1.3, 0.36, 0.45, 0.1], [0.95, 0.3, 0.3, -0.35]].forEach(([l, h, x, y]) => { const b = kp(l, h, 0.08, mat('#efe6d2'), s * (x + l / 2), y); w.add(b); }); w.rotation.y = -s * 0.35; badan.add(w); (badan.userData.sayap ||= []).push(w); } }
  if (id === 'beg') { badan.add(kp(1.5, 1.6, 0.6, mat('#c0392b'), 0, 0, 0.75)); badan.add(kp(1.0, 0.6, 0.12, mat('#8a2a1f'), 0, -0.3, 1.08)); }
}

export function buatAvatar(cfg) {
  const akar = new THREE.Group(), tubuh = new THREE.Group(); akar.add(tubuh); // akar: tapak kaki di y=0
  const mK = mat(cfg.kulit), mB = mat(cfg.baju), mS = mat(cfg.seluar);
  const badan = kp(2, 2, 1, mB); const badanG = new THREE.Group(); badanG.position.y = 3; badanG.add(badan); tubuh.add(badanG);
  // baju Clawd: jalur kecil di dada supaya depan terbaca
  const dada = kp(1.1, 0.16, 0.04, mat('#d9b25f'), 0, 0.42, -0.51); badanG.add(dada);
  // kepala: blok lebar khas Clawd
  const kk = { w: 2.1, h: 1.25, d: 1.25 };
  const kepalaG = new THREE.Group(); kepalaG.position.y = 4; const kepala = kp(kk.w, kk.h, kk.d, mK, 0, kk.h / 2); kepalaG.add(kepala);
  const dalam = new THREE.Group(); dalam.position.y = kk.h / 2; kepalaG.add(dalam);
  const mk = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.05), tekMuka(cfg.muka || 'clawd')); mk.position.set(0, 0, -kk.d / 2 - 0.012); mk.rotation.y = Math.PI; dalam.add(mk);
  // penyepit kecil di sisi kepala, tanda Clawd
  for (const s of [-1, 1]) dalam.add(kp(0.22, 0.3, 0.36, mK, s * (kk.w / 2 + 0.1), -0.1, 0));
  aksesoriTopi(cfg.topi, dalam, kk); aksesoriBelakang(cfg.belakang, badanG); tubuh.add(kepalaG);
  const anggota = (x, y, m, tangan) => { const g = new THREE.Group(); g.position.set(x, y, 0); g.add(kp(1, 2, 1, m, 0, -1)); if (tangan) g.add(kp(1.02, 0.5, 1.02, mK, 0, -1.76)); tubuh.add(g); return g; };
  const lenKi = anggota(-1.5, 4, mB, true), lenKa = anggota(1.5, 4, mB, true), kakiKi = anggota(-0.5, 2, mS), kakiKa = anggota(0.5, 2, mS);
  const av = { akar, tubuh, badanG, kepalaG, lenKi, lenKa, kakiKi, kakiKa, fasa: Math.random() * 6, cfg, pecah: null };
  akar.traverse((o) => { o.frustumCulled = true; });
  return av;
}
export function tukarTopiMuka() {}

const LAJU = 12;
/* keadaan: {laju, diTanah, vy, panjat, sorak} */
export function animasi(av, dt, k) {
  av.fasa += dt * (k.laju > 0.5 ? LAJU * Math.max(0.7, Math.min(1.5, k.laju / 16)) : 2);
  let sa = 0, sb = 0, le = 0;
  if (k.panjat) { sa = Math.sin(av.fasa * 0.8) * 0.5 + 2.4; sb = -Math.sin(av.fasa * 0.8) * 0.5 + 2.4; le = Math.sin(av.fasa * 0.8) * 0.5; av.lenKi.rotation.x = lerp(av.lenKi.rotation.x, sa, dt * 14); av.lenKa.rotation.x = lerp(av.lenKa.rotation.x, sb, dt * 14); av.kakiKi.rotation.x = lerp(av.kakiKi.rotation.x, le, dt * 14); av.kakiKa.rotation.x = lerp(av.kakiKa.rotation.x, -le, dt * 14); return; }
  if (k.sorak) { const b = Math.sin(av.fasa * 4) * 0.2; av.lenKi.rotation.set(0, 0, -2.8 + b); av.lenKa.rotation.set(0, 0, 2.8 - b); av.kakiKi.rotation.x = av.kakiKa.rotation.x = 0; return; }
  av.lenKi.rotation.z = lerp(av.lenKi.rotation.z, 0, dt * 12); av.lenKa.rotation.z = lerp(av.lenKa.rotation.z, 0, dt * 12);
  if (!k.diTanah) { const naik = k.vy > 0; sa = naik ? 3 : 2.6; sb = naik ? 3 : 2.6; le = naik ? 0.45 : 0.2; av.lenKi.rotation.x = lerp(av.lenKi.rotation.x, sa, dt * 14); av.lenKa.rotation.x = lerp(av.lenKa.rotation.x, sb, dt * 14); av.kakiKi.rotation.x = lerp(av.kakiKi.rotation.x, le, dt * 14); av.kakiKa.rotation.x = lerp(av.kakiKa.rotation.x, -le * 0.4, dt * 14); return; }
  if (k.laju > 0.5) { const a = Math.sin(av.fasa) * 1.05; av.lenKi.rotation.x = a; av.lenKa.rotation.x = -a; av.kakiKi.rotation.x = -a; av.kakiKa.rotation.x = a; }
  else { const n = Math.sin(av.fasa) * 0.035; av.lenKi.rotation.x = lerp(av.lenKi.rotation.x, n, dt * 10); av.lenKa.rotation.x = lerp(av.lenKa.rotation.x, -n, dt * 10); av.kakiKi.rotation.x = lerp(av.kakiKi.rotation.x, 0, dt * 12); av.kakiKa.rotation.x = lerp(av.kakiKa.rotation.x, 0, dt * 12); }
  const j = av.badanG.userData.jubah; if (j) j.rotation.x = lerp(j.rotation.x, Math.min(0.9, k.laju * 0.05) + Math.sin(av.fasa * 0.5) * 0.04, dt * 8);
  const s = av.badanG.userData.sayap; if (s) s.forEach((w, i) => { w.rotation.z = (i ? 1 : -1) * Math.sin(av.fasa * 0.4) * 0.12; });
}
function lerp(a, b, k) { return a + (b - a) * Math.min(1, k); }

/* badan bercerai: setiap bahagian jadi serpihan sendiri */
const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
export function pecahkan(av, induk, lantai) {
  const bahagian = [av.kepalaG, av.badanG, av.lenKi, av.lenKa, av.kakiKi, av.kakiKa], serpih = [];
  av.akar.updateWorldMatrix(true, true);
  for (const b of bahagian) {
    b.matrixWorld.decompose(_v, _q, _s);
    b.userData.asal = { p: b.position.clone(), r: b.rotation.clone(), induk: b.parent };
    induk.add(b); b.position.copy(_v); b.quaternion.copy(_q);
    serpih.push({ o: b, v: new THREE.Vector3((Math.random() - 0.5) * 22, 12 + Math.random() * 18, (Math.random() - 0.5) * 22), w: new THREE.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9) });
  }
  av.pecah = { serpih, lantai };
}
export function kemasPecah(av, dt) {
  if (!av.pecah) return;
  for (const s of av.pecah.serpih) {
    s.v.y -= 110 * dt; s.o.position.addScaledVector(s.v, dt);
    s.o.rotation.x += s.w.x * dt; s.o.rotation.y += s.w.y * dt; s.o.rotation.z += s.w.z * dt;
    if (s.o.position.y < av.pecah.lantai + 0.5) { s.o.position.y = av.pecah.lantai + 0.5; s.v.y *= -0.35; s.v.x *= 0.7; s.v.z *= 0.7; s.w.multiplyScalar(0.6); }
  }
}
export function pulihkan(av) {
  if (!av.pecah) return;
  for (const s of av.pecah.serpih) { const a = s.o.userData.asal; a.induk.add(s.o); s.o.position.copy(a.p); s.o.rotation.copy(a.r); }
  av.pecah = null;
}
export function tagNama(nama, warna = '#efe6d2') {
  const p = papanTeks([{ t: nama, c: warna }], 5, { w: 320, h: 56, bg: 'rgba(12,21,38,.55)', bucu: 14, garis: null, padY: 0.05 });
  p.position.y = 6.6; return p;
}
/* haiwan peliharaan mini: badan Clawd asal (kotak + 4 kaki + mata) */
export function buatPet(warna, jenis = 'clawd') {
  const g = new THREE.Group(), m = mat(warna), t = mat('#1c1612');
  g.add(kp(2, 1.1, 1.2, m, 0, 1.1));
  for (const x of [-0.42, 0.42]) g.add(kp(0.16, 0.4, 0.05, t, x, 1.2, -0.62));
  for (const x of [-1.12, 1.12]) g.add(kp(0.3, 0.4, 0.4, m, x, 1, 0));
  const kaki = [];
  for (const [x, z] of [[-0.7, -0.3], [-0.28, 0.3], [0.28, -0.3], [0.7, 0.3]]) { const k = kp(0.24, 0.6, 0.26, m, x, 0.3, z); g.add(k); kaki.push(k); }
  if (jenis === 'kucing') for (const x of [-0.6, 0.6]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.5, 4), mat('#f19bb4')); c.position.set(x, 1.86, 0); c.rotation.y = Math.PI / 4; g.add(c); }
  if (jenis === 'mahkota') { g.add(kp(1.1, 0.26, 0.8, mat('#d9b25f', { r: 0.25, m: 0.7 }), 0, 1.8)); }
  if (jenis === 'sihir') { const c = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 10), mat('#2c3e6b')); c.position.y = 2.1; g.add(c); }
  g.userData.kaki = kaki; return g;
}
