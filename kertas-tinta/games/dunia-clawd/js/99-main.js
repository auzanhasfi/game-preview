/* Dunia Clawd: titik mula + kait ujian */
import { E, mulaEnjin, setSemula, lantaiDi } from './08-enjin.js';
import { S, muat, simpan } from './05-simpan.js';
import { pasangHud, tanya } from './13-hud.js';
import { mula, keluar, masuk, masukSemula, paparPlatform, PENGALAMAN } from './14-platform.js';

async function boot() {
  muat();
  try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1800))]); } catch (e) {}
  mulaEnjin(document.getElementById('kanvas'));
  pasangHud(keluar, () => { if (!E.aktif) paparPlatform(); }, masukSemula);
  mula();
  document.getElementById('memuat').hidden = true;
  window.__game = {
    E, S, tanya, setSemula, lantaiDi,
    masuk: (id) => masuk(PENGALAMAN.find((p) => p.id === id)),
    keluar,
    tp(x, y, z) { E.P.pos.set(x, y, z); E.P.vel.set(0, 0, 0); },
    jawabUji(betul) { const b = [...document.querySelectorAll('#hSoalBox .j')].find((x) => x.dataset.betul === String(betul)); if (b) b.click(); return !!b; },
    info: () => ({ aktif: E.aktif, dunia: E.dunia?.mod.id, x: E.P?.pos.x, y: E.P?.pos.y, z: E.P?.pos.z, tanah: E.P?.diTanah, mati: E.P?.mati, fps: Math.round(E.fps), tahan: E.tahan, cbux: S.cbux, solid: E.dunia?.solid.length, panggilan: E.renderer.info.render.calls, segitiga: E.renderer.info.render.triangles }),
    uji: () => E.dunia?.mod.uji
  };
}
boot().catch((e) => { console.error(e); document.getElementById('memuat').innerHTML = '<div class="lm"><h2>Maaf, peranti ini tidak dapat membuka WebGL.</h2><p class="dim">' + String(e.message || e) + '</p></div>'; });
