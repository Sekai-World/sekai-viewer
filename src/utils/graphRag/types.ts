/**
 * Graph RAG type definitions
 */

export type NodeType = "character" | "group" | "term" | "event" | "fact";

// Simplified to 5 edge types only
export const EDGE_TYPES = [
  "CHARACTER_RELATION", // Character to character (undirected)
  "INVOLVE", // Event to character/term/group
  "MEMBER_OF", // Character to group
  "FACT", // Any entity to fact
  "RELATED", // Term to character/group/term
] as const;

export type EdgeType = (typeof EDGE_TYPES)[number];

export const GENDERS = ["male", "female", "secret", "unknown"] as const;

export type GenderType = (typeof GENDERS)[number];

export const NODE_TYPES = [
  "character",
  "event",
  "term",
  "group",
  "fact",
] as const;

export type NodeTypeValue = (typeof NODE_TYPES)[number];

/**
 * Episode tag format: storyType-storyId-episodeId
 * Examples: "unitStory-light_sound-1-1", "eventStory-74-5"
 */
export type EpisodeTag = string;

/**
 * Base node structure
 */
export interface BaseNode {
  id: string;
  type: NodeType;
}

/**
 * Character node (seeded from game data)
 */
export interface CharacterNode extends BaseNode {
  type: "character";
  name: string; // English pivot
  identifier: string; // Unique identifier (e.g., 'ichika', 'miku')
  originalName: string; // Original name in source language
  gender: string;
  group?: string; // Group/unit name this character belongs to
  translatedNames: Record<string, Record<string, string>>; // [targetLanguage][originalTextVariant] -> translated name
  originalTextVariants: string[]; // Different name variants like "一歌", "星乃一歌", "いちか"
}

/**
 * Group node (unit/band)
 */
export interface GroupNode extends BaseNode {
  type: "group";
  name: string; // English pivot
  identifier: string; // Unique identifier (e.g., 'leo_need', 'more_more_jump')
  originalName: string; // Original name in source language
  translatedNames: Record<string, Record<string, string>>; // [targetLanguage][originalTextVariant] -> translated name
  originalTextVariants: string[]; // Different name variants in original language
}

/**
 * Term node (game terminology, concepts)
 */
export interface TermNode extends BaseNode {
  type: "term";
  name: string; // English pivot short label
  identifier: string; // Unique identifier (e.g., 'light_sound_term')
  originalName: string; // Original name in source language (e.g., Japanese)
  description: string; // English pivot
  translatedNames: Record<string, Record<string, string>>; // [targetLanguage][originalTextVariant] -> translated name
  originalTextVariants: string[]; // Different term variants in original language
  embedding: Float32Array;
  episodeTags: EpisodeTag[];
}

/**
 * Event node (story events)
 */
export interface EventNode extends BaseNode {
  type: "event";
  name: string; // Short event name/title
  identifier?: string; // Unique identifier (e.g., 'light_sound_event_1')
  description: string; // English pivot
  embedding: Float32Array;
  episodeTags: EpisodeTag[];
}

/**
 * Fact node (objective facts, statements, observations)
 */
export interface FactNode extends BaseNode {
  type: "fact";
  statement: string; // The fact statement in English
  identifier?: string; // Unique identifier (e.g., 'ichika_favorite_color')
  description: string; // Additional context or details
  embedding: Float32Array;
  episodeTags: EpisodeTag[];
}

export type GraphNode =
  | CharacterNode
  | GroupNode
  | TermNode
  | EventNode
  | FactNode;

/**
 * Edge with episode tags
 */
export interface GraphEdge {
  id?: number; // auto-increment from IndexedDB
  identifier: string; // Unique identifier for this edge (e.g., "ichika_miku_childhood_friends")
  sourceId: string;
  targetId: string;
  type: EdgeType;
  episodeTags: EpisodeTag[];
  context: string; // Context describes the relationship (replaces relationshipType)
  embedding?: Float32Array; // Cached embedding of edge context
}

/**
 * Parsed episode tag components
 */
export interface ParsedEpisodeTag {
  storyType: "unitStory" | "eventStory";
  storyId: string;
  episodeId: string;
  // For ordering
  unitId?: string;
  chapterNo?: number;
  episodeNo?: number;
  eventId?: number;
}

/**
 * LLM extraction output schema with nested relations
 */
export interface ExtractionOutput {
  /**
   * New entities identified before their detailed enrichment. These objects
   * intentionally contain identifiers only (plus the entity type).
   */
  newEntities: Array<{
    type: "character" | "event" | "term" | "group";
    identifier: string;
  }>;
  characters: Array<{
    identifier: string;
    name: string; // English pivot
    translatedName: Record<string, string>; // Original text variant -> translated name
    gender: "male" | "female" | "secret" | "unknown";
    originalTextVariants: string[]; // Name variants in original text
    group?: string; // Group/unit name this character belongs to
    relations: Array<{
      identifier: string; // Unique identifier (e.g., "ichika_miku_childhood_friends")
      target: { type: "character"; identifier: string };
      episodeId: number;
      context: string; // Describes the relationship (e.g., "childhood friends", "bandmates")
    }>;
    facts: Array<{
      identifier: string;
      statement: string;
      description: string;
      episodeId: number;
    }>;
  }>;
  events: Array<{
    identifier: string;
    name: string; // Short event name/title
    description: string; // English pivot
    episodeId: number; // simple episode number (1, 2, 3, 4, etc.)
    involve: Array<{
      identifier: string; // Unique identifier (e.g., "performance_involves_ichika")
      target: { type: "character" | "term" | "group"; identifier: string };
      episodeId: number;
      context: string; // Describes involvement (e.g., "performs in", "takes place at")
    }>;
    facts: Array<{
      identifier: string;
      statement: string;
      description: string;
      episodeId: number;
    }>;
  }>;
  terms: Array<{
    identifier: string;
    name: string; // English pivot short label
    originalName: string; // Original name in source language
    originalTextVariants: string[]; // Different term variants in original language
    description: string; // English pivot
    translatedName: Record<string, string>; // Original text variant -> translated name
    episodeId: number; // simple episode number (1, 2, 3, 4, etc.)
    related: Array<{
      identifier: string; // Unique identifier (e.g., "sekai_related_miku")
      target: { type: "character" | "group" | "term"; identifier: string };
      episodeId: number;
      context: string; // Describes the relationship (e.g., "SEKAI is created by characters' feelings", "Miku inhabits the SEKAI")
    }>;
    facts: Array<{
      identifier: string;
      statement: string;
      description: string;
      episodeId: number;
    }>;
  }>;
  groups: Array<{
    identifier: string;
    name: string;
    originalTextVariants: string[]; // Different group name variants in original language
    translatedName: Record<string, string>; // Original text variant -> translated name
    members: Array<{
      identifier: string; // Unique identifier (e.g., "leoneed_member_ichika")
      target: { type: "character"; identifier: string };
      episodeId: number;
      context: string; // Describes role (e.g., "guitarist", "leader", "vocalist")
    }>;
    facts: Array<{
      identifier: string;
      statement: string;
      description: string;
      episodeId: number;
    }>;
  }>;
}

/**
 * Context for injection into translation prompt
 */
export interface RetrievedContext {
  characters: CharacterNode[];
  groups: GroupNode[];
  events: EventNode[];
  terms: TermNode[];
  facts: FactNode[];
  edges: GraphEdge[]; // All edges between context nodes
}

/**
 * Indexing progress state
 */
export interface IndexingProgress {
  total: number;
  current: number;
  currentEpisode: string;
  status: "idle" | "running" | "paused" | "completed" | "error";
  error?: string;
  // Number of stories in this run that were actually marked as processed
  // (i.e. yielded at least one graph node). `current` alone isn't enough
  // to show this, since it advances even for stories that produced nothing.
  processedCount: number;
}
