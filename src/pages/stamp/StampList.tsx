import { Avatar, Chip, Collapse, Grid } from "@mui/material";
import {
  GetApp,
  GetAppOutlined,
  Publish,
  PublishOutlined,
  Sort,
  SortOutlined,
  FilterAlt as Filter,
  FilterAltOutlined as FilterOutline,
} from "@mui/icons-material";
import Pound from "~icons/mdi/pound";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { characterSelectReducer } from "../../stores/reducers";
import { IStampInfo } from "../../types.d";
import { useCachedData, useLocalStorage, useToggle } from "../../utils";
import { charaIcons } from "../../utils/resources";
import GridView from "./GridView";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useCharaName } from "../../utils/i18n";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";

const ListCard: React.FC<{ data?: IStampInfo }> = GridView;

const StampList: React.FC<{}> = () => {
  const { t } = useTranslation();
  const getCharaName = useCharaName();

  const [stampsCache] = useCachedData<IStampInfo>("stamps");

  const [stamps, setStamps] = useState<IStampInfo[]>([]);
  const [filteredCache, setFilteredCache] = useState<IStampInfo[]>([]);
  const [filterOpen, toggleFilterOpen] = useToggle(false);
  const [sortType, setSortType] = useLocalStorage<string>(
    "stamp-list-update-sort",
    "desc"
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "stamp-list-filter-sort-by",
    "id"
  );
  const [characterSelected, dispatchCharacterSelected] = useReducer(
    characterSelectReducer,
    JSON.parse(localStorage.getItem("stamp-list-filter-charas") || "[]")
  );

  const [page, setPage] = useState<number>(0);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [stampType, setStampType] = useState("");

  const getPaginatedStamps = useCallback(
    (page: number, limit: number) => {
      return filteredCache.slice(limit * (page - 1), limit * page);
    },
    [filteredCache]
  );

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
        setPage((page) => page + 1);
        setLastQueryFin(false);
      } else if (filteredCache.length && filteredCache.length <= page * limit) {
        setHasMore(false);
      }
    },
    [filteredCache.length, isReady, lastQueryFin, limit, page]
  );

  useEffect(() => {
    document.title = t("title:stampList");
  }, [t]);

  useEffect(() => {
    if (stampsCache && stampsCache.length) {
      let cache = stampsCache;
      if (characterSelected.length) {
        cache = stampsCache.filter((s) =>
          characterSelected.includes(s.characterId1)
        );
      }
      if (stampType) {
        const compareTypes = [stampType];
        if (stampType === "text")
          compareTypes.push("cheerful_carnival_message");
        cache = stampsCache.filter((s) => compareTypes.includes(s.stampType));
      }
      if (sortType === "desc") {
        cache = cache.sort((a, b) => b[sortBy as "id"] - a[sortBy as "id"]);
      } else if (sortType === "asc") {
        cache = cache.sort((a, b) => a[sortBy as "id"] - b[sortBy as "id"]);
      }
      setFilteredCache(cache);
      setStamps([]);
      setPage(0);
    }
  }, [
    characterSelected,
    stampsCache,
    setStamps,
    setPage,
    setFilteredCache,
    sortType,
    sortBy,
    stampType,
  ]);

  useEffect(() => {
    setStamps((stamps) => [...stamps, ...getPaginatedStamps(page, limit)]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, getPaginatedStamps]);

  useEffect(() => {
    setIsReady(Boolean(stampsCache && stampsCache.length));
  }, [setIsReady, stampsCache]);

  const handleUpdateSortType = useCallback(
    (_, sort: string) => {
      if (!sort) return;
      setSortType(sort || "asc");
    },
    [setSortType]
  );

  const handleUpdateSortBy = useCallback(
    (_, sort: string) => {
      if (!sort) return;
      setSortBy(sort || "id");
    },
    [setSortBy]
  );

  return (
    <Fragment>
      <TypographyHeader>{t("common:stamp")}</TypographyHeader>
      <ContainerContent>
        <Grid
          container
          justifyContent="space-between"
          style={{ marginBottom: "0.5rem" }}
        >
          <Grid item>
            <Grid container spacing={1}>
              <Grid item>
                <ToggleButtonGroup
                  value={sortType}
                  color="primary"
                  exclusive
                  onChange={handleUpdateSortType}
                >
                  <ToggleButton value="asc">
                    {sortType === "asc" ? <Publish /> : <PublishOutlined />}
                  </ToggleButton>
                  <ToggleButton value="desc">
                    {sortType === "desc" ? <GetApp /> : <GetAppOutlined />}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item>
                <ToggleButtonGroup
                  size="medium"
                  value={sortBy}
                  color="primary"
                  exclusive
                  onChange={handleUpdateSortBy}
                >
                  <ToggleButton value="id">
                    <Pound />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <ToggleButton
              value=""
              color="primary"
              selected={filterOpen}
              onClick={() => toggleFilterOpen()}
            >
              {filterOpen ? <Filter /> : <FilterOutline />}
              {filterOpen ? <Sort /> : <SortOutlined />}
            </ToggleButton>
          </Grid>
        </Grid>
        <Collapse in={filterOpen}>
          <PaperContainer>
            <Grid container direction="column" spacing={1}>
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
                    {t("filter:character.caption")}
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {Array.from({ length: 26 }).map((_, idx) => (
                      <Grid key={"chara-filter-" + idx} item>
                        <Chip
                          clickable
                          color={
                            characterSelected.includes(idx + 1)
                              ? "primary"
                              : "default"
                          }
                          avatar={
                            <Avatar
                              alt={getCharaName(idx + 1)}
                              src={
                                charaIcons[
                                  `CharaIcon${idx + 1}` as "CharaIcon1"
                                ]
                              }
                            />
                          }
                          label={getCharaName(idx + 1)}
                          onClick={() => {
                            if (characterSelected.includes(idx + 1)) {
                              dispatchCharacterSelected({
                                type: "remove",
                                payload: idx + 1,
                                storeName: "stamp-list-filter-charas",
                              });
                            } else {
                              dispatchCharacterSelected({
                                type: "add",
                                payload: idx + 1,
                                storeName: "stamp-list-filter-charas",
                              });
                            }
                          }}
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
                  <TypographyCaption>
                    {t("filter:stampType.caption")}
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {["text", "illustration"].map((type) => (
                      <Grid key={"stamp-type-filter-" + type} item>
                        <Chip
                          clickable
                          color={stampType === type ? "primary" : "default"}
                          label={t(`filter:stampType.${type}`)}
                          onClick={() => {
                            if (stampType === type) setStampType("");
                            else setStampType(type);
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </PaperContainer>
        </Collapse>
        <InfiniteScroll<IStampInfo>
          ViewComponent={ListCard}
          callback={callback}
          data={stamps}
          gridSize={{
            xs: 6,
            sm: 4,
            md: 3,
            lg: 2,
          }}
        />
      </ContainerContent>
    </Fragment>
  );
};

export default StampList;
