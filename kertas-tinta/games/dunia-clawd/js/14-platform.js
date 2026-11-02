/* Dunia Clawd: platform: masuk, Laman Utama, butiran pengalaman, memuat, Avatar, Kedai, Lencana, Kemajuan, Tetapan */
import * as THREE from 'three';
import { E, masukDunia, keluarDunia, gambarDunia, gambarAvatar, cfgRawak, NAMA_BOT } from './08-enjin.js';
import { buatAvatar, animasi } from './07-avatar.js';
import { S, simpan, PRESET, PRESET_ID, LENCANA, KATALOG, WARNA, milik, tambahCbux, beriLencana, dengar, namaBarang } from './05-simpan.js';
import { t, tx, nombor, BAHASA, setBahasa } from './01-teks.js';
import { ic } from './02-ikon.js';
import { caraKira, teksSoal, NAMA_TOPIK, pilihan } from './03-soal.js';
import { bunyi, mulaAudio, muzik } from './04-bunyi.js';
import { OBBY } from './09-obby.js';
import { MENARA } from './10-menara.js';
import { TYCOON } from './11-tycoon.js';
import { SIMULATOR } from './12-simulator.js';
import { bukaHud, tutupHud, kawalanTetapan, terapkanAlat, tanya } from './13-hud.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const PENGALAMAN = [
  { id: 'obby', mod: OBBY, n: ['Obby Angka', 'Number Obby', 'Obby Angka'], jenis: ['Rintangan', 'Obstacle course', 'Rintangan'], pencipta: 'Clawd Studio', suka: 94, main: 3120, kunjung: 1820000,
    d: ['15 peringkat rintangan: blok hilang, palang berputar, konveyor, kekisi panjat. Di jambatan jawapan, pijak petak yang betul. Di pintu jawapan, langgar nombor yang betul. Jatuh? Sambung dari titik semak.', '15 obstacle stages: vanishing blocks, spinners, conveyors, climbing trusses. On answer bridges, step on the right tile. At answer doors, run through the right number. Fell? Continue from your checkpoint.', '15 tahap rintangan: blok hilang, palang berputar, konveyor, kisi panjat. Di jembatan jawaban, injak petak yang benar. Di pintu jawaban, tabrak angka yang benar. Jatuh? Lanjut dari titik simpan.'] },
  { id: 'menara', mod: MENARA, n: ['Menara Lava', 'Lava Tower', 'Menara Lava'], jenis: ['Panjat', 'Tower climb', 'Panjat'], pencipta: 'Clawd Studio', suka: 91, main: 1840, kunjung: 960000,
    d: ['8 tingkat, susunan berbeza setiap kali masuk. Lava naik tanpa henti. Di hujung setiap tingkat ada pad soalan: betul, lif naik dan lava turun. Salah, lava melonjak.', '8 floors with a new layout each time. The lava never stops rising. Each floor ends at a question pad: correct, the lift rises and the lava drops. Wrong, the lava surges.', '8 lantai, susunannya beda setiap masuk. Lava terus naik. Di ujung tiap lantai ada pad soal: benar, lift naik dan lava turun. Salah, lava melonjak.'] },
  { id: 'tycoon', mod: TYCOON, n: ['Tycoon Kedai', 'Shop Tycoon', 'Tycoon Toko'], jenis: ['Tycoon', 'Tycoon', 'Tycoon'], pencipta: 'Clawd Studio', suka: 96, main: 4410, kunjung: 2640000,
    d: ['Mesin titis menjatuhkan barang ke konveyor. Kutip wang, pijak butang hijau, jawab soalan untuk membeli. Bina kedai dari lantai kosong hingga menara bendera. Kemajuan disimpan.', 'Droppers drop goods on the conveyor. Collect cash, step on green buttons, solve a question to buy. Build your shop from an empty floor to the flag tower. Progress is saved.', 'Mesin tetes menjatuhkan barang ke konveyor. Ambil uang, injak tombol hijau, jawab soal untuk membeli. Bangun toko dari lantai kosong sampai menara bendera. Kemajuan tersimpan.'] },
  { id: 'sim', mod: SIMULATOR, n: ['Simulator Bintang', 'Star Simulator', 'Simulator Bintang'], jenis: ['Simulator', 'Simulator', 'Simulator'], pencipta: 'Clawd Studio', suka: 93, main: 2760, kunjung: 1430000,
    d: ['Pecahkan kristal, isi beg, jual bintang, naik taraf. Jawab soalan untuk tetaskan telur haiwan peliharaan dan buka zon baharu. Buka Bulan Tinta, kemudian lahir semula untuk ganda jualan.', 'Break crystals, fill your bag, sell stars, upgrade. Solve questions to hatch pet eggs and unlock new zones. Unlock Ink Moon, then rebirth to multiply your sales.', 'Pecahkan kristal, isi tas, jual bintang, tingkatkan. Jawab soal untuk menetaskan telur hewan dan membuka zona baru. Buka Bulan Tinta, lalu lahir kembali untuk menggandakan penjualan.'] }
];
const THUMB = {}, POTRET = {};
let layar = 'laman', sel = null;

function potret(cfg, kunci, badan) { const k = kunci || JSON.stringify(cfg) + (badan || ''); return POTRET[k] ||= gambarAvatar(cfg, badan ? 240 : 144, badan ? 240 : 144, badan); }
function janaThumb() {
  // satu demi satu supaya halaman tak beku
  const baki = PENGALAMAN.filter((p) => !THUMB[p.id]); if (!baki.length) return;
  const p = baki[0]; setTimeout(() => {
    if (E.aktif) return; THUMB[p.id] = gambarDunia(p.mod);
    document.querySelectorAll(`[data-thumb="${p.id}"]`).forEach((im) => { im.style.backgroundImage = `url(${THUMB[p.id]})`; im.classList.add('ada'); });
    janaThumb();
  }, 60);
}

/* ---------- skrin masuk ---------- */
export function mula() {
  if (!S.nama) return skrinMasuk();
  if (S.masuk === 0) beriLencana('mula');
  S.masuk++; simpan(); paparPlatform();
}
function skrinMasuk() {
  const A = $('#platform'); A.hidden = false; const cadang = () => ['Clawd', 'Bintang', 'Pintar', 'Hebat', 'Laju', 'Bijak'][Math.floor(Math.random() * 6)] + '_' + (10 + Math.floor(Math.random() * 89));
  let pil = PRESET_ID[0];
  A.innerHTML = `<section class="masuk"><div class="m-kiri">
      <p class="ttl">${t('Dunia 3D · Matematik', '3D worlds · Maths', 'Dunia 3D · Matematika')}</p>
      <h1>Dunia Clawd</h1>
      <p class="dim">${t('Empat dunia blok untuk diterokai. Setiap jalan, pintu dan telur memerlukan otak matematik anda.', 'Four block worlds to explore. Every path, door and egg needs your maths brain.', 'Empat dunia blok untuk dijelajahi. Setiap jalan, pintu, dan telur butuh otak matematikamu.')}</p>
    </div>
    <form class="m-borang pn" id="fMasuk">
      <div class="seg" role="group" aria-label="${t('Bahasa', 'Language', 'Bahasa')}">${Object.entries(BAHASA).map(([k, v]) => `<button type="button" data-l="${k}" aria-pressed="${S.bahasa === k}">${v}</button>`).join('')}</div>
      <label for="iNama">${t('Nama pemain', 'Player name', 'Nama pemain')}</label>
      <div class="m-nama"><input id="iNama" maxlength="16" value="${esc(cadang())}" autocomplete="off" data-uji="nama"><button type="button" class="xbtn" id="bRawak" aria-label="${t('Nama lain', 'Another name', 'Nama lain')}">${ic('refresh', 18)}</button></div>
      <label>${t('Pilih watak', 'Choose a character', 'Pilih karakter')}</label>
      <div class="m-av" id="mAv">${PRESET_ID.map((k) => `<button type="button" data-p="${k}" aria-pressed="${k === pil}" aria-label="${PRESET[k].nama}"><img alt="" src="${potret(PRESET[k], 'p' + k, true)}"><small>${PRESET[k].nama}</small></button>`).join('')}</div>
      <label>${t('Tahap soalan', 'Question level', 'Tingkat soal')}</label>
      <div class="seg" id="mTahap">${[['mudah', t('Tahun 1–2', 'Year 1–2', 'Kelas 1–2')], ['sedang', t('Tahun 3–4', 'Year 3–4', 'Kelas 3–4')], ['sulit', t('Tahun 5–6', 'Year 5–6', 'Kelas 5–6')]].map(([k, v]) => `<button type="button" data-d="${k}" aria-pressed="${S.diff === k}">${v}</button>`).join('')}</div>
      <button class="gbtn" data-uji="masuk">${t('Mula', 'Start', 'Mulai')}${ic('next', 18)}</button>
      <p class="fine">${t('Tanpa akaun: kemajuan disimpan dalam peranti ini sahaja.', 'No account needed: progress stays on this device only.', 'Tanpa akun: kemajuan hanya tersimpan di perangkat ini.')}</p>
    </form></section>`;
  A.querySelectorAll('[data-l]').forEach((b) => { b.onclick = () => { S.bahasa = b.dataset.l; setBahasa(S.bahasa); skrinMasuk(); }; });
  $('#bRawak').onclick = () => { $('#iNama').value = cadang(); };
  A.querySelectorAll('[data-p]').forEach((b) => { b.onclick = () => { pil = b.dataset.p; A.querySelectorAll('[data-p]').forEach((x) => x.setAttribute('aria-pressed', x === b)); bunyi('tap'); }; });
  A.querySelectorAll('[data-d]').forEach((b) => { b.onclick = () => { S.diff = b.dataset.d; A.querySelectorAll('[data-d]').forEach((x) => x.setAttribute('aria-pressed', x === b)); bunyi('tap'); }; });
  $('#fMasuk').onsubmit = (e) => {
    e.preventDefault(); mulaAudio(); const n = $('#iNama').value.trim().slice(0, 16) || cadang();
    S.nama = n; S.avatar = { ...PRESET[pil] }; delete S.avatar.nama; simpan(true); bunyi('betul'); mula();
  };
}

/* ---------- rangka platform ---------- */
const NAV = () => [['laman', 'home', t('Laman', 'Home', 'Beranda')], ['avatar', 'user', 'Avatar'], ['kedai', 'bag', t('Kedai', 'Shop', 'Toko')], ['lencana', 'trophy', t('Lencana', 'Badges', 'Lencana')], ['kemajuan', 'chart', t('Kemajuan', 'Progress', 'Kemajuan')], ['tetapan', 'settings', t('Tetapan', 'Settings', 'Pengaturan')]];
export function paparPlatform(l = layar) {
  layar = l; const A = $('#platform'); A.hidden = false; document.body.classList.remove('dalam-dunia');
  A.innerHTML = `<div class="p-rangka">
    <header class="p-atas">
      <button class="p-logo" data-nav="laman" aria-label="Dunia Clawd"><span class="lg"></span><b>Dunia Clawd</b></button>
      <label class="p-cari">${ic('search', 18)}<input id="iCari" placeholder="${t('Cari pengalaman', 'Search experiences', 'Cari pengalaman')}" aria-label="${t('Cari', 'Search', 'Cari')}"></label>
      <span class="chip p-bux" title="CBux">${ic('coin', 16)}<b id="pCbux">${nombor(S.cbux)}</b></span>
      <button class="p-saya" data-nav="avatar"><img alt="" src="${potret(S.avatar)}"><span>${esc(S.nama)}</span></button>
    </header>
    <nav class="p-nav">${NAV().map(([k, i, n]) => `<button data-nav="${k}" aria-current="${layar === k || (layar === 'butiran' && k === 'laman') ? 'page' : 'false'}" data-uji="nav-${k}">${ic(i, 20)}<span>${n}</span></button>`).join('')}</nav>
    <main class="p-isi" id="pIsi"></main></div>`;
  A.querySelectorAll('[data-nav]').forEach((b) => { b.onclick = () => { bunyi('tap'); hentiPreview(); paparPlatform(b.dataset.nav); }; });
  const I = $('#pIsi');
  ({ laman: lmn, butiran: butiran, avatar: avatarP, kedai: kedaiP, lencana: lencanaP, kemajuan: kemajuanP, tetapan: tetapanP }[layar])(I);
  $('#iCari').oninput = (e) => { if (layar !== 'laman') { paparPlatform('laman'); $('#iCari').value = e.target.value; $('#iCari').focus(); } lmnSenarai(e.target.value); };
  janaThumb();
}
dengar('cbux', () => { const c = $('#pCbux'); if (c) c.textContent = nombor(S.cbux); });

function kad(p) {
  const main = p.main + Math.floor(Math.random() * 40);
  return `<button class="p-kad" data-x="${p.id}" data-uji="kad-${p.id}"><span class="p-th ${THUMB[p.id] ? 'ada' : ''}" data-thumb="${p.id}" style="${THUMB[p.id] ? `background-image:url(${THUMB[p.id]})` : ''}"></span><b>${esc(tx(p.n))}</b><small>${ic('thumb', 13)}${p.suka}% &nbsp; ${ic('users', 13)}${nombor(main)}</small></button>`;
}
function ikatKad(R) { R.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => { bunyi('tap'); sel = PENGALAMAN.find((p) => p.id === b.dataset.x); paparPlatform('butiran'); }; }); }

function lmn(I) {
  const rakan = NAMA_BOT.slice(0, 8), jam = new Date().getHours();
  const salam = jam < 12 ? t('Selamat pagi', 'Good morning', 'Selamat pagi') : jam < 15 ? t('Selamat tengah hari', 'Good afternoon', 'Selamat siang') : jam < 19 ? t('Selamat petang', 'Good afternoon', 'Selamat sore') : t('Selamat malam', 'Good evening', 'Selamat malam');
  const terakhir = S.terakhir.map((id) => PENGALAMAN.find((p) => p.id === id)).filter(Boolean);
  I.innerHTML = `<h1 class="p-h">${salam}, ${esc(S.nama)}</h1>
    <section><h2 class="p-s">${t('Rakan', 'Friends', 'Teman')} <small>(${t('bot AI', 'AI bots', 'bot AI')})</small></h2>
      <div class="p-rakan">${rakan.map((n, i) => `<div class="rk"><span class="rk-i"><img alt="" src="${potret(cfgRawak(i), 'r' + i)}"><i class="${i % 3 === 2 ? '' : 'on'}"></i></span><small>${esc(n)}</small></div>`).join('')}</div></section>
    ${terakhir.length ? `<section><h2 class="p-s">${t('Sambung bermain', 'Continue', 'Lanjutkan')}</h2><div class="p-grid">${terakhir.map(kad).join('')}</div></section>` : ''}
    <section><h2 class="p-s">${t('Disyorkan untuk anda', 'Recommended for you', 'Disarankan untukmu')}</h2><div class="p-grid" id="pGrid"></div></section>`;
  lmnSenarai(''); ikatKad(I);
}
function lmnSenarai(q) {
  const G = $('#pGrid'); if (!G) return; const k = q.trim().toLowerCase();
  const list = PENGALAMAN.filter((p) => !k || tx(p.n).toLowerCase().includes(k) || tx(p.jenis).toLowerCase().includes(k));
  G.innerHTML = list.length ? list.map(kad).join('') : `<p class="dim">${t('Tiada hasil.', 'No results.', 'Tidak ada hasil.')}</p>`; ikatKad(G);
}
function butiran(I) {
  const p = sel || PENGALAMAN[0], suka = S.suka[p.id];
  const lenc = { obby: ['obby1', 'obby'], menara: ['menara'], tycoon: ['tycoon1', 'tycoon'], sim: ['telur', 'lahir'] }[p.id];
  I.innerHTML = `<button class="p-balik" data-nav2>${ic('back', 18)}${t('Kembali', 'Back', 'Kembali')}</button>
    <div class="p-but"><span class="p-th besar ${THUMB[p.id] ? 'ada' : ''}" data-thumb="${p.id}" style="${THUMB[p.id] ? `background-image:url(${THUMB[p.id]})` : ''}"></span>
    <div class="p-but-k"><h1>${esc(tx(p.n))}</h1><p class="dim">${t('oleh', 'by', 'oleh')} ${p.pencipta} · ${esc(tx(p.jenis))}</p>
      <button class="gbtn p-main" id="bMain" data-uji="main">${ic('play', 24)}<span>${t('Main', 'Play', 'Main')}</span></button>
      <div class="p-suka"><button class="bbtn" id="bSuka" aria-pressed="${suka === 1}">${ic('thumb', 18)}${p.suka + (suka === 1 ? 1 : 0)}%</button><span class="chip">${ic('users', 14)}<b>${nombor(p.main)}</b> ${t('sedang main', 'playing', 'sedang main')}</span><span class="chip">${ic('globe', 14)}<b>${nombor(p.kunjung)}</b> ${t('kunjungan', 'visits', 'kunjungan')}</span></div>
    </div></div>
    <section><h2 class="p-s">${t('Tentang', 'About', 'Tentang')}</h2><p class="p-desk">${esc(tx(p.d))}</p></section>
    <section><h2 class="p-s">${t('Lencana', 'Badges', 'Lencana')}</h2><div class="p-lenc">${lenc.map(kadLencana).join('')}</div></section>`;
  I.querySelector('[data-nav2]').onclick = () => paparPlatform('laman');
  $('#bSuka').onclick = (e) => { S.suka[p.id] = S.suka[p.id] === 1 ? 0 : 1; simpan(); bunyi('tap'); butiran(I); };
  $('#bMain').onclick = () => { mulaAudio(); masuk(p); };
}
function kadLencana(id) { const b = LENCANA[id], ada = S.lencana.includes(id); return `<div class="lc ${ada ? 'ada' : ''}"><span class="i">${ic(b.i, 24)}</span><div><b>${esc(tx(b.n))}</b><small>${esc(tx(b.d))}</small></div><em>${ada ? ic('check', 16) : '+' + b.cb}</em></div>`; }

/* ---------- memuat & masuk ---------- */
const TIP = [['Tip: tahan Space untuk terus melompat.', 'Tip: hold Space to keep jumping.', 'Tip: tahan Space untuk terus melompat.'], ['Tip: seret skrin untuk memusingkan kamera.', 'Tip: drag the screen to rotate the camera.', 'Tip: seret layar untuk memutar kamera.'], ['Tip: jawapan salah? Baca cara mengira, kemudian cuba lagi.', 'Tip: wrong answer? Read how to solve it, then try again.', 'Tip: jawaban salah? Baca cara menghitung, lalu coba lagi.'], ['Tip: tekan Esc untuk menu, R untuk set semula.', 'Tip: press Esc for the menu, R to reset.', 'Tip: tekan Esc untuk menu, R untuk mengulang.']];
export function masuk(p) {
  hentiPreview();
  const A = $('#platform'), M = $('#memuat');
  M.hidden = false; M.innerHTML = `<div class="lm"><span class="lg besar"></span><h2>${esc(tx(p.n))}</h2><p class="dim">${t('oleh', 'by', 'oleh')} ${p.pencipta}</p><p class="fine">${esc(tx(TIP[Math.floor(Math.random() * TIP.length)]))}</p></div>`;
  setTimeout(() => {
    A.hidden = true; document.body.classList.add('dalam-dunia');
    masukDunia(p.mod); bukaHud(tx(p.n)); terapkanAlat(); p.mod.mula?.call(p.mod, E.dunia);
    S.terakhir = [p.id, ...S.terakhir.filter((x) => x !== p.id)].slice(0, 2); simpan();
    setTimeout(() => { M.hidden = true; }, 500);
  }, 700);
}
export function keluar() { tutupHud(); keluarDunia(); muzik('lobi'); paparPlatform(sel ? 'butiran' : 'laman'); }
export function masukSemula() { const p = PENGALAMAN.find((x) => x.mod === E.dunia?.mod); if (p) { tutupHud(); keluarDunia(); masuk(p); } }

/* ---------- avatar: pratonton 3D sendiri ---------- */
let pv = null;
function hentiPreview() { if (pv) { cancelAnimationFrame(pv.raf); pv.r.dispose(); pv.r.forceContextLoss?.(); pv = null; } }
function mulaPreview(kv) {
  hentiPreview();
  const r = new THREE.WebGLRenderer({ canvas: kv, antialias: true, alpha: true }); const uk = () => { const w = kv.clientWidth, h = kv.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100); cam.position.set(0, 3.9, 17); cam.lookAt(0, 3.1, 0);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x445066, 1.9)); const s = new THREE.DirectionalLight(0xffffff, 2.6); s.position.set(-4, 8, 7); sc.add(s);
  const lantai = new THREE.Mesh(new THREE.CircleGeometry(4, 40), new THREE.MeshBasicMaterial({ color: '#22324f' })); lantai.rotation.x = -Math.PI / 2; sc.add(lantai);
  let av = buatAvatar(S.avatar), rot = Math.PI + 0.45, seret = false, x0 = 0; av.akar.rotation.y = rot; sc.add(av.akar);
  kv.onpointerdown = (e) => { seret = true; x0 = e.clientX; kv.setPointerCapture(e.pointerId); }; kv.onpointermove = (e) => { if (seret) { rot += (e.clientX - x0) * 0.012; x0 = e.clientX; } }; kv.onpointerup = () => { seret = false; };
  pv = { r, raf: 0, tukar() { sc.remove(av.akar); av = buatAvatar(S.avatar); av.akar.rotation.y = rot; sc.add(av.akar); } };
  let t0 = performance.now(); uk();
  const g = (ms) => { pv.raf = requestAnimationFrame(g); const dt = Math.min(0.05, (ms - t0) / 1000); t0 = ms; if (!seret) rot += dt * 0.35; av.akar.rotation.y = rot; animasi(av, dt, { laju: 0, diTanah: true, vy: 0 }); r.render(sc, cam); };
  pv.raf = requestAnimationFrame(g);
}
let tabAv = 'warna';
function avatarP(I) {
  I.innerHTML = `<h1 class="p-h">Avatar</h1><div class="av-g"><div class="av-k pn"><canvas id="avKv" aria-label="${t('Pratonton avatar', 'Avatar preview', 'Pratinjau avatar')}"></canvas><p class="fine">${t('Seret untuk pusing', 'Drag to rotate', 'Seret untuk memutar')}</p></div>
    <div class="av-p"><div class="seg" id="avTab">${[['warna', t('Warna', 'Colours', 'Warna')], ['topi', t('Topi', 'Hats', 'Topi')], ['muka', t('Muka', 'Faces', 'Wajah')], ['belakang', t('Belakang', 'Back', 'Belakang')], ['watak', t('Watak', 'Characters', 'Karakter')]].map(([k, v]) => `<button data-t="${k}" aria-pressed="${tabAv === k}">${v}</button>`).join('')}</div><div id="avIsi"></div></div></div>`;
  I.querySelectorAll('#avTab button').forEach((b) => { b.onclick = () => { tabAv = b.dataset.t; bunyi('tap'); I.querySelectorAll('#avTab button').forEach((x) => x.setAttribute('aria-pressed', x === b)); lukisAv(); }; });
  mulaPreview($('#avKv')); lukisAv();
}
function lukisAv() {
  const R = $('#avIsi'), a = S.avatar;
  const ubah = () => { simpan(); bunyi('tap'); pv?.tukar(); lukisAv(); const im = document.querySelector('.p-saya img'); if (im) im.src = potret(S.avatar); };
  if (tabAv === 'warna') {
    R.innerHTML = [['kulit', t('Kulit', 'Skin', 'Kulit')], ['baju', t('Baju', 'Shirt', 'Baju')], ['seluar', t('Seluar', 'Pants', 'Celana')]].map(([k, l]) => `<h3 class="ttl av-l">${l}</h3><div class="av-w">${WARNA.map((w) => `<button data-k="${k}" data-w="${w}" style="background:${w}" aria-pressed="${a[k] === w}" aria-label="${w}"></button>`).join('')}</div>`).join('');
    R.querySelectorAll('[data-w]').forEach((b) => { b.onclick = () => { a[b.dataset.k] = b.dataset.w; ubah(); }; });
  } else if (tabAv === 'watak') {
    R.innerHTML = `<div class="av-b">${PRESET_ID.map((k) => `<button data-p="${k}"><img alt="" src="${potret(PRESET[k], 'p' + k, true)}"><small>${PRESET[k].nama}</small></button>`).join('')}</div>`;
    R.querySelectorAll('[data-p]').forEach((b) => { b.onclick = () => { const c = { ...PRESET[b.dataset.p] }; delete c.nama; S.avatar = c; ubah(); }; });
  } else {
    const list = KATALOG.filter((k) => k.jenis === tabAv && milik(k.id));
    const tiada = tabAv !== 'muka' ? [{ id: 'tiada', n: [t('Tiada', 'None', 'Tidak ada')] }] : [];
    R.innerHTML = `<div class="av-b">${[...tiada, ...list].map((k) => `<button data-b="${k.id}" aria-pressed="${a[tabAv] === k.id}"><img alt="" src="${potret({ ...a, [tabAv]: k.id }, null, tabAv === 'belakang' ? 'blk' : false)}"><small>${esc(k.id === 'tiada' ? k.n[0] : tx(k.n))}</small></button>`).join('')}</div><p class="fine">${t('Lebih banyak di Kedai.', 'More in the Shop.', 'Lebih banyak di Toko.')}</p>`;
    R.querySelectorAll('[data-b]').forEach((b) => { b.onclick = () => { a[tabAv] = b.dataset.b; ubah(); }; });
  }
}
/* ---------- kedai ---------- */
function kedaiP(I) {
  const barang = KATALOG.filter((k) => k.h > 0);
  I.innerHTML = `<h1 class="p-h">${t('Kedai', 'Shop', 'Toko')}</h1><p class="dim p-sub">${t('Dapatkan CBux dengan menjawab soalan, mengutip syiling dan mendapat lencana. Tiada wang sebenar.', 'Earn CBux by answering questions, collecting coins and earning badges. No real money.', 'Dapatkan CBux dengan menjawab soal, mengambil koin, dan meraih lencana. Tanpa uang sungguhan.')}</p>
    <div class="kd">${barang.map((k) => { const ada = S.milik.includes(k.id), gear = k.jenis === 'alat'; return `<div class="kd-k pn">${gear ? `<span class="kd-g">${ic(k.ikon, 44)}</span>` : `<img alt="" src="${potret({ ...S.avatar, [k.jenis]: k.id }, null, k.jenis === 'belakang' ? 'blk' : false)}">`}<b>${esc(tx(k.n))}</b>${k.d ? `<small class="dim">${esc(tx(k.d))}</small>` : ''}<button class="${ada ? 'bbtn' : 'gbtn'}" data-beli="${k.id}" data-uji="beli-${k.id}" ${ada ? 'disabled' : ''}>${ada ? t('Dimiliki', 'Owned', 'Dimiliki') : ic('coin', 16) + k.h}</button></div>`; }).join('')}</div>`;
  I.querySelectorAll('[data-beli]').forEach((b) => {
    b.onclick = () => {
      const k = KATALOG.find((x) => x.id === b.dataset.beli);
      if (S.cbux < k.h) { bunyi('salah'); b.classList.add('goyang'); setTimeout(() => b.classList.remove('goyang'), 400); return; }
      tambahCbux(-k.h); S.milik.push(k.id); if (k.jenis !== 'alat') S.avatar[k.jenis] = k.id; simpan(); bunyi('beli'); beriLencana('gaya'); paparPlatform('kedai');
    };
  });
}
function lencanaP(I) {
  const ids = Object.keys(LENCANA), ada = S.lencana.length;
  I.innerHTML = `<h1 class="p-h">${t('Lencana', 'Badges', 'Lencana')}</h1><p class="dim p-sub">${ada} / ${ids.length}</p><div class="p-lenc">${ids.map(kadLencana).join('')}</div>`;
}
function kemajuanP(I) {
  const p = S.prog, per = (a) => a[1] ? Math.round(a[0] / a[1] * 100) : 0, jum = p.jumlah;
  I.innerHTML = `<h1 class="p-h">${t('Kemajuan', 'Progress', 'Kemajuan')}</h1>
    <div class="km-r"><div class="pn km-s"><b>${nombor(p.betul)}</b><small>${t('jawapan betul', 'correct answers', 'jawaban benar')}</small></div><div class="pn km-s"><b>${jum ? Math.round(p.betul / jum * 100) : 0}%</b><small>${t('ketepatan', 'accuracy', 'ketepatan')}</small></div><div class="pn km-s"><b>${p.komboTerbaik}</b><small>${t('kombo terbaik', 'best combo', 'kombo terbaik')}</small></div></div>
    <section><h2 class="p-s">${t('Ikut topik', 'By topic', 'Per topik')}</h2><div class="km-t pn">${Object.keys(p.topik).map((k) => `<div class="km-b"><span>${esc(tx(NAMA_TOPIK[k]))}</span><div class="trk"><i style="width:${per(p.topik[k])}%"></i></div><b>${p.topik[k][1] ? per(p.topik[k]) + '%' : '–'}</b><small>${p.topik[k][0]}/${p.topik[k][1]}</small></div>`).join('')}</div></section>
    <section><h2 class="p-s">${t('Soalan untuk diulang', 'Questions to review', 'Soal untuk diulang')}</h2>${p.salah.length ? `<div class="km-sl">${p.salah.map((m, i) => `<button class="pn" data-sl="${i}"><b>${esc(teksSoal(m))}</b><span>${t('Cuba lagi', 'Try again', 'Coba lagi')}${ic('next', 15)}</span></button>`).join('')}</div>` : `<p class="dim">${t('Belum ada. Soalan yang salah akan muncul di sini.', 'None yet. Questions you miss will appear here.', 'Belum ada. Soal yang salah akan muncul di sini.')}</p>`}</section>`;
  I.querySelectorAll('[data-sl]').forEach((b) => {
    b.onclick = async () => { const m = p.salah[Number(b.dataset.sl)], q = { ...m, lv: 3 }; q.opts = pilihan(q, 4); const ok = await tanya({ q, tajuk: t('Ulang', 'Review', 'Ulang') }); if (ok) { p.salah = p.salah.filter((x) => x !== m); simpan(); } kemajuanP(I); };
  });
}
function tetapanP(I) {
  I.innerHTML = `<h1 class="p-h">${t('Tetapan', 'Settings', 'Pengaturan')}</h1><div class="pn tp-k" id="tpK"></div>
    <section class="tp-z"><button class="bbtn" id="bNama">${ic('pencil', 16)}${t('Tukar nama', 'Change name', 'Ganti nama')}</button><button class="bbtn" id="bPadam">${ic('close', 16)}${t('Padam semua kemajuan', 'Erase all progress', 'Hapus semua kemajuan')}</button></section>`;
  kawalanTetapan($('#tpK'), () => paparPlatform('tetapan'));
  $('#bNama').onclick = () => { const n = prompt(t('Nama baharu', 'New name', 'Nama baru'), S.nama); if (n && n.trim()) { S.nama = n.trim().slice(0, 16); simpan(); paparPlatform('tetapan'); } };
  $('#bPadam').onclick = () => { if (confirm(t('Padam semua kemajuan dalam peranti ini?', 'Erase all progress on this device?', 'Hapus semua kemajuan di perangkat ini?'))) { try { localStorage.clear(); } catch (e) {} location.reload(); } };
}
export { caraKira, namaBarang };
