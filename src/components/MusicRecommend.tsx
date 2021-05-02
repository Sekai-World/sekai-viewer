import {
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  makeStyles,
  Radio,
  RadioGroup,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../styles/layout";
import {
  ICardInfo,
  IMusicInfo,
  IMusicRecommendResult,
  ISkillInfo,
  ITeamCardState,
} from "../types";
import { useCachedData, useMuisicMeta } from "../utils";
import { ColDef, DataGrid, ValueFormatterParams } from "@material-ui/data-grid";
import { Link } from "react-router-dom";
import { OpenInNew } from "@material-ui/icons";
import { useScoreCalc } from "../utils/scoreCalc";
import TeamBuilder from "./subs/TeamBuilder";
import { ContentTrans } from "./subs/ContentTrans";

const useStyle = makeStyles((theme) => ({
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

const MusicRecommend: React.FC<{}> = () => {
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();

  const [cards] = useCachedData<ICardInfo>("cards");
  const [skills] = useCachedData<ISkillInfo>("skills");
  const [musics] = useCachedData<IMusicInfo>("musics");
  const [metas] = useMuisicMeta();

  const maxStep = 3;

  const [teamCards, setTeamCards] = useState<number[]>([]);
  const [teamCardsStates, setTeamCardsStates] = useState<ITeamCardState[]>([]);
  const [teamPowerStates, setTeamPowerStates] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  // const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>("event_pt_per_hour");
  const [recommendResult, setRecommandResult] = useState<
    IMusicRecommendResult[]
  >([]);

  const {
    getCardSkillRates,
    getMultiAverageSkillRates,
    getSoloAverageSkillRates,
    getScore,
    getEventPoint,
    getEventPointPerHour,
  } = useScoreCalc();

  useEffect(() => {
    document.title = t("title:musicRecommend");
  }, [t]);

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
      field: "combo",
      headerName: t("music:noteCount"),
      width: 110,
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
      field: "action",
      headerName: t("home:game-news.action"),
      width: 80,
      renderCell: (params: ValueFormatterParams) => {
        const info = params.row as IMusicRecommendResult;
        return (
          <Link to={info.link} target="_blank">
            <IconButton color="primary">
              <OpenInNew></OpenInNew>
            </IconButton>
          </Link>
        );
      },
      sortable: false,
    },
  ];

  const calcResult = useCallback(() => {
    if (
      !cards ||
      !cards.length ||
      !skills ||
      !skills.length ||
      !musics ||
      !musics.length ||
      !metas
    )
      return;
    let isSolo = selectedMode === "solo";

    let cardSkills = getCardSkillRates(cards, skills, teamCardsStates);
    let skillRates = isSolo
      ? getSoloAverageSkillRates(cardSkills)
      : getMultiAverageSkillRates(cardSkills);

    let ii = 0;
    let result: IMusicRecommendResult[] = metas
      .map((meta) => {
        let music0 = musics.filter((it) => it.id === meta.music_id);
        if (music0.length === 0) return {} as IMusicRecommendResult;
        let music = music0[0];
        let score = getScore(meta, teamPowerStates, skillRates, isSolo);

        let result = 0;
        switch (selectedMode) {
          case "solo":
          case "multi":
            result = score;
            break;
          case "event_pt":
            result = getEventPoint(
              score,
              score * 4,
              meta.event_rate / 100,
              1,
              0
            );
            break;
          case "event_pt_per_hour":
            result = getEventPointPerHour(
              score,
              score * 4,
              meta.event_rate / 100,
              1,
              0,
              meta.music_time
            );
        }
        result = Math.floor(result);

        return {
          id: ++ii,
          mid: meta.music_id,
          name: music.title,
          level: meta.level,
          difficulty: meta.difficulty,
          combo: meta.combo,
          duration: meta.music_time,
          result: result,
          link: `/music/${music.id}`,
        } as IMusicRecommendResult;
      })
      .filter((result) => result.result);
    //console.log(result.length);
    setRecommandResult(result);
    setActiveStep(maxStep - 1);
  }, [
    selectedMode,
    getCardSkillRates,
    cards,
    skills,
    teamCardsStates,
    getSoloAverageSkillRates,
    getMultiAverageSkillRates,
    metas,
    musics,
    getScore,
    teamPowerStates,
    getEventPoint,
    getEventPointPerHour,
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
        {t("common:musicRecommend")}
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
        {/*
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
        */}
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
            <Alert severity="info">{t("music_recommend:assumption")}</Alert>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((s) => s - 1)}
              variant="contained"
            >
              {t("common:back")}
            </Button>
            <div style={{ height: 650 }}>
              <DataGrid
                pagination
                autoPageSize
                rows={recommendResult}
                columns={columns}
                disableColumnFilter
                disableColumnMenu
                disableSelectionOnClick
                disableColumnSelector
              />
            </div>
          </StepContent>
        </Step>
      </Stepper>
      {/* </Container> */}
    </Fragment>
  );
};

export default MusicRecommend;
