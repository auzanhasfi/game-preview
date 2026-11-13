/* 99 — Aliran permainan: menu -> kad trek -> main -> trek seterusnya -> tamat. Gelung rAF + kait ujian. */
(function () {
  'use strict';
  var QS = new URLSearchParams(location.search);
  var UJI = QS.has('uji'), PREVIEW = HB.PREVIEW = UJI && QS.get('preview') === '1', DEMO = PREVIEW || (UJI && QS.get('demo') === '1');
  if (PREVIEW) { document.body.classList.add('pv'); HB.audio.muted = true; }
  var cv = $('cv'), SC = 2, mainCtx = cv.getContext('2d');
  var hero = $('heroPrev'), heroCtx = hero.getContext('2d');
  var state = 'menu', G = null, tm = 0, clearT = 0, last = 0;

  function ukur() {
    var tall = !PREVIEW && window.innerWidth < 620 && window.innerHeight > window.innerWidth * 1.15;
    document.body.classList.toggle('tall', tall);
    W = tall ? 340 : 480; H = tall ? 425 : 270;
    if (PREVIEW) { W = 480; H = Math.round(480 * window.innerHeight / Math.max(1, window.innerWidth)); }
    if (cv.height !== H * SC) { cv.width = W * SC; cv.height = H * SC; }
  }
  ukur(); window.addEventListener('resize', ukur);

  /* ---------- peristiwa dari fizik ---------- */
  HB.ev = function (n, d) {
    var T = HB.T;
    if (n === 'betul') {
      var cub = d.g.tries + 1;
      recFor(d.g).cubaan = cub;
      G.markah += cub === 1 ? 100 : 50;
      sfx('correct'); confetti(ball.x, ball.y, 26, [CL, LG, GOLD, '#fff']); sfxText(ball.x, ball.y - 18, T('tingT'), LG_D, 24);
      HB.toast(T('correct')(d.g.q.how), 'ok');
    } else if (n === 'salah') {
      recFor(d.g).cubaan = d.g.tries + 1;
      sfx('wrong'); sfxText(ball.x, ball.y - 16, '✗', CL_D, 26); rings(ball.x, ball.y, 3, CL_D);
      HB.toast(T('wrong')(T('tryOther')), 'bad');
      ball.mood = 'hurt'; ball.moodT = 0.8;
    } else if (n === 'biji') {
      G.biji++; G.markah += 10; sfx('seed'); sparkles(d.x, d.y, 7, 6); sfxText(d.x, d.y - 12, T('seedT'), GOLD, 15);
    } else if (n === 'simpan') {
      sfx('check'); HB.toast(T('checkpoint'), 'ok'); sparkles(d.x, d.y, 10, 10, LG);
    } else if (n === 'jatuh') {
      rings(ball.x, ball.y, 2, INK);
    } else if (n === 'jatuhTamat') {
      if (DEMO) { HB.hidupSemula(); return; }
      G.nyawa--; G.jatuh++;
      if (G.nyawa <= 0) { state = 'over'; sfx('over'); musicStop(); rollHum(0); setTimeout(function () { HB.skrinTamat(G, false); }, 700); return; }
      HB.hidupSemula(); HB.toast(T('fell'), 'bad'); camUpdate(0, false);
    } else if (n === 'tamat') {
      if (state !== 'main') return;
      state = 'selesai'; clearT = 0; sfx('clear'); rollHum(0);
      ball.vx *= 0.2; ball.vy *= 0.2; ball.mood = 'happy'; ball.moodT = 9;
      confetti(ball.x, ball.y, 40, [CL, LG, GOLD, SKY, '#fff']);
      var bonus = Math.max(0, Math.round((world.tr.par - G.masa) * 5));
      G.markah += bonus;
      HB.toast(T('clear') + (bonus ? ' ' + T('bonus') + ' +' + bonus : ''), 'ok');
    } else if (n === 'bonk') {
      if (d.v > 140) sfxText(d.x, d.y - 10, T('bonkT'), INK, 14);
    } else if (n === 'boing') {
      rings(d.x, d.y, 2, CL);
    } else if (n === 'tolak') {
      sfxText(d.x, d.y - 14, T('pushT'), CL_D, 16);
    }
  };
  /* rekod soalan: G.soal untuk semua trek; soalAktif = gerbang trek semasa (indeks bermula di G.soalBase) */
  function recFor(g) {
    var i = G.soalAktif.indexOf(g);
    if (i < 0) { G.soalAktif.push(g); G.soal.push({ how: g.q.how, cubaan: 0 }); return G.soal[G.soal.length - 1]; }
    return G.soal[G.soalBase + i];
  }

  /* ---------- aliran ---------- */
  function mulaGame(tahap, trek) {
    audioInit();
    G = { tahap: tahap, trek: trek || 0, nyawa: 5, biji: 0, markah: 0, masa: 0, masaJumlah: 0, soal: [], soalAktif: [], soalIdx: 0, jatuh: 0 };
    HB.show('game'); ukur();
    masukTrek(G.trek);
  }
  function masukTrek(i) {
    G.trek = i; G.masa = 0;
    var w = HB.bina(i, G.tahap, G.soalIdx); G.soalIdx = w.soalNext;
    G.soalAktif = []; G.soalBase = G.soal.length;
    parts.length = 0; texts.length = 0;
    camUpdate(0, true); HB.resetPapan(); HB.papanSoal(null, false); HB.hud(G);
    if (DEMO) { state = 'main'; HB.tutupKad(); return; }
    state = 'kad';
    HB.kadTrek(i, function () { HB.tutupKad(); state = 'main'; audioInit(); musicStart([0, 5, 3, 7][i]); HB.hint(HB.input.used ? '' : (matchMedia('(pointer: coarse)').matches ? HB.T('hintDrag') : HB.T('hintKeys'))); HB.kadGo = null; });
  }
  function trekSeterusnya() {
    G.masaJumlah += G.masa;
    var nx = G.trek + 1;
    var open = +(store('hb-buka') || 1); if (nx + 1 > open && nx < HB.TREK.length) store('hb-buka', nx + 1);
    if (nx >= HB.TREK.length) {
      store('hb-buka', HB.TREK.length);
      state = 'menang'; musicStop();
      var st = HB.skrinTamat(G, true); void st;
      return;
    }
    musicStop();
    masukTrek(nx);
  }

  /* ---------- autopilot ujian (?uji=1&demo=1) ---------- */
  var ap = { path: null, t: 0 };
  function passable(c, r) {
    var ch = tileAt(c, r);
    if (ch === '=') return true;
    if (!isFloorCh(ch)) return false;
    if (ch === 'G') { var gr = gateRunAt(c, r); if (gr && !gr.g.solved && !gr.run.ok) return false; }
    for (var k = 0; k < world.objs.length; k++) { var o = world.objs[k]; if (o.k === 'bump' && Math.abs(o.x - (c + 0.5)) < 0.9 && Math.abs(o.y - (r + 0.5)) < 0.9) return false; }
    return true;
  }
  function cari() {
    var sc = Math.floor(ball.x / TS), sr = Math.floor(ball.y / TS), Q = [[sc, sr]], prev = {}, k0 = sc + ',' + sr, goal = null;
    prev[k0] = null;
    while (Q.length) {
      var n = Q.shift(), c = n[0], r = n[1];
      if (tileAt(c, r) === 'F') { goal = c + ',' + r; break; }
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var nc = c + d[0], nr = r + d[1], key = nc + ',' + nr;
        if (prev[key] !== undefined || !passable(nc, nr)) return;
        prev[key] = c + ',' + r; Q.push([nc, nr]);
      });
    }
    if (!goal) return null;
    var p = [], cur = goal;
    while (cur) { var s = cur.split(','); p.unshift([+s[0], +s[1]]); cur = prev[cur]; }
    return p;
  }
  function autopilot(dt) {
    ap.t -= dt;
    if (ap.t <= 0 || !ap.path) { ap.path = cari(); ap.t = 0.3; }
    var p = ap.path; if (!p || p.length < 2) return { x: 0, y: 0 };
    var look = Math.min(p.length - 1, 2), tgt = p[look], onL = liftAt(ball.x, ball.y);
    var tx = (tgt[0] + 0.5) * TS, ty = (tgt[1] + 0.5) * TS, want = 95;
    var firstTrack = -1;
    for (var i = 1; i < Math.min(p.length, 4); i++) if (tileAt(p[i][0], p[i][1]) === '=') { firstTrack = i; break; }
    if (onL) {
      var exit = null;
      for (i = 1; i < p.length; i++) if (tileAt(p[i][0], p[i][1]) !== '=') { exit = p[i]; break; }
      var ex = (exit[0] + 0.5) * TS, ey = (exit[1] + 0.5) * TS;
      var dxr = Math.max(onL.x - ex, 0, ex - (onL.x + onL.w * TS)), dyr = Math.max(onL.y - ey, 0, ey - (onL.y + onL.h * TS));
      if (Math.hypot(dxr, dyr) < TS * 0.9) { tx = ex; ty = ey; want = 70; }
      else { tx = onL.x + onL.w * TS / 2; ty = onL.y + onL.h * TS / 2; want = 40; }
    } else if (firstTrack > 0) {
      var nt = p[firstTrack], lf = liftAt((nt[0] + 0.5) * TS, (nt[1] + 0.5) * TS);
      if (lf && (lf.u === 0 || lf.u === 1)) { tx = lf.x + lf.w * TS / 2; ty = lf.y + lf.h * TS / 2; want = 60; }
      else { var pr = p[Math.max(0, firstTrack - 1)]; tx = (pr[0] + 0.5) * TS; ty = (pr[1] + 0.5) * TS; want = 60; }
    }
    var dx = tx - ball.x, dy = ty - ball.y, d = Math.hypot(dx, dy) || 1;
    var vx = dx / d * Math.min(want, d * 3), vy = dy / d * Math.min(want, d * 3);
    var ix = (vx - ball.vx) / 60, iy = (vy - ball.vy) / 60, il = Math.hypot(ix, iy);
    if (il > 1) { ix /= il; iy /= il; }
    return { x: ix, y: iy };
  }

  /* ---------- gelung ---------- */
  function step(dt) {
    tm += dt;
    if (state === 'main' || state === 'selesai') {
      var a = state === 'main' ? (DEMO ? autopilot(dt) : HB.arah()) : { x: 0, y: 0 };
      if (state === 'main') { G.masa += dt; if (a.x || a.y) HB.hint(''); }
      HB.langkah(dt, a.x, a.y);
      camUpdate(dt, false);
      if (state === 'selesai') { clearT += dt; if (clearT > 1.8) trekSeterusnya(); }
      rollHum(state === 'main' && ball.fall <= 0 ? ball.speed : 0);
    } else if (state === 'kad' && world) {
      world.t += dt;
    }
    partsUpdate(dt);
  }
  function render() {
    if (!world || $('game').hidden) return;
    ctx = mainCtx; ctx.setTransform(SC, 0, 0, SC, 0, 0);
    HB.lukis(tm); HB.lukisJoy();
    if (state === 'main' || state === 'selesai') {
      var g = HB.gerbangAktif();
      HB.papanSoal(g, world.gates.every(function (x) { return x.solved; }));
      HB.hud(G);
    }
  }
  /* pratonton menu: Trek 1 dengan bola bergolek di laluan tetap */
  var heroPath = [[5.5, 2.5], [5.5, 5.6], [4.5, 9.4], [6, 12], [13, 12.4], [21, 12.2], [22, 15], [22.5, 21], [22.5, 22.6]];
  var heroW = null, heroT = 0;
  function renderHero(dt) {
    if ($('menu').hidden) return;
    var sw = world, sb = ball;
    if (!heroW) { heroW = HB.bina(0, 'mudah', 0); heroW.ball = ball; }
    world = heroW; ball = heroW.ball;
    heroT += dt; world.t += dt;
    var segs = heroPath.length - 1, u = (heroT * 0.09) % 1 * segs, k = Math.floor(u), f = u - k;
    var a = heroPath[k], b = heroPath[k + 1];
    var nx = lerp(a[0], b[0], f) * TS, ny = lerp(a[1], b[1], f) * TS;
    ball.vx = (nx - ball.x) / Math.max(dt, 0.001); ball.vy = (ny - ball.y) / Math.max(dt, 0.001);
    if (Math.hypot(ball.vx, ball.vy) > 400) { ball.vx = ball.vy = 0; }
    ball.speed = Math.hypot(ball.vx, ball.vy); ball.roll += (ball.vx + ball.vy * 0.4) * dt / BR; ball.face = ball.vx >= 0 ? 1 : -1;
    ball.x = nx; ball.y = ny;
    var sW = W, sH = H, sc = cam.x, sy = cam.y;
    W = 300; H = 200; ctx = heroCtx; ctx.setTransform(2, 0, 0, 2, 0, 0);
    cam.x = ball.x - W / 2; cam.y = ball.y - H / 2 + 10;
    HB.lukis(tm);
    W = sW; H = sH; cam.x = sc; cam.y = sy;
    world = sw; ball = sb;
  }
  function frame(now) {
    var dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now;
    step(dt); render(); renderHero(dt);
    requestAnimationFrame(frame);
  }

  /* ---------- butang ---------- */
  document.querySelectorAll('.lv').forEach(function (b) { b.addEventListener('click', function () { mulaGame(b.getAttribute('data-d'), 0); }); });
  document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { HB.setLang(b.getAttribute('data-lang')); }); });
  $('cGo').addEventListener('click', function () { if (HB.kadGo) HB.kadGo(); });
  $('bSnd').addEventListener('click', function () {
    HB.audio.muted = !HB.audio.muted; audioInit();
    if (HB.audio.muted) { musicStop(); rollHum(0); } else if (state === 'main') musicStart([0, 5, 3, 7][G.trek]);
    syncSnd();
  });
  function syncSnd() { var m = HB.audio.muted; $('bSnd').innerHTML = '<i data-ic="' + (m ? 'mute' : 'sound') + '"></i><span>' + HB.T(m ? 'soundOff' : 'soundOn') + '</span>'; HB.paintIcons($('bSnd')); }
  $('bQuit').addEventListener('click', function () { state = 'menu'; musicStop(); rollHum(0); HB.tutupKad(); HB.menuTrek(); HB.show('menu'); });
  $('bAgain').addEventListener('click', function () { mulaGame(G.tahap, 0); });
  $('bRetry').addEventListener('click', function () {
    var keep = G.soal.slice(0, G.soalBase);
    G.nyawa = 5; G.soal = keep; G.markah = Math.max(0, G.markah - 100);
    HB.show('game'); masukTrek(G.trek);
  });
  $('bMenu').addEventListener('click', function () { state = 'menu'; HB.menuTrek(); HB.show('menu'); });
  HB.onLang = function () {
    HB.menuTrek(); syncSnd();
    if (G && !$('game').hidden) { HB.resetPapan(); HB.hud(G); if (!$('ccard').hidden) HB.kadTrek(G.trek, HB.kadGo); }
  };

  HB.pasangKawalan(cv);
  HB.paintIcons();
  HB.setLang(HB.lang);

  /* kait ujian */
  window.__hb = {
    info: function () { return { state: state, trek: G && G.trek, nyawa: G && G.nyawa, markah: G && G.markah, biji: G && G.biji, soal: G && G.soal, ball: ball && { x: +(ball.x / TS).toFixed(2), y: +(ball.y / TS).toFixed(2), fall: ball.fall, speed: Math.round(ball.speed) }, gates: world && world.gates.map(function (g) { return { r: g.r, q: g.q.q, solved: g.solved, tries: g.tries }; }) }; },
    step: function (sec, ix, iy) { var n = Math.round(sec * 60); for (var i = 0; i < n; i++) { if (ix !== undefined && state === 'main') { G.masa += 1 / 60; HB.langkah(1 / 60, ix, iy); camUpdate(1 / 60); partsUpdate(1 / 60); } else step(1 / 60); } render(); return this.info(); },
    mula: function (tahap, trek) { mulaGame(tahap || 'mudah', trek || 0); },
    go: function () { if (HB.kadGo) HB.kadGo(); },
    tp: function (c, r) { ball.x = (c + 0.5) * TS; ball.y = (r + 0.5) * TS; ball.vx = ball.vy = 0; camUpdate(0, true); render(); },
    demo: function (on) { DEMO = on; }
  };
  if (DEMO) mulaGame(QS.get('lv') || 'mudah', +(QS.get('tr') || 0));
  else if (UJI && QS.get('tr')) mulaGame(QS.get('lv') || 'mudah', +QS.get('tr'));
  if (UJI && QS.get('skip')) { var sk = Math.round(+QS.get('skip') * 60); for (var q = 0; q < sk; q++) step(1 / 60); }
  requestAnimationFrame(frame);
})();
