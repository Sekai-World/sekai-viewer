import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Switch,
} from "@material-ui/core";
import { Brightness4, Brightness7, BrightnessAuto } from "@material-ui/icons";
import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SettingContext } from "../../context";
import { DisplayModeType, ContentTransModeType } from "../../types";
import { useRemoteLanguages } from "../../utils/apiClient";
import { useAssetI18n } from "../../utils/i18n";

const Settings: React.FC<{
  open: boolean;
  onClose?: () => void;
}> = ({ open, onClose }) => {
  const { t, i18n } = useTranslation();
  const { assetI18n } = useAssetI18n();
  const {
    lang,
    displayMode,
    contentTransMode,
    updateLang,
    updateDisplayMode,
    updateContentTransMode,
    languages,
    updateLanguages,
    isShowSpoiler,
    updateIsShowSpoiler,
  } = useContext(SettingContext)!;
  const { languages: remoteLanguages, isLoading, error } = useRemoteLanguages();

  useEffect(() => {
    if (!isLoading && !error) {
      updateLanguages(remoteLanguages);
      if (!remoteLanguages.find((rl) => rl.code === lang)) {
        // try setting correct language code
        if (remoteLanguages.find((rl) => rl.code === lang.split("-")[0])) {
          updateLang(lang.split("-")[0]);
        }
      }
    }
  }, [
    assetI18n,
    error,
    i18n,
    isLoading,
    lang,
    remoteLanguages,
    updateLang,
    updateLanguages,
  ]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("common:settings.title")}</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" style={{ margin: "1% 0" }}>
          <FormLabel component="legend">{t("common:language")}</FormLabel>
          <RadioGroup
            row
            aria-label="language"
            value={lang}
            onChange={(e, v) => {
              i18n.loadLanguages([v]);
              assetI18n.loadLanguages([v]);
              updateLang(v);
            }}
          >
            {languages
              .filter((lang) => lang.enabled)
              .map((lang) => (
                <FormControlLabel
                  key={lang.id}
                  value={lang.code}
                  control={<Radio />}
                  label={lang.name}
                ></FormControlLabel>
              ))}
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset" style={{ margin: "1% 0" }}>
          <FormLabel component="legend">{t("common:darkmode")}</FormLabel>
          <RadioGroup
            row
            aria-label="dark mode"
            value={displayMode}
            onChange={(e, v) => updateDisplayMode(v as DisplayModeType)}
          >
            <FormControlLabel
              value="dark"
              control={<Radio />}
              label={<Brightness4 />}
            ></FormControlLabel>
            <FormControlLabel
              value="light"
              control={<Radio />}
              label={<Brightness7 />}
            ></FormControlLabel>
            <FormControlLabel
              value="auto"
              control={<Radio />}
              label={<BrightnessAuto />}
            ></FormControlLabel>
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset" style={{ margin: "1% 0" }}>
          <FormLabel component="legend">
            {t("common:contentTranslationMode.title")}
          </FormLabel>
          <RadioGroup
            row
            aria-label="show translated"
            value={contentTransMode}
            onChange={(e, v) =>
              updateContentTransMode(v as ContentTransModeType)
            }
          >
            <FormControlLabel
              value="original"
              control={<Radio />}
              label={t("common:contentTranslationMode.original")}
            ></FormControlLabel>
            <FormControlLabel
              value="translated"
              control={<Radio />}
              label={t("common:contentTranslationMode.translated")}
            ></FormControlLabel>
            <FormControlLabel
              value="both"
              control={<Radio />}
              label={t("common:contentTranslationMode.both")}
            ></FormControlLabel>
          </RadioGroup>
        </FormControl>
        <br />
        <FormControl component="fieldset" style={{ margin: "1% 0" }}>
          <FormLabel component="legend">{t("common:spoilerContent")}</FormLabel>
          <FormControlLabel
            control={
              <Switch
                checked={isShowSpoiler}
                onChange={(e, v) => updateIsShowSpoiler(v)}
                name="checkedA"
              />
            }
            label={t("common:show")}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Settings;
