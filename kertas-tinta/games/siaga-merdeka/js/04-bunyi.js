/* Siaga Merdeka: bunyi sintesis Web Audio (tembakan, ledakan, antarmuka), suara laporan, dan musik mars sederhana. */
'use strict';

var AU = { ctx: null, master: null, sfx: null, musik: null, bisu: false, musikNyala: true, akhir: {}, suaraAkhir: 0, derau: null, jadwal: 0, ketuk: 0, timerMusik: null };

function audioSiap() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return true; }
  var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  AU.ctx = new AC();
  AU.master = AU.ctx.createGain(); AU.master.gain.value = AU.bisu ? 0 : 0.8; AU.master.connect(AU.ctx.destination);
  var komp = AU.ctx.createDynamicsCompressor(); komp.threshold.value = -16; komp.ratio.value = 4; komp.connect(AU.master);
  AU.sfx = AU.ctx.createGain(); AU.sfx.gain.value = 0.7; AU.sfx.connect(komp);
  AU.musik = AU.ctx.createGain(); AU.musik.gain.value = 0.22; AU.musik.connect(komp);
  var len = AU.ctx.sampleRate * 1.5, buf = AU.ctx.createBuffer(1, len, AU.ctx.sampleRate), d = buf.getChannelData(0);
  for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AU.derau = buf;
  return true;
}
function aturBisu(b) { AU.bisu = b; if (AU.master) AU.master.gain.value = b ? 0 : 0.8; }

function _derau(t, dur, vol, frek, q, tipe, tujuan) {
  var s = AU.ctx.createBufferSource(); s.buffer = AU.derau;
  var f = AU.ctx.createBiquadFilter(); f.type = tipe || 'lowpass'; f.frequency.setValueAtTime(frek, t); f.Q.value = q || 0.7;
  var g = AU.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(tujuan || AU.sfx); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  return f;
}
function _nada(t, dur, vol, f0, f1, tipe, tujuan) {
  var o = AU.ctx.createOscillator(); o.type = tipe || 'sine'; o.frequency.setValueAtTime(f0, t);
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  var g = AU.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(tujuan || AU.sfx); o.start(t); o.stop(t + dur + 0.05);
}

/* bunyi(nama, x, y): x,y piksel dunia supaya makin jauh dari kamera makin pelan */
function bunyi(nama, x, y) {
  if (!AU.ctx || AU.bisu) return;
  var now = AU.ctx.currentTime, jarakMin = { senapan: 0.06, mg: 0.09, tusuk: 0.12, kanonR: 0.08, kanon: 0.1, ledak: 0.07, roket: 0.1, artileri: 0.15 }[nama] || 0.03;
  if (AU.akhir[nama] && now - AU.akhir[nama] < jarakMin) return;
  AU.akhir[nama] = now;
  var v = 1;
  if (x != null && G && G.cam) {
    var cx = G.cam.x + G.view.w / 2 / G.zoom, cy = G.cam.y + G.view.h / 2 / G.zoom;
    var d = Math.hypot(x - cx, y - cy) / TS; v = Math.max(0, 1 - d / 34); if (v < 0.05) return;
  }
  var t = now + 0.005;
  switch (nama) {
    case 'senapan': _derau(t, 0.12, 0.5 * v, 2400, 1, 'bandpass'); _nada(t, 0.05, 0.2 * v, 900, 200, 'square'); break;
    case 'mg': for (var i = 0; i < 3; i++) _derau(t + i * 0.07, 0.06, 0.4 * v, 2000, 1.2, 'bandpass'); break;
    case 'tusuk': _derau(t, 0.08, 0.35 * v, 3500, 2, 'highpass'); _nada(t, 0.08, 0.12 * v, 300, 120, 'triangle'); break;
    case 'kanonR': _derau(t, 0.2, 0.6 * v, 900); _nada(t, 0.15, 0.4 * v, 160, 60, 'triangle'); break;
    case 'kanon': _derau(t, 0.45, 0.8 * v, 600); _nada(t, 0.3, 0.6 * v, 110, 40, 'sine'); break;
    case 'roket': var f = _derau(t, 0.5, 0.45 * v, 1200, 1, 'bandpass'); f.frequency.exponentialRampToValueAtTime(300, t + 0.5); break;
    case 'artileri': _derau(t, 0.6, 0.9 * v, 400); _nada(t, 0.5, 0.7 * v, 80, 30, 'sine'); break;
    case 'ledak': _derau(t, 0.7, 0.9 * v, 700); _nada(t, 0.5, 0.6 * v, 90, 30, 'sine'); break;
    case 'ledakBesar': _derau(t, 1.6, 1.0 * v, 500); _derau(t + 0.15, 1.2, 0.6 * v, 1400); _nada(t, 1.1, 0.9 * v, 70, 22, 'sine'); break;
    case 'jatuh': _derau(t, 0.15, 0.25 * v, 500); break;
    case 'klik': _nada(t, 0.05, 0.18, 1200, 900, 'triangle'); break;
    case 'pilih': _nada(t, 0.07, 0.15, 660, 880, 'triangle'); break;
    case 'perintah': _nada(t, 0.06, 0.14, 520, 0, 'square'); _nada(t + 0.07, 0.06, 0.12, 780, 0, 'square'); break;
    case 'taruh': _derau(t, 0.25, 0.5, 300); _nada(t, 0.2, 0.3, 140, 80, 'triangle'); break;
    case 'selesai': _nada(t, 0.12, 0.2, 523, 0, 'triangle'); _nada(t + 0.12, 0.2, 0.2, 784, 0, 'triangle'); break;
    case 'uang': _nada(t, 0.06, 0.15, 1400, 0, 'sine'); _nada(t + 0.06, 0.1, 0.15, 1900, 0, 'sine'); break;
    case 'benar': [523, 659, 784, 1046].forEach(function (f, i) { _nada(t + i * 0.08, 0.25, 0.22, f, 0, 'triangle'); }); break;
    case 'salah': _nada(t, 0.25, 0.25, 220, 150, 'sawtooth'); _nada(t + 0.2, 0.3, 0.2, 160, 110, 'sawtooth'); break;
    case 'peringatan': for (var i = 0; i < 3; i++) _nada(t + i * 0.32, 0.22, 0.2, 880, 660, 'square'); break;
    case 'pesawat': var f2 = _derau(t, 3.2, 0.5 * v, 300, 4, 'bandpass'); f2.frequency.linearRampToValueAtTime(900, t + 1.6); f2.frequency.linearRampToValueAtTime(250, t + 3.2); _nada(t, 3.2, 0.12, 95, 70, 'sawtooth'); break;
    case 'peluit': _nada(t, 0.9, 0.18 * v, 1800, 500, 'sine'); break;
  }
}

/* laporan suara bahasa Indonesia (jika peramban menyediakan), dibatasi supaya tidak bertumpuk */
var _suaraID = null;
function lapor(teks) {
  if (AU.bisu || !window.speechSynthesis) return;
  var now = performance.now(); if (now - AU.suaraAkhir < 2200) return; AU.suaraAkhir = now;
  try {
    if (!_suaraID) { var vs = speechSynthesis.getVoices(); _suaraID = vs.filter(function (v) { return /^id/i.test(v.lang); })[0] || null; }
    var u = new SpeechSynthesisUtterance(teks); u.lang = 'id-ID'; if (_suaraID) u.voice = _suaraID; u.rate = 1.05; u.pitch = 0.85; u.volume = 0.9;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) { }
}

/* musik mars minor 104 BPM: genderang, bas, dan terompet sederhana */
var MARS = { bas: [45, 45, 52, 45, 43, 43, 50, 43, 41, 41, 48, 41, 40, 40, 47, 52], mel: [69, 0, 72, 71, 69, 0, 64, 0, 67, 0, 69, 67, 65, 64, 62, 64] };
function musikMulai() {
  if (!audioSiap() || AU.timerMusik) return;
  AU.jadwal = AU.ctx.currentTime + 0.1; AU.ketuk = 0;
  AU.timerMusik = setInterval(jadwalMusik, 100);
}
function musikBerhenti() { clearInterval(AU.timerMusik); AU.timerMusik = null; }
function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
function jadwalMusik() {
  if (!AU.musikNyala || AU.bisu) { AU.jadwal = AU.ctx.currentTime + 0.1; return; }
  var dt = 60 / 104 / 2;
  while (AU.jadwal < AU.ctx.currentTime + 0.3) {
    var k = AU.ketuk, t = AU.jadwal, langkah = k % 16, bagian = Math.floor(k / 16) % 8;
    if (langkah % 4 === 0) _nada(t, 0.25, 0.5, 90, 45, 'sine', AU.musik);
    if (langkah % 4 === 2 || langkah === 15) _derau(t, 0.12, 0.25, 1800, 0.8, 'bandpass', AU.musik);
    if (langkah % 2 === 1) _derau(t, 0.03, 0.06, 7000, 1, 'highpass', AU.musik);
    _nada(t, dt * 0.9, 0.18, midi(MARS.bas[langkah] - 12), 0, 'triangle', AU.musik);
    if (bagian >= 2 && bagian !== 5) { var m = MARS.mel[langkah]; if (m) { _nada(t, dt * 1.6, 0.07, midi(m), 0, 'sawtooth', AU.musik); _nada(t, dt * 1.6, 0.05, midi(m - 12), 0, 'square', AU.musik); } }
    AU.jadwal += dt; AU.ketuk++;
  }
}
