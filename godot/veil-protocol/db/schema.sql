-- Veil Protocol — SQLite schema
-- The content pipeline is: JSON (/content) -> validate -> import -> these tables -> game reads.
-- Static "design" tables (Cases, Npcs, ...) are wiped and rebuilt on every import.
-- "Player*" tables hold per-save runtime state and are NEVER touched by the importer.
--
-- Conventions:
--   * All design ids are TEXT slugs (lowercase-with-dashes / snake_case), matching the JSON `id`.
--   * Many-to-many relations live in join tables, never as delimited strings.
--   * Arbitrary AI-authored extras can ride along in a JSON `extra` column without a migration.

PRAGMA foreign_keys = ON;

-- ───────────────────────── reference / lookups ─────────────────────────

CREATE TABLE IF NOT EXISTS Factions (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    extra       TEXT            -- JSON blob, optional
);

CREATE TABLE IF NOT EXISTS Ranks (
    rank              TEXT PRIMARY KEY,   -- "E", "A", "SSS", "X"
    name              TEXT NOT NULL,
    note              TEXT,
    hidden_from_player INTEGER NOT NULL DEFAULT 0
);

-- The thirteen emotion-seats: lore reference, read-only design data.
CREATE TABLE IF NOT EXISTS Thirteen (
    seat     TEXT PRIMARY KEY,           -- "I".."XIII"
    emotion  TEXT NOT NULL,
    holder   TEXT,
    location TEXT,
    status   TEXT,
    demon    TEXT
);

-- ───────────────────────── core design content ─────────────────────────

CREATE TABLE IF NOT EXISTS Locations (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    faction_id  TEXT REFERENCES Factions(id),
    description TEXT,
    lat         REAL,
    lng         REAL,
    hours       TEXT,
    tier        INTEGER,
    known       INTEGER NOT NULL DEFAULT 0,   -- known to the player at game start
    owner_npc   TEXT,                          -- soft ref to Npcs.id (set after npc import)
    art         TEXT,
    extra       TEXT
);

-- Walkable adjacency / travel costs between locations.
CREATE TABLE IF NOT EXISTS LocationConnections (
    from_id  TEXT NOT NULL REFERENCES Locations(id) ON DELETE CASCADE,
    to_id    TEXT NOT NULL REFERENCES Locations(id) ON DELETE CASCADE,
    walk_min INTEGER,
    train_min INTEGER,
    cab_min  INTEGER,
    PRIMARY KEY (from_id, to_id)
);

CREATE TABLE IF NOT EXISTS Entities (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    type         TEXT,                  -- "Residual Spirit", "spirit", ...
    register     TEXT,                  -- which of the Thirteen emotions it draws on
    grade        TEXT,                  -- maps to Ranks.rank
    threat_level INTEGER,
    description  TEXT,
    hp           INTEGER,
    atk          INTEGER,
    exorcise_dc  INTEGER,
    anchor       TEXT,
    loot         TEXT,                  -- JSON blob
    extra        TEXT
);

CREATE TABLE IF NOT EXISTS EntityWeaknesses (
    entity_id TEXT NOT NULL REFERENCES Entities(id) ON DELETE CASCADE,
    weakness  TEXT NOT NULL,
    PRIMARY KEY (entity_id, weakness)
);

CREATE TABLE IF NOT EXISTS EntityAbilities (
    entity_id TEXT NOT NULL REFERENCES Entities(id) ON DELETE CASCADE,
    ability   TEXT NOT NULL,
    PRIMARY KEY (entity_id, ability)
);

CREATE TABLE IF NOT EXISTS Npcs (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    full_name     TEXT,
    faction_id    TEXT REFERENCES Factions(id),
    role          TEXT,
    location_id   TEXT,                 -- soft ref to Locations.id
    trust         INTEGER NOT NULL DEFAULT 0,
    persona       TEXT,                 -- JSON blob handed to the LLM (voice/traits/wants/guard)
    dialogue_root TEXT,                 -- entry DialogueNodes.id
    extra         TEXT
);

-- Facts an NPC can surface; gates dialogue and clue discovery.
CREATE TABLE IF NOT EXISTS NpcKnowledge (
    npc_id TEXT NOT NULL REFERENCES Npcs(id) ON DELETE CASCADE,
    topic  TEXT NOT NULL,
    PRIMARY KEY (npc_id, topic)
);

-- Directed NPC->NPC / NPC->entity relationships (knows/romance/member_of/...).
CREATE TABLE IF NOT EXISTS NpcRelationships (
    npc_id    TEXT NOT NULL REFERENCES Npcs(id) ON DELETE CASCADE,
    rel_type  TEXT NOT NULL,            -- knows | romance | member_of | works_at | gatekeeps | rides ...
    target_id TEXT NOT NULL,
    value     INTEGER,                  -- e.g. -100..+100 for `knows`
    PRIMARY KEY (npc_id, rel_type, target_id)
);

CREATE TABLE IF NOT EXISTS Cases (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    difficulty  INTEGER NOT NULL DEFAULT 1,
    status      TEXT NOT NULL DEFAULT 'available',  -- available | active | solved | failed
    entity_id   TEXT REFERENCES Entities(id),
    extra       TEXT
);

CREATE TABLE IF NOT EXISTS CaseLocations (
    case_id     TEXT NOT NULL REFERENCES Cases(id) ON DELETE CASCADE,
    location_id TEXT NOT NULL REFERENCES Locations(id),
    PRIMARY KEY (case_id, location_id)
);

CREATE TABLE IF NOT EXISTS CaseNpcs (
    case_id TEXT NOT NULL REFERENCES Cases(id) ON DELETE CASCADE,
    npc_id  TEXT NOT NULL REFERENCES Npcs(id),
    PRIMARY KEY (case_id, npc_id)
);

CREATE TABLE IF NOT EXISTS Clues (
    id          TEXT PRIMARY KEY,
    case_id     TEXT NOT NULL REFERENCES Cases(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    location_id TEXT REFERENCES Locations(id),     -- where it can be found, optional
    reveals     TEXT,                              -- topic this clue unlocks, optional
    extra       TEXT
);

CREATE TABLE IF NOT EXISTS Quests (
    id          TEXT PRIMARY KEY,
    case_id     TEXT REFERENCES Cases(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    objective   TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    extra       TEXT
);

-- Dialogue is stored as a flat node graph; edges live in DialogueOptions.
CREATE TABLE IF NOT EXISTS DialogueNodes (
    id         TEXT PRIMARY KEY,
    npc_id     TEXT REFERENCES Npcs(id) ON DELETE CASCADE,
    text       TEXT NOT NULL,
    conditions TEXT,                    -- JSON array of gate expressions, optional
    extra      TEXT
);

CREATE TABLE IF NOT EXISTS DialogueOptions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id    TEXT NOT NULL REFERENCES DialogueNodes(id) ON DELETE CASCADE,
    text       TEXT NOT NULL,
    next_node  TEXT,                    -- REFERENCES DialogueNodes(id), null = end
    conditions TEXT,                    -- JSON, optional
    effects    TEXT,                    -- JSON (e.g. trust+5, unlock topic), optional
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- ───────────────────────── runtime / per-save state ─────────────────────
-- These are owned by the game, not the importer. The importer must never DELETE here.

CREATE TABLE IF NOT EXISTS PlayerProgress (
    key   TEXT PRIMARY KEY,            -- e.g. "case:silent_tenant:status", flags, counters
    value TEXT
);

CREATE TABLE IF NOT EXISTS PlayerEntities (
    entity_id   TEXT NOT NULL,         -- captured/contracted entity (design id)
    captured_at TEXT NOT NULL DEFAULT (datetime('now')),
    bound       INTEGER NOT NULL DEFAULT 0,
    notes       TEXT,
    PRIMARY KEY (entity_id, captured_at)
);

CREATE TABLE IF NOT EXISTS PlayerClues (
    clue_id      TEXT PRIMARY KEY,     -- discovered clues
    discovered_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Bookkeeping: which content version is loaded.
CREATE TABLE IF NOT EXISTS ImportMeta (
    key   TEXT PRIMARY KEY,
    value TEXT
);

-- ───────────────────────── helpful indexes ─────────────────────────

CREATE INDEX IF NOT EXISTS idx_clues_case      ON Clues(case_id);
CREATE INDEX IF NOT EXISTS idx_quests_case     ON Quests(case_id);
CREATE INDEX IF NOT EXISTS idx_dlgnodes_npc    ON DialogueNodes(npc_id);
CREATE INDEX IF NOT EXISTS idx_dlgopts_node    ON DialogueOptions(node_id);
CREATE INDEX IF NOT EXISTS idx_npcs_location   ON Npcs(location_id);
CREATE INDEX IF NOT EXISTS idx_npckn_topic     ON NpcKnowledge(topic);
