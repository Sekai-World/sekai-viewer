import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  CardMedia,
  Chip,
  Collapse,
  Container,
  Grid,
  Link,
  makeStyles,
  Typography,
  Paper,
} from "@material-ui/core";
import { Sort, SortOutlined } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { FilterOutline, Filter } from "mdi-material-ui";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { characterSelectReducer } from "../stores/reducers";
import { useInteractiveStyles } from "../styles/interactive";
import { useLayoutStyles } from "../styles/layout";
import { ContentTransModeType, IStampInfo } from "../types";
import { useCachedData, useCharaName, useRefState } from "../utils";
import { charaIcons } from "../utils/resources";
import InfiniteScroll from "./subs/InfiniteScroll";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "75%",
    backgroundSize: "contain",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  subheader: {
    "white-space": "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis",
    "max-width": "260px",
  },
}));

const StampList: React.FC<{
  contentTransMode: ContentTransModeType;
}> = ({ contentTransMode }) => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const getCharaName = useCharaName(contentTransMode);

  const [stampsCache] = useCachedData<IStampInfo>("stamps");

  const [stamps, setStamps] = useState<IStampInfo[]>([]);
  const [filteredCache, filteredCacheRef, setFilteredCache] = useRefState<
    IStampInfo[]
  >([]);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
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
    entries: IntersectionObserverEntry[],
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
      if (characterSelected.length) {
        const filtered = stampsCache.filter((s) =>
          characterSelected.includes(s.characterId1)
        );
        setFilteredCache(filtered);
      } else {
        setFilteredCache(stampsCache);
      }
      setStamps([]);
      setPage(0);
    }
  }, [characterSelected, stampsCache, setStamps, setPage, setFilteredCache]);

  useEffect(() => {
    setStamps((stamps) => [...stamps, ...getPaginatedStamps(page, limit)]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, stampsCache, getPaginatedStamps]);

  useEffect(() => {
    setIsReady(Boolean(stampsCache.length));
  }, [setIsReady, stampsCache]);

  const ListCard: React.FC<{ data?: IStampInfo }> = ({ data }) => {
    if (!data) {
      // loading
      return (
        <Card className={classes.card}>
          <Skeleton variant="rect" className={classes.media}></Skeleton>
          {/* <CardContent>
            <Typography variant="subtitle1" className={classes.subheader}>
              <Skeleton variant="text" width="90%"></Skeleton>
            </Typography>
          </CardContent> */}
        </Card>
      );
    }
    return (
      <Link
        href={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/stamp/${data.assetbundleName}_rip/${data.assetbundleName}/${data.assetbundleName}.webp`}
        target="_blank"
        style={{ textDecoration: "none" }}
      >
        <Card className={classes.card}>
          <CardMedia
            className={classes.media}
            image={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/stamp/${data.assetbundleName}_rip/${data.assetbundleName}/${data.assetbundleName}.webp`}
            title={data.name}
          ></CardMedia>
          {/* <CardContent style={{ paddingBottom: "16px" }}>
            <Typography variant="subtitle1" className={classes.subheader}>
              {data.name}
            </Typography>
          </CardContent> */}
        </Card>
      </Link>
    );
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:stamp")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
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
          viewComponent: ListCard,
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
