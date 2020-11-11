import { Container, Link, makeStyles, Typography } from "@material-ui/core";
import { GitHub, Settings } from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";
import React, { Fragment, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInteractiveStyles } from "../styles/interactive";
import { useLayoutStyles } from "../styles/layout";

const useStyles = makeStyles((theme) => ({
  alert: {
    margin: theme.spacing(2, 0),
  },
  "contact-link": {
    margin: theme.spacing(0, 0.5),
  },
  "game-news-title": {
    paddingTop: theme.spacing(2),
  },
}));

const About: React.FC<{}> = () => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("title:about");
  }, [t]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:about")}
      </Typography>
      <Container>
        <Alert className={classes.alert} severity="info">
          <AlertTitle>{t("home:alert_contributor.title")}</AlertTitle>
          <ul style={{ marginBlockEnd: 0 }}>
            <li>
              <Link
                href="https://github.com/NonSpicyBurrito"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHub fontSize="inherit"></GitHub>
                Burrito
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/iSwanGit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHub fontSize="inherit"></GitHub>
                iSwanGit (EleMas*)
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/Build774"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHub fontSize="inherit"></GitHub>
                Build774
              </Link>
            </li>
          </ul>
        </Alert>
        <Alert className={classes.alert} severity="info">
          <AlertTitle>{t("home:alert_translate.title")}</AlertTitle>
          <ul>
            <li>简：Stargazing Koishi, Nightwheel</li>
            <li>繁：Natsuzawa, ch ko, tofutofuo</li>
            <li>日：Passion, Cee, k0tayan, Natsuzawa, Build774</li>
            <li>한：hodubidu3095, omitooshi, EleMas39, PJSEKAI, 아점</li>
            <li>Pt-BR: mid</li>
            <li>русский: Spyrohat</li>
            <li>Es: ruiemu, maravillas</li>
            <li>It: SeaPu</li>
            <li>Pl: sousie</li>
          </ul>
        </Alert>
      </Container>
    </Fragment>
  );
};

export default About;
