import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Stack,
  Grid,
  Slider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { VolumeDown, VolumeUp } from "@mui/icons-material";
import PaperContainer from "../../components/styled/PaperContainer";

import { ILive2DPlayerSettings } from "../../utils/Live2DPlayer/types.d";

const StoryReaderLive2DSettings: React.FC<{
  settings: ILive2DPlayerSettings;
  onSettingsChange: (settings: ILive2DPlayerSettings) => void;
}> = ({ settings, onSettingsChange }) => {
  const { t } = useTranslation();

  const handleBgmVolumeChange = useCallback(
    (_: Event, newBgmVolume: number | number[]) => {
      const volume = newBgmVolume as number;
      onSettingsChange({ ...settings, bgmVolume: volume });
    },
    [settings]
  );
  const handleSeVolumeChange = useCallback(
    (_: Event, newSeVolume: number | number[]) => {
      const volume = newSeVolume as number;
      onSettingsChange({ ...settings, seVolume: volume });
    },
    [settings]
  );
  const handleVoiceVolumeChange = useCallback(
    (_: Event, newVoiceVolume: number | number[]) => {
      const volume = newVoiceVolume as number;
      onSettingsChange({ ...settings, voiceVolume: volume });
    },
    [settings]
  );
  const handleTextAnimationChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSettingsChange({ ...settings, textAnimation: event.target.checked });
    },
    [settings]
  );
  const handleAutoplayChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSettingsChange({ ...settings, autoplay: event.target.checked });
    },
    [settings]
  );
  const handleShowWarningChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSettingsChange({ ...settings, showWarning: event.target.checked });
    },
    [settings]
  );
  const handleShowUIChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSettingsChange({ ...settings, showUI: event.target.checked });
    },
    [settings]
  );

  return (
    <PaperContainer>
      <Stack spacing={1} direction="column">
        <Grid container sx={{ p: 0 }}>
          <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              sx={{ height: 1, padding: 1 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.autoplay}
                    onChange={handleAutoplayChange}
                  />
                }
                label={t("story_reader_live2d:auto_play")}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              sx={{ height: 1, padding: 1 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.textAnimation}
                    onChange={handleTextAnimationChange}
                  />
                }
                label={t("story_reader_live2d:settings.text_animation")}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              sx={{ height: 1, padding: 1 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.showUI}
                    onChange={handleShowUIChange}
                  />
                }
                label={t("story_reader_live2d:settings.showUI")}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <Stack direction="column" sx={{ padding: 1 }}>
              <Typography>
                {t("story_reader_live2d:settings.bgm_volume")}
              </Typography>
              <Stack spacing={1} direction="row" alignItems="center">
                <VolumeDown />
                <Slider
                  value={settings.bgmVolume}
                  onChange={handleBgmVolumeChange}
                />
                <VolumeUp />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <Stack direction="column" sx={{ padding: 1 }}>
              <Typography>
                {t("story_reader_live2d:settings.voice_volume")}
              </Typography>
              <Stack spacing={1} direction="row" alignItems="center">
                <VolumeDown />
                <Slider
                  value={settings.voiceVolume}
                  onChange={handleVoiceVolumeChange}
                />
                <VolumeUp />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <Stack direction="column" sx={{ padding: 1 }}>
              <Typography>
                {t("story_reader_live2d:settings.se_volume")}
              </Typography>
              <Stack spacing={1} direction="row" alignItems="center">
                <VolumeDown />
                <Slider
                  value={settings.seVolume}
                  onChange={handleSeVolumeChange}
                />
                <VolumeUp />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              sx={{ height: 1, padding: 1 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.showWarning}
                    onChange={handleShowWarningChange}
                  />
                }
                label={t("story_reader_live2d:settings.show_warning")}
              />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </PaperContainer>
  );
};

StoryReaderLive2DSettings.displayName = "StoryReaderLive2DSettings";
export default StoryReaderLive2DSettings;
