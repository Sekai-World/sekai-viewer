import React, { useCallback, useMemo, useState } from "react";
import { EventType, IGameChara, IUnitProfile } from "../../types";
import {
  Avatar,
  Button,
  capitalize,
  Chip,
  Collapse,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";
import { Check, ClearAll, RotateLeft } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useCachedData } from "../../utils";
import { useAssetI18n, useCharaName } from "../../utils/i18n";
import clsx from "clsx";
import {
  attrIconMap,
  charaIcons,
  UnitLogoMiniMap,
} from "../../utils/resources";

type EventFilterStartAtType = "before" | "after";

type EventFilterEventUnitType = "event" | "eventStory" | "eventStoryMain";

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
  eventBonusCharaId: number[];
  eventBonusCharaSupportUnit: string[];
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
  const { getTranslated } = useAssetI18n();
  const getCharaName = useCharaName();

  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [charas] = useCachedData<IGameChara>("gameCharacters");

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
  const [eventBonusCharaId, setEventBonusCharaId] = useState<number[]>(
    filterData.eventBonusCharaId || []
  );
  const [eventBonusCharaSupportUnit, setEventBonusCharaSupportUnit] = useState<
    string[]
  >(filterData.eventBonusCharaSupportUnit || []);

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
      eventBonusCharaId: eventBonusCharaId,
      eventBonusCharaSupportUnit: eventBonusCharaSupportUnit,
    });
    toggleFilterOpened();
  }, [
    eventBonusAttr,
    eventBonusCharaId,
    eventBonusCharaSupportUnit,
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
    setEventBonusCharaId(filterData.eventBonusCharaId);
    setEventBonusCharaSupportUnit(filterData.eventBonusCharaSupportUnit);
  }, [
    filterData.eventBonusAttr,
    filterData.eventBonusCharaId,
    filterData.eventBonusCharaSupportUnit,
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
    setEventBonusCharaId([]);
    setEventBonusCharaSupportUnit([]);
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

  const handleUnitIconClick = useCallback((unitProfile: IUnitProfile) => {
    setEventUnit((prev) => {
      if (prev.includes(unitProfile.unit)) {
        return prev.filter((u) => u !== unitProfile.unit);
      } else {
        return [...prev, unitProfile.unit];
      }
    });
  }, []);

  const handleAttrIconClick = useCallback((attr: string) => {
    setEventBonusAttr((prev) => {
      if (prev.includes(attr)) {
        return prev.filter((a) => a !== attr);
      } else {
        return [...prev, attr];
      }
    });
  }, []);

  const handleCharaIconClick = useCallback((chara: IGameChara) => {
    setEventBonusCharaId((prev) => {
      if (prev.includes(chara.id)) {
        return prev.filter((id) => id !== chara.id);
      } else {
        return [...prev, chara.id];
      }
    });
  }, []);

  const handleSupportUnitIconClick = useCallback((supportUnit: string) => {
    setEventBonusCharaSupportUnit((prev) => {
      if (prev.includes(supportUnit)) {
        return prev.filter((su) => su !== supportUnit);
      } else {
        return [...prev, supportUnit];
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
            <Grid item xs={12} md={2}>
              <TypographyCaption>{t("common:title")}</TypographyCaption>
            </Grid>
            <Grid item xs={12} md={10}>
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
            <Grid item xs={12} md={2}>
              <TypographyCaption>{t("common:type")}</TypographyCaption>
            </Grid>
            <Grid item xs={12} md={10}>
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
            <Grid item xs={12} md={2}>
              <TypographyCaption>{t("common:startAt")}</TypographyCaption>
            </Grid>
            <Grid item xs={12} md={10}>
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
            justifyContent="space-between"
            spacing={1}
          >
            <Grid item xs={12} md={2}>
              <TypographyCaption>
                {t("filter:event.unitType.caption")}
              </TypographyCaption>
            </Grid>
            <Grid item xs={12} md={10}>
              <FormControl size="small">
                <RadioGroup row>
                  <FormControlLabel
                    value="both"
                    control={<Radio />}
                    label={t("filter:both")}
                    checked={!eventUnitType}
                    onChange={(_, checked) => {
                      if (checked) setEventUnitType(undefined);
                    }}
                  />
                  <FormControlLabel
                    value="both"
                    control={<Radio />}
                    label={t("filter:event.unitType.event")}
                    checked={eventUnitType === "event"}
                    onChange={(_, checked) => {
                      if (checked) setEventUnitType("event");
                    }}
                  />
                  <FormControlLabel
                    value="incl"
                    control={<Radio />}
                    label={t("filter:event.unitType.eventStory")}
                    checked={eventUnitType === "eventStory"}
                    onChange={(_, checked) => {
                      if (checked) setEventUnitType("eventStory");
                    }}
                  />
                  <FormControlLabel
                    value="excl"
                    control={<Radio />}
                    label={t("filter:event.unitType.eventStoryMain")}
                    checked={eventUnitType === "eventStoryMain"}
                    onChange={(_, checked) => {
                      if (checked) setEventUnitType("eventStoryMain");
                    }}
                  />
                </RadioGroup>
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
            <Grid item xs={12} md={2}>
              <TypographyCaption>{t("common:unit")}</TypographyCaption>
            </Grid>
            <Grid item xs={12} md={10}>
              <Grid container spacing={1}>
                {(unitProfiles || [])
                  .sort((a, b) => a.seq - b.seq)
                  .map((unitProfile) => (
                    <Grid key={"unit-profile-filter-" + unitProfile.unit} item>
                      <Tooltip
                        title={getTranslated(
                          `unit_profile:${unitProfile.unit}.name`,
                          unitProfile.unitName
                        )}
                        placement="top"
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleUnitIconClick(unitProfile)}
                          className={clsx({
                            "icon-not-selected": !eventUnit.includes(
                              unitProfile.unit
                            ),
                            "icon-selected": eventUnit.includes(
                              unitProfile.unit
                            ),
                          })}
                        >
                          <Avatar
                            alt={unitProfile.unit}
                            src={UnitLogoMiniMap[unitProfile.unit as "idol"]}
                            sx={{ width: 32, height: 32 }}
                          />
                        </IconButton>
                      </Tooltip>
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
            <Grid item xs={12} md={2}>
              <TypographyCaption>{t("event:keyStory")}</TypographyCaption>
            </Grid>
            <Grid item xs={12} md={10}>
              <FormControl size="small">
                <RadioGroup row>
                  <FormControlLabel
                    value="both"
                    control={<Radio />}
                    label={t("filter:both")}
                    checked={isKeyEventStory === "both"}
                    onChange={(_, checked) => {
                      if (checked) setIsKeyEventStory("both");
                    }}
                  />
                  <FormControlLabel
                    value="incl"
                    control={<Radio />}
                    label={t("filter:incl")}
                    checked={isKeyEventStory === "incl"}
                    onChange={(_, checked) => {
                      if (checked) setIsKeyEventStory("incl");
                    }}
                  />
                  <FormControlLabel
                    value="excl"
                    control={<Radio />}
                    label={t("filter:excl")}
                    checked={isKeyEventStory === "excl"}
                    onChange={(_, checked) => {
                      if (checked) setIsKeyEventStory("excl");
                    }}
                  />
                </RadioGroup>
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
            <Grid item xs={12} md={2}>
              <TypographyCaption>
                {t("event:newlyWrittenSong")}
              </TypographyCaption>
            </Grid>
            <Grid item xs={12} md={10}>
              <FormControl size="small">
                <RadioGroup row>
                  <FormControlLabel
                    value="both"
                    control={<Radio />}
                    label={t("filter:both")}
                    checked={hasEventMusic === "both"}
                    onChange={(_, checked) => {
                      if (checked) setHasEventMusic("both");
                    }}
                  />
                  <FormControlLabel
                    value="incl"
                    control={<Radio />}
                    label={t("filter:incl")}
                    checked={hasEventMusic === "incl"}
                    onChange={(_, checked) => {
                      if (checked) setHasEventMusic("incl");
                    }}
                  />
                  <FormControlLabel
                    value="excl"
                    control={<Radio />}
                    label={t("filter:excl")}
                    checked={hasEventMusic === "excl"}
                    onChange={(_, checked) => {
                      if (checked) setHasEventMusic("excl");
                    }}
                  />
                </RadioGroup>
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
            <Grid item xs={12} md={2}>
              <TypographyCaption>{t("event:boostAttribute")}</TypographyCaption>
            </Grid>
            <Grid item xs={12} md={10}>
              <Grid container spacing={1}>
                {["cute", "mysterious", "cool", "happy", "pure"].map((attr) => (
                  <Grid key={"attr-filter-" + attr} item>
                    <Tooltip title={capitalize(attr)} placement="top">
                      <IconButton
                        size="small"
                        onClick={() => handleAttrIconClick(attr)}
                        className={clsx({
                          "icon-not-selected": !eventBonusAttr.includes(attr),
                          "icon-selected": eventBonusAttr.includes(attr),
                        })}
                      >
                        <Avatar
                          alt={attr}
                          src={attrIconMap[attr as "cool"]}
                          sx={{ width: 32, height: 32 }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            container
            xs={12}
            justifyContent="space-between"
            spacing={1}
          >
            <Grid item xs={12} md={2}>
              <TypographyCaption sx={{ paddingTop: "0.375em" }}>
                {t("event:boostCharacters")}
              </TypographyCaption>
            </Grid>
            <Grid item xs={12} md={10}>
              <Grid container spacing={1}>
                {(charas || []).map((chara) => (
                  <Grid key={"chara-filter-" + chara.id} item>
                    <Tooltip title={getCharaName(chara.id)} placement="top">
                      <IconButton
                        size="small"
                        onClick={() => handleCharaIconClick(chara)}
                        className={clsx({
                          "icon-not-selected": !eventBonusCharaId.includes(
                            chara.id
                          ),
                          "icon-selected": eventBonusCharaId.includes(chara.id),
                        })}
                      >
                        <Avatar
                          alt={getCharaName(chara.id)}
                          src={
                            charaIcons[`CharaIcon${chara.id}` as "CharaIcon1"]
                          }
                          sx={{ width: 32, height: 32 }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          {eventBonusCharaId.some((charaId) => charaId >= 21) && (
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Grid item xs={12} md={2}>
                <TypographyCaption>
                  {t("common:support_unit")}
                </TypographyCaption>
              </Grid>
              <Grid item xs={12} md={10}>
                <Grid container spacing={1}>
                  {unitProfiles &&
                    [
                      "theme_park",
                      "street",
                      "idol",
                      "school_refusal",
                      "light_sound",
                    ].map((supportUnit) => (
                      <Grid key={"supportUnit-filter-" + supportUnit} item>
                        <Tooltip
                          title={getTranslated(
                            `unit_profile:${supportUnit}.name`,
                            unitProfiles.find((up) => up.unit === supportUnit)!
                              .unitName
                          )}
                          placement="top"
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleSupportUnitIconClick(supportUnit)
                            }
                            className={clsx({
                              "icon-not-selected":
                                !eventBonusCharaSupportUnit.includes(
                                  supportUnit
                                ),
                              "icon-selected":
                                eventBonusCharaSupportUnit.includes(
                                  supportUnit
                                ),
                            })}
                          >
                            <Avatar
                              alt={supportUnit}
                              src={UnitLogoMiniMap[supportUnit as "idol"]}
                              sx={{ width: 32, height: 32 }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    ))}
                </Grid>
              </Grid>
            </Grid>
          )}
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
