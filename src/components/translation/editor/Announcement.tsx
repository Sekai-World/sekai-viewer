import {
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import MarkdownIt from "markdown-it";
// @ts-ignore
import MarkdownItCollapsible from "markdown-it-collapsible";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { AnnouncementModel, TranslationModel } from "../../../strapi-model";
import { UserContext } from "../../../context";
import { useStrapi } from "../../../utils/apiClient";
import { useLayoutStyles } from "../../../styles/layout";
import { useQuery } from "../../../utils";
import { Alert } from "@material-ui/lab";
// import { useHistory } from "react-router-dom";

const Announcement: React.FC<{
  slug: string;
}> = ({ slug }) => {
  const { t } = useTranslation();
  // const history = useHistory();
  const layoutClasses = useLayoutStyles();
  const { jwtToken, usermeta } = useContext(UserContext)!;
  const {
    getAnnouncementById,
    getTranslationBySlug,
    postTranslation,
    putTranslationId,
  } = useStrapi(jwtToken);
  const query = useQuery();

  const [sourceData, setSourceData] = useState<AnnouncementModel>();
  const [sourceLoading, setSourceLoading] = useState(false);
  const [targetLang, setTargetLang] = useState<number>(0);
  const [targetTitle, setTargetTitle] = useState("");
  const [targetDesc, setTargetDesc] = useState("");
  const [targetContent, setTargetContent] = useState("");
  const [targetLoading, setTargetLoading] = useState(false);
  const [isTartgetExisted, setIsTartgetExisted] = useState<boolean | null>(
    null
  );
  const [targetData, setTargetData] = useState<TranslationModel[]>([]);
  const [copySourceOpen, setCopySourceOpen] = useState(false);
  const [translationId, setTranslationId] = useState<number>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isFin, setIsFin] = useState(false);

  const [sourceModel, contentId] = useMemo(() => slug.split(":"), [slug]);
  const mdParser = useMemo(
    () =>
      new MarkdownIt({ linkify: true, typographer: true }).use(
        MarkdownItCollapsible
      ),
    []
  );

  useEffect(() => {
    (async () => {
      setSourceLoading(true);
      const _source = await getAnnouncementById(contentId);
      setSourceData(_source);
      setSourceLoading(false);
      const _data = await getTranslationBySlug(slug, {
        targetLang_in: usermeta?.languages.map((lang) => lang.id),
      });
      if (!_data.length) return;
      setTargetData(_data);
      if (query.get("targetLang")) {
        setTargetLang(Number(query.get("targetLang")));
      }
    })();
  }, [
    contentId,
    getAnnouncementById,
    getTranslationBySlug,
    query,
    slug,
    usermeta,
  ]);

  useEffect(() => {
    (async (langId: number) => {
      const _datum = targetData.find((elem) => elem.targetLang?.id === langId);
      if (_datum) {
        setTranslationId(_datum.id);
        setIsFin(_datum.isFin);
        setIsTartgetExisted(false);
        const [targetModel, targetContentId] = _datum.targetSlug!.split(":");

        if (targetModel === "announcement") {
          setTargetLoading(true);
          const targetData = await getAnnouncementById(targetContentId, {
            _publicationState: "preview",
          });
          setTargetTitle(targetData.title);
          setTargetDesc(targetData.description);
          setTargetContent(targetData.content);
          setIsTartgetExisted(true);
          setTargetLoading(false);
        }
      } else {
        setTargetTitle("");
        setTargetDesc("");
        setTargetContent("");
        setIsTartgetExisted(false);
      }
    })(targetLang);
  }, [getAnnouncementById, targetData, targetLang]);

  return sourceModel === "announcement" && sourceData && usermeta ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("translate:editor.title.source")}
        {sourceLoading && <CircularProgress size={20} />}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid container spacing={1}>
          <Grid item>
            <Typography color="textSecondary">
              {t("translate:editor.source_lang")}
            </Typography>
          </Grid>
          <Grid item>
            <Typography>{sourceData.language.name}</Typography>
          </Grid>
        </Grid>
        <Fragment>
          <Grid container spacing={1}>
            <Grid item>
              <Typography color="textSecondary">
                {t("translate:editor.announcement.source_title")}
              </Typography>
            </Grid>
            <Grid item>
              <Typography>{sourceData.title}</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid item>
              <Typography color="textSecondary">
                {t("translate:editor.announcement.source_desc")}
              </Typography>
            </Grid>
            <Grid item>
              <Typography>{sourceData.description}</Typography>
            </Grid>
          </Grid>
        </Fragment>
        <br />
        <MdEditor
          value={sourceData.content}
          renderHTML={(text) => mdParser.render(text)}
          config={{
            view: { html: true, md: true, menu: false },
            canView: { html: true, md: true, menu: false, hideMenu: false },
          }}
          readOnly
          style={{ maxHeight: "calc(50vh)" }}
        />
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("translate:editor.title.target")}
        {targetLoading && <CircularProgress size={20} />}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Typography color="textSecondary">
              {t("translate:editor.target_lang")}
            </Typography>
          </Grid>
          <Grid item>
            <Select
              style={{ minWidth: 200, maxWidth: "100%" }}
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as number)}
            >
              {usermeta.languages
                .filter(
                  (lang) =>
                    lang.code !==
                    (sourceData as AnnouncementModel).language.code
                )
                .map((lang) => (
                  <MenuItem value={lang.id} key={`lang-${lang.code}`}>
                    {lang.name}
                  </MenuItem>
                ))}
            </Select>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => setCopySourceOpen(true)}>
              {t("translate:editor.button.copy_source")}
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12}>
            <TextField
              label={t("translate:editor.announcement.target_title")}
              value={targetTitle}
              style={{ width: "100%" }}
              onChange={(e) => setTargetTitle(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t("translate:editor.announcement.target_desc")}
              value={targetDesc}
              style={{ width: "100%" }}
              onChange={(e) => setTargetDesc(e.target.value)}
            />
          </Grid>
        </Grid>
        <br />
        <MdEditor
          value={targetContent}
          renderHTML={(text) => mdParser.render(text)}
          config={{
            view: { html: true, md: true },
          }}
          onChange={({ text }) => setTargetContent(text)}
          style={{ maxHeight: "calc(50vh)" }}
        />
      </Container>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Button
            variant="contained"
            color={isFin ? "secondary" : "primary"}
            disabled={
              !isTartgetExisted ||
              !targetLang ||
              !targetTitle ||
              !targetDesc ||
              !targetContent
            }
            style={{ width: "100%" }}
            onClick={() =>
              putTranslationId(translationId!, { isFin: !isFin }).then(() => {
                setIsFin(!isFin);
              })
            }
          >
            {isFin
              ? t("translate:button.mark_unfinished")
              : t("translate:button.mark_finished")}
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            disabled={
              isTartgetExisted === null ||
              (isTartgetExisted && isFin) ||
              !targetLang ||
              !targetTitle ||
              !targetDesc ||
              !targetContent
            }
            style={{ width: "100%" }}
            variant="contained"
            color="primary"
            onClick={async () => {
              const target = {
                title: targetTitle,
                description: targetDesc,
                content: targetContent,
                user: usermeta.id,
                language: targetLang,
                category: sourceData.category,
              };
              try {
                if (isTartgetExisted)
                  await putTranslationId(translationId!, {
                    target,
                    targetLang,
                  });
                else
                  await postTranslation(
                    usermeta,
                    slug,
                    sourceData.language.id,
                    target,
                    targetLang!
                  );
                if (!isTartgetExisted) setIsTartgetExisted(true);
                setIsSuccess(true);
              } catch (error) {
                setIsFailed(true);
              }
            }}
          >
            {t("common:submit")}
          </Button>
        </Grid>
      </Grid>
      <Dialog open={copySourceOpen} onClose={() => setCopySourceOpen(false)}>
        <DialogTitle>
          {t("translate:editor.dialog.copy_source.title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("translate:editor.dialog.copy_source.text")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              setTargetTitle(sourceData.title);
              setTargetDesc(sourceData.description);
              setTargetContent(sourceData.content);
              setCopySourceOpen(false);
            }}
          >
            {t("translate:editor.dialog.copy_source.confirm")}
          </Button>
          <Button onClick={() => setCopySourceOpen(false)}>
            {t("translate:editor.dialog.copy_source.cancel")}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={isSuccess}
        autoHideDuration={3000}
        onClose={() => setIsSuccess(false)}
      >
        <Alert variant="filled" severity="success">
          {t("translate:editor.submit-status.success")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={isFailed}
        autoHideDuration={3000}
        onClose={() => setIsFailed(false)}
      >
        <Alert variant="filled" severity="error">
          {t("translate:editor.submit-status.failed")}
        </Alert>
      </Snackbar>
    </Fragment>
  ) : (
    <Typography variant="h6" className={layoutClasses.header}>
      Loading...
    </Typography>
  );
};

export default Announcement;
