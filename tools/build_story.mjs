/* Build "The Story" compendium page (the-story.html) from the authored scene data + endings.
 * Tabs: The Roads (each book/route) · The Choices (every branch point) · The Endings (the five). */
import fs from "fs";

const ROOT = new URL("..", import.meta.url).pathname;
globalThis.window = { VP: { scenes: {} } };
(0, eval)(fs.readFileSync(ROOT + "content/scenes/chapter1.js", "utf8"));
const scenes = window.VP.scenes;
const lore = JSON.parse(fs.readFileSync(ROOT + "content/registry/lore.json", "utf8"));
const authored = JSON.parse(fs.readFileSync(ROOT + "content/registry/authored.json", "utf8"));
const campaign = JSON.parse(fs.readFileSync(ROOT + "content/story/campaign.json", "utf8"));

const ROAD_TITLES = {
  opening: ["Prologue", "The Kitchen, 3:47am", "The hour the city forgets itself. A cold kettle, a brother who never came home, and the handful of doors the morning leaves open."],
  itsuki:  ["Road of the Friend", "Itsuki's Road", "You call your oldest friend — a Kuroda of the Tower house — and let him move you across a sleeping city."],
  cvd:     ["Road of the Institution", "The Directorate", "You give the one name you have on the inside to the CVD, and let the Directorate make you theirs in the same motion."],
  grid:    ["Road of the Unregistered", "The Grid", "You open Gin's book to the names he wrote down small, in the back, in his own hand — the people the official records cannot see."],
  power:   ["Road of the Gift", "The Forbidden Reach", "You are Clairsentient. To read a place is costly: your sight thins the veil, feeds the Madness, and shows the Directorate exactly what you have pretended not to be."],
  look:    ["Road of the Long Way", "The Long Walk", "No name, no power, no institution. Only your eyes and the long way, which sometimes finds what the short ways step over."],
};
const ROAD_ORDER = ["opening", "itsuki", "cvd", "grid", "power", "look"];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function proseHtml(t) {
  // t entries are either HTML (<p>…) or plain strings; drop dynamic placeholders.
  return (t || [])
    .map((p) => String(p))
    .filter((p) => !/id=['"]branchText['"]/.test(p) && p.trim() !== "")
    .map((p) => (p.trim().startsWith("<") ? p : `<p>${p}</p>`))
    .join("\n");
}
function isNavChoice(x) { return /^[↻]|start the morning over/i.test(x || ""); }

/* ---- Roads ---- */
function roadPanel(key) {
  const nodes = scenes[key] || [];
  let html = "";
  nodes.forEach((n, i) => {
    const body = proseHtml(n.t);
    if (!body && !(n.c && n.c.length)) return;
    html += `<div class="beat">`;
    if (n.img) html += `<div class="beat-scene">${esc(n.img)}</div>`;
    html += body;
    const choices = (n.c || []).filter((c) => !isNavChoice(c.x));
    if (choices.length) {
      html += `<div class="choices"><div class="choices-h">The choice it leaves you</div>`;
      for (const c of choices) {
        html += `<div class="choice"><div class="choice-x">${esc(c.x)}</div>`;
        if (c.hint) html += `<div class="choice-hint">${esc(c.hint)}</div>`;
        html += `</div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
  });
  return html;
}

/* ---- Choices (every branch point across all roads) ---- */
function choicesPanel() {
  let html = "";
  for (const key of ROAD_ORDER) {
    const nodes = scenes[key] || [];
    nodes.forEach((n, i) => {
      const choices = (n.c || []).filter((c) => !isNavChoice(c.x));
      if (choices.length < 2) return; // only real forks
      html += `<div class="decision"><div class="decision-h">${esc(ROAD_TITLES[key][1])} · beat ${i + 1}</div>`;
      for (const c of choices) {
        html += `<div class="choice"><div class="choice-x">${esc(c.x)}</div>`;
        if (c.hint) html += `<div class="choice-hint">${esc(c.hint)}</div>`;
        html += `</div>`;
      }
      html += `</div>`;
    });
  }
  return html;
}

/* ---- Endings (clean the overlapping chunks) ---- */
const ENDING_NAMES = ["Ending One", "Ending Two", "Ending Three", "Ending Four", "Ending Five"];
const ENDING_NEXT = { "Ending One": "Ending Two", "Ending Two": "Ending Three", "Ending Three": "Ending Four", "Ending Four": "Ending Five", "Ending Five": "Reading the Trajectory" };
function cleanEnding(name) {
  let txt = String(lore.endings[name] || "");
  const cut = txt.indexOf(ENDING_NEXT[name]);
  if (cut > 40) txt = txt.slice(0, cut);
  // split off "Requirements:" as a footnote
  let req = "";
  const ri = txt.indexOf("Requirements:");
  if (ri >= 0) { req = txt.slice(ri + "Requirements:".length).trim(); txt = txt.slice(0, ri).trim(); }
  // strip the leading "Ending X TheTitle" → derive a subtitle
  const m = txt.match(/^Ending \w+\s+(The [A-Z][a-z]+(?: [A-Z][a-z]+)?)\s+/);
  let sub = m ? m[1] : "";
  if (m) txt = txt.slice(m[0].length);
  return { sub, body: txt.trim(), req: req.trim() };
}
function endingPanel(name) {
  const { sub, body, req } = cleanEnding(name);
  let html = `<div class="ending"><div class="ending-sub">${esc(sub)}</div><p>${esc(body)}</p>`;
  if (req) html += `<div class="ending-req"><span>Requirements</span>${esc(req)}</div>`;
  html += `</div>`;
  return html;
}

/* ---- The Family arc (the spine: Rei, Gin, and the thing wearing him) ---- */
const FAMILY = [
  ["rei", "The one who searches", "Rei Uedera"],
  ["gin", "The one who was worn", "Uedera Gin"],
  ["yushiro", "The thing in the house", "Yushiro · the Healer"],
];
function familyPanel(id) {
  const e = authored[id]; if (!e) return "";
  let html = "";
  if (e.cap) html += `<div class="epigraph">${esc(e.cap).replace(/\n/g, "<br>")}</div>`;
  for (const b of e.back || []) html += `<p>${esc(b)}</p>`;
  const q = e.quest;
  if (q) {
    html += `<div class="quest"><div class="quest-tag">${esc(q.tag || "Arc")}</div><div class="quest-title">${esc(q.title || "")}</div>`;
    if (q.hook) html += `<p class="quest-hook">${esc(q.hook)}</p>`;
    if (q.stages && q.stages.length) {
      html += `<div class="quest-stages-h">How it moves</div><ul>`;
      for (const s of q.stages) html += `<li>${esc(s)}</li>`;
      html += `</ul>`;
    }
    if (q.payoff) html += `<div class="quest-payoff"><span>What it turns on</span>${esc(q.payoff)}</div>`;
    html += `</div>`;
  }
  // a couple of defining ties
  const rels = (e.rels || []).filter((r) => ["gin", "rei", "yushiro"].includes(r[3])).slice(0, 3);
  if (rels.length) {
    html += `<div class="ties"><div class="ties-h">Ties</div>`;
    for (const r of rels) html += `<div class="tie"><b>${esc(r[0])}</b> <span>(${r[1] >= 0 ? "+" : ""}${r[1]})</span> — ${esc(r[2])}</div>`;
    html += `</div>`;
  }
  return html;
}
const famTabs = FAMILY.map(([id, , title], i) =>
  `<button class="subtab${i === 0 ? " on" : ""}" data-p="fam-${id}">${esc(title)}</button>`).join("");
const famPanels = FAMILY.map(([id, eyebrow, title], i) =>
  `<div class="subpanel${i === 0 ? " on" : ""}" id="panel-fam-${id}">
     <div class="road-eyebrow">${esc(eyebrow)}</div><h2>${esc(title)}</h2>${familyPanel(id)}
   </div>`).join("");

/* ---- Main Story (the spine, from campaign.json: books → chapters → beats) ---- */
function badge(status) {
  if (status === "authored" || status === "authored-stub") return `<span class="badge ok">written</span>`;
  return `<span class="badge q">to be authored</span>`;
}
function beatHtml(b) {
  let h = `<div class="beat">`;
  if (b.scene) h += `<div class="beat-scene">${esc(b.scene)}</div>`;
  for (const p of b.prose || []) h += p.trim().startsWith("<") ? `<p>${p}</p>`.replace("<p><", "<") : `<p>${p}</p>`;
  const ch = b.choices || [];
  if (ch.length) {
    h += `<div class="choices"><div class="choices-h">The choice it leaves you</div>`;
    for (const c of ch) h += `<div class="choice"><div class="choice-x">${esc(c.x)}</div>${c.hint ? `<div class="choice-hint">${esc(c.hint)}</div>` : ""}</div>`;
    h += `</div>`;
  }
  return h + `</div>`;
}
function chapterHtml(c) {
  let h = `<div class="chapter"><div class="chapter-h">${esc(c.title)} ${badge(c.status)}</div>`;
  if (c.summary) h += `<p class="chapter-sum">${esc(c.summary)}</p>`;
  for (const b of c.beats || []) h += beatHtml(b);
  return h + `</div>`;
}
const mainTabs = campaign.main.map((bk, i) =>
  `<button class="subtab${i === 0 ? " on" : ""}" data-p="book-${i}">${esc(bk.book)}</button>`).join("");
const mainPanels = campaign.main.map((bk, i) =>
  `<div class="subpanel${i === 0 ? " on" : ""}" id="panel-book-${i}">
     <div class="road-eyebrow">${esc(bk.book)}</div><h2>${esc(bk.title)}</h2>
     <p class="road-blurb">${esc(bk.subtitle || "")}</p>
     ${(bk.chapters || []).map(chapterHtml).join("")}
   </div>`).join("");

/* ---- Side missions & romances ---- */
function sideHtml() {
  return (campaign.sideMissions || []).map((s) =>
    `<div class="decision"><div class="decision-h">${esc(s.title)} ${badge(s.status)}</div>
      <div class="choice-hint" style="margin-bottom:4px">Given by ${esc(s.giver || "—")}</div>
      <p style="margin:0">${esc(s.hook || "")}</p>
      ${(s.beats || []).map(beatHtml).join("")}</div>`).join("");
}
function romanceHtml() {
  return (campaign.romances || []).map((r) =>
    `<div class="decision"><div class="decision-h">${esc(r.who)} ${badge(r.status)}</div>
      <div class="choice-hint" style="margin-bottom:6px">Ceiling: ${esc(r.ceiling || "fade to black")} · never minors</div>
      <ol class="stages">${(r.stages || []).map((st) => `<li>${esc(st)}</li>`).join("")}</ol></div>`).join("");
}

/* ---- assemble ---- */
const roadTabs = ROAD_ORDER.map((k, i) =>
  `<button class="subtab${i === 0 ? " on" : ""}" data-p="road-${k}">${esc(ROAD_TITLES[k][1])}</button>`).join("");
const roadPanels = ROAD_ORDER.map((k, i) =>
  `<div class="subpanel${i === 0 ? " on" : ""}" id="panel-road-${k}">
     <div class="road-eyebrow">${esc(ROAD_TITLES[k][0])}</div>
     <h2>${esc(ROAD_TITLES[k][1])}</h2>
     <p class="road-blurb">${esc(ROAD_TITLES[k][2])}</p>
     ${roadPanel(k)}
   </div>`).join("");
const endTabs = ENDING_NAMES.map((n, i) =>
  `<button class="subtab${i === 0 ? " on" : ""}" data-p="end-${i}">${esc(n)}</button>`).join("");
const endPanels = ENDING_NAMES.map((n, i) =>
  `<div class="subpanel${i === 0 ? " on" : ""}" id="panel-end-${i}"><h2>${esc(n)}</h2>${endingPanel(n)}</div>`).join("");

const HTML = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Veil Protocol · The Story</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;900&family=EB+Garamond:ital@0;1&display=swap');
:root{--blood:#8B0000;--gold:#C9A84C;--paper:#ece3d2;--dim:#8a7f6e;--bdr:#2a2018;--bg:#0c0a08}
*{box-sizing:border-box}
body{margin:0;background:#0a0807;color:var(--paper);font-family:'EB Garamond',Georgia,serif;background-image:radial-gradient(ellipse at 50% -10%,rgba(139,0,0,.14),transparent 60%);min-height:100vh}
a.back{display:inline-block;color:var(--dim);text-decoration:none;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:22px 0 0 24px}
a.back:hover{color:var(--gold)}
header.hero{text-align:center;padding:30px 20px 10px}
.hero .eyebrow{font-family:'Courier New',monospace;letter-spacing:5px;text-transform:uppercase;font-size:11px;color:var(--gold)}
.hero h1{font-family:'Cinzel',serif;font-weight:900;letter-spacing:3px;font-size:34px;margin:6px 0 4px}
.hero p{color:var(--dim);max-width:560px;margin:0 auto;font-size:14px;line-height:1.7;font-style:italic}
.tabs{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:22px auto 0;max-width:760px;border-bottom:1px solid var(--bdr);padding-bottom:0}
.tab{font-family:'Cinzel',serif;letter-spacing:2px;font-size:13px;background:none;border:none;border-bottom:2px solid transparent;color:var(--dim);padding:10px 16px;cursor:pointer}
.tab.on{color:var(--gold);border-bottom-color:var(--gold)}
.wrap{max-width:760px;margin:0 auto;padding:0 22px 90px}
.subtabs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:18px 0 6px}
.subtab{font-family:'Courier New',monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;background:#15110b;border:1px solid var(--bdr);border-radius:14px;color:var(--dim);padding:5px 12px;cursor:pointer}
.subtab.on{color:#0c0a08;background:var(--gold);border-color:var(--gold)}
.panel{display:none}.panel.on{display:block}
.subpanel{display:none}.subpanel.on{display:block}
.road-eyebrow{font-family:'Courier New',monospace;letter-spacing:3px;text-transform:uppercase;font-size:10px;color:var(--blood);text-align:center;margin-top:14px}
h2{font-family:'Cinzel',serif;letter-spacing:2px;text-align:center;font-size:24px;margin:4px 0 6px;color:var(--paper)}
.road-blurb{color:var(--dim);text-align:center;font-style:italic;font-size:14px;max-width:600px;margin:0 auto 18px;line-height:1.7}
.beat{border-top:1px solid #1c1610;padding:18px 0}
.beat-scene{font-family:'Courier New',monospace;font-size:10.5px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:8px}
.beat p,.ending p{font-size:16px;line-height:1.74;margin:0 0 12px}
.choices{margin:10px 0 2px;border-left:2px solid var(--blood);padding-left:14px}
.choices-h,.decision-h{font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);margin-bottom:6px}
.choice{margin:0 0 10px}
.choice-x{font-family:'Cinzel',serif;font-size:14px;color:var(--gold);letter-spacing:.5px}
.choice-hint{font-size:13.5px;color:#b6ab97;font-style:italic;line-height:1.6;margin-top:2px}
.decision{background:#100c08;border:1px solid var(--bdr);border-radius:8px;padding:14px 16px;margin:14px 0}
.ending{border:1px solid var(--bdr);border-radius:8px;background:#100c08;padding:18px 20px}
.ending-sub{font-family:'Cinzel',serif;color:var(--gold);letter-spacing:2px;text-align:center;font-size:15px;margin-bottom:10px}
.ending-req{margin-top:12px;font-size:13px;color:var(--dim);border-top:1px solid var(--bdr);padding-top:10px}
.ending-req span{display:block;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--blood);margin-bottom:3px}
.epigraph{font-style:italic;color:var(--gold);text-align:center;font-size:15px;line-height:1.7;border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr);padding:14px 10px;margin:6px auto 18px;max-width:560px}
.subpanel p{font-size:16px;line-height:1.74;margin:0 0 12px}
.quest{background:#100c08;border:1px solid var(--bdr);border-left:2px solid var(--blood);border-radius:8px;padding:16px 18px;margin:18px 0}
.quest-tag{font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--blood)}
.quest-title{font-family:'Cinzel',serif;color:var(--gold);font-size:18px;letter-spacing:1px;margin:2px 0 8px}
.quest-hook{font-style:italic;color:#b6ab97}
.quest-stages-h,.ties-h{font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);margin:10px 0 4px}
.quest ul{margin:0;padding-left:18px}.quest li{font-size:14.5px;line-height:1.6;margin:4px 0;color:#cfc4b0}
.quest-payoff{margin-top:12px;font-size:13.5px;color:var(--dim);border-top:1px solid var(--bdr);padding-top:9px}
.quest-payoff span{display:block;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:3px}
.ties{margin-top:16px}.tie{font-size:14px;color:#cfc4b0;margin:3px 0}.tie span{color:var(--dim);font-family:'Courier New',monospace;font-size:11px}
.chapter{border-top:1px solid #1c1610;padding:16px 0 4px}
.chapter-h{font-family:'Cinzel',serif;font-size:17px;letter-spacing:1px;color:var(--paper);margin-bottom:4px}
.chapter-sum{font-style:italic;color:var(--dim);font-size:14px;margin:2px 0 6px}
.badge{font-family:'Courier New',monospace;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;padding:2px 7px;border-radius:10px;vertical-align:middle;margin-left:6px}
.badge.ok{background:#16210f;color:#9fcf7f;border:1px solid #2c4a1e}
.badge.q{background:#23160f;color:#c98a5a;border:1px solid #4a301e}
.stages{margin:4px 0 0;padding-left:20px}.stages li{font-size:14px;color:#cfc4b0;margin:4px 0;line-height:1.55}
.note{text-align:center;color:#5f564e;font-size:11.5px;margin-top:40px}
</style></head>
<body>
<a class="back" href="veil-protocol-book.html">‹ back to the Warden's book</a>
<header class="hero">
  <div class="eyebrow">Veil Protocol · The Other Side</div>
  <h1>THE STORY</h1>
  <p>The whole of Chapter One, as written — every road out of that 3:47am kitchen, every choice it leaves you, and the five ways it can end.</p>
</header>

<div class="tabs">
  <button class="tab on" data-t="main">Main Story</button>
  <button class="tab" data-t="roads">The Roads</button>
  <button class="tab" data-t="family">The Family</button>
  <button class="tab" data-t="side">Side Missions</button>
  <button class="tab" data-t="romance">Romances</button>
  <button class="tab" data-t="choices">The Choices</button>
  <button class="tab" data-t="endings">The Endings</button>
</div>

<div class="wrap">
  <div class="panel on" id="panel-main">
    <p class="road-blurb">The spine of the campaign — five Books from the kitchen to the vacant Seat. Authored in waves; chapters marked <span class="badge q">to be authored</span> are coming.</p>
    <div class="subtabs">${mainTabs}</div>
    ${mainPanels}
  </div>
  <div class="panel" id="panel-roads">
    <div class="subtabs">${roadTabs}</div>
    ${roadPanels}
  </div>
  <div class="panel" id="panel-side">
    <p class="road-blurb">Smaller stories with their own weather. Each is multi-scene; longer versions are being authored.</p>
    ${sideHtml()}
  </div>
  <div class="panel" id="panel-romance">
    <p class="road-blurb">Four stages each — notice, trust, turn, fade — gated on something real done for them, not asked. Fade-to-black ceiling; minors are never romanced.</p>
    ${romanceHtml()}
  </div>
  <div class="panel" id="panel-family">
    <p class="road-blurb">The spine beneath every road: a brother gone quiet on a Wednesday, the brother who goes looking, and the reasonable voice now wearing the first one. Every ending is decided here.</p>
    <div class="subtabs">${famTabs}</div>
    ${famPanels}
  </div>
  <div class="panel" id="panel-choices">
    <p class="road-blurb">Every fork in Chapter One, with the dread each door is dressed in.</p>
    ${choicesPanel()}
  </div>
  <div class="panel" id="panel-endings">
    <p class="road-blurb">Five ways the campaign ends, decided by three variables: whether Rei reaches Gin before the window closes, whether the domain stabilises, and what he chooses when the Axis offers succession.</p>
    <div class="subtabs">${endTabs}</div>
    ${endPanels}
  </div>
  <div class="note">Pulled directly from the authored scene data. Spoilers throughout — this is the Warden's copy.</div>
</div>

<script>
function showTab(t){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('on',p.id==='panel-'+t));}
function showSub(p){var group=p.split('-')[0];
  document.querySelectorAll('.subtab').forEach(b=>{if(b.dataset.p.split('-')[0]===group)b.classList.toggle('on',b.dataset.p===p);});
  document.querySelectorAll('.subpanel').forEach(sp=>{var id=sp.id.replace('panel-','');if(id.split('-')[0]===group)sp.classList.toggle('on',id===p);});}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showTab(b.dataset.t));
document.querySelectorAll('.subtab').forEach(b=>b.onclick=()=>showSub(b.dataset.p));
</script>
</body></html>`;

fs.writeFileSync(ROOT + "the-story.html", HTML);
console.log("wrote the-story.html (" + HTML.length + " chars)");
