import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import { SettingContext } from "../../context";
import { IMusicInfo } from "../../types";
import { getRemoteAssetURL } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import { ContentTrans } from "../subs/ContentTrans";
import SpoilerTag from "../subs/SpoilerTag";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "75%",
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
  const { contentTransMode } = useContext(SettingContext)!;

  const [jacket, setJacket] = useState<string>("");

  useEffect(() => {
    if (data)
      getRemoteAssetURL(
        `music/jacket/${data.assetbundleName}_rip/${data.assetbundleName}.webp`,
        setJacket,
        window.isChinaMainland
      );
  }, [data]);

  if (!data) {
    // loading
    return (
      <Card className={classes.card}>
        <Skeleton variant="rect" className={classes.media}></Skeleton>
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
          title={getTranslated(
            contentTransMode,
            `music_titles:${data.id}`,
            data.title
          )}
        ></CardMedia>
        <CardContent style={{ paddingBottom: "16px" }}>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <SpoilerTag releaseTime={new Date(data.publishedAt)} />
            </Grid>
            <Grid item>
              <ContentTrans
                mode={contentTransMode}
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
