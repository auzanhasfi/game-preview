/* Misi Detektif Nyamuk: mini 5 "Apa Akan Jadi?" — cerita bercabang, kemudian isih kesan kepada diri / keluarga / komuniti. */
'use strict';
MINI.cerita = function (isi, selesai) {
  var m = kepalaMini(isi, 'Apa akan jadi?', 'Pilih tindakan untuk keluarga Adam. Perhatikan apa yang berlaku. Kamu boleh undur masa dan cuba pilihan lain.');
  var dilawat = {};
  function nod(id) {
    var n = CERITA[id]; dilawat[id] = 1;
    m.innerHTML = '<div class="seni kecil"><canvas data-seni="' + n.seni + '"></canvas></div><p class="cerita besar">' + esc(n.teks) + '</p>' + (n.ramal ? '<p class="ramal">' + ic('eye', 20) + '<span>' + esc(n.ramal) + '</span></p>' : '') +
      '<div class="pilihcerita">' + (n.pilih || []).map(function (p) { return '<button type="button" class="pil lebar" data-ke="' + p[1] + '" data-uji="cerita">' + (p[1] === 'mula' || p[1] === 'klinik' && id === 'biar' ? ic('refresh', 18) : ic('arrowR', 18)) + '<b>' + esc(p[0]) + '</b></button>'; }).join('') + (n.tamat ? '<button type="button" class="gbtn" data-uji="mini-lanjut">' + ic('next', 18) + '<span>Seterusnya: ramal kesan</span></button>' : '') + '</div>';
    daftarSeni(m); sfx(n.ramal && !n.tamat ? 'wrong' : 'dedah');
    m.querySelectorAll('[data-ke]').forEach(function (b) { b.onclick = function () { nod(b.dataset.ke); }; });
    if (n.tamat) m.querySelector('.gbtn').onclick = isihKesan;
    G.uji = function (ok) { if (n.tamat) return isihKesan(); var bagus = { mula: 'klinik', klinik: 'bersih', tunggu: 'mula', biar: 'klinik' }[id]; nod(ok ? bagus : n.pilih[0][1]); };
  }
  function isihKesan() {
    var kad = acak(KESAN), i = 0, betul = 0;
    function satu() {
      if (i >= kad.length) { m.innerHTML = '<div class="maklum ya">' + ic('check', 20) + '<span>Hebat! Kamu boleh meramal kesan penyakit kepada diri, keluarga dan komuniti.</span><button type="button" class="gbtn kecil" data-uji="mini-lanjut">Selesai</button></div>'; m.querySelector('button').onclick = function () { selesai(betul, kad.length); }; G.uji = function () { m.querySelector('button').click(); }; sfx('correct'); return; }
      var k = kad[i], cuba = 0;
      m.innerHTML = '<div class="kira">Kesan ' + (i + 1) + ' / ' + kad.length + '</div><div class="seni kecil"><canvas data-seni="kesan"></canvas></div><p class="petunjuk">' + ic('eye', 20) + '<span>Jika demam denggi merebak: <b>' + esc(k[0]) + '</b>. Ini kesan kepada siapa?</span></p>' +
        '<div class="pilih3">' + [['diri', 'Diri sendiri'], ['keluarga', 'Keluarga'], ['komuniti', 'Komuniti']].map(function (p) { return '<button type="button" class="pil" data-v="' + p[0] + '" data-uji="pilih"><b>' + p[1] + '</b></button>'; }).join('') + '</div><div class="maklum" hidden></div>';
      daftarSeni(m); var mk = m.querySelector('.maklum');
      function jawab(v, b) { if (v === k[1]) { if (!cuba) betul++; m.querySelectorAll('.pil').forEach(function (x) { x.disabled = true; }); if (b) b.classList.add('betul'); maklum(mk, true, 'Betul, kesan kepada ' + (v === 'diri' ? 'diri sendiri' : v) + '.'); G.uji = null; setTimeout(function () { i++; satu(); }, 1100); } else { cuba++; if (b) { b.classList.add('salah'); b.disabled = true; } maklum(mk, false, 'Fikir semula: siapa yang paling terkesan?'); } }
      m.querySelectorAll('.pil').forEach(function (b) { b.onclick = function () { jawab(b.dataset.v, b); }; });
      G.uji = function (ok) { var v = ok ? k[1] : ['diri', 'keluarga', 'komuniti'].filter(function (x) { return x !== k[1]; })[0]; jawab(v, m.querySelector('.pil[data-v="' + v + '"]')); };
    }
    satu();
  }
  nod('mula');
};
