/* Clawd Kilat: kartu pola rintangan. Tiap pola = { pjg, isi: [[tipe, lajur, dz, opsi]] }.
   Aturan: setiap baris selalu punya jalan keluar (lajur kosong, bisa lompat, atau bisa guling). */

const L3 = [-1, 0, 1];
const acak = (a) => a[Math.floor(Math.random() * a.length)];
const lain = (l) => L3.filter((x) => x !== l);
const LOMPAT = { vy: 11.5, g: 30 };

function barisKoin(isi, l, dz, n, jarak = 2.6, y = 0.9) { for (let i = 0; i < n; i++) isi.push(['koin', l, dz + i * jarak, { y }]); }
/* koin melengkung mengikuti lintasan lompatan pada laju sekarang */
function busurKoin(isi, l, dzPusat, laju, vy = LOMPAT.vy, n = 7) {
  const tUdara = 2 * vy / LOMPAT.g;
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * tUdara, y = vy * t - 0.5 * LOMPAT.g * t * t;
    isi.push(['koin', l, dzPusat - tUdara * laju / 2 + t * laju, { y: y + 0.9 }]);
  }
}

export const POLA = {
  koinLurus(c) { const isi = [], l = acak(L3); barisKoin(isi, l, 0, 8); return { pjg: 30, isi, tingkat: 0 }; },
  koinZigzag(c) { const isi = []; let l = acak(L3); for (let i = 0; i < 9; i++) { if (i % 3 === 0 && i) l = acak(lain(l).filter((x) => Math.abs(x - l) === 1)); isi.push(['koin', l, i * 2.8, { y: 0.9 }]); } return { pjg: 30, isi, tingkat: 0 }; },
  pagarSatu(c) { const isi = [], l = acak(L3); isi.push(['pagar', l, 10]); busurKoin(isi, l, 10, c.laju); barisKoin(isi, acak(lain(l)), 0, 5); return { pjg: 26, isi, tingkat: 0 }; },
  pagarDua(c) { const isi = [], kosong = acak(L3); for (const l of lain(kosong)) isi.push(['pagar', l, 10]); barisKoin(isi, kosong, 2, 6); return { pjg: 26, isi, tingkat: 1 }; },
  pagarTiga(c) { const isi = []; for (const l of L3) isi.push(['pagar', l, 12]); busurKoin(isi, acak(L3), 12, c.laju); return { pjg: 28, isi, tingkat: 1 }; },
  gapuraTiga(c) { const isi = []; for (const l of L3) isi.push(['gapura', l, 12]); const k = acak(L3); for (let i = 0; i < 5; i++) isi.push(['koin', k, 6 + i * 2.4, { y: 0.55 }]); return { pjg: 28, isi, tingkat: 1 }; },
  gapuraSatu(c) { const isi = [], l = acak(L3); isi.push(['gapura', l, 10]); barisKoin(isi, l, 4, 5, 2.4, 0.55); isi.push(['tembok', acak(lain(l)), 10]); return { pjg: 26, isi, tingkat: 1 }; },
  celah(c) { const isi = [], kosong = acak(L3); for (const l of lain(kosong)) isi.push(['tembok', l, 12]); barisKoin(isi, kosong, 4, 6); return { pjg: 28, isi, tingkat: 1 }; },
  tembokSatu(c) { const isi = [], l = acak(L3); isi.push(['tembok', l, 10]); barisKoin(isi, acak(lain(l)), 0, 6); return { pjg: 24, isi, tingkat: 0 }; },
  comot(c) { const isi = [], l = acak(L3); isi.push(['comot', l, 12]); busurKoin(isi, l, 12, c.laju); if (Math.random() < 0.5) isi.push(['comot', acak(lain(l)), 22]); return { pjg: 30, isi, tingkat: 0 }; },
  comotBaris(c) { const isi = [], k = acak(L3); for (const l of lain(k)) isi.push(['comot', l, 12]); barisKoin(isi, k, 6, 5); return { pjg: 28, isi, tingkat: 1 }; },
  terbang(c) { const isi = [], l = acak(L3); isi.push(['terbang', l, 12]); for (let i = 0; i < 4; i++) isi.push(['koin', l, 7 + i * 2.4, { y: 0.55 }]); isi.push(['terbang', acak(lain(l)), 12]); return { pjg: 28, isi, tingkat: 1 }; },
  bola(c) { const isi = [], ayun = Math.random() < 0.5 ? 1 : -1; isi.push(['bola', 0, 14, { ayun }]); barisKoin(isi, -ayun, 4, 6); return { pjg: 30, isi, tingkat: 2 }; },
  pegas(c) { const isi = [], l = acak(L3); isi.push(['pegas', l, 6]); busurKoin(isi, l, 6 + 1.27 * c.laju / 2, c.laju, 19, 12); for (const x of lain(l)) isi.push(['pagar', x, 18]); return { pjg: 6 + 1.27 * c.laju + 8, isi, tingkat: 1 }; },
  pad(c) { const isi = [], l = acak(L3); isi.push(['pad', l, 4]); barisKoin(isi, l, 9, 10, 3); return { pjg: 42, isi, tingkat: 0 }; },
  kolam(c) { const isi = []; isi.push(['kolam', 0, 14]); busurKoin(isi, acak(L3), 14, c.laju); return { pjg: 30, isi, tingkat: 2 }; },
  tangga(c) { const isi = [], l = acak(L3); isi.push(['pagar', l, 6], ['gapura', l, 20], ['comot', l, 34]); for (const x of lain(l)) isi.push(['tembok', x, 20]); barisKoin(isi, l, 10, 3); return { pjg: 44, isi, tingkat: 2 }; },
  campur(c) { const isi = [], a = acak(L3), b = acak(lain(a)), k = L3.find((x) => x !== a && x !== b); isi.push(['pagar', a, 10], ['tembok', b, 10], ['comot', k, 22]); busurKoin(isi, a, 10, c.laju); return { pjg: 32, isi, tingkat: 2 }; }
};

const BOBOT = { koinLurus: 3, koinZigzag: 2, pagarSatu: 4, pagarDua: 2, pagarTiga: 1.5, gapuraTiga: 2, gapuraSatu: 2, celah: 2.5, tembokSatu: 3, comot: 3.5, comotBaris: 2, terbang: 2, bola: 1.5, pegas: 1.5, pad: 1.2, kolam: 1.2, tangga: 1.5, campur: 2 };

/* pilih pola sesuai jarak (tingkat 2 setelah 500 m, kolam hanya zona Kota Tinta/setelah 1500 m) */
export function pilihPola(c) {
  const daftar = Object.keys(POLA).filter((k) => !(k === 'kolam' && c.zona !== 2 && c.dist < 2400));
  const maksTk = c.dist < 250 ? 0 : c.dist < 600 ? 1 : 2;
  let tot = 0; const calon = [];
  for (const k of daftar) { const p = POLA[k](c); if (p.tingkat > maksTk) continue; const w = BOBOT[k] * (c.zona === 2 && k === 'kolam' ? 2 : 1); calon.push([p, w]); tot += w; }
  let x = Math.random() * tot; for (const [p, w] of calon) { x -= w; if (x <= 0) return p; }
  return calon[0][0];
}

/* power-up sesekali di lajur kosong */
export function mungkinPower(c) {
  const r = Math.random();
  if (r < c.peluangPerisai) return 'perisai';
  if (r < c.peluangPerisai + 0.05) return 'magnet';
  if (r < c.peluangPerisai + 0.08) return 'isiKilat';
  if (r < c.peluangPerisai + 0.095) return 'merah';
  return null;
}
