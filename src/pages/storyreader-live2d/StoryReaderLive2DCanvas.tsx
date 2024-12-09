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

import { Live2DController } from "../../utils/Live2DPlayer/controller";
import { LoadStatus } from "../../utils/Live2DPlayer/types.d";
import type { ILive2DControllerData } from "../../utils/Live2DPlayer/types.d";

//DEBUG
//import { Box, Button } from "@mui/material";
//import { SnippetAction, SpecialEffectType } from "../../types.d";
//DEBUG/

const StoryReaderLive2DStage = forwardRef<
  { controller: Live2DController },
  {
    stageSize: number[];
    controllerData: ILive2DControllerData;
    onModelLoad: (status: LoadStatus) => void;
  }
>(({ stageSize, controllerData, onModelLoad }, ref) => {
  const app = useApp();
  const controller = useRef<Live2DController>(
    new Live2DController(app, stageSize, controllerData)
  );
  useImperativeHandle(ref, () => {
    return {
      controller: controller.current,
    };
  });
  useEffect(() => {
    //DEBUG
    //controller.current = new Live2DController(app, stageSize, controllerData);
    //DEBUG/
    controller.current?.set_stage_size(stageSize);
  }, [stageSize]);
  useEffect(() => {
    if (controller.current.live2d.load_status() === "ready") {
      onModelLoad(LoadStatus.Loading);
      controller.current.live2d_model_init().then(() => {
        onModelLoad(LoadStatus.Loaded);
      });
    }
    return () => {
      controller.current.unload();
    };
  }, []);
  return null;
});
StoryReaderLive2DStage.displayName = "StoryReaderLive2DStage";

const StoryReaderLive2DCanvas: React.FC<{
  controllerData: ILive2DControllerData;
  autoplay: boolean;
}> = ({ controllerData, autoplay }) => {
  const { t } = useTranslation();

  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<{ controller: Live2DController }>(null);

  const [stageSize, setStageSize] = useState<number[]>([0, 0]);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [playing, setPlaying] = useState(false);
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
      nextStep();
    }
  }, [autoplay, playing]);

  //DEBUG
  /*
  const info = () => {
    if (!controllerData) return null;
    let ret = "";
    const scenarioData = controllerData.scenarioData;
    ret += SnippetAction[scenarioData.Snippets[scenarioStep].Action];
    switch (scenarioData.Snippets[scenarioStep].Action) {
      case SnippetAction.Talk: {
        const sp = scenarioData.TalkData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
        console.log([scenarioData.Snippets[scenarioStep], sp])
      } break;
      case SnippetAction.CharacerLayout: {
        const sp = scenarioData.LayoutData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
        console.log([scenarioData.Snippets[scenarioStep], sp])
      } break;
      case SnippetAction.CharacterMotion: {
        const sp = scenarioData.LayoutData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
        console.log([scenarioData.Snippets[scenarioStep], sp])
      } break;
      case SnippetAction.SpecialEffect: {
        const sp = scenarioData.SpecialEffectData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
        ret += " | " + SpecialEffectType[sp.EffectType];
        console.log([scenarioData.Snippets[scenarioStep], sp])
      } break;
      case SnippetAction.Sound: {
        const sp = scenarioData.SoundData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
        console.log([scenarioData.Snippets[scenarioStep], sp])
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
    if (!playing) {
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
        //<Box>
        //  <Button variant="contained" disabled={playing} onClick={handlePlayClick}>Start Until Stop</Button>
        //  <Button variant="contained" onClick={apply_action}>Start</Button>
        //  <Button variant="contained" onClick={abort} disabled={!canClick}>Abort</Button>
        //  <Button variant="contained" onClick={() => setScenarioStep(scenarioStep+1)}>Step</Button>
        //  <Button variant="contained" onClick={() => setScenarioStep(scenarioStep-1)}>Back</Button>
        //  <Typography>Current Step Index: {scenarioStep}</Typography>
        //  <Typography>Current Step: {info()}</Typography>
        //</Box>
        //DEBUG/
      }
    </Stack>
  );
};

StoryReaderLive2DCanvas.displayName = "StoryReaderLive2DCanvas";
export default StoryReaderLive2DCanvas;
