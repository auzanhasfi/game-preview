/* Tangkap sampul 960x600 saat bermain (autopilot). Pakai: node uji/sampul.mjs http://localhost:8991 */
import { createRequire } from 'node:module'; import path from 'node:path'; import url from 'node:url';
const require = createRequire(path.join(process.env.HOME, '.claude/skills/studio-game-web/scripts/package.json'));
const puppeteer = require('puppeteer-core');
const DIR = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage(); await page.setViewport({ width: 960, height: 600 });
await page.goto((process.argv[2] || 'http://localhost:8991') + '/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1500));
await page.evaluate(async () => {
  const G = window.__game; G.mulaiMain(); G.autopilot = true;
  const g = () => G.game; const t0 = g().t; while (g().t - t0 < 7) await new Promise((r) => setTimeout(r, 100));
  G.autopilot = false; g().pesan = []; g().soalJeda = 0; g().soal = null; g().langkah(0.016);
  // satu bola dekat bumper + satu di ramp untuk gambar sampul
  const f = g().fis; f.bola.length = 0; const b = f.tambahBola(250, 250, 0, 0); b.ditahan = 99; const c = f.tambahBola(300, 900, 0, 0); c.ditahan = 99; f.bumper = [1, 0, 0.6];
  G.R.kilauLabel[g().soal.benar] = 0.4;
  document.getElementById('hud').hidden = true; document.getElementById('atas').style.display = 'none';
  const m = await import('/js/08-render.js'); m.pasCamera(4, 4); G.R.cam.clearViewOffset(); G.R.cam.setViewOffset(960, 600, -170, 0, 960, 600); G.R.cam.updateProjectionMatrix();
  const s = g().soal, d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:44px;top:120px;z-index:50;font-family:Geist,system-ui;color:#eef2ff;width:380px';
  d.innerHTML = `<div style="font:600 16px 'IBM Plex Mono',monospace;letter-spacing:.4em;color:#ff8a1f">PINBALL</div><div style="font-weight:900;font-size:84px;line-height:.9;letter-spacing:-.02em">CLAWD</div><div style="margin-top:14px;font-size:20px;color:#9aa6c8">Meja Angka · tembak bola ke jawaban yang benar</div><div style="margin-top:28px;display:inline-block;padding:14px 20px;border-radius:14px;background:#120a04;border:2px solid #2b2b33;font:700 40px 'IBM Plex Mono',monospace;color:#ff8c1a;box-shadow:0 0 24px rgba(255,138,31,.25)">${s.teks} = ?</div>`;
  document.body.appendChild(d);
});
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: path.join(DIR, 'sampul.jpg'), type: 'jpeg', quality: 86 });
await browser.close();
