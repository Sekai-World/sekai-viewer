import React, { useEffect, useState } from "react";
import { IBondsHonorWord } from "../../types";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import Image from "mui-image";

const DegreeImage: React.FC<{
  bondsHonorWordId?: number;
}> = observer(({ bondsHonorWordId }) => {
  const { region } = useRootStore();

  const [bondsHonorWords] = useCachedData<IBondsHonorWord>("bondsHonorWords");

  const [honorWord, setHonorWord] = useState<IBondsHonorWord>();
  const [wordImage, setWordImage] = useState<string>("");

  useEffect(() => {
    if (bondsHonorWords) {
      if (bondsHonorWordId) {
        const honorWordDetail = bondsHonorWords.find(
          (honorWord) => honorWord.id === bondsHonorWordId
        );
        setHonorWord(honorWordDetail);
      }
    }
  }, [bondsHonorWordId, bondsHonorWords]);

  useEffect(() => {
    if (honorWord) {
      getRemoteAssetURL(
        `bonds_honor/word/${honorWord.assetbundleName}_01_rip/${honorWord.assetbundleName}_01.webp`,
        setWordImage,
        "minio",
        region
      );
    }
    return () => {
      setWordImage("");
    };
  }, [honorWord, region]);

  return !wordImage ? null : (
    <Image src={wordImage} fit="contain" bgColor="" duration={0} />
  );
});

export default DegreeImage;
