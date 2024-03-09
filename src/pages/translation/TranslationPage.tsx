import {
  Button,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
} from "@mui/material";
import { Field, Formik } from "formik";
import { Select } from "formik-mui";
import React, { Fragment, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useStrapi } from "../../utils/apiClient";
import TableAnnouncements from "./table/TableAnnouncements";
import TableMe from "./table/TableWork";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import { IUserMetadata } from "../../stores/user";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface preferLangValues {
  languages: number[];
}

interface preferLangErrors {
  languages: string;
}

const Translation: React.FC<unknown> = observer(() => {
  const { t } = useTranslation();
  const {
    jwtToken,
    user: { metadata, setMetadata },
    settings: { languages },
  } = useRootStore();
  const { putUserMetadataMe, getUserMetadataMe } = useStrapi(jwtToken);

  const [selectedContent, setSelectedContent] = useState("");

  useLayoutEffect(() => {
    document.title = t("title:translation");
  }, [t]);

  return !!metadata && !!jwtToken ? (
    <Fragment>
      <TypographyHeader>{t("common:translation")}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <Grid container>
          <Formik<preferLangValues>
            initialValues={{
              languages: metadata.languages.map((lang) => lang.id),
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
              setMetadata((await getUserMetadataMe()) as IUserMetadata);
              setSubmitting(false);
              resetForm({ values });
            }}
          >
            {({ submitForm, isSubmitting, dirty, isValid }) => (
              <Grid container spacing={1}>
                <Grid item xs={9}>
                  <FormControl style={{ minWidth: 200, maxWidth: "100%" }}>
                    {/* <InputLabel htmlFor="prefer-lang-select">
                      {t("auth:signup.label.prefer_langs")}
                    </InputLabel> */}
                    <Field
                      component={Select}
                      inputProps={{
                        multiple: true,
                      }}
                      name="languages"
                      label={t("auth:signup.label.prefer_langs")}
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
      </ContainerContent>
      <TypographyHeader>{t("translate:title.my_works")}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <TableMe languages={languages} />
      </ContainerContent>
      <TypographyHeader>
        {t("translate:title.available_contents")}
      </TypographyHeader>
      <ContainerContent maxWidth="md">
        <TableAnnouncements
          languages={languages}
          onSelected={(params) => {
            setSelectedContent(`announcement:${params[0]}`);
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
      </ContainerContent>
    </Fragment>
  ) : null;
});

export default Translation;
