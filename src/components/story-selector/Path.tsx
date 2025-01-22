import React from "react";
import { useTranslation } from "react-i18next";
import { Route } from "react-router-dom";
import { useCachedData } from "../../utils";
import { useAssetI18n, useCharaName } from "../../utils/i18n";

import type {
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

import { Breadcrumbs, Typography } from "@mui/material";

import LinkNoDecoration from "../../components/styled/LinkNoDecoration";

const Path: React.FC<{
  catagory: {
    [key: string]: {
      breadcrumbName: string;
      path: string;
      disabled: boolean;
    };
  };
}> = ({ catagory }) => {
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const getCharaName = useCharaName();
  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [unitStories] = useCachedData<IUnitStory>("unitStories");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [events] = useCachedData<IEventInfo>("events");
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [areas] = useCachedData<IArea>("areas");
  const [specialStories] = useCachedData<ISpecialStory>("specialStories");

  return (
    <Route>
      {({ location }) => {
        const pathnames = location.pathname.split("/").filter((x) => x);
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
                        name = getTranslated(`area_name:${area.id}`, area.name);
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
  );
};
export default Path;
