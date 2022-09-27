import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  IResourceBoxInfo,
  IHonorInfo,
  IHonorGroup,
  ResourceBoxDetail,
} from "../../types.d";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { degreeFrameMap, degreeFramSubMap } from "../../utils/resources";
import degreeLevelIcon from "../../assets/frame/icon_degreeLv.png";
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
    const [honors] = useCachedData<IHonorInfo>("honors");
    const [honorGroups] = useCachedData<IHonorGroup>("honorGroups");

    const [honor, setHonor] = useState<IHonorInfo>();
    const [honorGroup, setHonorGroup] = useState<IHonorGroup>();
    const [honorLevel, setHonorLevel] = useState(_honorLevel);
    const [degreeImage, setDegreeImage] = useState<string>("");
    const [degreeRankImage, setDegreeRankImage] = useState<string>("");

    useEffect(() => {
      if (resourceBoxes && honors) {
        let honorDetail: ResourceBoxDetail | undefined;
        if (resourceBoxId) {
          const honorBox = resourceBoxes.find(
            (resBox) =>
              resBox.resourceBoxPurpose === type! && resBox.id === resourceBoxId
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
    }, [honors, resourceBoxes, resourceBoxId, type, honorId]);

    useEffect(() => {
      if (honor && honorGroups) {
        setHonorGroup(honorGroups.find((hg) => hg.id === honor.groupId));
      }
    }, [honor, honorGroups]);

    useEffect(() => {
      if (honor) {
        if (honorGroup && honorGroup.honorType === "rank_match") {
          getRemoteAssetURL(
            `rank_live/honor/${
              honorGroup.backgroundAssetbundleName
            }_rip/degree_${sub ? "sub" : "main"}.webp`,
            setDegreeImage,
            window.isChinaMainland ? "cn" : "minio",
            region
          );
        } else if (honorGroup && honorGroup.backgroundAssetbundleName) {
          getRemoteAssetURL(
            `honor/${honorGroup.backgroundAssetbundleName}_rip/degree_${
              sub ? "sub" : "main"
            }.webp`,
            setDegreeImage,
            window.isChinaMainland ? "cn" : "minio",
            region
          );
        } else if (honor.assetbundleName)
          getRemoteAssetURL(
            `honor/${honor.assetbundleName}_rip/degree_${
              sub ? "sub" : "main"
            }.webp`,
            setDegreeImage,
            window.isChinaMainland ? "cn" : "minio",
            region
          );
        if (type === "event_ranking_reward")
          getRemoteAssetURL(
            `honor/${honor.assetbundleName}_rip/rank_${
              sub ? "sub" : "main"
            }.webp`,
            setDegreeRankImage,
            window.isChinaMainland ? "cn" : "minio",
            region
          );
        else if (honorGroup && honorGroup.honorType === "rank_match")
          getRemoteAssetURL(
            `rank_live/honor/${honor.assetbundleName}_rip/${
              sub ? "sub" : "main"
            }.webp`,
            setDegreeRankImage,
            window.isChinaMainland ? "cn" : "minio",
            region
          );
        else if (
          honor.name.match(/^TOP.*/) ||
          honor.name.match(/.*位$/) ||
          honor.name.match(/第\d+名/)
        )
          getRemoteAssetURL(
            `honor/${honor.assetbundleName}_rip/rank_${
              sub ? "sub" : "main"
            }.webp`,
            setDegreeRankImage,
            window.isChinaMainland ? "cn" : "minio",
            region
          );
      }
      return () => {
        setDegreeRankImage("");
      };
    }, [honor, honorGroup, region, sub, type]);

    return honor === undefined ? null : !!honor ? (
      <Svg style={style}>
        <svg
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
          {/* rank */}
          {degreeRankImage && (
            <image
              href={degreeRankImage}
              x={sub ? 30 : 190}
              y={sub ? 42 : 0}
              width={sub ? 120 : 150}
              height={sub ? 38 : 78}
            />
          )}
        </svg>
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
