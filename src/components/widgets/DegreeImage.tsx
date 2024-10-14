import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  IResourceBoxInfo,
  IHonorInfo,
  IHonorGroup,
  ResourceBoxDetail,
  ICompactResourceBoxDetail,
} from "../../types.d";
import { getRemoteAssetURL, useCachedData, useCompactData } from "../../utils";
import { degreeFrameMap, degreeFramSubMap } from "../../utils/resources";
import degreeLevelIcon from "../../assets/frame/icon_degreeLv.png";
import degreeLevel6Icon from "../../assets/frame/icon_degreeLv6.png";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import Svg from "../styled/Svg";

const DegreeImage: React.FC<
  {
    resourceBoxId?: number;
    honorId?: number;
    type?: string;
    honorLevel?: number;
    sub?: boolean;
  } & React.HTMLProps<HTMLDivElement>
> = observer(
  ({
    resourceBoxId,
    type,
    honorId,
    style,
    honorLevel: _honorLevel,
    sub = false,
  }) => {
    const { region } = useRootStore();

    const [resourceBoxes] = useCachedData<IResourceBoxInfo>("resourceBoxes");
    const [compactResourceBoxDetails] =
      useCompactData<ICompactResourceBoxDetail>("compactResourceBoxDetails");
    const [honors] = useCachedData<IHonorInfo>("honors");
    const [honorGroups] = useCachedData<IHonorGroup>("honorGroups");

    const [honor, setHonor] = useState<IHonorInfo>();
    const [honorGroup, setHonorGroup] = useState<IHonorGroup>();
    const [honorLevel, setHonorLevel] = useState(_honorLevel);
    const [degreeImage, setDegreeImage] = useState<string>("");
    const [degreeFrameImage, setDegreeFrameImage] = useState<string>("");
    const [degreeRankImage, setDegreeRankImage] = useState<string>("");
    const [isWorldLinkDegree, setIsWorldLinkDegree] = useState(false);

    useEffect(() => {
      if (["tw", "kr"].includes(region)) {
        if (compactResourceBoxDetails && honors) {
          if (resourceBoxId) {
            // convert purpose to enum id
            const boxPurposeId =
              compactResourceBoxDetails.__ENUM__.resourceBoxPurpose.indexOf(
                type!
              );
            // convert type "honor" to enum id
            const boxTypeId =
              compactResourceBoxDetails.__ENUM__.resourceType.indexOf("honor");
            // find honor id
            const honorIndex = compactResourceBoxDetails.resourceId.findIndex(
              (id, index) =>
                compactResourceBoxDetails.resourceBoxPurpose[index] ===
                  boxPurposeId &&
                compactResourceBoxDetails.resourceType[index] === boxTypeId &&
                compactResourceBoxDetails.resourceBoxId[index] === resourceBoxId
            );
            const honorId = compactResourceBoxDetails.resourceId[honorIndex];
            const honorLevel =
              compactResourceBoxDetails.resourceLevel[honorIndex];
            if (honorId && honorLevel) {
              // set honor
              setHonor(honors.find((honor) => honor.id === honorId));
              setHonorLevel(honorLevel);
            } else {
              console.warn(
                `unable to find ${region} honor from resource box id ${resourceBoxId}`
              );
            }
          } else {
            setHonor(honors.find((honor) => honor.id === honorId));
          }
        }
      } else {
        if (resourceBoxes && honors) {
          let honorDetail: ResourceBoxDetail | undefined;
          if (resourceBoxId) {
            const honorBox = resourceBoxes.find(
              (resBox) =>
                resBox.resourceBoxPurpose === type! &&
                resBox.id === resourceBoxId
            );
            if (honorBox)
              honorDetail = honorBox.details.find(
                (detail) => detail.resourceType === "honor"
              );
          }
          setHonor(
            honors.find((honor) =>
              resourceBoxId && honorDetail
                ? honor.id === honorDetail.resourceId
                : honorId
                  ? honor.id === honorId
                  : false
            )
          );
          if (honorDetail) {
            setHonorLevel(honorDetail.resourceLevel);
          }
        }
      }
    }, [
      honors,
      resourceBoxes,
      resourceBoxId,
      type,
      honorId,
      region,
      compactResourceBoxDetails,
    ]);

    useEffect(() => {
      if (honor && honorGroups) {
        setHonorGroup(honorGroups.find((hg) => hg.id === honor.groupId));
        if (honor.assetbundleName)
          setIsWorldLinkDegree(/.*(_cp\d)$/.test(honor.assetbundleName));
        else if (!!honorLevel && honor.levels[honorLevel - 1].assetbundleName) {
          setHonor((honor) =>
            honor
              ? {
                  ...honor,
                  assetbundleName: honor.levels[honorLevel - 1].assetbundleName,
                }
              : honor
          );
          setIsWorldLinkDegree(/.*(_cp\d)$/.test(honor.assetbundleName!));
        } else if (honor.levels[0].assetbundleName) {
          setHonor((honor) =>
            honor
              ? {
                  ...honor,
                  assetbundleName: honor.levels[0].assetbundleName,
                }
              : honor
          );
          setIsWorldLinkDegree(/.*(_cp\d)$/.test(honor.assetbundleName!));
        }
      }
      return () => {
        setHonorGroup(undefined);
        setIsWorldLinkDegree(false);
      };
    }, [honor, honorGroups, honorLevel]);

    useEffect(() => {
      if (honor) {
        if (honorGroup && honorGroup.honorType === "rank_match") {
          getRemoteAssetURL(
            `rank_live/honor/${
              honorGroup.backgroundAssetbundleName
            }_rip/degree_${sub ? "sub" : "main"}.webp`,
            setDegreeImage,
            "minio",
            region
          );
        } else if (honorGroup && honorGroup.backgroundAssetbundleName) {
          getRemoteAssetURL(
            `honor/${honorGroup.backgroundAssetbundleName}_rip/degree_${
              sub ? "sub" : "main"
            }.webp`,
            setDegreeImage,
            "minio",
            region
          );
        } else if (honor.assetbundleName) {
          getRemoteAssetURL(
            `honor/${honor.assetbundleName}_rip/degree_${
              sub ? "sub" : "main"
            }.webp`,
            setDegreeImage,
            "minio",
            region
          );
        }
        if (honorGroup && honorGroup.frameName) {
          if (honor.honorRarity === "highest") {
            getRemoteAssetURL(
              `honor_frame/${honorGroup.frameName}_rip/frame_degree_${
                sub ? "s" : "m"
              }_4.webp`,
              setDegreeFrameImage,
              "minio",
              region
            );
          } else if (honor.honorRarity === "high") {
            getRemoteAssetURL(
              `honor_frame/${honorGroup.frameName}_rip/frame_degree_${
                sub ? "s" : "m"
              }_3.webp`,
              setDegreeFrameImage,
              "minio",
              region
            );
          } else if (honor.honorRarity) {
            setDegreeFrameImage(
              sub
                ? degreeFramSubMap[honor.honorRarity]
                : degreeFrameMap[honor.honorRarity]
            );
          }
        } else if (honor.honorRarity) {
          setDegreeFrameImage(
            sub
              ? degreeFramSubMap[honor.honorRarity]
              : degreeFrameMap[honor.honorRarity]
          );
        }
        if (
          type === "event_ranking_reward" ||
          (honorGroup && honorGroup.honorType === "event")
        ) {
          getRemoteAssetURL(
            `honor/${honor.assetbundleName}_rip/rank_${
              sub ? "sub" : "main"
            }.webp`,
            setDegreeRankImage,
            "minio",
            region,
            true
          );
        } else if (honorGroup && honorGroup.honorType === "rank_match") {
          getRemoteAssetURL(
            `rank_live/honor/${honor.assetbundleName}_rip/${
              sub ? "sub" : "main"
            }.webp`,
            setDegreeRankImage,
            "minio",
            region,
            true
          );
        }
      }
      return () => {
        setDegreeImage("");
        setDegreeFrameImage("");
        setDegreeRankImage("");
      };
    }, [honor, honorGroup, region, sub, type]);

    return honor === undefined ? null : !!honor ? (
      <Svg
        style={style}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={sub ? "0 0 180 80" : "0 0 380 80"}
      >
        <image
          href={degreeImage}
          x="0"
          y="0"
          height="80"
          width={sub ? 180 : 380}
        />
        {/* frame */}
        <image
          href={degreeFrameImage}
          x="0"
          y="0"
          height="80"
          width={sub ? 180 : 380}
        />
        {/* degree level */}
        {!!honorLevel &&
          honor.levels.length > 1 &&
          Array.from({ length: honorLevel }).map((_, idx) => (
            <image
              key={idx}
              href={honorLevel >= 6 ? degreeLevel6Icon : degreeLevelIcon}
              x={54 + idx * 16}
              y="64"
              height="16"
              width="16"
            />
          ))}
        {/* rank */}
        {degreeRankImage && (
          <image
            href={degreeRankImage}
            x={isWorldLinkDegree ? 0 : sub ? 30 : 190}
            y={isWorldLinkDegree ? 0 : sub ? 42 : 0}
            width={isWorldLinkDegree ? (sub ? 180 : 380) : sub ? 120 : 150}
            height={isWorldLinkDegree ? 80 : sub ? 38 : 78}
          />
        )}
      </Svg>
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
