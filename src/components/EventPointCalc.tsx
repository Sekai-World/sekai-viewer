import {
  Button,
  Chip,
  Container,
  Divider,
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
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@material-ui/core";
import { ColDef, DataGrid } from "@material-ui/data-grid";
import { Alert } from "@material-ui/lab";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../styles/layout";
import {
  EventType,
  ICardInfo,
  IEventCalcAllSongsResult,
  IEventDeckBonus,
  IEventInfo,
  IGameCharaUnit,
  IMusicInfo,
  ISkillInfo,
  ITeamCardState,
} from "../types";
import { useCachedData, useMuisicMeta } from "../utils";
import { useAssetI18n } from "../utils/i18n";
import { useDurationI18n } from "../utils/i18nDuration";
import { useScoreCalc } from "../utils/scoreCalc";
import { ContentTrans } from "./subs/ContentTrans";
import TeamBuilder from "./subs/TeamBuilder";

const difficulties: Record<number, string> = {
  0: "easy",
  1: "normal",
  2: "hard",
  3: "expert",
  4: "master",
};

const useStyle = makeStyles(() => ({
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
}));

const EventPointCalc: React.FC<{}> = () => {
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();

  const [cards] = useCachedData<ICardInfo>("cards");
  const [skills] = useCachedData<ISkillInfo>("skills");
  const [musics] = useCachedData<IMusicInfo>("musics");
  const [events] = useCachedData<IEventInfo>("events");
  const [eventDeckBonuses] = useCachedData<IEventDeckBonus>("eventDeckBonuses");
  const [gameCharacterUnits] = useCachedData<IGameCharaUnit>(
    "gameCharacterUnits"
  );
  const [metas] = useMuisicMeta();

  const {
    getCardSkillRates,
    getMultiAverageSkillRates,
    getSoloAverageSkillRates,
    getScore,
    getEventPoint,
  } = useScoreCalc();
  const [, humanizeShort] = useDurationI18n();

  const maxStep = 4;

  const [activeStep, setActiveStep] = useState<number>(0);
  const [teamCards, setTeamCards] = useState<number[]>([]);
  const [teamCardsStates, setTeamCardsStates] = useState<ITeamCardState[]>([]);
  const [teamTotalPower, setTeamTotalPower] = useState<number>(0);
  const [selectedSongId, setSelectedSongId] = useState<number>(1);
  const [selectedSongDifficulty, setSelectedSongDifficulty] = useState<number>(
    4
  );
  const [selectedEventId, setSelectedEventId] = useState<number>(1);
  const [selectedMusicMode, setSelectedMusicMode] = useState<string>(
    "all_songs"
  );
  const [energyDrinkCount, setEnergyDrinkCount] = useState<number>(0);
  const [currentPoint, setCurrentPoint] = useState<number>(10000);
  const [targetPoint, setTargetPoint] = useState<number>(1000000);
  // const [remainTime, setRemainTime] = useState<number>(198);
  const [eventBonusRate, setEventBonusRate] = useState<number>(0);
  const [needTimeSeconds, setNeedTimeSeconds] = useState<number>(0);
  const [needBoost, setNeedBoost] = useState<number>(0);
  const [needCount, setNeedCount] = useState<number>(0);
  const [eventPoint, setEventPoint] = useState<number>(0);
  const [eventCalcAllSongsResult, setEventCalcAllSongsResult] = useState<
    IEventCalcAllSongsResult[]
  >([]);
  const [selectedEventMode, setSelectedEventMode] = useState<string>("existed");
  const [customEventType, setCustomEventType] = useState<EventType>("marathon");
  const [playMode, setPlayMode] = useState("solo");
  const [teamAvgPower, setTeamAvgPower] = useState(0);

  useEffect(() => {
    document.title = t("title:musicRecommend");
  }, [t]);

  useEffect(() => {
    setTeamAvgPower(teamTotalPower);
  }, [teamTotalPower]);

  useEffect(() => {
    if (
      events &&
      cards &&
      eventDeckBonuses &&
      gameCharacterUnits &&
      selectedEventMode === "existed"
    ) {
      const eventBonuses = eventDeckBonuses
        .filter((edb) => edb.eventId === selectedEventId)!
        .map((edb) => {
          if (edb.gameCharacterUnitId && edb.cardAttr) {
            const gameCharaUnit = gameCharacterUnits.find(
              (gcu) => gcu.id === edb.gameCharacterUnitId
            )!;
            return {
              gameCharacterId: gameCharaUnit.gameCharacterId,
              unit: gameCharaUnit.unit,
              cardAttr: edb.cardAttr,
              bonusRate: edb.bonusRate,
            };
          } else if (edb.gameCharacterUnitId) {
            const gameCharaUnit = gameCharacterUnits.find(
              (gcu) => gcu.id === edb.gameCharacterUnitId
            )!;
            return {
              gameCharacterId: gameCharaUnit.gameCharacterId,
              unit: gameCharaUnit.unit,
              bonusRate: edb.bonusRate,
            };
          } else {
            return {
              cardAttr: edb.cardAttr,
              bonusRate: edb.bonusRate,
            };
          }
        });
      setEventBonusRate(
        teamCardsStates.reduce((sum, teamCard) => {
          const card = cards.find((c) => c.id === teamCard.cardId)!;
          let bonus = eventBonuses.find(
            (eb) =>
              eb.gameCharacterId &&
              eb.cardAttr &&
              eb.unit &&
              eb.gameCharacterId === card.characterId &&
              eb.cardAttr === card.attr &&
              (card.characterId <= 20 || eb.unit === card.supportUnit)
          );
          if (!bonus) {
            bonus = eventBonuses.find(
              (eb) =>
                (eb.gameCharacterId &&
                  eb.unit &&
                  !eb.cardAttr &&
                  eb.gameCharacterId === card.characterId &&
                  (card.characterId <= 20 || eb.unit === card.supportUnit)) ||
                (eb.cardAttr &&
                  !eb.gameCharacterId &&
                  !eb.unit &&
                  eb.cardAttr === card.attr)
            );
          }
          console.log(bonus);
          if (!bonus) return sum;
          else return sum + bonus.bonusRate;
        }, 0)
      );
    }
  }, [
    cards,
    eventDeckBonuses,
    events,
    gameCharacterUnits,
    selectedEventId,
    selectedEventMode,
    teamCardsStates,
  ]);

  const columns: ColDef[] = [
    {
      field: "name",
      headerName: t("music_recommend:result.musicName"),
      width: 400,
      renderCell(params) {
        return (
          <ContentTrans
            contentKey={`music_titles:${params.row.mid}`}
            original={params.value as string}
          />
        );
      },
    },
    {
      field: "level",
      headerName: t("music:difficulty"),
      width: 100,
      renderCell(params) {
        return (
          <Chip
            color="primary"
            size="small"
            classes={{
              colorPrimary: classes[params.getValue("difficulty") as "easy"],
            }}
            label={params.value}
          ></Chip>
        );
      },
    },
    {
      field: "duration",
      headerName: t("music:actualPlaybackTime"),
      width: 150,
      align: "center",
    },
    {
      field: "result",
      headerName: t("music_recommend:result.label"),
      width: 100,
      sortDirection: "desc",
      align: "center",
    },
    {
      field: "resultPerHour",
      headerName: t("event_calc:result.perHour"),
      width: 100,
      // sortDirection: "desc",
      align: "center",
    },
  ];

  const calcResult = useCallback(() => {
    if (!metas || !metas.length || !cards || !skills || !events || !musics) {
      console.log("Essential data not load");
      return;
    }
    // console.log(musicMeta);
    const cardSkills = getCardSkillRates(cards, skills, teamCardsStates);
    // console.log(teamSkills);
    let isSolo = playMode === "solo";
    let averageSkills = isSolo
      ? getSoloAverageSkillRates(cardSkills)
      : getMultiAverageSkillRates(cardSkills);

    if (selectedMusicMode === "only_one") {
      const meta = metas.find(
        (it) =>
          it.music_id === selectedSongId &&
          it.difficulty === difficulties[selectedSongDifficulty]
      );
      if (!meta) return;
      // console.log(averageSkills);
      const score = getScore(meta, teamTotalPower, averageSkills, isSolo);
      const otherScore = isSolo
        ? 0
        : getScore(meta, teamAvgPower, averageSkills, false);
      // console.log("Score: " + score);
      const event = events.find((event) => event.id === selectedEventId)!;
      const eventPoint = getEventPoint(
        score,
        otherScore,
        meta.event_rate / 100,
        1 + eventBonusRate / 100,
        energyDrinkCount,
        selectedEventMode === "existed"
          ? event.eventType
          : playMode === "solo"
          ? "marathon"
          : customEventType
      );
      setEventPoint(eventPoint);
      const count = Math.ceil((targetPoint - currentPoint) / eventPoint);
      setNeedCount(count);
      const timeSeconds = count * (meta.music_time + 30);
      setNeedTimeSeconds(timeSeconds);
      const boost = count * energyDrinkCount;
      setNeedBoost(boost);
    } else {
      const result: IEventCalcAllSongsResult[] = metas
        .map((meta, i) => {
          let music = musics.find((it) => it.id === meta.music_id);
          if (!music)
            return {
              id: i,
              mid: meta.music_id,
              name: "",
              difficulty: meta.difficulty,
              level: 0,
              duration: meta.music_time,
              result: 0,
              resultPerHour: 0,
            };
          const score = getScore(
            meta,
            teamTotalPower,
            averageSkills,
            playMode === "solo"
          );
          const otherScore =
            playMode === "solo"
              ? 0
              : getScore(meta, teamAvgPower, averageSkills, false);
          // console.log("Score: " + score);
          const event = events.find((event) => event.id === selectedEventId)!;
          const eventPoint = getEventPoint(
            score,
            otherScore,
            meta.event_rate / 100,
            1 + eventBonusRate / 100,
            energyDrinkCount,
            selectedEventMode === "existed"
              ? event.eventType
              : playMode === "solo"
              ? "marathon"
              : customEventType
          );
          const result = eventPoint;

          return {
            id: i,
            mid: music.id,
            name: music.title,
            difficulty: meta.difficulty,
            level: meta.level,
            duration: meta.music_time,
            result: result,
            resultPerHour: Math.floor((result / (meta.music_time + 30)) * 3600),
          };
        })
        .filter((result) => result.result);
      //console.log(result.length);
      setEventCalcAllSongsResult(result);
    }
    setActiveStep(maxStep - 1);
  }, [
    metas,
    cards,
    skills,
    events,
    musics,
    getCardSkillRates,
    teamCardsStates,
    playMode,
    getSoloAverageSkillRates,
    getMultiAverageSkillRates,
    selectedMusicMode,
    getScore,
    teamTotalPower,
    teamAvgPower,
    getEventPoint,
    eventBonusRate,
    energyDrinkCount,
    selectedEventMode,
    customEventType,
    targetPoint,
    currentPoint,
    selectedSongId,
    selectedSongDifficulty,
    selectedEventId,
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
              teamTotalPower={teamTotalPower}
              setTeamCards={setTeamCards}
              setTeamCardsStates={setTeamCardsStates}
              setTeamTotalPower={setTeamTotalPower}
            />
            <br />
            <StepButtons nextDisabled={!teamCards.length} />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{t("event_calc:eventData.label")}</StepLabel>
          <StepContent>
            {/* <Typography>{t("event_calc:gameData.desc")}</Typography> */}
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t("common:event")}</FormLabel>
                  <RadioGroup
                    value={selectedEventMode}
                    onChange={(e) => setSelectedEventMode(e.target.value)}
                    row
                  >
                    <FormControlLabel
                      value="existed"
                      control={<Radio />}
                      label={t("event_calc:eventMode.existed")}
                    />
                    <FormControlLabel
                      value="custom"
                      control={<Radio />}
                      label={t("event_calc:eventMode.custom")}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {selectedEventMode === "existed" && (
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={4} lg={3}>
                      <FormControl style={{ width: "100%" }}>
                        <InputLabel id="event-select-label">
                          {t("common:event")}
                        </InputLabel>
                        <Select
                          labelId="event-select-label"
                          value={selectedEventId}
                          onChange={(e, v) =>
                            setSelectedEventId(e.target.value as number)
                          }
                          input={<Input />}
                        >
                          {events &&
                            events.map((event) => (
                              <MenuItem
                                key={`event-${event.id}`}
                                value={event.id}
                              >
                                {getTranslated(
                                  `event_name:${event.id}`,
                                  event!.name
                                )}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              {selectedEventMode === "custom" && (
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={4} lg={3}>
                      <FormControl style={{ width: "100%" }}>
                        <InputLabel id="event-select-label">
                          {t("common:type")}
                        </InputLabel>
                        <Select
                          labelId="event-select-label"
                          value={customEventType}
                          onChange={(e, v) =>
                            setCustomEventType(e.target.value as EventType)
                          }
                          input={<Input />}
                        >
                          <MenuItem value="marathon">
                            {t(`event:type.marathon`)}
                          </MenuItem>
                          <MenuItem value="cheerful_carnival">
                            {t(`event:type.cheerful_carnival`)}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              )}
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
              {/* <Grid
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
              </Grid> */}
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
                  disabled={selectedEventMode === "existed"}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t("common:mode")}</FormLabel>
                  <RadioGroup
                    value={playMode}
                    onChange={(e) => setPlayMode(e.target.value)}
                    row
                  >
                    <FormControlLabel
                      value="solo"
                      control={<Radio />}
                      label={t("music_recommend:modeSelect.solo")}
                    />
                    <FormControlLabel
                      value="multi"
                      control={<Radio />}
                      label={t("music_recommend:modeSelect.multi")}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {playMode === "multi" && (
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6} lg={3} xl={2}>
                      <TextField
                        label={t("event_calc:gameData.teamAvgPower")}
                        type="number"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          min: "0",
                        }}
                        value={teamAvgPower}
                        onChange={(e) =>
                          setTeamAvgPower(Number(e.target.value))
                        }
                        style={{ width: "100%" }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
            <br />
            <StepButtons />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>{t("event_calc:songSelect.label")}</StepLabel>
          <StepContent>
            {/* <Typography>{t("event_calc:songSelect.desc")}</Typography> */}
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    {t("event_calc:songMode.label")}
                  </FormLabel>
                  <RadioGroup
                    value={selectedMusicMode}
                    onChange={(e) => setSelectedMusicMode(e.target.value)}
                    row
                  >
                    <FormControlLabel
                      value="all_songs"
                      control={<Radio />}
                      label={t("event_calc:songMode.all_songs")}
                    />
                    <FormControlLabel
                      value="only_one"
                      control={<Radio />}
                      label={t("event_calc:songMode.only_one")}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {selectedMusicMode === "only_one" && (
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={4} lg={3}>
                      <FormControl style={{ width: "100%" }}>
                        <InputLabel id="song-select-label">
                          {t("common:music")}
                        </InputLabel>
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
                              <MenuItem
                                key={`music-${music.id}`}
                                value={music.id}
                              >
                                {getTranslated(
                                  `music_titles:${music.id}`,
                                  music!.title
                                )}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4} lg={3}>
                      <FormControl style={{ width: "100%" }}>
                        <InputLabel id="song-difficulty-select-label">
                          {t("event_calc:songSelect.select.difficulty")}
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
                              <MenuItem
                                key={`music-diffi-${diffi}`}
                                value={idx}
                              >
                                {diffi}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              {selectedMusicMode === "only_one" && (
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
              )}
              {selectedMusicMode === "only_one" && (
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
              )}
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
            {selectedMusicMode === "only_one" && (
              <Container maxWidth="md" className={layoutClasses.content}>
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
            )}
            {selectedMusicMode === "all_songs" && (
              <div style={{ height: 650 }}>
                <DataGrid
                  pagination
                  autoPageSize
                  rows={eventCalcAllSongsResult}
                  columns={columns}
                  disableColumnFilter
                  disableColumnMenu
                  disableSelectionOnClick
                  disableColumnSelector
                />
              </div>
            )}
          </StepContent>
        </Step>
      </Stepper>
      {/* </Container> */}
    </Fragment>
  );
};

export default EventPointCalc;
