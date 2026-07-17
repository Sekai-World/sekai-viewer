import React, { useCallback, useMemo, useState } from "react";
import {
  Card,
  Button,
  Grid,
  Typography,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Camera, RadioButtonChecked, FileDownload } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { FileType } from "../../utils/ChibiPlayer/SekaiFFmpeg";

const enum LibStatus {
  Unloaded,
  Loading,
  Loaded,
}

export const ChibiCaptureSetting: React.FC<{
  onInitLib: () => Promise<void>;
  onRecord: (
    fps: number,
    targetType: FileType,
    dimension: number,
    sec?: number
  ) => void;
  onScreenshot: () => void;
  spineListLength: number;
}> = ({ onInitLib, onRecord, onScreenshot, spineListLength }) => {
  const { t } = useTranslation();
  const [recordingLibStatus, setRecordingLibStatus] = useState<LibStatus>(
    LibStatus.Unloaded
  );
  const [recordingType, setRecordingType] = useState<FileType>(FileType.WEBP);
  const recordingTypeList = useMemo(
    () => [
      { value: FileType.WEBP, label: t("chibi:filetype.webp") },
      { value: FileType.GIF, label: t("chibi:filetype.gif") },
      { value: FileType.WEBM, label: t("chibi:filetype.webm") },
      { value: FileType.MP4, label: t("chibi:filetype.mp4") },
      { value: FileType.PNG_SEQ, label: t("chibi:filetype.png_sequence") },
    ],
    [t]
  );
  const [lengthSec, setLengthSec] = useState(0);
  const [fps, setFps] = useState(10);
  const fpsList = useMemo(
    () => [
      { value: 5, label: "5" },
      { value: 10, label: "10" },
      { value: 15, label: "15" },
      { value: 30, label: "30" },
    ],
    []
  );
  const [dimension, setDimension] = useState(200);
  const dimensionList = useMemo(
    () => [
      { value: 100, label: "100px" },
      { value: 200, label: "200px" },
      { value: 400, label: "400px" },
      { value: 800, label: "800px" },
    ],
    []
  );

  const handleLoadLib = useCallback(() => {
    setRecordingLibStatus(LibStatus.Loading);
    onInitLib().then(() => setRecordingLibStatus(LibStatus.Loaded));
  }, [onInitLib]);

  return (
    <Card variant="outlined" sx={{ marginTop: 1 }}>
      <Grid container alignItems="stretch" padding={1} spacing={1}>
        <Grid item xs={12} sm={6} md="auto" display="flex" alignItems="stretch">
          <Button
            startIcon={<Camera />}
            variant="contained"
            onClick={onScreenshot}
            disabled={spineListLength === 0}
            fullWidth
          >
            {t("live2d:tooltip.shot")}
          </Button>
        </Grid>
        {recordingLibStatus !== LibStatus.Loaded && (
          <Grid
            item
            xs={12}
            sm={6}
            md="auto"
            display="flex"
            alignItems="stretch"
          >
            <LoadingButton
              loading={recordingLibStatus === LibStatus.Loading}
              loadingPosition="start"
              startIcon={<FileDownload />}
              variant="contained"
              onClick={handleLoadLib}
              fullWidth
            >
              <span>{t("chibi:init_lib")}</span>
            </LoadingButton>
          </Grid>
        )}
        {recordingLibStatus === LibStatus.Loaded && (
          <Grid
            item
            xs={12}
            sm={6}
            md="auto"
            display="flex"
            alignItems="stretch"
          >
            <Button
              startIcon={<RadioButtonChecked />}
              variant="contained"
              onClick={() => {
                onRecord(
                  fps,
                  recordingType,
                  dimension,
                  spineListLength >= 2 && lengthSec !== 0
                    ? lengthSec
                    : undefined
                );
              }}
              disabled={spineListLength === 0}
              fullWidth
            >
              {t("chibi:record")}
            </Button>
          </Grid>
        )}
      </Grid>
      <Divider orientation="horizontal" />
      <Grid container alignItems="center" padding={1} spacing={1}>
        {recordingLibStatus !== LibStatus.Loaded && (
          <Grid item xs>
            <Typography variant="body2" color="text.secondary">
              {t("chibi:init_lib_to_record")}
            </Typography>
          </Grid>
        )}
        {recordingLibStatus === LibStatus.Loaded && (
          <>
            <Grid item xs={12}>
              <Typography>{t("chibi:record_settings")}</Typography>
            </Grid>
            <Grid item xs>
              <Grid container spacing={1}>
                {spineListLength >= 2 && (
                  <Grid item xs sm="auto">
                    <FormControl fullWidth size="small">
                      <InputLabel htmlFor="chibi-recording-length-input">
                        {t("chibi:input.length")}
                      </InputLabel>
                      <OutlinedInput
                        id="chibi-recording-length-input"
                        label={t("chibi:input.length")}
                        endAdornment={
                          <InputAdornment position="end">
                            {t("chibi:input.sec")}
                          </InputAdornment>
                        }
                        type="number"
                        value={lengthSec}
                        onChange={(e) => {
                          const n = parseFloat(e.target.value);
                          let t = n;
                          if (Number.isNaN(n)) t = 0;
                          else if (n > 30) t = 30;
                          else if (n < 0) t = 0;
                          setLengthSec(t);
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs="auto">
                  <FormControl fullWidth size="small">
                    <InputLabel id="chibi-recording-fps-select-label">
                      FPS
                    </InputLabel>
                    <Select
                      labelId="chibi-recording-fps-select-label"
                      id="chibi-recording-fps-select"
                      label="FPS"
                      autoWidth
                      value={fps}
                      onChange={(e) => setFps(Number(e.target.value))}
                    >
                      {fpsList.map((a) => (
                        <MenuItem value={a.value} key={a.value}>
                          {a.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs="auto">
                  <FormControl fullWidth size="small">
                    <InputLabel id="chibi-recording-dimension-select-label">
                      {t("chibi:input.dimension")}
                    </InputLabel>
                    <Select
                      labelId="chibi-recording-dimension-select-label"
                      id="chibi-recording-dimension-select"
                      label={t("chibi:input.dimension")}
                      autoWidth
                      value={dimension}
                      onChange={(e) => setDimension(Number(e.target.value))}
                    >
                      {dimensionList.map((a) => (
                        <MenuItem value={a.value} key={a.value}>
                          {a.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs="auto">
                  <FormControl fullWidth size="small">
                    <InputLabel id="chibi-recording-type-select-label">
                      {t("chibi:input.recording_type")}
                    </InputLabel>
                    <Select
                      labelId="chibi-recording-type-select-label"
                      id="chibi-recording-type-select"
                      label={t("chibi:input.recording_type")}
                      autoWidth
                      value={recordingType}
                      onChange={(e) =>
                        setRecordingType(e.target.value as FileType)
                      }
                    >
                      {recordingTypeList.map((a) => (
                        <MenuItem value={a.value} key={a.value}>
                          {a.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </Card>
  );
};
