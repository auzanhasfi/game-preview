/* Misi Detektif Nyamuk: mini 3 "Klinik Simptom" — isih simptom pesakit, kemudian buat diagnosis. */
'use strict';
var KUMP = { d: ['Demam denggi', DENG], m: ['Demam malaria', MAL], k: ['Kedua-duanya', DUA] };
SENI.pesakit = function (w, h, t, c) {
  var p = PESAKIT[+c.getAttribute('data-p')] || PESAKIT[0], i = PESAKIT.indexOf(p);
  latar(w, h, '#eef4f3'); lantai(w, h, h - 20, '#d9e4e2');
  var sk = Math.max(1.4, h / 62); drawOrang(w * 0.3, h - 20, sk, { kot: true, tudung: '#d6496a', t: t });
  var o = [{ tudung: '#7f9fd9', baju: '#f19bb4', sakit: true, ruam: true }, { baju: '#9aa3a8', rambut: '#2e2620', kulit: '#8d5a3b', sakit: true, lemah: true }, { baju: '#f2c14e', sakit: true, ruam: true }][i];
  o.t = t; drawOrang(w * 0.68, h - 20, sk * (i === 1 ? 1.05 : 0.85), o);
};
MINI.simptom = function (isi, selesai) {
  var m = kepalaMini(isi, 'Klinik Simptom', 'Isih setiap simptom: demam denggi, demam malaria, atau kedua-duanya? Kemudian bantu Dr. Siti membuat diagnosis.');
  var pi = 0, betul = 0, jumlah = 0;
  function pesakit() {
    var p = PESAKIT[pi], ki = 0;
    function kad() {
      if (ki >= p.kad.length) return diagnosis();
      var k = p.kad[ki], cuba = 0;
      m.innerHTML = '<div class="kira">Pesakit ' + (pi + 1) + ' / ' + PESAKIT.length + ' · simptom ' + (ki + 1) + ' / ' + p.kad.length + '</div><div class="seni kecil"><canvas data-seni="pesakit" data-p="' + pi + '"></canvas></div>' +
        '<p class="petunjuk">' + ic('thermo', 20) + '<span><b>' + esc(p.nama) + '</b> (' + p.umur + ' tahun)' + (p.cerita ? ': ' + esc(p.cerita) : '') + '<br>Simptom: <b class="simp">' + esc(k[0]) + '</b></span></p>' +
        '<div class="pilih3">' + ['d', 'k', 'm'].map(function (v) { return '<button type="button" class="pil k-' + v + '" data-v="' + v + '" data-uji="pilih"><b>' + KUMP[v][0] + '</b></button>'; }).join('') + '</div><div class="maklum" hidden></div>';
      daftarSeni(m); var mk = m.querySelector('.maklum');
      function jawab(v, b) {
        if (v === k[1]) { if (!cuba) betul++; jumlah++; m.querySelectorAll('.pil').forEach(function (x) { x.disabled = true; }); if (b) b.classList.add('betul'); maklum(mk, true, k[0] + ': ' + (v === 'k' ? 'ada pada kedua-dua penyakit, jadi belum cukup untuk membezakan.' : 'petunjuk ' + KUMP[v][0].toLowerCase() + '.')); setTimeout(function () { ki++; kad(); }, 1300); G.uji = null; }
        else { if (!cuba) jumlah++; cuba++; if (b) { b.classList.add('salah'); b.disabled = true; } maklum(mk, false, 'Cuba lagi. Ingat petunjuk: ruam dan sakit sendi untuk denggi, menggigil dan pucat untuk malaria, demam, sakit kepala dan muntah untuk kedua-duanya.'); }
      }
      m.querySelectorAll('.pil').forEach(function (b) { b.onclick = function () { jawab(b.dataset.v, b); }; });
      G.uji = function (ok) { var v = ok ? k[1] : (k[1] === 'd' ? 'm' : 'd'); jawab(v, m.querySelector('.pil[data-v="' + v + '"]')); };
    }
    function diagnosis() {
      var cuba = 0;
      m.innerHTML = '<div class="kira">Diagnosis pesakit ' + (pi + 1) + '</div><div class="carta">' + p.kad.map(function (k) { return '<span class="cip k-' + k[1] + '">' + esc(k[0]) + '</span>'; }).join('') + '</div>' +
        '<p class="petunjuk">' + ic('clinic', 20) + '<span>Dr. Siti bertanya: apakah penyakit <b>' + esc(p.nama) + '</b>?</span></p><div class="pilih2"><button type="button" class="pil k-d" data-v="d" data-uji="pilih"><b>Demam denggi</b></button><button type="button" class="pil k-m" data-v="m" data-uji="pilih"><b>Demam malaria</b></button></div><div class="maklum" hidden></div>';
      var mk = m.querySelector('.maklum');
      function jawab(v, b) {
        if (v === p.jawapan) { if (!cuba) betul++; jumlah++; m.querySelectorAll('.pil').forEach(function (x) { x.disabled = true; }); if (b) b.classList.add('betul'); maklum(mk, true, 'Tepat! ' + (v === 'd' ? 'Ruam dan sakit sendi menunjukkan demam denggi.' : 'Menggigil, letih dan pucat, dan baru pulang dari kawasan hutan menunjukkan demam malaria.') + ' Doktor akan sahkan dengan ujian darah.');
          mk.insertAdjacentHTML('beforeend', '<button type="button" class="gbtn kecil" data-uji="mini-lanjut">' + (pi + 1 < PESAKIT.length ? 'Pesakit seterusnya' : 'Selesai') + '</button>');
          mk.querySelector('button').onclick = function () { pi++; if (pi < PESAKIT.length) pesakit(); else selesai(betul, jumlah); }; G.uji = function () { mk.querySelector('button').click(); }; }
        else { if (!cuba) jumlah++; cuba++; if (b) { b.classList.add('salah'); b.disabled = true; } maklum(mk, false, 'Lihat simptom yang berwarna. Simptom "kedua-duanya" tidak membantu; cari yang khas.'); }
      }
      m.querySelectorAll('.pil').forEach(function (b) { b.onclick = function () { jawab(b.dataset.v, b); }; });
      G.uji = function (ok) { var v = ok ? p.jawapan : (p.jawapan === 'd' ? 'm' : 'd'); jawab(v, m.querySelector('.pil[data-v="' + v + '"]')); };
    }
    kad();
  }
  pesakit();
};
