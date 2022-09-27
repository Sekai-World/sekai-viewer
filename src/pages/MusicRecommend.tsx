import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ICardInfo,
  IMusicInfo,
  IMusicMeta,
  IMusicRecommendResult,
  ISkillInfo,
  // ITeamCardState,
} from "../types.d";
import { filterMusicMeta, useCachedData, useMusicMeta } from "../utils";
import {
  GridColDef,
  DataGrid,
  GridRenderCellParams,
  GridValueFormatterParams,
  GridSortModel,
} from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { OpenInNew } from "@mui/icons-material";
import { useScoreCalc } from "../utils/scoreCalc";
import TeamBuilder from "../components/blocks/TeamBuilder";
import { ContentTrans } from "../components/helpers/ContentTrans";
import { useMemo } from "react";
import { ISekaiCardState } from "../stores/sekai";
import ChipDifficulty from "../components/styled/ChipDifficulty";
import TypographyHeader from "../components/styled/TypographyHeader";
import ContainerContent from "../components/styled/ContainerContent";

const MusicRecommend: React.FC<{}> = () => {
  const { t } = useTranslation();

  const [cards] = useCachedData<ICardInfo>("cards");
  const [skills] = useCachedData<ISkillInfo>("skills");
  const [musics] = useCachedData<IMusicInfo>("musics");
  const [metas] = useMusicMeta();

  const maxStep = 3;

  const [teamCards, setTeamCards] = useState<number[]>([]);
  const [teamCardsStates, setTeamCardsStates] = useState<ISekaiCardState[]>([]);
  const [teamTotalPower, setTeamTotalPower] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  // const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>("solo");
  const [recommendResult, setRecommandResult] = useState<
    IMusicRecommendResult[]
  >([]);
  const [validMetas, setValidMetas] = useState<IMusicMeta[]>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

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

  useEffect(() => {
    if (metas && musics) setValidMetas(filterMusicMeta(metas, musics));
  }, [metas, musics]);

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
            <ChipDifficulty
              difficulty={params.row.difficulty}
              value={params.value}
            />
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
        valueFormatter: (params: GridValueFormatterParams) =>
          params.api.getCellValue(params.id, "result")[0],
        sortComparator: (v1, v2, param1, param2) =>
          param1.api.getCellValue(param1.id, "result")[0] -
          param2.api.getCellValue(param2.id, "result")[0],
      },
      {
        field: "highScore",
        headerName: t("music_recommend:table.column.high"),
        width: 150,
        sortDirection: selectedMode === "solo" ? "desc" : null,
        align: "center",
        hide: selectedMode === "multi",
        valueFormatter: (params: GridValueFormatterParams) =>
          params.api.getCellValue(params.id, "result")[1],
        sortComparator: (v1, v2, param1, param2) =>
          param1.api.getCellValue(param1.id, "result")[1] -
          param2.api.getCellValue(param2.id, "result")[1],
      },
      {
        field: "avgScore",
        headerName: t("music_recommend:result.label"),
        width: 100,
        sortDirection: selectedMode === "multi" ? "desc" : null,
        align: "center",
        hide: selectedMode === "solo",
        valueFormatter: (params: GridValueFormatterParams) =>
          params.api.getCellValue(params.id, "result"),
        sortComparator: (v1, v2, param1, param2) =>
          param1.api.getCellValue(param1.id, "result") -
          param2.api.getCellValue(param2.id, "result"),
      },
      {
        field: "action",
        headerName: t("home:game-news.action"),
        width: 80,
        renderCell: (params: GridRenderCellParams) => {
          const info = params.row as IMusicRecommendResult;
          return (
            <Link to={info.link} target="_blank">
              <IconButton color="primary" size="large">
                <OpenInNew></OpenInNew>
              </IconButton>
            </Link>
          );
        },
        sortable: false,
      },
    ],
    [selectedMode, t]
  );

  const calcResult = useCallback(() => {
    if (
      !cards ||
      !cards.length ||
      !skills ||
      !skills.length ||
      !musics ||
      !musics.length ||
      !validMetas.length
    )
      return;
    let isSolo = selectedMode === "solo";

    let cardSkills = getCardSkillRates(cards, skills, teamCardsStates);
    let result: IMusicRecommendResult[] = [];

    if (!isSolo) {
      const skillRates = getMultiAverageSkillRates(cardSkills);

      setSortModel([
        {
          field: "avgScore",
          sort: "desc",
        },
      ]);

      result = validMetas
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
      setSortModel([
        {
          field: "highScore",
          sort: "desc",
        },
      ]);

      result = validMetas
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
          // console.log(
          //   worstSkillRates,
          //   worstScore,
          //   bestSkillRates,
          //   bestScore,
          //   meta.skill_score_solo
          // );

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
    validMetas,
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
      <TypographyHeader>{t("common:musicRecommend")}</TypographyHeader>
      <Alert
        severity="warning"
        sx={(theme) => ({ margin: theme.spacing(1, 0) })}
      >
        {t("common:betaIndicator")}
      </Alert>
      <ContainerContent>
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
                  sortModel={sortModel}
                  onSortModelChange={setSortModel}
                />
              </div>
            </StepContent>
          </Step>
        </Stepper>
      </ContainerContent>
    </Fragment>
  );
};

export default MusicRecommend;
