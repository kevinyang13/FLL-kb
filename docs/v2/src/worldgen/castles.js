/* The two castles, as plans: every wall, tower, roof and window as a plain
   record the engine turns into one mesh per castle, and the solid parts as
   blockers the player walks round. Pure data, no three.js, so the drawing
   and the collision cannot disagree — both come from these lists.

   The lake castle is after Moszna: a long palace in three different hands —
   a Gothic stone block with a great round tower, a cream Baroque centre
   with a domed entrance, a pale Renaissance wing with stepped gables — all
   under steep red roofs and a crowd of spires. It stands on the south shore
   looking north across the water.

   The hill castle is after Hohenzollern: golden stone on a hilltop, a ring
   of battlemented curtain walls with round bastions, slate spires above,
   and a road winding up to the gate. It stands on the peak over the
   waterfall, on a level courtyard cut into the top.

   Units are metres. A part's `y` is where it starts, at its base. */

export const LAKE_CASTLE = { x: 112, front: 230, w: 92, d: 22 };
export const HILL_CASTLE = { x: -70, z: -520, top: 180, flat: 27, blend: 50, wall: 31 };

/* Moszna's palette: three stones, red roofs, dark slate spires. */
const SANDSTONE = 0xCDBB93, CREAM = 0xE6DCC2, PALE = 0xDAD6CE, TRIM = 0xB9A57E;
const RED = 0x8B2E2B, SLATE = 0x3F4752, WINDOW = 0x2B3640, CUPOLA = 0x5B5450;
/* Hohenzollern's: honey-coloured stone, blue-grey slate. */
const GOLD = 0xC8A262, GOLD2 = 0xB8914F, BLUESLATE = 0x4A5666, CHAPEL = 0xD9D2C2;

/** Is this spot taken by a castle (or its forecourt)? Nothing is planted
    there. `m` widens the test. */
export function onCastle(x, z, m = 0){
  return onLakeCastle(x, z, m) || Math.hypot(x - HILL_CASTLE.x, z - HILL_CASTLE.z) < HILL_CASTLE.wall + 6 + m;
}
/** The palace and its terrace only: the garden paths stop at its walls. */
export function onLakeCastle(x, z, m = 0){
  const L = LAKE_CASTLE;
  return Math.abs(x - L.x) < L.w / 2 + 6 + m && z > L.front - 16 - m && z < L.front + L.d + 6 + m;
}

/** The hilltop, levelled: inside `flat` it is exactly `top`, and over the
    next `blend` metres it eases back into the mountain. Cut where the peak
    stood above it, filled where the slope fell away. */
export function levelHilltop(x, z, h){
  const C = HILL_CASTLE;
  const d = Math.hypot(x - C.x, z - C.z);
  if (d >= C.flat + C.blend) return h;
  const u = Math.max(0, Math.min(1, (d - C.flat) / C.blend));
  const t = u * u * (3 - 2 * u);
  return C.top * (1 - t) + h * t;
}

/* ── a small kit: parts, windows and battlements ───────────────── */
function kit(){
  const parts = [], blockers = [];
  const P = {
    parts, blockers,
    box(x, y, z, w, h, d, color, rot = 0){ parts.push({ type: 'box', x, y, z, w, h, d, rot, color }); },
    cyl(x, y, z, r, h, color, rt = r, seg = 18){ parts.push({ type: 'cyl', x, y, z, r, rt, h, seg, color }); },
    cone(x, y, z, r, h, color, seg = 18){ parts.push({ type: 'cone', x, y, z, r, h, seg, color }); },
    pyr(x, y, z, w, h, color, rot = 0){ parts.push({ type: 'pyr', x, y, z, w, h, rot, color }); },
    /** A pitched roof: ridge along the part's own x, `w` long, `d` deep. */
    gable(x, y, z, w, d, h, color, rot = 0){ parts.push({ type: 'gable', x, y, z, w, d, h, rot, color }); },
    dome(x, y, z, r, color){ parts.push({ type: 'dome', x, y, z, r, color }); },
    /** Solid to walk into: an upright box, or a circle. */
    blockBox(x, z, w, d, rot = 0){ blockers.push({ x, z, r: Math.hypot(w, d) / 2, box: { hw: w / 2, hd: d / 2, rot } }); },
    blockRound(x, z, r){ blockers.push({ x, z, r }); },
    /** Rows of windows on the face of a block that looks towards -z (or +z
        with `dir` 1), set just proud of the wall so they read at a distance. */
    windows(x0, x1, zFace, y0, floors, floorH, color = WINDOW, dir = -1, every = 3.4, tall = 1.9){
      const n = Math.max(1, Math.floor((x1 - x0) / every));
      for (let f = 0; f < floors; f++){
        for (let i = 0; i < n; i++){
          const x = x0 + (i + 0.5) * (x1 - x0) / n;
          P.box(x, y0 + 1.4 + f * floorH, zFace + dir * 0.08, 1.05, tall, 0.2, color);
        }
      }
    },
    /** The same along a face that looks towards -x (or +x with `dir` 1). */
    windowsX(z0, z1, xFace, y0, floors, floorH, color = WINDOW, dir = -1, every = 3.4){
      const n = Math.max(1, Math.floor((z1 - z0) / every));
      for (let f = 0; f < floors; f++){
        for (let i = 0; i < n; i++){
          const z = z0 + (i + 0.5) * (z1 - z0) / n;
          P.box(xFace + dir * 0.08, y0 + 1.4 + f * floorH, z, 0.2, 1.9, 1.05, color);
        }
      }
    },
    /** A spire on a round tower: the cone, and a slim needle on top. */
    spire(x, y, z, r, h, color){
      P.cone(x, y, z, r, h, color);
      P.cyl(x, y + h - 0.4, z, 0.12, 2.6, color, 0.05, 6);
    },
    /** Merlons along a straight wall top, from (x0,z0) to (x1,z1). */
    battlements(x0, z0, x1, z1, y, thick, color){
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(len / 1.8);
      const rot = Math.atan2(-(z1 - z0), x1 - x0);
      for (let i = 0; i < n; i++){
        const t = (i + 0.5) / n;
        P.box(x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t, 0.95, 1.1, thick + 0.1, color, rot);
      }
    },
    /** Merlons round a circular tower top. */
    ring(x, y, z, r, color){
      const n = Math.max(6, Math.round(r * 2.6));
      for (let i = 0; i < n; i++){
        const a = (i / n) * Math.PI * 2;
        P.box(x + Math.cos(a) * r, y, z + Math.sin(a) * r, 0.9, 1.1, 0.7, color, -a);
      }
    },
  };
  return P;
}

/* ── Moszna, on the south shore of the lake ───────────────────────── */
export function planLakeCastle(H){
  const L = LAKE_CASTLE, P = kit();
  const x0 = L.x - L.w / 2, F = L.front;          // F: the facade line, facing north
  // the palace sits level on the highest ground under it, on a plinth down
  // to the lowest, so no corner of it hangs over the shore
  let hi = -Infinity, lo = Infinity;
  for (let x = x0; x <= x0 + L.w; x += 4) for (let z = F; z <= F + L.d; z += 4){
    const h = H(x, z); hi = Math.max(hi, h); lo = Math.min(lo, h);
  }
  const y = hi + 0.3;
  P.box(L.x, lo - 1.5, F + L.d / 2, L.w + 3, y - lo + 1.5, L.d + 3, TRIM);

  // west: the Gothic block, gable end to the lake, and the great round tower
  const wx0 = x0, wx1 = x0 + 24;
  P.box((wx0 + wx1) / 2, y, F + 10, 24, 18, 20, SANDSTONE);
  P.gable((wx0 + wx1) / 2, y + 18, F + 10, 20, 24.6, 13, RED, Math.PI / 2);
  P.box((wx0 + wx1) / 2, y + 18, F + 0.6, 7, 6, 1.6, SANDSTONE);         // a front dormer
  P.gable((wx0 + wx1) / 2, y + 24, F + 1.6, 4, 7.6, 3.4, RED, Math.PI / 2);
  P.windows(wx0 + 2, wx1 - 2, F, y, 4, 4.2);
  P.cyl(wx0, y, F + 2, 5, 31, SANDSTONE);
  P.cyl(wx0, y + 26, F + 2, 5.6, 2, TRIM);                              // the corbelled top
  P.spire(wx0, y + 28, F + 2, 5.8, 15, SLATE);
  for (let i = 0; i < 4; i++){                                          // its four small turrets
    const a = i * Math.PI / 2 + Math.PI / 4;
    P.cyl(wx0 + Math.cos(a) * 5.4, y + 27, F + 2 + Math.sin(a) * 5.4, 0.8, 3.5, SANDSTONE);
    P.cone(wx0 + Math.cos(a) * 5.4, y + 30.5, F + 2 + Math.sin(a) * 5.4, 0.95, 3.2, SLATE, 8);
  }
  for (let f = 0; f < 6; f++) P.box(wx0, y + 3 + f * 4, F + 2 - 5.1, 0.9, 1.7, 0.3, WINDOW);
  P.box(wx1, y, F + 1, 6, 26, 6, SANDSTONE);                            // the square tower
  P.pyr(wx1, y + 26, F + 1, 7.4, 9, RED);
  P.cyl(wx1, y + 34.5, F + 1, 0.15, 4, SLATE, 0.05, 6);
  P.windows(wx1 - 2, wx1 + 2, F - 2, y, 6, 4, WINDOW, -1, 4);
  P.blockBox((wx0 + wx1) / 2, F + 10, 24, 20);
  P.blockRound(wx0, F + 2, 5);
  P.blockBox(wx1, F + 1, 6, 6);

  // centre: the cream Baroque block, set back, with a domed entrance
  const cx0 = wx1 + 3, cx1 = x0 + 64, cmid = (cx0 + cx1) / 2;
  P.box(cmid, y, F + 10, cx1 - cx0, 13, 16, CREAM);
  P.gable(cmid, y + 13, F + 10, cx1 - cx0, 17, 8, RED);
  for (let i = 0; i < 6; i++){                                         // dormers along the roof
    const x = cx0 + 3 + i * (cx1 - cx0 - 6) / 5;
    P.box(x, y + 13, F + 4.2, 1.8, 2.4, 1.2, CREAM);
    P.gable(x, y + 15.4, F + 4.2, 1.4, 2.2, 1.2, RED, Math.PI / 2);
  }
  P.windows(cx0 + 1, cx1 - 1, F + 2, y, 3, 3.9);
  P.box(cmid, y, F + 1, 10, 17, 4, CREAM);                              // entrance pavilion
  P.box(cmid, y, F - 0.95, 3.2, 4.6, 0.3, WINDOW);                      // its door
  P.windows(cmid - 4, cmid + 4, F - 1, y + 4, 3, 4);
  P.cyl(cmid, y + 17, F + 1, 3.2, 3, CREAM);
  P.dome(cmid, y + 20, F + 1, 3.3, CUPOLA);
  P.cyl(cmid, y + 23, F + 1, 0.9, 2.2, CUPOLA);
  P.spire(cmid, y + 25, F + 1, 0.9, 4, CUPOLA);
  for (const x of [cx0, cx1]){                                          // flanking round towers
    P.cyl(x, y, F + 4, 3, 19, CREAM);
    P.dome(x, y + 19, F + 4, 3.1, SLATE);
    P.spire(x, y + 21.5, F + 4, 0.7, 5, SLATE);
    P.blockRound(x, F + 4, 3);
  }
  // the low terrace in front, with a balustrade and a fountain
  P.box(cmid, y - 0.9, F - 7, 30, 0.9, 12, TRIM);
  P.box(cmid - 9, y, F - 12.6, 12, 1, 0.5, PALE);
  P.box(cmid + 9, y, F - 12.6, 12, 1, 0.5, PALE);
  P.cyl(cmid, y, F - 7, 3, 0.8, PALE);
  P.cyl(cmid, y + 0.8, F - 7, 0.4, 2.2, PALE);
  P.blockBox(cmid, F + 10, cx1 - cx0, 16);
  P.blockBox(cmid, F + 1, 10, 4);

  // east: the pale Renaissance wing, stepped gables to the lake
  const ex0 = cx1 + 2, ex1 = x0 + L.w, emid = (ex0 + ex1) / 2;
  P.box(emid, y, F + 9, ex1 - ex0, 17, 18, PALE);
  P.gable(emid, y + 17, F + 9, ex1 - ex0, 19, 11, RED);
  for (const gx of [ex0 + 6, emid + 2, ex1 - 6]){
    for (let k = 0; k < 4; k++){
      const w = 7.4 - k * 1.8;
      P.box(gx, y + 17 + k * 2.3, F + 0.6, w, 2.3, 1.2, PALE);
      P.box(gx, y + 17 + k * 2.3 + 2.3, F + 0.6, 0.6, 0.6, 0.6, TRIM);   // finial on each step
    }
    P.box(gx, y + 18.2, F - 0.05, 1, 1.7, 0.2, WINDOW);
  }
  P.windows(ex0 + 1, ex1 - 4, F, y, 4, 4);
  P.cyl(ex1, y, F + 2, 3.6, 22, PALE);                                  // corner tower
  P.dome(ex1, y + 22, F + 2, 4, CUPOLA);
  P.cyl(ex1, y + 25.5, F + 2, 1.4, 2.6, CUPOLA);
  P.dome(ex1, y + 28, F + 2, 1.6, CUPOLA);
  P.spire(ex1, y + 29, F + 2, 0.5, 5, CUPOLA);
  P.blockBox(emid, F + 9, ex1 - ex0, 18);
  P.blockRound(ex1, F + 2, 3.6);
  return P;
}

/* ── Hohenzollern, on the peak over the waterfall ─────────────────── */
export function planHillCastle(H){
  const C = HILL_CASTLE, P = kit();
  const y = C.top, X = C.x, Z = C.z;

  /* The curtain wall: eight bastions on an irregular ring, a wall between
     each pair, and a gate in the south wall, facing the garden. The wall
     goes down to the ground at its foot wherever the slope falls away, so
     on the cliff side it stands far taller than in the courtyard. */
  const radii = [29, 31, 28, 30, 32, 29, 30, 31];
  const V = radii.map((r, i) => {
    const a = (i / radii.length) * Math.PI * 2 + Math.PI / 8;
    return { x: X + Math.cos(a) * r, z: Z + Math.sin(a) * r, a };
  });
  const TOP = y + 8, T = 2.4;
  const gateA = Math.PI / 2;                        // +z, towards the garden
  for (let i = 0; i < V.length; i++){
    const a = V[i], b = V[(i + 1) % V.length];
    const len = Math.hypot(b.x - a.x, b.z - a.z), rot = Math.atan2(-(b.z - a.z), b.x - a.x);
    const foot = Math.min(H(a.x, a.z), H(b.x, b.z), H((a.x + b.x) / 2, (a.z + b.z) / 2)) - 1;
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
    const hasGate = Math.abs(Math.atan2(mz - Z, mx - X) - gateA) < 0.3;
    if (hasGate){
      // two lengths of wall either side of a 4 m gateway, a tower over it
      const ux = (b.x - a.x) / len, uz = (b.z - a.z) / len;
      for (const [s0, s1] of [[0, len / 2 - 2.6], [len / 2 + 2.6, len]]){
        const cx = a.x + ux * (s0 + s1) / 2, cz = a.z + uz * (s0 + s1) / 2;
        P.box(cx, foot, cz, s1 - s0, TOP - foot, T, GOLD, rot);
        P.battlements(a.x + ux * s0, a.z + uz * s0, a.x + ux * s1, a.z + uz * s1, TOP, T, GOLD);
        P.blockBox(cx, cz, s1 - s0, T + 0.4, rot);
      }
      const gx = mx, gz = mz;
      P.box(gx - ux * 3.6, foot, gz - uz * 3.6, 2.2, TOP + 8 - foot, 7, GOLD2, rot);     // piers
      P.box(gx + ux * 3.6, foot, gz + uz * 3.6, 2.2, TOP + 8 - foot, 7, GOLD2, rot);
      P.box(gx, y + 4.8, gz, 5.2, TOP + 8 - y - 4.8, 7, GOLD2, rot);                    // over the arch
      P.box(gx + uz * 3.55, y, gz - ux * 3.55, 4.4, 4.8, 0.2, WINDOW, rot);               // the arch's shadow, outside
      P.battlements(gx - ux * 4.7, gz - uz * 4.7, gx + ux * 4.7, gz + uz * 4.7, TOP + 8, 7, GOLD2);
      P.blockBox(gx - ux * 3.6, gz - uz * 3.6, 2.2, 7, rot);
      P.blockBox(gx + ux * 3.6, gz + uz * 3.6, 2.2, 7, rot);
    } else {
      P.box(mx, foot, mz, len, TOP - foot, T, GOLD, rot);
      P.battlements(a.x, a.z, b.x, b.z, TOP, T, GOLD);
      P.blockBox(mx, mz, len, T + 0.4, rot);
    }
  }
  for (const v of V){
    const foot = H(v.x, v.z) - 1;
    P.cyl(v.x, foot, v.z, 4.3, TOP + 3 - foot, GOLD2);
    P.ring(v.x, TOP + 3, v.z, 4, GOLD2);
    P.blockRound(v.x, v.z, 4.3);
  }

  // the buildings, round the north half of the courtyard
  const block = (cx, cz, w, d, h, roof, color, along = 'x') => {
    const rot = along === 'x' ? 0 : Math.PI / 2;
    P.box(X + cx, y, Z + cz, w, h, d, color);
    if (along === 'x') P.gable(X + cx, y + h, Z + cz, w + 0.6, d + 0.8, roof, BLUESLATE);
    else P.gable(X + cx, y + h, Z + cz, d + 0.6, w + 0.8, roof, BLUESLATE, rot);
    P.blockBox(X + cx, Z + cz, w, d);
  };
  block(-1, -16, 26, 10, 15, 9, GOLD);                       // the palace
  P.windows(X - 13, X + 11, Z - 11, y, 3, 4.4, WINDOW, 1);
  block(-17, -4, 10, 20, 13, 8, GOLD2, 'z');                  // west wing
  P.windowsX(Z - 13, Z + 5, X - 12, y, 3, 4, WINDOW, 1);
  block(14, -3, 12, 16, 14, 8, GOLD, 'z');                    // east palace
  P.windowsX(Z - 10, Z + 4, X + 8, y, 3, 4.2, WINDOW, -1);
  block(-3, 0, 8, 14, 10, 7, CHAPEL, 'z');                     // the chapel
  P.spire(X - 3, y + 15, Z - 6, 0.9, 6, BLUESLATE);
  P.box(X - 3, y + 2, Z + 7.05, 1.6, 4.5, 0.2, WINDOW);

  P.box(X + 3, y, Z - 23, 6.5, 34, 6.5, GOLD);                 // the keep
  P.pyr(X + 3, y + 34, Z - 23, 7.6, 11, BLUESLATE);
  P.cyl(X + 3, y + 44.5, Z - 23, 0.15, 4, BLUESLATE, 0.05, 6);
  P.windows(X + 1, X + 5, Z - 26.3, y + 14, 4, 4.2, WINDOW, -1, 4);
  P.windows(X + 1, X + 5, Z - 19.7, y + 14, 4, 4.2, WINDOW, 1, 4);
  P.blockBox(X + 3, Z - 23, 6.5, 6.5);

  const round = (cx, cz, r, h, roof) => {
    P.cyl(X + cx, y, Z + cz, r, h, GOLD2);
    P.spire(X + cx, y + h, Z + cz, r + 0.35, roof, BLUESLATE);
    P.blockRound(X + cx, Z + cz, r);
  };
  round(-14, -21, 2.6, 26, 11);
  round(12, -21, 2.4, 24, 10);
  round(20, 6, 2.2, 22, 9);
  round(-22, 7, 2.2, 20, 9);
  round(-8, -11, 1.6, 21, 8);
  for (const [px, pz] of [[-14, -11], [12, -11], [-22, -14], [20, -11]]){   // pinnacles
    P.cyl(X + px, y + 14, Z + pz, 0.6, 3.4, GOLD2);
    P.cone(X + px, y + 17.4, Z + pz, 0.75, 3.4, BLUESLATE, 8);
  }
  return P;
}

/** The road up to the gate: the cheapest way down from the gate to the
    east end of the escarpment, over a 3 m grid, where a step costs more the
    steeper it is. Gentle ground is cheap, so the route that comes out
    winds the way a real mountain road does, in switchbacks, rather than
    going straight down the fall line. Nothing steeper than 1.2 is used at
    all. It ends where the cliff runs out, from where the walk down to the
    garden is easy. */
export function planRoad(H){
  const C = HILL_CASTLE, G = 3;
  const X0 = C.x - 90, X1 = C.x + 170, Z0 = C.z - 80, Z1 = C.z + 95;
  const NX = Math.round((X1 - X0) / G) + 1, NZ = Math.round((Z1 - Z0) / G) + 1;
  const h = new Float32Array(NX * NZ);
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) h[i * NZ + j] = H(X0 + i * G, Z0 + j * G);
  const cell = (x, z) => Math.round((x - X0) / G) * NZ + Math.round((z - Z0) / G);
  const start = cell(C.x, C.z + C.wall + 4), goal = cell(C.x + 160, C.z + 80);

  // Dijkstra with a small binary heap
  const dist = new Float64Array(NX * NZ).fill(Infinity), prev = new Int32Array(NX * NZ).fill(-1);
  const heap = [[0, start]]; dist[start] = 0;
  const push = e => { heap.push(e); let k = heap.length - 1; while (k){ const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length){ heap[0] = last; let k = 0; for (;;){ const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  while (heap.length){
    const [d, c] = pop();
    if (c === goal) break;
    if (d > dist[c]) continue;
    const i = Math.floor(c / NZ), j = c % NZ;
    for (const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const a = i + di, b = j + dj;
      if (a < 0 || b < 0 || a >= NX || b >= NZ) continue;
      const n = a * NZ + b, run = G * Math.hypot(di, dj);
      const slope = Math.abs(h[n] - h[c]) / run;
      if (slope > 1.2) continue;
      // past a gentle grade, every bit of extra steepness is expensive
      const cost = run * (1 + 40 * Math.max(0, slope - 0.22) ** 2 * 10);
      if (d + cost < dist[n]){ dist[n] = d + cost; prev[n] = c; push([d + cost, n]); }
    }
  }
  const pts = [];
  for (let c = goal; c >= 0; c = prev[c] === c ? -1 : prev[c]){
    pts.push({ x: X0 + Math.floor(c / NZ) * G, z: Z0 + (c % NZ) * G });
    if (c === start) break;
  }
  pts.reverse();
  // into the gateway, then every other cell: the ribbon is smoothed anyway
  return [{ x: C.x, z: C.z + C.wall - 3 }, ...pts.filter((p, k) => k % 2 === 0 || k === pts.length - 1)];
}
