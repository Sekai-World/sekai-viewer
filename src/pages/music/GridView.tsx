import { Card, CardContent, Typography, CardMedia, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import { IMusicInfo } from "../../types.d";
import { getRemoteAssetURL, useServerRegion } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import SpoilerTag from "../../components/widgets/SpoilerTag";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "75%",
    position: "relative",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  header: {
    // "white-space": "nowrap",
    // overflow: "hidden",
    // "text-overflow": "ellipsis",
  },
}));

const GridView: React.FC<{ data?: IMusicInfo }> = ({ data }) => {
  const classes = useStyles();
  const { path } = useRouteMatch();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const [region] = useServerRegion();

  const [jacket, setJacket] = useState<string>("");

  useEffect(() => {
    if (data)
      getRemoteAssetURL(
        `music/jacket/${data.assetbundleName}_rip/${data.assetbundleName}.webp`,
        setJacket,
        window.isChinaMainland ? "cn" : "ww",
        region
      );
  }, [data, region]);

  if (!data) {
    // loading
    return (
      <Card className={classes.card}>
        <Skeleton variant="rectangular" className={classes.media}></Skeleton>
        <CardContent>
          <Typography variant="subtitle1" className={classes.header}>
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
    <Link to={path + "/" + data.id} style={{ textDecoration: "none" }}>
      <Card className={classes.card}>
        <CardMedia
          className={classes.media}
          image={jacket}
          title={getTranslated(`music_titles:${data.id}`, data.title)}
        >
          <SpoilerTag
            style={{
              position: "absolute",
              top: "1%",
              left: "1%",
            }}
            releaseTime={new Date(data.publishedAt)}
          />
        </CardMedia>
        <CardContent style={{ paddingBottom: "16px" }}>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <ContentTrans
                contentKey={`music_titles:${data.id}`}
                original={data.title}
                originalProps={{
                  variant: "subtitle1",
                  className: classes.header,
                }}
                translatedProps={{
                  variant: "subtitle1",
                  className: classes.header,
                }}
              />
            </Grid>
            <Grid item>
              <Typography variant="body2" color="textSecondary">
                {data.categories
                  .map((cat) => t(`music:categoryType.${cat}`))
                  .join(", ")}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Link>
  );
};

export default GridView;
