using System.Collections.Generic;
using Godot;
using Microsoft.Data.Sqlite;

namespace VeilProtocol.Data;

/// <summary>
/// Autoload that imports /content into SQLite on startup, then serves read-only queries
/// to the rest of the game. Gameplay code asks ContentLibrary for cases/npcs/clues — it
/// never parses JSON and never branches on a hard-coded id. Add a new case by dropping a
/// JSON file in /content; this class needs no change.
/// </summary>
public partial class ContentLibrary : Node
{
    public static ContentLibrary Instance { get; private set; } = null!;
    public ContentImporter.Summary? LastImport { get; private set; }

    public override void _Ready()
    {
        Instance = this;
        Reimport();
    }

    /// <summary>Re-run the JSON → SQLite import. Safe to call at runtime (e.g. after the AI writes a new case).</summary>
    public ContentImporter.Summary Reimport()
    {
        var validator = new JsonValidator();
        var importer = new ContentImporter(Database.Instance, validator);
        var summary = importer.Run();
        LastImport = summary;

        GD.Print($"[ContentLibrary] imported {summary.Cases} cases, {summary.Npcs} npcs, " +
                 $"{summary.Entities} entities, {summary.Locations} locations, " +
                 $"{summary.Clues} clues, {summary.DialogueNodes} dialogue nodes " +
                 $"({summary.Warnings} warnings, {summary.Errors} errors)");
        foreach (var w in importer.Warnings) GD.Print("  warn: " + w);
        return summary;
    }

    // ───────── example read API (extend as gameplay needs grow) ─────────

    public List<Dictionary<string, object?>> AvailableCases() =>
        Query("SELECT id,title,difficulty,status FROM Cases WHERE status='available' ORDER BY difficulty");

    public Dictionary<string, object?>? GetCase(string id) =>
        QueryOne("SELECT * FROM Cases WHERE id=@id", ("@id", id));

    public List<Dictionary<string, object?>> CluesForCase(string caseId) =>
        Query("SELECT * FROM Clues WHERE case_id=@c", ("@c", caseId));

    public List<Dictionary<string, object?>> NpcsAt(string locationId) =>
        Query("SELECT id,name,trust FROM Npcs WHERE location_id=@l", ("@l", locationId));

    // ───────── tiny query helpers ─────────

    private List<Dictionary<string, object?>> Query(string sql, params (string, object?)[] args)
    {
        var rows = new List<Dictionary<string, object?>>();
        using var cmd = Database.Instance.Connection.CreateCommand();
        cmd.CommandText = sql;
        foreach (var (k, v) in args) cmd.Parameters.AddWithValue(k, v ?? System.DBNull.Value);
        using var r = cmd.ExecuteReader();
        while (r.Read())
        {
            var row = new Dictionary<string, object?>();
            for (int i = 0; i < r.FieldCount; i++)
                row[r.GetName(i)] = r.IsDBNull(i) ? null : r.GetValue(i);
            rows.Add(row);
        }
        return rows;
    }

    private Dictionary<string, object?>? QueryOne(string sql, params (string, object?)[] args)
    {
        var rows = Query(sql, args);
        return rows.Count > 0 ? rows[0] : null;
    }
}
