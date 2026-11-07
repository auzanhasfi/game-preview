/* Clawd Kilat: jalur 3 lajur, tanah samping, dekorasi per zona, latar jauh, dan peralihan warna zona */
import * as THREE from 'three';
import { R, mat } from './04-render.js';
import { ZONA } from './01-data.js';

export const LAJUR = 2.6;
const SEG = 10, NSEG = 22, TOT = SEG * NSEG;
const M = {};           // material bersama yang warnanya beralih antar zona
const warnaKini = {};   // THREE.Color per kunci zona
let seg = [], deko = [], dekoKursor = 0, latarJauh = {}, air = null, zonaKini = 0;

const rnd = (a, b) => a + Math.random() * (b - a);
const G = {};
function geo() {
  G.kotak = new THREE.BoxGeometry(1, 1, 1);
  G.silinder = new THREE.CylinderGeometry(1, 1, 1, 8);
  G.kerucut = new THREE.ConeGeometry(1, 1, 7);
  G.bola = new THREE.IcosahedronGeometry(1, 1);
  G.kubah = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  G.loop = new THREE.TorusGeometry(7, 0.75, 8, 48);
  G.cincin = new THREE.TorusGeometry(1, 0.08, 6, 32);
}

export function siapkanDunia() {
  geo();
  const z = ZONA[0];
  for (const k of ['jalurA', 'jalurB', 'tanah', 'tanah2', 'garis', 'tepi']) {
    warnaKini[k] = new THREE.Color(z[k]);
    M[k] = mat(z[k], k === 'garis' || k === 'tepi' ? { pijar: z[k], pijarK: 0.35 } : { kasar: 0.9 });
  }
  for (let i = 0; i < NSEG; i++) {
    const g = new THREE.Group();
    const lantai = new THREE.Mesh(G.kotak, i % 2 ? M.jalurA : M.jalurB); lantai.scale.set(8.6, 0.5, SEG); lantai.position.y = -0.25; g.add(lantai);
    for (const x of [-LAJUR / 2, LAJUR / 2]) { const l = new THREE.Mesh(G.kotak, M.garis); l.scale.set(0.12, 0.04, SEG * 0.55); l.position.set(x, 0.01, 0); g.add(l); }
    for (const x of [-4.5, 4.5]) { const t = new THREE.Mesh(G.kotak, M.tepi); t.scale.set(0.5, 0.45, SEG); t.position.set(x, 0, 0); g.add(t); }
    for (const s of [-1, 1]) { const t = new THREE.Mesh(G.kotak, i % 2 ? M.tanah : M.tanah2); t.scale.set(90, 0.5, SEG); t.position.set(s * 49.7, -0.45, 0); g.add(t); }
    R.scene.add(g); seg.push(g);
  }
  /* laut di zona pantai (sisi kanan) */
  air = new THREE.Mesh(new THREE.PlaneGeometry(160, 260, 1, 1), mat('#3fb0d8', { kasar: 0.2, logam: 0.3, pijar: '#1a6f98', pijarK: 0.3 }));
  air.rotation.x = -Math.PI / 2; air.position.set(88, -0.3, -100); air.visible = false; R.scene.add(air);
  buatLatarJauh();
}

/* latar jauh tanpa lengkung: gunung (zona 0/1) & siluet kota (zona 2) */
function buatLatarJauh() {
  const gunung = new THREE.Group(), kota = new THREE.Group();
  const mg = new THREE.MeshBasicMaterial({ color: '#8fc0d8', fog: false }), mg2 = new THREE.MeshBasicMaterial({ color: '#a9d4e6', fog: false });
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(G.kerucut, i % 2 ? mg : mg2), s = rnd(30, 70);
    m.scale.set(s * 1.3, s, s); m.position.set(rnd(-260, 260), s / 2 - 22, -250 - rnd(0, 40)); gunung.add(m);
  }
  const mk = new THREE.MeshBasicMaterial({ color: '#2a1d55', fog: false }), mk2 = new THREE.MeshBasicMaterial({ color: '#3a2a70', fog: false });
  for (let i = 0; i < 40; i++) {
    const m = new THREE.Mesh(G.kotak, i % 2 ? mk : mk2), h = rnd(20, 90);
    m.scale.set(rnd(10, 22), h, 10); m.position.set(rnd(-280, 280), h / 2 - 25, -250 - rnd(0, 30)); kota.add(m);
  }
  kota.visible = false;
  R.scene.add(gunung, kota);
  latarJauh = { gunung, kota, mg, mg2 };
}

/* ---------- dekorasi ---------- */
function buatDeko(tipe, zona) {
  const g = new THREE.Group();
  const Z = ZONA[zona];
  if (tipe === 'pohon') {
    const batang = mat(zona === 1 ? '#a87a4a' : '#8a5a34'), daun = mat(zona === 1 ? '#3fae5a' : '#3c9a3e', { pijar: '#123a12', pijarK: 0.3 });
    const tinggi = rnd(5, 8);
    for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(G.silinder, batang); b.scale.set(0.32 - i * 0.03, tinggi / 5, 0.32 - i * 0.03); b.position.set(i * 0.12, i * tinggi / 5 + tinggi / 10, 0); b.rotation.z = -0.05; g.add(b); }
    for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(G.kotak, daun); d.scale.set(3.2, 0.12, 0.9); d.geometry = G.kotak; d.position.set(0.6 + Math.cos(i) * 1.3, tinggi + 0.1, Math.sin(i * 1.05) * 1.3); d.rotation.set(0, i * 1.05, -0.35); g.add(d); }
    const kelapa = mat('#6b4a2a'); for (let i = 0; i < 3; i++) { const k = new THREE.Mesh(G.bola, kelapa); k.scale.setScalar(0.28); k.position.set(0.6 + Math.cos(i * 2) * 0.4, tinggi - 0.3, Math.sin(i * 2) * 0.4); g.add(k); }
  } else if (tipe === 'bukit') {
    const w = zona === 0 ? ['#5aa846', '#4a963a'] : ['#e6c28a', '#d9b27a'];
    const k = new THREE.Mesh(G.kubah, mat(w[0], { kasar: 1 })); const s = rnd(6, 12); k.scale.set(s, s * rnd(0.6, 1), s); g.add(k);
    for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(G.cincin, mat(w[1])); c.scale.setScalar(s * (0.95 - i * 0.22)); c.rotation.x = Math.PI / 2; c.position.y = s * 0.28 * i * 0.7 + 0.5; g.add(c); }
  } else if (tipe === 'loop') {
    const m = zona === 2 ? mat('#5ef0ff', { pijar: '#5ef0ff', pijarK: 1.4 }) : mat(Z.tepi, { logam: 0.3, kasar: 0.4 });
    const l = new THREE.Mesh(G.loop, m); l.rotation.y = Math.PI / 2; l.position.y = 7.6; g.add(l);
    const dalam = new THREE.Mesh(new THREE.TorusGeometry(7, 0.25, 6, 48), mat(zona === 2 ? '#ff7ac8' : '#fff6dc', { pijar: zona === 2 ? '#ff7ac8' : '#000000', pijarK: 1.2 }));
    dalam.rotation.y = Math.PI / 2; dalam.position.set(0, 7.6, 0); dalam.scale.setScalar(0.93); g.add(dalam);
    for (const z of [-7.3, 7.3]) { const t = new THREE.Mesh(G.kotak, m); t.scale.set(1.2, 1.2, 1.2); t.position.set(0, 0.4, z); g.add(t); }
  } else if (tipe === 'totem') {
    const warna = ['#d8714f', '#f2c14e', '#7f9fd9', '#a3b86c'];
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) { const b = new THREE.Mesh(G.kotak, mat(warna[i % 4])); b.scale.set(1.6, 1.4, 1.6); b.position.y = 0.7 + i * 1.45; b.rotation.y = i * 0.2; g.add(b);
      const mata = new THREE.Mesh(G.kotak, mat('#2e2620')); mata.scale.set(0.18, 0.45, 0.05); for (const x of [-0.35, 0.35]) { const e = mata.clone(); e.position.set(x, b.position.y + 0.1, 0.82); g.add(e); } }
  } else if (tipe === 'bunga') {
    const warna = ['#ff8fb1', '#ffd85a', '#ffffff', '#c39bff'][Math.floor(Math.random() * 4)];
    const tangkai = new THREE.Mesh(G.silinder, mat('#3c8a34')); tangkai.scale.set(0.08, 1.2, 0.08); tangkai.position.y = 0.6; g.add(tangkai);
    for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(G.bola, mat(warna, { pijar: warna, pijarK: 0.15 })); p.scale.set(0.35, 0.12, 0.35); p.position.set(Math.cos(i * 1.256) * 0.35, 1.25, Math.sin(i * 1.256) * 0.35); g.add(p); }
    const pusat = new THREE.Mesh(G.bola, mat('#f2a23a')); pusat.scale.setScalar(0.22); pusat.position.y = 1.3; g.add(pusat);
    g.scale.setScalar(rnd(1, 1.8));
  } else if (tipe === 'awan') {
    const m = mat(zona === 2 ? '#6a5aa8' : '#ffffff', { kasar: 1, pijar: zona === 1 ? '#ffb88a' : '#000000', pijarK: 0.35 });
    for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(G.bola, m); const s = rnd(1.6, 3.2); b.scale.set(s * 1.3, s, s); b.position.set(i * 2.2 - 4.4, Math.sin(i) * 0.6, rnd(-1, 1)); g.add(b); }
  } else if (tipe === 'air') {
    const batu = new THREE.Mesh(G.kotak, mat('#7d8a8f', { kasar: 1 })); batu.scale.set(8, 16, 6); batu.position.y = 8; g.add(batu);
    const rumput = new THREE.Mesh(G.kotak, mat('#5aa846')); rumput.scale.set(8.4, 0.8, 6.4); rumput.position.y = 16.2; g.add(rumput);
    const terjun = new THREE.Mesh(G.kotak, mat('#8fe0ff', { pijar: '#5ec8f0', pijarK: 0.6, kasar: 0.2 })); terjun.scale.set(3, 15.5, 0.4); terjun.position.set(0, 8, 3.1); terjun.userData.terjun = true; g.add(terjun);
    const busa = new THREE.Mesh(G.bola, mat('#ffffff', { pijar: '#ffffff', pijarK: 0.4 })); busa.scale.set(2.6, 0.8, 1.4); busa.position.set(0, 0.3, 3.6); g.add(busa);
  } else if (tipe === 'payung') {
    const tiang = new THREE.Mesh(G.silinder, mat('#ffffff')); tiang.scale.set(0.08, 3, 0.08); tiang.position.y = 1.5; g.add(tiang);
    const atap = new THREE.Mesh(G.kerucut, mat(Math.random() < 0.5 ? '#ff6b5a' : '#3fa8e0')); atap.scale.set(2.2, 0.8, 2.2); atap.position.y = 3.2; g.add(atap);
  } else if (tipe === 'mercusuar') {
    for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(G.silinder, mat(i % 2 ? '#e04a3a' : '#ffffff')); b.scale.set(1.6 - i * 0.15, 3, 1.6 - i * 0.15); b.position.y = 1.5 + i * 3; g.add(b); }
    const lampu = new THREE.Mesh(G.bola, mat('#fff3a0', { pijar: '#fff3a0', pijarK: 2 })); lampu.scale.setScalar(1); lampu.position.y = 16; g.add(lampu);
  } else if (tipe === 'gedung') {
    const h = rnd(10, 34), w = rnd(5, 9);
    const b = new THREE.Mesh(G.kotak, mat(Math.random() < 0.5 ? '#231f48' : '#2c2558', { kasar: 0.6 })); b.scale.set(w, h, w); b.position.y = h / 2; g.add(b);
    const jm = mat(Math.random() < 0.5 ? '#5ef0ff' : '#ff7ac8', { pijar: Math.random() < 0.5 ? '#5ef0ff' : '#ff7ac8', pijarK: 1.6 });
    for (let y = 2; y < h - 1; y += 2.4) for (const s of [-1, 1]) if (Math.random() < 0.6) { const j = new THREE.Mesh(G.kotak, jm); j.scale.set(w * 0.7, 0.25, 0.1); j.position.set(0, y, s * (w / 2 + 0.05)); g.add(j); }
    const atas = new THREE.Mesh(G.kotak, jm); atas.scale.set(w + 0.2, 0.3, w + 0.2); atas.position.y = h; g.add(atas);
  } else if (tipe === 'neon') {
    const t = new THREE.Mesh(G.silinder, mat('#3a3560')); t.scale.set(0.15, 6, 0.15); t.position.y = 3; g.add(t);
    const w = Math.random() < 0.5 ? '#ff7ac8' : '#5ef0ff';
    const l = new THREE.Mesh(G.kotak, mat(w, { pijar: w, pijarK: 2.2 })); l.scale.set(1.8, 0.2, 0.2); l.position.set(0, 6, 0); g.add(l);
  } else if (tipe === 'papan') {
    const kaki = mat('#3a3560'); for (const x of [-2, 2]) { const k = new THREE.Mesh(G.silinder, kaki); k.scale.set(0.15, 5, 0.15); k.position.set(x, 2.5, 0); g.add(k); }
    const simbol = ['+', '−', '×', '÷', '='][Math.floor(Math.random() * 5)];
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
    x.fillStyle = '#120d33'; x.fillRect(0, 0, 256, 128); x.strokeStyle = '#ff7ac8'; x.lineWidth = 8; x.strokeRect(8, 8, 240, 112);
    x.fillStyle = '#5ef0ff'; x.font = '800 90px Geist, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(simbol, 128, 70);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const p = new THREE.Mesh(G.kotak, mat('#ffffff', { map: tex, pijar: '#ffffff', pijarK: 0.0 })); p.material.emissiveMap = tex; p.material.emissiveIntensity = 1.4; p.material.emissive = new THREE.Color('#ffffff');
    p.scale.set(6, 3, 0.3); p.position.y = 6; g.add(p);
  }
  g.userData.tipe = tipe; g.userData.zona = zona;
  return g;
}

const DAFTAR_DEKO = [
  [['pohon', 4], ['bukit', 2], ['bunga', 4], ['totem', 1], ['loop', 0.5], ['air', 0.4], ['awan', 1.2]],
  [['pohon', 5], ['payung', 1.5], ['bukit', 1], ['loop', 0.5], ['mercusuar', 0.25], ['awan', 1.2]],
  [['gedung', 5], ['neon', 3], ['papan', 0.8], ['loop', 0.6], ['awan', 0.6]]
];
function pilihTipe(z) { const d = DAFTAR_DEKO[z], tot = d.reduce((a, b) => a + b[1], 0); let x = Math.random() * tot; for (const [t, w] of d) { x -= w; if (x <= 0) return t; } return d[0][0]; }

const simpanan = {};
function ambilDeko(tipe, zona) {
  const k = tipe + zona, s = simpanan[k] || (simpanan[k] = []);
  const g = s.pop() || buatDeko(tipe, zona); g.visible = true; R.scene.add(g); return g;
}
function lepasDeko(g) { R.scene.remove(g); (simpanan[g.userData.tipe + g.userData.zona] ||= []).push(g); }

function spawnDeko(w, zona) {
  for (const sisi of [-1, 1]) {
    if (zona === 1 && sisi === 1 && Math.random() < 0.7) continue; // sisi laut
    const tipe = pilihTipe(zona);
    const g = ambilDeko(tipe, zona);
    let x = sisi * rnd(7.5, 20);
    if (tipe === 'loop') x = sisi * rnd(9.5, 12);
    if (tipe === 'bukit' || tipe === 'air' || tipe === 'mercusuar') x = sisi * rnd(22, 40);
    if (tipe === 'gedung') x = sisi * rnd(10, 30);
    if (tipe === 'bunga') x = sisi * rnd(5.6, 9);
    g.position.set(x, tipe === 'awan' ? rnd(14, 26) : 0, 0);
    g.rotation.y = tipe === 'loop' || tipe === 'papan' || tipe === 'air' ? (tipe === 'air' ? (sisi > 0 ? -Math.PI / 2 : Math.PI / 2) : (tipe === 'papan' ? sisi * -0.5 : 0)) : rnd(0, 6.28);
    deko.push({ g, w: w + rnd(-3, 3) });
  }
}

/* ---------- pembaruan tiap frame ---------- */
export function perbaruiDunia(dist, dt, waktu, zonaTarget) {
  for (let i = 0; i < NSEG; i++) {
    const p = (((i * SEG - dist) % TOT) + TOT) % TOT;
    seg[i].position.z = -p + SEG * 2;
  }
  while (dekoKursor < dist + 175) { spawnDeko(dekoKursor, zonaKini); dekoKursor += zonaKini === 2 ? 7 : 9; }
  for (let i = deko.length - 1; i >= 0; i--) {
    const d = deko[i]; d.g.position.z = dist - d.w;
    if (d.g.userData.tipe === 'awan') d.g.position.z = (dist - d.w) * 0.6 - 40;
    if (d.g.position.z > 20) { lepasDeko(d.g); deko.splice(i, 1); }
  }
  if (air) air.position.z = -100 + ((dist * 0.0) % 1);
  /* peralihan warna zona */
  const Z = ZONA[zonaTarget], k = 1 - Math.exp(-dt * 1.6);
  for (const kunci of ['jalurA', 'jalurB', 'tanah', 'tanah2', 'garis', 'tepi']) {
    warnaKini[kunci].lerp(_c.set(Z[kunci]), k); M[kunci].color.copy(warnaKini[kunci]);
    if (kunci === 'garis' || kunci === 'tepi') M[kunci].emissive.copy(warnaKini[kunci]).multiplyScalar(zonaTarget === 2 ? 2.2 : 0.35);
  }
  const L = R.langitMat.uniforms;
  L.cA.value.lerp(_c.set(Z.langitA), k); L.cB.value.lerp(_c.set(Z.langitB), k); L.cS.value.lerp(_c.set(Z.matahari), k);
  L.bintang.value += ((zonaTarget === 2 ? 1 : 0) - L.bintang.value) * k; L.t.value = waktu;
  R.scene.fog.color.lerp(_c.set(Z.kabut), k);
  R.hemi.color.lerp(_c.set(Z.hemi[0]), k); R.hemi.groundColor.lerp(_c.set(Z.hemi[1]), k);
  R.sinar.color.lerp(_c.set(Z.sinar), k);
  R.sinar.intensity += ((zonaTarget === 2 ? 1.5 : 2.1) - R.sinar.intensity) * k;
  latarJauh.mg.color.lerp(_c.set(zonaTarget === 1 ? '#e8a07a' : '#8fc0d8'), k);
  latarJauh.mg2.color.lerp(_c.set(zonaTarget === 1 ? '#f2b890' : '#a9d4e6'), k);
  if (zonaTarget !== zonaKini) {
    zonaKini = zonaTarget;
    latarJauh.gunung.visible = zonaKini !== 2; latarJauh.kota.visible = zonaKini === 2; air.visible = zonaKini === 1;
  }
  /* air terjun berkilau */
  for (const d of deko) if (d.g.userData.tipe === 'air') { const t = d.g.children[2]; t.material.emissiveIntensity = 0.5 + Math.sin(waktu * 9) * 0.15; }
}
const _c = new THREE.Color();

export function aturZonaLangsung(z) {
  zonaKini = z; const Z = ZONA[z];
  for (const k in warnaKini) warnaKini[k].set(Z[k]);
  latarJauh.gunung.visible = z !== 2; latarJauh.kota.visible = z === 2; air.visible = z === 1;
}
export function resetDunia(dist = 0) {
  for (const d of deko) lepasDeko(d.g);
  deko = []; dekoKursor = dist - 20;
  while (dekoKursor < dist + 175) { spawnDeko(dekoKursor, zonaKini); dekoKursor += 9; }
}
