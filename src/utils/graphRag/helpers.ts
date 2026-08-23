import type { EpisodeTag, GraphEdge } from "./types";

export function compareEpisodeTags(
  tag1: EpisodeTag,
  tag2: EpisodeTag
): -1 | 0 | 1 {
  const category = (tag: EpisodeTag): 0 | 1 | 2 => {
    if (tag === "seed") return 0;
    return /^eventStory-\d+-\d+$/.test(tag) ? 2 : 1;
  };

  const categoryOrder = category(tag1) - category(tag2);
  if (categoryOrder !== 0) return categoryOrder < 0 ? -1 : 1;

  const tagOrder = tag1.localeCompare(tag2, undefined, { numeric: true });
  return tagOrder < 0 ? -1 : tagOrder > 0 ? 1 : 0;
}

export const earliestEpisodeTag = (edge: GraphEdge): string | undefined =>
  edge.episodeTags.reduce<string | undefined>(
    (earliest, tag) =>
      !earliest || compareEpisodeTags(tag, earliest) < 0 ? tag : earliest,
    undefined
  );

// Sort connections by the earliest attached episode. Fall back to stable edge
// fields so edges from the same episode retain a deterministic order.
export const byEpisode = (a: GraphEdge, b: GraphEdge): number => {
  const tagA = earliestEpisodeTag(a);
  const tagB = earliestEpisodeTag(b);
  if (tagA && tagB) {
    const tagComparison = compareEpisodeTags(tagA, tagB);
    if (tagComparison !== 0) return tagComparison;
  } else if (tagA) {
    return -1;
  } else if (tagB) {
    return 1;
  }

  return (
    a.identifier.localeCompare(b.identifier) ||
    a.sourceId.localeCompare(b.sourceId) ||
    a.targetId.localeCompare(b.targetId)
  );
};

export const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => part + part)
          .join("")
      : normalized;
  return [
    Number.parseInt(value.substring(0, 2), 16),
    Number.parseInt(value.substring(2, 4), 16),
    Number.parseInt(value.substring(4, 6), 16),
  ];
};
