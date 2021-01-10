import {
  Typography,
  Container,
  Grid,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Snackbar,
  useTheme,
  InputAdornment,
  Tooltip,
  makeStyles,
  MenuItem,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import { Check, Clear, Create } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { Field, Form, Formik } from "formik";
import { Select, TextField } from "formik-material-ui";
import { Upload, Logout } from "mdi-material-ui";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { SettingContext, UserContext } from "../../../context";
import { useInteractiveStyles } from "../../../styles/interactive";
import { useLayoutStyles } from "../../../styles/layout";
import { useStrapi } from "../../../utils/apiClient";
import SekaiProfile from "../sekai_profile/SekaiProfile";

const useStyles = makeStyles((theme) => ({
  avatarProfile: {
    [theme.breakpoints.down("sm")]: {
      height: theme.spacing(10),
      width: theme.spacing(10),
    },
    [theme.breakpoints.up("md")]: {
      height: theme.spacing(20),
      width: theme.spacing(20),
    },
  },
}));

const UserHome: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const { user, jwtToken, logout, usermeta, updateUserMeta } = useContext(
    UserContext
  )!;
  const { languages } = useContext(SettingContext)!;
  const { postUpload, putUserMetadataMe, getUserMetadataMe } = useStrapi(
    jwtToken
  );
  const [isUploadAvatarError, setIsUploadAvatarError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    usermeta ? (usermeta.avatar || { url: "" }).url : ""
  );
  const [nickname, setNickname] = useState(usermeta?.nickname || "");
  const [preferLangs, setPreferLangs] = useState<number[]>(
    usermeta?.languages.map((lang) => lang.id) || []
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isShowEmail, setIsShowEmail] = useState(false);
  const [isEditingPreferLangs, setIsEditingPreferLangs] = useState(false);

  useEffect(() => {
    document.title = t("title:user_home");
  }, [t]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:user")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={12} container justify="center">
                <Avatar src={avatarUrl || ""} className={classes.avatarProfile}>
                  {(nickname || "").substr(0, 2).toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item xs={12} container justify="center">
                <input
                  accept="image/png,image/jpeg"
                  className={interactiveClasses.inputHidden}
                  id="upload-avatar-button"
                  type="file"
                  onChange={(e) => {
                    if (!e.target.files || !e.target.files.length) return;
                    const file = e.target.files.item(0);
                    if (!file?.type.startsWith("image/")) return;

                    const form = new FormData();
                    form.append("files", file);
                    form.append("refId", String(usermeta?.id));
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
                        updateUserMeta(data);
                        setAvatarUrl(data.avatar ? data.avatar.url : "");
                        setIsUploading(false);
                      })
                      .catch(() => {
                        setIsUploadAvatarError(true);
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
              <Grid item xs={12} container justify="center">
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
                <Grid container justify="space-between">
                  <Typography className={layoutClasses.bold}>
                    {t("user:profile.username")}
                  </Typography>
                  <Typography>{user?.username}</Typography>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Grid container justify="space-between" alignItems="center">
                  <Typography className={layoutClasses.bold}>
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
                          updateUserMeta(await getUserMetadataMe());
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
                <Grid container justify="space-between">
                  <Typography className={layoutClasses.bold}>
                    {t("user:profile.role")}
                  </Typography>
                  <Tooltip title={user?.role.description || ""} arrow>
                    <Typography>{user?.role.name}</Typography>
                  </Tooltip>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Grid container justify="space-between" alignItems="center">
                  <Typography className={layoutClasses.bold}>
                    {t("user:profile.email")}
                  </Typography>
                  {isShowEmail ? (
                    <Typography>{user?.email}</Typography>
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
                <Grid container justify="space-between">
                  <Typography className={layoutClasses.bold}>
                    {t("user:profile.email_confirmed")}
                  </Typography>
                  <Typography
                    style={{
                      color: user?.confirmed
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                    }}
                  >
                    {t(
                      `user:profile.email_confirmed_status.${user?.confirmed}`
                    )}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Grid container justify="space-between" alignItems="center">
                  <Typography className={layoutClasses.bold}>
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
                          updateUserMeta(await getUserMetadataMe());
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
      </Container>
      <SekaiProfile />
      <Snackbar
        open={isUploadAvatarError}
        autoHideDuration={3000}
        onClose={() => setIsUploadAvatarError(false)}
      >
        <Alert onClose={() => setIsUploadAvatarError(false)} severity="error">
          {t("user:profile.upload_avatar_error")}
        </Alert>
      </Snackbar>
    </Fragment>
  );
};

export default UserHome;
