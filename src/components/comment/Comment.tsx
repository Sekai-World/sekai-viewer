import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import MarkdownIt from "markdown-it";
import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import MdEditor, { Plugins } from "react-markdown-editor-lite";
import { useTranslation } from "react-i18next";
import { CommentAbuseReason, CommentModel } from "../../strapi-model";
import { useStrapi } from "../../utils/apiClient";
import CommentBlock from "./CommentBlock";
import { UserContext } from "../../context";
import { Alert } from "@material-ui/lab";

const Comment: React.FC<{
  comments: CommentModel[];
  contentType: string;
  contentId: string | number;
}> = ({ comments, contentId, contentType }) => {
  const { t } = useTranslation();
  const { user, jwtToken } = useContext(UserContext)!;
  const { postComment, postCommentAbuse } = useStrapi(jwtToken);

  const mdParser = useMemo(
    () => new MarkdownIt({ linkify: true, typographer: true }),
    []
  );

  useEffect(() => {
    MdEditor.use(Plugins.AutoResize, {
      min: 150,
      max: 300,
    });
    return () => {
      MdEditor.unuse(Plugins.AutoResize);
    };
  }, []);

  const [isCompose, setIsCompose] = useState(false);
  const [content, setContent] = useState("");
  const [tmpComments, setTmpComments] = useState<CommentModel[]>(comments);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [reportId, setReportId] = useState(0);
  const [reportReason, setReportReason] = useState<CommentAbuseReason>("OTHER");
  const [isReportSuccess, setIsReportSuccess] = useState(false);

  return (
    <Grid container spacing={1}>
      {user && (
        <Grid item xs={12}>
          {isCompose ? (
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <MdEditor
                  value={content}
                  config={{
                    view: { menu: true, md: true },
                    canView: { fullScreen: false },
                  }}
                  renderHTML={(text) => mdParser.render(text)}
                  onChange={({ text }) => setContent(text)}
                />
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    const data = await postComment(
                      contentType,
                      contentId,
                      user.id,
                      content
                    );
                    setTmpComments([...tmpComments, data]);
                    setIsCompose(false);
                  }}
                >
                  {t("comment:send")}
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Button variant="outlined" onClick={() => setIsCompose(true)}>
              {t("comment:write")}
            </Button>
          )}
        </Grid>
      )}
      <Grid item xs={12}>
        <Box margin="2% 0" />
      </Grid>
      {tmpComments.length ? (
        tmpComments.map((comm) => (
          <Fragment>
            <Grid item xs={12}>
              <CommentBlock
                comment={comm}
                // onThumbsUp={async (id) => {
                //   await patchCommentLike(contentType, contentId, id);
                // }}
                onReport={async (id) => {
                  setIsReportOpen(true);
                  setReportId(id);
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </Fragment>
        ))
      ) : (
        <Typography>{t("comment:no_comment_yet")}</Typography>
      )}
      <Dialog
        open={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setReportContent("");
          setReportId(0);
        }}
      >
        <DialogTitle>{t("comment:report-abuse.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("comment:report-abuse.description")}
          </DialogContentText>
          <FormControl>
            <InputLabel>{t("comment:report-abuse.reason.label")}</InputLabel>
            <Select
              value={reportReason}
              onChange={(ev) =>
                setReportReason(ev.target.value as CommentAbuseReason)
              }
            >
              <MenuItem value="OTHER">
                {t("comment:report-abuse.reason.other")}
              </MenuItem>
              <MenuItem value="BAD_WORDS">
                {t("comment:report-abuse.reason.bad_words")}
              </MenuItem>
              <MenuItem value="DISCRIMINATION">
                {t("comment:report-abuse.reason.discrimination")}
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            value={reportContent}
            margin="dense"
            label={t("comment:report-abuse.content")}
            type="text"
            onChange={(ev) => setReportContent(ev.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              await postCommentAbuse(
                contentType,
                contentId,
                reportId,
                reportReason,
                reportContent
              );
              // const idx = tmpComments.findIndex(
              //   (comm) => comm.id === reportId
              // )!;
              // setTmpComments([
              //   ...tmpComments.slice(0, idx),
              //   ...tmpComments.slice(idx + 1),
              // ]);
              setIsReportSuccess(true);
              setIsReportOpen(false);
            }}
            color="primary"
          >
            {t("common:submit")}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={isReportSuccess}
        autoHideDuration={3000}
        onClose={() => {
          setIsReportSuccess(false);
        }}
      >
        <Alert
          onClose={() => {
            setIsReportSuccess(false);
          }}
          severity="success"
        >
          {t("comment:report-abuse.success")}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default Comment;
