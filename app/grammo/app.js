/* ============================================================
   Grammo — app grammar bahasa Inggris (PWA, tanpa build)
   Mesin di-remake dari app jejak.: keadaan -> skrin -> lukis -> papan
   ============================================================ */

const KUNCI_SIMPAN = 'grammo-v1';
function keadaanAsal() {
  return { skrin: 'splash', onb: 0, nama: '', kelas: 'Kelas 8', sekolah: '', target: 10, bahasa: 'id',
    skor: {}, lihat: {}, dibuka: {}, xp: 0, xpHari: {}, riwayat: [], bunyi: true };
}
let S = keadaanAsal();
let T = { topik: 'present', tab: 'materi', filter: 'semua', cari: '', kuis: null, hasil: null, banner: 0, terjemah: {}, galat: '', lihatSandi: false, cariKamus: '' };
let PAPAN = false;

function simpan() { if (PAPAN) return; try { localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(S)); } catch (e) {} }
function muat() { try { const d = JSON.parse(localStorage.getItem(KUNCI_SIMPAN) || 'null'); if (d) S = Object.assign(keadaanAsal(), d); } catch (e) {} }

/* ---------- pembantu ---------- */
const L = k => (UI[k] ? UI[k][S.bahasa === 'en' ? 1 : 0] : k);
const TX = o => (o ? o[S.bahasa] || o.id : '');
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function fmt(s) { return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>'); }
function polos(s) { return String(s).replace(/\*/g, ''); }
function topikIkut(id) { return TOPIK.find(t => t.id === id) || TOPIK[0]; }
function inisial(n) { return (n || 'Siswa').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
function namaDepan() { return (S.nama || 'Siswa').split(' ')[0]; }
function tgl(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function persen(t) {
  const l = S.lihat[t.id] || {};
  return Math.round((l.materi ? 30 : 0) + (l.contoh ? 20 : 0) + ((S.skor[t.id] || 0) / 5) * 50);
}
function selesai(t) { return (S.skor[t.id] || 0) >= 4; }
function level() { return 1 + Math.floor(S.xp / 100); }
function tambahXP(n) { S.xp += n; const h = tgl(); S.xpHari[h] = (S.xpHari[h] || 0) + n; }
function tanggalPendek(ts) {
  const d = new Date(ts); const b = S.bahasa === 'en' ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] : ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return (S.bahasa === 'en' ? b[d.getMonth()] + ' ' + d.getDate() : d.getDate() + ' ' + b[d.getMonth()]) + ', ' + d.getFullYear() + ' · ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
function dedah(teks, mula) {
  let i = mula || 0;
  return '<span class="dedah">' + teks.split('\n').map(baris => esc(baris).split(' ').map(w => '<span class="k"><span style="--i:' + (i++) + '">' + w + '</span></span>').join(' ')).join('<br>') + '</span>';
}
function pilBahasa() {
  return '<div class="bahasa-pil"><button class="' + (S.bahasa === 'id' ? 'aktif' : '') + '" onclick="setBahasa(\'id\')">ID</button><button class="' + (S.bahasa === 'en' ? 'aktif' : '') + '" onclick="setBahasa(\'en\')">EN</button></div>';
}
function setBahasa(b) { if (S.bahasa === b) return; S.bahasa = b; simpan(); klik(700); simpanSkrol(); lukis(); pulihSkrol(); }
let posSkrol = 0;
function simpanSkrol() { const s = document.querySelector('#telefon .skrol'); posSkrol = s ? s.scrollTop : 0; }
function pulihSkrol() { const s = document.querySelector('#telefon .skrol'); if (s) { s.scrollTop = posSkrol; s.querySelectorAll('.sr').forEach(x => x.classList.add('nampak')); } }

/* bunyi klik + suara bahasa Inggris */
let audio = null;
function klik(nada) {
  if (!S.bunyi || PAPAN) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = nada || 660; g.gain.setValueAtTime(.05, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .12);
    o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + .13);
  } catch (e) {}
}
function ucap(teks) {
  try {
    if (!('speechSynthesis' in window)) { tunjuk(S.bahasa === 'en' ? 'Speech not supported' : 'Suara tidak didukung', 'suara'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(polos(teks)); u.lang = 'en-US'; u.rate = .9;
    speechSynthesis.speak(u);
  } catch (e) {}
}
function tunjuk(pesan, ik) {
  const sk = document.querySelector('#telefon .skrin'); if (!sk) return;
  sk.querySelectorAll('.toast').forEach(t => t.remove());
  sk.insertAdjacentHTML('beforeend', '<div class="toast">' + ikon(ik || 'centang', 16) + esc(pesan) + '</div>');
  setTimeout(() => { const t = sk.querySelector('.toast'); if (t) t.remove(); }, 2500);
}
function konfeti() {
  const sk = document.querySelector('#telefon .skrin'); if (!sk) return;
  const w = ['#9FE870', '#D2F35C', '#F3B5E5', '#163300', '#9FC7F0'];
  let h = '<div class="konfeti">';
  for (let i = 0; i < 70; i++) h += '<i style="left:' + Math.random() * 100 + '%;background:' + w[i % 5] + ';' + (i % 3 ? 'height:4px;width:12px' : 'border-radius:50%') + ';--x:' + (Math.random() * 120 - 60) + 'px;--y:' + (600 + Math.random() * 300) + 'px;--r:' + Math.random() * 720 + 'deg;--t:' + (1.8 + Math.random() * 1.4) + 's;--d:' + Math.random() * .5 + 's"></i>';
  sk.insertAdjacentHTML('beforeend', h + '</div>');
  setTimeout(() => { const k = sk.querySelector('.konfeti'); if (k) k.remove(); }, 4000);
}

/* ---------- navigasi ---------- */
function pergi(skrin, data) {
  klik(520);
  Object.assign(T, data || {});
  T.galat = '';
  S.skrin = skrin;
  if (skrin === 'topik') { S.dibuka[T.topik] = Date.now(); tandaiLihat(); }
  simpan();
  lukis();
}
function tandaiLihat() {
  if (PAPAN) return;
  const id = T.topik; S.lihat[id] = S.lihat[id] || {};
  if ((T.tab === 'materi' || T.tab === 'contoh') && !S.lihat[id][T.tab]) { S.lihat[id][T.tab] = true; tambahXP(5); }
}
function barStatus() {
  const d = new Date();
  return '<div class="bar-status"><span>' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + '</span><span class="kanan"><span class="isyarat"><i style="height:4px"></i><i style="height:6px"></i><i style="height:8px"></i><i style="height:10px"></i></span><span class="bateri"></span></span></div>';
}
function barAtas(kembali, tengah, kanan) {
  return '<div class="bar-atas"><button class="bulat-btn" onclick="' + kembali + '" aria-label="Kembali">' + ikon('kiri', 20) + '</button><span class="judul-bar">' + (tengah || '') + '</span>' + (kanan || '<span style="width:42px"></span>') + '</div>';
}

/* ============================================================
   SKRIN
   ============================================================ */
function skrinSplash() {
  return '<div class="splash"><div class="merek">Grammo</div><div class="sub">English Grammar · ID / EN</div><div class="muat"><i></i></div></div>';
}

const ONB = [
  { t: { id: 'Belajar grammar\njadi seru di sini', en: 'Learn grammar\nthe fun way here' } },
  { t: { id: 'Rumus jelas,\ncontoh kalimat nyata', en: 'Clear formulas,\nreal-life examples' } },
  { t: { id: 'Lebih dari 60 soal\nlatihan menunggumu', en: 'Over 60 practice\nquestions wait for you' } }
];
function visualOnb(i) {
  if (i === 0) return '<div class="onb-visual">' + bungaBintang('#FAD4F2', 150, 'putar-pelan', 'position:absolute;right:-40px;top:-30px') +
    '<div class="kalimat-kartu" style="left:26px;top:70px;--m:.1s;--r:-3deg"><small>Simple Present</small>She <span class="chip-kata v">plays</span> the guitar.</div>' +
    '<div class="kalimat-kartu" style="right:22px;top:170px;--m:.3s;--t:8s;--r:2deg"><small>Adjective</small>a <span class="chip-kata a">red</span> <span class="chip-kata n">bag</span></div>' +
    '<div class="kalimat-kartu" style="left:40px;top:262px;--m:.5s;--t:6s"><small>Simple Past</small>We <span class="chip-kata v">went</span> home.</div>' +
    kilau('#163300', 22, 'position:absolute;left:30px;top:30px') + '</div>';
  if (i === 1) return '<div class="onb-visual">' + bungaBintang('#D2F35C', 120, 'putar-pelan', 'position:absolute;left:-30px;bottom:-20px') +
    '<div class="laptop-kartu"><div style="font-size:11px;opacity:.7;font-weight:700">FORMULA</div><div style="font-size:18px;font-weight:800;margin-top:4px">S + <span style="color:#D2F35C">V2</span> + O</div><div class="baris-l l"></div><div class="baris-l"></div><div class="baris-l" style="width:80%"></div></div>' +
    '<div class="kalimat-kartu" style="right:26px;top:60px;--m:.4s;background:#9FE870"><small style="color:#163300">✓ Correct</small>I visited Bali.</div>' +
    kilau('#163300', 26, 'position:absolute;right:60px;bottom:60px') + '</div>';
  return '<div class="onb-visual" style="flex-direction:column;gap:10px">' + bungaBintang('#FAD4F2', 130, 'putar-pelan', 'position:absolute;right:-20px;bottom:-30px') +
    [['12', { id: 'topik grammar', en: 'grammar topics' }, '#D2F35C'], ['60', { id: 'soal latihan', en: 'practice questions' }, '#fff'], ['25', { id: 'kata kerja tak beraturan', en: 'irregular verbs' }, '#E3F5D9']].map((x, n) =>
      '<div class="kalimat-kartu" style="position:relative;--m:' + (n * .2) + 's;background:' + x[2] + ';display:flex;align-items:center;gap:12px;font-size:15px;width:230px"><b style="font-size:30px;font-weight:800">' + x[0] + '</b>' + esc(TX(x[1])) + '</div>').join('') + '</div>';
}
function skrinOnb() {
  const o = ONB[S.onb], akhir = S.onb === ONB.length - 1;
  return '<div class="onb">' + visualOnb(S.onb) + '<div class="onb-isi"><h1 class="h1">' + dedah(TX(o.t)) + '</h1>' +
    '<div class="titik-titik">' + ONB.map((x, n) => '<i class="' + (n === S.onb ? 'aktif' : '') + '"></i>').join('') + '</div>' +
    '<div class="onb-bawah"><button class="lewati" onclick="pergi(\'sambut\')">' + L('lewati') + '</button>' +
    '<button class="panah-bulat" onclick="lanjutOnb()" aria-label="Lanjut">' + ikon(akhir ? 'centang' : 'kanan', 22) + '</button></div></div></div>';
}
function lanjutOnb() { if (S.onb < ONB.length - 1) { S.onb++; klik(600); lukis(); } else pergi('sambut'); }

function skrinSambut() {
  const chip = [['Noun', '#FAD4F2', 0], ['Verb', '#D2F35C', 60], ['a / an', '#fff', 120], ['will', '#E3F5D9', 180], ['-ed', '#D2F35C', 240], ['Tenses', '#fff', 300]];
  return '<div class="sambut"><div style="align-self:flex-end">' + pilBahasa() + '</div>' +
    '<div class="orbit"><div class="inti">Aa</div><div class="cincin">' + chip.map(c => {
      const a = c[2] * Math.PI / 180, x = 125 + Math.cos(a) * 112, y = 125 + Math.sin(a) * 112;
      return '<span style="left:' + (x - 30) + 'px;top:' + (y - 16) + 'px;background:' + c[1] + '">' + c[0] + '</span>';
    }).join('') + '</div></div>' +
    '<h1 class="raksasa">' + dedah(S.bahasa === 'en' ? 'Grammar\nmade easy' : 'Grammar\njadi gampang') + '</h1>' +
    '<p class="body" style="margin-top:12px">' + (S.bahasa === 'en' ? 'Clear rules. Fun practice.' : 'Rumus jelas. Latihan seru.') + '</p>' +
    '<div style="margin-top:auto;width:100%;display:flex;flex-direction:column;gap:10px"><button class="btn" onclick="pergi(\'masuk\')">' + L('masuk') + '</button><button class="btn abu" onclick="pergi(\'daftar\')">' + ikon('sekolah', 18) + L('daftar') + '</button></div></div>';
}

function medan(ik, ph, data, jenis, nilai) {
  const sandi = jenis === 'password';
  return '<label class="medan-i">' + ikon(ik, 18) + '<input data-f="' + data + '" type="' + (sandi && T.lihatSandi ? 'text' : jenis || 'text') + '" placeholder="' + esc(ph) + '" value="' + esc(nilai || '') + '">' +
    (sandi ? '<button type="button" onclick="T.lihatSandi=!T.lihatSandi;ambilForm();lukis()" aria-label="Lihat sandi">' + ikon('mata', 18) + '</button>' : '') + '</label>';
}
let FORM = {};
function ambilForm() { document.querySelectorAll('#telefon [data-f]').forEach(i => FORM[i.dataset.f] = i.value); }
function skrinMasuk() {
  return '<div class="form-wrap"><div style="align-self:flex-end;margin:-26px 0 10px">' + pilBahasa() + '</div><h1 class="h1">' + dedah(L('halo')) + '</h1><p class="sub-f">' + L('haloSub') + '</p>' +
    medan('orang', S.bahasa === 'en' ? 'Name' : 'Nama', 'nama', 'text', FORM.nama) + medan('gembok', S.bahasa === 'en' ? 'Password' : 'Kata sandi', 'sandi', 'password', FORM.sandi) +
    '<div style="text-align:right;margin:-2px 4px 18px"><button class="meta" style="color:var(--hutan);font-weight:700" onclick="tunjuk(S.bahasa===\'en\'?\'Ask your teacher to reset it\':\'Minta guru untuk mengatur ulang\',\'info\')">' + L('lupa') + '</button></div>' +
    (T.galat ? '<div class="galat">' + esc(T.galat) + '</div>' : '') +
    '<button class="btn" onclick="kirimMasuk()">' + L('masuk') + '</button>' +
    '<p class="meta" style="text-align:center;margin-top:22px">' + L('atau') + '</p>' +
    '<div class="sosial"><button onclick="masukCepat()" aria-label="Google">' + logoG(20) + '</button><button onclick="masukCepat()" aria-label="Sekolah">' + ikon('sekolah', 20) + '</button><button onclick="masukCepat()" aria-label="Email">' + ikon('emel', 20) + '</button></div>' +
    '<p class="meta" style="text-align:center;margin-top:auto">' + L('belumAkun') + ' <button class="btn-teks" onclick="FORM={};pergi(\'daftar\')">' + L('daftar') + '</button></p></div>';
}
function kirimMasuk() {
  ambilForm();
  if (!(FORM.nama || '').trim()) { T.galat = S.bahasa === 'en' ? 'Please type your name.' : 'Tulis namamu dulu ya.'; lukis(); return; }
  if ((FORM.sandi || '').length < 4) { T.galat = S.bahasa === 'en' ? 'Password needs at least 4 characters.' : 'Kata sandi minimal 4 karakter.'; lukis(); return; }
  S.nama = FORM.nama.trim(); FORM = {}; klik(880); pergi('beranda');
  setTimeout(() => tunjuk((S.bahasa === 'en' ? 'Welcome, ' : 'Selamat datang, ') + namaDepan() + '!', 'lonceng'), 250);
}
function masukCepat() { S.nama = S.nama || 'Siswa Grammo'; FORM = {}; pergi('beranda'); }
function skrinDaftar() {
  return '<div class="form-wrap"><div style="align-self:flex-end;margin:-26px 0 10px">' + pilBahasa() + '</div><h1 class="h1">' + dedah(L('halo')) + '</h1><p class="sub-f">' + L('daftarSub') + '</p>' +
    medan('orang', S.bahasa === 'en' ? 'Name' : 'Nama', 'nama', 'text', FORM.nama) +
    medan('sekolah', S.bahasa === 'en' ? 'Grade (e.g. Grade 8)' : 'Kelas (mis. Kelas 8)', 'kelas', 'text', FORM.kelas) +
    medan('gembok', S.bahasa === 'en' ? 'Create Password' : 'Buat kata sandi', 'sandi', 'password', FORM.sandi) +
    medan('gembok', S.bahasa === 'en' ? 'Re-type Password' : 'Ulangi kata sandi', 'ulang', 'password', FORM.ulang) +
    (T.galat ? '<div class="galat">' + esc(T.galat) + '</div>' : '') +
    '<button class="btn" style="margin-top:8px" onclick="kirimDaftar()">' + L('daftar') + '</button>' +
    '<p class="meta" style="text-align:center;margin-top:20px">' + (S.bahasa === 'en' ? 'Or sign up with' : 'Atau daftar dengan') + '</p>' +
    '<div class="sosial"><button onclick="masukCepat()" aria-label="Google">' + logoG(20) + '</button><button onclick="masukCepat()" aria-label="Sekolah">' + ikon('sekolah', 20) + '</button><button onclick="masukCepat()" aria-label="Email">' + ikon('emel', 20) + '</button></div>' +
    '<p class="meta" style="text-align:center;margin-top:auto">' + L('sudahAkun') + ' <button class="btn-teks" style="color:var(--merah)" onclick="FORM={};pergi(\'masuk\')">' + L('masuk') + '</button></p></div>';
}
function kirimDaftar() {
  ambilForm();
  const en = S.bahasa === 'en';
  if (!(FORM.nama || '').trim()) T.galat = en ? 'Please type your name.' : 'Tulis namamu dulu ya.';
  else if ((FORM.sandi || '').length < 4) T.galat = en ? 'Password needs at least 4 characters.' : 'Kata sandi minimal 4 karakter.';
  else if (FORM.sandi !== FORM.ulang) T.galat = en ? 'Passwords do not match.' : 'Kata sandi tidak sama.';
  else T.galat = '';
  if (T.galat) { lukis(); return; }
  S.nama = FORM.nama.trim(); if ((FORM.kelas || '').trim()) S.kelas = FORM.kelas.trim();
  FORM = {}; klik(880); pergi('beranda'); setTimeout(() => konfeti(), 200);
}

/* ---------- BERANDA (Midwok) ---------- */
const BANNER = [
  { j: 'bannerJ', s: 'bannerS', aksi: "pergi('topik',{topik:'parts',tab:'materi'})", w: '#FAD4F2' },
  { j: { id: 'Tenses Tanpa Pusing', en: 'Tenses Without Stress' }, s: { id: '6 tenses penting untuk ujian sekolah, dijelaskan langkah demi langkah.', en: '6 key tenses for school exams, explained step by step.' }, aksi: "pergi('topik',{topik:'present',tab:'materi'})", w: '#D2F35C' },
  { j: { id: 'Kamus Kata Kerja', en: 'Verb Dictionary' }, s: { id: '25 irregular verbs: V1, V2, V3 lengkap dengan arti dan suara.', en: '25 irregular verbs: V1, V2, V3 with meaning and audio.' }, aksi: "pergi('kamus')", w: '#E3F5D9' }
];
function teksBanner(x) { return typeof x === 'string' ? L(x) : TX(x); }
function skrinBeranda() {
  const lanjut = TOPIK.slice().sort((a, b) => (S.dibuka[b.id] || 0) - (S.dibuka[a.id] || 0)).slice(0, 4);
  return '<div class="kepala"><button class="avatar" onclick="pergi(\'profil\')" aria-label="Profil">' + inisial(S.nama) + '</button><span class="merek-k">Grammo</span>' +
    '<button class="lonceng" onclick="pergi(\'notif\')" aria-label="' + L('notifikasi') + '">' + ikon('lonceng', 20) + '<i></i></button></div>' +
    '<div class="skrol"><div class="pad">' +
    '<label class="cari">' + ikon('cari', 18) + '<input placeholder="' + esc(L('cari')) + '" value="' + esc(T.cari) + '" oninput="cariTopik(this.value)"></label>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin:-2px 2px 12px"><span class="h3">' + (S.bahasa === 'en' ? 'Hi, ' : 'Hai, ') + esc(namaDepan()) + '!</span>' + pilBahasa() + '</div>' +
    '<div class="banner-wrap"><div class="banner-jendela"><div class="banner-slaid" style="transform:translateX(-' + (T.banner * 100) + '%)">' +
    BANNER.map(b => '<div class="banner"><h2 class="judul-w">' + esc(teksBanner(b.j)) + '</h2><p>' + esc(teksBanner(b.s)) + '</p><button class="btn gelap kecil" onclick="' + b.aksi + '">' + L('pelajari') + '</button>' + bungaBintang(b.w, 130, 'putar-pelan') + '</div>').join('') +
    '</div></div><div class="titik-banner"><span>' + BANNER.map((b, i) => '<i class="' + (i === T.banner ? 'aktif' : '') + '" onclick="geserBanner(' + i + ')"></i>').join('') + '</span></div></div>' +
    '<div class="seksyen"><h2 class="judul-w">' + L('lanjutkan') + '</h2></div>' +
    '<div class="mendatar">' + lanjut.map((t, i) => {
      const p = persen(t);
      return '<button class="kartu-proyek naik" style="--i:' + i + '" onclick="pergi(\'topik\',{topik:\'' + t.id + '\',tab:\'materi\'})"><h3 class="judul-w">' + esc(t.judul.en) + '</h3>' +
        '<div class="tag-tag"><span class="tag ' + (KATEGORI[t.kat].warna === 'pink' ? 'pink' : KATEGORI[t.kat].warna === 'lime' ? 'lime' : '') + '">' + TX(KATEGORI[t.kat]) + '</span><span class="tag">' + t.level + '</span></div>' +
        '<div class="kecil-caps">' + L('terakhir') + ':</div><div style="font-size:13px;font-weight:600;margin-top:2px">' + (S.dibuka[t.id] ? tanggalPendek(S.dibuka[t.id]) : (S.bahasa === 'en' ? 'Not opened yet' : 'Belum dibuka')) + '</div>' +
        '<div class="prog-baris"><span class="prog"><i style="width:' + Math.max(p, 3) + '%"></i></span><b>' + p + '%</b></div></button>';
    }).join('') + '</div>' +
    '<div class="seksyen"><h2 class="judul-w">' + L('topik') + '</h2><button class="btn-teks" onclick="T.filter=\'semua\';T.cari=\'\';lukis()">' + L('lihatSemua') + '</button></div>' +
    '<div class="pil-tab">' + [['semua', L('semua'), TOPIK.length], ['selesai', L('selesai'), TOPIK.filter(selesai).length], ['belum', L('belum'), TOPIK.filter(t => !selesai(t)).length]].map(f => '<button class="' + (T.filter === f[0] ? 'aktif' : '') + '" onclick="T.filter=\'' + f[0] + '\';klik(640);simpanSkrol();lukis();pulihSkrol()">' + f[1] + ' <i>' + f[2] + '</i></button>').join('') + '</div>' +
    '<div data-daftar>' + daftarTopik() + '</div><div class="ruang-nav"></div></div></div>' + navApung('beranda');
}
function daftarTopik() {
  const q = T.cari.trim().toLowerCase();
  let list = TOPIK.filter(t => T.filter === 'semua' || (T.filter === 'selesai' ? selesai(t) : !selesai(t)));
  if (q) list = list.filter(t => (t.judul.en + ' ' + t.judul.id + ' ' + t.ringkas.id + ' ' + t.ringkas.en + ' ' + t.contoh.map(c => c[0]).join(' ')).toLowerCase().includes(q));
  if (!list.length) return '<div class="body" style="text-align:center;padding:24px 0">' + (S.bahasa === 'en' ? 'No topics found.' : 'Topik tidak ditemukan.') + '</div>';
  const w = { lime: 'lime', pink: 'pink', mint: 'mint' };
  return list.map((t, i) => '<button class="kartu-topik naik" style="--i:' + i + '" onclick="pergi(\'topik\',{topik:\'' + t.id + '\',tab:\'materi\'})"><div class="baris-a"><span class="kotak-ik ' + (selesai(t) ? 'gelap' : w[KATEGORI[t.kat].warna]) + '">' + ikon(selesai(t) ? 'centang' : t.ikon, 20) + '</span><span style="flex:1;min-width:0"><h3 class="judul-w">' + esc(t.judul.en) + '</h3><p>' + esc(TX(t.ringkas)) + '</p></span></div>' +
    '<div class="prog-baris" style="margin-top:12px"><span class="prog"><i style="width:' + Math.max(persen(t), 3) + '%"></i></span><b>' + persen(t) + '%</b></div></button>').join('');
}
function cariTopik(v) { T.cari = v; const el = document.querySelector('#telefon [data-daftar]'); if (el) el.innerHTML = daftarTopik(); }
function geserBanner(i) {
  T.banner = i; klik(600);
  const s = document.querySelector('#telefon .banner-slaid'); if (s) s.style.transform = 'translateX(-' + i * 100 + '%)';
  document.querySelectorAll('#telefon .titik-banner i').forEach((d, n) => d.classList.toggle('aktif', n === i));
}
function navApung(aktif) {
  const b = (id, ik, label) => '<button class="' + (aktif === id ? 'aktif' : '') + '" onclick="pergi(\'' + id + '\')" aria-label="' + label + '">' + ikon(ik, 21) + '</button>';
  return '<nav class="nav-apung">' + b('beranda', 'rumah', L('beranda')) + b('progres', 'grafik', L('progres')) + b('kamus', 'buku', L('kamus')) + b('profil', 'orang', L('profil')) + '</nav>';
}

/* ---------- DETAIL TOPIK (Midwok profil + Wise baris) ---------- */
function skrinTopik() {
  const t = topikIkut(T.topik);
  const tabs = [['materi', L('materi')], ['contoh', L('contoh')], ['latihan', L('latihan')]];
  return '<div class="skrol"><div class="det-kepala">' +
    '<div class="bar-atas" style="padding:4px 0 6px"><button class="bulat-btn" style="background:var(--bg)" onclick="pergi(\'beranda\')" aria-label="Kembali">' + ikon('kiri', 20) + '</button>' + pilBahasa() + '</div>' +
    '<span class="kotak-ik ' + (KATEGORI[t.kat].warna) + '" style="width:64px;height:64px;border-radius:20px;margin:0 auto 10px">' + ikon(t.ikon, 30, 'lukis') + '</span>' +
    '<h1 class="judul-w">' + esc(t.judul.en) + '</h1><div class="meta" style="margin-top:4px">' + esc(t.judul.id) + ' · ' + TX(KATEGORI[t.kat]) + ' · ' + t.level + '</div>' +
    '<div class="ik-bulat-baris">' +
    '<button onclick="ucap(this.dataset.t)" data-t="' + esc(polos(t.contoh[0][0])) + '" aria-label="Dengar">' + ikon('suara', 18) + '</button>' +
    '<button onclick="T.tab=\'materi\';lukis();setTimeout(()=>{const s=document.querySelector(\'#telefon [data-salah]\');if(s)s.scrollIntoView({behavior:\'smooth\'})},80)" aria-label="Kesalahan umum">' + ikon('lampu', 18) + '</button>' +
    '<button onclick="pergi(\'kamus\')" aria-label="Kamus">' + ikon('buku', 18) + '</button>' +
    '<button onclick="setBahasa(S.bahasa===\'id\'?\'en\':\'id\')" aria-label="Bahasa">' + ikon('dunia', 18) + '</button>' +
    '<button onclick="mulaiKuis(\'' + t.id + '\')" aria-label="Latihan">' + ikon('bendera', 18) + '</button></div>' +
    '<div class="statistik4"><div><b>' + t.contoh.length + '</b><span>' + L('contoh') + '</span></div><div><b>' + t.rumus.length + '</b><span>' + L('rumus') + '</span></div><div><b>' + t.kuiz.length + '</b><span>' + L('soal') + '</span></div><div><b>' + (S.skor[t.id] != null ? S.skor[t.id] + '/5' : '–') + '</b><span>' + (S.bahasa === 'en' ? 'Best' : 'Terbaik') + '</span></div></div></div>' +
    '<div class="pad"><div class="tab3">' + tabs.map(x => '<button class="' + (T.tab === x[0] ? 'aktif' : '') + '" onclick="gantiTab(\'' + x[0] + '\')">' + x[1] + '</button>').join('') + '</div>' +
    '<div data-isi-tab>' + isiTab(t) + '</div><div style="height:96px"></div></div></div>' +
    '<div class="cta-apung"><button class="btn" onclick="mulaiKuis(\'' + t.id + '\')">' + L('mulaiLatihan') + '</button></div>';
}
function gantiTab(tab) {
  T.tab = tab; klik(640); tandaiLihat(); simpan();
  document.querySelectorAll('#telefon .tab3 button').forEach((b, i) => b.classList.toggle('aktif', ['materi', 'contoh', 'latihan'][i] === tab));
  const el = document.querySelector('#telefon [data-isi-tab]'); if (el) { el.innerHTML = isiTab(topikIkut(T.topik)); el.querySelectorAll('.sr').forEach((x, i) => setTimeout(() => x.classList.add('nampak'), 40 + i * 70)); }
}
function blokTeks(judul, isi, kunci, lain) {
  const buka = T.terjemah[kunci];
  return '<div class="blok-teks sr"><h3 class="h3">' + judul + (lain ? '<button class="tag lime" style="font-family:var(--f)" onclick="T.terjemah[\'' + kunci + '\']=!T.terjemah[\'' + kunci + '\'];simpanSkrol();lukis();pulihSkrol()">' + (buka ? (S.bahasa === 'en' ? 'Hide' : 'Tutup') : (S.bahasa === 'en' ? 'Indonesian' : 'English')) + '</button>' : '') + '</h3>' + isi + (lain && buka ? '<div class="terjemah">' + lain + '</div>' : '') + '</div>';
}
function isiTab(t) {
  const lainBhs = S.bahasa === 'en' ? 'id' : 'en';
  if (T.tab === 'materi') {
    return blokTeks(L('penjelasan'), '<p class="body">' + esc(TX(t.penjelasan)) + '</p>', t.id + 'p', esc(t.penjelasan[lainBhs])) +
      '<div class="blok-teks sr"><h3 class="h3">' + L('rumus') + '<span class="meta">' + t.rumus.length + '</span></h3>' +
      t.rumus.map((r, i) => '<div class="rumus-baris"><div class="lbl"><span>' + esc(r[0]) + '</span><span>' + esc(r[1]) + '</span></div><div class="f">' + esc(r[2]).replace(/\*([^*]+)\*/g, '<em>$1</em>') + '</div><div class="bar-w"><i style="width:' + (100 - i * (60 / t.rumus.length)) + '%;animation-delay:' + (i * .12 + .2) + 's"></i></div></div>').join('') + '</div>' +
      '<div class="blok-teks sr"><h3 class="h3">' + L('kegunaan') + '</h3>' + t.guna.map((g, i) => '<div class="guna-item"><span class="no-b">' + (i + 1) + '</span><p>' + fmt(TX(g)) + '</p></div>').join('') + '</div>' +
      '<div class="blok-teks sr"><h3 class="h3">' + L('kataKunci') + '</h3><div class="sinyal">' + t.sinyal.map(s => '<span>' + esc(s) + '</span>').join('') + '</div></div>' +
      '<div class="blok-teks sr" data-salah><h3 class="h3">' + L('kesalahan') + '</h3>' + t.salah.map(s => '<div class="salah-kartu"><div class="x">' + ikon('tutup', 16) + esc(s[0]) + '</div><div class="v">' + ikon('centang', 16) + esc(s[1]) + '</div><div class="y">' + esc(TX(s[2])) + '</div></div>').join('') + '</div>';
  }
  if (T.tab === 'contoh') {
    return '<div class="blok-teks sr"><h3 class="h3">' + L('contoh') + '<span class="meta">' + (S.bahasa === 'en' ? 'Tap to reveal' : 'Ketuk untuk buka arti') + '</span></h3>' +
      t.contoh.map((c, i) => '<div class="trans naik" style="--i:' + i + '"><button class="bulat-i ' + (i % 2 ? '' : 'hijau') + '" onclick="ucap(this.dataset.t)" data-t="' + esc(polos(c[0])) + '" aria-label="Dengar">' + ikon('suara', 18) + '</button><span class="tengah"><b class="contoh-en">' + fmt(c[0]) + '</b><span class="contoh-id" onclick="this.classList.toggle(\'buka\');klik(700)">' + esc(c[1]) + '</span></span><span class="kanan-t">' + esc(c[2]) + '</span></div>').join('') + '</div>' +
      '<div class="blok-teks sr"><h3 class="h3">' + L('kataKunci') + '</h3><div class="sinyal">' + t.sinyal.map(s => '<span>' + esc(s) + '</span>').join('') + '</div></div>';
  }
  const riw = S.riwayat.filter(r => r.id === t.id).slice(0, 4);
  return '<div class="blok-teks sr"><h3 class="h3">' + L('latihan') + '</h3><p class="body">' + (S.bahasa === 'en' ? '5 multiple-choice questions. Every answer comes with an explanation, so you learn from mistakes.' : '5 soal pilihan ganda. Setiap jawaban disertai penjelasan, jadi kamu belajar dari kesalahan.') + '</p>' +
    '<div class="sinyal"><span>' + ikon('jam', 14).replace('class="ik ', 'style="display:inline;vertical-align:-2px" class="ik ') + ' ± 3 ' + (S.bahasa === 'en' ? 'min' : 'menit') + '</span><span>+10 XP / ' + (S.bahasa === 'en' ? 'correct' : 'benar') + '</span></div></div>' +
    '<div class="blok-teks sr"><h3 class="h3">' + L('riwayat') + '</h3>' + (riw.length ? riw.map(r => '<div class="trans"><span class="bulat-i ' + (r.skor >= 4 ? 'hijau' : '') + '">' + ikon(r.skor >= 4 ? 'trofi' : 'muat', 18) + '</span><span class="tengah"><b>' + r.skor + '/5 ' + (S.bahasa === 'en' ? 'correct' : 'benar') + '</b><span>' + tanggalPendek(r.ts) + '</span></span><span class="kanan-t" style="color:#3C9B3A">+' + r.skor * 10 + ' XP</span></div>').join('') : '<p class="body">' + (S.bahasa === 'en' ? 'No attempts yet. Your first score will appear here.' : 'Belum ada percobaan. Skor pertamamu akan muncul di sini.') + '</p>') + '</div>';
}

/* ---------- LATIHAN ---------- */
function acak(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function mulaiKuis(id) {
  let soal;
  if (id === 'acak') { const semua = []; TOPIK.forEach(t => t.kuiz.forEach(q => semua.push(Object.assign({ t: t.id }, q)))); soal = acak(semua).slice(0, 5); }
  else soal = topikIkut(id).kuiz.map(q => Object.assign({ t: id }, q));
  T.kuis = { id, soal, i: 0, pilih: null, cek: false, benar: 0 };
  pergi('kuis');
}
function kalimatSoal(q, isian, salah) {
  if (!q.s.includes('___')) return esc(q.s);
  const [a, b] = q.s.split('___');
  return esc(a) + '<span class="kosong ' + (isian ? 'terisi' : '') + (salah ? ' salah' : '') + '">' + (isian ? esc(isian) : '____') + '</span>' + esc(b || '');
}
function skrinKuis() {
  const K = T.kuis, q = K.soal[K.i], t = topikIkut(q.t);
  const isian = K.cek ? q.p[K.pilih] : (K.pilih !== null ? q.p[K.pilih] : '');
  return '<div class="kuis-atas"><button class="bulat-btn" onclick="pergi(\'topik\',{topik:\'' + (K.id === 'acak' ? T.topik : K.id) + '\'})" aria-label="Tutup">' + ikon('tutup', 18) + '</button>' +
    '<span class="prog"><i style="width:100%;transform:scaleX(' + ((K.i + (K.cek ? 1 : 0)) / K.soal.length) + ')"></i></span><b style="font-size:13px">' + (K.i + 1) + '/' + K.soal.length + '</b></div>' +
    '<div class="skrol"><div class="pad">' +
    '<div class="kecil-caps">' + esc(t.judul.en) + '</div><div class="h2" style="margin-top:4px">' + (S.bahasa === 'en' ? 'Choose the correct answer' : 'Pilih jawaban yang tepat') + '</div>' +
    '<div class="soal-kartu anim"><div class="kalimat">' + kalimatSoal(q, isian, K.cek && K.pilih !== q.j) + '</div></div>' +
    q.p.map((p, n) => {
      let k = '';
      if (K.cek) { if (n === q.j) k = 'benar'; else if (n === K.pilih) k = 'keliru'; }
      else if (n === K.pilih) k = 'dipilih';
      return '<button class="opsi naik ' + k + '" style="--i:' + n + '" ' + (K.cek ? '' : 'onclick="pilihOpsi(' + n + ')"') + '><span class="bulat-i">' + 'ABCD'[n] + '</span>' + esc(p) + '</button>';
    }).join('') +
    '<div style="height:120px"></div></div></div>' +
    (K.cek ? '<div class="umpan ' + (K.pilih === q.j ? 'ok' : 'no') + '"><div class="h2">' + ikon(K.pilih === q.j ? 'centang' : 'info', 22) + (K.pilih === q.j ? L('benar') : L('salah')) +
      '<button class="bulat-btn" style="margin-left:auto;width:36px;height:36px" onclick="ucap(this.dataset.t)" data-t="' + esc(q.s.replace('___', q.p[q.j])) + '" aria-label="Dengar">' + ikon('suara', 16) + '</button></div>' +
      '<p>' + (K.pilih !== q.j ? '<b>' + (S.bahasa === 'en' ? 'Answer: ' : 'Jawaban: ') + esc(q.p[q.j]) + '.</b> ' : '') + esc(TX(q.why)) + '</p>' +
      '<button class="btn ' + (K.pilih === q.j ? '' : 'gelap') + '" onclick="lanjutKuis()">' + L('lanjut') + '</button></div>'
      : '<div class="cta-apung" style="animation:none;background:transparent;box-shadow:none;padding:0"><button class="btn ' + (K.pilih === null ? 'mati' : '') + '" onclick="cekJawaban()">' + L('cek') + '</button></div>');
}
function pilihOpsi(n) {
  T.kuis.pilih = n; klik(660);
  document.querySelectorAll('#telefon .opsi').forEach((o, i) => o.classList.toggle('dipilih', i === n));
  const q = T.kuis.soal[T.kuis.i];
  const k = document.querySelector('#telefon .soal-kartu .kalimat'); if (k) k.innerHTML = kalimatSoal(q, q.p[n]);
  const b = document.querySelector('#telefon .cta-apung .btn'); if (b) b.classList.remove('mati');
}
function cekJawaban() {
  const K = T.kuis; if (K.pilih === null || K.cek) return;
  K.cek = true; const ok = K.pilih === K.soal[K.i].j;
  if (ok) { K.benar++; klik(880); setTimeout(() => klik(1180), 100); } else klik(220);
  lukis();
}
function lanjutKuis() {
  const K = T.kuis;
  if (K.i < K.soal.length - 1) { K.i++; K.pilih = null; K.cek = false; klik(600); lukis(); return; }
  const xp = K.benar * 10; tambahXP(xp);
  if (K.id !== 'acak') { S.skor[K.id] = Math.max(S.skor[K.id] || 0, K.benar); S.riwayat.unshift({ id: K.id, skor: K.benar, ts: Date.now() }); S.riwayat = S.riwayat.slice(0, 30); }
  T.hasil = { benar: K.benar, jum: K.soal.length, xp, id: K.id };
  simpan(); pergi('hasil');
  if (K.benar >= 3) setTimeout(konfeti, 400);
}

/* ---------- HASIL (Wise) ---------- */
function pita() {
  return '<svg class="pita" width="190" height="220" viewBox="0 0 190 220"><defs>' +
    '<linearGradient id="gp1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3B5E5"/><stop offset=".5" stop-color="#B9A4F0"/><stop offset="1" stop-color="#8FC6EE"/></linearGradient>' +
    '<linearGradient id="gp2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FE870"/><stop offset="1" stop-color="#D2F35C"/></linearGradient></defs>' +
    '<path d="M120 10c40 10 30 40 0 50S60 90 90 110s60 30 30 60-50 30-40 45" fill="none" stroke="url(#gp1)" stroke-width="30" stroke-linecap="round"/>' +
    '<path d="M120 10c40 10 30 40 0 50S60 90 90 110s60 30 30 60-50 30-40 45" fill="none" stroke="url(#gp2)" stroke-width="8" stroke-linecap="round" stroke-dasharray="14 22" opacity=".85"/></svg>';
}
function skrinHasil() {
  const H = T.hasil || { benar: 4, jum: 5, xp: 40, id: 'present' };
  const serpih = [['#F3B5E5', 20, 30, '0s'], ['#9FE870', 180, 50, '.4s'], ['#8FC6EE', 10, 160, '.8s'], ['#D2F35C', 196, 170, '.2s'], ['#B9A4F0', 60, 210, '.6s'], ['#163300', 150, 8, '1s']];
  return '<div class="hasil"><button class="tutup-x" onclick="pergi(\'topik\',{topik:\'' + (H.id === 'acak' ? T.topik : H.id) + '\'})" aria-label="Tutup">' + ikon('tutup', 16) + '</button>' +
    '<div class="pita-wrap">' + pita() + serpih.map(s => '<i class="serpih" style="background:' + s[0] + ';left:' + s[1] + 'px;top:' + s[2] + 'px;--d:' + s[3] + '"></i>').join('') + '</div>' +
    '<h1 class="raksasa">' + dedah(S.bahasa === 'en' ? 'It all\nadds up' : 'Kamu makin\njago') + '</h1>' +
    '<div class="skor">' + H.benar + '/' + H.jum + (S.bahasa === 'en' ? ' CORRECT' : ' BENAR') + '</div>' +
    '<p class="body" style="margin-top:8px">' + (S.bahasa === 'en' ? 'That\'s ' + H.xp + ' XP added to your points balance. Just like that.' : 'Itu berarti ' + H.xp + ' XP masuk ke saldo poinmu. Semudah itu.') + '</p>' +
    '<div style="margin-top:auto;width:100%;display:flex;flex-direction:column;gap:10px"><button class="btn" onclick="pergi(\'beranda\')">' + L('oke') + '</button><button class="btn abu" onclick="mulaiKuis(\'' + H.id + '\')">' + ikon('muat', 17) + (S.bahasa === 'en' ? 'Try again' : 'Ulangi') + '</button></div></div>';
}

/* ---------- PROGRES (Wise kartu) ---------- */
function skrinProgres() {
  const hari = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); hari.push(d); }
  const nilai = hari.map(d => S.xpHari[tgl(d)] || 0); const maks = Math.max(30, ...nilai);
  const nm = S.bahasa === 'en' ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : ['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'];
  const mingguIni = nilai.reduce((a, b) => a + b, 0);
  const benarTotal = S.riwayat.reduce((a, r) => a + r.skor, 0);
  return '<div class="bar-atas"><span style="width:42px"></span><span class="judul-bar">' + L('progres') + '</span>' + pilBahasa() + '</div>' +
    '<div class="skrol"><div class="pad">' +
    '<div class="saldo anim"><b data-hitung="' + S.xp + '">0 XP</b><span>' + L('poin') + ' ' + ikon('info', 14) + '</span></div>' +
    '<div class="kartu-wise anim" data-miring><div class="kilap"></div><span class="merek-kartu">Grammo</span><div class="cip"></div><span class="nama-k">' + esc(S.nama || 'Siswa') + '</span><span class="lvl-k">Level ' + level() + '</span></div>' +
    '<div style="text-align:center;margin-top:12px;font-size:13px;font-weight:700">' + (S.bahasa === 'en' ? 'Student card' : 'Kartu pelajar') + ' ·· ' + String(1000 + S.xp).slice(-4) + '</div>' +
    '<div class="aksi3"><button onclick="mulaiKuis(\'acak\')"><span class="bulat-i">' + ikon('tambah', 22) + '</span>' + (S.bahasa === 'en' ? 'Random quiz' : 'Kuis acak') + '</button>' +
    '<button onclick="pergi(\'kamus\')"><span class="bulat-i">' + ikon('kartu', 20) + '</span>' + L('kamus') + '</button>' +
    '<button onclick="pergi(\'notif\')"><span class="bulat-i">' + ikon('api', 20) + '</span>' + (S.bahasa === 'en' ? 'Reminders' : 'Pengingat') + '</button></div>' +
    '<div class="kartu-belanja"><div class="atas-b"><div><div class="h3">' + (S.bahasa === 'en' ? 'This week' : 'Minggu ini') + '</div><div style="font-size:22px;font-weight:800">' + mingguIni + ' XP</div></div><span class="bulat-btn gelap" style="background:var(--hutan-2)">' + ikon('atas', 20) + '</span></div>' +
    '<div class="batang-batang">' + nilai.map((v, i) => '<div><i class="' + (i === 6 ? 'kini' : '') + '" style="height:' + Math.max(8, v / maks * 100) + '%;--i:' + i + '"></i><span>' + nm[hari[i].getDay()] + '</span></div>').join('') + '</div></div>' +
    '<div class="seksyen" style="margin-top:18px"><h2 class="judul-w">' + (S.bahasa === 'en' ? 'Summary' : 'Ringkasan') + '</h2></div>' +
    '<div class="baris-pil naik" style="--i:0"><span class="bulat-i">' + ikon('bawah', 18) + '</span><b>' + (S.bahasa === 'en' ? 'Correct answers' : 'Jawaban benar') + '</b><span>+ ' + benarTotal + '</span></div>' +
    '<div class="baris-pil naik" style="--i:1"><span class="bulat-i">' + ikon('atas', 18) + '</span><b>' + (S.bahasa === 'en' ? 'Topics completed' : 'Topik selesai') + '</b><span>' + TOPIK.filter(selesai).length + ' / ' + TOPIK.length + '</span></div>' +
    '<div class="baris-pil naik" style="--i:2"><span class="bulat-i">' + ikon('buku', 18) + '</span><b>' + (S.bahasa === 'en' ? 'Lessons opened' : 'Materi dibuka') + '</b><span>' + Object.keys(S.lihat).length + '</span></div>' +
    '<div class="ruang-nav"></div></div></div>' + navApung('progres');
}

/* ---------- KAMUS ---------- */
function skrinKamus() {
  return '<div class="bar-atas"><span style="width:42px"></span><span class="judul-bar">' + L('kamus') + '</span>' + pilBahasa() + '</div>' +
    '<div class="skrol"><div class="pad">' +
    '<h1 class="raksasa" style="font-size:44px">' + dedah('Irregular\nverbs') + '</h1>' +
    '<p class="body" style="margin:8px 0 14px">' + (S.bahasa === 'en' ? 'Verbs that do not use -ed. Tap a row to hear it.' : 'Kata kerja yang tidak memakai -ed. Ketuk baris untuk mendengar.') + '</p>' +
    '<label class="cari">' + ikon('cari', 18) + '<input placeholder="go, makan, written…" value="' + esc(T.cariKamus) + '" oninput="cariKamus(this.value)"></label>' +
    '<div class="kamus-kepala"><span>V1</span><span>V2</span><span>V3</span></div><div data-kamus>' + barisKamus() + '</div><div class="ruang-nav"></div></div></div>' + navApung('kamus');
}
function barisKamus() {
  const q = T.cariKamus.trim().toLowerCase();
  const l = IRREGULAR.filter(v => !q || v.join(' ').toLowerCase().includes(q));
  if (!l.length) return '<p class="body" style="text-align:center">' + (S.bahasa === 'en' ? 'Not found.' : 'Tidak ditemukan.') + '</p>';
  return l.map((v, i) => '<button class="kamus-baris naik" style="--i:' + Math.min(i, 12) + ';width:100%;text-align:left" onclick="ucap(\'' + v[0] + ', ' + v[1].replace('/', ' or ') + ', ' + v[2].replace('/', ' or ') + '\')"><span>' + v[0] + '</span><span style="color:#3C7A1E">' + v[1] + '</span><span>' + v[2] + '</span><small>' + v[3] + '</small></button>').join('');
}
function cariKamus(v) { T.cariKamus = v; const el = document.querySelector('#telefon [data-kamus]'); if (el) el.innerHTML = barisKamus(); }

/* ---------- PROFIL (Fineed) ---------- */
function lencanaSemua() {
  return [
    ['bintang', { id: 'Langkah pertama', en: 'First step' }, Object.keys(S.lihat).length > 0],
    ['trofi', { id: 'Nilai sempurna', en: 'Perfect score' }, Object.values(S.skor).some(v => v === 5)],
    ['jam', { id: 'Ahli tenses', en: 'Tenses expert' }, TOPIK.filter(t => t.kat === 'tenses').every(selesai)],
    ['api', { id: '100 XP', en: '100 XP' }, S.xp >= 100],
    ['buku', { id: '5 topik', en: '5 topics' }, TOPIK.filter(selesai).length >= 5],
    ['bendera', { id: 'Tamat', en: 'Finished' }, TOPIK.every(selesai)]
  ];
}
function bannerProfil(kanan) {
  return '<div class="profil-banner"><button class="bulat-btn" onclick="pergi(\'beranda\')" aria-label="Kembali">' + ikon('kiri', 18) + '</button><span class="judul-b">' + L('profil') + '</span>' + kanan + '</div>';
}
function skrinProfil() {
  const lc = lencanaSemua();
  return '<div class="skrol" style="padding-top:4px">' + bannerProfil('<button class="bulat-btn" onclick="pergi(\'edit\')" aria-label="Edit">' + ikon('pensil', 16) + '</button>') +
    '<div class="avatar-besar">' + inisial(S.nama) + '</div><div class="pad" style="text-align:center;padding-top:10px">' +
    '<div class="h2">' + esc(S.nama || 'Siswa') + '</div><div class="meta">' + esc(S.kelas) + (S.sekolah ? ' · ' + esc(S.sekolah) : '') + ' · Level ' + level() + '</div>' +
    '<div style="display:flex;justify-content:center;margin-top:12px">' + pilBahasa() + '</div></div>' +
    '<div class="pad"><div class="h3" style="margin-bottom:6px">' + L('tentang') + '</div><p class="body">' + (S.bahasa === 'en'
      ? 'I am learning English grammar with Grammo. I have finished ' + TOPIK.filter(selesai).length + ' of ' + TOPIK.length + ' topics and collected ' + S.xp + ' XP. My daily goal is ' + S.target + ' minutes.'
      : 'Aku sedang belajar grammar bahasa Inggris di Grammo. Sudah menyelesaikan ' + TOPIK.filter(selesai).length + ' dari ' + TOPIK.length + ' topik dan mengumpulkan ' + S.xp + ' XP. Targetku ' + S.target + ' menit sehari.') + '</p>' +
    '<div class="h3" style="margin:20px 0 10px">' + L('lencana') + '</div><div class="lencana-baris">' + lc.map((l, i) => '<span class="lencana naik ' + (l[2] ? '' : 'mati') + '" style="--i:' + i + '" title="' + esc(TX(l[1])) + '">' + ikon(l[0], 22) + '</span>').join('') + '</div>' +
    '<div class="meta" style="margin-top:6px">' + lc.filter(l => l[2]).length + '/' + lc.length + ' · ' + lc.map(l => TX(l[1])).join(', ') + '</div>' +
    '<div class="h3" style="margin:20px 0 4px">' + L('riwayat') + '</div>' +
    (S.riwayat.length ? S.riwayat.slice(0, 5).map(r => { const t = topikIkut(r.id); return '<button class="trans" onclick="pergi(\'topik\',{topik:\'' + t.id + '\',tab:\'latihan\'})"><span class="kotak-ik ' + KATEGORI[t.kat].warna + '">' + ikon(t.ikon, 18) + '</span><span class="tengah"><b>' + esc(t.judul.en) + '</b><span>' + r.skor + '/5 · ' + tanggalPendek(r.ts) + '</span></span>' + ikon('chevron', 16) + '</button>'; }).join('')
      : '<p class="body">' + (S.bahasa === 'en' ? 'Finish a practice to see your history.' : 'Selesaikan latihan untuk melihat riwayat.') + '</p>') +
    '<div style="display:flex;flex-direction:column;gap:10px;margin-top:20px"><button class="btn abu" onclick="pergi(\'edit\')">' + ikon('pensil', 17) + L('editAkun') + '</button>' +
    '<button class="btn abu" onclick="keluar()">' + ikon('keluar', 17) + L('keluar') + '</button></div>' +
    '<div class="ruang-nav"></div></div></div>' + navApung('profil');
}
function keluar() { S.nama = ''; simpan(); pergi('sambut'); }
function skrinEdit() {
  return '<div class="skrol" style="padding-top:4px">' + bannerProfil('<button class="bulat-btn" onclick="tunjuk(S.bahasa===\'en\'?\'Photo upload coming soon\':\'Unggah foto segera hadir\',\'kamera\')" aria-label="Foto">' + ikon('kamera', 16) + '</button>') +
    '<div class="avatar-besar">' + inisial(S.nama) + '</div><div class="pad" style="padding-top:10px;text-align:center"><div class="h2">' + esc(S.nama || 'Siswa') + '</div><div class="meta">' + esc(S.kelas) + '</div></div>' +
    '<div class="pad"><div class="h3" style="margin-bottom:10px">' + L('editAkun') + '</div>' +
    '<label class="edit-baris"><label>' + (S.bahasa === 'en' ? 'Name' : 'Nama') + '</label><input data-e="nama" value="' + esc(S.nama) + '"></label>' +
    '<label class="edit-baris"><label>' + (S.bahasa === 'en' ? 'Grade' : 'Kelas') + '</label><input data-e="kelas" value="' + esc(S.kelas) + '"></label>' +
    '<label class="edit-baris"><label>' + (S.bahasa === 'en' ? 'School' : 'Sekolah') + '</label><input data-e="sekolah" value="' + esc(S.sekolah) + '" placeholder="SMP …"></label>' +
    '<label class="edit-baris"><label>' + (S.bahasa === 'en' ? 'Daily goal (min)' : 'Target harian (menit)') + '</label><input data-e="target" type="number" min="1" max="120" value="' + S.target + '"></label>' +
    '<label class="edit-baris"><label>' + L('bahasa') + '</label><select data-e="bahasa"><option value="id"' + (S.bahasa === 'id' ? ' selected' : '') + '>Indonesia</option><option value="en"' + (S.bahasa === 'en' ? ' selected' : '') + '>English</option></select></label>' +
    '<label class="edit-baris"><label>' + (S.bahasa === 'en' ? 'Click sound' : 'Bunyi klik') + '</label><select data-e="bunyi"><option value="1"' + (S.bunyi ? ' selected' : '') + '>' + (S.bahasa === 'en' ? 'On' : 'Nyala') + '</option><option value="0"' + (!S.bunyi ? ' selected' : '') + '>' + (S.bahasa === 'en' ? 'Off' : 'Mati') + '</option></select></label>' +
    '<button class="btn" style="margin-top:10px" onclick="simpanEdit()">' + L('simpan') + '</button>' +
    '<button class="btn-teks" style="display:block;margin:18px auto 0;color:var(--merah)" onclick="resetSemua()">' + (S.bahasa === 'en' ? 'Reset all progress' : 'Hapus semua progres') + '</button><div style="height:30px"></div></div></div>';
}
function simpanEdit() {
  const q = k => { const e = document.querySelector('#telefon [data-e="' + k + '"]'); return e ? e.value.trim() : ''; };
  S.nama = q('nama') || S.nama; S.kelas = q('kelas') || S.kelas; S.sekolah = q('sekolah');
  const t = +q('target'); if (t > 0) S.target = Math.min(120, t);
  S.bahasa = q('bahasa') === 'en' ? 'en' : 'id'; S.bunyi = q('bunyi') === '1';
  simpan(); pergi('profil'); setTimeout(() => tunjuk(S.bahasa === 'en' ? 'Profile saved' : 'Profil disimpan'), 150);
}
function resetSemua() {
  if (!confirm(S.bahasa === 'en' ? 'Delete all scores and XP?' : 'Hapus semua skor dan XP?')) return;
  const tetap = { nama: S.nama, kelas: S.kelas, sekolah: S.sekolah, bahasa: S.bahasa, target: S.target };
  S = Object.assign(keadaanAsal(), tetap); simpan(); pergi('beranda');
}

/* ---------- NOTIFIKASI (Fineed) ---------- */
function skrinNotif() {
  const en = S.bahasa === 'en';
  const belum = TOPIK.find(t => !selesai(t)) || TOPIK[0];
  const n = [
    ['api', en ? 'Daily goal' : 'Target harian', en ? 'Spend ' + S.target + ' minutes on grammar today to keep your streak.' : 'Luangkan ' + S.target + ' menit hari ini untuk grammar agar semangatmu terjaga.', '09:01'],
    ['lampu', en ? 'Grammar tip' : 'Tips grammar', en ? 'After did / didn\'t, always use the base verb: "Did you go?"' : 'Setelah did / didn\'t, selalu pakai V1: "Did you go?"', '09:01'],
    ['buku', en ? 'Next topic' : 'Topik berikutnya', (en ? 'Try ' : 'Coba pelajari ') + belum.judul.en + (en ? ' next.' : ' selanjutnya.'), '08:30'],
    ['trofi', en ? 'Badges' : 'Lencana', en ? 'You have ' + lencanaSemua().filter(l => l[2]).length + ' badges. Score 5/5 to unlock "Perfect score".' : 'Kamu punya ' + lencanaSemua().filter(l => l[2]).length + ' lencana. Raih 5/5 untuk membuka "Nilai sempurna".', '07:45']
  ];
  return barAtas("pergi('beranda')", L('notifikasi')) + '<div class="skrol"><div class="pad"><div class="kecil-caps">' + L('hariIni') + '</div>' +
    n.map((x, i) => '<div class="notif naik" style="--i:' + i + '"><span class="bulat-i" style="background:' + ['#D2F35C', '#FAD4F2', '#E3F5D9', '#D2F35C'][i] + '">' + ikon(x[0], 19) + '</span><div><b>' + esc(x[1]) + '</b><p>' + esc(x[2]) + '</p><div class="meta">' + x[3] + '</div></div></div>').join('') +
    '<button class="btn" style="margin-top:20px" onclick="pergi(\'topik\',{topik:\'' + belum.id + '\',tab:\'materi\'})">' + (en ? 'Open ' : 'Buka ') + esc(belum.judul.en) + '</button></div></div>';
}

/* ============================================================
   LUKIS
   ============================================================ */
const SKRIN = { splash: skrinSplash, onb: skrinOnb, sambut: skrinSambut, masuk: skrinMasuk, daftar: skrinDaftar, beranda: skrinBeranda, topik: skrinTopik, kuis: skrinKuis, hasil: skrinHasil, progres: skrinProgres, kamus: skrinKamus, profil: skrinProfil, edit: skrinEdit, notif: skrinNotif };
function htmlSkrin() {
  if (S.skrin === 'kuis' && !T.kuis) T.kuis = { id: T.topik, soal: topikIkut(T.topik).kuiz.map(q => Object.assign({ t: T.topik }, q)), i: 0, pilih: null, cek: false, benar: 0 };
  const fn = SKRIN[S.skrin] || skrinBeranda;
  const kelas = S.skrin === 'splash' ? 'neon' : ['onb', 'sambut', 'hasil'].includes(S.skrin) ? 'putih' : '';
  return '<div class="skrin ' + kelas + '"><div class="takuk"></div>' + barStatus() + '<div class="paparan anim">' + fn() + '</div><div class="garis-rumah"></div></div>';
}
let pemasa = [];
function lukis() {
  pemasa.forEach(clearTimeout); pemasa = [];
  const tel = document.getElementById('telefon');
  tel.innerHTML = htmlSkrin();
  hidupkan(tel, false);
  kemasSisi();
  if (S.skrin === 'splash') pemasa.push(setTimeout(() => { if (S.skrin === 'splash') { S.skrin = 'onb'; S.onb = 0; lukis(); } }, 2400));
  if (S.skrin === 'beranda') pemasa.push(setInterval(() => { if (S.skrin === 'beranda' && !document.hidden) geserBanner((T.banner + 1) % BANNER.length); }, 4500));
}
function hidupkan(root, papan) {
  root.querySelectorAll('.skrol').forEach(s => {
    const it = s.querySelectorAll('.sr');
    if (papan || !('IntersectionObserver' in window)) { it.forEach(x => x.classList.add('nampak')); return; }
    const io = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('nampak'); io.unobserve(x.target); } }), { root: s, threshold: .08 });
    it.forEach(x => io.observe(x));
  });
  if (!root.closest || !root.closest('.skrol')) root.querySelectorAll('[data-isi-tab] .sr').forEach(x => x.classList.add('nampak'));
  root.querySelectorAll('[data-hitung]').forEach(el => {
    const akhir = +el.dataset.hitung;
    if (papan) { el.textContent = akhir + ' XP'; return; }
    const t0 = performance.now();
    const f = now => { const p = Math.min(1, (now - t0) / 900); el.textContent = Math.round(akhir * (1 - Math.pow(1 - p, 3))) + ' XP'; if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
  if (papan) return;
  root.querySelectorAll('[data-miring]').forEach(k => {
    k.addEventListener('pointermove', ev => { const r = k.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5; k.style.transform = 'perspective(700px) rotateY(' + x * 16 + 'deg) rotateX(' + -y * 16 + 'deg)'; });
    k.addEventListener('pointerleave', () => { k.style.transform = ''; });
  });
}
document.addEventListener('pointerdown', ev => {
  const b = ev.target.closest('.btn'); if (!b) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
  const sp = document.createElement('span'); sp.className = 'riak';
  sp.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (ev.clientX - r.left - s / 2) + 'px;top:' + (ev.clientY - r.top - s / 2) + 'px';
  b.appendChild(sp); setTimeout(() => sp.remove(), 650);
});

/* ============================================================
   PANEL SISI & PAPAN SEMUA SKRIN
   ============================================================ */
const SENARAI_PAPAN = [
  ['splash', 'Splash'], ['onb0', 'Onboarding 1'], ['onb1', 'Onboarding 2'], ['onb2', 'Onboarding 3'],
  ['sambut', 'Sambutan'], ['masuk', 'Masuk'], ['daftar', 'Daftar'], ['beranda', 'Beranda'],
  ['topik', 'Topik · Materi'], ['topik-contoh', 'Topik · Contoh'], ['topik-latihan', 'Topik · Latihan'], ['kuis', 'Latihan'],
  ['kuis-cek', 'Latihan · Cek'], ['hasil', 'Hasil'], ['progres', 'Progres'], ['kamus', 'Kamus'],
  ['profil', 'Profil'], ['edit', 'Edit Akun'], ['notif', 'Notifikasi']
];
function sediaDemo(k) {
  const now = Date.now(), xpHari = {};
  [20, 35, 0, 50, 25, 60, 70].forEach((v, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); xpHari[tgl(d)] = v; });
  S = Object.assign(keadaanAsal(), { bahasa: S.bahasa, nama: 'Rina Putri', kelas: 'Kelas 8', sekolah: 'SMP Negeri 1', xp: 260, xpHari,
    skor: { parts: 5, present: 4, past: 3 }, lihat: { parts: { materi: true, contoh: true }, present: { materi: true, contoh: true }, past: { materi: true }, continuous: { materi: true } },
    dibuka: { present: now - 3.6e6, past: now - 8.64e7, continuous: now - 1.7e8, parts: now - 2.6e8 },
    riwayat: [{ id: 'present', skor: 4, ts: now - 3.6e6 }, { id: 'parts', skor: 5, ts: now - 2.6e8 }, { id: 'past', skor: 3, ts: now - 8.64e7 }] });
  T = Object.assign(T, { topik: 'present', tab: 'materi', filter: 'semua', cari: '', banner: 0, terjemah: {}, galat: '', kuis: null, hasil: null, cariKamus: '' });
  FORM = {};
  if (k.startsWith('onb')) { S.skrin = 'onb'; S.onb = +k.slice(3); }
  else if (k.startsWith('topik')) { S.skrin = 'topik'; T.tab = k.split('-')[1] || 'materi'; }
  else if (k.startsWith('kuis')) {
    S.skrin = 'kuis';
    T.kuis = { id: 'past', soal: topikIkut('past').kuiz.map(q => Object.assign({ t: 'past' }, q)), i: 1, pilih: k === 'kuis-cek' ? 1 : 1, cek: k === 'kuis-cek', benar: 1 };
  }
  else if (k === 'hasil') { S.skrin = 'hasil'; T.hasil = { benar: 4, jum: 5, xp: 40, id: 'present' }; }
  else S.skrin = k;
  if (k === 'masuk') FORM = { nama: 'Rina Putri', sandi: 'rahasia' };
}
function lukisPapan() {
  const sS = JSON.stringify(S), sT = Object.assign({}, T), sF = FORM;
  PAPAN = true;
  const grid = document.getElementById('papan-grid');
  grid.innerHTML = SENARAI_PAPAN.map(([k, l], i) => '<div class="papan-item" data-k="' + k + '"><div class="lbl-p"><i>' + String(i + 1).padStart(2, '0') + '</i>' + l + '</div><div class="mini-tel" onclick="bukaDariPapan(\'' + k + '\')"><div class="skala"></div></div></div>').join('');
  grid.querySelectorAll('.papan-item').forEach(it => { sediaDemo(it.dataset.k); const sk = it.querySelector('.skala'); sk.innerHTML = htmlSkrin(); hidupkan(sk, true); sk.querySelectorAll('.sr').forEach(x => x.classList.add('nampak')); });
  S = JSON.parse(sS); T = sT; FORM = sF; PAPAN = false;
}
function bukaDariPapan(k) {
  tukarMod('app');
  if (!S.nama && !['splash', 'onb0', 'onb1', 'onb2', 'sambut', 'masuk', 'daftar'].includes(k)) S.nama = 'Siswa Grammo';
  if (k.startsWith('onb')) { S.onb = +k.slice(3); pergi('onb'); return; }
  if (k.startsWith('topik')) { pergi('topik', { tab: k.split('-')[1] || 'materi' }); return; }
  if (k.startsWith('kuis')) { mulaiKuis(T.topik); return; }
  if (k === 'hasil' && !T.hasil) T.hasil = { benar: 4, jum: 5, xp: 40, id: T.topik };
  pergi(k);
}
function tukarMod(m) {
  const p = m === 'papan';
  document.body.classList.toggle('papan', p);
  try { history.replaceState(null, '', p ? '#papan' : location.pathname + location.search); } catch (e) {}
  if (p) { lukisPapan(); window.scrollTo(0, 0); }
  kemasSisi();
}
function kemasSisi() {
  const s = document.getElementById('sisi'); if (!s) return;
  const lompat = [['splash', 'Splash'], ['onb', 'Onboarding'], ['sambut', 'Sambutan'], ['masuk', 'Masuk'], ['daftar', 'Daftar'], ['beranda', 'Beranda'], ['topik', 'Topik'], ['kuis', 'Latihan'], ['hasil', 'Hasil'], ['progres', 'Progres'], ['kamus', 'Kamus'], ['profil', 'Profil'], ['edit', 'Edit'], ['notif', 'Notifikasi']];
  s.innerHTML = '<div class="logo-sisi">Grammo</div><p>App grammar bahasa Inggris untuk pelajar, dua bahasa (Indonesia / English): 12 topik, ' + TOPIK.reduce((a, t) => a + t.kuiz.length, 0) + ' soal latihan, kamus 25 irregular verb, dan suara pengucapan.</p>' +
    '<div class="mod-tukar"><button class="aktif">App</button><button onclick="tukarMod(\'papan\')">Semua skrin</button></div>' +
    '<div class="tajuk-k">Bahasa app</div>' + pilBahasa() +
    '<div class="tajuk-k">Lompat ke skrin</div><div class="lompat">' + lompat.map(([k, l]) => '<button class="' + (S.skrin === k ? 'aktif' : '') + '" onclick="lompatSisi(\'' + k + '\')">' + l + '</button>').join('') + '</div>' +
    '<div class="nota-kecil">Buka di HP lalu pilih "Tambahkan ke Layar Utama" untuk memasang app. Progres tersimpan di perangkat.</div>';
}
function lompatSisi(k) {
  if (!S.nama && !['splash', 'onb', 'sambut', 'masuk', 'daftar'].includes(k)) S.nama = 'Siswa Grammo';
  if (k === 'onb') S.onb = 0;
  if (k === 'kuis') { mulaiKuis(T.topik); return; }
  if (k === 'hasil' && !T.hasil) T.hasil = { benar: 4, jum: 5, xp: 40, id: T.topik };
  pergi(k);
}

/* ============================================================
   MULAI
   ============================================================ */
muat();
(function () {
  const s = new URLSearchParams(location.search).get('s');
  if (s && SKRIN[s]) { if (!S.nama && !['splash', 'onb', 'sambut', 'masuk', 'daftar'].includes(s)) S.nama = 'Siswa Grammo'; S.skrin = s; }
  else S.skrin = S.nama ? 'beranda' : 'splash';
  lukis();
  if (location.hash === '#papan') tukarMod('papan');
  window.__g = { pergi: k => lompatSisi(k), S: () => S, T: () => T };
})();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && window.self === window.top) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
