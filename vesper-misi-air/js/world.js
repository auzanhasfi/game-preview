// World construction: procedural voxel buildings, street furniture, vehicles,
// signs and dynamic objects. Chapters (levels.js) compose these builders into
// a scene through buildWorld(materials, spec).
import * as THREE from 'three';
import { Vox, P, E, Sink, voxGroup, palette, cloneMat } from './voxel.js';
import { rand, randInt, pick, chance, hash3, textWidth, clamp, lerp, damp } from './util.js';
import { CHASM } from './ground.js';
import { makeBeam } from './effects.js';

const TAU = Math.PI * 2;

export function mat4(x, y, z, ry = 0, rz = 0, rx = 0) {
  const m = new THREE.Matrix4();
  const e = new THREE.Euler(rx, ry, rz, 'YXZ');
  m.makeRotationFromEuler(e);
  m.setPosition(x, y, z);
  return m;
}

// ---------------------------------------------------------------- palettes
export const C = {
  darkGlass: P(0x0d1015, 'shiny', 0.0), glassLitWarm: E(0xffc48a, 1.1), glassLitCold: E(0xa9c4e6, 0.9), glassLitDim: E(0x8a6a44, 0.55), glassGreen: E(0xb8f0c8, 0.6),
  roof: P(0x232326, 'matte', 0.05), roofB: P(0x2b2b2e, 'matte', 0.05), tank: P(0x5a4638, 'matte', 0.06), tankTop: P(0x4a3a2e, 'matte', 0.05), ac: P(0x6a6c6e, 'matte', 0.05), pipe: P(0x3b3b3d, 'matte', 0.04),
  door: P(0x3a2a20, 'matte', 0.05), doorDark: P(0x1e1a16, 'matte', 0.04), shutter: P(0x55555a, 'matte', 0.03), shutterB: P(0x47474b, 'matte', 0.03),
  awnA: P(0x7a2a2a, 'matte', 0.05), awnB: P(0xb9b0a0, 'matte', 0.05), awnG: P(0x2c4a3a, 'matte', 0.05), awnBl: P(0x2a3a5a, 'matte', 0.05),
  signBg: P(0x1a1a1c, 'matte', 0.02), signWhite: P(0xd8d8d0, 'matte', 0.03), signRed: P(0x8a2a22, 'matte', 0.03),
  pole: P(0x3a3b3f, 'shiny', 0.03), poleD: P(0x2b2c2f, 'matte', 0.03), concrete: P(0x6a6a66, 'matte', 0.05), wood: P(0x5a4632, 'matte', 0.08), woodD: P(0x3d2f22, 'matte', 0.06),
  metal: P(0x707478, 'shiny', 0.04), metalD: P(0x45484c, 'shiny', 0.04), rust: P(0x5a3a22, 'matte', 0.1), black: P(0x121214, 'matte', 0.03), tire: P(0x141416, 'matte', 0.04), hub: P(0x8a8a8a, 'shiny', 0.03), chrome: P(0x9a9ca0, 'shiny', 0.02),
  white: P(0xcfcfc8, 'matte', 0.03), yellow: P(0xd6a52a, 'matte', 0.04), orange: P(0xd8641e, 'matte', 0.04), red: P(0x8a1e1e, 'matte', 0.04), blue: P(0x24406a, 'matte', 0.04), green: P(0x2f5a3a, 'matte', 0.04),
  hydrant: P(0x9a2a22, 'shiny', 0.05), mailbox: P(0x2a4a7a, 'matte', 0.05), trash: P(0x3a3f3a, 'matte', 0.05), bag: P(0x1a1c1e, 'shiny', 0.06), paperbox: P(0x8a2a2a, 'matte', 0.05),
  rock: P(0x2a2622, 'matte', 0.12), rockD: P(0x141210, 'matte', 0.1), rebar: P(0x4a3a2a, 'matte', 0.06),
  headlight: E(0xfff4d0, 3), taillight: E(0xff3020, 1.2), lampLens: E(0xffc070, 4), lampLensOff: P(0x6a6050, 'shiny', 0.02), lampLensCold: E(0xd8e8ff, 4),
  neonPink: E(0xff5fa0, 4.5), neonPinkOff: P(0x5a2a3a, 'shiny', 0), neonRed: E(0xff2a2a, 4.2), neonRedOff: P(0x4a1a1a, 'shiny', 0), neonCyan: E(0x5fe8ff, 3.5), neonGreen: E(0x40ff70, 3.5), neonBlue: E(0x4a7cff, 4),
  crossOff: P(0x1a3a24, 'matte', 0), tlHousing: P(0x3a3a20, 'matte', 0.04), tlRed: E(0xff2020, 5), tlRedOff: P(0x3a1010, 'shiny', 0), tlAmberOff: P(0x3a2a08, 'shiny', 0), tlGreenOff: P(0x0a3018, 'shiny', 0),
  policeRed: E(0xff2030, 6), policeBlue: E(0x2050ff, 6), booth: P(0x8a8e94, 'shiny', 0.03), boothGlass: P(0x9fb8c8, 'glass', 0), fluor: E(0xd8f0ff, 3),
  skin: P(0xc9a184, 'matte', 0.03), crow: P(0x0c0c10, 'matte', 0.05), poster: P(0xb8b0a0, 'matte', 0.03), posterInk: P(0x1a1a1a, 'matte', 0),
  bench: P(0x4a3826, 'matte', 0.07), benchIron: P(0x2a2a2e, 'matte', 0.03), cone: P(0xd8541e, 'matte', 0.04), coneW: P(0xd8d8d0, 'matte', 0.02), drum: P(0x2a4a3a, 'matte', 0.08), drumR: P(0x5a3a22, 'matte', 0.1),
  sandbag: P(0x7a6a4a, 'matte', 0.1), sandbagD: P(0x5a4d36, 'matte', 0.1), spark: E(0xbfe0ff, 6), ambWhite: P(0xe0e0d8, 'shiny', 0.02), ambRed: P(0xb02020, 'shiny', 0.02), ambStripe: P(0xd8a020, 'matte', 0.02),
  sheet: P(0xd8d8d0, 'matte', 0.04), sheetD: P(0xb0b0a8, 'matte', 0.04), steel: P(0x9a9ea4, 'shiny', 0.03), stone: P(0x6a685f, 'matte', 0.07), stoneD: P(0x4a4840, 'matte', 0.07), basin: P(0x3a4a48, 'matte', 0.05),
  brass: P(0xb08a3a, 'shiny', 0.03), paper: E(0xfff2d8, 0.9), paperInk: P(0x2a2622, 'matte', 0), battery: P(0x2a2a2e, 'shiny', 0.03), batteryBand: E(0xffd040, 0.9), batteryCap: P(0xb08a3a, 'shiny', 0.03), valve: P(0xa02a22, 'shiny', 0.04),
  chapelWood: P(0x3a2818, 'matte', 0.07), chapelLight: E(0xffd8a0, 1.6), moss: P(0x3a4a2a, 'matte', 0.1),
};

const STYLES = {
  brick: { wall: 0x4a2c24, wall2: 0x3f2520, trim: 0x6b5a4a, sill: 0x7a7060 },
  brick2: { wall: 0x5a3a2c, wall2: 0x4e3226, trim: 0x77685a, sill: 0x8a8070 },
  concrete: { wall: 0x55554f, wall2: 0x4c4c47, trim: 0x66665f, sill: 0x707068 },
  plaster: { wall: 0x5e5c48, wall2: 0x545240, trim: 0x7a7860, sill: 0x807e66 },
  green: { wall: 0x3f4a42, wall2: 0x384139, trim: 0x59665a, sill: 0x6f7a6c },
  dark: { wall: 0x2c2d33, wall2: 0x26272c, trim: 0x3d3e46, sill: 0x4a4b53 },
  stone: { wall: 0x5a5852, wall2: 0x504e48, trim: 0x6e6c64, sill: 0x807e76 },
  hospital: { wall: 0x8a8e88, wall2: 0x7e827c, trim: 0x9a9e98, sill: 0xa8aca6 },
};
const styleCache = new Map();
function stylePal(name) {
  if (styleCache.has(name)) return styleCache.get(name);
  const s = STYLES[name];
  const p = { wall: P(s.wall, 'matte', 0.07), wall2: P(s.wall2, 'matte', 0.07), trim: P(s.trim, 'matte', 0.04), sill: P(s.sill, 'matte', 0.03) };
  styleCache.set(name, p); return p;
}

// ---------------------------------------------------------------- buildings
// Builds one building. Front facade faces local -Z. Returns info for follow-up detail.
export function building(sink, o) {
  const vs = o.lod ? 1 : 0.5;
  const M = o.lod ? 1 : 3;                        // front margin (voxels) for protrusions
  const W = Math.round(o.w / vs), D = Math.round(o.d / vs);
  const FH = Math.round((o.floorH || 3) / vs);
  const GH = Math.round((o.store ? 4 : (o.floorH || 3)) / vs);
  const floors = o.floors;
  const H = GH + (floors - 1) * FH + 1;
  const st = stylePal(o.style);
  const v = new Vox(W, H + 1, D + M);
  v.box(0, 0, M, W - 1, H - 1, D + M - 1, st.wall);
  if (!o.lod) for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) if (hash3(x, y, o.seed || 1) < 0.18) v.set(x, y, M, st.wall2);
  v.box(1, H - 1, M + 1, W - 2, H - 1, D + M - 2, 0);
  v.box(1, H - 2, M + 1, W - 2, H - 2, D + M - 2, hash3(o.seed | 0, 3, 3) < 0.5 ? C.roof : C.roofB);
  if (!o.lod) v.box(0, H - 1, M, W - 1, H - 1, M, st.trim);
  const windows = [];
  const litPick = () => { const r = rand(); const dark = o.lod ? 0.93 : (o.darkRate ?? 0.8); return r < dark ? C.darkGlass : r < dark + 0.1 ? (o.litPane || C.glassLitWarm) : r < dark + 0.15 ? C.glassLitCold : C.glassLitDim; };
  const ww = Math.max(1, Math.round((o.winW || 1) / vs)), wh = Math.max(2, Math.round(1.5 / vs));
  const spacing = Math.round((o.winSpacing || 2.6) / vs);
  const startFloor = o.store ? 1 : 0;
  for (let f = startFloor; f < floors; f++) {
    const y0 = (f === 0 ? 0 : GH + (f - 1) * FH) + Math.round(1 / vs);
    for (let x = Math.round(1.2 / vs); x + ww <= W - Math.round(1.2 / vs); x += spacing) {
      if (o.windowSkip && hash3(x, f, o.seed | 0) < o.windowSkip) continue;
      const pane = o.paneOverride ? o.paneOverride(f, x) : litPick();
      v.box(x, y0, M, x + ww - 1, y0 + wh - 1, M, 0);
      v.box(x, y0, M + 1, x + ww - 1, y0 + wh - 1, M + 1, pane);
      if (!o.lod) { v.box(x, y0 - 1, M - 1, x + ww - 1, y0 - 1, M, st.sill); }
      windows.push({ f, x, y0, pane, side: 'front' });
    }
  }
  if (o.side) {
    const xs = o.side === 'xlo' ? 0 : W - 1, xin = o.side === 'xlo' ? 1 : W - 2;
    for (let f = startFloor; f < floors; f++) {
      const y0 = (f === 0 ? 0 : GH + (f - 1) * FH) + Math.round(1 / vs);
      for (let z = M + Math.round(1.5 / vs); z + ww <= D + M - Math.round(1.2 / vs); z += spacing) {
        const pane = litPick();
        v.box(xs, y0, z, xs, y0 + wh - 1, z + ww - 1, 0);
        v.box(xin, y0, z, xin, y0 + wh - 1, z + ww - 1, pane);
        if (!o.lod) v.box(xs, y0 - 1, z, xs, y0 - 1, z + ww - 1, st.sill);
      }
    }
  }
  if (o.store && !o.lod) {
    const s = o.store;
    const gy0 = Math.round(0.5 / vs), gy1 = Math.round(3 / vs) - 1;
    if (s.shutter) {
      for (let y = 0; y <= gy1; y++) v.box(Math.round(0.6 / vs), y, M, W - 1 - Math.round(0.6 / vs), y, M, y % 2 ? C.shutter : C.shutterB);
    } else {
      const pane = s.pane || C.darkGlass;
      v.box(Math.round(0.8 / vs), gy0, M, W - 1 - Math.round(0.8 / vs), gy1, M, 0);
      v.box(Math.round(0.8 / vs), gy0, M + 1, W - 1 - Math.round(0.8 / vs), gy1, M + 1, pane);
      for (let x = Math.round(0.8 / vs); x < W - Math.round(0.8 / vs); x += Math.round(2 / vs)) v.box(x, gy0, M, x, gy1, M, st.trim);
      v.box(Math.round(0.8 / vs), gy0 - 1, M, W - 1 - Math.round(0.8 / vs), gy0 - 1, M, st.sill);
    }
    const dx = s.doorX !== undefined ? Math.round(s.doorX / vs) : Math.round(W / 2) - 1;
    const dw = Math.round((s.doorW || 1.6) / vs), dh = Math.round(2.6 / vs);
    v.box(dx, 0, M, dx + dw - 1, dh - 1, M + 1, 0);
    v.box(dx, 0, M + 2, dx + dw - 1, dh - 1, M + 2, s.doorPane || C.door);
    v.box(dx, dh, M, dx + dw - 1, dh, M, st.trim);
    if (s.awning) {
      const ay = Math.round(3.2 / vs);
      for (let x = Math.round(0.4 / vs); x < W - Math.round(0.4 / vs); x++) v.box(x, ay, M - 2, x, ay, M - 1, (x % 2 ? s.awning[0] : s.awning[1]));
      v.box(Math.round(0.4 / vs), ay - 1, M - 2, W - 1 - Math.round(0.4 / vs), ay - 1, M - 2, C.pipe);
    }
    if (s.name) {
      const tw = textWidth(s.name);
      const sy = Math.round(3.6 / vs);
      const sx = Math.max(1, Math.round(W / 2 - tw / 2) - 1);
      v.box(sx - 1, sy - 1, M - 1, sx + tw, sy + 5, M - 1, s.signBg || C.signBg);
      v.text(s.name, sx, sy, M - 2, s.signCol || C.signWhite);
    }
  }
  if (o.lod && o.store) v.box(1, 0, M, W - 2, Math.round(3 / vs) - 1, M, C.darkGlass);
  if (!o.lod && o.roof !== false) {
    const rz0 = M + 2, rz1 = D + M - 3, ry = H - 2;
    if (chance(0.45) && W > 14 && D > 14) {
      const tx = randInt(3, W - 10), tz = randInt(rz0 + 1, rz1 - 7);
      for (const [lx, lz] of [[0, 0], [5, 0], [0, 5], [5, 5]]) v.box(tx + lx, ry + 1, tz + lz, tx + lx, ry + 3, tz + lz, C.pipe);
      v.box(tx, ry + 4, tz, tx + 5, ry + 9, tz + 5, C.tank);
      for (const [cx, cz] of [[0, 0], [5, 0], [0, 5], [5, 5]]) v.box(tx + cx, ry + 4, tz + cz, tx + cx, ry + 9, tz + cz, 0);
      v.box(tx + 1, ry + 10, tz + 1, tx + 4, ry + 10, tz + 4, C.tankTop);
      v.box(tx + 2, ry + 11, tz + 2, tx + 3, ry + 11, tz + 3, C.tankTop);
    }
    const nAc = randInt(0, 3);
    for (let i = 0; i < nAc; i++) { const ax = randInt(2, W - 5), az = randInt(rz0, rz1 - 2); v.box(ax, ry + 1, az, ax + 2, ry + 2, az + 1, C.ac); }
    if (chance(0.6)) { const px = randInt(2, W - 3), pz = randInt(rz0, rz1); v.box(px, ry + 1, pz, px, ry + 4, pz, C.pipe); }
    if (chance(0.5)) { const px = randInt(2, W - 4), pz = randInt(rz0, rz1 - 1); v.box(px, ry + 1, pz, px + 1, ry + 3, pz + 1, st.trim); }
  }
  const m = new THREE.Matrix4().multiplyMatrices(mat4(o.cx, 0, o.cz, o.ry), new THREE.Matrix4().makeTranslation(-W * vs / 2, 0, -M * vs));
  sink.cutFlag = 1;
  sink.vox(v, vs, m, { noBottom: true, ao: o.lod ? 0.5 : 1 });
  sink.cutFlag = 0;
  return { W, H, D, vs, M, m, lot: mat4(o.cx, 0, o.cz, o.ry), height: H * vs, windows, GH, FH };
}

export function fireEscape(sink, lot, u, floors, GH, FH, height) {
  sink.cutFlag = 1;
  const w = 2.8;
  for (let f = 1; f < floors; f++) {
    const y = GH + (f - 1) * FH + 0.05;
    sink.box(C.metalD, u - w / 2, y, -1.0, w, 0.06, 1.0, lot);
    sink.box(C.metalD, u - w / 2, y, -1.0, w, 0.95, 0.04, lot);
    sink.box(C.metalD, u - w / 2, y, -1.0, 0.04, 0.95, 1.0, lot);
    sink.box(C.metalD, u + w / 2 - 0.04, y, -1.0, 0.04, 0.95, 1.0, lot);
    const top = f < floors - 1 ? GH + f * FH : height;
    sink.box(C.metalD, u + w / 2 - 0.5, y, -0.35, 0.04, top - y, 0.04, lot);
    sink.box(C.metalD, u + w / 2 - 0.1, y, -0.35, 0.04, top - y, 0.04, lot);
    for (let r = y + 0.3; r < top; r += 0.3) sink.box(C.metalD, u + w / 2 - 0.5, r, -0.35, 0.44, 0.03, 0.03, lot);
  }
  sink.box(C.metalD, u - w / 2 + 0.2, GH - 1.8, -0.9, 0.04, 1.85, 0.04, lot);
  sink.box(C.metalD, u - w / 2 + 0.6, GH - 1.8, -0.9, 0.04, 1.85, 0.04, lot);
  for (let r = GH - 1.6; r < GH; r += 0.3) sink.box(C.metalD, u - w / 2 + 0.2, r, -0.9, 0.44, 0.03, 0.03, lot);
  sink.cutFlag = 0;
}
export function drainPipe(sink, lot, u, height) {
  sink.cutFlag = 1;
  sink.box(C.pipe, u, 0, -0.18, 0.14, height - 0.3, 0.14, lot);
  sink.box(C.pipe, u - 0.15, 0.05, -0.55, 0.44, 0.14, 0.5, lot);
  sink.cutFlag = 0;
}

// ---------------------------------------------------------------- vehicles
export function carVox(c, kind = 'sedan') {
  const v = new Vox(9, 8, 23);
  const body = c.body, bodyD = c.bodyD || body, glass = c.glass || C.darkGlass;
  v.box(0, 1, 1, 8, 2, 21, bodyD);
  v.box(0, 2, 0, 8, 3, 22, body);
  if (kind === 'sedan') {
    v.box(1, 4, 6, 7, 5, 16, glass);
    v.box(1, 6, 7, 7, 6, 15, body);
    v.box(1, 4, 7, 1, 5, 7, body); v.box(7, 4, 7, 7, 5, 7, body);
    v.box(1, 4, 15, 1, 5, 15, body); v.box(7, 4, 15, 7, 5, 15, body);
    v.box(1, 4, 11, 1, 5, 11, body); v.box(7, 4, 11, 7, 5, 11, body);
  } else if (kind === 'pickup') {
    v.box(1, 4, 11, 7, 5, 17, glass);
    v.box(1, 6, 12, 7, 6, 16, body);
    v.box(1, 4, 12, 1, 5, 12, body); v.box(7, 4, 12, 7, 5, 12, body);
    v.box(1, 4, 16, 1, 5, 16, body); v.box(7, 4, 16, 7, 5, 16, body);
    v.box(1, 2, 1, 7, 3, 9, 0); v.box(1, 1, 1, 7, 1, 9, bodyD);
    v.box(0, 4, 0, 8, 4, 10, body); v.box(1, 4, 1, 7, 4, 9, 0);
  } else if (kind === 'van' || kind === 'ambulance') {
    v.box(0, 4, 2, 8, 6, 20, body);
    v.box(1, 5, 20, 7, 6, 20, glass);
    v.box(0, 4, 5, 0, 5, 8, glass); v.box(8, 4, 5, 8, 5, 8, glass);
    v.box(1, 7, 3, 7, 7, 19, body);
    if (kind === 'ambulance') {
      v.box(0, 3, 0, 8, 3, 14, C.ambRed); v.box(0, 5, 9, 8, 5, 14, C.ambRed);
      v.box(0, 4, 13, 0, 6, 13, C.ambStripe); v.box(8, 4, 13, 8, 6, 13, C.ambStripe);
      v.box(1, 2, 0, 7, 6, 0, C.ambWhite); v.box(3, 3, 0, 5, 5, 0, C.darkGlass);
      v.box(2, 8, 4, 6, 8, 5, C.policeRed); v.box(2, 8, 17, 6, 8, 18, C.policeRed);
    }
  }
  for (const z0 of [3, 16]) for (const x0 of [0, 7]) {
    v.box(x0, 0, z0, x0 + 1, 2, z0 + 2, C.tire);
    v.set(x0 === 0 ? 0 : 8, 1, z0 + 1, C.hub);
  }
  v.box(0, 1, 22, 8, 1, 22, C.chrome); v.box(0, 1, 0, 8, 1, 0, C.chrome);
  v.box(2, 2, 22, 6, 2, 22, C.metalD);
  v.set(1, 2, 22, c.lights ? C.headlight : C.lampLensOff); v.set(7, 2, 22, c.lights ? C.headlight : C.lampLensOff);
  v.set(1, 2, 0, c.lights ? C.taillight : C.red); v.set(7, 2, 0, c.lights ? C.taillight : C.red);
  for (let i = 0; i < 12; i++) { const x = randInt(0, 8), z = randInt(0, 22); if (v.get(x, 2, z) === body && chance(0.5)) v.set(x, 2, z, C.rust); }
  return v;
}

export function busVox(opts = {}) {
  const v = new Vox(12, 15, 52);
  const body = P(opts.body || 0x8a8e86, 'matte', 0.05), stripe = P(opts.stripe || 0x2a4a7a, 'matte', 0.04), dark = P(0x3a3a3c, 'matte', 0.04);
  v.box(0, 2, 0, 11, 13, 51, body);
  v.box(1, 14, 1, 10, 14, 50, dark);
  v.box(0, 5, 0, 11, 5, 51, stripe);
  const win = opts.lit ? C.glassLitWarm : C.darkGlass;
  for (let z = 3; z < 49; z += 5) { v.box(0, 8, z, 0, 11, z + 3, win); v.box(11, 8, z, 11, 11, z + 3, win); }
  v.box(1, 7, 51, 10, 12, 51, C.darkGlass); v.box(1, 7, 0, 10, 11, 0, C.darkGlass);
  v.box(0, 2, 22, 0, 10, 24, C.darkGlass);
  for (const z0 of [6, 40]) for (const x0 of [0, 10]) v.box(x0, 0, z0, x0 + 1, 3, z0 + 3, C.tire);
  for (let i = 0; i < 40; i++) { const x = chance(0.5) ? 0 : 11, y = randInt(2, 13), z = randInt(0, 51); if (v.get(x, y, z) === body) v.set(x, y, z, C.rust); }
  return v;
}

export const carPal = (hex, hexD, lights = false) => ({ body: P(hex, 'shiny', 0.04), bodyD: P(hexD, 'matte', 0.04), lights });

// Place a car (voxel model from carVox) at x,z with yaw rot. Adds obstacles and, if lit, headlight beams.
export function placeCar(ctx, v, x, z, rot, opts = {}) {
  const { sink, dyn } = ctx;
  let m = mat4(x, 0, z, rot).multiply(new THREE.Matrix4().makeTranslation(-0.9, 0, -2.3));
  if (opts.extraM) m = mat4(x, 0, z, rot).multiply(opts.extraM).multiply(new THREE.Matrix4().makeTranslation(-0.9, 0, -2.3));
  sink.vox(v, 0.2, m, { noBottom: true });
  const dir = new THREE.Vector3(Math.sin(rot), 0, Math.cos(rot));
  for (const k of [-1.4, 0, 1.4]) dyn.obstacles.push({ x: x + dir.x * k, z: z + dir.z * k, r: 1.15 });
  if (opts.headlights) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
    const head = new THREE.SpotLight(0xfff2d8, opts.headlights, 26, 0.5, 0.6, 2); head.position.set(0, 0.6, 2.3); head.target.position.set(0, 0.2, 14); g.add(head, head.target);
    const beam = makeBeam(11, 3.2, 0xfff0d0, 0.05); beam.position.set(0, 0.6, 2.35); g.add(beam);
    dyn.group.add(g);
    dyn.feeds.push(() => [x + dir.x * 3, 0.8, z + dir.z * 3, 0.6, 1.0, 0.95, 0.85]);
    return g;
  }
  return null;
}

// ---------------------------------------------------------------- props (world coordinates)
export function lampPost(sink, x, z, rot, lit, dyn, opts = {}) {
  const m = mat4(x, 0, z, rot);
  const h = 7.6;
  sink.box(C.poleD, -0.22, 0, -0.22, 0.44, 0.5, 0.44, m);
  sink.box(C.pole, -0.09, 0.5, -0.09, 0.18, h - 0.5, 0.18, m);
  sink.box(C.pole, -0.07, h - 0.2, -0.07, 0.14, 0.14, 2.0, m);
  sink.box(C.pole, -0.07, h - 0.7, -0.07, 0.14, 0.5, 0.14, m);
  sink.box(C.pole, -0.07, h - 0.7, 0.0, 0.14, 0.12, 1.0, mat4(x, 0, z, rot, 0, -0.5));
  sink.box(C.poleD, -0.45, h - 0.35, 1.5, 0.9, 0.3, 0.6, m);
  const lensPos = new THREE.Vector3(0, h - 0.4, 1.8).applyMatrix4(m);
  const color = opts.color || 0xffb347;
  const lensPal = opts.cold ? C.lampLensCold : C.lampLens;
  if (!lit) sink.box(C.lampLensOff, -0.3, h - 0.42, 1.55, 0.6, 0.07, 0.5, m);
  dyn.obstacles.push({ x, z, r: 0.4 });
  if (lit && opts.light === false) {
    const lens = new Vox(6, 1, 5); lens.box(0, 0, 0, 5, 0, 4, lensPal);
    sink.vox(lens, 0.1, m.clone().multiply(new THREE.Matrix4().makeTranslation(-0.3, h - 0.42, 1.55)), {});
    dyn.glows.push({ pos: [lensPos.x, lensPos.y - 0.1, lensPos.z], color, size: 4.2, slot: -1 });
    return null;
  }
  if (lit) {
    const g = new THREE.Group();
    const lens = new Vox(6, 1, 5); lens.box(0, 0, 0, 5, 0, 4, lensPal);
    const lm = voxGroup(lens, 0.1, dyn.materials, { offset: [-0.3, 0, -0.25], castShadow: false });
    lm.position.set(0, h - 0.42, 1.55 + 0.25); g.add(lm);
    const light = new THREE.SpotLight(color, opts.intensity || 320, 30, 0.75, 0.55, 2);
    light.position.set(0, h - 0.45, 1.8); light.target.position.set(0, 0, 1.8);
    if (opts.shadow) { light.castShadow = true; light.shadow.mapSize.set(1024, 1024); light.shadow.bias = -0.0006; light.shadow.normalBias = 0.04; light.shadow.camera.near = 1; light.shadow.camera.far = 30; }
    g.add(light); g.add(light.target);
    // soft downward beam in the rain
    const beam = makeBeam(h - 0.3, 4.2, color, opts.cold ? 0.028 : 0.035); beam.position.set(0, h - 0.5, 1.8); beam.rotation.x = Math.PI / 2; g.add(beam);
    g.position.set(x, 0, z); g.rotation.y = rot;
    dyn.group.add(g);
    const emitMat = lm.children[0].material = cloneMat(dyn.materials.emit);
    const slot = dyn.slot();
    const lamp = { light, emitMat, flicker: opts.flicker || 0, base: light.intensity, slot, beam, glowPos: lensPos, level: 1 };
    dyn.lamps.push(lamp);
    dyn.glows.push({ pos: [lensPos.x, lensPos.y - 0.1, lensPos.z], color, size: 4.2, slot });
    dyn.safe.push({ x: lensPos.x, z: lensPos.z, r: 4.4, lamp });
    const col = new THREE.Color(color);
    dyn.feeds.push(() => [lensPos.x, lensPos.y, lensPos.z, 0.9 * lamp.level, col.r, col.g, col.b]);
    return lamp;
  }
  return null;
}

export function powerPole(sink, x, z, rot, dyn) {
  const m = mat4(x, 0, z, rot);
  sink.box(C.woodD, -0.16, 0, -0.16, 0.32, 9.2, 0.32, m, { bottomShade: 0.3 });
  sink.box(C.wood, -1.1, 8.4, -0.08, 2.2, 0.14, 0.16, m);
  sink.box(C.wood, -0.9, 7.6, -0.08, 1.8, 0.12, 0.16, m);
  for (const dx of [-0.9, 0.9]) sink.box(C.pole, dx - 0.05, 8.54, -0.05, 0.1, 0.18, 0.1, m);
  dyn.obstacles.push({ x, z, r: 0.35 });
  return { top: new THREE.Vector3(0, 8.6, 0).applyMatrix4(m), arms: [new THREE.Vector3(-0.9, 8.72, 0).applyMatrix4(m), new THREE.Vector3(0.9, 8.72, 0).applyMatrix4(m)] };
}

export function wirePoints(a, b, sag = 0.6, n = 10) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push(lerp(a.x, b.x, t), lerp(a.y, b.y, t) - sag * 4 * t * (1 - t), lerp(a.z, b.z, t)); }
  return pts;
}

export function hydrant(sink, x, z, dyn) {
  const v = new Vox(4, 8, 4);
  v.box(1, 0, 1, 2, 6, 2, C.hydrant); v.box(0, 3, 1, 3, 4, 2, C.hydrant); v.box(1, 3, 0, 2, 4, 3, C.hydrant);
  v.box(1, 7, 1, 2, 7, 2, C.hydrant); v.box(1, 0, 1, 2, 1, 2, C.rust);
  sink.vox(v, 0.12, mat4(x - 0.24, 0.12, z - 0.24, 0), { noBottom: true });
  dyn.obstacles.push({ x, z, r: 0.4 });
}
export function mailbox(sink, x, z, rot, dyn) {
  const v = new Vox(6, 12, 5);
  v.box(1, 0, 1, 1, 6, 1, C.metalD); v.box(4, 0, 1, 4, 6, 1, C.metalD); v.box(1, 0, 3, 1, 6, 3, C.metalD); v.box(4, 0, 3, 4, 6, 3, C.metalD);
  v.box(0, 6, 0, 5, 10, 4, C.mailbox); v.box(1, 11, 1, 4, 11, 3, C.mailbox); v.box(2, 9, 0, 3, 9, 0, C.metalD);
  sink.vox(v, 0.12, mat4(x, 0.12, z, rot).multiply(new THREE.Matrix4().makeTranslation(-0.36, 0, -0.3)), { noBottom: true });
  dyn.obstacles.push({ x, z, r: 0.5 });
}
export function trashCan(sink, x, z, dyn, withBags = true) {
  const v = new Vox(6, 9, 6);
  v.box(1, 0, 0, 4, 7, 5, C.trash); v.box(0, 0, 1, 5, 7, 4, C.trash); v.box(1, 8, 1, 4, 8, 4, C.metalD);
  for (let y = 1; y < 7; y += 2) { v.box(1, y, 0, 4, y, 0, C.metalD); v.box(1, y, 5, 4, y, 5, C.metalD); }
  sink.vox(v, 0.12, mat4(x - 0.36, 0.12, z - 0.36, rand(0, TAU)), { noBottom: true });
  if (withBags) {
    const b = new Vox(7, 4, 6); b.box(1, 0, 1, 5, 2, 4, C.bag); b.box(0, 0, 2, 6, 1, 3, C.bag); b.box(2, 3, 2, 4, 3, 3, C.bag);
    sink.vox(b, 0.12, mat4(x + 0.5, 0.12, z + 0.3, rand(0, TAU)), { noBottom: true });
  }
  dyn.obstacles.push({ x, z, r: 0.5 });
}
export function newspaperBox(sink, x, z, rot, col, dyn) {
  const v = new Vox(5, 10, 4);
  v.box(0, 0, 0, 4, 9, 3, col); v.box(1, 5, 0, 3, 8, 0, C.darkGlass); v.box(0, 0, 0, 4, 1, 3, C.metalD); v.box(0, 0, 1, 4, 3, 2, C.metalD);
  sink.vox(v, 0.12, mat4(x, 0.12, z, rot).multiply(new THREE.Matrix4().makeTranslation(-0.3, 0, -0.24)), { noBottom: true });
  dyn.obstacles.push({ x, z, r: 0.45 });
}
export function bench(sink, x, z, rot) {
  const m = mat4(x, 0.12, z, rot);
  for (const dx of [-0.8, 0.8]) { sink.box(C.benchIron, dx - 0.04, 0, -0.25, 0.08, 0.45, 0.5, m); sink.box(C.benchIron, dx - 0.04, 0.45, 0.2, 0.08, 0.5, 0.08, m); }
  for (let i = 0; i < 3; i++) sink.box(C.bench, -0.95, 0.45, -0.25 + i * 0.17, 1.9, 0.05, 0.14, m);
  for (let i = 0; i < 2; i++) sink.box(C.bench, -0.95, 0.6 + i * 0.18, 0.22, 1.9, 0.14, 0.05, m);
}
export function trafficCone(sink, x, z) {
  const v = new Vox(4, 6, 4);
  v.box(0, 0, 0, 3, 0, 3, C.black); v.box(1, 1, 1, 2, 5, 2, C.cone); v.box(1, 3, 1, 2, 3, 2, C.coneW);
  sink.vox(v, 0.12, mat4(x - 0.24, 0, z - 0.24, rand(0, TAU)), { noBottom: true });
}
export function oilDrum(sink, x, z, tipped = false) {
  const v = new Vox(5, 8, 5);
  v.box(1, 0, 0, 3, 7, 4, C.drum); v.box(0, 0, 1, 4, 7, 3, C.drum);
  v.box(1, 2, 0, 3, 2, 4, C.drumR); v.box(0, 5, 1, 4, 5, 3, C.drumR);
  const m = tipped ? mat4(x, 0.3, z, rand(0, TAU), Math.PI / 2).multiply(new THREE.Matrix4().makeTranslation(-0.3, 0, -0.3)) : mat4(x - 0.3, 0, z - 0.3, rand(0, TAU));
  sink.vox(v, 0.12, m, { noBottom: !tipped });
}
export function sawhorse(sink, x, z, rot, text, dyn) {
  const m = mat4(x, 0, z, rot);
  for (const dx of [-1.1, 1.1]) {
    sink.box(C.wood, dx - 0.05, 0, -0.02, 0.1, 1.05, 0.06, mat4(x, 0, z, rot).multiply(new THREE.Matrix4().makeRotationX(0.25)));
    sink.box(C.wood, dx - 0.05, 0, -0.02, 0.1, 1.05, 0.06, mat4(x, 0, z, rot).multiply(new THREE.Matrix4().makeRotationX(-0.25)));
  }
  const v = new Vox(26, 3, 1);
  for (let i = 0; i < 26; i++) v.box(i, 0, 0, i, 2, 0, Math.floor(i / 3) % 2 ? C.orange : C.white);
  sink.vox(v, 0.1, m.clone().multiply(new THREE.Matrix4().makeTranslation(-1.3, 0.75, -0.05)), {});
  if (text) {
    const tw = textWidth(text);
    const s = new Vox(tw + 4, 9, 1);
    s.box(0, 0, 0, tw + 3, 8, 0, C.white);
    s.text(text, 2, 2, 0, C.black);
    sink.vox(s, 0.08, m.clone().multiply(new THREE.Matrix4().makeTranslation(-(tw + 4) * 0.04, 1.05, -0.04)), {});
  }
  dyn.obstacles.push({ x, z, r: 1.3 });
}

// Simple voxel text as a static mesh: text runs along local +x, faces -z.
export function voxText(sink, text, scale, pal, matrix, bgPal = 0, depth = 1) {
  const tw = textWidth(text);
  const v = new Vox(tw + 2, 7, depth + (bgPal ? 1 : 0));
  if (bgPal) v.box(0, 0, depth, tw + 1, 6, depth, bgPal);
  for (let d = 0; d < depth; d++) v.text(text, 1, 1, d, pal);
  sink.vox(v, scale, matrix.clone().multiply(new THREE.Matrix4().makeTranslation(-(tw + 2) * scale / 2, 0, 0)), { ao: 0.3 });
  return tw * scale;
}

// Dynamic emissive letter meshes (each letter separately for flicker).
export function neonLetters(text, scale, pal, offPal, materials, opts = {}) {
  const group = new THREE.Group();
  const letters = [];
  const tw = textWidth(text);
  let cx = 0;
  for (const ch of text) {
    const v = new Vox(3, 5, opts.depth || 1);
    v.text(ch, 0, 0, 0, pal);
    for (let d = 1; d < (opts.depth || 1); d++) v.text(ch, 0, 0, d, pal);
    const lx = (tw - 3 - cx) - tw / 2;
    const g = voxGroup(v, scale, materials, { offset: [lx * scale, 0, 0], castShadow: false });
    const on = g.children.find((c) => c.name === 'emit');
    if (on) on.material = cloneMat(materials.emit);
    const v2 = new Vox(3, 5, opts.depth || 1); v2.text(ch, 0, 0, 0, offPal);
    const off = voxGroup(v2, scale, materials, { offset: [lx * scale, 0, 0], castShadow: false });
    off.visible = false;
    group.add(g); group.add(off);
    letters.push({ on: g, off, mat: on ? on.material : null, level: 1 });
    cx += 4;
  }
  group.userData.letters = letters;
  return group;
}

export function trafficLight(materials) {
  const g = new THREE.Group();
  const v = new Vox(4, 11, 4);
  v.box(0, 0, 0, 3, 9, 3, C.tlHousing);
  v.box(1, 10, 1, 2, 10, 2, C.metalD);
  for (const z of [0, 3]) { v.box(1, 7, z, 2, 8, z, C.tlRedOff); v.box(1, 4, z, 2, 5, z, C.tlAmberOff); v.box(1, 1, z, 2, 2, z, C.tlGreenOff); }
  for (const [zv] of [[-1], [4]]) for (const y of [9, 6, 3]) v.box(0, y, zv, 3, y, zv, C.tlHousing);
  const housing = voxGroup(v, 0.12, materials, { offset: [-0.24, -1.4, -0.24], castShadow: true });
  g.add(housing);
  const r = new Vox(2, 2, 6); r.box(0, 0, 0, 1, 1, 5, C.tlRed);
  const red = voxGroup(r, 0.12, materials, { offset: [-0.12, -1.4 + 0.84, -0.36], castShadow: false });
  red.children[0].material = cloneMat(materials.emit);
  g.add(red);
  const light = new THREE.PointLight(0xff2a1a, 22, 12, 2); light.position.set(0, -0.6, 0); g.add(light);
  return { group: g, redMat: red.children[0].material, light };
}

export function crow(materials) {
  const v = new Vox(3, 4, 6);
  v.box(0, 0, 1, 2, 1, 4, C.crow); v.box(1, 1, 0, 1, 1, 0, C.crow); v.box(1, 2, 4, 1, 3, 5, C.crow); v.set(1, 2, 5, C.crow);
  v.box(0, 2, 1, 0, 2, 3, C.crow); v.box(2, 2, 1, 2, 2, 3, C.crow);
  return voxGroup(v, 0.06, materials, { offset: [-0.09, 0, -0.18], castShadow: false });
}

// ---------------------------------------------------------------- composite set pieces
export function busShelter(ctx, x, z, opts = {}) {
  const { sink, dyn, materials } = ctx;
  const m = mat4(x, 0.12, z, 0);
  for (const dx of [-2, 2]) for (const dz of [-0.8, 0.8]) sink.box(C.metalD, dx - 0.05, 0, dz - 0.05, 0.1, 2.6, 0.1, m);
  sink.cutFlag = 1; // the roof dissolves when the player is underneath it
  sink.box(C.metalD, -2.2, 2.6, -1.0, 4.4, 0.12, 2.0, m);
  sink.cutFlag = 0;
  sink.box(C.boothGlass, -2, 0.3, 0.75, 4, 2.3, 0.04, m);
  sink.box(C.boothGlass, -2, 0.3, -0.8, 0.04, 2.3, 1.6, m);
  sink.box(C.boothGlass, 1.96, 0.3, -0.8, 0.04, 2.3, 1.6, m);
  bench(sink, x, z + 0.3, Math.PI);
  const pv = new Vox(31, 22, 1);
  pv.box(0, 0, 0, 30, 21, 0, C.poster);
  pv.text(opts.poster || 'MISSING', 2, 15, 0, C.posterInk);
  pv.box(9, 3, 0, 21, 12, 0, C.posterInk); pv.box(11, 5, 0, 19, 11, 0, C.poster); pv.box(13, 7, 0, 17, 10, 0, C.posterInk);
  sink.vox(pv, 0.045, mat4(x - 0.7, 1.0, z + 0.7, 0), {});
  const tube = new Vox(20, 1, 1); tube.box(0, 0, 0, 19, 0, 0, C.fluor);
  const tm = voxGroup(tube, 0.1, materials, { offset: [-1, 0, 0], castShadow: false });
  tm.children[0].material = cloneMat(materials.emit);
  tm.position.set(x, 2.55, z); dyn.group.add(tm);
  const light = new THREE.PointLight(0xd8f0ff, 14, 9, 2); light.position.set(x, 2.4, z); dyn.group.add(light);
  dyn.fluor = { mat: tm.children[0].material, light, base: 14 };
  dyn.obstacles.push({ x: x - 2, z, r: 0.3 }, { x: x + 2, z, r: 0.3 }, { x, z: z + 0.7, r: 0.5 }, { x: x - 1.2, z: z + 0.7, r: 0.5 }, { x: x + 1.2, z: z + 0.7, r: 0.5 });
  return { x, z };
}

export function phoneBooth(ctx, x, z) {
  const { sink, dyn, materials } = ctx;
  const v = new Vox(10, 24, 10);
  v.shell(0, 0, 0, 9, 23, 9, C.boothGlass);
  for (const [x0, z0] of [[0, 0], [9, 0], [0, 9], [9, 9]]) v.box(x0, 0, z0, x0, 23, z0, C.booth);
  v.box(0, 0, 0, 9, 1, 9, C.booth); v.box(0, 22, 0, 9, 23, 9, C.booth);
  v.box(0, 2, 0, 9, 2, 9, C.booth); v.box(0, 21, 0, 9, 21, 9, C.booth);
  v.box(1, 1, 1, 8, 21, 8, 0);
  v.box(0, 10, 0, 9, 10, 9, C.booth);
  v.box(1, 12, 1, 4, 16, 1, C.black);
  v.box(2, 20, 1, 8, 20, 8, C.booth);
  sink.vox(v, 0.1, mat4(x - 0.5, 0.12, z - 0.5, 0), { noBottom: true });
  voxText(sink, 'PHONE', 0.05, C.fluor, mat4(x, 2.32, z - 0.52, 0), C.black, 1);
  voxText(sink, 'PHONE', 0.05, C.fluor, mat4(x, 2.32, z + 0.52, Math.PI), C.black, 1);
  const light = new THREE.PointLight(0xbfe6ff, 10, 7, 2); light.position.set(x, 2.0, z); dyn.group.add(light);
  const slot = dyn.slot();
  dyn.phone = { light, base: 10, x, z, slot, level: 1 };
  dyn.glows.push({ pos: [x, 2.1, z], color: 0xbfe6ff, size: 1.8, slot });
  dyn.feeds.push(() => [x, 2.0, z, 0.15 * dyn.phone.level, 0.75, 0.9, 1.0]);
  const rv = new Vox(2, 2, 6); rv.box(0, 0, 0, 1, 1, 5, C.black); rv.box(0, 0, 0, 1, 1, 0, C.metalD); rv.box(0, 0, 5, 1, 1, 5, C.metalD);
  const rm = voxGroup(rv, 0.05, materials, { offset: [-0.05, -0.6, -0.15], castShadow: false });
  const pivot = new THREE.Group(); pivot.position.set(x - 0.2, 1.35, z - 0.35); pivot.add(rm);
  rm.rotation.x = Math.PI / 2;
  const cordGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, -0.6, 0], 3));
  pivot.add(new THREE.Line(cordGeo, new THREE.LineBasicMaterial({ color: 0x111111 })));
  dyn.group.add(pivot);
  dyn.receiver = pivot;
  dyn.obstacles.push({ x, z, r: 0.85 });
  return dyn.phone;
}

export function policeCar(ctx, x, z, rot) {
  const { sink, dyn, materials } = ctx;
  const v = carVox({ body: P(0xe8e8e0, 'shiny', 0.02), bodyD: P(0x141418, 'shiny', 0.02), lights: true });
  v.box(0, 3, 0, 8, 3, 6, P(0x141418, 'shiny', 0.02)); v.box(0, 3, 16, 8, 3, 22, P(0x141418, 'shiny', 0.02)); v.box(1, 6, 7, 7, 6, 15, P(0x141418, 'shiny', 0.02));
  placeCar(ctx, v, x, z, rot, { headlights: 140 });
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const bar = new Vox(8, 1, 2); bar.box(0, 0, 0, 3, 0, 1, C.policeRed); bar.box(4, 0, 0, 7, 0, 1, C.policeBlue);
  const barBase = new Vox(8, 1, 2); barBase.box(0, 0, 0, 7, 0, 1, C.black);
  const bb = voxGroup(barBase, 0.16, materials, { offset: [-0.64, 1.4, -0.16], castShadow: false }); g.add(bb);
  const bm = voxGroup(bar, 0.16, materials, { offset: [-0.64, 1.5, -0.16], castShadow: false });
  bm.children[0].material = cloneMat(materials.emit); g.add(bm);
  const red = new THREE.PointLight(0xff2030, 0, 26, 2); red.position.set(-0.4, 1.9, 0); g.add(red);
  const blue = new THREE.PointLight(0x3060ff, 0, 26, 2); blue.position.set(0.4, 1.9, 0); g.add(blue);
  dyn.group.add(g);
  const slot = dyn.slot();
  dyn.police = { g, red, blue, barMat: bm.children[0].material, x, z, slot };
  dyn.glows.push({ pos: [x, 1.7, z], color: 0xff3040, size: 3.5, slot });
  dyn.feeds.push(() => [x, 1.9, z, 0.5 * (red.intensity + blue.intensity) / 160, red.intensity / 160, 0.05, blue.intensity / 160]);
  dyn.safe.push({ x, z, r: 5.0, lamp: null });
  return dyn.police;
}

export function chasmPit(ctx) {
  const { sink } = ctx;
  const { x0, x1, z0, z1 } = CHASM;
  const depth = 9;
  for (let z = z0; z < z1; z += 1) {
    sink.box(C.rock, x1 - 0.5, -depth, z, 0.5 + rand(0, 0.8), depth, 1, null, { noTop: true });
    sink.box(C.rock, x0 - rand(0, 0.8), -depth, z, 0.8, depth, 1, null, { noTop: true });
  }
  for (let x = x0; x < x1; x += 1) {
    sink.box(C.rock, x, -depth, z0 - rand(0, 0.6), 1, depth, 0.6 + rand(0, 0.5), null, { noTop: true });
    sink.box(C.rock, x, -depth, z1 - 0.5, 1, depth, 0.5 + rand(0, 0.8), null, { noTop: true });
  }
  sink.box(C.rockD, x0, -depth - 0.2, z0, x1 - x0, 0.2, z1 - z0);
  for (let i = 0; i < 40; i++) {
    const x = rand(x1 - 1.5, x1 + 1.2), z = rand(z0, z1);
    const s = rand(0.2, 0.7);
    sink.box(C.rock, 0, 0, 0, s, s * 0.6, s * 0.8, mat4(x, -rand(0, 0.5), z, rand(0, TAU), rand(-0.4, 0.4)));
  }
  for (let i = 0; i < 25; i++) {
    const x = rand(x1 - 0.8, x1 + 0.4), z = rand(z0, z1);
    sink.box(C.rebar, -0.03, 0, -0.03, 0.06, rand(0.8, 2.2), 0.06, mat4(x, -rand(0.5, 1.5), z, rand(0, TAU), rand(-0.9, 0.9), rand(-0.5, 0.5)));
  }
  for (let z = z0 + 1; z < z1 - 1; z += 2.2) sink.box(C.metal, x1 - 0.2, 0.5, z, 0.08, 0.3, 2.0, mat4(0, 0, 0, 0, rand(-0.3, 0.3)));
}

export function manhole(ctx, x, z, steam = true) {
  const { sink, dyn } = ctx;
  const v = new Vox(9, 1, 9);
  for (let ax = 0; ax < 9; ax++) for (let az = 0; az < 9; az++) if ((ax - 4) ** 2 + (az - 4) ** 2 <= 17) v.set(ax, 0, az, (ax + az) % 2 ? C.metalD : C.metal);
  sink.vox(v, 0.12, mat4(x - 0.54, 0.0, z - 0.54, 0), { noBottom: true });
  if (steam) dyn.steam.push({ x, y: 0.15, z, count: 70, rise: 2.4 });
}
export function drainGrate(ctx, x, z, steam = false) {
  const g = new Vox(8, 1, 3); for (let x0 = 0; x0 < 8; x0++) g.box(x0, 0, 0, x0, 0, 2, x0 % 2 ? C.metalD : C.black);
  ctx.sink.vox(g, 0.12, mat4(x - 0.48, 0.0, z - 0.18, 0), { noBottom: true });
  if (steam) ctx.dyn.steam.push({ x, y: 0.1, z, count: 30, rise: 1.4, alpha: 0.1 });
}

// Chain-link fence along x from x0..x1 at z. opts.gate = [gx0, gx1] makes that section a separate removable panel.
export function fenceLine(ctx, x0, x1, z, opts = {}) {
  const { sink, dyn } = ctx;
  for (let x = x0; x <= x1 + 0.01; x += 3.2) sink.box(C.pole, x - 0.05, 0, z - 0.05, 0.1, 2.5, 0.1);
  sink.box(C.pole, x0, 2.45, z - 0.03, x1 - x0, 0.06, 0.06);
  sink.box(C.pole, x0, 0.05, z - 0.03, x1 - x0, 0.05, 0.06);
  const f = { x0, x1, z, h: 2.5, gate: opts.gate || null, panels: [] };
  dyn.fences.push(f);
  return f;
}

export function radioTower(ctx, x, z, h = 48) {
  const { sink, dyn, materials } = ctx;
  for (const [dx, dz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) sink.box(C.metalD, x + dx - 0.15, 0, z + dz - 0.15, 0.3, h, 0.3);
  for (let y = 4; y < h; y += 6) { sink.box(C.metalD, x - 2, y, z - 2, 4, 0.15, 0.15); sink.box(C.metalD, x - 2, y, z + 2, 4, 0.15, 0.15); sink.box(C.metalD, x - 2, y, z - 2, 0.15, 0.15, 4); sink.box(C.metalD, x + 2, y, z - 2, 0.15, 0.15, 4); }
  sink.box(C.metalD, x - 0.2, h, z - 0.2, 0.4, 6, 0.4);
  const b = new Vox(2, 2, 2); b.box(0, 0, 0, 1, 1, 1, C.tlRed);
  const bm = voxGroup(b, 0.3, materials, { offset: [-0.3, 0, -0.3], castShadow: false }); bm.children[0].material = cloneMat(materials.emit);
  bm.position.set(x, h + 6, z); dyn.group.add(bm);
  const slot = dyn.slot();
  dyn.glows.push({ pos: [x, h + 6.3, z], color: 0xff2020, size: 6, slot });
  dyn.beacon = { mat: bm.children[0].material, slot };
}
export function waterTower(ctx, wx, wz) {
  const { sink } = ctx;
  for (const [dx, dz] of [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]]) sink.box(C.woodD, wx + dx - 0.25, 0, wz + dz - 0.25, 0.5, 22, 0.5);
  const tv = new Vox(9, 8, 9); for (let ax = 0; ax < 9; ax++) for (let az = 0; az < 9; az++) if ((ax - 4) ** 2 + (az - 4) ** 2 <= 18) { tv.box(ax, 0, az, ax, 6, az, C.tank); if ((ax - 4) ** 2 + (az - 4) ** 2 <= 8) tv.set(ax, 7, az, C.tankTop); }
  sink.vox(tv, 1.0, mat4(wx - 4.5, 22, wz - 4.5, 0), {});
}
export function dumpster(ctx, x, z, rot) {
  const { sink, dyn } = ctx;
  const m = mat4(x, 0, z, rot);
  sink.box(C.drum, -1.1, 0, -0.7, 2.2, 1.2, 1.4, m); sink.box(C.drumR, -1.1, 1.2, -0.7, 2.2, 0.15, 1.4, mat4(x, 0, z, rot, 0, 0.35));
  for (let i = 0; i < 5; i++) { const b = new Vox(6, 4, 5); b.box(1, 0, 1, 4, 2, 3, C.bag); b.box(0, 0, 2, 5, 1, 2, C.bag); sink.vox(b, 0.12, mat4(x + rand(-1.5, 1.5), 0, z + 2.5 + rand(-1, 1), rand(0, TAU)), { noBottom: true }); }
  dyn.obstacles.push({ x, z, r: 1.3 });
}
export function shoppingCart(ctx, x, z, rot, tipped = true) {
  const { sink, dyn } = ctx;
  const m = tipped ? mat4(x, 0.4, z, rot, Math.PI / 2 + 0.1) : mat4(x, 0.1, z, rot);
  for (const [x0, z0] of [[0, 0], [0.9, 0], [0, 0.55], [0.9, 0.55]]) sink.box(C.metal, x0 - 0.02, 0, z0 - 0.02, 0.04, 0.85, 0.04, m);
  for (let y = 0.1; y <= 0.85; y += 0.25) { sink.box(C.metal, 0, y, 0, 0.9, 0.03, 0.03, m); sink.box(C.metal, 0, y, 0.55, 0.9, 0.03, 0.03, m); sink.box(C.metal, 0, y, 0, 0.03, 0.03, 0.55, m); sink.box(C.metal, 0.9, y, 0, 0.03, 0.03, 0.55, m); }
  sink.box(C.metalD, 0, 0.1, 0, 0.9, 0.03, 0.55, m);
  for (const [x0, z0] of [[0.05, -0.08], [0.85, -0.08], [0.05, 0.6], [0.85, 0.6]]) sink.box(C.black, x0 - 0.05, -0.1, z0 - 0.05, 0.1, 0.1, 0.1, m);
  dyn.obstacles.push({ x, z, r: 0.8 });
}
export function stopSign(ctx, x, z, rot, tilt = -0.12) {
  const { sink, dyn } = ctx;
  const m = mat4(x, 0.12, z, rot, tilt);
  sink.box(C.pole, -0.04, 0, -0.04, 0.08, 2.6, 0.08, m);
  const v = new Vox(7, 7, 1); for (let ax = 0; ax < 7; ax++) for (let ay = 0; ay < 7; ay++) if (Math.abs(ax - 3) + Math.abs(ay - 3) <= 4) v.set(ax, ay, 0, C.red);
  v.text('S', 0, 1, 0, C.white);
  sink.vox(v, 0.12, m.clone().multiply(new THREE.Matrix4().makeTranslation(-0.42, 2.2, -0.05)), {});
  dyn.obstacles.push({ x, z, r: 0.3 });
}

// ---------------------------------------------------------------- new set pieces
export function sandbagWall(ctx, x, z, rot, len, rows = 3) {
  const { sink, dyn } = ctx;
  const m = mat4(x, 0, z, rot);
  for (let r = 0; r < rows; r++) for (let i = 0; i < len; i++) {
    const off = (r % 2) * 0.3;
    sink.box(r % 2 ? C.sandbag : C.sandbagD, -len * 0.3 + i * 0.6 + off, r * 0.22, -0.2, 0.58, 0.24, 0.42, m, { jit: 0.12 });
  }
  const dir = new THREE.Vector3(Math.cos(rot), 0, -Math.sin(rot));
  for (let i = -len / 2; i <= len / 2; i += 1.5) dyn.obstacles.push({ x: x + dir.x * i * 0.6, z: z + dir.z * i * 0.6, r: 0.55 });
}

// A power pole lying across the road, wire ends sparking in the water.
export function fallenPole(ctx, x, z, rot) {
  const { sink, dyn } = ctx;
  const m = mat4(x, 0.3, z, rot, 0, Math.PI / 2 - 0.08);
  sink.box(C.woodD, -0.16, 0, -0.16, 0.32, 9.2, 0.32, m);
  sink.box(C.wood, -1.1, 8.4, -0.08, 2.2, 0.14, 0.16, m);
  sink.box(C.wood, -0.9, 7.6, -0.08, 1.8, 0.12, 0.16, m);
  const dir = new THREE.Vector3(Math.sin(rot), 0, Math.cos(rot));
  for (let k = 1; k < 9; k += 1.5) dyn.obstacles.push({ x: x + dir.x * k, z: z + dir.z * k, r: 0.5 });
  const end = new THREE.Vector3(x + dir.x * 8.6, 0.35, z + dir.z * 8.6);
  // sparking wire end
  const sp = new Vox(2, 2, 2); sp.box(0, 0, 0, 1, 1, 1, C.spark);
  const sm = voxGroup(sp, 0.08, ctx.materials, { offset: [-0.08, 0, -0.08], castShadow: false }); sm.children[0].material = cloneMat(ctx.materials.emit);
  sm.position.copy(end); dyn.group.add(sm);
  const light = new THREE.PointLight(0x9fd0ff, 0, 12, 2); light.position.copy(end); light.position.y += 0.4; dyn.group.add(light);
  const slot = dyn.slot();
  dyn.glows.push({ pos: [end.x, end.y + 0.2, end.z], color: 0x9fd0ff, size: 2.2, slot });
  const spark = { mat: sm.children[0].material, light, slot, x: end.x, z: end.z, level: 0 };
  dyn.sparks.push(spark);
  dyn.feeds.push(() => [end.x, 0.6, end.z, 0.8 * spark.level, 0.6, 0.8, 1.0]);
  return spark;
}

// Small brick pump station with a floodlight mast (off until powered) and a valve stand.
export function pumpHouse(ctx, cx, cz, ry) {
  const { sink, dyn, materials } = ctx;
  const b = building(sink, { cx, cz, ry, w: 9, d: 8, floors: 1, floorH: 4.5, style: 'brick', seed: 501, roof: false, darkRate: 1.0 });
  const lot = b.lot;
  sink.cutFlag = 1;
  // big outflow pipe out the side, valve stand in front
  sink.box(C.metalD, -5.2, 0.3, 2.0, 1.4, 1.4, 4.0, lot);
  sink.box(C.pipe, -6.4, 0.4, 3.0, 1.4, 1.2, 1.2, lot);
  sink.cutFlag = 0;
  voxText(sink, 'PUMP STATION 2', 0.22, C.signWhite, lot.clone().multiply(new THREE.Matrix4().makeTranslation(0, 3.4, -0.32)), C.signBg, 1);
  // door
  sink.box(C.door, -0.8, 0, -0.06, 1.6, 2.4, 0.1, lot);
  // valve stand (wheel added by the game when fitted)
  const valvePos = new THREE.Vector3(3.2, 0, -1.6).applyMatrix4(lot);
  sink.box(C.metalD, 3.0, 0, -1.8, 0.4, 1.0, 0.4, lot);
  sink.box(C.pipe, 2.7, 0.9, -1.75, 1.0, 0.25, 0.3, lot);
  dyn.obstacles.push({ x: valvePos.x, z: valvePos.z, r: 0.5 });
  // floodlight mast at the corner
  const mastPos = new THREE.Vector3(5.8, 0, -1.2).applyMatrix4(lot);
  sink.box(C.pole, -0.1, 0, -0.1, 0.2, 6.5, 0.2, mat4(mastPos.x, 0, mastPos.z, ry));
  sink.box(C.poleD, -0.4, 6.2, -0.3, 0.8, 0.5, 0.6, mat4(mastPos.x, 0, mastPos.z, ry));
  dyn.obstacles.push({ x: mastPos.x, z: mastPos.z, r: 0.3 });
  const g = new THREE.Group(); g.position.set(mastPos.x, 6.3, mastPos.z); g.rotation.y = ry;
  const light = new THREE.SpotLight(0xdfe8ff, 0, 30, 0.9, 0.6, 2); light.position.set(0, 0, 0); light.target.position.set(0, -6, -6); g.add(light, light.target);
  const beam = makeBeam(9, 5.5, 0xdfe8ff, 0.0); beam.rotation.x = Math.PI * 0.35; g.add(beam);
  const lens = new Vox(4, 1, 3); lens.box(0, 0, 0, 3, 0, 2, C.lampLensCold);
  const lm = voxGroup(lens, 0.12, materials, { offset: [-0.24, -0.1, -0.18], castShadow: false }); lm.children[0].material = cloneMat(materials.emit); lm.children[0].material.color.setScalar(0.05); g.add(lm);
  dyn.group.add(g);
  const slot = dyn.slot();
  dyn.glows.push({ pos: [mastPos.x, 6.2, mastPos.z], color: 0xdfe8ff, size: 4.5, slot });
  dyn.glowInt[slot] = 0;
  const flood = { light, beam, lensMat: lm.children[0].material, slot, on: false, x: mastPos.x, z: mastPos.z };
  dyn.feeds.push(() => [mastPos.x, 6, mastPos.z, flood.on ? 1.2 : 0, 0.87, 0.91, 1.0]);
  return { b, valvePos, flood, doorPos: new THREE.Vector3(0, 0, -1.2).applyMatrix4(lot) };
}

// Hospital block: tall facade with an emergency entrance and a lit cross.
export function hospital(ctx, cx, cz, ry, materials) {
  const { sink, dyn } = ctx;
  const b = building(sink, { cx, cz, ry, w: 34, d: 24, floors: 7, style: 'hospital', seed: 701, store: { name: 'EMERGENCY', pane: C.glassLitCold, doorX: 15.5, doorW: 3.2, doorPane: C.glassLitCold, signBg: C.signBg, signCol: C.neonRed }, darkRate: 0.7, litPane: C.glassLitCold, winSpacing: 2.2 });
  const lot = b.lot;
  sink.cutFlag = 1;
  // entrance canopy
  sink.box(C.concrete, -5, 3.6, -3.4, 10, 0.3, 3.4, lot);
  for (const u of [-4.5, 4.5]) sink.box(C.pole, u - 0.1, 0, -3.2, 0.2, 3.6, 0.2, lot);
  sink.cutFlag = 0;
  voxText(sink, 'ST VESPER MEMORIAL', 0.3, C.signWhite, lot.clone().multiply(new THREE.Matrix4().makeTranslation(0, 7.0, -0.35)), C.signBg, 1);
  // big blue cross on the facade
  const mk = () => { const v = new Vox(9, 9, 1); v.box(3, 0, 0, 5, 8, 0, C.neonBlue); v.box(0, 3, 0, 8, 5, 0, C.neonBlue); return v; };
  const cross = voxGroup(mk(), 0.3, materials, { offset: [-1.35, -1.35, 0], castShadow: false, cut: true });
  cross.children[0].material = cloneMat(materials.emit);
  const cp = new THREE.Vector3(-9, 12, -0.4).applyMatrix4(lot);
  cross.position.copy(cp); cross.rotation.y = ry + Math.PI; dyn.group.add(cross);
  const slot = dyn.slot();
  dyn.glows.push({ pos: [cp.x, cp.y, cp.z], color: 0x4a7cff, size: 7, slot });
  const light = new THREE.PointLight(0x4a7cff, 90, 26, 2); light.position.copy(cp); light.position.add(new THREE.Vector3(0, 0, -2).applyMatrix4(new THREE.Matrix4().extractRotation(lot))); dyn.group.add(light);
  dyn.feeds.push(() => [cp.x, cp.y, cp.z, 0.8 * (dyn.glowInt[slot] || 0), 0.3, 0.5, 1.0]);
  // canopy lights (cold, flicker)
  const cl = new THREE.PointLight(0xcfe0ff, 60, 16, 2); const clp = new THREE.Vector3(0, 3.3, -1.8).applyMatrix4(lot); cl.position.copy(clp); dyn.group.add(cl);
  dyn.canopy = { light: cl, base: 60, slot: dyn.slot() };
  dyn.feeds.push(() => [clp.x, clp.y, clp.z, 0.5 * (dyn.glowInt[dyn.canopy.slot] || 0), 0.81, 0.88, 1.0]);
  // red EMERGENCY sign glow
  { const sp = new THREE.Vector3(0, 4.3, -1.2).applyMatrix4(lot); const sl = new THREE.PointLight(0xff3a3a, 50, 18, 2); sl.position.copy(sp); dyn.group.add(sl); const s2 = dyn.slot(); dyn.glows.push({ pos: [sp.x, sp.y, sp.z], color: 0xff3a3a, size: 5, slot: s2 }); }
  dyn.glows.push({ pos: [clp.x, clp.y, clp.z], color: 0xcfe0ff, size: 3, slot: dyn.canopy.slot });
  dyn.safe.push({ x: clp.x, z: clp.z, r: 5.5, lamp: null });
  return { b, crossMat: cross.children[0].material, crossSlot: slot, crossLight: light, doorPos: new THREE.Vector3(0, 0, -1.5).applyMatrix4(lot) };
}

export function ambulance(ctx, x, z, rot, lightsOn) {
  const v = carVox({ body: C.ambWhite, bodyD: P(0x8a8a86, 'matte', 0.03), lights: lightsOn }, 'ambulance');
  placeCar(ctx, v, x, z, rot, { headlights: lightsOn ? 90 : 0 });
  if (lightsOn) {
    const { dyn } = ctx;
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
    const red = new THREE.PointLight(0xff2030, 0, 18, 2); red.position.set(0, 1.9, 1.2); g.add(red);
    dyn.group.add(g);
    const slot = dyn.slot();
    dyn.glows.push({ pos: [x, 1.8, z], color: 0xff3040, size: 3, slot });
    dyn.ambulances.push({ red, slot, phase: rand(0, 6) });
  }
}

export function wheelchair(ctx, x, z, rot, tipped = false) {
  const { sink, dyn } = ctx;
  const m = tipped ? mat4(x, 0.35, z, rot, 0, Math.PI / 2) : mat4(x, 0, z, rot);
  for (const dx of [-0.28, 0.28]) { sink.box(C.tire, dx - 0.02, 0.0, -0.3, 0.04, 0.6, 0.6, m); }
  sink.box(C.steel, -0.24, 0.5, -0.25, 0.48, 0.04, 0.45, m);
  sink.box(C.steel, -0.24, 0.5, -0.28, 0.48, 0.55, 0.04, m);
  for (const dx of [-0.24, 0.2]) sink.box(C.steel, dx, 0.7, -0.25, 0.04, 0.04, 0.5, m);
  sink.box(C.black, -0.2, 0.52, -0.22, 0.4, 0.06, 0.4, m);
  dyn.obstacles.push({ x, z, r: 0.5 });
}
export function gurney(ctx, x, z, rot) {
  const { sink, dyn } = ctx;
  const m = mat4(x, 0, z, rot);
  for (const [dx, dz] of [[-0.35, -0.9], [0.35, -0.9], [-0.35, 0.9], [0.35, 0.9]]) { sink.box(C.steel, dx - 0.02, 0.05, dz - 0.02, 0.04, 0.75, 0.04, m); sink.box(C.black, dx - 0.06, 0, dz - 0.06, 0.12, 0.1, 0.12, m); }
  sink.box(C.steel, -0.42, 0.8, -1.0, 0.84, 0.06, 2.0, m);
  sink.box(C.sheet, -0.4, 0.86, -0.95, 0.8, 0.12, 1.9, m, { jit: 0.05 });
  sink.box(C.sheetD, -0.3, 0.98, -0.6, 0.6, 0.2, 1.4, m, { jit: 0.06 });
  sink.box(C.steel, -0.44, 0.86, -1.0, 0.88, 0.5, 0.04, m);
  dyn.obstacles.push({ x, z, r: 0.9 });
}
export function ivStand(ctx, x, z) {
  const { sink, dyn } = ctx;
  sink.box(C.steel, x - 0.02, 0, z - 0.02, 0.04, 1.9, 0.04);
  sink.box(C.steel, x - 0.25, 0.02, z - 0.25, 0.5, 0.04, 0.5);
  sink.box(C.steel, x - 0.2, 1.85, z - 0.02, 0.4, 0.04, 0.04);
  sink.box(C.boothGlass, x - 0.28, 1.55, z - 0.06, 0.14, 0.3, 0.12);
  dyn.obstacles.push({ x, z, r: 0.35 });
}
export function fountain(ctx, x, z) {
  const { sink, dyn } = ctx;
  const v = new Vox(15, 3, 15);
  for (let ax = 0; ax < 15; ax++) for (let az = 0; az < 15; az++) {
    const d2 = (ax - 7) ** 2 + (az - 7) ** 2;
    if (d2 <= 49 && d2 > 30) v.box(ax, 0, az, ax, 1, az, C.stone);
    else if (d2 <= 30) v.set(ax, 0, az, C.basin);
    if (d2 <= 2) v.box(ax, 0, az, ax, 2, az, C.stoneD);
  }
  sink.vox(v, 0.4, mat4(x - 3, 0, z - 3, 0), { noBottom: true });
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; sink.box(C.moss, x + Math.cos(a) * 2.6, 0.75, z + Math.sin(a) * 2.6, 0.3, 0.08, 0.3); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; dyn.obstacles.push({ x: x + Math.cos(a) * 2.4, z: z + Math.sin(a) * 2.4, r: 0.8 }); }
  dyn.obstacles.push({ x, z, r: 1.5 });
}
// Small stone chapel with a lit doorway (the goal of the last chapter).
export function chapel(ctx, cx, cz, ry, materials) {
  const { sink, dyn } = ctx;
  const b = building(sink, { cx, cz, ry, w: 10, d: 14, floors: 2, floorH: 3.5, style: 'stone', seed: 901, roof: false, windowSkip: 0.4, darkRate: 0.65, litPane: C.chapelLight, winW: 0.5 });
  const lot = b.lot;
  sink.cutFlag = 1;
  // steeple and cross
  sink.box(C.stoneD, -1.5, b.height - 0.5, 3, 3, 4.5, 3, lot);
  sink.box(C.stoneD, -0.9, b.height + 4, 3.6, 1.8, 2.2, 1.8, lot);
  sink.box(C.chapelWood, -0.08, b.height + 6.2, 4.42, 0.16, 1.6, 0.16, lot);
  sink.box(C.chapelWood, -0.5, b.height + 7.2, 4.42, 1.0, 0.16, 0.16, lot);
  // stepped arch doorway, door pane lit from inside
  sink.box(C.stoneD, -1.6, 0, -0.5, 3.2, 3.2, 0.5, lot);
  sink.box(C.stoneD, -1.2, 3.2, -0.5, 2.4, 0.5, 0.5, lot);
  sink.box(C.stoneD, -0.7, 3.7, -0.5, 1.4, 0.4, 0.5, lot);
  sink.cutFlag = 0;
  const doorV = new Vox(2, 5, 1); doorV.box(0, 0, 0, 1, 4, 0, C.chapelLight);
  const door = voxGroup(doorV, 0.55, materials, { offset: [-0.55, 0, 0], castShadow: false });
  door.children[0].material = cloneMat(materials.emit); door.children[0].material.color.setScalar(0.12);
  const dp = new THREE.Vector3(0, 0.02, -0.48).applyMatrix4(lot);
  door.position.copy(dp); door.rotation.y = ry; dyn.group.add(door);
  // steps
  sink.box(C.stone, -2.0, 0, -1.4, 4.0, 0.18, 0.9, lot); sink.box(C.stone, -1.8, 0.18, -1.0, 3.6, 0.18, 0.5, lot);
  const light = new THREE.PointLight(0xffd8a0, 0, 10, 2); light.position.copy(dp); light.position.y += 1.8; dyn.group.add(light);
  const slot = dyn.slot();
  dyn.glows.push({ pos: [dp.x, dp.y + 1.6, dp.z], color: 0xffd8a0, size: 3.5, slot });
  dyn.glowInt[slot] = 0.15;
  // wall phone beside the door
  const ph = new THREE.Vector3(2.2, 1.4, -0.55).applyMatrix4(lot);
  sink.box(C.black, 2.0, 1.2, -0.6, 0.4, 0.55, 0.15, lot);
  sink.box(C.metalD, 2.05, 1.32, -0.68, 0.3, 0.1, 0.1, lot);
  dyn.feeds.push(() => [dp.x, dp.y + 1.5, dp.z, 0.4 * (dyn.glowInt[slot] || 0), 1.0, 0.85, 0.63]);
  return { b, doorMat: door.children[0].material, light, slot, doorPos: new THREE.Vector3(0, 0, -1.6).applyMatrix4(lot), phonePos: ph };
}

// ---------------------------------------------------------------- blocks / base town
export function fillBlocks(ctx, frontZ, ry, xFrom, xTo, dir, opts = {}) {
  const { sink } = ctx;
  let x = xFrom;
  while ((dir > 0 && x < xTo - 6) || (dir < 0 && x > xTo + 6)) {
    const w = pick([8, 10, 12, 14]);
    const remaining = Math.abs(xTo - x);
    const ww = Math.min(w, remaining);
    if (ww < 6) break;
    const cx = x + dir * ww / 2;
    const isCross = opts.cross;
    const o = { w: ww, d: pick([10, 12, 14]), floors: randInt(2, 5), style: opts.style || pick(Object.keys(STYLES).filter((s) => s !== 'hospital')), seed: randInt(1, 9999), lod: opts.lod, darkRate: opts.darkRate };
    if (!opts.lod && chance(0.7)) o.store = { name: chance(0.5) ? pick(opts.names || ['SHOES', 'RADIO', 'BOOKS', 'LIQUOR', 'PAWN', 'CAFE', 'BAKERY', 'LAUNDRY', 'TAILOR', 'GUNS', 'TOYS', 'MEATS']) : null, shutter: chance(0.5), awning: chance(0.5) ? pick([[C.awnA, C.awnB], [C.awnG, C.awnB], [C.awnBl, C.awnB]]) : null, doorX: 1.5 };
    if (isCross) { o.cx = frontZ; o.cz = cx; } else { o.cx = cx; o.cz = frontZ; }
    o.ry = ry;
    const b = building(sink, o);
    if (!opts.lod && o.floors >= 3 && chance(0.4)) fireEscape(sink, b.lot, rand(-ww / 2 + 2.5, ww / 2 - 2.5), o.floors, b.GH, b.FH, b.height);
    if (!opts.lod && chance(0.5)) drainPipe(sink, b.lot, dir > 0 ? -ww / 2 + 0.4 : ww / 2 - 0.5, b.height);
    x += dir * (ww + (chance(0.25) ? 2.5 : 0));
  }
}

// The distant town: LOD blocks along every street, skyline, far lamps and landmarks.
export function townBase(ctx, opts = {}) {
  const { sink, dyn } = ctx;
  for (const bx of [-118, 74]) { fillBlocks(ctx, -10, Math.PI, bx, bx + 44, 1, { lod: true }); fillBlocks(ctx, 10, 0, bx, bx + 44, 1, { lod: true }); }
  for (const bz of [-118, 74]) { fillBlocks(ctx, 10, Math.PI / 2, bz, bz + 44, 1, { lod: true, cross: true }); fillBlocks(ctx, -10, -Math.PI / 2, bz, bz + 44, 1, { lod: true, cross: true }); }
  for (const zc of [-64, 64]) for (const bx of [-118, -54, 10, 74]) { fillBlocks(ctx, zc - 10, Math.PI, bx, bx + 44, 1, { lod: true }); fillBlocks(ctx, zc + 10, 0, bx, bx + 44, 1, { lod: true }); }
  for (const xc of [-64, 64]) for (const bz of [-118, -54, 10, 74]) { fillBlocks(ctx, xc + 10, Math.PI / 2, bz, bz + 44, 1, { lod: true, cross: true }); fillBlocks(ctx, xc - 10, -Math.PI / 2, bz, bz + 44, 1, { lod: true, cross: true }); }
  for (const [x, z, r] of [[-80, -9, Math.PI], [-100, 9, 0], [90, -9, Math.PI], [110, 9, 0], [9, -90, -Math.PI / 2], [-9, 100, Math.PI / 2], [9, 80, -Math.PI / 2]]) lampPost(sink, x, z, r, true, dyn, { light: false });
  if (opts.tower !== false) radioTower(ctx, 34, -150);
  if (opts.waterTower !== false) waterTower(ctx, -96, -34);
}

// Standard dressing of the central intersection: poles, wires, hanging traffic light, crows, drains.
export function intersectionDressing(ctx, opts = {}) {
  const { sink, dyn, materials } = ctx;
  const poles = [];
  for (const x of [-20, -38, -56, 20, 38, 56]) poles.push(powerPole(sink, x, 9.4, 0, dyn));
  const poleE = [];
  for (const z of [-20, -38, -56, 20, 38, 56]) poleE.push(powerPole(sink, 9.4, z, Math.PI / 2, dyn));
  const linkWires = (list) => {
    const sorted = list.slice().sort((a, b) => (a.top.x + a.top.z) - (b.top.x + b.top.z));
    for (let i = 0; i + 1 < sorted.length; i++) {
      const a = sorted[i], b = sorted[i + 1];
      if (a.top.distanceTo(b.top) > 30) continue;
      for (let k = 0; k < 2; k++) dyn.lines.push(wirePoints(a.arms[k], b.arms[k], 0.7));
    }
  };
  linkWires(poles); linkWires(poleE);
  const spanA = new THREE.Vector3(-8.7, 8.6, 8.7), spanB = new THREE.Vector3(8.7, 8.6, -8.7);
  dyn.lines.push(wirePoints(spanA, spanB, 2.4, 16));
  sink.box(C.woodD, -0.16, 0.12, -0.16, 0.32, 9.0, 0.32, mat4(-8.7, 0, 8.7, 0));
  sink.box(C.woodD, -0.16, 0.12, -0.16, 0.32, 9.0, 0.32, mat4(8.7, 0, -8.7, 0));
  dyn.obstacles.push({ x: -8.7, z: 8.7, r: 0.35 }, { x: 8.7, z: -8.7, r: 0.35 });
  dyn.lines.push(wirePoints(poles[0].arms[0], new THREE.Vector3(-14, 8.0, 10.2), 0.4));
  dyn.lines.push(wirePoints(poles[3].arms[0], new THREE.Vector3(14, 8.0, 10.2), 0.4));
  if (opts.trafficLight !== false) {
    const tl = trafficLight(materials);
    tl.group.position.set(0, 8.6 - 2.4, 0);
    dyn.group.add(tl.group);
    dyn.trafficLight = tl;
    dyn.feeds.push(() => [0, 5.8, 0, tl.light.intensity > 0 ? 0.25 : 0, 1.0, 0.16, 0.1]);
  }
  if (opts.crows !== false) {
    for (let i = 0; i < 3; i++) {
      const t = 0.78 + i * 0.05;
      const c = crow(materials);
      c.position.set(lerp(spanA.x, spanB.x, t), lerp(spanA.y, spanB.y, t) - 2.4 * 4 * t * (1 - t) + 0.02, lerp(spanA.z, spanB.z, t));
      c.rotation.y = -Math.PI / 4 + (i === 1 ? Math.PI : 0);
      dyn.group.add(c); dyn.crows.push({ m: c, base: c.position.clone(), next: rand(2, 8), hop: 0, yaw: c.rotation.y });
    }
  }
  if (opts.drains !== false) {
    manhole(ctx, 2.6, 2.2, opts.steam !== false);
    for (const [gx, gz] of [[13, 5.6], [-13, -5.6], [4.6, 14]]) drainGrate(ctx, gx, gz, gx === -13 && opts.steam !== false);
  }
}

// ================================================================ build
export function buildWorld(materials, spec) {
  const sink = new Sink();
  let nextSlot = 0;
  const dyn = {
    group: new THREE.Group(), materials, lamps: [], glows: [], obstacles: [], updaters: [], lines: [], neon: [], steam: [],
    safe: [], fences: [], sparks: [], ambulances: [], feeds: [], crows: [],
    police: null, phone: null, fluor: null, trafficLight: null, beacon: null, receiver: null, canopy: null,
    glowInt: new Float32Array(24).fill(1),
    slot() { return Math.min(23, nextSlot++); },
  };
  const ctx = { sink, dyn, materials, C };
  townBase(ctx, spec.town || {});
  const built = spec.build(ctx) || {};
  const staticGroup = sink.build(materials);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x0a0a0c });
  for (const pts of dyn.lines) {
    const g = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    staticGroup.add(new THREE.Line(g, lineMat));
  }
  // chain-link fence panels (alpha-tested procedural texture); gate sections are separate meshes
  if (dyn.fences.length) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const cx2 = cv.getContext('2d'); cx2.fillStyle = '#000'; cx2.fillRect(0, 0, 64, 64);
    cx2.strokeStyle = '#fff'; cx2.lineWidth = 3;
    cx2.beginPath(); for (let i = -64; i < 128; i += 16) { cx2.moveTo(i, 0); cx2.lineTo(i + 64, 64); cx2.moveTo(i + 64, 0); cx2.lineTo(i, 64); } cx2.stroke();
    const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    for (const f of dyn.fences) {
      const segs = f.gate ? [[f.x0, f.gate[0], false], [f.gate[0], f.gate[1], true], [f.gate[1], f.x1, false]] : [[f.x0, f.x1, false]];
      for (const [a, b, isGate] of segs) {
        if (b - a < 0.2) continue;
        const t = tex.clone(); t.needsUpdate = true; t.repeat.set((b - a) * 2.2, f.h * 2.2);
        const mat = new THREE.MeshStandardMaterial({ color: 0x8a8e94, alphaMap: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.6 });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(b - a, f.h), mat);
        mesh.position.set((a + b) / 2, f.h / 2, f.z); mesh.castShadow = true;
        staticGroup.add(mesh);
        if (isGate) f.gateMesh = mesh;
      }
    }
  }
  return { staticGroup, dyn, ctx, built };
}

// ---------------------------------------------------------------- walkable area (set per chapter)
export const WALK_RECTS = [];
export function setWalkRects(rects) { WALK_RECTS.length = 0; for (const r of rects) WALK_RECTS.push(r); }
export function clampToWalkable(p) {
  let best = { x: p.x, z: p.z }, bestD = Infinity;
  for (const r of WALK_RECTS) {
    const x = clamp(p.x, r.x0, r.x1), z = clamp(p.z, r.z0, r.z1);
    const d = (x - p.x) ** 2 + (z - p.z) ** 2;
    if (d < bestD) { bestD = d; best = { x, z }; }
  }
  return best;
}
export function insideWalkable(x, z) {
  return WALK_RECTS.some((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1);
}
