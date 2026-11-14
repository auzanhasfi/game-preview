/* Dunia Clawd: platform: masuk, Laman Utama, butiran pengalaman, memuat, Avatar, Kedai, Lencana, Kemajuan, Tetapan */
import * as THREE from 'three';
import { E, masukDunia, keluarDunia, gambarDunia, gambarAvatar, cfgRawak, NAMA_BOT } from './08-enjin.js';
import { buatAvatar, animasi } from './07-avatar.js';
import { S, simpan, PRESET, PRESET_ID, LENCANA, KATALOG, WARNA, milik, tambahCbux, beriLencana, dengar, namaBarang } from './05-simpan.js';
import { t, tx, nombor, BAHASA, setBahasa } from './01-teks.js';
import { ic } from './02-ikon.js';
import { caraKira, teksSoal, NAMA_TOPIK, pilihan } from './03-soal.js';
import { bunyi, mulaAudio, muzik } from './04-bunyi.js';
import { OBBY } from './09-obby.js';
import { MENARA } from './10-menara.js';
import { TYCOON } from './11-tycoon.js';
import { SIMULATOR } from './12-simulator.js';
import { bukaHud, tutupHud, kawalanTetapan, terapkanAlat, tanya } from './13-hud.js';
import { BLOK_KREATIF, BLOK_BERTAHAN, GUA_PERMATA, MALAM_HUTAN, butiranKreatif, butiranBertahan } from './16-blok.js';
import { KEBUN } from './17-kebun.js';
import { KUBU } from './18-kubu.js';
import { BENCANA } from './19-bencana.js';
import { PEDANG } from './20-pedang.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const PENGALAMAN = [
  { id: 'kreatif', g: 'blok', baru: true, mod: BLOK_KREATIF, n: ['Dunia Blok: Kreatif', 'Block World: Creative', 'Dunia Blok: Kreatif'], jenis: ['Kotak pasir', 'Sandbox', 'Kotak pasir'], pencipta: 'Clawd Studio', suka: 97, main: 5210, kunjung: 3120000, lenc: ['kreatif'], butiran: butiranKreatif,
    d: ['Bina apa sahaja, blok demi blok. Pilih padang, hutan, gurun, gunung salji, pulau atau dunia rata. Gali, letak, terbang, tukar ke kamera orang pertama. 40+ blok termasuk 10 warna bulu; blok khas dibuka dengan soalan matematik. Binaan disimpan.', 'Build anything, block by block. Pick plains, forest, desert, snow peaks, islands or a flat world. Break, place, fly, switch to first-person. 40+ blocks including 10 wool colours; special blocks unlock with a maths question. Builds are saved.', 'Bangun apa saja, blok demi blok. Pilih padang, hutan, gurun, gunung salju, pulau, atau dunia datar. Gali, taruh, terbang, ganti ke kamera orang pertama. 40+ blok termasuk 10 warna wol; blok khusus dibuka dengan soal matematika. Bangunan tersimpan.'] },
  { id: 'bertahan', g: 'blok', baru: true, mod: BLOK_BERTAHAN, n: ['Dunia Blok: Bertahan', 'Block World: Survival', 'Dunia Blok: Bertahan'], jenis: ['Bertahan hidup', 'Survival', 'Bertahan hidup'], pencipta: 'Clawd Studio', suka: 95, main: 4380, kunjung: 2410000, lenc: ['blok'], butiran: butiranBertahan,
    d: ['Tebang pokok, lombong batu, besi dan permata. Rakit papan, meja, beliung dan pedang: setiap resipi ialah soalan darab, bahagi atau tolak. Bila malam tiba, Comot keluar. 11 misi dari kayu pertama hingga bertahan 3 malam.', 'Chop trees, mine stone, iron and gems. Craft planks, tables, pickaxes and swords: every recipe is a multiply, divide or subtract question. At night, Comots come out. 11 quests from your first log to surviving 3 nights.', 'Tebang pohon, tambang batu, besi, dan permata. Rakit papan, meja, beliung, dan pedang: setiap resep adalah soal kali, bagi, atau kurang. Saat malam tiba, Comot keluar. 11 misi dari kayu pertama sampai bertahan 3 malam.'] },
  { id: 'malam', g: 'bertahan', baru: true, mod: MALAM_HUTAN, n: ['10 Malam di Hutan', '10 Nights in the Forest', '10 Malam di Hutan'], jenis: ['Bertahan hidup', 'Survival', 'Bertahan hidup'], pencipta: 'Clawd Studio', suka: 96, main: 6120, kunjung: 4050000, lenc: ['malam10', 'selamat'],
    d: ['Hutan blok yang gelap. Jaga unggun api dengan kayu yang anda tebang: api yang besar menakutkan Comot. Setiap pagi, jawab soalan untuk naik taraf unggun. Empat anak Clawd hilang di hutan: cari dan bawa pulang.', 'A dark block forest. Keep the campfire burning with wood you chop: a big fire scares Comots away. Each morning, solve a question to upgrade the fire. Four little Clawds are lost in the forest: find them and bring them home.', 'Hutan blok yang gelap. Jaga api unggun dengan kayu yang kamu tebang: api besar membuat Comot takut. Setiap pagi, jawab soal untuk meningkatkan api. Empat anak Clawd hilang di hutan: cari dan bawa pulang.'] },
  { id: 'gua', g: 'blok', baru: true, mod: GUA_PERMATA, n: ['Gua Permata', 'Gem Cave', 'Gua Permata'], jenis: ['Melombong', 'Mining', 'Menambang'], pencipta: 'Clawd Studio', suka: 92, main: 2290, kunjung: 1180000, lenc: ['gua'],
    d: ['Tiga minit dalam gua yang berbeza setiap kali. Lampu kepala menyuluh jalan. Gali terowong, kutip arang dan besi, dan cari bijih permata biru. Setiap permata ialah soalan bernilai 10 mata. Kalahkan skor bot.', 'Three minutes in a cave that changes every time. Your head lamp lights the way. Dig tunnels, collect coal and iron, and hunt for blue gem ore. Every gem is a question worth 10 points. Beat the bots’ scores.', 'Tiga menit di gua yang berbeda setiap kali. Lampu kepala menerangi jalan. Gali terowongan, ambil arang dan besi, dan cari bijih permata biru. Setiap permata adalah soal bernilai 10 poin. Kalahkan skor bot.'] },
  { id: 'kebun', g: 'simulator', baru: true, mod: KEBUN, n: ['Kebun Ajaib', 'Magic Garden', 'Kebun Ajaib'], jenis: ['Simulator', 'Simulator', 'Simulator'], pencipta: 'Clawd Studio', suka: 97, main: 7340, kunjung: 5230000, lenc: ['kebun', 'emas'],
    d: ['Beli benih (kira harga × kuantiti), tanam, dan biarkan tumbuh: tanaman terus membesar walaupun anda keluar. Hujan mempercepat tumbesaran. Ada peluang tanaman emas ×5. Jual di gerai dengan mengira jumlah, buka petak baharu dan beli penyiram.', 'Buy seeds (work out price × quantity), plant, and let them grow: crops keep growing even when you leave. Rain speeds them up. There is a chance of ×5 golden crops. Sell at the stall by adding the total, unlock plots and buy a sprinkler.', 'Beli benih (hitung harga × jumlah), tanam, dan biarkan tumbuh: tanaman terus tumbuh walau kamu keluar. Hujan mempercepat pertumbuhan. Ada peluang tanaman emas ×5. Jual di kios dengan menghitung total, buka petak baru dan beli penyiram.'] },
  { id: 'kubu', g: 'strategi', baru: true, mod: KUBU, n: ['Pertahanan Kubu', 'Fort Defense', 'Pertahanan Benteng'], jenis: ['Strategi', 'Tower defense', 'Strategi'], pencipta: 'Clawd Studio', suka: 93, main: 2980, kunjung: 1640000, lenc: ['kubu'],
    d: ['Comot berbaris di laluan berliku menuju kubu anda. Berdiri di pad emas dan jawab soalan untuk membina menara, kemudian naik taraf hingga tahap 3. Comot laju, Comot tebal, 10 gelombang. Anda juga boleh menyerang sendiri.', 'Comots march along a winding path to your fort. Stand on a gold pad and solve a question to build a tower, then upgrade it to level 3. Fast Comots, tough Comots, 10 waves. You can fight too.', 'Comot berbaris di jalur berliku menuju bentengmu. Berdiri di pad emas dan jawab soal untuk membangun menara, lalu tingkatkan sampai tingkat 3. Comot cepat, Comot tebal, 10 gelombang. Kamu juga bisa menyerang sendiri.'] },
  { id: 'bencana', g: 'bertahan', baru: true, mod: BENCANA, n: ['Pulau Bencana', 'Disaster Island', 'Pulau Bencana'], jenis: ['Bertahan hidup', 'Survival', 'Bertahan hidup'], pencipta: 'Clawd Studio', suka: 94, main: 3650, kunjung: 2870000, lenc: ['bencana'],
    d: ['Banjir, hujan meteor, ribut, gempa bumi dan puting beliung datang silih berganti. Sebelum setiap bencana, jawab satu soalan untuk mendapat perisai dan petunjuk tempat selamat. Panjat bumbung, berlindung dalam rumah, lari dari bayang merah.', 'Floods, meteor showers, windstorms, earthquakes and tornadoes strike one after another. Before each disaster, solve a question to get a shield and a safety tip. Climb roofs, shelter indoors, run from red shadows.', 'Banjir, hujan meteor, badai, gempa bumi, dan puting beliung datang bergantian. Sebelum tiap bencana, jawab satu soal untuk dapat perisai dan petunjuk tempat aman. Panjat atap, berlindung di rumah, lari dari bayangan merah.'] },
  { id: 'pedang', g: 'tarung', baru: true, mod: PEDANG, n: ['Arena Pedang', 'Sword Arena', 'Arena Pedang'], jenis: ['Pertarungan', 'Fighting', 'Pertarungan'], pencipta: 'Clawd Studio', suka: 91, main: 4020, kunjung: 2230000, lenc: ['pedang'],
    d: ['Pusingan 120 saat menentang lima pahlawan bot. Serang, pecut, dan tolak lawan keluar gelanggang. Bola kuasa muncul: jawab betul untuk ganda serangan, sembuh atau perisai. KO terbanyak menang.', 'A 120-second round against five bot fighters. Attack, dash and knock rivals out of the ring. Power orbs appear: answer correctly for double damage, healing or a shield. Most KOs wins.', 'Ronde 120 detik melawan lima petarung bot. Serang, melesat, dan dorong lawan keluar arena. Bola kuasa muncul: jawab benar untuk serangan ganda, sembuh, atau perisai. KO terbanyak menang.'] },
  { id: 'obby', g: 'rintangan', lenc: ['obby1', 'obby'], mod: OBBY, n: ['Obby Angka', 'Number Obby', 'Obby Angka'], jenis: ['Rintangan', 'Obstacle course', 'Rintangan'], pencipta: 'Clawd Studio', suka: 94, main: 3120, kunjung: 1820000,
    d: ['15 peringkat rintangan: blok hilang, palang berputar, konveyor, kekisi panjat. Di jambatan jawapan, pijak petak yang betul. Di pintu jawapan, langgar nombor yang betul. Jatuh? Sambung dari titik semak.', '15 obstacle stages: vanishing blocks, spinners, conveyors, climbing trusses. On answer bridges, step on the right tile. At answer doors, run through the right number. Fell? Continue from your checkpoint.', '15 tahap rintangan: blok hilang, palang berputar, konveyor, kisi panjat. Di jembatan jawaban, injak petak yang benar. Di pintu jawaban, tabrak angka yang benar. Jatuh? Lanjut dari titik simpan.'] },
  { id: 'menara', g: 'rintangan', lenc: ['menara'], mod: MENARA, n: ['Menara Lava', 'Lava Tower', 'Menara Lava'], jenis: ['Panjat', 'Tower climb', 'Panjat'], pencipta: 'Clawd Studio', suka: 91, main: 1840, kunjung: 960000,
    d: ['8 tingkat, susunan berbeza setiap kali masuk. Lava naik tanpa henti. Di hujung setiap tingkat ada pad soalan: betul, lif naik dan lava turun. Salah, lava melonjak.', '8 floors with a new layout each time. The lava never stops rising. Each floor ends at a question pad: correct, the lift rises and the lava drops. Wrong, the lava surges.', '8 lantai, susunannya beda setiap masuk. Lava terus naik. Di ujung tiap lantai ada pad soal: benar, lift naik dan lava turun. Salah, lava melonjak.'] },
  { id: 'tycoon', g: 'simulator', lenc: ['tycoon1', 'tycoon'], mod: TYCOON, n: ['Tycoon Kedai', 'Shop Tycoon', 'Tycoon Toko'], jenis: ['Tycoon', 'Tycoon', 'Tycoon'], pencipta: 'Clawd Studio', suka: 96, main: 4410, kunjung: 2640000,
    d: ['Mesin titis menjatuhkan barang ke konveyor. Kutip wang, pijak butang hijau, jawab soalan untuk membeli. Bina kedai dari lantai kosong hingga menara bendera. Kemajuan disimpan.', 'Droppers drop goods on the conveyor. Collect cash, step on green buttons, solve a question to buy. Build your shop from an empty floor to the flag tower. Progress is saved.', 'Mesin tetes menjatuhkan barang ke konveyor. Ambil uang, injak tombol hijau, jawab soal untuk membeli. Bangun toko dari lantai kosong sampai menara bendera. Kemajuan tersimpan.'] },
  { id: 'sim', g: 'simulator', lenc: ['telur', 'lahir'], mod: SIMULATOR, n: ['Simulator Bintang', 'Star Simulator', 'Simulator Bintang'], jenis: ['Simulator', 'Simulator', 'Simulator'], pencipta: 'Clawd Studio', suka: 93, main: 2760, kunjung: 1430000,
    d: ['Pecahkan kristal, isi beg, jual bintang, naik taraf. Jawab soalan untuk tetaskan telur haiwan peliharaan dan buka zon baharu. Buka Bulan Tinta, kemudian lahir semula untuk ganda jualan.', 'Break crystals, fill your bag, sell stars, upgrade. Solve questions to hatch pet eggs and unlock new zones. Unlock Ink Moon, then rebirth to multiply your sales.', 'Pecahkan kristal, isi tas, jual bintang, tingkatkan. Jawab soal untuk menetaskan telur hewan dan membuka zona baru. Buka Bulan Tinta, lalu lahir kembali untuk menggandakan penjualan.'] }
];
const THUMB = {}, POTRET = {};
let layar = 'laman', sel = null;

function potret(cfg, kunci, badan) { const k = kunci || JSON.stringify(cfg) + (badan || ''); return POTRET[k] ||= gambarAvatar(cfg, badan ? 240 : 144, badan ? 240 : 144, badan); }
function janaThumb() {
  // satu demi satu supaya halaman tak beku
  const baki = PENGALAMAN.filter((p) => !THUMB[p.id]); if (!baki.length) return;
  const p = baki[0]; setTimeout(() => {
    if (E.aktif) return; THUMB[p.id] = gambarDunia(p.mod);
    document.querySelectorAll(`[data-thumb="${p.id}"]`).forEach((im) => { im.style.backgroundImage = `url(${THUMB[p.id]})`; im.classList.add('ada'); });
    janaThumb();
  }, 60);
}

/* ---------- skrin masuk ---------- */
export function mula() {
  if (!S.nama) return skrinMasuk();
  if (S.masuk === 0) beriLencana('mula');
  S.masuk++; simpan(); paparPlatform();
}
function skrinMasuk() {
  const A = $('#platform'); A.hidden = false; const cadang = () => ['Clawd', 'Bintang', 'Pintar', 'Hebat', 'Laju', 'Bijak'][Math.floor(Math.random() * 6)] + '_' + (10 + Math.floor(Math.random() * 89));
  let pil = PRESET_ID[0];
  A.innerHTML = `<section class="masuk"><div class="m-kiri">
      <p class="ttl">${t('Dunia 3D · Matematik', '3D worlds · Maths', 'Dunia 3D · Matematika')}</p>
      <h1>Dunia Clawd</h1>
      <p class="dim">${t('Dua belas dunia blok: bina, lombong, bertahan, bertani dan bertarung. Setiap langkah memerlukan otak matematik anda.', 'Twelve block worlds: build, mine, survive, farm and fight. Every step needs your maths brain.', 'Dua belas dunia blok: bangun, tambang, bertahan, bertani, dan bertarung. Setiap langkah butuh otak matematikamu.')}</p>
    </div>
    <form class="m-borang pn" id="fMasuk">
      <div class="seg" role="group" aria-label="${t('Bahasa', 'Language', 'Bahasa')}">${Object.entries(BAHASA).map(([k, v]) => `<button type="button" data-l="${k}" aria-pressed="${S.bahasa === k}">${v}</button>`).join('')}</div>
      <label for="iNama">${t('Nama pemain', 'Player name', 'Nama pemain')}</label>
      <div class="m-nama"><input id="iNama" maxlength="16" value="${esc(cadang())}" autocomplete="off" data-uji="nama"><button type="button" class="xbtn" id="bRawak" aria-label="${t('Nama lain', 'Another name', 'Nama lain')}">${ic('refresh', 18)}</button></div>
      <label>${t('Pilih watak', 'Choose a character', 'Pilih karakter')}</label>
      <div class="m-av" id="mAv">${PRESET_ID.map((k) => `<button type="button" data-p="${k}" aria-pressed="${k === pil}" aria-label="${PRESET[k].nama}"><img alt="" src="${potret(PRESET[k], 'p' + k, true)}"><small>${PRESET[k].nama}</small></button>`).join('')}</div>
      <label>${t('Tahap soalan', 'Question level', 'Tingkat soal')}</label>
      <div class="seg" id="mTahap">${[['mudah', t('Tahun 1–2', 'Year 1–2', 'Kelas 1–2')], ['sedang', t('Tahun 3–4', 'Year 3–4', 'Kelas 3–4')], ['sulit', t('Tahun 5–6', 'Year 5–6', 'Kelas 5–6')]].map(([k, v]) => `<button type="button" data-d="${k}" aria-pressed="${S.diff === k}">${v}</button>`).join('')}</div>
      <label>${t('Soalan dalam game', 'Questions in the game', 'Soal di dalam game')}</label>
      <div class="m-guru pn"><span class="i">${ic('book', 22)}</span><div><b id="mgStatus">${esc(SG_RINGKAS())}</b><small>${t('Guru boleh masukkan soalan sendiri: mana-mana mata pelajaran.', 'Teachers can add their own questions: any subject.', 'Guru bisa memasukkan soal sendiri: mata pelajaran apa saja.')}</small></div><button type="button" class="bbtn" id="bGuru" data-uji="guru-masuk">${t('Saya guru', "I'm a teacher", 'Saya guru')}</button></div>
      <button class="gbtn" data-uji="masuk">${t('Mula', 'Start', 'Mulai')}${ic('next', 18)}</button>
      <p class="fine">${t('Tanpa akaun: kemajuan disimpan dalam peranti ini sahaja.', 'No account needed: progress stays on this device only.', 'Tanpa akun: kemajuan hanya tersimpan di perangkat ini.')}</p>
    </form></section>`;
  A.querySelectorAll('[data-l]').forEach((b) => { b.onclick = () => { S.bahasa = b.dataset.l; setBahasa(S.bahasa); skrinMasuk(); }; });
  $('#bRawak').onclick = () => { $('#iNama').value = cadang(); };
  $('#bGuru').onclick = () => { const n = $('#iNama').value; window.SoalGuru?.buka({ selepas: () => { const s = $('#mgStatus'); if (s) s.textContent = SG_RINGKAS(); $('#iNama').value = n; } }); };
  A.querySelectorAll('[data-p]').forEach((b) => { b.onclick = () => { pil = b.dataset.p; A.querySelectorAll('[data-p]').forEach((x) => x.setAttribute('aria-pressed', x === b)); bunyi('tap'); }; });
  A.querySelectorAll('[data-d]').forEach((b) => { b.onclick = () => { S.diff = b.dataset.d; A.querySelectorAll('[data-d]').forEach((x) => x.setAttribute('aria-pressed', x === b)); bunyi('tap'); }; });
  $('#fMasuk').onsubmit = (e) => {
    e.preventDefault(); mulaAudio(); const n = $('#iNama').value.trim().slice(0, 16) || cadang();
    S.nama = n; S.avatar = { ...PRESET[pil] }; delete S.avatar.nama; simpan(true); bunyi('betul'); mula();
  };
}

/* ---------- rangka platform ---------- */
const SG_RINGKAS = () => (window.SoalGuru ? window.SoalGuru.ringkas() : t('Matematik', 'Maths', 'Matematika'));
const NAV = () => [['laman', 'home', t('Laman', 'Home', 'Beranda')], ['guru', 'book', t('Guru', 'Teacher', 'Guru')], ['avatar', 'user', 'Avatar'], ['kedai', 'bag', t('Kedai', 'Shop', 'Toko')], ['lencana', 'trophy', t('Lencana', 'Badges', 'Lencana')], ['kemajuan', 'chart', t('Kemajuan', 'Progress', 'Kemajuan')], ['tetapan', 'settings', t('Tetapan', 'Settings', 'Pengaturan')]];
export function paparPlatform(l = layar) {
  layar = l; const A = $('#platform'); A.hidden = false; document.body.classList.remove('dalam-dunia');
  A.innerHTML = `<div class="p-rangka">
    <header class="p-atas">
      <button class="p-logo" data-nav="laman" aria-label="Dunia Clawd"><span class="lg"></span><b>Dunia Clawd</b></button>
      <label class="p-cari">${ic('search', 18)}<input id="iCari" placeholder="${t('Cari pengalaman', 'Search experiences', 'Cari pengalaman')}" aria-label="${t('Cari', 'Search', 'Cari')}"></label>
      <span class="chip p-bux" title="CBux">${ic('coin', 16)}<b id="pCbux">${nombor(S.cbux)}</b></span>
      <button class="p-saya" data-nav="avatar"><img alt="" src="${potret(S.avatar)}"><span>${esc(S.nama)}</span></button>
    </header>
    <nav class="p-nav">${NAV().map(([k, i, n]) => `<button data-nav="${k}" aria-current="${layar === k || (layar === 'butiran' && k === 'laman') ? 'page' : 'false'}" data-uji="nav-${k}">${ic(i, 20)}<span>${n}</span></button>`).join('')}</nav>
    <main class="p-isi" id="pIsi"></main></div>`;
  A.querySelectorAll('[data-nav]').forEach((b) => { b.onclick = () => { bunyi('tap'); hentiPreview(); paparPlatform(b.dataset.nav); }; });
  const I = $('#pIsi');
  ({ laman: lmn, guru: guruP, butiran: butiran, avatar: avatarP, kedai: kedaiP, lencana: lencanaP, kemajuan: kemajuanP, tetapan: tetapanP }[layar])(I);
  $('#iCari').oninput = (e) => { if (layar !== 'laman') { paparPlatform('laman'); $('#iCari').value = e.target.value; $('#iCari').focus(); } lmnSenarai(e.target.value); };
  janaThumb();
}
dengar('cbux', () => { const c = $('#pCbux'); if (c) c.textContent = nombor(S.cbux); });

function kad(p) {
  const main = p.main + Math.floor(Math.random() * 40);
  return `<button class="p-kad" data-x="${p.id}" data-uji="kad-${p.id}"><span class="p-th ${THUMB[p.id] ? 'ada' : ''}" data-thumb="${p.id}" style="${THUMB[p.id] ? `background-image:url(${THUMB[p.id]})` : ''}"></span>${p.baru ? `<span class="baru">${t('BAHARU', 'NEW', 'BARU')}</span>` : ''}<b>${esc(tx(p.n))}</b><small>${ic('thumb', 13)}${p.suka}% &nbsp; ${ic('users', 13)}${nombor(main)}</small></button>`;
}
function ikatKad(R) { R.querySelectorAll('[data-x]').forEach((b) => { b.onclick = () => { bunyi('tap'); sel = PENGALAMAN.find((p) => p.id === b.dataset.x); paparPlatform('butiran'); }; }); }

function lmn(I) {
  const rakan = NAMA_BOT.slice(0, 8), jam = new Date().getHours();
  const salam = jam < 12 ? t('Selamat pagi', 'Good morning', 'Selamat pagi') : jam < 15 ? t('Selamat tengah hari', 'Good afternoon', 'Selamat siang') : jam < 19 ? t('Selamat petang', 'Good afternoon', 'Selamat sore') : t('Selamat malam', 'Good evening', 'Selamat malam');
  semakHari();
  const terakhir = S.terakhir.map((id) => PENGALAMAN.find((p) => p.id === id)).filter(Boolean);
  I.innerHTML = `<h1 class="p-h">${salam}, ${esc(S.nama)}</h1>
    <section><h2 class="p-s">${t('Rakan', 'Friends', 'Teman')} <small>(${t('bot AI', 'AI bots', 'bot AI')})</small></h2>
      <div class="p-rakan">${rakan.map((n, i) => `<div class="rk"><span class="rk-i"><img alt="" src="${potret(cfgRawak(i), 'r' + i)}"><i class="${i % 3 === 2 ? '' : 'on'}"></i></span><small>${esc(n)}</small></div>`).join('')}</div></section>
    ${terakhir.length ? `<section><h2 class="p-s">${t('Sambung bermain', 'Continue', 'Lanjutkan')}</h2><div class="p-grid">${terakhir.map(kad).join('')}</div></section>` : ''}
    <section><div class="pn sg-jalur"><span class="i">${ic('book', 22)}</span><div><small class="ttl">${t('Soalan dalam game', 'Questions in the game', 'Soal di dalam game')}</small><b>${esc(SG_RINGKAS())}</b></div><button class="bbtn" data-nav3="guru" data-uji="laman-guru">${t('Ubah soalan', 'Edit questions', 'Ubah soal')}</button></div></section>
    <section id="pHarian"></section>
    <section><h2 class="p-s">${t('Baharu: Dunia Blok & arena', 'New: Block Worlds & arenas', 'Baru: Dunia Blok & arena')}</h2><div class="p-grid p-baris">${PENGALAMAN.filter((p) => p.baru).map(kad).join('')}</div></section>
    <section><h2 class="p-s">${t('Semua pengalaman', 'All experiences', 'Semua pengalaman')}</h2><div class="seg p-genre" id="pGenre">${GENRE().map(([k, v]) => `<button data-g="${k}" aria-pressed="${genre === k}" data-uji="genre-${k}">${v}</button>`).join('')}</div><div class="p-grid" id="pGrid"></div></section>`;
  I.querySelectorAll('[data-g]').forEach((b) => { b.onclick = () => { genre = b.dataset.g; bunyi('tap'); I.querySelectorAll('[data-g]').forEach((x) => x.setAttribute('aria-pressed', x === b)); lmnSenarai($('#iCari')?.value || ''); }; });
  lmnSenarai(''); ikatKad(I); lukisHarian();
  I.querySelector('[data-nav3]').onclick = () => { bunyi('tap'); paparPlatform('guru'); };
}
function lmnSenarai(q) {
  const G = $('#pGrid'); if (!G) return; const k = q.trim().toLowerCase();
  const list = PENGALAMAN.filter((p) => (genre === 'semua' || p.g === genre) && (!k || tx(p.n).toLowerCase().includes(k) || tx(p.jenis).toLowerCase().includes(k)));
  G.innerHTML = list.length ? list.map(kad).join('') : `<p class="dim">${t('Tiada hasil.', 'No results.', 'Tidak ada hasil.')}</p>`; ikatKad(G);
}
let genre = 'semua';
const GENRE = () => [['semua', t('Semua', 'All', 'Semua')], ['blok', t('Blok', 'Blocks', 'Blok')], ['bertahan', t('Bertahan', 'Survival', 'Bertahan')], ['rintangan', t('Rintangan', 'Obstacle', 'Rintangan')], ['simulator', 'Simulator'], ['strategi', t('Strategi', 'Strategy', 'Strategi')], ['tarung', t('Pertarungan', 'Fighting', 'Pertarungan')]];
/* ---------- hadiah & misi harian ---------- */
const hariIni = () => new Date().toISOString().slice(0, 10);
export function semakHari() {
  const h = S.harian, k = hariIni(); if (h.tarikh === k) return;
  Object.assign(h, { tarikh: k, jawab: 0, blok: 0, dunia: [], ambil: [] }); simpan();
}
const MISI_H = () => [
  { id: 'jawab', n: t('Jawab 10 soalan dengan betul', 'Answer 10 questions correctly', 'Jawab 10 soal dengan benar'), v: S.harian.jawab, m: 10, cb: 10 },
  { id: 'blok', n: t('Letak 30 blok di Dunia Blok', 'Place 30 blocks in a Block World', 'Taruh 30 blok di Dunia Blok'), v: S.harian.blok, m: 30, cb: 10 },
  { id: 'dunia', n: t('Main 3 pengalaman berbeza', 'Play 3 different experiences', 'Main 3 pengalaman berbeda'), v: S.harian.dunia.length, m: 3, cb: 10 }
];
function lukisHarian() {
  const R = $('#pHarian'); if (!R) return; semakHari(); const h = S.harian, k = hariIni(), sudah = h.hadiah === k;
  R.innerHTML = `<h2 class="p-s">${t('Hari ini', 'Today', 'Hari ini')}</h2><div class="hr-g">
    <div class="pn hr-k ${sudah ? '' : 'hr-on'}"><span class="i">${ic('gift', 26)}</span><div><b>${t('Hadiah harian', 'Daily reward', 'Hadiah harian')}</b><small>${sudah ? t(`Sudah diambil · ${h.streak} hari berturut`, `Claimed · ${h.streak}-day streak`, `Sudah diambil · ${h.streak} hari beruntun`) : t('Jawab satu soalan untuk ', 'Solve one question for ', 'Jawab satu soal untuk ') + `+${Math.min(20, 5 + h.streak * 2)} CBux`}</small></div>${sudah ? ic('check', 18) : `<button class="gbtn" id="bHadiah" data-uji="hadiah">${t('Ambil', 'Claim', 'Ambil')}</button>`}</div>
    ${MISI_H().map((m) => { const siap = m.v >= m.m, ambil = h.ambil.includes(m.id); return `<div class="pn hr-k"><span class="i">${ic(m.id === 'jawab' ? 'check' : m.id === 'blok' ? 'box' : 'globe', 22)}</span><div><b>${esc(m.n)}</b><div class="trk"><i style="width:${Math.min(100, m.v / m.m * 100)}%"></i></div><small>${Math.min(m.v, m.m)} / ${m.m}</small></div>${ambil ? ic('check', 18) : `<button class="${siap ? 'gbtn' : 'bbtn'}" data-mh="${m.id}" ${siap ? '' : 'disabled'}>+${m.cb}</button>`}</div>`; }).join('')}</div>`;
  $('#bHadiah')?.addEventListener('click', async () => {
    const ok = await tanya({ tier: 0, tajuk: t('Hadiah harian', 'Daily reward', 'Hadiah harian') }); if (!ok) { lukisHarian(); return; }
    const semalam = new Date(Date.now() - 864e5).toISOString().slice(0, 10); h.streak = h.hadiahLalu === semalam ? h.streak + 1 : 1; h.hadiahLalu = k; h.hadiah = k;
    tambahCbux(Math.min(20, 5 + (h.streak - 1) * 2)); bunyi('beli'); simpan(); lukisHarian();
  });
  R.querySelectorAll('[data-mh]').forEach((b) => { b.onclick = () => { const m = MISI_H().find((x) => x.id === b.dataset.mh); if (!m || m.v < m.m || h.ambil.includes(m.id)) return; h.ambil.push(m.id); tambahCbux(m.cb); bunyi('beli'); if (h.ambil.length >= 3) beriLencana('harian'); simpan(); lukisHarian(); }; });
}
function butiran(I) {
  const p = sel || PENGALAMAN[0], suka = S.suka[p.id];
  const lenc = p.lenc || [];
  I.innerHTML = `<button class="p-balik" data-nav2>${ic('back', 18)}${t('Kembali', 'Back', 'Kembali')}</button>
    <div class="p-but"><span class="p-th besar ${THUMB[p.id] ? 'ada' : ''}" data-thumb="${p.id}" style="${THUMB[p.id] ? `background-image:url(${THUMB[p.id]})` : ''}"></span>
    <div class="p-but-k"><h1>${esc(tx(p.n))}</h1><p class="dim">${t('oleh', 'by', 'oleh')} ${p.pencipta} · ${esc(tx(p.jenis))}</p>
      <button class="gbtn p-main" id="bMain" data-uji="main">${ic('play', 24)}<span>${t('Main', 'Play', 'Main')}</span></button>
      <div class="p-suka"><button class="bbtn" id="bSuka" aria-pressed="${suka === 1}">${ic('thumb', 18)}${p.suka + (suka === 1 ? 1 : 0)}%</button><span class="chip">${ic('users', 14)}<b>${nombor(p.main)}</b> ${t('sedang main', 'playing', 'sedang main')}</span><span class="chip">${ic('globe', 14)}<b>${nombor(p.kunjung)}</b> ${t('kunjungan', 'visits', 'kunjungan')}</span></div>
    </div></div>
    <section><h2 class="p-s">${t('Tentang', 'About', 'Tentang')}</h2><p class="p-desk">${esc(tx(p.d))}</p></section>
    ${p.butiran ? '<section id="pButX"></section>' : ''}
    <section><h2 class="p-s">${t('Lencana', 'Badges', 'Lencana')}</h2><div class="p-lenc">${lenc.map(kadLencana).join('')}</div></section>`;
  if (p.butiran) p.butiran($('#pButX'), () => butiran(I));
  I.querySelector('[data-nav2]').onclick = () => paparPlatform('laman');
  $('#bSuka').onclick = (e) => { S.suka[p.id] = S.suka[p.id] === 1 ? 0 : 1; simpan(); bunyi('tap'); butiran(I); };
  $('#bMain').onclick = () => { mulaAudio(); masuk(p); };
}
function kadLencana(id) { const b = LENCANA[id], ada = S.lencana.includes(id); return `<div class="lc ${ada ? 'ada' : ''}"><span class="i">${ic(b.i, 24)}</span><div><b>${esc(tx(b.n))}</b><small>${esc(tx(b.d))}</small></div><em>${ada ? ic('check', 16) : '+' + b.cb}</em></div>`; }

/* ---------- memuat & masuk ---------- */
const TIP = [['Tip: tahan Space untuk terus melompat.', 'Tip: hold Space to keep jumping.', 'Tip: tahan Space untuk terus melompat.'], ['Tip: seret skrin untuk memusingkan kamera.', 'Tip: drag the screen to rotate the camera.', 'Tip: seret layar untuk memutar kamera.'], ['Tip: jawapan salah? Baca cara mengira, kemudian cuba lagi.', 'Tip: wrong answer? Read how to solve it, then try again.', 'Tip: jawaban salah? Baca cara menghitung, lalu coba lagi.'], ['Tip: tekan Esc untuk menu, R untuk set semula.', 'Tip: press Esc for the menu, R to reset.', 'Tip: tekan Esc untuk menu, R untuk mengulang.']];
export function masuk(p) {
  hentiPreview();
  const A = $('#platform'), M = $('#memuat');
  M.hidden = false; M.innerHTML = `<div class="lm"><span class="lg besar"></span><h2>${esc(tx(p.n))}</h2><p class="dim">${t('oleh', 'by', 'oleh')} ${p.pencipta}</p><p class="fine">${esc(tx(TIP[Math.floor(Math.random() * TIP.length)]))}</p></div>`;
  setTimeout(() => {
    A.hidden = true; document.body.classList.add('dalam-dunia');
    masukDunia(p.mod); bukaHud(tx(p.n)); terapkanAlat(); p.mod.mula?.call(p.mod, E.dunia);
    S.terakhir = [p.id, ...S.terakhir.filter((x) => x !== p.id)].slice(0, 2); semakHari(); if (!S.harian.dunia.includes(p.id)) S.harian.dunia.push(p.id); simpan();
    setTimeout(() => { M.hidden = true; }, 500);
  }, 700);
}
export function keluar() { tutupHud(); keluarDunia(); muzik('lobi'); paparPlatform(sel ? 'butiran' : 'laman'); }
export function masukSemula() { const p = PENGALAMAN.find((x) => x.mod === E.dunia?.mod); if (p) { tutupHud(); keluarDunia(); masuk(p); } }

/* ---------- avatar: pratonton 3D sendiri ---------- */
let pv = null;
function hentiPreview() { if (pv) { cancelAnimationFrame(pv.raf); pv.r.dispose(); pv.r.forceContextLoss?.(); pv = null; } }
function mulaPreview(kv) {
  hentiPreview();
  const r = new THREE.WebGLRenderer({ canvas: kv, antialias: true, alpha: true }); const uk = () => { const w = kv.clientWidth, h = kv.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100); cam.position.set(0, 3.9, 17); cam.lookAt(0, 3.1, 0);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x445066, 1.9)); const s = new THREE.DirectionalLight(0xffffff, 2.6); s.position.set(-4, 8, 7); sc.add(s);
  const lantai = new THREE.Mesh(new THREE.CircleGeometry(4, 40), new THREE.MeshBasicMaterial({ color: '#22324f' })); lantai.rotation.x = -Math.PI / 2; sc.add(lantai);
  let av = buatAvatar(S.avatar), rot = Math.PI + 0.45, seret = false, x0 = 0; av.akar.rotation.y = rot; sc.add(av.akar);
  kv.onpointerdown = (e) => { seret = true; x0 = e.clientX; kv.setPointerCapture(e.pointerId); }; kv.onpointermove = (e) => { if (seret) { rot += (e.clientX - x0) * 0.012; x0 = e.clientX; } }; kv.onpointerup = () => { seret = false; };
  pv = { r, raf: 0, tukar() { sc.remove(av.akar); av = buatAvatar(S.avatar); av.akar.rotation.y = rot; sc.add(av.akar); } };
  let t0 = performance.now(); uk();
  const g = (ms) => { pv.raf = requestAnimationFrame(g); const dt = Math.min(0.05, (ms - t0) / 1000); t0 = ms; if (!seret) rot += dt * 0.35; av.akar.rotation.y = rot; animasi(av, dt, { laju: 0, diTanah: true, vy: 0 }); r.render(sc, cam); };
  pv.raf = requestAnimationFrame(g);
}
let tabAv = 'warna';
function avatarP(I) {
  I.innerHTML = `<h1 class="p-h">Avatar</h1><div class="av-g"><div class="av-k pn"><canvas id="avKv" aria-label="${t('Pratonton avatar', 'Avatar preview', 'Pratinjau avatar')}"></canvas><p class="fine">${t('Seret untuk pusing', 'Drag to rotate', 'Seret untuk memutar')}</p></div>
    <div class="av-p"><div class="seg" id="avTab">${[['warna', t('Warna', 'Colours', 'Warna')], ['topi', t('Topi', 'Hats', 'Topi')], ['muka', t('Muka', 'Faces', 'Wajah')], ['belakang', t('Belakang', 'Back', 'Belakang')], ['watak', t('Watak', 'Characters', 'Karakter')]].map(([k, v]) => `<button data-t="${k}" aria-pressed="${tabAv === k}">${v}</button>`).join('')}</div><div id="avIsi"></div></div></div>`;
  I.querySelectorAll('#avTab button').forEach((b) => { b.onclick = () => { tabAv = b.dataset.t; bunyi('tap'); I.querySelectorAll('#avTab button').forEach((x) => x.setAttribute('aria-pressed', x === b)); lukisAv(); }; });
  mulaPreview($('#avKv')); lukisAv();
}
function lukisAv() {
  const R = $('#avIsi'), a = S.avatar;
  const ubah = () => { simpan(); bunyi('tap'); pv?.tukar(); lukisAv(); const im = document.querySelector('.p-saya img'); if (im) im.src = potret(S.avatar); };
  if (tabAv === 'warna') {
    R.innerHTML = [['kulit', t('Kulit', 'Skin', 'Kulit')], ['baju', t('Baju', 'Shirt', 'Baju')], ['seluar', t('Seluar', 'Pants', 'Celana')]].map(([k, l]) => `<h3 class="ttl av-l">${l}</h3><div class="av-w">${WARNA.map((w) => `<button data-k="${k}" data-w="${w}" style="background:${w}" aria-pressed="${a[k] === w}" aria-label="${w}"></button>`).join('')}</div>`).join('');
    R.querySelectorAll('[data-w]').forEach((b) => { b.onclick = () => { a[b.dataset.k] = b.dataset.w; ubah(); }; });
  } else if (tabAv === 'watak') {
    R.innerHTML = `<div class="av-b">${PRESET_ID.map((k) => `<button data-p="${k}"><img alt="" src="${potret(PRESET[k], 'p' + k, true)}"><small>${PRESET[k].nama}</small></button>`).join('')}</div>`;
    R.querySelectorAll('[data-p]').forEach((b) => { b.onclick = () => { const c = { ...PRESET[b.dataset.p] }; delete c.nama; S.avatar = c; ubah(); }; });
  } else {
    const list = KATALOG.filter((k) => k.jenis === tabAv && milik(k.id));
    const tiada = tabAv !== 'muka' ? [{ id: 'tiada', n: [t('Tiada', 'None', 'Tidak ada')] }] : [];
    R.innerHTML = `<div class="av-b">${[...tiada, ...list].map((k) => `<button data-b="${k.id}" aria-pressed="${a[tabAv] === k.id}"><img alt="" src="${potret({ ...a, [tabAv]: k.id }, null, tabAv === 'belakang' ? 'blk' : false)}"><small>${esc(k.id === 'tiada' ? k.n[0] : tx(k.n))}</small></button>`).join('')}</div><p class="fine">${t('Lebih banyak di Kedai.', 'More in the Shop.', 'Lebih banyak di Toko.')}</p>`;
    R.querySelectorAll('[data-b]').forEach((b) => { b.onclick = () => { a[tabAv] = b.dataset.b; ubah(); }; });
  }
}
/* ---------- kedai ---------- */
function kedaiP(I) {
  const barang = KATALOG.filter((k) => k.h > 0);
  I.innerHTML = `<h1 class="p-h">${t('Kedai', 'Shop', 'Toko')}</h1><p class="dim p-sub">${t('Dapatkan CBux dengan menjawab soalan, mengutip syiling dan mendapat lencana. Tiada wang sebenar.', 'Earn CBux by answering questions, collecting coins and earning badges. No real money.', 'Dapatkan CBux dengan menjawab soal, mengambil koin, dan meraih lencana. Tanpa uang sungguhan.')}</p>
    <div class="kd">${barang.map((k) => { const ada = S.milik.includes(k.id), gear = k.jenis === 'alat'; return `<div class="kd-k pn">${gear ? `<span class="kd-g">${ic(k.ikon, 44)}</span>` : `<img alt="" src="${potret({ ...S.avatar, [k.jenis]: k.id }, null, k.jenis === 'belakang' ? 'blk' : false)}">`}<b>${esc(tx(k.n))}</b>${k.d ? `<small class="dim">${esc(tx(k.d))}</small>` : ''}<button class="${ada ? 'bbtn' : 'gbtn'}" data-beli="${k.id}" data-uji="beli-${k.id}" ${ada ? 'disabled' : ''}>${ada ? t('Dimiliki', 'Owned', 'Dimiliki') : ic('coin', 16) + k.h}</button></div>`; }).join('')}</div>`;
  I.querySelectorAll('[data-beli]').forEach((b) => {
    b.onclick = () => {
      const k = KATALOG.find((x) => x.id === b.dataset.beli);
      if (S.cbux < k.h) { bunyi('salah'); b.classList.add('goyang'); setTimeout(() => b.classList.remove('goyang'), 400); return; }
      tambahCbux(-k.h); S.milik.push(k.id); if (k.jenis !== 'alat') S.avatar[k.jenis] = k.id; simpan(); bunyi('beli'); beriLencana('gaya'); paparPlatform('kedai');
    };
  });
}
function lencanaP(I) {
  const ids = Object.keys(LENCANA), ada = S.lencana.length;
  I.innerHTML = `<h1 class="p-h">${t('Lencana', 'Badges', 'Lencana')}</h1><p class="dim p-sub">${ada} / ${ids.length}</p><div class="p-lenc">${ids.map(kadLencana).join('')}</div>`;
}
function kemajuanP(I) {
  const p = S.prog, per = (a) => a[1] ? Math.round(a[0] / a[1] * 100) : 0, jum = p.jumlah;
  I.innerHTML = `<h1 class="p-h">${t('Kemajuan', 'Progress', 'Kemajuan')}</h1>
    <div class="km-r"><div class="pn km-s"><b>${nombor(p.betul)}</b><small>${t('jawapan betul', 'correct answers', 'jawaban benar')}</small></div><div class="pn km-s"><b>${jum ? Math.round(p.betul / jum * 100) : 0}%</b><small>${t('ketepatan', 'accuracy', 'ketepatan')}</small></div><div class="pn km-s"><b>${p.komboTerbaik}</b><small>${t('kombo terbaik', 'best combo', 'kombo terbaik')}</small></div></div>
    <section><h2 class="p-s">${t('Ikut topik', 'By topic', 'Per topik')}</h2><div class="km-t pn">${Object.keys(p.topik).map((k) => `<div class="km-b"><span>${esc(tx(NAMA_TOPIK[k]))}</span><div class="trk"><i style="width:${per(p.topik[k])}%"></i></div><b>${p.topik[k][1] ? per(p.topik[k]) + '%' : '–'}</b><small>${p.topik[k][0]}/${p.topik[k][1]}</small></div>`).join('')}</div></section>
    <section><h2 class="p-s">${t('Soalan untuk diulang', 'Questions to review', 'Soal untuk diulang')}</h2>${p.salah.length ? `<div class="km-sl">${p.salah.map((m, i) => `<button class="pn" data-sl="${i}"><b>${esc(teksSoal(m))}</b><span>${t('Cuba lagi', 'Try again', 'Coba lagi')}${ic('next', 15)}</span></button>`).join('')}</div>` : `<p class="dim">${t('Belum ada. Soalan yang salah akan muncul di sini.', 'None yet. Questions you miss will appear here.', 'Belum ada. Soal yang salah akan muncul di sini.')}</p>`}</section>`;
  I.querySelectorAll('[data-sl]').forEach((b) => {
    b.onclick = async () => { const m = p.salah[Number(b.dataset.sl)], q = { ...m, lv: 3 }; q.opts = pilihan(q, 4); const ok = await tanya({ q, boleh: false, tajuk: t('Ulang', 'Review', 'Ulang') }); if (ok) { p.salah = p.salah.filter((x) => x !== m); simpan(); } kemajuanP(I); };
  });
}
/* ---------- halaman guru ---------- */
function guruP(I) {
  const G = window.SoalGuru, s = G?.setAktif(), d = G?.data(), mod = G?.mod() || 'mtk';
  const ada = s ? s.soal.filter((q) => q.t && q.j && (q.s || []).some(Boolean)).length : 0;
  I.innerHTML = `<h1 class="p-h">${t('Mod Guru', 'Teacher Mode', 'Mode Guru')}</h1><p class="dim p-sub">${t('Tukar soalan matematik kepada soalan anda sendiri, untuk apa-apa mata pelajaran. Tiada akaun, tiada kod.', 'Swap the maths questions for your own, in any subject. No account, no code.', 'Ganti soal matematika dengan soal buatanmu sendiri, untuk mata pelajaran apa saja. Tanpa akun, tanpa kode.')}</p>
    <div class="gr-g">
      <div class="pn gr-k gr-utama"><small class="ttl">${t('Set aktif', 'Active set', 'Set aktif')}</small><h2>${esc(s?.judul || t('Belum ada set', 'No set yet', 'Belum ada set'))}</h2><p class="dim">${esc(s?.mapel || '')}${s?.kelas ? ' · ' + esc(s.kelas) : ''} · ${ada} ${t('soalan', 'questions', 'soal')}</p>
        <div class="seg" id="grMod">${[['mtk', t('Matematik sahaja', 'Maths only', 'Matematika saja')], ['guru', t('Soalan guru sahaja', 'Teacher questions only', 'Soal guru saja')], ['campur', t('Campur', 'Mixed', 'Campur')]].map(([k, v]) => `<button data-m="${k}" aria-pressed="${mod === k}" data-uji="gr-mod-${k}">${v}</button>`).join('')}</div>
        <div class="gr-b"><button class="gbtn" data-buka="set" data-uji="gr-buka">${ic('pencil', 18)}${t('Tulis / ubah soalan', 'Write / edit questions', 'Tulis / ubah soal')}</button><button class="bbtn" data-buka="tampal">${t('Tampal dari Excel / Word', 'Paste from Excel / Word', 'Tempel dari Excel / Word')}</button></div></div>
      <div class="pn gr-k"><small class="ttl">${t('Kongsi kepada murid', 'Share with pupils', 'Bagikan ke murid')}</small><p class="dim">${t('Satu pautan. Murid buka, soalan anda terus dipakai dalam semua 12 dunia.', 'One link. Pupils open it and your questions run in all 12 worlds.', 'Satu link. Murid buka, soalmu langsung dipakai di semua 12 dunia.')}</p><button class="bbtn" data-buka="kongsi">${ic('globe', 16)}${t('Dapatkan pautan', 'Get the link', 'Ambil link')}</button></div>
      <div class="pn gr-k"><small class="ttl">${t('Laporan kelas', 'Class report', 'Laporan kelas')}</small><p class="dim">${t('Lihat soalan mana yang paling banyak salah.', 'See which questions pupils get wrong most.', 'Lihat soal mana yang paling sering salah.')}</p><button class="bbtn" data-buka="laporan">${ic('chart', 16)}${t('Buka laporan', 'Open report', 'Buka laporan')}</button></div>
    </div>
    <section><h2 class="p-s">${t('Cara guna (3 langkah)', 'How it works (3 steps)', 'Cara pakai (3 langkah)')}</h2><ol class="gr-l">
      <li><b>${t('Tulis atau tampal soalan', 'Write or paste questions', 'Tulis atau tempel soal')}</b><span>${t('Satu baris: Soalan | jawapan betul | salah | salah | salah. Boleh salin terus dari Excel atau Google Sheets.', 'One line: Question | right answer | wrong | wrong | wrong. Copy straight from Excel or Google Sheets.', 'Satu baris: Soal | jawaban benar | salah | salah | salah. Bisa salin langsung dari Excel atau Google Sheets.')}</span></li>
      <li><b>${t('Pilih mod', 'Pick a mode', 'Pilih mode')}</b><span>${t('Soalan guru sahaja, atau campur dengan matematik.', 'Teacher questions only, or mixed with maths.', 'Soal guru saja, atau campur dengan matematika.')}</span></li>
      <li><b>${t('Kongsi pautan', 'Share the link', 'Bagikan link')}</b><span>${t('Soalan muncul di jambatan Obby, pintu, lif Menara Lava, rakit Dunia Blok, menara Kubu, perisai Bencana dan semua kotak soalan.', 'Questions appear on Obby bridges, doors, Lava Tower lifts, Block World crafting, Fort towers, Disaster shields and every question box.', 'Soal muncul di jembatan Obby, pintu, lift Menara Lava, rakit Dunia Blok, menara Benteng, perisai Bencana, dan semua kotak soal.')}</span></li></ol></section>`;
  I.querySelectorAll('[data-m]').forEach((b) => { b.onclick = () => { G.mod(b.dataset.m); if (b.dataset.m !== 'mtk' && !ada) G.buka({ selepas: () => paparPlatform('guru') }); bunyi('tap'); guruP(I); }; });
  I.querySelectorAll('[data-buka]').forEach((b) => { b.onclick = () => { bunyi('tap'); G.buka({ tab: b.dataset.buka, selepas: () => paparPlatform('guru') }); }; });
}
function tetapanP(I) {
  I.innerHTML = `<h1 class="p-h">${t('Tetapan', 'Settings', 'Pengaturan')}</h1><div class="pn tp-k" id="tpK"></div>
    <section class="tp-z"><button class="bbtn" id="bNama">${ic('pencil', 16)}${t('Tukar nama', 'Change name', 'Ganti nama')}</button><button class="bbtn" id="bPadam">${ic('close', 16)}${t('Padam semua kemajuan', 'Erase all progress', 'Hapus semua kemajuan')}</button></section>`;
  kawalanTetapan($('#tpK'), () => paparPlatform('tetapan'));
  $('#bNama').onclick = () => { const n = prompt(t('Nama baharu', 'New name', 'Nama baru'), S.nama); if (n && n.trim()) { S.nama = n.trim().slice(0, 16); simpan(); paparPlatform('tetapan'); } };
  $('#bPadam').onclick = () => { if (confirm(t('Padam semua kemajuan dalam peranti ini?', 'Erase all progress on this device?', 'Hapus semua kemajuan di perangkat ini?'))) { try { localStorage.clear(); } catch (e) {} location.reload(); } };
}
export { caraKira, namaBarang };
