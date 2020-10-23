/** MPEG 1 Layer III sampling rate definition */
const samplingRates = [
  44100,
  48000,
  32000,
  undefined, // reserved
];

/** MPEG 1 Layer III bitrate definition */
const bitrates = [
  undefined, // reserved
  32,
  40,
  48,
  56,
  64,
  80,
  96,
  112,
  128,
  160,
  192,
  224,
  256,
  320,
  undefined, // reserved
];

/**
 * MPEG frame header
 */
export interface FrameHeader {
  /** in kbps */
  bitrate: number;
  /** in Hz */
  samplingRate: number;
  padding: boolean;
  /** in bytes */
  frameSize: number;
}

/**
 * MPEG frame, or something else such as ID3 tag
 */
export interface Frame {
  /** in bytes */
  offset: number;
  /** in bytes */
  size: number;
  /** null if this is not a valid MP3 frame */
  frameHeader: FrameHeader | null;
}

/**
 * search for next MPEG frame
 * @param buffer buffer of MP3
 * @param offset search start offset
 * @returns offset to the frame, or `null` if not found
 */
function findNextFrame(buffer: Uint8Array, offset: number): number | undefined {
  for (let i = offset; i < buffer.length; i++) {
    if (buffer[i] === 0xff && buffer[i + 1] === 0xfb) {
      return i;
    }
  }
}

/**
 * calculates frame size
 * @param bitrate bitrate specified in frame header (in kbps)
 * @param samplingRate sampling rate specified in frame header (in Hz)
 * @param padding padding flag specified in frame header
 * @returns frame size (in bytes)
 */
function calcFrameSize(
  bitrate: number,
  samplingRate: number,
  padding: boolean
): number {
  return Math.floor((144000 * bitrate) / samplingRate + (padding ? 1 : 0));
}

/**
 * parses MPEG frame header
 * @param view DataView of frame header (at least 4 bytes)
 * @returns frame header, or `null` if parse failed
 */
function parseFrameHeader(view: DataView): FrameHeader | undefined {
  // check frame sync and version
  if (
    view.byteLength < 4 ||
    view.getUint8(0) !== 0xff ||
    view.getUint8(1) !== 0xfb
  ) {
    return;
  }

  const value = view.getUint8(2);
  const bitrate = bitrates[value >> 4];
  const samplingRate = samplingRates[(value >> 2) & 3];
  const padding = (value & 2) !== 0;

  if (!bitrate || !samplingRate) {
    return;
  }

  return {
    bitrate,
    samplingRate,
    padding,
    frameSize: calcFrameSize(bitrate, samplingRate, padding),
  };
}

/**
 * parses MP3 (MPEG 1 Layer III) into frames
 * @param buffer buffer of MP3
 * @returns an array of frames
 */
export function parseMP3(buffer: ArrayBuffer): Frame[] {
  const frames: Frame[] = [];

  const u8Buffer = new Uint8Array(buffer);
  let offset = 0;
  while (offset < u8Buffer.length) {
    // find next frame
    const frameHeaderOffset = findNextFrame(u8Buffer, offset);
    if (frameHeaderOffset == null) {
      // EOF
      frames.push({
        offset,
        size: u8Buffer.length - offset,
        frameHeader: null,
      });
      break;
    }

    // parse MPEG frame header
    const frameHeader = parseFrameHeader(
      new DataView(buffer, frameHeaderOffset, 4)
    );

    if (!frameHeader) {
      // failed to parse frame header
      // just skip it
      offset++;
      continue;
    }

    if (offset !== frameHeaderOffset) {
      // there is something between the previous frame and this frame
      // add that
      frames.push({
        offset,
        size: frameHeaderOffset - offset,
        frameHeader: null,
      });
    }

    // add current MPEG frame
    offset = frameHeaderOffset;
    frames.push({
      offset,
      size: frameHeader.frameSize,
      frameHeader,
    });

    offset += frameHeader.frameSize;
  }

  return frames;
}
