import {
  Button,
  Grid,
  Collapse,
  FormControl,
  MenuItem,
  Select,
  Chip,
  Badge,
  Avatar,
} from "@mui/material";
import {
  ViewAgenda,
  ViewAgendaOutlined,
  Sort,
  SortOutlined,
  RotateLeft,
  GridView as ViewGrid,
  GridViewOutlined as ViewGridOutline,
  FilterAlt as Filter,
  FilterAltOutlined as FilterOutline,
  Check,
} from "@mui/icons-material";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  useCachedData,
  useLocalStorage,
  useMusicTagName,
  useToggle,
} from "../../utils";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";

import { useTranslation } from "react-i18next";
import GridView from "./GridView";
import AgendaView from "./AgendaView";
import {
  IMusicDifficultyInfo,
  IMusicInfo,
  IMusicTagInfo,
  IMusicVocalInfo,
  IOutCharaProfile,
} from "../../types.d";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  attrSelectReducer,
  characterSelectReducer,
} from "../../stores/reducers";
import { charaIcons, UnitLogoMiniMap } from "../../utils/resources";
import { useCharaName } from "../../utils/i18n";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";

type ViewGridType = "grid" | "agenda" | "comfy";

function getPaginatedMusics(musics: IMusicInfo[], page: number, limit: number) {
  return musics.slice(limit * (page - 1), limit * page);
}

const ListCard: { [key: string]: React.FC<{ data?: IMusicInfo }> } = {
  grid: GridView,
  agenda: AgendaView,
};

const MusicList: React.FC<{}> = observer(() => {
  const { t } = useTranslation();
  const {
    settings: { contentTransMode, isShowSpoiler },
  } = useRootStore();
  const musicTagToName = useMusicTagName(contentTransMode);
  const getCharaName = useCharaName();

  const [musicsCache] = useCachedData<IMusicInfo>("musics");
  const [musicTags] = useCachedData<IMusicTagInfo>("musicTags");
  const [musicVocals] = useCachedData<IMusicVocalInfo>("musicVocals");
  const [outCharas] = useCachedData<IOutCharaProfile>("outsideCharacters");
  const [musicDiffis] =
    useCachedData<IMusicDifficultyInfo>("musicDifficulties");

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
  const [filterOpened, toggleFilterOpened] = useToggle(false);
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
    JSON.parse(localStorage.getItem("music-list-filter-mv-types.d") || "[]")
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
  const [outsideCharacterSelected, dispatchOutsideCharacterSelected] =
    useReducer(
      characterSelectReducer,
      JSON.parse(
        localStorage.getItem("music-list-filter-outside-charas") || "[]"
      )
    );

  useEffect(() => {
    document.title = t("title:musicList");
  }, [t]);

  useEffect(() => {
    setIsReady(Boolean(musicsCache));
  }, [setIsReady, musicsCache]);

  const doFilter = useCallback(() => {
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
        result = result.filter((m) =>
          musicMVTypes.every((type) => m.categories.includes(type))
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
    if (isReady) doFilter();
  }, [isReady, doFilter]);

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

  const resetFilter = useCallback(() => {
    setMusicTag("all");
    dispatchMusicMVTypes({
      type: "reset",
      payload: "",
      storeName: "music-list-filter-mv-types.d",
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
  }, [setArranger, setComposer, setLyricist, setMusicTag]);

  return (
    <Fragment>
      <TypographyHeader>{t("common:music")}</TypographyHeader>
      <ContainerContent>
        <Grid
          container
          justifyContent="space-between"
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
                  <ViewAgendaOutlined></ViewAgendaOutlined>
                )}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item>
            <Badge
              color="secondary"
              variant="dot"
              invisible={
                musicTag === "all" &&
                !musicMVTypes.length &&
                !characterSelected.length &&
                !outsideCharacterSelected.length &&
                !composer &&
                !arranger &&
                !lyricist
              }
            >
              <ToggleButton
                value=""
                color="primary"
                selected={filterOpened}
                onClick={() => toggleFilterOpened()}
              >
                {filterOpened ? <Filter /> : <FilterOutline />}
                {filterOpened ? <Sort /> : <SortOutlined />}
              </ToggleButton>
            </Badge>
          </Grid>
        </Grid>
        <Collapse in={filterOpened}>
          <PaperContainer>
            <Grid container direction="column" spacing={2}>
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption>
                    {t("filter:music_tag.caption")}
                  </TypographyCaption>
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
                          avatar={
                            Object.prototype.hasOwnProperty.call(
                              UnitLogoMiniMap,
                              tag
                            ) ? (
                              <Avatar
                                alt={musicTagToName[tag as "all"]}
                                src={UnitLogoMiniMap[tag as "idol"]}
                              />
                            ) : undefined
                          }
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
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption>
                    {t("filter:music_mv.caption")}
                  </TypographyCaption>
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
                                  storeName: "music-list-filter-mv-types.d",
                                })
                              : dispatchMusicMVTypes({
                                  type: "add",
                                  payload: cat,
                                  storeName: "music-list-filter-mv-types.d",
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
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption>
                    {t("filter:character.caption")}
                  </TypographyCaption>
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
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption>{t("music:composer")}</TypographyCaption>
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
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption>{t("music:arranger")}</TypographyCaption>
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
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption>{t("music:lyricist")}</TypographyCaption>
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
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption>
                    {t("filter:sort.caption")}
                  </TypographyCaption>
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
                    onClick={() => {
                      doFilter();
                      toggleFilterOpened();
                    }}
                    startIcon={<Check />}
                  >
                    {t("common:apply")}
                  </Button>
                </Grid>
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
                    onClick={() => resetFilter()}
                    startIcon={<RotateLeft />}
                  >
                    {t("common:reset")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </PaperContainer>
        </Collapse>
        <InfiniteScroll<IMusicInfo>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={musics}
          gridSize={
            (
              {
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
              } as const
            )[viewGridType]
          }
        />
      </ContainerContent>
    </Fragment>
  );
});

export default MusicList;
