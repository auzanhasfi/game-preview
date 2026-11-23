/* Pinball Clawd: tampilan 3D meja (three.js) — playfield bergambar, rel krom, bumper menyala, ramp rel kawat,
   flipper, slingshot, drop target, Clawd, bola krom, label jawaban melayang. Fisika tetap 2D di 05-fisika.js. */
import * as THREE from 'three';
import { EffectComposer } from './vendor/three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/three/addons/postprocessing/OutputPass.js';
import { MEJA, BUSUR, DINDING, TARGET, LINGKARAN, FLIPPER, PLUNGER, SENSOR, RAMP, TEMBAKAN, WARNA_JAWAB } from './04-meja.js';

const S = 0.01, wx = (x) => (x - 262.5) * S, wz = (y) => (y - 520) * S;
const BRW = MEJA.BR * S;
export const R = { siap: false };

/* ---------- bahan ---------- */
function bahan(env) {
  return {
    krom: new THREE.MeshStandardMaterial({ color: '#d9e1ee', metalness: 1, roughness: 0.18, envMap: env, envMapIntensity: 1.2 }),
    kromGelap: new THREE.MeshStandardMaterial({ color: '#8a94a8', metalness: 1, roughness: 0.3, envMap: env }),
    karet: new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.65 }),
    karetHitam: new THREE.MeshStandardMaterial({ color: '#1b1d24', roughness: 0.7 }),
    plastik: new THREE.MeshStandardMaterial({ color: '#ff7a1a', roughness: 0.35, emissive: '#5a1d00', emissiveIntensity: 0.4 }),
    plastikBiru: new THREE.MeshStandardMaterial({ color: '#2a5bd7', roughness: 0.35, emissive: '#0b1d55', emissiveIntensity: 0.5 }),
    bening: new THREE.MeshStandardMaterial({ color: '#bfe6ff', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.28, envMap: env, depthWrite: false }),
    kabinet: new THREE.MeshStandardMaterial({ color: '#141826', roughness: 0.55, metalness: 0.2 }),
    bola: new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 1, roughness: 0.06, envMap: env, envMapIntensity: 1.6 })
  };
}

/* lingkungan pantulan krom buatan sendiri (tanpa file HDR) */
function buatEnv(r) {
  const sc = new THREE.Scene();
  const kotak = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 20), new THREE.MeshBasicMaterial({ color: '#141a33', side: THREE.BackSide })); sc.add(kotak);
  const panel = (col, x, y, z, w, h, ry = 0, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); sc.add(m); };
  panel('#ffffff', 0, 4.9, 0, 12, 3, 0, Math.PI / 2);
  panel('#ffb36b', -9.9, 1, 0, 6, 3, Math.PI / 2); panel('#6fb3ff', 9.9, 1, 0, 6, 3, -Math.PI / 2);
  panel('#ff7a1a', 0, 0, -9.9, 10, 1.4); panel('#cfe0ff', 0, 2, 9.9, 8, 2.5, Math.PI);
  const pm = new THREE.PMREMGenerator(r); const t = pm.fromScene(sc, 0.03).texture; pm.dispose(); return t;
}

function kanvas(w, h, gambar) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; gambar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/* ---------- gambar playfield (kanvas 2 teksel per piksel meja) ---------- */
function lukisMeja(g, k) {
  g.save(); g.scale(k, k);
  g.fillStyle = '#05070f'; g.fillRect(0, 0, 525, 1080);
  // bentuk area main: busur + persegi
  g.beginPath(); g.moveTo(20, 1080); g.lineTo(20, BUSUR.cy); g.arc(BUSUR.cx, BUSUR.cy, BUSUR.R, Math.PI, 0); g.lineTo(505, 1080); g.closePath(); g.save(); g.clip();
  const gr = g.createRadialGradient(245, 560, 40, 245, 560, 640); gr.addColorStop(0, '#1d3375'); gr.addColorStop(0.55, '#122255'); gr.addColorStop(1, '#0a1233');
  g.fillStyle = gr; g.fillRect(0, 0, 525, 1080);
  // pola simbol matematika samar
  g.save(); g.translate(245, 540); g.rotate(-0.21); g.font = '700 34px Geist, system-ui, sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,0.045)';
  const sim = ['+', '−', '×', '÷', '=']; for (let r = -16; r <= 16; r++) for (let c = -7; c <= 7; c++) g.fillText(sim[(r * 3 + c + 99) % 5], c * 70 + (r % 2) * 35, r * 64);
  g.restore();
  // lorong plunger & orbit lebih gelap
  g.fillStyle = 'rgba(3,6,18,0.55)'; g.fillRect(470, 280, 35, 800); g.fillRect(20, 290, 40, 190); g.fillRect(430, 290, 40, 190);
  // lingkaran halo Clawd
  for (let i = 0; i < 4; i++) { g.strokeStyle = `rgba(255,138,40,${0.28 - i * 0.06})`; g.lineWidth = 3; g.beginPath(); g.arc(245, 385, 44 + i * 22, 0, 6.283); g.stroke(); }
  // sinar dari pusat ke tembakan
  g.globalAlpha = 0.16; TEMBAKAN.forEach((t, i) => { g.strokeStyle = WARNA_JAWAB[i]; g.lineWidth = 2; g.setLineDash([6, 10]); g.beginPath(); g.moveTo(245, 900); g.lineTo(t.x, t.y); g.stroke(); }); g.setLineDash([]); g.globalAlpha = 1;
  // garis inlane/outlane
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 2;
  for (const x of [41, 81, 409, 449]) { g.beginPath(); g.moveTo(x, 735); g.lineTo(x, 850); g.stroke(); }
  // teks kecil tercetak
  g.fillStyle = 'rgba(255,255,255,0.72)'; g.font = '700 11px "IBM Plex Mono", monospace'; g.textAlign = 'center';
  g.save(); g.translate(30, 790); g.rotate(-Math.PI / 2); g.fillText('KICKBACK', 0, 0); g.restore();
  g.fillText('SIMPAN BOLA', 245, 910); g.fillText('KUNCI', 245, 578); g.fillText('BONUS', 245, 690);
  ['2X', '3X', '4X', '5X'].forEach((t, i) => g.fillText(t, 192 + i * 35, 674));
  g.font = '800 15px Geist, system-ui, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.55)';
  ['+', '−', '×'].forEach((t, i) => g.fillText(t, 195 + i * 50, 160));
  // panah petunjuk plunger
  g.fillStyle = 'rgba(255,210,58,0.35)'; for (let i = 0; i < 5; i++) { const y = 900 - i * 60; g.beginPath(); g.moveTo(487.5, y - 16); g.lineTo(478, y); g.lineTo(497, y); g.closePath(); g.fill(); }
  g.restore();
  // tepi area main
  g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 3; g.beginPath(); g.moveTo(20, 1080); g.lineTo(20, BUSUR.cy); g.arc(BUSUR.cx, BUSUR.cy, BUSUR.R, Math.PI, 0); g.lineTo(505, 1080); g.stroke();
  g.restore();
}

/* ---------- pembuat mesh ---------- */
function balokSeg(a, b, tebal, tinggi, m, y0 = 0) {
  const dx = wx(b.x) - wx(a.x), dz = wz(b.y) - wz(a.y), L = Math.hypot(dx, dz);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(L + tebal, tinggi, tebal), m);
  mesh.position.set((wx(a.x) + wx(b.x)) / 2, y0 + tinggi / 2, (wz(a.y) + wz(b.y)) / 2);
  mesh.rotation.y = -Math.atan2(dz, dx); return mesh;
}
function ekstrudPoli(pts, tinggi, m) {
  const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(wx(x), -wz(y))));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: tinggi, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 });
  const mesh = new THREE.Mesh(geo, m); mesh.rotation.x = -Math.PI / 2; return mesh;
}
function tiang(x, y, rad, tinggi, m) { const c = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, tinggi, 20), m); c.position.set(wx(x), tinggi / 2, wz(y)); return c; }

function lampuInsert(bentuk, warna) {
  const m = new THREE.MeshBasicMaterial({ color: warna, transparent: true, opacity: 0.95, depthWrite: false });
  const mesh = new THREE.Mesh(bentuk, m); mesh.rotation.x = -Math.PI / 2; mesh.position.y = 0.004;
  mesh.userData = { terang: new THREE.Color(warna).multiplyScalar(1.7), redup: new THREE.Color(warna).multiplyScalar(0.22), nyala: 0 };
  m.color.copy(mesh.userData.redup); return mesh;
}
function bentukPanah(w, h) { const s = new THREE.Shape(); s.moveTo(0, h / 2); s.lineTo(w / 2, h * 0.05); s.lineTo(w * 0.22, h * 0.05); s.lineTo(w * 0.22, -h / 2); s.lineTo(-w * 0.22, -h / 2); s.lineTo(-w * 0.22, h * 0.05); s.lineTo(-w / 2, h * 0.05); s.closePath(); return new THREE.ShapeGeometry(s); }
const bentukBulat = (r) => new THREE.CircleGeometry(r, 28);

/* label jawaban (sprite) */
function teksturLabel(teks, warna, aktif) {
  return kanvas(256, 160, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = aktif ? warna : 'rgba(30,36,58,0.85)'; g.strokeStyle = '#ffffff'; g.lineWidth = 8;
    const r = 34; g.beginPath(); g.moveTo(r + 6, 6); g.arcTo(w - 6, 6, w - 6, h - 30, r); g.arcTo(w - 6, h - 30, 6, h - 30, r); g.arcTo(6, h - 30, 6, 6, r); g.arcTo(6, 6, w - 6, 6, r); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(w / 2 - 18, h - 31); g.lineTo(w / 2, h - 4); g.lineTo(w / 2 + 18, h - 31); g.closePath(); g.fillStyle = '#ffffff'; g.fill();
    g.fillStyle = aktif ? '#ffffff' : 'rgba(255,255,255,0.5)'; g.font = '900 84px Geist, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(teks, w / 2, (h - 26) / 2 + 4);
  });
}

/* Clawd 3D kecil (badan jingga kotak, mata, kaki) */
function buatClawd() {
  const g = new THREE.Group(), jingga = new THREE.MeshStandardMaterial({ color: '#d8714f', roughness: 0.6 }), tinta = new THREE.MeshStandardMaterial({ color: '#14182b', roughness: 0.5 });
  const badan = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.34), jingga); badan.position.y = 0.3; g.add(badan);
  for (const s of [-1, 1]) {
    const tangan = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.11, 0.12), jingga); tangan.position.set(s * 0.3, 0.3, 0); g.add(tangan); g.userData['tangan' + s] = tangan;
    const mata = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.02), tinta); mata.position.set(s * 0.1, 0.33, 0.172); g.add(mata);
  }
  for (const x of [-0.17, -0.06, 0.06, 0.17]) { const k = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.06), tinta); k.position.set(x, 0.08, 0.06); g.add(k); }
  g.userData.badan = badan; return g;
}

/* ---------- membangun adegan ---------- */
export function siapkanRender(wadah) {
  const ringan = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const r = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, ringan ? 1.6 : 1.75));
  r.setSize(window.innerWidth, window.innerHeight);
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.22; r.outputColorSpace = THREE.SRGBColorSpace;
  wadah.appendChild(r.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#060913');
  const cam = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100);
  const env = buatEnv(r), M = bahan(env);
  scene.add(new THREE.HemisphereLight('#b9c8ff', '#1a1024', 0.85));
  const kunci = new THREE.DirectionalLight('#fff4e6', 1.6); kunci.position.set(-2, 8, 7); scene.add(kunci);
  const isi = new THREE.DirectionalLight('#7fa8ff', 0.5); isi.position.set(4, 5, -6); scene.add(isi);

  // playfield
  const tex = kanvas(1050, 2160, (g) => lukisMeja(g, 2));
  const lantai = new THREE.Mesh(new THREE.PlaneGeometry(5.25, 10.8), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.05 }));
  lantai.rotation.x = -Math.PI / 2; lantai.position.set(wx(262.5), 0, wz(540)); scene.add(lantai);

  // kabinet & papan belakang
  const kab = new THREE.Group(); scene.add(kab);
  const sisi = (x0, x1) => { const m = new THREE.Mesh(new THREE.BoxGeometry(wx(x1) - wx(x0), 0.5, 11.4), M.kabinet); m.position.set((wx(x0) + wx(x1)) / 2, 0.2, wz(560)); kab.add(m); const tr = new THREE.Mesh(new THREE.BoxGeometry(wx(x1) - wx(x0) + 0.02, 0.03, 11.4), M.kromGelap); tr.position.set(m.position.x, 0.46, m.position.z); kab.add(tr); };
  sisi(-30, 16); sisi(509, 555);
  const belakang = new THREE.Mesh(new THREE.BoxGeometry(5.85, 0.5, 0.4), M.kabinet); belakang.position.set(wx(262.5), 0.2, wz(-24)); kab.add(belakang);
  const papan = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.2), new THREE.MeshBasicMaterial({ map: kanvas(1120, 440, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a1240'); gr.addColorStop(1, '#0a0a1c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,138,40,0.5)'; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.12})`; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 0, 6.3); g.fill(); }
    g.font = '900 120px Geist, system-ui, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ff8a1f'; g.fillText('PINBALL', w / 2, 200);
    g.fillStyle = '#ffffff'; g.font = '900 96px Geist, system-ui, sans-serif'; g.fillText('CLAWD', w / 2, 320);
    g.font = '600 34px "IBM Plex Mono", monospace'; g.fillStyle = '#8fb4ff'; g.fillText('+   −   ×   ÷', w / 2, 390);
  }) }));
  papan.position.set(wx(262.5), 1.3, wz(-40)); papan.rotation.x = -0.12; kab.add(papan);

  // dinding & rel
  const grup = new THREE.Group(); scene.add(grup);
  for (const s of DINDING) {
    if (s.bagian === 'luar') { grup.add(balokSeg(s.a, s.b, 0.06, 0.3, M.krom)); continue; }
    if (s.bagian === 'busur') { grup.add(balokSeg(s.a, s.b, 0.06, 0.3, M.krom)); continue; }
    if (s.bagian === 'plunger' || s.bagian === 'inlane') { grup.add(balokSeg(s.a, s.b, 0.05, 0.24, M.krom)); continue; }
    if (s.jenis === 'gerbang') { const m = balokSeg(s.a, s.b, 0.02, 0.1, M.kromGelap, 0.12); grup.add(m); continue; }
    if (s.bagian === 'ramp') { grup.add(balokSeg(s.a, s.b, 0.03, 0.26, M.bening)); grup.add(balokSeg(s.a, s.b, 0.035, 0.025, M.krom, 0.26)); continue; }
    if (s.bagian === 'blok') continue;
    if (s.bagian === 'sling') continue;
    if (s.jenis === 'karet') {
      grup.add(balokSeg(s.a, s.b, s.r * 2 * S, 0.12, M.karet, 0.02));
      for (const p of [s.a, s.b]) { grup.add(tiang(p.x, p.y, 0.035, 0.3, M.krom)); const tutup = tiang(p.x, p.y, 0.05, 0.03, M.plastikBiru); tutup.position.y = 0.3; grup.add(tutup); }
      continue;
    }
    if (s.bagian === 'sayap') { grup.add(balokSeg(s.a, s.b, 0.08, 0.2, M.plastikBiru)); continue; }
    grup.add(balokSeg(s.a, s.b, 0.05, 0.24, M.krom));
  }
  // blok tengah (plastik jingga) + atap Kotak Clawd
  const blokKiri = ekstrudPoli([[178, 534], [148, 444], [215, 440], [205, 530]], 0.24, M.plastik);
  const blokKanan = ekstrudPoli([[312, 534], [285, 530], [275, 440], [342, 444]], 0.24, M.plastik);
  scene.add(blokKiri, blokKanan);
  const lubang = new THREE.Mesh(new THREE.CircleGeometry(0.16, 32), new THREE.MeshBasicMaterial({ color: '#000000' })); lubang.rotation.x = -Math.PI / 2; lubang.position.set(wx(245), 0.003, wz(462)); scene.add(lubang);
  const atapKotak = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.34), M.bening); atapKotak.position.set(wx(245), 0.32, wz(452)); scene.add(atapKotak);
  // slingshot
  const slingMesh = [];
  for (const [i, pts] of [[0, [[100, 735], [100, 820], [145, 852]]], [1, [[390, 735], [345, 852], [390, 820]]]]) {
    const badan = ekstrudPoli(pts, 0.2, M.plastikBiru); scene.add(badan);
    const tepi = DINDING.find((s) => s.jenis === 'sling' && s.idx === i);
    const karet = balokSeg(tepi.a, tepi.b, 0.1, 0.12, new THREE.MeshStandardMaterial({ color: '#f4f1ea', emissive: '#ffb347', emissiveIntensity: 0 }), 0.03); scene.add(karet);
    for (const [x, y] of pts) scene.add(tiang(x, y, 0.035, 0.3, M.krom));
    slingMesh.push(karet);
  }
  // drop target
  const warnaTarget = ['#ffc531', '#ff7a1a', '#ffc531'];
  const targetMesh = TARGET.map((s, i) => { const m = balokSeg(s.a, s.b, 0.06, 0.3, new THREE.MeshStandardMaterial({ color: warnaTarget[i], roughness: 0.4, emissive: warnaTarget[i], emissiveIntensity: 0.15 })); scene.add(m); m.userData.y0 = m.position.y; return m; });
  // bumper
  const bumperMesh = LINGKARAN.filter((c) => c.jenis === 'bumper').map((c, i) => {
    const g = new THREE.Group(); g.position.set(wx(c.x), 0, wz(c.y));
    const warna = ['#ff4d6d', '#2f8cff', '#ffc531'][i];
    const kaki = new THREE.Mesh(new THREE.CylinderGeometry(c.r * S * 0.9, c.r * S, 0.14, 32), M.karetHitam); kaki.position.y = 0.07; g.add(kaki);
    const rok = new THREE.Mesh(new THREE.CylinderGeometry(c.r * S * 1.12, c.r * S * 1.12, 0.03, 32), M.krom); rok.position.y = 0.16; g.add(rok);
    const tubuh = new THREE.Mesh(new THREE.CylinderGeometry(c.r * S * 0.8, c.r * S * 0.8, 0.14, 32), new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, roughness: 0.1, emissive: warna, emissiveIntensity: 0.4 })); tubuh.position.y = 0.24; g.add(tubuh);
    const tutup = new THREE.Mesh(new THREE.CylinderGeometry(c.r * S * 1.02, c.r * S * 1.02, 0.06, 32), new THREE.MeshStandardMaterial({ color: warna, roughness: 0.3, emissive: warna, emissiveIntensity: 0.35 })); tutup.position.y = 0.34; g.add(tutup);
    const lbl = new THREE.Mesh(new THREE.CircleGeometry(c.r * S * 0.7, 32), new THREE.MeshBasicMaterial({ map: kanvas(128, 128, (gg) => { gg.fillStyle = '#ffffff'; gg.beginPath(); gg.arc(64, 64, 60, 0, 6.3); gg.fill(); gg.fillStyle = warna; gg.font = '900 80px Geist, system-ui, sans-serif'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText(['+', '×', '÷'][i], 64, 70); }) }));
    lbl.rotation.x = -Math.PI / 2; lbl.position.y = 0.372; g.add(lbl);
    const lampu = new THREE.PointLight(warna, 0, 1.4, 2); lampu.position.y = 0.5; g.add(lampu);
    g.userData = { tutup, tubuh, lampu }; scene.add(g); return g;
  });
  // Clawd
  const clawd = buatClawd(); clawd.position.set(wx(245), 0, wz(385)); scene.add(clawd);
  const alasClawd = tiang(245, 385, 0.22, 0.04, M.krom); scene.add(alasClawd);
  // flipper
  const flipMesh = FLIPPER.map((f) => {
    const g = new THREE.Group(); g.position.set(wx(f.px), 0, wz(f.py));
    const sh = new THREE.Shape(); const L = f.L * S, r1 = f.r1 * S, r2 = f.r2 * S;
    const a = Math.asin((r1 - r2) / L);
    sh.absarc(0, 0, r1, Math.PI / 2 + a, 3 * Math.PI / 2 - a, false); sh.absarc(L, 0, r2, -Math.PI / 2 - a, Math.PI / 2 + a, false); sh.closePath();
    const badan = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.13, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 2 }), new THREE.MeshStandardMaterial({ color: '#f7f4ee', roughness: 0.35 }));
    badan.rotation.x = -Math.PI / 2; badan.position.y = 0.04; g.add(badan);
    const sh2 = new THREE.Shape(); sh2.absarc(0, 0, r1 + 0.012, Math.PI / 2 + a, 3 * Math.PI / 2 - a, false); sh2.absarc(L, 0, r2 + 0.012, -Math.PI / 2 - a, Math.PI / 2 + a, false); sh2.closePath();
    const karet = new THREE.Mesh(new THREE.ExtrudeGeometry(sh2, { depth: 0.07, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: '#e63b46', roughness: 0.6 }));
    karet.rotation.x = -Math.PI / 2; karet.position.y = 0.06; g.add(karet);
    const as = tiang(0, 0, 0.04, 0.2, M.krom); as.position.set(0, 0.1, 0); g.add(as);
    scene.add(g); return g;
  });
  // ramp: rel kawat + lantai bening
  const relMesh = RAMP.map((pts) => {
    const g = new THREE.Group();
    const kurva = new THREE.CatmullRomCurve3(pts.map(([x, y, h]) => new THREE.Vector3(wx(x), h, wz(y))));
    const n = 80, kiri = [], kanan = [], posL = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const p = kurva.getPoint(i / n), t = kurva.getTangent(i / n), lat = new THREE.Vector3(-t.z, 0, t.x).normalize();
      kiri.push(p.clone().addScaledVector(lat, 0.16).add(new THREE.Vector3(0, 0.12, 0)));
      kanan.push(p.clone().addScaledVector(lat, -0.16).add(new THREE.Vector3(0, 0.12, 0)));
      const a = p.clone().addScaledVector(lat, 0.17), b = p.clone().addScaledVector(lat, -0.17); posL.push(a.x, a.y, a.z, b.x, b.y, b.z);
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
      if (i % 16 === 8 && p.y > 0.12) { const tg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, p.y + 0.12, 8), M.kromGelap); tg.position.set(p.x, (p.y + 0.12) / 2, p.z); g.add(tg); }
    }
    for (const garis of [kiri, kanan]) g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(garis), 100, 0.011, 8), M.krom));
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(posL, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const lt = new THREE.Mesh(geo, M.bening.clone()); lt.material.side = THREE.DoubleSide; lt.material.opacity = 0.09; lt.material.color.set('#7cc4ff'); g.add(lt);
    scene.add(g); return g;
  });
  // spinner
  const sp = SENSOR.spinner, spinner = new THREE.Group(); spinner.position.set(wx((sp.x1 + sp.x2) / 2), 0.2, wz(sp.y));
  const plat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.01), M.krom); plat.position.y = -0.06; spinner.add(plat); scene.add(spinner);
  for (const x of [sp.x1 + 3, sp.x2 - 3]) scene.add(tiang(x, sp.y, 0.012, 0.22, M.kromGelap));
  // plunger
  const plunger = new THREE.Group(); scene.add(plunger);
  const batang = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 12), M.krom); batang.rotation.x = Math.PI / 2; batang.position.set(0, 0.12, 0.35); plunger.add(batang);
  const ujung = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 20), M.karetHitam); ujung.rotation.x = Math.PI / 2; ujung.position.set(0, 0.12, 0.02); plunger.add(ujung);
  const pegas = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 12, 1, true), new THREE.MeshStandardMaterial({ color: '#c0c8d8', metalness: 1, roughness: 0.3, wireframe: true })); pegas.rotation.x = Math.PI / 2; pegas.position.set(0, 0.12, 0.25); plunger.add(pegas);
  plunger.position.set(wx(PLUNGER.x), 0, wz(PLUNGER.y0));
  // apron
  const apron = new THREE.Mesh(new THREE.BoxGeometry(wx(470) - wx(20), 0.1, 0.62), [M.kabinet, M.kabinet, new THREE.MeshStandardMaterial({ map: kanvas(900, 124, (g, w, h) => {
    g.fillStyle = '#10142a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff8a1f'; g.fillRect(0, 0, w, 6);
    g.font = '900 54px Geist, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.fillText('PINBALL CLAWD', w / 2, 52);
    g.font = '600 24px "IBM Plex Mono", monospace'; g.fillStyle = '#8fb4ff'; g.fillText('MEJA ANGKA · 3 BOLA', w / 2, 98);
  }) }), M.kabinet, M.kabinet, M.kabinet]);
  apron.position.set((wx(20) + wx(470)) / 2, 0.05, wz(1040)); scene.add(apron);

  // lampu insert
  const ins = {};
  ins.tembak = TEMBAKAN.map((t, i) => {
    const sudut = i === 1 ? Math.atan2(-90, -30) : i === 2 ? Math.atan2(-90, 30) : -Math.PI / 2;
    const m = lampuInsert(bentukPanah(0.32, 0.46), WARNA_JAWAB[i]); m.position.set(wx(t.x), 0.004, wz(t.y + 10)); m.rotation.set(-Math.PI / 2, 0, -(sudut + Math.PI / 2)); scene.add(m); return m;
  });
  ins.lajur = SENSOR.lajurAtas.map((l) => { const m = lampuInsert(bentukBulat(0.1), '#ffd23a'); m.position.set(wx((l.x1 + l.x2) / 2), 0.004, wz(120)); scene.add(m); return m; });
  ins.kick = lampuInsert(bentukBulat(0.1), '#29c06f'); ins.kick.position.set(wx(41), 0.004, wz(830)); scene.add(ins.kick);
  ins.simpan = lampuInsert(bentukBulat(0.14), '#ff4d6d'); ins.simpan.position.set(wx(245), 0.004, wz(880)); scene.add(ins.simpan);
  ins.kunci = [230, 260].map((x) => { const m = lampuInsert(bentukBulat(0.09), '#ffc531'); m.position.set(wx(x), 0.004, wz(556)); scene.add(m); return m; });
  ins.bonus = [0, 1, 2, 3].map((i) => { const m = lampuInsert(bentukBulat(0.08), '#8fb4ff'); m.position.set(wx(192 + i * 35), 0.004, wz(652)); scene.add(m); return m; });
  ins.inlane = [81, 409].map((x) => { const m = lampuInsert(bentukBulat(0.07), '#ffffff'); m.position.set(wx(x), 0.004, wz(720)); scene.add(m); return m; });

  // label jawaban melayang
  const label = TEMBAKAN.map((t, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: teksturLabel('?', WARNA_JAWAB[i], false), depthTest: false, transparent: true }));
    s.scale.set(0.78, 0.49, 1); s.position.set(wx(t.label.x), 0.62, wz(t.label.y)); s.renderOrder = 10; scene.add(s); s.userData = { i, teks: '?' }; return s;
  });

  // bola
  const bolaGeo = new THREE.SphereGeometry(BRW, 32, 20);
  const bayangGeo = new THREE.CircleGeometry(BRW * 1.15, 24), bayangMat = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.45, depthWrite: false });
  const bolaMesh = [], bayang = [];
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(bolaGeo, M.bola); b.visible = false; scene.add(b); bolaMesh.push(b); const sh = new THREE.Mesh(bayangGeo, bayangMat); sh.rotation.x = -Math.PI / 2; sh.visible = false; scene.add(sh); bayang.push(sh); }

  // pasca-proses cahaya (desktop)
  let komposer = null;
  if (!ringan) {
    komposer = new EffectComposer(r); komposer.addPass(new RenderPass(scene, cam));
    komposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.45, 0.8));
    komposer.addPass(new OutputPass());
  }

  Object.assign(R, { r, scene, cam, ringan, komposer, flipMesh, bumperMesh, slingMesh, targetMesh, clawd, spinner, plunger, ins, label, bolaMesh, bayang, relMesh, siap: true, goyang: 0, ruangAtas: 0, kilauLabel: [0, 0, 0, 0] });
  const ubah = () => { r.setSize(window.innerWidth, window.innerHeight); if (komposer) komposer.setSize(window.innerWidth, window.innerHeight); pasCamera(); };
  window.addEventListener('resize', ubah); pasCamera();
  return R;
}

/* kamera: cari jarak terdekat supaya seluruh meja muat, menyisakan ruang atas untuk layar DMD */
export function pasCamera(ruangAtas = R.ruangAtas, ruangBawah = R.ruangBawah || 0) {
  const { cam } = R; if (!cam) return;
  R.ruangAtas = ruangAtas || 0; R.ruangBawah = ruangBawah || 0; ruangAtas = R.ruangAtas; ruangBawah = R.ruangBawah;
  const W = window.innerWidth, H = window.innerHeight; cam.aspect = W / H; cam.clearViewOffset();
  const potret = W / H < 0.9; cam.fov = potret ? 40 : 34; cam.updateProjectionMatrix();
  const pitch = potret ? 1.0 : 0.92; // sudut pandang dari atas (radian)
  const target = new THREE.Vector3(wx(262.5), 0, wz(560));
  const sudut = [[0, -10], [525, -10], [0, 1075], [525, 1075], [262, -40]].map(([x, y]) => new THREE.Vector3(wx(x), y < 0 ? 0.5 : 0, wz(y)));
  const yAtas = 1 - 2 * (ruangAtas + 6) / H, yBawah = -1 + 2 * (ruangBawah + 6) / H;
  let lo = 4, hi = 40, geserY = 0;
  for (let it = 0; it < 30; it++) {
    const d = (lo + hi) / 2;
    cam.position.set(target.x, target.y + Math.sin(pitch) * d, target.z + Math.cos(pitch) * d); cam.lookAt(target); cam.updateMatrixWorld();
    let mx = 0, minY = 9, maxY = -9;
    for (const p of sudut) { const v = p.clone().project(cam); mx = Math.max(mx, Math.abs(v.x)); minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y); }
    const tinggi = maxY - minY, ok = mx < 0.97 && tinggi < (yAtas - yBawah);
    geserY = (yAtas + yBawah) / 2 - (maxY + minY) / 2;
    if (ok) hi = d; else lo = d;
  }
  const d = hi; cam.position.set(target.x, target.y + Math.sin(pitch) * d, target.z + Math.cos(pitch) * d); cam.lookAt(target); cam.updateMatrixWorld();
  { let minY = 9, maxY = -9; for (const p of sudut) { const v = p.clone().project(cam); minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y); } geserY = (yAtas + yBawah) / 2 - (maxY + minY) / 2; }
  // geser pandangan supaya meja di tengah ruang yang tersedia
  if (Number.isFinite(geserY)) cam.setViewOffset(W, H, 0, geserY * H / 2, W, H);
  cam.updateProjectionMatrix(); R.dasarKam = cam.position.clone();
}

/* ---------- pembaruan per bingkai ---------- */
const q = new THREE.Quaternion(), sumbu = new THREE.Vector3();
export function perbarui(game, dt, waktu) {
  if (!R.siap) return;
  const F = game.fis;
  F.flip.forEach((f, i) => { R.flipMesh[i].rotation.y = -f.a; });
  F.bumper.forEach((v, i) => { const u = R.bumperMesh[i].userData; u.tutup.material.emissiveIntensity = 0.35 + v * 2.2; u.tubuh.material.emissiveIntensity = 0.4 + v * 2; u.lampu.intensity = v * 3; u.tutup.position.y = 0.34 - v * 0.05; });
  F.sling.forEach((v, i) => { R.slingMesh[i].material.emissiveIntensity = v * 2.5; R.slingMesh[i].scale.z = 1 + v * 0.4; });
  F.target.forEach((up, i) => { const m = R.targetMesh[i]; const tuju = up ? m.userData.y0 : -0.28; m.position.y += (tuju - m.position.y) * Math.min(1, dt * 18); });
  // Clawd: lompat saat kena / jawaban benar
  const c = R.clawd, lompat = Math.max(F.clawd, R.clawdSenang || 0); R.clawdSenang = Math.max(0, (R.clawdSenang || 0) - dt * 0.8);
  c.position.y = Math.abs(Math.sin(waktu * 14)) * 0.12 * lompat; c.rotation.y = Math.sin(waktu * 1.3) * 0.25 + Math.sin(waktu * 20) * 0.2 * lompat;
  c.userData['tangan-1'].position.y = 0.3 + Math.sin(waktu * 6) * 0.03 + lompat * 0.12; c.userData['tangan1'].position.y = 0.3 + Math.cos(waktu * 6) * 0.03 + lompat * 0.12;
  R.spinner.rotation.x = F.spinner.sudut;
  R.plunger.position.z = wz(PLUNGER.y0 + F.tarik * PLUNGER.tarik);
  // lampu insert
  const nyala = (m, on, kedip = false) => { const u = m.userData; const tuju = on ? (kedip ? (Math.sin(waktu * 10) > 0 ? 1 : 0.15) : 1) : 0; u.nyala += (tuju - u.nyala) * Math.min(1, dt * 14); m.material.color.copy(u.redup).lerp(u.terang, u.nyala); };
  const soal = game.soal;
  R.ins.tembak.forEach((m, i) => nyala(m, !!soal || game.kilauTembak[i] > 0, game.kilauTembak[i] > 0));
  R.ins.lajur.forEach((m, i) => nyala(m, game.lajur[i] || (i === game.skillLajur && game.t < game.skillSampai), i === game.skillLajur && game.t < game.skillSampai));
  nyala(R.ins.kick, game.kickback); nyala(R.ins.simpan, game.simpan > 0, game.simpan > 0 && game.simpan < 3);
  R.ins.kunci.forEach((m, i) => nyala(m, game.kunci > i || (game.kotakBuka && game.kunci === i), game.kotakBuka && game.kunci === i));
  R.ins.bonus.forEach((m, i) => nyala(m, game.bonusX >= i + 2));
  R.ins.inlane.forEach((m, i) => nyala(m, game.t - game.tembakTerakhir.t < 3.5, true));
  // label jawaban
  R.label.forEach((s, i) => {
    const teks = soal ? String(soal.pilihan[i]) : '?', aktif = !!soal;
    const kunciT = teks + (aktif ? 1 : 0);
    if (s.userData.teks !== kunciT) { s.material.map.dispose(); s.material.map = teksturLabel(teks, WARNA_JAWAB[i], aktif); s.material.needsUpdate = true; s.userData.teks = kunciT; }
    const k = R.kilauLabel[i]; R.kilauLabel[i] = Math.max(0, k - dt * 1.2);
    s.position.y = 0.62 + Math.sin(waktu * 2.4 + i) * 0.03 + k * 0.25; const sk = 1 + k * 0.4; s.scale.set(0.78 * sk, 0.49 * sk, 1);
  });
  // bola
  const bola = F.bola;
  for (let i = 0; i < R.bolaMesh.length; i++) {
    const m = R.bolaMesh[i], sh = R.bayang[i], b = bola[i];
    if (!b) { m.visible = false; sh.visible = false; continue; }
    const x = wx(b.x), z = wz(b.y), y = BRW + (b.rel ? b.z + 0.12 : 0) - (b.ditahan > 0 && F.kotakTahan === b ? BRW * 1.2 : 0);
    if (m.visible && m.userData.id === b.id) {
      const dx = x - m.position.x, dz = z - m.position.z, d = Math.hypot(dx, dz);
      if (d > 1e-5) { sumbu.set(dz, 0, -dx).normalize(); q.setFromAxisAngle(sumbu, d / BRW); m.quaternion.premultiply(q); }
    }
    m.position.set(x, y, z); m.visible = true; m.userData.id = b.id;
    sh.visible = true; sh.position.set(x + 0.03, (b.rel ? b.z + 0.125 : 0.003), z + 0.03);
  }
  // goyang kamera
  if (R.goyang > 0) { R.goyang = Math.max(0, R.goyang - dt * 3); R.cam.position.x = R.dasarKam.x + Math.sin(waktu * 60) * 0.05 * R.goyang; }
  else if (R.dasarKam) R.cam.position.x = R.dasarKam.x;
  if (R.komposer) R.komposer.render(); else R.r.render(R.scene, R.cam);
}
export function efek(nama, d) {
  if (nama === 'benar') { R.clawdSenang = 1.6; if (d) R.kilauLabel[d.k] = 1; }
  if (nama === 'goyang' || nama === 'tilt') R.goyang = nama === 'tilt' ? 1.5 : 0.6;
}
