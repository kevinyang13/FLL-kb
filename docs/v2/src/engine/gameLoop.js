/* The running game: composition root and heartbeat. One requestAnimationFrame
   runs, in order:
     1. fixed 20 Hz simulation steps (movement), up to 5 catch-up steps
     2. per-frame work: camera, the insects' crawl, any watch in progress
     3. what the crosshair is pointing at, then the throttled HUD snapshot

   There is no clock and no failure state. The garden is a fixed sunny
   afternoon; the only thing that advances is what the player has found. */
import * as THREE from 'three';
import { SIM_DT, MAX_CATCHUP } from '../core/controls.js';
import * as nb from '../core/notebook.js';
import { GUIDE } from '../data/species.js';
import { buildLayout, YARD, BAY, BAYS, RIVER, lakeRim } from '../worldgen/layout.js';
import { buildScenes as planScenes } from '../worldgen/scenes.js';
import { buildSky } from './sky.js';
import { PHASES } from '../data/daytime.js';
import { buildWorld } from './world.js';
import { buildScenes, morph, animateScenes, updateMarkers } from './sceneProps.js';
import { buildBugs } from './bugs.js';
import { Lifecycle, TOTAL as LIFE_SECONDS } from './lifecycle.js';
import { PlayerController } from './player.js';
import { Griffin } from './griffin.js';
import { CameraRig, magnification, HEIGHTS } from './cameraRig.js';
import { Interaction } from './interaction.js';
import { HudPublisher } from './hudPublisher.js';
import { setActiveGame } from '../session/commands.js';
import { save, load, clear, savePose, loadPose } from '../persistence/save.js';

/** How long a simple stage change takes. The egg clutch is different: it
    plays the whole life story, which runs to about forty seconds. */
const WATCH_SECONDS = 7;
const LIFECYCLE_KEY = 'lacewing-egg';

/** What a watched stage becomes, as a model name and how many. */
const BECOMES = {
  'lacewing-cocoon':{ model: 'adult',   count: 1, key: 'lacewing-adult' },
  'ladybug-larva':  { model: 'ladybug', count: 1, key: 'ladybug-adult' },
};

export class GameLoop {
  constructor(canvas, store, seed = 7){
    this.store = store;
    this.N = load() || nb.freshNotebook();
    if (!this.N.log.length){
      nb.note(this.N, 'A notebook with thirteen blank cards. Walk the garden, crouch with <b>C</b> to look closely, and press <b>E</b> on anything alive.', '');
    }

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    this.scene = new THREE.Scene();
    /* Far plane past the sky dome at 900 m: anything nearer clips the dome and
       the garden ends in a hole. */
    this.camera = new THREE.PerspectiveCamera(68, 1, 0.01, 1400);

    this.sky = buildSky(this.scene, this.renderer);
    this.layout = buildLayout(seed);
    this.world = buildWorld(this.scene, this.layout);
    this.scenes = planScenes();
    const built = buildScenes(this.scene, this.scenes, this.world.interactables, this.world.anchors);
    this.parts = built.parts;
    this.markers = built.markers;
    /* The nine scenes teach; these are the garden being full. Six hundred
       more sightings, scattered through every room, each one a real card on
       a plant that species would be on. */
    this.bugs = buildBugs(this.scene, this.world.anchors, this.world.interactables, seed);
    this.inspected = new Set();        // sightings already counted in the tally

    // anything already watched in a saved notebook is already changed
    for (const key of Object.keys(this.N.watched)){
      const b = BECOMES[key];
      if (b) morph(this.parts, key, b.model, b.count);
    }
    if (this.N.watched[LIFECYCLE_KEY]) morph(this.parts, LIFECYCLE_KEY, 'adult', 1);

    /* Up against a leaf the camera is inside the shrub's own shadow, and a
       magnified view of a dark green blob teaches nothing. The lens brings
       its own light, like holding a loupe up with a torch behind it. It is
       off at walking magnification. */
    /* A ring on the ground where the player is standing, for the aerial
       view: from a hundred metres up a person is a few pixels, and a map of
       your own garden is no use if you cannot find yourself on it. It scales
       with the height so it stays the same size on screen. */
    this.youAreHere = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 1.25, 28),
      new THREE.MeshBasicMaterial({ color: 0xFFE07A, transparent: true, opacity: 0.92,
                                    side: THREE.DoubleSide, depthTest: false }));
    this.youAreHere.rotation.x = -Math.PI / 2;
    this.youAreHere.renderOrder = 4;
    this.youAreHere.visible = false;
    this.scene.add(this.youAreHere);

    this.lensLight = new THREE.PointLight(0xFFF6E2, 0, 1.4, 2);
    this.camera.add(this.lensLight);
    this.scene.add(this.camera);

    this.player = new PlayerController(this.layout);
    this.griffin = new Griffin(this.scene, this.layout);
    /* A refresh should put you back where you were standing, not at the
       garden gate four hundred metres away. The signature is the shape of
       the world the pose was taken in: change the planting and old poses
       stop being trusted, because a spot that was a lawn last week may be
       the middle of the lake now. */
    this.sig = `${seed}:${YARD.w}:${BAYS}:${this.layout.borders.length}:${this.layout.trees.length}`;
    const pose = loadPose(this.sig);
    this.player.restore(pose);
    // set before use: this ran when `hour` was still undefined, and an
    // undefined index silently became an undefined phase
    this.hour = pose && Number.isInteger(pose.hour) ? pose.hour : 2;   // 2 = midday
    this.sky.setPhase(this.hour);
    this.poseSaved = 0;
    this.stopping = false;    // set by Start over: write nothing more

    this.rig = new CameraRig(this.camera);
    this.interaction = new Interaction(this.world.interactables);
    this.hud = new HudPublisher(store);

    this.clock = new THREE.Clock();
    this.acc = 0;
    this.panel = null;        // 'find' | 'notebook' | null
    this.pending = null;      // the card being guessed at
    this.watching = null;     // { key, t }
    this.life = null;         // the lacewing sequence, once it has started
    setActiveGame(this);
    addEventListener('resize', () => this.resize());
    const persist = () => { if (this.stopping) return; save(this.N); this.keepPose(Infinity); };
    addEventListener('pagehide', persist);
    document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });
    this.resize();
  }

  /* The fixed half of the minimap, handed to the interface once. The UI may
     not read the world, so the positions travel as plain numbers. */
  mapData(){
    return {
      size: YARD.w, bay: BAY, bays: BAYS,
      scenes: [...this.markers.values()].map(m => ({
        x: m.mote.position.x, z: m.mote.position.z, keys: m.keys })),
      bugs: this.bugs.list(),
      // the rim and the line themselves, so the map draws the same water
      // the world does rather than a circle near it
      water: { lake: lakeRim(72), river: RIVER.line, width: RIVER.width },
    };
  }

  /* Three ways of seeing, and the fog is what tells them apart: it is
     already the thing that says how far you can see. Underwater wins over
     aerial, aerial over walking. Run every frame rather than on a change,
     because the hour of the day moves the walking fog under it: at dusk you
     see 260 m and at midday 420, and that has to follow the light. */
  applyView(){
    const f = this.scene.fog;
    if (this.rig.aerial){
      // from a hundred metres up the garden's own fog would hide the
      // mountains the view exists to show
      f.near = 220; f.far = 1250;
    } else if (this.player.submerged()){
      f.color.setHex(0x1C4F52); f.near = 0.4; f.far = 17;
      this.scene.background = f.color;
    } else {
      /* Higher up, you see further. On a summit the garden's own fog would
         hide the garden — the thing you climbed up to look at — so it opens
         out with height above the lawn: twice as far at about 130 m. */
      const a = this.sky.air();
      const lift = 1 + Math.max(0, this.player.position.y - 15) / 115;
      f.near = a.near * lift; f.far = Math.min(1300, a.far * lift);
    }
  }

  /** Standing on a top says so, once per top. The note is kept in the
      notebook, so it is said once ever, not once per visit, and Start over
      wipes it with everything else. */
  checkSummit(){
    if (this.griffin.mounted) return;        // flying over a top is not climbing it
    const p = this.player.position;
    if (p.y < 100) return;
    for (const s of this.layout.summits){
      // the tops are steep: 4 m off the very point is already 6-7 m lower,
      // so "on the top" is measured generously in height as well as across
      if (Math.hypot(p.x - s.x, p.z - s.z) > 12 || p.y < s.y - 14) continue;
      const name = s.name === 'castle' ? 'the castle above the waterfall'
                 : s.name === 'waterfall' ? 'the peak above the waterfall' : `the ${s.name} peak`;
      const text = `You climbed to <b>${name}</b>: <b>${s.metres} m</b> above the lawn.` +
        (s.highest ? ' Nowhere in the land is higher.' : '') +
        ' Look back for the garden, or press <b>M</b> to go higher still.';
      if (nb.tell(this.N, 'summit:' + s.name, text, 'good')) this.flush();
    }
  }

  /** Step the clock. The sky crosses to the new hour over a second or so. */
  cycleTime(dir){
    this.hour = (this.hour + (dir || 1) + PHASES.length) % PHASES.length;
    this.sky.setPhase(this.hour);
    this.flush();
    return this.hour;
  }

  timeState(){ const p = PHASES[this.hour]; return { id: p.id, name: p.name }; }

  /** Where the player is: the map reads it, and so does the save. */
  pose(){ return this.player.pose(); }

  /* Written every couple of seconds rather than only on the way out.
     `pagehide` is not guaranteed — a crashed tab, a killed phone browser or
     a hard reload can skip it — and a position is cheap to write. */
  keepPose(now){
    if (this.stopping) return;
    if (now - this.poseSaved < 2000) return;
    // never the value passed in: a forced save sends Infinity, and storing
    // that would mean the tab never saves its position again
    this.poseSaved = performance.now();
    savePose({ ...this.player.pose(), hour: this.hour, v: this.sig });
  }

  resize(){
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight, false);
  }

  attachInput(input){ this.input = input; }

  frame = () => {
    requestAnimationFrame(this.frame);
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const now = performance.now();

    /* A panel stops the simulation, so nothing decays while it is open.
       Park the player rather than leaving the velocity to be applied on the
       far side of the panel, which reads as the garden shoving you. */
    if (this.panel) this.player.velocity.set(0, 0, 0);

    if (this.input && !this.panel && this.griffin.riding){
      // flying runs on the frame: see engine/griffin.js
      this.griffin.fly(this.input.consume(), dt, this.player);
      this.acc = 0;
    } else if (this.input && !this.panel){
      this.acc += dt;
      let steps = 0;
      while (this.acc >= SIM_DT && steps < MAX_CATCHUP){
        this.player.simStep(this.input.consume(), SIM_DT);
        this.acc -= SIM_DT; steps++;
      }
      if (steps === MAX_CATCHUP) this.acc = 0;
    }

    this.sky.tick(dt, this.player.submerged() && !this.rig.aerial);
    this.applyView();
    if (this.player.swimming &&
        nb.tell(this.N, 'swim', 'You are <b>swimming</b>. Hold <b>C</b> to duck under and look.', '')){
      this.flush();
    }

    this.griffin.update(dt, this.player);
    this.checkSummit();
    this.sky.followSun(this.player.position);
    this.rig.update(this.player, dt);
    this.youAreHere.visible = !!this.rig.aerial;
    if (this.rig.aerial){
      const p = this.player.position;
      this.youAreHere.position.set(p.x, p.y + 0.12, p.z);
      this.youAreHere.scale.setScalar(1 + this.rig.altitude / 13);
    }
    this.lensLight.intensity = this.rig.zoom ? 0.5 + this.rig.zoom * 0.5 : 0;
    animateScenes(this.parts, now / 1000);
    this.bugs.update(this.player.position, now / 1000);
    this.world.water.update(dt);
    this.keepPose(now);
    updateMarkers(this.markers, k => nb.isFound(this.N, k), now / 1000);
    this.tickWatch(dt);

    /* Nothing is in reach from the air: the targeting test is an angle from
       the camera, and the camera is a hundred metres away from the player it
       is measuring distances for. */
    const target = (this.panel || this.rig.aerial || this.griffin.mounted) ? null
      : this.interaction.update(this.camera, this.player.position, id => this.isDone(id));
    this.renderer.render(this.scene, this.camera);
    this.hud.publish(this.N, {
      guide: this.nearestUnfound(),
      zoom: this.rig.zoom ? { step: this.rig.zoom, x: magnification(this.rig.fov) } : null,
      prompt: target ? this.promptFor(target) : null,
      panel: this.panel, pending: this.pending,
      watching: this.watchState(),
      map: this.pose(),
      aerial: this.aerialState(),
      griffin: this.griffin.hudState(),
      time: this.timeState(),
    }, now);
  };

  /* Two kinds of target name a card: 'find:<key>' is a part of a set-piece
     scene, 'bug:<n>:<key>' is one of the scattered sightings. Only the
     scene parts can be watched changing — the lifecycle machinery is bound
     to a single named slot. */
  cardOf(id){
    if (!id) return null;
    if (id.startsWith('find:')) return id.slice(5);
    if (id.startsWith('bug:')) return id.slice(id.indexOf(':', 4) + 1);
    return null;
  }

  /** What the watch bar should show, if anything. */
  watchState(){
    if (!this.watching) return null;
    if (this.life){
      return { key: this.watching.key, pct: this.life.progress, caption: this.life.caption,
               beat: this.life.i + 1, beats: 8 };
    }
    return { key: this.watching.key, pct: this.watching.t / WATCH_SECONDS };
  }

  /* Which way is the nearest thing still missing, and how far? Without this
     the garden is sixty metres of shrubbery and a player who has found eight
     cards has no way to look for the ninth except walking all of it again. */
  nearestUnfound(){
    let best = null, bestD = Infinity;
    for (const m of this.markers.values()){
      if (m.keys.every(k => nb.isFound(this.N, k))) continue;
      const p = m.mote.position;
      const d = Math.hypot(p.x - this.player.position.x, p.z - this.player.position.z);
      if (d < bestD){ bestD = d; best = p; }
    }
    /* The scattered sightings count too, and usually win: a card you are
       missing is far more likely to be on a leaf in the next bed than in
       the one set-piece scene that holds it, three hundred metres away. */
    const near = this.bugs.nearestOf(this.player.position, k => !nb.isFound(this.N, k));
    if (near && near.distance < bestD){ bestD = near.distance; best = near.position; }
    if (!best) return null;
    // angle relative to where the player is facing: 0 = dead ahead
    const to = Math.atan2(-(best.x - this.player.position.x), -(best.z - this.player.position.z));
    let rel = to - this.player.yaw;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    return { metres: Math.round(bestD), rel };
  }

  /* ── watching a stage turn over ── */
  tickWatch(dt){
    if (!this.watching) return;
    const stillLooking = this.interaction.current?.id === 'find:' + this.watching.key;
    if (!stillLooking){ this.watching = null; this.flush(); return; }

    // the egg clutch plays the whole life story rather than a single swap
    if (this.life){
      const beforeBeat = this.life.i;
      this.life.advance(dt);
      if (this.life.i !== beforeBeat) this.flush();
      if (this.life.done){
        nb.watch(this.N, LIFECYCLE_KEY);
        // tidy up: the leaf is left with the adult, not with the hidden
        // props of every beat that led to it
        morph(this.parts, LIFECYCLE_KEY, 'adult', 1);
        this.watching = null;
        this.life = null;
        this.flush();
      }
      return;
    }

    this.watching.t += dt;
    if (this.watching.t < WATCH_SECONDS) return;
    const key = this.watching.key, b = BECOMES[key];
    this.watching = null;
    const next = nb.watch(this.N, key);
    if (b){
      morph(this.parts, key, b.model, b.count);
      // the thing it turned into stands where the old one did, and is findable
      const slot = this.parts.get(key);
      if (slot && !this.world.interactables.some(i => i.id === 'find:' + b.key)){
        this.world.interactables.push({
          id: 'find:' + b.key, object: slot.group.children[0],
          position: slot.group.position.clone(), radius: 2.6,
        });
      }
    }
    void next;
    this.flush();
  }

  /** Is this interactable's card already written up? */
  isDone(id){
    const key = this.cardOf(id);
    if (!key) return true;
    const entry = GUIDE[key];
    // a scattered sighting has nothing to watch, so finding it finishes it
    if (!id.startsWith('find:')) return nb.isFound(this.N, key);
    // a stage you have found but not yet watched is not finished with
    if (entry?.watch && !this.N.watched[key]) return false;
    return nb.isFound(this.N, key);
  }

  promptFor(target){
    const key = this.cardOf(target.id);
    const entry = key && GUIDE[key];
    if (!entry) return null;
    if (!nb.isFound(this.N, key)) return { key: 'E', text: 'Look at it closely' };
    if (target.id.startsWith('find:') && entry.watch && !this.N.watched[key]){
      return { key: 'HOLD', text: `Hold <b>F</b> and keep watching — this one is about to change` };
    }
    const seen = nb.seenCount(this.N, key);
    return { key: '', text: `${entry.name} — already in your notebook` +
      (seen > 1 ? ` (seen ${seen} times in the garden)` : '') };
  }

  /* ── GameActions ── */
  interact(){
    if (this.panel || this.griffin.mounted) return;
    const t = this.interaction.current;
    const key = t && this.cardOf(t.id);
    if (!key) return;
    // count the sighting once, however often it is looked at again
    if (!this.inspected.has(t.id)){ this.inspected.add(t.id); nb.spot(this.N, key); }
    if (nb.isFound(this.N, key)){ this.pending = null; this.panel = 'card'; this.N.opened = key; }
    else { this.pending = key; this.panel = 'find'; }
    document.exitPointerLock?.();
    this.flush();
  }

  /** The two buttons on the find panel. */
  guess(side){
    if (!this.pending) return;
    nb.record(this.N, this.pending, side);
    this.N.opened = this.pending;
    this.pending = null;
    this.panel = 'card';
    this.flush();
  }

  startWatching(){
    const t = this.interaction.current;
    if (!t || !t.id.startsWith('find:') || this.panel) return;
    const key = t.id.slice(5);
    if (!GUIDE[key]?.watch || this.N.watched[key] || !nb.isFound(this.N, key)) return;
    this.watching = { key, t: 0 };
    if (key === LIFECYCLE_KEY && !this.life){
      const slot = this.parts.get(LIFECYCLE_KEY);
      this.life = new Lifecycle(slot.group, (beat) => {
        if (beat.reveal && nb.observe(this.N, beat.reveal)){
          nb.note(this.N, `You watched it happen: <b>${GUIDE[beat.reveal].name}</b> added to the notebook.`, 'good');
        }
      });
    }
    this.flush();
  }

  /* Letting go pauses rather than resets. Forty seconds is a long time to
     hold a key, and losing the whole sequence to a twitch would be cruel. */
  stopWatching(){ if (this.watching){ this.watching = null; this.flush(); } }

  /** Step the hand lens. Zooming also tightens the reach: a magnified view
      of something four metres away is not what the lens is for. */
  zoom(dir){
    if (this.panel) return;
    // in the air the same keys change height rather than magnification
    if (this.rig.aerial){ const a = this.rig.cycleAerial(dir); this.flush(); return a; }
    const step = this.rig.cycleZoom(dir);
    this.flush();
    return step;
  }

  aerialState(){
    return this.rig.aerial ? { step: this.rig.aerial, metres: HEIGHTS[this.rig.aerial].h } : null;
  }

  /* Up into the air and back down. It does NOT pause the game: you keep
     walking, and watching the garden move under you is most of what the view
     is for. Z and X change height while you are up there. */
  toggleAerial(){
    if (this.griffin.mounted) return;        // you are already in the air
    if (this.panel){ this.panel = null; this.pending = null; }
    this.rig.cycleAerial();
    this.flush();
  }

  /* The griffin. G calls it or sends it away; R climbs on or lands. */
  griffinCall(){
    if (this.panel) return;
    const g = this.griffin;
    if (g.mounted){ nb.note(this.N, 'Land first — press <b>R</b> — and then you can send your griffin away.', ''); }
    else if (g.here){ g.dismiss(); }
    else if (g.summon(this.player)){
      nb.tell(this.N, 'griffin', 'Your <b>griffin</b> is coming! Walk up to it and press <b>R</b> to climb on.', 'good');
    }
    this.flush();
  }

  griffinRide(){
    if (this.panel) return;
    const g = this.griffin;
    if (g.riding){ g.land(); this.flush(); return; }
    if (g.mounted) return;                   // already coming down
    const why = g.mount(this.player);
    if (!why){
      this.rig.aerial = 0;
      nb.tell(this.N, 'flying', 'You are flying! Look where you want to go and press <b>W</b>. <b>Space</b> climbs, <b>C</b> dives, <b>R</b> lands.', 'good');
    } else if (why === 'away'){
      nb.note(this.N, 'Your griffin is not here. Press <b>G</b> to call it.', '');
    } else if (why === 'far'){
      nb.note(this.N, 'Walk right up to your griffin, then press <b>R</b>.', '');
    }
    this.flush();
  }

  griffinTap(){
    if (!this.griffin.here) this.griffinCall();
    else this.griffinRide();
  }

  openNotebook(){ this.panel = this.panel === 'notebook' ? null : 'notebook'; document.exitPointerLock?.(); this.flush(); }
  openCard(key){ this.N.opened = key; this.panel = 'card'; this.flush(); }
  close(){
    this.panel = null; this.pending = null;
    if (this.rig.aerial) this.rig.aerial = 0;     // Escape lands you too
    this.flush();
  }
  uiOpen(){ return !!this.panel; }
  /* Losing the mouse stops the player too. The input manager drops whatever
     was held at the same moment; this clears what that held key had already
     built up, so releasing the mouse always brings you to a stop. */
  lockChanged(locked){ if (!locked) this.player.velocity.set(0, 0, 0); this.flush(); }
  hint(){ nb.note(this.N, nb.hint(this.N), ''); this.flush(); }
  /* Start over. `stopping` matters: the reload is not instant, the loop runs
     on until it happens and `pagehide` fires on the way out, so without it
     the position and the notebook are written straight back after being
     cleared and Start over leaves you exactly where you were. */
  restart(){
    this.stopping = true;
    clear();
    this.N = nb.freshNotebook();
    this.panel = null;
    location.reload();
  }

  flush(){
    this.hud.last = 0;
    /* A beat change calls this mid-sequence, so it must report the watch
       honestly — publishing null here blanked the caption the moment it
       changed, which is every time it mattered. */
    this.hud.publish(this.N, { prompt: null, panel: this.panel, pending: this.pending,
      watching: this.watchState(), guide: this.nearestUnfound(), map: this.pose(),
      aerial: this.aerialState(), time: this.timeState(), griffin: this.griffin.hudState(),
      zoom: this.rig.zoom ? { step: this.rig.zoom, x: magnification(this.rig.fov) } : null },
      performance.now());
    if (!this.stopping) save(this.N);
  }

  start(){ this.frame(); }
}
