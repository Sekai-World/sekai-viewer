import { describe, expect, it } from "vitest";
import { IMusicInfo } from "../types";
import { addFlacTags } from "./flac";

const music: IMusicInfo = {
  id: 1,
  seq: 1,
  releaseConditionId: 0,
  categories: [],
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
};

function makePngCover(): Uint8Array<ArrayBuffer> {
  const png = new Uint8Array(26);
  png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  png.set([0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52], 8);
  png.set([0, 0, 0, 1, 0, 0, 0, 1, 8, 6], 16);
  return png;
}

describe("addFlacTags", () => {
  it("preserves metadata and audio bytes without mutating the inputs", async () => {
    const audioBytes = new Uint8Array([0xff, 0xf8, 0x12, 0x34]);
    const source = new Uint8Array(42 + audioBytes.byteLength);
    source.set([0x66, 0x4c, 0x61, 0x43, 0x80, 0, 0, 34]);
    source.set(audioBytes, 42);
    const sourceBefore = source.slice();
    const cover = makePngCover();
    const coverBefore = cover.slice();

    const blob = await addFlacTags(
      source.buffer,
      music,
      ["Miku"],
      cover.buffer
    );
    const result = new Uint8Array(await blob.arrayBuffer());

    expect(blob.type).toBe("audio/flac");
    expect(Array.from(result.subarray(0, 4))).toEqual([0x66, 0x4c, 0x61, 0x43]);
    expect(result.subarray(8, 42)).toEqual(source.subarray(8, 42));
    expect(result.slice(-audioBytes.byteLength)).toEqual(audioBytes);
    expect(source).toEqual(sourceBefore);
    expect(cover).toEqual(coverBefore);
  });
});
