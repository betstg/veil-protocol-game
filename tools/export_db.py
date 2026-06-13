#!/usr/bin/env python3
"""Export veil-data/*.json (the runtime artifact the GAME loads) from the
canonical SQLite DB (data/veil.db). The game's required character fields
(id, name, fullName, faction, role, location, links, persona, romanceable)
are reproduced verbatim; relationships, companion and book prose are added as
extra fields the game safely ignores and the AI Warden can use.
Run from repo root:  python3 tools/export_db.py
"""
import json, os, sqlite3, tempfile, shutil, re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def P(*a): return os.path.join(HERE, *a)
def J(x): return json.loads(x) if x else None

def tags_for(rec, p):
    """A compact keyword index the Warden can scan to pull the right character
    context fast, without re-reading the whole sheet. Token-economical: deduped,
    short, capped. Derived purely from existing sheet data."""
    p = p or {}
    t = []
    if rec.get("faction"):    t.append(rec["faction"])
    if rec.get("tierLetter"): t.append("rank:" + str(rec["tierLetter"]))
    if rec.get("registered") is True:  t.append("registered")
    if rec.get("registered") is False: t.append("unregistered")
    if rec.get("romanceable"): t.append("romanceable")
    if rec.get("entity"):      t.append("entity")
    emo = p.get("emotion") or p.get("register")
    if emo: t.append(str(emo).lower())
    for w in re.split(r"[,/;]| and ", str(p.get("traits") or "")):
        w = w.strip().lower()
        if 1 < len(w) <= 18: t.append(w)
    kl = str(p.get("knowsLore") or "").lower()
    if "practitioner" in kl: t.append("practitioner")
    elif "civilian" in kl or kl.startswith("no "): t.append("civilian")
    age = p.get("age")
    if isinstance(age, int): t.append("minor" if age < 18 else "adult")
    for ln in (rec.get("links") or []):
        if ln.get("type") == "lives_at" and ln.get("to"): t.append("loc:" + str(ln["to"]))
    for k in (p.get("knows") or [])[:4]:
        t.append("knows:" + str(k))
    seen, out = set(), []
    for x in t:
        x = str(x).strip()
        if x and x.lower() not in seen:
            seen.add(x.lower()); out.append(x)
    return out[:14]

src = P("data", "veil.db")
# copy to local fs first (SQLite over a network/FUSE mount can error)
tmp = os.path.join(tempfile.mkdtemp(prefix="veilexp_"), "veil.db")
shutil.copyfile(src, tmp)
con = sqlite3.connect(tmp); con.row_factory = sqlite3.Row; cur = con.cursor()

# relationships grouped by from_id
rel_by = {}
for r in cur.execute("SELECT from_id,to_id,value,tier,note,source FROM relationships"):
    rel_by.setdefault(r["from_id"], []).append(
        {"to": r["to_id"], "value": r["value"], "tier": r["tier"], "note": r["note"]})
for k in rel_by: rel_by[k].sort(key=lambda x: -x["value"])
comps = {r["char_id"]: {"species": r["species"], "name": r["name"],
                        "role": r["role"], "desc": r["descr"]}
         for r in cur.execute("SELECT * FROM companions")}

characters = []
for c in cur.execute("SELECT * FROM characters WHERE COALESCE(is_player,0)=0 ORDER BY rowid"):
    rec = {                                   # --- exact game shape ---
        "id": c["id"], "name": c["name"], "fullName": c["full_name"],
        "faction": c["faction"], "role": c["role"], "location": c["location"],
        "links": J(c["links_json"]) or [], "persona": J(c["persona_json"]),
        "romanceable": bool(c["romanceable"]),
    }
    rels = rel_by.get(c["id"])               # --- enrichments (book canon) ---
    if rels: rec["relationships"] = rels
    if c["id"] in comps: rec["companion"] = comps[c["id"]]
    if c["backstory_json"]: rec["backstory"] = J(c["backstory_json"])
    if c["quest_json"]:     rec["quest"]     = J(c["quest_json"])
    if c["romance_json"]:   rec["romance"]   = J(c["romance_json"])
    if c["crush_json"]:     rec["crush"]     = J(c["crush_json"])
    if c["is_entity"]:      rec["entity"]    = True
    if c["tier"]:           rec["tier"]      = c["tier"]
    if c["tier_letter"]:    rec["tierLetter"]= c["tier_letter"]
    if c["registered"] is not None: rec["registered"] = str(c["registered"]).strip().lower() in ("1","true","yes")
    if c["standing"]:       rec["standing"]  = c["standing"]
    if c["rank_note"]:      rec["rankNote"]  = c["rank_note"]
    _paths = J(c["paths_json"])
    if _paths:              rec["paths"]     = _paths
    rec["tags"] = tags_for(rec, rec.get("persona"))   # GM lookup index
    characters.append(rec)

def dump(name, rows):
    json.dump(rows, open(P("veil-data", name), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

dump("characters.json", characters)
dump("entities.json",  [J(r["data_json"]) for r in cur.execute("SELECT data_json FROM entities")])
dump("places.json",    [J(r["data_json"]) for r in cur.execute("SELECT data_json FROM places")])
dump("factions.json",  [J(r["data_json"]) for r in cur.execute("SELECT data_json FROM factions")])
dump("ranks.json",     [J(r["data_json"]) for r in cur.execute("SELECT data_json FROM ranks")])
dump("thirteen.json",  [J(r["data_json"]) for r in cur.execute("SELECT data_json FROM thirteen")])
try:
    dump("shop_animals.json", [J(r["data_json"]) for r in cur.execute("SELECT data_json FROM shop_animals")])
except sqlite3.OperationalError:
    pass  # older DB without the table
con.close(); shutil.rmtree(os.path.dirname(tmp), ignore_errors=True)
print(f"exported veil-data/*.json  (characters={len(characters)}, "
      f"enriched with relationships+companion+prose)")
