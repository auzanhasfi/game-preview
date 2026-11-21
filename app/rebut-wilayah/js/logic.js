/* Enjin logik Bulat Rebut Wilayah. Tulen (tanpa DOM) supaya boleh diuji dalam Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.RW = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const E = 0, O = 1, T = 2, R = 3; // kosong, milik, ekor, batu
  const DIR = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const LAWAN = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const NAMA = ['up', 'down', 'left', 'right'];

  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }
  /* p% -> pecahan ringkas [pembilang, penyebut] */
  function pecahan(p) { const g = gcd(p, 100) || 100; return [p / g, 100 / g]; }

  /* Hitung hasil menutup: c = petak (E/O/T/R), trail = indeks ekor, musuh = [{x,y}].
     Kawasan kosong yang TIDAK mengandungi musuh menjadi milik pemain.
     Jika tiada musuh sama sekali: semua kecuali yang terbesar. */
  function hitungTutup(w, h, c0, trail, musuh) {
    const c = c0.slice();
    for (const i of trail) c[i] = O;
    const lab = new Int32Array(w * h).fill(-1), comps = [], stack = [];
    for (let s = 0; s < w * h; s++) {
      if (c[s] !== E || lab[s] >= 0) continue;
      const id = comps.length, cells = []; lab[s] = id; stack.push(s);
      while (stack.length) {
        const i = stack.pop(); cells.push(i);
        const x = i % w, y = (i / w) | 0;
        if (x > 0 && c[i - 1] === E && lab[i - 1] < 0) { lab[i - 1] = id; stack.push(i - 1); }
        if (x < w - 1 && c[i + 1] === E && lab[i + 1] < 0) { lab[i + 1] = id; stack.push(i + 1); }
        if (y > 0 && c[i - w] === E && lab[i - w] < 0) { lab[i - w] = id; stack.push(i - w); }
        if (y < h - 1 && c[i + w] === E && lab[i + w] < 0) { lab[i + w] = id; stack.push(i + w); }
      }
      comps.push({ cells, enemy: false });
    }
    for (const m of musuh) { const i = m.y * w + m.x; if (lab[i] >= 0) comps[lab[i]].enemy = true; }
    let isi = [];
    if (musuh.length) isi = comps.filter(k => !k.enemy);
    else if (comps.length > 1) { let b = 0; comps.forEach((k, j) => { if (k.cells.length > comps[b].cells.length) b = j; }); isi = comps.filter((k, j) => j !== b); }
    let terisi = 0;
    for (const k of isi) for (const i of k.cells) { c[i] = O; terisi++; }
    let owned = 0; for (let i = 0; i < c.length; i++) if (c[i] === O) owned++;
    return { c, owned, terisi };
  }

  function Mesin(lv, seed) {
    const w = lv.grid[0], h = lv.grid[1];
    this.lv = lv; this.w = w; this.h = h; this.c = new Uint8Array(w * h);
    for (const r of (lv.rocks || [])) for (let y = r[1]; y < r[1] + r[3]; y++) for (let x = r[0]; x < r[0] + r[2]; x++) this.c[y * w + x] = R;
    const b = lv.base;
    for (let y = b[1]; y < b[1] + b[3]; y++) for (let x = b[0]; x < b[0] + b[2]; x++) this.c[y * w + x] = O;
    this.N = 0; this.owned = 0;
    for (let i = 0; i < this.c.length; i++) { if (this.c[i] !== R) this.N++; if (this.c[i] === O) this.owned++; }
    this.lo = lv.sasaran.pct; this.hi = lv.sasaran.pct + lv.sasaran.lagi;
    this.rand = rng(seed || 1);
    const sx = b[0] + (b[2] >> 1), sy = b[1] + (b[3] >> 1);
    this.p = { x: sx, y: sy, px: sx, py: sy };
    this.asal = { x: sx, y: sy };
    this.dir = null; this.pending = null; this.trail = [];
    this.nyawa = 3; this.hilang = 0; this.skor = 0; this.tamat = null; this.tickNo = 0; this.mula = false; this.bintang = 0;
    this.musuh = lv.musuh.map(m => ({ x: m.x, y: m.y, px: m.x, py: m.y, dx: m.dx || 1, dy: m.dy || 1, jenis: m.jenis, v: m.v, acc: 0, last: null }));
  }
  const P = Mesin.prototype;
  P.pct = function () { return Math.round(this.owned * 100 / this.N); };
  P.pctTepat = function () { return this.owned * 100 / this.N; };
  P.blocked = function (x, y) { return x < 0 || y < 0 || x >= this.w || y >= this.h || this.c[y * this.w + x] === O || this.c[y * this.w + x] === R; };
  P.arah = function (d) {
    if (!DIR[d] || this.tamat) return;
    if (this.trail.length && this.dir && LAWAN[this.dir] === d) return; // tak boleh berpatah 180 semasa melukis
    this.pending = d; this.mula = true;
  };
  P.kena = function (ev, why) {
    for (const i of this.trail) this.c[i] = E;
    this.trail.length = 0;
    this.p.x = this.asal.x; this.p.y = this.asal.y; this.p.px = this.p.x; this.p.py = this.p.y;
    this.dir = null; this.pending = null; this.nyawa--; this.hilang++;
    ev.push({ t: 'nyawa', why: why, nyawa: this.nyawa });
    if (this.nyawa <= 0) { this.nyawa = 0; this.tamat = 'kalah'; ev.push({ t: 'kalah' }); }
  };
  P.tutup = function (ev) {
    const r = hitungTutup(this.w, this.h, this.c, this.trail, this.musuh);
    const pc = Math.round(r.owned * 100 / this.N);
    if (pc > this.hi) { // terlebih: batalkan
      for (const i of this.trail) this.c[i] = E;
      this.trail.length = 0; this.dir = null;
      ev.push({ t: 'terlebih', pct: pc });
      return;
    }
    const baru = [];
    for (let i = 0; i < r.c.length; i++) if (r.c[i] === O && this.c[i] !== O) baru.push(i);
    const gain = r.owned - this.owned, gp = gain * 100 / this.N;
    this.c = r.c; this.owned = r.owned; this.trail.length = 0; this.dir = null;
    this.skor += Math.round(gp * 10) + (r.terisi > 0 ? 20 : 0);
    ev.push({ t: 'tawan', gain: gain, gp: gp, baru: baru, pct: pc, luas: r.terisi > 0 });
    if (pc >= this.lo && pc <= this.hi) {
      this.tamat = 'menang';
      this.bintang = this.hilang === 0 ? 3 : this.hilang === 1 ? 2 : 1;
      this.skor += this.nyawa * 100 + 200;
      ev.push({ t: 'menang', bintang: this.bintang });
    }
  };
  P.gerakMusuh = function (m) { // true jika memotong ekor
    const w = this.w;
    if (m.jenis === 'pemburu') {
      const tg = this.p; let best = null, bs = 1e9;
      for (const n of NAMA) {
        const d = DIR[n], nx = m.x + d[0], ny = m.y + d[1];
        if (this.blocked(nx, ny)) continue;
        let s = Math.abs(nx - tg.x) + Math.abs(ny - tg.y) + this.rand() * 2.2 + (m.last && LAWAN[m.last] === n ? 2.5 : 0);
        if (s < bs) { bs = s; best = n; }
      }
      if (!best) return false;
      m.x += DIR[best][0]; m.y += DIR[best][1]; m.last = best;
      return this.c[m.y * w + m.x] === T;
    }
    const bx = this.blocked(m.x + m.dx, m.y), by = this.blocked(m.x, m.y + m.dy);
    if (bx) m.dx = -m.dx;
    if (by) m.dy = -m.dy;
    if (!bx && !by && this.blocked(m.x + m.dx, m.y + m.dy)) { m.dx = -m.dx; m.dy = -m.dy; }
    const nx = m.x + m.dx, ny = m.y + m.dy;
    if (this.blocked(nx, ny)) return false;
    const terowong = this.c[m.y * w + nx] === T && this.c[ny * w + m.x] === T; // lintas celah dua ekor
    m.x = nx; m.y = ny;
    return terowong || this.c[ny * w + nx] === T;
  };
  P.tick = function () {
    const ev = [], w = this.w, h = this.h; if (this.tamat) return ev;
    this.tickNo++;
    const Pl = this.p; Pl.px = Pl.x; Pl.py = Pl.y;
    for (const m of this.musuh) { m.px = m.x; m.py = m.y; }
    if (this.pending) {
      if (!(this.trail.length && this.dir && LAWAN[this.dir] === this.pending)) this.dir = this.pending;
      this.pending = null;
    }
    if (!this.mula) return ev;
    if (this.dir) {
      const d = DIR[this.dir], nx = Pl.x + d[0], ny = Pl.y + d[1];
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || this.c[ny * w + nx] === R) this.dir = null;
      else {
        const v = this.c[ny * w + nx];
        if (v === T) { this.kena(ev, 'sendiri'); return ev; }
        if (v === E) {
          if (!this.trail.length) { this.asal = { x: Pl.x, y: Pl.y }; ev.push({ t: 'keluar' }); }
          Pl.x = nx; Pl.y = ny; this.c[ny * w + nx] = T; this.trail.push(ny * w + nx); ev.push({ t: 'ekor', n: this.trail.length });
        } else {
          Pl.x = nx; Pl.y = ny;
          if (this.trail.length) this.tutup(ev);
        }
      }
    }
    if (this.tamat) return ev;
    for (const m of this.musuh) if (this.c[m.y * w + m.x] === T) { this.kena(ev, 'potong'); return ev; }
    for (const m of this.musuh) {
      m.acc += m.v;
      while (m.acc >= 1) {
        m.acc -= 1;
        if (this.gerakMusuh(m)) { this.kena(ev, 'potong'); return ev; }
      }
    }
    return ev;
  };

  /* ---- bantuan untuk bot ujian / ujian logik ---- */
  function dariSnap(s) { // bina Mesin ringkas daripada snapshot halaman
    const m = Object.create(Mesin.prototype);
    Object.assign(m, { w: s.w, h: s.h, c: Uint8Array.from(s.c), N: s.N, owned: s.owned, lo: s.lo, hi: s.hi, trail: s.trail.slice(), musuh: s.musuh.map(a => ({ x: a.x, y: a.y })), p: { x: s.p.x, y: s.p.y } });
    return m;
  }
  return { E, O, T, R, DIR, LAWAN, NAMA, Mesin, rng, gcd, pecahan, hitungTutup, dariSnap };
});
