using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Godot;
using Json.Schema;

namespace VeilProtocol.Data;

/// <summary>
/// Validates a content JSON document against its JSON Schema (content/schema/*.schema.json)
/// BEFORE anything touches the database. This is the gate that keeps AI-authored content
/// honest: malformed cases never reach the importer, so the game never has to defend
/// against half-formed rows at runtime.
/// </summary>
public sealed class JsonValidator
{
    private readonly Dictionary<string, JsonSchema> _schemas = new();

    public IReadOnlyDictionary<string, JsonSchema> Schemas => _schemas;

    /// <summary>Load every *.schema.json under content/schema, keyed by kind ("case", "npc", ...).</summary>
    public JsonValidator(string schemaDirResPath = "res://content/schema")
    {
        using var dir = DirAccess.Open(schemaDirResPath);
        if (dir == null)
            throw new InvalidOperationException($"schema dir missing: {schemaDirResPath}");
        foreach (var file in dir.GetFiles())
        {
            if (!file.EndsWith(".schema.json")) continue;
            string kind = file.Replace(".schema.json", "");
            using var f = Godot.FileAccess.Open($"{schemaDirResPath}/{file}", Godot.FileAccess.ModeFlags.Read);
            _schemas[kind] = JsonSchema.FromText(f.GetAsText());
        }
    }

    public sealed record Result(bool Ok, IReadOnlyList<string> Errors)
    {
        public static readonly Result Success = new(true, Array.Empty<string>());
    }

    /// <summary>Validate one parsed document of the given kind.</summary>
    public Result Validate(string kind, JsonNode? doc, string source)
    {
        if (!_schemas.TryGetValue(kind, out var schema))
            return new Result(false, new[] { $"{source}: no schema for kind '{kind}'" });

        var eval = schema.Evaluate(doc, new EvaluationOptions
        {
            OutputFormat = OutputFormat.List
        });

        if (eval.IsValid) return Result.Success;

        var errors = new List<string>();
        Collect(eval, source, errors);
        if (errors.Count == 0)
            errors.Add($"{source}: failed validation against '{kind}' schema");
        return new Result(false, errors);
    }

    private static void Collect(EvaluationResults node, string source, List<string> sink)
    {
        if (node.HasErrors && node.Errors != null)
            foreach (var e in node.Errors)
                sink.Add($"{source} @ {node.InstanceLocation}: {e.Value}");
        if (node.Details != null)
            foreach (var child in node.Details)
                Collect(child, source, sink);
    }
}
