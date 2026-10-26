/* Arena Clawd: kedai, soalan kilat, menang/kalah, menu */
'use strict';
/* ---------- kedai ---------- */
function stopInput() { G.input.x = G.input.y = 0; G.input.atk = false; joy.active = false; keys = {}; }
function openShop() {
  if (!G || G.state !== 'main') return;
  G.state = 'kedai'; stopInput(); renderShop();
}
function renderShop() {
  var h = G.hero;
  paperEl.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap"><h2>Kedai</h2><span class="gold">' + ic('coin', 18) + ' ' + Math.floor(G.gold) + '</span></div>' +
    '<p class="muted">Beli sehingga 6 item. Game berhenti semasa kedai dibuka.</p>' +
    '<div class="bag">Beg ' + [0, 1, 2, 3, 4, 5].map(function (i) { var id = G.items[i], it = ITEMS.filter(function (x) { return x.id === id; })[0]; return '<span>' + (it ? ic(it.ikon, 22) : '') + '</span>'; }).join('') + '</div>' +
    '<div class="shop">' + ITEMS.map(function (it) { var own = G.items.indexOf(it.id) >= 0, can = !own && G.gold >= it.harga && G.items.length < 6; return '<button data-buy="' + it.id + '" data-uji="beli-' + it.id + '" class="' + (own ? 'own' : '') + '"' + (can ? '' : ' disabled') + '><span>' + ic(it.ikon, 26) + '</span><b>' + it.nama + '</b><span class="price">' + (own ? '✓' : it.harga) + '</span><span>' + it.t + '</span></button>'; }).join('') + '</div>' +
    '<p class="muted" style="font-size:14px">Serangan ' + Math.round(atkPower()) + ' · Nyawa ' + Math.round(h.max) + ' · Laju ' + Math.round(h.spd) + '</p>' +
    '<div class="row"><button class="primary" id="shopClose" data-uji="tutup-kedai">Kembali bertarung ▸</button></div>';
  sheet.hidden = false;
  paperEl.querySelectorAll('[data-buy]').forEach(function (b) { b.onclick = function () { buy(b.getAttribute('data-buy')); }; });
  document.getElementById('shopClose').onclick = closeShop;
}
function buy(id) {
  var it = ITEMS.filter(function (x) { return x.id === id; })[0]; if (!it || G.items.indexOf(id) >= 0 || G.gold < it.harga || G.items.length >= 6) return false;
  G.gold -= it.harga; G.items.push(id); var ratio = G.hero.hp / G.hero.max; calc(); G.hero.hp = Math.min(G.hero.max, G.hero.max * ratio + (it.hp || 0)); sfx('coin'); if (G.state === 'kedai') renderShop(); return true;
}
function closeShop() { sheet.hidden = true; if (G && G.state === 'kedai') { G.state = 'main'; floatText(G.hero.x, G.hero.y - 80, 'Item baharu!', '#a87516'); } }

/* ---------- soalan kilat ---------- */
var curQ = null;
var BUFFS = [
  { id: 'kuasa', ikon: 'swords', nama: 'Kuasa Pensel', teks: 'Serangan Clawd +40% selama 25 saat.' },
  { id: 'laju', ikon: 'boot', nama: 'Kasut Ajaib', teks: 'Clawd lari dan menyerang lebih laju selama 25 saat.' },
  { id: 'perisai', ikon: 'shield', nama: 'Perisai Kertas', teks: 'Kecederaan pada Clawd separuh selama 25 saat.' },
  { id: 'pulih', ikon: 'heart', nama: 'Pulih Penuh', teks: 'Nyawa penuh semula dan semua skill sedia.' },
  { id: 'emas', ikon: 'coin', nama: 'Peti Syiling', teks: 'Dapat 200 syiling untuk beli item.' }
];
function ask(why) {
  if (!G || G.state !== 'main') return;
  G.state = 'soalan'; stopInput();
  curQ = mkQ(diff); curQ.why = why; curQ.done = false; curQ.buff = BUFFS[ri(0, BUFFS.length - 1)];
  var h = '';
  if (why === 'mati') h += '<p class="tag">Clawd tumbang</p><h2>Jawab betul untuk bangkit segera!</h2><div class="reward"><span>' + ic('zap', 28) + '</span><p>Betul = Clawd terus kembali ke pangkalan. Salah = tunggu ' + Math.ceil(G.hero.respT) + ' saat.</p></div>';
  else h += '<p class="tag">Soalan kilat · game berhenti sekejap</p><h2>Jawab untuk dapat kuasa!</h2><div class="reward"><span>' + ic(curQ.buff.ikon, 28) + '</span><p><b>' + curQ.buff.nama + '</b>: ' + curQ.buff.teks + '</p></div>';
  if (curQ.vis) h += '<div class="vis">' + curQ.vis + '</div>';
  h += '<p class="q">' + curQ.t + '</p><div class="opts ' + (curQ.opts.length === 3 ? 'n3' : '') + '" id="opts">' + curQ.opts.map(function (v) { return '<button data-uji="opt" data-v="' + v + '">' + v + '</button>'; }).join('') + '</div><p class="fb" id="fb" aria-live="polite"></p><div class="confetti" id="conf"></div>';
  paperEl.innerHTML = h; sheet.hidden = false; musicStop();
  paperEl.querySelectorAll('#opts button').forEach(function (b) { b.onclick = function () { answer(b); }; });
}
function answer(b) {
  if (!curQ || curQ.done) return; curQ.done = true; G.asked++;
  var ok = +b.getAttribute('data-v') === curQ.ans, fb = document.getElementById('fb');
  document.getElementById('opts').classList.add('done');
  if (ok) { G.correct++; b.classList.add('ok'); sfx('correct'); confetti(); fb.className = 'fb ok'; fb.textContent = curQ.why === 'mati' ? 'Betul! Clawd bangkit sekarang.' : 'Betul! ' + curQ.buff.nama + '!'; }
  else { b.classList.add('no'); sfx('wrong'); paperEl.querySelectorAll('#opts button').forEach(function (x) { if (+x.getAttribute('data-v') === curQ.ans) x.classList.add('ok'); }); fb.className = 'fb no'; fb.textContent = 'Jawapannya ' + curQ.ans + '. Tak apa, teruskan berjuang!'; }
  setTimeout(function () {
    sheet.hidden = true; if (!G) return;
    var h = G.hero;
    if (ok) {
      if (curQ.why === 'mati') respawn();
      else if (curQ.buff.id === 'pulih') { h.hp = h.max; h.cd = [0, 0, 0]; floatText(h.x, h.y - 80, 'Pulih penuh!', '#3f6b22', true); }
      else if (curQ.buff.id === 'emas') gainGold(200, h.x, h.y, true);
      else { G.buffs[curQ.buff.id] = G.bakat === 'bijak' ? 35 : 25; floatText(h.x, h.y - 80, curQ.buff.nama + '!', GOLD, true); }
      if (h.mahkota || G.bakat === 'bijak') gainGold((h.mahkota ? 100 : 0) + (G.bakat === 'bijak' ? 50 : 0), h.x, h.y, true);
      burst(h.x, h.y, 16, 'star'); sfx('lvl');
    }
    G.state = 'main'; musicStart();
  }, ok ? 1300 : 2000);
}
function confetti() { var c = document.getElementById('conf'); if (!c) return; for (var i = 0; i < 26; i++) { var e = document.createElement('i'), a = Math.random() * 6.28, d = 120 + Math.random() * 160; e.style.setProperty('--dx', Math.cos(a) * d + 'px'); e.style.setProperty('--dy', Math.sin(a) * d * 0.8 - 40 + 'px'); e.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg'); e.style.background = ['#d9534a', '#3f7fc4', '#e2a93b', '#6fa83c', '#f19bb4'][i % 5]; c.appendChild(e); } }

/* ---------- menang / kalah / jeda ---------- */
function fmt(t) { var m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ':' + (s < 10 ? '0' : '') + s; }
function win() {
  if (G.state === 'menang') return; G.state = 'menang'; musicStop();
  setTimeout(function () {
    sfx('win');
    var stars = 1 + (G.deaths <= 1 ? 1 : 0) + (G.asked && G.correct / G.asked >= 0.75 ? 1 : 0);
    var score = Math.round(G.kills * 20 + G.towers * 300 + G.monsKilled * 80 + G.correct * 150 + G.rk * 400 + Math.max(0, 1000 - G.t) * 2);
    if (score > best) { best = score; try { localStorage.setItem('arena-best', best); } catch (e) {} }
    paperEl.innerHTML = '<span class="stamp">MENANG!</span><div class="stars">' + [0, 1, 2].map(function (i) { return '<span class="' + (i < stars ? '' : 'off') + '">★</span>'; }).join('') + '</div><h2>Raja Comot tumbang! Pangkalan Clawd selamat.</h2>' +
      '<div class="stats"><div><b>' + fmt(G.t) + '</b><span>Masa</span></div><div><b>' + G.kills + '</b><span>Minion dikalahkan</span></div><div><b>' + G.towers + '/6</b><span>Menara musuh runtuh</span></div><div><b>' + G.monsKilled + '</b><span>Monster hutan</span></div>' + (G.lawan !== 'tiada' ? '<div><b>' + G.rk + '</b><span>Pendekar tumbang</span></div>' : '') + '<div><b>' + G.correct + '/' + G.asked + '</b><span>Soalan betul</span></div><div><b>' + G.hero.lvl + '</b><span>Tahap Clawd</span></div></div>' +
      '<p class="muted">Skor ' + score + (score >= best ? ' · skor terbaik baharu!' : '') + '</p><div class="row"><button class="primary" id="eAgain" data-uji="main-semula">Main semula</button><button id="eMenu">Tukar hero</button></div><div class="confetti" id="conf"></div>';
    sheet.hidden = false; confetti();
    document.getElementById('eAgain').onclick = function () { sheet.hidden = true; startGame(); };
    document.getElementById('eMenu').onclick = function () { sheet.hidden = true; toMenu(); };
  }, 1500);
}
function lose() {
  if (G.state === 'kalah') return; G.state = 'kalah'; musicStop(); sfx('over');
  paperEl.innerHTML = '<span class="stamp bad">KALAH</span><h2>Pangkalan Clawd ditawan</h2><p>Askar Si Comot terlalu ramai. Petua: bersihkan minion musuh dekat menara kita, beli item di kedai, dan ambil buff hutan.</p><div class="row"><button class="primary" id="lAgain" data-uji="cuba-lagi">Cuba lagi</button><button id="lMenu">Tukar hero</button></div>';
  sheet.hidden = false;
  document.getElementById('lAgain').onclick = function () { sheet.hidden = true; startGame(); };
  document.getElementById('lMenu').onclick = function () { sheet.hidden = true; toMenu(); };
}
function pause(on) {
  if (!G) return;
  if (on && G.state === 'main') {
    G.state = 'jeda'; musicStop(); stopInput();
    paperEl.innerHTML = '<h2>Jeda</h2><p>Askar kedua-dua pasukan berehat sekejap.</p>' + misiHtml() + '<div class="row"><button class="primary" id="pRes" data-uji="sambung">Sambung ▸</button><button id="pMenu">Menu</button></div>';
    sheet.hidden = false;
    document.getElementById('pRes').onclick = function () { pause(false); };
    document.getElementById('pMenu').onclick = function () { sheet.hidden = true; toMenu(); };
  } else if (!on && G.state === 'jeda') { sheet.hidden = true; G.state = 'main'; musicStart(); }
}
document.getElementById('bPause').onclick = function () { pause(true); };
var bMute = document.getElementById('bMute');
function muteLabel() { bMute.innerHTML = ic(muted ? 'mute' : 'sound', 20); }
muteLabel();
bMute.onclick = function () { muted = !muted; try { localStorage.setItem('arena-mute', muted ? '1' : '0'); } catch (e) {} muteLabel(); if (muted) musicStop(); else { audioInit(); if (G && G.state === 'main') musicStart(); } };
document.addEventListener('visibilitychange', function () { if (document.hidden) pause(true); });

/* ---------- menu ---------- */
function startGame() {
  audioInit(); document.getElementById('menu').hidden = true; document.getElementById('game').hidden = false;
  newGame(); cam.x = G.hero.x; cam.y = G.hero.y; musicStart(); window.scrollTo({ top: 0 });
  toast('Selamat datang, ' + HEROES[pickHero].nama + '!' + (pickLawan !== 'tiada' ? ' Awas, Pendekar Comot juga turun ke lorong.' : ' Askar pertama keluar sebentar lagi.'));
}
function toMenu() { musicStop(); G = null; document.getElementById('game').hidden = true; document.getElementById('menu').hidden = false; renderBest(); }
function renderBest() { document.getElementById('best').textContent = best ? 'Skor terbaik: ' + best : ''; }
function renderPicks() {
  document.getElementById('heroPick').innerHTML = Object.keys(HEROES).map(function (id) { var H = HEROES[id]; return '<button class="pick" data-hero="' + id + '" data-uji="hero-' + id + '" aria-pressed="' + (id === pickHero) + '"><canvas width="168" height="168" data-ic="' + id + '"></canvas><span class="role">' + H.role + '</span><b>' + H.nama + '</b><ul>' + H.sk.map(function (s, i) { return '<li>' + ic(s.ic, 15) + ' ' + s.n + (i === 2 ? ' (ultimate)' : '') + '</li>'; }).join('') + '</ul></button>'; }).join('');
  document.getElementById('spellPick').innerHTML = Object.keys(SPELLS).map(function (id) { var S = SPELLS[id]; return '<button class="pick" data-spell="' + id + '" data-uji="spell-' + id + '" aria-pressed="' + (id === pickSpell) + '"><span>' + ic(S.ikon, 22) + '</span><b>' + S.nama + '</b>' + S.t + '</button>'; }).join('');
  document.querySelectorAll('[data-hero]').forEach(function (b) { b.onclick = function () { pickHero = b.getAttribute('data-hero'); sfx('tap'); renderPicks(); }; });
  document.querySelectorAll('[data-spell]').forEach(function (b) { b.onclick = function () { pickSpell = b.getAttribute('data-spell'); sfx('tap'); renderPicks(); }; });
  document.getElementById('bakatPick').innerHTML = Object.keys(BAKAT).map(function (id) { var B = BAKAT[id]; return '<button class="pick" data-bakat="' + id + '" data-uji="bakat-' + id + '" aria-pressed="' + (id === pickBakat) + '"><span>' + ic(B.ikon, 22) + '</span><b>' + B.nama + '</b>' + B.t + '</button>'; }).join('');
  document.getElementById('lawanPick').innerHTML = Object.keys(LAWAN).map(function (id) { var L = LAWAN[id]; return '<button class="pick" data-lawan="' + id + '" data-uji="lawan-' + id + '" aria-pressed="' + (id === pickLawan) + '"><b>' + L.nama + '</b>' + L.t + '</button>'; }).join('');
  document.querySelectorAll('[data-bakat]').forEach(function (b) { b.onclick = function () { pickBakat = b.getAttribute('data-bakat'); sfx('tap'); renderPicks(); }; });
  document.querySelectorAll('[data-lawan]').forEach(function (b) { b.onclick = function () { pickLawan = b.getAttribute('data-lawan'); sfx('tap'); renderPicks(); }; });
  drawIcons();
}
function drawIcons() { document.querySelectorAll('canvas[data-ic]').forEach(function (c) { var keep = ctx; ctx = c.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height); drawClawd(c.width / 2, c.height * 0.8, { s: 2.6, hero: c.getAttribute('data-ic'), face: 0.6, t: time, angry: true }); ctx = keep; }); }
document.getElementById('bStart').onclick = startGame;
['dMudah', 'dSedang'].forEach(function (id) { document.getElementById(id).onclick = function () { diff = id === 'dMudah' ? 'mudah' : 'sederhana'; document.getElementById('dMudah').setAttribute('aria-pressed', diff === 'mudah'); document.getElementById('dSedang').setAttribute('aria-pressed', diff !== 'mudah'); }; });
renderPicks(); renderBest();
try { document.fonts.ready.then(drawIcons); } catch (e) {}
var heroCv = document.getElementById('heroCv'), hctx = heroCv.getContext('2d'); heroCv.width = 220 * DPR; heroCv.height = 220 * DPR;
function lanePos(L, t) { var segs = [], tot = 0, i; for (i = 0; i < L.length - 1; i++) { var d = Math.hypot(L[i + 1][0] - L[i][0], L[i + 1][1] - L[i][1]); segs.push(d); tot += d; } var u = t * tot; for (i = 0; i < segs.length; i++) { if (u <= segs[i]) { var k = u / segs[i]; return [L[i][0] + (L[i + 1][0] - L[i][0]) * k, L[i][1] + (L[i + 1][1] - L[i][1]) * k]; } u -= segs[i]; } return L[L.length - 1]; }
var iconT = 0;
function drawMenuHero() {
  ctx = hctx; var k = 220 / WS; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.drawImage(MINI, 0, 0, 220, 220);
  ctx.setTransform(DPR * k, 0, 0, DPR * k, 0, 0);
  TURRETS.forEach(function (d) { ctx.fillStyle = d.team ? NAVY : CL; ctx.fillRect(d.p[0] - 30, d.p[1] - 30, 60, 60); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.strokeRect(d.p[0] - 30, d.p[1] - 30, 60, 60); });
  CAMPS.forEach(function (c) { ctx.fillStyle = MON_COL[c.t]; ctx.beginPath(); ctx.arc(c.x, c.y, 36, 0, 6.3); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); });
  LANE_IDS.forEach(function (L, li) { for (var j = 0; j < 4; j++) { var t = ((time * 0.06 + j * 0.06 + li * 0.13) % 0.5), p = lanePos(LANES[L], t), q = lanePos(LANES[L], 1 - t); ctx.fillStyle = CL; ctx.beginPath(); ctx.arc(p[0], p[1], 22, 0, 6.3); ctx.fill(); ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(q[0], q[1], 22, 0, 6.3); ctx.fill(); } });
  drawComot(BASE1.x - 60, BASE1.y + 30, 110, { t: time, king: true, col: '#3a2f50', lx: -0.7, ly: 0.7 });
  if (pickLawan !== 'tiada') { var rp = lanePos(LANES.tengah, 0.58 - Math.sin(time * 0.8) * 0.06); ctx.save(); ctx.translate(rp[0], rp[1] + 40); ctx.scale(4, 4); drawPendekar(0, 0, { t: time, face: -1, lx: -0.6, ly: 0.6 }); ctx.restore(); }
  var hp = lanePos(LANES.tengah, 0.42 + Math.sin(time * 0.8) * 0.08);
  drawClawd(hp[0], hp[1] + 60, { s: 5, hero: pickHero, face: 1, t: time, run: true });
  iconT += 1; if (iconT % 6 === 0) drawIcons();
}

function misiHtml() {
  return '<div class="misi"><p class="tag">Misi perlawanan</p>' + MISI.filter(function (m) { return !(m.lawan && G.lawan === 'tiada'); }).map(function (m) { var done = !!G.misi[m.id]; return '<div class="' + (done ? 'done' : '') + '">' + ic(done ? 'check' : m.ikon, 18) + '<span>' + m.t + '</span><b>+' + m.emas + '</b></div>'; }).join('') + '</div>';
}
function quickBuy() {
  if (!G || G.state !== 'main') return;
  var it = nextBuild(); if (!it) { toast('Semua item binaan sudah dibeli.'); return; }
  if (G.items.length >= 6) { toast('Beg penuh (6 item).'); return; }
  if (G.gold < it.harga) { toast('Perlu ' + it.harga + ' syiling untuk ' + it.nama + '.'); sfx('tap'); return; }
  buy(it.id); floatText(G.hero.x, G.hero.y - 80, it.nama + '!', '#a87516', true);
}
