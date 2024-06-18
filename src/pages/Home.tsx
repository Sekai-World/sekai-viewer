import { Link, Typography, useTheme, Grid, Box, Chip } from "@mui/material";
import {
  Album,
  AspectRatio,
  GitHub,
  // MonetizationOn,
  MoveToInbox,
  OpenInNew,
  Settings as SettingsIcon,
  Textsms,
  Timeline,
  Translate,
  Twitter,
} from "@mui/icons-material";
import { Alert, AlertTitle } from "@mui/material";
import Calculator from "~icons/mdi/calculator";
import CalendarText from "~icons/mdi/calendar-text";
import Discord from "~icons/mdi/discord";
import Patreon from "~icons/mdi/patreon";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { getJPTime, useVersionInfo } from "../utils";
import AnnouncementWidget from "../components/widgets/AnnouncementWidget";
import CurrentEventWidget from "../components/widgets/CurrentEventWidget";
// import AdSense from "../components/blocks/AdSenseBlock";
import SekaiGameNews from "../components/blocks/SekaiGameNews";
import { useRootStore } from "../stores/root";
import Countdown from "../components/widgets/Countdown";
import ContainerContent from "../components/styled/ContainerContent";
import TypographyHeader from "../components/styled/TypographyHeader";
import LinkNoDecoration from "../components/styled/LinkNoDecoration";

interface IDetectResult {
  webp: number;
  webpLossless: number;
  webpAlpha: number;
}

function getWebpDetectSeverity(detected: IDetectResult) {
  const sum = detected.webp + detected.webpLossless + detected.webpAlpha;
  switch (sum) {
    case -3:
      return "info";
    case 0:
      return "warning";
    case 3:
      return "success";
    default:
      return "warning";
  }
}

const VersionInfo: React.FC<unknown> = () => {
  const { t } = useTranslation();

  const [version] = useVersionInfo();

  return (
    (!!version && (
      <Fragment>
        <TypographyHeader>{t("home:versionInfo.caption")}</TypographyHeader>
        <ContainerContent>
          <Grid container spacing={2}>
            <Grid item>
              <Grid container alignItems="center">
                <Grid item>{t("home:versionInfo.gameClientVer")}</Grid>
                <Grid item>
                  <Chip label={version.appVersion} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="center">
                <Grid item>{t("home:versionInfo.dataVer")}</Grid>
                <Grid item>
                  <Chip label={version.dataVersion} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="center">
                <Grid item>{t("home:versionInfo.assetVer")}</Grid>
                <Grid item>
                  <Chip label={version.assetVersion} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="center">
                <Grid item>{t("home:versionInfo.multiPlayerVer")}</Grid>
                <Grid item>
                  <Chip label={version.multiPlayVersion} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </ContainerContent>
      </Fragment>
    )) ||
    null
  );
};

const Home: React.FC = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const {
    settings: { isShowSpoiler, region },
  } = useRootStore();

  const [jpTime] = useState<string>(getJPTime());

  const splitJPTime = useMemo(() => jpTime.split("/"), [jpTime]);

  useEffect(() => {
    document.title = t("title:home");
  }, [t]);

  const [detected, setDetected] = useState<IDetectResult>({
    webp: -1,
    webpAlpha: -1,
    webpLossless: -1,
  });

  useEffect(() => {
    setDetected({
      webp: Number(Modernizr.webp),
      webpAlpha: Number(Modernizr.webpalpha),
      webpLossless: Number(Modernizr.webplossless),
    });
  }, []);

  return (
    <Fragment>
      <ContainerContent>
        <Box
          paddingTop="1%"
          paddingBottom="1%"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {new Date().getTime() - 1735689600000 > 0 &&
          new Date().getTime() - 1735689600000 < 259200000 ? (
            <Typography align="center" variant="h4">
              {t("home:happy_new_year")}
            </Typography>
          ) : (
            1735689600000 - new Date().getTime() > 0 &&
            1735689600000 - new Date().getTime() < 259200000 && (
              <Fragment>
                <Typography align="center" variant="h4">
                  {t("home:new_year_countdown")}
                </Typography>
                <Countdown endDate={new Date(1735689600000)} />
              </Fragment>
            )
          )}
        </Box>
        <Box
          paddingTop="1%"
          paddingBottom="1%"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {new Date().getTime() - 1727622000000 > 0 &&
          new Date().getTime() - 1727622000000 < 604800000 ? (
            <Typography align="center" variant="h4">
              {t("home:happy_anniversary", { year: "4th" })}
            </Typography>
          ) : (
            1727622000000 - new Date().getTime() > 0 &&
            1727622000000 - new Date().getTime() < 604800000 && (
              <Fragment>
                <Typography align="center" variant="h4">
                  {t("home:anniversary_countdown", { year: "4th" })}
                </Typography>
                <Countdown endDate={new Date(1727622000000)} />
              </Fragment>
            )
          )}
        </Box>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            {jpTime === "12/6" ? (
              <img
                src={`/images/banner-shizuku.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "12/27" ? (
              <img
                src={`/images/banner-rin-ren.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "1/8" ? (
              <img
                src={`/images/banner-shiho.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "1/27" ? (
              <img
                src={`/images/banner-mafuyu.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "1/30" ? (
              <img
                src={`/images/banner-luka.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "2/17" ? (
              <img
                src={`/images/banner-kaito.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "4/14" ? (
              <img
                src={`/images/banner-minori.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "7/20" ? (
              <img
                src={`/images/banner-nene.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "7/26" ? (
              <img
                src={`/images/banner-an.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "10/5" ? (
              <img
                src={`/images/banner-haruka.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "9/30" ||
              (splitJPTime[0] === "10" && Number(splitJPTime[1]) < 16) ? (
              <img
                src={`/images/banner-anni.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            ) : (
              <img
                src={`/images/banner-new.webp`}
                alt="banner"
                style={{ height: "auto", width: "100%" }}
                width="1500"
                height="500"
              />
            )}
          </Grid>
        </Grid>
        <Alert sx={{ margin: theme.spacing(1, 0) }} severity="info">
          {t("home:disclaimer")}
        </Alert>
        {getWebpDetectSeverity(detected) !== "success" && (
          <Alert
            sx={{ margin: theme.spacing(1, 0) }}
            severity={getWebpDetectSeverity(detected)}
          >
            <AlertTitle>WebP {t("common:support")}</AlertTitle>
            <Trans
              i18nKey="home:detect.warning"
              components={{
                l: <Link href="https://caniuse.com/webp" underline="hover" />,
              }}
            />
          </Alert>
        )}
      </ContainerContent>
      <TypographyHeader>{t("home:directLink.caption")}</TypographyHeader>
      <ContainerContent>
        <Grid container rowSpacing={2}>
          <Grid item container columnSpacing={2} rowSpacing={1}>
            <Grid item>
              <LinkNoDecoration
                to="/card"
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <AspectRatio fontSize="small"></AspectRatio>
                  </Grid>
                  <Grid item>{t("common:card")}</Grid>
                </Grid>
              </LinkNoDecoration>
            </Grid>
            <Grid item>
              <LinkNoDecoration
                to="/music"
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Album fontSize="small"></Album>
                  </Grid>
                  <Grid item>{t("common:music")}</Grid>
                </Grid>
              </LinkNoDecoration>
            </Grid>
            <Grid item>
              <LinkNoDecoration
                to="/gacha"
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <MoveToInbox fontSize="small"></MoveToInbox>
                  </Grid>
                  <Grid item>{t("common:gacha")}</Grid>
                </Grid>
              </LinkNoDecoration>
            </Grid>
            <Grid item>
              <LinkNoDecoration
                to="/event"
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <CalendarText fontSize="small"></CalendarText>
                  </Grid>
                  <Grid item>{t("common:event")}</Grid>
                </Grid>
              </LinkNoDecoration>
            </Grid>
            <Grid item>
              <LinkNoDecoration
                to="/music_recommend"
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Calculator fontSize="small"></Calculator>
                  </Grid>
                  <Grid item>{t("common:musicRecommend")}</Grid>
                </Grid>
              </LinkNoDecoration>
            </Grid>
            <Grid item>
              <LinkNoDecoration
                to="/eventtracker"
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Timeline fontSize="small"></Timeline>
                  </Grid>
                  <Grid item>{t("common:eventTracker")}</Grid>
                </Grid>
              </LinkNoDecoration>
            </Grid>
            <Grid item>
              <LinkNoDecoration
                to="/storyreader"
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Textsms fontSize="small"></Textsms>
                  </Grid>
                  <Grid item>{t("common:storyReader")}</Grid>
                </Grid>
              </LinkNoDecoration>
            </Grid>
          </Grid>
          <Grid item container columnSpacing={2} rowSpacing={1}>
            <Grid item>
              <LinkNoDecoration
                to="/settings"
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <SettingsIcon fontSize="small"></SettingsIcon>
                  </Grid>
                  <Grid item>{t("common:settings.title")}</Grid>
                </Grid>
              </LinkNoDecoration>
            </Grid>
            <Grid item>
              <Link
                href="https://www.transifex.com/dnaroma/sekai-viewer"
                target="_blank"
                underline="hover"
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Translate fontSize="small"></Translate>
                  </Grid>
                  <Grid item>{t("home:alert1.translation")}</Grid>
                </Grid>
              </Link>
            </Grid>
            <Grid item>
              <Link
                href="https://github.com/Sekai-World/sekai-viewer"
                target="_blank"
                underline="hover"
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <GitHub fontSize="small"></GitHub>
                  </Grid>
                  <Grid item>{t("home:alert1.development")}</Grid>
                </Grid>
              </Link>
            </Grid>
            {i18n.language.startsWith("zh") && (
              <Grid item>
                <Link
                  href="https://b23.tv/AIjzvc"
                  target="_blank"
                  underline="hover"
                >
                  <Grid container direction="row" alignContent="center">
                    <Grid item>
                      <OpenInNew fontSize="small"></OpenInNew>
                    </Grid>
                    <Grid item>攻略合集（by @xfl33）</Grid>
                  </Grid>
                </Link>
              </Grid>
            )}
            <Grid item>
              <Link
                href="https://www.patreon.com/bePatron?u=6503151"
                target="_blank"
                underline="hover"
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Patreon fontSize="small" />
                  </Grid>
                  <Grid item>Patreon</Grid>
                </Grid>
              </Link>
            </Grid>
            {/* {window.isChinaMainland && (
              <Grid item>
                <Link
                  href="https://afdian.net/@sekaiviewer"
                  target="_blank"
                  underline="hover"
                >
                  <Grid container direction="row" alignContent="center">
                    <Grid item>
                      <OpenInNew fontSize="small" />
                    </Grid>
                    <Grid item>爱发电</Grid>
                  </Grid>
                </Link>
              </Grid>
            )} */}
            <Grid item>
              <LinkNoDecoration
                to="/about"
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <OpenInNew fontSize="small" />
                  </Grid>
                  <Grid item>{t("home:directLink.contribList")}</Grid>
                </Grid>
              </LinkNoDecoration>
            </Grid>
            <Grid item>
              <Link
                href="https://github.com/Sekai-World/sekai-viewer/blob/main/CHANGELOG.md"
                target="_blank"
                underline="hover"
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <OpenInNew fontSize="small" />
                  </Grid>
                  <Grid item>{t("home:changelog")}</Grid>
                </Grid>
              </Link>
            </Grid>
          </Grid>
          <Grid item container columnSpacing={2} rowSpacing={1}>
            <Grid item>
              <Link
                href="https://www.twitter.com/SekaiViewer"
                target="_blank"
                underline="hover"
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Twitter fontSize="small"></Twitter>
                  </Grid>
                  <Grid item>@SekaiViewer</Grid>
                </Grid>
              </Link>
            </Grid>
            <Grid item>
              <Link
                href="https://discord.gg/xcDBRMd"
                target="_blank"
                underline="hover"
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Discord fontSize="small"></Discord>
                  </Grid>
                  <Grid item>Sekai Viewer</Grid>
                </Grid>
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </ContainerContent>
      <VersionInfo />
      {/* <AdSense
        client="ca-pub-7767752375383260"
        slot="7908750736"
        format="auto"
        responsive="true"
      /> */}
      <Grid container spacing={1}>
        <Grid item xs={12} md={6}>
          <CurrentEventWidget />
        </Grid>
        <Grid item xs={12} md={6}>
          <AnnouncementWidget />
        </Grid>
      </Grid>
      <TypographyHeader>{t("home:game-news.title")}</TypographyHeader>
      <ContainerContent>
        <SekaiGameNews isShowSpoiler={isShowSpoiler} region={region} />
      </ContainerContent>
    </Fragment>
  );
};

export default Home;
