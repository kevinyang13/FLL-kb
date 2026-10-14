/* What the interface is allowed to ask the game to do. The UI imports this
   and nothing from engine/ — GameLoop registers itself here, so the two
   never reference each other directly. */
let active = null;
export function setActiveGame(game){ active = game; }
export const commands = {
  feed: (i, kind) => active?.feed(i, kind),
  release: i => active?.release(i),
  shelter: i => active?.shelter(i),
  separate: i => active?.separate(i),
  collectEgg: () => active?.collectEgg(),
  plant: () => active?.plant(),
  harvest: () => active?.harvest(),
  spray: () => active?.spray(),
  setTemp: v => active?.setTemp(v),
  nextDay: () => active?.nextDay(),
  closePanel: () => active?.closePanel(),
  restart: () => active?.restart(),
};
