/* Clawd (ketam oren) + ikon SVG, dilukis sendiri. */
(function (root) {
  'use strict';
  function clawd(mood, papan) {
    const m = mood || 'senang';
    let mata, mulut, ext = '', kapit = '';
    const O = '#ee7a3c', OG = '#c9561f', OT = '#f59a63';
    if (m === 'gembira') {
      mata = '<path d="M36 44q4-7 8 0M56 44q4-7 8 0" class="cl"/>';
      mulut = '<path d="M42 58q8 10 16 0z" fill="#7a2a14" stroke="#5a1d0d" stroke-width="2" stroke-linejoin="round"/>';
      kapit = '<g class="angkat"><path d="M22 52Q8 40 8 24" class="lg"/><circle cx="8" cy="20" r="9" fill="' + O + '" stroke="' + OG + '" stroke-width="2"/><path d="M8 11v9" stroke="' + OG + '" stroke-width="2"/></g><g class="angkat k2"><path d="M78 52Q92 40 92 24" class="lg"/><circle cx="92" cy="20" r="9" fill="' + O + '" stroke="' + OG + '" stroke-width="2"/><path d="M92 11v9" stroke="' + OG + '" stroke-width="2"/></g>';
      ext = '<path class="kilau" d="M50 6l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffd36b"/>';
    } else if (m === 'oops') {
      mata = '<circle cx="40" cy="44" r="6" fill="#fff" stroke="#2a2233" stroke-width="2"/><circle cx="60" cy="44" r="6" fill="#fff" stroke="#2a2233" stroke-width="2"/><circle cx="40" cy="45" r="2.4" fill="#2a2233"/><circle cx="60" cy="45" r="2.4" fill="#2a2233"/>';
      mulut = '<ellipse cx="50" cy="61" rx="4" ry="5" fill="#7a2a14"/>';
      ext = '<path d="M76 30q4 7 0 11q-4-4 0-11z" fill="#7fd3ff" stroke="#3aa6dd" stroke-width="1.2"/>';
    } else if (m === 'fikir') {
      mata = '<circle cx="40" cy="44" r="5.6" fill="#fff" stroke="#2a2233" stroke-width="2"/><circle cx="60" cy="44" r="5.6" fill="#fff" stroke="#2a2233" stroke-width="2"/><circle cx="42" cy="42" r="2.4" fill="#2a2233"/><circle cx="62" cy="42" r="2.4" fill="#2a2233"/>';
      mulut = '<path d="M44 60q6 3 12 0" class="cl"/>';
    } else {
      mata = '<circle cx="40" cy="44" r="5" fill="#2a2233"/><circle cx="60" cy="44" r="5" fill="#2a2233"/><circle cx="41.6" cy="42.4" r="1.6" fill="#fff"/><circle cx="61.6" cy="42.4" r="1.6" fill="#fff"/>';
      mulut = '<path d="M43 59q7 7 14 0" class="cl"/>';
    }
    if (!kapit) kapit = '<g class="kapit"><path d="M24 58Q10 56 11 44" class="lg"/><path d="M5 36a8 8 0 1 1 12 0l-3 7h-6z" fill="' + O + '" stroke="' + OG + '" stroke-width="2" stroke-linejoin="round"/></g><g class="kapit k2"><path d="M76 58Q90 56 89 44" class="lg"/><path d="M83 36a8 8 0 1 1 12 0l-3 7h-6z" fill="' + O + '" stroke="' + OG + '" stroke-width="2" stroke-linejoin="round"/></g>';
    const bd = papan ? '<g><rect x="30" y="64" width="40" height="24" rx="3" fill="#2f4f45" stroke="#8a5a2b" stroke-width="3"/><path d="M36 72h14M36 79h22M54 72l3 0" stroke="#e9f3ee" stroke-width="2" stroke-linecap="round" fill="none"/></g>' : '';
    return '<svg class="clawd clawd-' + m + '" viewBox="0 0 100 100" role="img" aria-label="Clawd" xmlns="http://www.w3.org/2000/svg">' +
      '<style>.cl{fill:none;stroke:#2a2233;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.lg{fill:none;stroke:' + OG + ';stroke-width:5;stroke-linecap:round}</style>' +
      '<path d="M26 80l-10 10M36 84l-6 10M64 84l6 10M74 80l10 10" class="lg" stroke-width="4"/>' +
      kapit +
      '<path d="M40 38V28M60 38V28" stroke="' + OG + '" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="50" cy="66" rx="30" ry="22" fill="' + O + '" stroke="' + OG + '" stroke-width="2"/>' +
      '<ellipse cx="50" cy="72" rx="18" ry="10" fill="' + OT + '" opacity=".7"/>' +
      '<circle cx="40" cy="44" r="9" fill="#fff8ef" stroke="' + OG + '" stroke-width="2"/><circle cx="60" cy="44" r="9" fill="#fff8ef" stroke="' + OG + '" stroke-width="2"/>' +
      mata + '<ellipse cx="29" cy="58" rx="4.5" ry="3" fill="#ff8f94" opacity=".6"/><ellipse cx="71" cy="58" rx="4.5" ry="3" fill="#ff8f94" opacity=".6"/>' + mulut + bd + ext + '</svg>';
  }
  const P = {
    back: '<path d="M15 5l-7 7 7 7"/>',
    sndOn: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    sndOff: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/>',
    stat: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
    share: '<circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/>',
    hint: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3z"/>',
    del: '<path d="M21 5H9l-6 7 6 7h12z"/><path d="M12 9l5 6M17 9l-5 6"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    dumbbell: '<path d="M4 12h16M6 8v8M9 6v12M15 6v12M18 8v8"/>',
    teacher: '<path d="M3 5h18v11H3zM9 20h6M12 16v4"/><path d="M7 9h6M7 12h9"/>',
    link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
    play: '<path d="M7 5l12 7-12 7z" fill="currentColor"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h4v-5h4v5h4v-9"/>',
    next: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  const ikon = (n, s) => '<svg class="ik" width="' + (s || 22) + '" height="' + (s || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + '</svg>';
  root.MASKOT = { clawd, ikon };
})(window);
