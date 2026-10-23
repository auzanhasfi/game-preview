// Procedural sound: rain bed, thunder, radio static, footsteps, phone ring,
// stingers, heartbeat. Everything is synthesised; nothing is loaded.
export class Sfx {
  constructor() { this.ctx = null; this.muted = false; this.staticLevel = 0; this.rainLevel = 1; this.heartRate = 0; this.nextBeat = 0; this.ringing = false; this.crackleT = 0; }

  start() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = this.muted ? 0 : 1; this.master.connect(ctx.destination);
    // shared noise buffer
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    // rain bed: filtered noise, slow gusts
    const rain = this.loopNoise(); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400;
    this.rainGain = ctx.createGain(); this.rainGain.gain.value = 0.11;
    rain.connect(hp).connect(lp).connect(this.rainGain).connect(this.master);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lfoG = ctx.createGain(); lfoG.gain.value = 0.025; lfo.connect(lfoG).connect(this.rainGain.gain); lfo.start();
    // radio static
    const st = this.loopNoise(); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.6;
    this.staticGain = ctx.createGain(); this.staticGain.gain.value = 0;
    st.connect(bp).connect(this.staticGain).connect(this.master);
    // low hum (neon / transformer)
    const hum = ctx.createOscillator(); hum.type = 'sawtooth'; hum.frequency.value = 60; const humF = ctx.createBiquadFilter(); humF.type = 'lowpass'; humF.frequency.value = 180;
    this.humGain = ctx.createGain(); this.humGain.gain.value = 0.012; hum.connect(humF).connect(this.humGain).connect(this.master); hum.start();
  }
  loopNoise() { const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.loop = true; s.start(); return s; }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.05); }

  // ---- continuous levels
  setStatic(v) { this.staticLevel = v; if (this.staticGain) this.staticGain.gain.setTargetAtTime(0.4 * v * v, this.ctx.currentTime, 0.08); }
  setRain(v) { if (this.rainGain) this.rainGain.gain.setTargetAtTime(0.11 * v, this.ctx.currentTime, 0.5); }

  // ---- one-shots
  burst(opts) {
    if (!this.ctx) return;
    const c = this.ctx, t0 = c.currentTime + (opts.delay || 0);
    const s = c.createBufferSource(); s.buffer = this.noise; s.loop = true;
    let node = s;
    if (opts.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opts.lp; node.connect(f); node = f; }
    if (opts.hp) { const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = opts.hp; node.connect(f); node = f; }
    if (opts.bp) { const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = opts.bp; f.Q.value = opts.q || 1; node.connect(f); node = f; }
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(opts.gain || 0.2, t0 + (opts.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (opts.attack || 0.01) + (opts.decay || 0.2));
    node.connect(g).connect(this.master);
    s.start(t0, Math.random() * 1.5); s.stop(t0 + (opts.attack || 0.01) + (opts.decay || 0.2) + 0.05);
  }
  tone(freq, opts = {}) {
    if (!this.ctx) return;
    const c = this.ctx, t0 = c.currentTime + (opts.delay || 0);
    const o = c.createOscillator(); o.type = opts.type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slide), t0 + (opts.decay || 0.3));
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(opts.gain || 0.1, t0 + (opts.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (opts.attack || 0.01) + (opts.decay || 0.3));
    let node = o;
    if (opts.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opts.lp; o.connect(f); node = f; }
    node.connect(g).connect(this.master);
    o.start(t0); o.stop(t0 + (opts.attack || 0.01) + (opts.decay || 0.3) + 0.05);
  }
  thunder(delay = 0.4, k = 1) { this.burst({ delay, lp: 160 + 120 * k, gain: 0.5 * k, attack: 0.08, decay: 2.6 + k }); this.burst({ delay: delay + 0.15, lp: 90, gain: 0.35 * k, attack: 0.3, decay: 3.5 }); }
  step(wet) { if (wet) this.burst({ lp: 900, hp: 200, gain: 0.09, attack: 0.01, decay: 0.16 }); else this.burst({ hp: 700, lp: 3500, gain: 0.05, attack: 0.005, decay: 0.07 }); }
  page() { this.burst({ hp: 2500, gain: 0.08, attack: 0.02, decay: 0.3 }); }
  pickup() { this.tone(660, { gain: 0.06, decay: 0.12, slide: 990 }); this.tone(990, { delay: 0.1, gain: 0.05, decay: 0.2 }); }
  zap() { this.burst({ bp: 3800, q: 1.5, gain: 0.35, attack: 0.005, decay: 0.25 }); this.tone(110, { type: 'square', gain: 0.12, decay: 0.25, lp: 800 }); }
  stinger() {
    this.tone(52, { type: 'sawtooth', gain: 0.35, attack: 0.02, decay: 1.4, lp: 500 });
    this.tone(55.5, { type: 'sawtooth', gain: 0.3, attack: 0.02, decay: 1.4, lp: 500 });
    this.burst({ bp: 1200, q: 0.8, gain: 0.4, attack: 0.01, decay: 0.5 });
    this.burst({ hp: 3000, gain: 0.2, attack: 0.005, decay: 0.12 });
  }
  groan(k = 1) { this.tone(70 + Math.random() * 12, { type: 'triangle', gain: 0.06 * k, attack: 0.25, decay: 0.9, lp: 300, slide: 58 }); }
  burn() { this.burst({ hp: 1800, gain: 0.18, attack: 0.05, decay: 1.2 }); this.tone(240, { type: 'sine', gain: 0.05, decay: 1.0, slide: 90 }); }
  shriek() { this.tone(180, { type: 'sawtooth', gain: 0.22, attack: 0.03, decay: 0.55, lp: 1400, slide: 620 }); this.burst({ bp: 2600, q: 1.2, gain: 0.25, attack: 0.02, decay: 0.4 }); }
  // continuous hiss while a hollow is held in the beam (0..1)
  setHeat(v) {
    if (!this.ctx) return;
    if (!this.heatGain) { const s = this.loopNoise(); const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3200; this.heatGain = this.ctx.createGain(); this.heatGain.gain.value = 0; s.connect(f).connect(this.heatGain).connect(this.master); }
    this.heatGain.gain.setTargetAtTime(0.22 * v * v, this.ctx.currentTime, 0.1);
  }
  drain() { this.burst({ lp: 500, gain: 0.25, attack: 3.0, decay: 14 }); }
  gate() { this.burst({ bp: 700, q: 2, gain: 0.25, attack: 0.02, decay: 0.8 }); this.tone(180, { type: 'square', gain: 0.05, decay: 0.6, lp: 600 }); }
  heart(strength = 1) { this.tone(56, { type: 'sine', gain: 0.22 * strength, attack: 0.01, decay: 0.16 }); this.tone(50, { delay: 0.16, type: 'sine', gain: 0.16 * strength, attack: 0.01, decay: 0.2 }); }
  // a voice on a bad line: gated static in speech rhythm
  voice(seconds = 3) { let at = 0; while (at < seconds) { const d = 0.08 + Math.random() * 0.22; this.burst({ delay: at, bp: 900 + Math.random() * 600, q: 2.5, gain: 0.12, attack: 0.02, decay: d }); at += d + 0.04 + Math.random() * 0.12; } }
  ring(on) {
    this.ringing = on;
    if (!on || !this.ctx) return;
    const c = this.ctx;
    const doRing = () => {
      if (!this.ringing) return;
      for (let i = 0; i < 2; i++) { this.tone(440, { delay: i * 0.5, type: 'square', gain: 0.045, attack: 0.01, decay: 0.42, lp: 1800 }); this.tone(480, { delay: i * 0.5, type: 'square', gain: 0.045, attack: 0.01, decay: 0.42, lp: 1800 }); }
      this.ringTimer = setTimeout(doRing, 3600);
    };
    clearTimeout(this.ringTimer); doRing();
  }

  update(dt, t) {
    if (!this.ctx) return;
    // static crackle
    if (this.staticLevel > 0.15) { this.crackleT -= dt; if (this.crackleT <= 0) { this.crackleT = 0.05 + Math.random() * 0.5 / this.staticLevel; this.burst({ hp: 1500, gain: 0.12 * this.staticLevel, attack: 0.002, decay: 0.03 }); } }
    // heartbeat
    if (this.heartRate > 0) { this.nextBeat -= dt; if (this.nextBeat <= 0) { this.nextBeat = 60 / this.heartRate; this.heart(Math.min(1, this.heartRate / 110)); } }
  }
}
