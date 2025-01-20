import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import type {
  ServerRegion,
  IUnitProfile,
  IUnitStory,
  IEventStory,
  IEventInfo,
  ICharaProfile,
  ICardEpisode,
  ICardInfo,
  IArea,
  ISpecialStory,
} from "../../types.d";

import { useCachedData } from "../../utils";
import { useAssetI18n, useCharaName } from "../../utils/i18n";
import {
  Breadcrumbs,
  Grid,
  Typography,
  Card,
  CardContent,
  styled,
} from "@mui/material";
import LinkNoDecoration from "../../components/styled/LinkNoDecoration";
import LinkNoDecorationAlsoNoHover from "../../components/styled/LinkNoDecorationAlsoHover";
const CardSelect = styled(Card)`
  &:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

import EventStory from "./EventStory";
import UnitStory from "./UnitStory";
import CharaStory from "./CharaStory";
import CardStory from "./CardStory";
import AreaTalk from "./AreaTalk";
import SpecialStory from "./SpecialStory";

const StorySelector: React.FC<{
  onSetStory: (data?: {
    storyType: string;
    storyId: string;
    region: ServerRegion;
  }) => void;
}> = ({ onSetStory }) => {
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const getCharaName = useCharaName();
  const { path } = useRouteMatch();

  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [unitStories] = useCachedData<IUnitStory>("unitStories");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [events] = useCachedData<IEventInfo>("events");
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [areas] = useCachedData<IArea>("areas");
  const [specialStories] = useCachedData<ISpecialStory>("specialStories");

  const handleSetStory = onSetStory;

  const catagory: {
    [key: string]: {
      breadcrumbName: string;
      path: string;
      disabled: boolean;
    };
  } = useMemo(
    () => ({
      eventStory: {
        breadcrumbName: t("story_reader:selectValue.eventStory"),
        path: "/eventStory",
        disabled: false,
      },
      unitStory: {
        breadcrumbName: t("story_reader:selectValue.unitStory"),
        path: "/unitStory",
        disabled: false,
      },
      charaStory: {
        breadcrumbName: t("story_reader:selectValue.charaStory"),
        path: "/charaStory",
        disabled: false,
      },
      cardStory: {
        breadcrumbName: t("story_reader:selectValue.cardStory"),
        path: "/cardStory",
        disabled: false,
      },
      areaTalk: {
        breadcrumbName: t("story_reader:selectValue.areaTalk"),
        path: "/areaTalk",
        disabled: false,
      },
      specialStory: {
        breadcrumbName: t("story_reader:selectValue.specialStory"),
        path: "/specialStory",
        disabled: false,
      },
      liveTalk: {
        breadcrumbName: t("story_reader:selectValue.liveTalk"),
        path: "/liveTalk",
        disabled: true,
      },
    }),
    [t]
  );

  return (
    <>
      <Route>
        {({ location }) => {
          const pathnames = location.pathname.split("/").filter((x) => x);
          console.log(pathnames);
          return (
            <Breadcrumbs>
              {pathnames.map((pathname, idx) => {
                const last = idx === pathnames.length - 1;
                const to = `/${pathnames.slice(0, idx + 1).join("/")}`;

                let name = "";
                if (idx === 0) {
                  name = t("common:storyReader");
                } else if (
                  idx === 1 &&
                  Object.keys(catagory).includes(pathname)
                ) {
                  name = catagory[pathname].breadcrumbName;
                } else if (idx >= 2) {
                  switch (pathnames[1]) {
                    case "eventStory":
                      if (events && idx === 2) {
                        const found = events.find(
                          (ev) => ev.id === Number(pathname)
                        );
                        if (found) {
                          name = getTranslated(
                            `event_name:${pathname}`,
                            found.name
                          );
                        }
                      }
                      if (eventStories && idx === 3) {
                        const found = eventStories.find(
                          (es) => es.eventId === Number(pathnames[2])
                        );
                        if (found) {
                          const episode = found.eventStoryEpisodes.find(
                            (ese) => ese.episodeNo === Number(pathname)
                          );
                          if (episode) {
                            name = getTranslated(
                              `event_story_episode_title:${episode.eventStoryId}-${episode.episodeNo}`,
                              episode.title
                            );
                          }
                        }
                      }
                      break;
                    case "unitStory":
                      if (unitProfiles && idx === 2) {
                        const found = unitProfiles.find(
                          (unit) => unit.unit === pathname
                        );
                        if (found) {
                          name = getTranslated(
                            `unit_profile:${found.unit}.name`,
                            found.unitName
                          );
                        }
                      }
                      if (unitStories) {
                        const found = unitStories.find(
                          (us) => us.unit === pathnames[2]
                        );
                        if (found && idx === 3) {
                          const chapter = found.chapters.find(
                            (cp) => cp.chapterNo === Number(pathname)
                          );
                          if (chapter) {
                            name = getTranslated(
                              `unit_story_chapter_title:${chapter.unit}-${chapter.chapterNo}`,
                              chapter.title
                            );
                          }
                        }
                        if (found && idx === 4) {
                          const chapter = found.chapters.find(
                            (cp) => cp.chapterNo === Number(pathnames[3])
                          );
                          if (chapter) {
                            const episode = chapter.episodes.find(
                              (ep) => ep.episodeNo === Number(pathname)
                            );
                            if (episode) {
                              name = getTranslated(
                                `unit_story_episode_title:${episode.unit}-${episode.chapterNo}-${episode.episodeNo}`,
                                episode.title
                              );
                            }
                          }
                        }
                      }
                      break;
                    case "charaStory":
                      if (characterProfiles && idx === 2) {
                        const found = characterProfiles.find(
                          (cp) => cp.characterId === Number(pathname)
                        );
                        if (found) {
                          name = getCharaName(found.characterId) || "";
                        }
                      }
                      break;
                    case "cardStory":
                      if (characterProfiles && idx === 2) {
                        const found = characterProfiles.find(
                          (cp) => cp.characterId === Number(pathname)
                        );
                        if (found) {
                          name = getCharaName(found.characterId) || "";
                        }
                      }
                      if (cards && idx === 3) {
                        const card = cards.find(
                          (card) => card.id === Number(pathname)
                        );
                        if (card) {
                          name = getTranslated(
                            `card_prefix:${card.id}`,
                            card.prefix
                          );
                        }
                      }
                      if (cardEpisodes && idx === 4) {
                        const episode = cardEpisodes.find(
                          (cep) => cep.id === Number(pathname)
                        );
                        if (episode) {
                          name = getTranslated(
                            `card_episode_title:${episode.title}`,
                            episode.title
                          );
                        }
                      }
                      break;
                    case "areaTalk":
                      if (areas && idx === 2) {
                        const area = areas.find(
                          (area) => area.id === Number(pathname)
                        );
                        if (area) {
                          name = getTranslated(
                            `area_name:${area.id}`,
                            area.name
                          );
                        }
                      }
                      if (idx === 3) {
                        name = pathname;
                      }
                      break;
                    case "specialStory":
                      if (specialStories) {
                        if (idx === 2) {
                          const chapter = specialStories.find(
                            (sp) => sp.id === Number(pathname)
                          );
                          if (chapter) {
                            name = chapter.title;
                          }
                        } else if (idx === 3) {
                          const chapter = specialStories.find(
                            (sp) => sp.id === Number(pathnames[2])
                          );
                          if (chapter) {
                            const episode = chapter.episodes.find(
                              (ep) => ep.episodeNo === Number(pathname)
                            );
                            if (episode) {
                              name = episode.title;
                            }
                          }
                        }
                      }
                  }
                }

                return last ? (
                  <Typography color="textPrimary" key={to}>
                    {name}
                  </Typography>
                ) : (
                  <LinkNoDecoration key={to} to={to}>
                    {name}
                  </LinkNoDecoration>
                );
              })}
            </Breadcrumbs>
          );
        }}
      </Route>
      <Switch>
        <Route path={`${path}`} exact>
          <Grid container spacing={1}>
            {Object.entries(catagory).map(([key, c]) => {
              if (c.disabled) {
                return (
                  <Grid item xs={12} sm={6} md={3} key={key}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary">
                          {c.breadcrumbName}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              } else {
                return (
                  <Grid item xs={12} sm={6} md={3} key={key}>
                    <LinkNoDecorationAlsoNoHover to={`${path}${c.path}`}>
                      <CardSelect>
                        <CardContent>
                          <Typography>{c.breadcrumbName}</Typography>
                        </CardContent>
                      </CardSelect>
                    </LinkNoDecorationAlsoNoHover>
                  </Grid>
                );
              }
            })}
          </Grid>
        </Route>
        <Route path={`${path}/eventStory`}>
          <EventStory onSetStory={handleSetStory} />
        </Route>
        <Route path={`${path}/unitStory`}>
          <UnitStory onSetStory={handleSetStory} />
        </Route>
        <Route path={`${path}/charaStory`}>
          <CharaStory onSetStory={handleSetStory} />
        </Route>
        <Route path={`${path}/cardStory`}>
          <CardStory onSetStory={handleSetStory} />
        </Route>
        <Route path={`${path}/areaTalk`}>
          <AreaTalk onSetStory={handleSetStory} />
        </Route>
        <Route path={`${path}/specialStory`}>
          <SpecialStory onSetStory={handleSetStory} />
        </Route>
      </Switch>
    </>
  );
};
export default StorySelector;
