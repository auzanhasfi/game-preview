/* Arena Clawd Pro: Akademi: Belajar, Latihan, Kemajuan */
'use strict';

/* ---------- menu bertab: Main · Belajar · Latihan · Kemajuan ---------- */
var tab = 'belajar', P = null;
var TABS = [['belajar', ['Belajar', 'Belajar']], ['latihan', ['Latihan', 'Latihan']], ['kemajuan', ['Kemajuan', 'Kemajuan']]];
var MODE_TX = { satu: { n: ['1 lorong', '1 lorong'], t: ['Satu lorong tengah, 3 menara tiap tim. Cepat dan fokus, cocok untuk pemula.', 'Satu lorong tengah, 3 menara setiap pasukan. Pantas dan fokus, sesuai untuk pemula.'] }, tiga: { n: ['3 lorong', '3 lorong'], t: ['Peta penuh: lorong atas, tengah, bawah, hutan, dan 7 menara musuh. Lebih strategis.', 'Peta penuh: lorong atas, tengah, bawah, hutan, dan 7 menara musuh. Lebih strategik.'] } };
var LESSONS = [
  { ty: 'tambah', s: '+', idea: ['Menjumlahkan = menggabungkan dua kelompok menjadi satu.', 'Tambah = menggabungkan dua kumpulan menjadi satu.'], vis: '' + SHAPES.bulat + '' + SHAPES.bulat + '' + SHAPES.bulat + '<i>+</i>' + SHAPES.bulat + '' + SHAPES.bulat + '<i>=</i>' + SHAPES.bulat + '' + SHAPES.bulat + '' + SHAPES.bulat + '' + SHAPES.bulat + '' + SHAPES.bulat + '',
    steps: [['Mulai dari angka yang lebih besar.', 'Mula dari nombor yang lebih besar.'], ['Hitung maju sebanyak angka kedua.', 'Kira ke depan sebanyak nombor kedua.'], ['Angka besar: jumlahkan puluhan dulu, lalu satuan.', 'Nombor besar: tambah puluh dahulu, kemudian sa.']],
    ex: '<b>34 + 25</b> → 30 + 20 = 50, 4 + 5 = 9 → 50 + 9 = <b>59</b>', tip: ['Urutan boleh ditukar: 3 + 8 = 8 + 3.', 'Susunan boleh ditukar: 3 + 8 = 8 + 3.'] },
  { ty: 'kurang', s: '−', idea: ['Mengurangi = mengambil sebagian dari sebuah kelompok.', 'Tolak = mengambil sebahagian daripada satu kumpulan.'], vis: '' + SHAPES.kotak + '' + SHAPES.kotak + '' + SHAPES.kotak + '<s style="opacity:.35">' + SHAPES.kotak + '' + SHAPES.kotak + '</s><i>=</i>' + SHAPES.kotak + '' + SHAPES.kotak + '' + SHAPES.kotak + '',
    steps: [['Mulai dari angka pertama.', 'Mula dari nombor pertama.'], ['Hitung mundur sebanyak angka kedua.', 'Kira ke belakang sebanyak nombor kedua.'], ['Angka besar: kurangi puluhan dulu, lalu satuan.', 'Nombor besar: tolak puluh dahulu, kemudian sa.']],
    ex: '<b>58 − 23</b> → 58 − 20 = 38, 38 − 3 = <b>35</b>', tip: ['Cek dengan kebalikan: 35 + 23 = 58', 'Semak dengan songsang: 35 + 23 = 58'] },
  { ty: 'kali', s: '×', idea: ['Perkalian = penjumlahan berulang.', 'Darab = tambah berulang.'], vis: '' + SHAPES.bintang + '' + SHAPES.bintang + '' + SHAPES.bintang + '<i>+</i>' + SHAPES.bintang + '' + SHAPES.bintang + '' + SHAPES.bintang + '<i>+</i>' + SHAPES.bintang + '' + SHAPES.bintang + '' + SHAPES.bintang + '<i>=</i>3 × 3',
    steps: [['4 × 3 artinya 3 + 3 + 3 + 3 = 12.', '4 × 3 bermaksud 3 + 3 + 3 + 3 = 12.'], ['Hafalkan perkalian 2, 5, dan 10 dulu, itu yang paling mudah.', 'Hafal sifir 2, 5 dan 10 dahulu, itu yang paling mudah.'], ['Angka besar: pecah jadi puluhan dan satuan, kalikan satu per satu.', 'Nombor besar: pecahkan kepada puluh dan sa, darab satu demi satu.']],
    ex: '<b>14 × 3</b> → 10 × 3 = 30, 4 × 3 = 12 → 30 + 12 = <b>42</b>', tip: ['Urutan boleh ditukar: 2 × 7 = 7 × 2.', 'Susunan boleh ditukar: 2 × 7 = 7 × 2.'] },
  { ty: 'bagi', s: '÷', idea: ['Pembagian = membagi sama rata ke beberapa kelompok.', 'Bahagi = membahagi sama rata kepada beberapa kumpulan.'], vis: '' + SHAPES.segitiga + '' + SHAPES.segitiga + '<i>|</i>' + SHAPES.segitiga + '' + SHAPES.segitiga + '<i>|</i>' + SHAPES.segitiga + '' + SHAPES.segitiga + '<i>=</i>6 ÷ 3',
    steps: [['12 ÷ 3: berapa kali 3 sampai ke 12?', '12 ÷ 3: berapa kali 3 sampai ke 12?'], ['Pakai perkalian: 3 × 4 = 12, jadi 12 ÷ 3 = 4.', 'Guna darab: 3 × 4 = 12, jadi 12 ÷ 3 = 4.'], ['Angka besar: pecah dulu, misalnya 48 = 40 + 8.', 'Nombor besar: pecahkan dahulu, contohnya 48 = 40 + 8.']],
    ex: '<b>48 ÷ 4</b> → 40 ÷ 4 = 10, 8 ÷ 4 = 2 → <b>12</b>', tip: ['Pembagian adalah kebalikan perkalian.', 'Bahagi ialah songsang darab.'] }
];
function renderMenu() {
  document.documentElement.lang = lang;
  document.getElementById('mTag').textContent = L('Kertas & tinta · MOBA matematika · main sendiri', 'Kertas & dakwat · MOBA matematik · main seorang');
  document.getElementById('mIntro').textContent = L('Pilih hero Clawd, ikuti minion menyusuri lorong, robohkan menara Si Comot, lalu hancurkan Inti Istana Comot. Jawab soal untuk Soal Gempur, Ultimate Matematika, dan Ledakan Kombo.', 'Pilih hero Clawd, ikut minion menyusuri lorong, runtuhkan menara Si Comot, kemudian musnahkan Inti Istana Comot. Jawab soalan untuk Soalan Gempur, Ultimate Matematik, dan Letupan Kombo.');
  document.getElementById('mNote').textContent = L('musuhnya hanya minion & menara, tanpa hero musuh!', 'musuhnya hanya minion & menara, tanpa hero musuh!');
  document.getElementById('hint').textContent = L('Joystick kiri untuk bergerak · tombol kanan untuk serang & skill · SOAL muncul dekat menara musuh · Keyboard: WASD, J/Spasi, Q E R, F, G, B, I, P', 'Joystick kiri untuk bergerak · butang kanan untuk serang & skill · SOAL muncul dekat menara musuh · Papan kekunci: WASD, J/Space, Q E R, F, G, B, I, P');
  document.getElementById('bPause').setAttribute('aria-label', L('Jeda', 'Jeda')); bMute.setAttribute('aria-label', L('Suara', 'Bunyi'));
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang); b.onclick = function () { lang = b.getAttribute('data-lang'); try { localStorage.setItem('arena-pro-lang', lang); } catch (e) {} sfx('tap'); buildMap(SET.mode); renderMenu(); }; });
  document.getElementById('ttl').innerHTML = L('Akademi Clawd', 'Akademi Clawd') + ' <span class="pro">PRO</span>';
  document.getElementById('tabs').innerHTML = '<button data-uji="ke-lobi" id="akLobi">‹ ' + L('Lobi', 'Lobi') + '</button>' + TABS.map(function (t) { return '<button role="tab" data-tab="' + t[0] + '" data-uji="tab-' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + tx(t[1]) + '</button>'; }).join('');
  document.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { sfx('tap'); showTab(b.getAttribute('data-tab')); }; });
  document.getElementById('akLobi').onclick = function () { sfx('tap'); P = null; mlLobi(); };
  showTab(tab);
}
function showTab(t) {
  tab = t;
  document.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === t); });
  document.getElementById('tabMain').hidden = true;
  ['belajar', 'latihan', 'kemajuan'].forEach(function (k) { document.getElementById('tab' + k[0].toUpperCase() + k.slice(1)).hidden = k !== t; });
  ({ belajar: renderBelajar, latihan: renderLatihan, kemajuan: renderKemajuan })[t]();
}
function renderMain() {
  var el = document.getElementById('tabMain');
  el.innerHTML =
    '<div class="step"><h3><i>1</i>' + L('Pilih hero', 'Pilih hero') + '</h3><div class="heroes" id="heroPick">' + HERO_IDS.map(function (id) { var H = HEROES[id]; return '<button class="pick" data-hero="' + id + '" data-uji="hero-' + id + '" aria-pressed="' + (id === SET.hero) + '"><canvas width="168" height="168" data-ic="' + id + '"></canvas><span class="role">' + tx(H.role) + '</span><b>' + tx(H.nama) + '</b><ul>' + H.sk.map(function (s, i) { return '<li>' + ic(s.i, 22) + ' ' + tx(s.n) + (i === 2 ? ' (ultimate)' : '') + '</li>'; }).join('') + '</ul></button>'; }).join('') + '</div></div>' +
    '<div class="step"><h3><i>2</i>' + L('Pilih spell', 'Pilih spell') + '</h3><div class="spells">' + Object.keys(SPELLS).map(function (id) { var S = SPELLS[id]; return '<button class="pick" data-spell="' + id + '" data-uji="spell-' + id + '" aria-pressed="' + (id === SET.spell) + '"><span>' + ic(S.ikon, 22) + '</span><b>' + tx(S.nama) + '</b>' + tx(S.t) + '</button>'; }).join('') + '</div></div>' +
    '<div class="step"><h3><i>3</i>' + L('Mode arena', 'Mod arena') + '</h3><div class="opts3">' + ['satu', 'tiga'].map(function (m) { return '<button class="pick" data-mode="' + m + '" data-uji="mode-' + m + '" aria-pressed="' + (m === SET.mode) + '"><b>' + tx(MODE_TX[m].n) + '</b>' + tx(MODE_TX[m].t) + '</button>'; }).join('') + '</div></div>' +
    '<div class="step"><h3><i>4</i>' + L('Soal matematika', 'Soalan matematik') + '</h3><p class="tag">' + L('Topik', 'Topik') + '</p><div class="chips">' + TOPICS.map(function (k) { return '<button class="pick" data-topik="' + k + '" data-uji="topik-' + k + '" aria-pressed="' + (k === SET.topik) + '">' + tx(TOPIC_TX[k]) + (SYM[k] ? ' ' + SYM[k] : '') + '</button>'; }).join('') + '</div>' +
    '<p class="tag">' + L('Tingkat (soal makin sulit tiap naik 5 level)', 'Tahap (soalan makin sukar setiap naik 5 tahap)') + '</p><div class="seg" role="group">' + DIFFS.map(function (d) { return '<button data-diff="' + d + '" data-uji="tingkat-' + d + '" aria-pressed="' + (d === SET.diff) + '">' + tx(DIFF_TX[d]) + '</button>'; }).join('') + '</div></div>' +
    '<div class="start"><button class="primary" id="bStart" data-uji="mula">' + L('Mulai bertarung ▸', 'Mula bertarung ▸') + '</button><span class="best">' + (prog.best ? L('Skor terbaik: ', 'Skor terbaik: ') + prog.best : '') + '</span></div>' +
    '<div class="how">' + [[L('Gerak', 'Gerak'), L('Joystick kiri atau WASD/panah. Ikuti minion di lorong.', 'Joystick kiri atau WASD/anak panah. Ikut minion di lorong.')], [L('Serang & skill', 'Serang & skill'), L('SERANG (J/Spasi), skill Q E R, spell F, pulang B, toko I. Ultimate memunculkan soal yang lebih sulit.', 'SERANG (J/Space), skill Q E R, spell F, balik B, kedai I. Ultimate munculkan soalan lebih sukar.')], [L('Soal Gempur', 'Soalan Gempur'), L('Dekat menara musuh tekan SOAL (G). Benar = pensil raksasa −18% nyawa menara.', 'Dekat menara musuh tekan SOAL (G). Betul = pensel gergasi −18% nyawa menara.')], [L('Menang', 'Menang'), L('Robohkan menara berurutan (tier 1 → 2 → 3), lalu hancurkan Inti Istana Comot. Semak menyembunyikanmu.', 'Runtuhkan menara mengikut urutan (tier 1 → 2 → 3), kemudian musnahkan Inti Istana Comot. Semak menyorokkan kamu.')]].map(function (x) { return '<div><b>' + x[0] + '</b>' + x[1] + '</div>'; }).join('') + '</div>';
  el.querySelectorAll('[data-hero]').forEach(function (b) { b.onclick = function () { SET.hero = b.getAttribute('data-hero'); saveSet(); sfx('tap'); renderMain(); }; });
  el.querySelectorAll('[data-spell]').forEach(function (b) { b.onclick = function () { SET.spell = b.getAttribute('data-spell'); saveSet(); sfx('tap'); renderMain(); }; });
  el.querySelectorAll('[data-mode]').forEach(function (b) { b.onclick = function () { SET.mode = b.getAttribute('data-mode'); saveSet(); sfx('tap'); buildMap(SET.mode); renderMain(); }; });
  el.querySelectorAll('[data-topik]').forEach(function (b) { b.onclick = function () { SET.topik = b.getAttribute('data-topik'); saveSet(); sfx('tap'); renderMain(); }; });
  el.querySelectorAll('[data-diff]').forEach(function (b) { b.onclick = function () { SET.diff = b.getAttribute('data-diff'); saveSet(); sfx('tap'); renderMain(); }; });
  document.getElementById('bStart').onclick = startGame;
  drawIcons();
}
function renderBelajar() {
  document.getElementById('tabBelajar').innerHTML = '<p>' + L('Baca konsepnya dulu, lalu coba 5 soal latihan. Contoh di bawah memakai cara yang sama dengan penjelasan saat kamu salah menjawab di arena.', 'Baca konsepnya dahulu, kemudian cuba 5 soalan latihan. Contoh di bawah guna cara yang sama dengan penerangan ketika kamu salah jawab di arena.') + '</p><div class="lessons">' +
    LESSONS.map(function (ls) { return '<div class="lesson"><h3><span>' + ls.s + '</span>' + tx(TOPIC_TX[ls.ty]) + '</h3><p>' + tx(ls.idea) + '</p><div class="vis">' + ls.vis + '</div><ol>' + ls.steps.map(function (s) { return '<li>' + tx(s) + '</li>'; }).join('') + '</ol><div class="ex">' + L('Contoh: ', 'Contoh: ') + ls.ex + '</div><p class="tip">' + tx(ls.tip) + '</p><div class="row"><button data-latih="' + ls.ty + '" data-uji="latih-' + ls.ty + '">' + L('Latihan 5 soal ▸', 'Latihan 5 soalan ▸') + '</button></div></div>'; }).join('') + '</div>';
  document.querySelectorAll('[data-latih]').forEach(function (b) { b.onclick = function () { var ty = b.getAttribute('data-latih'); startPractice({ topik: ty, n: 5, title: L('Latihan ', 'Latihan ') + tx(TOPIC_TX[ty]) }); }; });
}
/* latihan tanpa tekanan: 10 soal, ada penjelasan */
function startPractice(o) {
  var list = o.list || [];
  if (!list.length) for (var i = 0; i < (o.n || 10); i++) list.push(mkQ(o.topik || SET.topik, SET.diff, i < 4 ? 0 : 1));
  P = { qs: list, i: 0, ok: 0, done: false, title: o.title || L('Latihan 10 soal', 'Latihan 10 soalan') };
  showTab('latihan'); window.scrollTo({ top: 0 });
}
function renderLatihan() {
  var el = document.getElementById('tabLatihan');
  if (!P) {
    el.innerHTML = '<div class="step"><h3>' + L('Latihan tanpa tekanan', 'Latihan tanpa tekanan') + '</h3><p>' + L('Tidak ada waktu dan tidak ada musuh. Setiap jawaban salah disertai cara menghitungnya.', 'Tiada masa dan tiada musuh. Setiap jawapan salah disertakan cara mengiranya.') + '</p><p class="muted">' + L('Topik: ', 'Topik: ') + tx(TOPIC_TX[SET.topik]) + ' · ' + tx(DIFF_TX[SET.diff]) + L(' (ubah di lobi: Main › Soal)', ' (tukar di lobi: Main › Soalan)') + '</p></div><div class="row" style="display:flex;gap:10px;flex-wrap:wrap"><button class="primary" id="pStart" data-uji="latihan-mula">' + L('Mulai 10 soal ▸', 'Mula 10 soalan ▸') + '</button>' + (prog.salah.length ? '<button id="pWrong" data-uji="latihan-salah">' + L('Ulangi soal yang salah (', 'Ulang soalan yang salah (') + prog.salah.length + ')</button>' : '') + '</div>';
    document.getElementById('pStart').onclick = function () { startPractice({}); };
    if (prog.salah.length) document.getElementById('pWrong').onclick = function () { startPractice({ list: prog.salah.map(reviveQ), title: L('Soal yang pernah salah', 'Soalan yang pernah salah') }); };
    return;
  }
  if (P.i >= P.qs.length) {
    var pct = Math.round(P.ok / P.qs.length * 100);
    el.innerHTML = '<div class="step"><h3>' + P.title + '</h3><span class="stamp' + (pct >= 60 ? '' : ' bad') + '">' + P.ok + '/' + P.qs.length + '</span><p class="note" style="text-align:center">' + (pct === 100 ? L('Sempurna! Siap bertarung di arena.', 'Sempurna! Sedia bertarung di arena.') : pct >= 60 ? L('Bagus! Terus berlatih ya.', 'Bagus! Teruskan berlatih.') : L('Tidak apa-apa, baca lagi tab Belajar lalu coba lagi.', 'Tak apa, baca semula tab Belajar kemudian cuba lagi.')) + '</p></div><div class="row" style="display:flex;gap:10px;flex-wrap:wrap"><button class="primary" id="pAgain" data-uji="latihan-ulang">' + L('Latihan lagi', 'Latihan lagi') + '</button><button id="pPlay">' + L('Main sekarang ▸', 'Main sekarang ▸') + '</button></div>';
    document.getElementById('pAgain').onclick = function () { P = null; renderLatihan(); };
    document.getElementById('pPlay').onclick = function () { P = null; mlLobi(); };
    return;
  }
  var q = P.qs[P.i];
  el.innerHTML = '<p class="prog">' + P.title + ' · ' + L('Soal ', 'Soalan ') + (P.i + 1) + '/' + P.qs.length + ' · ' + L('benar ', 'betul ') + P.ok + '</p>' + (q.vis ? '<div class="vis">' + q.vis + '</div>' : '') + '<p class="q">' + qText(q) + '</p>' + optsHtml(q).replace('id="opts"', 'id="popts"') + '<p class="fb" id="pfb" aria-live="polite"></p><div id="pafter"></div>';
  el.querySelectorAll('#popts button').forEach(function (b) {
    b.onclick = function () {
      if (P.done) return; P.done = true;
      var v = +b.getAttribute('data-v'), ok = v === q.ans, fb = document.getElementById('pfb');
      record(q, ok); document.getElementById('popts').classList.add('done');
      if (ok) { P.ok++; b.classList.add('ok'); sfx('correct'); fb.className = 'fb ok'; fb.textContent = L('Benar!', 'Betul!'); }
      else { b.classList.add('no'); sfx('wrong'); el.querySelectorAll('#popts button').forEach(function (x) { if (+x.getAttribute('data-v') === q.ans) x.classList.add('ok'); }); fb.className = 'fb no'; fb.textContent = L('Jawabannya ', 'Jawapannya ') + q.ans + '.'; }
      document.getElementById('pafter').innerHTML = (ok ? '' : explainHtml(q)) + '<div class="row" style="margin-top:12px;display:flex"><button class="primary" id="pNext" data-uji="latihan-lanjut" style="flex:1;text-align:center">' + L('Lanjut ▸', 'Teruskan ▸') + '</button></div>';
      document.getElementById('pNext').onclick = function () { P.i++; P.done = false; renderLatihan(); };
    };
  });
}
function renderKemajuan() {
  var tot = [0, 0]; Object.keys(prog.topik).forEach(function (k) { tot[0] += prog.topik[k][0]; tot[1] += prog.topik[k][1]; });
  var h = '<div class="stats"><div><b>' + prog.main + '</b><span>' + L('Kali main', 'Kali main') + '</span></div><div><b>' + prog.menang + '</b><span>' + L('Menang', 'Menang') + '</span></div><div><b>' + (prog.best || 0) + '</b><span>' + L('Skor terbaik', 'Skor terbaik') + '</span></div><div><b>' + (tot[1] ? Math.round(tot[0] / tot[1] * 100) + '%' : '–') + '</b><span>' + L('Akurasi total (' + tot[1] + ' soal)', 'Ketepatan keseluruhan (' + tot[1] + ' soalan)') + '</span></div></div>';
  h += '<p class="tag">' + L('Akurasi per topik', 'Ketepatan ikut topik') + '</p>' + (tot[1] ? topicBars(prog.topik) : '<p class="muted">' + L('Belum ada soal yang dijawab. Main atau latihan dulu!', 'Belum ada soalan dijawab. Main atau berlatih dahulu!') + '</p>');
  if (prog.salah.length) h += '<p class="tag">' + L('8 soal salah terakhir', '8 soalan salah terakhir') + '</p><ul class="mist">' + prog.salah.map(function (m) { var q = reviveQ(m); return '<li><b>' + qText(q).replace('?', q.c).replace('□', '<u>' + q.ans + '</u>') + '</b>' + explainHtml(q) + '</li>'; }).join('') + '</ul>';
  h += '<div class="row" style="display:flex;gap:10px;flex-wrap:wrap">' + (prog.salah.length ? '<button class="primary" id="kWrong" data-uji="kemajuan-latih">' + L('Latihan soal yang salah', 'Latih soalan yang salah') + '</button>' : '') + '<button id="kReset" data-uji="kemajuan-hapus">' + L('Hapus kemajuan', 'Padam kemajuan') + '</button></div>';
  document.getElementById('tabKemajuan').innerHTML = h;
  if (prog.salah.length) document.getElementById('kWrong').onclick = function () { startPractice({ list: prog.salah.map(reviveQ), title: L('Soal yang pernah salah', 'Soalan yang pernah salah') }); };
  document.getElementById('kReset').onclick = function () { if (!confirm(L('Hapus semua catatan kemajuan?', 'Padam semua rekod kemajuan?'))) return; prog = blankProg(); saveProg(); renderKemajuan(); };
}
function startGame() {
  audioInit(); mlHide(); document.body.classList.add('arena-on');
  document.getElementById('menu').hidden = true; document.getElementById('game').hidden = false;
  newGame(); cam.x = G.hero.x; cam.y = G.hero.y; musicStart('arena'); window.scrollTo({ top: 0 });
  banner(L('Selamat datang di Arena Clawd!', 'Selamat datang ke Arena Clawd!'));
  toast(esc(AKUN.nama) + ' · ' + tx(heroSkin(SET.hero).nama) + L(' — minion pertama segera keluar.', ' — minion pertama keluar sebentar lagi.'));
}
function toMenu() { musicStop(); G = null; curQ = null; sheet.hidden = true; document.body.classList.remove('arena-on'); document.getElementById('game').hidden = true; buildMap(SET.mode); mlLobi(); }
function drawIcons() { document.querySelectorAll('canvas[data-ic]').forEach(function (c) { var keep = ctx; ctx = c.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); drawClawd(c.width / 2, c.height * 0.8, { s: 2.6, hero: c.getAttribute('data-ic'), face: 0.6, t: time, angry: true }); ctx = keep; }); }
var heroCv = document.getElementById('heroCv'), hctx = heroCv.getContext('2d'); heroCv.width = 220 * DPR; heroCv.height = 220 * DPR;
function lanePos(Ln, t) { var segs = [], tot = 0, i; for (i = 0; i < Ln.length - 1; i++) { var d = Math.hypot(Ln[i + 1][0] - Ln[i][0], Ln[i + 1][1] - Ln[i][1]); segs.push(d); tot += d; } var u = t * tot; for (i = 0; i < segs.length; i++) { if (u <= segs[i]) { var k = u / segs[i]; return [Ln[i][0] + (Ln[i + 1][0] - Ln[i][0]) * k, Ln[i][1] + (Ln[i + 1][1] - Ln[i][1]) * k]; } u -= segs[i]; } return Ln[Ln.length - 1]; }
var iconT = 0;
function drawMenuHero() {
  ctx = hctx; var k = 220 / WS; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.drawImage(MINI, 0, 0, 220, 220);
  ctx.setTransform(DPR * k, 0, 0, DPR * k, 0, 0);
  MODES[mode].turrets.forEach(function (d) { ctx.fillStyle = d.team ? NAVY : CL; ctx.fillRect(d.p[0] - 30, d.p[1] - 30, 60, 60); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.strokeRect(d.p[0] - 30, d.p[1] - 30, 60, 60); });
  [[BASE0.x + 20, BASE0.y - 20, CL], [BASE1.x - 20, BASE1.y + 20, NAVY]].forEach(function (c) { ctx.fillStyle = c[2]; ctx.fillRect(c[0] - 55, c[1] - 55, 110, 110); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.strokeRect(c[0] - 55, c[1] - 55, 110, 110); });
  CAMPS.forEach(function (c) { ctx.fillStyle = { kelomang: '#f2b07a', merah: '#d9534a', biru: SKY, penyu: '#5f7d6a' }[c.t]; ctx.beginPath(); ctx.arc(c.x, c.y, 36, 0, 6.3); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); });
  LANE_IDS.forEach(function (Lid, li) { for (var j = 0; j < 4; j++) { var t = ((time * 0.06 + j * 0.06 + li * 0.13) % 0.5), p = lanePos(LANES[Lid], t), q = lanePos(LANES[Lid], 1 - t); ctx.fillStyle = CL; ctx.beginPath(); ctx.arc(p[0], p[1], 22, 0, 6.3); ctx.fill(); ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(q[0], q[1], 22, 0, 6.3); ctx.fill(); } });
  var hp = lanePos(LANES.tengah, 0.42 + Math.sin(time * 0.8) * 0.08);
  drawClawd(hp[0], hp[1] + 60, { s: 5, hero: SET.hero, face: 1, t: time, run: true });
  iconT += 1; if (iconT % 6 === 0) drawIcons();
}
