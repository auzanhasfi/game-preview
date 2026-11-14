'use strict';
// Pertandingan: membuat laga, fase (mati/main/keluar/gol/jeda/selesai/soal/penalti), aturan bola keluar, gol, pelanggaran,
// kendali pemain manusia (gaya konsol: umpan arah, terobosan, lambung, tembakan berisi tenaga, tekan, sliding, ganti pemain), jam & babak, soal momen.
(function () {
  const L = G.L, W = G.W, Lg = G.Laga = {};
  const hash = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const FREK = { mati: [], jarang: [.3, .7], normal: [.2, .4, .6, .8], sering: [.12, .25, .37, .5, .62, .75, .88] };

  const KIPER = ['#e6c43c', '#3dbb7a', '#8a5ad6', '#e8862f', '#2b2f38', '#3d8fd9', '#e05a9b'];
  const kiperWarna = (w, kits) => { const jauh = c => Math.min(...kits.map(k => Math.min(G.bedaWarna(c, k.baju), G.bedaWarna(c, k.celana)))); if (jauh(w) > 120) return w; return KIPER.slice().sort((a, b) => jauh(b) - jauh(a))[0]; };
  Lg.buat = function (o) {
    const kA = G.klub(o.kandang), kB = G.klub(o.tandang);
    const kitA = kA.kandang; let kitB = kB.kandang;
    if (G.bedaWarna(kitA.baju, kitB.baju) < 140 || (kA.id === kB.id)) kitB = kB.tandang;
    if (G.bedaWarna(kitA.baju, kitB.baju) < 110) kitB = { baju: '#222831', baju2: '#d9b25f', celana: '#222831', kaos: '#222831', pola: 'polos' };
    const demo = o.mode === 'demo';
    const M = {
      o, mode: o.mode, klub: [kA, kB], kit: [kitA, kitB], tim: [], pemain: [], bola: G.Bola.baru(), ctrl: null, skor: [0, 0],
      waktu: 0, babak: 1, panjangBabak: (o.menit || 4) * 30, fase: 'mati', faseT: 0, restart: null, keluar: null, gol: [],
      stat: { tembak: [0, 0], tepat: [0, 0], kuasa: [0, 0], umpan: [0, 0], umpanOk: [0, 0] },
      soal: { benar: 0, total: 0, jadwal: demo ? [] : (FREK[o.frek] || FREK.normal), i: 0 },
      superIsi: 0, superSiap: false, superDipakai: 0, boost: [0, 0], lvl: [G.AI.LEVEL.normal, G.AI.LEVEL[demo ? 'normal' : o.ai] || G.AI.LEVEL.normal],
      manusia: !demo, isi: 0, mengisi: false, antri: null, gantiCd: 0, semangat: 0, t: 0, sorakT: 0, pen: null
    };
    for (let t = 0; t < 2; t++) {
      const k = M.klub[t], T = { i: t, arah: t === 0 ? 1 : -1, klub: k, kit: M.kit[t], pemain: [], pikirT: G.rnd(0, .3) };
      k.pemain.forEach((d, i) => {
        const h = hash(d.nama);
        const p = {
          tim: t, i, nama: d.nama, no: d.no, pos: G.POSISI[i], st: { ...d.st }, home: G.FORMASI[i], x: L / 2, y: W / 2, vx: 0, vy: 0, arah: T.arah > 0 ? 0 : Math.PI, ph: G.rnd(0, 6),
          kickCd: 0, kickT: 0, slideT: 0, slideCd: 0, slideVx: 0, slideVy: 0, slideKena: false, stunT: 0, jatuhT: 0, jatuhArah: 1, diveT: 0, diveY: 34, diveFs: 1, rayaT: 0, tekelT: 0, tekelCd: 0,
          terima: false, tx: L / 2, ty: W / 2, mau: 0, lariAktif: false, stamina: 1, lariDepan: 0, pegang: false, pegangT: 0, lempar: false,
          kit: i === 0 ? { baju: kiperWarna(k.kiper, M.kit), baju2: '#20242c', celana: '#20242c', kaos: kiperWarna(k.kiper, M.kit), pola: 'polos' } : T.kit,
          kulit: G.KULIT[h % G.KULIT.length], rambut: G.RAMBUT[(h >> 4) % G.RAMBUT.length]
        };
        T.pemain.push(p); M.pemain.push(p);
      });
      M.tim.push(T);
    }
    G.lapangan.siapkan(kitA.baju, kitB.baju);
    if (o.mode !== 'adu') Lg.restart(M, 'kickoff', 0);
    return M;
  };
  Lg.menit = M => { const tot = M.panjangBabak, b = M.babak; const m = b === 1 ? Math.floor(M.waktu / tot * 45) : 45 + Math.floor((M.waktu - tot) / tot * 45); return Math.min(m, b * 45); };

  // ---------- restart (bola mati) ----------
  Lg.restart = function (M, jenis, tim, x, y) {
    const b = M.bola;
    Object.assign(b, { pemilik: null, vx: 0, vy: 0, vz: 0, z: 0, diJaring: false, putusan: null, tujuan: null, super: false, jenis: 'diam' }); b.jejak.length = 0;
    for (const p of M.pemain) { p.terima = false; p.pegang = false; p.slideT = 0; p.diveT = 0; p.lempar = false; p.rayaT = 0; p.jatuhT = 0; p.stunT = 0; }
    M.mengisi = false; M.antri = null;
    if (jenis === 'penalti') { G.Pen.dalamLaga(M, tim); return; }
    const T = M.tim[tim], ar = T.arah, kawan = T.pemain;
    const terdekat = (sx, sy, saring) => kawan.filter(saring).reduce((a, p) => Math.hypot(p.x - sx, p.y - sy) < Math.hypot(a.x - sx, a.y - sy) ? p : a);
    let sx = x, sy = y, taker;
    if (jenis === 'kickoff') { sx = L / 2; sy = W / 2; taker = kawan[9]; }
    else if (jenis === 'lemparan') { sx = G.clamp(x, .5, L - .5); sy = y < 34 ? 0 : W; taker = terdekat(sx, sy, p => p.pos !== 'GK'); }
    else if (jenis === 'gawang') { const gx = G.gxSendiri(M, tim); sx = gx + ar * 5.5; sy = 34 + (y > 34 ? 6 : -6); taker = kawan[0]; }
    else if (jenis === 'pojok') { sx = G.gxLawan(M, tim) - ar * .6; sy = y < 34 ? .6 : W - .6; taker = terdekat(sx, sy, p => p.pos === 'MF' || p.pos === 'FW'); }
    else { sx = G.clamp(x, 1, L - 1); sy = G.clamp(y, 1, W - 1); taker = terdekat(sx, sy, p => p.pos !== 'GK'); }
    b.x = sx; b.y = sy;
    M.restart = { jenis, tim, x: sx, y: sy, taker, siap: false, t: 0 };
    M.fase = 'mati'; M.faseT = 0;
    // posisi tujuan setiap pemain
    const gxL = G.gxLawan(M, tim);
    for (const p of M.pemain) {
      let tx, ty;
      if (jenis === 'kickoff') {
        let ax = p.pos === 'GK' ? .03 : Math.min(p.home[0] * .78, .46), ay = p.home[1];
        if (p.tim === tim && p.i === 9) { ax = .497; ay = .5; }
        if (p.tim === tim && p.i === 6) ax = .4;
        tx = G.dariA(M, p.tim, ax); ty = ay * W;
      } else if (p.pos === 'GK') { tx = G.gxSendiri(M, p.tim) + M.tim[p.tim].arah * .4; ty = 34; }
      else if (jenis === 'pojok' && p !== taker && !(p.tim === tim && (p.i === 1 || p.i === 4))) {
        const dlm = p.tim === tim ? G.rnd(5, 13) : G.rnd(2.5, 11); tx = gxL - ar * dlm; ty = 34 + G.rnd(-9, 9);
      } else { [tx, ty] = G.AI.bentuk(M, p, p.tim === tim, sx, sy); }
      if (p.tim !== tim && jenis !== 'lemparan') { const d = Math.hypot(tx - sx, ty - sy); if (d < 9.3) { const a = d > .1 ? Math.atan2(ty - sy, tx - sx) : Math.atan2(0, -ar); tx = sx + Math.cos(a) * 9.4; ty = sy + Math.sin(a) * 9.4; } }
      if (jenis === 'gawang' && p.tim !== tim && G.dalamKotak(M, tim, tx, ty)) tx = G.gxSendiri(M, tim) + ar * 17.5;
      p.rtx = G.clamp(tx, -1, L + 1); p.rty = G.clamp(ty, -1, W + 1);
    }
    // pengambil di belakang bola
    let ta;
    if (jenis === 'kickoff') ta = ar > 0 ? Math.PI : 0;
    else if (jenis === 'lemparan') ta = sy < 34 ? -Math.PI / 2 : Math.PI / 2;
    else ta = Math.atan2(sy - 34, sx - gxL) * (jenis === 'pojok' ? 1 : 1);
    if (jenis === 'gawang') ta = ar > 0 ? Math.PI : 0;
    taker.rtx = sx + Math.cos(ta) * .65; taker.rty = sy + Math.sin(ta) * .65; taker.rArah = Math.atan2(sy - taker.rty, sx - taker.rtx);
    if (jenis === 'lemparan') { taker.rtx = sx; taker.rty = sy + (sy < 34 ? -.35 : .35); taker.rArah = sy < 34 ? Math.PI / 2 : -Math.PI / 2; }
    if (jenis === 'kickoff') for (const p of M.pemain) { p.x = p.rtx; p.y = p.rty; p.vx = p.vy = 0; p.arah = M.tim[p.tim].arah > 0 ? 0 : Math.PI; }
    if (M.manusia && tim === 0) M.ctrl = taker;
    else if (M.manusia && (!M.ctrl || M.ctrl.pos === 'GK')) M.ctrl = M.tim[0].pemain[6];
    if (jenis !== 'kickoff') G.hud.label(G.t('r_' + jenis) + ' · ' + M.klub[tim].k);
  };
  function langkahRestart(M, dt) {
    const R = M.restart; if (!R) return; R.t += dt;
    for (const p of M.pemain) { if (R.siap && p === R.taker) continue; p.tx = p.rtx; p.ty = p.rty; p.mau = G.AI.vmax(M, p) * 1.05; }
    if (!R.siap && (R.t > 1.5 || R.jenis === 'kickoff')) {
      const p = R.taker; p.x = p.rtx; p.y = p.rty; p.vx = p.vy = 0; p.arah = p.rArah; R.siap = true; R.t = 0;
      if (R.jenis === 'lemparan') { p.lempar = true; M.bola.z = 0; }
    }
    if (R.siap) {
      const p = R.taker; p.tx = p.x; p.ty = p.y; p.mau = 0;
      const manusia = M.manusia && R.tim === 0;
      if (!manusia && R.t > (R.jenis === 'kickoff' ? 1.1 : .9)) Lg.ambilRestart(M, null);
      else if (manusia && R.t > 9) Lg.ambilRestart(M, null);
    }
  }
  Lg.ambilRestart = function (M, aksi, w, kuat) {
    const R = M.restart; if (!R || !R.siap) return;
    const p = R.taker, b = M.bola, ar = M.tim[R.tim].arah, gx = G.gxLawan(M, R.tim);
    M.restart = null; M.fase = 'main'; M.faseT = 0; p.lempar = false;
    if (R.jenis === 'kickoff' || R.jenis === 'bebas') G.bunyi.peluit(1);
    if (R.jenis === 'lemparan') b.z = 1.9;
    let q = null, jenis = 'pendek';
    if (aksi) {
      if (aksi === 'tembak' && R.jenis === 'bebas') { tembakManusia(M, p, w, kuat); return; }
      jenis = aksi === 'tembak' ? 'lambung' : aksi;
      if (R.jenis === 'pojok' && aksi === 'pendek') jenis = 'lambung';
      q = G.Bola.pilihArah(M, p, w);
    } else {
      if (R.jenis === 'kickoff') q = M.tim[R.tim].pemain[6];
      else if (R.jenis === 'pojok') { const tx = gx - ar * 9; q = M.tim[R.tim].pemain.filter(o => o !== p && o.pos !== 'GK').sort((a, c) => Math.hypot(a.x - tx, a.y - 34) - Math.hypot(c.x - tx, c.y - 34))[G.rint(0, 2)]; jenis = 'lambung'; }
      else if (R.jenis === 'bebas' && Math.hypot(gx - R.x, 34 - R.y) < 28 && Math.abs(R.y - 34) < 16 && Math.random() < .6) {
        G.Bola.tembak(M, p, 34 + G.rnd(-3, 3), G.rnd(.8, 2), G.rnd(.6, .86), { akurasi: M.lvl[R.tim].tembak }); return;
      } else {
        const best = G.Bola.opsiUmpan(M, p);
        if (best) { q = best.q; jenis = best.jenis; }
        if (R.jenis === 'gawang' && (!best || best.jenis !== 'pendek' || best.skor < .6)) { q = M.tim[R.tim].pemain[G.rint(5, 10)]; jenis = 'lambung'; }
      }
    }
    if (!q) q = M.tim[R.tim].pemain.filter(o => o !== p && o.pos !== 'GK').sort((a, c) => G.jarak(a, p) - G.jarak(c, p))[0];
    if (R.jenis === 'lemparan') jenis = 'lempar';
    G.Bola.umpan(M, p, q, jenis);
    if (M.manusia && R.tim === 0 && q.pos !== 'GK') M.ctrl = q;
  };

  // ---------- peristiwa ----------
  Lg.diKuasai = function (M, p) {
    if (M.manusia && p.tim === 0 && p.pos !== 'GK') M.ctrl = p;
    if (M.antri && M.ctrl === p) { const a = M.antri; M.antri = null; Lg.aksi(M, a.aksi, a.w, a.kuat); }
  };
  Lg.pelanggaran = function (M, d, c) {
    if (M.fase !== 'main') return;
    c.jatuhT = 1.3; c.jatuhArah = Math.random() < .5 ? 1 : -1;
    G.bunyi.peluit(1);
    const dapat = c.tim;
    if (G.dalamKotak(M, 1 - dapat, c.x, c.y)) { G.hud.pesan(G.t('penalti'), 1.6, 'besar'); M.fase = 'tunda'; M.faseT = 0; M.tunda = () => Lg.restart(M, 'penalti', dapat); }
    else { G.hud.pesan(G.t('pelanggaran'), 1.3, 'kecil'); M.fase = 'tunda'; M.faseT = 0; const x = c.x, y = c.y; M.tunda = () => Lg.restart(M, 'bebas', dapat, x, y); }
    M.bola.pemilik = null; M.bola.vx *= .2; M.bola.vy *= .2;
  };
  Lg.sliding = function (M, p, a) {
    if (p.slideCd > 0 || p.slideT > 0 || p.jatuhT > 0) return;
    p.slideT = .55; p.slideCd = 1.4; p.slideKena = false; p.arah = a; const v = Math.max(7.5, Math.hypot(p.vx, p.vy) + 2.5); p.slideVx = Math.cos(a) * v; p.slideVy = Math.sin(a) * v;
  };
  function cekSliding(M) {
    const b = M.bola;
    for (const p of M.pemain) {
      if (p.slideT <= 0 || p.slideKena) continue;
      for (const o of M.tim[1 - p.tim].pemain) {
        if (o.jatuhT > 0 || Math.hypot(o.x - p.x, o.y - p.y) > .95) continue;
        p.slideKena = true;
        if (b.pemilik === o) {
          if (Math.hypot(b.x - p.x, b.y - p.y) < 1 && Math.random() < .5 + p.st.def / 400) {
            b.pemilik = null; const a = p.arah + G.rnd(-.5, .5); b.vx = Math.cos(a) * 7; b.vy = Math.sin(a) * 7; b.vz = .4; b.last = p; b.lastTim = p.tim; b.jenis = 'lepas'; o.jatuhT = .6; o.kickCd = .6;
          } else if (Math.random() < .8) { Lg.pelanggaran(M, p, o); return; }
        }
        break;
      }
    }
  }
  Lg.cetakGol = function (M, tim) {
    const b = M.bola, sendiri = b.lastTim !== tim, pencetak = b.last;
    M.skor[tim]++;
    M.gol.push({ tim, nama: pencetak ? pencetak.nama + (sendiri ? ' (' + G.t('bd') + ')' : '') : '?', menit: Lg.menit(M) + 1 });
    if (b.jenis === 'tembak' && b.tembakTim === tim && !b.tembakDihitung) { M.stat.tepat[tim]++; b.tembakDihitung = true; }
    M.fase = 'gol'; M.faseT = 0; M.timGol = tim; M.pencetak = sendiri ? null : pencetak; M.semangat = 1;
    if (pencetak && !sendiri) pencetak.rayaT = 4;
    G.bunyi.gol(); G.bunyi.peluit(1);
    G.hud.pesan(G.t('gol'), 2.8, 'gol', pencetak ? pencetak.nama + (sendiri ? ' · ' + G.t('bdPanjang') : '') + ' · ' + (Lg.menit(M) + 1) + "'" : '');
  };
  function cekGaris(M, px, py, pz) {
    const b = M.bola; if (b.diJaring || (b.pemilik && b.pemilik.pos === 'GK')) return;
    for (const ujung of [0, L]) {
      const lewat = ujung === 0 ? (px >= 0 && b.x < 0) : (px <= L && b.x > L);
      if (!lewat) continue;
      const f = (ujung - px) / ((b.x - px) || 1e-6), cy = py + (b.y - py) * f, cz = pz + (b.z - pz) * f, rel = Math.abs(cy - 34);
      const timSerang = M.tim[0].arah > 0 ? (ujung === L ? 0 : 1) : (ujung === 0 ? 0 : 1);
      if (rel < 3.66 - G.R && cz < 2.44 - G.R) {
        b.diJaring = true; if (b.pemilik) { b.last = b.pemilik; b.lastTim = b.pemilik.tim; b.pemilik = null; b.vx = (ujung ? 1 : -1) * 3; }
        G.bunyi.jaring(); Lg.cetakGol(M, timSerang); return;
      }
      if (rel < 3.66 + G.R + .06 && cz < 2.44 + G.R + .06) {
        if (rel > 3.66 - G.R - .06) { b.vx = -b.vx * .6; b.vy += (cy > 34 ? 1 : -1) * 2.5; }
        else { b.vz = -Math.abs(b.vz) * .5 - 1; b.vx = -b.vx * .45; }
        b.x = ujung ? L - .2 : .2; b.putusan = null; G.bunyi.tiang(); G.hud.pesan(G.t('tiang'), 1.1, 'kecil'); return;
      }
      if (b.pemilik) { b.last = b.pemilik; b.lastTim = b.pemilik.tim; b.pemilik = null; }
      const timBertahan = 1 - timSerang;
      if (b.jenis === 'tembak' && !b.tembakDihitung) b.tembakDihitung = true;
      keluar(M, b.lastTim === timBertahan ? 'pojok' : 'gawang', b.lastTim === timBertahan ? timSerang : timBertahan, cy, cy);
      return;
    }
    if (b.y < -.35 || b.y > W + .35) {
      if (b.pemilik) { b.last = b.pemilik; b.lastTim = b.pemilik.tim; b.pemilik = null; }
      keluar(M, 'lemparan', 1 - b.lastTim, b.x, b.y);
    }
  }
  function keluar(M, jenis, tim, x, y) { M.fase = 'keluar'; M.faseT = 0; M.keluar = { jenis, tim, x: jenis === 'lemparan' ? x : x, y }; }
  function akhirBabak(M) {
    if (M.babak === 1) { M.fase = 'jeda'; M.faseT = 0; G.bunyi.peluit(2); G.hud.pesan(G.t('babak1'), 3, 'besar', M.skor[0] + ' – ' + M.skor[1]); }
    else { M.fase = 'selesai'; M.faseT = 0; G.bunyi.peluit(3); G.hud.pesan(G.t('selesai'), 3, 'besar', M.skor[0] + ' – ' + M.skor[1]); }
    M.bola.pemilik = null;
  }
  Lg.soalMomen = function (M) {
    M.fase = 'soal'; G.bunyi.peluit(1);
    G.layar.soal({ judul: G.t('soalMomen'), hadiah: G.t('hadiahMomen'), level: M.o.soal, nama: M.ctrl ? M.ctrl.nama : M.klub[0].pemain[9].nama }, benar => {
      M.soal.total++;
      if (benar) {
        M.soal.benar++; M.boost[0] = 25; M.superIsi += .5;
        if (M.superIsi >= 1) { M.superIsi = 0; M.superSiap = true; G.hud.toast(G.t('superSiap'), true); } else G.hud.toast(G.t('semangatKamu'), true);
      } else { M.boost[1] = 15; G.hud.toast(G.t('semangatLawan')); }
      M.fase = 'main'; M.faseT = 0;
    });
  };

  // ---------- kendali manusia ----------
  function tembakManusia(M, c, w, kuat) {
    let aimY = w && w.m > .2 ? 34 + G.clamp(w.y, -1, 1) * 2.9 : 34 + (c.y < 34 ? 1.9 : -1.9);
    const aimZ = .35 + kuat * 1.3;
    let tekan = 99; for (const o of M.tim[1 - c.tim].pemain) tekan = Math.min(tekan, G.jarak(o, c));
    const sup = M.superSiap; if (sup) { M.superSiap = false; M.superDipakai++; G.hud.pesan(G.t('super'), 1.4, 'kecil'); }
    G.Bola.tembak(M, c, aimY, aimZ, sup ? .85 : kuat, { super: sup, tekanan: tekan < 1.4 ? 1 : 0 });
  }
  Lg.aksi = function (M, jenis, w, kuat = .7) {
    const c = M.ctrl, b = M.bola; if (!c) return;
    if (M.fase === 'mati') { Lg.ambilRestart(M, jenis, w, kuat); return; }
    if (b.pemilik !== c) return;
    if (jenis === 'tembak') { tembakManusia(M, c, w, kuat); return; }
    const q = G.Bola.pilihArah(M, c, w); if (!q) return;
    G.Bola.umpan(M, c, q, jenis);
    if (q.pos !== 'GK') M.ctrl = q;
  };
  function gantiPemain(M) {
    const b = M.bola, bx = b.x + b.vx * .3, by = b.y + b.vy * .3;
    let best = null, bd = 1e9;
    for (const p of M.tim[0].pemain) { if (p === M.ctrl || p.pos === 'GK') continue; const d = Math.hypot(p.x - bx, p.y - by); if (d < bd) { bd = d; best = p; } }
    if (best) { M.ctrl = best; M.gantiCd = .9; }
  }
  function autoGanti(M, dt) {
    M.gantiCd -= dt; if (M.gantiCd > 0 || !M.ctrl) return;
    const b = M.bola; if (b.pemilik && b.pemilik.tim === 0) return; if (!b.pemilik && b.tujuan && b.tujuan.tim === 0) return;
    const bx = b.x + b.vx * .3, by = b.y + b.vy * .3; let n = null, dn = 1e9;
    for (const p of M.tim[0].pemain) { if (p.pos === 'GK') continue; const d = Math.hypot(p.x - bx, p.y - by); if (d < dn) { dn = d; n = p; } }
    const dc = Math.hypot(M.ctrl.x - bx, M.ctrl.y - by);
    if (n && n !== M.ctrl && (dc > dn + 7 || (dc > 15 && dn < dc - 3))) { M.ctrl = n; M.gantiCd = 1; }
  }
  function kendali(M, dt) {
    const c = M.ctrl; if (!c || !M.manusia) return;
    const I = G.inp, w = G.stikKeDunia(I.x, I.y), b = M.bola;
    if (M.fase === 'mati') {
      const R = M.restart; if (!R || R.tim !== 0 || !R.siap) return;
      if (w.m > .25 && R.jenis !== 'kickoff') c.arah = Math.atan2(w.y, w.x);
      if (I.tekan.has('umpan')) Lg.aksi(M, 'pendek', w);
      else if (I.tekan.has('terobos')) Lg.aksi(M, 'terobos', w);
      else if (I.tekan.has('lambung')) Lg.aksi(M, 'lambung', w);
      else if (I.tekan.has('tembak')) { M.mengisi = true; M.isi = 0; }
      if (M.mengisi) { M.isi = Math.min(1, M.isi + dt * 1.15); if (!I.tahan.tembak) { M.mengisi = false; Lg.aksi(M, 'tembak', w, Math.max(.25, M.isi)); } }
      return;
    }
    if (M.fase !== 'main' && M.fase !== 'keluar') return;
    const vm = G.AI.vmax(M, c);
    c.lariAktif = !!I.tahan.lari && c.stamina > .05 && w.m > .2;
    if (w.m > .15) { c.tx = c.x + w.x * 4; c.ty = c.y + w.y * 4; c.mau = vm * (c.lariAktif ? 1 : .7) * Math.max(.4, w.m); }
    else { c.tx = c.x; c.ty = c.y; c.mau = 0; }
    if (M.fase !== 'main') return;
    if (b.pemilik === c) {
      if (I.tekan.has('umpan')) Lg.aksi(M, 'pendek', w);
      else if (I.tekan.has('terobos')) Lg.aksi(M, 'terobos', w);
      else if (I.tekan.has('lambung')) Lg.aksi(M, 'lambung', w);
      if (I.tekan.has('tembak')) { M.mengisi = true; M.isi = 0; }
      if (M.mengisi) { M.isi = Math.min(1, M.isi + dt * 1.15); if (!I.tahan.tembak) { M.mengisi = false; Lg.aksi(M, 'tembak', w, Math.max(.22, M.isi)); } }
    } else {
      M.mengisi = false;
      const datang = !b.pemilik && b.tujuan === c;
      if (datang) {
        if (w.m <= .15) { const k = Math.hypot(b.x - c.x, b.y - c.y) < 7; c.tx = k ? b.x : b.tx; c.ty = k ? b.y : b.ty; c.mau = vm; }
        for (const a of ['umpan', 'terobos', 'lambung', 'tembak']) if (I.tekan.has(a)) M.antri = { aksi: a === 'umpan' ? 'pendek' : a, w, kuat: .72, t: 1.4 };
      } else {
        if (I.tahan.umpan) {
          const tg = b.pemilik || b; c.tx = tg.x + (b.pemilik ? 0 : b.vx * .3); c.ty = tg.y + (b.pemilik ? 0 : b.vy * .3); c.mau = vm * .96;
          const o = b.pemilik; if (o && o.tim !== c.tim && !o.pegang && G.jarak(o, c) < 1.5 && c.tekelCd <= 0) G.Bola.tekel(M, c, o);
        }
        if (I.tekan.has('tembak')) Lg.sliding(M, c, w.m > .2 ? Math.atan2(w.y, w.x) : Math.atan2(b.y - c.y, b.x - c.x));
        if (I.tekan.has('terobos') || I.tekan.has('ganti')) gantiPemain(M);
      }
    }
    if (M.antri) { M.antri.t -= dt; if (M.antri.t <= 0) M.antri = null; }
    autoGanti(M, dt);
  }

  // ---------- gerak ----------
  function gerak(M, dt) {
    const b = M.bola;
    for (const p of M.pemain) {
      if (p.jatuhT > 0) { p.vx *= .85; p.vy *= .85; p.x += p.vx * dt; p.y += p.vy * dt; continue; }
      if (p.slideT > 0) { p.x += p.slideVx * dt; p.y += p.slideVy * dt; const k = 1 - 2.2 * dt; p.slideVx *= k; p.slideVy *= k; p.vx = p.slideVx; p.vy = p.slideVy; continue; }
      if (p.diveT > 0) continue;
      const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
      let sp = d < .08 ? 0 : Math.min(p.mau, d * 3);
      if (p.stunT > 0) sp *= .4; if (b.pemilik === p) sp *= .93;
      const dvx = d > 0 ? dx / d * sp : 0, dvy = d > 0 ? dy / d * sp : 0;
      const a = Math.min(1, dt * (b.pemilik === p ? 5 : 7));
      p.vx += (dvx - p.vx) * a; p.vy += (dvy - p.vy) * a;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const kec = Math.hypot(p.vx, p.vy);
      if (kec > .35) { const rate = b.pemilik === p ? (p === M.ctrl ? 9 : p.lariAktif ? 5 : 7) : 14; p.arah += G.clamp(G.sudut(Math.atan2(p.vy, p.vx) - p.arah), -rate * dt, rate * dt); }
      else if (b.pemilik !== p) p.arah += G.clamp(G.sudut(Math.atan2(b.y - p.y, b.x - p.x) - p.arah), -4 * dt, 4 * dt);
      p.ph += kec * dt * 1.9;
      if (p.lariAktif && kec > 5) p.stamina = Math.max(0, p.stamina - dt * .07); else p.stamina = Math.min(1, p.stamina + dt * .025);
      if (p !== M.ctrl && p !== b.pemilik) p.lariAktif = false;
      p.x = G.clamp(p.x, -3, L + 3); p.y = G.clamp(p.y, -3, W + 3);
    }
    // saling dorong
    const ps = M.pemain;
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], c = ps[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy);
      if (d < .72 && d > 1e-4) { const k = (.72 - d) / 2 / d; a.x -= dx * k; a.y -= dy * k; c.x += dx * k; c.y += dy * k; }
    }
  }
  function waktuPemain(M, dt) {
    for (const p of M.pemain) {
      p.kickCd = Math.max(0, p.kickCd - dt); p.kickT = Math.max(0, p.kickT - dt); p.slideT = Math.max(0, p.slideT - dt); p.slideCd = Math.max(0, p.slideCd - dt);
      p.stunT = Math.max(0, p.stunT - dt); p.jatuhT = Math.max(0, p.jatuhT - dt); p.rayaT = Math.max(0, p.rayaT - dt); p.tekelT = Math.max(0, p.tekelT - dt); p.tekelCd = Math.max(0, p.tekelCd - dt);
    }
  }
  function selebrasi(M, dt) {
    const tg = M.timGol;
    for (const p of M.pemain) {
      if (p === M.pencetak) { p.tx = G.gxLawan(M, tg) - M.tim[tg].arah * 4; p.ty = p.y < 34 ? 3 : W - 3; p.mau = 6.5; }
      else if (p.tim === tg && M.pencetak && p.pos !== 'GK') { p.tx = M.pencetak.x - Math.cos(p.i) * 2; p.ty = M.pencetak.y - Math.sin(p.i) * 2; p.mau = 6; if (G.jarak(p, M.pencetak) < 4) p.rayaT = .3; }
      else { const [tx, ty] = G.AI.bentuk(M, p, false, L / 2, W / 2); p.tx = tx; p.ty = ty; p.mau = 2.2; }
    }
  }

  Lg.langkah = function (M, dt) {
    M.t += dt; M.faseT += dt;
    M.boost[0] = Math.max(0, M.boost[0] - dt); M.boost[1] = Math.max(0, M.boost[1] - dt);
    M.semangat = Math.max(0, M.semangat - dt * .22);
    if (M.fase === 'soal' || M.fase === 'tamat') return;
    waktuPemain(M, dt);
    if (M.fase === 'penalti') { G.Pen.langkah(M, dt); gerak(M, dt); return; }
    kendali(M, dt);
    const b = M.bola, F = M.fase;
    if (F === 'main' || F === 'keluar') { G.AI.pikir(M, dt); G.AI.kiper(M, dt); }
    else if (F === 'mati') langkahRestart(M, dt);
    else if (F === 'gol') selebrasi(M, dt);
    else for (const p of M.pemain) { p.mau = Math.min(p.mau, 2); }
    gerak(M, dt);
    const px = b.x, py = b.y, pz = b.z;
    G.Bola.fisika(M, dt);
    if (F === 'main') {
      G.Bola.rebut(M); cekSliding(M);
      if (M.fase === 'main') cekGaris(M, px, py, pz);
      if (b.pemilik) M.stat.kuasa[b.pemilik.tim] += dt;
    }
    if (F === 'keluar' && M.faseT > .9) { const k = M.keluar; M.keluar = null; Lg.restart(M, k.jenis, k.tim, k.x, k.y); }
    if (F === 'tunda' && M.faseT > 1.4) { const f = M.tunda; M.tunda = null; f(); }
    if (F === 'gol' && M.faseT > 3.6) { if (M.mode === 'demo' && M.skor[0] + M.skor[1] > 6) { M.skor = [0, 0]; } Lg.restart(M, 'kickoff', 1 - M.timGol); }
    if (F === 'jeda' && M.faseT > 3.2) { M.babak = 2; for (const T of M.tim) T.arah *= -1; Lg.restart(M, 'kickoff', 1); G.hud.pesan(G.t('babak2'), 1.8, 'kecil'); }
    if (F === 'selesai' && M.faseT > 2.8) { if (M.mode === 'demo') { M.waktu = 0; M.babak = 1; M.skor = [0, 0]; M.gol = []; for (const T of M.tim) T.arah = T.i ? -1 : 1; Lg.restart(M, 'kickoff', 0); } else { M.fase = 'tamat'; G.layar.hasil(M); } }
    // jam
    if (F === 'main' || F === 'mati' || F === 'keluar') {
      M.waktu += dt;
      const batas = M.panjangBabak * M.babak;
      if (M.waktu >= batas && (F === 'main' || M.waktu > batas + 8)) akhirBabak(M);
    }
    if (M.fase === 'main' && M.manusia && M.soal.i < M.soal.jadwal.length && M.waktu >= M.soal.jadwal[M.soal.i] * 2 * M.panjangBabak) { M.soal.i++; Lg.soalMomen(M); }
    // sorak penonton
    M.sorakT -= dt;
    if (M.sorakT <= 0) { M.sorakT = .25; const dekat = Math.min(Math.hypot(b.x, b.y - 34), Math.hypot(L - b.x, b.y - 34)); G.bunyi.sorak(.22 + (dekat < 22 ? .3 : 0) + M.semangat * .5); }
  };

  // ---------- kamera & gambar ----------
  Lg.kamera = function (M, dt) {
    if (M.fase === 'penalti') { G.Pen.kamera(M, dt); return; }
    const K = G.kam, b = M.bola, lebar = K.W >= K.H ? (K.H < 520 ? (G.set.kamera === 'dekat' ? 21 : 27) : (G.set.kamera === 'dekat' ? 28 : 38)) : 18;
    const lx = G.clamp(b.x + b.vx * .45, lebar * .32, L - lebar * .32), ly = G.clamp(b.y * .7 + 34 * .3 + b.vy * .2, 20, 50);
    G.kamIkut({ lx, ly, lz: 0, yaw: -Math.PI / 2, pitch: K.W >= K.H ? .4 : .55, dist: 70, lebar, cy: K.W >= K.H ? .55 : .48 }, dt, 3);
  };
  Lg.gambar = function (ctx, M, t) {
    G.lapangan.gambarLatar(ctx, t, M.semangat);
    G.lapangan.gambarRumput(ctx);
    G.lapangan.gambarGaris(ctx);
    const ents = G.lapangan.entitasGawang(), o = {};
    for (const p of M.pemain) { G.proj(p.x, p.y, 0, o); if (o.ok) ents.push({ d: o.d, gambar: c => G.gambarStik(c, p, t) }); }
    G.proj(M.bola.x, M.bola.y, 0, o); if (o.ok) ents.push({ d: o.d - .05, gambar: c => G.Bola.gambar(c, M) });
    ents.sort((a, c) => c.d - a.d);
    for (const e of ents) e.gambar(ctx);
  };
})();
