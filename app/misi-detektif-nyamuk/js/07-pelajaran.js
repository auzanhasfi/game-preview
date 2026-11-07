/* Misi Detektif Nyamuk: keadaan permainan, HUD, toast, dan enjin stesen
   (pembuka → kad pelajaran dengan petunjuk untuk diketik → mini-game → bukti). */
'use strict';

var G = { keadaan: 'menu', prolog: false, selesai: [], skor: {}, tangkap: 0, bersih: 0, uji: null, akhir: null, nama: '', poster: null };
var KUNCI = 'detektif-nyamuk-v1';
function simpan() { try { localStorage.setItem(KUNCI, JSON.stringify({ prolog: G.prolog, selesai: G.selesai, skor: G.skor, tangkap: G.tangkap, bersih: G.bersih, nama: G.nama, akhir: G.akhir })); } catch (e) {} }
function muatSimpanan() { try { var d = JSON.parse(localStorage.getItem(KUNCI) || 'null'); if (d) { Object.assign(G, d); return true; } } catch (e) {} return false; }
function padamSimpanan() { try { localStorage.removeItem(KUNCI); } catch (e) {} }

function $(s) { return document.querySelector(s); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function acak(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

var toastT = null;
function toast(teks, jenis, ms) { if (G.keadaan !== 'peta') return; var el = $('#toast'); el.className = 'toast ' + (jenis || ''); el.innerHTML = (jenis === 'fakta' ? ic('sparkle', 18) : jenis === 'ok' ? ic('check', 18) : ic('search', 18)) + '<span>' + esc(teks) + '</span>'; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, ms || 3200); }

function kemasHud() {
  $('#hud-bukti b').textContent = G.selesai.length + '/6';
  $('#hud-nyamuk b').textContent = G.tangkap;
  $('#hud-bersih b').textContent = G.bersih;
  var nx = stesenSeterusnya(), m;
  if (!G.prolog) m = 'Latihan: tangkap 3 nyamuk. Ketik nyamuk atau berjalan melaluinya.';
  else if (nx >= 0) m = 'Misi ' + (nx + 1) + ': pergi ke ' + STESEN[nx].nama + ' (' + STESEN[nx].misi + ')';
  else if (!G.akhir) m = 'Semua bukti lengkap! Serbu Paya Raja Comot di tengah taman.';
  else m = 'Kes selesai. Teruskan meronda dan bersihkan takungan air.';
  $('#hud-misi span:last-child').textContent = m;
}

/* ---------- stesen ---------- */
var ST = { s: null, i: 0, langkah: [], k: 0 };
function bukaStesen(i) {
  var s = STESEN[i]; ST.s = s; ST.i = i; ST.k = 0;
  ST.langkah = [{ jenis: 'pembuka' }].concat(s.kad.map(function (k) { return { jenis: 'kad', kad: k }; }), [{ jenis: 'mini' }, { jenis: 'bukti' }]);
  G.keadaan = 'stesen'; P.tx = null; KEKUNCI = {}; $('#toast').hidden = true;
  $('#l-tajuk').textContent = s.misi; $('#l-tempat').textContent = s.nama; $('#l-tp').textContent = s.tp + ' · SP ' + s.sp;
  $('#lapis').hidden = false; sfx('tap'); paparLangkah();
}
function tutupStesen() { diam(); $('#lapis').hidden = true; G.uji = null; G.keadaan = 'peta'; kemasHud(); }

function paparLangkah() {
  diam(); G.uji = null;
  var L = ST.langkah[ST.k], s = ST.s, isi = $('#l-isi'), kaki = $('#l-lanjut');
  $('#l-titik').innerHTML = ST.langkah.map(function (x, i) { return '<i class="' + (i < ST.k ? 'sudah' : i === ST.k ? 'kini' : '') + '"></i>'; }).join('');
  $('#l-dengar').hidden = !bacaAda();
  kaki.hidden = false; kaki.disabled = false; kaki.querySelector('span').textContent = 'Seterusnya';
  isi.scrollTop = 0;
  if (L.jenis === 'pembuka') {
    isi.innerHTML = '<div class="seni"><canvas data-seni="pembuka" data-st="' + s.id + '"></canvas></div><div class="tks"><span class="eyebrow">Fail kes ' + (ST.i + 1) + ' daripada 6</span><h3>' + esc(s.nama) + '</h3><p class="besar">' + esc(s.pembuka) + '</p><p class="redup">Kumpul petunjuk dalam ' + s.kad.length + ' kad, kemudian selesaikan cabaran untuk mendapat bukti.</p></div>';
    kaki.querySelector('span').textContent = 'Mula siasat';
    ST.bacaan = s.pembuka;
  } else if (L.jenis === 'kad') {
    var k = L.kad;
    isi.innerHTML = '<div class="seni"><canvas data-seni="' + k.seni + '"></canvas>' + (k.anim ? '<button class="bbtn mainanim" type="button" data-uji="main-anim">' + ic('play', 18) + '<span>Main</span></button>' : '') + '</div>' +
      '<div class="tks"><span class="eyebrow">Petunjuk ' + (ST.k) + ' daripada ' + s.kad.length + '</span><h3>' + esc(k.tajuk) + '</h3><p class="besar">' + esc(k.teks) + '</p>' +
      '<div class="dedah">' + k.dedah.map(function (d, i) { return '<button type="button" class="dd" data-uji="dedah" data-i="' + i + '"><span class="dd-ik">' + ic('search', 20) + '</span><span class="dd-tx"><b>' + esc(d[0]) + '</b><em>' + (d[1] ? esc(d[1]) : '&nbsp;') + '</em></span></button>'; }).join('') + '</div>' +
      '<p class="redup baki">Ketik setiap kanta untuk membuka petunjuk.</p></div>';
    var kanv = isi.querySelector('canvas');
    if (k.anim) isi.querySelector('.mainanim').onclick = function () { kanv._main = masa; sfx('tap'); this.querySelector('span').textContent = 'Main semula'; };
    var tinggal = k.dedah.length; kaki.disabled = true;
    isi.querySelectorAll('.dd').forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains('buka')) { baca(k.dedah[+b.dataset.i].join(', ')); return; }
        b.classList.add('buka'); b.querySelector('.dd-ik').innerHTML = ic('check', 20); sfx('dedah'); tinggal--;
        if (tinggal <= 0) { kaki.disabled = false; isi.querySelector('.baki').textContent = 'Semua petunjuk dibuka. Ketik lagi untuk dengar.'; }
        else isi.querySelector('.baki').textContent = 'Lagi ' + tinggal + ' petunjuk.';
      };
    });
    ST.bacaan = k.tajuk + '. ' + k.teks + ' ' + k.dedah.map(function (d) { return d.join(', '); }).join('. ');
  } else if (L.jenis === 'mini') {
    kaki.hidden = true; isi.innerHTML = '';
    MINI[s.id](isi, function (betul, jumlah) { G.skor[s.id] = { betul: betul, jumlah: jumlah }; ST.k++; paparLangkah(); });
    ST.bacaan = (isi.querySelector('.arahan') || {}).textContent || '';
  } else if (L.jenis === 'bukti') {
    var sk = G.skor[s.id] || { betul: 0, jumlah: 0 };
    isi.innerHTML = '<div class="seni bukti-seni"><canvas data-seni="bukti" data-st="' + s.id + '"></canvas></div><div class="tks"><span class="eyebrow">Bukti ' + (ST.i + 1) + ' dijumpai · ' + s.tp + '</span><h3>Bukti dimasukkan ke Buku Kes</h3><blockquote class="bkt">' + esc(s.bukti) + '</blockquote><p class="redup">Cabaran: ' + sk.betul + ' daripada ' + sk.jumlah + ' betul pada cubaan pertama.</p></div>';
    kaki.querySelector('span').textContent = 'Kembali ke peta';
    sfx('bukti'); ST.bacaan = s.bukti;
    if (G.selesai.indexOf(s.id) < 0) G.selesai.push(s.id); simpan();
  }
  daftarSeni(isi);
}
function lanjut() {
  sfx('tap');
  if (ST.k >= ST.langkah.length - 1) { tutupStesen(); var nx = stesenSeterusnya(); toast(nx >= 0 ? 'Misi seterusnya: ' + STESEN[nx].nama + '. Ikut anak panah emas.' : 'Enam bukti lengkap! Pergi ke Paya Raja Comot.', 'ok', 4500); return; }
  ST.k++; paparLangkah();
}

/* seni pembuka & bukti mengikut stesen */
SENI.pembuka = function (w, h, t, c) {
  var id = c.getAttribute('data-st'); latar(w, h, '#f6efe2'); lantai(w, h, h - 24);
  drawClawd(w * 0.2, h - 24, { s: 1.9, face: 0.7, t: t, lens: true, mood: 'think', blink: (t % 3) < 0.12 });
  if (id === 'kenal') { drawOrang(w * 0.62, h - 24, 1.7, { tudung: '#7f9fd9', baju: '#f19bb4', sakit: true, t: t }); for (var i = 0; i < 2; i++) { var a = terbang(w * 0.82, h * 0.35 + i * 30, 20, 10, t + i * 3, 1.4); drawNyamuk(a[0], a[1], 1.6, i ? 'tiruk' : 'aedes', t); } }
  else if (id === 'rantai') { drawOrang(w * 0.62, h - 24, 1.7, { kot: true, tudung: '#7fb8d9', t: t }); drawOrang(w * 0.85, h - 24, 1.5, { uban: true, baju: '#9aa3a8', t: t }); }
  else if (id === 'simptom') { drawOrang(w * 0.55, h - 24, 1.7, { kot: true, tudung: '#d6496a', t: t }); [0.72, 0.84, 0.96].forEach(function (x, i) { drawOrang(w * x, h - 24, 1.1, { baju: ['#f19bb4', '#9aa3a8', '#f2c14e'][i], sakit: true, t: t + i }); }); }
  else if (id === 'ronda') { drawBekas('pasu', w * 0.52, h - 24, 1.5, { t: t }); drawBekas('tayar', w * 0.72, h - 26, 1.4, { t: t }); drawBekas('tempayan', w * 0.9, h - 24, 1.3, { t: t }); }
  else if (id === 'cerita') { drawOrang(w * 0.6, h - 24, 1.7, { uban: true, baju: '#9aa3a8', t: t }); drawOrang(w * 0.82, h - 24, 1.3, { baju: '#f2c14e', sakit: true, t: t }); }
  else { ctx.fillStyle = '#fff'; ctx.fillRect(w * 0.5, h * 0.18, w * 0.4, h * 0.6); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(w * 0.5, h * 0.18, w * 0.4, h * 0.6); label('PAPAN NOTIS', w * 0.7, h * 0.3, INK, 13); ctx.setLineDash([5, 5]); ctx.strokeRect(w * 0.56, h * 0.36, w * 0.28, h * 0.34); ctx.setLineDash([]); label('Poster kamu di sini', w * 0.7, h * 0.55, '#8a7e6a', 12); }
};
SENI.bukti = function (w, h, t) {
  latar(w, h, '#f3f1e6'); var r = Math.min(w, h) * 0.32;
  for (var i = 0; i < 10; i++) { var a = i * 0.628 + t * 0.4; star4(w / 2 + Math.cos(a) * r * 1.5, h * 0.5 + Math.sin(a) * r * 0.9, 4 + Math.sin(t * 4 + i) * 2, a, GOLD, 1.8); }
  ctx.save(); ctx.translate(w / 2 + 40, h * 0.5); ctx.rotate(Math.sin(t * 2) * 0.05); ctx.fillStyle = '#b8935c'; ctx.fillRect(-36, -44, 72, 88); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.strokeRect(-36, -44, 72, 88); ctx.fillStyle = '#fffaf0'; ctx.fillRect(-28, -34, 56, 30); ctx.strokeRect(-28, -34, 56, 30); label('BUKTI', 0, -14, INK, 13); ctx.restore();
  drawClawd(w / 2 - 50, h * 0.86, { s: 1.9, face: 0.6, t: t, mood: 'happy' });
};
