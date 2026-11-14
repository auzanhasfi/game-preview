'use strict';
// Stadion, rumput, garis, gawang. Semua digambar dari geometri 3D lewat kamera.
(function () {
  const L = G.L, W = G.W, R = {};
  const P = G.lapangan = {};
  let garis = [], titik = [], penonton = [], papan = [];
  const lingkaran = (cx, cy, r, a0, a1, n) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0]); } return o; };
  function bangunGaris() {
    garis = [];
    garis.push([[0, 0, 0], [L, 0, 0], [L, W, 0], [0, W, 0], [0, 0, 0]]);
    garis.push([[L / 2, 0, 0], [L / 2, W, 0]]);
    garis.push(lingkaran(L / 2, W / 2, 9.15, 0, Math.PI * 2, 48));
    for (const s of [0, 1]) {
      const x0 = s ? L : 0, sg = s ? -1 : 1;
      garis.push([[x0, 34 - 20.16, 0], [x0 + sg * 16.5, 34 - 20.16, 0], [x0 + sg * 16.5, 34 + 20.16, 0], [x0, 34 + 20.16, 0]]);
      garis.push([[x0, 34 - 9.16, 0], [x0 + sg * 5.5, 34 - 9.16, 0], [x0 + sg * 5.5, 34 + 9.16, 0], [x0, 34 + 9.16, 0]]);
      const a = Math.acos(5.5 / 9.15);
      garis.push(s ? lingkaran(L - 11, 34, 9.15, Math.PI - a, Math.PI + a, 14) : lingkaran(11, 34, 9.15, -a, a, 14));
      garis.push(s ? lingkaran(L, 0, 1, Math.PI / 2, Math.PI, 5) : lingkaran(0, 0, 1, 0, Math.PI / 2, 5));
      garis.push(s ? lingkaran(L, W, 1, Math.PI, Math.PI * 1.5, 5) : lingkaran(0, W, 1, -Math.PI / 2, 0, 5));
    }
    titik = [[L / 2, 34], [11, 34], [L - 11, 34]];
  }
  P.siapkan = function (warnaA, warnaB) {
    bangunGaris();
    const pal = [warnaA, warnaA, warnaB, warnaB, '#c9cfdb', '#39465f', '#7a6a58', '#5a6a8a', '#d9b25f'];
    const ember = pal.map(c => ({ c, xs: [] }));
    const tambah = (x, y, z) => ember[Math.floor(Math.random() * pal.length)].xs.push(x, y, z, Math.random() * 6.28);
    for (let r = 0; r < 14; r++) { const t = r / 13; for (let x = -12; x <= 117; x += 1.05) tambah(x + G.rnd(-.3, .3), -7 - t * 25, 2.7 + t * 15.5); }
    for (const s of [0, 1]) for (let r = 0; r < 11; r++) { const t = r / 10; for (let y = -4; y <= 72; y += 1.15) tambah(s ? L + 7.5 + t * 23 : -7.5 - t * 23, y + G.rnd(-.3, .3), 2.6 + t * 12); }
    penonton = ember.map(e => ({ c: e.c, xs: new Float32Array(e.xs) }));
    const teks = ['LIGA STIK', '+ − × ÷', 'BOLA MATEMATIKA', 'EDUGAME LABS', 'BELAJAR SERU', 'LIGA STIK', '7 × 8 = 56', 'EDUGAME LABS', 'FAIR PLAY', 'LIGA STIK', 'BOLA MATEMATIKA', '+ − × ÷'];
    papan = []; let i = 0;
    for (let x = -6; x < 111; x += 9.75) papan.push({ x0: x, x1: x + 9.5, teks: teks[i % teks.length], c: i++ % 2 ? '#13284b' : '#0d1c38' });
  };
  P.siapkan('#7cc3ec', '#d4231c');

  const tpt = {};
  function isi(ctx, pts, warna) { const s = G.poliLayar(pts); if (!s) return; ctx.beginPath(); ctx.moveTo(s[0][0], s[0][1]); for (let i = 1; i < s.length; i++) ctx.lineTo(s[i][0], s[i][1]); ctx.closePath(); ctx.fillStyle = warna; ctx.fill(); }
  P.gambarLatar = function (ctx, t, semangat) {
    const K = G.kam;
    const g = ctx.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, '#050a16'); g.addColorStop(.6, '#0c1830'); g.addColorStop(1, '#0f1e36');
    ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
    // tribun jauh
    isi(ctx, [[-14, -40, 25], [119, -40, 25], [119, -34, 19.5], [-14, -34, 19.5]], '#0a1222');
    isi(ctx, [[-14, -6, 2.3], [119, -6, 2.3], [119, -33, 18.6], [-14, -33, 18.6]], '#18233c');
    isi(ctx, [[-14, -5.8, 0], [119, -5.8, 0], [119, -5.8, 2.3], [-14, -5.8, 2.3]], '#111a2e');
    for (const s of [0, 1]) {
      const a = s ? L + 7 : -7, b = s ? L + 32 : -32;
      isi(ctx, [[a, -6, 2.2], [a, 74, 2.2], [b, 74, 14.8], [b, -6, 14.8]], '#16203a');
      isi(ctx, [[a, -6, 0], [a, 74, 0], [a, 74, 2.2], [a, -6, 2.2]], '#0f1729');
    }
    // penonton
    const goyang = .1 + semangat * .45;
    for (const e of penonton) {
      ctx.fillStyle = e.c; const xs = e.xs;
      for (let i = 0; i < xs.length; i += 4) {
        const z = xs[i + 2] + Math.max(0, Math.sin(t * (6 + semangat * 6) + xs[i + 3])) * goyang;
        G.proj(xs[i], xs[i + 1], z, tpt); if (!tpt.ok || tpt.x < -4 || tpt.x > K.W + 4 || tpt.y < -4 || tpt.y > K.H) continue;
        const r = Math.min(7, Math.max(1, tpt.s * .42)); ctx.fillRect(tpt.x - r / 2, tpt.y - r, r, r * 1.3);
      }
    }
    // lampu sorot
    for (const [x, y, z] of [[-10, -38, 30], [115, -38, 30], [-30, 76, 26], [135, 76, 26]]) {
      G.proj(x, y, z, tpt); if (!tpt.ok) continue; const r = Math.max(18, tpt.s * 9);
      const rg = ctx.createRadialGradient(tpt.x, tpt.y, 0, tpt.x, tpt.y, r); rg.addColorStop(0, 'rgba(255,250,230,.85)'); rg.addColorStop(.25, 'rgba(255,245,215,.25)'); rg.addColorStop(1, 'rgba(255,245,215,0)');
      ctx.fillStyle = rg; ctx.fillRect(tpt.x - r, tpt.y - r, r * 2, r * 2);
    }
    // papan iklan
    const lurus = Math.abs(Math.cos(K.yaw)) < .35;
    for (const p of papan) {
      isi(ctx, [[p.x0, -3.6, 0], [p.x1, -3.6, 0], [p.x1, -3.6, .95], [p.x0, -3.6, .95]], p.c);
      if (lurus) {
        G.proj((p.x0 + p.x1) / 2, -3.6, .47, tpt); if (!tpt.ok || tpt.x < -200 || tpt.x > K.W + 200) continue;
        ctx.fillStyle = '#d9b25f'; ctx.font = `700 ${Math.max(6, tpt.s * .52)}px Geist, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.teks, tpt.x, tpt.y);
      }
    }
    for (const s of [0, 1]) { const x = s ? L + 3.6 : -3.6; isi(ctx, [[x, 6, 0], [x, 62, 0], [x, 62, .95], [x, 6, .95]], '#10203f'); }
  };
  P.gambarRumput = function (ctx) {
    isi(ctx, [[-3.4, -3.4, 0], [L + 3.4, -3.4, 0], [L + 3.4, W + 8, 0], [-3.4, W + 8, 0]], '#245f2c');
    const n = 20, lb = L / n;
    for (let i = 0; i < n; i++) isi(ctx, [[i * lb, -2.5, 0], [(i + 1) * lb, -2.5, 0], [(i + 1) * lb, W + 2.5, 0], [i * lb, W + 2.5, 0]], i % 2 ? '#2b7535' : '#317f3b');
  };
  P.gambarGaris = function (ctx) {
    ctx.strokeStyle = 'rgba(244,246,240,.88)'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const g of garis) {
      const m = g[Math.floor(g.length / 2)]; G.proj(m[0], m[1], 0, tpt);
      ctx.lineWidth = Math.max(1, (tpt.ok ? tpt.s : 8) * .12);
      ctx.beginPath(); G.garisLayar(ctx, g); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(244,246,240,.9)';
    for (const [x, y] of titik) { G.proj(x, y, 0, tpt); if (tpt.ok) { ctx.beginPath(); ctx.ellipse(tpt.x, tpt.y, tpt.s * .22, tpt.s * .12, 0, 0, 7); ctx.fill(); } }
    // bendera sudut
    for (const [x, y] of [[0, 0], [L, 0], [0, W], [L, W]]) {
      const a = G.proj(x, y, 0, {}), b = G.proj(x, y, 1.5, {}); if (!a.ok || !b.ok) continue;
      ctx.strokeStyle = '#e8e2d0'; ctx.lineWidth = Math.max(1, a.s * .05); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.fillStyle = '#d9b25f'; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.s * .5, b.y + b.s * .15); ctx.lineTo(b.x, b.y + b.s * .32); ctx.fill();
    }
  };
  // gawang sebagai entitas (diurutkan menurut kedalaman bersama pemain)
  P.entitasGawang = function () {
    const o = [];
    for (const s of [0, 1]) { const gx = s ? L + .9 : -.9; const p = G.proj(gx, 34, 1.2, {}); if (p.ok) o.push({ d: p.d, gambar: ctx => gambarGawang(ctx, s) }); }
    return o;
  };
  function gambarGawang(ctx, s) {
    const gx = s ? L : 0, bk = s ? L + 2 : -2, y1 = 34 - G.GW / 2, y2 = 34 + G.GW / 2, h = G.GH, hb = 2.1;
    ctx.strokeStyle = 'rgba(235,240,245,.32)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = y1; y <= y2 + .01; y += .45) G.garisLayar(ctx, [[gx, y, h], [bk, y, hb], [bk, y, 0]]);
    for (let z = .45; z < hb; z += .45) G.garisLayar(ctx, [[bk, y1, z], [bk, y2, z]]);
    for (const y of [y1, y2]) for (let k = .4; k < 2; k += .4) { const x = gx + (bk - gx) * k / 2; G.garisLayar(ctx, [[x, y, 0], [x, y, h + (hb - h) * k / 2]]); }
    for (let k = .4; k < 2; k += .4) { const x = gx + (bk - gx) * k / 2; G.garisLayar(ctx, [[x, y1, h + (hb - h) * k / 2], [x, y2, h + (hb - h) * k / 2]]); }
    ctx.stroke();
    const m = G.proj(gx, 34, 1.2, {}); ctx.strokeStyle = '#f6f7f2'; ctx.lineWidth = Math.max(1.5, (m.ok ? m.s : 8) * .13); ctx.lineCap = 'round';
    ctx.beginPath(); G.garisLayar(ctx, [[gx, y1, 0], [gx, y1, h], [gx, y2, h], [gx, y2, 0]]); ctx.stroke();
  }
})();
