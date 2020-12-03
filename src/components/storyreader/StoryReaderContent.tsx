import {
  CardMedia,
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
  IUnitStory,
  IEventStory,
  SnippetAction,
  ICharaProfile,
  ICardEpisode,
} from "../../types.d";
import {
  getRemoteAssetURL,
  useCachedData,
  useProcessedScenarioData,
} from "../../utils";
import { charaIcons } from "../../utils/resources";
import { ReleaseCondTrans } from "../subs/ContentTrans";
import { Sound, SpecialEffect, Talk } from "./StoryReaderSnippet";

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
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");

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
    characters: [],
    actions: [],
  });
  const [releaseConditionId, setReleaseConditionId] = useState<number>(0);

  useEffect(() => {
    switch (storyType) {
      case "unitStory":
        if (unitStories.length) {
          const [unitId, chapterNo, episodeId] = storyId.split("-");

          const chapter = unitStories
            .find((us) => us.unit === unitId)!
            .chapters.find((ch) => ch.chapterNo === Number(chapterNo))!;

          const episode = chapter.episodes.find(
            (ep) => ep.id === Number(episodeId)
          )!;

          getRemoteAssetURL(
            `story/episode_image/${chapter.assetbundleName}_rip/${episode.assetbundleName}.webp`,
            setBannerUrl
          );
          getProcessedScenarioData(
            `scenario/unitstory/${chapter.assetbundleName}_rip/${episode.scenarioId}.asset`,
            false
          ).then((data) => setScenarioData(data));

          setChapterTitle(chapter.title);
          setEpisodeTitle(`${episode.episodeNoLabel} - ${episode.title}`);
          setReleaseConditionId(episode.releaseConditionId);
        }
        break;
      case "eventStory":
        if (eventStories.length) {
          const [eventId, episodeId] = storyId.split("-");

          const chapter = eventStories.find(
            (es) => es.eventId === Number(eventId)
          )!;

          const episode = chapter.eventStoryEpisodes.find(
            (ep) => ep.id === Number(episodeId)
          )!;

          getRemoteAssetURL(
            `event_story/${chapter.assetbundleName}/episode_image_rip/${episode.assetbundleName}.webp`,
            setBannerUrl
          );
          getProcessedScenarioData(
            `event_story/${chapter.assetbundleName}/scenario_rip/${episode.scenarioId}.asset`,
            false
          ).then((data) => setScenarioData(data));

          setChapterTitle("");
          setEpisodeTitle(`${episode.episodeNo} - ${episode.title}`);
          setReleaseConditionId(episode.releaseConditionId);
        }
        break;
      case "charaStory":
        if (characterProfiles.length) {
          const [charaId] = storyId.split("-");

          const episode = characterProfiles.find(
            (cp) => cp.characterId === Number(charaId)
          )!;

          setBannerUrl(charaIcons[`CharaIcon${charaId}` as "CharaIcon1"]);
          getProcessedScenarioData(
            `scenario/profile_rip/${episode.scenarioId}.asset`,
            false
          ).then((data) => setScenarioData(data));

          setChapterTitle("");
          setEpisodeTitle(t("member:introduction"));
          setReleaseConditionId(0);
        }
        break;
      case "cardStory":
        if (cardEpisodes.length) {
          const [, , cardEpisodeId] = storyId.split("-");

          const episode = cardEpisodes.find(
            (ce) => ce.id === Number(cardEpisodeId)
          )!;

          // setBannerUrl(charaIcons[`CharaIcon${charaId}` as "CharaIcon1"]);
          getRemoteAssetURL(
            `character/member_small/${episode.assetbundleName}_rip/card_normal.webp`,
            setBannerUrl
          );
          getProcessedScenarioData(
            `character/member/${episode.assetbundleName}_rip/${episode.scenarioId}.asset`,
            true
          ).then((data) => setScenarioData(data));

          setChapterTitle("");
          setEpisodeTitle(episode.title);
          setReleaseConditionId(episode.releaseConditionId);
        }
        break;
    }
  }, [
    unitStories,
    eventStories,
    storyId,
    storyType,
    getProcessedScenarioData,
    characterProfiles,
    cardEpisodes,
    t,
  ]);

  return (
    <Container className={layoutClasses.content}>
      <Paper className={classes.episodeBanner}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <CardMedia
              image={bannerUrl}
              style={{ paddingTop: "56.25%", backgroundSize: "contain" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid
              container
              spacing={1}
              alignItems="center"
              justify="center"
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
                  <ReleaseCondTrans
                    mode={contentTransMode}
                    releaseCondId={releaseConditionId}
                    originalProps={{ align: "center" }}
                    translatedProps={{ align: "center" }}
                  />
                </Grid>
              ) : null}
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
      })}
    </Container>
  );
};

export default StoryReaderContent;
