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
} from "../types.d";
import { ILive2DAssetUrl, Live2DAssetType } from "./Live2DPlayer/types.d";
import { useCharaName, useAssetI18n } from "./i18n";
import { charaIcons } from "./resources";

import { fixVoiceUrl } from "./voiceFinder";

interface IScenarioInfo {
  bannerUrl?: string;
  scenarioDataUrl: string;
  isCardStory: boolean;
  isActionSet: boolean;
  chapterTitle?: string;
  episodeTitle?: string;
  releaseConditionId?: number;
}

export function useScenarioInfo() {
  const [unitStories] = useCachedData<IUnitStory>("unitStories");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [actionSets] = useCachedData<IActionSet>("actionSets");
  const [specialStories] = useCachedData<ISpecialStory>("specialStories");
  const { getTranslated } = useAssetI18n();
  const { t } = useTranslation();

  return useCallback(
    async (
      storyType: string,
      storyId: string,
      region: ServerRegion
    ): Promise<IScenarioInfo | undefined> => {
      try {
        switch (storyType) {
          case "unitStory":
            if (unitStories) {
              const [, , , unitId, chapterNo, episodeNo] = storyId.split("/");

              const chapter = unitStories
                .find((us) => us.unit === unitId)!
                .chapters.find((ch) => ch.chapterNo === Number(chapterNo))!;

              const episode = chapter.episodes.find(
                (ep) => ep.episodeNo === Number(episodeNo)
              )!;
              return {
                bannerUrl: await getRemoteAssetURL(
                  `story/episode_image/${chapter.assetbundleName}_rip/${episode.assetbundleName}.webp`,
                  undefined,
                  "minio"
                ),
                scenarioDataUrl: `scenario/unitstory/${chapter.assetbundleName}_rip/${episode.scenarioId}.asset`,
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
              )!;

              const episode = chapter.eventStoryEpisodes.find(
                (ep) => ep.episodeNo === Number(episodeNo)
              )!;
              return {
                bannerUrl: await getRemoteAssetURL(
                  `event_story/${chapter.assetbundleName}/episode_image_rip/${episode.assetbundleName}.webp`,
                  undefined,
                  "minio"
                ),
                scenarioDataUrl: `event_story/${chapter.assetbundleName}/scenario_rip/${episode.scenarioId}.asset`,
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
              )!;

              return {
                bannerUrl: charaIcons[`CharaIcon${charaId}` as "CharaIcon1"],
                scenarioDataUrl: `scenario/profile_rip/${episode.scenarioId}.asset`,
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
              )!;
              let assetbundleName = episode.assetbundleName;
              if (!assetbundleName && !!cards) {
                const card = cards.find((card) => card.id === episode.cardId);
                if (card) {
                  assetbundleName = card.assetbundleName;
                }
              }

              if (assetbundleName) {
                return {
                  bannerUrl: `character/member_small/${assetbundleName}_rip/card_normal.webp`,
                  scenarioDataUrl:
                    region === "en"
                      ? `character/member_scenario/${assetbundleName}_rip/${episode.scenarioId}.asset`
                      : `character/member/${assetbundleName}_rip/${episode.scenarioId}.asset`,
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
              )!;

              return {
                bannerUrl: undefined,
                scenarioDataUrl: `scenario/actionset/group${Math.floor(episode.id / 100)}_rip/${
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
              const chapter = specialStories.find(
                (sp) => sp.id === Number(spId)
              );
              const episode = chapter?.episodes.find(
                (ep) => ep.episodeNo === Number(episodeNo)
              );

              return {
                bannerUrl: undefined,
                scenarioDataUrl: episode?.scenarioId.startsWith("op")
                  ? `scenario/special/${chapter?.assetbundleName}_rip/${episode?.scenarioId}.asset`
                  : `scenario/special/${episode?.assetbundleName}_rip/${episode?.scenarioId}.asset`,
                isCardStory: false,
                isActionSet: false,
                chapterTitle: chapter?.title || "",
                episodeTitle: episode?.title || "",
                releaseConditionId: undefined,
              };
            }
            break;
        }
      } catch (error) {
        throw new Error("failed to load episode");
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
    ]
  );
}

export function useProcessedScenarioDataForText() {
  const [mobCharas] = useCachedData<IMobCharacter>("mobCharacters");
  const [chara2Ds] = useCachedData<ICharacter2D>("character2ds");

  const getCharaName = useCharaName();

  return useCallback(
    async (info: IScenarioInfo, region: ServerRegion) => {
      const ret: {
        characters: { id: number; name: string }[];
        actions: { [key: string]: any }[];
      } = {
        actions: [],
        characters: [],
      };

      if (!chara2Ds || !chara2Ds.length || !info) return ret;

      const { data }: { data: IScenarioData } = await Axios.get(
        await getRemoteAssetURL(
          info.scenarioDataUrl,
          undefined,
          "minio",
          region
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
                      ScenarioId,
                      talkData,
                      info.isCardStory,
                      info.isActionSet,
                      region,
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
                        ScenarioId,
                        specialEffect.StringValSub
                      )
                    : specialEffectType === "ChangeBackground"
                      ? await getBackgroundImageUrl(specialEffect.StringValSub)
                      : specialEffectType === "Movie"
                        ? await getMovieUrl(specialEffect.StringVal)
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
  region: ServerRegion
) {
  const { data }: { data: IScenarioData } = await Axios.get(
    await getRemoteAssetURL(info.scenarioDataUrl, undefined, "minio", region),
    {
      responseType: "json",
    }
  );
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
    async (
      info: IScenarioInfo,
      snData: IScenarioData,
      region: ServerRegion
    ) => {
      const ret: ILive2DAssetUrl[] = [];
      if (!chara2Ds) throw new Error("Characters not loaded. Please retry.");
      const voiceMap: {
        [key: string]: Record<string, string>;
      } = {};
      const { ScenarioId, Snippets, TalkData, SpecialEffectData, SoundData } =
        snData;
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
              const url: ILive2DAssetUrl[] = [];
              for (const v of talkData.Voices) {
                url.push({
                  identifer: v.VoiceId,
                  type: Live2DAssetType.Talk,
                  url: await getTalkVoiceUrl(
                    voiceMap,
                    ScenarioId,
                    talkData,
                    info.isCardStory,
                    info.isActionSet,
                    region,
                    chara2d
                  ),
                });
              }
              for (const s of url)
                if (!ret.map((r) => r.url).includes(s.url)) ret.push(s);
            }
            break;
          case SnippetAction.SpecialEffect:
            {
              const seData = SpecialEffectData[snippet.ReferenceIndex];
              switch (seData.EffectType) {
                case SpecialEffectType.ChangeBackground:
                  {
                    const identifer = seData.StringValSub;
                    const url = await getBackgroundImageUrl(
                      seData.StringValSub
                    );
                    if (ret.map((r) => r.url).includes(url)) continue;
                    ret.push({
                      identifer,
                      type: Live2DAssetType.BackgroundImage,
                      url,
                    });
                  }
                  break;
                case SpecialEffectType.FullScreenText:
                  {
                    const identifer = seData.StringValSub;
                    const url = await getFullScreenTextVoiceUrl(
                      ScenarioId,
                      seData.StringValSub
                    );
                    if (ret.map((r) => r.url).includes(url)) continue;
                    ret.push({
                      identifer,
                      type: Live2DAssetType.Talk,
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
                const identifer = soundData.Bgm;
                const url = await getBgmUrl(soundData.Bgm);
                if (ret.map((r) => r.url).includes(url)) continue;
                ret.push({
                  identifer,
                  type: Live2DAssetType.BackgroundMusic,
                  url,
                });
              } else if (soundData.Se) {
                const identifer = soundData.Se;
                const url = await getSoundEffectUrl(soundData.Se);
                if (ret.map((r) => r.url).includes(url)) continue;
                ret.push({
                  identifer,
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
    `sound/scenario/bgm/${bgm}_rip/${bgm}.mp3`,
    undefined,
    "minio"
  );
}

export async function getBackgroundImageUrl(img: string) {
  return await getRemoteAssetURL(
    `scenario/background/${img}_rip/${img}.webp`,
    undefined,
    "minio"
  );
}

export async function getFullScreenTextVoiceUrl(
  ScenarioId: string,
  voice: string
) {
  return await getRemoteAssetURL(
    `sound/scenario/voice/${ScenarioId}_rip/${voice}.mp3`,
    undefined,
    "minio"
  );
}

export async function getMovieUrl(movie: string) {
  return await getRemoteAssetURL(
    `scenario/movie/${movie}_rip`,
    undefined,
    "minio"
  );
}

export async function getSoundEffectUrl(se: string) {
  const isEventSe = se.startsWith("se_event");
  const baseDir = isEventSe
    ? `event_story/${se.split("_").slice(1, -1).join("_")}`
    : "sound/scenario/se";
  const seBundleName = isEventSe
    ? "scenario_se"
    : se.endsWith("_b")
      ? "se_pack00001_b"
      : "se_pack00001";
  return await getRemoteAssetURL(
    `${baseDir}/${seBundleName}_rip/${se}.mp3`,
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
  let voiceUrl = "";
  if (talkData.Voices.length) {
    const VoiceId = talkData.Voices[0].VoiceId;
    const isPartVoice = VoiceId.startsWith("partvoice") && !isActionSet;
    if (isPartVoice) {
      // part_voice
      if (chara2d) {
        voiceUrl = `sound/scenario/part_voice/${chara2d.assetName}_${chara2d.unit}_rip/${VoiceId}.mp3`;
      }
    } else {
      // card, actionset, scenario
      voiceUrl = `sound/${isCardStory ? "card_" : ""}${
        isActionSet ? "actionset" : "scenario"
      }/voice/${ScenarioId}_rip/${VoiceId}.mp3`;
    }
    // Original codes
    // let voiceUrl = talkData.Voices.length
    //   ? `sound/${isCardStory ? "card_" : ""}${
    //       isActionSet ? "actionset" : "scenario"
    //     }/voice/${ScenarioId}_rip/${talkData.Voices[0].VoiceId}.mp3`
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
    //     voiceUrl = `sound/scenario/part_voice/${chara2d.assetName}_${chara2d.unit}_rip/${talkData.Voices[0].VoiceId}.mp3`;
    //   } else {
    //     voiceUrl = "";
    //   }
    // }
    return await getRemoteAssetURL(
      // Get asset list in directory
      await fixVoiceUrl(voiceMap, region, VoiceId, voiceUrl),
      undefined,
      "minio"
    );
  } else return "";
}
