import {
  Container,
  FormControl,
  FormLabel,
  Grid,
  Typography,
} from "@mui/material";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../../styles/layout";

const EventAnalyzer = () => {
  const layoutClasses = useLayoutStyles();
  // const classes = useStyles();
  // const query = useQuery();
  const { t } = useTranslation();

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:eventAnalyzer")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container spacing={1} alignItems="center">
          <FormControl component="fieldset">
            <FormLabel component="legend">{t("common:mode")}</FormLabel>
          </FormControl>
        </Grid>
      </Container>
    </Fragment>
  );
};

export default EventAnalyzer;
