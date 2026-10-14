/* Turns a layout (pure data) into the static scene: lawn, beds, plants,
   flowers, fence, potting bench. Interactables are collected into a list the
   raycaster uses, each with the id the session needs to act on it. */
import * as THREE from 'three';
import { texturedMat, mat } from '../rendering/materials.js';
import { groundHeight, YARD } from '../worldgen/layout.js';
import { mulberry32 } from '../worldgen/noise.js';

export function buildWorld(scene, layout){
  const interactables = [];
  const leafSites = [];     // where aphids and eggs can sit
  const soilSites = [];     // where ants walk

  // ── lawn, undulating slightly so it is not a sheet of card
  const g = new THREE.PlaneGeometry(YARD.w, YARD.d, 48, 48);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++){
    pos.setZ(i, groundHeight(layout.seed, pos.getX(i), pos.getY(i)));
  }
  g.computeVertexNormals();
  const lawn = new THREE.Mesh(g, texturedMat('leafUnder', 'grass', 14));
  lawn.rotation.x = -Math.PI / 2;
  lawn.receiveShadow = true;
  scene.add(lawn);

  // ── fence
  const fenceMat = texturedMat('fence', 'wood', 2);
  for (const [sx, sz, rot] of [[0, YARD.d / 2, 0], [0, -YARD.d / 2, 0], [YARD.w / 2, 0, Math.PI / 2], [-YARD.w / 2, 0, Math.PI / 2]]){
    const panel = new THREE.Mesh(new THREE.BoxGeometry(YARD.w, 1.7, 0.08), fenceMat);
    panel.position.set(sx, 0.85, sz);
    panel.rotation.y = rot;
    panel.castShadow = panel.receiveShadow = true;
    scene.add(panel);
  }

  // ── raised beds
  const soilMat = texturedMat('soil', 'soil', 4);
  const woodMat = texturedMat('wood', 'wood', 3);
  for (const b of layout.beds){
    const frame = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), woodMat);
    frame.position.set(b.x, b.h / 2, b.z);
    frame.castShadow = frame.receiveShadow = true;
    scene.add(frame);
    const dirt = new THREE.Mesh(new THREE.BoxGeometry(b.w - 0.18, 0.08, b.d - 0.18), soilMat);
    dirt.position.set(b.x, b.h + 0.02, b.z);
    dirt.receiveShadow = true;
    scene.add(dirt);
    for (let i = 0; i < 4; i++) soilSites.push({ x: b.x - 3 + i * 2, y: b.h + 0.07, z: b.z, r: 0.5 });
  }

  // ── plants
  const stemMat = texturedMat('stem', 'wood', 1);
  const leafMat = texturedMat('leaf', 'leaf', 1, { side: THREE.DoubleSide });
  const bedTop = layout.beds[0].h;
  layout.plants.forEach((p, idx) => {
    const rnd = mulberry32(p.seed);
    const plant = new THREE.Group();
    plant.position.set(p.x, bedTop + 0.06, p.z);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, p.height, 7), stemMat);
    stem.position.y = p.height / 2;
    stem.rotation.z = p.lean;
    stem.castShadow = true;
    plant.add(stem);
    for (let i = 0; i < p.leaves; i++){
      const t = i / p.leaves;
      const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.16 + rnd() * 0.07, 12), leafMat);
      const a = i * 2.39;                       // ~137.5°, the angle real leaves use
      const y = 0.18 + t * (p.height - 0.3);
      leaf.position.set(Math.cos(a) * 0.14, y, Math.sin(a) * 0.14);
      leaf.rotation.set(-Math.PI / 2 + 0.5 + rnd() * 0.2, 0, -a);
      leaf.castShadow = leaf.receiveShadow = true;
      plant.add(leaf);
      if (i > p.leaves - 6){
        leafSites.push({ x: p.x + Math.cos(a) * 0.14, y: bedTop + 0.07 + y, z: p.z + Math.sin(a) * 0.14, r: 0.05 });
      }
    }
    scene.add(plant);
    // The reach has to clear the bed: the player is stopped 2.15 m from a bed's
    // centre by the collision box, so anything tighter than that can never fire.
    interactables.push({ id: 'plant:' + idx, object: stem, label: 'leaves', radius: 2.9,
      position: new THREE.Vector3(p.x, bedTop + p.height * 0.6, p.z) });
  });

  // ── flower border
  const flowerGroup = new THREE.Group();
  scene.add(flowerGroup);

  // ── potting bench, where the rearing cups live
  const bench = new THREE.Group();
  const prop = layout.props.find(p => p.kind === 'bench');
  bench.position.set(prop.x, 0, prop.z);
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.07, 0.8), woodMat);
  top.position.y = 0.92; top.castShadow = top.receiveShadow = true;
  bench.add(top);
  for (const sx of [-1.15, 1.15]) for (const sz of [-0.3, 0.3]){
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.92, 0.09), woodMat);
    leg.position.set(sx, 0.46, sz); leg.castShadow = true; bench.add(leg);
  }
  scene.add(bench);
  interactables.push({ id: 'bench', object: top, label: 'the rearing bench', radius: 2.0,
    position: new THREE.Vector3(prop.x, 1.0, prop.z) });

  return { interactables, leafSites, soilSites, flowerGroup, bench, benchTop: top };
}

/** Flowers are planted during play, so they are rebuilt rather than baked in. */
export function syncFlowers(group, layout, count){
  if (group.userData.shown === count) return;
  group.userData.shown = count;
  while (group.children.length) {
    const c = group.children[0]; group.remove(c);
    c.traverse(o => o.geometry && o.geometry.dispose());
  }
  const stemMat = mat('stem');
  layout.flowers.slice(0, count).forEach(f => {
    const fl = new THREE.Group();
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, f.height, 6), stemMat);
    stalk.position.y = f.height / 2; stalk.castShadow = true; fl.add(stalk);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), mat(f.white ? 'petalW' : 'petalY'));
    head.position.y = f.height; fl.add(head);
    for (let i = 0; i < 8; i++){
      const a = (i / 8) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.CircleGeometry(0.045, 8), mat(f.white ? 'petalW' : 'petalY', { side: 2 }));
      petal.position.set(Math.cos(a) * 0.055, f.height - 0.004, Math.sin(a) * 0.055);
      petal.rotation.set(-Math.PI / 2, 0, -a);
      petal.scale.set(1, 0.55, 1);
      fl.add(petal);
    }
    fl.position.set(f.x, 0, f.z);
    group.add(fl);
  });
}
