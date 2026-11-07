/* Clawd Kilat: pembuat soal + pengecoh + cara singkat. Kesulitan menyesuaikan (adapt −2..+3). */

const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pilih = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function buatSoal(tingkat, adapt = 0) {
  const k = Math.max(0, 1 + adapt * 0.25);
  let a, b, c, teks, jawab, cara, op;
  if (tingkat === 'mudah') {
    op = pilih(['+', '+', '−']);
    const maks = Math.round(10 + 10 * k);
    if (op === '+') { a = r(1, Math.max(3, maks - 2)); b = r(1, Math.max(2, maks - a)); jawab = a + b; }
    else { a = r(4, maks); b = r(1, a - 1); jawab = a - b; }
    teks = a + ' ' + op + ' ' + b;
    cara = caraTambahKurang(a, b, op, jawab);
  } else if (tingkat === 'sedang') {
    op = pilih(['+', '−', '×', '×']);
    if (op === '×') { a = r(2, Math.round(6 + 4 * k)); b = r(2, 10); jawab = a * b; cara = a + ' × ' + b + ' = ' + Array(Math.min(b, 4)).fill(a).join(' + ') + (b > 4 ? ' + … ' : '') + ' = ' + jawab; }
    else if (op === '+') { a = r(10, Math.round(40 + 30 * k)); b = r(5, Math.round(30 + 20 * k)); jawab = a + b; cara = caraTambahKurang(a, b, op, jawab); }
    else { a = r(20, Math.round(60 + 40 * k)); b = r(5, a - 5); jawab = a - b; cara = caraTambahKurang(a, b, op, jawab); }
    teks = a + ' ' + op + ' ' + b;
  } else {
    op = pilih(['×', '÷', '2l', '2l']);
    if (op === '×') { a = r(3, 12); b = r(3, Math.round(9 + 3 * k)); jawab = a * b; teks = a + ' × ' + b; cara = a + ' × ' + b + ' = ' + jawab; }
    else if (op === '÷') { b = r(2, 12); jawab = r(2, Math.round(9 + 3 * k)); a = b * jawab; teks = a + ' ÷ ' + b; cara = b + ' × ' + jawab + ' = ' + a + ', jadi ' + a + ' ÷ ' + b + ' = ' + jawab; }
    else { a = r(2, 9); b = r(2, 9); c = r(1, 20); const plus = Math.random() < 0.6; jawab = plus ? a * b + c : a * b - Math.min(c, a * b - 1); const c2 = plus ? c : Math.min(c, a * b - 1); teks = a + ' × ' + b + (plus ? ' + ' : ' − ') + c2; cara = a + ' × ' + b + ' = ' + a * b + ', lalu ' + a * b + (plus ? ' + ' : ' − ') + c2 + ' = ' + jawab; }
  }
  return { teks, jawab, pilihan: pengecoh(jawab), cara };
}

function caraTambahKurang(a, b, op, j) {
  if (op === '+') {
    const keSepuluh = 10 - (a % 10);
    if (a % 10 && b > keSepuluh && b < 20) return a + ' + ' + b + ' = ' + a + ' + ' + keSepuluh + ' + ' + (b - keSepuluh) + ' = ' + j;
    return a + ' + ' + b + ' = ' + j;
  }
  const s = a % 10;
  if (s && b > s && b < 20) return a + ' − ' + b + ' = ' + a + ' − ' + s + ' − ' + (b - s) + ' = ' + j;
  return a + ' − ' + b + ' = ' + j;
}

/* tiga pilihan acak: jawaban + dua pengecoh masuk akal (±1, ±2, ±10) */
export function pengecoh(j) {
  const calon = [j + 1, j - 1, j + 2, j - 2, j + 10, j - 10].filter((x) => x >= 0 && x !== j);
  const s = new Set([j]);
  while (s.size < 3) s.add(calon.length ? calon.splice(Math.floor(Math.random() * calon.length), 1)[0] : j + s.size * 3);
  return [...s].sort(() => Math.random() - 0.5);
}
