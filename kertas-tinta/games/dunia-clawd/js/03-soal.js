/* Dunia Clawd: generator soal (remake dari Arena Clawd Pro) + cara mengira 3 bahasa */
import { t } from './01-teks.js';

const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[ri(0, arr.length - 1)];
export const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const SYM = { tambah: '+', kurang: '−', kali: '×', bagi: '÷' };
export const DIFFS = ['mudah', 'sedang', 'sulit'];
export const NAMA_DIFF = { mudah: ['Mudah · Tahun 1–2', 'Easy · Year 1–2', 'Mudah · Kelas 1–2'], sedang: ['Sederhana · Tahun 3–4', 'Medium · Year 3–4', 'Sedang · Kelas 3–4'], sulit: ['Sukar · Tahun 5–6', 'Hard · Year 5–6', 'Sulit · Kelas 5–6'] };
export const NAMA_TOPIK = { campur: ['Campur', 'Mixed', 'Campuran'], tambah: ['Tambah', 'Addition', 'Penjumlahan'], kurang: ['Tolak', 'Subtraction', 'Pengurangan'], kali: ['Darab', 'Multiplication', 'Perkalian'], bagi: ['Bahagi', 'Division', 'Pembagian'] };

/* tier naik sedikit di tahap permainan yang lebih jauh; lv gabungan 0..9 */
export function buatSoal(topik = 'campur', diff = 'mudah', tier = 0) {
  const ty = topik === 'campur' ? (diff === 'mudah' && tier === 0 ? pick(['tambah', 'kurang', 'tambah', 'kurang', 'kali']) : pick(['tambah', 'kurang', 'kali', 'bagi'])) : topik;
  const lv = Math.min(9, DIFFS.indexOf(diff) * 3 + Math.max(0, tier));
  let a, b, c; const q = { ty, miss: 0, lv };
  if (ty === 'tambah') {
    const TA = [[1, 5, 1, 5], [2, 9, 2, 9], [10, 40, 1, 9], [10, 59, 10, 39], [20, 79, 12, 49], [100, 499, 10, 99], [100, 899, 100, 899], [1000, 4999, 100, 999], [1000, 8999, 1000, 4999], [1000, 8999, 1000, 8999]][lv];
    a = ri(TA[0], TA[1]); b = ri(TA[2], TA[3]); c = a + b;
  } else if (ty === 'kurang') {
    const TK = [[2, 10], [11, 18], [20, 59], [30, 99], [50, 99], [100, 499], [300, 999], [1000, 4999], [1000, 9999], [2000, 9999]][lv];
    a = ri(TK[0], TK[1]);
    b = lv === 0 ? ri(1, a - 1) : lv === 1 ? ri(2, 9) : lv === 2 ? ri(1, 9) : lv === 3 ? ri(10, Math.min(29, a - 1)) : lv === 4 ? ri(15, Math.min(49, a - 1)) : lv === 5 ? ri(10, 99) : lv === 6 ? ri(100, Math.min(299, a - 1)) : ri(100, Math.min(999, a - 1));
    c = a - b;
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
    if (lv <= 4 && Math.random() < 0.5) [a, b] = [b, a];
    c = a * b;
  } else {
    const TB = [[2, 2, 1, 5], [2, 5, 1, 5], [2, 5, 1, 10], [2, 5, 2, 10], [2, 9, 2, 10], [2, 9, 6, 12], [3, 9, 11, 25], [3, 9, 20, 60], [3, 9, 11, 40], [4, 9, 50, 120]][lv];
    b = lv === 1 ? pick([2, 5, 10]) : ri(TB[0], TB[1]); c = ri(TB[2], TB[3]); a = b * c;
  }
  q.a = a; q.b = b; q.c = c;
  if (lv >= 8 && Math.random() < 0.5) q.miss = Math.random() < 0.5 ? 1 : 2;
  q.ans = q.miss === 1 ? a : q.miss === 2 ? b : c;
  q.opts = pilihan(q, lv === 0 ? 3 : 4);
  return q;
}
/* pilihan salah yang masuk akal: selisih kecil, salah puluhan, salah sifir */
export function pilihan(q, n = 4) {
  const set = [q.ans]; let spread = [1, 2, 10, 1, 2], tries = 0;
  if (q.ty === 'kali' && !q.miss) spread = spread.concat([q.a, q.b]);
  if (q.ans >= 100) spread = spread.concat([100, 20]);
  while (set.length < n && tries++ < 80) { const v = q.ans + pick(spread) * (Math.random() < 0.5 ? -1 : 1); if (v >= 0 && !set.includes(v)) set.push(v); }
  while (set.length < n) set.push(q.ans + set.length * 3);
  return shuffle(set);
}
export function teksSoal(q) {
  const s = SYM[q.ty];
  if (q.miss === 1) return '□ ' + s + ' ' + q.b + ' = ' + q.c;
  if (q.miss === 2) return q.a + ' ' + s + ' □ = ' + q.c;
  return q.a + ' ' + s + ' ' + q.b + ' = ?';
}
function pecah(n) { const p = n >= 100 ? 100 : 10, besar = n - n % p; return n % p === 0 ? [n, 0] : [besar, n - besar]; }

/* cara mengira: senarai baris (boleh mengandungi <b>) */
export function caraKira(q) {
  const { a, b, c } = q, out = [];
  if (q.miss) {
    const inv = { tambah: q.miss === 1 ? [c, '−', b] : [c, '−', a], kurang: q.miss === 1 ? [c, '+', b] : [a, '−', c], kali: q.miss === 1 ? [c, '÷', b] : [c, '÷', a], bagi: q.miss === 1 ? [c, '×', b] : [a, '÷', c] }[q.ty];
    out.push(t('Kotak □ ialah nombor yang hilang. Guna operasi songsang:', 'The box □ is the missing number. Use the inverse operation:', 'Kotak □ adalah angka yang hilang. Pakai operasi kebalikan:'));
    out.push('□ = ' + inv[0] + ' ' + inv[1] + ' ' + inv[2] + ' = <b>' + q.ans + '</b>');
    return out;
  }
  if (q.ty === 'tambah') {
    if (a < 10 && b < 10) { const s = []; for (let i = 1; i <= b; i++) s.push(a + i); out.push(t(`Mula dari <b>${a}</b>, kira ke depan ${b} langkah:`, `Start at <b>${a}</b>, count on ${b} steps:`, `Mulai dari <b>${a}</b>, hitung maju ${b} langkah:`)); out.push(s.join(' → ')); }
    else { const [x, y] = pecah(b); out.push(t(`Pecahkan ${b} kepada ${x}${y ? ' + ' + y : ''}.`, `Split ${b} into ${x}${y ? ' + ' + y : ''}.`, `Pecah ${b} menjadi ${x}${y ? ' + ' + y : ''}.`)); out.push(`${a} + ${x} = ${a + x}`); if (y) out.push(`${a + x} + ${y} = <b>${c}</b>`); }
  } else if (q.ty === 'kurang') {
    if (b < 10 && a <= 20) { const s = []; for (let i = 1; i <= b; i++) s.push(a - i); out.push(t(`Mula dari <b>${a}</b>, kira ke belakang ${b} langkah:`, `Start at <b>${a}</b>, count back ${b} steps:`, `Mulai dari <b>${a}</b>, hitung mundur ${b} langkah:`)); out.push(s.join(' → ')); }
    else { const [x, y] = pecah(b); out.push(t(`Pecahkan ${b} kepada ${x}${y ? ' + ' + y : ''}. Tolak bahagian besar dahulu.`, `Split ${b} into ${x}${y ? ' + ' + y : ''}. Take away the big part first.`, `Pecah ${b} menjadi ${x}${y ? ' + ' + y : ''}. Kurangi bagian besar dulu.`)); out.push(`${a} − ${x} = ${a - x}`); if (y) out.push(`${a - x} − ${y} = <b>${c}</b>`); }
  } else if (q.ty === 'kali') {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    if ((lo <= 5 && hi <= 12) || hi <= 10) { out.push(t(`${a} × ${b} bermaksud ${hi} ditambah ${lo} kali:`, `${a} × ${b} means ${hi} added ${lo} times:`, `${a} × ${b} artinya ${hi} ditambah ${lo} kali:`)); out.push(Array(lo).fill(hi).join(' + ') + ` = <b>${c}</b>`); }
    else if (lo < 10) { const [x, y] = pecah(hi); out.push(t(`Pecahkan ${hi} = ${x} + ${y}, darab satu demi satu dengan ${lo}.`, `Split ${hi} = ${x} + ${y}, multiply each part by ${lo}.`, `Pecah ${hi} = ${x} + ${y}, kalikan satu per satu dengan ${lo}.`)); out.push(`${x} × ${lo} = ${x * lo}, ${y} × ${lo} = ${y * lo}`); out.push(`${x * lo} + ${y * lo} = <b>${c}</b>`); }
    else { const [x, y] = pecah(b); out.push(t(`Pecahkan ${b} = ${x} + ${y}.`, `Split ${b} = ${x} + ${y}.`, `Pecah ${b} = ${x} + ${y}.`)); out.push(`${a} × ${x} = ${a * x}, ${a} × ${y} = ${a * y}`); out.push(`${a * x} + ${a * y} = <b>${c}</b>`); }
  } else {
    out.push(t(`Cari nombor yang jika didarab ${b} hasilnya ${a}.`, `Find the number that gives ${a} when multiplied by ${b}.`, `Cari angka yang kalau dikali ${b} hasilnya ${a}.`));
    out.push(`${b} × <b>${c}</b> = ${a}`);
  }
  return out;
}
