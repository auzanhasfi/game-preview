/* Pinball Clawd: alur game, layar menu/jeda/hasil, input keyboard + sentuh, layar DMD, mode demo; window.__game untuk uji otomatis */
import { ic } from './00-ikon.js';
import { SET, simpan, TEKS } from './01-data.js';
import { Bunyi } from './03-bunyi.js';
import { WARNA_JAWAB } from './04-meja.js';
import { Permainan } from './06-aturan.js';
import { buatBot, botLangkah } from './07-bot.js';
import { R, siapkanRender, perbarui, efek, pasCamera } from './08-render.js';
import { DMD } from './09-dmd.js';

const $ = (id) => document.getElementById(id);
const T = () => TEKS[SET.bhs] || TEKS.id;
const uji = /[?&]uji=1/.test(location.search);

let mode = 'muat', game = null, bot = buatBot(), waktu = 0, autopilot = false, demoJeda = 0;
const dmd = new DMD($('dmd'));

/* ---------- teks & ikon ---------- */
function pasangTeks() {
  const t = T(); document.documentElement.lang = SET.bhs === 'ms' ? 'ms' : 'id';
  document.querySelectorAll('[data-t]').forEach((e) => { const k = e.dataset.t; if (k === 'tarik') e.textContent = 'Plunger'; else if (typeof t[k] === 'string') e.textContent = t[k]; });
  document.querySelectorAll('[data-ic]').forEach((e) => { e.innerHTML = ic(e.dataset.ic, 20); });
  $('bBahasa').textContent = SET.bhs === 'ms' ? 'Bahasa Melayu' : 'Bahasa Indonesia';
  $('bSuara').innerHTML = ic(SET.suara ? 'sound' : 'mute', 16) + `<span>${SET.suara ? t.nyala : t.mati}</span>`;
  $('menuRekor').textContent = SET.rekor ? `${t.rekor}: ${SET.rekor.toLocaleString('id-ID')}` : '';
  segmen($('segLevelMenu'), ['mudah', 'sedang', 'sulit'].map((k) => [k, t[k]]), SET.level, (v) => { SET.level = v; simpan(); pasangTeks(); });
  segmen($('segLevel'), ['mudah', 'sedang', 'sulit'].map((k) => [k, t[k]]), SET.level, (v) => { SET.level = v; simpan(); pasangTeks(); });
  segmen($('segBahasa'), [['id', 'Indonesia'], ['ms', 'Melayu']], SET.bhs, (v) => { SET.bhs = v; simpan(); if (game) game.T = T(); pasangTeks(); });
  segmen($('segSuara'), [[true, t.nyala], [false, t.mati]], SET.suara, (v) => { SET.suara = v; simpan(); Bunyi.set(v); pasangTeks(); });
  $('ketLevelMenu').textContent = $('ketLevel').textContent = t.levelKet[SET.level];
  $('isiBantuan').innerHTML = t.bantuanIsi.map((s) => `<li>${s}</li>`).join('');
  $('petaTembak').innerHTML = t.tembakan.map((n, i) => `<div><i style="background:${WARNA_JAWAB[i]}"></i>${n}</div>`).join('');
  $('ketKontrol').textContent = sentuh() ? t.kontrolHP : t.kontrol;
  perbaruiPilihan(true); pasangPanelKontrol();
}
function segmen(el, opsi, nilai, ubah) {
  el.innerHTML = ''; opsi.forEach(([v, label]) => { const b = document.createElement('button'); b.textContent = label; b.dataset.uji = 'seg-' + v; if (v === nilai) b.classList.add('aktif'); b.onclick = () => { Bunyi.sfx('klik'); ubah(v); }; el.appendChild(b); });
}
const sentuh = () => matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

function layar(id) {
  document.querySelectorAll('.layar').forEach((e) => e.classList.toggle('aktif', e.id === id));
  $('pilihan').style.visibility = id === null || id === 'jeda' ? 'visible' : 'hidden';
}

/* ---------- pilihan jawaban di bawah DMD ---------- */
let kunciPilihan = '';
function perbaruiPilihan(paksa = false, tanda = null) {
  const t = T(), s = game && game.soal && !game.demo ? game.soal : null;
  const k = (s ? s.teks + s.pilihan.join(',') : '-') + SET.bhs + (tanda ? JSON.stringify(tanda) : '');
  if (k === kunciPilihan && !paksa) return; kunciPilihan = k;
  $('pilihan').classList.toggle('kosong', !s && !tanda);
  $('pilihan').innerHTML = [0, 1, 2, 3].map((i) => {
    const cls = tanda ? (i === tanda.benar ? 'ok' : i === tanda.k ? 'salah' : '') : '';
    return `<div class="pil ${cls}" data-uji="pil-${i}"><i style="background:${WARNA_JAWAB[i]}"></i><small>${t.tembakan[i]}</small><b>${s ? s.pilihan[i] : tanda ? tanda.nilai[i] : '·'}</b></div>`;
  }).join('');
}

/* ---------- layar DMD ---------- */
let kunciDMD = '';
function teksSoal(s) { const a = `${s.teks} = ?`; return dmd.lebar(a, 2) <= 128 ? a : `${s.teks.replace(/ /g, '')}=?`; }
function gambarDMD() {
  const t = T().dmd, skor = game ? game.skor.toLocaleString('id-ID') : '0';
  const kedip = Math.floor(waktu * 2) % 2;
  let isi;
  const p = game && game.pesan.length ? game.pesan[game.pesan.length - 1] : null;
  if (mode === 'menu' || (game && game.demo)) isi = [['PINBALL CLAWD', 1, 1], [kedip ? t.demo2 : skor, 17, 0.9]];
  else if (p) isi = [[p.a, 1, Math.floor(waktu * 8) % 2 ? 1 : 0.8], [p.b || skor, 17, 0.9]];
  else if (game && game.soal) isi = [[teksSoal(game.soal), 1, 1], [skor, 17, 0.75]];
  else isi = [[t.soal + (kedip ? ' ...' : ''), 1, 0.7], [skor, 17, 0.9]];
  const k = JSON.stringify(isi); if (k === kunciDMD) return; kunciDMD = k;
  dmd.bersih(); for (const [s, y, tr] of isi) dmd.baris(s, y, true, tr); dmd.tampil();
}

/* ---------- game ---------- */
function gameBaru(demo) {
  game = new Permainan({ level: SET.level, teks: T(), lapor: peristiwa });
  game.demo = demo; bot = buatBot(); if (demo) bot.kuat = 0.4 + Math.random() * 0.5;
  kunciPilihan = ''; perbaruiPilihan(true);
}
const SUARA = { flipper: 'flipper', flipperTurun: 'flipperTurun', bumper: 'bumper', sling: 'sling', target: 'target', lajur: 'lajur', inlane: 'inlane', spinner: 'spinner', clawd: 'clawd', ramp: 'ramp', orbit: 'orbit', kotak: 'kotak', kotakBuka: 'kotakBuka', kunci: 'kunci', multiball: 'multiball', luncur: 'luncur', tarik: 'tarik', skill: 'skill', kickback: 'kickback', salah: 'salah', kombo: 'kombo', ekstra: 'ekstra', simpan: 'simpan', goyang: 'goyang', awas: 'awas', tilt: 'tilt', bonusX: 'bonusX', akhirBola: 'drain', antarBola: 'antarBola' };
function peristiwa(n, d) {
  if (game && game.demo) { if (n === 'selesai') demoJeda = 1.5; return; }
  if (SUARA[n]) Bunyi.sfx(SUARA[n], typeof d === 'number' ? d : 0);
  if (n === 'pantul') Bunyi.sfx('pantul', d.kuat);
  if (n === 'benar') { Bunyi.sfx(d.nilai >= 250000 ? 'jackpot' : 'benar'); efek('benar', d); getar(30); }
  if (n === 'benar' || n === 'salah') { const s = game.riwayat[game.riwayat.length - 1]; tandaJawab = { k: d.k, benar: n === 'benar' ? d.k : d.benar, nilai: lastPilihan, sampai: waktu + 1.6 }; }
  if (n === 'soal') { lastPilihan = d.pilihan.slice(); tandaJawab = null; }
  if (n === 'goyang' || n === 'tilt') { efek(n); getar(60); }
  if (n === 'bumper' || n === 'sling') getar(8);
  if (n === 'multiball') Bunyi.musikMode('bos');
  if (n === 'multiballSelesai') Bunyi.musikMode('lari');
  if (n === 'selesai') setTimeout(tampilHasil, 900);
}
let tandaJawab = null, lastPilihan = [0, 0, 0, 0];
const getar = (ms) => { try { if (navigator.vibrate && sentuh()) navigator.vibrate(ms); } catch (e) { /* tidak didukung */ } };

function mulaiMain() {
  Bunyi.buka(); Bunyi.set(SET.suara); Bunyi.musikMulai('lari'); Bunyi.musikMode('lari');
  gameBaru(false); mode = 'main'; layar(null); $('hud').hidden = false; tandaJawab = null;
  for (const s of [0, 1]) game.tekan(s, false);
  $('petunjuk').textContent = T().tarikHint;
  ukurAtas();
}
function keMenu() {
  mode = 'menu'; $('hud').hidden = true; layar('menu'); gameBaru(true); Bunyi.musikMode('menu'); pasangTeks(); ukurAtas();
}
function jeda(on) {
  if (on && mode === 'main') { mode = 'jeda'; layar('jeda'); for (const s of [0, 1]) game.tekan(s, false); game.tarikPlunger(false); }
  else if (!on && mode === 'jeda') { mode = 'main'; layar(null); }
}
function tampilHasil() {
  const t = T(), i = game.info();
  mode = 'hasil'; $('hud').hidden = true; layar('hasil');
  const baru = game.skor > (SET.rekor || 0); if (baru) SET.rekor = game.skor;
  const bintang = game.benar >= 10 ? 3 : game.benar >= 6 ? 2 : game.benar >= 3 ? 1 : 0; SET.bintang = Math.max(SET.bintang || 0, bintang); simpan();
  $('hasilSkor').innerHTML = `${game.skor.toLocaleString('id-ID')}<small>${baru ? t.rekorBaru : t.rekor + ': ' + SET.rekor.toLocaleString('id-ID')}</small>`;
  $('hasilBintang').innerHTML = [0, 1, 2].map((k) => `<span class="${k < bintang ? 'on' : ''}">${ic('star', 34)}</span>`).join('');
  $('hasilBintang').querySelectorAll('.on svg').forEach((s) => s.setAttribute('fill', 'currentColor'));
  $('hasilStat').innerHTML = `<div><b>${i.benar}</b><small>${t.benar}</small></div><div><b>${i.salah}</b><small>${t.salah}</small></div><div><b>${game.streakTerbaik}</b><small>${t.streak}</small></div>`;
  $('hasilDaftar').innerHTML = game.riwayat.slice(-10).map((r) => `<li class="${r.ok ? 'ok' : 'x'}">${ic(r.ok ? 'check' : 'close', 14)} ${r.teks} = ${r.jwb}${r.ok ? '' : ` <span>(${r.pilih})</span>`}</li>`).join('');
  $('hasilPesan').textContent = t.pesanBintang[bintang];
  Bunyi.sfx('selesai'); Bunyi.musikMode('menu');
}

/* ---------- input ---------- */
const KIRI = ['KeyZ', 'ShiftLeft', 'ArrowLeft', 'KeyA'], KANAN = ['Slash', 'ShiftRight', 'ArrowRight', 'KeyL', 'KeyD'], PLUNG = ['Space', 'ArrowDown', 'Enter', 'KeyS'];
addEventListener('keydown', (e) => {
  if (mode === 'main' && !e.repeat) {
    if (KIRI.includes(e.code)) game.tekan(0, true);
    else if (KANAN.includes(e.code)) game.tekan(1, true);
    else if (PLUNG.includes(e.code)) game.tarikPlunger(true);
    else if (e.code === 'KeyN' || e.code === 'KeyX') game.goyang();
    else if (e.code === 'KeyP' || e.code === 'Escape') jeda(true);
  } else if (mode === 'jeda' && (e.code === 'KeyP' || e.code === 'Escape')) jeda(false);
  else if (mode === 'menu' && (e.code === 'Enter' || e.code === 'Space') && document.activeElement === document.body) mulaiMain();
  if (mode === 'main' && [...KIRI, ...KANAN, ...PLUNG].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => {
  if (mode !== 'main') return;
  if (KIRI.includes(e.code)) game.tekan(0, false);
  else if (KANAN.includes(e.code)) game.tekan(1, false);
  else if (PLUNG.includes(e.code)) game.tarikPlunger(false);
});
addEventListener('blur', () => { if (mode === 'main') jeda(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'main') jeda(true); });
function tahan(el, turun, naik) {
  const aktif = new Set();
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); aktif.add(e.pointerId); try { el.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ } Bunyi.buka(); turun(); });
  const lepas = (e) => { if (!aktif.has(e.pointerId)) return; aktif.delete(e.pointerId); if (!aktif.size) naik(); };
  el.addEventListener('pointerup', lepas); el.addEventListener('pointercancel', lepas); el.addEventListener('lostpointercapture', lepas);
}
tahan($('zKiri'), () => mode === 'main' && game.tekan(0, true), () => game && game.tekan(0, false));
tahan($('zKanan'), () => mode === 'main' && game.tekan(1, true), () => game && game.tekan(1, false));
tahan($('tPlunger'), () => mode === 'main' && game.tarikPlunger(true), () => game && game.tarikPlunger(false));
$('tGoyang').addEventListener('pointerdown', (e) => { e.preventDefault(); if (mode === 'main') game.goyang(); });
$('bJeda').addEventListener('pointerdown', (e) => { e.stopPropagation(); });
$('bJeda').onclick = () => jeda(true);

$('bMain').onclick = () => { Bunyi.sfx('klik'); mulaiMain(); };
$('bAtur').onclick = () => { Bunyi.sfx('klik'); layar('pAtur'); };
$('bBantuan').onclick = () => { Bunyi.sfx('klik'); layar('pBantuan'); };
document.querySelectorAll('[data-kembali]').forEach((b) => { b.onclick = () => { Bunyi.sfx('klik'); layar('menu'); pasangTeks(); }; });
$('bBahasa').onclick = () => { SET.bhs = SET.bhs === 'id' ? 'ms' : 'id'; simpan(); if (game) game.T = T(); pasangTeks(); };
$('bSuara').onclick = () => { SET.suara = !SET.suara; simpan(); Bunyi.buka(); Bunyi.set(SET.suara); if (SET.suara) Bunyi.musikMulai('menu'); pasangTeks(); };
$('bTeruskan').onclick = () => jeda(false);
$('bUlangJeda').onclick = () => mulaiMain();
$('bKeluar').onclick = () => keMenu();
$('bUlangi').onclick = () => mulaiMain();
$('bMenuHasil').onclick = () => keMenu();

/* ruang atas untuk DMD supaya meja tidak tertutup */
function ukurAtas() {
  const r = $('atas').getBoundingClientRect();
  const kecil = innerWidth <= 720;
  const bawah = mode === 'menu' ? (kecil ? $('menu').querySelector('.menu-panel').getBoundingClientRect().height * 0.15 : 0) : 0;
  pasCamera(r.bottom + 4, bawah);
}
addEventListener('resize', () => setTimeout(ukurAtas, 50));

/* panel samping: status meja + kontrol (layar lebar) */
let kunciPanel = '';
function perbaruiPanel() {
  const t = T(), g = game, bm = SET.bhs === 'ms';
  const lampu = (n, on) => `<span class="lmp">${Array.from({ length: n }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('')}</span>`;
  const isi = `<h4>${bm ? 'Status meja' : 'Status meja'}</h4>
    <div class="st"><span>${t.bola}</span><b>${Math.min(g.bolaKe, g.jumlahBola)} / ${g.jumlahBola}${g.ekstra ? ' +' + g.ekstra : ''}</b></div>
    <div class="st"><span>${t.benar}</span><b>${g.benar}</b></div>
    <div class="st"><span>${t.salah}</span><b>${g.salah}</b></div>
    <div class="st"><span>${bm ? 'Berturut' : 'Beruntun'}</span><b>${g.streak}×</b></div>
    <div class="st"><span>Bonus</span><b>${g.bonusX}X</b></div>
    <div class="st"><span>${bm ? 'Kunci bola' : 'Kunci bola'}</span>${lampu(2, g.kunci)}</div>
    <div class="st"><span>Kickback</span><b class="${g.kickback ? 'on-t' : 'off-t'}">${g.kickback ? t.nyala : t.mati}</b></div>
    <div class="st"><span>${bm ? 'Selamat bola' : 'Simpan bola'}</span><b class="${g.simpan > 0 ? 'on-t' : 'off-t'}">${g.simpan > 0 ? Math.ceil(g.simpan) + 's' : '–'}</b></div>`;
  if (isi !== kunciPanel) { kunciPanel = isi; $('panelStat').innerHTML = isi; }
}
function pasangPanelKontrol() {
  const t = T(), bm = SET.bhs === 'ms';
  $('panelKontrol').innerHTML = `<h4>${bm ? 'Kawalan' : 'Kontrol'}</h4>
    <div class="kb"><span>Flipper ${bm ? 'kiri' : 'kiri'}</span><span><kbd>Z</kbd> <kbd>←</kbd></span></div>
    <div class="kb"><span>Flipper ${bm ? 'kanan' : 'kanan'}</span><span><kbd>/</kbd> <kbd>→</kbd></span></div>
    <div class="kb"><span>Plunger</span><span><kbd>${bm ? 'Space' : 'Spasi'}</kbd> <kbd>↓</kbd></span></div>
    <div class="kb"><span>${t.goyang}</span><kbd>N</kbd></div>
    <div class="kb"><span>${t.jeda}</span><span><kbd>P</kbd> <kbd>Esc</kbd></span></div>
    <p class="ket">${t.jawabDi}: ${t.tembakan.join(', ').toLowerCase()}.</p>`;
}

/* ---------- loop ---------- */
let akhir = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - akhir) / 1000); akhir = now; waktu += dt;
  if (game && (mode === 'main' || mode === 'menu' || mode === 'hasil')) {
    if (game.demo || autopilot) botLangkah(game, bot, dt, game.demo ? 'acak' : (autopilot === true ? 'benar' : autopilot));
    if (mode !== 'hasil') game.langkah(dt);
    if (game.demo && (game.fase === 'selesai' || game.t > 240)) { demoJeda -= dt; if (demoJeda <= 0) gameBaru(true); }
  }
  if (game) {
    perbarui(game, dt, waktu);
    if (mode === 'main') {
      const ada = game.adaDiPlunger();
      $('tPlunger').hidden = !ada || (game.antrian > 0 && game.otomatis);
      $('tPlungerKuat').style.height = (game.fis.tarik * 100).toFixed(0) + '%';
      if (!ada && $('petunjuk').textContent && game.t > 1) $('petunjuk').textContent = '';
      perbaruiPanel();
      const t = T(); $('infoBola').innerHTML = `${t.bola} <b>${Math.min(game.bolaKe, game.jumlahBola)}</b>/${game.jumlahBola}${game.ekstra ? ` +${game.ekstra}` : ''}`;
      if (tandaJawab && waktu < tandaJawab.sampai) perbaruiPilihan(false, tandaJawab); else { tandaJawab = null; perbaruiPilihan(); }
    }
    gambarDMD();
  }
  requestAnimationFrame(loop);
}

/* ---------- mulai ---------- */
async function mulai() {
  $('muatBatang').style.width = '30%';
  try { await document.fonts.ready; } catch (e) { /* lanjut */ }
  $('muatBatang').style.width = '70%';
  siapkanRender($('kanvas'));
  $('muatBatang').style.width = '100%';
  pasangTeks(); keMenu();
  requestAnimationFrame((t) => { akhir = t; loop(t); });
  addEventListener('pointerdown', () => { Bunyi.buka(); if (SET.suara) Bunyi.musikMulai(mode === 'main' ? 'lari' : 'menu'); }, { once: true });
}
mulai();

/* ---------- untuk uji otomatis ---------- */
window.__game = {
  get mode() { return mode; }, get game() { return game; }, get R() { return R; }, SET,
  set autopilot(v) { autopilot = v; bot = buatBot(); }, get autopilot() { return autopilot; },
  mulaiMain, keMenu, jeda,
  info: () => game && Object.assign(game.info(), { mode, demo: game.demo }),
  jawab: (benar = true) => { const s = game.soal; if (!s) return false; game.tembakan(benar ? s.benar : (s.benar + 1) % 4, 0); return true; },
  bukaKotak: () => { game.fis.target = game.fis.target.map(() => false); game.peristiwa('target', 0); },
  bolaKeKotak: () => { const b = game.fis.bola.find((x) => !x.rel); if (b) { b.x = 245; b.y = 475; b.vx = 0; b.vy = -200; } },
  habiskanBola: () => { game.simpan = 0; game.ekstra = 0; game.fis.kotakTahan = null; game.fis.bola.forEach((b) => { b.rel = null; b.ditahan = 0; b.x = 245; b.y = 1200; }); game.antrian = 0; },
  uji
};
