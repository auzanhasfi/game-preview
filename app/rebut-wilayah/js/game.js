/* Bulat Rebut Wilayah: UI, penyajian Canvas, input. Logik permainan ada dalam js/logic.js. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const t = RWI18N.t, TAHAP = RWDATA.TAHAP, Seni = RWSENI, A = RWAUDIO, RW = window.RW;
  const Q = new URLSearchParams(location.search);
  const MANUAL = Q.has('uji');                       // jam maya untuk ujian: langkah dikawal __game.langkah(n)
  const SEED = +Q.get('seed') || ((Date.now() % 100000) + 1);
  const TICK = 105;                                  // ms setiap langkah Si Bulat
  const KEY = 'rw.v1';

  let sim = { bahasa: (navigator.language || '').toLowerCase().indexOf('id') === 0 ? 'id' : 'ms', tahap: [] };
  try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j && typeof j === 'object') { sim.bahasa = j.bahasa === 'id' ? 'id' : 'ms'; sim.tahap = Array.isArray(j.tahap) ? j.tahap : []; } } catch (e) {}
  function simpan() { try { localStorage.setItem(KEY, JSON.stringify(sim)); } catch (e) {} }
  RWI18N.lang = sim.bahasa;

  let keadaan = 'menu', idx = 0, m = null, jeda = false, acc = 0, last = 0, bubbleFn = null, bubbleCls = '', mood = 'senang', moodT = 0;
  let cs = 16, cw = 0, ch = 0, dpr = 1;
  const fresh = new Map(), floats = [], parts = []; let shake = 0, tMasa = 0, tamatTimer = 0;
  const ctx = $('kanvas').getContext('2d');

  /* ---------- paparan teks sasaran ---------- */
  const frac = (n, d) => '<span class="frac"><i>' + n + '</i><i>' + d + '</i></span>';
  function bahagianHTML(b) { return b.a ? frac(b.a[0], b.a[1]) : RWI18N.nombor(b.d); }
  function bahagianTeks(b) { return b.a ? b.a[0] + '/' + b.a[1] : RWI18N.nombor(b.d); }
  function sasaranHTML(s) {
    if (s.jenis === 'pct') return s.pct + '%';
    if (s.jenis === 'pecahan') return frac(s.a[0], s.a[1]) + ' <small style="font-size:.55em">' + t('papan') + '</small>';
    if (s.jenis === 'perpuluhan') return RWI18N.nombor(s.d) + ' <small style="font-size:.55em">' + t('papan') + '</small>';
    return s.bahagian.map(bahagianHTML).join(' + ');
  }
  function sasaranTeks(s) {
    if (s.jenis === 'pct') return s.pct + '%';
    if (s.jenis === 'pecahan') return s.a[0] + '/' + s.a[1] + ' ' + t('papan');
    if (s.jenis === 'perpuluhan') return RWI18N.nombor(s.d) + ' ' + t('papan');
    return s.bahagian.map(bahagianTeks).join(' + ') + ' ' + t('papan');
  }
  function setaraTeks(s) { // setara ringkas
    const f = RW.pecahan(s.pct), des = RWI18N.nombor(s.pct / 100);
    if (s.jenis === 'pct') return '= ' + f[0] + '/' + f[1] + ' = ' + des;
    if (s.jenis === 'pecahan') return '= ' + s.pct + '% = ' + des;
    if (s.jenis === 'perpuluhan') return '= ' + s.pct + '% = ' + f[0] + '/' + f[1];
    return '= ' + s.pct + '% = ' + f[0] + '/' + f[1];
  }
  function semasaTeks(p) { const f = RW.pecahan(p); return '= ' + f[0] + '/' + f[1] + ' = ' + RWI18N.nombor(p / 100); }

  /* ---------- skrin ---------- */
  function tunjuk(k) {
    keadaan = k;
    $('menu').hidden = k !== 'menu'; $('peta').hidden = k !== 'peta'; $('main').hidden = !(k === 'main' || k === 'hasil'); $('hasil').hidden = k !== 'hasil';
    $('btnBack').hidden = k === 'menu';
    if (k === 'main' || k === 'hasil') requestAnimationFrame(layout);
    if (k === 'menu') requestAnimationFrame(() => Seni.maskot($('mMenu'), 'gembira'));
    if (k === 'peta') renderPeta();
  }
  function terbuka(i) { return i === 0 || ((sim.tahap[i - 1] || {}).b || 0) > 0; }
  function renderPeta() {
    const h = [];
    TAHAP.forEach((lv, i) => {
      const ok = terbuka(i), r = sim.tahap[i] || {}, b = r.b || 0;
      h.push('<button class="tahap" data-uji="tahap-' + i + '"' + (ok ? '' : ' disabled') + '><small>' + t('tahap') + ' ' + (i + 1) + '</small><b>' + (ok ? sasaranHTML(lv.sasaran) : Seni.ikon('lock')) + '</b><span class="bs">' + [1, 2, 3].map(n => Seni.bintang(b >= n)).join('') + '</span></button>');
    });
    $('petaIsi').innerHTML = h.join('');
    $('petaIsi').querySelectorAll('.tahap').forEach((b, i) => b.onclick = () => { A.klik(); mulaTahap(i); });
  }
  function terapBahasa() {
    document.documentElement.lang = RWI18N.lang;
    document.querySelectorAll('[data-t]').forEach(e => e.textContent = t(e.dataset.t));
    document.querySelectorAll('[data-loc]').forEach(b => { b.textContent = t(b.dataset.loc === 'ms' ? 'bm' : 'id'); b.classList.toggle('on', b.dataset.loc === RWI18N.lang); b.setAttribute('aria-pressed', b.dataset.loc === RWI18N.lang); });
    $('btnLang').textContent = RWI18N.lang === 'id' ? 'ID' : 'BM'; $('btnLang').setAttribute('aria-label', 'Bahasa / Bahasa');
    $('btnMula').innerHTML = Seni.ikon('play') + t('mula');
    $('cara').innerHTML = [['swipe', 'cara1'], ['loop', 'cara2'], ['target', 'cara3'], ['bug', 'cara4']].map(a => '<li>' + Seni.ikon(a[0]) + '<span>' + t(a[1]) + '</span></li>').join('');
    $('btnBack').innerHTML = Seni.ikon('back'); $('btnBack').setAttribute('aria-label', t('balik'));
    $('btnJeda').innerHTML = Seni.ikon('pause') + t('jeda'); $('btnUlang').innerHTML = Seni.ikon('restart') + t('ulang');
    $('btnLanjut').textContent = t('teruskan'); $('btnUlangJ').textContent = t('ulang'); $('btnPetaJ').textContent = t('ketahap'); $('jedaT').textContent = t('tutupJeda');
    $('btnNext').textContent = t('seterusnya'); $('btnUlang2').textContent = t('ulang'); $('btnPeta').textContent = t('ketahap');
    $('sasLabel').textContent = t('sasaran'); $('stKawasan').textContent = t('kawasan'); $('stNyawa').textContent = t('nyawa'); $('stSkor').textContent = t('skor');
    $('mulaIk').innerHTML = Seni.ikon('swipe'); $('mulaTeks').textContent = t('mulaTeks');
    ikonBunyi(); document.title = t('tajuk');
    if (keadaan === 'peta') renderPeta();
    if (m) { sasaranUI(); hud(); if (bubbleFn) bubble(bubbleFn, bubbleCls); if (keadaan === 'hasil') isiHasil(); }
  }
  function ikonBunyi() { $('btnSnd').innerHTML = Seni.ikon(A.mute ? 'sndOff' : 'sndOn'); $('btnSnd').setAttribute('aria-label', t('bunyi')); }
  function bubble(fn, cls) { bubbleFn = fn; bubbleCls = cls || ''; const b = $('bubble'); b.textContent = fn(); b.className = 'gelembung ' + bubbleCls; }
  function setMood(k, ms) { mood = k; moodT = ms ? performance.now() + ms : 0; Seni.maskot($('mMain'), k); }

  /* ---------- permainan ---------- */
  function mulaTahap(i) {
    clearTimeout(tamatTimer);
    idx = i; m = new RW.Mesin(TAHAP[i], SEED * 31 + i); jeda = false; acc = 0; last = performance.now();
    fresh.clear(); floats.length = 0; parts.length = 0; shake = 0;
    tunjuk('main'); $('lapisMula').hidden = false; $('lapisJeda').hidden = true; $('hasil').hidden = true;
    sasaranUI(); setMood('senang');
    const s = TAHAP[i].sasaran;
    bubble(() => t('mMula', { s: sasaranTeks(s), e: setaraTeks(s).replace('= ', '') }), '');
    hud(); layout();
  }
  function sasaranUI() {
    const s = TAHAP[idx].sasaran; $('sasNilai').innerHTML = sasaranHTML(s); $('sasSetara').textContent = setaraTeks(s);
  }
  function hud() {
    if (!m) return;
    const p = m.pct(), s = m.lv.sasaran;
    $('vPct').textContent = p + '%'; $('vSetara').textContent = semasaTeks(p); $('vSkor').textContent = m.skor;
    $('vNyawa').innerHTML = [0, 1, 2].map(n => Seni.hati(n < m.nyawa)).join('');
    $('bandIsi').style.width = Math.min(100, m.pctTepat()) + '%';
    const j = $('bandJulat'); j.style.left = 'calc(' + m.lo + '% - 3px)'; j.style.width = 'max(14px, calc(' + (m.hi - m.lo + 1) + '% + 3px))';
    $('bandTanda').style.left = 'calc(' + Math.min(100, m.pctTepat()) + '% - 2px)';
    $('bandBaki').textContent = p < m.lo ? t('baki', { n: m.lo - p }) : '';
    $('bandJulatTeks').textContent = t('julat') + ': ' + m.lo + '%-' + m.hi + '%';
  }
  function layout() {
    if (!m) return;
    const W = $('medan').clientWidth, H = $('medan').clientHeight; if (!W || !H) return;
    cs = Math.max(8, Math.floor(Math.min((W - 6) / m.w, (H - 6) / m.h)));
    cw = cs * m.w; ch = cs * m.h; dpr = Math.min(2, window.devicePixelRatio || 1);
    const c = $('kanvas'); c.width = cw * dpr; c.height = ch * dpr; c.style.width = cw + 'px'; c.style.height = ch + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function masuk(d) {
    if (keadaan !== 'main' || !m || jeda || m.tamat) return;
    A.init(); m.arah(d); $('lapisMula').hidden = true;
  }
  function togelJeda(v) {
    if (keadaan !== 'main' || !m || m.tamat) return;
    jeda = v === undefined ? !jeda : v; $('lapisJeda').hidden = !jeda; last = performance.now();
    $('btnJeda').innerHTML = Seni.ikon(jeda ? 'play' : 'pause') + t(jeda ? 'teruskan' : 'jeda');
  }
  function proses(ev) {
    const now = performance.now();
    for (const e of ev) {
      if (e.t === 'keluar') A.keluar();
      else if (e.t === 'ekor') A.ekor(e.n);
      else if (e.t === 'tawan') {
        for (const i of e.baru) fresh.set(i, now);
        const gp = Math.round(e.gp * 10) / 10;
        A.tawan(e.gp, e.luas); floats.push({ x: m.p.x, y: m.p.y, s: '+' + (gp % 1 ? gp.toFixed(1) : gp) + '%', c: '#fff', t0: now });
        for (let k = 0; k < 14; k++) parts.push({ x: m.p.x + .5, y: m.p.y + .5, vx: (Math.random() - .5) * 7, vy: (Math.random() - .8) * 7, t0: now, c: k % 2 ? '#ffd23f' : '#9fd0ff' });
        bubble(() => t('mTawan', { g: RWI18N.nombor(gp), p: e.pct }), 'bagus'); setMood('gembira', 1400);
      } else if (e.t === 'terlebih') {
        A.terlebih(); shake = now + 320; floats.push({ x: m.p.x, y: m.p.y, s: e.pct + '% !', c: '#ffb3b0', t0: now });
        bubble(() => t('mTerlebih', { p: e.pct, lo: m.lo, hi: m.hi }), 'oops'); setMood('oops', 1800);
      } else if (e.t === 'nyawa') {
        A.potong(); shake = now + 380; for (let k = 0; k < 12; k++) parts.push({ x: m.p.x + .5, y: m.p.y + .5, vx: (Math.random() - .5) * 8, vy: (Math.random() - .5) * 8, t0: now, c: '#ef5350' });
        const n = e.nyawa; bubble(() => t(e.why === 'sendiri' ? 'mSendiri' : 'mPotong', { n: n }), 'oops'); setMood('oops', 1800);
      } else if (e.t === 'menang') {
        A.menang(); setMood('gembira'); bubble(() => t('mMenang', { p: m.pct(), lo: m.lo, hi: m.hi }), 'bagus');
        tamatTimer = setTimeout(() => keputusan('menang'), 900);
      } else if (e.t === 'kalah') {
        A.kalah(); setMood('oops'); bubble(() => t('mKalah'), 'oops');
        tamatTimer = setTimeout(() => keputusan('kalah'), 900);
      }
    }
    hud();
  }
  function keputusan(h) {
    if (!m || m.tamat !== h) return;
    let rekod = false;
    if (h === 'menang') {
      const r = sim.tahap[idx] || { b: 0, sk: 0 };
      if (m.bintang > r.b) r.b = m.bintang;
      if (m.skor > r.sk) { r.sk = m.skor; rekod = true; }
      sim.tahap[idx] = r; simpan();
    }
    m.rekod = rekod; tunjuk('hasil'); isiHasil();
  }
  function isiHasil() {
    const menang = m.tamat === 'menang', s = TAHAP[idx].sasaran;
    $('hTajuk').textContent = t(menang ? 'hMenang' : 'hKalah');
    Seni.maskot($('mHasil'), menang ? 'gembira' : 'oops');
    $('hBintang').innerHTML = [1, 2, 3].map(n => Seni.bintang(menang && m.bintang >= n)).join('');
    $('hBintang').querySelectorAll('.bintang.on').forEach((e, i) => setTimeout(() => e.classList.add('muncul'), 250 + i * 260));
    const p = m.pct(), f = RW.pecahan(p), r = sim.tahap[idx] || {};
    $('hStat').innerHTML = '<div>' + t('hasilK') + ': <b>' + p + '%</b> = ' + f[0] + '/' + f[1] + '</div><div>' + t('hasilS') + ': <b>' + sasaranTeks(s) + '</b> (' + m.lo + '%-' + m.hi + '%)</div><div>' + t('hasilN') + ': <b>' + m.nyawa + '</b> &middot; ' + t('hasilSk') + ': <b>' + m.skor + '</b></div>' + (r.sk ? '<div>' + t('terbaik') + ': <b>' + r.sk + '</b>' + (m.rekod && menang ? ' &middot; ' + t('rekod') : '') + '</div>' : '');
    $('hKerja').innerHTML = t('kerja') + ': ' + RWI18N.nombor(TAHAP[idx].kerja);
    $('hKerja').hidden = !menang;
    $('btnNext').hidden = !(menang && idx < TAHAP.length - 1);
  }

  /* ---------- lukisan ---------- */
  const C = { e1: '#f6edd6', e2: '#f1e6cb', o1: '#4a86f0', o2: '#4380ec', tepi: '#2c5fc4', jejak: '#ffd04a' };
  function lerp(a, b, k) { return a + (b - a) * k; }
  function render(now, alpha) {
    if (!m || keadaan === 'menu' || keadaan === 'peta' || !cw) return;
    tMasa = now / 1000;
    ctx.save();
    if (now < shake) ctx.translate((Math.random() - .5) * 5, (Math.random() - .5) * 5);
    const w = m.w, h = m.h, c = m.c;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const v = c[y * w + x], odd = (x + y) & 1;
      ctx.fillStyle = v === 1 ? (odd ? C.o1 : C.o2) : (odd ? C.e1 : C.e2);
      ctx.fillRect(x * cs, y * cs, cs, cs);
    }
    // tepi kawasan milik
    ctx.fillStyle = C.tepi; const e = Math.max(2, cs * .14);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (c[y * w + x] !== 1) continue; const i = y * w + x;
      if (x > 0 && c[i - 1] !== 1) ctx.fillRect(x * cs, y * cs, e, cs);
      if (x < w - 1 && c[i + 1] !== 1) ctx.fillRect((x + 1) * cs - e, y * cs, e, cs);
      if (y > 0 && c[i - w] !== 1) ctx.fillRect(x * cs, y * cs, cs, e);
      if (y < h - 1 && c[i + w] !== 1) ctx.fillRect(x * cs, (y + 1) * cs - e, cs, e);
    }
    // batu
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (c[y * w + x] === 3) {
      const X = x * cs, Y = y * cs; ctx.fillStyle = '#8a93a6'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(X + 1, Y + 1, cs - 2, cs - 2, cs * .28) : ctx.rect(X + 1, Y + 1, cs - 2, cs - 2); ctx.fill();
      ctx.fillStyle = '#b6bdcc'; ctx.fillRect(X + cs * .2, Y + cs * .18, cs * .35, cs * .16);
    }
    // ekor
    for (const i of m.trail) {
      const x = i % w, y = (i / w) | 0; ctx.fillStyle = C.jejak; ctx.fillRect(x * cs + cs * .12, y * cs + cs * .12, cs * .76, cs * .76);
      ctx.fillStyle = '#fff3b0'; ctx.fillRect(x * cs + cs * .3, y * cs + cs * .3, cs * .4, cs * .4);
    }
    // kilau tawanan
    fresh.forEach((t0, i) => {
      const k = 1 - (now - t0) / 600; if (k <= 0) { fresh.delete(i); return; }
      ctx.fillStyle = 'rgba(255,255,255,' + (k * .85) + ')'; ctx.fillRect((i % w) * cs, ((i / w) | 0) * cs, cs, cs);
    });
    // musuh
    for (const q of m.musuh) {
      const X = (lerp(q.px, q.x, alpha) + .5) * cs, Y = (lerp(q.py, q.y, alpha) + .5) * cs;
      Seni.kutu(ctx, X, Y, cs * .62, q.jenis, tMasa);
    }
    // pemain
    const P = m.p, px = (lerp(P.px, P.x, alpha) + .5) * cs, py = (lerp(P.py, P.y, alpha) + .5) * cs;
    const d = m.dir ? RW.DIR[m.dir] : [0, 0.2];
    Seni.bulat(ctx, px, py, cs * .6, { mood: now < moodT || !moodT ? mood : 'senang', look: d, t: tMasa });
    // zarah + teks terbang
    for (let i = parts.length - 1; i >= 0; i--) {
      const q = parts[i], a = (now - q.t0) / 650; if (a >= 1) { parts.splice(i, 1); continue; }
      ctx.fillStyle = q.c; ctx.globalAlpha = 1 - a; ctx.beginPath(); ctx.arc((q.x + q.vx * a * 1.3) * cs, (q.y + q.vy * a * 1.3 + a * a * 3) * cs, cs * .16 * (1 - a * .5), 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.font = '800 ' + Math.round(cs * 1.05) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i], a = (now - f.t0) / 1100; if (a >= 1) { floats.splice(i, 1); continue; }
      ctx.globalAlpha = 1 - a * a; ctx.strokeStyle = '#1b3f94'; ctx.lineWidth = cs * .22;
      const fx = Math.min(Math.max((f.x + .5) * cs, cs * 2.5), cw - cs * 2.5), fy = (f.y - 1 - a * 2) * cs;
      ctx.strokeText(f.s, fx, fy); ctx.fillStyle = f.c; ctx.fillText(f.s, fx, fy); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  function frame(now) {
    if (m && keadaan === 'main') {
      const dt = Math.min(100, now - last); last = now;
      if (!MANUAL && !jeda && m.mula && !m.tamat) {
        acc += dt;
        while (acc >= TICK && !m.tamat) { acc -= TICK; proses(m.tick()); }
      }
      render(now, MANUAL || jeda || !m.mula ? 1 : Math.min(1, acc / TICK));
    } else if (m && keadaan === 'hasil') render(now, 1);
    requestAnimationFrame(frame);
  }

  /* ---------- input ---------- */
  const KUNCI = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
  addEventListener('keydown', e => {
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { togelJeda(); return; }
    const d = KUNCI[e.key]; if (d) { e.preventDefault(); masuk(d); }
  });
  (function sapu() {
    const el = $('medan'); let ax = 0, ay = 0, aktif = false;
    el.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('button')) return; aktif = true; ax = e.clientX; ay = e.clientY; try { el.setPointerCapture(e.pointerId); } catch (x) {} });
    el.addEventListener('pointermove', e => {
      if (!aktif) return; const dx = e.clientX - ax, dy = e.clientY - ay;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 14) return;
      masuk(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); ax = e.clientX; ay = e.clientY;
    });
    const tamat = () => { aktif = false; };
    el.addEventListener('pointerup', tamat); el.addEventListener('pointercancel', tamat);
    el.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  })();
  document.addEventListener('visibilitychange', () => { if (document.hidden && !MANUAL) togelJeda(true); });
  addEventListener('resize', layout);
  if (window.ResizeObserver) new ResizeObserver(layout).observe($('medan'));

  /* ---------- butang ---------- */
  document.querySelectorAll('[data-loc]').forEach(b => b.onclick = () => { setBahasa(b.dataset.loc); });
  function setBahasa(l) { RWI18N.lang = l; sim.bahasa = RWI18N.lang; simpan(); A.klik(); terapBahasa(); }
  $('btnLang').onclick = () => setBahasa(RWI18N.lang === 'ms' ? 'id' : 'ms');
  $('btnSnd').onclick = () => { A.setMute(!A.mute); A.klik(); ikonBunyi(); };
  $('btnMula').onclick = () => { A.init(); A.klik(); tunjuk('peta'); };
  $('btnBack').onclick = () => { A.klik(); if (keadaan === 'peta') tunjuk('menu'); else { clearTimeout(tamatTimer); tunjuk('peta'); } };
  $('btnJeda').onclick = () => { A.klik(); togelJeda(); };
  $('btnLanjut').onclick = () => { A.klik(); togelJeda(false); };
  $('btnUlang').onclick = $('btnUlangJ').onclick = $('btnUlang2').onclick = () => { A.klik(); mulaTahap(idx); };
  $('btnPetaJ').onclick = $('btnPeta').onclick = () => { A.klik(); clearTimeout(tamatTimer); tunjuk('peta'); };
  $('btnNext').onclick = () => { A.klik(); mulaTahap(Math.min(idx + 1, TAHAP.length - 1)); };

  /* ---------- hook ujian ---------- */
  function snap() {
    if (!m) return null;
    return { w: m.w, h: m.h, c: Array.from(m.c), p: { x: m.p.x, y: m.p.y }, dir: m.dir, trail: m.trail.slice(), asal: { x: m.asal.x, y: m.asal.y }, tahap: idx, musuh: m.musuh.map(q => ({ x: q.x, y: q.y, dx: q.dx, dy: q.dy, v: q.v, acc: q.acc, last: q.last, jenis: q.jenis })), pct: m.pct(), nyawa: m.nyawa, keadaan: keadaan, lo: m.lo, hi: m.hi, N: m.N, owned: m.owned, tamat: m.tamat, mula: m.mula };
  }
  window.__game = {
    get keadaan() { return keadaan; }, get tahap() { return idx; }, get skor() { return m ? m.skor : 0; }, get peratus() { return m ? m.pct() : 0; },
    get nyawa() { return m ? m.nyawa : 3; }, get jeda() { return jeda; }, get bahasa() { return RWI18N.lang; }, get mesin() { return m; }, get manual() { return MANUAL; },
    arah: masuk, snap: snap, mulaTahap: mulaTahap,
    langkah: function (n) { for (let i = 0; i < (n || 1); i++) if (m && !m.tamat) proses(m.tick()); if (m) render(performance.now(), 1); },
    uji: { musuhKe: function (i, x, y) { if (m && m.musuh[i]) { m.musuh[i].x = x; m.musuh[i].y = y; m.musuh[i].px = x; m.musuh[i].py = y; } } }
  };

  terapBahasa(); tunjuk('menu'); requestAnimationFrame(frame);
})();
