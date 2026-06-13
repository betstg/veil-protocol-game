#!/usr/bin/env python3
"""
Verification harness for the data layer. Mirrors the C# ContentImporter in Python so the
whole pipeline can be checked without launching Godot:

  1. validate every /content doc against its JSON Schema (content/schema/*.schema.json)
  2. build a real SQLite db from db/schema.sql
  3. import all content with the same soft-ref rules the C# importer uses
  4. assert foreign-key integrity and print row counts

Exit code 0 = pipeline green.
"""
import json, sqlite3, sys, pathlib, glob

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
errors, warnings = [], []

try:
    from jsonschema import Draft202012Validator
except ImportError:
    print("jsonschema not installed; run: pip install jsonschema --break-system-packages")
    sys.exit(2)

# ── load schemas ──
schemas = {}
for sp in (CONTENT / "schema").glob("*.schema.json"):
    schemas[sp.name.replace(".schema.json", "")] = Draft202012Validator(json.loads(sp.read_text()))

def docs(folder):
    for fp in sorted((CONTENT / folder).glob("*.json")):
        data = json.loads(fp.read_text())
        for d in (data if isinstance(data, list) else [data]):
            yield fp.name, d

def validate(kind, folder):
    out = []
    v = schemas[kind]
    for fname, d in docs(folder):
        errs = sorted(v.iter_errors(d), key=lambda e: e.path)
        if errs:
            for e in errs:
                errors.append(f"{folder}/{fname} @ {'/'.join(map(str,e.path))}: {e.message}")
        else:
            out.append(d)
    return out

factions  = validate("faction",  "factions")
locations = validate("location", "locations")
npcs      = validate("npc",      "npcs")
entities  = validate("entity",   "entities")
cases     = validate("case",     "cases")
clues     = validate("clue",     "clues")
dialogues = validate("dialogue", "dialogues")

if errors:
    print(f"SCHEMA VALIDATION FAILED — {len(errors)} error(s):")
    for e in errors[:40]:
        print("  " + e)
    sys.exit(1)
print("Schema validation: PASS")

# ── build db ──
db = sqlite3.connect(":memory:")
db.executescript((ROOT / "db" / "schema.sql").read_text())
db.execute("PRAGMA foreign_keys=ON")
cur = db.cursor()

fac_ids = {f["id"] for f in factions}
loc_ids = {l["id"] for l in locations}
ent_ids = {e["id"] for e in entities}
npc_ids = {n["id"] for n in npcs}
case_ids = {c["id"] for c in cases}

def fac(x):
    if not x: return None
    if x in fac_ids: return x
    warnings.append(f"unknown faction '{x}' -> NULL"); return None

for f in factions:
    cur.execute("INSERT INTO Factions(id,name,description) VALUES(?,?,?)",
                (f["id"], f["name"], f.get("description") or f.get("what")))

for l in locations:
    cur.execute("""INSERT INTO Locations(id,name,faction_id,description,lat,lng,hours,tier,known,owner_npc,art,extra)
                   VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
                (l["id"], l["name"], fac(l.get("faction")), l.get("description"),
                 l.get("lat"), l.get("lng"), l.get("hours"), l.get("tier"),
                 1 if l.get("known") else 0, l.get("owner"), l.get("art"),
                 json.dumps(l.get("extra")) if l.get("extra") else None))
for l in locations:
    for c in l.get("connections", []) or []:
        c = {"to": c} if isinstance(c, str) else c
        if c["to"] not in loc_ids:
            warnings.append(f"loc {l['id']} -> unknown {c['to']}"); continue
        cur.execute("INSERT OR REPLACE INTO LocationConnections(from_id,to_id,walk_min,train_min,cab_min) VALUES(?,?,?,?,?)",
                    (l["id"], c["to"], c.get("walk"), c.get("train"), c.get("cab")))

for e in entities:
    cur.execute("""INSERT INTO Entities(id,name,type,register,grade,threat_level,description,hp,atk,exorcise_dc,anchor,loot,extra)
                   VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (e["id"], e["name"], e.get("type"), e.get("register"), e.get("grade"),
                 e.get("threat_level"), e.get("description"), e.get("hp"), e.get("atk"),
                 e.get("exorcise_dc"), e.get("anchor"),
                 json.dumps(e.get("loot")) if e.get("loot") else None,
                 json.dumps(e.get("extra")) if e.get("extra") else None))
    for w in e.get("weaknesses", []) or []:
        cur.execute("INSERT OR IGNORE INTO EntityWeaknesses(entity_id,weakness) VALUES(?,?)", (e["id"], w))
    for a in e.get("abilities", []) or []:
        cur.execute("INSERT OR IGNORE INTO EntityAbilities(entity_id,ability) VALUES(?,?)", (e["id"], a))

for n in npcs:
    cur.execute("""INSERT INTO Npcs(id,name,full_name,faction_id,role,location_id,trust,persona,dialogue_root,extra)
                   VALUES(?,?,?,?,?,?,?,?,?,?)""",
                (n["id"], n["name"], n.get("full_name"), fac(n.get("faction")), n.get("role"),
                 n.get("location"), n.get("trust", 0),
                 json.dumps(n.get("persona")) if n.get("persona") else None,
                 n.get("dialogue_root"),
                 json.dumps(n.get("extra")) if n.get("extra") else None))
    for t in n.get("knowledge", []) or []:
        cur.execute("INSERT OR IGNORE INTO NpcKnowledge(npc_id,topic) VALUES(?,?)", (n["id"], t))
    for lk in n.get("links", []) or []:
        cur.execute("INSERT OR REPLACE INTO NpcRelationships(npc_id,rel_type,target_id,value) VALUES(?,?,?,?)",
                    (n["id"], lk["type"], lk["to"], lk.get("value")))

for c in cases:
    ent = c.get("entity")
    if ent and ent not in ent_ids:
        warnings.append(f"case {c['id']} -> unknown entity {ent}"); ent = None
    cur.execute("INSERT INTO Cases(id,title,description,difficulty,status,entity_id) VALUES(?,?,?,?,?,?)",
                (c["id"], c["title"], c.get("description"), c.get("difficulty", 1),
                 c.get("status", "available"), ent))
    for loc in c.get("locations", []) or []:
        if loc in loc_ids:
            cur.execute("INSERT OR IGNORE INTO CaseLocations(case_id,location_id) VALUES(?,?)", (c["id"], loc))
        else: warnings.append(f"case {c['id']} -> unknown loc {loc}")
    for npc in c.get("npcs", []) or []:
        if npc in npc_ids:
            cur.execute("INSERT OR IGNORE INTO CaseNpcs(case_id,npc_id) VALUES(?,?)", (c["id"], npc))
        else: warnings.append(f"case {c['id']} -> unknown npc {npc}")
    for i, q in enumerate(c.get("quests", []) or []):
        cur.execute("INSERT INTO Quests(id,case_id,title,description,objective,sort_order) VALUES(?,?,?,?,?,?)",
                    (q["id"], c["id"], q["title"], q.get("description"), q.get("objective"), i))

for cl in clues:
    if cl["case_id"] not in case_ids:
        warnings.append(f"clue {cl['id']} -> unknown case {cl['case_id']}"); continue
    loc = cl.get("location") if cl.get("location") in loc_ids else None
    cur.execute("INSERT INTO Clues(id,case_id,name,description,location_id,reveals) VALUES(?,?,?,?,?,?)",
                (cl["id"], cl["case_id"], cl["name"], cl.get("description"), loc, cl.get("reveals")))

for tree in dialogues:
    for node in tree["nodes"]:
        cur.execute("INSERT OR REPLACE INTO DialogueNodes(id,npc_id,text,conditions) VALUES(?,?,?,?)",
                    (node["id"], tree.get("npc_id"), node["text"],
                     json.dumps(node.get("conditions")) if node.get("conditions") else None))
    for node in tree["nodes"]:
        for i, opt in enumerate(node.get("options", []) or []):
            cur.execute("INSERT INTO DialogueOptions(node_id,text,next_node,conditions,effects,sort_order) VALUES(?,?,?,?,?,?)",
                        (node["id"], opt["text"], opt.get("next"),
                         json.dumps(opt.get("conditions")) if opt.get("conditions") else None,
                         json.dumps(opt.get("effects")) if opt.get("effects") else None, i))

# reference tables
ref = CONTENT / "reference"
if (ref / "thirteen.json").exists():
    for r in json.loads((ref / "thirteen.json").read_text()):
        cur.execute("INSERT OR REPLACE INTO Thirteen(seat,emotion,holder,location,status,demon) VALUES(?,?,?,?,?,?)",
                    (r.get("seat"), r.get("emotion"), r.get("holder"), r.get("location"), r.get("status"), r.get("demon")))
if (ref / "ranks.json").exists():
    for r in json.loads((ref / "ranks.json").read_text()):
        cur.execute("INSERT OR REPLACE INTO Ranks(rank,name,note,hidden_from_player) VALUES(?,?,?,?)",
                    (r.get("rank"), r.get("name"), r.get("note"), 1 if r.get("hiddenFromPlayer") else 0))

db.commit()

# ── integrity check ──
fk = db.execute("PRAGMA foreign_key_check").fetchall()
if fk:
    print(f"FOREIGN KEY VIOLATIONS: {len(fk)}")
    for row in fk[:20]: print("  ", row)
    sys.exit(1)

counts = {t: cur.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in
          ("Factions","Locations","LocationConnections","Entities","EntityWeaknesses",
           "Npcs","NpcKnowledge","NpcRelationships","Cases","CaseLocations","CaseNpcs",
           "Clues","Quests","DialogueNodes","DialogueOptions","Thirteen","Ranks")}

print("Import to SQLite: PASS (foreign keys intact)")
print("Row counts:")
for t, n in counts.items():
    print(f"  {t:22s} {n}")
print(f"\nWarnings (soft refs, non-fatal): {len(warnings)}")
for w in warnings[:15]:
    print("  " + w)

# spot-check the example case is fully wired
row = cur.execute("""SELECT c.title, e.name, COUNT(DISTINCT cl.id), COUNT(DISTINCT cln.location_id)
                     FROM Cases c LEFT JOIN Entities e ON e.id=c.entity_id
                     LEFT JOIN Clues cl ON cl.case_id=c.id
                     LEFT JOIN CaseLocations cln ON cln.case_id=c.id
                     WHERE c.id='silent_tenant'""").fetchone()
print(f"\nExample case wired: title={row[0]!r} entity={row[1]!r} clues={row[2]} locations={row[3]}")
print("\nPIPELINE GREEN")
