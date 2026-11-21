// Seni SVG sendiri: maskot Clawd (ketam oren), ikon, syiling.
window.SENI = (function () {
  const OREN = '#f26a2e', OREN_TUA = '#c94d17', OREN_MUDA = '#ffb07a', TINTA = '#4a2a14';
  const CAPIT = 'M-4.45 -12.2 A13 13 0 1 0 4.45 -12.2 L0 -3 Z';
  function clawd(mood) {
    mood = mood || 'idle';
    const naik = mood === 'happy';
    const kiri = naik ? 'translate(18 30) rotate(-18)' : 'translate(20 50) rotate(-30)';
    const kanan = naik ? 'translate(102 30) rotate(18)' : 'translate(100 50) rotate(30)';
    const lengan = naik
      ? `<path d="M34 62 Q22 52 18 38" /><path d="M86 62 Q98 52 102 38" />`
      : `<path d="M34 64 Q24 62 20 54" /><path d="M86 64 Q96 62 100 54" />`;
    const mulut = mood === 'oops'
      ? `<ellipse cx="60" cy="74" rx="5" ry="6" fill="${TINTA}"/>`
      : mood === 'happy'
        ? `<path d="M48 68 Q60 84 72 68 Z" fill="${TINTA}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/><path d="M53 74 Q60 80 67 74 Q60 71 53 74Z" fill="#ff8f8f"/>`
        : `<path d="M50 70 Q60 79 70 70" fill="none" stroke="${TINTA}" stroke-width="3.5" stroke-linecap="round"/>`;
    const pupil = mood === 'oops' ? 4.2 : 3.4;
    const peluh = mood === 'oops' ? `<path d="M92 42 q5 8 0 11 q-5 -3 0 -11z" fill="#7cc4ff" stroke="${TINTA}" stroke-width="1.5"/>` : '';
    const pipi = `<ellipse cx="43" cy="66" rx="5" ry="3" fill="#ff8f8f" opacity=".55"/><ellipse cx="77" cy="66" rx="5" ry="3" fill="#ff8f8f" opacity=".55"/>`;
    return `<svg viewBox="0 0 120 104" role="img" aria-hidden="true" focusable="false">
      <g stroke="${TINTA}" stroke-width="3.5" stroke-linecap="round" fill="none">
        <path d="M36 80 L22 90"/><path d="M42 86 L32 98"/><path d="M84 80 L98 90"/><path d="M78 86 L88 98"/>
      </g>
      <g stroke="${TINTA}" stroke-width="3.5" stroke-linecap="round" fill="none">${lengan}</g>
      <g class="capit-k" fill="${OREN_TUA}" stroke="${TINTA}" stroke-width="3" stroke-linejoin="round"><path transform="${kiri}" d="${CAPIT}"/></g>
      <g class="capit-r" fill="${OREN_TUA}" stroke="${TINTA}" stroke-width="3" stroke-linejoin="round"><path transform="${kanan}" d="${CAPIT}"/></g>
      <g stroke="${TINTA}" stroke-width="3.5" stroke-linecap="round"><path d="M48 44 L46 30"/><path d="M72 44 L74 30"/></g>
      <ellipse cx="60" cy="66" rx="36" ry="27" fill="${OREN}" stroke="${TINTA}" stroke-width="3.5"/>
      <ellipse cx="60" cy="74" rx="22" ry="14" fill="${OREN_MUDA}" opacity=".55"/>
      <circle cx="46" cy="26" r="9" fill="#fff" stroke="${TINTA}" stroke-width="3"/><circle cx="74" cy="26" r="9" fill="#fff" stroke="${TINTA}" stroke-width="3"/>
      <circle cx="47" cy="27" r="${pupil}" fill="${TINTA}"/><circle cx="73" cy="27" r="${pupil}" fill="${TINTA}"/>
      ${pipi}${mulut}${peluh}
    </svg>`;
  }
  const IKON = {
    hati: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
    bunyi: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none"/>',
    senyap: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6" fill="none"/>',
    rumah: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6"/>',
    tukar: '<path d="M4 8h13l-3-3M20 16H7l3 3" />',
    bintang: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z"/>'
  };
  function ikon(nama, kelas) {
    const penuh = nama === 'hati' || nama === 'bintang' || nama === 'bunyi' || nama === 'senyap';
    return `<svg class="ikon ${kelas || ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="${penuh && nama !== 'bunyi' && nama !== 'senyap' ? 'currentColor' : (nama === 'bunyi' || nama === 'senyap' ? 'currentColor' : 'none')}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IKON[nama]}</svg>`;
  }
  function syiling(unit, label) {
    const w = window.DATA.WARNA[unit] || ['#ddd', '#888'];
    const a = label.a, b = label.b, n = a.length;
    const fs = n <= 2 ? 25 : n === 3 ? 21 : n === 4 ? 17 : 14;
    const yA = b ? 37 : 41, yB = 50;
    return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle cx="32" cy="34" r="30" fill="rgba(74,42,20,.18)"/>
      <circle cx="32" cy="32" r="30" fill="${w[1]}"/>
      <circle cx="32" cy="32" r="26" fill="${w[0]}"/>
      <circle cx="32" cy="32" r="21.5" fill="none" stroke="${w[1]}" stroke-width="1.5" stroke-dasharray="2.5 2.5" opacity=".7"/>
      <text x="32" y="${yA}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="${TINTA}">${a}</text>
      ${b ? `<text x="32" y="${yB}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${TINTA}">${b}</text>` : ''}
    </svg>`;
  }
  return { clawd, ikon, syiling };
})();
