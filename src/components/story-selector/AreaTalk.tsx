import React, { useEffect } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import { realityAreaWorldmap, useCachedData } from "../../utils";
import { useRootStore } from "../../stores/root";
import { IArea, IActionSet, ICharacter2D, ServerRegion } from "../../types.d";

import { charaIcons } from "../../utils/resources";

import { Grid, CardContent, Card, Avatar, styled } from "@mui/material";

import LinkNoDecorationAlsoNoHover from "../styled/LinkNoDecorationAlsoHover";
const CardSelect = styled(Card)`
  &:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

import { ContentTrans } from "../helpers/ContentTrans";
import ImageWrapper from "../helpers/ImageWrapper";

const AreaTalk: React.FC<{
  onSetStory: (data?: {
    storyType: string;
    storyId: string;
    region: ServerRegion;
  }) => void;
}> = ({ onSetStory }) => {
  const { path } = useRouteMatch();
  const [areas] = useCachedData<IArea>("areas");
  const [actionSets] = useCachedData<IActionSet>("actionSets");
  const [chara2Ds] = useCachedData<ICharacter2D>("character2ds");
  const { region } = useRootStore();

  const leafMatch = useRouteMatch({
    path: `${path}/:areaId/:actionSetId`,
    strict: true,
  });
  useEffect(() => {
    if (leafMatch) {
      onSetStory({
        storyType: "areaTalk",
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
          {!!areas &&
            areas
              .filter((area) => area.label)
              .map((area) => (
                <Grid item xs={12} sm={6} md={3} key={area.id}>
                  <LinkNoDecorationAlsoNoHover to={`${path}/${area.id}`}>
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
              .filter((area) => area.areaType === "spirit_world" && !area.label)
              .map((area) => (
                <Grid item xs={12} sm={6} md={3} key={area.id}>
                  <LinkNoDecorationAlsoNoHover to={`${path}/${area.id}`}>
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
                  <LinkNoDecorationAlsoNoHover to={`${path}/${area.id}`}>
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
      <Route path={`${path}/:areaId`} exact>
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
                      <Grid item xs={6} sm={4} md={3} lg={2} key={actionSet.id}>
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
    </Switch>
  );
};
export default AreaTalk;
