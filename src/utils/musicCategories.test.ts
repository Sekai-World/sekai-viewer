import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { fetchMusicCategories, mergeMusicCategories } from "./musicCategories";
import { IMusicCategory, IMusicInfo } from "../types";

vi.mock("axios", () => ({
  default: { get: vi.fn() },
}));

const mockedGet = axios.get as unknown as ReturnType<typeof vi.fn>;

function makeMusic(overrides: Partial<IMusicInfo> = {}): IMusicInfo {
  return {
    id: 1,
    seq: 1,
    releaseConditionId: 0,
    title: "Test Music",
    pronunciation: "",
    creatorArtistId: 0,
    lyricist: "Lyricist",
    composer: "Composer",
    arranger: "Arranger",
    dancerCount: 0,
    selfDancerPosition: 0,
    assetbundleName: "test_music",
    publishedAt: 0,
    fillerSec: 0,
    ...overrides,
  } as IMusicInfo;
}

describe("mergeMusicCategories", () => {
  it("keeps old-format categories already present on the entry", () => {
    const musics = [makeMusic({ id: 1, categories: ["mv", "original"] })];

    const result = mergeMusicCategories(musics, undefined);

    expect(result[0].categories).toEqual(["mv", "original"]);
  });

  it("keeps old-format entries untouched when external categories are provided", () => {
    const musics = [
      makeMusic({ id: 1, categories: ["mv"] }),
      makeMusic({ id: 2, categories: ["original"] }),
    ];
    const external: IMusicCategory[] = [
      { musicId: 1, musicCategoryName: "mv_2d", startAt: 0 },
    ];

    const result = mergeMusicCategories(musics, external);

    // existing inline categories win, external records are ignored for them
    expect(result[0].categories).toEqual(["mv"]);
    expect(result[1].categories).toEqual(["original"]);
  });

  it("derives categories for new JP format entries from the standalone file", () => {
    const musics = [makeMusic({ id: 10 }), makeMusic({ id: 20 })];
    const external: IMusicCategory[] = [
      { musicId: 10, musicCategoryName: "mv", startAt: 1000 },
      { musicId: 20, musicCategoryName: "original" },
    ];

    const result = mergeMusicCategories(musics, external);

    expect(result[0].categories).toEqual([
      { musicCategoryName: "mv", startAt: 1000 },
    ]);
    expect(result[1].categories).toEqual(["original"]);
  });

  it("preserves a startAt of 0 (does not treat 0 as missing)", () => {
    const musics = [makeMusic({ id: 20 })];
    const external: IMusicCategory[] = [
      { musicId: 20, musicCategoryName: "original", startAt: 0 },
    ];

    const result = mergeMusicCategories(musics, external);

    expect(result[0].categories).toEqual([
      { musicCategoryName: "original", startAt: 0 },
    ]);
  });

  it("preserves a music asset variant ID for duplicate category names", () => {
    const musics = [makeMusic({ id: 477 })];
    const external: IMusicCategory[] = [
      { musicId: 477, musicCategoryName: "mv" },
      { musicId: 477, musicCategoryName: "mv_2d" },
      {
        musicId: 477,
        musicCategoryName: "mv_2d",
        musicAssetVariantId: 47701,
      },
    ];

    const result = mergeMusicCategories(musics, external);

    expect(result[0].categories).toEqual([
      "mv",
      "mv_2d",
      { musicCategoryName: "mv_2d", musicAssetVariantId: 47701 },
    ]);
  });

  it("preserves startAt and music asset variant ID together", () => {
    const musics = [makeMusic({ id: 20 })];
    const external: IMusicCategory[] = [
      {
        musicId: 20,
        musicCategoryName: "mv_2d",
        startAt: 0,
        musicAssetVariantId: 47701,
      },
    ];

    const result = mergeMusicCategories(musics, external);

    expect(result[0].categories).toEqual([
      {
        musicCategoryName: "mv_2d",
        startAt: 0,
        musicAssetVariantId: 47701,
      },
    ]);
  });

  it("falls back to [] when an entry has no categories and no matching record", () => {
    const musics = [makeMusic({ id: 99 })];
    const external: IMusicCategory[] = [
      { musicId: 1, musicCategoryName: "mv" },
    ];

    const result = mergeMusicCategories(musics, external);

    expect(result[0].categories).toEqual([]);
  });

  it("handles duplicate / multiple categories for a single music", () => {
    const musics = [makeMusic({ id: 5 })];
    const external: IMusicCategory[] = [
      { musicId: 5, musicCategoryName: "mv", startAt: 100 },
      { musicId: 5, musicCategoryName: "image", startAt: 200 },
    ];

    const result = mergeMusicCategories(musics, external);

    expect(result[0].categories).toEqual([
      { musicCategoryName: "mv", startAt: 100 },
      { musicCategoryName: "image", startAt: 200 },
    ]);
  });

  it("does not mutate the original musics input", () => {
    const musics = [makeMusic({ id: 5 })];
    const external: IMusicCategory[] = [
      { musicId: 5, musicCategoryName: "mv", startAt: 0 },
    ];

    const before = JSON.stringify(musics);
    mergeMusicCategories(musics, external);

    expect(JSON.stringify(musics)).toEqual(before);
  });

  it("falls back safely when the external file could not be fetched (e.g. 404/network error for a region without the file)", () => {
    const musics = [
      makeMusic({ id: 1, categories: ["mv"] }),
      makeMusic({ id: 2 }), // dirty entry missing categories
    ];

    const result = mergeMusicCategories(musics, undefined);

    // preserved inline categories
    expect(result[0].categories).toEqual(["mv"]);
    // missing categories normalized to [] instead of crashing downstream
    expect(result[1].categories).toEqual([]);
  });
});

describe("fetchMusicCategories", () => {
  it("returns parsed categories on a successful response", async () => {
    mockedGet.mockResolvedValue({
      data: [{ musicId: 1, musicCategoryName: "mv", startAt: 0 }],
    });

    const result = await fetchMusicCategories("jp");

    expect(mockedGet).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { musicId: 1, musicCategoryName: "mv", startAt: 0 },
    ]);
  });

  it("swallows 404 / network errors and resolves to undefined", async () => {
    mockedGet.mockRejectedValue(new Error("Request failed with status 404"));

    const result = await fetchMusicCategories("en");

    expect(result).toBeUndefined();
  });

  it("swallows malformed-body errors and resolves to undefined", async () => {
    mockedGet.mockRejectedValue(new Error("Unexpected token in JSON"));

    const result = await fetchMusicCategories("kr");

    expect(result).toBeUndefined();
  });
});
