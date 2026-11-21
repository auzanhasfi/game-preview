/* Geometri tangram: 7 kepingan, luas keseluruhan = 8 unit (segi empat sama kecil = 1).
   Dipakai oleh game DAN penjana siluet (Node). */
(function (root) {
  'use strict';
  const R2 = Math.SQRT2;
  const RAW = {
    L: [[0, 0], [2, 0], [0, 2]],                                   // segi tiga besar, luas 2
    M: [[0, 0], [R2, 0], [0, R2]],                                 // segi tiga sederhana, luas 1
    S: [[0, 0], [1, 0], [0, 1]],                                   // segi tiga kecil, luas 0.5
    Q: [[0, 0], [1, 0], [1, 1], [0, 1]],                           // segi empat sama, luas 1
    P: [[0, 0], [R2, 0], [R2 * 1.5, R2 / 2], [R2 / 2, R2 / 2]]     // segi empat selari, luas 1
  };
  const LUAS = { L: 2, M: 1, S: 0.5, Q: 1, P: 1 };
  const JUMLAH = 8;
  const PECAHAN = { L: [1, 4], M: [1, 8], S: [1, 16], Q: [1, 8], P: [1, 8] };
  const SET = ['L', 'L', 'M', 'S', 'S', 'Q', 'P'];

  function luasPoli(p) { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a / 2; }
  function pusat(p) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length], w = p[i][0] * q[1] - q[0] * p[i][1]; a += w; cx += (p[i][0] + q[0]) * w; cy += (p[i][1] + q[1]) * w; }
    a /= 2; return [cx / (6 * a), cy / (6 * a)];
  }
  const CANON = {};
  Object.keys(RAW).forEach(t => { const c = pusat(RAW[t]); CANON[t] = RAW[t].map(p => [p[0] - c[0], p[1] - c[1]]); });

  /* titik canon -> titik dunia: balik (cermin x) dahulu, putar k*45 darjah (arah jam di skrin), lalu ke pusat c */
  function titik(v, k, f, c) {
    const x = f ? -v[0] : v[0], y = v[1], a = k * Math.PI / 4, co = Math.cos(a), si = Math.sin(a);
    return [c[0] + x * co - y * si, c[1] + x * si + y * co];
  }
  function poli(t, k, f, c) { return CANON[t].map(v => titik(v, k, f, c)); }

  /* Adakah kepingan jenis t (putaran k, balik f, pusat c) padan dengan petak slot? d = jarak pusat. */
  function padan(t, k, f, c, slot) {
    const d = Math.hypot(c[0] - slot.c[0], c[1] - slot.c[1]);
    if (slot.t !== t) return { d, ok: false };
    const sp = poli(slot.t, slot.k, slot.f, slot.c), pp = poli(t, k, f, slot.c);
    const ok = pp.every(p => sp.some(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.06));
    return { d, ok };
  }
  const API = { RAW, CANON, LUAS, JUMLAH, PECAHAN, SET, luasPoli, pusat, titik, poli, padan };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TGGEO = API;
})(typeof self !== 'undefined' ? self : this);
