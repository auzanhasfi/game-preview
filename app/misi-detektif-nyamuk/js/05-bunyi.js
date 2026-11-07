/* Misi Detektif Nyamuk: bunyi sintesis Web Audio (dari Arena Clawd Pro) + bacaan suara BM (speechSynthesis). */
'use strict';

var ac = null, muted = false, noiseBuf = null;
try { muted = localStorage.getItem('detektif-nyamuk-senyap') === '1'; } catch (e) {}
function audioInit() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); var len = ac.sampleRate * 0.6; noiseBuf = ac.createBuffer(1, len, ac.sampleRate); var d = noiseBuf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); } catch (e) { ac = null; } }
  if (ac && ac.state === 'suspended') ac.resume();
}
function toneAt(f1, f2, t, dur, type, vol) { var o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f1, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || 0.06, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.03); }
function tone(f1, f2, dur, type, vol, delay) { if (!ac || muted) return; toneAt(f1, f2, ac.currentTime + (delay || 0), dur, type, vol); }
function noise(dur, vol, freq) { if (!ac || muted || !noiseBuf) return; var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = freq || 900; g.gain.value = vol || 0.2; s.connect(f); f.connect(g); g.connect(ac.destination); s.start(); s.stop(ac.currentTime + dur); }
var sfxT = {};
var SFX = {
  tap: function () { tone(700, 900, 0.05, 'sine', 0.05); },
  dedah: function () { tone(880, 1320, 0.09, 'triangle', 0.05); },
  tangkap: function () { tone(1200, 400, 0.12, 'square', 0.03); noise(0.08, 0.1, 3000); },
  bersih: function () { noise(0.25, 0.12, 2200); tone(523, 1047, 0.18, 'sine', 0.05, 0.05); },
  bukti: function () { [659, 784, 988, 1319].forEach(function (f, i) { tone(f, 0, 0.2, 'triangle', 0.07, i * 0.08); }); },
  correct: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0, 0.2, 'triangle', 0.07, i * 0.06); }); },
  wrong: function () { tone(260, 110, 0.3, 'sawtooth', 0.04); },
  dengung: function () { tone(520, 560, 0.25, 'sawtooth', 0.008); },
  boom: function () { noise(0.6, 0.35, 500); tone(90, 30, 0.6, 'sine', 0.18); },
  menang: function () { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach(function (f, i) { tone(f, 0, 0.16, 'triangle', 0.075, i * 0.09); }); },
  langkah: function () { tone(180, 120, 0.04, 'triangle', 0.02); }
};
function sfx(n, gap) { var now = performance.now(); if (gap && sfxT[n] && now - sfxT[n] < gap) return; sfxT[n] = now; try { SFX[n](); } catch (e) {} }

/* muzik latar santai (detektif): bass + petikan, 96 BPM */
var mus = { timer: null, next: 0, step: 0 }, PROG = [[0, 3, 7], [5, 8, 12], [-2, 2, 5], [3, 7, 10]];
function musTick() { if (!ac || muted) return; var spb = 60 / 96 / 2; while (mus.next < ac.currentTime + 0.2) { var st = mus.step, ch = PROG[Math.floor(st / 8) % 4], k = st % 8, base = 196; if (k !== 3 && k !== 7) toneAt(base * Math.pow(2, ch[[0, 1, 2, 1, 0, 2, 1, 2][k]] / 12), 0, mus.next, 0.14, 'triangle', 0.012); if (k % 4 === 0) toneAt(base / 2 * Math.pow(2, ch[0] / 12), 0, mus.next, 0.35, 'sine', 0.04); mus.next += spb; mus.step++; } }
function musicStart() { if (!ac || muted || mus.timer) return; mus.next = ac.currentTime + 0.08; mus.timer = setInterval(musTick, 50); }
function musicStop() { if (mus.timer) { clearInterval(mus.timer); mus.timer = null; } }
function togolSenyap() { muted = !muted; try { localStorage.setItem('detektif-nyamuk-senyap', muted ? '1' : '0'); } catch (e) {} if (muted) { musicStop(); diam(); } else { audioInit(); musicStart(); } return muted; }

/* bacaan suara: guna suara ms-MY jika ada, jika tiada id-ID, jika tiada suara lalai dengan lang ms */
var suaraBM = null;
function cariSuara() { try { var v = speechSynthesis.getVoices(); suaraBM = v.find(function (x) { return /^ms/i.test(x.lang); }) || v.find(function (x) { return /^id/i.test(x.lang); }) || null; } catch (e) {} }
try { cariSuara(); speechSynthesis.onvoiceschanged = cariSuara; } catch (e) {}
function bacaAda() { return 'speechSynthesis' in window; }
function baca(teks) { if (!bacaAda()) return; try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(teks); u.lang = suaraBM ? suaraBM.lang : 'ms-MY'; if (suaraBM) u.voice = suaraBM; u.rate = 0.92; speechSynthesis.speak(u); } catch (e) {} }
function diam() { try { speechSynthesis.cancel(); } catch (e) {} }
