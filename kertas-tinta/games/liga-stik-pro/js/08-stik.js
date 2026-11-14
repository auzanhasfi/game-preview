'use strict';
// Pemain stickman berwarna: badan & celana warna jersey, kaos kaki, kepala berwarna kulit, anggota badan garis tinta.
// Pose: lari (siklus langkah), tendang, sliding, kiper melompat, jatuh, selebrasi, memegang bola, lemparan ke dalam.
(function () {
  const TINTA = '#121826', o = {}, o2 = {};
  G.gambarStik = function (ctx, p, t) {
    const f = G.proj(p.x, p.y, 0, o); if (!f.ok) return;
    const S = f.s * .95;
    p.sx = f.x; p.sy = f.y; p.sS = S;
    if (f.x < -60 || f.x > G.kam.W + 60 || f.y < -40 || f.y > G.kam.H + 220) return;
    G.proj(p.x + Math.cos(p.arah), p.y + Math.sin(p.arah), 0, o2);
    const dx = (o2.x - f.x) / f.s; let fs = dx >= 0 ? 1 : -1; const sisi = G.clamp(Math.abs(dx) * 1.2, 0, 1);
    // bayangan
    ctx.fillStyle = 'rgba(6,20,10,.32)'; ctx.beginPath(); ctx.ellipse(f.x, f.y, S * .42, S * .14, 0, 0, 7); ctx.fill();
    const kec = Math.hypot(p.vx, p.vy), lari = G.clamp(kec / 7.5, 0, 1), amp = .3 + .7 * sisi, ph = p.ph;
    let rot = 0, piv = .9, angkat = 0, bob = Math.abs(Math.sin(ph)) * .045 * lari, condong = .12 * lari;
    const kaki = [], tangan = [];
    for (let i = 0; i < 2; i++) {
      const s = Math.sin(ph + i * Math.PI), c = Math.cos(ph + i * Math.PI);
      const a = lari > .05 ? s * .62 * lari * amp : (i ? -.07 : .07);
      const b = a - lari * amp * (.15 + .7 * Math.max(0, -c));
      kaki.push([a, b]);
      const ta = lari > .05 ? -s * .75 * lari * amp : (i ? -.12 : .12);
      tangan.push([ta, ta + .35 + .4 * lari]);
    }
    if (p.kickT > 0) { kaki[0] = [1.15, 1.05]; kaki[1] = [-.2, -.35]; tangan[0] = [-.9, -.5]; tangan[1] = [.9, 1.3]; condong = -.05; }
    if (p.tekelT > 0) { kaki[0] = [.95, .9]; kaki[1] = [-.3, -.6]; condong = .25; }
    if (p.slideT > 0) { rot = -1.1; piv = .15; kaki[0] = [1.5, 1.5]; kaki[1] = [.9, .25]; tangan[0] = [-2.3, -2]; tangan[1] = [-1.4, -1]; condong = 0; bob = 0; }
    if (p.diveT > 0) {
      fs = p.diveFs || fs; const pr = G.clamp(1 - p.diveT / .75, 0, 1);
      rot = 1.4 * G.clamp(pr * 3, 0, 1); piv = .6; angkat = Math.sin(Math.min(1, pr * 1.6) * Math.PI) * .45;
      kaki[0] = [-.15, -.2]; kaki[1] = [.12, .05]; tangan[0] = [Math.PI - .25, Math.PI - .2]; tangan[1] = [Math.PI - .5, Math.PI - .45]; condong = 0; bob = 0;
    }
    if (p.jatuhT > 0) { rot = (p.jatuhArah || 1) * 1.45; piv = .1; kaki[0] = [.3, .1]; kaki[1] = [-.1, -.3]; tangan[0] = [1.6, 2]; tangan[1] = [.6, 1]; condong = 0; bob = 0; }
    if (p.rayaT > 0) { const w = Math.sin(t * 11) * .25; tangan[0] = [Math.PI - .45 + w, Math.PI - .3 + w]; tangan[1] = [-Math.PI + .45 - w, -Math.PI + .3 - w]; }
    if (p.pegang) { tangan[0] = [1.25, 1.6]; tangan[1] = [1.05, 1.45]; }
    if (p.lempar) { tangan[0] = [Math.PI - .15, Math.PI - .1]; tangan[1] = [Math.PI - .25, Math.PI - .2]; }
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const T = (u, v) => { const vv = v - piv; const uu = u * cr + vv * sr, vr = -u * sr + vv * cr + piv; return [f.x + fs * uu * S, f.y - (vr + angkat) * S]; };
    const pinggul = [0, .92 + bob], leher = [condong, 1.47 + bob], bahu = [condong * .9, 1.4 + bob];
    const sendi = (pang, ang, len) => [pang[0] + Math.sin(ang) * len, pang[1] - Math.cos(ang) * len];
    const kit = p.kit, lw = Math.max(1.2, S * .085);
    const garis = (a, b, w, c) => { const A = T(a[0], a[1]), B = T(b[0], b[1]); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); };
    const titikAntara = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const satuKaki = (i) => {
      const lutut = sendi(pinggul, kaki[i][0], .46), tumit = sendi(lutut, kaki[i][1], .46);
      garis(pinggul, lutut, lw, TINTA); garis(lutut, tumit, lw, TINTA);
      garis(titikAntara(lutut, tumit, .35), tumit, lw * 1.25, kit.kaos);
      garis(tumit, [tumit[0] + .09, tumit[1]], lw * 1.3, TINTA);
      garis(pinggul, titikAntara(pinggul, lutut, .42), Math.max(2, S * .19), kit.celana);
    };
    const satuTangan = (i) => {
      const siku = sendi(bahu, tangan[i][0], .29), jari = sendi(siku, tangan[i][1], .27);
      garis(bahu, siku, lw, TINTA); garis(siku, jari, lw, TINTA);
      garis(bahu, titikAntara(bahu, siku, .45), Math.max(1.6, S * .11), kit.pola === 'lengan' ? kit.baju2 : kit.baju);
      if (p.pos === 'GK') { const J = T(jari[0], jari[1]); ctx.fillStyle = kit.baju2; ctx.beginPath(); ctx.arc(J[0], J[1], Math.max(1.2, S * .055), 0, 7); ctx.fill(); }
    };
    satuKaki(1); satuTangan(1);
    // badan
    const bw = Math.max(3, S * .3), bawah = [pinggul[0], pinggul[1] + .06];
    garis(bawah, leher, bw, kit.baju);
    if (kit.pola === 'garis' || kit.pola === 'tengah') {
      const A = T(bawah[0], bawah[1] + .04), B = T(leher[0], leher[1] - .04);
      const nx = -(B[1] - A[1]), ny = B[0] - A[0], nl = Math.hypot(nx, ny) || 1;
      ctx.strokeStyle = kit.baju2; ctx.lineWidth = Math.max(1, S * (kit.pola === 'garis' ? .06 : .08));
      const offs = kit.pola === 'garis' ? [-.075, .075] : [0];
      ctx.beginPath(); for (const k of offs) { const ox = nx / nl * k * S, oy = ny / nl * k * S; ctx.moveTo(A[0] + ox, A[1] + oy); ctx.lineTo(B[0] + ox, B[1] + oy); } ctx.stroke();
    }
    satuKaki(0); satuTangan(0);
    // kepala
    const kp = T(leher[0] + .03, leher[1] + .2), kr = Math.max(2.2, S * .15);
    ctx.fillStyle = p.kulit; ctx.strokeStyle = TINTA; ctx.lineWidth = Math.max(1, S * .03);
    ctx.beginPath(); ctx.arc(kp[0], kp[1], kr, 0, 7); ctx.fill(); ctx.stroke();
    if (p.rambut && rot === 0) { ctx.fillStyle = p.rambut; ctx.beginPath(); ctx.arc(kp[0], kp[1], kr, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); ctx.fill(); }
    p.kepalaY = kp[1] - kr;
  };
  // pratinjau stickman (menu pilih tim) pada kanvas kecil
  G.pratinjauStik = function (cv, kit, kulit = '#e0b08a', rambut = '#1f1a17') {
    const c = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || 72, h = cv.clientHeight || 96;
    cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    const S = h / 2.15, x0 = w / 2, y0 = h - 6, TI = TINTA; c.lineCap = 'round';
    const L = (a, b, wd, col) => { c.strokeStyle = col; c.lineWidth = wd; c.beginPath(); c.moveTo(x0 + a[0] * S, y0 - a[1] * S); c.lineTo(x0 + b[0] * S, y0 - b[1] * S); c.stroke(); };
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x0, y0, S * .4, S * .1, 0, 0, 7); c.fill();
    for (const s of [-1, 1]) { L([0, .92], [s * .18, .48], S * .085, TI); L([s * .18, .48], [s * .22, .02], S * .085, TI); L([s * .2, .3], [s * .22, .03], S * .1, kit.kaos); L([0, .92], [s * .09, .72], S * .19, kit.celana); }
    for (const s of [-1, 1]) { L([0, 1.4], [s * .26, 1.18], S * .085, TI); L([s * .26, 1.18], [s * .34, .93], S * .085, TI); L([0, 1.4], [s * .14, 1.29], S * .11, kit.pola === 'lengan' ? kit.baju2 : kit.baju); }
    L([0, .98], [0, 1.47], S * .3, kit.baju);
    if (kit.pola === 'garis') { L([-.075, 1.02], [-.075, 1.43], S * .06, kit.baju2); L([.075, 1.02], [.075, 1.43], S * .06, kit.baju2); }
    if (kit.pola === 'tengah') L([0, 1.02], [0, 1.43], S * .08, kit.baju2);
    c.fillStyle = kulit; c.strokeStyle = TI; c.lineWidth = S * .03; c.beginPath(); c.arc(x0, y0 - 1.67 * S, S * .15, 0, 7); c.fill(); c.stroke();
    c.fillStyle = rambut; c.beginPath(); c.arc(x0, y0 - 1.67 * S, S * .15, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill();
  };
})();
