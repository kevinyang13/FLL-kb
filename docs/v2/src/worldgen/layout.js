/* Where everything in the garden stands. Pure data from a seed: the engine
   reads this and builds meshes, so the planting plan can be inspected and
   tested without a browser.

   The plan follows a sunken ornamental garden of the Butchart kind: a lawn
   with a path curving through it, deep mixed borders on both sides, specimen
   conifers for vertical punctuation, a hedge at the back, and forested slopes
   rising beyond the boundary. Dense is the whole point — bare ground between
   plants is what makes a garden read as a video game. Units are metres. */
import { fbm, mulberry32 } from './noise.js';

export const YARD = { w: 64, d: 64 };          // where the player may walk
export const GROUND = 170;                     // how far the land is drawn

/* Foliage colours, as a palette a planting plan would actually use: several
   greens, a copper, a plum, a gold. Mixed borders get their depth from
   leaf colour far more than from flowers. */
export const FOLIAGE = [
  0x6FA33E, 0x5A8F33, 0x8CBE4C, 0xA9D05A, 0x4C7E36,
  0xC3D86A, 0xB0693F, 0x9B4A5C, 0xD9BE4A, 0x79AE72,
];
export const BLOOM = [0xE4573C, 0xE8B53A, 0xF2EFE4, 0xD4559A, 0xE87F2E, 0x9A5BC4];

export function buildLayout(seed = 7){
  const rnd = mulberry32(seed);
  const pick = arr => arr[Math.floor(rnd() * arr.length)];

  /* ── the path: a curve down the middle of the lawn ───────── */
  const path = [];
  for (let i = 0; i <= 14; i++){
    const t = i / 14;
    path.push({ x: Math.sin(t * 3.1) * 5.2 + (rnd() - 0.5) * 0.4, z: -16 + t * 34 });
  }

  const borders = [];    // ornamental planting: shrub clumps
  const conifers = [];   // specimen cones
  const trees = [];      // broadleaf canopy
  const flowerBands = [];// dense bedding, the carpets of colour
  const hedges = [];
  const blockers = [];   // circular collision: trunks and hedge ends

  /* ── mixed borders either side of the lawn ───────────────── */
  const onPath = z => {
    const t = (z + 16) / 34;
    return Math.sin(Math.max(0, Math.min(1, t)) * 3.1) * 5.2;
  };
  for (let side of [-1, 1]){
    for (let i = 0; i < 46; i++){
      const z = -17 + (i / 45) * 36 + (rnd() - 0.5) * 0.9;
      const edge = onPath(z) + side * (3.6 + rnd() * 0.8);
      const depth = rnd();                       // 0 at the lawn edge, 1 at the back
      const x = edge + side * depth * 9.5;
      borders.push({
        depth,                                   // 0 at the lawn edge, 1 at the back
        x, z,
        r: 0.5 + depth * 1.5 + rnd() * 0.5,      // bigger shrubs behind smaller ones
        h: 0.5 + depth * 1.9 + rnd() * 0.6,
        color: pick(FOLIAGE),
        blobs: 11 + Math.floor(rnd() * 8),
        seed: Math.floor(rnd() * 1e6),
      });
    }
    // bedding carpets hugging the lawn edge
    for (let i = 0; i < 9; i++){
      const z = -15 + (i / 8) * 31;
      flowerBands.push({
        x: onPath(z) + side * (2.6 + rnd() * 0.7), z,
        w: 1.5 + rnd() * 1.2, d: 2.2 + rnd() * 1.6,
        color: pick(BLOOM), count: 26 + Math.floor(rnd() * 20),
        seed: Math.floor(rnd() * 1e6),
      });
    }
    // specimen conifers, the dark vertical accents
    for (let i = 0; i < 7; i++){
      const z = -14 + (i / 6) * 30 + (rnd() - 0.5) * 2;
      const x = onPath(z) + side * (5.4 + rnd() * 5);
      conifers.push({ x, z, h: 2.6 + rnd() * 3.4, r: 0.5 + rnd() * 0.35, color: pick([0x4E8440, 0x5C9A4C, 0x6AA557]) });
      blockers.push({ x, z, r: 0.55 });
    }
    // canopy trees at the back of each border
    for (let i = 0; i < 6; i++){
      const z = -16 + (i / 5) * 33 + (rnd() - 0.5) * 2.5;
      const x = onPath(z) + side * (12 + rnd() * 7);
      trees.push({ x, z, h: 5 + rnd() * 4, spread: 2 + rnd() * 1.6, color: pick(FOLIAGE), seed: Math.floor(rnd() * 1e6) });
      blockers.push({ x, z, r: 0.7 });
    }
    hedges.push({ x: side * 21, z: 2, w: 1.1, d: 34, h: 1.9 });
  }

  /* ── the forested slope beyond the boundary ──────────────── */
  const forest = [];
  for (let i = 0; i < 150; i++){
    const a = rnd() * Math.PI * 2;
    const r = 30 + rnd() * 16;
    forest.push({
      x: Math.cos(a) * r, z: Math.sin(a) * r,
      h: 8 + rnd() * 13, r: 1.3 + rnd() * 1.2,
      color: pick([0x4A7A4C, 0x3F6C43, 0x55885A]),   // reads as distance haze, not a hole in the sky
    });
  }

  return { seed, path, borders, flowerBands, conifers, trees,
           hedges, forest, blockers, spawn: { x: 0, z: -14, yaw: Math.PI } };
}

/** Ground height — a bowl, so the lawn sits lower than the borders. */
export function groundHeight(seed, x, z){
  const bowl = Math.min(0, (Math.hypot(x * 0.055, z * 0.05) - 0.55)) * -2.2;
  return (fbm(seed, x * 0.05, z * 0.05, 3) - 0.5) * 0.5 - bowl * 0.35;
}
