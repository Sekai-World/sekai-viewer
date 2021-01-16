import Axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WebpMachine } from "webp-hero";
import PQueue from "p-queue";
import localforage from "localforage";
import {
  IGachaInfo,
  ICardInfo,
  IGameChara,
  IMusicInfo,
  ISkillInfo,
  ICardRarity,
  ICharacterRank,
  IMusicVocalInfo,
  IOutCharaProfile,
  IUserInformationInfo,
  IMusicDifficultyInfo,
  IMusicTagInfo,
  IReleaseCondition,
  IMusicDanceMembers,
  IEventInfo,
  IEventDeckBonus,
  IGameCharaUnit,
  IResourceBoxInfo,
  IHonorInfo,
  ICardEpisode,
  ContentTransModeType,
  ITipInfo,
  ICharaProfile,
  ICharacter2D,
  IMobCharacter,
  IMusicMeta,
  IScenarioData,
  IUnitProfile,
  IUnitStory,
  SnippetAction,
  SpecialEffectType,
  SnippetProgressBehavior,
  SoundPlayMode,
  IEventStory,
  IHonorMission,
  IBeginnerMission,
  ICharacterMission,
  IHonorGroup,
  INormalMission,
  IEventCard,
  IMusicAchievement,
  IGachaCeilItem,
  ICharacter3D,
  ICostume3DModel,
} from "./../types.d";
import { assetI18n, useAssetI18n } from "./i18n";
import { useLocation } from "react-router-dom";
import useSWR from "swr";
import CdnSource from "./cdnSource";

const webpMachine = new WebpMachine();

export function useRefState<S>(
  initialValue: S
): [S, React.MutableRefObject<S>, React.Dispatch<React.SetStateAction<S>>] {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  return [state, stateRef, setState];
}

export function useCachedData<
  T extends
    | IGachaInfo
    | ICardInfo
    | IGameChara
    | IMusicInfo
    | ISkillInfo
    | ICardRarity
    | ICharacterRank
    | IMusicVocalInfo
    | IOutCharaProfile
    | IUserInformationInfo
    | IMusicDifficultyInfo
    | IMusicTagInfo
    | IReleaseCondition
    | IMusicDanceMembers
    | IEventInfo
    | IEventDeckBonus
    | IGameCharaUnit
    | IResourceBoxInfo
    | IHonorInfo
    | ICardEpisode
    | ITipInfo
    | ICharaProfile
    | IUnitProfile
    | IUnitStory
    | IMobCharacter
    | ICharacter2D
    | IEventStory
    | IHonorMission
    | INormalMission
    | IBeginnerMission
    | IHonorGroup
    | ICharacterMission
    | IEventCard
    | IMusicAchievement
    | IGachaCeilItem
    | ICharacter3D
    | ICostume3DModel
>(name: string): [T[] | undefined, boolean, any] {
  // const [cached, cachedRef, setCached] = useRefState<T[]>([]);

  const fetchCached = useCallback(async (name: string) => {
    const { data }: { data: T[] } = await Axios.get(
      `${
        window.isChinaMainland
          ? process.env.REACT_APP_JSON_DOMAIN_CN + "/master"
          : "https://sekai-world.github.io/sekai-master-db-diff"
      }/${name}.json`
    );
    return data;
  }, []);

  const { data, error } = useSWR(name, fetchCached);

  return [data, !error && !data, error];
}

export const musicCategoryToName: { [key: string]: string } = {
  mv: "3D MV",
  original: "Original MV",
  sekai: "Sekai MV",
  image: "Static Image",
  mv_2d: "2D MV",
};

export const musicTagToName: { [key: string]: string } = {
  all: "All",
  vocaloid: assetI18n.t(`unit_profile:piapro.name`),
  light_music_club: assetI18n.t(`unit_profile:light_sound.name`),
  idol: assetI18n.t(`unit_profile:idol.name`),
  school_refusal: assetI18n.t(`unit_profile:school_refusal.name`),
  theme_park: assetI18n.t(`unit_profile:theme_park.name`),
  street: assetI18n.t(`unit_profile:street.name`),
  other: "Other",
};

export function useCharaName(contentTransMode: ContentTransModeType) {
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const { assetT, assetI18n } = useAssetI18n();

  return useCallback(
    (charaId: number): string | undefined => {
      if (!charas || !charas.length) return;
      const chara = charas.find((chara) => chara.id === charaId);
      const jpOrderCodes = ["zh-CN", "zh-TW", "ko", "ja", "id", "ms"];
      if (chara?.firstName) {
        switch (contentTransMode) {
          case "original":
            return `${chara.firstName} ${chara.givenName}`;
          case "translated":
            return jpOrderCodes.includes(assetI18n.language)
              ? `${assetT(
                  `character_name:${charaId}.firstName`,
                  chara.firstName
                )} ${assetT(
                  `character_name:${charaId}.givenName`,
                  chara.givenName
                )}`
              : `${assetT(
                  `character_name:${charaId}.givenName`,
                  chara.givenName
                )} ${assetT(
                  `character_name:${charaId}.firstName`,
                  chara.firstName
                )}`;
          case "both":
            return (
              `${chara.firstName} ${chara.givenName} | ` +
              (jpOrderCodes.includes(assetI18n.language)
                ? `${assetT(
                    `character_name:${charaId}.firstName`,
                    chara.firstName
                  )} ${assetT(
                    `character_name:${charaId}.givenName`,
                    chara.givenName
                  )}`
                : `${assetT(
                    `character_name:${charaId}.givenName`,
                    chara.givenName
                  )} ${assetT(
                    `character_name:${charaId}.firstName`,
                    chara.firstName
                  )}`)
            );
        }
      }
      return chara?.givenName;
    },
    [assetI18n.language, assetT, charas, contentTransMode]
  );
}

export function useMuisicMeta() {
  const fetchCached = useCallback(async (name: string) => {
    const { data }: { data: IMusicMeta[] } = await Axios.get(
      process.env.PUBLIC_URL + `/${name}.json`
    );
    //console.log(data.length);
    return data;
  }, []);

  const { data } = useSWR("metas", fetchCached);

  return [data];
}

const queue = new PQueue({ concurrency: 1 });
const cdnSource = new CdnSource();

export async function getRemoteAssetURL(
  endpoint: string,
  setFunc?: CallableFunction,
  cnDomain: boolean = false,
  minioDomain: boolean = false
): Promise<string> {
  const isWebpSupported = Modernizr.webplossless;
  const url = cdnSource.getRemoteAssetUrl(endpoint);

  if (endpoint.endsWith(".webp") && !isWebpSupported) {
    let dataUrl = await localforage.getItem<string>(url);
    if (!dataUrl) {
      const res = await Axios.get(url, { responseType: "arraybuffer" });
      dataUrl = await queue.add<string>(() =>
        webpMachine.decode(new Uint8Array(res.data))
      );
      await localforage.setItem(url, dataUrl);
      if (setFunc) setFunc(dataUrl);
      return dataUrl;
    } else {
      // await Axios.head(url);
      if (setFunc) setFunc(dataUrl);
      return dataUrl;
    }
  } else {
    // await Axios.head(url);
    if (setFunc) setFunc(url);
    return url;
  }
}

export function useProcessedScenarioData(
  contentTransMode: ContentTransModeType
) {
  const [mobCharas] = useCachedData<IMobCharacter>("mobCharacters");
  const [chara2Ds] = useCachedData<ICharacter2D>("character2ds");

  const getCharaName = useCharaName(contentTransMode);

  return useCallback(
    async (scenarioPath: string, isCardStory: boolean) => {
      const ret: {
        characters: { id: number; name: string }[];
        actions: { [key: string]: any }[];
      } = {
        characters: [],
        actions: [],
      };

      if (
        !chara2Ds ||
        !chara2Ds.length ||
        !mobCharas ||
        !mobCharas.length ||
        !scenarioPath
      )
        return ret;

      const { data }: { data: IScenarioData } = await Axios.get(
        await getRemoteAssetURL(scenarioPath),
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

      if (FirstBackground) {
        ret.actions.push({
          type: SnippetAction.SpecialEffect,
          isWait: SnippetProgressBehavior.WaitUnitilFinished,
          delay: 0,
          seType: "ChangeBackground",
          body: FirstBgm,
          resource: await getRemoteAssetURL(
            `scenario/background/${FirstBackground}_rip/${FirstBackground}.webp`
          ),
        });
      }
      if (FirstBgm) {
        ret.actions.push({
          type: SnippetAction.Sound,
          isWait: SnippetProgressBehavior.WaitUnitilFinished,
          delay: 0,
          playMode: SoundPlayMode[0],
          hasBgm: true,
          hasSe: false,
          bgm: await getRemoteAssetURL(
            `sound/scenario/bgm/${FirstBgm}_rip/${FirstBgm}.mp3`
          ),
          se: "",
        });
      }

      // eslint-disable-next-line array-callback-return
      ret.characters = AppearCharacters.map((ap) => {
        const chara2d = chara2Ds.find((ch) => ch.id === ap.Character2dId)!;
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
              name: mobCharas.find((mc) => mc.id === chara2d.characterId)!.name,
            };
          }
        }
      });

      for (let snippet of Snippets) {
        let action: { [key: string]: any } = {};
        switch (snippet.Action) {
          case SnippetAction.Talk:
            {
              const talkData = TalkData[snippet.ReferenceIndex];
              // try get character
              let chara = { id: 0, name: "" };
              if (talkData.TalkCharacters[0].Character2dId) {
                const chara2d = chara2Ds.find(
                  (ch) => ch.id === talkData.TalkCharacters[0].Character2dId
                )!;
                chara.id = chara2d.characterId;
              }
              chara.name = talkData.WindowDisplayName;
              let voiceUrl = talkData.Voices.length
                ? `sound/${
                    isCardStory ? "card_" : ""
                  }scenario/voice/${ScenarioId}_rip/${
                    talkData.Voices[0].VoiceId
                  }.mp3`
                : "";

              if (
                talkData.Voices.length &&
                talkData.Voices[0].VoiceId.startsWith("partvoice")
              ) {
                const chara2d = chara2Ds.find(
                  (ch) => ch.id === talkData.TalkCharacters[0].Character2dId
                )!;
                voiceUrl = `sound/scenario/part_voice/${chara2d.assetName}_${chara2d.unit}_rip/${talkData.Voices[0].VoiceId}.mp3`;
              }

              action = {
                type: snippet.Action,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                delay: snippet.Delay,
                chara,
                body: talkData.Body,
                voice: talkData.Voices.length
                  ? await getRemoteAssetURL(voiceUrl)
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
                type: snippet.Action,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                delay: snippet.Delay,
                seType: specialEffectType,
                body: specialEffect.StringVal,
                resource:
                  specialEffectType === "FullScreenText"
                    ? await getRemoteAssetURL(
                        `sound/scenario/voice/${ScenarioId}_rip/${specialEffect.StringValSub}.mp3`
                      )
                    : specialEffectType === "ChangeBackground"
                    ? await getRemoteAssetURL(
                        `scenario/background/${specialEffect.StringValSub}_rip/${specialEffect.StringValSub}.webp`
                      )
                    : specialEffectType === "Movie"
                    ? await getRemoteAssetURL(
                        `scenario/movie/${specialEffect.StringVal}_rip/${
                          specialEffect.StringVal.split("_")[0]
                        }.mp4`
                      )
                    : "",
              };
            }
            break;
          case SnippetAction.Sound:
            {
              const soundData = SoundData[snippet.ReferenceIndex];

              action = {
                type: snippet.Action,
                isWait:
                  snippet.ProgressBehavior ===
                  SnippetProgressBehavior.WaitUnitilFinished,
                delay: snippet.Delay,
                playMode: SoundPlayMode[soundData.PlayMode],
                hasBgm: !!soundData.Bgm,
                hasSe: !!soundData.Se,
                bgm: soundData.Bgm
                  ? await getRemoteAssetURL(
                      `sound/scenario/bgm/${soundData.Bgm}_rip/${soundData.Bgm}.mp3`
                    )
                  : "",
                se: soundData.Se
                  ? await getRemoteAssetURL(
                      `sound/scenario/se/se_pack00001_rip/${soundData.Se}.mp3`
                    )
                  : "",
              };
            }
            break;
          default: {
            action = {
              type: snippet.Action,
              isWait:
                snippet.ProgressBehavior ===
                SnippetProgressBehavior.WaitUnitilFinished,
              delay: snippet.Delay,
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

export function getJPTime() {
  return new Date()
    .toLocaleDateString("en-US", { timeZone: "Asia/Tokyo" })
    .split("/")
    .slice(0, 2)
    .join("/");
}

export function useQuery() {
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  return query;
}

export function getColorArray(num: number) {
  const result = [];
  for (let i = 0; i < num; i += 1) {
    const letters = "0123456789ABCDEF".split("");
    let color = "#";
    for (let j = 0; j < 6; j += 1) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    result.push(color);
  }
  return result;
}
