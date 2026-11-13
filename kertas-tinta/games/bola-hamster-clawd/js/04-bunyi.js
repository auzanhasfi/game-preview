/* 04 — Bunyi: kesan bunyi + muzik latar sintesis WebAudio (tanpa fail audio). Muzik perlahan. */
HB.audio = { ac: null, muted: false, roll: null };
function audioInit() {
  var A = HB.audio;
  if (HB.PREVIEW) return;
  if (!A.ac) { try { A.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { A.ac = null; } }
  if (A.ac && A.ac.state === 'suspended') A.ac.resume();
}
function toneAt(f1, f2, t, dur, type, vol) {
  var ac = HB.audio.ac, o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'square';
  o.frequency.setValueAtTime(f1, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || 0.06, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination);
  o.start(t); o.stop(t + dur + 0.03);
}
function tone(f1, f2, dur, type, vol, delay) { var A = HB.audio; if (!A.ac || A.muted) return; toneAt(f1, f2, A.ac.currentTime + (delay || 0), dur, type, vol); }
var SFX = {
  seed: function () { tone(1568, 0, 0.12, 'sine', 0.06); tone(2093, 0, 0.16, 'sine', 0.04, 0.05); },
  bump: function () { tone(170, 100, 0.1, 'triangle', 0.1); },
  boing: function () { tone(260, 620, 0.16, 'sine', 0.08); },
  correct: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0, 0.22, 'triangle', 0.08, i * 0.07); tone(f * 2, 0, 0.3, 'sine', 0.03, i * 0.07); }); },
  wrong: function () { tone(220, 90, 0.35, 'sawtooth', 0.05); },
  fall: function () { tone(700, 120, 0.8, 'sine', 0.07); },
  check: function () { [659, 784, 988].forEach(function (f, i) { tone(f, 0, 0.18, 'triangle', 0.06, i * 0.08); }); },
  push: function () { tone(140, 60, 0.18, 'sawtooth', 0.06); },
  clear: function () { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach(function (f, i) { tone(f, 0, 0.16, 'triangle', 0.075, i * 0.09); }); },
  over: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, 0, 0.2, 'triangle', 0.08, i * 0.16); }); },
  pop: function () { tone(600, 900, 0.06, 'sine', 0.05); }
};
function sfx(n) { try { SFX[n](); } catch (e) { /* tanpa bunyi */ } }

/* dengung golek: hingar lembut yang kuatnya ikut laju bola */
function rollHum(speed) {
  var A = HB.audio;
  if (!A.ac) return;
  if (!A.roll) {
    try {
      var o = A.ac.createOscillator(), g = A.ac.createGain(), f = A.ac.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = 70; f.type = 'lowpass'; f.frequency.value = 300;
      g.gain.value = 0; o.connect(f); f.connect(g); g.connect(A.ac.destination); o.start();
      A.roll = { o: o, g: g };
    } catch (e) { return; }
  }
  var v = A.muted ? 0 : clamp(speed / 300, 0, 1) * 0.035;
  A.roll.g.gain.setTargetAtTime(v, A.ac.currentTime, 0.08);
  A.roll.o.frequency.setTargetAtTime(60 + speed * 0.35, A.ac.currentTime, 0.1);
}

/* muzik: arpeggio pentatonik perlahan, kunci bertukar ikut trek */
var mus = { timer: null, next: 0, step: 0, key: 0 };
var PROG = [[0, 4, 7, 12], [9, 12, 16, 21], [5, 9, 12, 17], [7, 11, 14, 19]];
var ARP = [0, 1, 2, 3, 2, 1, 2, 1];
function musTick() {
  var ac = HB.audio.ac;
  if (!ac || HB.audio.muted) return;
  var spb = 60 / 96 / 2;
  while (mus.next < ac.currentTime + 0.2) {
    var st = mus.step, bar = Math.floor(st / 8) % 4, ch = PROG[bar], k = st % 8, base = 261.63 * Math.pow(2, mus.key / 12);
    toneAt(base * Math.pow(2, ch[ARP[k]] / 12), 0, mus.next, 0.22, 'triangle', 0.014);
    if (k % 4 === 0) toneAt(base / 2 * Math.pow(2, ch[0] / 12), 0, mus.next, 0.5, 'sine', 0.035);
    mus.next += spb; mus.step++;
  }
}
function musicStart(key) {
  mus.key = key || 0;
  var ac = HB.audio.ac;
  if (!ac || HB.audio.muted || mus.timer) return;
  mus.next = ac.currentTime + 0.08; mus.timer = setInterval(musTick, 50);
}
function musicStop() { if (mus.timer) { clearInterval(mus.timer); mus.timer = null; } }
