import {
  Button,
  Chip,
  // Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Input,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { SettingContext } from "../context";
import { useLayoutStyles } from "../styles/layout";
import { ICardInfo, IGameChara, IMusicInfo, ITeamCardState } from "../types";
import { useCachedData, useCharaName } from "../utils";
import { CardThumb } from "./subs/CardThumb";
import rarityNormal from "../assets/rarity_star_normal.png";
import rarityAfterTraining from "../assets/rarity_star_afterTraining.png";
import { useAssetI18n } from "../utils/i18n";

const useStyle = makeStyles((theme) => ({
  "rarity-star-img": {
    maxWidth: "16px",
    margin: theme.spacing(0, 0.25),
  },
}));

const MusicRecommend: React.FC<{}> = () => {
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;
  const getCharaName = useCharaName(contentTransMode);

  const [cards] = useCachedData<ICardInfo>("cards");
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [musics] = useCachedData<IMusicInfo>("musics");

  const maxStep = 4;

  const [activeStep, setActiveStep] = useState<number>(0);
  const [addCardDialogVisible, setAddCardDialogVisible] = useState<boolean>(
    false
  );
  const [characterId, setCharacterId] = useState<number>(0);
  const [rarity, setRarity] = useState<number>(4);
  const [filteredCards, setFilteredCards] = useState<ICardInfo[]>([]);
  const [teamCards, setTeamCards] = useState<number[]>([]);
  const [teamCardsStates, setTeamCardsStates] = useState<ITeamCardState[]>([]);
  const [duplicatedCardErrorOpen, setDuplicatedCardErrorOpen] = useState<
    boolean
  >(false);
  const [cardMaxErrorOpen, setCardMaxErrorOpen] = useState<boolean>(false);
  const [teamTextCopiedOpen, setTeamTextCopiedOpen] = useState<boolean>(false);
  const [loadTeamErrorOpen, setLoadTeamErrorOpen] = useState<boolean>(false);
  const [saveTeamDialogVisible, setSaveTeamDialogVisible] = useState<boolean>(
    false
  );
  const [loadTeamDialogVisible, setLoadTeamDialogVisible] = useState<boolean>(
    false
  );
  const [loadTeamText, setLoadTeamText] = useState<string>("");
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>("event_pt_per_hour");

  const saveTeamTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.title = t("title:musicRecommend");
  }, [t]);

  const calcResult = useCallback(() => {}, []);

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
    [teamCards]
  );

  const removeTeamCard = useCallback((index: number) => {
    setTeamCards((tc) => [...tc.slice(0, index), ...tc.slice(index + 1)]);
    setTeamCardsStates((tcs) => [
      ...tcs.slice(0, index),
      ...tcs.slice(index + 1),
    ]);
  }, []);

  const handleCopyTeamText = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (saveTeamTextareaRef.current) {
        saveTeamTextareaRef.current.select();
        document.execCommand("copy");
        setTeamTextCopiedOpen(true);
      }
    },
    []
  );

  const handleLoadTeamTextInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setLoadTeamText(e.target.value);
    },
    []
  );

  const handleLoadTeamText = useCallback(
    (e) => {
      try {
        const team = JSON.parse(loadTeamText) as {
          cards: number[];
          states: ITeamCardState[];
        };
        setTeamCards(team.cards);
        setTeamCardsStates(team.states);
        setLoadTeamDialogVisible(false);
        setLoadTeamText("");
      } catch (err) {
        setLoadTeamErrorOpen(true);
      }
    },
    [loadTeamText]
  );

  const StepButtons: React.FC<{ nextDisabled?: boolean }> = ({
    nextDisabled,
  }) => (
    <div>
      <Button
        disabled={activeStep === 0}
        onClick={() => setActiveStep((s) => s - 1)}
      >
        {t("common:back")}
      </Button>
      {activeStep === maxStep - 1 ? (
        <Button
          disabled={activeStep !== maxStep - 1}
          onClick={() => calcResult()}
          variant="contained"
          color="primary"
        >
          {t("music_recommend:getResult")}
        </Button>
      ) : (
        <Button
          disabled={activeStep === maxStep - 1 || nextDisabled}
          onClick={() => setActiveStep((s) => s + 1)}
          variant="contained"
          color="primary"
        >
          {t("common:next")}
        </Button>
      )}
    </div>
  );

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:musicRecommend")}
      </Typography>
      <Alert severity="warning">{t("common:betaIndicator")}</Alert>
      {/* <Container> */}
      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        style={{ backgroundColor: "inherit" }}
      >
        <Step>
          <StepLabel>{t("music_recommend:buildTeam.label")}</StepLabel>
          <StepContent>
            <Typography>{t("music_recommend:buildTeam.desc")}</Typography>
            <div>
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
                  <Grid key={`team-card-${cardId}`} item xs={12} md={6} lg={4}>
                    <Paper style={{ padding: "0.5em" }}>
                      <Grid
                        container
                        direction="row"
                        alignItems="center"
                        spacing={2}
                      >
                        <Grid item xs={5} md={3}>
                          <CardThumb cardId={cardId} />
                        </Grid>
                        <Grid item xs={7} md={9}>
                          <Grid container spacing={1}>
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
                            <Grid item xs={12} md={4}>
                              <TextField
                                label={t("card:skillLevel")}
                                type="number"
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                value={teamCardsStates[index].skillLevel}
                                onChange={(e) =>
                                  setTeamCardsStates((tcs) => {
                                    tcs[index].skillLevel = Number(
                                      e.target.value
                                    );
                                    return [...tcs];
                                  })
                                }
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
            </div>
            <br />
            <StepButtons nextDisabled={!teamCards.length} />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{t("music_recommend:songSelect.label")}</StepLabel>
          <StepContent>
            <Typography>{t("music_recommend:songSelect.desc")}</Typography>
            <div>
              <FormControl style={{ minWidth: 200 }}>
                <InputLabel id="song-select-label">Selected Songs</InputLabel>
                <Select
                  labelId="song-select-label"
                  multiple
                  value={selectedSongIds}
                  onChange={(e, v) =>
                    setSelectedSongIds(e.target.value as number[])
                  }
                  input={<Input />}
                  renderValue={(selected) => (
                    <Grid container spacing={1}>
                      {(selected as number[]).map((v) => {
                        const m = musics.find((music) => music.id === v);
                        return (
                          <Grid item>
                            <Chip
                              key={v}
                              label={getTranslated(
                                contentTransMode,
                                `music_titles:${v}`,
                                m!.title
                              )}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                >
                  {musics.map((music) => (
                    <MenuItem key={`music-${music.id}`} value={music.id}>
                      {getTranslated(
                        contentTransMode,
                        `music_titles:${music.id}`,
                        music!.title
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <br />
            <StepButtons />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{t("music_recommend:modeSelect.label")}</StepLabel>
          <StepContent>
            <Typography>{t("music_recommend:modeSelect.desc")}</Typography>
            <div>
              <FormControl component="fieldset">
                <FormLabel component="legend">Select Mode</FormLabel>
                <RadioGroup
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                >
                  <FormControlLabel
                    value="solo"
                    control={<Radio />}
                    label="Solo"
                  />
                  <FormControlLabel
                    value="multi"
                    control={<Radio />}
                    label="Multiplayer"
                  />
                  <FormControlLabel
                    value="event_pt"
                    control={<Radio />}
                    label="Event Point (per play count)"
                  />
                  <FormControlLabel
                    value="event_pt_per_hour"
                    control={<Radio />}
                    label="Event Point (per hour)"
                  />
                </RadioGroup>
              </FormControl>
            </div>
            <br />
            <StepButtons />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{t("music_recommend:result.label")}</StepLabel>
          <StepContent>
            <Typography>{t("music_recommend:result.desc")}</Typography>
            <StepButtons />
          </StepContent>
        </Step>
      </Stepper>
      {/* </Container> */}
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
                            ></img>
                          ))
                        : Array.from({ length: index + 1 }).map((_, id) => (
                            <img
                              className={classes["rarity-star-img"]}
                              src={rarityNormal}
                              alt={`star-${id}`}
                              key={`star-${id}`}
                            ></img>
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
      >
        <DialogTitle>{t("music_recommend:saveTeamDialog.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("music_recommend:saveTeamDialog.desc")}
          </DialogContentText>
          <TextField
            label={t("music_recommend:teamCode")}
            multiline
            rows={6}
            variant="outlined"
            value={JSON.stringify({
              cards: teamCards,
              states: teamCardsStates,
            })}
            contentEditable={false}
            inputRef={saveTeamTextareaRef}
            style={{ maxWidth: "100%" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCopyTeamText}
          >
            {t("common:copyToClipboard")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={loadTeamDialogVisible}
        onClose={() => setLoadTeamDialogVisible(false)}
      >
        <DialogTitle>{t("music_recommend:loadTeamDialog.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("music_recommend:loadTeamDialog.desc")}
          </DialogContentText>
          <TextField
            label={t("music_recommend:teamCode")}
            multiline
            rows={6}
            variant="outlined"
            onChange={handleLoadTeamTextInput}
            value={loadTeamText}
            style={{ maxWidth: "100%" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLoadTeamText}
          >
            {t("common:load")}
          </Button>
        </DialogActions>
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
    </Fragment>
  );
};

export default MusicRecommend;
