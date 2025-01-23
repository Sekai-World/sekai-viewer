import React, { useEffect, useCallback, useState } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

import { realityAreaWorldmap, useCachedData } from "../../utils";
import { useCharaName } from "../../utils/i18n";
import { useRootStore } from "../../stores/root";
import {
  IArea,
  IActionSet,
  ICharacter2D,
  IGameChara,
  ServerRegion,
} from "../../types.d";
import { charaIcons } from "../../utils/resources";

import {
  Grid,
  CardContent,
  Card,
  Avatar,
  styled,
  Stack,
  Tooltip,
  IconButton,
  Typography,
  Button,
} from "@mui/material";

import PaperContainer from "../../components/styled/PaperContainer";
import LinkNoDecorationAlsoNoHover from "../styled/LinkNoDecorationAlsoHover";
const CardSelect = styled(Card)`
  height: 100%;
  &:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

import { ContentTrans } from "../helpers/ContentTrans";
import ImageWrapper from "../helpers/ImageWrapper";

const AreaCard: React.FC<{
  img: string;
  to: string;
  contentKey: string;
  original: string;
}> = ({ img, to, contentKey, original }) => {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <LinkNoDecorationAlsoNoHover to={to}>
        <CardSelect>
          <Stack
            direction="column"
            justifyContent="space-between"
            height="100%"
          >
            <CardContent>
              <ImageWrapper src={img} bgColor="" duration={0} />
            </CardContent>
            <CardContent>
              <ContentTrans
                contentKey={contentKey}
                original={original}
                originalProps={{ style: { overflow: "hidden" } }}
                translatedProps={{ style: { overflow: "hidden" } }}
              />
            </CardContent>
          </Stack>
        </CardSelect>
      </LinkNoDecorationAlsoNoHover>
    </Grid>
  );
};

const CharacterFilter: React.FC<{
  onFilter: (not_select: number[]) => void;
}> = ({ onFilter }) => {
  const { t } = useTranslation();
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const getCharaName = useCharaName();

  const [characterNotSelected, setCharacterNotSelected] = useState<number[]>(
    []
  );

  const handleCharaIconClick = useCallback(
    (chara: IGameChara) => {
      if (characterNotSelected.includes(chara.id)) {
        setCharacterNotSelected((prevList) =>
          prevList.filter((id) => id !== chara.id)
        );
      } else {
        setCharacterNotSelected((prevList) => [...prevList, chara.id]);
      }
    },
    [characterNotSelected]
  );

  const handleSelectAll = () => {
    setCharacterNotSelected([]);
  };
  const handleSelectClear = useCallback(() => {
    if (charas) setCharacterNotSelected(charas?.map((c) => c.id));
  }, [charas]);

  useEffect(() => {
    onFilter(characterNotSelected);
  }, [characterNotSelected]);

  return (
    <PaperContainer>
      <Stack spacing={1}>
        <Typography variant="subtitle2">
          {t("filter:character.caption")}
        </Typography>
        <Grid container spacing={1}>
          {(charas || []).map((chara) => (
            <Grid key={"chara-filter-" + chara.id} item>
              <Tooltip title={getCharaName(chara.id)} placement="top">
                <IconButton
                  size="small"
                  onClick={() => handleCharaIconClick(chara)}
                  className={clsx({
                    "icon-not-selected": characterNotSelected.includes(
                      chara.id
                    ),
                    "icon-selected": !characterNotSelected.includes(chara.id),
                  })}
                >
                  <Avatar
                    alt={getCharaName(chara.id)}
                    src={charaIcons[`CharaIcon${chara.id}` as "CharaIcon1"]}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row">
          <Button variant="text" onClick={handleSelectAll}>
            {t("filter:select_all")}
          </Button>
          <Button variant="text" onClick={handleSelectClear}>
            {t("filter:select_clear")}
          </Button>
        </Stack>
      </Stack>
    </PaperContainer>
  );
};

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
  const [characterNotSelected, setCharacterNotSelected] = useState<number[]>(
    []
  );

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
        <Grid container direction="row" spacing={1} alignItems="stretch">
          {!!areas &&
            areas
              .filter((area) => area.label)
              .map((area) => (
                <AreaCard
                  key={area.id}
                  img={`worldmap/contents/collaboration/${
                    area.assetbundleName
                  }_rip/img_worldmap_areas${String(area.id).padStart(
                    2,
                    "0"
                  )}.webp`}
                  to={`${path}/${area.id}`}
                  contentKey={`area_name:${area.id}`}
                  original={
                    area.subName ? `${area.name}/${area.subName}` : area.name
                  }
                />
              ))}
          {!!areas &&
            areas
              .filter((area) => area.areaType === "spirit_world" && !area.label)
              .map((area) => (
                <AreaCard
                  key={area.id}
                  img={`worldmap/contents/normal_rip/img_worldmap_areas${String(
                    area.id
                  ).padStart(2, "0")}.webp`}
                  to={`${path}/${area.id}`}
                  contentKey={`area_name:${area.id}`}
                  original={
                    area.subName ? `${area.name}/${area.subName}` : area.name
                  }
                />
              ))}
          {!!areas &&
            areas
              .filter((area) => area.areaType === "reality_world")
              .map((area, idx) => (
                <AreaCard
                  key={area.id}
                  img={`worldmap/contents/normal_rip/worldmap_area${String(
                    realityAreaWorldmap[String(idx + 1)]
                  ).padStart(2, "0")}.webp`}
                  to={`${path}/${area.id}`}
                  contentKey={`area_name:${area.id}`}
                  original={
                    area.subName ? `${area.name}/${area.subName}` : area.name
                  }
                />
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
                <Stack>
                  <CharacterFilter onFilter={setCharacterNotSelected} />
                  <Grid container spacing={1}>
                    {actionSets
                      .filter(
                        (as) =>
                          as.areaId === Number(areaId) &&
                          !as.characterIds.reduce((prev, cid) => {
                            const characterId = chara2Ds.find(
                              (c2d) => c2d.id === cid
                            )!.characterId;
                            return (
                              prev && characterNotSelected.includes(characterId)
                            );
                          }, true)
                      )
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
                </Stack>
              );
            }
          }
          return null;
        }}
      </Route>
    </Switch>
  );
};
export default AreaTalk;
