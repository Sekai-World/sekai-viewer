import {
  Badge,
  Chip,
  Collapse,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Switch,
  ToggleButton,
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
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { IHonorGroup, IHonorInfo } from "../../types.d";
import { useCachedData, useLocalStorage, useToggle } from "../../utils";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";
import GridView from "./GridView";
import DetailDialog from "./HonorDetailDialog";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";

type ViewGridType = "grid";

const ListCard: { [key: string]: React.FC<{ data?: IHonorInfo }> } = {
  grid: GridView,
};

function getPaginatedHonors(honors: IHonorInfo[], page: number, limit: number) {
  return honors.slice(limit * (page - 1), limit * page);
}

const HonorList = () => {
  const { t } = useTranslation();

  const [honorsCache] = useCachedData<IHonorInfo>("honors");
  const [honorGroups] = useCachedData<IHonorGroup>("honorGroups");

  const [honors, setHonors] = useState<IHonorInfo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHonor, setSelectedHonor] = useState<IHonorInfo>();
  const [isHonorGroupOnce, setIsHonorGroupOnce] = useState(false);

  const [viewGridType] = useState<ViewGridType>("grid");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [filterOpen, toggleFilterOpen] = useToggle(false);
  const [honorType, setHonorType] = useLocalStorage(
    "honor-list-filter-type",
    ""
  );
  const [filteredCache, setFilteredCache] = useState<IHonorInfo[]>([]);

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
    if (honorGroups?.length && honorsCache?.length) {
      let result = [...honorsCache];
      // do filter
      if (honorType) {
        const validGroupIds = honorGroups
          .filter((hg) => hg.honorType === honorType)
          .map((hg) => hg.id);
        result = result.filter((c) => validGroupIds.includes(c.groupId));
      }
      if (isHonorGroupOnce) {
        const groupIds = Array.from(
          new Set(result.map((elem) => elem.groupId))
        );
        result = groupIds.map(
          (id) => result.find((elem) => elem.groupId === id)!
        );
      }
      switch (sortBy) {
        case "id":
        case "seq":
          result = result.sort((a, b) =>
            sortType === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
          );
          break;
      }
      setFilteredCache(result);
      setHonors([]);
      setPage(0);
    }
  }, [honorGroups, honorType, honorsCache, isHonorGroupOnce, sortBy, sortType]);

  useLayoutEffect(() => {
    setHonors((honors) => [
      ...honors,
      ...getPaginatedHonors(filteredCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, filteredCache]);

  useLayoutEffect(() => {
    setIsReady(!!honorsCache?.length && !!honorGroups?.length);
  }, [honorsCache?.length, honorGroups?.length]);

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
    [filteredCache.length, isReady, lastQueryFin, limit, page]
  );

  return isReady && honorGroups && honorGroups.length ? (
    <Fragment>
      <TypographyHeader>{t("honor:page_title")}</TypographyHeader>
      <ContainerContent>
        <Grid
          container
          justifyContent="flex-end"
          style={{ marginBottom: "0.5rem" }}
        >
          <Badge color="secondary" variant="dot" invisible={!honorType}>
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
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={2}>
                  <TypographyCaption>
                    {t("filter:honorType.caption")}
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={10}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Chip
                        clickable
                        color={honorType === "" ? "primary" : "default"}
                        label={t("filter:not_set")}
                        onClick={() => {
                          setHonorType("");
                        }}
                      />
                    </Grid>
                    {Array.from(
                      new Set(honorGroups.map((hg) => hg.honorType))
                    ).map((hg) => (
                      <Grid key={hg} item>
                        <Chip
                          clickable
                          color={honorType === hg ? "primary" : "default"}
                          label={t(`honor:type.${hg}`)}
                          onClick={() => {
                            honorType === hg
                              ? setHonorType("")
                              : setHonorType(hg);
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
                <Grid item xs={12} md={2}>
                  <TypographyCaption>
                    {t("filter:sort.caption")}
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={10}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <FormControl>
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
                      <FormControl>
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
        <InfiniteScroll<IHonorInfo>
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
      <DetailDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        data={selectedHonor}
      />
    </Fragment>
  ) : (
    <div>Loading...</div>
  );
};

export default HonorList;
