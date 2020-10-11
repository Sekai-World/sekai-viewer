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
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { ColDef, DataGrid, ValueFormatterParams } from "@material-ui/data-grid";
import {
  GitHub,
  OpenInNew,
  Settings,
  Translate,
  Twitter,
} from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";
import { TFunction } from "i18next";
import { Discord } from "mdi-material-ui";
import React, { Fragment, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { IUserInformationInfo } from "../types";
import { useCachedData } from "../utils";

const useStyles = makeStyles((theme) => ({
  alert: {
    margin: theme.spacing(2, 0),
  },
  "contact-link": {
    margin: theme.spacing(0, 0.5),
  },
}));

interface IDetectResult {
  webp: number;
  webpLossless: number;
  webpAlpha: number;
}

function getWebpDetectServerity(detected: IDetectResult) {
  const sum = detected.webp + detected.webpLossless + detected.webpAlpha;
  switch (sum) {
    case -3:
      return "info";
    case 0:
      return "error";
    case 3:
      return "success";
    default:
      return "warning";
  }
}

function getWebpDetectDesc(t: TFunction, result: number) {
  switch (result) {
    case -1:
      return t("common:detect.checking");
    case 0:
      return t("common:detect.unsupported");
    case 1:
      return t("common:detect.supported");
    default:
      return "";
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
  const classes = useStyles();
  const { t } = useTranslation();

  const [informations] = useCachedData<IUserInformationInfo>(
    "userInformations"
  );

  const [gameNewsTag, setGameNewsTag] = useState<string>("information");
  const [open, setOpen] = useState<boolean>(false);
  const [info, setInfo] = useState<IUserInformationInfo>();

  useEffect(() => {
    document.title = t("common:home") + " | Sekai Viewer";
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
      width: 180,
      valueFormatter: (params: ValueFormatterParams) =>
        new Date(params.getValue("startAt") as number).toLocaleString(),
    },
    {
      field: "title",
      headerName: t("home:game-news.title-column"),
      width: isUpMd ? 400 : 150,
      sortable: false,
    },
    {
      field: "endAt",
      headerName: t("home:game-news.show-until"),
      width: 180,
      valueFormatter: (params: ValueFormatterParams) =>
        new Date(params.getValue("startAt") as number).toLocaleString(),
    },
  ];

  return (
    <Fragment>
      {/* <Typography variant="h4">Welcome to Sekai Viewer Open Beta!</Typography> */}
      <Alert className={classes.alert} severity="info">
        {t("home:alert0")}
      </Alert>
      <Alert className={classes.alert} severity="info">
        <Trans
          i18nKey="home:alert_settings"
          components={{ s: <Settings fontSize="inherit" /> }}
        />
      </Alert>
      <Alert className={classes.alert} severity="warning">
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
      </Alert>
      <Alert
        className={classes.alert}
        severity={getWebpDetectServerity(detected)}
      >
        <AlertTitle>WebP {t("common:support")}</AlertTitle>
        <ul>
          <li>WebP: {getWebpDetectDesc(t, detected.webp)}</li>
          <li>WebP Lossless: {getWebpDetectDesc(t, detected.webpLossless)}</li>
          <li>WebP Alpha: {getWebpDetectDesc(t, detected.webpAlpha)}</li>
        </ul>
        {getWebpDetectServerity(detected) === "success" ? (
          <Typography>{t("home:detect.success")}</Typography>
        ) : (
          <Typography>
            Unfortunately you will not able to load images normally. Please
            consider update your browser version or use a modern browser. More
            info:
            <Link href="https://caniuse.com/webp">
              Can I Use - WebP image format
            </Link>
          </Typography>
        )}
      </Alert>
      <Paper>
        <Typography variant="h6" align="center">
          {t("home:game-news.title")}
        </Typography>
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
          <Tab label={t("common:update")} value="update"></Tab>
        </Tabs>
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
      </Paper>
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
