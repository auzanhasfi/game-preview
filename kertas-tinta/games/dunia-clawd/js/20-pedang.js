/* Arena Pedang: pusingan 120 saat menentang 5 pahlawan bot. Serang (klik / E), pecut (Q).
   Bola kuasa muncul di arena: sentuh + jawab betul = kuasa (ganda serangan, sembuh, perisai). Tolak lawan keluar = KO. */
import * as THREE from 'three';
import { E, Bot, cederakan, rawat } from './08-enjin.js';
import { S, simpan, tambahCbux, beriLencana } from './05-simpan.js';
import { t } from './01-teks.js';
import { bunyi } from './04-bunyi.js';
import { pecahkan, pulihkan, kemasPecah } from './07-avatar.js';

const R = 34, MASA = 120;
let D, masa, ko, kuasa, bola, tBola, tamat, tPecut, tSerang, mula0;
const KUASA = { ganda: ['Serangan ×2', 'Attack ×2', 'Serangan ×2'], sembuh: ['Sembuh +50', 'Heal +50', 'Sembuh +50'], perisai: ['Perisai 8s', 'Shield 8s', 'Perisai 8d'] };

function bina(d) {
  D = d; masa = MASA; ko = 0; kuasa = {}; bola = []; tBola = 6; tamat = false; tPecut = 0; tSerang = 0; mula0 = 3;
  d.lantaiMati = -26; d.awan(16, 400, 70, 160);
  // gelanggang lapan segi daripada jalur
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; d.kotak({ x: Math.cos(a) * R * 0.55, y: 0, z: Math.sin(a) * R * 0.55, w: R * 0.75, h: 4, d: R * 0.75, warna: '#2c3e6b', warnaAtas: i % 2 ? '#d9cbb0' : '#efe6d2' }); }
  d.kotak({ x: 0, y: 0.15, z: 0, w: 10, h: 0.15, d: 10, warna: '#d9b25f', hiasan: true });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; d.kotak({ x: Math.cos(a) * 18, y: 6, z: Math.sin(a) * 18, w: 3, h: 6, d: 3, warna: '#9aa5b8', warnaAtas: '#d9b25f' }); }
  // tiang penonton di luar
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; d.kotak({ x: Math.cos(a) * 60, y: 10 + (i % 3) * 4, z: Math.sin(a) * 60, w: 10, h: 30, d: 10, warna: '#22324f', warnaAtas: ['#c0392b', '#d9b25f', '#7f9fd9'][i % 3] }); }
  d.spawn = { x: 0, y: 0.1, z: 22, yaw: 0 };
  if (d.pratonton) { for (let i = 0; i < 4; i++) { const a = i * 1.6; d.bots.push(new Bot(d, i + 2, { x: Math.cos(a) * 12, y: 0, z: Math.sin(a) * 12 })); } return; }
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2, x = Math.cos(a) * 20, z = Math.sin(a) * 20 - 4;
    const b = new Bot(d, i * 3 + 2, { x, y: 0, z }); b._jalan = () => {}; b.o.titik = [{ x, y: 0, z }];
    Object.assign(b, { hp: 100, cd: 1 + Math.random(), vx: 0, vz: 0, vy: 0, yP: 0, sasar: null, tFikir: 0 }); b.statistik.ko = 0; d.bots.push(b);
  }
}
const gB = new THREE.IcosahedronGeometry(1.4, 0); gB.userData.kongsi = true;
const WB = { ganda: '#e8452f', sembuh: '#8fc987', perisai: '#7dd0ff' };
function janaBola() {
  const jenis = Object.keys(WB)[Math.floor(Math.random() * 3)], a = Math.random() * Math.PI * 2, r = Math.random() * 22;
  const m = new THREE.Mesh(gB, new THREE.MeshLambertMaterial({ color: WB[jenis], emissive: WB[jenis], emissiveIntensity: 0.5 })); m.position.set(Math.cos(a) * r, 3, Math.sin(a) * r); D.grup.add(m);
  bola.push({ m, jenis, ambil: false });
}
async function ambilBola(b) {
  b.ambil = true; D.grup.remove(b.m); b.m.material.dispose();
  const ok = await E.ui.tanya({ tier: 1, tajuk: t('Bola kuasa: ', 'Power orb: ', 'Bola kuasa: ') + t(...KUASA[b.jenis]) });
  if (!ok || E.dunia !== D) return;
  if (b.jenis === 'sembuh') rawat(50); else kuasa[b.jenis] = 8;
  bunyi('telur'); E.ui.toast?.(t(...KUASA[b.jenis]), 'emas');
}
function ayun() {
  if (tSerang > 0 || tamat || mula0 > 0) return; tSerang = 0.38; const P = E.P; P.ayun = 1; bunyi('pukul');
  const f = new THREE.Vector3(-Math.sin(P.yaw), 0, -Math.cos(P.yaw));
  for (const b of D.bots) {
    if (b.mati) continue; const d = new THREE.Vector3(b.pos.x - P.pos.x, 0, b.pos.z - P.pos.z), l = d.length();
    if (l < 7.5 && Math.abs(b.pos.y - P.pos.y) < 4 && (l < 3 || d.normalize().dot(f) > 0.3)) {
      const r = 12 * (kuasa.ganda > 0 ? 2 : 1); b.hp -= r; E.ui.terapung?.('-' + r);
      b.vx += d.x * 30; b.vz += d.z * 30; b.vy = 16; b.cd = Math.max(b.cd, 0.5);
      if (b.hp <= 0) koBot(b, true);
    }
  }
}
function pecut() { if (tPecut > 0 || mula0 > 0) return; tPecut = 2.2; const P = E.P; P.vel.x = -Math.sin(P.yaw) * 70; P.vel.z = -Math.cos(P.yaw) * 70; P.vel.y = 10; P.diTanah = false; bunyi('pad'); }
function koBot(b, olehPemain) {
  if (b.mati) return; b.mati = 2.6; b.hp = 100; b.yP = 0; b.vy = 0; b.vx = 0; b.vz = 0; pecahkan(b.av, D.grup, 0); bunyi('oof', 200);
  if (olehPemain) { ko++; tambahCbux(1); S.x.pedang.ko++; simpan(); E.ui.toast?.(t(`KO! Jumlah ${ko}`, `KO! Total ${ko}`, `KO! Total ${ko}`), 'ok'); } else { const lain = D.bots.find((x) => x !== b && !x.mati); if (lain) lain.statistik.ko++; }
  E.ui.segar?.();
}
function kemas(dt) {
  const P = E.P; if (!P) return;
  if (mula0 > 0) { mula0 -= dt; E.ui.banner?.(mula0 > 0 ? t('Bersedia… ', 'Ready… ', 'Bersiap… ') + Math.ceil(mula0) : t('Lawan!', 'Fight!', 'Lawan!')); if (mula0 <= 0) bunyi('pad'); return; }
  if (tamat) return;
  masa -= dt; tPecut -= dt; tSerang -= dt; for (const k in kuasa) kuasa[k] -= dt;
  if (kuasa.perisai > 0) P.kebal = 0.1;
  E.ui.info?.(`${Math.ceil(masa)}s · KO ${ko}${kuasa.ganda > 0 ? ' · ×2' : ''}${kuasa.perisai > 0 ? ' · ' + t('perisai', 'shield', 'perisai') : ''}`);
  tBola -= dt; if (tBola <= 0 && bola.filter((b) => !b.ambil).length < 3) { tBola = 9; janaBola(); }
  for (const b of bola) { if (b.ambil) continue; b.m.rotation.y += dt * 2; b.m.position.y = 3 + Math.sin(D.t * 3) * 0.5; if (!P.mati && Math.hypot(P.pos.x - b.m.position.x, P.pos.z - b.m.position.z) < 3 && Math.abs(P.pos.y + 2 - b.m.position.y) < 4) ambilBola(b); }
  bola = bola.filter((b) => !b.ambil);
  // AI bot
  for (const b of D.bots) {
    if (b.mati) continue;
    b.tFikir -= dt; if (b.tFikir <= 0) { b.tFikir = 1 + Math.random(); const calon = [!P.mati ? { pos: P.pos, pemain: true } : null, ...D.bots.filter((x) => x !== b && !x.mati).map((x) => ({ pos: x.pos, bot: x }))].filter(Boolean); b.sasar = calon.sort((p, q) => b.pos.distanceTo(p.pos) * (p.pemain ? 0.7 : 1) - b.pos.distanceTo(q.pos) * (q.pemain ? 0.7 : 1))[0]; }
    let mx = 0, mz = 0; const s = b.sasar;
    if (s) { const dx = s.pos.x - b.pos.x, dz = s.pos.z - b.pos.z, l = Math.hypot(dx, dz) || 1; if (l > 4) { mx = dx / l; mz = dz / l; } b.yaw = Math.atan2(-dx, -dz);
      b.cd -= dt; if (l < 5.5 && b.cd <= 0) { b.cd = 1.2 + Math.random() * 0.8; bunyi('pukul', 120); if (s.pemain) cederakan(9, b.pos); else { s.bot.hp -= 10; s.bot.vx += dx / l * 24; s.bot.vz += dz / l * 24; if (s.bot.hp <= 0) koBot(s.bot, false); } } }
    // jauhi tepi
    const dr = Math.hypot(b.pos.x, b.pos.z); if (dr > R * 0.85) { mx -= b.pos.x / dr; mz -= b.pos.z / dr; }
    b.pos.x += (mx * 13 + b.vx) * dt; b.pos.z += (mz * 13 + b.vz) * dt; b.vx *= 1 - dt * 4; b.vz *= 1 - dt * 4; b.laju = Math.hypot(mx, mz) * 13;
    const atas = Math.hypot(b.pos.x, b.pos.z) < R * 0.98; b.vy -= 150 * dt; b.yP += b.vy * dt; if (atas && b.yP <= 0) { b.yP = 0; b.vy = 0; } b.pos.y = b.yP; b.av.akar.position.copy(b.pos);
    if (b.yP < -24) koBot(b, Math.hypot(P.pos.x - b.pos.x, P.pos.z - b.pos.z) < 30);
  }
  if (masa <= 0) habis();
}
async function habis() {
  tamat = true; const terbaik = Math.max(...D.bots.map((b) => b.statistik.ko)), menang = ko > terbaik;
  S.x.pedang.terbaik = Math.max(S.x.pedang.terbaik, ko); if (menang) { S.x.pedang.menang++; beriLencana('pedang'); tambahCbux(25); E.ui.konfeti?.(); bunyi('menang'); E.P.sorak = 6; } simpan();
  const lagi = await E.ui.tanyaPilihan(menang ? t('Anda juara!', 'You are the champion!', 'Kamu juara!') : t('Pusingan tamat', 'Round over', 'Ronde selesai'), t(`KO anda: ${ko}. KO bot terbaik: ${terbaik}.`, `Your KOs: ${ko}. Best bot KOs: ${terbaik}.`, `KO kamu: ${ko}. KO bot terbaik: ${terbaik}.`), t('Main lagi', 'Play again', 'Main lagi'), t('Tutup', 'Close', 'Tutup'));
  if (lagi && E.dunia === D) E.ui.masukSemula?.();
}
export const PEDANG = {
  id: 'pedang', tema: 'obby', pratonton: { p: [40, 34, 48], t: [0, 2, 0] }, langit: ['#2a3a6a', '#e8b07a', [170, 620]],
  bina, kemas,
  mula() { E.ui.butangSentuh?.([{ id: 'serang', ikon: 'sword', label: t('Serang', 'Attack', 'Serang'), fn: ayun }, { id: 'pecut', ikon: 'dash', label: t('Pecut', 'Dash', 'Melesat'), fn: pecut }]); },
  onKlik() { ayun(); },
  kekunci(e) { if (e.code === 'KeyE' || e.code === 'KeyF') ayun(); if (e.code === 'KeyQ') pecut(); },
  onMati() { const b = D.bots.find((x) => !x.mati); if (b) b.statistik.ko++; },
  statistik() { return [{ k: 'KO', v: ko }, { k: t('Masa', 'Time', 'Waktu'), v: Math.max(0, Math.ceil(masa)) }]; },
  statistikBot(b) { return [b.statistik.ko || 0, Math.max(0, Math.round(b.hp))]; },
  keluar() { E.ui.butangSentuh?.([]); E.ui.info?.(''); },
  uji: { masa: (v) => { if (v !== undefined) masa = v; return masa; }, ko: () => ko, ayun, bots: () => D.bots, mula0: (v) => { mula0 = v; }, bola: () => bola, janaBola }
};
