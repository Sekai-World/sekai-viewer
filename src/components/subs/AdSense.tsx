import { Adsense } from "@ctrl/react-adsense";
import React, { useContext, useMemo } from "react";
import { UserContext } from "../../context";

type Props = {
  className?: string;
  style?: React.CSSProperties;
  client: string;
  slot: string;
  layout?: string;
  layoutKey?: string;
  format?: string;
  responsive?: string;
  pageLevelAds?: boolean;
};

const AdSense = (props: Props) => {
  const { user } = useContext(UserContext)!;

  const noAdRoles = useMemo(
    () => ["translator", "admin", "patreon", "developer"],
    []
  );

  return user && noAdRoles.includes(user.role.type) ? null : (
    <Adsense {...props} />
  );
};

export default AdSense;
