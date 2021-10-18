import {
  // Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from "@material-ui/core";
import { Brightness4, Brightness7, BrightnessAuto } from "mdi-material-ui";
import React, { Fragment, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SettingContext } from "../context";
import { useLayoutStyles } from "../styles/layout";
import { DisplayModeType, ContentTransModeType, ServerRegion } from "../types";
import { useServerRegion } from "../utils";
import { useRemoteLanguages } from "../utils/apiClient";
import { useAssetI18n } from "../utils/i18n";

const Settings = () => {
  const layoutClasses = useLayoutStyles();
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
  const [region, setRegion] = useServerRegion();

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
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:settings.title")}
      </Typography>
      <br />
      <Grid direction="column">
        <Grid item>
          <FormControl component="fieldset" style={{ margin: "1% 0" }}>
            <FormLabel component="legend">
              {t("common:serverRegionSelect")}
            </FormLabel>
            <RadioGroup
              row
              aria-label="show translated"
              value={region}
              onChange={(e, v) => setRegion(v as ServerRegion)}
            >
              <FormControlLabel
                value="jp"
                control={<Radio />}
                label={t("common:serverRegion.jp")}
              ></FormControlLabel>
              <FormControlLabel
                value="tw"
                control={<Radio />}
                label={t("common:serverRegion.tw")}
              ></FormControlLabel>
              <FormControlLabel
                value="en"
                control={<Radio />}
                label={t("common:serverRegion.en")}
                disabled
              ></FormControlLabel>
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item>
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
        </Grid>
        <Grid item>
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
        </Grid>
        <Grid item>
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
        </Grid>
        <Grid item>
          <FormControl component="fieldset" style={{ margin: "1% 0" }}>
            <FormLabel component="legend">
              {t("common:spoilerContent")}
            </FormLabel>
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
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default Settings;
