# Interactive book overlay spec

The interactive novel (`interactive-book/index.html`) is being expanded from Chapter One into the full campaign.
The prose already exists in `content/story/campaign.json`. A build script (`tools/interactive/build.py`) turns it
into playable scenes. Each storyline also needs an **overlay** that adds what the raw prose lacks.
the consequences of each choice, a short reaction line after each choice, an illustration per scene, and
which characters the player meets.

All files live under `tools/interactive/`.

* `manifest.json` lists every storyline id and where its prose lives in `campaign.json` (`src` path).
* `people.json` lists every character id the game knows. **Use only these ids** in `meets` and `rel`.
* `overlay/<group>.json` is what you write. One JSON object whose keys are storyline ids.

## The game state the effects touch

| key | meaning | typical size per choice |
|---|---|---|
| `rel` | affinity with a person, 0 to 100. `{"okada": 4}` | +2 to +8, or -3 to -10 for a betrayal |
| `standing` | faction standing. keys `cvd`, `grid`, `tower`, `street`, `axis`, `cult`, `pact` | +1 or +2, -1 or -2 |
| `stab` | Stability, 100 start. Horror, strain, reaching too far lower it | -3 to -15 (or +5 for real rest/comfort) |
| `mad` | Madness, 0 start. How far the other side has marked Rei | +3 to +15 |
| `veil` | Membrane thinning over Kita, 0 to 100. Rises when Rei uses the Gift openly, when the demons gain, when time is wasted | +1 to +5, or -2 to -5 when Rei shores the wall up |
| `decency` | moral axis. noble/kind/honest +1 or +2, cruel/using people/sealing truths -1 or -2 | ±1, ±2 |
| `xp` | experience | 2 to 6 |
| `flags` | list of snake_case flags to set true. Use them to remember decisions that matter later | |
| `item` | an item name Rei gains (string) | rare |
| `clair` | Clairsentience level gain (integer 1) | very rare, only when the prose shows his sight growing |

Not every choice needs every key. Most choices have two to four keys. A choice that is mostly flavour still gets
something small (`xp` and one `rel`). Make the trade offs real. The fast way costs Stability or decency, the careful
way costs time (`veil` +1 or +2) or standing with an impatient faction. Kindness to a person raises `rel` with them.

## Overlay shape for a campaign storyline (main chapters, side missions, roads)

```json
{
  "m01": {
    "meets": ["kondo", "hayashi", "matsuda"],
    "journal": "One plain sentence for Rei's field log, first person, what he learned.",
    "beats": [
      {
        "img": "res_apartmentlivingroom",
        "choices": [
          {"fx": {"decency": 1, "xp": 3, "veil": 1}, "echo": "One to three short sentences shown at the top of the next scene. What this choice did."},
          {"fx": {"stab": -6, "mad": 4, "xp": 4}, "echo": "..."}
        ],
        "extra": []
      }
    ]
  }
}
```

* `beats` must have exactly as many entries as the storyline's beats in `campaign.json`, in order.
* each beat's `choices` must have exactly as many entries as that beat's choices, in order. The choice text and hint
  already exist in `campaign.json`. You do not rewrite them.
* `img` is an image file name from `images/` **without** the `.png`/`.jpg`. Pick the one that best shows the place or the
  person in that scene. Look at the filenames (`ls images/`). Prefixes: `char_` portraits, `npc_` portraits, `place_`
  places, `res_` residential and shops, `cvdroom_` CVD rooms, `cvd_` CVD, `tower_` Tower family houses, `thirteen_` the
  Thirteen holders, `ext_` entities, `ch*_` story illustrations, `prac_` practice of the six paths, `off_` offices,
  `animal_`, `med_` animal mediums, `tools_`, `map_`. You can open an image with the Read tool to check it.
  A scene showing a specific person should usually use that person's portrait.
* `extra` (optional, at most one per beat, use it in roughly one beat out of four) adds a NEW choice to that beat,
  usually one locked behind something the player may have earned:
  `{"x": "choice text", "hint": "short hint", "need": "flag_name", "fx": {...}, "echo": "..."}`
  or `"lock": "clair:2"` instead of `need`. Only add it when the scene clearly invites another option. It leads to the
  same next scene as the others.
* `meets` lists people from `people.json` who actually appear and interact in this storyline.
* optional `"proseFix": {"<beatIndex>": {"<paraIndex>": "replacement paragraph"}}` ONLY for a factual canon error you
  are sure of. Explain each one in your final report.

## Writing rules for `echo`, `journal`, and any new prose

* English. Second person, present tense, the same voice as the campaign prose but plainer. Short sentences.
* **Never use em dashes, en dashes, semicolons or colons.** Use a full stop or a comma or "..." instead. This is a hard
  rule from the author. Hyphens inside compound words are fine.
* No rhetorical triads, no punchline endings, no "guess what" reveals, no moral lessons.
* Say what changed. Concrete. A person's reaction, a cost felt in the body, what Rei now knows.
* Do not invent new named characters, new places with names, or backstory. Do not give a character a trait the canon
  does not give them. Check `content/registry/characters.json` when unsure.
* Keep characters in character. Dark choices may stay dark. No softening.
* Minors. Yua (16) and Mori Haruto (17) are never romantic or sexual in any way. Never.

## Canon you must respect

* Tokyo, August 2015, Obon. Rei is Uedera Rei, 19, male, criminal investigation intern, Gin's younger brother.
  He was born with two paths open (Clairsentience and Telepathy), registers as Postulate D under suppression,
  is really Arbiter A.
* Gin is Uedera Gin, 28, male, CVD field investigator. Yushiro, a demon of Duty (the vacant Seat XIII), rides him.
  Folk name for Yushiro's kind in the campaign is "the Healer".
* The CVD headquarters is in **Marunouchi**.
* Kishin, called Kanna-sensei, rides Fukai Rinka and runs the Far-Shore Circle (Higan-kai). Kishin wants to become
  the Inverted God and is usurping Despair, Seat VI.
* Rank scale. 0 Null, E Sensitive, D Postulate, C Adept, B Ritualist, A Arbiter, S Vanguard, SS Guardian,
  SSS Singularity. There is a rank above these that must **never** be named.
* Read `content/registry/canon.json` and `veil-protocol-quests-gm.md` before you start.

## When you finish

Validate your file with `python3 -c "import json;json.load(open('tools/interactive/overlay/<file>.json'))"` and check the
beat and choice counts match `campaign.json` exactly. Also grep your file for `—`, `–`, `;` and `:` inside echo and
journal strings (the JSON syntax colons are fine) and fix any.
