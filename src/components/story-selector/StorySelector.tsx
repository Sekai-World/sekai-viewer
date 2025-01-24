import React, { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import type { ServerRegion } from "../../types.d";

import { Grid, Typography, Card, CardContent, styled } from "@mui/material";
import LinkNoDecorationAlsoNoHover from "../../components/styled/LinkNoDecorationAlsoHover";
const CardSelect = styled(Card)`
  &:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

import Path from "./Path";
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
  const { path } = useRouteMatch();

  const handleSetStory = onSetStory;

  const rootMatch = useRouteMatch({
    path: `${path}`,
    strict: true,
    exact: true,
  });
  useEffect(() => {
    if (rootMatch) {
      onSetStory();
    }
  }, [rootMatch, onSetStory]);

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
      <Path catagory={catagory} />
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
