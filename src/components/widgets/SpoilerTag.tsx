import { Chip } from "@mui/material";
import { Error } from "@mui/icons-material";
import React from "react";
import { useTranslation } from "react-i18next";

const SpoilerTag: React.FC<
  { releaseTime: Date } & React.StyleHTMLAttributes<HTMLDivElement>
> = ({ releaseTime, style }) => {
  const { t } = useTranslation();

  return new Date() < releaseTime ? (
    <Chip
      style={style}
      color="secondary"
      label={t("common:spoiler")}
      icon={<Error />}
    />
  ) : null;
};

export default SpoilerTag;
