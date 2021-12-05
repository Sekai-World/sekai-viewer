import {
  Autocomplete,
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
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { GridColDef, DataGrid, GridSortModel } from "@mui/x-data-grid";
import { Alert } from "@mui/material";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../styles/layout";
import {
  EventType,
  ICardInfo,
  IEventCalcAllSongsResult,
  IEventCard,
  IEventDeckBonus,
  IEventInfo,
  IGameCharaUnit,
  IMusicInfo,
  IMusicMeta,
  ISkillInfo,
  ITeamCardState,
} from "../types.d";
import { filterMusicMeta, useCachedData, useMusicMeta } from "../utils";
import { useAssetI18n } from "../utils/i18n";
import { useDurationI18n } from "../utils/i18nDuration";
import { useScoreCalc } from "../utils/scoreCalc";
import { ContentTrans } from "../components/helpers/ContentTrans";
import TeamBuilder from "../components/blocks/TeamBuilder";

const difficulties: Record<number, string> = {
  0: "Easy",
  1: "Normal",
  2: "Hard",
  3: "Expert",
  4: "Master",
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
  const [eventCards] = useCachedData<IEventCard>("eventCards");
  const [eventDeckBonuses] = useCachedData<IEventDeckBonus>("eventDeckBonuses");
  const [gameCharacterUnits] =
    useCachedData<IGameCharaUnit>("gameCharacterUnits");
  const [metas] = useMusicMeta();

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
  const [selectedSong, setSelectedSong] =
    useState<{ id: number; name: string }>();
  const [selectedSongId, setSelectedSongId] = useState<number>(1);
  const [selectedSongDifficulty, setSelectedSongDifficulty] = useState<{
    id: number;
    name: string;
  }>({
    id: 4,
    name: difficulties[4],
  });
  const [selectedEvent, setSelectedEvent] =
    useState<{ id: number; name: string }>();
  const [selectedEventId, setSelectedEventId] = useState<number>(1);
  const [selectedMusicMode, setSelectedMusicMode] =
    useState<string>("all_songs");
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
  const [validMetas, setValidMetas] = useState<IMusicMeta[]>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "result",
      sort: "desc",
    },
  ]);

  useEffect(() => {
    document.title = t("title:eventCalc");
  }, [t]);

  useEffect(() => {
    setTeamAvgPower(teamTotalPower);
  }, [teamTotalPower]);

  useEffect(() => {
    if (metas && musics) setValidMetas(filterMusicMeta(metas, musics));
  }, [metas, musics]);

  useEffect(() => {
    if (events && !selectedEvent)
      setSelectedEvent({
        name: getTranslated(
          `event_name:${events[events.length - 1].id}`,
          events[events.length - 1].name
        ),
        id: events[events.length - 1].id,
      });
    if (musics && !selectedSong)
      setSelectedSong({
        name: getTranslated(`music_titles:${musics[0].id}`, musics[0].title),
        id: musics[0].id,
      });
  }, [events, getTranslated, musics, selectedEvent, selectedSong]);

  useEffect(() => {
    if (
      events &&
      cards &&
      eventCards &&
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
      const eventCardBonuses = eventCards.filter(
        (ec) => ec.eventId === selectedEventId
      );
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
          const cardBonus = eventCardBonuses.find(
            (ecb) => ecb.cardId === card.id
          );
          // console.log(cardBonus);
          if (!bonus) return sum;
          else if (cardBonus)
            return sum + bonus.bonusRate + cardBonus.bonusRate;
          else return sum + bonus.bonusRate;
        }, 0)
      );
    }
  }, [
    cards,
    eventCards,
    eventDeckBonuses,
    events,
    gameCharacterUnits,
    selectedEventId,
    selectedEventMode,
    teamCardsStates,
  ]);

  const columns: GridColDef[] = useMemo(
    () => [
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
                colorPrimary:
                  classes[params.getValue(params.id, "difficulty") as "easy"],
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
        hide: playMode === "challenge_live",
      },
    ],
    [classes, playMode, t]
  );

  const calcResult = useCallback(() => {
    if (!validMetas.length || !cards || !skills || !events || !musics) {
      console.log("Essential data not load");
      return;
    }
    // console.log(musicMeta);
    const cardSkills = getCardSkillRates(cards, skills, teamCardsStates);
    // console.log(teamSkills);
    const isSolo = playMode === "solo";
    const averageSkills = isSolo
      ? getSoloAverageSkillRates(cardSkills)
      : getMultiAverageSkillRates(cardSkills);
    const event = events.find((event) => event.id === selectedEventId)!;
    const mode =
      playMode === "challenge_live"
        ? "challenge_live"
        : selectedEventMode === "existed"
        ? event.eventType
        : playMode === "solo"
        ? "marathon"
        : customEventType;

    if (selectedMusicMode === "only_one") {
      const meta = validMetas.find(
        (it) =>
          it.music_id === selectedSongId &&
          it.difficulty ===
            difficulties[selectedSongDifficulty.id].toLowerCase()
      );
      if (!meta) return;
      // console.log(averageSkills);
      const score = getScore(meta, teamTotalPower, averageSkills, isSolo);
      const otherScore = isSolo
        ? 0
        : getScore(meta, teamAvgPower, averageSkills, false);
      // console.log("Score: " + score);
      const eventPoint = getEventPoint(
        score,
        otherScore,
        meta.event_rate / 100,
        1 + eventBonusRate / 100,
        energyDrinkCount,
        mode
      );
      setEventPoint(eventPoint);
      const count = Math.ceil((targetPoint - currentPoint) / eventPoint);
      setNeedCount(count);
      const timeSeconds = count * (meta.music_time + 30);
      setNeedTimeSeconds(timeSeconds);
      const boost = count * energyDrinkCount;
      setNeedBoost(boost);
    } else {
      const result: IEventCalcAllSongsResult[] = validMetas
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
          const eventPoint = getEventPoint(
            score,
            otherScore,
            meta.event_rate / 100,
            1 + eventBonusRate / 100,
            energyDrinkCount,
            mode
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
    validMetas,
    cards,
    skills,
    events,
    musics,
    getCardSkillRates,
    teamCardsStates,
    playMode,
    getSoloAverageSkillRates,
    getMultiAverageSkillRates,
    selectedEventMode,
    customEventType,
    selectedMusicMode,
    selectedEventId,
    getScore,
    teamTotalPower,
    teamAvgPower,
    getEventPoint,
    eventBonusRate,
    energyDrinkCount,
    targetPoint,
    currentPoint,
    selectedSongId,
    selectedSongDifficulty,
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
        sx={{ backgroundColor: "inherit" }}
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
                      <Autocomplete
                        options={(events || [])
                          .slice()
                          .reverse()
                          // .filter((ev) => ev.startAt <= new Date().getTime())
                          .map((ev) => ({
                            name: getTranslated(`event_name:${ev.id}`, ev.name),
                            id: ev.id,
                          }))}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderInput={(params) => (
                          <TextField {...params} label={t("common:event")} />
                        )}
                        value={selectedEvent}
                        autoComplete
                        onChange={(_, value) => {
                          if (!!value) {
                            setSelectedEvent(value);
                            setSelectedEventId(value.id as number);
                          }
                        }}
                      />
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
                    <FormControlLabel
                      value="challenge_live"
                      control={<Radio />}
                      label={t("common:challengeLive")}
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
                      <Autocomplete
                        options={(musics || []).slice().map((music) => ({
                          name: getTranslated(
                            `music_titles:${music.id}`,
                            music.title
                          ),
                          id: music.id,
                        }))}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderInput={(params) => (
                          <TextField {...params} label={t("common:music")} />
                        )}
                        value={selectedSong}
                        autoComplete
                        onChange={(_, value) => {
                          if (!!value) {
                            setSelectedSong(value);
                            setSelectedSongId(value.id as number);
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4} lg={3}>
                      <Autocomplete
                        options={Object.entries(difficulties).map(
                          ([key, value]) => ({
                            name: value,
                            id: Number(key),
                          })
                        )}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t("event_calc:songSelect.select.difficulty")}
                          />
                        )}
                        value={selectedSongDifficulty}
                        autoComplete
                        onChange={(_, value) => {
                          if (!!value) {
                            setSelectedSongDifficulty(value);
                          }
                        }}
                      />
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
                        justifyContent="space-between"
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
                        justifyContent="space-between"
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
                        justifyContent="space-between"
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
                        justifyContent="space-between"
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
                        justifyContent="space-between"
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
                  sortModel={sortModel}
                  onSortModelChange={setSortModel}
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
