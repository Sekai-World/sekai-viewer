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
  Camera,
  CloudDownload,
  Fullscreen,
  FullscreenExit,
  RestartAlt,
} from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Slider,
  Switch,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Stage } from "@pixi/react";
import { saveAs } from "file-saver";
import fscreen from "fscreen";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";
import ContainerContent from "../../components/styled/ContainerContent";
import TypographyHeader from "../../components/styled/TypographyHeader";
import { useLive2dModelList } from "../../utils/apiClient";
import {
  InternalModel,
  Live2DModel,
  Cubism4InternalModel,
} from "pixi-live2d-display-mulmotion";
import Live2dModel from "../../components/pixi/Live2dModel";
import { getModelData } from "../../utils/live2dLoader";
import type { ILive2DModelData, ILive2dModelListElement } from "../../types.d";

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
        setIdle(true);

        setShowProgress(false);
        setProgress(0);
        setProgressWords("");
      }
    };

    func();
  }, [modelName, selectedModelItem, t]);

  const handleDownload = useCallback(async () => {
    setShowProgress(true);
    setProgress(0);
    setProgressWords(t("live2d:pack_progress.generate_metadata"));

    const zip = new JSZip();
    const modelData = await getModelData(selectedModelItem!);
    const model3 = {
      FileReferences: {
        Moc: `${modelName}.moc3`,
        Motions: [
          ...modelData.FileReferences.Motions.Motion,
          ...modelData.FileReferences.Motions.Expression,
        ].reduce<{
          [key: string]: [
            {
              File: string;
              FadeInTime: number;
              FadeOutTime: number;
            },
          ];
        }>((prev, m) => {
          prev[m.Name] = [
            {
              FadeInTime: 0.5,
              FadeOutTime: 0.5,
              File: `motions/${m.Name}.motion3.json`,
            },
          ];
          return prev;
        }, {}),
        Physics: `${modelName}.physics3.json`,
        Textures: modelData.FileReferences.Textures.map(
          (_, idx) =>
            `${modelName}.2048/texture_${idx.toString().padStart(2, "0")}.png`
        ),
      },
      Groups: [
        {
          Ids: [],
          Name: "EyeBlink",
          Target: "Parameter",
        },
        {
          Ids: [],
          Name: "LipSync",
          Target: "Parameter",
        },
      ],
      Version: 3,
    };

    zip.file(`${modelName}.model3.json`, JSON.stringify(model3, null, 2));

    setProgress(10);
    setProgressWords(t("live2d:pack_progress.download_texture"));
    for (const [idx, t] of modelData.FileReferences.Textures.entries()) {
      const { data: texture } = await Axios.get(modelData.url + t, {
        responseType: "blob",
      });
      zip.file(model3.FileReferences.Textures[idx], texture);
    }

    setProgress(20);
    setProgressWords(t("live2d:pack_progress.download_moc3"));
    const { data: moc3 } = await Axios.get(
      modelData.url + modelData.FileReferences.Moc,
      { responseType: "blob" }
    );

    zip.file(model3.FileReferences.Moc, moc3);

    setProgress(30);
    setProgressWords(t("live2d:pack_progress.download_physics"));
    const { data: physics } = await Axios.get(
      modelData.url + modelData.FileReferences.Physics,
      { responseType: "blob" }
    );

    zip.file(model3.FileReferences.Physics, physics);

    setProgress(40);
    const total = Object.keys(model3.FileReferences.Motions).length;
    let count = 0;

    const updateCount = () => {
      count++;
      setProgressWords(
        t("live2d:pack_progress.download_motions", { dlcount: count, total })
      );
      setProgress(40 + Math.round(50 * (count / total)));
    };
    setProgressWords(
      t("live2d:pack_progress.download_motions", { dlcount: count, total })
    );

    const tasks = [];
    for (const motion of [
      ...modelData.FileReferences.Motions.Motion,
      ...modelData.FileReferences.Motions.Expression,
    ]) {
      tasks.push(
        Axios.get<Blob>(
          new URL(
            motion.File,
            new URL(modelData.url, window.location.href)
          ).toString(),
          {
            responseType: "blob",
          }
        ).then(({ data }) => {
          updateCount();

          zip.file(model3.FileReferences.Motions[motion.Name][0].File, data);
        })
      );
    }

    await Promise.all(tasks);

    // setProgress(90);
    setProgressWords(t("live2d:pack_progress.generate_zip"));
    const content = await zip.generateAsync({ type: "blob" });
    setProgress(100);
    saveAs(content, `${modelName}.zip`);

    setShowProgress(false);
    setProgress(0);
    setProgressWords("");
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
      app.renderer.plugins.extract
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

  return (
    <Fragment>
      <TypographyHeader>Live2D</TypographyHeader>
      <Alert severity="warning" sx={{ margin: theme.spacing(1, 0) }}>
        {t("common:betaIndicator")}
      </Alert>
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
          <Toolbar component={Paper} sx={{ width: "100%" }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                <Tooltip title={t("live2d:tooltip.download") as string}>
                  <IconButton
                    disabled={!modelData}
                    onClick={handleDownload}
                    size="medium"
                  >
                    <CloudDownload fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("live2d:tooltip.fullscreen") as string}>
                  {isFullscreen ? (
                    <IconButton
                      disabled={!fullScreenEnabled}
                      onClick={() => {
                        fscreen.exitFullscreen();
                      }}
                      size="large"
                    >
                      <FullscreenExit fontSize="inherit" />
                    </IconButton>
                  ) : (
                    <IconButton
                      disabled={!fullScreenEnabled}
                      onClick={() => {
                        fscreen.requestFullscreen(wrap.current!);
                      }}
                      size="medium"
                    >
                      <Fullscreen fontSize="inherit" />
                    </IconButton>
                  )}
                </Tooltip>
                <Tooltip title={t("live2d:tooltip.shot") as string}>
                  <IconButton
                    disabled={!modelData}
                    onClick={handleScreenshot}
                    size="medium"
                  >
                    <Camera fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("live2d:tooltip.reset") as string}>
                  <IconButton
                    disabled={!modelData}
                    onClick={handleReloadModel}
                    size="medium"
                  >
                    <RestartAlt fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Autocomplete
                      value={selectedMotion}
                      onChange={(e, v) => setSelectedMotion(v)}
                      options={motions}
                      getOptionLabel={(option) => option}
                      renderInput={(props) => (
                        <TextField
                          {...props}
                          label={t("live2d:select.motions")}
                        />
                      )}
                      style={{ minWidth: "350px" }}
                      size="small"
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      disabled={!selectedMotion}
                      variant="contained"
                      onClick={() => {
                        if (selectedMotion) {
                          live2dModel.current?.motion(
                            "Motion",
                            motions.indexOf(selectedMotion)
                          );
                        }
                      }}
                    >
                      {t("common:apply")}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Autocomplete
                      value={selectedExpression}
                      onChange={(e, v) => setSelectedExpression(v)}
                      options={expressions}
                      getOptionLabel={(option) => option}
                      renderInput={(props) => (
                        <TextField
                          {...props}
                          label={t("live2d:select.expressions")}
                        />
                      )}
                      style={{ minWidth: "250px" }}
                      size="small"
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      disabled={!selectedExpression}
                      variant="contained"
                      onClick={() => {
                        if (selectedExpression) {
                          live2dModel.current?.motion(
                            "Expression",
                            expressions.indexOf(selectedExpression)
                          );
                        }
                      }}
                    >
                      {t("common:apply")}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              {!!coreModel && (
                <Grid item>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Autocomplete
                        value={selectedParameter}
                        onChange={(e, v) => setSelectedParameter(v)}
                        options={coreModel["_parameterIds"] ?? []}
                        getOptionLabel={(option) => option}
                        renderInput={(props) => (
                          <TextField
                            {...props}
                            label={t("live2d:select.parameters")}
                          />
                        )}
                        style={{ minWidth: "250px" }}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  <Grid item>
                    {!!selectedParameter && (
                      <Slider
                        min={coreModel.getParameterMinimumValue(
                          coreModel["_parameterIds"].indexOf(selectedParameter)
                        )}
                        max={coreModel.getParameterMaximumValue(
                          coreModel["_parameterIds"].indexOf(selectedParameter)
                        )}
                        value={
                          parameterValues[selectedParameter]
                            ? parameterValues[selectedParameter]
                            : coreModel.getParameterValueById(selectedParameter)
                        }
                        onChange={(e, v) =>
                          handleLive2DParamsChange(
                            Array.isArray(v) ? v[0] : v,
                            selectedParameter
                          )
                        }
                        step={0.1}
                      />
                    )}
                  </Grid>
                </Grid>
              )}
              <Grid item>
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Switch
                          onChange={(event) => {
                            const value = event.target.checked;
                            if (
                              live2dModel.current?.internalModel &&
                              "breath" in live2dModel.current.internalModel
                            ) {
                              (
                                live2dModel.current?.internalModel
                                  .breath as Cubism4InternalModel["breath"]
                              ).setParameters(value ? defaultBreath : []);
                              setIdle(value);
                            }
                          }}
                          checked={idle}
                        />
                      }
                      label={t("live2d:select.idle_animation")}
                    />
                  </Grid>
                </Grid>
              </Grid>
              {/* <Grid item>
                {theme.breakpoints.values.md} {window.screen.width}{" "}
                {currentStyleWidth}
              </Grid> */}
            </Grid>
          </Toolbar>
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
