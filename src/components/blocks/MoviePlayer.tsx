import axios from "axios";
import React, { useEffect, useState } from "react";
import { ServerRegion } from "../../types.d";
import { getRemoteAssetURL } from "../../utils";

const MoviePlayer: React.FC<
  {
    path: string;
    region?: ServerRegion;
  } & React.VideoHTMLAttributes<HTMLVideoElement>
> = ({ path, region = "jp", ...videoProps }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const getMovieSrc = async () => {
      const buildDataUrl = await getRemoteAssetURL(
        `${path}/moviebundlebuilddata.asset`,
        undefined,
        window.isChinaMainland ? "cn" : "minio"
      );
      const buildData = (
        await axios.get(buildDataUrl, { responseType: "json" })
      ).data;
      const fileName = buildData.movieBundleDatas[0].usmFileName
        .replace(/(-\d{3})?\.usm\.bytes/, "")
        .toLowerCase();
      return getRemoteAssetURL(
        `${path}/${fileName}.mp4`,
        setSrc,
        window.isChinaMainland ? "cn" : "minio",
        region
      );
    };

    getMovieSrc();
    return () => {
      setSrc("");
    };
  }, [path, region]);

  return src ? (
    <video {...videoProps}>
      <source src={src}></source>
    </video>
  ) : null;
};

export default MoviePlayer;
