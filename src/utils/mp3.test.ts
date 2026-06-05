import { describe, expect, it } from "vitest";
import { IMusicInfo } from "../types";
import { addID3Tags } from "./mp3";

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

function readSynchsafeSize(buffer: Uint8Array, offset: number): number {
  return (
    (buffer[offset] << 21) |
    (buffer[offset + 1] << 14) |
    (buffer[offset + 2] << 7) |
    buffer[offset + 3]
  );
}

function readFrameSize(buffer: Uint8Array, offset: number): number {
  return (
    (buffer[offset] << 24) |
    (buffer[offset + 1] << 16) |
    (buffer[offset + 2] << 8) |
    buffer[offset + 3]
  );
}

function readAscii(buffer: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...buffer.subarray(offset, offset + length));
}

function getFrames(buffer: Uint8Array): Map<string, Uint8Array> {
  const tagEnd = 10 + readSynchsafeSize(buffer, 6);
  const frames = new Map<string, Uint8Array>();
  let offset = 10;

  while (offset + 10 <= tagEnd) {
    const id = readAscii(buffer, offset, 4);
    const size = readFrameSize(buffer, offset + 4);
    if (!id.trim() || size === 0) break;

    frames.set(id, buffer.subarray(offset + 10, offset + 10 + size));
    offset += 10 + size;
  }

  return frames;
}

describe("addID3Tags", () => {
  it("writes text metadata and PNG cover art", async () => {
    const source = new Uint8Array([0xff, 0xfb, 0x90, 0x64]).buffer;
    const pngCover = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]).buffer;

    const tagged = new Uint8Array(
      await (await addID3Tags(source, music, ["Miku"], pngCover)).arrayBuffer()
    );
    const frames = getFrames(tagged);
    const coverFrame = frames.get("APIC");

    expect(readAscii(tagged, 0, 3)).toBe("ID3");
    expect(frames.has("TIT2")).toBe(true);
    expect(frames.has("TPE1")).toBe(true);
    expect(frames.has("TCOM")).toBe(true);
    expect(frames.has("TEXT")).toBe(true);
    expect(coverFrame).toBeDefined();
    expect(readAscii(coverFrame!, 1, 9)).toBe("image/png");
    expect(coverFrame![11]).toBe(3);
    expect(Array.from(coverFrame!)).toEqual(
      expect.arrayContaining(Array.from(new Uint8Array(pngCover)))
    );
  });
});
