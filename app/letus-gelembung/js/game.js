/* Clawd Letus Gelembung — mesin keadaan menu → peta → main → hasil. */
(function () {
  'use strict';
  const { W, H, R, ROWH, BALLR, SX, SY, DANGER } = GT, LV = GT_LEVELS;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const I = {
    back: '<svg class="ik" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    on: '<svg class="ik" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/></svg>',
    off: '<svg class="ik" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
    '+': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>',
    '-': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M4 12h16"/></svg>',
    '*': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    m: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M12 3v7M8.5 6.5h7M4 14h6M14 14l6 6M20 14l-6 6"/></svg>',
    star: f => `<svg viewBox="0 0 24 24"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z" fill="${f ? '#ffc94d' : 'none'}" stroke="${f ? '#d99a1c' : '#7fb3cc'}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    lock: '<svg class="ik" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2.5" fill="currentColor"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>'
  };
  const seedP = new URLSearchParams(location.search).get('seed');
  const randFn = seedP ? GT.rng(+seedP || 1) : Math.random;

  let save = { stars: [], best: [] };
  try { const s = JSON.parse(localStorage.getItem('ctg.v1')); if (s && Array.isArray(s.stars)) save = s; } catch (e) {}
  const persist = () => { try { localStorage.setItem('ctg.v1', JSON.stringify(save)); } catch (e) {} };

  const S = { state: 'menu', lv: 0, G: null, score: 0, combo: 0, solved: 0, wrong: 0, q: null, prevAns: 0, ball: null, aim: 90, down: false, offY: 0, rowT: 0, rowPend: false, ending: false, fx: [], fall: [], txt: [], ring: [], bokeh: [], last: 0, k: 1, shots: 0 };
  for (let i = 0; i < 14; i++) S.bokeh.push({ x: Math.random() * W, y: Math.random() * H, r: 6 + Math.random() * 16, v: 6 + Math.random() * 10 });
  const cv = $('#cv'), ctx = cv.getContext('2d'), stage = $('#stage'), clawdEl = $('#clawd');

  /* ---------- bahasa & skrin ---------- */
  const t = k => I18N.t(k);
  function applyLang() {
    const L = I18N.all();
    $$('[data-t]').forEach(e => { e.textContent = L[e.dataset.t]; });
    $$('[data-loc]').forEach(b => { b.textContent = L[b.dataset.loc]; b.setAttribute('aria-pressed', b.dataset.loc === I18N.lang); });
    $('#btnLang').textContent = L.bahasa; $('#btnLang').setAttribute('aria-label', L.bahasa);
    $('#btnMula').textContent = L.mula; $('#btnBack').setAttribute('aria-label', L.kembali);
    $('#btnNext').textContent = L.seterusnya; $('#btnUlang').textContent = L.ulang; $('#btnPeta').textContent = L.kePeta;
    $('#btnSnd').innerHTML = Bunyi.mute ? I.off : I.on; $('#btnSnd').setAttribute('aria-label', Bunyi.mute ? L.bunyiOff : L.bunyiOn);
    $('#petunjuk').textContent = matchMedia('(pointer:coarse)').matches ? L.petunjuk : L.petunjukKunci;
    if (S.state === 'peta') renderPeta();
    if (S.state === 'hasil') fillHasil(S.lastWin);
    if (S.state === 'main') hud();
  }
  function show(id) {
    ['menu', 'peta', 'main'].forEach(s => { $('#' + s).hidden = s !== id; });
    $('#hasil').hidden = true; $('#btnBack').hidden = id === 'menu'; $('#btnBack').innerHTML = I.back;
    S.state = id; if (id === 'main') requestAnimationFrame(fit);
  }
  function renderPeta() {
    const L = I18N.all(), box = $('#petaIsi'); box.innerHTML = '';
    LV.forEach((lv, i) => {
      const open = i === 0 || save.stars[i - 1] > 0, st = save.stars[i] || 0;
      const b = document.createElement('button'); b.className = 'kartu'; b.dataset.uji = 'tahap-' + i; b.disabled = !open;
      b.innerHTML = `<span class="opik">${open ? I[lv.op] : I.lock}</span><span class="no">${L.tahap} ${i + 1}</span><small>${L.sub_tahap[i]}</small><span class="bt">${[1, 2, 3].map(n => I.star(st >= n)).join('')}</span>`;
      b.setAttribute('aria-label', `${L.tahap} ${i + 1}, ${L.sub_tahap[i]}${open ? '' : ', ' + L.tahapDikunci}`);
      b.onclick = () => { Bunyi.klik(); startLevel(i); };
      box.appendChild(b);
    });
  }
  let moodT = 0;
  function mood(m, ms) { clawdEl.innerHTML = Clawd.svg(m); clearTimeout(moodT); if (m !== 'senang') moodT = setTimeout(() => { clawdEl.innerHTML = Clawd.svg('senang'); }, ms || 1100); }

  /* ---------- permainan ---------- */
  function startLevel(i) {
    const lv = LV[i];
    Object.assign(S, { lv: i, G: GT.newGrid(lv, randFn), score: 0, combo: 0, solved: 0, wrong: 0, ball: null, offY: 0, rowT: 0, rowPend: false, ending: false, fx: [], fall: [], txt: [], ring: [], aim: 90, down: false, shots: 0, prevAns: 0 });
    nextQuestion(); show('main'); mood('senang'); hud(); S.last = performance.now(); fit();
  }
  function nextQuestion() {
    const lv = LV[S.lv];
    for (let k = 0; k < 6; k++) {
      const re = GT.reachable(S.G), vals = new Set();
      re.forEach(e => vals.add(S.G.rows[e.r][e.c].v));
      let c = [...vals].filter(v => GT.makeQuestion(v, lv, randFn));
      const o = c.filter(v => v !== S.prevAns); if (o.length) c = o;
      if (c.length) { const v = GT.pick(c, randFn); S.q = GT.makeQuestion(v, lv, randFn); S.prevAns = v; const el = $('#soalQ'); el.classList.remove('baru'); void el.offsetWidth; el.classList.add('baru'); return; }
      addRowRaw();
    }
  }
  function ensureQuestion() {
    const re = GT.reachable(S.G);
    for (const e of re.values()) if (S.G.rows[e.r][e.c].v === S.q.ans) return;
    nextQuestion(); hud();
  }
  function addRowRaw() { GT.newRow(S.G, LV[S.lv], randFn, 0.04); S.offY = -ROWH; }
  function addRow() {
    addRowRaw(); S.rowT = 0; Bunyi.baris();
    if (GT.lowest(S.G) > DANGER) return lose();
    ensureQuestion();
  }
  function hud() {
    const lv = LV[S.lv];
    $('#soalQ').textContent = S.q ? S.q.text + ' = ?' : '?';
    $('#vSkor').textContent = S.score; $('#vSoalan').textContent = S.solved + '/' + lv.target;
    $('#vKombo').textContent = 'x' + Math.max(1, S.combo); $('#kombo').classList.toggle('hidup', S.combo >= 2);
  }
  function fire(angle) {
    if (S.state !== 'main' || S.ball || S.ending) return false;
    const res = GT.simulate(S.G, angle), p = res.path; let len = 0; const cum = [0];
    for (let i = 1; i < p.length; i++) { len += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y); cum.push(len); }
    S.ball = { res, path: p, cum, len, d: 0, nv: 1 }; S.shots++;
    Bunyi.tembak(); clawdEl.classList.remove('tembak'); void clawdEl.offsetWidth; clawdEl.classList.add('tembak');
    return true;
  }
  function burst(x, y, col, n) {
    S.ring.push({ x, y, t: 0, col });
    for (let i = 0; i < (n || 8); i++) { const a = Math.random() * 6.28, s = 60 + Math.random() * 120; S.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.5 + Math.random() * 0.3, col, r: 2 + Math.random() * 3 }); }
  }
  function float(x, y, txt, col) { S.txt.push({ x: Math.max(46, Math.min(W - 46, x)), y, txt, life: 1.1, col: col || '#fff' }); }
  function finishBall() {
    const b = S.ball; S.ball = null; const res = b.res;
    if (!res.hit) { burst(b.path[b.path.length - 1].x, 26, '#fff', 5); }
    else {
      const hb = S.G.rows[res.hit.r][res.hit.c];
      if (hb && hb.v === S.q.ans) correct(res); else wrong(res, hb);
    }
    if (S.rowPend && !S.ending) { S.rowPend = false; addRow(); }
  }
  function correct(res) {
    const G = S.G, lv = LV[S.lv], flood = GT.floodSame(G, res.hit.r, res.hit.c);
    S.combo++; const mult = 1 + 0.5 * Math.min(S.combo - 1, 4);
    const hx = flood[0].x, hy = flood[0].y + S.offY;
    flood.forEach(e => { burst(e.x, e.y + S.offY, Clawd.COL[e.b.v % 6], 8); G.rows[e.r][e.c] = null; });
    let base = 10 * flood.length + (flood.length >= 3 ? 10 * (flood.length - 2) : 0), bonus = 0;
    const n = GT.compact(G); if (n) S.offY += ROWH * n;
    const orf = GT.orphans(G);
    orf.forEach((e, i) => { S.fall.push({ x: e.x, y: e.y + S.offY, vx: (Math.random() - 0.5) * 60, vy: -80, v: e.b.v }); G.rows[e.r][e.c] = null; Bunyi.jatuh(Math.min(i, 5)); });
    GT.compact(G);
    bonus += orf.length * 15; if (res.bounces > 0) bonus += 20;
    const pts = Math.round((base + bonus) * mult); S.score += pts;
    Bunyi.letus(S.combo - 1);
    float(hx, hy, '+' + pts, '#fff7c2');
    let oy = 22; const L = I18N.all();
    if (flood.length >= 3) { float(hx, hy - oy, L.berantai, '#b6f0a0'); oy += 20; }
    if (res.bounces > 0) { float(hx, hy - oy, L.pantulan, '#9ff0e0'); oy += 20; }
    if (orf.length) { float(hx, hy - oy, L.jatuh + ' ' + orf.length, '#ffd27a'); oy += 20; }
    if (S.combo >= 2) float(hx, hy + 24, 'x' + S.combo, '#ffb347');
    mood(S.combo >= 3 ? 'gembira' : 'senang', 900); if (S.combo < 3) { clawdEl.innerHTML = Clawd.svg('gembira'); clearTimeout(moodT); moodT = setTimeout(() => { clawdEl.innerHTML = Clawd.svg('senang'); }, 900); }
    S.solved++;
    if (S.solved >= lv.target) { hud(); return win(); }
    let safety = 0; while (GT.count(G) < 10 && safety++ < 4) addRowRaw();
    if (!GT.count(G)) addRowRaw();
    nextQuestion(); hud();
  }
  function wrong(res, hb) {
    if (hb) hb.shake = 0.5; S.combo = 0; S.wrong++; Bunyi.salah(); mood('oops', 1300);
    const e = GT.list(S.G).find(o => o.r === res.hit.r && o.c === res.hit.c);
    if (e) { float(e.x, e.y + S.offY, '×', '#ff9a9a'); burst(e.x, e.y + S.offY, '#ff9a9a', 4); }
    addRow(); hud();
  }
  function stars() { return S.wrong <= 1 ? 3 : S.wrong <= 3 ? 2 : 1; }
  function win() {
    S.ending = true; S.lastWin = true; const n = stars(), i = S.lv;
    save.stars[i] = Math.max(save.stars[i] || 0, n); save.best[i] = Math.max(save.best[i] || 0, S.score); persist(); Bunyi.menang(); mood('gembira', 2000);
    setTimeout(() => showHasil(true), 900);
  }
  function lose() { S.ending = true; S.lastWin = false; Bunyi.kalah(); mood('oops', 2000); hud(); setTimeout(() => showHasil(false), 800); }
  function fillHasil(w) {
    const L = I18N.all(), n = w ? stars() : 0;
    $('#hTajuk').textContent = w ? L.menang : L.kalah;
    $('#hBintang').innerHTML = [1, 2, 3].map(k => `<span class="s" style="animation-delay:${0.15 + k * 0.18}s">${I.star(n >= k)}</span>`).join('');
    $('#hSkor').textContent = S.score; $('#hBest').textContent = save.best[S.lv] || 0;
    $('#mHasil').innerHTML = Clawd.svg(w ? 'gembira' : 'oops');
    $('#btnNext').hidden = !(w && S.lv < LV.length - 1);
  }
  function showHasil(w) {
    S.state = 'hasil'; S.lastWin = w; fillHasil(w); $('#hasil').hidden = false;
    if (w) for (let k = 0; k < stars(); k++) setTimeout(() => Bunyi.bintang(k), 300 + k * 180);
  }

  /* ---------- gelung & lukis ---------- */
  function fit() {
    const a = $('#arena'), aw = a.clientWidth, ah = a.clientHeight; if (!aw || !ah) return;
    const k = Math.min(aw / W, ah / H), dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    stage.style.width = Math.floor(W * k) + 'px'; stage.style.height = Math.floor(H * k) + 'px';
    cv.width = Math.round(W * k * dpr); cv.height = Math.round(H * k * dpr); S.k = cv.width / W;
  }
  function update(dt) {
    const lv = LV[S.lv];
    S.offY *= Math.exp(-9 * dt); if (Math.abs(S.offY) < 0.3) S.offY = 0;
    if (S.state === 'main' && !S.ending) {
      S.rowT += dt;
      if (S.rowT >= lv.rowEvery) { S.rowT = 0; if (S.ball) S.rowPend = true; else addRow(); }
    }
    const bar = $('#desakBar'); bar.style.width = Math.min(100, S.rowT / lv.rowEvery * 100) + '%';
    $('.desak').classList.toggle('bahaya', S.rowT / lv.rowEvery > 0.8 || GT.lowest(S.G) > DANGER - 70);
    if (S.ball) {
      const b = S.ball; b.d += lv.speed * dt;
      while (b.nv < b.path.length - 1 && b.cum[b.nv] <= b.d) { b.nv++; Bunyi.pantul(); }
      if (b.d >= b.len) finishBall();
    }
    S.G.rows.forEach(r => r.forEach(b => { if (b && b.shake > 0) b.shake = Math.max(0, b.shake - dt); }));
    S.fall.forEach(f => { f.vy += 1100 * dt; f.x += f.vx * dt; f.y += f.vy * dt; }); S.fall = S.fall.filter(f => f.y < H + 40);
    S.fx.forEach(p => { p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }); S.fx = S.fx.filter(p => p.life > 0);
    S.ring.forEach(r => { r.t += dt * 3.2; }); S.ring = S.ring.filter(r => r.t < 1);
    S.txt.forEach(x => { x.y -= 26 * dt; x.life -= dt; }); S.txt = S.txt.filter(x => x.life > 0);
    S.bokeh.forEach(b => { b.y -= b.v * dt; if (b.y < -30) { b.y = H + 30; b.x = Math.random() * W; } });
  }
  function bubble(x, y, v, a) {
    const col = Clawd.COL[v % 6];
    ctx.save(); ctx.globalAlpha = a == null ? 1 : a;
    ctx.beginPath(); ctx.arc(x, y, R - 1, 0, 6.2832); ctx.fillStyle = col; ctx.fill();
    const g = ctx.createRadialGradient(x - R * 0.3, y - R * 0.35, R * 0.15, x, y, R); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.55, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(10,50,90,.28)');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x - R * 0.42, y - R * 0.5, R * 0.26, R * 0.14, -0.6, 0, 6.2832); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill();
    ctx.fillStyle = '#12304a'; ctx.font = '800 ' + (v > 99 ? 14 : 18) + 'px ui-rounded,system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(v, x, y + 1.5);
    ctx.restore();
  }
  function draw() {
    const G = S.G; if (!G) return;
    ctx.setTransform(S.k, 0, 0, S.k, 0, 0); ctx.clearRect(0, 0, W, H);
    S.bokeh.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.2832); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill(); });
    const near = GT.lowest(G) > DANGER - 70;
    ctx.save(); ctx.setLineDash([10, 8]); ctx.lineWidth = 2.5; ctx.strokeStyle = near ? 'rgba(255,107,107,.95)' : 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.moveTo(0, DANGER); ctx.lineTo(W, DANGER); ctx.stroke(); ctx.restore();
    GT.list(G).forEach(e => { const sh = e.b.shake > 0 ? Math.sin(e.b.shake * 60) * 4 * (e.b.shake / 0.5) : 0; bubble(e.x + sh, e.y + S.offY, e.b.v); });
    S.fall.forEach(f => bubble(f.x, f.y, f.v, 0.9));
    // bidik
    if (S.state === 'main' && !S.ball && !S.ending) {
      const res = GT.simulate(G, S.aim); ctx.save(); ctx.setLineDash([2, 9]); ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.75)';
      ctx.beginPath(); res.path.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); ctx.restore();
      if (res.hit) { const e = GT.list(G).find(o => o.r === res.hit.r && o.c === res.hit.c); if (e) { ctx.save(); ctx.setLineDash([5, 5]); ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(e.x, e.y + S.offY, R + 3, 0, 6.2832); ctx.stroke(); ctx.restore(); } }
    }
    // meriam
    ctx.save(); ctx.translate(SX, SY); ctx.rotate(-S.aim * Math.PI / 180);
    ctx.fillStyle = '#0f4a6e'; ctx.strokeStyle = '#e8f6ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(4, -11, 36, 22, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffb347'; ctx.fillRect(34, -12, 8, 24); ctx.restore();
    // mutiara
    let bx = SX, by = SY;
    if (S.ball) { const b = S.ball; let i = 1; while (i < b.path.length - 1 && b.cum[i] < b.d) i++; const seg = b.cum[i] - b.cum[i - 1] || 1, f = Math.min(1, (b.d - b.cum[i - 1]) / seg); bx = b.path[i - 1].x + (b.path[i].x - b.path[i - 1].x) * f; by = b.path[i - 1].y + (b.path[i].y - b.path[i - 1].y) * f; }
    if (S.ball || (!S.ending)) { const g = ctx.createRadialGradient(bx - 5, by - 5, 2, bx, by, BALLR); g.addColorStop(0, '#fff'); g.addColorStop(0.6, '#f3e6ff'); g.addColorStop(1, '#c9b4f0'); ctx.beginPath(); ctx.arc(bx, by, BALLR, 0, 6.2832); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); }
    S.ring.forEach(r => { ctx.beginPath(); ctx.arc(r.x, r.y, R * (0.6 + r.t * 1.2), 0, 6.2832); ctx.lineWidth = 4 * (1 - r.t); ctx.strokeStyle = r.col; ctx.globalAlpha = 1 - r.t; ctx.stroke(); ctx.globalAlpha = 1; });
    S.fx.forEach(p => { ctx.globalAlpha = Math.max(0, p.life * 1.6); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fillStyle = p.col; ctx.fill(); }); ctx.globalAlpha = 1;
    S.txt.forEach(x => { ctx.globalAlpha = Math.min(1, x.life * 2); ctx.font = '800 17px ui-rounded,system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(8,40,70,.85)'; ctx.strokeText(x.txt, x.x, x.y); ctx.fillStyle = x.col; ctx.fillText(x.txt, x.x, x.y); }); ctx.globalAlpha = 1;
  }
  function loop(now) {
    const dt = Math.min(0.05, (now - S.last) / 1000 || 0); S.last = now;
    if (S.G && (S.state === 'main' || S.state === 'hasil')) { if (S.state === 'main' || S.fall.length) update(dt); draw(); }
    requestAnimationFrame(loop);
  }

  /* ---------- input ---------- */
  function aimFrom(e) {
    const r = cv.getBoundingClientRect(), lx = (e.clientX - r.left) / r.width * W, ly = (e.clientY - r.top) / r.height * H;
    let a = Math.atan2(SY - ly, lx - SX) * 180 / Math.PI; S.aim = Math.max(10, Math.min(170, a));
  }
  cv.addEventListener('pointerdown', e => { if (S.state !== 'main') return; Bunyi.init(); S.down = true; try { cv.setPointerCapture(e.pointerId); } catch (x) {} aimFrom(e); e.preventDefault(); });
  cv.addEventListener('pointermove', e => { if (S.state === 'main' && !S.ball) aimFrom(e); });
  cv.addEventListener('pointerup', e => { if (S.state !== 'main' || !S.down) return; S.down = false; aimFrom(e); fire(S.aim); });
  cv.addEventListener('pointercancel', () => { S.down = false; });
  addEventListener('keydown', e => {
    if (S.state !== 'main') return;
    if (e.key === 'ArrowLeft' || e.key === 'a') { S.aim = Math.min(170, S.aim + 2.5); e.preventDefault(); }
    else if (e.key === 'ArrowRight' || e.key === 'd') { S.aim = Math.max(10, S.aim - 2.5); e.preventDefault(); }
    else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp') { Bunyi.init(); fire(S.aim); e.preventDefault(); }
  });
  addEventListener('resize', fit);

  $('#btnLang').onclick = () => { I18N.set(I18N.lang === 'ms' ? 'id' : 'ms'); applyLang(); };
  $$('[data-loc]').forEach(b => b.onclick = () => { Bunyi.klik(); I18N.set(b.dataset.loc); applyLang(); });
  $('#btnSnd').onclick = () => { Bunyi.setMute(!Bunyi.mute); Bunyi.klik(); applyLang(); };
  $('#btnMula').onclick = () => { Bunyi.init(); Bunyi.klik(); renderPeta(); show('peta'); };
  $('#btnBack').onclick = () => { Bunyi.klik(); if (S.state === 'main') { renderPeta(); show('peta'); } else show('menu'); };
  $('#btnUlang').onclick = () => { Bunyi.klik(); startLevel(S.lv); };
  $('#btnNext').onclick = () => { Bunyi.klik(); startLevel(Math.min(S.lv + 1, LV.length - 1)); };
  $('#btnPeta').onclick = () => { Bunyi.klik(); renderPeta(); show('peta'); };

  /* ---------- pintu ujian ---------- */
  function cadangSudut(betul, pantul) {
    const lv = LV[S.lv], re = [...GT.reachable(S.G).values()].filter(e => (S.G.rows[e.r][e.c].v === S.q.ans) === !!betul);
    if (!re.length) return null;
    re.forEach(e => { e.n = betul ? GT.floodSame(S.G, e.r, e.c).length : 0; });
    re.sort((a, b) => (pantul ? (b.bounces > 0) - (a.bounces > 0) : 0) || b.n - a.n || a.bounces - b.bounces);
    const e = re[0], L = GT.list(S.G), ok = [];
    for (let a = e.angle - 1.2; a <= e.angle + 1.2; a += 0.1) { const r = GT.simulate(S.G, a, L); if (r.hit && r.hit.r === e.r && r.hit.c === e.c) ok.push(a); }
    return ok.length ? ok[Math.floor(ok.length / 2)] : e.angle;
  }
  window.__game = {
    get keadaan() { return S.state; }, get skor() { return S.score; }, get kombo() { return S.combo; }, get tahap() { return S.lv; },
    get selesai() { return S.solved; }, get salah() { return S.wrong; }, get bola() { return !!S.ball; }, get menang() { return S.lastWin; },
    get soalan() { return S.q && { teks: S.q.text, jawapan: S.q.ans }; }, get sasaran() { return S.G && GT.simulate(S.G, S.aim).hit; },
    get bintang() { return S.lastWin ? stars() : 0; }, get gelembung() { return S.G ? GT.count(S.G) : 0; }, get bahaya() { return S.G ? GT.lowest(S.G) : 0; },
    get target() { return LV[S.lv].target; }, get aim() { return S.aim; }, get menunggu() { return S.ending; },
    cadangSudut, tembak: fire, jawabUji(betul) { const a = cadangSudut(betul, false); return a == null ? false : fire(a); }
  };

  I18N.set(I18N.lang); applyLang(); show('menu'); $('#hero') ; $('#mMenu').innerHTML = Clawd.hero('gembira');
  requestAnimationFrame(t => { S.last = t; loop(t); });
})();
