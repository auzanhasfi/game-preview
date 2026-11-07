/* Clawd Kilat: efek bunyi + musik sintesis 150 BPM (WebAudio, tanpa file luar) */

let ac = null, master = null, musGain = null, sfxGain = null, noiseBuf = null;
let nyala = true, musik = null, langkah = 0, waktuNext = 0, mode = 'lari', intensitas = 0;
const BPM = 150, S16 = 60 / BPM / 4;

function siap() {
  if (ac) return true;
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = nyala ? 0.8 : 0; master.connect(ac.destination);
    const komp = ac.createDynamicsCompressor(); komp.threshold.value = -14; komp.ratio.value = 4; komp.connect(master);
    musGain = ac.createGain(); musGain.gain.value = 0.42; musGain.connect(komp);
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
      case 'koin': { const n = 84 + Math.min(p, 12); nada(midi(n), t, 0.08, 'square', 0.09); nada(midi(n + 7), t + 0.045, 0.14, 'square', 0.08); break; }
      case 'lompat': nada(300, t, 0.18, 'square', 0.1, sfxGain, 2.6); break;
      case 'guling': desis(t, 0.22, 0.18, 900, 'bandpass'); nada(220, t, 0.16, 'triangle', 0.12, sfxGain, 0.5); break;
      case 'lajur': desis(t, 0.08, 0.1, 3000); break;
      case 'mentok': nada(110, t, 0.08, 'square', 0.12); break;
      case 'mendarat': nada(90, t, 0.07, 'sine', 0.2, sfxGain, 0.6); break;
      case 'musuh': nada(660, t, 0.06, 'square', 0.14); nada(990, t + 0.05, 0.12, 'square', 0.12); desis(t, 0.2, 0.2, 1500); break;
      case 'kena': nada(200, t, 0.35, 'sawtooth', 0.22, sfxGain, 0.3); desis(t, 0.3, 0.3, 600, 'lowpass'); break;
      case 'koinHambur': for (let i = 0; i < 6; i++) nada(midi(88 - i * 2), t + i * 0.04, 0.09, 'square', 0.06); break;
      case 'kilat': desis(t, 0.9, 0.35, 400, 'highpass'); nada(110, t, 0.9, 'sawtooth', 0.18, sfxGain, 4); nada(220, t + 0.05, 0.6, 'square', 0.1, sfxGain, 3); break;
      case 'kilatSiap': [72, 76, 79, 84].forEach((n, i) => nada(midi(n), t + i * 0.06, 0.12, 'square', 0.08)); break;
      case 'pegas': nada(180, t, 0.5, 'sine', 0.25, sfxGain, 5); nada(360, t, 0.3, 'square', 0.06, sfxGain, 3); break;
      case 'pad': nada(midi(76), t, 0.1, 'sawtooth', 0.08); nada(midi(83), t + 0.06, 0.14, 'sawtooth', 0.08); desis(t, 0.3, 0.15, 2500); break;
      case 'benar': [72, 76, 79, 84, 88].forEach((n, i) => nada(midi(n), t + i * 0.05, 0.18, 'triangle', 0.16)); break;
      case 'salah': nada(midi(62), t, 0.18, 'square', 0.1); nada(midi(58), t + 0.14, 0.26, 'square', 0.1); break;
      case 'kombo': [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => nada(midi(n), t + i * 0.04, 0.2, 'square', 0.08)); desis(t + 0.2, 0.6, 0.2, 3000); break;
      case 'power': [67, 71, 74, 79].forEach((n, i) => nada(midi(n), t + i * 0.05, 0.14, 'triangle', 0.15)); break;
      case 'perisaiPecah': desis(t, 0.4, 0.3, 2500); nada(880, t, 0.3, 'sine', 0.1, sfxGain, 0.5); break;
      case 'sirene': for (let i = 0; i < 3; i++) { nada(600, t + i * 0.5, 0.25, 'sawtooth', 0.08, sfxGain, 1.4); nada(840, t + i * 0.5 + 0.25, 0.25, 'sawtooth', 0.08, sfxGain, 0.7); } break;
      case 'bom': desis(t, 0.6, 0.45, 400, 'lowpass'); nada(80, t, 0.5, 'sine', 0.35, sfxGain, 0.4); break;
      case 'lempar': nada(500, t, 0.25, 'triangle', 0.1, sfxGain, 0.4); break;
      case 'bosKena': desis(t, 0.5, 0.4, 800, 'lowpass'); nada(120, t, 0.4, 'square', 0.25, sfxGain, 0.5); nada(midi(84), t + 0.1, 0.2, 'square', 0.08); break;
      case 'menang': [60, 64, 67, 72, 67, 72, 76, 79, 84].forEach((n, i) => nada(midi(n), t + i * 0.09, 0.22, 'square', 0.1)); break;
      case 'hitung': nada(midi(p ? 84 : 72), t, p ? 0.4 : 0.15, 'square', 0.12); break;
      case 'tumbang': [67, 63, 60, 55].forEach((n, i) => nada(midi(n), t + i * 0.14, 0.2, 'triangle', 0.16)); break;
      case 'klik': nada(1200, t, 0.03, 'square', 0.05); break;
      case 'zona': [64, 67, 71, 76].forEach((n, i) => nada(midi(n), t + i * 0.1, 0.3, 'triangle', 0.12)); break;
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
