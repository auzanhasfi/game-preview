/* Clawd Kilat: Raja Comot di kapal udara. Alur: masuk → 2 lemparan bom → bola jawaban → (benar = pukul) … 3 pukulan = kalah */
import * as THREE from 'three';
import { R, mat } from './04-render.js';
import { LAJUR } from './05-dunia.js';
import { semburan, gelombangKejut, goyang } from './09-efek.js';

const kotak = new THREE.BoxGeometry(1, 1, 1);
let model = null;

function buatModel() {
  const g = new THREE.Group(), tb = new THREE.Group(); g.add(tb);
  const mBalon = mat('#5f7fd8', { kasar: 0.4, logam: 0.2 }), mGelap = mat('#2a2f5a'), mEmas = mat('#ffcf3a', { pijar: '#ffb000', pijarK: 0.8, logam: 0.6 }), mMata = mat('#ff4060', { pijar: '#ff2040', pijarK: 2.4 });
  const balon = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), mBalon); balon.scale.set(3.4, 1.6, 2); balon.position.y = 2.2; tb.add(balon);
  for (let i = -1; i <= 1; i++) { const s = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 30), mGelap); s.scale.set(1.61, 1.61, 2.01); s.rotation.y = Math.PI / 2; s.position.set(i * 1.6, 2.2, 0); s.scale.set(1.6 * Math.cos(i * 0.5), 1.6 * Math.cos(i * 0.5), 2 * Math.cos(i * 0.5)); tb.add(s); }
  const kabin = new THREE.Mesh(kotak, mGelap); kabin.scale.set(2.6, 1.1, 1.6); kabin.position.y = 0.1; tb.add(kabin);
  // Raja Comot di kabin
  const raja = new THREE.Mesh(kotak, mat('#7d97e0')); raja.scale.set(1.5, 1.1, 1.1); raja.position.set(0, 1.0, 0.3); tb.add(raja);
  const mata = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), mMata); mata.scale.set(0.25, 0.25, 0.1); mata.position.set(0, 1.1, 0.88); tb.add(mata);
  const alis = new THREE.Mesh(kotak, mGelap); alis.scale.set(0.8, 0.1, 0.1); alis.position.set(0, 1.42, 0.86); alis.rotation.z = 0.15; tb.add(alis);
  // mahkota
  const dasar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.3, 10), mEmas); dasar.position.set(0, 1.7, 0.3); tb.add(dasar);
  for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 4), mEmas); const a = i / 5 * Math.PI * 2; p.position.set(Math.cos(a) * 0.5, 2.0, 0.3 + Math.sin(a) * 0.5); tb.add(p); }
  // baling-baling belakang + sayap
  const baling = new THREE.Group(); baling.position.set(0, 2.2, 2.1);
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(kotak, mat('#e9e4f5')); b.scale.set(0.25, 1.6, 0.06); b.rotation.z = i * Math.PI * 2 / 3; baling.add(b); }
  tb.add(baling);
  for (const x of [-2.4, 2.4]) { const s = new THREE.Mesh(kotak, mGelap); s.scale.set(1.6, 0.12, 0.9); s.position.set(x, 1.2, 0.2); tb.add(s); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 10), mEmas); m.rotation.x = Math.PI / 2; m.position.set(x * 1.25, 1.2, 0.2); tb.add(m); }
  const lampu = new THREE.PointLight('#ff4060', 6, 18); lampu.position.set(0, 0, 1.5); tb.add(lampu);
  g.userData = { tb, baling, mata, balon };
  return g;
}

export const Bos = {
  aktif: false, fase: '', t: 0, nyawa: 3, x: 0, putaran: 0,
  siapkan() { model = buatModel(); model.visible = false; R.scene.add(model); },
  mulai() { this.aktif = true; this.fase = 'masuk'; this.t = 0; this.nyawa = 3; this.x = 0; this.putaran = 0; model.visible = true; model.position.set(0, 14, -90); model.rotation.set(0, 0, 0); },
  selesai() { this.aktif = false; model.visible = false; },
  get model() { return model; },
  /* api: { lempar(lajur, jarak), bolaJawab(), lajurPemain, waktu } */
  perbarui(dt, api) {
    if (!this.aktif) return;
    const u = model.userData; this.t += dt;
    u.baling.rotation.z += dt * 20;
    const ayun = Math.sin(api.waktu * 2) * 0.4;
    if (this.fase === 'masuk') {
      const k = Math.min(1, this.t / 2.2), e = 1 - Math.pow(1 - k, 3);
      model.position.set(0, 14 - 7.5 * e, -90 + 62 * e);
      if (k >= 1) { this.fase = 'serang'; this.t = 0; this.lemparan = 0; }
    } else if (this.fase === 'serang') {
      // ikuti lajur pemain pelan, lempar bom tiap 0,9 s (4–5 bom per gelombang)
      this.x += (api.lajurPemain * LAJUR - this.x) * Math.min(1, dt * 1.4);
      model.position.set(this.x, 6.5 + ayun, -28);
      if (this.t > 0.8) {
        this.t = 0; this.lemparan++;
        const l = this.lemparan % 3 === 0 ? api.lajurPemain : [-1, 0, 1][Math.floor(Math.random() * 3)];
        api.lempar(l, 55);
        if (this.lemparan % 2 === 0) api.lempar([-1, 0, 1].filter((x) => x !== l)[Math.floor(Math.random() * 2)], 70);
        if (this.lemparan >= 3 + Math.min(1, this.putaran)) { this.fase = 'soal'; this.t = 0; api.bolaJawab(); }
      }
    } else if (this.fase === 'soal') {
      this.x += (0 - this.x) * Math.min(1, dt * 2);
      model.position.set(this.x, 7 + ayun, -28);
      // menunggu main memanggil kena() / luput()
    } else if (this.fase === 'kena') {
      model.position.set(this.x + Math.sin(this.t * 60) * 0.3 * (1 - this.t), 7 + ayun, -28);
      model.rotation.z = Math.sin(this.t * 30) * 0.15 * (1 - Math.min(1, this.t));
      if (this.t > 1.1) { model.rotation.z = 0; this.fase = 'serang'; this.t = 0; this.lemparan = 0; this.putaran++; }
    } else if (this.fase === 'kalah') {
      model.position.y -= dt * 4; model.position.z -= dt * 10; model.rotation.z += dt * 1.5; model.rotation.x += dt;
      if (Math.random() < 0.5) { const p = model.position; semburan(p.x + (Math.random() - 0.5) * 4, p.y + 2, p.z, 3, { warna: ['#ff8a2a', '#ffd23a', '#3a2f5a'], kec: 5, gravitasi: 2, ukuran: 0.4 }); }
      if (this.t > 2.6) this.selesai();
    }
    u.mata.scale.setScalar(this.fase === 'kena' ? 0.12 : 0.25); u.mata.scale.z = 0.1;
  },
  kena() {
    this.nyawa--; this.t = 0; const p = model.position;
    semburan(p.x, p.y + 1.5, p.z, 40, { warna: ['#ffd23a', '#ffffff', '#7f9fd9'], kec: 9, ukuran: 0.35 });
    gelombangKejut(p.x, p.y + 1.5, p.z, '#ffd23a', 8); goyang(0.6);
    this.fase = this.nyawa <= 0 ? 'kalah' : 'kena';
    return this.nyawa <= 0;
  },
  luput() { this.fase = 'serang'; this.t = 0; this.lemparan = 0; }
};
