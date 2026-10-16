/* Builds the findable scenes into the world and keeps the handful that can
   change. Each part of a scene is its own interactable, so looking at the
   larva on the aphid leaf is a different thing from looking at the aphids
   beside it — which is the entire point of that scene. */
import * as THREE from 'three';
import { MODELS } from '../entities/models.js';
import { mulberry32 } from '../worldgen/noise.js';
import { clearGroup } from '../rendering/dispose.js';

export function buildScenes(scene, scenes, interactables){
  const parts = new Map();          // notebook key -> { group, scene, part }

  scenes.forEach((sc, si) => {
    const rnd = mulberry32(1000 + si);
    for (const part of sc.parts){
      const group = new THREE.Group();
      const off = part.offset || [0, 0, 0];
      group.position.set(sc.at.x + off[0], sc.at.y + off[1], sc.at.z + off[2]);
      const spread = part.spread || 0;
      for (let i = 0; i < (part.count || 1); i++){
        const o = MODELS[part.model]();
        o.position.set((rnd() - 0.5) * spread * 2, (rnd() - 0.5) * spread * 0.4, (rnd() - 0.5) * spread * 2);
        o.rotation.y = rnd() * Math.PI * 2;
        o.userData.phase = rnd() * Math.PI * 2;
        o.userData.home = o.position.clone();
        group.add(o);
      }
      scene.add(group);
      parts.set(part.key, { group, scene: sc, part });
      interactables.push({
        id: 'find:' + part.key,
        object: group,          // the whole clump, so the ray can hit any member
        position: group.position.clone(),
        radius: 1.8,
      });
    }
  });

  return parts;
}

/** Replace what is in a scene slot — used when a stage is watched through. */
export function morph(parts, key, modelName, count = 1){
  const slot = parts.get(key);
  if (!slot) return;
  clearGroup(slot.group);
  for (let i = 0; i < count; i++){
    const o = MODELS[modelName]();
    o.position.set((i - (count - 1) / 2) * 0.03, 0, 0);
    o.userData.home = o.position.clone();
    o.userData.phase = i;
    slot.group.add(o);
  }
}

/** A small, constant crawl so nothing in the garden is a still photograph. */
export function animateScenes(parts, t){
  for (const { group } of parts.values()){
    for (const o of group.children){
      const h = o.userData.home;
      if (!h) continue;
      const p = o.userData.phase || 0;
      o.position.x = h.x + Math.sin(t * 0.7 + p) * 0.004;
      o.position.z = h.z + Math.cos(t * 0.55 + p) * 0.004;
      if (o.userData.wings){
        const f = Math.sin(t * 38 + p) * 0.3;
        o.userData.wings.children.forEach(w => { w.rotation.z = w.userData.side * (0.25 + f); });
      }
    }
  }
}
