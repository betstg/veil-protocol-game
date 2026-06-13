#!/usr/bin/env python3
"""
Regenerate the Godot /content world from the canonical build (data/veil.db).

This replaces migrate_veildata.py as the source step. The web game and the Godot
engine now derive from the SAME database, so they cannot drift:

    veil-data + content/registry  ->  build_db.py  ->  data/veil.db
                                                            │
                                          sync_from_db.py ──┘──> godot/.../content

Run from the godot/veil-protocol folder:
    python3 tools/sync_from_db.py            # uses ../../data/veil.db

Hand-authored example content (silent_tenant, landlady, echo_001, the example
locations/dialogues/clues) is NOT touched — only world files derived from canon
are rewritten. The example ids are kept on an allowlist below.
"""
import json, sqlite3, sys, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DB = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent.parent / "data" / "veil.db"
CONTENT = ROOT / "content"

# example content authored by hand — never overwrite/delete these
KEEP = {
    "npcs": {"landlady"},
    "entities": {"echo_001"},
    "locations": {"apartment_302", "hallway", "laundry_room"},
}

def J(s):
    if s in (None, ""): return None
    try: return json.loads(s)
    except Exception: return None

def clean(folder, keep):
    # Overwrite-only: the mount disallows deletes, and DB-derived ids match the
    # existing files 1:1, so no stale orphans are produced. We just ensure the dir.
    (CONTENT / folder).mkdir(parents=True, exist_ok=True)

def write(folder, ident, obj):
    (CONTENT / folder / f"{ident}.json").write_text(
        json.dumps({k: v for k, v in obj.items() if v not in (None, "", [], {})},
                   ensure_ascii=False, indent=2), encoding="utf-8")

if not DB.exists():
    sys.exit(f"[ERROR] database not found: {DB} — run tools/build_db.py first")

db = sqlite3.connect(str(DB))
db.row_factory = sqlite3.Row

# ── factions ──
clean("factions", set())
nf = 0
for r in db.execute("SELECT id,name,data_json FROM factions"):
    data = J(r["data_json"]) or {}
    write("factions", r["id"], {"id": r["id"], "name": r["name"],
                                "description": data.get("what") or data.get("description")})
    nf += 1
# guarantee an "unaligned" bucket for content tagged faction:"none"
write("factions", "none", {"id": "none", "name": "Unaligned",
                           "description": "No faction allegiance."}); nf += 1

# ── npcs (from characters) ──
clean("npcs", KEEP["npcs"])
nn = 0
for r in db.execute("""SELECT id,name,full_name,faction,role,location,persona_json,links_json
                       FROM characters WHERE COALESCE(is_player,0)=0"""):
    links = J(r["links_json"]) or []
    write("npcs", r["id"], {
        "id": r["id"], "name": r["name"], "full_name": r["full_name"],
        "faction": r["faction"], "role": str(r["role"]) if r["role"] is not None else None,
        "location": r["location"], "persona": J(r["persona_json"]),
        "links": links,
    })
    nn += 1

# ── entities ──
clean("entities", KEEP["entities"])
ne = 0
for r in db.execute("SELECT id,name,type,register,grade,hp,data_json FROM entities"):
    e = J(r["data_json"]) or {}
    extra = {k: e[k] for k in ("absorb", "tip", "tier") if e.get(k) is not None}
    write("entities", r["id"], {
        "id": r["id"], "name": r["name"], "type": e.get("type") or r["type"] or "spirit",
        "register": e.get("register") or r["register"], "grade": e.get("grade") or r["grade"],
        "description": e.get("absorb"), "hp": e.get("hp") if e.get("hp") is not None else r["hp"],
        "atk": e.get("atk"), "exorcise_dc": e.get("exorciseDC"), "anchor": e.get("anchor"),
        "weaknesses": e.get("weaknesses"), "abilities": e.get("abilities"),
        "loot": e.get("loot"), "extra": extra or None,
    })
    ne += 1

# ── locations (from places) ──
clean("locations", KEEP["locations"])
nl = 0
for r in db.execute("SELECT id,name,faction,data_json FROM places"):
    p = J(r["data_json"]) or {}
    extra = {k: p[k] for k in ("walk", "train", "cab") if p.get(k) is not None}
    write("locations", r["id"], {
        "id": r["id"], "name": r["name"], "faction": p.get("faction") or r["faction"],
        "lat": p.get("lat"), "lng": p.get("lng"), "hours": p.get("hours"),
        "tier": p.get("tier"), "known": p.get("known"), "owner": p.get("owner"),
        "art": p.get("art"), "extra": extra or None,
    })
    nl += 1

# ── reference: thirteen + ranks ──
ref = CONTENT / "reference"; ref.mkdir(exist_ok=True)
thirteen = [J(r["data_json"]) or {"seat": r["seat"], "emotion": r["emotion"], "demon": r["demon"]}
            for r in db.execute("SELECT seat,emotion,demon,data_json FROM thirteen")]
(ref / "thirteen.json").write_text(json.dumps(thirteen, ensure_ascii=False, indent=2), encoding="utf-8")
ranks = [J(r["data_json"]) or {"rank": r["rank"], "name": r["name"]}
         for r in db.execute("SELECT rank,name,data_json FROM ranks")]
(ref / "ranks.json").write_text(json.dumps(ranks, ensure_ascii=False, indent=2), encoding="utf-8")

print("Synced Godot /content from veil.db:")
print(f"  factions  {nf}")
print(f"  npcs      {nn}  (+ {len(KEEP['npcs'])} kept example)")
print(f"  entities  {ne}  (+ {len(KEEP['entities'])} kept example)")
print(f"  locations {nl}  (+ {len(KEEP['locations'])} kept example)")
print(f"  reference thirteen={len(thirteen)} ranks={len(ranks)}")
