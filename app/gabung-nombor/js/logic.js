/* Enjin gabung jubin: logik tulen tanpa DOM (dipakai pelayar + uji/logik.mjs).
   Peraturan: dua jubin SAMA yang berlanggar bergabung mengikut operasi tahap.
   '+' a+a, '*' a×a, '-' a−a = 0 (pasangan hilang, dikira sebagai 1 pasang). */
(function (root) {
  'use strict';
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let uid = 1;
  const tile = v => ({ id: uid++, v });
  function result(op, a, b) {
    if (a !== b) return null;
    if (op === '+') return a + b;
    if (op === '*') return a * b;
    if (op === '-') return 0;
    return null;
  }
  const DIRS = ['left', 'right', 'up', 'down'];
  function lines(n, dir) {
    const L = [];
    for (let i = 0; i < n; i++) {
      const cs = [];
      for (let j = 0; j < n; j++) {
        if (dir === 'left') cs.push([i, j]);
        else if (dir === 'right') cs.push([i, n - 1 - j]);
        else if (dir === 'up') cs.push([j, i]);
        else cs.push([n - 1 - j, i]);
      }
      L.push(cs);
    }
    return L;
  }
  function create(level, seed) {
    const n = level.n;
    const st = {
      n, op: level.op, level, rnd: rng(seed || (Math.random() * 4294967296)),
      grid: Array.from({ length: n }, () => Array(n).fill(null)),
      moves: 0, score: 0, pairs: 0, streak: 0, status: 'main'
    };
    spawn(st); spawn(st);
    return st;
  }
  function empties(st) {
    const e = [];
    for (let r = 0; r < st.n; r++) for (let c = 0; c < st.n; c++) if (!st.grid[r][c]) e.push([r, c]);
    return e;
  }
  function spawn(st) {
    const e = empties(st); if (!e.length) return null;
    const [r, c] = e[Math.floor(st.rnd() * e.length)];
    const sp = st.level.spawn;
    const t = tile(sp[Math.floor(st.rnd() * sp.length)]);
    st.grid[r][c] = t;
    return { tile: t, r, c };
  }
  /* langkah tanpa kesan sampingan */
  function step(st, dir) {
    const n = st.n, g = st.grid;
    const ng = Array.from({ length: n }, () => Array(n).fill(null));
    const slides = [], merges = [];
    for (const cs of lines(n, dir)) {
      const ts = [];
      for (const [r, c] of cs) if (g[r][c]) ts.push({ t: g[r][c], r, c });
      let k = 0, i = 0;
      while (i < ts.length) {
        const a = ts[i], b = ts[i + 1];
        const res = b ? result(st.op, a.t.v, b.t.v) : null;
        const dest = cs[k];
        if (res !== null) {
          slides.push({ id: a.t.id, from: [a.r, a.c], to: dest });
          slides.push({ id: b.t.id, from: [b.r, b.c], to: dest });
          let nt = null;
          if (res > 0) { nt = tile(res); ng[dest[0]][dest[1]] = nt; k++; }
          merges.push({ ids: [a.t.id, b.t.id], to: dest, a: a.t.v, b: b.t.v, res, tile: nt });
          i += 2;
        } else {
          ng[dest[0]][dest[1]] = a.t; k++;
          slides.push({ id: a.t.id, from: [a.r, a.c], to: dest });
          i++;
        }
      }
    }
    const moved = merges.length > 0 || slides.some(s => s.from[0] !== s.to[0] || s.from[1] !== s.to[1]);
    return { moved, grid: ng, slides, merges };
  }
  function maxTile(st) {
    let m = 0;
    for (const row of st.grid) for (const t of row) if (t && t.v > m) m = t.v;
    return m;
  }
  function progress(st) { return st.op === '-' ? st.pairs : maxTile(st); }
  function canMove(st) { return DIRS.some(d => step(st, d).moved); }
  /* laksanakan langkah: ubah st, pulangkan maklumat animasi */
  function apply(st, dir) {
    if (st.status !== 'main') return { moved: false };
    const r = step(st, dir);
    if (!r.moved) return { moved: false };
    st.grid = r.grid; st.moves++;
    let sum = 0;
    for (const m of r.merges) { sum += st.op === '-' ? m.a * 10 : m.res; if (m.res === 0) st.pairs++; }
    const nm = r.merges.length;
    st.streak = nm ? st.streak + 1 : 0;
    const mult = nm ? 1 + 0.5 * (nm - 1) + 0.25 * Math.min(Math.max(0, st.streak - 1), 4) : 1;
    const gain = Math.round(sum * mult);
    st.score += gain;
    const sp = spawn(st);
    if (progress(st) >= st.level.target) st.status = 'menang';
    else if (st.moves >= st.level.maxMoves || !canMove(st)) st.status = 'kalah';
    return { moved: true, slides: r.slides, merges: r.merges, spawn: sp, gain, mult, nm, streak: st.streak, status: st.status };
  }
  function stars(st) {
    const p = st.level.par;
    return st.moves <= p ? 3 : st.moves <= Math.ceil(p * 1.4) ? 2 : 1;
  }
  function snapshot(st) {
    return { grid: st.grid.map(r => r.slice()), moves: st.moves, score: st.score, pairs: st.pairs, streak: st.streak };
  }
  function restore(st, s) {
    st.grid = s.grid.map(r => r.slice()); st.moves = s.moves; st.score = s.score;
    st.pairs = s.pairs; st.streak = s.streak; st.status = 'main';
  }
  /* bot Monte Carlo ringkas (untuk ujian automatik) */
  function clone(st) {
    return { n: st.n, op: st.op, level: st.level, rnd: st.rnd, grid: st.grid.map(r => r.slice()),
      moves: st.moves, score: st.score, pairs: st.pairs, streak: st.streak, status: st.status };
  }
  function evalState(st) {
    let e = 0, mx = 0;
    for (const row of st.grid) for (const t of row) { if (!t) e++; else if (t.v > mx) mx = t.v; }
    const goal = st.level.target;
    const prog = st.op === '-' ? st.pairs / goal : Math.log(maxTile(st) + 1) / Math.log(goal + 1);
    return (st.status === 'menang' ? 1000 : 0) - (st.status === 'kalah' ? 500 : 0) + prog * 100 + e * 2;
  }
  function bot(st, playouts, depth) {
    playouts = playouts || 24; depth = depth || 8;
    let best = null, bs = -1e9;
    for (const d of DIRS) {
      if (!step(st, d).moved) continue;
      let tot = 0;
      for (let p = 0; p < playouts; p++) {
        const c = clone(st); c.rnd = rng((Math.random() * 4294967296) | 0);
        apply(c, d);
        for (let k = 0; k < depth && c.status === 'main'; k++) {
          const opts = DIRS.filter(x => step(c, x).moved);
          if (!opts.length) break;
          apply(c, opts[Math.floor(c.rnd() * opts.length)]);
        }
        tot += evalState(c);
      }
      if (tot > bs) { bs = tot; best = d; }
    }
    return best;
  }
  const GG = { rng, create, step, apply, canMove, progress, maxTile, stars, snapshot, restore, bot, DIRS, empties };
  if (typeof module !== 'undefined' && module.exports) module.exports = GG; else root.GG = GG;
})(typeof self !== 'undefined' ? self : this);
