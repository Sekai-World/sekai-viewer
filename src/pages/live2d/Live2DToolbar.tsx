import React from "react";
import {
  Camera,
  CloudDownload,
  Fullscreen,
  FullscreenExit,
  RestartAlt,
} from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Slider,
  Switch,
  TextField,
  Toolbar,
  Tooltip,
} from "@mui/material";
import fscreen from "fscreen";
import type { Cubism4InternalModel } from "@sekai-world/pixi-live2d-display-mulmotion";

interface Live2DToolbarProps {
  coreModel: Cubism4InternalModel["coreModel"] | null;
  expressions: string[];
  fullScreenEnabled: boolean;
  idle: boolean;
  isFullscreen: boolean;
  motions: string[];
  parameterValues: Record<string, number>;
  selectedExpression: string | null;
  selectedMotion: string | null;
  selectedParameter: string | null;
  t: (key: string, options?: Record<string, string | number>) => string;
  wrapElement: HTMLDivElement | null;
  onApplyExpression: () => void;
  onApplyMotion: () => void;
  onDownload: () => void;
  onIdleChange: (value: boolean) => void;
  onParameterChange: (value: number, parameter: string) => void;
  onReloadModel: () => void;
  onScreenshot: () => void;
  onSelectedExpressionChange: (value: string | null) => void;
  onSelectedMotionChange: (value: string | null) => void;
  onSelectedParameterChange: (value: string | null) => void;
}

const Live2DToolbar: React.FC<Live2DToolbarProps> = ({
  coreModel,
  expressions,
  fullScreenEnabled,
  idle,
  isFullscreen,
  motions,
  parameterValues,
  selectedExpression,
  selectedMotion,
  selectedParameter,
  t,
  wrapElement,
  onApplyExpression,
  onApplyMotion,
  onDownload,
  onIdleChange,
  onParameterChange,
  onReloadModel,
  onScreenshot,
  onSelectedExpressionChange,
  onSelectedMotionChange,
  onSelectedParameterChange,
}) => (
  <Toolbar component={Paper} sx={{ width: "100%" }}>
    <Grid container spacing={1} alignItems="center">
      <Grid item>
        <Tooltip title={t("live2d:tooltip.download")}>
          <IconButton onClick={onDownload} size="medium">
            <CloudDownload fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("live2d:tooltip.fullscreen")}>
          {isFullscreen ? (
            <IconButton
              disabled={!fullScreenEnabled}
              onClick={() => fscreen.exitFullscreen()}
              size="large"
            >
              <FullscreenExit fontSize="inherit" />
            </IconButton>
          ) : (
            <IconButton
              disabled={!fullScreenEnabled}
              onClick={() =>
                wrapElement && fscreen.requestFullscreen(wrapElement)
              }
              size="medium"
            >
              <Fullscreen fontSize="inherit" />
            </IconButton>
          )}
        </Tooltip>
        <Tooltip title={t("live2d:tooltip.shot")}>
          <IconButton onClick={onScreenshot} size="medium">
            <Camera fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("live2d:tooltip.reset")}>
          <IconButton onClick={onReloadModel} size="medium">
            <RestartAlt fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid item>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Autocomplete
              value={selectedMotion}
              onChange={(e, value) => onSelectedMotionChange(value)}
              options={motions}
              getOptionLabel={(option) => option}
              renderInput={(props) => (
                <TextField {...props} label={t("live2d:select.motions")} />
              )}
              style={{ minWidth: "350px" }}
              size="small"
            />
          </Grid>
          <Grid item>
            <Button
              disabled={!selectedMotion}
              variant="contained"
              onClick={onApplyMotion}
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
              onChange={(e, value) => onSelectedExpressionChange(value)}
              options={expressions}
              getOptionLabel={(option) => option}
              renderInput={(props) => (
                <TextField {...props} label={t("live2d:select.expressions")} />
              )}
              style={{ minWidth: "250px" }}
              size="small"
            />
          </Grid>
          <Grid item>
            <Button
              disabled={!selectedExpression}
              variant="contained"
              onClick={onApplyExpression}
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
                onChange={(e, value) => onSelectedParameterChange(value)}
                options={coreModel["_parameterIds"] ?? []}
                getOptionLabel={(option) => option}
                renderInput={(props) => (
                  <TextField {...props} label={t("live2d:select.parameters")} />
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
                  parameterValues[selectedParameter] ??
                  coreModel.getParameterValueById(selectedParameter)
                }
                onChange={(e, value) =>
                  onParameterChange(
                    Array.isArray(value) ? value[0] : value,
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
                  onChange={(event) => onIdleChange(event.target.checked)}
                  checked={idle}
                />
              }
              label={t("live2d:select.idle_animation")}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Toolbar>
);

export default Live2DToolbar;
