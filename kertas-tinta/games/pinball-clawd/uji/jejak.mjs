import { Permainan } from '../js/06-aturan.js';
import { TEKS } from '../js/01-data.js';
import { buatBot, botLangkah } from '../js/07-bot.js';
const sisi = +(process.argv[2]||0), tt = +(process.argv[3]||0.6);
const ev = []; const g = new Permainan({ teks: TEKS.id, lapor: (n, d) => ev.push(n) });
g.fis.bola.length = 0; g.soal = null; g.soalJeda = 999;
g.fis.tambahBola(sisi ? 409 : 81, 770, 0, 150);
const bot = buatBot(); bot.paksa = { sisi, tt };
for (let i = 0; i < 240; i++) { botLangkah(g, bot, 1/60, 'biasa'); g.langkah(1/60);
  const b = g.fis.bola[0]; if (i % 6 === 0) console.log(i, bot.st[sisi].f, b ? [b.x|0, b.y|0, b.vx|0, b.vy|0].join(',') : '-', (g.fis.flip[sisi].a*57.3)|0, ev.splice(0).join(' ')); }
