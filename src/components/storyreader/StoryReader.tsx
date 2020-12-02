import {
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import { SettingContext } from "../../context";
import { useLayoutStyles } from "../../styles/layout";
import {
  ICardEpisode,
  ICardInfo,
  ICharaProfile,
  IEventInfo,
  IEventStory,
  IUnitProfile,
  IUnitStory,
} from "../../types";
import { useCachedData } from "../../utils";
// import { useAssetI18n } from "../../utils/i18n";
import { CharaNameTrans, ContentTrans } from "../subs/ContentTrans";
import StoryReaderContent from "./StoryReaderContent";

type storyType = "eventStory" | "unitStory" | "charaStory" | "cardStory";

const StoryReader: React.FC<{}> = () => {
  // const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { path, url } = useRouteMatch();
  const match = useRouteMatch<{
    storyType: storyType;
    storyId: string;
  }>("/storyreader/:storyType/:storyId");
  // const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;
  // const getCharaName = useCharaName(contentTransMode);

  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [unitStories] = useCachedData<IUnitStory>("unitStories");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [events] = useCachedData<IEventInfo>("events");
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [cards] = useCachedData<ICardInfo>("cards");

  const [storyType, setStoryType] = useState<storyType>("unitStory");
  const [unitId, setUnitId] = useState<string>("idol");
  const [unitStoryChapterId, setUnitStoryChapterId] = useState<number>(1);
  const [unitStoryEpisodeId, setUnitStoryEpisodeId] = useState<number>(30000);
  const [eventId, setEventId] = useState<number>(1);
  const [eventStoryEpisodeId, setEventStoryEpisodeId] = useState<number>(
    1000001
  );
  const [charaId, setCharaId] = useState<number>(1);
  const [cardId, setCardId] = useState<number>(1);
  const [cardEpisodeId, setCardEpisodeId] = useState<number>(1);

  useEffect(() => {
    if (match) {
      setStoryType(match.params.storyType);
      switch (match.params.storyType) {
        case "unitStory":
          {
            const [unitId, chapterNo, episodeId] = match.params.storyId.split(
              "-"
            );
            setUnitId(unitId);
            setUnitStoryChapterId(Number(chapterNo));
            setUnitStoryEpisodeId(Number(episodeId));
          }
          break;
        case "eventStory":
          {
            const [eventId, episodeId] = match.params.storyId.split("-");
            setEventId(Number(eventId));
            setEventStoryEpisodeId(Number(episodeId));
          }
          break;
        case "charaStory":
          {
            const [charaId] = match.params.storyId.split("-");
            setCharaId(Number(charaId));
          }
          break;
        case "cardStory":
          {
            const [charaId, cardId, cardEpisodeId] = match.params.storyId.split(
              "-"
            );
            setCardEpisodeId(Number(cardEpisodeId));
            setCardId(Number(cardId));
            setCharaId(Number(charaId));
          }
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.params.storyType, match?.params.storyId]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:storyReader")}
      </Typography>
      <Alert severity="warning" className={layoutClasses.alert}>
        {t("common:betaIndicator")}
      </Alert>
      <Container maxWidth="lg">
        <Grid container spacing={1}>
          <Grid item xs={12} md={3}>
            <FormControl style={{ width: "100%" }}>
              <InputLabel id="select-story-type">
                {t("story_reader:selectLabel.storyType")}
              </InputLabel>
              <Select
                labelId="select-story-type"
                value={storyType}
                onChange={(e) => setStoryType(e.target.value as storyType)}
              >
                <MenuItem value="eventStory">
                  <Typography>
                    {t("story_reader:selectValue.eventStory")}
                  </Typography>
                </MenuItem>
                <MenuItem value="unitStory">
                  <Typography>
                    {t("story_reader:selectValue.unitStory")}
                  </Typography>
                </MenuItem>
                <MenuItem value="charaStory">
                  <Typography>
                    {t("story_reader:selectValue.charaStory")}
                  </Typography>
                </MenuItem>
                <MenuItem value="cardStory">
                  <Typography>
                    {t("story_reader:selectValue.cardStory")}
                  </Typography>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {storyType === "unitStory" ? (
            unitProfiles.length && unitStories.length ? (
              <Fragment>
                <Grid item xs={12} md={3}>
                  <FormControl style={{ width: "100%" }}>
                    <InputLabel id="select-unit-name">
                      {t("story_reader:selectLabel.unitName")}
                    </InputLabel>
                    <Select
                      labelId="select-unit-name"
                      value={unitId}
                      onChange={(e) => {
                        setUnitId(e.target.value as string);
                        setUnitStoryChapterId(1);
                        setUnitStoryEpisodeId(
                          unitStories
                            .find((us) => us.unit === e.target.value)!
                            .chapters.find(
                              (chapter) => chapter.chapterNo === 1
                            )!.episodes[0].id
                        );
                      }}
                    >
                      {unitProfiles.map((unit) => (
                        <MenuItem value={unit.unit} key={unit.unit}>
                          <ContentTrans
                            mode={contentTransMode}
                            contentKey={`unit_profile:${unit.unit}.name`}
                            original={unit.unitName}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl style={{ width: "100%" }}>
                    <InputLabel id="select-unit-story-chapter">
                      {t("story_reader:selectLabel.unitStoryChapter")}
                    </InputLabel>
                    <Select
                      labelId="select-unit-story-chapter"
                      value={unitStoryChapterId}
                      onChange={(e) =>
                        setUnitStoryChapterId(e.target.value as number)
                      }
                    >
                      {unitStories
                        .find((us) => us.unit === unitId)!
                        .chapters.map((chapter) => (
                          <MenuItem
                            value={chapter.chapterNo}
                            key={chapter.chapterNo}
                          >
                            <ContentTrans
                              mode={contentTransMode}
                              contentKey={`unit_story_chapter_title:${chapter.unit}-${chapter.chapterNo}`}
                              original={chapter.title}
                              originalProps={{ style: { overflow: "hidden" } }}
                              translatedProps={{
                                style: { overflow: "hidden" },
                              }}
                            />
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl style={{ width: "100%" }}>
                    <InputLabel id="select-unit-story-episode">
                      {t("story_reader:selectLabel.unitStoryEpisode")}
                    </InputLabel>
                    <Select
                      labelId="select-unit-story-episode"
                      value={unitStoryEpisodeId}
                      onChange={(e) =>
                        setUnitStoryEpisodeId(e.target.value as number)
                      }
                    >
                      {unitStories
                        .find((us) => us.unit === unitId)!
                        .chapters.find(
                          (chapter) => chapter.chapterNo === unitStoryChapterId
                        )!
                        .episodes.map((episode) => (
                          <MenuItem value={episode.id} key={episode.id}>
                            <ContentTrans
                              mode={contentTransMode}
                              contentKey={`unit_story_episode_title:${episode.id}`}
                              original={`${episode.episodeNoLabel} - ${episode.title}`}
                              originalProps={{ style: { overflow: "hidden" } }}
                              translatedProps={{
                                style: { overflow: "hidden" },
                              }}
                            />
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Fragment>
            ) : null
          ) : storyType === "eventStory" ? (
            eventStories.length ? (
              <Fragment>
                <Grid item xs={12} md={3}>
                  <FormControl style={{ width: "100%" }}>
                    <InputLabel id="select-event-name">
                      {t("story_reader:selectLabel.eventName")}
                    </InputLabel>
                    <Select
                      labelId="select-event-name"
                      value={eventId}
                      onChange={(e) => {
                        setEventId(e.target.value as number);
                        setEventStoryEpisodeId(
                          eventStories.find(
                            (es) => es.eventId === e.target.value
                          )!.eventStoryEpisodes[0].id
                        );
                      }}
                    >
                      {events.map((ev) => (
                        <MenuItem value={ev.id} key={ev.id}>
                          <ContentTrans
                            mode={contentTransMode}
                            contentKey={`event_name:${ev.id}`}
                            original={ev.name}
                            originalProps={{ style: { overflow: "hidden" } }}
                            translatedProps={{ style: { overflow: "hidden" } }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl style={{ width: "100%" }}>
                    <InputLabel id="select-event-story-episode">
                      {t("story_reader:selectLabel.eventStoryEpisode")}
                    </InputLabel>
                    <Select
                      labelId="select-event-story-episode"
                      value={eventStoryEpisodeId}
                      onChange={(e) =>
                        setEventStoryEpisodeId(e.target.value as number)
                      }
                    >
                      {eventStories
                        .find((es) => es.eventId === eventId)!
                        .eventStoryEpisodes.map((episode) => (
                          <MenuItem value={episode.id} key={episode.id}>
                            <ContentTrans
                              mode={contentTransMode}
                              contentKey={`event_story_episode_title:${episode.id}`}
                              original={`${episode.episodeNo} - ${episode.title}`}
                              originalProps={{ style: { overflow: "hidden" } }}
                              translatedProps={{
                                style: { overflow: "hidden" },
                              }}
                            />
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Fragment>
            ) : null
          ) : storyType === "charaStory" ? (
            characterProfiles.length ? (
              <Fragment>
                <Grid item xs={12} md={3}>
                  <FormControl style={{ width: "100%" }}>
                    <InputLabel id="select-chara-name">
                      {t("story_reader:selectLabel.charaName")}
                    </InputLabel>
                    <Select
                      labelId="select-chara-name"
                      value={charaId}
                      onChange={(e) => {
                        setCharaId(e.target.value as number);
                      }}
                    >
                      {characterProfiles.map((cp) => (
                        <MenuItem value={cp.characterId} key={cp.characterId}>
                          <CharaNameTrans
                            mode={contentTransMode}
                            characterId={cp.characterId}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Fragment>
            ) : null
          ) : storyType === "cardStory" ? (
            cards.length && cardEpisodes.length ? (
              <Fragment>
                <Grid item xs={12} md={3}>
                  <FormControl style={{ width: "100%" }}>
                    <InputLabel id="select-chara-name">
                      {t("story_reader:selectLabel.charaName")}
                    </InputLabel>
                    <Select
                      labelId="select-chara-name"
                      value={charaId}
                      onChange={(e) => {
                        setCharaId(e.target.value as number);
                        const cardId = cards.find(
                          (card) => card.characterId === e.target.value
                        )!.id;
                        setCardId(cardId);
                        setCardEpisodeId(
                          cardEpisodes.find((ce) => ce.cardId === cardId)!.id
                        );
                      }}
                    >
                      {characterProfiles.map((cp) => (
                        <MenuItem value={cp.characterId} key={cp.characterId}>
                          <CharaNameTrans
                            mode={contentTransMode}
                            characterId={cp.characterId}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl style={{ width: "100%" }}>
                    <InputLabel id="select-card-name">
                      {t("story_reader:selectLabel.cardName")}
                    </InputLabel>
                    <Select
                      labelId="select-card-name"
                      value={cardId}
                      onChange={(e) => {
                        setCardId(e.target.value as number);
                        setCardEpisodeId(
                          cardEpisodes.find(
                            (ce) => ce.cardId === e.target.value
                          )!.id
                        );
                      }}
                    >
                      {cards
                        .filter((card) => card.characterId === charaId)
                        .map((card) => (
                          <MenuItem value={card.id} key={card.id}>
                            <ContentTrans
                              mode={contentTransMode}
                              contentKey={`card_prefix:${card.id}`}
                              original={card.prefix}
                              originalProps={{ style: { overflow: "hidden" } }}
                              translatedProps={{
                                style: { overflow: "hidden" },
                              }}
                            />
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl style={{ width: "100%" }}>
                    <InputLabel id="select-card-story-episode">
                      {t("story_reader:selectLabel.cardStoryEpisode")}
                    </InputLabel>
                    <Select
                      labelId="select-card-story-episode"
                      value={cardEpisodeId}
                      onChange={(e) =>
                        setCardEpisodeId(e.target.value as number)
                      }
                    >
                      {cardEpisodes
                        .filter((ce) => ce.cardId === cardId)
                        .map((episode) => (
                          <MenuItem value={episode.id} key={episode.id}>
                            <ContentTrans
                              mode={contentTransMode}
                              contentKey={`card_episode_title:${episode.title}`}
                              original={`${episode.title}`}
                              originalProps={{ style: { overflow: "hidden" } }}
                              translatedProps={{
                                style: { overflow: "hidden" },
                              }}
                            />
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Fragment>
            ) : null
          ) : null}
        </Grid>
        <Grid container spacing={1}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to={`${url}/${storyType}/${
                storyType === "unitStory"
                  ? `${unitId}-${unitStoryChapterId}-${unitStoryEpisodeId}`
                  : storyType === "eventStory"
                  ? `${eventId}-${eventStoryEpisodeId}`
                  : storyType === "charaStory"
                  ? `${charaId}`
                  : storyType === "cardStory"
                  ? `${charaId}-${cardId}-${cardEpisodeId}`
                  : 0
              }`}
            >
              {t("story_reader:buttonLabel.showEpisode")}
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Switch>
        <Route path={`${path}/:storyType/:storyId`}>
          <StoryReaderContent />
        </Route>
      </Switch>
    </Fragment>
  );
};

export default StoryReader;
