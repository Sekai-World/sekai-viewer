import React, { useEffect } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import { useCachedData } from "../../utils";
import { useRootStore } from "../../stores/root";
import type {
  ICharaProfile,
  ICardInfo,
  ICardEpisode,
  ServerRegion,
} from "../../types.d";

import { charaIcons } from "../../utils/resources";

import { Grid, CardContent, Card, styled } from "@mui/material";

import LinkNoDecorationAlsoNoHover from "../styled/LinkNoDecorationAlsoHover";
const CardSelect = styled(Card)`
  &:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

import { ContentTrans, CharaNameTrans } from "../helpers/ContentTrans";
import ImageWrapper from "../helpers/ImageWrapper";

const CardStory: React.FC<{
  onSetStory: (data?: {
    storyType: string;
    storyId: string;
    region: ServerRegion;
  }) => void;
}> = ({ onSetStory }) => {
  const { path } = useRouteMatch();
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const {
    region,
    settings: { isShowSpoiler },
  } = useRootStore();

  const leafMatch = useRouteMatch({
    path: `${path}/:charaId/:cardId/:episodeId`,
    strict: true,
  });
  useEffect(() => {
    if (leafMatch) {
      onSetStory({
        storyType: "cardStory",
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
          {!!characterProfiles &&
            characterProfiles.map((character) => (
              <Grid item xs={12} sm={6} md={3} key={character.characterId}>
                <LinkNoDecorationAlsoNoHover
                  to={`${path}/${character.characterId}`}
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
      <Route path={`${path}/:charaId`} exact>
        {({ match }) => {
          const charaId = match?.params.charaId;
          if (charaId && cards) {
            const filteredCards = cards.filter(
              (card) =>
                card.characterId === Number(charaId) &&
                (isShowSpoiler ||
                  (card.releaseAt ?? card.archivePublishedAt!) <=
                    new Date().getTime())
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
          return null;
        }}
      </Route>
      <Route path={`${path}/:charaId/:cardId`} exact>
        {({ match }) => {
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
          return null;
        }}
      </Route>
    </Switch>
  );
};
export default CardStory;
