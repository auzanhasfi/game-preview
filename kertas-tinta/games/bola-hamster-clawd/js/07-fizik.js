/* 07 — Dunia + fizik bola: bergolek, geseran, ais, tali sawat, dinding, gerbang soalan, objek, jatuh. */
var TS = 26, BR = 10.5;
var world = null, ball = null;

function isFloorCh(ch) { return ch === '#' || ch === 'S' || ch === 'F' || ch === 'C' || ch === 'i' || ch === '>' || ch === '<' || ch === '^' || ch === 'v' || ch === 'G'; }
function tileAt(c, r) { if (!world || r < 0 || r >= world.rows || c < 0 || c >= world.cols) return '.'; return world.g[r][c]; }

HB.bina = function (i, tahap, soalIdx0) {
  var tr = HB.TREK[i], rows = tr.map.length, cols = 0;
  tr.map.forEach(function (s) { cols = Math.max(cols, s.length); });
  var w = { i: i, tr: tr, rows: rows, cols: cols, g: [], gates: [], seeds: [], chks: [], objs: [], t: 0 };
  for (var r = 0; r < rows; r++) {
    var row = tr.map[r].padEnd(cols, '.').split('');
    for (var c = 0; c < cols; c++) {
      var ch = row[c], px = (c + 0.5) * TS, py = (r + 0.5) * TS;
      if (ch === 'o') { row[c] = '#'; w.seeds.push({ x: px, y: py, got: false, t: Math.random() * 6 }); }
      else if (ch === 'S') { w.start = { x: px, y: py }; }
      else if (ch === 'C') { w.chks.push({ x: px, y: py, c: c, r: r, on: false, wave: 0 }); }
    }
    w.g.push(row);
  }
  /* gerbang: kumpulan G dalam satu baris */
  var qi = soalIdx0 || 0;
  for (r = 0; r < rows; r++) {
    var runs = [], cur = null;
    for (c = 0; c < cols; c++) {
      if (w.g[r][c] === 'G') { if (cur) cur.c1 = c; else { cur = { c0: c, c1: c }; runs.push(cur); } }
      else cur = null;
    }
    if (runs.length) {
      var q = HB.buatSoal(tahap, runs.length, qi++);
      runs.forEach(function (ru, k) { ru.val = q.opts[k]; ru.ok = q.opts[k] === q.ans; ru.wrong = false; ru.glow = 0; });
      w.gates.push({ r: r, runs: runs, q: q, solved: false, tries: 0, y: (r + 0.5) * TS, x0: runs[0].c0 * TS, x1: (runs[runs.length - 1].c1 + 1) * TS, openT: 0 });
    }
  }
  w.soalNext = qi;
  tr.obj.forEach(function (o) {
    var b = Object.assign({}, o);
    if (b.k === 'sapu') { b.ang = Math.random() * 6; }
    if (b.k === 'comot') { b.u = Math.random(); b.dir = 1; b.x = lerp(b.a[0], b.b[0], b.u) * TS; b.y = lerp(b.a[1], b.b[1], b.u) * TS; b.squish = 0; }
    if (b.k === 'bump') { b.hit = 0; }
    if (b.k === 'lift') { b.t = 0; b.x = b.a[0] * TS; b.y = b.a[1] * TS; b.dx = 0; b.dy = 0; }
    w.objs.push(b);
  });
  w.chk = { x: w.start.x, y: w.start.y };
  world = w;
  ball = { x: w.start.x, y: w.start.y, vx: 0, vy: 0, px: w.start.x, py: w.start.y, roll: 0, face: 1, fall: 0, inv: 0, mood: '', moodT: 0, onLift: null, speed: 0 };
  return w;
};

function liftAt(x, y) {
  for (var k = 0; k < world.objs.length; k++) {
    var o = world.objs[k];
    if (o.k === 'lift' && x > o.x - 3 && x < o.x + o.w * TS + 3 && y > o.y - 3 && y < o.y + o.h * TS + 3) return o;
  }
  return null;
}
function surfaceAt(x, y) {
  var lf = liftAt(x, y);
  if (lf) return { k: 'lift', lift: lf };
  var ch = tileAt(Math.floor(x / TS), Math.floor(y / TS));
  if (!isFloorCh(ch)) return { k: 'void' };
  if (ch === 'i') return { k: 'ice' };
  if (ch === '>') return { k: 'slope', fx: 1, fy: 0 };
  if (ch === '<') return { k: 'slope', fx: -1, fy: 0 };
  if (ch === '^') return { k: 'slope', fx: 0, fy: -1 };
  if (ch === 'v') return { k: 'slope', fx: 0, fy: 1 };
  return { k: 'floor', ch: ch };
}
function gateRunAt(c, r) {
  for (var k = 0; k < world.gates.length; k++) {
    var g = world.gates[k];
    if (g.r !== r) continue;
    for (var j = 0; j < g.runs.length; j++) if (c >= g.runs[j].c0 && c <= g.runs[j].c1) return { g: g, run: g.runs[j], j: j };
  }
  return null;
}
function solidAt(c, r) {
  var ch = tileAt(c, r);
  if (ch === 'x') return true;
  if (ch === 'G') { var gr = gateRunAt(c, r); return !!(gr && !gr.g.solved && gr.run.wrong); }
  return false;
}
/* bulatan lawan kotak: tolak keluar + lantun */
function collideBox(bx, by, bw, bh) {
  var cx = clamp(ball.x, bx, bx + bw), cy = clamp(ball.y, by, by + bh);
  var dx = ball.x - cx, dy = ball.y - cy, d2 = dx * dx + dy * dy;
  if (d2 >= BR * BR) return false;
  var d = Math.sqrt(d2), nx, ny;
  if (d < 0.001) {
    var l = ball.x - bx, rr = bx + bw - ball.x, t = ball.y - by, b = by + bh - ball.y, m = Math.min(l, rr, t, b);
    nx = m === l ? -1 : m === rr ? 1 : 0; ny = m === t ? -1 : m === b ? 1 : 0; if (nx && ny) ny = 0;
    d = 0; ball.x = nx ? (nx < 0 ? bx - BR : bx + bw + BR) : ball.x; ball.y = ny ? (ny < 0 ? by - BR : by + bh + BR) : ball.y;
  } else {
    nx = dx / d; ny = dy / d; ball.x = cx + nx * BR; ball.y = cy + ny * BR;
  }
  var vn = ball.vx * nx + ball.vy * ny;
  if (vn < 0) {
    ball.vx -= 1.5 * vn * nx; ball.vy -= 1.5 * vn * ny;
    if (vn < -70) { sfx('bump'); HB.ev('bonk', { x: ball.x - nx * BR, y: ball.y - ny * BR, v: -vn }); }
  }
  return true;
}

HB.langkah = function (dt, ix, iy) {
  var w = world, b = ball;
  w.t += dt;
  /* objek bergerak */
  w.objs.forEach(function (o) {
    if (o.k === 'sapu') o.ang += o.sp * dt;
    else if (o.k === 'comot') {
      var len = Math.hypot(o.b[0] - o.a[0], o.b[1] - o.a[1]) * TS;
      o.u += o.dir * o.sp * dt / len;
      if (o.u > 1) { o.u = 1; o.dir = -1; } else if (o.u < 0) { o.u = 0; o.dir = 1; }
      o.x = lerp(o.a[0], o.b[0], o.u) * TS; o.y = lerp(o.a[1], o.b[1], o.u) * TS;
      o.squish = Math.max(0, o.squish - dt * 3);
    } else if (o.k === 'bump') o.hit = Math.max(0, o.hit - dt * 4);
    else if (o.k === 'lift') {
      var dist = Math.hypot(o.b[0] - o.a[0], o.b[1] - o.a[1]) * TS, mv = dist / 42, ps = 1.4, cyc = 2 * (mv + ps);
      o.t += dt;
      var tt = o.t % cyc, u;
      if (tt < ps) u = 0; else if (tt < ps + mv) u = (tt - ps) / mv; else if (tt < 2 * ps + mv) u = 1; else u = 1 - (tt - 2 * ps - mv) / mv;
      u = u * u * (3 - 2 * u);
      var nx = lerp(o.a[0], o.b[0], u) * TS, ny = lerp(o.a[1], o.b[1], u) * TS;
      o.dx = nx - o.x; o.dy = ny - o.y; o.x = nx; o.y = ny; o.u = u;
    }
  });
  w.chks.forEach(function (k) { k.wave += dt; });
  w.seeds.forEach(function (s) { s.t += dt; });
  w.gates.forEach(function (g) { if (g.solved) g.openT = Math.min(1, g.openT + dt * 2); g.runs.forEach(function (r) { r.glow = Math.max(0, r.glow - dt); }); });
  if (b.moodT > 0) { b.moodT -= dt; if (b.moodT <= 0) b.mood = ''; }
  if (b.inv > 0) b.inv -= dt;

  /* sedang jatuh */
  if (b.fall > 0) {
    b.fall += dt; b.x += b.vx * dt * 0.4; b.y += b.vy * dt * 0.4;
    if (b.fall > 1.0) { HB.ev('jatuhTamat'); }
    return;
  }
  /* bawa bola bersama pelantar */
  var lf = liftAt(b.x, b.y);
  if (lf) { b.x += lf.dx; b.y += lf.dy; }
  var s = surfaceAt(b.x, b.y);
  var ice = s.k === 'ice', acc = ice ? 300 : 620, fr = ice ? 0.25 : 2.1;
  var il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
  b.vx += ix * acc * dt; b.vy += iy * acc * dt;
  if (s.k === 'slope') { b.vx += s.fx * 250 * dt; b.vy += s.fy * 250 * dt; }
  var f = Math.exp(-fr * dt); b.vx *= f; b.vy *= f;
  var sp = Math.hypot(b.vx, b.vy), MAX = 330;
  if (sp > MAX) { b.vx *= MAX / sp; b.vy *= MAX / sp; sp = MAX; }
  b.speed = sp;
  b.px = b.x; b.py = b.y;
  var steps = Math.max(1, Math.ceil(sp * dt / 4));
  for (var st = 0; st < steps; st++) {
    b.x += b.vx * dt / steps; b.y += b.vy * dt / steps;
    var c0 = Math.floor((b.x - BR) / TS), c1 = Math.floor((b.x + BR) / TS), r0 = Math.floor((b.y - BR) / TS), r1 = Math.floor((b.y + BR) / TS);
    for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) if (solidAt(c, r)) collideBox(c * TS, r * TS, TS, TS);
  }
  b.roll += (b.vx + b.vy * 0.4) * dt / BR;
  if (Math.abs(b.vx) > 12) b.face = b.vx > 0 ? 1 : -1;

  /* gerbang soalan */
  var tc = Math.floor(b.x / TS), trw = Math.floor(b.y / TS);
  if (tileAt(tc, trw) === 'G') {
    var gr = gateRunAt(tc, trw);
    if (gr && !gr.g.solved && !gr.run.wrong) {
      if (gr.run.ok) { gr.g.solved = true; gr.run.glow = 1.5; HB.ev('betul', gr); }
      else {
        gr.run.wrong = true; gr.g.tries++;
        var back = b.vy > 0 ? -1 : 1;
        b.x = b.px; b.y = b.py + back * 2;
        b.vy = back * Math.max(170, Math.abs(b.vy) * 0.8); b.vx *= 0.4;
        HB.ev('salah', gr);
      }
    }
  }
  /* cendawan lantun, penyapu, Si Comot */
  w.objs.forEach(function (o) {
    if (o.k === 'bump') {
      var dx = b.x - o.x * TS, dy = b.y - o.y * TS, d = Math.hypot(dx, dy), rr = BR + 9;
      if (d < rr && d > 0.01) {
        var nx = dx / d, ny = dy / d, v = Math.max(250, Math.hypot(b.vx, b.vy));
        b.x = o.x * TS + nx * rr; b.y = o.y * TS + ny * rr; b.vx = nx * v; b.vy = ny * v; o.hit = 1;
        sfx('boing'); HB.ev('boing', { x: b.x, y: b.y });
      }
    } else if (o.k === 'sapu') {
      var pxv = o.x * TS, pyv = o.y * TS, ex = Math.cos(o.ang) * o.len * TS, ey = Math.sin(o.ang) * o.len * TS;
      var ax = pxv - ex, ay = pyv - ey, bx = pxv + ex, by = pyv + ey, abx = bx - ax, aby = by - ay;
      var tq = clamp(((b.x - ax) * abx + (b.y - ay) * aby) / (abx * abx + aby * aby), 0, 1);
      var qx = ax + abx * tq, qy = ay + aby * tq, ddx = b.x - qx, ddy = b.y - qy, dd = Math.hypot(ddx, ddy), lim = BR + 3.5;
      if (dd < lim) {
        var nnx = dd > 0.01 ? ddx / dd : 0, nny = dd > 0.01 ? ddy / dd : 1;
        b.x = qx + nnx * lim; b.y = qy + nny * lim;
        var rx = qx - pxv, ry = qy - pyv, tvx = -o.sp * ry, tvy = o.sp * rx;
        b.vx = b.vx * 0.3 + tvx * 1.1 + nnx * 120; b.vy = b.vy * 0.3 + tvy * 1.1 + nny * 120;
        if (b.inv <= 0) { sfx('push'); b.inv = 0.4; b.mood = 'hurt'; b.moodT = 0.6; HB.ev('tolak', { x: b.x, y: b.y }); }
      }
    } else if (o.k === 'comot') {
      var cdx = b.x - o.x, cdy = b.y - o.y, cd = Math.hypot(cdx, cdy), cr = BR + 10;
      if (cd < cr && cd > 0.01) {
        var cnx = cdx / cd, cny = cdy / cd;
        b.x = o.x + cnx * cr; b.y = o.y + cny * cr; b.vx = cnx * 280; b.vy = cny * 280; o.squish = 1;
        if (b.inv <= 0) { sfx('push'); b.inv = 0.5; b.mood = 'hurt'; b.moodT = 0.7; HB.ev('tolak', { x: b.x, y: b.y }); }
      }
    }
  });
  /* biji, titik simpan, penamat */
  w.seeds.forEach(function (sd) { if (!sd.got && Math.hypot(b.x - sd.x, b.y - sd.y) < BR + 7) { sd.got = true; HB.ev('biji', sd); } });
  w.chks.forEach(function (k) {
    if (!k.on && Math.floor(b.x / TS) === k.c && Math.floor(b.y / TS) === k.r) {
      w.chks.forEach(function (o) { o.on = false; }); k.on = true; w.chk = { x: k.x, y: k.y }; HB.ev('simpan', k);
    }
  });
  if (tileAt(Math.floor(b.x / TS), Math.floor(b.y / TS)) === 'F') { HB.ev('tamat'); return; }
  /* jatuh dari tepi */
  if (surfaceAt(b.x, b.y).k === 'void') { b.fall = 0.0001; b.mood = 'hurt'; b.moodT = 2; sfx('fall'); HB.ev('jatuh'); }
};

HB.hidupSemula = function () {
  ball.x = world.chk.x; ball.y = world.chk.y; ball.vx = 0; ball.vy = 0; ball.fall = 0; ball.inv = 1.2; ball.mood = ''; ball.moodT = 0;
};

/* gerbang aktif: gerbang belum selesai yang paling hampir di hadapan bola */
HB.gerbangAktif = function () {
  var best = null, bd = 1e9;
  world.gates.forEach(function (g) {
    if (g.solved) return;
    var dy = Math.abs(g.y - ball.y), dx = ball.x < g.x0 ? g.x0 - ball.x : ball.x > g.x1 ? ball.x - g.x1 : 0;
    if (dy < TS * 7 && dx < TS * 4 && dy + dx < bd) { bd = dy + dx; best = g; }
  });
  return best;
};
