'use strict';
/* Bunyi Web Audio sintesis; tiada fail luar. */
var Bunyi = (function () {
  var ctx = null, on = true;
  function c() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function nada(f, t0, d, jenis, vol, f2) {
    var a = on && c(); if (!a) return;
    var t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = jenis || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + 0.05);
  }
  return {
    aktif: function (v) { if (v !== undefined) on = !!v; return on; },
    buka: function () { c(); },
    tap: function () { nada(520, 0, 0.07, 'triangle', 0.08); },
    koin: function () { nada(1760, 0, 0.12, 'square', 0.04); nada(2349, 0.05, 0.22, 'sine', 0.07); },
    betul: function () { nada(660, 0, 0.12, 'sine', 0.12); nada(880, 0.1, 0.18, 'sine', 0.12); },
    kombo: function (n) { var b = 660 * Math.pow(1.122, Math.min(n, 6)); nada(b, 0, 0.1, 'triangle', 0.1); nada(b * 1.5, 0.08, 0.2, 'triangle', 0.1); },
    salah: function () { nada(220, 0, 0.22, 'sawtooth', 0.08, 140); },
    masuk: function () { nada(1318, 0, 0.18, 'sine', 0.07); nada(988, 0.12, 0.24, 'sine', 0.06); },
    pergi: function () { nada(400, 0, 0.35, 'sawtooth', 0.07, 160); },
    menang: function () { [523, 659, 784, 1047].forEach(function (f, i) { nada(f, i * 0.12, 0.3, 'triangle', 0.12); }); },
    kalah: function () { [392, 330, 262].forEach(function (f, i) { nada(f, i * 0.18, 0.35, 'sine', 0.12); }); }
  };
})();
