import {
  Avatar,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Snackbar,
  Typography,
  useTheme,
} from "@material-ui/core";
import { Create } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { Logout, Upload } from "mdi-material-ui";
import React, { Fragment, lazy, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from "react-router-dom";
import { useInteractiveStyles } from "../../styles/interactive";
import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../utils/apiClient";
import useJwtAuth from "../../utils/jwt";

const Login = lazy(() => import("./Login"));
const Signup = lazy(() => import("./Signup"));

const User: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const theme = useTheme();
  // const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const jwtAuth = useJwtAuth();
  const { user, isExpired, token } = useJwtAuth();
  const { getUserMe, postUpload } = useStrapi();
  const history = useHistory();
  let { path } = useRouteMatch();

  const [isUploadAvatarError, setIsUploadAvatarError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadatum.avatar.url);
  const [nickname, setNickname] = useState(user.user_metadatum.nickname);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    document.title = t("title:user");
  }, [t]);

  return (
    <Fragment>
      <Switch>
        <Route exact path={path}>
          {isExpired ? (
            <Redirect to={`${path}/login`}></Redirect>
          ) : (
            user && (
              <Fragment>
                <Typography variant="h6" className={layoutClasses.header}>
                  {t("common:user")}
                </Typography>
                <Container maxWidth="md">
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} container justify="center">
                          <Avatar
                            src={avatarUrl || ""}
                            className={layoutClasses.avatarProfile}
                          >
                            {(nickname || "").substr(0, 2)}
                          </Avatar>
                        </Grid>
                        <Grid item xs={12} container justify="center">
                          <input
                            accept="image/png,image/jpeg"
                            className={interactiveClasses.inputHidden}
                            id="upload-avatar-button"
                            type="file"
                            onChange={(e) => {
                              if (!e.target.files || !e.target.files.length)
                                return;
                              const file = e.target.files.item(0);
                              if (!file?.type.startsWith("image/")) return;

                              const form = new FormData();
                              form.append("files", file);
                              form.append("refId", user.user_metadatum.id);
                              form.append("ref", "user-metadata");
                              form.append("field", "avatar");

                              const oldUrl = avatarUrl;
                              setIsUploading(true);
                              setAvatarUrl("");
                              postUpload(token, form)
                                .then(() => {
                                  // update user data
                                  return getUserMe(token);
                                })
                                .then((data) => {
                                  jwtAuth.user = data;
                                  setAvatarUrl(data.user_metadatum.avatar.url);
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
                            <Button
                              variant="outlined"
                              component="span"
                              disabled={isUploading}
                              startIcon={<Upload />}
                            >
                              {t("user:profile.upload_avatar")}{" "}
                              {isUploading && <CircularProgress size={16} />}
                            </Button>
                          </label>
                        </Grid>
                        <Grid item xs={12} container justify="center">
                          <Button
                            onClick={() => {
                              jwtAuth.token = "";
                              jwtAuth.user = "";
                              history.push(`${path}/login`);
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
                            <Typography>{user.username}</Typography>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container justify="space-between">
                            <Typography className={layoutClasses.bold}>
                              {t("user:profile.nickname")}{" "}
                              <IconButton size="small">
                                <Create />
                              </IconButton>
                            </Typography>
                            <Typography>
                              {user.user_metadatum.nickname}
                            </Typography>
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
                            <Typography>{user.role.name}</Typography>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container justify="space-between">
                            <Typography className={layoutClasses.bold}>
                              {t("user:profile.email")}
                            </Typography>
                            <Typography>{user.email}</Typography>
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
                                color: user.confirmed
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                              }}
                            >
                              {t(
                                `user:profile.email_confirmed_status.${user.confirmed}`
                              )}
                              {!user.confirmed && (
                                <Button>
                                  {t("auth:send_email_confirmation")}
                                </Button>
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
                            justify="space-between"
                            alignItems="center"
                          >
                            <Grid item>
                              <Typography className={layoutClasses.bold}>
                                {t("user:profile.sekai_id")}
                              </Typography>
                            </Grid>
                            <Grid item>
                              {Number(user.user_metadatum.sekai_userid) ? (
                                <Typography>
                                  {user.user_metadatum.sekai_userid}
                                </Typography>
                              ) : (
                                <Button variant="contained" color="primary">
                                  {t("user:profile.button.bind_sekai_id")}
                                </Button>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* {JSON.stringify(user)} */}
                </Container>
                <Snackbar
                  open={isUploadAvatarError}
                  autoHideDuration={3000}
                  onClose={() => setIsUploadAvatarError(false)}
                >
                  <Alert
                    onClose={() => setIsUploadAvatarError(false)}
                    severity="error"
                  >
                    {t("user:profile.upload_avatar_error")}
                  </Alert>
                </Snackbar>
              </Fragment>
            )
          )}
        </Route>
        <Route path={`${path}/login`}>
          {!isExpired ? <Redirect to="/user"></Redirect> : <Login />}
        </Route>
        <Route path={`${path}/signup`}>
          {!isExpired ? <Redirect to="/user"></Redirect> : <Signup />}
        </Route>
      </Switch>
    </Fragment>
  );
};

export default User;
