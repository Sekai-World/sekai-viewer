/* eslint-disable no-lone-blocks */
import { Box, Button, Container, useTheme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
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
  useProcessedScenarioData,
  useProcessedScenarioDataForLive2d,
} from "../../utils";
import { charaIcons } from "../../utils/resources";
import { ReleaseCondTrans } from "../../components/helpers/ContentTrans";
import { Sound, SpecialEffect, Talk } from "./StoryReaderSnippet";
import Image from "mui-image";
import { useAssetI18n } from "../../utils/i18n";
import { LAppLive2DManager } from "@sekai-world/find-live2d-v3/dist/types/lapplive2dmanager";
import { LAppModel } from "@sekai-world/find-live2d-v3/dist/types/lappmodel";
import Live2D from "@sekai-world/find-live2d-v3";

import Axios from "axios";
import * as PIXI from "pixi.js";

import { Stage, Sprite } from "@inlet/react-pixi";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import {
  Live2DModel,
  MotionPreloadStrategy,
  MotionPriority,
  // @ts-ignore
} from "pixi-live2d-display/dist/cubism4";
import { render } from "react-dom";
import { object } from "prop-types";

(window as any).PIXI = PIXI;

// config.idleMotionFadingDuration = 2147483647;

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

const useStyle = makeStyles((theme) => ({
  episodeBanner: {
    padding: theme.spacing(1.5, 0),
  },
}));

const StoryReaderContentLive2d: React.FC<{
  storyType: string;
  storyId: string;
}> = ({ storyType, storyId }) => {
  const layoutClasses = useLayoutStyles();
  const classes = useStyle();
  const theme = useTheme();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const getProcessedScenarioDataForLive2d = useProcessedScenarioDataForLive2d();
  const { showError } = useAlertSnackbar();

  const live2dInstance = useMemo(() => new Live2D(), []);
  const [live2dManager, setLive2dManager] = useState<LAppLive2DManager>();

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
  const [currentWidth, setCurrentWidth] = useState<number>(0);
  const [currentModelIndex, setCurrentModelIndex] = useState<number>(1);
  const [actionsLength, setActionsLength] = useState<number>(0);
  const [currentActionIndex, setCurrentActionIndex] = useState<number>(0);
  const [currentLive2dModelIndex, setCurrentLive2dModelIndex] =
    useState<number>(0);

  const voiceAudioPlayer = useState(new Audio());
  const seAudioPlayer = useState(new Audio());
  const bgmAudioPlayer = useState(new Audio());

  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage>(null);

  const [pixiApp, setPixiApp] = useState<PIXI.Application>();
  const [blackBackgroundGraphic, setBlackBackgroundGraphic] =
    useState<PIXI.Graphics>();
  const [fullScreenTextContainer, setFullScreenTextContainer] =
    useState<PIXI.Container>();
  const [backgroundSprite, setBackgroundSprite] = useState<PIXI.Sprite>();

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

  const sleep = (milliseconds: number | undefined) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  const updateSize = useCallback(() => {
    if (wrap.current && canvas.current) {
      // canvas.current.width = wrap.current.clientWidth;
      const styleWidth = wrap.current.clientWidth;
      const styleHeight =
        window.innerWidth * window.devicePixelRatio >=
        theme.breakpoints.values.xl
          ? (styleWidth * 9) / 16
          : (styleWidth * 4) / 3;
      const displayWidth = styleWidth * window.devicePixelRatio;
      const displayHeight = styleHeight * window.devicePixelRatio;

      setCurrentWidth(displayWidth);
      // setCurrentStyleWidth(styleWidth);

      canvas.current.style.width = `${styleWidth}px`;
      canvas.current.style.height = `${styleHeight}px`;
      canvas.current.width = displayWidth;
      canvas.current.height = displayHeight;
    }
  }, [theme.breakpoints.values.xl]);

  // useLayoutEffect(() => {
  //   const _us = updateSize;
  //   _us();
  //   window.addEventListener("resize", _us);
  //   return () => {
  //     window.removeEventListener("resize", _us);
  //   };
  // }, [updateSize]);

  // useLayoutEffect(() => {
  //   console.log("Hi");
  //   if (wrap.current && canvas.current) {
  //     canvas.current.getContext("webgl", {
  //       preserveDrawingBuffer: true,
  //     });
  //     setLive2dManager(
  //       live2dInstance.initialize(undefined, {
  //         wrap: wrap.current,
  //         canvas: canvas.current,
  //       })!
  //     );
  //   }

  //   return () => {
  //     live2dInstance.release();
  //   };
  // }, [live2dInstance]);

  useEffect(() => {
    // const interactionManager = new PIXI.InteractionManager(
    //   pixiApp!.stage,
    //   pixiApp!.renderer.view
    // );
    Live2DModel.registerTicker(PIXI.Ticker);
    // PIXI.Renderer.registerPlugin("interaction", PIXI.InteractionManager as any);
  }, [pixiApp]);

  const AddNextLive2dModeltoCanvas = async () => {
    pixiApp!.renderer.plugins.interaction.destroy();
    let modelName = scenarioData.characters[currentLive2dModelIndex].name;
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

    console.log(`Load model texture for ${modelName}`);
    await Axios.get(
      `${
        window.isChinaMainland
          ? import.meta.env.VITE_ASSET_DOMAIN_CN
          : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
      }/live2d/model/${modelName}_rip/${modelData.TextureNames[0]}`
    );

    console.log(`Load model moc3 for ${modelName}`);
    await Axios.get(
      `${
        window.isChinaMainland
          ? import.meta.env.VITE_ASSET_DOMAIN_CN
          : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
      }/live2d/model/${modelName}_rip/${modelData.Moc3FileName}`
    );

    console.log(`Load model physics for ${modelName}`);
    await Axios.get(
      `${
        window.isChinaMainland
          ? import.meta.env.VITE_ASSET_DOMAIN_CN
          : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
      }/live2d/model/${modelName}_rip/${modelData.PhysicsFileName}`
    );

    let motionData;
    const motionName: String =
      (modelName.startsWith("sub") || modelName.startsWith("clb")
        ? modelName
        : modelName.split("_")[0]) + "_motion_base";
    if (!modelName.startsWith("normal")) {
      console.log(`Load model motion for ${modelName}`);
      const { data } = await Axios.get<{
        motions: string[];
        expressions: string[];
      }>(
        `${
          window.isChinaMainland
            ? import.meta.env.VITE_ASSET_DOMAIN_CN
            : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
        }/live2d/motion/${motionName}_rip/BuildMotionData.json`,
        { responseType: "json" }
      );
      motionData = data;
    } else {
      motionData = {
        motions: [],
        expressions: [],
      };
    }
    console.log(`Load model to manager`);
    const filename = modelData.Moc3FileName.replace(".moc3.bytes", "");

    let model3Json;
    const { data } = await Axios.get<{
      Version: number;
      FileReferences: {
        [key: string]: string;
      };
      Groups: { [key: number]: any };
    }>(
      `${
        window.isChinaMainland
          ? import.meta.env.VITE_ASSET_DOMAIN_CN
          : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
      }/live2d/model/${modelName}_rip/${filename}.model3.json`,
      { responseType: "json" }
    );
    model3Json = data as any;
    model3Json.url = `${
      window.isChinaMainland
        ? import.meta.env.VITE_ASSET_DOMAIN_CN
        : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
    }/live2d/model/${modelName}_rip/${filename}.model3.json`;
    model3Json.FileReferences.Moc = model3Json.FileReferences.Moc + ".bytes";
    const model = await Live2DModel.from(model3Json);
    model.x = pixiApp!.screen.width / 2;
    model.y = pixiApp!.screen.height / 2;
    model.anchor.x = 0.5;
    model.anchor.y = 0.5;
    model.alpha = 1;
    model.zIndex = 150;
    model.scale.x = 0.3;
    model.scale.y = 0.3;
    pixiApp?.stage.addChild(model);
    setCurrentLive2dModelIndex(currentLive2dModelIndex + 1);
  };

  const live2dScenarioPlayerSeek = useCallback(async () => {
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
          console.log(`${charaName} (ID: ${charaId}) says: ${talkBody}`);
          const characterDialogContainer = pixiApp!.stage.getChildByName(
            "characterDialogContainer"
          ) as PIXI.Container;
          const characterDialogText = characterDialogContainer.getChildByName(
            "characterDialogText"
          ) as PIXI.Text;
          characterDialogText.text = `${charaName}\n\n${talkBody}`;
          characterDialogContainer.alpha = 1;
          if (currentAction.voiceUrl !== "") {
            voiceAudioPlayer[0].src = currentAction.voice;
            voiceAudioPlayer[0].play();
          }
        }
        break;
      case SnippetAction.SpecialEffect:
        {
          switch (currentAction.seTypeId) {
            case SpecialEffectType.BlackIn:
              {
                let blackInOutGraphic = pixiApp!.stage.getChildByName(
                  "blackInOutGraphic"
                ) as PIXI.Graphics;
                gsap.to(blackInOutGraphic, { alpha: 0, duration: 1.0 });
              }
              break;
            case SpecialEffectType.BlackOut:
              {
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

                gsap.to(blackInOutGraphic, { alpha: 1, duration: 1.0 });
              }
              break;
            case SpecialEffectType.WhiteOut:
              {
                let whiteInOutGraphic = pixiApp!.stage.getChildByName(
                  "whiteInOutGraphic"
                ) as PIXI.Graphics;
                let fullscreenText = pixiApp!.stage.getChildByName(
                  "fullScreenText"
                ) as PIXI.Text;
                fullscreenText.text = "";
                fullscreenText.alpha = 0;
                gsap.to(whiteInOutGraphic, { alpha: 1, duration: 1.0 });
              }
              break;
            case SpecialEffectType.WhiteIn:
              {
                let whiteInOutGraphic = pixiApp!.stage.getChildByName(
                  "whiteInOutGraphic"
                ) as PIXI.Graphics;
                gsap.to(whiteInOutGraphic, { alpha: 0, duration: 1.0 });
              }
              break;

            case SpecialEffectType.FullScreenText:
              {
                let fullScreenText = pixiApp!.stage.getChildByName(
                  "fullScreenText"
                ) as PIXI.Text;

                fullScreenText.text = currentAction.body;
                fullScreenText.anchor.x = 0.5;
                fullScreenText.anchor.y = 0.5;
                fullScreenText.alpha = 1;
                if (currentAction.resource !== "") {
                  voiceAudioPlayer[0].src = currentAction.resource;
                  voiceAudioPlayer[0].play();
                }
              }
              break;
            case SpecialEffectType.ChangeBackground:
              {
                const newBackground = PIXI.Texture.from(currentAction.resource);
                (
                  pixiApp!.stage.getChildByName(
                    "backgroundSprite"
                  ) as PIXI.Sprite
                ).texture = newBackground;
              }
              break;
            case SpecialEffectType.Telop:
              {
                let fullScreenText = pixiApp!.stage.getChildByName(
                  "fullScreenText"
                ) as PIXI.Text;
                pixiApp!.stage.sortChildren();
                fullScreenText.text = currentAction.body;
                fullScreenText.anchor.x = 0.5;
                fullScreenText.anchor.y = 0.5;
                fullScreenText.alpha = 1;
                gsap.to(fullScreenText, { alpha: 1, duration: 1.5 });
                gsap.to(fullScreenText, { alpha: 0, duration: 1.0, delay: 2 });
              }
              break;
            default:
              break;
          }
        }
        break;
      case SnippetAction.Sound:
        {
          if (currentAction.hasBgm) {
            bgmAudioPlayer[0].src = currentAction.bgm;
            bgmAudioPlayer[0].loop = true;
            bgmAudioPlayer[0].play();
          }
          if (currentAction.hasSe) {
            seAudioPlayer[0].src = currentAction.se;
            seAudioPlayer[0].play();
          }
        }
        break;
      case SnippetAction.CharacterLayout:
      case SnippetAction.CharacterMotion:
        {
          let live2dModel = pixiApp!.stage.getChildByName(
            `${currentAction.costumeType}_live2d`
          );
          switch (currentAction.type) {
            case LayoutType.NotChange:
              {
              }
              break;
            case LayoutType.Appear:
              {
                live2dModel.x = 9999;
                live2dModel.visible = true;
                await (live2dModel as any).motion(
                  currentAction.facialName,
                  0,
                  MotionPriority.FORCE
                );
                await (live2dModel as any)
                  .motion(currentAction.motionName, 0, MotionPriority.FORCE)
                  .then(() => {
                    live2dModel.visible = true;
                  });

                live2dModel.x =
                  (currentAction.sideFrom + 1) * (pixiApp!.screen.width / 10);
                await (live2dModel as any).motion(currentAction.motionName, 0);
              }
              break;
            case LayoutType.Disappear:
              {
                live2dModel.visible = false;
              }
              break;
            default:
              break;
          }
        }
        break;
      default:
        break;
    }
    setCurrentActionIndex(currentActionIndex + 1);
  }, [
    scenarioData.actions,
    currentActionIndex,
    voiceAudioPlayer,
    pixiApp,
    bgmAudioPlayer,
    seAudioPlayer,
  ]);

  const live2dScenarioPlayerInit = () => {
    setCurrentActionIndex(28);
    setActionsLength(scenarioData.actions.length);
    setCurrentLive2dModelIndex(0);
    const lengthAllresourcesNeed =
      scenarioData.resourcesNeed.size + scenarioData.characters.length;
    pixiApp!.renderer.plugins.interaction.destroy();
    scenarioData.characters.forEach(async (character, index, _) => {
      const modelName = character.name;
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

      console.log(`Load model texture for ${modelName}`);
      await Axios.get(
        `${
          window.isChinaMainland
            ? import.meta.env.VITE_ASSET_DOMAIN_CN
            : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
        }/live2d/model/${modelName}_rip/${modelData.TextureNames[0]}`
      );

      console.log(`Load model moc3 for ${modelName}`);
      await Axios.get(
        `${
          window.isChinaMainland
            ? import.meta.env.VITE_ASSET_DOMAIN_CN
            : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
        }/live2d/model/${modelName}_rip/${modelData.Moc3FileName}`
      );

      console.log(`Load model physics for ${modelName}`);
      await Axios.get(
        `${
          window.isChinaMainland
            ? import.meta.env.VITE_ASSET_DOMAIN_CN
            : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
        }/live2d/model/${modelName}_rip/${modelData.PhysicsFileName}`
      );
      let model3Json: any;
      let motionData;
      const motionName: String =
        (modelName.startsWith("sub") || modelName.startsWith("clb")
          ? modelName
          : modelName.split("_")[0]) + "_motion_base";
      if (!modelName.startsWith("normal")) {
        console.log(`Load model motion for ${modelName}`);
        const { data } = await Axios.get<{
          motions: string[];
          expressions: string[];
        }>(
          `${
            window.isChinaMainland
              ? import.meta.env.VITE_ASSET_DOMAIN_CN
              : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
          }/live2d/motion/${motionName}_rip/BuildMotionData.json`,
          { responseType: "json" }
        );
        motionData = data;
      } else {
        motionData = {
          motions: [],
          expressions: [],
        };
      }
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
      // motionData.expressions.forEach((name) => {
      //   model3Json.FileReferences.Motions[name] = Object;
      //   model3Json.FileReferences.Motions[name] = [
      //     {
      //       File: `${
      //         window.isChinaMainland
      //           ? import.meta.env.VITE_ASSET_DOMAIN_CN
      //           : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
      //       }/live2d/motion/${motionName}_rip/${name}.motion3.json`,
      //     },
      //   ];
      // });
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
      model.visible = true;
      let firstMotion = Array.from(
        scenarioData.motionsNeed.get(character.id)!
      )[0];
      console.log(firstMotion);
      model.motion(firstMotion, 0, MotionPriority.FORCE);

      pixiApp?.stage.addChild(model);

      // if (model) {
      //   model._modelSize =
      //     window.innerWidth * window.devicePixelRatio >=
      //     theme.breakpoints.values.xl
      //       ? currentWidth * 1.3
      //       : currentWidth * 3;
      //   console.log(
      //     `${
      //       index + 1
      //     }/${lengthAllresourcesNeed} Model data for ${modelName} loaded`
      //   );
      // }
    });
    let resourcesNeedIndex = scenarioData.characters.length;
    scenarioData.resourcesNeed.forEach(async (resourceUrl) => {
      await Axios.get(resourceUrl).then(() => {
        console.log(
          `${resourcesNeedIndex}/${lengthAllresourcesNeed} Resource for ${resourceUrl} loaded.`
        );
      });
      resourcesNeedIndex++;
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
      fontSize: 15,
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
    // pixiApp!.stage.addChild(blackBackgroundGraphic!);

    pixiApp!.stage.interactive = true;
  };

  return (
    <Fragment>
      <Button onClick={live2dScenarioPlayerInit}>{t("common:show")}</Button>
      <Button onClick={AddNextLive2dModeltoCanvas}>{t("common:next")}</Button>
      <Box
        width={1024}
        height={631}
        ref={wrap}
        className={layoutClasses.content}
        id="live2dScenarioPlayerBox"
      >
        {/* <canvas ref={canvas}></canvas> */}
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
