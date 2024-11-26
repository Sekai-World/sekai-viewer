import Axios from "axios";
import { Howl } from "howler";
import { assetUrl } from "../urls";
import { useCallback } from "react";
import { getRemoteAssetURL, useCachedData } from "..";
import {
  ServerRegion,
  Snippet,
  SnippetAction,
  SnippetProgressBehavior,
  SpecialEffectType,
  SpecialEffectData,
  SoundData,
  SoundPlayMode,
} from "../../types.d";
import type {
  IScenarioData,
  IUnitStory,
  IEventStory,
  ICharaProfile,
  ICardEpisode,
  ICardInfo,
  IActionSet,
  ISpecialStory,
} from "../../types.d";
import { useRootStore } from "../../stores/root";

import type {
  ILive2DCachedData,
  ILive2DDataUrls,
  ILive2DModelData,
  ILive2DControllerData,
  ILive2DModelDataCollection,
  IProgressEvent,
} from "./types.d";

import { PreloadQuene } from "./queue";

export function useLive2DScenarioUrl() {
  const [unitStories] = useCachedData<IUnitStory>("unitStories");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [actionSets] = useCachedData<IActionSet>("actionSets");
  const [specialStories] = useCachedData<ISpecialStory>("specialStories");

  return useCallback(
    async (storyType: string, storyId: string, region: ServerRegion) => {
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
              url: `scenario/unitstory/${chapter.assetbundleName}_rip/${episode.scenarioId}.asset`,
              isCardStory: false,
              isActionSet: false,
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
              url: `event_story/${chapter.assetbundleName}/scenario_rip/${episode.scenarioId}.asset`,
              isCardStory: false,
              isActionSet: false,
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
              url: `scenario/profile_rip/${episode.scenarioId}.asset`,
              isCardStory: false,
              isActionSet: false,
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
              if (region === "en")
                return {
                  url: `character/member_scenario/${assetbundleName}_rip/${episode.scenarioId}.asset`,
                  isCardStory: true,
                  isActionSet: false,
                };
              else
                return {
                  url: `character/member/${assetbundleName}_rip/${episode.scenarioId}.asset`,
                  isCardStory: true,
                  isActionSet: false,
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
              url: `scenario/actionset/group${Math.floor(episode.id / 100)}_rip/${
                episode.scenarioId
              }.asset`,
              isCardStory: false,
              isActionSet: true,
            };
          }
          break;
        case "specialStory":
          if (specialStories) {
            const [, , , spId, episodeNo] = storyId.split("/");
            const chapter = specialStories.find((sp) => sp.id === Number(spId));
            const episode = chapter?.episodes.find(
              (ep) => ep.episodeNo === Number(episodeNo)
            );
            return {
              url: `scenario/special/${chapter?.assetbundleName}_rip/${episode?.scenarioId}.asset`,
              isCardStory: false,
              isActionSet: false,
            };
          }
          break;
      }
    },
    [
      unitStories,
      eventStories,
      characterProfiles,
      cardEpisodes,
      actionSets,
      specialStories,
      cards,
    ]
  );
}
export function useProcessedLive2DScenarioData() {
  const { region } = useRootStore();

  return useCallback(
    async (scenarioPath: string) => {
      const { data }: { data: IScenarioData } = await Axios.get(
        await getRemoteAssetURL(scenarioPath, undefined, "minio", region),
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
      return data;
    },
    [region]
  );
}
async function getLive2DScenarioDataResourceUrls(
  snData: IScenarioData,
  isCardStory: boolean = false,
  isActionSet: boolean = false
): Promise<ILive2DDataUrls[]> {
  const ret: ILive2DDataUrls[] = [];
  if (!snData) return ret;
  const { ScenarioId, Snippets, TalkData, SpecialEffectData, SoundData } =
    snData;
  // get all urls
  for (const snippet of Snippets) {
    switch (snippet.Action) {
      case SnippetAction.Talk:
        {
          const talkData = TalkData[snippet.ReferenceIndex];
          const url = talkData.Voices.map((v) => ({
            identifer: v.VoiceId,
            type: "talk",
            url: `sound/${isCardStory ? "card_" : ""}${
              isActionSet ? "actionset" : "scenario"
            }/voice/${ScenarioId}_rip/${v.VoiceId}.mp3`,
          })) as ILive2DDataUrls[];
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
                const url = `scenario/background/${seData.StringValSub}_rip/${seData.StringValSub}.webp`;
                if (ret.map((r) => r.url).includes(url)) continue;
                ret.push({ identifer, type: "background", url });
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
            const url = `sound/scenario/bgm/${soundData.Bgm}_rip/${soundData.Bgm}.mp3`;
            if (ret.map((r) => r.url).includes(url)) continue;
            ret.push({ identifer, type: "backgroundmusic", url });
          } else if (soundData.Se) {
            const identifer = soundData.Se;
            const seBundleName = soundData.Se.endsWith("_b")
              ? "se_pack00001_b"
              : "se_pack00001";
            const url = `sound/scenario/se/${seBundleName}_rip/${soundData.Se}.mp3`;
            if (ret.map((r) => r.url).includes(url)) continue;
            ret.push({ identifer, type: "soundeffect", url });
          }
        }
        break;
    }
  }
  for (const r of ret) {
    r.url = await getRemoteAssetURL(r.url, undefined, "minio");
  }
  return ret;
}
export async function getLive2DControllerData(
  snData: IScenarioData,
  isCardStory: boolean = false,
  isActionSet: boolean = false,
  progress: IProgressEvent
): Promise<ILive2DControllerData> {
  // get urls
  const urls = await getLive2DScenarioDataResourceUrls(
    snData,
    isCardStory,
    isActionSet
  );
  // get model data
  const modelData = [];
  const total = snData.AppearCharacters.length;
  let count = 0;
  for (const c of snData.AppearCharacters) {
    count++;
    progress("model_data", count, total, c.CostumeType);
    const md = await getModelData(c.CostumeType);
    modelData.push({
      costume: c.CostumeType,
      cid: c.Character2dId,
      data: md,
      motions: md.FileReferences.Motions.Motion.map((m) => m.Name),
      expressions: md.FileReferences.Motions.Expression.map((e) => e.Name),
    });
  }
  // preload image and sounds
  const scenarioResource = await preloadLive2DScenarioData(urls, progress);
  return {
    scenarioData: snData,
    scenarioResource,
    modelData,
  };
}

function getMotionList(modelName: string): string {
  let motionName = modelName;
  if (!motionName.startsWith("v2_sub")) {
    if (motionName.endsWith("_black")) {
      motionName = motionName.slice(0, -6);
    } else if (motionName.endsWith("black")) {
      motionName = motionName.slice(0, -5);
    }
    if (
      motionName?.startsWith("sub") ||
      motionName?.startsWith("clb") ||
      motionName.match(/^v2_\d{2}.*/)
    ) {
      motionName = motionName.split("_").slice(0, 2).join("_");
    } else {
      motionName = motionName.split("_")[0]!;
    }
  }
  return motionName + "_motion_base";
}
async function getModelData(modelName: string): Promise<ILive2DModelData> {
  // preload texture, moc3, physics
  const { data: modelData } = await Axios.get<{
    Moc3FileName: string;
    TextureNames: string[];
    PhysicsFileName: string;
    UserDataFileName: string;
    AdditionalMotionData: unknown[];
    CategoryRules: unknown[];
  }>(
    `${assetUrl.minio.jp}/live2d/model/${modelName}_rip/buildmodeldata.asset`,
    { responseType: "json" }
  );
  // get motion data
  const motionName = getMotionList(modelName);
  let motionData;
  if (!modelName.startsWith("normal")) {
    const motionRes = await Axios.get<{
      motions: string[];
      expressions: string[];
    }>(
      `${assetUrl.minio.jp}/live2d/motion/${motionName}_rip/BuildMotionData.json`,
      { responseType: "json" }
    );
    motionData = motionRes.data;
  } else {
    motionData = {
      expressions: [],
      motions: [],
    };
  }
  // construct model
  const filename = modelData.Moc3FileName.replace(
    ".moc3.bytes",
    ".model3.json"
  );
  const model3Json = (
    await Axios.get(
      `${assetUrl.minio.jp}/live2d/model/${modelName}_rip/${filename}`
    )
  ).data;
  model3Json.url = `${assetUrl.minio.jp}/live2d/model/${modelName}_rip/`;
  model3Json.FileReferences.Moc = `${model3Json.FileReferences.Moc}.bytes`;
  model3Json.FileReferences.Motions = {
    Motion: motionData.motions.map((elem) => ({
      Name: elem,
      File: `../../motion/${motionName}_rip/${elem}.motion3.json`,
      FadeInTime: 0,
      FadeOutTime: 1,
    })),
    Expression: motionData.expressions.map((elem) => ({
      Name: elem,
      File: `../../motion/${motionName}_rip/${elem}.motion3.json`,
      FadeInTime: 0,
      FadeOutTime: 0,
    })),
  };
  model3Json.FileReferences.Expressions = {};
  return model3Json;
}
async function preloadModelAssets(
  modelData: ILive2DModelData,
  progress: IProgressEvent
) {
  progress("model_texture", 1, 1);
  await Axios.get(modelData.url + modelData.FileReferences.Textures[0]);
  progress("model_moc", 1, 1);
  await Axios.get(modelData.url + modelData.FileReferences.Moc);
  progress("model_physics", 1, 1);
  await Axios.get(modelData.url + modelData.FileReferences.Physics);
}
async function preloadModelMotion(
  scenarioData: IScenarioData,
  modelData: ILive2DModelDataCollection[],
  progress: IProgressEvent
) {
  const motion_list: {
    costume: string;
    motion: string;
  }[] = [];
  // gather all motions
  scenarioData.Snippets.forEach((snippet) => {
    switch (snippet.Action) {
      case SnippetAction.CharacerLayout:
      case SnippetAction.CharacterMotion:
        {
          const action = scenarioData.LayoutData[snippet.ReferenceIndex];
          if (action.CostumeType !== "") {
            if (action.MotionName !== "") {
              motion_list.push({
                costume: action.CostumeType,
                motion: action.MotionName,
              });
            }
            if (action.FacialName !== "") {
              motion_list.push({
                costume: action.CostumeType,
                motion: action.FacialName,
              });
            }
          } else {
            scenarioData.AppearCharacters.filter(
              (c) => c.Character2dId === action.Character2dId
            ).forEach((a) => {
              if (action.MotionName !== "") {
                motion_list.push({
                  costume: a.CostumeType,
                  motion: action.MotionName,
                });
              }
              if (action.FacialName !== "") {
                motion_list.push({
                  costume: a.CostumeType,
                  motion: action.FacialName,
                });
              }
            });
          }
        }
        break;
      case SnippetAction.Talk:
        {
          const action = scenarioData.TalkData[snippet.ReferenceIndex];
          if (action.Motions.length > 0) {
            const motion = action.Motions[0];
            scenarioData.AppearCharacters.filter(
              (c) => c.Character2dId === motion.Character2dId
            ).forEach((a) => {
              if (motion.MotionName !== "") {
                motion_list.push({
                  costume: a.CostumeType,
                  motion: motion.MotionName,
                });
              }
              if (motion.FacialName !== "") {
                motion_list.push({
                  costume: a.CostumeType,
                  motion: motion.FacialName,
                });
              }
            });
          }
        }
        break;
    }
  });
  // remove dupulicate
  const unique_motion: typeof motion_list = [];
  motion_list.forEach((m) => {
    if (
      !unique_motion.find(
        (u) => m.costume === u.costume && m.motion === u.motion
      )
    ) {
      unique_motion.push(m);
    }
  });
  // preload by axios
  const total = unique_motion.length;
  let count = 0;
  const queue = new PreloadQuene();
  for (const motion of unique_motion) {
    const model = modelData.find((m) => m.costume === motion.costume);
    if (model) {
      const all_motion = [
        ...model.data.FileReferences.Motions.Motion,
        ...model.data.FileReferences.Motions.Expression,
      ];

      const motion_url = all_motion.find(
        (m_url) => m_url.Name === motion.motion
      );
      if (motion_url) {
        await queue.wait();
        await queue.add(Axios.get(model.data.url + motion_url.File), () => {
          count++;
          progress(
            "model_motion",
            count,
            total,
            `${model.costume}/${motion_url.Name}`
          );
        });
      }
    }
  }
  await queue.all();
}
export async function preloadModels(
  controllerData: ILive2DControllerData,
  progress: IProgressEvent
) {
  let count = 0;
  const total = controllerData.modelData.length;
  for (const model of controllerData.modelData) {
    count++;
    await preloadModelAssets(model.data, (type) => {
      progress("model_assets", count, total, `${model.costume}/${type}`);
    });
  }
  await preloadModelMotion(
    controllerData.scenarioData,
    controllerData.modelData,
    progress
  );
}

function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}
function preloadSound(url: string): Promise<Howl> {
  return new Promise((resolve, reject) => {
    const sound = new Howl({
      src: [url],
      onload: () => resolve(sound),
      onloaderror: () => reject(new Error(`Failed to load sound: ${url}`)),
      loop: false,
    });
  });
}
async function preloadLive2DScenarioData(
  urls: ILive2DDataUrls[],
  progress: IProgressEvent
): Promise<ILive2DCachedData[]> {
  const queue = new PreloadQuene();
  const sounds = urls.filter(
    (u) =>
      u.type === "talk" ||
      u.type === "backgroundmusic" ||
      u.type === "soundeffect"
  );
  let total = sounds.length;
  let count = 0;
  for (const url of sounds) {
    await queue.wait();
    await queue.add(
      new Promise((resolve) => {
        preloadSound(url.url).then((data) => {
          resolve({ ...url, data });
        });
      }),
      () => {
        count++;
        progress("sound", count, total, url.identifer);
      }
    );
  }
  const images = urls.filter((u) => u.type === "background");
  total = images.length;
  count = 0;
  for (const url of images) {
    await queue.wait();
    await queue.add(
      new Promise((resolve) => {
        preloadImage(url.url).then((data) => {
          resolve({ ...url, data });
        });
      }),
      () => {
        count++;
        progress("image", count, total, url.identifer);
      }
    );
  }
  return (await queue.all()) as ILive2DCachedData[];
}
