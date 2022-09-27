import { FormControl, FormLabel, Grid } from "@mui/material";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import ContainerContent from "../../components/styled/ContainerContent";
import TypographyHeader from "../../components/styled/TypographyHeader";

const EventAnalyzer = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <TypographyHeader>{t("common:eventAnalyzer")}</TypographyHeader>
      <ContainerContent>
        <Grid container spacing={1} alignItems="center">
          <FormControl component="fieldset">
            <FormLabel component="legend">{t("common:mode")}</FormLabel>
          </FormControl>
        </Grid>
      </ContainerContent>
    </Fragment>
  );
};

export default EventAnalyzer;
