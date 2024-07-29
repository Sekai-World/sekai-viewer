import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
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
    <FlipClockCountdown
      to={endDate.toISOString()}
      labels={[
        t("common:countdown.day"),
        t("common:countdown.hour"),
        t("common:countdown.minute"),
        t("common:countdown.second"),
      ]}
      digitBlockStyle={{
        fontSize: "1.5rem",
        width: "2rem",
        height: "3rem",
      }}
    />
  );
};

export default Countdown;
