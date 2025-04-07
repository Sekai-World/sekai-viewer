import { Card, CardContent, Typography, CardMedia, Grid } from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import { IMusicInfo } from "../../types.d";
import { getRemoteAssetURL } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import SpoilerCard from "../../components/helpers/SpoilerCard";

const GridView: React.FC<{ data?: IMusicInfo }> = observer(({ data }) => {
  const { path } = useRouteMatch();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { region } = useRootStore();

  const [jacket, setJacket] = useState<string>("");

  useEffect(() => {
    if (data)
      getRemoteAssetURL(
        `music/jacket/${data.assetbundleName}/${data.assetbundleName}.webp`,
        setJacket,
        "minio",
        region
      );
  }, [data, region]);

  if (!data) {
    // loading
    return (
      <Card>
        <Skeleton
          variant="rectangular"
          sx={{
            paddingTop: "75%",
            position: "relative",
          }}
        ></Skeleton>
        <CardContent>
          <Typography variant="subtitle1">
            <Skeleton variant="text" width="90%"></Skeleton>
          </Typography>
          <Typography variant="body2">
            <Skeleton variant="text" width="40%"></Skeleton>
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <SpoilerCard
      releaseTime={new Date(data.publishedAt)}
      toPath={path + "/" + data.id}
    >
      <CardMedia
        image={jacket}
        title={getTranslated(`music_titles:${data.id}`, data.title)}
        sx={{
          paddingTop: "75%",
          position: "relative",
        }}
      ></CardMedia>
      <CardContent style={{ paddingBottom: "16px" }}>
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <ContentTrans
              contentKey={`music_titles:${data.id}`}
              original={data.title}
              originalProps={{
                variant: "subtitle1",
              }}
              translatedProps={{
                variant: "subtitle1",
              }}
            />
          </Grid>
          <Grid item>
            <Typography variant="body2" color="textSecondary">
              {data.categories
                .map((cat) =>
                  t(
                    `music:categoryType.${
                      typeof cat === "string" ? cat : cat.musicCategoryName
                    }`
                  )
                )
                .join(", ")}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </SpoilerCard>
  );
});

export default GridView;
