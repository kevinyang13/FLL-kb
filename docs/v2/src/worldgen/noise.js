/* Deterministic value noise. A function of (seed, coordinate) and nothing
   else — never Math.random — so the same seed always grows the same garden
   and a bug can be reproduced by writing the seed down. */
export function hash2(seed, x, y){
  let h = seed ^ (x * 374761393) ^ (y * 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const smooth = t => t * t * (3 - 2 * t);

export function value2(seed, x, y){
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = smooth(x - xi), yf = smooth(y - yi);
  const a = hash2(seed, xi, yi),     b = hash2(seed, xi + 1, yi);
  const c = hash2(seed, xi, yi + 1), d = hash2(seed, xi + 1, yi + 1);
  return (a + (b - a) * xf) * (1 - yf) + (c + (d - c) * xf) * yf;
}

export function fbm(seed, x, y, octaves = 4){
  let v = 0, amp = 0.5, f = 1, norm = 0;
  for (let o = 0; o < octaves; o++){
    v += value2(seed + o * 101, x * f, y * f) * amp;
    norm += amp; amp *= 0.5; f *= 2;
  }
  return v / norm;
}

/** A seeded generator for the few places that genuinely want a sequence. */
export function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
