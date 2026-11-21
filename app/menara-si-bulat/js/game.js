(function () {
  'use strict';
  const L = Logic, LH = L.LH, TH = DATA.tahap, PAL = DATA.PALET, $ = s => document.querySelector(s), t = I18N.t;
  const VIEW_W = 280, GRAV = 900, HANG = 45;
  const cv = $('#cv'), c = cv.getContext('2d');
  let sv = { }; try { sv = JSON.parse(localStorage.getItem('jt.save') || '{}') || {}; } catch (e) { sv = {}; }
  const simpan = () => { try { localStorage.setItem('jt.save', JSON.stringify(sv)); } catch (e) {} };
  const G = { keadaan: 'menu', tahap: 0, tower: [], lapisan: 0, skor: 0, perfect: 0, combo: 0, fase: 'tamat', phase: 0, sisi: 1, bx: 0, by: 0, bw: 0, vy: 0, camY: -30, camT: -30,
    debris: [], part: [], pop: [], flash: 0, mood: 'senang', moodT: 0, tunda: 0, menang: false, sebab: '', bintang: 0, skalaMasa: 1, bubbleT: 0, T: 0 };
  let W = 300, H = 300, S = 1, dpr = 1;
  const hudB = Bulat.mount($('#cHud')), menuB = Bulat.mount($('#cMenu')), hasilB = Bulat.mount($('#cHasil'));
  const LV = () => TH[G.tahap], A = () => 125 - LV().w0 / 2;
  const topBlk = () => G.tower[G.tower.length - 1], topH = () => G.lapisan * LH;

  /* ---------- tampilan ---------- */
  function show(id) { for (const s of ['menu', 'peta', 'main']) $('#' + s).hidden = s !== id; $('#hasil').hidden = true; $('#btnBack').hidden = id === 'menu'; G.keadaan = id === 'main' ? 'main' : id; }
  function ikut() {
    document.querySelectorAll('[data-t]').forEach(e => e.textContent = t(e.dataset.t));
    $('#btnLang').textContent = I18N.lang.toUpperCase(); $('#btnLang').setAttribute('aria-label', t('bahasa'));
    $('#btnBack').innerHTML = Bulat.icon('back'); $('#btnBack').setAttribute('aria-label', t('kembali'));
    $('#btnSnd').innerHTML = Bulat.icon(Bunyi.mute ? 'sndOff' : 'sndOn'); $('#btnSnd').setAttribute('aria-label', t('bunyi'));
    $('#btnMula').innerHTML = Bulat.icon('play') + t('mula'); $('#btnDrop').innerHTML = Bulat.icon('down') + t('jatuh');
    $('#btnUlang').innerHTML = Bulat.icon('restart') + t('ulang'); $('#btnPeta').innerHTML = Bulat.icon('map') + t('pk'); $('#btnNext').innerHTML = t('seterusnya') + Bulat.icon('next');
    document.querySelectorAll('.pil').forEach(b => b.classList.toggle('on', b.dataset.loc === I18N.lang));
    if (!$('#peta').hidden) bangunPeta(); if (G.keadaan === 'main' || G.keadaan === 'hasil') { misi(); hud(); if (!$('#hasil').hidden) isiHasil(); }
  }
  const terbuka = i => i === 0 || (sv[i - 1] && sv[i - 1].s > 0);
  function bangunPeta() {
    $('#petaIsi').innerHTML = TH.map((v, i) => { const o = terbuka(i), s = (sv[i] && sv[i].s) || 0;
      return `<button class="lv" data-uji="tahap-${i}" data-i="${i}" ${o ? '' : 'disabled'}><small>${t('tahap')}</small><b>${i + 1}</b><small>${o ? L.fm(v.lap * LH) : Bulat.icon('lock') + ' ' + t('kunci')}</small><span class="stars">${[1, 2, 3].map(n => Bulat.star(s >= n)).join('')}</span></button>`; }).join('');
    document.querySelectorAll('.lv').forEach(b => b.onclick = () => { Bunyi.init(); Bunyi.tap(); mulaTahap(+b.dataset.i); });
  }
  function misi() { const v = LV(); $('#misiA').textContent = t('tahap') + ' ' + (G.tahap + 1) + ' · ' + t('misi', { h: L.fm(v.lap * LH) }); $('#misiB').textContent = t('min', { w: v.min }); }
  function hud() { $('#vTinggi').textContent = L.fm(topH()) + ' / ' + L.fm(LV().lap * LH); $('#vLebar').textContent = Math.round(G.bw) + ' cm'; $('#vSkor').textContent = G.skor; }
  function bubble(msg, ms) { const b = $('#bubble'); b.textContent = msg; b.classList.add('on'); G.bubbleT = ms || 1.3; }
  function mood(m, d) { G.mood = m; hudB.mood = m; G.moodT = d || 1.2; }

  /* ---------- permainan ---------- */
  function mulaTahap(i) {
    G.tahap = i; const v = LV(); G.tower = [{ x: 0, w: v.w0, base: true }]; G.lapisan = 0; G.skor = 0; G.perfect = 0; G.combo = 0; G.debris = []; G.part = []; G.pop = [];
    G.camY = G.camT = -32; G.sisi = 1; G.menang = false; G.sebab = ''; G.bintang = 0; G.flash = 0; show('main'); G.keadaan = 'main'; G.bw = v.w0; misi(); ikut2(); spawn(); mood('senang'); bubble(t('mulaMsg'), 2.2); resize();
  }
  function ikut2() { hud(); }
  function spawn() { const top = topBlk(); G.bw = top.w; G.phase = G.sisi * Math.PI / 2; G.sisi = -G.sisi; G.bx = L.swingX(G.phase, A()); G.by = topH() + HANG; G.fase = 'ayun'; hud(); }
  function jatuhkan() {
    if (G.keadaan !== 'main' || G.fase !== 'ayun') return; Bunyi.init(); G.fase = 'jatuh'; G.vy = 0; Bunyi.tap();
  }
  function pop(txt, x, y, col) { G.pop.push({ txt, x, y, col: col || '#1d2b4f', l: 1 }); }
  function burst(x, y, col, n, spd) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = (0.3 + Math.random()) * (spd || 90); G.part.push({ x, y, vx: Math.cos(a) * s, vy: Math.abs(Math.sin(a)) * s + 30, l: 1, col, r: 1.5 + Math.random() * 2 }); } }
  function mendarat() {
    const v = LV(), top = topBlk(), r = L.resolve(top, { x: G.bx, w: G.bw }, v.tol), idx = G.lapisan, col = PAL[idx % PAL.length], y = topH();
    if (r.kind === 'miss') {
      G.debris.push({ x: G.bx, y, w: G.bw, col, vx: G.bx > top.x ? 30 : -30, vy: 0, rot: 0, vr: G.bx > top.x ? 2 : -2, l: 1 });
      Bunyi.kalah(); return tamat(false, 'miss');
    }
    let blok;
    if (r.kind === 'perfect') {
      G.perfect++; G.combo++; const w = L.regrow(r.w, v.w0, G.combo); blok = { x: r.x, w };
      G.skor += L.skorSusun(true, G.combo, G.tahap); G.flash = 1; Bunyi.sempurna(G.combo - 1); mood('gembira', 1.5);
      pop(t('sempurna') + (G.combo > 1 ? ' x' + Math.min(G.combo, 5) : ''), r.x, y + LH + 8, '#c27a00'); bubble(t('sempurna'), 1); burst(r.x, y + LH, '#ffd23f', 14, 110);
    } else {
      G.combo = 0; blok = { x: r.x, w: r.w }; G.skor += L.skorSusun(false, 0, G.tahap); Bunyi.potong(); Bunyi.jatuh();
      G.debris.push({ x: r.cutX, y, w: r.cutW, col, vx: r.side * 25, vy: 0, rot: 0, vr: r.side * 2.5, l: 1 });
      pop(t('potong', { c: Math.round(r.cutW) }), r.cutX, y + LH + 8, '#c0392b'); mood(r.cutW > G.bw * .5 ? 'oops' : 'fikir', 1.2); burst(r.cutX, y + LH, col, 6, 60);
    }
    if (r.kind === 'perfect') Bunyi.jatuh();
    G.tower.push(blok); G.lapisan++; G.camT = Math.max(-32, topH() - 0.3 * (H / S)); hud();
    if (blok.w < v.min) return tamat(false, 'sempit');
    if (G.lapisan >= v.lap) return tamat(true, '');
    G.fase = 'tunggu'; G.tunda = 0.16;
  }
  function tamat(menang, sebab) {
    G.fase = 'tamat'; G.menang = menang; G.sebab = sebab; G.tunda = menang ? 1.1 : 0.9;
    if (menang) { Bunyi.menang(); mood('gembira', 9); G.bintang = L.stars(true, G.perfect, LV().lap); G.skor += 100 + G.bintang * 50;
      for (let i = 0; i < 60; i++) G.part.push({ x: (Math.random() - .5) * 200, y: topH() + 30 + Math.random() * 60, vx: (Math.random() - .5) * 80, vy: 60 + Math.random() * 120, l: 1.6, col: PAL[i % 7], r: 2.5 }); }
    else { mood('oops', 9); G.bintang = 0; }
    hud();
  }
  let rekodBaru = false;
  function keHasil() {
    const o = sv[G.tahap] || { s: 0, b: 0 }; rekodBaru = G.menang && G.skor > (o.b || 0);
    if (G.menang) { sv[G.tahap] = { s: Math.max(o.s || 0, G.bintang), b: Math.max(o.b || 0, G.skor) }; simpan(); }
    G.keadaan = 'hasil'; $('#hasil').hidden = false; isiHasil(); hasilB.mood = G.menang ? 'gembira' : 'oops';
  }
  function isiHasil() {
    $('#hTajuk').textContent = G.menang ? t('menang') : t('kalah');
    $('#hBintang').innerHTML = [1, 2, 3].map(n => Bulat.star(G.bintang >= n)).join('');
    $('#hAlasan').textContent = G.menang ? (rekodBaru ? t('pecah') : '') : G.sebab === 'miss' ? t('miss') : t('sempit', { w: Math.round(topBlk().w), m: LV().min });
    $('#hStat').textContent = t('stat', { h: L.fm(topH()), p: G.perfect, s: G.skor });
    $('#btnNext').hidden = !(G.menang && G.tahap < TH.length - 1);
  }

  /* ---------- kemas kini ---------- */
  function kemas(dt) {
    G.T += dt; const v = LV();
    if (G.keadaan === 'main') {
      if (G.fase === 'ayun') { G.phase += v.v * G.skalaMasa * dt; G.bx = L.swingX(G.phase, A()); }
      else if (G.fase === 'jatuh') { G.vy += GRAV * dt; G.by -= G.vy * dt; if (G.by <= topH()) { G.by = topH(); mendarat(); } }
      else if (G.fase === 'tunggu') { G.tunda -= dt; if (G.tunda <= 0) spawn(); }
      else if (G.fase === 'tamat') { G.tunda -= dt; if (G.tunda <= 0) keHasil(); }
    }
    G.camY += (G.camT - G.camY) * Math.min(1, dt * 4);
    for (const d of G.debris) { d.vy += GRAV * dt; d.y -= d.vy * dt; d.x += d.vx * dt; d.rot += d.vr * dt; d.l -= dt * .7; } G.debris = G.debris.filter(d => d.l > 0);
    for (const p of G.part) { p.vy -= 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; } G.part = G.part.filter(p => p.l > 0);
    for (const p of G.pop) { p.y += 22 * dt; p.l -= dt * .8; } G.pop = G.pop.filter(p => p.l > 0);
    G.flash = Math.max(0, G.flash - dt * 2.5);
    if (G.moodT > 0) { G.moodT -= dt; if (G.moodT <= 0 && G.keadaan === 'main') { G.mood = 'senang'; hudB.mood = 'senang'; } }
    if (G.bubbleT > 0) { G.bubbleT -= dt; if (G.bubbleT <= 0) $('#bubble').classList.remove('on'); }
    if (G.fase === 'ayun') $('#vLebar').textContent = Math.round(G.bw) + ' cm';
  }

  /* ---------- lukis ---------- */
  const px = x => W / 2 + x * S, py = h => H - (h - G.camY) * S;
  function blok(x, y, w, col, label, alpha, rot) {
    const X = px(x - w / 2), Y = py(y + LH), ww = w * S, hh = LH * S; c.save(); c.globalAlpha = alpha == null ? 1 : alpha;
    if (rot) { c.translate(px(x), py(y + LH / 2)); c.rotate(rot); c.translate(-px(x), -py(y + LH / 2)); }
    c.fillStyle = col; rr(X, Y, ww, hh, Math.min(5, hh * .25)); c.fill(); c.strokeStyle = 'rgba(29,43,79,.55)'; c.lineWidth = 1.6; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.4)'; rr(X + 2, Y + 2, ww - 4, hh * .28, 3); c.fill();
    if (label && ww > 60) { c.fillStyle = 'rgba(29,43,79,.85)'; c.font = `700 ${Math.max(10, hh * .5)}px system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, X + ww / 2, Y + hh * .6); }
    c.restore();
  }
  function rr(x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function lukis() {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9fd0ff'); g.addColorStop(.6, '#ffd9bd'); g.addColorStop(1, '#ffc7a0'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const lo = G.camY, hi = G.camY + H / S, x0 = px(-VIEW_W / 2);
    // pembaris
    c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(x0, 0, 15 * S, H); c.strokeStyle = 'rgba(29,43,79,.7)'; c.fillStyle = 'rgba(29,43,79,.75)'; c.lineWidth = 1.3; c.textAlign = 'left'; c.textBaseline = 'middle'; c.font = '700 10px system-ui';
    for (let h = Math.max(0, Math.ceil(lo / 10) * 10); h <= hi; h += 10) { const y = py(h), big = h % 50 === 0, m = h % 100 === 0; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + (m ? 15 : big ? 11 : 6) * S, y); c.stroke(); if (big) c.fillText(L.fm(h).replace(' m', m ? ' m' : ''), x0 + 17 * S, y); }
    // garis sasaran
    const ty = py(LV().lap * LH); c.save(); c.setLineDash([8, 6]); c.strokeStyle = '#d98a00'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x0, ty); c.lineTo(px(VIEW_W / 2), ty); c.stroke(); c.restore();
    c.fillStyle = '#d98a00'; c.font = '800 12px system-ui'; c.textAlign = 'right'; c.fillText(t('sasaran', { h: L.fm(LV().lap * LH) }), px(VIEW_W / 2) - 4, ty - 9);
    // tanah + pelantar
    const gy = py(0), b = G.tower[0]; c.fillStyle = '#9b7b5a'; c.fillRect(0, gy + LH * S, W, H); c.fillStyle = '#7fcf8a'; c.fillRect(0, gy + LH * S, W, 7);
    blok(b.x, -LH, b.w, '#c9b8a0', null); 
    for (let i = 1; i < G.tower.length; i++) { const k = G.tower[i]; blok(k.x, (i - 1) * LH, k.w, PAL[(i - 1) % PAL.length], i === G.tower.length - 1 ? Math.round(k.w) + ' cm' : null); }
    if (G.flash > 0 && G.tower.length > 1) { const k = G.tower[G.tower.length - 1], y = (G.tower.length - 2) * LH; c.fillStyle = `rgba(255,255,255,${G.flash * .7})`; rr(px(k.x - k.w / 2), py(y + LH), k.w * S, LH * S, 4); c.fill(); }
    if (G.keadaan === 'main' && G.fase !== 'tamat' && G.fase !== 'tunggu') {
      const col = PAL[G.lapisan % PAL.length]; c.strokeStyle = 'rgba(29,43,79,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(px(G.bx), 0); c.lineTo(px(G.bx), py(G.by + LH)); c.stroke();
      blok(G.bx, G.by, G.bw, col, Math.round(G.bw) + ' cm');
      if (G.fase === 'ayun') { c.setLineDash([3, 5]); c.strokeStyle = 'rgba(29,43,79,.28)'; c.beginPath(); c.moveTo(px(G.bx), py(G.by)); c.lineTo(px(G.bx), py(topH() + LH)); c.stroke(); c.setLineDash([]); }
    }
    // maskot menunggang blok / menara
    const r = Math.max(10, Math.min(15, (G.bw || 60) * .26)), mx = G.fase === 'ayun' || G.fase === 'jatuh' ? G.bx : topBlk().x, my = G.fase === 'ayun' || G.fase === 'jatuh' ? G.by + LH : topH() + LH;
    Bulat.draw(c, px(mx), py(my + r * .85), r * S, G.mood, G.T);
    for (const d of G.debris) blok(d.x, d.y, d.w, d.col, null, Math.max(0, d.l), d.rot);
    for (const p of G.part) { c.fillStyle = p.col; c.globalAlpha = Math.max(0, Math.min(1, p.l)); c.beginPath(); c.arc(px(p.x), py(p.y), p.r * S * .8, 0, 7); c.fill(); } c.globalAlpha = 1;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '800 14px system-ui';
    for (const p of G.pop) { c.globalAlpha = Math.max(0, Math.min(1, p.l * 1.5)); c.lineWidth = 4; c.strokeStyle = '#fff'; c.strokeText(p.txt, px(p.x), py(p.y)); c.fillStyle = p.col; c.fillText(p.txt, px(p.x), py(p.y)); } c.globalAlpha = 1;
  }
  function resize() {
    const r = $('#stage').getBoundingClientRect(); if (!r.width) return; dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); S = Math.min(W / VIEW_W, H / 300); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    G.camT = Math.max(-32, topH() - 0.3 * (H / S)); if (G.lapisan === 0) G.camY = G.camT;
  }
  let last = performance.now();
  function frame(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; kemas(dt); if (!$('#main').hidden) { c.setTransform(dpr, 0, 0, dpr, 0, 0); lukis(); } requestAnimationFrame(frame); }

  /* ---------- input ---------- */
  cv.addEventListener('pointerdown', e => { e.preventDefault(); jatuhkan(); });
  $('#btnDrop').onclick = jatuhkan;
  addEventListener('keydown', e => { if (['Space', 'Enter', 'ArrowDown'].includes(e.code)) { if (G.keadaan === 'main' && document.activeElement !== $('#btnDrop')) { e.preventDefault(); jatuhkan(); } } });
  addEventListener('resize', resize); new ResizeObserver(resize).observe($('#stage'));
  $('#btnBack').onclick = () => { Bunyi.tap(); if (G.keadaan === 'main' || G.keadaan === 'hasil') { bangunPeta(); show('peta'); } else { show('menu'); } ikut(); };
  $('#btnLang').onclick = () => { I18N.set(I18N.lang === 'ms' ? 'id' : 'ms'); ikut(); };
  $('#btnSnd').onclick = () => { Bunyi.toggle(); Bunyi.init(); Bunyi.tap(); ikut(); };
  document.querySelectorAll('.pil').forEach(b => b.onclick = () => { Bunyi.init(); I18N.set(b.dataset.loc); ikut(); });
  $('#btnMula').onclick = () => { Bunyi.init(); Bunyi.tap(); bangunPeta(); show('peta'); ikut(); };
  $('#btnUlang').onclick = () => { Bunyi.tap(); mulaTahap(G.tahap); };
  $('#btnNext').onclick = () => { Bunyi.tap(); mulaTahap(G.tahap + 1); };
  $('#btnPeta').onclick = () => { Bunyi.tap(); bangunPeta(); show('peta'); ikut(); };

  window.__game = { get keadaan() { return G.keadaan; }, get fase() { return G.fase; }, get tahap() { return G.tahap; }, get lapisan() { return G.lapisan; }, get skor() { return G.skor; },
    get perfect() { return G.perfect; }, get lebar() { return G.bw; }, get menang() { return G.menang; }, get sebab() { return G.sebab; }, get bintang() { return G.bintang; },
    get lebarAtas() { return topBlk().w; }, get skalaMasa() { return G.skalaMasa; }, set skalaMasa(v) { G.skalaMasa = v; }, dx: () => G.bx - topBlk().x, mulaTahap, jatuhkan,
    simpan: () => JSON.parse(JSON.stringify(sv)),
    // pembantu ujian: letakkan blok berayun pada ofset (cm) dari menara, kemudian pemain sebenar mengetik
    sejajarkan(o) { if (G.fase !== 'ayun') return false; const x = Math.max(-A(), Math.min(A(), topBlk().x + o)); G.phase = Math.asin(x / A()) + (Math.cos(G.phase) < 0 ? 0 : 0); G.bx = L.swingX(G.phase, A()); return true; } };
  I18N.set(I18N.lang); ikut(); show('menu'); G.keadaan = 'menu'; requestAnimationFrame(frame);
})();
