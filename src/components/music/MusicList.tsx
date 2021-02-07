import {
  Button,
  ButtonGroup,
  Grid,
  Paper,
  Typography,
  Container,
  Collapse,
  FormControl,
  MenuItem,
  Select,
  Chip,
} from "@material-ui/core";
import { useLayoutStyles } from "../../styles/layout";
import { ViewAgenda, Sort, SortOutlined } from "@material-ui/icons";
import {
  Filter,
  FilterOutline,
  ViewAgendaOutline,
  ViewGrid,
  ViewGridOutline,
} from "mdi-material-ui";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { musicTagToName, useCachedData } from "../../utils";
import InfiniteScroll from "../subs/InfiniteScroll";

import { useTranslation } from "react-i18next";
import { useInteractiveStyles } from "../../styles/interactive";
import GridView from "./GridView";
import AgendaView from "./AgendaView";
import { IMusicInfo, IMusicTagInfo } from "../../types";

type ViewGridType = "grid" | "agenda" | "comfy";

function getPaginatedMusics(musics: IMusicInfo[], page: number, limit: number) {
  return musics.slice(limit * (page - 1), limit * page);
}

const ListCard: { [key: string]: React.FC<{ data?: IMusicInfo }> } = {
  grid: GridView,
  agenda: AgendaView,
};

const MusicList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  const [musicsCache] = useCachedData<IMusicInfo>("musics");
  const [musicTags] = useCachedData<IMusicTagInfo>("musicTags");

  const [musics, setMusics] = useState<IMusicInfo[]>([]);
  const [sortedCache, setSortedCache] = useState<IMusicInfo[]>([]);
  const [viewGridType, setViewGridType] = useState<ViewGridType>(
    (localStorage.getItem("music-list-grid-view-type") ||
      "grid") as ViewGridType
  );
  const [page, setPage] = useState<number>(0);
  const [limit] = useState<number>(12);
  // const [, totalMusicsRef, setTotalMusics] = useState<number>(0);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
  const [sortType, setSortType] = useState<string>(
    localStorage.getItem("music-list-filter-sort-type") || "asc"
  );
  const [sortBy, setSortBy] = useState<string>(
    localStorage.getItem("music-list-filter-sort-by") || "id"
  );
  const [musicTag, setMusicTag] = useState<string>("all");
  const [musicMVType, setMusicMVType] = useState<string>("");

  useEffect(() => {
    document.title = t("title:musicList");
  }, [t]);

  useEffect(() => {
    setIsReady(Boolean(musicsCache));
  }, [setIsReady, musicsCache]);

  useEffect(() => {
    if (musicsCache && musicTags) {
      let result = [...musicsCache];
      // do filter
      if (musicTag) {
        result = result.filter((c) =>
          musicTags
            .filter((mt) => mt.musicId === c.id)!
            .some((mt) => musicTag === mt.musicTag)
        );
      }
      if (musicMVType) {
        result = result.filter((c) => c.categories.includes(musicMVType));
      }
      // sort musics cache
      switch (sortBy) {
        case "id":
        case "publishedAt":
          result = result.sort((a, b) =>
            sortType === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
          );
          break;
      }
      setSortedCache(result);
      setMusics([]);
      setPage(0);
    }
  }, [
    musicsCache,
    sortBy,
    sortType,
    setPage,
    setSortedCache,
    musicTags,
    musicTag,
    musicMVType,
  ]);

  useEffect(() => {
    if (sortedCache.length) {
      setMusics((musics) => [
        ...musics,
        ...getPaginatedMusics(sortedCache, page, limit),
      ]);
      setLastQueryFin(true);
    }
  }, [page, limit, setLastQueryFin, sortedCache]);

  const callback = useCallback(
    (
      entries: readonly IntersectionObserverEntry[],
      setHasMore: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (!isReady) return;
      if (
        entries[0].isIntersecting &&
        lastQueryFin &&
        (!sortedCache.length || sortedCache.length > page * limit)
      ) {
        setPage((page) => page + 1);
        setLastQueryFin(false);
      } else if (sortedCache.length && sortedCache.length <= page * limit) {
        setHasMore(false);
      }
    },
    [isReady, lastQueryFin, limit, page, sortedCache.length]
  );

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:music")}
      </Typography>
      <Container className={layoutClasses.content}>
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
          <Paper className={interactiveClasses.container}>
            <Grid container direction="column" spacing={1}>
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justify="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:music_tag.caption")}
                  </Typography>
                </Grid>
                <Grid item container xs={12} md={11} spacing={1}>
                  {[
                    "all",
                    "vocaloid",
                    "theme_park",
                    "street",
                    "idol",
                    "school_refusal",
                    "light_music_club",
                    "other",
                  ].map((tag) => (
                    <Grid key={tag} item>
                      <Chip
                        clickable
                        color={musicTag === tag ? "primary" : "default"}
                        label={musicTagToName[tag]}
                        onClick={() => {
                          setMusicTag(tag);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justify="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:music_mv.caption")}
                  </Typography>
                </Grid>
                <Grid item container xs={12} md={11} spacing={1}>
                  {["mv", "mv_2d", "original", "image"].map((cat) => (
                    <Grid key={cat} item>
                      <Chip
                        clickable
                        color={musicMVType === cat ? "primary" : "default"}
                        label={t(`music:categoryType.${cat}`)}
                        onClick={() => {
                          musicMVType === cat
                            ? setMusicMVType("")
                            : setMusicMVType(cat);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justify="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:sort.caption")}
                  </Typography>
                </Grid>
                <Grid item container xs={12} md={11} spacing={1}>
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
                        style={{ minWidth: "100px" }}
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
                        style={{ minWidth: "100px" }}
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
          </Paper>
        </Collapse>
        <InfiniteScroll<IMusicInfo>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={musics}
          gridSize={
            ({
              grid: {
                xs: 12,
                sm: 6,
                md: 4,
                lg: 3,
              },
              agenda: {
                xs: 12,
              },
              comfy: {
                xs: 12,
              },
            } as const)[viewGridType]
          }
        />
      </Container>
    </Fragment>
  );
};

export default MusicList;
