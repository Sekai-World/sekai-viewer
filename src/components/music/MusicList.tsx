import {
  Button,
  Grid,
  Paper,
  Typography,
  Container,
  Collapse,
  FormControl,
  MenuItem,
  Select,
  Chip,
  Badge,
} from "@material-ui/core";
import { useLayoutStyles } from "../../styles/layout";
import { ViewAgenda, Sort, SortOutlined, RotateLeft } from "@material-ui/icons";
import {
  Filter,
  FilterOutline,
  ViewAgendaOutline,
  ViewGrid,
  ViewGridOutline,
} from "mdi-material-ui";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCachedData, useLocalStorage, useMusicTagName } from "../../utils";
import InfiniteScroll from "../subs/InfiniteScroll";

import { useTranslation } from "react-i18next";
import { useInteractiveStyles } from "../../styles/interactive";
import GridView from "./GridView";
import AgendaView from "./AgendaView";
import { IMusicInfo, IMusicTagInfo } from "../../types";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { SettingContext } from "../../context";

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
  const { contentTransMode } = useContext(SettingContext)!;
  const musicTagToName = useMusicTagName(contentTransMode);

  const [musicsCache] = useCachedData<IMusicInfo>("musics");
  const [musicTags] = useCachedData<IMusicTagInfo>("musicTags");

  const [musics, setMusics] = useState<IMusicInfo[]>([]);
  const [sortedCache, setSortedCache] = useState<IMusicInfo[]>([]);
  const [viewGridType, setViewGridType] = useLocalStorage<ViewGridType>(
    "music-list-grid-view-type",
    "grid"
  );
  const [page, setPage] = useState<number>(0);
  const [limit] = useState<number>(12);
  // const [, totalMusicsRef, setTotalMusics] = useState<number>(0);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
  const [sortType, setSortType] = useLocalStorage<string>(
    "music-list-filter-sort-type",
    "asc"
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "music-list-filter-sort-by",
    "id"
  );
  const [musicTag, setMusicTag] = useLocalStorage<string>(
    "music-list-filter-tag",
    "all"
  );
  const [musicMVType, setMusicMVType] = useLocalStorage<string>(
    "music-list-filter-mv-type",
    ""
  );

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
        <Grid
          container
          justify="space-between"
          style={{ marginBottom: "0.5rem" }}
        >
          <Grid item>
            <ToggleButtonGroup
              value={viewGridType}
              color="primary"
              exclusive
              onChange={(_, gridType) => {
                setViewGridType(gridType as "grid");
              }}
            >
              <ToggleButton value="grid">
                {viewGridType === "grid" ? (
                  <ViewGrid></ViewGrid>
                ) : (
                  <ViewGridOutline></ViewGridOutline>
                )}
              </ToggleButton>
              <ToggleButton value="agenda">
                {viewGridType === "agenda" ? (
                  <ViewAgenda></ViewAgenda>
                ) : (
                  <ViewAgendaOutline></ViewAgendaOutline>
                )}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Badge
            color="secondary"
            variant="dot"
            invisible={musicTag === "all" && !musicMVType}
          >
            <Button
              variant="outlined"
              onClick={() => setFilterOpened((v) => !v)}
            >
              {filterOpened ? <Filter /> : <FilterOutline />}
              {filterOpened ? <Sort /> : <SortOutlined />}
            </Button>
          </Badge>
        </Grid>
        <Collapse in={filterOpened}>
          <Paper className={interactiveClasses.container}>
            <Grid container direction="column" spacing={2}>
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
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
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
                          label={musicTagToName[tag as "all"]}
                          onClick={() => {
                            if (musicTag === tag) setMusicTag("all");
                            else setMusicTag(tag);
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
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
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
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
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <FormControl>
                        <Select
                          value={sortType}
                          onChange={(e) => {
                            setSortType(e.target.value as string);
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
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                // justify="space-between"
                spacing={1}
              >
                <Grid item xs={false} md={1}></Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={musicTag === "all" && !musicMVType}
                    onClick={() => {
                      setMusicTag("all");
                      setMusicMVType("");
                    }}
                    startIcon={<RotateLeft />}
                  >
                    {t("common:reset")}
                  </Button>
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
