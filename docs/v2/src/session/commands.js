/* What the interface is allowed to ask the game to do. The UI imports this
   and nothing from engine/ — GameLoop registers itself here, so the two
   never reference each other directly. */
let active = null;
export function setActiveGame(game){ active = game; }
export const commands = {
  guess: side => active?.guess(side),
  openNotebook: () => active?.openNotebook(),
  openCard: key => active?.openCard(key),
  close: () => active?.close(),
  hint: () => active?.hint(),
  toggleAerial: () => active?.toggleAerial(),
  restart: () => active?.restart(),
};
