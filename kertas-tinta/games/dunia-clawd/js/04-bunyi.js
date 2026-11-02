/* Dunia Clawd: bunyi & muzik sintesis Web Audio (tiada fail luar) */
import { S } from './05-simpan.js';

let ac = null, bufBising = null, master = null;
export function mulaAudio() {
  if (!ac) {
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
      const n = ac.sampleRate * 0.6; bufBising = ac.createBuffer(1, n, ac.sampleRate); const d = bufBising.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { return; }
  }
  if (ac.state === 'suspended') ac.resume();
}
function nada(f1, f2, dur, jenis = 'triangle', vol = 0.06, tunda = 0) {
  if (!ac || !S.bunyi) return;
  const t0 = ac.currentTime + tunda, o = ac.createOscillator(), g = ac.createGain();
  o.type = jenis; o.frequency.setValueAtTime(f1, t0); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
}
function bising(dur, vol, frek) {
  if (!ac || !S.bunyi) return;
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = bufBising; f.type = 'lowpass'; f.frequency.value = frek;
  g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.0008, ac.currentTime + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(); s.stop(ac.currentTime + dur);
}
const seri = (nota, jarak, dur = 0.18, jenis = 'triangle', vol = 0.07) => nota.forEach((f, i) => nada(f, 0, dur, jenis, vol, i * jarak));
const BUNYI = {
  lompat: () => nada(330, 620, 0.12, 'square', 0.022),
  tapak: () => bising(0.05, 0.035, 900),
  koin: () => { nada(1568, 0, 0.07, 'square', 0.02); nada(2093, 0, 0.14, 'square', 0.02, 0.06); },
  /* suara jatuh pendek ciptaan sendiri: dua nada menurun cepat */
  oof: () => { nada(280, 95, 0.2, 'sawtooth', 0.09); nada(190, 70, 0.22, 'square', 0.04, 0.02); bising(0.12, 0.08, 500); },
  pecah: () => bising(0.25, 0.1, 1400),
  checkpoint: () => seri([659, 880, 1175], 0.07, 0.16),
  betul: () => seri([523, 659, 784, 1047], 0.065, 0.2),
  salah: () => nada(220, 90, 0.32, 'sawtooth', 0.05),
  beli: () => seri([784, 988, 1319], 0.06, 0.14, 'square', 0.03),
  lencana: () => seri([659, 784, 988, 1319, 1568], 0.08, 0.26),
  menang: () => seri([523, 659, 784, 1047, 784, 1047, 1319, 1568], 0.095, 0.2),
  tap: () => nada(700, 900, 0.05, 'sine', 0.05),
  pad: () => { nada(200, 900, 0.22, 'sawtooth', 0.03); bising(0.18, 0.05, 2500); },
  pukul: () => { nada(520, 240, 0.07, 'triangle', 0.05); bising(0.05, 0.05, 2600); },
  retak: () => { seri([988, 1319, 1760], 0.04, 0.1, 'triangle', 0.05); bising(0.14, 0.07, 3000); },
  hilang: () => nada(600, 180, 0.2, 'sine', 0.05),
  telur: () => seri([523, 659, 784, 1047, 1319, 1568], 0.1, 0.24, 'sine', 0.07),
  chat: () => nada(1200, 0, 0.04, 'sine', 0.025)
};
let terakhir = {};
export function bunyi(n, jarak = 0) { const k = performance.now(); if (jarak && terakhir[n] && k - terakhir[n] < jarak) return; terakhir[n] = k; try { BUNYI[n]?.(); } catch (e) {} }

/* muzik: gelung lembut 4 bar, pentatonik, setiap dunia kadar & akar sendiri */
const TEMA = { lobi: [92, 196], obby: [124, 220], menara: [136, 174.6], tycoon: [108, 196], sim: [112, 246.9] };
const SKALA = [0, 2, 4, 7, 9, 12, 14, 16], AKOR = [[0, 4, 7], [5, 9, 12], [-3, 0, 4], [7, 11, 14]];
const M = { id: null, seterus: 0, langkah: 0, tema: 'lobi' };
function tick() {
  if (!ac || !S.bunyi || !S.muzik) return;
  const [bpm, akar] = TEMA[M.tema], spb = 60 / bpm / 2;
  while (M.seterus < ac.currentTime + 0.2) {
    const st = M.langkah, bar = Math.floor(st / 8) % 4, ak = AKOR[bar], t0 = M.seterus - ac.currentTime, fq = (s) => akar * Math.pow(2, s / 12);
    if (st % 4 === 0) nada(fq(ak[0]) / 2, 0, spb * 1.8, 'triangle', 0.035, t0);
    if (st % 2 === 0) nada(fq(ak[(st / 2) % 3]), 0, spb * 0.9, 'sine', 0.018, t0);
    if (M.tema !== 'lobi' && [1, 3, 6].includes(st % 8)) nada(fq(SKALA[(st * 7 + bar * 3) % SKALA.length]) * 2, 0, spb * 0.7, 'triangle', 0.014, t0);
    if (M.tema !== 'lobi' && st % 4 === 2) bising(0.04, 0.012, 5000);
    M.seterus += spb; M.langkah++;
  }
}
export function muzik(tema) { M.tema = TEMA[tema] ? tema : 'lobi'; if (!ac) return; M.seterus = ac.currentTime + 0.08; if (!M.id) M.id = setInterval(tick, 80); }
export function henti() { if (M.id) { clearInterval(M.id); M.id = null; } }
