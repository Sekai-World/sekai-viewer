import {
  Grid,
  Button,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  DialogContentText,
  DialogActions,
  Typography,
  Popover,
  Container,
  FormControlLabel,
  Switch,
  RadioGroup,
  FormLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { ICardInfo, ITeamCardState } from "../../types.d";
import {
  useAlertSnackbar,
  useCachedData,
  useToggle,
  cardRarityTypeToRarity,
} from "../../utils";
import { CardThumb, CardThumbMedium } from "../widgets/CardThumb";
import { teamBuildReducer } from "../../stores/reducers";
import { useStrapi } from "../../utils/apiClient";
import { useTeamCalc } from "../../utils/teamCalc";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";
import {
  ISekaiProfile,
  ISekaiCardTeam,
  ISekaiCardState,
} from "../../stores/sekai";
import { autorun } from "mobx";
import FilterCardsModal from "../widgets/FilterCardsModal";

const TeamBuilder: React.FC<{
  teamCards: number[];
  teamCardsStates: ISekaiCardState[];
  teamTotalPower: number;
  setTeamCards: React.Dispatch<React.SetStateAction<number[]>>;
  setTeamCardsStates: React.Dispatch<React.SetStateAction<ISekaiCardState[]>>;
  setTeamTotalPower: React.Dispatch<React.SetStateAction<number>>;
}> = observer(
  ({
    teamCards,
    teamCardsStates,
    teamTotalPower,
    setTeamCards,
    setTeamCardsStates,
    setTeamTotalPower,
  }) => {
    const { t } = useTranslation();
    const {
      jwtToken,
      sekai: { sekaiCardTeamMap, sekaiProfileMap, setSekaiCardTeam },
      region,
    } = useRootStore();
    const { putSekaiDecks, deleteSekaiDecks } = useStrapi(jwtToken, region);
    const { showError, showSuccess } = useAlertSnackbar();

    const [cards] = useCachedData<ICardInfo>("cards");

    const {
      getAreaItemBonus,
      getCharacterRankBonus,
      getHonorBonus,
      getPureTeamPowers,
    } = useTeamCalc();

    const [sekaiProfile, setLocalSekaiProfile] = useState<ISekaiProfile>();
    const [sekaiCardTeam, setLocalSekaiCardTeam] = useState<ISekaiCardTeam>();

    useEffect(() => {
      autorun(() => {
        setLocalSekaiProfile(sekaiProfileMap.get(region));
        setLocalSekaiCardTeam(sekaiCardTeamMap.get(region));
      });
    }, []);

    const [saveTeamDialogVisible, setSaveTeamDialogVisible] =
      useState<boolean>(false);
    const [loadTeamDialogVisible, setLoadTeamDialogVisible] =
      useState<boolean>(false);
    const [addCardDialogVisible, setAddCardDialogVisible] =
      useState<boolean>(false);
    const [editingCard, setEditingCard] = useState<ISekaiCardState>();
    const [storageLocation, setStorageLocation] = useState<"local" | "cloud">(
      "local"
    );
    const [isSavingEntry, toggleIsSaveingEntry] = useToggle(false);
    const [isAutoCalcBonus, toggleIsAutoCalcBonus] = useToggle(
      !!sekaiProfile?.sekaiUserProfile
    );

    const [teamBuildArray, dispatchTeamBuildArray] = useReducer(
      teamBuildReducer,
      {
        teams: JSON.parse(localStorage.getItem("team-build-array") || "[]"),
        localKey: "team-build-array",
        storageLocation: "local",
      }
    );

    useEffect(() => {
      dispatchTeamBuildArray({
        type: "reload",
        payload: {
          location: storageLocation,
          teams:
            storageLocation === "local"
              ? JSON.parse(localStorage.getItem("team-build-array") || "[]")
              : sekaiCardTeam?.decks || [],
        },
      });
    }, [region, sekaiCardTeam, storageLocation]);

    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

    const handleCardThumbClick = useCallback(
      (card: ICardInfo, isSyncCardState: boolean) => {
        if (teamCards.some((tc) => tc === card.id)) {
          // showError(t("music_recommend:buildTeam.duplicatedCardError"));
          const index = teamCards.indexOf(card.id);
          setTeamCards((tc) => [...tc.slice(0, index), ...tc.slice(index + 1)]);
          setTeamCardsStates((tcs) => [
            ...tcs.slice(0, index),
            ...tcs.slice(index + 1),
          ]);
          return;
        } else if (teamCards.length === 5) {
          showError(t("music_recommend:buildTeam.cardMaxError"));
          return;
        }
        const maxLevel = [50, 20, 30, 50, 60];
        setTeamCards((tc) => [...tc, card.id]);
        let stateFrom = sekaiCardTeam?.cards?.find(
          (cl) => cl.cardId === card.id
        );
        const rarity =
          card.rarity || cardRarityTypeToRarity[card.cardRarityType!];
        setTeamCardsStates((tcs) => [
          ...tcs,
          isSyncCardState && !!stateFrom
            ? stateFrom
            : {
                cardId: card.id,
                skillLevel: 1,
                masterRank: 0,
                level: maxLevel[rarity],
                trained:
                  card.cardRarityType !== "rarity_birthday" && rarity >= 3,
                trainable:
                  card.cardRarityType !== "rarity_birthday" && rarity >= 3,
                story1Unlock: true,
                story2Unlock: true,
              },
        ]);
        // setAddCardDialogVisible(false);
      },
      [
        teamCards,
        setTeamCards,
        sekaiCardTeam?.cards,
        setTeamCardsStates,
        showError,
        t,
      ]
    );

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>, card: ISekaiCardState) => {
        setAnchorEl(event.currentTarget);
        setEditingCard(card);
      },
      []
    );

    const handleClose = useCallback(() => {
      setAnchorEl(null);
      setEditingCard(undefined);
    }, []);

    const handleChange = useCallback(
      (value: any, key: string) => {
        if (editingCard) {
          const newCard = Object.assign({}, editingCard, {
            [key]: value,
          });
          setEditingCard(newCard);
          const idx = teamCards.indexOf(newCard.cardId);
          setTeamCardsStates((tcs) => [
            ...tcs.slice(0, idx),
            newCard,
            ...tcs.slice(idx + 1),
          ]);
        }
      },
      [editingCard, setTeamCardsStates, teamCards]
    );

    const handleDelete = useCallback(() => {
      if (!editingCard) return;
      const index = teamCards.indexOf(editingCard.cardId);
      setTeamCards((tc) => [...tc.slice(0, index), ...tc.slice(index + 1)]);
      setTeamCardsStates((tcs) => [
        ...tcs.slice(0, index),
        ...tcs.slice(index + 1),
      ]);
      handleClose();
    }, [editingCard, handleClose, setTeamCards, setTeamCardsStates, teamCards]);

    const handleAddTeamEntry = useCallback(() => {
      const toSaveEntry = {
        // id: teamBuildArray.teams.length + 1,
        teamCards: teamCards,
        teamCardsStates: teamCardsStates,
        teamTotalPower: teamTotalPower,
      };

      toggleIsSaveingEntry();

      if (storageLocation === "cloud") {
        if (!sekaiCardTeam) return;
        putSekaiDecks(sekaiCardTeam.id, [toSaveEntry])
          .then(() => {
            dispatchTeamBuildArray({
              type: "add",
              payload: toSaveEntry,
            });
            const sct = Object.assign({}, sekaiCardTeam, {
              decks: [...(sekaiCardTeam.decks || []), toSaveEntry],
            });
            setSekaiCardTeam(sct, region);
            // setSekaiCardTeam(sct);
            toggleIsSaveingEntry();
          })
          .catch(() => {
            showError(t("team_build:error.save_team_failed"));
            toggleIsSaveingEntry();
          });
      } else if (storageLocation === "local") {
        dispatchTeamBuildArray({
          type: "add",
          payload: toSaveEntry,
        });
        toggleIsSaveingEntry();
      }
    }, [
      putSekaiDecks,
      region,
      sekaiCardTeam,
      setSekaiCardTeam,
      showError,
      storageLocation,
      t,
      teamCards,
      teamCardsStates,
      teamTotalPower,
      toggleIsSaveingEntry,
    ]);

    const handleReplaceTeamEntry = useCallback(
      (id) => {
        const currentEntry = {
          // id: id + 1,
          teamCards: teamCards,
          teamCardsStates: teamCardsStates,
          teamTotalPower: teamTotalPower,
        };

        toggleIsSaveingEntry();

        if (storageLocation === "cloud") {
          if (!sekaiCardTeam) return;
          putSekaiDecks(sekaiCardTeam.id, [
            Object.assign({}, currentEntry, { id }),
          ])
            .then(() => {
              dispatchTeamBuildArray({
                type: "replace",
                payload: {
                  id,
                  data: currentEntry,
                },
              });
              const sct = Object.assign({}, sekaiCardTeam, {
                decks: [
                  ...sekaiCardTeam.decks.slice(0, id),
                  currentEntry,
                  ...sekaiCardTeam.decks.slice(id + 1),
                ],
              });
              setSekaiCardTeam(sct, region);
              // setSekaiCardTeam(sct);
              showSuccess(t("team_build:save_team_succeed"));
              toggleIsSaveingEntry();
            })
            .catch(() => {
              showError(t("team_build:error.save_team_failed"));
              toggleIsSaveingEntry();
            });
        } else if (storageLocation === "local") {
          dispatchTeamBuildArray({
            type: "replace",
            payload: {
              id,
              data: currentEntry,
            },
          });
          showSuccess(t("team_build:save_team_succeed"));
          toggleIsSaveingEntry();
        }
      },
      [
        putSekaiDecks,
        region,
        sekaiCardTeam,
        setSekaiCardTeam,
        showError,
        showSuccess,
        storageLocation,
        t,
        teamCards,
        teamCardsStates,
        teamTotalPower,
        toggleIsSaveingEntry,
      ]
    );

    const handleDeleteTeamEntry = useCallback(
      (id) => {
        toggleIsSaveingEntry();

        if (storageLocation === "cloud") {
          if (!sekaiCardTeam) return;
          deleteSekaiDecks(sekaiCardTeam.id, [id])
            .then(() => {
              dispatchTeamBuildArray({
                type: "remove",
                payload: id,
              });
              const sct = Object.assign({}, sekaiCardTeam, {
                decks: [
                  ...sekaiCardTeam.decks.slice(0, id),
                  ...sekaiCardTeam.decks.slice(id + 1),
                ],
              });
              setSekaiCardTeam(sct, region);
              // setSekaiCardTeam(sct);
              toggleIsSaveingEntry();
            })
            .catch(() => {
              showError(t("team_build:error.save_team_failed"));
              toggleIsSaveingEntry();
            });
        } else if (storageLocation === "local") {
          dispatchTeamBuildArray({
            type: "remove",
            payload: id,
          });
          toggleIsSaveingEntry();
        }
      },
      [
        deleteSekaiDecks,
        region,
        sekaiCardTeam,
        setSekaiCardTeam,
        showError,
        storageLocation,
        t,
        toggleIsSaveingEntry,
      ]
    );

    const handleLoadTeamEntry = useCallback(
      (idx) => {
        if (!cards) return;
        const currentEntry = teamBuildArray.teams[idx];
        if (
          !Object.prototype.hasOwnProperty.call(
            currentEntry.teamCardsStates[0],
            "story1Unlock"
          )
        ) {
          // convert data
          currentEntry.teamCardsStates = currentEntry.teamCardsStates.map(
            (state) => {
              const card = cards.find((elem) => elem.id === state.cardId)!;
              const maxNormalLevel = [0, 20, 30, 40, 50];
              return Object.assign({}, state, {
                masterRank: 0,
                trained:
                  card.cardRarityType !== "rarity_birthday" &&
                  state.level >
                    maxNormalLevel[
                      card.rarity ||
                        cardRarityTypeToRarity[card.cardRarityType!]
                    ],
                trainable:
                  card.cardRarityType !== "rarity_birthday" &&
                  (card.rarity ||
                    cardRarityTypeToRarity[card.cardRarityType!]) >= 3,
                story1Unlock: false,
                story2Unlock: false,
              });
            }
          );
        } else if (
          !Object.prototype.hasOwnProperty.call(
            currentEntry.teamCardsStates[0],
            "trainable"
          )
        ) {
          currentEntry.teamCardsStates = currentEntry.teamCardsStates.map(
            (state) => {
              const card = cards.find((elem) => elem.id === state.cardId)!;

              return Object.assign({}, state, {
                trainable:
                  card.cardRarityType !== "rarity_birthday" &&
                  (card.rarity ||
                    cardRarityTypeToRarity[card.cardRarityType!]) >= 3,
              });
            }
          );
        }

        setTeamCards(currentEntry.teamCards);
        setTeamCardsStates(currentEntry.teamCardsStates);
        setTeamTotalPower(currentEntry.teamTotalPower);

        setLoadTeamDialogVisible(false);
      },
      [
        cards,
        setTeamCards,
        setTeamCardsStates,
        setTeamTotalPower,
        teamBuildArray,
      ]
    );

    const calcTotalPower = useCallback(
      (cardStates?) => {
        const pureDeckPower = getPureTeamPowers(cardStates || teamCardsStates);

        // console.log(
        //   isAutoCalcBonus && !!sekaiProfile && !!sekaiProfile.sekaiUserProfile
        // );
        if (
          isAutoCalcBonus &&
          !!sekaiProfile &&
          !!sekaiProfile.sekaiUserProfile
        ) {
          const areaItemBonus = getAreaItemBonus(
            cardStates || teamCardsStates,
            sekaiProfile.sekaiUserProfile.userAreaItems
          );

          // console.log(areaItemBonus);

          const characterRankBonus = getCharacterRankBonus(
            sekaiProfile.sekaiUserProfile.userCharacters,
            cardStates || teamCardsStates
          );

          const honorBonus = getHonorBonus(
            sekaiProfile.sekaiUserProfile.userHonors
          );

          // console.log(
          //   pureDeckPower,
          //   areaItemBonus,
          //   characterRankBonus,
          //   honorBonus
          // );

          return (
            pureDeckPower + areaItemBonus + characterRankBonus + honorBonus
          );
        }

        return pureDeckPower;
      },
      [
        getAreaItemBonus,
        getCharacterRankBonus,
        getHonorBonus,
        getPureTeamPowers,
        isAutoCalcBonus,
        sekaiProfile,
        teamCardsStates,
      ]
    );

    const handleLoadSekaiTeamEntry = useCallback(() => {
      if (!sekaiProfile || !sekaiProfile.sekaiUserProfile || !cards) return;

      const cardIds = Array.from({ length: 5 }).map(
        (_, idx) =>
          sekaiProfile.sekaiUserProfile!.userDecks[0][
            `member${idx + 1}` as "member1"
          ]
      );

      const cardStates: ITeamCardState[] = cardIds.map((cardId) => {
        const userCard = sekaiProfile.sekaiUserProfile!.userCards.find(
          (state) => state.cardId === cardId
        )!;

        const cardInfo = cards.find((card) => card.id === cardId)!;
        const trainable =
          cardInfo.cardRarityType !== "rarity_birthday" &&
          (cardInfo.rarity ||
            cardRarityTypeToRarity[cardInfo.cardRarityType!]) >= 3;

        return {
          cardId,
          level: userCard.level,
          masterRank: userCard.masterRank,
          trained: trainable && userCard.specialTrainingStatus === "done",
          trainable,
          skillLevel: 1,
          story1Unlock: userCard.episodes[0].scenarioStatus !== "unreleased",
          story2Unlock: userCard.episodes[1].scenarioStatus !== "unreleased",
        };
      });

      setTeamCards(cardIds);
      setTeamCardsStates(cardStates);
      // setTeamTotalPower(0);
      setTeamTotalPower(calcTotalPower(cardStates));

      setLoadTeamDialogVisible(false);
    }, [
      calcTotalPower,
      cards,
      sekaiProfile,
      setTeamCards,
      setTeamCardsStates,
      setTeamTotalPower,
    ]);

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setAddCardDialogVisible(true)}
                disabled={teamCards.length === 5}
              >
                {t("music_recommend:buildTeam.addCard")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setSaveTeamDialogVisible(true)}
                disabled={teamCards.length === 0}
              >
                {t("music_recommend:buildTeam.saveTeam")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setLoadTeamDialogVisible(true)}
                disabled={!cards || cards.length === 0}
              >
                {t("music_recommend:buildTeam.loadTeam")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setTeamCards([]);
                  setTeamCardsStates([]);
                }}
                disabled={teamCards.length === 0}
              >
                {t("music_recommend:buildTeam.clearTeam")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={1} justifyContent="center">
            {teamCards.map((cardId, index) => (
              <Grid key={`team-card-${cardId}`} item xs={4} md={2}>
                <CardThumbMedium
                  cardId={cardId}
                  trained={!!teamCardsStates[index].trained}
                  level={teamCardsStates[index].level}
                  masterRank={teamCardsStates[index].masterRank}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => handleClick(e, teamCardsStates[index])}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {teamCards.length > 0 && (
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                <TextField
                  label={t("music_recommend:buildTeam.teamPower")}
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={teamTotalPower}
                  onChange={(e) => setTeamTotalPower(Number(e.target.value))}
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setTeamTotalPower(calcTotalPower())}
                >
                  {t("team_build:button.calc_total_power")}
                </Button>
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={<Switch checked={isAutoCalcBonus} />}
                  onChange={() => toggleIsAutoCalcBonus()}
                  label={t("team_build:auto_calc_bonus") as string}
                  disabled={!sekaiProfile || !sekaiProfile.sekaiUserProfile}
                />
              </Grid>
            </Grid>
          )}
        </Grid>
        <FilterCardsModal
          onClose={() => setAddCardDialogVisible(false)}
          sekaiCardTeam={sekaiCardTeam}
          onCardSelected={handleCardThumbClick}
          open={addCardDialogVisible}
        />
        <Dialog
          open={saveTeamDialogVisible}
          onClose={() => setSaveTeamDialogVisible(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{t("team_build:saveTeamDialog.title")}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t("team_build:saveTeamDialog.desc")}
            </DialogContentText>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                {t("team_build:storage_location.label")}
              </FormLabel>
              <RadioGroup
                row
                value={storageLocation}
                onChange={(_, v) => setStorageLocation(v as "local")}
              >
                <FormControlLabel
                  value="local"
                  control={<Radio />}
                  label={t("team_build:storage_location.local") as string}
                  labelPlacement="end"
                />
                <FormControlLabel
                  value="cloud"
                  control={<Radio />}
                  label={t("team_build:storage_location.cloud") as string}
                  labelPlacement="end"
                  disabled={!sekaiCardTeam}
                />
              </RadioGroup>
            </FormControl>
            {storageLocation === "cloud" && !!sekaiCardTeam && (
              <DialogContentText>
                {t("team_build:storage_space")}: {teamBuildArray.teams.length} /{" "}
                {sekaiCardTeam.maxNumOfDecks}
              </DialogContentText>
            )}
            <Grid container spacing={1}>
              {teamBuildArray.teams.map((team, idx) => (
                <Grid key={`save-team-${idx}`} item xs={12}>
                  <Paper variant="outlined" sx={{ p: 1 }}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={12} md={2}>
                        <Typography># {idx + 1}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Grid container spacing={1}>
                          {team.teamCards.map((cardId) => (
                            <Grid
                              key={`save-team-card-${cardId}`}
                              item
                              xs={4}
                              sm={2}
                            >
                              <CardThumb cardId={cardId} />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Grid container spacing={1} justifyContent="flex-end">
                          <Grid item>
                            <Button
                              variant="outlined"
                              onClick={() => handleReplaceTeamEntry(idx)}
                              disabled={isSavingEntry}
                            >
                              {t("common:replace")}
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              variant="outlined"
                              onClick={() => handleDeleteTeamEntry(idx)}
                              color="secondary"
                              disabled={isSavingEntry}
                            >
                              {t("common:delete")}
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            {teamBuildArray.teams.length === 0 ? (
              <DialogContentText>{t("team_build:noTeams")}</DialogContentText>
            ) : null}
          </DialogContent>
          <DialogActions>
            {isSavingEntry && <CircularProgress size={24} />}
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddTeamEntry}
              disabled={
                isSavingEntry ||
                (storageLocation === "cloud" &&
                  !!sekaiCardTeam &&
                  teamBuildArray.teams.length >= sekaiCardTeam.maxNumOfDecks)
              }
            >
              {t("team_build:saveNewEntry")}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={loadTeamDialogVisible}
          onClose={() => setLoadTeamDialogVisible(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{t("team_build:loadTeamDialog.title")}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t("team_build:loadTeamDialog.desc")}
            </DialogContentText>
            {(!!sekaiProfile && !!sekaiProfile.sekaiUserProfile && (
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <DialogContentText>
                    {t("user:profile.title.user_deck")}
                  </DialogContentText>
                </Grid>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 1 }}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Typography>
                          {t("user:profile.title.user_deck")}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Grid container spacing={1}>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Grid
                              key={`load-team-card-${idx + 100000}`}
                              item
                              xs={4}
                              sm={2}
                            >
                              <CardThumb
                                cardId={
                                  sekaiProfile.sekaiUserProfile!.userDecks[0][
                                    `member${idx + 1}` as "member1"
                                  ]
                                }
                                trained={
                                  sekaiProfile.sekaiUserProfile!.userCards[idx]
                                    .specialTrainingStatus === "done"
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Grid container spacing={1} justifyContent="flex-end">
                          <Grid item>
                            <Button
                              variant="outlined"
                              onClick={() => handleLoadSekaiTeamEntry()}
                            >
                              {t("common:load")}
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            )) ||
              null}
            <br />
            <FormControl component="fieldset">
              <FormLabel component="legend">
                {t("team_build:storage_location.label")}
              </FormLabel>
              <RadioGroup
                row
                value={storageLocation}
                onChange={(_, v) => setStorageLocation(v as "local")}
              >
                <FormControlLabel
                  value="local"
                  control={<Radio />}
                  label={t("team_build:storage_location.local") as string}
                  labelPlacement="end"
                />
                <FormControlLabel
                  value="cloud"
                  control={<Radio />}
                  label={t("team_build:storage_location.cloud") as string}
                  labelPlacement="end"
                  disabled={!sekaiCardTeam}
                />
              </RadioGroup>
            </FormControl>
            <Grid container spacing={1}>
              {teamBuildArray.teams.map((team, idx) => (
                <Grid key={`load-team-${idx}`} item xs={12}>
                  <Paper variant="outlined" sx={{ p: 1 }}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Typography># {idx + 1}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Grid container spacing={1}>
                          {team.teamCards.map((cardId) => (
                            <Grid
                              key={`load-team-card-${cardId}`}
                              item
                              xs={4}
                              sm={2}
                            >
                              <CardThumb
                                cardId={cardId}
                                trained={!!team.teamCardsStates[0].trained}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Grid container spacing={1} justifyContent="flex-end">
                          <Grid item>
                            <Button
                              variant="outlined"
                              onClick={() => handleLoadTeamEntry(idx)}
                            >
                              {t("common:load")}
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              variant="outlined"
                              onClick={() => handleDeleteTeamEntry(idx)}
                              color="secondary"
                            >
                              {t("common:delete")}
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            {!teamBuildArray.teams.length && (
              <DialogContentText>{t("team_build:noTeams")}</DialogContentText>
            )}
          </DialogContent>
        </Dialog>
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
          {editingCard && (
            <Container style={{ paddingTop: "1em", paddingBottom: "1em" }}>
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <TextField
                    label={t("card:cardLevel")}
                    value={editingCard.level}
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
                    value={editingCard.masterRank}
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
                    value={editingCard.skillLevel}
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
                {editingCard.trainable && (
                  <Grid item>
                    <FormControlLabel
                      control={<Switch checked={!!editingCard.trained} />}
                      label={t("card:trained") as string}
                      onChange={(e, checked) =>
                        handleChange(checked, "trained")
                      }
                    />
                  </Grid>
                )}
                <Grid item>
                  <FormControlLabel
                    control={<Switch checked={!!editingCard.story1Unlock} />}
                    label={t("card:sideStory1Unlocked") as string}
                    onChange={(e, checked) =>
                      handleChange(checked, "story1Unlock")
                    }
                  />
                </Grid>
                <Grid item>
                  <FormControlLabel
                    control={<Switch checked={!!editingCard.story2Unlock} />}
                    label={t("card:sideStory2Unlocked") as string}
                    onChange={(e, checked) =>
                      handleChange(checked, "story2Unlock")
                    }
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete()}
                  >
                    {t("common:delete")}
                  </Button>
                </Grid>
              </Grid>
            </Container>
          )}
        </Popover>
      </Grid>
    );
  }
);

export default TeamBuilder;
