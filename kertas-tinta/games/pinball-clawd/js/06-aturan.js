/* Pinball Clawd: aturan permainan — skor, soal di 4 tembakan, lajur atas, drop target, Kotak Clawd (lock → multiball),
   kickback, simpan bola, bonus akhir bola, tilt. Murni JS (tanpa DOM) supaya bisa diuji di Node. */
import { Fisika } from './05-fisika.js';
import { buatSoal } from './02-soal.js';

const TEMBAK_DARI = { orbit: [0, 3], ramp: [1, 2] };

export class Permainan {
  constructor({ level = 'sedang', teks, lapor = () => {} }) {
    this.level = level; this.T = teks; this.keluar = lapor;
    this.fis = new Fisika((n, d) => this.peristiwa(n, d));
    this.skor = 0; this.bolaKe = 1; this.jumlahBola = 3; this.ekstra = 0;
    this.fase = 'main'; this.t = 0;
    this.soal = null; this.soalJeda = 0.6; this.streak = 0; this.streakTerbaik = 0; this.benar = 0; this.salah = 0; this.benarBola = 0;
    this.riwayat = [];
    this.lajur = [false, false, false]; this.bonusX = 1; this.skillLajur = -1; this.skillSampai = 0;
    this.kickback = true; this.simpan = 0; this.simpanAktif = false;
    this.kunci = 0; this.kotakBuka = false; this.kotakTimer = 0; this.targetTimer = 0;
    this.multiball = false; this.antrian = 0; this.luncurTimer = 0;
    this.goyangan = []; this.tilt = false; this.akhirBolaTimer = 0;
    this.tembakTerakhir = { k: -1, t: -9 };
    this.pesan = []; this.kilauTembak = [0, 0, 0, 0];
    this.bolaBaru();
  }

  /* ---------- kendali ---------- */
  tekan(sisi, on) {
    const f = this.fis.flip[sisi]; if (on && !f.tekan && !this.tilt) { this.keluar('flipper', sisi); this.geserLajur(sisi ? 1 : -1); }
    if (!on && f.tekan) this.keluar('flipperTurun', sisi);
    f.tekan = on;
  }
  tarikPlunger(on) {
    const F = this.fis;
    if (on) { if (!F.menarik && this.adaDiPlunger()) { F.menarik = true; F.tarik = 0; this.keluar('tarik'); } return; }
    if (!F.menarik) return;
    F.menarik = false; const k = F.tarik; F.tarik = 0;
    if (F.luncurkan(k)) { this.keluar('luncur', k); this.mulaiSimpan(); this.skillSampai = this.t + 4; }
  }
  adaDiPlunger() { return this.fis.bola.some((b) => this.fis.diLorongPlunger(b)); }
  goyang() {
    if (this.fase !== 'main' || this.tilt) return;
    this.fis.goyang((Math.random() - 0.5) * 160, -140); this.keluar('goyang');
    this.goyangan = this.goyangan.filter((t) => this.t - t < 3); this.goyangan.push(this.t);
    if (this.goyangan.length >= 4) { this.tilt = true; this.fis.mati = true; this.tampil(this.T.dmd.tilt, '', 4, 'bahaya'); this.keluar('tilt'); }
    else if (this.goyangan.length === 3) { this.tampil(this.T.dmd.awas, '', 1.4, 'bahaya'); this.keluar('awas'); }
  }

  /* ---------- siklus ---------- */
  bolaBaru() {
    this.fis.tambahBola(); this.simpanAktif = false; this.simpan = 0; this.tilt = false; this.fis.mati = false; this.goyangan = [];
    this.benarBola = 0; this.skillLajur = Math.floor(Math.random() * 3); this.lajur = [false, false, false];
    this.tampil(this.T.dmd.bola + ' ' + this.bolaKe, this.T.dmd.tarik, 2.4);
    this.keluar('bolaBaru', this.bolaKe);
  }
  mulaiSimpan(detik = 10) { if (!this.simpanAktif) { this.simpanAktif = true; this.simpan = detik; } }

  langkah(dt) {
    if (this.fase === 'selesai') return;
    this.t += dt;
    if (this.fase === 'bonus') { this.akhirBolaTimer -= dt; this.fis.langkah(dt); if (this.akhirBolaTimer <= 0) this.lanjutBola(); this.pesan = this.pesan.filter((p) => p.sampai > this.t); return; }
    this.fis.langkah(dt);
    if (this.simpan > 0) this.simpan -= dt;
    // soal baru setelah jeda
    if (!this.soal) { this.soalJeda -= dt; if (this.soalJeda <= 0) { this.soal = buatSoal(this.level); this.keluar('soal', this.soal); } }
    // Kotak Clawd: tahan sebentar lalu lepas / kunci
    if (this.fis.kotakTahan) { this.kotakTimer -= dt; if (this.kotakTimer <= 0) this.selesaiKotak(); }
    if (this.targetTimer > 0) { this.targetTimer -= dt; if (this.targetTimer <= 0 && !this.fis.kotakTahan) { this.fis.pasangTarget(); this.kotakBuka = false; this.keluar('targetNaik'); } }
    // antrian peluncuran otomatis (multiball, simpan bola, setelah kunci)
    if (this.antrian > 0) {
      this.luncurTimer -= dt;
      if (this.luncurTimer <= 0 && !this.adaDiPlunger()) { this.fis.tambahBola(); this.luncurTimer = 0.25; this.otomatis = true; }
      else if (this.luncurTimer <= 0 && this.otomatis) { this.fis.luncurkan(0.9 + Math.random() * 0.08); this.keluar('luncur', 0.9); this.antrian--; this.otomatis = false; this.luncurTimer = 0.9; }
    }
    for (let i = 0; i < 4; i++) this.kilauTembak[i] = Math.max(0, this.kilauTembak[i] - dt * 1.5);
    this.pesan = this.pesan.filter((p) => p.sampai > this.t);
  }

  /* ---------- peristiwa dari fisika ---------- */
  peristiwa(n, d) {
    const T = this.T.dmd;
    switch (n) {
      case 'bumper': this.tambah(1000); this.keluar('bumper', d); break;
      case 'sling': this.tambah(110); this.keluar('sling', d); break;
      case 'clawd': this.tambah(5000); this.keluar('clawd'); break;
      case 'spinner': this.tambah(250); this.keluar('spinner'); break;
      case 'pantul': this.keluar('pantul', d); break;
      case 'pukul': this.keluar('pukul', d); break;
      case 'antarBola': this.keluar('antarBola'); break;
      case 'cari': break;
      case 'lajur': {
        this.tambah(2500); this.keluar('lajur', d);
        if (d === this.skillLajur && this.t < this.skillSampai) { this.skillSampai = 0; this.tambah(100000); this.tampil(T.skill, '100.000', 2.2, 'emas'); this.keluar('skill'); }
        this.lajur[d] = true;
        if (this.lajur.every(Boolean)) { this.lajur = [false, false, false]; if (this.bonusX < 5) this.bonusX++; this.tampil(T.bonusX + ' ' + this.bonusX + 'X', '', 1.8); this.keluar('bonusX', this.bonusX); }
        break;
      }
      case 'target': {
        this.tambah(5000); this.keluar('target', d);
        if (!this.fis.target.some(Boolean)) { this.kotakBuka = true; this.targetTimer = 0; this.tambah(25000); this.tampil(T.kotakBuka, T.tembakKotak, 2.4, 'emas'); this.keluar('kotakBuka'); }
        break;
      }
      case 'kotak': { this.kotakTimer = 1.3; this.tambah(10000); this.keluar('kotak'); break; }
      case 'inlane': this.tambah(1000); this.keluar('inlane', d); break;
      case 'outlane': {
        if (d.i === 0 && this.kickback && !this.tilt) { this.kickback = false; d.b.vy = -1750; d.b.vx = 40; this.tampil(T.kickback, '', 1.6); this.keluar('kickback'); }
        else this.keluar('outlane', d.i);
        break;
      }
      case 'ramp': this.tembakan(TEMBAK_DARI.ramp[d], 10000); this.keluar('ramp', d); break;
      case 'rampSelesai': this.keluar('rampSelesai', d); break;
      case 'orbit': this.tembakan(TEMBAK_DARI.orbit[d], 7500); this.keluar('orbit', d); break;
      case 'drain': this.drain(d); break;
    }
  }

  tambah(n) { if (!this.tilt) this.skor += n; }
  tampil(a, b = '', durasi = 2, gaya = '') { this.pesan.push({ a, b, sampai: this.t + durasi, gaya }); }

  geserLajur(arah) { const l = this.lajur; this.lajur = arah > 0 ? [l[2], l[0], l[1]] : [l[1], l[2], l[0]]; }

  tembakan(k, poin) {
    this.tambah(poin); this.kilauTembak[k] = 1;
    if (this.tembakTerakhir.k !== k && this.t - this.tembakTerakhir.t < 3.5) { this.tambah(20000); this.keluar('kombo'); this.tampil(this.T.dmd.kombo, '+20.000', 1.2); }
    this.tembakTerakhir = { k, t: this.t };
    if (!this.soal || this.tilt) return;
    const s = this.soal, T = this.T.dmd;
    if (k === s.benar) {
      this.benar++; this.benarBola++; this.streak++; this.streakTerbaik = Math.max(this.streakTerbaik, this.streak);
      const nilai = this.multiball ? 250000 : 50000 * Math.min(this.streak, 5);
      this.tambah(nilai);
      this.tampil(this.multiball ? T.jackpot : T.benar, s.teks + ' = ' + s.jwb + '   +' + nilai.toLocaleString('id-ID'), 2.2, 'emas');
      this.keluar('benar', { k, nilai, streak: this.streak });
      if (this.streak === 3 && !this.kickback) { this.kickback = true; this.tampil(T.kickbackNyala, '', 1.6); }
      if (this.streak % 5 === 0) { this.ekstra++; this.tampil(T.ekstra, '', 2.4, 'emas'); this.keluar('ekstra'); }
    } else {
      this.salah++; this.streak = 0;
      this.tampil(T.salah, s.teks + ' = ' + s.jwb, 2.6, 'bahaya');
      this.keluar('salah', { k, benar: s.benar });
    }
    this.riwayat.push({ teks: s.teks, jwb: s.jwb, pilih: s.pilihan[k], ok: k === s.benar });
    this.soal = null; this.soalJeda = 1.8;
  }

  selesaiKotak() {
    const T = this.T.dmd;
    if (this.kotakBuka) {
      this.kunci++; this.kotakBuka = false; this.targetTimer = 1.2;
      if (this.kunci < 2) {
        this.fis.kunciKotak(); this.tampil(T.terkunci, T.satuLagi, 2.4, 'emas'); this.keluar('kunci', this.kunci);
        this.antrian++; this.luncurTimer = 0.6;
      } else {
        this.kunci = 0; this.multiball = true; this.fis.lepasKotak(0, 700);
        this.antrian += 2; this.luncurTimer = 0.4; this.simpanAktif = false; this.mulaiSimpan(14);
        this.tampil(T.multiball, T.jackpotSoal, 3, 'emas'); this.keluar('multiball');
      }
    } else { this.fis.lepasKotak(); this.targetTimer = 1.2; this.keluar('kotakLepas'); }
  }

  drain(b) {
    this.keluar('drain');
    const sisa = this.fis.bola.length + (this.fis.kotakTahan ? 0 : 0) + this.antrian;
    if (this.simpan > 0 && !this.tilt && sisa < (this.multiball ? 3 : 1)) { this.antrian++; this.luncurTimer = 0.5; this.tampil(this.T.dmd.simpan, '', 1.8); this.keluar('simpan'); return; }
    if (this.multiball && sisa <= 1) { this.multiball = false; this.keluar('multiballSelesai'); }
    if (sisa > 0) return;
    this.akhirBola();
  }

  akhirBola() {
    const T = this.T.dmd;
    const bonus = this.tilt ? 0 : (this.benarBola * 10000 + 5000) * this.bonusX;
    this.skor += bonus;
    this.tampil(T.bonus + ' ' + this.bonusX + 'X', bonus.toLocaleString('id-ID'), 2.4);
    this.keluar('akhirBola', { bonus });
    this.fase = 'bonus'; this.akhirBolaTimer = 2.6; this.bonusX = 1; this.multiball = false; this.kunci = Math.min(this.kunci, 1);
  }
  lanjutBola() {
    if (this.ekstra > 0) { this.ekstra--; this.fase = 'main'; this.tampil(this.T.dmd.ekstraMain, '', 2); this.bolaBaru(); return; }
    this.bolaKe++;
    if (this.bolaKe > this.jumlahBola) { this.fase = 'selesai'; this.keluar('selesai'); return; }
    this.fase = 'main'; this.bolaBaru();
  }

  /* ringkasan untuk HUD dan uji */
  info() {
    return { skor: this.skor, bolaKe: this.bolaKe, bola: this.fis.bola.length, fase: this.fase, benar: this.benar, salah: this.salah, streak: this.streak, kunci: this.kunci, multiball: this.multiball, simpan: Math.max(0, this.simpan), kickback: this.kickback, bonusX: this.bonusX, soal: this.soal && this.soal.teks };
  }
}
