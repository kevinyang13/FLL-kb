/* The griffin: eagle in front, lion behind. White head and ruff, a hooked
   yellow beak, a brown feathered chest and wings with pale coverts, eagle
   legs and talons at the front; golden lion haunches, paws and a tufted
   tail at the back. Big enough to carry a child — about 3.5 m nose to rump,
   two metres at the shoulder, ten metres across the wings.

   Three meshes: the body, and each wing on its own pivot at the shoulder so
   it can beat. Every part of each is baked into one geometry with its colour
   on the vertices, so the whole animal is three draw calls. It faces -z,
   like the camera, and stands with its feet at y = 0. */
import * as THREE from 'three';
import { mat } from '../rendering/materials.js';

const BROWN = 0x7A4A2A, DARK = 0x5E3720, TAN = 0xA9774A, PALE = 0xD9C6A8;
const WHITE = 0xF3EFE6, BEAK = 0xF2B630, GOLD = 0xD08A2E, GOLD2 = 0xB97325;
const CLAW = 0x8E8E86, EYE = 0x2E2A12, IRIS = 0xC9C23A;

/** Collects parts, each a geometry put in place, and bakes them into one. */
function baker(){
  const pos = [], nrm = [], col = [];
  const c = new THREE.Color(), m = new THREE.Matrix4(), q = new THREE.Quaternion();
  const add = (geo, color, at, rot = [0, 0, 0], scale = [1, 1, 1]) => {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    q.setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
    m.compose(new THREE.Vector3(...at), q, new THREE.Vector3(...scale));
    g.applyMatrix4(m);
    c.setHex(color);
    const P = g.attributes.position, N = g.attributes.normal;
    for (let i = 0; i < P.count; i++){
      pos.push(P.getX(i), P.getY(i), P.getZ(i));
      nrm.push(N.getX(i), N.getY(i), N.getZ(i));
      col.push(c.r, c.g, c.b);
    }
    g.dispose();
  };
  const bake = material => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, material);
    mesh.castShadow = true;
    return mesh;
  };
  return { add, bake };
}

const BALL = new THREE.SphereGeometry(1, 12, 9);
const LUMP = new THREE.IcosahedronGeometry(1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 9);
const CONE = new THREE.ConeGeometry(1, 1, 8);
const SLAB = new THREE.BoxGeometry(1, 1, 1);

/** One wing, built reaching along +x from its shoulder. The left wing is
    the same wing turned round, not mirrored, so its faces still face out. */
function wing(material){
  const b = baker();
  b.add(BALL, BROWN, [0.85, 0, 0], [0, 0, 0], [0.95, 0.13, 0.42]);          // the arm
  b.add(BALL, TAN,   [2.45, 0.02, 0.05], [0, 0, 0], [0.95, 0.1, 0.34]);     // the hand
  /* The wing's surface. Without it the feathers were a row of separate
     planks with sky between them, which is not a wing. */
  b.add(BALL, BROWN, [1.9, -0.005, 0.55], [0, 0, 0], [1.95, 0.05, 0.8]);
  b.add(BALL, PALE,  [1.5, 0.04, 0.3], [0, 0, 0], [1.25, 0.06, 0.32]);      // pale coverts
  // secondaries: hanging back from the trailing edge, getting longer outward
  for (let i = 0; i < 7; i++){
    const x = 0.45 + i * 0.36, len = 0.9 + i * 0.06;
    b.add(SLAB, i % 2 ? DARK : BROWN, [x, -0.01, 0.35 + len / 2], [0, 0.04 * i, 0], [0.34, 0.04, len]);
    b.add(SLAB, WHITE, [x, -0.012, 0.35 + len - 0.08], [0, 0.04 * i, 0], [0.3, 0.035, 0.16]);
  }
  // primaries: the long fingers at the tip, fanning back
  for (let i = 0; i < 7; i++){
    const a = -0.35 + i * 0.16, len = 1.55 - Math.abs(i - 2) * 0.1;
    const x = 3.0 + Math.cos(a) * len / 2, z = 0.12 + Math.sin(a) * len / 2 + i * 0.05;
    b.add(SLAB, i % 2 ? DARK : BROWN, [x, -0.015, z], [0, -a, 0], [len, 0.035, 0.26]);
  }
  return b.bake(material);
}

export function buildGriffin(){
  const material = mat('griffin', {
    color: 0xFFFFFF, roughness: 0.82, metalness: 0, flatShading: true, vertexColors: true,
  });
  const wingMat = mat('griffinWing', {
    color: 0xFFFFFF, roughness: 0.85, metalness: 0, flatShading: true, vertexColors: true,
    side: THREE.DoubleSide,
  });

  const b = baker();
  // the lion behind
  b.add(BALL, GOLD,  [0, 1.45, 0.8], [0.1, 0, 0], [0.7, 0.72, 1.0]);
  b.add(BALL, GOLD2, [0, 1.22, 0.85], [0, 0, 0], [0.55, 0.5, 0.75]);        // the belly
  for (const s of [-1, 1]){
    b.add(BALL, GOLD,  [s * 0.42, 1.25, 1.25], [0.25, 0, 0], [0.32, 0.55, 0.42]);   // haunch
    b.add(CYL,  GOLD,  [s * 0.44, 0.55, 1.42], [-0.15, 0, 0], [0.14, 0.95, 0.14]);  // hind leg
    b.add(BALL, GOLD2, [s * 0.44, 0.1, 1.33], [0, 0, 0], [0.2, 0.12, 0.27]);        // paw
    for (const t of [-0.08, 0, 0.08]) b.add(CONE, CLAW, [s * 0.44 + t, 0.06, 1.08], [-Math.PI / 2, 0, 0], [0.035, 0.12, 0.035]);
  }
  // the tail: a curve of segments rising behind, and a dark tuft
  let tx = 0, ty = 1.6, tz = 1.7;
  for (let i = 0; i < 6; i++){
    const a = 0.6 - i * 0.28;
    const nx = tx, ny = ty + Math.sin(a) * 0.32, nz = tz + Math.cos(a) * 0.32;
    b.add(CYL, GOLD, [(tx + nx) / 2, (ty + ny) / 2, (tz + nz) / 2], [Math.PI / 2 - a, 0, 0], [0.07, 0.36, 0.07]);
    tx = nx; ty = ny; tz = nz;
  }
  b.add(LUMP, DARK, [tx, ty + 0.05, tz], [0.4, 0.3, 0], [0.16, 0.24, 0.14]);

  // the eagle in front
  b.add(BALL, BROWN, [0, 1.75, -0.6], [-0.15, 0, 0], [0.76, 0.86, 1.0]);     // chest
  b.add(BALL, TAN,   [0, 1.55, -1.18], [0, 0, 0], [0.56, 0.68, 0.38]);       // breast
  b.add(BALL, WHITE, [0, 2.4, -1.25], [-0.5, 0, 0], [0.44, 0.6, 0.44]);      // neck
  for (let i = 0; i < 9; i++){                                               // the white ruff
    const a = (i / 9) * Math.PI * 2;
    b.add(CONE, WHITE, [Math.cos(a) * 0.36, 2.25 + Math.sin(a) * 0.12, -1.1 + Math.sin(a) * 0.3],
      [Math.PI / 2 + 0.4, a, 0], [0.13, 0.42, 0.13]);
  }
  b.add(BALL, WHITE, [0, 2.92, -1.58], [0.1, 0, 0], [0.37, 0.38, 0.5]);      // head
  b.add(BALL, WHITE, [0, 3.12, -1.52], [0.3, 0, 0], [0.34, 0.16, 0.34]);     // brow
  b.add(CONE, BEAK,  [0, 2.86, -2.1], [-Math.PI / 2, 0, 0], [0.17, 0.5, 0.2]);   // beak
  b.add(CONE, BEAK,  [0, 2.74, -2.32], [Math.PI, 0, 0], [0.07, 0.2, 0.08]);      // its hook
  for (const s of [-1, 1]){
    b.add(BALL, IRIS, [s * 0.27, 2.98, -1.82], [0, 0, 0], [0.075, 0.075, 0.06]);
    b.add(BALL, EYE,  [s * 0.3, 2.98, -1.85], [0, 0, 0], [0.04, 0.04, 0.035]);
    b.add(BALL, BROWN, [s * 0.38, 1.25, -0.95], [0.2, 0, 0], [0.24, 0.42, 0.3]);    // feathered thigh
    b.add(CYL,  BEAK,  [s * 0.38, 0.55, -1.08], [0.1, 0, 0], [0.1, 0.95, 0.1]);     // scaly shank
    b.add(BALL, BEAK,  [s * 0.38, 0.1, -1.15], [0, 0, 0], [0.16, 0.1, 0.2]);        // foot
    for (const t of [-0.1, 0, 0.1]) b.add(CONE, CLAW, [s * 0.38 + t, 0.07, -1.42], [-Math.PI / 2 - 0.3, 0, 0], [0.045, 0.28, 0.045]);
  }
  b.add(BALL, DARK, [0, 2.25, -0.1], [0, 0, 0], [0.42, 0.12, 0.55]);         // where the rider sits

  const body = b.bake(material);
  const group = new THREE.Group();
  group.add(body);

  // the wings, each on a pivot at its shoulder
  const right = new THREE.Group(), left = new THREE.Group();
  right.position.set(0.55, 2.15, -0.55);
  left.position.set(-0.55, 2.15, -0.55);
  const rw = wing(wingMat), lw = wing(wingMat);
  lw.rotation.y = Math.PI;              // the same wing, turned to reach along -x
  right.add(rw); left.add(lw);
  group.add(right, left);
  return { group, wings: { right, left } };
}

/** Pose the wings. `spread` 0 is folded along the back, 1 is open; `beat`
    is the angle of the downstroke, in radians, + up. */
export function poseWings(g, spread, beat){
  const sweep = (1 - spread) * 1.25;        // folded wings lie back along the body
  const lift = beat * spread + (1 - spread) * 0.35;
  // turning +x about y by a positive angle swings it towards -z, the front,
  // so folding back is a negative turn on the right and positive on the left
  g.wings.right.rotation.set(0, -sweep, lift);
  g.wings.left.rotation.set(0, sweep, -lift);
}
