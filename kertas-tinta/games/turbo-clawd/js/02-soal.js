/* Turbo Clawd: pembuat soal Gerbang Angka per tingkat (3 pilihan, satu benar) */
const acak = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const kocok = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };

function satu(level) {
  const r = Math.random();
  if (level === 'mudah') {
    if (r < 0.55) { const a = acak(2, 12), b = acak(1, 9); return { teks: `${a} + ${b}`, jwb: a + b }; }
    const a = acak(6, 20), b = acak(1, a - 1); return { teks: `${a} − ${b}`, jwb: a - b };
  }
  if (level === 'sedang') {
    if (r < 0.3) { const a = acak(12, 60), b = acak(8, 39); return { teks: `${a} + ${b}`, jwb: a + b }; }
    if (r < 0.55) { const a = acak(30, 99), b = acak(6, a - 5); return { teks: `${a} − ${b}`, jwb: a - b }; }
    const a = acak(2, 10), b = acak(2, 10); return { teks: `${a} × ${b}`, jwb: a * b };
  }
  if (r < 0.35) { const a = acak(3, 12), b = acak(3, 12); return { teks: `${a} × ${b}`, jwb: a * b }; }
  if (r < 0.65) { const b = acak(2, 12), q = acak(2, 12); return { teks: `${b * q} ÷ ${b}`, jwb: q }; }
  if (r < 0.85) { const a = acak(2, 9), b = acak(2, 9), c = acak(2, 20); return { teks: `${a} × ${b} + ${c}`, jwb: a * b + c }; }
  const a = acak(20, 60), b = acak(2, 6), c = acak(2, 6); return { teks: `${a} − ${b} × ${c}`, jwb: a - b * c };
}

export function buatSoal(level) {
  const s = satu(level);
  const set = new Set([s.jwb]);
  let guard = 0;
  while (set.size < 3 && guard++ < 50) {
    const d = acak(1, Math.max(3, Math.round(Math.abs(s.jwb) * 0.2) + 2)) * (Math.random() < 0.5 ? -1 : 1);
    const v = s.jwb + d; if (v >= 0) set.add(v);
  }
  while (set.size < 3) set.add(s.jwb + set.size * 3);
  const pilihan = kocok([...set]);
  return { teks: s.teks, jwb: s.jwb, pilihan, benar: pilihan.indexOf(s.jwb) };
}
