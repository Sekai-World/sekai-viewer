import React, { useEffect, useState, useMemo } from "react";
import Image, { ImageProps } from "mui-image";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { ICheerfulCarnivalTeam, IEventInfo } from "../../types.d";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";

const CheerfulCarnivalTeamIcon: React.FC<
  Omit<ImageProps, "src"> & {
    src?: string;
    eventId: number;
    teamId: number;
  }
> = observer(({ eventId, teamId, ...props }) => {
  const [cheerfulCarnivalTeams] = useCachedData<ICheerfulCarnivalTeam>(
    "cheerfulCarnivalTeams"
  );
  const [events] = useCachedData<IEventInfo>("events");
  const { region } = useRootStore();

  const [ccTeam, setCcTeam] = useState<ICheerfulCarnivalTeam>();
  const [ccTeamLogo, setCcTeamLogo] = useState<string>("");
  const [event, setEvent] = useState<IEventInfo>();

  useEffect(() => {
    if (events) {
      setEvent(events.find((elem) => elem.id === Number(eventId)));
    }
    return () => {
      setEvent(undefined);
    };
  }, [eventId, events]);

  useEffect(() => {
    if (cheerfulCarnivalTeams) {
      setCcTeam(cheerfulCarnivalTeams.find((cct) => cct.id === teamId));
    }
    return () => {
      setCcTeam(undefined);
    };
  }, [cheerfulCarnivalTeams, eventId, teamId]);

  useEffect(() => {
    if (!!event && !!ccTeam) {
      getRemoteAssetURL(
        `event/${event.assetbundleName}/team_image_rip/${ccTeam.assetbundleName}.webp`,
        setCcTeamLogo,
        "minio",
        region
      );
    }
    return () => {
      setCcTeamLogo("");
    };
  }, [ccTeam, cheerfulCarnivalTeams, event, region]);

  const imageProps = useMemo(
    () => Object.assign({}, props, { src: ccTeamLogo }),
    [ccTeamLogo, props]
  );

  return (
    <Image
      bgColor=""
      duration={0}
      fit="contain"
      {...imageProps}
    />
  );
});

export default CheerfulCarnivalTeamIcon;
