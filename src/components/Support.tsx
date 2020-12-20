import { Avatar, Container, Grid, Link, Typography } from "@material-ui/core";
import { GitHub, OpenInNew } from "@material-ui/icons";
import { Patreon } from "mdi-material-ui";
import React, { Fragment } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useLayoutStyles } from "../styles/layout";
import AifadianQRCode from "../assets/aifadian-qrcode.png";

const Support: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:support")}
      </Typography>
      <br />
      <Container>
        <Typography>
          <Trans i18nKey="support:general.desc" />
        </Typography>
        <br />
        {window.isChinaMainland ? (
          <Fragment>
            <Typography variant="subtitle1" className={layoutClasses.header}>
              爱发电 <Patreon fontSize="inherit" />
            </Typography>
            <Typography>
              {/* <Trans i18nKey="support:patreon.desc" /> */}
              为中国大陆地区用户准备的赞助渠道
            </Typography>
            <Link href="https://afdian.net/@sekaiviewer" target="_blank">
              <img src={AifadianQRCode} width="96" alt="爱发电二维码"></img>
            </Link>
            <br />
          </Fragment>
        ) : null}
        <Typography variant="subtitle1" className={layoutClasses.header}>
          Patreon <Patreon fontSize="inherit" />
        </Typography>
        <Typography>
          <Trans i18nKey="support:patreon.desc" />
        </Typography>
        <Link href="https://www.patreon.com/SekaiViewer" target="_blank">
          <Typography>
            Become a Patron! <OpenInNew fontSize="inherit" />
          </Typography>
        </Link>
        <br />
        <Container>
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            Tier Happy
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} md={4} lg={3}>
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <Avatar
                    src="https://c8.patreon.com/2/200/45497536"
                    alt="zaurus"
                  ></Avatar>
                </Grid>
                <Grid item>
                  <Typography>zaurus</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            Tier Lucky
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} md={4} lg={3}>
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <Avatar>NA</Avatar>
                </Grid>
                <Grid item>
                  <Typography>N/A</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
        <br />
        <Typography variant="subtitle1" className={layoutClasses.header}>
          {t("support:translation.title")}
        </Typography>
        <Typography>
          <Trans i18nKey="support:translation.desc" />
        </Typography>
        <Link
          href="https://www.transifex.com/dnaroma/sekai-viewer/dashboard/"
          target="_blank"
        >
          <Typography>
            Transifex <OpenInNew fontSize="inherit" />
          </Typography>
        </Link>
        <br />
        <Typography variant="subtitle1" className={layoutClasses.header}>
          {t("support:development.title")} <GitHub fontSize="inherit" />
        </Typography>
        <Typography>
          <Trans i18nKey="support:development.desc" />
        </Typography>
        <Link
          href="https://github.com/Sekai-World/sekai-viewer"
          target="_blank"
        >
          <Typography>
            Sekai-World/sekai-viewer <OpenInNew fontSize="inherit" />
          </Typography>
        </Link>
      </Container>
    </Fragment>
  );
};

export default Support;
