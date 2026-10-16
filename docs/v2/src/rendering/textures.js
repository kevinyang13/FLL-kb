/* Every texture in the game is drawn in code on a canvas at load time.
   Nothing is downloaded, nothing needs a licence, and the whole page stays
   small enough to open on a phone at an outreach table.

   A PBR surface needs more than a colour: `map` is what it looks like,
   `roughnessMap` is where it is shiny versus dull, and `normalMap` fakes
   the bumps that catch the light. We draw a height field, then derive the
   normal map from it with a Sobel filter, so the lighting agrees with the
   texture instead of fighting it. */
import * as THREE from 'three';
import { fbm, hash2 } from '../worldgen/noise.js';

const SIZE = 256;
const cache = new Map();

function canvas(){
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  return c;
}

function tex(c, repeat){
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  return t;
}

/** Height field → normal map, so bumps light correctly from any sun angle. */
function normalFromHeight(height, strength = 2.2){
  const c = canvas(), ctx = c.getContext('2d');
  const img = ctx.createImageData(SIZE, SIZE);
  const at = (x, y) => height[((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE)];
  for (let y = 0; y < SIZE; y++){
    for (let x = 0; x < SIZE; x++){
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * SIZE + x) * 4;
      img.data[i]     = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function field(fn){
  const h = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) h[y * SIZE + x] = fn(x, y);
  return h;
}

function paint(fn){
  const c = canvas(), ctx = c.getContext('2d');
  const img = ctx.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++){
    for (let x = 0; x < SIZE; x++){
      const [r, g, b] = fn(x, y);
      const i = (y * SIZE + x) * 4;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

const mix = (a, b, t) => a + (b - a) * t;

/* ── the surfaces ──────────────────────────────────────────── */

function soil(){
  const h = field((x, y) => fbm(11, x / 18, y / 18, 5) * 0.7 + hash2(3, x, y) * 0.3);
  const col = paint((x, y) => {
    const n = h[y * SIZE + x], grit = hash2(5, x, y);
    const d = mix(0.72, 1.12, n) * mix(0.9, 1.08, grit);
    return [116 * d, 92 * d, 68 * d];   // damp potting soil in sun, not a shadow
  });
  return { map: col, normal: normalFromHeight(h, 3.2), rough: paint((x, y) => {
    const v = 235 - hash2(9, x, y) * 40; return [v, v, v];
  }) };
}

function grass(){
  const h = field((x, y) => fbm(21, x / 9, y / 9, 4) * 0.5 + fbm(22, x / 2.5, y / 2.5, 2) * 0.5);
  const col = paint((x, y) => {
    const n = h[y * SIZE + x];
    const blade = fbm(23, x / 1.6, y / 5, 2);
    const d = mix(0.78, 1.14, n * 0.6 + blade * 0.4);
    return [104 * d, 146 * d, 62 * d];   // mown lawn in full sun
  });
  return { map: col, normal: normalFromHeight(h, 2.6), rough: paint(() => [215, 215, 215]) };
}

function leaf(){
  // Veins: a midrib down the middle with ribs branching off it.
  const h = field((x, y) => {
    const u = x / SIZE, v = y / SIZE;
    const mid = 1 - Math.min(1, Math.abs(u - 0.5) * 22);
    const rib = Math.abs(Math.sin((v * 9 + Math.abs(u - 0.5) * 6) * Math.PI)) ;
    const ribs = Math.pow(rib, 18) * (1 - Math.abs(u - 0.5) * 1.3);
    return Math.max(mid * 0.9, ribs * 0.55) * 0.8 + fbm(31, x / 14, y / 14, 3) * 0.2;
  });
  const col = paint((x, y) => {
    const n = h[y * SIZE + x];
    const d = mix(1.08, 0.74, n);          // veins are paler, flesh is darker
    const blotch = fbm(33, x / 22, y / 22, 3);
    return [78 * d * mix(0.9, 1.1, blotch), 122 * d, 51 * d];
  });
  return { map: col, normal: normalFromHeight(h, 2.0), rough: paint((x, y) => {
    const n = h[y * SIZE + x]; const v = mix(175, 120, n); return [v, v, v];
  }) };
}

function wood(){
  const h = field((x, y) => {
    const rings = Math.abs(Math.sin((y / 26 + fbm(41, x / 40, y / 90, 3) * 1.6) * Math.PI));
    return Math.pow(rings, 2.2) * 0.75 + hash2(43, x, y) * 0.25;
  });
  const col = paint((x, y) => {
    const n = h[y * SIZE + x], d = mix(0.72, 1.15, n);
    return [138 * d, 106 * d, 69 * d];
  });
  return { map: col, normal: normalFromHeight(h, 2.4), rough: paint((x, y) => {
    const v = 220 - h[y * SIZE + x] * 45; return [v, v, v];
  }) };
}

function terracotta(){
  const h = field((x, y) => fbm(51, x / 10, y / 10, 4) * 0.5 + Math.abs(Math.sin(y / 3.2)) * 0.5);
  const col = paint((x, y) => {
    const d = mix(0.8, 1.12, h[y * SIZE + x]);
    return [167 * d, 100 * d, 62 * d];
  });
  return { map: col, normal: normalFromHeight(h, 1.6), rough: paint(() => [228, 228, 228]) };
}

const BUILDERS = { soil, grass, leaf, wood, terracotta };

/** Returns {map, normalMap, roughnessMap} for a named surface, built once. */
export function surfaceMaps(name, repeat = 1){
  const key = name + ':' + repeat;
  if (cache.has(key)) return cache.get(key);
  const parts = BUILDERS[name]();
  const out = {
    map: tex(parts.map, repeat),
    normalMap: tex(parts.normal, repeat),
    roughnessMap: tex(parts.rough, repeat),
  };
  out.map.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, out);
  return out;
}

export function disposeTextures(){
  for (const maps of cache.values()) Object.values(maps).forEach(t => t.dispose());
  cache.clear();
}
