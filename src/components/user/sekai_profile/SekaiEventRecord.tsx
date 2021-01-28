import {
  Grid,
  Typography,
  Button,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import { OpenInNew, Update } from "@material-ui/icons";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { UserContext } from "../../../context";
import {
  SekaiCurrentEventModel,
  SekaiProfileEventRecordModel,
  SekaiProfileModel,
} from "../../../strapi-model";
import { useInteractiveStyles } from "../../../styles/interactive";
// import { useLayoutStyles } from "../../../styles/layout";
import { useStrapi } from "../../../utils/apiClient";
import { ContentTrans } from "../../subs/ContentTrans";

interface Props {
  profile: SekaiProfileModel;
}

const SekaiEventRecord = (props: Props) => {
  // const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  const { jwtToken, updateSekaiProfile } = useContext(UserContext)!;
  const {
    getSekaiCurrentEvent,
    getSekaiProfileEventRecordMe,
    postSekaiProfileEventRecord,
  } = useStrapi(jwtToken);

  const [currentEvent, setCurrentEvent] = useState<SekaiCurrentEventModel>();
  const [eventRecords, setEventRecords] = useState<
    SekaiProfileEventRecordModel[]
  >([]);
  const [isEventRecording, setIsEventRecording] = useState(false);

  useEffect(() => {
    (async () => {
      let currEvent;
      setCurrentEvent((currEvent = await getSekaiCurrentEvent()));
      setEventRecords(await getSekaiProfileEventRecordMe(currEvent.eventId));
    })();
  }, [getSekaiCurrentEvent, getSekaiProfileEventRecordMe]);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item container spacing={2} alignItems="center">
        <Grid item>
          <Typography>{t("user:profile.event.current_name")} </Typography>
        </Grid>
        <Grid item>
          <Button
            endIcon={<OpenInNew />}
            component={Link}
            to={`/event/${currentEvent?.eventId}`}
            className={interactiveClasses.noDecoration}
            target="_blank"
          >
            <ContentTrans
              contentKey={`event_name:${currentEvent?.eventId}`}
              original={currentEvent?.eventJson.name || ""}
            />
          </Button>
        </Grid>
      </Grid>
      <Grid item container spacing={1} alignItems="center">
        <Grid item>
          <Typography>{t("user:profile.event.current_record_info")}</Typography>
        </Grid>
        <Grid item>
          <Tooltip
            title={
              t("user:profile.label.update_left", {
                allowed: props.profile.eventGetAvailable,
                used: props.profile.eventGetUsed,
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
                  setIsEventRecording(true);
                  postSekaiProfileEventRecord(currentEvent!.eventId).then(
                    async (data) => {
                      setEventRecords(await getSekaiProfileEventRecordMe());
                      updateSekaiProfile({
                        eventGetUsed: props.profile.eventGetUsed + 1,
                      });
                      setIsEventRecording(false);
                    }
                  );
                }}
                disabled={
                  isEventRecording ||
                  props.profile.eventGetAvailable <= props.profile.eventGetUsed
                }
              >
                {isEventRecording ? <CircularProgress size={24} /> : <Update />}
              </IconButton>
            </span>
          </Tooltip>
        </Grid>
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
