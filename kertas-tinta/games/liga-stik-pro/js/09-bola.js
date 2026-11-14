'use strict';
// Fisika bola, menggiring, umpan (pendek/terobosan/lambung), tembakan, sundulan, tekel, perebutan bola.
(function () {
  const L = G.L, W = G.W;
  G.gxLawan = (M, t) => M.tim[t].arah > 0 ? L : 0;
  G.gxSendiri = (M, t) => M.tim[t].arah > 0 ? 0 : L;
  G.keA = (M, t, x) => M.tim[t].arah > 0 ? x / L : 1 - x / L;
  G.dariA = (M, t, ax) => M.tim[t].arah > 0 ? ax * L : L - ax * L;
  // apakah (x,y) di dalam kotak penalti gawang milik tim t
  G.dalamKotak = (M, t, x, y) => { const g = G.gxSendiri(M, t); return Math.abs(y - 34) < 20.16 && (g === 0 ? x < 16.5 && x > -1 : x > L - 16.5 && x < L + 1); };
  const B = G.Bola = {};
  B.baru = () => ({ x: L / 2, y: W / 2, z: 0, vx: 0, vy: 0, vz: 0, pemilik: null, last: null, lastTim: 0, jenis: 'diam', tujuan: null, tx: 0, ty: 0, putusan: null, super: false, jejak: [], tembakId: 0, rot: 0, diJaring: false, umpanDari: null });

  B.lepas = function (M, p, vx, vy, vz, jenis) {
    const b = M.bola;
    if (b.pemilik === p) { b.x = p.x + Math.cos(p.arah) * .55; b.y = p.y + Math.sin(p.arah) * .55; b.z = p.pegang ? 1 : 0; }
    if (p.pegang) p.pegang = false;
    b.pemilik = null; b.vx = vx; b.vy = vy; b.vz = vz; b.last = p; b.lastTim = p.tim; b.jenis = jenis; b.putusan = null; b.super = false; b.tujuan = null; b.umpanDari = null;
    p.kickCd = .32; p.kickT = .22; const sp = Math.hypot(vx, vy); if (sp > .1) p.arah = Math.atan2(vy, vx);
    for (const q of M.pemain) q.terima = false;
    G.bunyi.tendang(G.clamp(Math.hypot(vx, vy, vz) / 30, 0, 1));
  };
  B.umpan = function (M, p, q, jenis) {
    const b = M.bola, lawanArah = M.tim[p.tim].arah;
    let tx = q.x + q.vx * .45, ty = q.y + q.vy * .45;
    if (jenis === 'terobos') { tx = q.x + lawanArah * 7.5 + q.vx * .5; ty = q.y + (34 - q.y) * .12 + q.vy * .4; }
    tx = G.clamp(tx, 1.5, L - 1.5); ty = G.clamp(ty, 1.5, W - 1.5);
    const sx = b.pemilik === p ? p.x + Math.cos(p.arah) * .55 : b.x, sy = b.pemilik === p ? p.y + Math.sin(p.arah) * .55 : b.y;
    let dx = tx - sx, dy = ty - sy; const d = Math.max(1, Math.hypot(dx, dy));
    const lambung = jenis === 'lambung' || jenis === 'lempar';
    const galat = (1 - p.st.pas / 100) * (lambung ? .14 : .085) * (M.boost[p.tim] > 0 ? .7 : 1);
    const a = Math.atan2(dy, dx) + G.randn() * galat;
    let vx, vy, vz;
    if (lambung) {
      let vh = G.clamp(9 + d * .4, 11, 25); if (jenis === 'lempar') vh = G.clamp(6 + d * .45, 7, 15);
      const tt = d / vh; vz = 4.905 * tt * (1 + G.randn() * galat * .5); vx = Math.cos(a) * vh; vy = Math.sin(a) * vh;
      if (jenis === 'lempar') vz -= 1.9 / tt;
    } else {
      const v = G.clamp(8 + d * .62 + (jenis === 'terobos' ? 1.5 : 0), 9, 27); vx = Math.cos(a) * v; vy = Math.sin(a) * v; vz = d > 22 ? 1.2 : 0;
    }
    B.lepas(M, p, vx, vy, vz, jenis);
    b.tujuan = q; b.tx = tx; b.ty = ty; b.umpanDari = p; q.terima = true;
    M.stat.umpan[p.tim]++;
  };
  B.tembak = function (M, p, aimY, aimZ, kuat, opsi = {}) {
    const b = M.bola, gx = G.gxLawan(M, p.tim);
    let err = (1 - p.st.sht / 100) * 2.4 + Math.max(0, kuat - .82) * 5 + (opsi.tekanan || 0) * .8;
    err *= (opsi.akurasi || 1) * (M.boost[p.tim] > 0 ? .75 : 1);
    if (opsi.super) err *= .25;
    const ty = aimY + G.randn() * err * .75;
    const tz = Math.max(.12, aimZ + Math.abs(G.randn()) * err * .45 + Math.max(0, kuat - .9) * 9);
    const v = opsi.super ? 34 : 16 + kuat * 15;
    const sx = b.pemilik === p ? p.x + Math.cos(p.arah) * .55 : b.x, sy = b.pemilik === p ? p.y + Math.sin(p.arah) * .55 : b.y, sz = b.pemilik === p ? 0 : b.z;
    const dx = gx - sx, dy = ty - sy, dh = Math.max(1, Math.hypot(dx, dy)), tt = dh / v;
    const vz = (tz - sz + 4.905 * tt * tt) / tt;
    B.lepas(M, p, v * dx / dh, v * dy / dh, vz, 'tembak');
    b.super = !!opsi.super; b.tembakId++; b.tembakTim = p.tim; b.tembakDihitung = false;
    M.stat.tembak[p.tim]++;
    if (b.super) G.hud && G.hud.kilat();
  };
  // pilihan umpan terbaik untuk AI
  B.opsiUmpan = function (M, p) {
    const lawan = M.tim[1 - p.tim].pemain, kawan = M.tim[p.tim].pemain, aP = G.keA(M, p.tim, p.x), ar = M.tim[p.tim].arah;
    let best = null;
    for (const q of kawan) {
      if (q === p || q.jatuhT > 0) continue; if (q.pos === 'GK' && aP > .3) continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < 5 || d > 44) continue;
      let buka = 99, ruang = 99, depan = 99;
      for (const o of lawan) {
        buka = Math.min(buka, G.jarakRuas(o.x, o.y, p.x, p.y, q.x, q.y)); const dq = Math.hypot(o.x - q.x, o.y - q.y); ruang = Math.min(ruang, dq);
        if ((o.x - q.x) * ar > 0) depan = Math.min(depan, dq);
      }
      const maju = G.keA(M, p.tim, q.x) - aP, darat = buka > 1.9;
      let s = G.clamp(maju * 2, -.5, .8) + G.clamp(ruang / 7, 0, 1) * .6 + (darat ? .35 : (d > 14 && ruang > 4 ? .1 : -1)) - d / 120 + Math.random() * .15;
      let jenis = darat ? 'pendek' : 'lambung';
      if (q.pos !== 'GK' && maju > .04 && depan > 7 && G.keA(M, p.tim, q.x) > .5 && buka > 1.4) { s += .3; jenis = 'terobos'; }
      if (!best || s > best.skor) best = { q, skor: s, jenis };
    }
    return best;
  };
  // pilihan umpan pemain manusia: kawan paling dekat ke arah stik
  B.pilihArah = function (M, p, w) {
    const dir = w && w.m > .2 ? w : { x: Math.cos(p.arah), y: Math.sin(p.arah) };
    let best = null, bs = -9, cad = null, cs = -9;
    for (const q of M.tim[p.tim].pemain) {
      if (q === p) continue; const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy); if (d < 2) continue;
      const c = (dx * dir.x + dy * dir.y) / d; let s = c * 1.4 - d / 60 - (q.pos === 'GK' ? .5 : 0);
      if (c > .45 && s > bs) { bs = s; best = q; }
      if (c > cs) { cs = c; cad = q; }
    }
    return best || cad;
  };
  B.tekel = function (M, d, c) {
    d.tekelT = .28; d.tekelCd = d === M.ctrl ? .5 : .95;
    const lv = M.lvl[d.tim];
    let pr = .45 + (d.st.def - (c.st.spd + c.st.pas) / 2) / 120;
    const ac = Math.atan2(d.y - c.y, d.x - c.x), beda = Math.abs(G.sudut(ac - c.arah));
    const belakang = beda > 2.2;
    if (belakang) pr -= .18;
    if (c.lariAktif) pr += .08;
    if (c === M.ctrl) pr *= .62;
    pr = G.clamp(pr * lv.tekel, .08, .85);
    if (belakang && Math.random() < .22) { G.Laga.pelanggaran(M, d, c); return true; }
    if (Math.random() < pr) {
      const b = M.bola; b.pemilik = null; b.last = d; b.lastTim = d.tim; b.jenis = 'lepas'; b.tujuan = null;
      const a = d.arah + G.rnd(-.5, .5); b.vx = Math.cos(a) * 3.5 + c.vx * .2; b.vy = Math.sin(a) * 3.5 + c.vy * .2; b.vz = 0;
      c.kickCd = .5; c.stunT = .25; d.kickCd = 0;
      return true;
    }
    d.stunT = .42; return false;
  };
  B.kuasai = function (M, p) {
    const b = M.bola;
    if (b.tujuan && b.umpanDari && b.umpanDari.tim === p.tim) M.stat.umpanOk[p.tim]++;
    const kiperTangan = p.pos === 'GK' && G.dalamKotak(M, p.tim, b.x, b.y);
    if (kiperTangan && b.jenis === 'tembak' && b.tembakTim !== p.tim && !b.tembakDihitung) { M.stat.tepat[b.tembakTim]++; b.tembakDihitung = true; }
    const pegang = kiperTangan && (b.z > .1 || b.lastTim !== p.tim);
    b.pemilik = p; b.vz = 0; b.tujuan = null; b.umpanDari = null; b.putusan = null; b.super = false; b.last = p; b.lastTim = p.tim; b.jenis = 'giring';
    for (const q of M.pemain) q.terima = false;
    if (pegang) { p.pegang = true; p.pegangT = 0; }
    G.Laga.diKuasai(M, p);
  };
  function sundul(M, p) {
    const b = M.bola, gx = G.gxLawan(M, p.tim), dG = Math.hypot(gx - p.x, 34 - p.y);
    if (dG < 19 && Math.abs(p.y - 34) < 14) {
      const ty = 34 + G.rnd(-3.2, 3.2), tz = G.rnd(.2, 2.1), v = 12 + Math.random() * 5, dx = gx - b.x, dy = ty - b.y, dh = Math.hypot(dx, dy), tt = dh / v;
      B.lepas(M, p, v * dx / dh, v * dy / dh, (tz - b.z + 4.905 * tt * tt) / tt, 'tembak'); b.tembakId++; b.tembakTim = p.tim; b.tembakDihitung = false; M.stat.tembak[p.tim]++;
    } else {
      const ar = M.tim[p.tim].arah, a = Math.atan2(G.rnd(-.7, .7), ar);
      B.lepas(M, p, Math.cos(a) * 14, Math.sin(a) * 14, 6, 'sundul');
    }
    p.kickT = .25;
  }
  // perebutan bola lepas
  B.rebut = function (M) {
    const b = M.bola; if (b.pemilik || b.diJaring) return;
    let best = null, bd = 9, heading = null, hd = 9;
    for (const p of M.pemain) {
      if (p.kickCd > 0 || p.jatuhT > 0 || p.diveT > .05) continue;
      const d = Math.hypot(p.x - b.x, p.y - b.y);
      const tangan = p.pos === 'GK' && G.dalamKotak(M, p.tim, b.x, b.y);
      if (d > (tangan ? 1.35 : .9)) continue;
      if (b.z > (tangan ? 2.6 : .95)) { if (!tangan && b.z < 2.5 && d < .8 && d < hd) { hd = d; heading = p; } continue; }
      if (p.slideT > 0) { // sliding menyentuh bola
        const a = p.arah + G.rnd(-.4, .4); b.vx = Math.cos(a) * 7; b.vy = Math.sin(a) * 7; b.vz = .5; b.last = p; b.lastTim = p.tim; b.jenis = 'lepas'; b.tujuan = null; p.kickCd = .5; return;
      }
      if (d < bd) { bd = d; best = p; }
    }
    if (best) {
      const sp = Math.hypot(b.vx, b.vy);
      if (best.pos !== 'GK' && b.jenis === 'tembak' && sp > 20 && b.lastTim !== best.tim) {
        b.vx *= -.25; b.vy = b.vy * .3 + G.rnd(-6, 6); b.vz = G.rnd(1, 4); b.last = best; b.lastTim = best.tim; best.kickCd = .3; b.jenis = 'pantul'; b.putusan = null; return;
      }
      B.kuasai(M, best); return;
    }
    if (heading) sundul(M, heading);
  };
  B.fisika = function (M, dt) {
    const b = M.bola;
    if (b.pemilik) {
      const p = b.pemilik;
      if (p.pegang) { b.x = p.x + Math.cos(p.arah) * .32; b.y = p.y + Math.sin(p.arah) * .32; b.z = 1.05; }
      else { const off = .5 + (p.lariAktif ? .3 : 0) + (Math.sin(p.ph) * .5 + .5) * .12; b.x = p.x + Math.cos(p.arah) * off; b.y = p.y + Math.sin(p.arah) * off; b.z = 0; }
      b.vx = p.vx; b.vy = p.vy; b.vz = 0;
    } else {
      b.vz -= 9.81 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
      if (b.z <= 0) { b.z = 0; if (b.vz < -1.3) { b.vz = -b.vz * .48; b.vx *= .9; b.vy *= .9; } else b.vz = 0; }
      const sp = Math.hypot(b.vx, b.vy);
      if (b.z <= .02 && b.vz === 0) { const ns = Math.max(0, sp - (2.6 + .07 * sp) * dt), k = sp > 0 ? ns / sp : 0; b.vx *= k; b.vy *= k; }
      else { const k = 1 - .012 * dt; b.vx *= k; b.vy *= k; }
      if (b.diJaring) { // tertahan jaring
        const back = b.x < L / 2 ? -1.9 : L + 1.9;
        if ((b.x < L / 2 && b.x < back) || (b.x > L / 2 && b.x > back)) { b.x = back; b.vx *= -.15; b.vy *= .5; }
        b.y = G.clamp(b.y, 34 - 3.5, 34 + 3.5); if (b.z > 2.2) { b.z = 2.2; b.vz = -Math.abs(b.vz) * .3; }
      }
    }
    b.rot += Math.hypot(b.vx, b.vy) * dt / .11;
    if (b.super || b.jejak.length) { b.jejak.push(b.x, b.y, b.z); if (b.jejak.length > 54 || !b.super) b.jejak.splice(0, 3); }
  };
  const o = {}, o2 = {};
  B.gambar = function (ctx, M) {
    const b = M.bola;
    if (b.jejak.length > 6) {
      ctx.strokeStyle = 'rgba(217,178,95,.75)'; ctx.lineCap = 'round';
      for (let i = 3; i < b.jejak.length; i += 3) {
        G.proj(b.jejak[i - 3], b.jejak[i - 2], b.jejak[i - 1], o); G.proj(b.jejak[i], b.jejak[i + 1], b.jejak[i + 2], o2); if (!o.ok || !o2.ok) continue;
        ctx.lineWidth = Math.max(1, o2.s * .2 * i / b.jejak.length); ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o2.x, o2.y); ctx.stroke();
      }
    }
    G.proj(b.x, b.y, 0, o); if (!o.ok) return;
    ctx.fillStyle = 'rgba(6,20,10,.38)'; ctx.beginPath(); ctx.ellipse(o.x, o.y, Math.max(1.6, o.s * .17), Math.max(.8, o.s * .07), 0, 0, 7); ctx.fill();
    G.proj(b.x, b.y, b.z + .11, o2); const r = Math.max(2.4, o2.s * .16);
    ctx.fillStyle = '#fbfbf6'; ctx.strokeStyle = '#1a2030'; ctx.lineWidth = Math.max(.8, r * .18);
    ctx.beginPath(); ctx.arc(o2.x, o2.y, r, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1a2030'; for (let k = 0; k < 3; k++) { const a = b.rot + k * 2.09; ctx.beginPath(); ctx.arc(o2.x + Math.cos(a) * r * .5, o2.y + Math.sin(a) * r * .38, r * .24, 0, 7); ctx.fill(); }
    b.sx = o2.x; b.sy = o2.y; b.sd = o2.d;
  };
})();
