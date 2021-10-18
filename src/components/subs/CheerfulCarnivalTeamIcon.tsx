import React, { ReactNode, useEffect, useState } from "react";
import Image from "material-ui-image";
import { getRemoteAssetURL, useCachedData, useServerRegion } from "../../utils";
import { ICheerfulCarnivalTeam, IEventInfo } from "../../types";

interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "loading"> {
  animationDuration?: number;
  aspectRatio?: number;
  cover?: boolean;
  color?: string;
  disableError?: boolean;
  disableSpinner?: boolean;
  // disableTransition?: boolean;
  errorIcon?: ReactNode;
  iconContainerStyle?: object;
  imageStyle?: object;
  loading?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onLoad?: (event?: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event?: React.SyntheticEvent<HTMLImageElement>) => void;
  // src: string;
  style?: object;
}

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

  return <Image src={ccTeamLogo} color="" disableTransition {...props} />;
};

export default CheerfulCarnivalTeamIcon;
