/* Data 10 tahap. sasaran.pct = batas bawah (%), julat tepat = pct .. pct+lagi (%). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.RWDATA = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const b = (x, y, dx, dy, v) => ({ jenis: 'bola', x, y, dx, dy, v });
  const h = (x, y, v) => ({ jenis: 'pemburu', x, y, v });
  const TAHAP = [
    { grid: [20, 20], base: [8, 15, 4, 4], rocks: [], musuh: [b(4, 4, 1, 1, .5)],
      sasaran: { jenis: 'pct', pct: 25, lagi: 3 }, kerja: '25% = 25/100 = 1/4 = 0.25' },
    { grid: [20, 20], base: [2, 14, 4, 4], rocks: [], musuh: [b(14, 5, -1, 1, .6)],
      sasaran: { jenis: 'pct', pct: 40, lagi: 3 }, kerja: '40% = 40/100 = 2/5 = 0.4' },
    { grid: [20, 20], base: [14, 2, 4, 4], rocks: [], musuh: [b(4, 12, 1, -1, .5), b(10, 16, -1, -1, .5)],
      sasaran: { jenis: 'pecahan', pct: 50, lagi: 3, a: [1, 2] }, kerja: '1/2 = 50/100 = 50% = 0.5' },
    { grid: [20, 20], base: [8, 8, 4, 4], rocks: [[0, 9, 4, 2], [16, 9, 4, 2]], musuh: [b(3, 3, 1, 1, .6), b(16, 16, -1, -1, .6)],
      sasaran: { jenis: 'perpuluhan', pct: 30, lagi: 3, d: 0.3 }, kerja: '0.3 = 3/10 = 30/100 = 30%' },
    { grid: [20, 20], base: [1, 1, 4, 4], rocks: [[9, 8, 2, 4]], musuh: [b(14, 4, -1, 1, .7), b(6, 15, 1, -1, .7)],
      sasaran: { jenis: 'pecahan', pct: 60, lagi: 3, a: [3, 5] }, kerja: '3/5 = 60/100 = 60% = 0.6' },
    { grid: [20, 20], base: [8, 16, 4, 4], rocks: [[0, 0, 4, 3], [16, 17, 4, 3]], musuh: [b(4, 6, 1, 1, .6), b(15, 8, -1, 1, .6), h(10, 3, .4)],
      sasaran: { jenis: 'pct', pct: 55, lagi: 3 }, kerja: '55% = 55/100 = 11/20 = 0.55' },
    { grid: [20, 20], base: [1, 8, 4, 4], rocks: [[8, 0, 2, 4], [8, 16, 2, 4]], musuh: [b(14, 5, -1, 1, .6), b(15, 15, -1, -1, .6)],
      sasaran: { jenis: 'jumlah', pct: 45, lagi: 2, bahagian: [{ a: [1, 4] }, { a: [1, 5] }] }, kerja: '1/4 + 1/5 = 5/20 + 4/20 = 9/20 = 45%' },
    { grid: [20, 20], base: [14, 14, 4, 4], rocks: [[0, 0, 3, 3], [6, 9, 3, 2]], musuh: [b(3, 6, 1, 1, .7), b(10, 3, 1, 1, .6), h(2, 15, .4)],
      sasaran: { jenis: 'perpuluhan', pct: 70, lagi: 2, d: 0.7 }, kerja: '0.7 = 7/10 = 70/100 = 70%' },
    { grid: [20, 20], base: [8, 8, 4, 4], rocks: [[0, 8, 3, 4], [17, 8, 3, 4]], musuh: [b(3, 3, 1, 1, .7), b(16, 3, -1, 1, .7), b(10, 17, 1, -1, .6)],
      sasaran: { jenis: 'pecahan', pct: 75, lagi: 2, a: [3, 4] }, kerja: '3/4 = 75/100 = 75% = 0.75' },
    { grid: [20, 20], base: [2, 15, 4, 4], rocks: [[9, 7, 3, 3], [0, 0, 3, 3]], musuh: [b(14, 3, -1, 1, .7), b(15, 12, -1, -1, .7), b(6, 4, 1, 1, .6), h(12, 10, .45)],
      sasaran: { jenis: 'jumlah', pct: 60, lagi: 2, bahagian: [{ d: 0.35 }, { a: [1, 4] }] }, kerja: '0.35 + 1/4 = 35/100 + 25/100 = 60/100 = 60%' }
  ];
  return { TAHAP };
});
