import React, { useEffect, useState } from "react";
import { Typography, Grid, Chip, Box } from "@mui/material";
import { Skeleton } from "@mui/material";
import { useHistory } from "react-router-dom";
import {
  IMysekaiFixtureInfo,
  IMysekaiFixtureGenre,
  IMysekaiFixtureTag,
} from "../../types";
import { useCachedData } from "../../utils";
import {
  IMysekaiBlueprint,
  IMysekaiBlueprintMaterialCost,
  IMysekaiTalkCondition,
  IMysekaiTalkConditionGroup,
  IMysekaiTalk,
  IMysekaiGameCharacterUnitGroups,
  IMysekaiMaterial,
  MysekaiDataContext,
} from "../../types";
import {
  getGenreName,
  getTagNames,
  getFixtureMaterialCost,
  getThumbnailURL,
  getSubGenreName,
} from "../../utils/mysekaiFixtureUtils";
import Image from "mui-image";
import AgendaBox from "../../components/styled/AgendaBox";
import AgendaPaper from "../../components/styled/AgendaPaper";
import { assetUrl } from "../../utils/urls";
import { observer } from "mobx-react-lite";

const AgendaView: React.FC<{
  data?: IMysekaiFixtureInfo;
}> = observer(({ data }) => {
  const history = useHistory();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [genres] = useCachedData<IMysekaiFixtureGenre>(
    "mysekaiFixtureMainGenres"
  );
  const [subGenres] = useCachedData<IMysekaiFixtureGenre>(
    "mysekaiFixtureSubGenres"
  );
  const [tags] = useCachedData<IMysekaiFixtureTag>("mysekaiFixtureTags");
  const [mySekaiMaterials] =
    useCachedData<IMysekaiMaterial>("mysekaiMaterials");

  // Additional data needed for computed fields
  const [blueprints] = useCachedData<IMysekaiBlueprint>("mysekaiBlueprints");
  const [materialCosts] = useCachedData<IMysekaiBlueprintMaterialCost>(
    "mysekaiBlueprintMysekaiMaterialCosts"
  );
  const [talkConditions] = useCachedData<IMysekaiTalkCondition>(
    "mysekaiCharacterTalkConditions"
  );
  const [talkConditionGroups] = useCachedData<IMysekaiTalkConditionGroup>(
    "mysekaiCharacterTalkConditionGroups"
  );
  const [talks] = useCachedData<IMysekaiTalk>("mysekaiCharacterTalks");
  const [characterGroups] = useCachedData<IMysekaiGameCharacterUnitGroups>(
    "mysekaiGameCharacterUnitGroups"
  );

  useEffect(() => {
    if (data) {
      getThumbnailURL(data, setThumbnailUrl);
    }
  }, [data]);

  // Create enhanced data context
  const enhancedDataContext: MysekaiDataContext = {
    blueprints,
    materialCosts,
    talkConditions,
    talkConditionGroups,
    talks,
    characterGroups,
  };

  if (!data) {
    return (
      <AgendaBox>
        <AgendaPaper>
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs={3} sm={2} md={1}>
              <Skeleton
                variant="rectangular"
                width="96px"
                height="96px"
              ></Skeleton>
            </Grid>
            <Grid item xs={9} sm={3} md={4}>
              <Typography variant="body1">
                <Skeleton variant="text" width="80%"></Skeleton>
              </Typography>
              <Typography variant="body2">
                <Skeleton variant="text" width="60%"></Skeleton>
              </Typography>
              <Typography variant="caption">
                <Skeleton variant="text" width="50%"></Skeleton>
              </Typography>
              <Typography variant="caption">
                <Skeleton variant="text" width="70%"></Skeleton>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={7} md={7}>
              <Skeleton variant="text" width="90%"></Skeleton>
              <Skeleton variant="text" width="90%"></Skeleton>
            </Grid>
          </Grid>
        </AgendaPaper>
      </AgendaBox>
    );
  }

  const genreName = getGenreName(data.mysekaiFixtureMainGenreId, genres);
  const subGenreName = getSubGenreName(
    data.mysekaiFixtureSubGenreId,
    subGenres
  );
  const tagNames = getTagNames(data.mysekaiFixtureTagGroup || {}, tags);
  const fixtureMaterialCosts = getFixtureMaterialCost(
    data,
    enhancedDataContext
  );

  return (
    <AgendaBox>
      <AgendaPaper
        onClick={() => history.push(`/mysekai/fixture/${data.id}`)}
        style={{ cursor: "pointer" }}
      >
        <Grid
          container
          alignItems="center"
          spacing={1}
          justifyContent="space-between"
        >
          <Grid item xs={3} sm={2} md={1}>
            <Image src={thumbnailUrl} alt={data.name} bgColor=""></Image>
          </Grid>
          <Grid item xs={10} sm={4} md={4}>
            <Grid container direction="column">
              <Grid item>
                <Typography
                  variant="subtitle1"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.2,
                  }}
                >
                  {data.name}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2" color="textSecondary">
                  {genreName}
                </Typography>
              </Grid>
              {subGenreName && (
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    {subGenreName}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item xs={10} sm={4} md={4}>
            {tagNames &&
              tagNames.length > 0 &&
              tagNames.map((tagName, index) => (
                <Chip
                  label={tagName}
                  size="small"
                  variant="outlined"
                  key={index}
                  sx={{
                    fontSize: "0.7rem",
                    height: "20px",
                    marginRight: "4px",
                    marginBottom: "4px",
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      padding: "0 6px",
                    },
                  }}
                />
              ))}
          </Grid>
          <Grid item xs={6} sm={3} md={3}>
            {fixtureMaterialCosts && fixtureMaterialCosts.length > 0 && (
              <Grid item>
                <Grid container spacing={0.5} alignItems="center">
                  {fixtureMaterialCosts.map(
                    (cost: IMysekaiBlueprintMaterialCost, index: number) => {
                      const { mysekaiMaterialId, quantity } = cost;

                      // Find material using mysekaiMaterialId
                      const material = mySekaiMaterials?.find(
                        (mat: IMysekaiMaterial) => mat.id === mysekaiMaterialId
                      );

                      // Use iconAssetbundleName if available, otherwise fall back to mysekaiMaterialId
                      const assetBundleName =
                        material?.iconAssetbundleName || mysekaiMaterialId;
                      const materialIconUrl = `${assetUrl.minio["jp"]}/mysekai/thumbnail/material/${assetBundleName}.webp`;

                      return (
                        <Grid item key={index} sx={{ marginRight: 0.5 }}>
                          <Box sx={{ textAlign: "center" }}>
                            <Image
                              src={materialIconUrl}
                              alt="material"
                              style={{ width: "32px", height: "32px" }}
                              bgColor=""
                            />
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ fontSize: "1rem", display: "block" }}
                            >
                              {quantity || 1}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    }
                  )}
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </AgendaPaper>
    </AgendaBox>
  );
});

export default AgendaView;
