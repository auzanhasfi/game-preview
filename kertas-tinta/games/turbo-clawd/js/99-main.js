/* Turbo Clawd: alur game — menu dengan balapan demo, cerita, hitung mundur, balapan, kamera kejar, HUD, hasil */
import * as THREE from 'three';
import { SET, simpan, t, MOBIL, LAWAN, ARENA, CERITA } from './01-data.js';
import { buatSoal } from './02-soal.js';
import { Bunyi } from './03-bunyi.js';
import { bangunTrek, meshTrek, bingkaiBaru, W } from './04-trek.js';
import { R, siapkanRender, bangunDunia, TEMA, buatGerbang, buatKotak, WARNA_LAJUR } from './05-dunia.js';
import { buatMobil } from './06-mobil.js';
import { G, buatPembalap, langkah, letakkan, urutan, posisiDari, siapkanPartikel, bersihkanProj, hanyaPartikel, dS } from './07-balap.js';
import { $, isiIkon, terapkanTeks, tampil, aktif, cerita, lanjutCerita, lewatiCerita, toast, siapkanPeta, gambarPeta, renderArena, renderGarasi, renderAtur, renderBantuan, bintangHtml } from './08-ui.js';
import { ic } from './00-ikon.js';

/* ===== keadaan ===== */
let mode = 'muat';          // muat | menu | cerita | hitung | balap | jeda | hasil
let arenaKe = 0, duniaG = null, waktuSelesai = 0, hitungT = 0, loopDiumumkan = false, hasilTampil = false;
const fr = bingkaiBaru();
const input = { kemudi: 0, rem: false, drift: false, item: false };
const tombol = { kiri: false, kanan: false, rem: false, drift: false, item: false };
const camUp = new THREE.Vector3(0, 1, 0), lihat = new THREE.Vector3(), tujuanCam = new THREE.Vector3();
const sentuh = matchMedia('(pointer: coarse)').matches;
if (sentuh) document.body.classList.add('sentuh');

/* ===== siapkan ===== */
siapkanRender($('kanvas'));
siapkanPartikel(R.scene);
isiIkon(); terapkanTeks();
Bunyi.set(SET.suara);

function bersihkanArena() {
  bersihkanProj();
  if (duniaG) { R.scene.remove(duniaG); duniaG.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
  duniaG = new THREE.Group(); R.scene.add(duniaG);
  G.pembalap = []; G.kotak = []; G.gerbang = []; G.gerbangAbs = []; G.soal = []; G.urutanFinis = []; G.waktu = 0;
}

function muatArena(i, demo) {
  bersihkanArena();
  arenaKe = i;
  const def = ARENA[i];
  const trek = bangunTrek(def); G.trek = trek; G.putaran = def.putaran; G.demo = !!demo;
  duniaG.add(meshTrek(trek, TEMA[def.tema].tiang));
  duniaG.add(bangunDunia(trek, def.tema));
  // gerbang angka
  for (const f of def.gerbang) { const s = trek.aman(f, 20); const gb = buatGerbang(trek, s); duniaG.add(gb.g); G.gerbang.push(gb); }
  G.gerbang.sort((a, b) => a.s - b.s);
  for (let k = 0; k < G.putaran; k++) G.gerbang.forEach((gb, gi) => { G.gerbangAbs.push({ s: k * trek.L + gb.s, gi }); G.soal.push(buatSoal(SET.level)); });
  // kotak item (4 sebaris)
  for (const f of def.kotak) { const s = trek.aman(f, 8); for (const x of [-5.1, -1.7, 1.7, 5.1]) { const b = buatKotak(trek, s, x); duniaG.add(b.mesh); G.kotak.push(b); } }
  // pembalap: 5 lawan + pemain
  const grid = [[-3.2, -8], [3.2, -8], [-3.2, -17], [3.2, -17], [-3.2, -26], [3.2, -26]];
  const slotPemain = demo ? -1 : (def.akhir ? 5 : 3);
  let gi = 0;
  def.lawan.forEach((li, n) => {
    if (gi === slotPemain) gi++;
    const L = LAWAN[li];
    const raja = !!L.raja;
    const mobil = buatMobil({ col: L.col, c2: L.c2, supir: 'comot', raja });
    duniaG.add(mobil.akar);
    const [x, s] = grid[gi++];
    G.pembalap.push(buatPembalap({ id: n + 1, nama: L.nama, warna: L.col, mobil, s, x, berat: raja ? 1.6 : 1, st: { v: (raja ? 66 : 64) + (SET.level === 'sulit' ? 1.5 : 0), a: 0.9, g: 15 },
      ai: { skill: L.skill * (SET.level === 'mudah' ? 0.95 : 1), akur: L.akur, fase: Math.random() * 6, bias: (Math.random() - 0.5) * 3, tItem: 2, keputusan: -1, lajur: 1, lajurBenar: false, raja, tBom: 6 } }));
  });
  if (!demo) {
    const M = MOBIL[SET.mobil] || MOBIL[0];
    const mobil = buatMobil({ col: M.col, c2: M.c2, supir: 'clawd' }); duniaG.add(mobil.akar);
    const [x, s] = grid[slotPemain];
    const pm = buatPembalap({ id: 0, nama: 'Clawd', warna: '#ffffff', mobil, s, x, berat: M.b, st: { v: M.v, a: M.a, g: M.g }, pemain: true });
    G.pembalap.push(pm); G.pemain = pm;
  } else {
    G.pemain = G.pembalap[0];
  }
  for (const r of G.pembalap) letakkan(r);
  siapkanPeta(trek, G.gerbang);
  loopDiumumkan = false;
}

/* ===== kamera ===== */
function kamera(dt, demo) {
  const pm = G.pemain, cam = R.cam;
  G.trek.bingkai(pm.s, fr);
  const pos = pm.mobil.akar.position;
  const k = 1 - Math.exp(-dt * (fr.loop ? 10 : 7));
  if (demo) {
    const a = G.waktu * 0.25;
    tujuanCam.copy(pos).addScaledVector(fr.t, -12 * Math.cos(a)).addScaledVector(fr.r, 12 * Math.sin(a) + 6).addScaledVector(fr.u, 5);
  } else {
    const jauh = 7.6 + Math.min(2, pm.v / 45) + (pm.boost > 0 ? 1.2 : 0);
    tujuanCam.copy(pos).addScaledVector(fr.t, -jauh).addScaledVector(fr.u, 3.3 + pm.h * 0.15);
  }
  cam.position.lerp(tujuanCam, k);
  camUp.lerp(fr.u, 1 - Math.exp(-dt * 5)).normalize(); cam.up.copy(camUp);
  lihat.copy(pos).addScaledVector(fr.t, demo ? 0 : 8).addScaledVector(fr.u, 1.4);
  if (G.goyang > 0) { cam.position.x += (Math.random() - 0.5) * G.goyang; cam.position.y += (Math.random() - 0.5) * G.goyang; G.goyang = Math.max(0, G.goyang - dt * 3); }
  cam.lookAt(lihat);
  // mobil lain yang menempel ke kamera disembunyikan supaya tidak menutup layar
  for (const r of G.pembalap) r.mobil.akar.visible = r === pm || r.mobil.akar.position.distanceToSquared(cam.position) > 16;
  const fov = 70 + Math.min(10, pm.v / 9) + (pm.boost > 0 ? 8 : 0);
  cam.fov += (fov - cam.fov) * Math.min(1, dt * 4); cam.updateProjectionMatrix();
}

/* ===== event dari fisika ===== */
let tSenggol = 0, tItemAcak = 0;
G.ev = (jenis, r, data) => {
  if (G.demo) return;
  const pm = G.pemain, dekat = r && r.s !== undefined ? Math.abs(dS(r.s, pm.s)) < 90 : false;
  switch (jenis) {
    case 'kena':
      if (r === pm) { Bunyi.sfx('kena'); toast(t('kena'), 'merah'); G.goyang = 1.2; kilat('rgba(255,60,80,.35)'); }
      else if (data === pm) { Bunyi.sfx('musuh'); toast(r.nama + ' · ' + t('kena'), 'kuning', true); }
      break;
    case 'perisaiPecah': if (r === pm) { Bunyi.sfx('perisaiPecah'); toast(t('perisaiPecah'), 'biru', true); } break;
    case 'item': {
      const nama = { roket: 'roket', bom: 'lempar', dorong: 'dorong', nitro: 'nitro', perisai: 'power' }[data];
      if (r === pm || dekat) Bunyi.sfx(nama);
      if (r === pm && data === 'nitro') kilat('rgba(57,208,255,.25)');
      break;
    }
    case 'ledak': { const d = Math.abs(dS(data && r ? r.s : 0, pm.s)); if (d < 140) { Bunyi.sfx('bom'); G.goyang = Math.max(G.goyang, 1.5 * (1 - d / 140)); } break; }
    case 'ledakKecil': Bunyi.sfx('bosKena'); break;
    case 'didorong': if (r === pm) { toast(t('item').dorong + '!', 'merah', true); G.goyang = 0.6; } break;
    case 'kotak': Bunyi.sfx('kotak'); tItemAcak = 0.6; break;
    case 'gerbang': {
      const { benar, soal, ke } = data;
      gerbangHasil = { ke, benar, sampai: G.waktu + 1.3 };
      if (benar) { Bunyi.sfx('benar'); setTimeout(() => Bunyi.sfx('kilat'), 120); toast(t('turboBenar'), 'hijau'); kilat('rgba(77,255,166,.28)'); }
      else { Bunyi.sfx('salah'); toast(`${t('jawaban')}: ${soal.jwb}`, 'merah'); }
      break;
    }
    case 'driftTurbo': Bunyi.sfx('pad'); toast(t('driftTurbo'), 'biru', true); break;
    case 'pad': if (r === pm) Bunyi.sfx('pad'); break;
    case 'dinding': Bunyi.sfx('mentok'); break;
    case 'lompat': Bunyi.sfx('pegas'); break;
    case 'mendarat': Bunyi.sfx('mendarat'); G.goyang = Math.max(G.goyang, 0.35); break;
    case 'senggol': if (G.waktu - tSenggol > 0.35) { tSenggol = G.waktu; Bunyi.sfx('senggol'); } break;
    case 'putaran': if (data === G.putaran) { toast(t('putaranAkhir'), 'kuning'); Bunyi.sfx('sirene'); } else { toast(`${t('putaran')} ${data}/${G.putaran}`, 'kuning', true); Bunyi.sfx('zona'); } break;
    case 'finis':
      if (r === pm) { const p = posisiDari(pm); toast(t('finis'), 'kuning'); Bunyi.sfx(p <= 2 ? 'menang' : 'tumbang'); waktuSelesai = G.waktu; Bunyi.mesin(false); }
      break;
  }
};
function kilat(warna) { const k = $('kilau'); k.style.transition = 'none'; k.style.background = warna; k.style.opacity = 1; requestAnimationFrame(() => { k.style.transition = 'opacity .5s'; k.style.opacity = 0; }); }

/* ===== HUD ===== */
let gerbangHasil = null, itemTampil = 'x';
function fmtWaktu(s) { s = Math.max(0, s); const m = Math.floor(s / 60), d = s - m * 60; return `${m}:${d < 10 ? '0' : ''}${d.toFixed(1)}`; }
function hud(dt) {
  const pm = G.pemain, L = G.trek.L;
  const p = posisiDari(pm);
  $('hPos').textContent = p + 1; $('hPosDari').textContent = '/' + G.pembalap.length;
  const put = Math.min(G.putaran, Math.max(1, Math.floor(pm.s / L) + 1));
  $('hPutaran').textContent = `${t('putaran')} ${put}/${G.putaran}`;
  $('hWaktu').textContent = fmtWaktu(pm.selesai ? pm.waktuFinis : G.waktu);
  $('hKec').textContent = Math.round(pm.v * 3.6);
  const dr = $('hDrift'); dr.style.width = (pm.muatan / 3 * 100) + '%'; dr.style.background = pm.muatan > 2 ? '#ff5df0' : pm.muatan > 1 ? '#ffb020' : '#39d0ff';
  $('garisKecepatan').classList.toggle('on', pm.boost > 0);
  // item
  tItemAcak -= dt;
  const slot = $('hItem');
  const kunci = tItemAcak > 0 ? 'acak' : (pm.item || '');
  if (kunci !== itemTampil) {
    itemTampil = kunci;
    if (kunci === 'acak') { slot.className = 'slot-ikon acak'; slot.innerHTML = ic('star', 36); $('hItemNama').textContent = ''; }
    else if (kunci) { slot.className = 'slot-ikon ada'; slot.innerHTML = ic(kunci, 38); $('hItemNama').textContent = t('item')[kunci]; }
    else { slot.className = 'slot-ikon'; slot.innerHTML = ''; $('hItemNama').textContent = ''; }
  }
  // soal gerbang
  const ke = pm.gerbangKe, gA = G.gerbangAbs[ke];
  const box = $('hSoal');
  if (gerbangHasil && G.waktu < gerbangHasil.sampai) {
    box.hidden = false;
    const soal = G.soal[gerbangHasil.ke];
    tulisSoal(soal, -1, soal.benar);
  } else if (gA && !pm.selesai && gA.s - pm.s < 210) {
    gerbangHasil = null;
    const soal = G.soal[ke];
    box.hidden = false;
    const lajur = pm.x < -W / 3 ? 0 : pm.x > W / 3 ? 2 : 1;
    tulisSoal(soal, lajur, -1);
    $('hSoalJarak').style.width = Math.max(0, Math.min(100, (1 - (gA.s - pm.s) / 210) * 100)) + '%';
  } else box.hidden = true;
  // gerbang 3D menampilkan soal berikutnya untuk pemain
  for (let j = ke; j < Math.min(G.gerbangAbs.length, ke + G.gerbang.length); j++) G.gerbang[G.gerbangAbs[j].gi].tulis(G.soal[j], j);
  // pengumuman loop
  if (!loopDiumumkan) { G.trek.bingkai(pm.s + 40, fr); if (fr.loop) { loopDiumumkan = true; toast(t('loop'), 'kuning', true); } }
  gambarPeta(G.pembalap, pm, G.trek);
}
let soalTerakhir = '';
function tulisSoal(soal, lajur, benar) {
  const kunci = soal.teks + lajur + '/' + benar;
  if (kunci === soalTerakhir) return; soalTerakhir = kunci;
  $('hSoalTeks').textContent = soal.teks + ' = ?';
  $('hSoalPil').innerHTML = soal.pilihan.map((v, k) => `<div style="background:${WARNA_LAJUR[k]}" class="${k === lajur ? 'disini' : ''} ${k === benar ? 'benar' : ''}">${v}</div>`).join('');
}

/* ===== alur ===== */
function keMenu() {
  mode = 'menu'; $('hud').hidden = true; $('hitung').hidden = true; Bunyi.mesin(false);
  muatArena(Math.floor(Math.random() * ARENA.length), true);
  for (const r of G.pembalap) r.s += 300;
  tampil('menu'); Bunyi.musikMode('menu');
}
function mulaiArena(i, denganCerita = true) {
  muatArena(i, false);
  mode = 'cerita'; $('hud').hidden = true;
  const judul = `Arena ${i + 1} · ${ARENA[i].nama[SET.bhs]}`;
  const bab = CERITA.bab[i][SET.bhs];
  const lanjut = () => cerita(judul, denganCerita ? bab : [], hitungMundur);
  if (i === 0 && denganCerita && !SET.lihatProlog) { SET.lihatProlog = true; simpan(); cerita('Prolog', CERITA.prolog[SET.bhs], lanjut); }
  else lanjut();
}
function hitungMundur() {
  tampil(null); $('hud').hidden = false; mode = 'hitung'; hitungT = 0; hasilTampil = false; gerbangHasil = null; itemTampil = 'x'; soalTerakhir = '';
  toast(ARENA[arenaKe].akhir ? t('juaraTargetAkhir') : t('juaraTarget'), 'kuning', true);
  Bunyi.musikMode(ARENA[arenaKe].akhir ? 'bos' : 'lari');
  angka(3);
}
function angka(n) {
  const el = $('hitung'); el.hidden = false; el.className = n === 0 ? 'go' : '';
  el.innerHTML = `<span>${n === 0 ? 'GO!' : n}</span>`;
  Bunyi.sfx('hitung', n === 0 ? 1 : 0);
}
function selesaiBalap() {
  if (hasilTampil) return; hasilTampil = true;
  mode = 'hasil'; Bunyi.mesin(false);
  const pm = G.pemain, ur = urutan(), p = ur.indexOf(pm);
  const akhir = !!ARENA[arenaKe].akhir;
  const menang = akhir ? p === 0 : p <= 2;
  const bintang = p === 0 ? 3 : p <= 2 ? 2 : 1;
  SET.bintang[arenaKe] = Math.max(SET.bintang[arenaKe] || 0, bintang);
  if (!SET.waktu[arenaKe] || pm.waktuFinis < SET.waktu[arenaKe]) SET.waktu[arenaKe] = +pm.waktuFinis.toFixed(1);
  let pesan = '';
  if (menang && SET.buka < arenaKe + 2 && arenaKe + 1 < ARENA.length) { SET.buka = arenaKe + 2; pesan = t('terbuka') + ': ' + ARENA[arenaKe + 1].nama[SET.bhs]; }
  else if (menang && !akhir) pesan = CERITA.bab[arenaKe].menang[SET.bhs];
  else if (!menang) pesan = akhir ? t('juaraTargetAkhir') : t('juaraTarget');
  simpan();
  $('hasilPos').innerHTML = `${p + 1}<small>/ ${ur.length}</small>`;
  $('hasilBintang').innerHTML = bintangHtml(bintang, 30);
  $('hasilStat').innerHTML = `<div><b class="mono">${fmtWaktu(pm.waktuFinis)}</b><small>${t('waktu')}</small></div><div><b>${pm.benar}</b><small>${t('benar')}</small></div><div><b>${pm.salah}</b><small>${t('salah')}</small></div>`;
  $('hasilDaftar').innerHTML = ur.map((r, i) => `<li class="${r === pm ? 'saya' : ''}"><span><span class="wrn" style="background:${r === pm ? MOBIL[SET.mobil].col : r.warna}"></span>${i + 1}. ${r.nama}</span><span class="mono">${r.selesai ? fmtWaktu(r.waktuFinis) : '—'}</span></li>`).join('');
  $('hasilPesan').textContent = pesan;
  const b = $('bBerikut');
  if (akhir && menang) { b.hidden = false; b.querySelector('[data-t]').textContent = t('tamat'); b.onclick = () => { Bunyi.sfx('klik'); cerita(t('tamat'), CERITA.tamat[SET.bhs], keMenu); }; }
  else if (menang && arenaKe + 1 < ARENA.length) { b.hidden = false; b.querySelector('[data-t]').textContent = t('arenaBerikut'); b.onclick = () => { Bunyi.sfx('klik'); mulaiArena(arenaKe + 1); }; }
  else b.hidden = true;
  if (akhir && !menang) setTimeout(() => { if (mode === 'hasil') { cerita('', CERITA.kalahAkhir[SET.bhs], () => tampil('hasil')); } }, 50);
  else tampil('hasil');
}

/* ===== loop utama ===== */
let tLalu = performance.now();
function bingkai(now) {
  requestAnimationFrame(bingkai);
  const dt = Math.min(0.05, (now - tLalu) / 1000); tLalu = now;
  if (!G.trek) return;
  if (mode === 'menu' || (mode === 'cerita' && G.demo)) { langkah(dt, input); kamera(dt, true); }
  else if (mode === 'cerita' || mode === 'hasil') { if (mode === 'hasil') langkah(dt, input); else { hanyaPartikel(dt); G.waktu += dt; } kamera(dt, mode === 'cerita'); }
  else if (mode === 'hitung') {
    const lama = Math.floor(hitungT); hitungT += dt; const baru = Math.floor(hitungT);
    if (baru !== lama && baru <= 3) angka(3 - baru);
    if (hitungT >= 3) { mode = 'balap'; G.waktu = 0; setTimeout(() => { $('hitung').hidden = true; }, 700); }
    for (const r of G.pembalap) letakkan(r);
    hanyaPartikel(dt); kamera(dt, false); hud(0);
    Bunyi.mesin(true, 8 + Math.sin(hitungT * 20) * 4, false);
  } else if (mode === 'balap') {
    bacaInput();
    langkah(dt, input);
    input.item = false;
    kamera(dt, false); hud(dt);
    if (!G.pemain.selesai) Bunyi.mesin(true, G.pemain.v, G.pemain.boost > 0);
    if (G.pemain.selesai && G.waktu - waktuSelesai > 2.6) selesaiBalap();
  } else if (mode === 'jeda') { /* beku */ }
  R.r.render(R.scene, R.cam);
}

/* ===== input ===== */
const keyMap = { ArrowLeft: 'kiri', KeyA: 'kiri', ArrowRight: 'kanan', KeyD: 'kanan', ArrowDown: 'rem', KeyS: 'rem', ShiftLeft: 'drift', ShiftRight: 'drift', KeyZ: 'drift', KeyK: 'drift' };
addEventListener('keydown', (e) => {
  Bunyi.buka();
  if (keyMap[e.code]) { tombol[keyMap[e.code]] = true; e.preventDefault(); }
  if ((e.code === 'Space' || e.code === 'KeyX' || e.code === 'KeyE' || e.code === 'KeyJ') && mode === 'balap') { input.item = true; e.preventDefault(); }
  if ((e.code === 'Escape' || e.code === 'KeyP') && (mode === 'balap' || mode === 'jeda')) jedaToggle();
  if ((e.code === 'Enter' || e.code === 'Space') && aktif() === 'cerita') { e.preventDefault(); lanjutCerita(); }
});
addEventListener('keyup', (e) => { if (keyMap[e.code]) tombol[keyMap[e.code]] = false; });
function bacaInput() {
  if (window.__game && window.__game.autopilot) {   // hanya untuk uji otomatis
    const pm = G.pemain; G.trek.bingkai(pm.s, fr);
    const gA = G.gerbangAbs[pm.gerbangKe], salah = window.__game.autopilot === 'salah';
    let tx = 0; if (gA && gA.s - pm.s < 120) { const b = G.soal[pm.gerbangKe].benar; tx = ((salah ? (b + 1) % 3 : b) - 1) * (2 * W / 3); }
    input.kemudi = Math.max(-1, Math.min(1, ((tx - pm.x) * 2.4 + fr.k * pm.v * pm.v * 0.0047) / pm.st.g));
    input.drift = false; input.rem = false; if (pm.item) input.item = true; return;
  }
  input.kemudi = (tombol.kanan ? 1 : 0) - (tombol.kiri ? 1 : 0);
  input.rem = tombol.rem; input.drift = tombol.drift;
  if (tombol.item) { input.item = true; tombol.item = false; }
}
function pegang(id, k) {
  const el = $(id);
  const on = (e) => { e.preventDefault(); Bunyi.buka(); tombol[k] = true; el.classList.add('tekan'); };
  const off = (e) => { e.preventDefault(); if (k !== 'item') tombol[k] = false; el.classList.remove('tekan'); };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
}
pegang('tKiri', 'kiri'); pegang('tKanan', 'kanan'); pegang('tRem', 'rem'); pegang('tDrift', 'drift'); pegang('tItem', 'item');
addEventListener('pointerdown', () => { Bunyi.buka(); if (!musikJalan) { musikJalan = true; Bunyi.musikMulai(mode === 'menu' ? 'menu' : 'lari'); } }, { capture: true });
addEventListener('keydown', () => { if (!musikJalan) { musikJalan = true; Bunyi.musikMulai(mode === 'menu' ? 'menu' : 'lari'); } }, { capture: true });
let musikJalan = false;
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'balap') jedaToggle(); });

function jedaToggle() {
  if (mode === 'balap') { mode = 'jeda'; tampil('jeda'); Bunyi.mesin(false); }
  else if (mode === 'jeda') { mode = 'balap'; tampil(null); tLalu = performance.now(); }
}

/* ===== tombol menu ===== */
$('bMulai').onclick = () => { Bunyi.sfx('klik'); mulaiArena(Math.min(SET.buka, ARENA.length) - 1); };
$('bArena').onclick = () => { Bunyi.sfx('klik'); renderArena((i) => mulaiArena(i)); tampil('pArena'); };
$('bGarasi').onclick = () => { Bunyi.sfx('klik'); renderGarasi(); tampil('pGarasi'); };
const ulangAtur = () => { renderAtur(ulangAtur); terapkanTeks(); };
$('bAtur').onclick = () => { Bunyi.sfx('klik'); ulangAtur(); tampil('pAtur'); };
$('bBantuan').onclick = () => { Bunyi.sfx('klik'); renderBantuan(); tampil('pBantuan'); };
$('bBahasa').onclick = () => { SET.bhs = SET.bhs === 'id' ? 'ms' : 'id'; simpan(); terapkanTeks(); Bunyi.sfx('klik'); };
$('bSuara').onclick = () => { SET.suara = !SET.suara; simpan(); Bunyi.set(SET.suara); terapkanTeks(); };
document.querySelectorAll('[data-kembali]').forEach((b) => { b.onclick = () => { Bunyi.sfx('klik'); tampil('menu'); }; });
$('bLanjut').onclick = lanjutCerita; $('bLewati').onclick = () => { Bunyi.sfx('klik'); lewatiCerita(); };
$('cerita').addEventListener('click', (e) => { if (e.target.closest('button')) return; lanjutCerita(); });
$('bJeda').onclick = jedaToggle; $('bTeruskan').onclick = jedaToggle;
$('bKeluar').onclick = () => { Bunyi.sfx('klik'); keMenu(); };
$('bUlangJeda').onclick = () => { Bunyi.sfx('klik'); mulaiArena(arenaKe, false); };
$('bUlangi').onclick = () => { Bunyi.sfx('klik'); mulaiArena(arenaKe, false); };
$('bMenuHasil').onclick = () => { Bunyi.sfx('klik'); keMenu(); };

/* ===== mulai ===== */
let prog = 10;
const tm = setInterval(() => { prog = Math.min(95, prog + 15); $('muatBatang').style.width = prog + '%'; }, 80);
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  keMenu(); clearInterval(tm); $('muatBatang').style.width = '100%';
  requestAnimationFrame(bingkai);
});

/* ===== kait ujian otomatis ===== */
window.__game = {
  get mode() { return mode; }, G, SET,
  mulai: (i = 0) => mulaiArena(i, false),
  lewatiHitung: () => { if (mode === 'hitung') hitungT = 2.99; },
  keGerbang: () => { const pm = G.pemain, gA = G.gerbangAbs[pm.gerbangKe]; if (gA) pm.s = gA.s - 60; },
  pilihLajur: (k) => { G.pemain.x = (k - 1) * (2 * W / 3); },
  jawabanBenar: () => G.soal[G.pemain.gerbangKe].benar,
  beriItem: (it) => { G.pemain.item = it; },
  pakai: () => { input.item = true; },
  keFinis: () => { const pm = G.pemain; pm.s = G.putaran * G.trek.L - 30; pm.gerbangKe = G.gerbangAbs.length; },
  info: () => { const pm = G.pemain; return { mode, s: +pm.s.toFixed(1), x: +pm.x.toFixed(2), v: +pm.v.toFixed(1), pos: posisiDari(pm) + 1, item: pm.item, benar: pm.benar, salah: pm.salah, boost: +pm.boost.toFixed(2), L: +G.trek.L.toFixed(1), proj: G.proj.length }; }
};
