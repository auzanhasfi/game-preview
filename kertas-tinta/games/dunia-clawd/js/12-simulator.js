/* Simulator Bintang: pecahkan kristal, isi beg, jual, naik taraf, tetaskan telur (soalan), buka zon (soalan), lahir semula. */
import * as THREE from 'three';
import { E, Bot, buatPet } from './08-enjin.js';
import { S, simpan, tambahCbux, beriLencana } from './05-simpan.js';
import { t, tx, nombor } from './01-teks.js';
import { tukarTeks } from './06-bahan.js';
import { bunyi } from './04-bunyi.js';

const ZON = [
  { n: ['Padang Hijau', 'Green Field', 'Padang Hijau'], tanah: '#5fa35e', sisi: '#6a5a44', kristal: '#f2c14e', hp: 5, nilai: 1, h: 0 },
  { n: ['Pantai Senja', 'Sunset Beach', 'Pantai Senja'], tanah: '#e8d29a', sisi: '#b89a5a', kristal: '#f19bb4', hp: 26, nilai: 6, h: 300 },
  { n: ['Gunung Salji', 'Snow Mountain', 'Gunung Salju'], tanah: '#eef4fb', sisi: '#b8c6d8', kristal: '#7dd0ff', hp: 130, nilai: 30, h: 3000 },
  { n: ['Bulan Tinta', 'Ink Moon', 'Bulan Tinta'], tanah: '#3a3f60', sisi: '#22263e', kristal: '#b59ae8', hp: 700, nilai: 160, h: 30000 }
];
const PETS = [
  { id: 'kecil', n: ['Clawd Kecil', 'Little Clawd', 'Clawd Kecil'], w: '#d8714f', j: 'clawd', d: 1 },
  { id: 'daun', n: ['Clawd Daun', 'Leaf Clawd', 'Clawd Daun'], w: '#a3b86c', j: 'clawd', d: 2 },
  { id: 'kucing', n: ['Mochi', 'Mochi', 'Mochi'], w: '#ffffff', j: 'kucing', d: 4 },
  { id: 'langit', n: ['Clawd Langit', 'Sky Clawd', 'Clawd Langit'], w: '#7f9fd9', j: 'clawd', d: 9 },
  { id: 'sihir', n: ['Clawd Sihir', 'Wizard Clawd', 'Clawd Sihir'], w: '#8a78b8', j: 'sihir', d: 22 },
  { id: 'raja', n: ['Raja Clawd', 'King Clawd', 'Raja Clawd'], w: '#d9b25f', j: 'mahkota', d: 60 }
];
const TELUR = [
  { n: ['Telur Biasa', 'Common Egg', 'Telur Biasa'], w: '#efe6d2', h: 40, undi: ['kecil', 'kecil', 'daun', 'daun', 'kucing'] },
  { n: ['Telur Awan', 'Cloud Egg', 'Telur Awan'], w: '#7dd0ff', h: 800, undi: ['daun', 'kucing', 'kucing', 'langit', 'sihir'] },
  { n: ['Telur Emas', 'Golden Egg', 'Telur Emas'], w: '#d9b25f', h: 9000, undi: ['langit', 'langit', 'sihir', 'sihir', 'raja'] }
];
const LEBAR = 110, PANJANG = 110, Z0 = -28;
const hargaKuasa = (l) => Math.round(15 * Math.pow(1.7, l)), hargaBeg = (l) => Math.round(12 * Math.pow(1.65, l)), hargaLaju = (l) => Math.round(30 * Math.pow(2, l));
const kuasa = () => (1 + S.x.sim.kuasa * 1.5) * (1 + S.x.sim.lahir), muatan = () => 20 + S.x.sim.beg * 25, gandaLahir = () => 1 + S.x.sim.lahir;

let D, nod, kilauan, petM, papanG, tPukul, tJana, tOtomatis, papanPad;
const gKristal = new THREE.OctahedronGeometry(1, 0); gKristal.userData.kongsi = true;
const matK = {};
function bahanK(w) { return matK[w] ||= Object.assign(new THREE.MeshStandardMaterial({ color: w, roughness: 0.25, metalness: 0.15, emissive: w, emissiveIntensity: 0.25, flatShading: true }), { userData: { kongsi: true } }); }

function binaNod(zi, x, z) {
  const Z = ZON[zi], g = new THREE.Group(), besar = Math.random() < 0.18, sk = besar ? 2.6 : 1.7;
  const m = new THREE.Mesh(gKristal, bahanK(Z.kristal)); m.scale.set(sk, sk * 1.5, sk); m.position.y = sk * 1.4; m.castShadow = true; g.add(m);
  for (const [dx, dz, s] of [[sk * 0.9, 0.4, 0.5], [-sk * 0.8, -0.4, 0.42], [0.3, sk * 0.8, 0.36]]) { const c = new THREE.Mesh(gKristal, bahanK(Z.kristal)); c.scale.set(sk * s, sk * s * 1.5, sk * s); c.position.set(dx, sk * s * 1.3, dz); c.castShadow = true; g.add(c); }
  g.position.set(x, 0, z); D.grup.add(g);
  const k = besar ? 4 : 1, n = { g, m, x, z, zi, hp: Z.hp * k, hpMaks: Z.hp * k, nilai: Z.nilai * k, goyang: 0, sk }; g.userData.nod = n; nod.push(n); return n;
}
function bina(d) {
  D = d; nod = []; kilauan = []; petM = []; tPukul = 0; tJana = 0; tOtomatis = 0;
  d.lantaiMati = -60; d.awan(28, 500, 90, 200);
  // plaza
  d.kotak({ x: 0, y: 0, z: 30, w: LEBAR, h: 4, d: 80, warna: '#22324f', warnaAtas: '#cfd6e2' });
  d.kotak({ x: 0, y: 0.15, z: 34, w: 14, h: 0.15, d: 14, warna: '#d9b25f', hiasan: true });
  d.spawn = { x: 0, y: 0.1, z: 40, yaw: 0 };
  // zon
  papanG = [];
  ZON.forEach((Z, i) => {
    const zc = Z0 - 10 - PANJANG / 2 - i * (PANJANG + 10) + 10 * 0;
    d.kotak({ x: 0, y: 0, z: zc, w: LEBAR, h: 4, d: PANJANG, warna: Z.sisi, warnaAtas: Z.tanah });
    // jambatan + gerbang di hujung depan zon
    const zPintu = zc + PANJANG / 2 + 5;
    d.kotak({ x: 0, y: 0, z: zPintu, w: 22, h: 4, d: 10, warna: '#22324f', warnaAtas: '#efe6d2' });
    if (i > 0) {
      for (const s of [-1, 1]) d.kotak({ x: s * 9, y: 18, z: zPintu, w: 4, h: 18, d: 4, warna: '#22324f' });
      d.kotak({ x: 0, y: 22, z: zPintu, w: 22, h: 4, d: 4, warna: '#22324f', warnaAtas: '#d9b25f' });
      for (const s of [-1, 1]) d.kotak({ x: s * 40, y: 18, z: zPintu, w: 58, h: 22, d: 2, warna: '#efe6d2', hiasan: false, kaca: true, kamera: false });
      const g = d.kotak({ x: 0, y: 18, z: zPintu, w: 14, h: 18, d: 1.4, warna: Z.kristal, dinamik: true, lutsinar: true, onSentuh: () => cubaBukaZon(i, g) });
      g.mesh.material.forEach((m) => { m.opacity = 0.65; });
      const lab = d.papan([{ t: tx(Z.n), c: '#d9b25f' }, { t: '$' + nombor(Z.h), s: 0.85 }], 0, 26, zPintu + 2.4, 16, { w: 440, h: 170 });
      papanG[i] = { g, lab, h: Z.h };
      if (S.x.sim.zon >= i) { d.setAktif(g, false); tukarTeks(lab.userData.tx, [{ t: tx(Z.n), c: '#d9b25f' }]); }
    } else { d.kotak({ x: 0, y: 0, z: zPintu + 0, w: 22, h: 4, d: 10, warna: '#22324f', warnaAtas: '#efe6d2' }); }
    Z.zc = zc;
    // pokok & hiasan
    for (let k = 0; k < 8; k++) {
      const x = (k % 2 ? 1 : -1) * (LEBAR / 2 - 6 - Math.random() * 8), z = zc - PANJANG / 2 + 8 + k * 12;
      if (i === 0) d.pokok(x, 0, z, 1); else if (i === 1) { d.kotak({ x, y: 7, z, w: 1.4, h: 7, d: 1.4, warna: '#8a6a3a' }); d.kotak({ x, y: 8.4, z, w: 7, h: 1.4, d: 7, warna: '#5fa35e' }); }
      else if (i === 2) { d.kotak({ x, y: 4, z, w: 1.4, h: 4, d: 1.4, warna: '#6d4a2a' }); d.kotak({ x, y: 8, z, w: 6, h: 4, d: 6, warna: '#ffffff' }); d.kotak({ x, y: 11, z, w: 3.6, h: 3, d: 3.6, warna: '#ffffff' }); }
      else d.kotak({ x, y: 4 + (k % 3) * 2, z, w: 5, h: 4 + (k % 3) * 2, d: 5, warna: '#22263e', warnaAtas: '#4a4f70' });
    }
    // kristal mula
    if (S.x.sim.zon >= i || d.pratonton) for (let k = 0; k < 14; k++) binaNod(i, (Math.random() - 0.5) * (LEBAR - 34), zc + (Math.random() - 0.5) * (PANJANG - 18));
  });
  // pad jual
  const padB = (x, z, warna, baris, fn, w = 9) => {
    const p = d.kotak({ x, y: 0.3, z, w, h: 0.3, d: w, warna, neon: true, tembus: true, onSentuh: fn });
    const l = d.papan(baris, x, 6, z, 11, { w: 420, h: 160 }); return { p, l };
  };
  papanPad = {};
  papanPad.jual = padB(0, 14, '#d9b25f', [{ t: t('JUAL BINTANG', 'SELL STARS', 'JUAL BINTANG'), c: '#d9b25f' }, { t: t('Beg → Wang', 'Bag → Cash', 'Tas → Uang'), s: 0.7, b: false }], jual, 12);
  papanPad.kuasa = padB(-34, 52, '#d8714f', ['?'], () => naikTaraf('kuasa'));
  papanPad.beg = padB(-20, 52, '#7f9fd9', ['?'], () => naikTaraf('beg'));
  papanPad.laju = padB(-34, 38, '#a3b86c', ['?'], () => naikTaraf('laju'));
  papanPad.lahir = padB(-20, 38, '#b59ae8', ['?'], lahirSemula);
  // telur
  TELUR.forEach((T, i) => {
    const x = 18 + i * 14, z = 44, m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshStandardMaterial({ color: T.w, roughness: 0.4, metalness: i === 2 ? 0.5 : 0 }));
    m.scale.set(2.2, 3, 2.2); m.position.set(x, 3.6, z - 2); m.castShadow = true; d.grup.add(m); d.ubah.push(() => { m.rotation.z = Math.sin(d.t * 2 + i) * 0.06; });
    d.kotak({ x, y: 1, z: z - 2, w: 6, h: 1, d: 6, warna: '#22324f', warnaAtas: '#d9b25f' });
    d.kotak({ x, y: 0.3, z: z + 4, w: 7, h: 0.3, d: 5, warna: T.w, neon: true, tembus: true, onSentuh: () => tetas(i) });
    d.papan([{ t: tx(T.n), c: '#d9b25f' }, { t: '$' + nombor(T.h) + t(' + 2 soalan', ' + 2 questions', ' + 2 soal'), s: 0.7, b: false }], x, 9.5, z - 2, 11, { w: 420, h: 150 });
  });
  segarPad();
  if (d.pratonton) { for (let i = 0; i < 3; i++) d.bots.push(new Bot(d, i + 1, { x: -10 + i * 8, y: 0, z: Z0 - 40 })); for (let i = 0; i < 3; i++) { const p = buatPet(PETS[i * 2].w, PETS[i * 2].j); p.position.set(-6 + i * 8, 0, Z0 - 36); d.grup.add(p); } return; }
  // bot di zon 1 & plaza
  for (let i = 0; i < 4; i++) { const b = new Bot(d, i * 3, { x: (i - 2) * 8, y: 0, z: ZON[0].zc, kawasan: { x: 0, z: ZON[0].zc, w: LEBAR - 40, d: PANJANG - 30 } }); b.statistik.bintang = 50 + Math.floor(Math.random() * 400); b.statistik.lahir = i % 3; d.bots.push(b); }
  d.bots.push(new Bot(d, 14, { x: 10, y: 0, z: 30, kawasan: { x: 0, z: 34, w: 60, d: 30 } })); d.bots[4].statistik.bintang = 12; d.bots[4].statistik.lahir = 0;
  S.x.sim.pet.forEach((id) => tambahPetMesh(id));
}
function tambahPetMesh(id) {
  if (petM.length >= 3) { // hanya 3 terkuat dibawa
    const semua = S.x.sim.pet.map((x) => PETS.find((p) => p.id === x)).sort((a, b) => b.d - a.d).slice(0, 3).map((p) => p.id);
    petM.forEach((p) => D.grup.remove(p.g)); petM = []; semua.forEach((x) => tambahPetMesh(x)); return;
  }
  const P = PETS.find((p) => p.id === id), g = buatPet(P.w, P.j); D.grup.add(g);
  petM.push({ g, d: P.d, id, sasar: null, tBedik: 0, y: 0 });
}
function segarPad() {
  const s = S.x.sim, B = (l, h, ic) => [{ t: l, c: '#d9b25f' }, { t: ic + ' · $' + nombor(h), s: 0.8 }];
  tukarTeks(papanPad.kuasa.l.userData.tx, B(t('KUASA', 'POWER', 'KEKUATAN'), hargaKuasa(s.kuasa), 'Lv ' + (s.kuasa + 1)));
  tukarTeks(papanPad.beg.l.userData.tx, B(t('BEG', 'BAG', 'TAS'), hargaBeg(s.beg), muatan() + ''));
  tukarTeks(papanPad.laju.l.userData.tx, B(t('LAJU', 'SPEED', 'KECEPATAN'), hargaLaju(s.laju), 'Lv ' + (s.laju + 1)));
  tukarTeks(papanPad.lahir.l.userData.tx, [{ t: t('LAHIR SEMULA', 'REBIRTH', 'LAHIR KEMBALI'), c: '#b59ae8' }, { t: '$' + nombor(60000 * gandaLahir()), s: 0.8 }]);
  if (E.P) E.P.laju = 16 + s.laju * 3 + (S.gear === 'coilLaju' ? 8 : 0);
}
function jual() {
  const s = S.x.sim; if (s.bintang <= 0) { bunyi('tap'); return; }
  const dapat = s.bintang * gandaLahir(); s.wang += dapat; E.ui.toast?.(t(`Jual ${nombor(s.bintang)} bintang = $${nombor(dapat)}`, `Sold ${nombor(s.bintang)} stars = $${nombor(dapat)}`, `Jual ${nombor(s.bintang)} bintang = $${nombor(dapat)}`), 'emas'); s.bintang = 0; bunyi('beli'); simpan(); E.ui.segar?.(); paparBeg();
}
async function bayarSoal(harga, tajuk, tier = 0) {
  const s = S.x.sim;
  if (s.wang < harga) { bunyi('salah', 300); E.ui.toast?.(t(`Perlu $${nombor(harga - s.wang)} lagi`, `Need $${nombor(harga - s.wang)} more`, `Butuh $${nombor(harga - s.wang)} lagi`), 'amaran'); return false; }
  const ok = await E.ui.tanya({ tajuk, tier, nota: t(`Harga $${nombor(harga)}. Jawab betul untuk beli.`, `Price $${nombor(harga)}. Answer correctly to buy.`, `Harga $${nombor(harga)}. Jawab benar untuk beli.`) });
  if (E.dunia !== D || !ok) return false;
  s.wang -= harga; simpan(); bunyi('beli'); E.ui.segar?.(); return true;
}
let sibuk = false;
async function naikTaraf(jenis) {
  if (sibuk || E.P.mati) return; sibuk = true; const s = S.x.sim;
  const h = jenis === 'kuasa' ? hargaKuasa(s.kuasa) : jenis === 'beg' ? hargaBeg(s.beg) : hargaLaju(s.laju);
  const lab = { kuasa: t('Kuasa', 'Power', 'Kekuatan'), beg: t('Beg', 'Bag', 'Tas'), laju: t('Laju', 'Speed', 'Kecepatan') }[jenis];
  if (await bayarSoal(h, t('Naik taraf: ', 'Upgrade: ', 'Tingkatkan: ') + lab, Math.min(3, s[jenis]))) { s[jenis]++; simpan(); segarPad(); E.ui.toast?.(lab + ' +1', 'ok'); paparBeg(); }
  sibuk = false;
}
async function cubaBukaZon(i, g) {
  if (sibuk || E.P.mati || S.x.sim.zon >= i) return; sibuk = true;
  const Z = ZON[i];
  if (S.x.sim.zon < i - 1) { E.ui.toast?.(t('Buka zon sebelumnya dahulu', 'Unlock the previous zone first', 'Buka zona sebelumnya dulu'), 'amaran'); sibuk = false; return; }
  if (await bayarSoal(Z.h, t('Buka zon: ', 'Unlock zone: ', 'Buka zona: ') + tx(Z.n), i)) {
    S.x.sim.zon = i; simpan(); D.setAktif(g, false); bunyi('lencana'); tukarTeks(papanG[i].lab.userData.tx, [{ t: tx(Z.n), c: '#d9b25f' }]); tambahCbux(5 * i);
    for (let k = 0; k < 14; k++) binaNod(i, (Math.random() - 0.5) * (LEBAR - 34), Z.zc + (Math.random() - 0.5) * (PANJANG - 18));
    E.ui.toast?.(tx(Z.n) + t(' dibuka!', ' unlocked!', ' dibuka!'), 'emas'); E.ui.segar?.();
  }
  sibuk = false;
}
async function tetas(i) {
  if (sibuk || E.P.mati) return; sibuk = true; const T = TELUR[i], s = S.x.sim;
  if (s.wang < T.h) { bunyi('salah', 300); E.ui.toast?.(t(`Perlu $${nombor(T.h - s.wang)} lagi`, `Need $${nombor(T.h - s.wang)} more`, `Butuh $${nombor(T.h - s.wang)} lagi`), 'amaran'); sibuk = false; return; }
  const tajuk = tx(T.n);
  const a = await E.ui.tanya({ tajuk, tier: i, nota: t('Soalan 1 daripada 2', 'Question 1 of 2', 'Soal 1 dari 2') });
  const b = E.dunia === D && a ? await E.ui.tanya({ tajuk, tier: i, nota: t('Soalan 2 daripada 2', 'Question 2 of 2', 'Soal 2 dari 2') }) : false;
  if (E.dunia === D && a && b) {
    s.wang -= T.h; const id = T.undi[Math.floor(Math.random() * T.undi.length)]; s.pet.push(id); simpan(); bunyi('telur'); tambahPetMesh(id); beriLencana('telur');
    E.ui.toast?.(t('Anda dapat ', 'You got ', 'Kamu dapat ') + tx(PETS.find((p) => p.id === id).n) + '!', 'emas'); E.P.sorak = 2; E.ui.segar?.();
  }
  sibuk = false;
}
async function lahirSemula() {
  if (sibuk || E.P.mati) return; sibuk = true; const s = S.x.sim, h = 60000 * gandaLahir();
  if (s.zon < 3) { E.ui.toast?.(t('Buka Bulan Tinta dahulu', 'Unlock Ink Moon first', 'Buka Bulan Tinta dulu'), 'amaran'); sibuk = false; return; }
  if (await bayarSoal(h, t('Lahir Semula', 'Rebirth', 'Lahir Kembali'), 3)) {
    s.lahir++; s.wang = 0; s.bintang = 0; s.kuasa = 0; s.beg = 0; s.laju = 0; s.zon = 0; simpan(); beriLencana('lahir'); tambahCbux(30); bunyi('menang'); E.ui.konfeti?.();
    E.ui.toast?.(t(`Lahir semula! Semua jualan ×${gandaLahir()}`, `Reborn! All sales ×${gandaLahir()}`, `Lahir kembali! Semua penjualan ×${gandaLahir()}`), 'emas');
    setTimeout(() => E.ui.masukSemula?.(), 1800);
  }
  sibuk = false;
}
/* ---------- pukul kristal ---------- */
function pukul(n, kuat, dariPet) {
  if (!nod.includes(n)) return;
  n.hp -= kuat; n.goyang = 0.2; if (!dariPet) bunyi('pukul', 70);
  percik(n.x, n.m.position.y, n.z, ZON[n.zi].kristal, dariPet ? 2 : 4);
  const sk = 0.6 + 0.4 * Math.max(0, n.hp / n.hpMaks); n.m.scale.set(n.sk * sk, n.sk * sk * 1.5, n.sk * sk);
  if (n.hp <= 0) {
    const s = S.x.sim, ruang = muatan() - s.bintang, dapat = Math.min(ruang, n.nilai); s.bintang += dapat; simpan();
    if (dapat < n.nilai) { E.ui.toast?.(t('Beg penuh! Pergi jual di plaza.', 'Bag full! Go sell at the plaza.', 'Tas penuh! Jual di plaza.'), 'amaran'); }
    bunyi('retak', 60); percik(n.x, 2, n.z, ZON[n.zi].kristal, 14);
    D.grup.remove(n.g); nod.splice(nod.indexOf(n), 1); paparBeg(); E.ui.segar?.();
  }
}
const gP = new THREE.BoxGeometry(0.4, 0.4, 0.4); gP.userData.kongsi = true;
function percik(x, y, z, w, n) {
  for (let i = 0; i < n && kilauan.length < 70; i++) { const m = new THREE.Mesh(gP, bahanK(w)); m.position.set(x, y, z); D.grup.add(m); kilauan.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * 18, 8 + Math.random() * 14, (Math.random() - 0.5) * 18), t: 0.7 }); }
}
function palingDekat(j = 14) { let c = null, b = j; const p = E.P.pos; for (const n of nod) { const d = Math.hypot(n.x - p.x, n.z - p.z); if (d < b) { b = d; c = n; } } return c; }
function aksi() { if (E.P.mati) return; const n = palingDekat(); if (n) { tPukul = 0.3; pukul(n, kuasa(), false); E.P.yaw = Math.atan2(-(n.x - E.P.pos.x), -(n.z - E.P.pos.z)); E.P.av.lenKa.rotation.x = 2.2; } else { E.ui.toast?.(t('Dekati kristal dahulu', 'Get closer to a crystal', 'Dekati kristal dulu'), 'amaran'); } }
function paparBeg() { const s = S.x.sim; E.ui.info?.(t(`Beg ${nombor(s.bintang)} / ${muatan()}`, `Bag ${nombor(s.bintang)} / ${muatan()}`, `Tas ${nombor(s.bintang)} / ${muatan()}`) + (s.lahir ? `  ·  ×${gandaLahir()}` : '')); }
function kemas(dt) {
  const P = E.P; if (!P) return; tPukul -= dt;
  // jana semula
  tJana -= dt;
  if (tJana <= 0) { tJana = 1.1; for (let z = 0; z <= S.x.sim.zon; z++) { if (nod.filter((n) => n.zi === z).length < 14) { binaNod(z, (Math.random() - 0.5) * (LEBAR - 34), ZON[z].zc + (Math.random() - 0.5) * (PANJANG - 18)); break; } } }
  for (const n of nod) { n.m.rotation.y += dt * 0.6; if (n.goyang > 0) { n.goyang -= dt; n.g.position.x = n.x + Math.sin(n.goyang * 80) * 0.18; } else n.g.position.x = n.x; }
  for (let i = kilauan.length - 1; i >= 0; i--) { const k = kilauan[i]; k.t -= dt; k.v.y -= 40 * dt; k.m.position.addScaledVector(k.v, dt); k.m.rotation.x += dt * 8; if (k.t <= 0 || k.m.position.y < 0.2) { D.grup.remove(k.m); kilauan.splice(i, 1); } }
  // haiwan: ikut pemain, serang kristal dekat
  petM.forEach((pt, i) => {
    const sudut = i * 2.1 + D.t * 0.25; let tx0 = P.pos.x + Math.cos(sudut) * 6, tz0 = P.pos.z + Math.sin(sudut) * 6;
    pt.tBedik -= dt;
    if (!pt.sasar || !nod.includes(pt.sasar) || Math.hypot(pt.sasar.x - P.pos.x, pt.sasar.z - P.pos.z) > 34) pt.sasar = nod.find((n) => Math.hypot(n.x - P.pos.x, n.z - P.pos.z) < 30) || null;
    if (pt.sasar) { tx0 = pt.sasar.x + Math.cos(sudut) * 3.6; tz0 = pt.sasar.z + Math.sin(sudut) * 3.6; if (pt.tBedik <= 0 && Math.hypot(pt.g.position.x - tx0, pt.g.position.z - tz0) < 2.5) { pt.tBedik = 0.5; pukul(pt.sasar, pt.d * 0.5 * (1 + S.x.sim.lahir), true); } }
    const dx = tx0 - pt.g.position.x, dz = tz0 - pt.g.position.z, jar = Math.hypot(dx, dz), v = Math.min(jar, dt * Math.max(14, jar * 2));
    if (jar > 0.05) { pt.g.position.x += dx / jar * v; pt.g.position.z += dz / jar * v; pt.g.rotation.y = Math.atan2(-dx, -dz); }
    pt.g.position.y = P.pos.y * (P.pos.y > 2 ? 0.5 : 0) + Math.abs(Math.sin(D.t * 8 + i)) * (jar > 0.3 ? 0.7 : 0.15);
    pt.g.userData.kaki.forEach((k, j) => { k.rotation.x = Math.sin(D.t * 12 + j * 2) * (jar > 0.3 ? 0.6 : 0); });
  });
  for (const b of D.bots) b.statistik.bintang += dt * 2.4;
  tS -= dt; if (tS <= 0 && D.bots.length) { tS = 9 + Math.random() * 12; const b = D.bots[Math.floor(Math.random() * D.bots.length)], x = tx(CAKAP[Math.floor(Math.random() * CAKAP.length)]); b.cakap(x); E.ui.chat?.(b.nama, x); }
}
const CAKAP = [['saya dapat Mochi!', 'i got Mochi!', 'aku dapat Mochi!'], ['beg saya penuh lagi', 'my bag is full again', 'tasku penuh lagi'], ['jom pergi Pantai Senja', "let's go to Sunset Beach", 'ayo ke Pantai Senja'], ['telur emas mahal', 'golden egg is pricey', 'telur emas mahal'], ['60 ÷ 5 = 12 kan?', '60 ÷ 5 = 12 right?', '60 ÷ 5 = 12 kan?']];
let tS = 7;
export const SIMULATOR = {
  id: 'sim', tema: 'sim', langit: ['#6bb0ea', '#eaf6ff', [230, 800]], cahaya: [1.55, 2.5],
  pratonton: { p: [26, 18, Z0 - 8], t: [-2, 3, Z0 - 42] },
  bina, kemas,
  mula() { segarPad(); paparBeg(); E.ui.banner?.(t('Simulator Bintang', 'Star Simulator', 'Simulator Bintang')); E.ui.butangAksi?.(t('Kutip', 'Mine', 'Ambil'), aksi); },
  onKlik(ray) {
    const senarai = nod.map((n) => n.m), kena = ray.intersectObjects(senarai, false)[0]; if (!kena) return;
    const n = nod.find((q) => q.m === kena.object); const p = E.P.pos; if (Math.hypot(n.x - p.x, n.z - p.z) < 26) { pukul(n, kuasa(), false); E.P.av.lenKa.rotation.x = 2.2; }
    else E.ui.toast?.(t('Terlalu jauh', 'Too far', 'Terlalu jauh'), 'amaran');
  },
  kekunci(e) { if (e.code === 'KeyF' || e.code === 'KeyE') aksi(); },
  statistik() { return [{ k: t('Bintang', 'Stars', 'Bintang'), v: nombor(S.x.sim.bintang) }, { k: t('Wang', 'Cash', 'Uang'), v: '$' + nombor(S.x.sim.wang) }]; },
  statistikBot(b) { return [nombor(b.statistik.bintang || 0), '$' + nombor((b.statistik.bintang || 0) * 3)]; },
  keluar() { E.ui.info?.(''); E.ui.butangAksi?.(null); sibuk = false; },
  uji: { nod: () => nod, aksi, jual, pukul, naikTaraf, tetas, palingDekat, zon: () => ZON, cubaBukaZon: (i) => cubaBukaZon(i, papanG[i].g), lahirSemula }
};
