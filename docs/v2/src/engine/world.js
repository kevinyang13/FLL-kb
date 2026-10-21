/* Turns the planting plan into the scene. Everything that repeats — shrub
   blobs, bedding flowers, conifers, the forest on the slope — is drawn as a
   single InstancedMesh, so a garden with several thousand plants in it is
   still a few dozen draw calls and runs on a phone.

   Interactables are collected into the list the raycaster uses. */
import * as THREE from 'three';
import { texturedMat, mat } from '../rendering/materials.js';
import { groundHeight, riverSurface, YARD, GROUND,
         WATER, LAKE, RIVER, CLIFF, FALL, POOL } from '../worldgen/layout.js';
import { mulberry32 } from '../worldgen/noise.js';
import { buildDome } from './landmark.js';
import { buildCastles } from './castles.js';
import { onLakeCastle } from '../worldgen/castles.js';

const BLOB = new THREE.IcosahedronGeometry(1, 1);
const CONE = new THREE.ConeGeometry(1, 1, 9);
const TRUNK = new THREE.CylinderGeometry(0.1, 0.16, 1, 7);
const PETAL = new THREE.SphereGeometry(1, 6, 5);
const dummy = new THREE.Object3D();

/* A stone: an icosahedron pushed in and out, with its underside flattened
   so it sits rather than balances. The push is a function of where a
   vertex is, not of which vertex it is — the geometry is not indexed, so
   the three copies of each corner have to move together or the rock
   cracks open along every edge. */
function rockGeometry(seed){
  const g = new THREE.IcosahedronGeometry(1, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++){
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 4.1) * 43758.5453;
    const k = 0.8 + (n - Math.floor(n)) * 0.32;
    p.setXYZ(i, x * k, (y < -0.25 ? y * 0.55 : y) * k, z * k);
  }
  g.computeVertexNormals();
  return g;
}
const PEBBLE = rockGeometry(1), BOULDER = rockGeometry(2), OUTCROP = rockGeometry(3);

/* Instanced meshes carry their colour per instance, and three.js multiplies
   the material's own colour by it. So these materials must be WHITE — tinting
   a palette green by a palette green is what turned the first build of this
   garden almost black. */
const WHITE = { color: 0xFFFFFF, flatShading: true };

/* How big a chunk of garden goes into one mesh. A single InstancedMesh is
   culled as one object, so the 184,000 shrub blobs of a 640 m garden in one
   mesh means drawing all of them — and shadow-mapping all of them — whenever
   any corner of the garden is on screen. Bucketed into 60 m cells, the
   frustum and the fog throw away everything the player is not standing in,
   at the cost of a few dozen extra draw calls. */
const CHUNK = 60;

/** InstancedMeshes with per-instance colour, filled from a list and split
    into 60 m cells so the renderer can cull them. */
function instanced(scene, geo, material, items, place, shadows = true, chunk = CHUNK){
  const cells = new Map();
  for (const it of items){
    const k = Math.floor((it.x ?? 0) / chunk) + ',' + Math.floor((it.z ?? 0) / chunk);
    let cell = cells.get(k);
    if (!cell) cells.set(k, cell = []);
    cell.push(it);
  }
  const col = new THREE.Color();
  const meshes = [];
  for (const cell of cells.values()){
    const m = new THREE.InstancedMesh(geo, material, cell.length);
    m.castShadow = shadows; m.receiveShadow = shadows;
    cell.forEach((it, i) => {
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
    /* Culling an InstancedMesh uses its own bounding sphere over the
       instances, not the geometry's — without this every cell claims to be
       one blob at the origin and all but one is culled away. */
    m.computeBoundingSphere();
    scene.add(m);
    meshes.push(m);
  }
  return meshes;
}

export function buildWorld(scene, layout){
  const interactables = [];
  const leafSites = [];
  const soilSites = [];          // open soil, where the ant road runs
  const H = (x, z) => groundHeight(layout.seed, x, z);

  /* ── lawn ─────────────────────────────────────────────── */
  /* The land is drawn far wider than the garden the player may walk in. The
     forest ring sits at 300-460 m, and when the ground stopped at the
     boundary a hundred of those trees stood over nothing at all — which is
     what reads as big floating trees on the skyline. The segment count is
     up with the size, but not by ten: groundHeight's frequencies came down
     by ten at the same time, so the land undulates over the whole garden
     rather than once per metre and 4 m segments still follow it closely
     enough that nothing standing on it floats. */
  const g = new THREE.PlaneGeometry(GROUND, GROUND, 400, 400);
  const pos = g.attributes.position;
  /* The plane is built in XY and then rotated -90° about X, which maps its
     local +Y to world -Z. So a vertex's world z is MINUS its local y, and
     sampling the height field with the local y put the whole terrain back to
     front against everything standing on it — every tree, shrub and the
     player's own feet were using H(x, z) while the ground under them was
     H(x, -z). Hence the negation. */
  for (let i = 0; i < pos.count; i++) pos.setZ(i, H(pos.getX(i), -pos.getY(i)));
  g.computeVertexNormals();
  const nrm = g.attributes.normal;

  /* The mountains come out of the same height field as the lawn, so without
     this they are 250 m of mown grass. A colour per vertex tints the shared
     grass texture: untouched down in the garden, washed towards bare rock
     above the tree line, and bleached past it. Values above 1 are deliberate
     — the tone mapper rolls them off, which is what turns the top of a
     mountain white rather than pale green. */
  {
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++){
      const y = pos.getZ(i);                 // still the plane's local Z = height
      /* Rock shows where the land is high OR steep. Height alone left the
         escarpment green all the way up its face, because it starts at the
         valley floor; a 44 m cliff of lawn is what made it read as a hill.
         The normal's local Z is its upward part: 1 on the flat, falling
         as the slope stands up. Snow does not lie on a cliff. */
      const steep = Math.max(0, Math.min(1, (0.86 - nrm.getZ(i)) / 0.26));
      const rock = Math.max(steep, Math.min(1, (y - 18) / 52));
      const snow = Math.max(0, Math.min(1, (y - 95) / 70)) * (1 - steep);
      /* Red and blue are pushed much harder than green: the grass texture
         underneath is a saturated green, and washing a green out towards
         grey means lifting the two channels it is short of. */
      const r = 1 + rock * 1.15 + snow * 1.9;
      const gr = 1 + rock * 0.22 + snow * 1.35;
      const b = 1 + rock * 0.78 + snow * 2.1;
      col[i * 3] = r; col[i * 3 + 1] = gr; col[i * 3 + 2] = b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  }
  const lawn = new THREE.Mesh(g, texturedMat('lawn', 'grass', 680, { vertexColors: true }));
  lawn.rotation.x = -Math.PI / 2;
  lawn.receiveShadow = true;
  scene.add(lawn);

  /* ── the walks: a ribbon of paving along each one ───────── */
  /* Ten spines down the bay columns and one cross path per row. Each is its
     own mesh: a single ribbon stitched through all twenty would be one
     uncullable object spanning the whole garden. */
  const pathMat = texturedMat('path', 'soil', 1, { color: 0xBFB9AB });
  for (const pts of layout.paths){
    const W = pts.width || 0.75;         // the castle road is wider than a garden walk
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p.x, 0, p.z)));
    const N = Math.max(40, Math.round(curve.getLength() / 1.2));
    const verts = [], uvs = [], idx = [];
    for (let i = 0; i <= N; i++){
      const t = i / N;
      const p = curve.getPoint(t), tan = curve.getTangent(t);
      const nx = -tan.z, nz = tan.x;
      for (const s of [-1, 1]){
        const x = p.x + nx * W * s, z = p.z + nz * W * s;
        verts.push(x, H(x, z) + 0.035, z);
        uvs.push((s + 1) / 2, t * N * 0.17);
      }
      /* The walks that run into the lake castle stop at its walls rather
         than going on underneath it. */
      if (i < N && !onLakeCastle(p.x, p.z, -4)){
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    pg.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    pg.setIndex(idx);
    pg.computeVertexNormals();
    const pathMesh = new THREE.Mesh(pg, pathMat);
    pathMesh.receiveShadow = true;
    scene.add(pathMesh);
  }

  /* ── mixed borders: clumps of blobs, one instanced mesh ── */
  const foliage = mat('leaf', { ...WHITE, roughness: 0.75 });
  const blobs = [];
  const perches = [];
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
        const bx = x + (rnd() - 0.5) * s * 0.7, bz = z + (rnd() - 0.5) * s * 0.7;
        blobs.push({ x: bx, z: bz, y, s, sy, color: b.color, rot: rnd() * 3 });
        /* Perches: the lawn-facing face of a FRONT-ROW clump, at the height
           of a crouching child. Only the front row, because a perch deeper
           in the bank puts the insect somewhere the player cannot stand and
           cannot see — the first version scattered them three metres inside
           the shrubs, which is most of why nothing could be found. */
        if (b.depth < 0.22 && y - ground > 0.35 && y - ground < 1.2){
          /* Towards the lawn means towards THIS room's own spine, which the
             planting plan records as `out`. Taking it from the sign of the
             world x instead pointed every perch in the western half of the
             garden into the back of its own shrubs. */
          const out = b.out;
          perches.push({ x: bx + out * s * 0.9, y: y + sy * 0.35, z: bz, out });
        }
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
  const cushions = [], blooms = [], flowerPerches = [];
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
        const bx = x + (rnd() - 0.5) * 0.17, by2 = y + 0.13 + rnd() * 0.05, bz = z + (rnd() - 0.5) * 0.17;
        blooms.push({ x: bx, y: by2, z: bz, s: 0.026 + rnd() * 0.018, color: f.color });
        flowerPerches.push({ x: bx, y: by2 + 0.03, z: bz });
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
  const trunks = [], canopy = [], trunkPerches = [];
  for (const t of layout.trees){
    const rnd = mulberry32(t.seed);
    const base = H(t.x, t.z);
    const trunkH = t.h * 0.7;
    const trunkTop = base + trunkH - 0.25;
    const tr = 0.12 + t.spread * 0.12;
    trunks.push({ x: t.x, z: t.z, y: base + trunkH / 2 - 0.25, h: trunkH, r: tr, color: 0x6B5136 });
    // chest-high on the lawn side of the trunk, where bark crevices are
    trunkPerches.push({ x: t.x + t.out * (tr + 0.03), y: base + 0.95, z: t.z });

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

  /* ── the rainforest ─────────────────────────────────────── */
  /* The same trunk-and-crown build as the garden's trees, at three times the
     height. No perches: a perch out here would put one of the thirteen cards
     north of the garden boundary, where the player cannot walk. */
  const jTrunks = [], jCanopy = [];
  for (const t of layout.rainforest || []){
    const rnd = mulberry32(t.seed);
    const base = H(t.x, t.z);
    const trunkH = t.h * 0.74;
    const trunkTop = base + trunkH - 0.3;
    const tr = 0.2 + t.spread * 0.1;
    jTrunks.push({ x: t.x, z: t.z, y: base + trunkH / 2 - 0.3, h: trunkH, r: tr, color: 0x5B4733 });
    const core = t.spread * 0.95;
    const coreY = trunkTop + core * 0.3;
    jCanopy.push({ x: t.x, z: t.z, y: coreY, s: core, color: t.color, rot: rnd() * 3 });
    for (let i = 0; i < 7; i++){
      const a = rnd() * Math.PI * 2, rr = rnd() * core * 0.85;
      jCanopy.push({
        x: t.x + Math.cos(a) * rr, z: t.z + Math.sin(a) * rr,
        y: coreY + (rnd() - 0.4) * core * 0.6,
        s: t.spread * (0.4 + rnd() * 0.32), color: t.color, rot: rnd() * 3,
      });
    }
  }
  instanced(scene, TRUNK, mat('wood', WHITE), jTrunks, (d, t) => {
    d.position.set(t.x, t.y, t.z);
    d.scale.set(t.r / 0.13, t.h, t.r / 0.13);
    d.rotation.set(0, t.x, 0);
  }, false);
  instanced(scene, BLOB, foliage, jCanopy, (d, c) => {
    d.position.set(c.x, c.y, c.z); d.scale.set(c.s, c.s * 0.78, c.s); d.rotation.set(c.rot, c.rot, 0);
  }, false);

  // The slope: far away, no shadows — they would cost a lot and never be seen.
  // Fifteen thousand of them, so the chunking matters more here than anywhere.
  instanced(scene, CONE, foliage, layout.forest, (d, t) => {
    d.position.set(t.x, H(t.x, t.z) + t.h / 2 - 1, t.z);
    d.scale.set(t.r, t.h, t.r);
    d.rotation.set(0, t.x, 0);          // yaw only: a tree stands up
  }, false);

  /* ── stone ─────────────────────────────────────────────────
     Three draws for every rock in the land. Each sits on the LOWEST of five
     points of ground under it, then sinks into it, so a rock on a slope is
     buried on the uphill side instead of floating off the downhill one.
     Only boulders cast shadows: they are the ones big enough to be seen
     doing it, and the shadow pass is the expensive one. The mountain rock
     goes in 240 m cells, the boulders in 120 and the pebbles in 160, rather
     than the planting's 60: a stone is a few dozen triangles, so drawing a
     few hundred that are off screen costs less than the extra draw call
     that finer cells would spend skipping them. 60 m cells for stone added
     about one draw call in seven; these add about half that. */
  const rockMat = mat('rock', { ...WHITE, roughness: 0.95 });
  const seat = r => {
    const s = Math.max(r.w, r.d) * 0.6;
    const base = Math.min(H(r.x, r.z), H(r.x + s, r.z), H(r.x - s, r.z),
                          H(r.x, r.z + s), H(r.x, r.z - s));
    return base + r.h * 0.3;
  };
  const placeRock = (d, r) => {
    d.position.set(r.x, seat(r) + (r.lift || 0), r.z);   // lift: a cairn's upper stones
    d.scale.set(r.w, r.h, r.d);
    d.rotation.set(r.tilt, r.yaw, r.tilt * 0.6);
  };
  const rocks = layout.rocks || [];
  instanced(scene, PEBBLE, rockMat, rocks.filter(r => r.kind === 'pebble'), placeRock, false, 160);
  instanced(scene, BOULDER, rockMat, rocks.filter(r => r.kind === 'boulder'), placeRock, true, 120);
  instanced(scene, OUTCROP, rockMat, rocks.filter(r => r.kind === 'outcrop'), placeRock, false, 240);

  buildDome(scene, layout.seed);
  buildCastles(scene, layout);

  // a rising ridge behind the trees so the garden sits in a landscape
  // A ridge behind the garden. Its first version sat with its summit 20 m
  // BELOW the lawn, so it was never once visible.
  for (const [hx, hz, hr, hy] of [[-300, 860, 780, -260], [480, 780, 620, -220]]){
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(hr, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2.3),
      mat('hill', { flatShading: true }));
    hill.position.set(hx, hy, hz);
    hill.scale.set(1.5, 0.5, 1);
    scene.add(hill);
  }

  /* ── water ──────────────────────────────────────────────
     The bed is already cut into `groundHeight`; what is drawn here is only
     the surface, which is flat where the bed is not. The lake sits at one
     level, the river's surface falls steadily from the plunge pool to the
     lake, and the fall joins the two. All four share one material, so one
     texture offset per frame moves every piece of water in the garden. */
  const waterMat = texturedMat('water', 'water', 26, {
    transparent: true, opacity: 0.86, side: THREE.DoubleSide,
  });
  const fallsMat = texturedMat('falls', 'falls', 3, {
    transparent: true, opacity: 0.82, side: THREE.DoubleSide,
  });

  /* Exactly LAKE.r: the basin is cut to meet the water level at this radius,
     so the disc and the shoreline are the same circle. Drawing it wider left
     a ring of water lying on ground that was above it. */
  const lake = new THREE.Mesh(new THREE.CircleGeometry(LAKE.r, 72), waterMat);
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(LAKE.x, WATER, LAKE.z);
  lake.receiveShadow = true;
  scene.add(lake);

  {
    const curve = new THREE.CatmullRomCurve3(RIVER.pts.map(p => new THREE.Vector3(p.x, 0, p.z)));
    const N = 260, hw = RIVER.width / 2;
    const v = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++){
      const t = i / N;
      const p = curve.getPoint(t), tan = curve.getTangent(t);
      const nx = -tan.z, nz = tan.x;
      const y = riverSurface(t);
      for (const sgn of [-1, 1]){
        v.push(p.x + nx * hw * sgn, y, p.z + nz * hw * sgn);
        uv.push((sgn + 1) / 2, t * 46);
      }
      if (i < N){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g2.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g2.setIndex(idx);
    g2.computeVertexNormals();
    const river = new THREE.Mesh(g2, waterMat);
    river.receiveShadow = true;
    scene.add(river);
  }

  // the plunge pool, and the fall coming into it off the escarpment
  const pool = new THREE.Mesh(new THREE.CircleGeometry(POOL.r, 40), waterMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(POOL.x, POOL.level, POOL.z);
  scene.add(pool);

  /* The lip is wherever the escarpment actually tops out — reading it off
     the height field rather than naming a number keeps the fall attached to
     the cliff if the mountains are ever moved. */
  const lipY = H(FALL.x, CLIFF.z - 9);
  const dropH = lipY - FALL.foot;
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(FALL.width, dropH), fallsMat);
  fall.position.set(FALL.x, FALL.foot + dropH / 2, CLIFF.z + 3);
  fall.rotation.x = -0.06;
  scene.add(fall);

  // spray at the foot: a handful of soft points, no physics
  {
    const n = 220, pos = [];
    const rnd = mulberry32(99);
    for (let i = 0; i < n; i++){
      const a = rnd() * Math.PI * 2, r = rnd() * 17;
      pos.push(FALL.x + Math.cos(a) * r, FALL.foot + rnd() * 13, CLIFF.z + 6 + Math.sin(a) * r * 0.6);
    }
    const spray = new THREE.Points(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)),
      new THREE.PointsMaterial({ color: 0xF2F8F8, size: 2.6, sizeAttenuation: true,
                                 transparent: true, opacity: 0.3, depthWrite: false }));
    scene.add(spray);
  }

  /* One offset for every piece of water. The surface drifts; the fall runs. */
  const water = { update(dt){
    const s1 = waterMat.map, n1 = waterMat.normalMap;
    const s2 = fallsMat.map, n2 = fallsMat.normalMap;
    for (const t of [s1, n1]){ t.offset.y -= dt * 0.012; t.offset.x -= dt * 0.004; }
    for (const t of [s2, n2]) t.offset.y -= dt * 0.75;
  } };

  /* ── hedges ────────────────────────────────────────────── */
  const hedgePerches = [];
  for (const h of layout.hedges){
    const m = new THREE.Mesh(new THREE.BoxGeometry(h.w, h.h, h.d), mat('hedge', { flatShading: true }));
    m.position.set(h.x, H(h.x, h.z) + h.h / 2, h.z);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
    for (let i = 0; i < 4; i++){
      hedgePerches.push({ x: h.x + h.out * (h.w / 2 + 0.05),
                          y: H(h.x, h.z) + 1.0, z: h.z - h.d / 2 + (i + 1) * h.d / 5 });
    }
  }

  /* The anchors a scene can ask for, in the garden's own terms. Resolved
     against what was actually built, so the planting can change underneath
     without leaving an insect in mid-air. */
  // bare earth at the foot of the borders, for the ant road
  /* `from` is the clump's offset from its room's spine, so this picks the
     front of every border in the garden — testing the world x only ever
     found the borders of the middle room. */
  for (const b of layout.borders){
    if (Math.abs(b.from) > 11 || b.r < 1.1) continue;
    const sx = b.x + b.out * (b.r + 0.35);
    soilSites.push({ x: sx, y: H(sx, b.z) + 0.02, z: b.z, r: 0.2 });
  }

  const anchors = {
    leaf: perches,
    soil: soilSites,
    flower: flowerPerches,
    trunk: trunkPerches,
    hedge: hedgePerches,
  };
  return { interactables, leafSites, soilSites, perches, anchors, water };
}
