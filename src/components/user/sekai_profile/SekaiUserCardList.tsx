import {
  Avatar,
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
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  Add,
  RotateLeft,
  Save as SaveIcon,
  Sort,
  SortOutlined,
} from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
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
import { useStrapi } from "../../../utils/apiClient";
import { CardThumb } from "../../subs/CardThumb";
// import { useInteractiveStyles } from "../../../styles/interactive";
import rarityNormal from "../../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../../assets/rarity_star_afterTraining.png";
import {
  attrSelectReducer,
  raritySelectReducer,
} from "../../../stores/reducers";
import { attrIconMap } from "../../../utils/resources";
import { ICardInfo, IGameChara, ITeamCardState } from "../../../types";
import { useCachedData, useCharaName } from "../../../utils";

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

  const [cards] = useCachedData<ICardInfo>("cards");
  const [charas] = useCachedData<IGameChara>("gameCharacters");

  const [characterId, setCharacterId] = useState<number>(0);
  const [rarity, setRarity] = useState<number>(4);
  const [filteredCards, setFilteredCards] = useState<ICardInfo[]>([]);

  const [cardList, setCardList] = useState<ITeamCardState[]>([]);
  const [displayCardList, setDisplayCardList] = useState<ITeamCardState[]>([]);
  const [card, setCard] = useState<ITeamCardState>();
  const [editList, setEditList] = useState<ITeamCardState[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [deleteCardIds, setDeleteCardIds] = useState<number[]>([]);
  const [addCardIds, setAddCardIds] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [filterOpened, setFilterOpened] = useState(false);
  const [attrSelected, dispatchAttrSelected] = useReducer(
    attrSelectReducer,
    []
  );
  const [raritySelected, dispatchRaritySelected] = useReducer(
    raritySelectReducer,
    []
  );
  const [sortType, setSortType] = useState<string>(
    localStorage.getItem("user-profile-sekai-cards-sort-type") || "asc"
  );
  const [sortBy, setSortBy] = useState<string>(
    localStorage.getItem("user-profile-sekai-cards-sort-by") || "id"
  );
  const [addCardDialogVisible, setAddCardDialogVisible] = useState(false);

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

  useEffect(() => {
    if (
      cards &&
      cards.length &&
      sekaiProfile &&
      sekaiProfile.cardList &&
      sekaiProfile.cardList.length
    ) {
      let _cardList = (cardList.length ? cardList : sekaiProfile.cardList).map(
        (elem) =>
          Object.assign({}, elem, {
            card: cards.find((c) => c.id === elem.cardId)!,
          })
      );
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
      setDisplayCardList(
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
          .map((card, idx) =>
            Object.assign({}, card, { id: idx + 1, card: undefined })
          )
      );
      if (!cardList.length) {
        setCardList(
          _cardList
            .sort((a, b) => a.card["id"] - b.card["id"])
            .map((card, idx) =>
              Object.assign({}, card, { id: idx + 1, card: undefined })
            )
        );
      }
    }
  }, [
    attrSelected,
    cardList,
    cards,
    deleteCardIds,
    editList,
    raritySelected,
    sekaiProfile,
    sortBy,
    sortType,
  ]);

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
    setCardList((list) => [
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
                      updateSekaiProfile({
                        cardList: cardList,
                      });
                      setIsSuccess(true);
                      setSuccessMsg(t("user:profile.card_list.submit_success"));
                    } catch (error) {
                      setErrMsg(t("user:profile.card_list.submit_error"));
                      setIsError(true);
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
                    !sekaiProfile!.cardList ||
                    !sekaiProfile!.cardList.length ||
                    (!deleteCardIds.length && !editList.length)
                  }
                  onClick={() => {
                    setEditList([]);
                    setDeleteCardIds([]);
                    setCardList([...sekaiProfile!.cardList!]);
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
                  disabled={
                    isSaving ||
                    !sekaiProfile!.cardList ||
                    !sekaiProfile!.cardList.length
                  }
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
                <Button
                  size="medium"
                  onClick={() => setFilterOpened((v) => !v)}
                  variant="outlined"
                  color="primary"
                >
                  {filterOpened ? <Filter /> : <FilterOutline />}
                  {filterOpened ? <Sort /> : <SortOutlined />}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={filterOpened}>
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
                            "user-profile-sekai-cards-sort-type",
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
                            "user-profile-sekai-cards-sort-by",
                            e.target.value as string
                          );
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
          </Grid>
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          {displayCardList.map((card) => (
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
      <Snackbar
        open={isError}
        autoHideDuration={3000}
        onClose={() => {
          setIsError(false);
        }}
      >
        <Alert
          onClose={() => {
            setIsError(false);
          }}
          severity="error"
        >
          {errMsg}
        </Alert>
      </Snackbar>
      <Snackbar
        open={isSuccess}
        autoHideDuration={3000}
        onClose={() => {
          setIsSuccess(false);
        }}
      >
        <Alert
          onClose={() => {
            setIsSuccess(false);
          }}
          severity="success"
        >
          {successMsg}
        </Alert>
      </Snackbar>
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
    </Grid>
  );
};

export default SekaiUserCardList;
