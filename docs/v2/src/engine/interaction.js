/* What the crosshair is pointing at.

   An exact ray is the wrong tool here. These targets are insects: a few
   millimetres of real size, a centimetre or two as drawn, and a zero-width
   ray against one of those asks for sub-degree aim that nobody has on a
   trackpad, let alone a thumb. So the test is angular instead — of the
   things close enough to reach, take whichever sits nearest the centre of
   the view, as long as it is inside a forgiving cone.

   Distance still gates it: you have to walk up to something. That is the
   point of a macro world, and it is what makes two scenes a foot apart
   resolve to the one you are actually facing. */
import * as THREE from 'three';

const CONE = THREE.MathUtils.degToRad(14);

export class Interaction {
  constructor(interactables){
    this.items = interactables;
    this.current = null;
    this._fwd = new THREE.Vector3();
    this._to = new THREE.Vector3();
  }

  update(camera, playerPos){
    camera.getWorldDirection(this._fwd);
    let best = null, bestAngle = Infinity;
    for (const it of this.items){
      const d = playerPos.distanceTo(it.position);
      if (d > it.radius) continue;
      this._to.copy(it.position).sub(camera.position).normalize();
      const angle = Math.acos(THREE.MathUtils.clamp(this._to.dot(this._fwd), -1, 1));
      if (angle > CONE) continue;
      // nearer the crosshair wins; a tie goes to whichever is closer to hand
      const score = angle + d * 0.02;
      if (score < bestAngle){ bestAngle = score; best = it; }
    }
    this.current = best;
    return best;
  }
}
