/* Sun, sky and the fill light that keeps shadowed leaves from going black.
   One shadow-casting light: shadows are the single most expensive thing on
   a phone, so there is exactly one and its camera is kept tight. */
import * as THREE from 'three';
import { SUN, SKY } from '../data/palette.js';

export function buildSky(scene, renderer){
  scene.background = new THREE.Color(SKY.horizon);
  scene.fog = new THREE.Fog(SKY.horizon, 22, 48);

  const hemi = new THREE.HemisphereLight(SKY.top, SKY.ground, 1.15);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(SUN.color, SUN.intensity);
  sun.position.set(9, 14, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const c = sun.shadow.camera;
  c.left = -16; c.right = 16; c.top = 16; c.bottom = -16; c.near = 1; c.far = 46;
  sun.shadow.bias = -0.0012;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);

  // A big soft dome so the sky is a gradient rather than a flat colour.
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(70, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { top: { value: new THREE.Color(SKY.top) }, bot: { value: new THREE.Color(SKY.horizon) } },
      vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying float h; uniform vec3 top; uniform vec3 bot; void main(){ gl_FragColor = vec4(mix(bot, top, clamp(h*1.4,0.0,1.0)), 1.0); }',
    })
  );
  scene.add(dome);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return { sun, hemi, dome };
}
