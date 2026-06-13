using System;
using System.IO;
using Godot;
using Microsoft.Data.Sqlite;

namespace VeilProtocol.Data;

/// <summary>
/// Autoload singleton that owns the single SQLite connection for the whole game.
/// Creates the database from db/schema.sql on first run. The connection is opened
/// once and shared; SQLite is single-file and server-less, so this is all we need.
/// </summary>
public partial class Database : Node
{
    public static Database Instance { get; private set; } = null!;

    // user:// resolves to the OS per-user app-data dir (writable, persists across runs).
    private const string DbResPath = "user://veil.db";
    private const string SchemaResPath = "res://db/schema.sql";

    private SqliteConnection _connection = null!;

    public SqliteConnection Connection => _connection;

    public override void _EnterTree()
    {
        Instance = this;
        string dbPath = ProjectSettings.GlobalizePath(DbResPath);
        Directory.CreateDirectory(Path.GetDirectoryName(dbPath)!);

        _connection = new SqliteConnection($"Data Source={dbPath}");
        _connection.Open();
        ApplySchema();
        GD.Print($"[Database] ready at {dbPath}");
    }

    private void ApplySchema()
    {
        using var f = Godot.FileAccess.Open(SchemaResPath, Godot.FileAccess.ModeFlags.Read);
        if (f == null)
            throw new FileNotFoundException($"schema not found: {SchemaResPath}");
        string sql = f.GetAsText();
        using var cmd = _connection.CreateCommand();
        cmd.CommandText = sql;
        cmd.ExecuteNonQuery();
    }

    /// <summary>Run an arbitrary SQL statement with optional named parameters.</summary>
    public int Execute(string sql, params (string, object?)[] args)
    {
        using var cmd = _connection.CreateCommand();
        cmd.CommandText = sql;
        foreach (var (k, v) in args)
            cmd.Parameters.AddWithValue(k, v ?? DBNull.Value);
        return cmd.ExecuteNonQuery();
    }

    public long ScalarLong(string sql, params (string, object?)[] args)
    {
        using var cmd = _connection.CreateCommand();
        cmd.CommandText = sql;
        foreach (var (k, v) in args)
            cmd.Parameters.AddWithValue(k, v ?? DBNull.Value);
        var r = cmd.ExecuteScalar();
        return r is null or DBNull ? 0 : Convert.ToInt64(r);
    }

    public SqliteTransaction Begin() => _connection.BeginTransaction();

    public override void _ExitTree()
    {
        _connection?.Dispose();
    }
}
