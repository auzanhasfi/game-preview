/* Catur Ajaib Clawd: alur ronde (persiapan → tempur → hasil), pasangan lawan, rampasan, tersingkir, kartu Go Go, Kotak Go Go */
'use strict';
function alive() { return G.players.filter(function (p) { return p.alive; }); }
function prepTime() { return G.auto ? 0.3 : G.stage === 1 ? 20 : opt.mode === 'cepat' ? 25 : 30; }

function beginRound() {
  G.type = roundType(G.stage, G.round); G.sim = null; G.result = null; G.kmdUsed = false;
  if (G.type === 'kotak') { G.phase = 'kotak'; openKotak(); hudDirty = true; return; }
  G.phase = 'persiapan'; G.t = G.tMax = prepTime();
  G.me.freeRoll = (opt.kmd === 'bintang' ? 1 : 0) + (G.bonusRoll || 0); G.bonusRoll = 0;
  if (!G.locked) G.shop = rollShop(G.me); G.locked = false;
  G.players.forEach(function (p) { if (!p.human && p.alive) aiPrep(p); });
  if (G.type === 'pvp') makePairs(); else G.opp = null;
  G.soal = mkQ(opt.diff); G.soalDone = false; soalDirty = true;
  if (G.auto) { aiPrep(G.me); }
  hudDirty = true;
}
function makePairs() {
  var al = shuffle(alive()), me = G.me, pairs = [];
  /* hindari lawan yang sama dua kali berturut-turut */
  if (al.length > 2 && me.lastOpp) { var mi = al.indexOf(me); if (mi % 2 === 0 && al[mi + 1] === me.lastOpp && al[mi + 2]) { var t = al[mi + 1]; al[mi + 1] = al[mi + 2]; al[mi + 2] = t; } else if (mi % 2 === 1 && al[mi - 1] === me.lastOpp && al[mi + 1]) { var t2 = al[mi - 1]; al[mi - 1] = al[mi + 1]; al[mi + 1] = t2; } }
  for (var i = 0; i < al.length; i += 2) {
    if (al[i + 1]) pairs.push([al[i], al[i + 1], false]);
    else { var others = al.filter(function (p) { return p !== al[i]; }); pairs.push([al[i], others[Math.floor(Math.random() * others.length)], true]); }
  }
  G.pairs = pairs;
  pairs.forEach(function (pr) { if (pr[0] === me) G.opp = pr[1], G.oppGhost = pr[2]; else if (pr[1] === me && !pr[2]) G.opp = pr[0], G.oppGhost = false; });
  me.lastOpp = G.opp;
}

function startBattle() {
  if (G.phase !== 'persiapan') return;
  autoFill(G.me); G.sel = null; G.selItem = -1; G.drag = null;
  if (G.type === 'creep') G.sim = newSim(G.me, null, creepWave(G.stage, G.round));
  else G.sim = newSim(G.me, G.opp);
  G.sim.visible = true; G.phase = 'tempur'; G.t = 0; G.endT = 0; soalDirty = true;
  sfx('ult'); hudDirty = true;
}

function endBattle() {
  var sim = G.sim, me = G.me, win = sim.winner === 0, lines = [];
  if (G.type === 'creep') {
    if (win) { lines.push(loot(me, true)); }
    else { var d0 = applyDmg(me, 2 + survivors(sim, 1).length); lines.push(T('kalahNyawa', d0)); }
    G.players.forEach(function (p) { if (!p.human && p.alive) loot(p, false); });
  } else {
    var opp = G.opp;
    if (win) { me.streak = me.streak >= 0 ? me.streak + 1 : 1; me.gold += 1; lines.push(T('menangEmas')); if (!G.oppGhost) { applyDmg(opp, lossDmg(survivors(sim, 0))); opp.streak = opp.streak <= 0 ? opp.streak - 1 : -1; } }
    else { var d = applyDmg(me, lossDmg(survivors(sim, 1))); me.streak = me.streak <= 0 ? me.streak - 1 : -1; lines.push(T('kalahNyawa', d)); if (!G.oppGhost) { opp.streak = opp.streak >= 0 ? opp.streak + 1 : 1; opp.gold += 1; } }
    G.pairs.forEach(function (pr) {
      if (pr[0] === me || (pr[1] === me && !pr[2])) return;
      var r = runSim(pr[0], pr[1]), w = r.winner === 0 ? pr[0] : pr[1], l = r.winner === 0 ? pr[1] : pr[0];
      if (pr[2] && l === pr[1]) { w.streak = Math.max(1, w.streak + 1); w.gold += 1; return; }
      if (pr[2] && w === pr[1]) { applyDmg(pr[0], lossDmg(r.surv)); pr[0].streak = Math.min(-1, pr[0].streak - 1); return; }
      applyDmg(l, lossDmg(r.surv)); l.streak = l.streak <= 0 ? l.streak - 1 : -1; w.streak = w.streak >= 0 ? w.streak + 1 : 1; w.gold += 1;
    });
  }
  G.result = { win: win, lines: lines };
  banner(win ? T('menang') : T('kalah'), lines.join(' · '), win);
  sfx(win ? 'win' : 'over');
  /* pendapatan semua komandan yang masih hidup */
  G.players.forEach(function (p) { if (p.alive && p.hp > 0) { var inc = income(p); if (p.human) G.lastInc = inc; } });
  /* tersingkir */
  var dead = alive().filter(function (p) { return p.hp <= 0; }), pendingMe = false;
  if (dead.indexOf(me) >= 0 && !G.secondUsed) { pendingMe = true; dead.splice(dead.indexOf(me), 1); G.queue.push(openSecond); }
  eliminate(dead);
  /* kartu Go Go setelah ronde monster */
  if (G.type === 'creep' && (G.stage === 1 ? G.round === 3 : true)) { G.queue.push(openCards); G.players.forEach(function (p) { if (!p.human && p.alive) aiCard(p); }); }
  G.phase = 'jeda'; G.t = G.auto ? 0.05 : 2.4; hudDirty = true;
}
function applyDmg(p, n) { n = Math.round(n * (p.human && opt.kmd === 'penjaga' ? 0.75 : 1)); p.hp -= n; if (p.human) { G.histDmg += n; sfx('hurt'); } return n; }
function eliminate(list) {
  if (!list.length) return;
  var n = alive().length;
  list.sort(function (a, b) { return a.hp - b.hp; }).forEach(function (p, i) {
    p.alive = false; p.place = n - i; p.hp = Math.min(p.hp, 0);
    p.units.forEach(function (u) { G.pool[u.id] += Math.pow(3, u.star - 1); }); p.units = [];
    if (!p.human) toast(T('tersingkir', p.nama, p.place));
  });
}
function loot(p, show) {
  var n = G.stage === 1 ? 1 : 2, got = [];
  for (var i = 0; i < n; i++) { var it = pick(ITEM_ID); p.items.push(it); got.push(it); }
  var g = G.stage === 1 ? 1 : 3; p.gold += g;
  if (!p.human) aiItems(p);
  if (show) { sfx('coin'); return T('lootT') + ': ' + got.map(function (x) { return T('i_' + x); }).join(', ') + ' · ' + T('plusEmas', g); }
  return '';
}
function advance() {
  var me = G.me;
  if (!me.alive) return showResult();
  if (alive().length <= 1) { me.place = 1; return showResult(); }
  G.round++; if (G.round > roundsIn(G.stage)) { G.stage++; G.round = 1; }
  beginRound();
}

/* ---------- kartu Go Go ---------- */
function applyCard(p, c) {
  var it = function () { p.items.push(pick(ITEM_ID)); };
  var randOf = function (cost) { var ids = HERO_ID.filter(function (id) { return HEROES[id].c === cost && G.pool[id] > 0; }); return ids.length ? pick(ids) : null; };
  var give = function (id) { if (!id) return; if (canTake(p, id)) addUnit(p, id, 1, false); else p.gold += cost(id); };
  if (c === 'kantong') p.gold += 6;
  else if (c === 'latihan') addXp(p, 6);
  else if (c === 'senjata') it();
  else if (c === 'kawan') give(randOf(2));
  else if (c === 'semangat') p.fx.semangat += 0.15;
  else if (c === 'darah') p.fx.darah = true;
  else if (c === 'kembar') { var own = p.units.filter(function (u) { return HEROES[u.id].c === 1; }).map(function (u) { return u.id; }); var id = own.length ? pick(own) : randOf(1); give(id); give(id); }
  else if (c === 'peti') { it(); it(); }
  else if (c === 'slot') p.fx.slot += 1;
  else if (c === 'pesta') p.gold += 15;
  else if (c === 'ajaib') p.fx.ajaib = true;
  else if (c === 'mahkota') { give(randOf(4)); it(); }
  if (!p.human) { aiItems(p); aiPlace(p); }
}
function cardPair() {
  var bag = function () { var r = Math.random(), want = r < 0.5 ? 'biru' : r < 0.85 ? 'ungu' : 'emas'; return pick(CARD_ID.filter(function (k) { return CARDS[k].r === want; })); };
  var a = bag(), b = bag(), g = 0; while (b === a && g++ < 20) b = bag();
  return [a, b];
}

/* ---------- Kotak Go Go (draft bersama) ---------- */
function kotakOffers() {
  var lv = [0, 3, 4, 6, 7, 8, 8, 9, 9][Math.min(G.stage, 8)], n = alive().length, offers = [];
  for (var i = 0; i < n; i++) { var id = drawId(lv); offers.push({ id: id, item: pick(ITEM_ID), by: null }); }
  return offers;
}
function kotakOrder(meFirst) {
  var order = shuffle(alive()).sort(function (a, b) { return a.hp - b.hp; });
  if (meFirst) { order.splice(order.indexOf(G.me), 1); order.unshift(G.me); }
  return order;
}
function kotakTake(p, i) {
  var K = G.kotak, o = K.offers[i]; if (!o || o.by) return false;
  o.by = p;
  if (canTake(p, o.id)) addUnit(p, o.id, 1, false); else { p.gold += cost(o.id); if (p.human) toast(T('jadiEmas', cost(o.id))); }
  p.items.push(o.item);
  if (!p.human) { aiItems(p); aiPlace(p); }
  return true;
}
