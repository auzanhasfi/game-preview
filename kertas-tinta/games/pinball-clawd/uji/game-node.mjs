/* simulasi permainan penuh di Node dengan bot: alur bola 1-3, soal, multiball, game over */
import { Permainan } from '../js/06-aturan.js';
import { TEKS } from '../js/01-data.js';
import { buatBot, botLangkah } from '../js/07-bot.js';
const mode = process.argv[2] || 'benar', N = +(process.argv[3] || 5);
for (let g = 0; g < N; g++) {
  const hit = {}; const game = new Permainan({ teks: TEKS.id, level: 'sedang', lapor: (n) => hit[n] = (hit[n] || 0) + 1 });
  const bot = buatBot(); let t = 0, maxB = 0, lolos = 0;
  while (game.fase !== 'selesai' && t < 1200) {
    botLangkah(game, bot, 1 / 60, mode); game.langkah(1 / 60); t += 1 / 60;
    maxB = Math.max(maxB, game.fis.bola.length);
    for (const b of game.fis.bola) if (b.x < 15 || b.x > 510 || b.y < 10 || isNaN(b.x)) { lolos++; b.y = 5000; }
  }
  const i = game.info();
  console.log(`game ${g}: ${t.toFixed(0)}s fase=${i.fase} skor=${i.skor} benar=${i.benar} salah=${i.salah} maxBola=${maxB} lolos=${lolos}`, ['orbit','ramp','kotak','kunci','multiball','skill','ekstra','kickback','simpan','tilt','bonusX','kombo','drain','bumper','target'].map(k=>k+':'+(hit[k]||0)).join(' '));
}
