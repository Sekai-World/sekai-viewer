import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { ServerRegion } from "../../types.d";
import { XMLParser } from "fast-xml-parser";
import { assetUrl } from "../../utils/urls";
import { getRemoteAssetURL } from "../../utils";

const MoviePlayer: React.FC<
  {
    path: string;
    region?: ServerRegion;
  } & React.VideoHTMLAttributes<HTMLVideoElement>
> = ({ path, region = "jp", ...videoProps }) => {
  const [src, setSrc] = useState("");

  const parser = useMemo(
    () =>
      new XMLParser({
        isArray: (name) => {
          if (["CommonPrefixes", "Contents"].includes(name)) return true;
          return false;
        },
      }),
    []
  );

  useEffect(() => {
    const getMovieSrc = async () => {
      const baseURL = assetUrl.minio[region];
      const result = (
        await axios.get<string>("/", {
          baseURL,
          params: {
            "continuation-token": undefined,
            delimiter: "/",
            "list-type": "2",
            "max-keys": "500",
            prefix: path,
          },
          responseType: "text",
        })
      ).data;

      const parsed = parser.parse(result).ListBucketResult;
      const filepath = parsed.Contents.find((elem: Record<string, string>) =>
        elem.Key.endsWith(".mp4")
      )?.Key;
      if (!filepath) {
        console.error("No movie file found in the specified path.");
        return;
      }
      return getRemoteAssetURL(filepath, setSrc, "minio", region);
    };

    getMovieSrc();
    return () => {
      setSrc("");
    };
  }, [parser, path, region]);

  return src ? (
    <video {...videoProps}>
      <source src={src}></source>
    </video>
  ) : null;
};

export default MoviePlayer;
