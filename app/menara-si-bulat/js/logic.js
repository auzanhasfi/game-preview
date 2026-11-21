/* Logik tulen (tanpa DOM) — diuji dalam uji/logik.mjs. Unit: sentimeter. */
(function (root) {
  'use strict';
  const LH = 10; // tinggi satu lapisan (cm)
  // top/blk: {x: pusat, w: lebar}
  function resolve(top, blk, tol) {
    const tl = top.x - top.w / 2, tr = top.x + top.w / 2, bl = blk.x - blk.w / 2, br = blk.x + blk.w / 2;
    const l = Math.max(tl, bl), r = Math.min(tr, br), ov = r - l;
    if (ov <= 0) return { kind: 'miss' };
    if (Math.abs(blk.x - top.x) <= tol) return { kind: 'perfect', x: top.x, w: Math.min(top.w, blk.w) };
    const side = blk.x > top.x ? 1 : -1, cutW = blk.w - ov;
    return { kind: 'cut', x: (l + r) / 2, w: ov, cutW, side, cutX: side > 0 ? (r + br) / 2 : (bl + l) / 2 };
  }
  function regrow(w, w0, combo) { return combo >= 2 ? Math.min(w0, w + 5) : w; }
  function stars(menang, perfect, layers) {
    if (!menang) return 0;
    return perfect >= Math.ceil(layers * 0.7) ? 3 : perfect >= Math.ceil(layers * 0.35) ? 2 : 1;
  }
  function skorSusun(perfect, combo, tahap) { return perfect ? 10 + 30 * Math.min(combo, 5) : 10 + tahap; }
  function swingX(phase, A) { return A * Math.sin(phase); }
  function fm(cm) { return (Math.round(cm) / 100).toFixed(1).replace('.', ',') + ' m'; }
  const api = { LH, resolve, regrow, stars, skorSusun, swingX, fm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Logic = api;
})(typeof window !== 'undefined' ? window : globalThis);
