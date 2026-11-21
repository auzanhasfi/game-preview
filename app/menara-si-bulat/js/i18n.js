(function (root) {
  const S = {
    ms: { tajuk: 'Menara Si Bulat', sub: 'Anggar jarak, jatuhkan blok tepat-tepat dan bina menara setinggi sasaran!', mula: 'Main', peta: 'Pilih tahap',
      cara: 'Ketik untuk jatuhkan blok. Bahagian yang terkeluar dipotong, jadi menara makin sempit. Tepat sempurna dapat bonus!',
      tahap: 'Tahap', misi: 'Bina menara setinggi {h}', min: 'Lebar blok mesti ≥ {w} cm', tinggi: 'Tinggi', lebar: 'Lebar blok', skor: 'Skor', terbaik: 'Terbaik',
      jatuh: 'Jatuhkan', sempurna: 'Tepat sempurna!', potong: 'Terpotong {c} cm', mulaMsg: 'Anggar dulu, baru ketik!', menang: 'Menara siap!', kalah: 'Menara roboh!',
      miss: 'Blok terlepas langsung. Cuba lagi!', sempit: 'Blok terlalu sempit ({w} cm, mesti ≥ {m} cm).', stat: 'Tinggi {h} · Tepat sempurna {p} kali · Skor {s}',
      ulang: 'Ulang', seterusnya: 'Tahap seterusnya', pk: 'Peta tahap', kembali: 'Kembali', bunyi: 'Bunyi', bahasa: 'Tukar bahasa', sasaran: 'Sasaran {h}', kunci: 'Terkunci', pecah: 'Rekod baharu!' },
    id: { tajuk: 'Menara Si Bulat', sub: 'Perkirakan jarak, jatuhkan balok pas-pasan dan bangun menara setinggi sasaran!', mula: 'Main', peta: 'Pilih level',
      cara: 'Ketuk untuk menjatuhkan balok. Bagian yang keluar terpotong, jadi menara makin sempit. Pas sempurna dapat bonus!',
      tahap: 'Level', misi: 'Bangun menara setinggi {h}', min: 'Lebar balok harus ≥ {w} cm', tinggi: 'Tinggi', lebar: 'Lebar balok', skor: 'Skor', terbaik: 'Terbaik',
      jatuh: 'Jatuhkan', sempurna: 'Pas sempurna!', potong: 'Terpotong {c} cm', mulaMsg: 'Perkirakan dulu, baru ketuk!', menang: 'Menara selesai!', kalah: 'Menara roboh!',
      miss: 'Balok meleset total. Coba lagi!', sempit: 'Balok terlalu sempit ({w} cm, harus ≥ {m} cm).', stat: 'Tinggi {h} · Pas sempurna {p} kali · Skor {s}',
      ulang: 'Ulangi', seterusnya: 'Level berikutnya', pk: 'Peta level', kembali: 'Kembali', bunyi: 'Suara', bahasa: 'Ganti bahasa', sasaran: 'Sasaran {h}', kunci: 'Terkunci', pecah: 'Rekor baru!' }
  };
  let lang = 'ms';
  try { lang = localStorage.getItem('jt.lang') || ((navigator.language || '').startsWith('id') ? 'id' : 'ms'); } catch (e) {}
  function t(k, p) { let s = (S[lang] && S[lang][k]) || k; if (p) for (const q in p) s = s.replace('{' + q + '}', p[q]); return s; }
  root.I18N = { t, get lang() { return lang; }, set(l) { lang = l; try { localStorage.setItem('jt.lang', l); } catch (e) {} document.documentElement.lang = l; } };
})(window);
