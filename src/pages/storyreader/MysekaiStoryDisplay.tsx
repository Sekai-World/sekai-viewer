import { LinearProgress, Box, Typography, Paper } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Axios from "axios";
import {
  useAlertSnackbar,
  getRemoteAssetURL,
  useCachedData,
} from "../../utils";
import {
  IMysekaiTalk,
  IGameChara,
  IMysekaiFixtureInfo,
  IMysekaiTalkCondition,
  IMysekaiTalkConditionGroup,
  IMysekaiGameCharacterUnitGroups,
} from "../../types.d";
import { MysekaiTalk } from "./StoryReaderSnippet";
import {
  getThumbnailURL,
  charaMap,
  unitMapping,
  findTalkFixture,
} from "../../utils/mysekaiFixtureUtils";
import { MysekaiDataContext } from "../../types.d";

const MysekaiStoryDisplay: React.FC<{ storyId: string }> = ({ storyId }) => {
  const { t } = useTranslation();
  const { showError } = useAlertSnackbar();
  const [talks] = useCachedData<IMysekaiTalk>("mysekaiCharacterTalks");
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [fixtures] = useCachedData<IMysekaiFixtureInfo>("mysekaiFixtures");
  const [talkConditions] = useCachedData<IMysekaiTalkCondition>(
    "mysekaiCharacterTalkConditions"
  );
  const [talkConditionGroups] = useCachedData<IMysekaiTalkConditionGroup>(
    "mysekaiCharacterTalkConditionGroups"
  );
  const [characterGroups] = useCachedData<IMysekaiGameCharacterUnitGroups>(
    "mysekaiGameCharacterUnitGroups"
  );
  const [actions, setActions] = useState<any[]>([]);
  const [currentTalk, setCurrentTalk] = useState<IMysekaiTalk | null>(null);
  const [fixtureInfo, setFixtureInfo] = useState<IMysekaiFixtureInfo | null>(
    null
  );
  const [fixtureThumbnailUrl, setFixtureThumbnailUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper function to validate if a URL exists
  const validateURL = useCallback(async (url: string): Promise<boolean> => {
    try {
      const response = await Axios.head(url);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.warn(`Voice URL validation failed for: ${url}`, error);
      return false;
    }
  }, []);

  // Helper function to map part voice folder names with validation
  const mapPartVoiceFolder = useCallback(
    async (voiceFile: string, charaNumUnitVariant: number): Promise<string> => {
      const match = voiceFile.match(/partvoice_(?:[^_\d]+_)?(\d+)_(\d+)_(.+)/);
      if (match) {
        const [, part, charaNumRaw, unitVariant] = match;
        const filename = `partvoice_mysekai_${part}_${charaNumRaw}_${unitVariant}`;

        const charaNum = String(Number(charaNumRaw));

        const unit = unitMapping[charaNumUnitVariant];

        const virtualSingerMap: { [key: string]: string } = {
          "21": "miku",
          "22": "rin",
          "23": "len",
          "24": "luka",
          "25": "meiko",
          "26": "kaito",
        };
        const charName = virtualSingerMap[charaNum] || charaNum;

        const primaryFolder = `mysekai_part_voice_v2_${charaNum}${charName}_${unit}`;

        // Check if primary folder URL is valid
        const primaryURL = await getRemoteAssetURL(
          `mysekai/talk/part_voice/${primaryFolder}/${filename}.mp3`,
          undefined,
          "minio"
        );

        const isPrimaryValid = await validateURL(primaryURL);
        if (isPrimaryValid) {
          return primaryURL;
        }

        // Fallback to piapro as unit name
        const fallbackFolder = `mysekai_part_voice_v2_${charaNum}${charName}_piapro`;
        return await getRemoteAssetURL(
          `mysekai/talk/part_voice/${fallbackFolder}/${filename}.mp3`,
          undefined,
          "minio"
        );
      }
      return voiceFile;
    },
    []
  );

  // Parse lua script content
  const parseLuaScript = useCallback(
    async (luaContent: string, characterIds: number[]): Promise<any[]> => {
      let scenarioId: string | null = null;

      // Extract scenario ID from comment
      const scenarioMatch = luaContent.match(/--.*シナリオID\s*:\s*(.+)/);
      if (scenarioMatch) {
        scenarioId = scenarioMatch[1].trim();
      }

      const sections = luaContent
        .split(/wait_click\(\)/)
        .filter((section) => section.trim());
      const dialogues: {
        characterId?: number;
        characterName?: string;
        text: string;
        voiceUrl?: string;
      }[] = [];

      for (const section of sections) {
        const lines = section
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);

        let character: string | undefined = undefined;
        let voiceFile: string | null = null;
        let text: string | null = null;
        let characterId: number | undefined = undefined;

        // Parse each line in the section
        lines.forEach((line) => {
          // Parse label (character name)
          if (line.startsWith("label(")) {
            const match = line.match(/label\("(.+?)"\)/);
            if (match) {
              character = match[1];
              // Find character by name in the game characters
              const foundChara = charas?.find((c) => c.givenName === character);
              if (foundChara) {
                characterId =
                  characterIds.find((id) => charaMap(id) === foundChara.id) ??
                  0;
              }
            }
          }

          // Parse voice command
          if (line.startsWith("voice(")) {
            const match = line.match(
              /voice\("talk",\s*"(.+?)",\s*Characters\.(.+?)\)/
            );
            if (match) {
              voiceFile = match[1];

              // Could also use character from voice command if label not found
              if (!character) {
                character = match[2];
              }
            }
          }

          // Parse text dialogue
          if (line.startsWith("text(")) {
            const match = line.match(/text\("(.+?)"\)/);
            if (match) {
              text = match[1].replace(/\\n/g, "\n");
            }
          }
        });

        // Create dialogue if we have text
        if (text) {
          // Generate voice URL if voiceFile and scenarioId are available
          const voiceUrl =
            voiceFile && scenarioId
              ? await (async () => {
                  // Check if this is a part voice file
                  const voiceFileName = String(voiceFile);
                  if (voiceFileName.indexOf("partvoice_") === 0) {
                    // Handle part voice files with special mapping
                    return await mapPartVoiceFolder(
                      voiceFileName,
                      characterId ?? 27
                    );
                  } else {
                    // Handle regular voice files
                    return await getRemoteAssetURL(
                      `mysekai/talk/voice/${scenarioId}/${voiceFileName}.mp3`,
                      undefined,
                      "minio"
                    );
                  }
                })()
              : undefined;
          dialogues.push({
            characterId,
            characterName: character,
            text,
            voiceUrl,
          });
        }
      }

      return dialogues;
    },
    [charas, mapPartVoiceFolder]
  );

  // Load and parse lua script using talk.lua as asset bundle name
  useEffect(() => {
    const loadStory = async () => {
      setIsLoading(true);

      try {
        if (!talks || !charas || !characterGroups) {
          return;
        }

        // Find the talk by ID
        const talk = talks.find((t) => t.id === parseInt(storyId));
        if (!talk) {
          throw new Error(`Talk with ID ${storyId} not found`);
        }

        setCurrentTalk(talk);

        // Get character IDs from the talk's character group
        const characterIds: number[] = [];
        if (characterGroups) {
          const charGroup = characterGroups.find(
            (cg) => cg.id === talk.mysekaiGameCharacterUnitGroupId
          );

          if (charGroup) {
            Object.entries(charGroup).forEach(([key, value]) => {
              if (key !== "id" && typeof value === "number" && value > 0) {
                characterIds.push(value);
              }
            });
          }
        }

        // Find associated fixture
        if (
          fixtures &&
          talkConditions &&
          talkConditionGroups &&
          talks &&
          characterGroups
        ) {
          const dataContext: MysekaiDataContext = {
            talkConditions,
            talkConditionGroups,
            talks,
            characterGroups,
          };

          const fixture = findTalkFixture(talk.id, fixtures, dataContext);

          if (fixture) {
            setFixtureInfo(fixture);
            // Load fixture thumbnail
            getThumbnailURL(fixture, setFixtureThumbnailUrl);
          }
        }

        // Use talk.lua as the asset bundle name to construct the URL
        const scriptUrl = await getRemoteAssetURL(
          `${talk.assetbundleName}/${talk.lua}.lua.txt`,
          undefined,
          "minio"
        );

        const response = await Axios.get(scriptUrl, {
          responseType: "text",
        });

        const luaContent = response.data;
        const parsedActions = await parseLuaScript(luaContent, characterIds);

        setActions(parsedActions);
      } catch (error) {
        showError(t("mysekai:story.loadError") || "Failed to load story");
      } finally {
        setIsLoading(false);
      }
    };

    if (storyId && talks && charas) {
      loadStory();
    }
  }, [
    storyId,
    talks,
    charas,
    characterGroups,
    fixtures,
    talkConditions,
    talkConditionGroups,
    parseLuaScript,
    showError,
    t,
  ]);

  if (isLoading) {
    return <LinearProgress variant="indeterminate" />;
  }

  return (
    <>
      {/* Fixture Information Header */}
      {currentTalk && fixtureInfo && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              {fixtureInfo && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {/* Fixture Thumbnail */}
                  {fixtureThumbnailUrl && (
                    <Link
                      to={`/mysekai/fixture/${fixtureInfo.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        component="img"
                        src={fixtureThumbnailUrl}
                        alt={fixtureInfo.name}
                        sx={{
                          width: 32,
                          height: 32,
                          objectFit: "cover",
                          borderRadius: 1,
                          cursor: "pointer",
                          "&:hover": {
                            opacity: 0.8,
                          },
                        }}
                      />
                    </Link>
                  )}
                  {/* Fixture Name Link */}
                  <Link
                    to={`/mysekai/fixture/${fixtureInfo.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        "&:hover": {
                          color: "primary.main",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      📍 {fixtureInfo.name}
                    </Typography>
                  </Link>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {/* Talk Actions */}
      {actions.map((action, idx) => {
        return (
          <MysekaiTalk
            key={`talk-${idx}`}
            characterId={action.characterId ?? 0}
            characterName={action.characterName}
            text={action.text || ""}
            voiceUrl={action.voiceUrl}
          />
        );
      })}
    </>
  );
};

export default MysekaiStoryDisplay;
