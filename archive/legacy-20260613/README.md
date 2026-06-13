# Legacy archive — 2026-06-13

## characters.json (root copy)
Exact duplicate of `veil-data/characters.json` (73 characters, identical ids).
Not fetched by any web page and not read by `build_db.py` (which uses the
`veil-data/` copy). Archived here when the project consolidated on
`content/registry` as the canonical authored source.

Persona data from this file was merged into `content/registry/personas.json`.
The `veil-data/` folder itself was NOT archived: the web game reads
`veil-data/entities.json` at runtime and the build loop
(`build_db.py` -> `data/veil.db` -> `export_db.py`) reads/writes `veil-data/*.json`.
