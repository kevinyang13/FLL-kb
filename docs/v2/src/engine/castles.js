/* Draws the castles from their plans in worldgen/castles.js.

   Each castle is a few hundred parts — walls, towers, roofs, spires, every
   window — and drawn one part at a time that would be a few hundred draw
   calls. So every part is baked into ONE geometry per castle, with its
   colour carried on its vertices, and the whole castle is a single mesh: one
   draw call, one shadow call, whatever is on it. Flat shading, like the
   rest of the garden. */
import * as THREE from 'three';
import { mat } from '../rendering/materials.js';

/* A pitched roof: the ridge runs along x, `w` long, over a base `d` deep. */
function gableGeometry(w, d, h){
  const x = w / 2, z = d / 2;
  const v = [
    // two slopes
    -x, 0,  z,   x, 0,  z,   x, h, 0,     -x, 0,  z,   x, h, 0,  -x, h, 0,
     x, 0, -z,  -x, 0, -z,  -x, h, 0,      x, 0, -z,  -x, h, 0,   x, h, 0,
    // the two gable ends
     x, 0,  z,   x, 0, -z,   x, h, 0,
    -x, 0, -z,  -x, 0,  z,  -x, h, 0,
  ];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

/** One part as a positioned, non-indexed geometry. Every primitive is
    built with its base at y = 0, so a part's `y` is where it stands. */
function partGeometry(p){
  let g;
  const m = new THREE.Matrix4();
  switch (p.type){
    case 'box':
      g = new THREE.BoxGeometry(p.w, p.h, p.d);
      g.translate(0, p.h / 2, 0);
      m.makeRotationY(p.rot || 0);
      break;
    case 'cyl':
      g = new THREE.CylinderGeometry(p.rt, p.r, p.h, p.seg);
      g.translate(0, p.h / 2, 0);
      break;
    case 'cone':
      g = new THREE.ConeGeometry(p.r, p.h, p.seg);
      g.translate(0, p.h / 2, 0);
      break;
    case 'pyr':
      // a four-sided cone turned 45° is a square pyramid; its radius is
      // half the diagonal of the square it stands on
      g = new THREE.ConeGeometry(p.w / Math.SQRT2, p.h, 4);
      g.rotateY(Math.PI / 4);
      g.translate(0, p.h / 2, 0);
      m.makeRotationY(p.rot || 0);
      break;
    case 'gable':
      g = gableGeometry(p.w, p.d, p.h);
      m.makeRotationY(p.rot || 0);
      break;
    case 'dome':
      g = new THREE.SphereGeometry(p.r, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2);
      break;
    default:
      return null;
  }
  m.setPosition(p.x, p.y, p.z);
  g = g.index ? g.toNonIndexed() : g;
  g.applyMatrix4(m);
  return g;
}

/** Bake a castle's parts into one mesh. */
function bake(parts, material){
  const pos = [], nrm = [], col = [];
  const c = new THREE.Color();
  for (const p of parts){
    const g = partGeometry(p);
    if (!g) continue;
    c.setHex(p.color);
    const P = g.attributes.position, N = g.attributes.normal;
    for (let i = 0; i < P.count; i++){
      pos.push(P.getX(i), P.getY(i), P.getZ(i));
      nrm.push(N.getX(i), N.getY(i), N.getZ(i));
      col.push(c.r, c.g, c.b);
    }
    g.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeBoundingSphere();
  return new THREE.Mesh(g, material);
}

/* The lake castle casts shadows — it stands in the garden, among the
   things that do. The hill castle is never inside the 52 m shadow box
   unless you are in its courtyard, so it takes them but casts none. */
export function buildCastles(scene, layout){
  const material = mat('castle', {
    color: 0xFFFFFF, roughness: 0.85, metalness: 0, flatShading: true, vertexColors: true,
  });
  const meshes = (layout.castles || []).map((parts, i) => {
    const mesh = bake(parts, material);
    mesh.castShadow = i === 0;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  });
  return meshes;
}
