/* Pure maths for the touch joystick, kept apart from the DOM so it can be
   reasoned about on its own. The stick anchors wherever the thumb lands
   inside its zone rather than sitting at a fixed point. */
export function stickVector(origin, point, radius){
  const dx = point.x - origin.x, dy = point.y - origin.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-4) return { x: 0, y: 0, knobX: 0, knobY: 0 };
  const clamped = Math.min(len, radius);
  const nx = dx / len, ny = dy / len;
  return { x: nx * (clamped / radius), y: ny * (clamped / radius), knobX: nx * clamped, knobY: ny * clamped };
}
export const LOOK_SENSITIVITY = 0.0045;
export const MOUSE_SENSITIVITY = 0.0022;
