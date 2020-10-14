import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardMedia,
  Chip,
  Grid,
  makeStyles,
  Paper,
  Typography,
  Container,
} from "@material-ui/core";
import { useLayoutStyles } from "../styles/layout";
import { ViewAgenda, Sort } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { Filter, ViewGrid } from "mdi-material-ui";
import React, { Fragment, useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { IMusicDifficultyInfo, IMusicInfo } from "../types";
import { musicCategoryToName, useCachedData, useRefState } from "../utils";
import InfiniteScroll from "./subs/InfiniteScroll";

import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "75%",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  header: {
    "white-space": "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis",
    [theme.breakpoints.down("md")]: {
      "max-width": "200px",
    },
    "max-width": "250px",
  },
  agenda: {
    padding: "2% 0",
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
  agendaMedia: {
    paddingTop: "75%",
    backgroundSize: "contain",
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
  "grid-out": {
    padding: theme.spacing("1%", "2%"),
  },
}));

function getPaginitedMusics(musics: IMusicInfo[], page: number, limit: number) {
  return musics.slice(limit * (page - 1), limit * page);
}

const MusicList: React.FC<any> = () => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const { push } = useHistory();
  const { path } = useRouteMatch();
  const { t } = useTranslation();

  const [musics, setMusics] = useState<IMusicInfo[]>([]);
  // const [musicsCache, setMusicsCache] = useState<IMusicInfo[]>([]);
  // const [musicsCache, musicsCacheRef] = useMusics();
  const [musicsCache, musicsCacheRef] = useCachedData<IMusicInfo>("musics");
  const [musicDiffis] = useCachedData<IMusicDifficultyInfo>(
    "musicDifficulties"
  );

  const [viewGridType, setViewGridType] = useState<string>(
    localStorage.getItem("music-list-grid-view-type") || "grid"
  );
  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef] = useRefState<number>(12);
  // const [, totalMusicsRef, setTotalMusics] = useRefState<number>(0);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

  useEffect(() => {
    document.title = "Music List | Sekai Viewer";
  }, []);

  useEffect(() => {
    setMusics((musics) => [
      ...musics,
      ...getPaginitedMusics(musicsCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, musicsCache]);

  useEffect(() => {
    setIsReady(Boolean(musicsCache.length));
  }, [setIsReady, musicsCache]);

  const callback = (
    entries: IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!musicsCacheRef.current.length ||
        musicsCacheRef.current.length > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      musicsCacheRef.current.length &&
      musicsCacheRef.current.length <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

  const ListCard: { [key: string]: React.FC<{ data: IMusicInfo }> } = {
    grid: ({ data }) => {
      return (
        <Card
          className={classes.card}
          onClick={() => push(path + "/" + data.id)}
        >
          <CardHeader
            title={data.title}
            titleTypographyProps={{
              variant: "subtitle1",
              classes: {
                root: classes.header,
              },
            }}
            subheader={
              data.categories.map(cat => musicCategoryToName[cat] || cat).join(', ')
            }
          ></CardHeader>
          <CardMedia
            className={classes.media}
            image={`https://sekai-res.dnaroma.eu/file/sekai-assets/music/jacket/${data.assetbundleName}_rip/${data.assetbundleName}.webp`}
            title={data.title}
          ></CardMedia>
        </Card>
      );
    },
    agenda: ({ data }) => {
      return (
        <Paper
          className={classes.agenda}
          onClick={() => push(path + "/" + data.id)}
        >
          <Grid
            container
            alignItems="center"
            spacing={2}
            justify="space-between"
          >
            <Grid item xs={5} md={4}>
              <CardMedia
                className={classes.agendaMedia}
                image={`https://sekai-res.dnaroma.eu/file/sekai-assets/music/jacket/${data.assetbundleName}_rip/${data.assetbundleName}.webp`}
                title={data.title}
              ></CardMedia>
              {/* <img src={`https://sekai-res.dnaroma.eu/file/sekai-assets/music/jacket/${data.assetbundleName}_rip/${data.assetbundleName}.webp`} alt={data.title}></img> */}
            </Grid>
            <Grid item xs={6} md={7} container direction="column">
              <Grid item>
                <Typography variant="body1">{data.title}</Typography>
                <Typography color="textSecondary">
                  {data.categories.map(cat => musicCategoryToName[cat] || cat).join(', ')}
                </Typography>
              </Grid>
              <Grid item container direction="row" style={{ marginTop: "5%" }}>
                {musicDiffis
                  .filter((elem) => elem.musicId === data.id)
                  .map((elem) => (
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
        </Paper>
      );
    },
  };

  const ListLoading: React.FC<any> = () => {
    return (
      <Card className={classes.card}>
        <CardHeader
          title={<Skeleton variant="text" width="50%"></Skeleton>}
          subheader={<Skeleton variant="text" width="80%"></Skeleton>}
        ></CardHeader>
        <Skeleton variant="rect" height={130}></Skeleton>
      </Card>
    );
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:music")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid container justify="space-between">
          <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
            <Button
              variant={viewGridType === "grid" ? "outlined" : "contained"}
              onClick={() => {
                setViewGridType("grid");
                localStorage.setItem("music-list-grid-view-type", "grid");
              }}
            >
              <ViewGrid></ViewGrid>
            </Button>
            <Button
              variant={viewGridType === "agenda" ? "outlined" : "contained"}
              onClick={() => {
                setViewGridType("agenda");
                localStorage.setItem("music-list-grid-view-type", "agenda");
              }}
            >
              <ViewAgenda></ViewAgenda>
            </Button>
            {/* <Button
              variant={viewGridType === "comfy" ? "outlined" : "contained"}
              onClick={() => setViewGridType("comfy")}
            >
              <ViewComfy></ViewComfy>
            </Button> */}
          </ButtonGroup>
          <ButtonGroup color="primary" style={{ marginBottom: "1%" }} disabled>
            <Button variant="contained" size="medium">
              <Filter />
              <Sort />
            </Button>
          </ButtonGroup>
        </Grid>
        {InfiniteScroll<IMusicInfo>({
          viewComponent: ListCard[viewGridType],
          loadingComponent: ListLoading,
          callback,
          data: musics,
          gridSize: {
            xs: 12,
            md: viewGridType === "grid" ? 4 : viewGridType === "agenda" ? 12 : 12,
          },
        })}
      </Container>
    </Fragment>
  );
};

export default MusicList;
