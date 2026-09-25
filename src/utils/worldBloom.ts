type WorldBloomChapterForTracking = {
  gameCharacterId?: number | null;
};

export function shouldShowWorldBloomChapterTracking(
  chapters: readonly WorldBloomChapterForTracking[]
): boolean {
  return (
    chapters.length > 1 ||
    (chapters.length === 1 && Boolean(chapters[0].gameCharacterId))
  );
}
