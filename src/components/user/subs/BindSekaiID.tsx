import {
  Typography,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
  Grid,
  useTheme,
  Snackbar,
  CardMedia,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import { Check, Clear, Create, Update } from "@material-ui/icons";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// @ts-ignore
import { AutoRotatingCarousel, Slide } from "material-auto-rotating-carousel";
import { isMobile } from "react-device-detect";
// import { SekaiProfileModel } from "../../../strapi-model";
import { useStrapi } from "../../../utils/apiClient";
// import useJwtAuth from "../../../utils/jwt";
import { Alert } from "@material-ui/lab";
import { UserContext } from "../../../context";
// import useJwtAuth from "../../../utils/jwt";

const useStyles = makeStyles((theme) => ({
  media: {
    [theme.breakpoints.down("sm")]: {
      paddingTop: "75%",
    },
    [theme.breakpoints.up("md")]: {
      paddingTop: "56.25%",
    },
    backgroundSize: "contain",
    width: "100%",
  },
}));

const BindSekaiID: React.FC<{}> = () => {
  const { t } = useTranslation();
  // const { token } = useJwtAuth();
  const theme = useTheme();
  const classes = useStyles();
  const { jwtToken, sekaiProfile, updateSekaiProfile } = useContext(
    UserContext
  )!;
  const {
    getSekaiProfileMe,
    postSekaiProfileVerify,
    postSekaiProfileConfirm,
    putSekaiProfileUpdate,
  } = useStrapi(jwtToken);

  // const [sekaiProfile, setSekaiProfile] = useState<SekaiProfileModel>();
  const [isEditingSekaiID, setIsEditingSekaiID] = useState(false);
  const [isVerifyCarouselOpen, setIsVerifyCarouselOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [errMsg, setErrMsg] = useState("");

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
    <Fragment>
      <Grid container justify="flex-end" alignItems="center" spacing={1}>
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
              <Grid item>
                <Typography>
                  {sekaiProfile.sekaiUserId}
                  {/* <Tooltip
                    title={
                      t("user:profile.label.update_left", {
                        allowed: sekaiProfile.updateAvailable,
                        used: sekaiProfile.updateUsed,
                      }) as string
                    }
                    disableFocusListener
                    arrow
                    interactive
                  >
                    <span> */}
                  <IconButton
                    size="small"
                    onClick={() => setIsEditingSekaiID(true)}
                    disabled={
                      sekaiProfile.updateAvailable <= sekaiProfile.updateUsed
                    }
                  >
                    <Create />
                  </IconButton>
                  {/* </span>
                  </Tooltip> */}
                </Typography>
              </Grid>
            )}
          </Fragment>
        ) : (
          !isEditingSekaiID && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsEditingSekaiID(true)}
            >
              {t("user:profile.button.bind_sekai_id")}
            </Button>
          )
        )}
        {isEditingSekaiID && (
          <Formik
            initialValues={{ userid: sekaiProfile?.sekaiUserId || "" }}
            onSubmit={async (values, { setErrors }) => {
              try {
                await postSekaiProfileVerify(values.userid);
                updateSekaiProfile(await getSekaiProfileMe());
                setIsEditingSekaiID(false);
                // jwtAuth.user = await getUserMe();
              } catch (error) {
                console.log(error);
                setIsError(true);
                setErrMsg(t("user:profile.error.sekai_id_already_bind"));
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
                            onClick={() => setIsEditingSekaiID(false)}
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
        )}
      </Grid>
      {sekaiProfile && !sekaiProfile.sekaiUserProfile && (
        <Grid container justify="flex-end" alignItems="center" spacing={1}>
          <Grid item>
            <Typography>
              {t("user:profile.label.sekai_id_verify_token")}:{" "}
              {sekaiProfile.sekaiUserToken}
            </Typography>
          </Grid>
          <Grid item container alignItems="center" spacing={1}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsVerifyCarouselOpen(true)}
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
      )}
      {sekaiProfile && sekaiProfile.sekaiUserProfile && (
        <Grid container justify="flex-end" alignItems="center" spacing={1}>
          <Grid item container xs={10} md={11} justify="flex-end">
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              xl={3}
              container
              justify="flex-end"
            >
              <Typography>
                {t("user:profile.label.sekai_user_name")}:{" "}
                {sekaiProfile.sekaiUserProfile.user.userGamedata.name}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              xl={3}
              container
              justify="flex-end"
            >
              <Typography>
                {t("user:profile.label.sekai_user_rank")}:{" "}
                {sekaiProfile.sekaiUserProfile.user.userGamedata.rank}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={2} md={1}>
            <Tooltip
              title={
                t("user:profile.label.update_left", {
                  allowed: sekaiProfile.updateAvailable,
                  used: sekaiProfile.updateUsed,
                }) as string
              }
              disableFocusListener
              arrow
              interactive
            >
              <span>
                <IconButton
                  size="small"
                  onClick={() => {
                    setIsUpdatingProfile(true);
                    putSekaiProfileUpdate(sekaiProfile.id).then(
                      async (data) => {
                        updateSekaiProfile(await getSekaiProfileMe());
                        setIsUpdatingProfile(false);
                      }
                    );
                  }}
                  disabled={
                    isUpdatingProfile ||
                    sekaiProfile.updateAvailable <= sekaiProfile.updateUsed
                  }
                >
                  {isUpdatingProfile ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Update />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      )}
      <AutoRotatingCarousel
        label={t("user:profile.label.sekai_id_verify")}
        open={isVerifyCarouselOpen}
        onClose={() => setIsVerifyCarouselOpen(false)}
        onStart={() => {
          setIsVerifying(true);
          postSekaiProfileConfirm(sekaiProfile!.id, sekaiProfile!.sekaiUserId!)
            .then(async () => {
              updateSekaiProfile(await getSekaiProfileMe());
              setIsVerifying(false);
            })
            .catch(() => {
              setIsError(true);
              setErrMsg(t("user:profile.error.sekai_id_verify_failed"));
              setIsVerifying(false);
            });
          setIsVerifyCarouselOpen(false);
        }}
        mobile={isMobile}
        // interval={5000}
        autoplay={false}
      >
        <Slide
          media={
            <CardMedia
              image={`${process.env.REACT_APP_FRONTEND_ASSET_BASE}/verify/step_1.png`}
              title="sekai id verify step 1"
              className={classes.media}
            />
          }
          mediaBackgroundStyle={{ backgroundColor: theme.palette.primary.main }}
          style={{ backgroundColor: theme.palette.primary.main }}
          title={t("user:profile.label.sekai_id_verify_step_1_title")}
          subtitle={t("user:profile.label.sekai_id_verify_step_1_subtitle")}
        ></Slide>
        <Slide
          media={
            <CardMedia
              image={`${process.env.REACT_APP_FRONTEND_ASSET_BASE}/verify/step_2.png`}
              title="sekai id verify step 2"
              className={classes.media}
            />
          }
          mediaBackgroundStyle={{ backgroundColor: theme.palette.primary.main }}
          style={{ backgroundColor: theme.palette.primary.main }}
          title={t("user:profile.label.sekai_id_verify_step_2_title")}
          subtitle={t("user:profile.label.sekai_id_verify_step_2_subtitle", {
            verify_token: sekaiProfile?.sekaiUserToken,
          })}
        ></Slide>
      </AutoRotatingCarousel>
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

export default BindSekaiID;
