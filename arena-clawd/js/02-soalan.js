/* Arena Clawd: soalan matematik */
'use strict';
/* ---------- soalan ---------- */
function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
var EMO = ['bulat', 'bintang', 'kotak', 'segitiga'];
function rep(e, n) { return Array(n + 1).join(SHAPES[e]); }
function mkQ(diff) {
  var q = {}, a, b, e = EMO[ri(0, EMO.length - 1)], ty = diff === 'mudah' ? ['tambah', 'tolak'][ri(0, 1)] : ['tambah', 'tolak', 'darab', 'bahagi'][ri(0, 3)];
  if (ty === 'tambah') { if (diff === 'mudah') { a = ri(1, 9); b = ri(1, 9); if (a + b <= 10) q.vis = rep(e, a) + '<i>+</i>' + rep(e, b); } else { a = ri(11, 59); b = ri(5, 39); } q.t = a + ' + ' + b; q.ans = a + b; }
  else if (ty === 'tolak') { if (diff === 'mudah') { a = ri(4, 18); b = ri(1, Math.min(9, a - 1)); if (a <= 10) q.vis = rep(e, a - b) + '<s style="opacity:.35">' + rep(e, b) + '</s>'; } else { a = ri(30, 99); b = ri(8, 29); } q.t = a + ' − ' + b; q.ans = a - b; }
  else if (ty === 'darab') { a = [2, 3, 4, 5, 10][ri(0, 4)]; b = ri(1, 9); q.t = a + ' × ' + b; q.ans = a * b; }
  else { b = [2, 3, 4, 5][ri(0, 3)]; q.ans = ri(1, 9); a = b * q.ans; q.t = a + ' ÷ ' + b; }
  q.t += ' = ?';
  var n = diff === 'mudah' ? 3 : 4, set = [q.ans], spread = [1, 2, 3, 10], tries = 0;
  while (set.length < n && tries++ < 60) { var v = q.ans + spread[ri(0, 3)] * (Math.random() < 0.5 ? -1 : 1); if (v >= 0 && set.indexOf(v) < 0) set.push(v); }
  q.opts = shuffle(set); return q;
}
