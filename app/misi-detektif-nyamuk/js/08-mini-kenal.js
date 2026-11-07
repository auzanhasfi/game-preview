/* Misi Detektif Nyamuk: mini 1 "Siapa ini?" — baca petunjuk, pilih Aedes atau tiruk. */
'use strict';
var MINI = {};

/* pembantu bersama semua mini */
function maklum(el, betul, teks) { el.className = 'maklum ' + (betul ? 'ya' : 'tidak'); el.innerHTML = ic(betul ? 'check' : 'close', 20) + '<span>' + esc(teks) + '</span>'; el.hidden = false; sfx(betul ? 'correct' : 'wrong'); }
function kepalaMini(isi, tajuk, arahan) { isi.innerHTML = '<div class="tks"><span class="eyebrow">Cabaran</span><h3>' + esc(tajuk) + '</h3><p class="arahan besar">' + esc(arahan) + '</p></div><div class="mini"></div>'; return isi.querySelector('.mini'); }

MINI.kenal = function (isi, selesai) {
  var soal = acak(KENAL).slice(0, 4), n = 0, betul = 0;
  var m = kepalaMini(isi, 'Siapa ini?', 'Baca petunjuk. Nyamuk manakah suspeknya?');
  function papar() {
    var q = soal[n], cuba = 0;
    m.innerHTML = '<div class="kira">Soalan ' + (n + 1) + ' / ' + soal.length + '</div><div class="seni kecil"><canvas data-seni="' + q.seni + '"></canvas></div><p class="petunjuk">' + ic('search', 20) + '<span>' + esc(q.petunjuk) + '</span></p>' +
      '<div class="pilih2"><button type="button" class="pil" data-v="aedes" data-uji="pilih"><b>Nyamuk Aedes</b><small>pembawa denggi</small></button><button type="button" class="pil" data-v="tiruk" data-uji="pilih"><b>Nyamuk tiruk</b><small>pembawa malaria</small></button></div><div class="maklum" hidden></div>';
    daftarSeni(m);
    var mk = m.querySelector('.maklum');
    function jawab(v, b) {
      if (v === q.jawapan) {
        if (!cuba) betul++;
        m.querySelectorAll('.pil').forEach(function (x) { x.disabled = true; }); if (b) b.classList.add('betul');
        maklum(mk, true, 'Betul! ' + (q.jawapan === 'aedes' ? 'Nyamuk Aedes: belang putih, menggigit siang, bawa virus denggi.' : 'Nyamuk tiruk: hinggap menunduk, menggigit malam, bawa parasit malaria.'));
        mk.insertAdjacentHTML('beforeend', '<button type="button" class="gbtn kecil" data-uji="mini-lanjut">' + (n + 1 < soal.length ? 'Soalan seterusnya' : 'Selesai') + '</button>');
        mk.querySelector('button').onclick = function () { n++; if (n < soal.length) papar(); else selesai(betul, soal.length); };
        G.uji = function () { mk.querySelector('button').click(); };
      } else { cuba++; if (b) { b.classList.add('salah'); b.disabled = true; } maklum(mk, false, 'Belum tepat. Lihat semula petunjuk: ' + q.petunjuk); }
    }
    m.querySelectorAll('.pil').forEach(function (b) { b.onclick = function () { jawab(b.dataset.v, b); }; });
    G.uji = function (ok) { var v = ok ? q.jawapan : (q.jawapan === 'aedes' ? 'tiruk' : 'aedes'); jawab(v, m.querySelector('.pil[data-v="' + v + '"]')); };
  }
  papar();
};
