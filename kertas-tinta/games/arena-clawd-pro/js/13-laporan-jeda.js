/* Arena Clawd Pro: Laporan belajar, jeda, tombol suara */
'use strict';

/* ---------- menang / kalah (layar hasil ada di 21-hasil.js) ---------- */
function fmt(t) { var m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ':' + (s < 10 ? '0' : '') + s; }
function topicBars(stat) {
  return '<div class="bars">' + ['tambah', 'kurang', 'kali', 'bagi'].filter(function (k) { return stat[k][1] > 0; }).map(function (k) { var s = stat[k], p = Math.round(s[0] / s[1] * 100); return '<div class="bar"><span>' + tx(TOPIC_TX[k]) + '</span><i><em style="width:' + p + '%;background:' + (p >= 75 ? 'var(--leaf)' : p >= 50 ? 'var(--gold)' : 'var(--accent)') + '"></em></i><span>' + s[0] + '/' + s[1] + ' · ' + p + '%</span></div>'; }).join('') + '</div>';
}
function win() { if (G.state === 'menang') return; G.state = 'menang'; musicStop(); stopInput(); setTimeout(function () { if (!G) return; sfx('win'); mlHasil(true); }, 1500); }
function lose() { if (G.state === 'kalah') return; G.state = 'kalah'; musicStop(); stopInput(); sfx('over'); setTimeout(function () { if (G) mlHasil(false); }, 900); }
function pause(on) {
  if (!G) return;
  if (on && G.state === 'main') {
    G.state = 'jeda'; musicStop(); stopInput();
    paperEl.innerHTML = '<h2>' + L('Jeda', 'Jeda') + '</h2><p>' + L('Minion kedua tim beristirahat sebentar.', 'Minion kedua-dua pasukan berehat sekejap.') + '</p><div class="row"><button class="primary" id="pRes" data-uji="sambung">' + L('Lanjut ▸', 'Sambung ▸') + '</button><button id="pMenu" data-uji="keluar-arena">' + L('Keluar ke lobi', 'Keluar ke lobi') + '</button></div>';
    sheet.hidden = false;
    document.getElementById('pRes').onclick = function () { pause(false); };
    document.getElementById('pMenu').onclick = function () { sheet.hidden = true; toMenu(); };
  } else if (!on && G.state === 'jeda') { sheet.hidden = true; G.state = 'main'; musicStart(); }
}
document.getElementById('bPause').innerHTML = ic('pause', 20);
document.getElementById('bPause').onclick = function () { pause(true); };
var bMute = document.getElementById('bMute');
function muteLabel() { bMute.innerHTML = ic(muted ? 'mute' : 'sound', 20); }
muteLabel();
bMute.onclick = function () { muted = !muted; try { localStorage.setItem('arena-pro-mute', muted ? '1' : '0'); } catch (e) {} muteLabel(); if (muted) musicStop(); else { audioInit(); if (G && G.state === 'main') musicStart(); } };
document.addEventListener('visibilitychange', function () { if (document.hidden) pause(true); });
