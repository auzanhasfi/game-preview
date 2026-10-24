/* Arena Clawd Pro: Efek bunyi & musik Web Audio */
'use strict';

/* ---------- bunyi ---------- */
var ac = null, muted = false, noiseBuf = null;
try { muted = localStorage.getItem('arena-pro-mute') === '1'; } catch (e) {}
function audioInit() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); var len = ac.sampleRate * 0.6; noiseBuf = ac.createBuffer(1, len, ac.sampleRate); var d = noiseBuf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); } catch (e) { ac = null; } }
  if (ac && ac.state === 'suspended') ac.resume();
}
function toneAt(f1, f2, t, dur, type, vol) { var o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f1, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || 0.06, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.03); }
function tone(f1, f2, dur, type, vol, delay) { if (!ac || muted) return; toneAt(f1, f2, ac.currentTime + (delay || 0), dur, type, vol); }
function noise(dur, vol, freq) { if (!ac || muted || !noiseBuf) return; var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = freq || 900; g.gain.value = vol || 0.2; s.connect(f); f.connect(g); g.connect(ac.destination); s.start(); s.stop(ac.currentTime + dur); }
var sfxT = {};
var SFX = {
  shot: function () { tone(820, 1200, 0.06, 'triangle', 0.03); }, slash: function () { noise(0.08, 0.1, 2600); tone(500, 200, 0.08, 'triangle', 0.03); },
  hit: function () { tone(220, 120, 0.06, 'square', 0.025); }, pop: function () { tone(700, 160, 0.14, 'square', 0.035); },
  zap: function () { tone(1200, 300, 0.16, 'sawtooth', 0.02); }, boom: function () { noise(0.6, 0.4, 500); tone(90, 30, 0.6, 'sine', 0.2); },
  dash: function () { noise(0.2, 0.14, 3000); tone(300, 900, 0.18, 'sawtooth', 0.03); }, spin: function () { [400, 600, 800, 1000].forEach(function (f, i) { tone(f, f * 1.3, 0.1, 'triangle', 0.04, i * 0.05); }); },
  thunder: function () { noise(0.3, 0.25, 4000); tone(1800, 200, 0.25, 'sawtooth', 0.03); }, ult: function () { [523, 784, 1047, 1568].forEach(function (f, i) { tone(f, f * 0.98, 0.3, 'sine', 0.05, i * 0.1); }); },
  star: function () { noise(0.2, 0.15, 1200); tone(200, 80, 0.2, 'sine', 0.08); }, slam: function () { noise(0.5, 0.35, 300); tone(70, 35, 0.5, 'sine', 0.2); },
  lvl: function () { [659, 784, 988, 1319].forEach(function (f, i) { tone(f, 0, 0.18, 'triangle', 0.06, i * 0.07); }); }, coin: function () { tone(1568, 0, 0.08, 'square', 0.025); tone(2093, 0, 0.12, 'square', 0.025, 0.06); },
  hurt: function () { tone(300, 90, 0.2, 'sawtooth', 0.04); }, heal: function () { [523, 659, 784].forEach(function (f, i) { tone(f, f * 1.02, 0.25, 'sine', 0.05, i * 0.06); }); },
  correct: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0, 0.22, 'triangle', 0.08, i * 0.07); }); }, wrong: function () { tone(220, 90, 0.35, 'sawtooth', 0.05); },
  win: function () { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach(function (f, i) { tone(f, 0, 0.16, 'triangle', 0.075, i * 0.09); }); }, over: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, 0, 0.2, 'triangle', 0.08, i * 0.16); }); },
  tap: function () { tone(700, 900, 0.05, 'sine', 0.05); }, blink: function () { tone(2000, 400, 0.15, 'sine', 0.05); },
  combo: function () { [784, 988, 1175, 1568, 1976].forEach(function (f, i) { tone(f, f * 1.05, 0.2, 'square', 0.04, i * 0.05); }); noise(0.4, 0.25, 800); }
};
function sfx(n, gap) { var now = performance.now(); if (gap && sfxT[n] && now - sfxT[n] < gap) return; sfxT[n] = now; try { SFX[n](); } catch (e) {} }
var mus = { timer: null, next: 0, step: 0, theme: 'arena' }, PROG = [[0, 3, 7], [8, 12, 15], [5, 8, 12], [7, 11, 14]], PROG_LOBI = [[0, 3, 7], [5, 8, 12], [-2, 2, 5], [3, 7, 10]];
function musTick() { if (!ac || muted) return; var lobi = mus.theme === 'lobi', spb = 60 / (lobi ? 92 : 126) / 2; while (mus.next < ac.currentTime + 0.2) { var st = mus.step, bar = Math.floor(st / 8) % 4, ch = (lobi ? PROG_LOBI : PROG)[bar], k = st % 8, base = lobi ? 196 : 220; toneAt(base * Math.pow(2, ch[[0, 1, 2, 1, 0, 2, 1, 2][k]] / 12), 0, mus.next, 0.12, 'triangle', 0.015); if (k % 4 === 0) toneAt(base / 2 * Math.pow(2, ch[0] / 12), 0, mus.next, 0.3, 'sine', 0.045); if (k % 2 === 1) toneAt(110, 50, mus.next, 0.05, 'triangle', 0.018); mus.next += spb; mus.step++; } }
function musicStart(theme) { theme = theme || 'arena'; if (mus.timer && mus.theme !== theme) musicStop(); mus.theme = theme; if (!ac || muted || mus.timer) return; mus.next = ac.currentTime + 0.08; mus.timer = setInterval(musTick, 50); }
function musicStop() { if (mus.timer) { clearInterval(mus.timer); mus.timer = null; } }
