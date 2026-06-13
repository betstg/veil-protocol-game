#!/usr/bin/env python3
"""
Migrate the legacy veil-data/*.json (the web edition's source of truth) into the
new /content JSON schema consumed by the Godot/C# importer.

Run from the godot/veil-protocol folder:
    python3 tools/migrate_veildata.py ../../veil-data

It is idempotent: re-running overwrites the migrated files. Hand-authored example
content (e.g. silent_tenant) is never touched because it lives under different ids.
"""
import json, sys, os, pathlib

SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "../../veil-data")
ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"


def load(name):
    p = SRC / name
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else []


def write(folder, ident, obj):
    d = CONTENT / folder
    d.mkdir(parents=True, exist_ok=True)
    (d / f"{ident}.json").write_text(
        json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def clean(d):
    """Drop None / empty values so files stay tidy and schema-clean."""
    return {k: v for k, v in d.items() if v not in (None, "", [], {})}


# ───────── factions ─────────
factions = load("factions.json")
for f in factions:
    write("factions", f["id"], clean({
        "id": f["id"],
        "name": f.get("name", f["id"]),
        "description": f.get("what"),
    }))
# guarantee an "unaligned" bucket for content tagged faction:"none"
write("factions", "none", {"id": "none", "name": "Unaligned",
                            "description": "No faction allegiance."})

# ───────── locations ─────────
for p in load("places.json"):
    extra = {}
    for k in ("walk", "train", "cab"):
        if p.get(k) is not None:
            extra[k] = p[k]
    write("locations", p["id"], clean({
        "id": p["id"],
        "name": p.get("name", p["id"]),
        "faction": p.get("faction"),
        "lat": p.get("lat"),
        "lng": p.get("lng"),
        "hours": p.get("hours"),
        "tier": p.get("tier"),
        "known": p.get("known"),
        "owner": p.get("owner"),
        "art": p.get("art"),
        "extra": extra or None,
    }))

# ───────── npcs (from characters) ─────────
for c in load("characters.json"):
    write("npcs", c["id"], clean({
        "id": c["id"],
        "name": c.get("name", c["id"]),
        "full_name": c.get("fullName"),
        "faction": c.get("faction"),
        "role": c.get("role"),
        "location": c.get("location"),
        "persona": c.get("persona"),
        "links": c.get("links"),
    }))

# ───────── entities ─────────
for e in load("entities.json"):
    extra = {}
    for k in ("absorb", "tip", "tier"):
        if e.get(k) is not None:
            extra[k] = e[k]
    write("entities", e["id"], clean({
        "id": e["id"],
        "name": e.get("name", e["id"]),
        "type": e.get("type") or "spirit",
        "register": e.get("register"),
        "grade": e.get("grade"),
        "description": e.get("absorb"),
        "hp": e.get("hp"),
        "atk": e.get("atk"),
        "exorcise_dc": e.get("exorciseDC"),
        "anchor": e.get("anchor"),
        "weaknesses": e.get("weaknesses"),
        "abilities": e.get("abilities"),
        "loot": e.get("loot"),
        "extra": extra or None,
    }))

# ───────── reference tables (loaded straight, not per-node files) ─────────
ref = CONTENT / "reference"
ref.mkdir(parents=True, exist_ok=True)
for name in ("thirteen.json", "ranks.json"):
    data = load(name)
    if data:
        (ref / name).write_text(json.dumps(data, ensure_ascii=False, indent=2),
                                encoding="utf-8")

print("Migration complete.")
for folder in ("factions", "locations", "npcs", "entities"):
    n = len(list((CONTENT / folder).glob("*.json")))
    print(f"  {folder:10s} {n} files")
