/* Pulau Bencana: bencana rawak datang silih berganti (banjir, hujan meteor, ribut, gempa, puting beliung).
   Sebelum setiap bencana: satu soalan. Betul = perisai (tahan satu pukulan) + petunjuk tempat selamat. */
import * as THREE from 'three';
import { E, Bot, cederakan, bunuhPemain } from './08-enjin.js';
import { S, simpan, tambahCbux, beriLencana } from './05-simpan.js';
import { t } from './01-teks.js';
import { bunyi } from './04-bunyi.js';
import { pecahkan, kemasPecah, pulihkan } from './07-avatar.js';

const JENIS = ['banjir', 'meteor', 'ribut', 'gempa', 'puting'];
const NAMA = { banjir: ['Banjir', 'Flood', 'Banjir'], meteor: ['Hujan Meteor', 'Meteor Shower', 'Hujan Meteor'], ribut: ['Ribut Kencang', 'Windstorm', 'Badai Angin'], gempa: ['Gempa Bumi', 'Earthquake', 'Gempa Bumi'], puting: ['Puting Beliung', 'Tornado', 'Puting Beliung'] };
const TIP = { banjir: ['Naik ke bumbung atau menara!', 'Climb onto a roof or the tower!', 'Naik ke atap atau menara!'], meteor: ['Lari dari bayang merah di lantai!', 'Run from the red shadows on the ground!', 'Lari dari bayangan merah di lantai!'], ribut: ['Berlindung di dalam rumah, jauh dari tepi!', 'Shelter inside a house, away from the edge!', 'Berlindung di dalam rumah, jauh dari tepi!'], gempa: ['Jauhi lantai retak berwarna kelabu!', 'Stay off the grey cracked tiles!', 'Jauhi lantai retak abu-abu!'], puting: ['Jauhi pusaran angin!', 'Keep away from the whirlwind!', 'Jauhi pusaran angin!'] };
let D, air, airY, fasa, tF, jenis, perisai, beruntun, meteor, retak, pusar, angin, tanda, hidupBot;

function rumah(x, z, w, d, h, warna, bumbung) {
  D.kotak({ x, y: 0.2, z, w, h: 0.2, d, warna: '#b8874e', hiasan: true });
  for (const [px, pz, pw, pd] of [[x, z - d / 2, w, 1], [x - w / 2, z, 1, d], [x + w / 2, z, 1, d]]) D.kotak({ x: px, y: h, z: pz, w: pw, h, d: pd, warna });
  D.kotak({ x: x - w / 2 + w * 0.2, y: h, z: z + d / 2, w: w * 0.4, h, d: 1, warna }); D.kotak({ x: x + w / 2 - w * 0.2, y: h, z: z + d / 2, w: w * 0.4, h, d: 1, warna });
  D.kotak({ x, y: h + 1, z, w: w + 2, h: 1, d: d + 2, warna: bumbung });
  // tangga ke bumbung
  for (let i = 0; i < Math.ceil(h / 3); i++) D.kotak({ x: x + w / 2 + 2, y: 1 + i * 3, z: z - d / 2 + 2 + i * 2.6, w: 3, h: 1, d: 2.6, warna: '#6d4a2a' });
}
function bina(d) {
  D = d; fasa = 'tenang'; tF = 14; jenis = null; perisai = false; beruntun = 0; meteor = []; retak = []; pusar = null; angin = new THREE.Vector3(); airY = -3; hidupBot = 0;
  d.lantaiMati = -30; d.awan(18, 400, 90, 180);
  air = d.kotak({ x: 0, y: airY, z: 0, w: 900, h: 2, d: 900, warna: '#3d7fd1', kaca: true, dinamik: true, hiasan: true });
  d.kotak({ x: 0, y: 0, z: 0, w: 96, h: 6, d: 96, warna: '#b89a5a', warnaAtas: '#7cbc58' });
  rumah(-24, -20, 16, 14, 7, '#efe6d2', '#c0392b'); rumah(22, -22, 14, 14, 6, '#d9eefc', '#2c3e6b'); rumah(-22, 22, 14, 12, 6, '#f6e2a8', '#3f7a4f');
  // menara tinjau
  d.kotak({ x: 24, y: 22, z: 24, w: 8, h: 22, d: 8, warna: '#9aa5b8' }); d.kotak({ x: 24, y: 23, z: 24, w: 12, h: 1, d: 12, warna: '#d9b25f' });
  d.kotak({ x: 30, y: 22, z: 24, w: 1.4, h: 22, d: 1.4, warna: '#6d4a2a', truss: true });
  // bukit kecil
  d.kotak({ x: -2, y: 4, z: 2, w: 14, h: 4, d: 14, warna: '#6a5a44', warnaAtas: '#62b264' }); d.kotak({ x: -2, y: 8, z: 2, w: 8, h: 4, d: 8, warna: '#6a5a44', warnaAtas: '#62b264' });
  // lantai retak
  for (const [x, z] of [[-6, -34], [6, -34], [-38, 0], [38, 0], [0, 38], [-12, 34], [12, 34], [38, -36]]) retak.push(d.kotak({ x, y: 0.4, z, w: 8, h: 0.6, d: 8, warna: '#7f8288', dinamik: true }));
  for (const [x, z] of [[40, 40], [-40, -40], [-40, 40]]) d.pokok(x, 0, z, 1.1);
  d.spawn = { x: 0, y: 12.2, z: 2, yaw: 0 };
  tanda = new THREE.Group(); d.grup.add(tanda);
  if (!d.pratonton) for (let i = 0; i < 6; i++) { const b = new Bot(d, i * 2 + 1, { kawasan: { x: 0, z: 0, w: 70, d: 70 }, y: 0, x: (i - 3) * 8, z: 10 }); b.statistik.hidup = 0; b.o.titik = [{ x: (i - 3) * 6, y: 0, z: 14 }]; d.bots.push(b); }
}
const gM = new THREE.DodecahedronGeometry(2.2, 0); gM.userData.kongsi = true;
const mM = new THREE.MeshLambertMaterial({ color: '#5a3a2a', emissive: '#c8471f' }), mT = new THREE.MeshBasicMaterial({ color: '#e8452f', transparent: true, opacity: 0.45, depthWrite: false });
mM.userData.kongsi = mT.userData.kongsi = true;
const gT = new THREE.CircleGeometry(6, 24); gT.rotateX(-Math.PI / 2); gT.userData.kongsi = true;
async function sedia() {
  jenis = JENIS[Math.floor(Math.random() * JENIS.length)]; fasa = 'amaran'; tF = 6;
  E.ui.banner?.(t('Bencana: ', 'Disaster: ', 'Bencana: ') + t(...NAMA[jenis])); bunyi('pad');
  if (E.P.mati) return;
  const ok = await E.ui.tanya({ tier: 1, tajuk: t('Amaran awal', 'Early warning', 'Peringatan dini'), nota: t('Betul: dapat perisai dan petunjuk.', 'Correct: get a shield and a tip.', 'Benar: dapat perisai dan petunjuk.') });
  if (E.dunia !== D) return;
  perisai = ok; if (ok) E.ui.toast?.(t('Perisai aktif! ', 'Shield up! ', 'Perisai aktif! ') + t(...TIP[jenis]), 'emas'); else E.ui.toast?.(t(...TIP[jenis]), 'amaran');
}
function mula2() {
  fasa = 'bencana'; tF = 26; bunyi('oof');
  if (jenis === 'puting') pusar = { x: -40, z: (Math.random() - 0.5) * 60, a: Math.random() * 6, g: buatPusar() };
}
function buatPusar() { const g = new THREE.Group(); for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(2 + i * 0.9, 1.6 + i * 0.8, 4, 10, 1, true), new THREE.MeshLambertMaterial({ color: '#9aa5b8', transparent: true, opacity: 0.55, side: THREE.DoubleSide })); c.position.y = i * 4 + 2; g.add(c); } D.grup.add(g); return g; }
function tamatBencana() {
  fasa = 'tenang'; tF = 14;
  if (!E.P.mati) { beruntun++; S.x.bencana.hidup++; S.x.bencana.terbaik = Math.max(S.x.bencana.terbaik, beruntun); simpan(); tambahCbux(4); bunyi('checkpoint'); E.ui.toast?.(t(`Selamat! ${beruntun} berturut-turut. +4 CBux`, `Survived! ${beruntun} in a row. +4 CBux`, `Selamat! ${beruntun} berturut-turut. +4 CBux`), 'ok'); if (beruntun >= 5) beriLencana('bencana'); }
  for (const b of D.bots) if (!b.mati) b.statistik.hidup++;
  airY = -3; D.setPos(air, 0, airY, 0); angin.set(0, 0, 0);
  for (const m of meteor) D.grup.remove(m.m), tanda.remove(m.t); meteor = [];
  retak.forEach((r) => { D.setAktif(r, true); D.setPos(r, r.x0 ?? r.x, 0.4, r.z0 ?? r.z); r.jatuh = 0; });
  if (pusar) { D.grup.remove(pusar.g); pusar = null; }
  E.ui.banner?.(t('Tenang… buat masa ini', 'Calm… for now', 'Tenang… untuk sementara'));
}
function kenaPemain(n, dari) { if (perisai) { perisai = false; E.ui.toast?.(t('Perisai menahan pukulan!', 'The shield blocked a hit!', 'Perisai menahan pukulan!'), 'emas'); E.P.kebal = 1; bunyi('pad'); return; } cederakan(n, dari); }
function kemas(dt) {
  const P = E.P; if (!P) return;
  tF -= dt;
  if (fasa === 'tenang') { E.ui.info?.(t(`Bencana seterusnya dalam ${Math.ceil(tF)}s`, `Next disaster in ${Math.ceil(tF)}s`, `Bencana berikutnya dalam ${Math.ceil(tF)}d`)); if (tF <= 0) sedia(); }
  else if (fasa === 'amaran') { E.ui.info?.(t(...NAMA[jenis]) + ' · ' + Math.ceil(tF) + 's'); if (tF <= 0 && !E.tahan) mula2(); }
  else if (fasa === 'bencana') {
    E.ui.info?.(t(...NAMA[jenis]) + ' · ' + t('bertahan ', 'survive ', 'bertahan ') + Math.ceil(tF) + 's' + (perisai ? ' · ' + t('perisai', 'shield', 'perisai') : ''));
    const k = 1 - tF / 26;
    if (jenis === 'banjir') { airY = -3 + Math.min(1, k * 1.4) * 15; D.setPos(air, 0, airY, 0); if (P.pos.y + 3 < airY && !P.mati && P.tCedera <= 0) cederakan(9); }
    if (jenis === 'meteor' && Math.random() < dt * 2.2) {
      const x = P.pos.x + (Math.random() - 0.5) * 34, z = P.pos.z + (Math.random() - 0.5) * 34, m = new THREE.Mesh(gM, mM), tt = new THREE.Mesh(gT, mT);
      m.position.set(x, 80, z); D.grup.add(m); tt.position.set(x, 0.3, z); tanda.add(tt); meteor.push({ m, t: tt, x, z, v: 0 });
    }
    for (const m of meteor) {
      m.v += 60 * dt; m.m.position.y -= m.v * dt; m.m.rotation.x += dt * 4;
      if (m.m.position.y <= 1) { m.habis = true; bunyi('pecah'); if (Math.hypot(P.pos.x - m.x, P.pos.z - m.z) < 6.2 && P.pos.y < 14) kenaPemain(45, { x: m.x, z: m.z }); for (const b of D.bots) if (!b.mati && Math.hypot(b.pos.x - m.x, b.pos.z - m.z) < 6) matiBot(b); }
    }
    meteor = meteor.filter((m) => { if (m.habis) { D.grup.remove(m.m); tanda.remove(m.t); } return !m.habis; });
    if (jenis === 'ribut') { const a = D.t * 0.4; angin.set(Math.cos(a), 0, Math.sin(a)).multiplyScalar(14 + k * 10); const teduh = Math.abs(P.pos.y - 0) < 8 && [[-24, -20, 8, 7], [22, -22, 7, 7], [-22, 22, 7, 6]].some(([x, z, w, d]) => Math.abs(P.pos.x - x) < w && Math.abs(P.pos.z - z) < d); if (!teduh && !P.mati) { P.pos.x += angin.x * dt; P.pos.z += angin.z * dt; } }
    if (jenis === 'gempa') { E.kam.yaw += Math.sin(D.t * 40) * 0.004; retak.forEach((r, i) => { r.x0 ??= r.x; r.z0 ??= r.z; if (k > 0.15 + i * 0.07) { r.jatuh = (r.jatuh || 0) + dt; D.setPos(r, r.x0, 0.4 - r.jatuh * r.jatuh * 30, r.z0); if (r.jatuh > 1.5) D.setAktif(r, false); } else D.setPos(r, r.x0 + Math.sin(D.t * 50 + i) * 0.15, 0.4, r.z0); }); }
    if (jenis === 'puting' && pusar) { pusar.x += dt * 5.5; pusar.z += Math.sin(D.t * 0.8 + pusar.a) * dt * 10; pusar.g.position.set(pusar.x, 0, pusar.z); pusar.g.rotation.y += dt * 6; const d = Math.hypot(P.pos.x - pusar.x, P.pos.z - pusar.z); if (d < 8 && !P.mati) { P.vel.y = 60; P.vel.x += (P.pos.x - pusar.x) * 4; P.vel.z += (P.pos.z - pusar.z) * 4; P.diTanah = false; if (P.tCedera <= 0) kenaPemain(15, pusar); } for (const b of D.bots) if (!b.mati && Math.hypot(b.pos.x - pusar.x, b.pos.z - pusar.z) < 7) matiBot(b); }
    if (Math.random() < dt * 0.08) { const b = D.bots[Math.floor(Math.random() * D.bots.length)]; if (b && !b.mati && jenis === 'banjir') matiBot(b); }
    if (tF <= 0) tamatBencana();
  }
}
function matiBot(b) { b.mati = 2.5; b.statistik.hidup = 0; pecahkan(b.av, D.grup, 0); bunyi('oof', 300); }
export const BENCANA = {
  id: 'bencana', tema: 'menara', pratonton: { p: [72, 50, 70], t: [0, 4, 0] }, langit: ['#4f6f9a', '#cfdbe8', [170, 620]],
  bina, kemas,
  mula() { E.ui.banner?.(t('Tenang… buat masa ini', 'Calm… for now', 'Tenang… untuk sementara')); setTimeout(() => E.ui.toast?.(t('Bencana datang setiap beberapa saat. Bertahan hidup!', 'Disasters strike every few seconds. Stay alive!', 'Bencana datang setiap beberapa detik. Bertahan hidup!')), 800); },
  onMati() { beruntun = 0; },
  statistik() { return [{ k: t('Beruntun', 'Streak', 'Beruntun'), v: beruntun }, { k: t('Terbaik', 'Best', 'Terbaik'), v: S.x.bencana.terbaik }]; },
  statistikBot(b) { return [b.statistik.hidup || 0, (b.nama.length % 5) + 2]; },
  keluar() { E.ui.info?.(''); },
  uji: { fasa: () => fasa, jenis: () => jenis, paksa: (j) => { jenis = j; fasa = 'amaran'; tF = 0.01; }, tF: (v) => { if (v !== undefined) tF = v; return tF; }, airY: () => airY, beruntun: () => beruntun }
};
