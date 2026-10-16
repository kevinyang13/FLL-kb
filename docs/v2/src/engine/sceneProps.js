/* Builds the findable scenes into the world and keeps the handful that can
   change. Each part of a scene is its own interactable, so looking at the
   larva on the aphid leaf is a different thing from looking at the aphids
   beside it — which is the entire point of that scene. */
import * as THREE from 'three';
import { MODELS } from '../entities/models.js';
import { mulberry32 } from '../worldgen/noise.js';
import { clearGroup } from '../rendering/dispose.js';

/* Resolving an anchor is not just "pick one": nine scenes that all land in
   the same corner of a 64-metre garden is the same as hiding them. Each list
   is sorted along the garden's length and the scenes are spread across it,
   alternating sides, so walking the path takes you past all of them. */
function spread(list){
  const sorted = [...list].sort((a, b) => a.z - b.z);
  const left = sorted.filter(p => p.x < 0), right = sorted.filter(p => p.x >= 0);
  const out = [];
  const n = Math.max(left.length, right.length);
  for (let i = 0; i < n; i++){            // alternate sides down the path
    if (i < left.length) out.push(left[i]);
    if (i < right.length) out.push(right[i]);
  }
  return out.length ? out : sorted;
}

function resolve(anchors, at, cache){
  if (!cache.has(at.kind)) cache.set(at.kind, spread(anchors[at.kind] || []));
  const list = cache.get(at.kind);
  if (!list.length) return { x: 0, y: 1, z: 0 };
  // n is a fraction of the way along the list, so scenes never bunch up
  const i = Math.floor((at.n / 32) * list.length) % list.length;
  return list[i];
}

/** A soft round glow, drawn once. */
function moteTexture(){
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,235,150,0.85)');
  grd.addColorStop(1, 'rgba(255,220,110,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function buildScenes(scene, scenes, interactables, anchors){
  const parts = new Map();          // notebook key -> { group, scene, part }
  const markers = new Map();        // scene id -> the "something here" mote
  const cache = new Map();

  scenes.forEach((sc, si) => {
    const rnd = mulberry32(1000 + si);
    for (const part of sc.parts){
      const group = new THREE.Group();
      const at = resolve(anchors, sc.at, cache);
      const off = part.offset || [0, 0, 0];
      group.position.set(at.x + off[0], at.y + off[1], at.z + off[2]);
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
        radius: 2.6,
      });
    }
  });

  /* A mote over each scene. An insect is a centimetre across and the garden
     is sixty metres wide; without something visible from across the lawn the
     player is searching a hedge by hand.

     It is a sprite with size attenuation OFF, so it stays the same size on
     screen however far away it is — a mote that shrinks with distance is
     invisible exactly when it is needed. It fades out once every card in
     that scene is in the notebook. */
  const glow = moteTexture();
  scenes.forEach(sc => {
    const at = resolve(anchors, sc.at, cache);
    const mote = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glow, color: 0xFFE98A, transparent: true, opacity: 0.9,
      depthWrite: false, depthTest: false, sizeAttenuation: false,
    }));
    mote.scale.setScalar(0.055);
    mote.position.set(at.x, at.y + 0.28, at.z);
    mote.renderOrder = 3;
    scene.add(mote);
    markers.set(sc.id, { mote, base: mote.position.y, keys: sc.parts.map(p => p.key) });
  });

  return { parts, markers };
}

/** Bob the motes, and hide the ones whose scene is fully in the notebook. */
export function updateMarkers(markers, isFound, t){
  for (const m of markers.values()){
    const done = m.keys.every(isFound);
    m.mote.visible = !done;
    if (done) continue;
    m.mote.position.y = m.base + Math.sin(t * 1.6 + m.base) * 0.05;
    m.mote.material.opacity = 0.6 + Math.sin(t * 2.2 + m.base) * 0.3;
    m.mote.scale.setScalar(0.05 + Math.sin(t * 2.2 + m.base) * 0.008);
  }
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
