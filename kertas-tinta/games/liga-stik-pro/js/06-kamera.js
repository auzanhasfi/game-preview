'use strict';
// Kamera perspektif sederhana: titik pandang (lx,ly,lz), yaw (arah horizontal), pitch (menunduk), jarak, F (panjang fokus piksel).
// Kamera "siaran" melihat dari sisi tribun dekat (yaw = -90°), kamera "penalti" dari belakang titik penalti.
(function () {
  const K = G.kam = { lx: 52.5, ly: 34, lz: 0, yaw: -Math.PI / 2, pitch: .5, dist: 64, F: 900, W: 800, H: 600, cy: .52, lebar: 46,
    px: 0, py: 0, pz: 0, fx: 0, fy: 0, fz: 0, rx: 0, ry: 0, ux: 0, uy: 0, uz: 0, hx: 0, hy: 0 };
  G.kamHitung = function () {
    const hx = Math.cos(K.yaw), hy = Math.sin(K.yaw), cp = Math.cos(K.pitch), sp = Math.sin(K.pitch);
    K.hx = hx; K.hy = hy;
    K.fx = hx * cp; K.fy = hy * cp; K.fz = -sp;
    K.rx = -hy; K.ry = hx;
    K.ux = hx * sp; K.uy = hy * sp; K.uz = cp;
    K.px = K.lx - K.fx * K.dist; K.py = K.ly - K.fy * K.dist; K.pz = K.lz - K.fz * K.dist;
    K.F = K.W * K.dist / K.lebar;
  };
  // koordinat kamera: a (kanan), b (atas), d (kedalaman)
  G.keKam = function (x, y, z, o) {
    const dx = x - K.px, dy = y - K.py, dz = z - K.pz;
    o.a = dx * K.rx + dy * K.ry; o.b = dx * K.ux + dy * K.uy + dz * K.uz; o.d = dx * K.fx + dy * K.fy + dz * K.fz; return o;
  };
  const tmp = {};
  G.proj = function (x, y, z, o) {
    o = o || {}; G.keKam(x, y, z, tmp);
    if (tmp.d < .6) { o.ok = false; o.d = tmp.d; return o; }
    const s = K.F / tmp.d; o.x = K.W / 2 + tmp.a * s; o.y = K.H * K.cy - tmp.b * s; o.s = s; o.d = tmp.d; o.ok = true; return o;
  };
  const NEAR = .8;
  const keLayar = (c) => { const s = K.F / c.d; return [K.W / 2 + c.a * s, K.H * K.cy - c.b * s]; };
  // poligon tertutup (titik [x,y,z]) dengan pemotongan bidang dekat → titik layar
  G.poliLayar = function (pts) {
    const cs = pts.map(p => G.keKam(p[0], p[1], p[2], {}));
    const out = [];
    for (let i = 0; i < cs.length; i++) {
      const A = cs[i], B = cs[(i + 1) % cs.length], ai = A.d >= NEAR, bi = B.d >= NEAR;
      if (ai) out.push(keLayar(A));
      if (ai !== bi) { const t = (NEAR - A.d) / (B.d - A.d); out.push(keLayar({ a: A.a + (B.a - A.a) * t, b: A.b + (B.b - A.b) * t, d: NEAR })); }
    }
    return out.length >= 3 ? out : null;
  };
  // garis bersambung → memanggil ctx.moveTo/lineTo dengan pemotongan
  G.garisLayar = function (ctx, pts) {
    let pena = false; const A = {}, B = {};
    for (let i = 0; i < pts.length - 1; i++) {
      G.keKam(pts[i][0], pts[i][1], pts[i][2], A); G.keKam(pts[i + 1][0], pts[i + 1][1], pts[i + 1][2], B);
      let a = A, b = B;
      if (a.d < NEAR && b.d < NEAR) { pena = false; continue; }
      if (a.d < NEAR) { const t = (NEAR - a.d) / (b.d - a.d); a = { a: a.a + (b.a - a.a) * t, b: a.b + (b.b - a.b) * t, d: NEAR }; pena = false; }
      if (b.d < NEAR) { const t = (NEAR - a.d) / (b.d - a.d); b = { a: a.a + (b.a - a.a) * t, b: a.b + (b.b - a.b) * t, d: NEAR }; }
      const p = keLayar(a), q = keLayar(b);
      if (!pena) { ctx.moveTo(p[0], p[1]); pena = true; }
      ctx.lineTo(q[0], q[1]);
      if (B.d < NEAR) pena = false;
    }
  };
  // arah stik layar → arah dunia (mendatar)
  G.stikKeDunia = function (sx, sy) {
    const wx = K.rx * sx + K.hx * -sy, wy = K.ry * sx + K.hy * -sy; const m = Math.hypot(wx, wy);
    return m > 1e-6 ? { x: wx / m, y: wy / m, m: Math.min(1, Math.hypot(sx, sy)) } : { x: 0, y: 0, m: 0 };
  };
  // atur ukuran layar
  G.kamUkuran = function (W, H) { K.W = W; K.H = H; };
  // kamera mengikuti: target = {lx,ly,lz,yaw,pitch,dist,lebar,cy}, k = kehalusan
  G.kamIkut = function (T, dt, k = 4) {
    const a = 1 - Math.exp(-k * dt);
    for (const n of ['lx', 'ly', 'lz', 'pitch', 'dist', 'lebar', 'cy']) if (T[n] != null) K[n] += (T[n] - K[n]) * a;
    if (T.yaw != null) K.yaw += G.sudut(T.yaw - K.yaw) * a;
    G.kamHitung();
  };
  G.kamLompat = function (T) { Object.assign(K, T); G.kamHitung(); };
})();
