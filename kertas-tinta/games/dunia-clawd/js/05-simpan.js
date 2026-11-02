/* Dunia Clawd: keadaan pemain, simpanan localStorage, kemajuan, lencana, katalog */
import { t, tx, setBahasa } from './01-teks.js';

const KUNCI = 'dunia-clawd-v1';
export const PRESET = {
  pahlawan: { nama: 'Pahlawan', kulit: '#d8714f', baju: '#2c3e6b', seluar: '#2e2620', topi: 'tiada', muka: 'clawd', belakang: 'tiada' },
  perisai: { nama: 'Perisai', kulit: '#a3b86c', baju: '#6f8440', seluar: '#3a4a2a', topi: 'topiKeledar', muka: 'clawd', belakang: 'tiada' },
  pemanah: { nama: 'Pemanah', kulit: '#f2c14e', baju: '#3f7a4f', seluar: '#6d4a2a', topi: 'kupluk', muka: 'clawd', belakang: 'tiada' },
  sihir: { nama: 'Sihir', kulit: '#7f9fd9', baju: '#45639e', seluar: '#2c3e6b', topi: 'topiSihir', muka: 'clawd', belakang: 'jubah' },
  bayang: { nama: 'Bayang', kulit: '#8a78b8', baju: '#2e2640', seluar: '#1c1828', topi: 'tiada', muka: 'clawd', belakang: 'jubah' },
  penyembuh: { nama: 'Penyembuh', kulit: '#f19bb4', baju: '#ffffff', seluar: '#c0607e', topi: 'halo', muka: 'senyum', belakang: 'tiada' },
  nini: { nama: 'Nini', kulit: '#f6e2a8', baju: '#f19bb4', seluar: '#ffffff', topi: 'telinga', muka: 'senyum', belakang: 'tiada' }
};
export const PRESET_ID = Object.keys(PRESET);

function kosong() {
  return {
    nama: '', bahasa: 'ms', diff: 'mudah', topik: 'campur', cbux: 40, bunyi: true, muzik: true, sens: 1, grafik: 'auto',
    avatar: { ...PRESET.pahlawan }, milik: [], lencana: [], suka: {}, terakhir: [], masuk: 0, oof: 0,
    prog: { topik: { tambah: [0, 0], kurang: [0, 0], kali: [0, 0], bagi: [0, 0] }, salah: [], betul: 0, jumlah: 0, kombo: 0, komboTerbaik: 0 },
    x: { obby: { stage: 0, menang: 0 }, menara: { menang: 0, terbaik: 0 }, tycoon: { wang: 10, simpan: 0, beli: [] }, sim: { bintang: 0, wang: 0, kuasa: 0, beg: 0, laju: 0, zon: 0, pet: [], lahir: 0 } }
  };
}
export const S = kosong();
function gabung(sasar, sumber) { for (const k in sumber) { const v = sumber[k]; if (v && typeof v === 'object' && !Array.isArray(v) && sasar[k] && typeof sasar[k] === 'object') gabung(sasar[k], v); else sasar[k] = v; } }
export function muat() { try { const r = JSON.parse(localStorage.getItem(KUNCI) || 'null'); if (r) gabung(S, r); } catch (e) {} setBahasa(S.bahasa); }
let tTunda = 0;
export function simpan(segera) { clearTimeout(tTunda); const f = () => { try { localStorage.setItem(KUNCI, JSON.stringify(S)); } catch (e) {} }; if (segera) f(); else tTunda = setTimeout(f, 250); }
export function padam() { try { localStorage.removeItem(KUNCI); } catch (e) {} }

/* pendengar untuk HUD (CBux, lencana) */
const pendengar = {};
export function dengar(n, f) { (pendengar[n] ||= []).push(f); }
export function isyarat(n, v) { (pendengar[n] || []).forEach((f) => f(v)); }

export function tambahCbux(n) { if (!n) return; S.cbux = Math.max(0, Math.round(S.cbux + n)); simpan(); isyarat('cbux', n); }

/* kemajuan soal */
export function rekod(q, betul) {
  const p = S.prog, tp = p.topik[q.ty]; tp[1]++; p.jumlah++;
  if (betul) { tp[0]++; p.betul++; p.kombo++; p.komboTerbaik = Math.max(p.komboTerbaik, p.kombo); }
  else { p.kombo = 0; const k = q.a + q.ty + q.b; p.salah = [{ ty: q.ty, a: q.a, b: q.b, c: q.c, miss: q.miss, ans: q.ans }, ...p.salah.filter((m) => m.a + m.ty + m.b !== k)].slice(0, 8); }
  if (betul && p.betul >= 10) beriLencana('j10'); if (betul && p.betul >= 50) beriLencana('j50'); if (betul && p.betul >= 100) beriLencana('j100');
  if (p.kombo >= 5) beriLencana('k5'); if (p.kombo >= 10) beriLencana('k10');
  simpan();
}

export const LENCANA = {
  mula: { n: ['Selamat Datang', 'Welcome', 'Selamat Datang'], d: ['Masuk Dunia Clawd buat kali pertama.', 'Joined Dunia Clawd for the first time.', 'Masuk Dunia Clawd pertama kali.'], i: 'flag', cb: 5 },
  obby1: { n: ['Peringkat 5', 'Stage 5', 'Tahap 5'], d: ['Sampai peringkat 5 Obby Angka.', 'Reached stage 5 of Number Obby.', 'Sampai tahap 5 Obby Angka.'], i: 'stairs', cb: 10 },
  obby: { n: ['Juara Obby', 'Obby Champion', 'Juara Obby'], d: ['Tamatkan 15 peringkat Obby Angka.', 'Finish all 15 stages of Number Obby.', 'Tamatkan 15 tahap Obby Angka.'], i: 'trophy', cb: 60 },
  menara: { n: ['Puncak Menara', 'Tower Summit', 'Puncak Menara'], d: ['Sampai puncak Menara Lava.', 'Reach the top of Lava Tower.', 'Sampai puncak Menara Lava.'], i: 'castle', cb: 60 },
  tycoon1: { n: ['Tauke Muda', 'Young Boss', 'Bos Muda'], d: ['Beli 5 barang dalam Tycoon Kedai.', 'Buy 5 things in Shop Tycoon.', 'Beli 5 barang di Tycoon Toko.'], i: 'store', cb: 15 },
  tycoon: { n: ['Tauke Besar', 'Big Boss', 'Bos Besar'], d: ['Siapkan seluruh kedai hingga bendera.', 'Complete the whole shop up to the flag.', 'Selesaikan seluruh toko sampai bendera.'], i: 'crown', cb: 60 },
  telur: { n: ['Pembela Haiwan', 'Pet Keeper', 'Pemelihara Hewan'], d: ['Tetaskan telur pertama.', 'Hatch your first egg.', 'Tetaskan telur pertama.'], i: 'egg', cb: 10 },
  lahir: { n: ['Lahir Semula', 'Rebirth', 'Lahir Kembali'], d: ['Buat lahir semula dalam Simulator Bintang.', 'Rebirth in Star Simulator.', 'Lahir kembali di Simulator Bintang.'], i: 'refresh', cb: 60 },
  j10: { n: ['10 Betul', '10 Correct', '10 Benar'], d: ['Jawab 10 soalan dengan betul.', 'Answer 10 questions correctly.', 'Jawab 10 soal dengan benar.'], i: 'check', cb: 10 },
  j50: { n: ['50 Betul', '50 Correct', '50 Benar'], d: ['Jawab 50 soalan dengan betul.', 'Answer 50 questions correctly.', 'Jawab 50 soal dengan benar.'], i: 'star', cb: 25 },
  j100: { n: ['100 Betul', '100 Correct', '100 Benar'], d: ['Jawab 100 soalan dengan betul.', 'Answer 100 questions correctly.', 'Jawab 100 soal dengan benar.'], i: 'gem', cb: 50 },
  k5: { n: ['Kombo 5', 'Combo 5', 'Kombo 5'], d: ['Betul 5 kali berturut-turut.', 'Get 5 right in a row.', 'Benar 5 kali berturut-turut.'], i: 'zap', cb: 10 },
  k10: { n: ['Kombo 10', 'Combo 10', 'Kombo 10'], d: ['Betul 10 kali berturut-turut.', 'Get 10 right in a row.', 'Benar 10 kali berturut-turut.'], i: 'flame', cb: 30 },
  gaya: { n: ['Bergaya', 'Stylish', 'Bergaya'], d: ['Beli barang pertama di Kedai.', 'Buy your first item in the Shop.', 'Beli barang pertama di Toko.'], i: 'shirt', cb: 5 },
  oof: { n: ['Tak Putus Asa', 'Never Give Up', 'Pantang Menyerah'], d: ['Jatuh 25 kali dan terus mencuba.', 'Fall 25 times and keep trying.', 'Jatuh 25 kali dan terus mencoba.'], i: 'heart', cb: 10 }
};
export function beriLencana(id) {
  if (S.lencana.includes(id) || !LENCANA[id]) return false;
  S.lencana.push(id); simpan(); tambahCbux(LENCANA[id].cb); isyarat('lencana', id); return true;
}

/* katalog kedai: harga CBux. jenis = kunci pada avatar, atau 'alat' */
export const KATALOG = [
  { id: 'kupluk', jenis: 'topi', n: ['Kupluk', 'Beanie', 'Kupluk'], h: 0 },
  { id: 'topiKeledar', jenis: 'topi', n: ['Topi Besi', 'Helmet', 'Helm'], h: 0 },
  { id: 'topiSihir', jenis: 'topi', n: ['Topi Sihir', 'Wizard Hat', 'Topi Sihir'], h: 0 },
  { id: 'halo', jenis: 'topi', n: ['Lingkaran Cahaya', 'Halo', 'Lingkaran Cahaya'], h: 0 },
  { id: 'telinga', jenis: 'topi', n: ['Telinga Kucing', 'Cat Ears', 'Telinga Kucing'], h: 0 },
  { id: 'mahkota', jenis: 'topi', n: ['Mahkota', 'Crown', 'Mahkota'], h: 150 },
  { id: 'sarjana', jenis: 'topi', n: ['Topi Graduan', 'Graduation Cap', 'Topi Wisuda'], h: 80 },
  { id: 'kon', jenis: 'topi', n: ['Kon Jalan', 'Traffic Cone', 'Kerucut Jalan'], h: 40 },
  { id: 'songkok', jenis: 'topi', n: ['Songkok', 'Songkok', 'Peci'], h: 50 },
  { id: 'clawd', jenis: 'muka', n: ['Mata Clawd', 'Clawd Eyes', 'Mata Clawd'], h: 0 },
  { id: 'senyum', jenis: 'muka', n: ['Senyum', 'Smile', 'Senyum'], h: 0 },
  { id: 'kaca', jenis: 'muka', n: ['Cermin Mata', 'Sunglasses', 'Kacamata'], h: 40 },
  { id: 'kagum', jenis: 'muka', n: ['Kagum', 'Wow', 'Kagum'], h: 30 },
  { id: 'jubah', jenis: 'belakang', n: ['Jubah', 'Cape', 'Jubah'], h: 0 },
  { id: 'sayap', jenis: 'belakang', n: ['Sayap', 'Wings', 'Sayap'], h: 120 },
  { id: 'beg', jenis: 'belakang', n: ['Beg Sekolah', 'School Bag', 'Tas Sekolah'], h: 35 },
  { id: 'coilLaju', jenis: 'alat', n: ['Gegelung Laju', 'Speed Coil', 'Kumparan Cepat'], d: ['Lari 1.5× lebih laju.', 'Run 1.5× faster.', 'Lari 1,5× lebih cepat.'], h: 90, ikon: 'wind' },
  { id: 'coilLompat', jenis: 'alat', n: ['Gegelung Lompat', 'Jump Coil', 'Kumparan Lompat'], d: ['Lompat lebih tinggi.', 'Jump higher.', 'Lompat lebih tinggi.'], h: 90, ikon: 'stairs' }
];
export const WARNA = ['#d8714f', '#f2c14e', '#a3b86c', '#7f9fd9', '#8a78b8', '#f19bb4', '#f6e2a8', '#2c3e6b', '#2e2620', '#ffffff', '#6fa8dc', '#3f7a4f', '#c0392b', '#6d4a2a', '#9aa5b8', '#1c1828'];
export function milik(id) { const b = KATALOG.find((k) => k.id === id); return !b || b.h === 0 || S.milik.includes(id); }
export const namaBarang = (id) => { const b = KATALOG.find((k) => k.id === id); return b ? tx(b.n) : t('Tiada', 'None', 'Tidak ada'); };
