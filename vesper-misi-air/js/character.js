// Voxel character rig with procedural idle/walk animation and a flashlight.
import * as THREE from 'three';
import { Vox, P, E, voxGroup } from './voxel.js';
import { makeBeam } from './effects.js';
import { damp, lerp, rand } from './util.js';

const S = 0.1; // metres per voxel
const _aimDir = new THREE.Vector3();

function partMesh(vox, materials, offset) {
  return voxGroup(vox, S, materials, { offset, castShadow: true, ao: 0.6 });
}

export class Character {
  constructor(materials, opts = {}) {
    const dark = !!opts.dark;
    const c = dark
      ? { skin: P(opts.tone || 0x0b0b0c, 'matte', 0), hair: P(0x08080a, 'matte', 0), jacket: P(opts.tone || 0x0a0a0c, 'matte', 0), jacketD: P(0x08080a, 'matte', 0), pants: P(0x0a0a0b, 'matte', 0), boots: P(0x070708, 'matte', 0), shirt: P(0x0b0b0c, 'matte', 0), eye: E(opts.eye || 0xd8e0ff, opts.eyeInt || 0.9), metal: P(0x0c0c0d, 'matte', 0), lens: opts.noTorch ? P(0x0c0c0d, 'matte', 0) : E(0xe8f0ff, 3.5) }
      : { skin: P(0xc9a184, 'matte', 0.03), hair: P(0x2a2320, 'matte', 0.05), jacket: P(0x4a5140, 'matte', 0.05), jacketD: P(0x39402f, 'matte', 0.05), pants: P(0x2b2f3a, 'matte', 0.05), boots: P(0x1c1a18, 'matte', 0.04), shirt: P(0x7a6f60, 'matte', 0.04), eye: P(0x141010, 'matte', 0), metal: P(0x6a6a6e, 'shiny', 0.03), lens: E(0xfff1cc, 5) };
    this.dark = dark;
    const root = new THREE.Group();
    this.root = root;

    // hips + torso
    const hips = new THREE.Group(); hips.position.y = 0.9; root.add(hips);
    this.hips = hips;
    const torsoV = new Vox(6, 6, 3);
    torsoV.box(0, 0, 0, 5, 5, 2, c.jacket);
    torsoV.box(2, 0, 2, 3, 4, 2, c.shirt);            // open jacket front
    torsoV.box(0, 0, 0, 5, 0, 2, c.jacketD);           // hem
    torsoV.box(0, 5, 0, 5, 5, 2, c.jacketD);           // collar
    torsoV.box(2, 5, 2, 3, 5, 2, c.skin);              // neck
    const torso = partMesh(torsoV, materials, [-0.3, 0, -0.15]);
    hips.add(torso); this.torso = torso;

    // head
    const headG = new THREE.Group(); headG.position.set(0, 0.6, 0); torso.add(headG);
    const headV = new Vox(5, 5, 5);
    headV.box(0, 0, 0, 4, 4, 4, c.skin);
    headV.box(0, 3, 0, 4, 4, 4, c.hair);
    headV.box(0, 1, 0, 4, 2, 0, c.hair);               // back of head
    headV.box(0, 2, 1, 0, 2, 1, c.hair); headV.box(4, 2, 1, 4, 2, 1, c.hair);
    headV.set(1, 2, 4, c.eye); headV.set(3, 2, 4, c.eye);
    headV.box(1, 4, 4, 3, 4, 4, c.skin);               // hairline dip (forehead)
    headV.box(0, 4, 3, 4, 4, 4, c.hair);
    const head = partMesh(headV, materials, [-0.25, 0.02, -0.25]);
    headG.add(head); this.head = headG;

    // legs
    const mkLeg = (side) => {
      const hip = new THREE.Group(); hip.position.set(side * 0.16, 0, 0); hips.add(hip);
      const upV = new Vox(3, 4, 3); upV.box(0, 0, 0, 2, 3, 2, c.pants);
      hip.add(partMesh(upV, materials, [-0.15, -0.4, -0.15]));
      const knee = new THREE.Group(); knee.position.set(0, -0.4, 0); hip.add(knee);
      const lowV = new Vox(3, 5, 5); lowV.box(0, 1, 0, 2, 4, 2, c.pants); lowV.box(0, 0, 0, 2, 0, 4, c.boots); lowV.box(0, 1, 0, 2, 1, 2, c.boots);
      knee.add(partMesh(lowV, materials, [-0.15, -0.5, -0.15]));
      return { hip, knee };
    };
    this.legL = mkLeg(-1); this.legR = mkLeg(1);

    // arms
    const mkArm = (side) => {
      const sh = new THREE.Group(); sh.position.set(side * 0.4, 0.5, 0); torso.add(sh);
      const upV = new Vox(2, 4, 2); upV.box(0, 0, 0, 1, 3, 1, c.jacket);
      sh.add(partMesh(upV, materials, [-0.1, -0.4, -0.1]));
      const el = new THREE.Group(); el.position.set(0, -0.4, 0); sh.add(el);
      const lowV = new Vox(2, 4, 2); lowV.box(0, 1, 0, 1, 3, 1, c.jacket); lowV.box(0, 0, 0, 1, 0, 1, c.skin);
      el.add(partMesh(lowV, materials, [-0.1, -0.4, -0.1]));
      return { sh, el };
    };
    this.armL = mkArm(-1); this.armR = mkArm(1);

    // flashlight in the right hand
    const fl = new THREE.Group(); fl.position.set(0, -0.36, 0.06); fl.rotation.x = Math.PI / 2; this.armR.el.add(fl);
    const flV = new Vox(2, 2, 6); flV.box(0, 0, 0, 1, 1, 4, c.metal); flV.box(0, 0, 5, 1, 1, 5, c.lens);
    fl.add(partMesh(flV, materials, [-0.1, -0.1, -0.2]));
    this.flashGroup = fl;
    if (!dark) {
      const light = new THREE.SpotLight(0xfff0d0, 320, 34, 0.42, 0.45, 2);
      light.position.set(0, 0, 0.55);
      light.target.position.set(0, 0, 10);
      light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      light.shadow.bias = -0.002; light.shadow.normalBias = 0.08;
      light.shadow.camera.near = 0.3; light.shadow.camera.far = 34;
      fl.add(light); fl.add(light.target);
      this.light = light;
      const cone = makeBeam(11.5, 3.6, 0xffe7b8, 0.09);
      cone.position.set(0, 0, 0.45);
      fl.add(cone); this.cone = cone;
      // faint fill so the figure reads in the dark
      const fill = new THREE.PointLight(0xa8b4c8, 2.2, 5, 2); fill.position.set(0.3, 2.8, 0.9); root.add(fill);
    } else if (!opts.noTorch) {
      const torch = new THREE.PointLight(0xcfd8ff, 0, 7, 2); torch.position.set(0, 0, 0.6); fl.add(torch);
      this.backLight = torch;
    }

    this.phase = 0; this.bob = 0; this.lookYaw = 0; this.lookTarget = 0; this.lookTimer = 0;
    this.speedSmooth = 0; this.flashOn = true; this.flashLevel = 1; this.blinkT = 0; this.power = 1;
    this.pose = 0; // 0 idle, 1 walking
    // aim assist: when aimTarget (world position) is set the beam servoes onto it
    this.aimTarget = null; this.aimYaw = 0; this.aimSign = 1;
    {
      const d0 = new THREE.Vector3(), d1 = new THREE.Vector3();
      this.armR.sh.rotation.x = -1.36; this.armR.sh.rotation.y = 0.12; root.updateMatrixWorld(true);
      fl.getWorldDirection(d0);
      this.armR.sh.rotation.y = 0.42; root.updateMatrixWorld(true);
      fl.getWorldDirection(d1);
      const dy = Math.atan2(Math.sin(Math.atan2(d1.x, d1.z) - Math.atan2(d0.x, d0.z)), Math.cos(Math.atan2(d1.x, d1.z) - Math.atan2(d0.x, d0.z)));
      this.aimSign = dy >= 0 ? 1 : -1;
      this.armR.sh.rotation.y = 0.12;
    }
  }

  setFlashlight(on) { this.flashOn = on; }

  // speed in m/s, t seconds.
  update(dt, t, speed) {
    this.speedSmooth = damp(this.speedSmooth, speed, 8, dt);
    const s = this.speedSmooth;
    const walk = Math.min(1, s / 1.2);
    this.pose = damp(this.pose, walk, 6, dt);
    this.phase += dt * (s * 3.6 + 0.0);
    const ph = this.phase, w = this.pose;
    const A = 0.62 * w, K = 0.95 * w;
    // legs: forward swing = negative rotation.x
    const sl = Math.sin(ph), sr = Math.sin(ph + Math.PI);
    this.legL.hip.rotation.x = -A * sl;
    this.legR.hip.rotation.x = -A * sr;
    const cl = Math.max(0, Math.cos(ph)), cr = Math.max(0, Math.cos(ph + Math.PI));
    this.legL.knee.rotation.x = K * cl * cl;
    this.legR.knee.rotation.x = K * cr * cr;
    // left arm swings opposite the left leg; right arm holds the light
    this.armL.sh.rotation.x = 0.5 * A * sl * -1 + (1 - w) * 0.05;
    this.armL.sh.rotation.z = 0.12 + 0.05 * Math.sin(t * 1.3);
    this.armL.el.rotation.x = -0.25 - 0.3 * w * Math.max(0, -sl);
    const sway = Math.sin(ph) * 0.05 * w + Math.sin(t * 0.9) * 0.025;
    this.armR.sh.rotation.x = -1.36 + sway + (1 - w) * 0.06 * Math.sin(t * 0.7);
    this.armR.sh.rotation.z = -0.18 + 0.03 * Math.sin(t * 1.1);
    if (this.aimTarget) {
      // servo the beam yaw onto the target using the measured beam direction
      const dir = this.flashGroup.getWorldDirection(_aimDir);
      const cur = Math.atan2(dir.x, dir.z);
      const want = Math.atan2(this.aimTarget.x - this.root.position.x, this.aimTarget.z - this.root.position.z);
      let err = want - cur; err = Math.atan2(Math.sin(err), Math.cos(err));
      this.aimYaw = Math.max(-1.05, Math.min(1.05, this.aimYaw + err * this.aimSign * Math.min(1, dt * 9)));
      this.armR.sh.rotation.y = 0.12 + this.aimYaw;
      let look = want - this.root.rotation.y; look = Math.atan2(Math.sin(look), Math.cos(look));
      this.lookYaw = damp(this.lookYaw, Math.max(-1.0, Math.min(1.0, look)), 8, dt);
      this.head.rotation.y = this.lookYaw;
    } else {
      this.aimYaw = damp(this.aimYaw, 0, 4, dt);
      this.armR.sh.rotation.y = 0.12 + this.aimYaw + (1 - w) * 0.32 * Math.sin(t * 0.55 + 1.0) * Math.sin(t * 0.21);
    }
    this.armR.el.rotation.x = -0.12;
    // body bob + lean
    this.hips.position.y = 0.9 + Math.abs(Math.sin(ph)) * 0.035 * w;
    this.torso.rotation.x = 0.08 * w + Math.sin(t * 1.4) * 0.008; // slight lean when walking, breathing
    this.torso.rotation.y = Math.sin(ph) * 0.05 * w;
    this.torso.scale.y = 1 + Math.sin(t * 1.4) * 0.012;
    // head look-around while idle
    this.lookTimer -= dt;
    if (this.lookTimer <= 0) { this.lookTimer = rand(1.5, 5); this.lookTarget = rand(-0.7, 0.7) * (1 - w * 0.7); }
    this.lookYaw = damp(this.lookYaw, this.lookTarget, 2.5, dt);
    this.head.rotation.y = this.lookYaw;
    this.head.rotation.x = -0.03 + Math.sin(t * 0.8) * 0.02 + 0.06 * w;
    // flashlight flicker: mostly steady, occasional weak sputter
    if (this.light) {
      this.blinkT -= dt;
      let target = this.flashOn ? 1 : 0;
      // a weak battery sputters more and more
      const weak = this.power < 0.25 ? (0.25 - this.power) * 4 : 0;
      if (this.flashOn && this.blinkT <= 0) {
        if (Math.random() < 0.012 + weak * 0.08) this.blinkT = rand(0.05, 0.25 + weak * 0.3);
      }
      if (this.blinkT > 0 && this.flashOn) target = 0.35 + Math.random() * 0.35;
      target *= 0.25 + 0.75 * Math.min(1, this.power * 2.5);
      this.flashLevel = damp(this.flashLevel, target, 30, dt);
      this.light.intensity = 320 * this.flashLevel;
      this.cone.material.uniforms.uInt.value = 0.09 * this.flashLevel;
      this.cone.material.uniforms.uTime.value = t;
      this.cone.visible = this.flashLevel > 0.02;
    }
  }
}
