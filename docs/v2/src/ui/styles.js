/* One place for the look of the overlay. The 3D world is the page; this is
   glass sitting on top of it, so everything here is translucent, high
   contrast against both a bright lawn and a shadowed bed, and finger-sized. */
export const CSS = `
:root{
  --ink:#0E1710; --paper:rgba(248,250,244,.93); --line:rgba(20,40,22,.18);
  --leaf:#2F6B2C; --leaf-dk:#1F4D1E; --glow:#8CD24A; --amber:#B9780F;
  --danger:#B23A2A; --shadow:0 6px 24px rgba(10,20,12,.28);
  --font-d:"Baloo 2",system-ui,sans-serif; --font-b:"Nunito Sans",system-ui,sans-serif;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden;background:#0E1710;
  font-family:var(--font-b);color:var(--ink);-webkit-text-size-adjust:100%}
canvas{display:block;width:100%;height:100%;touch-action:none}
#ui{position:fixed;inset:0;pointer-events:none;
  padding:env(safe-area-inset-top,0) env(safe-area-inset-right,0) env(safe-area-inset-bottom,0) env(safe-area-inset-left,0)}
#ui > *{pointer-events:auto}
.hidden{display:none!important}

/* crosshair */
#cross{position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;
  pointer-events:none;opacity:.85}
#cross:before,#cross:after{content:"";position:absolute;background:#fff;
  box-shadow:0 0 2px rgba(0,0,0,.8)}
#cross:before{left:8px;top:0;width:2px;height:18px}
#cross:after{top:8px;left:0;height:2px;width:18px}

/* top-left status */
#status{position:absolute;top:14px;left:14px;display:flex;gap:8px;flex-wrap:wrap;
  max-width:min(calc(100vw - 300px),520px)}
.chip{background:var(--paper);border-radius:10px;padding:7px 11px;box-shadow:var(--shadow);
  font-size:.82rem;font-weight:700;display:flex;gap:7px;align-items:baseline}
.chip b{font-family:var(--font-d);font-size:1.05rem;font-variant-numeric:tabular-nums}
.chip.warn{background:rgba(255,236,214,.95);color:#7A4A06}
.chip.bad{background:rgba(255,224,219,.95);color:var(--danger)}

/* prompt over the crosshair */
#prompt{position:absolute;left:50%;top:calc(50% + 34px);transform:translateX(-50%);
  background:rgba(14,23,16,.78);color:#F2F7EE;padding:9px 14px;border-radius:11px;
  font-size:.92rem;font-weight:600;white-space:nowrap;max-width:92vw;overflow:hidden;
  text-overflow:ellipsis;backdrop-filter:blur(3px)}
#prompt .k{display:inline-block;min-width:1.5em;text-align:center;background:#F2F7EE;color:#0E1710;
  border-radius:5px;padding:1px 6px;margin-right:7px;font-family:var(--font-d);font-weight:800}

/* log, bottom-left */
#log{position:absolute;left:14px;bottom:74px;width:min(44vw,380px);max-height:34vh;overflow:hidden;
  display:flex;flex-direction:column-reverse;gap:6px}
.ent{background:#FBFDF8;border-left:3px solid var(--line);border-radius:0 9px 9px 0;
  padding:8px 11px;font-size:.8rem;box-shadow:var(--shadow);animation:in .25s ease;
  color:var(--ink)}
.ent.good{border-left-color:var(--leaf)} .ent.bad{border-left-color:var(--danger)}
.ent .d{font-weight:800;color:var(--leaf-dk);margin-right:6px}
@keyframes in{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}

/* goals, top-right */
#goals{position:absolute;top:14px;right:14px;background:var(--paper);border-radius:12px;
  padding:11px 13px;box-shadow:var(--shadow);width:min(60vw,260px);font-size:.8rem}
#goals h4{margin:0 0 7px;font-family:var(--font-d);font-size:.95rem}
.goal{display:flex;gap:8px;align-items:flex-start;padding:3px 0;opacity:.75}
.goal.done{opacity:1;font-weight:700;color:var(--leaf-dk)}
.goal .box{flex:0 0 15px;height:15px;border:2px solid var(--line);border-radius:4px;
  font-size:.7rem;line-height:12px;text-align:center}
.goal.done .box{background:var(--leaf);border-color:var(--leaf);color:#fff}

/* panel */
#panel{position:absolute;inset:0;background:rgba(10,18,12,.55);backdrop-filter:blur(5px);
  display:flex;align-items:center;justify-content:center;padding:16px}
.sheet{background:var(--paper);border-radius:18px;box-shadow:var(--shadow);padding:20px;
  width:min(100%,760px);max-height:86vh;overflow:auto}
.sheet h2{font-family:var(--font-d);margin:0 0 4px;font-size:1.5rem}
.sheet .sub{margin:0 0 14px;font-size:.88rem;opacity:.75}
.cups{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.cup{border:2px solid var(--line);border-radius:12px;padding:11px;background:rgba(255,255,255,.6);
  cursor:pointer;text-align:left;font:inherit}
.cup.sel{border-color:var(--leaf);background:rgba(140,210,74,.16)}
.cup.crowded{border-color:var(--danger);background:rgba(178,58,42,.12)}
.cup .em{font-size:1.5rem;display:block}
.cup .st{font-weight:800;font-family:var(--font-d)}
.pips{display:flex;gap:3px;margin-top:6px}
.pip{width:15px;height:5px;border-radius:3px;background:var(--line)}
.pip.full{background:var(--leaf)} .pip.hungry{background:var(--danger)}
.acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
button{font:inherit;font-weight:700;border-radius:10px;padding:10px 14px;cursor:pointer;
  border:2px solid var(--line);background:#fff;color:var(--ink)}
button:disabled{opacity:.45;cursor:default}
button.go{background:var(--leaf);border-color:var(--leaf);color:#fff}
button.warn{border-color:var(--amber);color:#7A4A06}
.hint{font-size:.85rem;opacity:.8;margin:12px 0 0}
.tempRow{display:flex;gap:11px;align-items:center;margin-top:14px}
.tempRow input{flex:1}
.tval{font-family:var(--font-d);font-weight:800;font-size:1.15rem}
.tval.bad{color:var(--danger)}

/* notebook & cards */
.chip.book{cursor:pointer;border:0;font:inherit;font-weight:700}
.chip:hover{background:#fff}
.sheet.narrow{max-width:460px;text-align:center}
.eyebrow{margin:0 0 2px;font-size:.72rem;font-weight:800;letter-spacing:.09em;
  text-transform:uppercase;color:var(--leaf-dk)}
.eyebrow.miss{color:var(--danger)}
.badge{display:inline-block;font-weight:800;font-size:.78rem;letter-spacing:.06em;
  text-transform:uppercase;padding:.25rem .6rem;border-radius:99px;margin:.2rem 0 .8rem}
.badge.good{background:rgba(124,194,63,.22);color:var(--leaf-dk)}
.badge.pest{background:rgba(178,58,42,.14);color:var(--danger)}
.eats{margin:.2rem 0;font-size:.92rem}
.fact{margin:.6rem 0 0;font-size:1rem;line-height:1.55}
.acts.big button{flex:1;font-size:1.05rem;padding:16px}
.group{margin-top:14px}
.group h3{font-family:var(--font-d);font-size:1rem;margin:0 0 6px}
.strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.ncard{border:2px dashed var(--line);border-radius:12px;padding:10px;background:rgba(255,255,255,.4);
  text-align:left;font:inherit;cursor:default;min-height:62px}
.ncard b{display:block;font-family:var(--font-d);font-size:.95rem}
.ncard span{font-size:.76rem;opacity:.72}
.ncard.got{border-style:solid;cursor:pointer;background:#fff}
.ncard.got.good{border-color:var(--leaf)}
.ncard.got.pest{border-color:var(--danger)}
.done{margin-top:14px;font-weight:700;color:var(--leaf-dk)}

/* the compass to the nearest unfound scene */
#guide{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);
  background:var(--paper);border-radius:99px;padding:8px 16px 8px 10px;box-shadow:var(--shadow);
  display:flex;align-items:center;gap:10px;font-size:.84rem;font-weight:700;max-width:92vw}
#guide .arrow{display:inline-block;font-size:1.3rem;line-height:1;color:var(--leaf-dk);
  transition:transform .12s linear}

/* the watch bar */
#watchbar{position:absolute;left:50%;top:calc(50% + 64px);transform:translateX(-50%);
  width:min(46vw,260px);display:flex;flex-direction:column;align-items:center;gap:7px}
#watchbar .track{width:100%;background:rgba(14,23,16,.72);border-radius:99px;padding:4px}
#watchbar i{display:block;height:8px;border-radius:99px;background:var(--glow);width:0%;
  transition:width .12s linear;min-width:8px}
#watchbar span{text-align:center;color:#EAF3E4;font-size:.78rem;font-weight:600;
  text-shadow:0 1px 3px rgba(0,0,0,.8)}
/* once the lacewing sequence is running the caption carries the lesson, so
   it gets a readable card instead of text floating over leaves */
#watchbar.story{width:min(92vw,640px);top:auto;bottom:26px}
#watchbar.story span{background:rgba(14,23,16,.86);border-radius:12px;padding:10px 14px;
  font-size:.92rem;line-height:1.45;text-shadow:none;backdrop-filter:blur(3px)}
#watchbar.story span b{color:var(--glow);margin-right:6px}

/* touch */
#touch{position:absolute;inset:0;pointer-events:none}
#stick{position:absolute;left:22px;bottom:22px;width:132px;height:132px;border-radius:50%;
  background:rgba(248,250,244,.26);border:2px solid rgba(248,250,244,.5);pointer-events:auto}
#knob{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;
  border-radius:50%;background:rgba(248,250,244,.8);box-shadow:var(--shadow)}
#tbtns{position:absolute;right:22px;bottom:26px;display:flex;flex-direction:column;gap:12px;pointer-events:auto}
#tbtns button{width:80px;height:80px;border-radius:50%;background:var(--paper);font-size:.74rem}
@media (max-width:760px){
  #status{max-width:calc(100vw - 230px)}
  #log{width:min(70vw,330px);max-height:24vh}
  #goals{font-size:.74rem;width:min(52vw,210px)}
}
`;
