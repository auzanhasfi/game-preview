/* Uji main otomatis Turbo Clawd (Chrome headless). Pakai: node uji/uji.mjs http://localhost:8990 [putaran]
   Menyimpan tangkapan di bukti/ dan laporan di bukti/laporan-<putaran>.md */
import { createRequire } from 'node:module';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const require = createRequire(path.join(process.env.HOME, '.claude/skills/studio-game-web/scripts/package.json'));
const puppeteer = require('puppeteer-core');
const DIR = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const BASE = process.argv[2] || 'http://localhost:8990', PUT = process.argv[3] || '1';
const OUT = path.join(DIR, 'bukti'); fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));
const lap = ['# Laporan uji Turbo Clawd · putaran ' + PUT, ''], galat = [];
let lulus = 0, gagal = 0;
function cek(nama, ok, nota = '') { ok ? lulus++ : gagal++; lap.push(`- ${ok ? 'LULUS' : 'GAGAL'} · ${nama}${nota ? ' — ' + nota : ''}`); console.log(ok ? '✓' : '✗', nama, nota); }

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
async function halaman(vp, nama, sentuh = false) {
  const page = await browser.newPage(); await page.setViewport(Object.assign({}, vp, sentuh ? { isMobile: true, hasTouch: true } : {}));
  page.on('console', (m) => { if (m.type() === 'error') galat.push(nama + ': ' + m.text()); });
  page.on('pageerror', (e) => galat.push(nama + ': ' + e.message));
  page.on('response', (r) => { if (r.status() >= 400) galat.push(nama + ' ' + r.status() + ': ' + r.url()); });
  await page.evaluateOnNewDocument(() => { try { if (!sessionStorage.getItem('uji')) { sessionStorage.setItem('uji', '1'); localStorage.clear(); } } catch (e) {} });
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' }); await tunggu(1500);
  return page;
}
const foto = (page, n) => page.screenshot({ path: path.join(OUT, `p${PUT}-${n}.png`) });
const info = (page) => page.evaluate(() => window.__game.info());
const sampai = (page, ekspr, ms = 20000) => page.evaluate(async (e, ms) => { const t0 = performance.now(); while (performance.now() - t0 < ms) { if (eval(e)) return true; await new Promise((r) => setTimeout(r, 100)); } return false; }, ekspr, ms);
// waktu simulasi: swiftshader lambat, jadi ukur kemajuan, bukan detik nyata
const simulasi = (page, detik) => page.evaluate(async (d) => { const t0 = window.__game.G.waktu; const s = performance.now(); while (window.__game.G.waktu - t0 < d && performance.now() - s < 90000) await new Promise((r) => setTimeout(r, 100)); return window.__game.G.waktu - t0; }, detik);

/* ---- desktop: alur cerita penuh ---- */
{
  const page = await halaman({ width: 1280, height: 720 }, 'desktop');
  await foto(page, '01-menu');
  cek('menu tampil + balapan demo', await page.evaluate(() => window.__game.mode === 'menu' && window.__game.G.pembalap.length === 5));
  await page.click('[data-uji=mulai]'); await tunggu(600);
  cek('prolog cerita muncul', await page.$eval('#cerita', (e) => e.classList.contains('aktif') && e.textContent.length > 20));
  await foto(page, '02-cerita');
  for (let i = 0; i < 30 && await page.evaluate(() => window.__game.mode === 'cerita'); i++) { await page.evaluate(() => document.querySelector('[data-uji=lanjut]').click()); await tunggu(120); }
  cek('cerita → hitung mundur', await sampai(page, "['hitung','balap'].includes(window.__game.mode)", 5000));
  await page.evaluate(() => window.__game.lewatiHitung());
  cek('hitung mundur → balap', await sampai(page, "window.__game.mode === 'balap'"));
  await page.evaluate(() => { window.__game.autopilot = true; });
  const d1 = await simulasi(page, 4); let i = await info(page);
  cek('mobil melaju (autopilot)', i.v > 40 && i.s > 50, JSON.stringify(i) + ' simdt=' + d1.toFixed(1));
  await foto(page, '03-balap');
  // gerbang: jawab benar
  await page.evaluate(() => window.__game.keGerbang()); await simulasi(page, 0.3);
  cek('HUD soal tampil dekat gerbang', await page.$eval('#hSoal', (e) => !e.hidden && /=/.test(e.textContent)));
  await foto(page, '04-gerbang');
  const b0 = i.benar; await simulasi(page, 2.2); i = await info(page);
  cek('lewat lajur benar → Turbo Benar', i.benar === b0 + 1 && i.boost > 0, JSON.stringify(i));
  // gerbang: jawab salah
  await page.evaluate(() => { window.__game.autopilot = 'salah'; window.__game.keGerbang(); }); await simulasi(page, 2.4); i = await info(page);
  cek('lewat lajur salah → tercatat salah', i.salah >= 1, JSON.stringify(i));
  await page.evaluate(() => { window.__game.autopilot = true; });
  // item
  for (const it of ['roket', 'bom', 'dorong', 'nitro', 'perisai']) {
    await page.evaluate((it) => { window.__game.autopilot = false; window.__game.beriItem(it); window.__game.pakai(); }, it);
    await simulasi(page, 0.25); const j = await info(page);
    cek('item ' + it + ' terpakai', j.item === null, 'proj=' + j.proj);
    if (it === 'roket') await foto(page, '05-roket');
  }
  await page.evaluate(() => { window.__game.autopilot = true; });
  await simulasi(page, 3); await foto(page, '06-item');
  // finis
  await page.evaluate(() => window.__game.keFinis());
  cek('finis → layar hasil', await sampai(page, "window.__game.mode === 'hasil'", 40000));
  await tunggu(400); await foto(page, '07-hasil');
  cek('hasil menunjukkan posisi & daftar', await page.$eval('#hasilDaftar', (e) => e.children.length === 6));
  await page.close();
}

/* ---- semua arena dibangun & dimainkan sebentar ---- */
{
  const page = await halaman({ width: 1280, height: 720 }, 'arena');
  for (let a = 0; a < 4; a++) {
    await page.evaluate((a) => { window.__game.SET.buka = 4; window.__game.mulai(a); }, a);
    await sampai(page, "window.__game.mode === 'cerita' || window.__game.mode === 'hitung'", 4000);
    await page.evaluate(() => { document.getElementById('bLewati').click(); });
    await sampai(page, "window.__game.mode === 'hitung'", 4000);
    await page.evaluate(() => { window.__game.lewatiHitung(); window.__game.autopilot = true; });
    await sampai(page, "window.__game.mode === 'balap'");
    // lompat ke zona loop/lompatan untuk melihat fisika di sana
    const L = (await info(page)).L;
    const tegak = await page.evaluate(() => { const tr = window.__game.G.trek; let m = 1, nl = 0; for (let i = 0; i < tr.N; i++) { if (tr.loop[i]) { nl++; continue; } m = Math.min(m, tr.U[i * 3 + 1]); } let top = 1; for (let i = 0; i < tr.N; i++) if (tr.loop[i]) top = Math.min(top, tr.U[i * 3 + 1]); return { m: +m.toFixed(3), top: +top.toFixed(2), nl }; });
    cek(`arena ${a + 1} jalan tegak di luar loop`, tegak.m > 0.85 && (tegak.nl === 0 || tegak.top < -0.9), JSON.stringify(tegak));
    for (const [n, f] of [['lurus', 0.03], ['tengah', 0.5]]) { await page.evaluate((f) => { const pm = window.__game.G.pemain; pm.s = window.__game.G.trek.L * f; }, f); await simulasi(page, 1.2); await foto(page, `08-arena${a + 1}-${n}`); }
    const dt = await simulasi(page, 6); const i = await info(page);
    cek(`arena ${a + 1} berjalan`, i.s > 150 && Math.abs(i.x) < 7, `L=${L} s=${i.s} pos=${i.pos} simdt=${dt.toFixed(1)}`);
    await foto(page, `08-arena${a + 1}`);
    // lewati satu putaran penuh dengan autopilot cepat: lompat ke 85% lalu biarkan melintas start
    await page.evaluate(() => { const pm = window.__game.G.pemain; pm.s = window.__game.G.trek.L * 0.97; });
    await simulasi(page, 2); const j = await info(page);
    cek(`arena ${a + 1} putaran ke-2 terhitung`, j.s > j.L, `s=${j.s}`);
  }
  await page.close();
}

/* ---- telefon (sentuh) ---- */
{
  const page = await halaman({ width: 390, height: 844 }, 'telefon', true);
  await foto(page, '09-menu-hp');
  const lebar = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  cek('tanpa skrol mendatar di HP', lebar);
  await page.tap('[data-uji=garasi]'); await tunggu(300); await foto(page, '10-garasi-hp');
  await page.tap('[data-uji=mobil-2]'); await tunggu(200);
  cek('pilih mobil di garasi', await page.evaluate(() => window.__game.SET.mobil === 2));
  await page.evaluate(() => document.querySelector('#pGarasi [data-kembali]').click()); await tunggu(200);
  await page.tap('[data-uji=arena]'); await tunggu(300); await foto(page, '11-arena-hp');
  await page.tap('[data-uji=arena-0]'); await tunggu(400);
  await page.evaluate(() => document.getElementById('bLewati').click()); await tunggu(200);
  if (await page.evaluate(() => window.__game.mode === 'cerita')) await page.evaluate(() => document.getElementById('bLewati').click());
  await page.evaluate(() => window.__game.lewatiHitung());
  await sampai(page, "window.__game.mode === 'balap'");
  cek('kontrol sentuh tampil', await page.$eval('#kontrolSentuh', (e) => getComputedStyle(e).display !== 'none'));
  // tahan tombol kanan
  const kanan = await page.$('#tKanan'); const bx = await kanan.boundingBox();
  const x0 = (await info(page)).x;
  await page.touchscreen.touchStart(bx.x + bx.width / 2, bx.y + bx.height / 2); await simulasi(page, 0.6);
  const x1 = (await info(page)).x; await page.touchscreen.touchEnd();
  cek('tombol sentuh kanan menggeser mobil', x1 > x0 + 0.5, `${x0} → ${x1}`);
  await page.evaluate(() => window.__game.keGerbang()); await simulasi(page, 0.4);
  await foto(page, '12-balap-hp');
  await page.close();
}

cek('tanpa galat konsol / 404', galat.length === 0, galat.slice(0, 6).join(' | '));
lap.push('', `Ringkasan: ${lulus} lulus, ${gagal} gagal`);
fs.writeFileSync(path.join(OUT, `laporan-${PUT}.md`), lap.join('\n'));
console.log(`\n${lulus} lulus, ${gagal} gagal`);
await browser.close();
