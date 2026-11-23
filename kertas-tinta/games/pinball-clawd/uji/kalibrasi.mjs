/* cari tt terbaik per flipper untuk tiap tembakan (tangkap → turun → pukul) */
import { Permainan } from '../js/06-aturan.js';
import { TEKS } from '../js/01-data.js';
import { buatBot, botLangkah } from '../js/07-bot.js';
const N = +(process.argv[2] || 12);
for (const sisi of [0, 1]) for (let tt = 0.2; tt <= 0.96; tt += 0.06) {
  const hit = {};
  for (let k = 0; k < N; k++) {
    const ev = [];
    const g = new Permainan({ teks: TEKS.id, lapor: (n, d) => ev.push([n, d]) });
    g.fis.bola.length = 0; g.soal = null; g.soalJeda = 999;
    g.fis.tambahBola(sisi ? 409 : 81, 760 + Math.random() * 20, (Math.random() - 0.5) * 30, 150);
    const bot = buatBot(); bot.paksa = { sisi, tt };
    let t = 0, hasil = 'tidak', dipukul = false;
    while (t < 5) {
      botLangkah(g, bot, 1 / 60, 'biasa'); g.langkah(1 / 60); t += 1 / 60;
      if (bot.st[sisi].f === 'pukul') dipukul = true;
      const e = ev.find((x) => ['orbit', 'ramp', 'kotak', 'target', 'clawd', 'drain'].includes(x[0]));
      if (dipukul && e) { hasil = e[0] + (typeof e[1] === 'number' ? e[1] : ''); break; }
      if (dipukul && bot.st[1 - sisi].f === 'tangkap') { hasil = 'oper'; break; }
    }
    hit[hasil] = (hit[hasil] || 0) + 1;
  }
  console.log(sisi, tt.toFixed(2), JSON.stringify(hit));
}
