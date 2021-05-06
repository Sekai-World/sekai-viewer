import {
  Avatar,
  Chip,
  Collapse,
  Container,
  Grid,
  Typography,
  Paper,
} from "@material-ui/core";
import {
  GetApp,
  GetAppOutlined,
  Publish,
  PublishOutlined,
  Sort,
  SortOutlined,
} from "@material-ui/icons";
import { FilterOutline, Filter, Pound } from "mdi-material-ui";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { characterSelectReducer } from "../../stores/reducers";
import { useInteractiveStyles } from "../../styles/interactive";
import { useLayoutStyles } from "../../styles/layout";
import { IStampInfo } from "../../types";
import { useCachedData, useLocalStorage } from "../../utils";
import { charaIcons } from "../../utils/resources";
import GridView from "./GridView";
import InfiniteScroll from "../subs/InfiniteScroll";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import { useCharaName } from "../../utils/i18n";

const ListCard: React.FC<{ data?: IStampInfo }> = GridView;

const StampList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const getCharaName = useCharaName();

  const [stampsCache] = useCachedData<IStampInfo>("stamps");

  const [stamps, setStamps] = useState<IStampInfo[]>([]);
  const [filteredCache, setFilteredCache] = useState<IStampInfo[]>([]);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
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
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:stamp")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container justify="space-between">
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
              value="check"
              selected={filterOpened}
              onChange={() => setFilterOpened((v) => !v)}
            >
              {filterOpened ? <Filter /> : <FilterOutline />}
              {filterOpened ? <Sort /> : <SortOutlined />}
            </ToggleButton>
          </Grid>
        </Grid>
        <br />
        <Collapse in={filterOpened}>
          <Paper className={interactiveClasses.container}>
            <Grid container direction="column" spacing={1}>
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justify="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:character.caption")}
                  </Typography>
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
                justify="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:stampType.caption")}
                  </Typography>
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
          </Paper>
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
      </Container>
    </Fragment>
  );
};

export default StampList;
