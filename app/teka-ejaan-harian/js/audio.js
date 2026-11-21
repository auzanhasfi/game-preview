/* Bunyi Web Audio sintesis. */
(function (root) {
  'use strict';
  let ctx = null, senyap = false;
  try { senyap = localStorage.getItem('teja-senyap') === '1'; } catch (e) {}
  function ac() { try { if (!ctx) ctx = new (root.AudioContext || root.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { ctx = null; } return ctx; }
  function nada(f, t0, dur, jenis, vol) {
    const c = ac(); if (!c || senyap) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + (t0 || 0);
    o.type = jenis || 'sine'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  const SKALA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  root.BUNYI = {
    get senyap() { return senyap; },
    tukar() { senyap = !senyap; try { localStorage.setItem('teja-senyap', senyap ? '1' : '0'); } catch (e) {} return senyap; },
    ketik() { nada(660, 0, 0.05, 'triangle', 0.06); },
    padam() { nada(330, 0, 0.05, 'triangle', 0.05); },
    ralat() { nada(150, 0, 0.18, 'sawtooth', 0.07); nada(130, 0.1, 0.2, 'sawtooth', 0.06); },
    petak(h, i) { nada(h === 't' ? SKALA[Math.min(i, 5) % 6] * 1.5 : h === 'a' ? 440 : 220, 0, 0.16, h === 'x' ? 'triangle' : 'sine', 0.1); },
    menang() { [0, 2, 3, 5].forEach((k, i) => nada(SKALA[k], i * 0.11, 0.3, 'triangle', 0.13)); nada(SKALA[5] * 1.5, 0.5, 0.5, 'sine', 0.1); },
    kalah() { [392, 330, 262].forEach((f, i) => nada(f, i * 0.16, 0.28, 'triangle', 0.1)); },
    klik() { nada(520, 0, 0.06, 'square', 0.04); }
  };
})(window);
