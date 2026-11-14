'use strict';
// Masukan: papan ketik (WASD/panah + J K L I, Shift, Q), sentuh (joystik dinamis + 5 tombol), gamepad standar.
(function () {
  const I = G.inp = { x: 0, y: 0, tahan: {}, tekan: new Set(), lepas: new Set(), sentuh: false, uji: null };
  const KUNCI = { KeyJ: 'umpan', KeyZ: 'umpan', KeyK: 'tembak', KeyX: 'tembak', Space: 'tembak', KeyL: 'terobos', KeyC: 'terobos', KeyI: 'lambung', KeyV: 'lambung',
    ShiftLeft: 'lari', ShiftRight: 'lari', KeyQ: 'ganti', Escape: 'jeda', KeyP: 'jeda' };
  const ARAH = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
  const arah = {};
  const tekan = n => { if (!I.tahan[n]) I.tekan.add(n); I.tahan[n] = true; };
  const lepas = n => { if (I.tahan[n]) I.lepas.add(n); I.tahan[n] = false; };
  addEventListener('keydown', e => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (ARAH[e.code]) { arah[ARAH[e.code]] = true; if (G.keadaan === 'main') e.preventDefault(); }
    const n = KUNCI[e.code]; if (n) { if (e.repeat) return; tekan(n); if (G.keadaan === 'main') e.preventDefault(); }
    if (/^Digit[1-4]$/.test(e.code)) G.layar.tombolAngka(+e.code.slice(5));
    G.bunyi.buka();
  });
  addEventListener('keyup', e => { if (ARAH[e.code]) arah[ARAH[e.code]] = false; const n = KUNCI[e.code]; if (n) lepas(n); });
  addEventListener('blur', () => { for (const k in arah) arah[k] = false; for (const n in I.tahan) lepas(n); });
  // sentuh: joystik
  let joy = null; const jz = () => G.$('#joyZona'), jd = () => G.$('#joyDasar'), jk = () => G.$('#joyKnob');
  function pasangSentuh() {
    const z = jz();
    z.addEventListener('pointerdown', e => {
      e.preventDefault(); G.bunyi.buka(); z.setPointerCapture(e.pointerId);
      const r = z.getBoundingClientRect(); joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: 0, y: 0 };
      const d = jd(); d.style.left = (e.clientX - r.left) + 'px'; d.style.top = (e.clientY - r.top) + 'px'; d.classList.add('aktif');
    });
    z.addEventListener('pointermove', e => {
      if (!joy || e.pointerId !== joy.id) return;
      let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const m = Math.hypot(dx, dy), R = 50;
      if (m > R) { dx = dx / m * R; dy = dy / m * R; }
      joy.x = dx / R; joy.y = dy / R; jk().style.transform = `translate(${dx}px,${dy}px)`;
    });
    const akhir = e => { if (!joy || e.pointerId !== joy.id) return; joy = null; jk().style.transform = ''; jd().classList.remove('aktif'); };
    z.addEventListener('pointerup', akhir); z.addEventListener('pointercancel', akhir);
    for (const b of document.querySelectorAll('#tombolSentuh .tb')) {
      const n = b.dataset.k;
      b.addEventListener('pointerdown', e => { e.preventDefault(); G.bunyi.buka(); b.setPointerCapture(e.pointerId); b.classList.add('on'); tekan(n === 'terobos' && I.labelBertahan ? 'terobos' : n); });
      const up = () => { b.classList.remove('on'); lepas(n); };
      b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    }
  }
  I.pasang = pasangSentuh;
  I.adaSentuh = () => matchMedia('(pointer: coarse)').matches || G.param.has('sentuh') || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
  // gamepad
  const PAD = { 0: 'umpan', 2: 'tembak', 3: 'terobos', 1: 'lambung', 5: 'lari', 7: 'lari', 4: 'ganti', 9: 'jeda' };
  const padLalu = {};
  I.poll = function () {
    let x = (arah.r ? 1 : 0) - (arah.l ? 1 : 0), y = (arah.d ? 1 : 0) - (arah.u ? 1 : 0);
    const m = Math.hypot(x, y); if (m > 0) { x /= m; y /= m; }
    if (joy) { x = joy.x; y = joy.y; }
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const p = pads && [...pads].find(Boolean);
    if (p) {
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0; if (Math.hypot(ax, ay) > .2) { x = ax; y = ay; }
      if (p.buttons[12] && p.buttons[12].pressed) y = -1; if (p.buttons[13] && p.buttons[13].pressed) y = 1; if (p.buttons[14] && p.buttons[14].pressed) x = -1; if (p.buttons[15] && p.buttons[15].pressed) x = 1;
      for (const k in PAD) { const on = !!(p.buttons[k] && p.buttons[k].pressed); if (on && !padLalu[k]) tekan(PAD[k]); if (!on && padLalu[k]) lepas(PAD[k]); padLalu[k] = on; }
    }
    if (I.uji) { x = I.uji.x; y = I.uji.y; }
    I.x = x; I.y = y;
  };
  I.habis = function () { I.tekan.clear(); I.lepas.clear(); };
  // untuk ujian otomatis
  I.tekanUji = n => tekan(n); I.lepasUji = n => lepas(n);
  // label tombol sentuh mengikuti keadaan (menyerang / bertahan / penalti)
  let labelLalu = '';
  I.labelSentuh = function (M) {
    if (!M) return;
    let mode = 'serang';
    if (M.fase === 'penalti') mode = M.pen && M.pen.userJaga ? 'jaga' : 'pen';
    else if (M.fase === 'main' && M.ctrl && M.bola.pemilik !== M.ctrl && !(M.bola.tujuan === M.ctrl && !M.bola.pemilik)) mode = 'tahan';
    const sup = M.superSiap ? '1' : '0';
    if (mode + sup + G.bahasa === labelLalu) return; labelLalu = mode + sup + G.bahasa;
    I.labelBertahan = mode === 'tahan';
    const t = G.t, L = {
      serang: { umpan: t('k_umpan'), tembak: t('k_tembak'), terobos: t('k_terobos'), lambung: t('k_lambung'), lari: t('k_lari') },
      tahan: { umpan: t('k_tekan'), tembak: t('k_sliding'), terobos: t('k_ganti'), lambung: t('k_lambung'), lari: t('k_lari') },
      pen: { umpan: t('k_tembak'), tembak: t('k_tembak'), terobos: '—', lambung: '—', lari: '—' },
      jaga: { umpan: t('k_lompat'), tembak: t('k_lompat'), terobos: '—', lambung: '—', lari: '—' }
    }[mode];
    for (const b of document.querySelectorAll('#tombolSentuh .tb')) { b.textContent = L[b.dataset.k]; b.style.visibility = L[b.dataset.k] === '—' ? 'hidden' : ''; }
    G.$('.tb-tembak').classList.toggle('super', M.superSiap && mode === 'serang');
  };
})();
