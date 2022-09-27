import {
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import MarkdownIt from "markdown-it";
// @ts-ignore
import MarkdownItCollapsible from "markdown-it-collapsible";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import {
  AnnouncementModel,
  TranslationModel,
  UserMetadatumModel,
} from "../../../strapi-model";
import { useStrapi } from "../../../utils/apiClient";
import { useAlertSnackbar, useQuery } from "../../../utils";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../../stores/root";
import TypographyHeader from "../../../components/styled/TypographyHeader";
import ContainerContent from "../../../components/styled/ContainerContent";

const Announcement: React.FC<{
  slug: string;
}> = observer(({ slug }) => {
  const { t } = useTranslation();
  const {
    jwtToken,
    user: { metadata },
  } = useRootStore();
  const {
    getAnnouncementById,
    getTranslationBySlug,
    postTranslation,
    putTranslationId,
  } = useStrapi(jwtToken);
  const query = useQuery();
  const { showSuccess, showError } = useAlertSnackbar();

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
  const [targetContributors, setTargetContributors] = useState<
    UserMetadatumModel[]
  >([]);
  const [copySourceOpen, setCopySourceOpen] = useState(false);
  const [translationId, setTranslationId] = useState<number>();
  const [isFin, setIsFin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sourceModel, contentId] = useMemo(() => slug.split(":"), [slug]);
  const mdParser = useMemo(
    () =>
      new MarkdownIt({ linkify: true, typographer: true }).use(
        MarkdownItCollapsible
      ),
    []
  );

  useEffect(() => {
    const func = async () => {
      if (metadata) {
        setSourceLoading(true);
        const _source = await getAnnouncementById(contentId);
        setSourceData(_source);
        setSourceLoading(false);
        const _data = await getTranslationBySlug(slug, "source", {
          targetLang_in: metadata.languages.map((lang) => lang.id),
        });
        if (!_data.length) return;
        setTargetData(_data);
        if (query.get("targetLang")) {
          setTargetLang(Number(query.get("targetLang")));
        }
      }
    };
    func();
  }, [
    contentId,
    getAnnouncementById,
    getTranslationBySlug,
    metadata,
    query,
    slug,
  ]);

  useEffect(() => {
    (async (langId: number) => {
      const _datum = targetData.find((elem) => elem.targetLang?.id === langId);
      if (_datum) {
        setTranslationId(_datum.id);
        setIsFin(_datum.isFin);
        setIsTartgetExisted(false);
        setTargetContributors(_datum.users);
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
        setTargetContributors([]);
      }
    })(targetLang);
  }, [getAnnouncementById, targetData, targetLang]);

  return sourceModel === "announcement" && sourceData && metadata ? (
    <Fragment>
      <TypographyHeader>
        {t("translate:editor.title.source")}
        {sourceLoading && <CircularProgress size={20} />}
      </TypographyHeader>
      <ContainerContent maxWidth="md">
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
          style={{ height: "calc(50vh)" }}
        />
      </ContainerContent>
      <TypographyHeader>
        {t("translate:editor.title.target")}
        {targetLoading && <CircularProgress size={20} />}
      </TypographyHeader>
      <ContainerContent maxWidth="md">
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
              {metadata.languages
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
        {isTartgetExisted && (
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <Typography color="textSecondary">
                {t("translate:editor.target_contributors")}
              </Typography>
            </Grid>
            <Grid item>
              <Grid container spacing={1}>
                {targetContributors.map((userMeta) => (
                  <Grid item>
                    <Chip
                      label={userMeta.nickname}
                      key={userMeta.id}
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
            canView: { fullScreen: false },
          }}
          onChange={({ text }) => setTargetContent(text)}
          style={{ height: "calc(50vh)" }}
        />
      </ContainerContent>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Button
            variant="contained"
            color={isFin ? "secondary" : "primary"}
            disabled={
              isSubmitting ||
              !isTartgetExisted ||
              !targetLang ||
              !targetTitle ||
              !targetDesc ||
              !targetContent
            }
            style={{ width: "100%" }}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await putTranslationId(translationId!, { isFin: !isFin });
                setIsFin(!isFin);
                showSuccess(t("translate:editor.submit-status.success"));
              } catch (error) {
                showError(t("translate:editor.submit-status.failed"));
              }
              setIsSubmitting(false);
            }}
          >
            {isFin
              ? t("translate:button.mark_unfinished")
              : t("translate:button.mark_finished")}
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            disabled={
              isSubmitting ||
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
                user: metadata.id,
                language: targetLang,
                category: sourceData.category,
              };
              try {
                setIsSubmitting(true);
                if (isTartgetExisted)
                  await putTranslationId(translationId!, {
                    target,
                    targetLang,
                  });
                else {
                  const { id } = await postTranslation(
                    metadata,
                    slug,
                    sourceData.language.id,
                    target,
                    targetLang!
                  );
                  setTranslationId(id);
                }
                if (!isTartgetExisted) setIsTartgetExisted(true);
                if (!targetContributors.find((elem) => elem.id === metadata.id))
                  setTargetContributors([...targetContributors, metadata]);
                showSuccess(t("translate:editor.submit-status.success"));
                setIsSubmitting(false);
              } catch (error) {
                setIsSubmitting(false);
                showError(t("translate:editor.submit-status.failed"));
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
    </Fragment>
  ) : (
    <TypographyHeader>Loading...</TypographyHeader>
  );
});

export default Announcement;
