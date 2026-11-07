/* Misi Detektif Nyamuk: mula — menu, gelung bingkai, kait ujian (window.__game). */
'use strict';
var masa = 0, akhirT = 0;
function gelung(ts) {
  var dt = Math.min(0.05, (ts - akhirT) / 1000 || 0); akhirT = ts; masa += dt;
  if (G.keadaan === 'peta') petaKemas(dt);
  if (!$('#skr-peta').hidden) petaLukis(masa);
  lukisSeni(masa);
  requestAnimationFrame(gelung);
}
function masukPeta() {
  audioInit(); musicStart();
  $('#skr-menu').hidden = true; $('#skr-peta').hidden = false; G.keadaan = 'peta'; ukurPeta(); kemasHud();
  if (!G.prolog) toast('Latihan detektif: tangkap 3 nyamuk. Ketik nyamuk, atau ketik tanah untuk berjalan.', 'info', 6000);
}
function mula() {
  ['00', '01'].forEach(function () {});
  var ada = muatSimpanan();
  $('#btn-sambung').hidden = !ada || (!G.prolog && !G.selesai.length);
  $('#btn-mula').onclick = function () { padamSimpanan(); G.prolog = false; G.selesai = []; G.skor = {}; G.tangkap = 0; G.bersih = 0; G.akhir = null; masukPeta(); };
  $('#btn-sambung').onclick = masukPeta;
  $('#btn-guru').onclick = bukaGuru;
  $('#btn-masuk').onclick = function () { var a = this.dataset.aksi; if (a === '') return; if (a === 'paya') bukaAkhir(); else bukaStesen(+a); };
  $('#hud-bukti').onclick = bukaBuku;
  $('#l-tutup').onclick = tutupStesen;
  $('#l-lanjut').onclick = lanjut;
  $('#l-dengar').onclick = function () { baca(ST.bacaan || ''); };
  var bs = $('#btn-bunyi'); function ikonBunyi() { bs.innerHTML = ic(muted ? 'mute' : 'sound', 20); bs.setAttribute('aria-label', muted ? 'Hidupkan bunyi' : 'Senyapkan bunyi'); } ikonBunyi(); bs.onclick = function () { togolSenyap(); ikonBunyi(); };
  var bt = $('#btn-huruf'); bt.innerHTML = ic('textsize', 20); try { if (localStorage.getItem('detektif-nyamuk-huruf') === '1') document.body.classList.add('besar'); } catch (e) {}
  bt.onclick = function () { var on = document.body.classList.toggle('besar'); try { localStorage.setItem('detektif-nyamuk-huruf', on ? '1' : '0'); } catch (e) {} };
  document.querySelectorAll('[data-ic]').forEach(function (e) { e.insertAdjacentHTML('afterbegin', ic(e.getAttribute('data-ic'), +(e.getAttribute('data-ics') || 20))); });
  petaInit(); daftarSeni(document); kemasHud();
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!$('#buku').hidden) $('#buku').hidden = true; else if (G.keadaan === 'stesen') tutupStesen(); } });
  $('#muat').hidden = true; $('#skr-menu').hidden = false;
  requestAnimationFrame(gelung);
}
/* kait ujian */
window.__game = {
  get keadaan() { return G.keadaan; }, get selesai() { return G.selesai.slice(); }, get langkah() { return ST.k; },
  info: function () { return { keadaan: G.keadaan, prolog: G.prolog, selesai: G.selesai, skor: G.skor, tangkap: G.tangkap, nyamuk: NYAMUK.length, takung: TAKUNG.length, p: [Math.round(P.x), Math.round(P.y)] }; },
  tangkapSemua: function (n) { for (var i = 0; i < (n || 3); i++) { if (!NYAMUK.length) tambahNyamuk(P.x, P.y - 80); tangkapNyamuk(0); } },
  ke: function (i) { var d = i === 'paya' ? { x: PAYA.x, y: PAYA.y + PAYA.r + 20 } : pintu(STESEN[i]); P.x = d.x; P.y = d.y; P.tx = null; },
  dedahSemua: function () { document.querySelectorAll('#l-isi .dd:not(.buka)').forEach(function (b) { b.click(); }); },
  jawabUji: function (ok) { if (G.uji) G.uji(ok !== false); },
  lanjut: function () { var b = $('#l-lanjut'); if (!b.hidden && !b.disabled) b.click(); },
  takung: function () { TAKUNG.push({ x: P.x + 10, y: P.y, j: 'baldi', bersih: false, t: 0 }); },
  /* main satu stesen penuh secara automatik (untuk ujian); salah = jawab salah dahulu setiap soalan */
  mainStesen: async function (i, salah, henti) {
    var tunggu = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    this.ke(i); await tunggu(150); $('#btn-masuk').click(); await tunggu(200);
    for (var n = 0; n < 200 && G.keadaan === 'stesen'; n++) {
      var L = ST.langkah[ST.k];
      if (henti && L.jenis === henti) return 'henti:' + henti;
      if (L.jenis === 'kad') { this.dedahSemua(); await tunggu(60); this.lanjut(); }
      else if (L.jenis === 'mini') { if (G.uji) { G.uji(!salah || n % 2 === 0 ? !salah : true); salah && n % 2 === 0 ? null : null; } await tunggu(salah ? 700 : 1400); if (salah && G.uji) { G.uji(true); await tunggu(1400); } }
      else this.lanjut();
      await tunggu(120);
    }
    return G.keadaan + ' selesai=' + G.selesai.join(',');
  },
  mainAkhir: async function (salahSatu) {
    var tunggu = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    this.ke('paya'); await tunggu(150); $('#btn-masuk').click(); await tunggu(300);
    var k = 0;
    for (var n = 0; n < 60 && G.keadaan === 'akhir' && G.uji; n++) { G.uji(!(salahSatu && k++ === 0)); await tunggu(250); if (G.uji) G.uji(true); await tunggu(250); }
    return JSON.stringify(G.akhir);
  }
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mula); else mula();
