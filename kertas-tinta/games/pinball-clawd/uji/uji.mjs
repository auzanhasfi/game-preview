/* Uji main otomatis Pinball Clawd (Chrome headless, desktop + HP). Pakai: node uji/uji.mjs http://localhost:8991 [putaran]
   Menyimpan tangkapan di bukti/ dan laporan di bukti/laporan-<putaran>.md */
import { createRequire } from 'node:module';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const require = createRequire(path.join(process.env.HOME, '.claude/skills/studio-game-web/scripts/package.json'));
const puppeteer = require('puppeteer-core');
const DIR = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const BASE = process.argv[2] || 'http://localhost:8991', PUT = process.argv[3] || '1';
const OUT = path.join(DIR, 'bukti'); fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));
const lap = ['# Laporan uji Pinball Clawd · putaran ' + PUT, ''], galat = [];
let lulus = 0, gagal = 0;
function cek(nama, ok, nota = '') { ok ? lulus++ : gagal++; lap.push(`- ${ok ? 'LULUS' : 'GAGAL'} · ${nama}${nota ? ' — ' + nota : ''}`); console.log(ok ? '✓' : '✗', nama, nota); }

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
async function halaman(vp, nama, sentuh = false) {
  const page = await browser.newPage(); await page.setViewport(Object.assign({}, vp, sentuh ? { isMobile: true, hasTouch: true } : {}));
  page.on('console', (m) => { if (m.type() === 'error') galat.push(nama + ': ' + m.text()); });
  page.on('pageerror', (e) => galat.push(nama + ': ' + e.message));
  page.on('response', (r) => { if (r.status() >= 400) galat.push(nama + ' ' + r.status() + ': ' + r.url()); });
  await page.evaluateOnNewDocument(() => { try { if (!sessionStorage.getItem('uji')) { sessionStorage.setItem('uji', '1'); localStorage.clear(); } } catch (e) {} });
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' }); await tunggu(1500);
  // headless tidak punya fokus jendela: cegah jeda otomatis karena blur
  await page.evaluate(() => { window.dispatchEvent(new Event('focus')); });
  return page;
}
const foto = (page, n) => page.screenshot({ path: path.join(OUT, `p${PUT}-${n}.png`) });
const info = (page) => page.evaluate(() => window.__game.info());
// swiftshader lambat: ukur kemajuan waktu simulasi, bukan detik nyata
const simulasi = (page, detik) => page.evaluate(async (d) => { const g = () => window.__game.game; const t0 = g().t; const s = performance.now(); while (g().t - t0 < d && performance.now() - s < 120000) { if (window.__game.mode === 'jeda') window.__game.jeda(false); await new Promise((r) => setTimeout(r, 100)); } return g().t - t0; }, detik);
const lolos = (page) => page.evaluate(() => window.__game.game.fis.bola.filter((b) => !(b.x > 15 && b.x < 510 && b.y > 10 && b.y < 1110) || Number.isNaN(b.x)).length);

/* ---- desktop ---- */
{
  const page = await halaman({ width: 1280, height: 720 }, 'desktop');
  await foto(page, '01-menu');
  cek('menu tampil + meja demo berjalan', await page.evaluate(() => window.__game.mode === 'menu' && window.__game.game.demo));
  await simulasi(page, 3); const d0 = await info(page);
  cek('bot demo meluncurkan bola', d0.skor > 0 || (await page.evaluate(() => window.__game.game.fis.bola.some((b) => b.y < 900))), JSON.stringify(d0));
  cek('kanvas WebGL menggambar meja 3D', await page.evaluate(() => window.__game.R.r.info.memory.geometries > 40 && window.__game.R.scene.children.length > 60), 'geo=' + await page.evaluate(() => window.__game.R.r.info.memory.geometries));
  await page.click('[data-uji=main]'); await tunggu(500);
  cek('Main → mode main + HUD', await page.evaluate(() => window.__game.mode === 'main' && !document.getElementById('hud').hidden));
  cek('tombol plunger tampil saat bola di lorong', await page.evaluate(() => !document.getElementById('tPlunger').hidden));
  await foto(page, '02-main-awal');
  // plunger dengan keyboard (tahan & lepas Spasi)
  await page.keyboard.down('Space'); await simulasi(page, 0.6); await page.keyboard.up('Space');
  await simulasi(page, 0.8);
  cek('plunger Spasi meluncurkan bola', await page.evaluate(() => window.__game.game.fis.bola.some((b) => b.y < 700)), JSON.stringify(await page.evaluate(() => window.__game.game.fis.bola.map((b) => [b.x | 0, b.y | 0]))));
  // flipper keyboard
  await page.keyboard.down('KeyZ'); await page.keyboard.down('Slash'); await simulasi(page, 0.15);
  const sudut = await page.evaluate(() => window.__game.game.fis.flip.map((f) => +(f.a * 57.3).toFixed(0)));
  await page.keyboard.up('KeyZ'); await page.keyboard.up('Slash');
  cek('flipper Z dan / terangkat', sudut[0] < -20 && sudut[1] > 200, JSON.stringify(sudut));
  await foto(page, '03-flipper');
  // soal tampil di DMD + pilihan
  await simulasi(page, 2.5);
  const soal = await page.evaluate(() => ({ s: window.__game.game.soal, pil: [...document.querySelectorAll('.pil b')].map((b) => b.textContent) }));
  cek('soal + 4 pilihan tampil', !!soal.s && soal.pil.length === 4 && soal.pil.every((x, i) => x === String(soal.s.pilihan[i])), JSON.stringify(soal));
  // jawab benar & salah lewat tembakan
  const b0 = await info(page);
  await page.evaluate(() => window.__game.jawab(true)); await tunggu(150);
  let i = await info(page);
  cek('tembakan benar → Benar +1, poin', i.benar === b0.benar + 1 && i.skor > b0.skor, `skor ${b0.skor}→${i.skor}`);
  cek('chip jawaban ditandai hijau', await page.evaluate(() => !!document.querySelector('.pil.ok')));
  await foto(page, '04-benar');
  await simulasi(page, 2.2);
  await page.evaluate(() => window.__game.jawab(false)); await tunggu(150); i = await info(page);
  cek('tembakan salah → Salah +1, beruntun 0', i.salah >= 1 && i.streak === 0, JSON.stringify(i));
  await foto(page, '05-salah');
  // autopilot bermain sungguhan
  await page.evaluate(() => { window.__game.autopilot = true; });
  const dt = await simulasi(page, 25); i = await info(page);
  cek('autopilot bermain 25 detik (skor naik)', i.skor > b0.skor + 20000, `simdt=${dt.toFixed(1)} ${JSON.stringify(i)}`);
  cek('tidak ada bola keluar meja', (await lolos(page)) === 0);
  await foto(page, '06-autopilot');
  // Kotak Clawd → kunci → multiball
  await page.evaluate(() => { window.__game.autopilot = false; });
  for (let k = 0; k < 2; k++) {
    await page.evaluate(() => { window.__game.bukaKotak(); window.__game.bolaKeKotak(); });
    await simulasi(page, 2.2);
  }
  i = await info(page);
  cek('2 bola terkunci → Multiball', i.multiball === true, JSON.stringify(i));
  await page.evaluate(() => { window.__game.autopilot = true; });
  await simulasi(page, 3); i = await info(page);
  cek('multiball: lebih dari 1 bola di meja', i.bola >= 2, 'bola=' + i.bola);
  await foto(page, '07-multiball');
  await page.evaluate(() => window.__game.jawab(true)); i = await info(page);
  cek('jawaban benar saat multiball = Jackpot 250.000', await page.evaluate(() => window.__game.game.pesan.some((p) => /JACKPOT/.test(p.a))));
  // tilt
  await page.evaluate(() => { window.__game.autopilot = false; for (let k = 0; k < 4; k++) window.__game.game.goyang(); });
  cek('goyang 4x → TILT, flipper mati', await page.evaluate(() => window.__game.game.tilt && window.__game.game.fis.mati));
  await foto(page, '08-tilt');
  // habiskan bola → hasil
  for (let k = 0; k < 6 && await page.evaluate(() => window.__game.mode === 'main'); k++) { await page.evaluate(() => window.__game.habiskanBola()); await simulasi(page, 3.2); }
  await tunggu(1500);
  cek('3 bola habis → layar hasil', await page.evaluate(() => window.__game.mode === 'hasil'));
  cek('hasil: skor, statistik, riwayat soal', await page.evaluate(() => document.getElementById('hasilSkor').textContent.length > 2 && document.querySelectorAll('#hasilStat div').length === 3 && document.querySelectorAll('#hasilDaftar li').length >= 2));
  await foto(page, '09-hasil');
  // bahasa Melayu
  await page.click('[data-uji=menuHasil]'); await tunggu(400);
  await page.click('[data-uji=bahasa]'); await tunggu(200);
  cek('ganti ke Bahasa Melayu', await page.evaluate(() => document.querySelector('[data-uji=bahasa]').textContent === 'Bahasa Melayu' && /Tahap soalan/i.test(document.getElementById('menu').textContent)));
  await page.click('[data-uji=bantuan]'); await tunggu(300); await foto(page, '10-bantuan-ms');
  cek('halaman cara main berisi 6 langkah', await page.evaluate(() => document.querySelectorAll('#isiBantuan li').length === 6));
  await page.close();
}

/* ---- fisika panjang: 3 permainan autopilot penuh, cek bola tidak lolos ---- */
{
  const page = await halaman({ width: 900, height: 700 }, 'panjang');
  await page.evaluate(() => { window.__game.mulaiMain(); window.__game.autopilot = true; });
  let maks = 0, lepas = 0;
  for (let k = 0; k < 12; k++) { await simulasi(page, 5); lepas += await lolos(page); maks = Math.max(maks, (await info(page)).skor); if (await page.evaluate(() => window.__game.mode !== 'main')) break; }
  const i = await info(page);
  cek('main 60 detik dengan autopilot tanpa bola lolos', lepas === 0, `skor=${maks} benar=${i.benar} salah=${i.salah} mode=${i.mode}`);
  await page.close();
}

/* ---- telefon (sentuh) ---- */
{
  const page = await halaman({ width: 390, height: 844 }, 'telefon', true);
  await foto(page, '11-menu-hp');
  cek('tanpa skrol mendatar di HP', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await page.tap('[data-uji=main]'); await tunggu(500);
  cek('HP: mode main', await page.evaluate(() => window.__game.mode === 'main'));
  // tahan tombol plunger lewat sentuhan
  const pl = await page.$('#tPlunger'); const bx = await pl.boundingBox();
  await page.touchscreen.touchStart(bx.x + bx.width / 2, bx.y + bx.height / 2); await simulasi(page, 0.5); await page.touchscreen.touchEnd();
  await simulasi(page, 0.8);
  cek('HP: tombol plunger meluncurkan bola', await page.evaluate(() => window.__game.game.fis.bola.some((b) => b.y < 700)));
  // sentuh sisi kiri = flipper kiri
  await page.touchscreen.touchStart(60, 600); await simulasi(page, 0.12);
  const a = await page.evaluate(() => window.__game.game.fis.flip[0].a * 57.3); await page.touchscreen.touchEnd();
  cek('HP: sentuh kiri mengangkat flipper kiri', a < -20, a.toFixed(0));
  await page.touchscreen.touchStart(330, 600); await simulasi(page, 0.12);
  const b = await page.evaluate(() => window.__game.game.fis.flip[1].a * 57.3); await page.touchscreen.touchEnd();
  cek('HP: sentuh kanan mengangkat flipper kanan', b > 200, b.toFixed(0));
  await simulasi(page, 2);
  // DMD tidak menutupi meja: titik puncak busur meja harus di bawah kotak #atas
  const tutup = await page.evaluate(() => { const R = window.__game.R; const atas = document.getElementById('atas').getBoundingClientRect().bottom; const v = new R.cam.position.constructor(-0.175, 0, -5.0).project(R.cam); return { atas, puncak: (1 - v.y) / 2 * innerHeight }; });
  cek('HP: layar DMD tidak menutupi meja', tutup.puncak > tutup.atas - 2, JSON.stringify(tutup));
  await foto(page, '12-main-hp');
  await page.evaluate(() => { window.__game.autopilot = true; }); await simulasi(page, 6); await foto(page, '13-main-hp-2');
  await page.close();
}

cek('tanpa galat konsol / jaringan', galat.length === 0, galat.slice(0, 5).join(' | '));
lap.push('', `**${lulus} lulus, ${gagal} gagal**`);
fs.writeFileSync(path.join(OUT, `laporan-${PUT}.md`), lap.join('\n'));
console.log(`\n${lulus} lulus, ${gagal} gagal`);
await browser.close();
process.exit(gagal ? 1 : 0);
