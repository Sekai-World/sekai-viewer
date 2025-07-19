import React, {
  useEffect,
  useCallback,
  useState,
  useMemo,
  Fragment,
} from "react";
import { Route, Switch, useRouteMatch, Link } from "react-router-dom";
import Axios from "axios";

import { useCachedData, getRemoteAssetURL, useLocalStorage } from "../../utils";
import { useCharaName } from "../../utils/i18n";
import { useRootStore } from "../../stores/root";
import {
  IMysekaiTalk,
  IMysekaiGameCharacterUnitGroups,
  IGameChara,
  ServerRegion,
  IMysekaiFixtureInfo,
  IMysekaiTalkCondition,
  IMysekaiTalkConditionGroup,
} from "../../types.d";
import { chibiIcons } from "../../utils/resources";
import {
  charaMap,
  getThumbnailURL,
  createTalkToFixtureMap,
} from "../../utils/mysekaiFixtureUtils";
import {
  filterMysekaiTalks,
  type EnhancedTalk,
  CharacterFilter,
  FixtureFilter,
} from "./MysekaiTalkFilters";

import {
  Grid,
  CardContent,
  Card,
  styled,
  Stack,
  Tooltip,
  Typography,
  CircularProgress,
  Box,
  Pagination,
  Skeleton,
} from "@mui/material";

import LinkNoDecorationAlsoNoHover from "../styled/LinkNoDecorationAlsoHover";

const CardSelect = styled(Card)`
  &:hover {
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

const LoadingCard: React.FC = () => {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {/* Thumbnail skeleton */}
            <Box sx={{ flexShrink: 0 }}>
              <Skeleton
                variant="rounded"
                width={50}
                height={50}
                sx={{ borderRadius: "6px" }}
              />
            </Box>

            {/* Content area skeleton */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Character avatars skeleton */}
              <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
              </Box>

              {/* Text content skeleton */}
              <Skeleton
                variant="text"
                width="100%"
                height={16}
                sx={{ mb: 0.5 }}
              />
              <Skeleton variant="text" width="60%" height={14} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

const TalkCard: React.FC<{
  talk: IMysekaiTalk & {
    characterIds: number[];
    fixtureInfo?: IMysekaiFixtureInfo;
    firstTalkText?: string;
  };
  to: string;
}> = ({ talk, to }) => {
  const getCharaName = useCharaName();
  const [fixtureThumbnailUrl, setFixtureThumbnailUrl] = useState<string>("");

  // Load fixture thumbnail if available
  useEffect(() => {
    if (talk.fixtureInfo) {
      getThumbnailURL(talk.fixtureInfo, setFixtureThumbnailUrl);
    }
  }, [talk.fixtureInfo]);

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <LinkNoDecorationAlsoNoHover to={to}>
        <CardSelect>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              {/* thumbnail */}
              {talk.fixtureInfo && fixtureThumbnailUrl && (
                <Box sx={{ flexShrink: 0 }}>
                  <Tooltip title={talk.fixtureInfo.name}>
                    <Link
                      to={`/mysekai/fixture/${talk.fixtureInfo.id}`}
                      style={{ textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Box
                        component="img"
                        src={fixtureThumbnailUrl}
                        alt={talk.fixtureInfo.name}
                        sx={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                          "&:hover": {
                            opacity: 0.8,
                          },
                        }}
                      />
                    </Link>
                  </Tooltip>
                </Box>
              )}

              {/* Content area */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Character avatars */}
                <Box
                  sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}
                >
                  {talk.characterIds.map((characterId) => {
                    return (
                      <Tooltip
                        key={characterId}
                        title={getCharaName(charaMap(characterId))}
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
                      </Tooltip>
                    );
                  })}
                </Box>

                {/* First talk text preview */}
                {talk.firstTalkText && (
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{
                      display: "block",
                      fontStyle: "italic",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1.2,
                    }}
                  >
                    &quot;{talk.firstTalkText}&quot;
                  </Typography>
                )}

                {/* Fixture name if available */}
                {talk.fixtureInfo && (
                  <Link
                    to={`/mysekai/fixture/${talk.fixtureInfo.id}`}
                    style={{ textDecoration: "none" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Typography
                      variant="caption"
                      color="textPrimary"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      📍 {talk.fixtureInfo.name}
                    </Typography>
                  </Link>
                )}
              </Box>
            </Box>
          </CardContent>
        </CardSelect>
      </LinkNoDecorationAlsoNoHover>
    </Grid>
  );
};

const MysekaiTalk: React.FC<{
  onSetStory: (data?: {
    storyType: string;
    storyId: string;
    region: ServerRegion;
  }) => void;
}> = ({ onSetStory }) => {
  const { path } = useRouteMatch();
  const [talks] = useCachedData<IMysekaiTalk>("mysekaiCharacterTalks");
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [characterGroups] = useCachedData<IMysekaiGameCharacterUnitGroups>(
    "mysekaiGameCharacterUnitGroups"
  );

  // Additional data for fixture association
  const [fixtures] = useCachedData<IMysekaiFixtureInfo>("mysekaiFixtures");
  const [talkConditions] = useCachedData<IMysekaiTalkCondition>(
    "mysekaiCharacterTalkConditions"
  );
  const [talkConditionGroups] = useCachedData<IMysekaiTalkConditionGroup>(
    "mysekaiCharacterTalkConditionGroups"
  );

  const { region } = useRootStore();
  const [characterSelected, setCharacterSelected] = useLocalStorage<number[]>(
    "mysekai-talk-character-selected",
    []
  );
  const [supportingUnitSelected, setSupportingUnitSelected] = useLocalStorage<
    string[]
  >("mysekai-talk-supporting-unit-selected", []);
  const [fixtureFilter, setFixtureFilter] = useLocalStorage<string>(
    "mysekai-talk-fixture-filter",
    "all"
  ); // "all", "fixture", "non-fixture"
  const [isLoadingTalks, setIsLoadingTalks] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useLocalStorage<number>(
    "mysekai-talk-current-page",
    1
  );
  const ITEMS_PER_PAGE = 12;

  // Parse first talk text from lua script
  const parseFirstTalkText = useCallback(
    async (talk: IMysekaiTalk): Promise<string | undefined> => {
      try {
        const scriptUrl = await getRemoteAssetURL(
          `${talk.assetbundleName}/${talk.lua}.lua.txt`,
          undefined,
          "minio"
        );

        const response = await Axios.get(scriptUrl, {
          responseType: "text",
        });

        const luaContent = response.data;
        const lines = luaContent.split("\n");

        // Find the first line that starts with text(
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("text(")) {
            const match = trimmedLine.match(/text\("(.+?)"\)/);
            if (match) {
              return match[1].replace(/\\n/g, " ");
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to parse lua for talk ${talk.id}:`, error);
      }
      return undefined;
    },
    []
  );

  // Create fixture-to-talks mapping for efficient lookup
  const fixtureToTalksMap = useMemo(() => {
    if (
      !fixtures ||
      !talkConditions ||
      !talkConditionGroups ||
      !talks ||
      !characterGroups
    ) {
      return new Map<number, IMysekaiFixtureInfo>();
    }

    return createTalkToFixtureMap(fixtures, {
      talkConditions,
      talkConditionGroups,
      talks,
      characterGroups,
    });
  }, [fixtures, talkConditions, talkConditionGroups, talks, characterGroups]);

  // Basic talks with character IDs (no async processing)
  const basicTalks = useMemo((): EnhancedTalk[] => {
    if (!talks || !characterGroups) {
      return [];
    }

    return talks.map((talk) => {
      const charGroup = characterGroups.find(
        (chg) => chg.id === talk.mysekaiGameCharacterUnitGroupId
      );

      const characterIds: number[] = [];
      if (charGroup) {
        Object.entries(charGroup).forEach(([key, value]) => {
          if (key !== "id" && typeof value === "number" && value > 0) {
            characterIds.push(value);
          }
        });
      }

      const fixtureInfo = fixtureToTalksMap.get(talk.id);

      return {
        ...talk,
        characterIds,
        fixtureInfo,
      };
    });
  }, [talks, characterGroups, fixtureToTalksMap]);

  // Processed talks with async data (only for current page)
  const [processedTalks, setProcessedTalks] = useState<
    Map<number, EnhancedTalk>
  >(new Map());

  const filteredTalks = useMemo(() => {
    return filterMysekaiTalks(
      basicTalks,
      {
        characterSelected,
        supportingUnitSelected,
        fixtureFilter,
      },
      charas
    );
  }, [
    basicTalks,
    characterSelected,
    supportingUnitSelected,
    fixtureFilter,
    charas,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTalks.length]);

  // Paginated talks
  const paginatedTalks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTalks.slice(startIndex, endIndex);
  }, [filteredTalks, currentPage]);

  const totalPages = Math.ceil(filteredTalks.length / ITEMS_PER_PAGE);

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, page: number) => {
      setCurrentPage(page);
    },
    []
  );

  // Process talks for current page only
  useEffect(() => {
    const processCurrentPageTalks = async () => {
      if (paginatedTalks.length === 0) {
        setIsLoadingTalks(false);
        return;
      }

      setIsLoadingTalks(true);

      try {
        const newProcessedTalks = new Map(processedTalks);
        const talksToProcess = paginatedTalks.filter(
          (talk) => !newProcessedTalks.has(talk.id)
        );

        if (talksToProcess.length > 0) {
          const processedBatch = await Promise.all(
            talksToProcess.map(async (talk) => {
              const firstTalkText = await parseFirstTalkText(talk);
              return {
                ...talk,
                firstTalkText,
              };
            })
          );

          processedBatch.forEach((talk) => {
            newProcessedTalks.set(talk.id, talk);
          });

          setProcessedTalks(newProcessedTalks);
        }
      } catch (error) {
        console.error("Error processing current page talks:", error);
      } finally {
        setIsLoadingTalks(false);
      }
    };

    processCurrentPageTalks();
  }, [paginatedTalks, processedTalks, parseFirstTalkText]);

  // Get fully processed talks for current page
  const currentPageProcessedTalks = useMemo(() => {
    return paginatedTalks.map((talk) => {
      const processed = processedTalks.get(talk.id);
      return processed || { ...talk, firstTalkText: undefined };
    });
  }, [paginatedTalks, processedTalks]);

  const leafMatch = useRouteMatch({
    path: `${path}/:talkId`,
    strict: true,
  });

  useEffect(() => {
    if (leafMatch && leafMatch.params && "talkId" in leafMatch.params) {
      onSetStory({
        storyType: "mysekaiTalk",
        storyId: (leafMatch.params as { talkId: string }).talkId,
        region,
      });
    } else {
      onSetStory();
    }
  }, [leafMatch, onSetStory, region]);

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Stack>
          <CharacterFilter
            selected={characterSelected}
            onFilter={setCharacterSelected}
            supportingUnitSelected={supportingUnitSelected}
            onSupportingUnitFilter={setSupportingUnitSelected}
          />

          <FixtureFilter value={fixtureFilter} onChange={setFixtureFilter} />

          {!talks || !characterGroups ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Fragment>
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="medium"
                    hidePrevButton={true}
                    hideNextButton={true}
                    showFirstButton={false}
                    showLastButton={false}
                  />
                </Box>
              )}

              <Grid container spacing={1}>
                {currentPageProcessedTalks.map((talk) => (
                  <TalkCard
                    key={talk.id}
                    talk={talk}
                    to={`${path}/${talk.id}`}
                  />
                ))}

                {/* Show loading cards while processing */}
                {isLoadingTalks &&
                  Array.from({
                    length: Math.min(
                      ITEMS_PER_PAGE - currentPageProcessedTalks.length,
                      6
                    ),
                  }).map((_, index) => (
                    <LoadingCard key={`loading-${index}`} />
                  ))}
              </Grid>

              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="medium"
                    hidePrevButton={true}
                    hideNextButton={true}
                    showFirstButton={false}
                    showLastButton={false}
                  />
                </Box>
              )}
            </Fragment>
          )}
        </Stack>
      </Route>
    </Switch>
  );
};

export default MysekaiTalk;
