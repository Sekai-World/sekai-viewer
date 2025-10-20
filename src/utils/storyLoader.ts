import Axios from "axios";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useCachedData, getRemoteAssetURL } from ".";
import {
  ICharacter2D,
  IMobCharacter,
  IScenarioData,
  IUnitStory,
  IEventStory,
  ICharaProfile,
  ICardEpisode,
  ICardInfo,
  IActionSet,
  ISpecialStory,
  IMysekaiTalk,
  SnippetAction,
  SpecialEffectType,
  SnippetProgressBehavior,
  SoundPlayMode,
  ServerRegion,
  TalkData,
  Snippet,
  SpecialEffectData,
  SoundData,
  LayoutData,
  CharacterLayoutType,
  CharacterLayoutDepthType,
  CharacterLayoutMoveSpeedType,
  IListBucketResult,
} from "../types.d";
import { ILive2DAssetUrl, Live2DAssetType } from "./Live2DPlayer/types.d";
import { useCharaName, useAssetI18n } from "./i18n";
import { charaIcons } from "./resources";
import { XMLParser } from "fast-xml-parser";
import { assetUrl } from "./urls";

import { fixVoiceUrl } from "./voiceFinder";

export interface IScenarioInfo {
  bannerUrl?: string;
  scenarioDataUrl: string;
  isCardStory: boolean;
  isActionSet: boolean;
  chapterTitle?: string;
  episodeTitle?: string;
  releaseConditionId?: number;
  storyType: string;
  storyId: string;
  region: ServerRegion;
}

export function useScenarioInfo() {
  const [unitStories] = useCachedData<IUnitStory>("unitStories");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [actionSets] = useCachedData<IActionSet>("actionSets");
  const [specialStories] = useCachedData<ISpecialStory>("specialStories");
  const [mysekaiTalks] = useCachedData<IMysekaiTalk>("mysekaiCharacterTalks");
  const { getTranslated } = useAssetI18n();
  const { t } = useTranslation();

  return useCallback(
    async (
      storyType: string,
      storyId: string,
      region: ServerRegion
    ): Promise<IScenarioInfo | undefined> => {
      switch (storyType) {
        case "unitStory":
          if (unitStories) {
            const [, , , unitId, chapterNo, episodeNo] = storyId.split("/");

            const unit = unitStories.find((us) => us.unit === unitId);
            if (!unit) throw new Error(`Unit ${unitId} not found`);
            const chapter = unit.chapters.find(
              (ch) => ch.chapterNo === Number(chapterNo)
            );
            if (!chapter) throw new Error(`Chapter ${chapterNo} not found`);
            const episode = chapter.episodes.find(
              (ep) => ep.episodeNo === Number(episodeNo)
            );
            if (!episode) throw new Error(`Episode ${episodeNo} not found`);
            return {
              storyType,
              storyId,
              region,
              bannerUrl: await getRemoteAssetURL(
                `story/episode_image/${chapter.assetbundleName}/${episode.assetbundleName}.webp`,
                undefined,
                "minio"
              ),
              scenarioDataUrl: `scenario/unitstory/${chapter.assetbundleName}/${episode.scenarioId}.asset`,
              isCardStory: false,
              isActionSet: false,
              chapterTitle: getTranslated(
                `unit_story_chapter_title:${chapter.unit}-${chapter.chapterNo}`,
                chapter.title
              ),
              episodeTitle: getTranslated(
                `unit_story_episode_title:${episode.unit}-${episode.chapterNo}-${episode.episodeNo}`,
                episode.title
              ),
              releaseConditionId: episode.releaseConditionId,
            };
          }
          break;
        case "eventStory":
          if (eventStories) {
            const [, , , eventId, episodeNo] = storyId.split("/");

            const chapter = eventStories.find(
              (es) => es.eventId === Number(eventId)
            );
            if (!chapter) throw new Error(`Chapter ${eventId} not found`);
            const episode = chapter.eventStoryEpisodes.find(
              (ep) => ep.episodeNo === Number(episodeNo)
            );
            if (!episode) throw new Error(`Episode ${episodeNo} not found`);
            return {
              storyType,
              storyId,
              region,
              bannerUrl: await getRemoteAssetURL(
                `event_story/${chapter.assetbundleName}/episode_image/${episode.assetbundleName}.webp`,
                undefined,
                "minio"
              ),
              scenarioDataUrl: `event_story/${chapter.assetbundleName}/scenario/${episode.scenarioId}.asset`,
              isCardStory: false,
              isActionSet: false,
              chapterTitle: "",
              episodeTitle: `${episode.episodeNo} - ${getTranslated(
                `event_story_episode_title:${episode.eventStoryId}-${episode.episodeNo}`,
                episode.title
              )}`,
              releaseConditionId: episode.releaseConditionId,
            };
          }
          break;
        case "charaStory":
          if (characterProfiles) {
            const [, , , charaId] = storyId.split("/");

            const episode = characterProfiles.find(
              (cp) => cp.characterId === Number(charaId)
            );
            if (!episode) throw new Error(`Episode ${charaId} not found`);
            return {
              storyType,
              storyId,
              region,
              bannerUrl: charaIcons[`CharaIcon${charaId}` as "CharaIcon1"],
              scenarioDataUrl: `scenario/profile/${episode.scenarioId}.asset`,
              isCardStory: false,
              isActionSet: false,
              chapterTitle: "",
              episodeTitle: t("member:introduction"),
              releaseConditionId: 0,
            };
          }
          break;
        case "cardStory":
          if (cardEpisodes) {
            const [, , , , , cardEpisodeId] = storyId.split("/");

            const episode = cardEpisodes.find(
              (ce) => ce.id === Number(cardEpisodeId)
            );
            if (!episode) throw new Error(`Episode ${cardEpisodeId} not found`);
            let assetbundleName = episode.assetbundleName;
            if (!assetbundleName && !!cards) {
              const card = cards.find((card) => card.id === episode.cardId);
              if (card) {
                assetbundleName = card.assetbundleName;
              }
            }

            if (assetbundleName) {
              return {
                storyType,
                storyId,
                region,
                bannerUrl: `character/member_small/${assetbundleName}/card_normal.webp`,
                scenarioDataUrl:
                  region === "en"
                    ? `character/member_scenario/${assetbundleName}/${episode.scenarioId}.asset`
                    : `character/member/${assetbundleName}/${episode.scenarioId}.asset`,
                isCardStory: true,
                isActionSet: false,
                chapterTitle: "",
                episodeTitle: getTranslated(
                  `card_episode_title:${episode.title}`,
                  episode.title
                ),
                releaseConditionId: episode.releaseConditionId,
              };
            }
          }
          break;
        case "areaTalk":
          if (actionSets) {
            const [, , , , actionSetId] = storyId.split("/");

            const episode = actionSets.find(
              (as) => as.id === Number(actionSetId)
            );
            if (!episode) throw new Error(`Episode ${actionSetId} not found`);
            if (!episode.scenarioId)
              throw new Error(`Episode id of ${actionSetId} not exist`);
            return {
              storyType,
              storyId,
              region,
              bannerUrl: undefined,
              scenarioDataUrl: `scenario/actionset/group${Math.floor(episode.id / 100)}/${
                episode.scenarioId
              }.asset`,
              isCardStory: false,
              isActionSet: true,
              chapterTitle: "",
              episodeTitle: "",
              releaseConditionId: undefined,
            };
          }
          break;
        case "specialStory":
          if (specialStories) {
            const [, , , spId, episodeNo] = storyId.split("/");
            const chapter = specialStories.find((sp) => sp.id === Number(spId));
            if (!chapter) throw new Error(`Chapter ${spId} not found`);
            const episode = chapter.episodes.find(
              (ep) => ep.episodeNo === Number(episodeNo)
            );
            if (!episode) throw new Error(`Episode ${episodeNo} not found`);
            return {
              storyType,
              storyId,
              region,
              bannerUrl: undefined,
              scenarioDataUrl: episode.scenarioId.startsWith("op")
                ? `scenario/special/${chapter.assetbundleName}/${episode.scenarioId}.asset`
                : `scenario/special/${episode.assetbundleName}/${episode.scenarioId}.asset`,
              isCardStory: false,
              isActionSet: false,
              chapterTitle: chapter.title || "",
              episodeTitle: episode.title || "",
              releaseConditionId: undefined,
            };
          }
          break;
        case "mysekaiTalk":
          if (mysekaiTalks) {
            const talkId = parseInt(storyId);
            const talk = mysekaiTalks.find((t) => t.id === talkId);
            if (!talk) throw new Error(`MySekai talk ${talkId} not found`);

            return {
              storyType,
              storyId,
              region,
              bannerUrl: "",
              scenarioDataUrl: "",
              isCardStory: false,
              isActionSet: false,
              chapterTitle: "",
              episodeTitle: "",
              releaseConditionId: undefined,
            };
          }
          break;
        default:
          throw new Error(`Wrong story type: ${storyType}`);
      }
    },
    [
      unitStories,
      eventStories,
      characterProfiles,
      cardEpisodes,
      t,
      getTranslated,
      actionSets,
      specialStories,
      cards,
      mysekaiTalks,
    ]
  );
}

export function useProcessedScenarioDataForText() {
  const [mobCharas] = useCachedData<IMobCharacter>("mobCharacters");
  const [chara2Ds] = useCachedData<ICharacter2D>("character2ds");

  const getCharaName = useCharaName();

  return useCallback(
    async (info: IScenarioInfo) => {
      const ret: {
        characters: { id: number; name: string }[];
        actions: { [key: string]: any }[];
      } = {
        actions: [],
        characters: [],
      };

      if (
        !chara2Ds ||
        !chara2Ds.length ||
        !info ||
        info.storyType === "mysekaiTalk"
      )
        return ret;

      const { data }: { data: IScenarioData } = await Axios.get(
        await getRemoteAssetURL(
          info.scenarioDataUrl,
          undefined,
          "minio",
          info.region
        ),
        {
          responseType: "json",
        }
      );

      const {
        ScenarioId,
        AppearCharacters,
        Snippets,
        TalkData,
        // LayoutData,
        SpecialEffectData,
        SoundData,
        FirstBgm,
        FirstBackground,
      } = data;

      const AssetbundleName = scenarioIdToAssetbundleName(ScenarioId);

      const voiceMap: {
        [key: string]: Record<string, string>;
      } = {};

      if (FirstBackground) {
        ret.actions.push({
          body: FirstBgm,
          delay: 0,
          isWait: SnippetProgressBehavior.WaitUnitilFinished,
          resource: await getBackgroundImageUrl(FirstBackground),
          seType: "ChangeBackground",
          type: SnippetAction.SpecialEffect,
        });
      }
      if (FirstBgm) {
        ret.actions.push({
          bgm: await getBgmUrl(FirstBgm),
          delay: 0,
          hasBgm: true,
          hasSe: false,
          isWait: SnippetProgressBehavior.WaitUnitilFinished,
          playMode: SoundPlayMode[0],
          se: "",
          type: SnippetAction.Sound,
        });
      }

      ret.characters = AppearCharacters.map((ap) => {
        const chara2d = chara2Ds.find((ch) => ch.id === ap.Character2dId);
        if (!chara2d)
          return {
            id: ap.Character2dId,
            name: ap.CostumeType,
          };
        switch (chara2d.characterType) {
          case "game_character": {
            return {
              id: chara2d.characterId,
              name: getCharaName(chara2d.characterId)!,
            };
          }
          case "mob": {
            return {
              id: chara2d.characterId,
              name:
                mobCharas?.find((mc) => mc.id === chara2d.characterId)?.name ||
                "",
            };
          }
        }
      });

      for (const snippet of Snippets) {
        let action: { [key: string]: any } = {};
        switch (snippet.Action) {
          case SnippetAction.Talk:
            {
              const talkData = TalkData[snippet.ReferenceIndex];
              // try get character
              let chara2d: ICharacter2D | undefined;
              const chara = { id: 0, name: "" };
              if (talkData.TalkCharacters[0].Character2dId) {
                chara2d = chara2Ds.find(
                  (ch) => ch.id === talkData.TalkCharacters[0].Character2dId
                )!;
                chara.id = chara2d.characterId;
              }
              chara.name = talkData.WindowDisplayName;

              action = {
                body: talkData.Body,
                chara,
                delay: snippet.Delay,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                type: snippet.Action,
                voice: talkData.Voices.length
                  ? await getTalkVoiceUrl(
                      voiceMap,
                      AssetbundleName,
                      talkData,
                      info.isCardStory,
                      info.isActionSet,
                      info.region,
                      chara2d
                    )
                  : "",
              };
            }
            break;
          case SnippetAction.SpecialEffect:
            {
              const specialEffect = SpecialEffectData[snippet.ReferenceIndex];
              const specialEffectType =
                SpecialEffectType[specialEffect.EffectType];

              action = {
                body: specialEffect.StringVal,
                delay: snippet.Delay,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                resource:
                  specialEffectType === "FullScreenText"
                    ? await getFullScreenTextVoiceUrl(
                        AssetbundleName,
                        specialEffect.StringValSub
                      )
                    : specialEffectType === "ChangeBackground"
                      ? await getBackgroundImageUrl(specialEffect.StringValSub)
                      : specialEffectType === "Movie"
                        ? getMovieDirPath(specialEffect.StringVal)
                        : "",
                seType: specialEffectType,
                type: snippet.Action,
              };
            }
            break;
          case SnippetAction.Sound:
            {
              const soundData = SoundData[snippet.ReferenceIndex];

              action = {
                bgm: soundData.Bgm ? await getBgmUrl(soundData.Bgm) : "",
                delay: snippet.Delay,
                hasBgm: !!soundData.Bgm,
                hasSe: !!soundData.Se,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                playMode: SoundPlayMode[soundData.PlayMode],
                se: soundData.Se ? await getSoundEffectUrl(soundData.Se) : "",
                type: snippet.Action,
              };

              // console.dir(action);
            }
            break;
          default: {
            action = {
              delay: snippet.Delay,
              isWait:
                snippet.ProgressBehavior ===
                SnippetProgressBehavior.WaitUnitilFinished,
              type: snippet.Action,
            };
          }
        }

        ret.actions.push(action);
      }
      return ret;
    },
    [chara2Ds, getCharaName, mobCharas]
  );
}

export async function getProcessedScenarioDataForLive2D(
  info: IScenarioInfo,
  data?: IScenarioData
) {
  if (!data) {
    const res: { data: IScenarioData } = await Axios.get(
      await getRemoteAssetURL(
        info.scenarioDataUrl,
        undefined,
        "minio",
        info.region
      ),
      {
        responseType: "json",
      }
    );
    data = res.data;
  }
  modelNameFix(info, data);
  const {
    Snippets,
    SpecialEffectData,
    SoundData,
    FirstBgm,
    FirstBackground,
    FirstLayout,
    LayoutData,
  } = data;

  if (FirstBackground) {
    const bgSnippet: Snippet = {
      Action: SnippetAction.SpecialEffect,
      ProgressBehavior: SnippetProgressBehavior.Now,
      ReferenceIndex: SpecialEffectData.length,
      Delay: 0,
    };
    const spData: SpecialEffectData = {
      EffectType: SpecialEffectType.ChangeBackground,
      StringVal: FirstBackground,
      StringValSub: FirstBackground,
      Duration: 0,
      IntVal: 0,
    };
    Snippets.unshift(bgSnippet);
    SpecialEffectData.push(spData);
  }
  if (FirstBgm) {
    const bgmSnippet: Snippet = {
      Action: SnippetAction.Sound,
      ProgressBehavior: SnippetProgressBehavior.Now,
      ReferenceIndex: SoundData.length,
      Delay: 0,
    };
    const soundData: SoundData = {
      PlayMode: SoundPlayMode.CrossFade,
      Bgm: FirstBgm,
      Se: "",
      Volume: 1,
      SeBundleName: "",
      Duration: 2.5,
    };
    Snippets.unshift(bgmSnippet);
    SoundData.push(soundData);
  }
  if (FirstLayout) {
    FirstLayout.forEach((l) => {
      const layoutSnippet: Snippet = {
        Action: SnippetAction.CharacterLayout,
        ProgressBehavior: SnippetProgressBehavior.Now,
        ReferenceIndex: LayoutData.length,
        Delay: 0,
      };
      const layoutData: LayoutData = {
        Type: CharacterLayoutType.Appear,
        SideFrom: l.PositionSide,
        SideFromOffsetX: l.OffsetX,
        SideTo: l.PositionSide,
        SideToOffsetX: l.OffsetX,
        DepthType: CharacterLayoutDepthType.Top,
        Character2dId: l.Character2dId,
        CostumeType: l.CostumeType,
        MotionName: l.MotionName,
        FacialName: l.FacialName,
        MoveSpeedType: CharacterLayoutMoveSpeedType.Normal,
      };
      Snippets.unshift(layoutSnippet);
      LayoutData.push(layoutData);
    });
  }
  return data;
}

export function useMediaUrlForLive2D() {
  const [chara2Ds] = useCachedData<ICharacter2D>("character2ds");

  return useCallback(
    async (info: IScenarioInfo, snData: IScenarioData) => {
      const ret: ILive2DAssetUrl[] = [];
      if (!chara2Ds) throw new Error("Characters not loaded. Please retry.");
      const voiceMap: {
        [key: string]: Record<string, string>;
      } = {};
      const { ScenarioId, Snippets, TalkData, SpecialEffectData, SoundData } =
        snData;
      const AssetbundleName = scenarioIdToAssetbundleName(ScenarioId);
      // get all urls
      for (const snippet of Snippets) {
        switch (snippet.Action) {
          case SnippetAction.Talk:
            {
              const talkData = TalkData[snippet.ReferenceIndex];
              // try get character
              let chara2d: ICharacter2D | undefined;
              if (talkData.TalkCharacters[0].Character2dId) {
                chara2d = chara2Ds.find(
                  (ch) => ch.id === talkData.TalkCharacters[0].Character2dId
                )!;
              }
              for (const v of talkData.Voices) {
                const url = await getTalkVoiceUrl(
                  voiceMap,
                  AssetbundleName,
                  talkData,
                  info.isCardStory,
                  info.isActionSet,
                  info.region,
                  chara2d
                );
                if (!ret.map((r) => r.url).includes(url))
                  ret.push({
                    identifier: v.VoiceId,
                    type: Live2DAssetType.Talk,
                    url,
                  });
              }
            }
            break;
          case SnippetAction.SpecialEffect:
            {
              const seData = SpecialEffectData[snippet.ReferenceIndex];
              switch (seData.EffectType) {
                case SpecialEffectType.ChangeBackground:
                  {
                    const identifier = seData.StringValSub;
                    const url = await getBackgroundImageUrl(
                      seData.StringValSub
                    );
                    if (ret.map((r) => r.url).includes(url)) continue;
                    ret.push({
                      identifier,
                      type: Live2DAssetType.BackgroundImage,
                      url,
                    });
                  }
                  break;
                case SpecialEffectType.FullScreenText:
                  {
                    const identifier = seData.StringValSub;
                    const url = await getFullScreenTextVoiceUrl(
                      AssetbundleName,
                      seData.StringValSub
                    );
                    if (ret.map((r) => r.url).includes(url)) continue;
                    ret.push({
                      identifier,
                      type: Live2DAssetType.Talk,
                      url,
                    });
                  }
                  break;
                case SpecialEffectType.Movie:
                  {
                    const identifier = seData.StringVal;
                    const url = await getMovieUrl(seData.StringVal);
                    if (ret.map((r) => r.url).includes(url)) continue;
                    ret.push({
                      identifier,
                      type: Live2DAssetType.Video,
                      url,
                    });
                  }
                  break;
              }
            }
            break;
          case SnippetAction.Sound:
            {
              const soundData = SoundData[snippet.ReferenceIndex];
              if (soundData.Bgm) {
                const identifier = soundData.Bgm;
                const url = await getBgmUrl(soundData.Bgm);
                if (ret.map((r) => r.url).includes(url)) continue;
                ret.push({
                  identifier,
                  type: Live2DAssetType.BackgroundMusic,
                  url,
                });
              } else if (soundData.Se) {
                const identifier = soundData.Se;
                const url = await getSoundEffectUrl(soundData.Se);
                if (ret.map((r) => r.url).includes(url)) continue;
                ret.push({
                  identifier,
                  type: Live2DAssetType.SoundEffect,
                  url,
                });
              }
            }
            break;
        }
      }
      return ret;
    },
    [chara2Ds]
  );
}

export async function getBgmUrl(bgm: string) {
  return await getRemoteAssetURL(
    `sound/scenario/bgm/${bgm}/${bgm}.mp3`,
    undefined,
    "minio"
  );
}

export async function getBackgroundImageUrl(img: string) {
  return await getRemoteAssetURL(
    `scenario/background/${img}/${img}.webp`,
    undefined,
    "minio"
  );
}

export async function getFullScreenTextVoiceUrl(
  ScenarioId: string,
  voice: string
) {
  return await getRemoteAssetURL(
    `sound/scenario/voice/${ScenarioId}/${voice}.mp3`,
    undefined,
    "minio"
  );
}
export function getMovieDirPath(movie: string) {
  // If contains opening, map it to movie/ only
  const basePath = movie.includes("opening") ? "movie" : "scenario/movie";
  return `${basePath}/${movie}/`;
}

export async function getMovieUrl(movie: string) {
  const dirPath = getMovieDirPath(movie);

  // Search for video files in the directory
  const videoFile = await searchVideoFileInDirectory(dirPath);
  if (videoFile) {
    return await getRemoteAssetURL(videoFile, undefined, "minio");
  }

  // Fallback to original logic if no video file found
  if (movie.includes("opening")) {
    return await getRemoteAssetURL(
      `movie/${movie}/${movie}.mp4`,
      undefined,
      "minio"
    );
  }
  return await getRemoteAssetURL(
    `scenario/movie/${movie}/${movie}.mp4`,
    undefined,
    "minio"
  );
}

async function searchVideoFileInDirectory(
  dirPath: string
): Promise<string | null> {
  try {
    const parser = new XMLParser({
      isArray: (name) => {
        if (["CommonPrefixes", "Contents"].includes(name)) return true;
        return false;
      },
    });

    const baseURL = assetUrl.minio.jp; // Default to JP region for video search
    const result = await Axios.get<string>(`/`, {
      baseURL,
      params: {
        delimiter: "/",
        "list-type": "2",
        "max-keys": "500",
        prefix: `${dirPath}`,
      },
      responseType: "text",
    });

    let parsed: IListBucketResult;
    try {
      parsed = parser.parse(result.data).ListBucketResult as IListBucketResult;
    } catch (parseError) {
      console.error(`XML parsing error in directory ${dirPath}:`, parseError);
      console.debug("Raw XML data:", result.data);
      return null;
    }

    if (parsed.Contents) {
      // Look for video files (mp4, webm, etc.)
      const videoFiles = parsed.Contents.map((content) => content.Key).filter(
        (key) => key.match(/\.(mp4|webm|mov|avi)$/i)
      );

      if (videoFiles.length > 0) {
        // Return the first video file found
        return videoFiles[0];
      }
    }

    return null;
  } catch (error) {
    console.warn(`Failed to search for video files in ${dirPath}:`, error);
    return null;
  }
}

export async function getSoundEffectUrl(se: string) {
  const isEventSe = se.startsWith("se_event");
  let baseDir;
  let seBundleName;

  if (isEventSe) {
    baseDir = `event_story/${se.split("_").slice(1, -1).join("_")}`;
    seBundleName = "scenario_se";
  } else {
    baseDir = "sound/scenario/se";
    seBundleName =
      /^se\d{5}$/.test(se) && parseInt(se.substring(2)) <= 528
        ? "se_pack00001" // Use 'se_pack00001' if SE ID between se00001 and se00528
        : "se_pack00001_b"; // Otherwise, use 'se_pack00001_b'
  }

  return await getRemoteAssetURL(
    `${baseDir}/${seBundleName}/${se}.mp3`,
    undefined,
    "minio"
  );
}

export async function getTalkVoiceUrl(
  voiceMap: {
    [key: string]: Record<string, string>;
  },
  ScenarioId: string,
  talkData: TalkData,
  isCardStory: boolean,
  isActionSet: boolean,
  region: ServerRegion,
  chara2d?: ICharacter2D
): Promise<string> {
  if (talkData.Voices.length) {
    const VoiceId = talkData.Voices[0].VoiceId;
    const voiceUrl = `sound/${isCardStory ? "card_" : ""}${
      isActionSet ? "actionset" : "scenario"
    }/voice/${ScenarioId}/${VoiceId}.mp3`;
    let fixedVoiceUrl = await fixVoiceUrl(voiceMap, region, VoiceId, voiceUrl);

    // if voice not found in scenario asset pack, check part_voice special case
    const isPartVoice = VoiceId.startsWith("partvoice");
    if (fixedVoiceUrl === null && isPartVoice) {
      // 1. if character is v2 or clb, check /voice/part_voice_${chara}/${VoiceId}.mp3
      // 2. if character is not v2 or clb, check /part_voice/${chara}/${VoiceId}.mp3
      // 3. if still not found, check /voice/part_voice_${chara}/${VoiceId}.mp3
      if (chara2d) {
        const chara = `${chara2d.assetName}_${chara2d.unit}`;
        if (chara.startsWith("v2_") || chara.startsWith("clb")) {
          const partVoiceUrl = `sound/scenario/voice/part_voice_${chara}/${VoiceId}.mp3`;
          fixedVoiceUrl = await fixVoiceUrl(
            voiceMap,
            region,
            VoiceId,
            partVoiceUrl
          );
        } else {
          const partVoiceUrl = `sound/scenario/part_voice/${chara}/${VoiceId}.mp3`;
          fixedVoiceUrl = await fixVoiceUrl(
            voiceMap,
            region,
            VoiceId,
            partVoiceUrl
          );
          if (fixedVoiceUrl === null) {
            const partVoiceUrl = `sound/scenario/voice/part_voice_${chara}/${VoiceId}.mp3`;
            fixedVoiceUrl = await fixVoiceUrl(
              voiceMap,
              region,
              VoiceId,
              partVoiceUrl
            );
          }
        }
      }
    }
    // Original codes
    // let voiceUrl = talkData.Voices.length
    //   ? `sound/${isCardStory ? "card_" : ""}${
    //       isActionSet ? "actionset" : "scenario"
    //     }/voice/${ScenarioId}/${talkData.Voices[0].VoiceId}.mp3`
    //   : "";
    // if (
    //   talkData.Voices.length &&
    //   talkData.Voices[0].VoiceId.startsWith("partvoice") &&
    //   !isActionSet
    // ) {
    //   const chara2d = chara2Ds.find(
    //     (ch) => ch.id === talkData.TalkCharacters[0].Character2dId
    //   );
    //   if (chara2d) {
    //     voiceUrl = `sound/scenario/part_voice/${chara2d.assetName}_${chara2d.unit}/${talkData.Voices[0].VoiceId}.mp3`;
    //   } else {
    //     voiceUrl = "";
    //   }
    // }
    return fixedVoiceUrl
      ? await getRemoteAssetURL(fixedVoiceUrl, undefined, "minio")
      : await getRemoteAssetURL(voiceUrl, undefined, "minio"); // wrong link, only for debug
  } else return "";
}

/**
 * fix typo in story model name.
 * rules see "map".
 */
function modelNameFix(info: IScenarioInfo, data: IScenarioData) {
  const story = info.storyId.split("/").slice(2).join("/");
  const map = [
    {
      // this is not typo, need to check why these black models are lost.
      story: "cardStory/17/1109/2121",
      map: [
        { from: "v2_14emu_casual_black", to: "v2_14emu_casual" },
        { from: "v2_15nene_casual_black", to: "v2_15nene_casual" },
        { from: "v2_01ichika_casual_black", to: "v2_01ichika_casual" },
        { from: "v2_03honami_casual_black", to: "v2_03honami_casual" },
      ],
    },
    //{ // this story is totally broken... cant fix
    //  story: "specialStory/2/1",
    //  map: [
    //    { from: "light_sound_a_normal", to: "21miku_normal" },
    //    { from: "light_sound_b_normal", to: "21miku_normal" },
    //    { from: "miku_normal", to: "21miku_normal" },
    //  ],
    //},
    {
      story: "eventStory/74/5",
      map: [{ from: "\\", to: "13tsukasa_unit" }],
    },
    {
      story: "cardStory/6/1057/2071",
      map: [{ from: "b", to: "v2_06haruka_lesson" }],
    },
    {
      story: "cardStory/25/1027/2012",
      map: [
        { from: "3", to: "v2_25meiko_normal" },
        { from: "1", to: "v2_25meiko_normal" },
      ],
    },
    {
      story: "areaTalk/7/1838",
      map: [{ from: "v2_v2_23len_idol", to: "v2_23len_idol" }],
    },
    {
      story: "areaTalk/7/1839",
      map: [{ from: "v2_v2_25meiko_idol", to: "v2_25meiko_idol" }],
    },
    {
      story: "areaTalk/13/1979",
      map: [{ from: "w-happy-nod05", to: "v2_01ichika_school01" }],
    },
  ].find((m) => m.story === story);
  if (map) {
    map.map.forEach((m) => {
      data.AppearCharacters.filter((c) => c.CostumeType === m.from).forEach(
        (c) => (c.CostumeType = m.to)
      );
      data.LayoutData.filter((l) => l.CostumeType === m.from).forEach(
        (l) => (l.CostumeType = m.to)
      );
      data.FirstLayout.filter((l) => l.CostumeType === m.from).forEach(
        (l) => (l.CostumeType = m.to)
      );
      // remove duplicate
      const uniqueCharacters = [
        ...new Set(data.AppearCharacters.map((c) => c.CostumeType)),
      ];
      data.AppearCharacters = uniqueCharacters.map(
        (c) => data.AppearCharacters.find((ap) => ap.CostumeType === c)!
      );
    });
  }
}

/**
 * fix typo in scenario id.
 * rules see "map".
 */
function scenarioIdToAssetbundleName(scenarioId: string) {
  let result = scenarioId;

  // Handle event number offset: if contains "event_" and number between 166 and 177, increment by 1
  const eventMatch = result.match(/event_(\d+)/);
  if (eventMatch) {
    const eventNumber = parseInt(eventMatch[1]);
    if (eventNumber > 166 && eventNumber < 177) {
      result = result.replace(/event_(\d+)/, `event_${eventNumber + 1}`);
    }
  }

  const map: Record<string, string> = {
    "areatalk03_266(20230607修正)": "areatalk03_266",
    "★4冬弥・泉_前半": "012043_touya01",
    "★4司・千秋_前半": "013042_tsukasa01",
    "★4類・夏目_後半": "016042_rui02",
    connect_live_collaboration_ensta_story: "collaboration_es_prequel_01",
    "ログインストーリー（OP）": "collaboration_es_op_01",
    "ログインストーリー（ED）": "collaboration_es_ed_01",
    connect_live_01_band: "connect_live_01_lon_01",
    connect_live_01_idol: "connect_live_01_mmj_01",
    connect_live_01_night: "connect_live_01_nig_01",
    story_connect_live_thanksgiving_4th_anv:
      "story_connect_live_4th_anniversary_01",
  };

  return map[result] || result;
}
