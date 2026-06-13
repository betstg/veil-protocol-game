using Godot;
using VeilProtocol.Data;

namespace VeilProtocol.Core;

/// <summary>
/// Minimal entry scene for the data-layer milestone. It does not render gameplay yet —
/// it confirms the pipeline is alive: the database opens, /content imports, and the
/// example case is queryable. Replace with the real game shell when scenes are built.
/// </summary>
public partial class Bootstrap : Node
{
    public override void _Ready()
    {
        var lib = ContentLibrary.Instance;
        GD.Print("──────── Veil Protocol — data layer ready ────────");

        foreach (var c in lib.AvailableCases())
            GD.Print($"  case: {c["id"]}  \"{c["title"]}\"  (difficulty {c["difficulty"]})");

        var silent = lib.GetCase("silent_tenant");
        if (silent != null)
        {
            GD.Print($"\n  Loaded example: {silent["title"]}");
            foreach (var clue in lib.CluesForCase("silent_tenant"))
                GD.Print($"    clue: {clue["name"]}");
            foreach (var npc in lib.NpcsAt("hallway"))
                GD.Print($"    npc at hallway: {npc["name"]} (trust {npc["trust"]})");
        }
        GD.Print("──────────────────────────────────────────────────");
    }
}
