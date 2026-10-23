// Campaign chapters: layout (build) and scripting (setup). Each chapter is a
// different intersection of the same drowned town.
import * as THREE from 'three';
import { Vox, P, voxGroup, cloneMat } from './voxel.js';
import { rand, chance, hash3 } from './util.js';
import { CHASM } from './ground.js';
import * as W from './world.js';

const { C } = W;
const PI = Math.PI;

// ---------------------------------------------------------------- lore
export const NOTES = {
  p1: { title: 'Catatan 1 — Penguapan', body: 'Hari ke-3.\n\nMatahari memanaskan air laut, sungai, dan genangan. Air berubah wujud dari cair menjadi gas: uap air. Proses ini disebut EVAPORASI.\n\nUap air naik karena lebih ringan dari udara di sekitarnya.\n\n— Tomas, ahli hidrologi',
    q: 'Air berubah dari cair menjadi uap karena panas matahari. Proses ini disebut…', opts: ['Evaporasi', 'Kondensasi', 'Infiltrasi'], ans: 0, why: 'Evaporasi = penguapan, cair menjadi gas.' },
  p2: { title: 'Catatan 2 — Awan terbentuk', body: 'Hari ke-9.\n\nMakin tinggi, udara makin dingin. Uap air mendingin lalu berubah kembali menjadi titik-titik air kecil. Titik air berkumpul menjadi AWAN.\n\nPerubahan gas menjadi cair ini disebut KONDENSASI.\n\n— T.',
    q: 'Uap air yang mendingin menjadi titik air dan membentuk awan disebut…', opts: ['Presipitasi', 'Kondensasi', 'Evaporasi'], ans: 1, why: 'Kondensasi = pengembunan, gas menjadi cair.' },
  p3: { title: 'Catatan 3 — Hujan turun', body: 'Hari ke-14.\n\nTitik air di awan bergabung dan makin berat. Saat terlalu berat, air jatuh ke bumi sebagai hujan, salju, atau es. Ini disebut PRESIPITASI.\n\nSudah empat puluh hari hujan tidak berhenti.\n\n— T.',
    q: 'Jatuhnya air dari awan ke bumi disebut…', opts: ['Infiltrasi', 'Transpirasi', 'Presipitasi'], ans: 2, why: 'Presipitasi = hujan, salju, atau es yang jatuh dari awan.' },
  p4: { title: 'Log pompa — Stasiun 2', body: 'Air hujan yang jatuh ke tanah ada dua jalan:\n\n1. Meresap ke dalam tanah (INFILTRASI), mengisi air tanah.\n2. Mengalir di permukaan (LIMPASAN) menuju selokan dan sungai.\n\nAspal dan beton membuat air tidak bisa meresap.\n\n— Kell',
    q: 'Air hujan yang meresap ke dalam tanah disebut…', opts: ['Infiltrasi', 'Limpasan', 'Evaporasi'], ans: 0, why: 'Infiltrasi = peresapan air ke dalam tanah.' },
  p5: { title: 'Log pompa — penyebab banjir', body: 'Kenapa kota ini tenggelam?\n\n- Waduk jebol setelah hujan deras berhari-hari.\n- Tanah tertutup aspal, air tidak meresap.\n- Selokan tersumbat sampah.\n- Pohon di hulu ditebang.\n\nSemua air mengalir ke jalan.\n\n— Kell',
    q: 'Mana yang BUKAN penyebab banjir di kota?', opts: ['Selokan tersumbat sampah', 'Banyak taman dan pohon', 'Tanah tertutup aspal'], ans: 1, why: 'Taman dan pohon membantu air meresap, jadi justru mengurangi banjir.' },
  p6: { title: 'Lembar rumah sakit', body: 'Pompa air memindahkan air dari tempat rendah ke tempat yang lebih tinggi atau ke sungai.\n\nPompa butuh energi listrik. Jangan pernah menyentuh kabel atau stopkontak saat lantai tergenang: air kotor menghantarkan listrik.\n\nLantai tiga aman dari genangan.',
    q: 'Mengapa berbahaya menyentuh stopkontak saat banjir?', opts: ['Air kotor menghantarkan listrik', 'Air membuat listrik padam selamanya', 'Stopkontak jadi dingin'], ans: 0, why: 'Air yang mengandung mineral dan kotoran adalah penghantar listrik.' },
  p7: { title: 'Catatan perawat malam', body: 'Cara mengurangi banjir:\n\n- Buat sumur resapan dan biopori.\n- Tanam pohon dan jaga hutan di hulu.\n- Buang sampah pada tempatnya.\n- Bangun waduk dan pompa yang dirawat.\n\nLampu kapel menyala. Tomas pasti di sana.',
    q: 'Lubang kecil di tanah untuk membantu air hujan meresap disebut…', opts: ['Biopori', 'Bendungan', 'Selokan'], ans: 0, why: 'Biopori = lubang resapan yang membantu air masuk ke tanah.' },
};

export const CALLS = {
  c1: ['…Nadia.', 'Kamu datang.', '…Stasiun Pompa 2. Jalan Kedua.', 'Baca semua catatanku. Jawab soalnya, senter kamu akan bertahan lebih lama.', '(suara air)'],
  c2: ['…airnya surut, Nadia.', 'Pompa bekerja: air dipindahkan ke sungai.', 'Rumah sakit. Lantai tiga, lalu kapel.', '…cepat.'],
  c3: ['…kamu membaca semuanya.', 'Sekarang kamu paham siklus air.', 'Tetap di bawah cahaya, Nadia.'],
  c3b: ['…Nadia.', 'Turun ke kapel.', 'Masih ada catatan yang belum kamu baca.'],
};

function sputterLite(t) { const a = Math.sin(t * 9.1) * Math.sin(t * 4.3 + 1) * Math.sin(t * 1.7 + 2); return a > 0.6 ? 0.2 : 1; }

// ---------------------------------------------------------------- shared dressing
function cornerLamps(ctx, lit) {
  const { sink, dyn } = ctx;
  const r = [];
  r.push(W.lampPost(sink, 8.6, -8.6, PI * 0.75, lit[0], dyn, lit[0] ? { flicker: 1, shadow: true } : {}));
  r.push(W.lampPost(sink, -8.6, 8.6, -PI * 0.25, lit[1], dyn, lit[1] ? { intensity: 240 } : {}));
  r.push(W.lampPost(sink, -8.6, -8.6, PI * 1.25, lit[2], dyn, lit[2] ? { intensity: 240, cold: true, color: 0xcfe0ff } : {}));
  r.push(W.lampPost(sink, 8.6, 8.6, PI * 0.25, lit[3], dyn, lit[3] ? { intensity: 240, cold: true, color: 0xcfe0ff } : {}));
  for (const x of [-26, -44, 26, 44]) { W.lampPost(sink, x, -9.0, PI, x === 44, dyn, { light: false }); W.lampPost(sink, x + 9, 9.0, 0, x === -44, dyn, { light: false }); }
  for (const z of [-30, -48, 30, 48]) { W.lampPost(sink, 9.0, z, -PI / 2, z === -48, dyn, { light: false }); W.lampPost(sink, -9.0, z + 9, PI / 2, false, dyn); }
  return r;
}

// ================================================================ chapter 1
const ch1 = {
  id: 'vesper', title: 'Misi Air: Vesper Street', subtitle: 'Hujan turun empat puluh hari setelah waduk jebol. Kumpulkan catatan ilmuwan Tomas dan pelajari kenapa kota ini banjir.',
  fog: 0x0a0d12, spawn: [1.5, 3.5], camYaw: -0.62, flood: 0,
  walk: [{ x0: -21.8, x1: 20.5, z0: -9.4, z1: 9.4 }, { x0: -8.6, x1: 8.6, z0: -19.2, z1: 19.8 }],
  hollows: { max: 0, interval: 30, points: [[-19, -7], [-19, 7], [4, -17], [-4, 18]] },
  town: {},
  build(ctx) {
    CHASM.on = true;
    const { sink, dyn, materials } = ctx;
    const diner = W.building(sink, { cx: -17, cz: -10, ry: PI, w: 14, d: 16, floors: 3, style: 'brick2', seed: 11, side: 'xlo', store: { name: 'EAT', pane: C.glassGreen, awning: [C.awnA, C.awnB], doorX: 10.5, signBg: C.signRed } });
    W.drainPipe(sink, diner.lot, -6.6, diner.height);
    const pharm = W.building(sink, { cx: 18, cz: -10, ry: PI, w: 16, d: 14, floors: 4, style: 'concrete', seed: 12, side: 'xhi', store: { name: 'PHARMACY', pane: C.darkGlass, awning: [C.awnG, C.awnB], doorX: 3 } });
    W.drainPipe(sink, pharm.lot, 7.6, pharm.height);
    W.fireEscape(sink, pharm.lot, -3.5, 4, pharm.GH, pharm.FH, pharm.height);
    const apts = W.building(sink, { cx: 17, cz: 10, ry: 0, w: 14, d: 18, floors: 6, style: 'brick', seed: 13, side: 'xlo', store: { name: 'ROOMS', pane: C.darkGlass, doorX: 6.2, doorPane: C.glassLitDim }, paneOverride: (f, x) => { const r = hash3(f, x, 77); return r < 0.75 ? C.darkGlass : r < 0.9 ? C.glassLitWarm : C.glassLitDim; } });
    W.fireEscape(sink, apts.lot, 3.2, 6, apts.GH, apts.FH, apts.height);
    W.drainPipe(sink, apts.lot, -6.6, apts.height);
    const motel = W.building(sink, { cx: -18, cz: 10, ry: 0, w: 16, d: 14, floors: 2, style: 'plaster', seed: 14, side: 'xhi', store: { name: 'OFFICE', pane: C.glassLitDim, doorX: 12, doorPane: C.glassLitWarm } });
    {
      sink.cutFlag = 1;
      const lot = motel.lot, GH = motel.GH; const y = GH;
      sink.box(C.concrete, -8, y - 0.2, -1.6, 16, 0.2, 1.6, lot);
      sink.box(C.metalD, -8, y, -1.6, 16, 0.04, 0.05, lot); sink.box(C.metalD, -8, y + 0.5, -1.6, 16, 0.04, 0.05, lot); sink.box(C.metalD, -8, y + 1.0, -1.6, 16, 0.05, 0.05, lot);
      for (let u = -8; u <= 8; u += 2) sink.box(C.metalD, u - 0.03, y, -1.6, 0.06, 1.0, 0.06, lot);
      for (let u = -7; u <= 7; u += 3.5) sink.box(C.pole, u - 0.06, 0, -1.55, 0.12, y, 0.12, lot);
      for (const fy of [0, y]) for (let u = -6; u <= 6; u += 3.5) { if (fy === 0 && u > 2) continue; sink.box(C.door, u - 0.45, fy, -0.02, 0.9, 2.1, 0.06, lot); sink.box(C.metalD, u - 0.5, fy + 2.1, -0.05, 1.0, 0.08, 0.12, lot); }
      sink.box(C.glassLitWarm, -6.45, y, -0.02, 0.9, 2.1, 0.03, lot);
      sink.box(C.door, -5.75, y, -0.02, 0.9, 2.1, 0.06, lot.clone().multiply(new THREE.Matrix4().makeRotationY(-1.1)));
      sink.cutFlag = 0;
    }
    // diner neon
    {
      const g = W.neonLetters('DINER', 0.28, C.neonPink, C.neonPinkOff, materials, { depth: 1 });
      const p = new THREE.Vector3(0, 5.2, -0.45).applyMatrix4(diner.lot);
      g.position.copy(p); g.rotation.y = PI;
      sink.box(C.signBg, -3.2, 4.9, -0.35, 6.4, 1.9, 0.25, diner.lot);
      dyn.group.add(g);
      const light = new THREE.PointLight(0xff5fa0, 70, 22, 2); light.position.set(p.x, p.y + 0.5, p.z - 1.2); dyn.group.add(light);
      const slot = dyn.slot();
      dyn.neon.push({ letters: g.userData.letters, light, base: 70, kind: 'diner', slot });
      dyn.glows.push({ pos: [p.x, p.y + 0.6, p.z - 0.6], color: 0xff5fa0, size: 5, slot });
      dyn.feeds.push(() => [light.position.x, light.position.y, light.position.z, 0.35 * light.intensity / 70, 1.0, 0.37, 0.63]);
      const g2 = W.neonLetters('OPEN', 0.13, C.neonCyan, C.neonPinkOff, materials);
      const p2 = new THREE.Vector3(-4.6, 2.2, -0.2).applyMatrix4(diner.lot);
      g2.position.copy(p2); g2.rotation.y = PI; dyn.group.add(g2);
      dyn.neon.push({ letters: g2.userData.letters, light: null, kind: 'open' });
    }
    // motel pylon sign
    {
      const sx = -12.2, sz = 8.4;
      sink.box(C.poleD, sx - 0.5, 0.12, sz - 0.5, 1.0, 0.4, 1.0);
      sink.box(C.pole, sx - 0.14, 0.5, sz - 0.14, 0.28, 12.5, 0.28);
      sink.box(C.signRed, sx - 0.75, 5.2, sz - 0.14, 1.5, 7.6, 0.28);
      sink.box(C.signRed, sx - 2.4, 4.0, sz - 0.14, 4.8, 1.3, 0.28);
      dyn.obstacles.push({ x: sx, z: sz, r: 0.6 });
      const g = new THREE.Group(); g.position.set(sx, 0, sz);
      const letters = [];
      for (const side of [-1, 1]) 'MOTEL'.split('').forEach((ch, i) => {
        const l = W.neonLetters(ch, 0.3, C.neonRed, C.neonRedOff, materials, { depth: 2 });
        l.position.set(0, 11.6 - i * 1.65, side * 0.3 - (side > 0 ? 0 : 0.6)); l.rotation.y = side > 0 ? PI : 0; g.add(l); letters.push(...l.userData.letters);
      });
      const vacL = [];
      for (const side of [-1, 1]) { const vac = W.neonLetters('VACANCY', 0.15, C.neonCyan, C.neonRedOff, materials, { depth: 3 }); vac.position.set(0, 4.3, side * 0.3 - (side > 0 ? 0 : 0.45)); vac.rotation.y = side > 0 ? PI : 0; g.add(vac); vacL.push(...vac.userData.letters); }
      dyn.group.add(g);
      const light = new THREE.PointLight(0xff3030, 60, 20, 2); light.position.set(sx, 8.5, sz - 1.5); dyn.group.add(light);
      const slot = dyn.slot();
      dyn.neon.push({ letters, light, base: 60, kind: 'motel', slot, deadIndex: 2, period: 5 });
      dyn.neon.push({ letters: vacL, light: null, kind: 'vacancy' });
      dyn.glows.push({ pos: [sx, 8.6, sz - 0.5], color: 0xff3030, size: 5.5, slot });
      dyn.glows.push({ pos: [sx, 4.6, sz - 0.5], color: 0x5fe8ff, size: 2.6, slot: -1 });
      dyn.feeds.push(() => [sx, 8.5, sz - 1.5, 0.35 * light.intensity / 60, 1.0, 0.19, 0.19]);
    }
    // pharmacy cross
    {
      const p = new THREE.Vector3(-7.2, 5.0, -0.9).applyMatrix4(pharm.lot);
      sink.box(C.metalD, -7.2, 4.9, -0.9, 0.1, 0.1, 0.9, pharm.lot);
      const mk = (inner) => { const v = new Vox(9, 9, 1); if (inner) { v.box(3, 3, 0, 5, 5, 0, C.neonGreen); } else { v.box(3, 0, 0, 5, 8, 0, C.neonGreen); v.box(0, 3, 0, 8, 5, 0, C.neonGreen); v.box(3, 3, 0, 5, 5, 0, 0); } return v; };
      const outer = voxGroup(mk(false), 0.12, materials, { offset: [-0.54, -0.54, -0.06], castShadow: false });
      const inner = voxGroup(mk(true), 0.12, materials, { offset: [-0.54, -0.54, -0.06], castShadow: false });
      const bg = new Vox(11, 11, 1); bg.box(0, 0, 0, 10, 10, 0, C.crossOff);
      const bgm = voxGroup(bg, 0.12, materials, { offset: [-0.66, -0.66, -0.13], castShadow: false });
      const g = new THREE.Group(); g.position.copy(p); g.rotation.y = PI / 2; g.add(outer, inner, bgm);
      dyn.group.add(g);
      const light = new THREE.PointLight(0x40ff70, 18, 12, 2); light.position.copy(p); light.position.x -= 1; dyn.group.add(light);
      dyn.updaters.push((t) => { const ph = Math.floor(t * 1.6) % 4; outer.visible = ph !== 1; inner.visible = ph !== 3; light.intensity = (outer.visible ? 12 : 0) + (inner.visible ? 6 : 0); });
    }
    // apartment windows: TV + silhouette
    {
      const lot = apts.lot;
      const tv = new Vox(2, 3, 1); tv.box(0, 0, 0, 1, 2, 0, C.glassLitCold);
      const tvm = voxGroup(tv, 0.5, materials, { castShadow: false, cut: true }); tvm.children[0].material = cloneMat(materials.emit);
      tvm.position.copy(new THREE.Vector3(-4.4, apts.GH + apts.FH + 1.0, 0.45).applyMatrix4(lot)); dyn.group.add(tvm);
      dyn.updaters.push((t) => { const n = Math.sin(t * 17.3) * Math.sin(t * 5.1) + Math.sin(t * 31.7) * 0.5; const k = 0.5 + 0.5 * Math.max(0, n); tvm.children[0].material.color.setRGB(0.6 + k * 0.8, 0.7 + k * 0.9, 1.1 + k); });
      const pane = new Vox(2, 3, 1); pane.box(0, 0, 0, 1, 2, 0, C.glassLitWarm);
      const pm = voxGroup(pane, 0.5, materials, { castShadow: false, cut: true });
      const pW = new THREE.Vector3(2.4, apts.GH + apts.FH * 3 + 1.0, 0.45).applyMatrix4(lot);
      pm.position.copy(pW); dyn.group.add(pm);
      const fig = new Vox(3, 6, 1); fig.box(1, 0, 0, 1, 5, 0, C.black); fig.box(0, 1, 0, 2, 3, 0, C.black);
      const fm = voxGroup(fig, 0.22, materials, { offset: [0.12, 0.05, -0.05], castShadow: false, cut: true });
      fm.position.copy(pW); dyn.group.add(fm); fm.visible = false;
      let next = 12, until = 0;
      dyn.updaters.push((t) => { if (!fm.visible && t > next) { fm.visible = true; until = t + rand(3, 7); } if (fm.visible && t > until) { fm.visible = false; next = t + rand(20, 45); } });
    }
    W.fillBlocks(ctx, -10, PI, -24, -54, -1); W.fillBlocks(ctx, -10, PI, 26, 54, 1);
    W.fillBlocks(ctx, 10, 0, -26, -54, -1); W.fillBlocks(ctx, 10, 0, 24, 54, 1);
    W.fillBlocks(ctx, 10, PI / 2, -24, -54, -1, { cross: true }); W.fillBlocks(ctx, 10, PI / 2, 28, 54, 1, { cross: true });
    W.fillBlocks(ctx, -10, -PI / 2, -26, -54, -1, { cross: true }); W.fillBlocks(ctx, -10, -PI / 2, 24, 54, 1, { cross: true });
    { const m = W.mat4(40, 5.5, -9.6, PI); W.voxText(sink, 'BAR', 0.3, C.neonRed, m, C.signBg, 1); const slot = dyn.slot(); dyn.glows.push({ pos: [40, 6.2, -9.0], color: 0xff3030, size: 4, slot }); dyn.updaters.push((t) => { dyn.glowInt[slot] = 0.8 + 0.2 * Math.sin(t * 3.1) * Math.sin(t * 7.7); }); }
    W.voxText(sink, 'HOTEL', 0.5, C.neonCyan, W.mat4(-9.7, 9, 44, -PI / 2), C.signBg, 1);
    dyn.glows.push({ pos: [-9.2, 10, 44], color: 0x5fe8ff, size: 5, slot: -1 });
    cornerLamps(ctx, [true, true, false, false]);
    W.intersectionDressing(ctx, {});
    W.placeCar(ctx, W.carVox(W.carPal(0x3a5a48, 0x2a3a30)), -15.5, 4.3, 0);
    W.placeCar(ctx, W.carVox(W.carPal(0x6a1f24, 0x3a1416), 'pickup'), 14.5, -4.3, PI);
    W.placeCar(ctx, W.carVox(W.carPal(0x8a8a80, 0x4a4a44), 'van'), 4.0, -17, PI);
    W.placeCar(ctx, W.carVox(W.carPal(0x2a3a5a, 0x1a2436)), -4.0, 16, 0);
    W.placeCar(ctx, W.carVox(W.carPal(0xb8b0a0, 0x5a5650)), -28, -4.2, PI + 0.15);
    W.placeCar(ctx, W.carVox(W.carPal(0x5a4a2a, 0x2a2418)), -22.6, -3.0, -PI / 2 - 0.4, { extraM: new THREE.Matrix4().makeRotationX(-0.35) });
    W.policeCar(ctx, 20.5, -1.0, -1.05);
    W.sawhorse(sink, 23.5, -4.5, -0.1, 'ROAD CLOSED', dyn); W.sawhorse(sink, 24.0, 2.5, 0.15, null, dyn);
    W.trafficCone(sink, 22.5, 4.8); W.trafficCone(sink, 21.8, -6.5); W.trafficCone(sink, 25.5, -0.5);
    {
      const v = W.busVox();
      const m = W.mat4(0.6, 0, 26.5, PI / 2 + 0.12, PI / 2 - 0.05).multiply(new THREE.Matrix4().makeTranslation(-1.2, -1.2, -5.2));
      sink.vox(v, 0.2, m, {});
      for (let k = -4.5; k <= 4.5; k += 1.5) dyn.obstacles.push({ x: 0.6 + Math.sin(PI / 2 + 0.12) * k, z: 26.5 + Math.cos(PI / 2 + 0.12) * k, r: 2.0 });
      for (let i = 0; i < 6; i++) W.oilDrum(sink, rand(-5, 5), rand(21, 24), chance(0.5));
      W.trafficCone(sink, -3, 20.5); W.trafficCone(sink, 3.5, 20.8);
    }
    const fence = W.fenceLine(ctx, -9.5, 9.5, -22.5, { gate: [-1.9, 1.9] });
    W.sawhorse(sink, 0, -20.5, 0.05, 'ROAD CLOSED', dyn);
    W.oilDrum(sink, -6.5, -21, false); W.oilDrum(sink, 6.8, -21.4, true);
    W.trafficCone(sink, -4, -20); W.trafficCone(sink, 4.5, -19.5);
    W.chasmPit(ctx);
    W.hydrant(sink, 13.2, 7.0, dyn); W.mailbox(sink, -13.5, -7.2, 0, dyn);
    W.trashCan(sink, 11.5, -7.5, dyn); W.trashCan(sink, -7.6, 12.5, dyn); W.trashCan(sink, 7.4, 13.5, dyn, false);
    W.newspaperBox(sink, -11.8, -7.0, 0, C.paperbox, dyn); W.newspaperBox(sink, -11.0, -7.0, 0, C.mailbox, dyn);
    W.bench(sink, 16, 8.6, PI); W.bench(sink, -16, -8.6, 0);
    W.busShelter(ctx, -21, 8.3);
    W.phoneBooth(ctx, 7.4, 7.6);
    W.dumpster(ctx, -25.2, -14, PI / 2);
    W.shoppingCart(ctx, -9.5, 5.2, 0.6);
    W.stopSign(ctx, 9.3, 9.6, 0.4);
    return { fence };
  },
  setup(game) {
    const { built } = game;
    let pages = 0;
    const gotPage = () => {
      pages++;
      if (pages < 3) game.setObjective(`Temukan catatan Tomas di blok ini (${pages}/3)`);
      else { game.setObjective('Semua telepon berdering. Angkat telepon di boks.'); game.ring(true); game.watcherNow(); }
    };
    game.setObjective('Temukan catatan Tomas di blok ini (0/3)');
    const hint = () => { if (pages < 3) { game.toast('Where would he wait for a call? The shelter bench. The phone booth step. The motel office door.', 8); game.after(75, hint); } };
    game.after(60, hint);
    game.addItem({ kind: 'page', x: -20.3, z: 8.45, y: 0.6, approach: [-20.3, 7.6], onUse: (g) => { g.note('p1'); gotPage(); } });
    game.addItem({ kind: 'page', x: 6.1, z: 6.2, y: 0.14, onUse: (g) => { g.note('p2'); gotPage(); g.watcherNow(); } });
    game.addItem({ kind: 'page', x: -14.0, z: 9.0, y: 0.14, onUse: (g) => { g.note('p3'); gotPage(); } });
    game.addItem({ kind: 'battery', x: 17.5, z: -5.2, onUse: (g) => g.battery(45) });
    game.addItem({ kind: 'battery', x: -12.6, z: -6.4, y: 0.14, onUse: (g) => g.battery(45) });
    // the phone booth: interactable once the pages are found
    game.addInteract({ x: 7.4, z: 7.6, r: 1.4, label: 'phone', approach: [6.2, 7.6], onUse: (g) => {
      if (pages < 3) { g.toast('The line is dead. Only breathing, and water.'); return; }
      g.ring(false);
      g.call('c1', () => {
        g.setObjective('Ke utara. Stasiun Pompa 2.');
        g.openGate(built.fence);
        g.addWalk({ x0: -3.5, x1: 3.5, z0: -30, z1: -19 });
        g.exitAt({ x0: -4, x1: 4, z0: -32, z1: -27 });
        g.hollowsMax(1); g.hollowSoon();
      });
    } });
  },
};

// ================================================================ chapter 2
const ch2 = {
  id: 'lowwater', title: 'Air Surut', subtitle: 'Jalan Kedua terendam sejak April. Nyalakan pompa untuk mengeringkannya.',
  fog: 0x0a1014, spawn: [0, 17], camYaw: 0.35, flood: 1, ambient: 1.55,
  walk: [{ x0: -19.5, x1: 19.5, z0: -9.4, z1: 9.4 }, { x0: -8.6, x1: 8.6, z0: -18.5, z1: 19.8 }],
  hollows: { max: 3, interval: 18, points: [[-18, -7], [-18, 6], [4, -17], [-4, -17], [18, 7], [-4, 18]] },
  town: { waterTower: false },
  build(ctx) {
    CHASM.on = false;
    const { sink, dyn, materials } = ctx;
    // corner buildings: storage warehouse, pump station, garage, bait shop
    const wh = W.building(sink, { cx: -19, cz: -10, ry: PI, w: 18, d: 16, floors: 3, style: 'dark', seed: 21, side: 'xlo', store: { name: 'VESPER STORAGE', shutter: true }, darkRate: 0.95 });
    W.drainPipe(sink, wh.lot, -8.6, wh.height);
    const pump = W.pumpHouse(ctx, 24, -10, PI);
    const garage = W.building(sink, { cx: 18, cz: 10, ry: 0, w: 16, d: 14, floors: 2, style: 'concrete', seed: 23, side: 'xlo', store: { name: 'AUTO BODY', shutter: true }, darkRate: 0.9 });
    W.drainPipe(sink, garage.lot, 7.6, garage.height);
    const bait = W.building(sink, { cx: -17, cz: 10, ry: 0, w: 14, d: 12, floors: 2, style: 'green', seed: 24, side: 'xhi', store: { name: 'BAIT AND TACKLE', pane: C.glassLitDim, awning: [C.awnG, C.awnB], doorX: 2, signCol: C.neonCyan }, darkRate: 0.85 });
    { const bp = new THREE.Vector3(0, 4.2, -1.2).applyMatrix4(bait.lot); const bl = new THREE.PointLight(0x5fe8ff, 40, 16, 2); bl.position.copy(bp); dyn.group.add(bl); const slot = dyn.slot(); dyn.glows.push({ pos: [bp.x, bp.y, bp.z + 0.6], color: 0x5fe8ff, size: 4, slot }); dyn.feeds.push(() => [bp.x, bp.y, bp.z, 0.35, 0.37, 0.91, 1.0]); }
    // the school bus still has its cabin lights on
    { const bl = new THREE.PointLight(0xffd090, 45, 12, 2); bl.position.set(-22.5, 2.2, 4); dyn.group.add(bl); const slot = dyn.slot(); dyn.glows.push({ pos: [-22.5, 2.4, 4], color: 0xffd090, size: 3.5, slot }); dyn.feeds.push(() => [-22.5, 2.2, 4, 0.4, 1.0, 0.82, 0.56]); dyn.updaters.push((t) => { const k = sputterLite(t); bl.intensity = 45 * k; dyn.glowInt[slot] = k; }); }
    W.fillBlocks(ctx, -10, PI, -28, -54, -1, { names: ['FEED', 'ICE', 'TIRES'] }); W.fillBlocks(ctx, -10, PI, 30, 54, 1);
    W.fillBlocks(ctx, 10, 0, -24, -54, -1); W.fillBlocks(ctx, 10, 0, 26, 54, 1);
    W.fillBlocks(ctx, 10, PI / 2, -18, -54, -1, { cross: true }); W.fillBlocks(ctx, 10, PI / 2, 24, 54, 1, { cross: true });
    W.fillBlocks(ctx, -10, -PI / 2, -26, -54, -1, { cross: true }); W.fillBlocks(ctx, -10, -PI / 2, 22, 54, 1, { cross: true });
    cornerLamps(ctx, [false, true, true, false]);
    W.intersectionDressing(ctx, { steam: false });
    // stalled cars in the water, two with lights still on
    W.placeCar(ctx, W.carVox(W.carPal(0x2a3a5a, 0x1a2436, true)), -12, -2.5, PI * 0.42, { headlights: 110 });
    W.placeCar(ctx, W.carVox(W.carPal(0x8a8a80, 0x4a4a44), 'van'), -5, 4.5, PI + 0.5);
    W.placeCar(ctx, W.carVox(W.carPal(0x6a1f24, 0x3a1416)), 9, 3.5, -0.4);
    W.placeCar(ctx, W.carVox(W.carPal(0xb8b0a0, 0x5a5650, true)), 14, -4.5, PI * 0.9, { headlights: 90 });
    W.placeCar(ctx, W.carVox(W.carPal(0x3a5a48, 0x2a3a30)), 2, -14, 0.2);
    // utility truck with the valve wheel in its bed
    W.placeCar(ctx, W.carVox(W.carPal(0xd8641e, 0x6a3a1a), 'pickup'), -7, -4.8, PI * 0.5);
    // school bus blocking the west end
    { const v = W.busVox({ body: 0xd8b02a, stripe: 0x2a2a2a, lit: true }); sink.vox(v, 0.2, W.mat4(-23, 0, 4, PI / 2 + 0.15).multiply(new THREE.Matrix4().makeTranslation(-1.2, 0, -5.2)), { noBottom: true }); for (let k = -5; k <= 5; k += 1.5) dyn.obstacles.push({ x: -23 + Math.sin(PI / 2 + 0.15) * k, z: 4 + Math.cos(PI / 2 + 0.15) * k, r: 1.9 }); }
    // sandbag walls and barriers
    W.sandbagWall(ctx, -9, 6.2, 0, 10); W.sandbagWall(ctx, 9, 6.2, 0, 10);
    W.sandbagWall(ctx, 0, 20.5, 0, 14, 4);
    W.sandbagWall(ctx, 21.5, -2, PI / 2, 16, 4);
    for (let i = 0; i < 5; i++) W.oilDrum(sink, rand(-6, 6), rand(21.5, 23.5), chance(0.4));
    W.fenceLine(ctx, -9.5, 9.5, -21.5, {});
    W.sawhorse(sink, -2, -19.5, 0.1, 'ROAD CLOSED', dyn);
    // fallen pole, live wire in the water
    const spark = W.fallenPole(ctx, 10.5, -8.8, 2.35);
    W.trashCan(sink, -12.5, 7.6, dyn); W.hydrant(sink, 12.6, -7.0, dyn);
    W.busShelter(ctx, 15, -8.3, { poster: 'MISSING' });
    W.shoppingCart(ctx, 3, 7.4, 1.2);
    W.stopSign(ctx, -9.3, -9.6, 2.5, 0.35);
    W.dumpster(ctx, -27, 14, -PI / 2);
    return { pump, spark };
  },
  setup(game) {
    const { built } = game;
    game.setObjective('Capai Stasiun Pompa 2 di ujung timur jalan.');
    game.addHazard({ x: built.spark.x, z: built.spark.z, r: 2.3 });
    game.addItem({ kind: 'page', x: 11.0, z: 5.8, y: 0.06, onUse: (g) => g.note('p4') });
    game.addItem({ kind: 'page', x: -5.5, z: 6.0, y: 0.9, onUse: (g) => g.note('p5') });
    game.addItem({ kind: 'battery', x: -16, z: -7.5, y: 0.14, onUse: (g) => g.battery(45) });
    game.addItem({ kind: 'battery', x: 4.2, z: 15, onUse: (g) => g.battery(45) });
    game.addItem({ kind: 'battery', x: 16.2, z: 7.6, y: 0.14, onUse: (g) => g.battery(45) });
    let hasValve = false, fitted = false;
    const valve = game.addItem({ kind: 'valve', x: -7.9, z: -3.4, y: 0.9, label: 'valve wheel', onUse: (g) => { hasValve = true; g.give('valve'); g.setObjective('Pasang roda katup di Stasiun 2.'); g.hollowSoon(); } });
    valve.hidden = true;
    game.addTrigger({ x0: 12, x1: 21, z0: -9.5, z1: -3, once: true, onEnter: (g) => {
      g.setObjective('Roda katup hilang. Cari di truk servis.'); valve.hidden = false; g.showItem(valve); g.hollowsMax(3); g.hollowSoon();
    } });
    game.addInteract({ x: built.pump.valvePos.x, z: built.pump.valvePos.z, r: 1.3, label: 'outflow valve', approach: [built.pump.valvePos.x - 1.1, built.pump.valvePos.z + 0.6], onUse: (g) => {
      if (fitted) return;
      if (!hasValve) { g.toast('The valve stem is bare. The wheel is gone.'); return; }
      fitted = true;
      g.toast('The wheel bites. Somewhere below, a pump coughs and starts.');
      g.sfx.gate(); g.sfx.drain();
      g.powerFlood(built.pump.flood);
      g.setFlood(0, 22);
      g.setObjective('Air mulai surut. Ikuti jalan ke timur.');
      g.after(9, () => { g.ring(true); g.setObjective('Telepon stasiun berdering.'); });
      g.hollowsMax(4); g.hollowSoon();
    } });
    game.addInteract({ x: built.pump.doorPos.x, z: built.pump.doorPos.z, r: 1.4, label: 'station phone', approach: [built.pump.doorPos.x, built.pump.doorPos.z + 1.0], onUse: (g) => {
      if (!fitted) { g.toast('Locked. Through the window: a phone on the wall, off the hook.'); return; }
      g.ring(false);
      g.call('c2', () => {
        g.setObjective('Ke timur. Rumah sakit.');
        g.addWalk({ x0: 19, x1: 32, z0: -5, z1: 5 });
        g.exitAt({ x0: 28, x1: 34, z0: -6, z1: 6 });
      });
    } });
  },
};

// ================================================================ chapter 3
const ch3 = {
  id: 'memorial', title: 'Rumah Sakit Vesper', subtitle: 'Catatan terakhir Tomas ada di lantai tiga dan di kapel.',
  fog: 0x0b0e14, spawn: [0, 17], camYaw: 0.1, flood: 0, ambient: 1.35,
  walk: [{ x0: -19.5, x1: 19.5, z0: -9.4, z1: 9.4 }, { x0: -8.6, x1: 8.6, z0: -9.4, z1: 19.8 }, { x0: -22.5, x1: -12, z0: 6.5, z1: 9.4 }],
  hollows: { max: 4, interval: 13, points: [[-18, -7], [-18, 6], [18, -7], [18, 6], [-4, 18], [4, 18]] },
  town: { tower: false },
  build(ctx) {
    CHASM.on = false;
    const { sink, dyn, materials } = ctx;
    const hosp = W.hospital(ctx, 0, -10, PI, materials);
    const chap = W.chapel(ctx, -18, 10, 0, materials);
    const apts = W.building(sink, { cx: 18, cz: 10, ry: 0, w: 16, d: 16, floors: 5, style: 'brick', seed: 31, side: 'xlo', store: { name: 'FLOWERS', pane: C.darkGlass, doorX: 3 }, darkRate: 0.9 });
    W.fireEscape(sink, apts.lot, 3.5, 5, apts.GH, apts.FH, apts.height);
    W.fillBlocks(ctx, -10, PI, -19, -54, -1); W.fillBlocks(ctx, -10, PI, 19, 54, 1);
    W.fillBlocks(ctx, 10, 0, -25, -54, -1); W.fillBlocks(ctx, 10, 0, 26, 54, 1);
    W.fillBlocks(ctx, 10, PI / 2, 26, 54, 1, { cross: true }); W.fillBlocks(ctx, -10, -PI / 2, 24, 54, 1, { cross: true });
    cornerLamps(ctx, [false, false, true, true]);
    W.intersectionDressing(ctx, { trafficLight: false, crows: false, steam: false });
    W.fountain(ctx, 0, 1);
    W.ambulance(ctx, -8, -5.5, PI * 0.62, true);
    W.ambulance(ctx, 7, -6.2, PI * 1.3, false);
    W.placeCar(ctx, W.carVox(W.carPal(0x2a2a2e, 0x141416), 'van'), 14, 3.5, PI * 0.55);
    W.placeCar(ctx, W.carVox(W.carPal(0xb8b0a0, 0x5a5650)), -14, 4.2, 0.1);
    W.wheelchair(ctx, -4, -6.8, 0.3); W.wheelchair(ctx, 5, 6.5, 2.1, true); W.wheelchair(ctx, -12, -2, 1.0); W.wheelchair(ctx, 12, -7.5, -0.5, true);
    W.gurney(ctx, 8.5, 5.0, 0.4); W.gurney(ctx, -6, 6.8, PI * 0.5); W.gurney(ctx, 3.5, -7.6, PI * 0.15);
    W.ivStand(ctx, -3.2, -7.6); W.ivStand(ctx, 9.8, 5.9); W.ivStand(ctx, -8.4, 7.2); W.ivStand(ctx, 2.2, 12.5);
    W.sandbagWall(ctx, 20.5, 0, PI / 2, 14, 4); W.sandbagWall(ctx, -20.5, 0, PI / 2, 14, 4);
    W.fenceLine(ctx, -9.5, 9.5, 21.5, {});
    W.sawhorse(sink, 0, 19.8, 0.05, 'ROAD CLOSED', dyn);
    W.trafficCone(sink, -5, 18.5); W.trafficCone(sink, 6, 19);
    W.trashCan(sink, -12.5, 7.6, dyn); W.hydrant(sink, 12.6, 7.0, dyn);
    W.dumpster(ctx, 26, -14, PI / 2);
    return { hosp, chap };
  },
  setup(game) {
    const { built } = game;
    game.setObjective('Cari Tomas. Lantai tiga, lalu kapel.');
    game.hollowsMax(3); game.hollowSoon(4);
    game.addItem({ kind: 'page', x: -12.3, z: -1.6, y: 0.55, onUse: (g) => g.note('p6') });
    game.addItem({ kind: 'page', x: 1.85, z: 2.85, y: 0.85, approach: [2.55, 3.55], onUse: (g) => g.note('p7') });
    game.addItem({ kind: 'battery', x: -13.5, z: -6.8, y: 0.14, onUse: (g) => g.battery(45) });
    game.addItem({ kind: 'battery', x: 12.8, z: 6.2, y: 0.14, onUse: (g) => g.battery(45) });
    let hasKey = false, opened = false;
    game.addItem({ kind: 'key', x: 8.2, z: 5.2, y: 1.0, label: 'brass key', onUse: (g) => { hasKey = true; g.give('key'); g.setObjective('Kapel di sudut jalan. Kuncinya sudah didapat.'); g.hollowsMax(5); g.hollowSoon(); } });
    game.addInteract({ x: built.hosp.doorPos.x, z: built.hosp.doorPos.z, r: 1.8, label: 'emergency entrance', approach: [built.hosp.doorPos.x, built.hosp.doorPos.z + 1.6], onUse: (g) => {
      g.toast(hasKey ? 'Chained from inside. Wet footprints lead back out.' : 'Chained from inside. Someone left a key on the gurney outside.');
      g.setObjective(hasKey ? 'Kapel di sudut jalan.' : 'Rumah sakit dirantai. Cari di garasi ambulans.');
    } });
    game.addInteract({ x: built.chap.doorPos.x, z: built.chap.doorPos.z, r: 1.7, label: 'chapel door', approach: [built.chap.doorPos.x, built.chap.doorPos.z - 0.2], onUse: (g) => {
      if (opened) return;
      if (!hasKey) { g.toast('Locked. Organ music, very faint, from inside.'); return; }
      opened = true;
      g.sfx.gate();
      built.chap.doorMat.color.setScalar(1.0); built.chap.light.intensity = 40; g.dyn.glowInt[built.chap.slot] = 1;
      g.toast('The door swings in. Light, and the smell of the reservoir.');
      g.setObjective('Telepon dinding di samping pintu berdering.');
      g.ring(true);
      g.hollowsMax(6); g.hollowSoon(1);
    } });
    game.addInteract({ x: built.chap.phonePos.x, z: built.chap.phonePos.z, r: 1.6, label: 'wall phone', approach: [built.chap.phonePos.x + 0.2, built.chap.phonePos.z - 0.9], onUse: (g) => {
      if (!opened) { g.toast('A wall phone, receiver on the hook. Silent.'); return; }
      g.ring(false);
      const all = g.pagesRead.size >= 7;
      g.call(all ? 'c3' : 'c3b', () => g.ending(all));
    } });
  },
};

export const CHAPTERS = [ch1, ch2, ch3];
