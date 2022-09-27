import { Button, CircularProgress, Grid, InputAdornment } from "@mui/material";
import { Alert } from "@mui/material";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-mui";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAlertSnackbar, useQuery } from "../../utils";
import { useStrapi } from "../../utils/apiClient";
import PasswordStrengthBar from "react-password-strength-bar";
import { VpnKey } from "@mui/icons-material";
import { useHistory } from "react-router-dom";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";

const ResetPassword: React.FC<{}> = () => {
  const { t } = useTranslation();
  const { postResetPassword } = useStrapi();
  const query = useQuery();
  const history = useHistory();
  const { showError } = useAlertSnackbar();

  // const [isSucceed, setIsSucceed] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);

  useEffect(() => {
    document.title = t("title:reset_password");
  }, [t]);

  return (
    <Fragment>
      <TypographyHeader>{t("common:reset_password")}</TypographyHeader>
      <Alert
        severity="warning"
        sx={(theme) => ({ margin: theme.spacing(1, 0) })}
      >
        {t("auth:reset_password_no_provider")}
      </Alert>
      <ContainerContent maxWidth="md">
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
              showError(t("auth:reset_password_wrong_email"));
            }
          }}
        >
          {({ submitForm, isSubmitting, values, dirty, isValid }) => (
            <Grid container justifyContent="center">
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
                  <Grid item xs={12} container alignItems="center">
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting || !dirty || !isValid}
                        onClick={submitForm}
                      >
                        {t("auth:common.sendResetPasswordButton")}
                      </Button>
                    </Grid>
                    {isSubmitting && (
                      <Grid item>
                        <CircularProgress size={24} />
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Form>
            </Grid>
          )}
        </Formik>
      </ContainerContent>
    </Fragment>
  );
};

export default ResetPassword;
