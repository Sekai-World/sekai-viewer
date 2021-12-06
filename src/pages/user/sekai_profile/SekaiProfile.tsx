import { Container, Grid, Typography } from "@mui/material";
import React, { Fragment, useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../context";
// import { useInteractiveStyles } from "../../../styles/interactive";
import { useLayoutStyles } from "../../../styles/layout";
import SekaiUserStatistics from "./SekaiUserStatistics";
import SekaiCardTeam from "./SekaiCardTeam";
const SekaiEventRecord = React.lazy(() => import("./SekaiEventRecord"));
const SekaiID = React.lazy(() => import("./SekaiID"));
const SekaiUserDeck = React.lazy(() => import("./SekaiUserDeck"));

const SekaiProfile = () => {
  const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  const { sekaiProfile } = useContext(UserContext)!;

  // const [isUserDeckOpen, setIsUserDeckOpen] = useState(false);
  // const [isUserEventOpen, setIsUserEventOpen] = useState(false);
  // const [isUserStatisticsOpen, setIsUserStatisticsOpen] = useState(false);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("user:profile.title.sekai_profile")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <SekaiID />
          </Grid>
          <Grid item xs={12}>
            {!!sekaiProfile &&
              !sekaiProfile.sekaiUserToken &&
              !!sekaiProfile.sekaiUserProfile && (
                <Grid container direction="row" spacing={1}>
                  <Grid item xs={12}>
                    <SekaiUserDeck
                      userDecks={sekaiProfile.sekaiUserProfile.userDecks}
                      userCards={sekaiProfile.sekaiUserProfile.userCards}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <SekaiUserStatistics />
                  </Grid>
                </Grid>
              )}
          </Grid>
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("user:profile.title.sekai_cards_teams")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <SekaiCardTeam />
      </Container>
      {!!sekaiProfile && !sekaiProfile.sekaiUserToken && (
        <Fragment>
          <Typography variant="h6" className={layoutClasses.header}>
            {t("user:profile.title.user_event")}
          </Typography>
          <Container className={layoutClasses.content} maxWidth="md">
            <SekaiEventRecord />
          </Container>
        </Fragment>
      )}
    </Fragment>
  );
};

export default SekaiProfile;
