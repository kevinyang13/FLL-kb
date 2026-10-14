/* What the crosshair is pointing at. Distance-gated so you have to walk up
   to something — the whole point of a macro world is that you cannot see an
   egg from across the lawn. */
import * as THREE from 'three';

export class Interaction {
  constructor(interactables){
    this.items = interactables;
    this.ray = new THREE.Raycaster();
    this.ray.far = 4.0;
    this.current = null;
  }

  update(camera, playerPos){
    this.ray.setFromCamera(new THREE.Vector2(0, 0), camera);
    let best = null, bestDist = Infinity;
    for (const it of this.items){
      const d = playerPos.distanceTo(it.position);
      if (d > it.radius) continue;
      const hit = this.ray.intersectObject(it.object, false);
      const score = hit.length ? hit[0].distance : d + 0.6;   // looking at it wins over merely standing near
      if (score < bestDist){ bestDist = score; best = it; }
    }
    this.current = best;
    return best;
  }
}
