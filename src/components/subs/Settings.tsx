import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from "@material-ui/core";
import { Brightness4, Brightness7, BrightnessAuto } from "@material-ui/icons";
import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SettingContext } from "../../context";
import { DisplayModeType, ContentTransModeType } from "../../types";
import { useRemoteLanguages } from "../../utils/apiClient";
import CdnSource from "../../utils/cdnSource";
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
  } = useContext(SettingContext)!;
  const { languages: remoteLanguages, isLoading, error } = useRemoteLanguages();

  const cdns = new CdnSource();

  useEffect(() => {
    if (!isLoading && !error) {
      updateLanguages(remoteLanguages);
    }
  }, [assetI18n, error, i18n, isLoading, remoteLanguages, updateLanguages]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("common:settings.title")}</DialogTitle>
      <DialogContent>
        {/** L18n */}
        <FormControl component="fieldset" style={{ marginBottom: "1%" }}>
          <FormLabel component="legend">{t("common:language")}</FormLabel>
          <Select
            value={lang}
            onChange={(e, v: any) => {
              v = v.props.value;
              i18n.loadLanguages([v]);
              assetI18n.loadLanguages([v]);
              updateLang(v);
            }}
            label="Language"
          >
            {languages
              .filter((lang) => lang.enabled)
              .map((lang) => (
                <MenuItem key={lang.id} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <br />
        {/** Light/Dark theme */}
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
        {/** Translation mode */}
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
        {/** CDN Source */}
        <FormControl component="fieldset" style={{ margin: "1% 0" }}>
          <FormLabel component="legend">
            {t("common:cdnSources.title")}
          </FormLabel>
          {t("common:cdnSources.description")}
          <RadioGroup
            row
            aria-label="show translated"
            value={contentTransMode}
            onChange={(e, v) =>
              updateContentTransMode(v as ContentTransModeType)
            }
          >
            <Select
              value={cdns.getSelectedCdn()}
              onChange={(e, v: any) => {
                v = v.props.value;
                cdns.setPointedCdn(v, "", "");
              }}
              label="CDNs"
            >
              {cdns.getAssetCdns().map((cdn) => (
                <MenuItem key={cdn.name} value={cdn.name}>
                  {t(cdn.l10n_name)}
                </MenuItem>
              ))}
            </Select>
          </RadioGroup>
        </FormControl>
        <br />
        {/** DB CDN Source */}
        <FormControl component="fieldset" style={{ margin: "2% 0" }}>
          <FormLabel component="legend">
            {t("common:dbCdnSources.title")}
          </FormLabel>
          {t("common:dbCdnSources.description")}
          <RadioGroup
            row
            aria-label="show translated"
            value={contentTransMode}
            onChange={(e, v) =>
              updateContentTransMode(v as ContentTransModeType)
            }
          >
            <Select
              value={cdns.getSelectedCdn()}
              onChange={(e, v: any) => {
                v = v.props.value;
                cdns.setPointedDbCdn(v, "", "");
              }}
              label="CDNs"
            >
              {cdns.getDbCdns().map((cdn) => (
                <MenuItem key={cdn.name} value={cdn.name}>
                  {t(cdn.l10n_name)}
                </MenuItem>
              ))}
            </Select>
          </RadioGroup>
        </FormControl>
        <br />
        {/** Changelog CDN Source */}
        <FormControl
          component="fieldset"
          style={{ margin: "2% 0" }}
          hidden={true}
        >
          <FormLabel component="legend">
            {t("common:changelogCdnSources.title")}
          </FormLabel>
          {t("common:changelogCdnSources.description")}
          <Select
            value={cdns.getSelectedCdn()}
            onChange={(e, v: any) => {
              v = v.props.value;
              cdns.setPointedChangelogCdn(v, "", "");
            }}
            label="CDNs"
          >
            {cdns.getChangelogCdns().map((cdn) => (
              <MenuItem key={cdn.name} value={cdn.name}>
                {t(cdn.l10n_name)}
              </MenuItem>
            ))}
          </Select>
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
