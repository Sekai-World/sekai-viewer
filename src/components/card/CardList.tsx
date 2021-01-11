import {
  Button,
  ButtonGroup,
  Grid,
  Paper,
  Typography,
  Container,
  Collapse,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Avatar,
} from "@material-ui/core";
import { useLayoutStyles } from "../../styles/layout";
import { Sort, SortOutlined, ViewAgenda, ViewComfy } from "@material-ui/icons";
import {
  Filter,
  FilterOutline,
  ViewAgendaOutline,
  ViewComfyOutline,
  ViewGrid,
  ViewGridOutline,
} from "mdi-material-ui";
import React, {
  Fragment,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { ICardEpisode, ICardInfo, ICardRarity, IGameChara } from "../../types";
import { useCachedData, useCharaName, useRefState } from "../../utils";
import InfiniteScroll from "../subs/InfiniteScroll";
// import InfiniteScroll from "react-infinite-scroll-component";

import { useTranslation } from "react-i18next";
import { useInteractiveStyles } from "../../styles/interactive";
import {
  characterSelectReducer,
  attrSelectReducer,
  raritySelectReducer,
} from "../../stores/reducers";
import { charaIcons, attrIconMap } from "../../utils/resources";
import { SettingContext } from "../../context";
import GridView from "./GridView";
import AgendaView from "./AgendaView";
import ComfyView from "./ComfyView";
import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";

type ViewGridType = "grid" | "agenda" | "comfy";

function getPaginatedCards(cards: ICardInfo[], page: number, limit: number) {
  return cards.slice(limit * (page - 1), limit * page);
}

function getMaxParam(
  card: ICardInfo,
  rarities: ICardRarity[],
  episodes: ICardEpisode[]
) {
  const rarity = rarities.find((rarity) => rarity.rarity === card.rarity)!;

  const maxLevel = rarity.trainingMaxLevel || rarity.maxLevel;

  let maxParam =
    card.cardParameters
      .filter((cp) => cp.cardLevel === maxLevel)
      .reduce((sum, cp) => {
        sum += cp.power;
        return sum;
      }, 0) +
    episodes
      .filter((episode) => episode.cardId === card.id)
      .reduce((sum, episode) => {
        sum += episode.power1BonusFixed;
        sum += episode.power2BonusFixed;
        sum += episode.power3BonusFixed;
        return sum;
      }, 0);
  if (card.rarity >= 3)
    maxParam +=
      card.specialTrainingPower1BonusFixed +
      card.specialTrainingPower2BonusFixed +
      card.specialTrainingPower3BonusFixed;

  return maxParam;
}

const ListCard: { [key: string]: React.FC<{ data?: ICardInfo }> } = {
  grid: GridView,
  agenda: AgendaView,
  comfy: ComfyView,
};

const CardList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { contentTransMode } = useContext(SettingContext)!;
  const getCharaName = useCharaName(contentTransMode);

  const [cardsCache] = useCachedData<ICardInfo>("cards");
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [rarities] = useCachedData<ICardRarity>("cardRarities");
  const [episodes] = useCachedData<ICardEpisode>("cardEpisodes");

  const [cards, setCards] = useState<ICardInfo[]>([]);
  const [sortedCache, sortedCacheRef, setSortedCache] = useRefState<
    ICardInfo[]
  >([]);
  const [viewGridType, setViewGridType] = useState<ViewGridType>(
    (localStorage.getItem("card-list-grid-view-type") || "grid") as ViewGridType
  );
  const [page, pageRef, setPage] = useRefState<number>(0);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
  const [sortType, setSortType] = useState<string>(
    localStorage.getItem("card-list-filter-sort-type") || "asc"
  );
  const [sortBy, setSortBy] = useState<string>(
    localStorage.getItem("card-list-filter-sort-by") || "id"
  );
  const [characterSelected, dispatchCharacterSelected] = useReducer(
    characterSelectReducer,
    []
  );
  const [attrSelected, dispatchAttrSelected] = useReducer(
    attrSelectReducer,
    []
  );
  const [raritySelected, dispatchRaritySelected] = useReducer(
    raritySelectReducer,
    []
  );

  const callback = (
    entries: readonly IntersectionObserverEntry[],
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

  useEffect(() => {
    document.title = t("title:cardList");
  }, [t]);

  useEffect(() => {
    setIsReady(Boolean(cardsCache.length) && Boolean(charas.length));
  }, [setIsReady, cardsCache, charas]);

  useEffect(() => {
    if (cardsCache.length && rarities.length && episodes.length) {
      let result = [...cardsCache];
      // do filter
      if (characterSelected.length) {
        result = result.filter((c) =>
          characterSelected.includes(c.characterId)
        );
      }
      if (attrSelected.length) {
        result = result.filter((c) => attrSelected.includes(c.attr));
      }
      if (raritySelected.length) {
        result = result.filter((c) => raritySelected.includes(c.rarity));
      }
      // temporarily sort cards cache
      switch (sortBy) {
        case "id":
        case "rarity":
        case "releaseAt":
          result = result.sort((a, b) =>
            sortType === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
          );
          break;
        case "power":
          result = result.sort((a, b) =>
            sortType === "asc"
              ? getMaxParam(a, rarities, episodes) -
                getMaxParam(b, rarities, episodes)
              : getMaxParam(b, rarities, episodes) -
                getMaxParam(a, rarities, episodes)
          );
          break;
      }
      setSortedCache(result);
      setCards([]);
      setPage(0);
    }
  }, [
    cardsCache,
    sortBy,
    sortType,
    setPage,
    rarities,
    episodes,
    setSortedCache,
    characterSelected,
    attrSelected,
    raritySelected,
  ]);

  useEffect(() => {
    if (sortedCache.length) {
      setCards((cards) => [
        ...cards,
        ...getPaginatedCards(sortedCache, page, limit),
      ]);
      setLastQueryFin(true);
    }
  }, [page, limit, setLastQueryFin, sortedCache]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:card")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container justify="space-between">
          <ButtonGroup style={{ marginBottom: "1%" }}>
            <Button
              // variant={viewGridType === "grid" ? "outlined" : "contained"}
              onClick={() => {
                setViewGridType("grid");
                localStorage.setItem("card-list-grid-view-type", "grid");
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
                localStorage.setItem("card-list-grid-view-type", "agenda");
              }}
              color={viewGridType === "agenda" ? "primary" : "default"}
            >
              {viewGridType === "agenda" ? (
                <ViewAgenda></ViewAgenda>
              ) : (
                <ViewAgendaOutline></ViewAgendaOutline>
              )}
            </Button>
            <Button
              // variant={viewGridType === "comfy" ? "outlined" : "contained"}
              onClick={() => {
                setViewGridType("comfy");
                localStorage.setItem("card-list-grid-view-type", "comfy");
              }}
              color={viewGridType === "comfy" ? "primary" : "default"}
            >
              {viewGridType === "comfy" ? (
                <ViewComfy></ViewComfy>
              ) : (
                <ViewComfyOutline></ViewComfyOutline>
              )}
            </Button>
          </ButtonGroup>
          <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
            <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
              <Button size="medium" onClick={() => setFilterOpened((v) => !v)}>
                {filterOpened ? <Filter /> : <FilterOutline />}
                {filterOpened ? <Sort /> : <SortOutlined />}
              </Button>
            </ButtonGroup>
          </ButtonGroup>
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
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:character.caption")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={10}>
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
                              });
                            } else {
                              dispatchCharacterSelected({
                                type: "add",
                                payload: idx + 1,
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
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("common:attribute")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={10}>
                  <Grid container spacing={1}>
                    {["cute", "mysterious", "cool", "happy", "pure"].map(
                      (attr) => (
                        <Grid key={"attr-filter-" + attr} item>
                          <Chip
                            clickable
                            color={
                              attrSelected.includes(attr)
                                ? "primary"
                                : "default"
                            }
                            avatar={
                              <Avatar
                                alt={attr}
                                src={attrIconMap[attr as "cool"]}
                              />
                            }
                            label={
                              <Typography
                                variant="body2"
                                style={{ textTransform: "capitalize" }}
                              >
                                {attr}
                              </Typography>
                            }
                            onClick={() => {
                              if (attrSelected.includes(attr)) {
                                dispatchAttrSelected({
                                  type: "remove",
                                  payload: attr,
                                });
                              } else {
                                dispatchAttrSelected({
                                  type: "add",
                                  payload: attr,
                                });
                              }
                            }}
                          />
                        </Grid>
                      )
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justify="space-between"
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("card:rarity")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={10}>
                  <Grid container spacing={1}>
                    {[1, 2, 3, 4].map((rarity) => (
                      <Grid key={rarity} item>
                        <Chip
                          clickable
                          color={
                            raritySelected.includes(rarity)
                              ? "primary"
                              : "default"
                          }
                          label={
                            <Grid container>
                              {Array.from({ length: rarity }).map(() => (
                                <Grid item>
                                  <img
                                    src={
                                      rarity >= 3
                                        ? rarityAfterTraining
                                        : rarityNormal
                                    }
                                    alt="rarity star"
                                    height="16"
                                  ></img>
                                </Grid>
                              ))}
                            </Grid>
                          }
                          onClick={() => {
                            if (raritySelected.includes(rarity)) {
                              dispatchRaritySelected({
                                type: "remove",
                                payload: rarity,
                              });
                            } else {
                              dispatchRaritySelected({
                                type: "add",
                                payload: rarity,
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
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:sort.caption")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={10}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <FormControl>
                        <Select
                          value={sortType}
                          onChange={(e) => {
                            setSortType(e.target.value as string);
                            localStorage.setItem(
                              "card-list-filter-sort-type",
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
                              "card-list-filter-sort-by",
                              e.target.value as string
                            );
                          }}
                          style={{ minWidth: "100px" }}
                        >
                          <MenuItem value="id">{t("common:id")}</MenuItem>
                          <MenuItem value="rarity">
                            {t("common:rarity")}
                          </MenuItem>
                          <MenuItem value="releaseAt">
                            {t("common:startAt")}
                          </MenuItem>
                          <MenuItem value="power">{t("card:power")}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
        <InfiniteScroll<ICardInfo>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={cards}
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
                sm: 6,
                md: 3,
              },
            } as const)[viewGridType]
          }
        />
      </Container>
    </Fragment>
  );
};

export default CardList;
