/* Arena Clawd Pro: layar hasil ala ML — spanduk KEMENANGAN/KEKALAHAN, MVP + rating, data pertandingan, hadiah akun, laporan belajar */
'use strict';

var hasilTab = 'data', HASIL = null;
function mlHasil(won) {
  var g = G, stat = { tambah: [0, 0], kurang: [0, 0], kali: [0, 0], bagi: [0, 0] }, wrong = [];
  g.log.forEach(function (r) { stat[r.q.ty][1]++; if (r.ok) stat[r.q.ty][0]++; else wrong.push(r.q); });
  var acc = g.asked ? Math.round(g.correct / g.asked * 100) : 0;
  var score = Math.round(g.kills * 20 + g.towers * 300 + g.monsKilled * 80 + g.correct * 150 + g.combos * 200 + (won ? 1500 + Math.max(0, 1200 - g.t) * 2 : 0));
  var rating = Math.max(2, Math.min(10, 4 + acc / 100 * 2.5 + (g.towerTotal ? g.towers / g.towerTotal : 0) * 1.5 + Math.min(1, g.kills / 30) * 0.8 + (g.deaths === 0 ? 0.4 : 0) + (won ? 0.8 : 0)));
  var mvp = won && rating >= 8, medal = rating >= 8 ? 'emas' : rating >= 6.5 ? 'perak' : 'perunggu';
  /* hadiah + catatan */
  var koin = Math.min(400, Math.round(40 + score / 25)), ber = g.correct + (won ? 3 : 0), xp = Math.round(60 + score / 15), bintang = g.mode === 'tiga' && won ? 1 : 0;
  var rk0 = rankInfo(AKUN.bintang).nama;
  AKUN.koin += koin; AKUN.berlian += ber; var naik = addAkunXp(xp); AKUN.bintang += bintang; AKUN.main++; if (won) AKUN.menang++; if (mvp) AKUN.mvp++;
  var m = misiData(); m.benar += g.correct; m.menara += g.towers; if (won) m.menang++;
  saveAkun();
  prog.main++; if (won) prog.menang++; var isBest = score > prog.best; if (isBest) prog.best = score; saveProg();
  HASIL = { won: won, stat: stat, wrong: wrong, acc: acc, score: score, isBest: isBest, rating: rating, mvp: mvp, medal: medal, koin: koin, ber: ber, xp: xp, naik: naik, bintang: bintang, naikRank: rankInfo(AKUN.bintang).nama !== rk0,
    g: { t: g.t, kills: g.kills, towers: g.towers, towerTotal: g.towerTotal, mons: g.monsKilled, correct: g.correct, asked: g.asked, comboMax: g.comboMax, combos: g.combos, gempur: g.gempurHit, lvl: g.hero.lvl, deaths: g.deaths, dmg: Math.round(g.dmg), taken: Math.round(g.taken), gold: g.items.reduce(function (a, id) { return a + itemById(id).harga; }, 0) + Math.floor(g.gold), items: g.items.slice(), hero: g.hero.id, skin: g.skin.id, mode: g.mode } };
  G = null; curQ = null; sheet.hidden = true; hasilTab = 'data';
  renderHasil();
  setTimeout(function () { if (mlScr === 'hasil') musicStart('lobi'); }, 2200);
}
function renderHasil() {
  var R = HASIL, g = R.g, won = R.won, MC = { emas: '#d9b25f', perak: '#c4cdda', perunggu: '#c98f63' }, MT = { emas: ['Medali Emas', 'Pingat Emas'], perak: ['Medali Perak', 'Pingat Perak'], perunggu: ['Medali Perunggu', 'Pingat Gangsa'] };
  var data = '<div class="dgrid">' + [[g.correct + '/' + g.asked, L('Soal benar', 'Soalan betul')], [R.acc + '%', L('Akurasi', 'Ketepatan')], [g.towers + '/' + g.towerTotal, L('Menara roboh', 'Menara runtuh')], [g.kills, L('Minion kalah', 'Minion tumpas')],
    [g.mons, L('Monster hutan', 'Raksasa hutan')], [g.gempur, L('Pensil raksasa', 'Pensel gergasi')], [g.comboMax, L('Kombo terpanjang', 'Kombo terpanjang')], [g.combos, L('Ledakan kombo', 'Letupan kombo')],
    [fmt(g.t), L('Waktu', 'Masa')], [g.lvl, L('Level hero', 'Tahap hero')], [g.dmg, L('Damage diberi', 'Kecederaan diberi')], [g.gold, L('Koin arena', 'Syiling arena')]].map(function (x) { return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('') + '</div>' +
    '<p class="ttl">' + L('Item akhir', 'Item akhir') + '</p><div class="slots">' + [0, 1, 2, 3, 4, 5].map(function (i) { var it = itemById(g.items[i]); return '<span class="slot" style="cursor:default">' + (it ? ic(it.ikon, 22) : '') + '</span>'; }).join('') + '</div>';
  var lap = '<div class="lap">';
  if (g.asked) lap += '<p class="tag">' + L('Akurasi per topik', 'Ketepatan ikut topik') + '</p>' + topicBars(R.stat);
  if (R.wrong.length) lap += '<p class="tag">' + L('Soal yang perlu diulang', 'Soalan yang perlu diulang') + '</p><ul class="mist">' + R.wrong.slice(0, 5).map(function (q) { return '<li><b>' + qText(q).replace('?', q.c).replace('□', '<u>' + q.ans + '</u>') + '</b> · ' + L('kamu jawab ', 'kamu jawab ') + q.chosen + explainHtml(q) + '</li>'; }).join('') + '</ul>';
  else if (g.asked) lap += '<p class="note">' + L('Semua soal benar — hebat!', 'Semua soalan betul — hebat!') + '</p>';
  else lap += '<p>' + L('Belum ada soal yang dijawab. Dekati menara musuh dan tekan tombol SOAL.', 'Belum ada soalan dijawab. Dekati menara musuh dan tekan butang SOALAN.') + '</p>';
  lap += '</div>';
  mlShow('hasil', '<div class="scr-hasil"><div class="banner"><canvas data-art="banner" data-anim data-win="' + (won ? 1 : 0) + '"></canvas><p class="ttl">' + (g.mode === 'tiga' ? L('Peringkat', 'Ranked') : L('Klasik', 'Klasik')) + ' · ' + fmt(g.t) + '</p><h1 class="' + (won ? 'win' : 'lose') + '">' + (won ? L('Kemenangan', 'Kemenangan') : L('Kekalahan', 'Kekalahan')) + '</h1><p>' + (won ? L('Inti Istana Comot hancur! Arena milik Clawd.', 'Inti Istana Comot musnah! Arena milik Clawd.') : L('Inti Markas Clawd hancur. Coba lagi, kamu pasti bisa!', 'Teras Pangkalan Clawd musnah. Cuba lagi, kamu pasti boleh!')) + '</p></div>' +
    '<div class="hasil"><div class="pn mvp">' + (R.mvp ? '<span class="medal">' + ic('crown', 16) + ' MVP</span>' : '') + '<div class="art"><canvas data-art="hero" data-anim data-nameless data-hero="' + g.hero + '" data-skin="' + g.skin + '"></canvas></div><b style="font:800 18px var(--font-ui)">' + esc(AKUN.nama) + '</b><span class="dim">' + tx(skinObj(g.hero, g.skin).nama) + '</span>' +
      '<span class="rating">' + R.rating.toFixed(1) + '</span><span class="medal" style="--mc:' + MC[R.medal] + '">' + tx(MT[R.medal]) + '</span></div>' +
      '<div class="pn data"><div class="tabs2"><button data-ht="data" data-uji="tab-data" aria-selected="' + (hasilTab === 'data') + '">' + L('Data pertandingan', 'Data perlawanan') + '</button><button data-ht="lap" data-uji="tab-laporan" aria-selected="' + (hasilTab === 'lap') + '">' + L('Laporan belajar', 'Laporan pembelajaran') + '</button></div>' +
        (hasilTab === 'data' ? data : lap) +
        '<p class="ttl">' + L('Hadiah', 'Ganjaran') + '</p><div class="rew"><div><b>+' + R.koin + '</b><span>' + L('Koin', 'Syiling') + '</span></div><div><b>+' + R.ber + '</b><span>' + L('Berlian (1 tiap soal benar)', 'Berlian (1 setiap soalan betul)') + '</span></div><div><b>+' + R.xp + '</b><span>XP ' + L('akun', 'akaun') + (R.naik ? ' · Lv ' + AKUN.lv + '!' : '') + '</span></div>' +
          (g.mode === 'tiga' ? '<div><b>' + (R.bintang ? '+1 ' + ic('star', 16) : '0 ' + ic('star', 16)) + '</b><span>' + (R.bintang ? (R.naikRank ? L('Naik rank: ', 'Naik rank: ') + rankInfo(AKUN.bintang).nama : L('Bintang rank', 'Bintang rank')) : L('Bintang terlindungi', 'Bintang dilindungi')) + '</span></div>' : '') + '</div>' +
        '<p class="dim" style="font-size:13px">' + L('Skor ', 'Skor ') + R.score + (R.isBest ? L(' · skor terbaik baru!', ' · skor terbaik baharu!') : '') + '</p>' +
        '<div class="acts"><button class="gbtn" id="hsLagi" data-uji="main-semula">' + L('Main lagi', 'Main lagi') + '</button><button class="bbtn" id="hsLobi" data-uji="ke-lobi">' + L('Lobi', 'Lobi') + '</button>' + (R.wrong.length ? '<button class="bbtn" id="hsSalah" data-uji="latih-salah">' + L('Latihan soal yang salah', 'Latih soalan yang salah') + '</button>' : '') + '</div></div></div></div>');
  onAll('[data-ht]', function (b) { hasilTab = b.getAttribute('data-ht'); renderHasil(); });
  document.getElementById('hsLagi').onclick = function () { cariLawan(); };
  document.getElementById('hsLobi').onclick = function () { mlLobi(); };
  var hs = document.getElementById('hsSalah'); if (hs) hs.onclick = function () { bukaAkademi('latihan'); startPractice({ list: R.wrong.map(function (q) { var c = Object.assign({}, q); c.opts = mkOpts(c); return c; }), title: L('Soal yang salah tadi', 'Soalan yang salah tadi') }); };
}
