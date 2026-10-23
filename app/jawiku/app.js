/* ============================================================
   JawiKu — app belajar Jawi (PWA, tanpa build)
   Mesin di-remake dari app jejak./Grammo: keadaan -> skrin -> lukis -> papan
   ============================================================ */

const KUNCI_SIMPAN = 'jawiku-v1';
function keadaanAsal() {
  return { skrin: 'splash', onb: 0, nama: '', emel: '', umur: '', bahasa: 'ms', tahap: 0, bunyi: true,
    suka: [], beg: [], dibuka: [], suku: false, riwayat: [], saat: {}, bintang: {} };
}
let S = keadaanAsal();
let T = { huruf: 1, kat: 'semua', jenis: 'semua', susun: 'abjad', bil: 5, mod: 'campur', kuiz: null, hasil: null, cari: '', papan: true, faq: -1, sembang: null, galat: '', surih: 0, masaSurih: 30 };
let PAPAN = false;
const WARNA = ['biru', 'kuning', 'hijau', 'merah', 'oren'];
const LATAR = { biru: '#1E9BF0', kuning: '#FFB938', hijau: '#3DB36B', merah: '#F2453D', oren: '#FF8A3D' };

function simpan() { if (PAPAN) return; try { localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(S)); } catch (e) {} }
function muat() { try { const d = JSON.parse(localStorage.getItem(KUNCI_SIMPAN) || 'null'); if (d) S = Object.assign(keadaanAsal(), d); } catch (e) {} }

/* ---------- pembantu ---------- */
const L = k => (UI[k] ? UI[k][S.bahasa === 'en' ? 1 : 0] : k);
const B = (ms, en) => (S.bahasa === 'en' ? en : ms);
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function jw(t, kelas) { return '<span class="jw ' + (kelas || '') + '">' + esc(t) + '</span>'; }
function hariIni() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function tambahMasa(s) { if (PAPAN) return; const h = hariIni(); S.saat[h] = (S.saat[h] || 0) + s; }
function inisial(n) { return (n || 'Murid').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
function bentuk(h) {
  if (h.j === 'ء') return [h.j, h.j, h.j, h.j];
  return [h.j, h.sambung ? h.j + 'ـ' : h.j, 'ـ' + h.j + (h.sambung ? 'ـ' : ''), 'ـ' + h.j];
}
function warnaI(i) { return WARNA[i % WARNA.length]; }
function dedah(teks, mula) {
  let i = mula || 0;
  return '<span class="dedah">' + teks.split('\n').map(b => esc(b).split(' ').map(w => '<span class="k"><span style="--i:' + (i++) + '">' + w + '</span></span>').join(' ')).join('<br>') + '</span>';
}
function ombak(teks) { return '<span class="ombak">' + [...teks].map((c, i) => '<span class="h" style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : esc(c)) + '</span>').join('') + '</span>'; }
function pilBahasa() { return '<div class="bahasa-pil"><button class="' + (S.bahasa === 'ms' ? 'aktif' : '') + '" onclick="setBahasa(\'ms\')">BM</button><button class="' + (S.bahasa === 'en' ? 'aktif' : '') + '" onclick="setBahasa(\'en\')">EN</button></div>'; }
function setBahasa(b) { if (S.bahasa === b) return; S.bahasa = b; simpan(); klik(700); const s = document.querySelector('#telefon .skrol'); const y = s ? s.scrollTop : 0; lukis(); const s2 = document.querySelector('#telefon .skrol'); if (s2) s2.scrollTop = y; }
function perkataanDengan(huruf) { return KAMUS.filter(k => k[1].includes(huruf.j)); }

let audio = null;
function klik(nada) {
  if (!S.bunyi || PAPAN) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain(); o.type = 'triangle';
    o.frequency.value = nada || 660; g.gain.setValueAtTime(.06, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .14);
    o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + .15);
  } catch (e) {}
}
function ucap(teks) {
  try {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(teks);
    const v = speechSynthesis.getVoices().find(x => /^ms/i.test(x.lang)) || speechSynthesis.getVoices().find(x => /^id/i.test(x.lang));
    if (v) u.voice = v; u.lang = v ? v.lang : 'ms-MY'; u.rate = .85;
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
  const w = Object.values(LATAR).concat(['#6FB4F7']);
  let h = '<div class="konfeti">';
  for (let i = 0; i < 70; i++) h += '<i style="left:' + Math.random() * 100 + '%;background:' + w[i % w.length] + ';' + (i % 3 ? 'height:5px;width:12px;border-radius:3px' : 'border-radius:50%') + ';--x:' + (Math.random() * 120 - 60) + 'px;--y:' + (600 + Math.random() * 300) + 'px;--r:' + Math.random() * 720 + 'deg;--t:' + (1.8 + Math.random() * 1.4) + 's;--d:' + Math.random() * .5 + 's"></i>';
  sk.insertAdjacentHTML('beforeend', h + '</div>');
  setTimeout(() => { const k = sk.querySelector('.konfeti'); if (k) k.remove(); }, 4000);
}

/* ---------- navigasi ---------- */
function pergi(skrin, data) {
  klik(540);
  Object.assign(T, data || {});
  T.galat = '';
  S.skrin = skrin;
  if (skrin === 'detail' && !PAPAN) { if (!S.dibuka.includes(T.huruf)) S.dibuka.push(T.huruf); tambahMasa(30); }
  if (skrin === 'suku' && !PAPAN) { S.suku = true; tambahMasa(20); }
  simpan(); lukis();
}
function barStatus() {
  const d = new Date();
  return '<div class="bar-status"><span>' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + '</span><span class="kanan"><span class="isyarat"><i style="height:4px"></i><i style="height:6px"></i><i style="height:8px"></i><i style="height:10px"></i></span><span class="bateri"></span></span></div>';
}
function barAtas(kembali, judul, kanan) {
  return '<div class="bar-atas"><button class="kembali-btn" onclick="' + kembali + '" aria-label="Kembali">' + ikon('kiri', 22) + '</button><span class="judul-bar">' + (judul || '') + '</span><span class="kanan-bar">' + (kanan || '') + '</span></div>';
}
function nav(aktif) {
  const b = (id, ik, lbl, lenc) => '<button class="' + (aktif === id ? 'aktif' : '') + '" onclick="pergi(\'' + id + '\')">' + ikon(ik, 22) + lbl + (lenc ? '<span class="lencana-n">' + lenc + '</span>' : '') + '</button>';
  return '<nav class="nav">' + b('utama', 'rumah', L('utama')) + b('huruf', 'huruf', L('belajar')) + b('beg', 'beg', L('beg').split(' ')[0], S.beg.length || '') + b('profil', 'orang', L('akaun')) + '</nav>';
}

/* ============================================================
   SKRIN AWAL
   ============================================================ */
function skrinSplash() {
  const w = ['#E8F4FE', '#FFF5DC', '#E4F6EA', '#FDE8E7', '#FFE9DA', '#EEE8FF'];
  return '<div class="splash"><div class="grid-huruf">' + HURUF.concat(HURUF.slice(0, 5)).map((h, i) => '<span style="--i:' + i + ';background:' + w[(i * 7) % w.length] + '">' + esc(h.j) + '</span>').join('') + '</div>' +
    '<div class="kad-biru">' + hiasan('kilau', '#fff', 26, 'position:absolute;right:28px;top:22px', 'apung') +
    '<h1 class="besar">' + ombak('JawiKu') + '</h1><p>' + B('Belajar 37 huruf Jawi, sambung jadi perkataan, dan uji diri dengan kuiz yang seronok.', 'Learn 37 Jawi letters, join them into words and test yourself with fun quizzes.') + '</p>' +
    '<button class="btn putih kecil" onclick="pergi(\'onb\',{})">' + L('mula') + '</button></div></div>';
}
const ONB = [
  { j: ['Kenal huruf Jawi', 'Meet Jawi letters'], s: ['37 huruf, setiap satu dengan bunyi, nama dan bentuknya sendiri.', '37 letters, each with its own sound, name and shapes.'] },
  { j: ['Sambung jadi perkataan', 'Join them into words'], s: ['Lihat huruf bersambung menjadi perkataan seperti buku dan bunga.', 'Watch letters join to make words like buku and bunga.'] },
  { j: ['Jejak kemajuan', 'Track your progress'], s: ['Kumpul bintang, surih huruf dan lihat perjalanan belajar anda.', 'Collect stars, trace letters and follow your learning journey.'] }
];
function seniOnb(i) {
  if (i === 0) return '<div class="onb-art">' +
    '<div class="huruf-gergasi pop" style="left:70px;top:30px;--m:.1s">ج</div>' +
    watak('titis', 96, 'apung', 'right:0;top:150px;--t:5s') +
    hiasan('hati', '#F2453D', 34, 'left:20px;top:40px;--r:-12deg;--m:.4s', 'pop apung') +
    hiasan('bintang', '#FFC85A', 30, 'right:40px;top:16px;--m:.5s', 'pop apung') +
    hiasan('syiling', '#FFC85A', 52, 'left:4px;top:200px;--m:.6s', 'pop apung', 'ب') +
    hiasan('kilau', '#6FB4F7', 22, 'left:130px;top:250px;--m:.7s', 'pop') + '</div>';
  if (i === 1) return '<div class="onb-art">' +
    ['ب', 'و', 'ک', 'و'].map((h, n) => '<span class="pop" style="right:' + (20 + n * 62) + 'px;top:60px;--m:' + (n * .18) + 's;width:56px;height:56px;border-radius:16px;background:' + ['#E8F4FE', '#FFF5DC', '#E4F6EA', '#FDE8E7'][n] + ';display:flex;align-items:center;justify-content:center;font-family:var(--j);font-size:32px">' + h + '</span>').join('') +
    '<div class="pop" style="left:0;right:0;top:120px;--m:.9s;text-align:center;font-family:var(--j);font-size:66px;color:var(--biru)">بوکو</div>' +
    '<div class="pop" style="left:0;right:0;top:240px;--m:1.1s;text-align:center;font-family:var(--d);font-weight:800;font-size:22px">buku</div>' +
    watak('gumpal', 80, 'apung', 'left:-8px;top:210px') + hiasan('bunga', '#6FB4F7', 40, 'right:6px;top:220px', 'apung') + '</div>';
  return '<div class="onb-art">' + watak('bunga', 150, 'lompat-a', 'left:65px;top:70px') +
    hiasan('bintang', '#FFC85A', 40, 'left:20px;top:30px;--m:.2s', 'pop apung') + hiasan('bintang', '#FFC85A', 32, 'right:30px;top:20px;--m:.35s', 'pop apung') +
    hiasan('gerigi', '#F2453D', 44, 'right:4px;top:170px;--m:.5s', 'pop apung') + hiasan('roket', '#FF8A3D', 46, 'left:0;top:180px;--m:.6s;--r:-30deg', 'pop apung') + '</div>';
}
function skrinOnb() {
  const o = ONB[S.onb];
  return '<div class="onb"><button class="atas-k" onclick="pergi(\'masuk\')">' + L('masuk') + '</button>' + seniOnb(S.onb) +
    '<h2 class="h2">' + dedah(B(o.j[0], o.j[1])) + '</h2><p class="body">' + esc(B(o.s[0], o.s[1])) + '</p>' +
    '<div class="titik">' + ONB.map((x, n) => '<i class="' + (n === S.onb ? 'aktif' : '') + '" onclick="S.onb=' + n + ';lukis()"></i>').join('') + '</div>' +
    '<div class="butang"><button class="btn" onclick="' + (S.onb < 2 ? 'S.onb++;klik(620);lukis()' : 'pergi(\'sambut\')') + '">' + (S.onb < 2 ? B('Seterusnya', 'Next') : L('cipta')) + '</button>' +
    '<button class="btn garis" onclick="masukCepat()">' + logoG(17) + L('google') + '</button></div></div>';
}
function skrinSambut() {
  const p = [
    ['hati', '#F2453D', 46, 'left:24px;top:70px;--r:-10deg'], ['bunga', '#6FB4F7', 50, 'left:150px;top:6px'], ['syiling', '#FFC85A', 46, 'left:170px;top:110px', 'ج'],
    ['kilau', '#FFC85A', 24, 'left:110px;top:90px'], ['bintang', '#FFC85A', 26, 'left:60px;top:200px'], ['roket', '#F2453D', 34, 'left:100px;top:170px;--r:-35deg'],
    ['bulat', '#1E9BF0', 22, 'right:120px;top:40px'], ['gerigi', '#F2453D', 40, 'right:20px;top:250px'], ['syiling', '#6FB4F7', 40, 'right:90px;top:170px', 'ڠ'],
    ['kilau', '#6FB4F7', 20, 'right:40px;top:120px'], ['pil', '#3DB36B', 40, 'left:10px;top:300px;--r:30deg'], ['bulat', '#FFC85A', 18, 'left:240px;top:300px']
  ];
  return '<div class="family"><div class="family-art">' +
    '<span class="cincin-b" style="left:30px;top:40px;width:300px;height:300px"></span><span class="cincin-b" style="left:80px;top:90px;width:200px;height:200px"></span>' +
    p.map((x, i) => hiasan(x[0], x[1], x[2], x[3] + ';--m:' + (i * .07) + 's;--t:' + (5 + i % 4) + 's', 'pop apung', x[4])).join('') +
    watak('gumpal', 96, 'apung', 'left:-24px;top:140px;--t:6s') + watak('titis', 92, 'apung', 'right:-26px;top:110px;--t:7s') +
    watak('bunga', 130, 'lompat-a', 'left:50%;margin-left:-65px;top:230px') + '</div>' +
    '<h1 class="besar">' + dedah(B('Huruf kamu.\nGaya kamu.', 'Your letters.\nYour way.')) + '</h1>' +
    '<p class="body">' + B('Cipta akaun baharu atau log masuk untuk mula belajar Jawi dengan mudah.', 'Create a new account or log in to start learning Jawi easily.') + '</p>' +
    '<div class="butang"><button class="btn" onclick="pergi(\'cipta\')">' + L('ciptaBaru') + '</button><button class="btn garis" onclick="pergi(\'masuk\')">' + L('sudahAda') + '</button>' +
    '<div style="margin-top:6px">' + pilBahasa() + '</div>' +
    '<p class="kecil">' + B('Dengan menggunakan JawiKu, anda bersetuju dengan <b>Terma Penggunaan</b> dan <b>Dasar Privasi</b>.', 'By using JawiKu, you agree to our <b>Terms of Use</b> and <b>Privacy Policy</b>.') + '</p></div></div>';
}
let FORM = {};
function ambil() { document.querySelectorAll('#telefon [data-f]').forEach(i => FORM[i.dataset.f] = i.value); }
function inp(f, ph, jenis) { return '<input class="input" data-f="' + f + '" type="' + (jenis || 'text') + '" placeholder="' + esc(ph) + '" value="' + esc(FORM[f] || '') + '">'; }
function skrinCipta() {
  return barAtas("pergi('sambut')") + '<div class="borang"><h1 class="h1">' + dedah(L('ciptaJ')) + '</h1>' +
    inp('nama', L('nama')) + inp('emel', L('emel'), 'email') + inp('laluan', L('laluan'), 'password') + inp('umur', L('umur') + ' (' + B('pilihan', 'optional') + ')', 'number') +
    (T.galat ? '<div class="galat">' + esc(T.galat) + '</div>' : '') +
    '<button class="btn" style="margin-top:8px" onclick="hantarCipta()">' + L('cipta') + '</button>' +
    '<p class="meta" style="text-align:center;margin-top:14px;line-height:1.5">' + L('terma') + '</p>' +
    '<p class="kaki-borang">' + L('sudahAkun') + ' <button class="pautan" onclick="FORM={};pergi(\'masuk\')">' + L('masuk') + '</button></p></div>';
}
function hantarCipta() {
  ambil();
  if (!(FORM.nama || '').trim()) T.galat = B('Sila isi nama pengguna.', 'Please enter a username.');
  else if (!/^\S+@\S+\.\S+$/.test(FORM.emel || '')) T.galat = B('E-mel tidak sah.', 'Invalid email.');
  else if ((FORM.laluan || '').length < 4) T.galat = B('Kata laluan sekurang-kurangnya 4 aksara.', 'Password needs at least 4 characters.');
  else T.galat = '';
  if (T.galat) { lukis(); return; }
  S.nama = FORM.nama.trim(); S.emel = FORM.emel.trim(); S.umur = FORM.umur || ''; FORM = {};
  pergi('utama'); setTimeout(konfeti, 200);
}
function skrinMasuk() {
  return barAtas("pergi('sambut')") + '<div class="borang"><h1 class="h1">' + dedah(L('masukJ')) + '</h1>' +
    inp('emel', L('emel') + ' / ' + L('nama')) +
    '<div class="input-wrap">' + inp('laluan', L('laluan'), 'password') + '<button onclick="ambil();pergi(\'lupa\')">' + L('lupa') + '</button></div>' +
    (T.galat ? '<div class="galat">' + esc(T.galat) + '</div>' : '') +
    '<button class="btn" style="margin-top:8px" onclick="hantarMasuk()">' + L('masuk') + '</button>' +
    '<button class="btn garis" style="margin-top:10px" onclick="masukCepat()">' + logoG(17) + L('google') + '</button>' +
    '<p class="kaki-borang">' + L('belumAkun') + ' <button class="pautan" onclick="FORM={};pergi(\'cipta\')">' + L('daftar') + '</button></p></div>';
}
function hantarMasuk() {
  ambil();
  if (!(FORM.emel || '').trim()) { T.galat = B('Sila isi e-mel atau nama.', 'Please enter your email or name.'); lukis(); return; }
  if ((FORM.laluan || '').length < 4) { T.galat = B('Kata laluan sekurang-kurangnya 4 aksara.', 'Password needs at least 4 characters.'); lukis(); return; }
  const e = FORM.emel.trim(); S.nama = e.includes('@') ? e.split('@')[0] : e; if (e.includes('@')) S.emel = e; FORM = {};
  pergi('utama'); setTimeout(() => tunjuk(B('Selamat kembali, ', 'Welcome back, ') + S.nama + '!', 'bintang'), 200);
}
function masukCepat() { S.nama = S.nama || 'Aisyah'; S.emel = S.emel || 'aisyah@contoh.my'; FORM = {}; pergi('utama'); }
function skrinLupa() {
  return barAtas("pergi('masuk')") + '<div class="borang"><h1 class="h1">' + dedah(L('lupaJ')) + '</h1><p class="body" style="margin:-10px 0 18px">' + L('lupaS') + '</p>' +
    inp('emel', L('emel'), 'email') + '<button class="btn" onclick="ambil();if(!/^\\S+@\\S+\\.\\S+$/.test(FORM.emel||\'\')){tunjuk(B(\'E-mel tidak sah\',\'Invalid email\'),\'info\');return}tunjuk(B(\'Pautan dihantar (contoh)\',\'Link sent (demo)\'),\'emel\');setTimeout(()=>pergi(\'masuk\'),900)">' + L('hantar') + '</button></div>' + papanKekunci('lupa');
}

/* ============================================================
   UTAMA (gaya senarai restoran)
   ============================================================ */
const TAHAP = [['Pemula', 'Beginner'], ['Sederhana', 'Intermediate'], ['Mahir', 'Advanced']];
function hurufHariIni() { const d = new Date(); return (d.getDate() + d.getMonth() * 3) % HURUF.length; }
function skrinUtama() {
  const hh = hurufHariIni(), H = HURUF[hh];
  const melayu = HURUF.filter(h => h.jawi).map(h => h.j).join(' ');
  const popular = [1, 4, 20, 22, 25, 35, 27, 10];
  return '<div class="lokasi"><div class="meta">' + L('tahap') + '</div><button onclick="S.tahap=(S.tahap+1)%3;simpan();lukis()">' + esc(B(TAHAP[S.tahap][0], TAHAP[S.tahap][1])) + ' ' + ikon('bawah', 16) + '</button></div>' +
    '<div class="baris-cari"><label class="cari" onclick="pergi(\'cari\')">' + ikon('cari', 18) + '<input readonly placeholder="' + esc(L('cari')) + '"></label><button class="btn-tapis" onclick="pergi(\'tapis\')" aria-label="' + L('tapis') + '">' + ikon('tapis', 20) + '</button></div>' +
    '<div class="skrol"><div class="kat-baris">' + KATEGORI.map((k, i) => '<button class="kat naik" style="--i:' + i + '" onclick="pergiKat(\'' + k.id + '\')"><span class="kotak bg-' + k.warna + '">' + ikon(k.ikon, 26, 'lukis') + '</span>' + esc(B(k.ms, k.en)) + '</button>').join('') + '</div>' +
    '<div class="pad">' +
    '<button class="kad-besar naik" style="--i:1" onclick="pergi(\'cabaran\')"><div class="gambar" style="background:linear-gradient(135deg,#1E9BF0,#6FB4F7)">' +
    hiasan('bintang', '#FFC85A', 40, 'position:absolute;left:18px;top:16px', 'apung') + hiasan('syiling', '#FFC85A', 46, 'position:absolute;right:24px;top:20px', 'apung', 'ق') +
    watak('bunga', 104, 'lompat-a', 'position:absolute;left:24px;bottom:-10px') + '<span class="jw-besar" style="margin-left:90px">' + esc(melayu.split(' ').slice(0, 3).join(' ')) + '</span><span class="masa">5 – 10 min</span></div>' +
    '<b>' + L('cabaran') + '</b><div class="meta"><span>★ 4.9</span> (1,2k) · ' + B('Huruf ciptaan Melayu', 'Malay-made letters') + '</div></button>' +
    '<button class="kad-besar naik" style="--i:2" onclick="pergi(\'detail\',{huruf:' + hh + '})"><div class="gambar" style="background:' + LATAR[warnaI(hh)] + '">' + hiasan('kilau', '#fff', 30, 'position:absolute;right:30px;top:24px', 'apung') + hiasan('hati', 'rgba(255,255,255,.5)', 40, 'position:absolute;left:26px;bottom:20px', 'apung') +
    '<span class="jw-besar">' + esc(H.j) + '</span><span class="masa">3 min</span></div><b>' + B('Huruf hari ini: ', 'Letter of the day: ') + esc(H.nama) + '</b><div class="meta"><span>★ 4.8</span> · ' + B('Bunyi ', 'Sound ') + esc(H.bunyi) + ' · ' + esc(H.contoh[0]) + '</div></button>' +
    '<div class="seksyen"><h2 class="h2">' + L('popular') + '</h2><button onclick="pergi(\'huruf\')">' + L('lihat') + '</button></div>' +
    '<div class="mendatar">' + popular.map((i, n) => { const h = HURUF[i]; return '<button class="kad-kecil naik" style="--i:' + n + '" onclick="pergi(\'detail\',{huruf:' + i + '})"><div class="gambar bg-' + warnaI(n) + '">' + esc(h.j) + '</div><b>' + esc(h.nama) + ' · ' + esc(h.bunyi) + '</b><div class="meta">' + esc(h.contoh[0]) + ' ' + jw(h.contoh[1]) + '</div></button>'; }).join('') + '</div>' +
    '<div class="seksyen" style="margin-top:14px"><h2 class="h2">' + L('baharu') + '</h2><button onclick="pergi(\'perkataan\')">' + L('lihat') + '</button></div>' +
    [['suku', 'با بي بو', B('Suku kata terbuka', 'Open syllables'), B('Konsonan + alif, ya, wau', 'Consonant + alif, ya, wau'), 'kuning'],
     ['perkataan', 'بوکو', B('Perkataan harian', 'Everyday words'), KAMUS.length + B(' perkataan · 8 tema', ' words · 8 themes'), 'hijau'],
     ['surih', 'ڠ', B('Surih huruf', 'Trace letters'), B('Latih tangan dengan pemasa', 'Practise with a timer'), 'merah']].map((x, i) =>
      '<button class="baris-senarai naik" style="--i:' + i + '" onclick="pergi(\'' + x[0] + '\')"><span class="kotak bg-' + x[4] + '">' + jw(x[1]) + '</span><span class="tengah"><b>' + x[2] + '</b><span class="meta">' + x[3] + '</span><div class="bintang-k">★ 4.' + (9 - i) + ' <span class="meta">(' + (320 - i * 70) + ')</span></div></span>' + ikon('kanan', 18) + '</button>').join('') +
    '</div></div>' + nav('utama');
}
function pergiKat(id) {
  if (id === 'huruf') pergi('huruf'); else if (id === 'sukukata') pergi('suku'); else if (id === 'perkataan') pergi('perkataan');
  else if (id === 'surih') pergi('surih'); else pergi('sedia');
}

/* ---------- CABARAN (Latest offers) ---------- */
function skrinCabaran() {
  const c = [
    ['huruf', B('Kuiz huruf tunggal', 'Single letter quiz'), B('Teka nama setiap huruf', 'Guess each letter name'), 'ب ت ث', '#1E9BF0', 'titis'],
    ['j2r', B('Baca perkataan Jawi', 'Read Jawi words'), B('Pilih ejaan rumi yang betul', 'Pick the right Rumi spelling'), 'بوڠا', '#3DB36B', 'gumpal'],
    ['r2j', B('Cari tulisan Jawi', 'Find the Jawi spelling'), B('Dari rumi ke Jawi', 'From Rumi to Jawi'), 'ݢورو', '#FF8A3D', 'bintang']
  ];
  return '<div class="kepala-biru">' + barAtas("pergi('utama')").replace('class="bar-atas"', 'class="bar-atas" style="padding:0 0 6px;margin-left:-10px"') +
    '<h1 class="h1">' + dedah(L('cabaran')) + '</h1><p>' + B('Jawab 5 soalan setiap cabaran dan kumpul bintang.', 'Answer 5 questions per challenge and collect stars.') + '</p><span class="pil-p">' + c.length + B(' cabaran', ' challenges') + '</span>' +
    watak('bunga', 110, 'lompat-a', 'position:absolute;right:10px;bottom:-14px') + hiasan('bintang', '#FFC85A', 26, 'position:absolute;right:130px;top:40px', 'apung') + '</div>' +
    '<div class="skrol"><div class="pad" style="padding-top:16px">' + c.map((x, i) => '<button class="kad-besar naik" style="--i:' + i + '" onclick="T.mod=\'' + x[0] + '\';mulaKuiz()"><div class="gambar" style="background:' + x[4] + ';height:150px">' +
      watak(x[5], 84, 'apung', 'position:absolute;left:16px;bottom:-6px') + '<span class="jw-besar" style="font-size:70px;margin-left:80px">' + esc(x[3]) + '</span><span class="masa">+' + (50 + i * 10) + ' XP</span></div><b>' + x[1] + '</b><div class="meta"><span>★ 4.' + (9 - i) + '</span> · ' + x[2] + '</div></button>').join('') +
    '</div></div>' + nav('utama');
}

/* ---------- SEMUA HURUF ---------- */
function senaraiHuruf() {
  let l = HURUF.map((h, i) => Object.assign({ i }, h));
  if (T.jenis === 'arab') l = l.filter(h => h.arab);
  if (T.jenis === 'melayu') l = l.filter(h => h.jawi);
  if (T.jenis === 'suka') l = l.filter(h => S.suka.includes(h.i));
  if (T.jenis === 'sambung') l = l.filter(h => h.sambung);
  if (T.jenis === 'tak') l = l.filter(h => !h.sambung);
  if (T.susun === 'nama') l.sort((a, b) => a.nama.localeCompare(b.nama));
  if (T.susun === 'suka') l.sort((a, b) => (S.suka.includes(b.i) ? 1 : 0) - (S.suka.includes(a.i) ? 1 : 0));
  return l;
}
function skrinHuruf() {
  const l = senaraiHuruf();
  const jenis = [['semua', B('Semua', 'All')], ['melayu', B('Ciptaan Melayu', 'Malay-made')], ['arab', B('Dari Arab', 'From Arabic')], ['suka', B('Disukai', 'Liked')]];
  return '<div class="bar-atas"><span style="width:38px"></span><span class="judul-bar">' + L('semuaHuruf') + '</span><span class="kanan-bar"><button class="btn-tapis" style="width:38px;height:38px" onclick="pergi(\'tapis\')" aria-label="' + L('tapis') + '">' + ikon('tapis', 18) + '</button></span></div>' +
    '<div class="skrol"><div class="pad">' +
    '<div class="kat-baris" style="padding:0 0 12px">' + jenis.map(j => '<button class="cip ' + (T.jenis === j[0] ? 'aktif' : '') + '" style="padding:8px 12px;flex:0 0 auto" onclick="T.jenis=\'' + j[0] + '\';klik(640);lukis()">' + j[1] + '</button>').join('') + '</div>' +
    '<div class="meta" style="margin-bottom:10px">' + l.length + B(' huruf · ketuk untuk belajar', ' letters · tap to learn') + '</div>' +
    (l.length ? '<div class="grid-37">' + l.map((h, n) => '<button class="sel-huruf naik bg-' + warnaI(h.i) + '" style="--i:' + Math.min(n, 15) + '" onclick="pergi(\'detail\',{huruf:' + h.i + '})">' +
      (h.jawi ? '<span class="tag-j">MY</span>' : '') + (S.suka.includes(h.i) ? '<span class="hati-mini">' + ikon('hati', 14).replace('fill="none"', 'fill="currentColor"') + '</span>' : '') +
      jw(h.j) + '<b style="color:var(--hitam)">' + esc(h.nama) + '</b><small>' + esc(h.bunyi) + '</small></button>').join('') + '</div>'
      : '<p class="body" style="text-align:center;padding:30px 0">' + B('Tiada huruf. Ketuk ♥ pada huruf untuk menyimpannya.', 'No letters. Tap ♥ on a letter to save it.') + '</p>') +
    '</div></div>' + nav('huruf');
}

/* ---------- DETAIL HURUF (Really Cool Burgers) ---------- */
function skrinDetail() {
  const i = T.huruf, h = HURUF[i], bt = bentuk(h), suka = S.suka.includes(i);
  const lain = perkataanDengan(h).filter(k => k[0] !== h.contoh[0]).slice(0, 3);
  const contoh = [[h.contoh[0], h.contoh[1], '', '']].concat(lain);
  const diBeg = (t, k) => S.beg.some(b => b.t === t && b.k === k);
  return '<div class="skrol"><div class="hero-huruf" style="background:' + LATAR[warnaI(i)] + '">' +
    '<div class="atas-h"><button onclick="pergi(\'huruf\')" aria-label="Kembali">' + ikon('kiri', 20) + '</button><button class="hati-b ' + (suka ? 'ada' : '') + '" onclick="togolSuka(this)" aria-label="Suka">' + ikon('hati', 20) + '</button></div>' +
    hiasan('kilau', '#fff', 30, 'position:absolute;left:40px;top:70px', 'apung') + hiasan('bulat', 'rgba(255,255,255,.25)', 160, 'position:absolute;right:-50px;bottom:-60px') + hiasan('bintang', 'rgba(255,255,255,.6)', 30, 'position:absolute;right:60px;top:60px', 'apung') +
    '<span class="jw-hero">' + esc(h.j) + '</span><span class="masa">' + (i + 1) + ' / 37</span></div>' +
    '<div class="det-isi"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h1 class="h1">' + dedah(h.nama.charAt(0).toUpperCase() + h.nama.slice(1)) + '</h1>' +
    '<div class="meta" style="margin-top:4px"><span style="color:var(--kuning)">★</span> ' + B('Bunyi', 'Sound') + ': <b style="color:var(--hitam)">' + esc(h.bunyi) + '</b> · ' + (h.sambung ? B('bersambung', 'joins') : B('tidak bersambung ke kiri', 'does not join left')) + (h.jawi ? ' · ' + B('huruf ciptaan Melayu', 'Malay-made letter') : '') + '</div></div>' +
    '<button class="tambah-b" style="width:42px;height:42px" onclick="ucap(\'' + h.nama + '\')" aria-label="Dengar">' + ikon('suara', 20) + '</button></div>' +
    '<div class="seksyen" style="margin-top:18px"><h2 class="h2">' + L('bentuk') + '</h2><span class="meta">' + B('kanan → kiri', 'right → left') + '</span></div>' +
    '<div class="bentuk4">' + [[bt[0], L('tunggal')], [bt[1], L('awal')], [bt[2], L('tengah')], [bt[3], L('akhir')]].map((b, n) => '<div class="naik" style="--i:' + n + '">' + jw(b[0]) + '<span>' + b[1] + '</span></div>').join('') + '</div>' +
    '<div class="seksyen" style="margin-top:18px"><h2 class="h2">' + L('contoh') + '</h2></div>' +
    contoh.map((k, n) => '<div class="baris-harga naik" style="--i:' + n + '"><span class="tengah"><b>' + esc(k[0]) + '</b><span class="meta">' + (k[3] ? esc(k[3]) : B('contoh utama', 'main example')) + '</span></span>' + jw(k[1]) +
      '<button class="tambah-b ' + (diBeg('p', k[0]) ? 'ada' : '') + '" onclick="togolBeg(this,\'p\',\'' + esc(k[0]) + '\')" aria-label="Tambah">' + ikon(diBeg('p', k[0]) ? 'centang' : 'tambah', 16) + '</button></div>').join('') +
    '<div class="seksyen" style="margin-top:18px"><h2 class="h2">' + B('Huruf seterusnya', 'Next letters') + '</h2></div>' +
    '<div class="mendatar">' + [1, 2, 3, 4].map(d => { const j = (i + d) % 37, x = HURUF[j]; return '<button class="kad-kecil" style="flex-basis:110px" onclick="pergi(\'detail\',{huruf:' + j + '})"><div class="gambar bg-' + warnaI(j) + '" style="height:84px;font-size:44px">' + esc(x.j) + '</div><b>' + esc(x.nama) + '</b></button>'; }).join('') + '</div>' +
    '<div style="height:16px"></div></div></div>' +
    '<div class="bawah-tetap" style="display:flex;gap:10px"><button class="btn garis" style="flex:0 0 52px;padding:0" onclick="pergi(\'surih\',{surih:' + i + '})" aria-label="' + L('surih') + '">' + ikon('pensel', 20) + '</button>' +
    '<button class="btn ' + (diBeg('h', i) ? 'abu' : '') + '" onclick="togolBeg(null,\'h\',' + i + ');lukis()">' + ikon(diBeg('h', i) ? 'centang' : 'beg', 18) + (diBeg('h', i) ? B('Dalam beg latihan', 'In practice bag') : L('tambahBeg')) + '</button></div>';
}
function togolSuka(btn) {
  const i = T.huruf, a = S.suka.indexOf(i);
  if (a >= 0) S.suka.splice(a, 1); else S.suka.push(i);
  simpan(); klik(a >= 0 ? 400 : 900); btn.classList.toggle('ada', a < 0);
  tunjuk(a < 0 ? B('Disimpan ke Disukai', 'Saved to Liked') : B('Dibuang dari Disukai', 'Removed from Liked'), 'hati');
}
function togolBeg(btn, t, k) {
  const a = S.beg.findIndex(b => b.t === t && b.k === k);
  if (a >= 0) S.beg.splice(a, 1); else S.beg.push({ t, k });
  simpan(); klik(a >= 0 ? 400 : 880);
  if (btn) { btn.classList.toggle('ada', a < 0); btn.innerHTML = ikon(a < 0 ? 'centang' : 'tambah', 16); }
  const n = document.querySelector('#telefon .nav .lencana-n'); if (n) n.textContent = S.beg.length || '';
  if (a < 0) tunjuk(B('Ditambah ke beg latihan', 'Added to practice bag'), 'beg');
}

/* ---------- SUKU KATA ---------- */
function skrinSuku() {
  return barAtas("pergi('utama')", B('Suku Kata', 'Syllables')) + '<div class="skrol"><div class="pad">' +
    '<p class="body" style="margin-bottom:12px">' + B('Huruf konsonan + alif = <b>a</b>, + ya = <b>i/e</b>, + wau = <b>u/o</b>. Ketuk untuk mendengar.', 'Consonant + alif = <b>a</b>, + ya = <b>i/e</b>, + wau = <b>u/o</b>. Tap to listen.') + '</p>' +
    '<div class="bentuk4" style="grid-template-columns:repeat(3,1fr);margin-bottom:8px;direction:ltr"><div style="background:var(--biru-soft)"><b>+ ا</b><span>a</span></div><div style="background:var(--kuning-soft)"><b>+ ي</b><span>i / e</span></div><div style="background:var(--hijau-soft)"><b>+ و</b><span>u / o</span></div></div>' +
    SUKU.map((c, n) => { const r = SUKU_RUMI[c]; return '<div class="bentuk4 naik" style="--i:' + Math.min(n, 10) + ';grid-template-columns:repeat(3,1fr);margin-bottom:8px;direction:ltr">' +
      [[c + 'ا', r + 'a', 'biru-soft'], [c + 'ي', r + 'i', 'kuning-soft'], [c + 'و', r + 'u', 'hijau-soft']].map(x => '<div style="background:var(--' + x[2] + ');cursor:pointer" onclick="ucap(\'' + x[1] + '\');klik(700)">' + jw(x[0]) + '<span>' + x[1] + '</span></div>').join('') + '</div>'; }).join('') +
    '</div></div>';
}

/* ---------- PERKATAAN (senarai Burgers) ---------- */
function skrinPerkataan() {
  const kat = ['semua'].concat(Object.keys(KAT_KAMUS));
  const l = KAMUS.filter(k => T.kat === 'semua' || k[2] === T.kat);
  return '<div class="hero-huruf" style="height:190px;background:linear-gradient(135deg,#1E9BF0,#0B84D8)">' +
    '<div class="atas-h"><button onclick="pergi(\'utama\')" aria-label="Kembali">' + ikon('kiri', 20) + '</button><button onclick="pergi(\'cari\')" aria-label="Cari">' + ikon('cari', 20) + '</button></div>' +
    watak('titis', 90, 'apung', 'position:absolute;right:16px;bottom:-14px') + hiasan('bunga', '#6FB4F7', 50, 'position:absolute;left:150px;top:40px', 'apung') +
    '<div style="position:absolute;left:20px;bottom:18px;color:#fff"><div class="besar" style="font-size:30px">' + dedah(L('kamus')) + '</div><div style="font-weight:700;font-size:13px;opacity:.9">' + KAMUS.length + B(' perkataan', ' words') + '</div></div></div>' +
    '<div class="kat-baris" style="padding:12px 20px">' + kat.map(k => '<button class="cip ' + (T.kat === k ? 'aktif' : '') + '" style="padding:8px 12px;flex:0 0 auto" onclick="T.kat=\'' + k + '\';klik(640);lukis()">' + (k === 'semua' ? B('Semua', 'All') : B(KAT_KAMUS[k][0], KAT_KAMUS[k][1])) + '</button>').join('') + '</div>' +
    '<div class="skrol"><div class="pad">' + l.map((k, n) => { const ada = S.beg.some(b => b.t === 'p' && b.k === k[0]);
      return '<div class="baris-senarai naik" style="--i:' + Math.min(n, 12) + '"><button class="kotak bg-' + warnaI(n) + '" onclick="ucap(\'' + esc(k[0]) + '\')" aria-label="Dengar">' + jw(k[1].length > 5 ? k[1].split(' ')[0] : k[1]) + '</button><span class="tengah"><b>' + esc(k[0]) + '</b><span class="meta">' + esc(k[3]) + ' · ' + esc(B(KAT_KAMUS[k[2]][0], KAT_KAMUS[k[2]][1])) + '</span></span>' + jw(k[1], '') +
        '<button class="tambah-b ' + (ada ? 'ada' : '') + '" style="margin-left:8px" onclick="togolBeg(this,\'p\',\'' + esc(k[0]) + '\')" aria-label="Tambah">' + ikon(ada ? 'centang' : 'tambah', 16) + '</button></div>'; }).join('') +
    '</div></div>';
}

/* ---------- BEG LATIHAN (My Order) ---------- */
function itemBeg(b) {
  if (b.t === 'h') { const h = HURUF[b.k]; return { jw: h.j, nama: h.nama, sub: B('Huruf', 'Letter') + ' · ' + h.bunyi }; }
  const k = KAMUS.find(x => x[0] === b.k) || [b.k, '', '', ''];
  return { jw: k[1], nama: k[0], sub: B('Perkataan', 'Word') + ' · ' + k[3] };
}
function skrinBeg() {
  if (!S.beg.length) return '<div class="bar-atas"><span style="width:38px"></span><span class="judul-bar">' + L('beg') + '</span><span style="width:38px"></span></div>' +
    '<div class="kosong"><div style="position:relative;width:160px;height:150px"><span class="pop" style="position:absolute;left:30px;top:20px;color:var(--biru)">' + ikon('beg', 100, 'lukis') + '</span>' + hiasan('kilau', '#FFC85A', 24, 'position:absolute;right:10px;top:10px', 'apung') + hiasan('hati', '#F2453D', 22, 'position:absolute;left:10px;bottom:20px', 'apung') + '</div>' +
      '<h2 class="h2">' + dedah(L('begKosong')) + '</h2><p class="body" style="margin-top:6px">' + L('begKosongS') + '</p><button class="btn kecil" style="margin-top:18px" onclick="pergi(\'huruf\')">' + L('semuaHuruf') + '</button></div>' + nav('beg');
  const h = S.beg.filter(b => b.t === 'h').length, p = S.beg.length - h;
  return '<div class="bar-atas"><span style="width:38px"></span><span class="judul-bar">' + L('beg') + '</span><span class="kanan-bar"><button onclick="S.beg=[];simpan();lukis()">' + B('Kosongkan', 'Clear') + '</button></span></div>' +
    '<div class="skrol"><div class="pad">' + S.beg.map((b, n) => { const x = itemBeg(b);
      return '<div class="baris-senarai naik" style="--i:' + Math.min(n, 10) + '"><span class="kotak bg-' + warnaI(n) + '">' + jw(x.jw.split(' ')[0]) + '</span><span class="tengah"><b>' + esc(x.nama) + '</b><span class="meta">' + esc(x.sub) + '</span></span><div class="kaunter"><button onclick="S.beg.splice(' + n + ',1);simpan();klik(400);lukis()" aria-label="Buang">' + ikon('tolak', 14) + '</button></div></div>'; }).join('') +
    '<button class="pautan" style="margin:12px 0;display:block" onclick="pergi(\'perkataan\')">+ ' + B('Tambah perkataan lagi', 'Add more words') + '</button>' +
    '<div class="ringkas"><div class="rb"><span>' + B('Huruf', 'Letters') + '</span><span>' + h + '</span></div><div class="rb"><span>' + B('Perkataan', 'Words') + '</span><span>' + p + '</span></div><div class="rb jumlah"><span>' + B('Soalan kuiz', 'Quiz questions') + '</span><span>' + Math.max(5, Math.min(15, S.beg.length)) + '</span></div></div>' +
    '<button class="btn" style="margin-top:16px" onclick="pergi(\'sedia\')">' + B('Teruskan', 'Continue') + '</button></div></div>' + nav('beg');
}

/* ---------- SEDIA (Checkout) ---------- */
const MOD = [['campur', ['Campur', 'Mixed'], ['Semua jenis soalan', 'All question types']], ['huruf', ['Huruf → nama', 'Letter → name'], ['Kenal nama huruf', 'Name the letter']], ['j2r', ['Jawi → Rumi', 'Jawi → Rumi'], ['Baca perkataan', 'Read the word']], ['r2j', ['Rumi → Jawi', 'Rumi → Jawi'], ['Pilih tulisan Jawi', 'Pick the Jawi spelling']]];
function skrinSedia(dim) {
  return barAtas("pergi('" + (S.beg.length ? 'beg' : 'utama') + "')", L('sedia')) + '<div class="skrol"><div class="pad">' +
    '<div class="meta" style="margin-bottom:4px">' + B('Mod kuiz', 'Quiz mode') + '</div>' +
    MOD.map(m => '<button class="tapis-baris ' + (T.mod === m[0] ? 'aktif' : '') + '" onclick="T.mod=\'' + m[0] + '\';klik(640);lukis()"><span><b style="display:block">' + B(m[1][0], m[1][1]) + '</b><span class="meta">' + B(m[2][0], m[2][1]) + '</span></span>' + (T.mod === m[0] ? ikon('centang', 20) : '') + '</button>').join('') +
    '<div class="meta" style="margin:16px 0 4px">' + B('Sumber soalan', 'Question source') + '</div>' +
    '<div class="tapis-baris"><span>' + ikon('beg', 18).replace('class="ik ', 'style="display:inline;vertical-align:-3px;margin-right:8px;color:var(--biru)" class="ik ') + (S.beg.length ? S.beg.length + B(' item dari beg latihan', ' items from practice bag') : B('Rawak dari semua huruf & perkataan', 'Random from all letters & words')) + '</span><button class="pautan" onclick="pergi(\'beg\')">' + B('Ubah', 'Change') + '</button></div>' +
    '<div class="meta" style="margin:16px 0 6px">' + B('Bilangan soalan', 'Number of questions') + ': <b style="color:var(--hitam)">' + T.bil + '</b></div>' +
    '<input type="range" class="julat" min="5" max="15" step="5" value="' + T.bil + '" oninput="T.bil=+this.value;this.previousElementSibling.querySelector(\'b\').textContent=this.value">' +
    '<div class="ringkas" style="margin-top:14px"><div class="h3" style="margin-bottom:6px">' + L('ringkasan') + '</div><div class="rb"><span>' + B('Masa setiap soalan', 'Time per question') + '</span><span>15 s</span></div><div class="rb"><span>' + B('Bintang untuk betul', 'Stars per correct') + '</span><span>★ 1</span></div><div class="rb jumlah"><span>' + B('Anggaran masa', 'Estimated time') + '</span><span>' + Math.ceil(T.bil * 15 / 60) + ' min</span></div></div>' +
    '<button class="btn" style="margin-top:18px" onclick="mulaKuiz()">' + L('mulaKuiz') + '</button></div></div>' + (dim || '');
}

/* ---------- KUIZ (kad tebal KidRush) ---------- */
function acak(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function buatSoalan(mod, item) {
  const jenis = mod === 'campur' ? (item && item.t === 'h' ? 'huruf' : acak(['huruf', 'j2r', 'r2j'])[0]) : mod;
  if (jenis === 'huruf') {
    const i = item && item.t === 'h' ? item.k : Math.floor(Math.random() * 37), h = HURUF[i];
    const salah = acak(HURUF.filter(x => x.nama !== h.nama)).slice(0, 3).map(x => x.nama);
    return { jenis, tanya: h.j, jawapan: h.nama, pilihan: acak([h.nama].concat(salah)) };
  }
  let k = item && item.t === 'p' ? KAMUS.find(x => x[0] === item.k) : null;
  if (!k) k = KAMUS[Math.floor(Math.random() * KAMUS.length)];
  const lain = acak(KAMUS.filter(x => x[0] !== k[0])).slice(0, 3);
  if (jenis === 'j2r') return { jenis, tanya: k[1], jawapan: k[0], pilihan: acak([k[0]].concat(lain.map(x => x[0]))) };
  return { jenis: 'r2j', tanya: k[0], jawapan: k[1], pilihan: acak([k[1]].concat(lain.map(x => x[1]))) };
}
function mulaKuiz() {
  const bil = S.beg.length ? Math.max(5, Math.min(15, S.beg.length)) : T.bil;
  const sumber = S.beg.length ? acak(S.beg) : [];
  const soal = [];
  for (let n = 0; n < bil; n++) soal.push(buatSoalan(T.mod, sumber.length ? sumber[n % sumber.length] : null));
  T.kuiz = { soal, i: 0, pilih: null, betul: 0, mula: Date.now() };
  pergi('kuiz');
}
let pemasaSoal = null;
function skrinKuiz() {
  const K = T.kuiz, q = K.soal[K.i];
  const arahan = { huruf: B('Apakah nama huruf ini?', 'What is this letter called?'), j2r: B('Bagaimana perkataan ini dibaca?', 'How is this word read?'), r2j: B('Pilih tulisan Jawi yang betul', 'Pick the correct Jawi spelling') }[q.jenis];
  return '<div class="kuiz-latar"><div class="sinar"></div><div class="kuiz-atas"><button class="bulat-k" onclick="clearTimeout(pemasaSoal);pergi(\'utama\')" aria-label="Tutup">' + ikon('tutup', 20) + '</button>' +
    '<h1 class="besar">' + B('Kuiz Jawi', 'Jawi Quiz') + '</h1><button class="bulat-k" onclick="ucap(\'' + esc(q.jenis === 'huruf' ? q.jawapan : (q.jenis === 'j2r' ? q.jawapan : q.tanya)) + '\')" aria-label="Dengar">' + ikon('suara', 19) + '</button></div>' +
    '<div class="skor-pil"><span>' + B('Soalan', 'Question') + ' ' + (K.i + 1) + '/' + K.soal.length + '</span><span>★ ' + K.betul + '</span></div>' +
    '<div class="masa-bar"><i data-masa></i></div>' +
    '<div class="kad-tebal soalan-k anim"><div class="arahan">' + arahan + '</div>' + (q.jenis === 'r2j' ? '<div class="rumi">' + esc(q.tanya) + '</div>' : jw(q.tanya)) + '</div>' +
    '<div class="pilihan-grid">' + q.pilihan.map((p, n) => {
      let k = ''; if (K.pilih !== null) { if (p === q.jawapan) k = 'betul'; else if (n === K.pilih) k = 'salah'; }
      return '<button class="pilihan naik ' + k + '" style="--i:' + n + '" ' + (K.pilih === null ? 'onclick="jawab(' + n + ')"' : '') + '>' + (q.jenis === 'r2j' ? jw(p) : esc(p)) + '</button>';
    }).join('') + '</div>' +
    watak('bunga', 90, 'lompat-a', 'position:absolute;left:14px;bottom:20px;opacity:.95') + hiasan('bintang', '#FFC85A', 34, 'position:absolute;right:26px;bottom:60px', 'apung') + '</div>';
}
function jawab(n) {
  const K = T.kuiz; if (!K || K.pilih !== null) return;
  clearTimeout(pemasaSoal);
  K.pilih = n; const q = K.soal[K.i]; const ok = n >= 0 && q.pilihan[n] === q.jawapan;
  if (ok) { K.betul++; klik(880); setTimeout(() => klik(1180), 110); } else klik(220);
  lukis();
  setTimeout(() => {
    if (S.skrin !== 'kuiz' || T.kuiz !== K) return;
    if (K.i < K.soal.length - 1) { K.i++; K.pilih = null; lukis(); }
    else {
      const saat = Math.round((Date.now() - K.mula) / 1000); tambahMasa(saat);
      S.riwayat.unshift({ betul: K.betul, jum: K.soal.length, mod: T.mod, ts: Date.now() }); S.riwayat = S.riwayat.slice(0, 30);
      T.hasil = { betul: K.betul, jum: K.soal.length }; simpan(); pergi('tahniah'); setTimeout(konfeti, 300);
    }
  }, ok ? 800 : 1300);
}

/* ---------- TAHNIAH (Thank you modal) ---------- */
function skrinTahniah() {
  const H = T.hasil || { betul: 4, jum: 5 };
  const p = [['#FFC85A', '-6px', '10px'], ['#FFC85A', '86px', '0'], ['#1E9BF0', '-10px', '70px'], ['#F2453D', '92px', '74px']];
  const modal = '<div class="lapis"><div class="modal-bawah"><div class="cek-besar">' + ikon('centang', 48) + p.map((x, i) => '<span class="percik" style="left:' + x[1] + ';top:' + x[2] + ';animation-delay:' + i * .2 + 's">' + hiasan('kilau', x[0], 12) + '</span>').join('') + '</div>' +
    '<h2 class="h2">' + dedah(L('tahniah')) + '</h2><p class="body" style="margin:8px 0 4px">' + B('Kamu jawab ', 'You answered ') + '<b style="color:var(--biru)">' + H.betul + '/' + H.jum + '</b>' + B(' dengan betul. Kemajuan disimpan dalam Perjalanan Belajar.', ' correctly. Progress saved to your Learning Journey.') + '</p>' +
    '<div class="bintang3" style="margin:10px 0 18px">' + [0, 1, 2].map(n => { const r = H.betul / H.jum, nb = r >= 1 ? 3 : r >= .6 ? 2 : r > 0 ? 1 : 0, on = n < nb; return ikon('bintang', 34, on ? 'lompat-a' : '').replace('fill="none"', 'fill="' + (on ? '#FFC85A' : '#E3E7EC') + '"').replace('stroke="currentColor"', 'stroke="' + (on ? '#F2A900' : '#D2D7DE') + '"'); }).join('') + '</div>' +
    '<button class="btn" onclick="pergi(\'perjalanan\')">' + L('jejak') + '</button><button class="pautan" style="margin-top:14px;display:block;width:100%" onclick="pergi(\'utama\')">' + L('lagi') + '</button></div></div>';
  return skrinSedia(modal);
}

/* ---------- PERJALANAN (Track order) ---------- */
function skrinPerjalanan() {
  const s = S.saat[hariIni()] || 0;
  const terbaik = S.riwayat.reduce((m, r) => Math.max(m, r.betul / r.jum), 0);
  const langkah = [
    [S.dibuka.length >= 1, B('Kenal huruf pertama', 'Meet your first letter'), S.dibuka.length + ' / 37 ' + B('huruf dibuka', 'letters opened')],
    [S.dibuka.length >= 10, B('Kenal 10 huruf', 'Know 10 letters'), B('Lihat bentuk awal, tengah, akhir', 'See start, middle, end forms')],
    [S.suku, B('Suku kata terbuka', 'Open syllables'), B('با بي بو', 'با بي بو')],
    [S.riwayat.length >= 1, B('Kuiz pertama', 'First quiz'), S.riwayat.length + B(' kuiz dijawab', ' quizzes taken')],
    [terbaik >= .8, B('Skor 80% atau lebih', 'Score 80% or more'), B('Terbaik: ', 'Best: ') + Math.round(terbaik * 100) + '%'],
    [Object.keys(S.bintang).length >= 3, B('Surih 3 huruf', 'Trace 3 letters'), Object.keys(S.bintang).length + B(' huruf disurih', ' letters traced')]
  ];
  const kini = langkah.findIndex(l => !l[0]);
  return barAtas("pergi('utama')", L('perjalanan'), '<button onclick="pergi(\'sembang\')" style="display:flex;gap:4px;align-items:center">' + B('Sembang', 'Chat') + ikon('sembang', 16) + '</button>') +
    '<div class="skrol"><div class="pad"><div class="anggaran"><div class="meta">' + L('masaHari') + '</div><div class="besar" data-masa-hari="' + s + '">00:00</div><div class="meta">' + B('min : saat', 'min : sec') + '</div></div>' +
    '<button class="cikgu-kad" style="width:100%;text-align:left" onclick="pergi(\'sembang\')">' + watak('bunga', 50) + '<span style="flex:1"><span class="meta">' + B('Cikgu anda', 'Your teacher') + '</span><b style="display:block;font-size:15px">Cikgu Jawi</b></span><span class="bintang-k">★ 4.9 <span class="meta">(2.4k)</span></span></button>' +
    '<div class="garis-masa">' + langkah.map((l, n) => '<div class="gm-item naik ' + (l[0] ? 'siap' : n === kini ? 'kini' : '') + '" style="--i:' + n + '">' + esc(l[1]) + '<small>' + esc(l[2]) + '</small></div>').join('') + '</div>' +
    '<button class="btn garis" style="margin-top:10px" onclick="pergi(\'' + (kini === 2 ? 'suku' : kini === 5 ? 'surih' : kini >= 3 ? 'sedia' : 'huruf') + '\')">' + B('Teruskan langkah seterusnya', 'Continue to the next step') + '</button></div></div>';
}

/* ---------- SURIH (pemasa KidRush + kanvas) ---------- */
function skrinSurih() {
  const h = HURUF[T.surih], b = S.bintang[T.surih] || 0;
  return '<div class="surih-latar"><div class="sinar" style="position:absolute;inset:-40%;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.06) 0 10deg,transparent 10deg 20deg)"></div>' +
    '<div class="kuiz-atas"><button class="bulat-k" onclick="hentiSurih();pergi(\'utama\')" aria-label="Kembali">' + ikon('kiri', 20) + '</button><h1 class="besar" style="color:#fff">' + L('surih') + '</h1><button class="bulat-k" onclick="ucap(\'' + h.nama + '\')" aria-label="Dengar">' + ikon('suara', 19) + '</button></div>' +
    '<div class="pilih-masa">' + [30, 60, 120].map(m => '<button class="' + (T.masaSurih === m ? 'aktif' : '') + '" onclick="T.masaSurih=' + m + ';hentiSurih();lukis()">' + String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') + '</button>').join('') + '</div>' +
    '<div class="kad-tebal kanvas-wrap"><canvas data-kanvas width="600" height="560"></canvas>' +
    '<div class="pemasa"><button class="tambah-b" onclick="T.surih=(T.surih+36)%37;hentiSurih();lukis()" aria-label="Sebelum">' + ikon('kiri', 16) + '</button><span class="digit" data-digit>' + String(Math.floor(T.masaSurih / 60)).padStart(2, '0') + '</span><b style="font-size:26px;color:var(--merah)">:</b><span class="digit" data-digit2>' + String(T.masaSurih % 60).padStart(2, '0') + '</span><button class="tambah-b" onclick="T.surih=(T.surih+1)%37;hentiSurih();lukis()" aria-label="Seterusnya">' + ikon('kanan', 16) + '</button></div>' +
    '<div style="text-align:center;font-weight:800;font-size:14px">' + esc(h.nama) + ' · ' + esc(h.bunyi) + ' · ' + (T.surih + 1) + '/37</div></div>' +
    '<div class="bintang3" data-bintang style="margin:12px 0 8px">' + [0, 1, 2].map(n => ikon('bintang', 30, n < b ? '' : 'mati').replace('fill="none"', 'fill="' + (n < b ? '#FFC85A' : 'none') + '"')).join('') + '</div>' +
    '<div style="display:flex;gap:10px;padding:0 18px 30px;margin-top:auto;position:relative"><button class="btn putih" onclick="padamKanvas()">' + ikon('padam', 18) + L('padam') + '</button><button class="btn" style="background:var(--kuning);color:#5A3B00;box-shadow:0 4px 0 #C78F12" onclick="semakSurih()">' + ikon('centang', 18) + L('semak') + '</button></div></div>';
}
let SURIH = { lukis: false, pemasa: null, baki: 0, mula: false };
function sediaKanvas(root, papan) {
  const c = root.querySelector('[data-kanvas]'); if (!c) return;
  const x = c.getContext('2d');
  const panduan = () => {
    x.clearRect(0, 0, c.width, c.height);
    x.fillStyle = '#F5FAFF'; x.fillRect(0, 0, c.width, c.height);
    x.strokeStyle = '#DCEBFA'; x.lineWidth = 2; x.setLineDash([10, 10]);
    for (let y = 140; y < c.height; y += 140) { x.beginPath(); x.moveTo(20, y); x.lineTo(c.width - 20, y); x.stroke(); }
    x.setLineDash([]);
    x.fillStyle = '#CFE5FB'; x.font = '380px "Scheherazade New", serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.direction = 'rtl'; x.fillText(HURUF[T.surih].j, c.width / 2, c.height / 2 + 20);
  };
  c._panduan = panduan;
  if (document.fonts && document.fonts.load) document.fonts.load('380px "Scheherazade New"', HURUF[T.surih].j).then(panduan, panduan); else panduan();
  panduan();
  if (papan) return;
  const pos = ev => { const r = c.getBoundingClientRect(); return [(ev.clientX - r.left) * c.width / r.width, (ev.clientY - r.top) * c.height / r.height]; };
  c.addEventListener('pointerdown', ev => { c.setPointerCapture(ev.pointerId); SURIH.lukis = true; const [a, b] = pos(ev); x.beginPath(); x.moveTo(a, b); x.strokeStyle = '#1E9BF0'; x.lineWidth = 30; x.lineCap = 'round'; x.lineJoin = 'round'; x.lineTo(a + .1, b); x.stroke(); if (!SURIH.mula) mulaPemasa(); });
  c.addEventListener('pointermove', ev => { if (!SURIH.lukis) return; const [a, b] = pos(ev); x.lineTo(a, b); x.stroke(); });
  c.addEventListener('pointerup', () => { SURIH.lukis = false; });
  c.addEventListener('pointercancel', () => { SURIH.lukis = false; });
}
function mulaPemasa() {
  SURIH.mula = true; SURIH.baki = T.masaSurih;
  clearInterval(SURIH.pemasa);
  SURIH.pemasa = setInterval(() => {
    SURIH.baki--; const a = document.querySelector('#telefon [data-digit]'), b = document.querySelector('#telefon [data-digit2]');
    if (a) a.textContent = String(Math.floor(SURIH.baki / 60)).padStart(2, '0'); if (b) b.textContent = String(SURIH.baki % 60).padStart(2, '0');
    if (SURIH.baki <= 0) { clearInterval(SURIH.pemasa); semakSurih(true); }
  }, 1000);
}
function hentiSurih() { clearInterval(SURIH.pemasa); SURIH.mula = false; }
function padamKanvas() { const c = document.querySelector('#telefon [data-kanvas]'); if (c && c._panduan) c._panduan(); hentiSurih(); lukis(); }
function semakSurih(tamat) {
  const c = document.querySelector('#telefon [data-kanvas]'); if (!c) return;
  const w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data;
  const m = document.createElement('canvas'); m.width = w; m.height = h; const mx = m.getContext('2d');
  mx.font = '380px "Scheherazade New", serif'; mx.textAlign = 'center'; mx.textBaseline = 'middle'; mx.direction = 'rtl'; mx.fillStyle = '#000';
  mx.fillText(HURUF[T.surih].j, w / 2, h / 2 + 20);
  const md = mx.getImageData(0, 0, w, h).data;
  let dalam = 0, kena = 0, luar = 0, cat = 0;
  for (let p = 0; p < w * h * 4; p += 16) {
    const huruf = md[p + 3] > 60;
    const biru = d[p + 2] > 200 && d[p] < 90 && d[p + 1] > 120 && d[p + 1] < 190;
    if (huruf) { dalam++; if (biru) kena++; }
    if (biru) { cat++; if (!huruf) luar++; }
  }
  hentiSurih();
  if (!cat) { tunjuk(B('Surih huruf dahulu', 'Trace the letter first'), 'pensel'); return; }
  const liputan = kena / Math.max(1, dalam), sasar = 1 - luar / cat;
  const bintang = liputan > .55 && sasar > .45 ? 3 : liputan > .35 && sasar > .3 ? 2 : liputan > .15 ? 1 : 0;
  S.bintang[T.surih] = Math.max(S.bintang[T.surih] || 0, bintang); tambahMasa(20); simpan();
  const el = document.querySelector('#telefon [data-bintang]');
  if (el) el.innerHTML = [0, 1, 2].map(n => ikon('bintang', 30, n < bintang ? 'lompat-a' : 'mati').replace('fill="none"', 'fill="' + (n < bintang ? '#FFC85A' : 'none') + '"')).join('');
  klik(bintang >= 2 ? 1000 : 400);
  tunjuk((tamat ? B('Masa tamat! ', 'Time\'s up! ') : '') + bintang + B(' bintang · liputan ', ' stars · coverage ') + Math.round(liputan * 100) + '%', 'bintang');
  if (bintang === 3) konfeti();
}

/* ---------- BANTUAN & SEMBANG ---------- */
function skrinBantuan() {
  return barAtas("pergi('profil')", L('bantuan')) + '<div class="skrol"><div class="pad">' +
    '<label class="cari" style="margin-bottom:14px">' + ikon('cari', 18) + '<input placeholder="' + B('Cari bantuan', 'Search for help') + '" oninput="T.cariFaq=this.value.toLowerCase();document.querySelectorAll(\'#telefon .faq\').forEach(f=>f.style.display=f.textContent.toLowerCase().includes(T.cariFaq)?\'\':\'none\')"></label>' +
    '<div class="kad-sembang naik"><h2 class="h2">' + esc(L('sembangJ')) + '</h2><p class="body" style="font-size:12.5px;margin:4px 0 12px;max-width:180px">' + B('Tanya ejaan Jawi bagi perkataan harian.', 'Ask for the Jawi spelling of everyday words.') + '</p><button class="btn kecil" style="background:var(--merah);box-shadow:none" onclick="pergi(\'sembang\')">' + B('Mula', 'Start') + '</button>' + watak('titis', 110, 'apung') + '</div>' +
    '<div class="h3" style="margin:6px 0 2px">' + L('soalan') + '</div>' +
    FAQ.map((f, i) => '<div class="faq ' + (T.faq === i ? 'buka' : '') + '"><button onclick="const p=this.parentNode;const b=!p.classList.contains(\'buka\');document.querySelectorAll(\'#telefon .faq\').forEach(x=>x.classList.remove(\'buka\'));if(b)p.classList.add(\'buka\');T.faq=b?' + i + ':-1;klik(620)">' + esc(B(f.s[0], f.s[1])) + ikon('kanan', 18) + '</button><div class="jwp"><div>' + esc(B(f.j[0], f.j[1])) + '</div></div></div>').join('') +
    '</div></div>';
}
function balasCikgu(teks) {
  const t = teks.trim(), q = t.toLowerCase().replace(/[?!.]/g, '').trim();
  const kRumi = KAMUS.find(k => k[0].toLowerCase() === q);
  if (kRumi) return { teks: B('Perkataan "' + kRumi[0] + '" dalam Jawi ditulis:', '"' + kRumi[0] + '" in Jawi is written:'), jw: kRumi[1] };
  const kJawi = KAMUS.find(k => k[1] === t);
  if (kJawi) return { teks: B('Itu dibaca "' + kJawi[0] + '" (' + kJawi[3] + ').', 'That reads "' + kJawi[0] + '" (' + kJawi[3] + ').') };
  const h = HURUF.find(x => x.j === t || x.nama === q);
  if (h) return { teks: B('Huruf ' + h.nama + ' berbunyi "' + h.bunyi + '". Contoh: ' + h.contoh[0] + '.', 'The letter ' + h.nama + ' sounds "' + h.bunyi + '". Example: ' + h.contoh[0] + '.'), jw: h.j + '  ' + h.contoh[1] };
  if (/^(hai|helo|hello|hi|assalam|salam)/.test(q)) return { teks: B('Hai! Taip perkataan seperti buku, ibu atau kucing, dan saya tunjukkan tulisan Jawinya.', 'Hi! Type a word like buku, ibu or kucing and I will show you its Jawi spelling.') };
  if (/huruf|letter|berapa|how many/.test(q)) return { teks: B('Jawi ada 37 huruf. Enam huruf dicipta khas untuk bahasa Melayu:', 'Jawi has 37 letters. Six were created for Malay:'), jw: 'چ ڠ ڤ ݢ ۏ ڽ' };
  if (/terima kasih|thank/.test(q)) return { teks: B('Sama-sama! Teruskan belajar ya.', 'You are welcome! Keep learning.'), jw: 'تريما کاسيه' };
  return { teks: B('Saya belum kenal "' + t + '". Cuba perkataan dalam kamus: ' + acak(KAMUS).slice(0, 3).map(k => k[0]).join(', ') + '.', 'I don\'t know "' + t + '" yet. Try a dictionary word: ' + acak(KAMUS).slice(0, 3).map(k => k[0]).join(', ') + '.') };
}
function sembangAwal() { return [{ dia: true, teks: B('Assalamualaikum! Saya Cikgu Jawi. Taip perkataan rumi dan saya tunjukkan ejaan Jawinya.', 'Hello! I am Teacher Jawi. Type a Rumi word and I will show you its Jawi spelling.') }]; }
function skrinSembang() {
  if (!T.sembang) T.sembang = sembangAwal();
  return barAtas("pergi('bantuan')", 'Cikgu Jawi', watak('bunga', 34)) +
    '<div class="sembang-isi" data-sembang><div class="meta" style="text-align:center;background:#fff;align-self:center;padding:3px 10px;border-radius:999px">' + B('Hari ini', 'Today') + '</div>' +
    T.sembang.map(m => '<div class="mesej ' + (m.dia ? 'dia' : 'saya') + '">' + esc(m.teks) + (m.jw ? jw(m.jw) : '') + '</div>').join('') + '</div>' +
    '<div class="cadang">' + ['buku', 'kucing', 'Malaysia', B('berapa huruf?', 'how many letters?'), 'ڠ', 'terima kasih'].map(c => '<button onclick="hantarSembang(\'' + c + '\')">' + esc(c) + '</button>').join('') + '</div>' +
    '<div class="input-sembang"><input data-sembang-in placeholder="' + esc(L('taipRumi')) + '" onkeydown="if(event.key===\'Enter\')hantarSembang(this.value)"><button onclick="hantarSembang(document.querySelector(\'#telefon [data-sembang-in]\').value)" aria-label="Hantar">' + ikon('hantar', 18) + '</button></div>';
}
function hantarSembang(teks) {
  if (!teks || !teks.trim()) return;
  T.sembang.push({ dia: false, teks: teks.trim() }); klik(700); lukis();
  const isi = document.querySelector('#telefon [data-sembang]');
  if (isi) { isi.insertAdjacentHTML('beforeend', '<div class="mesej dia menaip"><i></i><i></i><i></i></div>'); isi.scrollTop = isi.scrollHeight; }
  setTimeout(() => { if (S.skrin !== 'sembang') return; T.sembang.push(Object.assign({ dia: true }, balasCikgu(teks))); klik(900); lukis(); const i2 = document.querySelector('#telefon [data-sembang]'); if (i2) i2.scrollTop = i2.scrollHeight; const inp = document.querySelector('#telefon [data-sembang-in]'); if (inp) inp.focus(); }, 750);
}

/* ---------- TAPIS (Filters) ---------- */
function skrinTapis() {
  const susun = [['abjad', B('Susunan abjad Jawi', 'Jawi alphabet order')], ['nama', B('Nama A – Z', 'Name A – Z')], ['suka', B('Disukai dahulu', 'Liked first')]];
  const jenis = [['semua', B('Semua', 'All')], ['melayu', B('Melayu', 'Malay')], ['arab', B('Arab', 'Arabic')], ['suka', B('Disukai', 'Liked')], ['sambung', B('Sambung', 'Joining')], ['tak', B('Tak sambung', 'Non-joining')]];
  return barAtas("pergi('huruf')", L('tapis'), '<button onclick="T.susun=\'abjad\';T.jenis=\'semua\';T.bil=5;lukis()">' + L('set') + '</button>') + '<div class="skrol"><div class="pad">' +
    '<div class="h3" style="margin:6px 0 4px">' + L('susun') + '</div>' + susun.map(s => '<button class="tapis-baris ' + (T.susun === s[0] ? 'aktif' : '') + '" onclick="T.susun=\'' + s[0] + '\';klik(640);lukis()">' + s[1] + (T.susun === s[0] ? ikon('centang', 18) : '') + '</button>').join('') +
    '<div class="h3" style="margin:20px 0 10px">' + B('Jenis huruf', 'Letter type') + '</div><div class="cip-grid" style="grid-template-columns:repeat(3,1fr)">' + jenis.map(j => '<button class="cip ' + (T.jenis === j[0] ? 'aktif' : '') + '" onclick="T.jenis=\'' + j[0] + '\';klik(640);lukis()">' + j[1] + '</button>').join('') + '</div>' +
    '<div class="h3" style="margin:22px 0 4px">' + B('Bilangan soalan kuiz', 'Quiz questions') + '</div><div style="display:flex;justify-content:space-between" class="meta"><span>5</span><b style="color:var(--biru)" data-bil>' + T.bil + '</b><span>15</span></div>' +
    '<input type="range" class="julat" min="5" max="15" step="5" value="' + T.bil + '" oninput="T.bil=+this.value;document.querySelector(\'#telefon [data-bil]\').textContent=this.value">' +
    '<div class="meta" style="margin-top:14px">' + senaraiHuruf().length + B(' huruf sepadan', ' matching letters') + '</div>' +
    '<button class="btn" style="margin-top:20px" onclick="pergi(\'huruf\')">' + L('guna') + '</button></div></div>';
}

/* ---------- PROFIL (Account) ---------- */
function skrinProfil() {
  const m = [
    ['orang', B('Profil saya', 'My profile'), "tunjuk(B('Nama: ','Name: ')+(S.nama||'-'),'orang')"],
    ['sejarah', L('sejarah') + ' (' + S.riwayat.length + ')', "pergi('perjalanan')"],
    ['buku', L('kamus'), "pergi('perkataan')"],
    ['hati', B('Huruf disukai', 'Liked letters') + ' (' + S.suka.length + ')', "T.jenis='suka';pergi('huruf')"],
    ['pensel', L('surih'), "pergi('surih')"],
    ['sembang', L('bantuan'), "pergi('bantuan')"],
    ['info', L('tentang'), "tunjuk('JawiKu v1 · 37 huruf · ' + KAMUS.length + B(' perkataan',' words'),'info')"]
  ];
  return '<div class="skrol"><div class="profil-atas anim"><span class="avatar">' + watak('bunga', 60) + '</span><div><div class="h2">' + esc(S.nama || 'Murid') + '</div><div class="meta">' + esc(S.emel || B('Akaun tetamu', 'Guest account')) + '</div></div></div>' +
    '<div class="menu-baris"><span class="kiri-m">' + ikon('dunia', 20) + L('bahasa') + '</span>' + pilBahasa() + '</div>' +
    '<div class="menu-baris"><span class="kiri-m">' + ikon('suara', 20) + B('Bunyi', 'Sound') + '</span><button class="bahasa-pil" onclick="S.bunyi=!S.bunyi;simpan();lukis()"><span class="' + (S.bunyi ? 'aktif' : '') + '" style="font-size:11.5px;font-weight:900;padding:5px 10px;border-radius:999px;' + (S.bunyi ? 'background:var(--biru);color:#fff' : '') + '">' + (S.bunyi ? B('Hidup', 'On') : B('Mati', 'Off')) + '</span></button></div>' +
    m.map((x, i) => '<button class="menu-baris naik" style="--i:' + i + '" onclick="' + x[2] + '"><span class="kiri-m">' + ikon(x[0], 20) + esc(x[1]) + '</span>' + ikon('kanan', 18) + '</button>').join('') +
    '<button class="menu-baris" style="color:var(--merah)" onclick="S.nama=\'\';simpan();pergi(\'sambut\')"><span class="kiri-m">' + ikon('keluar', 20).replace('class="ik ', 'style="color:var(--merah)" class="ik ') + L('keluar') + '</span></button>' +
    '<div style="height:20px"></div></div>' + nav('profil');
}

/* ---------- CARI (dengan papan kekunci Jawi) ---------- */
function papanKekunci(sasaran) {
  if (sasaran === 'lupa') return '';
  return '<div class="kekunci">' + HURUF.map(h => '<button onclick="taipJawi(\'' + h.j + '\')">' + h.j + '</button>').join('') +
    '<button class="fn" onclick="taipJawi(\'⌫\')" aria-label="Padam">⌫</button><button class="fn ruang" onclick="taipJawi(\' \')">' + B('ruang', 'space') + '</button><button class="fn" style="grid-column:span 2" onclick="T.papan=false;lukis()">ABC</button></div>';
}
function hasilCari() {
  const q = T.cari.trim(); const ql = q.toLowerCase();
  if (!q) return '<div class="meta" style="margin:6px 0">' + L('terkini') + '</div>' + ['buku', 'bunga', 'ڤ'].map(x => '<button class="cadangan-c" onclick="T.cari=\'' + x + '\';lukis()"><span>' + ikon('sejarah', 16).replace('class="ik ', 'style="display:inline;vertical-align:-3px;margin-right:8px;color:var(--muted)" class="ik ') + esc(x) + '</span>' + ikon('kanan', 16) + '</button>').join('');
  const h = HURUF.map((x, i) => [x, i]).filter(([x]) => x.j === q || x.nama.startsWith(ql)).slice(0, 4);
  const k = KAMUS.filter(x => x[0].toLowerCase().includes(ql) || x[1].includes(q) || x[3].toLowerCase().includes(ql)).slice(0, 8);
  if (!h.length && !k.length) return '<p class="body" style="text-align:center;padding:20px 0">' + B('Tiada hasil untuk', 'No results for') + ' “' + esc(q) + '”</p>';
  return h.map(([x, i]) => '<button class="cadangan-c naik" onclick="pergi(\'detail\',{huruf:' + i + '})"><span><b>' + esc(x.nama) + '</b> <em>· ' + B('huruf', 'letter') + '</em></span>' + jw(x.j) + '</button>').join('') +
    k.map((x, n) => '<button class="cadangan-c naik" style="--i:' + n + '" onclick="ucap(\'' + esc(x[0]) + '\')"><span><b>' + esc(x[0]) + '</b> <em>· ' + esc(x[3]) + '</em></span>' + jw(x[1]) + '</button>').join('');
}
function skrinCari() {
  return '<div class="baris-cari" style="padding-top:4px"><button class="kembali-btn" onclick="pergi(\'utama\')" aria-label="Kembali">' + ikon('kiri', 22) + '</button><label class="cari">' + ikon('cari', 18) +
    '<input data-cari value="' + esc(T.cari) + '" placeholder="' + esc(T.papan ? L('taip') : L('cari')) + '" ' + (T.papan ? 'readonly' : '') + ' oninput="T.cari=this.value;document.querySelector(\'#telefon [data-hasil]\').innerHTML=hasilCari()" style="' + (/[؀-ۿ]/.test(T.cari) ? 'font-family:var(--j);font-size:20px;direction:rtl' : '') + '">' +
    (T.cari ? '<button onclick="T.cari=\'\';lukis()" style="color:var(--merah)" aria-label="Kosongkan">' + ikon('tutup', 16) + '</button>' : '') + '</label>' +
    '<button class="btn-tapis" onclick="T.papan=!T.papan;lukis()" aria-label="Papan kekunci Jawi">' + ikon('papan', 20) + '</button></div>' +
    '<div class="skrol"><div class="pad" data-hasil>' + hasilCari() + '</div></div>' + (T.papan ? papanKekunci('cari') : '');
}
function taipJawi(h) {
  klik(760);
  if (h === '⌫') T.cari = [...T.cari].slice(0, -1).join(''); else T.cari += h;
  const i = document.querySelector('#telefon [data-cari]'); if (i) { i.value = T.cari; i.style.fontFamily = 'var(--j)'; i.style.fontSize = '20px'; i.style.direction = 'rtl'; }
  const r = document.querySelector('#telefon [data-hasil]'); if (r) r.innerHTML = hasilCari();
}

/* ============================================================
   LUKIS
   ============================================================ */
const SKRIN = { splash: skrinSplash, onb: skrinOnb, sambut: skrinSambut, cipta: skrinCipta, masuk: skrinMasuk, lupa: skrinLupa, utama: skrinUtama, cabaran: skrinCabaran, huruf: skrinHuruf, detail: skrinDetail, suku: skrinSuku, perkataan: skrinPerkataan, beg: skrinBeg, sedia: () => skrinSedia(''), kuiz: skrinKuiz, tahniah: skrinTahniah, perjalanan: skrinPerjalanan, surih: skrinSurih, bantuan: skrinBantuan, sembang: skrinSembang, tapis: skrinTapis, profil: skrinProfil, cari: skrinCari };
function htmlSkrin() {
  if (S.skrin === 'kuiz' && !T.kuiz) { T.kuiz = { soal: [0, 1, 2, 3, 4].map(() => buatSoalan('campur')), i: 0, pilih: null, betul: 0, mula: Date.now() }; }
  const biru = ['kuiz', 'surih'].includes(S.skrin) ? 'biru' : '';
  return '<div class="skrin ' + biru + '"><div class="takuk"></div>' + barStatus() + '<div class="paparan anim">' + (SKRIN[S.skrin] || skrinUtama)() + '</div><div class="garis-rumah"></div></div>';
}
let pemasaSplash = null;
function lukis() {
  clearTimeout(pemasaSplash); clearTimeout(pemasaSoal);
  if (S.skrin !== 'surih') hentiSurih();
  const tel = document.getElementById('telefon');
  tel.innerHTML = htmlSkrin();
  hidupkan(tel, false);
  kemasSisi();
  if (S.skrin === 'splash') pemasaSplash = setTimeout(() => { if (S.skrin === 'splash') { S.onb = 0; pergi('onb'); } }, 3200);
  if (S.skrin === 'kuiz' && T.kuiz && T.kuiz.pilih === null) {
    const bar = tel.querySelector('[data-masa]');
    if (bar) { bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = 'transform 15s linear'; bar.style.transform = 'scaleX(0)'; })); }
    pemasaSoal = setTimeout(() => jawab(-1), 15000);
  }
}
function hidupkan(root, papan) {
  root.querySelectorAll('.skrol').forEach(s => {
    const it = s.querySelectorAll('.sr');
    if (papan || !('IntersectionObserver' in window)) { it.forEach(x => x.classList.add('nampak')); return; }
    const io = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('nampak'); io.unobserve(x.target); } }), { root: s, threshold: .08 });
    it.forEach(x => io.observe(x));
  });
  root.querySelectorAll('[data-masa-hari]').forEach(el => {
    const akhir = +el.dataset.masaHari; const f = v => String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0');
    if (papan) { el.textContent = f(akhir); return; }
    const t0 = performance.now(); const go = now => { const p = Math.min(1, (now - t0) / 1000); el.textContent = f(Math.round(akhir * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(go); }; requestAnimationFrame(go);
  });
  sediaKanvas(root, papan);
  const sm = root.querySelector('[data-sembang]'); if (sm) sm.scrollTop = sm.scrollHeight;
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
  ['splash', 'Pembuka'], ['onb0', 'Onboarding 1'], ['onb1', 'Onboarding 2'], ['onb2', 'Onboarding 3'], ['sambut', 'Sambutan'], ['cipta', 'Cipta akaun'],
  ['masuk', 'Log masuk'], ['lupa', 'Lupa kata laluan'], ['utama', 'Utama'], ['cabaran', 'Cabaran'], ['huruf', 'Semua huruf'], ['detail', 'Detail huruf'],
  ['perkataan', 'Kamus'], ['suku', 'Suku kata'], ['beg', 'Beg latihan'], ['begkosong', 'Beg kosong'], ['sedia', 'Sedia kuiz'], ['tahniah', 'Tahniah'],
  ['kuiz', 'Kuiz'], ['perjalanan', 'Perjalanan'], ['surih', 'Surih huruf'], ['bantuan', 'Bantuan'], ['sembang', 'Cikgu Jawi'], ['tapis', 'Tapis'],
  ['profil', 'Akaun'], ['cari', 'Cari + papan Jawi']
];
function sediaDemo(k) {
  const now = Date.now();
  S = Object.assign(keadaanAsal(), { bahasa: S.bahasa, nama: 'Aisyah', emel: 'aisyah@contoh.my', suka: [1, 20, 22], beg: [{ t: 'h', k: 20 }, { t: 'p', k: 'bunga' }, { t: 'p', k: 'buku' }, { t: 'h', k: 22 }],
    dibuka: [0, 1, 2, 4, 5, 8, 10, 12, 20, 22, 24, 25], suku: true, riwayat: [{ betul: 4, jum: 5, mod: 'campur', ts: now - 3.6e6 }], saat: { [hariIni()]: 330 }, bintang: { 1: 3, 20: 2 } });
  T = Object.assign(T, { huruf: 20, kat: 'semua', jenis: 'semua', susun: 'abjad', bil: 5, mod: 'campur', cari: '', papan: true, faq: 1, galat: '', surih: 4, masaSurih: 30, hasil: null, kuiz: null, sembang: null });
  FORM = {};
  if (k.startsWith('onb')) { S.skrin = 'onb'; S.onb = +k.slice(3); }
  else if (k === 'begkosong') { S.skrin = 'beg'; S.beg = []; }
  else if (k === 'kuiz') { S.skrin = 'kuiz'; T.kuiz = { soal: [{ jenis: 'j2r', tanya: 'بوڠا', jawapan: 'bunga', pilihan: ['buku', 'bunga', 'bola', 'burung'] }], i: 0, pilih: 1, betul: 2, mula: now }; }
  else if (k === 'tahniah') { S.skrin = 'tahniah'; T.hasil = { betul: 4, jum: 5 }; }
  else if (k === 'sembang') { S.skrin = 'sembang'; T.sembang = sembangAwal().concat([{ dia: false, teks: 'kucing' }, { dia: true, teks: B('Perkataan "kucing" dalam Jawi ditulis:', '"kucing" in Jawi is written:'), jw: 'کوچيڠ' }]); }
  else if (k === 'cari') { S.skrin = 'cari'; T.cari = 'بو'; }
  else if (k === 'cipta') { S.skrin = 'cipta'; FORM = { nama: 'Aisyah', emel: 'aisyah@contoh.my' }; }
  else S.skrin = k;
}
function lukisPapan() {
  const sS = JSON.stringify(S), sT = Object.assign({}, T), sF = FORM;
  PAPAN = true;
  const grid = document.getElementById('papan-grid');
  grid.innerHTML = SENARAI_PAPAN.map(([k, l], i) => '<div class="papan-item" data-k="' + k + '"><div class="lbl-p"><i>' + String(i + 1).padStart(2, '0') + '</i>' + l + '</div><div class="mini-tel" onclick="bukaDariPapan(\'' + k + '\')"><div class="skala"></div></div></div>').join('');
  grid.querySelectorAll('.papan-item').forEach(it => { sediaDemo(it.dataset.k); const sk = it.querySelector('.skala'); sk.innerHTML = htmlSkrin(); hidupkan(sk, true); });
  S = JSON.parse(sS); T = sT; FORM = sF; PAPAN = false;
}
function bukaDariPapan(k) {
  tukarMod('app');
  if (!S.nama && !['splash', 'onb0', 'onb1', 'onb2', 'sambut', 'cipta', 'masuk', 'lupa'].includes(k)) S.nama = 'Aisyah';
  if (k.startsWith('onb')) { S.onb = +k.slice(3); pergi('onb'); return; }
  if (k === 'kuiz') { mulaKuiz(); return; }
  if (k === 'begkosong') k = 'beg';
  if (k === 'tahniah' && !T.hasil) T.hasil = { betul: 4, jum: 5 };
  pergi(k);
}
function tukarMod(m) {
  const p = m === 'papan';
  document.body.classList.toggle('papan', p);
  try { history.replaceState(null, '', p ? '#papan' : location.pathname + location.search); } catch (e) {}
  if (p) { clearTimeout(pemasaSplash); clearTimeout(pemasaSoal); lukisPapan(); window.scrollTo(0, 0); }
  kemasSisi();
}
function kemasSisi() {
  const s = document.getElementById('sisi'); if (!s) return;
  const lompat = [['splash', 'Pembuka'], ['onb', 'Onboarding'], ['sambut', 'Sambutan'], ['cipta', 'Cipta akaun'], ['masuk', 'Log masuk'], ['utama', 'Utama'], ['cabaran', 'Cabaran'], ['huruf', 'Huruf'], ['detail', 'Detail'], ['perkataan', 'Kamus'], ['suku', 'Suku kata'], ['beg', 'Beg'], ['sedia', 'Sedia'], ['kuiz', 'Kuiz'], ['perjalanan', 'Perjalanan'], ['surih', 'Surih'], ['bantuan', 'Bantuan'], ['sembang', 'Sembang'], ['tapis', 'Tapis'], ['profil', 'Akaun'], ['cari', 'Cari']];
  s.innerHTML = '<div class="logo-sisi">' + ombak('JawiKu') + '</div><p>' + B('App belajar tulisan Jawi: 37 huruf dengan 4 bentuk, suku kata, ' + KAMUS.length + ' perkataan, kuiz, surih huruf dan Cikgu Jawi. Bahasa Melayu & English.', 'Jawi learning app: 37 letters with 4 forms, syllables, ' + KAMUS.length + ' words, quizzes, tracing and Teacher Jawi. Malay & English.') + '</p>' +
    '<div class="mod-tukar"><button class="aktif">App</button><button onclick="tukarMod(\'papan\')">' + B('Semua skrin', 'All screens') + '</button></div>' +
    '<div class="tajuk-k">' + L('bahasa') + '</div>' + pilBahasa() +
    '<div class="tajuk-k">' + B('Lompat ke skrin', 'Jump to screen') + '</div><div class="lompat">' + lompat.map(([k, l]) => '<button class="' + (S.skrin === k ? 'aktif' : '') + '" onclick="lompatSisi(\'' + k + '\')">' + l + '</button>').join('') + '</div>' +
    '<div class="nota-kecil">' + B('Buka di telefon, pilih "Tambah ke Skrin Utama" untuk pasang app. Kemajuan disimpan dalam peranti.', 'Open on your phone and choose "Add to Home Screen" to install. Progress stays on your device.') + '</div>';
}
function lompatSisi(k) {
  if (!S.nama && !['splash', 'onb', 'sambut', 'cipta', 'masuk', 'lupa'].includes(k)) S.nama = 'Aisyah';
  if (k === 'onb') S.onb = 0;
  if (k === 'kuiz') { mulaKuiz(); return; }
  pergi(k);
}

/* ============================================================
   MULA
   ============================================================ */
muat();
(function () {
  const s = new URLSearchParams(location.search).get('s');
  if (s && SKRIN[s]) { if (!S.nama && !['splash', 'onb', 'sambut', 'cipta', 'masuk', 'lupa'].includes(s)) S.nama = 'Aisyah'; S.skrin = s; }
  else S.skrin = S.nama ? 'utama' : 'splash';
  lukis();
  if (location.hash === '#papan') tukarMod('papan');
  window.__j = { pergi: k => lompatSisi(k), S: () => S, T: () => T };
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
})();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && window.self === window.top) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
