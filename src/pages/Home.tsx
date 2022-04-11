import {
  Link,
  Typography,
  Container,
  useTheme,
  Grid,
  Box,
  Chip,
} from "@mui/material";
import { useLayoutStyles } from "../styles/layout";
import { useInteractiveStyles } from "../styles/interactive";
import {
  Album,
  AspectRatio,
  GitHub,
  MonetizationOn,
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
import { Link as RouteLink } from "react-router-dom";
import { getJPTime, useVersionInfo } from "../utils";
import AnnouncementWidget from "../components/widgets/AnnouncementWidget";
import CurrentEventWidget from "../components/widgets/CurrentEventWidget";
// import AdSense from "../components/blocks/AdSenseBlock";
import SekaiGameNews from "../components/blocks/SekaiGameNews";
import { useRootStore } from "../stores/root";
import Countdown from "../components/widgets/Countdown";

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

const VersionInfo = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();

  const [version] = useVersionInfo();

  return (
    (!!version && (
      <Fragment>
        <Typography variant="h6" className={layoutClasses.header}>
          {t("home:versionInfo.caption")}
        </Typography>
        <Container className={layoutClasses.content}>
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
        </Container>
      </Fragment>
    )) ||
    null
  );
};

function Home() {
  const theme = useTheme();
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

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
    webpLossless: -1,
    webpAlpha: -1,
  });

  useEffect(() => {
    setDetected({
      webp: Number(Modernizr.webp),
      webpLossless: Number(Modernizr.webplossless),
      webpAlpha: Number(Modernizr.webpalpha),
    });
  }, []);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:home")}
      </Typography>
      <Container className={layoutClasses.content}>
        {/* <Typography variant="h4">Welcome to Sekai Viewer Open Beta!</Typography> */}
        <Box paddingTop="1%" paddingBottom="1%">
          {new Date().getTime() - 1640962800000 < 259200000 ? (
            <Typography align="center" variant="h4">
              {t("home:happy_new_year")}
            </Typography>
          ) : (
            1640962800000 - new Date().getTime() > 0 &&
            1640962800000 - new Date().getTime() < 259200000 && (
              <Fragment>
                <Typography align="center" variant="h4">
                  {t("home:new_year_countdown")}
                </Typography>
                <Countdown endDate={new Date(1640962800000)} />
              </Fragment>
            )
          )}
        </Box>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            {jpTime === "12/6" ? (
              <img
                src={`/images/banner-shizuku.png`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "12/27" ? (
              <img
                src={`/images/banner-rin-ren.png`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "1/8" ? (
              <img
                src={`/images/banner-shiho.png`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "1/27" ? (
              <img
                src={`/images/banner-mafuyu.png`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "1/30" ? (
              <img
                src={`/images/banner-luka.png`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "2/17" ? (
              <img
                src={`/images/banner-kaito.png`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "4/14" ? (
              <img
                src={`/images/banner-minori.png`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "7/20" ? (
              <img
                src={`/images/banner-nene.jpg`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "7/26" ? (
              <img
                src={`/images/banner-an.jpg`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "10/5" ? (
              <img
                src={`/images/banner-haruka.jpg`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "9/30" ||
              (splitJPTime[0] === "10" && Number(splitJPTime[1]) < 16) ? (
              <img
                src={`/images/banner-anni.jpg`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : (
              <img
                src={`/images/banner-new.png`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            )}
          </Grid>
        </Grid>
        {/* <Alert className={layoutClasses.alert} severity="info">
          {t("home:alert0")}
        </Alert> */}
        {/* <Alert className={layoutClasses.alert} severity="info">
          <Trans
            i18nKey="home:alert_settings"
            components={{ s: <Settings fontSize="inherit" /> }}
          />
        </Alert> */}
        {window.isChinaMainland && (
          <Alert className={layoutClasses.alert} severity="info">
            本站已启用腾讯云CDN加速数据加载，并计划迁移更多数据加速本站访问，但是费用相对高昂，你可以通过
            <Link
              href="https://afdian.net/@sekaiviewer"
              target="_blank"
              underline="hover"
            >
              <MonetizationOn fontSize="inherit" />
              爱发电
            </Link>
            来赞助支持让我更轻松地进行迁移工作。
          </Alert>
        )}
        {getWebpDetectSeverity(detected) !== "success" && (
          <Alert
            className={layoutClasses.alert}
            severity={getWebpDetectSeverity(detected)}
          >
            <AlertTitle>WebP {t("common:support")}</AlertTitle>
            <Trans
              i18nKey="home:detect.warning"
              components={{
                l: (
                  <Link
                    href="https://caniuse.com/webp"
                    underline="hover"
                  ></Link>
                ),
              }}
            />
          </Alert>
        )}
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("home:directLink.caption")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container rowSpacing={2}>
          <Grid item container columnSpacing={2} rowSpacing={1}>
            <Grid item>
              <RouteLink
                to="/card"
                className={interactiveClasses.noDecoration}
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <AspectRatio fontSize="small"></AspectRatio>
                  </Grid>
                  <Grid item>{t("common:card")}</Grid>
                </Grid>
              </RouteLink>
            </Grid>
            <Grid item>
              <RouteLink
                to="/music"
                className={interactiveClasses.noDecoration}
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Album fontSize="small"></Album>
                  </Grid>
                  <Grid item>{t("common:music")}</Grid>
                </Grid>
              </RouteLink>
            </Grid>
            <Grid item>
              <RouteLink
                to="/gacha"
                className={interactiveClasses.noDecoration}
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <MoveToInbox fontSize="small"></MoveToInbox>
                  </Grid>
                  <Grid item>{t("common:gacha")}</Grid>
                </Grid>
              </RouteLink>
            </Grid>
            <Grid item>
              <RouteLink
                to="/event"
                className={interactiveClasses.noDecoration}
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <CalendarText fontSize="small"></CalendarText>
                  </Grid>
                  <Grid item>{t("common:event")}</Grid>
                </Grid>
              </RouteLink>
            </Grid>
            <Grid item>
              <RouteLink
                to="/music_recommend"
                className={interactiveClasses.noDecoration}
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Calculator fontSize="small"></Calculator>
                  </Grid>
                  <Grid item>{t("common:musicRecommend")}</Grid>
                </Grid>
              </RouteLink>
            </Grid>
            <Grid item>
              <RouteLink
                to="/eventtracker"
                className={interactiveClasses.noDecoration}
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Timeline fontSize="small"></Timeline>
                  </Grid>
                  <Grid item>{t("common:eventTracker")}</Grid>
                </Grid>
              </RouteLink>
            </Grid>
            <Grid item>
              <RouteLink
                to="/storyreader"
                className={interactiveClasses.noDecoration}
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <Textsms fontSize="small"></Textsms>
                  </Grid>
                  <Grid item>{t("common:storyReader")}</Grid>
                </Grid>
              </RouteLink>
            </Grid>
          </Grid>
          <Grid item container columnSpacing={2} rowSpacing={1}>
            <Grid item>
              <RouteLink
                to="/settings"
                className={interactiveClasses.noDecoration}
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <SettingsIcon fontSize="small"></SettingsIcon>
                  </Grid>
                  <Grid item>{t("common:settings.title")}</Grid>
                </Grid>
              </RouteLink>
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
            {window.isChinaMainland && (
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
            {!window.isChinaMainland && (
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
            )}
            {window.isChinaMainland && (
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
            )}
            <Grid item>
              <RouteLink
                to="/about"
                className={interactiveClasses.noDecoration}
                style={{ color: theme.palette.primary.main }}
              >
                <Grid container direction="row" alignContent="center">
                  <Grid item>
                    <OpenInNew fontSize="small" />
                  </Grid>
                  <Grid item>{t("home:directLink.contribList")}</Grid>
                </Grid>
              </RouteLink>
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
          {!window.isChinaMainland && (
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
          )}
        </Grid>
      </Container>
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
      <Typography variant="h6" className={layoutClasses.header}>
        {t("home:game-news.title")}
      </Typography>
      <Container className={layoutClasses.content}>
        <SekaiGameNews isShowSpoiler={isShowSpoiler} region={region} />
      </Container>
    </Fragment>
  );
}

export default Home;
