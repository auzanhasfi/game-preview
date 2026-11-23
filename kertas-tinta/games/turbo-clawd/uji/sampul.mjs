/* Tangkap sampul 960x600 dari layar menu. Pakai: node uji/sampul.mjs http://localhost:8990 */
import { createRequire } from 'node:module'; import path from 'node:path'; import url from 'node:url';
const require = createRequire(path.join(process.env.HOME, '.claude/skills/studio-game-web/scripts/package.json'));
const puppeteer = require('puppeteer-core');
const DIR = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage(); await page.setViewport({ width: 960, height: 600 });
await page.goto((process.argv[2] || 'http://localhost:8990') + '/', { waitUntil: 'networkidle0' });
await page.evaluate(() => { const g = window.__game.G; g.pembalap.forEach((r, i) => { r.s = 600 + i * 4; }); });
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: path.join(DIR, 'sampul.jpg'), type: 'jpeg', quality: 86 });
await browser.close();
