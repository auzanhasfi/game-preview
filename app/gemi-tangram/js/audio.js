/* Bunyi Web Audio sintesis, tiada fail luar. */
(function (root) {
  'use strict';
  let ctx = null, master = null, mute = false;
  try { mute = localStorage.getItem('tg.mute') === '1'; } catch (e) {}
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    try {
      const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
  }
  function tone(freq, t0, dur, type, vol, slideTo) {
    if (!ctx || mute) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, ctx.currentTime + t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + t0 + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.5, ctx.currentTime + t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + dur);
    o.connect(g); g.connect(master); o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + dur + 0.03);
  }
  const nota = s => 523.25 * Math.pow(2, s / 12);
  const A = {
    init,
    get mute() { return mute; },
    setMute(m) { mute = !!m; try { localStorage.setItem('tg.mute', m ? '1' : '0'); } catch (e) {} },
    ambil() { init(); tone(330, 0, 0.05, 'triangle', 0.18, 400); },
    lepas() { init(); tone(260, 0, 0.05, 'sine', 0.15, 200); },
    putar() { init(); tone(520, 0, 0.05, 'square', 0.08, 640); },
    balik() { init(); tone(600, 0, 0.07, 'triangle', 0.2, 380); tone(380, 0.05, 0.07, 'triangle', 0.18, 600); },
    /* klik padanan, nada naik ikut bilangan kepingan terpasang */
    snap(n) { init(); tone(nota([0, 2, 4, 5, 7, 9, 11, 12][Math.min(n, 7)]), 0, 0.16, 'triangle', 0.4); tone(180, 0, 0.04, 'square', 0.18, 120); },
    salah() { init(); tone(150, 0, 0.12, 'sawtooth', 0.12, 110); },
    petunjuk() { init(); tone(880, 0, 0.1, 'sine', 0.22); tone(1175, 0.09, 0.14, 'sine', 0.2); },
    pecahan(i) { init(); tone(nota([0, 4, 7, 9, 12, 14, 16][Math.min(i, 6)]), 0, 0.12, 'sine', 0.3); },
    menang() { init(); [0, 4, 7, 12, 16, 19].forEach((s, k) => tone(nota(s), k * 0.09, 0.3, 'triangle', 0.4)); },
    klik() { init(); tone(660, 0, 0.05, 'sine', 0.25); }
  };
  root.TGAUDIO = A;
})(typeof self !== 'undefined' ? self : this);
