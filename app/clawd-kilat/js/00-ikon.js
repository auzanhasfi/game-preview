/* Arena Clawd Pro: pustaka ikon garis (gaya Lucide, kotak 24, garis 1.75) dipakai di HTML (ic) dan kanvas (drawIcon).
   Semua ikon hanya path "d" supaya bisa dipakai Path2D di kanvas. */
'use strict';

function cir(cx, cy, r) { return 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0'; }
var ICONS = {
  /* navigasi & umum */
  back: 'M15 18 9 12l6-6', next: 'M9 18l6-6-6-6', close: 'M18 6 6 18M6 6l12 12', check: 'M20 6 9 17l-5-5',
  play: 'M7 4v16l13-8z', pause: 'M7 4h3v16H7zM14 4h3v16h-3z', home: 'M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  lock: 'M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4',
  sliders: 'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4',
  sound: 'M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13', mute: 'M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6',
  user: 'M19 21v-1a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5v1' + cir(12, 7, 4),
  bag: 'M6 3h12l2 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7zM4 7h16M16 11a4 4 0 0 1-8 0',
  book: 'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z',
  target: cir(12, 12, 9) + cir(12, 12, 5) + cir(12, 12, 1),
  hexagon: 'M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z',
  shirt: 'M8 3 4 5 2 10l4 1v10h12V11l4-1-2-5-4-2a4 4 0 0 1-8 0z',
  coin: cir(12, 12, 9) + cir(12, 12, 5), gem: 'M6 3h12l4 6-10 12L2 9zM2 9h20M10 3 8 9l4 12 4-12-2-6',
  star: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z',
  trophy: 'M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8M9 18h6',
  castle: 'M3 21V10h3V7h3v3h6V7h3v3h3v11zM3 10V7M21 10V7M10 21v-4a2 2 0 0 1 4 0v4M9 7V4h6v3',
  pencil: 'M16 3.5a2.1 2.1 0 0 1 3 3L8 17.5 3.5 19l1.5-4.5zM14 5.5l3 3',
  zap: 'M13 2 4 14h7l-1 8 9-12h-7z', heart: 'M12 20s-8-4.6-8-10.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 2.8C20 15.4 12 20 12 20z',
  shield: 'M12 21s8-3.5 8-10V5l-8-3-8 3v6c0 6.5 8 10 8 10z', crosshair: cir(12, 12, 9) + 'M12 3v4M12 17v4M3 12h4M17 12h4',
  wind: 'M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8',
  sword: 'M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2',
  swords: 'M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M14.5 6.5 18 3h3v3l-3.5 3.5M5 14l4 4M7 17l-3 3M3 19l2 2',
  boot: 'M7 3h6v8l6 3a2 2 0 0 1 1 1.8V19H4v-6l3-1zM4 19v2h16v-2M7 7h6',
  vest: 'M8 3h8l1 4 3 2v12H4V9l3-2zM12 7v14M8 3l4 4 4-4',
  hourglass: 'M6 2h12M6 22h12M7 2v4l5 6-5 6v4M17 2v4l-5 6 5 6v4',
  wand: 'M3 21 15 9M14 4l1-2 1 2 2 1-2 1-1 2-1-2-2-1zM19 11l.6-1.4L21 9l-1.4-.6L19 7l-.6 1.4L17 9l1.4.6z',
  leaf: 'M11 20a7 7 0 0 1-1.2-13.9C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5-6 2.5-.5 5-2 6-3',
  bow: 'M5 3c9 1 15 7 16 16M5 3l16 16M3 21l7-7M15 3h6v6',
  flask: 'M9 3h6M10 3v6l-6 10a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3L14 9V3M7 15h10',
  axe: 'M14 12 5.5 20.5a2 2 0 0 1-3-3L11 9M15 13 9 7l4-4 6 6h3a8 8 0 0 1-7 7z',
  pendant: 'M5 3c0 6 3 9 7 9s7-3 7-9' + cir(12, 16.5, 3.5),
  crown: 'M3 7l4 4 5-7 5 7 4-4-2 11H5zM5 21h14', flame: 'M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 2-5 5-5 8a7 7 0 0 0 7 7z',
  drop: 'M12 22a7 7 0 0 0 7-7c0-3-2-5.5-7-12-5 6.5-7 9-7 12a7 7 0 0 0 7 7z',
  sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5', bricks: 'M3 5h18v6H3zM3 11h18v6H3zM9 5v6M15 11v6M3 17h18v3H3z',
  turtle: 'M5 14a7 5 0 0 1 14 0zM3 14h18M12 9v5M8 10.5l1 3.5M16 10.5l-1 3.5M19 13l3-1M6 17l-1 2M18 17l1 2',
  bomb: cir(10, 14, 7) + 'M14 8l2-2M17 3v2M20 6h-2M19.5 3.5 18 5',
  /* skill */
  dash: 'M4 17l5-5-5-5M11 17l5-5-5-5M18 6v12', spin: 'M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5',
  slam: cir(12, 12, 3) + 'M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8',
  bash: 'M12 21s8-3.5 8-10V5l-8-3-8 3v6c0 6.5 8 10 8 10zM12 7v6M9 10h6',
  fortress: cir(12, 12, 9) + cir(12, 12, 4.5) + 'M12 3v4.5M12 16.5V21M3 12h4.5M16.5 12H21',
  arrow: 'M4 20 20 4M12 4h8v8M4 15l2 2M8 19l-2-2', arrows: 'M6 3v13M12 3v18M18 3v13M3 13l3 3 3-3M9 18l3 3 3-3M15 13l3 3 3-3',
  orb: cir(12, 12, 6) + 'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5',
  chain: 'M13 2 6 12h5l-2 10 9-13h-5z', stars: 'M8 2l1.3 3.4L13 7l-3.7 1.6L8 12 6.7 8.6 3 7l3.7-1.6zM17 10l1.1 2.9L21 14l-2.9 1.1L17 18l-1.1-2.9L13 14l2.9-1.1zM8 15l.9 2.1L11 18l-2.1.9L8 21l-.9-2.1L5 18l2.1-.9z',
  shadow: 'M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8zM9 10h.01M15 10h.01',
  dance: cir(12, 12, 2) + 'M12 3a9 9 0 0 1 9 9M21 12a9 9 0 0 1-9 9M12 21a9 9 0 0 1-9-9M3 12a9 9 0 0 1 9-9M12 3l-2 2M21 12l-2-2M12 21l2-2M3 12l2 2',
  heal: cir(12, 12, 9) + 'M12 8v8M8 12h8', bubble: cir(12, 12, 9) + 'M8 9a4 4 0 0 1 4-3', banner: 'M5 21V4M5 4h11l-2 4 2 4H5M9 21h-4',
  passive: 'M12 2l9 5v10l-9 5-9-5V7zM12 8v8M8 10l4 2 4-2',
  boomerang: 'M3 6c5-1 10 1 13 5l5 7-2 2-6-6c-2.6-2.6-6-4.4-10-4.6z',
  cat: 'M4 4l4 4h8l4-4v9a8 8 0 0 1-16 0zM9 13h.01M15 13h.01M10.5 16.5 12 17.5l1.5-1',
  storm: 'M6 16a5 5 0 1 1 1.5-9.8A6 6 0 0 1 19 8a4 4 0 0 1 0 8M13 12l-3 5h4l-3 5'
};
var _p2d = {};
function ic(name, size, cls) {
  var d = ICONS[name] || ICONS.sparkle, s = size || 20;
  return '<svg class="svgi ' + (cls || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
}
function drawIcon(name, x, y, size, col, lw) {
  if (!ICONS[name]) return;
  var p = _p2d[name] || (_p2d[name] = new Path2D(ICONS[name])), k = size / 24;
  ctx.save(); ctx.translate(x - size / 2, y - size / 2); ctx.scale(k, k);
  ctx.lineWidth = (lw || 1.9) / k; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col || '#2e2620'; ctx.stroke(p); ctx.restore();
}
/* bentuk hitung (pengganti emoji di soal & Akademi): bulatan, bintang, kotak, segitiga berwarna lembut */
var SHAPES = {
  bulat: '<svg class="shp" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="#d8714f" stroke="#2e2620" stroke-width="1.4"/></svg>',
  bintang: '<svg class="shp" viewBox="0 0 20 20"><path d="M10 2l2.3 4.8 5.2.7-3.8 3.6.9 5.2L10 13.8l-4.6 2.5.9-5.2-3.8-3.6 5.2-.7z" fill="#e2a93b" stroke="#2e2620" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  kotak: '<svg class="shp" viewBox="0 0 20 20"><rect x="3.5" y="3.5" width="13" height="13" rx="2" fill="#7f9fd9" stroke="#2e2620" stroke-width="1.4"/></svg>',
  segitiga: '<svg class="shp" viewBox="0 0 20 20"><path d="M10 3l7.5 13h-15z" fill="#6fa83c" stroke="#2e2620" stroke-width="1.4" stroke-linejoin="round"/></svg>'
};
