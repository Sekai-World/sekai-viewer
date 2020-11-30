import { Container, Link, makeStyles, Typography } from "@material-ui/core";
import { GitHub } from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";
import React, { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../styles/layout";

const useStyles = makeStyles((theme) => ({
  alert: {
    margin: theme.spacing(2, 0),
  },
}));

const About: React.FC<{}> = () => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
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
          <AlertTitle>{t("about:about_me.title")}</AlertTitle>
          <ul style={{ marginBlockEnd: 0 }}>
            <li>
              <Link
                href="https://blog.dnaroma.eu/"
                target="_blanl"
                rel="noopener"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="https://www.github.com/dnaroma"
                target="_blanl"
                rel="noopener"
              >
                <GitHub fontSize="inherit"></GitHub>
                GitHub
              </Link>
            </li>
          </ul>
        </Alert>
        <Alert className={classes.alert} severity="info">
          <AlertTitle>{t("home:alert_contributor.title")}</AlertTitle>
          <Typography>{t("about:missing_hint")}</Typography>
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
            <li>
              <Link
                href="https://github.com/xfl03"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHub fontSize="inherit"></GitHub>
                Xfl03
              </Link>
            </li>
          </ul>
        </Alert>
        <Alert className={classes.alert} severity="info">
          <AlertTitle>{t("home:alert_translate.title")}</AlertTitle>
          <Typography>{t("about:missing_hint")}</Typography>
          <ul>
            <li>
              简：Stargazing Koishi, Nightwheel, MoeDev, hodubidu3095, sgkoishi
            </li>
            <li>繁：Natsuzawa, ch ko, tofutofuo, Fryer, ayjchen</li>
            <li>
              日：Passion, Cee, k0tayan, Natsuzawa, Build774, あいうえお菓子,
              ikareo, Karuta
            </li>
            <li>한：hodubidu3095, omitooshi, EleMas39, PJSEKAI, 아점</li>
            <li>Pt-BR: mid</li>
            <li>русский: Spyrohat</li>
            <li>Es: ruiemu, maravillas</li>
            <li>It: SeaPu</li>
            <li>Pl: sousie</li>
            <li>En: watatomo</li>
            <li>Fr: Yasito</li>
            <li>Ind: Rizkiawan</li>
            <li>หาง: Revel</li>
          </ul>
        </Alert>
      </Container>
    </Fragment>
  );
};

export default About;
