/* Siaga Merdeka: putaran utama, tombol menu, dan kait uji otomatis. */
'use strict';

var LANGKAH = 1 / 30;
var _akhir = 0, _sisa = 0;

function putaran(now) {
  requestAnimationFrame(putaran);
  var dt = Math.min(0.1, (now - (_akhir || now)) / 1000); _akhir = now;
  if (!G || !G.berjalan) return;
  G.waktuNyata += dt;
  if (!G.jeda) {
    _sisa += dt * (G.cepat || 1);
    var n = 0;
    while (_sisa >= LANGKAH && n < 6) { langkahDunia(LANGKAH); _sisa -= LANGKAH; n++; }
    if (n >= 6) _sisa = 0;
    langkahEfek(dt * (G.cepat || 1));
    G.garisT = Math.max(0, G.garisT - dt);
    G.tanda.forEach(function (m) { m.t -= dt; }); G.tanda = G.tanda.filter(function (m) { return m.t > 0; });
  }
  gulirKamera(dt);
  G.kabutT = (G.kabutT || 0) - dt; if (G.kabutT <= 0) { G.kabutT = 0.2; perbaruiKabut(); }
  lukisDunia();
  HUD.hudT -= dt; if (HUD.hudT <= 0) { HUD.hudT = 0.12; perbaruiHUD(false); }
  HUD.miniT -= dt; if (HUD.miniT <= 0) { HUD.miniT = 0.25; lukisMini(); }
}

function mulaiAplikasi() {
  ctx = $('#kanvas').getContext('2d');
  pasangInput(); pasangBebas(); pasangPengaturan(); pasangJeda();
  document.querySelectorAll('[data-ke]').forEach(function (b) { b.onclick = function () { audioSiap(); bunyi('klik'); tampilLayar(b.dataset.ke); }; });
  if (window.speechSynthesis) speechSynthesis.getVoices();
  tampilLayar('layar-judul');
  requestAnimationFrame(putaran);
}

/* kait untuk uji main otomatis (dipakai skrip pengujian, tidak memengaruhi permainan) */
window.__game = {
  misi: function (i) { mulaiMisi(i == null ? misiBebas('nl', 0) : MISI[i]); return true; },
  info: function () {
    if (!G) return null;
    return { t: +G.t.toFixed(1), dana: Math.round(G.sisi[0].dana), daya: G.sisi[0].hasil + '/' + G.sisi[0].pakai, kita: G.ents.filter(function (e) { return e.s === 0; }).map(function (e) { return e.tipe; }), musuh: G.ents.filter(function (e) { return e.s === 1; }).length, selesai: G.selesai, menang: G.menang, proj: G.proj.length, part: G.part.length };
  },
  bangun: function (tipe) { G.sisi[0].dana += 5000; G.sisi[0].siap[BANGUN[tipe].kat] = tipe; var P = G.pangkalan[0]; for (var r = 2; r < 12; r++) for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) if (taruhBangunan(0, tipe, P.x + dx, P.y + dy)) return true; return false; },
  latih: function (tipe, n) { for (var i = 0; i < (n || 1); i++) mulaiBuat(0, tipe); },
  serbuMarkas: function () { var hq = bangunanMilik(1, 'hq'); if (!hq) return false; G.pilih = G.ents.filter(function (e) { return e.s === 0 && e.k === 'unit' && e.senjata; }); perintahPilihan(Math.floor(hq.x / TS), Math.floor(hq.y / TS), hq); return G.pilih.length; },
  lompat: function (detik) { for (var i = 0; i < detik * 30; i++) { langkahDunia(LANGKAH); langkahEfek(LANGKAH); } return this.info(); },
  lihatSemua: function () { G.jelajah.fill(1); G.vis.fill(1); },
  kamera: function (x, y) { pusatkanKamera(x * TS, y * TS); }
};

window.addEventListener('DOMContentLoaded', mulaiAplikasi);
