import React, {
  Fragment,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import {
  Alert,
  Box,
  Button,
  Autocomplete,
  Grid,
  TextField,
  Stack,
  Divider,
  Dialog,
  CircularProgress,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCachedData } from "../../utils";
import { ICostume2D } from "../../types.d";

import { Stage } from "@pixi/react";

import { ChibiPlayer } from "../../utils/ChibiPlayer/ChibiPlayer";
import { FileType, FileTypeInfo } from "../../utils/ChibiPlayer/SekaiFFmpeg";
import {
  filterValidChibi,
  loadChibiAssets,
} from "../../utils/ChibiPlayer/load";
import { ChibiListItem, IChibiSpineState } from "./ChibiListItem";
import { ChibiCaptureSetting } from "./ChibiCaptureSetting";
import ChibiStage from "./ChibiStage";

import TypographyHeader from "../../components/styled/TypographyHeader";
import { useAlertSnackbar } from "../../utils";

import { saveAs } from "file-saver";
import dayjs from "dayjs";

const ChibiView: React.FC<unknown> = () => {
  const { t } = useTranslation();
  const { showError } = useAlertSnackbar();
  const [costume2Ds] = useCachedData<ICostume2D>("costume2ds");
  const [selectedSpine, setSelectedSpine] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState<[number, number]>([0, 0]);
  const [spineList, setSpineList] = useState<IChibiSpineState[]>([]);
  const [isCapture, setIsCapture] = useState(false);
  const [captureProgressMessage, setCaptureProgressMessage] = useState("");

  const stage = useRef<{ player: ChibiPlayer | null }>(null);
  const canvas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update_stage_size = () => {
      if (canvas.current) {
        let styleWidth = 0;
        let styleHeight = 0;
        styleWidth = canvas.current.clientWidth;
        styleHeight = styleWidth * (window.innerHeight / window.innerWidth);
        setStageSize([styleWidth, styleHeight]);
      }
    };
    window.addEventListener("resize", update_stage_size);
    update_stage_size();
    return () => {
      window.removeEventListener("resize", update_stage_size);
    };
  }, []);

  useLayoutEffect(() => {
    document.title = t("title:chibi");
  }, [t]);

  const allSpineList = useMemo(() => {
    if (costume2Ds)
      return filterValidChibi([
        ...new Set(
          costume2Ds
            .map((c) => c.spineAssetbundleName)
            .filter((c) => c !== undefined)
        ),
      ]);
  }, [costume2Ds]);

  const updateChibiList = useCallback((newSpineList: IChibiSpineState[]) => {
    if (stage.current && stage.current.player)
      stage.current.player.updateChibiList(
        newSpineList
          .filter((s) => s.status === "loaded")
          .map((s) => ({
            id: s.id,
            spine: s.spine,
          }))
      );
  }, []);

  const handleAddToScene = useCallback(() => {
    if (selectedSpine) {
      setSpineList((prevSpineList) => {
        let max = 0;
        if (prevSpineList.length > 0)
          max = Math.max(...prevSpineList.map((s) => s.id));
        const id = max + 1;
        const newList = [
          ...prevSpineList,
          {
            id,
            spine: selectedSpine,
            selectedAnimation: null,
            animationList: [],
            status: "loading" as const,
            on: true,
            flip: false,
            scale: 1,
            rotation: 0,
            shadow: true,
          },
        ];

        // load new chibi model
        loadChibiAssets(selectedSpine).then(() => {
          setSpineList((prevSpineList) => {
            // load model to stage
            const loadedNewList = [...prevSpineList];
            loadedNewList
              .filter((s) => s.id === id)
              .forEach((s) => (s.status = "loaded"));
            updateChibiList(loadedNewList);
            // get animation list
            if (stage.current && stage.current.player) {
              const animationList = stage.current.player.getAnimationList(id);
              loadedNewList
                .filter((s) => s.id === id)
                .forEach((s) => (s.animationList = animationList));
              // set default animation
              const defaultAni = animationList.find((a) =>
                a.endsWith("pose_default")
              );
              if (defaultAni) {
                loadedNewList
                  .filter((s) => s.id === id)
                  .forEach((s) => (s.selectedAnimation = defaultAni));
                stage.current.player.setAnimation(id, defaultAni);
              }
            }
            return loadedNewList;
          });
        });
        return newList;
      });
    }
  }, [selectedSpine, updateChibiList]);

  const handleDelFromScene = useCallback(
    (id: number) => {
      setSpineList((prevSpineList) => {
        const newList = prevSpineList.filter((spine) => spine.id !== id);
        updateChibiList(newList);
        return newList;
      });
    },
    [updateChibiList]
  );

  const handleChangeSpineState = useCallback(
    (state: IChibiSpineState) => {
      setSpineList((prevSpineList) => {
        const newList = prevSpineList.map((spine) =>
          spine.id === state.id ? { ...spine, ...state } : spine
        );
        updateChibiList(newList);
        return newList;
      });
    },
    [updateChibiList]
  );

  const handleSetTransform = useCallback(
    (state: IChibiSpineState) => {
      handleChangeSpineState(state);
      if (stage.current && stage.current.player) {
        stage.current.player.setTransform(state.id, {
          scale: [state.scale * (state.flip ? -1 : 1), state.scale],
          rotation: state.rotation,
        });
      }
    },
    [handleChangeSpineState]
  );

  const handleSetDisplay = useCallback(
    (state: IChibiSpineState) => {
      handleChangeSpineState(state);
      if (stage.current && stage.current.player) {
        stage.current.player.setDisplay(state.id, state.on);
      }
    },
    [handleChangeSpineState]
  );

  const handleSetShadow = useCallback(
    (state: IChibiSpineState) => {
      handleChangeSpineState(state);
      if (stage.current && stage.current.player) {
        stage.current.player.setShadow(state.id, state.shadow);
      }
    },
    [handleChangeSpineState]
  );

  const handleOffsetSpine = useCallback(
    (id: number, offset: number) => {
      setSpineList((prev) => {
        const idx = prev.findIndex((spine) => spine.id === id);
        if (idx === -1) return prev;
        let newIdx = idx + offset;
        if (newIdx < 0) newIdx += prev.length;
        if (newIdx >= prev.length) newIdx -= prev.length;
        const newList = [...prev];
        const [moved] = newList.splice(idx, 1);
        newList.splice(newIdx, 0, moved);
        updateChibiList(newList);
        return newList;
      });
    },
    [updateChibiList]
  );

  const handleSetAnimation = useCallback((id: number, animation: string) => {
    if (stage.current && stage.current.player)
      stage.current.player.setAnimation(id, animation);
  }, []);

  const handleInitFFmpeg = useCallback(async () => {
    if (stage.current && stage.current.player) {
      await stage.current.player.initFFmpeg();
    }
  }, []);

  const handleScreenshot = useCallback(async () => {
    if (stage.current && stage.current.player) {
      setCaptureProgressMessage(t("chibi:progress.save_screenshot"));
      setIsCapture(true);
      const blob = await stage.current.player.screenshot();
      if (blob)
        saveAs(
          blob,
          `SekaiBestChibi-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.png`
        );
      setIsCapture(false);
      setCaptureProgressMessage("");
    }
  }, [t]);

  const handleRecord = useCallback(
    async (
      fps: number,
      targetType: FileType,
      dimension: number,
      sec?: number
    ) => {
      if (stage.current && stage.current.player) {
        setIsCapture(true);
        const recordOptions = {
          fps,
          targetType,
          dimension,
          length: sec,
          resetAnimation: false,
          onProgress: (
            state: "getReady" | "genFrame" | "encode",
            message: string
          ) => {
            switch (state) {
              case "getReady":
                {
                  setCaptureProgressMessage(
                    `${t("chibi:progress.get_ready")} ${message}`
                  );
                }
                break;
              case "genFrame":
                {
                  setCaptureProgressMessage(
                    `${t("chibi:progress.generate_frame")} ${message}`
                  );
                }
                break;
              case "encode":
                {
                  setCaptureProgressMessage(
                    `${t("chibi:progress.encoding")} ${message}`
                  );
                }
                break;
            }
          },
        };
        if (sec) recordOptions.resetAnimation = true;
        try {
          const blob = await stage.current.player.recording(recordOptions);
          if (blob)
            saveAs(
              blob,
              `SekaiBestChibi-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}${FileTypeInfo[targetType].ext}`
            );
        } catch (err) {
          showError(err as string);
          throw err;
        } finally {
          setIsCapture(false);
          setCaptureProgressMessage("");
        }
      }
    },
    [t, showError]
  );

  return (
    <Fragment>
      <Dialog open={isCapture}>
        <DialogContent>
          <CircularProgress />
          <DialogContentText>{captureProgressMessage}</DialogContentText>
        </DialogContent>
      </Dialog>
      <TypographyHeader>Chibi viewer</TypographyHeader>
      <Alert severity="warning" sx={{ marginY: 1 }}>
        {t("common:betaIndicator")}
      </Alert>
      {allSpineList && (
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} sm={6} lg={5} xl={4}>
            <Autocomplete
              value={selectedSpine}
              onChange={(e, v) => {
                setSelectedSpine(v);
              }}
              options={allSpineList}
              renderInput={(props) => (
                <TextField {...props} label={t("live2d:select.model")} />
              )}
              size="small"
            />
          </Grid>
          <Grid item xs sm="auto">
            <Box display="flex">
              <Button
                disabled={!selectedSpine}
                variant="contained"
                onClick={handleAddToScene}
                sx={{ flexGrow: 1, alignContent: "center" }}
              >
                {t("chibi:add_to_scene")}
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
      {spineList.length > 0 && (
        <ChibiCaptureSetting
          onInitLib={handleInitFFmpeg}
          onRecord={handleRecord}
          onScreenshot={handleScreenshot}
          spineListLength={spineList.filter((s) => s.on).length}
        />
      )}
      {spineList.length > 0 && (
        <Divider orientation="horizontal" flexItem sx={{ marginY: 1 }} />
      )}
      <Stack direction="column" spacing={1}>
        {spineList.map((spine) => (
          <ChibiListItem
            state={spine}
            onChangeState={handleChangeSpineState}
            onSetDisplay={handleSetDisplay}
            onSetTransform={handleSetTransform}
            onSetShadow={handleSetShadow}
            onDelete={handleDelFromScene}
            onMove={handleOffsetSpine}
            onSetAnimation={handleSetAnimation}
            key={spine.id}
          />
        ))}
      </Stack>
      <Box ref={canvas} marginTop={1} border={1} borderColor={"#cccccc"}>
        <Stage
          width={stageSize[0]}
          height={stageSize[1]}
          options={{
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: 2,
          }}
        >
          <ChibiStage ref={stage} stageSize={stageSize} />
        </Stage>
      </Box>
    </Fragment>
  );
};

export default ChibiView;
