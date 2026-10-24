/* Arena Clawd Pro: lobi ala ML — profil, rank, koin/berlian, hero di panggung, mode, soal, misi harian, cari pertandingan */
'use strict';

var MODE_ML = {
  satu: { n: ['Klasik', 'Klasik'], t: ['1 lorong · cepat, cocok untuk pemula', '1 lorong · pantas, sesuai untuk pemula'] },
  tiga: { n: ['Peringkat', 'Ranked'], t: ['3 lorong · menang = +1 bintang rank', '3 lorong · menang = +1 bintang rank'] }
};
function topBar() {
  var need = xpNeed(AKUN.lv);
  return '<div class="topb"><button class="prof" id="lbProf" style="text-align:left" aria-label="' + L('Profil', 'Profil') + '"><span class="av"><canvas data-art="face" data-hero="' + AKUN.avatar + '" data-skin="' + AKUN.pakai[AKUN.avatar] + '"></canvas></span><span style="min-width:0"><b>' + esc(AKUN.nama) + '</b><span class="dim" style="font:600 12px var(--font-mono)">Lv ' + AKUN.lv + ' · ' + AKUN.xp + '/' + need + ' XP</span><span class="xpb" style="display:block"><i style="width:' + Math.round(AKUN.xp / need * 100) + '%"></i></span></span></button>' +
    rankHtml() + '<span class="money"><span class="chip">' + ic('coin', 16) + ' <b id="mKoin">' + AKUN.koin + '</b></span><span class="chip">' + ic('gem', 16) + ' <b id="mBer">' + AKUN.berlian + '</b></span>' +
    '<button class="xbtn" id="lbSet" aria-label="' + L('Pengaturan', 'Tetapan') + '">' + ic('sliders', 20) + '</button></span></div>';
}
function bindTop() {
  document.getElementById('lbProf').onclick = function () { sfx('tap'); mlLogin(true); };
  document.getElementById('lbSet').onclick = function () { sfx('tap'); setelan(); };
}
function mlLobi() {
  musicStart('lobi');
  var H = HEROES[SET.hero], S = heroSkin(SET.hero), m = misiData();
  mlShow('lobi', '<div class="scr-lobi">' + topBar() +
    '<div class="lobi">' +
      '<nav class="side" aria-label="Menu">' +
        '<button id="lbHero" data-uji="menu-hero">' + ic('user', 26) + '' + L('Hero', 'Hero') + '</button>' +
        '<button id="lbToko" data-uji="menu-toko">' + ic('shirt', 26) + '' + L('Toko Skin', 'Kedai Skin') + '</button>' +
        '<button id="lbItem" data-uji="menu-item">' + ic('sword', 26) + '' + L('Item', 'Item') + '</button>' +
        '<button id="lbEmb" data-uji="menu-emblem">' + ic('hexagon', 26) + '' + L('Emblem', 'Emblem') + '</button>' +
        '<button id="lbAka" data-uji="menu-akademi">' + ic('book', 26) + '' + L('Akademi', 'Akademi') + '</button>' +
        '<button id="lbMisi" data-uji="menu-misi">' + ic('target', 26) + '' + L('Misi', 'Misi') + (misiSiap() ? '<em></em>' : '') + '</button>' +
      '</nav>' +
      '<div class="stage-h"><canvas data-art="hero" data-anim data-hero="' + SET.hero + '" data-skin="' + S.id + '" id="lbArt"></canvas>' +
        '<button class="hswap l" id="lbPrev" aria-label="' + L('Hero sebelumnya', 'Hero sebelumnya') + '">‹</button><button class="hswap r" id="lbNext" aria-label="' + L('Hero berikutnya', 'Hero seterusnya') + '">›</button>' +
        '<div class="hname"><span>' + tx(ROLE_TX[ROLE_OF[SET.hero]]) + ' · <span class="trtag tr-' + S.tier + '">' + tx(TIER[S.tier]) + '</span></span><b>' + tx(S.nama) + '</b></div></div>' +
      '<div class="right">' +
        '<div class="pn misi"><p class="ttl">' + L('Mode', 'Mod') + '</p><div class="modes">' + ['satu', 'tiga'].map(function (k) { return '<button data-md="' + k + '" data-uji="mode-' + k + '" aria-pressed="' + (SET.mode === k) + '"><b>' + tx(MODE_ML[k].n) + '</b><small>' + tx(MODE_ML[k].t) + '</small></button>'; }).join('') + '</div>' +
          '<button class="soalchip" id="lbSoal" data-uji="atur-soal"><span>' + ic('pencil', 16) + ' ' + L('Soal', 'Soalan') + '</span>' + tx(TOPIC_TX[SET.topik]) + ' · ' + tx(DIFF_TX[SET.diff]).split(' · ')[0] + ' ▸</button>' +
          '<button class="gbtn mulai" id="lbMain" data-uji="mula">' + L('Main', 'Main') + ' ▸</button>' +
          '<p class="fine" style="text-align:center">' + L('Musuh: minion & menara Si Comot. Main ', 'Musuh: minion & menara Si Comot. Main ') + AKUN.main + 'x · ' + L('menang ', 'menang ') + AKUN.menang + 'x</p></div>' +
        '<div class="pn misi"><p class="ttl">' + L('Misi harian', 'Misi harian') + '</p>' + misiHtml(m) + '</div>' +
      '</div>' +
    '</div></div>');
  bindTop(); bindMisi();
  document.getElementById('lbHero').onclick = function () { sfx('tap'); mlGaleri(SET.hero); };
  document.getElementById('lbToko').onclick = function () { sfx('tap'); mlToko(); };
  document.getElementById('lbItem').onclick = function () { sfx('tap'); mlItem(SET.hero); };
  document.getElementById('lbEmb').onclick = function () { sfx('tap'); mlEmblem(); };
  document.getElementById('lbAka').onclick = function () { sfx('tap'); bukaAkademi('belajar'); };
  document.getElementById('lbMisi').onclick = function () { sfx('tap'); mlSheet('<h2>' + L('Misi harian', 'Misi harian') + '</h2>' + misiHtml(misiData()) + '<button class="bbtn" onclick="mlSheetClose()">' + L('Tutup', 'Tutup') + '</button>'); bindMisi(); };
  document.getElementById('lbArt').onclick = function () { playSkill(this, Math.floor(Math.random() * 3)); };
  function geser(d) { var i = (HERO_IDS.indexOf(SET.hero) + d + HERO_IDS.length) % HERO_IDS.length; SET.hero = HERO_IDS[i]; saveSet(); sfx('tap'); mlLobi(); }
  document.getElementById('lbPrev').onclick = function () { geser(-1); };
  document.getElementById('lbNext').onclick = function () { geser(1); };
  onAll('[data-md]', function (b) { SET.mode = b.getAttribute('data-md'); saveSet(); mlLobi(); });
  document.getElementById('lbSoal').onclick = function () { sfx('tap'); aturSoal(mlLobi); };
  document.getElementById('lbMain').onclick = function () { sfx('ult'); cariLawan(); };
}
function misiHtml(m) {
  return '<ul>' + MISI.map(function (x) { var v = Math.min(x.n, m[x.id]), done = v >= x.n, got = m.ambil[x.id]; return '<li><span>' + ic(x.ikon, 22) + ' ' + tx(x.t) + ' <span class="dim" style="font:600 12px var(--font-mono)">' + v + '/' + x.n + '</span></span>' +
    '<button class="' + (done && !got ? 'gbtn ambil' : 'bbtn') + '" data-misi="' + x.id + '"' + (done && !got ? '' : ' disabled') + '>' + (got ? ic('check', 16) : (x.hadiah.koin ? ic('coin', 14) + ' ' + x.hadiah.koin : ic('gem', 14) + ' ' + x.hadiah.berlian)) + '</button><span class="bar"><i style="width:' + Math.round(v / x.n * 100) + '%"></i></span></li>'; }).join('') + '</ul>';
}
function bindMisi() {
  onAll('[data-misi]', function (b) {
    var m = misiData(), x = MISI.filter(function (y) { return y.id === b.getAttribute('data-misi'); })[0];
    if (!x || m[x.id] < x.n || m.ambil[x.id]) return;
    m.ambil[x.id] = true; AKUN.koin += x.hadiah.koin || 0; AKUN.berlian += x.hadiah.berlian || 0; saveAkun(); sfx('coin'); mlSheetClose(); mlLobi();
  });
}
function setelan() {
  mlSheet('<h2>' + L('Pengaturan', 'Tetapan') + '</h2>' +
    '<p class="ttl">' + L('Bahasa', 'Bahasa') + '</p><span class="seg2"><button data-lg2="id" aria-pressed="' + (lang === 'id') + '">Indonesia</button><button data-lg2="ms" aria-pressed="' + (lang === 'ms') + '">Melayu</button></span>' +
    '<p class="ttl">' + L('Suara', 'Bunyi') + '</p><span class="seg2"><button data-snd="1" aria-pressed="' + !muted + '">' + L('Nyala', 'Hidup') + '</button><button data-snd="0" aria-pressed="' + muted + '">' + L('Mati', 'Mati') + '</button></span>' +
    '<p class="ttl">' + L('Akun', 'Akaun') + '</p><div class="acts"><button class="bbtn" id="stNama">' + L('Ubah nama & avatar', 'Tukar nama & avatar') + '</button><button class="bbtn" id="stKeluar">' + L('Keluar (hapus akun)', 'Log keluar (padam akaun)') + '</button></div>' +
    '<button class="gbtn" onclick="mlSheetClose()">' + L('Selesai', 'Selesai') + '</button>');
  onAll('[data-lg2]', function (b) { lang = b.getAttribute('data-lg2'); try { localStorage.setItem('arena-pro-lang', lang); } catch (e) {} buildMap(SET.mode); mlSheetClose(); mlLobi(); setelan(); });
  onAll('[data-snd]', function (b) { muted = b.getAttribute('data-snd') === '0'; try { localStorage.setItem('arena-pro-mute', muted ? '1' : '0'); } catch (e) {} muteLabel(); if (muted) musicStop(); else { audioInit(); musicStart('lobi'); } mlSheetClose(); setelan(); });
  document.getElementById('stNama').onclick = function () { mlSheetClose(); mlLogin(true); };
  document.getElementById('stKeluar').onclick = function () { if (!confirm(L('Hapus akun, koin, dan skin di perangkat ini?', 'Padam akaun, syiling dan skin di peranti ini?'))) return; AKUN = blankAkun(); saveAkun(); mlSheetClose(); mlLogin(); };
}
/* pengaturan soal: topik + tingkat */
function aturSoal(after) {
  mlSheet('<h2>' + L('Soal matematika', 'Soalan matematik') + '</h2><p class="dim">' + L('Soal muncul saat menyerang menara, mengeluarkan ultimate, dan saat tumbang.', 'Soalan muncul semasa menyerang menara, mengeluarkan ultimate dan semasa tumbang.') + '</p>' + soalPilih() + '<button class="gbtn" id="soOk" data-uji="soal-ok">' + L('Simpan', 'Simpan') + '</button>');
  bindSoal(function () { aturSoal(after); });
  document.getElementById('soOk').onclick = function () { sfx('tap'); mlSheetClose(); if (after) after(); };
}
function soalPilih() {
  return '<p class="ttl">' + L('Topik', 'Topik') + '</p><div class="chips2">' + TOPICS.map(function (k) { return '<button data-tp="' + k + '" data-uji="topik-' + k + '" aria-pressed="' + (k === SET.topik) + '">' + tx(TOPIC_TX[k]) + (SYM[k] ? ' ' + SYM[k] : '') + '</button>'; }).join('') + '</div>' +
    '<p class="ttl">' + L('Tingkat (naik sendiri tiap 5 level hero)', 'Tahap (naik sendiri setiap 5 tahap hero)') + '</p><div class="chips2">' + DIFFS.map(function (d) { return '<button data-df="' + d + '" data-uji="tingkat-' + d + '" aria-pressed="' + (d === SET.diff) + '">' + tx(DIFF_TX[d]) + '</button>'; }).join('') + '</div>';
}
function bindSoal(redraw) {
  onAll('[data-tp]', function (b) { SET.topik = b.getAttribute('data-tp'); saveSet(); redraw(); });
  onAll('[data-df]', function (b) { SET.diff = b.getAttribute('data-df'); saveSet(); redraw(); });
}
/* cari pertandingan → ditemukan → TERIMA */
var cariT = null;
function cariLawan() {
  clearInterval(cariT);
  var d = mlSheet('<div class="cari" style="display:flex;flex-direction:column;gap:14px;align-items:center"><p class="ttl">' + tx(MODE_ML[SET.mode].n) + ' · ' + (SET.mode === 'tiga' ? L('3 lorong', '3 lorong') : L('1 lorong', '1 lorong')) + '</p><h2>' + L('Mencari pertandingan…', 'Mencari perlawanan…') + '</h2><div class="ring"><b id="crT">0:00</b></div><button class="bbtn" id="crBatal">' + L('Batal', 'Batal') + '</button></div>', 'cari');
  d.setAttribute('data-wajib', '');
  var t = 0, tFound = 2 + Math.random() * 1.5;
  cariT = setInterval(function () {
    t += 0.25; var el = document.getElementById('crT'); if (!el) { clearInterval(cariT); return; }
    el.textContent = '0:0' + Math.floor(t);
    if (t >= tFound) { clearInterval(cariT); ditemukan(); }
  }, 250);
  document.getElementById('crBatal').onclick = function () { clearInterval(cariT); sfx('tap'); mlSheetClose(); };
}
function ditemukan() {
  sfx('lvl');
  var d = mlSheet('<div style="display:flex;flex-direction:column;gap:14px;align-items:center;text-align:center"><p class="found">' + L('Pertandingan ditemukan!', 'Perlawanan dijumpai!') + '</p><p class="dim">' + L('Tim Clawd vs Pasukan Si Comot', 'Pasukan Clawd lawan Pasukan Si Comot') + '</p><div class="cdring" id="fdT">10</div><button class="gbtn" id="fdOk" data-uji="terima">' + L('Terima', 'Terima') + '</button></div>');
  d.setAttribute('data-wajib', '');
  var n = 10;
  cariT = setInterval(function () { n--; var el = document.getElementById('fdT'); if (!el) { clearInterval(cariT); return; } el.textContent = n; if (n <= 0) { clearInterval(cariT); mlSheetClose(); toastML(L('Waktu habis, tekan Main lagi.', 'Masa tamat, tekan Main lagi.')); } }, 1000);
  document.getElementById('fdOk').onclick = function () { clearInterval(cariT); sfx('correct'); mlSheetClose(); mlDraft(); };
}
function toastML(s) { var d = mlSheet('<p style="text-align:center;font-weight:700">' + s + '</p>'); setTimeout(function () { if (d.parentNode) d.remove(); }, 1600); }
/* akademi = menu kertas lama: Belajar · Latihan · Kemajuan */
function bukaAkademi(t) {
  musicStop(); mlHide();
  document.getElementById('game').hidden = true; document.getElementById('menu').hidden = false;
  tab = t || 'belajar'; renderMenu(); window.scrollTo({ top: 0 });
}
