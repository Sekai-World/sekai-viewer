import { describe, expect, it } from "vitest";
import {
  applyNodeEdit,
  createNodeEditDraft,
  getNodeEditEmbeddingText,
} from "./nodeEdit";
import type { CharacterNode, FactNode, TermNode } from "./types";

describe("node edit helpers", () => {
  it("updates editable fact fields without changing its identity or metadata", () => {
    const fact: FactNode = {
      id: "fact-favorite-color",
      type: "fact",
      identifier: "favorite-color",
      statement: "Ichika likes blue.",
      description: "A personal preference.",
      embedding: new Float32Array([1, 2]),
      episodeTags: ["unitStory-leoneed-1"],
    };

    const edited = applyNodeEdit(fact, {
      statement: "Ichika prefers blue.",
      description: "Her stated personal preference.",
    });

    expect(edited).toMatchObject({
      id: fact.id,
      type: fact.type,
      identifier: fact.identifier,
      statement: "Ichika prefers blue.",
      description: "Her stated personal preference.",
      episodeTags: fact.episodeTags,
    });
    expect(getNodeEditEmbeddingText(edited)).toBe(
      "Ichika prefers blue. Her stated personal preference."
    );
  });

  it("trims fields and preserves optional group semantics", () => {
    const term: TermNode = {
      id: "term-sekai",
      type: "term",
      identifier: "sekai",
      name: "SEKAI",
      originalName: "セカイ",
      description: "An alternate world.",
      translatedNames: {},
      originalTextVariants: [],
      embedding: new Float32Array([1, 2]),
      episodeTags: [],
    };

    expect(createNodeEditDraft(term)).toEqual({
      name: "SEKAI",
      originalName: "セカイ",
      description: "An alternate world.",
      originalTextVariants: [],
      translatedNames: [],
    });
    expect(
      applyNodeEdit(term, {
        name: " SEKAI ",
        originalName: " セカイ ",
        description: " An alternate world shaped by feelings. ",
      })
    ).toMatchObject({
      name: "SEKAI",
      originalName: "セカイ",
      description: "An alternate world shaped by feelings.",
    });
  });

  it("rejects required editable fields that are blank", () => {
    const term: TermNode = {
      id: "term-sekai",
      type: "term",
      identifier: "sekai",
      name: "SEKAI",
      originalName: "セカイ",
      description: "An alternate world.",
      translatedNames: {},
      originalTextVariants: [],
      embedding: new Float32Array([1, 2]),
      episodeTags: [],
    };

    expect(() =>
      applyNodeEdit(term, {
        name: "SEKAI",
        originalName: "セカイ",
        description: "   ",
      })
    ).toThrow("Description is required.");
  });

  it("updates name variants and translates names with normalized metadata", () => {
    const character: CharacterNode = {
      id: "character-ichika",
      type: "character",
      identifier: "ichika",
      name: "Ichika",
      originalName: "Hoshino Ichika",
      gender: "female",
      translatedNames: { ja: { "Hoshino Ichika": "Ichika Hoshino" } },
      originalTextVariants: ["Hoshino Ichika"],
    };

    const edited = applyNodeEdit(character, {
      ...createNodeEditDraft(character),
      originalTextVariants: [" Hoshino Ichika ", "Ichika"],
      translatedNames: [
        {
          language: " ja ",
          originalText: " Hoshino Ichika ",
          translation: " Ichika Hoshino ",
        },
        { language: "en", originalText: "Ichika", translation: "Ichika" },
      ],
    });

    expect(edited).toMatchObject({
      originalTextVariants: ["Hoshino Ichika", "Ichika"],
      translatedNames: {
        ja: { "Hoshino Ichika": "Ichika Hoshino" },
        en: { Ichika: "Ichika" },
      },
    });
  });

  it("rejects partially completed translated names", () => {
    const character: CharacterNode = {
      id: "character-ichika",
      type: "character",
      identifier: "ichika",
      name: "Ichika",
      originalName: "Hoshino Ichika",
      gender: "female",
      translatedNames: {},
      originalTextVariants: [],
    };

    expect(() =>
      applyNodeEdit(character, {
        ...createNodeEditDraft(character),
        translatedNames: [
          { language: "ja", originalText: "Hoshino Ichika", translation: "" },
        ],
      })
    ).toThrow(
      "Each translated name needs a language, original text, and translation."
    );
  });
});
