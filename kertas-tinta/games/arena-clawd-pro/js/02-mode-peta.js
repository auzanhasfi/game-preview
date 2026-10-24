/* Arena Clawd Pro: Data dua mode peta: lorong, menara, kamp, semak */
'use strict';

/* ---------- peta: dua mode ---------- */
var BASE0 = { x: 190, y: 1810 }, BASE1 = { x: 1810, y: 190 }, SPAWN = { x: 330, y: 1680 };
var LANES = {
  atas: [[190, 1810], [205, 1500], [205, 205], [1500, 205], [1810, 190]],
  tengah: [[190, 1810], [1810, 190]],
  bawah: [[190, 1810], [500, 1795], [1795, 1795], [1795, 500], [1810, 190]]
};
function midP(t) { return [190 + 1620 * t, 1810 - 1620 * t]; }
var MODES = {
  satu: {
    lanes: ['tengah'],
    turrets: [
      { lane: 'tengah', team: 1, tier: 1, p: midP(0.6) }, { lane: 'tengah', team: 1, tier: 2, p: midP(0.72) }, { lane: 'tengah', team: 1, tier: 3, p: midP(0.86) },
      { lane: 'tengah', team: 0, tier: 1, p: midP(0.4) }, { lane: 'tengah', team: 0, tier: 2, p: midP(0.28) }, { lane: 'tengah', team: 0, tier: 3, p: midP(0.14) }
    ],
    camps: [{ t: 'biru', x: 600, y: 900 }, { t: 'merah', x: 1500, y: 1250 }, { t: 'kelomang', x: 700, y: 700 }, { t: 'kelomang', x: 1240, y: 1240 }, { t: 'penyu', x: 1350, y: 1550 }],
    bushes: [{ x: 489, y: 1299 }, { x: 863, y: 1349 }, { x: 1137, y: 651 }, { x: 1511, y: 701 }]
  },
  tiga: {
    lanes: ['atas', 'tengah', 'bawah'],
    turrets: [
      { lane: 'atas', team: 1, tier: 1, p: [820, 205] }, { lane: 'atas', team: 1, tier: 2, p: [1360, 205] },
      { lane: 'tengah', team: 1, tier: 1, p: midP(0.62) }, { lane: 'tengah', team: 1, tier: 2, p: midP(0.78) }, { lane: 'tengah', team: 1, tier: 3, p: midP(0.88) },
      { lane: 'bawah', team: 1, tier: 1, p: [1795, 1180] }, { lane: 'bawah', team: 1, tier: 2, p: [1795, 640] },
      { lane: 'atas', team: 0, tier: 1, p: [205, 1120] }, { lane: 'tengah', team: 0, tier: 1, p: midP(0.3) }, { lane: 'bawah', team: 0, tier: 1, p: [880, 1795] }, { lane: 'tengah', team: 0, tier: 3, p: midP(0.14) }
    ],
    camps: [{ t: 'biru', x: 520, y: 1050 }, { t: 'merah', x: 1050, y: 1480 }, { t: 'biru', x: 1050, y: 520 }, { t: 'merah', x: 1480, y: 1050 }, { t: 'kelomang', x: 560, y: 560 }, { t: 'kelomang', x: 1440, y: 1440 }, { t: 'penyu', x: 1185, y: 1185 }],
    bushes: [{ x: 863, y: 1349 }, { x: 1137, y: 651 }, { x: 330, y: 950 }, { x: 1050, y: 330 }, { x: 1670, y: 1050 }, { x: 950, y: 1670 }]
  }
};
var BUSH_RX = 78, BUSH_RY = 50;
var mode = 'satu', LANE_IDS = MODES.satu.lanes, CAMPS = MODES.satu.camps, BUSHES = MODES.satu.bushes;
function distSeg(px, py, ax, ay, bx, by) { var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0; return Math.hypot(px - ax - dx * t, py - ay - dy * t); }
function closestOnSeg(px, py, ax, ay, bx, by) { var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0; return [ax + dx * t, ay + dy * t]; }
function distLanes(x, y) { var m = 1e9; LANE_IDS.forEach(function (k) { var Ln = LANES[k]; for (var i = 0; i < Ln.length - 1; i++) m = Math.min(m, distSeg(x, y, Ln[i][0], Ln[i][1], Ln[i + 1][0], Ln[i + 1][1])); }); return m; }
function distRiver(x, y) { return distSeg(x, y, 260, 260, 1740, 1740); }
/* lorong terdekat untuk titik (x,y): nama lorong + indeks titik jalan berikutnya (arah pasukan 0) */
function nearestLane(x, y) {
  var best = { lane: LANE_IDS[0], wi: 1, d: 1e9 };
  LANE_IDS.forEach(function (k) { var Ln = LANES[k]; for (var i = 0; i < Ln.length - 1; i++) { var d = distSeg(x, y, Ln[i][0], Ln[i][1], Ln[i + 1][0], Ln[i + 1][1]); if (d < best.d) best = { lane: k, wi: i + 1, d: d, p: closestOnSeg(x, y, Ln[i][0], Ln[i][1], Ln[i + 1][0], Ln[i + 1][1]) }; } });
  return best;
}
function inBush(x, y) { return BUSHES.some(function (b) { var dx = (x - b.x) / BUSH_RX, dy = (y - b.y) / BUSH_RY; return dx * dx + dy * dy <= 1; }); }
