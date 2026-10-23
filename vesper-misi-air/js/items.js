// Pick-up props: torn pages, batteries, keys, the valve wheel.
import * as THREE from 'three';
import { Vox, voxGroup } from './voxel.js';
import { C } from './world.js';
import { rand } from './util.js';

export function makeItem(kind, materials) {
  let g;
  if (kind === 'page') {
    const v = new Vox(6, 1, 8);
    v.box(0, 0, 0, 5, 0, 7, C.paper);
    for (let z = 1; z < 7; z += 2) v.box(1, 0, z, 3 + (z % 3), 0, z, C.paperInk);
    g = voxGroup(v, 0.05, materials, { offset: [-0.15, 0.02, -0.2], castShadow: false });
    g.rotation.y = rand(0, 6.28);
  } else if (kind === 'battery') {
    const v = new Vox(4, 4, 8);
    v.box(0, 0, 0, 3, 3, 7, C.battery);
    v.box(0, 0, 2, 3, 3, 3, C.batteryBand);
    v.box(1, 1, 7, 2, 2, 7, C.batteryCap);
    g = voxGroup(v, 0.06, materials, { offset: [-0.12, 0.02, -0.24], castShadow: false });
    g.rotation.y = rand(0, 6.28);
  } else if (kind === 'key') {
    const v = new Vox(7, 1, 3);
    v.box(0, 0, 0, 2, 0, 2, C.brass); v.set(1, 0, 1, 0);
    v.box(3, 0, 1, 6, 0, 1, C.brass); v.set(5, 0, 0, C.brass); v.set(6, 0, 0, C.brass);
    g = voxGroup(v, 0.05, materials, { offset: [-0.17, 0.02, -0.07], castShadow: false });
    g.rotation.y = rand(0, 6.28);
  } else if (kind === 'valve') {
    const v = new Vox(9, 1, 9);
    for (let x = 0; x < 9; x++) for (let z = 0; z < 9; z++) {
      const d2 = (x - 4) ** 2 + (z - 4) ** 2;
      if ((d2 <= 20 && d2 >= 11) || x === 4 || z === 4 || d2 <= 1) v.set(x, 0, z, C.valve);
    }
    g = voxGroup(v, 0.07, materials, { offset: [-0.31, 0.03, -0.31], castShadow: false });
  } else {
    const v = new Vox(3, 3, 3); v.box(0, 0, 0, 2, 2, 2, C.brass);
    g = voxGroup(v, 0.08, materials, { offset: [-0.12, 0, -0.12] });
  }
  g.userData.kind = kind;
  return g;
}

export const ITEM_LABEL = { page: 'torn page', battery: 'battery', key: 'brass key', valve: 'valve wheel' };
export const ITEM_GLOW = { page: 0xffc890, battery: 0xffd040, key: 0xffd080, valve: 0xff7a5a };
