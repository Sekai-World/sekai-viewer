import React, { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  Grid,
  Stack,
  Tooltip,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
} from "@mui/material";

import { useCachedData } from "../../utils";
import { useAssetI18n, useCharaName } from "../../utils/i18n";
import {
  IMysekaiTalk,
  IGameChara,
  IMysekaiFixtureInfo,
  IUnitProfile,
} from "../../types.d";
import { charaIcons, UnitLogoMiniMap } from "../../utils/resources";
import PaperContainer from "../styled/PaperContainer";
import {
  charaMap,
  getCharacterUnit,
  isVirtualSinger,
} from "../../utils/mysekaiFixtureUtils";

// Enhanced talk with processing info
export interface EnhancedTalk extends IMysekaiTalk {
  characterIds: number[];
  fixtureInfo?: IMysekaiFixtureInfo;
  firstTalkText?: string;
}

// Filter talks based on character selection
export function filterTalksByCharacters(
  talks: EnhancedTalk[],
  characterSelected: number[]
): EnhancedTalk[] {
  if (characterSelected.length === 0) {
    return [];
  }

  return talks.filter((talk) => {
    // Check if talk includes all selected characters
    return Array.from(characterSelected).every((selectedId) =>
      talk.characterIds.some((characterId: number) => {
        return charaMap(characterId) === selectedId;
      })
    );
  });
}

// Filter talks by fixture association
export function filterTalksByFixture(
  talks: EnhancedTalk[],
  fixtureFilter: string
): EnhancedTalk[] {
  if (fixtureFilter === "fixture") {
    return talks.filter((talk) => talk.fixtureInfo);
  } else if (fixtureFilter === "non-fixture") {
    return talks.filter((talk) => !talk.fixtureInfo);
  }
  return talks; // "all" case
}

// Filter talks by supporting unit groups
export function filterTalksBySupportingUnit(
  talks: EnhancedTalk[],
  supportingUnitSelected: string[],
  charas?: IGameChara[]
): EnhancedTalk[] {
  if (supportingUnitSelected.length === 0) {
    return talks;
  }

  return talks.filter((talk) => {
    return Array.from(supportingUnitSelected).some((selectedUnit) =>
      talk.characterIds.some((characterId: number) => {
        return getCharacterUnit(characterId, charas) === selectedUnit;
      })
    );
  });
}

// Main filtering function that combines all filters
export function filterMysekaiTalks(
  basicTalks: EnhancedTalk[],
  filters: {
    characterSelected: number[];
    supportingUnitSelected: string[];
    fixtureFilter: string;
  },
  charas?: IGameChara[]
): EnhancedTalk[] {
  let filtered = basicTalks;

  // Filter by fixture association
  filtered = filterTalksByFixture(filtered, filters.fixtureFilter);

  // Filter by character selection
  filtered = filterTalksByCharacters(filtered, filters.characterSelected);

  // Filter by supporting unit groups - ONLY if virtual singers are selected
  const hasVirtualSingers = filters.characterSelected.some((id) =>
    isVirtualSinger(id)
  );
  if (hasVirtualSingers && filters.supportingUnitSelected.length > 0) {
    filtered = filterTalksBySupportingUnit(
      filtered,
      filters.supportingUnitSelected,
      charas
    );
  }

  return filtered;
}

// Character Filter Component
export const CharacterFilter: React.FC<{
  selected: number[];
  onFilter: (selected: number[]) => void;
  supportingUnitSelected: string[];
  onSupportingUnitFilter: (selected: string[]) => void;
}> = ({
  selected,
  onFilter,
  supportingUnitSelected,
  onSupportingUnitFilter,
}) => {
  const { t } = useTranslation();
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const getCharaName = useCharaName();
  const [showSupportingUnitFilter, setShowSupportingUnitFilter] =
    useState<boolean>(false);

  // Initialize supporting unit filter visibility based on selected characters
  useEffect(() => {
    const hasVirtualSingers = selected.some((id) => isVirtualSinger(id));
    setShowSupportingUnitFilter(hasVirtualSingers);

    // Clear supporting unit selection if no virtual singers are selected
    if (!hasVirtualSingers) {
      onSupportingUnitFilter([]);
    }
  }, [selected]);

  const handleCharaIconClick = useCallback(
    (chara: IGameChara) => {
      onFilter(
        selected.includes(chara.id)
          ? selected.filter((id) => id !== chara.id)
          : [...selected, chara.id]
      );
    },
    [selected, onFilter, onSupportingUnitFilter]
  );

  const handleSelectClear = useCallback(() => {
    onFilter([]);
    setShowSupportingUnitFilter(false);
    onSupportingUnitFilter([]);
  }, [onFilter, onSupportingUnitFilter]);

  const handleSupportingUnitClick = useCallback(
    (unit: string) => {
      onSupportingUnitFilter(
        supportingUnitSelected.includes(unit)
          ? supportingUnitSelected.filter((u) => u !== unit)
          : [...supportingUnitSelected, unit]
      );
    },
    [supportingUnitSelected, onSupportingUnitFilter]
  );

  const handleSupportingUnitSelectAll = useCallback(() => {
    if (unitProfiles) {
      const unitList = unitProfiles.map((profile) => profile.unit);
      onSupportingUnitFilter([...unitList]);
    }
  }, [onSupportingUnitFilter, unitProfiles]);

  const handleSupportingUnitSelectClear = useCallback(() => {
    onSupportingUnitFilter([]);
  }, [onSupportingUnitFilter]);

  const { getTranslated } = useAssetI18n();

  if (!charas || !unitProfiles) {
    return (
      <PaperContainer>
        <Box display="flex" justifyContent="center">
          <CircularProgress size={24} />
        </Box>
      </PaperContainer>
    );
  }

  return (
    <PaperContainer>
      <Stack spacing={1}>
        <Typography variant="subtitle2">
          {t("filter:character.caption")}
        </Typography>
        <Grid container spacing={1}>
          {charas.map((chara) => (
            <Grid key={"chara-filter-" + chara.id} item>
              <Tooltip title={getCharaName(chara.id)} placement="top">
                <IconButton
                  size="small"
                  onClick={() => handleCharaIconClick(chara)}
                  className={clsx({
                    "icon-not-selected": !selected.includes(chara.id),
                    "icon-selected": selected.includes(chara.id),
                  })}
                >
                  <Avatar
                    alt={getCharaName(chara.id)}
                    src={charaIcons[`CharaIcon${chara.id}` as "CharaIcon1"]}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row">
          <Button variant="text" onClick={handleSelectClear}>
            {t("filter:clear")}
          </Button>
        </Stack>

        {/* Supporting Unit Filter - shows when virtual singer is selected */}
        {showSupportingUnitFilter && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("filter:supportingUnit.caption") || "Supporting Unit Groups"}
            </Typography>
            <Grid container spacing={1}>
              {unitProfiles.map((unitProfile) => (
                <Grid key={"supporting-unit-filter-" + unitProfile.unit} item>
                  <Tooltip
                    title={getTranslated(
                      `unit_profile:${unitProfile.unit}.name`,
                      unitProfile.unitName
                    )}
                    placement="top"
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleSupportingUnitClick(unitProfile.unit)
                      }
                      className={clsx({
                        "icon-not-selected": !supportingUnitSelected.includes(
                          unitProfile.unit
                        ),
                        "icon-selected": supportingUnitSelected.includes(
                          unitProfile.unit
                        ),
                      })}
                    >
                      <Box
                        component="img"
                        src={UnitLogoMiniMap[unitProfile.unit as "idol"]}
                        alt={unitProfile.unitName}
                        sx={{ width: 32, height: 32, objectFit: "contain" }}
                      />
                    </IconButton>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
            <Stack direction="row" sx={{ mt: 1 }}>
              <Button variant="text" onClick={handleSupportingUnitSelectAll}>
                {t("filter:select_all")}
              </Button>
              <Button variant="text" onClick={handleSupportingUnitSelectClear}>
                {t("filter:select_clear")}
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
    </PaperContainer>
  );
};

// Fixture Filter Component
export const FixtureFilter: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <PaperContainer>
      <Stack spacing={1}>
        <Typography variant="subtitle2">
          {t("mysekai:talk.fixtureFilter.caption")}
        </Typography>
        <ToggleButtonGroup
          value={value}
          exclusive
          onChange={(_, newValue) => {
            if (newValue !== null) {
              onChange(newValue);
            }
          }}
          size="small"
        >
          <ToggleButton value="all">{t("common:all") || "All"}</ToggleButton>
          <ToggleButton value="fixture">
            {t("mysekai:talk.fixtureFilter.withFixture") || "With Fixture"}
          </ToggleButton>
          <ToggleButton value="non-fixture">
            {t("mysekai:talk.fixtureFilter.withoutFixture") ||
              "Without Fixture"}
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </PaperContainer>
  );
};
