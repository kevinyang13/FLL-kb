/* On-foot movement, run on the fixed 20 Hz step so the same key held for the
   same time always moves you the same distance, whatever the frame rate. The
   controller owns position and facing; the camera only reads them. */
import * as THREE from 'three';
import { YARD } from '../worldgen/layout.js';
import { groundHeight, waterDepth, waterLevel, FALL, CLIFF } from '../worldgen/layout.js';

const WALK = 2.9, RUN = WALK * 2, CROUCH = 1.3;   // running is exactly double
/* In the water. Past chest depth your feet stop mattering and you float:
   eye level leaves the ground and sits just above the surface, wherever the
   surface happens to be. Swimming is slower than walking, and ducking under
   is the crouch key, because that is already "get lower". */
const SWIM = 1.75, CHEST = 1.25, FLOAT = 0.14, DIVE = 0.55;
const EYE = 1.62, EYE_CROUCH = 0.82;
const ACCEL = 14, FRICTION = 11;

export class PlayerController {
  constructor(layout){
    this.layout = layout;
    this.position = new THREE.Vector3(layout.spawn.x, 0, layout.spawn.z);
    this.velocity = new THREE.Vector3();
    this.yaw = layout.spawn.yaw;
    this.pitch = 0;
    this.eye = EYE;
    this.crouching = false;
    this.swimming = false;
    this.diving = false;
    this.surface = -Infinity;
  }

  /** Put the player somewhere saved, if it is still somewhere they could
      stand. A pose is only ever a convenience: anything that does not check
      out falls back to the spawn rather than dropping a child into a lake
      that was not there when they closed the tab. */
  restore(pose){
    if (!pose) return false;
    const half = YARD.w / 2 - 1;
    if (Math.abs(pose.x) > half || Math.abs(pose.z) > YARD.d / 2 + 120) return false;

    this.position.set(pose.x, groundHeight(this.layout.seed, pose.x, pose.z), pose.z);
    /* Through the same clamp a normal step goes through, so a saved spot
       outside the fence or inside a trunk comes back as the nearest legal
       one rather than as itself. */
    this.resolve(this.position);
    this.yaw = pose.yaw;
    this.pitch = Math.max(-1.45, Math.min(1.45, pose.pitch || 0));
    this.velocity.set(0, 0, 0);
    return true;
  }

  /** What to write down, so a refresh puts them back where they were. */
  pose(){
    return { x: this.position.x, z: this.position.z, yaw: this.yaw, pitch: this.pitch };
  }

  look(dx, dy){
    this.yaw -= dx;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - dy));
  }

  simStep(input, dt){
    this.look(input.yaw, input.pitch);
    input.yaw = input.pitch = 0;

    this.crouching = input.crouch && !this.swimming;
    this.diving = input.crouch && this.swimming;
    const speed = this.swimming ? SWIM
                : input.crouch ? CROUCH : input.run ? RUN : WALK;
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    // forward is -Z in three.js, so forward input pushes along (-sin, -cos)
    const wish = new THREE.Vector3(
      -sin * input.forward + cos * input.strafe,
      0,
      -cos * input.forward - sin * input.strafe
    );
    if (wish.lengthSq() > 1) wish.normalize();
    wish.multiplyScalar(speed);

    this.velocity.x += (wish.x - this.velocity.x) * Math.min(1, (wish.lengthSq() ? ACCEL : FRICTION) * dt);
    this.velocity.z += (wish.z - this.velocity.z) * Math.min(1, (wish.lengthSq() ? ACCEL : FRICTION) * dt);

    const next = this.position.clone().addScaledVector(this.velocity, dt);
    const landed = this.resolve(next);
    /* Nothing refuses a step any more. Past chest depth the player floats
       instead of walking, which is what the lake is for; the old rule kept
       them on the bank. `position` stays on the bed either way — only the
       eyes move — so collision, the ground under them and everything that
       reads a position carry on working unchanged. */
    this.position.copy(landed);
    this.surface = waterLevel(this.layout.seed, landed.x, landed.z);
    const depth = waterDepth(this.layout.seed, landed.x, landed.z);
    this.swimming = depth > CHEST;

    const targetEye = input.crouch ? EYE_CROUCH : EYE;
    this.eye += (targetEye - this.eye) * Math.min(1, 9 * dt);
  }

  /** The boundary fence and the trunks. The margin is deliberately tight —
      you need to get your face close to a leaf for the insects on it to be
      worth looking at. */
  resolve(p){
    const m = 0.22;
    p.x = Math.max(-YARD.w / 2 + m, Math.min(YARD.w / 2 - m, p.x));
    /* The garden ends at 320 m north, but the waterfall is a hundred metres
       past that, and a waterfall you can only look at from the far side of a
       fence is scenery rather than a place. The river valley stays open: a
       corridor either side of the fall, as far as the plunge pool. */
    const inValley = Math.abs(p.x - FALL.x) < 115;
    const north = inValley ? CLIFF.z + 20 : -YARD.d / 2 + m;
    p.z = Math.max(north, Math.min(YARD.d / 2 - m, p.z));
    for (const c of this.layout.blockers || []){
      // 2,600 trunks in the garden, tested twenty times a second: reject the
      // far ones on a box before paying for a square root.
      if (Math.abs(p.x - c.x) > 2 || Math.abs(p.z - c.z) > 2) continue;
      const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), r = c.r + m;
      if (d < r && d > 1e-4){ p.x = c.x + (dx / d) * r; p.z = c.z + (dz / d) * r; }
    }
    p.y = groundHeight(this.layout.seed, p.x, p.z);
    return p;
  }

  eyePosition(){
    /* Swimming, the eyes ride the surface rather than the ground beneath it:
       a lake bed nine metres down would otherwise put the camera on the
       floor looking up at the underside of the water. Ducking under drops
       them below it, which is the only way to see the lake from inside. */
    const y = this.swimming
      ? this.surface + (this.diving ? -DIVE : FLOAT)
      : this.position.y + this.eye;
    return new THREE.Vector3(this.position.x, y, this.position.z);
  }

  /** Is the camera below the water's surface? The view changes if so. */
  submerged(){
    return this.surface > -Infinity && this.eyePosition().y < this.surface;
  }
}
