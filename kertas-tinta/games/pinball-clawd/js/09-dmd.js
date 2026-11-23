/* Pinball Clawd: layar dot-matrix 128 x 32 (huruf bitmap 5 x 7 buatan sendiri), warna jingga seperti mesin pinball klasik */
const F = {
  A: '01110100011000111111100011000110001', B: '11110100011000111110100011000111110', C: '01110100011000010000100001000101110',
  D: '11110100011000110001100011000111110', E: '11111100001000011110100001000011111', F: '11111100001000011110100001000010000',
  G: '01110100011000010111100011000101111', H: '10001100011000111111100011000110001', I: '01110001000010000100001000010001110',
  J: '00111000100001000010000101001001100', K: '10001100101010011000101001001010001', L: '10000100001000010000100001000011111',
  M: '10001110111010110101100011000110001', N: '10001100011100110101100111000110001', O: '01110100011000110001100011000101110',
  P: '11110100011000111110100001000010000', Q: '01110100011000110001101011001001101', R: '11110100011000111110101001001010001',
  S: '01111100001000001110000010000111110', T: '11111001000010000100001000010000100', U: '10001100011000110001100011000101110',
  V: '10001100011000110001100010101000100', W: '10001100011000110101101011010101010', X: '10001100010101000100010101000110001',
  Y: '10001100010101000100001000010000100', Z: '11111000010001000100010001000011111',
  0: '01110100011001110101110011000101110', 1: '00100011000010000100001000010001110', 2: '01110100010000100010001000100011111',
  3: '11111000100010000010000011000101110', 4: '00010001100101010010111110001000010', 5: '11111100001111000001000011000101110',
  6: '00110010001000011110100011000101110', 7: '11111000010001000100010000100001000', 8: '01110100011000101110100011000101110',
  9: '01110100011000101111000010001001100', ' ': '00000000000000000000000000000000000',
  '+': '00000001000010011111001000010000000', '-': '00000000000000011111000000000000000', '×': '00000100010101000100010101000100000',
  '÷': '00000001000000011111000000010000000', '=': '00000000001111100000111110000000000', '?': '01110100010000100010001000000000100',
  '!': '00100001000010000100001000000000100', '.': '00000000000000000000000000110001100', ',': '00000000000000000000001100010001000',
  ':': '00000011000110000000011000110000000', '/': '00000000010001000100010001000000000', '\'': '00100001000100000000000000000000000'
};
const GANTI = { '−': '-', 'Ç': 'C' };

export class DMD {
  constructor(kanvas) {
    this.k = kanvas; this.g = kanvas.getContext('2d');
    this.W = 128; this.H = 32; this.pix = new Float32Array(this.W * this.H);
  }
  bersih() { this.pix.fill(0); }
  lebar(teks, s) { return teks.length * 6 * s - s; }
  tulis(teks, x, y, s = 1, terang = 1) {
    teks = String(teks).toUpperCase();
    for (const ch0 of teks) {
      const ch = GANTI[ch0] || ch0, bit = F[ch] || F['?'];
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (bit[r * 5 + c] === '1')
        for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) { const px = x + c * s + dx, py = y + r * s + dy; if (px >= 0 && px < this.W && py >= 0 && py < this.H) this.pix[py * this.W + px] = terang; }
      x += 6 * s;
    }
  }
  /* baris di tengah; besar bila muat */
  baris(teks, y, besar = true, terang = 1) {
    teks = String(teks); const s = besar && this.lebar(teks, 2) <= this.W ? 2 : 1;
    const lb = this.lebar(teks, s); this.tulis(teks, Math.round((this.W - lb) / 2), s === 2 ? y : y + 3, s, terang); return s;
  }
  kiri(teks, x, y, s = 1, terang = 1) { this.tulis(teks, x, y, s, terang); }
  kanan(teks, x, y, s = 1, terang = 1) { this.tulis(teks, x - this.lebar(String(teks), s), y, s, terang); }
  bingkai(terang = 0.5) { for (let x = 0; x < this.W; x++) { this.pix[x] = terang; this.pix[(this.H - 1) * this.W + x] = terang; } for (let y = 0; y < this.H; y++) { this.pix[y * this.W] = terang; this.pix[y * this.W + this.W - 1] = terang; } }
  /* gambar titik-titik ke kanvas tampilan */
  tampil(warna = [255, 140, 26]) {
    const k = this.k, g = this.g, cw = k.width, ch = k.height, sel = Math.min(cw / this.W, ch / this.H), ox = (cw - sel * this.W) / 2, oy = (ch - sel * this.H) / 2;
    const rad = sel * 0.42;
    const [r, gg, b] = warna;
    if (!this.latar || this.latar.width !== cw || this.latar.height !== ch) {
      const c = document.createElement('canvas'); c.width = cw; c.height = ch; const lg = c.getContext('2d');
      lg.fillStyle = '#0b0603'; lg.fillRect(0, 0, cw, ch); lg.fillStyle = 'rgba(255,140,26,0.08)';
      for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++) { lg.beginPath(); lg.arc(ox + (x + 0.5) * sel, oy + (y + 0.5) * sel, rad, 0, 6.283); lg.fill(); }
      this.latar = c;
    }
    g.drawImage(this.latar, 0, 0);
    for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++) {
      const v = this.pix[y * this.W + x]; if (v <= 0) continue;
      g.fillStyle = `rgba(${r},${gg},${b},${0.25 + 0.75 * v})`; g.beginPath(); g.arc(ox + (x + 0.5) * sel, oy + (y + 0.5) * sel, rad, 0, 6.283); g.fill();
    }
  }
}
