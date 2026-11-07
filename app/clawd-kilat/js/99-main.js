/* Clawd Kilat: keadaan game, gelung utama, gerak pemain, tabrakan, gerbang angka, bos, bangkit, hasil + kait uji window.__game */
import * as THREE from 'three';
import { HEROES, TINGKAT, muat, simpan } from './01-data.js';
import { buatSoal } from './02-soal.js';
import { Bunyi } from './03-bunyi.js';
import { R, siapkanRender, ubahKualitas, gambar, LENGKUNG } from './04-render.js';
import { siapkanDunia, perbaruiDunia, resetDunia, aturZonaLangsung, LAJUR } from './05-dunia.js';
import { buatClawd, buatMochi, animasiClawd } from './06-clawd.js';
import { siapkanObjek, ambil, lepas, aturPanel } from './07-objek.js';
import { pilihPola, mungkinPower } from './08-pola.js';
import { siapkanEfek, perbaruiEfek, semburan, gelombangKejut, goyang, getaran, jejak, kilatLayar, vignette, teksMelayang } from './09-efek.js';
import { Bos } from './10-bos.js';
import * as UI from './11-ui.js';
import { pasangInput } from './12-input.js';

const D = muat();
if (!D.punya.includes(D.hero)) D.hero = 'pahlawan';
document.documentElement.lang = D.bhs === 'ms' ? 'ms' : 'id';
const simpanD = () => simpan(D);

siapkanRender(document.getElementById('kanvas'), D.grafik);
siapkanDunia(); siapkanObjek(); siapkanEfek(); Bos.siapkan();
Bunyi.set(D.suara);

/* ---------- keadaan ---------- */
const G = {
  keadaan: 'menu', dist: 0, laju: 14, lajuDasar: 14, waktu: 0, skor: 0, bonus: 0, koin: 0, koinDiambil: 0,
  mult: 1, benar: 0, salah: 0, beruntun: 0, beruntunMaks: 0, adapt: 0, musuh: 0, meter: 0, kilat: 0, kilatMaks: 4, pakaiKilat: 0,
  magnet: 0, magnetMaks: 8, perisai: 0, kebal: 0, boost: 0, dip: 1, lompatan: 0,
  objek: [], kursor: 0, gerbangBerikut: 0, bosBerikut: 1200, zona: 0, soal: null, bangkitSisa: 1, catatan: [], misi: [],
  rekorLewat: false, koinBeruntun: 0, koinJeda: 0, bosMenang: 0, fps: 60, waktuRendah: 0
};
const P = { lajur: 0, x: 0, y: 0, vy: 0, vx: 0, diUdara: false, guling: 0, gulingNanti: false, putarLompat: false, rotPutar: 0, squash: 0, lompatSisa: 0, bufLompat: 0, laju: 14, kebal: 0, perisai: 0, kilat: false };
let C = null, mochi = null, kameraK = 0, menuMisi = UI.pilihMisi();

function pasangHero() {
  if (C) R.scene.remove(C.akar);
  C = buatClawd(D.hero); R.scene.add(C.akar);
  if (mochi) { R.scene.remove(mochi); mochi = null; }
  if (D.hero === 'nini') { mochi = buatMochi(); R.scene.add(mochi); }
}
pasangHero();

UI.pasangUI(D, {
  main: () => mulaiLari(), simpan: simpanD,
  bahasa: () => { UI.renderMenu(menuMisi); }, grafik: () => ubahKualitas(D.grafik), suara: () => Bunyi.set(D.suara),
  hero: () => { pasangHero(); }, menuUlang: () => UI.renderMenu(menuMisi),
  lanjut: () => lanjut(), ulang: () => { tutupSemua(); mulaiLari(); }, keMenu: () => keMenu()
});
UI.siapkanHUD(); UI.renderMenu(menuMisi);
const $ = (id) => document.getElementById(id);
$('bJeda').onclick = () => jeda();
$('bKilat').onclick = (e) => { e.stopPropagation(); aksi('kilat'); };

function tutupSemua() { for (const id of ['lJeda', 'lHasil', 'lBangkit', 'lHero']) $(id).hidden = true; }
function hapusObjek() { for (const o of G.objek) lepas(o.tipe, o.g); G.objek = []; }

/* ---------- alur ---------- */
let hitungT = 0;
function mulaiLari() {
  Bunyi.buka(); tutupSemua(); hapusObjek(); Bos.selesai(); UI.bosBar(-1); UI.panelSoal(null);
  const TK = TINGKAT[D.tingkat], H = HEROES[D.hero];
  Object.assign(G, { keadaan: 'hitung', dist: 0, skor: 0, bonus: 0, koin: 0, koinDiambil: 0, mult: 1, benar: 0, salah: 0, beruntun: 0, beruntunMaks: 0, adapt: 0, musuh: 0, meter: 0, kilat: 0, pakaiKilat: 0,
    kilatMaks: D.hero === 'pahlawan' ? 6 : 4, magnet: 0, magnetMaks: D.hero === 'pemanah' ? 14 : 8, perisai: D.hero === 'perisai' ? 1 : 0, kebal: 0, boost: 0, dip: 1, lompatan: 0,
    kursor: 40, gerbangBerikut: 220, bosBerikut: 1200, zona: 0, soal: null, bangkitSisa: D.hero === 'penyembuh' ? 2 : 1, catatan: [], misi: menuMisi, rekorLewat: false, bosMenang: 0, laju: TK.lajuAwal, lajuDasar: TK.lajuAwal });
  G.misi.forEach((m) => { m.nilai = 0; m.ok = false; });
  Object.assign(P, { lajur: 0, x: 0, y: 0, vy: 0, diUdara: false, guling: 0, gulingNanti: false, squash: 0, lompatSisa: 0, bufLompat: 0 });
  aturZonaLangsung(0); resetDunia(0);
  if (D.jarakRekor > 150) { const b = ambil('bendera'); aturPanel(b, UI.tx().rekorBendera, { w: 256, h: 128, latar: '#d9b25f', warna: '#1a1408', ukuran: 70 }); G.objek.push({ tipe: 'bendera', g: b, w: D.jarakRekor, l: 0, x: -5.4, selesai: false }); }
  $('menu').hidden = true; $('hud').hidden = false;
  hitungT = 0; Bunyi.musikMulai('lari'); Bunyi.musikMode('lari');
  UI.petunjuk(UI.tx().geserPetunjuk); setTimeout(() => UI.petunjuk(''), 5000);
}
function keMenu() {
  tutupSemua(); hapusObjek(); Bos.selesai(); UI.bosBar(-1); UI.panelSoal(null); UI.petunjuk('');
  G.keadaan = 'menu'; G.laju = 14; $('hud').hidden = true; $('menu').hidden = false; $('hitung').innerHTML = '';
  menuMisi = UI.pilihMisi(); UI.renderMenu(menuMisi); Bunyi.musikMode('menu');
  aturZonaLangsung(0);
}
function jeda() { if (G.keadaan !== 'main' && G.keadaan !== 'hitung') return; G.sebelumJeda = G.keadaan; G.keadaan = 'jeda'; UI.bukaJeda(); }
function lanjut() { $('lJeda').hidden = true; G.keadaan = G.sebelumJeda || 'main'; }
document.addEventListener('visibilitychange', () => { if (document.hidden) jeda(); });

/* ---------- input ---------- */
function aksi(a, ulang) {
  if (a === 'jeda') { if (G.keadaan === 'jeda') lanjut(); else jeda(); return true; }
  if (G.keadaan === 'menu' || G.keadaan === 'hasil') return false;
  if (G.keadaan === 'bangkit' && /^p[123]$/.test(a)) { const b = document.querySelectorAll('#bPil button')[+a[1] - 1]; if (b) b.click(); return true; }
  if (G.keadaan !== 'main' || ulang) return G.keadaan === 'main';
  UI.petunjuk('');
  if (a === 'kiri' || a === 'kanan') {
    const baru = P.lajur + (a === 'kiri' ? -1 : 1);
    if (baru < -1 || baru > 1) { Bunyi.sfx('mentok'); goyang(0.15); return true; }
    P.lajur = baru; Bunyi.sfx('lajur');
  } else if (a === 'lompat') {
    if (!P.diUdara) lompat(11.5);
    else if (D.hero === 'bayang' && P.lompatSisa > 0) { P.lompatSisa = 0; P.vy = 10.5; Bunyi.sfx('lompat'); semburan(P.x, P.y + 0.3, 0, 10, { warna: HEROES[D.hero].col, kec: 4, ukuran: 0.14 }); }
    else P.bufLompat = 0.15;
  } else if (a === 'guling') {
    if (P.diUdara) { P.vy = Math.min(P.vy, -24); P.gulingNanti = true; }
    else { P.guling = 0.7; Bunyi.sfx('guling'); }
  } else if (a === 'kilat') aktifkanKilat();
  return true;
}
pasangInput(aksi);
function lompat(v) { P.vy = v; P.diUdara = true; P.guling = 0; P.putarLompat = true; P.lompatSisa = 1; P.squash = -0.35; Bunyi.sfx(v > 15 ? 'pegas' : 'lompat'); G.lompatan++; tambahMisi('lompat', 1); }
function aktifkanKilat() {
  if (G.meter < 100 || G.kilat > 0) return;
  G.kilat = G.kilatMaks; G.meter = 0; G.pakaiKilat++; tambahMisi('kilat', 1);
  kilatLayar('#fff7d0', 0.8); gelombangKejut(P.x, 0.8, 0, '#ffd86a', 9); goyang(0.35); Bunyi.sfx('kilat');
  UI.sepanduk(UI.tx().kilat + '!', 'emas');
}

/* ---------- misi ---------- */
function tambahMisi(id, n, mutlak) {
  for (const m of G.misi) if (m.id === id && !m.ok) {
    m.nilai = mutlak ? Math.max(m.nilai, n) : m.nilai + n;
    if (m.nilai >= m.n) { m.ok = true; Bunyi.sfx('power'); UI.toast('check', m.t[D.bhs === 'ms' ? 1 : 0] + ' · +' + m.hadiah); }
  }
}

/* ---------- pemunculan ---------- */
function spawn(tipe, l, w, opsi = {}) {
  const g = ambil(tipe);
  const o = { tipe, g, l, w, x: l * LAJUR, y: opsi.y || 0, opsi, selesai: false, t: 0 };
  G.objek.push(o); return o;
}
function isiJalur() {
  const TK = TINGKAT[D.tingkat];
  while (G.kursor < G.dist + 165) {
    if (Bos.aktif || (G.dist > G.bosBerikut - 200 && G.kursor > G.bosBerikut - 30)) { G.kursor = Math.max(G.kursor, G.dist + 165); if (!Bos.aktif) break; continue; }
    if (G.kursor >= G.gerbangBerikut && !G.soal) { buatGerbang(G.kursor); G.kursor += 72; G.gerbangBerikut = G.kursor + TK.gerbang; if (Math.abs(G.gerbangBerikut - G.bosBerikut) < 200) G.gerbangBerikut = G.bosBerikut + 220; continue; }
    const c = { laju: Math.max(G.lajuDasar, 22), dist: G.dist, zona: G.zona };
    const p = pilihPola(c);
    const terpakai = new Set();
    for (const [tipe, l, dz, opsi] of p.isi) { spawn(tipe, l, G.kursor + dz, opsi || {}); if (tipe !== 'koin') terpakai.add(l + ':' + Math.round(dz / 8)); }
    const pw = mungkinPower({ peluangPerisai: D.hero === 'perisai' ? 0.06 : 0.03 });
    if (pw) { const l = [-1, 0, 1].find((x) => ![...terpakai].some((k) => k.startsWith(x + ':'))); if (l !== undefined) spawn(pw, l, G.kursor + p.pjg - 4); }
    G.kursor += p.pjg + Math.max(6, 16 - G.dist / 150);
  }
}
function buatGerbang(w) {
  const s = buatSoal(D.tingkat, G.adapt), id = Math.random();
  for (let i = 0; i < 12; i++) spawn('koin', [-1, 0, 1][i % 3], w + 6 + Math.floor(i / 3) * 6, { y: 0.9 });
  [-1, 0, 1].forEach((l, i) => {
    const o = spawn('jawab', l, w + 54, { nilai: s.pilihan[i], gerbang: id });
    aturPanel(o.g, s.pilihan[i], { w: 256, h: 212, latar: 'rgba(12,21,38,0.82)', bingkai: '#d9b25f', warna: '#ffffff', ukuran: 130 });
    o.g.userData.rangka.color.set('#d9b25f'); o.g.userData.rangka.emissive.set('#d9b25f');
  });
  G.soal = { s, w: w + 54, id, jawaban: null, tampil: 0, wAwal: G.dist };
}

/* ---------- kena / tumbang ---------- */
function kena(sebab) {
  if (G.kebal > 0 || G.kilat > 0) return;
  if (G.perisai > 0) { G.perisai = 0; G.kebal = 1; Bunyi.sfx('perisaiPecah'); semburan(P.x, 1, 0, 30, { warna: ['#7fd8ff', '#ffffff'], kec: 7 }); goyang(0.3); return; }
  if (G.koin > 0 && sebab !== 'kolam') {
    const n = Math.min(G.koin, 24); G.koin = 0; G.kebal = 1.6; G.dip = 0.55;
    semburan(P.x, 1.2, 0, n, { warna: ['#ffcf3a', '#ffe58a'], kec: 9, ukuran: 0.3, naik: 1.1, umur: 1 });
    Bunyi.sfx('kena'); Bunyi.sfx('koinHambur'); goyang(0.55); vignette(); G.mult = 1; return;
  }
  tumbang();
}
function tumbang() {
  Bunyi.sfx('tumbang'); goyang(0.8); vignette(); kilatLayar('#ff6060', 0.35);
  semburan(P.x, 1, 0, 30, { warna: [HEROES[D.hero].col, '#2e2620'], kec: 8 });
  if (G.bangkitSisa > 0) {
    G.keadaan = 'bangkit';
    const s = buatSoal(D.tingkat, Math.min(0, G.adapt));
    setTimeout(() => UI.bukaBangkit(s, 8, (benar) => {
      if (benar) {
        G.bangkitSisa--; G.benar++; G.keadaan = 'main'; G.kebal = 2.5; G.dip = 0.6; Bunyi.sfx('benar');
        for (const o of G.objek) if (!o.selesai && o.w - G.dist < 45 && !['koin', 'jawab', 'bendera'].includes(o.tipe)) lemparObjek(o);
        UI.sepanduk(UI.tx().bangkit, 'emas'); gelombangKejut(P.x, 0.8, 0, '#ffd86a', 8); P.y = 0; P.vy = 0; P.diUdara = false;
      } else { G.salah++; G.catatan.push({ teks: s.teks, jawab: s.jawab, cara: s.cara }); selesaiLari(); }
    }), 500);
  } else { G.keadaan = 'bangkit'; setTimeout(selesaiLari, 900); }
}
function selesaiLari() {
  G.keadaan = 'hasil'; Bos.selesai(); UI.bosBar(-1); UI.panelSoal(null);
  const jarak = Math.floor(G.dist), skor = Math.floor(G.skor);
  tambahMisi('jarak', jarak, true); tambahMisi('koin', G.koinDiambil, true);
  const hadiah = G.misi.filter((m) => m.ok).reduce((a, m) => a + m.hadiah, 0);
  const rekorBaru = skor > D.rekor;
  if (rekorBaru) D.rekor = skor; if (jarak > D.jarakRekor) D.jarakRekor = jarak;
  D.koin += G.koinDiambil + hadiah; simpanD();
  Bunyi.musikMode('menu');
  if (rekorBaru) Bunyi.sfx('menang');
  UI.bukaHasil({ skor, jarak, koin: G.koinDiambil, benar: G.benar, salah: G.salah, musuh: G.musuh, misi: G.misi, catatan: G.catatan, rekorBaru });
}

/* ---------- jawaban gerbang & bos ---------- */
function jawabGerbang(nilai) {
  const sl = G.soal, s = sl.s, H = D.hero === 'sihir';
  sl.jawaban = nilai; sl.tampil = 2.6;
  for (const o of G.objek) if (o.tipe === 'jawab' && o.opsi.gerbang === sl.id) {
    const ok = o.opsi.nilai === s.jawab; o.g.userData.rangka.color.set(ok ? '#8fc987' : '#e07a6a'); o.g.userData.rangka.emissive.set(ok ? '#8fc987' : '#e07a6a');
    if (o.opsi.nilai === nilai) { lemparObjek(o); semburan(o.x, 1.9, 0, 40, { warna: ok ? ['#ffd86a', '#ffffff', '#8fc987'] : ['#e07a6a', '#3a2f5a'], kec: 8, ukuran: 0.25 }); }
  }
  if (nilai === s.jawab) {
    G.benar++; G.beruntun++; G.beruntunMaks = Math.max(G.beruntunMaks, G.beruntun); G.mult = Math.min(5, G.mult + 1);
    const tambah = Math.round(200 * G.mult * (H ? 1.5 : 1)); G.bonus += tambah; G.meter = Math.min(100, G.meter + (H ? 50 : 35));
    Bunyi.sfx('benar'); kilatLayar('#fff3c4', 0.35); gelombangKejut(P.x, 1.2, -1, '#8fc987', 7);
    teksMelayang('+' + tambah, new THREE.Vector3(P.x, 2.6, -2), 'emas'); UI.pulseChip('hMultC');
    tambahMisi('benar', 1); tambahMisi('kombo', G.beruntun, true);
    if (G.beruntun >= 3 && G.beruntun % 3 === 0) { G.meter = 100; Bunyi.sfx('kombo'); UI.sepanduk(UI.tx().kombo, 'emas', '×' + G.mult); }
    else UI.sepanduk(UI.tx().benar, 'emas', UI.tx().pengali + ' ×' + G.mult);
    if (G.beruntun >= 3) G.adapt = Math.min(3, G.adapt + 1);
  } else {
    G.salah++; G.beruntun = 0; G.mult = 1; G.adapt = Math.max(-2, G.adapt - 1);
    G.catatan.push({ teks: s.teks, jawab: s.jawab, cara: s.cara });
    Bunyi.sfx('salah'); UI.sepanduk(UI.tx().salah, 'merah', s.teks + ' = ' + s.jawab);
  }
}
let bosSoal = null;
const apiBos = {
  waktu: 0, lajurPemain: 0,
  lempar(l, jarak) { const o = spawn('bom', l, G.dist + jarak); o.t = 0; Bunyi.sfx('lempar'); },
  bolaJawab() {
    const s = buatSoal(D.tingkat, Math.min(1, G.adapt)); bosSoal = { s, id: Math.random(), jawaban: null, tampil: 0, w: G.dist + 54, wAwal: G.dist };
    [-1, 0, 1].forEach((l, i) => { const o = spawn('bolaJawab', l, G.dist + 54, { nilai: s.pilihan[i] }); aturPanel(o.g, s.pilihan[i], { w: 256, h: 256, warna: '#ffffff', garis: '#1a2450', ukuran: 140 }); });
  }
};
const proyektil = [];
function jawabBos(o) {
  const s = bosSoal.s, ok = o.opsi.nilai === s.jawab; bosSoal.jawaban = o.opsi.nilai; bosSoal.tampil = 2.4;
  for (const b of G.objek) if (b.tipe === 'bolaJawab' && b !== o) { b.selesai = true; b.g.visible = false; }
  if (ok) {
    G.benar++; G.beruntun++; G.beruntunMaks = Math.max(G.beruntunMaks, G.beruntun); tambahMisi('benar', 1); tambahMisi('kombo', G.beruntun, true);
    Bunyi.sfx('benar'); o.selesai = true;
    const p = new THREE.Vector3(o.x, 1.1, 0); o.g.position.copy(p);
    o.proyektil = true; proyektil.push({ o, t: 0, dari: p.clone() });
  } else {
    G.salah++; G.beruntun = 0; G.mult = 1; G.catatan.push({ teks: s.teks, jawab: s.jawab, cara: s.cara });
    o.selesai = true; o.g.visible = false; Bunyi.sfx('bom'); Bunyi.sfx('salah'); semburan(o.x, 1, 0, 40, { warna: ['#ff8a2a', '#3a2f5a', '#ffd23a'], kec: 10 }); goyang(0.5);
    UI.sepanduk(UI.tx().salah, 'merah', s.teks + ' = ' + s.jawab);
    if (G.koin > 0) { G.koin = 0; Bunyi.sfx('koinHambur'); vignette(); }
    setTimeout(() => { if (Bos.aktif) Bos.luput(); }, 900);
  }
}
function kalahkanBos() {
  G.bonus += 1000; G.bosMenang++; tambahMisi('bos', 1);
  Bunyi.sfx('menang'); kilatLayar('#ffffff', 0.8); goyang(0.9);
  UI.sepanduk(UI.tx().bosKalah, 'emas', '+1000'); UI.bosBar(-1);
  for (let i = 0; i < 30; i++) spawn('koin', [-1, 0, 1][i % 3], G.dist + 30 + Math.floor(i / 3) * 4, { y: 0.9 });
  setTimeout(() => {
    G.zona = (G.zona + 1) % 3; G.bosBerikut = G.dist + 1200; G.gerbangBerikut = G.dist + 260; G.kursor = Math.max(G.kursor, G.dist + 90);
    Bunyi.sfx('zona'); Bunyi.musikMode('lari'); UI.sepanduk(UI.tx().zona[G.zona], 'biru', 'ZONA ' + (G.zona + 1));
  }, 2400);
}

function lemparObjek(o) { o.selesai = true; o.terlempar = { vx: (Math.random() - 0.5) * 14, vy: 9 + Math.random() * 5, vz: -6, r: Math.random() * 8 }; }

/* ---------- pembaruan tiap frame ---------- */
const TK = () => TINGKAT[D.tingkat];
function perbaruiMain(dt) {
  const tk = TK();
  // laju
  G.lajuDasar = Math.min(tk.lajuMaks, tk.lajuAwal + tk.naik * G.dist / 100);
  const soalTerbuka = (G.soal && G.soal.jawaban === null) || (bosSoal && bosSoal.jawaban === null);
  let target = G.lajuDasar * (soalTerbuka ? tk.lambatSoal : 1) * (G.boost > 0 ? 1.4 : 1) * (G.kilat > 0 ? 1.8 : 1) * G.dip;
  if (D.hero === 'bayang') target *= 1.04;
  G.laju += (target - G.laju) * Math.min(1, dt * 3);
  G.dip += (1 - G.dip) * Math.min(1, dt * 1.5);
  G.dist += G.laju * dt;
  G.skor = G.dist + G.koinDiambil * 10 + G.bonus;
  // pengatur waktu
  G.kilat = Math.max(0, G.kilat - dt); G.magnet = Math.max(0, G.magnet - dt); G.kebal = Math.max(0, G.kebal - dt); G.boost = Math.max(0, G.boost - dt); G.koinJeda -= dt;
  if (G.koinJeda <= 0) G.koinBeruntun = 0;
  if (G.meter >= 100 && !G.kilatSiapDiumumkan) { G.kilatSiapDiumumkan = true; Bunyi.sfx('kilatSiap'); UI.toast('zap', UI.tx().kilatSiap); }
  if (G.meter < 100) G.kilatSiapDiumumkan = false;
  // pemain
  const tx = P.lajur * LAJUR; P.vx = tx - P.x; P.x += (tx - P.x) * Math.min(1, dt * 14);
  if (P.diUdara) {
    P.vy -= 30 * dt; P.y += P.vy * dt;
    if (P.y <= 0) {
      P.y = 0; P.vy = 0; P.diUdara = false; P.putarLompat = false; P.squash = 0.5; Bunyi.sfx('mendarat');
      semburan(P.x, 0.1, 0.4, 8, { warna: ['#ffffff', '#e8d8b8'], kec: 3, naik: 0.4, ukuran: 0.15 });
      if (P.gulingNanti) { P.gulingNanti = false; P.guling = 0.55; Bunyi.sfx('guling'); }
      if (P.bufLompat > 0) lompat(11.5);
    }
  }
  P.bufLompat = Math.max(0, P.bufLompat - dt); P.guling = Math.max(0, P.guling - dt);
  P.squash += ((P.diUdara && P.vy > 0 ? -0.25 : 0) - P.squash) * Math.min(1, dt * 10);
  if (!P.diUdara && !P.guling && Math.random() < dt * 14) semburan(P.x + (Math.random() - 0.5), 0.1, 0.6, 1, { warna: G.zona === 2 ? '#5ef0ff' : '#efe0c0', kec: 1.5, naik: 0.6, ukuran: 0.12, umur: 0.4 });
  if (G.kilat > 0) { jejak(C, HEROES[D.hero].col, dt); if (Math.random() < 0.6) semburan(P.x, 0.8, 0.8, 2, { warna: ['#ffd86a', '#ffffff'], kec: 3, gravitasi: 0, umur: 0.4, vz: 6 }); }

  isiJalur();
  // bos
  if (!Bos.aktif && G.dist >= G.bosBerikut && !G.soal) {
    Bos.mulai(); bosSoal = null; Bunyi.sfx('sirene'); Bunyi.musikMode('bos'); UI.sepanduk(UI.tx().bos, 'merah', UI.tx().bosT); UI.bosBar(3); goyang(0.3);
  }
  apiBos.waktu = G.waktu; apiBos.lajurPemain = P.lajur;
  const bosAktifSebelum = Bos.aktif;
  Bos.perbarui(dt, apiBos);
  if (Bos.aktif && Bos.fase !== 'kalah') UI.bosBar(Bos.nyawa);
  if (bosAktifSebelum && !Bos.aktif) bosSoal = null;
  // proyektil bola jawaban → bos
  for (let i = proyektil.length - 1; i >= 0; i--) {
    const pr = proyektil[i]; pr.t += dt / 0.55; const k = Math.min(1, pr.t), bp = Bos.model.position;
    pr.o.g.position.set(pr.dari.x + (bp.x - pr.dari.x) * k, pr.dari.y + (bp.y + 1 - pr.dari.y) * k + Math.sin(k * Math.PI) * 4, pr.dari.z + (bp.z - pr.dari.z) * k);
    pr.o.g.rotation.x += dt * 12;
    if (Math.random() < 0.8) semburan(pr.o.g.position.x, pr.o.g.position.y + 1.1, pr.o.g.position.z, 2, { warna: ['#ffd86a', '#7f9fd9'], kec: 2, gravitasi: 0, umur: 0.35 });
    if (k >= 1) {
      proyektil.splice(i, 1); pr.o.g.visible = false; Bunyi.sfx('bosKena'); hitStop = 0.12;
      const kalah = Bos.kena(); UI.bosBar(Bos.nyawa);
      teksMelayang('+300', new THREE.Vector3(bp.x, bp.y + 3, bp.z), 'emas'); G.bonus += 300;
      if (kalah) kalahkanBos();
    }
  }
  perbaruiObjek(dt);
  // panel soal
  const sl = G.soal || bosSoal;
  if (sl) {
    const T = UI.tx();
    if (sl.jawaban === null) {
      const sisa = (sl.w - G.dist) / Math.max(1, sl.w - sl.wAwal);
      UI.panelSoal({ judul: G.soal ? T.gerbang + ' · ' + T.larike : T.bosT, teks: sl.s.teks + ' = ?', sisa });
    } else {
      sl.tampil -= dt; const ok = sl.jawaban === sl.s.jawab;
      UI.panelSoal({ judul: ok ? T.benar : T.salah, teks: sl.s.teks + ' = ' + sl.s.jawab, cara: ok || sl.s.cara === sl.s.teks + ' = ' + sl.s.jawab ? '' : sl.s.cara, sisa: 0, status: ok ? 'benar' : 'salah' });
      if (sl.tampil <= 0) { if (sl === G.soal) G.soal = null; else bosSoal = null; UI.panelSoal(null); }
    }
  }
  // rekor
  if (!G.rekorLewat && D.jarakRekor > 150 && G.dist > D.jarakRekor) { G.rekorLewat = true; UI.sepanduk(UI.tx().rekorBaru, 'emas'); Bunyi.sfx('kombo'); }
  tambahMisi('jarak', Math.floor(G.dist), true);
  // auto-kualitas bila lambat
  if (G.fps < 32 && R.kualitas === 'tinggi') { G.waktuRendah += dt; if (G.waktuRendah > 4) { ubahKualitas('ringan'); G.waktuRendah = 0; } } else G.waktuRendah = 0;
}

const _v = new THREE.Vector3();
function perbaruiObjek(dt) {
  const tarikSemua = D.hero === 'pemanah';
  for (let i = G.objek.length - 1; i >= 0; i--) {
    const o = G.objek[i]; let z = G.dist - o.w; o.t += dt;
    if (o.proyektil) { if (!o.g.visible) { lepas(o.tipe, o.g); G.objek.splice(i, 1); } continue; }
    if (o.terlempar) {
      const v = o.terlempar; v.vy -= 30 * dt; o.g.position.x += v.vx * dt; o.g.position.y += v.vy * dt; o.g.position.z += (v.vz + 0) * dt; o.g.rotation.x += v.r * dt; o.g.rotation.z += v.r * dt * 0.6;
      if (o.g.position.y < -8 || o.t > 3) { lepas(o.tipe, o.g); G.objek.splice(i, 1); }
      continue;
    }
    if (o.tipe === 'koin' && o.tarik) {
      o.g.position.x += (P.x - o.g.position.x) * Math.min(1, dt * 14); o.g.position.y += (P.y + 0.9 - o.g.position.y) * Math.min(1, dt * 14); o.g.position.z += (0 - o.g.position.z) * Math.min(1, dt * 14);
      if (Math.abs(o.g.position.z) < 0.6 && Math.abs(o.g.position.x - P.x) < 0.8) { ambilKoin(o); lepas(o.tipe, o.g); G.objek.splice(i, 1); }
      continue;
    }
    if (o.tipe === 'bendera') { o.g.position.set(o.x, 0, z); if (z > 25) { lepas(o.tipe, o.g); G.objek.splice(i, 1); } continue; }
    // gerak khusus
    let x = o.x, y = o.y;
    if (o.tipe === 'bola') { const a = o.opsi.ayun; x = (0.5 * a + 0.5 * a * Math.sin(G.waktu * 2.6 + o.w)) * LAJUR; o.x = x; }
    if (o.tipe === 'comot' || o.tipe === 'terbang') { const tb = o.g.userData.tb; tb.position.y = (o.tipe === 'terbang' ? 1.35 + Math.sin(G.waktu * 4 + o.w) * 0.2 : Math.abs(Math.sin(G.waktu * 8 + o.w)) * 0.12); tb.rotation.y = Math.PI; if (o.g.userData.baling) o.g.userData.baling.rotation.y += dt * 30; }
    if (o.tipe === 'bom') {
      const jatuh = Math.min(1, o.t / 0.7); y = 9 * (1 - jatuh * jatuh); o.g.userData.b.position.y = 0.6 + y; o.g.children[1].position.y = 1.25 + y; o.g.userData.api.position.y = 1.45 + y; y = 0;
      o.g.userData.api.scale.setScalar(0.12 + Math.random() * 0.08); o.g.userData.tanda.material.opacity = 0.35 + Math.sin(o.t * 20) * 0.2;
    }
    o.g.position.set(x, y, z);
    if (o.g.userData.putar) o.g.userData.putar.rotation.y = G.waktu * 4 + o.w;
    if (o.g.userData.cincin) o.g.userData.cincin.rotation.set(Math.PI / 2 + Math.sin(G.waktu * 2) * 0.4, G.waktu * 2, 0);
    if (o.tipe === 'bolaJawab' && !o.selesai) { o.g.userData.b.rotation.y = G.waktu * 2; o.g.position.y = Math.abs(Math.sin(G.waktu * 5 + o.l)) * 0.5; }
    // munculan halus dari bawah di kejauhan
    if (z < -130) o.g.position.y -= (-130 - z) * 0.15;
    if (o.tipe === 'koin' && z > 2) o.g.visible = false;
    if (o.selesai) { if (z > 15) { lepas(o.tipe, o.g); G.objek.splice(i, 1); } continue; }
    const dx = Math.abs(x - P.x);
    // magnet / Mochi / Kilat menarik koin
    if (o.tipe === 'koin' && z > -14 && z < 1) {
      if ((G.magnet > 0 && (tarikSemua || dx < LAJUR * 1.6)) || (G.kilat > 0 && dx < LAJUR * 1.2)) { o.tarik = true; continue; }
      if (mochi && z > -0.8 && Math.abs(x - mochi.position.x) < 1.2) { ambilKoin(o); semburan(x, 0.9, 0, 4, { warna: '#ffe58a', kec: 3 }); o.selesai = true; o.g.visible = false; continue; }
    }
    // Kilat menghancurkan rintangan di depan
    if (G.kilat > 0 && z > -3 && z < 1 && dx < 1.6 && ['pagar', 'gapura', 'tembok', 'comot', 'terbang', 'bola', 'bom'].includes(o.tipe)) {
      lemparObjek(o); semburan(x, 1, z, 18, { warna: ['#ffd86a', '#ffffff', '#3a2f5a'], kec: 9 }); G.bonus += 20; if (o.tipe === 'comot' || o.tipe === 'terbang') { G.musuh++; tambahMisi('musuh', 1); } Bunyi.sfx('musuh'); goyang(0.15); continue;
    }
    const hd = { koin: 0.6, merah: 0.7, pagar: 0.45, gapura: 0.35, tembok: 0.65, comot: 0.6, terbang: 0.6, bola: 0.6, kolam: 2, pegas: 0.7, pad: 1.5, magnet: 0.7, perisai: 0.7, isiKilat: 0.7, jawab: 0.4, bom: 0.6, bolaJawab: 0.8 }[o.tipe] || 0.5;
    if (o.tipe === 'jawab') { if (z >= 0 && G.soal && G.soal.id === o.opsi.gerbang && G.soal.jawaban === null) { const nilai = G.objek.find((q) => q.tipe === 'jawab' && q.opsi.gerbang === o.opsi.gerbang && q.l === P.lajur).opsi.nilai; jawabGerbang(nilai); } if (z >= 0) o.selesai = true; continue; }
    if (o.tipe === 'bolaJawab') { if (z > -hd && z < hd && dx < 1.3 && bosSoal && bosSoal.jawaban === null) jawabBos(o); else if (z > hd + 1) { o.selesai = true; if (bosSoal && bosSoal.jawaban === null && !G.objek.some((q) => q.tipe === 'bolaJawab' && !q.selesai)) { bosSoal = null; UI.panelSoal(null); Bos.luput(); } } continue; }
    if (z < -hd || z > hd) { if (o.tipe === 'bom' && z > hd && !o.meledak) { o.meledak = true; o.selesai = true; o.g.visible = false; semburan(x, 0.6, z, 20, { warna: ['#ff8a2a', '#ffd23a', '#3a2f5a'], kec: 7 }); Bunyi.sfx('bom'); goyang(0.2); } continue; }
    const lebar = o.tipe === 'kolam' ? 5 : 1.25;
    if (dx > lebar) continue;
    tabrak(o, x);
  }
}
function ambilKoin(o) {
  if (o.tipe === 'merah') { G.koinDiambil += 25; G.bonus += 250; Bunyi.sfx('power'); teksMelayang('+25', _v.set(P.x, 2.4, -1), 'emas'); return; }
  G.koin++; G.koinDiambil++; G.meter = Math.min(100, G.meter + 1.2); G.koinBeruntun++; G.koinJeda = 0.6;
  Bunyi.sfx('koin', G.koinBeruntun); UI.pulseChip('hKoinC');
  semburan(P.x, P.y + 1, -0.5, 3, { warna: ['#ffd86a', '#ffffff'], kec: 3, ukuran: 0.12, umur: 0.35, gravitasi: 2 });
}
function tabrak(o, x) {
  const t = o.tipe, putar = P.guling > 0 || (P.diUdara && P.putarLompat);
  if (t === 'koin' || t === 'merah') { if (Math.abs(P.y + 0.6 - (o.y || 0.9)) < 1.6) { ambilKoin(o); o.selesai = true; o.g.visible = false; } return; }
  if (t === 'magnet' || t === 'perisai' || t === 'isiKilat') {
    o.selesai = true; o.g.visible = false; Bunyi.sfx('power'); semburan(x, 1.1, 0, 20, { warna: ['#ffffff', '#5ec8ff', '#ffd86a'], kec: 5 });
    if (t === 'magnet') { G.magnet = G.magnetMaks; UI.toast('target', UI.tx().magnet); }
    if (t === 'perisai') { G.perisai = 1; UI.toast('shield', UI.tx().perisai); }
    if (t === 'isiKilat') { G.meter = Math.min(100, G.meter + 50); UI.toast('zap', '+50%'); }
    return;
  }
  if (t === 'pegas') { if (P.y < 0.8) { o.selesai = true; lompat(19); P.putarLompat = true; semburan(x, 1, 0, 16, { warna: ['#ffd23a', '#ffffff'], kec: 6 }); UI.sepanduk(UI.tx().pegas, 'biru'); o.g.userData.atas.position.y = 1.3; } return; }
  if (t === 'pad') { if (P.y < 0.4) { o.selesai = true; G.boost = 1.2; Bunyi.sfx('pad'); kilatLayar('#ffe58a', 0.18); goyang(0.1); } return; }
  if (t === 'pagar') { if (P.y < 0.95) { o.selesai = true; kena('pagar'); } return; }
  if (t === 'gapura') { if (P.guling <= 0) { o.selesai = true; kena('gapura'); } return; }
  if (t === 'tembok') { if (P.y < 3.1) { o.selesai = true; kena('tembok'); } return; }
  if (t === 'bola') { if (P.y < 1.6) { o.selesai = true; kena('bola'); } return; }
  if (t === 'bom') { if (P.y < 1.4) { o.selesai = true; o.g.visible = false; Bunyi.sfx('bom'); semburan(x, 0.8, 0, 30, { warna: ['#ff8a2a', '#ffd23a', '#3a2f5a'], kec: 9 }); kena('bom'); } return; }
  if (t === 'kolam') { if (P.y < 0.15) { o.selesai = true; if (G.kebal > 0 || G.perisai > 0) { G.perisai = 0; lompat(13); } else kena('kolam'); } return; }
  if (t === 'comot' || t === 'terbang') {
    const hancur = t === 'comot' ? (putar && (P.guling > 0 || P.y > 0.25)) : (P.diUdara && P.y > 0.5);
    const lewat = t === 'terbang' && P.guling > 0;
    if (lewat) return;
    if (hancur) {
      lemparObjek(o); G.musuh++; G.bonus += 50; tambahMisi('musuh', 1); hitStop = 0.06; Bunyi.sfx('musuh'); goyang(0.2);
      semburan(x, 1, 0, 26, { warna: ['#5f7fd8', '#ffffff', '#ff4060', '#ffd86a'], kec: 8, ukuran: 0.22 });
      teksMelayang('+50', _v.set(x, 2.2, -1)); if (P.diUdara) { P.vy = 9; P.lompatSisa = 1; }
    } else { o.selesai = true; kena(t); }
  }
}

/* ---------- kamera ---------- */
const lihat = new THREE.Vector3(), posK = new THREE.Vector3();
function perbaruiKamera(dt, t) {
  const sasaran = G.keadaan === 'menu' ? 0 : 1;
  kameraK += (sasaran - kameraK) * Math.min(1, dt * 2.2);
  const k = kameraK * kameraK * (3 - 2 * kameraK);
  // menu: 3/4 depan-samping, wajah Clawd terlihat
  const sempit = window.innerWidth < 720;
  const mx = 6.4 + Math.sin(t * 0.35) * 0.8, my = 2.2, mz = -4.2 + Math.cos(t * 0.35) * 0.6;
  const lx = sempit ? -0.6 : 0.6, ly = sempit ? -3.2 : 1.0, lz = sempit ? 0.8 : 3.4;
  const tegak = R.camera.aspect < 1;
  const gx = P.x * (tegak ? 0.6 : 0.85), gy = (tegak ? 5.2 : 4.0) + P.y * 0.45, gz = tegak ? 9.6 : 7.2;
  posK.set(mx + (gx - mx) * k, my + (gy - my) * k, mz + (gz - mz) * k);
  const sh = getaran(t); posK.x += sh.x; posK.y += sh.y;
  R.camera.position.copy(posK);
  lihat.set(lx * (1 - k) + P.x * 0.7 * k, ly * (1 - k) + (1.4 + P.y * 0.3) * k, lz * (1 - k) - 9 * k);
  R.camera.lookAt(lihat);
  R.camera.rotation.z += -P.vx * 0.012 * k + sh.r;
  const fov = (tegak ? 72 : 64) * (1 - k) + ((tegak ? 74 : 62) + Math.max(0, G.laju - 24) * 0.42 + (G.kilat > 0 ? 10 : 0)) * k;
  if (Math.abs(R.camera.fov - fov) > 0.05) { R.camera.fov += (fov - R.camera.fov) * Math.min(1, dt * 5); R.camera.updateProjectionMatrix(); }
  R.bloom.strength = 0.42 + (G.kilat > 0 ? 0.5 : 0) + (G.zona === 2 && G.keadaan !== 'menu' ? 0.35 : 0);
  R.bloom.threshold = G.zona === 2 && G.keadaan !== 'menu' ? 0.7 : 0.95;
}

/* ---------- gelung ---------- */
let akhir = performance.now(), hitStop = 0, fpsAkum = 0, fpsN = 0;
function gelung(sekarang) {
  requestAnimationFrame(gelung);
  let dt = Math.min(1 / 30, (sekarang - akhir) / 1000); akhir = sekarang;
  fpsAkum += dt; fpsN++; if (fpsAkum > 1) { G.fps = fpsN / fpsAkum; fpsAkum = 0; fpsN = 0; }
  if (hitStop > 0) { hitStop -= dt; dt *= 0.15; }
  const jalan = G.keadaan === 'main' || G.keadaan === 'menu' || G.keadaan === 'hitung';
  if (G.keadaan !== 'jeda') G.waktu += dt;
  if (G.keadaan === 'menu') { G.laju += (14 - G.laju) * Math.min(1, dt * 2); G.dist += G.laju * dt; P.x += (0 - P.x) * dt * 4; P.lajur = 0; P.y = 0; P.diUdara = false; P.guling = 0; }
  if (G.keadaan === 'hitung') {
    const sblm = Math.ceil(3 - hitungT); hitungT += dt; const n = Math.ceil(3 - hitungT);
    G.laju += (TINGKAT[D.tingkat].lajuAwal * 0.5 - G.laju) * dt * 2; G.dist += G.laju * dt;
    if (n !== sblm || hitungT === dt) { if (n > 0) { UI.hitungMundur(n); Bunyi.sfx('hitung', 0); } }
    if (hitungT >= 3) { G.keadaan = 'main'; UI.hitungMundur(UI.tx().lari, true); Bunyi.sfx('hitung', 1); setTimeout(() => { if ($('hitung').textContent === UI.tx().lari) $('hitung').innerHTML = ''; }, 800); G.kursor = G.dist + 30; }
  }
  if (G.keadaan === 'main') perbaruiMain(dt);
  if (jalan || G.keadaan === 'bangkit' || G.keadaan === 'hasil') {
    const lajuDunia = G.keadaan === 'main' || G.keadaan === 'menu' || G.keadaan === 'hitung' ? G.laju : 0;
    perbaruiDunia(G.dist, dt, G.waktu, G.keadaan === 'menu' ? 0 : G.zona);
    LENGKUNG.uBend.value = Math.sin(G.dist * 0.004) * 0.0009;
    P.laju = lajuDunia; P.kebal = G.kebal; P.perisai = G.perisai; P.kilat = G.kilat > 0;
    C.akar.position.set(P.x, P.y, 0);
    if (G.keadaan !== 'bangkit' && G.keadaan !== 'hasil') animasiClawd(C, P, G.waktu, dt);
    if (mochi) {
      const sisi = P.lajur < 1 ? 1 : -1; mochi.position.x += (P.x + sisi * LAJUR - mochi.position.x) * Math.min(1, dt * 6); mochi.position.z = 0.6;
      mochi.userData.kaki.forEach((kk, i) => { kk.rotation.x = Math.sin(G.waktu * 22 + i * Math.PI) * 0.8; }); mochi.position.y = Math.abs(Math.sin(G.waktu * 11)) * 0.15;
    }
    perbaruiEfek(dt, lajuDunia, G.keadaan === 'main' ? G.laju : 0, G.kilat > 0);
    Bunyi.musikIntensitas(G.kilat > 0 ? 1 : Math.min(1, G.laju / 50));
  }
  perbaruiKamera(dt, G.waktu);
  if (G.keadaan === 'main') UI.perbaruiHUD(G);
  gambar();
}
requestAnimationFrame(gelung);
Bunyi.musikMulai('menu'); Bunyi.musikMode('menu');
window.addEventListener('pointerdown', () => { Bunyi.buka(); Bunyi.musikMulai(G.keadaan === 'menu' ? 'menu' : 'lari'); }, { once: true });

/* ---------- kait uji ---------- */
window.__game = {
  get keadaan() { return G.keadaan; },
  info() { return { keadaan: G.keadaan, jarak: Math.floor(G.dist), skor: Math.floor(G.skor), koin: G.koin, koinDiambil: G.koinDiambil, benar: G.benar, salah: G.salah, musuh: G.musuh, meter: Math.round(G.meter), kilat: G.kilat, lajur: P.lajur, y: +P.y.toFixed(2), zona: G.zona, bos: Bos.aktif ? Bos.fase + ':' + Bos.nyawa : '-', soal: (G.soal || bosSoal) ? (G.soal || bosSoal).s.teks : null, objek: G.objek.length, fps: Math.round(G.fps), kualitas: R.kualitas, laju: +G.laju.toFixed(1) }; },
  mulai() { mulaiLari(); }, lompat() { aksi('lompat'); }, guling() { aksi('guling'); }, kiri() { aksi('kiri'); }, kanan() { aksi('kanan'); }, kilat() { aksi('kilat'); },
  isiKilat() { G.meter = 100; },
  depan(jauh = 40) { return G.objek.filter((o) => !o.selesai && !o.terlempar && G.dist - o.w < 1 && G.dist - o.w > -jauh).map((o) => ({ tipe: o.tipe, l: Math.round(o.x / LAJUR), z: +(G.dist - o.w).toFixed(1) })); },
  kebal(s = 999) { G.kebal = s; },
  keGerbang() { for (const o of G.objek) if (o.w - G.dist < 120 && !['koin'].includes(o.tipe)) { lepas(o.tipe, o.g); o.hapus = true; } G.objek = G.objek.filter((o) => !o.hapus); G.gerbangBerikut = G.dist; G.kursor = G.dist + 20; G.soal = null; },
  /* pindah ke lajur jawaban benar/salah untuk gerbang/bos/bangkit yang aktif */
  jawabUji(benar) {
    if (G.keadaan === 'bangkit' && window.__bangkit) { window.__bangkit(benar); return 'bangkit'; }
    const sl = G.soal || bosSoal; if (!sl) return 'tidak ada soal';
    const tipe = G.soal ? 'jawab' : 'bolaJawab';
    const cocok = G.objek.filter((o) => o.tipe === tipe && !o.selesai && (G.soal ? o.opsi.gerbang === sl.id : true));
    const o = cocok.find((q) => (q.opsi.nilai === sl.s.jawab) === benar); if (!o) return 'tidak ketemu';
    P.lajur = o.l; return 'lajur ' + o.l;
  },
  keBos() { G.bosBerikut = G.dist + 2; G.soal = null; hapusObjek(); G.kursor = G.dist + 20; },
  lewati(m) { G.dist += m; G.kursor = G.dist + 30; hapusObjek(); },
  paksaKena() { G.kebal = 0; kena('uji'); },
  paksaTumbang() { G.kebal = 0; G.koin = 0; G.perisai = 0; kena('uji'); },
  jeda() { jeda(); }, lanjut() { lanjut(); }
};
