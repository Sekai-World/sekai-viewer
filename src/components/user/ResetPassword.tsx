import {
  Button,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Typography,
} from "@mui/material";
import { Email } from "@mui/icons-material";
import { Alert } from "@mui/material";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-mui";
import React, { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../../styles/layout";
import { useAlertSnackbar } from "../../utils";
import { useStrapi } from "../../utils/apiClient";

const ResetPassword: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { postForgotPassword } = useStrapi();
  const { showError, showSuccess } = useAlertSnackbar();

  useEffect(() => {
    document.title = t("title:reset_password");
  }, [t]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:reset_password")}
      </Typography>
      <Alert severity="warning" className={layoutClasses.alert}>
        {t("auth:reset_password_no_provider")}
      </Alert>
      <Container className={layoutClasses.content} maxWidth="md">
        <Formik
          initialValues={{
            email: "",
          }}
          validate={(values) => {
            const errors: Partial<{ email: string }> = {};
            if (!values.email) {
              errors.email = t("auth:error.required");
            } else if (
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
            ) {
              errors.email = t("auth:error.emailInvalid");
            }
            return errors;
          }}
          onSubmit={async (values, { setErrors }) => {
            try {
              await postForgotPassword(values.email);
              showSuccess(t("auth:reset_password_email_sent"));
            } catch (error) {
              showError(t("auth:reset_password_wrong_email"));
            }
          }}
        >
          {({ submitForm, isSubmitting, errors, dirty, isValid }) => (
            <Grid container justifyContent="center">
              <Form>
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
                <input type="submit" style={{ display: "none" }} />
                <Grid container spacing={1}>
                  <Grid item xs={12} container alignItems="center" spacing={1}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting || !dirty || !isValid}
                        onClick={submitForm}
                      >
                        {t("auth:common.sendResetPasswordEmailButton")}
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
      </Container>
    </Fragment>
  );
};

export default ResetPassword;
