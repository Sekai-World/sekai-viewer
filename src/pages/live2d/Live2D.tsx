import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Live2D from "@sekai-world/find-live2d-v3";
import Axios from "axios";
import { LAppLive2DManager } from "@sekai-world/find-live2d-v3/dist/types/lapplive2dmanager";
import { LAppModel } from "@sekai-world/find-live2d-v3/dist/types/lappmodel";
import { Alert, Autocomplete, Box } from "@mui/material";
import {
  Button,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../../styles/layout";
import {
  Camera,
  CloudDownload,
  Fullscreen,
  FullscreenExit,
  Videocam,
  VideocamOff,
} from "@mui/icons-material";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import fscreen from "fscreen";
// @ts-ignore
import { CanvasRecorder } from "@tawaship/canvas-recorder";
import { useLive2dModelList } from "../../utils/apiClient";

const Live2DView: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const theme = useTheme();

  const live2dInstance = useMemo(() => new Live2D(), []);
  const [live2dManager, setLive2dManager] = useState<LAppLive2DManager>();
  const [selectedModelName, setSelectedModelName] = useState<string | null>(
    null
  );
  const [modelName, setModelName] = useState<string | null>("");
  const [motionName, setMotionName] = useState<string | null>("");
  const [model, setModel] = useState<LAppModel>();
  const [motions, setMotions] = useState<string[]>([]);
  const [selectedMotion, setSelectedMotion] = useState<string | null>(null);
  const [expressions, setExpressions] = useState<string[]>([]);
  const [selectedExpression, setSelectedExpression] = useState<string | null>(
    null
  );
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressWords, setProgressWords] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<any>();
  const [recordType, setRecordType] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  // const [currentWidth, setCurrentWidth] = useState(0);
  // const [currentStyleWidth, setCurrentStyleWidth] = useState(0);

  const { modelList } = useLive2dModelList();

  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const fullScreenEnabled = fscreen.fullscreenEnabled;

  const updateSize = useCallback(() => {
    if (wrap.current && canvas.current && model) {
      // canvas.current.width = wrap.current.clientWidth;
      const styleWidth = wrap.current.clientWidth;
      const styleHeight =
        window.innerWidth * window.devicePixelRatio >=
        theme.breakpoints.values.xl
          ? (styleWidth * 9) / 16
          : (styleWidth * 4) / 3;
      const displayWidth = styleWidth * window.devicePixelRatio;
      const displayHeight = styleHeight * window.devicePixelRatio;
      model._modelSize =
        window.innerWidth * window.devicePixelRatio >=
        theme.breakpoints.values.xl
          ? displayWidth * 1.3
          : displayWidth * 3;
      // setCurrentWidth(displayWidth);
      // setCurrentStyleWidth(styleWidth);

      canvas.current.style.width = `${styleWidth}px`;
      canvas.current.style.height = `${styleHeight}px`;
      canvas.current.width = displayWidth;
      canvas.current.height = displayHeight;

      model.appear({
        pointX: 140,
        pointY: 60,
      });
    }
  }, [model, theme.breakpoints.values.xl]);

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
    if (wrap.current && canvas.current) {
      canvas.current.getContext("webgl", {
        preserveDrawingBuffer: true,
      });
      setLive2dManager(
        live2dInstance.initialize(undefined, {
          wrap: wrap.current,
          canvas: canvas.current,
        })!
      );
    }
    return () => {
      live2dInstance.release();
    };
  }, [live2dInstance]);

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
      if (live2dManager && modelName) {
        live2dManager.releaseAllModel();
        setModel(undefined);
        setShowProgress(true);

        setProgress(0);
        setProgressWords(t("live2d:load_progress.model_metadata"));
        const { data: modelData } = await Axios.get<{
          Moc3FileName: string;
          TextureNames: string[];
          PhysicsFileName: string;
          UserDataFileName: string;
          AdditionalMotionData: any[];
          CategoryRules: any[];
        }>(
          `${
            window.isChinaMainland
              ? import.meta.env.VITE_ASSET_DOMAIN_CN
              : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
          }/live2d/model/${modelName}_rip/buildmodeldata.asset`,
          { responseType: "json" }
        );

        setProgress(20);
        setProgressWords(t("live2d:load_progress.model_texture"));
        await Axios.get(
          `${
            window.isChinaMainland
              ? import.meta.env.VITE_ASSET_DOMAIN_CN
              : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
          }/live2d/model/${modelName}_rip/${modelData.TextureNames[0]}`
        );

        setProgress(40);
        setProgressWords(t("live2d:load_progress.model_moc3"));
        await Axios.get(
          `${
            window.isChinaMainland
              ? import.meta.env.VITE_ASSET_DOMAIN_CN
              : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
          }/live2d/model/${modelName}_rip/${modelData.Moc3FileName}`
        );

        setProgress(60);
        setProgressWords(t("live2d:load_progress.model_physics"));
        await Axios.get(
          `${
            window.isChinaMainland
              ? import.meta.env.VITE_ASSET_DOMAIN_CN
              : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
          }/live2d/model/${modelName}_rip/${modelData.PhysicsFileName}`
        );

        let motionData;
        if (!modelName.startsWith("normal")) {
          setProgress(80);
          setProgressWords(t("live2d:load_progress.motion_metadata"));
          const { data } = await Axios.get<{
            motions: string[];
            expressions: string[];
          }>(
            `${
              window.isChinaMainland
                ? import.meta.env.VITE_ASSET_DOMAIN_CN
                : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
            }/live2d/motion/${motionName}_rip/BuildMotionData.json`,
            { responseType: "json" }
          );
          motionData = data;
        } else {
          motionData = {
            motions: [],
            expressions: [],
          };
        }

        setProgress(90);
        setProgressWords(t("live2d:load_progress.display_model"));
        const filename = modelData.Moc3FileName.replace(".moc3.bytes", "");
        const model = await live2dManager.addModel(
          {
            path: `${
              window.isChinaMainland
                ? import.meta.env.VITE_ASSET_DOMAIN_CN
                : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
            }/live2d/model/${modelName}_rip/`,
            fileName: filename,
            modelName,
            modelSize: wrap.current!.clientWidth,
            textures: [],
            motions: [
              ...motionData.motions.map((name) => ({
                name,
                url: `${
                  window.isChinaMainland
                    ? import.meta.env.VITE_ASSET_DOMAIN_CN
                    : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
                }/live2d/motion/${motionName}_rip/${name}.motion3.json`,
              })),
              ...motionData.expressions.map((name) => ({
                name,
                url: `${
                  window.isChinaMainland
                    ? import.meta.env.VITE_ASSET_DOMAIN_CN
                    : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
                }/live2d/motion/${motionName}_rip/${name}.motion3.json`,
              })),
            ],
            expressions: [],
          },
          true
        );

        setMotions(motionData.motions);
        setExpressions(motionData.expressions);
        if (model) {
          setModel(model);
        }
        setShowProgress(false);
        setProgress(0);
        setProgressWords("");
      }
    };

    func();
  }, [live2dManager, modelName, motionName, t]);

  const handleDownload = useCallback(async () => {
    setShowProgress(true);
    setProgress(0);
    setProgressWords(t("live2d:pack_progress.generate_metadata"));

    const zip = new JSZip();
    const { data: modelData } = await Axios.get<{
      Moc3FileName: string;
      TextureNames: string[];
      PhysicsFileName: string;
      UserDataFileName: string;
      AdditionalMotionData: any[];
      CategoryRules: any[];
    }>(
      `${
        window.isChinaMainland
          ? import.meta.env.VITE_ASSET_DOMAIN_CN
          : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
      }/live2d/model/${modelName}_rip/buildmodeldata.asset`,
      { responseType: "json" }
    );

    const model3 = {
      Version: 3,
      FileReferences: {
        Moc: `${modelName}.moc3`,
        Textures: [`${modelName}.2048/texture_00.png`],
        Physics: `${modelName}.physics3.json`,
        Motions: [...motions, ...expressions].reduce<{
          [key: string]: [
            {
              File: string;
              FadeInTime: number;
              FadeOutTime: number;
            }
          ];
        }>(
          (sum, elem) =>
            Object.assign({}, sum, {
              [elem]: [
                {
                  File: `motions/${elem}.motion3.json`,
                  FadeInTime: 0.5,
                  FadeOutTime: 0.5,
                },
              ],
            }),
          {}
        ),
      },
      Groups: [
        {
          Target: "Parameter",
          Name: "EyeBlink",
          Ids: [],
        },
        {
          Target: "Parameter",
          Name: "LipSync",
          Ids: [],
        },
      ],
    };

    zip.file(`${modelName}.model3.json`, JSON.stringify(model3, null, 2));

    setProgress(10);
    setProgressWords(t("live2d:pack_progress.download_texture"));
    const { data: texture } = await Axios.get(
      `${
        window.isChinaMainland
          ? import.meta.env.VITE_ASSET_DOMAIN_CN
          : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
      }/live2d/model/${modelName}_rip/${modelData.TextureNames[0]}`,
      { responseType: "blob" }
    );

    zip.file(model3.FileReferences.Textures[0], texture);

    setProgress(20);
    setProgressWords(t("live2d:pack_progress.download_moc3"));
    const { data: moc3 } = await Axios.get(
      `${
        window.isChinaMainland
          ? import.meta.env.VITE_ASSET_DOMAIN_CN
          : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
      }/live2d/model/${modelName}_rip/${modelData.Moc3FileName}`,
      { responseType: "blob" }
    );

    zip.file(model3.FileReferences.Moc, moc3);

    setProgress(30);
    setProgressWords(t("live2d:pack_progress.download_physics"));
    const { data: physics } = await Axios.get(
      `${
        window.isChinaMainland
          ? import.meta.env.VITE_ASSET_DOMAIN_CN
          : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
      }/live2d/model/${modelName}_rip/${modelData.PhysicsFileName}`,
      { responseType: "blob" }
    );

    zip.file(model3.FileReferences.Physics, physics);

    setProgress(40);
    const total = Object.keys(model3.FileReferences.Motions).length;
    let count = 0;

    const updateCount = () => {
      count++;
      setProgressWords(
        t("live2d:pack_progress.download_motions", { total, dlcount: count })
      );
      setProgress(40 + Math.round(50 * (count / total)));
    };
    setProgressWords(
      t("live2d:pack_progress.download_motions", { total, dlcount: count })
    );

    const tasks = [];
    for (let [name, motion] of Object.entries(model3.FileReferences.Motions)) {
      tasks.push(
        Axios.get<Blob>(
          `${
            window.isChinaMainland
              ? import.meta.env.VITE_ASSET_DOMAIN_CN
              : `${import.meta.env.VITE_ASSET_DOMAIN_MINIO}/sekai-assets`
          }/live2d/motion/${motionName}_rip/${name}.motion3.json`,
          { responseType: "blob" }
        ).then(({ data }) => {
          updateCount();

          zip.file(motion[0].File, data);
        })
      );
    }

    await Promise.all(tasks);

    // setProgress(90);
    setProgressWords(t("live2d:pack_progress.generate_zip"));
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${modelName}.zip`);

    setShowProgress(false);
    setProgress(0);
    setProgressWords("");
  }, [expressions, modelName, motionName, motions, t]);

  const handleScreenshot = useCallback(() => {
    if (canvas.current) {
      const screenshot = canvas.current.toDataURL();
      saveAs(screenshot);
    }
  }, []);

  const handleRecord = useCallback(
    async (mimeType: string) => {
      if (isRecording) {
        // end record
        const movie = await recorder!.finishAsync();
        saveAs(movie.blobURL);
        recorder.destroy();
        setRecorder(undefined);
        setIsRecording(false);
      } else {
        // start record
        setRecordType(mimeType);
        const canvasRecorder = await CanvasRecorder.createAsync(
          canvas.current!,
          {
            // @ts-ignore
            mimeType,
          }
        );
        setRecorder(canvasRecorder);
        // @ts-ignore
        canvasRecorder.start();
        setAnchorEl(undefined);
        setIsRecording(true);
      }
    },
    [isRecording, recorder]
  );

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        Live2D
      </Typography>
      <Alert severity="warning" className={layoutClasses.alert}>
        {t("common:betaIndicator")}
      </Alert>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={9} md={4} lg={3} xl={2}>
          <Autocomplete
            value={selectedModelName}
            onChange={(e, v) => setSelectedModelName(v)}
            options={modelList?.sort() || []}
            getOptionLabel={(option) => option}
            renderInput={(props) => (
              <TextField {...props} label={t("live2d:select.model")} />
            )}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            disabled={!selectedModelName || showProgress}
            variant="contained"
            onClick={() => {
              setModelName(selectedModelName);
              setMotionName(
                (selectedModelName?.startsWith("sub") ||
                selectedModelName?.startsWith("clb")
                  ? selectedModelName
                  : selectedModelName?.split("_")[0]) + "_motion_base"
              );
            }}
          >
            {t("common:show")}
          </Button>
        </Grid>
      </Grid>
      {showProgress && (
        <Container className={layoutClasses.content}>
          <Typography>{progressWords}</Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Container>
      )}
      <Box ref={wrap} className={layoutClasses.content}>
        {model && (
          <Toolbar component={Paper}>
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                <Tooltip title={t("live2d:tooltip.download") as string}>
                  <IconButton
                    disabled={!model}
                    onClick={handleDownload}
                    size="large"
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
                      size="large"
                    >
                      <Fullscreen fontSize="inherit" />
                    </IconButton>
                  )}
                </Tooltip>
                <Tooltip title={t("live2d:tooltip.shot") as string}>
                  <IconButton
                    disabled={!model}
                    onClick={handleScreenshot}
                    size="large"
                  >
                    <Camera fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                {window.MediaRecorder && (
                  <Fragment>
                    <Tooltip
                      title={
                        isRecording
                          ? (t("live2d:tooltip.stop_record") as string)
                          : (t("live2d:tooltip.start_record") as string)
                      }
                    >
                      <IconButton
                        disabled={!model}
                        onClick={(e) => {
                          if (isRecording) {
                            handleRecord(recordType);
                          } else {
                            setAnchorEl(e.currentTarget);
                          }
                        }}
                        size="large"
                      >
                        {isRecording ? (
                          <Videocam fontSize="inherit" />
                        ) : (
                          <VideocamOff fontSize="inherit" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEl}
                      open={!!anchorEl}
                      onClose={() => setAnchorEl(undefined)}
                    >
                      <MenuItem
                        disabled={
                          !window.MediaRecorder.isTypeSupported(
                            "video/webm; codecs=vp8"
                          )
                        }
                        onClick={() => {
                          handleRecord("video/webm; codecs=vp8");
                        }}
                      >
                        WebM VP8
                      </MenuItem>
                      <MenuItem
                        disabled={
                          !window.MediaRecorder.isTypeSupported(
                            "video/webm; codecs=vp9"
                          )
                        }
                        onClick={() => {
                          handleRecord("video/webm; codecs=vp9");
                        }}
                      >
                        WebM VP9
                      </MenuItem>
                      <MenuItem
                        disabled={
                          !window.MediaRecorder.isTypeSupported(
                            "video/webm; codecs=h264"
                          )
                        }
                        onClick={() => {
                          handleRecord("video/webm; codecs=h264");
                        }}
                      >
                        WebM H.264 (MKV)
                      </MenuItem>
                      <MenuItem
                        disabled={
                          !window.MediaRecorder.isTypeSupported(
                            "video/webm; codecs=h265"
                          )
                        }
                        onClick={() => {
                          handleRecord("video/webm; codecs=h265");
                        }}
                      >
                        WebM H.265
                      </MenuItem>
                    </Menu>
                  </Fragment>
                )}
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
                      style={{ minWidth: "170px" }}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      disabled={!selectedMotion}
                      variant="contained"
                      onClick={() => {
                        if (selectedMotion) {
                          model.startMotion({
                            groupName: selectedMotion,
                            no: 0,
                            priority: 3,
                            autoIdle: false,
                            autoAppear: false,
                            fadeInTime: 0.5,
                            fadeOutTime: 0.5,
                          });
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
                      style={{ minWidth: "170px" }}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      disabled={!selectedExpression}
                      variant="contained"
                      onClick={() => {
                        if (selectedExpression) {
                          model.startMotion({
                            groupName: selectedExpression,
                            no: 0,
                            priority: 3,
                            autoIdle: false,
                            autoAppear: false,
                            fadeInTime: 0.5,
                            fadeOutTime: 0.5,
                          });
                        }
                      }}
                    >
                      {t("common:apply")}
                    </Button>
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
        <canvas ref={canvas}></canvas>
      </Box>
    </Fragment>
  );
};

export default Live2DView;
