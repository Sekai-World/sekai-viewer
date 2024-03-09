import {
  Button,
  Grid,
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
  // InputAdornment,
  IconButton,
  Popover,
} from "@mui/material";
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
  useEffect,
  useLayoutEffect,
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
} from "../../types.d";
import {
  cardRarityTypeToRarity,
  specialTrainingRarityTypes,
  useCachedData,
  useLocalStorage,
  useSkillMapping,
  useToggle,
} from "../../utils";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";
// import InfiniteScroll from "react-infinite-scroll-component";

import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";
import rarityBirthday from "../../assets/rarity_birthday.png";

import { useTranslation } from "react-i18next";
import {
  characterSelectReducer,
  unitSelectReducer,
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
import GridView from "./GridView";
import AgendaView from "./AgendaView";
import ComfyView from "./ComfyView";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import { useCurrentEvent } from "../../utils/apiClient";
import { useAssetI18n, useCharaName } from "../../utils/i18n";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";

type ViewGridType = "grid" | "agenda" | "comfy";

function getPaginatedCards(cards: ICardInfo[], page: number, limit: number) {
  return cards.slice(limit * (page - 1), limit * page);
}

function getMaxParam(
  card: ICardInfo,
  rarities: ICardRarity[],
  episodes: ICardEpisode[]
) {
  const rarity = rarities.find(
    (rarity) => rarity.cardRarityType === card.cardRarityType
  );

  if (!rarity) {
    console.warn(`failed to find rarity for card ${card.id} ${card.prefix}`);
    return 0;
  }

  const maxLevel = rarity.trainingMaxLevel || rarity.maxLevel;

  let maxParam =
    (Array.isArray(card.cardParameters)
      ? card.cardParameters
          .filter((cp) => cp.cardLevel === maxLevel)
          .reduce((sum, cp) => {
            sum += cp.power;
            return sum;
          }, 0)
      : card.cardParameters.param1[maxLevel] +
        card.cardParameters.param2[maxLevel] +
        card.cardParameters.param3[maxLevel]) +
    episodes
      .filter((episode) => episode.cardId === card.id)
      .reduce((sum, episode) => {
        sum += episode.power1BonusFixed;
        sum += episode.power2BonusFixed;
        sum += episode.power3BonusFixed;
        return sum;
      }, 0);
  if (
    card?.cardRarityType &&
    specialTrainingRarityTypes.includes(card?.cardRarityType)
  )
    maxParam +=
      card.specialTrainingPower1BonusFixed +
      card.specialTrainingPower2BonusFixed +
      card.specialTrainingPower3BonusFixed;

  return maxParam;
}

const ListCard: { [key: string]: React.FC<{ data?: ICardInfo }> } = {
  agenda: AgendaView,
  comfy: ComfyView,
  grid: GridView,
};

const CardList: React.FC<unknown> = observer(() => {
  const { t } = useTranslation();
  const {
    settings: { isShowSpoiler, region },
  } = useRootStore();
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
  const [filterOpened, toggleFilterOpen] = useToggle(false);
  const [sortType, setSortType] = useLocalStorage<string>(
    "card-list-filter-sort-type",
    "desc",
    false
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "card-list-filter-sort-by",
    "releaseAt",
    false
  );
  const [characterSelected, dispatchCharacterSelected] = useReducer(
    characterSelectReducer,
    JSON.parse(localStorage.getItem("card-list-filter-charas") || "[]")
  );
  const [unitSelected, dispatchUnitSelected] = useReducer(
    unitSelectReducer,
    JSON.parse(localStorage.getItem("card-list-filter-units") || "[]")
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

  useLayoutEffect(() => {
    document.title = t("title:cardList");
  }, [t]);

  useLayoutEffect(() => {
    setIsReady(
      Boolean(cardsCache && cardsCache.length) &&
        Boolean(charas && charas.length)
    );
  }, [setIsReady, cardsCache, charas]);

  useEffect(() => {
    if (!isCurrEventLoading && !!currEvent) {
      setEventId(currEvent.eventId);
    }
  }, [currEvent, isCurrEventLoading]);

  const doFilter = useCallback(() => {
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
      if (result.length && !isShowSpoiler) {
        result = result.filter(
          (c) =>
            (c.releaseAt || c.archivePublishedAt || 0) <= new Date().getTime()
        );
      }
      if (result.length && characterSelected.length) {
        result = result.filter((c) =>
          characterSelected.includes(c.characterId)
        );
      }
      if (result.length && attrSelected.length) {
        result = result.filter((c) => attrSelected.includes(c.attr));
      }
      if (result.length && supportUnitSelected.length) {
        result = result.filter(
          (c) =>
            c.supportUnit === "none" ||
            supportUnitSelected.includes(c.supportUnit)
        );
      }
      if (result.length && raritySelected.length) {
        const rarityFilter = raritySelected.map((rs) => rs.cardRarityType);
        result = result.filter((c) => rarityFilter.includes(c.cardRarityType!));
      }
      if (result.length && skillSelected.length) {
        result = result.filter((c) => {
          const skill = skills.find((s) => c.skillId === s.id);
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
        case "releaseAt": {
          let sortKey: "id" | "releaseAt" | "archivePublishedAt" = sortBy;
          if (sortKey === "releaseAt" && ["tw", "kr"].includes(region)) {
            sortKey = "archivePublishedAt";
          }
          result = result.sort((a, b) =>
            sortType === "asc"
              ? (a[sortKey] || 0) - (b[sortKey] || 0)
              : (b[sortKey] || 0) - (a[sortKey] || 0)
          );
          break;
        }
        case "rarity":
          result = result.sort((a, b) =>
            sortType === "asc"
              ? cardRarityTypeToRarity[a.cardRarityType] -
                cardRarityTypeToRarity[b.cardRarityType]
              : cardRarityTypeToRarity[b.cardRarityType] -
                cardRarityTypeToRarity[a.cardRarityType]
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
    rarities,
    episodes,
    skills,
    isShowSpoiler,
    characterSelected,
    attrSelected,
    supportUnitSelected,
    raritySelected,
    skillSelected,
    sortBy,
    region,
    sortType,
  ]);

  const resetFilter = useCallback(() => {
    dispatchCharacterSelected({
      payload: 0,
      storeName: "card-list-filter-charas",
      type: "reset",
    });
    dispatchUnitSelected({
      payload: "",
      storeName: "card-list-filter-units",
      type: "reset",
    });
    dispatchAttrSelected({
      payload: "",
      storeName: "card-list-filter-attrs",
      type: "reset",
    });
    dispatchRaritySelected({
      payload: {
        cardRarityType: "",
        rarity: 0,
      },
      storeName: "card-list-filter-rarities",
      type: "reset",
    });
    dispatchSkillSelected({
      payload: "",
      type: "reset",
    });
    dispatchSupportUnitSelected({
      payload: "",
      storeName: "card-list-filter-support-units",
      type: "reset",
    });
  }, []);

  useEffect(() => {
    if (isReady) doFilter();
  }, [isReady, doFilter]);

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
      <TypographyHeader>{t("common:card")}</TypographyHeader>
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
              !unitSelected.length &&
              !attrSelected.length &&
              !skillSelected.length &&
              !raritySelected.length
            }
          >
            <ToggleButton
              value=""
              color="primary"
              selected={filterOpened}
              onClick={() => toggleFilterOpen()}
            >
              {filterOpened ? <Filter /> : <FilterOutline />}
              {filterOpened ? <Sort /> : <SortOutlined />}
            </ToggleButton>
          </Badge>
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
                  <TypographyCaption>{t("common:unit")}</TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {(unitProfiles || [])
                      .sort((a, b) => a.seq - b.seq)
                      .map((unitProfile) => (
                        <Grid
                          key={"unit-profile-filter-" + unitProfile.unit}
                          item
                        >
                          <Chip
                            clickable
                            color={
                              unitSelected.includes(unitProfile.unit)
                                ? "primary"
                                : "default"
                            }
                            avatar={
                              <Avatar
                                alt={unitProfile.unit}
                                src={
                                  UnitLogoMiniMap[unitProfile.unit as "idol"]
                                }
                              />
                            }
                            label={
                              <Typography variant="body2">
                                {getTranslated(
                                  `unit_profile:${unitProfile.unit}.name`,
                                  unitProfile.unitName
                                )}
                              </Typography>
                            }
                            onClick={() => {
                              if (charas?.length) {
                                if (unitSelected.includes(unitProfile.unit)) {
                                  dispatchUnitSelected({
                                    payload: unitProfile.unit,
                                    storeName: "card-list-filter-units",
                                    type: "remove",
                                  });
                                  const filteredCharas = charas.filter(
                                    (chara) => chara.unit === unitProfile.unit
                                  );
                                  filteredCharas.forEach((chara) =>
                                    dispatchCharacterSelected({
                                      payload: chara.id,
                                      storeName: "card-list-filter-charas",
                                      type: "remove",
                                    })
                                  );
                                } else {
                                  dispatchUnitSelected({
                                    payload: unitProfile.unit,
                                    storeName: "card-list-filter-units",
                                    type: "add",
                                  });
                                  const filteredCharas = charas.filter(
                                    (chara) => chara.unit === unitProfile.unit
                                  );
                                  filteredCharas.forEach((chara) =>
                                    dispatchCharacterSelected({
                                      payload: chara.id,
                                      storeName: "card-list-filter-charas",
                                      type: "add",
                                    })
                                  );
                                }
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
                  <TypographyCaption>
                    {t("filter:character.caption")}
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {(charas || []).map((chara) => (
                      <Grid key={"chara-filter-" + chara.id} item>
                        <Chip
                          clickable
                          color={
                            characterSelected.includes(chara.id)
                              ? "primary"
                              : "default"
                          }
                          avatar={
                            <Avatar
                              alt={getCharaName(chara.id)}
                              src={
                                charaIcons[
                                  `CharaIcon${chara.id}` as "CharaIcon1"
                                ]
                              }
                            />
                          }
                          label={getCharaName(chara.id)}
                          onClick={() => {
                            if (characterSelected.includes(chara.id)) {
                              dispatchCharacterSelected({
                                payload: chara.id,
                                storeName: "card-list-filter-charas",
                                type: "remove",
                              });
                            } else {
                              dispatchCharacterSelected({
                                payload: chara.id,
                                storeName: "card-list-filter-charas",
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
                  <TypographyCaption>{t("common:attribute")}</TypographyCaption>
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
                                  payload: attr,
                                  storeName: "card-list-filter-attrs",
                                  type: "remove",
                                });
                              } else {
                                dispatchAttrSelected({
                                  payload: attr,
                                  storeName: "card-list-filter-attrs",
                                  type: "add",
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
                    <TypographyCaption>
                      {t("common:support_unit")}
                    </TypographyCaption>
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
                                    payload: supportUnit,
                                    storeName: "card-list-filter-support-units",
                                    type: "remove",
                                  });
                                } else {
                                  dispatchSupportUnitSelected({
                                    payload: supportUnit,
                                    storeName: "card-list-filter-support-units",
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
                  <TypographyCaption>{t("common:skill")}</TypographyCaption>
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
                                payload: skill.descriptionSpriteName,
                                type: "remove",
                              });
                            } else {
                              dispatchSkillSelected({
                                payload: skill.descriptionSpriteName,
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
                  <TypographyCaption>{t("card:rarity")}</TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {[1, 2, 3, 4, 5].map((rarity) => (
                      <Grid key={rarity} item>
                        <Chip
                          clickable
                          color={
                            raritySelected
                              .map((rs) => rs.rarity)
                              .includes(rarity)
                              ? "primary"
                              : "default"
                          }
                          label={
                            <Grid container>
                              {Array.from({
                                length: rarity === 5 ? 1 : rarity,
                              }).map((_, idx) => (
                                <Grid item key={`rarity-${idx}`}>
                                  <img
                                    src={
                                      rarity >= 5
                                        ? rarityBirthday
                                        : rarity >= 3
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
                            if (
                              raritySelected
                                .map((rs) => rs.rarity)
                                .includes(rarity)
                            ) {
                              dispatchRaritySelected({
                                payload: {
                                  cardRarityType:
                                    rarity === 5
                                      ? "rarity_birthday"
                                      : `rarity_${rarity}`,
                                  rarity,
                                },
                                storeName: "card-list-filter-rarities",
                                type: "remove",
                              });
                            } else {
                              dispatchRaritySelected({
                                payload: {
                                  cardRarityType:
                                    rarity === 5
                                      ? "rarity_birthday"
                                      : `rarity_${rarity}`,
                                  rarity,
                                },
                                storeName: "card-list-filter-rarities",
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
                    onClick={() => {
                      doFilter();
                      toggleFilterOpen();
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
                      !characterSelected.length &&
                      !unitSelected.length &&
                      !attrSelected.length &&
                      !skillSelected.length &&
                      !raritySelected.length
                    }
                    onClick={() => resetFilter()}
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
          </PaperContainer>
        </Collapse>
        <InfiniteScroll<ICardInfo>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={cards}
          gridSize={
            (
              {
                agenda: {
                  xs: 12,
                },
                comfy: {
                  md: 3,
                  sm: 6,
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
      <Popover
        open={eventOpen}
        anchorEl={anchorElEvent}
        onClose={handleEventClose}
        anchorOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        transformOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
      >
        <Container style={{ paddingBottom: "1em", paddingTop: "1em" }}>
          <Grid container alignItems="center">
            <Grid item>
              <TextField
                select
                label={t("common:event")}
                value={eventId}
                onChange={(e) => setEventId(Number(e.target.value))}
              >
                {events &&
                  events
                    .slice()
                    .reverse()
                    .map((ev) => (
                      <MenuItem key={ev.id} value={ev.id}>
                        <ContentTrans
                          original={ev.name}
                          contentKey={`event_name:${ev.id}`}
                        />
                      </MenuItem>
                    ))}
              </TextField>
            </Grid>
            <Grid item>
              <IconButton
                size="small"
                onClick={() => {
                  const bonuses = eventDeckBonuses!.filter(
                    (edb) => edb.eventId === eventId && edb.bonusRate === 50
                  );
                  // console.log(bonuses, eventId, eventDeckBonuses);
                  const attr = bonuses[0].cardAttr;
                  dispatchRaritySelected({
                    payload: {
                      cardRarityType: "",
                      rarity: 0,
                    },
                    storeName: "card-list-filter-rarities",
                    type: "reset",
                  });
                  dispatchAttrSelected({
                    payload: attr,
                    storeName: "card-list-filter-attrs",
                    type: "add",
                  });
                  const charas = bonuses.map(
                    (bonus) =>
                      charaUnits!.find(
                        (cu) => cu.id === bonus.gameCharacterUnitId
                      )!
                  );
                  dispatchCharacterSelected({
                    payload: 0,
                    storeName: "card-list-filter-charas",
                    type: "reset",
                  });
                  charas.forEach((chara) =>
                    dispatchCharacterSelected({
                      payload: chara.gameCharacterId,
                      storeName: "card-list-filter-charas",
                      type: "add",
                    })
                  );
                  dispatchSupportUnitSelected({
                    payload: "",
                    storeName: "card-list-filter-support-units",
                    type: "reset",
                  });
                  charas
                    .filter((chara) => chara.gameCharacterId >= 21)
                    .forEach((chara) => {
                      dispatchSupportUnitSelected({
                        payload: chara.unit,
                        storeName: "card-list-filter-support-units",
                        type: "add",
                      });
                    });
                  handleEventClose();
                }}
                disabled={eventId === 0}
              >
                <Check />
              </IconButton>
            </Grid>
          </Grid>
        </Container>
      </Popover>
    </Fragment>
  );
});

export default CardList;
