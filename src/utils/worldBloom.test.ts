import { describe, expect, it } from "vitest";
import { shouldShowWorldBloomChapterTracking } from "./worldBloom";

describe("shouldShowWorldBloomChapterTracking", () => {
  it("does not show tracking when there are no chapters", () => {
    expect(shouldShowWorldBloomChapterTracking([])).toBe(false);
  });

  it("does not show tracking for a single chapter without a character", () => {
    expect(shouldShowWorldBloomChapterTracking([{}])).toBe(false);
  });

  it("shows tracking for a single chapter with a character", () => {
    expect(shouldShowWorldBloomChapterTracking([{ gameCharacterId: 1 }])).toBe(
      true
    );
  });

  it("shows tracking for multi-chapter events", () => {
    expect(
      shouldShowWorldBloomChapterTracking([
        { gameCharacterId: 1 },
        { gameCharacterId: 2 },
      ])
    ).toBe(true);
  });
});
