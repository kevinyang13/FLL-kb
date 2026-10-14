/* A group of one species in the garden. The simulation owns the *counts*
   (core/garden.js); this owns the handful of bodies that stand for them and
   where they crawl. Rebuilt whenever a count changes, animated every frame. */
import * as THREE from 'three';
import { clearGroup } from '../rendering/dispose.js';
import { mulberry32 } from '../worldgen/noise.js';

export class Population {
  /** @param make () => THREE.Object3D   @param max how many bodies to ever show */
  constructor(scene, make, max, seed){
    this.group = new THREE.Group();
    this.make = make; this.max = max;
    this.rnd = mulberry32(seed);
    this.shown = -1;
    this.members = [];
    scene.add(this.group);
  }

  /** @param sites [{x,y,z}] surfaces they are allowed to sit on */
  sync(count, sites){
    const want = Math.min(count, this.max);
    if (want === this.shown || !sites.length) { this.shown = want; return; }
    this.shown = want;
    clearGroup(this.group);
    this.members = [];
    for (let i = 0; i < want; i++){
      const s = sites[Math.floor(this.rnd() * sites.length)];
      const o = this.make();
      const a = this.rnd() * Math.PI * 2, r = this.rnd() * (s.r || 0.14);
      o.position.set(s.x + Math.cos(a) * r, s.y, s.z + Math.sin(a) * r);
      o.rotation.y = this.rnd() * Math.PI * 2;
      o.userData.phase = this.rnd() * Math.PI * 2;
      o.userData.home = o.position.clone();
      this.group.add(o);
      this.members.push(o);
    }
  }

  /** A little crawl, so the garden is never a still photograph. */
  update(t){
    for (const o of this.members){
      const p = o.userData.phase;
      o.position.x = o.userData.home.x + Math.sin(t * 0.6 + p) * 0.012;
      o.position.z = o.userData.home.z + Math.cos(t * 0.47 + p) * 0.012;
      o.rotation.y += 0.004 * Math.sin(t * 0.3 + p);
      if (o.userData.wings){
        const f = Math.sin(t * 40 + p) * 0.35;
        o.userData.wings.children.forEach(w => { w.rotation.z = w.userData.side * (0.25 + f); });
      }
    }
  }
}
