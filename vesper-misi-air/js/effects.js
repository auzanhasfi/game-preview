// Atmosphere: rain streaks, drips, ground mist, light halos, steam, blowing
// paper, and volumetric-looking light cones. Particle systems are GPU driven.
import * as THREE from 'three';
import { rand } from './util.js';

// Lights that cheaply illuminate particles (flashlight + a few lamps).
export const NLAMP = 8;
export const lightU = {
  uFlashPos: { value: new THREE.Vector3() },
  uFlashDir: { value: new THREE.Vector3(0, 0, 1) },
  uFlashInt: { value: 1 },
  uLampPos: { value: Array.from({ length: NLAMP }, () => new THREE.Vector4(0, -100, 0, 0)) },
  uLampCol: { value: Array.from({ length: NLAMP }, () => new THREE.Vector3(1, 1, 1)) },
};

export const lightGLSL = /* glsl */`
uniform vec3 uFlashPos; uniform vec3 uFlashDir; uniform float uFlashInt;
uniform vec4 uLampPos[${NLAMP}]; uniform vec3 uLampCol[${NLAMP}];
vec3 particleLight(vec3 p) {
  vec3 acc = vec3(0.0);
  vec3 d = p - uFlashPos; float dist = max(length(d), 0.3); d /= dist;
  float cone = smoothstep(0.80, 0.95, dot(d, uFlashDir));
  acc += vec3(1.0, 0.9, 0.75) * cone * uFlashInt * 1.6 / (1.0 + 0.10 * dist * dist);
  for (int i = 0; i < ${NLAMP}; i++) {
    vec3 l = uLampPos[i].xyz - p; float d2 = dot(l, l);
    acc += uLampCol[i] * uLampPos[i].w / (1.0 + 0.35 * d2);
  }
  return acc;
}
uniform vec3 fogColor; uniform float fogNear; uniform float fogFar;
float fogVis(float depth) { return 1.0 - smoothstep(fogNear, fogFar, depth); }
`;

const fogU = () => ({ fogColor: { value: new THREE.Color() }, fogNear: { value: 1 }, fogFar: { value: 1000 } });

// ------------------------------------------------------------ rain streaks
export function makeRain(count, opts = {}) {
  const radius = opts.radius || 34, height = opts.height || 14;
  const base = new THREE.PlaneGeometry(1, 1); base.translate(0, 0.5, 0);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index; geo.attributes.position = base.attributes.position; geo.attributes.uv = base.attributes.uv;
  const off = new Float32Array(count * 3), seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    let x, z, r;
    if (opts.line) { x = rand(opts.line[0], opts.line[2]); z = rand(opts.line[1], opts.line[3]); }
    else { const a = rand(0, Math.PI * 2); r = Math.sqrt(rand()) * radius; x = Math.cos(a) * r; z = Math.sin(a) * r; }
    off[i * 3] = x; off[i * 3 + 1] = rand(0, height); off[i * 3 + 2] = z; seed[i] = rand();
  }
  geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(off, 3));
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1));
  geo.instanceCount = count;
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...lightU, ...fogU(), uCenter: { value: new THREE.Vector3() }, uTime: { value: 0 }, uRadius: { value: radius }, uHeight: { value: height }, uWind: { value: new THREE.Vector3(opts.windX ?? 1.2, 0, opts.windZ ?? 0.5) }, uSpeed: { value: opts.speed || 9 }, uWidth: { value: opts.width || 0.034 }, uLen: { value: opts.len || 0.55 }, uBright: { value: opts.bright || 1.8 } },
    vertexShader: /* glsl */`
      attribute vec3 aOffset; attribute float aSeed;
      uniform vec3 uCenter; uniform float uTime; uniform float uRadius; uniform float uHeight; uniform vec3 uWind; uniform float uSpeed; uniform float uWidth; uniform float uLen;
      varying float vAlpha; varying vec3 vLight; varying float vT; varying float vFog;
      ${lightGLSL}
      void main(){
        float sp = uSpeed * (0.8 + 0.4 * aSeed);
        float fall = mod(aOffset.y - uTime * sp, uHeight);
        vec3 dir = normalize(vec3(uWind.x, -sp, uWind.z));
        vec3 center = vec3(uCenter.x + aOffset.x, fall, uCenter.z + aOffset.z);
        center.xz += uWind.xz * (uHeight - fall) / sp;
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        float len = uLen * (0.7 + 0.6 * aSeed);
        vec3 p = center + right * ((position.x) * uWidth) + dir * (position.y * len);
        float rr = length(aOffset.xz) / uRadius;
        vAlpha = (1.0 - smoothstep(0.7, 1.0, rr)) * (0.5 + 0.5 * aSeed) * smoothstep(0.0, 1.0, fall) * (1.0 - smoothstep(uHeight - 2.0, uHeight, fall));
        vLight = particleLight(center);
        vT = position.y;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        vFog = fogVis(-mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying float vAlpha; varying vec3 vLight; varying float vT; varying float vFog; uniform float uBright;
      void main(){
        float head = pow(vT, 1.5);
        vec3 col = (vec3(0.55, 0.62, 0.72) * 0.09 + vLight * 0.36) * vAlpha * head * vFog * uBright;
        gl_FragColor = vec4(col, 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: true, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.layers.set(1);
  mesh.userData.update = (t, center) => { mat.uniforms.uTime.value = t; if (center) mat.uniforms.uCenter.value.copy(center); };
  return mesh;
}

// ------------------------------------------------------------ ground mist
const noiseGLSL = /* glsl */`
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash21(i), hash21(i+vec2(1,0)), f.x), mix(hash21(i+vec2(0,1)), hash21(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * vnoise(p); p = p * 2.02 + 11.3; a *= 0.5; } return s; }
`;

export function makeMist(color) {
  const group = new THREE.Group();
  const layers = [[0.35, 0.05, 0.18, 1.0], [0.9, 0.035, 0.14, -0.7], [1.6, 0.025, 0.11, 0.5]];
  for (const [y, scale, alpha, dirSign] of layers) {
    const geo = new THREE.PlaneGeometry(110, 110, 1, 1); geo.rotateX(-Math.PI / 2);
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...lightU, ...fogU(), uTime: { value: 0 }, uColor: { value: color.clone() }, uAlpha: { value: alpha }, uScale: { value: scale }, uWind: { value: new THREE.Vector2(1.0 * dirSign, 0.35) } },
      vertexShader: /* glsl */`varying vec2 vUv; varying vec3 vWPos; varying float vFog; uniform vec3 fogColor; uniform float fogNear; uniform float fogFar;
        void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWPos = wp.xyz; vec4 mv = viewMatrix * wp; vFog = 1.0 - smoothstep(fogNear, fogFar, -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */`varying vec2 vUv; varying vec3 vWPos; varying float vFog; uniform float uTime; uniform vec3 uColor; uniform float uAlpha; uniform float uScale; uniform vec2 uWind;
        ${lightGLSL} ${noiseGLSL}
        void main(){
          vec2 p = vWPos.xz * uScale + uWind * uTime * 0.03;
          float n = fbm(p) * 0.7 + fbm(p * 2.7 - uWind * uTime * 0.05) * 0.3;
          n = smoothstep(0.32, 0.78, n);
          float edge = 1.0 - smoothstep(0.5, 1.0, length(vUv - 0.5) * 2.0);
          vec3 light = particleLight(vWPos);
          vec3 col = uColor * 3.0 + light * 0.22;
          gl_FragColor = vec4(col, n * edge * uAlpha * vFog);
        }`,
      transparent: true, depthWrite: false, fog: true,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y; m.layers.set(1); m.frustumCulled = false; m.renderOrder = 5;
    group.add(m);
  }
  group.userData.update = (t, center) => { group.position.set(center.x, 0, center.z); for (const m of group.children) m.material.uniforms.uTime.value = t; };
  return group;
}

// ------------------------------------------------------------ light halos
// list: [{pos:[x,y,z], color:hex, size, slot}] — slot indexes uInt[] for dynamic flicker.
export function makeGlows(list) {
  const n = list.length;
  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index; geo.attributes.position = base.attributes.position; geo.attributes.uv = base.attributes.uv;
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n), slot = new Float32Array(n);
  const c = new THREE.Color();
  list.forEach((g, i) => {
    pos.set(g.pos, i * 3); c.set(g.color); col.set([c.r, c.g, c.b], i * 3); size[i] = g.size || 3; slot[i] = g.slot ?? -1;
  });
  geo.setAttribute('aPos', new THREE.InstancedBufferAttribute(pos, 3));
  geo.setAttribute('aCol', new THREE.InstancedBufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.InstancedBufferAttribute(size, 1));
  geo.setAttribute('aSlot', new THREE.InstancedBufferAttribute(slot, 1));
  geo.instanceCount = n;
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...fogU(), uInt: { value: new Float32Array(16).fill(1) }, uGlobal: { value: 1 } },
    vertexShader: /* glsl */`attribute vec3 aPos; attribute vec3 aCol; attribute float aSize; attribute float aSlot;
      uniform float uInt[16]; uniform vec3 fogColor; uniform float fogNear; uniform float fogFar;
      varying vec2 vUv; varying vec3 vCol; varying float vI;
      void main(){
        vUv = uv;
        float k = aSlot < 0.0 ? 1.0 : uInt[int(aSlot)];
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec3 p = aPos + right * position.x * aSize + up * position.y * aSize;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        vI = k * (1.0 - smoothstep(fogNear, fogFar, -mv.z));
        vCol = aCol;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`varying vec2 vUv; varying vec3 vCol; varying float vI; uniform float uGlobal;
      void main(){ float r = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - r), 2.6); gl_FragColor = vec4(vCol * a * vI * uGlobal, 1.0); }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false; mesh.renderOrder = 6;
  return mesh;
}

// ------------------------------------------------------------ steam
export function makeSteam(x, y, z, count = 60, opts = {}) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3), seed = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; seed[i * 2] = rand(); seed[i * 2 + 1] = rand(); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 2));
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...lightU, ...fogU(), uTime: { value: 0 }, uPx: { value: 30 }, uRise: { value: opts.rise || 2.6 }, uLife: { value: opts.life || 4 }, uSpread: { value: opts.spread || 0.5 }, uAlpha: { value: opts.alpha || 0.16 } },
    vertexShader: /* glsl */`attribute vec2 aSeed; uniform float uTime; uniform float uPx; uniform float uRise; uniform float uLife; uniform float uSpread;
      varying float vLife; varying vec3 vLight; varying float vFog; varying float vSeed;
      ${lightGLSL}
      void main(){
        float t = fract(uTime / uLife + aSeed.x);
        float a = aSeed.y * 6.2831;
        vec3 p = position;
        p.y += t * uRise * uLife * 0.6;
        float sp = uSpread + t * 1.4;
        p.x += cos(a + t * 2.0) * sp * (0.3 + t) + sin(uTime * 0.7 + aSeed.x * 9.0) * 0.4 * t;
        p.z += sin(a + t * 1.7) * sp * (0.3 + t) + cos(uTime * 0.5 + aSeed.y * 7.0) * 0.4 * t;
        p.x += t * t * 1.2; // wind drift
        vLife = t; vSeed = aSeed.x;
        vLight = particleLight(p);
        vec4 mv = viewMatrix * vec4(p, 1.0);
        vFog = fogVis(-mv.z);
        gl_PointSize = uPx * (0.9 + 2.2 * t);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`varying float vLife; varying vec3 vLight; varying float vFog; varying float vSeed; uniform float uAlpha;
      void main(){
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = (1.0 - smoothstep(0.2, 1.0, r)) * (1.0 - vLife) * smoothstep(0.0, 0.15, vLife) * uAlpha;
        vec3 col = vec3(0.45, 0.48, 0.52) * 0.14 + vLight * 0.35;
        gl_FragColor = vec4(col, a * vFog);
      }`,
    transparent: true, depthWrite: false, fog: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false; pts.layers.set(1); pts.renderOrder = 4;
  pts.userData.update = (t, px) => { mat.uniforms.uTime.value = t; mat.uniforms.uPx.value = px; };
  return pts;
}

// ------------------------------------------------------------ light cone
export function makeCone(length, radius, color, intensity = 1) {
  const geo = new THREE.ConeGeometry(radius, length, 28, 6, true);
  geo.translate(0, -length / 2, 0);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...fogU(), uColor: { value: new THREE.Color(color) }, uInt: { value: intensity }, uTime: { value: 0 }, uTan: { value: radius / length } },
    vertexShader: /* glsl */`varying vec3 vObj; varying vec3 vV; varying float vT; varying float vFog; varying vec3 vWPos; uniform vec3 fogColor; uniform float fogNear; uniform float fogFar;
      void main(){
        vT = 1.0 - uv.y;
        vObj = position;
        vec4 wp = modelMatrix * vec4(position, 1.0); vWPos = wp.xyz;
        vec4 mv = viewMatrix * wp;
        vV = isOrthographic ? vec3(0.0, 0.0, 1.0) : normalize(-mv.xyz);
        vFog = 1.0 - smoothstep(fogNear, fogFar, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`uniform mat3 normalMatrix; varying vec3 vObj; varying vec3 vV; varying float vT; varying float vFog; varying vec3 vWPos; uniform vec3 uColor; uniform float uInt; uniform float uTime; uniform float uTan;
      ${noiseGLSL}
      void main(){
        // analytic cone normal (axis +z, apex at origin): smooth regardless of tessellation
        float l = max(length(vObj.xy), 1e-4);
        vec3 n = normalize(vec3(vObj.xy, -l * uTan));
        vec3 vn = normalize(normalMatrix * n);
        float rim = pow(abs(dot(vn, normalize(vV))), 1.4);
        float along = (1.0 - vT); along = along * along * smoothstep(0.0, 0.06, vT);
        float ground = smoothstep(0.0, 0.7, vWPos.y);
        float nz = 0.75 + 0.25 * fbm(vWPos.xz * 3.0 + vec2(uTime * 0.7, -uTime * 1.9) + vWPos.y);
        gl_FragColor = vec4(uColor * uInt * rim * along * nz * ground * vFog, 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: true,
  });
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = 7;
  return m;
}

// ------------------------------------------------------------ volumetric beam
// Soft light cone: the hull mesh only bounds a short ray march. Density is
// Gaussian across the cone, fades along it and near the ground, so there are
// no hard rims, no visible tessellation and no hard cut where it meets the road.
export function makeBeam(length, radius, color, intensity = 1) {
  const R = radius * 1.2, L = length * 1.05;
  const geo = new THREE.ConeGeometry(R, L, 20, 1, false);
  geo.translate(0, -L / 2, 0);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...fogU(), uColor: { value: new THREE.Color(color) }, uInt: { value: intensity }, uTime: { value: 0 }, uTan: { value: radius / length }, uLen: { value: length }, uR: { value: R } },
    vertexShader: /* glsl */`
      varying vec3 vObj; varying vec3 vDir; varying vec3 vUp; varying float vApexY; varying float vFog;
      uniform vec3 fogColor; uniform float fogNear; uniform float fogFar;
      void main(){
        vObj = position;
        mat4 inv = inverse(modelMatrix);
        vec3 viewDirWorld = -vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
        vDir = normalize((inv * vec4(viewDirWorld, 0.0)).xyz);
        vUp = (inv * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
        vApexY = modelMatrix[3][1];
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vFog = 1.0 - smoothstep(fogNear, fogFar, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vObj; varying vec3 vDir; varying vec3 vUp; varying float vApexY; varying float vFog;
      uniform vec3 uColor; uniform float uInt; uniform float uTime; uniform float uTan; uniform float uLen; uniform float uR;
      void main(){
        vec3 o = vObj; vec3 d = normalize(vDir);
        // march interval: bounding cylinder (radius uR) intersected with the slab z in [0, L]
        float ca = d.x * d.x + d.y * d.y;
        float t0 = 0.0, t1 = 1e5;
        if (ca > 1e-5) {
          float cb = 2.0 * (o.x * d.x + o.y * d.y);
          float cc = o.x * o.x + o.y * o.y - uR * uR;
          float disc = cb * cb - 4.0 * ca * cc;
          if (disc < 0.0) discard;
          float sq = sqrt(disc);
          t0 = (-cb - sq) / (2.0 * ca); t1 = (-cb + sq) / (2.0 * ca);
        }
        if (abs(d.z) > 1e-5) {
          float za = -o.z / d.z, zb = (uLen - o.z) / d.z;
          t0 = max(t0, min(za, zb)); t1 = min(t1, max(za, zb));
        }
        t0 = max(t0, 0.0);
        if (t1 <= t0) discard;
        float len = t1 - t0;
        const int N = 10;
        float stepLen = len / float(N);
        float acc = 0.0;
        for (int i = 0; i < N; i++) {
          vec3 p = o + d * (t0 + (float(i) + 0.5) * stepLen);
          float z = p.z;
          float rr = length(p.xy) / max(z * uTan, 0.03);
          float radial = exp(-rr * rr * 2.6);
          float axial = smoothstep(0.0, 0.5, z) * (1.0 - smoothstep(uLen * 0.45, uLen, z)) / (1.0 + z * z * 0.035);
          float ground = smoothstep(-0.1, 0.75, vApexY + dot(p, vUp));
          acc += radial * axial * ground;
        }
        acc *= stepLen;
        gl_FragColor = vec4(uColor * (uInt * acc * vFog), 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide, fog: true,
  });
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = 7;
  m.frustumCulled = false;
  return m;
}

// ------------------------------------------------------------ paper litter
export function makePapers(count, material, bounds) {
  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(0.3, 0.42);
  const items = [];
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(geo, material);
    m.castShadow = true;
    const it = { m, p: new THREE.Vector3(rand(bounds.x0, bounds.x1), rand(0, 2), rand(bounds.z0, bounds.z1)), v: new THREE.Vector3(), rot: new THREE.Vector3(rand(0, 6), rand(0, 6), rand(0, 6)), w: new THREE.Vector3(), rest: rand(0, 1), seed: rand(0, 100) };
    items.push(it); group.add(m);
  }
  group.userData.update = (t, dt, wind) => {
    for (const it of items) {
      const gust = Math.max(0, Math.sin(t * 0.37 + it.seed) * 0.6 + Math.sin(t * 1.31 + it.seed * 2.0) * 0.5 - 0.35);
      const w = wind.clone().multiplyScalar(0.6 + gust * 3.2);
      const onGround = it.p.y < 0.03;
      if (onGround && gust < 0.35) { it.v.multiplyScalar(0.8); it.w.multiplyScalar(0.7); it.p.y = 0.02; }
      else {
        it.v.x += (w.x - it.v.x) * dt * 1.5 + Math.sin(t * 3.1 + it.seed) * dt * 2.0;
        it.v.z += (w.z - it.v.z) * dt * 1.5 + Math.cos(t * 2.7 + it.seed) * dt * 2.0;
        it.v.y += (-3.0 + gust * 5.5 + Math.sin(t * 4.3 + it.seed * 3.0) * 2.0) * dt;
        it.v.y = Math.max(it.v.y, -2.5);
        it.w.set(Math.sin(t * 2.0 + it.seed) * 6, Math.cos(t * 1.7 + it.seed) * 5, Math.sin(t * 2.9 + it.seed) * 6).multiplyScalar(0.4 + gust);
      }
      it.p.addScaledVector(it.v, dt);
      if (it.p.y < 0.02) { it.p.y = 0.02; it.v.y = 0; }
      it.rot.addScaledVector(it.w, dt);
      if (onGround) it.rot.x = damp(it.rot.x, -Math.PI / 2, 3, dt);
      if (it.p.x > bounds.x1 + 6 || it.p.z > bounds.z1 + 6 || it.p.x < bounds.x0 - 6 || it.p.z < bounds.z0 - 6) {
        it.p.set(bounds.x0 + rand(0, 3), rand(0.5, 2.5), rand(bounds.z0, bounds.z1)); it.v.set(0, 0, 0);
      }
      it.m.position.copy(it.p); it.m.rotation.set(it.rot.x, it.rot.y, it.rot.z);
    }
  };
  return group;
}
function damp(a, b, l, dt) { return a + (b - a) * (1 - Math.exp(-l * dt)); }
