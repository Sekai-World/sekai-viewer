import {
  Typography,
  Grid,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import { Check, Clear, Create, Upload, Logout } from "@mui/icons-material";
import { Field, Form, Formik } from "formik";
import { Select, TextField } from "formik-mui";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useAlertSnackbar } from "../../../utils";
import { useStrapi } from "../../../utils/apiClient";
import { useRootStore } from "../../../stores/root";
import { IUserMetadata } from "../../../stores/user";
import { observer } from "mobx-react-lite";
import TypographyHeader from "../../../components/styled/TypographyHeader";
import ContainerContent from "../../../components/styled/ContainerContent";
const SekaiProfile = React.lazy(() => import("../sekai_profile/SekaiProfile"));

const UserHome: React.FC<{}> = observer(() => {
  const { t } = useTranslation();
  const history = useHistory();
  const {
    user: { userinfo, metadata, setMetadata },
    jwtToken,
    logout,
    settings: { languages },
  } = useRootStore();
  const { postUpload, putUserMetadataMe, getUserMetadataMe } =
    useStrapi(jwtToken);
  const { showError } = useAlertSnackbar();

  const [avatarUrl, setAvatarUrl] = useState("");
  const [nickname, setNickname] = useState("");
  const [preferLangs, setPreferLangs] = useState<number[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isShowEmail, setIsShowEmail] = useState(false);
  const [isEditingPreferLangs, setIsEditingPreferLangs] = useState(false);

  useEffect(() => {
    document.title = t("title:user_home");
  }, [t]);

  useEffect(() => {
    if (metadata) {
      setAvatarUrl(metadata.avatar?.url || "");
      setNickname(metadata.nickname);
      setPreferLangs(metadata.languages.map((lang) => lang.id));
    }
    return () => {
      setAvatarUrl("");
      setNickname("");
      setPreferLangs([]);
    };
  }, [metadata]);

  return (
    <Fragment>
      <TypographyHeader>{t("common:user")}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={12} container justifyContent="center">
                <Avatar
                  src={avatarUrl || ""}
                  sx={(theme) => ({
                    [theme.breakpoints.down("md")]: {
                      height: theme.spacing(15),
                      width: theme.spacing(15),
                    },
                    [theme.breakpoints.up("md")]: {
                      height: theme.spacing(20),
                      width: theme.spacing(20),
                    },
                  })}
                >
                  {(nickname || "").substring(0, 2).toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item xs={12} container justifyContent="center">
                <Box
                  component="input"
                  sx={{ display: "none" }}
                  accept="image/png,image/jpeg"
                  id="upload-avatar-button"
                  type="file"
                  onChange={(e) => {
                    if (!e.target.files || !e.target.files.length) return;
                    const file = e.target.files.item(0);
                    if (!file?.type.startsWith("image/")) return;

                    const form = new FormData();
                    form.append("files", file);
                    form.append("refId", String(metadata?.id));
                    form.append("ref", "user-metadata");
                    form.append("field", "avatar");

                    const oldUrl = avatarUrl;
                    setIsUploading(true);
                    setAvatarUrl("");
                    postUpload(form)
                      .then(() => {
                        // update user data
                        return getUserMetadataMe();
                      })
                      .then((data) => {
                        // jwtAuth.user = data;
                        setMetadata(data as IUserMetadata);
                        setAvatarUrl(data.avatar ? data.avatar.url : "");
                        setIsUploading(false);
                      })
                      .catch(() => {
                        showError(t("user:profile.upload_avatar_error"));
                        setIsUploading(false);
                        setAvatarUrl(oldUrl);
                      });

                    e.target.value = "";
                  }}
                />
                <label htmlFor="upload-avatar-button">
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item>
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={isUploading}
                        startIcon={
                          isUploading ? (
                            <CircularProgress size={24} />
                          ) : (
                            <Upload />
                          )
                        }
                      >
                        {t("user:profile.upload_avatar")}
                      </Button>
                    </Grid>
                  </Grid>
                </label>
              </Grid>
              <Grid item xs={12} container justifyContent="center">
                <Button
                  onClick={() => {
                    logout();
                    history.replace("/user/login");
                  }}
                  variant="outlined"
                  color="secondary"
                  startIcon={<Logout />}
                >
                  {t("auth:logout")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Grid container justifyContent="space-between">
                  <Typography fontWeight="bold">
                    {t("user:profile.username")}
                  </Typography>
                  <Typography>{userinfo?.username}</Typography>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight="bold">
                    {t("user:profile.nickname")}
                    {!isEditingNickname && (
                      <IconButton
                        size="small"
                        onClick={() => setIsEditingNickname((state) => !state)}
                      >
                        <Create />
                      </IconButton>
                    )}
                  </Typography>
                  {isEditingNickname ? (
                    <Formik
                      initialValues={{ nickname }}
                      onSubmit={async (values) => {
                        try {
                          await putUserMetadataMe({
                            nickname: values.nickname,
                          });
                          setNickname(values.nickname);
                          setIsEditingNickname(false);
                          // updateUser(await getUserMe());
                          setMetadata(
                            (await getUserMetadataMe()) as IUserMetadata
                          );
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                    >
                      {({ submitForm, isSubmitting }) => (
                        <Fragment>
                          <Form>
                            <Field
                              component={TextField}
                              name="nickname"
                              type="text"
                              // label={t("auth:profile.nickname")}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={() => submitForm()}
                                      disabled={isSubmitting}
                                    >
                                      {isSubmitting ? (
                                        <CircularProgress size={24} />
                                      ) : (
                                        <Check />
                                      )}
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      disabled={isSubmitting}
                                      onClick={() =>
                                        setIsEditingNickname(false)
                                      }
                                    >
                                      <Clear />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            ></Field>
                            <input type="submit" style={{ display: "none" }} />
                          </Form>
                        </Fragment>
                      )}
                    </Formik>
                  ) : (
                    <Typography>{nickname}</Typography>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Grid container justifyContent="space-between">
                  <Typography fontWeight="bold">
                    {t("user:profile.role")}
                  </Typography>
                  <Typography>{userinfo?.role}</Typography>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight="bold">
                    {t("user:profile.email")}
                  </Typography>
                  {isShowEmail ? (
                    <Typography>{userinfo?.email}</Typography>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => setIsShowEmail(true)}
                    >
                      {t("user:profile.button.show_email")}
                    </Button>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Grid container justifyContent="space-between">
                  <Typography fontWeight="bold">
                    {t("user:profile.email_confirmed")}
                  </Typography>
                  <Typography
                    sx={{
                      color: userinfo?.confirmed
                        ? "success.main"
                        : "error.main",
                    }}
                  >
                    {t(
                      `user:profile.email_confirmed_status.${userinfo?.confirmed}`
                    )}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight="bold">
                    {t("auth:signup.label.prefer_langs")}
                    {!isEditingPreferLangs && (
                      <IconButton
                        size="small"
                        onClick={() =>
                          setIsEditingPreferLangs((state) => !state)
                        }
                      >
                        <Create />
                      </IconButton>
                    )}
                  </Typography>
                  {isEditingPreferLangs ? (
                    <Formik
                      initialValues={{ preferLangs }}
                      onSubmit={async (values) => {
                        try {
                          await putUserMetadataMe({
                            languages: values.preferLangs.map(
                              (elem) =>
                                languages.find((lang) => lang.id === elem)!
                            ),
                          });
                          setPreferLangs(values.preferLangs);
                          setIsEditingPreferLangs(false);
                          setMetadata(
                            (await getUserMetadataMe()) as IUserMetadata
                          );
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                    >
                      {({ submitForm, isSubmitting }) => (
                        <Fragment>
                          <Form>
                            <Grid container alignItems="center">
                              <Grid item>
                                <FormControl>
                                  <InputLabel htmlFor="select-prefer-langs">
                                    {t("auth:signup.label.prefer_langs")}
                                  </InputLabel>
                                  <Field
                                    component={Select}
                                    name="preferLangs"
                                    multiple
                                    style={{ width: "150px" }}
                                  >
                                    {languages.map((lang) => (
                                      <MenuItem key={lang.code} value={lang.id}>
                                        {lang.name}
                                      </MenuItem>
                                    ))}
                                  </Field>
                                </FormControl>
                              </Grid>
                              <Grid item>
                                <IconButton
                                  size="small"
                                  onClick={() => submitForm()}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <CircularProgress size={24} />
                                  ) : (
                                    <Check />
                                  )}
                                </IconButton>
                                <IconButton
                                  size="small"
                                  disabled={isSubmitting}
                                  onClick={() => setIsEditingPreferLangs(false)}
                                >
                                  <Clear />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Form>
                        </Fragment>
                      )}
                    </Formik>
                  ) : (
                    <Typography>
                      {preferLangs
                        .map(
                          (elem) =>
                            languages.find((lang) => lang.id === elem)!.name
                        )
                        .join(", ")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* {JSON.stringify(user)} */}
      </ContainerContent>
      <SekaiProfile />
    </Fragment>
  );
});

export default UserHome;
