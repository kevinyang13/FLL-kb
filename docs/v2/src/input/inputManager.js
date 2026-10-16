/* Raw browser input → the per-step input object and discrete actions.
   Keyboard, mouse and touch are three sources filling the same fields, so
   on a desktop the touch fields simply stay at zero. What a key does lives
   in ON_PRESS, so adding one is a single line. */
import { emptyInput } from '../core/controls.js';
import { stickVector, LOOK_SENSITIVITY, MOUSE_SENSITIVITY } from './touchMath.js';

const PREVENT = new Set(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','Tab']);

const ON_PRESS = {
  KeyE: a => a.interact(),
  Space: a => a.interact(),
  Tab: a => a.openNotebook(),
  KeyN: a => a.openNotebook(),
  Escape: a => a.close(),
  KeyH: a => a.hint(),
};

/* Held, not pressed: watching something change means staying put and keeping
   your eyes on it, which is the whole idea. */
const ON_HOLD = { KeyF: ['startWatching', 'stopWatching'] };

export class InputManager {
  constructor(canvas, actions){
    this.canvas = canvas; this.actions = actions;
    this.input = emptyInput();
    this.pressed = new Set();
    this.touchMove = { x: 0, y: 0 };
    this.pointerLocked = false;

    addEventListener('keydown', e => {
      if (PREVENT.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.pressed.add(e.code);
      ON_PRESS[e.code]?.(this.actions);
      const hold = ON_HOLD[e.code];
      if (hold) this.actions[hold[0]]?.();
    });
    addEventListener('keyup', e => {
      this.pressed.delete(e.code);
      const hold = ON_HOLD[e.code];
      if (hold) this.actions[hold[1]]?.();
    });
    addEventListener('blur', () => this.pressed.clear());

    canvas.addEventListener('click', () => {
      if (!this.pointerLocked && !this.actions.uiOpen()) canvas.requestPointerLock?.();
      else if (this.pointerLocked) this.actions.interact();
    });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === canvas;
      this.actions.lockChanged(this.pointerLocked);
    });
    addEventListener('mousemove', e => {
      if (!this.pointerLocked) return;
      this.input.yaw += e.movementX * MOUSE_SENSITIVITY;
      this.input.pitch += e.movementY * MOUSE_SENSITIVITY;
    });

    // Touch look: drag anywhere on the canvas that is not the joystick zone.
    this.lookTouch = null;
    canvas.addEventListener('touchstart', e => {
      const t = e.changedTouches[0];
      if (this.lookTouch === null){ this.lookTouch = t.identifier; this.lx = t.clientX; this.ly = t.clientY; }
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      for (const t of e.changedTouches){
        if (t.identifier !== this.lookTouch) continue;
        this.input.yaw += (t.clientX - this.lx) * LOOK_SENSITIVITY;
        this.input.pitch += (t.clientY - this.ly) * LOOK_SENSITIVITY;
        this.lx = t.clientX; this.ly = t.clientY;
      }
    }, { passive: true });
    const end = e => { for (const t of e.changedTouches) if (t.identifier === this.lookTouch) this.lookTouch = null; };
    canvas.addEventListener('touchend', end, { passive: true });
    canvas.addEventListener('touchcancel', end, { passive: true });
  }

  /** Called by the touch joystick; same fields the keyboard writes. */
  setTouchMove(v){ this.touchMove = v; }

  /** The merged input for one simulation step. */
  consume(){
    const i = this.input;
    const key = (a, b) => (this.pressed.has(a) ? 1 : 0) - (this.pressed.has(b) ? 1 : 0);
    i.forward = key('KeyW', 'KeyS') || key('ArrowUp', 'ArrowDown') || -this.touchMove.y;
    i.strafe  = key('KeyD', 'KeyA') || key('ArrowRight', 'ArrowLeft') || this.touchMove.x;
    i.run = this.pressed.has('ShiftLeft') || this.pressed.has('ShiftRight');
    i.crouch = this.pressed.has('ControlLeft') || this.pressed.has('KeyC');
    return i;
  }
}
export { stickVector };
