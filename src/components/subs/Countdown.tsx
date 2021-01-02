import FlipCountdown from "@sekai-world/react-flip-countdown";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";

const Countdown: React.FC<React.PropsWithChildren<{ endDate: Date }>> = ({
  children,
  endDate,
}) => {
  const { t } = useTranslation();

  return new Date() > endDate ? (
    <Fragment>{children}</Fragment>
  ) : (
    // @ts-ignore
    <FlipCountdown
      endAt={endDate.toISOString()}
      hideYear
      hideMonth
      // titlePosition="bottom"
      dayTitle={t("common:countdown.day")}
      hourTitle={t("common:countdown.hour")}
      minuteTitle={t("common:countdown.minute")}
      secondTitle={t("common:countdown.second")}
    />
  );
};

export default Countdown;
