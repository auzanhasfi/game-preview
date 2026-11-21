/* Gemi (kucing) + ikon SVG, semuanya dilukis sendiri. */
(function (root) {
  'use strict';
  function gemi(mood) {
    const m = mood || 'senang';
    let mata, mulut, extra = '';
    if (m === 'gembira') {
      mata = '<path d="M33 52 q6 -9 12 0" class="gl"/><path d="M55 52 q6 -9 12 0" class="gl"/>';
      mulut = '<path d="M42 66 q8 12 16 0 z" fill="#8a3b2a" stroke="#6b2a1c" stroke-width="2" stroke-linejoin="round"/><path d="M45 69 q5 4 10 0" fill="#ff8f94"/>';
      extra = '<path class="kilau" d="M12 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#ffd36b"/><path class="kilau k2" d="M88 20 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" fill="#ffd36b"/>';
    } else if (m === 'oops') {
      mata = '<g class="mata"><ellipse cx="39" cy="52" rx="7" ry="8" fill="#fff"/><ellipse cx="61" cy="52" rx="7" ry="8" fill="#fff"/><circle cx="40" cy="53" r="3.6" fill="#2a2233"/><circle cx="60" cy="53" r="3.6" fill="#2a2233"/></g>';
      mulut = '<ellipse cx="50" cy="69" rx="4.4" ry="5" fill="#8a3b2a"/>';
      extra = '<path d="M75 34 q4 7 0 11 q-4 -4 0 -11z" fill="#7fd3ff" stroke="#3aa6dd" stroke-width="1.2"/>';
    } else if (m === 'fikir') {
      mata = '<g class="mata"><ellipse cx="39" cy="52" rx="6.4" ry="7.4" fill="#fff"/><ellipse cx="61" cy="52" rx="6.4" ry="7.4" fill="#fff"/><circle cx="41.5" cy="49.5" r="3.4" fill="#2a2233"/><circle cx="63.5" cy="49.5" r="3.4" fill="#2a2233"/></g>';
      mulut = '<path d="M44 68 q6 3 12 0" class="gl"/>';
    } else {
      mata = '<g class="mata"><ellipse cx="39" cy="53" rx="6" ry="7" fill="#2a2233"/><ellipse cx="61" cy="53" rx="6" ry="7" fill="#2a2233"/><circle cx="41" cy="50.5" r="2.2" fill="#fff"/><circle cx="63" cy="50.5" r="2.2" fill="#fff"/></g>';
      mulut = '<path d="M42 66 q4 5 8 0 q4 5 8 0" class="gl"/>';
    }
    return '<svg class="gemi gemi-' + m + '" viewBox="0 0 100 100" role="img" aria-label="Gemi" xmlns="http://www.w3.org/2000/svg">' +
      '<style>.gl{fill:none;stroke:#2a2233;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}</style>' +
      '<ellipse cx="34" cy="92" rx="11" ry="6.5" fill="#f2a248"/><ellipse cx="66" cy="92" rx="11" ry="6.5" fill="#f2a248"/>' +
      '<path d="M18 38 L16 8 L42 24 z" fill="#f2a248" stroke="#d98228" stroke-width="2" stroke-linejoin="round"/><path d="M82 38 L84 8 L58 24 z" fill="#f2a248" stroke="#d98228" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M22 32 L21 15 L36 25 z" fill="#ffb3b8"/><path d="M78 32 L79 15 L64 25 z" fill="#ffb3b8"/>' +
      '<ellipse cx="50" cy="58" rx="36" ry="32" fill="#f7b05a" stroke="#d98228" stroke-width="2"/>' +
      '<path d="M50 28 v10 M42 29 l2 8 M58 29 l-2 8" stroke="#d98228" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="50" cy="68" rx="17" ry="13" fill="#fff1dc"/>' +
      '<ellipse cx="26" cy="64" rx="6" ry="4" fill="#ff9aa2" opacity=".55"/><ellipse cx="74" cy="64" rx="6" ry="4" fill="#ff9aa2" opacity=".55"/>' +
      mata + '<path d="M47 60 h6 l-3 4 z" fill="#ff7b8a" stroke="#d6566a" stroke-width="1" stroke-linejoin="round"/>' + mulut +
      '<path d="M22 60 l-12 -3 M22 66 l-12 3 M78 60 l12 -3 M78 66 l12 3" stroke="#a8671e" stroke-width="1.6" stroke-linecap="round"/>' + extra + '</svg>';
  }
  const P = {
    back: '<path d="M15 5l-7 7 7 7"/>',
    sndOn: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    sndOff: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/>',
    restart: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
    undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h9a6 6 0 0 1 6 6"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h4v-5h4v5h4v-9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    times: '<path d="M6 6l12 12M18 6L6 18"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3.2 3 13.8 0 17M12 3.5c-3 3.2-3 13.8 0 17"/>'
  };
  function icon(name, cls) {
    return '<svg class="ik ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[name] + '</svg>';
  }
  root.GGART = { gemi, icon, star: function (on) {
    return '<svg class="bintang' + (on ? ' on' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z" stroke-linejoin="round"/></svg>';
  } };
})(typeof self !== 'undefined' ? self : this);
