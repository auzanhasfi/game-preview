/* 05 — Penjana soalan matematik asas (mudah). n = bilangan pintu jawapan di gerbang. */
HB.buatSoal = function (tahap, n, idx) {
  var a, b, op, r;
  function plus(max) { a = ri(1, max - 1); b = ri(1, max - a); op = '+'; r = a + b; }
  function minus(max) { a = ri(3, max); b = ri(1, a - 1); op = '−'; r = a - b; }
  function times(lo, hi) { a = ri(lo, hi); b = ri(2, 10); if (Math.random() < 0.5) { var t = a; a = b; b = t; } op = '×'; r = a * b; }
  function divide(lo, hi) { b = ri(lo, hi); r = ri(2, 10); a = b * r; op = '÷'; }
  if (tahap === 'mudah') {
    if (idx % 2 === 0) plus(idx < 2 ? 10 : 20); else minus(idx < 3 ? 10 : 20);
  } else if (tahap === 'sederhana') {
    var k = idx % 3;
    if (k === 0) { a = ri(11, 60); b = ri(5, 99 - a); op = '+'; r = a + b; }
    else if (k === 1) { a = ri(20, 99); b = ri(5, a - 5); op = '−'; r = a - b; }
    else times(2, 5);
  } else {
    var m = idx % 4;
    if (m === 0) times(2, 10); else if (m === 1) divide(2, 10);
    else if (m === 2) { a = ri(100, 500); b = ri(20, 400); op = '+'; r = a + b; }
    else times(3, 9);
  }
  /* pilihan pengalih: dekat dengan jawapan supaya murid perlu mengira */
  var set = [r], tries = 0;
  var deltas = op === '×' || op === '÷' ? [1, -1, 2, -2, a, -a, b, -b, 10, -10] : [1, -1, 2, -2, 10, -10, 3, -3];
  while (set.length < n && tries < 60) {
    var d = op === '×' ? pick(deltas) : pick(deltas), v = r + d;
    if (op === '×' && Math.random() < 0.3) v = a * (b + pick([1, -1]));
    if (v >= 0 && set.indexOf(v) < 0) set.push(v);
    tries++;
  }
  while (set.length < n) set.push(r + set.length * 3);
  return { a: a, b: b, op: op, ans: r, q: a + ' ' + op + ' ' + b + ' = ?', opts: shuffle(set), how: a + ' ' + op + ' ' + b + ' = ' + r };
};
