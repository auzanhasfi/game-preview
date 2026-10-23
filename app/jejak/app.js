/* ============================================================
   jejak. — app Sejarah Malaysia (PWA, tanpa build)
   Susunan: keadaan -> pembantu -> skrin -> lapisan -> lukis -> papan
   ============================================================ */

const KUNCI_SIMPAN = 'jejak-sejarah-v1';
const AKSEN = {
  lime:  ['#D7F25C', '#C6E63C', '#F5FBD6'],
  cyan:  ['#9FE5F0', '#7AD6E5', '#E8F9FC'],
  pic:   ['#FFC98F', '#FFB46B', '#FFF3E6'],
  jambu: ['#FFB9DA', '#FF9CCB', '#FFEEF6']
};

function keadaanAsal() {
  return {
    skrin: 'splash', onb: 0, nama: '', emel: '', tingkatan: 'Tingkatan 4', sasaran: 15,
    kunci: false, bunyi: true, aksen: 'lime',
    siap: {}, kuizSkor: {}, nota: [], simpan: [], aktiviti: [], hari: [], xp: 0
  };
}
let S = keadaanAsal();
/* keadaan sementara (tidak disimpan) */
let T = { era: 'melaka', pel: 0, lapis: null, kuiz: null, hasil: null, cariTeks: '', gmTapis: 'semua', gmBuka: -1, tokoh: 0, nomborInput: '', capOk: false, muatAkaun: false, tambahAkaun: false, notaLabel: [] };
let PAPAN = false;

function simpan() { if (PAPAN) return; try { localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(S)); } catch (e) {} }
function muat() {
  try {
    const d = JSON.parse(localStorage.getItem(KUNCI_SIMPAN) || 'null');
    if (d && typeof d === 'object') S = Object.assign(keadaanAsal(), d);
  } catch (e) {}
}

/* ---------- pembantu ---------- */
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function eraIkut(id) { return ERA.find(e => e.id === id) || ERA[0]; }
function bilSiap(id) { return (S.siap[id] || []).length; }
function jumlahPelajaran() { return ERA.reduce((a, e) => a + e.pelajaran.length, 0); }
function jumlahSiap() { return ERA.reduce((a, e) => a + bilSiap(e.id), 0); }
function inisial(n) { return (n || 'Tetamu').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
function namaPendek() { return (S.nama || 'Tetamu').split(' ')[0]; }
function hariIni() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function jamKini() { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
function streak() {
  const set = new Set(S.hari); let n = 0; const d = new Date();
  while (set.has(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function catatAktiviti(jenis, tajuk, sub, xp) {
  S.aktiviti.unshift({ jenis, tajuk, sub, xp, masa: Date.now() });
  S.aktiviti = S.aktiviti.slice(0, 20);
  S.xp += xp;
  if (!S.hari.includes(hariIni())) S.hari.push(hariIni());
}
function masaRelatif(ts) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'Baru tadi';
  if (m < 60) return m + ' min lalu';
  if (m < 1440) return Math.round(m / 60) + ' jam lalu';
  return Math.round(m / 1440) + ' hari lalu';
}
function warnaEra(e) { return { lime: 'lime', violet: 'violet', lilac: 'lilac', coral: 'coral', ink: 'ink' }[e.warna]; }
function dedah(teks, mula) {
  let i = mula || 0;
  return '<span class="dedah">' + esc(teks).split(' ').map(w => '<span class="k"><span style="--i:' + (i++) + '">' + w + '</span></span>').join(' ') + '</span>';
}
function para(teks) {
  return esc(teks).replace(/\{\{([^}]+)\}\}/g, (m, k) => '<span class="istilah" data-istilah="' + k + '" onclick="bukaIstilah(this)">' + k + '</span>');
}
function bilIstilah(p) { return p.isi.join(' ').split('{{').length - 1; }

/* bunyi klik kecil (Web Audio, tanpa fail) */
let audio = null;
function klik(nada) {
  if (!S.bunyi || PAPAN) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = 'sine'; o.frequency.value = nada || 660;
    g.gain.setValueAtTime(.06, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .12);
    o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + .13);
  } catch (e) {}
}
function tunjuk(mesej, ik) {
  const sk = document.querySelector('#telefon .skrin'); if (!sk) return;
  sk.querySelectorAll('.toast').forEach(t => t.remove());
  sk.insertAdjacentHTML('beforeend', '<div class="toast">' + ikon(ik || 'semak', 16) + esc(mesej) + '</div>');
  setTimeout(() => { const t = sk.querySelector('.toast'); if (t) t.remove(); }, 2500);
}
function konfeti(root) {
  const sk = root || document.querySelector('#telefon .skrin'); if (!sk) return;
  const w = ['var(--lime)', 'var(--violet)', 'var(--coral)', '#fff', 'var(--lilac)'];
  let h = '<div class="konfeti">';
  for (let i = 0; i < 60; i++) {
    const bentuk = i % 3 === 0 ? 'border-radius:50%' : i % 3 === 1 ? 'height:3px;width:14px' : '';
    h += '<i style="left:' + (Math.random() * 100) + '%;background:' + w[i % w.length] + ';' + bentuk + ';--x:' + (Math.random() * 120 - 60) + 'px;--y:' + (500 + Math.random() * 400) + 'px;--r:' + (Math.random() * 720) + 'deg;--t:' + (1.6 + Math.random() * 1.4) + 's;--d:' + (Math.random() * .4) + 's"></i>';
  }
  sk.insertAdjacentHTML('beforeend', h + '</div>');
  setTimeout(() => { const k = sk.querySelector('.konfeti'); if (k) k.remove(); }, 3600);
}

/* ---------- navigasi ---------- */
function pergi(skrin, data) {
  klik(520);
  Object.assign(T, data || {});
  T.lapis = null;
  S.skrin = skrin;
  if (!['splash', 'hasil'].includes(skrin)) simpan();
  lukis();
}
function tekanTab(id) { pergi(id); }

/* ---------- bar status & bar atas ---------- */
function barStatus() {
  return '<div class="bar-status"><span>' + jamKini() + '</span><span class="kanan">' +
    '<span class="isyarat"><i style="height:4px"></i><i style="height:6px"></i><i style="height:8px"></i><i style="height:10px"></i></span>' +
    '<span class="bateri"></span></span></div>';
}
function barAtas(kembali, kanan) {
  return '<div class="bar-atas"><button class="kembali" onclick="' + kembali + '">' + ikon('balik', 20) + 'Kembali</button>' + (kanan || '<span></span>') + '</div>';
}

/* ============================================================
   SKRIN
   ============================================================ */

function skrinSplash() {
  const p = [
    ['sasaran', 'bulat', 'violet', 56, 'top:58px;right:46px;--r:12deg;--m:.15s;--t:7s'],
    ['mahkota', 'gerigi', 'lime', 84, 'top:150px;left:-18px;--r:-14deg;--m:.3s;--t:6s'],
    ['bintang', 'bunga', 'violet', 70, 'top:330px;right:-14px;--r:20deg;--m:.45s;--t:8s'],
    ['skrol', 'segi', 'lime', 62, 'bottom:250px;left:30px;--r:8deg;--m:.6s;--t:7s'],
    ['bendera', 'gerigi', 'violet', 96, 'bottom:110px;left:-26px;--r:-8deg;--m:.75s;--t:9s'],
    ['kapal', 'bulat', 'coral', 60, 'bottom:150px;right:40px;--r:-12deg;--m:.9s;--t:6.5s']
  ];
  return '<div class="splash">' + p.map(x => pelekat(x[0], x[1], x[2], x[3], '', x[4])).join('') +
    '<div class="logo"><span class="titik-logo">.</span>jejak<svg viewBox="0 0 100 14" preserveAspectRatio="none"><path pathLength="1" d="M2 8c8-6 12 6 20 0s12 6 20 0 12 6 20 0 12 6 20 0 12 6 16 0"/></svg></div>' +
    '<div class="sub">SEJARAH MALAYSIA</div><div class="muat-bar"><i></i></div></div>';
}

const ONB = [
  { t: ['Menghafal', 'tarikh', 'itu', 'memenatkan,', 'tapi', 'bagaimana', 'kalau', 'ia', 'seronok?'], ik: ['bintang', 'gerigi', 'lime'], penanda: 8, petik: 'Belajar sejarah, satu kisah setiap hari.' },
  { t: ['Penuhkan', 'minda,', 'dan', 'ketahui', 'dari', 'mana', 'negara', 'kita', 'bermula.'], ik: ['mahkota', 'bunga', 'violet'], penanda: 6, petik: 'Dari Gua Niah hingga 16 September 1963.' },
  { t: ['Mengingati', 'setiap', 'peristiwa', 'kini', 'lebih', 'mudah', 'daripada', 'sebelumnya!'], ik: ['kalendar', 'segi', 'lilac'], penanda: 5, petik: 'Garis masa, kuiz dan nota dalam satu tempat.' }
];
function skrinOnb() {
  const o = ONB[S.onb];
  let i = 0;
  const kata = o.t.map((w, n) => {
    const isi = '<span class="k"><span style="--i:' + (i++) + '">' + (n === o.penanda ? '<span class="penanda-lime">' + esc(w) + '</span>' : esc(w)) + '</span></span>';
    return isi;
  }).join(' ');
  const akhir = S.onb === ONB.length - 1;
  return '<div class="onb">' +
    '<button class="langkau" onclick="pergi(\'mula\')">Langkau</button>' +
    '<div class="teks-onb" key="' + S.onb + '"><h1 class="d1 dedah">' + kata + ' ' + pelekat(o.ik[0], o.ik[1], o.ik[2], 46, 'sebaris goyang') + '</h1>' +
    '<p class="petik">' + esc(o.petik) + '</p></div>' +
    '<button class="zon-ketuk" aria-label="Seterusnya" onclick="lanjutOnb()"></button>' +
    '<div class="bawah-onb">' + (akhir ? '<button class="btn" onclick="pergi(\'mula\')">Mula sekarang ' + ikon('kanan', 18, 'gerak') + '</button>' : '') +
    '<div class="titik-titik">' + ONB.map((x, n) => '<i class="' + (n === S.onb ? 'aktif' : '') + '"></i>').join('') + '</div></div></div>';
}
function lanjutOnb() {
  if (S.onb < ONB.length - 1) { S.onb++; klik(600); lukis(); } else pergi('mula');
}

function skrinMula() {
  const p = [
    ['skrol', 'segi', 'lime', 58, 'top:22px;left:20px;--r:-12deg;--t:6s'],
    ['mahkota', 'gerigi', 'lime', 66, 'top:30px;left:150px;--r:10deg;--t:7s;--dl:.4s'],
    ['bintang', 'bunga', 'violet', 54, 'top:96px;right:28px;--r:16deg;--t:8s'],
    ['kapal', 'gerigi', 'lime', 74, 'top:150px;left:66px;--r:-6deg;--t:6.5s;--dl:.8s'],
    ['bendera', 'bulat', 'violet', 50, 'top:190px;right:96px;--r:8deg;--t:7.5s'],
    ['kalendar', 'segi', 'lime', 48, 'top:118px;left:-14px;--r:20deg;--t:9s'],
    ['api', 'gerigi', 'coral', 56, 'top:220px;right:-10px;--r:-18deg;--t:6s;--dl:.2s']
  ];
  return '<div class="skrol"><div class="kepala-corak">' + p.map(x => pelekat(x[0], x[1], x[2], x[3], 'apung', x[4])).join('') + '</div>' +
    '<div class="pad" style="margin-top:-8px">' +
    '<div class="logo-p anim">.j</div>' +
    '<h1 class="h1" style="margin-top:14px">' + dedah('Mari bermula') + '</h1>' +
    '<p class="body anim" style="margin-top:6px;animation-delay:.2s">Daftar untuk menjejak kemajuan, menyimpan nota dan mengumpul lencana sejarah anda.</p>' +
    '<div style="display:flex;flex-direction:column;gap:10px;margin-top:22px" class="anim">' +
    '<button class="btn" onclick="bukaLapis(\'akaun\')">' + logoG() + 'Masuk dengan Google</button>' +
    '<div class="baris-sosial"><button onclick="masukTetamu()" aria-label="E-mel">' + ikon('emel', 20) + '</button>' +
    '<button onclick="masukTetamu()" aria-label="Telefon">' + ikon('telefon', 20) + '</button>' +
    '<button onclick="masukTetamu()" aria-label="Tetamu">' + ikon('tetamu', 20) + '</button></div></div>' +
    '<p class="meta" style="text-align:center;margin-top:22px">Sudah ada akaun? <button class="btn-teks" onclick="bukaLapis(\'akaun\')">Log masuk</button></p>' +
    '</div></div>';
}
function logoG() {
  return '<svg class="g-logo" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z"/></svg>';
}
function masukTetamu() { S.nama = S.nama || 'Tetamu'; S.emel = ''; pergi('kunci'); }

function skrinKunci() {
  return '<div class="skrol"><div class="pad" style="padding-top:110px;text-align:center">' +
    '<div class="cap-besar">' + ikon('cap', 76, 'lukis') + '</div>' +
    '<h1 class="h2" style="margin-top:22px">' + dedah('Lindungi data jejak anda') + '</h1>' +
    '<p class="body" style="margin-top:8px">Hidupkan pengesahan biometrik supaya kemajuan anda selamat dan log masuk lebih pantas setiap kali.</p>' +
    '<div class="baris-suis" style="margin-top:22px;text-align:left">' + ikon('kunci', 18) + '<span style="flex:1">Hidupkan biometrik</span>' +
    '<button class="suis ' + (S.kunci ? 'on' : '') + '" onclick="togolKunci()" aria-label="Togol biometrik"></button></div>' +
    '</div></div><div class="pad" style="padding-bottom:30px"><button class="btn" onclick="pergi(\'tahap\')">Teruskan</button></div>';
}
function togolKunci() {
  if (S.kunci) { S.kunci = false; simpan(); lukis(); return; }
  T.capOk = false; bukaLapis('cap');
  setTimeout(() => { if (T.lapis !== 'cap') return; T.capOk = true; klik(880); lukis(); setTimeout(() => { if (T.lapis === 'cap') { S.kunci = true; T.lapis = null; simpan(); lukis(); tunjuk('Biometrik dihidupkan'); } }, 800); }, 1700);
}

function skrinTahap() {
  const pilihan = ['Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5', 'Umum / dewasa'];
  return '<div class="skrol"><div class="pad" style="padding-top:96px;text-align:center">' +
    '<div style="position:relative;height:110px;width:200px;margin:0 auto">' +
    pelekat('skrol', 'segi', 'lime', 70, 'apung', 'position:absolute;left:10px;top:20px;--r:-10deg') +
    pelekat('mahkota', 'gerigi', 'violet', 84, 'apung', 'position:absolute;left:62px;top:0;--r:6deg;--dl:.3s') +
    pelekat('bendera', 'bunga', 'lime', 64, 'apung', 'position:absolute;right:6px;top:36px;--r:14deg;--dl:.6s') + '</div>' +
    '<h1 class="h2" style="margin-top:20px">' + dedah('Pilih tahap pembelajaran') + '</h1>' +
    '<p class="body" style="margin-top:8px">Pilih tingkatan anda. Kandungan akan disusun mengikut keperluan peperiksaan.</p>' +
    '<div class="pilih-wrap" style="margin-top:22px;text-align:left"><select class="input" onchange="S.tingkatan=this.value;simpan();klik(700)">' +
    pilihan.map(p => '<option ' + (p === S.tingkatan ? 'selected' : '') + '>' + p + '</option>').join('') + '</select>' + ikon('bawah', 18) + '</div>' +
    '</div></div><div class="pad" style="padding-bottom:30px"><button class="btn" onclick="T.nomborInput=\'\';pergi(\'sasaran\')">Teruskan</button></div>';
}

function skrinSasaran() {
  const v = T.nomborInput || String(S.sasaran);
  return '<div class="skrol"><div class="pad" style="padding-top:70px;text-align:center">' +
    pelekat('jam', 'gerigi', 'lime', 74, 'goyang') +
    '<h1 class="h2" style="margin-top:16px">' + dedah('Tetapkan sasaran harian') + '</h1>' +
    '<p class="body" style="margin-top:6px">Berapa minit sehari anda mahu belajar sejarah?</p>' +
    '<div class="nombor-besar"><span class="unit">MINIT</span><span class="nilai" data-nilai>' + esc(v) + '</span><span class="kursor"></span></div>' +
    '<div class="cadangan">' + [5, 10, 15, 30].map(n => '<button class="cip ' + (String(n) === v ? 'aktif' : '') + '" onclick="setMinit(\'' + n + '\')">' + n + ' min</button>').join('') + '</div>' +
    '</div></div>' +
    '<div class="pad-kekunci">' +
    ['1', '2', '3'].map(k => '<button onclick="taipMinit(\'' + k + '\')">' + k + '</button>').join('') + '<button class="fn padam-k" onclick="taipMinit(\'del\')" aria-label="Padam">' + ikon('kiri', 18) + '</button>' +
    ['4', '5', '6'].map(k => '<button onclick="taipMinit(\'' + k + '\')">' + k + '</button>').join('') + '<button class="fn" onclick="setMinit(\'\')">C</button>' +
    ['7', '8', '9'].map(k => '<button onclick="taipMinit(\'' + k + '\')">' + k + '</button>').join('') + '<button class="ok" onclick="sahMinit()" aria-label="Sahkan">' + ikon('semak', 22) + '</button>' +
    '<button class="fn" onclick="ubahMinit(-5)">−5</button><button onclick="taipMinit(\'0\')">0</button><button class="fn" onclick="ubahMinit(5)">+5</button>' +
    '</div>';
}
function kemasNilai() {
  const el = document.querySelector('#telefon [data-nilai]');
  if (!el) return;
  el.textContent = T.nomborInput || '0';
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  document.querySelectorAll('#telefon .cadangan .cip').forEach(c => c.classList.toggle('aktif', c.textContent === T.nomborInput + ' min'));
}
function taipMinit(k) {
  klik(k === 'del' ? 400 : 700);
  let v = T.nomborInput || '';
  if (k === 'del') v = v.slice(0, -1);
  else if (v.length < 3) v = (v === '0' ? '' : v) + k;
  if (+v > 180) v = '180';
  T.nomborInput = v; kemasNilai();
}
function setMinit(n) { klik(700); T.nomborInput = n; kemasNilai(); }
function ubahMinit(d) { klik(650); T.nomborInput = String(Math.min(180, Math.max(0, (+T.nomborInput || +S.sasaran || 0) + d))); kemasNilai(); }
function sahMinit() {
  const v = +(T.nomborInput || S.sasaran);
  if (!v) { tunjuk('Masukkan sekurang-kurangnya 1 minit', 'jam'); return; }
  S.sasaran = v; T.nomborInput = ''; klik(880);
  pergi('utama'); setTimeout(() => tunjuk('Sasaran ' + v + ' minit sehari disimpan', 'sasaran'), 200);
}

/* ---------- UTAMA ---------- */
function eraSasaran() { return ERA.find(e => bilSiap(e.id) < e.pelajaran.length) || ERA[ERA.length - 1]; }
function skrinUtama() {
  const siap = jumlahSiap(), jum = jumlahPelajaran();
  const kz = Object.values(S.kuizSkor); const purata = kz.length ? Math.round(kz.reduce((a, b) => a + b, 0) / (kz.length * 5) * 100) : 0;
  const es = eraSasaran(); const pe = Math.round(bilSiap(es.id) / es.pelajaran.length * 100);
  const pita = ['<em>± 1400</em> Melaka dibuka', '<em>1511</em> Melaka jatuh', '<em>1786</em> Pulau Pinang', '<em>1874</em> Perjanjian Pangkor', '<em>1946</em> UMNO ditubuhkan', '<em>1957</em> Merdeka!', '<em>1963</em> Malaysia'];
  const pitaH = pita.concat(pita).map(t => '<span>' + t + ' ' + ikon('bintang', 12) + '</span>').join('');
  return '<div class="skrol">' +
    '<div class="kepala-utama"><h1 class="h2">Selamat datang, ' + esc(namaPendek()) + ' <span class="lambai-a">' + ikon('lambai', 22) + '</span></h1>' +
    '<button class="ikon-loceng" onclick="bukaLapis(\'fakta\')" aria-label="Fakta hari ini">' + ikon('lampu', 19) + '<span class="bintik"></span></button></div>' +
    '<div class="pad">' +
    '<div class="kepala-seksyen" style="margin-top:12px"><h2 class="h3">Kemajuan saya</h2><button class="pil-kecil" onclick="pergi(\'profil\')">' + ikon('carta', 13) + 'Rekod</button></div>' +
    '<div class="grid-akaun">' +
    '<button class="kad-statis bg-lime naik" style="--i:0" onclick="pergi(\'belajar\')"><span class="lbl">Pelajaran</span><span class="ik-sudut">' + ikon('belajar', 18, 'lukis') + '</span><span class="nilai">' + siap + '<small style="margin-left:3px">/ ' + jum + '</small></span></button>' +
    '<button class="kad-statis bg-violet naik" style="--i:1" onclick="pergi(\'era\',{era:\'' + es.id + '\'})"><span class="lbl">Ketepatan kuiz</span><span class="ik-sudut">' + ikon('sasaran', 18, 'lukis') + '</span><span class="nilai">' + purata + '<small style="margin-left:2px">%</small></span></button>' +
    '<button class="kad-statis bg-lilac naik" style="--i:2" onclick="pergi(\'profil\')"><span class="lbl">Rentetan</span><span class="ik-sudut">' + ikon('api', 18, 'lukis') + '</span><span class="nilai">' + streak() + '<small style="margin-left:4px">hari</small></span></button>' +
    '<button class="kad-statis tambah naik" style="--i:3" onclick="pergi(\'nota\')"><span class="bulat-t">' + ikon('tambah', 16) + '</span>Tulis nota</button>' +
    '</div>' +
    '<div class="tab-cip"><button onclick="pergi(\'belajar\')">' + ikon('belajar', 15) + 'Belajar</button><button onclick="pergi(\'garis\')">' + ikon('garis', 15) + 'Garis masa</button><button onclick="pergi(\'tokoh\')">' + ikon('orang', 15) + 'Tokoh</button></div>' +
    '<div class="kepala-seksyen"><h2 class="h3">Sasaran era</h2><button class="btn-teks" onclick="pergi(\'era\',{era:\'' + es.id + '\'})">Lihat ' + ikon('kanan', 14) + '</button></div>' +
    '<button class="kad-garis" style="width:100%;text-align:left" onclick="pergi(\'era\',{era:\'' + es.id + '\'})"><div style="display:flex;align-items:center;gap:10px">' + pelekat(es.ikon, 'gerigi', warnaEra(es) === 'ink' ? 'lilac' : warnaEra(es), 34) + '<div><b style="font-size:13.5px">' + esc(es.nama) + '</b><div class="meta">' + esc(es.tempoh) + '</div></div></div>' +
    '<div class="bar-kemajuan"><i style="width:' + Math.max(pe, 2) + '%"></i></div><div class="meta" style="text-align:right;color:var(--violet-2);font-weight:800">' + pe + '% selesai</div></button>' +
    '<div class="pita"><div class="alir">' + pitaH + '</div></div>' +
    '<div class="kepala-seksyen"><h2 class="h3">Aktiviti terkini</h2><button class="ikon-btn" onclick="pergi(\'garis\')" aria-label="Garis masa">' + ikon('titik', 18) + '</button></div>' +
    '<div class="meta" style="margin:-4px 0 4px">7 hari lepas</div>' + senaraiAktiviti() +
    '<div class="kepala-seksyen"><h2 class="h3">Struktur pembelajaran</h2><span class="meta">XP ikut era</span></div>' +
    '<div class="kad-garis">' + donat() + '</div>' +
    '</div></div>';
}
function senaraiAktiviti() {
  const ik = { baca: ['belajar', 'bg-lime'], kuiz: ['kuiz', 'bg-lilac'], nota: ['pena', 'bg-coral'] };
  if (!S.aktiviti.length) {
    const cadang = ERA.slice(0, 3).map((e, i) => '<button class="baris naik" style="--i:' + i + '" onclick="pergi(\'baca\',{era:\'' + e.id + '\',pel:0})"><span class="kotak-ik bg-' + (i % 2 ? 'lilac' : 'lime') + '">' + ikon(e.ikon, 17) + '</span><span class="tengah"><b>' + esc(e.pelajaran[0].tajuk) + '</b><span class="meta">Cadangan · ' + esc(e.nama) + '</span></span><span class="kanan-b hijau">+20 XP<small>' + e.pelajaran[0].minit + ' min</small></span></button>').join('');
    return '<div>' + cadang + '</div>';
  }
  return '<div>' + S.aktiviti.slice(0, 6).map((a, i) => '<div class="baris naik" style="--i:' + i + '"><span class="kotak-ik ' + ik[a.jenis][1] + '">' + ikon(ik[a.jenis][0], 17) + '</span><span class="tengah"><b>' + esc(a.tajuk) + '</b><span class="meta">' + esc(a.sub) + '</span></span><span class="kanan-b ' + (a.xp ? 'hijau' : '') + '">' + (a.xp ? '+' + a.xp + ' XP' : '—') + '<small>' + masaRelatif(a.masa) + '</small></span></div>').join('') + '</div>';
}
function donat() {
  const warna = ['var(--lilac)', 'var(--lime)', 'var(--violet)', 'var(--coral)', 'var(--ink)', 'var(--lime-2)'];
  const nilai = ERA.map(e => bilSiap(e.id) * 20 + (S.kuizSkor[e.id] || 0) * 10);
  const jum = nilai.reduce((a, b) => a + b, 0);
  const C = 2 * Math.PI * 50;
  let off = 0, seg = '';
  if (jum) {
    nilai.forEach((v, i) => {
      if (!v) return;
      const p = v / jum * C;
      seg += '<circle class="seg" cx="66" cy="66" r="50" stroke="' + warna[i] + '" style="--p:' + (p - 1.5).toFixed(1) + ';--i:' + i + ';stroke-dashoffset:' + (-off).toFixed(1) + '"/>';
      off += p;
    });
  }
  return '<div class="donat-wrap"><div style="position:relative">' +
    '<svg class="donat" viewBox="0 0 132 132"><circle cx="66" cy="66" r="50" stroke="var(--soft-2)"/>' + seg + '</svg>' +
    '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><b style="font-size:22px;font-weight:800">' + S.xp + '</b><span class="meta">XP</span></div></div>' +
    '<div class="lagenda">' + ERA.map((e, i) => '<span><i style="background:' + warna[i] + '"></i>' + esc(e.nama.replace('Kesultanan Melayu ', '')) + '</span>').join('') + '</div></div>';
}

/* ---------- BELAJAR ---------- */
function skrinBelajar() {
  return '<div class="skrol"><div class="pad" style="padding-top:8px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center"><h1 class="h1">' + dedah('Belajar') + '</h1>' +
    '<button class="pil-kecil" onclick="pergi(\'tokoh\')">' + ikon('orang', 13) + 'Tokoh</button></div>' +
    '<p class="body" style="margin:4px 0 12px">Enam era, ' + jumlahPelajaran() + ' pelajaran ringkas, 30 soalan kuiz.</p>' +
    '<label class="carian">' + ikon('cari', 18) + '<input placeholder="Cari peristiwa, tokoh, tahun…" value="' + esc(T.cariTeks) + '" oninput="cari(this.value)"></label>' +
    '<div data-hasil-cari>' + hasilCari() + '</div></div></div>';
}
function hasilCari() {
  const q = T.cariTeks.trim().toLowerCase();
  if (!q) {
    return ERA.map((e, i) => {
      const w = warnaEra(e), pc = Math.round(bilSiap(e.id) / e.pelajaran.length * 100);
      return '<button class="kad-era bg-' + w + ' naik" style="--i:' + i + '" onclick="pergi(\'era\',{era:\'' + e.id + '\'})">' +
        '<span class="no">' + e.no + '</span><span class="isi-e"><b>' + esc(e.nama) + '</b><span class="meta">' + esc(e.tempoh) + '</span>' +
        '<p>' + esc(e.ringkas) + '</p><div class="mini-bar"><i style="width:' + pc + '%"></i></div></span>' +
        '<span class="sudut">' + pelekat(e.ikon, 'gerigi', w === 'lime' ? 'violet' : 'lime', 58, 'pusing') + '</span></button>';
    }).join('');
  }
  const hasil = [];
  ERA.forEach(e => e.pelajaran.forEach((p, i) => {
    const teks = (p.tajuk + ' ' + p.label + ' ' + p.isi.join(' ') + ' ' + p.tarikh.map(t => t.join(' ')).join(' ')).toLowerCase();
    if (teks.includes(q)) hasil.push([e, p, i]);
  }));
  if (!hasil.length) return '<div class="body" style="text-align:center;padding:30px 0">Tiada hasil untuk “' + esc(T.cariTeks) + '”.</div>';
  return hasil.map(([e, p, i], n) => '<button class="baris naik" style="--i:' + n + '" onclick="pergi(\'baca\',{era:\'' + e.id + '\',pel:' + i + '})"><span class="kotak-ik bg-' + (warnaEra(e) === 'ink' ? 'lilac' : warnaEra(e)) + '">' + ikon(e.ikon, 17) + '</span><span class="tengah"><b>' + esc(p.tajuk) + '</b><span class="meta">' + esc(e.nama) + ' · ' + esc(p.label) + '</span></span>' + ikon('kanan', 16) + '</button>').join('');
}
function cari(v) { T.cariTeks = v; const el = document.querySelector('#telefon [data-hasil-cari]'); if (el) el.innerHTML = hasilCari(); }

/* ---------- ERA (gaya "Account type") ---------- */
function skrinEra() {
  const e = eraIkut(T.era);
  const latar = ['bg-lilac-soft', 'bg-lime-soft', 'bg-coral-soft'];
  const warnaL = ['var(--lilac-soft)', 'var(--lime-soft)', 'var(--coral-soft)'];
  const pel = ['lilac', 'lime', 'coral'];
  return barAtas("pergi('belajar')", '<button class="lanjut" onclick="mulaKuiz(\'era\')">Kuiz ' + ikon('kanan', 16) + '</button>') +
    '<div class="skrol"><div class="pad">' +
    '<div class="mono">Era ' + e.no + ' · ' + esc(e.tempoh) + '</div>' +
    '<h1 class="h1" style="margin-top:6px">' + dedah(e.nama) + '</h1>' +
    '<p class="body" style="margin:8px 0 18px">' + esc(e.ringkas) + '</p>' +
    e.pelajaran.map((p, i) => {
      const siap = (S.siap[e.id] || []).includes(i);
      return '<button class="kad-jenis naik ' + (siap ? 'siap' : '') + '" style="--i:' + i + ';background:' + warnaL[i % 3] + '" onclick="pergi(\'baca\',{era:\'' + e.id + '\',pel:' + i + '})">' +
        '<span class="tx"><b>' + esc(p.tajuk) + '</b><p>' + esc(p.isi[0].replace(/\{\{|\}\}/g, '').slice(0, 92)) + '…</p>' +
        '<span class="meta"><span>' + esc(p.label) + '</span><span>· ' + p.minit + ' min</span>' + (siap ? '<span class="hijau">· Selesai</span>' : '') + '</span></span>' +
        pelekat(siap ? 'semak' : ['skrol', 'lampu', 'bintang'][i % 3], ['segi', 'gerigi', 'bunga'][i % 3], pel[i % 3] === 'lilac' ? 'violet' : pel[i % 3], 54, 'apung', '--r:' + (i * 7 - 7) + 'deg;--dl:' + i * .3 + 's') + '</button>';
    }).join('') +
    '<button class="kad-jenis naik bg-ink" style="--i:3;color:#fff" onclick="mulaKuiz(\'era\')"><span class="tx"><b style="color:#fff">Kuiz era</b><p style="color:#C9C9C2">5 soalan untuk menguji ingatan anda.' + (S.kuizSkor[e.id] != null ? ' Skor terbaik: ' + S.kuizSkor[e.id] + '/5.' : '') + '</p></span>' +
    pelekat('kuiz', 'gerigi', 'lime', 54, 'goyang') + '</button>' +
    '</div></div>';
}

/* ---------- BACA PELAJARAN ---------- */
function odometer(teksTahun) {
  return teksTahun.split('').map(ch => {
    if (!/\d/.test(ch)) return '<span>' + ch + '</span>';
    let col = '';
    for (let r = 0; r < 2; r++) for (let d = 0; d < 10; d++) col += '<span>' + d + '</span>';
    return '<span class="odo" data-d="' + ch + '"><span>' + col + '</span></span>';
  }).join('');
}
function skrinBaca() {
  const e = eraIkut(T.era), p = e.pelajaran[T.pel];
  const kunciSimpan = e.id + ':' + T.pel;
  const ditanda = S.simpan.includes(kunciSimpan);
  const siap = (S.siap[e.id] || []).includes(T.pel);
  const tahun = +p.tahun >= 10000 ? Number(p.tahun).toLocaleString('en-US') : String(p.tahun);
  const akhir = T.pel === e.pelajaran.length - 1;
  return '<div class="prog-baca"><i></i></div>' +
    barAtas("pergi('era',{era:'" + e.id + "'})", '<span style="display:flex;gap:2px"><button class="ikon-btn" onclick="togolSimpan(this)" aria-label="Simpan" style="color:' + (ditanda ? 'var(--violet-2)' : 'inherit') + '">' + (ditanda ? ikon('penanda', 20).replace('fill="none"', 'fill="currentColor"') : ikon('penanda', 20)) + '</button><button class="ikon-btn" onclick="kongsi()" aria-label="Kongsi">' + ikon('kongsi', 19) + '</button></span>') +
    '<div class="skrol" data-baca><div class="baca-kepala">' +
    '<div class="mono">Era ' + e.no + ' · Pelajaran ' + (T.pel + 1) + '/' + e.pelajaran.length + '</div>' +
    '<div class="tahun-gergasi" aria-label="' + esc(p.label) + '">' + odometer(tahun) + '</div>' +
    '<div class="serif-i" style="font-size:19px;color:var(--violet-2)">' + esc(p.label) + '</div>' +
    '<h1 class="h1">' + dedah(p.tajuk) + '</h1>' +
    '<div class="meta" style="margin-top:8px;display:flex;gap:12px">' + '<span style="display:flex;gap:4px;align-items:center">' + ikon('jam', 13) + p.minit + ' min bacaan</span><span style="display:flex;gap:4px;align-items:center">' + ikon('label', 13) + bilIstilah(p) + ' istilah</span></div>' +
    '</div><div class="pad isi-baca" style="padding-top:20px">' +
    p.isi.map(t => '<p class="para sr">' + para(t) + '</p>').join('') +
    '<div class="kad-flip sr" onclick="this.classList.toggle(\'terbalik\');klik(560)"><div class="dalam">' +
    '<div class="muka bg-lime"><div style="display:flex;justify-content:space-between;align-items:flex-start"><span class="mono" style="color:var(--ink)">Tahukah anda?</span>' + ikon('lampu', 22, 'goyang') + '</div><div><div class="h2" style="font-size:21px">Ketuk untuk membuka fakta</div><div class="meta" style="color:var(--ink-3);margin-top:4px">Kad ini berpusing</div></div></div>' +
    '<div class="muka belakang"><span class="mono" style="color:var(--lime)">Fakta</span><p>' + esc(p.fakta) + '</p></div></div></div>' +
    '<div class="mono sr" style="margin:6px 0 10px">Tarikh penting</div>' +
    '<div class="langkah-tarikh">' + p.tarikh.map(t => '<div class="lt sr"><b>' + esc(t[0]) + '</b><div>' + esc(t[1]) + '</div></div>').join('') + '</div>' +
    '<div class="sr" style="display:flex;flex-direction:column;gap:10px;margin-top:8px">' +
    (siap ? '<div class="maklum ok">' + ikon('semak', 18) + 'Pelajaran ini sudah ditandakan selesai.</div>' : '<button class="btn lime" onclick="tandaSiap()">' + ikon('semak', 18) + 'Tandakan selesai · +20 XP</button>') +
    (akhir ? '<button class="btn" onclick="mulaKuiz(\'era\')">Uji diri: kuiz era ' + ikon('kanan', 18, 'gerak') + '</button>' : '<button class="btn" onclick="pergi(\'baca\',{era:\'' + e.id + '\',pel:' + (T.pel + 1) + '})">Pelajaran seterusnya ' + ikon('kanan', 18, 'gerak') + '</button>') +
    '</div></div></div>';
}
function tandaSiap() {
  const e = eraIkut(T.era), p = e.pelajaran[T.pel];
  S.siap[e.id] = S.siap[e.id] || [];
  if (!S.siap[e.id].includes(T.pel)) { S.siap[e.id].push(T.pel); catatAktiviti('baca', p.tajuk, e.nama, 20); }
  simpan(); klik(880); setTimeout(() => klik(1100), 90);
  const sk = document.querySelector('#telefon [data-baca]'); const y = sk ? sk.scrollTop : 0;
  lukis();
  const sk2 = document.querySelector('#telefon [data-baca]'); if (sk2) { sk2.scrollTop = y; sk2.querySelectorAll('.sr').forEach(x => x.classList.add('nampak')); }
  konfeti(); tunjuk('+20 XP · pelajaran selesai', 'bintang');
}
function togolSimpan(btn) {
  const k = T.era + ':' + T.pel; const i = S.simpan.indexOf(k);
  if (i >= 0) S.simpan.splice(i, 1); else S.simpan.push(k);
  simpan(); klik(760);
  const ada = i < 0;
  btn.style.color = ada ? 'var(--violet-2)' : 'inherit';
  btn.innerHTML = ada ? ikon('penanda', 20).replace('fill="none"', 'fill="currentColor"') : ikon('penanda', 20);
  btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  tunjuk(ada ? 'Disimpan ke Simpanan' : 'Dibuang dari Simpanan', 'penanda');
}
function kongsi() {
  const e = eraIkut(T.era), p = e.pelajaran[T.pel];
  const teks = p.tajuk + ' (' + p.label + ') — ' + e.nama + ' · jejak. Sejarah Malaysia';
  if (navigator.share) navigator.share({ title: p.tajuk, text: teks }).catch(() => {});
  else { try { navigator.clipboard.writeText(teks); tunjuk('Teks disalin'); } catch (x) { tunjuk('Tidak dapat menyalin'); } }
}
function bukaIstilah(el) {
  klik(620);
  const k = el.dataset.istilah;
  const pap = el.closest('.paparan'); if (!pap) return;
  pap.querySelectorAll('.istilah-pop').forEach(x => x.remove());
  pap.insertAdjacentHTML('beforeend', '<div class="istilah-pop"><button class="tutup-pop" onclick="this.parentNode.remove()" aria-label="Tutup">' + ikon('tutup', 18) + '</button><span class="mono" style="color:#999">Istilah</span><div><b>' + esc(k) + '</b></div><p>' + esc(GLOSARI[k] || '') + '</p></div>');
}

/* ---------- KUIZ ---------- */
function kocok(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function mulaKuiz(mod) {
  let soalan;
  if (mod === 'era') soalan = eraIkut(T.era).kuiz.map(q => Object.assign({ era: T.era }, q));
  else {
    let semua = [];
    ERA.forEach(e => e.kuiz.forEach(q => semua.push(Object.assign({ era: e.id }, q))));
    if (mod === 'tarikh') semua = semua.filter(q => /\d{4}/.test(q.p.join(' ')));
    soalan = kocok(semua).slice(0, 5);
  }
  T.kuiz = { mod, soalan, i: 0, pilih: null, betul: 0 };
  pergi('kuiz');
}
function skrinKuiz() {
  const K = T.kuiz; const q = K.soalan[K.i];
  const mods = [['era', 'Era ini'], ['campur', 'Campuran'], ['tarikh', 'Tarikh']];
  const mi = mods.findIndex(m => m[0] === K.mod);
  const dijawab = K.pilih !== null;
  return barAtas("pergi('era',{era:'" + T.era + "'})", '<button class="lanjut" style="opacity:' + (dijawab ? 1 : .35) + '" onclick="' + (dijawab ? 'kuizSeterusnya()' : '') + '">' + (K.i === K.soalan.length - 1 ? 'Selesai' : 'Seterusnya') + ' ' + ikon('kanan', 16) + '</button>') +
    '<div class="segmen"><span class="penunjuk" style="transform:translateX(' + (mi * 100) + '%)"></span>' + mods.map(m => '<button onclick="mulaKuiz(\'' + m[0] + '\')">' + m[1] + '</button>').join('') + '</div>' +
    '<div class="skrol"><div class="pad" style="padding-top:18px">' +
    '<div class="bar-soalan">' + K.soalan.map((x, n) => '<i class="' + (n < K.i ? 'siap' : n === K.i ? 'kini' : '') + '"></i>').join('') + '</div>' +
    '<div class="mono" style="margin-top:12px">Soalan ' + (K.i + 1) + ' / ' + K.soalan.length + ' · ' + esc(eraIkut(q.era).nama) + '</div>' +
    '<h1 class="soalan-besar">' + dedah(q.s) + '</h1>' +
    '<div style="margin-top:16px">' + q.p.map((p, n) => {
      let k = '';
      if (dijawab) { if (n === q.j) k = 'betul'; else if (n === K.pilih) k = 'salah'; }
      return '<button class="pilihan naik ' + k + '" style="--i:' + n + '" ' + (dijawab ? '' : 'onclick="jawab(' + n + ')"') + '><span class="huruf">' + 'ABCD'[n] + '</span>' + esc(p) + '</button>';
    }).join('') + '</div>' +
    (dijawab ? (K.pilih === q.j ? '<div class="maklum ok">' + ikon('semak', 18) + 'Tepat! Teruskan.</div>' : '<div class="maklum no">' + ikon('tutup', 18) + 'Jawapan betul: ' + esc(q.p[q.j]) + '</div>') +
      '<button class="btn" style="margin-top:14px" onclick="kuizSeterusnya()">' + (K.i === K.soalan.length - 1 ? 'Lihat keputusan' : 'Soalan seterusnya') + ' ' + ikon('kanan', 18, 'gerak') + '</button>' : '') +
    '</div></div>';
}
function jawab(n) {
  const K = T.kuiz; if (K.pilih !== null) return;
  K.pilih = n; const ok = n === K.soalan[K.i].j;
  if (ok) { K.betul++; klik(880); setTimeout(() => klik(1180), 100); } else klik(220);
  lukis();
}
function kuizSeterusnya() {
  const K = T.kuiz;
  if (K.i < K.soalan.length - 1) { K.i++; K.pilih = null; klik(600); lukis(); return; }
  const xp = K.betul * 10;
  const e = eraIkut(T.era);
  if (K.mod === 'era') S.kuizSkor[e.id] = Math.max(S.kuizSkor[e.id] || 0, K.betul);
  catatAktiviti('kuiz', 'Kuiz ' + (K.mod === 'era' ? e.nama : K.mod === 'campur' ? 'campuran' : 'tarikh'), K.betul + '/5 betul', xp);
  T.hasil = { betul: K.betul, jum: K.soalan.length, mod: K.mod, era: e.nama, xp, masa: new Date() };
  simpan();
  pergi('hasil');
  if (K.betul >= 3) setTimeout(() => konfeti(), 350);
}

/* ---------- HASIL (resit) ---------- */
function skrinHasil() {
  const H = T.hasil || { betul: 4, jum: 5, mod: 'era', era: 'Kesultanan Melayu Melaka', xp: 40, masa: new Date() };
  const d = H.masa instanceof Date ? H.masa : new Date(H.masa);
  const bulan = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogos', 'Sep', 'Okt', 'Nov', 'Dis'];
  const komen = H.betul === H.jum ? 'Sempurna! Anda pakar sejarah.' : H.betul >= 3 ? 'Bagus! Sedikit lagi untuk markah penuh.' : 'Cuba baca semula pelajaran, kemudian ulang kuiz.';
  return '<div class="bar-atas" style="color:#fff"><span></span><span class="mono" style="color:#888">.jejak</span><button class="ikon-btn" style="color:#fff" onclick="kongsiHasil()" aria-label="Kongsi">' + ikon('kongsi', 19) + '</button></div>' +
    '<div class="skrol"><div class="resit-wrap"><div class="resit">' +
    '<div class="cek">' + ikon('semak', 22) + '</div>' +
    '<div class="h2" style="text-align:center">Kuiz direkod!</div>' +
    '<div class="skor-besar">' + H.betul + '<small>/' + H.jum + '</small></div>' +
    '<div class="meta" style="text-align:center">' + esc(komen) + '</div>' +
    '<div class="garis-putus"></div>' +
    '<div class="rb"><span>Tarikh</span><b>' + d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear() + '</b></div>' +
    '<div class="rb"><span>Masa</span><b>' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + '</b></div>' +
    '<div class="rb"><span>Mod</span><b>' + (H.mod === 'era' ? 'Era ini' : H.mod === 'campur' ? 'Campuran' : 'Tarikh') + '</b></div>' +
    (H.mod === 'era' ? '<div class="rb"><span>Era</span><b style="text-align:right;max-width:60%">' + esc(H.era) + '</b></div>' : '') +
    '<div class="garis-putus"></div>' +
    '<div class="rb"><span>XP diperoleh</span><b class="hijau">+' + H.xp + ' XP</b></div>' +
    '<button class="btn putih" style="margin-top:14px;font-size:13px;padding:12px" onclick="unduhSijil()">' + ikon('unduh', 17) + 'Simpan sijil (PNG)</button>' +
    '</div>' +
    '<div style="margin-top:auto;padding-top:26px;display:flex;flex-direction:column;gap:10px"><button class="btn putih" onclick="pergi(\'utama\')">Kembali ke utama</button>' +
    '<button class="btn-teks" style="justify-content:center;color:var(--lime)" onclick="mulaKuiz(T.kuiz?T.kuiz.mod:\'era\')">' + ikon('muat', 15) + 'Cuba lagi</button></div>' +
    '</div></div>';
}
function kongsiHasil() {
  const H = T.hasil || {}; const t = 'Saya dapat ' + H.betul + '/' + H.jum + ' dalam kuiz Sejarah Malaysia di jejak.!';
  if (navigator.share) navigator.share({ text: t }).catch(() => {}); else { try { navigator.clipboard.writeText(t); tunjuk('Teks disalin'); } catch (e) {} }
}
function unduhSijil() {
  const H = T.hasil || { betul: 0, jum: 5, era: '', mod: 'era', masa: new Date() };
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
  const x = c.getContext('2d');
  const aks = AKSEN[S.aksen] ? AKSEN[S.aksen][0] : '#D7F25C';
  x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, 1080, 1350);
  x.strokeStyle = '#141414'; x.lineWidth = 6; x.strokeRect(50, 50, 980, 1250);
  x.fillStyle = aks; x.fillRect(50, 50, 980, 170); x.strokeRect(50, 50, 980, 170);
  x.fillStyle = '#141414'; x.font = '800 72px Raleway, sans-serif'; x.fillText('.jejak', 100, 162);
  x.font = '600 26px "JetBrains Mono", monospace'; x.textAlign = 'right'; x.fillText('SIJIL KUIZ', 980, 150); x.textAlign = 'left';
  x.font = 'italic 54px "Instrument Serif", serif'; x.fillStyle = '#6C6C66'; x.fillText('Dengan ini disahkan bahawa', 100, 360);
  x.fillStyle = '#141414'; x.font = '800 92px Raleway, sans-serif'; x.fillText((S.nama || 'Tetamu').slice(0, 18), 100, 480);
  x.font = '500 40px Raleway, sans-serif'; x.fillStyle = '#4D4D4A';
  x.fillText('telah menamatkan kuiz Sejarah Malaysia', 100, 570);
  x.fillText(H.mod === 'era' ? 'era ' + H.era : 'mod ' + (H.mod === 'campur' ? 'campuran' : 'tarikh'), 100, 625);
  x.fillStyle = '#141414'; x.font = '400 300px "Instrument Serif", serif'; x.fillText(H.betul + '/' + H.jum, 100, 1000);
  x.font = '600 26px "JetBrains Mono", monospace'; x.fillStyle = '#8B8B85';
  const d = new Date(H.masa); x.fillText(d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase(), 100, 1200);
  x.textAlign = 'right'; x.fillText('SEJARAH MALAYSIA', 980, 1200);
  try {
    const a = document.createElement('a');
    a.download = 'sijil-jejak-' + hariIni() + '.png'; a.href = c.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
    tunjuk('Sijil dimuat turun', 'unduh');
  } catch (e) { tunjuk('Muat turun disekat oleh pelayar', 'tutup'); }
}

/* ---------- GARIS MASA ---------- */
function peristiwa() {
  const out = [];
  ERA.forEach(e => e.pelajaran.forEach((p, pi) => p.tarikh.forEach(t => out.push({ era: e, pi, p, th: t[0], ap: t[1] }))));
  return out;
}
function skrinGaris() {
  const semua = peristiwa().filter(x => T.gmTapis === 'semua' || x.era.id === T.gmTapis);
  return '<div class="skrol" data-gm>' +
    '<div class="tahun-pantau"><div style="display:flex;justify-content:space-between;align-items:center"><h1 class="h2">Garis masa</h1><span class="meta">' + semua.length + ' peristiwa</span></div>' +
    '<div class="t" data-tp>' + esc(semua[0] ? semua[0].th : '') + '</div><div class="e" data-te>' + esc(semua[0] ? semua[0].era.nama : '') + '</div>' +
    '<div class="tab-cip cip-cip" style="margin-top:10px">' + [['semua', 'Semua']].concat(ERA.map(e => [e.id, e.nama.replace('Kesultanan Melayu ', '')])).map(([id, n]) => '<button class="cip ' + (T.gmTapis === id ? 'aktif' : '') + '" style="background:' + (T.gmTapis === id ? 'var(--lime)' : '#fff') + '" onclick="T.gmTapis=\'' + id + '\';T.gmBuka=-1;klik(640);lukis()">' + esc(n) + '</button>').join('') + '</div></div>' +
    '<div class="gm">' + semua.map((x, i) => '<div class="gm-item sr ' + (T.gmBuka === i ? 'buka' : '') + '" data-th="' + esc(x.th) + '" data-en="' + esc(x.era.nama) + '"><span class="noktah"></span>' +
      '<div class="kotak" onclick="bukaGm(this,' + i + ')"><div class="th">' + esc(x.th) + '</div><b>' + esc(x.ap) + '</b>' +
      '<div class="lebih"><div>Daripada pelajaran <b style="display:inline;font-size:12.5px">' + esc(x.p.tajuk) + '</b> · ' + esc(x.era.nama) + '.<br><button class="btn-teks" style="margin-top:6px" onclick="event.stopPropagation();pergi(\'baca\',{era:\'' + x.era.id + '\',pel:' + x.pi + '})">Baca pelajaran ' + ikon('kanan', 14) + '</button></div></div></div></div>').join('') + '</div></div>';
}
function bukaGm(el, i) {
  klik(600);
  const item = el.parentNode; const buka = !item.classList.contains('buka');
  item.parentNode.querySelectorAll('.gm-item.buka').forEach(x => x.classList.remove('buka'));
  if (buka) item.classList.add('buka');
  T.gmBuka = buka ? i : -1;
}

/* ---------- TOKOH ---------- */
function skrinTokoh() {
  const w = ['lime', 'lilac', 'coral', 'lime-soft', 'lilac-soft'];
  return barAtas("pergi('utama')", '<span class="tajuk-bar">Tokoh</span>') +
    '<div class="skrol"><div class="pad">' +
    '<h1 class="h1">' + dedah('Mereka yang mencorak sejarah') + '</h1><p class="body" style="margin:6px 0 12px">' + TOKOH.length + ' tokoh. Ketuk nama untuk membaca kisahnya.</p>' +
    TOKOH.map((t, i) => '<button class="baris naik" style="--i:' + i + '" onclick="T.tokoh=' + i + ';bukaLapis(\'tokoh\')"><span class="monogram" style="background:var(--' + w[i % w.length] + ')">' + inisial(t.nama.replace("Dato' ", '').replace('Sultan ', '').replace('Tun ', '')) + '</span><span class="tengah"><b>' + esc(t.nama) + '</b><span class="meta">' + esc(t.gelar) + '</span></span><span class="kanan-b">' + esc(t.tahun) + '<small>' + esc(eraIkut(t.era).nama.replace('Kesultanan Melayu ', '')) + '</small></span></button>').join('') +
    '</div></div>';
}

/* ---------- NOTA (gaya "Additional info") ---------- */
function skrinNota() {
  const label = ['Penting', 'Hafal', 'Peperiksaan', 'Menarik'];
  return barAtas("pergi('utama')", '<button class="lanjut" onclick="simpanNota()">Simpan ' + ikon('kanan', 16) + '</button>') +
    '<div class="skrol"><div class="pad">' +
    '<h1 class="h1" style="margin-bottom:16px">' + dedah('Tulis nota') + '</h1>' +
    '<div class="medan"><label>Nota</label><textarea class="input" data-n="isi" placeholder="Contoh: Tun Perak berkhidmat di bawah empat sultan…"></textarea></div>' +
    '<div class="medan"><label>Era</label><div class="pilih-wrap"><select class="input" data-n="era">' + ERA.map(e => '<option value="' + e.id + '"' + (e.id === T.era ? ' selected' : '') + '>' + esc(e.nama) + '</option>').join('') + '</select>' + ikon('bawah', 18) + '</div></div>' +
    '<div class="medan"><label>Tokoh berkaitan</label><div class="pilih-wrap"><select class="input" data-n="tokoh"><option value="">Pilih tokoh</option>' + TOKOH.map(t => '<option>' + esc(t.nama) + '</option>').join('') + '</select>' + ikon('bawah', 18) + '</div></div>' +
    '<div class="medan"><label>Tempat</label><input class="input" data-n="tempat" placeholder="Contoh: Pasir Salak, Perak"></div>' +
    '<div class="medan"><label>Tarikh peristiwa</label><input class="input" data-n="tarikh" placeholder="Contoh: 2 November 1875"></div>' +
    '<div class="medan"><label>Label</label><div class="cip-cip">' + label.map(l => '<button class="cip ' + (T.notaLabel.includes(l) ? 'aktif' : '') + '" onclick="togolLabel(this,\'' + l + '\')">' + l + '</button>').join('') + '</div></div>' +
    '<button class="btn" style="margin-top:6px" onclick="simpanNota()">' + ikon('pena', 18) + 'Simpan nota</button>' +
    '<div class="kepala-seksyen"><h2 class="h3">Nota saya</h2><span class="meta">' + S.nota.length + ' nota</span></div>' +
    (S.nota.length ? S.nota.map((n, i) => '<div class="kad-garis naik" style="--i:' + i + ';margin-bottom:8px"><div style="display:flex;justify-content:space-between;gap:8px"><span class="mono">' + esc(eraIkut(n.era).nama) + (n.tarikh ? ' · ' + esc(n.tarikh) : '') + '</span><button onclick="padamNota(' + i + ')" aria-label="Padam nota" style="color:var(--muted)">' + ikon('padam', 16) + '</button></div>' +
      '<p style="font-family:var(--s);font-size:18px;line-height:1.35;margin-top:6px">' + esc(n.isi) + '</p>' +
      ((n.label || []).length || n.tokoh || n.tempat ? '<div class="cip-cip" style="margin-top:8px">' + (n.label || []).map(l => '<span class="cip aktif" style="transform:none;padding:4px 9px;font-size:11px">' + esc(l) + '</span>').join('') + (n.tokoh ? '<span class="cip" style="padding:4px 9px;font-size:11px">' + esc(n.tokoh) + '</span>' : '') + (n.tempat ? '<span class="cip" style="padding:4px 9px;font-size:11px">' + esc(n.tempat) + '</span>' : '') + '</div>' : '') +
      '</div>').join('') : '<p class="body">Belum ada nota. Tulis satu di atas, ia akan disimpan dalam peranti ini.</p>') +
    '</div></div>';
}
function togolLabel(el, l) {
  klik(700); const i = T.notaLabel.indexOf(l);
  if (i >= 0) T.notaLabel.splice(i, 1); else T.notaLabel.push(l);
  el.classList.toggle('aktif', i < 0);
}
function simpanNota() {
  const q = n => { const el = document.querySelector('#telefon [data-n="' + n + '"]'); return el ? el.value.trim() : ''; };
  const isi = q('isi');
  if (!isi) { tunjuk('Tulis isi nota dahulu', 'pena'); const t = document.querySelector('#telefon [data-n="isi"]'); if (t) t.focus(); return; }
  S.nota.unshift({ isi, era: q('era'), tokoh: q('tokoh'), tempat: q('tempat'), tarikh: q('tarikh'), label: T.notaLabel.slice(), masa: Date.now() });
  catatAktiviti('nota', isi.slice(0, 40), 'Nota · ' + eraIkut(q('era')).nama, 5);
  T.notaLabel = []; simpan(); klik(880); lukis(); tunjuk('Nota disimpan · +5 XP', 'pena');
}
function padamNota(i) { S.nota.splice(i, 1); simpan(); klik(300); lukis(); }

/* ---------- PROFIL (gaya "Edit account") ---------- */
function lencanaSenarai() {
  const kz = Object.values(S.kuizSkor);
  return [
    ['Langkah pertama', 'bintang', 'gerigi', jumlahSiap() >= 1],
    ['Pembaca era', 'belajar', 'bunga', ERA.some(e => bilSiap(e.id) === e.pelajaran.length)],
    ['Penjawab', 'kuiz', 'segi', kz.length >= 1],
    ['Markah penuh', 'trofi', 'gerigi', kz.some(v => v === 5)],
    ['Penulis', 'pena', 'bulat', S.nota.length >= 1],
    ['Rentetan 3', 'api', 'bunga', streak() >= 3],
    ['Separuh jalan', 'bendera', 'segi', jumlahSiap() >= 9],
    ['Pakar sejarah', 'mahkota', 'gerigi', jumlahSiap() >= jumlahPelajaran()]
  ];
}
function skrinProfil() {
  const kz = Object.keys(S.kuizSkor).length;
  const L = lencanaSenarai();
  return '<div class="bar-atas"><span class="tajuk-bar">Profil</span><button class="lanjut" onclick="simpanProfil()">Simpan ' + ikon('kanan', 16) + '</button></div>' +
    '<div class="skrol"><div class="pad">' +
    '<div class="profil-kepala"><div class="avatar-b">' + inisial(S.nama) + '</div><div class="h2">' + esc(S.nama || 'Tetamu') + '</div><div class="meta">' + esc(S.emel || 'Akaun tetamu') + ' · ' + esc(S.tingkatan) + '</div></div>' +
    '<div class="statistik"><div><b>' + jumlahSiap() + '</b><span>Pelajaran</span></div><div><b>' + kz + '/6</b><span>Kuiz era</span></div><div><b>' + S.xp + '</b><span>XP</span></div></div>' +
    '<div class="kepala-seksyen"><h2 class="h3">Lencana</h2><span class="meta">' + L.filter(l => l[3]).length + '/' + L.length + '</span></div>' +
    '<div class="lencana-grid">' + L.map((l, i) => '<div class="lencana naik ' + (l[3] ? 'dapat' : '') + '" style="--i:' + i + '">' + pelekat(l[1], l[2], ['lime', 'violet', 'lilac', 'coral'][i % 4], 52, l[3] ? 'apung' : '', '--dl:' + (i * .25) + 's;--r:' + (i % 2 ? 6 : -6) + 'deg') + esc(l[0]) + '</div>').join('') + '</div>' +
    '<div class="kepala-seksyen"><h2 class="h3">Simpanan</h2><span class="meta">' + S.simpan.length + '</span></div>' +
    (S.simpan.length ? S.simpan.map(k => { const [eid, pi] = k.split(':'); const e = eraIkut(eid); const p = e.pelajaran[+pi]; if (!p) return ''; return '<button class="baris" onclick="pergi(\'baca\',{era:\'' + eid + '\',pel:' + pi + '})"><span class="kotak-ik bg-lilac">' + ikon('penanda', 16) + '</span><span class="tengah"><b>' + esc(p.tajuk) + '</b><span class="meta">' + esc(e.nama) + '</span></span>' + ikon('kanan', 16) + '</button>'; }).join('') : '<p class="body" style="font-size:13px">Ketuk ikon penanda semasa membaca untuk menyimpan pelajaran.</p>') +
    '<div class="kepala-seksyen"><h2 class="h3">Edit akaun</h2></div>' +
    '<div class="medan"><label>Nama</label><input class="input" data-p="nama" value="' + esc(S.nama) + '" placeholder="Nama anda"></div>' +
    '<div class="medan"><label>Tahap</label><div class="pilih-wrap"><select class="input" data-p="tingkatan">' + ['Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5', 'Umum / dewasa'].map(p => '<option' + (p === S.tingkatan ? ' selected' : '') + '>' + p + '</option>').join('') + '</select>' + ikon('bawah', 18) + '</div></div>' +
    '<div class="medan"><label>Sasaran harian (minit)</label><input class="input" data-p="sasaran" type="number" min="1" max="180" value="' + S.sasaran + '"></div>' +
    '<div class="medan"><label>Warna aksen</label><div class="warna-pilih">' + Object.keys(AKSEN).map(k => '<button class="' + (S.aksen === k ? 'aktif' : '') + '" style="background:' + AKSEN[k][0] + '" onclick="tukarAksen(\'' + k + '\')" aria-label="Aksen ' + k + '"></button>').join('') + '</div></div>' +
    '<div class="baris-suis" style="margin-bottom:8px">' + ikon('bunyi', 18) + '<span style="flex:1">Bunyi klik</span><button class="suis ' + (S.bunyi ? 'on' : '') + '" onclick="S.bunyi=!S.bunyi;simpan();this.classList.toggle(\'on\');klik(700)" aria-label="Togol bunyi"></button></div>' +
    '<div class="baris-suis">' + ikon('cap', 18) + '<span style="flex:1">Kunci biometrik</span><button class="suis ' + (S.kunci ? 'on' : '') + '" onclick="S.kunci=!S.kunci;simpan();this.classList.toggle(\'on\');klik(700)" aria-label="Togol biometrik"></button></div>' +
    '<div style="display:flex;justify-content:space-between;margin-top:18px"><button class="btn-padam" onclick="bukaLapis(\'padam\')">' + ikon('padam', 16) + 'Padam kemajuan</button>' +
    '<button class="btn-teks" style="color:var(--ink)" onclick="logKeluar()">Log keluar</button></div>' +
    '<p class="meta" style="text-align:center;margin-top:22px">jejak. v1 · data disimpan dalam peranti ini sahaja</p>' +
    '</div></div>';
}
function simpanProfil() {
  const q = n => { const el = document.querySelector('#telefon [data-p="' + n + '"]'); return el ? el.value.trim() : ''; };
  S.nama = q('nama') || S.nama; S.tingkatan = q('tingkatan') || S.tingkatan;
  const m = +q('sasaran'); if (m > 0) S.sasaran = Math.min(180, m);
  simpan(); klik(880); lukis(); tunjuk('Profil dikemas kini');
}
function tukarAksen(k) { S.aksen = k; terapAksen(); simpan(); klik(700); document.querySelectorAll('#telefon .warna-pilih button').forEach(b => b.classList.toggle('aktif', b.getAttribute('aria-label') === 'Aksen ' + k)); }
function terapAksen() {
  const a = AKSEN[S.aksen] || AKSEN.lime; const r = document.documentElement.style;
  r.setProperty('--lime', a[0]); r.setProperty('--lime-2', a[1]); r.setProperty('--lime-soft', a[2]);
}
function logKeluar() { S.skrin = 'mula'; S.nama = ''; S.emel = ''; simpan(); pergi('mula'); }
function padamSemua() { const kekal = { nama: S.nama, emel: S.emel, aksen: S.aksen }; S = Object.assign(keadaanAsal(), kekal); terapAksen(); simpan(); pergi('utama'); setTimeout(() => tunjuk('Kemajuan dipadam', 'padam'), 150); }

/* ============================================================
   LAPISAN (helaian / dialog)
   ============================================================ */
function bukaLapis(n) { klik(600); T.lapis = n; T.muatAkaun = false; T.tambahAkaun = false; lukis(); }
function tutupLapis() { T.lapis = null; lukis(); }
function htmlLapis() {
  const L = T.lapis; if (!L) return '';
  const luar = (kelas, isi) => '<div class="lapis ' + kelas + '" onclick="if(event.target===this)tutupLapis()">' + isi + '</div>';
  if (L === 'akaun') {
    return luar('tengah', '<div class="dialog" style="text-align:center"><div class="logo-p" style="width:34px;height:34px;font-size:16px;margin:0 auto;border-radius:9px">.j</div>' +
      '<div class="h3" style="margin-top:10px;font-weight:700;font-size:17px">Pilih akaun</div><div class="meta" style="margin-bottom:8px">untuk meneruskan ke jejak.</div>' +
      (T.muatAkaun ? '<div class="pusing-muat"></div><div class="meta">Sedang log masuk…</div>' :
        AKAUN_CONTOH.map((a, i) => '<button class="akaun" onclick="pilihAkaun(' + i + ')"><span class="avatar" style="background:' + (i ? 'var(--lilac)' : 'var(--lime)') + '">' + inisial(a.nama) + '</span><span><b style="font-size:13px;display:block">' + esc(a.nama) + '</b><span class="meta">' + esc(a.emel) + '</span></span></button>').join('') +
        (T.tambahAkaun ? '<div style="display:flex;gap:6px;margin-top:10px"><input class="input" data-akaun placeholder="Nama anda" style="padding:9px 10px"><button class="btn" style="width:auto;padding:0 14px" onclick="akaunBaru()">' + ikon('semak', 18) + '</button></div>' :
          '<button class="akaun" style="border:0" onclick="T.tambahAkaun=true;lukis();setTimeout(()=>{const i=document.querySelector(\'#telefon [data-akaun]\');if(i)i.focus()},50)"><span class="avatar" style="box-shadow:inset 0 0 0 1.5px var(--line)">' + ikon('tetamu', 15) + '</span><b style="font-size:13px">Tambah akaun</b></button>')) +
      '<p class="meta" style="font-size:10.5px;text-align:left;margin-top:10px;line-height:1.5">Ini log masuk contoh. Tiada data dihantar ke Google; nama hanya disimpan dalam peranti ini.</p></div>');
  }
  if (L === 'cap') {
    return luar('tengah', '<div class="dialog" style="text-align:center;padding:26px 18px"><div class="h3">jejak.</div><div class="meta" style="margin:4px 0 18px">' + (T.capOk ? 'Cap jari disahkan' : 'Imbas cap jari anda') + '</div>' +
      (T.capOk ? '<div class="cap-bulat" style="background:var(--lime);color:var(--ink);animation:none">' + ikon('semak', 28, 'lukis') + '</div>' : '<div class="cap-besar" style="width:58px;height:58px"><span class="cap-bulat" style="position:absolute;inset:0">' + ikon('cap', 30) + '</span><span class="imbas" style="top:4px"></span></div>') +
      '<button class="btn-teks" style="margin-top:18px" onclick="tutupLapis()">Batal</button></div>');
  }
  if (L === 'tambah') {
    const op = [
      ['rawak', 'lime', 'Kuiz campuran', '5 soalan rawak dari semua era', "mulaKuiz('campur')"],
      ['kalendar', 'lilac', 'Kuiz tarikh', 'Uji ingatan tahun & tarikh', "mulaKuiz('tarikh')"],
      ['pena', 'coral', 'Tulis nota', 'Simpan apa yang anda pelajari', "pergi('nota')"],
      ['lampu', 'lime', 'Fakta rawak', 'Satu fakta menarik untuk hari ini', "bukaLapis('fakta')"]
    ];
    return luar('', '<div class="helaian"><div class="h2" style="margin-bottom:6px">Tambah aktiviti</div>' +
      op.map((o, i) => '<button class="baris naik" style="--i:' + i + '" onclick="' + o[4] + '"><span class="kotak-ik bg-' + o[1] + '">' + ikon(o[0], 17) + '</span><span class="tengah"><b>' + o[2] + '</b><span class="meta">' + o[3] + '</span></span>' + ikon('kanan', 16) + '</button>').join('') + '</div>');
  }
  if (L === 'fakta') {
    const semua = []; ERA.forEach(e => e.pelajaran.forEach((p, i) => semua.push([e, p, i])));
    const [e, p, i] = semua[Math.floor(Math.random() * semua.length)];
    return luar('', '<div class="helaian" style="padding-bottom:26px"><div style="display:flex;justify-content:space-between;align-items:center"><span class="mono">Fakta hari ini · ' + esc(e.nama) + '</span>' + ikon('lampu', 20, 'goyang') + '</div>' +
      '<p class="serif" style="font-size:25px;line-height:1.3;margin:14px 0 18px">' + esc(p.fakta) + '</p>' +
      '<div style="display:flex;gap:8px"><button class="btn putih" onclick="bukaLapis(\'fakta\')">' + ikon('rawak', 17) + 'Lagi</button><button class="btn" onclick="pergi(\'baca\',{era:\'' + e.id + '\',pel:' + i + '})">Baca kisah</button></div></div>');
  }
  if (L === 'tokoh') {
    const t = TOKOH[T.tokoh]; const e = eraIkut(t.era);
    return luar('', '<div class="helaian" style="text-align:center"><span class="monogram monogram-besar" style="background:var(--lime)">' + inisial(t.nama.replace("Dato' ", '').replace('Sultan ', '').replace('Tun ', '')) + '</span>' +
      '<div class="h1" style="font-size:23px">' + esc(t.nama) + '</div><div class="serif-i" style="font-size:18px;color:var(--violet-2)">' + esc(t.gelar) + ' · ' + esc(t.tahun) + '</div>' +
      '<p class="body" style="margin:14px 0 18px;font-size:15px;text-align:left">' + esc(t.bio) + '</p>' +
      '<button class="btn" onclick="pergi(\'era\',{era:\'' + e.id + '\'})">Era: ' + esc(e.nama) + ' ' + ikon('kanan', 18, 'gerak') + '</button></div>');
  }
  if (L === 'padam') {
    return luar('tengah', '<div class="dialog"><div class="h3" style="font-size:17px">Padam semua kemajuan?</div><p class="body" style="margin:8px 0 16px">Pelajaran selesai, skor kuiz, nota, simpanan dan XP akan dipadam. Tindakan ini tidak boleh dibatalkan.</p>' +
      '<div style="display:flex;gap:8px"><button class="btn putih" onclick="tutupLapis()">Batal</button><button class="btn" style="background:var(--merah)" onclick="padamSemua()">Padam</button></div></div>');
  }
  return '';
}
function pilihAkaun(i) {
  T.muatAkaun = true; klik(700); lukis();
  setTimeout(() => { S.nama = AKAUN_CONTOH[i].nama; S.emel = AKAUN_CONTOH[i].emel; pergi('kunci'); }, 1100);
}
function akaunBaru() {
  const el = document.querySelector('#telefon [data-akaun]'); const n = el ? el.value.trim() : '';
  if (!n) { if (el) el.focus(); return; }
  T.muatAkaun = true; lukis();
  setTimeout(() => { S.nama = n; S.emel = ''; pergi('kunci'); }, 900);
}

/* ============================================================
   LUKIS
   ============================================================ */
const SKRIN = { splash: skrinSplash, onb: skrinOnb, mula: skrinMula, kunci: skrinKunci, tahap: skrinTahap, sasaran: skrinSasaran, utama: skrinUtama, belajar: skrinBelajar, era: skrinEra, baca: skrinBaca, kuiz: skrinKuiz, hasil: skrinHasil, garis: skrinGaris, tokoh: skrinTokoh, nota: skrinNota, profil: skrinProfil };
const ADA_NAV = ['utama', 'belajar', 'garis', 'profil', 'tokoh', 'nota'];

function navBawah() {
  const t = S.skrin === 'tokoh' ? 'utama' : S.skrin === 'nota' ? 'utama' : S.skrin;
  const b = (id, ik, label) => '<button class="' + (t === id ? 'aktif' : '') + '" onclick="tekanTab(\'' + id + '\')">' + ikon(ik, 21) + label + '</button>';
  return '<nav class="nav">' + b('utama', 'utama', 'Utama') + b('belajar', 'belajar', 'Belajar') +
    '<button class="tambah-b" onclick="bukaLapis(\'tambah\')" aria-label="Tambah">' + ikon('tambah', 22) + '</button>' +
    b('garis', 'garis', 'Garis masa') + b('profil', 'profil', 'Profil') + '</nav>';
}
function htmlSkrin() {
  if (S.skrin === 'kuiz' && !T.kuiz) { T.kuiz = { mod: 'era', soalan: eraIkut(T.era).kuiz.map(q => Object.assign({ era: T.era }, q)), i: 0, pilih: null, betul: 0 }; }
  if (S.skrin === 'onb' && (S.onb < 0 || S.onb >= ONB.length)) S.onb = 0;
  const fn = SKRIN[S.skrin] || skrinUtama;
  const gelap = ['splash', 'hasil'].includes(S.skrin);
  return '<div class="skrin ' + (gelap ? 'gelap' : '') + '">' + '<div class="takuk"></div>' + barStatus() +
    '<div class="paparan anim">' + fn() + '</div>' + (ADA_NAV.includes(S.skrin) ? navBawah() : '') + htmlLapis() +
    '<div class="garis-rumah" style="' + (gelap ? 'background:#fff' : '') + '"></div></div>';
}

let pemasaSplash = null;
function lukis() {
  const tel = document.getElementById('telefon');
  tel.innerHTML = htmlSkrin();
  hidupkan(tel, false);
  kemasSisi();
  clearTimeout(pemasaSplash);
  if (S.skrin === 'splash') pemasaSplash = setTimeout(() => { if (S.skrin === 'splash') { S.skrin = 'onb'; S.onb = 0; lukis(); } }, 2500);
}

/* kesan selepas lukis: odometer, muncul semasa skrol, condong kad, bar bacaan */
function hidupkan(root, papan) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.querySelectorAll('.odo').forEach((o, i) => { const d = +o.dataset.d; o.firstChild.style.transitionDelay = (i * 90) + 'ms'; o.firstChild.style.transform = 'translateY(-' + ((10 + d) * 80) + 'px)'; });
  }));
  const sk = root.querySelectorAll('.skrol');
  sk.forEach(s => {
    const items = s.querySelectorAll('.sr');
    if (papan || !('IntersectionObserver' in window)) { items.forEach(x => x.classList.add('nampak')); return; }
    const io = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('nampak'); io.unobserve(x.target); } }), { root: s, threshold: .12 });
    items.forEach(x => io.observe(x));
  });
  if (papan) return;
  root.querySelectorAll('.kad-statis').forEach(k => {
    k.addEventListener('pointermove', ev => { const r = k.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5; k.style.transform = 'perspective(500px) rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 14) + 'deg) translateY(-3px)'; });
    k.addEventListener('pointerleave', () => { k.style.transform = ''; });
  });
  const baca = root.querySelector('[data-baca]');
  if (baca) {
    const bar = root.querySelector('.prog-baca i');
    const lt = baca.querySelectorAll('.lt');
    baca.addEventListener('scroll', () => {
      const p = baca.scrollTop / Math.max(1, baca.scrollHeight - baca.clientHeight);
      bar.style.transform = 'scaleX(' + p + ')';
    }, { passive: true });
  }
  const gm = root.querySelector('[data-gm]');
  if (gm) {
    const tp = gm.querySelector('[data-tp]'), te = gm.querySelector('[data-te]');
    const items = [...gm.querySelectorAll('.gm-item')];
    let lepas = null;
    const kemas = () => {
      const atas = gm.getBoundingClientRect().top + 190;
      let kini = items[0];
      for (const it of items) { if (it.getBoundingClientRect().top < atas) kini = it; else break; }
      if (kini && kini !== lepas) {
        items.forEach(x => x.classList.toggle('aktif', x === kini));
        tp.textContent = kini.dataset.th; te.textContent = kini.dataset.en;
        tp.animate([{ opacity: .2, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
        lepas = kini;
      }
    };
    gm.addEventListener('scroll', kemas, { passive: true }); kemas();
  }
}

/* riak pada butang */
document.addEventListener('pointerdown', ev => {
  const b = ev.target.closest('.btn'); if (!b) return;
  const r = b.getBoundingClientRect(); const s = Math.max(r.width, r.height);
  const sp = document.createElement('span'); sp.className = 'riak';
  sp.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (ev.clientX - r.left - s / 2) + 'px;top:' + (ev.clientY - r.top - s / 2) + 'px';
  b.appendChild(sp); setTimeout(() => sp.remove(), 650);
});

/* ============================================================
   PANEL SISI (desktop) & MOD PAPAN (semua skrin)
   ============================================================ */
const SENARAI_PAPAN = [
  ['splash', 'Pembuka'], ['onb0', 'Onboarding 1'], ['onb1', 'Onboarding 2'], ['onb2', 'Onboarding 3'],
  ['mula', 'Mula'], ['akaun', 'Pilih akaun'], ['kunci', 'Kunci biometrik'], ['cap', 'Imbas cap jari'],
  ['tahap', 'Pilih tahap'], ['sasaran', 'Sasaran harian'], ['utama', 'Utama'], ['belajar', 'Belajar'],
  ['era', 'Era'], ['baca', 'Baca pelajaran'], ['kuiz', 'Kuiz'], ['hasil', 'Kuiz direkod'],
  ['garis', 'Garis masa'], ['tokoh', 'Tokoh'], ['nota', 'Tulis nota'], ['profil', 'Profil']
];
function sediaDemo(kunci) {
  /* keadaan contoh untuk pratonton setiap skrin */
  const t0 = Date.now();
  S = Object.assign(keadaanAsal(), {
    nama: 'Aina Sofea', emel: 'aina.sofea@gmail.com', sasaran: 15, kunci: false, aksen: S.aksen,
    siap: { awal: [0, 1, 2], melaka: [0] }, kuizSkor: { awal: 4 }, xp: 145, hari: [hariIni()],
    simpan: ['melaka:0'], nota: [{ isi: 'Tun Perak berkhidmat di bawah empat sultan.', era: 'melaka', tokoh: 'Tun Perak', tempat: 'Melaka', tarikh: '± 1456', label: ['Hafal'], masa: t0 }],
    aktiviti: [
      { jenis: 'baca', tajuk: 'Parameswara membuka Melaka', sub: 'Kesultanan Melayu Melaka', xp: 20, masa: t0 - 9e5 },
      { jenis: 'kuiz', tajuk: 'Kuiz Kerajaan Awal', sub: '4/5 betul', xp: 40, masa: t0 - 3.6e6 },
      { jenis: 'nota', tajuk: 'Tun Perak berkhidmat di bawah…', sub: 'Nota · Melaka', xp: 5, masa: t0 - 7.2e6 },
      { jenis: 'baca', tajuk: 'Langkasuka, Gangga Negara…', sub: 'Kerajaan Awal', xp: 20, masa: t0 - 8.64e7 }
    ]
  });
  T = Object.assign(T, { era: 'melaka', pel: 0, lapis: null, kuiz: null, hasil: null, cariTeks: '', gmTapis: 'semua', gmBuka: 1, tokoh: 9, capOk: false, muatAkaun: false, tambahAkaun: false, notaLabel: ['Hafal'], nomborInput: '' });
  const peta = { onb0: ['onb', 0], onb1: ['onb', 1], onb2: ['onb', 2], akaun: ['mula'], cap: ['kunci'] };
  if (peta[kunci]) { S.skrin = peta[kunci][0]; if (peta[kunci][1] != null) S.onb = peta[kunci][1]; }
  else S.skrin = kunci;
  if (kunci === 'akaun') T.lapis = 'akaun';
  if (kunci === 'cap') T.lapis = 'cap';
  if (kunci === 'kuiz') { T.kuiz = { mod: 'era', soalan: eraIkut('melaka').kuiz.map(q => Object.assign({ era: 'melaka' }, q)), i: 1, pilih: 2, betul: 1 }; }
  if (kunci === 'hasil') T.hasil = { betul: 4, jum: 5, mod: 'era', era: 'Kesultanan Melayu Melaka', xp: 40, masa: new Date() };
}
function lukisPapan() {
  const simpanS = JSON.stringify(S), simpanT = Object.assign({}, T);
  PAPAN = true;
  const grid = document.getElementById('papan-grid');
  grid.innerHTML = '<svg class="papan-svg" id="papan-svg"></svg>' + SENARAI_PAPAN.map(([k, l], i) => '<div class="papan-item" data-k="' + k + '"><div class="lbl-p"><i>' + String(i + 1).padStart(2, '0') + '</i>' + esc(l) + '</div><div class="mini-tel" onclick="bukaDariPapan(\'' + k + '\')" title="Buka skrin ini"><div class="skala"></div></div></div>').join('');
  grid.querySelectorAll('.papan-item').forEach(it => {
    sediaDemo(it.dataset.k);
    const sk = it.querySelector('.skala');
    sk.innerHTML = htmlSkrin();
    hidupkan(sk, true);
  });
  S = JSON.parse(simpanS); T = simpanT; PAPAN = false;
  requestAnimationFrame(garisAliran);
}
function garisAliran() {
  const grid = document.getElementById('papan-grid'), svg = document.getElementById('papan-svg');
  if (!grid || !svg || !document.body.classList.contains('papan')) return;
  const g = grid.getBoundingClientRect();
  const k = [...grid.querySelectorAll('.mini-tel')].map(m => { const r = m.getBoundingClientRect(); return { x: r.left - g.left, y: r.top - g.top, w: r.width, h: r.height }; });
  let d = '', titik = '';
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i], b = k[i + 1];
    if (Math.abs(a.y - b.y) < 5) {
      const y = a.y + a.h * (.35 + (i % 3) * .15);
      d += 'M' + (a.x + a.w - 14) + ' ' + y + 'H' + (b.x + 14);
      titik += '<circle cx="' + (a.x + a.w - 14) + '" cy="' + y + '" r="4.5"/><circle cx="' + (b.x + 14) + '" cy="' + y + '" r="4.5"/>';
    } else {
      const sx = a.x + a.w / 2, sy = a.y + a.h - 18, my = a.y + a.h + 22, ex = b.x + b.w / 2, ey = b.y + 18;
      d += 'M' + sx + ' ' + sy + 'V' + my + 'H' + ex + 'V' + ey;
      titik += '<circle cx="' + sx + '" cy="' + sy + '" r="4.5"/><circle cx="' + ex + '" cy="' + ey + '" r="4.5"/>';
    }
  }
  svg.setAttribute('width', g.width); svg.setAttribute('height', g.height);
  svg.innerHTML = '<path d="' + d + '"/>' + titik;
}
window.addEventListener('resize', () => { clearTimeout(window.__gr); window.__gr = setTimeout(garisAliran, 150); });
function bukaDariPapan(k) {
  const peta = { onb0: 'onb', onb1: 'onb', onb2: 'onb', akaun: 'mula', cap: 'kunci' };
  if (k.startsWith('onb')) S.onb = +k.slice(3);
  tukarMod('app');
  if (!S.nama && !['splash', 'onb0', 'onb1', 'onb2', 'mula', 'akaun'].includes(k)) S.nama = 'Tetamu';
  pergi(peta[k] || k);
  if (k === 'akaun') bukaLapis('akaun');
}
function tukarMod(m) {
  const papan = m === 'papan';
  document.body.classList.toggle('papan', papan);
  try { history.replaceState(null, '', papan ? '#papan' : location.pathname + location.search); } catch (e) {}
  if (papan) { lukisPapan(); window.scrollTo(0, 0); }
  kemasSisi();
}
function kemasSisi() {
  const s = document.getElementById('sisi'); if (!s) return;
  const lompat = [['splash', 'Pembuka'], ['onb', 'Onboarding'], ['mula', 'Mula'], ['kunci', 'Biometrik'], ['tahap', 'Tahap'], ['sasaran', 'Sasaran'], ['utama', 'Utama'], ['belajar', 'Belajar'], ['era', 'Era'], ['baca', 'Baca'], ['kuiz', 'Kuiz'], ['hasil', 'Resit kuiz'], ['garis', 'Garis masa'], ['tokoh', 'Tokoh'], ['nota', 'Nota'], ['profil', 'Profil']];
  s.innerHTML = '<div class="logo-sisi">.jejak<i>.</i></div>' +
    '<p>App PWA Sejarah Malaysia: enam era, ' + jumlahPelajaran() + ' pelajaran, 30 soalan kuiz, garis masa dan ' + TOKOH.length + ' tokoh. Fokus pada tulisan, dengan ikon dan kesan bergerak.</p>' +
    '<div class="mod-tukar"><button class="aktif" onclick="tukarMod(\'app\')">App</button><button onclick="tukarMod(\'papan\')">Papan semua skrin</button></div>' +
    '<div class="tajuk-k">Lompat ke skrin</div><div class="lompat">' + lompat.map(([k, l]) => '<button class="' + (S.skrin === k ? 'aktif' : '') + '" onclick="lompatSisi(\'' + k + '\')">' + l + '</button>').join('') + '</div>' +
    '<div class="nota-kecil">Pasang sebagai app: buka di telefon, kemudian pilih “Tambah ke Skrin Utama”. Kemajuan disimpan dalam peranti.</div>';
}
function lompatSisi(k) {
  if (!S.nama && !['splash', 'onb', 'mula'].includes(k)) S.nama = 'Tetamu';
  if (k === 'onb') S.onb = 0;
  if (k === 'kuiz') { mulaKuiz('era'); return; }
  if (k === 'hasil' && !T.hasil) T.hasil = { betul: 4, jum: 5, mod: 'era', era: eraIkut(T.era).nama, xp: 40, masa: new Date() };
  pergi(k);
}

/* ============================================================
   MULA
   ============================================================ */
muat();
terapAksen();
(function () {
  const q = new URLSearchParams(location.search);
  const s = q.get('s');
  if (s && SKRIN[s]) { if (!S.nama && !['splash', 'onb', 'mula'].includes(s)) S.nama = 'Tetamu'; S.skrin = s; }
  else if (S.nama && S.skrin !== 'splash') S.skrin = 'utama';
  else S.skrin = 'splash';
  /* sentiasa mula dengan pembuka ringkas jika belum log masuk */
  if (!S.nama && !s) S.skrin = 'splash';
  lukis();
  if (location.hash === '#papan') tukarMod('papan');
  window.__jejak = { pergi: (k) => lompatSisi(k), S: () => S, T: () => T };
})();

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && window.self === window.top) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
