import { Box, Card, CardContent, Grid, Typography } from "@material-ui/core";
import { Pin } from "mdi-material-ui";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { SettingContext, UserContext } from "../../context";
import { AnnouncementModel } from "../../strapi-model";
import { useInteractiveStyles } from "../../styles/interactive";
import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../utils/apiClient";

const AnnouncementWidget: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { usermeta } = useContext(UserContext)!;
  const { languages, lang } = useContext(SettingContext)!;
  const { getAnnouncementPage } = useStrapi();

  const [announcements, setAnnouncements] = useState<AnnouncementModel[]>([]);

  useEffect(() => {
    (async () => {
      const enId = languages.find((lang) => lang.code === "en")!.id;
      const langId = languages.find((elem) => elem.code === lang)!.id;
      const data = await getAnnouncementPage(
        10,
        0,
        usermeta
          ? {
              language_in: [
                enId,
                langId,
                ...usermeta?.languages.map((lang) => lang.id),
              ],
            }
          : {
              language_in: [enId, langId],
            }
      );
      setAnnouncements(data);
    })();
  }, [getAnnouncementPage, lang, languages, usermeta]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:announcement")}
      </Typography>
      <Box padding="3% 5% 3% 3%" maxHeight={340} overflow="auto">
        <Grid container spacing={1}>
          {announcements.map((data) => (
            <Grid key={data.id} item xs={12}>
              <Link
                to={`/announcement/${data.id}`}
                className={interactiveClasses.noDecoration}
              >
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
              </Link>
            </Grid>
          ))}
          {!announcements.length && (
            <Typography>{t("announcement:no_entry")}</Typography>
          )}
        </Grid>
      </Box>
    </Fragment>
  );
};

export default AnnouncementWidget;
