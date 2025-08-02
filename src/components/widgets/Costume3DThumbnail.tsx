import React, { useEffect, useState } from "react";
import { ICompactCostume3DModel, ICostume3DModel } from "../../types";
import { getRemoteAssetURL, useCachedData, useCompactData } from "../../utils";
import Image from "mui-image";

type Props = { costumeId: number; unit: string };

const Costume3DThumbnail = ({ costumeId, unit }: Props) => {
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
      const matchingCostumes = costume3dModels.filter(
        (elem) => elem.costume3dId === costumeId
      );
      const unitCostume = matchingCostumes.find((elem) => elem.unit === unit);
      const piaproCostume = matchingCostumes.find(
        (elem) => elem.unit === "piapro"
      );
      setCostume(unitCostume || piaproCostume || matchingCostumes[0]);
    }
  }, [compactCostume3dModels, costume3dModels, costumeId, unit]);

  useEffect(() => {
    if (costume) {
      getRemoteAssetURL(
        `thumbnail/costume/${costume.thumbnailAssetbundleName}.webp`,
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
