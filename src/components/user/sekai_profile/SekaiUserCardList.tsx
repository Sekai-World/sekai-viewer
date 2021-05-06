import {
  Avatar,
  Badge,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  Add,
  Check,
  // Clear,
  RotateLeft,
  Save as SaveIcon,
  Sort,
  SortOutlined,
} from "@material-ui/icons";
import { Filter, FilterOutline } from "mdi-material-ui";
import React, {
  // Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { SettingContext, UserContext } from "../../../context";
import { useInteractiveStyles } from "../../../styles/interactive";
import { useCurrentEvent, useStrapi } from "../../../utils/apiClient";
import { CardThumb } from "../../subs/CardThumb";
// import { useInteractiveStyles } from "../../../styles/interactive";
import rarityNormal from "../../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../../assets/rarity_star_afterTraining.png";
import {
  attrSelectReducer,
  characterSelectReducer,
  raritySelectReducer,
  supportUnitSelectReducer,
} from "../../../stores/reducers";
import {
  attrIconMap,
  charaIcons,
  UnitLogoMiniMap,
} from "../../../utils/resources";
import {
  ICardInfo,
  IEventDeckBonus,
  IEventInfo,
  IGameChara,
  IGameCharaUnit,
  ITeamCardState,
  IUnitProfile,
} from "../../../types";
import {
  useAlertSnackbar,
  useCachedData,
  useCharaName,
  useLocalStorage,
} from "../../../utils";
import { ContentTrans } from "../../subs/ContentTrans";
import { useAssetI18n } from "../../../utils/i18n";

const SekaiUserCardList = () => {
  // const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { jwtToken, sekaiProfile, updateSekaiProfile } = useContext(
    UserContext
  )!;
  const { putSekaiCardList, deleteSekaiCardList } = useStrapi(jwtToken);
  const { contentTransMode } = useContext(SettingContext)!;
  const getCharaName = useCharaName(contentTransMode);
  const { currEvent, isLoading: isCurrEventLoading } = useCurrentEvent();
  const { getTranslated } = useAssetI18n();
  const { showError, showSuccess } = useAlertSnackbar();

  const [cards] = useCachedData<ICardInfo>("cards");
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [events] = useCachedData<IEventInfo>("events");
  const [eventDeckBonuses] = useCachedData<IEventDeckBonus>("eventDeckBonuses");
  const [charaUnits] = useCachedData<IGameCharaUnit>("gameCharacterUnits");
  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");

  const [characterId, setCharacterId] = useState<number>(0);
  const [rarity, setRarity] = useState<number>(4);
  const [filteredCards, setFilteredCards] = useState<ICardInfo[]>([]);

  const [cardList, setCardList] = useState<ITeamCardState[]>([]);
  // const [displayCardList, setDisplayCardList] = useState<ITeamCardState[]>([]);
  const [card, setCard] = useState<ITeamCardState>();
  const [editList, setEditList] = useState<ITeamCardState[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteCardIds, setDeleteCardIds] = useState<number[]>([]);
  const [addCardIds, setAddCardIds] = useState<number[]>([]);
  const [filterOpened, setFilterOpened] = useState(false);
  const [characterSelected, dispatchCharacterSelected] = useReducer(
    characterSelectReducer,
    JSON.parse(
      localStorage.getItem("user-profile-sekai-cards-filter-charas") || "[]"
    )
  );
  const [attrSelected, dispatchAttrSelected] = useReducer(
    attrSelectReducer,
    JSON.parse(
      localStorage.getItem("user-profile-sekai-cards-filter-attrs") || "[]"
    )
  );
  const [raritySelected, dispatchRaritySelected] = useReducer(
    raritySelectReducer,
    JSON.parse(
      localStorage.getItem("user-profile-sekai-cards-filter-rarities") || "[]"
    )
  );
  const [supportUnitSelected, dispatchSupportUnitSelected] = useReducer(
    supportUnitSelectReducer,
    JSON.parse(
      localStorage.getItem("user-profile-sekai-cards-filter-support-units") ||
        "[]"
    )
  );
  const [sortType, setSortType] = useLocalStorage<string>(
    "user-profile-sekai-cards-sort-type",
    "asc"
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "user-profile-sekai-cards-sort-by",
    "id"
  );
  const [addCardDialogVisible, setAddCardDialogVisible] = useState(false);

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

  const [anchorElEvent, setAnchorElEvent] = useState<HTMLButtonElement | null>(
    null
  );
  const eventOpen = useMemo(() => Boolean(anchorElEvent), [anchorElEvent]);
  const [eventId, setEventId] = useState(1);

  useEffect(() => {
    if (cards && cards.length && sekaiProfile) {
      let _cardList = (sekaiProfile.cardList || []).map((elem) =>
        Object.assign({}, elem, {
          card: cards.find((c) => c.id === elem.cardId)!,
        })
      );
      // apply modifications
      _cardList = _cardList.filter(
        (card) => !deleteCardIds.includes(card.cardId)
      );
      _cardList = _cardList.map((card) =>
        Object.assign(
          {},
          card,
          editList.find((el) => el.cardId === card.cardId) || {}
        )
      );
      _cardList = [
        ..._cardList,
        ...addCardIds.map((cardId) =>
          Object.assign(
            {},
            editList.find((el) => el.cardId === cardId),
            {
              card: cards.find((c) => c.id === cardId)!,
            }
          )
        ),
      ];
      if (characterSelected.length) {
        _cardList = _cardList.filter((elem) =>
          characterSelected.includes(elem.card.characterId)
        );
      }
      if (attrSelected.length) {
        _cardList = _cardList.filter((elem) =>
          attrSelected.includes(elem.card.attr)
        );
      }
      if (raritySelected.length) {
        _cardList = _cardList.filter((elem) =>
          raritySelected.includes(elem.card.rarity)
        );
      }
      if (supportUnitSelected.length) {
        _cardList = _cardList.filter(
          (elem) =>
            elem.card.supportUnit === "none" ||
            supportUnitSelected.includes(elem.card.supportUnit)
        );
      }
      setCardList(
        _cardList
          .sort((a, b) =>
            sortBy === "level"
              ? sortType === "asc"
                ? a.level - b.level
                : b.level - a.level
              : sortType === "asc"
              ? a.card[sortBy as "id"] - b.card[sortBy as "id"]
              : b.card[sortBy as "id"] - a.card[sortBy as "id"]
          )
          .map((card) => {
            const { card: _, ...newCard } = card;
            return newCard;
          })
      );
    }
  }, [
    addCardIds,
    attrSelected,
    cards,
    characterSelected,
    deleteCardIds,
    editList,
    raritySelected,
    sekaiProfile,
    sortBy,
    sortType,
    supportUnitSelected,
  ]);

  useEffect(() => {
    if (!isCurrEventLoading) {
      setEventId(currEvent.eventId);
    }
  }, [currEvent, isCurrEventLoading]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, card: ITeamCardState) => {
      setAnchorEl(event.currentTarget);
      setCard(card);
    },
    []
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setCard(undefined);
  }, []);

  const handleEventClose = useCallback(() => {
    setAnchorElEvent(null);
  }, []);

  const handleChange = useCallback(
    (value: any, key: string) => {
      if (card) {
        const newCard = Object.assign({}, card, {
          [key]: value,
        });
        setCard(newCard);
        const idx = cardList.findIndex((c) => c.cardId === card.cardId);
        setCardList((cards) => [
          ...cards.slice(0, idx),
          newCard,
          ...cards.slice(idx + 1),
        ]);

        const editIdx = editList.findIndex((c) => c.cardId === card.cardId);
        if (editIdx === -1) {
          setEditList((cards) => [...cards, newCard]);
        } else {
          setEditList((cards) => [
            ...cards.slice(0, editIdx),
            newCard,
            ...cards.slice(editIdx + 1),
          ]);
        }
      }
    },
    [card, cardList, editList]
  );

  const handleDelete = useCallback(() => {
    if (!card) return;
    const idx = cardList.findIndex((c) => c.cardId === card.cardId);
    const editIdx = editList.findIndex((el) => el.cardId === card.cardId);
    if (editIdx !== -1)
      setEditList((cards) => [
        ...cards.slice(0, editIdx),
        ...cards.slice(editIdx + 1),
      ]);
    const addIdx = addCardIds.findIndex((id) => card.cardId === id);
    if (addIdx !== -1)
      setAddCardIds((ids) => [
        ...ids.slice(0, addIdx),
        ...ids.slice(addIdx + 1),
      ]);
    else setDeleteCardIds((dc) => [...dc, cardList![idx].cardId]);
    setCardList((cards) => [...cards.slice(0, idx), ...cards.slice(idx + 1)]);
    handleClose();
  }, [addCardIds, card, cardList, editList, handleClose]);

  const filterCards = useCallback(() => {
    if (!cards || !cards.length) return;
    setFilteredCards(
      cards.filter(
        (card) =>
          !cardList.find((cl) => cl.cardId === card.id) &&
          (characterId
            ? card.characterId === characterId && card.rarity === rarity
            : card.rarity === rarity)
      )
    );
  }, [cardList, cards, characterId, rarity]);

  const handleCardThumbClick = useCallback((card: ICardInfo) => {
    const maxLevel = [0, 20, 30, 50, 60];
    // const maxPower = card.cardParameters
    //   .filter((elem) => elem.cardLevel === maxLevel[card.rarity])
    //   .reduce((sum, elem) => sum + elem.power, 0);
    setEditList((list) => [
      ...list,
      {
        cardId: card.id,
        masterRank: 0,
        skillLevel: 1,
        level: maxLevel[card.rarity],
        trained: card.rarity >= 3,
        story1Unlock: true,
        story2Unlock: true,
      },
    ]);
    setAddCardIds((ids) => [...ids, card.id]);
    // setCardList((list) => [
    //   ...list,
    //   {
    //     cardId: card.id,
    //     masterRank: 0,
    //     skillLevel: 1,
    //     level: maxLevel[card.rarity],
    //     trained: card.rarity >= 3,
    //     story1Unlock: true,
    //     story2Unlock: true,
    //   },
    // ]);
    setFilteredCards((cards) => cards.filter((c) => c.id !== card.id));
  }, []);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Grid container justify="space-between">
          <Grid item>
            <Grid container spacing={1}>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={
                    isSaving || (!editList.length && !deleteCardIds.length)
                  }
                  startIcon={
                    isSaving ? <CircularProgress size={24} /> : <SaveIcon />
                  }
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      if (editList.length)
                        await putSekaiCardList(sekaiProfile!.id, editList);
                      if (deleteCardIds.length)
                        await deleteSekaiCardList(
                          sekaiProfile!.id,
                          deleteCardIds
                        );
                      setEditList([]);
                      setDeleteCardIds([]);
                      setAddCardIds([]);
                      updateSekaiProfile({
                        cardList: cardList,
                      });
                      showSuccess(t("user:profile.card_list.submit_success"));
                    } catch (error) {
                      showError(t("user:profile.card_list.submit_error"));
                    }
                    setIsSaving(false);
                  }}
                >
                  {t("common:save")}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={
                    isSaving ||
                    !sekaiProfile ||
                    (!deleteCardIds.length && !editList.length)
                  }
                  onClick={() => {
                    setEditList([]);
                    setDeleteCardIds([]);
                    setAddCardIds([]);
                    setCardList(
                      sekaiProfile!.cardList ? [...sekaiProfile!.cardList] : []
                    );
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
                  disabled={isSaving || !sekaiProfile}
                  onClick={() => {
                    setAddCardDialogVisible(true);
                  }}
                  startIcon={<Add />}
                >
                  {t("user:profile.card_list.button.add_card")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container spacing={1}>
              <Grid item>
                <Badge
                  color="secondary"
                  variant="dot"
                  invisible={
                    !characterSelected.length &&
                    !attrSelected.length &&
                    !raritySelected.length
                  }
                >
                  <Button
                    size="medium"
                    onClick={() => setFilterOpened((v) => !v)}
                    variant="outlined"
                  >
                    {filterOpened ? <Filter /> : <FilterOutline />}
                    {filterOpened ? <Sort /> : <SortOutlined />}
                  </Button>
                </Badge>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={filterOpened}>
          <Grid container direction="column" spacing={2}>
            <Grid item container xs={12} alignItems="center" spacing={1}>
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
                              charaIcons[`CharaIcon${idx + 1}` as "CharaIcon1"]
                            }
                          />
                        }
                        label={getCharaName(idx + 1)}
                        onClick={() => {
                          if (characterSelected.includes(idx + 1)) {
                            dispatchCharacterSelected({
                              type: "remove",
                              payload: idx + 1,
                              storeName:
                                "user-profile-sekai-cards-filter-charas",
                            });
                          } else {
                            dispatchCharacterSelected({
                              type: "add",
                              payload: idx + 1,
                              storeName:
                                "user-profile-sekai-cards-filter-charas",
                            });
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
            <Grid item container xs={12} alignItems="center" spacing={1}>
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
                            attrSelected.includes(attr) ? "primary" : "default"
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
                                storeName:
                                  "user-profile-sekai-cards-filter-attrs",
                              });
                            } else {
                              dispatchAttrSelected({
                                type: "add",
                                payload: attr,
                                storeName:
                                  "user-profile-sekai-cards-filter-attrs",
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
                justify="space-between"
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
                                  storeName:
                                    "user-profile-sekai-cards-filter-support-units",
                                });
                              } else {
                                dispatchSupportUnitSelected({
                                  type: "add",
                                  payload: supportUnit,
                                  storeName:
                                    "user-profile-sekai-cards-filter-support-units",
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
            <Grid item container xs={12} alignItems="center" spacing={1}>
              <Grid item xs={12} md={1}>
                <Typography classes={{ root: interactiveClasses.caption }}>
                  {t("card:rarity")}
                </Typography>
              </Grid>
              <Grid item xs={12} md={11}>
                <Grid container spacing={1}>
                  {[1, 2, 3, 4].map((rarity) => (
                    <Grid key={`rarity-${rarity}`} item>
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
                              <Grid key={`rarity-${rarity}-${idx}`} item>
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
                              storeName:
                                "user-profile-sekai-cards-filter-rarities",
                            });
                          } else {
                            dispatchRaritySelected({
                              type: "add",
                              payload: rarity,
                              storeName:
                                "user-profile-sekai-cards-filter-rarities",
                            });
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
            <Grid item container xs={12} alignItems="center" spacing={1}>
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
                        <MenuItem value="rarity">{t("common:rarity")}</MenuItem>
                        <MenuItem value="level">{t("common:level")}</MenuItem>
                        <MenuItem value="releaseAt">
                          {t("common:startAt")}
                        </MenuItem>
                        <MenuItem value="power" disabled>
                          {t("card:power")}
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
                    !characterSelected.length &&
                    !attrSelected.length &&
                    // !skillSelected.length &&
                    !raritySelected.length
                  }
                  onClick={() => {
                    dispatchCharacterSelected({
                      type: "reset",
                      payload: 0,
                      storeName: "user-profile-sekai-cards-filter-charas",
                    });
                    dispatchAttrSelected({
                      type: "reset",
                      payload: "",
                      storeName: "user-profile-sekai-cards-filter-attrs",
                    });
                    dispatchRaritySelected({
                      type: "reset",
                      payload: 0,
                      storeName: "user-profile-sekai-cards-filter-rarities",
                    });
                    // dispatchSkillSelected({
                    //   type: "reset",
                    //   payload: "",
                    // });
                    dispatchSupportUnitSelected({
                      type: "reset",
                      payload: "",
                      storeName:
                        "user-profile-sekai-cards-filter-support-units",
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
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          {/* {JSON.stringify(cardList)} */}
          {cardList.map((card) => (
            <Grid item xs={3} sm={2} lg={1} key={card.cardId}>
              <CardThumb
                cardId={card.cardId}
                trained={card.trained}
                level={card.level}
                masterRank={card.masterRank}
                onClick={(e) => handleClick(e, card)}
                style={{ cursor: "pointer" }}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        {card && (
          <Container>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <TextField
                  label={t("card:cardLevel")}
                  value={card.level}
                  type="number"
                  onChange={(e) =>
                    handleChange(Number(e.target.value), "level")
                  }
                  inputProps={{
                    min: "1",
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label={t(
                    "user:profile.import_card.table.row.card_master_rank"
                  )}
                  value={card.masterRank}
                  type="number"
                  onChange={(e) =>
                    handleChange(Number(e.target.value), "masterRank")
                  }
                  inputProps={{
                    min: "0",
                    max: "5",
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label={t("card:skillLevel")}
                  value={card.skillLevel}
                  type="number"
                  onChange={(e) =>
                    handleChange(Number(e.target.value), "skillLevel")
                  }
                  inputProps={{
                    min: "1",
                    max: "4",
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={<Switch checked={card.trained} />}
                  label={t("card:trained")}
                  onChange={(e, checked) => handleChange(checked, "trained")}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={<Switch checked={card.story1Unlock} />}
                  label={t("card:sideStory1Unlocked")}
                  onChange={(e, checked) =>
                    handleChange(checked, "story1Unlock")
                  }
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={<Switch checked={card.story2Unlock} />}
                  label={t("card:sideStory2Unlocked")}
                  onChange={(e, checked) =>
                    handleChange(checked, "story2Unlock")
                  }
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleDelete}
                >
                  {t("common:delete")}
                </Button>
              </Grid>
            </Grid>
          </Container>
        )}
      </Popover>
      <Dialog
        open={addCardDialogVisible}
        onClose={() => {
          // setFilteredCards([]);
          setAddCardDialogVisible(false);
        }}
      >
        <DialogTitle>{t("music_recommend:addCardDialog.title")}</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <FormControl style={{ minWidth: 200 }}>
                <InputLabel id="add-card-dialog-select-chara-label">
                  {t("music_recommend:addCardDialog.selectChara")}
                </InputLabel>
                <Select
                  labelId="add-card-dialog-select-chara-label"
                  value={characterId}
                  onChange={(e) => setCharacterId(e.target.value as number)}
                >
                  <MenuItem value={0}>{t("common:all")}</MenuItem>
                  {charas &&
                    charas.map((chara) => (
                      <MenuItem
                        key={`chara-select-item-${chara.id}`}
                        value={chara.id}
                      >
                        {getCharaName(chara.id)}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl style={{ minWidth: 120 }}>
                <InputLabel id="add-card-dialog-select-rarity-label">
                  {t("music_recommend:addCardDialog.selectRarity")}
                </InputLabel>
                <Select
                  labelId="add-card-dialog-select-rarity-label"
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value as number)}
                >
                  {Array.from({ length: 4 }).map((_, index) => (
                    <MenuItem
                      key={`rarity-select-item-${index + 1}`}
                      value={index + 1}
                    >
                      {index + 1 >= 3
                        ? Array.from({ length: index + 1 }).map((_, id) => (
                            <img
                              src={rarityAfterTraining}
                              alt={`star-${id}`}
                              key={`star-${id}`}
                              height="16"
                            />
                          ))
                        : Array.from({ length: index + 1 }).map((_, id) => (
                            <img
                              src={rarityNormal}
                              alt={`star-${id}`}
                              key={`star-${id}`}
                              height="16"
                            />
                          ))}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => filterCards()}
              >
                {t("common:search")}
              </Button>
            </Grid>
          </Grid>
          <Grid container direction="row" spacing={1}>
            {filteredCards.map((card) => (
              <Grid key={`filtered-card-${card.id}`} item xs={4} md={3} lg={2}>
                <CardThumb
                  cardId={card.id}
                  onClick={() => handleCardThumbClick(card)}
                  style={{ cursor: "pointer" }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        {/* <DialogActions></DialogActions> */}
      </Dialog>
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
                        storeName: "user-profile-sekai-cards-filter-rarities",
                      });
                      dispatchAttrSelected({
                        type: "add",
                        payload: attr,
                        storeName: "user-profile-sekai-cards-filter-attrs",
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
                        storeName: "user-profile-sekai-cards-filter-charas",
                      });
                      charas.forEach((chara) =>
                        dispatchCharacterSelected({
                          type: "add",
                          payload: chara.gameCharacterId,
                          storeName: "user-profile-sekai-cards-filter-charas",
                        })
                      );
                      dispatchSupportUnitSelected({
                        type: "reset",
                        payload: "",
                        storeName:
                          "user-profile-sekai-cards-filter-support-units",
                      });
                      charas
                        .filter((chara) => chara.gameCharacterId >= 21)
                        .forEach((chara) => {
                          dispatchSupportUnitSelected({
                            type: "add",
                            payload: chara.unit,
                            storeName:
                              "user-profile-sekai-cards-filter-support-units",
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
    </Grid>
  );
};

export default SekaiUserCardList;
