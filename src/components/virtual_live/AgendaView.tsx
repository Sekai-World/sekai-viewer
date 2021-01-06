import {
  makeStyles,
  Typography,
  CardMedia,
  Grid,
  Container,
  Paper,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import { SettingContext } from "../../context";
import { IVirtualLiveInfo } from "../../types";
import { getRemoteAssetURL } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import { ContentTrans } from "../subs/ContentTrans";
import SpoilerTag from "../subs/SpoilerTag";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "30%",
    width: "100%",
    backgroundSize: "contain",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  header: {
    // "white-space": "nowrap",
    // overflow: "hidden",
    // "text-overflow": "ellipsis",
    // [theme.breakpoints.down("md")]: {
    //   "max-width": "200px",
    // },
    // "max-width": "250px",
  },
  "grid-out": {
    margin: theme.spacing("1%", 0),
  },
}));

const GridView: React.FC<{ data?: IVirtualLiveInfo }> = ({ data }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { path } = useRouteMatch();
  const { contentTransMode } = useContext(SettingContext)!;

  const [virtualLiveLogo, setVirtualLiveLogo] = useState<string>("");

  useEffect(() => {
    if (data) {
      getRemoteAssetURL(
        `virtual_live/select/banner/${data.assetbundleName}_rip/${data.assetbundleName}.png`,
        setVirtualLiveLogo
      );
    }
  }, [data]);

  if (!data) {
    // loading
    return (
      <Container maxWidth="md" className={classes.card}>
        <Grid
          container
          spacing={2}
          component={Paper}
          className={classes["grid-out"]}
        >
          <Grid item xs={12} md={4} container alignItems="center">
            <Skeleton variant="rect" className={classes.media}></Skeleton>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container direction="column" spacing={1}>
              <Typography variant="subtitle1" className={classes.header}>
                <Skeleton variant="text" width="90%"></Skeleton>
              </Typography>
              <Typography variant="body2">
                <Skeleton variant="text" width="40%"></Skeleton>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    );
  }
  return (
    <Link to={path + "/" + data.id} style={{ textDecoration: "none" }}>
      <Container maxWidth="md" className={classes.card}>
        <Grid
          container
          spacing={2}
          component={Paper}
          className={classes["grid-out"]}
        >
          <Grid item xs={12} md={4} container alignItems="center">
            <CardMedia
              className={classes.media}
              image={virtualLiveLogo}
              title={getTranslated(
                contentTransMode,
                `virtualLive_name:${data.id}`,
                data.name
              )}
            ></CardMedia>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <SpoilerTag
                  releaseTime={
                    new Date(
                      data.virtualLiveSchedules[0]
                        ? data.virtualLiveSchedules[0].startAt
                        : data.startAt
                    )
                  }
                />
              </Grid>
              <Grid item>
                <ContentTrans
                  contentKey={`virtualLive_name:${data.id}`}
                  original={data.name}
                  originalProps={{
                    variant: "subtitle1",
                    className: classes.header,
                  }}
                />
              </Grid>
              <Grid item container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    {t(`virtual_live:type.${data.virtualLiveType}`)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="span"
                  >
                    {new Date(data.startAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="span"
                  >
                    ~
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="span"
                  >
                    {new Date(data.endAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Link>
  );
};

export default GridView;
