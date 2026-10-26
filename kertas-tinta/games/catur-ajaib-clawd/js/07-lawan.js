/* Catur Ajaib Clawd: otak 7 komandan Comot (dan autoplay ujian untuk pemain). Mereka memakai kolam hero yang sama. */
'use strict';
function targetLevel(p) {
  var t = [0, 3, 5, 6, 7, 8, 9, 9, 9][Math.min(G.stage, 8)];
  if (p.gaya === 'cepat') t += 1; if (p.gaya === 'hemat' && G.stage < 5) t -= 1;
  return Math.max(2, Math.min(MAXLV, t));
}
function reserve(p) {
  if (p.gaya === 'cepat') return G.stage >= 3 ? 10 : 0;
  if (p.hp < 25) return 0;                        /* nyawa tipis: habiskan emas */
  return Math.min(50, G.stage >= 2 ? 10 * Math.min(5, G.stage) : 0);
}
/* faksi kesukaan = yang paling banyak dimiliki */
function favFaksi(p) {
  var c = {}; p.units.forEach(function (u) { var f = HEROES[u.id].f; c[f] = (c[f] || 0) + Math.pow(3, u.star - 1) * HEROES[u.id].c; });
  var best = null; Object.keys(c).forEach(function (k) { if (!best || c[k] > c[best]) best = k; }); return best;
}
function wantId(p, id) {
  var H = HEROES[id], owned = p.units.filter(function (u) { return u.id === id && u.star < 3; }).length;
  if (owned >= 1) return 3 + owned;               /* kejar pasangan untuk ★2 */
  if (p.fav && H.f === p.fav) return 2.5;
  if (onBoard(p).length < boardLimit(p)) return 2;
  if (H.c >= 4) return 1.5;
  return 0;
}
function aiPrep(p) {
  if (!p.alive) return;
  p.fav = favFaksi(p);
  /* naik level */
  var guard = 0;
  while (p.lvl < targetLevel(p) && p.gold >= XP_COST + Math.min(reserve(p), 10) && guard++ < 12) buyXp(p);
  /* belanja + segarkan */
  if (p.human) { if (!G.locked) G.shop = rollShop(p); } else p.shop = rollShop(p);
  for (var roll = 0; roll < 6; roll++) {
    var order = shopOf(p).map(function (id, i) { return { i: i, w: id ? wantId(p, id) : 0 }; }).filter(function (o) { return o.w > 0; }).sort(function (a, b) { return b.w - a.w; });
    order.forEach(function (o) { var id = shopOf(p)[o.i]; if (id && p.gold - cost(id) >= (o.w >= 3 ? 0 : reserve(p))) buy(p, o.i); });
    var mayRoll = p.gold - ROLL_COST >= reserve(p) + 4 && (p.gold > 50 || (G.stage >= 4 && p.gaya !== 'hemat') || p.hp < 30);
    if (!mayRoll || !reroll(p)) break;
  }
  /* bangku penuh: jual yang tidak berpasangan & murah */
  var bench = onBench(p).sort(function (a, b) { return unitPower(a) - unitPower(b); });
  while (onBench(p).length > 6 && bench.length) { var w = bench.shift(); if (p.units.filter(function (u) { return u.id === w.id; }).length < 2) sell(p, w); }
  aiPlace(p); aiItems(p);
}
/* susun ulang: hero terkuat di papan, jarak dekat di depan, jarak jauh di belakang */
function aiPlace(p) {
  var all = p.units.slice().sort(function (a, b) { return unitPower(b) - unitPower(a); }), lim = boardLimit(p);
  var pick = all.slice(0, lim), rest = all.slice(lim);
  var front = [3, 4, 2, 5, 1, 6, 0, 7], fi = 0, bi = 0, mi = 0;
  pick.forEach(function (u) {
    var H = HEROES[u.id]; u.b = 'board';
    if (H.rng === 1) { u.y = fi < 8 ? 4 : 5; u.x = front[fi % 8]; fi++; }
    else if (H.p === 'penyokong') { u.y = 6; u.x = front[mi % 8]; mi++; }
    else { u.y = bi < 8 ? 7 : 6; u.x = front[(bi + 3) % 8]; bi++; }
  });
  /* hindari tabrakan petak */
  var used = {}; pick.forEach(function (u) { var k = u.x + ',' + u.y, g = 0; while (used[k] && g++ < 64) { u.x = (u.x + 1) % 8; if (u.x === 0) u.y = u.y === 4 ? 5 : u.y === 7 ? 6 : u.y; k = u.x + ',' + u.y; } used[k] = 1; });
  rest.forEach(function (u, i) { u.b = 'bench'; u.x = i; u.y = 0; });
  while (onBench(p).length > BENCH_N) sell(p, onBench(p)[0]);
}
function aiItems(p) {
  var bd = onBoard(p).sort(function (a, b) { return unitPower(b) - unitPower(a); });
  while (p.items.length && bd.length) { var u = bd.filter(function (x) { return x.items.length < 3; })[0]; if (!u) break; equip(p, 0, u); }
}
/* kartu Go Go untuk AI: pilih acak yang bukan emas (emas 40%) */
function aiCard(p) {
  var c = pick(CARD_ID.filter(function (k) { return CARDS[k].r !== 'emas' || Math.random() < 0.4; }));
  applyCard(p, c);
}
/* pilihan draft Kotak Go Go: hero termahal / yang sudah dimiliki */
function aiDraft(p, offers) {
  var best = -1, bw = -1;
  offers.forEach(function (o, i) { if (o.by) return; var w = HEROES[o.id].c + (p.units.some(function (u) { return u.id === o.id; }) ? 2 : 0) + Math.random(); if (w > bw) { bw = w; best = i; } });
  return best;
}
