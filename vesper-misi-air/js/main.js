// Vesper Street — isometric survival-horror (Three.js). Renderer, camera,
// input and the living-world update; the campaign lives in game.js.
import * as THREE from 'three';
import { makeMaterials, cutU } from './voxel.js';
import { buildGround, makeWetMaterial, wetUniforms, Reflection, groundHeight } from './ground.js';
import { buildWorld, clampToWalkable, insideWalkable } from './world.js';
import { Character } from './character.js';
import { makeRain, makeMist, makeGlows, makeSteam, makePapers, lightU, NLAMP } from './effects.js';
import { Post } from './post.js';
import { Sfx } from './audio.js';
import { Game } from './game.js';
import { CHAPTERS } from './levels.js';
import { damp, clamp, rand } from './util.js';

// ---------------------------------------------------------------- setup
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
const DPR_CAP = 1.5;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = false;
renderer.toneMapping = THREE.NoToneMapping;

const FOG_COLOR = new THREE.Color(0x0a0d12);
const FOG_FLASH = new THREE.Color(0x2a3648);
const scene = new THREE.Scene();
scene.background = FOG_COLOR.clone();
scene.fog = new THREE.Fog(FOG_COLOR.clone(), 100, 200);

const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 420);
camera.layers.enable(1);

const hemi = new THREE.HemisphereLight(0x9fb4d8, 0x30302c, 2.0);
scene.add(hemi);
const moon = new THREE.DirectionalLight(0xa9bce0, 1.9);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
const SC = moon.shadow.camera; SC.left = -46; SC.right = 46; SC.top = 46; SC.bottom = -46; SC.near = 10; SC.far = 220;
moon.shadow.bias = -0.0008; moon.shadow.normalBias = 0.05;
moon.shadow.autoUpdate = false; // refreshed every few frames in render()
const MOON_OFF = new THREE.Vector3(-38, 70, 26);
scene.add(moon); scene.add(moon.target);
const lightning = new THREE.DirectionalLight(0xcfe0ff, 0);
scene.add(lightning); scene.add(lightning.target);

// ---------------------------------------------------------------- persistent actors
const materials = makeMaterials();
const wetMat = makeWetMaterial();
const player = new Character(materials);
scene.add(player.root);

const watcherMats = {
  matte: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, transparent: true, opacity: 0 }),
  shiny: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, transparent: true, opacity: 0 }),
  emit: new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 }),
  glass: new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 }),
};
const watcher = new Character(watcherMats, { dark: true });
watcher.root.visible = false;
scene.add(watcher.root);
const watcherGlow = makeGlows([{ pos: [0, -100, 0], color: 0xdfe8ff, size: 2.4, slot: 0 }]);
scene.add(watcherGlow);
const _wg = new THREE.Vector3();

// ---------------------------------------------------------------- effects (persistent)
const QUALITY = [
  { name: 'high', samples: 4, refl: 0.5, shadow: 2048, rain: 4200 },
  { name: 'medium', samples: 2, refl: 0.4, shadow: 1024, rain: 2600 },
  { name: 'low', samples: 0, refl: 0.3, shadow: 1024, rain: 1200 },
];
let qIndex = 0;
let rain = makeRain(QUALITY[0].rain);
scene.add(rain);
const mist = makeMist(new THREE.Color(0x0d1116));
scene.add(mist);
const paperMat = new THREE.MeshStandardMaterial({ color: 0xb8b4a8, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
const papers = makePapers(7, paperMat, { x0: -20, x1: 18, z0: -8, z1: 8 });
scene.add(papers);
const markerGeo = new THREE.RingGeometry(0.22, 0.32, 32); markerGeo.rotateX(-Math.PI / 2);
const marker = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: 0xffe6b8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
marker.position.y = 0.05; marker.layers.set(1);
scene.add(marker);
let markerT = 0;

let reflection = new Reflection(renderer, scene, renderer.domElement.width, renderer.domElement.height, QUALITY[0].refl);
let post = new Post(renderer, renderer.domElement.width, renderer.domElement.height, QUALITY[0].samples);
const sfx = new Sfx();

// ---------------------------------------------------------------- level container
const level = { ground: null, staticGroup: null, dyn: null, glows: null, steams: [], drips: null };
function buildLevel(spec) {
  const ground = new THREE.Mesh(buildGround(), wetMat);
  ground.receiveShadow = true; ground.frustumCulled = false;
  scene.add(ground); level.ground = ground;
  const w = buildWorld(materials, spec);
  scene.add(w.staticGroup); scene.add(w.dyn.group);
  level.staticGroup = w.staticGroup; level.dyn = w.dyn;
  level.glows = makeGlows(w.dyn.glows); scene.add(level.glows);
  level.steams = w.dyn.steam.map((s) => { const p = makeSteam(s.x, s.y, s.z, s.count, { rise: s.rise, alpha: s.alpha }); scene.add(p); return p; });
  return w;
}
function disposeLevel() {
  const rm = (o) => { if (!o) return; scene.remove(o); o.traverse((c) => { if (c.geometry) c.geometry.dispose(); }); };
  rm(level.ground); rm(level.staticGroup); rm(level.dyn && level.dyn.group); rm(level.glows);
  for (const s of level.steams) rm(s);
  level.ground = level.staticGroup = level.dyn = level.glows = null; level.steams = [];
}

// ---------------------------------------------------------------- camera state
const cam = { yaw: -0.62, pitch: 0.66, zoom: 1, zoomS: 1, dist: 150, viewSize: 27, target: new THREE.Vector3(), lookY: 0.9 };
function updateCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  const h = cam.viewSize * cam.zoomS, w = h * aspect;
  camera.left = -w / 2; camera.right = w / 2; camera.top = h / 2; camera.bottom = -h / 2;
  camera.updateProjectionMatrix();
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const dir = new THREE.Vector3(cp * Math.sin(cam.yaw), sp, cp * Math.cos(cam.yaw));
  const look = cam.target.clone(); look.y += cam.lookY;
  camera.position.copy(look).addScaledVector(dir, cam.dist);
  camera.lookAt(look);
  camera.updateMatrixWorld();
  const zs = Math.pow(cam.zoomS, 0.6);
  scene.fog.near = cam.dist - 10 * zs;
  scene.fog.far = cam.dist + 46 * zs;
}

// ---------------------------------------------------------------- game host
const game = new Game({
  scene, materials, player, cam, sfx, buildLevel, disposeLevel,
  setFog(hex, ambient = 1) { FOG_COLOR.set(hex); hemi.intensity = 2.0 * ambient; moon.intensity = 1.9 * ambient; },
  watcherNow() { watch.next = 0; watch.state = 'hidden'; },
  isMoving() { return hasTarget; },
});

// ---------------------------------------------------------------- input
const ndc = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let pointerDown = false, dragging = false, downX = 0, downY = 0, lastX = 0, lastY = 0, downButton = 0;
const moveTarget = new THREE.Vector3();
let hasTarget = false;
const prompt = document.getElementById('prompt');

function groundHit(cx, cy) {
  ndc.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hit = new THREE.Vector3();
  return raycaster.ray.intersectPlane(groundPlane, hit) ? hit : null;
}
canvas.addEventListener('pointerdown', (e) => {
  sfx.start();
  pointerDown = true; dragging = false; downX = lastX = e.clientX; downY = lastY = e.clientY; downButton = e.button;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (pointerDown) {
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    if (!dragging && Math.hypot(e.clientX - downX, e.clientY - downY) > 5) dragging = true;
    if (dragging) { cam.yaw -= dx * 0.006; cam.pitch = clamp(cam.pitch + dy * 0.004, 0.38, 1.15); }
    return;
  }
  const hit = groundHit(e.clientX, e.clientY);
  const picked = hit && game.state === 'play' ? game.pickAt(raycaster.ray) : null;
  if (picked) { prompt.textContent = picked.label; prompt.style.left = `${e.clientX + 14}px`; prompt.style.top = `${e.clientY + 8}px`; prompt.classList.add('show'); canvas.style.cursor = 'pointer'; }
  else { prompt.classList.remove('show'); canvas.style.cursor = 'crosshair'; }
});
canvas.addEventListener('pointerup', (e) => {
  if (!pointerDown) return;
  pointerDown = false;
  if (!dragging && downButton === 0) clickAt(e.clientX, e.clientY);
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('wheel', (e) => { e.preventDefault(); cam.zoom = clamp(cam.zoom * Math.exp(e.deltaY * 0.0011), 0.5, 2.6); }, { passive: false });
window.addEventListener('keydown', (e) => {
  sfx.start();
  if (e.key === 'f' || e.key === 'F') game.toggleFlashlight();
  if (e.key === 'q' || e.key === 'Q') setQuality((qIndex + 1) % QUALITY.length, true);
  if (e.key === 'h' || e.key === 'H') document.getElementById('hud').classList.toggle('hidden');
  if (e.key === 'm' || e.key === 'M') { sfx.setMuted(!sfx.muted); game.toast(sfx.muted ? 'sound off' : 'sound on', 1.5); }
  if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') { if (game.state === 'read') game.closeNote(); else if (game.state === 'call') game.closeCall(); }
});

function clickAt(cx, cy) {
  const hit = groundHit(cx, cy);
  if (!hit) return;
  const picked = game.state === 'play' ? game.pickAt(raycaster.ray) : null;
  const go = game.handleClick(hit, picked);
  if (game.state !== 'play') return;
  const c = go || clampToWalkable(hit);
  moveTarget.set(c.x, 0, c.z);
  hasTarget = true;
  marker.position.set(c.x, groundHeight(c.x, c.z) + 0.04, c.z);
  markerT = 1;
}

// ---------------------------------------------------------------- player movement
const pstate = { speed: 0, yaw: 0, stuck: 0, y: 0, stepPhase: 0, stepIdx: 0 };
function updatePlayer(dt) {
  const p = player.root.position;
  let moving = false;
  const obstacles = level.dyn ? level.dyn.obstacles : [];
  const maxSpeed = game.flood > 0.5 ? 1.9 : 2.7;
  if (hasTarget && game.state === 'play') {
    const dx = moveTarget.x - p.x, dz = moveTarget.z - p.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.12) { hasTarget = false; }
    else {
      moving = true;
      pstate.speed = Math.min(maxSpeed, pstate.speed + dt * 9);
      const step = Math.min(dist, pstate.speed * dt);
      let nx = p.x + dx / dist * step, nz = p.z + dz / dist * step;
      for (let iter = 0; iter < 2; iter++) for (const o of obstacles) {
        const ox = nx - o.x, oz = nz - o.z, r = o.r + 0.32;
        const d2 = ox * ox + oz * oz;
        if (d2 < r * r && d2 > 1e-6) { const d = Math.sqrt(d2); nx = o.x + ox / d * r; nz = o.z + oz / d * r; }
      }
      if (!insideWalkable(nx, nz)) { const c = clampToWalkable({ x: nx, z: nz }); nx = c.x; nz = c.z; }
      const moved = Math.hypot(nx - p.x, nz - p.z);
      if (moved < step * 0.25) { pstate.stuck += dt; if (pstate.stuck > 0.5) { hasTarget = false; pstate.stuck = 0; } }
      else pstate.stuck = 0;
      if (moved > 1e-4) pstate.yaw = Math.atan2(nx - p.x, nz - p.z);
      p.x = nx; p.z = nz;
      // footsteps: sound + water rings
      pstate.stepPhase += moved;
      if (pstate.stepPhase > 0.72) {
        pstate.stepPhase = 0;
        const wet = game.flood > 0.3 || groundHeight(p.x, p.z) === 0;
        sfx.step(wet);
        const s = wetUniforms.uSteps.value; const i = pstate.stepIdx = (pstate.stepIdx + 1) % 6;
        s[i * 4] = p.x; s[i * 4 + 1] = p.z; s[i * 4 + 2] = T; s[i * 4 + 3] = game.flood > 0.3 ? 1.0 : 0.45;
      }
    }
  }
  if (!moving) pstate.speed = Math.max(0, pstate.speed - dt * 12);
  let dy = pstate.yaw - player.root.rotation.y;
  dy = Math.atan2(Math.sin(dy), Math.cos(dy));
  player.root.rotation.y += dy * (1 - Math.exp(-10 * dt));
  pstate.y = damp(pstate.y, groundHeight(p.x, p.z), 14, dt);
  p.y = pstate.y;
  player.update(dt, T, moving ? pstate.speed : 0);
}

// ---------------------------------------------------------------- dynamic world
const flick = { phoneLevel: 1, fluorLevel: 1, canopy: 1 };
const tlSway = { a: 0, va: 0, b: 0, vb: 0 };
let flash = 0, nextLightning = 9, lightningQueue = [];
const watch = { state: 'hidden', t: 0, next: 22, alpha: 0, pos: new THREE.Vector3(), dir: new THREE.Vector3() };

function sputter(t, seed, rate) {
  const a = Math.sin(t * 13.1 * rate + seed) * Math.sin(t * 7.7 * rate + seed * 2.0) * Math.sin(t * 3.3 * rate + seed * 3.0);
  return a > 0.55 ? 0.15 + Math.random() * 0.4 : 1;
}

function updateWorld(dt, t) {
  const dyn = level.dyn;
  if (dyn) {
    for (const l of dyn.lamps) {
      let k = 1;
      if (l.flicker) { const cyc = (t * 0.11 + 0.3) % 1; k = (cyc > 0.72 && cyc < 0.86) ? sputter(t, 1.7, 2.2) * (0.6 + 0.4 * Math.random()) : 0.94 + 0.06 * Math.sin(t * 40) * Math.sin(t * 23); }
      else k = 0.97 + 0.03 * Math.sin(t * 31 + l.base) * Math.sin(t * 17);
      l.level = damp(l.level ?? 1, k, 40, dt);
      l.light.intensity = l.base * l.level;
      l.emitMat.color.setScalar(l.level);
      if (l.beam) l.beam.material.uniforms.uInt.value = 0.035 * l.level;
      if (l.slot !== undefined && l.slot >= 0) dyn.glowInt[l.slot] = l.level;
    }
    for (const n of dyn.neon) {
      if (n.kind === 'diner') {
        let sum = 0;
        n.letters.forEach((L, i) => { let k = 0.9 + 0.1 * Math.sin(t * 60 + i); if (i === 3) k *= sputter(t, 4.2, 1.1) > 0.5 ? 1 : 0.1; L.mat.color.setScalar(k); L.on.visible = k > 0.15; L.off.visible = !L.on.visible; sum += k; });
        const lvl = sum / n.letters.length; n.light.intensity = n.base * lvl; dyn.glowInt[n.slot] = lvl;
      } else if (n.kind === 'motel') {
        let sum = 0;
        n.letters.forEach((L, i) => { let k = 0.92 + 0.08 * Math.sin(t * 50 + i * 2); if ((i % n.period) === n.deadIndex) k = (Math.sin(t * 0.7) > 0.93 && Math.random() < 0.7) ? 0.8 : 0.0; L.mat.color.setScalar(k); L.on.visible = k > 0.1; L.off.visible = !L.on.visible; sum += k; });
        const lvl = sum / n.letters.length; n.light.intensity = n.base * lvl; dyn.glowInt[n.slot] = lvl;
      } else if (n.kind === 'open') { const on = (t % 2.6) < 2.0; n.letters.forEach((L) => { L.on.visible = on; L.off.visible = !on; }); }
      else if (n.kind === 'vacancy') { n.letters.forEach((L, i) => { L.mat.color.setScalar(0.85 + 0.15 * Math.sin(t * 2 + i)); }); }
    }
    if (dyn.trafficLight) {
      const gust = Math.max(0, Math.sin(t * 0.5) * 0.7 + Math.sin(t * 1.9 + 1) * 0.5 - 0.3) * 1.6 + (Math.random() - 0.5) * 0.3;
      const g = 9.81 / 1.4;
      tlSway.va += (-g * Math.sin(tlSway.a) - 0.9 * tlSway.va + gust * 0.9) * dt; tlSway.a += tlSway.va * dt;
      tlSway.vb += (-g * Math.sin(tlSway.b) - 1.1 * tlSway.vb + gust * 0.35 * Math.sin(t * 0.7)) * dt; tlSway.b += tlSway.vb * dt;
      dyn.trafficLight.group.rotation.set(tlSway.b * 0.5, Math.PI / 4 + 0.05 * Math.sin(t * 0.6), tlSway.a * 0.5);
      const on = (t % 1.2) < 0.6;
      dyn.trafficLight.redMat.color.setScalar(on ? 1 : 0.02);
      dyn.trafficLight.light.intensity = on ? 22 : 0;
    }
    if (dyn.police) {
      const p = dyn.police;
      const r = Math.max(0, Math.sin(t * 7.0)), b = Math.max(0, Math.sin(t * 7.0 + Math.PI));
      const r2 = r > 0.6 ? 1 : 0.05, b2 = b > 0.6 ? 1 : 0.05;
      p.red.intensity = 160 * r2; p.blue.intensity = 160 * b2;
      p.barMat.color.setRGB(0.15 + r2, 0.15, 0.15 + b2);
      dyn.glowInt[p.slot] = 0.6 * r2 + 0.5 * b2;
    }
    for (const a of dyn.ambulances) { const on = Math.sin(t * 5 + a.phase) > 0.5; a.red.intensity = on ? 90 : 0; dyn.glowInt[a.slot] = on ? 1 : 0.05; }
    if (dyn.phone) {
      let target = sputter(t, 9.1, 3.0);
      if (game.ringing) target = (t % 0.5) < 0.25 ? 1.8 : 0.2;
      flick.phoneLevel = damp(flick.phoneLevel, target, 50, dt);
      dyn.phone.level = flick.phoneLevel;
      dyn.phone.light.intensity = dyn.phone.base * flick.phoneLevel; dyn.glowInt[dyn.phone.slot] = flick.phoneLevel;
    }
    if (dyn.fluor) { flick.fluorLevel = damp(flick.fluorLevel, sputter(t, 2.3, 1.6) * (0.85 + 0.15 * Math.sin(t * 120)), 60, dt); dyn.fluor.light.intensity = dyn.fluor.base * flick.fluorLevel; dyn.fluor.mat.color.setScalar(flick.fluorLevel); }
    if (dyn.canopy) { flick.canopy = damp(flick.canopy, sputter(t, 5.3, 1.2), 50, dt); dyn.canopy.light.intensity = dyn.canopy.base * flick.canopy; dyn.glowInt[dyn.canopy.slot] = flick.canopy; }
    if (dyn.beacon) { const b = (t % 1.6) < 0.25 ? 1 : 0.05; dyn.beacon.mat.color.setScalar(b); dyn.glowInt[dyn.beacon.slot] = b; }
    if (dyn.receiver) { dyn.receiver.rotation.z = 0.35 * Math.sin(t * 1.9) * (0.7 + 0.3 * Math.sin(t * 0.23)) * (game.ringing ? 2 : 1); dyn.receiver.rotation.x = 0.2 * Math.sin(t * 1.3 + 1); }
    for (const s of dyn.sparks) {
      const burst = Math.sin(t * 17) * Math.sin(t * 3.1) * Math.sin(t * 0.9 + 2) > 0.35 ? 1 : 0.03;
      s.level = burst; s.light.intensity = 60 * burst; s.mat.color.setScalar(burst); dyn.glowInt[s.slot] = burst;
      if (burst > 0.5 && Math.random() < dt * 4) sfx.burst({ bp: 4500, q: 2, gain: 0.05, attack: 0.002, decay: 0.05 });
    }
    for (const c of dyn.crows) {
      c.next -= dt;
      if (c.next <= 0) { c.next = rand(2, 9); c.hop = 0.35; c.yaw += rand(-0.6, 0.6); }
      if (c.hop > 0) { c.hop -= dt; c.m.position.y = c.base.y + Math.sin(Math.PI * (1 - c.hop / 0.35)) * 0.12; } else c.m.position.y = c.base.y;
      c.m.rotation.y = damp(c.m.rotation.y, c.yaw, 6, dt);
      c.m.rotation.x = 0.1 * Math.sin(t * 3 + c.base.x);
    }
    for (const u of dyn.updaters) u(t, dt);
    if (level.glows) level.glows.material.uniforms.uInt.value = dyn.glowInt;
  }
  // lightning + thunder
  if (t > nextLightning && lightningQueue.length === 0) {
    const n = 1 + Math.floor(Math.random() * 3);
    let at = t;
    for (let i = 0; i < n; i++) { at += rand(0.05, 0.25); lightningQueue.push({ at, k: rand(0.4, 0.9) }); }
    nextLightning = t + rand(14, 38);
    sfx.thunder(rand(0.5, 2.2), rand(0.5, 1));
  }
  if (lightningQueue.length && t >= lightningQueue[0].at) { const k = lightningQueue.shift().k; flash = Math.max(flash, k); }
  flash = damp(flash, 0, 9, dt);
  lightning.intensity = 4.0 * flash;
  scene.fog.color.copy(FOG_COLOR).lerp(FOG_FLASH, flash * 0.8);
  scene.background.copy(scene.fog.color);
  renderer.setClearColor(scene.fog.color);
  updateWatcher(dt, t);
}

function updateWatcher(dt, t) {
  const w = watch;
  const pp = player.root.position;
  if (w.state === 'hidden') {
    if (t > w.next && game.state === 'play') {
      const spots = [[-14, -7.5], [-15, 6], [13, -7.5], [4, -14], [-4, 16], [15, 7], [-3.5, -14], [-18, 0.5], [17, -1]];
      let best = null, bd = 0;
      for (const s of spots) { const d = Math.hypot(s[0] - pp.x, s[1] - pp.z); if (d > 10 && d < 17.5 && d > bd && insideWalkable(s[0], s[1])) { bd = d; best = s; } }
      if (!best) { w.next = t + 8; return; }
      w.pos.set(best[0], groundHeight(best[0], best[1]), best[1]);
      watcher.root.position.copy(w.pos);
      watcher.root.rotation.y = Math.atan2(pp.x - w.pos.x, pp.z - w.pos.z);
      watcher.root.visible = true; w.state = 'appear'; w.t = 0; w.alpha = 0;
      sfx.groan(0.5);
    }
    return;
  }
  w.t += dt;
  if (w.state === 'appear') {
    w.alpha = Math.min(1, w.t / 3.0);
    watcher.root.rotation.y = Math.atan2(pp.x - w.pos.x, pp.z - w.pos.z);
    watcher.update(dt, t, 0);
    if (w.t > 9.5) { w.state = 'leave'; w.t = 0; w.dir.set(Math.sin(watcher.root.rotation.y + Math.PI), 0, Math.cos(watcher.root.rotation.y + Math.PI)); }
  } else if (w.state === 'leave') {
    const yawTarget = Math.atan2(w.dir.x, w.dir.z);
    let dy = yawTarget - watcher.root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    watcher.root.rotation.y += dy * (1 - Math.exp(-3 * dt));
    if (w.t > 0.8) watcher.root.position.addScaledVector(w.dir, dt * 1.4);
    watcher.update(dt, t, w.t > 0.8 ? 1.4 : 0);
    w.alpha = clamp(1 - (w.t - 1.5) / 3.5, 0, 1);
    if (w.t > 5.2) { w.state = 'hidden'; watcher.root.visible = false; w.next = t + rand(40, 75); }
  }
  for (const k in watcherMats) watcherMats[k].opacity = w.alpha * 0.95;
  if (watcher.backLight) watcher.backLight.intensity = 14 * w.alpha;
  watcher.flashGroup.getWorldPosition(_wg); _wg.addScaledVector(watcher.flashGroup.getWorldDirection(new THREE.Vector3()), 0.45);
  const wa = watcherGlow.geometry.attributes.aPos; wa.setXYZ(0, _wg.x, _wg.y, _wg.z); wa.needsUpdate = true;
  watcherGlow.material.uniforms.uInt.value[0] = watcher.root.visible ? w.alpha * 0.8 : 0;
}

// ---------------------------------------------------------------- particle light feed
const _fp = new THREE.Vector3(), _fd = new THREE.Vector3();
function updateLightFeed() {
  player.flashGroup.getWorldPosition(_fp);
  player.flashGroup.getWorldDirection(_fd);
  lightU.uFlashPos.value.copy(_fp);
  lightU.uFlashDir.value.copy(_fd);
  lightU.uFlashInt.value = player.flashLevel;
  const pp = player.root.position;
  const feeds = level.dyn ? level.dyn.feeds.map((f) => f()).filter((v) => v[3] > 0.001) : [];
  feeds.sort((a, b) => ((a[0] - pp.x) ** 2 + (a[2] - pp.z) ** 2) - ((b[0] - pp.x) ** 2 + (b[2] - pp.z) ** 2));
  let i = 0;
  for (const v of feeds) { if (i >= NLAMP) break; lightU.uLampPos.value[i].set(v[0], v[1], v[2], v[3]); lightU.uLampCol.value[i].set(v[4], v[5], v[6]); i++; }
  for (; i < NLAMP; i++) lightU.uLampPos.value[i].w = 0;
}

// ---------------------------------------------------------------- quality
function setQuality(i, announce) {
  qIndex = i;
  const q = QUALITY[i];
  post.setSize(renderer.domElement.width, renderer.domElement.height, q.samples);
  reflection.setSize(renderer.domElement.width, renderer.domElement.height, q.refl);
  moon.shadow.mapSize.set(q.shadow, q.shadow);
  if (moon.shadow.map) { moon.shadow.map.dispose(); moon.shadow.map = null; }
  scene.remove(rain); rain.geometry.dispose();
  rain = makeRain(q.rain); scene.add(rain);
  document.getElementById('quality').textContent = q.name;
  if (announce) console.log('quality:', q.name);
}
function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  const w = renderer.domElement.width, h = renderer.domElement.height;
  post.setSize(w, h, QUALITY[qIndex].samples);
  reflection.setSize(w, h, QUALITY[qIndex].refl);
}
window.addEventListener('resize', onResize);

// ---------------------------------------------------------------- loop
let T = 0, last = performance.now(), frames = 0, fpsAcc = 0;
const perf = { samples: [], lastDrop: 0 };
const fpsEl = document.getElementById('fps');
const wind = new THREE.Vector3(1.4, 0, 0.5);

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  T += dt;
  step(dt);
  render();
  frames++; fpsAcc += dt;
  if (fpsAcc >= 0.5) { fpsEl.textContent = Math.round(frames / fpsAcc) + ' fps'; perf.samples.push(fpsAcc / frames); frames = 0; fpsAcc = 0; }
  if (perf.samples.length >= 4) {
    const avg = perf.samples.reduce((a, b) => a + b, 0) / perf.samples.length; perf.samples.length = 0;
    if (T > 6 && avg > 1 / 55 && qIndex < QUALITY.length - 1 && T - perf.lastDrop > 6) { perf.lastDrop = T; setQuality(qIndex + 1, true); }
  }
}

function step(dt) {
  updatePlayer(dt);
  cam.target.x = damp(cam.target.x, player.root.position.x, 2.4, dt);
  cam.target.z = damp(cam.target.z, player.root.position.z, 2.4, dt);
  cam.zoomS = damp(cam.zoomS, cam.zoom, 8, dt);
  updateCamera();
  moon.position.copy(cam.target).add(MOON_OFF); moon.target.position.copy(cam.target);
  lightning.position.copy(cam.target).add(new THREE.Vector3(60, 90, -40)); lightning.target.position.copy(cam.target);
  updateWorld(dt, T);
  game.update(dt, T);
  updateLightFeed();
  const pxPerM = renderer.domElement.height / (cam.viewSize * cam.zoomS);
  rain.userData.update(T, cam.target);
  mist.userData.update(T, cam.target);
  for (const s of level.steams) s.userData.update(T, pxPerM * 1.3);
  papers.userData.update(T, dt, wind);
  wetUniforms.uTime.value = T;
  sfx.update(dt, T);
  post.compMat.uniforms.uGrain.value = 0.035 + 0.12 * game.staticLevel + 0.05 * (3 - game.sanity);
  post.compMat.uniforms.uVignette.value = 0.55 + 0.25 * game.staticLevel;
  if (markerT > 0) { markerT -= dt * 0.9; marker.material.opacity = Math.max(0, markerT) * 0.8; marker.scale.setScalar(1 + (1 - markerT) * 1.5); }
}

const _cutP = new THREE.Vector3();
let frameNo = 0;
function render() {
  frameNo++;
  renderer.shadowMap.needsUpdate = true;
  moon.shadow.needsUpdate = frameNo % 3 === 0;
  if (level.dyn) for (const l of level.dyn.lamps) if (l.light.castShadow) { l.light.shadow.autoUpdate = false; l.light.shadow.needsUpdate = frameNo % 2 === 1; }
  cutU.uCut.value.set(0, 0, 0, 0);
  reflection.render(camera, [level.ground, marker].filter(Boolean));
  _cutP.copy(player.root.position); _cutP.y += 0.9;
  _cutP.applyMatrix4(camera.matrixWorldInverse);
  cutU.uCut.value.set(_cutP.x, _cutP.y, -_cutP.z, 15.0);
  cutU.uCutY.value = player.root.position.y + 1.9;
  post.render(scene, camera, T, flash * 0.06 + game.grabFlash * 0.35);
}

// ---------------------------------------------------------------- boot
document.getElementById('quality').textContent = QUALITY[0].name;
document.getElementById('menu').classList.add('show');
// chapter one is built behind the title screen so the menu is not a black screen
{ const w = buildLevel(CHAPTERS[0]); game.dyn = w.dyn; game.built = w.built; game.ctx = w.ctx; }
cam.target.set(1.5, 0, 3.5);
player.root.position.set(1.5, 0, 3.5);
updateCamera();
renderer.setClearColor(FOG_COLOR);
renderer.setAnimationLoop(frame);

// dev hooks
const dbgMat = new THREE.MeshBasicMaterial();
window.VS = {
  scene, camera, cam, player, renderer, setQuality, reflection, post, game, level,
  get dyn() { return level.dyn; },
  advance(seconds, fps = 30) { const n = Math.round(seconds * fps); for (let i = 0; i < n; i++) { T += 1 / fps; step(1 / fps); } },
  lightning(k = 1) { flash = k; },
  watcherNow() { watch.next = 0; watch.state = 'hidden'; },
  click(nx, ny) { clickAt((nx * 0.5 + 0.5) * window.innerWidth, (0.5 - ny * 0.5) * window.innerHeight); },
  walkTo(x, z) { const c = clampToWalkable({ x, z }); moveTarget.set(c.x, 0, c.z); hasTarget = true; return c; },
  moving() { return hasTarget; },
  goto(i) { game.loadChapter(i); },
  begin(i = 0) { game.begin(i); },
  state() { return { player: player.root.position.toArray(), target: hasTarget ? moveTarget.toArray() : null, watcher: watch.state, game: game.state, chapter: game.chapter, sanity: game.sanity, battery: game.batteryLevel, hollows: game.hollows.map((h) => h.state), objective: game.objectiveText, T }; },
  debugRefl(blur = false) {
    render();
    dbgMat.map = blur ? reflection.blurB.texture : reflection.rt.texture;
    post.quad.material = dbgMat; renderer.setRenderTarget(null); renderer.render(post.scene, post.cam);
    const data = renderer.domElement.toDataURL('image/jpeg', 0.85);
    return fetch('/__shot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'refl', data }) }).then((r) => r.json());
  },
  shot(name = 'shot', quality = 0.85) {
    render();
    const data = renderer.domElement.toDataURL('image/jpeg', quality);
    return fetch('/__shot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, data }) }).then((r) => r.json());
  },
  frameTime(n = 40) {
    const gl = renderer.getContext(); const px = new Uint8Array(4); const times = [];
    for (let i = 0; i < n; i++) { const a = performance.now(); step(1 / 60); render(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); times.push(performance.now() - a); }
    times.sort((a, b) => a - b);
    return { median: +times[n >> 1].toFixed(2), p90: +times[Math.floor(n * 0.9)].toFixed(2), min: +times[0].toFixed(2) };
  },
};
