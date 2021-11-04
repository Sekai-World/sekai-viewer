import {
  Typography,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
  Grid,
  // useTheme,
  CardMedia,
  Tooltip,
  Dialog,
  Paper,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Check, Clear, Create, Update } from "@mui/icons-material";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-mui";
import React, { Fragment, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Carousel from "react-material-ui-carousel";
// import { isMobile } from "react-device-detect";
import { useStrapi } from "../../../utils/apiClient";
import { UserContext } from "../../../context";
import DegreeImage from "../../../components/widgets/DegreeImage";
import { useAlertSnackbar, useToggle } from "../../../utils";
// import useJwtAuth from "../../../utils/jwt";

const useStyles = makeStyles((theme) => ({
  media: {
    [theme.breakpoints.down("md")]: {
      paddingTop: "75%",
    },
    [theme.breakpoints.up("md")]: {
      paddingTop: "56.25%",
    },
    backgroundSize: "contain",
    width: "100%",
  },
}));

const SekaiID: React.FC<{}> = () => {
  const { t } = useTranslation();
  // const { token } = useJwtAuth();
  // const theme = useTheme();
  const classes = useStyles();
  const { jwtToken, sekaiProfile, updateSekaiProfile } =
    useContext(UserContext)!;
  const {
    getSekaiProfileMe,
    postSekaiProfileVerify,
    postSekaiProfileConfirm,
    putSekaiProfileUpdate,
  } = useStrapi(jwtToken);
  const { showError } = useAlertSnackbar();

  // const [sekaiProfile, setSekaiProfile] = useState<SekaiProfileModel>();
  const [isEditingSekaiID, toggleIsEditingSekaiID] = useToggle(false);
  const [isVerifyCarouselOpen, toggleIsVerifyCarouselOpen] = useToggle(false);
  const [isVerifying, toggleIsVerifying] = useToggle(false);
  const [isUpdatingProfile, toggleIsUpdatingProfile] = useToggle(false);

  useEffect(() => {
    getSekaiProfileMe()
      .then((data) => {
        updateSekaiProfile(data);
      })
      .catch((err) => {
        if (err.id === "SekaiProfile.me.error.not-exist") {
          updateSekaiProfile();
        }
      });
  }, [getSekaiProfileMe, updateSekaiProfile]);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center">
          {sekaiProfile ? (
            <Fragment>
              {!sekaiProfile.sekaiUserProfile && (
                <Grid item>
                  <Chip
                    size="small"
                    color="secondary"
                    label={t("user:profile.label.sekai_id_not_verified")}
                  />
                </Grid>
              )}
              {!isEditingSekaiID && (
                <Fragment>
                  <Grid item>
                    <Chip
                      size="small"
                      label={t("user:profile.label.sekai_user_id")}
                    />
                  </Grid>
                  <Grid item>
                    <Grid container alignItems="center">
                      <Typography>{sekaiProfile.sekaiUserId}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => toggleIsEditingSekaiID()}
                        disabled={
                          sekaiProfile.updateAvailable <=
                          sekaiProfile.updateUsed
                        }
                      >
                        <Create />
                      </IconButton>
                    </Grid>
                  </Grid>
                  {sekaiProfile.sekaiUserProfile && (
                    <Grid item>
                      <Tooltip
                        title={
                          t("user:profile.label.update_left", {
                            allowed: sekaiProfile.updateAvailable,
                            used: sekaiProfile.updateUsed,
                          }) as string
                        }
                        disableFocusListener
                        arrow
                      >
                        <span>
                          <Button
                            size="small"
                            onClick={() => {
                              toggleIsUpdatingProfile();
                              putSekaiProfileUpdate(sekaiProfile.id)
                                .then(async (data) => {
                                  updateSekaiProfile(await getSekaiProfileMe());
                                  toggleIsUpdatingProfile();
                                })
                                .catch((err) => {
                                  showError(err.message);
                                  toggleIsUpdatingProfile();
                                });
                            }}
                            disabled={
                              isUpdatingProfile ||
                              sekaiProfile.updateAvailable <=
                                sekaiProfile.updateUsed
                            }
                            variant="contained"
                            color="primary"
                          >
                            {isUpdatingProfile ? (
                              <CircularProgress size={24} />
                            ) : (
                              <Update />
                            )}
                            {t("user:profile.button.update_sekai_profile")}
                          </Button>
                        </span>
                      </Tooltip>
                    </Grid>
                  )}
                </Fragment>
              )}
            </Fragment>
          ) : (
            !isEditingSekaiID && (
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => toggleIsEditingSekaiID()}
                >
                  {t("user:profile.button.bind_sekai_id")}
                </Button>
              </Grid>
            )
          )}
          {isEditingSekaiID && (
            <Grid item>
              <Formik
                initialValues={{ userid: sekaiProfile?.sekaiUserId || "" }}
                onSubmit={async (values, { setErrors }) => {
                  if (!/^\d{16,18}$/.test(values.userid)) {
                    showError(t("user:profile.error.sekai_id_malformed"));
                    return;
                  }
                  try {
                    await postSekaiProfileVerify(values.userid);
                    updateSekaiProfile(await getSekaiProfileMe());
                    toggleIsEditingSekaiID();
                    // jwtAuth.user = await getUserMe();
                  } catch (error) {
                    console.log(error);
                    showError(t("user:profile.error.sekai_id_already_bind"));
                  }
                }}
              >
                {({ submitForm, isSubmitting }) => (
                  <Fragment>
                    <Form>
                      <Field
                        component={TextField}
                        name="userid"
                        type="text"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={() => submitForm()}
                                disabled={isSubmitting}
                              >
                                <Check />{" "}
                                {isSubmitting && (
                                  <CircularProgress size="inherit" />
                                )}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => toggleIsEditingSekaiID()}
                              >
                                <Clear />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      ></Field>
                      <input type="submit" style={{ display: "none" }} />
                    </Form>
                  </Fragment>
                )}
              </Formik>
            </Grid>
          )}
        </Grid>
      </Grid>
      {sekaiProfile && !sekaiProfile.sekaiUserProfile && (
        <Grid container alignItems="center" spacing={1}>
          <Grid item>
            <Typography>
              {t("user:profile.label.sekai_id_verify_token")}:{" "}
              {sekaiProfile.sekaiUserToken}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => toggleIsVerifyCarouselOpen()}
                  disabled={isVerifying}
                >
                  {t("user:profile.button.verify_sekai_id")}
                </Button>
              </Grid>
              {isVerifying && (
                <Grid item>
                  <CircularProgress size={24} />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      )}
      {sekaiProfile && sekaiProfile.sekaiUserProfile && (
        <Grid item container alignItems="center" spacing={1}>
          <Grid item xs={12} sm={6} lg={4} xl={3}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <Chip
                  size="small"
                  label={t("user:profile.label.sekai_user_name")}
                />
              </Grid>
              <Grid item>
                <Typography>
                  {sekaiProfile.sekaiUserProfile.user.userGamedata.name}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6} lg={4} xl={3}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <Chip
                  size="small"
                  label={t("user:profile.label.sekai_user_rank")}
                />
              </Grid>
              <Grid item>
                <Typography>
                  {sekaiProfile.sekaiUserProfile.user.userGamedata.rank}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <Chip
                  size="small"
                  label={t("user:profile.label.sekai_user_word")}
                />
              </Grid>
              <Grid item>
                <Typography>
                  {sekaiProfile.sekaiUserProfile.userProfile.word}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={4}>
                <DegreeImage
                  honorId={sekaiProfile.sekaiUserProfile.userProfile.honorId1}
                  honorLevel={
                    sekaiProfile.sekaiUserProfile.userProfile.honorLevel1
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DegreeImage
                  honorId={sekaiProfile.sekaiUserProfile.userProfile.honorId2}
                  honorLevel={
                    sekaiProfile.sekaiUserProfile.userProfile.honorLevel2
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DegreeImage
                  honorId={sekaiProfile.sekaiUserProfile.userProfile.honorId3}
                  honorLevel={
                    sekaiProfile.sekaiUserProfile.userProfile.honorLevel3
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      <Dialog
        open={isVerifyCarouselOpen}
        onClose={() => toggleIsVerifyCarouselOpen()}
      >
        <Carousel swipe autoPlay={false}>
          <Paper
            elevation={10}
            sx={{
              backgroundColor: "primary",
            }}
          >
            <CardMedia
              image={`${
                window.isChinaMainland
                  ? import.meta.env.VITE_FRONTEND_ASSET_BASE
                  : `${
                      import.meta.env.VITE_ASSET_DOMAIN_MINIO
                    }/sekai-best-assets`
              }/verify/step_1.png`}
              title="sekai id verify step 1"
              className={classes.media}
            />
            <Typography>
              {t("user:profile.label.sekai_id_verify_step_1_title")}
            </Typography>
            <br />
            <Typography>
              {t("user:profile.label.sekai_id_verify_step_1_subtitle")}
            </Typography>
          </Paper>
          <Paper
            elevation={10}
            sx={{
              backgroundColor: "primary",
            }}
          >
            <CardMedia
              image={`${
                window.isChinaMainland
                  ? import.meta.env.VITE_FRONTEND_ASSET_BASE
                  : `${
                      import.meta.env.VITE_ASSET_DOMAIN_MINIO
                    }/sekai-best-assets`
              }/verify/step_2.png`}
              title="sekai id verify step 2"
              className={classes.media}
            />
            <Typography>
              {t("user:profile.label.sekai_id_verify_step_2_title")}
            </Typography>
            <br />
            <Typography>
              {t("user:profile.label.sekai_id_verify_step_2_subtitle", {
                verify_token: sekaiProfile?.sekaiUserToken,
              })}
            </Typography>
            <Button
              onClick={() => {
                toggleIsVerifying();
                postSekaiProfileConfirm(
                  sekaiProfile!.id,
                  sekaiProfile!.sekaiUserId!
                )
                  .then(async () => {
                    updateSekaiProfile(await getSekaiProfileMe());
                    toggleIsVerifying();
                  })
                  .catch(() => {
                    showError(t("user:profile.error.sekai_id_verify_failed"));
                    toggleIsVerifying();
                  });
                toggleIsVerifyCarouselOpen();
              }}
            >
              {t("user:profile.label.sekai_id_verify")}
            </Button>
          </Paper>
        </Carousel>
      </Dialog>
    </Grid>
  );
};

export default SekaiID;
