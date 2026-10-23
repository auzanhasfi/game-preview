// Ground: tiled streets/sidewalks with a wet-asphalt material (puddles,
// rain ripples, planar reflections) plus the mirrored render pass that feeds it.
import * as THREE from 'three';
import { Sink } from './voxel.js';
import { hash3 } from './util.js';

// ---------------------------------------------------------------- layout
// Streets: main streets run along X at z = 0, ±64; cross streets along Z at x = 0, ±64.
export const ROAD_HALF = 6;     // asphalt half width
export const WALK_W = 4;        // sidewalk width
export const BLOCK = 64;        // street spacing
export const WALK_H = 0.12;     // curb height
export const CHASM = { x0: -40, x1: -24, z0: -10.5, z1: 10.5, on: true }; // road collapse to the west (chapter 1)

const lin = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
const COL = {
  asphalt: lin(0x1b1c20), asphaltB: lin(0x202226), patch: lin(0x141517),
  walk: lin(0x4a4a48), walkB: lin(0x424240), walkSide: lin(0x3a3a38),
  yellow: lin(0x8a7a2a), white: lin(0x9a9a92), alley: lin(0x232324),
  pit: lin(0x0a0908),
};

function nearestStreet(v) { // distance from v to nearest street centreline on that axis
  const k = Math.round(v / BLOCK) * BLOCK;
  return { c: k, d: Math.abs(v - k) };
}

// Classify a world position. Returns {kind, col} where kind ∈ road|walk|block|chasm.
export function groundAt(x, z) {
  if (CHASM.on && x > CHASM.x0 && x < CHASM.x1 && z > CHASM.z0 && z < CHASM.z1) return { kind: 'chasm' };
  const sz = nearestStreet(z), sx = nearestStreet(x);
  const onMain = sz.d < ROAD_HALF, onCross = sx.d < ROAD_HALF;
  if (onMain || onCross) return { kind: 'road', main: onMain, cross: onCross, sz, sx };
  const walkMain = sz.d < ROAD_HALF + WALK_W, walkCross = sx.d < ROAD_HALF + WALK_W;
  if (walkMain || walkCross) return { kind: 'walk', sz, sx };
  return { kind: 'block' };
}

export function isWalkable(x, z) { const g = groundAt(x, z); return g.kind === 'road' || g.kind === 'walk'; }
export function groundHeight(x, z) { return groundAt(x, z).kind === 'walk' ? WALK_H : 0; }

function tileColor(g, x, z, size) {
  const h = hash3(Math.round(x * 3), 7, Math.round(z * 3));
  const h2 = hash3(Math.round(x * 3), 11, Math.round(z * 3));
  if (g.kind === 'road') {
    let c = h2 < 0.5 ? COL.asphalt : COL.asphaltB;
    if (h < 0.06) c = COL.patch;
    let mark = null;
    // centre line + lane dashes on the main street (not inside the intersection)
    if (g.main && !g.cross) {
      const dz = z - g.sz.c;
      if (Math.abs(dz) < 0.5 * size) mark = COL.yellow;
      else if (Math.abs(Math.abs(dz) - 3) < 0.5 * size && ((Math.floor(x / 3) % 2) === 0)) mark = COL.white;
    }
    if (g.cross && !g.main) {
      const dx = x - g.sx.c;
      if (Math.abs(dx) < 0.5 * size) mark = COL.yellow;
      else if (Math.abs(Math.abs(dx) - 3) < 0.5 * size && ((Math.floor(z / 3) % 2) === 0)) mark = COL.white;
    }
    // crosswalk stripes at intersection edges
    if (g.main && !g.cross) {
      const dx = Math.abs(x - g.sx.c);
      if (dx > ROAD_HALF + 0.5 && dx < ROAD_HALF + 3.5 && (Math.floor(z - g.sz.c + 100) % 2 === 0)) mark = COL.white;
    }
    if (g.cross && !g.main) {
      const dz = Math.abs(z - g.sz.c);
      if (dz > ROAD_HALF + 0.5 && dz < ROAD_HALF + 3.5 && (Math.floor(x - g.sx.c + 100) % 2 === 0)) mark = COL.white;
    }
    if (mark) {
      const wear = 0.35 + 0.5 * h; // worn paint
      c = [c[0] + (mark[0] - c[0]) * wear, c[1] + (mark[1] - c[1]) * wear, c[2] + (mark[2] - c[2]) * wear];
    }
    return c;
  }
  if (g.kind === 'walk') return h2 < 0.5 ? COL.walk : COL.walkB;
  return COL.alley;
}

// Build the ground geometry: a grid of tiles. Fine tiles near the centre, coarse further out.
export function buildGround() {
  const sink = new Sink();
  const wetAttr = []; // per vertex wetness (road 1, walk 0.55, block 0.2)
  const mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

  const tile = (x, z, size) => {
    const g = groundAt(x + size / 2, z + size / 2);
    if (g.kind === 'chasm') return;
    const y = g.kind === 'walk' ? WALK_H : 0;
    const c = tileColor(g, x + size / 2, z + size / 2, size);
    const wet = g.kind === 'road' ? 1 : g.kind === 'walk' ? 0.55 : 0.25;
    const edge = mul(c, g.kind === 'walk' ? 0.8 : 0.9);
    const b = sink.buf('wet');
    // 5 verts: 4 corners (edge colour) + centre (tile colour) -> soft grout look
    const base = b.v;
    const corners = [[x, y, z], [x, y, z + size], [x + size, y, z + size], [x + size, y, z]];
    for (const p of corners) { b.pos.push(p[0], p[1], p[2]); b.nrm.push(0, 1, 0); b.col.push(edge[0], edge[1], edge[2]); wetAttr.push(wet); }
    b.pos.push(x + size / 2, y, z + size / 2); b.nrm.push(0, 1, 0); b.col.push(c[0], c[1], c[2]); wetAttr.push(wet);
    const cI = base + 4;
    b.idx.push(base, base + 1, cI, base + 1, base + 2, cI, base + 2, base + 3, cI, base + 3, base, cI);
    b.v += 5;
    // curb faces where a sidewalk tile borders a lower tile
    if (g.kind === 'walk') {
      const nb = [[0, -size, [x, x + size], 'zlo'], [0, size, [x, x + size], 'zhi'], [-size, 0, [z, z + size], 'xlo'], [size, 0, [z, z + size], 'xhi']];
      for (const [dx, dz, , side] of nb) {
        const ng = groundAt(x + size / 2 + dx, z + size / 2 + dz);
        if (ng.kind === 'walk') continue;
        const sc = COL.walkSide;
        const cs = [sc, sc, mul(sc, 0.7), mul(sc, 0.7)];
        let pts, n;
        if (side === 'zlo') { pts = [[x, WALK_H, z], [x + size, WALK_H, z], [x + size, 0, z], [x, 0, z]]; n = [0, 0, -1]; }
        else if (side === 'zhi') { pts = [[x + size, WALK_H, z + size], [x, WALK_H, z + size], [x, 0, z + size], [x + size, 0, z + size]]; n = [0, 0, 1]; }
        else if (side === 'xlo') { pts = [[x, WALK_H, z + size], [x, WALK_H, z], [x, 0, z], [x, 0, z + size]]; n = [-1, 0, 0]; }
        else { pts = [[x + size, WALK_H, z], [x + size, WALK_H, z + size], [x + size, 0, z + size], [x + size, 0, z]]; n = [1, 0, 0]; }
        sink.quad('wet', pts, n, cs);
        for (let i = 0; i < 4; i++) wetAttr.push(0.3);
      }
    }
  };

  // fine tiles: [-70, 70]
  const F = 70;
  for (let x = -F; x < F; x += 1) for (let z = -F; z < F; z += 1) tile(x, z, 1);
  // coarse ring: 4 m tiles out to ±260
  const C = 260;
  for (let x = -C; x < C; x += 4) for (let z = -C; z < C; z += 4) {
    if (x >= -F && x < F && z >= -F && z < F) continue;
    tile(x, z, 4);
  }
  const geos = sink.geometries({ wet: (cls) => cls === 'wet' ? new THREE.Float32BufferAttribute(wetAttr, 1) : null });
  return geos.wet;
}

// ---------------------------------------------------------------- material
export const wetUniforms = {
  tRefl: { value: null },
  tReflBlur: { value: null },
  uReflMatrix: { value: new THREE.Matrix4() },
  uTime: { value: 0 },
  uRain: { value: 1 },
  uPuddle: { value: 1 },
  uFlood: { value: 0 },
  uSteps: { value: new Float32Array(24) },
};

const wetPars = /* glsl */`
uniform sampler2D tRefl;
uniform sampler2D tReflBlur;
uniform float uTime;
uniform float uRain;
uniform float uPuddle;
uniform float uFlood;
uniform vec4 uSteps[6];
varying vec4 vReflUv;
varying vec3 vWPos;
varying float vWet;
float wPuddle = 0.0; float wUp = 0.0; vec3 wN = vec3(0.0, 1.0, 0.0);

float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1, 0)), f.x), mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }

// One layer of rain-drop ripples: returns a surface slope (xz gradient).
vec2 rippleLayer(vec2 p, float t) {
  vec2 id = floor(p); vec2 f = fract(p) - 0.5;
  float n = hash21(id), n2 = hash21(id + 31.7);
  float ph = fract(t + n);
  vec2 c = (vec2(n, n2) - 0.5) * 0.5;
  vec2 d = f - c; float r = length(d);
  float R = ph * 0.42;
  float x = (r - R) * 14.0;
  float wave = sin(x * 1.6) * exp(-x * x * 0.35) * (1.0 - ph) * (1.0 - ph);
  wave *= step(0.05, ph);
  return (r > 1e-4 ? d / r : vec2(0.0)) * wave;
}
vec2 rainSlope(vec2 p, float t) {
  vec2 g = rippleLayer(p * 2.1, t * 1.1) * 0.8;
  g += rippleLayer(p * 3.3 + 7.3, t * 1.35 + 0.37) * 0.5;
  g += rippleLayer(p * 1.3 + 3.1, t * 0.9 + 0.71) * 0.9;
  return g;
}
// Expanding rings from recent footsteps (x, z, start time, strength).
vec2 stepRipples(vec2 p) {
  vec2 g = vec2(0.0);
  for (int i = 0; i < 6; i++) {
    vec4 s = uSteps[i];
    float age = uTime - s.z;
    if (s.w <= 0.0 || age < 0.0 || age > 1.8) continue;
    vec2 d = p - s.xy; float r = length(d);
    float x = (r - age * 1.5) * 7.0;
    float wave = sin(x * 2.2) * exp(-x * x * 0.3) * (1.0 - age / 1.8) * s.w;
    g += (r > 1e-4 ? d / r : vec2(0.0)) * wave;
  }
  return g;
}
`;

const wetColor = /* glsl */`
{
  float pn = fbm(vWPos.xz * 0.16 + vec2(3.7, 1.3));
  float edge = vnoise(vWPos.xz * 1.7) * 0.08;
  float puddleMask = smoothstep(0.50 + edge, 0.56 + edge, pn) * vWet * uPuddle;
  puddleMask = clamp(puddleMask + uFlood * smoothstep(0.2, 0.5, vWet), 0.0, 1.0);
  wPuddle = puddleMask;
  // wet darkening: damp surface is darker, puddles darker still
  diffuseColor.rgb *= mix(1.0, 0.62, vWet * 0.85);
  diffuseColor.rgb *= mix(1.0, 0.3, wPuddle);
  // flood water: a cold green-grey body instead of black asphalt
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.05, 0.085, 0.095), uFlood * smoothstep(0.2, 0.5, vWet) * 0.6);
}
`;

const wetNormal = /* glsl */`
{
  vec3 viewUp = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
  float ny = dot(normal, viewUp);
  wUp = smoothstep(0.6, 0.95, ny);
  vec2 g = rainSlope(vWPos.xz, uTime * 0.9) * uRain;
  // gentle wind agitation on puddles
  g += vec2(sin(vWPos.x * 6.0 + uTime * 2.1) * 0.02, cos(vWPos.z * 5.0 + uTime * 1.7) * 0.02);
  g += stepRipples(vWPos.xz) * (0.4 + 0.6 * wPuddle);
  float amp = mix(0.25, 1.0, wPuddle) * 0.9;
  wN = normalize(vec3(-g.x * amp, 1.0, -g.y * amp));
  vec3 vpN = normalize((viewMatrix * vec4(wN, 0.0)).xyz);
  normal = normalize(mix(normal, vpN, wUp));
}
`;

const wetRefl = /* glsl */`
{
  vec2 ruv = vReflUv.xy / vReflUv.w;
  vec2 dist = wN.xz * (0.045 * wPuddle + 0.012);
  vec3 sharp = texture2D(tRefl, clamp(ruv + dist, 0.001, 0.999)).rgb;
  vec3 blur = texture2D(tReflBlur, clamp(ruv + dist * 0.5, 0.001, 0.999)).rgb;
  vec3 refl = mix(blur, sharp, wPuddle);
  vec3 V = isOrthographic ? vec3(0.0, 0.0, 1.0) : normalize(vViewPosition);
  float NoV = clamp(dot(normal, V), 0.0, 1.0);
  float fres = pow(1.0 - NoV, 3.0);
  float damp = vWet * (0.5 + 0.5 * fres);
  float pud = 0.9 + 0.1 * fres;
  float amt = wUp * mix(damp, pud, wPuddle);
  outgoingLight = outgoingLight * (1.0 - amt * 0.7) + refl * amt;
}
`;

export function makeWetMaterial() {
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.0 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, wetUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uReflMatrix; attribute float wet; varying vec4 vReflUv; varying vec3 vWPos; varying float vWet;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n{ vec4 wp4 = modelMatrix * vec4(transformed, 1.0); vWPos = wp4.xyz; vReflUv = uReflMatrix * wp4; vWet = wet; }');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + wetPars)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + wetColor)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(mix(roughnessFactor, 0.35, vWet * 0.6), 0.06, wPuddle);')
      .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n' + wetNormal)
      .replace('#include <opaque_fragment>', wetRefl + '\n#include <opaque_fragment>');
  };
  mat.customProgramCacheKey = () => 'wet-ground';
  return mat;
}

// ---------------------------------------------------------------- reflection pass
const blurVert = /* glsl */`
varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const blurFrag = /* glsl */`
uniform sampler2D tDiffuse; uniform vec2 uDir; varying vec2 vUv;
void main(){
  vec3 c = vec3(0.0); float ws = 0.0;
  for (int i = -6; i <= 6; i++) {
    float w = exp(-float(i * i) / 14.0);
    vec3 s = texture2D(tDiffuse, vUv + uDir * float(i)).rgb;
    if (any(isnan(s)) || any(isinf(s))) s = vec3(0.0);
    c += s * w; ws += w;
  }
  gl_FragColor = vec4(c / ws, 1.0);
}`;

export class Reflection {
  constructor(renderer, scene, width, height, scale = 0.5) {
    this.renderer = renderer; this.scene = scene;
    this.mirrorCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    this.mirrorCam.layers.set(0);
    this.textureMatrix = new THREE.Matrix4();
    this.clipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.02);
    this.fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.fsQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    this.fsScene = new THREE.Scene(); this.fsScene.add(this.fsQuad);
    this.blurMat = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() } }, vertexShader: blurVert, fragmentShader: blurFrag, depthTest: false, depthWrite: false });
    this.setSize(width, height, scale);
  }
  setSize(width, height, scale) {
    this.scale = scale;
    const w = Math.max(8, Math.floor(width * scale)), h = Math.max(8, Math.floor(height * scale));
    const bw = Math.max(4, Math.floor(w * 0.5)), bh = Math.max(4, Math.floor(h * 0.5));
    if (this.rt) { this.rt.dispose(); this.blurA.dispose(); this.blurB.dispose(); }
    const opts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true, stencilBuffer: false };
    this.rt = new THREE.WebGLRenderTarget(w, h, opts);
    this.blurA = new THREE.WebGLRenderTarget(bw, bh, { ...opts, depthBuffer: false });
    this.blurB = new THREE.WebGLRenderTarget(bw, bh, { ...opts, depthBuffer: false });
    wetUniforms.tRefl.value = this.rt.texture;
    wetUniforms.tReflBlur.value = this.blurB.texture;
    this.bw = bw; this.bh = bh;
  }
  // Render the scene mirrored through y=0 from the main camera's viewpoint.
  render(camera, hidden) {
    const r = this.renderer, mc = this.mirrorCam;
    // mirror the camera through the ground plane
    const pos = camera.position, dir = camera.getWorldDirection(new THREE.Vector3());
    mc.position.set(pos.x, -pos.y, pos.z);
    mc.up.set(0, -1, 0);
    mc.lookAt(pos.x + dir.x, -(pos.y + dir.y), pos.z + dir.z);
    mc.left = camera.left; mc.right = camera.right; mc.top = camera.top; mc.bottom = camera.bottom;
    mc.near = camera.near; mc.far = camera.far; mc.zoom = camera.zoom;
    mc.updateProjectionMatrix();
    mc.updateMatrixWorld();
    this.textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    this.textureMatrix.multiply(mc.projectionMatrix).multiply(mc.matrixWorldInverse);
    wetUniforms.uReflMatrix.value.copy(this.textureMatrix);

    for (const o of hidden) o.visible = false;
    const prevClip = r.clippingPlanes;
    r.clippingPlanes = [this.clipPlane];
    r.setRenderTarget(this.rt);
    r.clear();
    r.render(this.scene, mc);
    r.clippingPlanes = prevClip;
    for (const o of hidden) o.visible = true;

    // blur (stretched vertically for the streaky wet look)
    this.fsQuad.material = this.blurMat;
    this.blurMat.uniforms.tDiffuse.value = this.rt.texture;
    this.blurMat.uniforms.uDir.value.set(1.0 / this.bw, 0);
    r.setRenderTarget(this.blurA); r.render(this.fsScene, this.fsCam);
    this.blurMat.uniforms.tDiffuse.value = this.blurA.texture;
    this.blurMat.uniforms.uDir.value.set(0, 2.2 / this.bh);
    r.setRenderTarget(this.blurB); r.render(this.fsScene, this.fsCam);
    r.setRenderTarget(null);
  }
}
