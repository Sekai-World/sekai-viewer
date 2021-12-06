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
  // Paper,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogProps,
  DialogTitle,
  TextField as MUITextField,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Check, Clear, Delete, Twitter, Update } from "@mui/icons-material";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-mui";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import Carousel from "react-material-ui-carousel";
import { useStrapi } from "../../../utils/apiClient";
import { UserContext } from "../../../context";
import DegreeImage from "../../../components/widgets/DegreeImage";
import { useAlertSnackbar, useToggle } from "../../../utils";
import { LoadingButton } from "@mui/lab";
import { ServerRegion } from "../../../types";
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

const VerifyDialog: React.FC<
  DialogProps & {
    onVerifyClick: React.MouseEventHandler<HTMLButtonElement>;
    token: string;
  }
> = ({ onVerifyClick, token, ...dialogProps }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Dialog {...dialogProps} fullWidth>
      <Carousel swipe autoPlay={false}>
        <DialogContent>
          <CardMedia
            image={`${
              window.isChinaMainland
                ? import.meta.env.VITE_FRONTEND_ASSET_BASE_CN
                : import.meta.env.VITE_FRONTEND_ASSET_BASE
            }/verify/step_1.png`}
            title="sekai id verify step 1"
            className={classes.media}
          />
          <DialogContentText>
            <Typography>
              {t("user:profile.label.sekai_id_verify_step_1_title")}
            </Typography>
            <br />
            <Typography>
              {t("user:profile.label.sekai_id_verify_step_1_subtitle")}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <CardMedia
            image={`${
              window.isChinaMainland
                ? import.meta.env.VITE_FRONTEND_ASSET_BASE_CN
                : import.meta.env.VITE_FRONTEND_ASSET_BASE
            }/verify/step_2.png`}
            title="sekai id verify step 2"
            className={classes.media}
          />
          <DialogContentText>
            <Typography>
              {t("user:profile.label.sekai_id_verify_step_2_title")}
            </Typography>
            <br />
            <Typography>
              {t("user:profile.label.sekai_id_verify_step_2_subtitle", {
                verify_token: token,
              })}
            </Typography>
          </DialogContentText>
        </DialogContent>
      </Carousel>
      <DialogActions>
        <Button variant="contained" onClick={onVerifyClick}>
          {t("user:profile.label.sekai_id_verify")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteConfirmDiaglog: React.FC<
  DialogProps & {
    onConfirm: React.MouseEventHandler<HTMLButtonElement>;
    onDismiss: React.MouseEventHandler<HTMLButtonElement>;
  }
> = ({ onConfirm, onDismiss, ...dialogProps }) => {
  const { t } = useTranslation();

  return (
    <Dialog {...dialogProps} fullWidth>
      <DialogTitle>
        {t("user:profile.sekai_id_delete_confirm.title")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("user:profile.sekai_id_delete_confirm.content1")}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={onConfirm}>
          {t("common:confirm")}
        </Button>
        <Button variant="contained" onClick={onDismiss}>
          {t("common:dismiss")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TransferConfirmDialog: React.FC<
  DialogProps & {
    onConfirm: (username: string) => void;
    onDismiss: React.MouseEventHandler<HTMLButtonElement>;
    sekaiID: string;
  }
> = ({ onConfirm, onDismiss, sekaiID, ...dialogProps }) => {
  const { t } = useTranslation();
  const { showError } = useAlertSnackbar();

  const [username, setUsername] = useState<string>("");
  const [isTransfering, toggleIsTransfering] = useToggle(false);

  const onUsernameInputChange: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = useCallback((evt) => {
    setUsername(evt.target.value);
  }, []);

  const onConfirmClick = useCallback(async () => {
    toggleIsTransfering();
    try {
      await onConfirm(username);
    } catch (error: any) {
      showError(error.message);
    }
    toggleIsTransfering();
    if (dialogProps.onClose) dialogProps.onClose({}, "backdropClick");
  }, [dialogProps, onConfirm, showError, toggleIsTransfering, username]);

  return (
    <Dialog {...dialogProps} fullWidth>
      <DialogTitle>{t("user:profile.sekai_id_transfer.title")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("user:profile.sekai_id_transfer.content1", {
            SekaiID,
          })}
        </DialogContentText>
      </DialogContent>
      <DialogContent>
        <MUITextField
          label={t("user:profile.username")}
          value={username}
          onChange={onUsernameInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button
          color="info"
          startIcon={<Twitter />}
          href={`https://twitter.com/messages/compose?${new URLSearchParams({
            recipient_id: "1333367240155164673",
            text: `I request to transfer my Sekai ID ${sekaiID} to new account SEKAI_VIEWER_USERNAME. (REMEMBER edit to provide other helpful info, e.g. lost access to old Sekai Viewer accound)`,
          }).toString()}`}
          target="_blank"
        >
          DM @SekaiViewer
        </Button>
        <Button color="secondary" onClick={onDismiss}>
          {t("common:dismiss")}
        </Button>
        <LoadingButton
          loading={isTransfering}
          variant="contained"
          onClick={onConfirmClick}
          disabled={!username}
        >
          {t("common:confirm")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

const SekaiID: React.FC<{}> = () => {
  const { t } = useTranslation();
  // const { token } = useJwtAuth();
  // const theme = useTheme();
  // const classes = useStyles();
  const { jwtToken, sekaiProfile, updateSekaiProfile } =
    useContext(UserContext)!;
  const {
    getSekaiProfileMe,
    postSekaiProfileVerify,
    postSekaiProfileConfirm,
    putSekaiProfileUpdate,
    deleteSekaiProfileById,
    postSekaiProfileTransfer,
  } = useStrapi(jwtToken);
  const { showError } = useAlertSnackbar();

  // const [sekaiProfile, setSekaiProfile] = useState<SekaiProfileModel>();
  const [isEditingSekaiID, toggleIsEditingSekaiID] = useToggle(false);
  const [isVerifyCarouselOpen, toggleIsVerifyCarouselOpen] = useToggle(false);
  const [isVerifying, toggleIsVerifying] = useToggle(false);
  const [isUpdatingProfile, toggleIsUpdatingProfile] = useToggle(false);
  const [isDeletingProfile, toggleIsDeletingProfile] = useToggle(false);
  const [isDeleteProfileConfirmOpen, toggleIsDeleteProfileConfirmOpen] =
    useToggle(false);
  const [isTransferDiaglogOpen, toggleIsTransferDiaglogOpen] = useToggle(false);

  const [sekaiID, setSekaiID] = useState("");
  const [serverRegion, setServerRegion] = useState<ServerRegion>("jp");

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

  const doVerify = useCallback(() => {
    toggleIsVerifying();
    postSekaiProfileConfirm(sekaiProfile!.id, sekaiProfile!.sekaiUserId!)
      .then(async () => {
        updateSekaiProfile(await getSekaiProfileMe());
        toggleIsVerifying();
      })
      .catch(() => {
        showError(t("user:profile.error.sekai_id_verify_failed"));
        toggleIsVerifying();
      });
    toggleIsVerifyCarouselOpen();
  }, [
    getSekaiProfileMe,
    postSekaiProfileConfirm,
    sekaiProfile,
    showError,
    t,
    toggleIsVerifyCarouselOpen,
    toggleIsVerifying,
    updateSekaiProfile,
  ]);

  const doDeleteProfile = useCallback(async () => {
    toggleIsDeleteProfileConfirmOpen();
    if (sekaiProfile) {
      toggleIsDeletingProfile();
      try {
        await deleteSekaiProfileById(sekaiProfile.id);
        updateSekaiProfile();
      } catch (err: any) {
        showError(err.message);
      }
      toggleIsDeletingProfile();
    }
  }, [
    deleteSekaiProfileById,
    sekaiProfile,
    showError,
    toggleIsDeleteProfileConfirmOpen,
    toggleIsDeletingProfile,
    updateSekaiProfile,
  ]);

  const doTransferProfile = useCallback(
    async (username: string) => {
      if (!username) {
        throw new Error("Username must be filled.");
      }
      await postSekaiProfileTransfer(String(sekaiID), username);
      updateSekaiProfile(await getSekaiProfileMe());
      toggleIsEditingSekaiID();
    },
    [
      getSekaiProfileMe,
      postSekaiProfileTransfer,
      sekaiID,
      toggleIsEditingSekaiID,
      updateSekaiProfile,
    ]
  );

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center">
          {sekaiProfile ? (
            <Fragment>
              {sekaiProfile.sekaiUserToken && (
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
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <Typography>{sekaiProfile.sekaiUserId}</Typography>
                      </Grid>
                      {/* <IconButton
                        size="small"
                        onClick={() => toggleIsEditingSekaiID()}
                        disabled={
                          sekaiProfile.updateAvailable <=
                          sekaiProfile.updateUsed
                        }
                      >
                        <Create />
                      </IconButton> */}
                      {
                        <Grid item>
                          <LoadingButton
                            variant="contained"
                            color="secondary"
                            startIcon={<Delete />}
                            loading={isDeletingProfile}
                            onClick={() => toggleIsDeleteProfileConfirmOpen()}
                            size="small"
                          >
                            {t("user:profile.label.unlink_sekai_id")}
                          </LoadingButton>
                        </Grid>
                      }
                    </Grid>
                  </Grid>
                  {!sekaiProfile.sekaiUserToken &&
                    !!sekaiProfile.sekaiUserProfile && (
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
                            <LoadingButton
                              size="small"
                              loading={isUpdatingProfile}
                              onClick={async () => {
                                toggleIsUpdatingProfile();
                                try {
                                  await putSekaiProfileUpdate(sekaiProfile.id);
                                  updateSekaiProfile(await getSekaiProfileMe());
                                  toggleIsUpdatingProfile();
                                } catch (err: any) {
                                  showError(err.message);
                                  toggleIsUpdatingProfile();
                                }
                              }}
                              disabled={
                                isUpdatingProfile ||
                                sekaiProfile.updateAvailable <=
                                  sekaiProfile.updateUsed
                              }
                              variant="contained"
                              color="primary"
                              startIcon={<Update />}
                            >
                              {t("user:profile.button.update_sekai_profile")}
                            </LoadingButton>
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
                  if (!/^\d{16,}$/.test(values.userid)) {
                    showError(t("user:profile.error.sekai_id_malformed"));
                    return;
                  }
                  try {
                    await postSekaiProfileVerify(values.userid);
                    updateSekaiProfile(await getSekaiProfileMe());
                    toggleIsEditingSekaiID();
                    // jwtAuth.user = await getUserMe();
                  } catch (error: any) {
                    // console.log(error);
                    if (error.id === "SekaiProfile.verify.error.duplicated") {
                      setSekaiID(values.userid);
                      toggleIsTransferDiaglogOpen();
                    }
                    // showError(t("user:profile.error.sekai_id_already_bind"));
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
      {sekaiProfile && !!sekaiProfile.sekaiUserToken && (
        <Grid item xs={12}>
          <br />
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <Typography>
                {t("user:profile.label.sekai_id_verify_token")}:{" "}
                {sekaiProfile.sekaiUserToken}
              </Typography>
            </Grid>
            <Grid item>
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    onClick={() => toggleIsVerifyCarouselOpen()}
                    loading={isVerifying}
                  >
                    {t("user:profile.button.verify_sekai_id")}
                  </LoadingButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
      {sekaiProfile &&
        !sekaiProfile.sekaiUserToken &&
        sekaiProfile.sekaiUserProfile && (
          <Grid item xs={12}>
            <Grid container alignItems="center" spacing={1}>
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
                      honorId={
                        sekaiProfile.sekaiUserProfile.userProfile.honorId1
                      }
                      honorLevel={
                        sekaiProfile.sekaiUserProfile.userProfile.honorLevel1
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DegreeImage
                      honorId={
                        sekaiProfile.sekaiUserProfile.userProfile.honorId2
                      }
                      honorLevel={
                        sekaiProfile.sekaiUserProfile.userProfile.honorLevel2
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DegreeImage
                      honorId={
                        sekaiProfile.sekaiUserProfile.userProfile.honorId3
                      }
                      honorLevel={
                        sekaiProfile.sekaiUserProfile.userProfile.honorLevel3
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      <VerifyDialog
        open={isVerifyCarouselOpen}
        onClose={() => toggleIsVerifyCarouselOpen()}
        onVerifyClick={doVerify}
        token={sekaiProfile?.sekaiUserToken || ""}
      />
      <DeleteConfirmDiaglog
        open={isDeleteProfileConfirmOpen}
        onClose={() => toggleIsDeleteProfileConfirmOpen()}
        onConfirm={doDeleteProfile}
        onDismiss={() => toggleIsDeleteProfileConfirmOpen()}
      />
      <TransferConfirmDialog
        disableEscapeKeyDown
        open={isTransferDiaglogOpen}
        onClose={() => toggleIsTransferDiaglogOpen()}
        onConfirm={doTransferProfile}
        onDismiss={() => toggleIsTransferDiaglogOpen()}
        sekaiID={sekaiID}
      />
    </Grid>
  );
};

export default SekaiID;
