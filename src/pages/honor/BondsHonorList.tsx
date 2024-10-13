import {
  Avatar,
  Badge,
  Collapse,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import {
  Sort,
  SortOutlined,
  FilterAlt as Filter,
  FilterAltOutlined as FilterOutline,
} from "@mui/icons-material";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import type {
  IBond,
  IBondsHonor,
  IBondsHonorWord,
  IGameChara,
} from "../../types";
import { useCachedData, useLocalStorage, useToggle } from "../../utils";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";
import { useDebounce } from "use-debounce";
import { useCharaName } from "../../utils/i18n";
import { characterSelectReducer } from "../../stores/reducers";
import clsx from "clsx";
import { charaIcons } from "../../utils/resources";
import BondsHonorGridView, { type BondsHonorData } from "./BondsHonorGridView";
import BondsHonorDetailDialog from "./BondsHonorDetailDialog";

type ViewGridType = "grid";

const ListCard: { [key: string]: React.FC<{ data?: BondsHonorData }> } = {
  grid: BondsHonorGridView,
};

function getPaginatedHonors(
  honors: BondsHonorData[],
  page: number,
  limit: number
) {
  return honors.slice(limit * (page - 1), limit * page);
}

const limit = 12;

const BondsHonorList = () => {
  const { t } = useTranslation();
  const getCharaName = useCharaName();

  const [bonds] = useCachedData<IBond>("bonds");
  const [bondsHonors] = useCachedData<IBondsHonor>("bondsHonors");
  const [bondsHonorWords] = useCachedData<IBondsHonorWord>("bondsHonorWords");
  const [charas] = useCachedData<IGameChara>("gameCharacters");

  const [honors, setHonors] = useState<BondsHonorData[]>([]);
  const [bondsHonorsCache, setBondsHonorsCache] = useState<BondsHonorData[]>(
    []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHonor, setSelectedHonor] = useState<BondsHonorData>();
  const [isHonorGroupOnce, setIsHonorGroupOnce] = useState(false);

  const [viewGridType] = useState<ViewGridType>("grid");
  const [page, setPage] = useState<number>(1);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [filterOpen, toggleFilterOpen] = useToggle(false);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [debouncedSearchTitle] = useDebounce(searchTitle, 500);
  const [filteredCache, setFilteredCache] = useState<BondsHonorData[]>([]);

  const [character1Selected, dispatchCharacter1Selected] = useReducer(
    characterSelectReducer,
    JSON.parse(localStorage.getItem("honor-list-filter-charas-1") || "[]")
  );
  const [character2Selected, dispatchCharacter2Selected] = useReducer(
    characterSelectReducer,
    JSON.parse(localStorage.getItem("honor-list-filter-charas-2") || "[]")
  );
  const [sortType, setSortType] = useLocalStorage<string>(
    "honor-list-filter-sort-type",
    "asc"
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "honor-list-filter-sort-by",
    "id"
  );

  useLayoutEffect(() => {
    document.title = t("title:honorList");
  }, [t]);

  useEffect(() => {
    if (bondsHonors?.length && bondsHonorWords?.length) {
      setBondsHonorsCache(
        bondsHonors.map((e) => ({
          id: e.id,
          bond: e,
          word: bondsHonorWords.find((w) => w.bondsGroupId === e.bondsGroupId),
        }))
      );
    }

    return () => {
      setBondsHonorsCache([]);
    };
  }, [bondsHonorWords, bondsHonors]);

  useEffect(() => {
    if (bonds?.length && bondsHonorWords?.length && bondsHonorsCache?.length) {
      let result = [...bondsHonorsCache];
      // do filter
      let bondsGroups = [...bonds];
      if (character1Selected.length) {
        bondsGroups = bondsGroups.filter((b) =>
          character1Selected.includes(b.characterId1)
        );
      }
      if (character2Selected.length) {
        bondsGroups = bondsGroups.filter((b) =>
          character2Selected.includes(b.characterId2)
        );
      }
      const bondsGroupIds = bondsGroups.map((b) => b.groupId);
      result = result.filter((e) =>
        bondsGroupIds.includes(e.bond.bondsGroupId)
      );
      if (debouncedSearchTitle) {
        result = result.filter((e) =>
          e.bond.name.toLowerCase().includes(debouncedSearchTitle.toLowerCase())
        );
      }
      if (isHonorGroupOnce) {
        const groupIds = Array.from(
          new Set(result.map((elem) => elem.bond.bondsGroupId))
        );
        result = groupIds.map(
          (id) => result.find((elem) => elem.bond.bondsGroupId === id)!
        );
      }
      switch (sortBy) {
        case "id":
        case "seq":
          result = result.sort((a, b) =>
            sortType === "asc"
              ? a.bond[sortBy] - b.bond[sortBy]
              : b.bond[sortBy] - a.bond[sortBy]
          );
          break;
      }
      setFilteredCache(result);
      setHonors([]);
      setPage(1);
    }

    return () => {
      setFilteredCache([]);
      setHonors([]);
      setPage(0);
    };
  }, [
    debouncedSearchTitle,
    bondsHonorWords,
    bondsHonorsCache,
    isHonorGroupOnce,
    sortBy,
    sortType,
    bonds,
    character1Selected,
    character2Selected,
  ]);

  useLayoutEffect(() => {
    setHonors((honors) => [
      ...honors,
      ...getPaginatedHonors(filteredCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, setLastQueryFin, filteredCache]);

  useLayoutEffect(() => {
    setIsReady(!!bondsHonorsCache?.length && !!bondsHonorWords?.length);
  }, [bondsHonorsCache?.length, bondsHonorWords?.length]);

  const callback = useCallback(
    (
      entries: readonly IntersectionObserverEntry[],
      setHasMore: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (!isReady) return;
      if (
        entries[0].isIntersecting &&
        lastQueryFin &&
        (!filteredCache.length || filteredCache.length > page * limit)
      ) {
        setLastQueryFin(false);
        setPage((page) => page + 1);
      } else if (filteredCache.length && filteredCache.length <= page * limit) {
        setHasMore(false);
      }
    },
    [filteredCache.length, isReady, lastQueryFin, page]
  );

  const handleCharaIconClick = useCallback(
    (chara: IGameChara, group: 1 | 2) => {
      const characterSelected =
        group === 1 ? character1Selected : character2Selected;
      const dispatchCharacterSelected =
        group === 1 ? dispatchCharacter1Selected : dispatchCharacter2Selected;
      const storeName = `honor-list-filter-charas-${group}`;

      if (characterSelected.includes(chara.id)) {
        dispatchCharacterSelected({
          payload: chara.id,
          storeName,
          type: "remove",
        });
      } else {
        dispatchCharacterSelected({
          payload: chara.id,
          storeName,
          type: "add",
        });
      }
    },
    [character1Selected, character2Selected]
  );

  return isReady && bondsHonorWords && bondsHonorWords.length ? (
    <Fragment>
      <TypographyHeader>{t("honor:page_title")}</TypographyHeader>
      <ContainerContent>
        <Grid
          container
          justifyContent="flex-end"
          style={{ marginBottom: "0.5rem" }}
        >
          <Badge
            color="secondary"
            variant="dot"
            invisible={
              !character1Selected.length &&
              !character2Selected.length &&
              !searchTitle
            }
          >
            <ToggleButton
              value=""
              color="primary"
              selected={filterOpen}
              onClick={() => toggleFilterOpen()}
            >
              {filterOpen ? <Filter /> : <FilterOutline />}
              {filterOpen ? <Sort /> : <SortOutlined />}
            </ToggleButton>
          </Badge>
        </Grid>
        <Collapse in={filterOpen}>
          <PaperContainer>
            <Grid container direction="column" spacing={1}>
              <Grid
                item
                container
                xs={12}
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption sx={{ paddingTop: "0.375em" }}>
                    {t("filter:character.caption")} 1
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {(charas || []).map((chara) => (
                      <Grid key={"chara-filter-" + chara.id} item>
                        <Tooltip title={getCharaName(chara.id)} placement="top">
                          <IconButton
                            size="small"
                            onClick={() => handleCharaIconClick(chara, 1)}
                            className={clsx({
                              "icon-not-selected": !character1Selected.includes(
                                chara.id
                              ),
                              "icon-selected": character1Selected.includes(
                                chara.id
                              ),
                            })}
                          >
                            <Avatar
                              alt={getCharaName(chara.id)}
                              src={
                                charaIcons[
                                  `CharaIcon${chara.id}` as "CharaIcon1"
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
              <Grid
                item
                container
                xs={12}
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption sx={{ paddingTop: "0.375em" }}>
                    {t("filter:character.caption")} 2
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {(charas || []).map((chara) => (
                      <Grid key={"chara-filter-" + chara.id} item>
                        <Tooltip title={getCharaName(chara.id)} placement="top">
                          <IconButton
                            size="small"
                            onClick={() => handleCharaIconClick(chara, 2)}
                            className={clsx({
                              "icon-not-selected": !character2Selected.includes(
                                chara.id
                              ),
                              "icon-selected": character2Selected.includes(
                                chara.id
                              ),
                            })}
                          >
                            <Avatar
                              alt={getCharaName(chara.id)}
                              src={
                                charaIcons[
                                  `CharaIcon${chara.id}` as "CharaIcon1"
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
                    {t("filter:sort.caption")}
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={10}>
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
                          <MenuItem value="seq">
                            {t("common:sequence")}
                          </MenuItem>
                        </Select>
                      </FormControl>
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
                  <TypographyCaption>{t("common:title")}</TypographyCaption>
                </Grid>
                <Grid item xs={12} md={10}>
                  <FormControl size="small">
                    <TextField
                      size="small"
                      fullWidth
                      value={searchTitle}
                      onChange={(e) => setSearchTitle(e.target.value)}
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
                  <TypographyCaption>
                    {t("filter:honorType.group_only_once")}
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={10}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Switch
                        checked={isHonorGroupOnce}
                        onChange={() => setIsHonorGroupOnce((state) => !state)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </PaperContainer>
        </Collapse>
        <InfiniteScroll<BondsHonorData>
          ViewComponent={ListCard[viewGridType]}
          data={honors}
          callback={callback}
          gridSize={
            (
              {
                grid: {
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3,
                },
              } as const
            )[viewGridType]
          }
          onComponentClick={(data) => {
            setSelectedHonor(data);
            setIsDialogOpen(true);
          }}
        />
      </ContainerContent>
      <BondsHonorDetailDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        data={selectedHonor}
      />
    </Fragment>
  ) : (
    <div>Loading...</div>
  );
};

export default BondsHonorList;
