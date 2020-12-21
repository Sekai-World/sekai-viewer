import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@material-ui/core";
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
            <Fragment>
              <Typography variant="h6" className={layoutClasses.header}>
                {t("common:user")}
              </Typography>
              <Container maxWidth="md">
                <Grid container>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Grid container>
                          <Grid item>
                            <Typography>Username: {user.username}</Typography>
                            <Typography>Email: {user.email}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                      {JSON.stringify(user)}
                      <CardActions>
                        <Button
                          onClick={() => {
                            jwtAuth.token = "";
                            jwtAuth.user = "";
                            history.push(`${path}/login`);
                          }}
                          color="secondary"
                        >
                          {t("auth.logout")}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                </Grid>
              </Container>
            </Fragment>
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
