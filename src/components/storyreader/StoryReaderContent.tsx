import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SettingContext } from "../../context";
import { useLayoutStyles } from "../../styles/layout";
import {
  IUnitStoryEpisode,
  IUnitStory,
  IUnitStoryChapter,
  SnippetAction,
} from "../../types.d";
import {
  getRemoteAssetURL,
  useCachedData,
  useProcessedScenarioData,
} from "../../utils";
import { Talk } from "./StoryReaderSnippet";

const useStyle = makeStyles((theme) => ({
  episodeBanner: {
    padding: theme.spacing(1.5, 0),
  },
}));

const StoryReaderContent: React.FC<{}> = () => {
  const { storyType, storyId } = useParams<{
    storyType: string;
    storyId: string;
  }>();
  const layoutClasses = useLayoutStyles();
  const classes = useStyle();
  const { t } = useTranslation();
  const { contentTransMode } = useContext(SettingContext)!;
  const getProcessedScenarioData = useProcessedScenarioData(contentTransMode);

  const [unitStories] = useCachedData<IUnitStory>("unitStories");

  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [unitChapter, setUnitChapter] = useState<IUnitStoryChapter>();
  const [unitEpisode, setUnitEpisode] = useState<IUnitStoryEpisode>();
  const [scenarioData, setScenarioData] = useState<{
    characters: {
      id: number;
      name: string;
    }[];
    actions: {
      [key: string]: any;
    }[];
  }>({
    characters: [],
    actions: [],
  });

  useEffect(() => {
    if (unitStories.length)
      switch (storyType) {
        case "unitStory":
          {
            const [unitId, chapterNo, episodeId] = storyId.split("-");

            const chapter = unitStories
              .find((us) => us.unit === unitId)!
              .chapters.find((ch) => ch.chapterNo === Number(chapterNo))!;
            setUnitChapter(chapter);

            const episode = chapter.episodes.find(
              (ep) => ep.id === Number(episodeId)
            );
            setUnitEpisode(episode);
          }
          break;
      }
  }, [unitStories, storyId, storyType]);

  useEffect(() => {
    if (unitChapter && unitEpisode)
      switch (storyType) {
        case "unitStory":
          getRemoteAssetURL(
            `/story/episode_image/${unitChapter.assetbundleName}_rip/${unitEpisode.assetbundleName}.webp`,
            setBannerUrl
          );
          getProcessedScenarioData(
            `/scenario/unitstory/${unitChapter.assetbundleName}_rip/${unitEpisode.scenarioId}.asset`
          ).then((data) => setScenarioData(data));
          break;
      }
  }, [storyType, unitChapter, unitEpisode, getProcessedScenarioData]);

  return (
    <Container className={layoutClasses.content}>
      <Paper className={classes.episodeBanner}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <Grid container alignItems="center" justify="center">
              <img src={bannerUrl} alt="banner" />
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid
              container
              spacing={1}
              alignItems="center"
              justify="center"
              style={{ height: "100%" }}
            >
              <Grid item xs={12}>
                <Typography align="center">{unitChapter?.title}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography align="center">
                  {unitEpisode?.episodeNoLabel} - {unitEpisode?.title}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      {scenarioData.actions.map((action, idx) => {
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
          default:
            return null;
        }
      })}
    </Container>
  );
};

export default StoryReaderContent;
