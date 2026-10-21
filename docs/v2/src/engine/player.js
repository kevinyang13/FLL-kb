/* On-foot movement, run on the fixed 20 Hz step so the same key held for the
   same time always moves you the same distance, whatever the frame rate. The
   controller owns position and facing; the camera only reads them. */
import * as THREE from 'three';
import { groundHeight, waterDepth, waterLevel, WALK as BOUNDS, STEEPEST, DOME } from '../worldgen/layout.js';

const WALK = 2.9, RUN = WALK * 3, CROUCH = 1.3;   // running is exactly three times walking
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

    /* The blockers in an 8 m grid. There were a few thousand trunks when
       they were all in the garden; with the forest, the rainforest and the
       mountain rock solid too there are twenty thousand, and testing every
       one twenty times a second is waste when only a handful are within
       reach. A blocker goes in every cell its circle touches, so a 15 m
       crag is found from any side of it. */
    this.cells = new Map();
    for (const c of layout.blockers || []){
      const e = c.r + 0.5;     // the player's own margin, and a little over
      for (let i = Math.floor((c.x - e) / 8); i <= Math.floor((c.x + e) / 8); i++){
        for (let j = Math.floor((c.z - e) / 8); j <= Math.floor((c.z + e) / 8); j++){
          const k = i + ',' + j;
          if (!this.cells.has(k)) this.cells.set(k, []);
          this.cells.get(k).push(c);
        }
      }
    }
    // the dome's face looks back at the garden; its footprint is worked out
    // in the dome's own frame: `a` along the face's outward normal, `b` across
    const len = Math.hypot(DOME.x, DOME.z);
    this.domeAxis = { x: -DOME.x / len, z: -DOME.z / len };
  }

  /** Put the player somewhere saved, if it is still somewhere they could
      stand. A pose is only ever a convenience: anything that does not check
      out falls back to the spawn rather than dropping a child into a lake
      that was not there when they closed the tab. */
  restore(pose){
    if (!pose) return false;
    if (!Number.isFinite(pose.x) || !Number.isFinite(pose.z)) return false;
    if (Math.abs(pose.x) > BOUNDS.half || pose.z < -BOUNDS.half || pose.z > BOUNDS.south) return false;

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

    const landed = this.climb(this.velocity.x * dt, this.velocity.z * dt);
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

  /** Take a step, unless it climbs steeper than a walker can. A step that
      is too steep is tried along each axis on its own, so walking at a
      cliff slides you along its foot rather than stopping you dead — which
      is what lets you find the way round. Going down is never refused, and
      nor is anything in the water: the lake and river beds meet their
      banks almost vertically, and a swimmer has to be able to climb out. */
  climb(dx, dz){
    const here = this.position;
    const wet = waterDepth(this.layout.seed, here.x, here.z) > 0;
    const ok = p => {
      const run = Math.hypot(p.x - here.x, p.z - here.z);
      return wet || run < 1e-6 || p.y - here.y <= run * STEEPEST;
    };
    for (const [sx, sz] of [[dx, dz], [dx, 0], [0, dz]]){
      if (sx === 0 && sz === 0) continue;
      const p = this.resolve(new THREE.Vector3(here.x + sx, 0, here.z + sz));
      if (ok(p)) return p;
    }
    this.velocity.set(0, 0, 0);
    return this.resolve(here.clone());
  }

  /** The boundary, the trunks, the rock and the dome. The margin is deliberately tight —
      you need to get your face close to a leaf for the insects on it to be
      worth looking at. */
  resolve(p){
    const m = 0.22;
    /* Fenced only on the south, where the land gives way to scenery hills
       that are shapes rather than ground. North, east and west run on out of
       the garden, through the forest and up into the mountains. */
    p.x = Math.max(-BOUNDS.half, Math.min(BOUNDS.half, p.x));
    p.z = Math.max(-BOUNDS.half, Math.min(BOUNDS.south - m, p.z));
    /* Three passes, because pushing clear of one trunk can push you into
       the next: in the rainforest, where trunks stand a metre apart, a
       single pass left the player shuddering between two of them. */
    for (let pass = 0; pass < 3; pass++){
      let moved = false;
      const near = this.cells.get(Math.floor(p.x / 8) + ',' + Math.floor(p.z / 8)) || [];
      for (const c of near){
        if (c.box){ if (this.offBox(p, c, m)) moved = true; continue; }
        const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), r = c.r + m;
        if (d < r && d > 1e-4){ p.x = c.x + (dx / d) * r; p.z = c.z + (dz / d) * r; moved = true; }
      }
      if (!moved) break;
    }
    this.offDome(p, m);
    p.y = groundHeight(this.layout.seed, p.x, p.z);
    return p;
  }

  /** A castle's walls and buildings are boxes, turned to any angle. A point
      inside one (with the margin) leaves by the nearest face. `rot` turns
      the box's own x towards world (cos rot, -sin rot), as three.js does. */
  offBox(p, c, m){
    const { hw, hd, rot } = c.box;
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const dx = p.x - c.x, dz = p.z - c.z;
    const lx = dx * cs - dz * sn, lz = dx * sn + dz * cs;
    const ex = hw + m - Math.abs(lx), ez = hd + m - Math.abs(lz);
    if (ex <= 0 || ez <= 0) return false;
    let nx = lx, nz = lz;
    if (ex < ez) nx = Math.sign(lx || 1) * (hw + m);
    else nz = Math.sign(lz || 1) * (hd + m);
    p.x = c.x + nx * cs + nz * sn;
    p.z = c.z - nx * sn + nz * cs;
    return true;
  }

  /** The dome is its own mesh, not part of the ground, so nothing else
      knows it is there. Its footprint is an ellipse with the face side cut
      off flat; a point inside is moved to the nearer of the curved edge or
      the foot of the face. Not climbable — the back is too steep to walk
      and the face is a wall. */
  offDome(p, m){
    const ax = this.domeAxis.x, az = this.domeAxis.z;
    const dx = p.x - DOME.x, dz = p.z - DOME.z;
    const R = DOME.r + m, B = DOME.r * 0.82 + m;
    let a = (dx * ax + dz * az) / R, b = (-dx * az + dz * ax) / B;
    const cut = (DOME.r * DOME.cut + m) / R;
    if (a * a + b * b >= 1 || a >= cut) return;
    const toRim = 1 - Math.hypot(a, b), toFace = cut - a;
    if (toFace * R < toRim * Math.min(R, B)) a = cut;
    else { const n = Math.hypot(a, b) || 1; a /= n; b /= n; }
    p.x = DOME.x + a * R * ax - b * B * az;
    p.z = DOME.z + a * R * az + b * B * ax;
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
