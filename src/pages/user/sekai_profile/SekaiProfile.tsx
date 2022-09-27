import { Grid } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SekaiUserStatistics from "./SekaiUserStatistics";
import SekaiCardTeam from "./SekaiCardTeam";
import { useRootStore } from "../../../stores/root";
import { observer } from "mobx-react-lite";
import { ISekaiProfile } from "../../../stores/sekai";
import { autorun } from "mobx";
import TypographyHeader from "../../../components/styled/TypographyHeader";
import ContainerContent from "../../../components/styled/ContainerContent";

const SekaiEventRecord = React.lazy(() => import("./SekaiEventRecord"));
const SekaiID = React.lazy(() => import("./SekaiID"));
const SekaiUserDeck = React.lazy(() => import("./SekaiUserDeck"));

const SekaiProfile = observer(() => {
  const { t } = useTranslation();
  const {
    sekai: { sekaiProfileMap },
    region,
  } = useRootStore();

  const [sekaiProfile, setLocalSekaiProfile] = useState<ISekaiProfile>();

  useEffect(() => {
    autorun(() => {
      setLocalSekaiProfile(sekaiProfileMap.get(region));
    });
  }, []);

  return (
    <Fragment>
      <TypographyHeader>
        {t("user:profile.title.sekai_profile")}
      </TypographyHeader>
      <ContainerContent maxWidth="md">
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
      </ContainerContent>
      <TypographyHeader>
        {t("user:profile.title.sekai_cards_teams")}
      </TypographyHeader>
      <ContainerContent maxWidth="md">
        <SekaiCardTeam />
      </ContainerContent>
      {!!sekaiProfile && !sekaiProfile.sekaiUserToken && (
        <Fragment>
          <TypographyHeader>
            {t("user:profile.title.user_event")}
          </TypographyHeader>
          <ContainerContent maxWidth="md">
            <SekaiEventRecord />
          </ContainerContent>
        </Fragment>
      )}
    </Fragment>
  );
});

export default SekaiProfile;
