import React, { useCallback, useMemo, useState } from "react";
import { EventType } from "../../types";
import {
  Button,
  Chip,
  Collapse,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";
import { Check, ClearAll, RotateLeft } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

type EventFilterStartAtType = "before" | "after" | undefined;

type EventFilterEventUnitType = "event" | "eventStory";

type EventFilterInclExclType = "incl" | "excl" | "both";

export interface EventFilterData {
  searchTitle: string;
  eventType: EventType[];
  startAtType: EventFilterStartAtType | undefined;
  startAt: number | undefined;
  // There are units in the event.json, as well as in the eventStory.json
  // eventUnitType is used to distinguish between the two
  eventUnitType: EventFilterEventUnitType | undefined;
  eventUnit: string[];
  isKeyEventStory: EventFilterInclExclType;
  hasEventMusic: EventFilterInclExclType;
  eventBonusAttr: string[];
  eventBonusUnitId: number[];
}

const eventTypes = Object.freeze([
  {
    value: "marathon",
    label: "event:type.marathon",
  },
  {
    value: "cheerful_carnival",
    label: "event:type.cheerful_carnival",
  },
  // Not Implemented Yet
  // {
  //   value: "challenge_live",
  //   label: "Challenge Live",
  // },
  {
    value: "world_bloom",
    label: "event:type.world_bloom",
  },
]);

const EventListFilter: React.FC<{
  filterOpened: boolean;
  toggleFilterOpened: () => void;
  filterData: EventFilterData;
  onFilterDataChange: (data: EventFilterData) => void;
}> = ({ filterOpened, toggleFilterOpened, filterData, onFilterDataChange }) => {
  const { t } = useTranslation();

  const [searchTitle, setSearchTitle] = useState<string>(
    filterData.searchTitle
  );
  const [eventType, setEventType] = useState<EventType[]>(
    filterData.eventType || []
  );
  const [startAtType, setStartAtType] = useState<
    EventFilterStartAtType | undefined
  >(filterData.startAtType || undefined);
  const [startAt, setStartAt] = useState<number | undefined>(
    filterData.startAt || undefined
  );
  const [eventUnitType, setEventUnitType] = useState<
    EventFilterEventUnitType | undefined
  >(filterData.eventUnitType || undefined);
  const [eventUnit, setEventUnit] = useState<string[]>(
    filterData.eventUnit || []
  );
  const [isKeyEventStory, setIsKeyEventStory] =
    useState<EventFilterInclExclType>(filterData.isKeyEventStory || "both");
  const [hasEventMusic, setHasEventMusic] = useState<EventFilterInclExclType>(
    filterData.hasEventMusic || "both"
  );
  const [eventBonusAttr, setEventBonusAttr] = useState<string[]>(
    filterData.eventBonusAttr || []
  );
  const [eventBonusUnitId, setEventBonusUnitId] = useState<number[]>(
    filterData.eventBonusUnitId || []
  );

  const isFilterDataChanged = useMemo(() => {
    return searchTitle !== filterData.searchTitle;
  }, [searchTitle, filterData.searchTitle]);
  const isFilterNotEmpty = useMemo(
    () =>
      Object.values(filterData).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string")
          return value.trim() !== "" && value !== "both";
        return value !== null && value !== undefined;
      }),
    [filterData]
  );

  const applyFilter = useCallback(() => {
    onFilterDataChange({
      ...filterData,
      searchTitle: searchTitle,
      eventType: eventType,
      startAtType: startAtType,
      startAt: startAt,
      eventUnitType: eventUnitType,
      eventUnit: eventUnit,
      isKeyEventStory: isKeyEventStory,
      hasEventMusic: hasEventMusic,
      eventBonusAttr: eventBonusAttr,
      eventBonusUnitId: eventBonusUnitId,
    });
    toggleFilterOpened();
  }, [
    eventBonusAttr,
    eventBonusUnitId,
    eventType,
    eventUnit,
    eventUnitType,
    filterData,
    hasEventMusic,
    isKeyEventStory,
    onFilterDataChange,
    searchTitle,
    startAt,
    startAtType,
    toggleFilterOpened,
  ]);

  const resetToPropFilterData = useCallback(() => {
    setSearchTitle(filterData.searchTitle);
    setEventType(filterData.eventType);
    setStartAtType(filterData.startAtType);
    setStartAt(filterData.startAt);
    setEventUnitType(filterData.eventUnitType);
    setEventUnit(filterData.eventUnit);
    setIsKeyEventStory(filterData.isKeyEventStory);
    setHasEventMusic(filterData.hasEventMusic);
    setEventBonusAttr(filterData.eventBonusAttr);
    setEventBonusUnitId(filterData.eventBonusUnitId);
  }, [
    filterData.eventBonusAttr,
    filterData.eventBonusUnitId,
    filterData.eventType,
    filterData.eventUnit,
    filterData.eventUnitType,
    filterData.hasEventMusic,
    filterData.isKeyEventStory,
    filterData.searchTitle,
    filterData.startAt,
    filterData.startAtType,
  ]);

  const clearFilterData = useCallback(() => {
    setSearchTitle("");
    setEventType([]);
    setStartAtType(undefined);
    setStartAt(undefined);
    setEventUnitType(undefined);
    setEventUnit([]);
    setIsKeyEventStory("both");
    setHasEventMusic("both");
    setEventBonusAttr([]);
    setEventBonusUnitId([]);
  }, []);

  const handleEventTypeClick = useCallback((type: EventType) => {
    setEventType((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  }, []);

  return (
    <Collapse in={filterOpened}>
      <PaperContainer>
        <Grid container direction="column" spacing={2}>
          <Grid
            item
            container
            xs={12}
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Grid item xs={12} md={1}>
              <TypographyCaption>{t("common:title")}</TypographyCaption>
            </Grid>
            <Grid item xs={12} md={11}>
              <FormControl size="small">
                <TextField
                  size="small"
                  fullWidth
                  value={searchTitle}
                  onChange={(e) => {
                    setSearchTitle(e.target.value);
                  }}
                  sx={{ minWidth: "200px" }}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid
            item
            container
            xs={12}
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Grid item xs={12} md={1}>
              <TypographyCaption>{t("common:type")}</TypographyCaption>
            </Grid>
            <Grid item xs={12} md={11}>
              <Grid container spacing={1}>
                {eventTypes.map((type, index) => (
                  <Grid key={"event-type-filter-" + index} item>
                    <Chip
                      clickable
                      color={
                        eventType.includes(type.value as EventType)
                          ? "primary"
                          : "default"
                      }
                      label={
                        <Grid container>
                          <Grid item>{t(type.label)}</Grid>
                        </Grid>
                      }
                      onClick={() =>
                        handleEventTypeClick(type.value as EventType)
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            container
            xs={12}
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Grid item xs={12} md={1}>
              <TypographyCaption>{t("common:startAt")}</TypographyCaption>
            </Grid>
            <Grid item xs={12} md={11}>
              <Grid container spacing={1}>
                <Grid item xs={6} md={3}>
                  <FormControl fullWidth>
                    <Select
                      value={startAtType}
                      onChange={(e) => {
                        setStartAtType(
                          e.target.value as EventFilterStartAtType
                        );
                        if (!e.target.value) {
                          setStartAt(undefined);
                        }
                      }}
                    >
                      <MenuItem value={undefined}>
                        {t("filter:time.irrelevant")}
                      </MenuItem>
                      <MenuItem value="before">
                        {t("filter:time.before")}
                      </MenuItem>
                      <MenuItem value="after">
                        {t("filter:time.after")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      defaultValue={startAt ? dayjs(startAt) : undefined}
                      onChange={(newVal) =>
                        setStartAt(newVal?.valueOf() ?? undefined)
                      }
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            container
            xs={12}
            alignItems="center"
            // justify="space-between"
            spacing={1}
          >
            <Grid item xs={false} md={1}></Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => applyFilter()}
                startIcon={<Check />}
              >
                {t("filter:button.apply")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                disabled={!isFilterDataChanged}
                onClick={() => resetToPropFilterData()}
                startIcon={<RotateLeft />}
              >
                {t("filter:button.resetChanges")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                disabled={!isFilterNotEmpty}
                onClick={() => clearFilterData()}
                startIcon={<ClearAll />}
              >
                {t("filter:button.clear")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </PaperContainer>
    </Collapse>
  );
};

export default EventListFilter;
