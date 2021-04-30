import {
  Grid,
  Typography,
  Button,
  Tooltip,
  IconButton,
  CircularProgress,
  TextField,
} from "@material-ui/core";
import { Update } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingContext, UserContext } from "../../../context";
import { SekaiProfileEventRecordModel } from "../../../strapi-model";
// import { useInteractiveStyles } from "../../../styles/interactive";
import { IEventInfo } from "../../../types";
import { useCachedData } from "../../../utils";
// import { useLayoutStyles } from "../../../styles/layout";
import { useCurrentEvent, useStrapi } from "../../../utils/apiClient";
import { useAssetI18n } from "../../../utils/i18n";
// import { ContentTrans } from "../../subs/ContentTrans";

interface Props {}

const SekaiEventRecord = (props: Props) => {
  // const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { jwtToken, sekaiProfile, updateSekaiProfile } = useContext(
    UserContext
  )!;
  const {
    getSekaiProfileEventRecordMe,
    postSekaiProfileEventRecord,
  } = useStrapi(jwtToken);
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;

  const { currEvent, isLoading: isCurrEventLoading } = useCurrentEvent();

  const [events] = useCachedData<IEventInfo>("events");
  const [selectedEvent, setSelectedEvent] = useState<{
    name: string;
    id: number;
  } | null>(null);
  // const [currentEvent, setCurrentEvent] = useState<SekaiCurrentEventModel>();
  const [eventRecords, setEventRecords] = useState<
    SekaiProfileEventRecordModel[]
  >([]);
  const [isEventRecording, setIsEventRecording] = useState(false);

  useEffect(() => {
    (async () => {
      // console.log(currEvent);
      if (currEvent && events) {
        const ev = events.find((elem) => elem.id === Number(currEvent.eventId));
        if (ev) {
          setSelectedEvent({
            name: getTranslated(
              contentTransMode,
              `event_name:${currEvent.eventId}`,
              ev.name
            ),
            id: ev.id,
          });
        }
        setEventRecords(await getSekaiProfileEventRecordMe(currEvent.eventId));
      }
    })();
  }, [
    contentTransMode,
    currEvent,
    events,
    getSekaiProfileEventRecordMe,
    getTranslated,
  ]);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item container spacing={1} alignItems="center">
        <Grid item>
          <Autocomplete
            options={(events || [])
              .slice()
              .reverse()
              .map((ev) => ({
                name: getTranslated(
                  contentTransMode,
                  `event_name:${ev.id}`,
                  ev.name
                ),
                id: ev.id,
              }))}
            getOptionLabel={(option) => option.name}
            getOptionSelected={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("event:tracker.select.event_name")}
              />
            )}
            value={selectedEvent}
            autoComplete
            onChange={async (_, value) => {
              setSelectedEvent(value);
              setEventRecords([]);
              if (value)
                setEventRecords(await getSekaiProfileEventRecordMe(value.id));
            }}
            disabled={isCurrEventLoading || isEventRecording}
            style={{
              minWidth: "250px",
            }}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={async () => {
              setSelectedEvent({
                name: getTranslated(
                  contentTransMode,
                  `event_name:${currEvent.eventId}`,
                  currEvent.eventJson.name
                ),
                id: currEvent.eventId,
              });
              setEventRecords([]);
              setEventRecords(
                await getSekaiProfileEventRecordMe(currEvent.eventId)
              );
            }}
            disabled={isCurrEventLoading || isEventRecording}
          >
            {t("event:tracker.button.curr_event")}
          </Button>
        </Grid>
      </Grid>
      <Grid item container spacing={1} alignItems="center">
        <Grid item>
          <Typography>{t("user:profile.event.current_record_info")}</Typography>
        </Grid>
        {selectedEvent && selectedEvent.id === currEvent.eventId && (
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
              interactive
            >
              <span>
                <IconButton
                  size="small"
                  onClick={() => {
                    setIsEventRecording(true);
                    postSekaiProfileEventRecord(currEvent!.eventId).then(
                      async (data) => {
                        setEventRecords(await getSekaiProfileEventRecordMe());
                        updateSekaiProfile({
                          eventGetUsed: sekaiProfile!.eventGetUsed + 1,
                        });
                        setIsEventRecording(false);
                      }
                    );
                  }}
                  disabled={
                    isCurrEventLoading ||
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
