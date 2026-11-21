/* Bunyi Web Audio sintesis, tiada fail luar. */
(function (root) {
  'use strict';
  let ctx = null, master = null, mute = false;
  try { mute = localStorage.getItem('gg.mute') === '1'; } catch (e) {}
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
  const SKALA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
  const nota = i => 523.25 * Math.pow(2, SKALA[Math.min(i, SKALA.length - 1)] / 12);
  const A = {
    init,
    get mute() { return mute; },
    setMute(m) { mute = !!m; try { localStorage.setItem('gg.mute', m ? '1' : '0'); } catch (e) {} },
    geser() { init(); tone(220, 0, 0.06, 'triangle', 0.16, 180); },
    /* i = indeks dalam rantai (naik nada), kind = + - * */
    gabung(i, kind) {
      init();
      const f = nota(i);
      if (kind === '-') { tone(f * 1.5, 0, 0.12, 'triangle', 0.4, f * 0.75); tone(f * 2, 0.04, 0.08, 'sine', 0.18); }
      else if (kind === '*') { tone(f, 0, 0.18, 'square', 0.16); tone(f * 1.5, 0.05, 0.18, 'triangle', 0.35); }
      else { tone(f, 0, 0.2, 'triangle', 0.45); tone(f * 2, 0.02, 0.14, 'sine', 0.2); }
    },
    buntu() { init(); tone(110, 0, 0.12, 'sawtooth', 0.12, 80); },
    menang() { init(); [0, 4, 7, 12, 16].forEach((s, k) => tone(523.25 * Math.pow(2, s / 12), k * 0.09, 0.3, 'triangle', 0.4)); },
    kalah() { init(); [7, 4, 0].forEach((s, k) => tone(392 * Math.pow(2, (s - 7) / 12), k * 0.14, 0.3, 'sine', 0.35)); },
    klik() { init(); tone(660, 0, 0.05, 'sine', 0.25); }
  };
  root.GGAUDIO = A;
})(typeof self !== 'undefined' ? self : this);
