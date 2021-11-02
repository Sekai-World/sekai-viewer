import {
  Button,
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
  Badge,
  TextField,
  InputAdornment,
  IconButton,
  Popover,
} from "@mui/material";
import { useLayoutStyles } from "../../styles/layout";
import {
  Check,
  FilterAlt as Filter,
  FilterAltOutlined as FilterOutline,
  RotateLeft,
  Sort,
  SortOutlined,
  ViewAgenda,
  ViewAgendaOutlined,
  ViewComfy,
  ViewComfyOutlined,
  GridView as ViewGrid,
  GridViewOutlined as ViewGridOutlined,
} from "@mui/icons-material";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  ICardEpisode,
  ICardInfo,
  ICardRarity,
  IEventDeckBonus,
  IEventInfo,
  IGameChara,
  IGameCharaUnit,
  ISkillInfo,
  IUnitProfile,
} from "../../types";
import {
  useCachedData,
  useLocalStorage,
  useSkillMapping,
  useToggle,
} from "../../utils";
import InfiniteScroll from "../subs/InfiniteScroll";
// import InfiniteScroll from "react-infinite-scroll-component";

import { useTranslation } from "react-i18next";
import { useInteractiveStyles } from "../../styles/interactive";
import {
  characterSelectReducer,
  attrSelectReducer,
  raritySelectReducer,
  skillSelectReducer,
  supportUnitSelectReducer,
} from "../../stores/reducers";
import {
  charaIcons,
  attrIconMap,
  UnitLogoMiniMap,
} from "../../utils/resources";
import { SettingContext } from "../../context";
import GridView from "./GridView";
import AgendaView from "./AgendaView";
import ComfyView from "./ComfyView";
import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ContentTrans } from "../subs/ContentTrans";
import { useCurrentEvent } from "../../utils/apiClient";
import { useAssetI18n, useCharaName } from "../../utils/i18n";

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
  const { isShowSpoiler } = useContext(SettingContext)!;
  const getCharaName = useCharaName();
  const { currEvent, isLoading: isCurrEventLoading } = useCurrentEvent();
  const { getTranslated } = useAssetI18n();
  const skillMapping = useSkillMapping();

  const [cardsCache] = useCachedData<ICardInfo>("cards");
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [rarities] = useCachedData<ICardRarity>("cardRarities");
  const [episodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [skills] = useCachedData<ISkillInfo>("skills");
  const [events] = useCachedData<IEventInfo>("events");
  const [eventDeckBonuses] = useCachedData<IEventDeckBonus>("eventDeckBonuses");
  const [charaUnits] = useCachedData<IGameCharaUnit>("gameCharacterUnits");
  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");

  const [cards, setCards] = useState<ICardInfo[]>([]);
  const [sortedCache, setSortedCache] = useState<ICardInfo[]>([]);
  const [viewGridType, setViewGridType] = useLocalStorage<ViewGridType>(
    "card-list-grid-view-type",
    "grid",
    false
  );
  const [page, setPage] = useState<number>(0);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [filterOpen, togglefilterOpen] = useToggle(false);
  const [sortType, setSortType] = useLocalStorage<string>(
    "card-list-filter-sort-type",
    "asc",
    false
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "card-list-filter-sort-by",
    "id",
    false
  );
  const [characterSelected, dispatchCharacterSelected] = useReducer(
    characterSelectReducer,
    JSON.parse(localStorage.getItem("card-list-filter-charas") || "[]")
  );
  const [attrSelected, dispatchAttrSelected] = useReducer(
    attrSelectReducer,
    JSON.parse(localStorage.getItem("card-list-filter-attrs") || "[]")
  );
  const [raritySelected, dispatchRaritySelected] = useReducer(
    raritySelectReducer,
    JSON.parse(localStorage.getItem("card-list-filter-rarities") || "[]")
  );
  const [skillSelected, dispatchSkillSelected] = useReducer(
    skillSelectReducer,
    JSON.parse(localStorage.getItem("card-list-filter-skills") || "[]")
  );
  const [supportUnitSelected, dispatchSupportUnitSelected] = useReducer(
    supportUnitSelectReducer,
    JSON.parse(localStorage.getItem("card-list-filter-support-units") || "[]")
  );

  const [anchorElEvent, setAnchorElEvent] = useState<HTMLButtonElement | null>(
    null
  );
  const eventOpen = useMemo(() => Boolean(anchorElEvent), [anchorElEvent]);
  const [eventId, setEventId] = useState(1);

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

  useEffect(() => {
    document.title = t("title:cardList");
  }, [t]);

  useEffect(() => {
    setIsReady(
      Boolean(cardsCache && cardsCache.length) &&
        Boolean(charas && charas.length)
    );
  }, [setIsReady, cardsCache, charas]);

  useEffect(() => {
    if (!isCurrEventLoading) {
      setEventId(currEvent.eventId);
    }
  }, [currEvent, isCurrEventLoading]);

  useEffect(() => {
    if (
      cardsCache &&
      cardsCache.length &&
      rarities &&
      rarities.length &&
      episodes &&
      episodes.length &&
      skills &&
      skills.length
    ) {
      let result = [...cardsCache];
      // do filter
      if (!isShowSpoiler) {
        result = result.filter((c) => c.releaseAt <= new Date().getTime());
      }
      if (characterSelected.length) {
        result = result.filter((c) =>
          characterSelected.includes(c.characterId)
        );
      }
      if (attrSelected.length) {
        result = result.filter((c) => attrSelected.includes(c.attr));
      }
      if (supportUnitSelected.length) {
        result = result.filter(
          (c) =>
            c.supportUnit === "none" ||
            supportUnitSelected.includes(c.supportUnit)
        );
      }
      if (raritySelected.length) {
        result = result.filter((c) => raritySelected.includes(c.rarity));
      }
      if (skillSelected.length) {
        result = result.filter((c) => {
          let skill = skills.find((s) => c.skillId === s.id);
          if (skill) {
            let descriptionSpriteName = skill.descriptionSpriteName;
            if (skill.skillEffects[0].activateNotesJudgmentType === "perfect")
              descriptionSpriteName = "perfect_score_up";
            if (
              skill.skillEffects[0].skillEffectType ===
              "score_up_condition_life"
            )
              descriptionSpriteName = "life_score_up";
            return skillSelected.includes(descriptionSpriteName);
          }
          return true;
        });
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
    skills,
    setSortedCache,
    characterSelected,
    attrSelected,
    raritySelected,
    skillSelected,
    supportUnitSelected,
    isShowSpoiler,
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

  const handleEventClose = useCallback(() => {
    setAnchorElEvent(null);
  }, []);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:card")}
      </Typography>
      <Container className={layoutClasses.content}>
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
              <ToggleButton value="comfy">
                {viewGridType === "comfy" ? (
                  <ViewComfy></ViewComfy>
                ) : (
                  <ViewComfyOutlined></ViewComfyOutlined>
                )}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Badge
            color="secondary"
            variant="dot"
            invisible={
              !characterSelected.length &&
              !attrSelected.length &&
              !skillSelected.length &&
              !raritySelected.length
            }
          >
            <Button variant="outlined" onClick={() => togglefilterOpen()}>
              {filterOpen ? <Filter /> : <FilterOutline />}
              {filterOpen ? <Sort /> : <SortOutlined />}
            </Button>
          </Badge>
        </Grid>
        <Collapse in={filterOpen}>
          <Paper className={interactiveClasses.container}>
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
                                storeName: "card-list-filter-charas",
                              });
                            } else {
                              dispatchCharacterSelected({
                                type: "add",
                                payload: idx + 1,
                                storeName: "card-list-filter-charas",
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
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("common:attribute")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={11}>
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
                                  storeName: "card-list-filter-attrs",
                                });
                              } else {
                                dispatchAttrSelected({
                                  type: "add",
                                  payload: attr,
                                  storeName: "card-list-filter-attrs",
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
              {characterSelected.some((cId) => cId >= 21) && (
                <Grid
                  item
                  container
                  xs={12}
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Grid item xs={12} md={1}>
                    <Typography classes={{ root: interactiveClasses.caption }}>
                      {t("common:support_unit")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={11}>
                    <Grid container spacing={1}>
                      {unitProfiles &&
                        [
                          "theme_park",
                          "street",
                          "idol",
                          "school_refusal",
                          "light_sound",
                        ].map((supportUnit) => (
                          <Grid key={"supportUnit-filter-" + supportUnit} item>
                            <Chip
                              clickable
                              color={
                                supportUnitSelected.includes(supportUnit)
                                  ? "primary"
                                  : "default"
                              }
                              avatar={
                                <Avatar
                                  alt={supportUnit}
                                  src={UnitLogoMiniMap[supportUnit as "idol"]}
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  {getTranslated(
                                    `unit_profile:${supportUnit}.name`,
                                    unitProfiles.find(
                                      (up) => up.unit === supportUnit
                                    )!.unitName
                                  )}
                                </Typography>
                              }
                              onClick={() => {
                                if (supportUnitSelected.includes(supportUnit)) {
                                  dispatchSupportUnitSelected({
                                    type: "remove",
                                    payload: supportUnit,
                                    storeName: "card-list-filter-support-units",
                                  });
                                } else {
                                  dispatchSupportUnitSelected({
                                    type: "add",
                                    payload: supportUnit,
                                    storeName: "card-list-filter-support-units",
                                  });
                                }
                              }}
                            />
                          </Grid>
                        ))}
                    </Grid>
                  </Grid>
                </Grid>
              )}
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("common:skill")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {skillMapping.map((skill, index) => (
                      <Grid key={"skill-filter-" + index} item>
                        <Chip
                          clickable
                          color={
                            skillSelected.includes(skill.descriptionSpriteName)
                              ? "primary"
                              : "default"
                          }
                          label={
                            <Grid container>
                              <Grid item>{skill.name}</Grid>
                            </Grid>
                          }
                          onClick={() => {
                            if (
                              skillSelected.includes(
                                skill.descriptionSpriteName
                              )
                            ) {
                              dispatchSkillSelected({
                                type: "remove",
                                payload: skill.descriptionSpriteName,
                              });
                            } else {
                              dispatchSkillSelected({
                                type: "add",
                                payload: skill.descriptionSpriteName,
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
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("card:rarity")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={11}>
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
                              {Array.from({ length: rarity }).map((_, idx) => (
                                <Grid item key={`rarity-${idx}`}>
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
                                storeName: "card-list-filter-rarities",
                              });
                            } else {
                              dispatchRaritySelected({
                                type: "add",
                                payload: rarity,
                                storeName: "card-list-filter-rarities",
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
                      !characterSelected.length &&
                      !attrSelected.length &&
                      !skillSelected.length &&
                      !raritySelected.length
                    }
                    onClick={() => {
                      dispatchCharacterSelected({
                        type: "reset",
                        payload: 0,
                        storeName: "card-list-filter-charas",
                      });
                      dispatchAttrSelected({
                        type: "reset",
                        payload: "",
                        storeName: "card-list-filter-attrs",
                      });
                      dispatchRaritySelected({
                        type: "reset",
                        payload: 0,
                        storeName: "card-list-filter-rarities",
                      });
                      dispatchSkillSelected({
                        type: "reset",
                        payload: "",
                      });
                      dispatchSupportUnitSelected({
                        type: "reset",
                        payload: "",
                        storeName: "card-list-filter-support-units",
                      });
                    }}
                    startIcon={<RotateLeft />}
                  >
                    {t("common:reset")}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!events || !eventDeckBonuses || !charaUnits}
                    onClick={(e) => {
                      setAnchorElEvent(e.currentTarget);
                    }}
                  >
                    {t("card:apply_event_filter")}
                  </Button>
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
                  sm: 6,
                  md: 3,
                },
              } as const
            )[viewGridType]
          }
        />
      </Container>
      <Popover
        open={eventOpen}
        anchorEl={anchorElEvent}
        onClose={handleEventClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Container style={{ paddingTop: "1em", paddingBottom: "1em" }}>
          <TextField
            select
            label={t("common:event")}
            value={eventId}
            onChange={(e) => setEventId(Number(e.target.value))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    size="small"
                    onClick={() => {
                      const bonuses = eventDeckBonuses!.filter(
                        (edb) => edb.eventId === eventId && edb.bonusRate === 50
                      );
                      // console.log(bonuses, eventId, eventDeckBonuses);
                      const attr = bonuses[0].cardAttr;
                      dispatchRaritySelected({
                        type: "reset",
                        payload: 0,
                        storeName: "card-list-filter-rarities",
                      });
                      dispatchAttrSelected({
                        type: "add",
                        payload: attr,
                        storeName: "card-list-filter-attrs",
                      });
                      const charas = bonuses.map(
                        (bonus) =>
                          charaUnits!.find(
                            (cu) => cu.id === bonus.gameCharacterUnitId
                          )!
                      );
                      dispatchCharacterSelected({
                        type: "reset",
                        payload: 0,
                        storeName: "card-list-filter-charas",
                      });
                      charas.forEach((chara) =>
                        dispatchCharacterSelected({
                          type: "add",
                          payload: chara.gameCharacterId,
                          storeName: "card-list-filter-charas",
                        })
                      );
                      dispatchSupportUnitSelected({
                        type: "reset",
                        payload: "",
                        storeName: "card-list-filter-support-units",
                      });
                      charas
                        .filter((chara) => chara.gameCharacterId >= 21)
                        .forEach((chara) => {
                          dispatchSupportUnitSelected({
                            type: "add",
                            payload: chara.unit,
                            storeName: "card-list-filter-support-units",
                          });
                        });
                      handleEventClose();
                    }}
                    disabled={eventId === 0}
                  >
                    <Check />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          >
            {events &&
              events.map((ev) => (
                <MenuItem key={ev.id} value={ev.id}>
                  <ContentTrans
                    original={ev.name}
                    contentKey={`event_name:${ev.id}`}
                  />
                </MenuItem>
              ))}
          </TextField>
        </Container>
      </Popover>
    </Fragment>
  );
};

export default CardList;
