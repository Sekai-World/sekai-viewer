import { Link, makeStyles, Typography } from "@material-ui/core";
import { OpenInNew } from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";
import React, { Fragment, useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  alert: {
    margin: theme.spacing(2, 0)
  }
}));

function Home() {
  const classes = useStyles();
  useEffect(() => {
    document.title = 'Home | Sekai Viewer'
  }, [])

  return (
    <Fragment>
      <Typography variant="h4">Welcome to Sekai Viewer Open Beta!</Typography>
      <Alert className={classes.alert} severity="info">Sekai Viewer is now in Open Beta!</Alert>
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
    </Fragment>
  )
}

export default Home;
