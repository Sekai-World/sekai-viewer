import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  makeStyles,
  Paper,
  Typography,
  Container,
  Collapse,
  FormControl,
  MenuItem,
  Select,
} from "@material-ui/core";
import { useLayoutStyles } from "../styles/layout";
import { ViewAgenda, Sort, SortOutlined } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import {
  Filter,
  FilterOutline,
  ViewAgendaOutline,
  ViewGrid,
  ViewGridOutline,
} from "mdi-material-ui";
import React, { Fragment, useEffect, useState } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import {
  ContentTransModeType,
  IMusicDifficultyInfo,
  IMusicInfo,
} from "../types";
import { musicCategoryToName, useCachedData, useRefState } from "../utils";
import InfiniteScroll from "./subs/InfiniteScroll";

import { useTranslation } from "react-i18next";
import { useFilterStyles } from "../styles/filter";
import { getAssetI18n } from "../utils/i18n";

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
  "grid-out": {
    padding: theme.spacing("1%", "2%"),
  },
}));

function getPaginatedMusics(musics: IMusicInfo[], page: number, limit: number) {
  return musics.slice(limit * (page - 1), limit * page);
}

const MusicList: React.FC<{
  contentTransMode: ContentTransModeType;
}> = ({ contentTransMode }) => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const filterClasses = useFilterStyles();
  const { path } = useRouteMatch();
  const { t } = useTranslation();
  const assetI18n = getAssetI18n();

  const [musicsCache] = useCachedData<IMusicInfo>("musics");
  const [musicDiffis] = useCachedData<IMusicDifficultyInfo>(
    "musicDifficulties"
  );

  const [musics, setMusics] = useState<IMusicInfo[]>([]);
  const [sortedCache, sortedCacheRef, setSortedCache] = useRefState<
    IMusicInfo[]
  >([]);
  const [viewGridType, setViewGridType] = useState<string>(
    localStorage.getItem("music-list-grid-view-type") || "grid"
  );
  const [page, pageRef, setPage] = useRefState<number>(0);
  const [limit, limitRef] = useRefState<number>(12);
  // const [, totalMusicsRef, setTotalMusics] = useRefState<number>(0);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
  const [sortType, setSortType] = useState<string>(
    localStorage.getItem("music-list-filter-sort-type") || "asc"
  );
  const [sortBy, setSortBy] = useState<string>(
    localStorage.getItem("music-list-filter-sort-by") || "id"
  );

  useEffect(() => {
    document.title = "Music List | Sekai Viewer";
  }, []);

  useEffect(() => {
    setIsReady(Boolean(musicsCache.length));
  }, [setIsReady, musicsCache]);

  useEffect(() => {
    if (musicsCache.length) {
      // temporarily sort cards cache
      switch (sortBy) {
        case "id":
        case "publishedAt":
          setSortedCache(
            [...musicsCache].sort((a, b) =>
              sortType === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
            )
          );
          break;
      }
      setMusics([]);
      setPage(0);
    }
  }, [musicsCache, sortBy, sortType, setPage, setSortedCache]);

  useEffect(() => {
    if (sortedCache.length) {
      setMusics((musics) => [
        ...musics,
        ...getPaginatedMusics(sortedCache, page, limit),
      ]);
      setLastQueryFin(true);
    }
  }, [page, limit, setLastQueryFin, sortedCache]);

  const callback = (
    entries: IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!sortedCacheRef.current.length ||
        sortedCacheRef.current.length > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      sortedCacheRef.current.length &&
      sortedCacheRef.current.length <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

  const ListCard: { [key: string]: React.FC<{ data?: IMusicInfo }> } = {
    grid: ({ data }) => {
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
              image={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/jacket/${data.assetbundleName}_rip/${data.assetbundleName}.webp`}
              title={
                contentTransMode === "original"
                  ? data.title
                  : contentTransMode === "translated"
                  ? assetI18n.t(`music_titles:${data.id}`)
                  : data.title
              }
            ></CardMedia>
            <CardContent style={{ paddingBottom: "16px" }}>
              <Typography variant="subtitle1" className={classes.header}>
                {contentTransMode === "original"
                  ? data.title
                  : contentTransMode === "translated"
                  ? assetI18n.t(`music_titles:${data.id}`)
                  : data.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {data.categories
                  .map((cat) => musicCategoryToName[cat] || cat)
                  .join(", ")}
              </Typography>
            </CardContent>
          </Card>
        </Link>
      );
    },
    agenda: ({ data }) => {
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
                  <Grid
                    item
                    container
                    direction="row"
                    style={{ marginTop: "5%" }}
                  >
                    <Skeleton
                      variant="rect"
                      width="75%"
                      height="24px"
                    ></Skeleton>
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
            <Grid
              container
              alignItems="center"
              spacing={2}
              justify="space-between"
            >
              <Grid item xs={5} md={4}>
                <CardMedia
                  className={classes.agendaMedia}
                  image={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/jacket/${data.assetbundleName}_rip/${data.assetbundleName}.webp`}
                  title={
                    contentTransMode === "original"
                      ? data.title
                      : contentTransMode === "translated"
                      ? assetI18n.t(`music_titles:${data.id}`)
                      : data.title
                  }
                ></CardMedia>
              </Grid>
              <Grid item xs={6} md={7} container direction="column">
                <Grid item>
                  <Typography variant="body1">
                    {contentTransMode === "original"
                      ? data.title
                      : contentTransMode === "translated"
                      ? assetI18n.t(`music_titles:${data.id}`)
                      : data.title}
                  </Typography>
                  <Typography color="textSecondary">
                    {data.categories
                      .map((cat) => musicCategoryToName[cat] || cat)
                      .join(", ")}
                  </Typography>
                </Grid>
                <Grid
                  item
                  container
                  direction="row"
                  style={{ marginTop: "5%" }}
                >
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
        </Link>
      );
    },
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:music")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid container justify="space-between">
          <ButtonGroup style={{ marginBottom: "1%" }}>
            <Button
              // variant={viewGridType === "grid" ? "outlined" : "contained"}
              onClick={() => {
                setViewGridType("grid");
                localStorage.setItem("music-list-grid-view-type", "grid");
              }}
              color={viewGridType === "grid" ? "primary" : "default"}
            >
              {viewGridType === "grid" ? (
                <ViewGrid></ViewGrid>
              ) : (
                <ViewGridOutline></ViewGridOutline>
              )}
            </Button>
            <Button
              // variant={viewGridType === "agenda" ? "outlined" : "contained"}
              onClick={() => {
                setViewGridType("agenda");
                localStorage.setItem("music-list-grid-view-type", "agenda");
              }}
              color={viewGridType === "agenda" ? "primary" : "default"}
            >
              {viewGridType === "agenda" ? (
                <ViewAgenda></ViewAgenda>
              ) : (
                <ViewAgendaOutline></ViewAgendaOutline>
              )}
            </Button>
            {/* <Button
              variant={viewGridType === "comfy" ? "outlined" : "contained"}
              onClick={() => setViewGridType("comfy")}
            >
              <ViewComfy></ViewComfy>
            </Button> */}
          </ButtonGroup>
          <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
            <Button size="medium" onClick={() => setFilterOpened((v) => !v)}>
              {filterOpened ? <Filter /> : <FilterOutline />}
              {filterOpened ? <Sort /> : <SortOutlined />}
            </Button>
          </ButtonGroup>
        </Grid>
        <Collapse in={filterOpened}>
          <Grid container className={filterClasses.filterArea}>
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justify="space-between"
            >
              <Grid item xs={12} md={2}>
                <Typography classes={{ root: filterClasses.filterCaption }}>
                  {t("filter:sort.caption")}
                </Typography>
              </Grid>
              <Grid item container xs={12} md={9} spacing={1}>
                <Grid item>
                  <FormControl>
                    <Select
                      value={sortType}
                      onChange={(e) => {
                        setSortType(e.target.value as string);
                        localStorage.setItem(
                          "music-list-filter-sort-type",
                          e.target.value as string
                        );
                      }}
                    >
                      <MenuItem value="asc">
                        {t("filter:sort.ascending")}
                      </MenuItem>
                      <MenuItem value="desc">
                        {t("filter:sort.descending")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl>
                    <Select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as string);
                        localStorage.setItem(
                          "music-list-filter-sort-by",
                          e.target.value as string
                        );
                      }}
                    >
                      <MenuItem value="id">{t("common:id")}</MenuItem>
                      <MenuItem value="publishedAt">
                        {t("common:startAt")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Collapse>
        {InfiniteScroll<IMusicInfo>({
          viewComponent: ListCard[viewGridType],
          callback,
          data: musics,
          gridSize: {
            xs: 12,
            sm: 6,
            md:
              viewGridType === "grid" ? 4 : viewGridType === "agenda" ? 12 : 12,
          },
        })}
      </Container>
    </Fragment>
  );
};

export default MusicList;
