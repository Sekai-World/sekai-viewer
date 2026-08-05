type MetaBlk = {
  dataOffset: number;
  type: number;
  length: number;
};

type Si = {
  sampleRate: number;
  dataOffset: number;
};

type FlacFrm = {
  offset: number;
  endOffset: number;
  blockSize: number;
  frameSize: number;
};

const SIG = new Uint8Array([0x66, 0x4c, 0x61, 0x43]);

export function trimFlac(
  source: ArrayBuffer,
  trimDuration: number,
  inclusive = false
): ArrayBuffer | undefined {
  if (trimDuration <= 0) return source.slice(0);

  const bytes = new Uint8Array(source);
  if (bytes.length < 42 || !hasSig(bytes)) return undefined;

  const parsed = parseMeta(bytes);
  if (!parsed) return undefined;

  const { blocks, si, audioStart } = parsed;
  if (!si.sampleRate) return undefined;

  const frames = findFrames(bytes, audioStart, si);
  if (!frames?.length) return undefined;

  const target = Math.round(trimDuration * si.sampleRate);
  let idx = 0;
  let skipped = 0;

  while (skipped < target) {
    const fr = frames[idx];
    if (!fr) return undefined;
    skipped += fr.blockSize;
    idx++;
  }

  if (inclusive && idx > 0) idx--;

  const begin = frames[idx];
  if (!begin) return undefined;
  if (begin.offset === audioStart) return source.slice(0);

  const kept = frames.slice(idx);
  if (!kept.length) return undefined;

  return rewrite(bytes, blocks, si, begin.offset, kept);
}

function hasSig(b: Uint8Array): boolean {
  return (
    b[0] === SIG[0] && b[1] === SIG[1] && b[2] === SIG[2] && b[3] === SIG[3]
  );
}

function parseMeta(
  bytes: Uint8Array
): { blocks: MetaBlk[]; si: Si; audioStart: number } | undefined {
  const blocks: MetaBlk[] = [];
  let off = 4;

  while (off + 4 <= bytes.length) {
    const h0 = bytes[off];
    const isLast = (h0 & 0x80) !== 0;
    const type = h0 & 0x7f;
    const len = (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3];
    const dataOffset = off + 4;
    const end = dataOffset + len;
    if (end > bytes.length) return undefined;

    blocks.push({ dataOffset, type, length: len });
    off = end;
    if (isLast) {
      if (!blocks.length || blocks[0].type !== 0 || blocks[0].length !== 34) {
        return undefined;
      }
      const si = readSi(bytes, blocks[0].dataOffset);
      if (!si) return undefined;
      return { blocks, si, audioStart: off };
    }
  }

  return undefined;
}

function readSi(bytes: Uint8Array, p: number): Si | undefined {
  if (p + 34 > bytes.length) return undefined;
  const sampleRate =
    (bytes[p + 10] << 12) | (bytes[p + 11] << 4) | (bytes[p + 12] >> 4);
  if (!sampleRate) return undefined;
  return { sampleRate, dataOffset: p };
}

function syncAt(b: Uint8Array, o: number): boolean {
  return o + 1 < b.length && b[o] === 0xff && (b[o + 1] & 0xfe) === 0xf8;
}

function findFrames(
  bytes: Uint8Array,
  audioStart: number,
  si: Si
): FlacFrm[] | undefined {
  const first = parseHdr(bytes, audioStart, si);
  if (!first) return undefined;

  const raw: Array<{
    offset: number;
    blockSize: number;
    headerEndOffset: number;
  }> = [{ offset: audioStart, ...first }];

  let cur = audioStart;

  while (true) {
    const nxt = findNextBoundary(bytes, cur, si);
    if (nxt === undefined) {
      if (!crc16Ok(bytes, cur, bytes.length)) return undefined;
      return raw.map((fr, i) => {
        const endOffset = i + 1 < raw.length ? raw[i + 1].offset : bytes.length;
        return {
          offset: fr.offset,
          endOffset,
          blockSize: fr.blockSize,
          frameSize: endOffset - fr.offset,
        };
      });
    }

    const hdr = parseHdr(bytes, nxt, si);
    if (!hdr) return undefined;
    raw.push({ offset: nxt, ...hdr });
    cur = nxt;
  }
}

function findNextBoundary(
  bytes: Uint8Array,
  curOff: number,
  si: Si
): number | undefined {
  const curHdr = parseHdr(bytes, curOff, si);
  if (!curHdr) return undefined;

  for (let i = curHdr.headerEndOffset + 2; i < bytes.length - 4; i++) {
    if (!syncAt(bytes, i)) continue;
    if (!parseHdr(bytes, i, si)) continue;
    if (!crc16Ok(bytes, curOff, i)) continue;
    return i;
  }

  return undefined;
}

function parseHdr(
  bytes: Uint8Array,
  off: number,
  si: Si
): { blockSize: number; headerEndOffset: number } | undefined {
  if (!syncAt(bytes, off) || off + 6 >= bytes.length) return undefined;

  const b2 = bytes[off + 2];
  const b3 = bytes[off + 3];
  const bsCode = b2 >> 4;
  const srCode = b2 & 0x0f;
  const chAsg = b3 >> 4;
  const bpsCode = (b3 >> 1) & 0x07;
  const reserved = b3 & 0x01;

  if (reserved !== 0 || bsCode === 0 || srCode === 15 || bpsCode === 3) {
    return undefined;
  }
  if (chAsg > 10) return undefined;

  let p = off + 4;
  const coded = readUtf8Num(bytes, p);
  if (!coded) return undefined;
  p = coded.next;

  let blockSize: number;
  if (bsCode === 1) blockSize = 192;
  else if (bsCode >= 2 && bsCode <= 5) blockSize = 144 * (1 << bsCode);
  else if (bsCode === 6) {
    if (p >= bytes.length) return undefined;
    blockSize = bytes[p] + 1;
    p += 1;
  } else if (bsCode === 7) {
    if (p + 1 >= bytes.length) return undefined;
    blockSize = ((bytes[p] << 8) | bytes[p + 1]) + 1;
    p += 2;
  } else if (bsCode >= 8 && bsCode <= 15) {
    blockSize = 256 * (1 << (bsCode - 8));
  } else {
    return undefined;
  }

  let sampleRate: number;
  switch (srCode) {
    case 0:
      sampleRate = si.sampleRate;
      break;
    case 1:
      sampleRate = 88200;
      break;
    case 2:
      sampleRate = 176400;
      break;
    case 3:
      sampleRate = 192000;
      break;
    case 4:
      sampleRate = 8000;
      break;
    case 5:
      sampleRate = 16000;
      break;
    case 6:
      sampleRate = 22050;
      break;
    case 7:
      sampleRate = 24000;
      break;
    case 8:
      sampleRate = 32000;
      break;
    case 9:
      sampleRate = 44100;
      break;
    case 10:
      sampleRate = 48000;
      break;
    case 11:
      sampleRate = 96000;
      break;
    case 12:
      if (p >= bytes.length) return undefined;
      sampleRate = bytes[p] * 1000;
      p += 1;
      break;
    case 13:
      if (p + 1 >= bytes.length) return undefined;
      sampleRate = (bytes[p] << 8) | bytes[p + 1];
      p += 2;
      break;
    case 14:
      if (p + 1 >= bytes.length) return undefined;
      sampleRate = ((bytes[p] << 8) | bytes[p + 1]) * 10;
      p += 2;
      break;
    default:
      return undefined;
  }

  if (sampleRate !== si.sampleRate) return undefined;

  if (p >= bytes.length) return undefined;
  if (crc8(bytes, off, p) !== bytes[p]) return undefined;

  return { blockSize, headerEndOffset: p + 1 };
}

function readUtf8Num(
  bytes: Uint8Array,
  off: number
): { next: number } | undefined {
  if (off >= bytes.length) return undefined;
  const first = bytes[off];

  if ((first & 0x80) === 0) return { next: off + 1 };

  let len: number;
  if ((first & 0xe0) === 0xc0) len = 2;
  else if ((first & 0xf0) === 0xe0) len = 3;
  else if ((first & 0xf8) === 0xf0) len = 4;
  else if ((first & 0xfc) === 0xf8) len = 5;
  else if ((first & 0xfe) === 0xfc) len = 6;
  else if (first === 0xfe) len = 7;
  else return undefined;

  if (off + len > bytes.length) return undefined;
  for (let i = 1; i < len; i++) {
    if ((bytes[off + i] & 0xc0) !== 0x80) return undefined;
  }

  return { next: off + len };
}

function crc8(bytes: Uint8Array, start: number, end: number): number {
  let crc = 0;
  for (let i = start; i < end; i++) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

function crc16Ok(bytes: Uint8Array, start: number, end: number): boolean {
  if (end - start < 4) return false;
  const exp = (bytes[end - 2] << 8) | bytes[end - 1];
  return crc16(bytes, start, end - 2) === exp;
}

function crc16(bytes: Uint8Array, start: number, end: number): number {
  let crc = 0;
  for (let i = start; i < end; i++) {
    crc ^= bytes[i] << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x8005) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

function rewrite(
  source: Uint8Array,
  blocks: MetaBlk[],
  si: Si,
  cutOffset: number,
  kept: FlacFrm[]
): ArrayBuffer | undefined {
  const keptBlks = blocks.filter((b) => b.type !== 3 && b.type !== 5);
  if (!keptBlks.length || keptBlks[0].type !== 0) return undefined;

  const bs = kept.map((f) => f.blockSize);
  const fs = kept.map((f) => f.frameSize);
  const minBlkDom = bs.length > 1 ? bs.slice(0, -1) : bs;

  const stats = {
    minBlockSize: Math.min(...minBlkDom),
    maxBlockSize: Math.max(...bs),
    minFrameSize: Math.min(...fs),
    maxFrameSize: Math.max(...fs),
    totalSamples: bs.reduce((n, v) => n + BigInt(v), 0n),
  };

  const parts: Uint8Array[] = [SIG];

  for (let i = 0; i < keptBlks.length; i++) {
    const blk = keptBlks[i];
    const last = i === keptBlks.length - 1;
    const payload = source.slice(blk.dataOffset, blk.dataOffset + blk.length);

    if (blk.type === 0) {
      if (payload.length !== 34) return undefined;
      patchSi(payload, 0, stats);
    }

    const hdr = new Uint8Array(4);
    hdr[0] = (last ? 0x80 : 0x00) | blk.type;
    hdr[1] = (payload.length >> 16) & 0xff;
    hdr[2] = (payload.length >> 8) & 0xff;
    hdr[3] = payload.length & 0xff;
    parts.push(hdr, payload);
  }

  parts.push(source.slice(cutOffset));
  return cat(parts).buffer;
}

function patchSi(
  bytes: Uint8Array,
  p: number,
  stats: {
    minBlockSize: number;
    maxBlockSize: number;
    minFrameSize: number;
    maxFrameSize: number;
    totalSamples: bigint;
  }
): void {
  w16(bytes, p, stats.minBlockSize);
  w16(bytes, p + 2, stats.maxBlockSize);
  w24(bytes, p + 4, stats.minFrameSize);
  w24(bytes, p + 7, stats.maxFrameSize);

  const total = stats.totalSamples;
  bytes[p + 13] = (bytes[p + 13] & 0xf0) | Number((total >> 32n) & 0x0fn);
  bytes[p + 14] = Number((total >> 24n) & 0xffn);
  bytes[p + 15] = Number((total >> 16n) & 0xffn);
  bytes[p + 16] = Number((total >> 8n) & 0xffn);
  bytes[p + 17] = Number(total & 0xffn);
  bytes.fill(0, p + 18, p + 34);
}

function w16(b: Uint8Array, o: number, v: number): void {
  b[o] = (v >> 8) & 0xff;
  b[o + 1] = v & 0xff;
}

function w24(b: Uint8Array, o: number, v: number): void {
  b[o] = (v >> 16) & 0xff;
  b[o + 1] = (v >> 8) & 0xff;
  b[o + 2] = v & 0xff;
}

function cat(parts: Uint8Array[]): Uint8Array {
  let n = 0;
  for (const p of parts) n += p.length;
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
