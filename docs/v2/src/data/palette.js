/* Colours and surface properties, in one place so the garden reads as one
   material system rather than a pile of unrelated meshes. Roughness and
   metalness are what make a PBR surface look like a thing instead of a colour. */
export const SURFACE = {
  soil:      { color: 0x4A3B2C, roughness: 0.97, metalness: 0 },
  leaf:      { color: 0x4E7A33, roughness: 0.62, metalness: 0, sheen: 0.5 },
  leafUnder: { color: 0x6F8F4A, roughness: 0.85, metalness: 0 },
  stem:      { color: 0x5C7A35, roughness: 0.8,  metalness: 0 },
  petalY:    { color: 0xE8B53A, roughness: 0.55, metalness: 0 },
  petalW:    { color: 0xF2EFE4, roughness: 0.6,  metalness: 0 },
  wood:      { color: 0x8A6A45, roughness: 0.88, metalness: 0 },
  terracotta:{ color: 0xA7643E, roughness: 0.9,  metalness: 0 },
  glass:     { color: 0xDCE8E2, roughness: 0.08, metalness: 0, opacity: 0.22 },
  lacewing:  { color: 0x9ED46A, roughness: 0.45, metalness: 0 },
  wing:      { color: 0xCFE6C0, roughness: 0.25, metalness: 0, opacity: 0.38 },
  larva:     { color: 0xB9A074, roughness: 0.7,  metalness: 0 },
  egg:       { color: 0xE9EBD2, roughness: 0.5,  metalness: 0 },
  aphid:     { color: 0x97C24A, roughness: 0.55, metalness: 0 },
  ant:       { color: 0x2A1E18, roughness: 0.5,  metalness: 0.05 },
  ladybug:   { color: 0xC4291F, roughness: 0.3,  metalness: 0.05 },
  path:      { color: 0x8C8375, roughness: 0.95, metalness: 0 },
  lawn:      { color: 0xFFFFFF, roughness: 0.9,  metalness: 0 },
  hedge:     { color: 0x35632E, roughness: 0.88, metalness: 0 },
  hill:      { color: 0x3C5E3A, roughness: 1,    metalness: 0 },
  fence:     { color: 0x7A6448, roughness: 0.92, metalness: 0 },
  water:     { color: 0xFFFFFF, roughness: 0.12, metalness: 0.28, opacity: 0.84 },
  falls:     { color: 0xFFFFFF, roughness: 0.2,  metalness: 0.08, opacity: 0.8 },
  rock:      { color: 0x6E6A63, roughness: 0.95, metalness: 0 },
};

export const SUN = { color: 0xFFF6E8, intensity: 3.1 };
export const SKY = { top: 0x7FB2E8, horizon: 0xD9E7F2, ground: 0x6E6450 };
