import React, { useEffect } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import { useCachedData } from "../../utils";
import { useRootStore } from "../../stores/root";
import type { IEventInfo, IEventStory, ServerRegion } from "../../types.d";

import { Grid, CardContent, Card, Typography, styled } from "@mui/material";

import LinkNoDecorationAlsoNoHover from "../styled/LinkNoDecorationAlsoHover";
const CardSelect = styled(Card)`
  &:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

import { ContentTrans } from "../helpers/ContentTrans";
import ImageWrapper from "../helpers/ImageWrapper";

const EventStory: React.FC<{
  onSetStory: (data?: {
    storyType: string;
    storyId: string;
    region: ServerRegion;
  }) => void;
}> = ({ onSetStory }) => {
  const { path } = useRouteMatch();
  const [events] = useCachedData<IEventInfo>("events");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const {
    region,
    settings: { isShowSpoiler },
  } = useRootStore();

  const leafMatch = useRouteMatch({
    path: `${path}/:eventId/:episodeNo`,
    strict: true,
  });
  useEffect(() => {
    if (leafMatch) {
      onSetStory({
        storyType: "eventStory",
        storyId: leafMatch.url,
        region,
      });
    } else {
      onSetStory();
    }
  }, [leafMatch, onSetStory, region]);

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Grid container spacing={1}>
          {!!events &&
            (isShowSpoiler
              ? events
              : events.filter((e) => e.startAt <= new Date().getTime())
            )
              .slice()
              .reverse()
              .map((ev) => (
                <Grid item xs={12} sm={6} md={3} key={ev.id}>
                  <LinkNoDecorationAlsoNoHover to={`${path}/${ev.id}`}>
                    <CardSelect>
                      <CardContent>
                        <ImageWrapper
                          src={`event_story/${ev.assetbundleName}/screen_image_rip/banner_event_story.webp`}
                          bgColor=""
                          duration={0}
                          region={region}
                        />
                      </CardContent>
                      <CardContent>
                        <ContentTrans
                          contentKey={`event_name:${ev.id}`}
                          original={ev.name}
                          originalProps={{ style: { overflow: "hidden" } }}
                          translatedProps={{ style: { overflow: "hidden" } }}
                        />
                      </CardContent>
                    </CardSelect>
                  </LinkNoDecorationAlsoNoHover>
                </Grid>
              ))}
        </Grid>
      </Route>
      <Route path={`${path}/:eventId`} exact>
        {({ match }) => {
          const eventId = match?.params.eventId;
          if (eventId && eventStories) {
            const chapter = eventStories.find(
              (es) => es.eventId === Number(eventId)
            );
            if (chapter) {
              return (
                <Grid container spacing={1}>
                  {!!chapter.outline && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        {chapter.outline}
                      </Typography>
                    </Grid>
                  )}
                  {chapter.eventStoryEpisodes.map((episode) => (
                    <Grid item xs={12} sm={6} md={3} key={episode.id}>
                      <LinkNoDecorationAlsoNoHover
                        to={`${match?.url}/${episode.episodeNo}`}
                      >
                        <CardSelect>
                          <CardContent>
                            <ImageWrapper
                              src={`event_story/${chapter.assetbundleName}/episode_image_rip/${episode.assetbundleName}.webp`}
                              bgColor=""
                              duration={0}
                              region={region}
                            />
                          </CardContent>
                          <CardContent>
                            <ContentTrans
                              contentKey={`event_story_episode_title:${episode.eventStoryId}-${episode.episodeNo}`}
                              original={episode.title}
                              originalProps={{
                                style: { overflow: "hidden" },
                              }}
                              translatedProps={{
                                style: { overflow: "hidden" },
                              }}
                            />
                          </CardContent>
                        </CardSelect>
                      </LinkNoDecorationAlsoNoHover>
                    </Grid>
                  ))}
                </Grid>
              );
            }
          }
        }}
      </Route>
    </Switch>
  );
};
export default EventStory;
