/* Kebun Ajaib: beli benih (soalan harga × kuantiti), tanam, tunggu masa nyata (tumbuh walaupun keluar),
   tuai, kadang-kadang jadi emas atau basah hujan, jual di gerai (soalan jumlah). Naik taraf petak & penyiram. */
import * as THREE from 'three';
import { E, Bot } from './08-enjin.js';
import { S, simpan, tambahCbux, beriLencana } from './05-simpan.js';
import { t, tx, nombor } from './01-teks.js';
import { ic } from './02-ikon.js';
import { pilihan } from './03-soal.js';
import { bunyi } from './04-bunyi.js';
import { tukarTeks } from './06-bahan.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const BENIH = {
  lobak: { n: ['Lobak Merah', 'Carrot', 'Wortel'], h: 4, jual: 7, masa: 20, w: '#e8732c' },
  tomato: { n: ['Tomato', 'Tomato', 'Tomat'], h: 9, jual: 18, masa: 35, w: '#d8473a' },
  jagung: { n: ['Jagung', 'Corn', 'Jagung'], h: 20, jual: 42, masa: 55, w: '#efcf4a' },
  labu: { n: ['Labu', 'Pumpkin', 'Labu'], h: 45, jual: 100, masa: 80, w: '#e2862e' },
  bintang: { n: ['Buah Bintang', 'Star Fruit', 'Buah Bintang'], h: 120, jual: 280, masa: 120, w: '#f2d36b' }
};
const KOL = 4, BAR = 3, PS = 9, JARAK = 12, X0 = -((KOL - 1) * JARAK) / 2, Z0 = -6;
const q2 = (ty, a, b) => { const c = ty === 'kali' ? a * b : a + b; const q = { ty, a, b, c, miss: 0, lv: 3, ans: c }; q.opts = pilihan(q, 4); return q; };
let D, petak, tumbuhan, aksi, pilihBenih, hujan, tHujan, tikPapan, papanWang;

function K() { return S.x.kebun; }
function bina(d) {
  D = d; petak = []; tumbuhan = []; aksi = null; pilihBenih = Object.keys(K().benih).find((k) => K().benih[k] > 0) || 'lobak'; hujan = 0; tHujan = 50 + Math.random() * 40; tikPapan = 0;
  d.lantaiMati = -40; d.awan(20, 400, 90, 180);
  d.kotak({ x: 0, y: 0, z: 0, w: 150, h: 4, d: 150, warna: '#6a5a44', warnaAtas: '#7cbc58' });
  // laluan
  d.kotak({ x: 0, y: 0.1, z: 30, w: 8, h: 0.1, d: 40, warna: '#d9c385', hiasan: true });
  d.kotak({ x: 0, y: 0.1, z: 12, w: 64, h: 0.1, d: 6, warna: '#d9c385', hiasan: true });
  // pagar
  for (const [x, z, w, dd] of [[0, -32, 60, 1], [-30, -9, 1, 46], [30, -9, 1, 46]]) d.kotak({ x, y: 2.4, z, w, h: 2.4, d: dd, warna: '#b8874e' });
  // petak
  for (let r = 0; r < BAR; r++) for (let c = 0; c < KOL; c++) {
    const i = r * KOL + c, x = X0 + c * JARAK, z = Z0 - r * JARAK, buka = i < K().buka;
    const b = d.kotak({ x, y: 0.6, z, w: PS, h: 0.6, d: PS, warna: buka ? '#5c3d24' : '#4a4f5c', warnaAtas: buka ? '#6d4a2a' : '#5d6272', dinamik: true, onSentuh: () => {} });
    const tanda = d.papan([{ t: buka ? '' + (i + 1) : t('Kunci', 'Locked', 'Kunci'), c: '#d9b25f', s: 1 }, ...(buka ? [] : [{ t: nombor(hargaPetak(i)), c: '#efe6d2', s: 0.7 }])], x, 5.4, z + PS / 2, 3.2, { w: 220, h: 120 });
    tanda.visible = !buka;
    petak.push({ i, x, z, b, tanda, buka });
  }
  // gerai benih & jual
  gerai(-22, 28, '#3f7a4f', t('BENIH', 'SEEDS', 'BENIH'));
  gerai(22, 28, '#c0392b', t('JUAL', 'SELL', 'JUAL'));
  gerai(0, 48, '#2c3e6b', t('ALAT', 'GEAR', 'ALAT'));
  papanWang = d.papan([{ t: '', c: '#d9b25f' }], 0, 13, -36, 22, { w: 600, h: 120 });
  for (const [x, z] of [[-50, -40], [-58, 10], [52, -30], [56, 30], [-40, 56], [40, 60]]) d.pokok(x, 0, z, 1.2);
  d.spawn = { x: 0, y: 0.1, z: 40, yaw: 0 };
  if (!d.pratonton) for (let i = 0; i < 4; i++) d.bots.push(new Bot(d, i * 2 + 5, { kawasan: { x: 0, z: 20, w: 90, d: 40 }, y: 0, x: (i - 2) * 8, z: 30 }));
  segarTumbuhan(true);
}
function gerai(x, z, warna, label) {
  D.kotak({ x, y: 0.3, z, w: 10, h: 0.3, d: 10, warna: '#d9b25f', hiasan: true });
  D.kotak({ x: x - 5.5, y: 8, z: z - 5.5, w: 1, h: 8, d: 1, warna: '#6d4a2a' }); D.kotak({ x: x + 5.5, y: 8, z: z - 5.5, w: 1, h: 8, d: 1, warna: '#6d4a2a' });
  D.kotak({ x, y: 9, z: z - 5, w: 13, h: 1, d: 4, warna });
  D.kotak({ x, y: 3, z: z - 5.5, w: 11, h: 3, d: 2, warna: '#b8874e' });
  D.papan([{ t: label, c: '#d9b25f' }], x, 12, z - 5, 9, { w: 300, h: 90 });
}
const hargaPetak = (i) => 30 + (i - 6) * 25;
const hargaAlat = { penyiram: 120, bakul: 80 };

/* ---------- tanaman ---------- */
const gK = new THREE.BoxGeometry(1, 1, 1); gK.userData.kongsi = true;
const mat = {}; function m(w, e) { const k = w + (e || ''); return mat[k] ||= Object.assign(new THREE.MeshLambertMaterial({ color: w, emissive: e || '#000000' }), { userData: { kongsi: true } }); }
function modelTanaman(j) {
  const g = new THREE.Group(), B2 = BENIH[j], daun = m('#4f9a4a');
  const kp = (w, h, d, mt, x, y, z) => { const b = new THREE.Mesh(gK, mt); b.scale.set(w, h, d); b.position.set(x, y, z); b.castShadow = true; g.add(b); return b; };
  if (j === 'lobak') { kp(1, 1.2, 1, m(B2.w), 0, 0.4, 0); kp(0.3, 1.4, 0.3, daun, -0.25, 1.6, 0); kp(0.3, 1.2, 0.3, daun, 0.25, 1.5, 0.1); }
  else if (j === 'tomato') { kp(0.3, 3, 0.3, daun, 0, 1.5, 0); for (const [x, y, z] of [[0.6, 2.2, 0], [-0.6, 1.6, 0.3], [0.2, 2.8, -0.5]]) kp(0.9, 0.9, 0.9, m(B2.w), x, y, z); }
  else if (j === 'jagung') { kp(0.4, 5, 0.4, daun, 0, 2.5, 0); kp(0.9, 2, 0.9, m(B2.w), 0.45, 3.4, 0); kp(1.6, 0.2, 0.3, daun, 0, 2, 0); }
  else if (j === 'labu') { kp(2.6, 1.8, 2.6, m(B2.w), 0, 0.9, 0); kp(0.3, 0.6, 0.3, m('#6d4a2a'), 0, 2, 0); kp(1.5, 0.15, 0.5, daun, 0.8, 0.2, 1.3); }
  else { kp(0.3, 3.4, 0.3, m('#6d4a2a'), 0, 1.7, 0); kp(2.2, 1.4, 2.2, daun, 0, 3.6, 0); const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.75), m(B2.w, '#7a5a14')); s.position.set(0.9, 3.2, -0.9); g.add(s); g.userData.bintang = s; }
  return g;
}
function kemajuan(p) { if (!p.jenis) return 0; const pen = K().alat.includes('penyiram') ? 1.5 : 1; return Math.min(1, ((Date.now() - p.t0) / 1000) * pen / BENIH[p.jenis].masa + (p.bonus || 0)); }
function segarTumbuhan(semua) {
  const data = K().petak;
  petak.forEach((pk, i) => {
    const p = data[i]; let tm = tumbuhan[i];
    if (!p || !p.jenis) { if (tm) { D.grup.remove(tm.g); tumbuhan[i] = null; } return; }
    if (!tm || tm.jenis !== p.jenis || semua) {
      if (tm) D.grup.remove(tm.g);
      const g = new THREE.Group(); const pos = [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4], [0, 0]];
      for (const [x, z] of pos) { const c = modelTanaman(p.jenis); c.position.set(x, 0, z); g.add(c); }
      g.position.set(pk.x, 0.6, pk.z); D.grup.add(g); tm = tumbuhan[i] = { g, jenis: p.jenis };
      if (p.emas) g.traverse((o) => { if (o.isMesh && o.material !== m('#4f9a4a')) o.material = m('#e8bd5a', '#6a4a10'); });
    }
    const k = kemajuan(p), s = 0.25 + 0.75 * k; tm.g.scale.set(s, s, s);
    tm.masak = k >= 1;
  });
}

/* ---------- interaksi ---------- */
function dekatPetak() { const P = E.P.pos; return petak.find((p) => Math.abs(P.x - p.x) < PS / 2 + 1 && Math.abs(P.z - p.z) < PS / 2 + 1); }
function dekat(x, z, r = 6) { const P = E.P.pos; return Math.hypot(P.x - x, P.z - (z - 1)) < r; }
function aturAksi(label, fn) { if (aksi?.label === label) return; aksi = label ? { label, fn } : null; E.ui.butangAksi?.(label, fn || (() => {})); }
async function tanam(pk) {
  const b = K().benih; if (!(b[pilihBenih] > 0)) { pilihBenih = Object.keys(b).find((k) => b[k] > 0); if (!pilihBenih) { E.ui.toast?.(t('Tiada benih. Beli di gerai BENIH.', 'No seeds. Buy some at the SEEDS stall.', 'Tidak ada benih. Beli di kios BENIH.'), 'amaran'); return; } }
  b[pilihBenih]--; K().petak[pk.i] = { jenis: pilihBenih, t0: Date.now(), emas: Math.random() < 0.08, basah: false, bonus: 0 }; simpan(); bunyi('tapak');
  segarTumbuhan(); lukisPanel(); aksi = null;
}
function tuai(pk) {
  const p = K().petak[pk.i]; const B2 = BENIH[p.jenis]; let nilai = B2.jual * 5;
  if (p.emas) { nilai *= 5; beriLencana('emas'); E.ui.konfeti?.(); }
  if (p.basah) nilai = Math.round(nilai * 1.5);
  const bakul = K().bakul ||= []; bakul.push({ j: p.jenis, v: nilai, emas: p.emas, basah: p.basah });
  K().petak[pk.i] = null; simpan(); bunyi('koin'); E.ui.toast?.(t('Dituai: ', 'Harvested: ', 'Dipanen: ') + tx(B2.n) + (p.emas ? t(' (EMAS!)', ' (GOLDEN!)', ' (EMAS!)') : '') + ` · ${nombor(nilai)}`, p.emas ? 'emas' : 'ok');
  segarTumbuhan(); lukisPanel(); aksi = null;
}
async function bukaPetak(pk) {
  const h = hargaPetak(pk.i); if (K().wang < h) { E.ui.toast?.(t(`Perlu ${h} syiling kebun.`, `Need ${h} garden coins.`, `Perlu ${h} koin kebun.`), 'amaran'); return; }
  const ok = await E.ui.tanya({ q: q2('tambah', K().buka * 5, h % 50 || 12), tajuk: t('Buka petak baharu', 'Unlock a new plot', 'Buka petak baru') }); if (!ok || E.dunia !== D) return;
  K().wang -= h; K().buka++; simpan(); bunyi('beli');
  E.ui.toast?.(t('Petak dibuka!', 'Plot unlocked!', 'Petak terbuka!'), 'emas'); E.ui.masukSemula?.();
}
function kedaiBenih() {
  E.ui.modal?.(`<div class="mt"><h3>${t('Gerai Benih', 'Seed Stall', 'Kios Benih')}</h3><button class="xbtn" data-tt>${ic('close', 18)}</button></div>
    <p class="fine">${t('Syiling kebun', 'Garden coins', 'Koin kebun')}: <b>${nombor(K().wang)}</b>. ${t('Beli 1, 3 atau 5. Kira jumlah harganya!', 'Buy 1, 3 or 5. Work out the total price!', 'Beli 1, 3, atau 5. Hitung total harganya!')}</p>
    <div class="rk-l">${Object.entries(BENIH).map(([k, b]) => `<div class="rk-b"><span style="width:36px;height:36px;border-radius:8px;background:${b.w}"></span><div><b>${esc(tx(b.n))}</b><small>${t('Harga', 'Price', 'Harga')} ${b.h} · ${t('masa', 'grows', 'tumbuh')} ${b.masa}s · ${t('jual', 'sells', 'jual')} ${b.jual * 5} · ${t('ada', 'have', 'punya')} ${K().benih[k] || 0}</small></div><div class="seg">${[1, 3, 5].map((n) => `<button data-b="${k}" data-n="${n}" data-uji="benih-${k}-${n}">×${n}</button>`).join('')}</div></div>`).join('')}</div>`,
  (M, tutup) => {
    M.querySelector('[data-tt]').onclick = tutup;
    M.querySelectorAll('[data-b]').forEach((b) => { b.onclick = async () => {
      const k = b.dataset.b, n = Number(b.dataset.n), h = BENIH[k].h, jum = h * n;
      if (K().wang < jum) { bunyi('salah'); b.classList.add('goyang'); setTimeout(() => b.classList.remove('goyang'), 400); return; }
      tutup(); const ok = await E.ui.tanya({ q: q2('kali', h, n), tajuk: t('Jumlah harga', 'Total price', 'Total harga'), nota: t(`${n} benih ${tx(BENIH[k].n)}, setiap satu ${h} syiling.`, `${n} ${tx(BENIH[k].n)} seeds at ${h} coins each.`, `${n} benih ${tx(BENIH[k].n)}, masing-masing ${h} koin.`) });
      if (E.dunia !== D) return;
      if (ok) { K().wang -= jum; K().benih[k] = (K().benih[k] || 0) + n; pilihBenih = k; simpan(); bunyi('beli'); lukisPanel(); }
      kedaiBenih();
    }; });
  });
}
async function jual() {
  const bakul = K().bakul || []; if (!bakul.length) { E.ui.toast?.(t('Bakul kosong. Tuai tanaman dahulu.', 'Basket is empty. Harvest first.', 'Keranjang kosong. Panen dulu.')); return; }
  const jum = bakul.reduce((s, x) => s + x.v, 0);
  let q; if (bakul.length >= 2) { const a = bakul.slice(0, -1).reduce((s, x) => s + x.v, 0), b = bakul[bakul.length - 1].v; q = q2('tambah', a, b); } else q = q2('tambah', jum, 0);
  const ok = await E.ui.tanya({ q, tajuk: t('Kira jumlah jualan', 'Add up the sale', 'Hitung total penjualan'), nota: t(`${bakul.length} hasil tuaian dalam bakul.`, `${bakul.length} harvests in the basket.`, `${bakul.length} hasil panen di keranjang.`) });
  if (E.dunia !== D) return;
  if (!ok) { E.ui.toast?.(t('Pembeli mahu jumlah yang betul. Cuba lagi.', 'The buyer wants the right total. Try again.', 'Pembeli mau total yang benar. Coba lagi.'), 'amaran'); return; }
  const dapat = Math.round(jum / 5); K().wang += dapat; K().jual += dapat; K().bakul = []; simpan(); bunyi('beli'); tambahCbux(Math.max(1, Math.round(dapat / 20)));
  E.ui.toast?.(t(`Terjual! +${dapat} syiling kebun`, `Sold! +${dapat} garden coins`, `Terjual! +${dapat} koin kebun`), 'emas');
  if (K().jual >= 500) beriLencana('kebun'); lukisPanel();
}
function kedaiAlat() {
  const A = [['penyiram', t('Penyiram Automatik', 'Auto Sprinkler', 'Penyiram Otomatis'), t('Tanaman tumbuh 1.5× lebih cepat.', 'Crops grow 1.5× faster.', 'Tanaman tumbuh 1,5× lebih cepat.')], ['bakul', t('Baja Ajaib', 'Magic Fertiliser', 'Pupuk Ajaib'), t('Semua tanaman sekarang terus separuh masak.', 'All current crops jump to half grown.', 'Semua tanaman sekarang langsung setengah matang.')]];
  E.ui.modal?.(`<div class="mt"><h3>${t('Gerai Alat', 'Gear Stall', 'Kios Alat')}</h3><button class="xbtn" data-tt>${ic('close', 18)}</button></div><p class="fine">${t('Syiling kebun', 'Garden coins', 'Koin kebun')}: <b>${nombor(K().wang)}</b></p>
    <div class="rk-l">${A.map(([k, n, d]) => { const ada = k === 'penyiram' && K().alat.includes(k); return `<div class="rk-b"><span class="kd-g">${ic(k === 'penyiram' ? 'drop' : 'sparkle', 30)}</span><div><b>${esc(n)}</b><small>${esc(d)}</small></div><button class="${ada ? 'bbtn' : 'gbtn'}" data-a="${k}" ${ada ? 'disabled' : ''}>${ada ? t('Dimiliki', 'Owned', 'Dimiliki') : hargaAlat[k]}</button></div>`; }).join('')}</div>`,
  (M, tutup) => {
    M.querySelector('[data-tt]').onclick = tutup;
    M.querySelectorAll('[data-a]').forEach((b) => { b.onclick = () => {
      const k = b.dataset.a; if (K().wang < hargaAlat[k]) { bunyi('salah'); return; }
      K().wang -= hargaAlat[k];
      if (k === 'penyiram') K().alat.push(k); else K().petak.forEach((p) => { if (p && p.jenis) p.bonus = Math.max(p.bonus || 0, 0.5); });
      simpan(); bunyi('beli'); tutup(); segarTumbuhan(); lukisPanel(); E.ui.toast?.(t('Dibeli!', 'Bought!', 'Dibeli!'), 'ok');
    }; });
  });
}
function lukisPanel() {
  const b = K().benih, list = Object.keys(BENIH).filter((k) => b[k] > 0);
  const p = E.ui.panel?.(`<div class="h-misi">${ic('coin', 14)}<b>${nombor(K().wang)}</b> ${t('syiling kebun', 'garden coins', 'koin kebun')} · ${ic('bag', 14)} ${(K().bakul || []).length} ${t('dalam bakul', 'in basket', 'di keranjang')}${hujan > 0 ? ' · ' + ic('drop', 14) + t('Hujan!', 'Rain!', 'Hujan!') : ''}</div>
    <div class="hb">${list.length ? list.map((k) => `<button class="${k === pilihBenih ? 'on' : ''}" data-bn="${k}" title="${esc(tx(BENIH[k].n))}"><span style="width:24px;height:24px;border-radius:6px;background:${BENIH[k].w}"></span><small>${b[k]}</small></button>`).join('') : `<span class="fine" style="padding:8px">${t('Tiada benih', 'No seeds', 'Tidak ada benih')}</span>`}</div>`);
  p?.querySelectorAll('[data-bn]').forEach((x) => { x.onpointerdown = (e) => { e.preventDefault(); pilihBenih = x.dataset.bn; bunyi('tap'); lukisPanel(); }; });
}
function kemas(dt) {
  const P = E.P; if (!P || P.mati) return;
  tikPapan -= dt; if (tikPapan <= 0) { tikPapan = 0.5; segarTumbuhan(); }
  // hujan: tanaman cepat + mutasi basah
  tHujan -= dt; if (tHujan <= 0 && hujan <= 0) { hujan = 25; E.ui.toast?.(t('Hujan turun! Tanaman tumbuh cepat dan boleh jadi basah (×1.5).', 'Rain! Crops grow faster and may get wet (×1.5).', 'Hujan turun! Tanaman tumbuh cepat dan bisa jadi basah (×1,5).'), 'emas'); lukisPanel(); }
  if (hujan > 0) { hujan -= dt; K().petak.forEach((p) => { if (p && p.jenis) { p.bonus = (p.bonus || 0) + dt / BENIH[p.jenis].masa; if (Math.random() < dt * 0.02) p.basah = true; } }); if (hujan <= 0) { tHujan = 70 + Math.random() * 50; lukisPanel(); simpan(); } }
  for (const tm of tumbuhan) if (tm?.g.children[0]?.userData.bintang) tm.g.children.forEach((c) => { if (c.userData.bintang) c.userData.bintang.rotation.y += dt * 2; });
  if (papanWang.userData.n !== K().wang) { papanWang.userData.n = K().wang; tukarTeks(papanWang.userData.tx, [{ t: t('Kebun ', 'Garden of ', 'Kebun ') + S.nama + ' · ' + nombor(K().wang), c: '#d9b25f' }]); }
  // aksi
  const pk = dekatPetak();
  if (pk) {
    const p = K().petak[pk.i];
    if (!pk.buka) aturAksi(t('Buka ', 'Unlock ', 'Buka ') + hargaPetak(pk.i), () => bukaPetak(pk));
    else if (!p || !p.jenis) aturAksi(t('Tanam ', 'Plant ', 'Tanam ') + tx(BENIH[pilihBenih]?.n || BENIH.lobak.n), () => tanam(pk));
    else if (kemajuan(p) >= 1) aturAksi(t('Tuai', 'Harvest', 'Panen'), () => tuai(pk));
    else aturAksi(Math.round(kemajuan(p) * 100) + '%', () => {});
  } else if (dekat(-22, 28)) aturAksi(t('Beli benih', 'Buy seeds', 'Beli benih'), kedaiBenih);
  else if (dekat(22, 28)) aturAksi(t('Jual hasil', 'Sell harvest', 'Jual hasil'), jual);
  else if (dekat(0, 48)) aturAksi(t('Alat', 'Gear', 'Alat'), kedaiAlat);
  else aturAksi(null);
}
export const KEBUN = {
  id: 'kebun', tema: 'tycoon', pratonton: { p: [40, 36, 46], t: [0, 2, -6] },
  bina, kemas,
  mula() {
    const p = K(); if (!p.petak.length) p.petak = Array(KOL * BAR).fill(null);
    if (!Object.values(p.benih).some((v) => v > 0) && !p.petak.some((x) => x) && p.wang < 4) p.benih.lobak = 2;
    lukisPanel(); E.ui.banner?.(t('Kebun Ajaib', 'Magic Garden', 'Kebun Ajaib'));
    setTimeout(() => E.ui.toast?.(t('Berdiri di petak untuk menanam. Tanaman terus tumbuh walaupun anda keluar.', 'Stand on a plot to plant. Crops keep growing even when you leave.', 'Berdiri di petak untuk menanam. Tanaman terus tumbuh walau kamu keluar.')), 900);
  },
  kekunci(e) { if (e.code === 'KeyF' && aksi) aksi.fn(); },
  statistik() { return [{ k: t('Syiling', 'Coins', 'Koin'), v: nombor(K().wang) }, { k: t('Petak', 'Plots', 'Petak'), v: K().buka }]; },
  statistikBot(b) { return [nombor(b.nama.length * 37), b.nama.length % 6 + 4]; },
  keluar() { E.ui.butangAksi?.(null); E.ui.panel?.(''); simpan(); },
  uji: { petak: () => petak, data: () => K(), tanam: (i) => tanam(petak[i]), tuai: (i) => tuai(petak[i]), masakkan: () => { K().petak.forEach((p) => { if (p) p.bonus = 1; }); segarTumbuhan(); }, jual, kedaiBenih }
};
