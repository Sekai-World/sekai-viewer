import React, { useEffect, useState } from "react";
import {
  Stack,
  Box,
  Card,
  Button,
  IconButton,
  Autocomplete,
  Grid,
  TextField,
  Switch,
  Tooltip,
  Typography,
  Collapse,
  Divider,
  ToggleButton,
  Slider,
} from "@mui/material";
import {
  ZoomIn,
  RotateRight,
  Delete,
  ArrowUpwardRounded,
  ArrowDownwardRounded,
  UnfoldMoreRounded,
  UnfoldLessRounded,
  Flip,
} from "@mui/icons-material";
import { loadChibiAssets } from "../../utils/ChibiPlayer/load";
import { useTranslation } from "react-i18next";
export interface IChibiSpineState {
  id: number;
  spine: string;
  selectedAnimation: string | null;
  animationList: string[];
  status: "loading" | "loaded";
  on: boolean;
  scale: number;
  flip: boolean;
  rotation: number;
}

export const ChibiListItem: React.FC<{
  state: IChibiSpineState;
  onChangeState: (state: IChibiSpineState, setTransform?: boolean) => void;
  onDelete: (id: number) => void;
  onMove: (id: number, offset: number) => void;
  onSetAnimation: (id: number, animation: string) => void;
}> = ({ state, onChangeState, onDelete, onMove, onSetAnimation }) => {
  const { t } = useTranslation();
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    if (state.status === "loading") {
      loadChibiAssets(state.spine).then((animationList) => {
        onChangeState({ ...state, status: "loaded", animationList });
      });
    }
  }, [state.status]);

  return (
    <Card variant="outlined">
      <Grid container alignItems="center">
        <Grid item xs="auto">
          <Tooltip title={t("common:show")}>
            <span>
              <Switch
                disabled={!(state.status === "loaded")}
                checked={state.on}
                onChange={(e) =>
                  onChangeState({ ...state, on: e.target.checked }, true)
                }
              />
            </span>
          </Tooltip>
        </Grid>
        <Grid item xs="auto" alignSelf="stretch">
          <Divider orientation="vertical" />
        </Grid>
        <Grid item xs margin={1}>
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs={12} sm={12} md={12} lg="auto" xl="auto">
              <Typography>
                {state.id}. {state.spine}
              </Typography>
            </Grid>
            <Grid item xs={12} sm md lg xl>
              <Autocomplete
                value={state.selectedAnimation}
                onChange={(_, v) => {
                  onChangeState({ ...state, selectedAnimation: v });
                }}
                options={state.animationList}
                renderInput={(props) => (
                  <TextField {...props} label={t("chibi:select.animation")} />
                )}
                size="small"
              />
            </Grid>
            <Grid item xs sm="auto">
              <Box display="flex">
                <Button
                  disabled={!state.selectedAnimation}
                  onClick={() => {
                    if (state.selectedAnimation)
                      onSetAnimation(state.id, state.selectedAnimation);
                  }}
                  variant="contained"
                  sx={{ flexGrow: 1, alignContent: "center" }}
                >
                  {t("common:apply")}
                </Button>
              </Box>
            </Grid>
            <Grid item xs="auto" alignSelf="stretch">
              <Divider orientation="vertical" />
            </Grid>
            <Grid item xs="auto">
              <Tooltip title={t("chibi:tooltip.moveup")}>
                <IconButton onClick={() => onMove(state.id, -1)}>
                  <ArrowUpwardRounded />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("chibi:tooltip.movedown")}>
                <IconButton onClick={() => onMove(state.id, 1)}>
                  <ArrowDownwardRounded />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("common:delete")}>
                <IconButton onClick={() => onDelete(state.id)}>
                  <Delete />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("chibi:tooltip.expand")}>
                <IconButton onClick={() => setExpand((e) => !e)}>
                  {expand ? <UnfoldLessRounded /> : <UnfoldMoreRounded />}
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Collapse in={expand} timeout="auto">
        <Divider orientation="horizontal" />
        <Grid container alignItems="center" spacing={1} padding={1}>
          <Grid item xs="auto">
            <Tooltip title={t("chibi:tooltip.flip")}>
              <ToggleButton
                value="mirror"
                selected={state.flip}
                onChange={() =>
                  onChangeState({ ...state, flip: !state.flip }, true)
                }
                size="small"
              >
                <Flip />
              </ToggleButton>
            </Tooltip>
          </Grid>
          <Grid item xs="auto" alignSelf="stretch">
            <Divider orientation="vertical" />
          </Grid>
          <Grid item xs>
            <Stack
              spacing={2}
              paddingRight={2}
              direction="row"
              sx={{ alignItems: "center" }}
            >
              <RotateRight color="primary" />
              <Slider
                defaultValue={0}
                shiftStep={30}
                step={5}
                min={0}
                max={360}
                value={state.rotation}
                onChange={(_, v) => {
                  onChangeState({ ...state, rotation: v as number }, true);
                }}
                track={false}
                valueLabelFormat={(v) => `${t("chibi:select.rotaion")}: ${v}°`}
                valueLabelDisplay="on"
              />
            </Stack>
          </Grid>
          <Grid item xs="auto" alignSelf="stretch">
            <Divider orientation="vertical" />
          </Grid>
          <Grid item xs>
            <Stack
              spacing={2}
              paddingRight={2}
              direction="row"
              sx={{ alignItems: "center" }}
            >
              <ZoomIn color="primary" />
              <Slider
                defaultValue={1}
                shiftStep={0.5}
                step={0.05}
                min={0.1}
                max={3}
                value={state.scale}
                onChange={(_, v) => {
                  onChangeState({ ...state, scale: v as number }, true);
                }}
                track={false}
                valueLabelFormat={(v) => `${t("chibi:select.zoom")}: ${v}`}
                valueLabelDisplay="on"
              />
            </Stack>
          </Grid>
        </Grid>
      </Collapse>
    </Card>
  );
};
