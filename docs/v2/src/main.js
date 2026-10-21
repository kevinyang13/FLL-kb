/* Composition root: the only file allowed to import from every layer.
   It wires input → engine → store → interface and starts the heartbeat. */
import { GameLoop } from './engine/gameLoop.js';
import { InputManager } from './input/inputManager.js';
import { hud } from './state/store.js';
import { mountHud, renderHud, toggleLog } from './ui/hud.js';
import { setMapTerrain } from './ui/minimap.js';
import { mountTouch } from './ui/touchControls.js';
import { CSS } from './ui/styles.js';

const style = document.createElement('style');
style.textContent = CSS;
document.head.appendChild(style);

const canvas = document.getElementById('view');
const game = new GameLoop(canvas, hud);
window.__game = game;                       // the touch Use button and tests reach it here

const input = new InputManager(canvas, {
  interact: () => game.interact(),
  openNotebook: () => game.openNotebook(),
  close: () => game.close(),
  hint: () => game.hint(),
  toggleAerial: () => game.toggleAerial(),
  cycleTime: () => game.cycleTime(),
  toggleLog: () => toggleLog(),
  griffin: () => game.griffinCall(),
  ride: () => game.griffinRide(),
  zoom: dir => game.zoom(dir),
  startWatching: () => game.startWatching(),
  stopWatching: () => game.stopWatching(),
  uiOpen: () => game.uiOpen(),
  lockChanged: locked => game.lockChanged(locked),
});
game.attachInput(input);

mountHud(document.getElementById('ui'));
setMapTerrain(game.mapData());      // the garden never changes shape
mountTouch(input);
hud.subscribe(renderHud);
renderHud(hud.get());

document.getElementById('loading')?.remove();
game.start();
game.flush();
