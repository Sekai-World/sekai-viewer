import { describe, expect, it } from "vitest";
import { toBlobPart } from "./blob";

describe("toBlobPart", () => {
  it("copies only the bytes in a nonzero-offset view", () => {
    const backing = new Uint8Array([0xaa, 0x10, 0x20, 0x30, 0xbb]);
    const view = backing.subarray(1, 4);
    const part = toBlobPart(view);

    expect(part).toBeInstanceOf(Uint8Array);
    expect(part.buffer).toBeInstanceOf(ArrayBuffer);
    expect(part.buffer).not.toBe(view.buffer);
    expect(part.byteOffset).toBe(0);
    expect(Array.from(part)).toEqual([0x10, 0x20, 0x30]);
  });

  it("copies the view bytes from shared-backed storage", () => {
    const shared = new Uint8Array(new SharedArrayBuffer(5));
    shared.set([0xaa, 0x40, 0x50, 0x60, 0xbb]);
    const view = shared.subarray(1, 4);
    const part = toBlobPart(view);

    expect(part.buffer).toBeInstanceOf(ArrayBuffer);
    expect(part.buffer).not.toBe(view.buffer);
    expect(Array.from(part)).toEqual([0x40, 0x50, 0x60]);
  });

  it("preserves strings and creates Blobs with the original bytes", async () => {
    const binaryBacking = new Uint8Array([0xaa, 0x66, 0x4c, 0x61, 0xbb]);
    const binaryPart = toBlobPart(binaryBacking.subarray(1, 4));
    const binaryBlob = new Blob([binaryPart], {
      type: "application/octet-stream",
    });
    expect(Array.from(new Uint8Array(await binaryBlob.arrayBuffer()))).toEqual([
      0x66, 0x4c, 0x61,
    ]);

    const text = "Sekai Viewer 音楽";
    const stringPart = toBlobPart(text);
    expect(stringPart).toBe(text);
    expect(typeof stringPart).toBe("string");
    const textBlob = new Blob([stringPart], { type: "text/plain" });
    expect(await textBlob.text()).toBe(text);
  });
});
