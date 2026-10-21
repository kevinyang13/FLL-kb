/* The overlay: a crosshair, a progress chip, the log, and the notebook.
   Reads the store, talks to the game only through session commands — it
   imports nothing from engine/.

   Blocks are written only when their markup changes. The HUD publishes about
   eight times a second, and reassigning identical innerHTML rebuilds the
   nodes and restarts their animations, which reads as flicker. */
import { commands } from '../session/commands.js';
import { GUIDE, GROUPS } from '../data/species.js';
import { mountMinimap, drawMinimap } from './minimap.js';

const el = id => document.getElementById(id);

/* Hiding the messages in the bottom corner is a viewer's preference, not
   part of the game, so it lives here and in this browser only. Storage can
   be missing or refuse (a private window), and then the messages simply
   start shown. */
const LOG_PREF = 'lacewing-v2-hide-log';
let logHidden = false;
try { logHidden = localStorage.getItem(LOG_PREF) === '1'; } catch {}
let lastState = null;

/** Show or hide the messages. `L`, or the chip at the top. */
export function toggleLog(){
  logHidden = !logHidden;
  try { localStorage.setItem(LOG_PREF, logHidden ? '1' : '0'); } catch {}
  if (lastState) renderHud(lastState);
}
const lastHtml = new Map();
function setHtml(node, html){
  if (lastHtml.get(node) === html) return;
  lastHtml.set(node, html);
  node.innerHTML = html;
}

export function mountHud(root){
  root.innerHTML = `
    <div id="cross"></div>
    <div id="lens" class="hidden"></div>
    <div id="lensbadge" class="hidden"></div>
    <div id="aerial" class="hidden"></div>
    <div id="status"></div>
    <div id="prompt" class="hidden"></div>
    <div id="watchbar" class="hidden"><div class="track"><i></i></div><span>keep watching…</span></div>
    <div id="guide" class="hidden"><span class="arrow">↑</span><span class="d"></span></div>
    <div id="log"></div>
    <div id="panel" class="hidden"></div>
    <div id="touch" class="hidden">
      <div id="stick"><div id="knob"></div></div>
      <div id="tbtns">
        <button id="tact">Look<br>(E)</button>
        <button id="twatch">Watch<br>(F)</button>
        <button id="tzoom">Zoom<br>(Z)</button>
        <button id="tbook">Notebook</button>
        <button id="tgrif">Griffin</button>
      </div>
    </div>`;
  mountMinimap(root);
  el('tact').onclick = () => window.__game?.interact();
  el('tbook').onclick = () => commands.openNotebook();
  el('tzoom').onclick = () => commands.zoom(1);
  el('tgrif').onclick = () => commands.griffinTap();
  const w = el('twatch');
  const down = e => { e.preventDefault(); window.__game?.startWatching(); };
  const up = () => window.__game?.stopWatching();
  w.addEventListener('touchstart', down, { passive: false });
  w.addEventListener('touchend', up);
  w.addEventListener('mousedown', down);
  addEventListener('mouseup', up);
}

/** The griffin's chips: call it or send it away, and climb on or land. */
function griffinChips(g){
  if (!g || !g.here) return `<button class="chip" onclick="window.__cmd.griffin()"><span>Call griffin</span><b>G</b></button>`;
  if (g.mounted) return `<button class="chip" onclick="window.__cmd.ride()"><span>Land</span><b>R</b></button>`;
  return `<button class="chip" onclick="window.__cmd.ride()"><span>Ride griffin</span><b>R</b></button>` +
         `<button class="chip" onclick="window.__cmd.griffin()"><span>Send away</span><b>G</b></button>`;
}

export function renderHud(state){
  lastState = state;
  /* The first paint happens before the game has published anything, so the
     overlay must survive a half-empty snapshot rather than throwing. */
  const s = { found: {}, watched: {}, log: [], stats: { firstGuessRight: 0, watched: 0 },
              count: 0, total: 0, ...state };
  drawMinimap(s);
  const air = el('aerial');
  if (air){
    const flying = s.griffin && s.griffin.mounted;
    air.classList.toggle('hidden', !s.aerial && !flying);
    if (flying) setHtml(air, `<b>${s.griffin.metres} m</b><span>${s.griffin.speed} m/s · W where you look · Space up · C down · R to land</span>`);
    else if (s.aerial) setHtml(air, `<b>${s.aerial.metres} m</b><span>Aerial view · Z/X height · M to land</span>`);
  }
  setHtml(el('status'),
    `<button class="chip book" onclick="window.__cmd.openNotebook()">
       <span>Notebook</span><b>${s.count}/${s.total}</b></button>` +
    `<button class="chip" onclick="window.__cmd.hint()"><span>Stuck?</span><b>H</b></button>` +
    `<button class="chip" onclick="window.__cmd.toggleAerial()"><span>Look around</span><b>M</b></button>` +
    `<button class="chip" onclick="window.__cmd.cycleTime()"><span>${(s.time && s.time.name) || 'Midday'}</span><b>T</b></button>` +
    griffinChips(s.griffin) +
    `<button class="chip" onclick="window.__toggleLog()"><span>${logHidden ? 'Show messages' : 'Hide messages'}</span><b>L</b></button>`);

  /* The lens: a soft black frame plus the magnification, so it is obvious
     you are looking through something and obvious how to get back out. */
  const lens = el('lens'), badge = el('lensbadge');
  if (s.zoom){
    lens.classList.remove('hidden');
    badge.classList.remove('hidden');
    setHtml(badge, `🔍 <b>${s.zoom.x.toFixed(1)}×</b> <span>Z in · X out</span>`);
  } else { lens.classList.add('hidden'); badge.classList.add('hidden'); }

  const story = !!(s.watching && s.watching.caption);
  const p = el('prompt');
  if (s.prompt && !s.panel && !story){
    p.classList.remove('hidden');
    setHtml(p, (s.prompt.key && s.prompt.key !== 'HOLD' ? `<span class="k">${s.prompt.key}</span>` : '') + s.prompt.text);
  } else p.classList.add('hidden');

  const wb = el('watchbar');
  if (s.watching){
    wb.classList.remove('hidden');
    wb.querySelector('i').style.width = Math.round(s.watching.pct * 100) + '%';
    const label = s.watching.caption
      ? `<b>${s.watching.beat}/${s.watching.beats}</b> ${s.watching.caption}`
      : 'keep watching…';
    setHtml(wb.querySelector('span'), label);
    wb.classList.toggle('story', !!s.watching.caption);
  } else wb.classList.add('hidden');

  /* While the life story is playing it owns the screen: the prompt, the
     compass and the log all stacked on top of it and the lot became
     unreadable at once. */
  const gd = el('guide');
  if (s.guide && !s.panel && !story){
    gd.classList.remove('hidden');
    gd.querySelector('.arrow').style.transform = `rotate(${s.guide.rel}rad)`;
    gd.querySelector('.d').textContent = s.guide.metres <= 2
      ? 'something here — look around you'
      : `${s.guide.metres} m to the nearest thing you have not found`;
  } else gd.classList.add('hidden');

  setHtml(el('log'), story || logHidden ? '' : s.log.slice(0, 4).map(e =>
    `<div class="ent ${e.kind}">${e.text}</div>`).join(''));

  renderPanel(s);
}

let panelSig = null;
let confirmReset = false;      // the notebook's reset asks once before wiping
function renderPanel(s){
  const box = el('panel');
  const sig = JSON.stringify([s.panel, s.pending, s.opened, s.count, Object.keys(s.watched || {}).length, confirmReset]);
  if (!s.panel){
    box.classList.add('hidden');
    if (box.innerHTML){ box.innerHTML = ''; panelSig = null; }
    return;
  }
  if (sig === panelSig) return;
  panelSig = sig;
  box.classList.remove('hidden');
  box.innerHTML = '';
  if (s.panel === 'find') box.appendChild(findSheet(s));
  else if (s.panel === 'card') box.appendChild(cardSheet(s));
  else box.appendChild(notebookSheet(s));
}

const node = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};

/* Before it tells you anything, it asks. Guessing first is what makes the
   answer stick — and a wrong guess costs nothing but a small mark. */
function findSheet(s){
  const e = GUIDE[s.pending];
  const sheet = node('div', 'sheet narrow');
  sheet.appendChild(node('p', 'eyebrow', 'You found something'));
  sheet.appendChild(node('h2', '', 'Helpful, or a pest?'));
  sheet.appendChild(node('p', 'sub', 'Say what you think before you look it up. Being wrong here is free.'));
  const row = node('div', 'acts big');
  const b1 = node('button', 'go', '🌿 Helpful');
  b1.onclick = () => commands.guess('good');
  const b2 = node('button', 'warn', '🐛 A pest');
  b2.onclick = () => commands.guess('pest');
  row.append(b1, b2);
  sheet.appendChild(row);
  void e;
  return sheet;
}

function cardSheet(s){
  const key = s.opened, e = GUIDE[key], rec = s.found[key];
  const sheet = node('div', 'sheet');
  const verdict = e.side === 'good' ? 'Helpful' : 'Pest';
  sheet.appendChild(node('p', 'eyebrow' + (rec && !rec.correct ? ' miss' : ''),
    rec ? (rec.correct ? '✓ You called it' : '✗ Most people get this one wrong too') : 'Field card'));
  sheet.appendChild(node('h2', '', e.name));
  sheet.appendChild(node('p', 'sub', e.sub));
  sheet.appendChild(node('div', 'badge ' + e.side, verdict));
  sheet.appendChild(node('p', 'eats', `<b>Eats:</b> ${e.eats}`));
  sheet.appendChild(node('p', 'fact', e.fact));
  if (e.watch && !s.watched[key]){
    sheet.appendChild(node('p', 'hint', 'This one is not finished. Go back, look at it, and <b>hold F</b> to stay and watch.'));
  }
  if (e.watch && s.watched[key]){
    sheet.appendChild(node('p', 'hint', `You watched this become a <b>${GUIDE[e.watch].name.toLowerCase()}</b>.`));
  }
  const acts = node('div', 'acts');
  const back = node('button', 'go', 'Back to the garden');
  back.onclick = () => commands.close();
  const open = node('button', '', 'Open the notebook');
  open.onclick = () => commands.openNotebook();
  acts.append(back, open);
  sheet.appendChild(acts);
  return sheet;
}

function notebookSheet(s){
  const sheet = node('div', 'sheet');
  sheet.appendChild(node('h2', '', 'Field notebook'));
  sheet.appendChild(node('p', 'sub',
    `${s.count} of ${s.total} found · ${s.stats.firstGuessRight} called right first time · ${s.stats.watched} watched changing`));

  for (const [gk, g] of Object.entries(GROUPS)){
    const row = node('div', 'group');
    row.appendChild(node('h3', '', g.label));
    const strip = node('div', 'strip');
    g.keys.forEach(k => {
      const e = GUIDE[k], got = !!s.found[k];
      const c = node('button', 'ncard' + (got ? ' got ' + e.side : ''));
      c.innerHTML = got
        ? `<b>${e.name}</b><span>${e.sub}</span>`
        : `<b>?</b><span>not found yet</span>`;
      if (got) c.onclick = () => commands.openCard(k);
      strip.appendChild(c);
    });
    row.appendChild(strip);
    sheet.appendChild(row);
  }

  if (s.count === s.total){
    sheet.appendChild(node('p', 'done',
      'Every card filled in. The four lacewing stages are one animal — that is the thing almost nobody knows.'));
  }
  const acts = node('div', 'acts');
  const back = node('button', 'go', 'Back to the garden');
  back.onclick = () => commands.close();
  const hint = node('button', '', 'Where do I look next?');
  hint.onclick = () => { commands.hint(); commands.close(); };
  acts.append(back, hint);
  sheet.appendChild(acts);

  /* Start over. It asks first: at an outreach table the notebook is the only
     thing the player has built, and a mis-tap that wipes thirteen cards with
     no warning is the kind of thing that ends the visit. */
  const reset = node('div', 'acts reset');
  if (!confirmReset){
    const b = node('button', 'quiet', 'Start over');
    b.onclick = () => { confirmReset = true; panelSig = null; renderPanel(s, true); };
    reset.appendChild(b);
  } else {
    reset.appendChild(node('span', 'ask', 'Empty the notebook and put every insect back?'));
    const yes = node('button', 'warn', 'Yes, start over');
    yes.onclick = () => { confirmReset = false; commands.restart(); };
    const no = node('button', '', 'Keep my notebook');
    no.onclick = () => { confirmReset = false; panelSig = null; renderPanel(s, true); };
    reset.append(yes, no);
  }
  sheet.appendChild(reset);
  return sheet;
}

window.__cmd = commands;
window.__toggleLog = toggleLog;
