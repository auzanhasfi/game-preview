/* ============================================================
   JawiKu — ikon garis + seni watak gaya "Family"
   (bentuk ceria, mata berkelip, warna biru + aksen pelangi)
   ============================================================ */

const IKON = {
  rumah:   '<path d="M3.5 10.5 12 4l8.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 19z"/>',
  buku:    '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h4.5A1.5 1.5 0 0 1 20 5.5v12a1.5 1.5 0 0 1-1.5 1.5H14a2.5 2.5 0 0 0-2 1 2.5 2.5 0 0 0-2-1H5.5A1.5 1.5 0 0 1 4 17.5z"/><path d="M12 6.5v13"/>',
  orang:   '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20a7.4 7.4 0 0 1 14.4 0"/>',
  beg:     '<path d="M5 8h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  cari:    '<circle cx="10.8" cy="10.8" r="6.3"/><path d="M15.4 15.4 20 20"/>',
  kiri:    '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
  kanan:   '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
  bawah:   '<path d="m6 9 6 6 6-6"/>',
  atas:    '<path d="m6 15 6-6 6 6"/>',
  tutup:   '<path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"/>',
  tambah:  '<path d="M12 5v14M5 12h14"/>',
  tolak:   '<path d="M5 12h14"/>',
  centang: '<path d="M5 12.6 10 17.5 19.2 7"/>',
  hati:    '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/>',
  bintang: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  huruf:   '<path d="M7 18c-2 0-3-1.5-3-3.5 0-2.5 2-4.5 5-5"/><path d="M17 5v9a4 4 0 0 1-4 4h-2"/><circle cx="12" cy="6" r="1"/>',
  blok:    '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="3.5"/><rect x="4" y="13" width="7" height="7" rx="3.5"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  pensel:  '<path d="M15.5 4.5 19.5 8.5 9 19H5v-4z"/><path d="m13 7 4 4"/>',
  tapis:   '<path d="M4 6h16M7 12h10M10 18h4"/>',
  lokasi:  '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  sembang: '<path d="M4.5 6.5A2 2 0 0 1 6.5 4.5h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4.5 3.5v-3.5h-1z"/>',
  hantar:  '<path d="M4 12 20 4l-6 16-3-7z"/><path d="m11 13 9-9"/>',
  jam:     '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 1.5M9.5 3h5"/>',
  suara:   '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  tetapan: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  info:    '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/>',
  dunia:   '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.5 5.2 3.5 8.5s-1 6.2-3.5 8.5c-2.5-2.3-3.5-5.2-3.5-8.5s1-6.2 3.5-8.5z"/>',
  sejarah: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5V9h4.5"/><path d="M12 8v4l3 2"/>',
  keluar:  '<path d="M14 4.5h4a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-4"/><path d="M10 8l-4 4 4 4M6 12h9"/>',
  padam:   '<path d="M20 20H9L4.5 15.5a1.5 1.5 0 0 1 0-2.1L13 5a1.5 1.5 0 0 1 2.1 0l4.4 4.4a1.5 1.5 0 0 1 0 2.1L12 19"/>',
  main:    '<path d="M8 5.5 18 12 8 18.5z"/>',
  jeda:    '<path d="M9 5.5v13M15 5.5v13"/>',
  trofi:   '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8.5 20h7M9.5 17h5"/>',
  lampu:   '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.2h5.2c0-.9.4-1.7 1-2.2A6 6 0 0 0 12 3z"/>',
  emel:    '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/>',
  papan:   '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M8 14h8"/>'
};
function ikon(nama, saiz, kelas) {
  const s = saiz || 22;
  const isi = (IKON[nama] || IKON.info).replace(/<(path|circle|rect)\s/g, '<$1 pathLength="1" ');
  return '<svg class="ik ' + (kelas || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + isi + '</svg>';
}

/* ---------- watak (mata berkelip lewat kelas .mata) ---------- */
function mata(cx, cy, jarak, r, senyum) {
  if (senyum) return '<path d="M' + (cx - jarak - r) + ' ' + cy + 'q' + r + ' ' + (-r * 1.4) + ' ' + (r * 2) + ' 0M' + (cx + jarak - r) + ' ' + cy + 'q' + r + ' ' + (-r * 1.4) + ' ' + (r * 2) + ' 0" stroke="#1B1B1B" stroke-width="3" fill="none" stroke-linecap="round"/>';
  return '<g class="mata"><ellipse cx="' + (cx - jarak) + '" cy="' + cy + '" rx="' + r * .75 + '" ry="' + r + '" fill="#1B1B1B"/><ellipse cx="' + (cx + jarak) + '" cy="' + cy + '" rx="' + r * .75 + '" ry="' + r + '" fill="#1B1B1B"/></g>';
}
/* jenis: bunga (biru, badan kelopak + muka segi), titis (kuning), gumpal (hijau), bintang (oren) */
function watak(jenis, saiz, kelas, gaya, huruf) {
  const s = saiz || 120;
  let isi = '';
  if (jenis === 'bunga') {
    let k = '';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; k += '<circle cx="' + (60 + Math.cos(a) * 30).toFixed(1) + '" cy="' + (56 + Math.sin(a) * 30).toFixed(1) + '" r="20"/>'; }
    isi = '<g fill="#6FB4F7">' + k + '<circle cx="60" cy="56" r="32"/></g>' +
      '<rect x="40" y="36" width="40" height="40" rx="6" fill="#2F7FE0"/>' + mata(60, 54, 8, 4) +
      (huruf ? '<text x="60" y="73" text-anchor="middle" font-family="Scheherazade New, serif" font-size="14" fill="#fff">' + huruf + '</text>' : '') +
      '<path d="M50 92v16M70 92v16" stroke="#1B1B1B" stroke-width="3.5" stroke-linecap="round"/><path d="M45 109h8M66 109h8" stroke="#F2C14E" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M22 64l-10 6M98 64l10-6" stroke="#1B1B1B" stroke-width="3" stroke-linecap="round"/>';
  } else if (jenis === 'titis') {
    isi = '<path d="M60 10c10 18 40 38 40 64a40 40 0 0 1-80 0c0-26 30-46 40-64z" fill="#FFC85A"/>' + mata(60, 72, 13, 6, true) +
      '<path d="M50 84q10 10 20 0" stroke="#1B1B1B" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="40" cy="84" r="5" fill="#FF9C7A" opacity=".7"/><circle cx="80" cy="84" r="5" fill="#FF9C7A" opacity=".7"/>' +
      '<path d="M20 78l-12 8" stroke="#1B1B1B" stroke-width="3" stroke-linecap="round"/>';
  } else if (jenis === 'gumpal') {
    isi = '<path d="M24 52c0-20 18-32 38-30 22 2 36 18 34 38-1 18-12 34-36 34S24 76 24 52z" fill="#3DB36B"/>' +
      '<path d="M40 24l6-10 6 10 6-10 6 10" stroke="#F2C14E" stroke-width="5" fill="none" stroke-linejoin="round"/>' + mata(60, 54, 10, 5) +
      '<path d="M52 66q8 7 16 0" stroke="#1B1B1B" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M96 58l12-4" stroke="#1B1B1B" stroke-width="3" stroke-linecap="round"/>';
  } else {
    isi = '<path d="M60 8l13 30 32 3-24 21 7 32-28-16-28 16 7-32L15 41l32-3z" fill="#FF8A3D"/>' + mata(60, 54, 9, 4.5) +
      '<path d="M53 66q7 6 14 0" stroke="#1B1B1B" stroke-width="3" fill="none" stroke-linecap="round"/>';
  }
  return '<svg class="watak ' + (kelas || '') + '" style="' + (gaya || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 120 120" aria-hidden="true">' + isi + '</svg>';
}

/* ---------- bentuk hiasan bertaburan ---------- */
function hiasan(jenis, warna, saiz, gaya, kelas, huruf) {
  const s = saiz || 30;
  const B = {
    hati: '<path d="M50 88S10 62 10 34a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 28-40 54-40 54z"/>',
    bintang: '<path d="M50 6l12 30 32 2-25 20 9 32-28-18-28 18 9-32L6 38l32-2z"/>',
    kilau: '<path d="M50 4c4 30 16 42 46 46-30 4-42 16-46 46-4-30-16-42-46-46 30-4 42-16 46-46z"/>',
    bunga: (() => { let k = ''; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; k += '<circle cx="' + (50 + Math.cos(a) * 24).toFixed(1) + '" cy="' + (50 + Math.sin(a) * 24).toFixed(1) + '" r="18"/>'; } return k + '<circle cx="50" cy="50" r="16" fill="#FFD55A"/>'; })(),
    bulat: '<circle cx="50" cy="50" r="42"/>',
    syiling: '<circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="32" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="5"/>',
    gerigi: (() => { let d = ''; for (let i = 0; i <= 24; i++) { const a = Math.PI * i / 12 - Math.PI / 2, r = i % 2 ? 36 : 46; d += (i ? 'L' : 'M') + (50 + Math.cos(a) * r).toFixed(1) + ' ' + (50 + Math.sin(a) * r).toFixed(1); } return '<path d="' + d + 'Z"/>'; })(),
    pil: '<rect x="8" y="30" width="84" height="40" rx="20"/>',
    roket: '<path d="M50 8c18 12 22 34 16 54H34C28 42 32 20 50 8z"/><path d="M34 62l-14 14 18-4M66 62l14 14-18-4" /><circle cx="50" cy="36" r="8" fill="#fff"/>'
  };
  const teks = huruf ? '<text x="50" y="66" text-anchor="middle" font-family="Scheherazade New, serif" font-size="46" font-weight="700" fill="rgba(0,0,0,.55)">' + huruf + '</text>' : '';
  return '<svg class="hiasan ' + (kelas || '') + '" style="' + (gaya || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 100 100" fill="' + warna + '" aria-hidden="true">' + (B[jenis] || B.bulat) + teks + '</svg>';
}
function logoG(s) {
  return '<svg width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z"/></svg>';
}
