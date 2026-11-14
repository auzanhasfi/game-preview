'use strict';
// AI tim: bentuk formasi bergeser mengikuti bola, dua penekan saat bertahan, lari ke depan saat menyerang,
// keputusan pembawa bola (tembak / umpan / giring), dan kiper (posisi, keluar, menepis).
(function () {
  const L = G.L, W = G.W, AI = G.AI = {};
  AI.LEVEL = {
    mudah: { pikir: .5, kec: .9, tekel: .7, tembak: 1.3, kiper: -.12, slide: .01 },
    normal: { pikir: .34, kec: 1, tekel: .88, tembak: 1, kiper: 0, slide: .025 },
    sulit: { pikir: .18, kec: 1.06, tekel: 1.25, tembak: .85, kiper: .08, slide: .04 }
  };
  AI.vmax = (M, p) => (6.5 + p.st.spd / 100 * 2.6) * M.lvl[p.tim].kec * (M.boost[p.tim] > 0 ? 1.07 : 1) * (.84 + .16 * p.stamina);
  // posisi formasi (bingkai serang → dunia)
  AI.bentuk = function (M, p, menyerang, bx, by) {
    const ballA = G.keA(M, p.tim, bx), bay = by / W;
    let ax = p.home[0] + (ballA - .5) * .55 + (menyerang ? .08 : -.06);
    let ay = p.home[1] * .74 + bay * .26;
    if (p.pos === 'DF') { if (!menyerang) ax = Math.min(ax, ballA - .03); ax = G.clamp(ax, .07, .62); }
    if (p.pos === 'MF') ax = G.clamp(ax, .15, .8);
    if (p.pos === 'FW') { ax = G.clamp(ax, .38, .9); if (menyerang && ballA > .45) ax = Math.max(ax, Math.min(.88, ballA + .1 + (p.lariDepan > 0 ? .1 : 0))); }
    return [G.dariA(M, p.tim, G.clamp(ax, .03, .95)), G.clamp(ay, .05, .95) * W];
  };
  AI.pikir = function (M, dt) {
    for (const T of M.tim) { T.pikirT -= dt; if (T.pikirT <= 0) { T.pikirT = M.lvl[T.i].pikir * G.rnd(.8, 1.2); pikirTim(M, T); } }
  };
  function pikirTim(M, T) {
    const b = M.bola, pem = b.pemilik, pemT = pem ? pem.tim : -1, menyerang = pemT === T.i;
    const bx = pem ? pem.x : b.x + b.vx * .35, by = pem ? pem.y : b.y + b.vy * .35;
    // penekan saat bertahan / bola lepas
    let ch1 = null, ch2 = null;
    if (!menyerang) {
      const daftar = T.pemain.filter(p => p.pos !== 'GK' && p !== M.ctrl && p.jatuhT <= 0)
        .map(p => [p, Math.hypot(p.x - bx, p.y - by) / AI.vmax(M, p)]).sort((a, b) => a[1] - b[1]);
      ch1 = daftar[0] && daftar[0][0]; ch2 = daftar[1] && daftar[1][0];
      if (M.ctrl && M.ctrl.tim === T.i && Math.hypot(M.ctrl.x - bx, M.ctrl.y - by) < 9) { ch2 = ch1; ch1 = null; }
      if (b.tujuan && !pem && b.tujuan.tim === T.i) { ch1 = null; }
    }
    for (const p of T.pemain) {
      if (p === M.ctrl) continue;
      if (p.pos === 'GK') continue;
      p.lariDepan -= M.lvl[T.i].pikir;
      if (p === pem) { pembawa(M, p); continue; }
      const vm = AI.vmax(M, p);
      if (p.terima && !pem && b.tujuan === p) { const k = Math.hypot(b.x - p.x, b.y - p.y) < 7 ? 1 : 0; p.tx = k ? b.x + b.vx * .2 : b.tx; p.ty = k ? b.y + b.vy * .2 : b.ty; p.mau = vm; continue; }
      if (p === ch1) {
        p.tx = bx; p.ty = by; p.mau = vm;
        if (pem && pem.tim !== p.tim && !pem.pegang && Math.hypot(pem.x - p.x, pem.y - p.y) < 1.5 && p.tekelCd <= 0) {
          if (Math.random() < M.lvl[T.i].slide * 4 && G.keA(M, p.tim, pem.x) < .35) G.Laga.sliding(M, p, Math.atan2(pem.y - p.y, pem.x - p.x));
          else G.Bola.tekel(M, p, pem);
        }
        continue;
      }
      if (p === ch2) {
        const gx = G.gxSendiri(M, T.i), dx = gx - bx, dy = 34 - by, d = Math.hypot(dx, dy) || 1;
        p.tx = bx + dx / d * 5; p.ty = by + dy / d * 5; p.mau = vm * .9; continue;
      }
      if (menyerang && p.pos === 'FW' && p.lariDepan < -2 && Math.random() < .15) p.lariDepan = 2.2;
      const [tx, ty] = AI.bentuk(M, p, menyerang, bx, by);
      p.tx = tx; p.ty = ty; const jauh = Math.hypot(tx - p.x, ty - p.y); p.mau = jauh > 8 ? vm * .92 : vm * .62;
    }
  }
  function pembawa(M, p) {
    const T = M.tim[p.tim], lv = M.lvl[p.tim], gx = G.gxLawan(M, p.tim), dG = Math.hypot(gx - p.x, 34 - p.y);
    let tekan = 99, depan = 99;
    for (const o of M.tim[1 - p.tim].pemain) { const d = Math.hypot(o.x - p.x, o.y - p.y); tekan = Math.min(tekan, d); if ((o.x - p.x) * T.arah > 0 && Math.abs(o.y - p.y) < 6) depan = Math.min(depan, d); }
    const sud = Math.abs(p.y - 34) / Math.max(1, Math.abs(gx - p.x));
    if (dG < 27 && sud < 1.4) {
      let pr = dG < 12 ? .75 : dG < 18 ? .4 : .13; if (tekan < 1.6) pr += .15; if (dG > 20 && p.st.sht < 82) pr *= .4;
      if (Math.random() < pr) { aiTembak(M, p, tekan); return; }
    }
    const best = G.Bola.opsiUmpan(M, p);
    if (best && ((tekan < 2.6 && best.skor > .25) || (best.skor > 1.05 && Math.random() < .35) || (p.pos === 'DF' && tekan < 6 && best.skor > .45) || (depan < 4 && best.skor > .5))) {
      G.Bola.umpan(M, p, best.q, best.jenis); return;
    }
    // giring ke gawang sambil menghindar
    let dx = gx - p.x, dy = (34 - p.y) * .6; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    for (const o of M.tim[1 - p.tim].pemain) { const ox = p.x - o.x, oy = p.y - o.y, od = Math.hypot(ox, oy); if (od < 6 && od > .01) { const k = 2.6 / (od * od); dx += ox / od * k; dy += oy / od * k * 1.4; } }
    if (p.y < 4) dy += 1; if (p.y > W - 4) dy -= 1;
    const m = Math.hypot(dx, dy) || 1; p.tx = p.x + dx / m * 5; p.ty = p.y + dy / m * 5;
    p.lariAktif = depan > 5 && p.stamina > .25; p.mau = AI.vmax(M, p) * (p.lariAktif ? .95 : .7);
  }
  function aiTembak(M, p, tekan) {
    const gk = M.tim[1 - p.tim].pemain[0], sisi = gk.y > 34 ? -1 : 1;
    const aimY = 34 + sisi * G.rnd(1.2, 3.1), aimZ = G.rnd(.25, 1.9), kuat = G.rnd(.55, .9);
    G.Bola.tembak(M, p, aimY, aimZ, kuat, { akurasi: M.lvl[p.tim].tembak, tekanan: tekan < 1.6 ? 1 : 0 });
  }
  // ---------- kiper ----------
  AI.kiper = function (M, dt) {
    const b = M.bola;
    for (const T of M.tim) {
      const k = T.pemain[0], gx = G.gxSendiri(M, T.i), ar = T.arah;
      if (k.diveT > 0) { k.diveT -= dt; k.y += (k.diveY - k.y) * Math.min(1, dt * 9); k.vx = 0; k.vy = 0; if (k.diveT <= 0) k.jatuhT = .35; continue; }
      if (b.pemilik === k) {
        k.pegangT = (k.pegangT || 0) + dt; k.tx = gx + ar * Math.max(1.5, Math.abs(k.x - gx)); k.ty = k.y; k.mau = 2; k.arah = ar > 0 ? 0 : Math.PI;
        if (k.pegangT > 1.3 && (!M.ctrl || M.ctrl !== k || k.pegangT > 4)) distribusi(M, k);
        continue;
      }
      // tanggapi tembakan menuju gawang
      if (!b.pemilik && b.jenis === 'tembak' && b.tembakTim !== T.i && !b.putusan && (gx - b.x) * b.vx > 0) {
        const t = (gx - b.x) / b.vx;
        if (t > 0 && t < 1.25) {
          const py = b.y + b.vy * t, pz = b.z + b.vz * t - 4.905 * t * t;
          if (Math.abs(py - 34) < 3.95 && pz < 2.75) {
            const sp = Math.hypot(b.vx, b.vy), jangkau = Math.abs(py - k.y), dist = Math.abs(gx - b.x);
            let p = .9 * (k.st.def / 88) - (sp - 20) * .018 - jangkau * .075 - (b.super ? .5 : 0) + M.lvl[T.i].kiper + (dist > 22 ? .15 : 0);
            if (jangkau < .9) p += .22; if (pz > 2.1 && jangkau > 2.2) p -= .2;
            if (jangkau > 3.6) p = 0;
            const selamat = Math.random() < G.clamp(p, .04, .95);
            b.putusan = { k, selamat, py, pz };
            if (jangkau > .7) { k.diveT = .75; k.diveY = G.clamp(py, 34 - 3.4, 34 + 3.4) + (selamat ? 0 : (py > k.y ? -.6 : .6)); const s = G.proj(k.x, k.diveY, 0, {}), s0 = G.proj(k.x, k.y, 0, {}); k.diveFs = s.x >= s0.x ? 1 : -1; }
          }
        }
      }
      if (b.putusan && b.putusan.k === k && Math.abs(b.x - k.x) < .75 + Math.abs(b.vx) * dt) {
        const u = b.putusan; b.putusan = null;
        if (u.selamat) {
          if (!b.tembakDihitung) { M.stat.tepat[b.tembakTim]++; b.tembakDihitung = true; }
          const sp = Math.hypot(b.vx, b.vy);
          if (sp < 23 && Math.random() < .6) { b.x = k.x; b.y = k.diveT > 0 ? k.diveY : k.y; G.Bola.kuasai(M, k); k.pegang = true; k.pegangT = 0; G.hud.pesan(G.t('tangkap'), 1.2, 'kecil'); }
          else { b.vx = -b.vx * .28; b.vy = G.rnd(5, 10) * (Math.random() < .5 ? -1 : 1); b.vz = G.rnd(2, 4.5); b.last = k; b.lastTim = k.tim; b.jenis = 'pantul'; k.kickCd = .5; G.bunyi.tiang(); G.hud.pesan(G.t('tepis'), 1.2, 'kecil'); }
        }
        continue;
      }
      // posisi
      const pem = b.pemilik, lawanPembawa = pem && pem.tim !== T.i;
      const bx = b.x, by = b.y, dBola = Math.hypot(bx - gx, by - 34);
      if (lawanPembawa && G.dalamKotak(M, T.i, pem.x, pem.y) && Math.hypot(pem.x - k.x, pem.y - k.y) < 7.5 && Math.abs(pem.x - gx) < 14) {
        k.tx = pem.x; k.ty = pem.y; k.mau = 7.2;
        if (Math.hypot(pem.x - k.x, pem.y - k.y) < 1.2 && k.tekelCd <= 0) { k.tekelCd = .7; if (Math.random() < .5 + k.st.def / 300) { b.x = k.x; b.y = k.y; G.Bola.kuasai(M, k); k.pegang = true; k.pegangT = 0; } else k.stunT = .5; }
        continue;
      }
      if (!pem && G.dalamKotak(M, T.i, bx, by) && Math.hypot(b.vx, b.vy) < 12 && Math.abs(bx - gx) < 11 && b.z < 2.4) {
        let palingDekat = true; const dk = Math.hypot(bx - k.x, by - k.y);
        for (const o of M.pemain) if (o !== k && Math.hypot(bx - o.x, by - o.y) < dk - 1) { palingDekat = false; break; }
        if (palingDekat) { k.tx = bx; k.ty = by; k.mau = 7; continue; }
      }
      const r = G.clamp(dBola * .1, .8, 4.5), ax = bx - gx, ay = by - 34, ad = Math.hypot(ax, ay) || 1;
      k.tx = gx + ax / ad * r * (Math.abs(ax) / ad * .9 + .1) + ar * .3; k.ty = 34 + G.clamp(ay / ad * r * 1.2, -3, 3);
      if (Math.abs(k.tx - gx) < .3) k.tx = gx + ar * .3;
      k.mau = 5.5;
    }
  };
  function distribusi(M, k) {
    const best = G.Bola.opsiUmpan(M, k);
    k.pegang = false;
    if (best && best.skor > .2) G.Bola.umpan(M, k, best.q, best.jenis === 'terobos' ? 'lambung' : best.jenis);
    else { const q = M.tim[k.tim].pemain[G.rint(5, 9)]; G.Bola.umpan(M, k, q, 'lambung'); }
    if (M.ctrl && M.ctrl.tim === k.tim && M.bola.tujuan) M.ctrl = M.bola.tujuan;
  }
  AI.distribusi = distribusi;
})();
