import {
  Dialog,
  IconButton,
  Link,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Typography,
  Container,
  useMediaQuery,
  useTheme,
  Grid,
  Box,
} from "@material-ui/core";
import { useLayoutStyles } from "../styles/layout";
import { useInteractiveStyles } from "../styles/interactive";
import { ColDef, DataGrid, ValueFormatterParams } from "@material-ui/data-grid";
import {
  GitHub,
  MonetizationOn,
  OpenInNew,
  Settings,
  Translate,
  Twitter,
} from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";
import { Discord, Patreon } from "mdi-material-ui";
import React, { Fragment, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link as RouteLink } from "react-router-dom";
import { IUserInformationInfo } from "../types";
import { getJPTime, useCachedData } from "../utils";
import AnnouncementWidget from "./announcement/AnnouncementWidget";
import CurrentEventWidget from "./event/CurrentEventWidget";

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

const useIframeStyle = makeStyles((theme) => ({
  iframe: {
    [theme.breakpoints.down("sm")]: {
      width: "300px",
      height: "480px",
    },
    [theme.breakpoints.up("md")]: {
      width: "600px",
      height: "480px",
    },
  },
}));

function InfoInternalDialog(props: {
  url: string;
  open: boolean;
  onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
  title: string;
}) {
  const classes = useIframeStyle();
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <Typography>{props.title}</Typography>
      <iframe
        className={classes.iframe}
        title={props.title}
        src={props.url}
      ></iframe>
    </Dialog>
  );
}

function InfoInternal(props: { onClick: () => void }) {
  return (
    <IconButton color="primary" onClick={props.onClick}>
      <OpenInNew></OpenInNew>
    </IconButton>
  );
}

function Home() {
  const theme = useTheme();
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  const [informations] = useCachedData<IUserInformationInfo>(
    "userInformations"
  );

  const [gameNewsTag, setGameNewsTag] = useState<string>("information");
  const [open, setOpen] = useState<boolean>(false);
  const [info, setInfo] = useState<IUserInformationInfo>();
  const [jpTime] = useState<string>(getJPTime());

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

  const isUpMd = useMediaQuery(theme.breakpoints.up("md"));

  const columns: ColDef[] = [
    {
      field: "action",
      headerName: t("home:game-news.action"),
      width: 100,
      renderCell: (params: ValueFormatterParams) => {
        const info = params.row as IUserInformationInfo;
        return info.browseType === "internal" ? (
          <InfoInternal
            onClick={() => {
              setInfo(info);
              setOpen(true);
            }}
          />
        ) : (
          <Link target="_blank" href={info.path}>
            <IconButton color="primary">
              <OpenInNew></OpenInNew>
            </IconButton>
          </Link>
        );
      },
      sortable: false,
    },
    // { field: "id", headerName: "ID", width: 60 },
    {
      field: "startAt",
      headerName: t("home:game-news.show-from"),
      width: 200,
      valueFormatter: (params: ValueFormatterParams) =>
        new Date(params.getValue("startAt") as number).toLocaleString(),
      sortDirection: "desc",
    },
    {
      field: "title",
      headerName: t("home:game-news.title-column"),
      width: isUpMd ? 600 : 150,
      sortable: false,
    },
    {
      field: "endAt",
      headerName: t("home:game-news.show-until"),
      width: 200,
      valueFormatter: (params: ValueFormatterParams) =>
        new Date(params.getValue("startAt") as number).toLocaleString(),
    },
  ];

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:home")}
      </Typography>
      <Container className={layoutClasses.content}>
        {/* <Typography variant="h4">Welcome to Sekai Viewer Open Beta!</Typography> */}
        <Box paddingTop="1%" paddingBottom="1%">
          {new Date().getTime() < 1609426800000 ? (
            <Fragment>
              <Typography align="center" variant="h4">
                {t("home:new_year_countdown")}
              </Typography>
            </Fragment>
          ) : (
            new Date().getTime() - 1609426800000 < 259200000 && (
              <Typography align="center" variant="h4">
                {t("home:happy_new_year")}
              </Typography>
            )
          )}
        </Box>
        <Grid container justify="center">
          <Grid item xs={12} md={8} lg={6}>
            {jpTime === "12/6" ? (
              <img
                src={`${process.env.PUBLIC_URL}/images/banner-shizuku.png`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "12/27" ? (
              <img
                src={`${process.env.PUBLIC_URL}/images/banner-rin-ren.png`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : jpTime === "1/8" ? (
              <img
                src={`${process.env.PUBLIC_URL}/images/banner-shiho.png`}
                alt="banner"
                style={{ width: "100%", height: "auto" }}
                width="1500"
                height="500"
              />
            ) : (
              <img
                src={`${process.env.PUBLIC_URL}/images/banner.png`}
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
        <Alert className={layoutClasses.alert} severity="info">
          <Trans
            i18nKey="home:alert_settings"
            components={{ s: <Settings fontSize="inherit" /> }}
          />
        </Alert>
        {window.isChinaMainland && (
          <Alert className={layoutClasses.alert} severity="info">
            本站已启用腾讯云CDN加速数据加载，并计划迁移更多数据加速本站访问，但是费用相对高昂，你可以通过
            <Link href="https://afdian.net/@sekaiviewer" target="_blank">
              <MonetizationOn fontSize="inherit" />
              爱发电
            </Link>
            来赞助支持让我更轻松地进行迁移工作。
          </Alert>
        )}
        <Alert className={layoutClasses.alert} severity="warning">
          <AlertTitle>{t("home:alert1.title")}</AlertTitle>
          <Grid container spacing={2}>
            <Grid item>
              <Link
                href="https://www.transifex.com/dnaroma/sekai-viewer"
                target="_blank"
              >
                <Grid container direction="row" alignItems="center">
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
              >
                <Grid container direction="row" alignItems="center">
                  <Grid item>
                    <GitHub fontSize="small"></GitHub>
                  </Grid>
                  <Grid item>{t("home:alert1.development")}</Grid>
                </Grid>
              </Link>
            </Grid>
            {!window.isChinaMainland && (
              <Grid item>
                <Link
                  href="https://www.patreon.com/bePatron?u=6503151"
                  target="_blank"
                >
                  <Grid container direction="row" alignItems="center">
                    <Grid item>
                      <Patreon fontSize="small" />
                    </Grid>
                    <Grid item>Patreon</Grid>
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
                <Grid container direction="row" alignItems="center">
                  <Grid item>
                    <OpenInNew fontSize="small" />
                  </Grid>
                  <Grid item>{t("home:alert1.see_contrib_list")}</Grid>
                </Grid>
              </RouteLink>
            </Grid>
            <Grid item>
              <Link href="https://www.twitter.com/SekaiViewer" target="_blank">
                <Grid container direction="row" alignItems="center">
                  <Grid item>
                    <Twitter fontSize="small"></Twitter>
                  </Grid>
                  <Grid item>@SekaiViewer</Grid>
                </Grid>
              </Link>
            </Grid>
            <Grid item>
              <Link href="https://discord.gg/xcDBRMd" target="_blank">
                <Grid container direction="row" alignItems="center">
                  <Grid item>
                    <Discord fontSize="small"></Discord>
                  </Grid>
                  <Grid item>Sekai Viewer</Grid>
                </Grid>
              </Link>
            </Grid>
          </Grid>
        </Alert>
        {getWebpDetectSeverity(detected) !== "success" && (
          <Alert
            className={layoutClasses.alert}
            severity={getWebpDetectSeverity(detected)}
          >
            <AlertTitle>WebP {t("common:support")}</AlertTitle>
            <Trans
              i18nKey="home:detect.warning"
              components={{
                l: <Link href="https://caniuse.com/webp"></Link>,
              }}
            />
          </Alert>
        )}
      </Container>
      <Grid container spacing={1}>
        <Grid item xs={12} md={6}>
          <AnnouncementWidget />
        </Grid>
        <Grid item xs={12} md={6}>
          <CurrentEventWidget />
        </Grid>
      </Grid>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("home:game-news.title")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Paper className={interactiveClasses.container}>
          <Tabs
            value={gameNewsTag}
            onChange={(e, v) => setGameNewsTag(v)}
            variant="scrollable"
            scrollButtons="desktop"
          >
            <Tab label={t("common:information")} value="information"></Tab>
            <Tab label={t("common:event")} value="event"></Tab>
            <Tab label={t("common:gacha")} value="gacha"></Tab>
            <Tab label={t("common:music")} value="music"></Tab>
            <Tab label={t("common:campaign")} value="campaign"></Tab>
            <Tab label={t("common:bug")} value="bug"></Tab>
            <Tab label={t("home:update")} value="update"></Tab>
          </Tabs>
        </Paper>
        <div style={{ height: 650 }}>
          <DataGrid
            pagination
            autoPageSize
            rows={informations.filter(
              (info) => info.informationTag === gameNewsTag
            )}
            columns={columns}
          ></DataGrid>
        </div>
      </Container>
      {info ? (
        <InfoInternalDialog
          url={`https://production-web.sekai.colorfulpalette.org/${info.path}`}
          open={open}
          onClose={() => setOpen(false)}
          title={info.title}
        />
      ) : null}
    </Fragment>
  );
}

export default Home;
