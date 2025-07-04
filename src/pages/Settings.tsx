import {
  // Button,
  // Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  TextField,
} from "@mui/material";
import Brightness4 from "~icons/mdi/brightness-4";
import Brightness7 from "~icons/mdi/brightness-7";
import BrightnessAuto from "~icons/mdi/brightness-auto";
import React, { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  DisplayModeType,
  ContentTransModeType,
  ServerRegion,
} from "../types.d";
import { useRemoteLanguages } from "../utils/apiClient";
import { useAssetI18n } from "../utils/i18n";
import { useRootStore } from "../stores/root";
import { observer } from "mobx-react-lite";
import TypographyHeader from "../components/styled/TypographyHeader";

// const RegionDetect = () => {
//   const { t } = useTranslation();
//   const { showError } = useAlertSnackbar();

//   const [clientRegion, setClientRegion] = useState("unknown");
//   const [isDetecting, setIsDetecting] = useState(false);

//   useEffect(() => {
//     localforage
//       .getItem<string>("country")
//       .then((value) => setClientRegion(value || "unknown"));
//     return () => {
//       setClientRegion("unknown");
//     };
//   }, []);

//   const doDetect = useCallback<
//     React.MouseEventHandler<HTMLButtonElement>
//   >(async () => {
//     setIsDetecting(true);

//     try {
//       const country =
//         (
//           await axios.get<{ data: { country: string } }>(
//             `${import.meta.env.VITE_API_BACKEND_BASE}/country`
//           )
//         ).data.data.country || "unknown";
//       setClientRegion(country);
//       localforage.setItem<string>("country", country);
//     } catch (error) {
//       showError(t("common:detectionFailedPrompt"));
//       setClientRegion("unknown");
//       localforage.setItem<string>("country", "unknown");
//     }

//     setIsDetecting(false);
//   }, [showError, t]);

//   return (
//     <Grid container alignItems="center" spacing={2}>
//       <Grid item>
//         <Typography>{clientRegion}</Typography>
//       </Grid>
//       <Grid item>
//         <LoadingButton
//           loading={isDetecting}
//           startIcon={<IconRefresh />}
//           onClick={doDetect}
//         ></LoadingButton>
//       </Grid>
//     </Grid>
//   );
// };

/**
 * Get default model for each translation provider
 */
const getDefaultModelForProvider = (provider: string): string => {
  switch (provider) {
    case "openai":
      return "gpt-4o-mini";
    case "anthropic":
      return "claude-3.5-haiku";
    case "google":
      return "gemini-2.0-flash";
    case "openrouter":
      return "deepseek/deepseek-chat-v3-0324:free";
    default:
      return "";
  }
};

const Settings = observer(() => {
  const { t, i18n } = useTranslation();
  const { assetI18n } = useAssetI18n();
  const {
    settings: {
      lang,
      displayMode,
      contentTransMode,
      languages,
      isShowSpoiler,
      isSpoilerMosaicked,
      region,
      // LLM Translation Settings
      enableLlmTranslation,
      llmTranslationProvider,
      llmModel,
      llmApiKey,
      llmApiEndpoint,
      targetLanguage,
      showOriginalText,
      setLang,
      setDisplayMode,
      setContentTransMode,
      setLanguages,
      setIsShowSpoiler,
      setIsSpoilerMosaicked,
      setRegion,
      // LLM Translation Actions
      setEnableLlmTranslation,
      setLlmTranslationProvider,
      setLlmModel,
      setLlmApiKey,
      setLlmApiEndpoint,
      setTargetLanguage,
      setShowOriginalText,
    },
  } = useRootStore();
  const { languages: remoteLanguages, isLoading, error } = useRemoteLanguages();

  useEffect(() => {
    if (!isLoading && !error) {
      setLanguages(remoteLanguages);
      if (!remoteLanguages.find((rl) => rl.code === lang)) {
        // try setting correct language code
        if (remoteLanguages.find((rl) => rl.code === lang.split("-")[0])) {
          setLang(lang.split("-")[0]);
        }
      }
    }
  }, [error, isLoading, lang, remoteLanguages, setLang, setLanguages]);

  return (
    <Fragment>
      <TypographyHeader>{t("common:settings.title")}</TypographyHeader>
      <br />
      <Grid container direction="column">
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
                label={t("common:serverRegion.jp") as string}
              ></FormControlLabel>
              <FormControlLabel
                value="tw"
                control={<Radio />}
                label={t("common:serverRegion.tw") as string}
              ></FormControlLabel>
              <FormControlLabel
                value="en"
                control={<Radio />}
                label={t("common:serverRegion.en") as string}
              ></FormControlLabel>
              <FormControlLabel
                value="kr"
                control={<Radio />}
                label={t("common:serverRegion.kr") as string}
              ></FormControlLabel>
              <FormControlLabel
                value="cn"
                control={<Radio />}
                label={t("common:serverRegion.cn") as string}
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
                // i18n.loadLanguages([v]);
                // assetI18n.loadLanguages([v]);
                i18n.changeLanguage(v);
                assetI18n.changeLanguage(v);
                setLang(v);
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
              onChange={(e, v) => setDisplayMode(v as DisplayModeType)}
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
                setContentTransMode(v as ContentTransModeType)
              }
            >
              <FormControlLabel
                value="original"
                control={<Radio />}
                label={t("common:contentTranslationMode.original") as string}
              ></FormControlLabel>
              <FormControlLabel
                value="translated"
                control={<Radio />}
                label={t("common:contentTranslationMode.translated") as string}
              ></FormControlLabel>
              <FormControlLabel
                value="both"
                control={<Radio />}
                label={t("common:contentTranslationMode.both") as string}
              ></FormControlLabel>
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      <br />
      <TypographyHeader>{t("common:miscs")}</TypographyHeader>
      <Grid container direction="column">
        <Grid item>
          <FormControl component="fieldset" style={{ margin: "1% 0" }}>
            <FormLabel component="legend">
              {t("common:spoilerContent")}
            </FormLabel>
            <FormControlLabel
              control={
                <Switch
                  checked={isShowSpoiler}
                  onChange={(e, v) => setIsShowSpoiler(v)}
                  name="checkedA"
                />
              }
              label={t("common:show") as string}
            />
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl component="fieldset" style={{ margin: "1% 0" }}>
            <FormLabel component="legend">
              {t("common:spoilerContentMosaicked")}
            </FormLabel>
            <FormControlLabel
              control={
                <Switch
                  checked={isSpoilerMosaicked}
                  onChange={(e, v) => setIsSpoilerMosaicked(v)}
                  name="checkedB"
                />
              }
              label={t("common:show") as string}
            />
          </FormControl>
        </Grid>
      </Grid>
      <br />
      <TypographyHeader>{t("common:settings.llm.title")}</TypographyHeader>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <FormControl component="fieldset">
            <FormLabel component="legend">
              {t("common:settings.llm.enable")}
            </FormLabel>
            <FormControlLabel
              control={
                <Switch
                  checked={enableLlmTranslation}
                  onChange={(e, v) => setEnableLlmTranslation(v)}
                />
              }
              label={t("common:settings.llm.enableDescription") as string}
            />
          </FormControl>
        </Grid>

        {enableLlmTranslation && (
          <>
            <Grid item>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">
                  {t("common:settings.llm.provider")}
                </FormLabel>
                <RadioGroup
                  row
                  value={llmTranslationProvider}
                  onChange={(e, v) =>
                    setLlmTranslationProvider(
                      v as
                        | "openai"
                        | "anthropic"
                        | "google"
                        | "openrouter"
                        | "custom"
                    )
                  }
                >
                  <FormControlLabel
                    value="openai"
                    control={<Radio />}
                    label="OpenAI"
                  />
                  <FormControlLabel
                    value="anthropic"
                    control={<Radio />}
                    label="Anthropic"
                  />
                  <FormControlLabel
                    value="google"
                    control={<Radio />}
                    label="Google"
                  />
                  <FormControlLabel
                    value="openrouter"
                    control={<Radio />}
                    label="OpenRouter"
                  />
                  <FormControlLabel
                    value="custom"
                    control={<Radio />}
                    label="Custom"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item>
              <TextField
                fullWidth
                label={t("common:settings.llm.model")}
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                placeholder={getDefaultModelForProvider(llmTranslationProvider)}
                helperText={t("common:settings.llm.modelDescription", {
                  defaultModel: getDefaultModelForProvider(
                    llmTranslationProvider
                  ),
                })}
              />
            </Grid>

            <Grid item>
              <TextField
                fullWidth
                label={t("common:settings.llm.apiKey")}
                type="password"
                value={llmApiKey}
                onChange={(e) => setLlmApiKey(e.target.value)}
                helperText={t("common:settings.llm.apiKeyDescription")}
              />
            </Grid>

            {llmTranslationProvider === "custom" && (
              <Grid item>
                <TextField
                  fullWidth
                  label={t("common:settings.llm.apiEndpoint")}
                  value={llmApiEndpoint}
                  onChange={(e) => setLlmApiEndpoint(e.target.value)}
                  helperText={t("common:settings.llm.apiEndpointDescription")}
                />
              </Grid>
            )}

            <Grid item>
              <TextField
                fullWidth
                label={t("common:settings.llm.targetLanguage")}
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                helperText={t("common:settings.llm.targetLanguageDescription")}
              />
            </Grid>

            <Grid item>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  {t("common:settings.llm.displayOptions")}
                </FormLabel>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOriginalText}
                      onChange={(e, v) => setShowOriginalText(v)}
                    />
                  }
                  label={t("common:settings.llm.displayOptionsDescription")}
                />
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
    </Fragment>
  );
});

export default Settings;
