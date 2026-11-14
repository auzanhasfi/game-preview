'use strict';
// Ruang nama global G + alat bantu umum. Satuan dunia: meter. Lapangan 105 × 68, x = panjang, y = lebar (y=0 tribun jauh).
window.G = {};
(function () {
  const G = window.G;
  G.L = 105; G.W = 68; G.GW = 7.32; G.GH = 2.44; G.R = 0.11; G.KOTAK_P = 16.5; G.KOTAK_L = 40.32;
  G.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  G.lerp = (a, b, t) => a + (b - a) * t;
  G.jarak = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  G.rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
  G.rint = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  G.pilih = arr => arr[Math.floor(Math.random() * arr.length)];
  G.randn = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  G.sudut = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  G.acak = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // jarak titik ke ruas garis
  G.jarakRuas = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = G.clamp(t, 0, 1);
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  };
  G.simpan = {
    baca(k, d) { try { const v = localStorage.getItem('ligastik:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    tulis(k, v) { try { localStorage.setItem('ligastik:' + k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
  };
  G.param = new URLSearchParams(location.search);
  G.$ = s => document.querySelector(s);
  G.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // warna hex → rgba
  G.rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  G.bedaWarna = (a, b) => { const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    return Math.hypot((x >> 16 & 255) - (y >> 16 & 255), (x >> 8 & 255) - (y >> 8 & 255), (x & 255) - (y & 255)); };
})();
