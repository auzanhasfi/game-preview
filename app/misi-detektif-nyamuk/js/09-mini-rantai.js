/* Misi Detektif Nyamuk: mini 2 "Susun rantai jangkitan" — ketik kad mengikut urutan. */
'use strict';
MINI.rantai = function (isi, selesai) {
  var m = kepalaMini(isi, 'Susun rantai jangkitan', 'Ketik kad mengikut urutan yang betul, dari langkah 1 hingga 4.');
  var kad = acak(RANTAI.map(function (t, i) { return { t: t, i: i }; })), seterus = 0, salahPertama = {}, betul = 0;
  m.innerHTML = '<ol class="slot">' + RANTAI.map(function (_, i) { return '<li data-s="' + i + '"><span class="no">' + (i + 1) + '</span><span class="tx">...</span></li>'; }).join('') + '</ol>' +
    '<div class="kadsusun">' + kad.map(function (k) { return '<button type="button" class="ks" data-uji="kad" data-i="' + k.i + '">' + esc(k.t) + '</button>'; }).join('') + '</div><div class="maklum" hidden></div>';
  var mk = m.querySelector('.maklum');
  function tekan(b) {
    var i = +b.dataset.i;
    if (i === seterus) {
      if (!salahPertama[i]) betul++;
      var li = m.querySelector('.slot li[data-s="' + i + '"]'); li.classList.add('isi'); li.querySelector('.tx').textContent = RANTAI[i];
      b.remove(); seterus++; sfx('dedah'); mk.hidden = true;
      if (seterus >= RANTAI.length) {
        maklum(mk, true, 'Rantai lengkap! Penyakit merebak dari pesakit kepada orang sihat melalui gigitan nyamuk.');
        mk.insertAdjacentHTML('beforeend', '<button type="button" class="gbtn kecil" data-uji="mini-lanjut">Selesai</button>');
        mk.querySelector('button').onclick = function () { selesai(betul, RANTAI.length); };
        G.uji = function () { mk.querySelector('button').click(); };
      }
    } else { salahPertama[seterus] = 1; b.classList.add('goyang'); setTimeout(function () { b.classList.remove('goyang'); }, 400); maklum(mk, false, 'Bukan langkah ' + (seterus + 1) + '. Fikir: apa yang berlaku dahulu?'); }
  }
  m.querySelectorAll('.ks').forEach(function (b) { b.onclick = function () { tekan(b); }; });
  G.uji = function (ok) { var b = ok ? m.querySelector('.ks[data-i="' + seterus + '"]') : m.querySelector('.ks:not([data-i="' + seterus + '"])'); if (b) tekan(b); else if (ok && seterus >= RANTAI.length) mk.querySelector('button').click(); };
};
