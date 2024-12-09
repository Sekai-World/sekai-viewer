import React, { useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useLive2DScenarioUrl,
  getProcessedLive2DScenarioData,
  getLive2DControllerData,
  preloadModels,
} from "../../utils/Live2DPlayer/load";
import {
  ILive2DControllerData,
  IProgressEvent,
  LoadStatus,
} from "../../utils/Live2DPlayer/types.d";

import { IScenarioData, ServerRegion } from "../../types.d";
import ContainerContent from "../../components/styled/ContainerContent";
import {
  Stack,
  Button,
  Typography,
  LinearProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import StoryReaderLive2DCanvas from "./StoryReaderLive2DCanvas";

const StoryReaderLive2DContent: React.FC<{
  storyType: string;
  storyId: string;
  region: ServerRegion;
}> = ({ storyType, storyId, region }) => {
  const { t } = useTranslation();
  const getLive2DScenarioUrl = useLive2DScenarioUrl();
  const scenarioData = useRef<IScenarioData>();
  const controllerData = useRef<ILive2DControllerData>();

  const [loadStatus, setLoadStatus] = useState(LoadStatus.Ready);
  const [loadProgress, setLoadProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [autoplay, setAutoplay] = useState(false);

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
    if (pt === "model_data")
      setProgressText(
        `${t("story_reader_live2d:progress_load_model_data")}: ${count}/${total} (${info})`
      );
    else if (pt === "media")
      setProgressText(
        `${t("story_reader_live2d:progress_load_media")}: ${count}/${total} (${info})`
      );
    else if (pt === "model_assets")
      setProgressText(
        `${t("story_reader_live2d:progress_load_model_assets")}: ${count}/${total} (${info})`
      );
    else if (pt === "model_motion")
      setProgressText(
        `${t("story_reader_live2d:progress_load_model_motion")}: ${count}/${total} (${info})`
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
    setProgressText(t("story_reader_live2d:progress_get_resource_url"));
    const scenarioUrl = await getLive2DScenarioUrl(storyType, storyId, region);
    setLoadProgress(1);
    if (scenarioUrl) {
      // // step 2 - get scenario data
      setProgressText(t("story_reader_live2d:progress_get_scenario_data"));
      scenarioData.current = await getProcessedLive2DScenarioData(
        scenarioUrl.url,
        region
      );
      setLoadProgress(2);
      // step 3 - get controller data (preload media)
      const ctData = await getLive2DControllerData(
        scenarioData.current,
        scenarioUrl.isCardStory,
        scenarioUrl.isActionSet,
        handleProgress
      );
      // step 4 - preload model
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

  const handleAutoplayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoplay(event.target.checked);
  };

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
        <FormControlLabel
          control={
            <Checkbox checked={autoplay} onChange={handleAutoplayChange} />
          }
          label={t("story_reader_live2d:auto_play")}
        />
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
            autoplay={autoplay}
          ></StoryReaderLive2DCanvas>
        </div>
      )}
    </ContainerContent>
  );
};

export default StoryReaderLive2DContent;
