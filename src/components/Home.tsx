import {
  Dialog,
  IconButton,
  Link,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import {
  ColDef,
  DataGrid,
  ValueFormatterParams,
} from "@material-ui/data-grid";
import {
  GitHub,
  OpenInNew,
  Translate,
  Twitter,
} from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";
import { Discord } from "mdi-material-ui";
import React, { Fragment, useEffect, useState } from "react";
import { IUserInformationInfo } from "../types";
import { useUserInformations } from "../utils";

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

function getWebpDetectDesc(result: number) {
  switch (result) {
    case -1:
      return "Checking...";
    case 0:
      return "Unsupported";
    case 1:
      return "Supported";
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

  const [informations] = useUserInformations();

  const [gameNewsTag, setGameNewsTag] = useState<string>("information");
  const [open, setOpen] = useState<boolean>(false);
  const [info, setInfo] = useState<IUserInformationInfo>();

  useEffect(() => {
    document.title = "Home | Sekai Viewer";
  }, []);

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

  const isUpMd = useMediaQuery(theme.breakpoints.up('md'))

  const columns: ColDef[] = [
    { field: "id", headerName: "ID", width: 60 },
    { field: "title", headerName: "Title", width: isUpMd ? 400 : 100, sortable: false },
    {
      field: "action",
      headerName: "Action",
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
        )
      }, sortable: false
    },
    {
      field: "startAt",
      headerName: "Show From",
      width: 180,
      valueFormatter: (params: ValueFormatterParams) =>
        new Date(params.getValue("startAt") as number).toLocaleString()
    },
    {
      field: "endAt",
      headerName: "Show Until",
      width: 180,
      valueFormatter: (params: ValueFormatterParams) =>
        new Date(params.getValue("startAt") as number).toLocaleString(),
    },
  ];

  return (
    <Fragment>
      {/* <Typography variant="h4">Welcome to Sekai Viewer Open Beta!</Typography> */}
      <Alert className={classes.alert} severity="info">
        Sekai Viewer is now in Open Beta!
      </Alert>
      <Alert className={classes.alert} severity="warning">
        <AlertTitle>Help needed! 需要你的协助！</AlertTitle>
        <Link
          href="https://www.transifex.com/dnaroma/sekai-viewer"
          target="_blank"
        >
          <Translate fontSize="inherit"></Translate>
          Translations 翻译
        </Link>
        （English，简中，繁中，日本語，Deutsch, Español, others upon request）
        <br></br>
        <Link
          href="https://github.com/Sekai-World/sekai-viewer"
          target="_blank"
        >
          <GitHub fontSize="inherit"></GitHub>
          Development 开发
        </Link>
        （Sekai-World/sekai-viewer）
        <br></br>
        Contant Me:
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
        <AlertTitle>WebP Support</AlertTitle>
        <ul>
          <li>WebP: {getWebpDetectDesc(detected.webp)}</li>
          <li>WebP Lossless: {getWebpDetectDesc(detected.webpLossless)}</li>
          <li>WebP Alpha: {getWebpDetectDesc(detected.webpAlpha)}</li>
        </ul>
        {getWebpDetectServerity(detected) === "success" ? (
          <Typography>
            Congratulations! Your browser seems modern, you are able to load
            images faster and save bandwidth.
          </Typography>
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
          Game News
        </Typography>
        <Tabs
          value={gameNewsTag}
          onChange={(e, v) => setGameNewsTag(v)}
          variant="scrollable"
          scrollButtons="desktop"
        >
          <Tab label="information" value="information"></Tab>
          <Tab label="event" value="event"></Tab>
          <Tab label="gacha" value="gacha"></Tab>
          <Tab label="music" value="music"></Tab>
          <Tab label="campaign" value="campaign"></Tab>
          <Tab label="bug" value="bug"></Tab>
          <Tab label="update" value="update"></Tab>
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
