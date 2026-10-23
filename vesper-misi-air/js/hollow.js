// The Answered ("hollows"): drowned figures that shamble toward the player
// while unlit. In the core of the beam they freeze and slowly burn; at its
// edge they creep; when the light wavers or turns away they lunge.
import * as THREE from 'three';
import { Character } from './character.js';
import { damp, rand, clamp } from './util.js';
import { clampToWalkable } from './world.js';

export const BURN_TIME = 4.6;

export class Hollow {
  constructor() {
    const mk = (Cls, extra = {}) => new Cls({ vertexColors: true, transparent: true, opacity: 1, ...extra });
    this.mats = {
      matte: mk(THREE.MeshStandardMaterial, { roughness: 0.42, metalness: 0.12 }), // wet skin glints in the beam
      shiny: mk(THREE.MeshStandardMaterial, { roughness: 0.35, metalness: 0.15 }),
      emit: mk(THREE.MeshBasicMaterial),
      glass: mk(THREE.MeshBasicMaterial),
    };
    this.ch = new Character(this.mats, { dark: true, noTorch: true, eye: 0xff5a48, eyeInt: 0.7, tone: 0x0e1113 });
    this.root = this.ch.root;
    this.root.scale.set(1.06, 1.17, 1.06);
    this.state = 'stalk';       // stalk | creep | frozen | lunge | burn | gone
    this.heat = 0; this.alpha = 0; this.age = 0; this.burnT = 0;
    this.speed = rand(1.25, 1.65);
    this.twitchT = 0; this.tilt = rand(0.25, 0.45) * (Math.random() < 0.5 ? 1 : -1);
    this.lungeT = 0; this.lungeCd = rand(1, 3); this.lungeDir = new THREE.Vector3();
    this.lastGrab = -10; this.burns = 0;
  }

  spawn(x, z, playerPos) {
    this.root.position.set(x, 0, z);
    this.root.rotation.y = Math.atan2(playerPos.x - x, playerPos.z - z);
    this.root.visible = true;
    this.state = 'stalk'; this.heat = 0; this.alpha = 0; this.age = 0; this.burnT = 0; this.lungeT = 0; this.lungeCd = rand(1.5, 3.5);
    this.setAlpha(0);
  }

  setAlpha(a) {
    for (const k in this.mats) this.mats[k].opacity = a;
    this.mats.emit.color.setScalar(1 + this.heat * 0.9);
    this.root.scale.set(1.06, 1.17 + (this.state === 'burn' ? this.burnT * 0.7 : 0) + this.heat * 0.03, 1.06);
  }

  // lit: 0 unlit, 1 beam edge, 2 beam core. safe: [{x,z,r}]. facing: player is turned toward this hollow.
  // Returns 'grab' | 'burn' | 'lunge' | null.
  update(dt, t, playerPos, lit, safe, flashOn, facing) {
    this.age += dt;
    let event = null;
    if (this.state === 'gone') return null;
    const p = this.root.position;
    const dx = playerPos.x - p.x, dz = playerPos.z - p.z;
    const dist = Math.hypot(dx, dz);
    if (this.state === 'burn') {
      this.burnT += dt;
      this.alpha = clamp(1 - this.burnT / 1.4, 0, 1);
      this.setAlpha(this.alpha);
      this.ch.update(dt, t, 0);
      this.root.position.y = this.burnT * 0.2;
      if (this.burnT > 1.4) { this.state = 'gone'; this.root.visible = false; this.burns++; }
      return null;
    }
    this.alpha = Math.min(1, this.alpha + dt * 0.8);
    this.lungeCd -= dt;
    if (this.lungeT > 0) {
      this.state = 'lunge';
      this.lungeT -= dt;
    } else if (lit === 2) {
      this.state = 'frozen';
      this.heat += dt;
      if (this.heat > BURN_TIME) { this.state = 'burn'; this.burnT = 0; return 'burn'; }
    } else if (lit === 1) {
      this.state = 'creep';
      this.heat = Math.max(0, this.heat - dt * 1.2);
    } else {
      this.state = 'stalk';
      this.heat = Math.max(0, this.heat - dt * 1.6);
      // a lunge when the light is off it and it is close
      if (dist < 5.5 && dist > 1.0 && this.lungeCd <= 0 && this.age > 2.5) {
        this.lungeT = 0.55; this.lungeCd = rand(3.5, 6); this.state = 'lunge';
        this.lungeDir.set(dx / dist, 0, dz / dist);
        event = 'lunge';
      }
    }
    // facing the player
    const yaw = Math.atan2(dx, dz);
    let dy = yaw - this.root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    this.root.rotation.y += dy * (1 - Math.exp(-(this.state === 'frozen' ? 1.5 : 5) * dt));
    let speed = 0;
    if (this.state === 'stalk') speed = this.speed * (flashOn ? 1 : 1.7) * (facing ? 1 : 1.3);
    else if (this.state === 'creep') speed = 0.4;
    else if (this.state === 'lunge') speed = 3.8;
    else if (this.state === 'frozen') speed = this.heat < 0.6 ? 0.12 : 0; // the first moment of light does not quite hold it
    if (speed > 0 && dist > 0.85) {
      const step = Math.min(dist - 0.8, speed * dt);
      let nx = p.x + dx / dist * step, nz = p.z + dz / dist * step;
      for (const s of safe) {
        const ox = nx - s.x, oz = nz - s.z, r = s.r;
        const d2 = ox * ox + oz * oz;
        if (d2 < r * r && d2 > 1e-6) { const d = Math.sqrt(d2); nx = s.x + ox / d * r; nz = s.z + oz / d * r; }
      }
      const c = clampToWalkable({ x: nx, z: nz });
      p.x = c.x; p.z = c.z;
    }
    if (dist <= 0.9 && this.state !== 'frozen' && t - this.lastGrab > 2.5) { this.lastGrab = t; event = 'grab'; }
    // animation: shamble, hanging arms, tilted head, twitches; reaching when close and held
    this.ch.update(dt, t, speed > 0.3 ? Math.max(speed, 1.2) : 0);
    const ch = this.ch;
    const reach = this.state === 'frozen' && dist < 3.5 ? clamp((3.5 - dist) / 2.5, 0, 1) * 1.4 : 0;
    ch.armR.sh.rotation.x = 0.1 - reach + Math.sin(t * 0.9) * 0.05; ch.armR.el.rotation.x = -0.35 + reach * 0.2; ch.armR.sh.rotation.y = 0; ch.armR.sh.rotation.z = -0.35 + reach * 0.3;
    ch.armL.sh.rotation.x = 0.15 - reach + Math.sin(t * 1.1 + 1) * 0.05; ch.armL.el.rotation.x = -0.25 + reach * 0.2; ch.armL.sh.rotation.z = 0.3 - reach * 0.3;
    ch.head.rotation.z = this.tilt * (1 - reach * 0.7); ch.head.rotation.x = 0.35 - reach * 0.5;
    this.twitchT -= dt;
    if (this.twitchT <= 0) { this.twitchT = rand(0.6, 2.4); ch.head.rotation.y = rand(-0.9, 0.9); }
    if (this.state === 'frozen') {
      const k = Math.min(1, this.heat / BURN_TIME);
      const j = Math.sin(t * 43) * (0.01 + 0.04 * k);
      ch.torso.rotation.y += j; ch.head.rotation.x += Math.sin(t * 61) * 0.06 * k;
      ch.legL.hip.rotation.x = ch.legR.hip.rotation.x = 0;
    }
    if (this.state === 'lunge') { ch.torso.rotation.x = 0.35; ch.head.rotation.x = -0.2; }
    this.setAlpha(this.alpha);
    return event;
  }
}
