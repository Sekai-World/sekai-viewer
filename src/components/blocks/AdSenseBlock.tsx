import { Adsense } from "@ctrl/react-adsense";
import React, { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRootStore } from "../../stores/root";
import ContainerContent from "../styled/ContainerContent";
import TypographyHeader from "../styled/TypographyHeader";

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
  const { t } = useTranslation();
  const { user } = useRootStore();

  const noAdRoles = useMemo(() => ["translator", "patron", "developer"], []);

  return !!user.userinfo && noAdRoles.includes(user.userinfo.role) ? null : (
    <Fragment>
      <TypographyHeader>{t("common:advertisement")}</TypographyHeader>
      <ContainerContent>
        <Adsense {...props} />
      </ContainerContent>
    </Fragment>
  );
};

export default AdSense;
