using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using Godot;
using Microsoft.Data.Sqlite;

namespace VeilProtocol.Data;

using Models;

/// <summary>
/// Reads /content (JSON), validates every document against its schema, then loads the
/// result into the SQLite design tables. Pipeline:
///
///     JSON files  ->  JsonValidator  ->  typed models  ->  SQLite (design tables)
///
/// Design tables are wiped and rebuilt each run; Player* tables are never touched, so
/// re-importing fresh content does not wipe a save. Referential integrity is enforced
/// softly: a reference to a missing faction/location becomes NULL with a warning rather
/// than a hard crash, because content is authored incrementally.
/// </summary>
public sealed class ContentImporter
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true
    };

    private readonly Database _db;
    private readonly JsonValidator _validator;
    private readonly string _contentRoot;
    private readonly List<string> _warnings = new();
    private readonly List<string> _errors = new();

    private HashSet<string> _knownFactions = new();
    private HashSet<string> _knownLocations = new();
    private HashSet<string> _knownEntities = new();
    private HashSet<string> _knownNpcs = new();
    private HashSet<string> _knownCases = new();

    public IReadOnlyList<string> Warnings => _warnings;
    public IReadOnlyList<string> Errors => _errors;

    public ContentImporter(Database db, JsonValidator validator, string contentRoot = "res://content")
    {
        _db = db;
        _validator = validator;
        _contentRoot = contentRoot;
    }

    public sealed record Summary(
        int Factions, int Locations, int Npcs, int Entities,
        int Cases, int Clues, int DialogueNodes, int Errors, int Warnings);

    /// <summary>Validate-then-import everything. Aborts the DB transaction if any doc fails validation.</summary>
    public Summary Run()
    {
        // ── phase 1: read + validate all documents (no DB writes yet) ──
        var factions = ReadDir<Faction>("factions", "faction");
        var locations = ReadDir<Location>("locations", "location");
        var npcs = ReadDir<Npc>("npcs", "npc");
        var entities = ReadDir<Entity>("entities", "entity");
        var cases = ReadDir<Case>("cases", "case");
        var clues = ReadDirArrays<Clue>("clues", "clue");
        var dialogues = ReadDir<DialogueTree>("dialogues", "dialogue");

        if (_errors.Count > 0)
        {
            GD.PrintErr($"[Importer] {_errors.Count} validation error(s); import aborted.");
            foreach (var e in _errors) GD.PrintErr("  " + e);
            return Snapshot(0, 0, 0, 0, 0, 0, 0);
        }

        _knownFactions = factions.Select(f => f.Id).ToHashSet();
        _knownLocations = locations.Select(l => l.Id).ToHashSet();
        _knownEntities = entities.Select(e => e.Id).ToHashSet();
        _knownNpcs = npcs.Select(n => n.Id).ToHashSet();
        _knownCases = cases.Select(c => c.Id).ToHashSet();

        // ── phase 2: write, all-or-nothing ──
        using var tx = _db.Begin();
        try
        {
            WipeDesignTables();
            ImportFactions(factions);
            ImportLocations(locations);
            ImportEntities(entities);
            ImportNpcs(npcs);
            ImportCases(cases);
            ImportClues(clues);
            ImportDialogues(dialogues);
            ImportReference();
            _db.Execute("INSERT OR REPLACE INTO ImportMeta(key,value) VALUES('imported_at',@t)",
                ("@t", DateTime.UtcNow.ToString("o")));
            tx.Commit();
        }
        catch (Exception ex)
        {
            tx.Rollback();
            _errors.Add($"import write failed, rolled back: {ex.Message}");
            GD.PrintErr("[Importer] " + ex);
        }

        return Snapshot(factions.Count, locations.Count, npcs.Count, entities.Count,
            cases.Count, clues.Count, dialogues.Sum(d => d.Nodes.Count));
    }

    private Summary Snapshot(int f, int l, int n, int e, int c, int cl, int dn) =>
        new(f, l, n, e, c, cl, dn, _errors.Count, _warnings.Count);

    // ───────────────────────── reading + validation ─────────────────────────

    private List<T> ReadDir<T>(string folder, string kind)
    {
        var list = new List<T>();
        string path = $"{_contentRoot}/{folder}";
        using var dir = DirAccess.Open(path);
        if (dir == null) return list;
        foreach (var file in dir.GetFiles())
        {
            if (!file.EndsWith(".json")) continue;
            string res = $"{path}/{file}";
            JsonNode? node = ParseFile(res);
            if (node == null) continue;

            // a file may hold a single object or an array of them
            foreach (var doc in Flatten(node))
            {
                var result = _validator.Validate(kind, doc, $"{folder}/{file}");
                if (!result.Ok) { _errors.AddRange(result.Errors); continue; }
                var model = doc.Deserialize<T>(JsonOpts);
                if (model != null) list.Add(model);
            }
        }
        return list;
    }

    // clues ship as arrays grouped by case; identical handling, named for clarity.
    private List<T> ReadDirArrays<T>(string folder, string kind) => ReadDir<T>(folder, kind);

    private IEnumerable<JsonNode> Flatten(JsonNode node)
    {
        if (node is JsonArray arr)
            foreach (var item in arr) { if (item != null) yield return item; }
        else
            yield return node;
    }

    private JsonNode? ParseFile(string resPath)
    {
        using var f = Godot.FileAccess.Open(resPath, Godot.FileAccess.ModeFlags.Read);
        if (f == null) { _errors.Add($"{resPath}: cannot open"); return null; }
        try { return JsonNode.Parse(f.GetAsText()); }
        catch (Exception ex) { _errors.Add($"{resPath}: invalid JSON — {ex.Message}"); return null; }
    }

    // ───────────────────────── table writers ─────────────────────────

    private static readonly string[] DesignTables =
    {
        "DialogueOptions", "DialogueNodes", "Quests", "Clues", "CaseNpcs", "CaseLocations",
        "Cases", "NpcRelationships", "NpcKnowledge", "Npcs", "EntityAbilities",
        "EntityWeaknesses", "Entities", "LocationConnections", "Locations",
        "Thirteen", "Ranks", "Factions"
    };

    private void WipeDesignTables()
    {
        foreach (var t in DesignTables) _db.Execute($"DELETE FROM {t};");
    }

    private string? FactionOrNull(string? id)
    {
        if (string.IsNullOrEmpty(id)) return null;
        if (_knownFactions.Contains(id)) return id;
        _warnings.Add($"unknown faction '{id}' referenced; stored as NULL");
        return null;
    }

    private void ImportFactions(List<Faction> rows)
    {
        foreach (var f in rows)
            _db.Execute(
                "INSERT INTO Factions(id,name,description,extra) VALUES(@id,@name,@desc,@extra)",
                ("@id", f.Id), ("@name", f.Name),
                ("@desc", f.Description ?? f.What), ("@extra", f.Extra?.ToJsonString()));
    }

    private void ImportLocations(List<Location> rows)
    {
        foreach (var l in rows)
        {
            _db.Execute(
                @"INSERT INTO Locations(id,name,faction_id,description,lat,lng,hours,tier,known,owner_npc,art,extra)
                  VALUES(@id,@name,@fac,@desc,@lat,@lng,@hours,@tier,@known,@owner,@art,@extra)",
                ("@id", l.Id), ("@name", l.Name), ("@fac", FactionOrNull(l.Faction)),
                ("@desc", l.Description), ("@lat", l.Lat), ("@lng", l.Lng),
                ("@hours", l.Hours), ("@tier", l.Tier), ("@known", l.Known ? 1 : 0),
                ("@owner", l.Owner), ("@art", l.Art), ("@extra", l.Extra?.ToJsonString()));
        }
        // second pass so connection targets already exist
        foreach (var l in rows)
        {
            if (l.Connections == null) continue;
            foreach (var conn in l.Connections)
            {
                var c = NormalizeConnection(conn);
                if (c == null) continue;
                if (!_knownLocations.Contains(c.To))
                { _warnings.Add($"location '{l.Id}' connects to unknown '{c.To}'; skipped"); continue; }
                _db.Execute(
                    @"INSERT OR REPLACE INTO LocationConnections(from_id,to_id,walk_min,train_min,cab_min)
                      VALUES(@f,@t,@w,@tr,@c)",
                    ("@f", l.Id), ("@t", c.To), ("@w", c.Walk), ("@tr", c.Train), ("@c", c.Cab));
            }
        }
    }

    private LocationConnection? NormalizeConnection(JsonNode node)
    {
        if (node is JsonValue v && v.TryGetValue(out string? s))
            return new LocationConnection { To = s ?? "" };
        return node.Deserialize<LocationConnection>(JsonOpts);
    }

    private void ImportEntities(List<Entity> rows)
    {
        foreach (var e in rows)
        {
            _db.Execute(
                @"INSERT INTO Entities(id,name,type,register,grade,threat_level,description,hp,atk,exorcise_dc,anchor,loot,extra)
                  VALUES(@id,@name,@type,@reg,@grade,@threat,@desc,@hp,@atk,@dc,@anchor,@loot,@extra)",
                ("@id", e.Id), ("@name", e.Name), ("@type", e.Type), ("@reg", e.Register),
                ("@grade", e.Grade), ("@threat", e.ThreatLevel), ("@desc", e.Description),
                ("@hp", e.Hp), ("@atk", e.Atk), ("@dc", e.ExorciseDc), ("@anchor", e.Anchor),
                ("@loot", e.Loot?.ToJsonString()), ("@extra", e.Extra?.ToJsonString()));

            foreach (var w in e.Weaknesses ?? Enumerable.Empty<string>())
                _db.Execute("INSERT OR IGNORE INTO EntityWeaknesses(entity_id,weakness) VALUES(@e,@w)",
                    ("@e", e.Id), ("@w", w));
            foreach (var a in e.Abilities ?? Enumerable.Empty<string>())
                _db.Execute("INSERT OR IGNORE INTO EntityAbilities(entity_id,ability) VALUES(@e,@a)",
                    ("@e", e.Id), ("@a", a));
        }
    }

    private void ImportNpcs(List<Npc> rows)
    {
        foreach (var n in rows)
        {
            _db.Execute(
                @"INSERT INTO Npcs(id,name,full_name,faction_id,role,location_id,trust,persona,dialogue_root,extra)
                  VALUES(@id,@name,@full,@fac,@role,@loc,@trust,@persona,@root,@extra)",
                ("@id", n.Id), ("@name", n.Name), ("@full", n.FullName),
                ("@fac", FactionOrNull(n.Faction)), ("@role", n.Role),
                ("@loc", n.Location), ("@trust", n.Trust),
                ("@persona", n.Persona?.ToJsonString()), ("@root", n.DialogueRoot),
                ("@extra", n.Extra?.ToJsonString()));

            foreach (var topic in n.Knowledge ?? Enumerable.Empty<string>())
                _db.Execute("INSERT OR IGNORE INTO NpcKnowledge(npc_id,topic) VALUES(@n,@t)",
                    ("@n", n.Id), ("@t", topic));

            foreach (var link in n.Links ?? Enumerable.Empty<NpcLink>())
                _db.Execute(
                    @"INSERT OR REPLACE INTO NpcRelationships(npc_id,rel_type,target_id,value)
                      VALUES(@n,@type,@to,@val)",
                    ("@n", n.Id), ("@type", link.Type), ("@to", link.To), ("@val", link.Value));
        }
    }

    private void ImportCases(List<Case> rows)
    {
        foreach (var c in rows)
        {
            string? entity = c.Entity;
            if (entity != null && !_knownEntities.Contains(entity))
            { _warnings.Add($"case '{c.Id}' references unknown entity '{entity}'; stored as NULL"); entity = null; }

            _db.Execute(
                "INSERT INTO Cases(id,title,description,difficulty,status,entity_id,extra) VALUES(@id,@t,@d,@diff,@s,@e,@x)",
                ("@id", c.Id), ("@t", c.Title), ("@d", c.Description),
                ("@diff", c.Difficulty), ("@s", c.Status), ("@e", entity),
                ("@x", c.Extra?.ToJsonString()));

            foreach (var loc in c.Locations ?? Enumerable.Empty<string>())
                if (_knownLocations.Contains(loc))
                    _db.Execute("INSERT OR IGNORE INTO CaseLocations(case_id,location_id) VALUES(@c,@l)",
                        ("@c", c.Id), ("@l", loc));
                else _warnings.Add($"case '{c.Id}' lists unknown location '{loc}'; skipped");

            foreach (var npc in c.Npcs ?? Enumerable.Empty<string>())
                if (_knownNpcs.Contains(npc))
                    _db.Execute("INSERT OR IGNORE INTO CaseNpcs(case_id,npc_id) VALUES(@c,@n)",
                        ("@c", c.Id), ("@n", npc));
                else _warnings.Add($"case '{c.Id}' lists unknown npc '{npc}'; skipped");

            int order = 0;
            foreach (var q in c.Quests ?? Enumerable.Empty<Quest>())
                _db.Execute(
                    "INSERT INTO Quests(id,case_id,title,description,objective,sort_order) VALUES(@id,@c,@t,@d,@o,@s)",
                    ("@id", q.Id), ("@c", c.Id), ("@t", q.Title),
                    ("@d", q.Description), ("@o", q.Objective), ("@s", order++));
        }
    }

    private void ImportClues(List<Clue> rows)
    {
        foreach (var cl in rows)
        {
            if (!_knownCases.Contains(cl.CaseId))
            { _warnings.Add($"clue '{cl.Id}' belongs to unknown case '{cl.CaseId}'; skipped"); continue; }
            string? loc = cl.Location != null && _knownLocations.Contains(cl.Location) ? cl.Location : null;
            _db.Execute(
                "INSERT INTO Clues(id,case_id,name,description,location_id,reveals,extra) VALUES(@id,@c,@n,@d,@l,@r,@x)",
                ("@id", cl.Id), ("@c", cl.CaseId), ("@n", cl.Name),
                ("@d", cl.Description), ("@l", loc), ("@r", cl.Reveals),
                ("@x", cl.Extra?.ToJsonString()));
        }
    }

    private void ImportDialogues(List<DialogueTree> trees)
    {
        // first pass: nodes; second pass: options (so next_node targets exist)
        foreach (var tree in trees)
            foreach (var node in tree.Nodes)
                _db.Execute(
                    "INSERT OR REPLACE INTO DialogueNodes(id,npc_id,text,conditions) VALUES(@id,@npc,@t,@c)",
                    ("@id", node.Id), ("@npc", tree.NpcId), ("@t", node.Text),
                    ("@c", node.Conditions != null ? JsonSerializer.Serialize(node.Conditions) : null));

        foreach (var tree in trees)
            foreach (var node in tree.Nodes)
            {
                int order = 0;
                foreach (var opt in node.Options ?? Enumerable.Empty<DialogueOption>())
                    _db.Execute(
                        @"INSERT INTO DialogueOptions(node_id,text,next_node,conditions,effects,sort_order)
                          VALUES(@n,@t,@next,@c,@e,@s)",
                        ("@n", node.Id), ("@t", opt.Text), ("@next", opt.Next),
                        ("@c", opt.Conditions != null ? JsonSerializer.Serialize(opt.Conditions) : null),
                        ("@e", opt.Effects != null ? JsonSerializer.Serialize(opt.Effects) : null),
                        ("@s", order++));
            }
    }

    private void ImportReference()
    {
        ImportReferenceArray("reference/thirteen.json", row =>
            _db.Execute(
                "INSERT OR REPLACE INTO Thirteen(seat,emotion,holder,location,status,demon) VALUES(@s,@e,@h,@l,@st,@d)",
                ("@s", Str(row, "seat")), ("@e", Str(row, "emotion")), ("@h", Str(row, "holder")),
                ("@l", Str(row, "location")), ("@st", Str(row, "status")), ("@d", Str(row, "demon"))));

        ImportReferenceArray("reference/ranks.json", row =>
            _db.Execute(
                "INSERT OR REPLACE INTO Ranks(rank,name,note,hidden_from_player) VALUES(@r,@n,@no,@h)",
                ("@r", Str(row, "rank")), ("@n", Str(row, "name")), ("@no", Str(row, "note")),
                ("@h", row?["hiddenFromPlayer"]?.GetValue<bool>() == true ? 1 : 0)));
    }

    private void ImportReferenceArray(string rel, Action<JsonNode> writeRow)
    {
        string res = $"{_contentRoot}/{rel}";
        if (!Godot.FileAccess.FileExists(res)) return;
        var node = ParseFile(res);
        if (node is not JsonArray arr) return;
        foreach (var row in arr) if (row != null) writeRow(row);
    }

    private static string? Str(JsonNode? n, string key) => n?[key]?.GetValue<string?>();
}
