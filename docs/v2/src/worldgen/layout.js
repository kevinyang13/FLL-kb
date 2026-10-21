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

/* ── the landscape the garden sits in ──────────────────────────────────
   The garden fills the middle 640 m. Beyond it, and cut into it, is a
   landscape: a mountain wall across the north, a waterfall off its
   escarpment, a river running south-east from the plunge pool, and the lake
   it empties into inside the garden itself.

   All of it lives in `groundHeight`, which is the single source of truth for
   where the ground is. Every plant, the player's feet and the terrain mesh
   all read that one function, so carving a river bed here removes the plants
   from it and lets the player walk down to the water without another line of
   code. Water is the one thing drawn separately, because a water surface is
   flat and the bed under it is not. */
export const WATER = -6;                       // the lake's surface

export const LAKE = { x: 112, z: 128, r: 78, depth: 9 };

/* The river, as the line its centre follows: plunge pool to lake. */
export const RIVER = {
  width: 26, bank: 42, depth: 3.4,
  from: -1.6,                                  // water surface at the pool
  pts: [
    { x: -70, z: -404 }, { x: -62, z: -330 }, { x: -34, z: -248 },
    { x: -40, z: -150 }, { x: -4, z: -58 }, { x: 44, z: 18 },
    { x: 86, z: 86 }, { x: 112, z: 128 },
  ],
};

/* The escarpment the waterfall comes off, and the fall itself. */
export const CLIFF = { z: -424, fade: 7, h: 44, x: -70, reach: 150 };
export const FALL = { x: -70, z: CLIFF.z + 2, top: 40, foot: RIVER.from, width: 17 };

/* The plunge pool, treated as a small lake of its own: it is drawn as a
   disc, so it needs a basin cut to fit that disc exactly. */
export const POOL = { x: -70, z: CLIFF.z + 14, r: 22, depth: 4.5, level: RIVER.from };

/* How far past a water's edge its shore is shaped, as a multiple of the
   body's own size. */
const SHORE = 1.9;

/* The mountain wall. Peaks are summed, so overlapping ones make a ridge
   rather than a row of cones. */
export const MOUNTAINS = [
  { x: -430, z: -620, h: 210, r: 330 }, { x: -140, z: -700, h: 250, r: 360 },
  { x: 170, z: -660, h: 225, r: 340 },  { x: 470, z: -580, h: 190, r: 300 },
  { x: -70, z: -520, h: 120, r: 190 },  { x: 300, z: -470, h: 95,  r: 165 },
  { x: -690, z: -180, h: 170, r: 300 }, { x: 700, z: -120, h: 160, r: 290 },
];

/* The granite dome east of the garden, after Half Dome: a rounded back and
   one sheer face, as if the other half had been sliced off. The height field
   cannot make it — a vertex every 4 m can rise and fall but cannot stand up
   straight, so a 200 m wall would come out as a smeared ramp — so it is its
   own mesh, standing on the land rather than part of it.

   It is close on purpose. Walking, the fog closes at 420 m, and a landmark
   on the horizon would only ever be seen from the air. Here the face is
   about 200 m beyond the east fence and turned to look back at the garden,
   so it stands over the eastern rooms and the lake. `cut` is where the face
   is, as a fraction of the radius out from the centre. */
/* Wider than it is tall: the first one was 300 m across and 285 m high, and
   from the air it read as a grey pillar rather than a dome. The real one is
   about twice as wide as its face is high. */
export const DOME = { x: 590, z: 40, r: 230, h: 210, cut: 0.3 };

/** Inside the dome's footprint, where nothing else may grow. */
export const inDome = (x, z) => Math.hypot(x - DOME.x, z - DOME.z) < DOME.r * 1.02;

/** Stone colours: granite greys, a little warmth in some of them. */
export const STONE = [0x9C978E, 0x8A867F, 0xA8A196, 0x7E7A73, 0xB3AEA4, 0x958A7C];

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
  /* Nothing is planted in the lake or the river. One test, applied as each
     plant is placed, which is why cutting the water into `groundHeight`
     rather than drawing it on top was worth the trouble. */
  const dry = (x, z, m) => !underWater(seed, x, z, m === undefined ? 0.7 : m);
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
          const z = cz - 31 + (i / 45) * 62 + (rnd() - 0.5) * 0.9;
          const depth = rnd();                       // 0 at the lawn edge, 1 at the back
          const from = side * (3.6 + rnd() * 0.8 + depth * 9.5);  // offset from the spine
          if (!dry(onPath(z) + from, z)) continue;
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
          const z = cz - 30 + (i / 8) * 60;
          const fx = onPath(z) + side * (2.6 + rnd() * 0.7);
          if (!dry(fx, z, 1.2)) continue;
          flowerBands.push({
            x: fx, z,
            w: 1.5 + rnd() * 1.2, d: 2.2 + rnd() * 1.6,
            color: pick(BLOOM), count: 26 + Math.floor(rnd() * 20),
            seed: Math.floor(rnd() * 1e6),
          });
        }
        // specimen conifers, the dark vertical accents
        for (let i = 0; i < 7; i++){
          const z = cz - 29 + (i / 6) * 58 + (rnd() - 0.5) * 2;
          const x = onPath(z) + side * (5.4 + rnd() * 5);
          if (!dry(x, z)) continue;
          conifers.push({ x, z, h: 2.6 + rnd() * 3.4, r: 0.5 + rnd() * 0.35,
                          color: pick([0x4E8440, 0x5C9A4C, 0x6AA557]) });
          blockers.push({ x, z, r: 0.55 });
        }
        // canopy trees at the back of each border
        for (let i = 0; i < 6; i++){
          const z = cz - 30 + (i / 5) * 60 + (rnd() - 0.5) * 2.5;
          const x = onPath(z) + side * (12 + rnd() * 7);
          if (!dry(x, z)) continue;
          trees.push({ x, z, out: -side, h: 5 + rnd() * 4, spread: 2 + rnd() * 1.6,
                       color: pick(FOLIAGE), seed: Math.floor(rnd() * 1e6) });
          blockers.push({ x, z, r: 0.7 });
        }
        /* The grove between this room and the next. It fills the band the
           hedge used to stand in, from 19 m out to the bay boundary at 32 m,
           over the full depth of the bay — so it meets the neighbouring
           room's grove head on and the two read as one wood. Woodland
           planting, not bedding: big shrubs under tall trees. */
        for (let i = 0; i < 20; i++){
          const z = cz - 32 + rnd() * 64;
          const from = side * (19 + rnd() * 13);
          const depth = 0.6 + rnd() * 0.4;           // all of it is back-of-border
          if (!dry(cx + from, z)) continue;
          borders.push({
            depth, from, out: -side,
            x: cx + from, z,
            r: 1.3 + rnd() * 1.4,
            h: 1.6 + rnd() * 2.2,
            color: pick(FOLIAGE),
            blobs: 13 + Math.floor(rnd() * 9),
            seed: Math.floor(rnd() * 1e6),
          });
        }
        for (let i = 0; i < 5; i++){
          const z = cz - 32 + rnd() * 64;
          const x = cx + side * (20 + rnd() * 12);
          if (!dry(x, z)) continue;
          trees.push({ x, z, out: -side, h: 6 + rnd() * 5, spread: 2.4 + rnd() * 1.8,
                       color: pick(FOLIAGE), seed: Math.floor(rnd() * 1e6) });
          blockers.push({ x, z, r: 0.7 });
        }
        for (let i = 0; i < 4; i++){
          const z = cz - 32 + rnd() * 64;
          const x = cx + side * (19.5 + rnd() * 12);
          if (!dry(x, z)) continue;
          conifers.push({ x, z, h: 3.4 + rnd() * 4, r: 0.6 + rnd() * 0.4,
                          color: pick([0x4E8440, 0x5C9A4C, 0x6AA557]) });
          blockers.push({ x, z, r: 0.55 });
        }
      }

      /* Hedges, kept as a feature rather than a wall. A spider's web lives in
         one, and so do some of the scattered cocoons, so the anchor has to go
         on existing — but one every third room, set inside it as a backdrop,
         divides nothing. */
      if (bx % 3 === 0 && bz % 3 === 0){
        if (dry(cx + 15, cz - 6, 1.5)) hedges.push({ x: cx + 15, z: cz - 6, out: -1, w: 1.1, d: 20, h: 1.9 });
        if (dry(cx - 15, cz + 9, 1.5)) hedges.push({ x: cx - 15, z: cz + 9, out: 1, w: 1.1, d: 20, h: 1.9 });
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

  /* ── the rainforest, between the garden and the mountains ──
     A band across the north, thickest around the plunge pool where the spray
     keeps everything wet. Far taller and far denser than the garden's trees,
     in deeper greens, so the skyline reads as jungle rising to the
     escarpment rather than as more of the same garden. Its southern edge
     reaches into the walkable garden, so you can stand at the boundary and
     look up at it; the rest is scenery. */
  const rainforest = [];
  const jrnd = mulberry32(seed + 4441);
  const jpick = arr => arr[Math.floor(jrnd() * arr.length)];
  const JUNGLE = [0x2F6B33, 0x3B7D3A, 0x275C2E, 0x4A8C45, 0x1F4F27, 0x58A24E];
  for (let i = 0; i < 3000; i++){
    const x = -520 + jrnd() * 1040;
    const z = -436 + jrnd() * 140;
    // thickest near the plunge pool, thinning out east and west
    const wet = 1 - Math.min(1, Math.abs(x - FALL.x) / 420);
    if (jrnd() > 0.35 + wet * 0.6) continue;
    if (!dry(x, z, 1)) continue;
    rainforest.push({
      x, z, h: 17 + jrnd() * 19, spread: 3.4 + jrnd() * 3.4,
      color: jpick(JUNGLE), seed: Math.floor(jrnd() * 1e6),
    });
    if (Math.abs(x) < YARD.w / 2 && Math.abs(z) < YARD.d / 2) blockers.push({ x, z, r: 0.9 });
  }
  // the understory: the same clump machinery as the borders, planted dense
  // and deep so it never grows a perch and never claims to be bare soil
  for (let i = 0; i < 2600; i++){
    const x = -520 + jrnd() * 1040;
    const z = -434 + jrnd() * 136;
    if (!dry(x, z)) continue;
    borders.push({
      depth: 0.95, from: 99, out: -1, x, z,
      r: 1.6 + jrnd() * 2.2, h: 2.2 + jrnd() * 3.4,
      color: jpick(JUNGLE), blobs: 14 + Math.floor(jrnd() * 10),
      seed: Math.floor(jrnd() * 1e6),
    });
  }

  /* ── the forested slope beyond the boundary ──────────────── */
  const frnd = mulberry32(seed + 991);
  const forest = [];
  for (let i = 0; i < 15000; i++){
    const a = frnd() * Math.PI * 2;
    const r = 300 + frnd() * 160;
    const fx = Math.cos(a) * r, fz = Math.sin(a) * r;
    if (!dry(fx, fz) || inDome(fx, fz)) continue;
    forest.push({
      x: fx, z: fz,
      h: 8 + frnd() * 13, r: 1.3 + frnd() * 1.2,
      color: [0x4A7A4C, 0x3F6C43, 0x55885A][Math.floor(frnd() * 3)],
    });
  }

  const rocks = placeRocks(seed, centre, blockers, dry);

  return { seed, paths, borders, flowerBands, conifers, trees,
           hedges, forest, rainforest, blockers, rocks,
           /* On a room's own spine, at its near end, looking down it. The
              bay centres fall at +/-32, +/-96 ... — never at 0 — so spawning
              at the origin put the player in the 12 m gap between two hedge
              rows, staring down a corridor with the whole garden behind the
              hedges. */
           /* On a room's own spine, at its near end, looking down it. The bay
              centres fall at +/-32, +/-96 ... — never at 0 — so spawning at
              the origin put the player in the gap between two rooms. It also
              has to be clear of the river, which now runs diagonally through
              the middle of the garden. */
           spawn: { x: centre(2), z: centre(2) - BAY / 2 + 6, yaw: Math.PI } };
}

/** Stone, in three sizes the engine draws differently:
      pebble  — under half a metre, walked past, no shadow
      boulder — the ones you walk round, so each is also a blocker
      outcrop — mountain-sized, scenery only, never in reach

    Every pass draws from its own generator, never from the planting's, so
    adding stone moved no plant and no insect: the garden is the same garden
    with rocks in it. Boulders keep clear of trunks, of each other and of the
    paths, because a boulder on a trunk hides the insects on the bark and one
    on a path is a wall across the walk. */
function placeRocks(seed, centre, blockers, dry){
  const rocks = [];
  const S = (rnd, kind, x, z, size, flat = 0.62) => {
    const w = size * (0.8 + rnd() * 0.5);
    rocks.push({
      kind, x, z, w, d: size * (0.7 + rnd() * 0.5), h: size * flat * (0.75 + rnd() * 0.5),
      yaw: rnd() * Math.PI * 2, tilt: (rnd() - 0.5) * 0.35,
      color: STONE[Math.floor(rnd() * STONE.length)],
    });
    return w;
  };

  // blockers in an 8 m grid, so "is this spot clear?" is not a 10,000-item scan
  const grid = new Map();
  const key = (x, z) => Math.floor(x / 8) + ',' + Math.floor(z / 8);
  const addBlock = b => {
    const k = key(b.x, b.z);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(b);
  };
  blockers.forEach(addBlock);
  const clear = (x, z, r) => {
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++){
      for (const b of grid.get(key(x + i * 8, z + j * 8)) || []){
        if (Math.hypot(x - b.x, z - b.z) < r + b.r + 0.6) return false;
      }
    }
    return true;
  };
  const boulder = (rnd, x, z, size, flat) => {
    if (!clear(x, z, size)) return false;
    const w = S(rnd, 'boulder', x, z, size, flat);
    const b = { x, z, r: w * 0.78 };
    blockers.push(b); addBlock(b);
    return true;
  };

  /* Paths: a spine down each column of rooms and a cross walk on every seam
     between rows. Only the walkable garden has them. */
  const inYard = (x, z) => Math.abs(x) < YARD.w / 2 && Math.abs(z) < YARD.d / 2;
  const nearPath = (x, z, m) => {
    if (!inYard(x, z)) return false;
    const bx = Math.min(BAYS - 1, Math.max(0, Math.floor((x + YARD.w / 2) / BAY)));
    const bz = Math.min(BAYS - 1, Math.max(0, Math.floor((z + YARD.d / 2) / BAY)));
    const spine = centre(bx) + spineX((z - centre(bz) + BAY / 2) / BAY);
    const seam = (z + YARD.d / 2) % BAY;
    return Math.abs(x - spine) < m || seam < m || seam > BAY - m;
  };

  /* ── the garden rooms: stones among the shrubs, a group in the grove ── */
  const half = (BAYS - 1) / 2;
  for (let bx = 0; bx < BAYS; bx++){
    for (let bz = 0; bz < BAYS; bz++){
      const cx = (bx - half) * BAY, cz = (bz - half) * BAY;
      const rnd = mulberry32(seed * 104729 + bx * 977 + bz * 31 + 17);
      const onPath = z => cx + spineX((z - cz + BAY / 2) / BAY);
      for (const side of [-1, 1]){
        /* Behind the front row of the border, not in front of it: the front
           row is where the insects sit, and a stone at its foot is between
           the player and the leaf. */
        for (let i = 0; i < 5; i++){
          const z = cz - 30 + rnd() * 60;
          const x = onPath(z) + side * (6 + rnd() * 5);
          if (dry(x, z)) S(rnd, 'pebble', x, z, 0.18 + rnd() * 0.28);
        }
      }
      /* Three rooms in four have a group of stones in a grove: one boulder
         with a few smaller ones gathered at its foot, which is how stone
         lies when it has been there a long time. */
      if (rnd() < 0.75){
        /* A grove is thick with trunks, so a first spot is usually taken:
           a few goes at finding a clear one before the room goes without. */
        let gx, gz, placed = false;
        for (let k = 0; k < 6 && !placed; k++){
          const side = rnd() < 0.5 ? -1 : 1;
          gx = cx + side * (22 + rnd() * 8); gz = cz - 26 + rnd() * 52;
          placed = dry(gx, gz) && boulder(rnd, gx, gz, 0.9 + rnd() * 1.1);
        }
        if (placed){
          const n = 3 + Math.floor(rnd() * 4);
          for (let i = 0; i < n; i++){
            const a = rnd() * Math.PI * 2, rr = 1.6 + rnd() * 2;
            const x = gx + Math.cos(a) * rr, z = gz + Math.sin(a) * rr;
            if (dry(x, z)) S(rnd, 'pebble', x, z, 0.2 + rnd() * 0.3);
          }
        }
      }
    }
  }

  /* ── the shores: river banks, the lake, the plunge pool ──
     Stone collects at the waterline, so these are placed by depth rather
     than by distance: from a metre and a half of dry bank to half a metre
     under. Boulders only now and then, so the bank stays open to walk down
     into the water. */
  const shore = mulberry32(seed + 5003);
  const P = RIVER.pts;
  const tries = [];
  for (let i = 0; i < 900; i++){
    const seg = Math.floor(shore() * (P.length - 1)), t = shore();
    const a = P[seg], b = P[seg + 1];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    const nx = -(b.z - a.z) / len, nz = (b.x - a.x) / len;
    const off = (shore() < 0.5 ? -1 : 1) * (RIVER.width / 2 - 1.5 + shore() * 6);
    tries.push([a.x + (b.x - a.x) * t + nx * off, a.z + (b.z - a.z) * t + nz * off]);
  }
  for (let i = 0; i < 520; i++){
    const a = shore() * Math.PI * 2, r = LAKE.r - 2 + shore() * 7;
    tries.push([LAKE.x + Math.cos(a) * r, LAKE.z + Math.sin(a) * r]);
  }
  for (let i = 0; i < 160; i++){
    const a = shore() * Math.PI * 2, r = POOL.r - 2 + shore() * 8;
    tries.push([POOL.x + Math.cos(a) * r, POOL.z + Math.sin(a) * r]);
  }
  for (const [x, z] of tries){
    const depth = waterDepth(seed, x, z);
    if (depth < -1.5 || depth > 0.5 || nearPath(x, z, 1.8)) continue;
    if (shore() < 0.12) boulder(shore, x, z, 0.8 + shore() * 1.2, 0.7);
    else S(shore, 'pebble', x, z, 0.2 + shore() * 0.35, 0.65);
  }

  /* ── the escarpment: rock that has come off the cliff ──
     Big blocks at the foot of the fall, either side of the pool, thinning
     out down the valley. Inside the part of the valley you can walk. */
  const fall = mulberry32(seed + 6007);
  for (let i = 0; i < 300; i++){
    const x = FALL.x + (fall() - 0.5) * 220;
    const z = CLIFF.z + 6 + Math.pow(fall(), 1.8) * 90;
    if (Math.abs(x - FALL.x) < FALL.width && z < CLIFF.z + 30) continue;   // not across the fall
    if (!dry(x, z, 0.2) || nearPath(x, z, 1.8)) continue;
    const near = 1 - (z - CLIFF.z) / 100;
    if (fall() < 0.45) boulder(fall, x, z, 1 + fall() * 3.2 * near + 0.4, 0.6);
    else S(fall, 'pebble', x, z, 0.25 + fall() * 0.4);
  }

  /* ── the mountains: outcrops wherever the land has climbed ──
     Above the tree line nothing hides the rock, so this is where it shows
     most. Out of reach, so no blockers. */
  /* In clusters, not one by one: evenly sprinkled single rocks read from
     the air as grey polka dots on a green hill. A cluster is a crag — a
     big block with smaller ones broken off around it. */
  const mtn = mulberry32(seed + 8009);
  for (let i = 0; i < 1400; i++){
    const x = (mtn() - 0.5) * (GROUND - 80), z = (mtn() - 0.5) * (GROUND - 80);
    if (Math.abs(x) < YARD.w / 2 + 40 && Math.abs(z) < YARD.d / 2 + 40) continue;
    if (inDome(x, z)) continue;
    const y = groundHeight(seed, x, z);
    if (y < 30) continue;
    const big = 8 + mtn() * 14 * Math.min(1, y / 140);
    S(mtn, 'outcrop', x, z, big, 0.7);
    const n = 2 + Math.floor(mtn() * 4);
    for (let k = 0; k < n; k++){
      const a = mtn() * Math.PI * 2, rr = big * (0.8 + mtn() * 0.9);
      S(mtn, 'outcrop', x + Math.cos(a) * rr, z + Math.sin(a) * rr, big * (0.3 + mtn() * 0.35), 0.6);
    }
  }

  /* ── the talus under the dome's face ──
     The slab that fell off the face is still lying at its foot: the biggest
     blocks against the wall, smaller ones further out. */
  const tal = mulberry32(seed + 9011);
  const len = Math.hypot(DOME.x, DOME.z);
  const fx = -DOME.x / len, fz = -DOME.z / len;          // the way the face looks
  const across = DOME.r * Math.sqrt(1 - DOME.cut * DOME.cut) * 0.82;
  for (let i = 0; i < 320; i++){
    const u = (tal() - 0.5) * 2 * across;
    const out = Math.pow(tal(), 1.6) * 60;
    const d = DOME.r * DOME.cut + 2 + out;
    const x = DOME.x + fx * d - fz * u, z = DOME.z + fz * d + fx * u;
    if (inYard(x, z) || !dry(x, z)) continue;
    S(tal, 'outcrop', x, z, 1.4 + tal() * 7 * (1 - out / 70), 0.6);
  }
  return rocks;
}

const smooth = t => { const u = Math.max(0, Math.min(1, t)); return u * u * (3 - 2 * u); };

/** Distance from (x,z) to the river's centre line, and how far along it. */
function onRiver(x, z){
  let best = Infinity, bestT = 0;
  const P = RIVER.pts;
  for (let i = 0; i < P.length - 1; i++){
    const a = P[i], b = P[i + 1];
    const dx = b.x - a.x, dz = b.z - a.z;
    const len2 = dx * dx + dz * dz;
    let t = ((x - a.x) * dx + (z - a.z) * dz) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + dx * t, pz = a.z + dz * t;
    const d = Math.hypot(x - px, z - pz);
    if (d < best){ best = d; bestT = (i + t) / (P.length - 1); }
  }
  return { d: best, t: bestT };
}

/** The river's water surface: a steady fall from the plunge pool to the lake. */
export const riverSurface = t => RIVER.from + (WATER - RIVER.from) * t;

/** Ground height — the one place that says where the land is.

    A bowl for the garden, the mountain wall and its escarpment added on top,
    then the lake basin and the river bed cut back out of whatever that came
    to. Cutting last matters: a river carved before the mountains were added
    would be buried by them. */
export function groundHeight(seed, x, z){
  /* The garden: frequencies a tenth of the original, because the garden is
     ten times wider — the land has to undulate over the whole garden rather
     than once per room. */
  const bowl = Math.min(0, (Math.hypot(x * 0.0055, z * 0.005) - 0.55)) * -2.2;
  let h = (fbm(seed, x * 0.005, z * 0.005, 3) - 0.5) * 0.5 - bowl * 0.35;

  // the mountain wall, summed so overlapping peaks make a ridge
  let m = 0;
  for (const p of MOUNTAINS){
    const d = Math.hypot(x - p.x, z - p.z);
    if (d >= p.r) continue;
    const f = 1 - d / p.r;
    m += p.h * f * f * (0.75 + 0.25 * fbm(seed + 3, x * 0.004, z * 0.004, 2));
  }
  // the escarpment: a hard step, so the waterfall has a face to come off
  const reach = smooth(1 - Math.abs(x - CLIFF.x) / CLIFF.reach);
  m += CLIFF.h * reach * smooth((CLIFF.z + CLIFF.fade - z) / (CLIFF.fade * 2));
  h += m;

  /* ── the water ──────────────────────────────────────────
     Every body of water is cut to fit the shape that is DRAWN over it, and
     the ground around it is pulled down towards the water's edge but never
     below it. That is the whole rule, and it is what stops "there is water
     here" and "water is drawn here" disagreeing: inside the drawn shape the
     bed is under the surface, outside it the ground is above the surface. */
  const ld = Math.hypot(x - LAKE.x, z - LAKE.z);
  const pd = Math.hypot(x - POOL.x, z - POOL.z);
  const r = onRiver(x, z);
  const rs = riverSurface(r.t);
  const hw = RIVER.width / 2;
  const inLake = ld < LAKE.r, inPool = pd < POOL.r, inRiver = r.d < hw;

  /* Each bed is a half ellipse that meets its own surface exactly at the rim
     of the shape drawn over it, so the shoreline lands on that rim rather
     than somewhere inside it. The lake used to reach water level at 69 m
     while its disc was drawn to 81 m. */
  if (inLake) h = Math.min(h, WATER - LAKE.depth * Math.sqrt(Math.max(0, 1 - (ld / LAKE.r) ** 2)));
  if (inPool) h = Math.min(h, POOL.level - POOL.depth * Math.sqrt(Math.max(0, 1 - (pd / POOL.r) ** 2)));
  if (inRiver) h = Math.min(h, rs - RIVER.depth * Math.sqrt(Math.max(0, 1 - (r.d / hw) ** 2)));

  if (!inLake && !inPool && !inRiver){
    let f = 0, edge = -Infinity;
    if (ld < LAKE.r * SHORE){
      f = Math.max(f, smooth((LAKE.r * SHORE - ld) / (LAKE.r * (SHORE - 1))));
      edge = Math.max(edge, WATER);
    }
    if (pd < POOL.r * SHORE){
      f = Math.max(f, smooth((POOL.r * SHORE - pd) / (POOL.r * (SHORE - 1))));
      edge = Math.max(edge, POOL.level);
    }
    if (r.d < RIVER.bank){
      f = Math.max(f, smooth((RIVER.bank - r.d) / (RIVER.bank - hw)));
      edge = Math.max(edge, rs);
    }
    if (edge > -Infinity){
      h = Math.min(h, h * (1 - f) + edge * f);   // slope down to the water
      h = Math.max(h, edge + 0.04);              // and never below it
    }
  }
  return h;
}

/** The height of the water surface over this spot, or -Infinity where there
    is none. Depth alone is not enough once the player can swim: floating
    means putting their eyes just above THIS, wherever they are.

    This is the surface that is actually DRAWN: inside the lake disc, inside
    the plunge pool, or within half the river's width of its centre line.
    Nothing wider. It used to answer for the whole shaped shore, 42 m either
    side of the river against a ribbon 26 m wide, so there was a trench along
    the river the game thought was flooded and drew as dry grass — you could
    stand in it, be told you were swimming, and see lawn in every direction.

    The lake wins where the two overlap. Taking the higher of the two put the
    river's surface about 15 cm above the lake's at the mouth, which is a
    step in the water where a river should simply arrive. */
export function waterLevel(seed, x, z){
  if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r) return WATER;
  let y = -Infinity;
  if (Math.hypot(x - POOL.x, z - POOL.z) < POOL.r) y = POOL.level;
  const r = onRiver(x, z);
  if (r.d < RIVER.width / 2) y = Math.max(y, riverSurface(r.t));
  return y;
}

/** Depth of water over this spot, SIGNED: positive means that many metres
    under the surface, negative means that many metres of dry bank above it,
    and -Infinity means there is no lake or river anywhere near. The sign is
    the whole point — "how far above the waterline" is what tells a plant it
    is safe, and clamping it at zero once wiped out every plant in the
    garden, because then everywhere was at the waterline.

    Derived from `waterLevel` rather than worked out separately, so the
    surface the player floats on and the depth that decides whether they
    float cannot drift apart. */
export function waterDepth(seed, x, z){
  return waterLevel(seed, x, z) - groundHeight(seed, x, z);
}

/** Wet, or close enough to the waterline that nothing should be planted. */
export function underWater(seed, x, z, margin = 0.7){
  return waterDepth(seed, x, z) > -margin;
}
