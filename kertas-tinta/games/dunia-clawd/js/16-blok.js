/* Dunia Clawd v2: empat dunia blok (sandbox voxel) di atas enjin yang sama.
   kreatif  – bina bebas, terbang, 40+ blok, buka blok khas dengan soalan, pilih jenis dunia, simpan
   bertahan – gali, rakit (setiap resipi = soalan darab/bahagi/tolak), siang-malam, Comot malam, 11 misi
   gua      – 3 minit dalam gua gelap, cari permata (soalan), papan skor
   malam    – 10 malam di hutan: jaga unggun api, kumpul kayu, selamatkan 4 anak Clawd */
import * as THREE from 'three';
import { E, Bot, bunuhPemain, cederakan, rawat, aturLangit, aturCahaya, buatPet } from './08-enjin.js';
import { S, simpan, tambahCbux, beriLencana, isyarat } from './05-simpan.js';
import { t, tx, nombor } from './01-teks.js';
import { ic } from './02-ikon.js';
import { pilihan } from './03-soal.js';
import { bunyi } from './04-bunyi.js';
import { B, BLOK, BARANG, Grid, jana, JENIS_DUNIA, Penyusun, sambungVox, ddaa, ikon, namaId, pepejal, rng, warnaBlok, bahanTangan } from './15-blok-teras.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const HOT_KREATIF = [1, 2, 3, 7, 8, 9, 5, 16, 31];
const RESEPI = [
  { id: 7, n: 4, perlu: { 5: 1 }, pukal: true },
  { id: 19, n: 1, perlu: { 7: 4 } },
  { id: 16, n: 2, perlu: { 100: 1, 7: 1 } },
  { id: 23, n: 1, perlu: { 3: 2 }, pukal: true },
  { id: 8, n: 1, perlu: { 4: 2 }, pukal: true, meja: true },
  { id: 110, n: 1, perlu: { 7: 3 }, meja: true },
  { id: 120, n: 1, perlu: { 7: 2 }, meja: true },
  { id: 111, n: 1, perlu: { 3: 3, 7: 2 }, meja: true },
  { id: 121, n: 1, perlu: { 3: 2, 7: 1 }, meja: true },
  { id: 112, n: 1, perlu: { 101: 3, 7: 2 }, meja: true },
  { id: 122, n: 1, perlu: { 101: 2, 7: 1 }, meja: true },
  { id: 22, n: 1, perlu: { 5: 2, 100: 1 } },
  { id: 9, n: 1, perlu: { 2: 1, 3: 1 }, meja: true },
  { id: 15, n: 1, perlu: { 102: 2 }, meja: true }
];
const MISI = [
  { n: ['Gali 3 kayu balak', 'Chop 3 logs', 'Tebang 3 kayu'], ok: (k) => (k.gali?.[5] || 0) >= 3 },
  { n: ['Rakit papan', 'Craft planks', 'Rakit papan'], ok: (k) => (k.rakit?.[7] || 0) >= 1 },
  { n: ['Rakit & letak meja rakit', 'Craft & place a crafting table', 'Rakit & taruh meja rakit'], ok: (k) => (k.letak?.[19] || 0) >= 1 },
  { n: ['Rakit beliung kayu', 'Craft a wood pickaxe', 'Rakit beliung kayu'], ok: (k) => (k.rakit?.[110] || 0) >= 1 },
  { n: ['Gali 5 batu', 'Mine 5 stone', 'Gali 5 batu'], ok: (k) => (k.gali?.[3] || 0) >= 5 },
  { n: ['Rakit beliung batu', 'Craft a stone pickaxe', 'Rakit beliung batu'], ok: (k) => (k.rakit?.[111] || 0) >= 1 },
  { n: ['Lombong 3 bijih besi', 'Mine 3 iron ore', 'Tambang 3 bijih besi'], ok: (k) => (k.gali?.[13] || 0) >= 3 },
  { n: ['Rakit pedang besi', 'Craft an iron sword', 'Rakit pedang besi'], ok: (k) => (k.rakit?.[122] || 0) >= 1 },
  { n: ['Kalahkan 3 Comot', 'Defeat 3 Comots', 'Kalahkan 3 Comot'], ok: (k) => (k.bunuh || 0) >= 3 },
  { n: ['Temui permata', 'Find a gem', 'Temukan permata'], ok: (k) => (k.gali?.[14] || 0) >= 1 },
  { n: ['Bertahan 3 malam', 'Survive 3 nights', 'Bertahan 3 malam'], ok: () => S.x.blok.bertahan.malam >= 3 }
];

function soalan(ty, a, b) { const c = ty === 'kali' ? a * b : ty === 'bagi' ? a / b : ty === 'kurang' ? a - b : a + b; const q = { ty, a, b, c, miss: 0, lv: 3, ans: c }; q.opts = pilihan(q, 4); return q; }

/* ================= kilang mod ================= */
function buatMod(id, cfg) {
  let D, G, pen, sorot, tangan, st, hot, sel, guna = 'gali', retak = null, tSimpan = 0, mobs, serpih, fasa = 0, malamKini = false, lampuP, cahayaUnggun, unggun, anak, tamat, tMain, skor, kiraGua, beruba;
  const kreatif = !!cfg.kreatif;
  const simpanan = () => S.x.blok[id];

  function inv() { return kreatif ? null : simpanan().inv; }
  function ada(i) { return kreatif ? 99 : (inv()[i] || 0); }
  function tambahInv(i, n) {
    if (kreatif) return; const v = inv(); v[i] = (v[i] || 0) + n; if (v[i] <= 0) delete v[i];
    if (n > 0 && BLOK[i] && !hot.includes(i)) { const k = hot.findIndex((h) => !h || !ada(h)); if (k >= 0) hot[k] = i; }
    lukisPanel();
  }
  function alatTahap(jenis) { if (cfg.beliung && jenis === 'beliung') return cfg.beliung; let b = 0; for (const k in BARANG) if (BARANG[k].alat === jenis && ada(Number(k)) > 0) b = Math.max(b, BARANG[k].tahap); return b; }
  function kira(jenis, i, n = 1) { if (!st) return; const k = st.kira ||= {}; if (i === undefined) { k[jenis] = (k[jenis] || 0) + n; } else { (k[jenis] ||= {})[i] = ((k[jenis] ||= {})[i] || 0) + n; } semakMisi(); }

  /* ---------- bina dunia ---------- */
  function bina(d) {
    D = d; mobs = []; serpih = []; tamat = false; tMain = 0; skor = 0; kiraGua = { 14: 0, 13: 0, 12: 0 }; anak = []; beruba = false;
    st = simpanan();
    let seed = st?.seed || 0;
    if (!seed) { seed = 1 + Math.floor(Math.random() * 99999); if (st && (id === 'kreatif' || id === 'bertahan')) st.seed = seed; }
    if (id === 'gua' || id === 'malam') seed = 1 + Math.floor(Math.random() * 99999);
    if (d.pratonton) seed = cfg.seedPratonton || 4242;
    const jenis = typeof cfg.jenis === 'function' ? cfg.jenis() : cfg.jenis;
    G = new Grid(cfg.nx, cfg.ny, cfg.nx);
    const extra = jana(G, jenis, seed);
    if (st?.ubah?.length && !d.pratonton) for (let i = 0; i < st.ubah.length; i += 2) { G.d[st.ubah[i]] = st.ubah[i + 1]; G.ubah.set(st.ubah[i], st.ubah[i + 1]); }
    // titik mula: tiang darat dekat tengah
    let sx = cfg.nx >> 1, sz = cfg.nx >> 1;
    if (id !== 'gua') {
      outer: for (let r = 0; r < 20; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { const x = sx + dx, z = sz + dz, y = G.atas(x, z); if (y > 0 && G.get(x, y, z) !== 11 && G.get(x, y, z) !== 6 && G.get(x, y, z) !== 21) { sx = x; sz = z; break outer; } }
    }
    if (id === 'gua') {
      // permata pada dinding terdedah, dan pastikan lantai tengah
      const R = rng(seed + 1), tepi = extra || []; let n = 0;
      for (let k = 0; k < 4000 && n < 18; k++) { const p = tepi[Math.floor(R() * tepi.length)]; if (p && G.get(p[0], p[1], p[2]) === 3) { G.setMentah(p[0], p[1], p[2], 14); n++; } }
      for (let dz = -4; dz <= 4; dz++) for (let dx = -4; dx <= 4; dx++) { G.setMentah(sx + dx, 2, sz + dz, 23); for (let y = 3; y < 7; y++) G.setMentah(sx + dx, y, sz + dz, 0); }
      G.setMentah(sx + 4, 6, sz + 4, 16); G.setMentah(sx - 4, 6, sz - 4, 16); G.setMentah(sx + 4, 6, sz - 4, 16); G.setMentah(sx - 4, 6, sz + 4, 16);
    }
    if (id === 'malam') {
      // kawasan unggun lapang
      const y0 = G.atas(sx, sz);
      for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) { G.setMentah(sx + dx, y0, sz + dz, dx * dx + dz * dz < 5 ? 23 : 1); for (let y = y0 + 1; y < G.ny; y++) G.setMentah(sx + dx, y, sz + dz, 0); for (let y = y0 - 2; y < y0; y++) G.setMentah(sx + dx, y, sz + dz, 2); }
      G.setMentah(sx, y0 + 1, sz, 22);
      unggun = { x: sx, y: y0 + 1, z: sz, p: G.pusat(sx, y0 + 1, sz), bahan: 70, tahap: 0 };
      sx += 2;
    }
    const sy = id === 'gua' ? 2 : G.atas(sx, sz);
    d.spawn = { x: G.ox + (sx + 0.5) * B, y: (sy + 1) * B, z: G.oz + (sz + 0.5) * B, yaw: 0 };
    d.lantaiMati = -30; d.autoLompat = true;
    pen = new Penyusun(G, d.grup, E.bayang && !d.pratonton); pen.semua();
    d.vox = sambungVox(G);
    if (cfg.awan) d.awan(14, 300, 150, 200);
    d.ubah.push(() => pen.kemas(3));
    if (d.pratonton) return;
    // sorot blok
    sorot = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(B + 0.06, B + 0.06, B + 0.06)), new THREE.LineBasicMaterial({ color: '#111111', transparent: true, opacity: 0.7 }));
    sorot.visible = false; d.grup.add(sorot);
    // bot
    const nb = id === 'gua' ? 3 : id === 'malam' ? 2 : 4;
    for (let i = 0; i < nb; i++) { const b = new Bot(d, i * 3 + 1, { kawasan: { x: d.spawn.x, z: d.spawn.z, w: id === 'gua' ? 26 : 90, d: id === 'gua' ? 26 : 90 }, x: d.spawn.x + (i - 1.5) * 6, z: d.spawn.z + 8 }); b.statistik.skor = 0; d.bots.push(b); }
    // cahaya
    lampuP = [];
    if (id === 'gua') {
      const kepala = new THREE.PointLight('#ffe2b0', 60, 70, 1.2); d.grup.add(kepala); lampuP.push({ l: kepala, ikut: true });
      for (let k = 0; k < 4; k++) { const l = new THREE.PointLight('#ffd27a', 40, 60, 1.4); const s2 = [[4, 4], [-4, -4], [4, -4], [-4, 4]][k]; l.position.copy(G.pusat(sx + s2[0], 5.6, sz + s2[1])); d.grup.add(l); }
    }
    if (id === 'malam') {
      cahayaUnggun = new THREE.PointLight('#ff9a3c', 160, 70, 1.1); cahayaUnggun.position.copy(unggun.p).y += 3; d.grup.add(cahayaUnggun);
      // anak Clawd yang hilang di hutan
      const R = rng(seed + 9), W = ['#f19bb4', '#7f9fd9', '#a3b86c', '#f2c14e'];
      for (let k = 0; k < 4; k++) {
        const a = R() * Math.PI * 2, r = 70 + R() * 26, x = Math.max(4, Math.min(cfg.nx - 5, Math.round(unggun.x + Math.cos(a) * r / B))), z = Math.max(4, Math.min(cfg.nx - 5, Math.round(unggun.z + Math.sin(a) * r / B)));
        const y = G.atas(x, z); for (let yy = y + 1; yy < y + 4; yy++) G.set(x, yy, z, 0, false);
        const m = buatPet(W[k]); m.scale.setScalar(1.3); const p = G.pusat(x, y + 1, z); p.y = (y + 1) * B; m.position.copy(p); d.grup.add(m);
        const tg = d.papan([{ t: t('Tolong!', 'Help!', 'Tolong!'), c: '#1a1408' }], p.x, p.y + 5, p.z, 4, { w: 200, h: 70, bg: '#d9b25f', garis: null });
        anak.push({ m, tg, ikut: false, selamat: false, ofs: k });
      }
    }
  }

  /* ---------- permulaan ---------- */
  function mula() {
    st = simpanan();
    hot = kreatif ? (st.hot ? st.hot.slice() : HOT_KREATIF.slice()) : (st?.hot ? st.hot.slice() : Array(9).fill(0));
    if (id === 'gua' || id === 'malam') hot = Array(9).fill(0);
    if (!kreatif && st && !st.inv) st.inv = {};
    if (id === 'gua' || id === 'malam') { S.x.blok[id].inv = {}; }
    sel = 0; guna = 'gali'; E.ui.silang?.(true);
    E.P.lajuAsas = 16;
    pasangButang(); lukisPanel(); kemasTangan();
    if (id === 'kreatif') E.ui.banner?.(t('Kreatif · ', 'Creative · ', 'Kreatif · ') + tx(JENIS_DUNIA[S.x.blok.kreatif.jenis]?.n || JENIS_DUNIA.padang.n));
    if (id === 'bertahan') E.ui.banner?.(t('Bertahan · misi ', 'Survival · quest ', 'Bertahan · misi ') + (Math.min(MISI.length, st.misi + 1)) + '/' + MISI.length);
    if (id === 'gua') { tMain = 180; S.x.blok.gua.main++; E.ui.banner?.(t('Cari permata! 3:00', 'Find gems! 3:00', 'Cari permata! 3:00')); }
    if (id === 'malam') { E.ui.banner?.(t('Malam 1 / 10', 'Night 1 / 10', 'Malam 1 / 10')); fasa = 0.05; }
    if (id === 'bertahan') fasa = 0.08;
    const pesan = { kreatif: t('Klik kiri gali, klik kanan letak. Tekan F untuk terbang, B untuk beg blok.', 'Left click breaks, right click places. Press F to fly, B for the block bag.', 'Klik kiri gali, klik kanan taruh. Tekan F untuk terbang, B untuk tas blok.'), bertahan: t('Tebang pokok, rakit alat. Setiap resipi perlukan jawapan matematik. Malam membawa Comot!', 'Chop trees, craft tools. Every recipe needs a maths answer. Night brings Comots!', 'Tebang pohon, rakit alat. Setiap resep butuh jawaban matematika. Malam membawa Comot!'), gua: t('Gali dinding gua. Bijih permata biru = soalan bernilai 10 mata.', 'Dig the cave walls. Blue gem ore = a question worth 10 points.', 'Gali dinding gua. Bijih permata biru = soal bernilai 10 poin.'), malam: t('Tebang kayu dan bawa ke unggun. Api padam = Comot datang. Cari 4 anak Clawd yang hilang!', 'Chop wood and bring it to the fire. No fire = Comots come. Find the 4 lost little Clawds!', 'Tebang kayu dan bawa ke api unggun. Api padam = Comot datang. Cari 4 anak Clawd yang hilang!') }[id];
    setTimeout(() => E.ui.toast?.(pesan), 900);
  }

  /* ---------- HUD ---------- */
  function pasangButang() {
    const L = [];
    L.push({ id: 'guna', ikon: guna === 'gali' ? 'axe' : 'box', label: guna === 'gali' ? t('Gali', 'Break', 'Gali') : t('Letak', 'Place', 'Taruh'), fn: () => { guna = guna === 'gali' ? 'letak' : 'gali'; bunyi('tap'); pasangButang(); }, on: guna === 'letak' });
    L.push({ id: 'beg', ikon: 'bag', label: t('Beg', 'Bag', 'Tas'), fn: bukaBeg });
    if (kreatif) L.push({ id: 'terbang', ikon: 'wind', label: t('Terbang', 'Fly', 'Terbang'), fn: togolTerbang, on: E.P?.terbang });
    if (kreatif && E.P?.terbang) L.push({ id: 'turun', ikon: 'next', label: t('Turun', 'Down', 'Turun'), fn: (v) => { E.inp.turun = v; }, tahan: true });
    if (cfg.mob) L.push({ id: 'serang', ikon: 'sword', label: t('Serang', 'Attack', 'Serang'), fn: serang });
    L.push({ id: 'fp', ikon: 'target', label: t('Kamera', 'Camera', 'Kamera'), fn: () => { E.kam.fp = !E.kam.fp; bunyi('tap'); } });
    E.ui.butangSentuh?.(L);
  }
  function togolTerbang() { const P = E.P; P.terbang = !P.terbang; if (P.terbang) P.vel.y = 12; bunyi('pad'); E.ui.toast?.(P.terbang ? t('Terbang: Space naik, Shift turun', 'Flying: Space up, Shift down', 'Terbang: Space naik, Shift turun') : t('Mendarat', 'Landing', 'Mendarat')); pasangButang(); }
  function lukisPanel() {
    if (!hot) return;
    const misi = id === 'bertahan' && st.misi < MISI.length ? `<div class="h-misi">${ic('flag', 14)}<span>${t('Misi', 'Quest', 'Misi')} ${st.misi + 1}/${MISI.length}: <b>${esc(tx(MISI[st.misi].n))}</b></span></div>` : '';
    const p = E.ui.panel?.(`${misi}<div class="hb" role="toolbar" aria-label="hotbar">${hot.map((h, i) => { const n = h ? ada(h) : 0; return `<button class="${i === sel ? 'on' : ''}" data-hs="${i}" aria-label="${h ? esc(namaId(h)) : '–'}" title="${h ? esc(namaId(h)) : ''}"><i>${i + 1}</i>${h && n > 0 ? `<img alt="" src="${ikon(h)}">` : ''}${!kreatif && h && n > 0 ? `<small>${n}</small>` : ''}</button>`; }).join('')}</div>`);
    p?.querySelectorAll('[data-hs]').forEach((b) => { b.onpointerdown = (e) => { e.preventDefault(); pilihSlot(Number(b.dataset.hs)); }; });
  }
  function pilihSlot(i) { sel = i; guna = 'letak'; bunyi('tap'); lukisPanel(); kemasTangan(); pasangButang(); }
  function kemasTangan() {
    const P = E.P; if (!P) return; if (tangan) { tangan.parent?.remove(tangan); tangan = null; }
    const h = hot[sel]; if (!h || !ada(h) || !BLOK[h]) return;
    tangan = new THREE.Mesh(kotakTangan, bahanTangan(h)); tangan.position.set(0, -2.05, -0.35); tangan.castShadow = true; P.av.lenKa.add(tangan);
  }

  /* ---------- beg & rakit ---------- */
  function bukaBeg() {
    if (kreatif) return begKreatif();
    const v = inv(), barang = Object.keys(v).map(Number).filter((k) => v[k] > 0);
    const dekatMeja = adaDekat(19, 5);
    E.ui.modal?.(`<div class="mt"><h3>${t('Beg & Rakit', 'Bag & Crafting', 'Tas & Rakit')}</h3><button class="xbtn" data-tt aria-label="${t('Tutup', 'Close', 'Tutup')}">${ic('close', 18)}</button></div>
      <p class="fine">${t('Ketik barang untuk letak di hotbar slot ', 'Tap an item to put it in hotbar slot ', 'Ketuk barang untuk taruh di slot hotbar ')}${sel + 1}.</p>
      <div class="bg-g">${barang.length ? barang.map((k) => `<button data-b="${k}" title="${esc(namaId(k))}"><img alt="" src="${ikon(k)}"><small>${v[k]}</small></button>`).join('') : `<p class="dim">${t('Beg kosong. Gali blok dahulu.', 'Bag is empty. Break some blocks first.', 'Tas kosong. Gali blok dulu.')}</p>`}</div>
      <h3 style="font-size:18px;margin-top:6px">${t('Rakit', 'Craft', 'Rakit')} <small class="fine">${dekatMeja ? t('· dekat meja rakit', '· near crafting table', '· dekat meja rakit') : t('· resipi bertanda meja perlukan meja rakit berdekatan', '· recipes marked table need a crafting table nearby', '· resep bertanda meja perlu meja rakit di dekatmu')}</small></h3>
      <div class="rk-l">${RESEPI.map((r, i) => { const boleh = Object.entries(r.perlu).every(([k, n]) => ada(Number(k)) >= n) && (!r.meja || dekatMeja); return `<div class="rk-b"><img alt="" src="${ikon(r.id)}"><div><b>${esc(namaId(r.id))}${r.n > 1 ? ' ×' + r.n : ''}</b><small>${Object.entries(r.perlu).map(([k, n]) => `${n} ${esc(namaId(Number(k)))} (${ada(Number(k))})`).join(' + ')}${r.meja ? ' · ' + t('meja', 'table', 'meja') : ''}</small></div><button class="${boleh ? 'gbtn' : 'bbtn'}" data-r="${i}" ${boleh ? '' : 'disabled'} data-uji="rakit-${r.id}">${t('Rakit', 'Craft', 'Rakit')}</button></div>`; }).join('')}</div>`,
    (M, tutup) => {
      M.querySelector('[data-tt]').onclick = tutup;
      M.querySelectorAll('[data-b]').forEach((b) => { b.onclick = () => { const k = Number(b.dataset.b); if (!BLOK[k]) { bunyi('salah'); return; } const lama = hot.indexOf(k); if (lama >= 0) hot[lama] = hot[sel]; hot[sel] = k; bunyi('tap'); tutup(); lukisPanel(); kemasTangan(); }; });
      M.querySelectorAll('[data-r]').forEach((b) => { b.onclick = async () => { tutup(); await rakit(RESEPI[Number(b.dataset.r)]); bukaBeg(); }; });
    });
  }
  async function rakit(r) {
    const ents = Object.entries(r.perlu).map(([k, n]) => [Number(k), n]);
    let q, nota, kali = 1;
    if (r.pukal) {
      const [k, n] = ents[0]; kali = Math.min(9, Math.floor(ada(k) / n)); if (kali < 1) return;
      if (n === 1) { q = soalan('kali', kali, r.n); nota = t(`1 ${namaId(k)} jadi ${r.n} ${namaId(r.id)}. Kamu guna ${kali} ${namaId(k)}. Berapa ${namaId(r.id)}?`, `1 ${namaId(k)} makes ${r.n} ${namaId(r.id)}. You use ${kali} ${namaId(k)}. How many ${namaId(r.id)}?`, `1 ${namaId(k)} jadi ${r.n} ${namaId(r.id)}. Kamu pakai ${kali} ${namaId(k)}. Berapa ${namaId(r.id)}?`); }
      else { q = soalan('bagi', kali * n, n); nota = t(`Setiap ${namaId(r.id)} perlukan ${n} ${namaId(k)}. Kamu guna ${kali * n} ${namaId(k)}. Berapa ${namaId(r.id)}?`, `Each ${namaId(r.id)} needs ${n} ${namaId(k)}. You use ${kali * n} ${namaId(k)}. How many ${namaId(r.id)}?`, `Tiap ${namaId(r.id)} butuh ${n} ${namaId(k)}. Kamu pakai ${kali * n} ${namaId(k)}. Berapa ${namaId(r.id)}?`); }
    } else {
      const [k, n] = ents.reduce((a, b) => (b[1] > a[1] ? b : a)); const punya = ada(k);
      q = soalan('kurang', punya, n); nota = t(`Kamu ada ${punya} ${namaId(k)}. Resipi guna ${n}. Berapa yang tinggal?`, `You have ${punya} ${namaId(k)}. The recipe uses ${n}. How many are left?`, `Kamu punya ${punya} ${namaId(k)}. Resep memakai ${n}. Berapa sisanya?`);
    }
    const ok = await E.ui.tanya({ q, tajuk: t('Rakit ', 'Craft ', 'Rakit ') + namaId(r.id), nota });
    if (!ok) { E.ui.toast?.(t('Bahan masih selamat. Cuba lagi!', 'Your materials are safe. Try again!', 'Bahan masih aman. Coba lagi!'), 'amaran'); return; }
    for (const [k, n] of ents) tambahInv(k, -n * kali);
    tambahInv(r.id, r.n * kali); kira('rakit', r.id, kali); bunyi('beli');
    E.ui.toast?.(t('Dirakit: ', 'Crafted: ', 'Dirakit: ') + namaId(r.id) + ' ×' + r.n * kali, 'ok'); kemasTangan(); simpanKini();
  }
  function begKreatif() {
    const buka = S.x.blok.buka, senarai = BLOK.filter((b) => b && b.kreatif);
    E.ui.modal?.(`<div class="mt"><h3>${t('Semua Blok', 'All Blocks', 'Semua Blok')}</h3><button class="xbtn" data-tt aria-label="${t('Tutup', 'Close', 'Tutup')}">${ic('close', 18)}</button></div>
      <p class="fine">${t('Ketik blok untuk hotbar slot ', 'Tap a block for hotbar slot ', 'Ketuk blok untuk slot hotbar ')}${sel + 1}. ${t('Blok berkunci dibuka dengan satu soalan.', 'Locked blocks open with one question.', 'Blok terkunci dibuka dengan satu soal.')}</p>
      <div class="bg-g">${senarai.map((b) => { const k = b.kunci && !buka.includes(b.id); return `<button data-k="${b.id}" class="${k ? 'kunci' : ''}" aria-pressed="${hot[sel] === b.id}" title="${esc(namaId(b.id))}" data-uji="blok-${b.id}"><img alt="" src="${ikon(b.id)}"></button>`; }).join('')}</div>`,
    (M, tutup) => {
      M.querySelector('[data-tt]').onclick = tutup;
      M.querySelectorAll('[data-k]').forEach((b) => { b.onclick = async () => {
        const k = Number(b.dataset.k), d = BLOK[k];
        if (d.kunci && !buka.includes(k)) { tutup(); const ok = await E.ui.tanya({ tier: 1, tajuk: t('Buka blok: ', 'Unlock: ', 'Buka blok: ') + namaId(k) }); if (ok) { buka.push(k); simpan(); E.ui.toast?.(t('Blok dibuka!', 'Block unlocked!', 'Blok terbuka!'), 'emas'); } begKreatif(); return; }
        hot[sel] = k; st.hot = hot.slice(); simpan(); bunyi('tap'); tutup(); lukisPanel(); kemasTangan();
      }; });
    });
  }
  function adaDekat(bid, r) { const [px, py, pz] = G.sel(E.P.pos.x, E.P.pos.y + 1, E.P.pos.z); for (let y = py - 2; y <= py + 2; y++) for (let z = pz - r; z <= pz + r; z++) for (let x = px - r; x <= px + r; x++) if (G.get(x, y, z) === bid) return true; return false; }

  /* ---------- gali & letak ---------- */
  const lantasPilih = (x, y, z) => { const v = G.get(x, y, z); return v && !BLOK[v]?.cecair; };
  function pilih(ray) { return ddaa(G, ray.ray.origin, ray.ray.direction, E.kam.jarak + 34, lantasPilih); }
  function jauh(h) { const c = G.pusat(h.x, h.y, h.z), P = E.P.pos; return Math.hypot(c.x - P.x, c.y - (P.y + 3), c.z - P.z) > 30; }
  async function onKlik(ray, btn) {
    if (tamat || E.P.mati) return;
    if (cfg.mob && kenaMob(ray)) return;
    if (id === 'malam') for (const a of anak) if (!a.ikut && !a.selamat && ray.intersectObject(a.m, true).length) { ambilAnak(a); return; }
    const h = pilih(ray); if (!h) return;
    if (jauh(h)) { E.ui.toast?.(t('Terlalu jauh. Dekati blok itu.', 'Too far. Move closer.', 'Terlalu jauh. Dekati blok itu.')); return; }
    const mod = btn === 2 ? 'letak' : btn === 1 ? 'gali' : guna;
    const idb = G.get(h.x, h.y, h.z);
    if (mod === 'letak' && idb === 19 && !kreatif) { bukaBeg(); return; }
    if (mod === 'gali') await gali(h, idb); else letak(h);
  }
  async function gali(h, idb) {
    const d = BLOK[idb]; if (!d || d.keras === Infinity) { bunyi('salah'); return; }
    E.P.ayun = 1;
    if (!kreatif) {
      const perlu = Math.max(1, d.keras - alatTahap('beliung') - (idb === 5 ? 0 : 0));
      if (idb === 14 && alatTahap('beliung') < 2 && id === 'bertahan') { E.ui.toast?.(t('Bijih permata perlukan beliung batu.', 'Gem ore needs a stone pickaxe.', 'Bijih permata butuh beliung batu.'), 'amaran'); bunyi('salah'); return; }
      if (!retak || retak.x !== h.x || retak.y !== h.y || retak.z !== h.z) retak = { x: h.x, y: h.y, z: h.z, n: 0 };
      retak.n++; bunyi('pukul'); letupKecil(h, idb, 3);
      if (retak.n < perlu) { sorot.material.color.set(retak.n / perlu > 0.5 ? '#e07a6a' : '#e3b04b'); return; }
      retak = null; sorot.material.color.set('#111111');
      if (idb === 14) {
        const ok = await E.ui.tanya({ tier: 2, tajuk: t('Permata!', 'A gem!', 'Permata!'), nota: t('Jawab betul untuk mengutip permata ini.', 'Answer correctly to collect this gem.', 'Jawab benar untuk mengambil permata ini.') });
        if (E.dunia !== D) return;
        if (!ok) { G.set(h.x, h.y, h.z, 3); E.ui.toast?.(t('Permata hancur jadi batu. Cari yang lain!', 'The gem crumbled to stone. Find another!', 'Permata hancur jadi batu. Cari yang lain!'), 'amaran'); return; }
        tambahCbux(id === 'gua' ? 3 : 5); E.ui.konfeti?.();
      }
    }
    G.set(h.x, h.y, h.z, 0); beruba = true; bunyi('pecah'); letupKecil(h, idb, 9);
    if (!kreatif) { const dp = BLOK[idb].dapat; if (dp) tambahInv(dp, 1); kira('gali', idb); if (idb === 12 || idb === 13) tambahCbux(idb === 13 ? 1 : 0); }
    if (id === 'gua') { if (kiraGua[idb] !== undefined) kiraGua[idb]++; skor = kiraGua[14] * 10 + kiraGua[13] * 3 + kiraGua[12]; E.ui.segar?.(); }
    // air mengalir masuk (ringkas: isi dari sisi)
    for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0]]) if (G.get(h.x + dx, h.y + dy, h.z + dz) === 11) { G.set(h.x, h.y, h.z, 11); break; }
  }
  function letak(h) {
    const k = hot[sel]; if (!k || !BLOK[k]) { E.ui.toast?.(t('Pilih blok di hotbar dahulu.', 'Pick a block in the hotbar first.', 'Pilih blok di hotbar dulu.')); return; }
    if (!kreatif && ada(k) <= 0) { bunyi('salah'); return; }
    const x = h.x + h.nx, y = h.y + h.ny, z = h.z + h.nz; if (!G.dalam(x, y, z)) return;
    const cur = G.get(x, y, z); if (cur && !BLOK[cur].cecair) return;
    // jangan tindih pemain / bot
    const mn = V(G.ox + x * B, y * B, G.oz + z * B), mx = V(mn.x + B, mn.y + B, mn.z + B), P = E.P.pos;
    if (BLOK[k].pepejal && P.x + 0.9 > mn.x && P.x - 0.9 < mx.x && P.z + 0.9 > mn.z && P.z - 0.9 < mx.z && P.y + 5 > mn.y && P.y < mx.y) return;
    G.set(x, y, z, k); beruba = true; bunyi('tapak'); E.P.ayun = 1;
    if (!kreatif) { tambahInv(k, -1); kira('letak', k); }
    S.x.blok.diletak++; S.harian.blok = (S.harian.blok || 0) + 1; isyarat('harian');
    if (S.x.blok.diletak % 25 === 0) tambahCbux(1); if (S.x.blok.diletak >= 300) beriLencana('kreatif');
    if (!kreatif && !ada(k)) kemasTangan();
  }
  const gSer = new THREE.BoxGeometry(0.7, 0.7, 0.7); gSer.userData.kongsi = true;
  function letupKecil(h, idb, n) {
    const c = G.pusat(h.x, h.y, h.z), m = new THREE.MeshLambertMaterial({ color: warnaBlok(idb) });
    for (let i = 0; i < n; i++) { const s = new THREE.Mesh(gSer, m); s.position.copy(c).add(V((Math.random() - 0.5) * 3, (Math.random() - 0.3) * 3, (Math.random() - 0.5) * 3)); D.grup.add(s); serpih.push({ s, v: V((Math.random() - 0.5) * 18, 10 + Math.random() * 14, (Math.random() - 0.5) * 18), h: 0.9 + Math.random() * 0.4, m }); }
  }
  function onHover(ray) { if (!sorot || tamat) return; const h = pilih(ray); letakSorot(h); }
  function letakSorot(h) { if (!h || jauh(h)) { sorot.visible = false; return; } sorot.visible = true; sorot.position.copy(G.pusat(h.x, h.y, h.z)); }

  /* ---------- Comot (raksasa malam) ---------- */
  const gMob = new THREE.BoxGeometry(3.2, 3, 3.2); gMob.userData.kongsi = true;
  const mMob = new THREE.MeshLambertMaterial({ color: '#5a3f8c' }), mMata = new THREE.MeshBasicMaterial({ color: '#ffffff' }), mAnak = new THREE.MeshBasicMaterial({ color: '#1c1612' }), mMerah = new THREE.MeshLambertMaterial({ color: '#c8473a' });
  [mMob, mMata, mAnak, mMerah].forEach((m) => { m.userData.kongsi = true; });
  function janaMob() {
    const P = E.P.pos, a = Math.random() * Math.PI * 2, r = 46 + Math.random() * 30;
    const x = P.x + Math.cos(a) * r, z = P.z + Math.sin(a) * r, [cx, , cz] = G.sel(x, 0, z); if (!G.dalam(cx, 1, cz)) return;
    const y = (G.atas(cx, cz) + 1) * B; if (G.get(cx, G.atas(cx, cz), cz) === 11) return;
    if (id === 'malam' && Math.hypot(x - unggun.p.x, z - unggun.p.z) < jejariApi() + 6) return;
    const g = new THREE.Group(), badan = new THREE.Mesh(gMob, mMob); badan.position.y = 1.5; badan.castShadow = true; g.add(badan);
    for (const s of [-0.8, 0.8]) { const e = new THREE.Mesh(gSer, mMata); e.scale.set(1, 1.2, 0.2); e.position.set(s, 2, -1.62); g.add(e); const p = new THREE.Mesh(gSer, mAnak); p.scale.set(0.45, 0.6, 0.2); p.position.set(s, 1.9, -1.68); g.add(p); }
    g.position.set(x, y, z); D.grup.add(g);
    mobs.push({ g, badan, pos: g.position, vy: 0, hp: 12 + (id === 'malam' ? (S.x.blok.malam.terbaik >= 0 ? malamNo() : 0) : 0), tSerang: 0, tKena: 0, mati: false, lompat: 0 });
  }
  function malamNo() { return Math.floor(fasa); }
  function kemasMob(dt) {
    const P = E.P, pp = P.pos;
    for (const m of mobs) {
      if (m.mati) { m.g.scale.multiplyScalar(1 - dt * 4); m.g.position.y += dt * 4; if (m.g.scale.x < 0.08) { D.grup.remove(m.g); m.buang = true; } continue; }
      const dx = pp.x - m.pos.x, dz = pp.z - m.pos.z, jar = Math.hypot(dx, dz);
      let arah = jar > 0.1 ? [dx / jar, dz / jar] : [0, 0], laju = jar < 70 && !P.mati ? 8.5 : 0;
      if (id === 'malam') { const fx = m.pos.x - unggun.p.x, fz = m.pos.z - unggun.p.z, fj = Math.hypot(fx, fz), R = jejariApi(); if (fj < R + 4 && R > 0) { arah = [fx / fj, fz / fj]; laju = 12; m.hp -= dt * 6; m.tKena = 0.1; if (m.hp <= 0) bunuhMob(m, false); } }
      if (m.tKena > 0) { m.tKena -= dt; m.badan.material = m.tKena > 0 ? mMerah : mMob; laju *= 0.2; }
      const nx = m.pos.x + arah[0] * laju * dt, nz = m.pos.z + arah[1] * laju * dt;
      const lantaiBaru = D.vox.tanahDi(nx, m.pos.y + B * 1.05, nz), lantai = D.vox.tanahDi(m.pos.x, m.pos.y + 0.5, m.pos.z);
      const diTanah = m.pos.y <= lantai + 0.05;
      if (lantaiBaru <= m.pos.y + 0.6) { m.pos.x = nx; m.pos.z = nz; } else if (diTanah) m.vy = 44;
      m.vy -= 150 * dt; m.pos.y += m.vy * dt; const ln = D.vox.tanahDi(m.pos.x, m.pos.y + 0.5, m.pos.z); if (m.pos.y < ln) { m.pos.y = ln; m.vy = 0; }
      if (m.pos.y < -20) { m.mati = true; continue; }
      m.lompat += dt * (laju ? 8 : 2); m.badan.scale.set(1 + Math.sin(m.lompat) * 0.06, 1 - Math.sin(m.lompat) * 0.08, 1 + Math.sin(m.lompat) * 0.06);
      if (laju) m.g.rotation.y = Math.atan2(-arah[0], -arah[1]);
      m.tSerang -= dt;
      if (jar < 3.8 && Math.abs(pp.y - m.pos.y) < 4.5 && m.tSerang <= 0 && !P.mati) { m.tSerang = 1.1; cederakan(id === 'malam' ? 12 : 10, m.pos); }
      if (!malamKini && cfg.kitaran) { m.hp -= dt * 8; if (m.hp <= 0) bunuhMob(m, false); }
    }
    mobs = mobs.filter((m) => !m.buang);
  }
  function kenaMob(ray) {
    const kena = ray.intersectObjects(mobs.filter((m) => !m.mati).map((m) => m.g), true)[0]; if (!kena) return false;
    const m = mobs.find((x) => x.g === kena.object.parent || x.g === kena.object); if (!m) return false;
    if (m.pos.distanceTo(E.P.pos) > 11) { E.ui.toast?.(t('Terlalu jauh untuk menyerang.', 'Too far to attack.', 'Terlalu jauh untuk menyerang.')); return true; }
    pukulMob(m); return true;
  }
  function serang() {
    E.P.ayun = 1; bunyi('pukul'); const P = E.P, f = V(-Math.sin(P.yaw), 0, -Math.cos(P.yaw));
    let best = null, bd = 9; for (const m of mobs) { if (m.mati) continue; const d = V(m.pos.x - P.pos.x, 0, m.pos.z - P.pos.z), l = d.length(); if (l < bd && (l < 4 || d.normalize().dot(f) > 0.25)) { bd = l; best = m; } }
    if (best) pukulMob(best);
  }
  function pukulMob(m) {
    E.P.ayun = 1; const dmg = 4 + alatTahap('pedang') * 3; m.hp -= dmg; m.tKena = 0.3; bunyi('pukul');
    const d = V(m.pos.x - E.P.pos.x, 0, m.pos.z - E.P.pos.z).normalize(); m.pos.addScaledVector(d, 3.5); m.vy = 22;
    E.ui.terapung?.('-' + dmg);
    if (m.hp <= 0) bunuhMob(m, true);
  }
  function bunuhMob(m, olehPemain) {
    if (m.mati) return; m.mati = true; bunyi('pecah');
    if (olehPemain) { kira('bunuh'); if (!kreatif && id === 'bertahan') tambahInv(103, 1); tambahCbux(1); }
  }

  /* ---------- siang & malam ---------- */
  const PANJANG = { bertahan: [150, 90], malam: [50, 60] };
  const LANGIT = { siang: ['#5b9ee0', '#d9eefc'], senja: ['#3b2a48', '#e28a4a'], malam: ['#070d1f', '#141e38'] };
  const cA = new THREE.Color(), cB = new THREE.Color(), cT = new THREE.Color();
  function kemasLangit(dt) {
    const [hs, hm] = PANJANG[id]; const kit = hs + hm, f = fasa % 1, tS = f * kit;
    fasa += dt / kit;
    const malam = tS > hs; let k;
    if (!malam) k = tS < 8 ? 1 - tS / 8 : tS > hs - 10 ? (tS - (hs - 10)) / 10 : 0; else k = 1;
    const kSenja = malam ? Math.max(0, 1 - (tS - hs) / 6) : tS > hs - 10 ? k : 0;
    cA.set(LANGIT.siang[0]).lerp(cT.set(LANGIT.malam[0]), k); cB.set(LANGIT.siang[1]).lerp(cT.set(LANGIT.malam[1]), k);
    if (kSenja > 0 && kSenja < 1) cB.lerp(cT.set(LANGIT.senja[1]), Math.sin(kSenja * Math.PI) * 0.6);
    aturLangit('#' + cA.getHexString(), '#' + cB.getHexString(), [malam ? 60 : 140, malam ? 220 : 520]);
    aturCahaya(1.5 - k * 1.15, 2.5 - k * 2.3);
    if (malam && !malamKini) { malamKini = true; E.ui.toast?.(t('Malam tiba. Comot keluar!', 'Night falls. Comots are coming!', 'Malam tiba. Comot keluar!'), 'amaran'); }
    if (!malam && malamKini) { malamKini = false; pagi(); }
    return { malam, baki: malam ? kit - tS : hs - tS };
  }
  async function pagi() {
    if (id === 'bertahan') { st.malam++; tambahCbux(5); semakMisi(); E.ui.toast?.(t(`Pagi! Malam ke-${st.malam} berjaya. +5 CBux`, `Morning! Night ${st.malam} survived. +5 CBux`, `Pagi! Malam ke-${st.malam} berhasil. +5 CBux`), 'ok'); simpanKini(); }
    if (id === 'malam') {
      const n = Math.floor(fasa); S.x.blok.malam.terbaik = Math.max(S.x.blok.malam.terbaik, n); simpan();
      if (n >= 10) { menang(); return; }
      tambahCbux(n * 2); E.ui.banner?.(t(`Malam ${n + 1} / 10`, `Night ${n + 1} / 10`, `Malam ${n + 1} / 10`));
      const ok = await E.ui.tanya({ tier: Math.min(3, Math.floor(n / 3)), tajuk: t('Naik taraf unggun', 'Upgrade the campfire', 'Tingkatkan api unggun'), nota: t('Betul: unggun lebih besar & terang (Comot takut).', 'Correct: a bigger, brighter fire (Comots fear it).', 'Benar: api lebih besar & terang (Comot takut).') });
      if (E.dunia !== D) return;
      if (ok) { unggun.tahap++; unggun.bahan = Math.min(100, unggun.bahan + 25); E.ui.toast?.(t('Unggun naik taraf ', 'Campfire upgraded to level ', 'Api unggun naik ke tingkat ') + (unggun.tahap + 1), 'emas'); }
    }
  }
  function jejariApi() { if (!unggun || unggun.bahan <= 0) return 0; return (16 + unggun.tahap * 6) * (0.45 + 0.55 * unggun.bahan / 100); }
  function ambilAnak(a) { a.ikut = true; a.tg.visible = false; bunyi('telur'); E.ui.toast?.(t('Anak Clawd mengikut anda. Bawa pulang ke unggun!', 'The little Clawd follows you. Bring it to the fire!', 'Anak Clawd mengikutimu. Bawa pulang ke api unggun!'), 'ok'); }
  function menang() {
    if (tamat) return; tamat = true; S.x.blok.malam.menang++; simpan(); beriLencana('malam10'); tambahCbux(40); bunyi('menang'); E.P.sorak = 6; E.ui.konfeti?.();
    E.ui.toast?.(t('10 malam berjaya! +40 CBux', '10 nights survived! +40 CBux', '10 malam berhasil! +40 CBux'), 'emas');
  }

  /* ---------- misi bertahan ---------- */
  function semakMisi() {
    if (id !== 'bertahan' || !st) return; let naik = false;
    while (st.misi < MISI.length && MISI[st.misi].ok(st.kira || {})) { st.misi++; naik = true; tambahCbux(5); bunyi('checkpoint'); E.ui.toast?.(t('Misi selesai! +5 CBux', 'Quest done! +5 CBux', 'Misi selesai! +5 CBux'), 'emas'); }
    if (naik) { E.ui.banner?.(t('Bertahan · misi ', 'Survival · quest ', 'Bertahan · misi ') + Math.min(MISI.length, st.misi + 1) + '/' + MISI.length); if (st.misi >= MISI.length) { beriLencana('blok'); E.ui.konfeti?.(); } lukisPanel(); simpan(); }
  }
  function simpanKini() {
    if (!st || id === 'gua' || id === 'malam' || D?.pratonton) return;
    const arr = []; for (const [i, v] of G.ubah) arr.push(i, v); st.ubah = arr; st.hot = hot.slice(); simpan(); beruba = false;
  }

  /* ---------- gelung ---------- */
  function kemas(dt) {
    const P = E.P; if (!P || !G) return;
    // serpihan
    for (const s of serpih) { s.v.y -= 60 * dt; s.s.position.addScaledVector(s.v, dt); s.s.rotation.x += dt * 6; s.h -= dt; if (s.h < 0.3) s.s.scale.setScalar(Math.max(0.01, s.h / 0.3)); }
    serpih = serpih.filter((s) => { if (s.h <= 0) { D.grup.remove(s.s); s.m.dispose(); return false; } return true; });
    // lava & bawah air
    const kaki = G.get(...G.sel(P.pos.x, P.pos.y + 0.6, P.pos.z)); if (BLOK[kaki]?.mati && !P.mati) bunuhPemain();
    // sorot pada tengah skrin (orang pertama / sentuh)
    if (sorot && (E.kam.fp || SENTUH)) { RC.setFromCamera(TENGAH, E.camera); letakSorot(pilih(RC)); }
    if (lampuP) for (const l of lampuP) if (l.ikut) l.l.position.set(P.pos.x, P.pos.y + 6, P.pos.z);
    // bot: ikut permukaan, kadang-kadang membina
    const yAtas = id === 'gua' ? D.spawn.y + B : 1e4;
    for (const b of D.bots) { const y = D.vox.tanahDi(b.pos.x, yAtas, b.pos.z); if (y > -1e3) { b.pos.y = y; b.av.akar.position.y = y; } if (id === 'gua') b.statistik.skor += dt * (0.1 + Math.random() * 0.12); }
    if (kreatif && Math.random() < dt / 9 && D.bots.length) { const b = D.bots[Math.floor(Math.random() * D.bots.length)]; const [x, y, z] = G.sel(b.pos.x + 5, b.pos.y + 1, b.pos.z); if (G.dalam(x, y, z) && !G.get(x, y, z)) { G.set(x, y, z, 30 + Math.floor(Math.random() * 6), false); } }
    // kitaran
    if (cfg.kitaran && !tamat) {
      const k = kemasLangit(dt);
      if (k.malam && mobs.length < (id === 'malam' ? 6 + Math.floor(fasa / 2) : 5) && Math.random() < dt * 0.5) janaMob();
      const jam = Math.ceil(k.baki);
      E.ui.info?.(id === 'malam' ? `${k.malam ? t('Malam', 'Night', 'Malam') : t('Siang', 'Day', 'Siang')} ${Math.floor(fasa) + 1}/10 · ${jam}s · ${t('Api', 'Fire', 'Api')} ${Math.round(unggun.bahan)}%` : `${k.malam ? t('Malam', 'Night', 'Malam') : t('Siang', 'Day', 'Siang')} · ${jam}s · ${t('Malam berjaya', 'Nights survived', 'Malam berhasil')} ${st.malam}`);
      if (!k.malam && P.tCedera < -4 && P.hp < 100) rawat(dt * 4);
    }
    if (cfg.mob) kemasMob(dt);
    // unggun
    if (id === 'malam' && !tamat) {
      unggun.bahan = Math.max(0, unggun.bahan - dt * (malamKini ? 1.25 : 0.45));
      const R = jejariApi(); cahayaUnggun.intensity = unggun.bahan > 0 ? 110 + R * 6 + Math.sin(D.t * 13) * 20 : 0; cahayaUnggun.distance = R * 2.6 + 10;
      const dekat = Math.hypot(P.pos.x - unggun.p.x, P.pos.z - unggun.p.z) < 16;
      if (dekat && (inv()[5] || 0) > 0) { const n = inv()[5]; tambahInv(5, -n); unggun.bahan = Math.min(100, unggun.bahan + n * 9); bunyi('pad'); E.ui.toast?.(t(`+${n} kayu ke unggun`, `+${n} wood to the fire`, `+${n} kayu ke api`), 'ok'); kemasTangan(); }
      if (dekat && P.hp < 100) rawat(dt * 6);
      if (unggun.bahan <= 0 && !unggun.padam) { unggun.padam = true; G.set(unggun.x, unggun.y, unggun.z, 5, false); E.ui.toast?.(t('Unggun padam! Cepat bawa kayu.', 'The fire is out! Bring wood fast.', 'Api padam! Cepat bawa kayu.'), 'amaran'); }
      if (unggun.bahan > 0 && unggun.padam) { unggun.padam = false; G.set(unggun.x, unggun.y, unggun.z, 22, false); }
      let n = 0;
      for (const a of anak) {
        if (a.selamat) { a.m.position.set(unggun.p.x + Math.cos(D.t * 0.5 + a.ofs * 1.57) * 7, unggun.y * B, unggun.p.z + Math.sin(D.t * 0.5 + a.ofs * 1.57) * 7); a.m.rotation.y = -D.t * 0.5 - a.ofs * 1.57; n++; continue; }
        if (!a.ikut) { a.m.rotation.y += dt; if (Math.hypot(P.pos.x - a.m.position.x, P.pos.z - a.m.position.z) < 5) ambilAnak(a); continue; }
        const sas = V(P.pos.x + Math.cos(a.ofs * 1.57) * 4, 0, P.pos.z + Math.sin(a.ofs * 1.57) * 4); a.m.position.x += (sas.x - a.m.position.x) * Math.min(1, dt * 3); a.m.position.z += (sas.z - a.m.position.z) * Math.min(1, dt * 3);
        const y = D.vox.tanahDi(a.m.position.x, a.m.position.y + B * 1.2, a.m.position.z); if (y > -1e3) a.m.position.y = y; a.m.rotation.y = P.yaw;
        if (Math.hypot(a.m.position.x - unggun.p.x, a.m.position.z - unggun.p.z) < 12) { a.selamat = true; a.ikut = false; tambahCbux(10); bunyi('menang'); E.ui.toast?.(t('Anak Clawd selamat! +10 CBux', 'Little Clawd rescued! +10 CBux', 'Anak Clawd selamat! +10 CBux'), 'emas'); if (anak.every((x) => x.selamat)) beriLencana('selamat'); }
      }
    }
    // gua: masa
    if (id === 'gua' && !tamat) {
      tMain -= dt; const m = Math.max(0, tMain); E.ui.info?.(`${Math.floor(m / 60)}:${String(Math.floor(m % 60)).padStart(2, '0')} · ${t('Skor', 'Score', 'Skor')} ${skor} · ${t('Permata', 'Gems', 'Permata')} ${kiraGua[14]}`);
      if (tMain <= 0) tamatGua();
    }
    tSimpan += dt; if (tSimpan > 12 && beruba) { tSimpan = 0; simpanKini(); }
  }
  async function tamatGua() {
    tamat = true; const g = S.x.blok.gua; const baharu = skor > g.terbaik; g.terbaik = Math.max(g.terbaik, skor); simpan();
    if (kiraGua[14] >= 6) beriLencana('gua'); tambahCbux(Math.round(skor / 4)); bunyi('menang'); E.ui.konfeti?.();
    const lagi = await E.ui.tanyaPilihan(t('Masa tamat!', "Time's up!", 'Waktu habis!'), t(`Skor ${skor} (${kiraGua[14]} permata, ${kiraGua[13]} besi, ${kiraGua[12]} arang). ${baharu ? 'Rekod baharu!' : 'Terbaik: ' + g.terbaik} +${Math.round(skor / 4)} CBux`, `Score ${skor} (${kiraGua[14]} gems, ${kiraGua[13]} iron, ${kiraGua[12]} coal). ${baharu ? 'New record!' : 'Best: ' + g.terbaik} +${Math.round(skor / 4)} CBux`, `Skor ${skor} (${kiraGua[14]} permata, ${kiraGua[13]} besi, ${kiraGua[12]} arang). ${baharu ? 'Rekor baru!' : 'Terbaik: ' + g.terbaik} +${Math.round(skor / 4)} CBux`), t('Main lagi', 'Play again', 'Main lagi'), t('Kekal di sini', 'Stay here', 'Tetap di sini'));
    if (lagi && E.dunia === D) E.ui.masukSemula?.();
  }
  function kekunci(e) {
    const n = Number(e.key); if (n >= 1 && n <= 9) { pilihSlot(n - 1); return; }
    if (e.code === 'KeyB') bukaBeg();
    if (e.code === 'KeyF' && kreatif) togolTerbang();
    if (e.code === 'KeyV') E.kam.fp = !E.kam.fp;
    if (e.code === 'KeyE' && cfg.mob) serang();
    if (e.code === 'KeyQ') { guna = guna === 'gali' ? 'letak' : 'gali'; pasangButang(); }
  }

  return {
    id, tema: cfg.tema, hotbar: true, jarakKamera: 15, langit: cfg.langit, cahaya: cfg.cahaya, pratonton: cfg.pratonton,
    bina, mula, kemas, onKlik, onHover, kekunci,
    dalamAir: (p) => G && G.get(...G.sel(p.x, p.y + 2, p.z)) === 11,
    sebelumMuncul() { if (id === 'malam' && unggun) { unggun.bahan = Math.max(10, unggun.bahan - 20); const s = D.spawn; E.ui.toast?.(t('Anda bangun di tepi unggun. Api berkurang.', 'You wake up by the fire. The fire got smaller.', 'Kamu bangun di dekat api. Api berkurang.'), 'amaran'); return s; } },
    selepasMuncul() { E.P.terbang = false; pasangButang(); kemasTangan(); },
    statistik() {
      if (id === 'gua') return [{ k: t('Skor', 'Score', 'Skor'), v: skor }, { k: t('Terbaik', 'Best', 'Terbaik'), v: S.x.blok.gua.terbaik }];
      if (id === 'malam') return [{ k: t('Malam', 'Night', 'Malam'), v: Math.floor(fasa) + 1 }, { k: t('Anak', 'Kids', 'Anak'), v: anak.filter((a) => a.selamat).length + '/4' }];
      if (id === 'bertahan') return [{ k: t('Misi', 'Quest', 'Misi'), v: st.misi }, { k: t('Malam', 'Nights', 'Malam'), v: st.malam }];
      return [{ k: t('Blok', 'Blocks', 'Blok'), v: nombor(S.x.blok.diletak) }, { k: t('Dunia', 'World', 'Dunia'), v: tx(JENIS_DUNIA[S.x.blok.kreatif.jenis]?.n || JENIS_DUNIA.padang.n).slice(0, 7) }];
    },
    statistikBot(b) { return id === 'gua' ? [Math.floor(b.statistik.skor), Math.floor(b.statistik.skor * 1.3)] : [b.nama.length % 9 + 1, b.nama.length % 4]; },
    keluar() { simpanKini(); E.ui.info?.(''); E.ui.silang?.(false); E.ui.panel?.(''); E.ui.butangSentuh?.([]); if (tangan) tangan.parent?.remove(tangan); tangan = null; G = null; aturCahaya(1.5, 2.5); },
    uji: { G: () => G, hot: () => hot, inv: () => (kreatif ? null : inv()), st: () => st, letak: (h) => letak(h), gali: (h) => gali(h, G.get(h.x, h.y, h.z)), pilihSlot, tambahInv, rakit: (i) => rakit(RESEPI[i]), mobs: () => mobs, janaMob, serang, fasa: (v) => { if (v !== undefined) fasa = v; return fasa; }, unggun: () => unggun, anak: () => anak, skor: () => skor, masa: (v) => { if (v !== undefined) tMain = v; return tMain; }, misi: () => st?.misi }
  };
}
const RC = new THREE.Raycaster(), TENGAH = new THREE.Vector2(0, 0), SENTUH = typeof matchMedia !== 'undefined' && matchMedia('(pointer:coarse)').matches;
const kotakTangan = new THREE.BoxGeometry(1.1, 1.1, 1.1); kotakTangan.userData.kongsi = true;

export const BLOK_KREATIF = buatMod('kreatif', { kreatif: true, nx: 64, ny: 30, jenis: () => S.x.blok.kreatif.jenis, tema: 'tycoon', awan: true, pratonton: { p: [92, 92, 92], t: [0, 30, 0] }, seedPratonton: 777 });
export const BLOK_BERTAHAN = buatMod('bertahan', { nx: 64, ny: 30, jenis: 'padang', tema: 'sim', kitaran: true, mob: true, awan: true, pratonton: { p: [-88, 84, 90], t: [0, 32, 0] }, seedPratonton: 1234 });
export const GUA_PERMATA = buatMod('gua', { nx: 44, ny: 16, jenis: 'gua', tema: 'menara', beliung: 3, langit: ['#0a0d16', '#0d1220', [30, 140]], cahaya: [0.35, 0.15], pratonton: { p: [70, 76, 70], t: [0, 10, 0] }, seedPratonton: 99 });
export const MALAM_HUTAN = buatMod('malam', { nx: 52, ny: 26, jenis: 'hutan', tema: 'menara', kitaran: true, mob: true, pratonton: { p: [80, 76, 80], t: [0, 30, 0] }, seedPratonton: 4321 });

/* tetapan di halaman butiran Kreatif: jenis dunia + dunia baharu */
export function butiranKreatif(el, segar) {
  const k = S.x.blok.kreatif;
  el.innerHTML = `<h2 class="p-s">${t('Pilih dunia', 'Choose a world', 'Pilih dunia')}</h2><div class="seg" id="jDunia">${['padang', 'hutan', 'gurun', 'salji', 'pulau', 'rata'].map((j) => `<button data-j="${j}" aria-pressed="${k.jenis === j}" data-uji="jenis-${j}">${esc(tx(JENIS_DUNIA[j].n))}</button>`).join('')}</div>
    <p class="fine" style="margin-top:8px">${k.ubah.length ? t(`Dunia anda ada ${k.ubah.length / 2} perubahan blok yang disimpan.`, `Your world has ${k.ubah.length / 2} saved block changes.`, `Duniamu punya ${k.ubah.length / 2} perubahan blok tersimpan.`) : t('Dunia baharu akan dijana.', 'A new world will be generated.', 'Dunia baru akan dibuat.')}</p>
    <button class="bbtn" id="bBaru" style="margin-top:8px">${ic('refresh', 16)}${t('Dunia baharu (benih rawak)', 'New world (random seed)', 'Dunia baru (benih acak)')}</button>`;
  el.querySelectorAll('[data-j]').forEach((b) => { b.onclick = () => { if (k.jenis === b.dataset.j) return; if (k.ubah.length && !confirm(t('Tukar jenis dunia akan memadam binaan anda. Teruskan?', 'Changing world type erases your builds. Continue?', 'Mengganti jenis dunia akan menghapus bangunanmu. Lanjutkan?'))) return; k.jenis = b.dataset.j; k.seed = 0; k.ubah = []; simpan(); bunyi('tap'); segar(); }; });
  el.querySelector('#bBaru').onclick = () => { if (k.ubah.length && !confirm(t('Padam dunia ini dan jana yang baharu?', 'Erase this world and make a new one?', 'Hapus dunia ini dan buat yang baru?'))) return; k.seed = 0; k.ubah = []; simpan(); bunyi('tap'); segar(); };
}
export function butiranBertahan(el, segar) {
  const k = S.x.blok.bertahan;
  el.innerHTML = `<h2 class="p-s">${t('Kemajuan', 'Progress', 'Kemajuan')}</h2><p class="dim">${t('Misi', 'Quest', 'Misi')} ${k.misi}/${MISI.length} · ${t('Malam berjaya', 'Nights survived', 'Malam berhasil')} ${k.malam}</p><button class="bbtn" id="bBaru" style="margin-top:8px">${ic('refresh', 16)}${t('Mula semula dunia', 'Restart world', 'Mulai ulang dunia')}</button>`;
  el.querySelector('#bBaru').onclick = () => { if (!confirm(t('Padam dunia, beg dan misi Bertahan?', 'Erase the Survival world, bag and quests?', 'Hapus dunia, tas, dan misi Bertahan?'))) return; Object.assign(k, { seed: 0, ubah: [], inv: {}, hot: null, malam: 0, misi: 0, kira: {} }); simpan(); segar(); };
}
