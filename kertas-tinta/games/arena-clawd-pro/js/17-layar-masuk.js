/* Arena Clawd Pro: kerangka layar ML (tampil/sembunyi, lembar modal) + layar memuat + masuk akun */
'use strict';

var mlEl = document.getElementById('ml'), mlScr = '', artDt = 1 / 60;
function mlShow(scr, html) {
  mlScr = scr; mlEl.innerHTML = html; mlEl.hidden = false; mlEl.scrollTop = 0;
  document.body.classList.add('ml-on'); document.body.classList.remove('arena-on');
  document.getElementById('menu').hidden = true; document.getElementById('game').hidden = true;
  artAll(true);
}
function mlHide() { mlEl.hidden = true; mlEl.innerHTML = ''; mlScr = ''; document.body.classList.remove('ml-on'); mlSheetClose(); }
function mlSheet(html, cls) {
  mlSheetClose();
  var d = document.createElement('div'); d.className = 'mlsheet'; d.id = 'mlsheet';
  d.innerHTML = '<div class="box pn ' + (cls || '') + '" role="dialog" aria-modal="true">' + html + '</div>';
  d.addEventListener('click', function (e) { if (e.target === d && !d.hasAttribute('data-wajib')) mlSheetClose(); });
  document.body.appendChild(d); artAll(true); return d;
}
function mlSheetClose() { var d = document.getElementById('mlsheet'); if (d) d.remove(); }
function $ml(sel) { return (document.getElementById('mlsheet') && document.getElementById('mlsheet').querySelector(sel)) || mlEl.querySelector(sel); }
function onAll(sel, fn) { document.querySelectorAll(sel).forEach(function (b) { b.onclick = function (e) { sfx('tap'); fn(b, e); }; }); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function faceCv(hero, skin, anim) { return '<canvas data-art="face" data-hero="' + hero + '" data-skin="' + (skin || 'dasar') + '"' + (anim ? ' data-anim' : '') + '></canvas>'; }

/* ---------- 1. layar memuat (logo, bilah muat, tips) ---------- */
var TIPS = [
  ['Tips: dekati menara musuh lalu tekan tombol SOAL. Jawaban benar menjatuhkan pensil raksasa!', 'Petua: dekati menara musuh lalu tekan butang SOALAN. Jawapan betul menjatuhkan pensel gergasi!'],
  ['Tips: 3 jawaban benar berturut-turut memicu Ledakan Kombo.', 'Petua: 3 jawapan betul berturut-turut mencetuskan Letupan Kombo.'],
  ['Tips: bersembunyi di semak supaya menara tidak melihatmu.', 'Petua: bersembunyi dalam semak supaya menara tidak nampak kamu.'],
  ['Tips: tombol beli cepat di kanan atas membeli item build berikutnya.', 'Petua: butang beli pantas di kanan atas membeli item build seterusnya.'],
  ['Tips: Siput Biru membuat skill siap lebih cepat, Kumbang Merah membakar musuh.', 'Petua: Siput Biru menjadikan skill sedia lebih cepat, Kumbang Merah membakar musuh.'],
  ['Tips: salah jawab tidak apa-apa. Lihat caranya, lalu coba lagi.', 'Petua: salah jawab tak apa. Lihat caranya, kemudian cuba lagi.']
];
function mlLoad() {
  mlShow('load', '<div class="scr-load"><canvas class="bg" data-art="splash" data-anim></canvas>' +
    '<div class="logo"><p class="ttl">' + L('MOBA matematika · kertas & tinta', 'MOBA matematik · kertas & dakwat') + '</p><h1>Arena Clawd<span class="pro">PRO</span></h1><p>' + L('Hitung cepat, robohkan menara Si Comot.', 'Kira pantas, runtuhkan menara Si Comot.') + '</p></div>' +
    '<div class="loadbar"><p class="tip" id="ldTip">' + tx(pick(TIPS)) + '</p><div class="trk"><i id="ldBar"></i></div><p class="pct" id="ldPct">0%</p></div>' +
    '<span class="ver">v2.1</span></div>');
  var pct = 0, iv = setInterval(function () {
    pct = Math.min(100, pct + 3 + Math.random() * 9);
    var b = document.getElementById('ldBar'); if (!b) { clearInterval(iv); return; }
    b.style.width = pct + '%'; document.getElementById('ldPct').textContent = Math.floor(pct) + '% ' + (pct < 40 ? L('Memuat peta', 'Memuatkan peta') : pct < 80 ? L('Memanggil pasukan Clawd', 'Memanggil pasukan Clawd') : L('Menyiapkan soal', 'Menyediakan soalan'));
    if (pct >= 100) {
      clearInterval(iv);
      var lb = mlEl.querySelector('.loadbar');
      lb.innerHTML = '<p class="tip">' + tx(pick(TIPS)) + '</p><button class="tapgo" id="ldGo" data-uji="masuk-game">' + L('Ketuk untuk masuk', 'Ketik untuk masuk') + '</button>';
      var go = function () { audioInit(); sfx('ult'); if (AKUN.nama) mlLobi(); else mlLogin(); };
      document.getElementById('ldGo').onclick = go;
      mlEl.querySelector('.scr-load').onclick = function (e) { if (e.target.id !== 'ldGo') go(); };
    }
  }, 110);
}

/* ---------- 2. masuk: nama pemain + avatar + bahasa ---------- */
function mlLogin(ganti) {
  var av = AKUN.avatar || 'pahlawan';
  mlShow('login', '<div class="scr-login"><canvas class="bg" data-art="splash" data-anim></canvas><div class="login pn">' +
    '<p class="ttl">' + (ganti ? L('Ubah profil', 'Tukar profil') : L('Selamat datang di arena', 'Selamat datang ke arena')) + '</p><h2>' + (ganti ? L('Profil pemain', 'Profil pemain') : L('Masuk', 'Log masuk')) + '</h2>' +
    '<label for="lgNama">' + L('Nama pemain', 'Nama pemain') + '</label><input id="lgNama" maxlength="12" autocomplete="nickname" placeholder="' + L('mis. Aisyah', 'cth. Aisyah') + '" value="' + esc(AKUN.nama || '') + '">' +
    '<label>' + L('Pilih avatar', 'Pilih avatar') + '</label><div class="avs">' + HERO_IDS.map(function (h) { return '<button data-av="' + h + '" aria-pressed="' + (h === av) + '" aria-label="' + tx(HEROES[h].nama) + '"><canvas data-art="face" data-hero="' + h + '" style="aspect-ratio:1"></canvas></button>'; }).join('') + '</div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><span class="seg2" role="group" aria-label="Bahasa"><button data-lg="id" aria-pressed="' + (lang === 'id') + '">Indonesia</button><button data-lg="ms" aria-pressed="' + (lang === 'ms') + '">Melayu</button></span>' +
    (ganti ? '' : '<button class="bbtn" id="lgTamu" data-uji="tamu">' + L('Main sebagai Tamu', 'Main sebagai Tetamu') + '</button>') + '</div>' +
    '<button class="gbtn" id="lgGo" data-uji="masuk">' + (ganti ? L('Simpan', 'Simpan') : L('Masuk ke arena', 'Masuk ke arena')) + '</button>' +
    '<p class="fine">' + L('Tanpa kata sandi. Nama, koin, dan skin hanya tersimpan di perangkat ini.', 'Tanpa kata laluan. Nama, syiling dan skin hanya disimpan di peranti ini.') + '</p></div></div>');
  var inp = document.getElementById('lgNama'), go = document.getElementById('lgGo');
  function cek() { go.disabled = inp.value.trim().length < 2; }
  inp.oninput = cek; cek();
  onAll('[data-av]', function (b) { av = b.getAttribute('data-av'); document.querySelectorAll('[data-av]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); });
  onAll('[data-lg]', function (b) { lang = b.getAttribute('data-lg'); try { localStorage.setItem('arena-pro-lang', lang); } catch (e) {} AKUN.nama = inp.value.trim() || AKUN.nama; buildMap(SET.mode); mlLogin(ganti); });
  function masuk(nm) { AKUN.nama = nm; AKUN.avatar = av; if (!ganti) SET.hero = av; saveAkun(); saveSet(); sfx('lvl'); mlLobi(); }
  go.onclick = function () { if (!go.disabled) masuk(inp.value.trim().slice(0, 12)); };
  inp.onkeydown = function (e) { if (e.key === 'Enter' && !go.disabled) go.onclick(); };
  var tm = document.getElementById('lgTamu'); if (tm) tm.onclick = function () { masuk(L('Tamu', 'Tetamu') + Math.floor(1000 + Math.random() * 9000)); };
}
