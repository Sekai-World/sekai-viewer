import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
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
  IMusicDifficultyInfo,
  IMusicInfo,
  IMusicMeta,
  IMusicRecommendResult,
  ISkillInfo,
  // ITeamCardState,
} from "../types.d";
import {
  addLevelToMusicMeta,
  filterMusicMeta,
  useCachedData,
  useMusicMeta,
} from "../utils";
import {
  GridColDef,
  DataGrid,
  GridRenderCellParams,
  GridSortModel,
} from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { OpenInNew, Search } from "@mui/icons-material";
import { useScoreCalc } from "../utils/scoreCalc";
import TeamBuilder from "../components/blocks/TeamBuilder";
import { ContentTrans } from "../components/helpers/ContentTrans";
import { useMemo } from "react";
import { ISekaiCardState } from "../stores/sekai";
import ChipDifficulty from "../components/styled/ChipDifficulty";
import TypographyHeader from "../components/styled/TypographyHeader";
import ContainerContent from "../components/styled/ContainerContent";

const MusicRecommend: React.FC<unknown> = () => {
  const { t } = useTranslation();

  const [cards] = useCachedData<ICardInfo>("cards");
  const [skills] = useCachedData<ISkillInfo>("skills");
  const [musics] = useCachedData<IMusicInfo>("musics");
  const [musicDifficulties] =
    useCachedData<IMusicDifficultyInfo>("musicDifficulties");
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
  const [searchTitle, setSearchTitle] = useState("");
  const [recommendResultCache, setRecommandResultCache] = useState<
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

  useEffect(() => {
    if (metas && musics && musicDifficulties) {
      const filteredMetas = filterMusicMeta(metas, musics);
      setValidMetas(addLevelToMusicMeta(filteredMetas, musicDifficulties));
    }
  }, [metas, musicDifficulties, musics]);

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
              difficulty={params.row["difficulty"]}
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
        field: "combo",
        headerName: t("music:noteCount"),
        width: 110,
      },
      {
        // sortDirection: "desc",
        align: "center",

        field: "lowScore",

        headerName: t("music_recommend:table.column.low"),

        hide: selectedMode === "multi",
        valueGetter: (value, row) => row.result[0],
        width: 150,
      },
      {
        align: "center",
        field: "highScore",
        headerName: t("music_recommend:table.column.high"),
        hide: selectedMode === "multi",
        valueGetter: (value, row) => row.result[1],
        sortDirection: selectedMode === "solo" ? "desc" : null,
        width: 150,
      },
      {
        align: "center",
        field: "avgScore",
        headerName: t("music_recommend:result.label"),
        hide: selectedMode === "solo",
        valueGetter: (value, row) => row.result,
        sortDirection: selectedMode === "multi" ? "desc" : null,
        width: 100,
      },
      {
        field: "action",
        headerName: t("home:game-news.action"),
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
        width: 80,
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
    const isSolo = selectedMode === "solo";

    const cardSkills = getCardSkillRates(cards, skills, teamCardsStates);
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
            combo: meta.combo,
            difficulty: meta.difficulty,
            duration: meta.music_time,
            id: idx,
            level: meta.level,
            link: `/music/${music.id}`,
            mid: meta.music_id,
            name: music.title,
            result: score,
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
            combo: meta.combo,
            difficulty: meta.difficulty,
            duration: meta.music_time,
            id: idx,
            level: meta.level,
            link: `/music/${music.id}`,
            mid: meta.music_id,
            name: music.title,
            result: [worstScore, bestScore],
          } as IMusicRecommendResult;
        })
        .filter((result) => result.result);
    }

    setRecommandResult(result);
    setRecommandResultCache(result);
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

  const filterBySongName = () => {
    if (!searchTitle) {
      setRecommandResult(recommendResultCache);
    } else if (musics) {
      const filtered = recommendResultCache.filter((result) => {
        const music = musics.find((it) => it.id === result.mid);
        if (!music) return false;
        return music.title.includes(searchTitle);
      });
      setRecommandResult(filtered);
    }
  };

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
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <Alert severity="info">
                    {t("music_recommend:assumption")}
                  </Alert>
                </Grid>
                <Grid item container alignItems="center" spacing={1}>
                  <Grid item>
                    <Button
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep((s) => s - 1)}
                      variant="contained"
                    >
                      {t("common:back")}
                    </Button>
                  </Grid>
                  <Grid item>
                    <FormControl variant="standard" size="small">
                      <InputLabel htmlFor="search-song-name">
                        Song Name
                      </InputLabel>
                      <Input
                        id="search-song-name"
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") filterBySongName();
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="search button"
                              onClick={filterBySongName}
                            >
                              <Search />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid item>
                  <div style={{ height: 650 }}>
                    <DataGrid
                      pagination
                      autoPageSize
                      rows={recommendResult}
                      columns={columns}
                      disableColumnFilter
                      disableColumnMenu
                      disableRowSelectionOnClick
                      disableColumnSelector
                      sortModel={sortModel}
                      onSortModelChange={setSortModel}
                    />
                  </div>
                </Grid>
              </Grid>
            </StepContent>
          </Step>
        </Stepper>
      </ContainerContent>
    </Fragment>
  );
};

export default MusicRecommend;
