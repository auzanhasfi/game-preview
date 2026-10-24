/* Arena Clawd Pro: Toko dalam arena + soal di dalam pertarungan */
'use strict';

/* ---------- toko ---------- */
function stopInput() { if (!G) return; G.input.x = G.input.y = 0; G.input.atk = false; joy.active = false; keys = {}; }
function openShop() { if (!G || G.state !== 'main') return; G.state = 'kedai'; stopInput(); renderShop(); }
function renderShop() {
  var h = G.hero, slots = ITEMS.filter(function (it) { return !it.potion; }), pot = itemById('ramuan');
  var canPot = G.gold >= pot.harga && h.hp < h.max && !h.dead;
  paperEl.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap"><h2>' + L('Toko', 'Kedai') + '</h2><span class="gold">' + ic('coin', 18) + ' ' + Math.floor(G.gold) + '</span></div>' +
    '<p class="muted">' + L('Beli sampai 6 item. Game berhenti selama toko dibuka.', 'Beli sehingga 6 item. Game berhenti semasa kedai dibuka.') + '</p>' +
    '<div class="bag">' + L('Tas ', 'Beg ') + [0, 1, 2, 3, 4, 5].map(function (i) { var it = itemById(G.items[i]); return '<span>' + (it ? ic(it.ikon, 22) : '') + '</span>'; }).join('') + '</div>' +
    '<div class="shop"><button data-buy="ramuan" data-uji="beli-ramuan"' + (canPot ? '' : ' disabled') + '><span>' + ic(pot.ikon, 22) + '</span><b>' + tx(pot.nama) + '</b><span class="price">' + pot.harga + '</span><span>' + tx(pot.t) + '</span></button>' +
    slots.map(function (it) { var own = G.items.indexOf(it.id) >= 0, can = !own && G.gold >= it.harga && G.items.length < 6; return '<button data-buy="' + it.id + '" data-uji="beli-' + it.id + '" class="' + (own ? 'own' : '') + '"' + (can ? '' : ' disabled') + '><span>' + ic(it.ikon, 22) + '</span><b>' + tx(it.nama) + '</b><span class="price">' + (own ? '' : it.harga) + '</span><span>' + tx(it.t) + '</span></button>'; }).join('') + '</div>' +
    '<p class="muted" style="font-size:14px">' + L('Serangan ', 'Serangan ') + Math.round(atkPower()) + ' · ' + L('Nyawa ', 'Nyawa ') + Math.round(h.hp) + '/' + Math.round(h.max) + ' · ' + L('Kecepatan ', 'Laju ') + Math.round(h.spd) + '</p>' +
    '<div class="row"><button class="primary" id="shopClose" data-uji="tutup-kedai">' + L('Kembali bertarung ▸', 'Kembali bertarung ▸') + '</button></div>';
  sheet.hidden = false;
  paperEl.querySelectorAll('[data-buy]').forEach(function (b) { b.onclick = function () { buy(b.getAttribute('data-buy')); }; });
  document.getElementById('shopClose').onclick = closeShop;
}
function buy(id) {
  var it = itemById(id), h = G.hero; if (!it || G.gold < it.harga) return false;
  if (it.potion) { if (h.dead || h.hp >= h.max) return false; G.gold -= it.harga; var add = h.max * 0.4; h.hp = Math.min(h.max, h.hp + add); floatText(h.x, h.y - 70, '+' + Math.round(add), '#3f6b22', true); sfx('heal'); }
  else { if (G.items.indexOf(id) >= 0 || G.items.length >= 6) return false; G.gold -= it.harga; G.items.push(id); var ratio = h.hp / h.max; calc(); h.hp = Math.min(h.max, h.max * ratio + (it.hp || 0)); sfx('coin'); }
  if (G.state === 'kedai') renderShop(); return true;
}
function closeShop() { sheet.hidden = true; if (G && G.state === 'kedai') { G.state = 'main'; } }

/* ---------- soal di dalam gameplay ---------- */
var curQ = null;
var BUFFS = [
  { id: 'kuasa', ikon: 'sword', nama: ['Kuasa Pensil', 'Kuasa Pensel'], teks: ['Serangan Clawd +40% selama 25 detik.', 'Serangan Clawd +40% selama 25 saat.'] },
  { id: 'laju', ikon: 'wind', nama: ['Sepatu Ajaib', 'Kasut Ajaib'], teks: ['Clawd lari dan menyerang lebih cepat selama 25 detik.', 'Clawd lari dan menyerang lebih laju selama 25 saat.'] },
  { id: 'perisai', ikon: 'shield', nama: ['Perisai Kertas', 'Perisai Kertas'], teks: ['Damage ke Clawd dibagi dua selama 25 detik.', 'Kecederaan pada Clawd separuh selama 25 saat.'] },
  { id: 'pulih', ikon: 'heart', nama: ['Pulih Penuh', 'Pulih Penuh'], teks: ['Nyawa penuh lagi dan semua skill siap.', 'Nyawa penuh semula dan semua skill sedia.'] },
  { id: 'emas', ikon: 'coin', nama: ['Peti Koin', 'Peti Syiling'], teks: ['Dapat 200 koin untuk membeli item.', 'Dapat 200 syiling untuk beli item.'] },
  { id: 'meriam', ikon: 'bomb', nama: ['Meriam Bonus', 'Meriam Bonus'], teks: ['1 minion meriam + 1 minion super keluar di setiap lorong.', '1 minion meriam + 1 minion super keluar di setiap lorong.'] }
];
function optsHtml(q) { return '<div class="opts ' + (q.opts.length === 3 ? 'n3' : '') + '" id="opts">' + q.opts.map(function (v) { return '<button data-uji="opt" data-v="' + v + '">' + v + '</button>'; }).join('') + '</div>'; }
function ask(why, target) {
  if (!G || G.state !== 'main') return;
  G.state = 'soalan'; stopInput();
  var tier = qTier() + (why === 'ult' ? 1 : 0);
  curQ = mkQ(SET.topik, SET.diff, tier); curQ.why = why; curQ.target = target; curQ.done = false; curQ.closed = false; curQ.buff = pick(BUFFS);
  var h = G.hero, hd = '', lvTag = '<span class="lvl">' + tx(TOPIC_TX[curQ.ty]) + ' · ' + tx(DIFF_TX[SET.diff]).split(' · ')[0] + ' · ' + L('tingkat ', 'tahap ') + (Math.min(3, tier) + 1) + '</span>';
  if (why === 'mati') hd = '<p class="tag">' + L('Clawd tumbang', 'Clawd tumbang') + '</p><h2>' + L('Jawab benar untuk bangkit sekarang!', 'Jawab betul untuk bangkit segera!') + '</h2><div class="reward"><span>' + ic('zap', 28) + '</span><p>' + L('Benar = Clawd langsung kembali ke markas. Salah = tunggu ' + Math.ceil(h.respT) + ' detik.', 'Betul = Clawd terus kembali ke pangkalan. Salah = tunggu ' + Math.ceil(h.respT) + ' saat.') + '</p></div>';
  else if (why === 'gempur') hd = '<p class="tag">' + L('Soal Gempur', 'Soalan Gempur') + '</p><h2>' + L('Jawab untuk menjatuhkan pensil raksasa!', 'Jawab untuk jatuhkan pensel gergasi!') + '</h2><div class="reward"><span>' + ic('pencil', 28) + '</span><p>' + L('Benar = ', 'Betul = ') + (target.kind === 'core' ? L('Inti Istana Comot −12% nyawa', 'Inti Istana Comot −12% nyawa') : L('menara −18% nyawa', 'menara −18% nyawa')) + L('. Soal Gempur siap lagi 20 detik (salah: 12 detik).', '. Soalan Gempur sedia semula 20 saat (salah: 12 saat).') + '</p></div>';
  else if (why === 'ult') hd = '<p class="tag">' + L('Ultimate Matematika', 'Ultimate Matematik') + '</p><h2>' + tx(HEROES[h.id].sk[2].n) + '</h2><div class="reward"><span>' + ic(HEROES[h.id].sk[2].i, 26) + '</span><p>' + L('Soal lebih sulit. Benar = ultimate 150% kuat. Salah = 70% (tetap keluar).', 'Soalan lebih sukar. Betul = ultimate 150% kuat. Salah = 70% (tetap keluar).') + '</p></div>';
  else hd = '<p class="tag">' + L('Soal kilat · game berhenti sebentar', 'Soalan kilat · game berhenti sekejap') + '</p><h2>' + L('Jawab untuk mendapat kekuatan!', 'Jawab untuk dapat kuasa!') + '</h2><div class="reward"><span>' + ic(curQ.buff.ikon, 22) + '</span><p><b>' + tx(curQ.buff.nama) + '</b>: ' + tx(curQ.buff.teks) + '</p></div>';
  var html = hd + lvTag;
  if (curQ.vis) html += '<div class="vis">' + curQ.vis + '</div>';
  html += '<p class="q">' + qText(curQ) + '</p>' + optsHtml(curQ) + '<p class="fb" id="fb" aria-live="polite"></p><div id="after"></div><p class="prog">' + L('Kombo ', 'Kombo ') + '<span class="kdot on"></span>'.repeat(G.combo) + '<span class="kdot"></span>'.repeat(Math.max(0, 3 - G.combo)) + L('· 3 benar beruntun = Ledakan Kombo', '· 3 betul berturut = Letupan Kombo') + '</p><div class="confetti" id="conf"></div>';
  paperEl.innerHTML = html; sheet.hidden = false; musicStop();
  paperEl.querySelectorAll('#opts button').forEach(function (b) { b.onclick = function () { answer(b); }; });
}
function answer(b) {
  if (!curQ || curQ.done) return; curQ.done = true; G.asked++;
  var ok = +b.getAttribute('data-v') === curQ.ans, fb = document.getElementById('fb'), h = G.hero;
  curQ.chosen = +b.getAttribute('data-v');
  G.log.push({ q: curQ, ok: ok }); record(curQ, ok);
  document.getElementById('opts').classList.add('done');
  if (ok) {
    G.correct++; G.combo++; G.comboMax = Math.max(G.comboMax, G.combo); gainXp(40); G.gold += 30;
    b.classList.add('ok'); sfx('correct'); confetti(); fb.className = 'fb ok';
    fb.textContent = L('Benar! ', 'Betul! ') + { mati: L('Clawd bangkit sekarang.', 'Clawd bangkit sekarang.'), gempur: L('Pensil raksasa meluncur!', 'Pensel gergasi meluncur!'), ult: L('Ultimate 150%!', 'Ultimate 150%!'), kilat: tx(curQ.buff.nama) }[curQ.why] + ' +40 XP +30 ' + L('koin', 'syiling');
    setTimeout(finishQ, 1250);
  } else {
    G.combo = 0;
    b.classList.add('no'); sfx('wrong'); paperEl.querySelectorAll('#opts button').forEach(function (x) { if (+x.getAttribute('data-v') === curQ.ans) x.classList.add('ok'); });
    fb.className = 'fb no'; fb.textContent = L('Jawabannya ', 'Jawapannya ') + curQ.ans + L('. Tidak apa-apa, lihat caranya:', '. Tak apa, lihat caranya:');
    document.getElementById('after').innerHTML = explainHtml(curQ) + '<div class="row" style="margin-top:12px"><button class="primary" id="qNext" data-uji="lanjut">' + (curQ.why === 'ult' ? L('Lanjut · ultimate 70% ▸', 'Teruskan · ultimate 70% ▸') : L('Lanjut ▸', 'Teruskan ▸')) + '</button></div>';
    document.getElementById('qNext').onclick = finishQ;
  }
}
function finishQ() {
  if (!curQ || !curQ.done || curQ.closed || !G) return; curQ.closed = true;
  var q = curQ, ok = q.chosen === q.ans, h = G.hero;
  sheet.hidden = true; G.state = 'main'; musicStart();
  if (q.why === 'mati') { if (ok) respawn(); }
  else if (q.why === 'gempur') {
    G.gempurCd = ok ? 20 : 12;
    if (ok && alive(q.target)) { G.fx.push({ kind: 'pencil', x: q.target.x, y: q.target.y, t: 0, target: q.target, pct: q.target.kind === 'core' ? 0.12 : 0.18, done: false }); sfx('dash'); }
    else if (!ok) toast(L('Soal Gempur bisa dicoba lagi dalam 12 detik.', 'Soalan Gempur boleh dicuba lagi dalam 12 saat.'));
  }
  else if (q.why === 'ult') { if (!h.dead) cast(2, ok ? 1.5 : 0.7); }
  else if (ok) {
    var bf = q.buff.id;
    if (bf === 'pulih') { h.hp = h.max; h.cd = [0, 0, 0]; floatText(h.x, h.y - 80, L('Pulih penuh!', 'Pulih penuh!'), '#3f6b22', true); }
    else if (bf === 'emas') gainGold(200, h.x, h.y, true);
    else if (bf === 'meriam') { spawnAtBase('meriam', 1 + G.waveN * 0.04); spawnAtBase('super', 1 + G.waveN * 0.04); banner(L('Meriam Bonus berangkat!', 'Meriam Bonus bertolak!')); }
    else { G.buffs[bf] = 25; floatText(h.x, h.y - 80, tx(q.buff.nama) + '!', GOLD, true); }
    burst(h.x, h.y, 16, 'star'); sfx('lvl');
  }
  if (G.combo >= 3) { G.combo = 0; comboBlast(); }
}
function confetti() { var c = document.getElementById('conf'); if (!c) return; for (var i = 0; i < 26; i++) { var e = document.createElement('i'), a = Math.random() * 6.28, d = 120 + Math.random() * 160; e.style.setProperty('--dx', Math.cos(a) * d + 'px'); e.style.setProperty('--dy', Math.sin(a) * d * 0.8 - 40 + 'px'); e.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg'); e.style.background = ['#d9534a', '#3f7fc4', '#e2a93b', '#6fa83c', '#f19bb4'][i % 5]; c.appendChild(e); } }
