import {
  Button,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Snackbar,
  Typography,
} from "@material-ui/core";
// import { Email } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../../styles/layout";
import { useQuery } from "../../utils";
import { useStrapi } from "../../utils/apiClient";
import PasswordStrengthBar from "react-password-strength-bar";
import { VpnKey } from "@material-ui/icons";
import { useHistory } from "react-router-dom";

const ResetPassword: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { postResetPassword } = useStrapi();
  const query = useQuery();
  const history = useHistory();

  const [isError, setIsError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  // const [isSucceed, setIsSucceed] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:reset_password")}
      </Typography>
      <Alert severity="warning" className={layoutClasses.alert}>
        {t("auth:reset_password_no_provider")}
      </Alert>
      <Container maxWidth="md">
        <Formik
          initialValues={{
            code: query.get("code") || "",
            password: "",
            confirmPassword: "",
          }}
          validate={(values) => {
            const errors: Partial<{
              code: string;
              password: string;
              confirmPassword: string;
            }> = {};

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

            return errors;
          }}
          onSubmit={async (values, { setErrors }) => {
            try {
              await postResetPassword(
                values.code,
                values.password,
                values.confirmPassword
              );
              // setIsSucceed(true);
              history.replace("/user/login");
            } catch (error) {
              setIsError(true);
              setErrMsg(t("auth:reset_password_wrong_email"));
            }
          }}
        >
          {({ submitForm, isSubmitting, values, dirty, isValid }) => (
            <Grid container justify="center">
              <Form>
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
                <input type="submit" style={{ display: "none" }} />
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || !dirty || !isValid}
                      onClick={submitForm}
                    >
                      {t("auth:common.sendResetPasswordButton")}
                    </Button>
                    {isSubmitting && <CircularProgress size={20} />}
                  </Grid>
                </Grid>
              </Form>
            </Grid>
          )}
        </Formik>
      </Container>
      <Snackbar
        open={isError}
        autoHideDuration={3000}
        onClose={() => {
          setIsError(false);
        }}
      >
        <Alert
          onClose={() => {
            setIsError(false);
          }}
          severity="error"
        >
          {errMsg}
        </Alert>
      </Snackbar>
    </Fragment>
  );
};

export default ResetPassword;
