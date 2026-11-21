/* Clawd: ketam oren dilukis sendiri dengan SVG. Mood: senang, gembira, oops, fikir. */
(function (root) {
  'use strict';
  const O = '#f07a3c', OD = '#b9501f', OL = '#ffa36b', INK = '#2a1408';
  function claw(side) {
    const l = side === 'l', c = l ? 18 : 102, x1 = l ? 9.97 : 110.03, x2 = l ? 26.03 : 93.97, sw = l ? 0 : 1;
    const arm = l ? 'M36 62 Q12 62 15 40' : 'M84 62 Q108 62 105 40';
    return `<path d="${arm}" fill="none" stroke="${OD}" stroke-width="8" stroke-linecap="round"/>
      <path d="M${c} 28 L${x1} 16.5 A14 14 0 1 ${sw} ${x2} 16.5 Z" fill="${O}" stroke="${OD}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="${l ? 14 : 106}" cy="32" r="3" fill="${OL}"/>`;
  }
  function eyes(m) {
    const E = (x) => {
      if (m === 'gembira') return `<circle cx="${x}" cy="24" r="9" fill="#fff"/><path d="M${x - 5} 26 Q${x} 18 ${x + 5} 26" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
      if (m === 'oops') return `<circle cx="${x}" cy="24" r="9.5" fill="#fff"/><circle cx="${x}" cy="25" r="2.8" fill="${INK}"/>`;
      if (m === 'fikir') return `<circle cx="${x}" cy="24" r="9" fill="#fff"/><circle cx="${x + 2.5}" cy="21" r="4.4" fill="${INK}"/><circle cx="${x + 3.8}" cy="19.6" r="1.4" fill="#fff"/>`;
      return `<circle cx="${x}" cy="24" r="9" fill="#fff"/><g class="mata"><circle cx="${x}" cy="24.5" r="4.6" fill="${INK}"/><circle cx="${x + 1.6}" cy="22.8" r="1.5" fill="#fff"/></g>`;
    };
    return `<path d="M48 42 L48 31 M72 42 L72 31" stroke="${OD}" stroke-width="4" stroke-linecap="round"/>${E(48)}${E(72)}`;
  }
  function mouth(m) {
    if (m === 'gembira') return `<path d="M47 63 Q60 84 73 63 Z" fill="#7a2d12" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M53 72 Q60 80 67 72 Q60 68 53 72 Z" fill="#ff8c7a"/>`;
    if (m === 'oops') return `<path d="M49 74 Q54.5 66 60 74 T71 74" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M82 36 Q86 42 82 46 Q78 42 82 36 Z" fill="#8fd3ff"/>`;
    if (m === 'fikir') return `<path d="M54 70 L66 67" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    return `<path d="M50 65 Q60 75 70 65" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  }
  function legs() {
    return [[34, 74, 16, 84], [38, 80, 22, 93], [44, 84, 33, 97], [86, 74, 104, 84], [82, 80, 98, 93], [76, 84, 87, 97]]
      .map(p => `<path d="M${p[0]} ${p[1]} L${p[2]} ${p[3]}" stroke="${OD}" stroke-width="5" stroke-linecap="round"/>`).join('');
  }
  function body(m) {
    return `${legs()}${claw('l')}${claw('r')}
      <ellipse cx="60" cy="62" rx="35" ry="26" fill="${O}" stroke="${OD}" stroke-width="3"/>
      <ellipse cx="50" cy="52" rx="16" ry="7" fill="${OL}" opacity=".55"/>
      <ellipse cx="40" cy="66" rx="5" ry="3.2" fill="#ff9d7a" opacity=".7"/><ellipse cx="80" cy="66" rx="5" ry="3.2" fill="#ff9d7a" opacity=".7"/>
      ${eyes(m)}${mouth(m)}`;
  }
  const svg = (m) => `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Clawd">${body(m || 'senang')}</svg>`;
  const COL = ['#8fd3ff', '#ffd27a', '#b6f0a0', '#ffb3c7', '#d3b8ff', '#9ff0e0'];
  function hero(m) {
    const b = (x, y, r, v, i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${COL[i]}" fill-opacity=".85" stroke="#fff" stroke-opacity=".8" stroke-width="2"/><ellipse cx="${x - r * .35}" cy="${y - r * .4}" rx="${r * .28}" ry="${r * .16}" fill="#fff" opacity=".8" transform="rotate(-30 ${x - r * .35} ${y - r * .4})"/><text x="${x}" y="${y + r * .3}" text-anchor="middle" font-size="${r * .8}" font-weight="800" fill="#14304a">${v}</text>`;
    return `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Clawd">
      ${b(40, 34, 24, 12, 0)}${b(100, 20, 20, 7, 1)}${b(170, 34, 25, 15, 2)}${b(212, 82, 19, 9, 3)}${b(24, 84, 18, 6, 4)}
      <g transform="translate(60 44) scale(1.0)">${body(m || 'gembira')}</g></svg>`;
  }
  root.Clawd = { svg, hero, COL };
})(window);
