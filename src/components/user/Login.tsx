import {
  Button,
  Container,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  Link,
  Typography,
} from "@material-ui/core";
import { AccountCircle, VpnKey } from "@material-ui/icons";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import { Discord } from "mdi-material-ui";
import React, { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
// import { useInteractiveStyles } from "../../styles/interactive";
import { useLayoutStyles } from "../../styles/layout";
import { LoginValues } from "../../types";
import { useStrapi } from "../../utils/apiClient";
import useJwtAuth from "../../utils/jwt";

const Login: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const jwtAuth = useJwtAuth();
  const { decodedToken } = useJwtAuth();
  const { postLoginLocal, getRedirectConnectLoginUrl } = useStrapi();

  useEffect(() => {
    document.title = t("title:login");
  }, [t]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:login")}
      </Typography>
      <Container maxWidth="md">
        <Formik
          initialValues={{
            identifier: decodedToken ? decodedToken.identifier : "",
            password: "",
          }}
          validate={(values) => {
            const errors: Partial<LoginValues> = {};
            if (!values.identifier) {
              errors.identifier = t("auth:error.required");
            }
            if (!values.password) {
              errors.password = t("auth:error.required");
            }
            return errors;
          }}
          onSubmit={async (values, { setErrors }) => {
            try {
              const data = await postLoginLocal(values);
              jwtAuth.token = data.jwt;
              jwtAuth.user = data.user;
              history.push("/user");
              // window.location.reload();
              localStorage.setItem(
                "lastUserCheck",
                String(new Date().getTime())
              );
            } catch (error) {
              // console.log(error.response.data);
              if (
                error.response.data.data[0].messages[0].id ===
                "Auth.form.error.invalid"
              )
                setErrors({
                  identifier: t("auth:login.error.invalid"),
                  password: t("auth:login.error.invalid"),
                });
            }
          }}
        >
          {({ submitForm, isSubmitting, errors, dirty, isValid }) => (
            <Grid container justify="center">
              <Form>
                <Field
                  component={TextField}
                  name="identifier"
                  type="text"
                  label={t("auth:login.label.identifier")}
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
                  name="password"
                  type="password"
                  label={t("auth:login.label.password")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKey />
                      </InputAdornment>
                    ),
                  }}
                ></Field>
                {isSubmitting && (
                  <Fragment>
                    <br />
                    <br />
                    <LinearProgress />
                  </Fragment>
                )}
                <br />
                <br />
                <input type="submit" style={{ display: "none" }} />
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || !dirty || !isValid}
                  onClick={submitForm}
                >
                  {t("auth:common.submit")}
                </Button>
              </Form>
              <Divider
                orientation="vertical"
                flexItem
                style={{ margin: "0 1rem" }}
              />
              <Grid item>
                <Grid container justify="center" spacing={1}>
                  <Grid item xs={12}>
                    <Typography>{t("auth:login.connect.desc")}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      component={Link}
                      href={getRedirectConnectLoginUrl("discord")}
                      // variant="contained"
                      startIcon={<Discord />}
                    >
                      {t("auth:login.connect.discord")}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Formik>
      </Container>
    </Fragment>
  );
};

export default Login;
