/* Kandungan tahap sahaja. Soalan dijana oleh logic.js daripada parameter ini. */
(function (root) {
  'use strict';
  const LEVELS = [
    { op: '+', ops: ['+'],           addMax: 10, target: 6,  rowEvery: 34, speed: 900,  rows: 4 },
    { op: '+', ops: ['+'],           addMax: 30, target: 7,  rowEvery: 30, speed: 920,  rows: 5 },
    { op: '-', ops: ['-'],           subA: 20, subRes: 15, subB: 9,  target: 7,  rowEvery: 30, speed: 940, rows: 5 },
    { op: '*', ops: ['*'],           mulMax: 5, target: 8,  rowEvery: 26, speed: 960,  rows: 5 },
    { op: '*', ops: ['*'],           mulMax: 9, target: 8,  rowEvery: 24, speed: 980,  rows: 5 },
    { op: 'm', ops: ['+', '-', '*'], addMax: 30, subA: 40, subRes: 25, subB: 15, mulMax: 7, target: 9,  rowEvery: 22, speed: 1000, rows: 5 },
    { op: 'm', ops: ['+', '-', '*'], addMax: 50, subA: 60, subRes: 40, subB: 25, mulMax: 9, target: 10, rowEvery: 18, speed: 1050, rows: 6 }
  ];
  root.GT_LEVELS = LEVELS;
  if (typeof module !== 'undefined') module.exports = LEVELS;
})(typeof window !== 'undefined' ? window : globalThis);
