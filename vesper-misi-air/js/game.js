// Campaign runtime: chapters, objectives, items, hazards, sanity, battery,
// the Answered, phone calls, notes, endings, saves, and the overlay DOM.
import * as THREE from 'three';
import { CHAPTERS, NOTES, CALLS } from './levels.js';
import { makeItem, ITEM_LABEL, ITEM_GLOW } from './items.js';
import { Hollow, BURN_TIME } from './hollow.js';
import { makeGlows } from './effects.js';
import { WALK_RECTS, setWalkRects, clampToWalkable } from './world.js';
import { wetUniforms } from './ground.js';
import { damp, clamp, rand } from './util.js';

const $ = (id) => document.getElementById(id);
const SAVE_KEY = 'vesper.save.v1';
const _pv = new THREE.Vector3();

export class Game {
  constructor(host) {
    this.host = host;               // { scene, materials, player, cam, sfx, buildLevel, disposeLevel, setFog, watcherNow, spawnHollowAt }
    this.state = 'menu';            // menu | card | play | read | call | dead | ending
    this.chapter = 0;
    this.pagesRead = new Set();
    this.sanity = 3; this.batteryLevel = 100;
    this.items = []; this.interacts = []; this.triggers = []; this.hazards = []; this.timers = [];
    this.hollows = []; this.hollowMaxN = 0; this.hollowT = 0; this.hollowIntervalN = 25;
    this.flood = 0; this.floodTarget = 0; this.floodRate = 0;
    this.staticLevel = 0; this.grabFlash = 0; this.hitCooldown = 0;
    this.pending = null; this.objectiveText = '';
    this.exitRect = null; this.inv = new Set(); this.flags = {};
    this.load();
    this.bindUI();
  }

  get sfx() { return this.host.sfx; }

  // ------------------------------------------------------------ persistence
  load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s) { this.savedChapter = s.chapter | 0; this.pagesRead = new Set(s.pages || []); } } catch (e) { /* ignore */ } }
  save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ chapter: this.chapter, pages: [...this.pagesRead] })); } catch (e) { /* ignore */ } }

  // ------------------------------------------------------------ UI
  bindUI() {
    $('btnNew').addEventListener('click', () => { this.pagesRead.clear(); this.begin(0); });
    $('btnContinue').addEventListener('click', () => this.begin(this.savedChapter || 0));
    if (this.savedChapter === undefined) $('btnContinue').style.display = 'none';
    $('note').addEventListener('click', () => this.closeNote());
    $('call').addEventListener('click', () => this.closeCall());
    $('ending').addEventListener('click', () => { if (this.state === 'ending') { $('ending').classList.remove('show'); $('menu').classList.add('show'); this.state = 'menu'; } });
  }
  begin(chapter) {
    this.host.sfx.start();
    $('menu').classList.remove('show');
    this.loadChapter(chapter);
  }
  setObjective(text) { this.objectiveText = text; const el = $('objective'); el.textContent = text; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
  toast(text, seconds = 4.5) { const el = $('toast'); el.textContent = text; el.classList.add('show'); clearTimeout(this.toastT); this.toastT = setTimeout(() => el.classList.remove('show'), seconds * 1000); }
  card(title, sub, seconds = 5.5) {
    $('cardTitle').textContent = title; $('cardSub').textContent = sub;
    const el = $('card'); el.classList.add('show');
    clearTimeout(this.cardT); this.cardT = setTimeout(() => el.classList.remove('show'), seconds * 1000);
  }
  typewrite(el, text, cps = 38, done) {
    clearInterval(this.typeT); el.textContent = '';
    let i = 0;
    this.typeT = setInterval(() => { i += 1 + (Math.random() < 0.15 ? 1 : 0); el.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(this.typeT); if (done) done(); } }, 1000 / cps);
  }

  // ------------------------------------------------------------ chapters
  loadChapter(i) {
    this.chapter = clamp(i, 0, CHAPTERS.length - 1);
    const spec = CHAPTERS[this.chapter];
    this.clearChapter();
    this.state = 'card';
    $('fade').classList.add('show');
    setTimeout(() => {
      const built = this.host.buildLevel(spec);
      this.built = built.built; this.dyn = built.dyn; this.ctx = built.ctx;
      setWalkRects(spec.walk.map((r) => ({ ...r })));
      this.host.player.root.position.set(spec.spawn[0], 0, spec.spawn[1]);
      this.host.cam.target.set(spec.spawn[0], 0, spec.spawn[1]);
      this.host.cam.yaw = spec.camYaw;
      this.host.setFog(spec.fog, spec.ambient || 1);
      this.flood = this.floodTarget = spec.flood; wetUniforms.uFlood.value = spec.flood;
      this.hollowMaxN = spec.hollows.max; this.hollowIntervalN = spec.hollows.interval; this.hollowT = spec.hollows.interval * 0.6;
      this.spawnPoints = spec.hollows.points;
      this.sanity = 3; this.batteryLevel = Math.max(this.batteryLevel, 60);
      this.host.player.setFlashlight(true);
      spec.setup(this);
      this.buildItemGlows();
      this.save();
      $('fade').classList.remove('show');
      this.card(spec.title, spec.subtitle);
      setTimeout(() => { if (this.state === 'card') this.state = 'play'; }, 1500);
    }, 700);
  }
  clearChapter() {
    for (const h of this.hollows) this.host.scene.remove(h.root);
    this.hollows = [];
    for (const it of this.items) if (it.mesh) this.host.scene.remove(it.mesh);
    if (this.itemGlows) { this.host.scene.remove(this.itemGlows); this.itemGlows = null; }
    this.items = []; this.interacts = []; this.triggers = []; this.hazards = []; this.timers = [];
    this.exitRect = null; this.inv.clear(); this.pending = null;
    this.ring(false);
    this.host.disposeLevel();
  }
  restartChapter() { this.loadChapter(this.chapter); }
  nextChapter() {
    if (this.chapter + 1 >= CHAPTERS.length) { this.ending(this.pagesRead.size >= 7); return; }
    this.loadChapter(this.chapter + 1);
  }

  // ------------------------------------------------------------ chapter API (used by levels.js)
  addItem(o) {
    const mesh = makeItem(o.kind, this.host.materials);
    mesh.position.set(o.x, o.y ?? 0.02, o.z);
    this.host.scene.add(mesh);
    const it = { ...o, mesh, taken: false, hidden: o.hidden || false, label: o.label || ITEM_LABEL[o.kind], r: o.r || 1.25, approach: o.approach || [o.x, o.z] };
    if (it.hidden) mesh.visible = false;
    this.items.push(it);
    return it;
  }
  showItem(it) { it.hidden = false; it.mesh.visible = true; }
  addInteract(o) { const it = { ...o, taken: false, isInteract: true }; this.interacts.push(it); return it; }
  addTrigger(o) { this.triggers.push({ ...o, done: false }); }
  addHazard(o) { this.hazards.push(o); }
  addWalk(rect) { WALK_RECTS.push(rect); }
  exitAt(rect) { this.exitRect = rect; }
  after(seconds, fn) { this.timers.push({ t: seconds, fn }); }
  give(name) { this.inv.add(name); this.host.sfx.pickup(); }
  has(name) { return this.inv.has(name); }
  battery(amount) { this.batteryLevel = Math.min(100, this.batteryLevel + amount); this.host.sfx.pickup(); this.toast('Baterai. Cahaya senter stabil lagi.', 3); }
  hollowsMax(n) { this.hollowMaxN = n; }
  hollowSoon(seconds = 2) { this.hollowT = Math.min(this.hollowT, seconds); }
  watcherNow() { this.host.watcherNow(); }
  setFlood(target, seconds) { this.floodTarget = target; this.floodRate = Math.abs(target - this.flood) / Math.max(0.1, seconds); }
  powerFlood(flood) { flood.on = true; flood.light.intensity = 260; flood.beam.material.uniforms.uInt.value = 0.05; flood.lensMat.color.setScalar(1); this.dyn.glowInt[flood.slot] = 1; this.dyn.safe.push({ x: flood.x, z: flood.z, r: 6.5, lamp: null }); }
  openGate(fence) {
    if (fence && fence.gateMesh) { fence.gateMesh.visible = false; }
    this.host.sfx.gate();
    // remove the barricade obstacle that sat in the gate
    this.dyn.obstacles = this.dyn.obstacles.filter((o) => !(Math.abs(o.x) < 1.6 && o.z < -19 && o.z > -22));
  }
  ring(on) {
    this.ringing = on; this.host.sfx.ring(on);
  }
  note(id) {
    const n = NOTES[id];
    this.pagesRead.add(id); this.save();
    this.host.sfx.page();
    this.state = 'read';
    $('noteTitle').textContent = n.title;
    $('noteBody').textContent = '';
    $('note').classList.add('show');
    const qz = $('quiz'); qz.innerHTML = ''; this.quizOpen = !!n.q;
    this.typewrite($('noteBody'), n.body, 60, () => { if (n.q) this.showQuiz(n); });
    if (n.q) setTimeout(() => { if (this.state === 'read' && !qz.innerHTML) this.showQuiz(n); }, 2500);
  }
  // ---- lapisan edukasi: soal di setiap catatan ----
  showQuiz(n) {
    const qz = $('quiz'); if (qz.innerHTML) return;
    $('noteHint').textContent = 'jawab soal untuk melanjutkan';
    qz.innerHTML = '<b>' + n.q + '</b>' + n.opts.map((o, i) => '<button data-i="' + i + '">' + String.fromCharCode(65 + i) + '. ' + o + '</button>').join('');
    qz.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', (e) => {
      e.stopPropagation(); if (!this.quizOpen) return;
      const i = +btn.dataset.i; this.quizOpen = false;
      qz.querySelectorAll('button').forEach((x, j) => { x.disabled = true; if (j === n.ans) x.classList.add('ok'); });
      if (i === n.ans) { btn.classList.add('ok'); this.score = (this.score || 0) + 1; this.batteryLevel = Math.min(100, this.batteryLevel + 25); this.host.sfx.pickup(); this.toast('Benar! ' + n.why + ' Baterai +25%.', 4); }
      else { btn.classList.add('no'); this.toast('Belum tepat. ' + n.why, 5); }
      $('noteHint').textContent = 'klik untuk menutup · skor ' + (this.score || 0) + '/7';
      const sc = document.getElementById('eduScore'); if (sc) sc.textContent = 'Skor IPA ' + (this.score || 0) + '/7';
    }));
  }
  closeNote() { if (this.state !== 'read' || this.quizOpen) return; clearInterval(this.typeT); $('note').classList.remove('show'); this.state = 'play'; }
  call(id, done) {
    const lines = CALLS[id];
    this.state = 'call'; this.callDone = done;
    $('callBody').textContent = '';
    $('call').classList.add('show');
    this.host.sfx.setStatic(0.9); this.host.sfx.voice(lines.join(' ').length * 0.045);
    let i = 0; const el = $('callBody');
    const nextLine = () => { if (i >= lines.length) { $('callHint').textContent = 'click to hang up'; return; } const line = lines[i++]; el.textContent += (el.textContent ? '\n' : '') + line; this.callLineT = setTimeout(nextLine, 900 + line.length * 45); };
    $('callHint').textContent = ''; nextLine();
  }
  closeCall() {
    if (this.state !== 'call') return;
    clearTimeout(this.callLineT); $('call').classList.remove('show'); this.host.sfx.setStatic(0);
    this.state = 'play';
    const d = this.callDone; this.callDone = null; if (d) d();
  }
  ending(all) {
    this.state = 'ending';
    this.ring(false);
    $('fade').classList.add('show');
    setTimeout(() => {
      $('endTitle').textContent = all ? 'TIDE' : 'STATIC';
      $('endBody').textContent = all
        ? 'She left the receiver hanging and walked back out into the rain.\n\nBehind her, every phone on Vesper Street stopped ringing at once.\n\nThe water forgot her name.'
        : 'She answered. Of course she answered.\n\nOn Vesper Street, everyone answers eventually.\n\n(Read every torn page for the other ending.)';
      $('ending').classList.add('show');
      $('fade').classList.remove('show');
      try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
      this.savedChapter = undefined; $('btnContinue').style.display = 'none';
    }, 1800);
  }

  // ------------------------------------------------------------ item glows
  buildItemGlows() {
    const list = this.items.map((it, i) => ({ pos: [it.x, (it.y ?? 0.02) + 0.3, it.z], color: ITEM_GLOW[it.kind] || 0xffffff, size: it.kind === 'battery' ? 2.0 : 2.5, slot: i }));
    if (!list.length) return;
    this.itemGlows = makeGlows(list);
    this.itemGlows.layers.set(1);
    // pickups are marked through roofs and walls so they can be found in the dark
    this.itemGlows.material.depthTest = false;
    this.itemGlows.renderOrder = 9;
    this.host.scene.add(this.itemGlows);
  }

  // ------------------------------------------------------------ input from main
  // Called with the ground hit point and the closest item/interact under the cursor (or null).
  handleClick(point, picked) {
    if (this.state !== 'play') { if (this.state === 'read') this.closeNote(); else if (this.state === 'call') this.closeCall(); return null; }
    if (picked) {
      this.pending = picked;
      const a = picked.approach || [picked.x, picked.z];
      const c = clampToWalkable({ x: a[0], z: a[1] });
      return { x: c.x, z: c.z };
    }
    this.pending = null;
    return null;
  }
  // Closest item/interactable to the pick ray (distance measured perpendicular to
  // the ray, so things on benches, seats and walls pick as easily as things on the road).
  pickAt(ray) {
    let best = null, bd = 1e9;
    const test = (x, y, z, r) => {
      _pv.set(x, y, z).sub(ray.origin);
      const along = _pv.dot(ray.direction);
      _pv.addScaledVector(ray.direction, -along);
      const d = _pv.length();
      return d < r ? d : Infinity;
    };
    for (const it of this.items) { if (it.taken || it.hidden) continue; const d = test(it.x, (it.y ?? 0.02) + 0.15, it.z, 1.15); if (d < bd) { bd = d; best = it; } }
    for (const it of this.interacts) { const d = test(it.x, 1.0, it.z, it.r + 0.3); if (d < bd) { bd = d; best = it; } }
    return best;
  }
  toggleFlashlight() {
    const p = this.host.player;
    if (!p.flashOn && this.batteryLevel <= 0) { this.toast('Baterai habis.', 2.5); return; }
    p.setFlashlight(!p.flashOn);
  }

  // ------------------------------------------------------------ per-frame
  update(dt, t) {
    const player = this.host.player;
    const pp = player.root.position;
    if (this.state === 'menu' || this.state === 'ending') return;
    const playing = this.state === 'play';
    // timers
    if (playing) for (const tm of this.timers) { tm.t -= dt; if (tm.t <= 0 && !tm.done) { tm.done = true; tm.fn(this); } }
    this.timers = this.timers.filter((tm) => !tm.done);
    // flood animation
    if (this.flood !== this.floodTarget) {
      const dir = Math.sign(this.floodTarget - this.flood);
      this.flood += dir * this.floodRate * dt;
      if ((dir > 0 && this.flood >= this.floodTarget) || (dir < 0 && this.flood <= this.floodTarget)) this.flood = this.floodTarget;
      wetUniforms.uFlood.value = this.flood;
    }
    // battery
    if (player.flashOn) {
      this.batteryLevel = Math.max(0, this.batteryLevel - dt * 0.55);
      if (this.batteryLevel <= 0) { player.setFlashlight(false); this.toast('Senter mati.', 3); }
    }
    player.power = clamp(this.batteryLevel / 40, 0.1, 1);
    // pending interaction: arrive then use; if something blocks the last step, use it from arm's reach
    if (this.pending && playing) {
      const it = this.pending;
      const a = it.approach || [it.x, it.z];
      const dItem = Math.hypot(pp.x - it.x, pp.z - it.z);
      const stopped = this.host.isMoving ? !this.host.isMoving() : false;
      if (Math.hypot(pp.x - a[0], pp.z - a[1]) < 1.35 || dItem < (it.r || 1.25) || (stopped && dItem < 2.6)) {
        this.pending = null;
        this.use(it);
      }
    }
    // triggers
    if (playing) for (const tr of this.triggers) {
      if (tr.done) continue;
      if (pp.x >= tr.x0 && pp.x <= tr.x1 && pp.z >= tr.z0 && pp.z <= tr.z1) { if (tr.once) tr.done = true; tr.onEnter(this); }
    }
    // exit
    if (playing && this.exitRect) { const r = this.exitRect; if (pp.x >= r.x0 && pp.x <= r.x1 && pp.z >= r.z0 && pp.z <= r.z1) { this.exitRect = null; this.state = 'card'; this.nextChapter(); return; } }
    // hazards
    this.hitCooldown = Math.max(0, this.hitCooldown - dt);
    if (playing) for (const h of this.hazards) {
      if (Math.hypot(pp.x - h.x, pp.z - h.z) < h.r && this.hitCooldown <= 0) { this.hitCooldown = 2.5; this.host.sfx.zap(); this.grabFlash = 1; this.hurt('The current finds you through the water.'); }
    }
    // the Answered
    this.updateHollows(dt, t, playing);
    // radio static from the nearest hollow, sanity effects
    let near = 99;
    for (const h of this.hollows) if (h.state !== 'gone' && h.root.visible) near = Math.min(near, Math.hypot(h.root.position.x - pp.x, h.root.position.z - pp.z));
    const target = near < 18 ? clamp(1 - (near - 2) / 14, 0, 1) : 0;
    this.staticLevel = damp(this.staticLevel, target, 4, dt);
    this.host.sfx.setStatic(this.staticLevel * (this.state === 'call' ? 0 : 1));
    this.host.sfx.heartRate = this.sanity <= 1 ? 96 : (near < 6 ? 78 : 0);
    this.grabFlash = damp(this.grabFlash, 0, 6, dt);
    // item glow pulse
    if (this.itemGlows) { const u = this.itemGlows.material.uniforms.uInt.value; this.items.forEach((it, i) => { const pulse = it.kind !== 'battery' ? 1.1 + 0.7 * Math.max(0, Math.sin(t * 2.6 + i)) : 0.6 + 0.4 * Math.sin(t * 2.2 + i); u[i] = it.taken || it.hidden ? 0 : pulse; }); }
    // HUD
    $('batteryFill').style.width = `${this.batteryLevel.toFixed(0)}%`;
    $('battery').classList.toggle('low', this.batteryLevel < 25);
    for (let i = 0; i < 3; i++) $('sanity').children[i].classList.toggle('off', i >= this.sanity);
    const bars = $('static').children; for (let i = 0; i < bars.length; i++) bars[i].classList.toggle('on', this.staticLevel > (i + 1) / (bars.length + 1));
  }

  use(it) {
    if (it.taken) return;
    if (!it.isInteract) {
      it.taken = true; it.mesh.visible = false;
      if (it.kind !== 'page' && it.kind !== 'battery') this.host.sfx.pickup();
    }
    if (it.onUse) it.onUse(this);
  }

  hurt(msg) {
    this.sanity -= 1;
    this.host.sfx.stinger();
    if (this.sanity <= 0) { this.die(msg); return; }
    this.toast(msg, 3.5);
  }
  die(msg) {
    this.state = 'dead';
    this.ring(false);
    $('deathText').textContent = msg || 'The water remembers you.';
    $('death').classList.add('show');
    this.host.sfx.setStatic(1);
    setTimeout(() => { $('death').classList.remove('show'); this.host.sfx.setStatic(0); this.restartChapter(); }, 3600);
  }

  // ------------------------------------------------------------ enemies
  updateHollows(dt, t, playing) {
    const pp = this.host.player.root.position;
    const player = this.host.player;
    // spawn
    if (playing && this.hollowMaxN > 0) {
      const alive = this.hollows.filter((h) => h.state !== 'gone').length;
      this.hollowT -= dt;
      if (this.hollowT <= 0 && alive < this.hollowMaxN) {
        this.hollowT = this.hollowIntervalN * rand(0.7, 1.3);
        let h = this.hollows.find((x) => x.state === 'gone');
        if (!h) { h = new Hollow(); this.hollows.push(h); this.host.scene.add(h.root); }
        const pts = this.spawnPoints.filter((p) => Math.hypot(p[0] - pp.x, p[1] - pp.z) > 12);
        const p = pts.length ? pts[Math.floor(Math.random() * pts.length)] : this.spawnPoints[0];
        h.spawn(p[0], p[1], pp);
        this.host.sfx.groan(0.6);
      }
    }
    // flashlight cone test: core (freezes and burns) vs edge (only slows)
    const fp = new THREE.Vector3(), fd = new THREE.Vector3();
    player.flashGroup.getWorldPosition(fp); player.flashGroup.getWorldDirection(fd);
    const flashOn = player.flashOn && player.flashLevel > 0.45;
    const safe = this.dyn ? this.dyn.safe.filter((s) => !s.lamp || s.lamp.level > 0.5) : [];
    const bodyYaw = player.root.rotation.y;
    let aim = null, aimD = 1e9, maxHeat = 0;
    for (const h of this.hollows) {
      if (h.state === 'gone') continue;
      const hp = h.root.position;
      const dx = hp.x - fp.x, dy = 1.0 - fp.y, dz = hp.z - fp.z;
      const dist = Math.hypot(dx, dy, dz);
      const cosA = (dx * fd.x + dy * fd.y + dz * fd.z) / Math.max(dist, 0.01);
      const lit = !flashOn || dist > 14 ? 0 : cosA > 0.94 ? 2 : cosA > 0.87 ? 1 : 0;
      // is the player turned toward it (within ~70 degrees of the body's facing)?
      const toH = Math.atan2(hp.x - pp.x, hp.z - pp.z);
      let rel = toH - bodyYaw; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      const facing = Math.abs(rel) < 1.2;
      const ev = h.update(playing ? dt : 0, t, pp, lit, safe, player.flashOn, facing);
      if (ev === 'grab') { this.grabFlash = 1; h.state = 'burn'; h.burnT = 0; this.batteryLevel = Math.max(0, this.batteryLevel - 15); this.hurt('Cold hands. A voice you almost know says your name.'); }
      if (ev === 'burn') { this.host.sfx.burn(); this.hollowT = Math.min(this.hollowT, this.hollowIntervalN * 0.45); }
      if (ev === 'lunge') { this.host.sfx.shriek(); this.staticLevel = Math.max(this.staticLevel, 0.9); }
      if (h.state === 'stalk' && Math.random() < dt * 0.08 && dist < 14) this.host.sfx.groan(clamp(1 - dist / 14, 0.2, 1));
      if (h.state === 'frozen' || h.state === 'creep') maxHeat = Math.max(maxHeat, h.heat / BURN_TIME);
      // aim assist candidate: roughly in front of her and not too far
      if (player.flashOn && dist < 13 && Math.abs(rel) < 1.15 && dist < aimD) { aimD = dist; aim = h; }
    }
    player.aimTarget = aim ? aim.root.position : null;
    this.host.sfx.setHeat(maxHeat);
  }
}
