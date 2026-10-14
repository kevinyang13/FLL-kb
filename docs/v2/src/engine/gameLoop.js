/* The running game: composition root and heartbeat. One requestAnimationFrame
   runs, in order:
     1. fixed 20 Hz simulation steps (movement), up to 5 catch-up steps
     2. per-frame work: camera, insect animation, flower sync
     3. what the crosshair is pointing at, then the throttled HUD snapshot
   Day advancement is deliberately NOT on the clock — a day passes when the
   player ends it, so a kid can stand and look at a leaf for as long as they like. */
import * as THREE from 'three';
import { SIM_DT, MAX_CATCHUP } from '../core/controls.js';
import * as garden from '../core/garden.js';
import { buildLayout } from '../worldgen/layout.js';
import { buildSky } from './sky.js';
import { buildWorld, syncFlowers } from './world.js';
import { PlayerController } from './player.js';
import { CameraRig } from './cameraRig.js';
import { Interaction } from './interaction.js';
import { HudPublisher } from './hudPublisher.js';
import { Population } from '../entities/population.js';
import { aphid, ant, ladybug, eggCluster, larva, adultLacewing } from '../entities/models.js';
import { setActiveGame } from '../session/commands.js';
import { save, load, clear } from '../persistence/save.js';

export class GameLoop {
  constructor(canvas, store, seed = 7){
    this.store = store;
    this.G = load() || garden.freshGarden();
    if (!this.G.log.length) garden.say(this.G, 'Two eggs on the bench, each on its silk stalk. Walk up to the bench and look.', '');

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(68, 1, 0.01, 90);

    buildSky(this.scene, this.renderer);
    this.layout = buildLayout(seed);
    this.world = buildWorld(this.scene, this.layout);

    this.player = new PlayerController(this.layout);
    this.rig = new CameraRig(this.camera);
    this.interaction = new Interaction(this.world.interactables);
    this.hud = new HudPublisher(store);

    this.aphids   = new Population(this.scene, aphid, 40, 1);
    this.ants     = new Population(this.scene, ant, 14, 2);
    this.ladybugs = new Population(this.scene, ladybug, 6, 3);
    this.eggs     = new Population(this.scene, () => eggCluster(4), 6, 4);
    this.wild     = new Population(this.scene, () => larva(1.6), 8, 5);
    this.adults   = new Population(this.scene, adultLacewing, 8, 6);

    this.clock = new THREE.Clock();
    this.acc = 0;
    this.panel = null;
    this.helpOpen = false;
    setActiveGame(this);
    addEventListener('resize', () => this.resize());
    addEventListener('pagehide', () => save(this.G));
    this.resize();
  }

  resize(){
    const w = innerWidth, h = innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  attachInput(input){ this.input = input; }

  frame = () => {
    requestAnimationFrame(this.frame);
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const now = performance.now();

    // 1 — fixed simulation steps
    if (this.input && !this.panel){
      this.acc += dt;
      let steps = 0;
      while (this.acc >= SIM_DT && steps < MAX_CATCHUP){
        this.player.simStep(this.input.consume(), SIM_DT);
        this.acc -= SIM_DT; steps++;
      }
      if (steps === MAX_CATCHUP) this.acc = 0;
    }

    // 2 — per-frame
    this.rig.update(this.player, dt);
    const t = now / 1000;
    syncFlowers(this.world.flowerGroup, this.layout, this.G.pop.flowers);
    this.syncPopulations();
    for (const p of [this.aphids, this.ants, this.ladybugs, this.wild, this.adults]) p.update(t);

    // 3 — crosshair target, then the HUD
    const target = this.panel ? null : this.interaction.update(this.camera, this.player.position);
    this.renderer.render(this.scene, this.camera);
    this.hud.publish(this.G, {
      prompt: target ? this.promptFor(target) : null,
      panel: this.panel, help: this.helpOpen,
      locked: this.input?.pointerLocked ?? false,
    }, now);
  };

  syncPopulations(){
    const p = this.G.pop, sites = this.world.leafSites, soil = this.world.soilSites;
    this.aphids.sync(Math.ceil(p.aphids / 4), sites);
    this.ants.sync(p.ants * 2, soil);
    this.ladybugs.sync(p.ladybugs, sites);
    this.eggs.sync(p.eggs, sites);
    this.wild.sync(p.wildLarvae, sites);
    this.adults.sync(p.lacewings, sites);
  }

  promptFor(target){
    if (target.id === 'bench') return { key: 'E', text: 'Open the rearing bench' };
    const p = this.G.pop;
    if (p.eggs > 0 && garden.firstEmptyCup(this.G) >= 0) return { key: 'E', text: 'Collect an egg clutch off the leaves' };
    if (p.aphids >= 6) return { key: 'E', text: `Collect aphids for food (${p.aphids} out here)` };
    return { key: '', text: 'Nothing to take from this plant today' };
  }

  /* ── GameActions: what input is allowed to do ── */
  interact(){
    if (this.panel) return;
    const t = this.interaction.current;
    if (!t) return;
    if (t.id === 'bench') return this.openPanel('bench');
    if (this.G.pop.eggs > 0 && garden.firstEmptyCup(this.G) >= 0) garden.collectEgg(this.G);
    else if (this.G.pop.aphids >= 6) garden.harvestAphids(this.G);
    this.flush();
  }
  toggleBench(){ this.panel ? this.closePanel() : this.openPanel('bench'); }
  toggleHelp(){ this.helpOpen = !this.helpOpen; this.flush(); }
  close(){ if (this.helpOpen) this.helpOpen = false; else this.closePanel(); this.flush(); }
  openPanel(which){
    this.panel = which;
    document.exitPointerLock?.();
    this.flush();
  }
  closePanel(){ this.panel = null; this.flush(); }
  uiOpen(){ return !!this.panel || this.helpOpen; }
  lockChanged(){ this.flush(); }

  feed(i, kind){ garden.feedCup(this.G, i, kind); this.flush(); }
  release(i){ garden.releaseAdult(this.G, i); this.flush(); }
  shelter(i){ garden.toggleShelter(this.G, i); this.flush(); }
  separate(i){ garden.separate(this.G, i); this.flush(); }
  collectEgg(){ garden.collectEgg(this.G); this.flush(); }
  plant(){ garden.plantFlowers(this.G); this.flush(); }
  harvest(){ garden.harvestAphids(this.G); this.flush(); }
  spray(){ garden.sprayPesticide(this.G); this.flush(); }
  setTemp(v){ this.G.temp = v; this.flush(); }
  nextDay(){ if (!this.G.over) { garden.stepDay(this.G); this.flush(); } }
  restart(){ clear(); this.G = garden.freshGarden(); this.panel = null; this.flush(); }

  /** Force an immediate HUD publish after an action, bypassing the throttle. */
  flush(){
    this.hud.last = 0;
    this.hud.publish(this.G, { prompt: null, panel: this.panel, help: this.helpOpen }, performance.now());
    save(this.G);
  }

  start(){ this.frame(); }
}
