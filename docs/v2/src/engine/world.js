/* Turns the planting plan into the scene. Everything that repeats — shrub
   blobs, bedding flowers, conifers, the forest on the slope — is drawn as a
   single InstancedMesh, so a garden with several thousand plants in it is
   still a few dozen draw calls and runs on a phone.

   Interactables are collected into the list the raycaster uses. */
import * as THREE from 'three';
import { texturedMat, mat } from '../rendering/materials.js';
import { groundHeight, YARD, GROUND } from '../worldgen/layout.js';
import { mulberry32 } from '../worldgen/noise.js';

const BLOB = new THREE.IcosahedronGeometry(1, 1);
const CONE = new THREE.ConeGeometry(1, 1, 9);
const TRUNK = new THREE.CylinderGeometry(0.1, 0.16, 1, 7);
const PETAL = new THREE.SphereGeometry(1, 6, 5);
const dummy = new THREE.Object3D();

/* Instanced meshes carry their colour per instance, and three.js multiplies
   the material's own colour by it. So these materials must be WHITE — tinting
   a palette green by a palette green is what turned the first build of this
   garden almost black. */
const WHITE = { color: 0xFFFFFF, flatShading: true };

/** One InstancedMesh with per-instance colour, filled from a list. */
function instanced(scene, geo, material, items, place, shadows = true){
  const m = new THREE.InstancedMesh(geo, material, items.length);
  m.castShadow = shadows; m.receiveShadow = shadows;
  const col = new THREE.Color();
  items.forEach((it, i) => {
    /* `dummy` is shared by every call, so it must be reset before each
       placement. Without this, a placer that sets no rotation silently
       inherits the previous one's — which is why the forest stood at the
       random tilt of the last shrub blob rather than upright. */
    dummy.position.set(0, 0, 0);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    place(dummy, it, i);
    dummy.updateMatrix();
    m.setMatrixAt(i, dummy.matrix);
    m.setColorAt(i, col.setHex(it.color ?? 0xFFFFFF));
  });
  m.instanceMatrix.needsUpdate = true;
  if (m.instanceColor) m.instanceColor.needsUpdate = true;
  scene.add(m);
  return m;
}

export function buildWorld(scene, layout){
  const interactables = [];
  const leafSites = [];
  const soilSites = [];          // kept: the ants' scene sits on open soil
  const H = (x, z) => groundHeight(layout.seed, x, z);

  /* ── lawn ─────────────────────────────────────────────── */
  /* The land is drawn far wider than the garden the player may walk in. The
     forest ring sits at 30-46 m, and when the ground stopped at the 32 m
     boundary a hundred of those trees stood over nothing at all — which is
     what reads as big floating trees on the skyline. */
  const g = new THREE.PlaneGeometry(GROUND, GROUND, 180, 180);
  const pos = g.attributes.position;
  /* The plane is built in XY and then rotated -90° about X, which maps its
     local +Y to world -Z. So a vertex's world z is MINUS its local y, and
     sampling the height field with the local y put the whole terrain back to
     front against everything standing on it — every tree, shrub and the
     player's own feet were using H(x, z) while the ground under them was
     H(x, -z). Hence the negation. */
  for (let i = 0; i < pos.count; i++) pos.setZ(i, H(pos.getX(i), -pos.getY(i)));
  g.computeVertexNormals();
  const lawn = new THREE.Mesh(g, texturedMat('lawn', 'grass', 68));
  lawn.rotation.x = -Math.PI / 2;
  lawn.receiveShadow = true;
  scene.add(lawn);

  /* ── the path: a ribbon of paving following the curve ──── */
  const curve = new THREE.CatmullRomCurve3(layout.path.map(p => new THREE.Vector3(p.x, 0, p.z)));
  const N = 150, W = 0.75;
  const verts = [], uvs = [], idx = [];
  for (let i = 0; i <= N; i++){
    const t = i / N;
    const p = curve.getPoint(t), tan = curve.getTangent(t);
    const nx = -tan.z, nz = tan.x;
    for (const s of [-1, 1]){
      const x = p.x + nx * W * s, z = p.z + nz * W * s;
      verts.push(x, H(x, z) + 0.035, z);
      uvs.push((s + 1) / 2, t * 26);
    }
    if (i < N){
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  pg.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  pg.setIndex(idx);
  pg.computeVertexNormals();
  const pathMesh = new THREE.Mesh(pg, texturedMat('path', 'soil', 1, { color: 0xBFB9AB }));
  pathMesh.receiveShadow = true;
  scene.add(pathMesh);

  /* ── mixed borders: clumps of blobs, one instanced mesh ── */
  const foliage = mat('leaf', { ...WHITE, roughness: 0.75 });
  const blobs = [];
  /* A clump is grown as columns, not scattered as a cloud. Each column
     starts with a blob resting on the ground directly beneath it and stacks
     upward until it reaches the dome height for its distance from the
     centre, so the mass is continuous and nothing can hang in the air. The
     ground is sampled under every blob: the lawn is a bowl, and sampling
     once at the clump's centre buried the uphill side and floated the other.
     Each blob then sinks a third of its radius into the one below, which is
     what turns a stack of balls into a bush. */
  for (const b of layout.borders){
    const rnd = mulberry32(b.seed);
    const columns = Math.max(4, Math.round(b.blobs / 2.6));
    for (let c = 0; c < columns; c++){
      const a = rnd() * Math.PI * 2;
      const t = Math.sqrt(rnd());                  // spread evenly over the area
      const rr = t * b.r;
      const x = b.x + Math.cos(a) * rr, z = b.z + Math.sin(a) * rr;
      const ground = H(x, z);
      const dome = b.h * (1 - t * t * 0.85) * (0.6 + rnd() * 0.5);
      let y = ground;
      let guard = 0;
      while (y - ground < dome && guard++ < 8){
        const s = b.r * (0.24 + rnd() * 0.26);
        const sy = s * (0.7 + rnd() * 0.45);
        y += sy * 0.72;                            // overlap the blob below
        blobs.push({
          x: x + (rnd() - 0.5) * s * 0.7,
          z: z + (rnd() - 0.5) * s * 0.7,
          y, s, sy, color: b.color, rot: rnd() * 3,
        });
        y += sy * 0.38;
      }
    }
  }
  instanced(scene, BLOB, foliage, blobs, (d, b) => {
    d.position.set(b.x, b.y, b.z);
    d.scale.set(b.s, b.sy, b.s);
    d.rotation.set(b.rot, b.rot * 1.7, 0);
  });

  /* ── bedding carpets ───────────────────────────────────── */
  const cushions = [], blooms = [];
  for (const f of layout.flowerBands){
    const rnd = mulberry32(f.seed);
    for (let i = 0; i < f.count; i++){
      const x = f.x + (rnd() - 0.5) * f.w, z = f.z + (rnd() - 0.5) * f.d;
      const y = H(x, z);                          // under this plant, not the band's centre
      cushions.push({ x, y: y + 0.02, z, s: 0.13 + rnd() * 0.07, color: 0x4E7A33 });
      // several small heads per cushion, sunk into the foliage: one big ball
      // per plant reads as a golf ball on a lawn, which is what this was.
      for (let k = 0; k < 3; k++){
        if (rnd() > 0.72) continue;
        blooms.push({ x: x + (rnd() - 0.5) * 0.17, y: y + 0.13 + rnd() * 0.05,
                      z: z + (rnd() - 0.5) * 0.17, s: 0.026 + rnd() * 0.018, color: f.color });
      }
    }
  }
  instanced(scene, BLOB, foliage, cushions, (d, c) => {
    d.position.set(c.x, c.y, c.z); d.scale.set(c.s, c.s * 0.7, c.s); d.rotation.set(0, c.x, 0);
  }, false);
  instanced(scene, PETAL, mat('petalY', { ...WHITE, roughness: 0.55 }), blooms, (d, b) => {
    d.position.set(b.x, b.y, b.z); d.scale.setScalar(b.s); d.rotation.set(0, b.z, 0);
  }, false);

  /* ── conifers, canopy trees, the forest beyond ─────────── */
  instanced(scene, CONE, foliage, layout.conifers, (d, c) => {
    d.position.set(c.x, H(c.x, c.z) + c.h / 2 - 0.3, c.z);
    d.scale.set(c.r, c.h, c.r);
    d.rotation.set(0, c.x, 0);
  });

  /* A crown is built outward from the trunk, not scattered above it. One
     central mass sits on the top of the trunk and every other blob is placed
     inside that mass's radius, so the canopy cannot drift off the tree —
     which it did: two thirds of the crown blobs were touching nothing, and a
     crown hanging over a thin trunk is what reads as a floating tree. */
  const trunks = [], canopy = [];
  for (const t of layout.trees){
    const rnd = mulberry32(t.seed);
    const base = H(t.x, t.z);
    const trunkH = t.h * 0.7;
    const trunkTop = base + trunkH - 0.25;
    trunks.push({ x: t.x, z: t.z, y: base + trunkH / 2 - 0.25, h: trunkH,
                  r: 0.12 + t.spread * 0.12, color: 0x6B5136 });

    const core = t.spread * 0.85;
    const coreY = trunkTop + core * 0.35;
    canopy.push({ x: t.x, z: t.z, y: coreY, s: core, color: t.color, rot: rnd() * 3 });
    for (let i = 0; i < 8; i++){
      const a = rnd() * Math.PI * 2;
      const rr = rnd() * core * 0.8;
      const s = t.spread * (0.34 + rnd() * 0.3);
      canopy.push({
        x: t.x + Math.cos(a) * rr,
        z: t.z + Math.sin(a) * rr,
        y: coreY + (rnd() - 0.4) * core * 0.75,
        s, color: t.color, rot: rnd() * 3,
      });
    }
  }
  // A nine-metre tree on a 10 cm trunk reads as a cloud, not a tree: the
  // trunk is scaled with the crown it has to hold up.
  instanced(scene, TRUNK, mat('wood', WHITE), trunks, (d, t) => {
    d.position.set(t.x, t.y, t.z);
    d.scale.set(t.r / 0.13, t.h, t.r / 0.13);
    d.rotation.set(0, t.x, 0);
  });
  instanced(scene, BLOB, foliage, canopy, (d, c) => {
    d.position.set(c.x, c.y, c.z); d.scale.set(c.s, c.s * 0.8, c.s); d.rotation.set(c.rot, c.rot, 0);
  });

  // The slope: far away, no shadows — they would cost a lot and never be seen.
  instanced(scene, CONE, foliage, layout.forest, (d, t) => {
    d.position.set(t.x, H(t.x, t.z) + t.h / 2 - 1, t.z);
    d.scale.set(t.r, t.h, t.r);
    d.rotation.set(0, t.x, 0);          // yaw only: a tree stands up
  }, false);

  // a rising ridge behind the trees so the garden sits in a landscape
  // A ridge behind the garden. Its first version sat with its summit 20 m
  // BELOW the lawn, so it was never once visible.
  for (const [hx, hz, hr, hy] of [[-30, 86, 78, -26], [48, 78, 62, -22]]){
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(hr, 30, 16, 0, Math.PI * 2, 0, Math.PI / 2.3),
      mat('hill', { flatShading: true }));
    hill.position.set(hx, hy, hz);
    hill.scale.set(1.5, 0.5, 1);
    scene.add(hill);
  }

  /* ── hedges ────────────────────────────────────────────── */
  for (const h of layout.hedges){
    const m = new THREE.Mesh(new THREE.BoxGeometry(h.w, h.h, h.d), mat('hedge', { flatShading: true }));
    m.position.set(h.x, H(h.x, h.z) + h.h / 2, h.z);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
  }

  /* ── the vegetable plants: in the ground, no frames ────── */
  const stemMat = texturedMat('stem', 'wood', 1);
  const leafMat = texturedMat('leaf', 'leaf', 1, { side: THREE.DoubleSide });
  layout.plants.forEach((p, idx2) => {
    const rnd = mulberry32(p.seed);
    const base = H(p.x, p.z);
    const plant = new THREE.Group();
    plant.position.set(p.x, base, p.z);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, p.height, 7), stemMat);
    stem.position.y = p.height / 2; stem.rotation.z = p.lean; stem.castShadow = true;
    plant.add(stem);
    for (let i = 0; i < p.leaves; i++){
      const t = i / p.leaves;
      const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.15 + rnd() * 0.07, 12), leafMat);
      const a = i * 2.39;                        // 137.5°, the angle real leaves use
      const y = 0.18 + t * (p.height - 0.3);
      leaf.position.set(Math.cos(a) * 0.14, y, Math.sin(a) * 0.14);
      leaf.rotation.set(-Math.PI / 2 + 0.5 + rnd() * 0.2, 0, -a);
      leaf.castShadow = leaf.receiveShadow = true;
      plant.add(leaf);
      if (i > p.leaves - 6){
        leafSites.push({ x: p.x + Math.cos(a) * 0.14, y: base + y, z: p.z + Math.sin(a) * 0.14, r: 0.05 });
      }
    }
    scene.add(plant);
  });

  return { interactables, leafSites, soilSites };
}
