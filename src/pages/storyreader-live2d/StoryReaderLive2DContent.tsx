import React, { useRef, useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  getLive2DControllerData,
  preloadModels,
} from "../../utils/Live2DPlayer/load";
import {
  useScenarioInfo,
  getProcessedScenarioDataForLive2D,
  useMediaUrlForLive2D,
} from "../../utils/storyLoader";
import {
  ILive2DControllerData,
  IProgressEvent,
  LoadStatus,
  ILive2DPlayerSettings,
} from "../../utils/Live2DPlayer/types.d";
import { LlmTranslationService } from "../../utils/Live2DPlayer/translation/LlmTranslationService";
import { TranslationCache } from "../../utils/Live2DPlayer/translation/TranslationCache";

import { IScenarioData, ServerRegion } from "../../types.d";
import ContainerContent from "../../components/styled/ContainerContent";
import {
  Stack,
  Button,
  IconButton,
  Typography,
  LinearProgress,
  Collapse,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StoryReaderLive2DCanvas from "./StoryReaderLive2DCanvas";
import StoryReaderLive2DSettings from "./StoryReaderLive2DSettings";
import { useAlertSnackbar } from "../../utils";

const StoryReaderLive2DContent: React.FC<{
  storyType: string;
  storyId: string;
  region: ServerRegion;
}> = ({ storyType, storyId, region }) => {
  const { t } = useTranslation();
  const getScenarioInfo = useScenarioInfo();
  const getMediaUrlForLive2D = useMediaUrlForLive2D();
  const scenarioData = useRef<IScenarioData>();
  const controllerData = useRef<ILive2DControllerData>();

  const [stageSize, setStageSize] = useState<[number, number]>([0, 0]);
  const [loadStatus, setLoadStatus] = useState(LoadStatus.Ready);
  const [loadProgress, setLoadProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [isPageFullscreen, setIsPageFullscreen] = useState(false);
  const [settings, setSettings] = useState<ILive2DPlayerSettings>({
    voiceVolume: 80,
    seVolume: 80,
    bgmVolume: 30,
    autoplay: false,
    textAnimation: true,
    showWarning: true,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isRegeneratingTranslation, setIsRegeneratingTranslation] =
    useState(false);

  const { showError } = useAlertSnackbar();

  const canvas = useRef<HTMLDivElement>(null);

  const loadButtonText = useMemo(() => {
    if (loadStatus === LoadStatus.Ready)
      return t("story_reader_live2d:load_button.ready");
    if (loadStatus === LoadStatus.Loading)
      return t("story_reader_live2d:load_button.loading");
    if (loadStatus === LoadStatus.Loaded)
      return t("story_reader_live2d:load_button.loaded");
  }, [loadStatus, t]);

  const handleProgress: IProgressEvent = (pt, count, total, info) => {
    if (pt === "model_data")
      setProgressText(
        `${t("story_reader_live2d:progress.load_model_data")}: ${count}/${total} (${info})`
      );
    else if (pt === "media")
      setProgressText(
        `${t("story_reader_live2d:progress.load_media")}: ${count}/${total} (${info})`
      );
    else if (pt === "model_assets")
      setProgressText(
        `${t("story_reader_live2d:progress.load_model_assets")}: ${count}/${total} (${info})`
      );
    else if (pt === "model_motion")
      setProgressText(
        `${t("story_reader_live2d:progress.load_model_motion")}: ${count}/${total} (${info})`
      );
    const order = [
      { pt: "media", ratio: 30 },
      { pt: "model_data", ratio: 35 },
      { pt: "model_assets", ratio: 50 },
      { pt: "model_motion", ratio: 80 },
    ];
    const bar_total = order[order.length - 1].ratio;
    const ratio_idx = order.findIndex((o) => o.pt === pt);
    const curr_ratio = order[ratio_idx].ratio;
    let prev_ratio = 0;
    if (ratio_idx !== 0) prev_ratio = order[ratio_idx - 1].ratio;
    setLoadProgress(
      ((prev_ratio + (count / total) * (curr_ratio - prev_ratio)) / bar_total) *
        100
    );
  };
  StoryReaderLive2DContent.displayName = "StoryReaderLive2DContent";

  // Function to regenerate translations for loaded scenario data
  async function regenerateTranslation() {
    if (!scenarioData.current) {
      showError(t("story_reader_live2d:error.noScenarioData"));
      return;
    }

    setIsRegeneratingTranslation(true);
    try {
      const translationService = new LlmTranslationService();
      TranslationCache.clearCache();
      await translationService.translateScenarioData(scenarioData.current);
    } catch (error) {
      if (error instanceof Error) showError(error.message);
    } finally {
      setIsRegeneratingTranslation(false);
    }
  }

  async function load() {
    setLoadStatus(LoadStatus.Loading);
    // step 1 - get scenario url
    setProgressText(t("story_reader_live2d:progress.get_resource_url"));
    let scenarioInfo;
    try {
      scenarioInfo = await getScenarioInfo(storyType, storyId, region);
    } catch (err) {
      if (err instanceof Error) showError(err.message);
      setLoadStatus(LoadStatus.Ready);
      return;
    }
    setLoadProgress(1);
    if (scenarioInfo) {
      // // step 2 - get scenario data
      setProgressText(t("story_reader_live2d:progress.get_scenario_data"));
      scenarioData.current =
        await getProcessedScenarioDataForLive2D(scenarioInfo);
      setLoadProgress(2);

      // Start translation if enabled or region is JP
      if (scenarioData.current) {
        try {
          setProgressText(t("story_reader_live2d:progress.translation"));
          const translationService = new LlmTranslationService();
          TranslationCache.clearCache();
          await translationService.translateScenarioData(scenarioData.current);
        } catch (error) {
          console.warn("Translation failed:", error);
        }
      }

      // step 3 - get controller data (preload media)
      // step 3.1 - load media url
      let mediaUrl;
      try {
        mediaUrl = await getMediaUrlForLive2D(
          scenarioInfo,
          scenarioData.current
        );
      } catch (err) {
        if (err instanceof Error) showError(err.message);
        setLoadStatus(LoadStatus.Ready);
        return;
      }
      if (mediaUrl) {
        // step 3.2 preload media
        const ctData = await getLive2DControllerData(
          scenarioData.current,
          mediaUrl,
          handleProgress
        );
        // step 4 - preload model
        await preloadModels(ctData, handleProgress);
        controllerData.current = ctData;
        setLoadStatus(LoadStatus.Loaded);
      }
    }
  }

  // change canvas size
  // Set size condition1: when window resize
  // Set size condition2: when toggle full screen (trigger window resize)
  // Set size condition3: when toggle web page full screen (not trigger window resize)
  // Set size condition4: when load finished (not trigger window resize)
  // Must use useEffect, because after the state is updated,
  // the UI size will not be updated immediately, and the size cannot be obtained.
  // depandency array should include `isPageFullscreen` and `loadStatus`,
  // due to canvas render is rely on loadStatus, after the loading process is
  // finished, stage size should be set.
  useEffect(() => {
    const update_stage_size = () => {
      if (canvas.current) {
        let styleWidth = 0;
        let styleHeight = 0;
        if (!document.fullscreenElement) {
          if (isPageFullscreen) {
            // follow browser size
            styleWidth = canvas.current.clientWidth;
            styleHeight = canvas.current.clientHeight;
          } else {
            // 16:9 if not fullscreen
            styleWidth = canvas.current.clientWidth;
            styleHeight = (styleWidth * 9) / 16;
          }
        } else {
          // follow user screen size if fullscreen
          styleWidth = document.fullscreenElement.clientWidth;
          styleHeight = document.fullscreenElement.clientHeight;
        }
        setStageSize([styleWidth, styleHeight]);
      }
    };
    window.addEventListener("resize", update_stage_size);
    update_stage_size();
    return () => {
      window.removeEventListener("resize", update_stage_size);
    };
  }, [isPageFullscreen, loadStatus]);
  function fullscreen() {
    if (!document.fullscreenElement && canvas.current) {
      canvas.current.requestFullscreen();
    }
  }

  const stageContainerStyle = useMemo((): React.CSSProperties => {
    return isPageFullscreen
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1201, // between drawer(1200) and modal(1300)
        }
      : {};
  }, [isPageFullscreen]);

  return (
    <ContainerContent>
      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 2 }}
        useFlexGap
        sx={{
          justifyContent: "space-evenly",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 2,
        }}
      >
        <Button
          variant="contained"
          disabled={loadStatus !== LoadStatus.Ready}
          onClick={load}
          sx={{ flex: 1, minWidth: 100 }}
        >
          {loadButtonText}
        </Button>
        <Button
          variant="contained"
          disabled={loadStatus !== LoadStatus.Loaded}
          onClick={fullscreen}
          sx={{ flex: 1, minWidth: 100 }}
        >
          {t("story_reader_live2d:toggle_full_screen")}
        </Button>
        <Button
          variant="contained"
          disabled={loadStatus !== LoadStatus.Loaded}
          onClick={() => setIsPageFullscreen(!isPageFullscreen)}
          sx={{ flex: 1, minWidth: 100 }}
        >
          {t("story_reader_live2d:toggle_page_full_screen")}
        </Button>
        <Button
          variant="contained"
          disabled={
            loadStatus !== LoadStatus.Loaded || isRegeneratingTranslation
          }
          onClick={regenerateTranslation}
          sx={{ flex: 1, minWidth: 100 }}
          startIcon={
            isRegeneratingTranslation ? (
              <CircularProgress size={20} />
            ) : undefined
          }
        >
          {isRegeneratingTranslation
            ? t("story_reader_live2d:regenerating_translation")
            : t("story_reader_live2d:regenerate_translation")}
        </Button>
        <Button
          variant="contained"
          onClick={() => setShowSettings(!showSettings)}
          sx={{ flex: 1, minWidth: 100 }}
        >
          {showSettings
            ? t("story_reader_live2d:hide_settings")
            : t("story_reader_live2d:show_settings")}
        </Button>
      </Stack>
      <Collapse in={showSettings}>
        <StoryReaderLive2DSettings
          settings={settings}
          onSettingsChange={(settings) => setSettings(settings)}
        />
      </Collapse>
      {loadStatus === LoadStatus.Loading && (
        <>
          <LinearProgress variant="determinate" value={loadProgress} />
          <Typography>{progressText}</Typography>
        </>
      )}
      {controllerData.current && loadStatus === LoadStatus.Loaded && (
        <div
          ref={canvas}
          style={{
            ...stageContainerStyle,
            userSelect: "none",
          }}
        >
          <StoryReaderLive2DCanvas
            controllerData={controllerData.current}
            settings={settings}
            stageSize={stageSize}
          ></StoryReaderLive2DCanvas>
          {isPageFullscreen && (
            <IconButton
              sx={{ position: "absolute", top: 0, right: 0 }}
              onClick={() => setIsPageFullscreen(!isPageFullscreen)}
              size="large"
              color="primary"
            >
              <CloseIcon />
            </IconButton>
          )}
        </div>
      )}
    </ContainerContent>
  );
};

export default StoryReaderLive2DContent;
