# Veil Protocol — Full Campaign Blueprint

Target scale: **~4 hours main story** + **~2 hours per road** (×6) + longer **side missions** and **romances**.
Interactive narrative runs slower than prose (deliberation, branching, re-reading), so the working estimate is
**~3,500 authored words ≈ 1 hour of play**. That gives rough word targets:

| Strand | Hours | Target words |
|---|---|---|
| Main spine (the Gin / Yushiro arc) | 4 | ~14,000 |
| Road: Itsuki (Kuroda / Tower) | 2 | ~7,000 |
| Road: CVD (Directorate) | 2 | ~7,000 |
| Road: Grid (unregistered) | 2 | ~7,000 |
| Road: Power (the Gift) | 2 | ~7,000 |
| Road: Look (the long way) | 2 | ~7,000 |
| Side missions (8–10, multi-scene each) | — | ~10,000 |
| Romances (Itsuki + 4, multi-stage, fade-to-black) | — | ~8,000 |
| **Total** | **~16+** | **~74,000** |

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

## Side missions (multi-scene, real stakes)
Yua's debt · Mori's crush and the thing in the dorm · Tanizaki's drowned client · the animal-medium broker ·
the bookseller's locked shelf · Kaneda's last bottle · the shrine that stopped answering · a Grid courier gone dark.

## Romances (multi-stage, fade-to-black ceiling; never minors)
Itsuki (the painter) · Aoi (CVD junior) · plus two-three more from the romanceable cast, each in 4 stages:
**notice → trust → turn → fade-to-black**, gated on a real act done for them, not asked.

## Where it lives
Authored into `content/story/campaign.json` (long-form, choice-bearing), compiled into `the-story.html` by
`tools/build_story.mjs`. Chapter One's playable prose still feeds the Roads tab. A scheduled batch job grinds
through the remaining word targets, committing locally (never pushing).
