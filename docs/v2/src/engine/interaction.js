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

/* The cone opens up as you get closer. At two metres you are choosing
   between neighbouring scenes and it should be tight; at arm's length there
   is only one thing in front of you and demanding precise aim is just
   cruelty — which is what the first version did, and why the garden felt
   empty even when you were standing in it. */
const CONE_FAR = THREE.MathUtils.degToRad(18);
const CONE_NEAR = THREE.MathUtils.degToRad(55);
const NEAR = 0.9;

export class Interaction {
  constructor(interactables){
    this.items = interactables;
    this.current = null;
    this._fwd = new THREE.Vector3();
    this._to = new THREE.Vector3();
  }

  /** @param done (id) => boolean — already in the notebook, so deprioritised */
  update(camera, playerPos, done){
    camera.getWorldDirection(this._fwd);
    let best = null, bestAngle = Infinity;
    for (const it of this.items){
      const d = playerPos.distanceTo(it.position);
      if (d > it.radius) continue;
      this._to.copy(it.position).sub(camera.position).normalize();
      const angle = Math.acos(THREE.MathUtils.clamp(this._to.dot(this._fwd), -1, 1));
      /* Through the lens the crosshair covers a far smaller slice of the
         world, so the cone narrows with it — otherwise a zoomed view would
         still pick things sitting well outside the frame. */
      const lens = Math.min(1, camera.fov / 68);
      const cone = (d <= NEAR ? CONE_NEAR
                 : THREE.MathUtils.lerp(CONE_NEAR, CONE_FAR, Math.min(1, (d - NEAR) / 1.2))) * lens;
      if (angle > cone) continue;
      /* Nearer the crosshair wins, a tie goes to whatever is closer to hand,
         and anything already in the notebook steps aside. Without that last
         term the twenty-six aphids on the colony leaf swallow every look and
         the mummy and the two larvae sitting among them can never be
         selected — the scene reads as "already found" forever. */
      const score = angle + d * 0.02 + (done && done(it.id) ? 0.9 : 0);
      if (score < bestAngle){ bestAngle = score; best = it; }
    }
    this.current = best;
    return best;
  }
}
