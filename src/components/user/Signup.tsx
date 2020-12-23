import {
  Button,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Typography,
} from "@material-ui/core";
import { AccountCircle, Email, VpnKey } from "@material-ui/icons";
import { Field } from "formik";
import { Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, Link as RouteLink } from "react-router-dom";
import PasswordStrengthBar from "react-password-strength-bar";
import { useInteractiveStyles } from "../../styles/interactive";
import { useLayoutStyles } from "../../styles/layout";
import { RegisterValues } from "../../types";
import { useStrapi } from "../../utils/apiClient";
import useJwtAuth from "../../utils/jwt";

const Signup: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const jwtAuth = useJwtAuth();
  const history = useHistory();
  const { postRegisterLocal } = useStrapi();

  const [passwordScore, setPasswordScore] = useState(0);

  useEffect(() => {
    document.title = t("title:signup");
  }, [t]);

  const handleValidate = useCallback(
    (values) => {
      const errors: Partial<RegisterValues> = {};
      if (!values.username) {
        errors.username = t("auth:error.required");
      }
      if (!values.password) {
        errors.password = t("auth:error.required");
      } else if (values.password.length < 6) {
        errors.password = t("auth:error.passwordTooShort");
      } else if (passwordScore < 3) {
        errors.password = t("auth:error.passwordStrength");
      }
      if (!values.confirmPassword) {
        errors.confirmPassword = t("auth:error.required");
      } else if (values.confirmPassword !== values.password) {
        errors.confirmPassword = t("auth:error.confirmPasswordMismatch");
      }
      if (!values.email) {
        errors.email = t("auth:error.required");
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
      ) {
        errors.email = t("auth:error.emailInvalid");
      }
      return errors;
    },
    [passwordScore, t]
  );

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:signup")}
      </Typography>
      <Container maxWidth="md">
        <Formik
          initialValues={{
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validate={handleValidate}
          onSubmit={async (values, { setErrors }) => {
            try {
              const data = await postRegisterLocal(values);
              jwtAuth.token = data.jwt;
              jwtAuth.user = data.user;
              history.push("/user/confirmation");
              // window.location.reload();
              localStorage.setItem(
                "lastUserCheck",
                String(new Date().getTime())
              );
            } catch (error) {
              console.log(error.response.data);
              // if (
              //   error.response.data.data[0].messages[0].id ===
              //   "Auth.form.error.invalid"
              // )
              //   setErrors({
              //     username: t("auth:login.error.invalid"),
              //     email: t("auth:login.error.invalid"),
              //     password: t("auth:login.error.invalid"),
              //   });
            }
          }}
        >
          {({ submitForm, isSubmitting, errors, dirty, isValid, values }) => (
            <Grid container justify="center">
              <Grid item>
                <Form>
                  <Field
                    component={TextField}
                    name="username"
                    type="text"
                    label={t("auth:signup.label.username")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                  ></Field>
                  <br />
                  <br />
                  <Field
                    component={TextField}
                    name="email"
                    type="email"
                    label={t("auth:signup.label.email")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  ></Field>
                  <br />
                  <br />
                  <Field
                    component={TextField}
                    name="password"
                    type="password"
                    label={t("auth:signup.label.password")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKey />
                        </InputAdornment>
                      ),
                    }}
                  ></Field>
                  <br />
                  <PasswordStrengthBar
                    password={values.password}
                    minLength={6}
                    onChangeScore={(score) => setPasswordScore(score)}
                    scoreWords={[
                      t("auth:password.too_weak"),
                      t("auth:password.weak"),
                      t("auth:password.okay"),
                      t("auth:password.good"),
                      t("auth:password.strong"),
                    ]}
                    shortScoreWord={t("auth:password.too_short")}
                  />
                  <br />
                  <Field
                    component={TextField}
                    name="confirmPassword"
                    type="password"
                    label={t("auth:signup.label.confirm_password")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKey />
                        </InputAdornment>
                      ),
                    }}
                  ></Field>
                  <br />
                  <br />
                  <RouteLink
                    to="/user/login"
                    className={interactiveClasses.noDecoration}
                  >
                    <Typography variant="caption" color="textPrimary">
                      {t("auth:already-have-account")}
                    </Typography>
                  </RouteLink>
                  <br />
                  <br />
                  <input type="submit" style={{ display: "none" }} />
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || !dirty || !isValid}
                    onClick={submitForm}
                  >
                    {t("auth:common.signupButton")}{" "}
                    {isSubmitting && <CircularProgress />}
                  </Button>
                </Form>
              </Grid>
            </Grid>
          )}
        </Formik>
      </Container>
    </Fragment>
  );
};

export default Signup;
