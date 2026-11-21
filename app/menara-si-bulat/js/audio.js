(function (root) {
  'use strict';
  let ctx = null, master = null, mute = false;
  try { mute = localStorage.getItem('jt.mute') === '1'; } catch (e) {}
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return; ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.25; master.connect(ctx.destination); } catch (e) { ctx = null; }
  }
  function tone(f, t0, d, type, v, to) {
    if (!ctx || mute) return; const o = ctx.createOscillator(), g = ctx.createGain(), n = ctx.currentTime + t0;
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, n); if (to) o.frequency.exponentialRampToValueAtTime(to, n + d);
    g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(v || 0.4, n + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, n + d);
    o.connect(g); g.connect(master); o.start(n); o.stop(n + d + 0.05);
  }
  function noise(t0, d, v) {
    if (!ctx || mute) return; const len = Math.floor(ctx.sampleRate * d), b = ctx.createBuffer(1, len, ctx.sampleRate), a = b.getChannelData(0);
    for (let i = 0; i < len; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; g.gain.value = v || 0.3;
    s.buffer = b; s.connect(f); f.connect(g); g.connect(master); s.start(ctx.currentTime + t0);
  }
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16];
  root.Bunyi = {
    init, get mute() { return mute; },
    toggle() { mute = !mute; try { localStorage.setItem('jt.mute', mute ? '1' : '0'); } catch (e) {} return mute; },
    tap() { tone(520, 0, .06, 'triangle', .25); },
    jatuh() { tone(180, 0, .16, 'sine', .5, 70); noise(0, .1, .25); },
    potong() { noise(0, .14, .35); tone(300, 0, .12, 'square', .12, 160); },
    sempurna(c) { const f = 523 * Math.pow(2, PENTA[Math.min(c, 7)] / 12); tone(f, 0, .18, 'triangle', .45); tone(f * 2, .06, .22, 'sine', .25); },
    menang() { [0, 4, 7, 12, 16].forEach((s, i) => tone(523 * Math.pow(2, s / 12), i * .1, .3, 'triangle', .4)); },
    kalah() { tone(330, 0, .3, 'sawtooth', .22, 120); tone(220, .2, .4, 'sawtooth', .2, 70); noise(.15, .35, .3); }
  };
})(window);
