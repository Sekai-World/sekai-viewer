import { Container, Divider, Grid, Typography } from "@material-ui/core";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { AnnouncementModel } from "../../strapi-model";
import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../utils/apiClient";
import Comment from "../comment/Comment";
import { CommentTextMultiple } from "mdi-material-ui";

const AnnouncementDetail: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { id } = useParams<{ id: string }>();
  const { getAnnouncementById } = useStrapi();
  const { t } = useTranslation();

  const mdParser = useMemo(
    () => new MarkdownIt({ linkify: true, typographer: true }),
    []
  );

  const [announcement, setAnnouncement] = useState<AnnouncementModel>();

  useEffect(() => {
    getAnnouncementById(id).then(setAnnouncement);
  }, [getAnnouncementById, id]);

  return !!announcement ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {announcement.title}
      </Typography>
      <Grid container spacing={1}>
        <Grid item>
          <Typography variant="subtitle2" color="textSecondary">
            {t("announcement:category")}:{" "}
            {t(`announcement:category_name.${announcement.category}`)}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="subtitle2" color="textSecondary">
            {t("announcement:author")}: {announcement.user.username}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="subtitle2" color="textSecondary">
            {t("announcement:published_at")}:{" "}
            {new Date(announcement.published_at).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
      <Divider style={{ margin: "1% 0" }} />
      <Container className={layoutClasses.content}>
        <MdEditor
          value={announcement.content}
          renderHTML={(text) => mdParser.render(text)}
          config={{ view: { html: true }, canView: { html: true } }}
        />
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:comment")} <CommentTextMultiple />
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Comment
          comments={announcement.comments.filter((comm) => !comm.blocked)}
          contentType="announcement"
          contentId={Number(id)}
        />
      </Container>
    </Fragment>
  ) : (
    <Typography variant="h6" className={layoutClasses.header}>
      Loading...
    </Typography>
  );
};

export default AnnouncementDetail;
