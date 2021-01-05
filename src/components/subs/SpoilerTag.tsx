import { Chip } from "@material-ui/core";
import { Error } from "@material-ui/icons";
import React from "react";
import { useTranslation } from "react-i18next";

const SpoilerTag: React.FC<{ releaseTime: Date }> = ({ releaseTime }) => {
  const { t } = useTranslation();

  return new Date() < releaseTime ? (
    <Chip color="secondary" label={t("common:spoiler")} icon={<Error />} />
  ) : null;
};

export default SpoilerTag;
