import { Fisika } from '../js/05-fisika.js';
for (let k = 0; k <= 1.001; k += 0.1) {
  const ev = []; const f = new Fisika((n, d) => ev.push(n + (typeof d === 'number' ? d : '')));
  const b = f.tambahBola(); for (let i = 0; i < 30; i++) f.langkah(1/60);
  f.luncurkan(k); let maxY = 9999;
  for (let i = 0; i < 240; i++) { f.langkah(1/60); if (f.bola[0]) maxY = Math.min(maxY, f.bola[0].y); }
  console.log(k.toFixed(1), Math.round(maxY), [...new Set(ev.filter(e => !/pantul|antar/.test(e)))].join(' '));
}
