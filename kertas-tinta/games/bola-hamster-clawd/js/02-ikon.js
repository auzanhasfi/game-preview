/* 02 — Ikon garis (gaya Lucide, stroke 1.75), tanpa emoji. HB.ic(nama) -> rentetan SVG. */
HB.IKON = {
  roll: '<circle cx="13" cy="12" r="7"/><path d="M13 5a7 7 0 0 1 0 14"/><path d="M2 9h3M1 13h4M3 17h3"/>',
  gate: '<path d="M4 20V6l4-2v16M16 20V4l4 2v14"/><path d="M8 9h8M8 14h8"/>',
  seed: '<path d="M12 3c4 4 5 9 3 14a3.2 3.2 0 0 1-6 0C7 12 8 7 12 3z"/><path d="M12 7v10"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor"/>',
  heartO: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>',
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
};
HB.ic = function (n) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (HB.IKON[n] || '') + '</svg>';
};
HB.paintIcons = function (root) {
  (root || document).querySelectorAll('i[data-ic]').forEach(function (el) { el.innerHTML = HB.ic(el.getAttribute('data-ic')); });
};
