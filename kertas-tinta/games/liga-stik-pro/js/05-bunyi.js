'use strict';
// Bunyi sintesis WebAudio (tanpa fail luar): peluit, tendangan, sorak penonton, jaring, benar/salah.
(function () {
  let ctx = null, utama = null, sorak = null, sorakGain = null, hidup = G.simpan.baca('suara', true);
  function siap() {
    if (ctx || !hidup) return ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      utama = ctx.createGain(); utama.gain.value = .55; utama.connect(ctx.destination);
      // dengung penonton: derau cokelat lewat bandpass
      const n = ctx.sampleRate * 2, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      let last = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last * 3.2; }
      sorak = ctx.createBufferSource(); sorak.buffer = buf; sorak.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = .6;
      sorakGain = ctx.createGain(); sorakGain.gain.value = 0;
      sorak.connect(bp); bp.connect(sorakGain); sorakGain.connect(utama); sorak.start();
    } catch (e) { ctx = null; }
    return ctx;
  }
  function nada(f, dur, tipe = 'sine', vol = .3, t0 = 0, geser = 0) {
    if (!siap()) return; const t = ctx.currentTime + t0;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = tipe; o.frequency.setValueAtTime(f, t);
    if (geser) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + geser), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g); g.connect(utama); o.start(t); o.stop(t + dur + .05);
  }
  function derau(dur, f, vol = .3, t0 = 0, q = 1) {
    if (!siap()) return; const t = ctx.currentTime + t0, n = Math.ceil(ctx.sampleRate * dur);
    const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(); s.buffer = b; const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q;
    const g = ctx.createGain(); g.gain.value = vol; s.connect(fl); fl.connect(g); g.connect(utama); s.start(t);
  }
  function peluit(dur = .35, t0 = 0) {
    if (!siap()) return; const t = ctx.currentTime + t0;
    const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 2650; lfo.frequency.value = 38; lg.gain.value = 120; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16, t + .02); g.gain.setValueAtTime(.16, t + dur - .05); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(utama); o.start(t); lfo.start(t); o.stop(t + dur + .05); lfo.stop(t + dur + .05);
  }
  G.bunyi = {
    buka() { siap(); if (ctx && ctx.state === 'suspended') ctx.resume(); },
    get hidup() { return hidup; },
    alih() { hidup = !hidup; G.simpan.tulis('suara', hidup); if (!hidup && ctx) { ctx.close(); ctx = null; } else siap(); return hidup; },
    tendang(k = .5) { nada(120 + k * 60, .12, 'sine', .22 + k * .25, 0, -70); derau(.05, 1800, .12 + k * .15); },
    peluit(n = 1) { for (let i = 0; i < n; i++) peluit(n === 3 && i === 2 ? .9 : .32, i * .45); },
    jaring() { derau(.4, 500, .25, 0, .7); },
    tiang() { nada(900, .3, 'triangle', .15); nada(1350, .25, 'sine', .08); },
    sorak(tingkat) { if (sorakGain && ctx) sorakGain.gain.setTargetAtTime(G.clamp(tingkat, 0, 1) * .5, ctx.currentTime, .4); },
    gol() { derau(1.6, 900, .5, 0, .4); derau(2.2, 1500, .3, .2, .5); },
    klik() { nada(660, .06, 'triangle', .12); },
    benar() { nada(660, .12, 'triangle', .22); nada(880, .14, 'triangle', .22, .1); nada(1320, .2, 'triangle', .18, .2); },
    salah() { nada(260, .25, 'sawtooth', .1, 0, -80); },
    tik() { nada(1200, .03, 'square', .04); }
  };
})();
