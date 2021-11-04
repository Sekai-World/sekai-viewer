import {
  Button,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Typography,
} from "@mui/material";
import { Field, Formik } from "formik";
import { Select } from "formik-mui";
import React, { Fragment, useContext, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { SettingContext, UserContext } from "../../context";
// import { useInteractiveStyles } from "../../styles/interactive";
import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../utils/apiClient";
import TableAnnouncements from "./table/TableAnnouncements";
import TableMe from "./table/TableWork";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface preferLangValues {
  languages: number[];
}

interface preferLangErrors {
  languages: string;
}

const Translation: React.FC<{}> = () => {
  const { t } = useTranslation();
  const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const { usermeta, jwtToken, updateUserMeta } = useContext(UserContext)!;
  const { languages } = useContext(SettingContext)!;
  const { putUserMetadataMe, getUserMetadataMe } = useStrapi(jwtToken);

  const [selectedContent, setSelectedContent] = useState("");

  useLayoutEffect(() => {
    document.title = t("title:translation");
  }, [t]);

  return !!usermeta && !!jwtToken ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:translation")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid container>
          <Formik<preferLangValues>
            initialValues={{
              languages: usermeta.languages.map((lang) => lang.id),
            }}
            validate={(values) => {
              const errors: Partial<preferLangErrors> = {};

              if (!values.languages.length)
                errors.languages = t("auth:error.required");
              else if (
                !values.languages.some(
                  (langId) => !!languages.find((lang) => lang.id === langId)
                )
              )
                errors.languages = t("translate:error.lang_mismatch");

              return errors;
            }}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              await putUserMetadataMe({
                languages: values.languages.map(
                  (id) => languages.find((lang) => lang.id === id)!
                ),
              });
              updateUserMeta(await getUserMetadataMe());
              setSubmitting(false);
              resetForm({ values });
            }}
          >
            {({ submitForm, isSubmitting, dirty, isValid }) => (
              <Grid container spacing={1}>
                <Grid item xs={9}>
                  <FormControl style={{ minWidth: 200, maxWidth: "100%" }}>
                    <InputLabel htmlFor="prefer-lang-select">
                      {t("auth:signup.label.prefer_langs")}
                    </InputLabel>
                    <Field
                      component={Select}
                      inputProps={{
                        multiple: true,
                      }}
                      name="languages"
                    >
                      {languages.map((lang) => (
                        <MenuItem value={lang.id} key={`lang-${lang.code}`}>
                          {lang.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
                <br />
                <br />
                <input type="submit" style={{ display: "none" }} />
                <Grid item xs={3} container alignItems="center" spacing={1}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || !dirty || !isValid}
                      onClick={submitForm}
                    >
                      {t("common:modify")}
                    </Button>
                  </Grid>
                  {isSubmitting && (
                    <Grid item>
                      <CircularProgress size={24} />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}
          </Formik>
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("translate:title.my_works")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <TableMe languages={languages} />
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("translate:title.available_contents")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <TableAnnouncements
          languages={languages}
          onSelected={(params, { api }) => {
            setSelectedContent(
              `announcement:${api?.getCellValue(params[0], "id")}`
            );
          }}
        />
        <br />
        <Grid container>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedContent}
              component={Link}
              to={`/translation/${selectedContent}`}
            >
              {t("translate:button.start_translate")}
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Fragment>
  ) : null;
};

export default Translation;
