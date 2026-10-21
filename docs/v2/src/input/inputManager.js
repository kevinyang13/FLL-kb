/* Raw browser input → the per-step input object and discrete actions.
   Keyboard, mouse and touch are three sources filling the same fields, so
   on a desktop the touch fields simply stay at zero. What a key does lives
   in ON_PRESS, so adding one is a single line. */
import { emptyInput } from '../core/controls.js';
import { stickVector, LOOK_SENSITIVITY, MOUSE_SENSITIVITY } from './touchMath.js';

const PREVENT = new Set(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','Tab']);

/* Tap forward twice quickly and you keep running for as long as you hold it.
   Shift does the same thing, but a nine-year-old on a laptop finds the
   double tap first: it is what every game they have played already does. */
const FORWARD = new Set(['KeyW', 'ArrowUp']);
const DOUBLE_TAP = 320;          // ms between the two taps

const ON_PRESS = {
  KeyE: a => a.interact(),
  Space: a => a.interact(),
  Tab: a => a.openNotebook(),
  KeyN: a => a.openNotebook(),
  Escape: a => a.close(),
  KeyH: a => a.hint(),
  KeyM: a => a.toggleAerial(),
  KeyT: a => a.cycleTime(),
  KeyL: a => a.toggleLog(),
  KeyG: a => a.griffin(),
  KeyR: a => a.ride(),
  KeyZ: a => a.zoom(1),
  KeyX: a => a.zoom(-1),
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
    this.sprint = false;         // running from a double tap, not from Shift
    this.lastForward = -1e9;

    addEventListener('keydown', e => {
      if (PREVENT.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      if (FORWARD.has(e.code)){
        /* Held keys repeat, and a repeat is not a new tap — `e.repeat` is
           already filtered out above, so this only ever sees a real press. */
        const now = performance.now();
        if (now - this.lastForward < DOUBLE_TAP) this.sprint = true;
        this.lastForward = now;
      }
      this.pressed.add(e.code);
      ON_PRESS[e.code]?.(this.actions);
      const hold = ON_HOLD[e.code];
      if (hold) this.actions[hold[0]]?.();
    });
    addEventListener('keyup', e => {
      this.pressed.delete(e.code);
      // letting go of forward ends the run; the next double tap starts it again
      if (FORWARD.has(e.code)) this.sprint = false;
      const hold = ON_HOLD[e.code];
      if (hold) this.actions[hold[1]]?.();
    });
    /* Letting go of the keyboard is the one event a browser is allowed to
       lose, and losing it means the player walks forever. A key is only
       held while this page is both focused and visible, so every event that
       can interrupt either one drops everything held:

       - window blur: another window took the keyboard
       - visibilitychange: the tab went to the background
       - pointerlockchange: this is the one that bites. Taking or releasing
         the mouse puts a browser notification bar on screen, and the keyup
         for a key held at that moment arrives at the bar, not at the page.
         Click to look around while walking forward and you keep walking
         with nothing held down and no way to stop. */
    const release = () => this.releaseAll();
    addEventListener('blur', release);
    addEventListener('contextmenu', release);
    document.addEventListener('visibilitychange', () => { if (document.hidden) release(); });

    // the wheel is the obvious thing to reach for, so it steps the lens too
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const now = performance.now();
      if (now - (this._lastWheel || 0) < 220) return;   // one step per flick
      this._lastWheel = now;
      this.actions.zoom(e.deltaY < 0 ? 1 : -1);
    }, { passive: false });

    canvas.addEventListener('click', () => {
      if (!this.pointerLocked && !this.actions.uiOpen()) canvas.requestPointerLock?.();
      else if (this.pointerLocked) this.actions.interact();
    });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === canvas;
      release();
      this.actions.lockChanged(this.pointerLocked);
    });
    document.addEventListener('pointerlockerror', release);
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

  /** Drop everything held: keys, the joystick, and any look not yet used.
      A stale look delta is the same bug one step along — it arrives as a
      single jerk of the view the moment the game starts stepping again. */
  releaseAll(){
    for (const code of this.pressed){
      const hold = ON_HOLD[code];
      if (hold) this.actions[hold[1]]?.();      // a held F must be let go properly
    }
    this.pressed.clear();
    this.sprint = false;
    this.touchMove = { x: 0, y: 0 };
    this.lookTouch = null;
    this.input.yaw = this.input.pitch = 0;
  }

  /** Called by the touch joystick; same fields the keyboard writes. */
  setTouchMove(v){ this.touchMove = v; }

  /** The merged input for one simulation step. */
  consume(){
    const i = this.input;
    const key = (a, b) => (this.pressed.has(a) ? 1 : 0) - (this.pressed.has(b) ? 1 : 0);
    i.forward = key('KeyW', 'KeyS') || key('ArrowUp', 'ArrowDown') || -this.touchMove.y;
    i.strafe  = key('KeyD', 'KeyA') || key('ArrowRight', 'ArrowLeft') || this.touchMove.x;
    i.run = this.sprint || this.pressed.has('ShiftLeft') || this.pressed.has('ShiftRight');
    i.crouch = this.pressed.has('ControlLeft') || this.pressed.has('KeyC');
    i.up = this.pressed.has('Space');        // climbing, on the griffin
    return i;
  }
}
export { stickVector };
