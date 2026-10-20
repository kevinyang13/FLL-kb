/* The scattered insects, in the scene.

   Six hundred sightings, each a small clump of models. Building all of them
   up front is about twelve thousand Object3Ds for the renderer to walk every
   frame, to draw a few dozen of them — so a sighting is only MATERIALISED
   when the player comes within range, and taken down again when they leave.
   The interactable is registered from the start: targeting is a distance and
   an angle against a point, and you have to be within 1.4 m to look at one
   anyway, so the models are always there by the time they can be used.

   The glints that mark them are ONE `Points` object, not six hundred
   sprites, which would be six hundred draw calls. They are a single neutral
   colour on purpose: a marker that showed helpful in green and pest in red
   would answer the question the game is asking. */
import * as THREE from 'three';
import { MODELS } from '../entities/models.js';
import { buildSightings } from '../worldgen/sightings.js';
import { clearGroup } from '../rendering/dispose.js';

const BUILD_IN = 34;         // metres: materialise inside this
const DROP_OUT = 46;         // and take down again beyond this

function glintTexture(){
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,245,0.95)');
  g.addColorStop(0.4, 'rgba(255,246,206,0.45)');
  g.addColorStop(1, 'rgba(255,240,190,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

export function buildBugs(scene, anchors, interactables, seed){
  const specs = buildSightings(seed);
  const live = [];
  const verts = [];

  for (const s of specs){
    const list = anchors[s.kind];
    if (!list || !list.length) continue;
    const at = list[Math.floor(s.u * list.length) % list.length];
    const p = new THREE.Vector3(at.x + s.jitter[0], at.y + s.jitter[1], at.z + s.jitter[2]);
    const it = { id: s.id, object: null, position: p.clone(), radius: 1.4 };
    live.push({ spec: s, p, group: null, it });
    verts.push(p.x, p.y + 0.03, p.z);
    interactables.push(it);
  }

  const pts = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)),
    new THREE.PointsMaterial({
      map: glintTexture(), color: 0xFFF3C4, size: 0.2, sizeAttenuation: true,
      transparent: true, depthWrite: false, opacity: 0.55,
    })
  );
  scene.add(pts);

  /** Materialise what is near, take down what is not, and crawl what is up. */
  function update(playerPos, t){
    pts.material.opacity = 0.42 + Math.sin(t * 1.9) * 0.13;
    for (const b of live){
      const d = Math.hypot(b.p.x - playerPos.x, b.p.z - playerPos.z);
      if (!b.group && d < BUILD_IN){
        const g = new THREE.Group();
        g.position.copy(b.p);
        for (let i = 0; i < b.spec.count; i++){
          const o = MODELS[b.spec.model]();
          const sp = b.spec.spread;
          o.position.set((Math.sin(i * 12.9898) * 0.5) * sp * 2,
                         (Math.sin(i * 4.1414) * 0.5) * sp * 0.3,
                         (Math.cos(i * 78.233) * 0.5) * sp * 2);
          o.rotation.y = i * 1.7;
          o.userData.phase = i * 0.9;
          o.userData.home = o.position.clone();
          g.add(o);
        }
        scene.add(g);
        b.group = g;
        b.it.object = g;        // the ray needs something to point at
      } else if (b.group && d > DROP_OUT){
        clearGroup(b.group);
        scene.remove(b.group);
        b.group = null;
        b.it.object = null;
      }
      if (!b.group) continue;
      for (const o of b.group.children){
        const h = o.userData.home;
        if (!h) continue;
        const ph = o.userData.phase || 0;
        o.position.x = h.x + Math.sin(t * 0.7 + ph) * 0.004;
        o.position.z = h.z + Math.cos(t * 0.55 + ph) * 0.004;
        if (o.userData.wings){
          const f = Math.sin(t * 38 + ph) * 0.3;
          o.userData.wings.children.forEach(w => { w.rotation.z = w.userData.side * (0.25 + f); });
        }
      }
    }
  }

  /** Where the nearest sighting of a card the notebook still lacks is. */
  function nearestOf(playerPos, wanted){
    let best = null, bestD = Infinity;
    for (const b of live){
      if (!wanted(b.spec.key)) continue;
      const d = Math.hypot(b.p.x - playerPos.x, b.p.z - playerPos.z);
      if (d < bestD){ bestD = d; best = b.p; }
    }
    return best ? { position: best, distance: bestD } : null;
  }

  const keyOf = id => { const b = live.find(x => x.spec.id === id); return b ? b.spec.key : null; };
  /** Flat positions for the map: fixed for the life of the garden. */
  const list = () => live.map(b => ({ x: b.p.x, z: b.p.z, key: b.spec.key }));

  return { update, nearestOf, keyOf, list, count: live.length, points: pts };
}
