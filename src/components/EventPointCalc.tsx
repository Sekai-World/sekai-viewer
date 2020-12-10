import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  // IconButton,
  Input,
  InputLabel,
  makeStyles,
  MenuItem,
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
import {
  ICardInfo,
  IGameChara,
  IMusicInfo,
  ISkillInfo,
  ITeamCardState,
} from "../types";
import { useCachedData, useCharaName, useMuisicMeta } from "../utils";
import { CardThumb } from "./subs/CardThumb";
import rarityNormal from "../assets/rarity_star_normal.png";
import rarityAfterTraining from "../assets/rarity_star_afterTraining.png";
import { useAssetI18n } from "../utils/i18n";
import { useScoreCalc } from "../utils/scoreCalc";
import TeamBuiler from "./subs/TeamBuilder";

const useStyle = makeStyles((theme) => ({
  "rarity-star-img": {
    maxWidth: "16px",
    margin: theme.spacing(0, 0.25),
  },
  easy: {
    backgroundColor: "#86DA45",
  },
  normal: {
    backgroundColor: "#5FB8E6",
  },
  hard: {
    backgroundColor: "#F3AE3C",
  },
  expert: {
    backgroundColor: "#DC5268",
  },
  master: {
    backgroundColor: "#AC3EE6",
  },
  attrIcon: {
    maxWidth: "32px",
  },
}));

const difficulties: Record<number, string> = {
  0: "easy",
  1: "normal",
  2: "hard",
  3: "expert",
  4: "master",
};

const MusicRecommend: React.FC<{}> = () => {
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;
  const getCharaName = useCharaName(contentTransMode);

  const [cards] = useCachedData<ICardInfo>("cards");
  const [skills] = useCachedData<ISkillInfo>("skills");
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [musics] = useCachedData<IMusicInfo>("musics");
  const [metas] = useMuisicMeta();

  const {
    getCardSkillRates,
    getMultiAverageSkillRates,
    getScore,
    getEventPoint,
  } = useScoreCalc();

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
  const [teamPowerStates, setTeamPowerStates] = useState<number>(0);
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
  const [selectedSongId, setSelectedSongId] = useState<number>(1);
  const [selectedSongDifficulty, setSelectedSongDifficulty] = useState<number>(
    4
  );
  // const [selectedMode, setSelectedMode] = useState<string>("event_pt_per_hour");
  const [energyDrinkCount, setEnergyDrinkCount] = useState<number>(0);
  const [targetPoint, setTargetPoint] = useState<number>(1000000);
  const [remainTime, setRemainTime] = useState<number>(198);
  const [eventBonusRate, setEventBonusRate] = useState<number>(190);
  const [needTimeHour, setNeedTimeHour] = useState<number>(0);
  const [needTimeMinute, setNeedTimeMinute] = useState<number>(0);
  const [needBoost, setNeedBoost] = useState<number>(0);
  const [needCount, setNeedCount] = useState<number>(0);
  const [eventPoint, setEventPoint] = useState<number>(0);

  const saveTeamTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.title = t("title:musicRecommend");
  }, [t]);

  const calcResult = useCallback(() => {
    let meta = metas.filter(
      (it) =>
        it.music_id === selectedSongId &&
        it.difficulty === difficulties[selectedSongDifficulty]
    );
    if (metas.length === 0) {
      console.log("META NOT FOUND");
      return;
    }
    let musicMeta = meta[0];
    console.log(musicMeta);
    let teamSkills = getCardSkillRates(cards, skills, teamCardsStates);
    console.log(teamSkills);
    let averageSkills = getMultiAverageSkillRates(teamSkills);
    console.log(averageSkills);
    let score = getScore(musicMeta, teamPowerStates, averageSkills, false);
    console.log("Score: " + score);
    let eventPoint = getEventPoint(
      score,
      score * 4,
      musicMeta.event_rate / 100,
      1 + eventBonusRate / 100,
      energyDrinkCount
    );
    setEventPoint(eventPoint);
    let count = Math.ceil(targetPoint / eventPoint);
    setNeedCount(count);
    let timeSeconds = count * (musicMeta.music_time + 30);
    let timeHours = Math.floor(timeSeconds / 3600);
    let timeMinutes = Math.floor(timeSeconds / 60 - timeHours * 60);
    setNeedTimeHour(timeHours);
    setNeedTimeMinute(timeMinutes);
    let boost = count * energyDrinkCount;
    setNeedBoost(boost);
    setActiveStep(maxStep - 1);
  }, [
    cards,
    metas,
    skills,
    energyDrinkCount,
    eventBonusRate,
    getCardSkillRates,
    getEventPoint,
    getMultiAverageSkillRates,
    getScore,
    selectedSongDifficulty,
    selectedSongId,
    teamCardsStates,
    teamPowerStates,
    targetPoint,
    setNeedTimeHour,
    setNeedTimeMinute,
    setNeedBoost,
    setNeedCount,
    setEventPoint,
  ]);

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
          power: number;
        };
        setTeamCards(team.cards);
        setTeamCardsStates(team.states);
        setTeamPowerStates(team.power);
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
      {activeStep === maxStep - 2 ? (
        <Button
          disabled={activeStep !== maxStep - 2}
          onClick={() => calcResult()}
          variant="contained"
          color="primary"
        >
          {t("music_recommend:getResult")}
        </Button>
      ) : (
        <Button
          disabled={activeStep === maxStep - 2 || nextDisabled}
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
        {t("common:eventCalc")}
      </Typography>
      <Alert severity="warning" className={layoutClasses.alert}>
        {t("common:betaIndicator")}
      </Alert>
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
            <TeamBuiler
              teamCards={teamCards}
              teamCardsStates={teamCardsStates}
              teamPowerStates={teamPowerStates}
              setTeamCards={setTeamCards}
              setTeamCardsStates={setTeamCardsStates}
              setTeamPowerStates={setTeamPowerStates}
            />
            <br />
            <StepButtons nextDisabled={!teamCards.length} />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{t("event_calc:songSelect.label")}</StepLabel>
          <StepContent>
            <Typography>{t("event_calc:songSelect.desc")}</Typography>
            <Grid container>
              <Grid item xs={12} sm={4} lg={3}>
                <FormControl style={{ minWidth: 200 }}>
                  <InputLabel id="song-select-label">Song</InputLabel>
                  <Select
                    labelId="song-select-label"
                    value={selectedSongId}
                    onChange={(e, v) =>
                      setSelectedSongId(e.target.value as number)
                    }
                    input={<Input />}
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
              </Grid>
              <Grid item xs={12} sm={4} lg={3}>
                <FormControl style={{ minWidth: 200 }}>
                  <InputLabel id="song-difficulty-select-label">
                    Difficulty
                  </InputLabel>
                  <Select
                    labelId="song-difficulty-select-label"
                    value={selectedSongDifficulty}
                    onChange={(e, v) =>
                      setSelectedSongDifficulty(e.target.value as number)
                    }
                    input={<Input />}
                  >
                    {["Easy", "Normal", "Hard", "Expert", "Master"].map(
                      (diffi, idx) => (
                        <MenuItem key={`music-diffi-${diffi}`} value={idx}>
                          {diffi}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <br />
            <StepButtons />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{t("event_calc:gameData.label")}</StepLabel>
          <StepContent>
            <Typography>{t("event_calc:gameData.desc")}</Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6} lg={3} xl={2}>
                <TextField
                  label={t("event_calc:gameData.energyDrink")}
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: "0",
                    max: "10",
                  }}
                  value={energyDrinkCount}
                  onChange={(e) => setEnergyDrinkCount(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3} xl={2}>
                <TextField
                  label={t("event_calc:gameData.targetPoint")}
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: "0",
                  }}
                  value={targetPoint}
                  onChange={(e) => setTargetPoint(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                lg={3}
                xl={2}
                style={{ display: "none" }}
              >
                <TextField
                  label={t("event_calc:gameData.remainingTime")}
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: "0",
                    max: "222",
                  }}
                  value={remainTime}
                  onChange={(e) => setRemainTime(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3} xl={2}>
                <TextField
                  label={t("event_calc:gameData.eventBonusRate")}
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: "0",
                    max: "250",
                  }}
                  value={eventBonusRate}
                  onChange={(e) => setEventBonusRate(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </Grid>
            </Grid>
            <br />
            <StepButtons />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{t("music_recommend:result.label")}</StepLabel>
          <StepContent>
            <Alert severity="info">{t("event_calc:assumption")}</Alert>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((s) => s - 1)}
              variant="contained"
            >
              {t("common:back")}
            </Button>
            <div>Event Point Per Play: {eventPoint}</div>
            <div>Play Count: {needCount}</div>
            <div>
              Play Time: {needTimeHour} Hours {needTimeMinute} Minutes
            </div>
            <div>Use Boost: {needBoost}</div>
            <div>Total Event Point: {eventPoint * needCount}</div>
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
              power: teamPowerStates,
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
