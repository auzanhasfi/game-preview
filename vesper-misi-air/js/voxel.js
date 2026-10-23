// Voxel modelling: a palette of materials, a dense voxel grid, and a geometry
// sink that meshes voxels (with baked vertex ambient occlusion) and arbitrary
// boxes into a handful of merged, vertex-coloured meshes.
import * as THREE from 'three';
import { hash3, FONT } from './util.js';

// ---------------------------------------------------------------- palette
// Each entry: linear rgb colour, material class, per-voxel jitter amount.
// Classes: matte (rough PBR), shiny (glossy PBR), emit (unlit HDR), glass.
export const palette = [{ c: [0, 0, 0], cls: 'matte', jit: 0 }]; // 0 = empty
const paletteCache = new Map();
const tmpColor = new THREE.Color();

export function P(hex, cls = 'matte', jit = 0.06, mul = 1) {
  const key = `${hex}|${cls}|${jit}|${mul}`;
  if (paletteCache.has(key)) return paletteCache.get(key);
  tmpColor.set(hex);
  const c = [tmpColor.r * mul, tmpColor.g * mul, tmpColor.b * mul];
  const idx = palette.length;
  palette.push({ c, cls, jit });
  paletteCache.set(key, idx);
  return idx;
}
// Emissive shortcut: colour * intensity, no jitter.
export const E = (hex, intensity = 2) => P(hex, 'emit', 0, intensity);

// ---------------------------------------------------------------- grid
export class Vox {
  constructor(w, h, d) {
    this.w = w; this.h = h; this.d = d;
    this.data = new Uint16Array(w * h * d);
  }
  get(x, y, z) {
    if (x < 0 || y < 0 || z < 0 || x >= this.w || y >= this.h || z >= this.d) return 0;
    return this.data[x + this.w * (y + this.h * z)];
  }
  set(x, y, z, v) {
    if (x < 0 || y < 0 || z < 0 || x >= this.w || y >= this.h || z >= this.d) return;
    this.data[x + this.w * (y + this.h * z)] = v;
  }
  // Inclusive box fill.
  box(x0, y0, z0, x1, y1, z1, v) {
    const ax = Math.max(0, Math.min(x0, x1)), bx = Math.min(this.w - 1, Math.max(x0, x1));
    const ay = Math.max(0, Math.min(y0, y1)), by = Math.min(this.h - 1, Math.max(y0, y1));
    const az = Math.max(0, Math.min(z0, z1)), bz = Math.min(this.d - 1, Math.max(z0, z1));
    for (let z = az; z <= bz; z++) for (let y = ay; y <= by; y++) {
      const row = this.w * (y + this.h * z);
      for (let x = ax; x <= bx; x++) this.data[x + row] = v;
    }
  }
  // Hollow box (shell of thickness 1).
  shell(x0, y0, z0, x1, y1, z1, v) {
    this.box(x0, y0, z0, x1, y1, z1, v);
    if (x1 - x0 >= 2 && y1 - y0 >= 2 && z1 - z0 >= 2) this.box(x0 + 1, y0 + 1, z0 + 1, x1 - 1, y1 - 1, z1 - 1, 0);
  }
  // Write 3x5 font text. dir: 'x' (runs along +x, faces -z/+z) or 'z' (runs along +z).
  // Text reads correctly for a viewer standing on the -Z side (facing +Z), so the
  // run direction is mirrored along x.
  text(str, x, y, z, v, dir = 'x') {
    const tw = str.length * 4 - 1;
    let cx = 0;
    for (const ch of str.toUpperCase()) {
      const g = FONT[ch] || FONT[' '];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
        if (g[r][c] !== '#') continue;
        if (dir === 'x') this.set(x + (tw - 1) - (cx + c), y + 4 - r, z, v);
        else this.set(x, y + 4 - r, z + cx + c, v);
      }
      cx += 4;
    }
  }
}

// ---------------------------------------------------------------- mesher
// Face table: normal, four corner offsets (CCW from outside), tangent axes.
const FACES = [
  { n: [1, 0, 0], c: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
  { n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] },
  { n: [0, 1, 0], c: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]] },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { n: [0, 0, -1], c: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]] },
];
const AO_LEVEL = [0.42, 0.62, 0.82, 1.0];

function newBuf() { return { pos: [], nrm: [], col: [], idx: [], cut: [], v: 0 }; }

const _v = new THREE.Vector3();
const _n = new THREE.Vector3();
const _m3 = new THREE.Matrix3();

export class Sink {
  constructor() { this.bufs = {}; this.cutFlag = 0; }
  buf(cls) { return this.bufs[cls] || (this.bufs[cls] = newBuf()); }

  // Push one quad (4 verts) with per-vertex colours into a class buffer.
  _quad(b, pts, nrm, cols, flip) {
    const base = b.v;
    for (let i = 0; i < 4; i++) {
      b.pos.push(pts[i][0], pts[i][1], pts[i][2]);
      b.nrm.push(nrm[0], nrm[1], nrm[2]);
      b.col.push(cols[i][0], cols[i][1], cols[i][2]);
      b.cut.push(this.cutFlag);
    }
    if (flip) b.idx.push(base + 1, base + 2, base + 3, base + 1, base + 3, base);
    else b.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    b.v += 4;
  }

  // Mesh a Vox grid into the sink. scale = metres per voxel, matrix = world transform
  // applied to (voxel * scale) coordinates. opts.noBottom drops -Y faces at y=0.
  vox(vox, scale, matrix, opts = {}) {
    const { w, h, d, data } = vox;
    _m3.setFromMatrix4(matrix);
    const noBottom = !!opts.noBottom;
    const aoStrength = opts.ao === undefined ? 1 : opts.ao;
    const get = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= w || y >= h || z >= d) ? 0 : data[x + w * (y + h * z)];
    const pts = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const cols = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const aos = [0, 0, 0, 0];
    for (let z = 0; z < d; z++) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const v = data[x + w * (y + h * z)];
      if (!v) continue;
      const pal = palette[v];
      const b = this.buf(pal.cls);
      const jit = pal.jit ? 1 + (hash3(x, y, z) - 0.5) * 2 * pal.jit : 1;
      const isEmit = pal.cls === 'emit';
      for (let f = 0; f < 6; f++) {
        const F = FACES[f], n = F.n;
        const nx = x + n[0], ny = y + n[1], nz = z + n[2];
        if (get(nx, ny, nz)) continue;
        if (noBottom && f === 3 && y === 0) continue;
        let flip = false;
        for (let i = 0; i < 4; i++) {
          const c = F.c[i];
          // corner ambient occlusion
          let ao = 3;
          if (!isEmit && aoStrength > 0) {
            // tangent axes = the two axes not equal to the normal axis
            const ax = n[0] !== 0 ? [1, 2] : n[1] !== 0 ? [0, 2] : [0, 1];
            const s = [0, 0, 0];
            s[ax[0]] = c[ax[0]] ? 1 : -1;
            s[ax[1]] = c[ax[1]] ? 1 : -1;
            const o = [nx, ny, nz];
            const p1 = [o[0], o[1], o[2]]; p1[ax[0]] += s[ax[0]];
            const p2 = [o[0], o[1], o[2]]; p2[ax[1]] += s[ax[1]];
            const p3 = [p1[0], p1[1], p1[2]]; p3[ax[1]] += s[ax[1]];
            const s1 = get(p1[0], p1[1], p1[2]) ? 1 : 0;
            const s2 = get(p2[0], p2[1], p2[2]) ? 1 : 0;
            const s3 = get(p3[0], p3[1], p3[2]) ? 1 : 0;
            ao = (s1 && s2) ? 0 : 3 - (s1 + s2 + s3);
          }
          aos[i] = ao;
          const shade = isEmit ? 1 : (1 - (1 - AO_LEVEL[ao]) * aoStrength) * jit;
          _v.set((x + c[0]) * scale, (y + c[1]) * scale, (z + c[2]) * scale).applyMatrix4(matrix);
          pts[i][0] = _v.x; pts[i][1] = _v.y; pts[i][2] = _v.z;
          cols[i][0] = pal.c[0] * shade; cols[i][1] = pal.c[1] * shade; cols[i][2] = pal.c[2] * shade;
        }
        if (aos[0] + aos[2] < aos[1] + aos[3]) flip = true;
        _n.set(n[0], n[1], n[2]).applyMatrix3(_m3).normalize();
        this._quad(b, pts, [_n.x, _n.y, _n.z], cols, flip);
      }
    }
  }

  // Axis-aligned box in local space [x,x+w]x[y,y+h]x[z,z+d], transformed by matrix.
  // pal = palette index. opts.bottomShade darkens the bottom vertices (fake contact AO).
  box(pal, x, y, z, w, h, d, matrix = null, opts = {}) {
    const p = palette[pal];
    const b = this.buf(p.cls);
    const bottomShade = opts.bottomShade || 0;
    const jit = opts.jit === undefined ? p.jit : opts.jit;
    const j = jit ? 1 + (hash3(Math.round(x * 7), Math.round(y * 7), Math.round(z * 7)) - 0.5) * 2 * jit : 1;
    const pts = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const cols = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
    if (matrix) _m3.setFromMatrix4(matrix);
    for (let f = 0; f < 6; f++) {
      const F = FACES[f];
      if (opts.noBottom && f === 3) continue;
      if (opts.noTop && f === 2) continue;
      for (let i = 0; i < 4; i++) {
        const c = F.c[i];
        _v.set(x + c[0] * w, y + c[1] * h, z + c[2] * d);
        if (matrix) _v.applyMatrix4(matrix);
        pts[i][0] = _v.x; pts[i][1] = _v.y; pts[i][2] = _v.z;
        const sh = (c[1] === 0 ? 1 - bottomShade : 1) * j * (F.n[1] < 0 ? 0.6 : 1);
        cols[i][0] = p.c[0] * sh; cols[i][1] = p.c[1] * sh; cols[i][2] = p.c[2] * sh;
      }
      _n.set(F.n[0], F.n[1], F.n[2]);
      if (matrix) _n.applyMatrix3(_m3).normalize();
      this._quad(b, pts, [_n.x, _n.y, _n.z], cols, false);
    }
  }

  // Arbitrary quad (world space), 4 points CCW, single normal, per-vertex colours.
  quad(cls, pts, nrm, cols) { this._quad(this.buf(cls), pts, nrm, cols, false); }

  // Produce BufferGeometries keyed by class.
  geometries(extraAttribs = null) {
    const out = {};
    for (const cls in this.bufs) {
      const b = this.bufs[cls];
      if (!b.v) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nrm, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3));
      g.setAttribute('cut', new THREE.Float32BufferAttribute(b.cut, 1));
      if (extraAttribs) for (const name in extraAttribs) {
        const a = extraAttribs[name](cls, b);
        if (a) g.setAttribute(name, a);
      }
      g.setIndex(b.v > 65000 ? new THREE.Uint32BufferAttribute(b.idx, 1) : new THREE.Uint16BufferAttribute(b.idx, 1));
      g.computeBoundingSphere();
      out[cls] = g;
    }
    return out;
  }

  // Build meshes with the given materials map {cls: material}. Returns a Group.
  build(materials, opts = {}) {
    const group = new THREE.Group();
    const geos = this.geometries();
    for (const cls in geos) {
      const m = new THREE.Mesh(geos[cls], materials[cls]);
      m.castShadow = opts.castShadow !== false && cls !== 'glass';
      m.receiveShadow = opts.receiveShadow !== false;
      m.name = cls;
      group.add(m);
    }
    return group;
  }
}

// Occluder cut-out: geometry between the camera and the player dissolves in a
// screen-space disc so the character is never hidden behind a building.
// uCut = (view x, view y, view depth of the player, radius). Radius 0 disables.
export const cutU = { uCut: { value: new THREE.Vector4(0, 0, 0, 0) }, uCutY: { value: 0 } };
export function applyCutout(mat) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uCut = cutU.uCut; shader.uniforms.uCutY = cutU.uCutY;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float cut; varying vec3 vCutPos; varying float vCutH; varying float vCut;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvCutPos = mvPosition.xyz; vCutH = (modelMatrix * vec4(transformed, 1.0)).y; vCut = cut;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec4 uCut; uniform float uCutY; varying vec3 vCutPos; varying float vCutH; varying float vCut;')
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
      if (uCut.w > 0.0 && vCut > 0.5) {
        float r = length(vCutPos.xy - uCut.xy) / uCut.w;
        float front = uCut.z - (-vCutPos.z);
        if (front > 1.0 && r < 1.0 && vCutH > uCutY) {
          float keep = smoothstep(0.72, 1.0, r); keep *= keep;
          vec2 q = floor(mod(gl_FragCoord.xy, 8.0));
          float bayer = fract(dot(q, vec2(0.1875, 0.3125)) + q.x * q.y * 0.03125);
          if (bayer > keep) discard;
        }
      }`);
  };
  mat.customProgramCacheKey = () => 'cutout';
  return mat;
}

// Clone a shared material and keep the cut-out patch (Material.clone drops onBeforeCompile).
export function cloneMat(m) { return applyCutout(m.clone()); }

// Shared materials for the four classes.
export function makeMaterials() {
  return {
    matte: applyCutout(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0.0 })),
    shiny: applyCutout(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.35 })),
    emit: applyCutout(new THREE.MeshBasicMaterial({ vertexColors: true })),
    glass: applyCutout(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.4, depthWrite: false })),
  };
}

// Convenience: mesh a single Vox into a Group of meshes (for dynamic objects).
export function voxGroup(vox, scale, materials, opts = {}) {
  const s = new Sink();
  if (opts.cut) s.cutFlag = 1;
  const m = new THREE.Matrix4();
  if (opts.center) m.makeTranslation(-vox.w * scale * 0.5, opts.centerY ? -vox.h * scale * 0.5 : 0, -vox.d * scale * 0.5);
  if (opts.offset) m.makeTranslation(opts.offset[0], opts.offset[1], opts.offset[2]);
  s.vox(vox, scale, m, opts);
  return s.build(materials, opts);
}
