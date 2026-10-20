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

/* The aerial view. The camera leaves the player's head and climbs, looking
   back down and forward along the way they are facing, so what you get is
   the garden around you in three dimensions rather than a drawing of it.
   Two heights: one low enough to read the planting in the next room, one
   high enough to see the lake, the river and the mountains in one frame.
   `back` is how far behind the player the camera sits, which is what gives
   the view its tilt, and `ahead` is how far in front of them it looks. */
export const HEIGHTS = [
  null,
  { h: 34,  back: 30, ahead: 46,  fov: 70 },
  { h: 105, back: 86, ahead: 150, fov: 72 },
];

export class CameraRig {
  constructor(camera){
    this.camera = camera;
    this.bob = 0;
    this.fov = FOV_WALK;
    this.zoom = 0;
    this.aerial = 0;                 // 0 = on foot, else an index into HEIGHTS
    this.eyeNow = new THREE.Vector3();
    this.aimNow = new THREE.Vector3();
    this.placed = false;
  }

  /** Step the aerial view: off, low, high, off. */
  cycleAerial(dir){
    const n = HEIGHTS.length;
    this.aerial = dir === undefined ? (this.aerial + 1) % n
                : Math.max(0, Math.min(n - 1, this.aerial + dir));
    if (this.aerial) this.zoom = 0;  // the hand lens and the sky do not mix
    return this.aerial;
  }

  /** Metres above the ground, for the badge. */
  get altitude(){ return this.aerial ? HEIGHTS[this.aerial].h : 0; }

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
    const dir = new THREE.Vector3(
      -Math.sin(player.yaw) * Math.cos(player.pitch),
      Math.sin(player.pitch),
      -Math.cos(player.yaw) * Math.cos(player.pitch)
    );

    if (this.aerial){
      const a = HEIGHTS[this.aerial];
      /* Flat forward, not the look direction: pitching the head while a
         hundred metres up should not swing the camera through the ground. */
      const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
      const eye = new THREE.Vector3(
        player.position.x - fx * a.back,
        player.position.y + a.h,
        player.position.z - fz * a.back);
      const aim = new THREE.Vector3(
        player.position.x + fx * a.ahead,
        player.position.y,
        player.position.z + fz * a.ahead);
      /* Eased, so going up and coming back down is a move rather than a cut,
         and so walking around under the camera does not jitter it. */
      const k = this.placed ? Math.min(1, 3.4 * dt) : 1;
      this.eyeNow.lerp(eye, k);
      this.aimNow.lerp(aim, k);
      this.placed = true;
      if (Math.abs(this.fov - a.fov) > 0.05){
        this.fov += (a.fov - this.fov) * Math.min(1, 6 * dt);
        this.camera.fov = this.fov;
        this.camera.updateProjectionMatrix();
      }
      this.camera.position.copy(this.eyeNow);
      this.camera.lookAt(this.aimNow);
      return;
    }

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
    /* Coming back down starts from wherever the camera was, so the descent
       is eased the same way the climb was. */
    if (this.placed){
      this.eyeNow.lerp(eye, Math.min(1, 6 * dt));
      this.aimNow.lerp(eye.clone().add(dir), Math.min(1, 6 * dt));
      if (this.eyeNow.distanceTo(eye) < 0.25) this.placed = false;
      this.camera.position.copy(this.eyeNow);
      this.camera.lookAt(this.aimNow);
      return;
    }
    this.camera.position.copy(eye);
    this.camera.lookAt(eye.clone().add(dir));
  }
}
