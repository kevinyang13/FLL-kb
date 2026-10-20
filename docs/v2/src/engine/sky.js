/* Sun, sky and the fill light that keeps shadowed leaves from going black.
   One shadow-casting light: shadows are the single most expensive thing on
   a phone, so there is exactly one and its camera is kept tight. */
import * as THREE from 'three';
import { SUN, SKY } from '../data/palette.js';

export function buildSky(scene, renderer){
  scene.background = new THREE.Color(SKY.horizon);
  /* Visibility, not world size: the garden is 640 m across and drawing all
     of it would be pointless as well as slow. Far enough to see several
     rooms and the forest beyond as haze, near enough that the frustum culls
     most of the planting. */
  scene.fog = new THREE.Fog(SKY.horizon, 90, 420);

  const hemi = new THREE.HemisphereLight(SKY.top, SKY.ground, 1.35);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(SUN.color, SUN.intensity);
  sun.position.set(16, 26, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const c = sun.shadow.camera;
  c.left = -26; c.right = 26; c.top = 26; c.bottom = -26; c.near = 1; c.far = 80;
  sun.shadow.bias = -0.0012;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);

  // A big soft dome so the sky is a gradient rather than a flat colour.
  // Out past the forest ring, so the land never ends in a visible edge. The
  // shader carries no fog chunk, so the gradient survives the fog that hides
  // everything else at this distance.
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(900, 32, 20),
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

  /* The shadow camera is a 52 m box, and the garden is 640 m across, so it
     has to travel with the player — left at the origin it shadowed the one
     room in the middle of the garden and nothing else. The light's direction
     is what matters, so the lamp keeps a fixed offset from its target. */
  const OFF = new THREE.Vector3(16, 26, 12);
  const followSun = p => {
    dome.position.set(p.x, 0, p.z);        // the horizon travels with you
    sun.target.position.set(p.x, p.y, p.z);
    sun.position.copy(sun.target.position).add(OFF);
    sun.target.updateMatrixWorld();
  };
  return { sun, hemi, dome, followSun };
}
