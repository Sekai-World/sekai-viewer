import { Pin } from "mdi-material-ui";
import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { useInteractiveStyles } from "../../styles/interactive";
import { AnnouncementModel } from "../../strapi-model";
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useTranslation } from "react-i18next";

const GridView: React.FC<{ data?: AnnouncementModel }> = ({ data }) => {
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  return data ? (
    <Fragment>
      <Link
        to={`/announcement/${data.id}`}
        className={interactiveClasses.noDecoration}
      >
        <Card>
          <CardContent>
            <Typography variant="h5">
              {data.isPin && <Pin fontSize="inherit" />} {data.title}
            </Typography>
            <Typography>{data.description}</Typography>
          </CardContent>
          <CardContent>
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                <Typography variant="subtitle2" color="textSecondary">
                  {t("announcement:category")}:{" "}
                  {t(`announcement:categoryName.${data.category}`)}
                </Typography>
              </Grid>
              <Grid item>
                {/* <Typography variant="subtitle2" color="textSecondary">
                  {t("announcement:author")}:{" "}
                </Typography> */}
                <Chip
                  label={data.user.nickname}
                  avatar={<Avatar src={data.user.avatar.url} />}
                />
              </Grid>
              <Grid item>
                <Typography variant="subtitle2" color="textSecondary">
                  {t("announcement:published_at")}:{" "}
                  {new Date(data.published_at).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Link>
    </Fragment>
  ) : (
    <Card>
      <CardContent>
        <Typography variant="h5">
          <Skeleton variant="text" width="50%"></Skeleton>
        </Typography>
        <Typography>
          <Skeleton variant="text" width="90%"></Skeleton>
        </Typography>
        <Typography variant="subtitle2">
          <Skeleton variant="text" width="80%"></Skeleton>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GridView;
