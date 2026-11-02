/* Tycoon Kedai: mesin titis, konveyor, kutip wang, pijak butang untuk beli (jawab soalan dulu). */
import * as THREE from 'three';
import { E, Bot } from './08-enjin.js';
import { S, simpan, tambahCbux, beriLencana } from './05-simpan.js';
import { t, tx, nombor } from './01-teks.js';
import { tukarTeks } from './06-bahan.js';
import { bunyi } from './04-bunyi.js';

let D, kubus, pengumpul, padUI, papanWang, gandaZ, tMesin, tDrop, gMesinSoal;
const SENARAI = [
  { id: 'd1', n: ['Mesin Titis 1', 'Dropper 1', 'Mesin Tetes 1'], h: 0 },
  { id: 'd2', n: ['Mesin Titis 2', 'Dropper 2', 'Mesin Tetes 2'], h: 25 },
  { id: 'g1', n: ['Penaik Nilai ×2', 'Upgrader ×2', 'Penaik Nilai ×2'], h: 60 },
  { id: 'd3', n: ['Mesin Titis 3', 'Dropper 3', 'Mesin Tetes 3'], h: 120 },
  { id: 'dinding', n: ['Dinding Kedai', 'Shop Walls', 'Dinding Toko'], h: 180 },
  { id: 'd4', n: ['Mesin Titis 4', 'Dropper 4', 'Mesin Tetes 4'], h: 300 },
  { id: 'kaunter', n: ['Kaunter + Rak', 'Counter + Shelves', 'Kasir + Rak'], h: 450 },
  { id: 'g2', n: ['Penaik Nilai ×3', 'Upgrader ×3', 'Penaik Nilai ×3'], h: 700 },
  { id: 'tingkat', n: ['Tingkat 2 + Tangga', 'Floor 2 + Stairs', 'Lantai 2 + Tangga'], h: 1000 },
  { id: 'd5', n: ['Mesin Mega', 'Mega Dropper', 'Mesin Mega'], h: 1500 },
  { id: 'atap', n: ['Atap + Neon', 'Roof + Neon', 'Atap + Neon'], h: 2200 },
  { id: 'bendera', n: ['Menara Bendera', 'Flag Tower', 'Menara Bendera'], h: 3000 }
];
const DROP = { d1: { x: -5.6, z: 26, nilai: 1, warna: '#d8714f' }, d2: { x: 5.6, z: 26, nilai: 2, warna: '#f2c14e' }, d3: { x: -5.6, z: 14, nilai: 3, warna: '#a3b86c' }, d4: { x: 5.6, z: 14, nilai: 5, warna: '#7f9fd9' }, d5: { x: -6.5, z: 2, nilai: 12, warna: '#8a78b8', besar: true } };
const ada = (id) => S.x.tycoon.beli.includes(id);

function timbul(meshParts) { for (const p of meshParts) if (p.mesh) { p.mesh.scale.setScalar(0.01); let k = 0; const f = (dt) => { k = Math.min(1, k + dt * 3.5); const e = 1 - Math.pow(1 - k, 3); p.mesh.scale.setScalar(e + Math.sin(k * Math.PI) * 0.12); if (k >= 1) { p.mesh.scale.setScalar(1); D.ubah.splice(D.ubah.indexOf(f), 1); } }; D.ubah.push(f); } }
function pasang(id, baru) {
  const k = (o) => D.kotak({ dinamik: true, ...o }), parts = [];
  const P = (o) => { const p = k(o); parts.push(p); return p; };
  if (DROP[id]) {
    const c = DROP[id], arah = c.x < 0 ? 1 : -1, b = c.besar ? 1.5 : 1;
    P({ x: c.x - arah * 0.2, y: 9 * b, z: c.z, w: 2.4 * b, h: 9 * b, d: 2.4 * b, warna: '#22324f' });
    P({ x: c.x + arah * 3, y: 9 * b + 0.6, z: c.z, w: 6, h: 1.6 * b, d: 2.4 * b, warna: c.warna });
    P({ x: c.x + arah * 5.2, y: 8.6 * b, z: c.z, w: 1.6, h: 1.4, d: 1.6, warna: '#efe6d2' });
  }
  if (id === 'g1' || id === 'g2') {
    const z = id === 'g1' ? -4 : -13, w = id === 'g1' ? '#7dd0ff' : '#ff9ad0';
    P({ x: -4.2, y: 8, z, w: 1.2, h: 8, d: 1.6, warna: '#22324f' }); P({ x: 4.2, y: 8, z, w: 1.2, h: 8, d: 1.6, warna: '#22324f' }); P({ x: 0, y: 9, z, w: 9.6, h: 1.4, d: 1.6, warna: '#22324f' });
    P({ x: 0, y: 7.6, z, w: 7.2, h: 5.2, d: 0.2, warna: w, neon: true, hiasan: true });
  }
  if (id === 'dinding') {
    for (const [x, z, w, d] of [[-34, 0, 2, 76], [34, 0, 2, 76], [-20, -38, 30, 2], [20, -38, 30, 2], [-22, 38, 26, 2], [22, 38, 26, 2]]) P({ x, y: 14, z, w, h: 14, d, warna: '#efe6d2', warnaAtas: '#d9b25f' });
    P({ x: 0, y: 14, z: -38, w: 10, h: 5, d: 2, warna: '#efe6d2' }); P({ x: 0, y: 14, z: 38, w: 18, h: 4, d: 2, warna: '#efe6d2' });
  }
  if (id === 'kaunter') {
    P({ x: -24, y: 3.4, z: -24, w: 12, h: 3.4, d: 4, warna: '#6d4a2a', warnaAtas: '#d9b25f' });
    for (let i = 0; i < 3; i++) { P({ x: -30, y: 2 + i * 3, z: -6 + i * 0, w: 4, h: 0.6, d: 16, warna: '#6d4a2a' }); for (let j = 0; j < 4; j++) P({ x: -30, y: 3.3 + i * 3, z: -12 + j * 4, w: 2.2, h: 1.3, d: 2.2, warna: ['#d8714f', '#f2c14e', '#7f9fd9', '#a3b86c'][(i + j) % 4] }); }
  }
  if (id === 'tingkat') {
    P({ x: 22, y: 15, z: 0, w: 22, h: 1, d: 76, warna: '#22324f', warnaAtas: '#7f9fd9' }); P({ x: -22, y: 15, z: -16, w: 22, h: 1, d: 44, warna: '#22324f', warnaAtas: '#7f9fd9' }); P({ x: 0, y: 15, z: -26, w: 22, h: 1, d: 24, warna: '#22324f', warnaAtas: '#7f9fd9' });
    for (let i = 0; i < 13; i++) P({ x: -27, y: 1 + 1.08 * (i + 1), z: 34 - i * 2.2, w: 7, h: 1.08, d: 2.2, warna: '#efe6d2' });
  }
  if (id === 'atap') {
    P({ x: 0, y: 30, z: 0, w: 72, h: 1.4, d: 80, warna: '#d8714f' }); for (const [x, z] of [[-33, -37], [33, -37], [-33, 37], [33, 37]]) P({ x, y: 29, z, w: 2, h: 14, d: 2, warna: '#efe6d2' });
    for (let i = 0; i < 5; i++) P({ x: -24 + i * 12, y: 28.4, z: 39.6, w: 8, h: 1, d: 0.4, warna: ['#d9b25f', '#ff9ad0', '#7dd0ff'][i % 3], neon: true, hiasan: true });
  }
  if (id === 'bendera') {
    P({ x: 0, y: 52, z: 0, w: 2, h: 22, d: 2, warna: '#efe6d2' }); const f = P({ x: 5, y: 51, z: 0, w: 8, h: 5, d: 0.4, warna: '#d9b25f' });
    if (baru) { S.x.tycoon.siap = true; simpan(); beriLencana('tycoon'); tambahCbux(40); bunyi('menang'); E.P.sorak = 6; E.ui.konfeti?.(); E.ui.toast?.(t('Kedai siap sepenuhnya! +40 CBux', 'Shop fully complete! +40 CBux', 'Toko selesai sepenuhnya! +40 CBux'), 'emas'); }
  }
  if (baru) timbul(parts);
}

function bina(d) {
  D = d; kubus = []; pengumpul = 0; tDrop = {}; tMesin = 0; padUI = [];
  d.lantaiMati = -60; d.awan(30, 500, 110, 220);
  d.kotak({ x: 0, y: 0, z: 0, w: 900, h: 4, d: 900, warna: '#6a5a44', warnaAtas: '#5fa35e' });
  // jalan & plot
  d.kotak({ x: 0, y: 0.1, z: 70, w: 400, h: 0.1, d: 14, warna: '#3e4656', hiasan: true });
  d.kotak({ x: 0, y: 1, z: 0, w: 72, h: 1, d: 80, warna: '#22324f', warnaAtas: '#cfd6e2' });
  // konveyor utama
  const yK = 2.4;
  d.kotak({ x: 0, y: yK, z: 3, w: 7, h: 1.4, d: 50, warna: '#22324f', warnaAtas: '#3a4a68', konveyor: [0, -9] });
  for (const s of [-1, 1]) d.kotak({ x: s * 3.8, y: yK + 0.5, z: 3, w: 0.6, h: 1.9, d: 50, warna: '#d9b25f' });
  for (let i = 0; i < 8; i++) { const zb = i; d.kotak({ x: 0, y: yK + 0.04, z: 0, w: 6, h: 0.05, d: 0.8, warna: '#d9b25f', neon: true, hiasan: true, gerak: (tt) => [0, yK + 0.04, 28 - ((zb * 6.2 + tt * 9) % 50)] }); }
  // relau pengumpul
  d.kotak({ x: 0, y: 9, z: -25.5, w: 11, h: 8, d: 6, warna: '#22324f' }); d.kotak({ x: 0, y: 5.4, z: -22.4, w: 7, h: 4, d: 0.2, warna: '#f0642a', neon: true, hiasan: true });
  papanWang = d.papan([{ t: '$0', c: '#d9b25f' }], 0, 13, -25, 12, { w: 360, h: 90 });
  // pad kutip
  d.kotak({ x: 11, y: 1.3, z: -24, w: 8, h: 0.3, d: 8, warna: '#d9b25f', neon: true, tembus: true, onSentuh: kutip });
  d.papan([{ t: t('KUTIP WANG', 'COLLECT CASH', 'AMBIL UANG'), c: '#d9b25f' }], 11, 7.5, -24, 9, { w: 340, h: 80 });
  // mesin soalan: bonus wang
  d.kotak({ x: -14, y: 5, z: 28, w: 6, h: 4, d: 4, warna: '#7f9fd9' }); d.kotak({ x: -14, y: 1.3, z: 22.5, w: 7, h: 0.3, d: 5, warna: '#7dd0ff', neon: true, tembus: true, onSentuh: mesinSoal });
  gMesinSoal = d.papan([{ t: t('MESIN SOALAN', 'QUIZ MACHINE', 'MESIN SOAL'), c: '#7dd0ff' }, { t: t('Betul = bonus wang', 'Correct = cash bonus', 'Benar = bonus uang'), s: 0.7, b: false }], -14, 9.5, 27, 11, { w: 380, h: 130 });
  // deretan butang
  SENARAI.forEach((it, i) => {
    if (i === 0) return;
    const baris = i - 1, x = 16 + (baris % 2) * 11, z = 30 - Math.floor(baris / 2) * 11;
    const p = d.kotak({ x, y: 1.35, z, w: 6.4, h: 0.35, d: 6.4, warna: '#7dff8a', neon: true, tembus: true, dinamik: true, onSentuh: () => cubaBeli(it, p) });
    const lab = d.papan([{ t: tx(it.n), s: 0.8 }, { t: '$' + nombor(it.h), c: '#7dff8a' }], x, 6, z, 10, { w: 420, h: 140 });
    padUI.push({ it, p, lab, i });
  });
  // plot jiran (bot)
  for (const s of [-1, 1]) {
    d.kotak({ x: s * 112, y: 1, z: 0, w: 72, h: 1, d: 80, warna: '#22324f', warnaAtas: '#cfd6e2' });
    for (const [x, z, w, dd] of [[-34, 0, 2, 76], [34, 0, 2, 76], [-16, -38, 36, 2], [18, 38, 30, 2]]) d.kotak({ x: s * 112 + x, y: 14, z, w, h: 14, d: dd, warna: s < 0 ? '#f19bb4' : '#a3b86c', warnaAtas: '#d9b25f' });
    d.kotak({ x: s * 112, y: 2.4, z: 3, w: 7, h: 1.4, d: 50, warna: '#22324f', warnaAtas: '#3a4a68' });
    d.kotak({ x: s * 112, y: 30, z: 0, w: 72, h: 1.4, d: 80, warna: s < 0 ? '#8a78b8' : '#d8714f' });
    for (const [x, z] of [[-33, -37], [33, -37], [-33, 37], [33, 37]]) d.kotak({ x: s * 112 + x, y: 29, z, w: 2, h: 14, d: 2, warna: '#efe6d2' });
  }
  for (const [x, z] of [[-60, 60], [60, 60], [-60, -60], [60, -60], [-50, 84], [50, 86], [-160, 84], [160, 84], [0, 100], [20, 104], [-20, 108]]) d.pokok(x, 0, z, 1.2);
  d.spawn = { x: 0, y: 1, z: 52, yaw: 0 };
  if (!ada('d1')) S.x.tycoon.beli.push('d1');
  for (const id of S.x.tycoon.beli) pasang(id, false);
  segarPad();
  if (d.pratonton) { for (const id of ['d2', 'd3', 'g1']) if (!ada(id)) pasang(id, false); for (let i = 0; i < 2; i++) d.bots.push(new Bot(d, i + 5, { x: -12 + i * 16, y: 1, z: 30 - i * 6 })); return; }
  for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1; const b = new Bot(d, i * 3 + 2, { x: s * 112, y: 1, z: 10, kawasan: { x: s * 112, z: 8, w: 40, d: 44 } }); b.statistik.wang = 200 + Math.floor(Math.random() * 3000); d.bots.push(b); }
  d.bots.push(new Bot(d, 12, { x: 0, y: 0, z: 62, kawasan: { x: 0, z: 70, w: 120, d: 10 } }));
  d.bots[4].statistik.wang = 90;
}
function segarPad() {
  const pertama = SENARAI.findIndex((it) => !ada(it.id));
  for (const u of padUI) {
    const nampak = !ada(u.it.id) && u.i <= pertama + 1;
    D.setAktif(u.p, nampak); u.lab.visible = nampak;
  }
}
async function cubaBeli(it, p) {
  if (!p.aktif || E.P.mati || p.sibuk) return;
  const T = S.x.tycoon;
  if (T.wang < it.h) { bunyi('salah', 300); E.ui.toast?.(t(`Perlu $${nombor(it.h - T.wang)} lagi. Kutip wang atau guna Mesin Soalan.`, `Need $${nombor(it.h - T.wang)} more. Collect cash or use the Quiz Machine.`, `Butuh $${nombor(it.h - T.wang)} lagi. Ambil uang atau pakai Mesin Soal.`), 'amaran'); return; }
  p.sibuk = true;
  const ok = await E.ui.tanya({ tier: Math.min(3, Math.floor(SENARAI.indexOf(it) / 4)), tajuk: t('Beli: ', 'Buy: ', 'Beli: ') + tx(it.n), nota: t(`Harga $${nombor(it.h)}. Jawab betul untuk beli.`, `Price $${nombor(it.h)}. Answer correctly to buy.`, `Harga $${nombor(it.h)}. Jawab benar untuk beli.`) });
  p.sibuk = false; if (E.dunia !== D) return;
  if (!ok) { p._kena = false; E.P.pos.x -= 4; return; }
  T.wang -= it.h; T.beli.push(it.id); simpan(); bunyi('beli'); pasang(it.id, true); segarPad(); E.ui.segar?.(); tambahCbux(2);
  E.ui.toast?.(tx(it.n) + t(' dibeli! +2 CBux', ' bought! +2 CBux', ' dibeli! +2 CBux'), 'ok');
  if (T.beli.length >= 6) beriLencana('tycoon1');
}
function kutip() {
  const T = S.x.tycoon; if (pengumpul <= 0) { bunyi('tap'); return; }
  T.wang += pengumpul; E.ui.toast?.('+$' + nombor(pengumpul), 'emas'); pengumpul = 0; bunyi('koin'); simpan(); E.ui.segar?.(); tukarTeks(papanWang.userData.tx, [{ t: '$0', c: '#d9b25f' }]);
}
async function mesinSoal(b) {
  if (tMesin > 0 || E.P.mati) { if (tMesin > 0) E.ui.toast?.(t(`Mesin sejuk: ${Math.ceil(tMesin)} s`, `Cooling down: ${Math.ceil(tMesin)} s`, `Mesin dingin: ${Math.ceil(tMesin)} s`), 'amaran'); return; }
  tMesin = 3;
  const bonus = 8 + S.x.tycoon.beli.length * S.x.tycoon.beli.length * 3;
  const ok = await E.ui.tanya({ tier: Math.min(3, Math.floor(S.x.tycoon.beli.length / 4)), tajuk: t('Mesin Soalan', 'Quiz Machine', 'Mesin Soal'), nota: t(`Betul = +$${bonus}`, `Correct = +$${bonus}`, `Benar = +$${bonus}`) });
  if (E.dunia !== D) return;
  if (ok) { S.x.tycoon.wang += bonus; tMesin = 1; simpan(); E.ui.toast?.('+$' + bonus, 'emas'); E.ui.segar?.(); }
  b._kena = true;
}
const geoKub = new THREE.BoxGeometry(1.4, 1.4, 1.4); geoKub.userData.kongsi = true;
const matKub = {};
function kemas(dt) {
  tMesin = Math.max(0, tMesin - dt);
  for (const id in DROP) {
    if (!ada(id)) continue;
    tDrop[id] = (tDrop[id] || Math.random()) - dt;
    if (tDrop[id] <= 0 && kubus.length < 50) {
      tDrop[id] = DROP[id].besar ? 2.4 : 1.7; const c = DROP[id];
      matKub[c.warna] ||= Object.assign(new THREE.MeshStandardMaterial({ color: c.warna, roughness: 0.5 }), { userData: { kongsi: true } });
      const m = new THREE.Mesh(geoKub, matKub[c.warna]); const s = c.besar ? 1.6 : 1; m.scale.setScalar(s); m.castShadow = true;
      const bx = c.x < 0 ? 0 : 0; m.position.set(bx + (c.x < 0 ? -1.4 : 1.4), 7, c.z); D.grup.add(m);
      kubus.push({ m, vy: 0, nilai: c.nilai, g1: false, g2: false, turun: true, y: 7, s });
    }
  }
  for (let i = kubus.length - 1; i >= 0; i--) {
    const k = kubus[i], lantai = 2.4 + 0.7 * k.s;
    if (k.turun) { k.vy -= 60 * dt; k.m.position.y += k.vy * dt; if (k.m.position.y <= lantai) { k.m.position.y = lantai; k.turun = false; } }
    else {
      k.m.position.z -= 9 * dt; k.m.rotation.y += dt;
      if (!k.g1 && ada('g1') && k.m.position.z < -4) { k.g1 = true; k.nilai *= 2; bunyi('tap', 120); k.m.scale.multiplyScalar(1.12); }
      if (!k.g2 && ada('g2') && k.m.position.z < -13) { k.g2 = true; k.nilai *= 3; bunyi('tap', 120); k.m.scale.multiplyScalar(1.12); }
      if (k.m.position.z < -21.5) { pengumpul += k.nilai; D.grup.remove(k.m); kubus.splice(i, 1); tukarTeks(papanWang.userData.tx, [{ t: '$' + nombor(pengumpul), c: '#d9b25f' }]); }
    }
  }
  for (const b of D.bots) if (b.statistik.wang !== undefined) b.statistik.wang += dt * 3.2;
  sembang(dt);
}
const CAKAP = [['kedai saya dah ada atap', 'my shop has a roof now', 'tokoku sudah punya atap'], ['jangan lupa kutip wang', "don't forget to collect", 'jangan lupa ambil uang'], ['mesin soalan bagi banyak wang', 'the quiz machine pays well', 'mesin soal kasih banyak uang'], ['wah kedai awak cantik', 'nice shop!', 'wah tokomu bagus'], ['12 x 5 = 60, senang', '12 x 5 = 60, easy', '12 x 5 = 60, gampang']];
let tS = 6;
function sembang(dt) { tS -= dt; if (tS > 0) return; tS = 8 + Math.random() * 14; const b = D.bots[Math.floor(Math.random() * D.bots.length)], x = tx(CAKAP[Math.floor(Math.random() * CAKAP.length)]); b.cakap(x); E.ui.chat?.(b.nama, x); }

export const TYCOON = {
  id: 'tycoon', tema: 'tycoon', langit: ['#5ba4e6', '#e4f3fd', [220, 800]], cahaya: [1.5, 2.6],
  pratonton: { p: [44, 30, 62], t: [0, 6, 2] },
  bina, kemas,
  mula() { E.ui.banner?.(t('Tycoon Kedai', 'Shop Tycoon', 'Tycoon Toko')); E.ui.info?.(t('Kutip wang di pad emas, kemudian pijak butang hijau', 'Collect at the gold pad, then step on green buttons', 'Ambil uang di pad emas, lalu injak tombol hijau')); setTimeout(() => E.ui.info?.(''), 8000); },
  statistik() { return [{ k: t('Wang', 'Cash', 'Uang'), v: '$' + nombor(S.x.tycoon.wang) }, { k: t('Barang', 'Items', 'Barang'), v: S.x.tycoon.beli.length }]; },
  statistikBot(b) { return ['$' + nombor(b.statistik.wang || 0), Math.min(12, Math.floor((b.statistik.wang || 0) / 300) + 1)]; },
  keluar() { E.ui.info?.(''); },
  uji: { senarai: SENARAI, pengumpul: () => pengumpul, kutip, cubaBeli: (i) => { const u = padUI.find((x) => x.i === i); return cubaBeli(u.it, u.p); }, mesinSoal: () => mesinSoal({}) }
};
