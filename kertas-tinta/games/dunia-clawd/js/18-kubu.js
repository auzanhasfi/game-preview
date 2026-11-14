/* Pertahanan Kubu: 10 gelombang Comot berjalan di laluan berliku menuju kubu.
   Berdiri di pad menara, jawab soalan untuk membina / naik taraf (3 tahap). Pemain juga boleh menyerang. */
import * as THREE from 'three';
import { E, Bot } from './08-enjin.js';
import { S, simpan, tambahCbux, beriLencana } from './05-simpan.js';
import { t, nombor } from './01-teks.js';
import { bunyi } from './04-bunyi.js';
import { tukarTeks } from './06-bahan.js';

const LALUAN = [[-48, -40], [-48, -10], [-12, -10], [-12, -40], [24, -40], [24, 0], [-30, 0], [-30, 26], [40, 26], [40, 44]];
const PAD = [[-36, -24], [-24, -26], [0, -26], [12, -50], [36, -20], [8, -14], [-14, 12], [10, 12], [28, 36], [52, 14]];
const GEL = 10, WN = ['#5a3f8c', '#c0607e', '#2c3e6b'];
let D, musuh, menara, peluru, gel, aktifGel, baki, tJana, hpKubu, wang, aksi, tamat, tTunggu, kubuM;

function bina(d) {
  D = d; musuh = []; menara = []; peluru = []; gel = 0; aktifGel = false; baki = 0; tJana = 0; hpKubu = 20; wang = 40; aksi = null; tamat = false; tTunggu = 12;
  d.lantaiMati = -40; d.awan(14, 380, 100, 180);
  d.kotak({ x: 0, y: 0, z: 0, w: 130, h: 4, d: 120, warna: '#4a5a3c', warnaAtas: '#7aa35a' });
  for (let i = 0; i < LALUAN.length - 1; i++) {
    const [x1, z1] = LALUAN[i], [x2, z2] = LALUAN[i + 1];
    d.kotak({ x: (x1 + x2) / 2, y: 0.12, z: (z1 + z2) / 2, w: Math.abs(x2 - x1) + 7, h: 0.12, d: Math.abs(z2 - z1) + 7, warna: '#c4a670', hiasan: true });
  }
  // gua musuh & kubu
  const [gx, gz] = LALUAN[0]; d.kotak({ x: gx, y: 9, z: gz - 6, w: 14, h: 9, d: 6, warna: '#3a3f55' }); d.kotak({ x: gx, y: 6, z: gz - 3.2, w: 7, h: 6, d: 1, warna: '#121620', hiasan: true });
  const [kx, kz] = LALUAN[LALUAN.length - 1];
  for (const [x, z] of [[-7, 0], [7, 0]]) d.kotak({ x: kx + x, y: 16, z: kz + 4, w: 5, h: 16, d: 5, warna: '#9aa5b8', warnaAtas: '#c0392b' });
  d.kotak({ x: kx, y: 11, z: kz + 6, w: 14, h: 11, d: 6, warna: '#b8c0cc' });
  kubuM = d.papan([{ t: '', c: '#d9b25f' }], kx, 21, kz + 4, 14, { w: 420, h: 110 });
  PAD.forEach(([x, z], i) => { const b = d.kotak({ x, y: 0.5, z, w: 6, h: 0.5, d: 6, warna: '#d9b25f', warnaAtas: '#e8c876' }); menara.push({ i, x, z, b, tahap: 0, cd: 0, g: null }); });
  for (const [x, z] of [[-60, 40], [60, -50], [-60, -54], [56, 50]]) d.pokok(x, 0, z, 1.3);
  d.spawn = { x: kx, y: 0.1, z: kz - 10, yaw: 0 };
  if (!d.pratonton) for (let i = 0; i < 3; i++) d.bots.push(new Bot(d, i + 9, { kawasan: { x: 20, z: 30, w: 40, d: 20 }, y: 0, x: 20 + i * 6, z: 30 }));
  else { for (let i = 0; i < 6; i++) jana(i % 3, i * 0.11); menara[1].tahap = 2; binaMenara(menara[1]); menara[4].tahap = 1; binaMenara(menara[4]); }
}
const gK = new THREE.BoxGeometry(1, 1, 1); gK.userData.kongsi = true;
const mt = {}; const M = (w, e) => mt[w + (e || '')] ||= Object.assign(new THREE.MeshLambertMaterial({ color: w, emissive: e || '#000000' }), { userData: { kongsi: true } });
function jana(jenis, s0 = 0) {
  const sk = [1, 0.7, 1.5][jenis], g = new THREE.Group(), b = new THREE.Mesh(gK, M(WN[jenis])); b.scale.set(3 * sk, 2.8 * sk, 3 * sk); b.position.y = 1.4 * sk; b.castShadow = true; g.add(b);
  for (const x of [-0.7, 0.7]) { const e = new THREE.Mesh(gK, M('#ffffff')); e.scale.set(0.6 * sk, 0.8 * sk, 0.2); e.position.set(x * sk, 1.9 * sk, -1.55 * sk); g.add(e); }
  D.grup.add(g); const hp = [10, 6, 34][jenis] * (1 + gel * 0.28);
  musuh.push({ g, b, s: s0, jenis, hp, hpM: hp, laju: [9, 15, 6][jenis], kena: 0 });
}
function posLaluan(s) {
  let sisa = s * panjang(); for (let i = 0; i < LALUAN.length - 1; i++) { const [x1, z1] = LALUAN[i], [x2, z2] = LALUAN[i + 1], l = Math.hypot(x2 - x1, z2 - z1); if (sisa <= l) { const k = sisa / l; return [x1 + (x2 - x1) * k, z1 + (z2 - z1) * k, Math.atan2(-(x2 - x1), -(z2 - z1))]; } sisa -= l; }
  const e = LALUAN[LALUAN.length - 1]; return [e[0], e[1], 0];
}
let PJ = 0; function panjang() { if (PJ) return PJ; for (let i = 0; i < LALUAN.length - 1; i++) PJ += Math.hypot(LALUAN[i + 1][0] - LALUAN[i][0], LALUAN[i + 1][1] - LALUAN[i][1]); return PJ; }
function binaMenara(m) {
  if (m.g) D.grup.remove(m.g); const g = new THREE.Group(), w = ['#9aa5b8', '#7f9fd9', '#d9b25f'][m.tahap - 1], h = 4 + m.tahap * 2.5;
  const tiang = new THREE.Mesh(gK, M('#5d6272')); tiang.scale.set(3, h, 3); tiang.position.y = h / 2; tiang.castShadow = true; g.add(tiang);
  const kpl = new THREE.Mesh(gK, M(w, m.tahap === 3 ? '#6a4a10' : null)); kpl.scale.set(4, 2, 4); kpl.position.y = h + 1; kpl.castShadow = true; g.add(kpl);
  const mu = new THREE.Mesh(gK, M('#22324f')); mu.scale.set(0.8, 0.8, 3); mu.position.set(0, h + 1.2, -2); g.add(mu); m.mu = mu; m.h = h;
  g.position.set(m.x, 0.5, m.z); D.grup.add(g); m.g = g;
}
const jejari = (m) => 16 + m.tahap * 4, rosak = (m) => [0, 4, 7, 12][m.tahap], kadar = (m) => [0, 0.9, 0.7, 0.5][m.tahap], kos = (m) => [20, 30, 45][m.tahap];
async function bina2(m) {
  if (m.tahap >= 3) return; const k = kos(m);
  if (wang < k) { E.ui.toast?.(t(`Perlu ${k} syiling. Kalahkan Comot untuk dapat syiling.`, `Need ${k} coins. Defeat Comots to earn coins.`, `Perlu ${k} koin. Kalahkan Comot untuk dapat koin.`), 'amaran'); bunyi('salah'); return; }
  const ok = await E.ui.tanya({ tier: Math.min(3, m.tahap + Math.floor(gel / 4)), tajuk: m.tahap ? t('Naik taraf menara', 'Upgrade tower', 'Tingkatkan menara') : t('Bina menara', 'Build tower', 'Bangun menara'), nota: t(`Kos ${k} syiling. Betul: menara tahap ${m.tahap + 1}.`, `Costs ${k} coins. Correct: level ${m.tahap + 1} tower.`, `Biaya ${k} koin. Benar: menara tingkat ${m.tahap + 1}.`) });
  if (!ok || E.dunia !== D) return;
  wang -= k; m.tahap++; binaMenara(m); bunyi('beli'); aksi = null; E.ui.segar?.();
}
function mulaGel() {
  if (aktifGel || tamat) return; gel++; aktifGel = true; baki = 6 + gel * 2; tJana = 0;
  E.ui.banner?.(t(`Gelombang ${gel} / ${GEL}`, `Wave ${gel} / ${GEL}`, `Gelombang ${gel} / ${GEL}`)); bunyi('pad');
}
const gP = new THREE.SphereGeometry(0.6, 8, 6); gP.userData.kongsi = true;
function tembak(m, s) { const p = new THREE.Mesh(gP, M('#ffe08a', '#a07a20')); p.position.set(m.x, m.h + 1.5, m.z); D.grup.add(p); peluru.push({ p, s, r: rosak(m), t: 0 }); if (m.mu) m.g.rotation.y = Math.atan2(-(s.g.position.x - m.x), -(s.g.position.z - m.z)); }
function kemas(dt) {
  const P = E.P; if (!P) return;
  if (!tamat) {
    if (!aktifGel) { tTunggu -= dt; E.ui.info?.(t(`Gelombang ${gel + 1} dalam ${Math.ceil(tTunggu)}s · syiling ${wang} · kubu ${hpKubu}`, `Wave ${gel + 1} in ${Math.ceil(tTunggu)}s · coins ${wang} · fort ${hpKubu}`, `Gelombang ${gel + 1} dalam ${Math.ceil(tTunggu)}d · koin ${wang} · benteng ${hpKubu}`)); if (tTunggu <= 0) mulaGel(); }
    else {
      tJana -= dt; if (baki > 0 && tJana <= 0) { baki--; tJana = Math.max(0.6, 1.6 - gel * 0.08); jana(gel >= 3 && Math.random() < 0.3 ? 1 : gel >= 5 && Math.random() < 0.2 ? 2 : 0); }
      E.ui.info?.(t(`Gelombang ${gel} · Comot ${musuh.length + baki} · syiling ${wang} · kubu ${hpKubu}`, `Wave ${gel} · Comots ${musuh.length + baki} · coins ${wang} · fort ${hpKubu}`, `Gelombang ${gel} · Comot ${musuh.length + baki} · koin ${wang} · benteng ${hpKubu}`));
      if (baki <= 0 && !musuh.length) { aktifGel = false; tTunggu = 10; wang += 10 + gel * 2; tambahCbux(2); simpan(); S.x.kubu.terbaik = Math.max(S.x.kubu.terbaik, gel); E.ui.toast?.(t(`Gelombang ${gel} ditahan! +${10 + gel * 2} syiling`, `Wave ${gel} held! +${10 + gel * 2} coins`, `Gelombang ${gel} ditahan! +${10 + gel * 2} koin`), 'ok'); if (gel >= GEL) menang(); }
    }
  }
  for (const s of musuh) {
    s.s += s.laju * dt / panjang() * (s.kena > 0 ? 0.4 : 1); s.kena -= dt;
    const [x, z, r] = posLaluan(s.s); s.g.position.set(x, 0, z); s.g.rotation.y = r; s.b.material = s.kena > 0 ? M('#e07a6a') : M(WN[s.jenis]);
    const b = 1 + Math.sin(D.t * 10 + s.s * 50) * 0.06; s.b.scale.y = 2.8 * [1, 0.7, 1.5][s.jenis] * b;
    if (s.s >= 1) { s.mati = true; hpKubu -= s.jenis === 2 ? 3 : 1; bunyi('oof'); if (hpKubu <= 0 && !tamat) kalah(); }
    if (s.hp <= 0 && !s.mati) { s.mati = true; wang += [2, 2, 5][s.jenis]; bunyi('pecah'); }
  }
  musuh = musuh.filter((s) => { if (s.mati) D.grup.remove(s.g); return !s.mati; });
  for (const m of menara) {
    if (!m.tahap) continue; m.cd -= dt; if (m.cd > 0) continue;
    let sas = null, bs = -1; for (const s of musuh) { const d = Math.hypot(s.g.position.x - m.x, s.g.position.z - m.z); if (d < jejari(m) && s.s > bs) { bs = s.s; sas = s; } }
    if (sas) { tembak(m, sas); m.cd = kadar(m); }
  }
  for (const p of peluru) {
    p.t += dt; if (!musuh.includes(p.s)) { p.buang = true; continue; }
    const sp = p.s.g.position, d = new THREE.Vector3(sp.x - p.p.position.x, sp.y + 1.5 - p.p.position.y, sp.z - p.p.position.z), l = d.length();
    if (l < 1.5) { p.s.hp -= p.r; p.s.kena = 0.15; p.buang = true; continue; } p.p.position.addScaledVector(d, Math.min(1, dt * 70 / l));
  }
  peluru = peluru.filter((p) => { if (p.buang || p.t > 2) { D.grup.remove(p.p); return false; } return true; });
  if (kubuM.userData.n !== hpKubu) { kubuM.userData.n = hpKubu; tukarTeks(kubuM.userData.tx, [{ t: t('KUBU ', 'FORT ', 'BENTENG ') + Math.max(0, hpKubu) + ' / 20', c: hpKubu > 7 ? '#d9b25f' : '#e07a6a' }]); }
  // aksi
  const pm = menara.find((m) => Math.abs(P.pos.x - m.x) < 3.6 && Math.abs(P.pos.z - m.z) < 3.6);
  const [kx, kz] = LALUAN[LALUAN.length - 1];
  if (pm && !tamat) aturAksi(pm.tahap >= 3 ? t('Tahap maks', 'Max level', 'Tingkat maks') : (pm.tahap ? t('Naik taraf ', 'Upgrade ', 'Tingkatkan ') : t('Bina ', 'Build ', 'Bangun ')) + (pm.tahap < 3 ? kos(pm) : ''), () => bina2(pm));
  else if (!aktifGel && !tamat && Math.hypot(P.pos.x - kx, P.pos.z - (kz - 10)) < 8) aturAksi(t('Mula sekarang', 'Start now', 'Mulai sekarang'), () => { tTunggu = 0; });
  else aturAksi(null);
}
function aturAksi(label, fn) { if (aksi?.label === label) return; aksi = label ? { label, fn } : null; E.ui.butangAksi?.(label, fn || (() => {})); }
function serang() {
  E.P.ayun = 1; bunyi('pukul'); const P = E.P.pos;
  for (const s of musuh) if (Math.hypot(s.g.position.x - P.x, s.g.position.z - P.z) < 6) { s.hp -= 4; s.kena = 0.3; E.ui.terapung?.('-4'); }
}
function menang() { tamat = true; S.x.kubu.menang++; simpan(); beriLencana('kubu'); tambahCbux(40); bunyi('menang'); E.P.sorak = 6; E.ui.konfeti?.(); E.ui.toast?.(t('Kubu selamat! 10 gelombang ditahan. +40 CBux', 'The fort is safe! 10 waves held. +40 CBux', 'Benteng selamat! 10 gelombang ditahan. +40 CBux'), 'emas'); }
async function kalah() {
  tamat = true; bunyi('salah');
  const lagi = await E.ui.tanyaPilihan(t('Kubu runtuh!', 'The fort fell!', 'Benteng runtuh!'), t(`Anda bertahan sampai gelombang ${gel}. Terbaik: ${S.x.kubu.terbaik}.`, `You lasted until wave ${gel}. Best: ${S.x.kubu.terbaik}.`, `Kamu bertahan sampai gelombang ${gel}. Terbaik: ${S.x.kubu.terbaik}.`), t('Cuba lagi', 'Try again', 'Coba lagi'), t('Tutup', 'Close', 'Tutup'));
  if (lagi && E.dunia === D) E.ui.masukSemula?.();
}
export const KUBU = {
  id: 'kubu', tema: 'menara', pratonton: { p: [70, 66, 76], t: [0, 0, 0] },
  bina, kemas,
  mula() { E.ui.butangSentuh?.([{ id: 'serang', ikon: 'sword', label: t('Serang', 'Attack', 'Serang'), fn: serang }]); E.ui.banner?.(t('Bina menara di pad emas', 'Build towers on the gold pads', 'Bangun menara di pad emas')); },
  kekunci(e) { if (e.code === 'KeyF' && aksi) aksi.fn(); if (e.code === 'KeyE') serang(); },
  statistik() { return [{ k: t('Gelombang', 'Wave', 'Gelombang'), v: gel }, { k: t('Syiling', 'Coins', 'Koin'), v: wang }]; },
  statistikBot(b) { return [Math.max(1, gel - (b.nama.length % 3)), b.nama.length * 3]; },
  keluar() { E.ui.butangAksi?.(null); E.ui.butangSentuh?.([]); E.ui.info?.(''); },
  uji: { menara: () => menara, musuh: () => musuh, mulaGel, wang: (v) => { if (v !== undefined) wang = v; return wang; }, gel: () => gel, hp: () => hpKubu, bina: (i) => bina2(menara[i]), tamat: () => tamat, langkauGel: () => { baki = 0; musuh.forEach((s) => { s.hp = 0; }); } }
};
