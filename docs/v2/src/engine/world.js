/* Turns the planting plan into the scene. Everything that repeats — shrub
   blobs, bedding flowers, conifers, the forest on the slope — is drawn as a
   single InstancedMesh, so a garden with several thousand plants in it is
   still a few dozen draw calls and runs on a phone.

   Interactables are collected into the list the raycaster uses. */
import * as THREE from 'three';
import { texturedMat, mat } from '../rendering/materials.js';
import { groundHeight, YARD } from '../worldgen/layout.js';
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
  const soilSites = [];
  const H = (x, z) => groundHeight(layout.seed, x, z);

  /* ── lawn ─────────────────────────────────────────────── */
  const g = new THREE.PlaneGeometry(YARD.w, YARD.d, 90, 90);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, H(pos.getX(i), pos.getY(i)));
  g.computeVertexNormals();
  const lawn = new THREE.Mesh(g, texturedMat('lawn', 'grass', 26));
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
  for (const b of layout.borders){
    const rnd = mulberry32(b.seed);
    for (let i = 0; i < b.blobs; i++){
      const a = rnd() * Math.PI * 2, rr = rnd() * b.r * 0.95;
      const s = b.r * (0.26 + rnd() * 0.3);
      blobs.push({
        x: b.x + Math.cos(a) * rr, z: b.z + Math.sin(a) * rr,
        y: H(b.x, b.z) + b.h * (0.25 + rnd() * 0.6),
        s, sy: s * (0.7 + rnd() * 0.5), color: b.color, rot: rnd() * 3,
      });
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
      const y = H(x, z);
      cushions.push({ x, y: y + 0.06, z, s: 0.13 + rnd() * 0.07, color: 0x4E7A33 });
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
    d.position.set(c.x, H(c.x, c.z) + c.h / 2, c.z);
    d.scale.set(c.r, c.h, c.r);
    d.rotation.set(0, c.x, 0);
  });

  const trunks = [], canopy = [];
  for (const t of layout.trees){
    const rnd = mulberry32(t.seed);
    trunks.push({ x: t.x, z: t.z, y: H(t.x, t.z) + t.h * 0.35, h: t.h * 0.7, color: 0x6B5136 });
    for (let i = 0; i < 9; i++){
      const a = rnd() * Math.PI * 2, rr = rnd() * t.spread * 0.75;
      canopy.push({
        x: t.x + Math.cos(a) * rr, z: t.z + Math.sin(a) * rr,
        y: H(t.x, t.z) + t.h * (0.72 + rnd() * 0.3),
        s: t.spread * (0.34 + rnd() * 0.3), color: t.color, rot: rnd() * 3,
      });
    }
  }
  instanced(scene, TRUNK, mat('wood', WHITE), trunks, (d, t) => {
    d.position.set(t.x, t.y, t.z); d.scale.set(1, t.h, 1); d.rotation.set(0, t.x, 0);
  });
  instanced(scene, BLOB, foliage, canopy, (d, c) => {
    d.position.set(c.x, c.y, c.z); d.scale.set(c.s, c.s * 0.8, c.s); d.rotation.set(c.rot, c.rot, 0);
  });

  // The slope: far away, no shadows — they would cost a lot and never be seen.
  instanced(scene, CONE, foliage, layout.forest, (d, t) => {
    d.position.set(t.x, H(t.x, t.z) + t.h / 2 - 1, t.z);
    d.scale.set(t.r, t.h, t.r);
  }, false);

  // a rising ridge behind the trees so the garden sits in a landscape
  const hill = new THREE.Mesh(new THREE.SphereGeometry(58, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2.4),
                              mat('hill', { flatShading: true }));
  hill.position.set(0, -44, 6);
  hill.scale.set(1, 0.42, 1);
  scene.add(hill);

  /* ── hedges ────────────────────────────────────────────── */
  for (const h of layout.hedges){
    const m = new THREE.Mesh(new THREE.BoxGeometry(h.w, h.h, h.d), mat('hedge', { flatShading: true }));
    m.position.set(h.x, H(h.x, h.z) + h.h / 2, h.z);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
  }

  /* ── the working beds and their plants (the game's floor) ─ */
  const soilMat = texturedMat('soil', 'soil', 4);
  const woodMat = texturedMat('wood', 'wood', 3);
  for (const b of layout.beds){
    const y = H(b.x, b.z);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), woodMat);
    frame.position.set(b.x, y + b.h / 2, b.z);
    frame.castShadow = frame.receiveShadow = true;
    scene.add(frame);
    const dirt = new THREE.Mesh(new THREE.BoxGeometry(b.w - 0.16, 0.08, b.d - 0.16), soilMat);
    dirt.position.set(b.x, y + b.h + 0.02, b.z);
    dirt.receiveShadow = true;
    scene.add(dirt);
    for (let i = 0; i < 3; i++) soilSites.push({ x: b.x - 1.6 + i * 1.6, y: y + b.h + 0.07, z: b.z, r: 0.5 });
  }

  const stemMat = texturedMat('stem', 'wood', 1);
  const leafMat = texturedMat('leaf', 'leaf', 1, { side: THREE.DoubleSide });
  layout.plants.forEach((p, idx2) => {
    const rnd = mulberry32(p.seed);
    const base = H(p.x, p.z) + layout.beds[p.bed].h + 0.06;
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
    interactables.push({ id: 'plant:' + idx2, object: stem, label: 'leaves', radius: 2.9,
      position: new THREE.Vector3(p.x, base + p.height * 0.6, p.z) });
  });

  /* ── potting bench ─────────────────────────────────────── */
  const prop = layout.props.find(p => p.kind === 'bench');
  const by = H(prop.x, prop.z);
  const bench = new THREE.Group();
  bench.position.set(prop.x, by, prop.z);
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.07, 0.8), woodMat);
  top.position.y = 0.92; top.castShadow = top.receiveShadow = true;
  bench.add(top);
  for (const sx of [-1.15, 1.15]) for (const sz of [-0.3, 0.3]){
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.92, 0.09), woodMat);
    leg.position.set(sx, 0.46, sz); leg.castShadow = true; bench.add(leg);
  }
  scene.add(bench);
  interactables.push({ id: 'bench', object: top, label: 'the rearing bench', radius: 2.2,
    position: new THREE.Vector3(prop.x, by + 1.0, prop.z) });

  const flowerGroup = new THREE.Group();
  scene.add(flowerGroup);
  return { interactables, leafSites, soilSites, flowerGroup, bench, benchTop: top };
}

/** Flowers the player plants during play, along the lawn edge. */
export function syncFlowers(group, layout, count){
  if (group.userData.shown === count) return;
  group.userData.shown = count;
  while (group.children.length){
    const c = group.children[0]; group.remove(c);
    c.traverse(o => o.geometry && o.geometry.dispose());
  }
  const stemMat = mat('stem');
  const H = (x, z) => groundHeight(layout.seed, x, z);
  for (let i = 0; i < count; i++){
    const b = layout.beds[i % layout.beds.length];
    const x = b.x - 2.4 + (i % 5) * 1.2, z = b.z - 2.3;
    const fl = new THREE.Group();
    const h = 0.5 + (i % 3) * 0.1;
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, h, 6), stemMat);
    stalk.position.y = h / 2; stalk.castShadow = true; fl.add(stalk);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), mat(i % 2 ? 'petalW' : 'petalY'));
    head.position.y = h; fl.add(head);
    for (let k = 0; k < 8; k++){
      const a = (k / 8) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.CircleGeometry(0.05, 8), mat(i % 2 ? 'petalW' : 'petalY', { side: THREE.DoubleSide }));
      petal.position.set(Math.cos(a) * 0.06, h - 0.004, Math.sin(a) * 0.06);
      petal.rotation.set(-Math.PI / 2, 0, -a);
      petal.scale.set(1, 0.55, 1);
      fl.add(petal);
    }
    fl.position.set(x, H(x, z), z);
    group.add(fl);
  }
}
