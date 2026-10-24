/* Arena Clawd Pro: Generator soal matematika, penjelasan cara, catatan kemajuan */
'use strict';

/* ---------- soal matematika ---------- */
function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[ri(0, arr.length - 1)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
var EMO = [SHAPES.bulat, SHAPES.bintang, SHAPES.kotak, SHAPES.segitiga];
function rep(e, n) { return Array(n + 1).join(e); }
var TOPICS = ['campur', 'tambah', 'kurang', 'kali', 'bagi'];
var TOPIC_TX = { campur: ['Campuran', 'Campur'], tambah: ['Penjumlahan', 'Tambah'], kurang: ['Pengurangan', 'Tolak'], kali: ['Perkalian', 'Darab'], bagi: ['Pembagian', 'Bahagi'] };
var SYM = { tambah: '+', kurang: '−', kali: '×', bagi: '÷' };
var DIFFS = ['mudah', 'sedang', 'sulit'];
var DIFF_TX = { mudah: ['Mudah · kelas 1–2', 'Mudah · tahun 1–2'], sedang: ['Sedang · kelas 3–4', 'Sederhana · tahun 3–4'], sulit: ['Sulit · kelas 5–6', 'Sukar · tahun 5–6'] };
/* level gabungan 0..9 = tingkat (0/3/6) + tier (0..3); tier naik tiap 5 level hero, ult +1 */
function mkQ(topik, diff, tier) {
  var ty = topik === 'campur' ? (diff === 'mudah' && tier === 0 ? pick(['tambah', 'kurang', 'tambah', 'kurang', 'kali']) : pick(['tambah', 'kurang', 'kali', 'bagi'])) : topik;
  var lv = Math.min(9, DIFFS.indexOf(diff) * 3 + Math.max(0, tier)), a, b, c, q = { ty: ty, miss: 0, lv: lv }, e = pick(EMO);
  if (ty === 'tambah') {
    var TA = [[1, 5, 1, 5], [2, 9, 2, 9], [10, 40, 1, 9], [10, 59, 10, 39], [20, 79, 12, 49], [100, 499, 10, 99], [100, 899, 100, 899], [1000, 4999, 100, 999], [1000, 8999, 1000, 4999], [1000, 8999, 1000, 8999]][lv];
    a = ri(TA[0], TA[1]); b = ri(TA[2], TA[3]); c = a + b;
    if (lv <= 1 && c <= 10) q.vis = rep(e, a) + '<i>+</i>' + rep(e, b);
  } else if (ty === 'kurang') {
    var TK = [[2, 10], [11, 18], [20, 59], [30, 99], [50, 99], [100, 499], [300, 999], [1000, 4999], [1000, 9999], [2000, 9999]][lv];
    a = ri(TK[0], TK[1]);
    b = lv === 0 ? ri(1, a - 1) : lv === 1 ? ri(2, 9) : lv === 2 ? ri(1, 9) : lv === 3 ? ri(10, Math.min(29, a - 1)) : lv === 4 ? ri(15, Math.min(49, a - 1)) : lv === 5 ? ri(10, 99) : lv === 6 ? ri(100, Math.min(299, a - 1)) : ri(100, Math.min(999, a - 1));
    c = a - b;
    if (lv === 0) q.vis = rep(e, c) + '<s style="opacity:.35">' + rep(e, b) + '</s>';
  } else if (ty === 'kali') {
    if (lv === 0) { a = pick([2, 5, 10]); b = ri(1, 5); }
    else if (lv === 1) { a = pick([2, 3, 4, 5, 10]); b = ri(1, 10); }
    else if (lv === 2) { a = ri(2, 5); b = ri(2, 10); }
    else if (lv === 3) { a = ri(2, 6); b = ri(2, 10); }
    else if (lv === 4) { a = ri(2, 9); b = ri(2, 10); }
    else if (lv === 5) { a = ri(11, 25); b = ri(2, 5); }
    else if (lv === 6) { a = ri(12, 49); b = ri(3, 9); }
    else if (lv === 7) { a = ri(11, 30); b = ri(11, 19); }
    else if (lv === 8) { a = ri(12, 60); b = ri(3, 9); }
    else { a = ri(100, 250); b = ri(2, 9); }
    if (lv <= 4 && Math.random() < 0.5) { var sw = a; a = b; b = sw; }
    c = a * b;
    if (lv === 0 && a <= 5 && b <= 5) q.vis = Array(a + 1).join(rep(e, b) + ' ').trim().split(' ').join('<i>+</i>');
  } else {
    var TB = [[2, 2, 1, 5], [2, 5, 1, 5], [2, 5, 1, 10], [2, 5, 2, 10], [2, 9, 2, 10], [2, 9, 6, 12], [3, 9, 11, 25], [3, 9, 20, 60], [3, 9, 11, 40], [4, 9, 50, 120]][lv];
    b = lv === 1 ? pick([2, 5, 10]) : ri(TB[0], TB[1]); c = ri(TB[2], TB[3]); a = b * c;
  }
  q.a = a; q.b = b; q.c = c;
  if (lv >= 8 && Math.random() < 0.5) q.miss = Math.random() < 0.5 ? 1 : 2;
  q.ans = q.miss === 1 ? a : q.miss === 2 ? b : c;
  q.opts = mkOpts(q);
  return q;
}
function mkOpts(q) {
  var n = q.lv === 0 ? 3 : 4, set = [q.ans], spread = [1, 2, 10, 1, 2], tries = 0;
  if (q.ty === 'kali' && !q.miss) spread = spread.concat([q.a, q.b]);
  if (q.ans >= 100) spread = spread.concat([100, 20]);
  while (set.length < n && tries++ < 80) { var v = q.ans + pick(spread) * (Math.random() < 0.5 ? -1 : 1); if (v >= 0 && set.indexOf(v) < 0) set.push(v); }
  while (set.length < n) set.push(q.ans + set.length * 3);
  return shuffle(set);
}
function qText(q) {
  var s = SYM[q.ty];
  if (q.miss === 1) return '□ ' + s + ' ' + q.b + ' = ' + q.c;
  if (q.miss === 2) return q.a + ' ' + s + ' □ = ' + q.c;
  return q.a + ' ' + s + ' ' + q.b + ' = ?';
}
/* penjelasan cara: puluhan/satuan, penjumlahan berulang, cek dengan kebalikan */
function explain(q) {
  var a = q.a, b = q.b, c = q.c, out = [], i;
  function split(n) { var p = n >= 100 ? 100 : 10, big = n - n % p; if (n >= 100 && n % 100 === 0) return [n, 0]; return [big, n - big]; }
  if (q.miss) {
    var inv = { tambah: q.miss === 1 ? [c, '−', b] : [c, '−', a], kurang: q.miss === 1 ? [c, '+', b] : [a, '−', c], kali: q.miss === 1 ? [c, '÷', b] : [c, '÷', a], bagi: q.miss === 1 ? [c, '×', b] : [a, '÷', c] }[q.ty];
    out.push(L('Kotak □ adalah angka yang hilang. Pakai operasi <b>kebalikan</b>:', 'Kotak □ ialah nombor yang hilang. Guna operasi <b>songsang</b>:'));
    out.push('□ = ' + inv[0] + ' ' + inv[1] + ' ' + inv[2] + ' = <b>' + q.ans + '</b>');
    out.push(L('Cek: ', 'Semak: ') + a + ' ' + SYM[q.ty] + ' ' + b + ' = ' + c + ' ✓');
    return out;
  }
  if (q.ty === 'tambah') {
    if (a < 10 && b < 10) { var seq = []; for (i = 1; i <= b; i++) seq.push(a + i); out.push(L('Mulai dari <b>' + a + '</b>, hitung maju ' + b + ' langkah:', 'Mula dari <b>' + a + '</b>, kira ke depan ' + b + ' langkah:')); out.push(seq.join(' → ')); }
    else { var sb = split(b); out.push(L('Pecah ' + b + ' menjadi ' + sb[0] + (sb[1] ? ' + ' + sb[1] : '') + ' (puluhan/ratusan dan satuan).', 'Pecahkan ' + b + ' kepada ' + sb[0] + (sb[1] ? ' + ' + sb[1] : '') + ' (puluh/ratus dan sa).')); out.push(a + ' + ' + sb[0] + ' = ' + (a + sb[0])); if (sb[1]) out.push((a + sb[0]) + ' + ' + sb[1] + ' = <b>' + c + '</b>'); }
    out.push(L('Cek dengan kebalikan: ', 'Semak dengan songsang: ') + c + ' − ' + b + ' = ' + a + ' ✓');
  } else if (q.ty === 'kurang') {
    if (b < 10 && a <= 20) { var sq = []; for (i = 1; i <= b; i++) sq.push(a - i); out.push(L('Mulai dari <b>' + a + '</b>, hitung mundur ' + b + ' langkah:', 'Mula dari <b>' + a + '</b>, kira ke belakang ' + b + ' langkah:')); out.push(sq.join(' → ')); }
    else { var sk = split(b); out.push(L('Pecah ' + b + ' menjadi ' + sk[0] + (sk[1] ? ' + ' + sk[1] : '') + '. Kurangi bagian besar dulu.', 'Pecahkan ' + b + ' kepada ' + sk[0] + (sk[1] ? ' + ' + sk[1] : '') + '. Tolak bahagian besar dahulu.')); out.push(a + ' − ' + sk[0] + ' = ' + (a - sk[0])); if (sk[1]) out.push((a - sk[0]) + ' − ' + sk[1] + ' = <b>' + c + '</b>'); }
    out.push(L('Cek dengan kebalikan: ', 'Semak dengan songsang: ') + c + ' + ' + b + ' = ' + a + ' ✓');
  } else if (q.ty === 'kali') {
    var lo = Math.min(a, b), hi = Math.max(a, b);
    if ((lo <= 5 && hi <= 12) || hi <= 10) { out.push(L(a + ' × ' + b + ' artinya penjumlahan berulang: ' + hi + ' ditambah ' + lo + ' kali.', a + ' × ' + b + ' bermaksud tambah berulang: ' + hi + ' ditambah ' + lo + ' kali.')); out.push(Array(lo + 1).join(hi + ' + ').slice(0, -3) + ' = <b>' + c + '</b>'); }
    else if (lo < 10 && hi % 10 === 0) { out.push(L(hi + ' × ' + lo + ': hitung ' + hi / 10 + ' × ' + lo + ' = ' + hi / 10 * lo + ', lalu tambahkan satu nol.', hi + ' × ' + lo + ': kira ' + hi / 10 + ' × ' + lo + ' = ' + hi / 10 * lo + ', kemudian tambah satu sifar.')); out.push(hi + ' × ' + lo + ' = <b>' + c + '</b>'); }
    else if (lo < 10) { var sh = split(hi); out.push(L('Pecah ' + hi + ' = ' + sh[0] + ' + ' + sh[1] + ', kalikan satu per satu dengan ' + lo + '.', 'Pecahkan ' + hi + ' = ' + sh[0] + ' + ' + sh[1] + ', darab satu demi satu dengan ' + lo + '.')); out.push(sh[0] + ' × ' + lo + ' = ' + sh[0] * lo + ', ' + sh[1] + ' × ' + lo + ' = ' + sh[1] * lo); out.push(sh[0] * lo + ' + ' + sh[1] * lo + ' = <b>' + c + '</b>'); }
    else { var s2 = split(b); out.push(L('Pecah ' + b + ' = ' + s2[0] + ' + ' + s2[1] + '.', 'Pecahkan ' + b + ' = ' + s2[0] + ' + ' + s2[1] + '.')); out.push(a + ' × ' + s2[0] + ' = ' + a * s2[0] + ', ' + a + ' × ' + s2[1] + ' = ' + a * s2[1]); out.push(a * s2[0] + ' + ' + a * s2[1] + ' = <b>' + c + '</b>'); }
    out.push(L('Cek dengan kebalikan: ', 'Semak dengan songsang: ') + c + ' ÷ ' + lo + ' = ' + hi + ' ✓');
  } else {
    out.push(L('Cari angka yang kalau dikali ' + b + ' hasilnya ' + a + '.', 'Cari nombor yang jika didarab ' + b + ' hasilnya ' + a + '.'));
    if (c >= 10 && c % 10) { var ct = c - c % 10, co = c % 10; out.push(a + ' = ' + b * ct + ' + ' + b * co + ' → ' + b * ct + ' ÷ ' + b + ' = ' + ct + ', ' + b * co + ' ÷ ' + b + ' = ' + co); out.push(ct + ' + ' + co + ' = <b>' + c + '</b>'); }
    else out.push(b + ' × <b>' + c + '</b> = ' + a);
    out.push(L('Jadi ', 'Jadi ') + a + ' ÷ ' + b + ' = <b>' + c + '</b>. ' + L('Cek: ', 'Semak: ') + c + ' × ' + b + ' = ' + a + ' ✓');
  }
  return out;
}
function explainHtml(q) { return '<div class="ex"><b>' + L('Cara menghitung', 'Cara mengira') + '</b><ol>' + explain(q).map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol></div>'; }

/* ---------- kemajuan (localStorage) ---------- */
var PROG_KEY = 'arena-pro-kemajuan';
function blankProg() { return { main: 0, menang: 0, best: 0, topik: { tambah: [0, 0], kurang: [0, 0], kali: [0, 0], bagi: [0, 0] }, salah: [] }; }
var prog = blankProg();
try { var sv = JSON.parse(localStorage.getItem(PROG_KEY) || 'null'); if (sv && sv.topik) prog = Object.assign(blankProg(), sv); } catch (e) {}
function saveProg() { try { localStorage.setItem(PROG_KEY, JSON.stringify(prog)); } catch (e) {} }
function record(q, ok) {
  var tp = prog.topik[q.ty]; tp[1]++; if (ok) tp[0]++;
  var key = qText(q), keep = prog.salah.filter(function (m) { return qText(m) !== key; });
  if (!ok) keep.unshift({ ty: q.ty, a: q.a, b: q.b, c: q.c, miss: q.miss, ans: q.ans, lv: q.lv });
  prog.salah = keep.slice(0, 8); saveProg();
}
function reviveQ(m) { var q = { ty: m.ty, a: m.a, b: m.b, c: m.c, miss: m.miss || 0, ans: m.ans, lv: m.lv || 3 }; q.opts = mkOpts(q); return q; }
