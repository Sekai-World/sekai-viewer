import {
  Avatar,
  Button,
  ButtonGroup,
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
  Update,
} from "@material-ui/icons";
import { FilterOutline, Filter } from "mdi-material-ui";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { SettingContext } from "../../context";
import { characterSelectReducer } from "../../stores/reducers";
import { useInteractiveStyles } from "../../styles/interactive";
import { useLayoutStyles } from "../../styles/layout";
import { IStampInfo } from "../../types";
import { useCachedData, useCharaName, useRefState } from "../../utils";
import { charaIcons } from "../../utils/resources";
import GridView from "./GridView";
import InfiniteScroll from "../subs/InfiniteScroll";

const ListCard: React.FC<{ data?: IStampInfo }> = GridView;

const StampList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { contentTransMode } = useContext(SettingContext)!;
  const getCharaName = useCharaName(contentTransMode);

  const [stampsCache] = useCachedData<IStampInfo>("stamps");

  const [stamps, setStamps] = useState<IStampInfo[]>([]);
  const [filteredCache, filteredCacheRef, setFilteredCache] = useRefState<
    IStampInfo[]
  >([]);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
  const [updateSort, setUpdateSort] = useState<"asc" | "desc">("asc");
  const [characterSelected, dispatchCharacterSelected] = useReducer(
    characterSelectReducer,
    []
  );

  const [page, pageRef, setPage] = useRefState<number>(0);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

  const getPaginatedStamps = useCallback(
    (page: number, limit: number) => {
      return filteredCache.slice(limit * (page - 1), limit * page);
    },
    [filteredCache]
  );

  const callback = (
    entries: readonly IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!filteredCacheRef.current.length ||
        filteredCacheRef.current.length > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      filteredCacheRef.current.length &&
      filteredCacheRef.current.length <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    document.title = t("title:stampList");
  }, [t]);

  useEffect(() => {
    if (stampsCache.length) {
      let cache = stampsCache;
      if (characterSelected.length) {
        cache = stampsCache.filter((s) =>
          characterSelected.includes(s.characterId1)
        );
      } else {
        cache = stampsCache;
      }
      if (updateSort === "desc") {
        cache = cache.sort((a, b) => b.id - a.id);
      } else if (updateSort === "asc") {
        cache = cache.sort((a, b) => a.id - b.id);
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
    updateSort,
  ]);

  useEffect(() => {
    setStamps((stamps) => [...stamps, ...getPaginatedStamps(page, limit)]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, stampsCache, getPaginatedStamps]);

  useEffect(() => {
    setIsReady(Boolean(stampsCache.length));
  }, [setIsReady, stampsCache]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:stamp")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container justify="space-between">
          <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
            <Button size="medium" onClick={() => setUpdateSort("asc")}>
              <Update />
              {updateSort === "asc" ? <Publish /> : <PublishOutlined />}
            </Button>
            <Button size="medium" onClick={() => setUpdateSort("desc")}>
              <Update />
              {updateSort === "desc" ? <GetApp /> : <GetAppOutlined />}
            </Button>
          </ButtonGroup>
          <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
            <Button size="medium" onClick={() => setFilterOpened((v) => !v)}>
              {filterOpened ? <Filter /> : <FilterOutline />}
              {filterOpened ? <Sort /> : <SortOutlined />}
            </Button>
          </ButtonGroup>
        </Grid>
        <Collapse in={filterOpened}>
          <Paper className={interactiveClasses.container}>
            <Grid container direction="column" spacing={1}>
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justify="space-between"
              >
                <Grid item xs={12} md={2}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:character.caption")}
                  </Typography>
                </Grid>
                <Grid item container xs={12} md={9} spacing={1}>
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
                              charaIcons[`CharaIcon${idx + 1}` as "CharaIcon1"]
                            }
                          />
                        }
                        label={getCharaName(idx + 1)}
                        onClick={() => {
                          if (characterSelected.includes(idx + 1)) {
                            dispatchCharacterSelected({
                              type: "remove",
                              payload: idx + 1,
                            });
                          } else {
                            dispatchCharacterSelected({
                              type: "add",
                              payload: idx + 1,
                            });
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
        {InfiniteScroll<IStampInfo>({
          ViewComponent: ListCard,
          callback,
          data: stamps,
          gridSize: {
            xs: 4,
            sm: 3,
            md: 3,
            lg: 2,
          },
        })}
      </Container>
    </Fragment>
  );
};

export default StampList;
