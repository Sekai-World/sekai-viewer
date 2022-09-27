import { Typography } from "@mui/material";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import ContainerContent from "../../components/styled/ContainerContent";
import TypographyHeader from "../../components/styled/TypographyHeader";

const Confirmation: React.FC<{}> = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <TypographyHeader>{t("auth:send_email_confirmation")}</TypographyHeader>
      <ContainerContent>
        <Typography>{t("auth:register_email_confirmation")}</Typography>
      </ContainerContent>
    </Fragment>
  );
};

export default Confirmation;
