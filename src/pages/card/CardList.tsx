import clsx from "clsx";
import {
  Button,
  Grid,
  Container,
  Collapse,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Badge,
  TextField,
  IconButton,
  Popover,
  Tooltip,
  capitalize,
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
  const [searchTitle, setSearchTitle] = useState("");

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
      !!cardsCache?.length &&
        !!charas?.length &&
        !!rarities?.length &&
        !!episodes?.length &&
        !!skills?.length
    );
  }, [
    rarities?.length,
    episodes?.length,
    skills?.length,
    cardsCache?.length,
    charas?.length,
  ]);

  useEffect(() => {
    if (!isCurrEventLoading && !!currEvent) {
      setEventId(currEvent.eventId);
    }
  }, [currEvent, isCurrEventLoading]);

  const doFilter = useCallback(() => {
    if (
      cardsCache?.length &&
      rarities?.length &&
      episodes?.length &&
      skills?.length
    ) {
      const result = cardsCache.filter((c) => {
        if (
          !isShowSpoiler &&
          (c.releaseAt || c.archivePublishedAt || 0) > new Date().getTime()
        ) {
          return false;
        }
        if (
          characterSelected.length &&
          !characterSelected.includes(c.characterId)
        ) {
          return false;
        }
        if (attrSelected.length && !attrSelected.includes(c.attr)) {
          return false;
        }
        if (
          supportUnitSelected.length &&
          c.supportUnit !== "none" &&
          !supportUnitSelected.includes(c.supportUnit)
        ) {
          return false;
        }
        if (raritySelected.length) {
          const rarityFilter = raritySelected.map((rs) => rs.cardRarityType);
          if (!rarityFilter.includes(c.cardRarityType!)) {
            return false;
          }
        }
        if (skillSelected.length) {
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
            if (!skillSelected.includes(descriptionSpriteName)) {
              return false;
            }
          }
        }
        if (searchTitle) {
          if (!c.prefix.toLowerCase().includes(searchTitle.toLowerCase())) {
            return false;
          }
        }
        return true;
      });

      // sort cards
      result.sort((a, b) => {
        let compare = 0;
        switch (sortBy) {
          case "id":
          case "releaseAt": {
            let sortKey: "id" | "releaseAt" | "archivePublishedAt" = sortBy;
            if (
              sortKey === "releaseAt" &&
              ["tw", "kr", "cn"].includes(region)
            ) {
              sortKey = "archivePublishedAt";
            }
            compare = (a[sortKey] || 0) - (b[sortKey] || 0);
            break;
          }
          case "rarity":
            compare =
              cardRarityTypeToRarity[a.cardRarityType] -
              cardRarityTypeToRarity[b.cardRarityType];
            break;
          case "power":
            compare =
              getMaxParam(a, rarities, episodes) -
              getMaxParam(b, rarities, episodes);
            break;
        }
        return sortType === "asc" ? compare : -compare;
      });

      setSortedCache(result);
      setCards([]);
      setPage(0);
    }
  }, [
    attrSelected,
    cardsCache,
    characterSelected,
    episodes,
    isShowSpoiler,
    rarities,
    raritySelected,
    region,
    searchTitle,
    skillSelected,
    skills,
    sortBy,
    sortType,
    supportUnitSelected,
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
    setSearchTitle("");
  }, []);

  useEffect(() => {
    if (isReady) doFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

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

  const handleUnitIconClick = useCallback(
    (unitProfile: IUnitProfile) => {
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
    },
    [charas, unitSelected, dispatchUnitSelected, dispatchCharacterSelected]
  );

  const handleCharaIconClick = useCallback(
    (chara: IGameChara) => {
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
    },
    [characterSelected, dispatchCharacterSelected]
  );

  const handleAttrIconClick = useCallback(
    (attr: string) => {
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
    },
    [attrSelected, dispatchAttrSelected]
  );

  const handleSupportUnitIconClick = useCallback(
    (supportUnit: string) => {
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
    },
    [supportUnitSelected, dispatchSupportUnitSelected]
  );

  const handleSkillIconClick = useCallback(
    (skill: { descriptionSpriteName: string; name: string }) => {
      if (skillSelected.includes(skill.descriptionSpriteName)) {
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
    },
    [skillSelected, dispatchSkillSelected]
  );

  const handleRarityIconClick = useCallback(
    (rarity: number) => {
      if (raritySelected.map((rs) => rs.rarity).includes(rarity)) {
        dispatchRaritySelected({
          payload: {
            cardRarityType:
              rarity === 5 ? "rarity_birthday" : `rarity_${rarity}`,
            rarity,
          },
          storeName: "card-list-filter-rarities",
          type: "remove",
        });
      } else {
        dispatchRaritySelected({
          payload: {
            cardRarityType:
              rarity === 5 ? "rarity_birthday" : `rarity_${rarity}`,
            rarity,
          },
          storeName: "card-list-filter-rarities",
          type: "add",
        });
      }
    },
    [raritySelected, dispatchRaritySelected]
  );

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
          <Grid item>
            <Badge
              color="secondary"
              variant="dot"
              invisible={
                !characterSelected.length &&
                !unitSelected.length &&
                !attrSelected.length &&
                !skillSelected.length &&
                !raritySelected.length &&
                !supportUnitSelected.length &&
                !searchTitle
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
                          <Tooltip
                            title={getTranslated(
                              `unit_profile:${unitProfile.unit}.name`,
                              unitProfile.unitName
                            )}
                            placement="top"
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleUnitIconClick(unitProfile)}
                              className={clsx({
                                "icon-not-selected": !unitSelected.includes(
                                  unitProfile.unit
                                ),
                                "icon-selected": unitSelected.includes(
                                  unitProfile.unit
                                ),
                              })}
                            >
                              <Avatar
                                alt={unitProfile.unit}
                                src={
                                  UnitLogoMiniMap[unitProfile.unit as "idol"]
                                }
                                sx={{ width: 32, height: 32 }}
                              />
                            </IconButton>
                          </Tooltip>
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
                  <TypographyCaption sx={{ paddingTop: "0.375em" }}>
                    {t("filter:character.caption")}
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {(charas || []).map((chara) => (
                      <Grid key={"chara-filter-" + chara.id} item>
                        <Tooltip title={getCharaName(chara.id)} placement="top">
                          <IconButton
                            size="small"
                            onClick={() => handleCharaIconClick(chara)}
                            className={clsx({
                              "icon-not-selected": !characterSelected.includes(
                                chara.id
                              ),
                              "icon-selected": characterSelected.includes(
                                chara.id
                              ),
                            })}
                          >
                            <Avatar
                              alt={getCharaName(chara.id)}
                              src={
                                charaIcons[
                                  `CharaIcon${chara.id}` as "CharaIcon1"
                                ]
                              }
                              sx={{ width: 32, height: 32 }}
                            />
                          </IconButton>
                        </Tooltip>
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
                          <Tooltip title={capitalize(attr)} placement="top">
                            <IconButton
                              size="small"
                              onClick={() => handleAttrIconClick(attr)}
                              className={clsx({
                                "icon-not-selected":
                                  !attrSelected.includes(attr),
                                "icon-selected": attrSelected.includes(attr),
                              })}
                            >
                              <Avatar
                                alt={attr}
                                src={attrIconMap[attr as "cool"]}
                                sx={{ width: 32, height: 32 }}
                              />
                            </IconButton>
                          </Tooltip>
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
                            <Tooltip
                              title={getTranslated(
                                `unit_profile:${supportUnit}.name`,
                                unitProfiles.find(
                                  (up) => up.unit === supportUnit
                                )!.unitName
                              )}
                              placement="top"
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleSupportUnitIconClick(supportUnit)
                                }
                                className={clsx({
                                  "icon-not-selected":
                                    !supportUnitSelected.includes(supportUnit),
                                  "icon-selected":
                                    supportUnitSelected.includes(supportUnit),
                                })}
                              >
                                <Avatar
                                  alt={supportUnit}
                                  src={UnitLogoMiniMap[supportUnit as "idol"]}
                                  sx={{ width: 32, height: 32 }}
                                />
                              </IconButton>
                            </Tooltip>
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
                          onClick={() => handleSkillIconClick(skill)}
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
                            <Grid container alignItems="center">
                              {Array.from({
                                length: rarity === 5 ? 1 : rarity,
                              }).map((_, idx) => (
                                <Grid
                                  item
                                  key={`rarity-${idx}`}
                                  sx={{ height: 16 }}
                                >
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
                          onClick={() => handleRarityIconClick(rarity)}
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
                      !raritySelected.length &&
                      !searchTitle
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
                  doFilter();
                  handleEventClose();
                  toggleFilterOpen();
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
