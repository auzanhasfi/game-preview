/* Siaga Merdeka: panel samping (dana, daya, radar, produksi, kekuatan khusus, info pilihan), pesan, dan kartu soal. */
'use strict';

var $ = function (s) { return document.querySelector(s); };
var HUD = { tab: 'bgn', sig: '', danaTampil: 0, miniT: 0, hudT: 0 };
var TAB_PROD = { bgn: { nama: 'Bangunan', ikon: 'castle', isi: URUT_BGN }, tahan: { nama: 'Pertahanan', ikon: 'shield', isi: URUT_TAHAN }, inf: { nama: 'Prajurit', ikon: 'soldier', isi: URUT_INF }, kend: { nama: 'Kendaraan', ikon: 'tank', isi: URUT_KEND } };

function siapkanHUD() {
  var tabs = $('#tab-prod'); tabs.innerHTML = '';
  Object.keys(TAB_PROD).forEach(function (k) {
    var b = document.createElement('button'); b.className = 'tab' + (k === HUD.tab ? ' aktif' : ''); b.dataset.k = k; b.title = TAB_PROD[k].nama;
    b.innerHTML = ic(TAB_PROD[k].ikon, 18) + '<span>' + TAB_PROD[k].nama + '</span><i class="tab-titik"></i>';
    b.onclick = function () { HUD.tab = k; bunyi('klik'); HUD.sig = ''; tabs.querySelectorAll('.tab').forEach(function (x) { x.classList.toggle('aktif', x.dataset.k === k); }); perbaruiHUD(true); };
    tabs.appendChild(b);
  });
  HUD.danaTampil = G.sisi[0].dana; HUD.sig = '';
  $('#btn-logistik').onclick = function () { jawabLogistik(); };
  $('#btn-semua').innerHTML = ic('swords', 18); $('#btn-semua').onclick = pilihSemuaPasukan;
  $('#btn-jeda').innerHTML = ic('pause', 18); $('#btn-jeda').onclick = function () { bukaJeda(); };
  $('#btn-suara').innerHTML = ic(AU.bisu ? 'mute' : 'sound', 18); $('#btn-suara').onclick = function () { aturBisu(!AU.bisu); this.innerHTML = ic(AU.bisu ? 'mute' : 'sound', 18); };
  var mini = $('#mini'); mini.width = 180; mini.height = 180;
  pasangMiniPeta(mini);
  $('#pesan').innerHTML = '';
  perbaruiHUD(true);
}

function aktifRadar() { var r = bangunanMilik(0, 'radar'); return !!r && !G.sisi[0].kurang; }

function perbaruiHUD(paksa) {
  var sisi = G.sisi[0];
  /* dana berdetak naik/turun seperti meteran */
  var beda = sisi.dana - HUD.danaTampil; HUD.danaTampil += Math.abs(beda) < 3 ? beda : beda * 0.25;
  var maks = Math.max(100, sisi.hasil, sisi.pakai) * 1.15;
  $('#daya-isi').style.height = Math.min(100, sisi.hasil / maks * 100) + '%';
  $('#daya-pakai').style.bottom = Math.min(100, sisi.pakai / maks * 100) + '%';
  $('#daya').classList.toggle('kurang', sisi.kurang);
  $('#daya-teks').textContent = sisi.pakai + '/' + sisi.hasil;
  $('#radar-mati').style.display = aktifRadar() ? 'none' : 'flex';
  /* tombol produksi */
  var isi = TAB_PROD[HUD.tab].isi.filter(function (t) { return !(UNIT[t] && UNIT[t].hanyaMusuh); });
  var sig = HUD.tab + isi.map(function (t) { return t + (alasanTolak(0, t) ? 0 : 1); }).join('');
  var grid = $('#grid-prod');
  if (sig !== HUD.sig || paksa) {
    HUD.sig = sig; grid.innerHTML = '';
    isi.forEach(function (t) {
      var b = document.createElement('button'); b.className = 'kameo'; b.dataset.t = t;
      var tolak = alasanTolak(0, t);
      b.innerHTML = '<span class="kameo-img"></span><span class="kameo-nama">' + namaUnit(t, 'id') + '</span><span class="kameo-harga">' + angkaID(biayaDari(t, 'id')) + '</span><span class="kameo-putar"></span><span class="kameo-status"></span><span class="kameo-n"></span><span class="kameo-batal" title="Batalkan">' + ic('close', 12) + '</span>' + (tolak ? '<span class="kameo-kunci">' + ic('lock', 14) + '<em>' + tolak + '</em></span>' : '');
      b.querySelector('.kameo-img').appendChild(ikonProduksi(t, 'id'));
      b.classList.toggle('terkunci', !!tolak);
      b.title = namaUnit(t, 'id') + ' — ' + nilaiFak((UNIT[t] || BANGUN[t]).ket, 'id') + (tolak ? ' (' + tolak + ')' : '');
      b.onclick = function (ev) { if (ev.target.closest('.kameo-batal')) { batalBuat(0, t); bunyi('klik'); perbaruiHUD(true); return; } klikKameo(t); };
      b.oncontextmenu = function (ev) { ev.preventDefault(); batalBuat(0, t); bunyi('klik'); perbaruiHUD(true); };
      grid.appendChild(b);
    });
  }
  grid.querySelectorAll('.kameo').forEach(function (b) {
    var t = b.dataset.t, kat = katDari(t), prog = 0, n = 0, siap = false, jalan = false;
    if (kat === 'bgn' || kat === 'tahan') { var it = sisi.antri[kat]; if (it && it.tipe === t) { prog = it.bayar / it.biaya; jalan = true; } if (sisi.siap[kat] === t) siap = true; }
    else { sisi.antri[kat].forEach(function (q, i) { if (q.tipe === t) { n++; if (i === 0) { prog = q.bayar / q.biaya; jalan = true; } } }); }
    b.querySelector('.kameo-putar').style.background = jalan ? 'conic-gradient(rgba(0,0,0,0) ' + (prog * 360) + 'deg, rgba(8,10,6,0.62) 0)' : 'none';
    b.querySelector('.kameo-status').textContent = siap ? 'SIAP' : jalan && sisi.dana <= 0 ? 'DANA HABIS' : '';
    b.querySelector('.kameo-n').textContent = n > 1 ? n : '';
    b.classList.toggle('siap', siap); b.classList.toggle('jalan', jalan || n > 0);
    b.classList.toggle('taruh', !!(G.taruh && G.taruh.tipe === t));
  });
  /* titik di tab bila ada yang siap ditaruh */
  document.querySelectorAll('#tab-prod .tab').forEach(function (b) { b.classList.toggle('ada', (b.dataset.k === 'bgn' && !!sisi.siap.bgn) || (b.dataset.k === 'tahan' && !!sisi.siap.tahan)); });
  perbaruiKuasa();
  perbaruiInfo();
  /* bilah atas */
  $('#btn-logistik').classList.toggle('ada', G.logistik > 0);
  isiJikaBeda($('#btn-logistik'), ic('crate', 18) + '<span>Soal Logistik</span><b>' + (G.logistik > 0 ? '+' + angkaID(hadiahLogistik()) : 'mengisi ' + Math.max(0, Math.ceil(G.logistikT)) + ' dtk') + '</b>' + (G.logistik > 1 ? '<i>' + G.logistik + '</i>' : ''));
  isiJikaBeda($('#tujuan'), teksTujuan());
  isiJikaBeda($('#dana'), ic('dollar', 16) + '<b>' + angkaID(Math.floor(HUD.danaTampil)) + '</b>');
}

/* ganti isi hanya bila berubah, supaya klik tidak hilang karena elemen dibuat ulang */
function isiJikaBeda(el, html) { if (el._html !== html) { el._html = html; el.innerHTML = html; } }

function klikKameo(t) {
  var sisi = G.sisi[0], kat = katDari(t), tolak = alasanTolak(0, t);
  if (tolak) { pesan(tolak + '.', 'bahaya'); bunyi('salah'); return; }
  bunyi('klik');
  if (kat === 'bgn' || kat === 'tahan') {
    if (sisi.siap[kat] === t) { G.taruh = G.taruh && G.taruh.tipe === t ? null : { tipe: t }; G.bidikMortir = false; if (G.taruh) pesan('Pilih tempat di dekat bangunanmu. Klik kanan atau Esc untuk batal.', ''); }
    else if (sisi.siap[kat]) pesan('Taruh dulu ' + namaUnit(sisi.siap[kat], 'id') + ' yang sudah siap.', 'bahaya');
    else if (sisi.antri[kat]) pesan('Masih membangun ' + namaUnit(sisi.antri[kat].tipe, 'id') + '.', '');
    else mulaiBuat(0, t);
  } else if (!mulaiBuat(0, t)) pesan('Antrean penuh.', 'bahaya');
  perbaruiHUD(true);
}

/* ---------- kekuatan khusus ---------- */
function perbaruiKuasa() {
  var box = $('#kuasa'), sisi = G.sisi[0], ada = !!bangunanMilik(0, 'siasat') || G.misi.kuasaAwal;
  if (!ada) { box.innerHTML = ''; box.dataset.sig = ''; return; }
  var sig = 'k';
  if (box.dataset.sig !== sig) {
    box.dataset.sig = sig; box.innerHTML = '';
    Object.keys(KUASA).forEach(function (k) {
      var b = document.createElement('button'); b.className = 'kuasa'; b.dataset.k = k;
      b.innerHTML = '<span class="kuasa-ikon">' + ic(KUASA[k].ikon, 20) + '</span><span class="kuasa-teks"><b>' + KUASA[k].nama + '</b><em></em></span><span class="kuasa-bar"><i></i></span>';
      b.title = KUASA[k].ket; b.onclick = function () { pakaiKuasa(k); };
      box.appendChild(b);
    });
  }
  box.querySelectorAll('.kuasa').forEach(function (b) {
    var k = b.dataset.k, q = sisi.kuasa[k], f = Math.min(1, q.isi / KUASA[k].isi);
    b.querySelector('.kuasa-bar i').style.width = (f * 100) + '%';
    b.classList.toggle('siap', f >= 1);
    b.querySelector('em').textContent = f >= 1 ? (G.bidikMortir && k === 'mortir' ? 'Pilih sasaran di peta' : 'Siap: jawab soal') : Math.ceil(KUASA[k].isi - q.isi) + ' dtk';
  });
}
function pakaiKuasa(k) {
  var q = G.sisi[0].kuasa[k];
  if (q.isi < KUASA[k].isi) { pesan(KUASA[k].nama + ' belum siap.', ''); return; }
  if (k === 'mortir' && G.bidikMortir) { G.bidikMortir = false; return; }
  bukaSoal(KUASA[k].nama, 'Jawab benar untuk melepaskan ' + KUASA[k].nama + '. Jika salah, pengisian mundur setengah.', function (benar) {
    if (!benar) { q.isi = KUASA[k].isi * 0.5; return; }
    if (k === 'serbu') {
      q.isi = 0; G.sisi[0].serbuT = 20; pesan('SERANGAN UMUM! Semua pasukan menyerbu lebih kuat dan cepat selama 20 detik.', 'baik'); lapor('Serangan umum! Merdeka!'); bunyi('peringatan');
    } else { G.bidikMortir = true; G.taruh = null; pesan('Klik titik sasaran Hujan Mortir di peta.', 'baik'); }
  });
}
function lepasMortir(x, y) {
  var q = G.sisi[0].kuasa.mortir; q.isi = 0; G.bidikMortir = false;
  for (var i = 0; i < 10; i++) (function (i) {
    tunda(i * 0.22, function () {
      var a = Math.random() * 6.3, r = Math.random() * 2.6 * TS, tx = x + Math.cos(a) * r, ty = y + Math.sin(a) * r;
      G.proj.push({ x: tx - 60, y: ty - 260, x0: tx - 60, y0: ty - 260, tx: tx, ty: ty, laju: 300, dmg: 110, w: SENJATA.artileri, s: 0, src: 0, jenis: 'lengkung', durasi: 0.9, umur: 0, target: 0, mortir: true });
      bunyi('peluit', tx, ty);
    });
  })(i);
  pesan('Hujan Mortir dilepaskan!', 'baik');
}
function langkahKuasa(dt) {
  var sisi = G.sisi[0];
  if (bangunanMilik(0, 'siasat') || G.misi.kuasaAwal) Object.keys(KUASA).forEach(function (k) { var q = sisi.kuasa[k]; if (q.isi < KUASA[k].isi) { q.isi += dt * (sisi.kurang ? 0.5 : 1); if (q.isi >= KUASA[k].isi) { pesan(KUASA[k].nama + ' siap digunakan.', 'baik'); lapor(KUASA[k].nama + ' siap'); } } });
  if (G.logistik < 3) { G.logistikT -= dt; if (G.logistikT <= 0) { G.logistik++; G.logistikT = 70; pesan('Kiriman logistik datang. Jawab Soal Logistik untuk tambahan Dana.', 'baik'); bunyi('uang'); } }
  langkahPesawat(dt);
}

/* ---------- soal logistik ---------- */
function hadiahLogistik() { return 400 + Math.min(3, G.beruntun) * 100; }
function jawabLogistik() {
  if (G.logistik <= 0) { pesan('Kiriman logistik berikutnya dalam ' + Math.ceil(G.logistikT) + ' detik.', ''); return; }
  var hadiah = hadiahLogistik();
  bukaSoal('Soal Logistik', 'Jawab benar: +' + angkaID(hadiah) + ' Dana. Jawaban benar berturut-turut menambah hadiah.', function (benar) {
    G.logistik--;
    if (benar) { G.sisi[0].dana += hadiah; G.sisi[0].stat.dana += hadiah; bunyi('uang'); pesan('+' + angkaID(hadiah) + ' Dana dari kiriman logistik.', 'baik'); }
  });
}

/* ---------- kartu soal ---------- */
function bukaSoal(judul, konteks, cb) {
  var mode = PENGATURAN.soal, lv = Math.min(2, G.misi.tingkat || 0);
  var s = ambilSoal(mode, G.misi.topik, lv), modal = $('#modal-soal');
  G.jeda = true;
  modal.innerHTML = '<div class="kartu-soal"><div class="ks-kepala">' + ic(s.topik === 'mtk' ? 'target' : 'book', 18) + '<span>' + judul + '</span><em>' + (s.topik === 'mtk' ? 'Matematika' : 'Sejarah') + '</em></div>' +
    '<p class="ks-konteks">' + konteks + '</p><h3 class="ks-soal">' + s.q + '</h3><div class="ks-pilihan"></div><div class="ks-hasil"></div></div>';
  var box = modal.querySelector('.ks-pilihan');
  s.pilihan.forEach(function (p, i) {
    var b = document.createElement('button'); b.className = 'ks-p'; b.innerHTML = '<i>' + 'ABCD'[i] + '</i><span>' + p + '</span>';
    b.onclick = function () {
      if (modal.dataset.jawab) return; modal.dataset.jawab = '1';
      var benar = i === s.benar;
      box.querySelectorAll('.ks-p').forEach(function (x, j) { x.classList.toggle('benar', j === s.benar); if (j === i && !benar) x.classList.add('salah'); x.disabled = true; });
      G.statSoal.total++; if (benar) { G.statSoal.benar++; G.beruntun++; } else G.beruntun = 0;
      if (s.topik !== 'mtk') G.statSoal.topik[s.topik] = (G.statSoal.topik[s.topik] || 0) + 1;
      bunyi(benar ? 'benar' : 'salah');
      modal.querySelector('.ks-hasil').innerHTML = '<div class="ks-' + (benar ? 'ok' : 'no') + '">' + ic(benar ? 'check' : 'close', 18) + '<b>' + (benar ? 'Benar!' : 'Belum tepat.') + '</b></div><p>' + s.e + '</p><button class="tombol utama" id="ks-lanjut">' + ic('play', 16) + ' Lanjut bertempur</button>';
      modal.querySelector('#ks-lanjut').onclick = function () { tutupSoal(); cb(benar); };
    };
    box.appendChild(b);
  });
  delete modal.dataset.jawab;
  modal.classList.add('buka');
}
function tutupSoal() { $('#modal-soal').classList.remove('buka'); G.jeda = false; perbaruiHUD(true); }

/* ---------- info pilihan ---------- */
function perbaruiInfo() {
  var box = $('#info'), p = G.pilih.filter(function (e) { return !e.mati; });
  var sig = p.map(function (e) { return e.id; }).join(',') + '|' + (p.length === 1 ? Math.round(p[0].hp / p[0].hpMaks * 25) + (p[0].perbaiki ? 'r' : '') + (p[0].utama ? 'u' : '') + Math.round((p[0].muat || 0) / 50) : '');
  if (box.dataset.sig === sig) return; box.dataset.sig = sig;
  if (!p.length) {
    box.innerHTML = '<div class="info-kosong">Klik unit atau seret kotak untuk memilih. Klik tanah untuk bergerak, klik musuh untuk menyerang.</div><div class="info-aksi"><button class="kecil" id="ia-semua">' + ic('swords', 14) + ' Pilih semua pasukan</button></div>';
    $('#ia-semua').onclick = pilihSemuaPasukan; return;
  }
  if (p.length === 1) {
    var e = p[0], d = UNIT[e.tipe] || BANGUN[e.tipe], f = e.hp / e.hpMaks, html = '<div class="info-satu"><div class="info-img"></div><div><b>' + namaUnit(e.tipe, e.fak) + '</b><small>' + (e.s === 0 ? 'Pasukan kita' : G.misi.namaMusuh) + (e.bunuh >= 3 ? ' · veteran' : '') + '</small>' +
      '<div class="info-hp"><i style="width:' + (f * 100) + '%;background:' + (f > 0.6 ? '#62c14a' : f > 0.3 ? '#e2c23a' : '#e04a32') + '"></i></div><small>' + Math.ceil(e.hp) + ' / ' + e.hpMaks + (e.tipe === 'truk' ? ' · muatan ' + Math.round(e.muat) + '/' + KAP_TRUK : '') + '</small></div></div><p class="info-ket">' + nilaiFak(d.ket, e.fak) + '</p>';
    if (e.s === 0 && e.k === 'bgn') {
      html += '<div class="info-aksi">' + (e.tipe !== 'hq' ? '<button class="kecil" id="ia-jual">' + ic('dollar', 14) + ' Jual</button>' : '') +
        '<button class="kecil' + (e.perbaiki ? ' nyala' : '') + '" id="ia-baiki">' + ic('wrench', 14) + (e.perbaiki ? ' Berhenti' : ' Perbaiki') + '</button>' +
        ((e.tipe === 'barak' || e.tipe === 'bengkel') ? '<button class="kecil' + (e.utama ? ' nyala' : '') + '" id="ia-utama">' + ic('flag', 14) + ' Utama</button>' : '') + '</div>';
    } else if (e.s === 0) html += '<div class="info-aksi"><button class="kecil" id="ia-henti">' + ic('pause', 14) + ' Berhenti</button><button class="kecil" id="ia-serbu">' + ic('crosshair', 14) + ' Serbu ke…</button></div>';
    box.innerHTML = html;
    box.querySelector('.info-img').appendChild(salinKanvas(ikonProduksi(e.tipe, e.fak)));
    if ($('#ia-jual')) $('#ia-jual').onclick = function () { jualBangunan(e); perbaruiHUD(true); };
    if ($('#ia-baiki')) $('#ia-baiki').onclick = function () { e.perbaiki = !e.perbaiki; bunyi('klik'); box.dataset.sig = ''; };
    if ($('#ia-utama')) $('#ia-utama').onclick = function () { G.ents.forEach(function (o) { if (o.s === 0 && o.tipe === e.tipe) o.utama = false; }); e.utama = true; bunyi('klik'); pesan('Unit baru akan keluar dari bangunan ini.', ''); box.dataset.sig = ''; };
  } else {
    var hitung = {}; p.forEach(function (e) { hitung[e.tipe] = (hitung[e.tipe] || 0) + 1; });
    box.innerHTML = '<div class="info-banyak">' + Object.keys(hitung).map(function (t) { return '<span class="ib" data-t="' + t + '"><i></i><b>' + hitung[t] + '</b></span>'; }).join('') + '</div>' +
      '<div class="info-aksi"><button class="kecil" id="ia-henti">' + ic('pause', 14) + ' Berhenti</button><button class="kecil" id="ia-serbu">' + ic('crosshair', 14) + ' Serbu ke…</button></div>';
    box.querySelectorAll('.ib').forEach(function (s) { s.querySelector('i').appendChild(salinKanvas(ikonProduksi(s.dataset.t, 'id'))); s.onclick = function () { G.pilih = G.pilih.filter(function (e) { return e.tipe === s.dataset.t; }); bunyi('pilih'); }; });
  }
  if ($('#ia-henti')) $('#ia-henti').onclick = function () { G.pilih.forEach(function (e) { if (e.k === 'unit' && e.s === 0) { e.jalur = []; e.target = 0; e.perintah = 'diam'; e.jagaX = e.x; e.jagaY = e.y; } }); bunyi('perintah'); };
  if ($('#ia-serbu')) $('#ia-serbu').onclick = function () { G.modeSerbu = true; pesan('Mode serbu: klik tujuan. Pasukan akan melawan musuh di sepanjang jalan.', ''); };
}
function salinKanvas(src) { var c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0); return c; }
function pilihSemuaPasukan() {
  G.pilih = G.ents.filter(function (e) { return e.s === 0 && e.k === 'unit' && !e.mati && e.senjata; });
  bunyi('pilih'); if (G.pilih.length) lapor('Siap, komandan');
}

/* ---------- peta mini ---------- */
function lukisMini() {
  var cv = $('#mini'), c = cv.getContext('2d'), W = cv.width, H = cv.height;
  if (!aktifRadar()) {
    c.fillStyle = '#0d100b'; c.fillRect(0, 0, W, H);
    for (var i = 0; i < 260; i++) { c.fillStyle = 'rgba(160,170,140,' + Math.random() * 0.25 + ')'; c.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
    return;
  }
  var kx = W / G.mw, ky = H / G.mh;
  c.imageSmoothingEnabled = false; c.drawImage(G.miniTanah, 0, 0, W, H);
  c.fillStyle = '#d2692a';
  for (var y = 0; y < G.mh; y++) for (var x = 0; x < G.mw; x++) { var j = idx(x, y); if (G.rempah[j] > 20 && G.jelajah[j]) c.fillRect(x * kx, y * ky, kx, ky); }
  G.ents.forEach(function (e) {
    if (e.mati || !terlihat(e)) return;
    c.fillStyle = e.s === 0 ? '#ff5b4f' : FAKSI[e.fak].tim;
    if (e.k === 'bgn') c.fillRect(e.tx * kx, e.ty * ky, e.w * kx, e.h * ky); else c.fillRect(e.x / TS * kx - 1, e.y / TS * ky - 1, 2.5, 2.5);
  });
  c.imageSmoothingEnabled = true; if (G.kabut) c.drawImage(G.kabut, 0, 0, W, H);
  c.strokeStyle = '#f2efe6'; c.lineWidth = 1;
  c.strokeRect(G.cam.x / TS * kx, G.cam.y / TS * ky, G.view.w / G.zoom / TS * kx, G.view.h / G.zoom / TS * ky);
  if (G.titikSerang && G.t - G.akhirDiserang < 6) { c.strokeStyle = 'rgba(255,80,60,' + (Math.sin(G.waktuNyata * 10) * 0.5 + 0.5) + ')'; c.beginPath(); c.arc(G.titikSerang.x / TS * kx, G.titikSerang.y / TS * ky, 8, 0, 7); c.stroke(); }
}
function pasangMiniPeta(cv) {
  var tekan = false;
  function ke(ev) {
    if (!aktifRadar()) return;
    var r = cv.getBoundingClientRect(), p = ev.touches ? ev.touches[0] : ev;
    var x = (p.clientX - r.left) / r.width * G.mw * TS, y = (p.clientY - r.top) / r.height * G.mh * TS;
    if (ev.button === 2 && G.pilih.length) { perintahPilihan(Math.floor(x / TS), Math.floor(y / TS), null); return; }
    pusatkanKamera(x, y);
  }
  cv.onmousedown = function (ev) { tekan = true; ke(ev); };
  cv.onmousemove = function (ev) { if (tekan) ke(ev); };
  window.addEventListener('mouseup', function () { tekan = false; });
  cv.addEventListener('touchstart', function (ev) { ev.preventDefault(); ke(ev); }, { passive: false });
  cv.addEventListener('touchmove', function (ev) { ev.preventDefault(); ke(ev); }, { passive: false });
  cv.oncontextmenu = function (ev) { ev.preventDefault(); };
}

/* ---------- pesan berjalan ---------- */
function pesan(teks, jenis) {
  if (!G || !document.getElementById('pesan')) return;
  var box = $('#pesan'), el = document.createElement('div');
  el.className = 'pesan ' + (jenis || ''); el.textContent = teks;
  box.appendChild(el);
  while (box.children.length > 4) box.removeChild(box.firstChild);
  setTimeout(function () { el.classList.add('pudar'); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 600); }, 6000);
}
