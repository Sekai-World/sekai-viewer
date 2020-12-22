import {
  Avatar,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from "@material-ui/core";
import { Create } from "@material-ui/icons";
import React, { Fragment, lazy, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from "react-router-dom";
import { useLayoutStyles } from "../../styles/layout";
import useJwtAuth from "../../utils/jwt";

const Login = lazy(() => import("./Login"));
const Signup = lazy(() => import("./Signup"));

const User: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const theme = useTheme();
  // const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const jwtAuth = useJwtAuth();
  const { user, isExpired } = useJwtAuth();
  const history = useHistory();
  let { path } = useRouteMatch();

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
                            src={user.user_metadatum.avatar.url || ""}
                            className={layoutClasses.avatarProfile}
                          />
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
