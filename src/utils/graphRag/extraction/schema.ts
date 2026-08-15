import { GENDERS } from "../types";

/**
 * Generate extraction schema from types
 */
export function generateExtractionSchema() {
  // Schema for character relations (undirected, character-to-character)
  const relationsSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description:
            "REQUIRED unique identifier (e.g., 'ichika_miku_childhood_friends'). Use lowercase, underscores.",
        },
        target: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["character"] },
            identifier: { type: "string" },
          },
          required: ["type", "identifier"],
        },
        episodeId: { type: "number" },
        context: {
          type: "string",
          description:
            "Describes the relationship (e.g., 'childhood friends', 'bandmates in Leo/need')",
        },
      },
      required: ["identifier", "target", "episodeId", "context"],
    },
    default: [],
  };

  // Schema for event involve (event to character/term/group)
  const involveSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description:
            "REQUIRED unique identifier (e.g., 'performance_involves_ichika'). Use lowercase, underscores.",
        },
        target: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["character", "term", "group"] },
            identifier: { type: "string" },
          },
          required: ["type", "identifier"],
        },
        episodeId: { type: "number" },
        context: {
          type: "string",
          description:
            "Describes involvement (e.g., 'performs in', 'takes place at SEKAI')",
        },
      },
      required: ["identifier", "target", "episodeId", "context"],
    },
    default: [],
  };

  // Schema for group members (group to character)
  const membersSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description:
            "REQUIRED unique identifier (e.g., 'leoneed_member_ichika'). Use lowercase, underscores.",
        },
        target: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["character"] },
            identifier: { type: "string" },
          },
          required: ["type", "identifier"],
        },
        episodeId: { type: "number" },
        context: {
          type: "string",
          description:
            "Describes role (e.g., 'guitarist and vocalist', 'leader')",
        },
      },
      required: ["identifier", "target", "episodeId", "context"],
    },
    default: [],
  };

  // Reusable facts schema for all entity types
  const factsSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description:
            "Unique identifier for this fact (e.g., 'ichika_favorite_song', 'miku_ability'). Use lowercase, underscores.",
        },
        statement: {
          type: "string",
          description:
            "The fact statement in English (e.g., 'Ichika plays guitar', 'Miku can enter the SEKAI')",
        },
        description: {
          type: "string",
          description: "Additional context or details about this fact",
        },
        episodeId: {
          type: "number",
          description: "Episode number where this fact was observed",
        },
      },
      required: ["identifier", "statement", "description", "episodeId"],
    },
    default: [],
  };

  // Schema for term relations (term to character/group/term)
  const relatedSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description:
            "REQUIRED unique identifier (e.g., 'sekai_related_miku'). Use lowercase, underscores.",
        },
        target: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["character", "group", "term"] },
            identifier: { type: "string" },
          },
          required: ["type", "identifier"],
        },
        episodeId: { type: "number" },
        context: {
          type: "string",
          description:
            "Describes the relationship (e.g., 'SEKAI is created by characters feelings', 'Miku inhabits the SEKAI')",
        },
      },
      required: ["identifier", "target", "episodeId", "context"],
    },
    default: [],
  };

  // The first extraction pass is deliberately minimal. It gives the model a
  // chance to establish the entity set before it enriches those entities with
  // names, facts, and relationships below.
  const newEntitiesSchema = {
    type: "array",
    description:
      "FIRST: identifiers for entities that are new to the existing context. Each item must contain only type and identifier.",
    items: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["character", "event", "term", "group"],
        },
        identifier: {
          type: "string",
          description:
            "Unique identifier for the new entity. Use lowercase letters, numbers, and underscores only.",
        },
      },
      required: ["type", "identifier"],
      additionalProperties: false,
    },
    default: [],
  };

  return {
    type: "object",
    properties: {
      newEntities: newEntitiesSchema,
      characters: {
        type: "array",
        items: {
          type: "object",
          properties: {
            identifier: {
              type: "string",
              description:
                "Unique identifier for this character (e.g., 'ichika', 'miku', 'kanade'). Use lowercase, no spaces.",
            },
            name: { type: "string", description: "Full English name" },
            translatedName: {
              type: "object",
              additionalProperties: { type: "string" },
              description:
                "Map each originalTextVariants value to its translation. Every key must be an exact original text variant.",
            },
            gender: {
              type: "string",
              enum: GENDERS,
            },
            originalTextVariants: {
              type: "array",
              items: { type: "string" },
              description:
                "Name variants in original text (e.g., '一歌', '星乃一歌', 'いちか'). Must uniquely identify this character - no generic terms like 'お母さん', '先輩'.",
            },
            group: {
              type: "string",
              description:
                "Group/unit name this character belongs to (e.g., 'Leo/need', 'MORE MORE JUMP!', 'Vivid BAD SQUAD'). Don't include if you are not sure.",
            },
            relations: relationsSchema,
            facts: factsSchema,
          },
          required: [
            "identifier",
            "name",
            "translatedName",
            "gender",
            "originalTextVariants",
            "relations",
            "facts",
          ],
        },
        default: [],
      },
      events: {
        type: "array",
        items: {
          type: "object",
          properties: {
            identifier: {
              type: "string",
              description:
                "Unique identifier for this event (e.g., 'first_performance', 'confession'). Use lowercase, underscores.",
            },
            name: { type: "string", description: "Short event title" },
            description: { type: "string" },
            episodeId: {
              type: "number",
              description: "Episode number where this event was observed",
            },
            involve: involveSchema,
            facts: factsSchema,
          },
          required: [
            "identifier",
            "name",
            "description",
            "episodeId",
            "involve",
            "facts",
          ],
        },
        default: [],
      },
      terms: {
        type: "array",
        items: {
          type: "object",
          properties: {
            identifier: {
              type: "string",
              description:
                "Unique identifier for this term (e.g., 'sekai', 'untitled'). Use lowercase, underscores.",
            },
            name: { type: "string", description: "English name" },
            originalName: {
              type: "string",
              description: "Original name in source language (e.g., Japanese)",
            },
            originalTextVariants: {
              type: "array",
              items: { type: "string" },
              description:
                "Different variants of the term in original language. Must uniquely identify this term - no generic words like '場所', '世界'.",
            },
            description: { type: "string" },
            translatedName: {
              type: "object",
              additionalProperties: { type: "string" },
              description:
                "Map each originalTextVariants value to its translation. Every key must be an exact original text variant.",
            },
            episodeId: {
              type: "number",
              description: "Episode number where this term was observed",
            },
            related: relatedSchema,
            facts: factsSchema,
          },
          required: [
            "identifier",
            "name",
            "originalName",
            "originalTextVariants",
            "description",
            "translatedName",
            "episodeId",
            "related",
            "facts",
          ],
        },
        default: [],
      },
      groups: {
        type: "array",
        items: {
          type: "object",
          properties: {
            identifier: {
              type: "string",
              description:
                "Unique identifier for this group (e.g., 'leoneed', 'vivid_badsquad'). Use lowercase, underscores.",
            },
            name: { type: "string", description: "Group/unit name" },
            originalTextVariants: {
              type: "array",
              items: { type: "string" },
              description:
                "Different variants of the group name in original language. Must uniquely identify this group - no generic terms like 'バンド', 'グループ'.",
            },
            translatedName: {
              type: "object",
              additionalProperties: { type: "string" },
              description:
                "Map each originalTextVariants value to its translation. Every key must be an exact original text variant.",
            },
            members: membersSchema,
            facts: factsSchema,
          },
          required: [
            "identifier",
            "name",
            "originalTextVariants",
            "translatedName",
            "members",
            "facts",
          ],
        },
        default: [],
      },
    },
    required: ["newEntities", "characters", "events", "terms", "groups"],
    minProperties: 1,
    additionalProperties: false,
  };
}
