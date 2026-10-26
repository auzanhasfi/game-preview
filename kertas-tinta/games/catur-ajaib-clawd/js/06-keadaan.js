/* Catur Ajaib Clawd: keadaan permainan, kolam hero bersama, toko, ekonomi, gabung bintang, papan & bangku */
'use strict';
var G = null, uidN = 1;
var opt = { kmd: 'petualang', diff: 'mudah', mode: 'cepat' };
try { var _o = JSON.parse(localStorage.getItem('catur-ajaib-opsi') || 'null'); if (_o) { opt.kmd = _o.kmd || opt.kmd; opt.diff = _o.diff || opt.diff; opt.mode = _o.mode || opt.mode; } } catch (e) {}

function newPlayer(i, human) {
  var L = human ? null : LAWAN[i - 1];
  return { i: i, human: human, nama: human ? T('kamu') : L.nama, col: human ? CL : L.col, gaya: human ? 'seimbang' : L.gaya,
    hp: opt.mode === 'penuh' ? 100 : 50, gold: 0, lvl: 1, xp: 0, units: [], items: [], streak: 0, alive: true, place: 0,
    fx: { slot: 0, semangat: 0, darah: false, ajaib: false }, freeRoll: 0, fav: null, lastWin: null };
}

function newGame() {
  uidN = 1;
  var pool = {}; HERO_ID.forEach(function (id) { pool[id] = POOL_N[HEROES[id].c]; });
  G = { stage: 1, round: 1, phase: 'persiapan', t: 0, tMax: 20, pool: pool, shop: [], locked: false, players: [], log: [],
    sim: null, opp: null, modal: null, queue: [], combo: 0, soal: null, soalDone: false, kmdUsed: false, secondUsed: false,
    sel: null, selItem: -1, drag: null, speed: 1, paused: false, result: null, toasts: [], fxs: [], elim: [], auto: false, time: 0, histDmg: 0 };
  for (var i = 0; i < 8; i++) G.players.push(newPlayer(i, i === 0));
  G.me = G.players[0];
  /* hadiah awal: setiap komandan dapat 1 hero biaya 1 acak di papan + 2 emas */
  G.players.forEach(function (p) { var id = drawId(1); addUnit(p, id, 1, true); p.gold = 2; });
  beginRound();
}

/* ---------- kolam & toko ---------- */
function drawId(lvl) {
  var od = ODDS[Math.max(1, Math.min(9, lvl))], r = Math.random() * 100, c = 1, acc = 0;
  for (var k = 0; k < 5; k++) { acc += od[k]; if (r < acc) { c = k + 1; break; } }
  for (; c >= 1; c--) {
    var ids = HERO_ID.filter(function (id) { return HEROES[id].c === c && G.pool[id] > 0; });
    if (ids.length) { var tot = 0; ids.forEach(function (id) { tot += G.pool[id]; }); var x = Math.random() * tot; for (var j = 0; j < ids.length; j++) { x -= G.pool[ids[j]]; if (x < 0) return ids[j]; } return ids[ids.length - 1]; }
  }
  return 'pena';
}
function shopOf(p) { return p.human ? G.shop : (p.shop || (p.shop = [])); }
function rollShop(p, n) { var s = []; for (var i = 0; i < (n || SHOP_N); i++) s.push(drawId(p.lvl)); return s; }
function cost(id) { return HEROES[id].c; }
function sellValue(u) { var c = cost(u.id); return u.star === 1 ? c : u.star === 2 ? c * 3 - 1 : c * 9 - 2; }

/* ---------- unit milik pemain ---------- */
function onBoard(p) { return p.units.filter(function (u) { return u.b === 'board'; }); }
function onBench(p) { return p.units.filter(function (u) { return u.b === 'bench'; }); }
function boardLimit(p) { return p.lvl + p.fx.slot; }
function unitAt(p, b, x, y) { for (var i = 0; i < p.units.length; i++) { var u = p.units[i]; if (u.b === b && u.x === x && (b === 'bench' || u.y === y)) return u; } return null; }
function freeBench(p) { for (var x = 0; x < BENCH_N; x++) if (!unitAt(p, 'bench', x)) return x; return -1; }
function freeBoard(p, ranged) {
  var rows = ranged ? [7, 6, 5, 4] : [4, 5, 6, 7], cols = [3, 4, 2, 5, 1, 6, 0, 7];
  for (var r = 0; r < 4; r++) for (var c = 0; c < 8; c++) if (!unitAt(p, 'board', cols[c], rows[r])) return { x: cols[c], y: rows[r] };
  return null;
}
function addUnit(p, id, star, toBoard) {
  var u = { uid: uidN++, id: id, star: star || 1, items: [], b: 'bench', x: 0, y: 0 };
  G.pool[id] -= Math.pow(3, u.star - 1);
  if (toBoard && onBoard(p).length < boardLimit(p)) { var f = freeBoard(p, HEROES[id].rng > 1); if (f) { u.b = 'board'; u.x = f.x; u.y = f.y; } }
  if (u.b === 'bench') { var bx = freeBench(p); if (bx < 0) { G.pool[id] += Math.pow(3, u.star - 1); return null; } u.x = bx; }
  p.units.push(u); checkMerge(p); return u;
}
function canTake(p, id) {
  if (freeBench(p) >= 0) return true;
  /* bangku penuh: tetap boleh bila langsung bergabung jadi ★2 */
  return p.units.filter(function (u) { return u.id === id && u.star === 1; }).length >= 2;
}
function checkMerge(p) {
  var merged = true, out = [];
  while (merged) {
    merged = false;
    for (var s = 1; s <= 2 && !merged; s++) {
      for (var k = 0; k < HERO_ID.length && !merged; k++) {
        var id = HERO_ID[k], same = p.units.filter(function (u) { return u.id === id && u.star === s; });
        if (G.phase === 'tempur' && p === G.me) same = same.filter(function (u) { return u.b === 'bench'; });
        if (same.length >= 3) {
          same.sort(function (a, b) { return ((b.b === 'board') - (a.b === 'board')) || (a.x - b.x); });
          var keep = same[0], items = keep.items.slice();
          [same[1], same[2]].forEach(function (u) { items = items.concat(u.items); p.units.splice(p.units.indexOf(u), 1); });
          keep.star++; keep.items = items.slice(0, 3); p.items = p.items.concat(items.slice(3));
          merged = true; out.push(keep);
        }
      }
    }
  }
  if (p.human) out.forEach(function (u) { toast(T('bintangNaik', heroNama(u.id), u.star), 'gold'); sfx('lvl'); spark(u); });
  return out;
}
function removeUnit(p, u) {
  var i = p.units.indexOf(u); if (i < 0) return;
  p.units.splice(i, 1); G.pool[u.id] += Math.pow(3, u.star - 1); p.items = p.items.concat(u.items);
}

/* ---------- aksi pemain (dipakai juga oleh AI dan autoplay) ---------- */
function buy(p, i) {
  var sh = shopOf(p), id = sh[i]; if (!id) return false;
  if (p.gold < cost(id)) { if (p.human) { toast(T('emasKurang'), 'bad'); sfx('wrong'); } return false; }
  if (!canTake(p, id)) { if (p.human) { toast(T('bangkuPenuh'), 'bad'); sfx('wrong'); } return false; }
  p.gold -= cost(id); sh[i] = null;
  var u = { uid: uidN++, id: id, star: 1, items: [], b: 'bench', x: freeBench(p), y: 0 };
  G.pool[id] -= 1;
  if (u.x < 0) u.x = 99; /* sementara, segera bergabung */
  p.units.push(u); checkMerge(p);
  if (p.human) { sfx('coin'); hudDirty = true; }
  return true;
}
function reroll(p) {
  if (p.freeRoll > 0) p.freeRoll--;
  else { if (p.gold < ROLL_COST) { if (p.human) { toast(T('emasKurang'), 'bad'); sfx('wrong'); } return false; } p.gold -= ROLL_COST; }
  if (p === G.me) { G.shop = rollShop(p); G.locked = false; sfx('tap'); hudDirty = true; } else p.shop = rollShop(p);
  return true;
}
function buyXp(p) {
  if (p.lvl >= MAXLV) return false;
  if (p.gold < XP_COST) { if (p.human) { toast(T('emasKurang'), 'bad'); sfx('wrong'); } return false; }
  p.gold -= XP_COST; addXp(p, 4); if (p.human) { sfx('tap'); hudDirty = true; } return true;
}
function addXp(p, n) {
  if (p.lvl >= MAXLV) return; p.xp += n;
  while (p.lvl < MAXLV && p.xp >= XPNEED[p.lvl]) { p.xp -= XPNEED[p.lvl]; p.lvl++; if (p.human) { toast(T('naikLevel', p.lvl), 'gold'); sfx('lvl'); } }
  if (p.lvl >= MAXLV) p.xp = 0;
}
function sell(p, u) {
  if (!u || (G.phase === 'tempur' && u.b === 'board')) return false;
  p.gold += sellValue(u); removeUnit(p, u);
  if (p.human) { sfx('coin'); if (G.sel === u) G.sel = null; hudDirty = true; }
  return true;
}
/* pindah / tukar posisi. dest = {b, x, y} */
function moveUnit(p, u, b, x, y) {
  if (G.phase === 'tempur' && (u.b === 'board' || b === 'board')) return false;
  if (b === 'board' && (y < 4 || y > 7 || x < 0 || x > 7)) return false;
  if (b === 'bench' && (x < 0 || x >= BENCH_N)) return false;
  var other = unitAt(p, b, x, y);
  if (other === u) return true;
  if (!other && b === 'board' && u.b !== 'board' && onBoard(p).length >= boardLimit(p)) { if (p.human) { toast(T('papanPenuh'), 'bad'); sfx('wrong'); } return false; }
  if (other) { other.b = u.b; other.x = u.x; other.y = u.y; }
  u.b = b; u.x = x; u.y = b === 'board' ? y : 0;
  if (p.human) { sfx('tap'); hudDirty = true; }
  return true;
}
function equip(p, itemIdx, u) {
  var it = p.items[itemIdx]; if (!it || !u) return false;
  if (u.items.length >= 3) { if (p.human) toast(T('itemPenuh'), 'bad'); return false; }
  u.items.push(it); p.items.splice(itemIdx, 1);
  if (p.human) { toast(T('pasang', T('i_' + it), heroNama(u.id))); sfx('heal'); hudDirty = true; }
  return true;
}
/* sebelum tempur: isi kursi kosong dari bangku (hero terkuat dulu) */
function autoFill(p) {
  var bench = onBench(p).sort(function (a, b) { return unitPower(b) - unitPower(a); });
  while (onBoard(p).length < boardLimit(p) && bench.length) {
    var u = bench.shift(), f = freeBoard(p, HEROES[u.id].rng > 1); if (!f) break; u.b = 'board'; u.x = f.x; u.y = f.y;
  }
  /* kalau papan lebih dari batas (mis. setelah kehilangan kursi), turunkan yang paling lemah */
  var bd = onBoard(p).sort(function (a, b) { return unitPower(a) - unitPower(b); });
  while (bd.length > boardLimit(p)) { var w = bd.shift(), bx = freeBench(p); if (bx < 0) { sell(p, w); continue; } w.b = 'bench'; w.x = bx; }
}
function unitPower(u) { return HEROES[u.id].c * Math.pow(3, u.star - 1) + u.items.length * 0.6; }

/* ---------- sinergi ---------- */
function synCount(units) {
  var seen = {}, cnt = {};
  units.forEach(function (u) { if (seen[u.id]) return; seen[u.id] = 1; var H = HEROES[u.id]; cnt[H.f] = (cnt[H.f] || 0) + 1; cnt[H.p] = (cnt[H.p] || 0) + 1; });
  return cnt;
}
function synTier(key, n) { var S = FAKSI[key] || PERAN[key], t = -1; S.tier.forEach(function (need, i) { if (n >= need) t = i; }); return t; }
function synVal(key, n) { var t = synTier(key, n); return t < 0 ? 0 : (FAKSI[key] || PERAN[key]).val[t]; }
function synDesc(key, tier) {
  var S = FAKSI[key] || PERAN[key], v = S.val[Math.max(0, tier)], isF = !!FAKSI[key];
  var shown = (key === 'kertas' || key === 'bintang' || key === 'penyokong') ? v : Math.round(v * 100);
  return T((isF ? 'fd_' : 'pd_') + key, shown);
}

/* ---------- pendapatan ---------- */
function income(p) {
  var base = G.stage === 1 ? 3 : 5, bunga = Math.min(5, Math.floor(p.gold / 10)), s = Math.abs(p.streak), str = s >= 6 ? 3 : s >= 4 ? 2 : s >= 2 ? 1 : 0;
  var extra = (p.human && opt.kmd === 'petualang') ? 1 : 0;
  if (!p.human && p.gaya === 'kuat' && G.stage >= 3) extra = 1;
  if (!p.human && Math.random() < 0.6) extra += 2;   /* komandan Comot juga menjawab soal mereka sendiri */
  p.gold += base + bunga + str + extra; addXp(p, 2);
  return { base: base, bunga: bunga, str: str, extra: extra };
}
