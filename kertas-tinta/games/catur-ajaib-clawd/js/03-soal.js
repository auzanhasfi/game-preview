/* Catur Ajaib Clawd: pembuat soal matematika. Mudah (+ −), Sedang (× ÷ + soal ekonomi emas), Sulit (campuran, pecahan, persen) */
'use strict';
function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
var EMO = ['bulat', 'bintang', 'kotak', 'segitiga'];
function rep(e, n) { return Array(n + 1).join(SHAPES[e]); }

/* q = { t: teks soal, vis: html bentuk (opsional), ans: angka, opts: [..] , cerita: true bila soal cerita } */
function mkQ(diff) {
  var q = {}, a, b, c, e = pick(EMO), ty;
  if (diff === 'mudah') ty = pick(['tambah', 'tambah', 'kurang', 'kurang', 'tambah20']);
  else if (diff === 'sedang') ty = pick(['kali', 'kali', 'bagi', 'tambah100', 'kurang100', 'bunga', 'beli', 'gabung']);
  else ty = pick(['campur', 'campur', 'pecahan', 'persen', 'xp', 'bunga', 'kali2', 'toko']);

  if (ty === 'tambah') { a = ri(1, 9); b = ri(1, 9); q.t = a + ' + ' + b; q.ans = a + b; if (a + b <= 10) q.vis = rep(e, a) + '<i>+</i>' + rep(e, b); }
  else if (ty === 'tambah20') { a = ri(6, 14); b = ri(3, 9); q.t = a + ' + ' + b; q.ans = a + b; }
  else if (ty === 'kurang') { a = ri(4, 18); b = ri(1, Math.min(9, a - 1)); q.t = a + ' − ' + b; q.ans = a - b; if (a <= 10) q.vis = rep(e, a - b) + '<s>' + rep(e, b) + '</s>'; }
  else if (ty === 'tambah100') { a = ri(12, 59); b = ri(8, 39); q.t = a + ' + ' + b; q.ans = a + b; }
  else if (ty === 'kurang100') { a = ri(30, 99); b = ri(8, 29); q.t = a + ' − ' + b; q.ans = a - b; }
  else if (ty === 'kali') { a = ri(2, 9); b = ri(2, 10); q.t = a + ' × ' + b; q.ans = a * b; }
  else if (ty === 'bagi') { b = ri(2, 9); q.ans = ri(2, 10); a = b * q.ans; q.t = a + ' ÷ ' + b; }
  else if (ty === 'kali2') { a = ri(11, 25); b = ri(3, 9); q.t = a + ' × ' + b; q.ans = a * b; }
  else if (ty === 'campur') {
    a = ri(2, 20); b = ri(2, 9); c = ri(2, 9);
    if (Math.random() < 0.5) { q.t = a + ' + ' + b + ' × ' + c; q.ans = a + b * c; }
    else { q.t = '(' + a + ' + ' + b + ') × ' + c; q.ans = (a + b) * c; }
  }
  else if (ty === 'pecahan') { b = pick([2, 3, 4, 5]); a = ri(1, b - 1); c = b * ri(2, 10); q.t = T('e_pecahan', a + '/' + b, c); q.ans = c / b * a; q.cerita = true; }
  else if (ty === 'persen') { var hp = pick([400, 600, 800, 1000, 1200]), p = pick([10, 20, 25, 50, 75]); q.t = T('e_nyawa', hp, p); q.ans = hp - hp * p / 100; q.cerita = true; }
  else if (ty === 'bunga') { a = diff === 'sulit' ? ri(23, 79) : ri(10, 49); q.t = T('e_bunga', a); q.ans = Math.min(5, Math.floor(a / 10)); q.cerita = true; }
  else if (ty === 'beli') { a = ri(1, 5); b = ri(2, 6); q.t = T('e_beli', a, b); q.ans = a * b; q.cerita = true; }
  else if (ty === 'gabung') { a = ri(3, 12); q.t = T('e_gabung', a); q.ans = Math.floor(a / 3); q.cerita = true; }
  else if (ty === 'xp') { b = ri(2, 6); a = b * 4 + ri(1, 25); q.t = T('e_xp', a, b); q.ans = a - b * 4; q.cerita = true; }
  else if (ty === 'toko') { a = 5; b = ri(1, 4); c = 5; q.t = T('e_toko', a, b, c); q.ans = 5; q.cerita = true; }
  if (!q.cerita) q.t += ' = ?';

  var n = diff === 'mudah' ? 3 : 4, set = [q.ans], tries = 0, sp = q.ans > 50 ? [1, 2, 10, 20, 5] : [1, 2, 3, 5, 10];
  while (set.length < n && tries++ < 80) { var v = q.ans + pick(sp) * (Math.random() < 0.5 ? -1 : 1); if (v >= 0 && set.indexOf(v) < 0) set.push(v); }
  while (set.length < n) set.push(q.ans + set.length * 7);
  q.opts = shuffle(set); q.diff = diff; return q;
}

/* catat jawaban untuk laporan belajar */
function logQ(q, ok) { if (!G) return; G.log.push({ t: q.t, ans: q.ans, ok: ok }); }

/* HTML soal + pilihan. onAns(ok) dipanggil sekali */
function qHTML(q, id) {
  return '<div class="soal">' + (q.vis ? '<div class="vis">' + q.vis + '</div>' : '') +
    '<p class="q' + (q.cerita ? ' cerita' : '') + '">' + q.t + '</p>' +
    '<div class="opts n' + q.opts.length + '" id="' + id + '">' + q.opts.map(function (v) { return '<button data-v="' + v + '" data-uji="opsi">' + v + '</button>'; }).join('') + '</div>' +
    '<p class="fb" aria-live="polite"></p></div>';
}
function bindQ(root, q, onAns) {
  var box = root.querySelector('.opts'), fb = root.querySelector('.fb');
  q.done = false;
  [].forEach.call(box.querySelectorAll('button'), function (bt) {
    bt.onclick = function () {
      if (q.done) return; q.done = true; audioInit();
      var ok = +bt.getAttribute('data-v') === q.ans;
      bt.classList.add(ok ? 'ok' : 'no'); box.classList.add('done');
      if (!ok) { [].forEach.call(box.querySelectorAll('button'), function (x) { if (+x.getAttribute('data-v') === q.ans) x.classList.add('ok'); }); }
      fb.textContent = ok ? T('benar') : T('salah', q.ans); fb.className = 'fb ' + (ok ? 'ok' : 'no');
      sfx(ok ? 'correct' : 'wrong'); logQ(q, ok);
      curQ = null; onAns(ok);
    };
  });
  curQ = { q: q, root: root };
}
var curQ = null;
