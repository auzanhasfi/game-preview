/* Clawd Kilat: geser (sentuh/mouse) dan keyboard → aksi kiri/kanan/lompat/guling/kilat/jeda */

export function pasangInput(aksi) {
  let x0 = 0, y0 = 0, t0 = 0, aktif = false, dipakai = false;
  const AMBANG = 28;
  const lewati = (el) => el && el.closest && el.closest('button, a, .lapis, .menu, summary');
  const mulai = (x, y, el) => { if (lewati(el)) return; aktif = true; dipakai = false; x0 = x; y0 = y; t0 = performance.now(); };
  const gerak = (x, y) => {
    if (!aktif || dipakai) return;
    const dx = x - x0, dy = y - y0;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < AMBANG) return;
    dipakai = true;
    if (Math.abs(dx) > Math.abs(dy)) aksi(dx > 0 ? 'kanan' : 'kiri'); else aksi(dy < 0 ? 'lompat' : 'guling');
  };
  const selesai = (el) => {
    if (!aktif) return; aktif = false;
    // ketuk cepat tanpa geser = lompat (memudahkan anak)
    if (!dipakai && performance.now() - t0 < 250 && !lewati(el)) aksi('lompat');
  };
  // sentuh: pakai touch events (paling andal di iOS/Android); mouse: pointer events
  window.addEventListener('touchstart', (e) => { const t = e.changedTouches[0]; mulai(t.clientX, t.clientY, e.target); }, { passive: true });
  window.addEventListener('touchmove', (e) => { const t = e.changedTouches[0]; gerak(t.clientX, t.clientY); }, { passive: true });
  window.addEventListener('touchend', (e) => selesai(e.target), { passive: true });
  window.addEventListener('touchcancel', () => { aktif = false; });
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') mulai(e.clientX, e.clientY, e.target); });
  window.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') gerak(e.clientX, e.clientY); });
  window.addEventListener('pointerup', (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') selesai(e.target); });
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    const peta = { arrowleft: 'kiri', a: 'kiri', arrowright: 'kanan', d: 'kanan', arrowup: 'lompat', w: 'lompat', ' ': 'lompat', arrowdown: 'guling', s: 'guling', e: 'kilat', shift: 'kilat', escape: 'jeda', p: 'jeda', '1': 'p1', '2': 'p2', '3': 'p3' };
    const a = peta[k];
    if (!a) return;
    if (k === ' ' && document.activeElement && document.activeElement.tagName === 'BUTTON') return;
    if (aksi(a, e.repeat)) e.preventDefault();
  });
}
