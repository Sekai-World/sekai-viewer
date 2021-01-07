import { Button, ButtonGroup, Grid, Typography } from "@material-ui/core";
import { Report, ThumbUp } from "@material-ui/icons";
import MarkdownIt from "markdown-it";
import React, { useEffect, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
import MdEditor from "react-markdown-editor-lite";
import { CommentModel, UserModel } from "../../strapi-model";
import { useStrapi } from "../../utils/apiClient";

const CommentBlock: React.FC<{
  comment: CommentModel;
  onThumbsUp?: (id: number) => Promise<void>;
  onReport?: (id: number) => Promise<void>;
}> = ({ comment, onThumbsUp, onReport }) => {
  const { getUserInfo } = useStrapi();
  // const { t } = useTranslation();

  const mdParser = useMemo(
    () => new MarkdownIt({ linkify: true, typographer: true }),
    []
  );

  const [user, setUser] = useState<UserModel>();
  const [points, setPoints] = useState(comment.points || 0);

  useEffect(() => {
    getUserInfo(
      // @ts-ignore
      isNaN(comment.authorUser) ? comment.authorUser.id : comment.authorUser
    ).then(setUser);
  }, [comment.authorUser, getUserInfo]);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} container justify="space-between" alignItems="center">
        <Grid item>
          <Grid container spacing={1}>
            <Grid item>
              <Typography color="textSecondary" variant="subtitle2">
                {user?.username}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2">
                {new Date(comment.created_at).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <ButtonGroup>
            {!!onThumbsUp && (
              <Button
                onClick={async () => {
                  await onThumbsUp(comment.id);
                  setPoints(points + 1);
                }}
              >
                <ThumbUp fontSize="inherit" /> {points}
              </Button>
            )}
            {!!onReport && (
              <Button
                onClick={async () => {
                  await onReport(comment.id);
                }}
              >
                <Report fontSize="inherit" />
              </Button>
            )}
          </ButtonGroup>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          <MdEditor
            value={comment.content}
            renderHTML={(text) => mdParser.render(text)}
            config={{
              view: { html: true, md: false, menu: false },
              canView: { html: true, md: false, menu: false },
            }}
          />
        </Typography>
      </Grid>
    </Grid>
  );
};

export default CommentBlock;
