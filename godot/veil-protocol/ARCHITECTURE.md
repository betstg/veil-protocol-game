# Architecture

```
Godot 4  →  C#  →  SQLite  →  JSON content layer  →  LLM generator
(runner)   (logic) (store)    (authoring format)     (author)
```

The guiding rule: **the engine never knows the names of cases.** It loads whatever is in
`/content`. Adding "case 47" must require zero engine changes. Everything below serves
that rule.

## The pipeline

```
content/*.json
      │  read
      ▼
JsonValidator        ── validate each doc against content/schema/<kind>.schema.json
      │  pass
      ▼
typed C# models      ── System.Text.Json into DTOs (src/Data/Models)
      │
      ▼
ContentImporter      ── one SQLite transaction; wipe design tables, insert, commit
      │  fail → rollback (DB never left half-written)
      ▼
SQLite (veil.db)     ── design tables + Player* runtime tables
      │  read-only queries
      ▼
ContentLibrary       ── the only thing gameplay talks to
```

Validation happens **before** any DB write, and the write is a single transaction. So a
malformed AI-authored file fails loudly at the gate and never corrupts a working database.

## Why these choices

**Godot 4 + C#** — static typing catches AI-generated mistakes at compile time; clean
class boundaries keep generated code maintainable; first-class access to NuGet for SQLite,
JSON Schema, embeddings, and LLM SDKs.

**SQLite** — local, portable, server-less, one file. The importer rebuilds it from JSON on
demand, so the database is a *cache of the content*, never the source of truth. Delete
`veil.db` and it regenerates.

**JSON content + JSON Schema** — the authoring format is human- and LLM-friendly, and the
schema is the contract. The generator targets the schema; the validator enforces it.

## Data ownership: design vs. runtime

Two classes of table, and the split matters:

- **Design tables** (`Cases`, `Npcs`, `Entities`, `Locations`, `Clues`, `Quests`,
  `DialogueNodes`, ...) are wiped and rebuilt on every import. They are derived data.
- **`Player*` tables** (`PlayerProgress`, `PlayerEntities`, `PlayerClues`) hold per-save
  state. **The importer never touches them.** You can ship new content to an existing save
  without wiping progress.

## Referential integrity is soft

Content is authored incrementally, so a case may reference an entity that doesn't exist
*yet*. Hard foreign keys would make that a crash. Instead the importer downgrades a missing
reference to `NULL` (or skips a join row) and records a **warning**. Real data errors —
malformed JSON, schema violations — are still hard failures that abort the import. This
keeps the authoring loop fast without letting genuinely broken content through.

## The content model

| Kind | Folder | Key relations |
| --- | --- | --- |
| Case | `cases/` | → entity, → locations[], → npcs[], → clues[], has quests[] |
| Entity | `entities/` | weaknesses[], abilities[], register (one of the Thirteen) |
| NPC | `npcs/` | → faction, → location, persona (JSON for the LLM), links[] (knows/romance/...) |
| Location | `locations/` | → faction, connections[] (travel graph), owner npc |
| Dialogue | `dialogues/` | node graph; options carry conditions + effects |
| Clue | `clues/` | → case, → location, `reveals` a topic |
| Faction | `factions/` | lookup |
| Reference | `reference/` | the Thirteen, the rank ladder (read-only lore tables) |

Many-to-many links live in **join tables** (`CaseLocations`, `NpcKnowledge`,
`EntityWeaknesses`, ...), never as comma-delimited strings — so the world is a queryable
graph, the same node+link model the original `veil-data/` used.

## The `persona` block

Every NPC carries a `persona` (`voice` / `traits` / `wants` / `guard`) stored as a JSON
blob. This is what gets handed to the LLM for in-character chat, social posts, and GM
improvisation — set a personality once, here, and every AI agent uses it. `guard` is the
line the character must never cross (the secret-keeper), carried over from the web edition.

## Extending without migrations

Every major table has an `extra` JSON column. AI-authored fields the schema doesn't model
yet ride along in `extra` instead of forcing a schema migration. Promote a field to a real
column only once it earns one.

## Roadmap from here (not in this milestone)

1. **Case runner scenes** — investigation loop, dialogue UI reading `DialogueNodes`/`Options`, clue board.
2. **Effect/condition interpreter** — evaluate the `conditions`/`effects` strings on dialogue options against `Player*` state.
3. **LLM generator** — a tool that emits new `content/cases/*.json` to the schema, then calls `ContentLibrary.Reimport()`.
4. **Combat/exorcism** — read entity `hp`/`atk`/`exorcise_dc`/`weaknesses`.
