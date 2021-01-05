import {
  Typography,
  CardMedia,
  Grid,
  makeStyles,
  Paper,
  Box,
  Chip,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import { SettingContext } from "../../context";
import { IMusicDifficultyInfo, IMusicInfo } from "../../types";
import { getRemoteAssetURL, useCachedData } from "../../utils";
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
  agendaWrapper: {
    display: "block",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "300px",
    },
    // [theme.breakpoints.only("md")]: {
    //   maxWidth: "600px",
    // },
    maxWidth: "70%",
    margin: "auto",
    cursor: "pointer",
  },
  agenda: {
    padding: "2% 0",
  },
  agendaMedia: {
    paddingTop: "75%",
    backgroundSize: "contain",
  },
  agendaMediaSkeleton: {
    position: "absolute",
    top: "0",
    left: "12.5%",
    width: "75%",
    height: "100%",
  },
  "diffi-easy": {
    backgroundColor: "#66DD11",
  },
  "diffi-normal": {
    backgroundColor: "#33BBEE",
  },
  "diffi-hard": {
    backgroundColor: "#FFAA00",
  },
  "diffi-expert": {
    backgroundColor: "#EE4466",
  },
  "diffi-master": {
    backgroundColor: "#BB33EE",
  },
}));

const AgendaView: React.FC<{ data?: IMusicInfo }> = ({ data }) => {
  const classes = useStyles();
  const { path } = useRouteMatch();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;

  const [musicDiffis] = useCachedData<IMusicDifficultyInfo>(
    "musicDifficulties"
  );

  const [jacket, setJacket] = useState<string>("");
  const [diffis, setDiffis] = useState<IMusicDifficultyInfo[]>([]);

  useEffect(() => {
    if (data)
      getRemoteAssetURL(
        `music/jacket/${data.assetbundleName}_rip/${data.assetbundleName}.webp`,
        setJacket,
        window.isChinaMainland
      );
  }, [data]);

  useEffect(() => {
    if (data && musicDiffis.length) {
      setDiffis(musicDiffis.filter((elem) => elem.musicId === data.id));
    }
  }, [musicDiffis, data]);

  if (!data) {
    // loading
    return (
      <Box className={classes.agendaWrapper}>
        <Paper className={classes.agenda}>
          <Grid
            container
            alignItems="center"
            spacing={2}
            justify="space-between"
          >
            <Grid item xs={5} md={4}>
              <Box
                className={classes.agendaMedia}
                style={{ position: "relative" }}
              >
                <Skeleton
                  variant="rect"
                  className={classes.agendaMediaSkeleton}
                ></Skeleton>
              </Box>
            </Grid>
            <Grid item xs={6} md={7} container direction="column">
              <Grid item>
                <Typography variant="body1">
                  <Skeleton variant="text" width="60%"></Skeleton>
                </Typography>
                <Typography color="textSecondary">
                  <Skeleton variant="text" width="30%"></Skeleton>
                </Typography>
              </Grid>
              <Grid item container direction="row" style={{ marginTop: "5%" }}>
                <Skeleton variant="rect" width="75%" height="24px"></Skeleton>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }
  return (
    <Link
      to={path + "/" + data.id}
      className={classes.agendaWrapper}
      style={{ textDecoration: "none" }}
    >
      <Paper className={classes.agenda}>
        <Grid container alignItems="center" spacing={2} justify="space-between">
          <Grid item xs={5} md={4}>
            <CardMedia
              className={classes.agendaMedia}
              image={jacket}
              title={getTranslated(
                contentTransMode,
                `music_titles:${data.id}`,
                data.title
              )}
            ></CardMedia>
          </Grid>
          <Grid item xs={6} md={7}>
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
              <Grid item container direction="row" style={{ marginTop: "5%" }}>
                {diffis.map((elem) => (
                  <Grid item xs={4} md={2} key={`diff-${elem.id}`}>
                    <Chip
                      color="primary"
                      size="small"
                      classes={{
                        colorPrimary:
                          classes[
                            `diffi-${elem.musicDifficulty}` as
                              | "diffi-easy"
                              | "diffi-normal"
                              | "diffi-hard"
                              | "diffi-expert"
                              | "diffi-master"
                          ],
                      }}
                      label={elem.playLevel}
                    ></Chip>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Link>
  );
};

export default AgendaView;
