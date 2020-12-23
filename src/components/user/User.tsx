import React, { Fragment, lazy } from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import useJwtAuth from "../../utils/jwt";
import ResetPassword from "./ResetPasswordCallback";
import ResetPasswordCallback from "./ResetPassword";
import UserHome from "./UserHome";

const Login = lazy(() => import("./Login"));
const Signup = lazy(() => import("./Signup"));

const User: React.FC<{}> = () => {
  // const interactiveClasses = useInteractiveStyles();
  const { user, isExpired, token } = useJwtAuth();
  let { path } = useRouteMatch();

  return (
    <Fragment>
      <Switch>
        <Route exact path={path}>
          {isExpired || !token || !user ? (
            <Redirect to={`${path}/login`}></Redirect>
          ) : (
            user && <UserHome />
          )}
        </Route>
        <Route path={`${path}/login`}>
          {!isExpired && user && token ? (
            <Redirect to="/user"></Redirect>
          ) : (
            <Login />
          )}
        </Route>
        <Route path={`${path}/signup`}>
          {!isExpired && user && token ? (
            <Redirect to="/user"></Redirect>
          ) : (
            <Signup />
          )}
        </Route>
        <Route path={`${path}/forgot`}>
          <ResetPassword />
        </Route>
        <Route path={`${path}/forgot/callback`}>
          <ResetPasswordCallback />
        </Route>
      </Switch>
    </Fragment>
  );
};

export default User;
