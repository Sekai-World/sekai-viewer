import {
  Button,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Snackbar,
  Typography,
} from "@material-ui/core";
import { Email } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../utils/apiClient";

const ResetPassword: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { postForgotPassword } = useStrapi();

  const [isError, setIsError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [isSucceed, setIsSucceed] = useState(false);

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
              setIsSucceed(true);
            } catch (error) {
              setIsError(true);
              setErrMsg(t("auth:reset_password_wrong_email"));
            }
          }}
        >
          {({ submitForm, isSubmitting, errors, dirty, isValid }) => (
            <Grid container justify="center">
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
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || !dirty || !isValid}
                      onClick={submitForm}
                    >
                      {t("auth:common.sendResetPasswordEmailButton")}
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
      <Snackbar
        open={isSucceed}
        // autoHideDuration={3000}
        onClose={() => {
          setIsSucceed(false);
        }}
      >
        <Alert
          onClose={() => {
            setIsSucceed(false);
          }}
          severity="success"
        >
          {t("auth:reset_password_email_sent")}
        </Alert>
      </Snackbar>
    </Fragment>
  );
};

export default ResetPassword;
