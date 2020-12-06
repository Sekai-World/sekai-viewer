import {
  Dialog,
  IconButton,
  Link,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  // Theme,
  Typography,
  Container,
  useMediaQuery,
  useTheme,
  Grid,
} from "@material-ui/core";
import { useLayoutStyles } from "../styles/layout";
import { useInteractiveStyles } from "../styles/interactive";
import { ColDef, DataGrid, ValueFormatterParams } from "@material-ui/data-grid";
import {
  GitHub,
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

const useStyles = makeStyles((theme) => ({
  "contact-link": {
    margin: theme.spacing(0, 0.5),
  },
  "game-news-title": {
    paddingTop: theme.spacing(2),
  },
}));

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

// function getWebpDetectDesc(t: TFunction, result: number) {
//   switch (result) {
//     case -1:
//       return t("common:detect.checking");
//     case 0:
//       return t("common:detect.unsupported");
//     case 1:
//       return t("common:detect.supported");
//     default:
//       return "";
//   }
// }

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
  const classes = useStyles();
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
      width: 80,
      renderCell: (params: ValueFormatterParams) => {
        const info = params.data as IUserInformationInfo;
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
        <Alert className={layoutClasses.alert} severity="info">
          {t("home:alert0")}
        </Alert>
        <Alert className={layoutClasses.alert} severity="info">
          <Trans
            i18nKey="home:alert_settings"
            components={{ s: <Settings fontSize="inherit" /> }}
          />
        </Alert>
        <Alert className={layoutClasses.alert} severity="warning">
          <AlertTitle>{t("home:alert1.title")}</AlertTitle>
          <Link
            href="https://www.transifex.com/dnaroma/sekai-viewer"
            target="_blank"
          >
            <Translate fontSize="inherit"></Translate>
            {t("home:alert1.translation")}
          </Link>
          （English，简中，繁中，日本語，한국어，Deutsch, Español, others upon
          request）
          <br></br>
          <Link
            href="https://github.com/Sekai-World/sekai-viewer"
            target="_blank"
          >
            <GitHub fontSize="inherit"></GitHub>
            {t("home:alert1.development")}
          </Link>
          （Sekai-World/sekai-viewer）
          <br></br>
          <Link
            href="https://www.patreon.com/bePatron?u=6503151"
            target="_blank"
          >
            <Patreon fontSize="inherit"></Patreon>
            Patreon
          </Link>
          <br></br>
          <RouteLink to="/about" style={{ textDecoration: "none" }}>
            <Link>
              <OpenInNew fontSize="inherit" />{" "}
              {t("home:alert1.see_contrib_list")}
            </Link>
          </RouteLink>
          <br></br>
          {t("home:alert1.contact")}:
          <Link
            href="https://www.twitter.com/miku_zura"
            target="_blank"
            className={classes["contact-link"]}
          >
            <Twitter fontSize="inherit"></Twitter>
            @miku_zura
          </Link>
          <Link href="#" className={classes["contact-link"]}>
            <Discord fontSize="inherit"></Discord>
            DNARoma#0646
          </Link>
          <br></br>
          {t("home:alert1.join-discord")}
          <Link
            href="https://discord.gg/xcDBRMd"
            target="_blank"
            className={classes["contact-link"]}
          >
            <Discord fontSize="inherit"></Discord>
            Sekai Viewer
          </Link>
        </Alert>
        {getWebpDetectSeverity(detected) !== "success" ? (
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
        ) : null}
      </Container>
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
