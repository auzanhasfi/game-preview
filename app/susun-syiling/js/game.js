(function () {
  'use strict';
  const D = window.DATA, TK = window.TEKS, SFX = window.SFX, SENI = window.SENI;
  const $ = (s, r) => (r || document).querySelector(s);
  const UJI = /[?&]uji=1/.test(location.search);
  const KEY = 'susunSyiling.v1';
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];

  // ---------- simpanan ----------
  let S = { bahasa: /^id/i.test(navigator.language || '') ? 'id' : 'ms', bunyi: true, buka: 1, papan: [] };
  try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && typeof j === 'object') S = Object.assign(S, j); } catch (e) {}
  if (!Array.isArray(S.papan)) S.papan = [];
  function simpan() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  SFX.set(S.bunyi);

  // ---------- teks & wang ----------
  function t(k, p) {
    let s = (TK[S.bahasa] && TK[S.bahasa][k]) || TK.ms[k] || k;
    if (p) for (const x in p) s = s.split('{' + x + '}').join(p[x]);
    return s;
  }
  function duit(u) {
    if (S.bahasa === 'ms') return 'RM ' + (u * 5 / 100).toFixed(2);
    return 'Rp ' + String(u * 50).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function labelSyiling(u) {
    if (S.bahasa === 'ms') return u >= 20 ? { a: 'RM' + (u * 5 / 100), b: '' } : { a: String(u * 5), b: 'sen' };
    return { a: String(u * 50), b: 'Rp' };
  }
  function syilingSVG(u) { return SENI.syiling(u, labelSyiling(u)); }

  // ---------- keadaan ----------
  let G = { keadaan: 'menu', tahap: 0, skor: 0, nyawa: D.NYAWA, kombo: 0, masa: 0, tong: [], baki: [], sel: null, jeda: false, bersih: 0, dibuat: 0, salah: 0, run: 0, bintangTahap: [] };
  let uid = 0, timerJeda = null, moodTimer = null, bubbleKey = null, bubbleP = null;
  const L = () => D.TAHAP[G.tahap];
  const bukaTong = () => G.tong.map((b, i) => ({ b, i })).filter(x => x.b && !x.b.penuh);

  // ---------- penjana tong & syiling ----------
  function urai(target, lv) {
    const p = []; let r = target, g = 0;
    while (r > 0 && g++ < 12) { const ds = lv.denom.filter(d => d <= r); const d = pick(ds.length > 1 && Math.random() < 0.6 ? ds.slice(-2) : ds); p.push(d); r -= d; }
    return p;
  }
  function rancang(lv) {
    const k = rand(lv.k[0], lv.k[1]); let p, c = 0;
    do { p = []; for (let i = 0; i < k; i++) p.push(pick(lv.denom)); c++; } while (k > 1 && p.every(x => x === p[0]) && lv.denom.length > 1 && c < 8);
    return p;
  }
  function buatTong() {
    const lv = L(); let plan, target, c = 0;
    const ada = bukaTong().map(x => x.b.target);
    do { plan = rancang(lv); target = plan.reduce((a, b) => a + b, 0); c++; } while (ada.includes(target) && c < 15);
    G.dibuat++;
    return { id: ++uid, target, isi: 0, plan, penuh: false };
  }
  function bekal() {
    const open = bukaTong().map(x => x.b); if (!open.length) return null;
    const opts = [];
    open.forEach(b => b.plan.forEach((v, i) => { if (v <= b.target - b.isi) opts.push({ b, i, v }); }));
    if (opts.length) { const o = pick(opts); o.b.plan.splice(o.i, 1); return { id: ++uid, v: o.v }; }
    const b = pick(open), ds = L().denom.filter(d => d <= b.target - b.isi);
    return ds.length ? { id: ++uid, v: pick(ds) } : null;
  }
  function isiDulang() { for (let i = 0; i < G.baki.length; i++) if (!G.baki[i]) G.baki[i] = bekal(); }

  // ---------- paparan ----------
  const el = { menu: $('#skrin-menu'), main: $('#skrin-main'), hasil: $('#skrin-hasil'), grid: $('#tong-grid'), dulang: $('#dulang'), gel: $('#gelembung'), cm: $('#clawd-main') };
  let tongEl = [], slotEl = [];

  function tunjuk(nama) { ['menu', 'main', 'hasil'].forEach(n => { el[n].hidden = n !== nama; }); window.scrollTo(0, 0); }
  function mood(m, ms) {
    el.cm.innerHTML = SENI.clawd(m);
    clearTimeout(moodTimer);
    if (m !== 'idle') { el.cm.classList.remove('loncat', 'goyang'); void el.cm.offsetWidth; el.cm.classList.add(m === 'happy' ? 'loncat' : 'goyang'); moodTimer = setTimeout(() => mood('idle'), ms || 1600); }
  }
  function bicara(key, p, m, ms) { bubbleKey = key; bubbleP = p; el.gel.textContent = t(key, p); if (m) mood(m, ms); }

  function statik() {
    document.documentElement.lang = S.bahasa;
    document.title = t('judul');
    document.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-bhs]').forEach(n => { const a = n.dataset.bhs === S.bahasa; n.classList.toggle('aktif', a); n.setAttribute('aria-pressed', a); });
    $('#btn-bahasa').textContent = S.bahasa === 'ms' ? 'BM' : 'ID';
    $('#btn-bahasa').setAttribute('aria-label', t('bahasaLabel'));
    $('#btn-rumah').innerHTML = SENI.ikon('rumah'); $('#btn-rumah').setAttribute('aria-label', t('rumah'));
    const ik = S.bunyi ? SENI.ikon('bunyi') : SENI.ikon('senyap'), lb = S.bunyi ? t('bunyiOn') : t('bunyiOff');
    ['#btn-bunyi', '#bunyi-menu'].forEach(s => { $(s).innerHTML = ik; $(s).setAttribute('aria-label', lb); });
    $('#btn-tukar').innerHTML = SENI.ikon('tukar') + '<span>' + t('tukar') + '</span>';
    $('#btn-seterusnya').textContent = t('seterusnya');
    rendahMenu();
    if (G.keadaan === 'main') { bicaraSemula(); renderSemua(); }
    if (G.keadaan === 'hasil') rendahHasil();
  }
  function bicaraSemula() { if (bubbleKey) el.gel.textContent = t(bubbleKey, bubbleP); }

  function papanHTML() {
    const top = S.papan.slice().sort((a, b) => b.skor - a.skor).slice(0, 5);
    const isi = top.length ? '<ol>' + top.map(r => `<li><span>${r.skor}</span><span class="bt">${[0, 1, 2].map(i => SENI.ikon('bintang', i < r.bintang ? '' : 'mati')).join('')}</span><span>${t('tahap', { n: r.tahap })}</span></li>`).join('') + '</ol>' : `<div class="kosong">${t('tiadaSkor')}</div>`;
    return `<h3>${t('papan')}</h3>${isi}`;
  }
  function rendahMenu() {
    $('#clawd-menu').innerHTML = SENI.clawd('happy');
    $('#papan-menu').innerHTML = papanHTML();
    const c = $('#chips-tahap'); c.innerHTML = '';
    D.TAHAP.forEach((_, i) => {
      const b = document.createElement('button'); b.className = 'chip' + (i === (G.pilih || 0) ? ' aktif' : ''); b.textContent = i + 1; b.dataset.uji = 'tahap-' + (i + 1);
      b.disabled = i + 1 > S.buka; b.setAttribute('aria-label', t('tahap', { n: i + 1 }));
      b.onclick = () => { G.pilih = i; SFX.pilih(); rendahMenu(); };
      c.appendChild(b);
    });
  }

  function binkaiTong() {
    const lv = L(); el.grid.innerHTML = ''; tongEl = [];
    for (let i = 0; i < lv.tong; i++) {
      const b = document.createElement('button'); b.className = 'tong kosong'; b.dataset.uji = 'tong-' + i; b.dataset.id = '';
      b.onclick = () => klikTong(i); el.grid.appendChild(b); tongEl.push(b);
    }
    el.dulang.innerHTML = ''; slotEl = [];
    for (let i = 0; i < lv.slot; i++) {
      const b = document.createElement('button'); b.className = 'slot kosong'; b.dataset.uji = 'syiling-' + i; b.dataset.id = '';
      b.onclick = () => klikSyiling(i); el.dulang.appendChild(b); slotEl.push(b);
    }
  }
  function renderTong() {
    const cad = UJI ? cariLangkah() : null;
    tongEl.forEach((e, i) => {
      const b = G.tong[i];
      e.removeAttribute('data-cadang-tong'); e.classList.remove('sasaran-cadang');
      if (!b) { e.className = 'tong kosong'; e.dataset.id = ''; e.innerHTML = ''; e.disabled = true; return; }
      if (e.dataset.id !== String(b.id)) {
        e.dataset.id = String(b.id); e.className = 'tong'; e.disabled = false;
        e.innerHTML = '<span class="tong-badan"><span class="tong-isi"></span><span class="tong-gelang g1"></span><span class="tong-gelang g2"></span><span class="tong-sasaran"></span></span><span class="tong-baki"></span>';
      }
      e.classList.toggle('penuh', b.penuh); e.disabled = b.penuh;
      $('.tong-sasaran', e).textContent = duit(b.target);
      $('.tong-baki', e).textContent = t('baki', { x: duit(Math.max(0, b.target - b.isi)) });
      $('.tong-isi', e).style.height = Math.min(100, b.isi / b.target * 100) + '%';
      e.setAttribute('aria-label', t('sasaran') + ' ' + duit(b.target) + ', ' + t('baki', { x: duit(b.target - b.isi) }));
      if (cad && cad.jenis === 'tuang' && cad.tong === i) { e.setAttribute('data-cadang-tong', '1'); e.classList.add('sasaran-cadang'); }
    });
  }
  function renderDulang() {
    const cad = UJI ? cariLangkah() : null;
    slotEl.forEach((e, i) => {
      const c = G.baki[i];
      e.removeAttribute('data-cadang-syiling'); e.classList.remove('cadang');
      if (!c) { e.className = 'slot kosong'; e.dataset.id = ''; e.innerHTML = ''; return; }
      if (e.dataset.id !== String(c.id)) { e.dataset.id = String(c.id); e.innerHTML = syilingSVG(c.v); }
      e.className = 'slot' + (G.sel === i ? ' pilih' : '');
      e.setAttribute('aria-label', t('syiling', { x: duit(c.v) })); e.setAttribute('aria-pressed', G.sel === i);
      if (cad && cad.syiling && cad.syiling[0] === i) { e.setAttribute('data-cadang-syiling', '1'); if (!UJI_TUKAR(cad)) e.classList.add('cadang'); }
    });
    $('#btn-tukar').disabled = G.sel === null;
  }
  const UJI_TUKAR = c => c.jenis === 'tukar';
  function renderHud() {
    const lv = L();
    $('#hud-tahap').textContent = t('tahap', { n: G.tahap + 1 });
    $('#hud-skor').textContent = G.skor;
    $('#nyawa').innerHTML = Array.from({ length: D.NYAWA }, (_, i) => SENI.ikon('hati', i < G.nyawa ? '' : 'hilang')).join('');
    $('#nyawa').setAttribute('aria-label', t('nyawa', { n: G.nyawa }));
    $('#hud-matlamat').textContent = t('tong', { a: G.bersih, b: lv.matlamat });
    const m = Math.max(0, G.masa);
    $('#hud-masa').textContent = Math.ceil(m) + 's'; $('#hud-masa').classList.toggle('kritikal', m <= 8);
    const bar = $('#bar-masa'); bar.style.width = (m / lv.masa * 100) + '%'; bar.classList.toggle('kritikal', m <= 8);
  }
  function renderSemua() { renderHud(); renderTong(); renderDulang(); }

  function apung(i, teks, salah) {
    const e = tongEl[i]; if (!e) return; const s = document.createElement('span'); s.className = 'apung' + (salah ? ' salah' : ''); s.textContent = teks; e.appendChild(s); setTimeout(() => s.remove(), 1000);
  }
  function hantu(fromEl, toEl, u) {
    try {
      const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect(), g = document.createElement('div');
      g.className = 'hantu'; g.innerHTML = syilingSVG(u); g.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`;
      document.body.appendChild(g);
      const dx = b.left + b.width / 2 - a.left - a.width / 2, dy = b.top + 30 - a.top - a.height / 2;
      const an = g.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx * .5}px,${dy - 50}px) scale(.95)`, offset: .45 }, { transform: `translate(${dx}px,${dy}px) scale(.6)`, opacity: .25 }], { duration: 300, easing: 'ease-in' });
      an.onfinish = () => g.remove(); setTimeout(() => g.remove(), 600);
    } catch (e) {}
  }

  // ---------- gelung ----------
  function mulaGame(tahap) {
    G.tahap = tahap; G.skor = 0; G.nyawa = D.NYAWA; G.kombo = 0; G.bintangTahap = []; G.keadaan = 'main';
    tunjuk('main'); mulaTahap(true);
  }
  function mulaTahap(baru) {
    const lv = L(); G.run++; clearTimeout(timerJeda);
    G.masa = lv.masa; G.bersih = 0; G.dibuat = 0; G.salah = 0; G.kombo = 0; G.sel = null; G.jeda = false;
    $('#tabir-tahap').hidden = true;
    G.tong = new Array(lv.tong).fill(null); G.baki = new Array(lv.slot).fill(null);
    binkaiTong();
    for (let i = 0; i < lv.tong; i++) G.tong[i] = buatTong();
    isiDulang(); renderSemua();
    if (baru !== 'ulang') bicara('mulaTahap', { n: G.tahap + 1, g: lv.matlamat }, 'idle'); else mood('goyang');
  }

  function klikSyiling(i) {
    if (G.keadaan !== 'main' || G.jeda || !G.baki[i]) return;
    SFX.pilih();
    G.sel = G.sel === i ? null : i;
    if (G.sel !== null) bicara('pilihSyiling', { x: duit(G.baki[i].v) });
    renderDulang();
  }
  function klikTong(i) {
    if (G.keadaan !== 'main' || G.jeda) return;
    if (G.sel === null) { bicara('pilihDulu', null, 'idle'); return; }
    tuang(G.sel, i);
  }
  function tukarSyiling() {
    if (G.keadaan !== 'main' || G.jeda) return;
    if (G.sel === null) { bicara('pilihDulu', null, 'idle'); return; }
    G.baki[G.sel] = null; G.sel = null; G.skor = Math.max(0, G.skor - 5);
    SFX.tukar(); isiDulang(); bicara('tukarMsg', null, 'idle'); renderSemua();
  }

  function tuang(ci, bi) {
    if (G.keadaan !== 'main' || G.jeda) return false;
    const c = G.baki[ci], b = G.tong[bi]; if (!c || !b || b.penuh) return false;
    hantu(slotEl[ci], tongEl[bi], c.v);
    G.baki[ci] = null; G.sel = null; b.isi += c.v;
    const run = G.run, lv = L();
    let selesai = false;
    if (b.isi > b.target) {
      const lebih = b.isi - b.target;
      b.isi = 0; b.plan = urai(b.target, lv); G.kombo = 0; G.salah++; G.nyawa--; G.jeda = true;
      SFX.salah(); bicara('lebih', { x: duit(lebih) }, 'oops', 1800); apung(bi, '-1', true);
      tongEl[bi].classList.add('lebih'); setTimeout(() => tongEl[bi] && tongEl[bi].classList.remove('lebih'), 600);
      if (G.nyawa <= 0) { renderSemua(); setTimeout(() => { if (G.run === run) akhiri(false); }, 750); return true; }
      setTimeout(() => { if (G.run === run) G.jeda = false; }, 450);
    } else if (b.isi === b.target) {
      b.penuh = true; G.bersih++; G.kombo++; selesai = true;
      const p = 100 + (G.kombo - 1) * 25; G.skor += p;
      SFX.penuh(G.kombo);
      bicara(G.kombo > 1 ? 'kombo' : 'penuh', { p, k: G.kombo }, 'happy'); apung(bi, '+' + p, false);
      setTimeout(() => {
        if (G.run !== run) return;
        if (G.bersih >= lv.matlamat) { selesaiTahap(); return; }
        G.tong[bi] = G.dibuat < lv.matlamat ? buatTong() : null;
        isiDulang(); renderSemua();
      }, 650);
    } else {
      SFX.tuang(b.isi / b.target);
      bicara('baik', { x: duit(b.target - b.isi) }, 'idle');
    }
    isiDulang(); renderSemua();
    return selesai;
  }

  function selesaiTahap() {
    G.jeda = true; clearTimeout(timerJeda);
    const bonus = Math.round(Math.max(0, G.masa)) * 5; G.skor += bonus;
    const bt = G.salah === 0 ? 3 : G.salah <= 1 ? 2 : 1; G.bintangTahap.push(bt);
    S.buka = Math.max(S.buka, Math.min(D.TAHAP.length, G.tahap + 2)); simpan();
    renderHud();
    if (G.tahap >= D.TAHAP.length - 1) { akhiri(true); return; }
    SFX.tahapSiap();
    $('#clawd-tahap').innerHTML = SENI.clawd('happy');
    $('#tahap-judul').textContent = t('tahapSiap', { n: G.tahap + 1 });
    $('#tahap-bintang').innerHTML = [0, 1, 2].map(i => SENI.ikon('bintang', i < bt ? '' : 'mati')).join('');
    $('#tahap-bintang').setAttribute('aria-label', t('bintangN', { n: bt }));
    $('#tahap-bonus').textContent = t('bonusMasa', { b: bonus });
    $('#tabir-tahap').hidden = false;
    const run = G.run; timerJeda = setTimeout(() => { if (G.run === run) lanjut(); }, 2400);
  }
  function lanjut() {
    if (G.keadaan !== 'main' || !G.jeda || $('#tabir-tahap').hidden) return;
    clearTimeout(timerJeda); G.tahap++; mulaTahap();
  }

  function masaHabis() {
    G.nyawa--; G.jeda = true; SFX.salah(); G.kombo = 0;
    const run = G.run; renderHud(); bicara('masaHabis', null, 'oops', 2000);
    if (G.nyawa <= 0) { setTimeout(() => { if (G.run === run) akhiri(false); }, 900); return; }
    setTimeout(() => { if (G.run === run && G.keadaan === 'main') mulaTahap('ulang'); }, 1500);
  }
  setInterval(() => {
    if (G.keadaan !== 'main' || G.jeda) return;
    G.masa -= 0.1; if (G.masa <= 0) { G.masa = 0; renderHud(); masaHabis(); return; }
    renderHud();
  }, 100);

  function akhiri(menang) {
    G.run++; clearTimeout(timerJeda); G.keadaan = 'hasil'; G.jeda = true; G.menang = menang;
    $('#tabir-tahap').hidden = true;
    const capai = menang ? D.TAHAP.length : G.tahap + 1;
    G.bintang = menang ? (G.nyawa >= 5 ? 3 : G.nyawa >= 3 ? 2 : 1) : (capai >= 5 ? 1 : 0);
    const lama = S.papan.reduce((m, r) => Math.max(m, r.skor), 0);
    G.rekod = G.skor > lama && G.skor > 0;
    if (G.skor > 0) { S.papan.push({ skor: G.skor, bintang: G.bintang, tahap: capai, bahasa: S.bahasa }); S.papan = S.papan.sort((a, b) => b.skor - a.skor).slice(0, 10); }
    simpan(); G.capai = capai;
    (menang ? SFX.menang : SFX.kalah)();
    rendahHasil(); tunjuk('hasil');
  }
  function rendahHasil() {
    $('#clawd-hasil').innerHTML = SENI.clawd(G.menang ? 'happy' : 'oops');
    $('#hasil-judul').textContent = t(G.menang ? 'menang' : 'kalah');
    $('#hasil-bintang').innerHTML = [0, 1, 2].map(i => SENI.ikon('bintang', i < G.bintang ? '' : 'mati')).join('');
    $('#hasil-bintang').setAttribute('aria-label', t('bintangN', { n: G.bintang }));
    $('#hasil-skor').textContent = G.skor; $('#hasil-tahap').textContent = G.capai;
    const r = $('#hasil-rekod'); r.hidden = !G.rekod; r.textContent = t('rekodBaru');
    $('#papan-hasil').innerHTML = papanHTML();
  }
  function keMenu() { G.run++; clearTimeout(timerJeda); G.keadaan = 'menu'; G.jeda = true; $('#tabir-tahap').hidden = true; rendahMenu(); tunjuk('menu'); }

  // ---------- pembantu ujian & strategi ----------
  function cariLangkah() {
    if (G.keadaan !== 'main' || G.jeda) return null;
    const open = bukaTong(), idx = G.baki.map((c, i) => c ? i : -1).filter(i => i >= 0);
    if (!idx.length) return null;
    let terbaik = null;
    open.forEach(({ b, i }) => {
      const r = b.target - b.isi, n = idx.length;
      for (let m = 1; m < (1 << n); m++) {
        let s = 0, cnt = 0; const pil = [];
        for (let j = 0; j < n; j++) if (m & (1 << j)) { s += G.baki[idx[j]].v; cnt++; pil.push(idx[j]); }
        if (s === r && (!terbaik || cnt < terbaik.syiling.length)) terbaik = { jenis: 'tuang', tong: i, syiling: pil.sort((x, y) => G.baki[y].v - G.baki[x].v), lengkap: true };
      }
    });
    if (terbaik) return terbaik;
    let best = null;
    open.forEach(({ b, i }) => { const r = b.target - b.isi; idx.forEach(ci => { const v = G.baki[ci].v; if (v <= r && (!best || v / r > best.n)) best = { jenis: 'tuang', tong: i, syiling: [ci], n: v / r }; }); });
    return best || { jenis: 'tukar', syiling: [idx[0]] };
  }
  function lakukan(langkah) {
    if (langkah.jenis === 'tukar') { G.sel = langkah.syiling[0]; tukarSyiling(); return false; }
    let selesai = false;
    for (const ci of langkah.syiling) selesai = tuang(ci, langkah.tong) || selesai;
    return selesai;
  }
  function jawabUji(betul) {
    if (G.keadaan !== 'main' || G.jeda) return false;
    if (betul) {
      for (let n = 0; n < 14 && G.keadaan === 'main' && !G.jeda; n++) { const l = cariLangkah(); if (!l) break; if (lakukan(l)) return true; }
      return true;
    }
    // salah: cari syiling yang melebihi baki
    let l = null;
    bukaTong().forEach(({ b, i }) => G.baki.forEach((c, ci) => { if (c && c.v > b.target - b.isi && !l) l = { jenis: 'tuang', tong: i, syiling: [ci] }; }));
    if (!l) { const open = bukaTong(), ci = G.baki.findIndex(Boolean); if (ci >= 0 && open.length) l = { jenis: 'tuang', tong: open[0].i, syiling: [ci] }; }
    if (l) lakukan(l);
    return true;
  }
  window.__game = {
    get keadaan() { return G.keadaan; }, get skor() { return G.skor; }, get nyawa() { return G.nyawa; }, get tahap() { return G.tahap + 1; },
    get bahasa() { return S.bahasa; }, get jeda() { return G.jeda; }, get sel() { return G.sel; }, get masa() { return G.masa; },
    get bintang() { return G.bintang; }, get bersih() { return G.bersih; },
    jawabUji, cadang: cariLangkah, paksaMasa(s) { G.masa = s; renderHud(); }
  };

  // ---------- acara ----------
  document.querySelectorAll('[data-bhs]').forEach(b => b.addEventListener('click', () => { S.bahasa = b.dataset.bhs; simpan(); SFX.pilih(); statik(); }));
  $('[data-uji=mula]').addEventListener('click', () => { SFX.pilih(); mulaGame(G.pilih || 0); });
  $('#btn-bahasa').addEventListener('click', () => { S.bahasa = S.bahasa === 'ms' ? 'id' : 'ms'; simpan(); SFX.pilih(); statik(); });
  ['#btn-bunyi', '#bunyi-menu'].forEach(s => $(s).addEventListener('click', () => { S.bunyi = !S.bunyi; SFX.set(S.bunyi); simpan(); if (S.bunyi) SFX.pilih(); statik(); }));
  $('#btn-rumah').addEventListener('click', keMenu);
  $('#btn-tukar').addEventListener('click', tukarSyiling);
  $('#btn-seterusnya').addEventListener('click', lanjut);
  $('[data-uji=main-semula]').addEventListener('click', () => { SFX.pilih(); mulaGame(0); });
  $('[data-uji=menu]').addEventListener('click', keMenu);

  G.pilih = 0; statik(); tunjuk('menu');
})();
