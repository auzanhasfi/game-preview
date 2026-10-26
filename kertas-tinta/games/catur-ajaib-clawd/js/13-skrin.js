/* Catur Ajaib Clawd: menu, lembar dialog (jeda, skill komandan, kesempatan kedua, kartu Go Go, Kotak Go Go, hasil) */
'use strict';
var sheet = $('sheet'), paperEl = $('paper');
function openSheet(html, kind) { paperEl.innerHTML = html; paperEl.className = 'paper m-' + (kind || 'sheet'); sheet.hidden = false; if (G) G.modal = kind || 'sheet'; }
function closeSheet() { sheet.hidden = true; paperEl.innerHTML = ''; if (G) G.modal = null; hudDirty = true; }

/* ---------- menu ---------- */
function applyLang() {
  document.documentElement.lang = LANG;
  [].forEach.call(document.querySelectorAll('[data-t]'), function (el) { el.textContent = T(el.getAttribute('data-t')); });
  [].forEach.call(document.querySelectorAll('[data-lang]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === LANG ? 'true' : 'false'); });
  $('kmdPick').innerHTML = Object.keys(KOMANDAN).map(function (k) {
    return '<button class="pick" data-k="' + k + '" data-uji="kmd-' + k + '" aria-pressed="' + (opt.kmd === k) + '"><img src="' + portrait(k) + '" alt=""><span><b>' + T('k_' + k) + '</b><small>' + T('k_' + k + 'P') + '</small><small>' + ic(KOMANDAN[k].ic, 14) + T('k_' + k + 'A') + '</small></span></button>';
  }).join('');
  $('diffPick').innerHTML = ['mudah', 'sedang', 'sulit'].map(function (d) { return '<button data-d="' + d + '" data-uji="' + d + '" aria-pressed="' + (opt.diff === d) + '"><b>' + T(d) + '</b><small>' + T(d + 'D') + '</small></button>'; }).join('');
  $('modePick').innerHTML = ['cepat', 'penuh'].map(function (d) { return '<button data-m="' + d + '" data-uji="mode-' + d + '" aria-pressed="' + (opt.mode === d) + '"><b>' + T(d) + '</b><small>' + T(d + 'D') + '</small></button>'; }).join('');
  $('how').innerHTML = [['h1', 'bag'], ['h2', 'stars'], ['h3', 'hexagon'], ['h4', 'coin']].map(function (h) { return '<div>' + ic(h[1], 20) + '<b>' + T(h[0]) + '</b><span>' + T(h[0] + 'd') + '</span></div>'; }).join('');
  $('bStart').innerHTML = T('mulai') + ' ' + ic('next', 20);
  var best = null; try { best = localStorage.getItem('catur-ajaib-terbaik'); } catch (e) {}
  $('best').textContent = best ? T('terbaik', best) : '';
  if (G) { G.me.nama = T('kamu'); hudDirty = true; soalDirty = true; }
}
function saveOpt() { try { localStorage.setItem('catur-ajaib-opsi', JSON.stringify(opt)); } catch (e) {} }
$('menu').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return; audioInit();
  if (b.dataset.lang) { LANG = b.dataset.lang; try { localStorage.setItem('catur-ajaib-bahasa', LANG); } catch (er) {} }
  else if (b.dataset.k) opt.kmd = b.dataset.k; else if (b.dataset.d) opt.diff = b.dataset.d; else if (b.dataset.m) opt.mode = b.dataset.m;
  else if (b.id === 'bStart') { startGame(); return; } else return;
  sfx('tap'); saveOpt(); applyLang();
});
function startGame() {
  saveOpt(); document.body.classList.add('main'); $('menu').hidden = true; $('game').hidden = false; closeSheet();
  newGame(); resize(); hudDirty = true; soalDirty = true; musicStart();
  window.scrollTo(0, 0);
}
function toMenu() { closeSheet(); musicStop(); G = null; document.body.classList.remove('main'); $('game').hidden = true; $('menu').hidden = false; applyLang(); }

/* ---------- jeda ---------- */
function openPause() {
  if (!G || G.modal) return;
  openSheet('<h2>' + T('jeda') + '</h2><ol class="cara">' + [1, 2, 3, 4, 5].map(function (i) { return '<li>' + T('cara' + i) + '</li>'; }).join('') + '</ol>' +
    '<div class="row"><button class="primary" id="pL" data-uji="lanjut">' + T('lanjut') + '</button><button id="pM" data-uji="keluar">' + T('keluar') + '</button></div>', 'pause');
  $('pL').onclick = closeSheet; $('pM').onclick = toMenu;
}

/* ---------- skill komandan (tempur berhenti, jawab soal) ---------- */
function openKmd() {
  if (!G || G.phase !== 'tempur' || G.kmdUsed || G.modal || G.sim.done) return;
  G.kmdUsed = true; var q = mkQ(opt.diff);
  openSheet('<p class="tag">' + T('kmdBtn') + '</p><h2>' + T('kmdSoal', T('k_' + opt.kmd + 'A').split(':')[0]) + '</h2>' + qHTML(q, 'optsK'), 'kmd');
  bindQ(paperEl, q, function (ok) { setTimeout(function () { closeSheet(); kmdEffect(ok ? 1 : 0.4); toast(ok ? T('kmdPenuh') : T('kmdLemah'), ok ? 'gold' : ''); }, G.auto ? 0 : 900); });
}
function kmdEffect(k) {
  var sim = G.sim; if (!sim || sim.done) return;
  var src = { dmgMul: k, darah: false, crit: 0, ls: 0, dealt: 0, side: 0 }, st = G.stage, fo = sim.f.filter(function (f) { return !f.dead && f.side === 1; });
  sfx('ult');
  if (opt.kmd === 'petualang') shuffle(fo).slice(0, 3).forEach(function (f) { hurtF(sim, src, f, 250 + 80 * st, true); ring(f.x, f.y, CL, 1.3); });
  else if (opt.kmd === 'penjaga') sim.f.forEach(function (f) { if (!f.dead && f.side === 0) { f.shield += (200 + 60 * st) * k; ring(f.x, f.y, '#cfd6e6', 1.1); } });
  else fo.forEach(function (f) { hurtF(sim, src, f, 120 + 40 * st, true); f.stun = Math.max(f.stun, 1.2 * k); ring(f.x, f.y, GOLD, 1); });
}

/* ---------- kesempatan kedua ---------- */
function openSecond() {
  G.secondUsed = true; var q = mkQ(opt.diff);
  openSheet('<p class="tag">' + ic('heart', 14) + ' ' + T('nyawa') + ' 0</p><h2>' + T('kesempatanT') + '</h2><p>' + T('kesempatanD') + '</p>' + qHTML(q, 'optsS'), 'second');
  bindQ(paperEl, q, function (ok) {
    setTimeout(function () {
      closeSheet();
      if (ok) { G.me.hp = 10; toast(T('bertahan'), 'gold'); sfx('heal'); }
      else eliminate([G.me]);
      hudDirty = true;
    }, G.auto ? 0 : 1000);
  });
}

/* ---------- kartu Go Go ---------- */
function openCards() {
  G.cards = { opts: cardPair(), ganti: 2, buka: {} };
  renderCards();
}
function renderCards() {
  var C = G.cards;
  openSheet('<p class="tag">' + T('tahap') + ' ' + G.stage + '-' + G.round + '</p><h2>' + T('kartuT') + '</h2><p class="small">' + T('kartuD') + '</p>' +
    '<div class="cards">' + C.opts.map(function (c, i) {
      var K = CARDS[c], lock = K.r === 'emas' && C.buka[i] !== true, gagal = C.buka[i] === false;
      return '<div class="kartu ' + K.r + (gagal ? ' gagal' : '') + '"><span class="rr">' + T('r_' + K.r) + '</span>' + ic(K.ic, 34) + '<b>' + T('c_' + c) + '</b><p>' + T('c_' + c + 'D') + '</p>' +
        (gagal ? '<button disabled>' + ic('lock', 16) + T('gagalKartu') + '</button>' : lock ? '<button data-buka="' + i + '" data-uji="buka' + i + '">' + ic('lock', 16) + T('bukaSoal') + '</button>' : '<button class="primary" data-pilih="' + i + '" data-uji="kartu' + i + '">' + T('pilih') + '</button>') + '</div>';
    }).join('') + '</div><div id="kartuSoal"></div>' +
    '<div class="row"><button id="bGanti" data-uji="ganti"' + (C.ganti > 0 ? '' : ' disabled') + '>' + ic('spin', 16) + T('ganti', C.ganti) + '</button>' +
    (C.opts.every(function (c, i) { return C.buka[i] === false; }) && C.ganti <= 0 ? '<button id="bLewat" data-uji="lewati">' + ic('coin', 16) + T('lewati') + '</button>' : '') + '</div>', 'cards');
  var bl = $('bLewat'); if (bl) bl.onclick = function () { G.me.gold += 3; closeSheet(); G.cards = null; hudDirty = true; };
  [].forEach.call(paperEl.querySelectorAll('[data-pilih]'), function (b) { b.onclick = function () { pickCard(+b.dataset.pilih); }; });
  [].forEach.call(paperEl.querySelectorAll('[data-buka]'), function (b) {
    b.onclick = function () {
      var i = +b.dataset.buka, q = mkQ(opt.diff === 'mudah' ? 'sedang' : 'sulit'), box = $('kartuSoal');
      if (opt.diff === 'mudah') q = mkQ('mudah');
      box.innerHTML = qHTML(q, 'optsC');
      bindQ(box, q, function (ok) { setTimeout(function () { if (!G || G.cards !== C) return; C.buka[i] = ok; renderCards(); }, G.auto ? 0 : 900); });
    };
  });
  $('bGanti').onclick = function () { if (C.ganti <= 0) return; C.ganti--; C.opts = cardPair(); C.buka = {}; sfx('tap'); renderCards(); };
}
function pickCard(i) { var c = G.cards.opts[i]; applyCard(G.me, c); sfx('lvl'); closeSheet(); toast(T('c_' + c) + ' · ' + T('c_' + c + 'D'), 'gold'); G.cards = null; hudDirty = true; }

/* ---------- Kotak Go Go ---------- */
function openKotak() {
  G.kotak = { offers: kotakOffers(), order: null, idx: 0, wait: 0, done: false };
  var q = mkQ(opt.diff);
  openSheet('<p class="tag">' + T('tahap') + ' ' + G.stage + '-' + G.round + '</p><h2>' + T('kotakT') + '</h2><p class="small">' + T('kotakD') + '</p>' + kotakGrid(false) +
    '<div id="kotakQ"><p class="note">' + T('kotakSoal') + '</p>' + qHTML(q, 'optsB') + '</div>', 'kotak');
  bindQ($('kotakQ'), q, function (ok) {
    setTimeout(function () { G.kotak.order = kotakOrder(ok); G.kotak.idx = 0; G.kotak.wait = 0.4; $('kotakQ').innerHTML = '<p class="note">' + T('kotakTunggu') + '</p>'; }, G.auto ? 0 : 900);
  });
}
function kotakGrid(mine) {
  return '<div class="kotak" id="kotakGrid">' + G.kotak.offers.map(function (o, i) {
    var H = HEROES[o.id];
    return '<button class="of c' + H.c + (o.by ? ' ambil' : '') + '" data-of="' + i + '" data-uji="kotak' + i + '"' + (mine && !o.by ? '' : ' disabled') + '><img src="' + portrait(o.id) + '" alt=""><b>' + heroNama(o.id) + '</b><span>' + ic('coin', 12) + H.c + ' · ' + ic(ITEMS[o.item].ic, 13) + T('i_' + o.item) + '</span>' +
      (o.by ? '<em>' + T('diambil', o.by.human ? T('kamu') : o.by.nama) + '</em>' : '') + '</button>';
  }).join('') + '</div>';
}
function kotakTick(dt) {
  var K = G.kotak; if (!K || !K.order || K.done) return;
  K.wait -= dt; if (K.wait > 0) return;
  var p = K.order[K.idx];
  if (!p) { K.done = true; setTimeout(function () { closeSheet(); G.kotak = null; G.phase = 'jeda'; G.t = 0.1; }, G.auto ? 0 : 900); return; }
  if (p.human) {
    if (K.mine) { if (G.auto) { kotakMine(aiDraft(G.me, K.offers)); } return; }
    K.mine = true; refreshKotak(true); $('kotakQ').innerHTML = '<p class="note">' + T('kotakGiliran') + '</p>'; return;
  }
  kotakTake(p, aiDraft(p, K.offers)); K.idx++; K.wait = G.auto ? 0 : 0.35; refreshKotak(false);
}
function kotakMine(i) {
  var K = G.kotak; if (!K || !K.mine) return;
  if (kotakTake(G.me, i)) { sfx('coin'); K.mine = false; K.idx++; K.wait = 0.4; refreshKotak(false); $('kotakQ').innerHTML = '<p class="note">' + T('kotakTunggu') + '</p>'; hudDirty = true; }
}
function refreshKotak(mine) {
  var g = $('kotakGrid'); if (!g) return; g.outerHTML = kotakGrid(mine);
  [].forEach.call(paperEl.querySelectorAll('[data-of]'), function (b) { b.onclick = function () { kotakMine(+b.dataset.of); }; });
}

/* ---------- hasil akhir ---------- */
function showResult() {
  G.phase = 'hasil'; musicStop();
  var me = G.me, pl = me.place || 1, win = pl <= 4, ok = G.log.filter(function (x) { return x.ok; }).length, tot = G.log.length;
  try { var b = +localStorage.getItem('catur-ajaib-terbaik') || 9; if (pl < b) localStorage.setItem('catur-ajaib-terbaik', pl); } catch (e) {}
  var best = me.units.slice().sort(function (a, b) { return unitPower(b) - unitPower(a); })[0];
  var miss = G.log.filter(function (x) { return !x.ok; }).slice(-5);
  sfx(win ? 'win' : 'over');
  openSheet('<p class="tag">' + T('hasilT') + '</p><div class="stamp' + (win ? '' : ' bad') + '">' + (pl === 1 ? T('juara') : win ? T('MENANG') : T('KALAH')) + '</div>' +
    '<p class="place">#' + pl + '</p>' +
    '<div class="stats"><div><b>#' + pl + '</b><span>' + T('peringkat') + '</span></div><div><b>' + G.stage + '-' + G.round + '</b><span>' + T('tahapCapai') + '</span></div>' +
    '<div><b>' + ok + '/' + tot + '</b><span>' + T('soalBenar') + '</span></div><div><b>' + (tot ? Math.round(ok / tot * 100) : 0) + '%</b><span>' + T('akurasi') + '</span></div></div>' +
    (best ? '<div class="reward"><img src="' + portrait(best.id) + '" alt="" width="44" height="44"><span>' + T('heroTerbaik') + ': <b>' + heroNama(best.id) + ' ' + Array(best.star + 1).join('★') + '</b></span></div>' : '') +
    '<h3>' + T('ulangSoal') + '</h3>' + (miss.length ? '<ul class="miss">' + miss.map(function (x) { return '<li>' + x.t.replace(' = ?', '') + ' → <b>' + x.ans + '</b></li>'; }).join('') + '</ul>' : '<p class="small">' + T('semuaBenar') + '</p>') +
    '<div class="row"><button class="primary" id="rA" data-uji="ulang">' + T('mainLagi') + '</button><button id="rM" data-uji="menu">' + T('keMenu') + '</button></div>', 'hasil');
  $('rA').onclick = function () { closeSheet(); startGame(); }; $('rM').onclick = toMenu;
}

/* ---------- gambar menu ---------- */
function drawMenuHero() {
  var c = $('heroCv'), keep = ctx; ctx = c.getContext('2d'); time += 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#e8dfca'; ctx.fillRect(0, 0, 440, 300);
  var cell = 55; for (var y = 0; y < 6; y++) for (var x = 0; x < 8; x++) { ctx.fillStyle = (x + y) % 2 ? '#e6d9bd' : '#f3ead6'; ctx.fillRect(x * cell, y * cell, cell, cell); }
  var ids = ['kapur', 'pena', 'kilau', 'naga', 'lipat'];
  ids.forEach(function (id, i) { var H = HEROES[id], bob = Math.sin(time * 3 + i) * 2; drawClawd(70 + i * 75, 230 + (i % 2) * 30 + bob, { s: id === 'naga' ? 1.7 : 1.35, acc: H.acc, col: H.col, colH: H.colH, face: 0.3, t: time + i, atk: Math.sin(time * 2 + i) > 0.9 }); });
  [[90, 70], [200, 60], [330, 80]].forEach(function (p, i) { drawComot(p[0], p[1] + Math.sin(time * 2 + i) * 3, 18, { t: time, i: i, col: LAWAN[i * 2].col, king: i === 1 }); });
  ctx = keep;
}
