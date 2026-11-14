'use strict';
// Penalti: dipakai di dalam laga (pelanggaran di kotak) dan mode Adu Penalti. Kamera dari belakang titik penalti.
// Soal dulu: benar → saat menendang kiper lawan lebih sering salah tebak; saat menjaga, arah tendangan lawan diberi petunjuk.
(function () {
  const L = G.L, W = G.W, Pen = G.Pen = {};
  const ARAH = [-.85, -.5, 0, .5, .85];
  Pen.mulai = function (M, cfg) {
    const tim = cfg.tim, ar = M.tim[tim].arah, gx = G.gxLawan(M, tim), spotX = gx - ar * 11;
    const a = cfg.penembak, k = M.tim[1 - tim].pemain[0];
    const P = M.pen = { tim, a, k, gx, ar, spotX, fase: 'bidik', t: 0, aimX: 0, aimZ: .45, kuat: 0, isi: false, bonus: null,
      userTendang: M.manusia && tim === 0, userJaga: M.manusia && tim === 1, tebakX: 0, tebakZ: 0, cek: false, hasil: null, selesai: cfg.selesai,
      aiAimX: G.pilih(ARAH), aiAimZ: G.rnd(.1, .85) };
    M.fase = 'penalti'; M.faseT = 0;
    const b = M.bola; Object.assign(b, { x: spotX, y: 34, z: 0, vx: 0, vy: 0, vz: 0, pemilik: null, diJaring: false, putusan: null, tujuan: null, super: false, jenis: 'diam', last: a, lastTim: tim }); b.jejak.length = 0;
    for (const p of M.pemain) { p.vx = p.vy = 0; p.diveT = 0; p.jatuhT = 0; p.slideT = 0; p.pegang = false; p.rayaT = 0; p.lempar = false; p.mau = 0; }
    let n = 0;
    for (const p of M.pemain) {
      if (p === a || p === k) continue;
      if (cfg.adu) { const s = p.tim === tim ? -1 : 1; p.x = L / 2 + (p.i - 5) * 1.25 * (p.pos === 'GK' ? 0 : 1) + (p.pos === 'GK' ? s * 8 : 0); p.y = 34 + s * 1.2 + (p.pos === 'GK' ? 0 : 0); if (p.pos === 'GK') p.y = 34 + s * 6; }
      else { const sdt = -1.2 + (n++ / 19) * 2.4; p.x = gx - ar * (20.5 + Math.abs(sdt) * 2) ; p.y = 34 + Math.sin(sdt) * 17; }
      p.tx = p.x; p.ty = p.y; p.arah = Math.atan2(34 - p.y, gx - p.x);
    }
    a.x = spotX - ar * 2.8; a.y = 34 - ar * 1.1; a.tx = a.x; a.ty = a.y; a.arah = ar > 0 ? 0 : Math.PI;
    k.x = gx - ar * .25; k.y = 34; k.tx = k.x; k.ty = k.y; k.arah = ar > 0 ? Math.PI : 0;
    G.kamLompat({ lx: gx, ly: 34, lz: 1.1, yaw: ar > 0 ? 0 : Math.PI, pitch: .13, dist: 26, lebar: G.kam.W >= G.kam.H ? 24 : 17, cy: .52 });
    if (cfg.soal && M.manusia && M.o.frek !== 'mati') {
      P.fase = 'soal';
      G.layar.soal({ judul: P.userTendang ? G.t('soalPenTendang') : G.t('soalPenJaga'), hadiah: P.userTendang ? G.t('hadiahPenTendang') : G.t('hadiahPenJaga'), level: M.o.soal, nama: a.nama }, benar => {
        M.soal.total++; if (benar) M.soal.benar++; P.bonus = benar; P.fase = 'bidik'; P.t = 0;
      });
    }
  };
  Pen.dalamLaga = function (M, tim) {
    const kandidat = M.tim[tim].pemain.slice(1).sort((x, y) => y.st.sht - x.st.sht)[0];
    G.hud.label(G.t('penaltiUntuk') + ' ' + M.klub[tim].k + ' · ' + kandidat.nama);
    Pen.mulai(M, { tim, penembak: kandidat, soal: true, selesai: h => {
      const P = M.pen; M.pen = null; M.fase = 'main'; M.faseT = 0;
      if (h === 'gol') { M.bola.last = P.a; M.bola.lastTim = tim; M.bola.jenis = 'tembak'; M.bola.tembakTim = tim; M.bola.tembakDihitung = false; G.Laga.cetakGol(M, tim); }
      else if (h === 'selamat') { M.stat.tepat[tim]++; const b = M.bola; b.x = P.k.x; b.y = P.k.y; G.Bola.kuasai(M, P.k); P.k.pegang = true; P.k.pegangT = 0; }
      else G.Laga.restart(M, 'gawang', 1 - tim, P.gx, 30);
    } });
    M.stat.tembak[tim]++;
  };
  function tendang(M) {
    const P = M.pen, b = M.bola, a = P.a, k = P.k, I = G.inp;
    if (P.userJaga) { P.tebakX = Math.abs(I.x) < .3 ? 0 : Math.sign(I.x) * .75; P.tebakZ = I.y < -.4 ? 1 : 0; if (P.pilih != null) { P.tebakX = P.pilih; } }
    else {
      const sisiA = Math.sign(P.aimX) || 0;
      let benarTebak = P.bonus === true ? .22 : P.bonus === false ? .58 : .42;
      if (M.mode === 'adu' && !M.manusia) benarTebak = .4;
      if (Math.random() < benarTebak) P.tebakX = sisiA * .75 + G.rnd(-.1, .1);
      else { const pil = [-.75, 0, .75].filter(v => Math.sign(v) !== sisiA); P.tebakX = G.pilih(pil); }
      P.tebakZ = P.aimZ > .65 && Math.random() < .5 ? 1 : 0;
    }
    const ry = G.kam.ry > 0 ? 1 : -1;
    const e = (1 - a.st.sht / 100) * .9 + Math.max(0, P.kuat - .88) * 4;
    const ty = 34 + P.aimX * 3.35 * ry + G.randn() * e * .55;
    const tz = Math.max(.1, P.aimZ * 2.1 + .12 + Math.abs(G.randn()) * e * .35 + Math.max(0, P.kuat - .9) * 6);
    const v = 18 + P.kuat * 12, dx = P.gx - b.x, dy = ty - b.y, dh = Math.hypot(dx, dy), tt = dh / v;
    b.vx = v * dx / dh; b.vy = v * dy / dh; b.vz = (tz + 4.905 * tt * tt) / tt;
    a.kickT = .25; G.bunyi.tendang(P.kuat);
    k.diveT = .75; k.diveY = 34 + P.tebakX * 3.0 * ry; const s = G.proj(k.x, k.diveY, 0, {}), s0 = G.proj(k.x, k.y, 0, {}); k.diveFs = Math.abs(s.x - s0.x) < 2 ? 1 : (s.x > s0.x ? 1 : -1);
    if (P.tebakX === 0) { k.diveT = .45; k.diveY = 34; }
    P.fase = 'terbang'; P.t = 0;
  }
  function akhir(M, h) {
    const P = M.pen; P.hasil = h; P.fase = 'hasil'; P.t = 0;
    if (h === 'gol') { G.bunyi.jaring(); G.bunyi.gol(); M.semangat = 1; P.a.rayaT = 2; }
    else G.bunyi.tiang();
    G.hud.pesan(G.t('pen_' + h), 1.5, h === 'gol' ? 'gol' : 'besar');
  }
  Pen.langkah = function (M, dt) {
    const P = M.pen; if (!P) return; P.t += dt;
    const I = G.inp, b = M.bola, a = P.a, k = P.k;
    if (P.fase === 'soal') return;
    if (P.fase === 'bidik') {
      if (P.userTendang) {
        P.aimX = G.clamp(P.aimX + I.x * dt * 1.6, -1, 1); P.aimZ = G.clamp(P.aimZ - I.y * dt * 1.3, 0, 1);
        if (!P.isi && (I.tekan.has('tembak') || I.tekan.has('umpan'))) { P.isi = true; P.kuat = 0; }
        if (P.isi) { P.kuat = Math.min(1, P.kuat + dt * 1.1); if (!I.tahan.tembak && !I.tahan.umpan) { P.fase = 'ancang'; P.t = 0; } }
        if (P.t > 10 && !P.isi) { P.kuat = .7; P.fase = 'ancang'; P.t = 0; }
      } else {
        if (P.userJaga) { if (I.tekan.has('tembak') || I.tekan.has('umpan')) P.pilih = Math.abs(I.x) < .3 ? 0 : Math.sign(I.x) * .75; }
        const tunggu = P.userJaga ? (P.bonus ? 3 : 2.1) : 1.3;
        if (P.t > tunggu) { P.kuat = G.rnd(.55, .86); P.aimX = P.aiAimX; P.aimZ = P.aiAimZ; P.fase = 'ancang'; P.t = 0; }
      }
      return;
    }
    if (P.fase === 'ancang') {
      a.tx = P.spotX - P.ar * .55; a.ty = 34 - P.ar * .25; a.mau = 5.5;
      if (P.t > .55 || Math.hypot(a.x - a.tx, a.y - a.ty) < .2) tendang(M);
      return;
    }
    if (P.fase === 'terbang') {
      const px = b.x;
      b.vz -= 9.81 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.rot += Math.hypot(b.vx, b.vy) * dt / .11;
      if (b.z < 0) { b.z = 0; b.vz = -b.vz * .45; }
      if (k.diveT > 0) { k.diveT -= dt; k.y += (k.diveY - k.y) * Math.min(1, dt * 8); if (k.diveT <= 0) k.jatuhT = .4; }
      if (!P.cek && Math.abs(b.x - k.x) < .55) {
        P.cek = true;
        const jy = Math.abs(b.y - k.y), jz = P.tebakZ ? 2.5 : 1.75, pojok = Math.abs(b.y - 34) > 3.05 && b.z > 1.75;
        if (jy < (P.tebakX === 0 ? .95 : 1.25) && b.z < jz && !pojok) {
          b.vx = -b.vx * .3; b.vy = G.rnd(-6, 6); b.vz = 3; akhir(M, 'selamat'); return;
        }
      }
      const lewat = P.ar > 0 ? (px <= L && b.x > L) : (px >= 0 && b.x < 0);
      if (lewat) {
        const rel = Math.abs(b.y - 34);
        if (rel < 3.66 - G.R && b.z < 2.44 - G.R) { b.diJaring = true; akhir(M, 'gol'); }
        else if (rel < 3.66 + G.R + .05 && b.z < 2.44 + G.R + .05) { b.vx = -b.vx * .5; akhir(M, 'tiang'); }
        else akhir(M, 'meleset');
        return;
      }
      if (P.t > 2) akhir(M, 'meleset');
      return;
    }
    if (P.fase === 'hasil') {
      b.vz -= 9.81 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; if (b.z < 0) { b.z = 0; b.vz = -b.vz * .4; b.vx *= .7; b.vy *= .7; }
      if (b.diJaring) { const back = P.ar > 0 ? L + 1.9 : -1.9; if ((P.ar > 0 && b.x > back) || (P.ar < 0 && b.x < back)) { b.x = back; b.vx = 0; } b.z = Math.min(b.z, 2.2); }
      if (k.diveT > 0) { k.diveT -= dt; k.y += (k.diveY - k.y) * Math.min(1, dt * 8); }
      if (P.t > 1.8) { const f = P.selesai; f(P.hasil); }
    }
  };
  Pen.kamera = function (M, dt) {
    const P = M.pen; if (!P) return;
    G.kamIkut({ lx: P.gx, ly: 34, lz: 1.1, yaw: P.ar > 0 ? 0 : Math.PI, pitch: .13, dist: 26, lebar: G.kam.W >= G.kam.H ? 24 : 17, cy: .52 }, dt, 6);
  };
  // ---------- mode Adu Penalti ----------
  Pen.buatAdu = function (o) {
    const M = G.Laga.buat({ ...o, mode: 'adu' });
    M.adu = { hasil: [[], []], giliran: 0, urutan: [0, 1].map(t => M.tim[t].pemain.slice(1).sort((x, y) => y.st.sht - x.st.sht)), selesai: false };
    G.kamLompat({ lx: L, ly: 34, lz: 1.1, yaw: 0, pitch: .13, dist: 26, lebar: 24, cy: .52 });
    berikut(M);
    return M;
  };
  function berikut(M) {
    const A = M.adu, g = A.giliran;
    M.tim[g].arah = 1; M.tim[1 - g].arah = -1;
    const pen = A.urutan[g][A.hasil[g].length % 10];
    Pen.mulai(M, { tim: g, penembak: pen, soal: true, adu: true, selesai: h => {
      A.hasil[g].push(h === 'gol'); if (h === 'gol') M.skor[g]++;
      const [h0, h1] = A.hasil, g0 = h0.filter(Boolean).length, g1 = h1.filter(Boolean).length, n0 = h0.length, n1 = h1.length;
      let tamat = false;
      if (n0 <= 5 && n1 <= 5) { if (g0 + (5 - n0) < g1 || g1 + (5 - n1) < g0) tamat = true; if (n0 === 5 && n1 === 5 && g0 !== g1) tamat = true; }
      else if (n0 === n1 && g0 !== g1) tamat = true;
      if (n0 >= 10 && n1 >= 10) tamat = true;
      if (tamat) { M.pen = null; M.fase = 'tamat'; A.selesai = true; G.bunyi.peluit(3); setTimeout(() => G.layar.hasil(M), 600); return; }
      A.giliran = 1 - g; berikut(M);
    } });
  }
})();
