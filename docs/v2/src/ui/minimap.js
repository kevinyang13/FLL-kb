/* The minimap, top right.

   North-up rather than rotating with the player: the garden is a grid of a
   hundred rooms and the thing worth knowing is which room you are in and
   which way the unexplored part lies. A map that spins under you is harder
   for a nine-year-old to read than an arrow that spins on a map that does
   not.

   What it draws, back to front: the room grid, every sighting in the garden
   as a faint speck, the sightings of cards still missing from the notebook
   brighter on top — but only the ones within walking reach, because at the
   start of the game twelve of the thirteen cards are blank and lighting up
   all six hundred turns the whole map yellow — then the set-piece scenes as
   rings, the view cone, and the player.

   Sightings are NOT coloured by helpful or pest. That is the question the
   game asks; a map that answered it would be the end of the game. */

const SIZE = 148;                         // CSS pixels
const LIT = 130;                          // metres: how far a bright marker reaches

/* The area view: the same data, close enough to be useful. The corner map
   answers "where am I in the garden"; at 640 m across it cannot answer
   "what is around me", because a room is a fifth of an inch on it. */
const AREA = 560;                         // canvas pixels
const AREA_SPAN = 170;                    // metres across

let canvas = null, ctx = null, terrain = null, sig = '';
let areaCanvas = null, areaCtx = null, areaSig = '';

export function mountMinimap(root){
  const box = document.createElement('div');
  box.id = 'minimap';
  box.innerHTML = `<canvas width="${SIZE}" height="${SIZE}"></canvas>
    <span class="n">N</span><span class="scale">640 m</span>`;
  root.appendChild(box);
  canvas = box.querySelector('canvas');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = canvas.height = SIZE * dpr;
  canvas.style.width = canvas.style.height = SIZE + 'px';
  ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
}

export function mountAreaMap(root){
  const box = document.createElement('div');
  box.id = 'areamap';
  box.className = 'hidden';
  box.innerHTML = `<canvas width="${AREA}" height="${AREA}"></canvas>
    <div class="cap"><b>Around you</b><span>${AREA_SPAN} m across · <b>M</b> to close</span></div>`;
  root.appendChild(box);
  areaCanvas = box.querySelector('canvas');
  areaCtx = areaCanvas.getContext('2d');
  return box;
}

/** The fixed part of the map, handed over once when the garden is built. */
export function setMapTerrain(data){ terrain = data; sig = areaSig = ''; }

export function drawMinimap(state){
  if (!ctx || !terrain || !state.map) return;
  const { x, z, yaw } = state.map;
  /* Redraw only when something on it moved. The HUD publishes eight times a
     second and a canvas redrawn eight times a second for a player standing
     still is eight times a second of nothing. */
  const next = `${x.toFixed(1)},${z.toFixed(1)},${yaw.toFixed(2)},${Object.keys(state.found || {}).length}`;
  if (next === sig) return;
  sig = next;

  const pad = 7, span = SIZE - pad * 2;
  const k = span / terrain.size;                      // metres → pixels
  const px = v => pad + (v + terrain.size / 2) * k;   // world x or z → canvas

  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = 'rgba(20,38,24,0.82)';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // the water, under everything else: the lake and the river that feeds it
  if (terrain.water){
    const w = terrain.water;
    ctx.fillStyle = 'rgba(86,146,166,0.85)';
    ctx.strokeStyle = 'rgba(86,146,166,0.85)';
    ctx.lineWidth = Math.max(1.6, w.width * k);
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.beginPath();
    w.river.forEach((p, i) => i ? ctx.lineTo(px(p.x), px(p.z)) : ctx.moveTo(px(p.x), px(p.z)));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px(w.lake.x), px(w.lake.z), w.lake.r * k, 0, Math.PI * 2);
    ctx.fill();
  }

  // the hundred rooms
  ctx.strokeStyle = 'rgba(160,210,140,0.20)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= terrain.bays; i++){
    const p = Math.round(pad + i * terrain.bay * k) + 0.5;
    ctx.moveTo(p, pad); ctx.lineTo(p, pad + span);
    ctx.moveTo(pad, p); ctx.lineTo(pad + span, p);
  }
  ctx.stroke();

  const found = state.found || {};

  // every sighting, faint: the garden is full of life even where you are not
  ctx.fillStyle = 'rgba(206,230,184,0.22)';
  for (const b of terrain.bugs) ctx.fillRect(px(b.x) - 0.5, px(b.z) - 0.5, 1, 1);

  // within walking reach, the ones whose card is still blank
  ctx.fillStyle = 'rgba(255,226,120,0.95)';
  for (const b of terrain.bugs){
    if (found[b.key]) continue;
    if (Math.hypot(b.x - x, b.z - z) > LIT) continue;
    ctx.fillRect(px(b.x) - 1.1, px(b.z) - 1.1, 2.2, 2.2);
  }

  // the nine set-piece scenes: a ring, hollow once the scene is finished
  for (const s of terrain.scenes){
    const done = s.keys.every(key => found[key]);
    ctx.beginPath();
    ctx.arc(px(s.x), px(s.z), 3.4, 0, Math.PI * 2);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = done ? 'rgba(190,214,176,0.45)' : 'rgba(255,214,70,0.95)';
    ctx.stroke();
    if (!done){ ctx.fillStyle = 'rgba(255,214,70,0.35)'; ctx.fill(); }
  }

  // the player: a view cone and an arrow pointing the way they face
  const cx = px(x), cz = px(z);
  ctx.save();
  ctx.translate(cx, cz);
  ctx.rotate(-yaw);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 17, -Math.PI / 2 - 0.6, -Math.PI / 2 + 0.6);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fill();
  ctx.restore();

  // a dark disc first: a white arrow lands inside the bright cluster of
  // markers around the player, and without it the two run together
  ctx.beginPath();
  ctx.arc(cx, cz, 6.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(16,34,20,0.78)';
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cz);
  /* yaw 0 faces -Z, which is up on this map, and the map's +y is world +z,
     so the arrow turns the opposite way from the player. */
  ctx.rotate(-yaw);
  ctx.beginPath();
  ctx.moveTo(0, -5.4); ctx.lineTo(3.6, 4); ctx.lineTo(0, 2); ctx.lineTo(-3.6, 4);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = 'rgba(24,46,28,0.9)';
  ctx.lineWidth = 1;
  ctx.fill(); ctx.stroke();
  ctx.restore();
}


/** The area view: north-up like the corner map, but 170 m across instead of
    640, so the paths, the planting rooms and the insects around you are all
    legible. Drawn from exactly the same data — there is no second model of
    the garden to keep in step. */
export function drawAreaMap(state){
  if (!areaCtx || !terrain || !state.map) return;
  const { x, z, yaw } = state.map;
  const next = `${x.toFixed(1)},${z.toFixed(1)},${yaw.toFixed(2)},${Object.keys(state.found || {}).length}`;
  if (next === areaSig) return;
  areaSig = next;

  const c = areaCtx, k = AREA / AREA_SPAN, half = AREA_SPAN / 2;
  const px = wx => (wx - x + half) * k;
  const pz = wz => (wz - z + half) * k;
  const near = (ax, az, pad = 20) =>
    Math.abs(ax - x) < half + pad && Math.abs(az - z) < half + pad;

  c.clearRect(0, 0, AREA, AREA);
  c.fillStyle = 'rgba(18,36,22,0.93)';
  c.fillRect(0, 0, AREA, AREA);

  // water
  if (terrain.water){
    const w = terrain.water;
    c.fillStyle = 'rgba(86,146,166,0.9)';
    c.strokeStyle = 'rgba(86,146,166,0.9)';
    c.lineWidth = w.width * k;
    c.lineCap = c.lineJoin = 'round';
    c.beginPath();
    w.river.forEach((p, i) => i ? c.lineTo(px(p.x), pz(p.z)) : c.moveTo(px(p.x), pz(p.z)));
    c.stroke();
    c.beginPath();
    c.arc(px(w.lake.x), pz(w.lake.z), w.lake.r * k, 0, Math.PI * 2);
    c.fill();
  }

  // the walks
  if (terrain.paths){
    c.strokeStyle = 'rgba(190,176,150,0.5)';
    c.lineWidth = 2.4;
    for (const pts of terrain.paths){
      let drawing = false;
      c.beginPath();
      for (const p of pts){
        if (!near(p.x, p.z, 60)){ drawing = false; continue; }
        if (drawing) c.lineTo(px(p.x), pz(p.z));
        else { c.moveTo(px(p.x), pz(p.z)); drawing = true; }
      }
      c.stroke();
    }
  }

  // the rooms
  c.strokeStyle = 'rgba(160,210,140,0.22)';
  c.lineWidth = 1;
  c.beginPath();
  const first = Math.floor((x - half) / terrain.bay) * terrain.bay;
  for (let v = first; v <= x + half; v += terrain.bay){
    const p = Math.round(px(v)) + 0.5;
    c.moveTo(p, 0); c.lineTo(p, AREA);
  }
  const firstZ = Math.floor((z - half) / terrain.bay) * terrain.bay;
  for (let v = firstZ; v <= z + half; v += terrain.bay){
    const p = Math.round(pz(v)) + 0.5;
    c.moveTo(0, p); c.lineTo(AREA, p);
  }
  c.stroke();

  const found = state.found || {};

  // every sighting around you, and the ones still missing picked out
  for (const b of terrain.bugs){
    if (!near(b.x, b.z)) continue;
    const open = !found[b.key];
    c.fillStyle = open ? 'rgba(255,226,120,0.95)' : 'rgba(206,230,184,0.4)';
    const r = open ? 4 : 2.4;
    c.beginPath();
    c.arc(px(b.x), pz(b.z), r, 0, Math.PI * 2);
    c.fill();
  }

  // the set-piece scenes
  for (const s2 of terrain.scenes){
    if (!near(s2.x, s2.z, 40)) continue;
    const done = s2.keys.every(key => found[key]);
    c.beginPath();
    c.arc(px(s2.x), pz(s2.z), 9, 0, Math.PI * 2);
    c.lineWidth = 2.4;
    c.strokeStyle = done ? 'rgba(190,214,176,0.5)' : 'rgba(255,214,70,0.95)';
    c.stroke();
    if (!done){ c.fillStyle = 'rgba(255,214,70,0.3)'; c.fill(); }
  }

  // a 25 m grid of distance rings, so the map answers "how far"
  c.strokeStyle = 'rgba(255,255,255,0.16)';
  c.lineWidth = 1;
  c.setLineDash([3, 5]);
  for (const m of [25, 50, 75]){
    c.beginPath();
    c.arc(AREA / 2, AREA / 2, m * k, 0, Math.PI * 2);
    c.stroke();
  }
  c.setLineDash([]);
  c.fillStyle = 'rgba(255,255,255,0.5)';
  c.font = '600 13px system-ui, sans-serif';
  c.fillText('25 m', AREA / 2 + 4, AREA / 2 - 25 * k - 4);
  c.fillText('50 m', AREA / 2 + 4, AREA / 2 - 50 * k - 4);

  // the player
  c.save();
  c.translate(AREA / 2, AREA / 2);
  c.rotate(-yaw);
  c.beginPath();
  c.moveTo(0, 0);
  c.arc(0, 0, 54, -Math.PI / 2 - 0.6, -Math.PI / 2 + 0.6);
  c.closePath();
  c.fillStyle = 'rgba(255,255,255,0.16)';
  c.fill();
  c.beginPath();
  c.moveTo(0, -15); c.lineTo(10, 11); c.lineTo(0, 5.5); c.lineTo(-10, 11);
  c.closePath();
  c.fillStyle = '#FFFFFF';
  c.strokeStyle = 'rgba(24,46,28,0.9)';
  c.lineWidth = 2;
  c.fill(); c.stroke();
  c.restore();

  // north
  c.fillStyle = '#EAF4E3';
  c.font = '800 16px system-ui, sans-serif';
  c.fillText('N', 14, 26);
}
