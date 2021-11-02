import {
  Avatar,
  Button,
  ButtonGroup,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import { Report, ThumbUp } from "@mui/icons-material";
import MarkdownIt from "markdown-it";
import React, { useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
import MdEditor from "react-markdown-editor-lite";
import { CommentModel } from "../../strapi-model";

const CommentBlock: React.FC<{
  comment: CommentModel;
  onThumbsUp?: (id: number) => Promise<void>;
  onReport?: (id: number) => Promise<void>;
}> = ({ comment, onThumbsUp, onReport }) => {
  const mdParser = useMemo(
    () => new MarkdownIt({ linkify: true, typographer: true }),
    []
  );

  const [points, setPoints] = useState(comment.points || 0);

  return (
    <Grid container spacing={1}>
      <Grid
        item
        xs={12}
        container
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <Chip
                label={comment.authorUser.nickname}
                avatar={<Avatar src={comment.authorAvatar} />}
              />
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
        <MdEditor
          value={comment.content}
          renderHTML={(text) => mdParser.render(text)}
          config={{
            view: { html: true, md: false, menu: false },
            canView: { html: true, md: false, menu: false, hideMenu: false },
          }}
        />
      </Grid>
    </Grid>
  );
};

export default CommentBlock;
