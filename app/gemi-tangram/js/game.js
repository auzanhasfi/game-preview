/* Gemi Tangram: mesin keadaan menu -> peta -> main -> reveal -> hasil. */
(function () {
  'use strict';
  const G = TGGEO, D = TGDATA, I = TGI18N, A = TGAUDIO, ART = TGART;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const WAR = ['#f28b82', '#7fb7e6', '#f6c667', '#8fd3a4', '#c7a2e8', '#ff9fc0', '#6fd0cc']; // ikut G.SET
  const GELAP = ['#c9564d', '#4a86bd', '#c99a2e', '#4fa56c', '#9468c2', '#d06a90', '#35a09b'];
  const OFS = [4, 2.75];                       // pusat zon siluet dalam papan
  const DULANG = [[1.7, 7.1], [4.5, 7.1], [6.85, 7.0], [1.2, 9.7], [3.1, 9.7], [4.9, 9.8], [6.75, 9.7]]; // kedudukan awal ikut G.SET
  const SNAP = 0.62;
  const W = 8, H = 11;

  const S = { keadaan: 'menu', tahap: 0, potong: [], slot: [], kep: [], dipilih: -1, petunjuk: 0, slotPetunjuk: -1, t0: 0, ofsMasa: 0, beku: 0, bintang: 0, tamat: false, drag: null, ujiPeta: false };
  let progres = { b: {} };
  try { const p = JSON.parse(localStorage.getItem('tg.v1') || 'null'); if (p && p.b) progres = p; } catch (e) {}
  const simpan = () => { try { localStorage.setItem('tg.v1', JSON.stringify(progres)); } catch (e) {} };
  const bintangDi = i => progres.b[D.SIL[i].id] || 0;
  const terbuka = i => i === 0 || bintangDi(i - 1) > 0;
  const svg = $('#papan');
  let gTray, gSil, gHint, gPotong, gKep, gLabel, timer = null, bubbleT = 0;
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a || {}) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const pts = poly => poly.map(p => p[0].toFixed(3) + ',' + p[1].toFixed(3)).join(' ');
  const pec = t => G.PECAHAN[t][0] + '/' + G.PECAHAN[t][1];
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

  /* ---------- paparan skrin ---------- */
  function tunjuk(nama) {
    S.keadaan = nama === 'hasil' ? 'hasil' : nama;
    ['menu', 'peta', 'main'].forEach(n => { $('#' + n).hidden = (n !== (nama === 'hasil' || nama === 'reveal' ? 'main' : nama)); });
    $('#hasil').hidden = nama !== 'hasil';
    $('#btnBack').hidden = nama === 'menu';
    if (nama !== 'main' && nama !== 'reveal' && nama !== 'hasil') { clearInterval(timer); }
  }
  function ikonBar() {
    $('#btnBack').innerHTML = ART.icon('back'); $('#btnBack').setAttribute('aria-label', I.t('kembali'));
    $('#btnSnd').innerHTML = ART.icon(A.mute ? 'sndOff' : 'sndOn'); $('#btnSnd').setAttribute('aria-label', I.t('bunyi'));
    $('#btnLang').textContent = I.loc === 'ms' ? 'BM' : 'ID'; $('#btnLang').setAttribute('aria-label', I.t('tukar'));
    $('#btnPutar').innerHTML = ART.icon('putar') + '<span>' + I.t('putar') + '</span>';
    $('#btnBalik').innerHTML = ART.icon('balik') + '<span>' + I.t('balik') + '</span>';
    $('#btnPet').innerHTML = ART.icon('petunjuk') + '<span>' + I.t('petunjuk') + '</span>';
    $('#btnUlang').innerHTML = ART.icon('restart') + '<span class="sr">' + I.t('ulang') + '</span>'; $('#btnUlang').setAttribute('aria-label', I.t('ulang'));
    $('#icJam').innerHTML = ART.icon('jam'); $('#icPet').innerHTML = ART.icon('petunjuk');
    $('#btnMula').innerHTML = ART.icon('play') + '<span>' + I.t('mula') + '</span>';
    $('#btnNext').innerHTML = '<span>' + I.t('seterusnya') + '</span>' + ART.icon('next');
    $('#btnUlang2').innerHTML = ART.icon('restart') + '<span>' + I.t('main_lagi') + '</span>';
    $('#btnPeta').innerHTML = ART.icon('home') + '<span>' + I.t('ke_peta') + '</span>';
    $$('[data-loc]').forEach(b => { b.textContent = I.t(b.dataset.loc === 'ms' ? 'bm' : 'id'); b.setAttribute('aria-pressed', String(b.dataset.loc === I.loc)); });
    $$('[data-t]').forEach(e => { e.textContent = I.t(e.dataset.t); });
  }
  function maskot(id, mood) { $(id).innerHTML = ART.gemi(mood); }
  function bual(teks, mood, ms) {
    $('#bubble').textContent = teks; if (mood) maskot('#mMain', mood);
    clearTimeout(bubbleT); bubbleT = setTimeout(() => maskot('#mMain', 'senang'), ms || 2200);
  }
  function renderPeta() {
    const g = $('#petaIsi'); g.innerHTML = '';
    D.SIL.forEach((s, i) => {
      const b = document.createElement('button'), ok = terbuka(i), st = bintangDi(i);
      b.className = 'lv' + (st ? ' selesai' : ''); b.dataset.uji = 'sil-' + i; b.disabled = !ok;
      b.setAttribute('aria-label', I.t('aria_siluet', { n: I.nama(s), b: st }) + (ok ? '' : '. ' + I.t('terkunciPeta')));
      const mini = '<svg viewBox="-3.1 -3.1 6.2 6.2" aria-hidden="true">' + s.slot.map(q => {
        const ix = G.SET.indexOf(q.t); const col = st ? WAR[(ix >= 0 ? ix : 0)] : '#c9bda4';
        return '<polygon points="' + pts(G.poli(q.t, q.k, q.f, q.c)) + '" fill="' + (st ? colTipe(q.t) : '#cdc1a8') + '" stroke="#fdf7ea" stroke-width=".07" stroke-linejoin="round"/>';
      }).join('') + '</svg>';
      b.innerHTML = '<span class="mini-s">' + mini + '</span><span class="lv-n">' + (i + 1) + '. ' + I.nama(s) + '</span><span class="mini-b">' +
        [1, 2, 3].map(n => ART.star(n <= st)).join('') + '</span>' + (ok ? '' : '<span class="kunci-i">' + ART.icon('lock') + '</span>');
      b.onclick = () => { A.klik(); mulaTahap(i); };
      g.appendChild(b);
    });
  }
  const WARNA_TIPE = { L: WAR[0], M: WAR[2], S: WAR[3], Q: WAR[5], P: WAR[6] };
  function colTipe(t) { return WARNA_TIPE[t]; }

  /* ---------- tahap ---------- */
  function mulaTahap(i) {
    A.init(); clearInterval(timer); clearTimeout(bubbleT);
    S.tahap = i; S.tamat = false; S.dipilih = -1; S.petunjuk = 0; S.slotPetunjuk = -1; S.drag = null; S.ofsMasa = 0; S.beku = 0;
    const sil = D.SIL[i];
    // slot dalam koordinat papan; kunci awal = kepingan terbesar dahulu
    S.slot = sil.slot.map((q, n) => ({ n, t: q.t, k: q.k, f: q.f, c: [q.c[0] + OFS[0], q.c[1] + OFS[1]], isi: -1, awal: false, poli: null }));
    S.slot.forEach(s => { s.poli = G.poli(s.t, s.k, s.f, s.c); });
    S.kep = G.SET.map((t, id) => ({ id, t, r: 0, f: 0, x: DULANG[id][0], y: DULANG[id][1], terkunci: false, e: null }));
    const urut = S.slot.slice().sort((a, b) => G.LUAS[b.t] - G.LUAS[a.t] || a.n - b.n);
    urut.slice(0, sil.kunci).forEach(s => { const p = S.kep.find(k => k.t === s.t && !k.terkunci); p.terkunci = true; s.isi = p.id; s.awal = true; });
    // pose awal: tepat ikut slot (tahap 1-3), selebihnya diputar/dibalik
    const guna = new Set(); const li = i;
    S.kep.forEach(p => {
      if (p.terkunci) return;
      const sl = S.slot.find(s => s.t === p.t && s.isi < 0 && !guna.has(s.n)); guna.add(sl.n);
      const off = li < 3 ? 0 : (li * 3 + p.id * 5 + 1) % 8 || 3;
      p.r = sl.k + off; p.f = (p.t === 'P' && li >= 5) ? (sl.f ^ ((li + p.id) % 2 ? 1 : 0)) : sl.f;
      if (li < 3) { p.r = sl.k; p.f = sl.f; }
    });
    tunjuk('main'); S.keadaan = 'main';
    bina(); ikonBar(); $('#namaSil').textContent = (i + 1) + '. ' + I.nama(sil);
    maskot('#mMain', 'senang'); segar();
    $('#bubble').textContent = sil.kunci ? I.t('mulaKunci', { k: sil.kunci }) : I.t('mulaSil', { n: I.nama(sil) });
    S.t0 = performance.now(); timer = setInterval(tik, 250); tik();
  }
  function masa() { return ((S.beku || performance.now()) - S.t0) / 1000 + S.ofsMasa; }
  function tik() { $('#vMasa').textContent = fmt(masa()); }
  function bina() {
    svg.innerHTML = '';
    gTray = el('g', {}, svg); gSil = el('g', {}, svg); gHint = el('g', {}, svg); gPotong = el('g', {}, svg); gKep = el('g', {}, svg); gLabel = el('g', { 'pointer-events': 'none' }, svg);
    el('rect', { x: 0.15, y: 5.75, width: W - 0.3, height: 5.1, rx: 0.35, class: 'dulang' }, gTray);
    const sil = D.SIL[S.tahap];
    S.slot.forEach(s => {
      const p = el('polygon', { points: pts(s.poli), class: 'slot' + (sil.garis ? ' garis' : '') }, gSil); s.e = p;
      if (s.isi >= 0) isiSlot(s, s.isi, false);
    });
    S.kep.forEach(p => { if (!p.terkunci) buatKep(p); });
  }
  function buatKep(p) {
    const g = el('g', { class: 'kep', 'data-id': p.id }, gKep); p.e = g;
    const poly = pts(G.CANON[p.t]);
    el('polygon', { points: poly, class: 'isi', fill: WAR[p.id], stroke: GELAP[p.id] }, g);
    el('polygon', { points: poly, class: 'hit' }, g);
    pose(p);
  }
  function pose(p) { if (p.e) p.e.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) rotate(' + (p.r * 45) + 'deg) scale(' + (p.f ? -1 : 1) + ',1)'; }
  function isiSlot(s, id, anim) {
    s.isi = id; s.e.style.fill = WAR[id]; s.e.setAttribute('class', 'slot terisi' + (anim ? ' pop' : '') + (D.SIL[S.tahap].garis ? ' garis' : ''));
  }
  function segar() {
    const n = S.slot.filter(s => s.isi >= 0).length;
    $('#vKep').textContent = n + '/' + S.slot.length; $('#vPet').textContent = S.petunjuk;
    $$('.kep').forEach(e => e.classList.toggle('sel', +e.dataset.id === S.dipilih));
    S.kep.forEach(p => { if (p.e) p.e.classList.toggle('cadang', S.slotPetunjuk >= 0 && !p.terkunci && p.t === S.slot[S.slotPetunjuk].t); });
  }

  /* ---------- interaksi ---------- */
  function keSvg(e) { const m = svg.getScreenCTM().inverse(), p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m); return [p.x, p.y]; }
  svg.addEventListener('pointerdown', e => {
    if (S.keadaan === 'reveal') { skipReveal(); return; }
    if (S.keadaan !== 'main') return;
    const g = e.target.closest && e.target.closest('.kep'); if (!g) return;
    const p = S.kep[+g.dataset.id]; if (p.terkunci) return;
    e.preventDefault(); A.init(); try { svg.setPointerCapture(e.pointerId); } catch (x) {}
    const [px, py] = keSvg(e);
    S.drag = { id: p.id, dx: p.x - px, dy: p.y - py, sx: e.clientX, sy: e.clientY, gerak: false, sudah: S.dipilih === p.id };
    gKep.appendChild(p.e); p.e.classList.add('seret'); S.dipilih = p.id; A.ambil(); segar();
  });
  svg.addEventListener('pointermove', e => {
    const d = S.drag; if (!d) return; const p = S.kep[d.id];
    if (!d.gerak && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) d.gerak = true;
    if (!d.gerak) return;
    const [px, py] = keSvg(e); p.x = Math.min(W - 0.2, Math.max(0.2, px + d.dx)); p.y = Math.min(H - 0.2, Math.max(0.2, py + d.dy)); pose(p);
  });
  function akhirSeret(e) {
    const d = S.drag; if (!d) return; S.drag = null; const p = S.kep[d.id]; p.e.classList.remove('seret'); A.lepas();
    if (!d.gerak) { if (d.sudah) putar(1); return; }
    cubaSnap(p, true);
  }
  svg.addEventListener('pointerup', akhirSeret); svg.addEventListener('pointercancel', akhirSeret);

  function kPadan(p) { return ((p.r % 8) + 8) % 8; }
  function cubaSnap(p, lapor) {
    let terbaik = null, dekat = null;
    for (const s of S.slot) {
      if (s.isi >= 0 || s.t !== p.t) continue;
      const m = G.padan(p.t, kPadan(p), p.f, [p.x, p.y], s);
      if (m.d < SNAP) { if (m.ok && (!terbaik || m.d < terbaik.d)) terbaik = { s, d: m.d }; if (!dekat || m.d < dekat.d) dekat = { s, d: m.d }; }
    }
    if (terbaik) { kunciKe(p, terbaik.s, true); return true; }
    if (lapor && dekat) { A.salah(); bual(p.t === 'Q' ? I.t('hampir2') : I.t('hampir'), 'oops', 2600); p.e.classList.add('goyang'); setTimeout(() => p.e && p.e.classList.remove('goyang'), 300); }
    return false;
  }
  function kunciKe(p, s, bunyi) {
    p.terkunci = true; p.x = s.c[0]; p.y = s.c[1]; pose(p);
    const n = S.slot.filter(z => z.isi >= 0).length + 1; s.isi = p.id; // tandakan serta-merta
    if (S.dipilih === p.id) S.dipilih = -1;
    if (S.slotPetunjuk === s.n) { S.slotPetunjuk = -1; gHint.innerHTML = ''; }
    setTimeout(() => { isiSlot(s, p.id, true); if (p.e) { p.e.remove(); p.e = null; } }, 170);
    if (bunyi) { A.snap(n - 1); bual(I.t('snap', { p: I.t('nama_' + p.t), f: pec(p.t) }), 'gembira', 2600); }
    segar();
    if (S.slot.every(z => z.isi >= 0)) menang();
  }
  function putar(n) {
    const p = S.kep[S.dipilih]; if (!p || p.terkunci) { bual(I.t('pilihDulu'), 'fikir'); return; }
    p.r += n; pose(p); A.putar(); cubaSnap(p, false);
  }
  function balik() {
    const p = S.kep[S.dipilih]; if (!p || p.terkunci) { bual(I.t('pilihDulu'), 'fikir'); return; }
    if (p.t !== 'P') { bual(I.t('tiadaBalik'), 'fikir'); A.klik(); return; }
    p.f ^= 1; pose(p); A.balik(); cubaSnap(p, false);
  }
  function cadang() {
    if (S.keadaan !== 'main') return;
    A.petunjuk();
    if (S.slotPetunjuk < 0 || S.slot[S.slotPetunjuk].isi >= 0) {
      const bebas = S.slot.filter(s => s.isi < 0).sort((a, b) => G.LUAS[b.t] - G.LUAS[a.t] || a.n - b.n);
      if (!bebas.length) return; S.slotPetunjuk = bebas[0].n; S.petunjuk++;
    }
    const s = S.slot[S.slotPetunjuk]; gHint.innerHTML = ''; el('polygon', { points: pts(s.poli), class: 'petunjuk', stroke: WAR[G.SET.findIndex(t => t === s.t)] }, gHint);
    bual(I.t('cadang', { p: I.t('nama_' + s.t) }), 'fikir', 3500); segar();
  }
  function ulang() { A.klik(); mulaTahap(S.tahap); }

  /* ---------- menang, reveal, hasil ---------- */
  let revT = [];
  function menang() {
    S.tamat = true; S.keadaan = 'reveal'; S.beku = performance.now(); clearInterval(timer); tik();
    const t = masa(), par = D.SIL[S.tahap].par;
    const rugi = (t > par ? 1 : 0) + (t > 2 * par ? 1 : 0) + Math.min(2, S.petunjuk);
    S.bintang = Math.max(1, 3 - rugi);
    if (S.bintang > bintangDi(S.tahap)) { progres.b[D.SIL[S.tahap].id] = S.bintang; simpan(); }
    gHint.innerHTML = ''; maskot('#mMain', 'gembira'); $('#bubble').textContent = I.t('siap', { n: I.nama(D.SIL[S.tahap]) });
    setTimeout(() => A.menang(), 250);
    // reveal: setiap kepingan bercahaya + label pecahan, besar dahulu
    const urut = S.slot.slice().sort((a, b) => G.LUAS[b.t] - G.LUAS[a.t] || a.n - b.n); revT = [];
    urut.forEach((s, i) => revT.push(setTimeout(() => {
      s.e.classList.add('cahaya'); const c = G.pusat(s.poli);
      const tx = el('text', { x: c[0], y: c[1] + 0.17, class: 'lbl' }, gLabel); tx.textContent = pec(s.t);
      A.pecahan(i); $('#bubble').textContent = I.t('snap', { p: I.t('nama_' + s.t), f: pec(s.t) });
    }, 700 + i * 340)));
    revT.push(setTimeout(paparHasil, 700 + urut.length * 340 + 700));
  }
  function skipReveal() { revT.forEach(clearTimeout); revT = []; if (S.keadaan === 'reveal') paparHasil(); }
  function paparHasil() {
    revT.forEach(clearTimeout); revT = [];
    const sil = D.SIL[S.tahap], t = masa();
    S.keadaan = 'hasil'; $('#hasil').hidden = false;
    maskot('#mHasil', 'gembira');
    $('#hTajuk').textContent = I.t('hTajuk', { n: I.nama(sil) });
    $('#hBintang').innerHTML = [1, 2, 3].map(n => ART.star(n <= S.bintang)).join('');
    $('#hStat').textContent = I.t('hStat', { t: fmt(t), h: S.petunjuk, p: fmt(sil.par) }) + ' — ' + I.raw('bintangTeks')[S.bintang - 1];
    const kira = {}; S.slot.forEach(s => { kira[s.t] = (kira[s.t] || 0) + 1; });
    let h = '<p class="pt">' + I.t('pecahanTajuk') + '</p>';
    ['L', 'M', 'Q', 'P', 'S'].forEach(tp => {
      if (!kira[tp]) return;
      const ix = G.SET.indexOf(tp), ic = '<svg viewBox="-1.2 -1.2 2.4 2.4" aria-hidden="true"><polygon points="' + pts(G.CANON[tp]) + '" fill="' + WAR[ix] + '" stroke="' + GELAP[ix] + '" stroke-width=".1" stroke-linejoin="round" transform="scale(.8)"/></svg>';
      h += '<div class="baris-p">' + ic + '<span class="bn">' + I.t('nama_' + tp) + (kira[tp] > 1 ? ' ×' + kira[tp] : '') + '</span><span class="bf"><b>' + pec(tp) + '</b> <small>' + I.t('daripada') + '</small></span></div>';
    });
    const sum = S.slot.slice().sort((a, b) => G.LUAS[b.t] - G.LUAS[a.t]).map(s => pec(s.t));
    h += '<p class="jum">' + I.t('jumlah', { s: sum.join(' + ') }) + '</p>';
    $('#hPecahan').innerHTML = h;
    $('#hFakta').textContent = I.raw('fakta')[S.tahap % I.raw('fakta').length];
    const ada = S.tahap + 1 < D.SIL.length; $('#btnNext').hidden = !ada;
  }

  /* ---------- kawalan ---------- */
  $('#btnLang').onclick = () => { A.klik(); I.set(I.loc === 'ms' ? 'id' : 'ms'); segarBahasa(); };
  $$('[data-loc]').forEach(b => b.onclick = () => { A.klik(); I.set(b.dataset.loc); segarBahasa(); });
  $('#btnSnd').onclick = () => { A.setMute(!A.mute); A.klik(); ikonBar(); };
  $('#btnBack').onclick = () => { A.klik(); if (S.keadaan === 'peta') ke('menu'); else { revT.forEach(clearTimeout); ke('peta'); } };
  $('#btnMula').onclick = () => { A.init(); A.klik(); ke('peta'); };
  $('#btnPutar').onclick = () => putar(1); $('#btnBalik').onclick = balik; $('#btnPet').onclick = cadang; $('#btnUlang').onclick = ulang;
  $('#btnNext').onclick = () => { A.klik(); mulaTahap(S.tahap + 1); };
  $('#btnUlang2').onclick = ulang; $('#btnPeta').onclick = () => { A.klik(); ke('peta'); };
  document.addEventListener('keydown', e => {
    if (S.keadaan !== 'main') return; const k = e.key.toLowerCase();
    if (k === 'r') putar(1); else if (k === 'f') balik(); else if (k === 'h') cadang();
  });
  function ke(n) { if (n === 'peta') renderPeta(); tunjuk(n); S.keadaan = n; ikonBar(); }
  function segarBahasa() {
    ikonBar();
    if (S.keadaan === 'peta') renderPeta();
    if (S.keadaan === 'main' || S.keadaan === 'reveal' || S.keadaan === 'hasil') { $('#namaSil').textContent = (S.tahap + 1) + '. ' + I.nama(D.SIL[S.tahap]); if (S.keadaan === 'hasil') paparHasil(); }
  }
  maskot('#mMenu', 'senang');
  I.set(I.loc); ikonBar(); tunjuk('menu');

  /* ---------- kait ujian ---------- */
  function ctmKlien(x, y) { const p = new DOMPoint(x, y).matrixTransform(svg.getScreenCTM()); return { x: p.x, y: p.y }; }
  function rancang() {
    if (S.keadaan !== 'main') return null;
    const bebas = S.slot.filter(s => s.isi < 0).sort((a, b) => G.LUAS[b.t] - G.LUAS[a.t] || a.n - b.n);
    for (const s of bebas) {
      const p = S.kep.find(k => !k.terkunci && k.t === s.t); if (!p) continue;
      let best = null;
      for (const f of (p.t === 'P' ? [0, 1] : [p.f])) for (let nk = 0; nk < 8; nk++) {
        if (!G.padan(p.t, nk, f, s.c, s).ok) continue;
        const putar = (nk - kPadan(p) + 8) % 8, bal = f !== p.f, cost = putar + (bal ? 1 : 0);
        if (!best || cost < best.cost) best = { cost, putar, balik: bal };
      }
      return { id: p.id, jenis: p.t, slot: s.n, putar: best.putar, balik: best.balik, dipilih: S.dipilih === p.id, dari: ctmKlien(p.x, p.y), ke: ctmKlien(s.c[0], s.c[1]) };
    }
    return null;
  }
  function jawabUji() { // selesaikan serta-merta (untuk main-uji skill)
    let n = 0; while (S.keadaan === 'main' && n++ < 20) { const r = rancang(); if (!r) break; const p = S.kep[r.id], s = S.slot[r.slot]; p.r = s.k; p.f = s.f; kunciKe(p, s, false); }
    return true;
  }
  window.__game = {
    get keadaan() { return S.keadaan; }, get tahap() { return S.tahap; }, get terkunci() { return S.slot.filter(s => s.isi >= 0).length; },
    get jumlah() { return S.slot.length; }, get petunjuk() { return S.petunjuk; }, get masa() { return masa(); }, get bintang() { return S.bintang; },
    get dipilih() { return S.dipilih; }, get slotPetunjuk() { return S.slotPetunjuk; }, get par() { return D.SIL[S.tahap].par; }, get awal() { return S.slot.filter(s => s.awal).length; },
    get progres() { return JSON.parse(JSON.stringify(progres)); },
    mulaTahap, rancang, jawabUji, tambahMasa(s) { S.ofsMasa += s; }, kPadan: id => kPadan(S.kep[id]), kep: id => ({ x: S.kep[id].x, y: S.kep[id].y, r: S.kep[id].r, f: S.kep[id].f, t: S.kep[id].t })
  };
})();
