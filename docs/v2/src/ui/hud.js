/* The overlay. Reads the store, talks to the game only through session
   commands — it imports nothing from engine/. Plain DOM: a React runtime
   would be most of this page's weight for six panels and a list. */
import { commands } from '../session/commands.js';
import { FOODS, TEMP } from '../data/species.js';

const EM = { egg: '🥚', larva: '🐛', cocoon: '🤍', adult: '🦋' };

/* The HUD is published about eight times a second. Assigning innerHTML throws
   the old nodes away and builds new ones even when the markup is identical,
   which restarts every CSS animation on them and reads as flicker. So each
   block is written only when its markup actually changed. */
const lastHtml = new Map();
function setHtml(node, html){
  if (lastHtml.get(node) === html) return false;
  lastHtml.set(node, html);
  node.innerHTML = html;
  return true;
}
const el = id => document.getElementById(id);
const h = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};

let sel = 0;

export function mountHud(root){
  root.innerHTML = `
    <div id="cross"></div>
    <div id="status"></div>
    <div id="prompt" class="hidden"></div>
    <div id="goals"></div>
    <div id="log"></div>
    <div id="panel" class="hidden"></div>
    <div id="touch" class="hidden">
      <div id="stick"><div id="knob"></div></div>
      <div id="tbtns">
        <button id="tact">Use<br>(E)</button>
        <button id="tday">End<br>day</button>
      </div>
    </div>`;
  el('tact').onclick = () => window.__game?.interact();
  el('tday').onclick = () => commands.nextDay();
}

export function renderHud(s){
  // status chips
  const warm = s.temp >= TEMP.min && s.temp <= TEMP.max;
  setHtml(el('status'),
    chip('Day', s.day) +
    chip('Aphids', s.pop.aphids, s.pop.aphids > 200 ? 'bad' : s.pop.aphids > 90 ? 'warn' : '') +
    chip('On the bench', s.alive) +
    chip('Released', s.released) +
    chip('Bench temp', s.temp + '°F', warm ? '' : 'bad') +
    (s.pop.eggs ? chip('Eggs on leaves', s.pop.eggs) : ''));

  // crosshair prompt
  const p = el('prompt');
  if (s.prompt && !s.panel){
    p.classList.remove('hidden');
    setHtml(p, (s.prompt.key ? `<span class="k">${s.prompt.key}</span>` : '') + s.prompt.text);
  } else p.classList.add('hidden');

  // goals
  setHtml(el('goals'), '<h4>The garden balances when…</h4>' + s.goals.map(([t, done]) =>
    `<div class="goal ${done ? 'done' : ''}"><span class="box">${done ? '✓' : ''}</span><span>${t}</span></div>`).join(''));

  // log
  setHtml(el('log'), s.log.slice(0, 6).map(e =>
    `<div class="ent ${e.kind}"><span class="d">D${e.day}</span>${e.text}</div>`).join(''));

  renderPanel(s);
}

const chip = (label, value, cls) =>
  `<div class="chip ${cls || ''}"><span>${label}</span><b>${value}</b></div>`;

let panelSig = null;

/** Everything the bench panel draws. If this is unchanged, so is the panel. */
function panelSignature(s){
  return JSON.stringify([s.panel, s.over, sel, s.cups, s.shelter, s.food,
                         s.pop.eggs, s.pop.aphids, s.pop.flowers, s.temp]);
}

function renderPanel(s, force){
  const box = el('panel');
  if (s.over) return renderEnd(box, s);
  if (!s.panel){
    box.classList.add('hidden');
    if (box.innerHTML) { box.innerHTML = ''; panelSig = null; }
    return;
  }
  const sig = panelSignature(s);
  if (!force && sig === panelSig) return;
  panelSig = sig;
  box.classList.remove('hidden');

  const cup = s.cups[sel];
  box.innerHTML = '';
  const sheet = h('div', 'sheet');
  sheet.appendChild(h('h2', '', 'The rearing bench'));
  sheet.appendChild(h('p', 'sub', 'Six cups. One larva per cup — they eat each other. Folded paper is where a larva pupates.'));

  const cups = h('div', 'cups');
  s.cups.forEach((c, i) => {
    const b = h('button', 'cup' + (i === sel ? ' sel' : '') + (c && c.count > 1 ? ' crowded' : ''));
    b.innerHTML = c
      ? `<span class="em">${EM[c.stage]}</span><span class="st">${c.stage}${c.count > 1 ? ' ×' + c.count : ''}</span>
         <div class="pips">${[0,1,2].map(n => `<span class="pip ${n < c.fed ? 'full' : (c.fed <= 0 ? 'hungry' : '')}"></span>`).join('')}</div>
         ${s.shelter[i] ? '<div style="font-size:.75rem;opacity:.7">📄 folded paper</div>' : ''}`
      : `<span class="em" style="opacity:.3">·</span><span class="st">empty</span>
         ${s.shelter[i] ? '<div style="font-size:.75rem;opacity:.7">📄 folded paper</div>' : ''}`;
    b.onclick = () => { sel = i; renderPanel(s, true); };
    cups.appendChild(b);
  });
  sheet.appendChild(cups);

  const acts = h('div', 'acts');
  const btn = (txt, fn, cls, dis, title) => {
    const b = h('button', cls || '', txt);
    b.onclick = fn; b.disabled = !!dis; if (title) b.title = title;
    acts.appendChild(b);
  };

  if (cup && cup.stage === 'larva'){
    for (const [k, f] of Object.entries(FOODS)){
      const n = s.food[k];
      btn(f.prey ? `${f.label} (${n})` : f.label, () => commands.feed(sel, k),
          f.prey ? '' : 'warn', f.prey && !n, f.note);
    }
  }
  if (cup && cup.stage === 'adult') btn('Release into the garden', () => commands.release(sel), 'go');
  if (cup && cup.count > 1) btn('Separate them', () => commands.separate(sel), 'go');
  btn(s.shelter[sel] ? 'Remove paper' : 'Add folded paper', () => commands.shelter(sel), s.shelter[sel] ? 'warn' : '');
  if (s.pop.eggs > 0) btn(`Collect an egg (${s.pop.eggs} on the leaves)`, () => commands.collectEgg(), 'go');
  sheet.appendChild(acts);

  const garden = h('div', 'acts');
  const gb = (txt, fn, cls, dis, title) => {
    const b = h('button', cls || '', txt); b.onclick = fn; b.disabled = !!dis;
    if (title) b.title = title; garden.appendChild(b);
  };
  gb('Plant flowers', () => commands.plant(), '', false, 'Adults drink nectar. No flowers, no eggs.');
  gb(`Collect aphids (${s.pop.aphids})`, () => commands.harvest(), '', s.pop.aphids < 6);
  gb('Spray pesticide', () => commands.spray(), 'warn', false, 'Kills the aphids fast. And everything else.');
  gb('End the day', () => commands.nextDay(), 'go');
  sheet.appendChild(h('p', 'hint', 'The garden itself:'));
  sheet.appendChild(garden);

  const temp = h('div', 'tempRow');
  temp.innerHTML = `<span>Bench temperature</span>
    <input type="range" min="50" max="100" value="${s.temp}">
    <span class="tval ${s.temp >= TEMP.min && s.temp <= TEMP.max ? '' : 'bad'}">${s.temp}°F</span>`;
  temp.querySelector('input').oninput = e => commands.setTemp(+e.target.value);
  sheet.appendChild(temp);

  sheet.appendChild(h('p', 'hint', 'Press <b>Esc</b> or <b>Tab</b> to go back to the garden. <b>WASD</b> to walk, mouse to look, <b>E</b> to use what you are looking at, <b>C</b> to crouch down to an insect.'));
  box.appendChild(sheet);
}

function renderEnd(box, s){
  const sig = 'end:' + s.over + s.day + s.released;
  if (sig === panelSig) return;
  panelSig = sig;
  box.classList.remove('hidden');
  box.innerHTML = '';
  const sheet = h('div', 'sheet');
  sheet.innerHTML = s.over === 'win'
    ? `<h2>The garden balanced out</h2>
       <p>Aphids down to <b>${s.pop.aphids}</b> and holding, with <b>${s.pop.lacewings + s.pop.wildLarvae}</b> lacewings and <b>${s.pop.ladybugs}</b> ladybugs living there. You raised and released <b>${s.released}</b> lacewings and lost ${s.died} on the bench.</p>
       <p>That is what control actually looks like. Not zero aphids — enough aphids to keep the predators fed, and enough predators to keep the aphids down.</p>`
    : `<h2>Not this time</h2>
       <p>Day ${s.day} · ${s.pop.aphids} aphids · ${s.released} released · ${s.died} lost on the bench.</p>
       <p>One larva per cup, folded paper before they are ready to pupate, flowers in the ground early, and leave the spray alone.</p>`;
  const b = h('button', 'go', 'Start again');
  b.onclick = () => commands.restart();
  sheet.appendChild(b);
  box.appendChild(sheet);
}
