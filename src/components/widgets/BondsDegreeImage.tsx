import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { IBondsHonorWord, IBondsHonor, IGameCharaUnit } from "../../types";
import {
  getRemoteAssetURL,
  getRemoteImageSize,
  useCachedData,
} from "../../utils";
import { degreeFrameMap, degreeFrameSubMap } from "../../utils/resources";
import degreeLevelIcon from "../../assets/frame/icon_degreeLv.png";
import degreeLevel6Icon from "../../assets/frame/icon_degreeLv6.png";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import Svg from "../styled/Svg";

const BondsDegreeImage: React.FC<
  {
    bondsHonorWordId?: number;
    honorId?: number;
    type: string;
    viewType?: string;
    honorLevel?: number;
    sub?: boolean;
  } & React.HTMLProps<HTMLDivElement>
> = observer(
  ({ bondsHonorWordId, viewType, honorId, style, honorLevel, sub = false }) => {
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
    const [sdLeftHeight, setSdLeftHeight] = useState(0);
    const [sdLeftWidth, setSdLeftWidth] = useState(0);
    const [sdLeftOffsetX, setSdLeftOffsetX] = useState(0);
    const [sdLeftOffsetY, setSdLeftOffsetY] = useState(0);
    const [sdRight, setSdRight] = useState<string>("");
    const [sdRightHeight, setSdRightHeight] = useState(0);
    const [sdRightWidth, setSdRightWidth] = useState(0);
    const [sdRightOffsetX, setSdRightOffsetX] = useState(0);
    const [sdRightOffsetY, setSdRightOffsetY] = useState(0);
    const [wordImage, setWordImage] = useState<string>("");
    const [wordImageOffsetX, setWordImageOffsetX] = useState(0);
    const [wordImageOffsetY, setWordImageOffsetY] = useState(0);
    // const [degreeRankImage, setDegreeRankImage] = useState<string>("");

    useEffect(() => {
      if (bondsHonors && bondsHonorWords && gameCharacterUnits) {
        const honorDetail = bondsHonors.find((honor) => honor.id === honorId);
        setHonor(honorDetail);
        if (bondsHonorWordId) {
          const honorWordDetail = bondsHonorWords.find(
            (honorWord) => honorWord.id === bondsHonorWordId
          );
          setHonorWord(honorWordDetail);
        }
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
          `bonds_honor/word/${honorWord.assetbundleName}_01.webp`,
          setWordImage,
          "minio",
          region
        );
      }
      return () => {
        setWordImage("");
      };
    }, [honorWord, region]);

    useEffect(() => {
      const func = async () => {
        if (wordImage) {
          const size = await getRemoteImageSize(wordImage);
          setWordImageOffsetX(((sub ? 180 : 380) - size.width) / 2);
          setWordImageOffsetY((80 - size.height) / 2);
        }
      };

      func();
    }, [sub, wordImage]);

    useEffect(() => {
      if (honor && gameCharas.length) {
        if (viewType?.startsWith("normal")) {
          getRemoteAssetURL(
            `bonds_honor/character/chr_sd_${String(
              gameCharas[0].gameCharacterId
            ).padStart(2, "0")}_01.webp`,
            setSdLeft,
            "minio",
            region
          );
          getRemoteAssetURL(
            `bonds_honor/character/chr_sd_${String(
              gameCharas[1].gameCharacterId
            ).padStart(2, "0")}_01.webp`,
            setSdRight,
            "minio",
            region
          );
        } else if (viewType?.startsWith("reverse")) {
          getRemoteAssetURL(
            `bonds_honor/character/chr_sd_${String(
              gameCharas[1].gameCharacterId
            ).padStart(2, "0")}_01.webp`,
            setSdLeft,
            "minio",
            region
          );
          getRemoteAssetURL(
            `bonds_honor/character/chr_sd_${String(
              gameCharas[0].gameCharacterId
            ).padStart(2, "0")}_01.webp`,
            setSdRight,
            "minio",
            region
          );
        }
      }
      return () => {
        setSdLeft("");
        setSdRight("");
      };
    }, [gameCharas, honor, region, viewType]);

    useEffect(() => {
      const func = async () => {
        if (sdLeft) {
          const size = await getRemoteImageSize(sdLeft);
          setSdLeftHeight(sub ? size.height / 1.35 : size.height);
          setSdLeftWidth(sub ? size.width / 1.35 : size.width);
          setSdLeftOffsetX(sub ? 26 : 20);
          setSdLeftOffsetY(sub ? 77 - size.height / 1.35 : 93 - size.height);
        }
      };

      func();
    }, [sdLeft, sub]);

    useEffect(() => {
      const func = async () => {
        if (sdRight) {
          const size = await getRemoteImageSize(sdRight);
          setSdRightHeight(sub ? size.height / 1.35 : size.height);
          setSdRightWidth(sub ? size.width / 1.35 : size.width);
          setSdRightOffsetX(
            (sub ? 160 : 360) - (sub ? size.width / 1.35 : size.width)
          );
          setSdRightOffsetY(sub ? 78 - size.height / 1.35 : 93 - size.height);
        }
      };

      func();
    }, [sdRight, sub]);

    return honor === undefined ? null : !!honor ? (
      <Svg
        style={style}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={sub ? "0 0 180 80" : "0 0 380 80"}
      >
        {/* mask */}
        <defs>
          <mask id="rounded-rect">
            <rect
              x="10"
              y="0"
              height={80}
              width={sub ? 160 : 360}
              rx={40}
              fill="white"
            />
          </mask>
          <mask id="left-sub-crop">
            <rect x="0" y="0" height={80} width={90} fill="white" />
          </mask>
          <mask id="right-sub-crop">
            <rect x="90" y="0" height={80} width={90} fill="white" />
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
            width={sub ? 90 : 190}
            fill={
              viewType?.startsWith("normal")
                ? gameCharas[0].colorCode
                : gameCharas[1].colorCode
            }
          />
          {/* right bg */}
          <rect
            x={sub ? 90 : 190}
            y="0"
            height="80"
            width={sub ? 90 : 190}
            fill={
              viewType?.startsWith("normal")
                ? gameCharas[1].colorCode
                : gameCharas[0].colorCode
            }
          />
          {/* inner frame */}
          <rect
            x="16"
            y="6"
            height={68}
            width={sub ? 148 : 348}
            rx={34}
            stroke="white"
            strokeWidth={8}
            fillOpacity={0}
          />
          {/* left character */}
          <image
            href={sdLeft}
            x={sdLeftOffsetX}
            y={sdLeftOffsetY}
            height={sdLeftHeight}
            width={sdLeftWidth}
            mask={sub ? "url(#left-sub-crop)" : ""}
          />
          {/* right character */}
          <image
            href={sdRight}
            x={sdRightOffsetX}
            y={sdRightOffsetY}
            height={sdRightHeight}
            width={sdRightWidth}
            mask={sub ? "url(#right-sub-crop)" : ""}
          />
          {/* word */}
          {!sub && !!wordImage && (
            <image href={wordImage} x={wordImageOffsetX} y={wordImageOffsetY} />
          )}
          {/* degree level */}
          {!!honorLevel &&
            honor.levels.length > 1 &&
            Array.from({ length: Math.min(5, honorLevel) }).map((_, idx) => (
              <image
                key={idx}
                href={degreeLevelIcon}
                x={50 + idx * 16}
                y={64}
                height={sub ? 14 : 16}
                width={sub ? 14 : 16}
              />
            ))}
          {!!honorLevel &&
            honor.levels.length > 1 &&
            Array.from({ length: honorLevel - 5 }).map((_, idx) => (
              <image
                key={idx}
                href={degreeLevel6Icon}
                x={50 + idx * 16}
                y={64}
                height={sub ? 14 : 16}
                width={sub ? 14 : 16}
              />
            ))}
        </svg>
        {/* frame */}
        <image
          href={
            sub
              ? degreeFrameSubMap[honor.honorRarity]
              : degreeFrameMap[honor.honorRarity]
          }
          x="0"
          y="0"
          height="80"
          width={sub ? 180 : 380}
        />
      </Svg>
    ) : (
      <Skeleton variant="rectangular" width={sub ? 180 : 380} height="80" />
    );
  }
);

export default BondsDegreeImage;
