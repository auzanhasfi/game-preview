import { Fisika } from '../js/05-fisika.js';
for (const sisi of [0,1]) for (let tt = 0.15; tt <= 0.96; tt += 0.1) {
  const ev = []; const f = new Fisika((n, d) => ev.push(n + (typeof d === 'number' ? d : (d && d.i !== undefined ? d.i : ''))));
  const F = f.flip[sisi];
  const ux = Math.cos(F.a), uy = Math.sin(F.a), rad = F.r1 + (F.r2 - F.r1) * tt;
  // titik di atas permukaan flipper (normal ke atas)
  let nx = -uy, ny = ux; if (ny > 0) { nx = -nx; ny = -ny; }
  const b = f.tambahBola(F.px + ux * F.L * tt + nx * (rad + 13.5), F.py + uy * F.L * tt + ny * (rad + 13.5), 0, 0);
  F.tekan = true; let out = null;
  for (let i = 0; i < 300; i++) { f.langkah(1/120); if (!out && b.y < F.py - 60) out = [Math.round(Math.atan2(b.vy, b.vx) * 180 / Math.PI), Math.round(Math.hypot(b.vx, b.vy))]; if (f.kotakTahan) f.lepasKotak(); }
  console.log(sisi, tt.toFixed(2), out, [...new Set(ev.filter(e=>!/pantul|pukul|sling|antar|spinner/.test(e)))].join(' '));
}
