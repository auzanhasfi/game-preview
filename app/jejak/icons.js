/* ============================================================
   jejak. — set ikon garis (grid 24 x 24, stroke bulat)
   Setiap elemen diberi pathLength="1" supaya boleh "dilukis"
   dengan animasi stroke-dashoffset (kelas .lukis).
   ============================================================ */

const IKON = {
  utama:   '<path d="M3.5 10.5 12 4l8.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 19z"/>',
  belajar: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h4.5A1.5 1.5 0 0 1 20 5.5v12a1.5 1.5 0 0 1-1.5 1.5H14a2.5 2.5 0 0 0-2 1 2.5 2.5 0 0 0-2-1H5.5A1.5 1.5 0 0 1 4 17.5z"/><path d="M12 6.5v13"/>',
  garis:   '<path d="M12 3v18"/><circle cx="12" cy="7" r="2"/><circle cx="12" cy="17" r="2"/><path d="M14 7h6M4 17h6M4 12h5"/>',
  profil:  '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20a7.4 7.4 0 0 1 14.4 0"/>',
  tambah:  '<path d="M12 5v14M5 12h14"/>',
  balik:   '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
  kanan:   '<path d="M5 12h14M13 6l6 6-6 6"/>',
  kiri:    '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  bawah:   '<path d="m6 9 6 6 6-6"/>',
  tutup:   '<path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"/>',
  semak:   '<path d="M5 12.6 10 17.5 19.2 7"/>',
  cari:    '<circle cx="10.8" cy="10.8" r="6.3"/><path d="M15.4 15.4 20 20"/>',
  titik:   '<circle cx="12" cy="5.5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="18.5" r="1.2"/>',
  kongsi:  '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/>',
  cap:     '<path d="M12 11v3a8 8 0 0 1-1.2 4.3"/><path d="M8.5 12a3.5 3.5 0 0 1 7 0v1.5a12 12 0 0 1-.8 4.5"/><path d="M5.8 15A10 10 0 0 0 6 12a6 6 0 0 1 12 0v1"/><path d="M4 9.5a8.5 8.5 0 0 1 16 0"/><path d="M18 17.5c.4-1 .7-2.3.8-3.5"/>',
  kunci:   '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><path d="M12 14.5v2.5"/>',
  emel:    '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/>',
  telefon: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
  tetamu:  '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.6 5.6 0 0 1 11 0"/><path d="M16 7.5h5M18.5 5v5"/>',
  /* ikon era */
  batu:    '<path d="M3.5 19 9 8l3.5 6 2.5-4 5.5 9z"/><path d="M8 12.5l2 1.5"/>',
  mahkota: '<path d="M4 17.5 3 7.5l5 4 4-6 4 6 5-4-1 10z"/><path d="M4 20h16"/>',
  kapal:   '<path d="M3 15.5h18l-2.5 4.5h-13z"/><path d="M12 3v12.5"/><path d="M12 4.5 18.5 13H12"/><path d="M12 7 7 13h5"/>',
  api:     '<path d="M12 21a6.5 6.5 0 0 0 6.5-6.5c0-4-3-6.5-4.5-10-1.5 2.5-2 4-2 6-1-.8-1.8-2-2-3.2C8 9.4 5.5 11.5 5.5 14.5A6.5 6.5 0 0 0 12 21z"/>',
  perisai: '<path d="M12 3.5 19 6v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  bendera: '<path d="M5 21V4"/><path d="M5 4.5h12.5l-2.5 4 2.5 4H5"/>',
  /* lain-lain */
  skrol:   '<path d="M7 4h11a2 2 0 0 1 2 2v1.5h-4"/><path d="M16 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5h10"/><path d="M7 4a2 2 0 0 0-2 2v10.5"/><path d="M9 9h4M9 12.5h4"/>',
  lampu:   '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.2h5.2c0-.9.4-1.7 1-2.2A6 6 0 0 0 12 3z"/>',
  bintang: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  penanda: '<path d="M6.5 4.5h11v15.5l-5.5-3.8-5.5 3.8z"/>',
  jam:     '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.4V12l3.2 2.1"/>',
  pena:    '<path d="M15.5 4.5 19.5 8.5 9 19H5v-4z"/><path d="m13 7 4 4"/>',
  trofi:   '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8.5 20h7M9.5 17h5"/>',
  kalendar:'<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  sasaran: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  petir:   '<path d="M13.5 3 5 13.5h6.5L10.5 21 19 10.5h-6.5z"/>',
  carta:   '<path d="M12 3.5v8.5h8.5A8.5 8.5 0 1 1 12 3.5z"/><path d="M15 3.8A8.5 8.5 0 0 1 20.2 9H15z"/>',
  lambai:  '<path d="M7.5 11.5V6.8a1.4 1.4 0 0 1 2.8 0V11"/><path d="M10.3 10.5V5.3a1.4 1.4 0 0 1 2.8 0v5.2"/><path d="M13.1 10.5V6.3a1.4 1.4 0 0 1 2.8 0v6.2"/><path d="M15.9 9.7a1.4 1.4 0 0 1 2.8 0V14a7 7 0 0 1-7 7h-.6a6 6 0 0 1-4.6-2.2l-2.8-3.6a1.5 1.5 0 0 1 2.3-1.9l1.5 1.7"/>',
  unduh:   '<path d="M12 4v11M7 10.5l5 5 5-5"/><path d="M4.5 19.5h15"/>',
  padam:   '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  dagang:  '<path d="M12 4v16M7 20h10"/><path d="M4 8h16"/><path d="m6.5 8-2.5 6a2.8 2.8 0 0 0 5 0z"/><path d="m17.5 8-2.5 6a2.8 2.8 0 0 0 5 0z"/>',
  bulan:   '<path d="M15.5 4.2A8 8 0 1 0 19.8 15a6.5 6.5 0 0 1-4.3-10.8z"/><path d="m18 5 .6 1.4L20 7l-1.4.6L18 9l-.6-1.4L16 7l1.4-.6z"/>',
  ombak:   '<path d="M3 9c1.5 0 1.5-1.5 3-1.5S7.5 9 9 9s1.5-1.5 3-1.5S13.5 9 15 9s1.5-1.5 3-1.5S19.5 9 21 9"/><path d="M3 14c1.5 0 1.5-1.5 3-1.5S7.5 14 9 14s1.5-1.5 3-1.5S13.5 14 15 14s1.5-1.5 3-1.5S19.5 14 21 14"/>',
  kuiz:    '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.6"/><path d="M12 16.8v.2"/>',
  rawak:   '<path d="M3.5 7h3.5c4 0 6 10 10 10h3.5"/><path d="M3.5 17h3.5c1.5 0 2.6-1.3 3.5-3M13.5 10c.9-1.7 2-3 3.5-3h3.5"/><path d="m18 4.5 2.5 2.5-2.5 2.5M18 14.5l2.5 2.5-2.5 2.5"/>',
  mata:    '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  bunyi:   '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  label:   '<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="8.5" r="1.3"/>',
  orang:   '<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-1.5A5.5 5.5 0 0 1 10.5 14h3a5.5 5.5 0 0 1 5.5 5.5V21"/>',
  muat:    '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4.5V9h-4.5"/>'
};

function ikon(nama, saiz, kelas) {
  const isi = (IKON[nama] || IKON.titik)
    .replace(/<(path|circle|rect)\s/g, '<$1 pathLength="1" ');
  return '<svg class="ik ' + (kelas || '') + '" width="' + (saiz || 22) + '" height="' + (saiz || 22) +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + isi + '</svg>';
}

/* Bentuk pelekat (sticker) gaya pokki: lencana bergerigi, segi empat bulat, bulatan */
function bentukGerigi(r1, r2, n) {
  let d = '';
  for (let i = 0; i <= n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const r = i % 2 ? r2 : r1;
    d += (i ? 'L' : 'M') + (50 + Math.cos(a) * r).toFixed(1) + ' ' + (50 + Math.sin(a) * r).toFixed(1);
  }
  return d + 'Z';
}
const BENTUK = {
  gerigi: bentukGerigi(47, 40, 12),
  bunga:  'M50 6c8 0 10 9 16 11s15-2 19 5-3 12-3 18 7 12 3 19-13 3-19 5-8 11-16 11-10-9-16-11-15 2-19-5 3-12 3-18-7-12-3-19 13-3 19-5S42 6 50 6z',
  segi:   'M22 6h56a16 16 0 0 1 16 16v56a16 16 0 0 1-16 16H22A16 16 0 0 1 6 78V22A16 16 0 0 1 22 6z',
  bulat:  'M50 5a45 45 0 1 1 0 90 45 45 0 0 1 0-90z'
};

function pelekat(namaIkon, bentuk, warna, saiz, kelas, gaya) {
  const s = saiz || 64;
  return '<span class="pelekat ' + (kelas || '') + '" style="width:' + s + 'px;height:' + s + 'px;' + (gaya || '') + '">' +
    '<svg viewBox="0 0 100 100" width="' + s + '" height="' + s + '"><path d="' + BENTUK[bentuk || 'gerigi'] +
    '" fill="var(--' + (warna || 'lime') + ')" stroke="var(--ink)" stroke-width="3.5" stroke-linejoin="round"/></svg>' +
    '<span class="pelekat-ik">' + ikon(namaIkon, Math.round(s * 0.44)) + '</span></span>';
}
