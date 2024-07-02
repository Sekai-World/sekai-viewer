import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useCachedData, useLocalStorage, useToggle } from "../../utils";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";

import { useTranslation } from "react-i18next";
import { IGachaInfo } from "../../types.d";
import GridView from "./GridView";
import {
  Update,
  Publish,
  PublishOutlined,
  GetApp,
  GetAppOutlined,
  FilterAlt as Filter,
  FilterAltOutlined as FilterOutlined,
} from "@mui/icons-material";
import {
  Badge,
  Collapse,
  FormControl,
  Grid,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Pound from "~icons/mdi/pound";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";
import { useDebounce } from "use-debounce";

function getPaginatedGachas(gachas: IGachaInfo[], page: number, limit: number) {
  return gachas.slice(limit * (page - 1), limit * page);
}

const ListCard: React.FC<{ data?: IGachaInfo }> = GridView;

const GachaList: React.FC<unknown> = observer(() => {
  const { t } = useTranslation();
  const {
    settings: { isShowSpoiler },
    region,
  } = useRootStore();

  const [gachas, setGachas] = useState<IGachaInfo[]>([]);
  const [gachasCache] = useCachedData<IGachaInfo>("gachas");

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sortType, setSortType] = useLocalStorage<string>(
    "gacha-list-update-sort",
    "desc"
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "gacha-list-filter-sort-by",
    "startAt"
  );
  const [sortedCache, setSortedCache] = useState<IGachaInfo[]>([]);
  const [filterOpened, toggleFilterOpened] = useToggle(false);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [debouncedSearchTitle] = useDebounce(searchTitle, 500);

  useEffect(() => {
    document.title = t("title:gachaList");
  }, [t]);

  useEffect(() => {
    setGachas((gachas) => [
      ...gachas,
      ...getPaginatedGachas(sortedCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, sortedCache]);

  useEffect(() => {
    if (!gachasCache?.length) return;
    let sortedCache = [...gachasCache];
    if (region === "en") {
      // only show gacha after release (2021/12/7)
      sortedCache = sortedCache.filter((g) => g.endAt > 1638914400000);
    }
    if (!isShowSpoiler) {
      sortedCache = sortedCache.filter(
        (g) => g.startAt <= new Date().getTime()
      );
    }
    if (sortType === "desc") {
      sortedCache = sortedCache.sort(
        (a, b) => b[sortBy as "startAt"] - a[sortBy as "startAt"]
      );
    } else if (sortType === "asc") {
      sortedCache = sortedCache.sort(
        (a, b) => a[sortBy as "startAt"] - b[sortBy as "startAt"]
      );
    }
    if (debouncedSearchTitle) {
      sortedCache = sortedCache.filter((g) =>
        g.name.toLowerCase().includes(debouncedSearchTitle.toLowerCase())
      );
    }
    setSortedCache(sortedCache);
    setGachas([]);
    setPage(0);
  }, [
    debouncedSearchTitle,
    gachasCache,
    isShowSpoiler,
    region,
    sortBy,
    sortType,
  ]);

  useEffect(() => {
    setIsReady(!!gachasCache?.length);
  }, [gachasCache?.length]);

  const callback = useCallback(
    (
      entries: readonly IntersectionObserverEntry[],
      setHasMore: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (!isReady) return;
      if (
        entries[0].isIntersecting &&
        lastQueryFin &&
        (!sortedCache.length || sortedCache.length > page * limit)
      ) {
        setPage((page) => page + 1);
        setLastQueryFin(false);
      } else if (sortedCache.length && sortedCache.length <= page * limit) {
        setHasMore(false);
      }
    },
    [isReady, lastQueryFin, limit, page, sortedCache.length]
  );

  const handleUpdateSortType = useCallback(
    (_: any, sort: string) => {
      setSortType(sort || "asc");
    },
    [setSortType]
  );

  const handleUpdateSortBy = useCallback(
    (_: any, sort: string) => {
      setSortBy(sort || "id");
    },
    [setSortBy]
  );

  return (
    <Fragment>
      <TypographyHeader>{t("common:gacha")}</TypographyHeader>
      <ContainerContent>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Grid container spacing={1} style={{ marginBottom: "0.5rem" }}>
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
                  <ToggleButton value="startAt">
                    <Update />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Badge color="secondary" variant="dot" invisible={!searchTitle}>
              <ToggleButton
                value=""
                color="primary"
                selected={filterOpened}
                onClick={() => toggleFilterOpened()}
              >
                {filterOpened ? <Filter /> : <FilterOutlined />}
              </ToggleButton>
            </Badge>
          </Grid>
        </Grid>
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
                      onChange={(e) => setSearchTitle(e.target.value)}
                      sx={{ minWidth: "200px" }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </PaperContainer>
        </Collapse>
        <InfiniteScroll<IGachaInfo>
          ViewComponent={ListCard}
          callback={callback}
          data={gachas}
          gridSize={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
          }}
        />
      </ContainerContent>
    </Fragment>
  );
});

export default GachaList;
