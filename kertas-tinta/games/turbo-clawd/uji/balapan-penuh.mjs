/* Simulasi balapan penuh dengan autopilot untuk cek keseimbangan. Pakai: node uji/balapan-penuh.mjs http://localhost:8990 <arena> [salah] */
import { createRequire } from 'node:module'; import path from 'node:path';
const require = createRequire(path.join(process.env.HOME, '.claude/skills/studio-game-web/scripts/package.json'));
const puppeteer = require('puppeteer-core');
const [BASE = 'http://localhost:8990', A = '0', MODE = ''] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const page = await browser.newPage(); await page.setViewport({ width: 640, height: 360 });
const galat = []; page.on('pageerror', (e) => galat.push(e.message));
await page.goto(BASE + '/', { waitUntil: 'networkidle0' }); await new Promise((r) => setTimeout(r, 1200));
const hasil = await page.evaluate(async (a, mode) => {
  const g = window.__game; g.SET.buka = 4; g.mulai(+a);
  await new Promise((r) => setTimeout(r, 300)); document.getElementById('bLewati').click();
  await new Promise((r) => setTimeout(r, 200)); g.lewatiHitung(); g.autopilot = mode || true;
  let kena = 0; const lama = g.G.ev; g.G.ev = (j, r, d) => { if (j === 'kena' && r === g.G.pemain) kena++; lama(j, r, d); };
  const t0 = performance.now(); const jejak = [];
  while (g.mode !== 'hasil' && performance.now() - t0 < 400000) { await new Promise((r) => setTimeout(r, 500)); const i = g.info(); if (jejak.length < 400) jejak.push(i.pos); }
  const ur = g.G.pembalap.slice().sort((x, y) => (y.selesai - x.selesai) || (x.selesai ? x.waktuFinis - y.waktuFinis : y.s - x.s));
  return { mode: g.mode, waktu: g.G.pemain.waktuFinis.toFixed(1), kena, info: g.info(), urutan: ur.map((r) => r.nama + (r.selesai ? ' ' + r.waktuFinis.toFixed(1) : ' s=' + r.s.toFixed(0))), posSepanjang: jejak.filter((_, i) => i % 6 === 0).join('') };
}, A, MODE);
console.log(JSON.stringify(hasil, null, 1)); console.log('galat:', galat);
await browser.close();
