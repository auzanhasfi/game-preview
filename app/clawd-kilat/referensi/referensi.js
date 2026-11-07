/* Halaman referensi: render daftar + filter + cari */
'use strict';
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var fS = 'semua', fC = 'semua', q = '';
  $('nSumber').textContent = SUMBER.length;
  $('nCatatan').textContent = CATATAN.length;
  $('nTotal').textContent = SUMBER.length + CATATAN.length;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function chips(el, kat, list, cur, set) {
    var html = '<button data-k="semua" aria-pressed="' + (cur === 'semua') + '">Semua <b>' + list.length + '</b></button>';
    Object.keys(kat).forEach(function (k) {
      var n = list.filter(function (r) { return r[0] === k; }).length;
      html += '<button data-k="' + k + '" aria-pressed="' + (cur === k) + '">' + esc(kat[k]) + ' <b>' + n + '</b></button>';
    });
    el.innerHTML = html;
    el.onclick = function (e) { var b = e.target.closest('button'); if (b) set(b.dataset.k); };
  }
  function cocok(r) { return !q || r.join(' ').toLowerCase().indexOf(q) >= 0; }
  function render() {
    chips($('fSumber'), KAT_SUMBER, SUMBER, fS, function (k) { fS = k; render(); });
    chips($('fCatatan'), KAT_CATATAN, CATATAN, fC, function (k) { fC = k; render(); });
    $('lSumber').innerHTML = SUMBER.map(function (r, i) {
      if ((fS !== 'semua' && r[0] !== fS) || !cocok(r)) return '';
      var host = r[2].replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
      return '<li><span class="no">' + String(i + 1).padStart(3, '0') + '</span><div><a href="' + esc(r[2]) + '" target="_blank" rel="noopener">' + esc(r[1]) + '</a><p>' + esc(r[3]) + '</p><span class="host">' + esc(KAT_SUMBER[r[0]]) + ' · ' + esc(host) + '</span></div></li>';
    }).join('');
    $('lCatatan').innerHTML = CATATAN.map(function (r, i) {
      if ((fC !== 'semua' && r[0] !== fC) || !cocok(r)) return '';
      return '<div class="baris"><span class="no">' + String(SUMBER.length + i + 1).padStart(3, '0') + '</span><span class="kat">' + esc(KAT_CATATAN[r[0]]) + '</span><p class="amat">' + esc(r[1]) + '</p><p class="pakai"><span class="ttl">Di game</span>' + esc(r[2]) + '</p></div>';
    }).join('');
  }
  $('cari').addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); render(); });
  render();
})();
