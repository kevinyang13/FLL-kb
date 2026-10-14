/* One material per surface, shared by every mesh that uses it. Three.js
   compiles a shader per material, so reusing them is most of why this runs
   on a phone. */
import * as THREE from 'three';
import { SURFACE } from '../data/palette.js';
import { surfaceMaps } from './textures.js';

const cache = new Map();

export function mat(name, extra){
  const key = name + (extra ? JSON.stringify(extra) : '');
  if (cache.has(key)) return cache.get(key);
  const s = SURFACE[name] || { color: 0xCCCCCC, roughness: 0.8, metalness: 0 };
  const opts = {
    color: s.color,
    roughness: s.roughness,
    metalness: s.metalness,
    ...(s.opacity !== undefined ? { transparent: true, opacity: s.opacity } : {}),
    ...extra,
  };
  const m = new THREE.MeshStandardMaterial(opts);
  cache.set(key, m);
  return m;
}

/** A textured material.

    The base colour goes WHITE here on purpose. Three.js multiplies `color`
    by `map`, so leaving the palette's mid-green on a mid-green grass texture
    multiplies two half-lit values together and the lawn comes out nearly
    black. The texture already carries the colour; the tint's job is only to
    shade it, so anything other than white has to be asked for deliberately. */
export function texturedMat(name, surface, repeat, extra){
  const key = `tex:${name}:${surface}:${repeat}`;
  if (cache.has(key)) return cache.get(key);
  const m = mat(name, { color: 0xFFFFFF, ...surfaceMaps(surface, repeat), ...extra });
  cache.set(key, m);
  return m;
}

export function disposeMaterials(){
  for (const m of cache.values()) m.dispose();
  cache.clear();
}
