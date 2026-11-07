/* Clawd Kilat: renderer, kamera, bloom, langit, dan shader "dunia melengkung" untuk semua material */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const R = {};
/* lengkung: y turun ∝ z², x berbelok pelan (jalan terasa berliku) */
export const LENGKUNG = { uCurve: { value: 0.0018 }, uBend: { value: 0 } };

function tempelLengkung(m) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uCurve = LENGKUNG.uCurve; sh.uniforms.uBend = LENGKUNG.uBend;
    sh.vertexShader = 'uniform float uCurve;\nuniform float uBend;\n' + sh.vertexShader.replace('#include <project_vertex>', [
      'vec4 mvPosition = vec4( transformed, 1.0 );',
      '#ifdef USE_INSTANCING', 'mvPosition = instanceMatrix * mvPosition;', '#endif',
      'mvPosition = modelViewMatrix * mvPosition;',
      'float zz = min(mvPosition.z, 0.0);',
      'mvPosition.y -= uCurve * zz * zz;',
      'mvPosition.x += uBend * zz * zz;',
      'gl_Position = projectionMatrix * mvPosition;'
    ].join('\n'));
  };
  m.customProgramCacheKey = () => 'lengkung';
  return m;
}
/* pembuat material: semua lewat sini supaya ikut melengkung */
export function mat(warna, o = {}) {
  let m;
  if (o.dasar) m = new THREE.MeshBasicMaterial({ color: warna, transparent: !!o.transparan, opacity: o.opacity ?? 1, blending: o.tambah ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: o.depthWrite ?? !o.transparan, side: o.dua ? THREE.DoubleSide : THREE.FrontSide, map: o.map || null, fog: o.fog ?? true });
  else m = new THREE.MeshStandardMaterial({ color: warna, roughness: o.kasar ?? 0.65, metalness: o.logam ?? 0.05, flatShading: o.datar ?? true, emissive: o.pijar || 0x000000, emissiveIntensity: o.pijarK ?? 1, map: o.map || null, transparent: !!o.transparan, opacity: o.opacity ?? 1, side: o.dua ? THREE.DoubleSide : THREE.FrontSide });
  return tempelLengkung(m);
}

export function siapkanRender(kanvasInduk, kualitas) {
  const renderer = new THREE.WebGLRenderer({ antialias: kualitas === 'tinggi', powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, kualitas === 'tinggi' ? 1.75 : 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  kanvasInduk.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xbfe6f5, 85, 190);
  const camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 4.2, 7.5);

  const hemi = new THREE.HemisphereLight(0xd8f0ff, 0x5d8a3c, 1.25); scene.add(hemi);
  const sinar = new THREE.DirectionalLight(0xfff1d6, 2.1); sinar.position.set(-6, 12, 6); scene.add(sinar);
  const isi = new THREE.DirectionalLight(0xffffff, 0.35); isi.position.set(5, 4, -8); scene.add(isi);

  /* langit: kubah gradien + matahari (tidak melengkung, ikut kamera) */
  const langitMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { cA: { value: new THREE.Color('#4fa9e8') }, cB: { value: new THREE.Color('#cfeefb') }, cS: { value: new THREE.Color('#fff3c4') }, t: { value: 0 }, bintang: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: [
      'uniform vec3 cA; uniform vec3 cB; uniform vec3 cS; uniform float t; uniform float bintang; varying vec3 vP;',
      'float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }',
      'void main(){',
      ' float y = clamp(vP.y * 1.6 + 0.12, 0.0, 1.0);',
      ' vec3 c = mix(cB, cA, pow(y, 0.8));',
      ' vec3 sd = normalize(vec3(-0.35, 0.16, -1.0));',
      ' float s = max(dot(vP, sd), 0.0);',
      ' c += cS * (pow(s, 380.0) * 1.6 + pow(s, 12.0) * 0.28);',
      ' vec2 g = floor(vP.xz / max(vP.y, 0.05) * 60.0);',
      ' float st = step(0.996, h(g)) * smoothstep(0.1, 0.5, vP.y) * bintang * (0.6 + 0.4 * sin(t * 3.0 + h(g) * 20.0));',
      ' c += vec3(st);',
      ' gl_FragColor = vec4(c, 1.0);',
      '}'
    ].join('\n')
  });
  const langit = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), langitMat);
  scene.add(langit);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.45, 0.45, 0.95);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  Object.assign(R, { THREE, renderer, scene, camera, hemi, sinar, isi, langit, langitMat, composer, bloom, kualitas });
  ubahKualitas(kualitas);
  window.addEventListener('resize', ukurUlang);
  return R;
}

export function ubahKualitas(k) {
  R.kualitas = k;
  R.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, k === 'tinggi' ? 1.75 : 1));
  ukurUlang();
}
function ukurUlang() {
  const w = window.innerWidth, h = window.innerHeight;
  R.renderer.setSize(w, h); R.composer.setSize(w, h);
  R.camera.aspect = w / h;
  R.camera.updateProjectionMatrix();
}
export function gambar() {
  R.langit.position.copy(R.camera.position);
  if (R.kualitas === 'tinggi') R.composer.render(); else R.renderer.render(R.scene, R.camera);
}

/* tekstur angka/teks dari kanvas (untuk gerbang & bola jawaban) */
export function teksturTeks(teks, o = {}) {
  const c = document.createElement('canvas'); c.width = o.w || 256; c.height = o.h || 256;
  const g = c.getContext('2d');
  if (o.latar) { g.fillStyle = o.latar; g.fillRect(0, 0, c.width, c.height); }
  if (o.bingkai) { g.strokeStyle = o.bingkai; g.lineWidth = 14; g.strokeRect(10, 10, c.width - 20, c.height - 20); }
  g.fillStyle = o.warna || '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let uk = o.ukuran || 150; g.font = '800 ' + uk + 'px Geist, system-ui, sans-serif';
  while (g.measureText(teks).width > c.width * 0.86 && uk > 30) { uk -= 6; g.font = '800 ' + uk + 'px Geist, system-ui, sans-serif'; }
  if (o.garis) { g.lineWidth = 12; g.strokeStyle = o.garis; g.strokeText(teks, c.width / 2, c.height / 2 + 6); }
  g.fillText(teks, c.width / 2, c.height / 2 + 6);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
