/* Clawd Kilat: layar menu, pilih hero, jeda, bangkit, hasil, dan pembaruan HUD */
import { TEKS, HEROES, HERO_IDS, MISI } from './01-data.js';

const $ = (id) => document.getElementById(id);
const ic = (n, s, c) => window.ic(n, s, c);
let D, T, aksi;   // D = data simpanan, T = teks bahasa aktif, aksi = callback dari main

export function pasangUI(data, callbacks) { D = data; aksi = callbacks; T = TEKS[D.bhs]; }
export const tx = () => T;
const ib = () => (D.bhs === 'ms' ? 1 : 0);

/* gambar Clawd kecil (SVG) untuk kartu hero */
export function clawdMini(col, ukuran = 44) {
  return '<svg class="mini" width="' + ukuran + '" viewBox="0 0 44 34" aria-hidden="true"><g stroke="#2e2620" stroke-width="1.6"><rect x="6" y="4" width="32" height="18" rx="3" fill="' + col + '"/><rect x="2" y="11" width="4" height="6" fill="' + col + '"/><rect x="38" y="11" width="4" height="6" fill="' + col + '"/>' +
    '<path d="M10 22v9M17 22v9M27 22v9M34 22v9"/></g><rect x="14" y="9" width="3" height="6" fill="#2e2620"/><rect x="27" y="9" width="3" height="6" fill="#2e2620"/></svg>';
}

export function renderMenu(misi) {
  T = TEKS[D.bhs];
  const H = HEROES[D.hero];
  $('menu').innerHTML =
    '<span class="ttl emas">' + T.tag + '</span>' +
    '<h1 id="judul">Clawd <span>Kilat</span></h1>' +
    '<p class="intro">' + T.intro + '</p>' +
    '<div><div class="lbl"><span class="ttl">' + T.hero + '</span></div>' +
    '<button class="herobaris" data-uji="buka-hero" id="mHero" style="width:100%;text-align:left">' +
    '<span class="sw" style="background:' + H.col + '">' + clawdMini(H.col, 30) + '</span><span class="tx"><b>' + H.nama[ib()] + '</b><span>' + H.pasif[ib()] + '</span></span>' + ic('next', 18) + '</button></div>' +
    '<div><div class="lbl"><span class="ttl">' + T.tingkat + '</span></div><div class="seg" id="mTingkat">' +
    ['mudah', 'sedang', 'sulit'].map((k) => '<button data-k="' + k + '" data-uji="tingkat-' + k + '" aria-pressed="' + (D.tingkat === k) + '">' + T[k] + '<small>' + T[k + 'T'] + '</small></button>').join('') + '</div></div>' +
    '<div class="duakol"><div><div class="lbl"><span class="ttl">' + T.bahasa + '</span></div><div class="seg" id="mBhs"><button data-k="id" data-uji="bhs-id" aria-pressed="' + (D.bhs === 'id') + '">ID</button><button data-k="ms" data-uji="bhs-ms" aria-pressed="' + (D.bhs === 'ms') + '">MY</button></div></div>' +
    '<div><div class="lbl"><span class="ttl">' + T.grafik + '</span></div><div class="seg" id="mGrafik"><button data-k="tinggi" aria-pressed="' + (D.grafik === 'tinggi') + '">' + T.tinggi + '</button><button data-k="ringan" aria-pressed="' + (D.grafik === 'ringan') + '">' + T.ringan + '</button></div></div></div>' +
    '<button class="gbtn" id="mMain" data-uji="main">' + ic('play', 18) + T.main + '</button>' +
    '<div class="statbaris"><span class="chip">' + ic('trophy', 15) + T.rekor + ' <b>' + D.rekor + '</b></span><span class="chip">' + ic('star', 15) + T.koin + ' <b>' + D.koin + '</b></span>' +
    '<button class="chip" id="mSuara" aria-label="' + T.suara + '">' + ic(D.suara ? 'sound' : 'mute', 15) + '</button></div>' +
    '<div><div class="lbl"><span class="ttl">' + T.misi + '</span></div><div class="misikecil">' + misi.map((m) => '<div>' + ic('target', 15) + m.t[ib()] + '</div>').join('') + '</div></div>' +
    '<details><summary class="ttl" style="cursor:pointer;padding:6px 0">' + T.cara + '</summary><ol class="cara">' + T.caraT.map((c) => '<li>' + c + '</li>').join('') + '</ol></details>' +
    '<div class="tautan"><a class="bbtn" href="referensi/" data-uji="referensi">' + ic('book', 16) + T.referensi + '</a></div>';
  $('mMain').onclick = () => aksi.main();
  $('mHero').onclick = () => bukaHero();
  $('mTingkat').onclick = (e) => { const b = e.target.closest('button'); if (b) { D.tingkat = b.dataset.k; aksi.simpan(); renderMenu(misi); } };
  $('mBhs').onclick = (e) => { const b = e.target.closest('button'); if (b) { D.bhs = b.dataset.k; document.documentElement.lang = D.bhs === 'ms' ? 'ms' : 'id'; aksi.simpan(); aksi.bahasa(); } };
  $('mGrafik').onclick = (e) => { const b = e.target.closest('button'); if (b) { D.grafik = b.dataset.k; aksi.simpan(); aksi.grafik(); renderMenu(misi); } };
  $('mSuara').onclick = () => { D.suara = !D.suara; aksi.simpan(); aksi.suara(); renderMenu(misi); };
}

export function bukaHero() {
  const ii = ib();
  $('lHeroIsi').innerHTML = '<header><h2 id="hJudul">' + T.hero + '</h2><button class="xbtn" id="hTutup" aria-label="' + T.tutup + '">' + ic('close', 18) + '</button></header>' +
    '<p class="dim">' + T.koin + ': <b style="font-family:var(--font-mono)">' + D.koin + '</b></p>' +
    '<div class="grid-hero">' + HERO_IDS.map((id) => {
      const H = HEROES[id], punya = D.punya.includes(id), dipakai = D.hero === id;
      const tombol = dipakai ? '<button class="bbtn" disabled>' + ic('check', 16) + T.dipakai + '</button>'
        : punya ? '<button class="bbtn" data-pakai="' + id + '" data-uji="pakai-' + id + '">' + T.pakai + '</button>'
          : '<button class="' + (D.koin >= H.harga ? 'gbtn' : 'bbtn') + '" data-beli="' + id + '"' + (D.koin >= H.harga ? '' : ' disabled') + '>' + ic(D.koin >= H.harga ? 'star' : 'lock', 16) + T.buka + ' · ' + H.harga + '</button>';
      return '<div class="kartu' + (punya ? '' : ' kunci') + '" aria-current="' + dipakai + '"><div class="atas"><span class="sw herobaris" style="padding:0;border:0"><span class="sw" style="background:' + H.col + '">' + clawdMini(H.col, 30) + '</span></span><b>' + H.nama[ii] + '</b></div><p>' + H.pasif[ii] + '</p>' + tombol + '</div>';
    }).join('') + '</div>';
  $('lHero').hidden = false;
  $('hTutup').onclick = tutupHero; $('hTutup').focus();
  $('lHeroIsi').onclick = (e) => {
    const p = e.target.closest('[data-pakai]'), b = e.target.closest('[data-beli]');
    if (p) { D.hero = p.dataset.pakai; aksi.simpan(); aksi.hero(); bukaHero(); }
    if (b) { const id = b.dataset.beli; if (D.koin >= HEROES[id].harga) { D.koin -= HEROES[id].harga; D.punya.push(id); D.hero = id; aksi.simpan(); aksi.hero(); bukaHero(); } }
  };
}
export function tutupHero() { $('lHero').hidden = true; aksi.menuUlang(); }

export function bukaJeda() {
  $('lJedaIsi').innerHTML = '<header><h2>' + T.jeda + '</h2></header><button class="gbtn" id="jLanjut" data-uji="lanjut">' + ic('play', 18) + T.lanjut + '</button>' +
    '<div class="aksi"><button class="bbtn" id="jUlang" style="flex:1">' + T.ulang + '</button><button class="bbtn" id="jMenu" style="flex:1">' + ic('home', 16) + T.menu + '</button><button class="xbtn" id="jSuara" aria-label="' + T.suara + '">' + ic(D.suara ? 'sound' : 'mute', 18) + '</button></div>';
  $('lJeda').hidden = false; $('jLanjut').focus();
  $('jLanjut').onclick = () => aksi.lanjut();
  $('jUlang').onclick = () => aksi.ulang();
  $('jMenu').onclick = () => aksi.keMenu();
  $('jSuara').onclick = () => { D.suara = !D.suara; aksi.simpan(); aksi.suara(); bukaJeda(); };
}

let timerBangkit = null;
export function bukaBangkit(soal, detik, selesai) {
  $('lBangkitIsi').innerHTML = '<header><h2>' + T.tumbang + '</h2></header><p class="dim">' + T.bangkitT + '</p><div class="soalbesar">' + soal.teks + ' = ?</div>' +
    '<div class="pilihan3" id="bPil">' + soal.pilihan.map((p, i) => '<button data-v="' + p + '" data-uji="bangkit-' + (p === soal.jawab ? 'benar' : 'salah') + '">' + p + '</button>').join('') + '</div><div class="waktubar"><i id="bWaktu"></i></div>';
  $('lBangkit').hidden = false;
  const mulai = performance.now(); let usai = false;
  const akhiri = (benar, btn) => {
    if (usai) return; usai = true; clearInterval(timerBangkit);
    document.querySelectorAll('#bPil button').forEach((b) => { if (+b.dataset.v === soal.jawab) b.classList.add('ok'); else if (b === btn) b.classList.add('no'); });
    setTimeout(() => { $('lBangkit').hidden = true; selesai(benar); }, benar ? 450 : 1100);
  };
  $('bPil').onclick = (e) => { const b = e.target.closest('button'); if (b) akhiri(+b.dataset.v === soal.jawab, b); };
  timerBangkit = setInterval(() => { const k = (performance.now() - mulai) / (detik * 1000); $('bWaktu').style.transform = 'scaleX(' + Math.max(0, 1 - k) + ')'; if (k >= 1) akhiri(false, null); }, 50);
  window.__bangkit = (benar) => { const b = [...document.querySelectorAll('#bPil button')].find((x) => (+x.dataset.v === soal.jawab) === benar); akhiri(benar, b); };
}

export function bukaHasil(h) {
  const ii = ib();
  $('lHasilIsi').innerHTML = '<header><h2>' + T.hasil + '</h2>' + (h.rekorBaru ? '<span class="lencana">' + T.rekorBaru + '</span>' : '') + '</header>' +
    '<div class="skorbesar"><span class="ttl">' + T.skor + '</span><b data-uji="skor">' + h.skor.toLocaleString('id-ID') + '</b></div>' +
    '<div class="statgrid"><div><span class="ttl">' + T.jarak + '</span><b>' + h.jarak + ' m</b></div><div><span class="ttl">' + T.koin + '</span><b>' + h.koin + '</b></div><div><span class="ttl">' + T.benarN + '</span><b>' + h.benar + '/' + (h.benar + h.salah) + '</b></div><div><span class="ttl">' + T.musuh + '</span><b>' + h.musuh + '</b></div></div>' +
    '<div><div class="lbl"><span class="ttl">' + T.misi + '</span></div><div class="daftarmisi">' + h.misi.map((m) => '<div class="' + (m.ok ? 'ok' : '') + '">' + ic(m.ok ? 'check' : 'target', 16) + m.t[ii] + ' <span class="fine">' + Math.min(m.nilai, m.n) + '/' + m.n + '</span><em>+' + m.hadiah + ' ' + T.koin.toLowerCase() + '</em></div>').join('') + '</div></div>' +
    '<div><div class="lbl"><span class="ttl">' + T.belajar + '</span></div><div class="catatan">' + (h.catatan.length ? h.catatan.map((c) => '<div><b>' + c.teks + ' = ' + c.jawab + '</b> <span>' + c.cara + '</span></div>').join('') : '<p class="dim">' + T.semuaBenar + '</p>') + '</div></div>' +
    '<div class="aksi"><button class="gbtn" id="rUlang" data-uji="ulang">' + ic('play', 18) + T.ulang + '</button><button class="bbtn" id="rMenu" data-uji="menu">' + ic('home', 16) + T.menu + '</button></div>';
  $('lHasil').hidden = false; $('rUlang').focus();
  $('rUlang').onclick = () => aksi.ulang();
  $('rMenu').onclick = () => aksi.keMenu();
}

/* ---------- HUD ---------- */
export function siapkanHUD() {
  $('bJeda').innerHTML = ic('pause', 20);
  $('hKoinI').innerHTML = ic('star', 16);
  $('hMultL').innerHTML = ic('zap', 14);
  $('kilatIkon').innerHTML = ic('zap', 26);
}
const cache = {};
function set(id, v) { if (cache[id] !== v) { cache[id] = v; $(id).innerHTML = v; } }
export function perbaruiHUD(G) {
  set('hJarak', Math.floor(G.dist) + '<small>m</small>');
  set('hSkor', Math.floor(G.skor).toLocaleString('id-ID'));
  set('hKoin', String(G.koin));
  set('hMult', '×' + G.mult);
  const p = Math.min(100, G.meter) / 100;
  $('ringIsi').setAttribute('stroke-dashoffset', String(264 * (1 - (G.kilat > 0 ? G.kilat / G.kilatMaks : p))));
  const penuh = G.meter >= 100 && G.kilat <= 0;
  $('bKilat').classList.toggle('penuh', penuh);
  set('kilatTeks', G.kilat > 0 ? T.kilat + '!' : penuh ? T.kilat : Math.floor(p * 100) + '%');
  // power-up aktif
  const pw = [];
  if (G.magnet > 0) pw.push(['target', T.magnet, G.magnet / G.magnetMaks]);
  if (G.perisai > 0) pw.push(['shield', T.perisai, 1]);
  set('hPower', pw.map((x) => '<span class="chip">' + ic(x[0], 14) + '<i><u style="width:' + Math.round(x[2] * 100) + '%"></u></i></span>').join(''));
}
export function pulseChip(id) { const e = $(id); e.classList.remove('pulse'); void e.offsetWidth; e.classList.add('pulse'); }
export function sepanduk(teks, kelas = '', kecil = '') {
  $('sepanduk').innerHTML = '<div class="' + kelas + '">' + teks + (kecil ? '<small>' + kecil + '</small>' : '') + '</div>';
}
export function toast(ikon, teks) {
  const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = ic(ikon, 16) + teks; $('toastWadah').appendChild(d); setTimeout(() => d.remove(), 2700);
}
export function panelSoal(s) {
  const el = $('pSoal');
  if (!s) { el.hidden = true; return; }
  el.hidden = false; el.className = 'psoal' + (s.status ? ' ' + s.status : '');
  set('pSoalJudul', s.judul); set('pSoalTeks', s.teks);
  $('pSoalCara').hidden = !s.cara; if (s.cara) set('pSoalCara', s.cara);
  $('pSoalBar').style.transform = 'scaleX(' + Math.max(0, Math.min(1, s.sisa)) + ')';
}
export function bosBar(nyawa) {
  if (nyawa < 0) { $('bosBar').hidden = true; return; }
  $('bosBar').hidden = false; $('bosNyawa').innerHTML = [0, 1, 2].map((i) => '<i class="' + (i < nyawa ? '' : 'habis') + '"></i>').join('');
}
export function petunjuk(teks) { const p = $('petunjuk'); if (!teks) { p.hidden = true; return; } p.hidden = false; p.innerHTML = ic('wind', 16) + teks; }
export function hitungMundur(n, lari) { $('hitung').innerHTML = '<span class="' + (lari ? 'lari' : '') + '">' + n + '</span>'; }
export function pilihMisi() { const a = [...MISI].sort(() => Math.random() - 0.5); return a.slice(0, 3).map((m) => ({ ...m, nilai: 0, ok: false })); }
