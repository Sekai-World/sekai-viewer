import { Box, Card, CardContent, Grid, Typography } from "@material-ui/core";
import { Pin } from "mdi-material-ui";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AnnouncementModel } from "../../strapi-model";
import { useInteractiveStyles } from "../../styles/interactive";
import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../utils/apiClient";

const AnnouncementWidget: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { getAnnouncementPage } = useStrapi();

  const [announcements, setAnnouncements] = useState<AnnouncementModel[]>([]);

  useEffect(() => {
    getAnnouncementPage(10).then(setAnnouncements);
  }, [getAnnouncementPage]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:announcement")}
      </Typography>
      <Box padding="3% 5% 3% 3%" maxHeight={340} overflow="overlay">
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
        </Grid>
      </Box>
    </Fragment>
  );
};

export default AnnouncementWidget;
