/* Catur Ajaib Clawd: gelung utama + kait ujian (window.__game) */
'use strict';
var last = performance.now(), hudT = 0;
try { muted = localStorage.getItem('catur-ajaib-mute') === '1'; } catch (e) {}
function update(dt) {
  time += dt;
  if (!G) return;
  updToast(dt); updBanner(dt); updFx(dt);
  if (G.phase === 'hasil' || G.paused) return;
  if (G.modal) { if (G.phase === 'kotak') kotakTick(dt); if (G.auto) autoModal(); return; }
  if (G.phase === 'persiapan') {
    G.t -= dt;
    if (G.auto && !G.soalDone && curQ && curQ.q === G.soal) G.jawabAuto();
    if (G.t <= 0) startBattle();
  } else if (G.phase === 'tempur') {
    var n = G.auto ? 40 : Math.round(G.speed * 2), sd = G.auto ? 1 / 20 : dt / 2;
    for (var i = 0; i < n && !G.sim.done; i++) stepSim(G.sim, sd);
    if (G.auto && !G.kmdUsed && G.sim.t > 3) openKmd();
    if (G.sim.done) { G.endT += dt; if (G.endT > (G.auto ? 0 : 0.9)) endBattle(); }
  } else if (G.phase === 'jeda') {
    G.t -= dt;
    if (G.t <= 0) { if (G.queue.length) G.queue.shift()(); else advance(); }
  } else if (G.phase === 'kotak') kotakTick(dt);
}
function tick(dt) {
  update(dt);
  if (!$('menu').hidden) drawMenuHero();
  else if (G) { draw(); hudT -= dt; if (hudDirty || hudT <= 0) { renderHud(); hudT = 0.3; } renderTimer(); }
}
function loop(now) { var dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; try { tick(dt); } catch (e) { console.error(e); } requestAnimationFrame(loop); }
setMuteIcon(); $('bPause').innerHTML = ic('pause', 20); applyLang(); resize();
requestAnimationFrame(loop);

/* ---------- autoplay (ujian): jawab dengan ketepatan tertentu, pilih kartu/draft otomatis ---------- */
var autoAcc = 0.8;
function answerOpen(ok) {
  if (!curQ || curQ.q.done) return false;
  var root = curQ.root, b = [].filter.call(root.querySelectorAll('.opts button'), function (x) { return (+x.getAttribute('data-v') === curQ.q.ans) === !!ok; })[0];
  if (b) { b.click(); return true; } return false;
}
function autoModal() {
  if (G.modal === 'cards' && G.cards) { if (curQ) answerOpen(Math.random() < autoAcc); else { var pk = paperEl.querySelector('[data-pilih]'), bk = paperEl.querySelector('[data-buka]'), lw = $('bLewat'); if (bk && (!pk || Math.random() < 0.5)) bk.click(); else if (pk) pk.click(); else if (lw) lw.click(); else $('bGanti').click(); } }
  else if (curQ) answerOpen(Math.random() < autoAcc);
  else if (G.modal === 'pause') closeSheet();
}

window.__game = {
  get keadaan() { return G ? G.phase : 'menu'; },
  get info() {
    if (!G) return null; var me = G.me;
    return { tahap: G.stage + '-' + G.round, jenis: G.type, fase: G.phase, nyawa: me.hp, emas: me.gold, level: me.lvl, xp: me.xp, papan: onBoard(me).map(function (u) { return u.id + '★' + u.star; }), bangku: onBench(me).map(function (u) { return u.id + '★' + u.star; }),
      item: me.items.slice(), toko: G.shop.slice(), hidup: alive().length, peringkat: me.place, soal: G.log.length, benar: G.log.filter(function (x) { return x.ok; }).length,
      lawan: G.players.map(function (p) { return p.nama + ':' + p.hp + (p.alive ? '' : '#' + p.place); }), modal: G.modal, kolam: HERO_ID.reduce(function (s, id) { return s + G.pool[id]; }, 0) };
  },
  mulai: function (o) { if (o) { opt.kmd = o.kmd || opt.kmd; opt.diff = o.diff || opt.diff; opt.mode = o.mode || opt.mode; } startGame(); },
  beli: function (i) { return buy(G.me, i); }, segar: function () { return reroll(G.me); }, xp: function () { return buyXp(G.me); },
  emas: function (n) { G.me.gold += n; hudDirty = true; },
  letak: function (uid, b, x, y) { var u = G.me.units.filter(function (v) { return v.uid === uid; })[0]; return u ? moveUnit(G.me, u, b, x, y) : false; },
  unit: function () { return G.me.units.map(function (u) { return { uid: u.uid, id: u.id, star: u.star, b: u.b, x: u.x, y: u.y, items: u.items.slice() }; }); },
  jual: function (uid) { var u = G.me.units.filter(function (v) { return v.uid === uid; })[0]; return sell(G.me, u); },
  beriHero: function (id, n) { for (var i = 0; i < (n || 1); i++) addUnit(G.me, id, 1, false); hudDirty = true; return G.me.units.length; },
  siap: function () { startBattle(); },
  langkah: function (s) { for (var i = 0; i < s * 30; i++) tick(1 / 30); return G ? G.phase : 'menu'; },
  jawabUji: function (b) { return answerOpen(b); },
  auto: function (on, acc) { G.auto = !!on; if (acc != null) autoAcc = acc; G.jawabAuto = function () { answerOpen(Math.random() < autoAcc); }; },
  sim: function () { return G.sim ? { t: +G.sim.t.toFixed(1), selesai: G.sim.done, menang: G.sim.winner, unit: G.sim.f.map(function (f) { return f.id + ':' + f.side + ':' + Math.round(f.hp) + (f.dead ? 'x' : ''); }) } : null; },
  kartu: function (i) { pickCard(i || 0); }, kotak: function (i) { kotakMine(i); },
  tempurUji: function (a, b) { /* a, b = daftar [id, bintang]; kembalikan pemenang 0/1 dari 50 simulasi */
    var pa = newPlayer(1, false), pb = newPlayer(2, false), w = 0;
    function isi(p, L) { p.units = L.map(function (x, i) { return { uid: 900 + i, id: x[0], star: x[1], items: [], b: 'board', x: i % 8, y: HEROES[x[0]].rng > 1 ? 7 : 4 }; }); }
    isi(pa, a); isi(pb, b); for (var i = 0; i < 50; i++) { var r = runSim(pa, pb); if (r.winner === 0) w++; } return w / 50;
  }
};
