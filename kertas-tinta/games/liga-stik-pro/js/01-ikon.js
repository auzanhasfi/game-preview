'use strict';
// Ikon garis (gaya Lucide, stroke 1.75). G.ikon(nama) → string SVG.
(function () {
  const P = {
    main: '<path d="M7 4.5v15l12-7.5z"/>',
    penalti: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    buku: '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
    atur: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    jeda: '<rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/>',
    suara: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
    bisu: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
    kembali: '<path d="m12 19-7-7 7-7M19 12H5"/>',
    ulang: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
    rumah: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    tim: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    bola: '<circle cx="12" cy="12" r="10"/><path d="m12 7 4.5 3.3-1.7 5.2H9.2L7.5 10.3z"/><path d="M12 7V2M16.5 10.3 21 9M14.8 15.5l2.7 4.2M9.2 15.5l-2.7 4.2M7.5 10.3 3 9"/>',
    hitung: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4"/>',
    kilat: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    cek: '<path d="M20 6 9 17l-5-5"/>',
    silang: '<path d="M18 6 6 18M6 6l12 12"/>',
    bahasa: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    ganti: '<path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>',
    piala: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    putar: '<rect x="3" y="7" width="18" height="11" rx="2"/><path d="M8 3h8"/>'
  };
  G.ikon = (n, cls = '') => `<svg class="ik ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;
})();
