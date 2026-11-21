/* Enjin logik tulen (tiada DOM): geometri grid, soalan, simulasi tembakan, berantai, jatuh. */
(function (root) {
  'use strict';
  const W = 360, H = 520, R = 22, ROWH = 38, BALLR = 15, SX = 180, SY = 452, DANGER = 420, STEP = 44;
  const HITD = R + BALLR - 4;

  function rng(seed) {
    let a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const pick = (arr, rand) => arr[Math.floor(rand() * arr.length)];

  /* ---------- soalan ---------- */
  function valuesFor(lv) {
    const s = new Set();
    if (lv.ops.includes('+')) for (let v = 2; v <= lv.addMax; v++) s.add(v);
    if (lv.ops.includes('-')) for (let v = 1; v <= lv.subRes; v++) if (lv.subA - v >= 1) s.add(v);
    if (lv.ops.includes('*')) for (let a = 2; a <= lv.mulMax; a++) for (let b = a; b <= lv.mulMax; b++) s.add(a * b);
    return [...s].sort((x, y) => x - y);
  }
  function makeQuestion(v, lv, rand) {
    const ops = lv.ops.slice().sort(() => rand() - 0.5);
    for (const op of ops) {
      if (op === '+' && v >= 2 && v <= lv.addMax) {
        const a = 1 + Math.floor(rand() * (v - 1)); return { op, a, b: v - a, ans: v, text: a + ' + ' + (v - a) };
      }
      if (op === '-' && v >= 1 && v <= lv.subRes) {
        const maxB = Math.min(lv.subB, lv.subA - v);
        if (maxB >= 1) { const b = 1 + Math.floor(rand() * maxB); return { op, a: v + b, b, ans: v, text: (v + b) + ' − ' + b }; }
      }
      if (op === '*') {
        const pairs = [];
        for (let a = 2; a <= lv.mulMax; a++) if (v % a === 0 && v / a >= 2 && v / a <= lv.mulMax) pairs.push([a, v / a]);
        if (pairs.length) { let [a, b] = pick(pairs, rand); if (rand() < 0.5) [a, b] = [b, a]; return { op, a, b, ans: v, text: a + ' × ' + b }; }
      }
    }
    return null;
  }
  function check(q) { return q.op === '+' ? q.a + q.b === q.ans : q.op === '-' ? q.a - q.b === q.ans : q.a * q.b === q.ans; }

  /* ---------- grid ---------- */
  const isLong = (G, r) => ((r + G.par) % 2) === 0;
  const rowLen = (G, r) => isLong(G, r) ? 7 : 6;
  const cx = (G, r, c) => (isLong(G, r) ? 48 : 70) + c * STEP;
  const cy = r => R + 4 + ROWH * r;
  let nid = 1;
  function newRow(G, lv, rand, holes) {
    G.par ^= 1;
    const vals = valuesFor(lv), n = rowLen(G, 0), row = [];
    for (let c = 0; c < n; c++) row.push(rand() < (holes || 0) ? null : { v: pick(vals, rand), id: nid++, shake: 0 });
    if (row.every(b => !b)) row[Math.floor(rand() * n)] = { v: pick(vals, rand), id: nid++, shake: 0 };
    G.rows.unshift(row);
    return row;
  }
  function newGrid(lv, rand) {
    const G = { rows: [], par: 0 };
    for (let i = 0; i < lv.rows; i++) newRow(G, lv, rand, i === lv.rows - 1 ? 0.25 : 0.04);
    return G;
  }
  function list(G) {
    const out = [];
    G.rows.forEach((row, r) => row.forEach((b, c) => { if (b) out.push({ r, c, x: cx(G, r, c), y: cy(r), b }); }));
    return out;
  }
  const count = G => list(G).length;
  function neighborsIn(L, e) { return L.filter(o => o !== e && Math.abs(o.r - e.r) <= 1 && Math.hypot(o.x - e.x, o.y - e.y) < 2 * R + 4); }
  function floodSame(G, r, c) {
    const L = list(G), start = L.find(e => e.r === r && e.c === c); if (!start) return [];
    const seen = new Set([start]), q = [start];
    while (q.length) { const e = q.pop(); for (const o of neighborsIn(L, e)) if (!seen.has(o) && o.b.v === start.b.v) { seen.add(o); q.push(o); } }
    return [...seen];
  }
  function orphans(G) {
    const L = list(G), seen = new Set(), q = [];
    L.forEach(e => { if (e.r === 0) { seen.add(e); q.push(e); } });
    while (q.length) { const e = q.pop(); for (const o of neighborsIn(L, e)) if (!seen.has(o)) { seen.add(o); q.push(o); } }
    return L.filter(e => !seen.has(e));
  }
  /* buang baris kosong paling atas; pulangkan bilangan baris dibuang */
  function compact(G) {
    let n = 0;
    while (G.rows.length > 1 && G.rows[0].every(b => !b)) { G.rows.shift(); G.par ^= 1; n++; }
    while (G.rows.length && G.rows[G.rows.length - 1].every(b => !b)) G.rows.pop();
    return n;
  }
  const lowest = G => list(G).reduce((m, e) => Math.max(m, e.y + R), 0);

  /* ---------- simulasi tembakan ---------- */
  function simulate(G, angleDeg, L) {
    L = L || list(G);
    const a = angleDeg * Math.PI / 180; let vx = Math.cos(a), vy = -Math.sin(a), x = SX, y = SY, bounces = 0;
    const path = [{ x, y }], s = 5;
    for (let i = 0; i < 1500; i++) {
      x += vx * s; y += vy * s;
      if (x < BALLR) { x = 2 * BALLR - x; vx = -vx; bounces++; path.push({ x: BALLR, y }); }
      else if (x > W - BALLR) { x = 2 * (W - BALLR) - x; vx = -vx; bounces++; path.push({ x: W - BALLR, y }); }
      if (y <= BALLR) { path.push({ x, y }); return { hit: null, path, bounces }; }
      let best = null, bd = HITD * HITD;
      for (const e of L) { const dx = e.x - x, dy = e.y - y; if (Math.abs(dy) > HITD) continue; const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = e; } }
      if (best) { path.push({ x, y }); return { hit: { r: best.r, c: best.c }, path, bounces }; }
    }
    return { hit: null, path, bounces };
  }
  /* semua gelembung yang boleh dikenai: Map "r,c" -> {r,c,angle,bounces} (utamakan pantulan sedikit, sudut dekat 90) */
  function reachable(G) {
    const L = list(G), m = new Map();
    for (let ang = 10; ang <= 170; ang += 1) {
      const res = simulate(G, ang, L); if (!res.hit) continue;
      const k = res.hit.r + ',' + res.hit.c, old = m.get(k);
      const better = !old || res.bounces < old.bounces || (res.bounces === old.bounces && Math.abs(ang - 90) < Math.abs(old.angle - 90));
      if (better) m.set(k, { r: res.hit.r, c: res.hit.c, angle: ang, bounces: res.bounces });
    }
    return m;
  }

  const GT = { W, H, R, ROWH, BALLR, SX, SY, DANGER, STEP, rng, pick, valuesFor, makeQuestion, check, isLong, rowLen, cx, cy, newRow, newGrid, list, count, floodSame, orphans, compact, lowest, simulate, reachable };
  root.GT = GT;
  if (typeof module !== 'undefined') module.exports = GT;
})(typeof window !== 'undefined' ? window : globalThis);
