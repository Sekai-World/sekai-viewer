import { Link, makeStyles, Typography } from "@material-ui/core";
import { OpenInNew } from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";
import React, { Fragment, useEffect, useState } from "react";

const useStyles = makeStyles((theme) => ({
  alert: {
    margin: theme.spacing(2, 0),
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

function Home() {
  const classes = useStyles();
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

  return (
    <Fragment>
      <Typography variant="h4">Welcome to Sekai Viewer Open Beta!</Typography>
      <Alert className={classes.alert} severity="info">
        Sekai Viewer is now in Open Beta!
      </Alert>
      <Alert className={classes.alert} severity="warning">
        <AlertTitle>Help needed! 需要你的协助！</AlertTitle>
        Translations are not yet finished as well as many features!<br></br>
        翻译及功能特性均未完成！<br></br>
        Help on translations and suggestions on features are welcomed!<br></br>
        欢迎帮忙改进翻译和提出意见！<br></br>
        <Link href="https://blog.dnaroma.eu/help-sekai-viewer">
          <OpenInNew fontSize="inherit"></OpenInNew>
          Click for Details 点此了解更多
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
    </Fragment>
  );
}

export default Home;
