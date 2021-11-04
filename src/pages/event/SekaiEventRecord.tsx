import {
  Grid,
  Typography,
  // Button,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Update } from "@mui/icons-material";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// import { Link } from "react-router-dom";
import { UserContext } from "../../context";
import { SekaiProfileEventRecordModel } from "../../strapi-model";
import { useAlertSnackbar } from "../../utils";
// import { useInteractiveStyles } from "../../styles/interactive";
// import { useLayoutStyles } from "../../styles/layout";
import { useCurrentEvent, useStrapi } from "../../utils/apiClient";
// import { ContentTrans } from "../../components/helpers/ContentTrans";

interface Props {
  eventId: number;
}

const SekaiEventRecord = (props: Props) => {
  // const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { currEvent, isLoading: isCurrEventLoading } = useCurrentEvent();
  const { showError } = useAlertSnackbar();

  const { jwtToken, sekaiProfile, updateSekaiProfile } =
    useContext(UserContext)!;
  const { getSekaiProfileEventRecordMe, postSekaiProfileEventRecord } =
    useStrapi(jwtToken);

  const [eventRecords, setEventRecords] = useState<
    SekaiProfileEventRecordModel[]
  >([]);
  const [isEventRecording, setIsEventRecording] = useState(false);

  useEffect(() => {
    (async () => {
      if (props.eventId) {
        try {
          setEventRecords(await getSekaiProfileEventRecordMe(props.eventId));
        } catch (error) {
          setEventRecords([]);
        }
      }
    })();
  }, [getSekaiProfileEventRecordMe, props.eventId]);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item container spacing={1} alignItems="center">
        <Grid item>
          <Typography>{t("user:profile.event.current_record_info")}</Typography>
        </Grid>
        {!isCurrEventLoading &&
          !!currEvent &&
          currEvent.eventId === props.eventId && (
            <Grid item>
              <Tooltip
                title={
                  t("user:profile.label.update_left", {
                    allowed: sekaiProfile!.eventGetAvailable,
                    used: sekaiProfile!.eventGetUsed,
                  }) as string
                }
                disableFocusListener
                arrow
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setIsEventRecording(true);
                      postSekaiProfileEventRecord(props.eventId)
                        .then(async (data) => {
                          setEventRecords(await getSekaiProfileEventRecordMe());
                          updateSekaiProfile({
                            eventGetUsed: sekaiProfile!.eventGetUsed + 1,
                          });
                          setIsEventRecording(false);
                        })
                        .catch((err) => {
                          showError(err.message);
                          setIsEventRecording(false);
                        });
                    }}
                    disabled={
                      isEventRecording ||
                      sekaiProfile!.eventGetAvailable <=
                        sekaiProfile!.eventGetUsed
                    }
                  >
                    {isEventRecording ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Update />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Grid>
          )}
        {eventRecords[0] && (
          <Fragment>
            <Grid item>
              <Typography>
                {t("user:profile.event.current_record_point")}{" "}
                {eventRecords[0].eventPoint}
              </Typography>
            </Grid>
            <Grid item>
              <Typography>
                {t("user:profile.event.current_record_rank")}{" "}
                {eventRecords[0].eventRank}
              </Typography>
            </Grid>
            <Grid item>
              <Typography>
                {t("user:profile.event.current_record_time")}{" "}
                {new Date(eventRecords[0].created_at).toLocaleString()}
              </Typography>
            </Grid>
          </Fragment>
        )}
      </Grid>
    </Grid>
  );
};

export default SekaiEventRecord;
