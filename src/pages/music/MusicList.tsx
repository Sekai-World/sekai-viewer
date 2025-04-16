import clsx from "clsx";
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
  IconButton,
  Tooltip,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  ViewAgenda,
  ViewAgendaOutlined,
  Sort,
  SortOutlined,
  RotateLeft,
  GridView as ViewGrid,
  GridViewOutlined as ViewGridOutlined,
  FilterAlt as Filter,
  FilterAltOutlined as FilterOutlined,
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
  agenda: AgendaView,
  grid: GridView,
};

const MusicList: React.FC<unknown> = observer(() => {
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
    "desc"
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "music-list-filter-sort-by",
    "publishedAt"
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
  const [outsideCharacterSelected, dispatchOutsideCharacterSelected] =
    useReducer(
      characterSelectReducer,
      JSON.parse(
        localStorage.getItem("music-list-filter-outside-charas") || "[]"
      )
    );
  const [searchTitle, setSearchTitle] = useState("");

  useEffect(() => {
    document.title = t("title:musicList");
  }, [t]);

  useEffect(() => {
    setIsReady(
      !!musicsCache?.length &&
        !!musicTags?.length &&
        !!musicVocals?.length &&
        !!musicDiffis?.length
    );
  }, [
    musicDiffis?.length,
    musicTags?.length,
    musicVocals?.length,
    musicsCache?.length,
  ]);

  const doFilter = useCallback(() => {
    if (musicsCache && musicTags && musicVocals && musicDiffis) {
      const result = musicsCache.filter((m) => {
        if (!isShowSpoiler && m.publishedAt > new Date().getTime()) {
          return false;
        }
        if (
          musicTag &&
          !musicTags.some(
            (mt) => mt.musicId === m.id && musicTag === mt.musicTag
          )
        ) {
          return false;
        }
        if (
          musicMVTypes.length &&
          !musicMVTypes.every((type) =>
            m.categories
              .map((cat) =>
                typeof cat === "string" ? cat : cat.musicCategoryName
              )
              .includes(type)
          )
        ) {
          return false;
        }
        const hasSelectedCharacters =
          characterSelected.length > 0 || outsideCharacterSelected.length > 0;

        if (
          hasSelectedCharacters &&
          !musicVocals.some((mv) => {
            const gameCharacterIds = mv.characters
              .filter((c) => c.characterType === "game_character")
              .map((c) => c.characterId);

            const outsideCharacterIds = mv.characters
              .filter((c) => c.characterType === "outside_character")
              .map((c) => c.characterId);

            const allGameCharactersMatch = characterSelected.every((chara) =>
              gameCharacterIds.includes(chara)
            );

            const allOutsideCharactersMatch = outsideCharacterSelected.every(
              (chara) => outsideCharacterIds.includes(chara)
            );

            return (
              mv.musicId === m.id &&
              allGameCharactersMatch &&
              allOutsideCharactersMatch
            );
          })
        ) {
          return false;
        }
        if (composer && m.composer !== composer) {
          return false;
        }
        if (arranger && m.arranger !== arranger) {
          return false;
        }
        if (lyricist && m.lyricist !== lyricist) {
          return false;
        }
        if (
          searchTitle &&
          !m.title.toLowerCase().includes(searchTitle.toLowerCase())
        ) {
          return false;
        }
        return true;
      });

      // sort musics cache
      result.sort((a, b) => {
        let compare = 0;
        switch (sortBy) {
          case "id":
          case "publishedAt":
            compare = a[sortBy] - b[sortBy];
            break;
          case "master":
          case "expert":
          case "append":
            const levelA =
              musicDiffis.find(
                (md) => md.musicId === a.id && md.musicDifficulty === sortBy
              )?.playLevel || -1;
            const levelB =
              musicDiffis.find(
                (md) => md.musicId === b.id && md.musicDifficulty === sortBy
              )?.playLevel || -1;
            compare = levelA - levelB;
            break;
        }
        return sortType === "asc" ? compare : -compare;
      });

      setSortedCache(result);
      setMusics([]);
      setPage(0);
    }
  }, [
    arranger,
    characterSelected,
    composer,
    isShowSpoiler,
    lyricist,
    musicDiffis,
    musicMVTypes,
    musicTag,
    musicTags,
    musicVocals,
    musicsCache,
    outsideCharacterSelected,
    searchTitle,
    sortBy,
    sortType,
  ]);

  useEffect(() => {
    if (isReady) doFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

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
      payload: "",
      storeName: "music-list-filter-mv-types",
      type: "reset",
    });
    setArranger("");
    setComposer("");
    setLyricist("");
    setSearchTitle("");
    dispatchCharacterSelected({
      payload: 0,
      storeName: "music-list-filter-charas",
      type: "reset",
    });
    dispatchOutsideCharacterSelected({
      payload: 0,
      storeName: "music-list-filter-outside-charas",
      type: "reset",
    });
    setSortBy("publishedAt");
    setSortType("desc");
  }, [
    setArranger,
    setComposer,
    setLyricist,
    setMusicTag,
    setSortBy,
    setSortType,
  ]);

  const handleTagFilterClick = useCallback(
    (tag: string) => {
      if (musicTag === tag) setMusicTag("all");
      else setMusicTag(tag);
    },
    [musicTag, setMusicTag]
  );

  const handleCharaFilterClick = useCallback(
    (idx: number) => {
      if (characterSelected.includes(idx + 1)) {
        dispatchCharacterSelected({
          payload: idx + 1,
          storeName: "music-list-filter-charas",
          type: "remove",
        });
      } else {
        dispatchCharacterSelected({
          payload: idx + 1,
          storeName: "music-list-filter-charas",
          type: "add",
        });
      }
    },
    [characterSelected]
  );

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
                  <ViewGridOutlined></ViewGridOutlined>
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
                !lyricist &&
                !searchTitle
              }
            >
              <ToggleButton
                value=""
                color="primary"
                selected={filterOpened}
                onClick={() => toggleFilterOpened()}
              >
                {filterOpened ? <Filter /> : <FilterOutlined />}
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
                  <Grid container spacing={1} alignItems="center">
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
                        {Object.hasOwn(UnitLogoMiniMap, tag) ? (
                          <Tooltip
                            title={musicTagToName[tag as "all"]}
                            placement="top"
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleTagFilterClick(tag)}
                              className={clsx({
                                "icon-not-selected": musicTag !== tag,
                                "icon-selected": musicTag === tag,
                              })}
                            >
                              <Avatar
                                alt={musicTagToName[tag as "all"]}
                                src={UnitLogoMiniMap[tag as "idol"]}
                                sx={{ width: 32, height: 32 }}
                              />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Chip
                            clickable
                            color={musicTag === tag ? "primary" : "default"}
                            label={musicTagToName[tag as "all"]}
                            onClick={() => handleTagFilterClick(tag)}
                          />
                        )}
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
                                  payload: cat,
                                  storeName: "music-list-filter-mv-types",
                                  type: "remove",
                                })
                              : dispatchMusicMVTypes({
                                  payload: cat,
                                  storeName: "music-list-filter-mv-types",
                                  type: "add",
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
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption sx={{ paddingTop: "0.5em" }}>
                    {t("filter:character.caption")}
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1} alignItems="center">
                    {Array.from({ length: 26 }).map((_, idx) => (
                      <Grid key={"chara-filter-" + idx} item>
                        {charaIcons[`CharaIcon${idx + 1}` as "CharaIcon1"] ? (
                          <Tooltip
                            title={getCharaName(idx + 1)}
                            placement="top"
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleCharaFilterClick(idx)}
                              className={clsx({
                                "icon-not-selected":
                                  !characterSelected.includes(idx + 1),
                                "icon-selected": characterSelected.includes(
                                  idx + 1
                                ),
                              })}
                            >
                              <Avatar
                                alt={getCharaName(idx + 1)}
                                src={
                                  charaIcons[
                                    `CharaIcon${idx + 1}` as "CharaIcon1"
                                  ]
                                }
                                sx={{ width: 32, height: 32 }}
                              />
                            </IconButton>
                          </Tooltip>
                        ) : (
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
                            onClick={() => handleCharaFilterClick(idx)}
                          />
                        )}
                      </Grid>
                    ))}
                    {outCharas &&
                      outCharas.map((outChara, idx) => (
                        <Grid key={"outside-chara-filter-" + idx} item>
                          <Chip
                            clickable
                            color={
                              outsideCharacterSelected.includes(outChara.id)
                                ? "primary"
                                : "default"
                            }
                            label={outChara.name}
                            onClick={() => {
                              if (
                                outsideCharacterSelected.includes(outChara.id)
                              ) {
                                dispatchOutsideCharacterSelected({
                                  payload: outChara.id,
                                  storeName: "music-list-filter-outside-charas",
                                  type: "remove",
                                });
                              } else {
                                dispatchOutsideCharacterSelected({
                                  payload: outChara.id,
                                  storeName: "music-list-filter-outside-charas",
                                  type: "add",
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
                      <FormControl size="small">
                        <Autocomplete
                          value={composer}
                          onChange={(e, newVal) => {
                            setComposer(newVal || "");
                          }}
                          disablePortal
                          options={Array.from(
                            new Set((musicsCache ?? []).map((m) => m.composer))
                          ).sort()}
                          renderInput={(params) => (
                            <TextField {...params} size="small" />
                          )}
                          sx={{ minWidth: "200px" }}
                        />
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
                      <FormControl size="small">
                        <Autocomplete
                          value={arranger}
                          onChange={(e, newVal) => {
                            setArranger(newVal || "");
                          }}
                          disablePortal
                          options={Array.from(
                            new Set((musicsCache ?? []).map((m) => m.arranger))
                          ).sort()}
                          renderInput={(params) => (
                            <TextField {...params} size="small" />
                          )}
                          sx={{ minWidth: "200px" }}
                        />
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
                      <FormControl size="small">
                        <Autocomplete
                          value={lyricist}
                          onChange={(e, newVal) => {
                            setLyricist(newVal || "");
                          }}
                          disablePortal
                          options={Array.from(
                            new Set((musicsCache ?? []).map((m) => m.lyricist))
                          ).sort()}
                          renderInput={(params) => (
                            <TextField {...params} size="small" />
                          )}
                          sx={{ minWidth: "200px" }}
                        />
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
                  <TypographyCaption>{t("common:title")}</TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <FormControl size="small">
                    <TextField
                      size="small"
                      fullWidth
                      value={searchTitle}
                      onChange={(e) => setSearchTitle(e.target.value)}
                      sx={{ minWidth: "200px" }}
                    />
                  </FormControl>
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
                      <FormControl size="small">
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
                      <FormControl size="small">
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
                          <MenuItem value="master">
                            {t("music:difficulty")} (Master)
                          </MenuItem>
                          <MenuItem value="expert">
                            {t("music:difficulty")} (Expert)
                          </MenuItem>
                          <MenuItem value="append">
                            {t("music:difficulty")} (Append)
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
                    color="secondary"
                    disabled={
                      musicTag === "all" &&
                      !musicMVTypes.length &&
                      !characterSelected.length &&
                      !outsideCharacterSelected.length &&
                      !composer &&
                      !arranger &&
                      !lyricist &&
                      !searchTitle
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
                agenda: {
                  xs: 12,
                },
                comfy: {
                  xs: 12,
                },
                grid: {
                  lg: 3,
                  md: 4,
                  sm: 6,
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
