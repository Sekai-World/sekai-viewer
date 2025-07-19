import { Chip, Grid, LinearProgress, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SnippetAction, ServerRegion } from "../../types.d";
import {
  useScenarioInfo,
  useProcessedScenarioDataForText,
} from "../../utils/storyLoader";
import { ReleaseCondTrans } from "../../components/helpers/ContentTrans";
import { Sound, SpecialEffect, Talk } from "./StoryReaderSnippet";
import MysekaiStoryDisplay from "./MysekaiStoryDisplay";
import Image from "mui-image";
import ContainerContent from "../../components/styled/ContainerContent";
import { useAlertSnackbar } from "../../utils";

const StoryReaderContent: React.FC<{
  storyType: string;
  storyId: string;
  region: ServerRegion;
}> = ({ storyType, storyId, region }) => {
  const { t } = useTranslation();
  const getScenarioInfo = useScenarioInfo();
  const getProcessedScenarioDataForText = useProcessedScenarioDataForText();
  const { showError } = useAlertSnackbar();

  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [chapterTitle, setChapterTitle] = useState<string>("");
  const [episodeTitle, setEpisodeTitle] = useState<string>("");
  const [scenarioData, setScenarioData] = useState<{
    characters: {
      id: number;
      name: string;
    }[];
    actions: {
      [key: string]: any;
    }[];
  }>({
    actions: [],
    characters: [],
  });
  const [releaseConditionId, setReleaseConditionId] = useState<number>(0);

  useEffect(() => {
    setScenarioData({
      actions: [],
      characters: [],
    });
    getScenarioInfo(storyType, storyId, region)
      .then((info) => {
        if (info) {
          if (info.bannerUrl) setBannerUrl(info.bannerUrl);
          if (info.chapterTitle) setChapterTitle(info.chapterTitle);
          if (info.episodeTitle) setEpisodeTitle(info.episodeTitle);
          if (info.releaseConditionId)
            setReleaseConditionId(info.releaseConditionId);
          return getProcessedScenarioDataForText(info);
        }
      })
      .then((data) => {
        if (data) setScenarioData(data);
      })
      .catch((err) => {
        if (err instanceof Error) showError(err.message);
      });
  }, [
    storyType,
    storyId,
    region,
    getScenarioInfo,
    getProcessedScenarioDataForText,
  ]);

  return (
    <ContainerContent>
      {storyType !== "areaTalk" && storyType !== "mysekaiTalk" && (
        <Paper sx={(theme) => ({ padding: theme.spacing(1.5, 0) })}>
          <Grid container spacing={1} justifyContent="space-around">
            <Grid
              item
              xs={storyType === "charaStory" ? 6 : 8}
              sm={storyType === "charaStory" ? 3 : 4}
              lg={storyType === "charaStory" ? 2 : 3}
            >
              <Image src={bannerUrl} bgColor="" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Grid
                container
                spacing={1}
                alignItems="center"
                justifyContent="center"
                style={{ height: "100%" }}
              >
                {chapterTitle ? (
                  <Grid item xs={12}>
                    <Typography align="center">{chapterTitle}</Typography>
                  </Grid>
                ) : null}
                <Grid item xs={12}>
                  <Typography align="center">{episodeTitle}</Typography>
                </Grid>
                {releaseConditionId ? (
                  <Grid item xs={12}>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="center"
                      spacing={1}
                    >
                      <Grid item>
                        <Chip label={t("common:releaseCondition")} />
                      </Grid>
                      <Grid item>
                        <ReleaseCondTrans
                          releaseCondId={releaseConditionId}
                          originalProps={{ align: "center" }}
                          translatedProps={{ align: "center" }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                ) : null}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      )}
      {!scenarioData.actions.length && storyType !== "mysekaiTalk" && (
        <LinearProgress variant="indeterminate" />
      )}
      {storyType === "mysekaiTalk" ? (
        <MysekaiStoryDisplay storyId={storyId} />
      ) : (
        scenarioData.actions.map((action, idx) => {
          switch (action.type as SnippetAction) {
            case SnippetAction.Talk:
              return (
                <Talk
                  key={`action-${idx}`}
                  characterId={action.chara.id as number}
                  characterName={action.chara.name as string}
                  text={action.body as string}
                  voiceUrl={action.voice as string}
                />
              );
            case SnippetAction.SpecialEffect:
              return (
                <SpecialEffect
                  key={`action-${idx}`}
                  seType={action.seType}
                  text={action.body}
                  resource={action.resource}
                />
              );
            case SnippetAction.Sound:
              return (
                <Sound
                  key={`action-${idx}`}
                  hasBgm={action.hasBgm}
                  hasSe={action.hasSe}
                  voiceUrl={action.hasBgm ? action.bgm : action.se}
                />
              );
            default:
              return null;
          }
        })
      )}
    </ContainerContent>
  );
};

export default StoryReaderContent;
