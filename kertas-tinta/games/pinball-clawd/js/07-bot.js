/* Pinball Clawd: pemain otomatis (mode demo di menu + uji otomatis).
   Teknik pinball sungguhan: tangkap bola di flipper terangkat, turunkan supaya bola menggelinding, pukul saat posisinya pas. */

// posisi bola sepanjang flipper (0 = pangkal, 1 = ujung) untuk tiap tembakan, hasil kalibrasi uji/kalibrasi.mjs
export const BIDIK = {
  0: { 3: 0.64, 2: 0.38, tengah: 0.26, oper: 0.44 },  // flipper kiri: orbit kanan, ramp kanan
  1: { 0: 0.62, 1: 0.5, tengah: 0.26, oper: 0.44 }    // flipper kanan: orbit kiri, ramp kiri
};

export function buatBot() { return { st: [{ f: 'bebas', w: 0 }, { f: 'bebas', w: 0 }], tujuan: null }; }

function posPadaFlipper(F, b) {
  const ux = Math.cos(F.a), uy = Math.sin(F.a);
  const tt = ((b.x - F.px) * ux + (b.y - F.py) * uy) / F.L;
  const jarak = Math.abs(-(b.x - F.px) * uy + (b.y - F.py) * ux);
  return { tt, jarak };
}

/* mode: 'benar' | 'salah' | 'acak' | 'biasa' ; tt khusus (kalibrasi) lewat bot.paksa = {sisi, tt} */
export function botLangkah(game, bot, dt, mode = 'benar') {
  const fis = game.fis;
  if (game.fase !== 'main') { game.tekan(0, false); game.tekan(1, false); return; }
  // luncurkan bola di plunger
  if (game.adaDiPlunger() && !(game.antrian > 0 && game.otomatis)) {
    if (!fis.menarik) game.tarikPlunger(true); else if (fis.tarik > (bot.kuat || 0.75)) game.tarikPlunger(false);
  }
  for (const sisi of [0, 1]) {
    const F = fis.flip[sisi], s = bot.st[sisi]; s.w += dt;
    // bola terdekat: di atas flipper terangkat (bisa ditangkap) atau sudah di atas flipper diam (harus dipukul)
    let b = null, pos = null, tangkap = null;
    const ua = Math.cos(F.naik), va = Math.sin(F.naik); let nx = va, ny = -ua; if (ny > 0) { nx = -nx; ny = -ny; }
    for (const bb of fis.bola) {
      if (bb.rel || bb.ditahan > 0) continue;
      const p = posPadaFlipper(F, bb);
      if (p.tt > -0.25 && p.tt < 1.15 && p.jarak < 40 && bb.y > F.py - 70) { if (!b || bb.y > b.y) { b = bb; pos = p; } }
      const ttN = ((bb.x - F.px) * ua + (bb.y - F.py) * va) / F.L, dUp = (bb.x - F.px) * nx + (bb.y - F.py) * ny;
      if (ttN > -0.7 && ttN < 1.1 && dUp > 22 && dUp < 170 && bb.vy > 0 && (bb.vy > 0 || true)) tangkap = bb;
    }
    const tujuanTT = () => {
      if (bot.paksa && bot.paksa.sisi === sisi) return bot.paksa.tt;
      const soal = game.soal; let k = null;
      if (soal && mode !== 'biasa') {
        if (mode === 'benar') k = soal.benar; else if (mode === 'salah') k = (soal.benar + 1) % 4; else k = Math.floor(Math.random() * 4);
      }
      if (k !== null && BIDIK[sisi][k] !== undefined) return BIDIK[sisi][k];
      if (k !== null) return BIDIK[sisi].oper; // tembakan ini dari flipper seberang: oper bola
      return game.kotakBuka || Math.random() < 0.4 ? BIDIK[sisi].tengah : [BIDIK[sisi].oper, 0.62, 0.45][Math.floor(Math.random() * 3)];
    };
    switch (s.f) {
      case 'bebas':
        game.tekan(sisi, false);
        if (tangkap && !b && !bot.tanpaTangkap) { game.tekan(sisi, true); s.f = 'tangkap'; s.w = 0; }
        else if (b && b.vy > -50) { game.tekan(sisi, true); s.f = 'pukul'; s.w = 0; }
        break;
      case 'tangkap': // tahan sampai bola diam di pangkal
        game.tekan(sisi, true);
        if (!b) { if (s.w > 1.2 || (!tangkap && s.w > 0.5)) { s.f = 'bebas'; } break; }
        if (Math.hypot(b.vx, b.vy) < 60 && s.w > 0.35) { s.f = 'turun'; s.w = 0; s.tt = tujuanTT(); }
        else if (s.w > 2.5) { s.f = 'pukul'; s.w = 0; }
        break;
      case 'turun': // turunkan flipper, bola menggelinding ke ujung
        game.tekan(sisi, false);
        if (s.tt === null) { // oper ke flipper seberang: pukul pelan dekat pangkal
          if (s.w > 0.12) { game.tekan(sisi, true); s.f = 'pukul'; s.w = 0; }
          break;
        }
        if (!b) { s.f = 'bebas'; break; }
        if (pos.tt >= s.tt || s.w > 1.2) { game.tekan(sisi, true); s.f = 'pukul'; s.w = 0; }
        break;
      case 'pukul':
        game.tekan(sisi, true);
        if (s.w > 0.28) { game.tekan(sisi, false); s.f = 'jeda'; s.w = 0; }
        break;
      case 'jeda':
        game.tekan(sisi, false);
        if (s.w > 0.12) s.f = 'bebas';
        break;
    }
  }
}
