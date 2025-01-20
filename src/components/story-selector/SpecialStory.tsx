import React, { useEffect } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import { useCachedData } from "../../utils";
import { useRootStore } from "../../stores/root";
import { ISpecialStory, ServerRegion } from "../../types.d";

import { Grid, CardContent, Card, Typography, styled } from "@mui/material";

import LinkNoDecorationAlsoNoHover from "../styled/LinkNoDecorationAlsoHover";
const CardSelect = styled(Card)`
  &:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

const SpecialStory: React.FC<{
  onSetStory: (data?: {
    storyType: string;
    storyId: string;
    region: ServerRegion;
  }) => void;
}> = ({ onSetStory }) => {
  const { path } = useRouteMatch();
  const [specialStories] = useCachedData<ISpecialStory>("specialStories");
  const { region } = useRootStore();

  const leafMatch = useRouteMatch({
    path: `${path}/:storyId/:episodeNo`,
    strict: true,
  });
  useEffect(() => {
    if (leafMatch) {
      onSetStory({
        storyType: "specialStory",
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
          {!!specialStories &&
            specialStories
              .slice()
              .reverse()
              .map((sp) => (
                <Grid item xs={12} sm={6} md={3} key={sp.id}>
                  <LinkNoDecorationAlsoNoHover to={`${path}/${sp.id}`}>
                    <CardSelect>
                      <CardContent>
                        {/* <ContentTrans
                        contentKey={`event_name:${ev.id}`}
                        original={ev.name}
                        originalProps={{ style: { overflow: "hidden" } }}
                        translatedProps={{ style: { overflow: "hidden" } }}
                      /> */}
                        <Typography style={{ overflow: "hidden" }}>
                          {sp.title}
                        </Typography>
                      </CardContent>
                    </CardSelect>
                  </LinkNoDecorationAlsoNoHover>
                </Grid>
              ))}
        </Grid>
      </Route>
      <Route path={`${path}/:storyId`} exact>
        {({ match }) => {
          const storyId = match?.params.storyId;
          if (storyId && specialStories) {
            const chapter = specialStories.find(
              (sp) => sp.id === Number(storyId)
            );
            if (chapter) {
              return (
                <Grid container spacing={1}>
                  {chapter.episodes.map((episode) => (
                    <Grid item xs={12} sm={6} md={3} key={episode.id}>
                      <LinkNoDecorationAlsoNoHover
                        to={`${match?.url}/${episode.episodeNo}`}
                      >
                        <CardSelect>
                          <CardContent>
                            {/* <ContentTrans
                            contentKey={`event_story_episode_title:${episode.eventStoryId}-${episode.episodeNo}`}
                            original={episode.title}
                            originalProps={{
                              style: { overflow: "hidden" },
                            }}
                            translatedProps={{
                              style: { overflow: "hidden" },
                            }}
                          /> */}
                            <Typography style={{ overflow: "hidden" }}>
                              {episode.title}
                            </Typography>
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
export default SpecialStory;
