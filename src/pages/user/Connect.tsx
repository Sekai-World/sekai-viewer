import { Grid, LinearProgress, Typography } from "@mui/material";
import Axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useRootStore } from "../../stores/root";
import { useStrapi } from "../../utils/apiClient";
import { observer } from "mobx-react-lite";
import { apiUserInfoToStoreUserInfo } from "../../utils";
import { IUserMetadata } from "../../stores/user";
import TypographyHeader from "../../components/styled/TypographyHeader";

const Connect: React.FC<{}> = observer(() => {
  const { t } = useTranslation();
  const { provider } = useParams<{ provider: string }>();
  const {
    user: { setUserInfo, setToken, setMetadata },
  } = useRootStore();
  const location = useLocation();
  const history = useHistory();
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
        setToken(data.jwt);
        const { avatarUrl } = data.user;
        delete data.user.avatarUrl;
        setUserInfo(apiUserInfoToStoreUserInfo(data.user));
        const usermeta = await getUserMetadataMe(data.jwt);
        if (!usermeta.avatar && avatarUrl) {
          setProgress(25);
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
          setMetadata((await getUserMetadataMe(data.jwt)) as IUserMetadata);
        } else {
          setMetadata((await getUserMetadataMe(data.jwt)) as IUserMetadata);
          setProgress(75);
        }

        // updateSekaiProfile(await getSekaiProfileMe(data.jwt));
        // setProgress(75);
        // updateSekaiCardTeam(await getSekaiCardTeamMe(data.jwt));
        setProgress(100);

        history.push("/user");
        localStorage.setItem("lastUserCheck", String(new Date().getTime()));
      } catch (error: any) {
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
      <TypographyHeader>{t("auth:connect.redirect")}</TypographyHeader>
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
});

export default Connect;
