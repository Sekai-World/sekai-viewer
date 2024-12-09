import { Chip, ChipProps } from "@mui/material";
import { Error } from "@mui/icons-material";
import React from "react";
import { useTranslation } from "react-i18next";

const SpoilerTag: React.FC<
  { releaseTime?: Date } & ChipProps
  // eslint-disable-next-line react/prop-types
> = ({ releaseTime, ...props }) => {
  const { t } = useTranslation();

  if (!releaseTime || new Date() < releaseTime) {
    return (
      <Chip
        {...props}
        color="secondary"
        label={t("common:spoiler")}
        icon={<Error />}
      />
    );
  }
  return null;
};

export default SpoilerTag;
