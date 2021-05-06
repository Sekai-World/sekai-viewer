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
  Avatar,
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
  useReducer,
  useState,
} from "react";
import { useCachedData, useLocalStorage, useMusicTagName } from "../../utils";
import InfiniteScroll from "../subs/InfiniteScroll";

import { useTranslation } from "react-i18next";
import { useInteractiveStyles } from "../../styles/interactive";
import GridView from "./GridView";
import AgendaView from "./AgendaView";
import {
  IMusicDifficultyInfo,
  IMusicInfo,
  IMusicTagInfo,
  IMusicVocalInfo,
  IOutCharaProfile,
} from "../../types";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { SettingContext } from "../../context";
import {
  attrSelectReducer,
  characterSelectReducer,
} from "../../stores/reducers";
import { charaIcons } from "../../utils/resources";
import { useCharaName } from "../../utils/i18n";

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
  const { contentTransMode, isShowSpoiler } = useContext(SettingContext)!;
  const musicTagToName = useMusicTagName(contentTransMode);
  const getCharaName = useCharaName();

  const [musicsCache] = useCachedData<IMusicInfo>("musics");
  const [musicTags] = useCachedData<IMusicTagInfo>("musicTags");
  const [musicVocals] = useCachedData<IMusicVocalInfo>("musicVocals");
  const [outCharas] = useCachedData<IOutCharaProfile>("outsideCharacters");
  const [musicDiffis] = useCachedData<IMusicDifficultyInfo>(
    "musicDifficulties"
  );

  const [musics, setMusics] = useState<IMusicInfo[]>([]);
  const [sortedCache, setSortedCache] = useState<IMusicInfo[]>([]);
  const [viewGridType, setViewGridType] = useLocalStorage<ViewGridType>(
    "music-list-grid-view-type",
    "grid",
    false
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
  const [composer, setComposer] = useLocalStorage<string>(
    "music-list-filter-composer",
    ""
  );
  const [musicMVTypes, dispatchMusicMVTypes] = useReducer(
    attrSelectReducer,
    JSON.parse(localStorage.getItem("music-list-filter-mv-types") || "[]")
  );
  const [arranger, setArranger] = useLocalStorage<string>(
    "music-list-filter-arranger",
    ""
  );
  const [lyricist, setLyricist] = useLocalStorage<string>(
    "music-list-filter-lyricist",
    ""
  );
  const [characterSelected, dispatchCharacterSelected] = useReducer(
    characterSelectReducer,
    JSON.parse(localStorage.getItem("music-list-filter-charas") || "[]")
  );
  const [
    outsideCharacterSelected,
    dispatchOutsideCharacterSelected,
  ] = useReducer(
    characterSelectReducer,
    JSON.parse(localStorage.getItem("music-list-filter-outside-charas") || "[]")
  );

  useEffect(() => {
    document.title = t("title:musicList");
  }, [t]);

  useEffect(() => {
    setIsReady(Boolean(musicsCache));
  }, [setIsReady, musicsCache]);

  useEffect(() => {
    if (musicsCache && musicTags && musicVocals && musicDiffis) {
      let result = [...musicsCache];
      // do filter
      if (!isShowSpoiler) {
        result = result.filter((m) => m.publishedAt <= new Date().getTime());
      }
      if (musicTag) {
        result = result.filter((m) =>
          musicTags
            .filter((mt) => mt.musicId === m.id)!
            .some((mt) => musicTag === mt.musicTag)
        );
      }
      if (musicMVTypes.length) {
        result = result.filter(
          (m) => m.categories.sort().join(" ") === musicMVTypes.sort().join(" ")
        );
      }
      if (characterSelected.length || outsideCharacterSelected.length) {
        result = result.filter((m) =>
          musicVocals
            .filter((mv) => mv.musicId === m.id)
            .some(
              (mv) =>
                characterSelected.every((chara) =>
                  mv.characters
                    .filter((c) => c.characterType === "game_character")
                    .map((c) => c.characterId)
                    .includes(chara)
                ) &&
                outsideCharacterSelected.every((chara) =>
                  mv.characters
                    .filter((c) => c.characterType === "outside_character")
                    .map((c) => c.characterId)
                    .includes(chara)
                )
            )
        );
      }
      if (composer) {
        result = result.filter((m) => m.composer === composer);
      }
      if (arranger) {
        result = result.filter((m) => m.arranger === arranger);
      }
      if (lyricist) {
        result = result.filter((m) => m.lyricist === lyricist);
      }
      // sort musics cache
      switch (sortBy) {
        case "id":
        case "publishedAt":
          result = result.sort((a, b) =>
            sortType === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
          );
          break;
        case "difficultyMaster":
          result = result.sort((a, b) => {
            const levelA = musicDiffis.find(
              (md) => md.musicId === a.id && md.musicDifficulty === "master"
            )!.playLevel;
            const levelB = musicDiffis.find(
              (md) => md.musicId === b.id && md.musicDifficulty === "master"
            )!.playLevel;
            return sortType === "asc" ? levelA - levelB : levelB - levelA;
          });
          break;
        case "difficultyExpert":
          result = result.sort((a, b) => {
            const levelA = musicDiffis.find(
              (md) => md.musicId === a.id && md.musicDifficulty === "expert"
            )!.playLevel;
            const levelB = musicDiffis.find(
              (md) => md.musicId === b.id && md.musicDifficulty === "expert"
            )!.playLevel;
            return sortType === "asc" ? levelA - levelB : levelB - levelA;
          });
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
    musicMVTypes,
    isShowSpoiler,
    composer,
    arranger,
    lyricist,
    musicVocals,
    characterSelected,
    outsideCharacterSelected,
    musicDiffis,
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
                setViewGridType((gridType || "grid") as "grid");
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
            invisible={musicTag === "all" && !musicMVTypes.length}
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
                          color={
                            musicMVTypes.includes(cat) ? "primary" : "default"
                          }
                          label={t(`music:categoryType.${cat}`)}
                          onClick={() => {
                            musicMVTypes.includes(cat)
                              ? dispatchMusicMVTypes({
                                  type: "remove",
                                  payload: cat,
                                  storeName: "music-list-filter-mv-types",
                                })
                              : dispatchMusicMVTypes({
                                  type: "add",
                                  payload: cat,
                                  storeName: "music-list-filter-mv-types",
                                });
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
                    {t("filter:character.caption")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {Array.from({ length: 26 }).map((_, idx) => (
                      <Grid key={"chara-filter-" + idx} item>
                        <Chip
                          clickable
                          color={
                            characterSelected.includes(idx + 1)
                              ? "primary"
                              : "default"
                          }
                          avatar={
                            <Avatar
                              alt={getCharaName(idx + 1)}
                              src={
                                charaIcons[
                                  `CharaIcon${idx + 1}` as "CharaIcon1"
                                ]
                              }
                            />
                          }
                          label={getCharaName(idx + 1)}
                          onClick={() => {
                            if (characterSelected.includes(idx + 1)) {
                              dispatchCharacterSelected({
                                type: "remove",
                                payload: idx + 1,
                                storeName: "music-list-filter-charas",
                              });
                            } else {
                              dispatchCharacterSelected({
                                type: "add",
                                payload: idx + 1,
                                storeName: "music-list-filter-charas",
                              });
                            }
                          }}
                        />
                      </Grid>
                    ))}
                    {outCharas &&
                      outCharas.map((outChara, idx) => (
                        <Grid key={"outside-chara-filter-" + idx} item>
                          <Chip
                            clickable
                            color={
                              outsideCharacterSelected.includes(idx + 1)
                                ? "primary"
                                : "default"
                            }
                            label={outChara.name}
                            onClick={() => {
                              if (outsideCharacterSelected.includes(idx + 1)) {
                                dispatchOutsideCharacterSelected({
                                  type: "remove",
                                  payload: idx + 1,
                                  storeName: "music-list-filter-outside-charas",
                                });
                              } else {
                                dispatchOutsideCharacterSelected({
                                  type: "add",
                                  payload: idx + 1,
                                  storeName: "music-list-filter-outside-charas",
                                });
                              }
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
                    {t("music:composer")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <FormControl>
                        <Select
                          value={composer}
                          onChange={(e) => {
                            setComposer(e.target.value as string);
                          }}
                          style={{ minWidth: "200px" }}
                        >
                          <MenuItem value="">
                            {t("filter:not-selected")}
                          </MenuItem>
                          {Array.from(
                            new Set(sortedCache.map((m) => m.composer))
                          )
                            .sort()
                            .map((name) => (
                              <MenuItem value={name} key={name}>
                                {name}
                              </MenuItem>
                            ))}
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
                justify="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("music:arranger")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <FormControl>
                        <Select
                          value={arranger}
                          onChange={(e) => {
                            setArranger(e.target.value as string);
                          }}
                          style={{ minWidth: "200px" }}
                        >
                          <MenuItem value="">
                            {t("filter:not-selected")}
                          </MenuItem>
                          {Array.from(
                            new Set(sortedCache.map((m) => m.arranger))
                          )
                            .sort()
                            .map((name) => (
                              <MenuItem value={name} key={name}>
                                {name}
                              </MenuItem>
                            ))}
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
                justify="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("music:lyricist")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <FormControl>
                        <Select
                          value={lyricist}
                          onChange={(e) => {
                            setLyricist(e.target.value as string);
                          }}
                          style={{ minWidth: "200px" }}
                        >
                          <MenuItem value="">
                            {t("filter:not-selected")}
                          </MenuItem>
                          {Array.from(
                            new Set(sortedCache.map((m) => m.lyricist))
                          )
                            .sort()
                            .map((name) => (
                              <MenuItem value={name} key={name}>
                                {name}
                              </MenuItem>
                            ))}
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
                          <MenuItem value="difficultyMaster">
                            {t("music:difficulty")} (Master)
                          </MenuItem>
                          <MenuItem value="difficultyExpert">
                            {t("music:difficulty")} (Expert)
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
                    disabled={
                      musicTag === "all" &&
                      !musicMVTypes.length &&
                      !characterSelected.length &&
                      !outsideCharacterSelected.length &&
                      !composer &&
                      !arranger &&
                      !lyricist
                    }
                    onClick={() => {
                      setMusicTag("all");
                      dispatchMusicMVTypes({
                        type: "reset",
                        payload: "",
                        storeName: "music-list-filter-mv-types",
                      });
                      setArranger("");
                      setComposer("");
                      setLyricist("");
                      dispatchCharacterSelected({
                        type: "reset",
                        payload: 0,
                        storeName: "music-list-filter-charas",
                      });
                      dispatchOutsideCharacterSelected({
                        type: "reset",
                        payload: 0,
                        storeName: "music-list-filter-outside-charas",
                      });
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
