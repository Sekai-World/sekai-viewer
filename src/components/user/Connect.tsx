import { Typography } from "@material-ui/core";
import React, { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useLayoutStyles } from "../../styles/layout";
// import { useQuery } from "../../utils";
import { useStrapi } from "../../utils/apiClient";
import useJwtAuth from "../../utils/jwt";

const Connect: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { provider } = useParams<{ provider: string }>();
  // const query = useQuery();
  const location = useLocation();
  const history = useHistory();
  const jwtAuth = useJwtAuth();
  const { getConnectCallback, getUserMe, getUserMetadataMe } = useStrapi();

  useEffect(() => {
    document.title = t("title:connectRedirect");
  }, [t]);

  useEffect(() => {
    getConnectCallback(provider, location.search || "")
      .then(async (data) => {
        jwtAuth.token = data.jwt;
        jwtAuth.user = data.user.userMetadatum
          ? data.user
          : await getUserMe(data.jwt);
        jwtAuth.usermeta = await getUserMetadataMe(data.jwt);
        history.push("/user");
        // window.location.reload();
        localStorage.setItem("lastUserCheck", String(new Date().getTime()));
      })
      .catch((err) => {
        if (err.id === "Auth.form.error.email.taken") {
          history.replace(`/user/login?error=${t("auth:error.email_taken")}`);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("auth:connect.redirect")}
      </Typography>
    </Fragment>
  );
};

export default Connect;
