import {
  Container,
  FormControl,
  Grid,
  InputLabel,
  Select,
  Typography,
  MenuItem,
} from "@material-ui/core";
import React, { useState, useEffect, Fragment, useContext } from "react";
import { useTranslation } from "react-i18next";
import { SettingContext } from "../../../context";
import { useLayoutStyles } from "../../../styles/layout";
import {
  CharacterMissionType,
  ICharacterMission,
  ICharaProfile,
} from "../../../types.d";
import { useCachedData, useRefState } from "../../../utils";
import { CharaNameTrans } from "../../subs/ContentTrans";
import InfiniteScroll from "../../subs/InfiniteScroll";
import GridView from "./GridView";

type ViewGridType = "grid" | "agenda" | "comfy";

const ListCard: { [key: string]: React.FC<{ data?: ICharacterMission }> } = {
  grid: GridView,
};

function getPaginatedHonorMissions(
  events: ICharacterMission[],
  page: number,
  limit: number
) {
  return events.slice(limit * (page - 1), limit * page);
}

const CharacterMissionList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { contentTransMode } = useContext(SettingContext)!;

  const [characterMissionsCache] = useCachedData<ICharacterMission>(
    "characterMissions"
  );
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");

  const [characterMissions, setNormalMissions] = useState<ICharacterMission[]>(
    []
  );
  const [charaId, setCharaId] = useState<number>(1);
  const [missionType, setMissionType] = useState<string>("play_live");

  const [viewGridType] = useState<ViewGridType>(
    (localStorage.getItem("event-list-grid-view-type") ||
      "grid") as ViewGridType
  );
  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);
  const [sortedCache, sortedCacheRef, setSortedCache] = useRefState<
    ICharacterMission[]
  >([]);

  useEffect(() => {
    document.title = t("title:characterMissionList");
  }, [t]);

  useEffect(() => {
    if (characterMissionsCache.length) {
      let result = [...characterMissionsCache];
      // do filter
      result = result.filter((c) => c.characterId === charaId);
      result = result.filter((c) => c.characterMissionType === missionType);
      setSortedCache(result);
      setNormalMissions([]);
      setPage(0);
    }
  }, [characterMissionsCache, setPage, setSortedCache, missionType, charaId]);

  useEffect(() => {
    setNormalMissions((events) => [
      ...events,
      ...getPaginatedHonorMissions(sortedCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, sortedCache]);

  useEffect(() => {
    setIsReady(Boolean(characterMissionsCache.length));
  }, [setIsReady, characterMissionsCache]);

  const callback = (
    entries: readonly IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!sortedCacheRef.current.length ||
        sortedCacheRef.current.length > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      sortedCacheRef.current.length &&
      sortedCacheRef.current.length <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:mission.main")} - {t("common:mission.livepass")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="lg">
        <Grid container spacing={1}>
          {characterProfiles.length ? (
            <Fragment>
              <Grid item xs={12} md={3}>
                <FormControl style={{ width: "100%" }}>
                  <InputLabel id="select-chara-name">
                    {t("mission:select.charaName")}
                  </InputLabel>
                  <Select
                    labelId="select-chara-name"
                    value={charaId}
                    onChange={(e) => {
                      setCharaId(e.target.value as number);
                    }}
                  >
                    {characterProfiles.map((cp) => (
                      <MenuItem value={cp.characterId} key={cp.characterId}>
                        <CharaNameTrans
                          mode={contentTransMode}
                          characterId={cp.characterId}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Fragment>
          ) : null}
          {Object.values(CharacterMissionType).length ? (
            <Fragment>
              <Grid item xs={12} md={3}>
                <FormControl style={{ width: "100%" }}>
                  <InputLabel id="select-chara-name">
                    {t("mission:type.caption")}
                  </InputLabel>
                  <Select
                    labelId="select-mission-type"
                    value={missionType}
                    onChange={(e) => {
                      setMissionType(e.target.value as string);
                    }}
                  >
                    {Object.values(CharacterMissionType).map((cmt) => (
                      <MenuItem value={cmt} key={cmt}>
                        <Typography>{t(`mission:type.${cmt}`)}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Fragment>
          ) : null}
        </Grid>
        <InfiniteScroll<ICharacterMission>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={characterMissions}
          gridSize={
            ({
              grid: {
                xs: 12,
                md: 6,
              },
              agenda: {
                xs: 12,
              },
              comfy: {
                xs: 12,
              },
            } as const)[viewGridType]
          }
        />
      </Container>
    </Fragment>
  );
};

export default CharacterMissionList;
