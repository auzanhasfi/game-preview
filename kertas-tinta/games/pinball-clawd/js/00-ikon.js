/* Pinball Clawd (ikon dari Turbo Clawd): ikon garis (gaya Lucide, kotak 24, garis 1.75) untuk HTML */
const cir = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
export const IKON = {
  goyang: 'M2 9v6M22 9v6M5.5 6v12M18.5 6v12M9 4h6v16H9z',
  play: 'M7 4v16l13-8z', pause: 'M7 4h3v16H7zM14 4h3v16h-3z', back: 'M15 18 9 12l6-6', next: 'M9 18l6-6-6-6', close: 'M18 6 6 18M6 6l12 12',
  home: 'M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z', check: 'M20 6 9 17l-5-5', redo: 'M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5',
  sound: 'M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13', mute: 'M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6',
  lock: 'M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4',
  star: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z',
  trophy: 'M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8M9 18h6',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5', map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14', book: 'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z',
  car: 'M5 17h14M3 13l2-5a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 5v4h-2M5 17H3v-4h18' + cir(7.5, 17, 2) + cir(16.5, 17, 2),
  sliders: 'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4', help: cir(12, 12, 9) + 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01',
  roket: 'M5 19l3-1 8-8a5 5 0 0 0 2-6 5 5 0 0 0-6 2l-8 8-1 3zM14 10l-4-4M7 14l3 3M4 20l2-2M15 6.5a.5.5 0 1 0 1 0 .5.5 0 1 0-1 0',
  bom: cir(10, 14, 7) + 'M14 8l2-2M17 3v2M20 6h-2M19.5 3.5 18 5',
  dorong: cir(12, 12, 2) + 'M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.5 4.5a10.6 10.6 0 0 0 0 15M19.5 4.5a10.6 10.6 0 0 1 0 15',
  nitro: 'M13 2 4 14h7l-1 8 9-12h-7z', perisai: 'M12 21s8-3.5 8-10V5l-8-3-8 3v6c0 6.5 8 10 8 10z',
  gauge: 'M12 14l4-4M3.3 17a9 9 0 1 1 17.4 0', timer: cir(12, 13, 8) + 'M12 9v4l2 2M9 2h6', drift: 'M4 16c4 0 6-8 10-8h6M16 4l4 4-4 4M4 20h6'
};
export function ic(nama, size = 20, cls = '') {
  return `<svg class="svgi ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IKON[nama] || IKON.star}"/></svg>`;
}

