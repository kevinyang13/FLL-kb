/* Where everything in the backyard stands. Pure data derived from a seed:
   the engine reads this and builds meshes, so the layout can be inspected
   and tested without a browser. Units are metres, +Y up, the bench at the
   south end where the player spawns. */
import { fbm, mulberry32 } from './noise.js';

export const YARD = { w: 26, d: 26 };

export function buildLayout(seed = 7){
  const rnd = mulberry32(seed);
  const beds = [], plants = [], flowers = [], props = [];

  // Three raised beds down the middle of the yard.
  for (let b = 0; b < 3; b++){
    const z = -7 + b * 6.5;
    beds.push({ x: 0, z, w: 9, d: 3.4, h: 0.55 });
    const n = 5;
    for (let i = 0; i < n; i++){
      const x = -3.4 + i * 1.7 + (rnd() - 0.5) * 0.3;
      plants.push({
        x, z: z + (rnd() - 0.5) * 1.6,
        height: 1.5 + rnd() * 0.9,
        lean: (rnd() - 0.5) * 0.16,
        leaves: 7 + Math.floor(rnd() * 4),
        seed: Math.floor(rnd() * 1e6),
      });
    }
  }

  // Flower border along the fence line — nectar for the adults.
  for (let i = 0; i < 14; i++){
    const t = i / 13;
    flowers.push({
      x: -10 + t * 20 + (rnd() - 0.5) * 0.8,
      z: 10.2 + (rnd() - 0.5) * 0.9,
      height: 0.55 + rnd() * 0.35,
      white: rnd() < 0.4,
    });
  }

  props.push({ kind: 'bench', x: 0, z: -11.4 });
  props.push({ kind: 'tap',   x: -8.6, z: -10.2 });
  props.push({ kind: 'pile',  x: 8.4,  z: -9.4 });

  return { seed, beds, plants, flowers, props, spawn: { x: 0, z: -9.2, yaw: 0 } };
}

/** Ground height — a gentle undulation so the lawn is not a flat plane. */
export function groundHeight(seed, x, z){
  return (fbm(seed, x * 0.07, z * 0.07, 3) - 0.5) * 0.35;
}
