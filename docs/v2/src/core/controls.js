/* The shape of one simulation step's input. Keyboard, mouse and touch are
   three sources that fill in the same object, so the player code never asks
   where a movement came from. */
export function emptyInput(){
  return { forward: 0, strafe: 0, yaw: 0, pitch: 0, run: false, crouch: false };
}
export const SIM_HZ = 20;
export const SIM_DT = 1 / SIM_HZ;
export const MAX_CATCHUP = 5;
