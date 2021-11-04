import React, { Fragment, lazy } from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import useJwtAuth from "../../utils/jwt";
// import { UserProvider } from "../../context";

const Login = lazy(() => import("./Login"));
const Signup = lazy(() => import("./Signup"));
const ResetPassword = lazy(() => import("./ResetPassword"));
const ResetPasswordCallback = lazy(() => import("./ResetPasswordCallback"));
const UserHome = lazy(() => import("./home/UserHome"));
const Confirmation = lazy(() => import("./EmailConfirm"));

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
        <Route exact path={`${path}/forgot`}>
          <ResetPassword />
        </Route>
        <Route path={`${path}/forgot/callback`}>
          <ResetPasswordCallback />
        </Route>
        <Route path={`${path}/confirmation`}>
          <Confirmation />
        </Route>
      </Switch>
    </Fragment>
  );
};

export default User;
