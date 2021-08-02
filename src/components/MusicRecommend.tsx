import {
  Button,
  Chip,
  FormControl,
  FormControlLabel,
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
import { useMemo } from "react";

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
  const [teamTotalPower, setTeamTotalPower] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  // const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>("solo");
  const [recommendResult, setRecommandResult] = useState<
    IMusicRecommendResult[]
  >([]);

  const {
    getCardSkillRates,
    getMultiAverageSkillRates,
    // getSoloAverageSkillRates,
    getScore,
    getSoloBestSkillOrderAndRates,
    getSoloWorstSkillOrderAndRates,
  } = useScoreCalc();

  useEffect(() => {
    document.title = t("title:musicRecommend");
  }, [t]);

  const columns: ColDef[] = useMemo(
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
                colorPrimary: classes[params.row.difficulty as "easy"],
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
        field: "lowScore",
        headerName: t("music_recommend:table.column.low"),
        width: 150,
        // sortDirection: "desc",
        align: "center",
        hide: selectedMode === "multi",
        renderCell: (params: ValueFormatterParams) => params.row.result[0],
        sortComparator: (v1, v2, param1, param2) =>
          param1.row.result[0] - param2.row.result[0],
      },
      {
        field: "highScore",
        headerName: t("music_recommend:table.column.high"),
        width: 150,
        sortDirection: selectedMode === "solo" ? "desc" : null,
        align: "center",
        hide: selectedMode === "multi",
        renderCell: (params: ValueFormatterParams) => params.row.result[1],
        sortComparator: (v1, v2, param1, param2) =>
          param1.row.result[1] - param2.row.result[1],
      },
      {
        field: "avgScore",
        headerName: t("music_recommend:result.label"),
        width: 100,
        sortDirection: selectedMode === "multi" ? "desc" : null,
        align: "center",
        hide: selectedMode === "solo",
        valueFormatter: (params: ValueFormatterParams) => params.row.result,
        sortComparator: (v1, v2, param1, param2) =>
          param1.row.result - param2.row.result,
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
    ],
    [classes, selectedMode, t]
  );

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
    let result: IMusicRecommendResult[] = [];

    if (!isSolo) {
      const skillRates = getMultiAverageSkillRates(cardSkills);

      result = metas
        .map((meta, idx) => {
          const music = musics.find((it) => it.id === meta.music_id);
          if (!music) return {} as IMusicRecommendResult;
          const score = Math.floor(
            getScore(meta, teamTotalPower, skillRates, isSolo)
          );

          return {
            id: idx,
            mid: meta.music_id,
            name: music.title,
            level: meta.level,
            difficulty: meta.difficulty,
            combo: meta.combo,
            duration: meta.music_time,
            result: score,
            link: `/music/${music.id}`,
          } as IMusicRecommendResult;
        })
        .filter((result) => result.result);
    } else {
      result = metas
        .map((meta, idx) => {
          const music = musics.find((it) => it.id === meta.music_id);
          if (!music) return {} as IMusicRecommendResult;
          const [
            worstSkillRates,
            // worstMemberOrder,
          ] = getSoloWorstSkillOrderAndRates(cardSkills, meta);
          const [
            bestSkillRates,
            // bestMemberOrder,
          ] = getSoloBestSkillOrderAndRates(cardSkills, meta);
          const worstScore = Math.floor(
            getScore(meta, teamTotalPower, worstSkillRates, isSolo)
          );
          const bestScore = Math.floor(
            getScore(meta, teamTotalPower, bestSkillRates, isSolo)
          );
          console.log(
            worstSkillRates,
            worstScore,
            bestSkillRates,
            bestScore,
            meta.skill_score_solo
          );

          return {
            id: idx,
            mid: meta.music_id,
            name: music.title,
            level: meta.level,
            difficulty: meta.difficulty,
            combo: meta.combo,
            duration: meta.music_time,
            result: [worstScore, bestScore],
            link: `/music/${music.id}`,
          } as IMusicRecommendResult;
        })
        .filter((result) => result.result);
    }

    setRecommandResult(result);
    setActiveStep(maxStep - 1);
  }, [
    cards,
    skills,
    musics,
    metas,
    selectedMode,
    getCardSkillRates,
    teamCardsStates,
    getMultiAverageSkillRates,
    getScore,
    teamTotalPower,
    getSoloWorstSkillOrderAndRates,
    getSoloBestSkillOrderAndRates,
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
              teamTotalPower={teamTotalPower}
              setTeamCards={setTeamCards}
              setTeamCardsStates={setTeamCardsStates}
              setTeamTotalPower={setTeamTotalPower}
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
                {/* <FormLabel component="legend">Select Mode</FormLabel> */}
                <RadioGroup
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
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
