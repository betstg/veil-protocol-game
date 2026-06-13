# Veil Protocol — Godot 4 / C# edition (data layer)

A data-driven case engine for *Veil Protocol: The Other Side*. The engine is a **case
runner**; the AI is the **case author**. Game content never lives in code — it lives in
`/content` as JSON, is validated, and is imported into a local SQLite database the game
reads at runtime.

```
JSON (/content)  →  validate (JSON Schema)  →  import  →  SQLite  →  game reads
        ▲
   LLM generator writes here
```

This milestone delivers the **content pipeline only** — no gameplay scenes yet. It is
complete and verified end to end.

## What's here

| Path | What it is |
| --- | --- |
| `content/` | All game content as JSON: `cases/`, `entities/`, `npcs/`, `locations/`, `dialogues/`, `clues/`, `factions/`, `reference/` |
| `content/schema/` | JSON Schemas (Draft 2020-12) every content file is validated against |
| `db/schema.sql` | The SQLite schema (design tables + runtime `Player*` tables) |
| `src/Data/Models/` | C# DTOs mirroring the JSON |
| `src/Data/Database.cs` | Autoload: owns the SQLite connection, applies the schema |
| `src/Data/JsonValidator.cs` | Validates content against its schema before import |
| `src/Data/ContentImporter.cs` | JSON → validate → SQLite, all-or-nothing |
| `src/Data/ContentLibrary.cs` | Autoload: runs the import on startup, serves read queries |
| `src/Core/Bootstrap.*` | Minimal entry scene that proves the pipeline is alive |
| `tools/migrate_veildata.py` | Converts the legacy `veil-data/` world into this schema |
| `tools/verify_pipeline.py` | Validates + import-tests the whole pipeline without Godot |

## Content seeded

- **Example case** `silent_tenant` — proves the pipeline: a case, the `echo_001` entity, Mrs. Fujimoto (`landlady`), three locations, a dialogue tree, and three clues.
- **Migrated world** — the existing Veil Protocol world, converted from `veil-data/`: 74 NPCs, 38 locations, 8 factions, 22 entities, the Thirteen, and the rank ladder.

## Run the pipeline check (no Godot needed)

```bash
pip install jsonschema --break-system-packages
python3 tools/verify_pipeline.py
```

Expected tail: `PIPELINE GREEN`. It validates every JSON file against its schema, builds
a real SQLite database from `db/schema.sql`, imports all content with the same soft-ref
rules as the C# importer, and asserts foreign-key integrity.

## Open in Godot

1. Install **Godot 4.x (.NET / C# build)** and the **.NET 8 SDK**.
2. Open this folder as a project. Godot restores the NuGet packages
   (`Microsoft.Data.Sqlite`, `JsonSchema.Net`) on first build.
3. Press Play. `Bootstrap` opens the DB, imports `/content`, and prints the available
   cases and the wired example to the Output panel.

## Add content (the whole point)

Drop a new JSON file in the right `/content` folder — no code change, no `if (case == ...)`.
The importer validates it and the game picks it up. The LLM generator writes here too.

```jsonc
// content/cases/your_case.json
{ "id": "your_case", "title": "...", "difficulty": 2, "entity": "...",
  "locations": ["..."], "npcs": ["..."], "clues": ["..."] }
```

Re-run `python3 tools/verify_pipeline.py` (or just Play) to confirm it's valid and wired.

See `ARCHITECTURE.md` for the full design rationale.
