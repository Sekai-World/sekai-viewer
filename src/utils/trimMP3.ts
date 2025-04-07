import { parseMP3 } from "./mp3";

/**
 * trim first `trimDuration` seconds of MP3
 * @param source source MP3
 * @param trimDuration duration to trim (in seconds)
 * @param inclusive
 *   if `true`, the actual duration removed will be slightly shorter than `trimDuration`
 *   if `false`, the actual duration removed will be slightly longer than `trimDuration`
 * @returns trimmed MP3
 */
export function trimMP3(
  source: ArrayBuffer,
  trimDuration: number,
  inclusive = false
): ArrayBuffer | undefined {
  const frames = parseMP3(source);

  let index = 0;
  let totalDuration = 0;
  while (totalDuration < trimDuration) {
    const frame = frames[index];
    if (!frame) {
      // EOF; `source` is shorter than `trimDuration`
      return;
    }

    const { frameHeader } = frame;
    if (frameHeader) {
      totalDuration += 1152 / frameHeader.samplingRate;
    }

    index++;
  }

  if (inclusive && index > 0) {
    index--;
  }

  const beginFrame = frames[index];

  return source.slice(beginFrame.offset);
}
