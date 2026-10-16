/* The camera follows the controller. Nothing else is allowed to move it, so
   there is one place to look when the view does something strange. */
import * as THREE from 'three';

const FOV_WALK = 68, FOV_MACRO = 34;

/* The hand lens. Crouching already narrows the view to 34°; these are the
   steps beyond that, for when you want to see an aphid's legs rather than
   just find it. Magnification is quoted against the walking view, so the
   numbers mean what a child expects them to mean. */
export const ZOOMS = [null, 20, 11, 6];
export const magnification = fov => FOV_WALK / fov;

export class CameraRig {
  constructor(camera){ this.camera = camera; this.bob = 0; this.fov = FOV_WALK; this.zoom = 0; }

  /** 0 = no lens; 1-3 step in. Clamps rather than wraps: stepping in at
      full magnification should do nothing, not throw you back to the
      walking view, which is a nasty surprise with your eye on an aphid. */
  cycleZoom(dir){
    const max = ZOOMS.length - 1;
    this.zoom = Math.max(0, Math.min(max, (this.zoom || 0) + (dir || 1)));
    return this.zoom;
  }
  get magnification(){ return FOV_WALK / this.fov; }

  update(player, dt){
    // Crouching is also the macro lens. An aphid is two millimetres: at a
    // walking field of view it is a speck, and a child will not find it by
    // squinting. Holding C drops you to the leaf and narrows the lens, which
    // is what looking closely actually feels like.
    const lens = ZOOMS[this.zoom || 0];
    const wantFov = lens ?? (player.crouching ? FOV_MACRO : FOV_WALK);
    if (Math.abs(this.fov - wantFov) > 0.05){
      this.fov += (wantFov - this.fov) * Math.min(1, 7 * dt);
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
    const eye = player.eyePosition();
    const moving = Math.hypot(player.velocity.x, player.velocity.z);
    this.bob += dt * moving * 2.2;
    const steady = this.zoom ? 0.15 : 1;        // a lens magnifies the wobble too
    eye.y += Math.sin(this.bob * 2) * 0.012 * Math.min(1, moving / 3) * steady;
    this.camera.position.copy(eye);
    const dir = new THREE.Vector3(
      -Math.sin(player.yaw) * Math.cos(player.pitch),
      Math.sin(player.pitch),
      -Math.cos(player.yaw) * Math.cos(player.pitch)
    );
    this.camera.lookAt(eye.clone().add(dir));
  }
}
