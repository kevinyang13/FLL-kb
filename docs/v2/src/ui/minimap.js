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
let canvas = null, ctx = null, terrain = null, sig = '';

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

/** The fixed part of the map, handed over once when the garden is built. */
export function setMapTerrain(data){ terrain = data; sig = ''; }

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
