/* Composition root: the only file allowed to import from every layer.
   It wires input → engine → store → interface and starts the heartbeat. */
import { GameLoop } from './engine/gameLoop.js';
import { InputManager } from './input/inputManager.js';
import { hud } from './state/store.js';
import { mountHud, renderHud } from './ui/hud.js';
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
  startWatching: () => game.startWatching(),
  stopWatching: () => game.stopWatching(),
  uiOpen: () => game.uiOpen(),
  lockChanged: () => game.lockChanged(),
});
game.attachInput(input);

mountHud(document.getElementById('ui'));
mountTouch(input);
hud.subscribe(renderHud);
renderHud(hud.get());

document.getElementById('loading')?.remove();
game.start();
game.flush();
