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
import { buildLayout } from '../worldgen/layout.js';
import { buildScenes as planScenes } from '../worldgen/scenes.js';
import { buildSky } from './sky.js';
import { buildWorld } from './world.js';
import { buildScenes, morph, animateScenes } from './sceneProps.js';
import { PlayerController } from './player.js';
import { CameraRig } from './cameraRig.js';
import { Interaction } from './interaction.js';
import { HudPublisher } from './hudPublisher.js';
import { setActiveGame } from '../session/commands.js';
import { save, load, clear } from '../persistence/save.js';

/** How long a watched stage takes to turn over, in seconds. */
const WATCH_SECONDS = 7;

/** What a watched stage becomes, as a model name and how many. */
const BECOMES = {
  'lacewing-egg':   { model: 'larva',   count: 1, key: 'lacewing-larva' },
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
    this.camera = new THREE.PerspectiveCamera(68, 1, 0.01, 150);

    buildSky(this.scene, this.renderer);
    this.layout = buildLayout(seed);
    this.world = buildWorld(this.scene, this.layout);
    this.scenes = planScenes();
    this.parts = buildScenes(this.scene, this.scenes, this.world.interactables);

    // anything already watched in a saved notebook is already changed
    for (const key of Object.keys(this.N.watched)){
      const b = BECOMES[key];
      if (b) morph(this.parts, key, b.model, b.count);
    }

    this.player = new PlayerController(this.layout);
    this.rig = new CameraRig(this.camera);
    this.interaction = new Interaction(this.world.interactables);
    this.hud = new HudPublisher(store);

    this.clock = new THREE.Clock();
    this.acc = 0;
    this.panel = null;        // 'find' | 'notebook' | null
    this.pending = null;      // the card being guessed at
    this.watching = null;     // { key, t }
    setActiveGame(this);
    addEventListener('resize', () => this.resize());
    addEventListener('pagehide', () => save(this.N));
    this.resize();
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

    if (this.input && !this.panel){
      this.acc += dt;
      let steps = 0;
      while (this.acc >= SIM_DT && steps < MAX_CATCHUP){
        this.player.simStep(this.input.consume(), SIM_DT);
        this.acc -= SIM_DT; steps++;
      }
      if (steps === MAX_CATCHUP) this.acc = 0;
    }

    this.rig.update(this.player, dt);
    animateScenes(this.parts, now / 1000);
    this.tickWatch(dt);

    const target = this.panel ? null : this.interaction.update(this.camera, this.player.position);
    this.renderer.render(this.scene, this.camera);
    this.hud.publish(this.N, {
      prompt: target ? this.promptFor(target) : null,
      panel: this.panel, pending: this.pending,
      watching: this.watching ? { key: this.watching.key, pct: this.watching.t / WATCH_SECONDS } : null,
    }, now);
  };

  /* ── watching a stage turn over ── */
  tickWatch(dt){
    if (!this.watching) return;
    const stillLooking = this.interaction.current?.id === 'find:' + this.watching.key;
    if (!stillLooking){ this.watching = null; this.flush(); return; }
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
          position: slot.group.position.clone(), radius: 1.8,
        });
      }
    }
    void next;
    this.flush();
  }

  promptFor(target){
    if (!target.id.startsWith('find:')) return null;
    const key = target.id.slice(5);
    const entry = GUIDE[key];
    if (!entry) return null;
    if (!nb.isFound(this.N, key)) return { key: 'E', text: 'Look at it closely' };
    if (entry.watch && !this.N.watched[key]){
      return { key: 'HOLD', text: `Hold <b>F</b> and keep watching — this one is about to change` };
    }
    return { key: '', text: `${entry.name} — already in your notebook` };
  }

  /* ── GameActions ── */
  interact(){
    if (this.panel) return;
    const t = this.interaction.current;
    if (!t || !t.id.startsWith('find:')) return;
    const key = t.id.slice(5);
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
  }
  stopWatching(){ if (this.watching){ this.watching = null; this.flush(); } }

  openNotebook(){ this.panel = this.panel === 'notebook' ? null : 'notebook'; document.exitPointerLock?.(); this.flush(); }
  openCard(key){ this.N.opened = key; this.panel = 'card'; this.flush(); }
  close(){ this.panel = null; this.pending = null; this.flush(); }
  uiOpen(){ return !!this.panel; }
  lockChanged(){ this.flush(); }
  hint(){ nb.note(this.N, nb.hint(this.N), ''); this.flush(); }
  restart(){ clear(); this.N = nb.freshNotebook(); this.panel = null; location.reload(); }

  flush(){
    this.hud.last = 0;
    this.hud.publish(this.N, { prompt: null, panel: this.panel, pending: this.pending,
      watching: null }, performance.now());
    save(this.N);
  }

  start(){ this.frame(); }
}
