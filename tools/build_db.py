#!/usr/bin/env python3
"""Build the canonical SQLite content DB (data/veil.db) from the book-derived
registries + the current veil-data base. The DB is the single source of truth;
tools/export_db.py regenerates veil-data/*.json (the runtime artifact) from it.

Sources:
  veil-data/characters.json            base game shape (id/name/persona/...) + 4 game-only NPCs
  content/registry/relationships.json  canon relationship map (book ids)
  content/registry/authored.json       backstory/quest/romance/crush/companion (book ids)
Mapping book id -> game id is by normalized name.
Run from repo root:  python3 tools/build_db.py
"""
import json, os, re, sqlite3, unicodedata, html, tempfile, shutil

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def P(*a): return os.path.join(HERE, *a)
def load(p): return json.load(open(P(*p), encoding="utf-8"))

def norm(s):
    s = html.unescape(s or ""); s = re.split(r",|/|…|\.\.\.| · ", s)[0]
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", s.lower())

chars   = load(["veil-data", "characters.json"])
rels    = load(["content", "registry", "relationships.json"])
authored= load(["content", "registry", "authored.json"])
_tiersp = P("content", "registry", "tiers.json")
tiers   = json.load(open(_tiersp, encoding="utf-8")) if os.path.exists(_tiersp) else {}
_best = P("content", "registry", "bestiary.json")   # authored bestiary (with loot) is the source
entities= json.load(open(_best, encoding="utf-8")) if os.path.exists(_best) else load(["veil-data", "entities.json"])
places  = load(["veil-data", "places.json"])
factions= load(["veil-data", "factions.json"])
ranks   = load(["veil-data", "ranks.json"])
thirteen= load(["veil-data", "thirteen.json"])
_shop = P("content", "registry", "shop_animals.json")
shop_animals = json.load(open(_shop, encoding="utf-8")) if os.path.exists(_shop) else []

# book id -> game id  (by name); rei stays rei (the player)
game_by_norm = {norm(c["name"]): c["id"] for c in chars}
bid2gid = {"rei": "rei"}
for bid, rec in rels.items():
    g = game_by_norm.get(norm(rec["name"]))
    if g: bid2gid[bid] = g

os.makedirs(P("data"), exist_ok=True)
db = P("data", "veil.db")
# Build on the LOCAL filesystem first — SQLite's journal/locking fails on some
# network/FUSE-mounted folders — then copy the finished file into place.
_tmp = os.path.join(tempfile.mkdtemp(prefix="veildb_"), "veil.db")
con = sqlite3.connect(_tmp); cur = con.cursor()
cur.executescript("""
PRAGMA foreign_keys=ON;
CREATE TABLE characters(
  id TEXT PRIMARY KEY, name TEXT, full_name TEXT, faction TEXT, role TEXT, location TEXT,
  romanceable INTEGER DEFAULT 0, is_entity INTEGER DEFAULT 0, is_player INTEGER DEFAULT 0,
  age INTEGER, register TEXT, reg_name TEXT,
  persona_json TEXT, links_json TEXT,
  backstory_json TEXT, quest_json TEXT, romance_json TEXT, crush_json TEXT,
  tier TEXT, tier_letter TEXT, paths_json TEXT);
CREATE TABLE relationships(
  from_id TEXT, to_id TEXT, value INTEGER, tier INTEGER, note TEXT, source TEXT,
  PRIMARY KEY(from_id, to_id),
  FOREIGN KEY(from_id) REFERENCES characters(id),
  FOREIGN KEY(to_id)   REFERENCES characters(id));
CREATE TABLE companions(
  char_id TEXT PRIMARY KEY, species TEXT, name TEXT, role TEXT, descr TEXT,
  FOREIGN KEY(char_id) REFERENCES characters(id));
CREATE TABLE entities(id TEXT PRIMARY KEY, name TEXT, type TEXT, register TEXT, grade TEXT,
  hp INTEGER, data_json TEXT);
CREATE TABLE places  (id TEXT PRIMARY KEY, name TEXT, faction TEXT, data_json TEXT);
CREATE TABLE factions(id TEXT PRIMARY KEY, name TEXT, data_json TEXT);
CREATE TABLE ranks   (rank TEXT PRIMARY KEY, name TEXT, data_json TEXT);
CREATE TABLE thirteen(seat TEXT PRIMARY KEY, emotion TEXT, demon TEXT, data_json TEXT);
CREATE TABLE shop_animals(id TEXT PRIMARY KEY, species TEXT, name TEXT, ritual TEXT,
  mission TEXT, temperament TEXT, trained TEXT, price_money INTEGER, price_tickets INTEGER,
  blurb TEXT, data_json TEXT);
""")

# ---- characters (base game rows) ----
for c in chars:
    cur.execute("""INSERT INTO characters(id,name,full_name,faction,role,location,romanceable,
                   age,persona_json,links_json) VALUES(?,?,?,?,?,?,?,?,?,?)""",
        (c["id"], c.get("name"), c.get("fullName"), c.get("faction"), c.get("role"),
         c.get("location"), 1 if c.get("romanceable") else 0,
         (c.get("persona") or {}).get("age"),
         json.dumps(c.get("persona"), ensure_ascii=False),
         json.dumps(c.get("links"), ensure_ascii=False)))
# the player (so Rei<->NPC relationships resolve)
cur.execute("INSERT OR IGNORE INTO characters(id,name,is_player) VALUES('rei','Uedera Rei',1)")

# ---- enrich from authored (book) ----
for bid, a in authored.items():
    gid = bid2gid.get(bid)
    if not gid: continue
    cur.execute("""UPDATE characters SET is_entity=?, register=?, reg_name=?,
                   backstory_json=?, quest_json=?, romance_json=?, crush_json=?,
                   romanceable=MAX(romanceable,?) WHERE id=?""",
        (1 if a.get("entity") else 0, a.get("register"), a.get("reg_name"),
         json.dumps(a.get("back"), ensure_ascii=False) if a.get("back") else None,
         json.dumps(a.get("quest"), ensure_ascii=False) if a.get("quest") else None,
         json.dumps(a.get("romance"), ensure_ascii=False) if a.get("romance") else None,
         json.dumps(a.get("crush"), ensure_ascii=False) if a.get("crush") else None,
         1 if a.get("romanceable") else 0, gid))
    comp = a.get("companion")
    if comp:
        cur.execute("INSERT OR REPLACE INTO companions VALUES(?,?,?,?,?)",
            (gid, comp.get("species"), comp.get("name"), comp.get("role"), comp.get("desc")))

# ---- operator tier + ability paths (from tiers.json, book ids) ----
for bid, tv in tiers.items():
    gid = bid2gid.get(bid)
    if not gid: continue
    cur.execute("UPDATE characters SET tier=?, tier_letter=?, paths_json=? WHERE id=?",
        (tv.get("tier"), tv.get("letter"),
         json.dumps(tv.get("paths") or {}, ensure_ascii=False), gid))

# ---- relationships (translate book ids -> game ids) ----
ins = 0
for bid, rec in rels.items():
    fr = bid2gid.get(bid)
    if not fr: continue
    for to_bid, info in rec.get("ties", {}).items():
        to = bid2gid.get(to_bid)
        if not to or to == fr: continue
        cur.execute("INSERT OR IGNORE INTO relationships VALUES(?,?,?,?,?,?)",
            (fr, to, info["value"], info["tier"], info["note"], info["source"]))
        ins += 1

# ---- passthrough domain tables ----
for e in entities:
    cur.execute("INSERT OR REPLACE INTO entities VALUES(?,?,?,?,?,?,?)",
        (e["id"], e.get("name"), e.get("type"), e.get("register"), e.get("grade"),
         e.get("hp"), json.dumps(e, ensure_ascii=False)))
for p in places:
    cur.execute("INSERT OR REPLACE INTO places VALUES(?,?,?,?)",
        (p["id"], p.get("name"), p.get("faction"), json.dumps(p, ensure_ascii=False)))
for f in factions:
    cur.execute("INSERT OR REPLACE INTO factions VALUES(?,?,?)",
        (f["id"], f.get("name"), json.dumps(f, ensure_ascii=False)))
for r in ranks:
    cur.execute("INSERT OR REPLACE INTO ranks VALUES(?,?,?)",
        (r["rank"], r.get("name"), json.dumps(r, ensure_ascii=False)))
for t in thirteen:
    cur.execute("INSERT OR REPLACE INTO thirteen VALUES(?,?,?,?)",
        (t["seat"], t.get("emotion"), t.get("demon"), json.dumps(t, ensure_ascii=False)))
for s in shop_animals:
    pr = s.get("price", {})
    cur.execute("INSERT OR REPLACE INTO shop_animals VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        (s["id"], s.get("species"), s.get("name"), s.get("ritual"), s.get("mission"),
         s.get("temperament"), s.get("trained"), pr.get("money"), pr.get("tickets"),
         s.get("blurb"), json.dumps(s, ensure_ascii=False)))

con.commit()
nc = cur.execute("SELECT COUNT(*) FROM characters").fetchone()[0]
ncomp = cur.execute("SELECT COUNT(*) FROM companions").fetchone()[0]
con.close()
shutil.copyfile(_tmp, db); shutil.rmtree(os.path.dirname(_tmp), ignore_errors=True)
print(f"veil.db built -> {db}")
print(f"  characters {nc} | relationships {ins} | companions {ncomp} | "
      f"entities {len(entities)} | places {len(places)} | shop_animals {len(shop_animals)}")
