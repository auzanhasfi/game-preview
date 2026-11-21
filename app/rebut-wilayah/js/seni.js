/* Si Bulat, kutu peronda dan ikon: semuanya dilukis sendiri (Canvas 2D + SVG). Tiada emoji. */
(function (root) {
  'use strict';
  /* Si Bulat: bulatan biru bermata. mood: senang | gembira | oops | fikir. look = [dx,dy] arah pandang (-1..1). */
  function bulat(ctx, cx, cy, r, o) {
    o = o || {}; const mood = o.mood || 'senang', look = o.look || [0, 0], t = o.t || 0;
    ctx.save(); ctx.translate(cx, cy);
    const sq = 1 + Math.sin(t * 6) * 0.025; ctx.scale(1 / sq, sq);
    ctx.fillStyle = 'rgba(20,40,90,.22)'; ctx.beginPath(); ctx.ellipse(0, r * 0.92, r * 0.8, r * 0.2, 0, 0, 7); ctx.fill();
    const g = ctx.createRadialGradient(-r * .35, -r * .45, r * .1, 0, 0, r * 1.1);
    g.addColorStop(0, '#79b2ff'); g.addColorStop(.55, '#3d7be8'); g.addColorStop(1, '#2459c4');
    ctx.fillStyle = g; ctx.strokeStyle = '#1b3f94'; ctx.lineWidth = Math.max(1.2, r * .09);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-r * .42, -r * .55, r * .22, r * .12, -.6, 0, 7); ctx.fill();
    const ex = r * .36, ey = -r * .1, er = r * .27;
    const eye = function (x, rx, ry) {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1b3f94'; ctx.lineWidth = Math.max(1, r * .05);
      ctx.beginPath(); ctx.ellipse(x, ey, rx, ry, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#15213f'; ctx.beginPath(); ctx.arc(x + look[0] * rx * .42, ey + look[1] * ry * .4 + (mood === 'fikir' ? -ry * .3 : 0), Math.max(1.2, rx * .52), 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + look[0] * rx * .42 - rx * .15, ey + look[1] * ry * .4 - ry * .25, Math.max(.6, rx * .16), 0, 7); ctx.fill();
    };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (mood === 'gembira') {
      ctx.strokeStyle = '#15213f'; ctx.lineWidth = Math.max(1.6, r * .11);
      [-ex, ex].forEach(function (x) { ctx.beginPath(); ctx.arc(x, ey + er * .35, er * .8, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); });
      ctx.fillStyle = '#15213f'; ctx.beginPath(); ctx.moveTo(-r * .3, r * .26); ctx.quadraticCurveTo(0, r * .78, r * .3, r * .26); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff8a95'; ctx.beginPath(); ctx.ellipse(0, r * .5, r * .13, r * .08, 0, 0, 7); ctx.fill();
    } else if (mood === 'oops') {
      eye(-ex, er * 1.05, er * 1.2); eye(ex, er * 1.05, er * 1.2);
      ctx.fillStyle = '#15213f'; ctx.beginPath(); ctx.ellipse(0, r * .46, r * .11, r * .14, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#9fdcff'; ctx.strokeStyle = '#3aa6dd'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(r * .78, -r * .55); ctx.quadraticCurveTo(r * 1.0, -r * .2, r * .78, -r * .12); ctx.quadraticCurveTo(r * .56, -r * .2, r * .78, -r * .55); ctx.fill(); ctx.stroke();
    } else if (mood === 'fikir') {
      eye(-ex, er, er * 1.1); eye(ex, er, er * 1.1);
      ctx.strokeStyle = '#15213f'; ctx.lineWidth = Math.max(1.5, r * .09);
      ctx.beginPath(); ctx.moveTo(-r * .18, r * .45); ctx.lineTo(r * .22, r * .4); ctx.stroke();
    } else {
      eye(-ex, er, er * 1.1); eye(ex, er, er * 1.1);
      ctx.strokeStyle = '#15213f'; ctx.lineWidth = Math.max(1.5, r * .09);
      ctx.beginPath(); ctx.arc(0, r * .28, r * .24, .15 * Math.PI, .85 * Math.PI); ctx.stroke();
    }
    ctx.restore();
  }
  /* Kutu peronda: bola berduri, marah. jenis 'bola' (merah) atau 'pemburu' (ungu bertanduk). */
  function kutu(ctx, cx, cy, r, jenis, t) {
    ctx.save(); ctx.translate(cx, cy);
    const hunter = jenis === 'pemburu', col = hunter ? ['#a77bf0', '#6a3fc0', '#3d2287'] : ['#ff8a5c', '#e8503a', '#a82a1c'];
    ctx.rotate(t * (hunter ? 1.2 : 2));
    ctx.fillStyle = col[2];
    const n = hunter ? 6 : 8;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2; ctx.save(); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(r * .75, -r * .2); ctx.lineTo(r * 1.28, 0); ctx.lineTo(r * .75, r * .2); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.rotate(-t * (hunter ? 1.2 : 2));
    const g = ctx.createRadialGradient(-r * .3, -r * .35, r * .1, 0, 0, r);
    g.addColorStop(0, col[0]); g.addColorStop(1, col[1]);
    ctx.fillStyle = g; ctx.strokeStyle = col[2]; ctx.lineWidth = Math.max(1.2, r * .09);
    ctx.beginPath(); ctx.arc(0, 0, r * .86, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-r * .3, -r * .08, r * .2, r * .24, 0, 0, 7); ctx.ellipse(r * .3, -r * .08, r * .2, r * .24, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#1b1020'; ctx.beginPath(); ctx.arc(-r * .27, -r * .02, r * .1, 0, 7); ctx.arc(r * .33, -r * .02, r * .1, 0, 7); ctx.fill();
    ctx.strokeStyle = '#1b1020'; ctx.lineWidth = Math.max(1.4, r * .1); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-r * .55, -r * .42); ctx.lineTo(-r * .1, -r * .24); ctx.moveTo(r * .55, -r * .42); ctx.lineTo(r * .1, -r * .24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * .3, r * .38); ctx.lineTo(-r * .1, r * .28); ctx.lineTo(r * .1, r * .38); ctx.lineTo(r * .3, r * .28); ctx.stroke();
    ctx.restore();
  }
  /* pasang maskot Bulat pada elemen canvas (saiz CSS ikut elemen) */
  function maskot(cv, mood) {
    const s = cv.clientWidth || +cv.getAttribute('width') || 64, d = Math.min(2, root.devicePixelRatio || 1);
    cv.width = Math.round(s * d); cv.height = Math.round(s * d);
    const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, s, s);
    cv.dataset.mood = mood; bulat(c, s / 2, s * .52, s * .38, { mood: mood, look: [0, 0.1] });
  }
  const P = {
    back: '<path d="M15 5l-7 7 7 7"/>',
    sndOn: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    sndOff: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/>',
    restart: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
    pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>',
    play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3.2 3 13.8 0 17M12 3.5c-3 3.2-3 13.8 0 17"/>',
    map: '<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z"/><path d="M9 4v14M15 6v14"/>',
    swipe: '<path d="M5 12h14M15 8l4 4-4 4"/><circle cx="5" cy="12" r="1.6" fill="currentColor"/>',
    loop: '<path d="M5 15V9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v6"/><path d="M5 15h4M15 15h4" /><path d="M8 19l-3-4M16 19l3-4"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    bug: '<circle cx="12" cy="13" r="5"/><path d="M12 8V5M7 10L4 8M17 10l3-2M7 16l-3 2M17 16l3 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  function ikon(n, cls) {
    return '<svg class="ik ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + '</svg>';
  }
  function bintang(on) { return '<svg class="bintang' + (on ? ' on' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z" stroke-linejoin="round"/></svg>'; }
  function hati(on) { return '<svg class="hati' + (on ? ' on' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.800-8 11-8 11z" stroke-linejoin="round"/></svg>'; }
  root.RWSENI = { bulat: bulat, kutu: kutu, maskot: maskot, ikon: ikon, bintang: bintang, hati: hati };
})(typeof self !== 'undefined' ? self : this);
