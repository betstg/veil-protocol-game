# Veil Protocol — Full Campaign Blueprint

Target scale: a **full-length campaign of ~500,000 words** — a deep main spine, six long roads, a Thirteen-holders
side-spine, a dozen-plus multi-scene side missions, and the full romanceable cast. Interactive narrative runs slower
than prose (deliberation, branching, re-reading), so the working estimate is **~3,500 authored words ≈ 1 hour of play**.
Authored in waves: each batch fully writes one section and the scheduled job grinds the remaining queued items.

| Strand | Scope | Target words |
|---|---|---|
| Main spine (the Gin / Yushiro arc, 5 Books) | ~30+ chapters, 2–3 beats each | ~150,000 |
| Road: Itsuki (Kuroda / Tower) | 3 acts, ~24 beats | ~16,000 |
| Road: CVD (Directorate) | 3 acts, ~24 beats | ~16,000 |
| Road: Grid (unregistered) | 3 acts, ~24 beats | ~16,000 |
| Road: Power (the Gift) | 3 acts, ~24 beats | ~16,000 |
| Road: Look (the long way) | 3 acts, ~24 beats | ~16,000 |
| Side missions (15+, multi-scene each) | incl. Thirteen-holder vignettes | ~110,000 |
| Romances (16+, multi-stage, fade-to-black) | from the 25 romanceable adults | ~90,000 |
| The Family / Endings / Interludes | deeper Rei·Gin·Yushiro spine | ~54,000 |
| **Total** | | **~500,000** |

## Main spine — five Books

1. **The Vanishing** *(Chapter One — authored; the 3:47 kitchen and the five roads out of it.)*
   - +Ch2 *The Archive* — activating Gin's four Grid nodes; learning to read in his demanded order.
   - +Ch3 *The Last Week* — the skipped briefing, the case closed too fast, the address in no file.
2. **The Handwriting** — learning the shape in Gin before naming it; the entries after the 14th; the first lucid window.
3. **The Recruited** — Yushiro's reasonable favours; mapping who Gin has "helped"; the cult's counter-demon surfaces.
4. **The Vacant Seat** — the membrane plan exposed; the Axis; the offer of Domain XIII; the two-demon trap.
5. **The Five Endings** *(authored — Continuation, Refusal, Long Game, Cost, Quiet.)*

## Roads (each ~2h, 3 acts)
Each road takes its approach to the spine and runs three acts: **Open** (how this path gets traction), **Deepen**
(a road-specific complication + a faction antagonist beat), **Converge** (how it feeds back into the Handwriting).

## Side missions (multi-scene, real stakes) — 15+
Yua's debt · Mori's crush and the thing in the dorm · Tanizaki's drowned client · the animal-medium broker ·
the bookseller's locked shelf · Kaneda's last bottle · the shrine that stopped answering · a Grid courier gone dark.
**Plus the Thirteen-holder side-spine** (each a vignette: help the holder, learn what a seat costs, or feel a domain
fail): Watanabe Jun (Despair VI, *weakening — urgent*) · Mori Takao (Rage II) · Nakashima Yuna (Fear IV) ·
Inoue Satoru (Hunger IX) · Park Junho (Longing XI). And institutional/Grid jobs: the Auditor's anomaly · Kuroki's
favour that is free to take and ruinous to owe.

## Romances (multi-stage, fade-to-black ceiling; never minors) — 16+
From the 25 romanceable **adults** (Mori 17 and Yua 16 are crush-only, never a route). Each runs four stages —
**notice → trust → turn → fade-to-black** — with the *turn* gated on a real act done for them, not asked:
Itsuki · Aoi · Hagiwara Mizuki · Katagiri Noa · Tendo Akira · Okada Shizuka · Shimizu Ren · Kato Ryusei ·
Moriya Tatsuki · Usami&Ren (the Pair) · Tsukishiro Haruki · Choi Hana · Kurosawa Shou · Nakamura Aoi.

## Authoring order (batches)
Each batch fully authors a slice (status → `authored`) and the rest stay `queued`. The scheduled job authors one
queued section per run in priority order (main chapters → roads → side missions → romances), committing locally,
never pushing. Reaching ~500k is a multi-run effort; do not attempt it in a single pass.

## Where it lives
Authored into `content/story/campaign.json` (long-form, choice-bearing), compiled into `the-story.html` by
`tools/build_story.mjs`. Chapter One's playable prose still feeds the Roads tab. A scheduled batch job grinds
through the remaining word targets, committing locally (never pushing).
