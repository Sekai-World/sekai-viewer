import React, { useEffect } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import { useCachedData } from "../../utils";
import { useRootStore } from "../../stores/root";

import { UnitLogoMap } from "../../utils/resources";

import type { IUnitStory, IUnitProfile, ServerRegion } from "../../types.d";

import { Grid, CardContent, Card, styled } from "@mui/material";

import LinkNoDecorationAlsoNoHover from "../styled/LinkNoDecorationAlsoHover";
const CardSelect = styled(Card)`
  &:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

import { ContentTrans } from "../helpers/ContentTrans";
import ImageWrapper from "../helpers/ImageWrapper";

const UnitStory: React.FC<{
  onSetStory: (data?: {
    storyType: string;
    storyId: string;
    region: ServerRegion;
  }) => void;
}> = ({ onSetStory }) => {
  const { path } = useRouteMatch();
  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [unitStories] = useCachedData<IUnitStory>("unitStories");
  const { region } = useRootStore();

  const leafMatch = useRouteMatch({
    path: `${path}/:unit/:chapterNo/:episodeNo`,
    strict: true,
  });
  useEffect(() => {
    if (leafMatch) {
      onSetStory({
        storyType: "unitStory",
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
          {!!unitProfiles &&
            unitProfiles.map((unit) => (
              <Grid item xs={12} sm={6} md={3} key={unit.unit}>
                <LinkNoDecorationAlsoNoHover to={`${path}/${unit.unit}`}>
                  <CardSelect>
                    <CardContent>
                      <ImageWrapper
                        src={UnitLogoMap[region][unit.unit]}
                        bgColor=""
                        directSrc
                        duration={0}
                      />
                    </CardContent>
                    <CardContent>
                      <ContentTrans
                        contentKey={`unit_profile:${unit.unit}.name`}
                        original={unit.unitName}
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
      <Route path={`${path}/:unit`} exact>
        {({ match }) => {
          const unit = match?.params.unit;
          if (unit && unitStories) {
            const stories = unitStories.find((us) => us.unit === unit);
            if (stories) {
              return (
                <Grid container spacing={1}>
                  {stories.chapters.map((chapter) => (
                    <Grid item xs={12} sm={6} md={3} key={chapter.id}>
                      <LinkNoDecorationAlsoNoHover
                        to={`${match?.url}/${chapter.chapterNo}`}
                      >
                        <CardSelect>
                          <CardContent>
                            <ContentTrans
                              contentKey={`unit_story_chapter_title:${chapter.unit}-${chapter.chapterNo}`}
                              original={chapter.title}
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
          return null;
        }}
      </Route>
      <Route path={`${path}/:unit/:chapterNo`} exact>
        {({ match }) => {
          const unit = match?.params.unit;
          const chapterNo = match?.params.chapterNo;
          if (unit && chapterNo && unitStories) {
            const stories = unitStories.find((us) => us.unit === unit);
            if (stories) {
              const chapter = stories.chapters.find(
                (s) => s.chapterNo === Number(chapterNo)
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
                              <ImageWrapper
                                src={`story/episode_image/${chapter.assetbundleName}_rip/${episode.assetbundleName}.webp`}
                                bgColor=""
                                duration={0}
                              />
                            </CardContent>
                            <CardContent>
                              <ContentTrans
                                contentKey={`unit_story_episode_title:${episode.unit}-${episode.chapterNo}-${episode.episodeNo}`}
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
          }
          return null;
        }}
      </Route>
    </Switch>
  );
};
export default UnitStory;
