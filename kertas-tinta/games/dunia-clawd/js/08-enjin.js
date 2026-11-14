/* Dunia Clawd: enjin. Fizik pemain memakai nilai klasik: laju jalan 16, kuasa lompat 50, graviti 196.2, tinggi 5 unit.
   Dunia = senarai kotak AABB. Blok statik disatukan; blok bergerak mesh sendiri. */
import * as THREE from 'three';
import { M, Batch, geoKotak, bahanStud, siapkanBahan, buangObjek, papanTeks, tukarTeks } from './06-bahan.js';
import { buatAvatar, animasi, pecahkan, kemasPecah, pulihkan, tagNama, buatPet } from './07-avatar.js';
import { S, simpan, beriLencana, isyarat } from './05-simpan.js';
import { bunyi, muzik } from './04-bunyi.js';

export const FIZIK = { jalan: 16, lompat: 50, graviti: 196.2, tinggi: 5, separuh: 0.9, jatuhMaks: 170 };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export const E = {
  renderer: null, scene: null, camera: null, dunia: null, P: null, tahan: 0, masa: 0, fps: 60, ringan: false, bayang: true,
  inp: { kiri: 0, kanan: 0, depan: 0, belakang: 0, lompat: false, jx: 0, jy: 0 },
  kam: { yaw: 0, pitch: 0.34, dist: 22, jarak: 22 }, ui: {}, aktif: false
};

/* ---------- renderer ---------- */
const langitU = { cA: { value: new THREE.Color('#5b9ee0') }, cB: { value: new THREE.Color('#d9eefc') } };
let matahari, hemi, kubah;
export function mulaEnjin(induk) {
  E.ringan = /[?&]ringan=1/.test(location.search) || S.grafik === 'rendah';
  const r = new THREE.WebGLRenderer({ antialias: !E.ringan, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, E.ringan ? 1 : 1.6));
  r.setSize(innerWidth, innerHeight); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  E.bayang = !E.ringan; r.shadowMap.enabled = E.bayang; r.shadowMap.type = THREE.PCFSoftShadowMap;
  induk.appendChild(r.domElement); r.domElement.setAttribute('aria-hidden', 'true');
  E.renderer = r; siapkanBahan();
  E.scene = new THREE.Scene(); E.scene.fog = new THREE.Fog(0xd9eefc, 170, 620);
  E.camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.3, 1600);
  hemi = new THREE.HemisphereLight(0xeaf5ff, 0x8a8f76, 1.5); E.scene.add(hemi);
  matahari = new THREE.DirectionalLight(0xfff2dc, 2.5); matahari.castShadow = E.bayang;
  matahari.shadow.mapSize.set(2048, 2048); const c = matahari.shadow.camera; c.left = c.bottom = -80; c.right = c.top = 80; c.near = 1; c.far = 340; matahari.shadow.bias = -0.0006; matahari.shadow.normalBias = 0.04;
  E.scene.add(matahari); E.scene.add(matahari.target);
  kubah = new THREE.Mesh(new THREE.SphereGeometry(1100, 24, 12), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: langitU,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 cA; uniform vec3 cB; varying vec3 vP; void main(){ float k = smoothstep(-0.05, 0.55, vP.y); gl_FragColor = vec4(mix(cB, cA, k), 1.0);\n#include <colorspace_fragment>\n }'
  }));
  kubah.renderOrder = -10; E.scene.add(kubah);
  addEventListener('resize', ukurSemula); pasangInput(r.domElement);
  requestAnimationFrame(gelung);
}
function ukurSemula() { E.renderer.setSize(innerWidth, innerHeight); E.camera.aspect = innerWidth / innerHeight; E.camera.updateProjectionMatrix(); }
export function aturLangit(a, b, kabus) { langitU.cA.value.set(a); langitU.cB.value.set(b); E.scene.fog.color.set(b); if (kabus) { E.scene.fog.near = kabus[0]; E.scene.fog.far = kabus[1]; } }
export function aturCahaya(hK, sK) { hemi.intensity = hK; matahari.intensity = sK; }

/* ---------- dunia ---------- */
export class Dunia {
  constructor(mod, pratonton = false) {
    this.mod = mod; this.pratonton = pratonton; this.grup = new THREE.Group(); E.scene.add(this.grup);
    this.solid = []; this.gerak = []; this.koin = []; this.bots = []; this.ubah = [];
    this.b = { stud: new Batch(), neon: new Batch(), kaca: new Batch() }; this.spawn = { x: 0, y: 1, z: 0, yaw: 0 }; this.t = 0; this.lantaiMati = -60;
  }
  /* y = aras atas blok. Pilihan: warna, warnaAtas, neon, kaca, hiasan, tembus, kamera, bunuh, lompat, konveyor, truss, dinamik, gerak, onSentuh, lutsinar */
  kotak(o) {
    const { x = 0, y = 0, z = 0, w = 4, h = 1, d = 4, warna = '#9aa5b8' } = o;
    const b = Object.assign({ aktif: true, dx: 0, dy: 0, dz: 0, warna }, o, { tembus: o.tembus || o.hiasan, x, y, z, w, h, d, min: V(x - w / 2, y - h, z - d / 2), max: V(x + w / 2, y, z + d / 2) });
    if (o.dinamik || o.gerak) {
      const geo = geoKotak(w, h, d, warna, o.warnaAtas);
      const m = new THREE.Mesh(geo, o.neon ? M.neon : o.kaca ? M.kaca : bahanStud(o.lutsinar)); m.position.set(x, y - h / 2, z);
      m.castShadow = !o.neon && !o.kaca; m.receiveShadow = !o.neon; this.grup.add(m); b.mesh = m;
      if (o.gerak) this.gerak.push(b);
    } else {
      (o.neon ? this.b.neon : o.kaca ? this.b.kaca : this.b.stud).tambah(x - w / 2, y - h, z - d / 2, x + w / 2, y, z + d / 2, warna, o.warnaAtas);
    }
    if (!o.hiasan) this.solid.push(b);
    return b;
  }
  setPos(b, x, y, z) {
    b.dx = x - b.x; b.dy = y - b.y; b.dz = z - b.z; b._f = this.bingkai; b.x = x; b.y = y; b.z = z;
    b.min.set(x - b.w / 2, y - b.h, z - b.d / 2); b.max.set(x + b.w / 2, y, z + b.d / 2);
    if (b.mesh) b.mesh.position.set(x, y - b.h / 2, z);
  }
  setAktif(b, v) { b.aktif = v; if (b.mesh) b.mesh.visible = v; }
  tambah(o, x, y, z) { if (x !== undefined) o.position.set(x, y, z); this.grup.add(o); return o; }
  papan(baris, x, y, z, lebar, o) { const p = papanTeks(baris, lebar, o); p.position.set(x, y, z); this.grup.add(p); return p; }
  /* syiling CBux: berputar, ambil bila disentuh */
  syiling(x, y, z, nilai = 1, onAmbil) {
    if (!Dunia.gSy) { Dunia.gSy = new THREE.CylinderGeometry(1, 1, 0.26, 18); Dunia.gSy.rotateX(Math.PI / 2); Dunia.gSy.userData.kongsi = true; Dunia.mSy = new THREE.MeshStandardMaterial({ color: '#e8bd5a', emissive: '#7a5a14', emissiveIntensity: 0.6, roughness: 0.35, metalness: 0.5 }); Dunia.mSy.userData.kongsi = true; }
    const m = new THREE.Mesh(Dunia.gSy, Dunia.mSy); m.position.set(x, y, z); m.castShadow = true; this.grup.add(m);
    const k = { m, x, y, z, nilai, onAmbil, ada: true }; this.koin.push(k); return k;
  }
  pokok(x, y, z, s = 1) {
    const t = 5 * s; this.kotak({ x, y: y + t, z, w: 1.6 * s, h: t, d: 1.6 * s, warna: '#6d4a2a' });
    this.kotak({ x, y: y + t + 4 * s, z, w: 7 * s, h: 4 * s, d: 7 * s, warna: '#4f9a52' });
    this.kotak({ x, y: y + t + 7 * s, z, w: 4.4 * s, h: 3 * s, d: 4.4 * s, warna: '#62b264' });
  }
  awan(n, sebaran = 460, yMin = 90, yMax = 190) {
    for (let i = 0; i < n; i++) {
      const x = (Math.random() - 0.5) * sebaran * 2, z = (Math.random() - 0.5) * sebaran * 2, y = yMin + Math.random() * (yMax - yMin), s = 8 + Math.random() * 14;
      for (let j = 0; j < 4; j++) this.kotak({ x: x + (j - 1.5) * s * 0.8, y: y + (j % 2) * s * 0.3, z: z + ((j * 7) % 3 - 1) * s * 0.35, w: s * 1.5, h: s * 0.55, d: s, warna: '#ffffff', neon: true, hiasan: true });
    }
  }
  selesai() {
    const { stud, neon, kaca } = this.b;
    const pasang = (bt, mat, bayang) => { if (bt.kosong) return; const m = new THREE.Mesh(bt.geometri(), mat); m.castShadow = bayang; m.receiveShadow = bayang; m.frustumCulled = false; this.grup.add(m); return m; };
    pasang(stud, [M.sisi, M.atas], true); pasang(neon, [M.neon, M.neon], false); pasang(kaca, [M.kaca, M.kaca], false);
    this.b = { stud: new Batch(), neon: new Batch(), kaca: new Batch() };
  }
  kemas(dt) {
    this.t += dt; this.bingkai = (this.bingkai || 0) + 1;
    for (const b of this.gerak) { if (!b.aktif && !b.gerakSentiasa) { b.dx = b.dy = b.dz = 0; continue; } const [x, y, z] = b.gerak(this.t, b); this.setPos(b, x, y, z); }
    for (const k of this.koin) if (k.ada) { k.m.rotation.y += dt * 3; k.m.position.y = k.y + Math.sin(this.t * 2 + k.x) * 0.25; }
    for (const b of this.bots) b.kemas(dt);
    for (const f of this.ubah) f(dt);
  }
  buang() { E.scene.remove(this.grup); buangObjek(this.grup); }
}

/* ---------- pemain ---------- */
export function buatPemain(cfg) {
  const av = buatAvatar(cfg);
  return { av, pos: V(0, 1, 0), vel: V(0, 0, 0), yaw: 0, diTanah: false, tanah: null, mati: false, tMati: 0, kebal: 0, laju: FIZIK.jalan, kuasaLompat: FIZIK.lompat, panjat: false, sorak: 0, tpk: 0, lonjak: 0, hp: 100, terbang: false, sekat: false, tCedera: 0 };
}
function bertindih(p, s, e = 0) {
  const h = FIZIK.separuh + e;
  return p.x + h > s.min.x && p.x - h < s.max.x && p.z + h > s.min.z && p.z - h < s.max.z && p.y + FIZIK.tinggi + e > s.min.y && p.y - e < s.max.y;
}
function geser(P, paksi, delta, D, adaTanah) {
  const p = P.pos; p[paksi] += delta;
  const senarai = D.vox ? D.solid.concat(D.vox.sekitar(p)) : D.solid;
  for (const s of senarai) {
    if (!s.aktif || s.tembus || !bertindih(p, s)) continue;
    if (paksi === 'y') {
      if (delta <= 0) { p.y = s.max.y; P.diTanah = true; P.tanah = s; if (P.vel.y < -70 && P.tpk <= 0) { bunyi('tapak', 120); P.tpk = 0.2; } }
      else p.y = s.min.y - FIZIK.tinggi;
      P.vel.y = 0;
    } else {
      // naik anak tangga pendek
      const beza = s.max.y - p.y;
      if (beza > 0 && beza <= 1.15 && (adaTanah || P.vel.y <= 0)) {
        const lama = p.y; p.y = s.max.y + 0.001;
        if (!senarai.some((q) => q !== s && q.aktif && !q.tembus && bertindih(p, q))) { continue; }
        p.y = lama;
      }
      if (s.vox) P.sekat = true;
      p[paksi] = delta > 0 ? s.min[paksi] - FIZIK.separuh - 0.001 : s.max[paksi] + FIZIK.separuh + 0.001;
    }
  }
}
function langkahPemain(dt) {
  const P = E.P, D = E.dunia, i = E.inp, p = P.pos;
  // arah relatif kamera
  let mx = i.kanan - i.kiri + i.jx, mz = i.depan - i.belakang + i.jy;
  const len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
  const sy = Math.sin(E.kam.yaw), cy = Math.cos(E.kam.yaw);
  const wx = -sy * mz + cy * mx, wz = -cy * mz - sy * mx;
  const adaInput = Math.hypot(mx, mz) > 0.05;
  const kl = Math.min(1, dt * 26); P.vel.x += (wx * P.laju - P.vel.x) * kl; P.vel.z += (wz * P.laju - P.vel.z) * kl;
  if (adaInput) { const sasar = Math.atan2(-wx, -wz); let b = sasar - P.yaw; while (b > Math.PI) b -= Math.PI * 2; while (b < -Math.PI) b += Math.PI * 2; P.yaw += b * Math.min(1, dt * 14); }

  // bawa platform & tolakan platform bergerak
  if (P.tanah && P.diTanah) { if (P.tanah._f === D.bingkai) { p.x += P.tanah.dx; p.y += P.tanah.dy; p.z += P.tanah.dz; } if (P.tanah.konveyor) { p.x += P.tanah.konveyor[0] * dt; p.z += P.tanah.konveyor[1] * dt; } }
  for (const s of D.gerak) {
    if (!s.aktif || s.tembus || !bertindih(p, s)) continue;
    const kiri = p.x + FIZIK.separuh - s.min.x, kanan = s.max.x - (p.x - FIZIK.separuh), dpn = p.z + FIZIK.separuh - s.min.z, blk = s.max.z - (p.z - FIZIK.separuh), atas = s.max.y - p.y;
    const mn = Math.min(kiri, kanan, dpn, blk, atas);
    if (mn === atas) { p.y = s.max.y; } else if (mn === kiri) p.x -= kiri; else if (mn === kanan) p.x += kanan; else if (mn === dpn) p.z -= dpn; else p.z += blk;
  }

  // panjat truss
  P.panjat = false;
  for (const s of D.solid) if (s.truss && s.aktif && bertindih(p, s, 0.55)) {
    P.panjat = true; const nak = adaInput || i.lompat;
    P.vel.y = nak ? 14 : 0; break;
  }
  // lompat
  const lompatTekan = i.lompat, air = D.mod.dalamAir?.(p);
  if (P.sekat && adaInput && P.diTanah && D.autoLompat && !P.terbang) { P.vel.y = P.kuasaLompat * 0.92; P.diTanah = false; P.tanah = null; }
  P.sekat = false;
  if (P.terbang) { P.vel.y += (((lompatTekan ? 1 : 0) - (i.turun ? 1 : 0)) * 26 - P.vel.y) * Math.min(1, dt * 10); P.vel.x *= 1.0; }
  else if (air) { if (lompatTekan) P.vel.y = Math.min(P.vel.y + 120 * dt, 16); P.vel.y = Math.max(-18, P.vel.y - FIZIK.graviti * 0.22 * dt); P.vel.x *= 0.92; P.vel.z *= 0.92; }
  else {
    if (lompatTekan && P.diTanah && P.lonjak <= 0) { P.vel.y = P.kuasaLompat; P.diTanah = false; P.tanah = null; P.lonjak = 0.12; bunyi('lompat'); }
    if (!P.panjat) P.vel.y = Math.max(-FIZIK.jatuhMaks, P.vel.y - FIZIK.graviti * dt);
  }
  P.lonjak -= dt; P.tpk -= dt; P.tCedera -= dt;

  const adaTanah = P.diTanah; P.diTanah = false; const tnh = P.tanah; P.tanah = null;
  geser(P, 'x', P.vel.x * dt, D, adaTanah); geser(P, 'z', P.vel.z * dt, D, adaTanah); geser(P, 'y', P.vel.y * dt, D, adaTanah);
  if (!P.diTanah && adaTanah && tnh && tnh.aktif && P.vel.y <= 0 && p.y - tnh.max.y < 0.4 && p.y >= tnh.max.y - 0.4 && p.x + FIZIK.separuh > tnh.min.x && p.x - FIZIK.separuh < tnh.max.x && p.z + FIZIK.separuh > tnh.min.z && p.z - FIZIK.separuh < tnh.max.z) { p.y = tnh.max.y; P.diTanah = true; P.tanah = tnh; P.vel.y = 0; }

  // sentuhan
  for (const s of D.solid) {
    if (!s.aktif) continue;
    if (!(s.onSentuh || s.bunuh || s.lompat)) continue;
    const kena = bertindih(p, s, 0.12);
    if (kena && !s._kena) {
      s._kena = true;
      if (s.bunuh) { if (P.kebal <= 0) { bunuhPemain(); return; } }
      if (s.lompat) { P.vel.y = s.lompat; P.diTanah = false; P.tanah = null; p.y = Math.max(p.y, s.max.y + 0.02); bunyi('pad'); }
      s.onSentuh?.(s, P);
    } else if (!kena) s._kena = false;
  }
  for (const k of D.koin) if (k.ada) {
    const dx = p.x - k.x, dy = p.y + 2.5 - k.y, dz = p.z - k.z;
    if (dx * dx + dy * dy + dz * dz < 12) { k.ada = false; k.m.visible = false; bunyi('koin', 50); k.onAmbil?.(k); E.ui.syiling?.(k.nilai); }
  }
  if (p.y < D.lantaiMati && P.kebal <= 0) bunuhPemain();
  P.kebal -= dt;
}
export function lantaiDi(x, y, z) {
  let t = -Infinity; for (const s of E.dunia.solid) if (s.aktif && !s.tembus && x > s.min.x && x < s.max.x && z > s.min.z && z < s.max.z && s.max.y <= y + 1 && s.max.y > t) t = s.max.y;
  if (E.dunia.vox) t = Math.max(t, E.dunia.vox.tanahDi(x, y + 1, z));
  return t === -Infinity ? E.dunia.lantaiMati - 2 : t;
}
export function bunuhPemain() {
  const P = E.P; if (!P || P.mati) return;
  P.mati = true; P.tMati = 2.3; S.oof++; if (S.oof >= 25) beriLencana('oof'); simpan();
  bunyi('oof'); pecahkan(P.av, E.dunia.grup, lantaiDi(P.pos.x, P.pos.y, P.pos.z));
  E.ui.kesihatan?.(0); E.dunia.mod.onMati?.();
}
/* kecederaan (arena bertarung, malam, bencana): hp 0 = mati */
export function cederakan(n, dari) {
  const P = E.P; if (!P || P.mati || P.kebal > 0 || E.tahan) return false;
  P.hp = Math.max(0, P.hp - n); P.tCedera = 0.4; E.ui.kesihatan?.(P.hp); bunyi('pukul');
  if (dari) { const dx = P.pos.x - dari.x, dz = P.pos.z - dari.z, l = Math.hypot(dx, dz) || 1; P.vel.x += dx / l * 26; P.vel.z += dz / l * 26; P.vel.y = Math.max(P.vel.y, 18); P.diTanah = false; }
  if (P.hp <= 0) bunuhPemain();
  return true;
}
export function rawat(n) { const P = E.P; if (!P || P.mati) return; P.hp = Math.min(100, P.hp + n); E.ui.kesihatan?.(P.hp); }
export async function munculSemula() {
  const P = E.P, D = E.dunia; if (!P || !D) return;
  if (D.mod.sebelumMuncul) { E.tahan++; try { await D.mod.sebelumMuncul(); } finally { E.tahan--; } if (E.dunia !== D) return; }
  pulihkan(P.av); P.mati = false; P.vel.set(0, 0, 0); P.kebal = 0.6; P.hp = 100;
  const sp = D.spawn; P.pos.set(sp.x, sp.y + 0.05, sp.z); P.yaw = sp.yaw || 0; E.kam.yaw = sp.yaw || 0; P.diTanah = false; P.tanah = null;
  D.mod.selepasMuncul?.(); E.ui.kesihatan?.(100); bunyi('checkpoint');
}
export function setSemula() { if (E.P && !E.P.mati) { bunuhPemain(); } }

/* ---------- kamera ---------- */
const _d = V(0, 0, 0), _sasar = V(0, 0, 0);
function rayKotak(o, d, s, maks) {
  let t0 = 0, t1 = maks;
  for (const k of ['x', 'y', 'z']) {
    const inv = 1 / (d[k] || 1e-9); let a = (s.min[k] - o[k]) * inv, b = (s.max[k] - o[k]) * inv; if (inv < 0) [a, b] = [b, a];
    t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t1 <= t0) return -1;
  }
  return t0 > 0.5 ? t0 : -1;
}
function kemasKamera(dt) {
  const K = E.kam, P = E.P, c = E.camera; if (!P) return;
  const cp = Math.cos(K.pitch);
  _d.set(Math.sin(K.yaw) * cp, Math.sin(K.pitch), Math.cos(K.yaw) * cp);
  _sasar.set(P.pos.x, P.pos.y + 4.4, P.pos.z);
  if (P.mati && P.av.pecah) _sasar.copy(P.av.pecah.serpih[1].o.position).setY(Math.max(P.av.pecah.lantai + 2, P.av.pecah.serpih[1].o.position.y));
  let jar = K.dist;
  if (K.fp && !P.mati) {
    _sasar.y = P.pos.y + 4.6; c.position.copy(_sasar); c.lookAt(_sasar.x - _d.x, _sasar.y - _d.y, _sasar.z - _d.z);
    kubah.position.copy(c.position); matahari.position.set(P.pos.x + 70, P.pos.y + 150, P.pos.z + 50); matahari.target.position.copy(P.pos);
    P.av.akar.visible = false; K.jarak = 0; return;
  }
  for (const s of E.dunia.solid) { if (!s.aktif || s.tembus || s.kamera === false || s.truss) continue; const h = rayKotak(_sasar, _d, s, jar); if (h > 0 && h < jar) jar = h - 0.5; }
  if (E.dunia.vox) { const h = E.dunia.vox.ray(_sasar, _d, jar); if (h >= 0 && h < jar) jar = h - 0.6; }
  jar = Math.max(jar, E.dunia.vox ? 1.2 : 2.5);
  K.jarak = jar < K.jarak ? jar : K.jarak + (jar - K.jarak) * Math.min(1, dt * 5);
  c.position.copy(_sasar).addScaledVector(_d, K.jarak); c.lookAt(_sasar);
  kubah.position.copy(c.position);
  matahari.position.set(P.pos.x + 70, P.pos.y + 150, P.pos.z + 50); matahari.target.position.copy(P.pos);
  P.av.akar.visible = K.jarak > 3.2 || P.mati;
}

/* ---------- input ---------- */
const JOY = { id: null, x0: 0, y0: 0, el: null, ib: null };
function pasangInput(kv) {
  const peta = { KeyW: 'depan', ArrowUp: 'depan', KeyS: 'belakang', ArrowDown: 'belakang', KeyA: 'kiri', KeyD: 'kanan' };
  addEventListener('keydown', (e) => {
    if (!E.aktif || e.target.matches?.('input,textarea')) return;
    if (peta[e.code]) { E.inp[peta[e.code]] = 1; e.preventDefault(); }
    if (e.code === 'ArrowLeft') E.inp.pusingKi = 1; if (e.code === 'ArrowRight') E.inp.pusingKa = 1;
    if (e.code === 'Space') { E.inp.lompat = true; e.preventDefault(); }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') E.inp.turun = true;
    E.ui.kekunci?.(e);
  });
  addEventListener('keyup', (e) => {
    if (peta[e.code]) E.inp[peta[e.code]] = 0;
    if (e.code === 'ArrowLeft') E.inp.pusingKi = 0; if (e.code === 'ArrowRight') E.inp.pusingKa = 0;
    if (e.code === 'Space') E.inp.lompat = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') E.inp.turun = false;
  });
  addEventListener('blur', kosongInput);
  const ptr = new Map(); let seretPutar = null;
  kv.addEventListener('contextmenu', (e) => e.preventDefault());
  kv.addEventListener('pointerdown', (e) => {
    if (!E.aktif) return; kv.setPointerCapture?.(e.pointerId);
    if (e.pointerType === 'touch' && e.clientX < innerWidth * 0.45 && JOY.id === null) {
      JOY.id = e.pointerId; JOY.x0 = e.clientX; JOY.y0 = e.clientY; if (JOY.el) { JOY.el.hidden = false; JOY.el.style.left = e.clientX + 'px'; JOY.el.style.top = e.clientY + 'px'; JOY.ib.style.transform = ''; } return;
    }
    ptr.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: performance.now(), btn: e.button });
  });
  kv.addEventListener('pointermove', (e) => {
    if (e.pointerId === JOY.id) {
      let dx = e.clientX - JOY.x0, dy = e.clientY - JOY.y0; const r = Math.hypot(dx, dy), mx = 52; if (r > mx) { dx *= mx / r; dy *= mx / r; }
      E.inp.jx = dx / mx; E.inp.jy = -dy / mx; if (JOY.ib) JOY.ib.style.transform = `translate(${dx}px,${dy}px)`; return;
    }
    const q = ptr.get(e.pointerId); if (!q) { if (e.pointerType === 'mouse' && E.aktif) hover(e.clientX, e.clientY); return; }
    const dx = e.clientX - q.x, dy = e.clientY - q.y; q.x = e.clientX; q.y = e.clientY;
    if (ptr.size >= 2) { // cubit = zum
      const [a, b] = [...ptr.values()], baru = Math.hypot(a.x - b.x, a.y - b.y); if (seretPutar) E.kam.dist = Math.min(60, Math.max(5, E.kam.dist * seretPutar / baru)); seretPutar = baru; return;
    }
    const k = 0.0052 * (S.sens || 1); E.kam.yaw -= dx * k; E.kam.pitch = Math.min(1.4, Math.max(-0.35, E.kam.pitch + dy * k));
  });
  const lepas = (e) => {
    if (e.pointerId === JOY.id) { JOY.id = null; E.inp.jx = E.inp.jy = 0; if (JOY.el) JOY.el.hidden = true; return; }
    const q = ptr.get(e.pointerId); seretPutar = null;
    if (q && Math.hypot(q.x - q.x0, q.y - q.y0) < 7 && performance.now() - q.t < 350) klik(e.clientX, e.clientY, q.btn);
    ptr.delete(e.pointerId);
  };
  kv.addEventListener('pointerup', lepas); kv.addEventListener('pointercancel', lepas);
  kv.addEventListener('wheel', (e) => { if (E.aktif) { E.kam.dist = Math.min(60, Math.max(5, E.kam.dist * (1 + Math.sign(e.deltaY) * 0.1))); e.preventDefault(); } }, { passive: false });
}
export function pasangJoystik(el, ib) { JOY.el = el; JOY.ib = ib; }
export function kosongInput() { Object.assign(E.inp, { kiri: 0, kanan: 0, depan: 0, belakang: 0, lompat: false, turun: false, jx: 0, jy: 0, pusingKi: 0, pusingKa: 0 }); }
const ray = new THREE.Raycaster(), _n = new THREE.Vector2();
function klik(x, y, btn = 0) {
  const D = E.dunia; if (!D?.mod.onKlik || E.tahan) return;
  if (E.kam.fp) { x = innerWidth / 2; y = innerHeight / 2; }
  _n.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(_n, E.camera); D.mod.onKlik(ray, btn);
}
export function klikTengah(btn = 0) { klik(innerWidth / 2, innerHeight / 2, btn); }
export function rayDari(x, y) { _n.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(_n, E.camera); return ray; }
let tHover = 0;
function hover(x, y) {
  const D = E.dunia; if (!D?.mod.onHover || E.tahan) return; const k = performance.now(); if (k - tHover < 40) return; tHover = k;
  if (E.kam.fp) { x = innerWidth / 2; y = innerHeight / 2; }
  D.mod.onHover(rayDari(x, y));
}

/* ---------- pemain lain (bot) ---------- */
export const NAMA_BOT = ['Aiman_07', 'SitiCool', 'RayyanGG', 'NurAina12', 'HafizPro', 'Putri_Bintang', 'DimasXD', 'Bagas99', 'Alya_Rose', 'Kevin_ID', 'Tom_Builder', 'Lily2014', 'Danish_Y5', 'Mei_Ling8', 'Arjun_M', 'Zara_Star'];
const WARNA_BOT = [['#d8714f', '#2c3e6b', '#2e2620'], ['#f19bb4', '#ffffff', '#c0607e'], ['#7f9fd9', '#45639e', '#2c3e6b'], ['#f2c14e', '#3f7a4f', '#6d4a2a'], ['#a3b86c', '#6f8440', '#3a4a2a'], ['#8a78b8', '#2e2640', '#1c1828'], ['#f6e2a8', '#c0392b', '#2e2620'], ['#6fa8dc', '#f2c14e', '#2c3e6b']];
const TOPI_BOT = ['tiada', 'kupluk', 'topiKeledar', 'telinga', 'mahkota', 'kon', 'sarjana', 'songkok', 'topiSihir', 'halo'], MUKA_BOT = ['clawd', 'clawd', 'senyum', 'kaca', 'kagum'], BLK_BOT = ['tiada', 'tiada', 'jubah', 'beg', 'sayap'];
export function cfgRawak(i) { const w = WARNA_BOT[i % WARNA_BOT.length]; return { kulit: w[0], baju: w[1], seluar: w[2], topi: TOPI_BOT[(i * 3) % TOPI_BOT.length], muka: MUKA_BOT[i % MUKA_BOT.length], belakang: BLK_BOT[(i * 2) % BLK_BOT.length] }; }

export class Bot {
  constructor(D, i, o = {}) {
    this.D = D; this.nama = NAMA_BOT[i % NAMA_BOT.length]; this.av = buatAvatar(cfgRawak(i)); this.pos = V(o.x || 0, o.y || 0, o.z || 0); this.yaw = Math.random() * 6;
    this.o = o; this.tkt = 0; this.ti = 0; this.mod = o.titik ? 'hop' : 'jalan'; this.t = 0; this.dur = 0; this.dari = this.pos.clone(); this.ke = this.pos.clone(); this.rehat = Math.random() * 2; this.diTanah = true; this.laju = 0; this.vy = 0; this.statistik = {}; this.selang = 6 + Math.random() * 20;
    this.ti = o.mula || 0; this.av.akar.add(this.tag = tagNama(this.nama)); D.grup.add(this.av.akar); this.mati = 0;
    if (o.titik) { const p = this._titik(this.ti); this.pos.copy(p); }
    this.av.akar.position.copy(this.pos); this.av.akar.rotation.y = this.yaw;
  }
  _titik(i) { const q = this.o.titik[i]; return q.part ? V(q.part.x, q.part.y, q.part.z) : V(q.x, q.y, q.z); }
  cakap(teks) {
    if (this.bual) { this.av.akar.remove(this.bual); buangObjek(this.bual); }
    this.bual = papanTeks([{ t: teks, c: '#121a2b', b: false }], Math.min(16, 3.4 + teks.length * 0.3), { w: Math.min(800, 140 + teks.length * 16), h: 80, bg: '#f5f1e6', bucu: 22, garis: null, padY: 0.14 });
    this.bual.position.y = 8.2; this.av.akar.add(this.bual); this.tBual = 4.5;
  }
  kemas(dt) {
    if (this.tBual > 0) { this.tBual -= dt; if (this.tBual <= 0) { this.av.akar.remove(this.bual); buangObjek(this.bual); this.bual = null; } }
    if (this.mati > 0) { this.mati -= dt; kemasPecah(this.av, dt); if (this.mati <= 0) { pulihkan(this.av); const p = this._titik(this.ti); this.pos.copy(p); this.av.akar.visible = true; this.av.akar.position.copy(p); this.rehat = 0.6; } return; }
    if (this.mod === 'hop') this._hop(dt); else this._jalan(dt);
    this.av.akar.position.copy(this.pos);
    let b = this.yaw - this.av.akar.rotation.y; while (b > Math.PI) b -= Math.PI * 2; while (b < -Math.PI) b += Math.PI * 2; this.av.akar.rotation.y += b * Math.min(1, dt * 10);
    animasi(this.av, dt, { laju: this.laju, diTanah: this.diTanah, vy: this.vy });
  }
  _hop(dt) {
    const T = this.o.titik;
    if (this.dur > 0) {
      this.t += dt; const k = Math.min(1, this.t / this.dur);
      const naikY = this.ke.y - this.dari.y, puncak = Math.max(this.lompat ? 3.8 : 0, 0);
      this.pos.lerpVectors(this.dari, this.ke, k); this.pos.y = this.dari.y + naikY * k + puncak * 4 * k * (1 - k);
      this.diTanah = !this.lompat; this.vy = 1 - 2 * k; this.laju = 16;
      if (k >= 1) {
        this.dur = 0; this.diTanah = true; this.laju = 0; this.rehat = (T[this.ti].rehat || 0) + Math.random() * (this.o.malas ?? 0.8);
        if (this.o.onTiba) this.o.onTiba(this, this.ti);
      }
      return;
    }
    this.rehat -= dt; this.laju = 0; if (this.rehat > 0) return;
    if (this.ti >= T.length - 1) { this.ti = this.o.ulang ?? 0; this.pos.copy(this._titik(this.ti)); this.rehat = 1; return; }
    if (T[this.ti + 1].jatuh && Math.random() < (this.o.gagal ?? 0.06)) { // tersilap: cuba semula dari titik semak
      this.mati = 2; pecahkan(this.av, this.D.grup, this.pos.y - 25); let b = this.ti; while (b > 0 && !T[b].semak) b--; this.ti = b; return;
    }
    this.ti++; this.dari.copy(this.pos); this.ke.copy(this._titik(this.ti));
    const dx = this.ke.x - this.dari.x, dz = this.ke.z - this.dari.z, jar = Math.hypot(dx, dz); this.lompat = !T[this.ti].jalan;
    this.dur = Math.max(this.lompat ? 0.46 : 0.2, jar / 15); this.t = 0; if (jar > 0.1) this.yaw = Math.atan2(-dx, -dz);
  }
  _jalan(dt) {
    const a = this.o.kawasan || { x: 0, z: 0, w: 40, d: 40 };
    if (this.dur > 0) { this.t += dt; const k = Math.min(1, this.t / this.dur); this.pos.lerpVectors(this.dari, this.ke, k); this.laju = 13; if (this.o.y !== undefined) this.pos.y = this.o.y; if (k >= 1) { this.dur = 0; this.rehat = 0.8 + Math.random() * 3.5; } return; }
    this.laju = 0; this.rehat -= dt; if (this.rehat > 0) return;
    this.dari.copy(this.pos); this.ke.set(a.x + (Math.random() - 0.5) * a.w, this.pos.y, a.z + (Math.random() - 0.5) * a.d);
    const dx = this.ke.x - this.dari.x, dz = this.ke.z - this.dari.z; this.dur = Math.hypot(dx, dz) / 13; this.t = 0; this.yaw = Math.atan2(-dx, -dz);
  }
}

/* ---------- memasuki & keluar dunia ---------- */
export function masukDunia(mod) {
  keluarDunia();
  E.scene.remove(hemi); E.scene.add(hemi);
  const D = new Dunia(mod); E.dunia = D;
  if (mod.langit) aturLangit(...mod.langit); else aturLangit('#5b9ee0', '#d9eefc', [170, 620]);
  aturCahaya(mod.cahaya?.[0] ?? 1.5, mod.cahaya?.[1] ?? 2.5);
  mod.bina(D); D.selesai();
  E.P = buatPemain(S.avatar); D.grup.add(E.P.av.akar);
  const sp = D.spawn; E.P.pos.set(sp.x, sp.y + 0.05, sp.z); E.P.yaw = sp.yaw || 0;
  E.kam.yaw = sp.yaw || 0; E.kam.pitch = 0.34; E.kam.dist = mod.jarakKamera || 22; E.kam.jarak = E.kam.dist; E.kam.fp = false;
  E.tahan = 0; E.aktif = true; kosongInput(); muzik(mod.tema || 'obby');
}
export function keluarDunia() {
  if (E.dunia) { E.dunia.mod.keluar?.(); E.dunia.buang(); }
  E.dunia = null; E.P = null; E.aktif = false; E.tahan = 0; kosongInput(); simpan();
}

/* gambar kecil pengalaman: bina dunia, rakam satu frame, buang */
export function gambarDunia(mod, w = 480, h = 270) {
  const r = E.renderer, D = new Dunia(mod, true), lama = E.dunia;
  E.dunia = D; if (mod.langit) aturLangit(...mod.langit); else aturLangit('#5b9ee0', '#d9eefc', [170, 620]);
  mod.bina(D); D.selesai(); D.kemas(0.5);
  const cam = new THREE.PerspectiveCamera(58, w / h, 0.3, 1600); const k = mod.pratonton; cam.position.set(...k.p); cam.lookAt(...k.t);
  kubah.position.copy(cam.position);
  matahari.position.set(k.t[0] + 70, k.t[1] + 150, k.t[2] + 50); matahari.target.position.set(...k.t); matahari.target.updateMatrixWorld();
  const rt = new THREE.WebGLRenderTarget(w, h, { samples: E.ringan ? 0 : 4 });
  r.setRenderTarget(rt); r.render(E.scene, cam);
  const data = new Uint8Array(w * h * 4); r.readRenderTargetPixels(rt, 0, 0, w, h, data); r.setRenderTarget(null); rt.dispose();
  D.buang(); E.dunia = lama;
  return keDataURL(data, w, h);
}
const LUT = Uint8Array.from({ length: 256 }, (_, i) => { const v = i / 255; return Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)); });
function keDataURL(data, w, h) {
  for (let i = 0; i < data.length; i += 4) { data[i] = LUT[data[i]]; data[i + 1] = LUT[data[i + 1]]; data[i + 2] = LUT[data[i + 2]]; }
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), im = g.createImageData(w, h);
  for (let y = 0; y < h; y++) { const src = (h - 1 - y) * w * 4, dst = y * w * 4; im.data.set(data.subarray(src, src + w * 4), dst); }
  for (let i = 3; i < im.data.length; i += 4) im.data[i] = 255;
  g.putImageData(im, 0, 0); return c.toDataURL('image/jpeg', 0.84);
}
/* potret avatar untuk kad rakan & pilihan watak */
export function gambarAvatar(cfg, w = 192, h = 192, badan = false) {
  const r = E.renderer, sc = new THREE.Scene(), av = buatAvatar(cfg);
  sc.background = new THREE.Color('#182641'); sc.add(new THREE.HemisphereLight(0xffffff, 0x445066, 2)); const s = new THREE.DirectionalLight(0xffffff, 2.4); s.position.set(-3, 6, 7); sc.add(s);
  av.akar.rotation.y = badan === 'blk' ? 0.6 : Math.PI + 0.35; sc.add(av.akar);
  av.lenKi.rotation.x = 0.1; av.lenKa.rotation.x = -0.1;
  const cam = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
  if (badan) { cam.position.set(0, 3.6, 12.4); cam.lookAt(0, 2.9, 0); } else { cam.position.set(0, 4.8, 6.2); cam.lookAt(0, 4.2, 0); }
  const rt = new THREE.WebGLRenderTarget(w, h, { samples: E.ringan ? 0 : 4 });
  const tone = r.toneMapping; r.setRenderTarget(rt); r.render(sc, cam);
  const data = new Uint8Array(w * h * 4); r.readRenderTargetPixels(rt, 0, 0, w, h, data); r.setRenderTarget(null); rt.dispose(); r.toneMapping = tone;
  return keDataURL(data, w, h);
}

/* ---------- gelung utama ---------- */
let tLepas = 0, fpsMasa = 0, fpsKira = 0, rendahKali = 0;
function gelung(ms) {
  requestAnimationFrame(gelung);
  let dt = Math.min(0.05, (ms - tLepas) / 1000 || 0.016); tLepas = ms; E.masa += dt;
  fpsKira++; fpsMasa += dt; if (fpsMasa >= 1) { E.fps = fpsKira / fpsMasa; fpsKira = 0; fpsMasa = 0; autoKualiti(); }
  const D = E.dunia, P = E.P;
  if (D && P && !D.pratonton) {
    if (!E.tahan) {
      const langkah = dt > 1 / 50 ? 2 : 1, h = dt / langkah;
      for (let i = 0; i < langkah; i++) {
        if (E.inp.pusingKi) E.kam.yaw += h * 2.2; if (E.inp.pusingKa) E.kam.yaw -= h * 2.2;
        D.kemas(h); D.mod.kemas?.(h, D.t, D);
        if (!P.mati) { langkahPemain(h); }
      }
      if (P.mati) {
        kemasPecah(P.av, dt); P.tMati -= dt;
        if (P.tMati <= 0 && !P.menunggu) { P.menunggu = true; munculSemula().finally(() => { P.menunggu = false; }); }
      } else {
        P.av.akar.position.copy(P.pos); P.av.akar.rotation.y = P.yaw; P.sorak -= dt;
        P.ayun = Math.max(0, (P.ayun || 0) - dt * 3.2); animasi(P.av, dt, { laju: Math.hypot(P.vel.x, P.vel.z), diTanah: P.diTanah, vy: P.vel.y, panjat: P.panjat, sorak: P.sorak > 0, ayun: P.ayun });
      }
    }
    kemasKamera(dt); E.renderer.render(E.scene, E.camera);
  }
}
function autoKualiti() {
  if (S.grafik !== 'auto' || E.ringan || !E.aktif) return;
  if (E.fps < 26) rendahKali++; else rendahKali = 0;
  if (rendahKali >= 4) { E.ringan = true; E.bayang = false; E.renderer.setPixelRatio(1); E.renderer.shadowMap.enabled = false; matahari.castShadow = false; ukurSemula(); E.scene.traverse((o) => { if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.needsUpdate = true; }); } }); }
}
export { buatPet, tukarTeks, isyarat, matahari, hemi };
