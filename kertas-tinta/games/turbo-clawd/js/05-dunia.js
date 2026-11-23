/* Turbo Clawd: renderer, tema arena (kamar, dapur, kebun, benteng), properti raksasa, gerbang angka, kotak item */
import * as THREE from 'three';
import { W, bingkaiBaru } from './04-trek.js';

export const R = {};
export function siapkanRender(wadah) {
  const ringan = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const r = new THREE.WebGLRenderer({ antialias: !ringan, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, ringan ? 1.5 : 1.75));
  r.setSize(window.innerWidth, window.innerHeight);
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  r.outputColorSpace = THREE.SRGBColorSpace;
  wadah.appendChild(r.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.3, 1400);
  const hemi = new THREE.HemisphereLight('#ffffff', '#6b4a2e', 1.25); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff3dd', 2.2); sun.position.set(120, 220, 80); scene.add(sun);
  Object.assign(R, { r, scene, cam, hemi, sun, ringan });
  window.addEventListener('resize', () => { r.setSize(window.innerWidth, window.innerHeight); cam.aspect = window.innerWidth / window.innerHeight; cam.updateProjectionMatrix(); });
  return R;
}

function kanvas(w, h, gambar) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; gambar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const mat = (col, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: col, roughness: 0.55 }, o));

export const TEMA = {
  kamar: { langit: '#bfe3ff', kabut: [260, 900], lantai: (g, w, h) => { g.fillStyle = '#c98a52'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#b97a44' : '#d39860'; g.fillRect(0, i * h / 8, w, h / 8 - 2); g.fillStyle = 'rgba(80,40,10,0.25)'; g.fillRect(0, (i + 1) * h / 8 - 2, w, 2); } }, ulang: 40, tiang: '#4a6fd8', hemiBawah: '#7a5232' },
  dapur: { langit: '#fde9d2', kabut: [260, 900], lantai: (g, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#f3f0ea' : '#2a7f8f'; g.fillRect(i * w / 4, j * h / 4, w / 4, h / 4); } }, ulang: 60, tiang: '#e2e8f0', hemiBawah: '#8a7f70' },
  kebun: { langit: '#8fd3ff', kabut: [300, 1000], lantai: (g, w, h) => { g.fillStyle = '#5cb84a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? '#4fa83f' : '#6cc957'; g.fillRect(Math.random() * w, Math.random() * h, 2, 5); } }, ulang: 50, tiang: '#7c4a2a', hemiBawah: '#3e6b2e' },
  benteng: { langit: '#271c4a', kabut: [200, 760], lantai: (g, w, h) => { g.fillStyle = '#2c2747'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,210,58,0.22)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); } }, ulang: 50, tiang: '#ffd23a', hemiBawah: '#3a2a60', malam: true }
};

/* kubus angka (balok mainan) */
const texAngka = {};
function teksturAngka(n, col) {
  const k = n + col; if (texAngka[k]) return texAngka[k];
  return (texAngka[k] = kanvas(128, 128, (g) => { g.fillStyle = col; g.fillRect(0, 0, 128, 128); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 10; g.strokeRect(5, 5, 118, 118); g.fillStyle = '#ffffff'; g.font = '800 84px Geist, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 64, 70); }));
}
const WARNA_BALOK = ['#e63b46', '#2f8cff', '#29c06f', '#ffc531', '#8b5cf6', '#ff7a1a'];

function prop(tema) {
  const g = new THREE.Group(), rnd = Math.random;
  if (tema === 'kamar') {
    const pilih = rnd();
    if (pilih < 0.45) { // balok angka
      const s = 8 + rnd() * 10, col = WARNA_BALOK[Math.floor(rnd() * 6)];
      const b = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), new THREE.MeshStandardMaterial({ map: teksturAngka(Math.floor(rnd() * 10), col), roughness: 0.5 }));
      b.position.y = s / 2; b.rotation.y = rnd() * 3; g.add(b);
      if (rnd() < 0.4) { const s2 = s * 0.7, b2 = new THREE.Mesh(new THREE.BoxGeometry(s2, s2, s2), new THREE.MeshStandardMaterial({ map: teksturAngka(Math.floor(rnd() * 10), WARNA_BALOK[Math.floor(rnd() * 6)]) })); b2.position.y = s + s2 / 2; b2.rotation.y = rnd() * 3; g.add(b2); }
    } else if (pilih < 0.7) { // tumpukan buku
      let y = 0; const n = 2 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) { const h = 3 + rnd() * 2; const b = new THREE.Mesh(new THREE.BoxGeometry(26 + rnd() * 8, h, 18 + rnd() * 6), mat(WARNA_BALOK[Math.floor(rnd() * 6)])); b.position.y = y + h / 2; b.rotation.y = (rnd() - 0.5) * 0.4; y += h; g.add(b);
        const kertas = new THREE.Mesh(new THREE.BoxGeometry(25, h * 0.7, 17.4), mat('#fff7e6')); kertas.position.copy(b.position).add(new THREE.Vector3(0.8, 0, 0)); kertas.rotation.y = b.rotation.y; g.add(kertas); }
    } else if (pilih < 0.88) { // pensil raksasa rebah
      const p = new THREE.Group(); const badan = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 50, 6), mat('#ffc531')); badan.rotation.z = Math.PI / 2; p.add(badan);
      const ujung = new THREE.Mesh(new THREE.ConeGeometry(2, 7, 6), mat('#f1d3a5')); ujung.rotation.z = -Math.PI / 2; ujung.position.x = 28.5; p.add(ujung);
      const hapus = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 5, 6), mat('#f06bb5')); hapus.rotation.z = Math.PI / 2; hapus.position.x = -27.5; p.add(hapus);
      p.position.y = 2; p.rotation.y = rnd() * 3; g.add(p);
    } else { // bola mainan
      const r = 6 + rnd() * 6; const b = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat(WARNA_BALOK[Math.floor(rnd() * 6)], { roughness: 0.3 })); b.position.y = r; g.add(b);
    }
  } else if (tema === 'dapur') {
    const pilih = rnd();
    if (pilih < 0.35) { // cangkir
      const r = 9 + rnd() * 5, h = 16 + rnd() * 6, col = ['#ffffff', '#2f8cff', '#e63b46', '#ffc531'][Math.floor(rnd() * 4)];
      const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, h, 22, 1, true), mat(col, { side: THREE.DoubleSide, roughness: 0.3 })); c.position.y = h / 2; g.add(c);
      const isi = new THREE.Mesh(new THREE.CircleGeometry(r * 0.95, 22), mat('#6b3a1e')); isi.rotation.x = -Math.PI / 2; isi.position.y = h * 0.8; g.add(isi);
      const gag = new THREE.Mesh(new THREE.TorusGeometry(h * 0.25, 1.2, 8, 16), mat(col)); gag.position.set(r + 2, h / 2, 0); g.add(gag);
    } else if (pilih < 0.6) { // buah
      const cols = ['#ff8c1a', '#e63b46', '#7dd34a', '#ffd23a'], r = 6 + rnd() * 5;
      const b = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat(cols[Math.floor(rnd() * 4)], { roughness: 0.4 })); b.position.y = r; g.add(b);
      const tk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 3), mat('#5a3a1e')); tk.position.y = 2 * r + 1; g.add(tk);
    } else if (pilih < 0.8) { // piring tumpuk
      for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(16, 12, 1.4, 28), mat('#f8fafc', { roughness: 0.25 })); p.position.y = 0.7 + i * 1.6; g.add(p); }
    } else { // sendok
      const s = new THREE.Group(); const gag = new THREE.Mesh(new THREE.BoxGeometry(40, 1, 3), mat('#cbd5e1', { metalness: 0.8, roughness: 0.25 })); s.add(gag);
      const kepala = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 10), mat('#cbd5e1', { metalness: 0.8, roughness: 0.25 })); kepala.scale.y = 0.25; kepala.position.x = 24; s.add(kepala);
      s.position.y = 1; s.rotation.y = rnd() * 3; g.add(s);
    }
  } else if (tema === 'kebun') {
    const pilih = rnd();
    if (pilih < 0.5) { // bunga raksasa
      const h = 18 + rnd() * 16; const batang = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, h, 6), mat('#2f8f3a')); batang.position.y = h / 2; g.add(batang);
      const col = ['#ff5d8f', '#ffd23a', '#ffffff', '#a78bfa', '#ff7a1a'][Math.floor(rnd() * 5)];
      for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(3.4, 10, 8), mat(col)); p.scale.set(1, 0.35, 0.6); const a = i / 6 * Math.PI * 2; p.position.set(Math.cos(a) * 3.8, h, Math.sin(a) * 3.8); p.rotation.y = -a; g.add(p); }
      const tengah = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 10), mat('#ffb703')); tengah.position.y = h + 0.5; g.add(tengah);
      const daun = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 6), mat('#3aa64a')); daun.scale.set(1, 0.2, 0.45); daun.position.set(3, h * 0.4, 0); daun.rotation.z = 0.5; g.add(daun);
    } else if (pilih < 0.7) { // jamur
      const h = 8 + rnd() * 6; const b = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.6, h, 10), mat('#fff3e0')); b.position.y = h / 2; g.add(b);
      const t = new THREE.Mesh(new THREE.SphereGeometry(7, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat('#e63b46')); t.position.y = h; g.add(t);
    } else if (pilih < 0.85) { // batu
      const b = new THREE.Mesh(new THREE.DodecahedronGeometry(6 + rnd() * 6), mat('#9aa3ad', { flatShading: true })); b.position.y = 3; g.add(b);
    } else { // pagar kayu
      for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(3, 22, 1.4), mat('#f5deb3')); p.position.set(i * 4.2, 11, 0); g.add(p); }
      const pal = new THREE.Mesh(new THREE.BoxGeometry(26, 2, 1), mat('#e9c99a')); pal.position.set(10.5, 15, 0.8); g.add(pal); g.rotation.y = rnd() * 3;
    }
  } else { // benteng
    const pilih = rnd();
    if (pilih < 0.5) { // kaleng
      const r = 7 + rnd() * 4, h = 18 + rnd() * 10;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 22), mat('#c0c6d4', { metalness: 0.85, roughness: 0.3 })); c.position.y = h / 2; g.add(c);
      const lbl = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.05, r + 0.05, h * 0.5, 22, 1, true), mat(['#e63b46', '#8b5cf6', '#ffd23a'][Math.floor(rnd() * 3)])); lbl.position.y = h / 2; g.add(lbl);
    } else if (pilih < 0.8) { // menara benteng
      const h = 30 + rnd() * 20; const t = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, h, 8), mat('#4b4470')); t.position.y = h / 2; g.add(t);
      const atap = new THREE.Mesh(new THREE.ConeGeometry(8, 12, 8), mat('#e63b46')); atap.position.y = h + 6; g.add(atap);
      const bend = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.5), new THREE.MeshBasicMaterial({ color: '#ffd23a', side: THREE.DoubleSide })); bend.position.set(3, h + 14, 0); g.add(bend);
      const jndl = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3, 0.4), new THREE.MeshBasicMaterial({ color: '#ffe8a3' })); jndl.position.set(0, h * 0.7, 6.6); g.add(jndl);
    } else { // mahkota besar
      const m = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 7, 8, 1, true), mat('#ffd23a', { metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide, emissive: '#5a4300' })); m.position.y = 3.5; g.add(m);
      for (let i = 0; i < 8; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.8, 6, 4), mat('#ffd23a', { metalness: 0.7, roughness: 0.3 })); const a = i / 8 * Math.PI * 2; c.position.set(Math.cos(a) * 9, 10, Math.sin(a) * 9); g.add(c); }
    }
  }
  return g;
}

/* bangun dunia untuk satu arena */
export function bangunDunia(trek, temaId) {
  const tm = TEMA[temaId], g = new THREE.Group();
  R.scene.background = new THREE.Color(tm.langit);
  R.scene.fog = new THREE.Fog(tm.langit, tm.kabut[0], tm.kabut[1]);
  R.hemi.groundColor.set(tm.hemiBawah); R.hemi.intensity = tm.malam ? 0.9 : 1.25; R.sun.intensity = tm.malam ? 1.0 : 2.2; R.sun.color.set(tm.malam ? '#b9a6ff' : '#fff3dd');
  const tex = kanvas(256, 256, tm.lantai); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1400 / tm.ulang, 1400 / tm.ulang);
  const lantai = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
  lantai.rotation.x = -Math.PI / 2; g.add(lantai);
  // bintang & bulan di benteng
  if (tm.malam) {
    const pos = []; for (let i = 0; i < 500; i++) { const a = Math.random() * Math.PI * 2, e = 0.15 + Math.random() * 0.9; pos.push(Math.cos(a) * Math.cos(e) * 600, Math.sin(e) * 600, Math.sin(a) * Math.cos(e) * 600); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 2.2, sizeAttenuation: false, fog: false })));
    const bulan = new THREE.Mesh(new THREE.SphereGeometry(30, 20, 14), new THREE.MeshBasicMaterial({ color: '#fff1b8', fog: false })); bulan.position.set(-300, 260, -420); g.add(bulan);
  } else {
    // awan / dinding jauh
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2 + Math.random() * 0.2, d = 520 + Math.random() * 80;
      const aw = new THREE.Group();
      for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(18 + Math.random() * 14, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false })); b.position.set(k * 22 - 33, Math.random() * 8, Math.random() * 10); b.scale.y = 0.6; aw.add(b); }
      aw.position.set(Math.cos(a) * d, 120 + Math.random() * 80, Math.sin(a) * d); aw.lookAt(0, aw.position.y, 0); g.add(aw);
    }
  }
  // properti raksasa, menjauh dari lintasan
  const sampel = []; for (let i = 0; i < trek.N; i += 8) sampel.push([trek.P[i * 3], trek.P[i * 3 + 2]]);
  let dipasang = 0;
  for (let n = 0; n < 900 && dipasang < (R.ringan ? 45 : 70); n++) {
    const x = (Math.random() - 0.5) * 780, z = (Math.random() - 0.5) * 700;
    let dmin = 1e9; for (const [a, b] of sampel) { const d = (a - x) ** 2 + (b - z) ** 2; if (d < dmin) dmin = d; }
    if (dmin < 30 * 30) continue;
    const p = prop(temaId); p.position.set(x, 0, z); g.add(p); dipasang++;
  }
  return g;
}

/* ===== gerbang angka ===== */
export const WARNA_LAJUR = ['#2f8cff', '#ffc531', '#f06bb5'];
function gambarPanel(g, w, h, teks, warna, kecil) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#14182b'; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 26); g.fill();
  g.lineWidth = 10; g.strokeStyle = warna; g.beginPath(); g.roundRect(9, 9, w - 18, h - 18, 22); g.stroke();
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `800 ${kecil ? h * 0.5 : h * 0.46}px Geist, system-ui, sans-serif`; g.fillText(teks, w / 2, h / 2 + 4);
}
export function buatGerbang(trek, s) {
  const tmp = bingkaiBaru(); trek.bingkai(s, tmp);
  const g = new THREE.Group(); const m = new THREE.Matrix4(), nt = tmp.t.clone().negate();
  m.makeBasis(tmp.r, tmp.u, nt); g.quaternion.setFromRotationMatrix(m); g.position.copy(tmp.p);
  const matTiang = new THREE.MeshStandardMaterial({ color: '#14182b', roughness: 0.5 });
  for (const sg of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.7, 10, 0.7), matTiang); t.position.set(sg * (W + 1.1), 5, 0); g.add(t); }
  const balok = new THREE.Mesh(new THREE.BoxGeometry(2 * W + 2.8, 0.6, 0.6), matTiang); balok.position.y = 10; g.add(balok);
  // panel soal di atas
  const cs = document.createElement('canvas'); cs.width = 512; cs.height = 128;
  const ts = new THREE.CanvasTexture(cs); ts.colorSpace = THREE.SRGBColorSpace;
  const pSoal = new THREE.Mesh(new THREE.PlaneGeometry(13, 3.25), new THREE.MeshBasicMaterial({ map: ts, transparent: true, side: THREE.DoubleSide })); pSoal.position.set(0, 12.3, 0); g.add(pSoal);
  // tiga panel jawaban + lengkung lajur
  const pj = [];
  const lebar = 2 * W / 3;
  for (let k = 0; k < 3; k++) {
    const x = -W + lebar * (k + 0.5);
    const c = document.createElement('canvas'); c.width = 256; c.height = 160;
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.6), new THREE.MeshBasicMaterial({ map: tx, transparent: true, side: THREE.DoubleSide })); p.position.set(x, 8.2, 0); g.add(p);
    const lengkung = new THREE.Mesh(new THREE.TorusGeometry(lebar / 2 - 0.25, 0.22, 6, 20, Math.PI), new THREE.MeshBasicMaterial({ color: WARNA_LAJUR[k] })); lengkung.position.set(x, 3.2, 0); g.add(lengkung);
    for (const sg of [-1, 1]) { const kaki = new THREE.Mesh(new THREE.BoxGeometry(0.44, 3.2, 0.44), new THREE.MeshBasicMaterial({ color: WARNA_LAJUR[k] })); kaki.position.set(x + sg * (lebar / 2 - 0.25), 1.6, 0); g.add(kaki); }
    const lantai = new THREE.Mesh(new THREE.PlaneGeometry(lebar - 0.6, 5), new THREE.MeshBasicMaterial({ color: WARNA_LAJUR[k], transparent: true, opacity: 0.35 }));
    lantai.rotation.x = -Math.PI / 2; lantai.position.set(x, 0.06, 0); g.add(lantai);
    pj.push({ c, tx, mesh: p });
  }
  const obj = { s, g, cs, ts, pj, soalId: -1 };
  obj.tulis = (soal, id) => {
    if (obj.soalId === id) return; obj.soalId = id;
    gambarPanel(cs.getContext('2d'), 512, 128, soal.teks + ' = ?', '#ff7a1a');
    ts.needsUpdate = true;
    pj.forEach((p, k) => { gambarPanel(p.c.getContext('2d'), 256, 160, String(soal.pilihan[k]), WARNA_LAJUR[k], true); p.tx.needsUpdate = true; });
  };
  obj.kosong = () => { obj.soalId = -1; const g2 = cs.getContext('2d'); gambarPanel(g2, 512, 128, '', '#ff7a1a'); ts.needsUpdate = true; pj.forEach((p, k) => { gambarPanel(p.c.getContext('2d'), 256, 160, '', WARNA_LAJUR[k], true); p.tx.needsUpdate = true; }); };
  return obj;
}

/* ===== kotak item ===== */
let texKotak = null;
export function buatKotak(trek, s, x) {
  if (!texKotak) texKotak = kanvas(128, 128, (g) => {
    const gr = g.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, '#39d0ff'); gr.addColorStop(0.5, '#a78bfa'); gr.addColorStop(1, '#ff7ac8');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.strokeRect(6, 6, 116, 116);
    g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath();
    const p = [[64, 24], [74, 52], [104, 54], [80, 72], [88, 102], [64, 86], [40, 102], [48, 72], [24, 54], [54, 52]];
    p.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.closePath(); g.stroke();
  });
  const tmp = bingkaiBaru(); trek.bingkai(s, tmp);
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 1.7), new THREE.MeshStandardMaterial({ map: texKotak, transparent: true, opacity: 0.92, emissive: '#5b3dbf', emissiveIntensity: 0.35, roughness: 0.2 }));
  const pos = tmp.p.clone().addScaledVector(tmp.r, x).addScaledVector(tmp.u, 1.7);
  m.position.copy(pos);
  return { s, x, mesh: m, aktif: true, tunggu: 0, dasar: pos.clone(), u: tmp.u.clone() };
}
