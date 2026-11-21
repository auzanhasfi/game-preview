// Bunyi Web Audio sintesis, tiada fail luar.
window.SFX = (function () {
  let ctx = null, hidup = true;
  function c() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function nada(f, d, jenis, v, t0, f2) {
    const a = c(); if (!a || !hidup) return;
    try {
      const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (t0 || 0);
      o.type = jenis || 'sine'; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.12, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + 0.03);
    } catch (e) {}
  }
  return {
    set(b) { hidup = !!b; }, aktif() { return hidup; },
    pilih() { nada(660, 0.07, 'triangle', 0.09); },
    tuang(pct) { const f = 1500 + pct * 900; nada(f, 0.13, 'triangle', 0.11); nada(f * 1.5, 0.09, 'sine', 0.07, 0.05); },
    penuh(kombo) { const k = Math.min(kombo, 6), b = 523 * Math.pow(1.122, (k - 1) * 2); [1, 1.25, 1.5, 2].forEach((m, i) => nada(b * m, 0.16, 'triangle', 0.12, i * 0.07)); },
    salah() { nada(220, 0.28, 'sawtooth', 0.09, 0, 110); },
    tukar() { nada(500, 0.06, 'square', 0.05); nada(750, 0.06, 'square', 0.05, 0.06); },
    tahapSiap() { [523, 659, 784, 1047].forEach((f, i) => nada(f, 0.2, 'triangle', 0.12, i * 0.1)); },
    menang() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => nada(f, 0.22, 'triangle', 0.12, i * 0.11)); },
    kalah() { [392, 330, 262].forEach((f, i) => nada(f, 0.3, 'sine', 0.12, i * 0.18)); }
  };
})();
