/* Scaffold queued sections toward the ~500k word campaign.
 * Idempotent: only adds items whose title/who is not already present.
 * Run: node tools/scaffold_500k.mjs */
import fs from "fs";
const P = new URL("../content/story/campaign.json", import.meta.url).pathname;
const j = JSON.parse(fs.readFileSync(P, "utf8"));

/* ---- queued main chapters (title + summary only; authored later) ---- */
const CH = {
  "The Vanishing": [
    ["Interlude — The Door That Locks Itself", "Iwata the handyman, unsuperstitious, on the cold spot and the key that no longer fits — the flat itself testifying that something has changed tenancy."],
    ["Interlude — The Briefing They Kept Quiet", "The CVD has not flagged Gin missing. Someone wanted it that way. Rei learns that absence can be administered."],
  ],
  "The Handwriting": [
    ["Chapter Eleven — The Entries After the 14th", "Reading where Gin's voice and the other's begin to rhyme; the cost to Rei's Stability of learning to tell them apart."],
    ["Chapter Twelve — The Texts", "Texting Gin now reaches the compromised Gin: a beat too calm, never a place, trying to make Rei stop looking as the love bleeds through."],
    ["Chapter Thirteen — Kurosawa Reads the Body", "The double-layer signature; what class of thing is wearing Gin, and the word for it Rei did not have."],
  ],
  "The Recruited": [
    ["Chapter Fourteen — The Ledger Grows", "Mapping who Gin has 'helped' since the 14th — each reasonable favour a knot in a longer rope."],
    ["Chapter Fifteen — The Far-Shore Circle", "The Higan-kai lineage and Kishin in Fukai Rinka; a congregation built around a possessed centre, feeding toward the Inverted God."],
    ["Chapter Sixteen — The Counter-Demon Surfaces", "Yushiro is hunting the aspirant. Rei is caught between two demons who want opposite catastrophes."],
  ],
  "The Vacant Seat": [
    ["Chapter Seventeen — Beyond the Veil", "Rei reaches the centre and is shoved back, his hands marked with traces of abilities he does not yet own."],
    ["Chapter Eighteen — The Domain Registry", "The twelve held seats and the open wound of XIII; why a vacant register thins a district's membrane."],
    ["Chapter Nineteen — The Two-Demon Trap Closes", "The offer of Domain XIII, the Axis overstretched, and the choice that forecloses the others."],
  ],
  "The Endings": [
    ["Reading the Trajectory", "The three variables laid bare — the window, the domain, the succession — and how the earliest to resolve decides the rest."],
  ],
};
for (const bk of j.main) {
  const want = CH[bk.title]; if (!want) continue;
  bk.chapters = bk.chapters || [];
  const have = new Set(bk.chapters.map((c) => c.title));
  for (const [title, summary] of want) {
    if (have.has(title)) continue;
    bk.chapters.push({ title, status: "queued", summary });
  }
}

/* ---- queued side missions ---- */
const SIDE = [
  ["Kaneda's Last Bottle", "Kaneda Tōru (the honest table)", "A bar owner's final bottle of his late wife's plum wine keeps refilling itself a finger overnight. Grief, an anchored spirit, and a man who would rather be haunted than healed."],
  ["The Bookseller's Locked Shelf", "Sōma the bookseller, Jūjō", "A shelf behind the counter that no key opens and no fire has ever touched. The books on it have contact-history, and one of them remembers Gin."],
  ["The Grid Courier Gone Dark", "'Switch' (Grid quartermaster)", "A courier who carries between safehouses has missed three drops. The Grid does not call the police; it calls you. Finding her means walking the routes the records cannot see."],
  ["The Weakening Holder", "Watanabe Jun (Despair VI)", "A domain holder near the thin Kita district is failing. Help him, learn what a seat costs from the inside, or stand in the room when a register lets go and feel the membrane lurch."],
  ["The Rage That Won't Cool", "Mori Takao (Rage II)", "The Rage seat is under pressure and hard to find on purpose. A holder who has spent decades keeping a furnace banked needs one night's relief, and the cost of giving it."],
  ["The Fear on the Stairwell", "Nakashima Yuna (Fear IV)", "A stairwell in a Kita danchi where the fear is not yours and will not be reasoned with. The Fear holder is too frightened to hold; you are asked to be brave on her behalf."],
  ["The Hunger With No Address", "Inoue Satoru (Hunger IX)", "A holder with no fixed location, moving so the appetite he carries cannot settle. Find him before the campaign-demon's pressure tips the seat — and decide whether a man can be kept from what he holds."],
  ["The Longing at Shin-Ōkubo", "Park Junho (Longing XI)", "Behind a Korean restaurant, a shrine room where the Longing register draws the homesick in and will not let them leave wanting. A holder under pressure, an Obon crowd, and a door that opens both ways."],
  ["The Auditor's Anomaly", "Okada Shizuka / Sena (the assessment loop)", "The bi-monthly assessment cycle has flagged an anomaly that points at Rei. Bury it, explain it, or use it — and learn how the instrument that measures you can be made to lie."],
  ["Kuroki's Favour", "Kuroki Tatsuo (organised crime)", "A terrifying ally offers to find what you cannot. The finding is free. The owing is not. A favour from the man who truly runs a stretch of the city is a debt you carry into every later road."],
];
j.sideMissions = j.sideMissions || [];
const haveSide = new Set(j.sideMissions.map((s) => s.title));
for (const [title, giver, hook] of SIDE) {
  if (haveSide.has(title)) continue;
  j.sideMissions.push({ title, giver, status: "queued", hook });
}

/* ---- queued romances (adults only) ---- */
const ROM = [
  "Hagiwara Mizuki", "Katagiri Noa", "Tendo Akira", "Okada Shizuka",
  "Shimizu Ren", "Kato Ryusei", "Moriya Tatsuki", "Usami & Ren (the Pair)",
  "Tsukishiro Haruki", "Choi Hana", "Kurosawa Shou",
];
j.romances = j.romances || [];
const haveRom = new Set(j.romances.map((r) => r.who));
for (const who of ROM) {
  if (haveRom.has(who)) continue;
  j.romances.push({ who, status: "queued", ceiling: "fade to black", stages: [] });
}

fs.writeFileSync(P, JSON.stringify(j, null, 2) + "\n");
console.log("scaffold done. chapters:",
  j.main.map((b) => `${b.title}=${b.chapters.length}`).join(", "));
console.log("side missions:", j.sideMissions.length, "| romances:", j.romances.length);
const q = JSON.stringify(j).match(/"status":"queued"/g) || [];
console.log("queued count:", q.length);
