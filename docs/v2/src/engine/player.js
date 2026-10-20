/* On-foot movement, run on the fixed 20 Hz step so the same key held for the
   same time always moves you the same distance, whatever the frame rate. The
   controller owns position and facing; the camera only reads them. */
import * as THREE from 'three';
import { YARD } from '../worldgen/layout.js';
import { groundHeight, waterDepth, FALL, CLIFF } from '../worldgen/layout.js';

const WALK = 2.9, RUN = 5.2, CROUCH = 1.3;
const WADE = 0.55;             // metres of water you may stand in
/* A river bed is flat across its width, so a step sideways is the same depth
   as the one before it — to within a rounding error of 4e-16, which is
   enough for a strict comparison to call it deeper and refuse the move. That
   left anyone standing in the river frozen there. A centimetre of slack is
   far below the depth a real step down the lake bed changes by. */
const SLACK = 0.01;
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
  }

  /** Put the player somewhere saved, if it is still somewhere they could
      stand. A pose is only ever a convenience: anything that does not check
      out falls back to the spawn rather than dropping a child into a lake
      that was not there when they closed the tab. */
  restore(pose){
    if (!pose) return false;
    const half = YARD.w / 2 - 1;
    if (Math.abs(pose.x) > half || Math.abs(pose.z) > YARD.d / 2 + 120) return false;
    if (waterDepth(this.layout.seed, pose.x, pose.z) > WADE) return false;
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

    this.crouching = input.crouch;
    const speed = input.crouch ? CROUCH : input.run ? RUN : WALK;
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
    /* You may wade to the knees but not walk into the lake. The rule is
       about DEPTH, not about being wet: refusing every wet step outright
       froze anyone who was already standing in the river, because every step
       out of it was a wet one too. A step is allowed if it is shallow
       enough, or if it does not take you any DEEPER than where you already
       are — not merely shallower, because a river bed is flat across its
       width and a strictly-shallower test leaves you stuck in the middle of
       it, every sideways step being exactly as deep as the one before. */
    const here = waterDepth(this.layout.seed, this.position.x, this.position.z);
    const there = waterDepth(this.layout.seed, landed.x, landed.z);
    if (there <= WADE || there <= here + SLACK){
      this.position.copy(landed);
    } else {
      this.velocity.set(0, 0, 0);
    }

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
    return new THREE.Vector3(this.position.x, this.position.y + this.eye, this.position.z);
  }
}
