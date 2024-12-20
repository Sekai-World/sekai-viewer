import React, {
  useState,
  useRef,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Typography, Stack } from "@mui/material";

import { Stage, useApp } from "@pixi/react";

import { extensions, TickerPlugin } from "pixi.js";
extensions.add(TickerPlugin);

import { Live2DController } from "../../utils/Live2DPlayer/Live2DController";
import { LoadStatus } from "../../utils/Live2DPlayer/types.d";
import type { ILive2DControllerData } from "../../utils/Live2DPlayer/types.d";

//DEBUG
//import { Box, Button, TextField } from "@mui/material";
//import { SnippetAction, SpecialEffectType } from "../../types.d";
//DEBUG/

const StoryReaderLive2DStage = forwardRef<
  { controller: Live2DController; reloadStage: () => void },
  {
    stageSize: [number, number];
    controllerData: ILive2DControllerData;
    onModelLoad: (status: LoadStatus) => void;
  }
>(({ stageSize, controllerData, onModelLoad }, ref) => {
  const app = useApp();
  const controller = useRef<Live2DController>();
  useImperativeHandle(ref, () => {
    return {
      controller: controller.current!,
      reloadStage: reloadStage,
    };
  });
  useEffect(() => {
    controller.current?.set_stage_size(stageSize);
  }, [stageSize]);
  useEffect(() => {
    controller.current = new Live2DController(app, stageSize, controllerData);
    //DEBUG
    //window.controller = controller.current;
    //DEBUG/
    if (controller.current.layers.live2d.load_status() === "ready") {
      onModelLoad(LoadStatus.Loading);
      controller.current.layers.live2d.clear();
      controller.current.live2d_load_model(0).then(() => {
        onModelLoad(LoadStatus.Loaded);
      });
    }
    return () => {
      controller.current?.unload();
    };
  }, []);
  function reloadStage() {
    const live2d = controller.current?.current_costume;
    controller.current = new Live2DController(app, stageSize, controllerData);
    if (live2d) controller.current.current_costume = live2d;
  }
  return null;
});
StoryReaderLive2DStage.displayName = "StoryReaderLive2DStage";

const StoryReaderLive2DCanvas: React.FC<{
  controllerData: ILive2DControllerData;
  autoplay: boolean;
}> = ({ controllerData, autoplay }) => {
  const { t } = useTranslation();

  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<{
    controller: Live2DController;
    reloadStage: () => void;
  }>(null);

  const [stageSize, setStageSize] = useState<[number, number]>([0, 0]);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoplayWaiting, setAutoplayWaiting] = useState(false);
  const [canClick, setCanClick] = useState(true);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.Ready);

  // change canvas size
  useLayoutEffect(() => {
    const update_stage_size = () => {
      if (wrap.current) {
        const styleWidth = wrap.current.clientWidth;
        const styleHeight = (styleWidth * 9) / 16;
        setStageSize([styleWidth, styleHeight]);
      }
    };
    window.addEventListener("resize", update_stage_size);
    update_stage_size();
    return () => {
      window.removeEventListener("resize", update_stage_size);
    };
  }, []);

  // autoplay listener
  useEffect(() => {
    if (loadStatus === LoadStatus.Loaded && autoplay && !playing) {
      setAutoplayWaiting(true);
      stage.current?.controller.animate.delay(1500).then(() => {
        setAutoplayWaiting(false);
        nextStep();
      });
    }
  }, [autoplay, playing]);

  //DEBUG
  /*
  const [inputStep, SetInputStep] = useState("");
  
  const info = () => {
    if (!controllerData) return null;
    let ret = "";
    const scenarioData = controllerData.scenarioData;
    ret += SnippetAction[scenarioData.Snippets[scenarioStep].Action];
    switch (scenarioData.Snippets[scenarioStep].Action) {
      case SnippetAction.Talk: {
        const sp = scenarioData.TalkData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
      } break;
      case SnippetAction.CharacterLayout: {
        const sp = scenarioData.LayoutData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
      } break;
      case SnippetAction.CharacterMotion: {
        const sp = scenarioData.LayoutData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
      } break;
      case SnippetAction.SpecialEffect: {
        const sp = scenarioData.SpecialEffectData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
        ret += " | " + SpecialEffectType[sp.EffectType];
      } break;
      case SnippetAction.Sound: {
        const sp = scenarioData.SoundData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
      } break;
    }
    return ret;
  }
  
  function apply_action () {
    stage.current?.controller.apply_action(scenarioStep);
  }

  function abort () {
    stage.current?.controller.animate.abort();
  }

  function refresh () {
    stage.current?.reloadStage();
  }

  function goto () {
    setScenarioStep(parseInt(inputStep));
  }

  function handleStepChange (ev: any) {
    SetInputStep(ev.target.value);
  }
  */
  //DEBUG/

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (loadStatus === LoadStatus.Loaded && canClick) {
      nextStep();
    }
    setCanClick(false);
    setTimeout(() => {
      setCanClick(true);
    }, 300);
  };

  const handleModelLoad = (status: LoadStatus) => {
    setLoadStatus(status);
    if (status === LoadStatus.Loaded) {
      nextStep();
    }
  };

  const nextStep = () => {
    if (!playing && !autoplayWaiting) {
      setPlaying(true);
      stage.current?.controller
        .step_until_checkpoint(scenarioStep)
        .then((current) => {
          setScenarioStep(current);
          setPlaying(false);
        });
    } else {
      stage.current?.controller.animate.abort();
    }
  };

  return (
    <Stack
      direction="column"
      sx={{
        justifyContent: "flex-start",
        alignItems: "stretch",
      }}
    >
      {playing && (
        <CircularProgress
          sx={{
            position: "absolute",
            margin: 2,
            width: 20,
          }}
        />
      )}
      {loadStatus === LoadStatus.Loading && (
        <Typography>
          {t("story_reader_live2d:loading_model_to_canvas")}
        </Typography>
      )}
      <div ref={wrap}>
        <Stage
          width={stageSize[0]}
          height={stageSize[1]}
          options={{
            backgroundColor: 0xfefefe,
            antialias: true,
            autoDensity: true,
          }}
          onClick={handlePlayClick}
        >
          {controllerData && (
            <StoryReaderLive2DStage
              ref={stage}
              stageSize={stageSize}
              controllerData={controllerData}
              onModelLoad={handleModelLoad}
            />
          )}
        </Stage>
      </div>
      {
        //DEBUG
        /*
        <Box>
          <Button variant="contained" disabled={playing} onClick={handlePlayClick}>Start Until Stop</Button>
          <Button variant="contained" onClick={apply_action}>Start</Button>
          <Button variant="contained" onClick={abort} disabled={!canClick}>Abort</Button>
          <Button variant="contained" onClick={() => setScenarioStep(scenarioStep+1)}>Step</Button>
          <Button variant="contained" onClick={() => setScenarioStep(scenarioStep-1)}>Back</Button>
          <Button variant="contained" onClick={refresh}>refresh</Button>
          <TextField variant="outlined" type="number" label="step" size="small" onChange={handleStepChange}></TextField>
          <Button variant="contained" onClick={goto}>go!</Button>
          <Typography>Current Step Index: {scenarioStep}</Typography>
          <Typography>Current Step: {info()}</Typography>
        </Box>
        */
        //DEBUG/
      }
    </Stack>
  );
};

StoryReaderLive2DCanvas.displayName = "StoryReaderLive2DCanvas";
export default StoryReaderLive2DCanvas;
