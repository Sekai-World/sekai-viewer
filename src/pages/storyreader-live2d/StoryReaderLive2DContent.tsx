import React, { useRef, useState, useMemo } from "react";
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
} from "../../utils/Live2DPlayer/types.d";

import { IScenarioData, ServerRegion } from "../../types.d";
import ContainerContent from "../../components/styled/ContainerContent";
import { Stack, Button, Typography, LinearProgress } from "@mui/material";
import StoryReaderLive2DCanvas from "./StoryReaderLive2DCanvas";
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

  const [loadStatus, setLoadStatus] = useState(LoadStatus.Ready);
  const [loadProgress, setLoadProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

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
      scenarioData.current = await getProcessedScenarioDataForLive2D(
        scenarioInfo,
        region
      );
      setLoadProgress(2);
      // step 3 - get controller data (preload media)
      // step 3.1 - load media url
      let mediaUrl;
      try {
        mediaUrl = await getMediaUrlForLive2D(
          scenarioInfo,
          scenarioData.current,
          region
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
        <div ref={canvas} style={{ userSelect: "none" }}>
          <StoryReaderLive2DCanvas
            controllerData={controllerData.current}
          ></StoryReaderLive2DCanvas>
        </div>
      )}
    </ContainerContent>
  );
};

export default StoryReaderLive2DContent;
