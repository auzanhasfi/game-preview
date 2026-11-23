/* Turbo Clawd: antarmuka — teks dua bahasa, layar, cerita, toast, peta mini, kartu arena & garasi */
import { SET, simpan, t, MOBIL, ARENA, NAMA_TOKOH } from './01-data.js';
import { ic, potret, siluetMobil } from './00-ikon.js';
import { Bunyi } from './03-bunyi.js';

export const $ = (id) => document.getElementById(id);

export function isiIkon(root = document) { root.querySelectorAll('[data-ic]').forEach((el) => { el.innerHTML = ic(el.dataset.ic, 22); }); }
export function terapkanTeks() {
  document.documentElement.lang = SET.bhs === 'ms' ? 'ms' : 'id';
  document.querySelectorAll('[data-t]').forEach((el) => { const v = t(el.dataset.t); if (typeof v === 'string') el.textContent = v; });
  $('bBahasa').textContent = SET.bhs === 'ms' ? 'Bahasa Melayu' : 'Bahasa Indonesia';
  $('bSuara').innerHTML = ic(SET.suara ? 'sound' : 'mute', 18);
}

let layarAktif = null;
export function tampil(id) { document.querySelectorAll('.layar.aktif').forEach((l) => l.classList.remove('aktif')); if (id) $(id).classList.add('aktif'); layarAktif = id; }
export const aktif = () => layarAktif;

/* ===== cerita ===== */
let antre = [], selesaiCb = null, ketik = null, idxB = 0;
export function cerita(judul, baris, cb) {
  if (!baris || !baris.length) { cb && cb(); return; }
  antre = baris; idxB = 0; selesaiCb = cb; $('ceritaJudul').textContent = judul || '';
  tampil('cerita'); tulisBaris();
}
function tulisBaris() {
  const [siapa, teks] = antre[idxB];
  $('ceritaPotret').innerHTML = potret(siapa);
  $('ceritaNama').textContent = NAMA_TOKOH[siapa] || '';
  const el = $('ceritaIsi'); el.textContent = '';
  clearInterval(ketik); let n = 0;
  ketik = setInterval(() => { n += 2; el.textContent = teks.slice(0, n); if (n >= teks.length) { clearInterval(ketik); ketik = null; } }, 18);
}
export function lanjutCerita() {
  Bunyi.sfx('klik');
  if (ketik) { clearInterval(ketik); ketik = null; $('ceritaIsi').textContent = antre[idxB][1]; return; }
  idxB++;
  if (idxB >= antre.length) { const cb = selesaiCb; selesaiCb = null; cb && cb(); } else tulisBaris();
}
export function lewatiCerita() { clearInterval(ketik); ketik = null; const cb = selesaiCb; selesaiCb = null; cb && cb(); }

/* ===== toast ===== */
export function toast(teks, kelas = '', kecil = false) {
  const el = document.createElement('div'); el.className = 'tst ' + kelas + (kecil ? ' kecil' : ''); el.textContent = teks;
  const box = $('toast'); box.appendChild(el); while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => el.remove(), 1450);
}

/* ===== peta mini ===== */
let petaBg = null, petaInfo = null;
export function siapkanPeta(trek, gerbang) {
  const c = $('peta'), W = c.width, H = c.height;
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (let i = 0; i < trek.N; i++) { const x = trek.P[i * 3], z = trek.P[i * 3 + 2]; x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  const sk = Math.min((W - 22) / (x1 - x0), (H - 22) / (z1 - z0)), ox = (W - (x1 - x0) * sk) / 2, oz = (H - (z1 - z0) * sk) / 2;
  petaInfo = { map: (x, z) => [ox + (x - x0) * sk, oz + (z - z0) * sk] };
  petaBg = document.createElement('canvas'); petaBg.width = W; petaBg.height = H;
  const g = petaBg.getContext('2d');
  g.lineCap = g.lineJoin = 'round';
  for (const [lw, col] of [[8, 'rgba(0,0,0,0.35)'], [5, '#ff7a1a']]) {
    g.beginPath(); g.lineWidth = lw; g.strokeStyle = col;
    for (let i = 0; i <= trek.N; i += 4) { const j = i % trek.N; const [a, b] = petaInfo.map(trek.P[j * 3], trek.P[j * 3 + 2]); i ? g.lineTo(a, b) : g.moveTo(a, b); }
    g.stroke();
  }
  for (const gb of gerbang) { const i = trek.idx(gb.s); const [a, b] = petaInfo.map(trek.P[i * 3], trek.P[i * 3 + 2]); g.fillStyle = '#ffd23a'; g.fillRect(a - 3, b - 3, 6, 6); }
  const i0 = 0; const [a, b] = petaInfo.map(trek.P[i0], trek.P[i0 + 2]); g.fillStyle = '#fff'; g.fillRect(a - 4, b - 1.5, 8, 3);
}
export function gambarPeta(pembalap, pemain, trek) {
  if (!petaBg) return;
  const c = $('peta'), g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height); g.drawImage(petaBg, 0, 0);
  for (const r of pembalap) {
    if (r === pemain) continue;
    const i = trek.idx(r.s); const [a, b] = petaInfo.map(trek.P[i * 3], trek.P[i * 3 + 2]);
    g.fillStyle = r.warna; g.beginPath(); g.arc(a, b, 4, 0, 7); g.fill();
  }
  const i = trek.idx(pemain.s); const [a, b] = petaInfo.map(trek.P[i * 3], trek.P[i * 3 + 2]);
  g.fillStyle = '#fff'; g.strokeStyle = '#14182b'; g.lineWidth = 2; g.beginPath(); g.arc(a, b, 6, 0, 7); g.fill(); g.stroke();
}

/* ===== kartu arena ===== */
const WARNA_ARENA = { kamar: ['#c98a52', '#bfe3ff'], dapur: ['#2a7f8f', '#fde9d2'], kebun: ['#5cb84a', '#8fd3ff'], benteng: ['#2c2747', '#ffd23a'] };
function bintangHtml(n, sz = 16) { let h = ''; for (let i = 0; i < 3; i++) h += `<span class="${i < n ? '' : 'mati'}">${ic('star', sz)}</span>`; return h; }
export function renderArena(onPilih) {
  const box = $('daftarArena'); box.innerHTML = '';
  ARENA.forEach((a, i) => {
    const kunci = i + 1 > SET.buka, [c1, c2] = WARNA_ARENA[a.tema];
    const el = document.createElement('button'); el.className = 'kartu' + (kunci ? ' kunci' : ''); el.dataset.uji = 'arena-' + i;
    el.innerHTML = `<div class="kartu-gbr" style="background:linear-gradient(135deg,${c1},${c2})">${petaKecil(a)}<span class="kartu-nomor">ARENA ${i + 1}</span>${kunci ? `<div class="kunci-ikon">${ic('lock', 30)}</div>` : ''}</div>
      <div class="kartu-isi"><b>${a.nama[SET.bhs]}</b><small>${a.tempat[SET.bhs]} · ${a.putaran} ${t('putaran').toLowerCase()}</small><div class="kartu-bintang">${bintangHtml(SET.bintang[i])}</div>${kunci ? `<small>${t('terkunci')}</small>` : ''}</div>`;
    el.onclick = () => { if (kunci) { Bunyi.sfx('salah'); return; } Bunyi.sfx('klik'); onPilih(i); };
    box.appendChild(el);
  });
}
function petaKecil(a) {
  const xs = a.titik.map((p) => p[0]), zs = a.titik.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  const sk = Math.min(160 / (x1 - x0), 90 / (z1 - z0));
  const d = a.titik.map((p, i) => `${i ? 'L' : 'M'}${(10 + (p[0] - x0) * sk).toFixed(1)} ${(10 + (p[1] - z0) * sk).toFixed(1)}`).join('') + 'Z';
  return `<svg viewBox="0 0 180 110" width="180" height="110"><path d="${d}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="9" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#ff7a1a" stroke-width="5" stroke-linejoin="round"/></svg>`;
}

/* ===== garasi ===== */
export function renderGarasi() {
  const box = $('daftarMobil'); box.innerHTML = '';
  const maks = { v: 72, a: 1.1, g: 19, b: 1.4 };
  MOBIL.forEach((m, i) => {
    const el = document.createElement('button'); el.className = 'kartu' + (SET.mobil === i ? ' pilih' : ''); el.dataset.uji = 'mobil-' + i;
    const bar = (k, lbl) => `<span>${t(lbl)}</span><i style="--w:${Math.round(m[k] / maks[k] * 100)}%"></i>`;
    el.innerHTML = `<div class="kartu-gbr" style="background:radial-gradient(circle at 50% 70%, ${m.col}55, transparent 70%)">${siluetMobil(m.col, m.c2)}</div>
      <div class="kartu-isi"><b>${m.nama}</b><small>${m.ket[SET.bhs]}</small><div class="stat">${bar('v', 'kecepatan')}${bar('a', 'akselerasi')}${bar('g', 'kendali')}${bar('b', 'bobot')}</div>
      <small style="color:${SET.mobil === i ? 'var(--oranye)' : 'var(--abu)'};font-weight:700">${SET.mobil === i ? t('dipakai') : t('pilih')}</small></div>`;
    el.onclick = () => { SET.mobil = i; simpan(); Bunyi.sfx('power'); renderGarasi(); };
    box.appendChild(el);
  });
}

/* ===== pengaturan & bantuan ===== */
export function renderAtur(ulang) {
  const seg = (id, opsi, nilai, set) => {
    const box = $(id); box.innerHTML = '';
    for (const [v, lbl] of opsi) { const b = document.createElement('button'); b.textContent = lbl; b.className = v === nilai ? 'on' : ''; b.dataset.uji = id + '-' + v; b.onclick = () => { set(v); simpan(); Bunyi.sfx('klik'); ulang(); }; box.appendChild(b); }
  };
  seg('segLevel', [['mudah', t('mudah')], ['sedang', t('sedang')], ['sulit', t('sulit')]], SET.level, (v) => { SET.level = v; });
  $('ketLevel').textContent = t('levelKet')[SET.level];
  seg('segBahasa', [['id', 'Indonesia'], ['ms', 'Melayu']], SET.bhs, (v) => { SET.bhs = v; });
  seg('segSuara', [[true, t('nyala')], [false, t('mati')]], SET.suara, (v) => { SET.suara = v; Bunyi.set(v); });
}
export function renderBantuan() {
  $('isiBantuan').innerHTML = t('bantuanIsi').map((s) => `<li>${s}</li>`).join('');
  $('daftarItem').innerHTML = ['roket', 'bom', 'dorong', 'nitro', 'perisai'].map((k) => `<div><span class="ii">${ic(k, 22)}</span><span><b>${t('item')[k]}</b><small>${t('itemKet')[k]}</small></span></div>`).join('');
}
export { bintangHtml };
