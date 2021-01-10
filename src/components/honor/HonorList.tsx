import {
  Button,
  ButtonGroup,
  Chip,
  Collapse,
  Container,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  Typography,
} from "@material-ui/core";
import { Sort, SortOutlined } from "@material-ui/icons";
import { Filter, FilterOutline } from "mdi-material-ui";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useInteractiveStyles } from "../../styles/interactive";
import { useLayoutStyles } from "../../styles/layout";
import { IHonorGroup, IHonorInfo } from "../../types";
import { useCachedData } from "../../utils";
import InfiniteScroll from "../subs/InfiniteScroll";
import GridView from "./GridView";
import DetailDialog from "./HonorDetailDialog";

interface Props {}

type ViewGridType = "grid";

const ListCard: { [key: string]: React.FC<{ data?: IHonorInfo }> } = {
  grid: GridView,
};

function getPaginatedHonors(honors: IHonorInfo[], page: number, limit: number) {
  return honors.slice(limit * (page - 1), limit * page);
}

const HonorList = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  const [honorsCache] = useCachedData<IHonorInfo>("honors");
  const [honorGroups] = useCachedData<IHonorGroup>("honorGroups");

  const [honors, setHonors] = useState<IHonorInfo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHonor, setSelectedHonor] = useState<IHonorInfo>();
  const [isHonorGroupOnce, setIsHonorGroupOnce] = useState(false);

  const [viewGridType] = useState<ViewGridType>(
    (localStorage.getItem("event-list-grid-view-type") ||
      "grid") as ViewGridType
  );
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
  const [honorType, setHonorType] = useState("");
  const [filteredCache, setFilteredCache] = useState<IHonorInfo[]>([]);

  useLayoutEffect(() => {
    document.title = t("title:honorList");
  }, [t]);

  useEffect(() => {
    if (honorsCache.length) {
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
      setFilteredCache(result);
      setHonors([]);
      setPage(0);
    }
  }, [setPage, honorsCache, honorType, honorGroups, isHonorGroupOnce]);

  useLayoutEffect(() => {
    setHonors((honors) => [
      ...honors,
      ...getPaginatedHonors(filteredCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, filteredCache]);

  useLayoutEffect(() => {
    setIsReady(Boolean(honorsCache.length));
  }, [honorsCache.length, setIsReady]);

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

  return isReady && honorGroups.length ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("honor:page_title")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container justify="flex-end">
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
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:honorType.caption")}
                  </Typography>
                </Grid>
                <Grid item container xs={12} md={10} spacing={1}>
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
                          setHonorType(hg);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isHonorGroupOnce}
                      onChange={() => setIsHonorGroupOnce((state) => !state)}
                    />
                  }
                  label={t("filter:honorType.group_only_once")}
                />
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
        <InfiniteScroll<IHonorInfo>
          ViewComponent={ListCard[viewGridType]}
          data={honors}
          callback={callback}
          gridSize={
            ({
              grid: {
                xs: 12,
                sm: 6,
                md: 4,
                lg: 3,
              },
            } as const)[viewGridType]
          }
          onComponentClick={(data) => {
            setSelectedHonor(data);
            setIsDialogOpen(true);
          }}
        />
      </Container>
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
