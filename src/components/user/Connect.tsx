import { Grid, LinearProgress, Typography } from "@material-ui/core";
import Axios from "axios";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { UserContext } from "../../context";
import { useLayoutStyles } from "../../styles/layout";
// import { useQuery } from "../../utils";
import { useStrapi } from "../../utils/apiClient";
// import useJwtAuth from "../../utils/jwt";

const Connect: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { provider } = useParams<{ provider: string }>();
  const { updateUser, updateJwtToken, updateUserMeta } = useContext(
    UserContext
  )!;
  // const query = useQuery();
  const location = useLocation();
  const history = useHistory();
  // const jwtAuth = useJwtAuth();
  const { getConnectCallback, getUserMetadataMe, postUpload } = useStrapi();

  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");

  useEffect(() => {
    document.title = t("title:connectRedirect");
  }, [t]);

  useEffect(() => {
    const register = async () => {
      try {
        setStep(t("auth:connect.fetch_user_data"));

        const data = await getConnectCallback(provider, location.search || "");
        updateJwtToken(data.jwt);
        const { avatarUrl } = data.user;
        delete data.user.avatarUrl;
        updateUser(data.user);
        const usermeta = await getUserMetadataMe(data.jwt);
        if (!usermeta.avatar && avatarUrl) {
          setProgress(50);
          setStep(t("auth:connect.fetch_user_avatar"));

          const avatarBuffer = (
            await Axios.get(avatarUrl, { responseType: "blob" })
          ).data;

          const form = new FormData();
          form.append(
            "files",
            avatarBuffer,
            avatarUrl.substring(avatarUrl!.lastIndexOf("/") + 1)
          );
          form.append("refId", String(usermeta.id));
          form.append("ref", "user-metadata");
          form.append("field", "avatar");

          await postUpload(form, data.jwt);
          setProgress(75);
          updateUserMeta(await getUserMetadataMe(data.jwt));
        } else {
          updateUserMeta(usermeta);
          setProgress(100);
        }

        history.push("/user");
        localStorage.setItem("lastUserCheck", String(new Date().getTime()));
      } catch (error) {
        if (error.id === "Auth.form.error.email.taken") {
          history.replace(`/user/login?error=${t("auth:error.email_taken")}`);
        }
      }
    };

    if (location.search) register();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("auth:connect.redirect")}
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography>{step}</Typography>
        </Grid>
        <Grid item xs={12}>
          <LinearProgress variant="determinate" value={progress} />
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default Connect;
