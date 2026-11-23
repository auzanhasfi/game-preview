/* Turbo Clawd: fisika balap di atas rel lintasan (s = jarak, x = lateral), AI geng Comot, item (roket, bom, dorong, nitro, perisai), gerbang angka, partikel */
import * as THREE from 'three';
import { W, CELAH, bingkaiBaru } from './04-trek.js';
import { R } from './05-dunia.js';

export const G = { pembalap: [], proj: [], kotak: [], gerbang: [], gerbangAbs: [], soal: [], waktu: 0, putaran: 3, trek: null, pemain: null, urutanFinis: [], goyang: 0, ev: () => {} };
const GRAV = 46, BATAS = W - 1.25, TARIK = 0.0047;
const fr = bingkaiBaru(), fr2 = bingkaiBaru();
const mtx = new THREE.Matrix4(), qY = new THREE.Quaternion(), qR = new THREE.Quaternion(), vNT = new THREE.Vector3(), Yax = new THREE.Vector3(0, 1, 0), Zax = new THREE.Vector3(0, 0, 1);

export const dS = (a, b) => { const L = G.trek.L; return ((((a - b) % L) + L * 1.5) % L) - L / 2; };

/* ===== partikel (Points aditif) ===== */
const MAXP = 900;
const P = { pos: new Float32Array(MAXP * 3), col: new Float32Array(MAXP * 3), vel: new Float32Array(MAXP * 3), hidup: new Float32Array(MAXP), umur: new Float32Array(MAXP), base: new Float32Array(MAXP * 3), grav: new Float32Array(MAXP), n: 0 };
let titik = null;
export function siapkanPartikel(scene) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(P.pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(P.col, 3));
  const c = document.createElement('canvas'); c.width = c.height = 32; const g2 = c.getContext('2d');
  const gr = g2.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g2.fillStyle = gr; g2.fillRect(0, 0, 32, 32);
  titik = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.7, map: new THREE.CanvasTexture(c), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  titik.frustumCulled = false; scene.add(titik);
  for (let i = 0; i < MAXP; i++) P.pos[i * 3 + 1] = -999;
}
const cTmp = new THREE.Color();
export function semprot(pos, n, col, kec = 8, umur = 0.6, arah = null, grav = 0) {
  cTmp.set(col);
  for (let k = 0; k < n; k++) {
    const i = P.n; P.n = (P.n + 1) % MAXP;
    P.pos[i * 3] = pos.x; P.pos[i * 3 + 1] = pos.y; P.pos[i * 3 + 2] = pos.z;
    let vx = (Math.random() - 0.5) * 2, vy = (Math.random() - 0.5) * 2, vz = (Math.random() - 0.5) * 2;
    const l = Math.hypot(vx, vy, vz) || 1; vx = vx / l * kec * (0.4 + Math.random() * 0.6); vy = vy / l * kec * (0.4 + Math.random() * 0.6); vz = vz / l * kec * (0.4 + Math.random() * 0.6);
    if (arah) { vx += arah.x; vy += arah.y; vz += arah.z; }
    P.vel[i * 3] = vx; P.vel[i * 3 + 1] = vy; P.vel[i * 3 + 2] = vz;
    P.hidup[i] = P.umur[i] = umur * (0.6 + Math.random() * 0.6); P.grav[i] = grav;
    P.base[i * 3] = cTmp.r; P.base[i * 3 + 1] = cTmp.g; P.base[i * 3 + 2] = cTmp.b;
  }
}
function langkahPartikel(dt) {
  for (let i = 0; i < MAXP; i++) {
    if (P.hidup[i] <= 0) continue;
    P.hidup[i] -= dt;
    if (P.hidup[i] <= 0) { P.pos[i * 3 + 1] = -999; continue; }
    P.vel[i * 3 + 1] -= P.grav[i] * dt;
    P.pos[i * 3] += P.vel[i * 3] * dt; P.pos[i * 3 + 1] += P.vel[i * 3 + 1] * dt; P.pos[i * 3 + 2] += P.vel[i * 3 + 2] * dt;
    const f = P.hidup[i] / P.umur[i];
    P.col[i * 3] = P.base[i * 3] * f; P.col[i * 3 + 1] = P.base[i * 3 + 1] * f; P.col[i * 3 + 2] = P.base[i * 3 + 2] * f;
  }
  titik.geometry.attributes.position.needsUpdate = true; titik.geometry.attributes.color.needsUpdate = true;
}

/* ===== pembalap ===== */
export function buatPembalap(o) {
  return Object.assign({ s: 0, x: 0, vx: 0, v: 0, h: 0, vh: 0, udara: false, yaw: 0, putar: 0, putarSudut: 0, boost: 0, perisai: 0, kebal: 0, item: null, drift: false, driftArah: 0, muatan: 0,
    gerbangKe: 0, selesai: false, waktuFinis: 0, smSebelum: 0, benar: 0, salah: 0, kombo: 0, tDinding: 0, roda: 0, ai: null }, o);
}

/* posisi visual pembalap */
const vPos = new THREE.Vector3();
function letakkan(r) {
  G.trek.bingkai(r.s, fr);
  vPos.copy(fr.p).addScaledVector(fr.r, r.x).addScaledVector(fr.u, r.h);
  const m = r.mobil;
  m.akar.position.copy(vPos);
  vNT.copy(fr.t).negate(); mtx.makeBasis(fr.r, fr.u, vNT);
  m.akar.quaternion.setFromRotationMatrix(mtx);
  const yaw = -r.yaw + r.putarSudut;
  qY.setFromAxisAngle(Yax, yaw); m.akar.quaternion.multiply(qY);
  // condong saat belok / mendongak saat di udara
  qR.setFromAxisAngle(Zax, r.vx * 0.012); m.badan.quaternion.copy(qR);
  if (r.udara) m.badan.rotation.x = Math.max(-0.35, Math.min(0.3, r.vh * 0.02));
  m.bayang.position.y = -r.h / m.skala + 0.04; m.bayang.visible = !G.trek.celah[G.trek.idx(r.s)];
  m.api.visible = r.boost > 0; if (r.boost > 0) { const k = 0.8 + Math.random() * 0.5; m.api.scale.set(1, 1, k); }
  m.perisai.visible = r.perisai > 0; if (r.perisai > 0) m.perisai.rotation.y += 0.05;
  r.roda += r.v * 0.016; for (const w of m.roda) w.rotation.x = -r.roda;
  // supir bergoyang
  m.supir.rotation.z = Math.sin(G.waktu * 12 + r.id) * 0.04 + r.vx * 0.01;
}
export { letakkan };

/* item: tabel undian berdasar posisi */
function undiItem(r) {
  if (r.ai && r.ai.raja) return 'bom';
  const pos = posisiDari(r), n = G.pembalap.length;
  const tabel = pos === 0 ? [['bom', 40], ['dorong', 30], ['perisai', 30]] : pos >= n - 2 ? [['roket', 40], ['nitro', 35], ['dorong', 15], ['perisai', 10]] : [['roket', 32], ['bom', 22], ['dorong', 20], ['nitro', 16], ['perisai', 10]];
  let tot = 0; for (const [, w] of tabel) tot += w; let x = Math.random() * tot;
  for (const [k, w] of tabel) { x -= w; if (x <= 0) return k; } return tabel[0][0];
}

export function urutan() {
  return G.pembalap.slice().sort((a, b) => {
    if (a.selesai && b.selesai) return a.waktuFinis - b.waktuFinis;
    if (a.selesai) return -1; if (b.selesai) return 1; return b.s - a.s;
  });
}
export function posisiDari(r) { return urutan().indexOf(r); }

/* kena serangan */
export function kena(r, sumber) {
  if (r.kebal > 0 || r.selesai) return;
  if (r.perisai > 0) { r.perisai = 0; r.kebal = 0.6; G.ev('perisaiPecah', r); return; }
  r.putar = 1.15; r.kebal = 2.2; r.v *= 0.35; r.boost = 0; r.drift = false; r.muatan = 0;
  G.ev('kena', r, sumber);
}

/* pakai item */
export function pakaiItem(r) {
  const it = r.item; if (!it || r.putar > 0) return; r.item = null;
  G.trek.bingkai(r.s, fr);
  if (it === 'roket') {
    // sasaran: mobil terdekat di depan
    let tgt = null, best = 1e9;
    for (const o of G.pembalap) { if (o === r || o.selesai) continue; const d = o.s - r.s; if (d > 0 && d < 320 && d < best) { best = d; tgt = o; } }
    G.proj.push({ jenis: 'roket', s: r.s + 3, x: r.x, h: 1, v: Math.max(r.v + 38, 96), pemilik: r, tgt, umur: 4.5, mesh: meshRoket() });
  } else if (it === 'bom') {
    G.proj.push({ jenis: 'bom', fase: 'terbang', t: 0, s0: r.s + 2, s: r.s + 2, x: r.x, h: 1, pemilik: r, umur: 7, mesh: meshBom() });
  } else if (it === 'dorong') {
    for (const o of G.pembalap) {
      if (o === r || o.selesai) continue; const d = dS(o.s, r.s);
      if (Math.abs(d) < 17 && Math.abs(o.x - r.x) < 11) {
        if (o.perisai > 0) { o.perisai = 0; G.ev('perisaiPecah', o); continue; }
        const arah = Math.sign(o.x - r.x) || (Math.random() < 0.5 ? -1 : 1);
        o.vx = arah * 30 / (o.berat || 1); o.v *= 0.72; o.kebal = Math.max(o.kebal, 0.3); G.ev('didorong', o, r);
      }
    }
    G.proj.push({ jenis: 'gelombang', s: r.s, x: r.x, h: 0.6, umur: 0.55, t: 0, pemilik: r, mesh: meshGelombang() });
  } else if (it === 'nitro') { r.boost = Math.max(r.boost, 2.3); }
  else if (it === 'perisai') { r.perisai = 9; }
  G.ev('item', r, it);
}

function jatuhkanBom(r) { G.proj.push({ jenis: 'bom', fase: 'diam', t: 0, s: r.s - 7, x: r.x, h: 0, pemilik: r, umur: 9, mesh: meshBom() }); }

/* mesh proyektil */
const mRoket = new THREE.MeshStandardMaterial({ color: '#e63b46', roughness: 0.3, metalness: 0.4 });
function meshRoket() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.8, 10), mRoket); b.rotation.x = Math.PI / 2; g.add(b);
  const k = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.8, 10), new THREE.MeshStandardMaterial({ color: '#ffffff' })); k.rotation.x = -Math.PI / 2; k.position.z = -1.3; g.add(k);
  for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.5), mRoket); s.position.z = 0.7; s.rotation.z = i * Math.PI / 2; s.position.x = Math.cos(i * Math.PI / 2) * 0.35; s.position.y = Math.sin(i * Math.PI / 2) * 0.35; g.add(s); }
  R.scene.add(g); return g;
}
function meshBom() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12), new THREE.MeshStandardMaterial({ color: '#1a1d29', roughness: 0.35, metalness: 0.3 })); b.position.y = 0.8; g.add(b);
  const sumbu = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5), new THREE.MeshStandardMaterial({ color: '#c9a36a' })); sumbu.position.y = 1.75; g.add(sumbu);
  const lampu = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff3344' })); lampu.position.y = 2.05; g.add(lampu); g.userData.lampu = lampu;
  R.scene.add(g); return g;
}
function meshGelombang() {
  const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.25, 8, 40), new THREE.MeshBasicMaterial({ color: '#39d0ff', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  R.scene.add(m); return m;
}
function ledak(pr) {
  G.trek.bingkai(pr.s, fr);
  const p = fr.p.clone().addScaledVector(fr.r, pr.x).addScaledVector(fr.u, 1);
  semprot(p, 70, '#ffb020', 22, 0.8, fr.u.clone().multiplyScalar(6), 10);
  semprot(p, 40, '#ff3b1f', 14, 1.0, fr.u.clone().multiplyScalar(4), 4);
  semprot(p, 25, '#ffffff', 26, 0.35);
  const bola = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), new THREE.MeshBasicMaterial({ color: '#ffb020', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  bola.position.copy(p); R.scene.add(bola);
  G.proj.push({ jenis: 'bola', mesh: bola, t: 0, umur: 0.5, s: pr.s, x: pr.x });
  for (const o of G.pembalap) { if (Math.abs(dS(o.s, pr.s)) < 8 && Math.abs(o.x - pr.x) < 6.5 && o.h < 4) kena(o, pr.pemilik); }
  G.ev('ledak', pr, p);
}

/* ===== kontrol AI ===== */
function kontrolAI(r, dt) {
  const ai = r.ai, k = { kemudi: 0, rem: false, drift: false, item: false };
  // garis balap
  let tx = Math.sin(r.s / 70 + ai.fase) * 3.2 + ai.bias;
  // gerbang: pilih lajur
  const gA = G.gerbangAbs[r.gerbangKe];
  if (gA && gA.s - r.s < 80 && gA.s - r.s > 0) {
    if (ai.keputusan !== r.gerbangKe) { ai.keputusan = r.gerbangKe; const benar = Math.random() < ai.akur; ai.lajur = benar ? 1 : (Math.random() < 0.5 ? 0 : 2); ai.lajurBenar = benar; }
    tx = (ai.lajur - 1) * (2 * W / 3);
  }
  // hindari mobil & bom di depan
  for (const o of G.pembalap) { if (o === r) continue; const d = o.s - r.s; if (d > 0 && d < 11 && Math.abs(o.x - r.x) < 2.6) tx += (r.x >= o.x ? 3.5 : -3.5); }
  for (const p of G.proj) if (p.jenis === 'bom' && p.fase === 'diam') { const d = dS(p.s, r.s); if (d > 0 && d < 28 && Math.abs(p.x - r.x) < 3) tx += r.x >= p.x ? 4 : -4; }
  // kotak item
  if (!r.item) for (const b of G.kotak) { const d = dS(b.s, r.s); if (b.aktif && d > 5 && d < 40) { tx = tx * 0.4 + b.x * 0.6; break; } }
  tx = Math.max(-BATAS + 0.4, Math.min(BATAS - 0.4, tx));
  G.trek.bingkai(r.s, fr2);
  const ingin = (tx - r.x) * 2.4 + fr2.k * r.v * r.v * TARIK;
  k.kemudi = Math.max(-1, Math.min(1, ingin / r.st.g));
  // item
  if (r.item) {
    ai.tItem -= dt;
    if (ai.tItem <= 0) {
      let pakai = true;
      if (r.item === 'dorong') pakai = G.pembalap.some((o) => o !== r && Math.abs(dS(o.s, r.s)) < 14 && Math.abs(o.x - r.x) < 9);
      if (r.item === 'roket') pakai = G.pembalap.some((o) => o !== r && o.s - r.s > 5 && o.s - r.s < 250);
      if (pakai || ai.tItem < -6) k.item = true;
    }
  } else ai.tItem = 0.8 + Math.random() * 2.5;
  // Raja Comot menjatuhkan bom
  if (ai.raja) { ai.tBom -= dt; if (ai.tBom <= 0) { ai.tBom = 5 + Math.random() * 3; if (G.waktu > 4) jatuhkanBom(r); } }
  return k;
}

/* ===== satu langkah fisika ===== */
export function langkah(dt, input) {
  G.waktu += dt;
  const trek = G.trek, L = trek.L, pm = G.pemain;
  for (const r of G.pembalap) {
    if (r.selesai && (r !== pm || G.demo)) { r.v += (r.st.v * 0.6 - r.v) * dt; r.s += r.v * dt; letakkan(r); continue; }
    let k = (r === pm && !G.demo) ? (r.selesai ? { kemudi: 0, rem: false, drift: false, item: false } : input) : kontrolAI(r, dt);
    trek.bingkai(r.s, fr);
    const sm = ((r.s % L) + L) % L;
    if (r.putar > 0) { r.putar -= dt; r.putarSudut += dt * 13; k = { kemudi: 0, rem: false, drift: false, item: false }; if (r.putar <= 0) r.putarSudut = 0; }
    r.kebal = Math.max(0, r.kebal - dt); r.perisai = Math.max(0, r.perisai - dt); r.boost = Math.max(0, r.boost - dt);
    if (k.item && r.item) pakaiItem(r);
    // kecepatan target
    let fakt = 1;
    if (r.ai) {
      fakt = r.ai.skill;
      const d = pm.s - r.s;   // karet: dekat dengan pemain supaya tetap seru
      if (d > 40) fakt *= 1 + Math.min(0.12, (d - 40) / 900);
      else if (d < -60) fakt *= 1 - Math.min(0.1, (-d - 60) / 900);
      if (G.waktu < 3.2) fakt *= 0.94;
    }
    let vt = r.st.v * fakt * (r.boost > 0 ? 1.42 : 1) * (k.rem ? 0.45 : 1);
    if (r.putar > 0) vt = 12;
    if (r.v < vt) r.v += (vt - r.v) * r.st.a * (r.boost > 0 ? 3 : 1) * dt * 1.1;
    else r.v -= (r.v - vt) * (k.rem ? 2.4 : 1.2) * dt;
    if ((fr.loop || fr.celah) && r.v < 52) r.v = 52;                // magnet loop & lompatan
    // lateral: kemudi + gaya ke luar tikungan
    const kendali = r.st.g * (0.55 + 0.45 * Math.min(1, r.v / 40));
    let vxT = k.kemudi * kendali * (k.drift ? 1.15 : 1);
    r.vx += (vxT - r.vx) * Math.min(1, (r.udara ? 2 : 9) * dt);
    let luar = fr.loop ? 0 : -fr.k * r.v * r.v * TARIK;
    // drift: kurangi gaya luar, isi muatan turbo
    if (k.drift && !r.udara && r.v > 30 && Math.abs(k.kemudi) > 0.2) {
      if (!r.drift) { r.drift = true; r.driftArah = Math.sign(k.kemudi); }
      luar *= 0.3; r.muatan = Math.min(3, r.muatan + dt * (0.55 + Math.abs(fr.k) * 40));
      if (r === pm && Math.random() < 0.6) { const c = r.muatan > 2 ? '#ff5df0' : r.muatan > 1 ? '#ffb020' : '#39d0ff'; for (const sg of [-1, 1]) semprot(r.mobil.akar.localToWorld(new THREE.Vector3(sg * 1.1, 0.2, 1.4)), 1, c, 3, 0.25); }
    } else if (r.drift) {
      r.drift = false;
      if (r.muatan > 0.8) { r.boost = Math.max(r.boost, Math.min(2.2, r.muatan * 0.7)); G.ev('driftTurbo', r, r.muatan); }
      r.muatan = 0;
    }
    r.x += (r.vx + luar) * dt;
    // pagar
    if (Math.abs(r.x) > BATAS) {
      r.x = Math.sign(r.x) * BATAS; r.vx = -r.vx * 0.3; r.v *= 1 - 1.3 * dt; r.tDinding -= dt;
      if (r.tDinding <= 0) { r.tDinding = 0.25; if (r === pm) G.ev('dinding', r); semprot(fr.p.clone().addScaledVector(fr.r, r.x * 1.08).addScaledVector(fr.u, 0.6), 6, '#ffd27a', 7, 0.3); }
    }
    // maju
    const sLama = r.s; r.s += r.v * dt;
    const smBaru = ((r.s % L) + L) % L;
    // lompatan
    for (const z of trek.zonaLompat) {
      const s0 = ((z.s0 % L) + L) % L;
      if (!r.udara && dS(smBaru, s0) >= 0 && dS(sm, s0) < 0) { r.udara = true; r.vh = 0.5 * GRAV * (CELAH + 8) / Math.max(r.v, 45); if (r === pm) G.ev('lompat', r); }
    }
    if (r.udara) {
      r.h += r.vh * dt; r.vh -= GRAV * dt;
      if (r.h <= 0) { if (trek.celah[trek.idx(r.s)]) { r.h = 0; r.vh = 0; } else { r.h = 0; r.udara = false; if (r === pm) G.ev('mendarat', r); } }
    }
    // pad turbo
    for (const p of trek.pads) { const d = dS(smBaru, p.s); if (d >= 0 && d < 6 && Math.abs(r.x - p.x) < 2.8 && !r.udara) { if (r.boost < 0.9) G.ev('pad', r); r.boost = Math.max(r.boost, 1.2); } }
    // kotak item
    for (const b of G.kotak) {
      if (!b.aktif) continue;
      if (Math.abs(dS(smBaru, b.s)) < 1.9 && Math.abs(r.x - b.x) < 1.9 && r.h < 3) {
        b.aktif = false; b.tunggu = 3; b.mesh.visible = false;
        semprot(b.mesh.position, 18, '#a78bfa', 9, 0.5);
        if (!r.item) { r.item = undiItem(r); if (r.ai) r.ai.tItem = 0.6 + Math.random() * 2.5; }
        if (r === pm) G.ev('kotak', r, r.item);
      }
    }
    // gerbang angka
    const gA = G.gerbangAbs[r.gerbangKe];
    if (gA && r.s >= gA.s) {
      const lajur = r.x < -W / 3 ? 0 : r.x > W / 3 ? 2 : 1;
      let benar;
      if (r === pm && !G.demo) benar = lajur === G.soal[r.gerbangKe].benar;
      else benar = r.ai.keputusan === r.gerbangKe ? r.ai.lajurBenar : Math.random() < 0.5;
      if (benar) { r.boost = Math.max(r.boost, 3); r.benar++; r.kombo++; } else { r.v *= 0.55; r.salah++; r.kombo = 0; }
      if (r === pm) G.ev('gerbang', r, { benar, lajur, soal: G.soal[r.gerbangKe], ke: r.gerbangKe });
      r.gerbangKe++;
    }
    // finis
    if (!r.selesai && r.s >= G.putaran * L) { r.selesai = true; r.waktuFinis = G.waktu; G.urutanFinis.push(r); G.ev('finis', r); }
    // putaran baru
    if (Math.floor(sLama / L) !== Math.floor(r.s / L) && r.s > 0 && !r.selesai && r === pm) G.ev('putaran', r, Math.floor(r.s / L) + 1);
    // yaw visual
    const yt = r.drift ? r.driftArah * 0.42 + r.vx * 0.01 : Math.atan2(r.vx, Math.max(10, r.v)) * 1.4;
    r.yaw += (yt - r.yaw) * Math.min(1, 8 * dt);
    if (r.boost > 0 && Math.random() < 0.4) semprot(r.mobil.akar.localToWorld(new THREE.Vector3((Math.random() - 0.5) * 1.4, 0.6, 2.4)), 1, '#39d0ff', 2, 0.22);
  }
  // tabrakan antar mobil
  const ps = G.pembalap;
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const a = ps[i], b = ps[j]; if (a.udara !== b.udara) continue;
    const d = b.s - a.s, dx = b.x - a.x;
    const lebar = 2.25 * Math.max(a.mobil.skala, b.mobil.skala);
    if (Math.abs(d) < 3.8 && Math.abs(dx) < lebar) {
      const tumpang = lebar - Math.abs(dx), sg = Math.sign(dx) || 1;
      const ba = a.berat || 1, bb = b.berat || 1, tot = ba + bb;
      a.x -= sg * tumpang * (bb / tot); b.x += sg * tumpang * (ba / tot);
      a.vx -= sg * 6 * bb / tot; b.vx += sg * 6 * ba / tot;
      const blk = d > 0 ? a : b; blk.v *= 0.985;
      if (a === pm || b === pm) G.ev('senggol', a === pm ? b : a);
    }
  }
  for (const r of ps) letakkan(r);
  // proyektil
  for (let i = G.proj.length - 1; i >= 0; i--) {
    const p = G.proj[i]; p.umur -= dt;
    if (p.jenis === 'roket') {
      if (p.tgt && !p.tgt.selesai) { p.x += Math.sign(p.tgt.x - p.x) * Math.min(Math.abs(p.tgt.x - p.x), 14 * dt); }
      p.s += p.v * dt;
      trek.bingkai(p.s, fr); const pos = fr.p.clone().addScaledVector(fr.r, p.x).addScaledVector(fr.u, 1.1);
      p.mesh.position.copy(pos); vNT.copy(fr.t).negate(); mtx.makeBasis(fr.r, fr.u, vNT); p.mesh.quaternion.setFromRotationMatrix(mtx); p.mesh.rotateZ(G.waktu * 9);
      semprot(pos.clone().addScaledVector(fr.t, -1.2), 3, '#ff9a3a', 4, 0.35);
      let kenaSiapa = null;
      for (const o of ps) { if (o === p.pemilik || o.selesai) continue; if (Math.abs(dS(o.s, p.s)) < 2.6 && Math.abs(o.x - p.x) < 2.2) { kenaSiapa = o; break; } }
      if (kenaSiapa) { kena(kenaSiapa, p.pemilik); ledakKecil(pos); p.umur = 0; }
    } else if (p.jenis === 'bom') {
      p.t += dt;
      if (p.fase === 'terbang') {
        const u = Math.min(1, p.t / 0.7); p.s = p.s0 + 36 * u; p.h = 1 + Math.sin(u * Math.PI) * 7 - u;
        if (u >= 1) { p.fase = 'diam'; p.t = 0; p.h = 0; }
      } else {
        p.mesh.userData.lampu.visible = Math.floor(G.waktu * (p.umur < 3 ? 10 : 4)) % 2 === 0;
        let picu = p.umur <= 0;
        for (const o of ps) if ((o !== p.pemilik || p.t > 1) && Math.abs(dS(o.s, p.s)) < 3 && Math.abs(o.x - p.x) < 2.4 && o.h < 2) picu = true;
        if (picu) { ledak(p); p.umur = 0; }
      }
      trek.bingkai(p.s, fr); p.mesh.position.copy(fr.p).addScaledVector(fr.r, p.x).addScaledVector(fr.u, p.h);
      vNT.copy(fr.t).negate(); mtx.makeBasis(fr.r, fr.u, vNT); p.mesh.quaternion.setFromRotationMatrix(mtx);
    } else if (p.jenis === 'gelombang') {
      p.t += dt; const r = p.pemilik; trek.bingkai(r.s, fr);
      p.mesh.position.copy(fr.p).addScaledVector(fr.r, r.x).addScaledVector(fr.u, 0.8);
      vNT.copy(fr.t).negate(); mtx.makeBasis(fr.r, fr.u, vNT); p.mesh.quaternion.setFromRotationMatrix(mtx); p.mesh.rotateX(Math.PI / 2);
      const sk = 1 + p.t * 30; p.mesh.scale.set(sk, sk, 1); p.mesh.material.opacity = Math.max(0, 0.85 * (1 - p.t / 0.55));
    } else if (p.jenis === 'bola') {
      p.t += dt; const sk = 1 + p.t * 18; p.mesh.scale.setScalar(sk); p.mesh.material.opacity = Math.max(0, 0.9 * (1 - p.t / 0.5));
    }
    if (p.umur <= 0) { R.scene.remove(p.mesh); G.proj.splice(i, 1); }
  }
  // kotak muncul lagi
  for (const b of G.kotak) {
    if (!b.aktif) { b.tunggu -= dt; if (b.tunggu <= 0) { b.aktif = true; b.mesh.visible = true; } }
    b.mesh.rotation.y += dt * 1.6; b.mesh.rotation.x += dt * 0.7;
    b.mesh.position.copy(b.dasar).addScaledVector(b.u, Math.sin(G.waktu * 3 + b.x) * 0.25);
  }
  langkahPartikel(dt);
}
function ledakKecil(pos) { semprot(pos, 40, '#ffb020', 14, 0.6, null, 6); semprot(pos, 16, '#ffffff', 18, 0.3); G.ev('ledakKecil', null, pos); }
export function bersihkanProj() { for (const p of G.proj) R.scene.remove(p.mesh); G.proj.length = 0; }
export function hanyaPartikel(dt) { langkahPartikel(dt); }
