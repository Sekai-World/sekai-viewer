/* eslint-disable no-lone-blocks */
import { Alert, Box, Button, Container, Grid, Typography } from "@mui/material";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../../styles/layout";
import {
  IUnitStory,
  IEventStory,
  SnippetAction,
  ICharaProfile,
  ICardEpisode,
  IActionSet,
  ISpecialStory,
  SpecialEffectType,
  LayoutType,
} from "../../types.d";
import {
  getRemoteAssetURL,
  useAlertSnackbar,
  useCachedData,
  useProcessedScenarioDataForLive2d,
} from "../../utils";
import { charaIcons } from "../../utils/resources";
import { useAssetI18n } from "../../utils/i18n";
import Live2D from "@sekai-world/find-live2d-v3";

import Axios from "axios";
import * as PIXI from "pixi.js";

import { Stage } from "@inlet/react-pixi";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import {
  Live2DModel,
  MotionPreloadStrategy,
  MotionPriority,
  config,
  // @ts-ignore
} from "pixi-live2d-display/dist/cubism4";
import { useHistory } from "react-router-dom";

const live2dInstance = new Live2D();

(window as any).PIXI = PIXI;

config.idleMotionFadingDuration = 0;

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

const StoryReaderContentLive2d: React.FC<{
  storyType: string;
  storyId: string;
}> = ({ storyType, storyId }) => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const getProcessedScenarioDataForLive2d = useProcessedScenarioDataForLive2d();
  const { showError } = useAlertSnackbar();

  const [unitStories] = useCachedData<IUnitStory>("unitStories");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [actionSets] = useCachedData<IActionSet>("actionSets");
  const [specialStories] = useCachedData<ISpecialStory>("specialStories");

  const [bannerUrl, setBannerUrl] = useState<string>("");

  const [chapterTitle, setChapterTitle] = useState<string>("");
  const [episodeTitle, setEpisodeTitle] = useState<string>("");
  const [scenarioData, setScenarioData] = useState<{
    characters: {
      id: number;
      name: string;
    }[];
    actions: {
      [key: string]: any;
    }[];
    resourcesNeed: Set<string>;
    motionsNeed: Map<number, Set<string>>;
  }>({
    characters: [],
    actions: [],
    resourcesNeed: new Set(),
    motionsNeed: new Map(),
  });

  const [releaseConditionId, setReleaseConditionId] = useState<number>(0);
  const [actionsLength, setActionsLength] = useState<number>(0);
  // const [currentActionIndex, setCurrentActionIndex] = useState<number>(0);
  const actionIndex = useRef<number>(-1);
  const [currentLive2dModelIndex, setCurrentLive2dModelIndex] =
    useState<number>(0);

  const voiceAudioPlayer = useMemo(() => new Audio(), []);
  const seAudioPlayer = useMemo(() => new Audio(), []);
  const bgmAudioPlayer = useMemo(() => new Audio(), []);

  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage>(null);

  const [pixiApp, setPixiApp] = useState<PIXI.Application>();

  const [progressWords, setProgressWords] = useState("");

  const [showButtonEnable, setShowButtonEnable] = useState(true);

  const history = useHistory();

  // const pixiApp = new PIXI.Application({
  //   width: 1024,
  //   height: 631,
  //   autoStart: false,
  //   resizeTo: wrap.current!,
  // });
  useEffect(() => {
    setScenarioData({
      characters: [],
      actions: [],
      resourcesNeed: new Set(),
      motionsNeed: new Map(),
    });
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

            getRemoteAssetURL(
              `story/episode_image/${chapter.assetbundleName}_rip/${episode.assetbundleName}.webp`,
              setBannerUrl,
              window.isChinaMainland ? "cn" : "ww"
            );
            getProcessedScenarioDataForLive2d(
              `scenario/unitstory/${chapter.assetbundleName}_rip/${episode.scenarioId}.asset`,
              false
            ).then((data) => setScenarioData(data));

            setChapterTitle(
              getTranslated(
                `unit_story_chapter_title:${chapter.unit}-${chapter.chapterNo}`,
                chapter.title
              )
            );
            setEpisodeTitle(
              getTranslated(
                `unit_story_episode_title:${episode.unit}-${episode.chapterNo}-${episode.episodeNo}`,
                episode.title
              )
            );
            setReleaseConditionId(episode.releaseConditionId);
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

            getRemoteAssetURL(
              `event_story/${chapter.assetbundleName}/episode_image_rip/${episode.assetbundleName}.webp`,
              setBannerUrl,
              window.isChinaMainland ? "cn" : "ww"
            );
            getProcessedScenarioDataForLive2d(
              `event_story/${chapter.assetbundleName}/scenario_rip/${episode.scenarioId}.asset`,
              false
            ).then((data) => setScenarioData(data));

            setChapterTitle("");
            setEpisodeTitle(
              `${episode.episodeNo} - ${getTranslated(
                `event_story_episode_title:${episode.eventStoryId}-${episode.episodeNo}`,
                episode.title
              )}`
            );
            setReleaseConditionId(episode.releaseConditionId);
          }
          break;
        case "charaStory":
          if (characterProfiles) {
            const [, , , charaId] = storyId.split("/");

            const episode = characterProfiles.find(
              (cp) => cp.characterId === Number(charaId)
            )!;

            setBannerUrl(charaIcons[`CharaIcon${charaId}` as "CharaIcon1"]);
            getProcessedScenarioDataForLive2d(
              `scenario/profile_rip/${episode.scenarioId}.asset`,
              false
            ).then((data) => setScenarioData(data));

            setChapterTitle("");
            setEpisodeTitle(t("member:introduction"));
            setReleaseConditionId(0);
          }
          break;
        case "cardStory":
          if (cardEpisodes) {
            const [, , , , , cardEpisodeId] = storyId.split("/");

            const episode = cardEpisodes.find(
              (ce) => ce.id === Number(cardEpisodeId)
            )!;

            // setBannerUrl(charaIcons[`CharaIcon${charaId}` as "CharaIcon1"]);
            getRemoteAssetURL(
              `character/member_small/${episode.assetbundleName}_rip/card_normal.webp`,
              setBannerUrl,
              window.isChinaMainland ? "cn" : "ww"
            );
            getProcessedScenarioDataForLive2d(
              `character/member/${episode.assetbundleName}_rip/${episode.scenarioId}.asset`,
              true
            ).then((data) => setScenarioData(data));

            setChapterTitle("");
            setEpisodeTitle(
              getTranslated(
                `card_episode_title:${episode.title}`,
                episode.title
              )
            );
            setReleaseConditionId(episode.releaseConditionId);
          }
          break;
        case "areaTalk":
          if (actionSets) {
            const [, , , , actionSetId] = storyId.split("/");

            const episode = actionSets.find(
              (as) => as.id === Number(actionSetId)
            )!;

            // getRemoteAssetURL(
            //   `character/member_small/${episode.assetbundleName}_rip/card_normal.webp`,
            //   setBannerUrl,
            //   window.isChinaMainland
            // );
            getProcessedScenarioDataForLive2d(
              `scenario/actionset/group${Math.floor(episode.id / 100)}_rip/${
                episode.scenarioId
              }.asset`,
              false,
              true
            ).then((data) => setScenarioData(data));

            setChapterTitle("");
            setEpisodeTitle("");
            // setReleaseConditionId(episode.releaseConditionId);
          }
          break;
        case "specialStory":
          if (specialStories) {
            const [, , , spId, episodeNo] = storyId.split("/");
            const chapter = specialStories.find((sp) => sp.id === Number(spId));
            const episode = chapter?.episodes.find(
              (ep) => ep.episodeNo === Number(episodeNo)
            );

            if (episode?.scenarioId.startsWith("op"))
              getProcessedScenarioDataForLive2d(
                `scenario/special/${chapter?.assetbundleName}_rip/${episode?.scenarioId}.asset`,
                false
              ).then((data) => setScenarioData(data));
            else
              getProcessedScenarioDataForLive2d(
                `scenario/special/${episode?.assetbundleName}_rip/${episode?.scenarioId}.asset`,
                false
              ).then((data) => setScenarioData(data));

            setChapterTitle(chapter?.title || "");
            setEpisodeTitle(episode?.title || "");
          }
          break;
      }
    } catch (error) {
      showError("failed to load episode");
    }
  }, [
    unitStories,
    eventStories,
    storyId,
    storyType,
    getProcessedScenarioDataForLive2d,
    characterProfiles,
    cardEpisodes,
    t,
    getTranslated,
    showError,
    actionSets,
    specialStories,
  ]);

  useEffect(() => {
    Live2DModel.registerTicker(PIXI.Ticker);
  }, [pixiApp]);

  const live2dScenarioPlayerSeek = useCallback(async () => {
    actionIndex.current = actionIndex.current + 1;
    const currentActionIndex = actionIndex.current;

    if (currentActionIndex >= scenarioData.actions.length) {
      setProgressWords(`Story ended.`);
      setShowButtonEnable(true);
      return;
    }

    const currentAction = scenarioData.actions[currentActionIndex];
    console.log(
      `Current: ${currentActionIndex}/${scenarioData.actions.length}`
    );

    console.log(currentAction);
    switch (currentAction.type) {
      case SnippetAction.Talk:
        {
          const charaId = currentAction.chara.id;
          const charaName = currentAction.chara.name;
          const talkBody = currentAction.body;
          const character2dId = currentAction.character2dId;
          let live2dModel = pixiApp!.stage.getChildByName(
            `${
              scenarioData.characters.find(
                (charcter) => charcter.id === character2dId
              )?.name
            }_live2d`
          );
          console.log(`${charaName} (ID: ${charaId}) says: ${talkBody}`);
          const characterDialogContainer = pixiApp!.stage.getChildByName(
            "characterDialogContainer"
          ) as PIXI.Container;
          const characterDialogText = characterDialogContainer.getChildByName(
            "characterDialogText"
          ) as PIXI.Text;
          characterDialogText.text = `${charaName}\n\n${talkBody}`;
          characterDialogContainer.alpha = 1;
          if (currentAction.voice !== "") {
            voiceAudioPlayer.src = currentAction.voice;
            voiceAudioPlayer.play();
          }
          if (live2dModel) {
            (live2dModel as any).internalModel.motionManager.stopAllMotions();
            await (live2dModel as any).motion(currentAction.facialName, 0);
            setTimeout(() => {
              (live2dModel as any).internalModel.motionManager.stopAllMotions();
              (live2dModel as any).motion(currentAction.motionName, 0);
            }, 300);
          }
          //Actuallly, there are two ways to perform multiple motions in one talk action.
          //This is the first way. Check the next action to see if it is the same character and it is a motion action.
          //If so, call live2dScenarioPlayerSeek() to move to the next action.
          if (currentActionIndex + 1 < scenarioData.actions.length) {
            const nextAction = scenarioData.actions[currentActionIndex + 1];
            if (nextAction.type === SnippetAction.CharacterMotion) {
              if (
                nextAction.layoutType === LayoutType.NotChange &&
                nextAction.character2dId === character2dId
              ) {
                live2dScenarioPlayerSeek();
              }
            }
          }
        }
        break;
      case SnippetAction.SpecialEffect:
        {
          switch (currentAction.seTypeId) {
            case SpecialEffectType.BlackIn:
              {
                setTimeout(() => {
                  let blackInOutGraphic = pixiApp!.stage.getChildByName(
                    "blackInOutGraphic"
                  ) as PIXI.Graphics;
                  gsap
                    .to(blackInOutGraphic, { alpha: 0, duration: 1.0 })
                    .then(live2dScenarioPlayerSeek);
                }, currentAction.delay * 1000);
              }

              break;
            case SpecialEffectType.BlackOut:
              {
                setTimeout(() => {
                  let blackInOutGraphic = pixiApp!.stage.getChildByName(
                    "blackInOutGraphic"
                  ) as PIXI.Graphics;
                  let fullscreenText = pixiApp!.stage.getChildByName(
                    "fullScreenText"
                  ) as PIXI.Text;
                  fullscreenText.text = "";
                  fullscreenText.alpha = 0;
                  let characterDialogContainer = pixiApp!.stage.getChildByName(
                    "characterDialogContainer"
                  ) as PIXI.Container;
                  characterDialogContainer.alpha = 0;

                  gsap
                    .to(blackInOutGraphic, { alpha: 1, duration: 1.0 })
                    .then(live2dScenarioPlayerSeek);
                }, currentAction.delay * 1000);
              }
              break;
            case SpecialEffectType.SekaiOut:
            case SpecialEffectType.WhiteOut:
              {
                setTimeout(() => {
                  let whiteInOutGraphic = pixiApp!.stage.getChildByName(
                    "whiteInOutGraphic"
                  ) as PIXI.Graphics;
                  let fullscreenText = pixiApp!.stage.getChildByName(
                    "fullScreenText"
                  ) as PIXI.Text;
                  fullscreenText.text = "";
                  fullscreenText.alpha = 0;
                  gsap
                    .to(whiteInOutGraphic, { alpha: 1, duration: 1.0 })
                    .then(live2dScenarioPlayerSeek);
                }, currentAction.delay * 1000);
              }
              break;
            case SpecialEffectType.SekaiIn:
            case SpecialEffectType.WhiteIn:
              {
                setTimeout(() => {
                  let whiteInOutGraphic = pixiApp!.stage.getChildByName(
                    "whiteInOutGraphic"
                  ) as PIXI.Graphics;
                  gsap
                    .to(whiteInOutGraphic, { alpha: 0, duration: 1.0 })
                    .then(live2dScenarioPlayerSeek);
                }, currentAction.delay * 1000);
              }
              break;

            case SpecialEffectType.FullScreenText:
              {
                setTimeout(() => {
                  let fullScreenText = pixiApp!.stage.getChildByName(
                    "fullScreenText"
                  ) as PIXI.Text;

                  fullScreenText.text = currentAction.body;
                  fullScreenText.anchor.x = 0.5;
                  fullScreenText.anchor.y = 0.5;
                  fullScreenText.alpha = 1;
                  if (currentAction.resource !== "") {
                    voiceAudioPlayer.src = currentAction.resource;
                    voiceAudioPlayer.play();
                  }
                }, currentAction.delay * 1000);
              }
              break;
            case SpecialEffectType.ChangeBackground:
              {
                setTimeout(() => {
                  const newBackground = PIXI.Texture.from(
                    currentAction.resource
                  );
                  (
                    pixiApp!.stage.getChildByName(
                      "backgroundSprite"
                    ) as PIXI.Sprite
                  ).texture = newBackground;
                  live2dScenarioPlayerSeek();
                }, currentAction.delay * 1000);
              }
              break;
            case SpecialEffectType.PlaceInfo:
            case SpecialEffectType.Telop:
              {
                setTimeout(() => {
                  let telopContainer = pixiApp!.stage.getChildByName(
                    "telopContainer"
                  ) as PIXI.Container;
                  let telopText = telopContainer.getChildByName(
                    "telopText"
                  ) as PIXI.Text;
                  telopText.text = currentAction.body;
                  gsap.to(telopContainer, { alpha: 1, duration: 1.5 });
                  gsap
                    .to(telopContainer, {
                      alpha: 0,
                      duration: 1.0,
                      delay: 2,
                    })
                    .then(live2dScenarioPlayerSeek);
                }, currentAction.delay * 1000);
              }
              break;
            default:
              live2dScenarioPlayerSeek();
              break;
          }
        }
        break;
      case SnippetAction.Sound:
        {
          setTimeout(() => {
            if (currentAction.hasBgm) {
              bgmAudioPlayer.src = currentAction.bgm;
              bgmAudioPlayer.loop = true;
              bgmAudioPlayer.play();
            }
            if (currentAction.hasSe) {
              seAudioPlayer.src = currentAction.se;
              seAudioPlayer.play();
            }
          }, currentAction.delay * 1000);
          live2dScenarioPlayerSeek();
        }
        break;
      case SnippetAction.CharacterLayout:
      case SnippetAction.CharacterMotion:
        {
          let live2dModel = pixiApp!.stage.getChildByName(
            `${
              scenarioData.characters.find(
                (charcter) => charcter.id === currentAction.character2dId
              )?.name
            }_live2d`
          );
          // We need to stop all motions before performing a new motion, because the previous motion will never be stopped.I wonder why.
          setTimeout(async () => {
            switch (currentAction.layoutType) {
              case LayoutType.NotChange:
                {
                  live2dModel.visible = true;
                  if (currentAction.sideFrom === 4) {
                    live2dModel.x = 5 * (pixiApp!.screen.width / 10);
                  } else if (currentAction.sideFrom === 3) {
                    live2dModel.x = (pixiApp!.screen.width / 10) * 3;
                  } else if (currentAction.sideFrom === 7) {
                    live2dModel.x = (pixiApp!.screen.width / 10) * 7;
                  } else {
                    live2dModel.x =
                      (currentAction.sideFrom + 1) *
                      (pixiApp!.screen.width / 10);
                  }
                  (
                    live2dModel as any
                  ).internalModel.motionManager.stopAllMotions();
                  await (live2dModel as any).motion(
                    currentAction.facialName,
                    0
                  );
                  setTimeout(async () => {
                    (
                      live2dModel as any
                    ).internalModel.motionManager.stopAllMotions();
                    await (live2dModel as any).motion(
                      currentAction.motionName,
                      0
                    );
                  }, 300);

                  //Actuallly, there are two ways to perform multiple motions in one talk action.
                  //This is the second way.
                  //Check previous action to see if it is a talk action. If not, call live2dScenarioPlayerSeek() move to the next action.
                  //If so, it means the previous action is a talk action and the first way was already applied,
                  //and do NOT move to the next action because we need a click event to trigger live2dScenarioPlayerSeek().
                  if (currentActionIndex > 0) {
                    const previousAction =
                      scenarioData.actions[currentActionIndex - 1];
                    if (previousAction.type !== SnippetAction.Talk) {
                      live2dScenarioPlayerSeek();
                    } else {
                      if (
                        previousAction.character2dId !==
                        currentAction.character2dId
                      ) {
                        live2dScenarioPlayerSeek();
                      }
                    }
                  }

                  // if (currentActionIndex < scenarioData.actions.length - 1) {
                  //   const nextAction =
                  //     scenarioData.actions[currentActionIndex + 1];
                  //   if (
                  //     nextAction.type === SnippetAction.CharacterMotion ||
                  //     nextAction.type === SnippetAction.CharacterLayout
                  //   ) {
                  //     live2dScenarioPlayerSeek();
                  //   }
                  // }
                }
                break;
              case LayoutType.Appear:
                {
                  live2dModel.x = 9999;
                  live2dModel.visible = true;
                  if (currentAction.sideFrom === 4) {
                    live2dModel.x = 5 * (pixiApp!.screen.width / 10);
                  } else if (currentAction.sideFrom === 3) {
                    live2dModel.x = (pixiApp!.screen.width / 10) * 3;
                  } else if (currentAction.sideFrom === 7) {
                    live2dModel.x = (pixiApp!.screen.width / 10) * 7;
                  } else {
                    live2dModel.x =
                      (currentAction.sideFrom + 1) *
                      (pixiApp!.screen.width / 10);
                  }
                  (
                    live2dModel as any
                  ).internalModel.motionManager.stopAllMotions();
                  await (live2dModel as any).motion(
                    currentAction.facialName,
                    0
                  );
                  setTimeout(async () => {
                    (
                      live2dModel as any
                    ).internalModel.motionManager.stopAllMotions();
                    await (live2dModel as any).motion(
                      currentAction.motionName,
                      0
                    );
                  }, 300);
                  live2dScenarioPlayerSeek();
                }
                break;
              case LayoutType.Disappear:
                {
                  live2dModel.x = 9999;
                  live2dModel.visible = false;
                  (
                    live2dModel as any
                  ).internalModel.motionManager.stopAllMotions();
                  live2dScenarioPlayerSeek();
                }
                break;
              default:
                live2dScenarioPlayerSeek();
                break;
            }
          }, currentAction.delay * 1000);
        }
        break;
      default:
        break;
    }
  }, [
    scenarioData.actions,
    scenarioData.characters,
    pixiApp,
    voiceAudioPlayer,
    bgmAudioPlayer,
    seAudioPlayer,
  ]);

  const live2dScenarioPlayerInit = () => {
    setActionsLength(scenarioData.actions.length);
    pixiApp!.renderer.plugins.interaction.destroy();
    pixiApp!.stage.removeChildren();
    let promises = scenarioData.characters.map(async (character, _index, _) => {
      const modelName = character.name;
      setProgressWords(`${modelName}`);

      console.log(`Load model metadata for ${modelName}`);
      const { data: modelData } = await Axios.get<{
        Moc3FileName: string;
        TextureNames: string[];
        PhysicsFileName: string;
        UserDataFileName: string;
        AdditionalMotionData: any[];
        CategoryRules: any[];
      }>(
        `${
          window.isChinaMainland
            ? import.meta.env.VITE_ASSET_DOMAIN_CN
            : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
        }/live2d/model/${modelName}_rip/buildmodeldata.asset`,
        { responseType: "json" }
      );

      const motionName: String =
        (modelName.startsWith("sub") || modelName.startsWith("clb")
          ? modelName
          : modelName.split("_")[0]) + "_motion_base";
      let model3Json: any;
      console.log(`Load model to manager`);
      const filename = modelData.Moc3FileName.replace(".moc3.bytes", "");

      let model3JsonUrl = `${
        window.isChinaMainland
          ? import.meta.env.VITE_ASSET_DOMAIN_CN
          : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
      }/live2d/model/${modelName}_rip/${filename}.model3.json`;
      const { data } = await Axios.get<{
        Version: number;
        FileReferences: {
          [key: string]: any;
        };
        Groups: { [key: number]: any };
      }>(model3JsonUrl, { responseType: "json" });
      model3Json = data;
      model3Json.url = model3JsonUrl;
      model3Json.FileReferences.Moc = model3Json.FileReferences.Moc + ".bytes";
      model3Json.FileReferences.Motions = Object;
      scenarioData.motionsNeed.get(character.id)?.forEach((name) => {
        model3Json.FileReferences.Motions[name] = Object;
        model3Json.FileReferences.Motions[name] = [
          {
            File: `${
              window.isChinaMainland
                ? import.meta.env.VITE_ASSET_DOMAIN_CN
                : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
            }/live2d/motion/${motionName}_rip/${name}.motion3.json`,
          },
        ];
      });

      const model = await Live2DModel.from(model3Json, {
        motionPreload: MotionPreloadStrategy.ALL,
      });
      model.x = 9999;
      model.y = (pixiApp!.screen.height / 5) * 3;
      model.anchor.x = 0.5;
      model.anchor.y = 0.5;
      model.alpha = 1;
      model.zIndex = 5;
      let scale = pixiApp!.screen.width / 2 / model.width;
      model.scale.x = scale;
      model.scale.y = scale;
      model.name = `${modelName}_live2d`;
      pixiApp?.stage.addChild(model);
      model.visible = true;
      // Inorder to prevent the A-pose of model, we need to set the model to the initial pose.
      let firstMotion = Array.from(
        scenarioData.motionsNeed.get(character.id)!
      )[0];
      console.log(firstMotion);
      model.motion(firstMotion, 0, MotionPriority.FORCE);
      setTimeout(() => {
        model.visible = false;
      }, 1000);

      if (model) {
        return Promise.resolve();
      }
    });

    scenarioData.resourcesNeed.forEach(async (resourceUrl) => {
      promises.push(
        Axios.get(resourceUrl).then(() => {
          setProgressWords(`${resourceUrl}`);
        })
      );
    });

    Promise.all(promises).then(() => {
      setProgressWords(`DONE! Click the canvas below to start!`);
      wrap.current!.style.visibility = "visible";
      setShowButtonEnable(false);
    });

    pixiApp!.stage.sortableChildren = true;

    const fullScreenText = new PIXI.Text("", {
      fill: 0xffffff,
      fontSize: 30,
    });
    fullScreenText.x = pixiApp!.screen.width / 2;
    fullScreenText.y = pixiApp!.screen.height / 2;
    fullScreenText.name = "fullScreenText";
    fullScreenText.anchor.x = 0.5;
    fullScreenText.anchor.y = 0.5;
    fullScreenText.zIndex = 101;
    fullScreenText.alpha = 0;

    pixiApp!.stage.addChild(fullScreenText!);

    const background = PIXI.Texture.EMPTY;

    const backgroundSprite = new PIXI.Sprite(background);
    backgroundSprite.name = "backgroundSprite";
    backgroundSprite!.anchor.x = 0.5;
    backgroundSprite!.anchor.y = 0.5;
    backgroundSprite!.x = pixiApp!.screen.width / 2;
    backgroundSprite!.y = pixiApp!.screen.height / 2;
    backgroundSprite!.width = pixiApp!.screen.width;
    backgroundSprite!.height = pixiApp!.screen.height;
    backgroundSprite!.zIndex = 0;

    pixiApp!.stage.addChild(backgroundSprite!);

    const characterDialogContainer = new PIXI.Container();
    characterDialogContainer.name = "characterDialogContainer";
    characterDialogContainer.zIndex = 10;
    characterDialogContainer.alpha = 0;
    characterDialogContainer.x = (pixiApp!.screen.width * 2) / 10;
    characterDialogContainer.y = (pixiApp!.screen.height * 8) / 10;

    pixiApp!.stage.addChild(characterDialogContainer);

    const characterDialogBackground = new PIXI.Graphics();
    characterDialogBackground.name = "characterDialogBackground";
    characterDialogBackground.beginFill(0x000000, 0.5);
    characterDialogBackground.drawRect(
      0,
      0,
      (pixiApp!.screen.width * 6) / 10,
      (pixiApp!.screen.height * 2) / 10
    );
    characterDialogBackground.endFill();
    characterDialogContainer.addChild(characterDialogBackground);

    const characterDialogText = new PIXI.Text("", {
      fill: 0xffffff,
      fontSize: 20,
    });
    characterDialogText.name = "characterDialogText";
    characterDialogContainer.addChild(characterDialogText);

    const blackInOutGraphic = new PIXI.Graphics();
    blackInOutGraphic.name = "blackInOutGraphic";
    blackInOutGraphic?.beginFill(0x000000);
    blackInOutGraphic?.drawRect(
      0,
      0,
      pixiApp!.screen.width,
      pixiApp!.screen.height
    );
    blackInOutGraphic?.endFill();
    blackInOutGraphic!.x = pixiApp!.screen.width / 2;
    blackInOutGraphic!.y = pixiApp!.screen.height / 2;
    blackInOutGraphic!.zIndex = 100;
    blackInOutGraphic!.pivot.x = pixiApp!.screen.width / 2;
    blackInOutGraphic!.pivot.y = pixiApp!.screen.height / 2;
    blackInOutGraphic!.alpha = 0;
    pixiApp!.stage.addChild(blackInOutGraphic!);

    const whiteInOutGraphic = new PIXI.Graphics();
    whiteInOutGraphic.name = "whiteInOutGraphic";
    whiteInOutGraphic?.beginFill(0xffffff);
    whiteInOutGraphic?.drawRect(
      0,
      0,
      pixiApp!.screen.width,
      pixiApp!.screen.height
    );
    whiteInOutGraphic?.endFill();
    whiteInOutGraphic!.x = pixiApp!.screen.width / 2;
    whiteInOutGraphic!.y = pixiApp!.screen.height / 2;
    whiteInOutGraphic!.zIndex = 100;
    whiteInOutGraphic!.pivot.x = pixiApp!.screen.width / 2;
    whiteInOutGraphic!.pivot.y = pixiApp!.screen.height / 2;
    whiteInOutGraphic!.alpha = 0;

    pixiApp!.stage.addChild(whiteInOutGraphic!);

    const telopContainer = new PIXI.Container();
    telopContainer.name = "telopContainer";
    telopContainer.x = (pixiApp!.screen.width * 3) / 10;
    telopContainer.y = pixiApp!.screen.height / 2;

    telopContainer.zIndex = 10;
    telopContainer.alpha = 0;

    pixiApp!.stage.addChild(telopContainer);
    const telopBackground = new PIXI.Graphics();
    telopBackground.name = "telopBackground";
    telopBackground.beginFill(0x000000, 0.5);
    telopBackground.drawRect(
      0,
      0,
      (pixiApp!.screen.width * 4) / 10,
      (pixiApp!.screen.height * 1) / 10
    );
    telopBackground.endFill();
    telopContainer.addChild(telopBackground);

    const telopText = new PIXI.Text("", {
      fill: 0xffffff,
      fontSize: 30,
      align: "center",
    });
    telopText.name = "telopText";
    telopText.x = telopContainer.width / 2;
    telopText.y = telopContainer.height / 2;
    telopText.anchor.x = 0.5;
    telopText.anchor.y = 0.5;

    telopContainer.addChild(telopText);

    pixiApp!.stage.interactive = true;
  };

  useEffect(() => {
    return history.listen(() => {
      voiceAudioPlayer.pause();
      bgmAudioPlayer.pause();
      seAudioPlayer.pause();
      live2dInstance.release();
    });
  });

  return (
    <Fragment>
      <Alert severity="warning" className={layoutClasses.alert}>
        {t("common:betaIndicator")}
      </Alert>

      <Grid item xs={2}>
        <Button
          onClick={live2dScenarioPlayerInit}
          variant="contained"
          disabled={!showButtonEnable}
        >
          {t("common:show")}
        </Button>
      </Grid>
      <Container className={layoutClasses.content}>
        <Typography>{progressWords}</Typography>
      </Container>

      <Box
        width={1024}
        height={631}
        ref={wrap}
        className={layoutClasses.content}
        id="live2dScenarioPlayerBox"
        visibility={"hidden"}
      >
        <Stage
          width={1024}
          height={631}
          ref={stage}
          onMount={setPixiApp}
          onClick={live2dScenarioPlayerSeek}
        ></Stage>
      </Box>
    </Fragment>
  );
};

export default StoryReaderContentLive2d;
