import React, { useEffect, useState, useMemo } from "react";
import Image, { ImageProps } from "mui-image";
import { getRemoteAssetURL, useCachedData, useServerRegion } from "../../utils";
import { ICheerfulCarnivalTeam, IEventInfo } from "../../types";

const CheerfulCarnivalTeamIcon: React.FC<
  ImageProps & {
    eventId: number;
    teamId: number;
  }
> = ({ eventId, teamId, ...props }) => {
  const [cheerfulCarnivalTeams] = useCachedData<ICheerfulCarnivalTeam>(
    "cheerfulCarnivalTeams"
  );
  const [events] = useCachedData<IEventInfo>("events");
  const [region] = useServerRegion();

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
        window.isChinaMainland ? "cn" : "ww",
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

  return <Image bgColor="" duration={0} {...imageProps} />;
};

export default CheerfulCarnivalTeamIcon;
