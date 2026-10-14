/* The on-screen joystick. It anchors where the thumb first lands inside its
   zone rather than sitting at a fixed point, so it works for a small hand and
   a large one. Look is a drag anywhere else, handled in the input manager. */
import { stickVector } from '../input/touchMath.js';

export function mountTouch(input){
  const touchable = matchMedia('(pointer: coarse)').matches;
  const zone = document.getElementById('touch');
  if (!touchable) return false;
  zone.classList.remove('hidden');

  const stick = document.getElementById('stick'), knob = document.getElementById('knob');
  const R = 50;
  let id = null, origin = null;

  const begin = e => {
    const t = e.changedTouches[0];
    id = t.identifier;
    const r = stick.getBoundingClientRect();
    origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    move(e);
  };
  const move = e => {
    for (const t of e.changedTouches){
      if (t.identifier !== id) continue;
      const v = stickVector(origin, { x: t.clientX, y: t.clientY }, R);
      knob.style.transform = `translate(${v.knobX}px, ${v.knobY}px)`;
      input.setTouchMove({ x: v.x, y: v.y });
    }
  };
  const end = e => {
    for (const t of e.changedTouches){
      if (t.identifier !== id) continue;
      id = null;
      knob.style.transform = '';
      input.setTouchMove({ x: 0, y: 0 });
    }
  };
  stick.addEventListener('touchstart', begin, { passive: true });
  stick.addEventListener('touchmove', move, { passive: true });
  stick.addEventListener('touchend', end, { passive: true });
  stick.addEventListener('touchcancel', end, { passive: true });
  return true;
}
