import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Axios from "axios";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  LinearProgress,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Stage } from "@pixi/react";
import { saveAs } from "file-saver";
import fscreen from "fscreen";
import { useTranslation } from "react-i18next";
import ContainerContent from "../../components/styled/ContainerContent";
import TypographyHeader from "../../components/styled/TypographyHeader";
import { useLive2dModelList } from "../../utils/apiClient";
import {
  InternalModel,
  Live2DModel,
  Cubism4InternalModel,
} from "@sekai-world/pixi-live2d-display-mulmotion";
import Live2dModel from "../../components/pixi/Live2dModel";
import { getModelData } from "../../utils/live2dLoader";
import type { ILive2DModelData, ILive2dModelListElement } from "../../types.d";
import Live2DToolbar from "./Live2DToolbar";
import { Live2DModelDownloadError, packLive2DModel } from "./live2dDownload";

const Live2DView: React.FC<unknown> = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [selectedModelItem, setSelectedModelItem] =
    useState<ILive2dModelListElement | null>(null);
  const [modelName, setModelName] = useState<string | null>("");
  const [modelData, setModelData] = useState<ILive2DModelData>();
  const [motions, setMotions] = useState<string[]>([]);
  const [selectedMotion, setSelectedMotion] = useState<string | null>(null);
  const [expressions, setExpressions] = useState<string[]>([]);
  const [selectedExpression, setSelectedExpression] = useState<string | null>(
    null
  );
  const [coreModel, setCoreModel] = useState<
    Cubism4InternalModel["coreModel"] | null
  >(null);
  const [selectedParameter, setSelectedParameter] = useState<string | null>(
    null
  );
  const [parameterValues, setParameterValues] = useState<
    Record<string, number>
  >({});
  const [idle, setIdle] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressWords, setProgressWords] = useState("");
  const [downloadWarning, setDownloadWarning] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [live2dScale, setLive2dScale] = useState(1);
  const [live2dX, setLive2dX] = useState(0);
  const [live2dY, setLive2dY] = useState(0);

  const { modelList } = useLive2dModelList();

  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage>(null);
  const live2dModel = useRef<Live2DModel<InternalModel>>(null);

  const [stageWidth, setStageWidth] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);

  const fullScreenEnabled = fscreen.fullscreenEnabled;

  const updateSize = useCallback(() => {
    if (wrap.current && modelData) {
      // canvas.current.width = wrap.current.clientWidth;
      const styleWidth = wrap.current.clientWidth;
      const styleHeight =
        window.innerWidth * window.devicePixelRatio >=
        theme.breakpoints.values.xl
          ? (styleWidth * 9) / 16
          : (styleWidth * 4) / 3;

      setStageWidth(styleWidth);
      setStageHeight(styleHeight);

      if (live2dModel.current) {
        const live2dTrueWidth = live2dModel.current.internalModel.originalWidth;
        const live2dTrueHeight =
          live2dModel.current.internalModel.originalHeight;
        let scale = Math.min(
          styleWidth / live2dTrueWidth,
          styleHeight / live2dTrueHeight
        );

        scale = (Math.round(scale * 100) / 100) * 1.3;
        setLive2dScale(scale);
        setCoreModel(
          (live2dModel.current.internalModel
            .coreModel as Cubism4InternalModel["coreModel"]) ?? null
        );
        setLive2dX((styleWidth - live2dTrueWidth * scale) / 2);
        setLive2dY((styleHeight - live2dTrueHeight * scale) / 2);
      }
    }
  }, [modelData, theme.breakpoints.values.xl]);

  useLayoutEffect(() => {
    const _us = updateSize;
    _us();
    window.addEventListener("resize", _us);
    return () => {
      window.removeEventListener("resize", _us);
    };
  }, [updateSize]);

  useLayoutEffect(() => {
    document.title = t("title:live2d");
  }, [t]);

  useLayoutEffect(() => {
    let handler: (e?: Event) => void;
    if (fullScreenEnabled) {
      handler = () => setIsFullscreen(!!fscreen.fullscreenElement);
      fscreen.addEventListener("fullscreenchange", handler);
    }
    return () => {
      if (handler) fscreen.removeEventListener("fullscreenchange", handler);
    };
  }, [fullScreenEnabled]);

  useEffect(() => {
    const func = async () => {
      if (modelName && selectedModelItem) {
        setModelData(undefined);
        setShowProgress(true);

        setProgress(0);
        setProgressWords(t("live2d:load_progress.model_metadata"));
        const modelData = await getModelData(selectedModelItem);

        setProgress(20);
        setProgressWords(t("live2d:load_progress.model_texture"));
        await Axios.get(modelData.url + modelData.FileReferences.Textures[0]);

        setProgress(40);
        setProgressWords(t("live2d:load_progress.model_moc3"));
        await Axios.get(modelData.url + modelData.FileReferences.Moc);

        setProgress(60);
        setProgressWords(t("live2d:load_progress.model_physics"));
        await Axios.get(modelData.url + modelData.FileReferences.Physics);

        setProgress(90);
        setProgressWords(t("live2d:load_progress.display_model"));
        setModelData(modelData);

        setMotions(modelData.FileReferences.Motions.Motion.map((m) => m.Name));
        setExpressions(
          modelData.FileReferences.Motions.Expression.map((m) => m.Name)
        );

        setShowProgress(false);
        setProgress(0);
        setProgressWords("");
      }
    };

    func();
  }, [modelName, selectedModelItem, t]);

  const handleDownload = useCallback(async () => {
    if (!modelName || !selectedModelItem) return;

    setDownloadWarning("");
    setShowProgress(true);

    try {
      const { skippedMotions } = await packLive2DModel({
        modelItem: selectedModelItem,
        modelName,
        getMessage: t,
        onProgress: (nextProgress, nextWords) => {
          setProgress(nextProgress);
          setProgressWords(nextWords);
        },
      });

      if (skippedMotions > 0) {
        setDownloadWarning(
          `Download completed, skipped ${skippedMotions} failed motion/expression file(s).`
        );
      }
    } catch (error) {
      console.warn("Live2D model download failed", error);
      setDownloadWarning(
        error instanceof Live2DModelDownloadError
          ? "Model file download failed. Download aborted."
          : "Download failed."
      );
    } finally {
      setShowProgress(false);
      setProgress(0);
      setProgressWords("");
    }
  }, [modelName, selectedModelItem, t]);

  const handleScreenshot = useCallback(() => {
    if (stage.current && live2dModel.current) {
      // console.log(stage.current);
      // @ts-expect-error app is private
      const app = stage.current.app as PIXI.Application;
      const region = app.stage.getBounds();
      region.x = live2dX;
      region.y = live2dY;
      const imageThis = app.renderer.generateTexture(app.stage, {
        region,
        resolution: 4,
      });
      app.renderer.extract
        .image(imageThis, "image/png", 1.0)
        .then((image: HTMLImageElement) => {
          saveAs(
            image.src,
            `${modelName}-${new Date().toISOString().split("T", 1)[0]}.png`
          );
        });
    }
  }, [live2dX, live2dY, modelName]);

  const handleShow = useCallback(() => {
    setModelName(selectedModelItem?.modelName ?? null);
    setSelectedMotion(null);
    setSelectedExpression(null);
    setSelectedParameter(null);
    setParameterValues({});
    setIdle(true);
  }, [selectedModelItem]);

  const onLive2dModelReady = useCallback(() => {
    updateSize();
  }, [updateSize]);

  const handleReloadModel = useCallback(() => {
    if (modelData) {
      // save current modelData
      setSelectedParameter(null);
      setParameterValues({});
      const currentModelData = modelData;
      setModelData(undefined);
      setTimeout(() => setModelData(currentModelData));
    }
  }, [modelData]);

  const handleLive2DParamsChange = (value: number, params: string) => {
    coreModel?.setParameterValueById(params, value);
    setParameterValues((prev) => ({
      ...prev,
      [params]: value,
    }));
  };

  const defaultBreath = useMemo(
    () => [
      {
        parameterId: "ParamAngleX",
        offset: 0,
        peak: 15,
        cycle: 6.5345,
        weight: 0.5,
      },
      {
        parameterId: "ParamAngleY",
        offset: 0,
        peak: 8,
        cycle: 3.5345,
        weight: 0.5,
      },
      {
        parameterId: "ParamAngleZ",
        offset: 0,
        peak: 10,
        cycle: 5.5345,
        weight: 0.5,
      },
      {
        parameterId: "ParamBodyAngleX",
        offset: 0,
        peak: 4,
        cycle: 15.5345,
        weight: 0.5,
      },
      {
        parameterId: "ParamBreath",
        offset: 0,
        peak: 0.5,
        cycle: 3.2345,
        weight: 0.5,
      },
    ],
    []
  );

  const handleApplyMotion = useCallback(() => {
    if (selectedMotion) {
      live2dModel.current?.motion("Motion", motions.indexOf(selectedMotion));
    }
  }, [motions, selectedMotion]);

  const handleApplyExpression = useCallback(() => {
    if (selectedExpression) {
      live2dModel.current?.motion(
        "Expression",
        expressions.indexOf(selectedExpression)
      );
    }
  }, [expressions, selectedExpression]);

  const handleIdleChange = useCallback(
    (value: boolean) => {
      if (
        live2dModel.current?.internalModel &&
        "breath" in live2dModel.current.internalModel
      ) {
        (
          live2dModel.current.internalModel
            .breath as Cubism4InternalModel["breath"]
        ).setParameters(value ? defaultBreath : []);
        setIdle(value);
      }
    },
    [defaultBreath]
  );

  return (
    <Fragment>
      <TypographyHeader>Live2D</TypographyHeader>
      <Alert severity="warning" sx={{ margin: theme.spacing(1, 0) }}>
        {t("common:betaIndicator")}
      </Alert>
      {!!downloadWarning && (
        <Alert severity="warning" sx={{ margin: theme.spacing(1, 0) }}>
          {downloadWarning}
        </Alert>
      )}
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={10} md={7} lg={5}>
          <Autocomplete
            value={selectedModelItem}
            onChange={(e, v) => {
              setSelectedModelItem(v);
              setModelName(null);
            }}
            options={
              modelList?.sort((a, b) =>
                a.modelBase.localeCompare(b.modelBase)
              ) || []
            }
            getOptionLabel={(option) =>
              `${option.modelBase}/${option.modelName}`
            }
            renderInput={(props) => (
              <TextField {...props} label={t("live2d:select.model")} />
            )}
            size="small"
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            disabled={!selectedModelItem || showProgress}
            variant="contained"
            onClick={handleShow}
          >
            {t("common:show")}
          </Button>
        </Grid>
      </Grid>
      {showProgress && (
        <ContainerContent>
          <Typography>{progressWords}</Typography>
          <LinearProgress variant="determinate" value={progress} />
        </ContainerContent>
      )}
      <Box
        ref={wrap}
        sx={{
          marginBottom: theme.spacing(2),
          marginTop: theme.spacing(2),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          rowGap: theme.spacing(2),
        }}
      >
        {!!modelData && !showProgress && (
          <Live2DToolbar
            coreModel={coreModel}
            expressions={expressions}
            fullScreenEnabled={fullScreenEnabled}
            idle={idle}
            isFullscreen={isFullscreen}
            motions={motions}
            parameterValues={parameterValues}
            selectedExpression={selectedExpression}
            selectedMotion={selectedMotion}
            selectedParameter={selectedParameter}
            t={t}
            wrapElement={wrap.current}
            onApplyExpression={handleApplyExpression}
            onApplyMotion={handleApplyMotion}
            onDownload={handleDownload}
            onIdleChange={handleIdleChange}
            onParameterChange={handleLive2DParamsChange}
            onReloadModel={handleReloadModel}
            onScreenshot={handleScreenshot}
            onSelectedExpressionChange={setSelectedExpression}
            onSelectedMotionChange={setSelectedMotion}
            onSelectedParameterChange={setSelectedParameter}
          />
        )}
        {/* <canvas ref={canvas}></canvas> */}
        <Box sx={{ width: "fit-content", display: "flex" }}>
          <Stage
            width={stageWidth}
            height={stageHeight}
            ref={stage}
            options={{ backgroundAlpha: 0, antialias: true, autoDensity: true }}
          >
            <Live2dModel
              ref={live2dModel}
              modelData={modelData}
              x={live2dX}
              y={live2dY}
              scaleX={live2dScale}
              scaleY={live2dScale}
              onReady={onLive2dModelReady}
            />
          </Stage>
        </Box>
      </Box>
    </Fragment>
  );
};

export default Live2DView;
