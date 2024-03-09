import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import Pin from "~icons/mdi/pin";
import React, { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAnnouncementsByLanguages } from "../../utils/apiClient";
import { useRootStore } from "../../stores/root";
import TypographyHeader from "../styled/TypographyHeader";
import LinkNoDecoration from "../styled/LinkNoDecoration";

const AnnouncementWidget: React.FC<unknown> = () => {
  const { t } = useTranslation();
  const {
    user: { metadata },
    settings: { languages, lang },
  } = useRootStore();

  const langId = useMemo(() => {
    let id = 1;
    if (languages.length) {
      const currentLang =
        languages.find((elem) => elem.code === lang) ||
        languages.find((elem) => elem.code === lang.split("-")[0]);
      if (currentLang) {
        id = currentLang.id;
      }
    }
    return id;
  }, [lang, languages]);
  const params = useMemo(
    () =>
      metadata
        ? [langId, ...metadata?.languages.map((lang) => lang.id)]
        : [langId],
    [langId, metadata]
  );
  const { announcements, isLoading, error } = useAnnouncementsByLanguages(
    0,
    10,
    params
  );

  return (
    <Fragment>
      <TypographyHeader>{t("common:announcement")}</TypographyHeader>
      <Box padding="3% 5% 3% 3%" maxHeight={340} overflow="auto">
        <Grid container spacing={1}>
          {isLoading ? (
            <Typography>{t("common:loading")}</Typography>
          ) : error ? (
            <Typography>{t("announcement:fetch_error")}</Typography>
          ) : announcements.length ? (
            announcements.map((data) => (
              <Grid key={data.id} item xs={12}>
                <LinkNoDecoration to={`/announcement/${data.id}`}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5">
                        {data.isPin && <Pin fontSize="inherit" />} {data.title}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item>
                          <Typography variant="subtitle2" color="textSecondary">
                            {t("announcement:category")}:{" "}
                            {t(`announcement:categoryName.${data.category}`)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </LinkNoDecoration>
              </Grid>
            ))
          ) : (
            <Typography>{t("announcement:no_entry")}</Typography>
          )}
        </Grid>
      </Box>
    </Fragment>
  );
};

export default AnnouncementWidget;
