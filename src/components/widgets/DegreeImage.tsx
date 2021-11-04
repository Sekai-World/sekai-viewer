import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSvgStyles } from "../../styles/svg";
import {
  IResourceBoxInfo,
  IHonorInfo,
  IHonorGroup,
  ResourceBoxDetail,
} from "../../types.d";
import { getRemoteAssetURL, useCachedData, useServerRegion } from "../../utils";
import { degreeFrameMap } from "../../utils/resources";
import degreeLevelIcon from "../../assets/frame/icon_degreeLv.png";

const DegreeImage: React.FC<
  {
    resourceBoxId?: number;
    honorId?: number;
    type?: string;
    honorLevel?: number;
  } & React.HTMLProps<HTMLDivElement>
> = ({ resourceBoxId, type, honorId, style, honorLevel: _honorLevel }) => {
  const classes = useSvgStyles();
  const [region] = useServerRegion();

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
      if (honorGroup && honorGroup.backgroundAssetbundleName) {
        getRemoteAssetURL(
          `honor/${honorGroup.backgroundAssetbundleName}_rip/degree_main.webp`,
          setDegreeImage,
          window.isChinaMainland ? "cn" : "ww",
          region
        );
      } else if (honor.assetbundleName)
        getRemoteAssetURL(
          `honor/${honor.assetbundleName}_rip/degree_main.webp`,
          setDegreeImage,
          window.isChinaMainland ? "cn" : "ww",
          region
        );
      if (type === "event_ranking_reward")
        getRemoteAssetURL(
          `honor/${honor.assetbundleName}_rip/rank_main.webp`,
          setDegreeRankImage,
          window.isChinaMainland ? "cn" : "ww",
          region
        );
      else if (
        honor.name.match(/^TOP.*/) ||
        honor.name.match(/.*位$/) ||
        honor.name.match(/第\d+名/)
      )
        getRemoteAssetURL(
          `honor/${honor.assetbundleName}_rip/rank_main.webp`,
          setDegreeRankImage,
          window.isChinaMainland ? "cn" : "ww",
          region
        );
    }
    return () => {
      setDegreeRankImage("");
    };
  }, [honor, honorGroup, region, type]);

  return honor === undefined ? null : !!honor ? (
    <div className={classes.svg}>
      <svg
        style={style}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 380 80"
      >
        <image href={degreeImage} x="0" y="0" height="80" width="380" />
        {/* frame */}
        <image
          href={degreeFrameMap[honor.honorRarity]}
          x="0"
          y="0"
          height="80"
          width="380"
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
          <image href={degreeRankImage} x="190" y="0" width="150" height="78" />
        )}
      </svg>
    </div>
  ) : (
    <Skeleton variant="rectangular" width="256" height="64"></Skeleton>
  );
};

export default DegreeImage;
