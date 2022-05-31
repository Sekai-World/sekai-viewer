import React, { useEffect, useState } from "react";
import { ICostume3DModel } from "../../types";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import Image from "mui-image";

type Props = { costumeId: number };

const Costume3DThumbnail = ({ costumeId }: Props) => {
  const [costume3dModels] = useCachedData<ICostume3DModel>("costume3dModels");

  const [costume, setCostume] = useState<ICostume3DModel>();
  const [thumbnail, setThumbnail] = useState("");

  useEffect(() => {
    if (costume3dModels) {
      setCostume(
        costume3dModels.find((elem) => elem.costume3dId === costumeId)
      );
    }
  }, [costume3dModels, costumeId]);

  useEffect(() => {
    if (costume) {
      getRemoteAssetURL(
        `thumbnail/costume_rip/${costume.thumbnailAssetbundleName}.webp`,
        setThumbnail,
        window.isChinaMainland ? "cn" : "minio"
      );
    }
  }, [costume]);

  return (
    <Image src={thumbnail} bgColor="" height={64} width={64} duration={0} />
  );
};

export default Costume3DThumbnail;
