import Axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useRefState } from ".";
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
function trimMP3(
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

//

interface TrimOptions {
  sourceURL: string;
  trimDuration: number;
  inclusive: boolean;
}

export function useTrimMP3() {
  const [options, optionsRef, setOptions] = useRefState<
    TrimOptions | undefined
  >(undefined);
  const [trimmedMP3URL, setTrimmedMP3URL] = useState<string | undefined>();
  const [trimFailed, setTrimFailed] = useState<boolean>(false);

  // revoke old blob URLs
  {
    const prevTrimmedMP3URL = useRef<string | undefined>();
    useEffect(() => {
      const oldURL = prevTrimmedMP3URL.current;
      //console.log("trim revoke", oldURL, trimmedMP3URL);
      if (oldURL && oldURL !== trimmedMP3URL) {
        URL.revokeObjectURL(oldURL);
      }
      prevTrimmedMP3URL.current = trimmedMP3URL;
    }, [trimmedMP3URL]);
  }

  useEffect(() => {
    //console.log("trim start", options, optionsRef);

    setTrimmedMP3URL(undefined);
    setTrimFailed(false);

    if (!options) {
      return;
    }

    let blobURL: string | undefined;

    Axios.get(options.sourceURL, {
      responseType: "arraybuffer",
    })
      .then((response) => {
        //console.log("trim response", options, optionsRef, response);

        // do nothing if `options` is outdated
        if (optionsRef.current !== options) {
          return;
        }

        const trimmed = trimMP3(
          response.data as ArrayBuffer,
          options.trimDuration,
          options.inclusive
        );

        if (!trimmed) {
          // will be caught
          throw new Error("trimMP3() failed");
        }

        blobURL = URL.createObjectURL(
          new Blob([trimmed], {
            type: "audio/mp3",
          })
        );

        setTrimmedMP3URL(blobURL);
        setTrimFailed(false);
      })
      .catch((error) => {
        console.error("trim failed", error);
        setTrimFailed(true);
      });

    return () => {
      //console.log("trim revoke", blobURL);
      if (blobURL) {
        URL.revokeObjectURL(blobURL);
      }
    };
  }, [options, optionsRef, setTrimmedMP3URL, setTrimFailed]);

  return [trimmedMP3URL, trimFailed, setOptions] as const;
}
