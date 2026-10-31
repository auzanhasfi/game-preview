/* Siaga Merdeka: layar judul, kampanye, briefing, pertempuran bebas, belajar sejarah, cara main, pengaturan, dan jeda. */
'use strict';

var PENGATURAN = { soal: 'campur', tepi: true, musik: true, cepat: false };
try { Object.assign(PENGATURAN, JSON.parse(localStorage.getItem('siaga-merdeka-atur') || '{}')); } catch (e) { }
function simpanAtur() { try { localStorage.setItem('siaga-merdeka-atur', JSON.stringify(PENGATURAN)); } catch (e) { } AU.musikNyala = PENGATURAN.musik; }
AU.musikNyala = PENGATURAN.musik;

function tampilLayar(id) {
  document.querySelectorAll('.layar').forEach(function (l) { l.classList.toggle('aktif', l.id === id); });
  if (id === 'layar-judul') mulaiJudul(); else JUDUL.jalan = false;
  if (id === 'layar-kampanye') isiKampanye();
  if (id === 'layar-belajar') isiBelajar();
  window.scrollTo(0, 0);
}

/* ---------- latar layar judul yang bergerak ---------- */
var JUDUL = { jalan: false, t: 0 };
function mulaiJudul() {
  if (JUDUL.jalan) return; JUDUL.jalan = true;
  var cv = $('#judul-bg'), c = cv.getContext('2d'), awal = performance.now();
  function bingkai(now) {
    if (!JUDUL.jalan) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var t = (now - awal) / 1000; lukisJudul(c, W, H, t);
    requestAnimationFrame(bingkai);
  }
  requestAnimationFrame(bingkai);
}
function lukisJudul(c, W, H, t) {
  var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1c1612'); g.addColorStop(0.45, '#5a2a1c'); g.addColorStop(0.72, '#b4552c'); g.addColorStop(1, '#2a1a12');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  var hz = H * 0.72;
  c.fillStyle = 'rgba(255,214,150,0.85)'; c.beginPath(); c.arc(W * 0.28, hz - H * 0.08, Math.min(W, H) * 0.11, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,200,130,0.18)'; c.beginPath(); c.arc(W * 0.28, hz - H * 0.08, Math.min(W, H) * 0.2, 0, 7); c.fill();
  /* lampu sorot */
  c.save(); c.globalCompositeOperation = 'lighter';
  [[0.82, 0.4], [0.62, -0.3]].forEach(function (s, i) {
    var a = -Math.PI / 2 + Math.sin(t * 0.35 + i * 2) * 0.5 + s[1] * 0.3, x = W * s[0], y = hz;
    var gr = c.createLinearGradient(x, y, x + Math.cos(a) * H, y + Math.sin(a) * H); gr.addColorStop(0, 'rgba(255,240,200,0.16)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
    c.fillStyle = gr; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a - 0.06) * H * 1.2, y + Math.sin(a - 0.06) * H * 1.2); c.lineTo(x + Math.cos(a + 0.06) * H * 1.2, y + Math.sin(a + 0.06) * H * 1.2); c.fill();
  });
  c.restore();
  /* gunung berlapis */
  [['#3b1f17', 0.58, 0.22, 1], ['#2a1712', 0.66, 0.14, 2], ['#1b100c', 0.72, 0.08, 3]].forEach(function (l) {
    c.fillStyle = l[0]; c.beginPath(); c.moveTo(0, H);
    for (var x = 0; x <= W; x += 8) { var y = H * l[1] - Math.max(0, Math.sin(x / W * Math.PI * l[3] + l[3]) * H * l[2]) - Math.sin(x * 0.03 + l[3]) * 6; c.lineTo(x, y); }
    c.lineTo(W, H); c.fill();
  });
  /* asap dari kejauhan */
  for (var i = 0; i < 3; i++) for (var k = 0; k < 8; k++) {
    var px = W * (0.45 + i * 0.18) + Math.sin(t * 0.5 + k) * 10 + k * 6, py = hz - 10 - ((t * 18 + k * 22) % 170), r = 8 + ((t * 18 + k * 22) % 170) * 0.15;
    c.fillStyle = 'rgba(30,20,16,' + (0.35 - ((t * 18 + k * 22) % 170) / 600) + ')'; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill();
  }
  /* tanah dan pohon kelapa */
  c.fillStyle = '#120b08'; c.fillRect(0, hz, W, H - hz);
  [[0.08, 1.1], [0.15, 0.85], [0.92, 1.2], [0.86, 0.9]].forEach(function (p) {
    var x = W * p[0], h = H * 0.3 * p[1], ay = Math.sin(t * 0.8 + p[0] * 9) * 3;
    c.strokeStyle = '#120b08'; c.lineWidth = 5 * p[1]; c.beginPath(); c.moveTo(x, hz + 4); c.quadraticCurveTo(x + 14, hz - h * 0.5, x + 6 + ay, hz - h); c.stroke();
    c.lineWidth = 3 * p[1];
    for (var a = 0; a < 7; a++) { var s = -Math.PI + a / 6 * Math.PI + Math.sin(t + a) * 0.05; c.beginPath(); c.moveTo(x + 6 + ay, hz - h); c.quadraticCurveTo(x + 6 + ay + Math.cos(s) * 30 * p[1], hz - h + Math.sin(s) * 20 - 14, x + 6 + ay + Math.cos(s) * 52 * p[1], hz - h + Math.sin(s) * 26 + 18); c.stroke(); }
  });
  /* tank berjalan */
  for (var n = 0; n < 3; n++) {
    var lebar = W + 300, x0 = ((t * 26 + n * lebar / 3) % lebar) - 150, y0 = hz + 6;
    c.fillStyle = '#0c0705';
    c.beginPath(); c.moveTo(x0 - 46, y0); c.lineTo(x0 + 46, y0); c.lineTo(x0 + 40, y0 - 14); c.lineTo(x0 - 42, y0 - 14); c.fill();
    c.fillRect(x0 - 34, y0 - 24, 40, 11); c.fillRect(x0 + 4, y0 - 21, 46, 4);
    c.beginPath(); c.arc(x0 - 14, y0 - 24, 12, Math.PI, 0); c.fill();
  }
  /* bendera Merah Putih besar */
  var fx = W * 0.74, fy = hz - H * 0.42, fw = Math.min(W * 0.2, 220), fh = fw * 0.62;
  c.strokeStyle = '#0c0705'; c.lineWidth = 4; c.beginPath(); c.moveTo(fx, hz + 4); c.lineTo(fx, fy - 6); c.stroke();
  for (var j = 0; j < 2; j++) {
    c.fillStyle = j ? '#efe8dc' : '#cf2a2f'; c.beginPath();
    for (var q = 0; q <= 24; q++) { var xx = fx + fw * q / 24, o = Math.sin(t * 3.2 - q * 0.42) * fh * 0.09 * q / 24; c.lineTo(xx, fy + j * fh / 2 + o); }
    for (var q2 = 24; q2 >= 0; q2--) { var xx2 = fx + fw * q2 / 24, o2 = Math.sin(t * 3.2 - q2 * 0.42) * fh * 0.09 * q2 / 24; c.lineTo(xx2, fy + (j + 1) * fh / 2 + o2); }
    c.fill();
  }
  c.fillStyle = 'rgba(0,0,0,0.12)'; for (var s2 = 0; s2 < 24; s2 += 3) { var o3 = Math.sin(t * 3.2 - s2 * 0.42); if (o3 > 0) c.fillRect(fx + fw * s2 / 24, fy, fw / 12, fh); }
  var v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
  c.fillStyle = v; c.fillRect(0, 0, W, H);
}

/* ---------- kampanye ---------- */
function isiKampanye() {
  var p = progres(), box = $('#daftar-misi'); box.innerHTML = '';
  MISI.forEach(function (m, i) {
    var buka = i === 0 || p[MISI[i - 1].id] > 0, b = document.createElement('button');
    b.className = 'kartu-misi' + (buka ? '' : ' kunci');
    var bt = ''; for (var k = 0; k < 3; k++) bt += '<span class="bintang' + (k < (p[m.id] || 0) ? ' nyala' : '') + '">' + ic('star', 14) + '</span>';
    b.innerHTML = '<span class="km-no">' + (i + 1) + '</span><span class="km-isi"><em>' + m.tempat + ' · ' + m.tahun + '</em><b>' + m.judul + '</b><small>' + m.ringkas + '</small></span>' +
      '<span class="km-kanan"><span class="km-lawan">' + benderaKecil(m.musuh) + m.namaMusuh + '</span><span class="km-bintang">' + bt + '</span>' + (buka ? '' : '<span class="km-kunci">' + ic('lock', 16) + ' Selesaikan misi sebelumnya</span>') + '</span>';
    if (buka) b.onclick = function () { bunyi('klik'); bukaBriefing(m); };
    box.appendChild(b);
  });
}
function benderaKecil(f) {
  if (f === 'id') return '<i class="bk"><s style="background:#cf2a2f"></s><s style="background:#efe8dc"></s></i>';
  if (f === 'nl') return '<i class="bk"><s style="background:#c4262e"></s><s style="background:#efe8dc"></s><s style="background:#2a4b9b"></s></i>';
  return '<i class="bk jp"><s style="background:#efe8dc"></s><u></u></i>';
}

function kartuPelajaranHTML(L) {
  return '<p class="kicker">' + ic('book', 14) + ' Pelajaran sejarah · ' + L.tahun + '</p><h2>' + L.judul + '</h2><ol class="fakta">' + L.isi.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol><p class="tahukah"><b>Tahukah kamu?</b> ' + L.tahukah + '</p>';
}
function bukaBriefing(m) {
  var L = PELAJARAN[m.pelajaran], tj = m.tujuan;
  var tujuan = tj.tipe === 'hq' ? 'Hancurkan ' + namaUnit('hq', m.musuh) + (tj.batas ? ' dalam ' + Math.round(tj.batas / 60) + ' menit' : '') : tj.tipe === 'semua' ? 'Hancurkan semua bangunan musuh' : 'Bertahan selama ' + Math.round(tj.detik / 60) + ' menit';
  $('#briefing-isi').innerHTML = '<div class="brief-kiri"><p class="kicker">Misi ' + (MISI.indexOf(m) + 1) + ' · ' + m.tempat + '</p><h1>' + m.judul + '</h1><p class="brief-ringkas">' + m.ringkas + '</p>' +
    '<div class="brief-tujuan">' + ic('target', 18) + '<div><small>Tujuan</small><b>' + tujuan + '</b></div></div>' +
    '<div class="brief-tujuan">' + benderaKecil(m.musuh) + '<div><small>Lawan</small><b>' + m.namaMusuh + '</b></div></div>' +
    '<div class="brief-tujuan">' + ic('question', 18) + '<div><small>Soal di medan perang</small><b>' + { sejarah: 'Sejarah', mtk: 'Matematika', campur: 'Sejarah + Matematika' }[PENGATURAN.soal] + '</b></div></div>' +
    '<div class="brief-tombol"><button class="tombol utama besar" id="b-mulai">' + ic('play', 18) + ' Mulai pertempuran</button><button class="tombol" id="b-kembali">' + ic('back', 16) + ' Kembali</button></div></div>' +
    '<div class="brief-kanan kartu-pelajaran">' + kartuPelajaranHTML(L) + '</div>';
  tampilLayar('layar-briefing');
  $('#b-mulai').onclick = function () { audioSiap(); bunyi('klik'); mulaiMisi(m); };
  $('#b-kembali').onclick = function () { tampilLayar('layar-kampanye'); };
}

/* ---------- belajar sejarah + latihan ---------- */
function isiBelajar() {
  var box = $('#daftar-pelajaran'); box.innerHTML = ''; $('#latihan').innerHTML = '';
  URUT_PELAJARAN.forEach(function (k, i) {
    var L = PELAJARAN[k], b = document.createElement('button'); b.className = 'kartu-garis';
    b.innerHTML = '<span class="kg-no">' + ('0' + (i + 1)).slice(-2) + '</span><span><em>' + L.tahun + '</em><b>' + L.judul + '</b></span>' + ic('next', 18);
    b.onclick = function () { bukaPelajaran(k); };
    box.appendChild(b);
  });
}
function bukaPelajaran(k) {
  var L = PELAJARAN[k], box = $('#latihan');
  box.innerHTML = '<div class="kartu-pelajaran">' + kartuPelajaranHTML(L) + '<button class="tombol utama" id="mulai-latihan">' + ic('target', 16) + ' Latihan 5 soal</button></div>';
  $('#mulai-latihan').onclick = function () { latihan(L.topik); };
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function latihan(topik) {
  var box = $('#latihan'), no = 0, benar = 0;
  function soalBerikut() {
    if (no >= 5) { box.innerHTML = '<div class="kartu-pelajaran"><h2>Skor latihan: ' + benar + ' / 5</h2><p>' + (benar >= 4 ? 'Hebat! Kamu siap memimpin pasukan.' : 'Baca lagi kartu pelajarannya lalu coba sekali lagi.') + '</p><button class="tombol utama" id="ulang-lat">' + ic('spin', 16) + ' Ulangi</button></div>'; $('#ulang-lat').onclick = function () { latihan(topik); }; return; }
    var s = ambilSoal('sejarah', topik, 0); no++;
    box.innerHTML = '<div class="kartu-soal datar"><div class="ks-kepala">' + ic('book', 18) + '<span>Soal ' + no + ' dari 5</span><em>Skor ' + benar + '</em></div><h3 class="ks-soal">' + s.q + '</h3><div class="ks-pilihan"></div><div class="ks-hasil"></div></div>';
    var pil = box.querySelector('.ks-pilihan'), dijawab = false;
    s.pilihan.forEach(function (p, i) {
      var b = document.createElement('button'); b.className = 'ks-p'; b.innerHTML = '<i>' + 'ABCD'[i] + '</i><span>' + p + '</span>';
      b.onclick = function () {
        if (dijawab) return; dijawab = true; audioSiap();
        var ok = i === s.benar; if (ok) benar++; bunyi(ok ? 'benar' : 'salah');
        pil.querySelectorAll('.ks-p').forEach(function (x, j) { x.classList.toggle('benar', j === s.benar); if (j === i && !ok) x.classList.add('salah'); x.disabled = true; });
        box.querySelector('.ks-hasil').innerHTML = '<p>' + s.e + '</p><button class="tombol utama" id="lat-lanjut">' + ic('next', 16) + ' Lanjut</button>';
        $('#lat-lanjut').onclick = soalBerikut;
      };
      pil.appendChild(b);
    });
  }
  soalBerikut();
}

/* ---------- pertempuran bebas ---------- */
var BEBAS = { musuh: 'nl', lvl: 1 };
function pasangBebas() {
  document.querySelectorAll('[data-bebas-musuh]').forEach(function (b) { b.onclick = function () { BEBAS.musuh = b.dataset.bebasMusuh; segarBebas(); bunyi('klik'); }; });
  document.querySelectorAll('[data-bebas-lvl]').forEach(function (b) { b.onclick = function () { BEBAS.lvl = +b.dataset.bebasLvl; segarBebas(); bunyi('klik'); }; });
  $('#bebas-mulai').onclick = function () { audioSiap(); mulaiMisi(misiBebas(BEBAS.musuh, BEBAS.lvl)); };
  segarBebas();
}
function segarBebas() {
  document.querySelectorAll('[data-bebas-musuh]').forEach(function (b) { b.classList.toggle('pilih', b.dataset.bebasMusuh === BEBAS.musuh); });
  document.querySelectorAll('[data-bebas-lvl]').forEach(function (b) { b.classList.toggle('pilih', +b.dataset.bebasLvl === BEBAS.lvl); });
}

/* ---------- pengaturan ---------- */
function pasangPengaturan() {
  document.querySelectorAll('[data-soal]').forEach(function (b) { b.onclick = function () { PENGATURAN.soal = b.dataset.soal; simpanAtur(); segarAtur(); bunyi('klik'); }; });
  document.querySelectorAll('[data-atur]').forEach(function (b) { b.onclick = function () { var k = b.dataset.atur; PENGATURAN[k] = !PENGATURAN[k]; simpanAtur(); segarAtur(); bunyi('klik'); if (G) G.cepat = PENGATURAN.cepat ? 1.4 : 1; }; });
  segarAtur();
}
function segarAtur() {
  document.querySelectorAll('[data-soal]').forEach(function (b) { b.classList.toggle('pilih', b.dataset.soal === PENGATURAN.soal); });
  document.querySelectorAll('[data-atur]').forEach(function (b) { b.classList.toggle('nyala', !!PENGATURAN[b.dataset.atur]); });
}

/* ---------- jeda ---------- */
function bukaJeda() {
  if (!G || !G.berjalan || G.selesai) return;
  G.jeda = true; $('#modal-jeda').classList.add('buka'); segarAtur();
}
function tutupJeda() { $('#modal-jeda').classList.remove('buka'); if (!$('#modal-soal').classList.contains('buka')) G.jeda = false; }
function pasangJeda() {
  $('#j-lanjut').onclick = tutupJeda;
  $('#j-ulang').onclick = function () { $('#modal-jeda').classList.remove('buka'); var m = G.misi; G.berjalan = false; mulaiMisi(m.id ? m : misiBebas(m.musuh, m.ai.lvl)); };
  $('#j-keluar').onclick = function () { $('#modal-jeda').classList.remove('buka'); G.berjalan = false; musikBerhenti(); tampilLayar('layar-judul'); };
}
