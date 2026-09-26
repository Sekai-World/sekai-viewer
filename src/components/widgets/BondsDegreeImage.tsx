import { Skeleton } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

// chr_sd textures are 160x136 canvases. UIPartsBondsHonorImage.SetSlot draws
// them 1:1 with their bottom 12 below a main degree, and at 0.77 resting on the
// bottom edge of a sub degree; each sits flush to its own side. Older exports
// were trimmed to their opaque bounds, so those keep the tuned offsets below.
const SD_CANVAS_WIDTH = 160;
const SD_CANVAS_HEIGHT = 136;
const SD_SUB_SCALE = 0.77;

const isFullSdCanvas = (size: { width: number; height: number }) =>
  size.width === SD_CANVAS_WIDTH && size.height === SD_CANVAS_HEIGHT;

// Word textures are suffixed with the honor rarity: low _01 ... highest _04.
const bondsWordSuffix = (rarity?: string) =>
  String(
    Math.max(0, ["low", "middle", "high", "highest"].indexOf(rarity ?? "")) + 1
  ).padStart(2, "0");

// chr_sd art is keyed by character unit. The *_unit_virtual_singer views dress
// a virtual singer in the unit costume of a partner from another unit.
const sdUnitId = (
  unit: IGameCharaUnit,
  partner: IGameCharaUnit,
  units: IGameCharaUnit[],
  viewType?: string
) => {
  if (!viewType?.endsWith("_unit_virtual_singer") || unit.unit !== "piapro")
    return unit.id;
  return (
    units.find(
      (candidate) =>
        candidate.gameCharacterId === unit.gameCharacterId &&
        candidate.unit === partner.unit
    )?.id ?? unit.id
  );
};

function useImageLoaded(url: string | undefined): boolean {
  const [loaded, setLoaded] = useState(false);
  const prevUrlRef = useRef<string | undefined>(undefined);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setLoaded(false), []);

  useEffect(() => {
    if (url !== prevUrlRef.current) {
      setLoaded(false);
      prevUrlRef.current = url;
    }

    if (!url) {
      setLoaded(false);
      return;
    }

    const img = new window.Image();
    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url, handleLoad, handleError]);

  return loaded;
}

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
          `bonds_honor/word/${honorWord.assetbundleName}_${bondsWordSuffix(
            honor?.honorRarity
          )}.webp`,
          setWordImage,
          "minio",
          region
        );
      }
      return () => {
        setWordImage("");
      };
    }, [honor?.honorRarity, honorWord, region]);

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
      if (honor && gameCharas.length && gameCharacterUnits) {
        const [first, second] = viewType?.startsWith("reverse")
          ? [gameCharas[1], gameCharas[0]]
          : [gameCharas[0], gameCharas[1]];
        const sdUrl = (unit: IGameCharaUnit, partner: IGameCharaUnit) =>
          `bonds_honor/character/chr_sd_${String(
            sdUnitId(unit, partner, gameCharacterUnits, viewType)
          ).padStart(2, "0")}_01.webp`;
        if (viewType?.startsWith("normal") || viewType?.startsWith("reverse")) {
          getRemoteAssetURL(sdUrl(first, second), setSdLeft, "minio", region);
          getRemoteAssetURL(sdUrl(second, first), setSdRight, "minio", region);
        }
      }
      return () => {
        setSdLeft("");
        setSdRight("");
      };
    }, [gameCharacterUnits, gameCharas, honor, region, viewType]);

    useEffect(() => {
      const func = async () => {
        if (sdLeft) {
          const size = await getRemoteImageSize(sdLeft);
          if (isFullSdCanvas(size)) {
            const scale = sub ? SD_SUB_SCALE : 1;
            setSdLeftWidth(SD_CANVAS_WIDTH * scale);
            setSdLeftHeight(SD_CANVAS_HEIGHT * scale);
            setSdLeftOffsetX(0);
            setSdLeftOffsetY(sub ? 80 - SD_CANVAS_HEIGHT * scale : -44);
            return;
          }
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
          if (isFullSdCanvas(size)) {
            const scale = sub ? SD_SUB_SCALE : 1;
            setSdRightWidth(SD_CANVAS_WIDTH * scale);
            setSdRightHeight(SD_CANVAS_HEIGHT * scale);
            setSdRightOffsetX((sub ? 180 : 380) - SD_CANVAS_WIDTH * scale);
            setSdRightOffsetY(sub ? 80 - SD_CANVAS_HEIGHT * scale : -44);
            return;
          }
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

    const sdLeftLoaded = useImageLoaded(sdLeft);
    const sdRightLoaded = useImageLoaded(sdRight);
    const wordImageLoaded = useImageLoaded(wordImage);

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
          {sdLeftLoaded && (
            <image
              href={sdLeft}
              x={sdLeftOffsetX}
              y={sdLeftOffsetY}
              height={sdLeftHeight}
              width={sdLeftWidth}
              mask={sub ? "url(#left-sub-crop)" : ""}
            />
          )}
          {sdRightLoaded && (
            <image
              href={sdRight}
              x={sdRightOffsetX}
              y={sdRightOffsetY}
              height={sdRightHeight}
              width={sdRightWidth}
              mask={sub ? "url(#right-sub-crop)" : ""}
            />
          )}
          {!sub && wordImageLoaded && (
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
