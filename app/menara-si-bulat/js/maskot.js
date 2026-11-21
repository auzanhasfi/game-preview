/* Si Bulat: bulatan biru dilukis sendiri pada Canvas 2D; ikon SVG dilukis sendiri. */
(function (root) {
  'use strict';
  function draw(c, cx, cy, r, mood, t) {
    const sq = 1 + Math.sin(t * 3) * 0.03; c.save(); c.translate(cx, cy + r * (1 - sq) * 0.5); c.scale(1 / sq, sq);
    const g = c.createRadialGradient(-r * .3, -r * .4, r * .1, 0, 0, r); g.addColorStop(0, '#8fbcff'); g.addColorStop(1, '#2f6bea');
    c.fillStyle = g; c.strokeStyle = '#1b3fa0'; c.lineWidth = Math.max(1.2, r * .07); c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.stroke();
    // topi pembina
    c.fillStyle = '#ffd23f'; c.strokeStyle = '#c99a00'; c.beginPath(); c.ellipse(0, -r * .74, r * .62, r * .34, 0, Math.PI, 0); c.fill(); c.stroke();
    c.fillStyle = '#ffd23f'; c.fillRect(-r * .78, -r * .76, r * 1.56, r * .12); c.strokeRect(-r * .78, -r * .76, r * 1.56, r * .12);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-r * .38, -r * .38, r * .18, r * .1, -.6, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,130,160,.55)'; c.beginPath(); c.ellipse(-r * .55, r * .22, r * .14, r * .09, 0, 0, 7); c.ellipse(r * .55, r * .22, r * .14, r * .09, 0, 0, 7); c.fill();
    const ex = r * .3, ey = -r * .02, w = Math.max(1.3, r * .08); c.lineCap = 'round'; c.strokeStyle = '#13214d'; c.fillStyle = '#13214d'; c.lineWidth = w;
    const eyes = (rx, ry, px, py) => { for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(s * ex, ey, rx, ry, 0, 0, 7); c.fill(); c.fillStyle = '#13214d'; c.beginPath(); c.arc(s * ex + px, ey + py, rx * .55, 0, 7); c.fill(); } };
    if (mood === 'gembira') {
      c.beginPath(); for (const s of [-1, 1]) { c.moveTo(s * ex - r * .12, ey + r * .04); c.quadraticCurveTo(s * ex, ey - r * .16, s * ex + r * .12, ey + r * .04); } c.stroke();
      c.fillStyle = '#7a1f3a'; c.beginPath(); c.moveTo(-r * .22, r * .2); c.quadraticCurveTo(0, r * .62, r * .22, r * .2); c.closePath(); c.fill();
      c.fillStyle = '#ffd23f'; for (const [x, y] of [[-1.15, -.2], [1.15, -.5]]) { c.beginPath(); c.arc(x * r, y * r, r * .07 * (1 + Math.sin(t * 8) * .4), 0, 7); c.fill(); }
    } else if (mood === 'oops') {
      eyes(r * .13, r * .16, 0, 0); c.fillStyle = '#7a1f3a'; c.beginPath(); c.ellipse(0, r * .38, r * .09, r * .12, 0, 0, 7); c.fill();
      c.fillStyle = '#7fd3ff'; c.beginPath(); c.moveTo(r * .85, -r * .1); c.quadraticCurveTo(r * 1.0, r * .15, r * .85, r * .22); c.quadraticCurveTo(r * .7, r * .15, r * .85, -r * .1); c.fill();
    } else if (mood === 'fikir') {
      eyes(r * .12, r * .15, r * .04, -r * .06); c.beginPath(); c.moveTo(-r * .14, r * .36); c.lineTo(r * .14, r * .34); c.stroke();
    } else {
      eyes(r * .1, r * .13, 0, r * .02); c.beginPath(); c.moveTo(-r * .2, r * .3); c.quadraticCurveTo(0, r * .5, r * .2, r * .3); c.stroke();
    }
    c.restore();
  }
  const list = new Set();
  function mount(cv, mood) { const d = Math.min(2, root.devicePixelRatio || 1), s = +cv.getAttribute('width') || 100; cv.width = cv.height = s * d; cv.style.width = cv.style.height = s + 'px'; const o = { cv, mood: mood || 'senang', s, d }; list.add(o); return o; }
  function loop(ms) { const t = ms / 1000; list.forEach(o => { if (!o.cv.offsetParent) return; const c = o.cv.getContext('2d'); c.setTransform(o.d, 0, 0, o.d, 0, 0); c.clearRect(0, 0, o.s, o.s); draw(c, o.s / 2, o.s * .55 + Math.sin(t * 2.2) * o.s * .02, o.s * .36, o.mood, t); }); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  const P = {
    back: '<path d="M15 5l-7 7 7 7"/>', sndOn: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    sndOff: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/>', restart: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', down: '<path d="M12 4v13M6 12l6 6 6-6"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>', play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>', next: '<path d="M9 5l7 7-7 7"/>'
  };
  function icon(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + '</svg>'; }
  function star(on) { return '<svg class="st' + (on ? ' on' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 6.2 6.7.8-5 4.6 1.4 6.7L12 17.5 6 20.9l1.4-6.7-5-4.6 6.7-.8z"/></svg>'; }
  root.Bulat = { draw, mount, icon, star };
})(window);
