/* The granite dome east of the garden — Half Dome, at a size a garden can
   hold. One mesh, built once, never rebuilt.

   It starts as a hemisphere and is made into a dome in three moves: the
   shoulders are pushed out so the sides climb steeply and the top is broad,
   the whole surface is roughened so it is not a perfect ball, and then every
   point past the cutting plane is pressed flat onto it. That last move is
   the face: the points of the sliced-off half all land on one plane, so the
   wall comes out sheer to the full height without being modelled at all.

   It casts no shadow. The shadow camera is a 52 m box that travels with the
   player, and the dome is never inside it, so casting would cost a shadow
   pass and draw nothing. */
import * as THREE from 'three';
import { mat } from '../rendering/materials.js';
import { fbm } from '../worldgen/noise.js';
import { groundHeight, DOME } from '../worldgen/layout.js';

export function buildDome(scene, seed){
  const { x, z, r, h, cut } = DOME;
  // 120 x 60 is about 14,000 triangles: fine detail on the face, where the
  // eye goes, and no cost worth counting next to the planting
  const g = new THREE.SphereGeometry(1, 120, 60, 0, Math.PI * 2, 0, Math.PI / 2);
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const c = new THREE.Color();

  for (let i = 0; i < p.count; i++){
    const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i);
    const n = fbm(seed + 21, vx * 3 + 5, vz * 3 + 5, 3) - 0.5;
    let X = vx * (1 + n * 0.1);
    const Z = vz * 0.82 * (1 + n * 0.1);
    const Y = Math.pow(Math.max(0, vy), 0.8) * (1 + n * 0.06);
    let face = false;
    if (X > cut){
      /* Pressed onto the plane, but not perfectly: a little relief that
         runs up and down, the way exfoliating granite comes away in tall
         sheets. Never past the plane, so the face cannot lean out. */
      X = cut - Math.abs(fbm(seed + 33, Z * 16, Y * 2.2, 3) - 0.5) * 0.05;
      face = true;
    }
    p.setXYZ(i, X * r, Y * h, Z * r);

    /* Granite: pale on the face, where it is fresh, with dark streaks
       running down it where water has, and greyer and darker on the old
       weathered back. Values over 1 brighten the plain grey material. */
    if (face){
      const streak = fbm(seed + 47, Z * 26, Y * 0.9, 2);
      const v = 1.18 - Math.max(0, streak - 0.5) * 1.3;
      c.setRGB(v, v * 0.98, v * 0.95);
    } else {
      const v = 0.95 + (fbm(seed + 59, vx * 6, vz * 6, 2) - 0.5) * 0.3;
      c.setRGB(v * 0.97, v * 0.96, v * 0.93);
    }
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();

  const dome = new THREE.Mesh(g, mat('granite', {
    color: 0xB6B1A7, roughness: 0.9, metalness: 0, flatShading: true, vertexColors: true,
  }));
  /* Sunk into the lowest ground anywhere around its rim, so no edge of the
     open base shows on the downhill side. */
  let low = groundHeight(seed, x, z);
  for (let k = 0; k < 32; k++){
    const a = (k / 32) * Math.PI * 2;
    low = Math.min(low, groundHeight(seed, x + Math.cos(a) * r, z + Math.sin(a) * r * 0.82));
  }
  dome.position.set(x, low - 10, z);
  /* Local +X is the face. Turned so it looks back at the garden: a
     rotation of θ about Y carries +X to (cos θ, 0, −sin θ). */
  const len = Math.hypot(x, z);
  dome.rotation.y = Math.atan2(z / len, -x / len);
  dome.receiveShadow = true;
  scene.add(dome);
  return dome;
}
