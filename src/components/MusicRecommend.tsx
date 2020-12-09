import {
  Button,
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
import {
  ICardInfo,
  IMusicInfo,
  IMusicRecommendResult,
  ISkillInfo,
  ITeamCardState,
} from "../types";
import { useCachedData, useMuisicMeta } from "../utils";
import { useAssetI18n } from "../utils/i18n";
import { ColDef, DataGrid, ValueFormatterParams } from "@material-ui/data-grid";
import { Link } from "react-router-dom";
import { OpenInNew } from "@material-ui/icons";
import TeamBuiler from "./subs/TeamBuilder";

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
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;

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

  useEffect(() => {
    document.title = t("title:musicRecommend");
  }, [t]);

  const columns: ColDef[] = [
    {
      field: "name",
      headerName: t("music_recommend:result.musicName"),
      width: 500,
    },
    {
      field: "level",
      headerName: t("music:difficulty"),
      width: 65,
      cellClassName: (it) => {
        let diff = it.getValue("difficulty") as string;
        // @ts-ignore
        return classes[diff];
      },
    },
    {
      field: "duration",
      headerName: t("music:actualPlaybackTime"),
      width: 125,
    },
    {
      field: "combo",
      headerName: t("music:noteCount"),
      width: 90,
    },
    {
      field: "result",
      headerName: t("music_recommend:result.label"),
      width: 100,
      sortDirection: "desc",
    },
    {
      field: "action",
      headerName: t("home:game-news.action"),
      width: 80,
      renderCell: (params: ValueFormatterParams) => {
        const info = params.data as IMusicRecommendResult;
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

  const levelWeight = useCallback((level: number) => {
    return 1 + Math.max(0, level - 5) * 0.005;
  }, []);

  const eventPoint = useCallback(
    (score: number, other: number, rate: number, unitRate: number = 0) => {
      return Math.floor(
        ((((100 + Math.floor(score / 20000) + Math.min(7, other / 400000)) *
          rate) /
          100) *
          (100 + unitRate)) /
          100
      );
    },
    []
  );

  const calcResult = useCallback(() => {
    let teamSkills: number[] = [];
    teamCardsStates.forEach((card) => {
      let skillId = cards.filter((it) => it.id === card.cardId)[0].skillId;
      let skill = skills.filter((it) => it.id === skillId)[0];
      skill.skillEffects.forEach((it) => {
        if (it.skillEffectType === "score_up") {
          if (card.skillLevel <= it.skillEffectDetails.length) {
            teamSkills.push(
              it.skillEffectDetails[card.skillLevel - 1].activateEffectValue
            );
          }
        }
      });
    });
    console.log(teamSkills);

    let skillLeader = teamSkills[0] / 100;
    let sum = 0;
    teamSkills.forEach((it) => {
      sum += it;
    });
    let skillMember = sum / teamSkills.length / 100;

    let isSolo = selectedMode === "solo";
    if (!isSolo) {
      let skill = 1 + skillLeader;
      for (let i = 1; i < teamSkills.length; ++i) {
        skill *= 1 + teamSkills[i] / 500;
      }
      skillLeader = skill - 1;
      skillMember = skill - 1;
    }

    //console.log(skillLeader);
    //console.log(skillMember);

    let ii = 0;
    //console.log(metas.length);
    let result: IMusicRecommendResult[] = metas.map((meta) => {
      let music0 = musics.filter((it) => it.id === meta.music_id);
      if (music0.length === 0) return {} as IMusicRecommendResult;
      let music = music0[0];

      let skillScore = 0;
      let skillScores = isSolo ? meta.skill_score_solo : meta.skill_score_multi;
      skillScores.forEach((it, i) => {
        skillScore +=
          it *
          (i === 5
            ? skillLeader
            : isSolo && i >= teamSkills.length
            ? 0
            : skillMember);
      });
      if (music.id === 11) console.log(skillScore);

      let score =
        teamPowerStates *
        4 *
        (meta.base_score +
          skillScore +
          (isSolo
            ? 0
            : meta.fever_score * 0.5 + 0.05 * levelWeight(meta.level)));
      score = Math.floor(score);

      let result = 0;
      switch (selectedMode) {
        case "solo":
        case "multi":
          result = score;
          break;
        case "event_pt":
          result = eventPoint(score, score * 4, meta.event_rate);
          break;
        case "event_pt_per_hour":
          result =
            (eventPoint(score, score * 4, meta.event_rate) /
              (meta.music_time + 30)) *
            3600;
      }
      result = Math.floor(result);

      return {
        id: ++ii,
        name: getTranslated(
          contentTransMode,
          `music_titles:${meta.music_id}`,
          music.title
        ),
        level: meta.level,
        difficulty: meta.difficulty,
        combo: meta.combo,
        duration: meta.music_time,
        result: result,
        link: `/music/${music.id}`,
      } as IMusicRecommendResult;
    });
    //console.log(result.length);
    setRecommandResult(result);
    setActiveStep(maxStep - 1);
  }, [
    teamCardsStates,
    selectedMode,
    metas,
    skills,
    cards,
    musics,
    teamPowerStates,
    levelWeight,
    getTranslated,
    contentTransMode,
    eventPoint,
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
