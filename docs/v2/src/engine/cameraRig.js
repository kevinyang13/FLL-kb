/* The camera follows the controller. Nothing else is allowed to move it, so
   there is one place to look when the view does something strange. */
import * as THREE from 'three';

const FOV_WALK = 68, FOV_MACRO = 34;

export class CameraRig {
  constructor(camera){ this.camera = camera; this.bob = 0; this.fov = FOV_WALK; }

  update(player, dt){
    // Crouching is also the macro lens. An aphid is two millimetres: at a
    // walking field of view it is a speck, and a child will not find it by
    // squinting. Holding C drops you to the leaf and narrows the lens, which
    // is what looking closely actually feels like.
    const wantFov = player.crouching ? FOV_MACRO : FOV_WALK;
    if (Math.abs(this.fov - wantFov) > 0.05){
      this.fov += (wantFov - this.fov) * Math.min(1, 7 * dt);
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
    const eye = player.eyePosition();
    const moving = Math.hypot(player.velocity.x, player.velocity.z);
    this.bob += dt * moving * 2.2;
    eye.y += Math.sin(this.bob * 2) * 0.012 * Math.min(1, moving / 3);
    this.camera.position.copy(eye);
    const dir = new THREE.Vector3(
      -Math.sin(player.yaw) * Math.cos(player.pitch),
      Math.sin(player.pitch),
      -Math.cos(player.yaw) * Math.cos(player.pitch)
    );
    this.camera.lookAt(eye.clone().add(dir));
  }
}
