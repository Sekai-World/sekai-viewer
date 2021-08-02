import axios from "axios";
import React, { useEffect, useState } from "react";
import { getRemoteAssetURL } from "../../utils";

const MoviePlayer: React.FC<
  { path: string } & React.VideoHTMLAttributes<HTMLVideoElement>
> = ({ path, ...videoProps }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const getMovieSrc = async () => {
      const buildDataUrl = await getRemoteAssetURL(
        `${path}/moviebundlebuilddata.asset`,
        undefined,
        window.isChinaMainland
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
        window.isChinaMainland
      );
    };

    getMovieSrc();
    return () => {
      setSrc("");
    };
  }, [path]);

  return src ? (
    <video {...videoProps}>
      <source src={src}></source>
    </video>
  ) : null;
};

export default MoviePlayer;
