/* Dunia Clawd: HUD dalam dunia: butang kiri atas, sembang, senarai pemain, kesihatan, beg alat, menu Esc, soalan, toast, lencana */
import { E, setSemula, pasangJoystik, kosongInput } from './08-enjin.js';
import { S, simpan, rekod, tambahCbux, dengar, LENCANA, KATALOG, beriLencana } from './05-simpan.js';
import { t, tx, nombor, BAHASA, setBahasa } from './01-teks.js';
import { ic } from './02-ikon.js';
import { buatSoal, teksSoal, caraKira, NAMA_DIFF, NAMA_TOPIK, DIFFS } from './03-soal.js';
import { bunyi, muzik, henti, mulaAudio } from './04-bunyi.js';

const $ = (s) => document.querySelector(s);
let H, onKeluar = () => {}, onSegarPlatform = () => {};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function pasangHud(keluarFn, segarFn, masukSemulaFn) {
  onKeluar = keluarFn; onSegarPlatform = segarFn;
  H = $('#hud');
  E.ui = {
    toast, banner, info, tanya, cara, chat, segar: segarSenarai, kesihatan, konfeti, soalanSemasa, tawarLangkau, butangAksi, kekunci, masukSemula: masukSemulaFn, syiling: (n) => tambahCbux(0)
  };
  dengar('lencana', (id) => paparLencana(id));
  dengar('cbux', (n) => { if (n > 0 && E.aktif) terapung('+' + n + ' CBux'); });
}

/* ---------- binaan DOM setiap kali masuk dunia ---------- */
export function bukaHud(nama) {
  H.hidden = false; const sentuh = matchMedia('(pointer:coarse)').matches || /[?&]sentuh=1/.test(location.search);
  H.innerHTML = `
    <div class="h-kiri">
      <button class="h-btn" id="hMenu" data-uji="menu" aria-label="${t('Menu', 'Menu', 'Menu')}">${ic('menu', 22)}</button>
      <button class="h-btn" id="hChat" aria-label="${t('Sembang', 'Chat', 'Obrolan')}">${ic('chat', 21)}</button>
      <button class="h-btn" id="hPemain" aria-label="${t('Pemain', 'Players', 'Pemain')}">${ic('users', 21)}</button>
    </div>
    <div class="h-chat" id="chatBox"><div class="h-log" id="chatLog"></div>
      <form id="chatForm"><input id="chatIn" maxlength="60" autocomplete="off" placeholder="${t('Tekan / untuk sembang', 'Press / to chat', 'Tekan / untuk mengobrol')}" aria-label="chat"></form></div>
    <div class="h-tengah"><div class="h-banner" id="hBanner" hidden></div><div class="h-info" id="hInfo" hidden></div><div class="h-soal" id="hSoal" hidden></div></div>
    <div class="h-senarai" id="hSenarai"></div>
    <div class="h-toast" id="hToast" aria-live="polite"></div>
    <div class="h-bawah">
      <div class="h-beg" id="hBeg"></div>
      <div class="h-hp"><i id="hHp"></i></div>
    </div>
    <div id="hJoy" class="h-joy" hidden><i></i></div>
    <button id="hLompat" class="h-lompat" ${sentuh ? '' : 'hidden'} aria-label="${t('Lompat', 'Jump', 'Lompat')}">${ic('stairs', 30)}</button>
    <button id="hAksi" class="h-aksi" hidden></button>
    <div id="hLencana" class="h-lenc" hidden></div>
    <div id="hFx" class="h-fx"></div>`;
  $('#hMenu').onclick = bukaMenu;
  $('#hChat').onclick = () => $('#chatBox').classList.toggle('tutup');
  $('#hPemain').onclick = () => $('#hSenarai').classList.toggle('tutup');
  if (innerWidth < 720) { $('#chatBox').classList.add('tutup'); $('#hSenarai').classList.add('tutup'); }
  $('#chatForm').onsubmit = (e) => { e.preventDefault(); hantar(); };
  const J = $('#hJoy'); pasangJoystik(J, J.firstElementChild);
  const L = $('#hLompat');
  L.addEventListener('pointerdown', (e) => { e.preventDefault(); E.inp.lompat = true; }); for (const n of ['pointerup', 'pointercancel', 'pointerleave']) L.addEventListener(n, () => { E.inp.lompat = false; });
  binaBeg(); kesihatan(100); segarSenarai(); chat(null, t(`Selamat datang ke ${nama}. Pemain lain ialah bot AI.`, `Welcome to ${nama}. Other players are AI bots.`, `Selamat datang di ${nama}. Pemain lain adalah bot AI.`));
  tSenarai = setInterval(() => { if (E.aktif) segarSenarai(); }, 1000);
  setTimeout(soalanChat, 25000);
}
let tSenarai = 0;
export function tutupHud() { H.hidden = true; H.innerHTML = ''; clearInterval(tSenarai); $('#hMenuBox')?.remove(); $('#hSoalBox')?.remove(); soalChat = null; }

/* ---------- beg alat: gegelung dibeli di Kedai ---------- */
function binaBeg() {
  const alat = KATALOG.filter((k) => k.jenis === 'alat' && S.milik.includes(k.id)), B = $('#hBeg'); if (!B) return;
  B.innerHTML = alat.map((a, i) => `<button class="h-alat ${S.gear === a.id ? 'on' : ''}" data-a="${a.id}" aria-pressed="${S.gear === a.id}" title="${esc(tx(a.n))}"><small>${i + 1}</small>${ic(a.ikon, 24)}</button>`).join('');
  B.querySelectorAll('button').forEach((b) => { b.onclick = () => { pakaiAlat(b.dataset.a); }; });
  terapkanAlat();
}
function pakaiAlat(id) { S.gear = S.gear === id ? null : id; simpan(); bunyi('tap'); binaBeg(); }
export function terapkanAlat() { const P = E.P; if (!P) return; const asasL = 16 + (E.dunia?.mod.id === 'sim' ? S.x.sim.laju * 3 : 0); P.laju = S.gear === 'coilLaju' ? Math.max(24, asasL + 8) : asasL; P.kuasaLompat = S.gear === 'coilLompat' ? 68 : 50; }

/* ---------- senarai pemain ---------- */
function segarSenarai() {
  const L = $('#hSenarai'), D = E.dunia; if (!L || !D) return;
  const st = D.mod.statistik();
  const baris = [{ n: S.nama, v: st.map((s) => s.v), saya: true }, ...D.bots.map((b) => ({ n: b.nama, v: D.mod.statistikBot(b), bot: true }))];
  L.innerHTML = `<div class="h-tajuk"><span>${t('Pemain', 'Players', 'Pemain')}</span>${st.map((s) => `<span>${esc(s.k)}</span>`).join('')}</div>` + baris.map((b) => `<div class="h-baris ${b.saya ? 'saya' : ''}"><span class="n">${b.bot ? ic('bot', 12) : ''}${esc(b.n)}</span>${b.v.map((v) => `<span>${esc(v)}</span>`).join('')}</div>`).join('');
}
function kesihatan(n) { const h = $('#hHp'); if (h) h.style.width = n + '%'; }
function banner(s) { const b = $('#hBanner'); if (b) { b.hidden = !s; b.textContent = s; } }
function info(s) { const b = $('#hInfo'); if (b) { b.hidden = !s; if (b.textContent !== s) b.textContent = s; } }
function soalanSemasa(s) { const b = $('#hSoal'); if (b) { b.hidden = !s; if (s) { b.innerHTML = `<small>${t('Pijak jawapan yang betul', 'Step on the right answer', 'Injak jawaban yang benar')}</small><b>${esc(s)}</b>`; } } }
function toast(s, jenis = '') {
  const T = $('#hToast'); if (!T) return; const d = document.createElement('div'); d.className = 'tt ' + jenis; d.textContent = s; T.appendChild(d);
  while (T.children.length > 3) T.firstChild.remove(); setTimeout(() => d.remove(), 3200);
}
function terapung(s) { const F = $('#hFx'); if (!F) return; const d = document.createElement('div'); d.className = 'ap'; d.textContent = s; F.appendChild(d); setTimeout(() => d.remove(), 1000); }
function paparLencana(id) {
  const L = $('#hLencana'); bunyi('lencana'); const b = LENCANA[id]; if (!L) return;
  L.hidden = false; L.innerHTML = `<span class="i">${ic(b.i, 26)}</span><div><small>${t('Lencana baharu', 'New badge', 'Lencana baru')}</small><b>${esc(tx(b.n))}</b><em>+${b.cb} CBux</em></div>`;
  clearTimeout(L._t); L._t = setTimeout(() => { L.hidden = true; }, 3800);
}
function konfeti() {
  const F = $('#hFx'); if (!F) return; const W = ['#d9b25f', '#d8714f', '#7f9fd9', '#a3b86c', '#f19bb4', '#efe6d2'];
  for (let i = 0; i < 70; i++) { const c = document.createElement('i'); c.className = 'cf'; c.style.cssText = `left:${Math.random() * 100}%;background:${W[i % 6]};animation-delay:${Math.random() * 0.6}s;animation-duration:${1.8 + Math.random() * 1.4}s;--x:${(Math.random() - 0.5) * 120}px`; F.appendChild(c); setTimeout(() => c.remove(), 4000); }
}
function butangAksi(label, fn) { const b = $('#hAksi'); if (!b) return; if (!label) { b.hidden = true; return; } b.hidden = false; b.innerHTML = ic('pencil', 20) + `<span>${esc(label)}</span><small>F</small>`; b.onpointerdown = (e) => { e.preventDefault(); fn(); }; }

/* ---------- sembang ---------- */
function chat(nama, teks) {
  const L = $('#chatLog'); if (!L) return; const d = document.createElement('div');
  d.innerHTML = nama ? `<b>[${esc(nama)}]:</b> ${esc(teks)}` : `<em>${esc(teks)}</em>`; L.appendChild(d); while (L.children.length > 30) L.firstChild.remove(); L.scrollTop = L.scrollHeight;
  if (nama && nama !== S.nama) bunyi('chat', 300);
}
let soalChat = null;
/* bot bertanya dalam sembang: taip jawapan = bonus CBux */
function soalanChat() {
  if (!E.aktif || !E.dunia?.bots.length) return;
  if (!E.tahan) { const q = buatSoal(S.topik, S.diff, 0); q.miss = 0; q.ans = q.c; soalChat = q; const b = E.dunia.bots[Math.floor(Math.random() * E.dunia.bots.length)], tx2 = t(`siapa tahu ${q.a} ${SIMBOL[q.ty]} ${q.b}? taip jawapan`, `who knows ${q.a} ${SIMBOL[q.ty]} ${q.b}? type the answer`, `siapa tahu ${q.a} ${SIMBOL[q.ty]} ${q.b}? ketik jawabannya`); chat(b.nama, tx2); b.cakap(`${q.a} ${SIMBOL[q.ty]} ${q.b} = ?`); }
  setTimeout(soalanChat, 45000 + Math.random() * 30000);
}
const SIMBOL = { tambah: '+', kurang: '−', kali: '×', bagi: '÷' };
function hantar() {
  const i = $('#chatIn'), v = i.value.trim(); i.value = ''; i.blur(); if (!v) return;
  chat(S.nama, v);
  if (soalChat && /^-?\d+$/.test(v)) {
    const ok = Number(v) === soalChat.ans; const q = soalChat;
    if (ok) { soalChat = null; rekod(q, true); bunyi('betul'); tambahCbux(5); setTimeout(() => chat(E.dunia?.bots[0]?.nama, t('betul! pandainya', "that's right! nice", 'benar! pintar')), 500); }
    else { rekod(q, false); setTimeout(() => chat(E.dunia?.bots[0]?.nama, t('hmm cuba kira lagi', 'hmm try again', 'hmm coba hitung lagi')), 500); }
  }
}
function kekunci(e) {
  if ($('#hSoalBox')) { const n = Number(e.key); if (n >= 1 && n <= 4) { $('#hSoalBox').querySelectorAll('.j')[n - 1]?.click(); } if (e.code === 'Enter') $('#hSoalBox .tutupCara')?.click(); return; }
  if (e.code === 'Escape') { $('#hMenuBox') ? tutupMenu() : bukaMenu(); return; }
  if ($('#hMenuBox')) { if (e.code === 'KeyR') { tutupMenu(); setSemula(); } if (e.code === 'KeyL') { tutupMenu(); onKeluar(); } return; }
  if (e.key === '/') { e.preventDefault(); $('#chatBox').classList.remove('tutup'); $('#chatIn').focus(); kosongInput(); return; }
  if (e.code === 'Tab') { e.preventDefault(); $('#hSenarai').classList.toggle('tutup'); return; }
  const n = Number(e.key); if (n >= 1 && n <= 9) { const a = KATALOG.filter((k) => k.jenis === 'alat' && S.milik.includes(k.id))[n - 1]; if (a) pakaiAlat(a.id); }
  E.dunia?.mod.kekunci?.(e);
}

/* ---------- soalan (modal) ---------- */
export function tanya(o = {}) {
  return new Promise((selesai) => {
    E.tahan++; kosongInput();
    const q = o.q || buatSoal(S.topik, S.diff, o.tier || 0), B = document.createElement('div');
    B.id = 'hSoalBox'; B.className = 'soalbox'; B.setAttribute('role', 'dialog'); B.setAttribute('aria-modal', 'true');
    const akhir = (ok) => { B.remove(); E.tahan = Math.max(0, E.tahan - 1); selesai(ok); };
    B.innerHTML = `<div class="sb"><small class="sb-t">${esc(o.tajuk || t('Soalan', 'Question', 'Soal'))}</small><div class="sb-q">${esc(teksSoal(q))}</div>${o.nota ? `<p class="sb-n">${esc(o.nota)}</p>` : ''}
      <div class="sb-j">${q.opts.map((v, i) => `<button class="j" data-uji="jawapan" data-v="${v}" data-betul="${v === q.ans}"><small>${i + 1}</small>${nombor(v)}</button>`).join('')}</div></div>`;
    document.body.appendChild(B);
    B.querySelectorAll('.j').forEach((b) => {
      b.onclick = () => {
        if (b.disabled) return; const ok = Number(b.dataset.v) === q.ans; rekod(q, ok);
        B.querySelectorAll('.j').forEach((x) => { x.disabled = true; if (Number(x.dataset.v) === q.ans) x.classList.add('ok'); });
        if (ok) { bunyi('betul'); b.classList.add('ok'); tambahCbux(1); setTimeout(() => akhir(true), 420); return; }
        b.classList.add('no'); bunyi('salah');
        const sb = B.querySelector('.sb'), c = document.createElement('div'); c.className = 'sb-c';
        c.innerHTML = `<b>${t('Cara mengira', 'How to solve it', 'Cara menghitung')}</b><ol>${caraKira(q).map((x) => `<li>${x}</li>`).join('')}</ol><button class="gbtn tutupCara" data-uji="faham">${t('Faham', 'Got it', 'Paham')}</button>`;
        sb.appendChild(c); c.querySelector('button').onclick = () => akhir(false); c.querySelector('button').focus();
      };
    });
  });
}
/* jawapan salah di dunia (jambatan/pintu): papar cara tanpa memberhentikan permainan */
function cara(teks, jawapan, baris) {
  const T = $('#hToast'); if (!T) return; const d = document.createElement('div'); d.className = 'tt cara';
  d.innerHTML = `<b>${esc(teks.replace('?', jawapan))}</b>${baris.map((x) => `<span>${x}</span>`).join('')}`; T.appendChild(d); setTimeout(() => d.remove(), 5200);
}
/* jatuh 5 kali: tawaran langkau dengan 3 soalan */
function tawarLangkau(fn) {
  setTimeout(async () => {
    if (!E.aktif) return;
    const m = await tanyaPilihan(t('Peringkat ini susah?', 'Is this stage hard?', 'Tahap ini susah?'), t('Jawab 3 soalan untuk langkau ke peringkat seterusnya.', 'Answer 3 questions to skip to the next stage.', 'Jawab 3 soal untuk lompat ke tahap berikutnya.'), t('Langkau', 'Skip', 'Lewati'), t('Teruskan cuba', 'Keep trying', 'Terus coba'));
    if (!m) return;
    let lulus = 0;
    for (let i = 0; i < 3; i++) if (await tanya({ tier: 0, tajuk: t('Langkau peringkat', 'Skip stage', 'Lewati tahap'), nota: `${i + 1} / 3` })) lulus++;
    if (lulus === 3) { await fn(); toast(t('Peringkat dilangkau', 'Stage skipped', 'Tahap dilewati'), 'emas'); setSemula(); }
    else toast(t(`${lulus} daripada 3 betul. Cuba lagi nanti.`, `${lulus} of 3 correct. Try again later.`, `${lulus} dari 3 benar. Coba lagi nanti.`), 'amaran');
  }, 2400);
}
export function tanyaPilihan(tajuk, teks, ya, tidak) {
  return new Promise((selesai) => {
    E.tahan++; const B = document.createElement('div'); B.className = 'soalbox'; B.id = 'hTanya';
    B.innerHTML = `<div class="sb"><div class="sb-q kecil">${esc(tajuk)}</div><p class="sb-n">${esc(teks)}</p><div class="sb-b"><button class="gbtn" id="tY">${esc(ya)}</button><button class="bbtn" id="tT">${esc(tidak)}</button></div></div>`;
    document.body.appendChild(B); const akhir = (v) => { B.remove(); E.tahan = Math.max(0, E.tahan - 1); selesai(v); };
    B.querySelector('#tY').onclick = () => akhir(true); B.querySelector('#tT').onclick = () => akhir(false);
  });
}

/* ---------- menu Esc ---------- */
function bukaMenu() {
  if ($('#hMenuBox')) return; E.tahan++; kosongInput(); bunyi('tap');
  const B = document.createElement('div'); B.id = 'hMenuBox'; B.className = 'menubox'; B.setAttribute('role', 'dialog');
  document.body.appendChild(B); lukisMenu(B, 'pemain');
}
function tutupMenu() { const B = $('#hMenuBox'); if (B) { B.remove(); E.tahan = Math.max(0, E.tahan - 1); } }
export function kawalanTetapan(R, selepas) {
  const baris = (l, h) => `<div class="tp"><span>${l}</span><div class="seg">${h}</div></div>`;
  const pilih = (k, v, teks) => `<button data-k="${k}" data-v="${v}" aria-pressed="${String(S[k]) === String(v)}">${esc(teks)}</button>`;
  R.innerHTML =
    baris(t('Bahasa', 'Language', 'Bahasa'), Object.entries(BAHASA).map(([k, v]) => pilih('bahasa', k, v)).join('')) +
    baris(t('Tahap soalan', 'Question level', 'Tingkat soal'), DIFFS.map((d) => pilih('diff', d, tx(NAMA_DIFF[d]))).join('')) +
    baris(t('Topik', 'Topic', 'Topik'), Object.keys(NAMA_TOPIK).map((d) => pilih('topik', d, tx(NAMA_TOPIK[d]))).join('')) +
    baris(t('Bunyi', 'Sound', 'Suara'), pilih('bunyi', true, t('Hidup', 'On', 'Nyala')) + pilih('bunyi', false, t('Tutup', 'Off', 'Mati'))) +
    baris(t('Muzik', 'Music', 'Musik'), pilih('muzik', true, t('Hidup', 'On', 'Nyala')) + pilih('muzik', false, t('Tutup', 'Off', 'Mati'))) +
    baris(t('Grafik', 'Graphics', 'Grafik'), pilih('grafik', 'auto', 'Auto') + pilih('grafik', 'rendah', t('Ringan', 'Light', 'Ringan')));
  R.querySelectorAll('button[data-k]').forEach((b) => {
    b.onclick = () => {
      const k = b.dataset.k; let v = b.dataset.v; if (v === 'true') v = true; if (v === 'false') v = false;
      S[k] = v; simpan(); bunyi('tap');
      if (k === 'bahasa') { setBahasa(v); onSegarPlatform(); }
      if (k === 'muzik' || k === 'bunyi') { if (S.muzik && S.bunyi) { mulaAudio(); muzik(E.dunia?.mod.tema || 'lobi'); } else henti(); }
      selepas();
    };
  });
}
function lukisMenu(B, tab) {
  B.innerHTML = `<div class="mb"><div class="mb-tab">
      ${[['pemain', 'users', t('Pemain', 'Players', 'Pemain')], ['tetapan', 'settings', t('Tetapan', 'Settings', 'Pengaturan')], ['bantuan', 'keyboard', t('Kawalan', 'Controls', 'Kontrol')]].map(([k, i, l]) => `<button data-t="${k}" aria-pressed="${tab === k}">${ic(i, 18)}${l}</button>`).join('')}
    </div><div class="mb-isi" id="mbIsi"></div>
    <div class="mb-bawah">
      <button class="bbtn" id="mReset" data-uji="reset">${ic('refresh', 18)}${t('Set Semula', 'Reset Character', 'Ulang Karakter')}<kbd>R</kbd></button>
      <button class="bbtn" id="mKeluar" data-uji="keluar">${ic('logout', 18)}${t('Keluar', 'Leave', 'Keluar')}<kbd>L</kbd></button>
      <button class="gbtn" id="mSambung" data-uji="sambung">${ic('play', 18)}${t('Sambung', 'Resume', 'Lanjut')}<kbd>Esc</kbd></button>
    </div></div>`;
  B.querySelectorAll('.mb-tab button').forEach((b) => { b.onclick = () => { bunyi('tap'); lukisMenu(B, b.dataset.t); }; });
  const I = $('#mbIsi');
  if (tab === 'pemain') {
    const D = E.dunia; I.innerHTML = [S.nama, ...D.bots.map((b) => b.nama)].map((n, i) => `<div class="mp"><span>${i ? ic('bot', 16) : ic('user', 16)}</span><b>${esc(n)}</b><small>${i ? t('Bot AI', 'AI bot', 'Bot AI') : t('Anda', 'You', 'Kamu')}</small></div>`).join('');
  } else if (tab === 'tetapan') { kawalanTetapan(I, () => lukisMenu(B, 'tetapan')); }
  else {
    I.innerHTML = `<dl class="kw"><dt>W A S D</dt><dd>${t('Bergerak', 'Move', 'Bergerak')}</dd><dt>Space</dt><dd>${t('Lompat', 'Jump', 'Lompat')}</dd><dt>${t('Seret tetikus', 'Drag mouse', 'Seret mouse')}</dt><dd>${t('Pusing kamera', 'Rotate camera', 'Putar kamera')}</dd><dt>${t('Roda tetikus', 'Mouse wheel', 'Roda mouse')}</dt><dd>${t('Zum', 'Zoom', 'Zoom')}</dd><dt>← →</dt><dd>${t('Pusing kamera', 'Rotate camera', 'Putar kamera')}</dd><dt>/</dt><dd>${t('Sembang', 'Chat', 'Obrolan')}</dd><dt>Tab</dt><dd>${t('Senarai pemain', 'Player list', 'Daftar pemain')}</dd><dt>1–4</dt><dd>${t('Jawab soalan / alat', 'Answer / tools', 'Jawab soal / alat')}</dd><dt>F</dt><dd>${t('Kutip kristal (Simulator)', 'Mine crystal (Simulator)', 'Ambil kristal (Simulator)')}</dd></dl>`;
  }
  $('#mReset').onclick = () => { tutupMenu(); setSemula(); };
  $('#mKeluar').onclick = () => { tutupMenu(); onKeluar(); };
  $('#mSambung').onclick = tutupMenu;
}
export { beriLencana };
