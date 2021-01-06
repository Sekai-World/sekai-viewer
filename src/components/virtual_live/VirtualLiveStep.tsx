import { Collapse, Container, Grid, Typography } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { VirtualLiveSetlist } from "../../types";
import VirtualLiveStepMC from "./VirtualLiveStepMC";
import VirtualLiveStepMusic from "./VirtualLiveStepMusic";

const VirtualLiveStep: React.FC<{
  data: VirtualLiveSetlist;
}> = ({ data }) => {
  const { t } = useTranslation();

  const [isCollapse, setIsCollapse] = useState(false);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} onClick={() => setIsCollapse(!isCollapse)}>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Typography variant="h6">
              {t("virtual_live:step." + data.virtualLiveSetlistType)}
            </Typography>
          </Grid>
          <Grid item>{isCollapse ? <ExpandLess /> : <ExpandMore />}</Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={isCollapse}>
          <Container>
            {data.virtualLiveSetlistType === "music" && (
              <VirtualLiveStepMusic data={data} />
            )}
            {data.virtualLiveSetlistType === "mc" && (
              <VirtualLiveStepMC data={data} />
            )}
          </Container>
        </Collapse>
      </Grid>
    </Grid>
  );
};

export default VirtualLiveStep;
