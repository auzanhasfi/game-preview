(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const GG = window.GG, D = window.GGDATA, A = window.GGART, AU = window.GGAUDIO, TX = window.GGI18N;
  const SIM = { '+': '+', '-': '−', '*': '×' };
  const ICON = { '+': 'plus', '-': 'minus', '*': 'times' };
  const NAMA = { '+': 'tambah', '-': 'tolak', '*': 'darab' };
  const params = new URLSearchParams(location.search);
  const seedParam = params.get('seed') ? parseInt(params.get('seed'), 10) : 0;

  let lang = 'ms', layar = 'menu', level = null, st = null, hist = [], undoLeft = 3, kunci = false, tilesEl = {}, bubbleT = 0, gameSeq = 0;
  let simpan = { stars: {}, best: {} };
  try {
    const s = JSON.parse(localStorage.getItem('gg.simpan') || 'null'); if (s && s.stars) simpan = s;
    const l = localStorage.getItem('gg.lang'); if (l === 'ms' || l === 'id') lang = l;
  } catch (e) {}
  function simpanData() { try { localStorage.setItem('gg.simpan', JSON.stringify(simpan)); } catch (e) {} }
  const t = (k, p) => { let s = (TX[lang][k] != null ? TX[lang][k] : k); if (p) for (const x in p) s = s.replace('{' + x + '}', p[x]); return s; };

  const view = { keadaan: 'menu', skor: 0, langkah: 0, tahap: 0, bahasa: 'ms', get papan() { return st ? st.grid.map(r => r.map(c => c ? c.v : 0)) : null; },
    get progres() { return st ? GG.progress(st) : 0; }, get sasaran() { return level ? level.target : 0; }, get stars() { return st && st.status === 'menang' ? GG.stars(st) : 0; },
    hantar: arah => gerak(arah), botGerak() { if (!st || st.status !== 'main') return null; const d = GG.bot(st, 20, 7); if (d) gerak(d); return d; },
    saran() { return st && st.status === 'main' ? GG.bot(st, 20, 7) : null; },
    mulaTahap: i => mulaTahap(i), simpan: () => simpan,
    jawabUji(betul) { if (betul) return view.botGerak(); const o = GG.DIRS.filter(x => GG.step(st, x).moved); gerak(o[0]); return o[0]; } };
  window.__game = view;
  function sync() { view.skor = st ? st.score : 0; view.langkah = st ? st.moves : 0; view.tahap = level ? level.idx : 0; view.bahasa = lang; view.keadaan = layar; view.nyawa = st ? Math.max(0, level.maxMoves - st.moves) : 0; }

  /* ---------- tema ---------- */
  function terapBahasa() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(e => { e.textContent = t(e.dataset.t); });
    document.querySelectorAll('[data-loc]').forEach(b => { b.textContent = t(b.dataset.loc === 'ms' ? 'bm' : 'id'); b.setAttribute('aria-pressed', b.dataset.loc === lang); });
    $('#btnMula').innerHTML = A.icon('play') + '<span>' + t('mula') + '</span>';
    $('#btnLang').textContent = lang === 'ms' ? 'BM' : 'ID'; $('#btnLang').setAttribute('aria-label', t('tukar'));
    $('#btnBack').innerHTML = A.icon('back'); $('#btnBack').setAttribute('aria-label', t('kembali'));
    $('#btnUndo').innerHTML = A.icon('undo') + '<span>' + t('buat_asal') + ' (' + undoLeft + ')</span>';
    $('#btnUlang').innerHTML = A.icon('restart') + '<span>' + t('ulang') + '</span>';
    $('#btnNext').innerHTML = '<span>' + t('seterusnya') + '</span>' + A.icon('next');
    $('#btnUlang2').innerHTML = A.icon('restart') + '<span>' + t('ulang') + '</span>';
    $('#btnPeta').innerHTML = A.icon('home') + '<span>' + t('menu') + '</span>';
    document.title = t('tajuk'); pasangBunyiIkon();
    if (layar === 'peta') binaPeta();
    if (level) { hudSoal(); hudStat(); }
    if (layar === 'hasil') isiHasil();
  }
  function pasangBunyiIkon() { $('#btnSnd').innerHTML = A.icon(AU.mute ? 'sndOff' : 'sndOn'); $('#btnSnd').setAttribute('aria-label', t('bunyi')); }
  function setMood(el, mood) { el.innerHTML = A.gemi(mood); }

  /* ---------- skrin ---------- */
  function tunjuk(nama) {
    layar = nama;
    ['menu', 'peta', 'main'].forEach(s => { $('#' + s).hidden = !(s === nama || (nama === 'hasil' && s === 'main')); });
    $('#hasil').hidden = nama !== 'hasil';
    $('#btnBack').hidden = nama === 'menu';
    sync();
  }
  function kePeta() { tunjuk('peta'); binaPeta(); }
  function bukaBuka(i) { return i === 0 || (simpan.stars[i - 1] || 0) > 0; }
  function binaPeta() {
    let h = '';
    D.TAHAP.forEach(th => {
      h += '<div class="baris"><h3>' + A.icon(ICON[th.op]) + t(NAMA[th.op]) + '</h3><div class="lv-grid">';
      th.levels.forEach(l => {
        const s = simpan.stars[l.idx] || 0, ok = bukaBuka(l.idx);
        h += '<button class="lv" data-uji="tahap-' + l.idx + '" data-i="' + l.idx + '"' + (ok ? '' : ' disabled') + ' aria-label="' + t('tahap') + ' ' + (l.no + 1) + '">' +
          (ok ? '<span>' + (l.no + 1) + '</span>' : A.icon('lock')) +
          '<span class="mini-b">' + [1, 2, 3].map(n => A.star(n <= s)).join('') + '</span></button>';
      });
      h += '</div></div>';
    });
    $('#petaIsi').innerHTML = h;
    $('#petaIsi').querySelectorAll('.lv').forEach(b => b.addEventListener('click', () => { AU.klik(); mulaTahap(+b.dataset.i); }));
  }

  /* ---------- papan ---------- */
  const G = 2.6;
  function geom(n) { const cell = (100 - (n + 1) * G) / n; return { cell, pos: k => G + k * (cell + G) }; }
  function binaSel() {
    const n = level.n, g = geom(n); let h = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) h += '<div class="sel" style="left:' + g.pos(c) + '%;top:' + g.pos(r) + '%;width:' + g.cell + '%;height:' + g.cell + '%"></div>';
    $('#selLayer').innerHTML = h;
    $('#papan').style.setProperty('--n', n);
    ukur();
  }
  function ukur() { const p = $('#papan'); if (p && p.clientWidth) p.style.setProperty('--bw', p.clientWidth + 'px'); }
  function warna(v) { const h = (Math.log2(v + 1) * 53 + 200) % 360; return 'hsl(' + h.toFixed(0) + ' 70% 68%)'; }
  function buatTile(tl, r, c, kelas) {
    const g = geom(level.n), e = document.createElement('div'), d = String(tl.v).length;
    e.className = 'tile' + (d >= 4 ? ' d4' : d === 3 ? ' d3' : '') + (kelas ? ' ' + kelas : '');
    e.textContent = tl.v; e.style.background = warna(tl.v);
    e.style.width = g.cell + '%'; e.style.height = g.cell + '%'; e.style.left = g.pos(c) + '%'; e.style.top = g.pos(r) + '%';
    e.dataset.v = tl.v; $('#tiles').appendChild(e); tilesEl[tl.id] = e; return e;
  }
  function gambarSemua() {
    $('#tiles').innerHTML = ''; tilesEl = {};
    st.grid.forEach((row, r) => row.forEach((tl, c) => { if (tl) buatTile(tl, r, c, 'baru'); }));
  }
  function posPx(r, c) { const g = geom(level.n); return { x: g.pos(c) + g.cell / 2, y: g.pos(r) + g.cell / 2 }; }
  function letupan(r, c, v, besar) {
    const p = posPx(r, c), fx = $('#fx'), col = warna(v), n = besar ? 14 : 9;
    for (let i = 0; i < n; i++) {
      const e = document.createElement('i'), a = Math.random() * 6.283, d = 30 + Math.random() * (besar ? 60 : 38);
      e.className = 'cip'; e.style.left = p.x + '%'; e.style.top = p.y + '%'; e.style.background = i % 3 ? col : '#fff6c9';
      e.style.setProperty('--dx', Math.cos(a) * d + 'px'); e.style.setProperty('--dy', Math.sin(a) * d + 'px');
      fx.appendChild(e); setTimeout(() => e.remove(), 620);
    }
  }
  function terbang(r, c, teks) {
    const p = posPx(r, c), e = document.createElement('div');
    e.className = 'skor-naik'; e.textContent = teks; e.style.left = p.x + '%'; e.style.top = p.y + '%';
    $('#fx').appendChild(e); setTimeout(() => e.remove(), 850);
  }
  function bubble(teks, mood) {
    $('#bubble').textContent = teks; setMood($('#mMain'), mood || 'senang');
    clearTimeout(bubbleT); bubbleT = setTimeout(() => { if (layar === 'main') { $('#bubble').textContent = ''; setMood($('#mMain'), 'senang'); } }, 2200);
  }

  /* ---------- HUD ---------- */
  function hudSoal() {
    const l = level, op = l.op;
    $('#soalOp').innerHTML = A.icon(ICON[op]) + '<span>' + t(NAMA[op]) + ' · ' + t('tahap') + ' ' + (l.no + 1) + '</span>';
    $('#soalQ').textContent = l.q[0] + ' ' + SIM[op] + ' ' + l.q[1] + ' = ?';
    $('#soalS').textContent = op === '-' ? t('padam', { t: l.target }) + ' · ' + t('cara_tolak').split(':')[1].trim() : t('bina', { t: l.target }) + ' · ' + t('cara_' + NAMA[op]).split(':')[1].trim();
  }
  function hudStat() {
    $('#vSkor').textContent = st.score; $('#vLangkah').textContent = st.moves + '/' + level.maxMoves;
    $('#vBest').textContent = simpan.best[level.idx] || 0;
    $('#progBar').style.width = Math.min(100, GG.progress(st) / level.target * 100) + '%';
    $('#btnUndo').querySelector('span').textContent = t('buat_asal') + ' (' + undoLeft + ')';
    $('#btnUndo').disabled = undoLeft <= 0 || hist.length === 0;
    sync();
  }

  /* ---------- permainan ---------- */
  function mulaTahap(i) {
    level = D.FLAT[i]; gameSeq++;
    const seed = seedParam ? seedParam + i * 97 + gameSeq : 0;
    st = GG.create(level, seed); hist = []; undoLeft = 3; kunci = false;
    tunjuk('main'); binaSel(); gambarSemua(); hudSoal(); hudStat();
    bubble(t('mesej_mula'), 'gembira'); $('#papan').classList.remove('rantai');
    setTimeout(() => { ukur(); }, 50);
  }
  function gerak(dir) {
    if (layar !== 'main' || kunci || !st || st.status !== 'main') return false;
    const snap = GG.snapshot(st);
    const r = GG.apply(st, dir);
    if (!r.moved) { const p = $('#papan'); p.classList.remove('goyang'); void p.offsetWidth; p.classList.add('goyang'); AU.buntu(); bubble(t('buntu'), 'oops'); return false; }
    hist.push(snap); if (hist.length > 3) hist.shift();
    kunci = true;
    r.slides.forEach(s => { const e = tilesEl[s.id]; if (e) { const g = geom(level.n); e.style.left = g.pos(s.to[1]) + '%'; e.style.top = g.pos(s.to[0]) + '%'; } });
    AU.geser();
    const mergeIds = new Set(); r.merges.forEach(m => m.ids.forEach(id => mergeIds.add(id)));
    setTimeout(() => {
      r.merges.forEach((m, i) => {
        m.ids.forEach(id => { const e = tilesEl[id]; if (e) { e.remove(); delete tilesEl[id]; } });
        if (m.tile) buatTile(m.tile, m.to[0], m.to[1], 'pop');
        letupan(m.to[0], m.to[1], m.res || m.a, r.nm >= 2 || m.res >= 32);
        setTimeout(() => AU.gabung(i + Math.max(0, r.streak - 1), level.op), i * 70);
      });
      if (r.spawn) buatTile(r.spawn.tile, r.spawn.r, r.spawn.c, 'baru');
      if (r.merges.length) {
        const last = r.merges[r.merges.length - 1];
        terbang(last.to[0], last.to[1], '+' + r.gain);
        const eq = last.a + ' ' + SIM[level.op] + ' ' + last.b + ' = ' + last.res;
        if (r.nm >= 2) bubble(t('rantai', { m: r.nm }) + '  ' + eq, 'gembira');
        else bubble(eq, last.res >= level.target / 2 || level.op === '-' ? 'gembira' : 'senang');
      }
      const p = $('#papan');
      if (r.nm >= 2 || r.streak >= 3) { p.classList.add('rantai'); setTimeout(() => p.classList.remove('rantai'), 500); }
      hudStat(); kunci = false;
      if (r.status !== 'main') setTimeout(() => tamat(r.status), 520);
    }, 125);
    sync();
    return true;
  }
  function buatAsal() {
    if (layar !== 'main' || kunci || undoLeft <= 0 || !hist.length) return;
    GG.restore(st, hist.pop()); undoLeft--; AU.klik(); gambarSemua(); hudStat(); bubble('↩', 'fikir');
  }
  function tamat(status) {
    if (layar !== 'main') return;
    const menang = status === 'menang';
    if (menang) {
      const s = GG.stars(st);
      if (s > (simpan.stars[level.idx] || 0)) simpan.stars[level.idx] = s;
      if (st.score > (simpan.best[level.idx] || 0)) simpan.best[level.idx] = st.score;
      simpanData(); AU.menang();
    } else AU.kalah();
    tunjuk('hasil'); isiHasil();
  }
  function isiHasil() {
    const menang = st.status === 'menang', s = menang ? GG.stars(st) : 0;
    setMood($('#mHasil'), menang ? 'gembira' : 'oops');
    $('#hTajuk').textContent = menang ? (level.idx === D.FLAT.length - 1 ? t('semua') : t('menang')) : t('kalah');
    $('#hBintang').innerHTML = [1, 2, 3].map(n => A.star(n <= s)).join('');
    $('#hBintang').setAttribute('aria-label', s + ' ' + t('bintang'));
    const sebab = menang ? '' : (GG.canMove(st) ? t('habis_langkah') : t('papan_penuh')) + '<br>';
    $('#hStat').innerHTML = sebab + t('skor') + ': <b>' + st.score + '</b> · ' + t('langkah') + ': <b>' + st.moves + '</b> · ' + t('terbaik') + ': <b>' + (simpan.best[level.idx] || 0) + '</b>';
    $('#btnNext').hidden = !(menang && level.idx < D.FLAT.length - 1);
  }

  /* ---------- input ---------- */
  const KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down', A: 'left', D: 'right', W: 'up', S: 'down' };
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const d = KEYS[e.key];
    if (d && layar === 'main') { e.preventDefault(); AU.init(); gerak(d); }
    else if ((e.key === 'z' || e.key === 'Z') && layar === 'main') buatAsal();
    else if (e.key === 'Enter' && layar === 'hasil' && !$('#btnNext').hidden) $('#btnNext').click();
  });
  (function sapu() {
    const p = $('#papan'); let sx = 0, sy = 0, aktif = false, id = null;
    p.addEventListener('pointerdown', e => { aktif = true; id = e.pointerId; sx = e.clientX; sy = e.clientY; AU.init(); try { p.setPointerCapture(id); } catch (x) {} });
    function akhir(e) {
      if (!aktif || e.pointerId !== id) return; aktif = false;
      const dx = e.clientX - sx, dy = e.clientY - sy, ax = Math.abs(dx), ay = Math.abs(dy), min = 24;
      if (Math.max(ax, ay) < min) return;
      gerak(ax > ay ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }
    p.addEventListener('pointerup', akhir); p.addEventListener('pointercancel', () => { aktif = false; });
  })();
  window.addEventListener('resize', ukur);
  if (window.ResizeObserver) new ResizeObserver(ukur).observe($('#papan'));

  /* ---------- butang ---------- */
  document.querySelectorAll('[data-loc]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.loc)));
  function setLang(l) { lang = l; try { localStorage.setItem('gg.lang', l); } catch (e) {} AU.klik(); terapBahasa(); }
  $('#btnLang').addEventListener('click', () => setLang(lang === 'ms' ? 'id' : 'ms'));
  $('#btnSnd').addEventListener('click', () => { AU.setMute(!AU.mute); pasangBunyiIkon(); AU.klik(); });
  $('#btnMula').addEventListener('click', () => { AU.init(); AU.klik(); kePeta(); });
  $('#btnBack').addEventListener('click', () => { AU.klik(); if (layar === 'peta') { tunjuk('menu'); } else kePeta(); });
  $('#btnUndo').addEventListener('click', buatAsal);
  $('#btnUlang').addEventListener('click', () => { AU.klik(); mulaTahap(level.idx); });
  $('#btnUlang2').addEventListener('click', () => { AU.klik(); mulaTahap(level.idx); });
  $('#btnNext').addEventListener('click', () => { AU.klik(); mulaTahap(level.idx + 1); });
  $('#btnPeta').addEventListener('click', () => { AU.klik(); kePeta(); });

  /* ---------- mula ---------- */
  setMood($('#mMenu'), 'senang'); setMood($('#mMain'), 'senang');
  terapBahasa(); tunjuk('menu');
})();
