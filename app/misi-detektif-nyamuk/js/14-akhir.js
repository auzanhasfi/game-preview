/* Misi Detektif Nyamuk: serbuan akhir di Paya Raja Comot — Uji Minda. Jawapan betul = Clawd sembur, nyawa Raja Comot turun.
   Jawapan salah tidak menamatkan permainan: nota diberi dan soalan diulang di hujung. */
'use strict';
var BOS = { hp: 1, sasar: 1, kena: 0, ketawa: 0, sembur: 0, bilangan: 0 };
SENI.bos = function (w, h, t) {
  BOS.hp += (BOS.sasar - BOS.hp) * 0.08; BOS.kena = Math.max(0, BOS.kena - 0.03); BOS.sembur = Math.max(0, BOS.sembur - 0.025); BOS.ketawa = Math.max(0, BOS.ketawa - 0.02);
  ctx.fillStyle = '#4f6b6a'; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 0.4; ctx.drawImage(grain, 0, 0, w, h); ctx.globalAlpha = 1;
  ctx.fillStyle = '#6f8a7f'; ctx.beginPath(); ctx.ellipse(w * 0.7, h * 0.86, w * 0.36, h * 0.16, 0, 0, 6.3); ctx.fill(); stroke(1.3, INK);
  for (var i = 0; i < 9; i++) { var x = w * (0.04 + i * 0.12); ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + Math.sin(t + i) * 4, h * 0.62); stroke(2, '#2f4a3a'); }
  var bx = w * 0.7 + (BOS.kena ? Math.sin(t * 60) * 6 : 0), by = h * 0.62 + Math.sin(t * 2) * 5, r = Math.min(w, h) * 0.17;
  var swarm = Math.round(2 + BOS.sasar * 8);
  for (var j = 0; j < swarm; j++) { var a = terbang(bx + Math.cos(j * 0.9) * r * 1.6, by - r * 0.6 + Math.sin(j * 1.3) * r * 0.7, 18, 10, t + j, 1.5); drawNyamuk(a[0], a[1], 0.9, j % 3 ? 'aedes' : 'tiruk', t); }
  drawComot(bx, by, r, { t: t, king: true, flash: BOS.kena > 0.5, stun: BOS.sasar <= 0.001 });
  if (BOS.ketawa > 0) gelembung(bx, by - r * 1.5, 'Hahaha! Nyamukku menang!');
  drawClawd(w * 0.2, h * 0.9, { s: Math.min(w, h) / 210, face: 0.9, t: t, lens: true, mood: BOS.ketawa > 0 ? 'hurt' : BOS.sembur > 0 ? 'happy' : null });
  if (BOS.sembur > 0) { var p = 1 - BOS.sembur; for (var k = 0; k < 14; k++) { var q = (p + k / 14) % 1; ctx.globalAlpha = 1 - q; ctx.beginPath(); ctx.arc(w * 0.27 + (bx - w * 0.27) * q, h * 0.75 + (by - h * 0.75) * q + Math.sin(k * 3) * 14 * q, 5 + q * 12, 0, 6.3); ctx.fillStyle = '#e6f3f1'; ctx.fill(); } ctx.globalAlpha = 1; }
  /* bar nyawa */
  var bw = Math.min(260, w * 0.5); ctx.fillStyle = 'rgba(12,21,38,0.75)'; ctx.fillRect(w - bw - 16, 14, bw, 34); ctx.fillStyle = '#efe6d2'; ctx.font = '700 12px Nunito, system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.fillText('RAJA COMOT', w - bw - 8, 28); ctx.fillStyle = '#3d4f74'; ctx.fillRect(w - bw - 8, 34, bw - 16, 8); ctx.fillStyle = DENG; ctx.fillRect(w - bw - 8, 34, (bw - 16) * Math.max(0, BOS.hp), 8);
};
function bukaAkhir() {
  G.keadaan = 'akhir'; P.tx = null; KEKUNCI = {}; $('#toast').hidden = true;
  var giliran = UJI.map(function (_, i) { return i; }), betulPertama = 0, cubaan = {}, langkah = 0;
  BOS.hp = 1; BOS.sasar = 1; BOS.bilangan = UJI.length;
  var el = $('#akhir'); el.hidden = false; el.innerHTML = '<div class="akhir-kotak"><div class="bos-seni"><canvas data-seni="bos"></canvas></div><div class="akhir-soal"></div></div>';
  daftarSeni(el); var box = el.querySelector('.akhir-soal');
  function soal() {
    if (!giliran.length) return menang();
    var qi = giliran[0], q = UJI[qi];
    box.innerHTML = '<div class="kira">Uji Minda · soalan ' + (UJI.length - giliran.length + 1) + ' / ' + UJI.length + '</div><h3 class="sl">' + esc(q.s) + '</h3>' + (q.seni ? '<div class="seni mini-s"><canvas data-seni="' + q.seni + '"></canvas></div>' : '') +
      '<div class="pilih3 tegak">' + q.p.map(function (p, i) { return '<button type="button" class="pil" data-i="' + i + '" data-uji="pilih"><span class="hrf">' + 'ABC'[i] + '</span><b>' + esc(p) + '</b></button>'; }).join('') + '</div><div class="maklum" hidden></div>' +
      (bacaAda() ? '<button type="button" class="bbtn dengar-s" data-uji="dengar">' + ic('sound', 18) + '<span>Dengar soalan</span></button>' : '');
    daftarSeni(box); var mk = box.querySelector('.maklum');
    var ds = box.querySelector('.dengar-s'); if (ds) ds.onclick = function () { baca(q.s + '. ' + q.p.map(function (p, i) { return 'ABC'[i] + ', ' + p; }).join('. ')); };
    function jawab(i, b) {
      box.querySelectorAll('.pil').forEach(function (x) { x.disabled = true; });
      if (i === q.j) { if (!cubaan[qi]) betulPertama++; giliran.shift(); BOS.sasar = giliran.length / UJI.length; BOS.kena = 1; BOS.sembur = 1; sfx('correct'); setTimeout(function () { sfx('boom'); }, 350); if (b) b.classList.add('betul'); maklum(mk, true, q.nota); }
      else { cubaan[qi] = 1; giliran.push(giliran.shift()); BOS.ketawa = 1; if (b) b.classList.add('salah'); box.querySelector('.pil[data-i="' + q.j + '"]').classList.add('betul'); maklum(mk, false, 'Jawapannya: ' + q.p[q.j] + '. ' + q.nota + ' Soalan ini akan muncul semula.'); }
      mk.insertAdjacentHTML('beforeend', '<button type="button" class="gbtn kecil" data-uji="mini-lanjut">' + (giliran.length ? 'Soalan seterusnya' : 'Tamatkan kes') + '</button>');
      mk.querySelector('button').onclick = soal; G.uji = function () { soal(); };
    }
    box.querySelectorAll('.pil').forEach(function (b) { b.onclick = function () { jawab(+b.dataset.i, b); }; });
    G.uji = function (ok) { var i = ok ? q.j : (q.j + 1) % q.p.length; jawab(i, box.querySelector('.pil[data-i="' + i + '"]')); };
    box.scrollTop = 0;
  }
  function menang() {
    G.akhir = { betul: betulPertama, jumlah: UJI.length }; simpan(); sfx('menang'); G.uji = null;
    box.innerHTML = '<div class="kira">Kes ditutup</div><h3 class="sl">Raja Comot tumpas!</h3><p class="besar">Paya sudah dibersihkan dan nyamuk tiada tempat membiak. Taman Seri Bersih selamat semula.</p><button type="button" class="gbtn" data-uji="laporan">' + ic('trophy', 18) + '<span>Lihat laporan detektif</span></button>';
    box.querySelector('button').onclick = function () { el.hidden = true; bukaLaporan(); };
  }
  soal();
}
