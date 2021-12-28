import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSvgStyles } from "../../styles/svg";
import { IBondsHonorWord, IBondsHonor, IGameCharaUnit } from "../../types";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { degreeFrameMap, degreeFramSubMap } from "../../utils/resources";
import degreeLevelIcon from "../../assets/frame/icon_degreeLv.png";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";

const DegreeImage: React.FC<
  {
    bondsHonorWordId: number;
    honorId: number;
    type: string;
    viewType?: string;
    honorLevel: number;
    sub?: boolean;
  } & React.HTMLProps<HTMLDivElement>
> = observer(
  ({
    bondsHonorWordId,
    type,
    viewType,
    honorId,
    style,
    honorLevel,
    sub = false,
  }) => {
    const classes = useSvgStyles();
    const { region } = useRootStore();

    // const [bonds] = useCachedData<IBond>("bonds");
    const [bondsHonorWords] = useCachedData<IBondsHonorWord>("bondsHonorWords");
    const [bondsHonors] = useCachedData<IBondsHonor>("bondsHonors");
    const [gameCharacterUnits] =
      useCachedData<IGameCharaUnit>("gameCharacterUnits");

    const [honor, setHonor] = useState<IBondsHonor>();
    const [honorWord, setHonorWord] = useState<IBondsHonorWord>();
    // const [honorLevel, setHonorLevel] = useState(_honorLevel);
    const [gameCharas, setGameCharas] = useState<IGameCharaUnit[]>([]);
    const [sdLeft, setSdLeft] = useState<string>("");
    const [sdRight, setSdRight] = useState<string>("");
    const [wordImage, setWordImage] = useState<string>("");
    // const [degreeRankImage, setDegreeRankImage] = useState<string>("");

    useEffect(() => {
      if (bondsHonors && bondsHonorWords && gameCharacterUnits) {
        const honorDetail = bondsHonors.find((honor) => honor.id === honorId);
        setHonor(honorDetail);
        const honorWordDetail = bondsHonorWords.find(
          (honorWord) => honorWord.id === bondsHonorWordId
        );
        setHonorWord(honorWordDetail);
        if (honorDetail)
          setGameCharas([
            gameCharacterUnits.find(
              (gcu) => gcu.id === honorDetail.gameCharacterUnitId1
            )!,
            gameCharacterUnits.find(
              (gcu) => gcu.id === honorDetail.gameCharacterUnitId2
            )!,
          ]);
      }
    }, [
      bondsHonorWordId,
      bondsHonorWords,
      bondsHonors,
      gameCharacterUnits,
      honorId,
    ]);

    useEffect(() => {
      if (honorWord) {
        getRemoteAssetURL(
          `bonds_honor/word/${honorWord.assetbundleName}_01_rip/${honorWord.assetbundleName}_01.webp`,
          setWordImage,
          window.isChinaMainland ? "cn" : "ww",
          region
        );
      }
      return () => {
        setWordImage("");
      };
    }, [honorWord, region]);

    useEffect(() => {
      if (honor && gameCharas.length) {
        if (viewType === "normal") {
          getRemoteAssetURL(
            `bonds_honor/character/chr_sd_${String(
              gameCharas[0].gameCharacterId
            ).padStart(2, "0")}_01_rip/chr_sd_${String(
              gameCharas[0].gameCharacterId
            ).padStart(2, "0")}_01.webp`,
            setSdLeft,
            window.isChinaMainland ? "cn" : "ww",
            region
          );
          getRemoteAssetURL(
            `bonds_honor/character/chr_sd_${String(
              gameCharas[1].gameCharacterId
            ).padStart(2, "0")}_01_rip/chr_sd_${String(
              gameCharas[1].gameCharacterId
            ).padStart(2, "0")}_01.webp`,
            setSdRight,
            window.isChinaMainland ? "cn" : "ww",
            region
          );
        } else if (viewType === "reverse") {
          getRemoteAssetURL(
            `bonds_honor/character/chr_sd_${String(
              gameCharas[1].gameCharacterId
            ).padStart(2, "0")}_01_rip/chr_sd_${String(
              gameCharas[1].gameCharacterId
            ).padStart(2, "0")}_01.webp`,
            setSdLeft,
            window.isChinaMainland ? "cn" : "ww",
            region
          );
          getRemoteAssetURL(
            `bonds_honor/character/chr_sd_${String(
              gameCharas[0].gameCharacterId
            ).padStart(2, "0")}_01_rip/chr_sd_${String(
              gameCharas[0].gameCharacterId
            ).padStart(2, "0")}_01.webp`,
            setSdRight,
            window.isChinaMainland ? "cn" : "ww",
            region
          );
        }
      }
      return () => {
        setSdLeft("");
        setSdRight("");
      };
    }, [gameCharas, honor, region, viewType]);

    return honor === undefined ? null : !!honor ? (
      <div className={classes.svg}>
        <svg
          style={style}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={sub ? "0 0 180 80" : "0 0 380 80"}
        >
          {/* mask */}
          <defs>
            <mask id="rounded-rect">
              <rect x="10" y="0" height={80} width={360} rx={40} fill="white" />
            </mask>
          </defs>
          <svg
            style={style}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={sub ? "0 0 180 80" : "0 0 380 80"}
            mask="url(#rounded-rect)"
          >
            {/* left bg */}
            <rect
              x="0"
              y="0"
              height="80"
              width="190"
              fill={
                viewType === "normal"
                  ? gameCharas[0].colorCode
                  : gameCharas[1].colorCode
              }
            />
            {/* right bg */}
            <rect
              x="190"
              y="0"
              height="80"
              width="190"
              fill={
                viewType === "normal"
                  ? gameCharas[1].colorCode
                  : gameCharas[0].colorCode
              }
            />
            {/* inner frame */}
            <rect
              x="16"
              y="6"
              height={68}
              width={348}
              rx={34}
              stroke="white"
              strokeWidth={8}
              fillOpacity={0}
            />
            {/* left character */}
            <image href={sdLeft} x="0" y="-55" height="160" width="160" />
            {/* right character */}
            <image href={sdRight} x="218" y="-55" height="160" width="160" />
            {/* word */}
            <image href={wordImage} x="0" y="0" height="80" width="380" />
            {/* degree level */}
            {!!honorLevel &&
              honor.levels.length > 1 &&
              Array.from({ length: honorLevel }).map((_, idx) => (
                <image
                  key={idx}
                  href={degreeLevelIcon}
                  x={54 + idx * 16}
                  y="64"
                  height="16"
                  width="16"
                />
              ))}
          </svg>
          {/* frame */}
          <image
            href={
              sub
                ? degreeFramSubMap[honor.honorRarity]
                : degreeFrameMap[honor.honorRarity]
            }
            x="0"
            y="0"
            height="80"
            width={sub ? 180 : 380}
          />
        </svg>
      </div>
    ) : (
      <Skeleton
        variant="rectangular"
        width={sub ? 180 : 380}
        height="80"
      ></Skeleton>
    );
  }
);

export default DegreeImage;
