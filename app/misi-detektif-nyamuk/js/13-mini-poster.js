/* Misi Detektif Nyamuk: mini 6 "Studio Poster" — pilih tajuk, 3 langkah yang betul, warna; poster dilukis di kanvas. */
'use strict';
var PST = { tajuk: 0, langkah: [], warna: 0 };
SENI.posterKu = function (w, h, t) {
  var wr = POSTER_WARNA[PST.warna], bg = wr[0], fg = wr[1];
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 0.35; ctx.drawImage(grain, 0, 0, w, h); ctx.globalAlpha = 1;
  ctx.strokeStyle = fg; ctx.lineWidth = 3; ctx.strokeRect(8, 8, w - 16, h - 16);
  ctx.fillStyle = fg; ctx.textAlign = 'center'; var fs = Math.max(16, Math.min(30, w / 13)); ctx.font = '800 ' + fs + 'px Nunito, system-ui, sans-serif';
  var tj = POSTER_TAJUK[PST.tajuk].toUpperCase(), kata = tj.split(' '), baris = [], b = '';
  kata.forEach(function (k) { var c = b ? b + ' ' + k : k; if (ctx.measureText(c).width > w - 40) { baris.push(b); b = k; } else b = c; }); baris.push(b);
  baris.forEach(function (l, i) { ctx.fillText(l, w / 2, 24 + fs + i * fs * 1.1); });
  var y0 = 24 + fs * (baris.length + 0.4), gs = Math.min(w, h) / 230;
  ctx.save(); ctx.beginPath(); ctx.arc(w / 2, y0 + 50 * gs, 46 * gs, 0, 6.3); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  drawNyamuk(w / 2 - 4 * gs, y0 + 50 * gs, 2.2 * gs, 'aedes', t);
  ctx.beginPath(); ctx.moveTo(w / 2 - 32 * gs, y0 + 18 * gs); ctx.lineTo(w / 2 + 32 * gs, y0 + 82 * gs); ctx.lineWidth = 6 * gs; ctx.strokeStyle = DENG; ctx.stroke();
  drawClawd(w * 0.83, y0 + 92 * gs, { s: 1.3 * gs, face: -0.6, t: t, mood: 'happy' });
  ctx.font = '700 ' + Math.max(12, Math.min(17, w / 22)) + 'px Nunito, system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = fg;
  PST.langkah.forEach(function (li, i) { var y = y0 + 120 * gs + i * Math.max(22, 26 * gs); ctx.beginPath(); ctx.arc(26, y - 5, 9, 0, 6.3); ctx.fillStyle = fg; ctx.fill(); ctx.fillStyle = bg; ctx.textAlign = 'center'; ctx.fillText(i + 1, 26, y); ctx.textAlign = 'left'; ctx.fillStyle = fg; ctx.fillText(POSTER_LANGKAH[li][0], 42, y); });
  ctx.font = '600 11px Nunito, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Taman Seri Bersih · Detektif Nyamuk', w / 2, h - 16);
};
MINI.poster = function (isi, selesai) {
  PST = { tajuk: 0, langkah: [], warna: 0 }; var salah = 0;
  var m = kepalaMini(isi, 'Studio Poster', 'Pilih tajuk, TIGA langkah pencegahan yang betul, dan warna. Langkah yang salah akan ditolak.');
  m.innerHTML = '<div class="studio"><div class="poster"><canvas data-seni="posterKu"></canvas></div><div class="kawal">' +
    '<span class="eyebrow">1. Tajuk</span><div class="cips" data-k="tajuk">' + POSTER_TAJUK.map(function (t, i) { return '<button type="button" class="cip pilihan' + (i ? '' : ' on') + '" data-i="' + i + '">' + esc(t) + '</button>'; }).join('') + '</div>' +
    '<span class="eyebrow">2. Tiga langkah (<b class="nl">0</b>/3)</span><div class="cips" data-k="langkah">' + POSTER_LANGKAH.map(function (l, i) { return '<button type="button" class="cip pilihan" data-uji="langkah" data-i="' + i + '">' + esc(l[0]) + '</button>'; }).join('') + '</div>' +
    '<span class="eyebrow">3. Warna</span><div class="cips" data-k="warna">' + POSTER_WARNA.map(function (c, i) { return '<button type="button" class="sw' + (i ? '' : ' on') + '" data-i="' + i + '" style="background:' + c[0] + ';color:' + c[1] + '" aria-label="Warna ' + (i + 1) + '">Aa</button>'; }).join('') + '</div>' +
    '<div class="maklum" hidden></div><button type="button" class="gbtn" data-uji="tampal" disabled>' + ic('image', 18) + '<span>Tampal di balai raya</span></button></div></div>';
  daftarSeni(m);
  var mk = m.querySelector('.maklum'), tampal = m.querySelector('[data-uji="tampal"]');
  m.querySelectorAll('[data-k="tajuk"] .cip').forEach(function (b) { b.onclick = function () { PST.tajuk = +b.dataset.i; m.querySelectorAll('[data-k="tajuk"] .cip').forEach(function (x) { x.classList.toggle('on', x === b); }); sfx('tap'); }; });
  m.querySelectorAll('[data-k="warna"] .sw').forEach(function (b) { b.onclick = function () { PST.warna = +b.dataset.i; m.querySelectorAll('[data-k="warna"] .sw').forEach(function (x) { x.classList.toggle('on', x === b); }); sfx('tap'); }; });
  function langkah(b) {
    var i = +b.dataset.i, L = POSTER_LANGKAH[i], ada = PST.langkah.indexOf(i);
    if (ada >= 0) { PST.langkah.splice(ada, 1); b.classList.remove('on'); }
    else if (!L[1]) { salah++; b.classList.add('salah'); b.disabled = true; maklum(mk, false, 'Tidak boleh! ' + L[2]); }
    else if (PST.langkah.length >= 3) { maklum(mk, false, 'Hanya 3 langkah. Ketik langkah yang dipilih untuk membuangnya.'); }
    else { PST.langkah.push(i); b.classList.add('on'); sfx('dedah'); mk.hidden = true; }
    m.querySelector('.nl').textContent = PST.langkah.length; tampal.disabled = PST.langkah.length < 3;
  }
  m.querySelectorAll('[data-k="langkah"] .cip').forEach(function (b) { b.onclick = function () { langkah(b); }; });
  tampal.onclick = function () { try { G.poster = m.querySelector('canvas').toDataURL('image/png'); } catch (e) {} sfx('menang'); selesai(Math.max(0, 3 - salah), 3); };
  G.uji = function (ok) {
    if (!tampal.disabled) return tampal.click();
    if (!ok) { var s = m.querySelector('[data-k="langkah"] .cip:not(.salah):not(.on)[data-i="4"]'); if (s) return langkah(s); }
    var b = Array.prototype.filter.call(m.querySelectorAll('[data-k="langkah"] .cip:not(.on):not(.salah)'), function (x) { return POSTER_LANGKAH[+x.dataset.i][1]; })[0]; if (b) langkah(b);
  };
};
