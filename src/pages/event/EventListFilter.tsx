import React, { useMemo, useState } from "react";
import { EventType } from "../../types";
import { Button, Collapse, FormControl, Grid, TextField } from "@mui/material";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";
import { Check, ClearAll, RotateLeft } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

type EventFilterStartAtType = "before" | "after";

type EventFilterEventUnitType = "event" | "eventStory";

type EventFilterInclExclType = "incl" | "excl" | "both";

export interface EventFilterData {
  searchTitle: string;
  eventType: EventType[];
  startAtType: EventFilterStartAtType | null;
  startAt: number | null;
  // There are units in the event.json, as well as in the eventStory.json
  // eventUnitType is used to distinguish between the two
  eventUnitType: EventFilterEventUnitType | null;
  eventUnit: string[];
  isKeyEventStory: EventFilterInclExclType;
  hasEventMusic: EventFilterInclExclType;
  eventBonusAttr: string[];
  eventBonusUnitId: number[];
}

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
  const [eventType, setEventType] = useState<EventType[]>([]);
  const [startAtType, setStartAtType] = useState<EventFilterStartAtType | null>(
    null
  );
  const [startAt, setStartAt] = useState<number | null>(null);
  const [eventUnitType, setEventUnitType] =
    useState<EventFilterEventUnitType | null>(null);
  const [eventUnit, setEventUnit] = useState<string[]>([]);
  const [isKeyEventStory, setIsKeyEventStory] =
    useState<EventFilterInclExclType>("both");
  const [hasEventMusic, setHasEventMusic] =
    useState<EventFilterInclExclType>("both");
  const [eventBonusAttr, setEventBonusAttr] = useState<string[]>([]);
  const [eventBonusUnitId, setEventBonusUnitId] = useState<number[]>([]);

  const isFilterDataChanged = useMemo(() => {
    return searchTitle !== filterData.searchTitle;
  }, [searchTitle, filterData.searchTitle]);
  const isFilterNotEmpty = Object.values(filterData).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return value !== null && value !== undefined;
  });

  const applyFilter = () => {
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
  };

  const resetToPropFilterData = () => {
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
  };

  const clearFilterData = () => {
    setSearchTitle("");
    setEventType([]);
    setStartAtType(null);
    setStartAt(null);
    setEventUnitType(null);
    setEventUnit([]);
    setIsKeyEventStory("both");
    setHasEventMusic("both");
    setEventBonusAttr([]);
    setEventBonusUnitId([]);
  };

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
