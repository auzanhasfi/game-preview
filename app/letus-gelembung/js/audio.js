/* Bunyi Web Audio sintesis, tiada fail luar. */
(function (root) {
  'use strict';
  let ctx = null, master = null, mute = false;
  try { mute = localStorage.getItem('ctg.mute') === '1'; } catch (e) {}
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    try { const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null; ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination); } catch (e) { ctx = null; }
    return ctx;
  }
  function tone(f, t0, d, type, vol, to) {
    if (!ctx || mute) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), n = ctx.currentTime + t0;
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, n); if (to) o.frequency.exponentialRampToValueAtTime(to, n + d);
    g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(vol || 0.4, n + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, n + d);
    o.connect(g); g.connect(master); o.start(n); o.stop(n + d + 0.03);
  }
  const SK = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
  const nota = i => 523.25 * Math.pow(2, SK[Math.min(i, SK.length - 1)] / 12);
  root.Bunyi = {
    init,
    get mute() { return mute; },
    setMute(m) { mute = !!m; try { localStorage.setItem('ctg.mute', m ? '1' : '0'); } catch (e) {} },
    klik() { init(); tone(660, 0, 0.05, 'triangle', 0.2); },
    tembak() { init(); tone(300, 0, 0.14, 'sine', 0.35, 900); },
    pantul() { init(); tone(520, 0, 0.05, 'triangle', 0.2, 700); },
    letus(i) { init(); const f = nota(i); tone(f, 0, 0.16, 'triangle', 0.45, f * 1.6); tone(f * 2, 0.03, 0.1, 'sine', 0.2); },
    jatuh(k) { init(); tone(700 - k * 40, k * 0.04, 0.12, 'sine', 0.18, 300); },
    salah() { init(); tone(150, 0, 0.22, 'sawtooth', 0.22, 90); tone(120, 0.05, 0.2, 'square', 0.1, 70); },
    baris() { init(); tone(200, 0, 0.1, 'triangle', 0.25, 160); },
    menang() { init(); [0, 4, 7, 12, 16].forEach((s, k) => tone(523.25 * Math.pow(2, s / 12), k * 0.09, 0.3, 'triangle', 0.4)); },
    kalah() { init(); [7, 4, 0, -5].forEach((s, k) => tone(440 * Math.pow(2, s / 12), k * 0.16, 0.28, 'sine', 0.35)); },
    bintang(i) { init(); tone(nota(i + 3), 0, 0.2, 'triangle', 0.4); }
  };
})(window);
