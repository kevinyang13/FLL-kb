/* Insect bodies, built from primitives at roughly the real proportions.
   Proportions are real: an egg stalk is about 8 mm, an adult's wingspan
   about 25 mm, an aphid about 2 mm. Every body is then multiplied by MACRO,
   because at true scale an aphid is two or three pixels on a phone held at
   arm's length and a child never finds it. The exaggeration is deliberate
   and it is the one place this game lies about the insects — everything the
   game says about what they do stays true. */

/** How much bigger than life the bodies are drawn. */
export const MACRO = 9;
import * as THREE from 'three';
import { mat } from '../rendering/materials.js';

const seg = (r, h, c = 7) => new THREE.CylinderGeometry(r, r, h, c);
const ball = r => new THREE.SphereGeometry(r, 10, 8);

export function eggCluster(n = 5){
  const g = new THREE.Group();
  g.scale.setScalar(MACRO);
  for (let i = 0; i < n; i++){
    const a = (i / n) * Math.PI * 2;
    const stalk = new THREE.Mesh(seg(0.0004, 0.008, 4), mat('egg'));
    stalk.position.set(Math.cos(a) * 0.004, 0.004, Math.sin(a) * 0.004);
    const e = new THREE.Mesh(ball(0.0012), mat('egg'));
    e.scale.set(1, 1.5, 1);
    e.position.set(stalk.position.x, 0.009, stalk.position.z);
    g.add(stalk, e);
  }
  g.userData.kind = 'eggs';
  return g;
}

export function larva(scale = 1){
  const g = new THREE.Group();
  const body = new THREE.Mesh(ball(0.0022), mat('larva'));
  body.scale.set(2.6, 0.9, 1);
  g.add(body);
  for (let i = 0; i < 2; i++){
    const jaw = new THREE.Mesh(new THREE.ConeGeometry(0.0005, 0.0026, 5), mat('larva'));
    jaw.rotation.z = Math.PI / 2 + (i ? 0.3 : -0.3);
    jaw.position.set(0.0062, 0, (i ? 1 : -1) * 0.0008);
    g.add(jaw);
  }
  for (let i = 0; i < 6; i++){
    const leg = new THREE.Mesh(seg(0.00018, 0.0024, 4), mat('larva'));
    leg.rotation.z = (i % 2 ? 1 : -1) * 0.9;
    leg.position.set(-0.003 + Math.floor(i / 2) * 0.003, -0.0014, (i % 2 ? 1 : -1) * 0.0016);
    g.add(leg);
  }
  g.scale.setScalar(scale * MACRO);
  g.userData.kind = 'larva';
  return g;
}

export function adultLacewing(){
  const g = new THREE.Group();
  const body = new THREE.Mesh(seg(0.0011, 0.011), mat('lacewing'));
  body.rotation.z = Math.PI / 2;
  g.add(body);
  const head = new THREE.Mesh(ball(0.0013), mat('lacewing'));
  head.position.x = 0.0062; g.add(head);
  for (let i = 0; i < 2; i++){
    const eye = new THREE.Mesh(ball(0.0006), mat('petalY', { emissive: 0x8A6A12, emissiveIntensity: 0.35 }));
    eye.position.set(0.0068, 0.0004, (i ? 1 : -1) * 0.0009); g.add(eye);
  }
  const wings = new THREE.Group();
  for (let i = 0; i < 4; i++){
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.0085, 12, 0, Math.PI), mat('wing', { side: THREE.DoubleSide }));
    w.scale.set(1, 0.42, 1);
    w.rotation.x = -Math.PI / 2;
    w.position.set(i < 2 ? 0.001 : -0.002, 0.0012, (i % 2 ? 1 : -1) * 0.0012);
    w.rotation.z = (i % 2 ? 1 : -1) * 0.25;
    w.userData.side = i % 2 ? 1 : -1;
    wings.add(w);
  }
  g.add(wings);
  g.userData.wings = wings;
  g.scale.setScalar(MACRO);
  g.userData.kind = 'adult';
  return g;
}

export function aphid(){
  const g = new THREE.Mesh(ball(0.0011), mat('aphid'));
  g.scale.set(1, 0.85, 1.25);
  const legs = new THREE.Group();
  for (let i = 0; i < 4; i++){
    const l = new THREE.Mesh(seg(0.00012, 0.0016, 4), mat('aphid'));
    l.rotation.z = (i % 2 ? 1 : -1) * 1.0;
    l.position.set((i < 2 ? -1 : 1) * 0.0008, -0.0009, (i % 2 ? 1 : -1) * 0.0008);
    legs.add(l);
  }
  g.add(legs);
  g.scale.multiplyScalar(MACRO);   // multiply: the body already has its squashed shape
  g.userData.kind = 'aphid';
  return g;
}

export function ant(){
  const g = new THREE.Group();
  [[-0.0022, 0.0011], [0, 0.0008], [0.0022, 0.0013]].forEach(([x, r]) => {
    const s = new THREE.Mesh(ball(r), mat('ant'));
    s.position.x = x; g.add(s);
  });
  for (let i = 0; i < 6; i++){
    const l = new THREE.Mesh(seg(0.00014, 0.0028, 4), mat('ant'));
    l.rotation.z = (i % 2 ? 1 : -1) * 1.1;
    l.position.set(-0.002 + Math.floor(i / 2) * 0.002, -0.001, (i % 2 ? 1 : -1) * 0.0012);
    g.add(l);
  }
  g.scale.setScalar(MACRO);
  g.userData.kind = 'ant';
  return g;
}

export function ladybug(){
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat('ladybug'));
  g.add(shell);
  const head = new THREE.Mesh(ball(0.0013), mat('ant'));
  head.position.set(0.003, 0.0004, 0); g.add(head);
  for (let i = 0; i < 6; i++){
    const a = (i / 6) * Math.PI * 2;
    const spot = new THREE.Mesh(new THREE.CircleGeometry(0.0007, 8), mat('ant'));
    spot.position.set(Math.cos(a) * 0.0017, 0.0028, Math.sin(a) * 0.0017);
    spot.rotation.x = -Math.PI / 2; g.add(spot);
  }
  g.scale.setScalar(MACRO);
  g.userData.kind = 'ladybug';
  return g;
}


/* ── the rest of the field guide ──────────────────────────── */

export function cocoon(){
  const g = new THREE.Group();
  const c = new THREE.Mesh(ball(0.0026), mat('egg', { roughness: 0.85 }));
  c.scale.set(1, 0.92, 1.05);
  g.add(c);
  // the circular lid the adult cuts on its way out
  const lid = new THREE.Mesh(new THREE.CircleGeometry(0.0011, 10), mat('larva'));
  lid.position.set(0.0023, 0.0004, 0);
  lid.rotation.y = Math.PI / 2;
  g.add(lid);
  g.scale.setScalar(MACRO);
  g.userData.kind = 'cocoon';
  return g;
}

export function mummy(){
  const g = new THREE.Mesh(ball(0.0013), mat('larva', { roughness: 0.9 }));
  g.scale.set(1.1, 0.95, 1.3);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.0004, 8), mat('ant'));
  hole.position.set(0, 0.0012, 0);
  hole.rotation.x = -Math.PI / 2;
  g.add(hole);
  g.scale.multiplyScalar(MACRO);
  g.userData.kind = 'mummy';
  return g;
}

export function ladybugLarva(){
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++){
    const seg2 = new THREE.Mesh(ball(0.0011 - i * 0.00012), mat(i % 2 ? 'ladybug' : 'ant'));
    seg2.position.x = -0.0024 + i * 0.0014;
    g.add(seg2);
    // the spines that make people think it is a pest
    for (const side of [-1, 1]){
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.00022, 0.0009, 4), mat('ant'));
      sp.position.set(seg2.position.x, 0.0006, side * 0.0009);
      sp.rotation.x = side * 0.7;
      g.add(sp);
    }
  }
  g.scale.setScalar(MACRO);
  g.userData.kind = 'ladybug-larva';
  return g;
}

export function hoverfly(){
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++){
    const band = new THREE.Mesh(seg(0.0013 - i * 0.00012, 0.0013, 8), mat(i % 2 ? 'petalY' : 'ant'));
    band.rotation.z = Math.PI / 2;
    band.position.x = -0.0022 + i * 0.0014;
    g.add(band);
  }
  const head = new THREE.Mesh(ball(0.0012), mat('ant'));
  head.position.x = 0.0032; g.add(head);
  const wings = new THREE.Group();
  for (const side of [-1, 1]){
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.0055, 10, 0, Math.PI), mat('wing', { side: THREE.DoubleSide }));
    w.scale.set(1, 0.4, 1);
    w.rotation.x = -Math.PI / 2;
    w.position.set(0, 0.0012, side * 0.0011);
    w.userData.side = side;
    wings.add(w);
  }
  g.add(wings);
  g.userData.wings = wings;
  g.scale.setScalar(MACRO);
  g.userData.kind = 'hoverfly';
  return g;
}

export function spider(){
  const g = new THREE.Group();
  const abdomen = new THREE.Mesh(ball(0.0035), mat('larva', { roughness: 0.75 }));
  abdomen.scale.set(1, 0.85, 1.2);
  g.add(abdomen);
  const head = new THREE.Mesh(ball(0.0019), mat('ant'));
  head.position.x = 0.0042; g.add(head);
  for (let i = 0; i < 8; i++){
    const side = i % 2 ? 1 : -1, n = Math.floor(i / 2);
    const leg = new THREE.Mesh(seg(0.00022, 0.009, 4), mat('ant'));
    leg.rotation.z = 0.5;
    leg.rotation.y = side * (0.5 + n * 0.35);
    leg.position.set(0.001 + n * 0.0005, 0.0012, side * 0.0022);
    g.add(leg);
  }
  g.scale.setScalar(MACRO);
  g.userData.kind = 'spider';
  return g;
}

export function mealybug(){
  const g = new THREE.Group();
  const body = new THREE.Mesh(ball(0.0011), mat('egg', { roughness: 0.95 }));
  body.scale.set(1.3, 0.8, 1);
  g.add(body);
  for (let i = 0; i < 7; i++){            // the waxy filaments round the edge
    const a = (i / 7) * Math.PI * 2;
    const f = new THREE.Mesh(seg(0.00012, 0.0011, 4), mat('egg'));
    f.position.set(Math.cos(a) * 0.0013, 0, Math.sin(a) * 0.001);
    f.rotation.z = Math.PI / 2; f.rotation.y = -a;
    g.add(f);
  }
  g.scale.setScalar(MACRO);
  g.userData.kind = 'mealybug';
  return g;
}

export function whitefly(){
  const g = new THREE.Group();
  const body = new THREE.Mesh(ball(0.0006), mat('egg'));
  g.add(body);
  for (const side of [-1, 1]){
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.0013, 8), mat('egg', { side: THREE.DoubleSide, roughness: 0.9 }));
    w.rotation.x = -Math.PI / 2;
    w.position.set(0.0002, 0.0006, side * 0.0006);
    w.rotation.z = side * 0.3;
    g.add(w);
  }
  g.scale.setScalar(MACRO);
  g.userData.kind = 'whitefly';
  return g;
}

/** Every model the scenes can name, in one table. */
export const MODELS = {
  eggCluster: () => eggCluster(5),
  larva: () => larva(1),
  cocoon, adult: adultLacewing, aphid, ant, ladybug,
  ladybugLarva, mummy, hoverfly, spider, mealybug, whitefly,
};
