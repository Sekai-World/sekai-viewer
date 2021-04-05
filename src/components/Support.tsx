import {
  Avatar,
  CircularProgress,
  Container,
  Grid,
  Link,
  Typography,
} from "@material-ui/core";
import {
  GitHub,
  MonetizationOn,
  OpenInNew,
  Translate,
} from "@material-ui/icons";
import { Patreon } from "mdi-material-ui";
import React, { Fragment } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useLayoutStyles } from "../styles/layout";
// import AifadianQRCode from "../assets/aifadian-qrcode.png";
import { usePatronList } from "../utils/apiClient";

const Support: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();

  const { patrons, isLoading, error } = usePatronList();

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
              爱发电 <MonetizationOn fontSize="inherit" />
            </Typography>
            <Typography>
              {/* <Trans i18nKey="support:patreon.desc" /> */}
              如果你喜欢本站，欢迎赞助支持！你的支持可以进一步提高本站在大陆地区的访问速度。
            </Typography>
            <Link href="https://afdian.net/@sekaiviewer" target="_blank">
              <Typography>
                通过爱发电支持我！ <OpenInNew fontSize="inherit" />
              </Typography>
              <img
                style={{ maxWidth: "100%" }}
                src={`${process.env.PUBLIC_URL}/images/afdian-SekaiViewer.jpg`}
                // width="320"
                alt="爱发电二维码"
              ></img>
            </Link>
            <br />
          </Fragment>
        ) : (
          <Fragment>
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
            {isLoading ? (
              <CircularProgress size="24" />
            ) : error ? (
              <Container>
                <Typography>Failed loading patron list!</Typography>
              </Container>
            ) : (
              <Container>
                {["Happy", "Lucky", "Smile", "Yay"].map((tier) => (
                  <Fragment>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      Tier {tier}
                    </Typography>
                    <Grid container spacing={1}>
                      {patrons
                        .filter((elem) => elem.tier === tier)
                        .map((patron) => (
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                              <Avatar
                                src={patron.avatarUrl}
                                alt={patron.name}
                              ></Avatar>
                            </Grid>
                            <Grid item>
                              <Typography>{patron.name}</Typography>
                            </Grid>
                          </Grid>
                        ))}
                      {!patrons.filter((elem) => elem.tier === tier).length && (
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
                      )}
                    </Grid>
                  </Fragment>
                ))}
              </Container>
            )}
            <br />
          </Fragment>
        )}
        <Typography variant="subtitle1" className={layoutClasses.header}>
          {t("support:translation.title")} <Translate fontSize="inherit" />
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
