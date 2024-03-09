import {
  Autocomplete,
  Button,
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
import { GridColDef, DataGrid, GridSortModel } from "@mui/x-data-grid";
import { Alert } from "@mui/material";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  EventType,
  ICardInfo,
  IEventCalcAllSongsResult,
  IEventCard,
  IEventDeckBonus,
  IEventInfo,
  IEventRarityBonusRate,
  IGameCharaUnit,
  IMusicInfo,
  IMusicMeta,
  ISkillInfo,
  // ITeamCardState,
} from "../types.d";
import { filterMusicMeta, useCachedData, useMusicMeta } from "../utils";
import { useAssetI18n } from "../utils/i18n";
import { useDurationI18n } from "../utils/i18nDuration";
import { useScoreCalc } from "../utils/scoreCalc";
import { ContentTrans } from "../components/helpers/ContentTrans";
import TeamBuilder from "../components/blocks/TeamBuilder";
import { ISekaiCardState } from "../stores/sekai";
import { useCurrentEvent } from "../utils/apiClient";
import TypographyHeader from "../components/styled/TypographyHeader";
import ContainerContent from "../components/styled/ContainerContent";
import ChipDifficulty from "../components/styled/ChipDifficulty";

const difficulties: Record<number, string> = {
  0: "Easy",
  1: "Normal",
  2: "Hard",
  3: "Expert",
  4: "Master",
};

const EventPointCalc: React.FC<unknown> = () => {
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();

  const [cards] = useCachedData<ICardInfo>("cards");
  const [skills] = useCachedData<ISkillInfo>("skills");
  const [musics] = useCachedData<IMusicInfo>("musics");
  const [events] = useCachedData<IEventInfo>("events");
  const [eventCards] = useCachedData<IEventCard>("eventCards");
  const [eventDeckBonuses] = useCachedData<IEventDeckBonus>("eventDeckBonuses");
  const [eventRarityBonusRates] = useCachedData<IEventRarityBonusRate>(
    "eventRarityBonusRates"
  );
  const [gameCharacterUnits] =
    useCachedData<IGameCharaUnit>("gameCharacterUnits");
  const [metas] = useMusicMeta();
  const { currEvent } = useCurrentEvent();

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
  const [teamCardsStates, setTeamCardsStates] = useState<ISekaiCardState[]>([]);
  const [teamTotalPower, setTeamTotalPower] = useState<number>(0);
  const [selectedSong, setSelectedSong] = useState<{
    id: number;
    name: string;
  }>();
  const [selectedSongId, setSelectedSongId] = useState<number>(1);
  const [selectedSongDifficulty, setSelectedSongDifficulty] = useState<{
    id: number;
    name: string;
  }>({
    id: 4,
    name: difficulties[4],
  });
  const [selectedEvent, setSelectedEvent] = useState<{
    id: number;
    name: string;
  }>();
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
    if (currEvent && !selectedEvent) {
      setSelectedEvent({
        id: currEvent.eventId,
        name: getTranslated(
          `event_name:${currEvent.eventId}`,
          currEvent.eventJson.name
        ),
      });
      setSelectedEventId(currEvent.eventId);
    }
    if (musics && !selectedSong)
      setSelectedSong({
        id: musics[0].id,
        name: getTranslated(`music_titles:${musics[0].id}`, musics[0].title),
      });
  }, [currEvent, events, getTranslated, musics, selectedEvent, selectedSong]);

  useEffect(() => {
    if (
      events &&
      cards &&
      eventCards &&
      eventDeckBonuses &&
      gameCharacterUnits &&
      selectedEventMode === "existed"
    ) {
      console.log("triggered");
      const eventBonuses = eventDeckBonuses
        .filter((edb) => edb.eventId === selectedEventId)!
        .map((edb) => {
          if (edb.gameCharacterUnitId && edb.cardAttr) {
            const gameCharaUnit = gameCharacterUnits.find(
              (gcu) => gcu.id === edb.gameCharacterUnitId
            )!;
            return {
              bonusRate: edb.bonusRate,
              cardAttr: edb.cardAttr,
              gameCharacterId: gameCharaUnit.gameCharacterId,
              unit: gameCharaUnit.unit,
            };
          } else if (edb.gameCharacterUnitId) {
            const gameCharaUnit = gameCharacterUnits.find(
              (gcu) => gcu.id === edb.gameCharacterUnitId
            )!;
            return {
              bonusRate: edb.bonusRate,
              gameCharacterId: gameCharaUnit.gameCharacterId,
              unit: gameCharaUnit.unit,
            };
          } else {
            return {
              bonusRate: edb.bonusRate,
              cardAttr: edb.cardAttr,
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
          let rarityBonus;
          if (eventRarityBonusRates)
            rarityBonus = eventRarityBonusRates.find(
              (erbr) =>
                erbr.cardRarityType === card.cardRarityType &&
                erbr.masterRank === teamCard.masterRank
            );
          // console.log(teamCard, bonus, cardBonus, rarityBonus);
          if (!bonus) return sum;
          else sum += bonus.bonusRate;
          if (cardBonus && cardBonus.bonusRate) sum += cardBonus.bonusRate;
          if (
            !cardBonus &&
            card.characterId >= 21 &&
            card.supportUnit === "none"
          )
            sum += 15; // pure VS card bonus
          if (rarityBonus) sum += rarityBonus.bonusRate;
          return sum;
        }, 0)
      );
    }
  }, [
    cards,
    eventCards,
    eventDeckBonuses,
    eventRarityBonusRates,
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
        renderCell(params) {
          return (
            <ContentTrans
              contentKey={`music_titles:${params.row.mid}`}
              original={params.value as string}
            />
          );
        },
        width: 400,
      },
      {
        field: "level",
        headerName: t("music:difficulty"),
        renderCell(params) {
          return (
            <ChipDifficulty
              difficulty={params.row.difficulty}
              value={params.value}
            />
          );
        },
        width: 100,
      },
      {
        align: "center",
        field: "duration",
        headerName: t("music:actualPlaybackTime"),
        width: 150,
      },
      {
        align: "center",
        field: "result",
        headerName: t("music_recommend:result.label"),
        sortDirection: "desc",
        width: 100,
      },
      {
        // sortDirection: "desc",
        align: "center",

        field: "resultPerHour",

        headerName: t("event_calc:result.perHour"),

        hide: playMode === "challenge_live",
        width: 100,
      },
    ],
    [playMode, t]
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
          const music = musics.find((it) => it.id === meta.music_id);
          if (!music)
            return {
              difficulty: meta.difficulty,
              duration: meta.music_time,
              id: i,
              level: 0,
              mid: meta.music_id,
              name: "",
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
            difficulty: meta.difficulty,
            duration: meta.music_time,
            id: i,
            level: meta.level,
            mid: music.id,
            name: music.title,
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
      <TypographyHeader>{t("common:eventCalc")}</TypographyHeader>
      <Alert
        severity="warning"
        sx={(theme) => ({ margin: theme.spacing(1, 0) })}
      >
        {t("common:betaIndicator")}
      </Alert>
      <Container
        sx={(theme) => ({
          marginBottom: theme.spacing(2),
          marginTop: theme.spacing(2),
        })}
      >
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
                    <FormLabel component="legend">
                      {t("common:event")}
                    </FormLabel>
                    <RadioGroup
                      value={selectedEventMode}
                      onChange={(e) => setSelectedEventMode(e.target.value)}
                      row
                    >
                      <FormControlLabel
                        value="existed"
                        control={<Radio />}
                        label={t("event_calc:eventMode.existed") as string}
                      />
                      <FormControlLabel
                        value="custom"
                        control={<Radio />}
                        label={t("event_calc:eventMode.custom") as string}
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
                              id: ev.id,
                              name: getTranslated(
                                `event_name:${ev.id}`,
                                ev.name
                              ),
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
                            onChange={(e) =>
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
                      max: "10",
                      min: "0",
                    }}
                    value={energyDrinkCount}
                    onChange={(e) =>
                      setEnergyDrinkCount(Number(e.target.value))
                    }
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
                      max: "250",
                      min: "0",
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
                        label={t("music_recommend:modeSelect.solo") as string}
                      />
                      <FormControlLabel
                        value="multi"
                        control={<Radio />}
                        label={t("music_recommend:modeSelect.multi") as string}
                      />
                      <FormControlLabel
                        value="challenge_live"
                        control={<Radio />}
                        label={t("common:challengeLive") as string}
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
                        label={t("event_calc:songMode.all_songs") as string}
                      />
                      <FormControlLabel
                        value="only_one"
                        control={<Radio />}
                        label={t("event_calc:songMode.only_one") as string}
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
                            id: music.id,
                            name: getTranslated(
                              `music_titles:${music.id}`,
                              music.title
                            ),
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
                              id: Number(key),
                              name: value,
                            })
                          )}
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={t(
                                "event_calc:songSelect.select.difficulty"
                              )}
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
              <Alert
                severity="info"
                sx={(theme) => ({ margin: theme.spacing(1, 0) })}
              >
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
                <ContainerContent maxWidth="md">
                  <Paper variant="outlined">
                    <Grid container>
                      <Grid item xs={12}>
                        <Grid
                          container
                          justifyContent="space-between"
                          sx={(theme) => ({ margin: theme.spacing(1, 0) })}
                        >
                          <Grid item xs={4}>
                            <Typography
                              align="center"
                              sx={(theme) => ({
                                fontWeight: theme.typography.fontWeightBold,
                              })}
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
                          sx={(theme) => ({ margin: theme.spacing(1, 0) })}
                        >
                          <Grid item xs={4}>
                            <Typography
                              align="center"
                              sx={(theme) => ({
                                fontWeight: theme.typography.fontWeightBold,
                              })}
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
                          sx={(theme) => ({ margin: theme.spacing(1, 0) })}
                        >
                          <Grid item xs={4}>
                            <Typography
                              align="center"
                              sx={(theme) => ({
                                fontWeight: theme.typography.fontWeightBold,
                              })}
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
                          sx={(theme) => ({ margin: theme.spacing(1, 0) })}
                        >
                          <Grid item xs={4}>
                            <Typography
                              align="center"
                              sx={(theme) => ({
                                fontWeight: theme.typography.fontWeightBold,
                              })}
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
                          sx={(theme) => ({ margin: theme.spacing(1, 0) })}
                        >
                          <Grid item xs={4}>
                            <Typography
                              align="center"
                              sx={(theme) => ({
                                fontWeight: theme.typography.fontWeightBold,
                              })}
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
                </ContainerContent>
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
      </Container>
    </Fragment>
  );
};

export default EventPointCalc;
