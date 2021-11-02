import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import React from "react";
import { useTranslation } from "react-i18next";
import { VirtualLiveSetlist } from "../../types";
import VirtualLiveStepMC from "./VirtualLiveStepMC";
import VirtualLiveStepMusic from "./VirtualLiveStepMusic";

const VirtualLiveStep: React.FC<{
  data: VirtualLiveSetlist;
}> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>
          {t("virtual_live:step." + data.virtualLiveSetlistType)}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {data.virtualLiveSetlistType === "music" && (
          <VirtualLiveStepMusic data={data} />
        )}
        {data.virtualLiveSetlistType === "mc" && (
          <VirtualLiveStepMC data={data} />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default VirtualLiveStep;
