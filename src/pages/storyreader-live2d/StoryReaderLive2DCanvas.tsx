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

// wired... I have to add Ticker plugin manually or pixi-react will raise error...
// pixi-react nolonger supports pixi6.5, maybe this is the reason?
import { extensions, TickerPlugin } from "pixi.js";
extensions.add(TickerPlugin);

import { Live2DController } from "../../utils/storyReaderLive2D/controller";
import type { ILive2DControllerData } from "../../utils/storyReaderLive2D/types";

const StoryReaderLive2DStage = forwardRef<
  {
    debug_load: (data: ILive2DControllerData) => void;
    controller: Live2DController;
  },
  { stageSize: number[]; controllerData: ILive2DControllerData }
>(({ stageSize, controllerData }, ref) => {
  const app = useApp();
  const controller = useRef<Live2DController>(
    new Live2DController(app, stageSize, controllerData)
  );
  useImperativeHandle(ref, () => {
    return {
      debug_load: (data: ILive2DControllerData) => {
        controller.current = new Live2DController(app, stageSize, data);
      },
      controller: controller.current,
    };
  });
  useEffect(() => {
    //controller.current = new Live2DController(app, stageSize, controllerData);
    controller.current?.setStageSize(stageSize);
  }, [stageSize]);
  return null;
});
StoryReaderLive2DStage.displayName = "StoryReaderLive2DStage";

const StoryReaderLive2DCanvas: React.FC<{
  controllerData: ILive2DControllerData;
}> = ({ controllerData }) => {
  const { t } = useTranslation();

  const wrap = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState<number[]>([0, 0]);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [init, setInit] = useState(false);

  const stage = useRef<{
    debug_load: (data: ILive2DControllerData) => void;
    controller: Live2DController;
  }>(null);

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

  // draw scenario

  //const info = () => {
  //  if (!controllerData) return null;
  //  let ret = "";
  //  const scenarioData = controllerData.scenarioData;
  //  ret += SnippetAction[scenarioData.Snippets[scenarioStep].Action];
  //  switch (scenarioData.Snippets[scenarioStep].Action) {
  //    case SnippetAction.Talk: {
  //      const sp = scenarioData.TalkData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
  //      console.log([scenarioData.Snippets[scenarioStep], sp])
  //    } break;
  //    case SnippetAction.CharacerLayout: {
  //      const sp = scenarioData.LayoutData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
  //      console.log([scenarioData.Snippets[scenarioStep], sp])
  //    } break;
  //    case SnippetAction.CharacterMotion: {
  //      const sp = scenarioData.LayoutData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
  //      console.log([scenarioData.Snippets[scenarioStep], sp])
  //    } break;
  //    case SnippetAction.SpecialEffect: {
  //      const sp = scenarioData.SpecialEffectData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
  //      ret += " | " + SpecialEffectType[sp.EffectType];
  //      console.log([scenarioData.Snippets[scenarioStep], sp])
  //    } break;
  //    case SnippetAction.Sound: {
  //      const sp = scenarioData.SoundData[scenarioData.Snippets[scenarioStep].ReferenceIndex];
  //      console.log([scenarioData.Snippets[scenarioStep], sp])
  //    } break;
  //  }
  //  return ret;
  //}

  //function apply_action () {
  //  stage.current?.debug_load(controllerData);
  //  stage.current?.controller.apply_action(scenarioStep);
  //}

  function apply_action_until(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setInit(true);
    if (!playing) {
      setPlaying(true);
      //stage.current?.debug_load(controllerData);
      stage.current?.controller
        .step_until_checkpoint(scenarioStep)
        .then((current) => {
          setScenarioStep(current);
          setPlaying(false);
        });
    }
  }

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
      {!init && (
        <Typography
          sx={{
            position: "absolute",
            margin: 2,
          }}
          onClick={apply_action_until}
        >
          {t("story_reader_live2d:tap_here_to_start")}
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
          onClick={apply_action_until}
        >
          {controllerData && (
            <StoryReaderLive2DStage
              ref={stage}
              stageSize={stageSize}
              controllerData={controllerData}
            />
          )}
        </Stage>
      </div>
      {/*
      <Box>
        <Button variant="contained" disabled={playing} onClick={apply_action_until}>Start Until Stop</Button>
        <Button variant="contained" onClick={apply_action}>Start</Button>
        <Button variant="contained" onClick={() => setScenarioStep(scenarioStep+1)}>Step</Button>
        <Button variant="contained" onClick={() => setScenarioStep(scenarioStep-1)}>Back</Button>
        <Typography>Current Step Index: {scenarioStep}</Typography>
        <Typography>Current Step: {info()}</Typography>
      </Box>
      */}
    </Stack>
  );
};

StoryReaderLive2DCanvas.displayName = "StoryReaderLive2DCanvas";
export default StoryReaderLive2DCanvas;
