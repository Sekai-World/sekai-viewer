import {
  Grid,
  Button,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText,
  DialogActions,
  Snackbar,
  makeStyles,
  Typography,
} from "@material-ui/core";
import React, {
  Fragment,
  useCallback,
  useContext,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { SettingContext } from "../../context";
import { ICardInfo, IGameChara, ITeamCardState } from "../../types";
import { useCachedData, useCharaName } from "../../utils";
import { CardThumb } from "./CardThumb";
import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";
import { Alert } from "@material-ui/lab";
import { teamBuildReducer } from "../../stores/reducers";

const useStyle = makeStyles((theme) => ({
  "rarity-star-img": {
    maxWidth: "16px",
    margin: theme.spacing(0, 0.25),
  },
  "dialog-paper": {
    padding: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      minWidth: "500px",
    },
    [theme.breakpoints.up("md")]: {
      minWidth: "700px",
    },
    [theme.breakpoints.up("lg")]: {
      minWidth: "900px",
    },
  },
}));

const TeamBuiler: React.FC<{
  teamCards: number[];
  teamCardsStates: ITeamCardState[];
  teamPowerStates: number;
  setTeamCards: React.Dispatch<React.SetStateAction<number[]>>;
  setTeamCardsStates: React.Dispatch<React.SetStateAction<ITeamCardState[]>>;
  setTeamPowerStates: React.Dispatch<React.SetStateAction<number>>;
}> = ({
  teamCards,
  teamCardsStates,
  teamPowerStates,
  setTeamCards,
  setTeamCardsStates,
  setTeamPowerStates,
}) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const { contentTransMode } = useContext(SettingContext)!;
  const getCharaName = useCharaName(contentTransMode);

  const [cards] = useCachedData<ICardInfo>("cards");
  const [charas] = useCachedData<IGameChara>("gameCharacters");

  const [characterId, setCharacterId] = useState<number>(0);
  const [rarity, setRarity] = useState<number>(4);
  const [filteredCards, setFilteredCards] = useState<ICardInfo[]>([]);
  const [
    duplicatedCardErrorOpen,
    setDuplicatedCardErrorOpen,
  ] = useState<boolean>(false);
  const [cardMaxErrorOpen, setCardMaxErrorOpen] = useState<boolean>(false);
  const [teamTextCopiedOpen, setTeamTextCopiedOpen] = useState<boolean>(false);
  const [loadTeamErrorOpen, setLoadTeamErrorOpen] = useState<boolean>(false);
  const [saveTeamDialogVisible, setSaveTeamDialogVisible] = useState<boolean>(
    false
  );
  const [loadTeamDialogVisible, setLoadTeamDialogVisible] = useState<boolean>(
    false
  );
  const [addCardDialogVisible, setAddCardDialogVisible] = useState<boolean>(
    false
  );
  const [teamTextSavedOpen, setTeamTextSavedOpen] = useState<boolean>(false);

  const [teamBuildArray, dispatchTeamBuildArray] = useReducer(
    teamBuildReducer,
    "team-build-array",
    (storageName) => JSON.parse(localStorage.getItem(storageName) || "[]")
  );

  const filterCards = useCallback(() => {
    setFilteredCards(
      cards.filter((card) =>
        characterId
          ? card.characterId === characterId && card.rarity === rarity
          : card.rarity === rarity
      )
    );
  }, [cards, characterId, rarity]);

  const handleCardThumbClick = useCallback(
    (card: ICardInfo) => {
      if (teamCards.some((tc) => tc === card.id)) {
        setDuplicatedCardErrorOpen(true);
        return;
      } else if (teamCards.length === 5) {
        setCardMaxErrorOpen(true);
        return;
      }
      setTeamCards((tc) => [...tc, card.id]);
      setTeamCardsStates((tcs) => [
        ...tcs,
        {
          cardId: card.id,
          level: card.cardParameters[card.cardParameters.length - 1].cardLevel,
          skillLevel: 1,
        },
      ]);
      // setAddCardDialogVisible(false);
    },
    [teamCards, setTeamCards, setTeamCardsStates]
  );

  const removeTeamCard = useCallback(
    (index: number) => {
      setTeamCards((tc) => [...tc.slice(0, index), ...tc.slice(index + 1)]);
      setTeamCardsStates((tcs) => [
        ...tcs.slice(0, index),
        ...tcs.slice(index + 1),
      ]);
    },
    [setTeamCards, setTeamCardsStates]
  );

  const handleAddTeamEntry = useCallback(() => {
    const toSaveEntry = {
      teamCards: teamCards,
      teamCardsStates: teamCardsStates,
      teamPowerStates: teamPowerStates,
    };

    dispatchTeamBuildArray({
      type: "add",
      payload: toSaveEntry,
    });
  }, [teamCards, teamCardsStates, teamPowerStates]);

  const handleReplaceTeamEntry = useCallback(
    (id) => {
      const currentEntry = {
        teamCards: teamCards,
        teamCardsStates: teamCardsStates,
        teamPowerStates: teamPowerStates,
      };

      dispatchTeamBuildArray({
        type: "replace",
        payload: {
          id,
          data: currentEntry,
        },
      });
    },
    [teamCards, teamCardsStates, teamPowerStates]
  );

  const handleDeleteTeamEntry = useCallback((id) => {
    dispatchTeamBuildArray({
      type: "remove",
      payload: id,
    });
  }, []);

  const handleLoadTeamEntry = useCallback(
    (idx) => {
      const currentEntry = teamBuildArray[idx];

      setTeamCards(currentEntry.teamCards);
      setTeamCardsStates(currentEntry.teamCardsStates);
      setTeamPowerStates(currentEntry.teamPowerStates);

      setLoadTeamDialogVisible(false);
    },
    [setTeamCards, setTeamCardsStates, setTeamPowerStates, teamBuildArray]
  );

  return (
    <Fragment>
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
            // disabled={teamCards.length === 0}
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
      <Grid container direction="row" spacing={1}>
        {teamCards.map((cardId, index) => (
          <Grid key={`team-card-${cardId}`} item xs={12} sm={6} lg={4}>
            <Paper style={{ padding: "0.5em" }}>
              <Grid container direction="row" alignItems="center" spacing={2}>
                <Grid item xs={5} md={3}>
                  <CardThumb cardId={cardId} />
                </Grid>
                <Grid item xs={7} md={9}>
                  <Grid container spacing={1}>
                    {/*
                            <Grid item xs={12} md={4}>
                              <TextField
                                label={t("card:cardLevel")}
                                type="number"
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                value={teamCardsStates[index].level}
                                onChange={(e) =>
                                  setTeamCardsStates((tcs) => {
                                    tcs[index].level = Number(e.target.value);
                                    return [...tcs];
                                  })
                                }
                              />
                            </Grid>
                            */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        label={t("card:skillLevel")}
                        type="number"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          min: "1",
                          max: "4",
                        }}
                        value={teamCardsStates[index].skillLevel}
                        onChange={(e) =>
                          setTeamCardsStates((tcs) => {
                            tcs[index].skillLevel = Number(e.target.value);
                            return [...tcs];
                          })
                        }
                        style={{ width: "100%" }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => removeTeamCard(index)}
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
      <Grid container spacing={1}>
        {teamCards.length > 0 ? (
          <Grid item>
            <TextField
              label={t("music_recommend:buildTeam.teamPower")}
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              value={teamPowerStates}
              onChange={(e) => setTeamPowerStates(Number(e.target.value))}
            />
          </Grid>
        ) : null}
      </Grid>
      <Dialog
        open={addCardDialogVisible}
        onClose={() => setAddCardDialogVisible(false)}
        // maxWidth="sm"
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
                  {charas.map((chara) => (
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
                              className={classes["rarity-star-img"]}
                              src={rarityAfterTraining}
                              alt={`star-${id}`}
                              key={`star-${id}`}
                            />
                          ))
                        : Array.from({ length: index + 1 }).map((_, id) => (
                            <img
                              className={classes["rarity-star-img"]}
                              src={rarityNormal}
                              alt={`star-${id}`}
                              key={`star-${id}`}
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
              <Grid key={`filtered-card-${card.id}`} item xs={4} md={3}>
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
      <Dialog
        open={saveTeamDialogVisible}
        onClose={() => setSaveTeamDialogVisible(false)}
        maxWidth="md"
      >
        <DialogTitle>{t("team_build:saveTeamDialog.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("team_build:saveTeamDialog.desc")}
          </DialogContentText>
          <Grid container spacing={1}>
            {teamBuildArray.map((team, idx) => (
              <Grid item xs={12}>
                <Paper variant="outlined" className={classes["dialog-paper"]}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} md={2}>
                      <Typography># {idx + 1}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Grid container spacing={1}>
                        {team.teamCards.map((cardId) => (
                          <Grid item xs={4} sm={2}>
                            <CardThumb cardId={cardId} />
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Grid container spacing={1} justify="flex-end">
                        <Grid item>
                          <Button
                            variant="outlined"
                            onClick={() => handleReplaceTeamEntry(idx)}
                          >
                            {t("common:replace")}
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
            {teamBuildArray.length === 0 ? (
              <Typography>{t("team_build:noTeams")}</Typography>
            ) : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddTeamEntry}
          >
            {t("team_build:saveNewEntry")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={loadTeamDialogVisible}
        onClose={() => setLoadTeamDialogVisible(false)}
        maxWidth="md"
      >
        <DialogTitle>{t("team_build:loadTeamDialog.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("team_build:loadTeamDialog.desc")}
          </DialogContentText>
          <Grid container spacing={1}>
            {teamBuildArray.map((team, idx) => (
              <Grid item xs={12}>
                <Paper variant="outlined" className={classes["dialog-paper"]}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} md={2}>
                      <Typography># {idx + 1}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Grid container spacing={1}>
                        {team.teamCards.map((cardId) => (
                          <Grid item xs={4} sm={2}>
                            <CardThumb cardId={cardId} />
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Grid container spacing={1} justify="flex-end">
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
            {teamBuildArray.length === 0 ? (
              <Typography>{t("team_build:noTeams")}</Typography>
            ) : null}
          </Grid>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={duplicatedCardErrorOpen}
        autoHideDuration={3000}
        onClose={() => setDuplicatedCardErrorOpen(false)}
      >
        <Alert variant="filled" severity="error">
          {t("music_recommend:buildTeam.duplicatedCardError")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={cardMaxErrorOpen}
        autoHideDuration={3000}
        onClose={() => setCardMaxErrorOpen(false)}
      >
        <Alert variant="filled" severity="error">
          {t("music_recommend:buildTeam.cardMaxError")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={loadTeamErrorOpen}
        autoHideDuration={3000}
        onClose={() => setLoadTeamErrorOpen(false)}
      >
        <Alert variant="filled" severity="error">
          {t("music_recommend:buildTeam.loadTeamError")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={teamTextCopiedOpen}
        autoHideDuration={3000}
        onClose={() => setTeamTextCopiedOpen(false)}
      >
        <Alert variant="filled" severity="success">
          {t("music_recommend:buildTeam.teamTextCopied")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={teamTextSavedOpen}
        autoHideDuration={3000}
        onClose={() => setTeamTextSavedOpen(false)}
      >
        <Alert variant="filled" severity="success">
          {t("music_recommend:buildTeam.teamTextSaved")}
        </Alert>
      </Snackbar>
    </Fragment>
  );
};

export default TeamBuiler;
