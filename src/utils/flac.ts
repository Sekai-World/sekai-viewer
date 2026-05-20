import { IMusicInfo } from "../types";

type FlacBlock = {
  type: number;
  data: Uint8Array;
  isLast: boolean;
};

const FLAC_MAGIC = new Uint8Array([0x66, 0x4c, 0x61, 0x43]);

const B = {
  STREAMINFO: 0,
  PADDING: 1,
  APPLICATION: 2,
  SEEKTABLE: 3,
  VORBIS_COMMENT: 4,
  CUESHEET: 5,
  PICTURE: 6,
} as const;

const enc = new TextEncoder();
const dec = new TextDecoder("utf-8", { fatal: true });

const MANAGED = new Set([
  "TITLE",
  "ARTIST",
  "ARTISTS",
  "COMPOSER",
  "ARRANGER",
  "LYRICIST",
]);

export async function addFlacTags(
  source: ArrayBuffer,
  music: IMusicInfo,
  vocals: string[],
  coverImage: ArrayBuffer
): Promise<Blob> {
  const bytes = new Uint8Array(source);
  const parsed = parseNativeFlac(bytes);

  const oldVc = parsed.blocks.find((b) => b.type === B.VORBIS_COMMENT);
  const oldMeta = oldVc
    ? readVorbisCommentBlock(oldVc.data)
    : { vendor: "sekai-viewer", comments: [] as string[] };

  const vc = buildVorbisCommentBlock(
    oldMeta.vendor,
    mergeManagedComments(oldMeta.comments, music, vocals)
  );
  const pic = buildPictureBlock(
    new Uint8Array(coverImage),
    "image/png",
    "cover"
  );

  const si = parsed.blocks[0];
  if (!si || si.type !== B.STREAMINFO) {
    throw new Error("Invalid FLAC: missing first STREAMINFO block");
  }

  const out: Array<{ type: number; data: Uint8Array }> = [
    { type: B.STREAMINFO, data: si.data },
    { type: B.VORBIS_COMMENT, data: vc },
    { type: B.PICTURE, data: pic },
  ];

  for (const blk of parsed.blocks.slice(1)) {
    if (blk.type === B.VORBIS_COMMENT) continue;
    if (blk.type === B.PICTURE && readPictureType(blk.data) === 3) continue;
    out.push({ type: blk.type, data: blk.data });
  }

  const parts: BlobPart[] = [FLAC_MAGIC];
  out.forEach((blk, i) => {
    const last = i === out.length - 1;
    parts.push(writeMetadataBlockHeader(blk.type, blk.data.byteLength, last));
    parts.push(blk.data);
  });
  parts.push(parsed.audioBytes);

  return new Blob(parts, { type: "audio/flac" });
}

function parseNativeFlac(bytes: Uint8Array): {
  blocks: FlacBlock[];
  audioBytes: Uint8Array;
} {
  if (
    bytes.byteLength < 8 ||
    bytes[0] !== 0x66 ||
    bytes[1] !== 0x4c ||
    bytes[2] !== 0x61 ||
    bytes[3] !== 0x43
  ) {
    throw new Error("Invalid FLAC: missing fLaC marker");
  }

  const blocks: FlacBlock[] = [];
  let off = 4;

  while (off + 4 <= bytes.byteLength) {
    const h0 = bytes[off];
    const isLast = (h0 & 0x80) !== 0;
    const type = h0 & 0x7f;
    const len = (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3];
    const ds = off + 4;
    const de = ds + len;

    if (de > bytes.byteLength) {
      throw new Error("Invalid FLAC: metadata block length exceeds file size");
    }

    blocks.push({ type, isLast, data: bytes.subarray(ds, de) });
    off = de;

    if (isLast) {
      if (blocks[0]?.type !== B.STREAMINFO) {
        throw new Error("Invalid FLAC: first metadata block is not STREAMINFO");
      }
      return { blocks, audioBytes: bytes.subarray(off) };
    }
  }

  throw new Error("Invalid FLAC: no final metadata block");
}

function writeMetadataBlockHeader(
  type: number,
  length: number,
  isLast: boolean
): Uint8Array {
  if (type < 0 || type > 0x7f) {
    throw new Error(`Invalid FLAC metadata block type: ${type}`);
  }
  if (length > 0xffffff) {
    throw new Error(`FLAC metadata block too large: ${length} bytes`);
  }
  return new Uint8Array([
    (isLast ? 0x80 : 0x00) | type,
    (length >>> 16) & 0xff,
    (length >>> 8) & 0xff,
    length & 0xff,
  ]);
}

function mergeManagedComments(
  existing: string[],
  music: IMusicInfo,
  vocals: string[]
): string[] {
  const kept = existing.filter((entry) => {
    const eq = entry.indexOf("=");
    if (eq <= 0) return false;
    return !MANAGED.has(entry.slice(0, eq).toUpperCase());
  });

  const vox = vocals.map((s) => s.trim()).filter(Boolean);
  const next = [...kept];

  pushComment(next, "TITLE", music.title);
  if (vox.length) {
    pushComment(next, "ARTIST", vox.join(", "));
    for (const v of vox) pushComment(next, "ARTISTS", v);
  }
  pushComment(next, "COMPOSER", music.composer);
  pushComment(next, "ARRANGER", music.arranger);
  pushComment(next, "LYRICIST", music.lyricist);

  return next;
}

function pushComment(
  out: string[],
  key: string,
  value: string | null | undefined
) {
  const v = (value ?? "").trim();
  if (!v) return;
  if (!/^[\x20-\x3c\x3e-\x7e]+$/.test(key)) {
    throw new Error(`Invalid Vorbis comment key: ${key}`);
  }
  out.push(`${key}=${v}`);
}

function buildVorbisCommentBlock(
  vendor: string,
  comments: string[]
): Uint8Array {
  const vend = enc.encode(vendor || "sekai-viewer");
  const flds = comments.map((c) => enc.encode(c));
  const total =
    4 + vend.byteLength + 4 + flds.reduce((n, f) => n + 4 + f.byteLength, 0);
  const out = new Uint8Array(total);
  let o = 0;

  w32le(out, o, vend.byteLength);
  o += 4;
  out.set(vend, o);
  o += vend.byteLength;

  w32le(out, o, flds.length);
  o += 4;
  for (const f of flds) {
    w32le(out, o, f.byteLength);
    o += 4;
    out.set(f, o);
    o += f.byteLength;
  }

  return out;
}

function readVorbisCommentBlock(data: Uint8Array): {
  vendor: string;
  comments: string[];
} {
  let o = 0;
  const vlen = r32le(data, o);
  o += 4;
  if (o + vlen > data.byteLength) {
    throw new Error(
      "Invalid FLAC Vorbis comment block: vendor length out of range"
    );
  }
  const vendor = dec.decode(data.subarray(o, o + vlen));
  o += vlen;

  const cnt = r32le(data, o);
  o += 4;
  const comments: string[] = [];

  for (let i = 0; i < cnt; i++) {
    const len = r32le(data, o);
    o += 4;
    if (o + len > data.byteLength) {
      throw new Error(
        "Invalid FLAC Vorbis comment block: field length out of range"
      );
    }
    comments.push(dec.decode(data.subarray(o, o + len)));
    o += len;
  }

  return { vendor, comments };
}

function buildPictureBlock(
  image: Uint8Array,
  mimeType: "image/png",
  description: string
): Uint8Array {
  const png = readPngInfo(image);
  const mime = enc.encode(mimeType);
  const desc = enc.encode(description);
  const total =
    4 + 4 + mime.byteLength + 4 + desc.byteLength + 16 + 4 + image.byteLength;

  if (total > 0xffffff) {
    throw new Error(`FLAC picture block too large: ${total} bytes`);
  }

  const out = new Uint8Array(total);
  let o = 0;

  w32be(out, o, 3);
  o += 4;
  w32be(out, o, mime.byteLength);
  o += 4;
  out.set(mime, o);
  o += mime.byteLength;
  w32be(out, o, desc.byteLength);
  o += 4;
  out.set(desc, o);
  o += desc.byteLength;
  w32be(out, o, png.width);
  o += 4;
  w32be(out, o, png.height);
  o += 4;
  w32be(out, o, png.colorDepth);
  o += 4;
  w32be(out, o, png.colors);
  o += 4;
  w32be(out, o, image.byteLength);
  o += 4;
  out.set(image, o);

  return out;
}

function readPictureType(data: Uint8Array): number | null {
  if (data.byteLength < 4) return null;
  return r32be(data, 0);
}

function readPngInfo(image: Uint8Array): {
  width: number;
  height: number;
  colorDepth: number;
  colors: number;
} {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < sig.length; i++) {
    if (image[i] !== sig[i]) throw new Error("Cover image is not a PNG");
  }

  const ihdrLen = r32be(image, 8);
  const ihdrType = ascii(image.subarray(12, 16));
  if (ihdrLen !== 13 || ihdrType !== "IHDR") {
    throw new Error("Invalid PNG: missing IHDR");
  }

  const width = r32be(image, 16);
  const height = r32be(image, 20);
  const bitDepth = image[24];
  const colorType = image[25];
  const chMap: Record<number, number> = {
    0: 1,
    2: 3,
    3: 1,
    4: 2,
    6: 4,
  };
  const ch = chMap[colorType] ?? 0;
  const colorDepth = ch > 0 ? bitDepth * ch : 0;
  const colors = colorType === 3 ? readPngPaletteColorCount(image) : 0;

  return { width, height, colorDepth, colors };
}

function readPngPaletteColorCount(image: Uint8Array): number {
  let o = 8;
  while (o + 8 <= image.byteLength) {
    const len = r32be(image, o);
    const typ = ascii(image.subarray(o + 4, o + 8));
    if (typ === "PLTE") return Math.floor(len / 3);
    o += 12 + len;
  }
  return 0;
}

function ascii(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes);
}

function r32le(bytes: Uint8Array, o: number): number {
  if (o + 4 > bytes.byteLength) throw new Error("Unexpected EOF");
  return (
    (bytes[o] |
      (bytes[o + 1] << 8) |
      (bytes[o + 2] << 16) |
      (bytes[o + 3] << 24)) >>>
    0
  );
}

function r32be(bytes: Uint8Array, o: number): number {
  if (o + 4 > bytes.byteLength) throw new Error("Unexpected EOF");
  return (
    (((bytes[o] << 24) >>> 0) |
      (bytes[o + 1] << 16) |
      (bytes[o + 2] << 8) |
      bytes[o + 3]) >>>
    0
  );
}

function w32le(bytes: Uint8Array, o: number, v: number): void {
  bytes[o] = v & 0xff;
  bytes[o + 1] = (v >>> 8) & 0xff;
  bytes[o + 2] = (v >>> 16) & 0xff;
  bytes[o + 3] = (v >>> 24) & 0xff;
}

function w32be(bytes: Uint8Array, o: number, v: number): void {
  bytes[o] = (v >>> 24) & 0xff;
  bytes[o + 1] = (v >>> 16) & 0xff;
  bytes[o + 2] = (v >>> 8) & 0xff;
  bytes[o + 3] = v & 0xff;
}
