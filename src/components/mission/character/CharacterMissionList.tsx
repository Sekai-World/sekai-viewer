import {
  Container,
  FormControl,
  Grid,
  InputLabel,
  Select,
  Typography,
  MenuItem,
} from "@material-ui/core";
import React, { useState, useEffect, Fragment, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../../../styles/layout";
import {
  CharacterMissionType,
  ICharacterMission,
  ICharaProfile,
} from "../../../types.d";
import { useCachedData } from "../../../utils";
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
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sortedCache, setSortedCache] = useState<ICharacterMission[]>([]);

  useEffect(() => {
    document.title = t("title:characterMissionList");
  }, [t]);

  useEffect(() => {
    if (characterMissionsCache && characterMissionsCache.length) {
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
    setIsReady(
      Boolean(characterMissionsCache && characterMissionsCache.length)
    );
  }, [setIsReady, characterMissionsCache]);

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

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:mission.main")} - {t("common:character")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid container spacing={1} justify="center">
          {characterProfiles && characterProfiles.length ? (
            <Fragment>
              <Grid item xs={12} md={4}>
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
                        <CharaNameTrans characterId={cp.characterId} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Fragment>
          ) : null}
          {Object.values(CharacterMissionType).length ? (
            <Fragment>
              <Grid item xs={12} md={4}>
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
      </Container>
      <Container className={layoutClasses.content} maxWidth="md">
        <InfiniteScroll<ICharacterMission>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={characterMissions}
          gridSize={
            ({
              grid: {
                xs: 12,
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
