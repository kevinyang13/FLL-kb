/* The griffin you can call, ride and fly.

   Five states:
     away      — not here; G calls it
     arriving  — swooping down out of the sky to stand beside you
     idle      — standing, wings folded; it follows if you walk off; R climbs on
     mounted   — you are flying it; R lands
     landing   — gliding down to set you on the ground
     leaving   — G sent it off; it climbs away and is gone

   Flying is where you look: W goes the way the camera faces, so pitching the
   view up climbs and down dives, which is what every child expects. Space
   climbs and C dives without changing where you look. Top speed is ten times
   walking. The speed builds and dies away over a second or so rather than
   snapping, which is most of what makes it feel like riding something heavy.

   Flight runs on the frame, not the fixed 20 Hz step the walk uses: at
   29 m/s a 20 Hz step is a jump of a metre and a half every step, and the
   view stutters. Nothing here needs to be reproducible step for step. */
import * as THREE from 'three';
import { buildGriffin, poseWings } from '../entities/griffin.js';
import { groundHeight, waterLevel, DOME, WALK as BOUNDS } from '../worldgen/layout.js';
import { HILL_CASTLE, onLakeCastle } from '../worldgen/castles.js';
import { WALK_SPEED } from './player.js';

const FLY = WALK_SPEED * 10;         // 29 m/s: ten times walking
/* The saddle above its feet, and your eyes above the saddle. Set high and
   well back: level with its head, the head filled the middle of the view. */
const SEAT = 2.3, EYE = 1.55;
const CLEAR = 2.4;                   // the lowest its feet go over the ground while flying
const CEILING = 420;
const SKY = BOUNDS.half + 20;        // how far out it may fly; the land is drawn a little further
const MOUNT_REACH = 9;               // how close you must be to climb on

const ease = t => 1 - (1 - t) * (1 - t);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

export class Griffin {
  constructor(scene, layout){
    this.seed = layout.seed;
    this.model = buildGriffin();
    this.model.group.visible = false;
    scene.add(this.model.group);
    this.state = 'away';
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.yaw = 0; this.bank = 0; this.tilt = 0;
    this.phase = 0; this.flap = 0; this.spread = 0;
    this.t = 0;
    this.from = new THREE.Vector3(); this.to = new THREE.Vector3();
    /* What the camera reads while you ride: where your eyes are, how far the
       view is rolled, and how fast you are going. */
    this.ride = { eye: new THREE.Vector3(), roll: 0, pitch: 0, speed: 0 };
    this.seatLocal = new THREE.Vector3(0, SEAT + EYE, 0.45);
    this.drift = 0;

    // the dome's base, worked out the way the dome itself is placed
    let low = groundHeight(this.seed, DOME.x, DOME.z);
    for (let k = 0; k < 32; k++){
      const a = (k / 32) * Math.PI * 2;
      low = Math.min(low, groundHeight(this.seed, DOME.x + Math.cos(a) * DOME.r, DOME.z + Math.sin(a) * DOME.r * 0.82));
    }
    this.domeBase = low - 10;
    const len = Math.hypot(DOME.x, DOME.z);
    this.domeAxis = { x: -DOME.x / len, z: -DOME.z / len };
  }

  get here(){ return this.state !== 'away'; }
  get riding(){ return this.state === 'mounted'; }
  get mounted(){ return this.state === 'mounted' || this.state === 'landing'; }

  /** The lowest it may fly here: the ground, the water, and the things that
      stand up out of the ground without being part of it — the dome and the
      two castles — so it goes over them rather than through. */
  floor(x, z){
    let y = Math.max(groundHeight(this.seed, x, z), waterLevel(this.seed, x, z));
    const ax = this.domeAxis.x, az = this.domeAxis.z;
    const dx = x - DOME.x, dz = z - DOME.z;
    const a = (dx * ax + dz * az) / DOME.r, b = (-dx * az + dz * ax) / (DOME.r * 0.82);
    const r2 = a * a + b * b;
    if (r2 < 1.1 && a < DOME.cut + 0.05) y = Math.max(y, this.domeBase + DOME.h * Math.pow(Math.max(0, 1 - r2), 0.4) + 6);
    if (onLakeCastle(x, z, 2)) y = Math.max(y, 36);
    if (Math.hypot(x - HILL_CASTLE.x, z - HILL_CASTLE.z) < HILL_CASTLE.wall + 6) y = Math.max(y, HILL_CASTLE.top + 34);
    return y;
  }

  /** Where it stands when it comes: a few metres to your right, on the
      ground (or on the water, if you are swimming). */
  standSpot(player){
    const x = player.position.x + Math.cos(player.yaw) * 4.5;
    const z = player.position.z - Math.sin(player.yaw) * 4.5;
    return new THREE.Vector3(x, Math.max(groundHeight(this.seed, x, z), waterLevel(this.seed, x, z)), z);
  }

  summon(player){
    if (this.state !== 'away' && this.state !== 'leaving') return false;
    this.to.copy(this.standSpot(player));
    // in from behind you and high up, so you see it come down
    this.from.set(this.to.x + Math.sin(player.yaw) * 60, this.to.y + 55, this.to.z + Math.cos(player.yaw) * 60);
    if (this.state === 'leaving') this.from.copy(this.pos);
    this.pos.copy(this.from);
    this.yaw = player.yaw;
    this.state = 'arriving'; this.t = 0;
    this.model.group.visible = true;
    this.model.group.scale.setScalar(1);
    return true;
  }

  dismiss(){
    if (this.state !== 'idle' && this.state !== 'arriving') return false;
    this.from.copy(this.pos);
    this.to.set(this.pos.x - Math.sin(this.yaw) * 90, this.pos.y + 80, this.pos.z - Math.cos(this.yaw) * 90);
    this.state = 'leaving'; this.t = 0;
    return true;
  }

  /** Climb on. Returns why not, if not. */
  mount(player){
    if (this.state !== 'idle') return this.state === 'away' ? 'away' : 'busy';
    if (Math.hypot(player.position.x - this.pos.x, player.position.z - this.pos.z) > MOUNT_REACH) return 'far';
    this.state = 'mounted';
    this.yaw = player.yaw;
    this.vel.set(0, 6, 0);           // a first wingbeat, off the ground
    player.velocity.set(0, 0, 0);
    player.ride = this.ride;
    player.swimming = false; player.surface = -Infinity; player.crouching = false;
    return null;
  }

  land(){
    if (this.state !== 'mounted') return false;
    this.state = 'landing';
    return true;
  }

  /** One frame of riding. */
  fly(input, dt, player){
    player.look(input.yaw, input.pitch);
    input.yaw = input.pitch = 0;
    const cp = Math.cos(player.pitch);
    const dir = new THREE.Vector3(-Math.sin(player.yaw) * cp, Math.sin(player.pitch), -Math.cos(player.yaw) * cp);
    const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
    const fwd = input.forward < 0 ? input.forward * 0.35 : input.forward;   // it can back up, slowly
    const up = (input.up ? 1 : 0) - (input.crouch ? 1 : 0);
    const want = dir.multiplyScalar(fwd * FLY)
      .addScaledVector(right, input.strafe * FLY * 0.45)
      .add(new THREE.Vector3(0, up * FLY * 0.45, 0));
    this.vel.lerp(want, 1 - Math.exp(-1.5 * dt));
    this.move(dt);

    // the body turns after you, and leans into the turn
    const turn = wrap(player.yaw - this.yaw);
    this.yaw += turn * (1 - Math.exp(-3 * dt));
    const wantBank = THREE.MathUtils.clamp(-turn * 1.3 - input.strafe * 0.22, -0.6, 0.6);
    this.bank += (wantBank - this.bank) * (1 - Math.exp(-3 * dt));
  }

  move(dt){
    this.pos.addScaledVector(this.vel, dt);
    this.pos.x = THREE.MathUtils.clamp(this.pos.x, -SKY, SKY);
    this.pos.z = THREE.MathUtils.clamp(this.pos.z, -SKY, SKY);
    const lo = this.floor(this.pos.x, this.pos.z) + CLEAR;
    if (this.pos.y < lo){ this.pos.y = lo; if (this.vel.y < 0) this.vel.y = 0; }
    if (this.pos.y > CEILING){ this.pos.y = CEILING; if (this.vel.y > 0) this.vel.y = 0; }
  }

  /** Everything else, every frame: the states that are not you flying, the
      wings, and keeping the rider in the saddle. */
  update(dt, player){
    const g = this.model.group;
    let wantFlap = 0, wantSpread = 0;

    switch (this.state){
      case 'away': return;

      case 'arriving': {
        this.t = Math.min(1, this.t + dt / 2.6);
        const e = ease(this.t);
        // a swoop: down and in, with the last few metres a flare to land
        this.pos.lerpVectors(this.from, this.to, e);
        this.pos.y += Math.sin(this.t * Math.PI) * 6;
        this.yaw += wrap(Math.atan2(this.from.x - this.to.x, this.from.z - this.to.z) - this.yaw) * Math.min(1, 4 * dt);
        wantFlap = this.t > 0.7 ? 1 : 0.45; wantSpread = 1;
        if (this.t >= 1) this.state = 'idle';
        break;
      }

      case 'idle': {
        // it follows: if you have walked off, it hops along after you
        const spot = this.standSpot(player);
        const dx = spot.x - this.pos.x, dz = spot.z - this.pos.z, d = Math.hypot(dx, dz);
        if (d > 14){
          const step = Math.min(d, 11 * dt);
          this.pos.x += dx / d * step; this.pos.z += dz / d * step;
          this.pos.y = Math.max(groundHeight(this.seed, this.pos.x, this.pos.z), waterLevel(this.seed, this.pos.x, this.pos.z)) + 1.2;
          this.yaw += wrap(Math.atan2(-dx, -dz) - this.yaw) * Math.min(1, 5 * dt);
          wantFlap = 0.7; wantSpread = 1;
        } else {
          const gy = Math.max(groundHeight(this.seed, this.pos.x, this.pos.z), waterLevel(this.seed, this.pos.x, this.pos.z));
          this.pos.y += (gy - this.pos.y) * Math.min(1, 6 * dt);
          // turned a little towards you, the way an animal waits
          const tx = player.position.x - this.pos.x, tz = player.position.z - this.pos.z;
          this.yaw += wrap(Math.atan2(-tx, -tz) * 0.5 + this.yaw * 0.5 - this.yaw) * Math.min(1, dt);
        }
        this.bank *= 0.9;
        break;
      }

      case 'mounted': {
        const climb = this.vel.y, speed = this.vel.length();
        // beating hard when slow or climbing, gliding when fast or going down
        wantFlap = THREE.MathUtils.clamp(1 - speed / FLY + Math.max(0, climb) / 12, 0.18, 1);
        if (climb < -4) wantFlap = 0.1;
        wantSpread = 1;
        break;
      }

      case 'landing': {
        /* Down, and back inside the land you may walk on. Over the dome or
           a castle it cannot come straight down, so it keeps gliding the way
           it was going until there is open ground under it. */
        const gy = Math.max(groundHeight(this.seed, this.pos.x, this.pos.z), waterLevel(this.seed, this.pos.x, this.pos.z));
        const over = this.floor(this.pos.x, this.pos.z) > gy + 1;
        const tx = THREE.MathUtils.clamp(this.pos.x, -BOUNDS.half + 2, BOUNDS.half - 2);
        const tz = THREE.MathUtils.clamp(this.pos.z, -BOUNDS.half + 2, BOUNDS.south - 3);
        const want = over
          ? new THREE.Vector3(-Math.sin(this.yaw) * 14, 0, -Math.cos(this.yaw) * 14)
          : new THREE.Vector3((tx - this.pos.x) * 0.8, -14, (tz - this.pos.z) * 0.8);
        this.vel.lerp(want, 1 - Math.exp(-1.8 * dt));
        // not move(): its floor keeps a flying griffin 2.4 m up, and this one
        // is coming down to stand
        this.pos.addScaledVector(this.vel, dt);
        this.pos.y = Math.max(this.pos.y, over ? this.floor(this.pos.x, this.pos.z) + CLEAR : gy);
        wantFlap = this.pos.y - gy < 8 ? 1 : 0.3; wantSpread = 1;
        this.bank *= 0.95;
        if (!over && this.pos.y <= gy + 0.05){
          this.pos.y = gy;
          this.vel.set(0, 0, 0);
          this.state = 'idle';
          // you step off to its left
          player.ride = null;
          player.position.set(this.pos.x - Math.cos(this.yaw) * 2.4, 0, this.pos.z + Math.sin(this.yaw) * 2.4);
          player.resolve(player.position);
          player.velocity.set(0, 0, 0);
        }
        break;
      }

      case 'leaving': {
        this.t = Math.min(1, this.t + dt / 2.8);
        this.pos.lerpVectors(this.from, this.to, this.t * this.t);
        wantFlap = 1; wantSpread = 1;
        if (this.t > 0.75) g.scale.setScalar(Math.max(0.01, (1 - this.t) * 4));
        if (this.t >= 1){ this.state = 'away'; g.visible = false; return; }
        break;
      }
    }

    // the wings
    this.flap += (wantFlap - this.flap) * Math.min(1, 3 * dt);
    this.spread += (wantSpread - this.spread) * Math.min(1, 2.5 * dt);
    this.phase += dt * (1.1 + this.flap * 0.9) * Math.PI * 2;
    const beat = Math.sin(this.phase) * 0.8 * this.flap + 0.12 * (1 - this.flap);
    poseWings(this.model, this.spread, beat);

    /* The body rises on each downstroke and sinks on the up, a little — the
       motion you feel on its back. Pitch follows the climb, roll the turn. */
    let heave = this.spread > 0.5 ? -Math.sin(this.phase) * 0.22 * this.flap : 0;
    /* And while riding, a slow drift on top of the wingbeat — the air is
       never quite still — so a long glide still moves under you. Two waves
       at unrelated speeds, so it never settles into an obvious rhythm, and
       a little stronger the faster you go. */
    this.drift += dt;
    const air = this.mounted ? 0.6 + 0.4 * Math.min(1, this.vel.length() / FLY) : 0;
    heave += air * (Math.sin(this.drift * 1.9) * 0.16 + Math.sin(this.drift * 0.83) * 0.12);
    const level = Math.hypot(this.vel.x, this.vel.z);
    const wantTilt = this.mounted ? THREE.MathUtils.clamp(Math.atan2(this.vel.y, Math.max(4, level)) * 0.6, -0.4, 0.35) : 0;
    this.tilt += (wantTilt - this.tilt) * Math.min(1, 3 * dt);
    g.position.set(this.pos.x, this.pos.y + heave, this.pos.z);
    g.rotation.set(this.tilt, this.yaw, -this.bank, 'YXZ');
    g.updateMatrixWorld(true);

    if (this.mounted){
      // you, in the saddle: your feet go where it goes, your eyes ride its back
      player.position.copy(this.pos);
      this.ride.eye.copy(this.seatLocal).applyMatrix4(g.matrixWorld);
      // a small sway of its own on top of the bank, slower than the wingbeat
      this.ride.roll = this.bank * 0.7 + Math.sin(this.phase * 0.5) * 0.02 * this.flap
                     + air * (Math.sin(this.drift * 1.27) * 0.03 + Math.sin(this.drift * 0.53) * 0.02);
      this.ride.pitch = air * Math.sin(this.drift * 1.1) * 0.012;
      this.ride.speed = this.vel.length();
    }
  }

  /** For the interface. */
  hudState(){
    if (!this.here) return { here: false };
    return {
      here: true, mounted: this.mounted, state: this.state,
      metres: Math.max(0, Math.round(this.pos.y - Math.max(groundHeight(this.seed, this.pos.x, this.pos.z), waterLevel(this.seed, this.pos.x, this.pos.z)))),
      speed: Math.round(this.vel.length()),
    };
  }
}
