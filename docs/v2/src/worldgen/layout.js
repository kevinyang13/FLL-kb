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
import { HILL_CASTLE, onCastle, levelHilltop, levelLakeTerrace, planLakeCastle, planHillCastle, planRoad } from './castles.js';

export const BAY = 64;                         // one garden room, the original yard
export const BAYS = 10;                        // ten rooms each way: ten times bigger
export const YARD = { w: BAY * BAYS, d: BAY * BAYS };   // where the player may walk
export const GROUND = 1700;                    // how far the land is drawn
/* Where the player may go. The garden is fenced on the south, where the
   land runs out into scenery hills that are drawn as shapes rather than
   ground; everywhere else they may walk out of the garden and on into the
   mountains, up to 50 m short of the edge of the drawn land. */
export const WALK = { half: GROUND / 2 - 50, south: YARD.d / 2 };
/* The steepest step a walker will take, as rise over run: 1.8 is about
   60°. That is steep, and it is set by the mountain tops: the peaks are
   summed cones, so each comes to a point, and the last 20-40 m below every
   summit runs at up to 1.7. A 45° limit stopped you just short of every
   top. The escarpment is what this is really for — 2.2 to 6.4 for 90 m
   either side of the fall — so the cliff stays a cliff and you walk round
   its ends, where it eases off. */
export const STEEPEST = 1.8;

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

/* The lake's rim is not a circle. A circle reads as a pond someone dug;
   a lake has bays and headlands. Four harmonics around the compass give
   that and stay smooth and closed, which matters more than it sounds: the
   SAME function shapes the basin, answers "is this spot in the lake", and
   draws the water's edge, so there is one rim and nothing to misalign.

   The amplitudes sum to about a third, so the rim runs between roughly 50
   and 105 m from the middle. The phases are chosen so the lake does not
   grow south into the castle standing on its shore. */
const LAKE_WOBBLE = [
  { k: 1, amp: 0.115, phase: 2.35 },
  { k: 2, amp: 0.095, phase: 0.60 },
  { k: 3, amp: 0.065, phase: 3.95 },
  { k: 5, amp: 0.035, phase: 1.25 },
];

/** The lake's rim, as a distance from its middle at this bearing. */
export function lakeRadius(theta){
  let k = 1;
  for (const w of LAKE_WOBBLE) k += w.amp * Math.sin(w.k * theta + w.phase);
  return LAKE.r * k;
}

/** How far out this spot is as a share of the rim: under 1 is in the lake. */
export function lakeU(x, z){
  const dx = x - LAKE.x, dz = z - LAKE.z;
  const d = Math.hypot(dx, dz);
  if (d > LAKE.r * 1.45) return Infinity;      // outside any possible rim
  return d / lakeRadius(Math.atan2(dz, dx));
}

/** The rim as a ring of points — the mesh and the map both draw this. */
export function lakeRim(n = 128){
  const out = [];
  for (let i = 0; i < n; i++){
    const a = (i / n) * Math.PI * 2, r = lakeRadius(a);
    out.push({ x: LAKE.x + Math.cos(a) * r, z: LAKE.z + Math.sin(a) * r });
  }
  return out;
}

/* The river. `pts` is the route it takes; `line` is the line it actually
   follows — the route smoothed and then pushed from side to side, because
   a river does not run straight between its bends.

   The drawn ribbon and the carved bed both read `line`. They used to
   disagree: the mesh followed a spline through `pts` while the bed was cut
   against the straight chords between them, which is fine for gentle bends
   and opens gaps the moment the river really meanders. */
export const RIVER = {
  width: 26, bank: 42, depth: 3.4,
  from: -1.6,                                  // water surface at the pool
  meander: 17,                                 // how far it swings off its route
  pts: [
    { x: -70, z: -404 }, { x: -62, z: -330 }, { x: -34, z: -248 },
    { x: -40, z: -150 }, { x: -4, z: -58 }, { x: 44, z: 18 },
    { x: 86, z: 86 }, { x: 112, z: 128 },
  ],
};

/* Catmull-Rom, written out here rather than borrowed from three.js: the
   planting plan may not import a renderer, and the bed has to be cut from
   exactly the curve the water is drawn along. */
function spline(P, i, t){
  const g = j => P[Math.max(0, Math.min(P.length - 1, j))];
  const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t +
    (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
  return { x: f(p0.x, p1.x, p2.x, p3.x), z: f(p0.z, p1.z, p2.z, p3.z) };
}

/** The line the river follows, sampled every few metres and meandered. */
function buildRiverLine(){
  const P = RIVER.pts, per = 14, raw = [];
  for (let i = 0; i < P.length - 1; i++)
    for (let k = 0; k < per; k++) raw.push(spline(P, i, k / per));
  raw.push(P[P.length - 1]);

  const out = [];
  for (let i = 0; i < raw.length; i++){
    const u = i / (raw.length - 1);
    const a = raw[Math.max(0, i - 1)], b = raw[Math.min(raw.length - 1, i + 1)];
    const tx = b.x - a.x, tz = b.z - a.z, L = Math.hypot(tx, tz) || 1;
    // across the flow, tapered to nothing at the pool and at the lake so
    // neither junction moves
    const taper = Math.sin(Math.PI * u) ** 0.7;
    const swing = (Math.sin(u * 15.5 + 0.4) * 0.6 + Math.sin(u * 8.1 + 2.2) * 0.4)
                * RIVER.meander * taper;
    out.push({ x: raw[i].x - tz / L * swing, z: raw[i].z + tx / L * swing });
  }
  return out;
}
RIVER.line = buildRiverLine();

/* Where along the line the water first reaches the lake. Past that the
   river's surface IS the lake's, so the two meet without a step — the
   drawn ribbon used to arrive about 15 cm high. */
RIVER.join = (() => {
  for (let i = 0; i < RIVER.line.length; i++){
    const p = RIVER.line[i];
    if (lakeU(p.x, p.z) <= 1) return i / (RIVER.line.length - 1);
  }
  return 1;
})();

/* The line's segments in a coarse grid, so working out how far a spot is
   from the river does not walk a hundred segments. */
const RIVER_CELL = 96;
const riverGrid = new Map();
(() => {
  const L = RIVER.line, reach = RIVER.bank + 4;
  for (let i = 0; i < L.length - 1; i++){
    const a = L[i], b = L[i + 1];
    const x0 = Math.min(a.x, b.x) - reach, x1 = Math.max(a.x, b.x) + reach;
    const z0 = Math.min(a.z, b.z) - reach, z1 = Math.max(a.z, b.z) + reach;
    for (let cx = Math.floor(x0 / RIVER_CELL); cx <= Math.floor(x1 / RIVER_CELL); cx++)
      for (let cz = Math.floor(z0 / RIVER_CELL); cz <= Math.floor(z1 / RIVER_CELL); cz++){
        const k = cx + ',' + cz;
        if (!riverGrid.has(k)) riverGrid.set(k, []);
        riverGrid.get(k).push(i);
      }
  }
})();

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

/* The dome's own frame: `a` runs along the way its face looks, `b` across. */
const domeLen = Math.hypot(DOME.x, DOME.z);
export const DOME_AXIS = { x: -DOME.x / domeLen, z: -DOME.z / domeLen };

/* Where the dome's open base sits — the lowest ground anywhere around its
   rim, sunk ten metres, which is how the mesh itself is placed. Worked out
   once per seed: it reads the height field thirty-three times. */
const domeBases = new Map();
export function domeBase(seed){
  if (domeBases.has(seed)) return domeBases.get(seed);
  let low = groundHeight(seed, DOME.x, DOME.z);
  for (let k = 0; k < 32; k++){
    const a = (k / 32) * Math.PI * 2;
    low = Math.min(low, groundHeight(seed, DOME.x + Math.cos(a) * DOME.r,
                                           DOME.z + Math.sin(a) * DOME.r * 0.82));
  }
  const y = low - 10;
  domeBases.set(seed, y);
  return y;
}

/** The top of the granite dome over this spot, or -Infinity off it.

    The mesh is a hemisphere whose height is `max(0, vy) ** 0.8`, so with
    `vy = sqrt(1 - a^2 - b^2)` the surface is `h * (1 - a^2 - b^2) ** 0.4`.
    Everything past the cutting plane was pressed flat onto it, which is the
    sheer face — so there is no dome at all beyond `cut`.

    This used to live inside the griffin, which was the only thing that knew
    the dome was there. Now the player stands on it too, and one definition
    is the only way the two can agree about where its surface is. */
export function domeTop(seed, x, z){
  const dx = x - DOME.x, dz = z - DOME.z;
  const a = (dx * DOME_AXIS.x + dz * DOME_AXIS.z) / DOME.r;
  const b = (-dx * DOME_AXIS.z + dz * DOME_AXIS.x) / (DOME.r * 0.82);
  if (a > DOME.cut) return -Infinity;              // past the face: open air
  const r2 = a * a + b * b;
  if (r2 >= 1) return -Infinity;
  return domeBase(seed) + DOME.h * Math.pow(1 - r2, 0.4);
}

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
  /* Nor on a castle, nor on the road up to one: the castles' ground is
     cleared first and everything else is planted round it. */
  const H = (x, z) => groundHeight(seed, x, z);
  const road = planRoad(H);
  road.width = 1.4;                          // half-width: a road, not a garden path
  const roadGrid = new Map();
  for (const p of road){
    const k = Math.floor(p.x / 10) + ',' + Math.floor(p.z / 10);
    if (!roadGrid.has(k)) roadGrid.set(k, []);
    roadGrid.get(k).push(p);
  }
  const nearRoad = (x, z, m) => {
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++){
      for (const p of roadGrid.get((Math.floor(x / 10) + i) + ',' + (Math.floor(z / 10) + j)) || []){
        if (Math.hypot(x - p.x, z - p.z) < m) return true;
      }
    }
    return false;
  };
  const dry = (x, z, m) => !underWater(seed, x, z, m === undefined ? 0.7 : m)
                        && !onCastle(x, z) && !nearRoad(x, z, 5);
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
    // every trunk is solid now that the mountains can be walked to
    blockers.push({ x, z, r: 0.9 });
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
    const tr = 1.3 + frnd() * 1.2;
    forest.push({
      x: fx, z: fz,
      h: 8 + frnd() * 13, r: tr,
      color: [0x4A7A4C, 0x3F6C43, 0x55885A][Math.floor(frnd() * 3)],
    });
    blockers.push({ x: fx, z: fz, r: tr * 0.4 });
  }

  const summits = findSummits(seed);
  const rocks = placeRocks(seed, centre, blockers, dry, summits);
  markSummits(seed, summits, rocks, blockers);

  /* ── rock you can stand on ──────────────────────────────
     Every rock is seated the way the mesh seats it: on the LOWEST of five
     points of ground under it, then sunk by a third of its height, so a
     rock on a slope is buried on the uphill side instead of floating off
     the downhill one. The seat is worked out once, here, and the renderer
     reads it off the rock rather than working it out again — two copies of
     that sum would drift apart the first time either changed, and the
     player would stand where the rock is not.

     Pebbles are left out. They are ankle-high and there are fourteen
     hundred of them; standing on one is not climbing, it is tripping. */
  const K = 0.92;                  // of the drawn rock, to stand just inside it
  const CELL = 24;
  const stone = new Map();
  for (const r of rocks){
    const sp = Math.max(r.w, r.d) * 0.6;
    r.seat = Math.min(groundHeight(seed, r.x, r.z),
                      groundHeight(seed, r.x + sp, r.z), groundHeight(seed, r.x - sp, r.z),
                      groundHeight(seed, r.x, r.z + sp), groundHeight(seed, r.x, r.z - sp))
             + r.h * 0.3;
    if (r.kind === 'pebble') continue;
    const ex = Math.max(r.w, r.d) * K;
    for (let i = Math.floor((r.x - ex) / CELL); i <= Math.floor((r.x + ex) / CELL); i++){
      for (let j = Math.floor((r.z - ex) / CELL); j <= Math.floor((r.z + ex) / CELL); j++){
        const k = i + ',' + j;
        if (!stone.has(k)) stone.set(k, []);
        stone.get(k).push(r);
      }
    }
  }

  /** The top of the rock over this spot, or -Infinity where there is none.
      Each rock is an ellipsoid about its seat — the drawn shape is a lumpy
      icosahedron inside that, so your feet are never under the stone. */
  function rockTop(x, z){
    let y = -Infinity;
    for (const r of stone.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL)) || []){
      const a = (x - r.x) / (r.w * K), b = (z - r.z) / (r.d * K);
      const u = a * a + b * b;
      if (u >= 1) continue;
      const top = r.seat + r.h * K * Math.sqrt(1 - u);
      if (top > y) y = top;
    }
    return y;
  }

  /** What the player's feet rest on: the land, plus the stone standing on
      it. Everything that walks, lands or perches reads this rather than
      `groundHeight`, which is the shape of the LAND alone. */
  function standHeight(x, z){
    return Math.max(groundHeight(seed, x, z), rockTop(x, z), domeTop(seed, x, z));
  }

  /* The castles: drawn from their plans by the engine, and solid from the
     same plans here. The road joins the walks, drawn wider. */
  const castles = [planLakeCastle(H), planHillCastle(H)];
  for (const c of castles) blockers.push(...c.blockers);
  paths.push(road);

  return { seed, paths, borders, flowerBands, conifers, trees,
           hedges, forest, rainforest, blockers, rocks, summits,
           rockTop, standHeight,
           castles: castles.map(c => c.parts),
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
function placeRocks(seed, centre, blockers, dry, summits = []){
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
  /* Rock is no longer a wall. A boulder still goes into the spacing grid —
     so the next one, and the trees, keep clear of it — but NOT into
     `blockers`, which is what the player is pushed out of. Stone is part of
     the surface you stand on instead: see `standHeight` below. You cannot
     walk through it because the ground rises, and you can walk up it
     wherever the rise is gentler than a walker can take. */
  const boulder = (rnd, x, z, size, flat) => {
    if (!clear(x, z, size)) return false;
    const w = S(rnd, 'boulder', x, z, size, flat);
    addBlock({ x, z, r: w * 0.78 });        // spacing only, not collision
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
    /* Not on a summit: a top you can climb to is the point of climbing,
       and a crag on it — solid now — would leave nowhere to stand. */
    if (summits.some(t => Math.hypot(t.x - x, t.z - z) < 45)) continue;
    if (!dry(x, z, -1e9)) continue;          // the castle and its road
    const y = groundHeight(seed, x, z);
    if (y < 30) continue;
    const big = 8 + mtn() * 14 * Math.min(1, y / 140);
    addBlock({ x, z, r: S(mtn, 'outcrop', x, z, big, 0.7) * CRAG });
    const n = 2 + Math.floor(mtn() * 4);
    for (let k = 0; k < n; k++){
      const a = mtn() * Math.PI * 2, rr = big * (0.8 + mtn() * 0.9);
      const ox = x + Math.cos(a) * rr, oz = z + Math.sin(a) * rr;
      addBlock({ x: ox, z: oz, r: S(mtn, 'outcrop', ox, oz, big * (0.3 + mtn() * 0.35), 0.6) * CRAG });
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
    addBlock({ x, z, r: S(tal, 'outcrop', x, z, 1.4 + tal() * 7 * (1 - out / 70), 0.6) * CRAG });
  }
  return rocks;
}

/* How much of a mountain rock is solid, as a share of its width. Less than
   all of it: the rock is a lumpy shape buried in the slope, and treating it
   as a full disc closed the gaps between neighbouring crags, which walled
   the highest peaks off completely. */
const CRAG = 0.6;

/** The tops of the mountains, so the game can tell when one is reached.
    Found rather than named: the peaks in MOUNTAINS are summed, so the
    highest ground is rarely at any one peak's centre, and two overlapping
    peaks can share a single top. Each summit gets a cairn — three stones
    stacked, which is how walkers mark a top — and its height above the
    lawn, which is what the game tells you when you get there. */
function findSummits(seed){
  const found = [];
  for (const p of MOUNTAINS){
    let best = { x: p.x, z: p.z, y: -Infinity };
    const R = p.r * 0.35;
    for (let x = p.x - R; x <= p.x + R; x += 4){
      for (let z = p.z - R; z <= p.z + R; z += 4){
        const y = groundHeight(seed, x, z);
        if (y > best.y) best = { x, z, y };
      }
    }
    // climb the last few metres on a finer step
    for (let k = 0; k < 40; k++){
      let moved = false;
      for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const y = groundHeight(seed, best.x + dx, best.z + dz);
        if (y > best.y){ best = { x: best.x + dx, z: best.z + dz, y }; moved = true; }
      }
      if (!moved) break;
    }
    if (Math.abs(best.x) > WALK.half || best.z < -WALK.half) continue;
    if (inDome(best.x, best.z)) continue;      // the east peak is under the dome
    /* The peak over the waterfall has a castle on it now. Its top is the
       castle courtyard, levelled; the ridge running north from it is a
       few metres higher, but the castle is what a child climbs to. */
    if (Math.hypot(p.x - HILL_CASTLE.x, p.z - HILL_CASTLE.z) < 40){
      found.push({ x: HILL_CASTLE.x, z: HILL_CASTLE.z + 14, y: HILL_CASTLE.top, castle: true });
      continue;
    }
    if (found.some(f => Math.hypot(f.x - best.x, f.z - best.z) < 60)) continue;
    found.push(best);
  }
  return found;
}

/** Names, heights and a cairn for each summit, once the rocks are placed. */
function markSummits(seed, found, rocks, blockers){
  const rnd = mulberry32(seed + 1201);
  for (const s of found){
    if (s.castle){ s.name = 'castle'; s.metres = Math.round(s.y); continue; }
    // the bearing from the garden, which is the name a child would give it
    const a = Math.atan2(s.x, -s.z) * 180 / Math.PI;
    s.name = ['north', 'north-east', 'east', 'south-east', 'south',
              'south-west', 'west', 'north-west'][Math.round(((a + 360) % 360) / 45) % 8];
    s.metres = Math.round(s.y);
    const cx = s.x + 2.5, cz = s.z;           // beside the top, so you can stand on it
    for (let k = 0; k < 3; k++){
      const size = 0.55 - k * 0.14;
      rocks.push({ kind: 'boulder', x: cx, z: cz, w: size, d: size * 0.9, h: size * 0.6,
                   lift: k * 0.62 - k * k * 0.08, yaw: rnd() * 6.3, tilt: 0,
                   color: STONE[Math.floor(rnd() * STONE.length)] });
    }
  }
  /* The one standing over the escarpment is named for the waterfall below
     it; any two left with the same bearing are told apart by height. The
     names are settled first and changed after, or renaming one peak would
     change which others look like duplicates. */
  for (const s of found){
    if (!s.castle && Math.hypot(s.x - FALL.x, s.z - CLIFF.z) < 130) s.name = 'waterfall';
  }
  const groups = {};
  for (const s of found) (groups[s.name] ||= []).push(s);
  for (const same of Object.values(groups)){
    if (same.length < 2) continue;
    same.sort((a, b) => b.y - a.y);
    same.forEach((s, i) => { s.name = (i === 0 ? 'high ' : 'lower ') + s.name; });
  }
  const top = found.reduce((a, b) => a.y > b.y ? a : b);
  top.highest = true;
}

const smooth = t => { const u = Math.max(0, Math.min(1, t)); return u * u * (3 - 2 * u); };

/** Distance from (x,z) to the line the river follows, and how far along it.
    Only the segments in this grid cell are tried: the line is a hundred and
    more segments now that it meanders, and this is read a quarter of a
    million times while the land is built. */
function onRiver(x, z){
  const near = riverGrid.get(Math.floor(x / RIVER_CELL) + ',' + Math.floor(z / RIVER_CELL));
  if (!near) return { d: Infinity, t: 0 };
  const L = RIVER.line, n = L.length - 1;
  let best = Infinity, bestT = 0;
  for (const i of near){
    const a = L[i], b = L[i + 1];
    const dx = b.x - a.x, dz = b.z - a.z;
    const len2 = dx * dx + dz * dz;
    let t = len2 ? ((x - a.x) * dx + (z - a.z) * dz) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t));
    if (d < best){ best = d; bestT = (i + t) / n; }
  }
  return { d: best, t: bestT };
}

/** The river's water surface: a steady fall from the plunge pool, levelling
    off at the lake's own surface once it has arrived there. */
export function riverSurface(t){
  const u = Math.min(1, t / RIVER.join);
  return RIVER.from + (WATER - RIVER.from) * u;
}

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
  h = levelHilltop(x, z, h);                  // the hill castle's courtyard

  /* ── the water ──────────────────────────────────────────
     Every body of water is cut to fit the shape that is DRAWN over it, and
     the ground around it is pulled down towards the water's edge but never
     below it. That is the whole rule, and it is what stops "there is water
     here" and "water is drawn here" disagreeing: inside the drawn shape the
     bed is under the surface, outside it the ground is above the surface. */
  const lu = lakeU(x, z);                      // 1 at the lake's own rim
  const pd = Math.hypot(x - POOL.x, z - POOL.z);
  const r = onRiver(x, z);
  const rs = riverSurface(r.t);
  const hw = RIVER.width / 2;
  const inLake = lu < 1, inPool = pd < POOL.r, inRiver = r.d < hw;

  /* Each bed is a half ellipse that meets its own surface exactly at the rim
     of the shape drawn over it, so the shoreline lands on that rim rather
     than somewhere inside it. The lake used to reach water level at 69 m
     while its disc was drawn to 81 m. */
  if (inLake) h = Math.min(h, WATER - LAKE.depth * Math.sqrt(Math.max(0, 1 - lu * lu)));
  if (inPool) h = Math.min(h, POOL.level - POOL.depth * Math.sqrt(Math.max(0, 1 - (pd / POOL.r) ** 2)));
  if (inRiver) h = Math.min(h, rs - RIVER.depth * Math.sqrt(Math.max(0, 1 - (r.d / hw) ** 2)));

  if (!inLake && !inPool && !inRiver){
    let f = 0, edge = -Infinity;
    if (lu < SHORE){
      f = Math.max(f, smooth((SHORE - lu) / (SHORE - 1)));
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
    /* Last, so the shore's slope towards the water does not drag the
       palace's level ground back down with it. */
    h = levelLakeTerrace(x, z, h);
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
  if (lakeU(x, z) < 1) return WATER;
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
