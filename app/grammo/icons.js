/* ============================================================
   Grammo — ikon garis (grid 24, stroke bulat) + bentuk dekorasi
   pathLength="1" supaya bisa "digambar" dengan kelas .lukis
   ============================================================ */

const IKON = {
  rumah:   '<path d="M3.5 10.5 12 4l8.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 19z"/>',
  grafik:  '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  buku:    '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h4.5A1.5 1.5 0 0 1 20 5.5v12a1.5 1.5 0 0 1-1.5 1.5H14a2.5 2.5 0 0 0-2 1 2.5 2.5 0 0 0-2-1H5.5A1.5 1.5 0 0 1 4 17.5z"/><path d="M12 6.5v13"/>',
  orang:   '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20a7.4 7.4 0 0 1 14.4 0"/>',
  lonceng: '<path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.4 1.5 5.4H5S6.5 14 6.5 10z"/><path d="M10.2 18.4a2 2 0 0 0 3.6 0"/>',
  cari:    '<circle cx="10.8" cy="10.8" r="6.3"/><path d="M15.4 15.4 20 20"/>',
  kiri:    '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  kanan:   '<path d="M5 12h14M13 6l6 6-6 6"/>',
  atas:    '<path d="M12 19V5M6 11l6-6 6 6"/>',
  bawah:   '<path d="M12 5v14M6 13l6 6 6-6"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  tutup:   '<path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"/>',
  tambah:  '<path d="M12 5v14M5 12h14"/>',
  centang: '<path d="M5 12.6 10 17.5 19.2 7"/>',
  emel:    '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/>',
  gembok:  '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  telepon: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
  sekolah: '<path d="M3 9.5 12 5l9 4.5-9 4.5z"/><path d="M7 11.5V16c1.5 1.5 3 2 5 2s3.5-.5 5-2v-4.5"/>',
  mata:    '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  pensil:  '<path d="M15.5 4.5 19.5 8.5 9 19H5v-4z"/><path d="m13 7 4 4"/>',
  gear:    '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  surat:   '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/>',
  kartu:   '<rect x="3" y="6" width="18" height="12.5" rx="2.5"/><path d="M3 10.5h18M7 15h3"/>',
  api:     '<path d="M12 21a6.5 6.5 0 0 0 6.5-6.5c0-4-3-6.5-4.5-10-1.5 2.5-2 4-2 6-1-.8-1.8-2-2-3.2C8 9.4 5.5 11.5 5.5 14.5A6.5 6.5 0 0 0 12 21z"/>',
  bintang: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  trofi:   '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8.5 20h7M9.5 17h5"/>',
  suara:   '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  lampu:   '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.2h5.2c0-.9.4-1.7 1-2.2A6 6 0 0 0 12 3z"/>',
  bendera: '<path d="M5 21V4"/><path d="M5 4.5h12.5l-2.5 4 2.5 4H5"/>',
  info:    '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/>',
  kalender:'<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  jam:     '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.4V12l3.2 2.1"/>',
  dunia:   '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.5 5.2 3.5 8.5s-1 6.2-3.5 8.5c-2.5-2.3-3.5-5.2-3.5-8.5s1-6.2 3.5-8.5z"/>',
  muat:    '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4.5V9h-4.5"/>',
  keluar:  '<path d="M14 4.5h4a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-4"/><path d="M10 8l-4 4 4 4M6 12h9"/>',
  kamera:  '<rect x="3.5" y="6.5" width="17" height="13" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8.5 6.5 10 4h4l1.5 2.5"/>',
  /* ikon topik */
  blok:    '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="3.5"/><rect x="4" y="13" width="7" height="7" rx="3.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  putar:   '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/><path d="M4 20v-4.5h4.5"/>',
  mundur:  '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5V9h4.5"/><path d="M12 8v4l3 2"/>',
  maju:    '<path d="M5 12h12M12 6l6 6-6 6"/><path d="M4 5v14"/>',
  huruf:   '<path d="M4 19 9 5l5 14M5.8 14.5h6.4"/><path d="M16.5 10.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM19 10v9"/>',
  naik:    '<path d="M4 19h16"/><rect x="5" y="13" width="3.5" height="6" rx="1"/><rect x="10.25" y="9" width="3.5" height="10" rx="1"/><rect x="15.5" y="5" width="3.5" height="14" rx="1"/>',
  kunci:   '<path d="M9 4h6M10 4v3l-4.5 8.5A3 3 0 0 0 8.2 20h7.6a3 3 0 0 0 2.7-4.5L14 7V4"/><path d="M7.5 14h9"/>',
  tukar:   '<path d="M4 8h14M14 4l4 4-4 4"/><path d="M20 16H6M10 12l-4 4 4 4"/>'
};

function ikon(nama, saiz, kelas) {
  const isi = (IKON[nama] || IKON.info).replace(/<(path|circle|rect)\s/g, '<$1 pathLength="1" ');
  const s = saiz || 22;
  return '<svg class="ik ' + (kelas || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + isi + '</svg>';
}

/* bunga bintang 8 kelopak (dekorasi gaya Midwok) */
function bungaBintang(warna, saiz, kelas, gaya) {
  let d = '';
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const x = 50 + Math.cos(a) * 30, y = 50 + Math.sin(a) * 30;
    d += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="20" ry="11" transform="rotate(' + (i * 45) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
  }
  return '<svg class="bunga ' + (kelas || '') + '" style="' + (gaya || '') + '" width="' + saiz + '" height="' + saiz + '" viewBox="0 0 100 100" fill="' + warna + '"><circle cx="50" cy="50" r="20"/>' + d + '</svg>';
}
/* bintang empat sudut (kilau) */
function kilau(warna, saiz, gaya) {
  return '<svg class="kilau" style="' + (gaya || '') + '" width="' + saiz + '" height="' + saiz + '" viewBox="0 0 24 24" fill="' + warna + '"><path d="M12 0c.8 6.4 4.6 10.6 12 12-7.4 1.4-11.2 5.6-12 12-.8-6.4-4.6-10.6-12-12 7.4-1.4 11.2-5.6 12-12z"/></svg>';
}
function logoG(s) {
  return '<svg width="' + (s || 20) + '" height="' + (s || 20) + '" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z"/></svg>';
}
