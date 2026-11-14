'use strict';
// Pembuat soal matematika. Tingkat: mudah (tambah/kurang ≤ 20), sedang (perkalian 2–10, tambah/kurang ≤ 100), sulit (bagi, 2 digit, campuran).
// Kadang berupa soal cerita sepak bola memakai nama pemain di laga.
(function () {
  const R = G.rint;
  function inti(level) {
    if (level === 'mudah') {
      if (Math.random() < .55) { const a = R(2, 12), b = R(1, 9); return { a, b, op: '+', j: a + b }; }
      const a = R(6, 20), b = R(1, a - 1); return { a, b, op: '−', j: a - b };
    }
    if (level === 'sedang') {
      const r = Math.random();
      if (r < .5) { const a = R(2, 10), b = R(2, 10); return { a, b, op: '×', j: a * b }; }
      if (r < .75) { const a = R(15, 60), b = R(8, 39); return { a, b, op: '+', j: a + b }; }
      const a = R(40, 99), b = R(11, a - 5); return { a, b, op: '−', j: a - b };
    }
    const r = Math.random();
    if (r < .3) { const b = R(3, 12), j = R(3, 12); return { a: b * j, b, op: '÷', j }; }
    if (r < .55) { const a = R(11, 25), b = R(3, 9); return { a, b, op: '×', j: a * b }; }
    if (r < .8) { const a = R(3, 9), b = R(3, 9), c = R(2, 20); return { a, b, c, op: 'campur', j: a * b + c }; }
    const a = R(120, 480), b = R(35, 99); return { a, b, op: '−', j: a - b };
  }
  function pengecoh(s) {
    const j = s.j, set = new Set([j]);
    const calon = [j + 1, j - 1, j + 2, j - 2, j + 10, j - 10, j + (s.b || 1), j - (s.b || 1), j + 5, j - 3];
    if (s.op === '×') calon.push(s.a * (s.b + 1), s.a * (s.b - 1), s.a + s.b);
    for (const c of G.acak(calon)) { if (set.size >= 4) break; if (c >= 0 && c !== j) set.add(c); }
    while (set.size < 4) set.add(j + set.size * 3);
    return G.acak([...set]);
  }
  function cerita(s, nama, t) {
    if (s.op === 'campur') return null;
    const id = G.bahasa === 'id';
    if (s.op === '+') return id ? `${nama} berlari ${s.a} meter, lalu ${s.b} meter lagi. Berapa meter totalnya?` : `${nama} runs ${s.a} metres, then ${s.b} metres more. How many metres in total?`;
    if (s.op === '−') return id ? `Ada ${s.a} penonton di tribun. ${s.b} orang pulang lebih awal. Berapa yang masih menonton?` : `There are ${s.a} fans in the stand. ${s.b} leave early. How many are still watching?`;
    if (s.op === '×') return id ? `${nama} mencetak ${s.b} gol di setiap laga. Berapa gol setelah ${s.a} laga?` : `${nama} scores ${s.b} goals every match. How many goals after ${s.a} matches?`;
    if (s.op === '÷') return id ? `${s.a} bola dibagi rata ke ${s.b} tim. Berapa bola untuk tiap tim?` : `${s.a} balls are shared equally by ${s.b} teams. How many balls per team?`;
    return null;
  }
  G.buatSoal = function (level, namaPemain) {
    const s = inti(level);
    const teks = s.op === 'campur' ? `${s.a} × ${s.b} + ${s.c}` : `${s.a} ${s.op} ${s.b}`;
    const c = namaPemain && Math.random() < .35 ? cerita(s, namaPemain) : null;
    return { teks, cerita: c, jawab: s.j, pilihan: pengecoh(s), jelas: `${teks} = ${s.j}` };
  };
})();
