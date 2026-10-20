/* The hours of the day the garden can be seen in.

   Everything that changes with the light lives here as numbers: the sky
   gradient, the key light's colour, strength and where it stands in the sky,
   how much fill light bounces around, how far you can see, and how much of
   the star field shows. The engine interpolates between two of these; it
   decides nothing about how any hour looks.

   `elev` is the key light's height above the horizon in radians and `azim`
   is its bearing, so a low sun at sunrise and a high moon at midnight are
   the same two numbers with different values. At night the key light IS the
   moon — same light, cool and weak instead of warm and strong, which is why
   a full-moon night still casts shadows. */

export const PHASES = [
  {
    id: 'dawn', name: 'Sunrise',
    sky: { top: 0x6F9BD4, horizon: 0xF7C9A0, ground: 0x6B5F4A },
    key: { color: 0xFFC286, intensity: 2.1, elev: 0.13, azim: 1.75 },
    hemi: 1.05, exposure: 1.1, fog: { near: 60, far: 340 },
    stars: 0.18, luminary: { color: 0xFFD2A0, size: 52 },
  },
  {
    id: 'morning', name: 'Morning',
    sky: { top: 0x7FB2E8, horizon: 0xDCE9F3, ground: 0x6E6450 },
    key: { color: 0xFFF2DC, intensity: 2.9, elev: 0.62, azim: 1.5 },
    hemi: 1.3, exposure: 1.16, fog: { near: 85, far: 410 },
    stars: 0, luminary: { color: 0xFFF6E6, size: 30 },
  },
  {
    id: 'noon', name: 'Midday',
    sky: { top: 0x7FB2E8, horizon: 0xD9E7F2, ground: 0x6E6450 },
    key: { color: 0xFFF6E8, intensity: 3.1, elev: 1.12, azim: 0.9 },
    hemi: 1.35, exposure: 1.18, fog: { near: 90, far: 420 },
    stars: 0, luminary: { color: 0xFFFBF0, size: 26 },
  },
  {
    id: 'golden', name: 'Afternoon',
    sky: { top: 0x86B4DF, horizon: 0xF0DCC0, ground: 0x6A5C44 },
    key: { color: 0xFFDCA8, intensity: 2.7, elev: 0.38, azim: -1.1 },
    hemi: 1.2, exposure: 1.16, fog: { near: 80, far: 400 },
    stars: 0, luminary: { color: 0xFFE3B4, size: 38 },
  },
  {
    id: 'sunset', name: 'Sunset',
    sky: { top: 0x4E74B4, horizon: 0xF2A264, ground: 0x5A4836 },
    key: { color: 0xFF9A52, intensity: 1.9, elev: 0.08, azim: -1.7 },
    hemi: 0.85, exposure: 1.08, fog: { near: 55, far: 320 },
    stars: 0.22, luminary: { color: 0xFF9E58, size: 58 },
  },
  {
    id: 'dusk', name: 'Dusk',
    sky: { top: 0x27386E, horizon: 0x8C7CA0, ground: 0x3A3348 },
    key: { color: 0xB9A8D8, intensity: 0.75, elev: 0.06, azim: -2.1 },
    hemi: 0.5, exposure: 1.0, fog: { near: 45, far: 260 },
    stars: 0.62, luminary: { color: 0xC9B6E0, size: 40 },
  },
  {
    id: 'night', name: 'Full moon',
    sky: { top: 0x0B1430, horizon: 0x24345C, ground: 0x141A2A },
    key: { color: 0xB7CCEE, intensity: 0.62, elev: 0.82, azim: 2.4 },
    hemi: 0.3, exposure: 0.95, fog: { near: 30, far: 200 },
    stars: 1, luminary: { color: 0xEDF2FF, size: 46 },
  },
];

export const PHASE_IDS = PHASES.map(p => p.id);
/* Wraps both ways, and refuses to return undefined. `undefined % 7` is NaN,
   and a NaN index gives undefined, which then fails one frame later
   somewhere else entirely — so a bad index becomes midday here instead. */
export const phaseAt = i => {
  const n = PHASES.length;
  const k = Number.isFinite(i) ? Math.trunc(i) : 2;
  return PHASES[((k % n) + n) % n];
};
