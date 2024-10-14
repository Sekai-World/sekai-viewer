import React, { useEffect, useState } from "react";
import { ICompactCostume3DModel, ICostume3DModel } from "../../types";
import { getRemoteAssetURL, useCachedData, useCompactData } from "../../utils";
import Image from "mui-image";

type Props = { costumeId: number };

const Costume3DThumbnail = ({ costumeId }: Props) => {
  const [costume3dModels] = useCachedData<ICostume3DModel>("costume3dModels");
  const [compactCostume3dModels] = useCompactData<ICompactCostume3DModel>(
    "compactCostume3dModels"
  );

  const [costume, setCostume] = useState<ICostume3DModel>();
  const [thumbnail, setThumbnail] = useState("");

  useEffect(() => {
    if (compactCostume3dModels) {
      const index = compactCostume3dModels.costume3dId.indexOf(costumeId);
      setCostume({
        id: compactCostume3dModels.id[index],
        costume3dId: compactCostume3dModels.costume3dId[index],
        assetbundleName: compactCostume3dModels.assetbundleName[index] || "",
        thumbnailAssetbundleName:
          compactCostume3dModels.thumbnailAssetbundleName[index],
        unit: compactCostume3dModels.__ENUM__.unit[
          compactCostume3dModels.unit[index]
        ],
      });
    } else if (costume3dModels) {
      setCostume(
        costume3dModels.find((elem) => elem.costume3dId === costumeId)
      );
    }
  }, [compactCostume3dModels, costume3dModels, costumeId]);

  useEffect(() => {
    if (costume) {
      getRemoteAssetURL(
        `thumbnail/costume_rip/${costume.thumbnailAssetbundleName}.webp`,
        setThumbnail,
        "minio"
      );
    }
  }, [costume]);

  return (
    <Image src={thumbnail} bgColor="" height={64} width={64} duration={0} />
  );
};

export default Costume3DThumbnail;
