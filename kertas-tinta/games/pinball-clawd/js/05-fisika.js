/* Pinball Clawd: fisika bola 2D di bidang meja (sub-langkah kecil supaya bola cepat tidak menembus dinding).
   Murni JS tanpa DOM. Peristiwa dikirim lewat fungsi lapor(nama, data). */
import { MEJA, DINDING, TARGET, LINGKARAN, FLIPPER, PLUNGER, SENSOR, RAMP, RAMP_KELUAR } from './04-meja.js';

const BR = MEJA.BR, VMAX = 3900;
const ANG_NAIK = 30, ANG_TURUN = 22; // rad/detik

function titikTerdekat(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
  return [ax + dx * t, ay + dy * t, t];
}

/* panjang busur lintasan ramp untuk animasi rel */
function siapkanRel(pts) {
  const d = [0]; for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, d, L: d[d.length - 1] };
}
export function titikRel(rel, s) {
  const { pts, d } = rel; s = Math.max(0, Math.min(rel.L, s));
  let i = 1; while (i < d.length - 1 && d[i] < s) i++;
  const f = (s - d[i - 1]) / ((d[i] - d[i - 1]) || 1), a = pts[i - 1], b = pts[i];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}
export const REL = RAMP.map(siapkanRel);

export class Fisika {
  constructor(lapor = () => {}) {
    this.lapor = lapor;
    this.bola = [];
    this.flip = FLIPPER.map((f) => ({ ...f, a: f.diam, w: 0, tekan: false }));
    this.target = TARGET.map(() => true); // true = berdiri
    this.tarik = 0; this.menarik = false;
    this.spinner = { sudut: 0, w: 0 };
    this.sling = [0, 0]; this.bumper = [0, 0, 0]; this.clawd = 0;
    this.t = 0; this.idBola = 0;
    this.kotakTahan = null; // bola di Kotak Clawd
    this.mati = false; // tilt: flipper tidak berfungsi
  }

  tambahBola(x = PLUNGER.x, y = PLUNGER.y0 - BR - 2, vx = 0, vy = 0) {
    const b = { id: ++this.idBola, x, y, vx, vy, z: 0, rel: null, ditahan: 0, diam: 0, zona: {}, putar: 0, sumbu: [1, 0] };
    this.bola.push(b); return b;
  }

  diLorongPlunger(b) { return b.x > 470 && b.y > 300 && !b.rel; }

  luncurkan(kuat) {
    let ok = false;
    for (const b of this.bola) if (this.diLorongPlunger(b) && b.y > PLUNGER.y0 - 60) { b.vy = -(1050 + 1750 * kuat); b.vx = 0; ok = true; }
    return ok;
  }

  goyang(dx, dy) { for (const b of this.bola) if (!b.rel && !b.ditahan) { b.vx += dx; b.vy += dy; } }

  langkah(dt) {
    dt = Math.min(dt, 1 / 30);
    const n = Math.max(1, Math.ceil(dt / (1 / 720)));
    const h = dt / n;
    for (let i = 0; i < n; i++) this.sub(h);
    // efek visual meredup
    this.sling = this.sling.map((s) => Math.max(0, s - dt * 6)); this.bumper = this.bumper.map((s) => Math.max(0, s - dt * 5)); this.clawd = Math.max(0, this.clawd - dt * 2);
    this.spinner.sudut += this.spinner.w * dt; this.spinner.w *= Math.pow(0.25, dt);
    if (Math.abs(this.spinner.w) > 1) { const lama = Math.floor((this.spinner.sudut - this.spinner.w * dt) / Math.PI), baru = Math.floor(this.spinner.sudut / Math.PI); if (lama !== baru) this.lapor('spinner'); }
  }

  sub(h) {
    this.t += h;
    // flipper
    for (const f of this.flip) {
      const tujuan = f.tekan && !this.mati ? f.naik : f.diam, lama = f.a;
      const kec = (f.tekan && !this.mati ? ANG_NAIK : ANG_TURUN) * h;
      const dA = tujuan - f.a; f.a += Math.max(-kec, Math.min(kec, dA));
      f.w = (f.a - lama) / h;
    }
    // plunger
    if (this.menarik) this.tarik = Math.min(1, this.tarik + h * 1.1);
    const lantai = PLUNGER.y0 + this.tarik * PLUNGER.tarik;

    for (const b of this.bola) {
      if (b.ditahan > 0) { b.ditahan -= h; continue; }
      if (b.rel) { this.jalanRel(b, h); continue; }
      b.vy += MEJA.G * h;
      const sp = Math.hypot(b.vx, b.vy); if (sp > VMAX) { b.vx *= VMAX / sp; b.vy *= VMAX / sp; }
      const ox = b.x, oy = b.y;
      b.x += b.vx * h; b.y += b.vy * h;
      for (const s of DINDING) this.tabrakSeg(b, s);
      for (let i = 0; i < TARGET.length; i++) if (this.target[i]) this.tabrakSeg(b, TARGET[i]);
      for (const c of LINGKARAN) this.tabrakLingkaran(b, c);
      for (const f of this.flip) this.tabrakFlipper(b, f);
      // lantai plunger
      if (b.x > 470 && b.y > lantai - BR) { b.y = lantai - BR; if (b.vy > 0) b.vy = this.menarik ? 0 : -b.vy * 0.2; }
      this.sensor(b, ox, oy);
      // putaran bola untuk render
      const d = Math.hypot(b.x - ox, b.y - oy); if (d > 0.01) { b.putar += d / BR; b.sumbu = [-(b.y - oy) / d, (b.x - ox) / d]; }
    }
    // antar bola
    for (let i = 0; i < this.bola.length; i++) for (let j = i + 1; j < this.bola.length; j++) this.antarBola(this.bola[i], this.bola[j]);
    // bola jatuh ke drain
    for (let i = this.bola.length - 1; i >= 0; i--) { const b = this.bola[i]; if (b.y > MEJA.H + 30) { this.bola.splice(i, 1); this.lapor('drain', b); } }
  }

  tabrakSeg(b, s) {
    const [qx, qy] = titikTerdekat(b.x, b.y, s.a.x, s.a.y, s.b.x, s.b.y);
    let dx = b.x - qx, dy = b.y - qy; const min = BR + s.r, d2 = dx * dx + dy * dy;
    if (d2 >= min * min) return;
    if (s.depan) { // gerbang satu arah: abaikan bola yang pusatnya belum jelas di sisi depan
      if (!s.nd) { const ex = s.b.x - s.a.x, ey = s.b.y - s.a.y, l = Math.hypot(ex, ey); let nx = -ey / l, ny = ex / l; if (nx * s.depan.x + ny * s.depan.y < 0) { nx = -nx; ny = -ny; } s.nd = { x: nx, y: ny }; }
      if ((b.x - s.a.x) * s.nd.x + (b.y - s.a.y) * s.nd.y < BR * 0.5) return;
    }
    let d = Math.sqrt(d2); if (d < 1e-6) { dx = 0; dy = -1; d = 1; }
    const nx = dx / d, ny = dy / d;
    b.x += nx * (min - d); b.y += ny * (min - d);
    const vn = b.vx * nx + b.vy * ny;
    if (vn < 0) {
      b.vx -= (1 + s.e) * vn * nx; b.vy -= (1 + s.e) * vn * ny;
      // gesekan kecil sepanjang permukaan
      const tx = -ny, ty = nx, vt = b.vx * tx + b.vy * ty; b.vx -= vt * 0.012 * tx; b.vy -= vt * 0.012 * ty;
      if (s.jenis === 'sling' && -vn > 90) { const k = 820; b.vx += nx * k; b.vy += ny * k; this.sling[s.idx] = 1; this.lapor('sling', s.idx); }
      else if (s.jenis === 'target' && -vn > 60) { this.target[s.idx] = false; this.lapor('target', s.idx); }
      else if (-vn > 260) this.lapor('pantul', { kuat: -vn, jenis: s.jenis });
    }
  }

  tabrakLingkaran(b, c) {
    let dx = b.x - c.x, dy = b.y - c.y; const min = BR + c.r, d2 = dx * dx + dy * dy;
    if (d2 >= min * min) return;
    const d = Math.sqrt(d2) || 1, nx = dx / d, ny = dy / d;
    b.x = c.x + nx * min; b.y = c.y + ny * min;
    const vn = b.vx * nx + b.vy * ny;
    if (vn < 0) {
      b.vx -= (1 + c.e) * vn * nx; b.vy -= (1 + c.e) * vn * ny;
      if (c.jenis === 'bumper') {
        const vn2 = b.vx * nx + b.vy * ny, mau = 1020; if (vn2 < mau) { b.vx += (mau - vn2) * nx; b.vy += (mau - vn2) * ny; }
        this.bumper[c.idx] = 1; this.lapor('bumper', c.idx);
      } else if (c.jenis === 'clawd' && -vn > 120) { this.clawd = 1; this.lapor('clawd'); }
    }
  }

  tabrakFlipper(b, f) {
    const tx = f.px + Math.cos(f.a) * f.L, ty = f.py + Math.sin(f.a) * f.L;
    const [qx, qy, t] = titikTerdekat(b.x, b.y, f.px, f.py, tx, ty);
    const rad = f.r1 + (f.r2 - f.r1) * t, min = BR + rad;
    let dx = b.x - qx, dy = b.y - qy; const d2 = dx * dx + dy * dy;
    if (d2 >= min * min) return;
    const d = Math.sqrt(d2) || 1, nx = dx / d, ny = dy / d;
    b.x += nx * (min - d); b.y += ny * (min - d);
    // kecepatan titik kontak flipper (rotasi kaku sekitar pangkal)
    const cx = qx + nx * rad - f.px, cy = qy + ny * rad - f.py;
    const vcx = -f.w * cy, vcy = f.w * cx;
    const rvx = b.vx - vcx, rvy = b.vy - vcy, vn = rvx * nx + rvy * ny;
    if (vn < 0) {
      const e = Math.abs(f.w) > 1 ? 0.42 : 0.25;
      b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny;
      if (Math.abs(f.w) > 1 && -vn > 400) this.lapor('pukul', { sisi: f.sisi, kuat: -vn });
    }
  }

  antarBola(a, b) {
    if (a.rel || b.rel || a.ditahan > 0 || b.ditahan > 0) return;
    let dx = b.x - a.x, dy = b.y - a.y; const d2 = dx * dx + dy * dy, min = BR * 2;
    if (d2 >= min * min) return;
    const d = Math.sqrt(d2) || 1, nx = dx / d, ny = dy / d, p = (min - d) / 2;
    a.x -= nx * p; a.y -= ny * p; b.x += nx * p; b.y += ny * p;
    const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    if (vn < 0) { const j = -vn * 0.95; a.vx -= j * nx; a.vy -= j * ny; b.vx += j * nx; b.vy += j * ny; this.lapor('antarBola'); }
  }

  sensor(b, ox, oy) {
    const S = SENSOR, z = b.zona, t = this.t;
    const sekali = (k, jeda = 0.6) => { if (z[k] && t - z[k] < jeda) return false; z[k] = t; return true; };
    S.orbit.forEach((o, i) => { if (b.x > o.x1 && b.x < o.x2 && b.y > o.y1 && b.y < o.y2 && b.vy < -150 && sekali('orbit' + i, 1.2)) this.lapor('orbit', i); });
    S.ramp.forEach((r, i) => {
      if (b.vy < 0 && Math.hypot(b.x - r.x, b.y - r.y) < r.r) { b.rel = { i, s: 0, v: Math.max(520, Math.min(1100, -b.vy * 0.6)) }; this.lapor('ramp', i); }
    });
    const k = S.kotak;
    if (Math.hypot(b.x - k.x, b.y - k.y) < k.r && !this.kotakTahan && !(z.lepas && t - z.lepas < 1.2)) { b.x = k.x; b.y = k.y; b.vx = b.vy = 0; b.ditahan = 1e9; this.kotakTahan = b; this.lapor('kotak', b); }
    S.lajurAtas.forEach((l, i) => { if (oy < l.y && b.y >= l.y && b.x > l.x1 && b.x < l.x2) this.lapor('lajur', i); });
    S.inlane.forEach((l, i) => { if (b.x > l.x1 && b.x < l.x2 && b.y > l.y1 && b.y < l.y2 && b.vy > 0 && sekali('in' + i, 1)) this.lapor('inlane', i); });
    S.outlane.forEach((l, i) => { if (b.x > l.x1 && b.x < l.x2 && b.y > l.y1 && b.y < l.y2 && b.vy > 0 && sekali('out' + i, 1)) this.lapor('outlane', { i, b }); });
    const sp = S.spinner; if (b.x > sp.x1 && b.x < sp.x2 && ((oy - sp.y) * (b.y - sp.y) <= 0) && Math.abs(b.vy) > 200) this.spinner.w = Math.max(Math.abs(this.spinner.w), Math.abs(b.vy) / 40) * Math.sign(-b.vy || 1);
    // bola diam terlalu lama (tersangkut): dorong sedikit
    const diam = Math.abs(b.vx) + Math.abs(b.vy) < 8 && b.y < 900 && !this.diLorongPlunger(b);
    b.diam = diam ? b.diam + (t - (b._t || t)) : 0; b._t = t;
    if (b.diam > 3) { b.diam = 0; b.vy = -500; b.vx = (Math.random() - 0.5) * 400; this.lapor('cari'); }
  }

  jalanRel(b, h) {
    const rel = REL[b.rel.i];
    b.rel.s += b.rel.v * h;
    const [x, y, z] = titikRel(rel, b.rel.s);
    const ox = b.x, oy = b.y; b.x = x; b.y = y; b.z = z;
    const d = Math.hypot(b.x - ox, b.y - oy); if (d > 0.01) { b.putar += d / BR; b.sumbu = [-(b.y - oy) / d, (b.x - ox) / d]; }
    if (b.rel.s >= rel.L) { const k = RAMP_KELUAR[b.rel.i]; b.x = k.x; b.y = k.y; b.vx = k.vx; b.vy = k.vy; b.z = 0; this.lapor('rampSelesai', b.rel.i); b.rel = null; }
  }

  lepasKotak(vx = (Math.random() - 0.5) * 260, vy = 620) {
    const b = this.kotakTahan; if (!b) return null;
    b.ditahan = 0; b.vx = vx; b.vy = vy; b.y += 2; b.zona.lepas = this.t; this.kotakTahan = null; return b;
  }
  /* bola di Kotak dikunci: dikeluarkan dari meja */
  kunciKotak() { const b = this.kotakTahan; if (!b) return; this.bola.splice(this.bola.indexOf(b), 1); this.kotakTahan = null; }
  pasangTarget() { this.target = this.target.map(() => true); }
}
