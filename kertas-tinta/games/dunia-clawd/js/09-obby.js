/* Obby Angka: 15 peringkat rintangan. Soalan berada DI DALAM dunia: jambatan jawapan & pintu jawapan. */
import * as THREE from 'three';
import { E, Bot, tukarTeks, bunuhPemain } from './08-enjin.js';
import { labelRata, labelTegak, papanTeks } from './06-bahan.js';
import { S, simpan, tambahCbux, beriLencana, rekod } from './05-simpan.js';
import { t, tx } from './01-teks.js';
import { buatSoal, teksSoal, caraKira, barisSoal } from './03-soal.js';
import { bunyi } from './04-bunyi.js';

const PAL = ['#d8714f', '#f2c14e', '#a3b86c', '#7f9fd9', '#8a78b8', '#f19bb4', '#6fa8dc'];
const MERAH = '#e8452f', J = 15;
let D, cek, stage, titik, jambatan, pintu, spinner, majuKe, lawat, nyawaStage;

function seterusWarna(i) { return PAL[i % PAL.length]; }

/* platform semak: nombor besar di lantai */
function titikSemak(n, x, y, z, warna) {
  const b = D.kotak({ x, y, z, w: 16, h: 2, d: 12, warna: '#efe6d2', warnaAtas: n === J ? '#d9b25f' : '#efe6d2', onSentuh: () => sampaiStage(n, b) });
  D.kotak({ x, y: y + 0.02, z, w: 8, h: 0.02, d: 8, warna, neon: true, hiasan: true });
  if (!D.pratonton) { const l = labelRata([{ t: String(n), c: '#0c1526' }], 7, 7); l.position.set(x, y + 0.08, z); D.grup.add(l); }
  // tiang bendera kecil
  D.kotak({ x: x + 7, y: y + 8, z: z - 4.5, w: 0.5, h: 8, d: 0.5, warna: '#efe6d2', hiasan: true });
  D.kotak({ x: x + 5.5, y: y + 8, z: z - 4.5, w: 2.6, h: 1.6, d: 0.2, warna, hiasan: true });
  cek[n] = { x, y, z };
  titik.push({ x, y, z, semak: true, st: n, jalan: true });
  return b;
}
function sampaiStage(n, b) {
  if (n <= S.x.obby.stage && n <= stage) { if (n > stage) stage = n; return; }
  if (n > stage) {
    stage = n; nyawaStage = 0;
    if (n > S.x.obby.stage) { S.x.obby.stage = n; simpan(); }
    D.spawn = { x: cek[n].x, y: cek[n].y, z: cek[n].z, yaw: D.spawn.yaw }; bunyi('checkpoint');
    E.ui.banner?.(t('Peringkat ', 'Stage ', 'Tahap ') + n + ' / ' + J);
    E.ui.segar?.();
    if (n === 5) beriLencana('obby1');
    if (n === J) tamat();
  }
}
function tamat() {
  S.x.obby.menang++; simpan(); beriLencana('obby'); tambahCbux(40); bunyi('menang'); E.P.sorak = 5; E.ui.konfeti?.();
  E.ui.toast?.(t('Tahniah! Obby Angka tamat. +40 CBux', 'Congratulations! Number Obby complete. +40 CBux', 'Selamat! Obby Angka selesai. +40 CBux'), 'emas');
}
function balikStage(n) { const c = cek[n]; D.spawn = { x: c.x, y: c.y, z: c.z, yaw: D.spawn.yaw }; }

/* ---------- jambatan jawapan: 3 petak bernombor, pilih yang betul ---------- */
function barisJawapan(x, y, z, tier, warna, st) {
  const B = { petak: [], q: null, siap: false, z, y, st };
  const xs = [-9, 0, 9];
  B.papan = D.papan(['?'], x, y + 10, z - 3, 11, { w: 512, h: 128, serif: false });
  xs.forEach((dx, i) => {
    const p = D.kotak({ x: x + dx, y, z, w: 6.4, h: 1, d: 6.4, warna, dinamik: true, onSentuh: () => injak(B, i) });
    if (!D.pratonton) { const l = labelRata([{ t: '?', c: '#0c1526' }], 5, 5, { w: 256, h: 256 }); l.position.y = 0.53; p.mesh.add(l); p.lab = l; }
    p.y0 = y; B.petak.push(p);
  });
  B.tier = tier; soalBaru(B); jambatan.push(B);
  titik.push({ x: x, y, z, st, jatuh: true, B });
  return B;
}
function soalBaru(B) {
  const q = buatSoal(S.topik, S.diff, B.tier); while (q.opts.length > 3) q.opts.splice(q.opts.findIndex((v) => v !== q.ans), 1);
  B.q = q; B.siap = false;
  tukarTeks(B.papan.userData.tx, barisSoal(q));
  B.petak.forEach((p, i) => { p.nilai = q.opts[i]; p.jatuh = 0; p.pecah = false; D.setAktif(p, true); D.setPos(p, p.x, p.y0, p.z); warnaMesh(p, 0xffffff); if (p.lab) tukarTeks(p.lab.userData.tx, [{ t: String(q.opts[i]), c: '#0c1526' }]); });
}
function warnaMesh(p, w) { if (Array.isArray(p.mesh.material)) { if (!p.mesh.userData.milik) { p.mesh.material = p.mesh.material.map((m) => m.clone()); p.mesh.userData.milik = true; } p.mesh.material.forEach((m) => m.color.set(w)); } }
function injak(B, i) {
  if (B.siap || E.P.mati) return;
  const p = B.petak[i];
  if (p.nilai === B.q.ans) {
    B.siap = true; rekod(B.q, true); bunyi('betul'); tambahCbux(2); E.ui.toast?.(t('Betul! +2 CBux', 'Correct! +2 CBux', 'Benar! +2 CBux'), 'ok');
    warnaMesh(p, 0x8fe08a); B.petak.forEach((q, k) => { if (k !== i) { q.pecah = true; q.jatuh = 0.05; warnaMesh(q, 0x6a7890); } });
    E.ui.soalanSemasa?.(null);
  } else if (!p.pecah) {
    p.pecah = true; p.jatuh = 0.12; warnaMesh(p, 0xff7a68); rekod(B.q, false); bunyi('salah'); B.tegur = true;
    E.ui.cara?.(teksSoal(B.q), B.q.ans, caraKira(B.q));
  }
}
function kemasJambatan(dt) {
  for (const B of jambatan) for (const p of B.petak) if (p.pecah && p.aktif) {
    p.jatuh -= dt; if (p.jatuh <= 0) { D.setPos(p, p.x, p.y - dt * (40 - p.jatuh * 60), p.z); if (p.y < p.y0 - 40) D.setAktif(p, false); }
  }
}
function setSemulaJambatan() { for (const B of jambatan) if (!B.siap) soalBaru(B); pintu.forEach((P) => { if (!P.buka) soalPintu(P); }); }

/* ---------- pintu jawapan ---------- */
function pintuJawapan(x, y, z, tier, warna, st) {
  const P = { pintu: [], buka: false, tier, st };
  const lebar = 8, tinggi = 11;
  // dinding penuh dengan 3 bukaan
  D.kotak({ x, y: y + 18, z, w: 34, h: 7, d: 1.6, warna: '#22324f' });
  for (const dx of [-15.75, -5.25, 5.25, 15.75]) D.kotak({ x: x + dx, y: y + tinggi, z, w: 2.5, h: tinggi, d: 1.6, warna: '#22324f' });
  for (const s of [-1, 1]) D.kotak({ x: x + s * 26, y: y + 18, z, w: 18, h: 26, d: 1.6, warna: '#22324f' }); // sayap: tak boleh lompat keliling
  P.papan = D.papan(['?'], x, y + 21, z + 1.4, 18, { w: 512, h: 128 });
  [-10.5, 0, 10.5].forEach((dx, i) => {
    const b = D.kotak({ x: x + dx, y: y + tinggi, z, w: lebar, h: tinggi, d: 1.2, warna, dinamik: true, onSentuh: () => ketuk(P, i) });
    if (!D.pratonton) { const l = labelTegak([{ t: '?', c: '#0c1526' }], 6, 4, { bg: '#efe6d2', bucu: 18 }); l.position.set(0, 1.5, 0.64); b.mesh.add(l); b.lab = l; }
    P.pintu.push(b);
  });
  soalPintu(P); pintu.push(P);
  titik.push({ x: x, y, z: z + 3, st, jalan: true, G: P }); titik.push({ x, y, z: z - 3, st, jalan: true, G: P });
  return P;
}
function soalPintu(P) {
  const q = buatSoal(S.topik, S.diff, P.tier); while (q.opts.length > 3) q.opts.splice(q.opts.findIndex((v) => v !== q.ans), 1);
  P.q = q; tukarTeks(P.papan.userData.tx, barisSoal(q));
  P.pintu.forEach((b, i) => { b.nilai = q.opts[i]; D.setAktif(b, true); warnaMesh(b, 0xffffff); if (b.lab) tukarTeks(b.lab.userData.tx, [{ t: String(q.opts[i]), c: '#0c1526' }]); });
}
function ketuk(P, i) {
  if (P.buka || P.tunggu || E.P.mati) return; const b = P.pintu[i];
  if (b.nilai === P.q.ans) {
    P.buka = true; rekod(P.q, true); bunyi('betul'); tambahCbux(3); E.ui.toast?.(t('Pintu terbuka! +3 CBux', 'Door open! +3 CBux', 'Pintu terbuka! +3 CBux'), 'ok');
    D.setAktif(b, false); E.ui.soalanSemasa?.(null);
  } else {
    P.tunggu = true; rekod(P.q, false); bunyi('salah'); warnaMesh(b, 0xff7a68); E.P.vel.z = 40; E.P.vel.y = 20; E.P.pos.z += 0.6; E.ui.cara?.(teksSoal(P.q), P.q.ans, caraKira(P.q));
    setTimeout(() => { P.tunggu = false; if (E.dunia === D) soalPintu(P); }, 1400);
  }
}

/* ---------- pembina peringkat ---------- */
function bina(d) {
  D = d; cek = {}; jambatan = []; pintu = []; spinner = []; titik = []; lawat = 0; nyawaStage = 0; stage = 0;
  d.lantaiMati = -28; d.awan(26);
  // laut dakwat di bawah (jatuh = mati)
  d.kotak({ x: 0, y: -30, z: -300, w: 1800, h: 4, d: 1800, warna: '#2c6fb0', neon: false, hiasan: true });

  // ---- lobi mula ----
  d.kotak({ x: 0, y: 0, z: 20, w: 74, h: 4, d: 44, warna: '#6a5a44', warnaAtas: '#5fa35e' });
  d.spawn = { x: 0, y: 0, z: 22, yaw: 0 };
  d.kotak({ x: 0, y: 0.2, z: 22, w: 10, h: 0.2, d: 10, warna: '#d9b25f', hiasan: true });
  for (const [x, z] of [[-30, 36], [30, 36], [-28, 6], [28, 6], [-20, 38], [22, 38]]) d.pokok(x, 0, z, 1);
  for (let i = 0; i < 4; i++) { d.kotak({ x: -28 + i * 2, y: 2 + i * 2, z: 26, w: 2, h: 2, d: 6, warna: seterusWarna(i) }); }
  d.papan([{ t: 'OBBY ANGKA', s: 1.3, c: '#d9b25f' }, { t: t('Jawab soalan · Tamatkan 15 peringkat', 'Solve maths · Finish 15 stages', 'Jawab soal · Selesaikan 15 tahap'), s: 0.7, b: false }], -22, 11, 0, 20, { w: 720, h: 240 });
  titikSemak(0, 0, 0, -8, '#d9b25f');

  let x = 0, y = 0, z = -14;
  const lompat = (dz, dy = 0, dx = 0) => { z -= dz; y += dy; x += dx; };
  const blok = (w, d2, warna, o = {}) => { const b = d.kotak({ x, y, z: z - d2 / 2, w, h: o.h || 2, d: d2, warna, ...o }); titik.push(o.gerak ? { part: b, st: stage2, jatuh: true } : { x, y, z: z - d2 / 2, st: stage2, jatuh: true }); z -= d2; return b; };
  let stage2 = 0;

  // 1 langkah pertama
  stage2 = 0; let w = PAL[0];
  [[5, 0.0], [5, 1], [6, 1], [6, 1], [6, 0], [5, -1]].forEach(([g, dy]) => { lompat(g, dy); blok(6, 6, w); });
  lompat(5); z -= 6; titikSemak(1, x, y, z, w); z -= 6;

  // 2 lantai merah
  stage2 = 1; w = PAL[1]; lompat(4);
  const panjang = 48; d.kotak({ x, y, z: z - panjang / 2, w: 14, h: 2, d: panjang, warna: w });
  for (let k = 0; k < 5; k++) { const zz = z - 6 - k * 9; d.kotak({ x, y: y + 0.3, z: zz, w: 14, h: 0.3, d: 3.4, warna: MERAH, neon: true, bunuh: true }); titik.push({ x, y, z: zz + 3.5, st: 1, jalan: true }); titik.push({ x, y, z: zz - 3.5, st: 1, jatuh: true }); }
  z -= panjang; lompat(5); z -= 6; titikSemak(2, x, y, z, w); z -= 6;

  // 3 platform gerak
  stage2 = 2; w = PAL[2];
  for (let k = 0; k < 4; k++) { lompat(5); const zz = z - 4, ax = x, ay = y, f = k * 1.7, a = 10, kel = k % 2 ? 1 : -1; const b = d.kotak({ x: ax, y: ay, z: zz, w: 8, h: 1.5, d: 8, warna: w, gerak: (tt) => [ax + Math.sin(tt * 1.05 + f) * a * kel, ay, zz] }); titik.push({ part: b, st: 2, jatuh: true }); z -= 8; }
  lompat(5); z -= 6; titikSemak(3, x, y, z, w); z -= 6;

  // 4 jambatan jawapan
  stage2 = 3; w = PAL[3];
  for (let k = 0; k < 2; k++) { lompat(5.5); z -= 3.2; barisJawapan(x, y, z, 0, w, 3); z -= 3.2; }
  lompat(5.5); z -= 6; titikSemak(4, x, y, z, w); z -= 6;

  // 5 panjat kekisi
  stage2 = 4; w = PAL[4]; lompat(1);
  const tinggi = 20;
  d.kotak({ x, y: y + tinggi, z: z - 4, w: 20, h: tinggi, d: 4, warna: w });
  d.kotak({ x, y: y + tinggi - 0.5, z: z - 1.5, w: 4, h: tinggi - 0.5, d: 1, warna: '#efe6d2', truss: true, tembus: true });
  for (let k = 0; k < 9; k++) d.kotak({ x, y: y + 1.7 + k * 2.1, z: z - 1.5, w: 4.2, h: 0.4, d: 1.2, warna: '#b9c2d3', hiasan: true });
  titik.push({ x, y, z: z - 1, st: 4, jalan: true }); titik.push({ x, y: y + tinggi, z: z - 4, st: 4, jalan: true });
  z -= 6; y += tinggi; lompat(5); z -= 6; titikSemak(5, x, y, z, w); z -= 6;

  // 6 blok hilang
  stage2 = 5; w = PAL[5];
  for (let k = 0; k < 6; k++) {
    lompat(5); const zz = z - 3, xx = x + (k % 3 - 1) * 5;
    const b = d.kotak({ x: xx, y, z: zz, w: 6, h: 1.5, d: 6, warna: w, dinamik: true, lutsinar: true, onSentuh: () => { if (b.tHilang === undefined) { b.tHilang = 0.85; bunyi('hilang'); } } });
    d.ubah.push((dt) => { if (b.tHilang === undefined) return; b.tHilang -= dt; const op = b.tHilang > 0 ? Math.max(0.15, b.tHilang / 0.85) : 0; b.mesh.material.forEach((m) => { m.opacity = op; }); if (b.tHilang <= 0 && b.aktif) { b.aktif = false; b.mesh.visible = false; } if (b.tHilang < -2.4) { b.aktif = true; b.mesh.visible = true; b.tHilang = undefined; b.mesh.material.forEach((m) => { m.opacity = 1; }); b._kena = false; } });
    titik.push({ x: xx, y, z: zz, st: 5, jatuh: true }); z -= 6;
  }
  lompat(5); z -= 6; titikSemak(6, x, y, z, w); z -= 6;

  // 7 palang berputar
  stage2 = 6; w = PAL[6]; lompat(4);
  for (let k = 0; k < 2; k++) {
    const zz = z - 15; d.kotak({ x, y, z: zz, w: 30, h: 2, d: 30, warna: w });
    const pal = new THREE.Mesh(new THREE.BoxGeometry(25, 1.1, 1.1), new THREE.MeshBasicMaterial({ color: MERAH })); pal.position.set(x, y + 1.6, zz); d.grup.add(pal);
    d.kotak({ x, y: y + 3.2, z: zz, w: 2.4, h: 3.2, d: 2.4, warna: '#22324f' });
    spinner.push({ m: pal, x, y: y + 1.6, z: zz, laju: k ? -1.45 : 1.25, panjang: 12.5, sudut: k * 1.2 });
    titik.push({ x: x + 14.2, y, z: zz + 12, st: 6, jatuh: true }); titik.push({ x: x + 14.2, y, z: zz - 12, st: 6, jalan: true });
    z -= 30; if (!k) lompat(4);
  }
  lompat(5); z -= 6; titikSemak(7, x, y, z, w); z -= 6;

  // 8 pintu jawapan
  stage2 = 7; w = PAL[0]; lompat(1);
  d.kotak({ x, y, z: z - 15, w: 36, h: 2, d: 30, warna: '#efe6d2', warnaAtas: '#cfd6e2' });
  pintuJawapan(x, y, z - 15, 1, w, 7);
  z -= 30; lompat(5); z -= 6; titikSemak(8, x, y, z, w); z -= 6;

  // 9 konveyor
  stage2 = 8; w = PAL[1]; lompat(1);
  const panj = 44; d.kotak({ x, y, z: z - panj / 2, w: 8, h: 2, d: panj, warna: '#22324f', warnaAtas: '#3a4a68', konveyor: [0, 8.5] });
  const xK = x, yK = y;
  for (let k = 0; k < 7; k++) d.kotak({ x: xK, y: yK + 0.06, z: z - 2 - k * 6.2, w: 6, h: 0.05, d: 1, warna: '#d9b25f', neon: true, hiasan: true, gerak: (tt) => [xK, yK + 0.06, z0k(k, tt)] });
  function z0k(k, tt) { return zK - 2 - ((k * 6.2 - tt * 8.5) % panj + panj) % panj; }
  const zK = z;
  titik.push({ x, y, z: z - panj, st: 8, jalan: true });
  z -= panj; lompat(5); z -= 6; titikSemak(9, x, y, z, w); z -= 6;

  // 10 pad lompat
  stage2 = 9; w = PAL[2];
  for (let k = 0; k < 3; k++) {
    lompat(4); const zz = z - 3; d.kotak({ x, y, z: zz, w: 7, h: 2, d: 7, warna: w });
    d.kotak({ x, y: y + 0.5, z: zz, w: 4, h: 0.5, d: 4, warna: '#7dff8a', neon: true, lompat: 92, tembus: true });
    z -= 6; y += 13; lompat(9); titik.push({ x, y: y - 13, z: zz, st: 9, jatuh: true, pad: true });
    if (k < 2) { d.kotak({ x, y, z: z - 3, w: 7, h: 2, d: 7, warna: w }); titik.push({ x, y, z: z - 3, st: 9, jatuh: true }); z -= 6; }
  }
  z -= 6; titikSemak(10, x, y, z, w); z -= 6;

  // 11 alang tipis
  stage2 = 10; w = PAL[3]; lompat(4);
  const zig = [8, -8, 8, -8];
  let xNow = x;
  zig.forEach((dx, k) => {
    const pjg = 18, zz = z - pjg / 2; xNow += dx * 0.5; d.kotak({ x: xNow, y, z: zz, w: 2, h: 1.2, d: pjg, warna: w }); titik.push({ x: xNow, y, z: z - 1, st: 10, jatuh: true }); titik.push({ x: xNow, y, z: z - pjg + 1, st: 10, jalan: true }); z -= pjg + 4; xNow += dx * 0.5 - dx * 0.5;
  });
  x = xNow; z += 4; lompat(5); z -= 6; titikSemak(11, x, y, z, w); z -= 6;

  // 12 jambatan jawapan 2
  stage2 = 11; w = PAL[4];
  for (let k = 0; k < 3; k++) { lompat(5.5); z -= 3.2; barisJawapan(x, y, z, 1, w, 11); z -= 3.2; }
  lompat(5.5); z -= 6; titikSemak(12, x, y, z, w); z -= 6;

  // 13 tembok merah bergerak
  stage2 = 12; w = PAL[5]; lompat(1);
  const pj = 54; d.kotak({ x, y, z: z - pj / 2, w: 22, h: 2, d: pj, warna: w });
  for (let k = 0; k < 4; k++) {
    const zz = z - 9 - k * 12, kel = k % 2 ? 1 : -1, x0 = x, y0 = y, f = k * 0.8;
    d.kotak({ x: x0, y: y0 + 6, z: zz, w: 9, h: 6, d: 2, warna: MERAH, neon: true, bunuh: true, gerak: (tt) => [x0 + Math.sin(tt * 1.15 + f) * 8.5 * kel, y0 + 6, zz] });
    titik.push({ x: x + 9, y, z: zz + 3.2, st: 12, jalan: true }); titik.push({ x: x + 9, y, z: zz - 3.2, st: 12, jalan: true });
  }
  z -= pj; lompat(5); z -= 6; titikSemak(13, x, y, z, w); z -= 6;

  // 14 lif + blok gerak
  stage2 = 13; w = PAL[6]; const yAwal = y;
  for (let k = 0; k < 4; k++) {
    lompat(5.5); const zz = z - 4, y0 = yAwal + k * 3.2, f = k * 1.3, xx = x + (k % 2 ? 5 : -5);
    const b = d.kotak({ x: xx, y: y0, z: zz, w: 7, h: 1.5, d: 8, warna: w, gerak: () => [xx, y0 + Math.sin(d.t * 1.3 + f) * 2.4, zz] });
    titik.push({ part: b, st: 13, jatuh: true }); z -= 8;
  }
  y = yAwal + 12; lompat(5); z -= 6; titikSemak(14, x, y, z, w); z -= 6;

  // 15 pintu terakhir + bilik juara
  stage2 = 14; w = PAL[0]; lompat(1);
  d.kotak({ x, y, z: z - 15, w: 36, h: 2, d: 30, warna: '#efe6d2', warnaAtas: '#cfd6e2' });
  pintuJawapan(x, y, z - 15, 2, '#d9b25f', 14);
  z -= 30; lompat(1); z -= 7; titikSemak(J, x, y, z, '#d9b25f');
  // podium piala
  const zP = z - 26;
  d.kotak({ x, y, z: zP + 4, w: 54, h: 3, d: 40, warna: '#22324f', warnaAtas: '#d9b25f' });
  d.kotak({ x, y: y + 3, z: zP - 6, w: 10, h: 3, d: 8, warna: '#efe6d2' });
  const piala = new THREE.Group(), mE = new THREE.MeshStandardMaterial({ color: '#e8bd5a', metalness: 0.6, roughness: 0.3, emissive: '#6a4a10', emissiveIntensity: 0.5 });
  const c1 = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 0.8, 3, 16), mE); c1.position.y = 4; piala.add(c1);
  const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.6, 8), mE); c2.position.y = 1.8; piala.add(c2);
  const c3 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), mE); c3.position.y = 1; piala.add(c3);
  piala.position.set(x, y + 3, zP - 6); d.grup.add(piala); d.ubah.push((dt) => { piala.rotation.y += dt * 1.2; });
  d.papan([{ t: t('JUARA OBBY', 'OBBY CHAMPION', 'JUARA OBBY'), c: '#d9b25f' }], x, y + 15, zP - 6, 22, { w: 640, h: 130 });
  titik.push({ x, y, z: zP + 2, st: J, jalan: true });

  // syiling bonus
  for (let i = 3; i < titik.length; i += 4) { const q = titik[i]; if (!q.part) d.syiling(q.x, q.y + 3.2, q.z, 1, () => { tambahCbux(1); }); }

  // bot
  if (!d.pratonton) {
    const mula = [0, 0, 6, 16, 28];
    for (let i = 0; i < 5; i++) {
      const b = new Bot(d, i * 3 + 1, { titik, mula: Math.min(titik.length - 2, mula[i] + Math.floor(Math.random() * 4)), malas: 1 + i * 0.3, gagal: 0.05 + i * 0.015, ulang: 0 });
      d.bots.push(b);
    }
  } else {
    // pratonton: letak beberapa pemain
    for (let i = 0; i < 4; i++) { const q = titik[[2, 4, 6, 8][i]]; if (q && !q.part) d.bots.push(new Bot(d, i + 2, { x: q.x, y: q.y, z: q.z })); }
    for (const p of [titik[2], titik[3]]) if (p && !p.part) d.bots.push(new Bot(d, 7, { x: p.x + 1, y: p.y, z: p.z }));
  }
}

/* ---------- kemas ---------- */
const _a = new THREE.Vector3();
function kemas(dt, tt) {
  kemasJambatan(dt);
  const P = E.P; if (!P) return;
  // palang berputar
  for (const s of spinner) {
    s.sudut += s.laju * dt; s.m.rotation.y = s.sudut;
    if (P.mati || P.kebal > 0) continue;
    const dx = P.pos.x - s.x, dz = P.pos.z - s.z, cs = Math.cos(s.sudut), sn = Math.sin(s.sudut);
    const lx = dx * cs - dz * sn, lz = dx * sn + dz * cs;
    if (Math.abs(lx) < s.panjang + 0.9 && Math.abs(lz) < 1.4 && P.pos.y < s.y + 0.55 && P.pos.y + 5 > s.y - 0.55) bunuhPemain();
  }
  // soalan semasa di HUD
  let dekat = null, jd = 40;
  for (const B of jambatan) if (!B.siap) { const j = Math.hypot(P.pos.z - B.z, P.pos.y - B.y); if (j < jd) { jd = j; dekat = B.q; } }
  for (const G of pintu) if (!G.buka) { const j = Math.hypot(P.pos.z - G.pintu[0].z, P.pos.y - G.pintu[0].y); if (j < jd) { jd = j; dekat = G.q; } }
  if (dekat !== lawat) { lawat = dekat; E.ui.soalanSemasa?.(dekat ? teksSoal(dekat) : null); }
  // pemain lain: stage ikut titik
  for (const b of D.bots) b.statistik.stage = titik[Math.min(b.ti, titik.length - 1)].st ?? 0;
  // sembang
  sembang(dt);
}
const CAKAP = [['jom cepat!', 'come on!', 'ayo cepat!'], ['susah la peringkat ni', 'this stage is hard', 'susah nih tahapnya'], ['wah hampir jatuh', 'whoa almost fell', 'wah hampir jatuh'], ['gg', 'gg', 'gg'], ['siapa nak lawan?', 'who wants to race?', 'siapa mau lomba?'], ['kira dulu baru lompat', 'solve first, then jump', 'hitung dulu baru lompat'], ['saya dah hafal sifir 7', "i know my 7 times table now", 'aku udah hafal perkalian 7']];
let tSembang = 8;
function sembang(dt) { tSembang -= dt; if (tSembang > 0 || !D.bots.length) return; tSembang = 7 + Math.random() * 14; const b = D.bots[Math.floor(Math.random() * D.bots.length)], teks = tx(CAKAP[Math.floor(Math.random() * CAKAP.length)]); b.cakap(teks); E.ui.chat?.(b.nama, teks); }

export const OBBY = {
  id: 'obby', tema: 'obby', langit: ['#4f97e0', '#d9eefc', [200, 700]], cahaya: [1.5, 2.6],
  pratonton: { p: [24, 22, -24], t: [0, 2, -66] },
  bina,
  kemas,
  mula() { // sambung dari peringkat tersimpan? mula dari lobi, tawaran di HUD
    lawat = 0;
    const s = S.x.obby.stage; if (s > 0 && s < J && cek[s]) { balikStage(s); stage = s; E.P.pos.set(cek[s].x, cek[s].y + 0.05, cek[s].z); E.ui.toast?.(t(`Sambung dari peringkat ${s}`, `Continuing from stage ${s}`, `Lanjut dari tahap ${s}`), 'emas'); }
    E.ui.banner?.(t('Peringkat ', 'Stage ', 'Tahap ') + stage + ' / ' + J);
  },
  onMati() {
    nyawaStage++;
    if (nyawaStage === 5) E.ui.tawarLangkau?.(async () => { stage = Math.min(J - 1, stage + 1); S.x.obby.stage = Math.max(S.x.obby.stage, stage); simpan(); balikStage(stage); bukaPintuAntara(); E.ui.segar?.(); nyawaStage = 0; });
  },
  selepasMuncul() { setSemulaJambatan(); E.ui.segar?.(); },
  statistik() { return [{ k: t('Peringkat', 'Stage', 'Tahap'), v: stage }, { k: t('Menang', 'Wins', 'Menang'), v: S.x.obby.menang }]; },
  statistikBot(b) { return [b.statistik.stage || 0, Math.floor(b.nama.length / 4)]; },
  keluar() { E.ui.soalanSemasa?.(null); },
  /* kait uji */
  uji: { titik: () => titik, titikSemak: () => cek, jambatan: () => jambatan, pintu: () => pintu, stage: () => stage, jawabPetak: (B, betul) => { const i = B.petak.findIndex((p) => (p.nilai === B.q.ans) === betul); injak(B, i); }, ketuk: (P, betul) => { const i = P.pintu.findIndex((p) => (p.nilai === P.q.ans) === betul); ketuk(P, i); } }
};
function bukaPintuAntara() { for (const P of pintu) if (P.st < stage && !P.buka) { P.buka = true; P.pintu.forEach((b) => D.setAktif(b, false)); } for (const B of jambatan) if (B.st < stage) B.siap = true; }
