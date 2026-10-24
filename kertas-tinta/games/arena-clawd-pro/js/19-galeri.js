/* Arena Clawd Pro: galeri hero (skill + pratinjau, atribut, skin, build), toko skin, item & build, emblem */
'use strict';

function hdrHtml(judul, extra) { return '<div class="hdr"><button class="xbtn" id="bkLobi" data-uji="ke-lobi" aria-label="' + L('Kembali ke lobi', 'Kembali ke lobi') + '">' + ic('back', 22) + '</button><h2>' + judul + '</h2>' + (extra || '') + '<span class="chip">' + ic('coin', 16) + ' <b>' + AKUN.koin + '</b></span><span class="chip">' + ic('gem', 16) + ' <b>' + AKUN.berlian + '</b></span></div>'; }
function bindBack(fn) { document.getElementById('bkLobi').onclick = function () { sfx('tap'); (fn || mlLobi)(); }; }
function skillListHtml(id) {
  var H = HEROES[id], ps = PASIF[id];
  return '<div class="sks"><button class="sk" data-pv="-1"><span class="ic">' + ic('passive', 22) + '</span><b>' + L(ps[0], ps[1]) + ' <span class="dim" style="font:600 11px var(--font-mono)">' + L('PASIF', 'PASIF') + '</span></b><span class="cd"></span><small>' + L(ps[2], ps[3]) + '</small></button>' +
    H.sk.map(function (s, i) { return '<button class="sk" data-pv="' + i + '" data-uji="pv-' + i + '"><span class="ic' + (i === 2 ? ' ult' : '') + '">' + ic(s.i, 22) + '</span><b>' + tx(s.n) + (i === 2 ? ' <span class="dim" style="font:600 11px var(--font-mono)">ULTIMATE · ' + ic('pencil', 12) + '</span>' : '') + '</b><span class="cd">' + s.cd + 's ' + ic('play', 12) + '</span><small>' + tx(s.t) + (i === 2 ? ' ' + L('Sebelum keluar, jawab soal: benar = 150%.', 'Sebelum keluar, jawab soalan: betul = 150%.') : '') + '</small></button>'; }).join('') + '</div>';
}
function attrHtml(id) {
  var H = HEROES[id], A = ATTR[id], nm = [['Daya tahan', 'Ketahanan'], ['Serangan', 'Serangan'], ['Efek skill', 'Kesan skill'], ['Kesulitan', 'Kesukaran']];
  return '<div class="attr">' + A.map(function (v, i) { return '<div><span>' + tx(nm[i]) + '</span><i><em style="width:' + v + '%"></em></i><span>' + v + '</span></div>'; }).join('') + '</div>' +
    '<div class="dgrid" style="margin-top:6px"><div><b>' + H.hp + '</b><span>' + L('Nyawa', 'Nyawa') + '</span></div><div><b>' + H.atk + '</b><span>' + L('Serangan', 'Serangan') + '</span></div><div><b>' + H.range + '</b><span>' + L('Jangkauan', 'Jarak') + '</span></div><div><b>' + H.spd + '</b><span>' + L('Kecepatan', 'Laju') + '</span></div></div>';
}
function skinGridHtml(id, sel, kecil) {
  return '<div class="skins">' + SKINS[id].map(function (S) { var own = punyaSkin(id, S.id); return '<button class="skin tr-' + S.tier + (own ? '' : ' kunci') + '" data-sk="' + S.id + '" data-skh="' + id + '" aria-pressed="' + (S.id === sel) + '">' + faceCv(id, S.id) + '<span class="trtag">' + tx(TIER[S.tier]) + '</span>' + (own ? (AKUN.pakai[id] === S.id ? '<span class="price">' + ic('check', 12) + '</span>' : '') : '<span class="price">' + hargaTx(S) + '</span>') + '<span class="nm">' + tx(S.nama) + '</span></button>'; }).join('') + '</div>';
}
function buildHtml(id) {
  return '<div class="slots">' + [0, 1, 2, 3, 4, 5].map(function (i) { var it = itemById(AKUN.build[id][i]); return '<button class="slot" data-slot="' + i + '" aria-label="' + (it ? tx(it.nama) : L('Kosong', 'Kosong')) + '"><i>' + (i + 1) + '</i>' + (it ? ic(it.ikon, 22) : '') + '</button>'; }).join('') + '</div>';
}

/* ---------- galeri hero ---------- */
var galRole = 'semua', galTab = 'skill';
function mlGaleri(id, skinSel) {
  id = id || SET.hero; var H = HEROES[id], S = skinObj(id, skinSel || AKUN.pakai[id]);
  var list = HERO_IDS.filter(function (h) { return galRole === 'semua' || ROLE_OF[h] === galRole; });
  mlShow('galeri', '<div class="scr">' + hdrHtml(L('Hero', 'Hero')) +
    '<div class="galeri"><div style="display:flex;flex-direction:column;gap:10px"><div class="tabs2">' + Object.keys(ROLE_TX).map(function (r) { return '<button data-role="' + r + '" aria-selected="' + (r === galRole) + '">' + tx(ROLE_TX[r]) + '</button>'; }).join('') + '</div>' +
      '<div class="hgrid">' + list.map(function (h) { return '<button class="hcard" data-gh="' + h + '" data-uji="hero-' + h + '" aria-pressed="' + (h === id) + '">' + faceCv(h, AKUN.pakai[h]) + (h === 'nini' ? '<span class="baru">' + L('BARU', 'BAHARU') + '</span>' : '') + '<span class="nm"><small>' + tx(ROLE_TX[ROLE_OF[h]]) + '</small>' + tx(HEROES[h].nama).replace('Clawd ', '') + '</span></button>'; }).join('') + '</div></div>' +
      '<div class="detail pn flat" style="padding:12px"><div class="art"><canvas data-art="hero" data-anim data-hero="' + id + '" data-skin="' + S.id + '" id="glArt"></canvas><div class="hname"><span>' + tx(H.role) + '</span><b>' + tx(H.nama) + '</b></div></div>' +
        '<div class="tabs2">' + [['skill', ['Skill', 'Skill']], ['atribut', ['Atribut', 'Atribut']], ['skin', ['Skin', 'Skin']], ['build', ['Build', 'Build']]].map(function (t) { return '<button data-gt="' + t[0] + '" aria-selected="' + (t[0] === galTab) + '">' + tx(t[1]) + '</button>'; }).join('') + '</div>' +
        '<div id="glTab">' + (galTab === 'skill' ? '<p class="fine">' + L('Ketuk skill untuk melihat pratinjau di panggung.', 'Ketik skill untuk melihat pratonton di pentas.') + '</p>' + skillListHtml(id) : galTab === 'atribut' ? attrHtml(id) : galTab === 'skin' ? skinGridHtml(id, S.id) + skinAksi(id, S) : '<p class="fine">' + L('Item ini dibeli berurutan oleh tombol beli cepat di arena.', 'Item ini dibeli mengikut urutan oleh butang beli pantas di arena.') + '</p>' + buildHtml(id) + '<button class="bbtn" id="glBuild" style="margin-top:8px">' + L('Ubah build di menu Item', 'Tukar build di menu Item') + ' ▸</button>') + '</div>' +
        '<button class="gbtn" id="glPakai" data-uji="pakai-hero">' + (SET.hero === id ? L('Hero dipakai', 'Hero digunakan') : L('Pakai hero ini', 'Guna hero ini')) + '</button></div></div></div>');
  bindBack();
  onAll('[data-role]', function (b) { galRole = b.getAttribute('data-role'); mlGaleri(id, S.id); });
  onAll('[data-gh]', function (b) { mlGaleri(b.getAttribute('data-gh')); });
  onAll('[data-gt]', function (b) { galTab = b.getAttribute('data-gt'); mlGaleri(id, S.id); });
  var art = document.getElementById('glArt');
  onAll('[data-pv]', function (b) { var n = +b.getAttribute('data-pv'); document.querySelectorAll('[data-pv]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); if (n >= 0) playSkill(art, n); });
  onAll('[data-sk]', function (b) { mlGaleri(id, b.getAttribute('data-sk')); });
  bindSkinAksi(id, S, function () { mlGaleri(id, S.id); });
  var gb = document.getElementById('glBuild'); if (gb) gb.onclick = function () { mlItem(id); };
  document.getElementById('glPakai').onclick = function () { SET.hero = id; saveSet(); sfx('lvl'); mlGaleri(id, S.id); };
}
function skinAksi(id, S) {
  var own = punyaSkin(id, S.id);
  return '<div class="acts" style="margin-top:10px;align-items:center"><span class="trtag tr-' + S.tier + '">' + tx(TIER[S.tier]) + '</span><b style="flex:1">' + tx(S.nama) + '</b>' +
    (own ? (AKUN.pakai[id] === S.id ? '<span class="chip">' + ic('check', 14) + ' ' + L('Dipakai', 'Digunakan') + '</span>' : '<button class="bbtn" id="skPakai" data-uji="pakai-skin">' + L('Pakai', 'Guna') + '</button>') :
      '<button class="gbtn" id="skBeli" data-uji="beli-skin"' + (bisaBeli(S) ? '' : ' disabled') + '>' + L('Beli ', 'Beli ') + hargaTx(S) + '</button>') + '</div>' +
    (!own && !bisaBeli(S) ? '<p class="fine">' + (S.harga.koin ? L('Kumpulkan koin dengan bermain dan menyelesaikan misi.', 'Kumpul syiling dengan bermain dan menyiapkan misi.') : L('Berlian didapat dari setiap jawaban benar di arena.', 'Berlian diperoleh daripada setiap jawapan betul di arena.')) + '</p>' : '');
}
function bindSkinAksi(id, S, redraw) {
  var p = document.getElementById('skPakai'); if (p) p.onclick = function () { AKUN.pakai[id] = S.id; saveAkun(); sfx('lvl'); redraw(); };
  var b = document.getElementById('skBeli'); if (b) b.onclick = function () { if (beliSkin(id, S)) { sfx('win'); redraw(); } };
}

/* ---------- toko skin ---------- */
var tokoTier = 'semua';
function mlToko() {
  var all = []; HERO_IDS.forEach(function (h) { SKINS[h].forEach(function (S) { if (S.tier !== 'normal' && (tokoTier === 'semua' || S.tier === tokoTier)) all.push([h, S]); }); });
  mlShow('toko', '<div class="scr">' + hdrHtml(L('Toko Skin', 'Kedai Skin')) + '<div class="toko"><div class="tabs2">' + ['semua', 'elit', 'spesial', 'epik', 'legenda'].map(function (t) { return '<button data-tt="' + t + '" aria-selected="' + (t === tokoTier) + '">' + (t === 'semua' ? L('Semua', 'Semua') : tx(TIER[t])) + '</button>'; }).join('') + '</div>' +
    '<p class="fine">' + L('Elit & Spesial dibeli dengan koin. Epik & Legenda dengan berlian (dapat dari jawaban benar).', 'Elit & Istimewa dibeli dengan syiling. Epik & Lagenda dengan berlian (dapat daripada jawapan betul).') + '</p>' +
    '<div class="skins">' + all.map(function (x) { var h = x[0], S = x[1], own = punyaSkin(h, S.id); return '<button class="skin tr-' + S.tier + (own ? '' : ' kunci') + '" data-ts="' + h + ':' + S.id + '" data-uji="toko-' + h + '-' + S.id + '">' + faceCv(h, S.id) + '<span class="trtag">' + tx(TIER[S.tier]) + '</span><span class="price">' + (own ? ic('check', 12) : hargaTx(S)) + '</span><span class="nm">' + tx(S.nama) + '<br><span class="dim" style="font-weight:500">' + tx(HEROES[h].nama).replace('Clawd ', '') + '</span></span></button>'; }).join('') + '</div></div></div>');
  bindBack();
  onAll('[data-tt]', function (b) { tokoTier = b.getAttribute('data-tt'); mlToko(); });
  onAll('[data-ts]', function (b) { var p = b.getAttribute('data-ts').split(':'); lihatSkin(p[0], skinObj(p[0], p[1])); });
}
function lihatSkin(h, S) {
  mlSheet('<div class="prev"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="trtag tr-' + S.tier + '">' + tx(TIER[S.tier]) + '</span><button class="xbtn" onclick="mlSheetClose()" aria-label="' + L('Tutup', 'Tutup') + '">' + ic('close', 20) + '</button></div>' +
    '<div class="art"><canvas data-art="hero" data-anim data-nameless data-hero="' + h + '" data-skin="' + S.id + '" id="tkArt"></canvas></div><h2>' + tx(S.nama) + '</h2><p class="dim">' + tx(HEROES[h].nama) + ' · ' + tx(HEROES[h].role) + '</p>' +
    '<div class="skrow">' + HEROES[h].sk.map(function (s, i) { return '<button class="' + (i === 2 ? 'ult' : '') + '" data-tp2="' + i + '" aria-label="' + tx(s.n) + '">' + ic(s.i, 22) + '</button>'; }).join('') + '</div>' + skinAksi(h, S) + '</div>');
  var art = document.getElementById('tkArt');
  onAll('[data-tp2]', function (b) { playSkill(art, +b.getAttribute('data-tp2')); });
  bindSkinAksi(h, S, function () { mlSheetClose(); mlToko(); lihatSkin(h, S); });
}

/* ---------- item & build ---------- */
var itemKat = 'semua', itemSel = 'pedang';
function mlItem(hero) {
  hero = hero || SET.hero;
  var list = ITEMS.filter(function (it) { return !it.potion && (itemKat === 'semua' || ITEM_KAT[it.id] === itemKat); }), it = itemById(itemSel) || list[0], b = AKUN.build[hero], ada = b.indexOf(it.id) >= 0;
  mlShow('item', '<div class="scr">' + hdrHtml(L('Item', 'Item')) + '<div class="itemv"><div style="display:flex;flex-direction:column;gap:10px"><div class="tabs2">' + Object.keys(KAT_TX).map(function (k) { return '<button data-ik="' + k + '" aria-selected="' + (k === itemKat) + '">' + tx(KAT_TX[k]) + '</button>'; }).join('') + '</div>' +
    '<div class="igrid">' + list.map(function (x) { return '<button class="it' + (b.indexOf(x.id) >= 0 ? ' ada' : '') + '" data-it="' + x.id + '" aria-pressed="' + (x.id === it.id) + '"><span>' + ic(x.ikon, 22) + '</span>' + tx(x.nama) + '<small>' + x.harga + '</small></button>'; }).join('') + '</div></div>' +
    '<div class="pn flat" style="padding:14px;display:flex;flex-direction:column;gap:12px"><div style="display:flex;gap:12px;align-items:center"><span style="font-size:44px;line-height:1">' + ic(it.ikon, 22) + '</span><div><h3 style="font-size:20px">' + tx(it.nama) + '</h3><span class="dim">' + tx(KAT_TX[ITEM_KAT[it.id]]) + ' · <span class="harga" style="font-size:14px">' + ic('coin', 14) + ' ' + it.harga + '</span></span></div></div>' +
      '<div class="istat"><b>' + tx(it.t) + '</b><span class="dim">' + L('Harga dibayar dengan koin pertandingan (bukan koin akun).', 'Harga dibayar dengan syiling perlawanan (bukan syiling akaun).') + '</span></div>' +
      '<button class="' + (ada ? 'bbtn' : 'gbtn') + '" id="itAdd" data-uji="build-tambah"' + (!ada && b.length >= 6 ? ' disabled' : '') + '>' + (ada ? L('Keluarkan dari build', 'Keluarkan dari build') : L('Masukkan ke build', 'Masukkan ke build')) + '</button>' +
      (!ada && b.length >= 6 ? '<p class="fine">' + L('Build sudah penuh (6). Ketuk salah satu slot di bawah untuk mengeluarkannya.', 'Build sudah penuh (6). Ketik salah satu slot di bawah untuk mengeluarkannya.') + '</p>' : '') +
      '<p class="ttl">' + L('Build ', 'Build ') + tx(HEROES[hero].nama) + '</p>' + buildHtml(hero) +
      '<div class="chips2">' + HERO_IDS.map(function (h) { return '<button data-ih="' + h + '" aria-pressed="' + (h === hero) + '">' + tx(HEROES[h].nama).replace('Clawd ', '') + '</button>'; }).join('') + '</div>' +
      '<div class="acts"><button class="bbtn" id="itReset">' + L('Build rekomendasi', 'Build cadangan') + '</button></div></div></div></div>');
  bindBack();
  onAll('[data-ik]', function (x) { itemKat = x.getAttribute('data-ik'); mlItem(hero); });
  onAll('[data-it]', function (x) { itemSel = x.getAttribute('data-it'); mlItem(hero); });
  onAll('[data-ih]', function (x) { mlItem(x.getAttribute('data-ih')); });
  onAll('[data-slot]', function (x) { var i = +x.getAttribute('data-slot'); if (b[i]) { itemSel = b[i]; b.splice(i, 1); saveAkun(); mlItem(hero); } });
  document.getElementById('itAdd').onclick = function () { if (ada) b.splice(b.indexOf(it.id), 1); else if (b.length < 6) b.push(it.id); saveAkun(); sfx('coin'); mlItem(hero); };
  document.getElementById('itReset').onclick = function () { AKUN.build[hero] = BUILD_DEF[hero].slice(); saveAkun(); sfx('tap'); mlItem(hero); };
}

/* ---------- emblem ---------- */
function mlEmblem(after) {
  mlShow('emblem', '<div class="scr">' + hdrHtml(L('Emblem', 'Emblem')) + '<p class="fine" style="padding:10px 14px 0">' + L('Emblem memberi bonus kecil sepanjang pertandingan. Pilih yang cocok dengan hero.', 'Emblem memberi bonus kecil sepanjang perlawanan. Pilih yang sesuai dengan hero.') + '</p><div class="embl">' +
    Object.keys(EMBLEM).map(function (k) { var E = EMBLEM[k]; return '<button class="em" data-em="' + k + '" data-uji="emblem-' + k + '" aria-pressed="' + (AKUN.emblem === k) + '"><span class="ic">' + ic(E.ikon, 22) + '</span><b>' + tx(E.nama) + (ROLE_OF[SET.hero] === k ? ' <span class="dim" style="font:600 11px var(--font-mono)">' + L('COCOK', 'SESUAI') + '</span>' : '') + '</b><small>' + tx(E.t) + '</small></button>'; }).join('') + '</div></div>');
  bindBack(after);
  onAll('[data-em]', function (b) { AKUN.emblem = b.getAttribute('data-em'); saveAkun(); sfx('lvl'); mlEmblem(after); });
}
