using System.Collections.Generic;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace VeilProtocol.Data.Models;

// Plain DTOs that mirror the /content JSON. Deserialized with System.Text.Json.
// Snake_case JSON keys are mapped explicitly so the C# stays idiomatic PascalCase.
// `Extra` and `Loot`/`Persona` are kept as JsonNode so AI-authored fields survive
// without a model change (they ride into the DB as a JSON blob).

public sealed class Faction
{
    [JsonPropertyName("id")]          public string Id { get; set; } = "";
    [JsonPropertyName("name")]        public string Name { get; set; } = "";
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("what")]        public string? What { get; set; }   // legacy alias
    [JsonPropertyName("extra")]       public JsonNode? Extra { get; set; }
}

public sealed class LocationConnection
{
    [JsonPropertyName("to")]    public string To { get; set; } = "";
    [JsonPropertyName("walk")]  public int? Walk { get; set; }
    [JsonPropertyName("train")] public int? Train { get; set; }
    [JsonPropertyName("cab")]   public int? Cab { get; set; }
}

public sealed class Location
{
    [JsonPropertyName("id")]          public string Id { get; set; } = "";
    [JsonPropertyName("name")]        public string Name { get; set; } = "";
    [JsonPropertyName("faction")]     public string? Faction { get; set; }
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("lat")]         public double? Lat { get; set; }
    [JsonPropertyName("lng")]         public double? Lng { get; set; }
    [JsonPropertyName("hours")]       public string? Hours { get; set; }
    [JsonPropertyName("tier")]        public int? Tier { get; set; }
    [JsonPropertyName("known")]       public bool Known { get; set; }
    [JsonPropertyName("owner")]       public string? Owner { get; set; }
    [JsonPropertyName("art")]         public string? Art { get; set; }
    [JsonPropertyName("extra")]       public JsonNode? Extra { get; set; }

    // connections may be bare strings or objects; parsed in the importer.
    [JsonPropertyName("connections")] public List<JsonNode>? Connections { get; set; }
}

public sealed class NpcLink
{
    [JsonPropertyName("type")]  public string Type { get; set; } = "";
    [JsonPropertyName("to")]    public string To { get; set; } = "";
    [JsonPropertyName("value")] public int? Value { get; set; }
}

public sealed class Npc
{
    [JsonPropertyName("id")]            public string Id { get; set; } = "";
    [JsonPropertyName("name")]          public string Name { get; set; } = "";
    [JsonPropertyName("full_name")]     public string? FullName { get; set; }
    [JsonPropertyName("faction")]       public string? Faction { get; set; }
    [JsonPropertyName("role")]          public string? Role { get; set; }
    [JsonPropertyName("location")]      public string? Location { get; set; }
    [JsonPropertyName("trust")]         public int Trust { get; set; }
    [JsonPropertyName("knowledge")]     public List<string>? Knowledge { get; set; }
    [JsonPropertyName("dialogue_root")] public string? DialogueRoot { get; set; }
    [JsonPropertyName("persona")]       public JsonNode? Persona { get; set; }
    [JsonPropertyName("links")]         public List<NpcLink>? Links { get; set; }
    [JsonPropertyName("extra")]         public JsonNode? Extra { get; set; }
}

public sealed class Entity
{
    [JsonPropertyName("id")]           public string Id { get; set; } = "";
    [JsonPropertyName("name")]         public string Name { get; set; } = "";
    [JsonPropertyName("type")]         public string? Type { get; set; }
    [JsonPropertyName("register")]     public string? Register { get; set; }
    [JsonPropertyName("grade")]        public string? Grade { get; set; }
    [JsonPropertyName("threat_level")] public int? ThreatLevel { get; set; }
    [JsonPropertyName("description")]  public string? Description { get; set; }
    [JsonPropertyName("hp")]           public int? Hp { get; set; }
    [JsonPropertyName("atk")]          public int? Atk { get; set; }
    [JsonPropertyName("exorcise_dc")]  public int? ExorciseDc { get; set; }
    [JsonPropertyName("anchor")]       public string? Anchor { get; set; }
    [JsonPropertyName("weaknesses")]   public List<string>? Weaknesses { get; set; }
    [JsonPropertyName("abilities")]    public List<string>? Abilities { get; set; }
    [JsonPropertyName("loot")]         public JsonNode? Loot { get; set; }
    [JsonPropertyName("extra")]        public JsonNode? Extra { get; set; }
}

public sealed class Quest
{
    [JsonPropertyName("id")]          public string Id { get; set; } = "";
    [JsonPropertyName("title")]       public string Title { get; set; } = "";
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("objective")]   public string? Objective { get; set; }
}

public sealed class Case
{
    [JsonPropertyName("id")]          public string Id { get; set; } = "";
    [JsonPropertyName("title")]       public string Title { get; set; } = "";
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("difficulty")]  public int Difficulty { get; set; } = 1;
    [JsonPropertyName("status")]      public string Status { get; set; } = "available";
    [JsonPropertyName("entity")]      public string? Entity { get; set; }
    [JsonPropertyName("locations")]   public List<string>? Locations { get; set; }
    [JsonPropertyName("npcs")]        public List<string>? Npcs { get; set; }
    [JsonPropertyName("clues")]       public List<string>? Clues { get; set; }
    [JsonPropertyName("quests")]      public List<Quest>? Quests { get; set; }
    [JsonPropertyName("extra")]       public JsonNode? Extra { get; set; }
}

public sealed class Clue
{
    [JsonPropertyName("id")]          public string Id { get; set; } = "";
    [JsonPropertyName("case_id")]     public string CaseId { get; set; } = "";
    [JsonPropertyName("name")]        public string Name { get; set; } = "";
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("location")]    public string? Location { get; set; }
    [JsonPropertyName("reveals")]     public string? Reveals { get; set; }
    [JsonPropertyName("extra")]       public JsonNode? Extra { get; set; }
}

public sealed class DialogueOption
{
    [JsonPropertyName("text")]       public string Text { get; set; } = "";
    [JsonPropertyName("next")]       public string? Next { get; set; }
    [JsonPropertyName("conditions")] public List<string>? Conditions { get; set; }
    [JsonPropertyName("effects")]    public List<string>? Effects { get; set; }
}

public sealed class DialogueNode
{
    [JsonPropertyName("id")]         public string Id { get; set; } = "";
    [JsonPropertyName("text")]       public string Text { get; set; } = "";
    [JsonPropertyName("conditions")] public List<string>? Conditions { get; set; }
    [JsonPropertyName("options")]    public List<DialogueOption>? Options { get; set; }
}

public sealed class DialogueTree
{
    [JsonPropertyName("id")]    public string Id { get; set; } = "";
    [JsonPropertyName("npc_id")]public string? NpcId { get; set; }
    [JsonPropertyName("nodes")] public List<DialogueNode> Nodes { get; set; } = new();
}
