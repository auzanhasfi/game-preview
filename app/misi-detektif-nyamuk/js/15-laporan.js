/* Misi Detektif Nyamuk: laporan & sijil, Buku Kes (ulang kaji semua pelajaran), dan nota guru (ASSURE). */
'use strict';
function tahapTP() {
  return STESEN.map(function (s) { var k = G.skor[s.id], p = k && k.jumlah ? k.betul / k.jumlah : 0; return { s: s, ada: !!k, p: p, lencana: !k ? 'belum' : p >= 0.8 ? 'emas' : p >= 0.5 ? 'perak' : 'gangsa' }; });
}
function bukaLaporan() {
  G.keadaan = 'laporan'; var el = $('#laporan'), tp = tahapTP(), a = G.akhir || { betul: 0, jumlah: UJI.length };
  var jumB = 0, jumJ = 0; STESEN.forEach(function (s) { var k = G.skor[s.id]; if (k) { jumB += k.betul; jumJ += k.jumlah; } }); jumB += a.betul; jumJ += a.jumlah;
  var pct = jumJ ? Math.round(jumB / jumJ * 100) : 0;
  el.hidden = false;
  el.innerHTML = '<div class="lap-kotak"><div class="sijil"><span class="eyebrow">Sijil</span><h2>Detektif Nyamuk Muda</h2><p>Dengan ini diakui bahawa</p><input id="nama-sijil" class="nama" maxlength="28" placeholder="Tulis nama kamu" value="' + esc(G.nama || '') + '" aria-label="Nama untuk sijil"><p>telah menyelesaikan kes <b>Tiada Nyamuk, Tiada Penyakit</b> di Taman Seri Bersih.</p><div class="angka"><div><b>' + pct + '%</b><small>tepat cubaan pertama</small></div><div><b>' + G.tangkap + '</b><small>nyamuk ditangkap</small></div><div><b>' + G.bersih + '</b><small>takungan dibersihkan</small></div></div></div>' +
    '<div class="tp-senarai"><span class="eyebrow">Tahap Penguasaan (untuk guru)</span>' + tp.map(function (x) { return '<div class="tp-baris l-' + x.lencana + '"><span class="lnc">' + ic(x.lencana === 'belum' ? 'lock' : 'star', 18) + '</span><span class="tpn"><b>' + x.s.tp + '</b> ' + esc(x.s.misi) + '</span><span class="tpp">' + (x.ada ? Math.round(x.p * 100) + '%' : '–') + '</span></div>'; }).join('') +
    '<div class="tp-baris l-' + (a.jumlah && a.betul / a.jumlah >= 0.8 ? 'emas' : 'perak') + '"><span class="lnc">' + ic('crown', 18) + '</span><span class="tpn"><b>Uji Minda</b> Serbuan Raja Comot</span><span class="tpp">' + a.betul + '/' + a.jumlah + '</span></div></div>' +
    (G.poster ? '<div class="poster-akhir"><span class="eyebrow">Poster kamu</span><img src="' + G.poster + '" alt="Poster pencegahan nyamuk yang kamu cipta"></div>' : '') +
    '<div class="lap-butang"><button type="button" class="gbtn" data-uji="ke-peta">' + ic('pin', 18) + '<span>Teruskan meronda</span></button><button type="button" class="bbtn" data-uji="buku">' + ic('notebook', 18) + '<span>Buku Kes</span></button><button type="button" class="bbtn" data-uji="semula">' + ic('refresh', 18) + '<span>Main semula</span></button></div></div>';
  el.querySelector('#nama-sijil').oninput = function () { G.nama = this.value; simpan(); };
  el.querySelector('[data-uji="ke-peta"]').onclick = function () { el.hidden = true; G.keadaan = 'peta'; kemasHud(); };
  el.querySelector('[data-uji="buku"]').onclick = bukaBuku;
  el.querySelector('[data-uji="semula"]').onclick = function () { padamSimpanan(); location.reload(); };
}
function bukaBuku() {
  var el = $('#buku'); el.hidden = false; diam();
  el.innerHTML = '<div class="buku-kotak"><div class="buku-kepala"><div><span class="eyebrow">Buku Kes</span><h2>Ulang kaji petunjuk</h2></div><button type="button" class="xbtn" data-uji="tutup-buku" aria-label="Tutup">' + ic('close', 20) + '</button></div>' +
    STESEN.map(function (s, i) {
      var ada = G.selesai.indexOf(s.id) >= 0;
      return '<section class="bab' + (ada ? '' : ' kunci') + '"><h3><span class="nob">' + (i + 1) + '</span>' + esc(s.misi) + ' <small>' + s.tp + '</small></h3>' +
        (ada ? '<blockquote class="bkt">' + esc(s.bukti) + '</blockquote>' + s.kad.map(function (k) { return '<div class="rk"><b>' + esc(k.tajuk) + '</b><ul>' + k.dedah.map(function (d) { return '<li><b>' + esc(d[0]) + '</b>' + (d[1] ? ': ' + esc(d[1]) : '') + '</li>'; }).join('') + '</ul></div>'; }).join('') : '<p class="redup">Belum disiasat. Pergi ke ' + esc(s.nama) + ' di peta.</p>') + '</section>';
    }).join('') + '</div>';
  el.querySelector('[data-uji="tutup-buku"]').onclick = function () { el.hidden = true; };
}
function bukaGuru() {
  var el = $('#buku'); el.hidden = false;
  el.innerHTML = '<div class="buku-kotak"><div class="buku-kepala"><div><span class="eyebrow">Untuk guru · model ASSURE</span><h2>Panduan guru</h2></div><button type="button" class="xbtn" data-uji="tutup-buku" aria-label="Tutup">' + ic('close', 20) + '</button></div>' +
    '<section class="bab"><h3>Sasaran</h3><p>Pendidikan Kesihatan Tahun 3, Unit 6.0 Penyakit, SP 6.1.1–6.1.3 (buku teks hlm. 82–85). Masa: 3 sesi (Minggu 19–21 RPT 2026), atau satu sesi panjang ±60 minit.</p></section>' +
    '<section class="bab"><h3>Objektif (ABCD)</h3><ul><li>Murid dapat menyatakan simptom demam denggi dan demam malaria (TP1).</li><li>Murid dapat menyusun urutan cara penyakit merebak (TP2).</li><li>Murid dapat memilih tindakan betul bagi sekurang-kurangnya 5 daripada 6 tempat pembiakan (TP3).</li><li>Murid dapat membezakan simptom dan meramal kesan kepada diri dan keluarga (TP4–TP5).</li><li>Murid dapat mereka cipta poster pencegahan (TP6).</li></ul></section>' +
    '<section class="bab"><h3>Cara guna (5P)</h3><ul><li>Main sekali sebelum kelas.</li><li>Paparkan di papan pintar; guru mainkan latihan tangkap nyamuk bersama kelas.</li><li>Kumpulan 4 murid, satu tablet, bergilir memegang tablet setiap stesen.</li><li>Soalan cetusan: "Siapa pernah digigit nyamuk? Bila?"</li><li>Selepas permainan, murid buat Uji Minda hlm. 85 di kertas.</li></ul></section>' +
    '<section class="bab"><h3>Penilaian</h3><p>Skrin laporan menunjukkan peratus betul cubaan pertama bagi setiap TP. Kemajuan disimpan dalam peranti ini sahaja; tiada data murid dihantar.</p><p class="redup">Nota isi: buku teks menyebut "virus malaria"; permainan ini menggunakan istilah tepat "parasit malaria".</p></section></div>';
  el.querySelector('[data-uji="tutup-buku"]').onclick = function () { el.hidden = true; };
}
