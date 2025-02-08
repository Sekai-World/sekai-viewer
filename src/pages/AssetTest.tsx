import Axios from "axios";
import React, { useCallback, useRef, useLayoutEffect } from "react";
import { useCachedData, getRemoteAssetURL } from "../utils";
import { useRootStore } from "../stores/root";
import {
  useScenarioInfo,
  getProcessedScenarioDataForLive2D,
  useMediaUrlForLive2D,
  IScenarioInfo,
} from "../utils/storyLoader";
import {
  getBuildMotionDataUrl,
  getBuildModelDataUrl,
} from "../utils/live2dLoader";
import { PreloadQueue } from "../utils/Live2DPlayer/PreloadQueue";
import {
  IUnitStory,
  IUnitProfile,
  IEventStory,
  IEventInfo,
  ICharaProfile,
  ICardEpisode,
  ICardInfo,
  IActionSet,
  IArea,
  ISpecialStory,
  ServerRegion,
  IScenarioData,
  SnippetAction,
  AppearCharacter,
} from "../types.d";

declare global {
  interface Window {
    AssetTest: {
      assetList?: string[];
      storyExist?: {
        cantLoad: string[];
        storyNotExist: IScenarioInfo[];
        bannerNotExist: IScenarioInfo[];
        storyExist: IScenarioInfo[];
      };
      mediaNotExist?: {
        story: IScenarioInfo;
        notExist: string[];
      }[];
      mediaNotExistUnique?: string[];
      storyModels?: {
        id: string;
        models: AppearCharacter[];
        motions: ReturnType<typeof gather_story_motion>;
      }[];
      allModels?: Set<string>;
      allMotions?: Record<string, Set<string>>;
      modelNotExist?: string[];
      buildMotionUrls?: {
        model: string;
        url: string;
        baseName: string;
      }[];
      motionNotExist?: Record<string, string[]>;
    };
  }
}

// definations
const STATIC_SERVER = "/test-static";
const PATH_ASSET_LIST = "/asset_list-20250125.json";
const PATH_STORY_DIR = "/scenario_data/";
const PATH_MOTION_DIR = "/motion_data/";
const PATH_MEDIA_LOST = "/media_lost-20250128.json";
const PATH_MOTIONS = "/motions-20250207.json";
const REGION = "jp";
const convert_asset_url = (url: string) =>
  url.replace("/minio/sekai-jp-assets/", "");

function useAllScenario() {
  const [unitStories] = useCachedData<IUnitStory>("unitStories");
  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [events] = useCachedData<IEventInfo>("events");
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [actionSets] = useCachedData<IActionSet>("actionSets");
  const [areas] = useCachedData<IArea>("areas");
  const [specialStories] = useCachedData<ISpecialStory>("specialStories");
  const { region } = useRootStore();

  return useCallback(() => {
    const scenarioList: {
      storyType: string;
      storyId: string;
      region: ServerRegion;
    }[] = [];
    // eventStory -> components/story-selector/EventStory
    events?.forEach((ev) => {
      const eventId = ev.id;
      const chapter = eventStories?.find(
        (es) => es.eventId === Number(eventId)
      );
      chapter?.eventStoryEpisodes.forEach((episode) => {
        const episodeNo = episode.episodeNo;
        scenarioList.push({
          storyType: "eventStory",
          storyId: `/test/eventStory/${eventId}/${episodeNo}`,
          region,
        });
      });
    });
    // unitStory -> components/story-selector/UnitStory
    unitProfiles?.forEach((u) => {
      const unit = u.unit;
      const stories = unitStories?.find((us) => us.unit === unit);
      stories?.chapters.forEach((chapter) => {
        const chapterNo = chapter.chapterNo;
        chapter.episodes.forEach((episode) => {
          const episodeNo = episode.episodeNo;
          scenarioList.push({
            storyType: "unitStory",
            storyId: `/test/unitStory/${unit}/${chapterNo}/${episodeNo}`,
            region,
          });
        });
      });
    });
    // charaStory -> components/story-selector/CharaStory
    characterProfiles?.forEach((character) => {
      const charaId = character.characterId;
      scenarioList.push({
        storyType: "charaStory",
        storyId: `/test/charaStory/${charaId}`,
        region,
      });
    });
    // cardStory -> components/story-selector/CardStory
    characterProfiles?.forEach((character) => {
      const charaId = character.characterId;
      const filteredCards = cards?.filter(
        (card) => card.characterId === Number(charaId)
      );
      filteredCards?.forEach((card) => {
        const cardId = card.id;
        const episodes = cardEpisodes?.filter(
          (ce) => ce.cardId === Number(cardId)
        );
        episodes?.forEach((episode) => {
          const episodeId = episode.id;
          scenarioList.push({
            storyType: "cardStory",
            storyId: `/test/cardStory/${charaId}/${cardId}/${episodeId}`,
            region,
          });
        });
      });
    });
    // areaTalk -> components/story-selector/AreaTalk
    areas?.forEach((area) => {
      const areaId = area.id;
      actionSets
        ?.filter((as) => as.areaId === Number(areaId))
        .forEach((actionSet) => {
          const actionSetId = actionSet.id;
          scenarioList.push({
            storyType: "areaTalk",
            storyId: `/test/areaTalk/${areaId}/${actionSetId}`,
            region,
          });
        });
    });
    // specialStory -> components/story-selector/SpecialStory
    specialStories?.forEach((sp) => {
      const storyId = sp.id;
      const chapter = specialStories.find((sp) => sp.id === Number(storyId));
      chapter?.episodes.forEach((episode) => {
        const episodeNo = episode.episodeNo;
        scenarioList.push({
          storyType: "specialStory",
          storyId: `/test/specialStory/${storyId}/${episodeNo}`,
          region,
        });
      });
    });
    return scenarioList;
  }, [
    unitStories,
    unitProfiles,
    eventStories,
    events,
    characterProfiles,
    cardEpisodes,
    cards,
    actionSets,
    areas,
    specialStories,
    region,
  ]);
}

function gather_story_motion(scenarioData: IScenarioData) {
  const motion_list: {
    costume: string;
    motion: string;
    type: "motion" | "expression";
  }[] = [];
  // gather all motions
  scenarioData.Snippets.forEach((snippet) => {
    switch (snippet.Action) {
      case SnippetAction.CharacterLayout:
      case SnippetAction.CharacterMotion:
        {
          const action = scenarioData.LayoutData[snippet.ReferenceIndex];
          if (action.CostumeType !== "") {
            if (action.MotionName !== "") {
              motion_list.push({
                costume: action.CostumeType,
                motion: action.MotionName,
                type: "motion",
              });
            }
            if (action.FacialName !== "") {
              motion_list.push({
                costume: action.CostumeType,
                motion: action.FacialName,
                type: "expression",
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
                  type: "motion",
                });
              }
              if (action.FacialName !== "") {
                motion_list.push({
                  costume: a.CostumeType,
                  motion: action.FacialName,
                  type: "expression",
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
                  motion: motion.MotionName.replace(" ", ""), // deal with spaces in event_01_02
                  type: "motion",
                });
              }
              if (motion.FacialName !== "") {
                motion_list.push({
                  costume: a.CostumeType,
                  motion: motion.FacialName.replace(" ", ""), // deal with spaces in event_01_02
                  type: "expression",
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
        (u) =>
          m.costume === u.costume && m.motion === u.motion && m.type === u.type
      )
    ) {
      unique_motion.push(m);
    }
  });
  return motion_list;
}

function areSetsEqual(setA: Set<string>, setB: Set<string>) {
  if (setA.size !== setB.size) return false;
  for (const item of setA) if (!setB.has(item)) return false;
  return true;
}

const Main: React.FC = () => {
  if (!window.AssetTest) window.AssetTest = {};
  const paper = useRef<HTMLCanvasElement>(null);

  const getAllScenario = useAllScenario();
  const getScenarioInfo = useScenarioInfo();
  const getMediaUrlForLive2D = useMediaUrlForLive2D();

  /**
   * load asset to AssetTest.assetList
   * from PATH_ASSET_LIST
   */
  const load_asset_list = async () => {
    console.log("load asset list start.");
    const res = await Axios.get(STATIC_SERVER + PATH_ASSET_LIST, {
      responseType: "json",
    });
    window.AssetTest.assetList = res.data.map((d: string[]) => d[1]);
    console.log("load asset list finish.");
  };
  const load_story_scenario_data = async (
    scenario: IScenarioInfo,
    region: ServerRegion
  ) => {
    let data: IScenarioData | undefined;
    try {
      const res: { data: IScenarioData } = await Axios.get(
        STATIC_SERVER +
          PATH_STORY_DIR +
          scenario.scenarioDataUrl.replace(/\//g, "-"),
        { responseType: "json" }
      );
      data = res.data;
    } catch (error) {
      console.log(`${scenario.scenarioDataUrl} not in local. skip.`);
    }
    if (data) {
      const processed = await getProcessedScenarioDataForLive2D(
        scenario,
        region,
        data
      );
      return processed;
    }
  };
  const get_all_stories = async () => {
    const stories = getAllScenario();
    const rst = [];
    for (const story of stories) {
      try {
        const info = await getScenarioInfo(
          story.storyType,
          story.storyId,
          story.region
        );
        if (info)
          rst.push(
            (
              await getRemoteAssetURL(info.scenarioDataUrl, undefined, "minio")
            ).replace("/minio", "https://storage.sekai.best")
          );
      } catch (err) {
        console.log(err);
      }
    }
    console.log(rst);
  };
  /**
   * check every story
   * to AssetTest.storyExist
   */
  const check_stories_exist = async () => {
    if (!window.AssetTest.assetList) {
      console.log("asset list not load.");
      return;
    }
    window.AssetTest.storyExist = {
      cantLoad: [],
      storyNotExist: [],
      bannerNotExist: [],
      storyExist: [],
    };
    const all = getAllScenario();
    for (const scenario of all) {
      let sc;
      try {
        sc = await getScenarioInfo(
          scenario.storyType,
          scenario.storyId,
          scenario.region
        );
      } catch (error) {
        window.AssetTest.storyExist.cantLoad.push(scenario.storyId);
      }
      if (sc) {
        let flag = true;
        if (!window.AssetTest.assetList.includes(sc.scenarioDataUrl)) {
          window.AssetTest.storyExist.storyNotExist.push(sc);
          flag = false;
        }
        if (
          sc.bannerUrl &&
          !window.AssetTest.assetList.includes(convert_asset_url(sc.bannerUrl))
        ) {
          window.AssetTest.storyExist.bannerNotExist.push(sc);
          flag = false;
        }
        if (flag) window.AssetTest.storyExist.storyExist.push(sc);
      }
    }
    console.log("story can't load:", window.AssetTest.storyExist.cantLoad);
    console.log("story not exist", window.AssetTest.storyExist.storyNotExist);
    console.log("banner not exist", window.AssetTest.storyExist.bannerNotExist);
  };
  /**
   * check every story if media exist
   * to AssetTest.mediaNotExist
   */
  const check_story_media_all = async () => {
    if (!window.AssetTest.assetList || !window.AssetTest.storyExist) {
      console.log("asset list not load / story not check.");
      return;
    }
    let c = 0;
    window.AssetTest.mediaNotExist = [];
    const total = window.AssetTest.storyExist.storyExist.length;
    const queue = new PreloadQueue<
      | {
          story: IScenarioInfo;
          notExist: string[];
        }
      | undefined
    >();
    for (const sc of window.AssetTest.storyExist.storyExist) {
      await queue.wait();
      await queue.add(
        new Promise((resolve) => {
          check_story_media(sc).then((rst) => {
            c++;
            console.log(`total: ${total}, progress: ${c}`);
            if (rst.length > 0) {
              const r = {
                story: sc,
                notExist: rst,
              };
              window.AssetTest.mediaNotExist!.push(r);
              resolve(r);
            } else resolve(undefined);
          });
        })
      );
    }
    const rst = (await queue.all()).filter((r) => !!r);
    window.AssetTest.mediaNotExist = rst;
    console.log(`total: ${total}, progress: ${c}, media not exist: `, rst);
  };
  const check_story_media = async (
    scenario: IScenarioInfo
  ): Promise<string[]> => {
    const not_exist = [];
    const processed = await load_story_scenario_data(scenario, REGION);
    if (processed) {
      const mediaUrl = await getMediaUrlForLive2D(scenario, processed, REGION);
      // check
      for (const m of mediaUrl) {
        if (!window.AssetTest.assetList!.includes(convert_asset_url(m.url)))
          not_exist.push(convert_asset_url(m.url));
      }
    }
    return not_exist;
  };
  /**
   * load all media lost and remove duplicate
   * from PATH_MEDIA_LOST or memory
   * to AssetTest.mediaNotExistUnique
   */
  const unique_media_lost = async () => {
    console.log("load media lost start.");
    if (!window.AssetTest.mediaNotExist) {
      const res = await Axios.get(STATIC_SERVER + PATH_MEDIA_LOST, {
        responseType: "json",
      });
      window.AssetTest.mediaNotExist = res.data;
    }
    console.log("load media lost finish.");
    const rst = window.AssetTest.mediaNotExist!.reduce((prev, curr) => {
      prev.push(...curr.notExist);
      return prev;
    }, [] as string[]);
    window.AssetTest.mediaNotExistUnique = [...new Set(rst)];
    window.AssetTest.mediaNotExistUnique.sort();
  };
  /**
   * gather all models and corresponding motions in every story
   * to AssetTest.storyModels
   */
  const gather_models_in_story = async () => {
    if (!window.AssetTest.assetList || !window.AssetTest.storyExist) {
      console.log("asset list not load / story not check.");
      return;
    }
    window.AssetTest.storyModels = [];
    for (const story of window.AssetTest.storyExist.storyExist) {
      try {
        const info = await get_story_model(story);
        if (info) window.AssetTest.storyModels.push(info);
        else console.log(`${story.scenarioDataUrl} error.`);
      } catch (err) {
        console.log(err);
      }
    }
    console.log(window.AssetTest.storyModels);
  };
  const get_story_model = async (scenario: IScenarioInfo) => {
    const processed = await load_story_scenario_data(scenario, REGION);
    if (processed) {
      // get model
      const models = processed.AppearCharacters;
      const motions = gather_story_motion(processed);
      return { id: scenario.scenarioDataUrl, models, motions };
    }
  };
  /**
   * gather all models and motions and remove duplicate
   * from PATH_MOTIONS or memory
   * to AssetTest.allModels/AssetTest.allMotions
   */
  const gather_models_motions = async () => {
    console.log("load motions start.");
    if (!window.AssetTest.storyModels) {
      const res = await Axios.get(STATIC_SERVER + PATH_MOTIONS, {
        responseType: "json",
      });
      window.AssetTest.storyModels = res.data;
    }
    console.log("load motions finish.");

    const models: Set<string> = new Set();
    window.AssetTest.storyModels!.forEach((m) => {
      m.models.map((model) => model.CostumeType).forEach((c) => models.add(c));
    });

    const models_from_motions: Set<string> = new Set();
    window.AssetTest.storyModels!.forEach((m) => {
      m.motions
        .map((motion) => motion.costume)
        .forEach((c) => models_from_motions.add(c));
    });
    console.log("models in AppearCharacter:", models);
    console.log("models in all snippet:", models_from_motions);
    console.log("are those equal?:", areSetsEqual(models, models_from_motions));
    window.AssetTest.allModels = models;

    window.AssetTest.allMotions = {};
    window.AssetTest.storyModels!.forEach((m) => {
      m.motions.forEach((motion) => {
        if (window.AssetTest.allMotions![motion.costume])
          window.AssetTest.allMotions![motion.costume].add(motion.motion);
        else
          window.AssetTest.allMotions![motion.costume] = new Set([
            motion.motion,
          ]);
      });
    });
    console.log(
      "all motions corresponding to model",
      window.AssetTest.allMotions
    );
  };
  const check_model_exist = async () => {
    window.AssetTest.modelNotExist = [];
    if (!window.AssetTest.assetList || !window.AssetTest.allModels) {
      console.log("asset list not load / models not load.");
      return;
    }
    // check models not exist
    for (const m of window.AssetTest.allModels) {
      const url = convert_asset_url(await getBuildModelDataUrl(m));
      if (!window.AssetTest.assetList.includes(url))
        window.AssetTest.modelNotExist.push(url);
    }
    console.log("models not exist:", window.AssetTest.modelNotExist);
  };
  const get_motion_data_url = async () => {
    if (
      !window.AssetTest.assetList ||
      !window.AssetTest.allMotions ||
      !window.AssetTest.modelNotExist
    ) {
      console.log("asset list not load / models not load / models not check.");
      return;
    }
    // check build motion data exist
    window.AssetTest.buildMotionUrls = [];
    for (const model of Object.keys(window.AssetTest.allMotions)) {
      if (
        window.AssetTest.modelNotExist.includes(
          convert_asset_url(await getBuildModelDataUrl(model))
        )
      )
        continue;
      try {
        const [url, baseName] = await getBuildMotionDataUrl(model);
        window.AssetTest.buildMotionUrls.push({
          model,
          url,
          baseName,
        });
      } catch (err) {
        console.log(`${model} motion data not found.`);
      }
    }
    // check all motion data
    console.log([
      ...new Set(
        window.AssetTest.buildMotionUrls.map((m) =>
          m.url.replace("/minio", "https://storage.sekai.best")
        )
      ),
    ]);
  };
  const check_motion_exist = async () => {
    if (
      !window.AssetTest.assetList ||
      !window.AssetTest.allMotions ||
      !window.AssetTest.buildMotionUrls
    ) {
      console.log(
        "asset list not load / models not load / motion url not check."
      );
      return;
    }
    window.AssetTest.motionNotExist = {};
    for (const model of window.AssetTest.buildMotionUrls) {
      let data:
        | {
            expressions: string[];
            motions: string[];
          }
        | undefined;
      try {
        const res = await Axios.get(
          STATIC_SERVER +
            PATH_MOTION_DIR +
            convert_asset_url(model.url).replace(/\//g, "-"),
          { responseType: "json" }
        );
        data = res.data;
      } catch (error) {
        console.log(`${convert_asset_url(model.url)} not in local. skip.`);
      }
      if (data) {
        for (const motion of window.AssetTest.allMotions[model.model]) {
          if (
            !(
              data.motions.includes(motion) || data.expressions.includes(motion)
            )
          ) {
            if (window.AssetTest.motionNotExist[model.model])
              window.AssetTest.motionNotExist[model.model].push(motion);
            else window.AssetTest.motionNotExist[model.model] = [motion];
          }
        }
      }
    }
    console.log(window.AssetTest.motionNotExist);
  };

  // define buttons and arrows
  const workflow = [
    {
      display: "Get download url for stories",
      name: "get_all_stories_url",
      click: get_all_stories,
      position: [0, 0],
      point: [],
      color: "#000000",
      fontWeight: "normal",
    },
    {
      display: "Load asset list",
      name: "load_asset_list",
      click: load_asset_list,
      position: [0, 0.5],
      point: [],
      color: "#000000",
      fontWeight: "normal",
    },
    {
      display: "Check if story exists",
      name: "check_stories_exist",
      click: check_stories_exist,
      position: [0.13, 0.2],
      point: ["load_asset_list"],
      color: "#ee0000",
      fontWeight: "bold",
    },
    {
      display: "Check if the media files in the story exist",
      name: "check_story_media_all",
      click: check_story_media_all,
      position: [0.3, 0.1],
      point: ["load_asset_list", "check_stories_exist", "get_all_stories_url"],
      color: "#ee0000",
      fontWeight: "bold",
    },
    {
      display: "Gather all lost media urls for debug",
      name: "unique_media_lost",
      click: unique_media_lost,
      position: [0.5, 0.1],
      point: ["check_story_media_all"],
      color: "#000000",
      fontWeight: "normal",
    },
    {
      display: "Gather all models by stories",
      name: "gather_models_in_story",
      click: gather_models_in_story,
      position: [0.3, 0.6],
      point: ["load_asset_list", "check_stories_exist", "get_all_stories_url"],
      color: "#000000",
      fontWeight: "normal",
    },
    {
      display: "Gather all motions by stories",
      name: "gather_models_motions",
      click: gather_models_motions,
      position: [0.45, 0.6],
      point: ["gather_models_in_story"],
      color: "#000000",
      fontWeight: "normal",
    },
    {
      display: "Check if model exists",
      name: "check_model_exist",
      click: check_model_exist,
      position: [0.6, 0.3],
      point: ["load_asset_list", "gather_models_motions"],
      color: "#ee0000",
      fontWeight: "bold",
    },
    {
      display: "Get download url for motions",
      name: "get_motion_data_url",
      click: get_motion_data_url,
      position: [0.75, 0.4],
      point: ["load_asset_list", "gather_models_motions", "check_model_exist"],
      color: "#000000",
      fontWeight: "normal",
    },
    {
      display: "Check if motion exists",
      name: "check_motion_exist",
      click: check_motion_exist,
      position: [0.9, 0.5],
      point: [
        "load_asset_list",
        "gather_models_motions",
        "get_motion_data_url",
      ],
      color: "#ee0000",
      fontWeight: "bold",
    },
  ];
  const processed_workflow = workflow
    .map((w) => {
      const position = w.position.map((p) => `${p * 100}%`);
      return { ...w, position };
    })
    .map((w) => {
      const point = w.point.map(
        (p) => workflow.find((w) => w.name === p)!.position
      );
      return { ...w, point };
    });
  const processed_workflow_for_arrow = workflow.map((w) => {
    const point = w.point.map(
      (p) => workflow.find((w) => w.name === p)!.position
    );
    return { ...w, point };
  });
  // draw arrows
  useLayoutEffect(() => {
    const margin = 0.003;
    const button_width = 0.1;
    const button_height = 0.12;
    if (paper.current) {
      const ctx = paper.current.getContext("2d");
      const size = [paper.current.width, paper.current.height];
      if (ctx) {
        processed_workflow_for_arrow.forEach((w) => {
          w.point.forEach((p) => {
            const x2 = (w.position[0] - margin) * size[0];
            const y2 = (w.position[1] + button_height / 2) * size[1];
            const x1 = (p[0] + button_width + margin) * size[0];
            const y1 = (p[1] + button_height / 2) * size[1];
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = size[0] * 0.0015;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            const angle = Math.atan2(y2 - y1, x2 - x1);
            const length = size[0] * 0.012;

            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(
              x2 - length * Math.cos(angle - Math.PI / 10),
              y2 - length * Math.sin(angle - Math.PI / 10)
            );
            ctx.lineTo(
              x2 - length * Math.cos(angle + Math.PI / 10),
              y2 - length * Math.sin(angle + Math.PI / 10)
            );
            ctx.closePath();
            ctx.fillStyle = "#000000";
            ctx.fill();
          });
        });
      }
    }
    return () => {
      if (paper.current) {
        const ctx = paper.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, paper.current.width, paper.current.height);
      }
    };
  }, [processed_workflow_for_arrow]);
  return (
    <>
      <div style={{ aspectRatio: "16/9", width: "100%", position: "relative" }}>
        <canvas
          width={1600}
          height={900}
          ref={paper}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        ></canvas>
        {processed_workflow.map((w) => (
          <button
            style={{
              width: "10%",
              height: "12%",
              position: "absolute",
              left: w.position[0],
              top: w.position[1],
              overflowWrap: "break-word",
              color: w.color,
              fontWeight: w.fontWeight,
            }}
            onClick={w.click}
            key={w.name}
          >
            {w.display}
          </button>
        ))}
      </div>
      <div>
        <h2>This page is debug only.</h2>
        <h3>Introduction</h3>
        <p>Please open console to get output.</p>
        <p>
          This page has four functions, as shown in the red text in the graph
          above.
        </p>
        <ol>
          <li>
            <b>Check if story exists: </b>Check all stories defined in
            sekai-db-diff exists, will output(window.AssetTest.storyExist)
            stories that cant find in asset list.
          </li>
          <li>
            <b>Check if the media files in the story exist: </b>Check if the
            dialogue voices, sound effects, BGM, and background images required
            for each story are available. Will
            output(window.AssetTest.mediaNotExist) the lost medias of each
            story.
          </li>
          <li>
            <b>Check if model exists: </b>Check if the models required for each
            story are available. Will output(window.AssetTest.modelNotExist) the
            lost models of each story.
          </li>
          <li>
            <b>Check if motion exists: </b>Check if the motions required for
            each model in each story are available. Will
            output(window.AssetTest.motionNotExist) the lost motions of each
            model.
          </li>
        </ol>
        <h3>Get ready</h3>
        <p>
          Create a local web server on port 8000 to host necessary files. Check
          denifinitions in <b>AssetTest.tsx</b>.
        </p>
        <p>
          Comment bellow codes in <b>index.tsx</b> to not use service work(or
          memory will overflow)
        </p>
        <pre>{`if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser.js");
  await worker.start();
}`}</pre>
        <h3>Step1: Prepare asset list</h3>
        <p>
          The asset list is a list for all the asset in minio. File type json.
          Save to <b>{PATH_ASSET_LIST}</b>
        </p>
        <p>example:</p>
        <pre>{`[
  ["sekai-jp-assets", "actionset/group0_rip/as_2_007.asset", "2024-05-28 12:42:25", "4246"],
  ["sekai-jp-assets", "actionset/group0_rip/as_2_008.asset", "2024-05-28 12:42:25", "4265"]
]`}</pre>
        <p>This test page will only use assetList[][1], aka file name.</p>
        <p>Python code to download assetList (may take more than 2 hours):</p>
        <pre>{`from minio import Minio
import datetime
client = Minio("storage.sekai.best", secure=True)
objects = client.list_objects(
    "sekai-jp-assets",
    recursive=True
)
c = 0
rst = []
for obj in objects:
    rst.append(obj)
    c += 1
    if c % 1000 == 0:
        print(c)
db = []
for o in rst:
    if (o.is_dir):
        continue
    db.append([
      o.bucket_name,
      o.object_name,
      o.last_modified.strftime("%Y-%m-%d %H:%M:%S"),
      o.size,
    ])
with open("asset_list.json", "w") as f:
    json.dump(db, f)`}</pre>
        <h3>Step2: Download all story definitions</h3>
        <p>
          Click <b>Get download url for stories</b>, and download all the link,
          and rename it like:{" "}
          <b>character-member-res001_no002_rip-001002_ichika02.asset</b>(replace
          `&quot;/`&quot; with `&quot;-`&quot;)
        </p>
        <p>
          save to dir: <b>{PATH_STORY_DIR}</b>
        </p>
        <p>Python code to download these urls (may take more than 2 hours):</p>
        <pre>{`import requests, os, json
input_json = 'download_list.json'
output_dir = 'scenario_data'

urls = json.load(open(input_json, 'r'))
for url in urls:
    fn = os.path.join(
        output_dir,
        url
            .replace('https://storage.sekai.best/sekai-jp-assets/', '')
            .replace('/', '-')
    )
    if os.path.isfile(fn):
        continue
    res = requests.get(
        url,
        headers = {
            'User-Agent': 'Python/3.12.2 <your name name@your.email>'
        },
        proxies = {
            'http': 'http://127.0.0.1:1080',
            'https': 'http://127.0.0.1:1080',
        }
    )
    if res.status_code == 200:
        with open(fn, 'w') as f:
            f.write(res.text)
        print(f'{url} success')
    else:
        print(f'{url} fail')`}</pre>
        <p>
          After click <b>Get download url for motions</b>, all the output urls
          need to be download as well. Same codes as before, save them to{" "}
          <b>{PATH_MOTION_DIR}</b>
        </p>
        <h3>Step3: Click the buttons in the order of the arrows and check!</h3>
        <h3>Step4: Important Note</h3>
        <p>Some steps take a lot of time. Such as:</p>
        <ul>
          <li>
            <b>Check if the media files in the story exist: </b>This step may
            take 30 minutes. The output of this step should be save to{" "}
            <b>{PATH_MEDIA_LOST}</b>, and next time you can just skip this step
            to click <b>Gather all lost media urls for debug</b>.
          </li>
          <li>
            <b>Gather all models by stories: </b>This step may take 30 minutes.
            The output of this step should be save to <b>{PATH_MOTIONS}</b>, and
            next time you can just skip this step to click{" "}
            <b>Gather all motions by stories</b>.
          </li>
        </ul>
      </div>
    </>
  );
};

export default Main;
