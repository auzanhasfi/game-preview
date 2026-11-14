'use strict';
// HUD kanvas: papan skor, jam, meteran tendangan super, radar, nama pemain terkendali + stamina, pengukur tenaga tembakan,
// penanda kursor, pesan besar (GOL!, Babak 2), petunjuk bola mati, tampilan penalti & adu penalti. Toast di DOM.
(function () {
  const H = G.hud = {}; let pesan = [], label = null, kilat = 0;
  const F = (w, s) => `${w} ${s}px Geist, system-ui, -apple-system, sans-serif`;
  H.pesan = (teks, dur = 2, gaya = 'besar', sub = '') => { pesan = pesan.filter(p => p.gaya !== gaya || gaya === 'kecil'); pesan.push({ teks, sub, dur, t: 0, gaya }); if (pesan.length > 3) pesan.shift(); };
  H.label = (teks) => { label = { teks, t: 0 }; };
  H.kilat = () => { kilat = .35; };
  H.toast = (teks, emas) => { const box = G.$('#toast'), d = document.createElement('div'); d.textContent = teks; if (emas) d.className = 'emas'; box.appendChild(d); setTimeout(() => d.remove(), 2600); };
  H.bersih = () => { pesan = []; label = null; };
  function kotak(ctx, x, y, w, h, r, isi, garis) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (isi) { ctx.fillStyle = isi; ctx.fill(); } if (garis) { ctx.strokeStyle = garis; ctx.lineWidth = 1; ctx.stroke(); } }
  H.gambar = function (ctx, M, t, dt) {
    const K = G.kam, Wd = K.W, Ht = K.H, kecil = Wd < 700 || Ht < 460, sentuh = G.inp.sentuh;
    // vinyet
    const vg = ctx.createRadialGradient(Wd / 2, Ht / 2, Math.min(Wd, Ht) * .35, Wd / 2, Ht / 2, Math.max(Wd, Ht) * .75);
    vg.addColorStop(0, 'rgba(5,10,22,0)'); vg.addColorStop(1, 'rgba(5,10,22,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, Wd, Ht);
    if (kilat > 0) { kilat -= dt; ctx.fillStyle = `rgba(255,236,190,${kilat * .7})`; ctx.fillRect(0, 0, Wd, Ht); }
    if (M.fase !== 'penalti' && M.mode !== 'adu') kursor(ctx, M, t);
    if (M.fase === 'penalti' && M.pen) hudPenalti(ctx, M, t, kecil);
    papanSkor(ctx, M, kecil);
    if (M.mode !== 'adu' && M.fase !== 'penalti') { if (!(sentuh && Ht > Wd)) radar(ctx, M, kecil, sentuh); panelPemain(ctx, M, kecil, sentuh); }
    // petunjuk / label
    if (label) {
      label.t += dt; const a = Math.min(1, label.t * 4, (2.6 - label.t) * 3);
      if (a > 0) { ctx.globalAlpha = a; ctx.font = F(600, kecil ? 12 : 14); const w = ctx.measureText(label.teks).width + 28; kotak(ctx, Wd / 2 - w / 2, kecil ? 54 : 62, w, 30, 15, 'rgba(18,29,51,.9)', '#3d4f74'); ctx.fillStyle = '#efe6d2'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label.teks, Wd / 2, (kecil ? 54 : 62) + 15); ctx.globalAlpha = 1; } else if (label.t > 2.6) label = null;
    }
    if (M.fase === 'mati' && M.restart && M.restart.siap && M.manusia && M.restart.tim === 0) {
      const tk = G.t('h_' + M.restart.jenis); ctx.font = F(600, kecil ? 12 : 14); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = ctx.measureText(tk).width + 30, y = Ht - (kecil ? 124 : 160) - (sentuh && Ht > Wd ? 260 : 0);
      kotak(ctx, Wd / 2 - w / 2, y, w, 32, 16, 'rgba(18,29,51,.92)', '#d9b25f'); ctx.fillStyle = '#d9b25f'; ctx.fillText(tk, Wd / 2, y + 16);
    }
    // pesan besar
    for (const p of pesan) p.t += dt; pesan = pesan.filter(p => p.t < p.dur);
    let yk = Ht * .3;
    for (const p of pesan) {
      const muncul = Math.min(1, p.t / .22), hilang = Math.min(1, (p.dur - p.t) / .3), a = Math.min(muncul, hilang);
      ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (p.gaya === 'gol') {
        const s = Math.min(Wd, Ht * 1.6) / 900, skala = .8 + .2 * muncul;
        ctx.translate(Wd / 2, Ht * .36); ctx.scale(skala, skala);
        ctx.font = `800 ${Math.round(150 * s)}px Geist, system-ui, sans-serif`; ctx.fillStyle = 'rgba(5,10,22,.55)'; ctx.fillText(p.teks, 4, 6); ctx.fillStyle = '#d9b25f'; ctx.fillText(p.teks, 0, 0);
        if (p.sub) { ctx.font = F(600, Math.max(13, Math.round(26 * s))); const w = ctx.measureText(p.sub).width + 36; kotak(ctx, -w / 2, 70 * s, w, 40 * s + 6, 20 * s + 3, 'rgba(18,29,51,.92)', '#3d4f74'); ctx.fillStyle = '#efe6d2'; ctx.fillText(p.sub, 0, 70 * s + 20 * s + 3); }
      } else if (p.gaya === 'besar') {
        const s = Math.min(Wd, Ht * 1.6) / 900; ctx.font = `700 ${Math.round(58 * s + 10)}px 'Source Serif 4', Georgia, serif`;
        const w = ctx.measureText(p.teks).width + 60; kotak(ctx, Wd / 2 - w / 2, Ht * .22 - 44 * s - 10, w, (p.sub ? 120 : 88) * s + 20, 14, 'rgba(12,21,38,.9)', '#d9b25f');
        ctx.fillStyle = '#efe6d2'; ctx.fillText(p.teks, Wd / 2, Ht * .22); if (p.sub) { ctx.font = F(800, Math.round(30 * s + 6)); ctx.fillStyle = '#d9b25f'; ctx.fillText(p.sub, Wd / 2, Ht * .22 + 50 * s + 6); }
      } else { ctx.font = F(700, kecil ? 15 : 19); const w = ctx.measureText(p.teks).width + 32; kotak(ctx, Wd / 2 - w / 2, yk + 60, w, 36, 18, 'rgba(18,29,51,.92)', '#3d4f74'); ctx.fillStyle = '#efe6d2'; ctx.fillText(p.teks, Wd / 2, yk + 78); yk += 44; }
      ctx.restore();
    }
  };
  function papanSkor(ctx, M, kecil) {
    const x = 12, y = Math.max(10, 10), h = kecil ? 30 : 36, f = kecil ? 13 : 15;
    ctx.font = F(700, f); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const kA = M.klub[0].k, kB = M.klub[1].k, sk = `${M.skor[0]}  –  ${M.skor[1]}`;
    const wA = ctx.measureText(kA).width, wB = ctx.measureText(kB).width; ctx.font = F(800, f + 2); const wS = ctx.measureText(sk).width;
    const jam = M.mode === 'adu' ? G.t('adu') : (Math.min(M.babak * 45, G.Laga.menit(M) + 1)) + "'";
    ctx.font = F(600, f - 1); const wJ = ctx.measureText(jam).width;
    const w = 14 + 12 + 8 + wA + 14 + wS + 14 + wB + 8 + 12 + 14 + 10 + wJ + 14;
    kotak(ctx, x, y, w, h, 8, 'rgba(12,21,38,.9)', '#3d4f74');
    let cx = x + 14; const cy = y + h / 2;
    const chip = (kit) => { ctx.fillStyle = kit.baju; ctx.fillRect(cx, cy - 6, 12, 12); ctx.fillStyle = kit.baju2; ctx.fillRect(cx + 8, cy - 6, 4, 12); cx += 20; };
    chip(M.kit[0]); ctx.font = F(700, f); ctx.fillStyle = '#efe6d2'; ctx.fillText(kA, cx, cy); cx += wA + 14;
    ctx.font = F(800, f + 2); ctx.fillStyle = '#d9b25f'; ctx.fillText(sk, cx, cy); cx += wS + 14;
    ctx.font = F(700, f); ctx.fillStyle = '#efe6d2'; ctx.fillText(kB, cx, cy); cx += wB + 8; chip(M.kit[1]);
    ctx.fillStyle = '#3d4f74'; ctx.fillRect(cx, y + 7, 1, h - 14); cx += 10;
    ctx.font = F(600, f - 1); ctx.fillStyle = '#a9b4c9'; ctx.fillText(jam, cx, cy);
    let y2 = y + h + 6;
    // meteran super + semangat
    if (M.manusia && M.mode !== 'adu') {
      ctx.font = F(600, 11); const lbl = M.superSiap ? G.t('superSiapPendek') : G.t('superMeter');
      const ww = ctx.measureText(lbl).width + 70; kotak(ctx, x, y2, ww, 24, 12, 'rgba(12,21,38,.86)', M.superSiap ? '#d9b25f' : '#2c3c5c');
      ctx.fillStyle = M.superSiap ? '#d9b25f' : '#a9b4c9'; ctx.fillText(lbl, x + 12, y2 + 12);
      for (let i = 0; i < 2; i++) { const isi = M.superSiap || M.superIsi > i * .5 + .01; kotak(ctx, x + ww - 50 + i * 20, y2 + 8, 16, 8, 3, isi ? '#d9b25f' : '#22324f'); }
      y2 += 30;
      if (M.boost[0] > 0 || M.boost[1] > 0) {
        const kamu = M.boost[0] > 0, tx = (kamu ? G.t('semangat') + ' ' + M.klub[0].k : G.t('semangat') + ' ' + M.klub[1].k) + ' · ' + Math.ceil(kamu ? M.boost[0] : M.boost[1]) + 's';
        ctx.font = F(600, 11); const w3 = ctx.measureText(tx).width + 24; kotak(ctx, x, y2, w3, 24, 12, 'rgba(12,21,38,.86)', kamu ? '#8fc987' : '#e07a6a'); ctx.fillStyle = kamu ? '#8fc987' : '#e07a6a'; ctx.fillText(tx, x + 12, y2 + 12);
      }
    }
    if (M.mode === 'adu' && M.adu) {
      for (let t = 0; t < 2; t++) {
        const yy = y2 + t * 24; kotak(ctx, x, yy, 70 + 5 * 20, 22, 6, 'rgba(12,21,38,.86)');
        ctx.font = F(700, 12); ctx.fillStyle = '#efe6d2'; ctx.fillText(M.klub[t].k, x + 10, yy + 11);
        const hs = M.adu.hasil[t], n = Math.max(5, hs.length);
        for (let i = 0; i < Math.min(n, 5) + Math.max(0, hs.length - 5); i++) {
          const xx = x + 56 + (i % 5) * 20 + (i >= 5 ? 6 : 0), v = hs[i];
          ctx.beginPath(); ctx.arc(xx, yy + 11, 6, 0, 7);
          if (v === true) { ctx.fillStyle = '#8fc987'; ctx.fill(); } else if (v === false) { ctx.fillStyle = '#e07a6a'; ctx.fill(); } else { ctx.strokeStyle = '#75839e'; ctx.lineWidth = 1.2; ctx.stroke(); }
        }
      }
    }
  }
  function radar(ctx, M, kecil, sentuh) {
    const w = kecil ? 116 : 168, h = w * 68 / 105, x = G.kam.W / 2 - w / 2, y = G.kam.H - h - (sentuh ? 10 : 12);
    kotak(ctx, x - 4, y - 4, w + 8, h + 8, 6, 'rgba(12,21,38,.72)', '#2c3c5c');
    ctx.strokeStyle = 'rgba(239,230,210,.35)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h); ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke();
    const sx = v => x + v / G.L * w, sy = v => y + v / G.W * h;
    for (const p of M.pemain) {
      ctx.fillStyle = p.tim === 0 ? '#d9b25f' : '#7d97e0';
      ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), p === M.ctrl ? 3.6 : 2.4, 0, 7); ctx.fill();
      if (p === M.ctrl) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke(); }
    }
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(sx(M.bola.x), sy(M.bola.y), 2.2, 0, 7); ctx.fill();
  }
  function panelPemain(ctx, M, kecil, sentuh) {
    const c = M.ctrl; if (!c || !M.manusia) return;
    const x = 12, y = sentuh ? (kecil ? 118 : 130) : G.kam.H - 58, w = kecil ? 150 : 190;
    if (sentuh && G.kam.H < 380) return;
    kotak(ctx, x, y, w, 44, 8, 'rgba(12,21,38,.86)', '#2c3c5c');
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = F(500, 10); ctx.fillStyle = '#75839e'; ctx.fillText(c.pos + ' · ' + c.no, x + 12, y + 15);
    ctx.font = F(700, kecil ? 13 : 14); ctx.fillStyle = '#efe6d2'; ctx.fillText(c.nama, x + 12, y + 31);
    kotak(ctx, x + 12, y + 36, w - 24, 3, 1.5, '#22324f'); kotak(ctx, x + 12, y + 36, (w - 24) * c.stamina, 3, 1.5, c.stamina > .3 ? '#8fc987' : '#e07a6a');
  }
  function kursor(ctx, M, t) {
    const c = M.ctrl, b = M.bola;
    if (b.pemilik && b.pemilik !== c && b.pemilik.sx != null) {
      const p = b.pemilik; ctx.font = F(600, 11); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillStyle = 'rgba(239,230,210,.85)';
      ctx.fillText(p.nama, p.sx, (p.kepalaY || p.sy - 40) - 4);
    }
    if (!c || c.sx == null || !M.manusia) return;
    const yT = (c.kepalaY || c.sy - 40) - 8 - Math.sin(t * 6) * 2;
    ctx.fillStyle = '#d9b25f'; ctx.beginPath(); ctx.moveTo(c.sx - 7, yT - 10); ctx.lineTo(c.sx + 7, yT - 10); ctx.lineTo(c.sx, yT); ctx.closePath(); ctx.fill();
    ctx.font = F(700, 12); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; const nm = c.no + ' ' + c.nama, w = ctx.measureText(nm).width + 14;
    kotak(ctx, c.sx - w / 2, yT - 30, w, 18, 9, 'rgba(12,21,38,.85)'); ctx.fillStyle = '#efe6d2'; ctx.fillText(nm, c.sx, yT - 15);
    if (M.mengisi) {
      const bw = 54, bx = c.sx - bw / 2, by = yT - 40; kotak(ctx, bx, by, bw, 7, 3.5, 'rgba(12,21,38,.9)', '#3d4f74');
      kotak(ctx, bx + 1, by + 1, (bw - 2) * M.isi, 5, 2.5, M.isi > .88 ? '#e07a6a' : '#d9b25f');
    }
    // lingkar di kaki
    ctx.strokeStyle = 'rgba(217,178,95,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(c.sx, c.sy, c.sS * .55, c.sS * .2, 0, 0, 7); ctx.stroke();
  }
  function hudPenalti(ctx, M, t, kecil) {
    const P = M.pen, Wd = G.kam.W, Ht = G.kam.H, ry = G.kam.ry > 0 ? 1 : -1;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (P.fase === 'bidik' && P.userTendang) {
      const o = G.proj(P.gx, 34 + P.aimX * 3.35 * ry, P.aimZ * 2.1 + .12, {});
      if (o.ok) { ctx.strokeStyle = '#d9b25f'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(o.x, o.y, o.s * .32, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(o.x - o.s * .5, o.y); ctx.lineTo(o.x + o.s * .5, o.y); ctx.moveTo(o.x, o.y - o.s * .5); ctx.lineTo(o.x, o.y + o.s * .5); ctx.stroke(); }
      const bw = Math.min(260, Wd * .5), bx = Wd / 2 - bw / 2, by = G.inp.sentuh ? 104 : 104;
      kotak(ctx, bx, by, bw, 12, 6, 'rgba(12,21,38,.9)', '#3d4f74'); kotak(ctx, bx + 2, by + 2, (bw - 4) * P.kuat, 8, 4, P.kuat > .88 ? '#e07a6a' : '#d9b25f');
      ctx.font = F(600, kecil ? 12 : 14); ctx.fillStyle = '#efe6d2'; ctx.fillText(G.t(G.inp.sentuh ? 'pen_bidikSentuh' : 'pen_bidik'), Wd / 2, by - 18);
    }
    if (P.fase === 'bidik' && P.userJaga) {
      if (P.bonus) {
        const o = G.proj(P.gx, 34 + P.aiAimX * 3.35 * ry, P.aiAimZ * 2.1 + .12, {});
        if (o.ok) { ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(143,201,135,.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(o.x, o.y, o.s * .55 + Math.sin(t * 8) * 2, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
      }
      const by = G.inp.sentuh ? 104 : 104; ctx.font = F(600, kecil ? 12 : 14); ctx.fillStyle = '#efe6d2';
      ctx.fillText(G.t(P.bonus ? 'pen_jagaPetunjuk' : 'pen_jaga'), Wd / 2, by);
      const pil = P.pilih != null ? P.pilih : (Math.abs(G.inp.x) < .3 ? 0 : Math.sign(G.inp.x) * .75);
      ctx.font = F(800, 22); ctx.fillStyle = '#d9b25f'; ctx.fillText(pil < 0 ? '←' : pil > 0 ? '→' : '•', Wd / 2, by + 28);
    }
    ctx.font = F(600, kecil ? 12 : 14); ctx.fillStyle = 'rgba(239,230,210,.9)';
    ctx.fillText(P.a.no + ' ' + P.a.nama + '  vs  ' + P.k.nama, Wd / 2, kecil ? 20 + 40 : 64);
  }
})();
