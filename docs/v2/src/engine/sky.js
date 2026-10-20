/* Sun, moon, sky and stars.

   One shadow-casting light, whatever the hour: at night it is the moon
   rather than the sun, cool and weak instead of warm and strong, which is
   why a full-moon night still casts shadows. Shadows are the single most
   expensive thing on a phone, so there is exactly one such light and its
   camera is kept tight.

   Nothing here decides how an hour looks — the numbers all come from
   data/daytime.js. This file only interpolates between two of them and
   pushes the result into three.js. */
import * as THREE from 'three';
import { SUN } from '../data/palette.js';
import { PHASES, phaseAt } from '../data/daytime.js';

const FADE = 1.6;          // seconds to cross from one hour to the next

/** A dome of stars, invisible by day. */
function buildStars(){
  const n = 1400, pos = [], size = [];
  for (let i = 0; i < n; i++){
    // even over the upper hemisphere, not bunched at the pole
    const u = Math.random(), v = Math.random() * 0.92 + 0.04;
    const a = u * Math.PI * 2, el = Math.acos(1 - v);
    const r = 820;
    pos.push(Math.sin(el) * Math.cos(a) * r, Math.cos(el) * r * 0.9 + 40, Math.sin(el) * Math.sin(a) * r);
    size.push(1.6 + Math.random() * 3.4);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({
    color: 0xFFFFFF, size: 3.2, sizeAttenuation: false,
    transparent: true, opacity: 0, depthWrite: false, fog: false,
  });
  const stars = new THREE.Points(g, m);
  stars.renderOrder = -1;
  void size;
  return stars;
}

/** The sun or the moon, as a soft disc where the key light comes from. */
function luminaryTexture(){
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.42, 'rgba(255,255,255,0.92)');
  grd.addColorStop(0.55, 'rgba(255,255,255,0.28)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** Where a key light with this elevation and bearing stands, as a unit vector. */
function keyDirection(elev, azim){
  return new THREE.Vector3(
    Math.cos(elev) * Math.sin(azim),
    Math.sin(elev),
    Math.cos(elev) * Math.cos(azim));
}

export function buildSky(scene, renderer){
  const start = phaseAt(2);                       // midday
  const now = {
    top: new THREE.Color(start.sky.top),
    horizon: new THREE.Color(start.sky.horizon),
    ground: new THREE.Color(start.sky.ground),
    keyColor: new THREE.Color(start.key.color),
    lum: new THREE.Color(start.luminary.color),
    intensity: start.key.intensity,
    hemi: start.hemi,
    exposure: start.exposure,
    stars: start.stars,
    elev: start.key.elev,
    azim: start.key.azim,
    near: start.fog.near,
    far: start.fog.far,
    lumSize: start.luminary.size,
  };
  let target = start;

  scene.background = now.horizon.clone();
  scene.fog = new THREE.Fog(now.horizon.clone(), now.near, now.far);

  const hemi = new THREE.HemisphereLight(now.top.getHex(), now.ground.getHex(), now.hemi);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(SUN.color, SUN.intensity);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const c = key.shadow.camera;
  c.left = -26; c.right = 26; c.top = 26; c.bottom = -26; c.near = 1; c.far = 260;
  key.shadow.bias = -0.0012;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);

  // A big soft dome so the sky is a gradient rather than a flat colour.
  // Out past the forest ring, so the land never ends in a visible edge. The
  // shader carries no fog chunk, so the gradient survives the fog that hides
  // everything else at this distance.
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(900, 32, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { top: { value: now.top.clone() }, bot: { value: now.horizon.clone() } },
      vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying float h; uniform vec3 top; uniform vec3 bot; void main(){ gl_FragColor = vec4(mix(bot, top, clamp(h*1.4,0.0,1.0)), 1.0); }',
    })
  );
  dome.renderOrder = -2;
  scene.add(dome);

  const stars = buildStars();
  scene.add(stars);

  const lum = new THREE.Sprite(new THREE.SpriteMaterial({
    map: luminaryTexture(), color: now.lum.clone(), transparent: true,
    opacity: 0.95, depthWrite: false, fog: false,
  }));
  lum.renderOrder = -1;
  scene.add(lum);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMappingExposure = now.exposure;

  const KEY_DIST = 90;
  const at = new THREE.Vector3();

  /* The shadow camera is a 52 m box, and the garden is 640 m across, so it
     has to travel with the player — left at the origin it shadowed the one
     room in the middle of the garden and nothing else. The light's direction
     is what matters, so the lamp keeps a fixed offset from its target. */
  function followSun(p){
    at.set(p.x, p.y, p.z);
    dome.position.set(p.x, 0, p.z);        // the horizon travels with you
    stars.position.set(p.x, 0, p.z);
    key.target.position.copy(at);
    const d = keyDirection(now.elev, now.azim);
    key.position.copy(at).addScaledVector(d, KEY_DIST);
    key.target.updateMatrixWorld();
    lum.position.copy(at).addScaledVector(d, 780);
  }

  /** Move toward the chosen hour. Called every frame; `underwater` leaves
      the fog alone, because the water has its own. */
  function tick(dt, underwater){
    const k = Math.min(1, dt / FADE);
    const t = target;
    now.top.lerp(new THREE.Color(t.sky.top), k);
    now.horizon.lerp(new THREE.Color(t.sky.horizon), k);
    now.ground.lerp(new THREE.Color(t.sky.ground), k);
    now.keyColor.lerp(new THREE.Color(t.key.color), k);
    now.lum.lerp(new THREE.Color(t.luminary.color), k);
    const to = (a, b) => a + (b - a) * k;
    now.intensity = to(now.intensity, t.key.intensity);
    now.hemi = to(now.hemi, t.hemi);
    now.exposure = to(now.exposure, t.exposure);
    now.stars = to(now.stars, t.stars);
    now.elev = to(now.elev, t.key.elev);
    now.azim = to(now.azim, t.key.azim);
    now.near = to(now.near, t.fog.near);
    now.far = to(now.far, t.fog.far);
    now.lumSize = to(now.lumSize, t.luminary.size);

    hemi.color.copy(now.top);
    hemi.groundColor.copy(now.ground);
    hemi.intensity = now.hemi;
    key.color.copy(now.keyColor);
    key.intensity = now.intensity;
    dome.material.uniforms.top.value.copy(now.top);
    dome.material.uniforms.bot.value.copy(now.horizon);
    stars.material.opacity = now.stars;
    stars.visible = now.stars > 0.01;
    lum.material.color.copy(now.lum);
    lum.scale.setScalar(now.lumSize);
    renderer.toneMappingExposure = now.exposure;
    if (!underwater){
      scene.fog.color.copy(now.horizon);
      scene.background = scene.fog.color;
    }
  }

  return {
    sun: key, key, hemi, dome, stars, lum, followSun, tick,
    /** The hour the garden is moving towards. */
    get phase(){ return target; },
    setPhase(i){ target = phaseAt(i); return target; },
    /** What the air looks like right now, for the view that needs it. */
    air(){ return { color: now.horizon, near: now.near, far: now.far }; },
  };
}

export { PHASES };
