import React, { useEffect } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import { useCachedData } from "../../utils";
import { useRootStore } from "../../stores/root";
import { ICharaProfile, ServerRegion } from "../../types.d";

import { charaIcons } from "../../utils/resources";

import { Grid, CardContent, Card, styled } from "@mui/material";

import LinkNoDecorationAlsoNoHover from "../styled/LinkNoDecorationAlsoHover";
const CardSelect = styled(Card)`
  &:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

import { CharaNameTrans } from "../helpers/ContentTrans";
import ImageWrapper from "../helpers/ImageWrapper";

const CharaStory: React.FC<{
  onSetStory: (data?: {
    storyType: string;
    storyId: string;
    region: ServerRegion;
  }) => void;
}> = ({ onSetStory }) => {
  const { path } = useRouteMatch();
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const { region } = useRootStore();

  const leafMatch = useRouteMatch({
    path: `${path}/:charaId`,
    strict: true,
  });
  useEffect(() => {
    if (leafMatch) {
      onSetStory({
        storyType: "charaStory",
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
    </Switch>
  );
};
export default CharaStory;
