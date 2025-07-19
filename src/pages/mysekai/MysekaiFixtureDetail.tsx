import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { useParams, Link } from "react-router-dom";
import {
  Typography,
  Grid,
  Chip,
  Box,
  CircularProgress,
  Container,
  Tooltip,
  Paper,
  Divider,
  Tabs,
  Tab,
  Card,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";
import { TabContext } from "@mui/lab";

import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import PaperContainer from "../../components/styled/PaperContainer";
import TabPanelPadding from "../../components/styled/TabPanelPadding";
import { useCachedData } from "../../utils";
import { useCharaName } from "../../utils/i18n";
import { chibiIcons } from "../../utils/resources";
import Image from "mui-image";
import {
  IMysekaiFixtureInfo,
  IMysekaiFixtureGenre,
  IMysekaiFixtureTag,
  IMysekaiBlueprint,
  IMysekaiBlueprintMaterialCost,
  IMysekaiTalkCondition,
  IMysekaiTalkConditionGroup,
  IMysekaiTalk,
  IMysekaiGameCharacterUnitGroups,
  IMysekaiMaterial,
  MysekaiDataContext,
} from "../../types";
import {
  getFixtureSketchStatus,
  getFixtureConvertStatus,
  getGenreName,
  getTagNames,
  getSubGenreName,
  getFixtureMaterialCost,
  getFixtureTalkData,
  charaMap,
  getThumbnailURL,
} from "../../utils/mysekaiFixtureUtils";
import { assetUrl } from "../../utils/urls";

const mysekaiFixtureDetail: React.FC<unknown> = observer(() => {
  const { t } = useTranslation();

  useLayoutEffect(() => {
    document.title = t("title:mysekaiFixtureDetail");
  }, [t]);

  const { id } = useParams<{ id: string }>();
  const getCharaName = useCharaName();

  const [fixtures] = useCachedData<IMysekaiFixtureInfo>("mysekaiFixtures");
  const [genres] = useCachedData<IMysekaiFixtureGenre>(
    "mysekaiFixtureMainGenres"
  );
  const [subGenres] = useCachedData<IMysekaiFixtureGenre>(
    "mysekaiFixtureSubGenres"
  );
  const [tags] = useCachedData<IMysekaiFixtureTag>("mysekaiFixtureTags");

  // Additional data needed for computed fields
  const [blueprints] = useCachedData<IMysekaiBlueprint>("mysekaiBlueprints");
  const [materialCosts] = useCachedData<IMysekaiBlueprintMaterialCost>(
    "mysekaiBlueprintMysekaiMaterialCosts"
  );
  const [talkConditions] = useCachedData<IMysekaiTalkCondition>(
    "mysekaiCharacterTalkConditions"
  );
  const [talkConditionGroups] = useCachedData<IMysekaiTalkConditionGroup>(
    "mysekaiCharacterTalkConditionGroups"
  );
  const [talks] = useCachedData<IMysekaiTalk>("mysekaiCharacterTalks");
  const [characterGroups] = useCachedData<IMysekaiGameCharacterUnitGroups>(
    "mysekaiGameCharacterUnitGroups"
  );
  const [mySekaiMaterials] =
    useCachedData<IMysekaiMaterial>("mysekaiMaterials");

  const [fixture, setFixture] = useState<IMysekaiFixtureInfo | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [tabValue, setTabValue] = useState<string>("0");

  // Create data context object
  const dataContext: MysekaiDataContext = useMemo(
    () => ({
      blueprints,
      materialCosts,
      talkConditions,
      talkConditionGroups,
      talks,
      characterGroups,
    }),
    [
      blueprints,
      materialCosts,
      talkConditions,
      talkConditionGroups,
      talks,
      characterGroups,
    ]
  );

  const getThumbnailUrl = useCallback(async (fixture: IMysekaiFixtureInfo) => {
    const { assetbundleName } = fixture;
    if (assetbundleName) {
      getThumbnailURL(fixture, setThumbnailUrl);
    }
  }, []);

  useEffect(() => {
    document.title = t("title:mysekaiFixtureDetail");
  }, [t]);

  useEffect(() => {
    if (fixtures && id) {
      const fixtureData = fixtures.find((f) => f.id === parseInt(id));
      if (fixtureData) {
        setFixture(fixtureData);
        getThumbnailUrl(fixtureData);
      }
      setIsLoading(false);
    }
  }, [fixtures, id, getThumbnailUrl]);

  const gridSize = fixture?.gridSize;
  const genreName = fixture
    ? getGenreName(fixture.mysekaiFixtureMainGenreId, genres)
    : "";
  const subGenreName = fixture
    ? getSubGenreName(fixture.mysekaiFixtureSubGenreId, subGenres)
    : "";
  const tagNames = fixture
    ? getTagNames(fixture.mysekaiFixtureTagGroup || {}, tags)
    : [];
  const fixtureMaterialCosts = fixture
    ? getFixtureMaterialCost(fixture, dataContext)
    : [];
  const fixtureTalkData = fixture
    ? getFixtureTalkData(fixture, dataContext)
    : [];

  const isObtainedByConvert = fixture
    ? getFixtureConvertStatus(fixture, dataContext) === 1
    : false;
  const isEnableSketch = fixture
    ? getFixtureSketchStatus(fixture, dataContext) === 1
    : false;

  const images: ImageDecorator[] = useMemo(
    () =>
      thumbnailUrl && fixture
        ? [
            {
              src: thumbnailUrl,
              alt: fixture.name,
              downloadUrl: thumbnailUrl,
            },
          ]
        : [],
    [thumbnailUrl, fixture?.name]
  );

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!fixture) {
    return (
      <Container maxWidth="md">
        <TypographyHeader>{t("common:notFound")}</TypographyHeader>
      </Container>
    );
  }

  return (
    <Fragment>
      <TypographyHeader>{fixture.name}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <Grid container spacing={3}>
          {/* Image Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <TabContext value={tabValue}>
                <Tabs
                  value={tabValue}
                  onChange={(e, newValue) => setTabValue(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label={t("common:thumb")} value="0" />
                </Tabs>

                <TabPanelPadding value="0">
                  <Card
                    onClick={() => {
                      setActiveIdx(0);
                      setVisible(true);
                    }}
                    sx={{ cursor: "pointer", p: 1 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Image
                        src={thumbnailUrl}
                        alt={fixture.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "150px",
                          objectFit: "contain",
                          borderRadius: "4px",
                        }}
                        bgColor="transparent"
                      />
                    </Box>
                  </Card>
                </TabPanelPadding>
              </TabContext>
            </Paper>
          </Grid>

          {/* Information Section */}
          <Grid item xs={12}>
            <PaperContainer>
              <Grid container direction="column">
                {/* ID */}
                <Grid
                  item
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:id")}
                  </Typography>
                  <Typography>{fixture.id}</Typography>
                </Grid>

                <Divider style={{ margin: "1% 0" }} />
                <Grid
                  item
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:title")}
                  </Typography>
                  <Typography>{fixture.name}</Typography>
                </Grid>

                <Divider style={{ margin: "1% 0" }} />
                <Grid
                  item
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("mysekai:fixture.genre")}
                  </Typography>
                  <Typography>{genreName}</Typography>
                </Grid>

                {subGenreName && (
                  <Fragment>
                    <Divider style={{ margin: "1% 0" }} />
                    <Grid
                      item
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("mysekai:fixture.subgenre")}
                      </Typography>
                      <Typography>{subGenreName}</Typography>
                    </Grid>
                  </Fragment>
                )}

                <Divider style={{ margin: "1% 0" }} />
                <Grid
                  item
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("mysekai:fixture.size")}
                  </Typography>
                  <Typography>
                    {gridSize ? `${gridSize.width} × ${gridSize.depth}` : ""}
                  </Typography>
                </Grid>

                <Divider style={{ margin: "1% 0" }} />
                <Grid
                  item
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("mysekai:fixture.seq")}
                  </Typography>
                  <Typography>{fixture.seq}</Typography>
                </Grid>

                <Divider style={{ margin: "1% 0" }} />
                <Grid
                  item
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("mysekai:fixture.isObtainedByConvert")}
                  </Typography>
                  <Typography>
                    {isObtainedByConvert ? t("common:yes") : t("common:no")}
                  </Typography>
                </Grid>

                <Divider style={{ margin: "1% 0" }} />
                <Grid
                  item
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("mysekai:fixture.isEnableSketch")}
                  </Typography>
                  <Typography>
                    {isEnableSketch ? t("common:yes") : t("common:no")}
                  </Typography>
                </Grid>

                <Divider style={{ margin: "1% 0" }} />
                <Grid
                  item
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("mysekai:fixture.isAssembled")}
                  </Typography>
                  <Typography>
                    {fixture.isAssembled ? t("common:yes") : t("common:no")}
                  </Typography>
                </Grid>

                <Divider style={{ margin: "1% 0" }} />
                <Grid
                  item
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("mysekai:fixture.isDisassembled")}
                  </Typography>
                  <Typography>
                    {fixture.isDisassembled ? t("common:yes") : t("common:no")}
                  </Typography>
                </Grid>

                {tagNames.length > 0 && (
                  <Fragment>
                    <Divider style={{ margin: "1% 0" }} />
                    <Grid
                      item
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("mysekai:fixture.tags")}
                      </Typography>
                      <Box>
                        {tagNames.map((tagName, index) => (
                          <Chip
                            key={index}
                            label={tagName}
                            size="small"
                            style={{ marginLeft: "4px", marginBottom: "4px" }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Fragment>
                )}

                {fixtureMaterialCosts && fixtureMaterialCosts.length > 0 && (
                  <Fragment>
                    <Divider style={{ margin: "1% 0" }} />
                    <Grid
                      item
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("mysekai:fixture.materialCost")}
                      </Typography>
                      <Box>
                        <Grid container spacing={1} alignItems="center">
                          {fixtureMaterialCosts.map(
                            (
                              cost: IMysekaiBlueprintMaterialCost,
                              index: number
                            ) => {
                              const { mysekaiMaterialId, quantity } = cost;

                              // Find material using mysekaiMaterialId
                              const material = mySekaiMaterials?.find(
                                (mat: IMysekaiMaterial) =>
                                  mat.id === mysekaiMaterialId
                              );

                              // Use iconAssetbundleName if available, otherwise fall back to mysekaiMaterialId
                              const assetBundleName =
                                material?.iconAssetbundleName ||
                                mysekaiMaterialId;
                              const materialIconUrl = `${assetUrl.minio["jp"]}/mysekai/thumbnail/material/${assetBundleName}.webp`;

                              return (
                                <Grid item key={index}>
                                  <Box sx={{ textAlign: "center" }}>
                                    <Image
                                      src={materialIconUrl}
                                      alt="material"
                                      style={{ width: "64px", height: "64px" }}
                                      bgColor=""
                                    />
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                      sx={{
                                        fontSize: "0.75rem",
                                        display: "block",
                                      }}
                                    >
                                      {quantity || 1}
                                    </Typography>
                                  </Box>
                                </Grid>
                              );
                            }
                          )}
                        </Grid>
                      </Box>
                    </Grid>
                  </Fragment>
                )}

                {fixtureTalkData.length > 0 && (
                  <Fragment>
                    <Divider style={{ margin: "1% 0" }} />
                    <Grid
                      item
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("mysekai:fixture.characterTalks")}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {fixtureTalkData.map((talk) => {
                          const gameCharacterIds: number[] = Array.isArray(
                            talk.gameCharacterIds
                          )
                            ? talk.gameCharacterIds
                            : [];
                          if (gameCharacterIds.length === 0) return null;

                          if (gameCharacterIds.length === 1) {
                            const characterId = gameCharacterIds[0];
                            const characterName = getCharaName(
                              charaMap(characterId)
                            );

                            return (
                              <Tooltip key={talk.id} title={`${characterName}`}>
                                <Link
                                  to={`/storyreader/mysekaiTalk/${talk.id}`}
                                >
                                  <Box
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: "50%",
                                      overflow: "hidden",
                                      position: "relative",
                                    }}
                                  >
                                    <img
                                      src={
                                        chibiIcons[
                                          `ChibiIcon${characterId}` as "ChibiIcon1"
                                        ]
                                      }
                                      alt=""
                                      style={{
                                        width: "170%",
                                        height: "170%",
                                        objectFit: "cover",
                                        objectPosition: "center 25%",
                                        transform: "translate(-20%, -12.5%)",
                                      }}
                                    />
                                  </Box>
                                </Link>
                              </Tooltip>
                            );
                          }

                          return (
                            <Link
                              key={talk.id}
                              to={`/storyreader/mysekaiTalk/${talk.id}`}
                            >
                              <Chip
                                sx={{
                                  "& .MuiChip-label": {
                                    padding: 0,
                                  },
                                  cursor: "pointer",
                                }}
                                label={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 0.5,
                                      alignItems: "center",
                                      padding: "2px",
                                    }}
                                  >
                                    {gameCharacterIds.map((characterId) => {
                                      return (
                                        <Box
                                          key={characterId}
                                          sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            position: "relative",
                                          }}
                                        >
                                          <img
                                            src={
                                              chibiIcons[
                                                `ChibiIcon${characterId}` as "ChibiIcon1"
                                              ]
                                            }
                                            alt=""
                                            style={{
                                              width: "170%",
                                              height: "170%",
                                              objectFit: "cover",
                                              objectPosition: "center 25%",
                                              transform:
                                                "translate(-20%, -12.5%)",
                                            }}
                                          />
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                }
                              />
                            </Link>
                          );
                        })}
                      </Box>
                    </Grid>
                  </Fragment>
                )}
              </Grid>
            </PaperContainer>
          </Grid>
        </Grid>

        <Viewer
          visible={visible}
          onClose={() => setVisible(false)}
          images={images}
          activeIndex={activeIdx}
          downloadable
          downloadInNewWindow
          onMaskClick={() => setVisible(false)}
          zIndex={99999}
        />
      </ContainerContent>
    </Fragment>
  );
});

export default mysekaiFixtureDetail;
