/* Pinball Clawd: efek bunyi meja pinball + musik sintesis (WebAudio, tanpa file luar) — mesin bunyi diadaptasi dari Turbo Clawd */

let ac = null, master = null, musGain = null, sfxGain = null, noiseBuf = null;
let nyala = true, musik = null, langkah = 0, waktuNext = 0, mode = 'lari', intensitas = 0;
const BPM = 132, S16 = 60 / BPM / 4;

function siap() {
  if (ac) return true;
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = nyala ? 0.8 : 0; master.connect(ac.destination);
    const komp = ac.createDynamicsCompressor(); komp.threshold.value = -14; komp.ratio.value = 4; komp.connect(master);
    musGain = ac.createGain(); musGain.gain.value = 0.2; musGain.connect(komp);
    sfxGain = ac.createGain(); sfxGain.gain.value = 0.7; sfxGain.connect(komp);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  } catch (e) { return false; }
}

function nada(f, t0, dur, tipe = 'square', vol = 0.2, tujuan = sfxGain, geser = 0) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = tipe; o.frequency.setValueAtTime(f, t0);
  if (geser) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * geser), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(tujuan); o.start(t0); o.stop(t0 + dur + 0.02);
}
function desis(t0, dur, vol = 0.2, fq = 2000, tipe = 'highpass', tujuan = sfxGain) {
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; f.type = tipe; f.frequency.value = fq;
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(tujuan); s.start(t0); s.stop(t0 + dur + 0.02);
}
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

export const Bunyi = {
  buka() { if (siap() && ac.state === 'suspended') ac.resume(); },
  set(on) { nyala = on; if (master) master.gain.setTargetAtTime(on ? 0.8 : 0, ac.currentTime, 0.05); },
  get nyala() { return nyala; },
  sfx(nama, p = 0) {
    if (!siap() || !nyala) return;
    const t = ac.currentTime;
    switch (nama) {
      case 'flipper': desis(t, 0.05, 0.22, 900, 'bandpass'); nada(140, t, 0.07, 'square', 0.12, sfxGain, 0.5); break;
      case 'flipperTurun': desis(t, 0.03, 0.08, 1400, 'bandpass'); break;
      case 'bumper': nada(midi(76 + (p % 3) * 3), t, 0.09, 'square', 0.1); nada(90, t, 0.12, 'sine', 0.3, sfxGain, 0.5); desis(t, 0.06, 0.18, 2500); break;
      case 'sling': desis(t, 0.07, 0.25, 1800, 'bandpass'); nada(220, t, 0.08, 'square', 0.1, sfxGain, 0.6); break;
      case 'pantul': desis(t, 0.04, Math.min(0.18, p / 9000), 1100, 'bandpass'); break;
      case 'target': nada(160, t, 0.1, 'square', 0.12, sfxGain, 0.5); desis(t, 0.08, 0.2, 700, 'lowpass'); break;
      case 'lajur': nada(midi(84 + p * 2), t, 0.12, 'triangle', 0.14); break;
      case 'inlane': nada(midi(79), t, 0.08, 'triangle', 0.08); break;
      case 'spinner': nada(2400, t, 0.02, 'square', 0.04); break;
      case 'clawd': [67, 74, 79].forEach((n, i) => nada(midi(n), t + i * 0.05, 0.1, 'square', 0.08)); break;
      case 'ramp': desis(t, 0.9, 0.12, 600, 'bandpass'); nada(midi(60), t, 0.6, 'triangle', 0.1, sfxGain, 2); break;
      case 'orbit': desis(t, 0.5, 0.14, 1600, 'bandpass'); nada(midi(72), t, 0.4, 'sawtooth', 0.05, sfxGain, 1.5); break;
      case 'kotak': nada(70, t, 0.25, 'sine', 0.35, sfxGain, 0.6); desis(t, 0.15, 0.2, 500, 'lowpass'); break;
      case 'kotakBuka': [72, 79, 84, 91].forEach((n, i) => nada(midi(n), t + i * 0.07, 0.18, 'square', 0.08)); break;
      case 'kunci': [60, 67, 72, 79].forEach((n, i) => nada(midi(n), t + i * 0.1, 0.25, 'square', 0.1)); break;
      case 'multiball': for (let i = 0; i < 12; i++) nada(midi(60 + (i % 4) * 4 + Math.floor(i / 4) * 12), t + i * 0.06, 0.16, 'square', 0.09); desis(t + 0.4, 0.8, 0.2, 3000); break;
      case 'luncur': nada(90, t, 0.3, 'sine', 0.3, sfxGain, 3); desis(t, 0.25, 0.2, 800, 'bandpass'); break;
      case 'tarik': nada(300, t, 0.5, 'triangle', 0.04, sfxGain, 0.6); break;
      case 'skill': [72, 76, 79, 84, 88, 91].forEach((n, i) => nada(midi(n), t + i * 0.05, 0.2, 'square', 0.09)); break;
      case 'kickback': nada(60, t, 0.3, 'sawtooth', 0.25, sfxGain, 3); desis(t, 0.3, 0.3, 600, 'lowpass'); break;
      case 'benar': [72, 76, 79, 84, 88].forEach((n, i) => nada(midi(n), t + i * 0.05, 0.18, 'triangle', 0.16)); break;
      case 'jackpot': for (let i = 0; i < 10; i++) nada(midi([72, 76, 79, 84][i % 4] + (i > 3 ? 12 : 0)), t + i * 0.07, 0.2, 'square', 0.1); break;
      case 'salah': nada(midi(62), t, 0.18, 'square', 0.1); nada(midi(58), t + 0.14, 0.26, 'square', 0.1); break;
      case 'kombo': [79, 84].forEach((n, i) => nada(midi(n), t + i * 0.05, 0.12, 'square', 0.08)); break;
      case 'ekstra': [60, 64, 67, 72, 67, 72, 76, 79, 84].forEach((n, i) => nada(midi(n), t + i * 0.08, 0.2, 'square', 0.1)); break;
      case 'drain': [67, 63, 60, 55].forEach((n, i) => nada(midi(n), t + i * 0.12, 0.2, 'triangle', 0.14)); break;
      case 'simpan': [72, 79, 72, 79].forEach((n, i) => nada(midi(n), t + i * 0.08, 0.1, 'square', 0.08)); break;
      case 'goyang': nada(70, t, 0.15, 'sine', 0.3, sfxGain, 0.7); desis(t, 0.1, 0.15, 400, 'lowpass'); break;
      case 'awas': nada(880, t, 0.15, 'square', 0.1); nada(880, t + 0.25, 0.15, 'square', 0.1); break;
      case 'tilt': nada(110, t, 1.2, 'sawtooth', 0.2, sfxGain, 0.5); break;
      case 'bonus': nada(midi(72 + (p % 12)), t, 0.06, 'square', 0.07); break;
      case 'bonusX': [76, 81, 88].forEach((n, i) => nada(midi(n), t + i * 0.06, 0.14, 'square', 0.08)); break;
      case 'selesai': [72, 67, 64, 60, 55, 48].forEach((n, i) => nada(midi(n), t + i * 0.16, 0.3, 'triangle', 0.14)); break;
      case 'klik': nada(1200, t, 0.03, 'square', 0.05); break;
      case 'antarBola': nada(1800, t, 0.03, 'sine', 0.08); break;
    }
  },
  musikMulai(m = 'lari') { if (!siap()) return; mode = m; if (musik) return; langkah = 0; waktuNext = ac.currentTime + 0.05; musik = setInterval(jadwal, 25); },
  musikMode(m) { mode = m; },
  musikIntensitas(v) { intensitas = v; },
  musikStop() { if (musik) clearInterval(musik); musik = null; }
};

/* pola musik: progresi I–V–vi–IV (lari), i–VI–III–VII minor (bos), lembut di menu */
const PROG = { lari: [[45, 57, 64, 69, 73], [40, 52, 59, 64, 68], [42, 54, 61, 66, 69], [38, 50, 57, 62, 66]], bos: [[45, 57, 60, 64, 69], [41, 53, 57, 60, 65], [36, 48, 55, 60, 64], [43, 55, 59, 62, 67]] };
PROG.menu = PROG.lari;
function jadwal() {
  if (!nyala) { waktuNext = ac.currentTime + 0.05; return; }
  while (waktuNext < ac.currentTime + 0.12) {
    const t = waktuNext, s = langkah % 16, bar = Math.floor(langkah / 16) % 4, ch = PROG[mode][bar], menu = mode === 'menu';
    if (!menu) {
      if (s % 4 === 0) nada(150, t, 0.16, 'sine', 0.5, musGain, 0.3);
      if (s % 4 === 2) desis(t, 0.05, 0.08, 7000, 'highpass', musGain);
      if (s === 4 || s === 12) desis(t, 0.14, 0.18, 1800, 'bandpass', musGain);
      if (intensitas > 0.5 && s % 2 === 1) desis(t, 0.03, 0.05, 9000, 'highpass', musGain);
    } else if (s % 8 === 0) nada(110, t, 0.2, 'sine', 0.25, musGain, 0.5);
    const bas = [0, 0, 12, 0, 0, 12, 0, 7][s % 8];
    if (s % 2 === 0) nada(midi(ch[0] + bas), t, S16 * 1.7, 'sawtooth', menu ? 0.05 : 0.09, musGain);
    const arp = [1, 2, 3, 4, 3, 2, 4, 3][s % 8];
    nada(midi(ch[arp] + 12), t, S16 * 0.9, 'square', menu ? 0.025 : 0.035 + intensitas * 0.02, musGain);
    if (mode !== 'menu' && s % 8 === 0 && bar % 2 === 0) nada(midi(ch[4] + 24), t, S16 * 6, 'triangle', 0.05, musGain);
    langkah++; waktuNext += S16;
  }
}
