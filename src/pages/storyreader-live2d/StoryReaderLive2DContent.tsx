import React, { useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useLive2DScenarioUrl,
  useProcessedLive2DScenarioData,
  getLive2DControllerData,
  preloadModels,
} from "../../utils/storyReaderLive2D/load";
import {
  ILive2DControllerData,
  IProgressEvent,
} from "../../utils/storyReaderLive2D/types";

import { IScenarioData, ServerRegion } from "../../types.d";
import ContainerContent from "../../components/styled/ContainerContent";
import { Stack, Button, Typography, LinearProgress } from "@mui/material";
import StoryReaderLive2DCanvas from "./StoryReaderLive2DCanvas";
//import { useAlertSnackbar } from "../../utils"

enum LoadStatus {
  Ready,
  Loading,
  Loaded,
}

const StoryReaderLive2DContent: React.FC<{
  storyType: string;
  storyId: string;
  region: ServerRegion;
}> = ({ storyType, storyId, region }) => {
  const { t } = useTranslation();
  const getLive2DScenarioUrl = useLive2DScenarioUrl();
  const getData = useProcessedLive2DScenarioData();
  const scenarioData = useRef<IScenarioData>();
  const controllerData = useRef<ILive2DControllerData>();

  const [loadStatus, setLoadStatus] = useState(LoadStatus.Ready);
  const [loadProgress, setLoadProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const canvas = useRef<HTMLDivElement>(null);

  const loadButtonText = useMemo(() => {
    if (loadStatus === LoadStatus.Ready)
      return t("story_reader_live2d:load_button_ready");
    if (loadStatus === LoadStatus.Loading)
      return t("story_reader_live2d:load_button_loading");
    if (loadStatus === LoadStatus.Loaded)
      return t("story_reader_live2d:load_button_loaded");
  }, [loadStatus, t]);

  const handleProgress: IProgressEvent = (pt, count, total, info) => {
    const order = [
      "pre",
      "model_data",
      "sound",
      "image",
      "model_assets",
      "model_motion",
    ];
    if (pt === "model_data")
      setProgressText(
        `${t("story_reader_live2d:progress_load_model_data")}: ${count}/${total} (${info})`
      );
    else if (pt === "sound")
      setProgressText(
        `${t("story_reader_live2d:progress_load_sound")}: ${count}/${total} (${info})`
      );
    else if (pt === "image")
      setProgressText(
        `${t("story_reader_live2d:progress_load_image")}: ${count}/${total} (${info})`
      );
    else if (pt === "model_assets")
      setProgressText(
        `${t("story_reader_live2d:progress_load_model_assets")}: ${count}/${total} (${info})`
      );
    else if (pt === "model_motion")
      setProgressText(
        `${t("story_reader_live2d:progress_load_model_motion")}: ${count}/${total} (${info})`
      );
    setLoadProgress(
      (order.findIndex((o) => o === pt) / order.length +
        count / total / order.length) *
        100
    );
  };
  StoryReaderLive2DContent.displayName = "StoryReaderLive2DContent";

  async function load() {
    setLoadStatus(LoadStatus.Loading);
    setProgressText(t("story_reader_live2d:progress_get_resource_url"));
    const scenarioUrl = await getLive2DScenarioUrl(storyType, storyId, region);
    setLoadProgress(1);
    if (scenarioUrl) {
      setProgressText(t("story_reader_live2d:progress_get_scenario_data"));
      scenarioData.current = await getData(scenarioUrl.url);
      setLoadProgress(2);
      // model_data sound image
      const ctData = await getLive2DControllerData(
        scenarioData.current,
        scenarioUrl.isCardStory,
        scenarioUrl.isActionSet,
        handleProgress
      );
      // model_assets model_motion
      await preloadModels(ctData, handleProgress);
      controllerData.current = ctData;
    }
    setLoadStatus(LoadStatus.Loaded);
  }

  function fullscreen() {
    if (!document.fullscreenElement && canvas.current) {
      canvas.current.requestFullscreen();
    }
  }

  return (
    <ContainerContent>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: "space-evenly",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Button
          variant="contained"
          disabled={loadStatus !== LoadStatus.Ready}
          onClick={load}
          sx={{ flex: 1 }}
        >
          {loadButtonText}
        </Button>
        <Button
          variant="contained"
          disabled={loadStatus !== LoadStatus.Loaded}
          onClick={fullscreen}
          sx={{ flex: 1 }}
        >
          {t("story_reader_live2d:toggle_full_screen")}
        </Button>
      </Stack>

      {loadStatus === LoadStatus.Loading && (
        <>
          <LinearProgress variant="determinate" value={loadProgress} />
          <Typography>{progressText}</Typography>
        </>
      )}
      {controllerData.current && loadStatus === LoadStatus.Loaded && (
        <div ref={canvas}>
          <StoryReaderLive2DCanvas
            controllerData={controllerData.current}
          ></StoryReaderLive2DCanvas>
        </div>
      )}
    </ContainerContent>
  );
};

export default StoryReaderLive2DContent;
