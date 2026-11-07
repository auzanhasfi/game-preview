/* Misi Detektif Nyamuk: mini 4 "Ronda Rumah" — cari 6 tempat pembiakan di laman, pilih tindakan yang betul. */
'use strict';
SENI.laman = function (w, h, t, c) {
  var b = c._bersih || {};
  ctx.fillStyle = '#cfe0f0'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#b7cf9a'; ctx.fillRect(0, h * 0.5, w, h * 0.5); ctx.beginPath(); ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5); stroke(1.2, INK);
  ctx.globalAlpha = 0.5; ctx.drawImage(grain, 0, 0, w, h); ctx.globalAlpha = 1;
  /* rumah Mira di belakang */
  ctx.fillStyle = '#f3e3c8'; ctx.fillRect(w * 0.08, h * 0.16, w * 0.5, h * 0.36); ctx.strokeStyle = INK; ctx.lineWidth = 1.3; ctx.strokeRect(w * 0.08, h * 0.16, w * 0.5, h * 0.36);
  ctx.beginPath(); ctx.moveTo(w * 0.05, h * 0.17); ctx.lineTo(w * 0.33, h * 0.03); ctx.lineTo(w * 0.61, h * 0.17); ctx.closePath(); ctx.fillStyle = CL; ctx.fill(); stroke(1.3, INK);
  ctx.fillStyle = '#6b4a2f'; ctx.fillRect(w * 0.3, h * 0.3, w * 0.07, h * 0.22); ctx.strokeRect(w * 0.3, h * 0.3, w * 0.07, h * 0.22);
  for (var f = 0.62; f < 1; f += 0.04) { ctx.beginPath(); ctx.moveTo(w * f, h * 0.5); ctx.lineTo(w * f, h * 0.38); stroke(1.4, '#8a6a43'); }
  var k = Math.min(w / 520, h / 300) * 1.25;
  RONDA.forEach(function (r) { var x = w * r.x / 100, y = h * r.y / 100, j = { pasu: 'pasu', tayar: 'tayar', tempayan: 'tempayan', tin: 'tin', tong: 'tong', longkang: 'longkang' }[r.id]; drawBekas(j, x, y + 8 * k, k, { t: t, bersih: b[r.id] }); if (!b[r.id]) { var a = terbang(x, y - 26 * k, 8, 5, t + r.x, 1.6); drawNyamuk(a[0], a[1], 0.7 * k, 'aedes', t); } });
};
MINI.ronda = function (isi, selesai) {
  var m = kepalaMini(isi, 'Ronda laman Mira', 'Cari 6 tempat nyamuk membiak. Ketik setiap satu dan pilih tindakan yang betul.');
  var siap = {}, cuba = {}, betul = 0, kini = null;
  m.innerHTML = '<div class="kira">Ditemui: <b class="jum">0</b> / ' + RONDA.length + '</div><div class="laman"><canvas data-seni="laman"></canvas>' + RONDA.map(function (r) { return '<button type="button" class="titik" data-uji="titik" data-id="' + r.id + '" style="left:' + r.x + '%;top:' + (r.y - 8) + '%" aria-label="' + esc(r.nama) + '">' + ic('search', 20) + '</button>'; }).join('') + '</div>' +
    '<div class="tindak" hidden><p class="petunjuk">' + ic('drop', 20) + '<span class="nm"></span></p><div class="pilih2">' + Object.keys(TINDAKAN).map(function (k) { return '<button type="button" class="pil" data-v="' + k + '" data-uji="pilih"><b>' + TINDAKAN[k] + '</b></button>'; }).join('') + '</div></div><div class="maklum" hidden></div>';
  var kanv = m.querySelector('canvas'); kanv._bersih = siap; daftarSeni(m);
  var td = m.querySelector('.tindak'), mk = m.querySelector('.maklum');
  function pilihTitik(id) { kini = RONDA.filter(function (r) { return r.id === id; })[0]; m.querySelectorAll('.titik').forEach(function (b) { b.classList.toggle('aktif', b.dataset.id === id); }); td.hidden = false; td.querySelector('.nm').innerHTML = 'Ditemui: <b>' + esc(kini.nama) + '</b>. Apakah tindakan kamu?'; td.querySelectorAll('.pil').forEach(function (b) { b.disabled = false; b.classList.remove('salah'); }); mk.hidden = true; sfx('dedah'); td.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  function jawab(v, b) {
    if (!kini) return;
    if (v === kini.betul) {
      if (!cuba[kini.id]) betul++; siap[kini.id] = 1; sfx('bersih');
      var bt = m.querySelector('.titik[data-id="' + kini.id + '"]'); bt.classList.add('siap'); bt.classList.remove('aktif'); bt.disabled = true; bt.innerHTML = ic('check', 20);
      td.hidden = true; maklum(mk, true, kini.sebab); kini = null;
      var n = Object.keys(siap).length; m.querySelector('.jum').textContent = n;
      if (n >= RONDA.length) { mk.insertAdjacentHTML('beforeend', '<button type="button" class="gbtn kecil" data-uji="mini-lanjut">Laman bersih! Selesai</button>'); mk.querySelector('button').onclick = function () { selesai(betul, RONDA.length); }; }
    } else { cuba[kini.id] = 1; if (b) { b.classList.add('salah'); b.disabled = true; } maklum(mk, false, 'Belum sesuai untuk ' + kini.nama.toLowerCase() + '. Fikir: bagaimana supaya air tidak bertakung lagi?'); }
  }
  m.querySelectorAll('.titik').forEach(function (b) { b.onclick = function () { pilihTitik(b.dataset.id); }; });
  td.querySelectorAll('.pil').forEach(function (b) { b.onclick = function () { jawab(b.dataset.v, b); }; });
  G.uji = function (ok) {
    var lb = mk.querySelector('button'); if (lb) { lb.click(); return; }
    if (!kini) { var r = RONDA.filter(function (x) { return !siap[x.id]; })[0]; if (r) pilihTitik(r.id); }
    var v = ok ? kini.betul : Object.keys(TINDAKAN).filter(function (k) { return k !== kini.betul; })[0]; jawab(v, td.querySelector('.pil[data-v="' + v + '"]'));
  };
};
