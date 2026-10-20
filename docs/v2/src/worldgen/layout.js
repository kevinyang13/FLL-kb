/* Where everything in the garden stands. Pure data from a seed: the engine
   reads this and builds meshes, so the planting plan can be inspected and
   tested without a browser.

   The plan follows a sunken ornamental garden of the Butchart kind: a lawn
   with a path curving through it, deep mixed borders on both sides, specimen
   conifers for vertical punctuation, a hedge at the back, and forested slopes
   rising beyond the boundary. Dense is the whole point — bare ground between
   plants is what makes a garden read as a video game. Units are metres.

   The garden is ten times the size it first was, in both directions. It is
   NOT one plan stretched ten times: stretching gives a 500 m lawn with a
   lonely shrub border somewhere over the horizon, which reads as a playing
   field, not a garden. A real garden of this size — Butchart included — is a
   grid of garden ROOMS, each one about as big as a back yard, divided by
   hedges and joined by paths. So one bay here is the original 64 m garden,
   and the world is BAYS x BAYS of them. Every plant stays the size it was,
   the planting stays as dense as it was, and the counts scale with the area
   on their own. */
import { fbm, mulberry32 } from './noise.js';

export const BAY = 64;                         // one garden room, the original yard
export const BAYS = 10;                        // ten rooms each way: ten times bigger
export const YARD = { w: BAY * BAYS, d: BAY * BAYS };   // where the player may walk
export const GROUND = 1700;                    // how far the land is drawn

/* Foliage colours, as a palette a planting plan would actually use: several
   greens, a copper, a plum, a gold. Mixed borders get their depth from
   leaf colour far more than from flowers. */
export const FOLIAGE = [
  0x6FA33E, 0x5A8F33, 0x8CBE4C, 0xA9D05A, 0x4C7E36,
  0xC3D86A, 0xB0693F, 0x9B4A5C, 0xD9BE4A, 0x79AE72,
];
export const BLOOM = [0xE4573C, 0xE8B53A, 0xF2EFE4, 0xD4559A, 0xE87F2E, 0x9A5BC4];

/* The spine of one bay: a curve down the middle of its lawn. The amplitude
   is a half sine, so the path is back on the bay's centre line at both ends
   and the hundred bays' spines join into ten continuous walks. */
const SPINE_AMP = 5.2;
const spineX = t => Math.sin(Math.max(0, Math.min(1, t)) * Math.PI) * SPINE_AMP;

export function buildLayout(seed = 7){
  const paths = [];      // the walks: a spine down each column, a cross path per row
  const borders = [];    // ornamental planting: shrub clumps
  const conifers = [];   // specimen cones
  const trees = [];      // broadleaf canopy
  const flowerBands = [];// dense bedding, the carpets of colour
  const hedges = [];
  const blockers = [];   // circular collision: trunks and hedge ends

  const half = (BAYS - 1) / 2;
  const centre = i => (i - half) * BAY;

  /* ── one bay: the original garden, planted around its own spine ──── */
  for (let bx = 0; bx < BAYS; bx++){
    for (let bz = 0; bz < BAYS; bz++){
      const cx = centre(bx), cz = centre(bz);
      const rnd = mulberry32(seed * 7919 + bx * 131 + bz);
      const pick = arr => arr[Math.floor(rnd() * arr.length)];
      // local z runs the full depth of the bay, so bays meet without a seam
      const onPath = z => cx + spineX((z - cz + BAY / 2) / BAY);

      for (let side of [-1, 1]){
        for (let i = 0; i < 46; i++){
          const z = cz - 29 + (i / 45) * 58 + (rnd() - 0.5) * 0.9;
          const depth = rnd();                       // 0 at the lawn edge, 1 at the back
          const from = side * (3.6 + rnd() * 0.8 + depth * 9.5);  // offset from the spine
          borders.push({
            depth, from,
            out: -side,                              // which way the lawn is
            x: onPath(z) + from, z,
            r: 0.5 + depth * 1.5 + rnd() * 0.5,      // bigger shrubs behind smaller ones
            h: 0.5 + depth * 1.9 + rnd() * 0.6,
            color: pick(FOLIAGE),
            blobs: 11 + Math.floor(rnd() * 8),
            seed: Math.floor(rnd() * 1e6),
          });
        }
        // bedding carpets hugging the lawn edge
        for (let i = 0; i < 9; i++){
          const z = cz - 26 + (i / 8) * 52;
          flowerBands.push({
            x: onPath(z) + side * (2.6 + rnd() * 0.7), z,
            w: 1.5 + rnd() * 1.2, d: 2.2 + rnd() * 1.6,
            color: pick(BLOOM), count: 26 + Math.floor(rnd() * 20),
            seed: Math.floor(rnd() * 1e6),
          });
        }
        // specimen conifers, the dark vertical accents
        for (let i = 0; i < 7; i++){
          const z = cz - 24 + (i / 6) * 50 + (rnd() - 0.5) * 2;
          const x = onPath(z) + side * (5.4 + rnd() * 5);
          conifers.push({ x, z, h: 2.6 + rnd() * 3.4, r: 0.5 + rnd() * 0.35,
                          color: pick([0x4E8440, 0x5C9A4C, 0x6AA557]) });
          blockers.push({ x, z, r: 0.55 });
        }
        // canopy trees at the back of each border
        for (let i = 0; i < 6; i++){
          const z = cz - 27 + (i / 5) * 54 + (rnd() - 0.5) * 2.5;
          const x = onPath(z) + side * (12 + rnd() * 7);
          trees.push({ x, z, out: -side, h: 5 + rnd() * 4, spread: 2 + rnd() * 1.6,
                       color: pick(FOLIAGE), seed: Math.floor(rnd() * 1e6) });
          blockers.push({ x, z, r: 0.7 });
        }
        // the hedge wall between this room and the next
        hedges.push({ x: cx + side * 26, z: cz, out: -side, w: 1.1, d: 56, h: 1.9 });
      }
    }
  }

  /* ── the walks: ten spines down the columns, one cross path per row ── */
  for (let bx = 0; bx < BAYS; bx++){
    const cx = centre(bx), pts = [];
    for (let bz = 0; bz < BAYS; bz++){
      const cz = centre(bz);
      for (let i = 0; i < 8; i++){
        const t = i / 8;
        pts.push({ x: cx + spineX(t), z: cz - BAY / 2 + t * BAY });
      }
    }
    pts.push({ x: cx, z: centre(BAYS - 1) + BAY / 2 });
    paths.push(pts);
  }
  for (let bz = 0; bz < BAYS; bz++){
    const cz = centre(bz) + BAY / 2, pts = [];      // on the seam between rows
    for (let i = 0; i <= BAYS * 2; i++){
      const t = i / (BAYS * 2);
      pts.push({ x: -YARD.w / 2 + t * YARD.w, z: cz });
    }
    paths.push(pts);
  }

  /* ── the forested slope beyond the boundary ──────────────── */
  const frnd = mulberry32(seed + 991);
  const forest = [];
  for (let i = 0; i < 15000; i++){
    const a = frnd() * Math.PI * 2;
    const r = 300 + frnd() * 160;
    forest.push({
      x: Math.cos(a) * r, z: Math.sin(a) * r,
      h: 8 + frnd() * 13, r: 1.3 + frnd() * 1.2,
      color: [0x4A7A4C, 0x3F6C43, 0x55885A][Math.floor(frnd() * 3)],
    });
  }

  return { seed, paths, borders, flowerBands, conifers, trees,
           hedges, forest, blockers,
           /* On a room's own spine, at its near end, looking down it. The
              bay centres fall at +/-32, +/-96 ... — never at 0 — so spawning
              at the origin put the player in the 12 m gap between two hedge
              rows, staring down a corridor with the whole garden behind the
              hedges. */
           spawn: { x: centre(BAYS / 2 - 1), z: centre(BAYS / 2 - 1) - BAY / 2 + 6, yaw: Math.PI } };
}

/** Ground height — a bowl, so the lawn sits lower than the borders. The
    frequencies are a tenth of what they were, because the garden is ten
    times wider: the land has to undulate over the whole garden rather than
    once per bay, or every room sits in its own pit. */
export function groundHeight(seed, x, z){
  const bowl = Math.min(0, (Math.hypot(x * 0.0055, z * 0.005) - 0.55)) * -2.2;
  return (fbm(seed, x * 0.005, z * 0.005, 3) - 0.5) * 0.5 - bowl * 0.35;
}
