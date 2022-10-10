import {
  Breadcrumbs,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  styled,
} from "@mui/material";
import React, { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import {
  IActionSet,
  IArea,
  ICardEpisode,
  ICardInfo,
  ICharacter2D,
  ICharaProfile,
  IEventInfo,
  IEventStory,
  ISpecialStory,
  IUnitProfile,
  IUnitStory,
} from "../../types.d";
import { realityAreaWorldmap, useCachedData } from "../../utils";
import { useAssetI18n, useCharaName } from "../../utils/i18n";
import { charaIcons, UnitLogoMap } from "../../utils/resources";
import {
  CharaNameTrans,
  ContentTrans,
} from "../../components/helpers/ContentTrans";
import ImageWrapper from "../../components/helpers/ImageWrapper";
import StoryReaderContent from "./StoryReaderContent";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import TypographyHeader from "../../components/styled/TypographyHeader";
import LinkNoDecoration from "../../components/styled/LinkNoDecoration";
import LinkNoDecorationAlsoNoHover from "../../components/styled/LinkNoDecorationAlsoHover";

const CardSelect = styled(Card)`
  &:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

const StoryReader: React.FC<{}> = observer(() => {
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const getCharaName = useCharaName();
  const { path } = useRouteMatch();
  const {
    region,
    settings: { isShowSpoiler },
  } = useRootStore();

  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [unitStories] = useCachedData<IUnitStory>("unitStories");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [events] = useCachedData<IEventInfo>("events");
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [areas] = useCachedData<IArea>("areas");
  const [actionSets] = useCachedData<IActionSet>("actionSets");
  const [chara2Ds] = useCachedData<ICharacter2D>("character2ds");
  const [specialStories] = useCachedData<ISpecialStory>("specialStories");

  const breadcrumbNameMap: { [key: string]: string } = useMemo(
    () => ({
      storyreader: t("common:storyReader"),
      eventStory: t("story_reader:selectValue.eventStory"),
      unitStory: t("story_reader:selectValue.unitStory"),
      charaStory: t("story_reader:selectValue.charaStory"),
      cardStory: t("story_reader:selectValue.cardStory"),
      areaTalk: t("story_reader:selectValue.areaTalk"),
      liveTalk: t("story_reader:selectValue.liveTalk"),
      specialStory: t("story_reader:selectValue.special"),
    }),
    [t]
  );

  return (
    <Fragment>
      <TypographyHeader>{t("common:storyReader")}</TypographyHeader>
      <Route>
        {({ location }) => {
          const pathnames = location.pathname.split("/").filter((x) => x);
          // console.log(pathnames);

          return (
            <Breadcrumbs>
              {pathnames.map((pathname, idx) => {
                const last = idx === pathnames.length - 1;
                const to = `/${pathnames.slice(0, idx + 1).join("/")}`;

                let name = breadcrumbNameMap[pathname];
                if (!name && idx >= 2) {
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
      <br />
      <Switch>
        <Route path={`${path}`} exact>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={3}>
              <LinkNoDecorationAlsoNoHover to="/storyreader/eventStory">
                <CardSelect>
                  <CardContent>
                    <Typography>
                      {t("story_reader:selectValue.eventStory")}
                    </Typography>
                  </CardContent>
                </CardSelect>
              </LinkNoDecorationAlsoNoHover>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LinkNoDecorationAlsoNoHover to="/storyreader/unitStory">
                <CardSelect>
                  <CardContent>
                    <Typography>
                      {t("story_reader:selectValue.unitStory")}
                    </Typography>
                  </CardContent>
                </CardSelect>
              </LinkNoDecorationAlsoNoHover>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LinkNoDecorationAlsoNoHover to="/storyreader/charaStory">
                <CardSelect>
                  <CardContent>
                    <Typography>
                      {t("story_reader:selectValue.charaStory")}
                    </Typography>
                  </CardContent>
                </CardSelect>
              </LinkNoDecorationAlsoNoHover>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LinkNoDecorationAlsoNoHover to="/storyreader/cardStory">
                <CardSelect>
                  <CardContent>
                    <Typography>
                      {t("story_reader:selectValue.cardStory")}
                    </Typography>
                  </CardContent>
                </CardSelect>
              </LinkNoDecorationAlsoNoHover>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LinkNoDecorationAlsoNoHover to="/storyreader/areaTalk">
                <CardSelect>
                  <CardContent>
                    <Typography>
                      {t("story_reader:selectValue.areaTalk")}
                    </Typography>
                  </CardContent>
                </CardSelect>
              </LinkNoDecorationAlsoNoHover>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LinkNoDecorationAlsoNoHover to="/storyreader/specialStory">
                <CardSelect>
                  <CardContent>
                    <Typography>
                      {t("story_reader:selectValue.special")}
                    </Typography>
                  </CardContent>
                </CardSelect>
              </LinkNoDecorationAlsoNoHover>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary">
                    {t("story_reader:selectValue.liveTalk")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Route>
        <Route path={`${path}/eventStory`} exact>
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
                    <LinkNoDecorationAlsoNoHover
                      to={`/storyreader/eventStory/${ev.id}`}
                    >
                      <CardSelect>
                        <CardContent>
                          <ImageWrapper
                            src={`home/banner/${ev.assetbundleName}_rip/${ev.assetbundleName}.webp`}
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
        <Route path={`${path}/eventStory/:eventId`} exact>
          {({ match }) => {
            const eventId = match?.params.eventId;
            if (eventId && eventStories) {
              const chapter = eventStories.find(
                (es) => es.eventId === Number(eventId)
              );
              if (chapter) {
                return (
                  <Grid container spacing={1}>
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
        <Route path={`${path}/eventStory/:eventId/:episodeNo`} exact>
          {({ match }) =>
            !!match && (
              <StoryReaderContent storyType="eventStory" storyId={match.url} />
            )
          }
        </Route>
        <Route path={`${path}/unitStory`} exact>
          <Grid container spacing={1}>
            {!!unitProfiles &&
              unitProfiles.map((unit) => (
                <Grid item xs={12} sm={6} md={3} key={unit.unit}>
                  <LinkNoDecorationAlsoNoHover
                    to={`/storyreader/unitStory/${unit.unit}`}
                  >
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
        <Route path={`${path}/unitStory/:unit`} exact>
          {({ match }) => {
            // console.log(match);
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
          }}
        </Route>
        <Route path={`${path}/unitStory/:unit/:chapterNo`} exact>
          {({ match }) => {
            // console.log(match);
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
          }}
        </Route>
        <Route path={`${path}/unitStory/:unit/:chapterNo/:episodeNo`} exact>
          {({ match }) =>
            !!match && (
              <StoryReaderContent storyType="unitStory" storyId={match.url} />
            )
          }
        </Route>
        <Route path={`${path}/charaStory`} exact>
          <Grid container spacing={1}>
            {!!characterProfiles &&
              characterProfiles.map((character) => (
                <Grid item xs={12} sm={6} md={3} key={character.characterId}>
                  <LinkNoDecorationAlsoNoHover
                    to={`/storyreader/charaStory/${character.characterId}`}
                  >
                    <CardSelect>
                      <CardContent>
                        <Grid container justifyContent="center">
                          <Grid item xs={4}>
                            <ImageWrapper
                              src={
                                charaIcons[
                                  `CharaIcon${character.characterId}` as "CharaIcon1"
                                ]
                              }
                              bgColor=""
                              directSrc
                              duration={0}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardContent>
                        <CharaNameTrans
                          characterId={character.characterId}
                          originalProps={{
                            style: { overflow: "hidden" },
                            align: "center",
                          }}
                          translatedProps={{
                            style: { overflow: "hidden" },
                            align: "center",
                          }}
                        />
                      </CardContent>
                    </CardSelect>
                  </LinkNoDecorationAlsoNoHover>
                </Grid>
              ))}
          </Grid>
        </Route>
        <Route path={`${path}/charaStory/:charaId`} exact>
          {({ match }) =>
            !!match && (
              <StoryReaderContent storyType="charaStory" storyId={match.url} />
            )
          }
        </Route>
        <Route path={`${path}/cardStory`} exact>
          <Grid container spacing={1}>
            {!!characterProfiles &&
              characterProfiles.map((character) => (
                <Grid item xs={12} sm={6} md={3} key={character.characterId}>
                  <LinkNoDecorationAlsoNoHover
                    to={`/storyreader/cardStory/${character.characterId}`}
                  >
                    <CardSelect>
                      <CardContent>
                        <Grid container justifyContent="center">
                          <Grid item xs={4}>
                            <ImageWrapper
                              src={
                                charaIcons[
                                  `CharaIcon${character.characterId}` as "CharaIcon1"
                                ]
                              }
                              bgColor=""
                              directSrc
                              duration={0}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardContent>
                        <CharaNameTrans
                          characterId={character.characterId}
                          originalProps={{
                            style: { overflow: "hidden" },
                            align: "center",
                          }}
                          translatedProps={{
                            style: { overflow: "hidden" },
                            align: "center",
                          }}
                        />
                      </CardContent>
                    </CardSelect>
                  </LinkNoDecorationAlsoNoHover>
                </Grid>
              ))}
          </Grid>
        </Route>
        <Route path={`${path}/cardStory/:charaId`} exact>
          {({ match }) => {
            // console.log(match);
            const charaId = match?.params.charaId;
            if (charaId && cards) {
              const filteredCards = cards.filter(
                (card) =>
                  card.characterId === Number(charaId) &&
                  (isShowSpoiler || card.releaseAt <= new Date().getTime())
              );
              if (filteredCards.length) {
                return (
                  <Grid container spacing={1}>
                    {filteredCards.map((card) => (
                      <Grid item xs={12} sm={6} md={3} key={card.id}>
                        <LinkNoDecorationAlsoNoHover
                          to={`${match?.url}/${card.id}`}
                        >
                          <CardSelect>
                            <CardContent>
                              <ImageWrapper
                                src={`character/member_small/${card.assetbundleName}_rip/card_normal.webp`}
                                bgColor=""
                                duration={0}
                              />
                            </CardContent>
                            <CardContent>
                              <ContentTrans
                                contentKey={`card_prefix:${card.id}`}
                                original={card.prefix}
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
        <Route path={`${path}/cardStory/:charaId/:cardId`} exact>
          {({ match }) => {
            // console.log(match);
            const cardId = match?.params.cardId;
            if (cardId && cardEpisodes) {
              const episodes = cardEpisodes.filter(
                (ce) => ce.cardId === Number(cardId)
              );
              if (episodes.length) {
                return (
                  <Grid container spacing={1}>
                    {episodes.map((episode) => (
                      <Grid item xs={12} sm={6} md={3} key={episode.id}>
                        <LinkNoDecorationAlsoNoHover
                          to={`${match?.url}/${episode.id}`}
                        >
                          <CardSelect>
                            <CardContent>
                              <ContentTrans
                                contentKey={`card_episode_title:${episode.title}`}
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
        <Route path={`${path}/cardStory/:charaId/:cardId/:episodeId`} exact>
          {({ match }) =>
            !!match && (
              <StoryReaderContent storyType="cardStory" storyId={match.url} />
            )
          }
        </Route>
        <Route path={`${path}/areaTalk`} exact>
          <Grid container spacing={1}>
            {!!areas &&
              areas
                .filter((area) => area.label)
                .map((area) => (
                  <Grid item xs={12} sm={6} md={3} key={area.id}>
                    <LinkNoDecorationAlsoNoHover
                      to={`/storyreader/areaTalk/${area.id}`}
                    >
                      <CardSelect>
                        <CardContent>
                          <ImageWrapper
                            src={`worldmap/contents/collaboration/${
                              area.assetbundleName
                            }_rip/img_worldmap_areas${String(area.id).padStart(
                              2,
                              "0"
                            )}.webp`}
                            bgColor=""
                            duration={0}
                          />
                        </CardContent>
                        <CardContent>
                          <ContentTrans
                            contentKey={`area_name:${area.id}`}
                            original={area.name}
                            originalProps={{ style: { overflow: "hidden" } }}
                            translatedProps={{ style: { overflow: "hidden" } }}
                          />
                        </CardContent>
                      </CardSelect>
                    </LinkNoDecorationAlsoNoHover>
                  </Grid>
                ))}
            {!!areas &&
              areas
                .filter(
                  (area) => area.areaType === "spirit_world" && !area.label
                )
                .map((area) => (
                  <Grid item xs={12} sm={6} md={3} key={area.id}>
                    <LinkNoDecorationAlsoNoHover
                      to={`/storyreader/areaTalk/${area.id}`}
                    >
                      <CardSelect>
                        <CardContent>
                          <ImageWrapper
                            src={`worldmap/contents/normal_rip/img_worldmap_areas${String(
                              area.id
                            ).padStart(2, "0")}.webp`}
                            bgColor=""
                            duration={0}
                          />
                        </CardContent>
                        <CardContent>
                          <ContentTrans
                            contentKey={`area_name:${area.id}`}
                            original={area.name}
                            originalProps={{ style: { overflow: "hidden" } }}
                            translatedProps={{ style: { overflow: "hidden" } }}
                          />
                        </CardContent>
                      </CardSelect>
                    </LinkNoDecorationAlsoNoHover>
                  </Grid>
                ))}
            {!!areas &&
              areas
                .filter((area) => area.areaType === "reality_world")
                .map((area, idx) => (
                  <Grid item xs={12} sm={6} md={3} key={area.id}>
                    <LinkNoDecorationAlsoNoHover
                      to={`/storyreader/areaTalk/${area.id}`}
                    >
                      <CardSelect>
                        <CardContent>
                          <ImageWrapper
                            src={`worldmap/contents/normal_rip/worldmap_area${String(
                              realityAreaWorldmap[String(idx + 1)]
                            ).padStart(2, "0")}.webp`}
                            bgColor=""
                            duration={0}
                          />
                        </CardContent>
                        <CardContent>
                          <ContentTrans
                            contentKey={`area_name:${area.id}`}
                            original={area.name}
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
        <Route path={`${path}/areaTalk/:areaId`} exact>
          {({ match }) => {
            const areaId = match?.params.areaId;
            if (areaId && areas) {
              const area = areas.find((area) => area.id === Number(areaId));
              if (area && actionSets && chara2Ds) {
                return (
                  <Grid container spacing={1}>
                    {actionSets
                      .filter((as) => as.areaId === Number(areaId))
                      .map((actionSet) => (
                        <Grid
                          item
                          xs={6}
                          sm={4}
                          md={3}
                          lg={2}
                          key={actionSet.id}
                        >
                          <LinkNoDecorationAlsoNoHover
                            to={`${match?.url}/${actionSet.id}`}
                          >
                            <CardSelect>
                              <CardContent>
                                <Grid container spacing={1}>
                                  {actionSet.characterIds.map((charaId) => {
                                    const characterId = chara2Ds.find(
                                      (c2d) => c2d.id === charaId
                                    )!.characterId;
                                    return (
                                      <Grid item key={charaId}>
                                        <Avatar
                                          src={
                                            charaIcons[
                                              `CharaIcon${characterId}` as "CharaIcon1"
                                            ]
                                          }
                                        />
                                      </Grid>
                                    );
                                  })}
                                </Grid>
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
        <Route path={`${path}/areaTalk/:areaId/:actionSetId`} exact>
          {({ match }) =>
            !!match && (
              <StoryReaderContent storyType="areaTalk" storyId={match.url} />
            )
          }
        </Route>
        <Route path={`${path}/specialStory`} exact>
          <Grid container spacing={1}>
            {!!specialStories &&
              specialStories
                .slice()
                .reverse()
                .map((sp) => (
                  <Grid item xs={12} sm={6} md={3} key={sp.id}>
                    <LinkNoDecorationAlsoNoHover
                      to={`/storyreader/specialStory/${sp.id}`}
                    >
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
        <Route path={`${path}/specialStory/:storyId`} exact>
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
        <Route path={`${path}/specialStory/:storyId/:episodeNo`} exact>
          {({ match }) =>
            !!match && (
              <StoryReaderContent
                storyType="specialStory"
                storyId={match.url}
              />
            )
          }
        </Route>
      </Switch>
    </Fragment>
  );
});

export default StoryReader;
