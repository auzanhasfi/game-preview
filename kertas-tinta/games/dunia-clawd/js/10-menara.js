/* Menara Lava: panjat 8 tingkat sambil lava naik. Setiap tingkat berakhir di pad soalan; betul = lif naik & lava turun. */
import * as THREE from 'three';
import { E, Bot, bunuhPemain } from './08-enjin.js';
import { S, simpan, tambahCbux, beriLencana } from './05-simpan.js';
import { t, tx } from './01-teks.js';
import { shuffle } from './03-soal.js';
import { bunyi } from './04-bunyi.js';

const N = 8, H = 22, SEPARUH = 24, RING = 15, PAL = ['#d8714f', '#f2c14e', '#a3b86c', '#7f9fd9', '#8a78b8', '#f19bb4', '#6fa8dc', '#d9b25f'];
const PERIM = RING * 8;
let D, lava, lavaY, lantai, titik, pad, tMula, tamat, menang;

/* titik pada laluan segi empat keliling tiang */
function ring(s) {
  s = ((s % PERIM) + PERIM) % PERIM; const e = RING * 2;
  if (s < e) return [-RING + s, RING];
  if (s < e * 2) return [RING, RING - (s - e)];
  if (s < e * 3) return [RING - (s - e * 2), -RING];
  return [-RING, -RING + (s - e * 3)];
}
/* lantai kaca dengan lubang di (hx,hz) */
function dek(y, warna, hx, hz, atas) {
  const k = { h: 1, warna, kaca: !atas, kamera: false, ...(atas ? { warnaAtas: '#efe6d2' } : {}) }, S2 = SEPARUH, L = 4.5;
  if (hx === null) { D.kotak({ x: 0, y, z: 0, w: S2 * 2, d: S2 * 2, ...k, kaca: false, kamera: true }); return; }
  const ki = hx - L, ka = hx + L, dp = hz - L, bl = hz + L;
  D.kotak({ x: (-S2 + ki) / 2, y, z: 0, w: ki + S2, d: S2 * 2, ...k });
  D.kotak({ x: (S2 + ka) / 2, y, z: 0, w: S2 - ka, d: S2 * 2, ...k });
  D.kotak({ x: hx, y, z: (-S2 + dp) / 2, w: L * 2, d: dp + S2, ...k });
  D.kotak({ x: hx, y, z: (S2 + bl) / 2, w: L * 2, d: S2 - bl, ...k });
  // bingkai pepejal supaya aras mudah dibaca
  for (const [x, z, w, d] of [[0, S2 - 0.5, S2 * 2, 1], [0, -S2 + 0.5, S2 * 2, 1], [S2 - 0.5, 0, 1, S2 * 2], [-S2 + 0.5, 0, 1, S2 * 2]]) D.kotak({ x, y: y + 0.02, z, w, h: 1.1, d, warna, hiasan: true });
}
const JENIS = ['blok', 'alang', 'gerak', 'hilang', 'merah', 'tangga'];

function seksyen(n, y0, s0, jenis, warna) {
  const panjang = 74, naik = 15, st = n + 1;
  const hop = (x, y, z, o = {}) => titik.push({ x, y, z, st, jatuh: true, ...o });
  if (jenis === 'blok' || jenis === 'merah' || jenis === 'hilang') {
    const bil = 9;
    for (let i = 0; i < bil; i++) {
      const s = s0 + 8 + i * (panjang - 12) / (bil - 1), [x, z] = ring(s), y = y0 + 2 + i * (naik - 2) / (bil - 1);
      if (jenis === 'hilang') {
        const b = D.kotak({ x, y, z, w: 5.5, h: 1.2, d: 5.5, warna, dinamik: true, lutsinar: true, onSentuh: () => { if (b.tH === undefined) { b.tH = 1; bunyi('hilang'); } } });
        D.ubah.push((dt) => { if (b.tH === undefined) return; b.tH -= dt; const op = b.tH > 0 ? Math.max(0.2, b.tH) : 0; b.mesh.material.forEach((m) => { m.opacity = op; }); if (b.tH <= 0 && b.aktif) { b.aktif = false; b.mesh.visible = false; } if (b.tH < -2.2) { b.aktif = true; b.mesh.visible = true; b.tH = undefined; b._kena = false; b.mesh.material.forEach((m) => { m.opacity = 1; }); } });
      } else {
        D.kotak({ x, y, z, w: 5.5, h: 1.2, d: 5.5, warna });
        if (jenis === 'merah' && i % 2) D.kotak({ x: x + (i % 4 === 1 ? 1.9 : -1.9), y: y + 0.3, z, w: 1.5, h: 0.3, d: 5.5, warna: '#e8452f', neon: true, bunuh: true });
      }
      hop(x, y, z);
    }
  } else if (jenis === 'alang') {
    const bil = 6;
    for (let i = 0; i < bil; i++) {
      const s = s0 + 10 + i * (panjang - 16) / (bil - 1), [x, z] = ring(s), [x2, z2] = ring(s + 3), y = y0 + 2.4 + i * (naik - 2.4) / (bil - 1);
      const mendatar = Math.abs(x2 - x) > Math.abs(z2 - z);
      D.kotak({ x, y, z, w: mendatar ? 8 : 2, h: 1, d: mendatar ? 2 : 8, warna }); hop(x, y, z);
    }
  } else if (jenis === 'gerak') {
    const bil = 7;
    for (let i = 0; i < bil; i++) {
      const s = s0 + 10 + i * (panjang - 16) / (bil - 1), [x, z] = ring(s), y = y0 + 2.4 + i * (naik - 2.4) / (bil - 1), f = i * 1.4;
      const b = D.kotak({ x, y, z, w: 6, h: 1.2, d: 6, warna, gerak: (tt) => [x, y + Math.sin(tt * 1.2 + f) * 1.6, z] }); hop(0, 0, 0, { part: b });
    }
  } else { // tangga panjang
    const bil = 14;
    for (let i = 0; i < bil; i++) {
      const s = s0 + 5 + i * (panjang - 8) / (bil - 1), [x, z] = ring(s), y = y0 + 1 + i * (naik - 1) / (bil - 1), [x2, z2] = ring(s + 2), mendatar = Math.abs(x2 - x) > Math.abs(z2 - z);
      D.kotak({ x, y, z, w: mendatar ? 3.2 : 5, h: 1, d: mendatar ? 5 : 3.2, warna }); if (i % 2 === 0) hop(x, y, z);
    }
  }
}

function bina(d) {
  D = d; titik = []; pad = []; lantai = 0; tamat = false; menang = false; tMula = 7;
  d.lantaiMati = -40; d.awan(18, 380, 40, 260);
  // lava
  lavaY = -8;
  lava = d.kotak({ x: 0, y: lavaY, z: 0, w: 900, h: 2, d: 900, warna: '#f0642a', neon: true, dinamik: true, hiasan: true });
  // batu keliling di bawah
  for (const [x, z, s] of [[-70, 40, 22], [80, -30, 28], [40, 90, 18], [-90, -60, 26]]) d.kotak({ x, y: 14, z, w: s, h: 40, d: s, warna: '#3a3f55' });
  // tapak
  d.kotak({ x: 0, y: 0, z: 0, w: SEPARUH * 2, h: 6, d: SEPARUH * 2, warna: '#22324f', warnaAtas: '#efe6d2' });
  d.kotak({ x: 0, y: H * N + 6, z: 0, w: 8, h: H * N + 6, d: 8, warna: '#22324f' });
  for (let i = 0; i < N; i++) d.kotak({ x: 0, y: H * (i + 1) - 6, z: 0, w: 8.3, h: 1, d: 8.3, warna: PAL[i], neon: true, hiasan: true });
  // dinding kaca supaya tak jatuh keluar
  for (const [x, z, w, dd] of [[0, SEPARUH + 0.5, SEPARUH * 2 + 2, 1], [0, -SEPARUH - 0.5, SEPARUH * 2 + 2, 1], [SEPARUH + 0.5, 0, 1, SEPARUH * 2 + 2], [-SEPARUH - 0.5, 0, 1, SEPARUH * 2 + 2]]) d.kotak({ x, y: H * N + 12, z, w, h: H * N + 20, d: dd, warna: '#bcdcff', kaca: true, kamera: false });

  const jenis = shuffle(JENIS.concat(JENIS)).slice(0, N);
  jenis[0] = 'blok'; jenis[1] = 'tangga';
  let s = 0;
  for (let n = 0; n < N; n++) {
    const y0 = n * H, warna = PAL[n];
    seksyen(n, y0, s, jenis[n], warna);
    const s1 = s + 78; const [hx, hz] = ring(s1), yP = y0 + 16.5, yNext = (n + 1) * H;
    const p = d.kotak({ x: hx, y: yP, z: hz, w: 8.8, h: 1, d: 8.8, warna: '#d9b25f', dinamik: true, onSentuh: () => bukaSoal(n, p) });
    p.y0 = yP; p.yAkhir = yNext; p.naik = false; pad.push(p);
    const lbl = d.papan([{ t: t('SOALAN', 'QUESTION', 'SOAL'), c: '#d9b25f' }], hx, yP + 7, hz, 8, { w: 300, h: 90 }); p.tanda = lbl;
    titik.push({ x: hx, y: yP, z: hz, st: n + 1, jatuh: true, rehat: 1.2 }); titik.push({ x: hx, y: yNext, z: hz, st: n + 1, jalan: true });
    d.ubah.push((dt) => { if (p.naik && p.y < p.yAkhir) { d.setPos(p, p.x, Math.min(p.yAkhir, p.y + dt * 12), p.z); if (p.y >= p.yAkhir) tibaAras(n); } });
    if (n < N - 1) dek(yNext, PAL[n + 1], hx, hz); else dek(yNext, '#d9b25f', hx, hz, true);
    s = s1;
  }
  // puncak
  const yT = N * H, tiang = new THREE.Group(), mE = new THREE.MeshStandardMaterial({ color: '#e8bd5a', metalness: 0.6, roughness: 0.3, emissive: '#6a4a10', emissiveIntensity: 0.5 });
  const c = new THREE.Mesh(new THREE.OctahedronGeometry(2.4), mE); c.position.y = 3; tiang.add(c);
  tiang.position.set(14, yT, 14); d.grup.add(tiang); d.ubah.push((dt) => { tiang.rotation.y += dt * 1.6; });
  d.kotak({ x: 14, y: yT + 6, z: 14, w: 5, h: 6, d: 5, warna: '#d9b25f', tembus: true, hiasan: false, neon: false, onSentuh: () => sampaiPuncak(), lutsinar: true, dinamik: true }).mesh.visible = false;
  d.papan([{ t: t('PUNCAK', 'SUMMIT', 'PUNCAK'), c: '#d9b25f' }], 14, yT + 10, 14, 14, { w: 400, h: 110 });
  d.spawn = { x: -12, y: 0, z: 12, yaw: Math.PI * 0.25 };
  if (!d.pratonton) {
    for (let i = 0; i < 4; i++) d.bots.push(new Bot(d, i * 2 + 2, { titik, mula: i * 3, malas: 1.2 + i * 0.5, gagal: 0.04, ulang: 0 }));
    d.papan([{ t: t('MENARA LAVA', 'LAVA TOWER', 'MENARA LAVA'), s: 1.3, c: '#d9b25f' }, { t: t('Panjat. Jawab. Lari daripada lava.', 'Climb. Solve. Outrun the lava.', 'Panjat. Jawab. Lari dari lava.'), s: 0.7, b: false }], -6, 12, -18, 22, { w: 640, h: 210 });
  } else {
    for (let i = 0; i < 3; i++) { const q = titik[i * 3 + 2]; if (q && !q.part) d.bots.push(new Bot(d, i + 3, { x: q.x, y: q.y, z: q.z })); }
    lavaY = 6; d.setPos(lava, 0, lavaY, 0);
  }
}
async function bukaSoal(n, p) {
  if (p.naik || p.dibuka || E.P.mati) return; p.dibuka = true;
  let betul = false;
  while (!betul && E.dunia === D) {
    betul = await E.ui.tanya({ tier: Math.min(3, Math.floor(n / 2)), tajuk: t(`Soalan Tingkat ${n + 1}`, `Floor ${n + 1} Question`, `Soal Lantai ${n + 1}`), nota: t('Betul: lif naik & lava turun. Salah: lava melonjak.', 'Correct: lift rises and lava drops. Wrong: lava surges.', 'Benar: lift naik & lava turun. Salah: lava melonjak.') });
    if (!betul) { lavaY += 6; }
  }
  p.dibuka = false; if (E.dunia !== D) return;
  p.naik = true; lavaY -= 6; tambahCbux(3); p.tanda.visible = false; bunyi('pad');
  E.ui.toast?.(t('Lif naik! Lava turun. +3 CBux', 'Lift rising! Lava drops. +3 CBux', 'Lift naik! Lava turun. +3 CBux'), 'ok');
}
function tibaAras(n) {
  lantai = n + 1; const p = pad[n];
  D.spawn = { x: p.x, y: p.y, z: p.z, yaw: D.spawn.yaw };
  S.x.menara.terbaik = Math.max(S.x.menara.terbaik, lantai); simpan();
  bunyi('checkpoint'); E.ui.banner?.(t('Tingkat ', 'Floor ', 'Lantai ') + (lantai + 1) + ' / ' + (N + 1)); E.ui.segar?.();
}
function sampaiPuncak() {
  if (menang) return; menang = true; tamat = true; S.x.menara.menang++; simpan(); beriLencana('menara'); tambahCbux(40); bunyi('menang'); E.P.sorak = 6; E.ui.konfeti?.();
  E.ui.toast?.(t('Anda sampai puncak! +40 CBux', 'You reached the summit! +40 CBux', 'Kamu sampai puncak! +40 CBux'), 'emas');
}
function kemas(dt) {
  const P = E.P; if (!P) return;
  if (!tamat) {
    if (tMula > 0) { tMula -= dt; E.ui.info?.(t(`Lava mula naik dalam ${Math.ceil(tMula)}`, `Lava starts rising in ${Math.ceil(tMula)}`, `Lava mulai naik dalam ${Math.ceil(tMula)}`)); }
    else {
      const laju = { mudah: 0.42, sedang: 0.55, sulit: 0.7 }[S.diff] + lantai * 0.035;
      lavaY += laju * dt; if (lavaY < P.pos.y - 60) lavaY = P.pos.y - 60;
      const jarak = Math.max(0, Math.round(P.pos.y - lavaY));
      E.ui.info?.(t(`Lava: ${jarak} m di bawah`, `Lava: ${jarak} m below`, `Lava: ${jarak} m di bawah`));
      if (P.pos.y < lavaY - 0.2 && !P.mati && P.kebal <= 0) bunuhPemain();
    }
  }
  D.setPos(lava, 0, lavaY, 0);
  for (const b of D.bots) { b.statistik.aras = titik[Math.min(b.ti, titik.length - 1)].st; if (b.pos.y < lavaY) { b.ti = 0; b.pos.copy(b._titik(0)); b.dur = 0; b.pos.y = Math.max(b.pos.y, 0); } }
}
export const MENARA = {
  id: 'menara', tema: 'menara', langit: ['#3b2a48', '#e28a4a', [200, 700]], cahaya: [1.15, 2.2],
  pratonton: { p: [62, 54, 62], t: [0, 34, 0] },
  bina, kemas,
  mula() { E.ui.banner?.(t('Tingkat 1 / ', 'Floor 1 / ', 'Lantai 1 / ') + (N + 1)); },
  /* jatuh dalam lava: satu soalan untuk bangkit */
  async sebelumMuncul() {
    if (tamat) return;
    if (lavaY < D.spawn.y - 8) return; // jatuh biasa, lava masih jauh
    const ok = await E.ui.tanya({ tier: 0, tajuk: t('Bangkit semula', 'Revive', 'Bangkit lagi'), nota: t('Betul: terus di tingkat ini, lava turun jauh. Salah: mula dari bawah.', 'Correct: stay on this floor, lava drops far. Wrong: restart from the bottom.', 'Benar: lanjut di lantai ini, lava turun jauh. Salah: mulai dari bawah.') });
    if (E.dunia !== D) return;
    if (ok) { lavaY = D.spawn.y - 34; }
    else {
      lantai = 0; lavaY = -8; tMula = 7; D.spawn = { x: -12, y: 0, z: 12, yaw: Math.PI * 0.25 };
      pad.forEach((p) => { p.naik = false; D.setPos(p, p.x, p.y0, p.z); p.tanda.visible = true; });
      E.ui.banner?.(t('Tingkat 1 / ', 'Floor 1 / ', 'Lantai 1 / ') + (N + 1));
    }
    D.setPos(lava, 0, lavaY, 0);
  },
  statistik() { return [{ k: t('Tingkat', 'Floor', 'Lantai'), v: lantai + 1 }, { k: t('Terbaik', 'Best', 'Terbaik'), v: S.x.menara.terbaik + 1 }]; },
  statistikBot(b) { return [b.statistik.aras || 1, b.nama.length % 6 + 2]; },
  keluar() { E.ui.info?.(''); },
  uji: { setLava: (y) => { lavaY = y; tMula = 0; }, titik: () => titik, lantai: () => lantai, pad: () => pad, lava: () => lavaY, bukaSoal: (n) => bukaSoal(n, pad[n]), naik: (n) => { pad[n].naik = true; }, puncak: sampaiPuncak }
};
