'use strict';
// Gelung utama, ukuran kanvas, mulai/keluar laga, kait ujian (window.__game).
(function () {
  const cv = G.$('#kanvas'), ctx = cv.getContext('2d');
  let dpr = 1, last = performance.now(), t = 0, labelT = 0;
  G.skalaWaktu = +(G.param.get('cepat') || 1);
  function ukur() {
    dpr = Math.min(2, window.devicePixelRatio || 1); const W = innerWidth, H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    G.kamUkuran(W, H); G.kamHitung();
    G.$('#putar').hidden = !(G.keadaan === 'main' && G.inp.sentuh && H > W && !G.putarDitutup);
  }
  addEventListener('resize', ukur); addEventListener('orientationchange', () => setTimeout(ukur, 200));
  G.inp.sentuh = G.inp.adaSentuh(); G.inp.pasang();
  G.$('#btnJeda').innerHTML = G.ikon('jeda'); G.$('#btnJeda').onclick = () => G.layar.jeda();
  G.$('#putar').innerHTML = `${G.ikon('putar')}<span></span><button class="btn-ikon" aria-label="tutup">${G.ikon('silang')}</button>`;
  G.$('#putar button').onclick = () => { G.putarDitutup = true; G.$('#putar').hidden = true; };
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.keadaan === 'main') G.layar.jeda(); });

  G.Mdemo = G.Laga.buat({ kandang: 'mci', tandang: 'mun', menit: 30, mode: 'demo' });
  G.M = null; G.keadaan = 'menu'; G.jeda = false;
  G.mulaiLaga = function (mode) {
    const s = G.set, o = { kandang: s.kandang, tandang: s.tandang, menit: s.menit, ai: s.ai, soal: s.soal, frek: s.frek, mode };
    G.hud.bersih(); G.$('#modalSoal').hidden = true; G.$('#modalJeda').hidden = true; G.jeda = false;
    G.M = mode === 'adu' ? G.Pen.buatAdu(o) : G.Laga.buat(o);
    if (mode !== 'adu') G.kamLompat({ lx: G.L / 2, ly: 34, lz: 0, yaw: -Math.PI / 2, pitch: .4, dist: 70, lebar: G.kam.W >= G.kam.H ? (G.kam.H < 520 ? 27 : 38) : 18, cy: .55 });
    G.layar.tampil(null); G.keadaan = 'main'; G.bunyi.buka();
    G.$('#putar span').textContent = G.t('putar'); ukur();
    if (mode !== 'adu') G.hud.pesan(G.M.klub[0].k + '  vs  ' + G.M.klub[1].k, 1.8, 'besar');
  };
  G.keMenu = function () { G.M = null; G.hud.bersih(); G.layar.menu(); G.lapangan.siapkan(G.Mdemo.kit[0].baju, G.Mdemo.kit[1].baju); ukur(); };

  function loop(now) {
    let dt = Math.min(.05, (now - last) / 1000); last = now; dt *= G.skalaWaktu; t += dt;
    const M = G.M || G.Mdemo;
    G.inp.poll();
    if (G.keadaan === 'main' && G.inp.tekan.has('jeda')) { G.inp.habis(); if (G.jeda) { G.$('#modalJeda').hidden = true; G.jeda = false; } else G.layar.jeda(); }
    if (!G.jeda) { const n = Math.max(1, Math.ceil(dt / (1 / 60) - .01)); for (let i = 0; i < n; i++) { G.Laga.langkah(M, dt / n); if (i === 0) G.inp.habis(); } }
    else G.inp.habis();
    G.Laga.kamera(M, dt);
    G.Laga.gambar(ctx, M, t);
    if (G.M && G.keadaan === 'main') G.hud.gambar(ctx, M, t, dt);
    labelT -= dt; if (labelT <= 0 && G.M && G.inp.sentuh) { labelT = .15; G.inp.labelSentuh(G.M); }
    requestAnimationFrame(loop);
  }
  ukur(); G.layar.menu();
  // kait ujian
  window.__game = {
    get keadaan() { return G.keadaan; }, get M() { return G.M; },
    jawabUji: b => G.layar.jawabUji(b), adaSoal: () => G.layar.adaSoal(),
    tekan: n => G.inp.tekanUji(n), lepas: n => G.inp.lepasUji(n), stik: (x, y) => { G.inp.uji = x == null ? null : { x, y }; },
    langkah: (n = 60, dt = 1 / 60) => { const M = G.M || G.Mdemo; for (let i = 0; i < n; i++) { G.inp.poll(); G.Laga.langkah(M, dt); G.inp.habis(); } G.Laga.kamera(M, 1); G.Laga.gambar(ctx, M, t); if (G.M) G.hud.gambar(ctx, M, t, n * dt); },
    info: () => { const M = G.M || G.Mdemo; return { fase: M.fase, skor: M.skor.slice(), waktu: +M.waktu.toFixed(1), babak: M.babak, stat: JSON.parse(JSON.stringify(M.stat)), soal: { ...M.soal, jadwal: undefined }, ctrl: M.ctrl && M.ctrl.nama, pemilik: M.bola.pemilik && M.bola.pemilik.nama }; },
    mulai: (mode = 'laga', o = {}) => { Object.assign(G.set, o); G.mulaiLaga(mode); },
    lompatWaktu: s => { if (G.M) G.M.waktu += s; }
  };
  if (G.param.get('mulai')) G.mulaiLaga(G.param.get('mulai'));
  requestAnimationFrame(loop);
})();
