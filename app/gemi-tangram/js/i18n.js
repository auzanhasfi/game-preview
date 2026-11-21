/* Teks UI dwibahasa BM (ms) / ID (id). */
(function (root) {
  'use strict';
  const T = {
    ms: {
      tajuk: 'Gemi Tangram', sub: 'Susun tujuh kepingan geometri ke dalam siluet. Seret, putar dan balikkan sehingga padan, lalu temui pecahannya!',
      mula: 'Main', bm: 'Bahasa Melayu', id: 'Bahasa Indonesia', peta: 'Pilih siluet', kembali: 'Kembali', bunyi: 'Bunyi', tukar: 'Tukar bahasa',
      cara: 'Seret kepingan ke siluet. Ketik kepingan yang dipilih untuk putar 45°. Segi empat selari boleh dibalikkan.',
      aturBintang: 'Bintang: 3 = cepat tanpa petunjuk. Setiap petunjuk atau lewat masa menolak satu bintang.',
      putar: 'Putar', balik: 'Balik', petunjuk: 'Petunjuk', ulang: 'Ulang', kepingan: 'Kepingan', masa: 'Masa',
      siluet: 'Siluet', kunci: 'Terkunci', seterusnya: 'Seterusnya', ke_peta: 'Peta', main_lagi: 'Ulang',
      nama_L: 'Segi tiga besar', nama_M: 'Segi tiga sederhana', nama_S: 'Segi tiga kecil', nama_Q: 'Segi empat sama', nama_P: 'Segi empat selari',
      mulaSil: 'Susun kepingan ke dalam siluet {n}!', mulaKunci: '{k} kepingan sudah dipasang. Susun yang lain!',
      snap: '{p} = {f} daripada keseluruhan', hampir: 'Hampir! Putar atau balikkan kepingan ini.', hampir2: 'Hampir! Cuba letak lebih tepat.',
      pilihDulu: 'Pilih satu kepingan dahulu.', cadang: 'Petunjuk: letakkan {p} di tempat yang berkelip.', tiadaBalik: 'Kepingan ini sama sahaja bila dibalik; cuba putar.',
      siap: 'Hebat! {n} siap!', hTajuk: 'Siap: {n}!', hStat: 'Masa {t} · Petunjuk {h} · Par {p}',
      pecahanTajuk: 'Setiap kepingan ialah pecahan daripada keseluruhan (8 petak):', daripada: 'daripada keseluruhan', petak: 'petak',
      jumlah: 'Jumlah: {s} = 1 keseluruhan',
      fakta: [
        'Dua segi tiga kecil boleh menjadi satu segi empat sama: 1/16 + 1/16 = 1/8.',
        'Satu segi tiga besar = dua segi tiga sederhana: 1/4 = 1/8 + 1/8.',
        'Segi empat selari dan segi empat sama sama luas, masing-masing 1/8.',
        'Dua segi tiga besar sahaja sudah separuh daripada keseluruhan: 1/4 + 1/4 = 1/2.'
      ],
      bintangTeks: ['Bagus, cuba lagi untuk lebih bintang!', 'Cantik sekali!', 'Sempurna! Tiga bintang!'],
      aria_siluet: 'Siluet {n}, {b} bintang', terkunciPeta: 'Selesaikan siluet sebelumnya dahulu'
    },
    id: {
      tajuk: 'Gemi Tangram', sub: 'Susun tujuh keping geometri ke dalam siluet. Geser, putar, dan balikkan sampai pas, lalu temukan pecahannya!',
      mula: 'Main', bm: 'Bahasa Melayu', id: 'Bahasa Indonesia', peta: 'Pilih siluet', kembali: 'Kembali', bunyi: 'Suara', tukar: 'Ganti bahasa',
      cara: 'Geser keping ke siluet. Ketuk keping yang dipilih untuk memutar 45°. Jajargenjang bisa dibalik.',
      aturBintang: 'Bintang: 3 = cepat tanpa petunjuk. Tiap petunjuk atau kelewat waktu mengurangi satu bintang.',
      putar: 'Putar', balik: 'Balik', petunjuk: 'Petunjuk', ulang: 'Ulang', kepingan: 'Keping', masa: 'Waktu',
      siluet: 'Siluet', kunci: 'Terkunci', seterusnya: 'Lanjut', ke_peta: 'Peta', main_lagi: 'Ulang',
      nama_L: 'Segitiga besar', nama_M: 'Segitiga sedang', nama_S: 'Segitiga kecil', nama_Q: 'Persegi', nama_P: 'Jajargenjang',
      mulaSil: 'Susun keping ke dalam siluet {n}!', mulaKunci: '{k} keping sudah terpasang. Susun sisanya!',
      snap: '{p} = {f} dari keseluruhan', hampir: 'Hampir! Putar atau balikkan keping ini.', hampir2: 'Hampir! Coba letakkan lebih tepat.',
      pilihDulu: 'Pilih satu keping dulu.', cadang: 'Petunjuk: letakkan {p} di tempat yang berkedip.', tiadaBalik: 'Keping ini sama saja jika dibalik; coba putar.',
      siap: 'Hebat! {n} selesai!', hTajuk: 'Selesai: {n}!', hStat: 'Waktu {t} · Petunjuk {h} · Par {p}',
      pecahanTajuk: 'Tiap keping adalah pecahan dari keseluruhan (8 petak):', daripada: 'dari keseluruhan', petak: 'petak',
      jumlah: 'Jumlah: {s} = 1 keseluruhan',
      fakta: [
        'Dua segitiga kecil bisa jadi satu persegi: 1/16 + 1/16 = 1/8.',
        'Satu segitiga besar = dua segitiga sedang: 1/4 = 1/8 + 1/8.',
        'Jajargenjang dan persegi sama luas, masing-masing 1/8.',
        'Dua segitiga besar saja sudah setengah dari keseluruhan: 1/4 + 1/4 = 1/2.'
      ],
      bintangTeks: ['Bagus, coba lagi untuk bintang lebih banyak!', 'Keren sekali!', 'Sempurna! Tiga bintang!'],
      aria_siluet: 'Siluet {n}, {b} bintang', terkunciPeta: 'Selesaikan siluet sebelumnya dulu'
    }
  };
  let loc = 'ms';
  try { const s = localStorage.getItem('tg.lang'); if (s === 'id' || s === 'ms') loc = s; } catch (e) {}
  root.TGI18N = {
    get loc() { return loc; },
    set(l) { loc = l === 'id' ? 'id' : 'ms'; try { localStorage.setItem('tg.lang', loc); } catch (e) {} document.documentElement.lang = loc; },
    t(k, v) { let s = T[loc][k]; if (s === undefined) s = T.ms[k]; if (typeof s !== 'string') return s; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; },
    raw(k) { return T[loc][k]; },
    nama(sil) { return loc === 'id' ? sil.idn : sil.ms; }
  };
})(typeof self !== 'undefined' ? self : this);
