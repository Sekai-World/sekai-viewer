import { Adsense } from "@ctrl/react-adsense";
import { Container, Typography } from "@mui/material";
import React, { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRootStore } from "../../stores/root";
import { useLayoutStyles } from "../../styles/layout";

type Props = {
  className?: string;
  style?: React.CSSProperties;
  client: string;
  slot: string;
  layout?: string;
  layoutKey?: string;
  format?: string;
  responsive?: string;
  pageLevelAds?: boolean;
};

const AdSense = (props: Props) => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { user } = useRootStore();

  const noAdRoles = useMemo(() => ["translator", "patron", "developer"], []);

  return !!user.userinfo && noAdRoles.includes(user.userinfo.role) ? null : (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:advertisement")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Adsense {...props} />
      </Container>
    </Fragment>
  );
};

export default AdSense;
