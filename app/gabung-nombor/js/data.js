/* Kandungan tahap sahaja. q = soalan yang menjadi sasaran (jawapan ialah jubin / bilangan pasang). */
(function (root) {
  'use strict';
  const TAHAP = [
    { id: 'tambah', op: '+', levels: [
      { n: 4, spawn: [1, 2], target: 16, q: [8, 8], maxMoves: 24, par: 14 },
      { n: 4, spawn: [3, 4], target: 24, q: [12, 12], maxMoves: 26, par: 16 },
      { n: 4, spawn: [2, 3], target: 48, q: [24, 24], maxMoves: 50, par: 38 }
    ]},
    { id: 'tolak', op: '-', levels: [
      { n: 4, spawn: [1, 2, 3],       target: 7,  q: [5, 5], maxMoves: 22, par: 15 },
      { n: 4, spawn: [1, 2, 3, 4, 5], target: 9,  q: [7, 7], maxMoves: 26, par: 19 },
      { n: 3, spawn: [1, 2, 3, 4, 5], target: 9,  q: [9, 9], maxMoves: 28, par: 21 }
    ]},
    { id: 'darab', op: '*', levels: [
      { n: 4, spawn: [2, 3], target: 16,  q: [4, 4], maxMoves: 14, par: 8 },
      { n: 4, spawn: [2, 3, 5], target: 81,  q: [9, 9], maxMoves: 26, par: 17 },
      { n: 4, spawn: [2, 3, 5], target: 256, q: [16, 16], maxMoves: 30, par: 20 }
    ]}
  ];
  const FLAT = [];
  TAHAP.forEach((t, ti) => t.levels.forEach((l, li) => { l.op = t.op; l.tahap = ti; l.no = li; l.idx = FLAT.length; FLAT.push(l); }));
  const D = { TAHAP, FLAT };
  if (typeof module !== 'undefined' && module.exports) module.exports = D; else root.GGDATA = D;
})(typeof self !== 'undefined' ? self : this);
