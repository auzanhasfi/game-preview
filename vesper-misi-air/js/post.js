// Post-processing: HDR scene target (MSAA), quarter-res bloom, and a final
// composite with ACES tone mapping, grading, vignette, grain and aberration.
import * as THREE from 'three';

const fsVert = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const brightFrag = /* glsl */`
uniform sampler2D tDiffuse; uniform float uThreshold; uniform float uKnee; varying vec2 vUv;
void main(){
  vec3 c = texture2D(tDiffuse, vUv).rgb;
  if (any(isnan(c)) || any(isinf(c))) c = vec3(0.0);
  c = max(c, vec3(0.0));
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float k = smoothstep(uThreshold - uKnee, uThreshold + uKnee, l);
  gl_FragColor = vec4(c * k, 1.0);
}`;

const blurFrag = /* glsl */`
uniform sampler2D tDiffuse; uniform vec2 uDir; varying vec2 vUv;
void main(){
  vec3 c = vec3(0.0); float ws = 0.0;
  for (int i = -7; i <= 7; i++) {
    float w = exp(-float(i * i) / 18.0);
    c += texture2D(tDiffuse, vUv + uDir * float(i)).rgb * w; ws += w;
  }
  gl_FragColor = vec4(c / ws, 1.0);
}`;

const compositeFrag = /* glsl */`
uniform sampler2D tScene; uniform sampler2D tBloom;
uniform float uBloom; uniform float uExposure; uniform float uTime; uniform float uFlash;
uniform vec2 uRes; uniform float uGrain; uniform float uVignette;
varying vec2 vUv;
vec3 aces(vec3 x){ const float a=2.51, b=0.03, c=2.43, d=0.59, e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0); }
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main(){
  vec2 uv = vUv;
  vec2 d = uv - 0.5;
  float r2 = dot(d, d);
  // chromatic aberration grows toward the edges
  vec2 ab = d * r2 * 0.014;
  vec3 col;
  col.r = texture2D(tScene, uv + ab).r;
  col.g = texture2D(tScene, uv).g;
  col.b = texture2D(tScene, uv - ab).b;
  if (any(isnan(col)) || any(isinf(col))) col = vec3(0.0);
  vec3 bloom = texture2D(tBloom, uv).rgb;
  if (any(isnan(bloom)) || any(isinf(bloom))) bloom = vec3(0.0);
  col += max(bloom, vec3(0.0)) * uBloom;
  col += uFlash * vec3(0.55, 0.65, 0.85);
  col *= uExposure;
  col = aces(col);
  // grade: lift blacks slightly toward cold teal, desaturate a touch
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, vec3(lum), 0.18);
  col = col * vec3(0.96, 1.0, 1.04) + vec3(0.006, 0.010, 0.016);
  // vignette
  float vig = 1.0 - smoothstep(0.25, 0.95, r2 * 2.2) * uVignette;
  col *= vig;
  // film grain
  float g = hash(gl_FragCoord.xy + fract(uTime * 13.7) * 311.0) - 0.5;
  col += g * uGrain * (0.4 + 0.6 * (1.0 - lum));
  // sRGB
  col = clamp(col, 0.0, 1.0);
  col = mix(col * 12.92, 1.055 * pow(col, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, col));
  gl_FragColor = vec4(col, 1.0);
}`;

export class Post {
  constructor(renderer, width, height, samples = 4) {
    this.renderer = renderer;
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    this.scene = new THREE.Scene(); this.scene.add(this.quad);
    const mk = (frag, uniforms) => new THREE.ShaderMaterial({ uniforms, vertexShader: fsVert, fragmentShader: frag, depthTest: false, depthWrite: false });
    this.brightMat = mk(brightFrag, { tDiffuse: { value: null }, uThreshold: { value: 0.9 }, uKnee: { value: 0.35 } });
    this.blurMat = mk(blurFrag, { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() } });
    this.compMat = mk(compositeFrag, {
      tScene: { value: null }, tBloom: { value: null }, uBloom: { value: 0.55 }, uExposure: { value: 1.35 },
      uTime: { value: 0 }, uFlash: { value: 0 }, uRes: { value: new THREE.Vector2() }, uGrain: { value: 0.035 }, uVignette: { value: 0.55 },
    });
    this.setSize(width, height, samples);
  }
  setSize(width, height, samples) {
    if (this.sceneRT) { this.sceneRT.dispose(); this.bloomA.dispose(); this.bloomB.dispose(); }
    const opts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, stencilBuffer: false };
    this.sceneRT = new THREE.WebGLRenderTarget(width, height, { ...opts, depthBuffer: true, samples });
    const bw = Math.max(4, Math.floor(width / 4)), bh = Math.max(4, Math.floor(height / 4));
    this.bloomA = new THREE.WebGLRenderTarget(bw, bh, { ...opts, depthBuffer: false });
    this.bloomB = new THREE.WebGLRenderTarget(bw, bh, { ...opts, depthBuffer: false });
    this.bw = bw; this.bh = bh;
    this.compMat.uniforms.uRes.value.set(width, height);
  }
  // Render `scene` with `camera` into the HDR target, then bloom + composite to screen.
  render(scene, camera, time, flash) {
    const r = this.renderer;
    r.setRenderTarget(this.sceneRT);
    r.clear();
    r.render(scene, camera);
    // bright pass
    this.quad.material = this.brightMat;
    this.brightMat.uniforms.tDiffuse.value = this.sceneRT.texture;
    r.setRenderTarget(this.bloomA); r.render(this.scene, this.cam);
    // two blur iterations
    this.quad.material = this.blurMat;
    for (let i = 0; i < 2; i++) {
      this.blurMat.uniforms.tDiffuse.value = this.bloomA.texture;
      this.blurMat.uniforms.uDir.value.set((1 + i) / this.bw, 0);
      r.setRenderTarget(this.bloomB); r.render(this.scene, this.cam);
      this.blurMat.uniforms.tDiffuse.value = this.bloomB.texture;
      this.blurMat.uniforms.uDir.value.set(0, (1 + i) / this.bh);
      r.setRenderTarget(this.bloomA); r.render(this.scene, this.cam);
    }
    // composite
    this.quad.material = this.compMat;
    this.compMat.uniforms.tScene.value = this.sceneRT.texture;
    this.compMat.uniforms.tBloom.value = this.bloomA.texture;
    this.compMat.uniforms.uTime.value = time;
    this.compMat.uniforms.uFlash.value = flash;
    r.setRenderTarget(null);
    r.render(this.scene, this.cam);
  }
}
