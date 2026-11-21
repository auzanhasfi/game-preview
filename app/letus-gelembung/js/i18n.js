(function (root) {
  'use strict';
  const T = {
    ms: {
      tajuk: 'Clawd Letus Gelembung', sub: 'Tembak gelembung yang membawa jawapan betul. Pantulkan mutiara pada dinding!',
      mula: 'Mula Main', cara: 'Sentuh dan seret untuk membidik, lepas untuk menembak. Gelembung salah menambah baris.',
      peta: 'Pilih Tahap', skor: 'Skor', soalan: 'Soalan', kombo: 'Kombo', terbaik: 'Terbaik',
      petunjuk: 'Seret untuk membidik, lepas untuk menembak.', petunjukKunci: 'Gerakkan tetikus untuk membidik, klik atau Ruang untuk menembak.',
      ulang: 'Main Semula', seterusnya: 'Tahap Seterusnya', kePeta: 'Pilih Tahap', kembali: 'Kembali', bahasa: 'ID', bunyiOn: 'Bunyi hidup', bunyiOff: 'Bunyi mati',
      menang: 'Hebat! Tahap lulus', kalah: 'Gelembung sampai bawah', tahap: 'Tahap', bintang: 'bintang', pasangbaris: 'Baris baharu', pantulan: 'Pantulan!',
      jatuh: 'Jatuh', berantai: 'Berantai',
      op: { '+': 'Tambah', '-': 'Tolak', '*': 'Darab', m: 'Campuran' },
      sub_tahap: ['Tambah hingga 10', 'Tambah hingga 30', 'Tolak', 'Jadual 2–5', 'Jadual 2–9', 'Campuran', 'Cabaran'],
      tahapDikunci: 'Dikunci', bm: 'Bahasa Melayu', id: 'Bahasa Indonesia', puji: ['Bagus!', 'Tepat!', 'Hebat!', 'Pintar!']
    },
    id: {
      tajuk: 'Clawd Letus Gelembung', sub: 'Tembak gelembung yang membawa jawaban benar. Pantulkan mutiara di dinding!',
      mula: 'Mulai Main', cara: 'Sentuh dan geser untuk membidik, lepas untuk menembak. Gelembung salah menambah baris.',
      peta: 'Pilih Level', skor: 'Skor', soalan: 'Soal', kombo: 'Kombo', terbaik: 'Terbaik',
      petunjuk: 'Geser untuk membidik, lepas untuk menembak.', petunjukKunci: 'Gerakkan mouse untuk membidik, klik atau Spasi untuk menembak.',
      ulang: 'Main Lagi', seterusnya: 'Level Berikutnya', kePeta: 'Pilih Level', kembali: 'Kembali', bahasa: 'MS', bunyiOn: 'Suara hidup', bunyiOff: 'Suara mati',
      menang: 'Hebat! Level lulus', kalah: 'Gelembung sampai bawah', tahap: 'Level', bintang: 'bintang', pasangbaris: 'Baris baru', pantulan: 'Pantulan!',
      jatuh: 'Jatuh', berantai: 'Berantai',
      op: { '+': 'Tambah', '-': 'Kurang', '*': 'Kali', m: 'Campuran' },
      sub_tahap: ['Tambah sampai 10', 'Tambah sampai 30', 'Kurang', 'Perkalian 2–5', 'Perkalian 2–9', 'Campuran', 'Tantangan'],
      tahapDikunci: 'Terkunci', bm: 'Bahasa Melayu', id: 'Bahasa Indonesia', puji: ['Bagus!', 'Tepat!', 'Hebat!', 'Pintar!']
    }
  };
  let lang = 'ms';
  try { const s = localStorage.getItem('ctg.lang'); if (s === 'ms' || s === 'id') lang = s; } catch (e) {}
  root.I18N = {
    get lang() { return lang; },
    set(l) { lang = l === 'id' ? 'id' : 'ms'; try { localStorage.setItem('ctg.lang', lang); } catch (e) {} document.documentElement.lang = lang; document.title = T[lang].tajuk; },
    t(k) { return T[lang][k]; }, all() { return T[lang]; }
  };
})(window);
