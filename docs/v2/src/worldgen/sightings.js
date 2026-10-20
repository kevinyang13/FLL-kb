/* The scattered insects.

   The nine set-piece scenes are pictures with captions: an aphid colony with
   ants patrolling it, a mummy among the living. They teach. But nine fixed
   pictures in a 640 m garden means a garden that is empty everywhere else,
   and the thing a real garden actually gives you is the opposite — turn over
   any leaf and something is on it.

   So the garden is also scattered with hundreds of single sightings, placed
   from the seed like everything else. Each one is a real card from the field
   guide, on a plant that species would actually be on, in the numbers it
   would actually be in: aphids by the dozen, one lacewing on its own.

   Pure data. No three.js here — the engine resolves `kind`/`u` against the
   anchors the garden really built. */
import { GUIDE } from '../data/species.js';
import { mulberry32 } from './noise.js';

export const SIGHTINGS = 600;          // six per garden room, near enough

export function buildSightings(seed = 7, n = SIGHTINGS){
  const rnd = mulberry32(seed * 104729 + 17);

  /* Weighted by how common the species is, so the garden reads honestly: you
     meet aphids and whitefly constantly and a lacewing egg rarely, which is
     the actual ratio in a garden and the reason the predators matter. */
  const pool = [];
  for (const [key, e] of Object.entries(GUIDE))
    for (let i = 0; i < e.common; i++) pool.push(key);

  const out = [];
  for (let i = 0; i < n; i++){
    const key = pool[Math.floor(rnd() * pool.length)];
    const e = GUIDE[key];
    const kind = e.where[Math.floor(rnd() * e.where.length)];
    const [lo, hi] = e.group_size;
    /* Stratified rather than uniform. The anchor lists are built room by
       room, so sweeping `u` evenly across the list puts sightings in every
       room; drawing it at random leaves whole corners of the garden bare. */
    const u = (i + rnd()) / n;
    const count = lo + Math.floor(rnd() * (hi - lo + 1));
    out.push({
      id: 'bug:' + i + ':' + key,
      key, kind, u, count,
      model: e.model,
      spread: count > 1 ? 0.04 + rnd() * 0.06 : 0,
      jitter: [(rnd() - 0.5) * 0.14, rnd() * 0.02, (rnd() - 0.5) * 0.14],
    });
  }
  return out;
}
