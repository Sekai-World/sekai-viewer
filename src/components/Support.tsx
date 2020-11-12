import { Container, Link, Typography } from "@material-ui/core";
import { GitHub, OpenInNew } from "@material-ui/icons";
import { Patreon } from "mdi-material-ui";
import React, { Fragment } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useLayoutStyles } from "../styles/layout";

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
        <Typography variant="subtitle1" className={layoutClasses.header}>
          Patreon <Patreon fontSize="inherit" />
        </Typography>
        <Typography>
          <Trans i18nKey="support:patreon.desc" />
        </Typography>
        <Link href="https://www.patreon.com/bePatron?u=6503151" target="_blank">
          <Typography>
            Become a Patron! <OpenInNew fontSize="inherit" />
          </Typography>
        </Link>
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
