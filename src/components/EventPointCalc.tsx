import {
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { SettingContext } from "../context";
import { useLayoutStyles } from "../styles/layout";
import { ICardInfo, IMusicInfo, ISkillInfo, ITeamCardState } from "../types";
import { useCachedData, useMuisicMeta } from "../utils";
import { useAssetI18n } from "../utils/i18n";
import { useDurationI18n } from "../utils/i18nDuration";
import { useScoreCalc } from "../utils/scoreCalc";
import TeamBuilder from "./subs/TeamBuilder";

const difficulties: Record<number, string> = {
  0: "easy",
  1: "normal",
  2: "hard",
  3: "expert",
  4: "master",
};

const MusicRecommend: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;

  const [cards] = useCachedData<ICardInfo>("cards");
  const [skills] = useCachedData<ISkillInfo>("skills");
  const [musics] = useCachedData<IMusicInfo>("musics");
  const [metas] = useMuisicMeta();

  const {
    getCardSkillRates,
    getMultiAverageSkillRates,
    getScore,
    getEventPoint,
  } = useScoreCalc();
  const [, humanizeShort] = useDurationI18n();

  const maxStep = 4;

  const [activeStep, setActiveStep] = useState<number>(0);
  const [teamCards, setTeamCards] = useState<number[]>([]);
  const [teamCardsStates, setTeamCardsStates] = useState<ITeamCardState[]>([]);
  const [teamPowerStates, setTeamPowerStates] = useState<number>(0);
  const [selectedSongId, setSelectedSongId] = useState<number>(1);
  const [selectedSongDifficulty, setSelectedSongDifficulty] = useState<number>(
    4
  );
  // const [selectedMode, setSelectedMode] = useState<string>("event_pt_per_hour");
  const [energyDrinkCount, setEnergyDrinkCount] = useState<number>(0);
  const [currentPoint, setCurrentPoint] = useState<number>(10000);
  const [targetPoint, setTargetPoint] = useState<number>(1000000);
  const [remainTime, setRemainTime] = useState<number>(198);
  const [eventBonusRate, setEventBonusRate] = useState<number>(190);
  const [needTimeSeconds, setNeedTimeSeconds] = useState<number>(0);
  const [needBoost, setNeedBoost] = useState<number>(0);
  const [needCount, setNeedCount] = useState<number>(0);
  const [eventPoint, setEventPoint] = useState<number>(0);

  useEffect(() => {
    document.title = t("title:musicRecommend");
  }, [t]);

  const calcResult = useCallback(() => {
    if (!metas || !metas.length || !cards || !skills) {
      console.log("META NOT FOUND");
      return;
    }
    const meta = metas.filter(
      (it) =>
        it.music_id === selectedSongId &&
        it.difficulty === difficulties[selectedSongDifficulty]
    );
    const musicMeta = meta[0];
    // console.log(musicMeta);
    const teamSkills = getCardSkillRates(cards, skills, teamCardsStates);
    // console.log(teamSkills);
    const averageSkills = getMultiAverageSkillRates(teamSkills);
    // console.log(averageSkills);
    const score = getScore(musicMeta, teamPowerStates, averageSkills, false);
    // console.log("Score: " + score);
    const eventPoint = getEventPoint(
      score,
      score * 4,
      musicMeta.event_rate / 100,
      1 + eventBonusRate / 100,
      energyDrinkCount
    );
    setEventPoint(eventPoint);
    const count = Math.ceil((targetPoint - currentPoint) / eventPoint);
    setNeedCount(count);
    const timeSeconds = count * (musicMeta.music_time + 30);
    setNeedTimeSeconds(timeSeconds);
    const boost = count * energyDrinkCount;
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
    currentPoint,
    setNeedTimeSeconds,
    setNeedBoost,
    setNeedCount,
    setEventPoint,
  ]);

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
            <TeamBuilder
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
                    {musics &&
                      musics.map((music) => (
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
                  label={t("event_calc:gameData.currentPoint")}
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: "0",
                  }}
                  value={currentPoint}
                  onChange={(e) => setCurrentPoint(Number(e.target.value))}
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
            <Alert severity="info" className={layoutClasses.alert}>
              {t("event_calc:assumption")}
            </Alert>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((s) => s - 1)}
              variant="contained"
            >
              {t("common:back")}
            </Button>
            <Container maxWidth="sm" className={layoutClasses.content}>
              <Paper variant="outlined">
                <Grid container>
                  <Grid item xs={12}>
                    <Grid
                      container
                      justify="space-between"
                      className={layoutClasses.alert}
                    >
                      <Grid item xs={4}>
                        <Typography
                          align="center"
                          className={layoutClasses.bold}
                        >
                          {t("event_calc:result.eventPointPerPlay")}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography align="center">{eventPoint}</Typography>
                      </Grid>
                    </Grid>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      container
                      justify="space-between"
                      className={layoutClasses.alert}
                    >
                      <Grid item xs={4}>
                        <Typography
                          align="center"
                          className={layoutClasses.bold}
                        >
                          {t("event_calc:result.playClount")}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography align="center">{needCount}</Typography>
                      </Grid>
                    </Grid>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      container
                      justify="space-between"
                      className={layoutClasses.alert}
                    >
                      <Grid item xs={4}>
                        <Typography
                          align="center"
                          className={layoutClasses.bold}
                        >
                          {t("event_calc:result.playTime")}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography align="center">
                          {humanizeShort(needTimeSeconds * 1000, {
                            round: true,
                          })}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      container
                      justify="space-between"
                      className={layoutClasses.alert}
                    >
                      <Grid item xs={4}>
                        <Typography
                          align="center"
                          className={layoutClasses.bold}
                        >
                          {t("event_calc:result.useBoost")}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography align="center">{needBoost}</Typography>
                      </Grid>
                    </Grid>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid
                      container
                      justify="space-between"
                      className={layoutClasses.alert}
                    >
                      <Grid item xs={4}>
                        <Typography
                          align="center"
                          className={layoutClasses.bold}
                        >
                          {t("event_calc:result.totalPoint")}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography align="center">
                          {eventPoint * needCount + currentPoint}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider />
                  </Grid>
                </Grid>
              </Paper>
            </Container>
          </StepContent>
        </Step>
      </Stepper>
      {/* </Container> */}
    </Fragment>
  );
};

export default MusicRecommend;
