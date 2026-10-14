/* On-foot movement, run on the fixed 20 Hz step so the same key held for the
   same time always moves you the same distance, whatever the frame rate. The
   controller owns position and facing; the camera only reads them. */
import * as THREE from 'three';
import { YARD } from '../worldgen/layout.js';
import { groundHeight } from '../worldgen/layout.js';

const WALK = 2.9, RUN = 5.2, CROUCH = 1.3;
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
    this.position.copy(this.resolve(next));

    const targetEye = input.crouch ? EYE_CROUCH : EYE;
    this.eye += (targetEye - this.eye) * Math.min(1, 9 * dt);
  }

  /** Walls and raised beds, as axis-aligned boxes. No jumping: you walk round.
      The margin is deliberately tight — you need to get your face close to a
      leaf for the insects on it to be worth looking at. */
  resolve(p){
    const m = 0.22;
    p.x = Math.max(-YARD.w / 2 + m, Math.min(YARD.w / 2 - m, p.x));
    p.z = Math.max(-YARD.d / 2 + m, Math.min(YARD.d / 2 - m, p.z));
    for (const b of this.layout.beds){
      const hw = b.w / 2 + m, hd = b.d / 2 + m;
      const dx = p.x - b.x, dz = p.z - b.z;
      if (Math.abs(dx) < hw && Math.abs(dz) < hd){
        // push out along whichever axis is the shallower overlap
        if (hw - Math.abs(dx) < hd - Math.abs(dz)) p.x = b.x + Math.sign(dx || 1) * hw;
        else p.z = b.z + Math.sign(dz || 1) * hd;
      }
    }
    p.y = groundHeight(this.layout.seed, p.x, p.z);
    return p;
  }

  eyePosition(){
    return new THREE.Vector3(this.position.x, this.position.y + this.eye, this.position.z);
  }
}
