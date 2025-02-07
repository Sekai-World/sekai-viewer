import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, Typography, Stack } from "@mui/material";

import { Stage } from "@pixi/react";

import { Live2DController } from "../../utils/Live2DPlayer/Live2DController";
import { LoadStatus } from "../../utils/Live2DPlayer/types.d";
import type {
  ILive2DControllerData,
  ILive2DPlayerSettings,
} from "../../utils/Live2DPlayer/types.d";

import StoryReaderLive2DStage from "./StoryReaderLive2DStage";

//DEBUG
//import { Box, Button, TextField } from "@mui/material";
//import { SnippetAction, SpecialEffectType } from "../../types.d";
//DEBUG/

const StoryReaderLive2DCanvas: React.FC<{
  controllerData: ILive2DControllerData;
  settings: ILive2DPlayerSettings;
}> = ({ controllerData, settings }) => {
  const { t } = useTranslation();

  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<{
    controller: Live2DController;
    reloadStage: () => void;
  }>(null);

  const [stageSize, setStageSize] = useState<[number, number]>([0, 0]);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [autoplayWaiting, setAutoplayWaiting] = useState(false);
  const [canClick, setCanClick] = useState(true);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.Ready);

  /**
   * next step process:
   * - triggered by user click
   *   - auto play = true or autoplayWaiting = true or playing = true
   *     - abort player / auto play delay
   *   - else
   *     - next step
   * - triggered by auto play / model load finish
   *   - playing = false -> next step
   */
  const nextStepClick = useCallback(() => {
    if (!playing && !autoplayWaiting && scenarioStep !== -1) {
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
    if (scenarioStep === -1) setFinished(true);
  }, [autoplayWaiting, playing, scenarioStep]);
  const nextStepAuto = useCallback(() => {
    if (!playing && scenarioStep !== -1) {
      setPlaying(true);
      stage.current?.controller
        .step_until_checkpoint(scenarioStep)
        .then((current) => {
          setScenarioStep(current);
          setPlaying(false);
        });
    }
    if (scenarioStep === -1) setFinished(true);
  }, [playing, scenarioStep]);

  // change canvas size
  useLayoutEffect(() => {
    const update_stage_size = () => {
      if (wrap.current) {
        if (!document.fullscreenElement) {
          // 16:9 if not fullscreen
          const styleWidth = wrap.current.clientWidth;
          const styleHeight = (styleWidth * 9) / 16;
          setStageSize([styleWidth, styleHeight]);
        } else {
          // follow user screen size if fullscreen
          const styleWidth = document.fullscreenElement.clientWidth;
          const styleHeight = document.fullscreenElement.clientHeight;
          setStageSize([styleWidth, styleHeight]);
        }
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
    if (loadStatus === LoadStatus.Loaded && settings.autoplay && !playing) {
      setAutoplayWaiting(true);
      stage.current?.controller.animate.delay(1500).then(() => {
        setAutoplayWaiting(false);
        nextStepAuto();
      });
    }
  }, [settings.autoplay, loadStatus, playing]);

  // other settings listener
  useEffect(
    () =>
      stage.current?.controller.set_volume({
        bgm_volume: settings.bgmVolume / 100,
      }),
    [settings.bgmVolume]
  );
  useEffect(
    () =>
      stage.current?.controller.set_volume({
        voice_volume: settings.voiceVolume / 100,
      }),
    [settings.voiceVolume]
  );
  useEffect(
    () =>
      stage.current?.controller.set_volume({
        se_volume: settings.seVolume / 100,
      }),
    [settings.seVolume]
  );
  useEffect(() => {
    if (stage.current)
      stage.current.controller.settings.text_animation = settings.textAnimation;
  }, [settings.textAnimation]);

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
    setScenarioStep(0);
    setPlaying(false);
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
      nextStepClick();
      setCanClick(false);
      setTimeout(() => {
        setCanClick(true);
      }, 300);
    }
  };

  const handleModelLoad = (status: LoadStatus) => {
    setLoadStatus(status);
    if (status === LoadStatus.Loaded) {
      if (stage.current) {
        stage.current.controller.settings.text_animation =
          settings.textAnimation;
        stage.current.controller.set_volume({
          bgm_volume: settings.bgmVolume / 100,
          se_volume: settings.seVolume / 100,
          voice_volume: settings.voiceVolume / 100,
        });
      }
      nextStepAuto();
    }
  };

  return (
    <Stack
      direction="column"
      sx={{
        justifyContent: "flex-start",
        alignItems: "stretch",
        position: "relative",
      }}
    >
      {playing && (
        <CircularProgress
          sx={{
            position: "absolute",
            top: 2,
            left: 2,
            width: 20,
            zIndex: 1500, // same as tooltip
          }}
        />
      )}
      {loadStatus === LoadStatus.Loading && (
        <Typography>
          {t("story_reader_live2d:progress.load_model_to_canvas")}
        </Typography>
      )}
      <div ref={wrap} style={{ position: "relative" }}>
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
        {finished && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              height: "100%",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
            }}
          >
            <Typography variant="h6">
              {t("story_reader_live2d:story_ended")}
            </Typography>
          </Stack>
        )}
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
