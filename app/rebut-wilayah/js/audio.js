/* Bunyi Web Audio sintesis, tiada fail luar. */
(function (root) {
  'use strict';
  let ctx = null, master = null, mute = false;
  try { mute = localStorage.getItem('rw.mute') === '1'; } catch (e) {}
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    try { const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null; ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination); } catch (e) { ctx = null; }
    return ctx;
  }
  function tone(f, t0, d, type, vol, to) {
    if (!ctx || mute) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + t0;
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .4, t + .012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .03);
  }
  const N = s => 440 * Math.pow(2, (s - 9) / 12);
  const A = {
    init: init,
    get mute() { return mute; },
    setMute: function (m) { mute = !!m; try { localStorage.setItem('rw.mute', m ? '1' : '0'); } catch (e) {} },
    klik: function () { init(); tone(660, 0, .05, 'sine', .22); },
    keluar: function () { init(); tone(392, 0, .07, 'triangle', .25, 523); },
    ekor: function (n) { init(); tone(300 + Math.min(n, 20) * 14, 0, .035, 'triangle', .09); },
    tawan: function (gp, luas) { // lebih luas = lebih tinggi/panjang
      init(); const k = Math.min(5, 2 + Math.floor(gp / 4));
      for (let i = 0; i < k; i++) tone(N([0, 4, 7, 12, 16, 19][i]), i * .06, .2, 'triangle', .36);
      if (luas) tone(N(24), k * .06, .3, 'sine', .22);
    },
    terlebih: function () { init(); tone(260, 0, .14, 'square', .14, 200); tone(200, .12, .2, 'square', .14, 130); },
    potong: function () { init(); tone(180, 0, .28, 'sawtooth', .22, 60); tone(90, .05, .3, 'square', .12); },
    menang: function () { init(); [0, 4, 7, 12, 16, 19, 24].forEach(function (s, k) { tone(N(s), k * .09, .32, 'triangle', .4); }); },
    kalah: function () { init(); [7, 4, 0, -5].forEach(function (s, k) { tone(N(s), k * .16, .34, 'sine', .35); }); }
  };
  root.RWAUDIO = A;
})(typeof self !== 'undefined' ? self : this);
