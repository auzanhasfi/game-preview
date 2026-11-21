/* Teks UI: ms (Bahasa Melayu) dan id (Bahasa Indonesia). */
(function (root) {
  'use strict';
  const D = {
    ms: {
      tajuk: 'Bulat Rebut Wilayah', sub: 'Lukis laluan, tutup kawasan, capai sasaran dengan tepat!',
      mula: 'Main', bm: 'Bahasa Melayu', id: 'Bahasa Indonesia', petaT: 'Pilih tahap', tahap: 'Tahap',
      cara1: 'Sapu skrin atau tekan anak panah untuk menggerakkan Si Bulat.',
      cara2: 'Keluar dari kawasan biru, lukis ekor, lalu pulang. Ruang tanpa kutu menjadi milikmu.',
      cara3: 'Capai peratus sasaran dalam julat tepat. Terlebih? Tawanan dibatalkan!',
      cara4: 'Jaga ekor! Kutu peronda yang memotongnya mengambil satu nyawa.',
      sasaran: 'Tawan', kawasan: 'Kawasan', nyawa: 'Nyawa', skor: 'Skor', papan: 'papan', julat: 'Julat tepat',
      baki: 'Kurang {n}% lagi', mulaTeks: 'Sapu atau tekan anak panah untuk bermula',
      jeda: 'Jeda', teruskan: 'Teruskan', ulang: 'Ulang', ketahap: 'Peta', seterusnya: 'Tahap seterusnya', balik: 'Kembali', bunyi: 'Bunyi',
      hMenang: 'Tepat sekali!', hKalah: 'Nyawa habis', hasilK: 'Kawasan', hasilS: 'Sasaran', hasilN: 'Nyawa tinggal', hasilSk: 'Skor', terbaik: 'Terbaik', rekod: 'Rekod baharu!',
      kerja: 'Pengiraan',
      mMula: 'Tawan {s}. Itu {e}.', mTawan: 'Bagus! +{g}%. Kini {p}%.', mTawan1: 'Kini {p}%. Teruskan!',
      mTerlebih: 'Terlebih! Itu jadi {p}%, sasaran hanya {lo}% hingga {hi}%. Cuba kawasan lebih kecil.',
      mPotong: 'Aduh, ekor terpotong! Nyawa tinggal {n}.', mSendiri: 'Ekor sendiri terlanggar! Nyawa tinggal {n}.',
      mMenang: 'Tepat! {p}% berada dalam julat {lo}%-{hi}%.', mKalah: 'Kutu terlalu laju. Cuba lagi!',
      tutupJeda: 'Permainan dijeda', eq: '= {x}', hampir: 'hampir'
    },
    id: {
      tajuk: 'Bulat Rebut Wilayah', sub: 'Lukis jalur, tutup wilayah, capai target dengan tepat!',
      mula: 'Main', bm: 'Bahasa Melayu', id: 'Bahasa Indonesia', petaT: 'Pilih level', tahap: 'Level',
      cara1: 'Geser layar atau tekan tombol panah untuk menggerakkan Si Bulat.',
      cara2: 'Keluar dari wilayah biru, lukis ekor, lalu pulang. Ruang tanpa kutu jadi milikmu.',
      cara3: 'Capai persen target dalam rentang tepat. Berlebih? Rebutan dibatalkan!',
      cara4: 'Jaga ekormu! Kutu peronda yang memotongnya mengambil satu nyawa.',
      sasaran: 'Rebut', kawasan: 'Wilayah', nyawa: 'Nyawa', skor: 'Skor', papan: 'papan', julat: 'Rentang tepat',
      baki: 'Kurang {n}% lagi', mulaTeks: 'Geser atau tekan tombol panah untuk mulai',
      jeda: 'Jeda', teruskan: 'Lanjutkan', ulang: 'Ulangi', ketahap: 'Peta', seterusnya: 'Level berikutnya', balik: 'Kembali', bunyi: 'Suara',
      hMenang: 'Tepat sekali!', hKalah: 'Nyawa habis', hasilK: 'Wilayah', hasilS: 'Target', hasilN: 'Sisa nyawa', hasilSk: 'Skor', terbaik: 'Terbaik', rekod: 'Rekor baru!',
      kerja: 'Hitungan',
      mMula: 'Rebut {s}. Itu {e}.', mTawan: 'Bagus! +{g}%. Sekarang {p}%.', mTawan1: 'Sekarang {p}%. Lanjutkan!',
      mTerlebih: 'Berlebih! Itu jadi {p}%, target hanya {lo}% sampai {hi}%. Coba wilayah lebih kecil.',
      mPotong: 'Aduh, ekor terpotong! Sisa nyawa {n}.', mSendiri: 'Menabrak ekor sendiri! Sisa nyawa {n}.',
      mMenang: 'Tepat! {p}% ada dalam rentang {lo}%-{hi}%.', mKalah: 'Kutu terlalu cepat. Coba lagi!',
      tutupJeda: 'Permainan dijeda', eq: '= {x}', hampir: 'hampir'
    }
  };
  let lang = 'ms';
  function t(k, p) { let s = (D[lang] && D[lang][k]) || D.ms[k] || k; if (p) for (const q in p) s = s.split('{' + q + '}').join(p[q]); return s; }
  /* nombor perpuluhan: ms guna titik, id guna koma */
  function nombor(s) { return lang === 'id' ? String(s).replace(/(\d)\.(\d)/g, '$1,$2') : String(s); }
  root.RWI18N = { t: t, nombor: nombor, get lang() { return lang; }, set lang(v) { lang = v === 'id' ? 'id' : 'ms'; } };
})(typeof self !== 'undefined' ? self : this);
