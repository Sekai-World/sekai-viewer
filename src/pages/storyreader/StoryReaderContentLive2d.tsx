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
  }>({
    characters: [],
    actions: [],
  });

  const [releaseConditionId, setReleaseConditionId] = useState<number>(0);
  const [currentWidth, setCurrentWidth] = useState<number>(0);
  const [currentModelIndex, setCurrentModelIndex] = useState<number>(1);

  const live2dInstance = useMemo(() => new Live2D(), []);
  const [live2dManager, setLive2dManager] = useState<LAppLive2DManager>();

  const [model, setModel] = useState<LAppModel>();

  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setScenarioData({
      characters: [],
      actions: [],
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

  useLayoutEffect(() => {
    const _us = updateSize;
    _us();
    window.addEventListener("resize", _us);
    return () => {
      window.removeEventListener("resize", _us);
    };
  }, [updateSize]);

  useLayoutEffect(() => {
    console.log("Hi");
    if (wrap.current && canvas.current) {
      canvas.current.getContext("webgl", {
        preserveDrawingBuffer: true,
      });
      setLive2dManager(
        live2dInstance.initialize(undefined, {
          wrap: wrap.current,
          canvas: canvas.current,
        })!
      );
    }
    return () => {
      live2dInstance.release();
    };
  }, [live2dInstance]);

  const live2dScenarioPlayerInit = useCallback(() => {
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
      const model = await live2dManager?.addModel(
        {
          path: `${
            window.isChinaMainland
              ? import.meta.env.VITE_ASSET_DOMAIN_CN
              : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
          }/live2d/model/${modelName}_rip/`,
          fileName: filename,
          modelName,
          modelSize: wrap.current!.clientWidth,
          textures: [],
          motions: [
            ...motionData.motions.map((name) => ({
              name,
              url: `${
                window.isChinaMainland
                  ? import.meta.env.VITE_ASSET_DOMAIN_CN
                  : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
              }/live2d/motion/${motionName}_rip/${name}.motion3.json`,
            })),
            ...motionData.expressions.map((name) => ({
              name,
              url: `${
                window.isChinaMainland
                  ? import.meta.env.VITE_ASSET_DOMAIN_CN
                  : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
              }/live2d/motion/${motionName}_rip/${name}.motion3.json`,
            })),
          ],
          expressions: [],
        },
        true
      );

      if (model) {
        model._modelSize =
          window.innerWidth * window.devicePixelRatio >=
          theme.breakpoints.values.xl
            ? currentWidth * 1.3
            : currentWidth * 3;
        model.appear({
          pointX: 250 * (index + 1),
          pointY: 300,
        });
      }
    });
  }, [
    scenarioData.characters,
    live2dManager,
    theme.breakpoints.values.xl,
    currentWidth,
  ]);

  return (
    <Fragment>
      <Button onClick={live2dScenarioPlayerInit}>{t("common:show")}</Button>
      <Box ref={wrap} className={layoutClasses.content}>
        <canvas ref={canvas}></canvas>
      </Box>
    </Fragment>
  );
};

export default StoryReaderContentLive2d;
