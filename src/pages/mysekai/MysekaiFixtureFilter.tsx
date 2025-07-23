import React from "react";
import {
  Button,
  Grid,
  TextField,
  Collapse,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Avatar,
  Autocomplete,
} from "@mui/material";
import { Check, RotateLeft } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  IMysekaiFixtureGenre,
  IMysekaiFixtureTag,
  IGameChara,
} from "../../types";
import { getGenreName } from "../../utils/mysekaiFixtureUtils";
import { charaIcons } from "../../utils/resources";
import { useCharaName } from "../../utils/i18n";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";

interface MysekaiFixtureFilterProps {
  // Filter state
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterGenre: string;
  setFilterGenre: (value: string) => void;
  filterSubGenre: string;
  setFilterSubGenre: (value: string) => void;
  filterTag: string;
  setFilterTag: (value: string) => void;
  filterChara: number[];
  setFilterChara: (value: number[]) => void;
  filterSketch: string;
  setFilterSketch: (value: string) => void;
  filterConvert: string;
  setFilterConvert: (value: string) => void;
  filterAssembled: string;
  setFilterAssembled: (value: string) => void;
  filterDisassembled: string;
  setFilterDisassembled: (value: string) => void;

  // Sort state
  sortType: string;
  setSortType: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;

  // UI state
  filterOpen: boolean;

  // Data
  genres?: IMysekaiFixtureGenre[];
  subGenres?: IMysekaiFixtureGenre[];
  tags?: IMysekaiFixtureTag[];
  gameCharas?: IGameChara[];

  // Actions
  onApplyFilters: () => void;
  onResetFilter: () => void;
}

const MysekaiFixtureFilter: React.FC<MysekaiFixtureFilterProps> = ({
  searchQuery,
  setSearchQuery,
  filterGenre,
  setFilterGenre,
  filterSubGenre,
  setFilterSubGenre,
  filterTag,
  setFilterTag,
  filterChara,
  setFilterChara,
  filterSketch,
  setFilterSketch,
  filterConvert,
  setFilterConvert,
  filterAssembled,
  setFilterAssembled,
  filterDisassembled,
  setFilterDisassembled,
  sortType,
  setSortType,
  sortBy,
  setSortBy,
  filterOpen,
  genres,
  subGenres,
  tags,
  gameCharas,
  onApplyFilters,
  onResetFilter,
}) => {
  const { t } = useTranslation();
  const getCharaName = useCharaName();

  const handleCharaIconClick = (chara: IGameChara) => {
    const currentFilter = Array.isArray(filterChara) ? filterChara : [];
    if (currentFilter.includes(chara.id)) {
      setFilterChara(currentFilter.filter((id) => id !== chara.id));
    } else {
      setFilterChara([...currentFilter, chara.id]);
    }
  };

  const hasActiveFilters = !!(
    filterGenre ||
    filterSubGenre ||
    filterTag ||
    (Array.isArray(filterChara) && filterChara.length > 0) ||
    filterSketch ||
    filterConvert ||
    filterAssembled ||
    filterDisassembled ||
    searchQuery
  );

  return (
    <Collapse in={filterOpen}>
      <PaperContainer>
        <Grid container direction="column" spacing={2}>
          {/* Search Field */}
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ minWidth: "200px" }}
                />
              </FormControl>
            </Grid>
          </Grid>

          {/* Sort Controls */}
          <Grid
            item
            container
            xs={12}
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Grid item xs={12} md={1}>
              <TypographyCaption>{t("filter:sort.caption")}</TypographyCaption>
            </Grid>
            <Grid item xs={12} md={11}>
              <Grid container spacing={1}>
                <Grid item>
                  <FormControl size="small">
                    <Select
                      value={sortType}
                      onChange={(e) => {
                        setSortType(e.target.value as string);
                      }}
                      style={{ minWidth: "100px" }}
                    >
                      <MenuItem value="asc">
                        {t("filter:sort.ascending")}
                      </MenuItem>
                      <MenuItem value="desc">
                        {t("filter:sort.descending")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl size="small">
                    <Select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as string);
                      }}
                      style={{ minWidth: "100px" }}
                    >
                      <MenuItem value="id">{t("common:id")}</MenuItem>
                      <MenuItem value="name">{t("common:title")}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Main Filters */}
          <Grid
            item
            container
            xs={12}
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Grid item xs={12} md={1}>
              <TypographyCaption>
                {t("mysekai:fixture.genre")}
              </TypographyCaption>
            </Grid>
            <Grid item xs={12} md={11}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    size="small"
                    fullWidth
                    options={genres?.filter((genre) => genre.id !== 1) || []}
                    getOptionLabel={(option) => getGenreName(option.id, genres)}
                    value={
                      genres?.find((g) => g.id.toString() === filterGenre) ||
                      null
                    }
                    onChange={(_, newValue) => {
                      setFilterGenre(newValue ? newValue.id.toString() : "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={t("mysekai:fixture.genre")}
                        size="small"
                      />
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    size="small"
                    fullWidth
                    options={subGenres?.filter((sg) => sg.id !== 1) || []}
                    getOptionLabel={(option) => option.name}
                    value={
                      subGenres?.find(
                        (sg) => sg.id.toString() === filterSubGenre
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      setFilterSubGenre(newValue ? newValue.id.toString() : "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={t("mysekai:fixture.subGenre")}
                        size="small"
                      />
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Tag Filter */}
          <Grid
            item
            container
            xs={12}
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Grid item xs={12} md={1}>
              <TypographyCaption>{t("mysekai:fixture.tag")}</TypographyCaption>
            </Grid>
            <Grid item xs={12} md={11}>
              <Autocomplete
                size="small"
                fullWidth
                options={tags || []}
                getOptionLabel={(option) => option.name}
                value={tags?.find((t) => t.id.toString() === filterTag) || null}
                onChange={(_, newValue) => {
                  setFilterTag(newValue ? newValue.id.toString() : "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("mysekai:fixture.tag")}
                    size="small"
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
          </Grid>

          {/* Character Filter */}
          <Grid
            item
            container
            xs={12}
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Grid item xs={12} md={1}>
              <TypographyCaption>
                {t("mysekai:fixture.characterTalk")}
              </TypographyCaption>
            </Grid>
            <Grid item xs={12} md={11}>
              <Grid container spacing={1}>
                {(gameCharas || []).map((chara) => (
                  <Grid key={"chara-filter-" + chara.id} item>
                    <Tooltip title={getCharaName(chara.id)} placement="top">
                      <IconButton
                        size="small"
                        onClick={() => handleCharaIconClick(chara)}
                        className={clsx({
                          "icon-not-selected":
                            !Array.isArray(filterChara) ||
                            !filterChara.includes(chara.id),
                          "icon-selected":
                            Array.isArray(filterChara) &&
                            filterChara.includes(chara.id),
                        })}
                      >
                        <Avatar
                          alt={getCharaName(chara.id)}
                          src={
                            charaIcons[
                              `CharaIcon${chara.id}` as keyof typeof charaIcons
                            ]
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

          {/* Status Filters */}
          <Grid
            item
            container
            xs={12}
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Grid item xs={12} md={1}>
              <TypographyCaption>
                {t("mysekai:fixture.status")}
              </TypographyCaption>
            </Grid>
            <Grid item xs={12} md={11}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={3}>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={filterSketch}
                      onChange={(e) => setFilterSketch(e.target.value)}
                      label={t("mysekai:fixture.sketch.label")}
                    >
                      <MenuItem value="true">
                        {t("mysekai:fixture.sketch.yes")}
                      </MenuItem>
                      <MenuItem value="false">
                        {t("mysekai:fixture.sketch.no")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={filterConvert}
                      onChange={(e) => setFilterConvert(e.target.value)}
                      label={t("mysekai:convert.label")}
                    >
                      <MenuItem value="true">
                        {t("mysekai:convert.yes")}
                      </MenuItem>
                      <MenuItem value="false">
                        {t("mysekai:convert.no")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={filterAssembled}
                      onChange={(e) => setFilterAssembled(e.target.value)}
                      label={t("mysekai:fixture.assembled.label")}
                    >
                      <MenuItem value="true">
                        {t("mysekai:fixture.assembled.yes")}
                      </MenuItem>
                      <MenuItem value="false">
                        {t("mysekai:fixture.assembled.no")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={filterDisassembled}
                      onChange={(e) => setFilterDisassembled(e.target.value)}
                      label={t("mysekai:fixture.disassembled.label")}
                    >
                      <MenuItem value="true">
                        {t("mysekai:fixture.disassembled.yes")}
                      </MenuItem>
                      <MenuItem value="false">
                        {t("mysekai:fixture.disassembled.no")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Grid item container xs={12} alignItems="center" spacing={1}>
            <Grid item xs={false} md={1}></Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={onApplyFilters}
                startIcon={<Check />}
              >
                {t("common:apply")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                disabled={!hasActiveFilters}
                onClick={onResetFilter}
                startIcon={<RotateLeft />}
              >
                {t("common:reset")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </PaperContainer>
    </Collapse>
  );
};

export default MysekaiFixtureFilter;
