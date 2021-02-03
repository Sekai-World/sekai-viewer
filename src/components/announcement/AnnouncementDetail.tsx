import {
  Avatar,
  Chip,
  Container,
  Divider,
  Grid,
  Typography,
} from "@material-ui/core";
import React, {
  Fragment,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import MarkdownIt from "markdown-it";
// @ts-ignore
import MarkdownItCollapsible from "markdown-it-collapsible";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import {
  AnnouncementModel,
  CommentModel,
  UserMetadatumModel,
} from "../../strapi-model";
import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../utils/apiClient";
import Comment from "../comment/Comment";
import { CommentTextMultiple } from "mdi-material-ui";
import { useQuery } from "../../utils";
import { UserContext } from "../../context";
import AdSense from "../subs/AdSense";

const AnnouncementDetail: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { id } = useParams<{ id: string }>();
  const query = useQuery();
  const { usermeta } = useContext(UserContext)!;
  const {
    getAnnouncementById,
    getComments,
    getTranslationBySlug,
  } = useStrapi();
  const { t } = useTranslation();

  const mdParser = useMemo(
    () =>
      new MarkdownIt({ linkify: true, typographer: true }).use(
        MarkdownItCollapsible
      ),
    []
  );

  const [announcement, setAnnouncement] = useState<AnnouncementModel>();
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [contributors, setContributors] = useState<UserMetadatumModel[]>([]);

  useLayoutEffect(() => {
    document.title = t("title:announcementDetail", {
      name: announcement?.title,
    });
  }, [announcement, t]);

  useEffect(() => {
    getAnnouncementById(
      id,
      query.get("preview")
        ? {
            _publicationState: "preview",
          }
        : {}
    ).then(setAnnouncement);
    getComments("announcement", id).then(setComments);
    getTranslationBySlug(`announcement:${id}`, "target").then(
      (data) =>
        data[0] &&
        setContributors(
          data[0].users.filter((meta) => meta.id !== (usermeta || { id: 0 }).id)
        )
    );
  }, [
    getAnnouncementById,
    getComments,
    getTranslationBySlug,
    id,
    query,
    usermeta,
  ]);

  return !!announcement ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {announcement.title}
      </Typography>
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <Typography variant="subtitle2" color="textSecondary">
            {t("announcement:category")}:{" "}
            {t(`announcement:categoryName.${announcement.category}`)}
          </Typography>
        </Grid>
        {/* <Grid item>
          <Chip
            label={announcement.user.nickname}
            avatar={
              <Avatar
                src={
                  announcement.user.avatar ? announcement.user.avatar.url : ""
                }
              />
            }
          />
        </Grid> */}
        <Grid item>
          <Typography variant="subtitle2" color="textSecondary">
            {t("announcement:published_at")}:{" "}
            {new Date(announcement.created_at).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
      <Divider style={{ margin: "1% 0" }} />
      <Container className={layoutClasses.content}>
        {!!contributors.length && (
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <Typography color="textSecondary">
                {t("announcement:translators")}
              </Typography>
            </Grid>
            <Grid item>
              <Grid container spacing={1}>
                {contributors.map((userMeta) => (
                  <Grid item>
                    <Chip
                      label={userMeta.nickname}
                      avatar={
                        <Avatar
                          src={userMeta.avatar ? userMeta.avatar.url : ""}
                        />
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}
        <br />
        <MdEditor
          value={announcement.content}
          renderHTML={(text) => mdParser.render(text)}
          config={{
            view: { html: true, md: false, menu: false },
            canView: { html: true, md: false, menu: false, hideMenu: false },
          }}
          readOnly
        />
        <br />
        <AdSense
          client="ca-pub-7767752375383260"
          slot="5596436251"
          format="auto"
          responsive="true"
        />
      </Container>
      {!query.get("preview") && (
        <Fragment>
          <Typography variant="h6" className={layoutClasses.header}>
            {t("common:comment")} <CommentTextMultiple />
          </Typography>
          <Container className={layoutClasses.content} maxWidth="md">
            <Comment
              comments={comments.filter((comm) => !comm.blocked)}
              contentType="announcement"
              contentId={Number(id)}
            />
          </Container>
        </Fragment>
      )}
    </Fragment>
  ) : (
    <Typography variant="h6" className={layoutClasses.header}>
      Loading...
    </Typography>
  );
};

export default AnnouncementDetail;
