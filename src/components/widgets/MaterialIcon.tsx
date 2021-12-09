import React from "react";
import Image from "mui-image";

import material1Icon from "../../assets/common/material/material1.png";
import material2Icon from "../../assets/common/material/material2.png";
import material3Icon from "../../assets/common/material/material3.png";
import material4Icon from "../../assets/common/material/material4.png";
import material5Icon from "../../assets/common/material/material5.png";
import material6Icon from "../../assets/common/material/material6.png";
import material7Icon from "../../assets/common/material/material7.png";
import material8Icon from "../../assets/common/material/material8.png";
import material9Icon from "../../assets/common/material/material9.png";
import material10Icon from "../../assets/common/material/material10.png";
import material11Icon from "../../assets/common/material/material11.png";
import material12Icon from "../../assets/common/material/material12.png";
import material13Icon from "../../assets/common/material/material13.png";
import material14Icon from "../../assets/common/material/material14.png";
import material15Icon from "../../assets/common/material/material15.png";
import material16Icon from "../../assets/common/material/material16.png";
import material17Icon from "../../assets/common/material/material17.png";
import material18Icon from "../../assets/common/material/material18.png";
import material19Icon from "../../assets/common/material/material19.png";
import material20Icon from "../../assets/common/material/material20.png";
import material21Icon from "../../assets/common/material/material21.png";
import material22Icon from "../../assets/common/material/material22.png";
import material23Icon from "../../assets/common/material/material23.png";
import material24Icon from "../../assets/common/material/material24.png";
import material25Icon from "../../assets/common/material/material25.png";
import material26Icon from "../../assets/common/material/material26.png";
import material27Icon from "../../assets/common/material/material27.png";
import material28Icon from "../../assets/common/material/material28.png";
import material29Icon from "../../assets/common/material/material29.png";
import material30Icon from "../../assets/common/material/material30.png";
import material31Icon from "../../assets/common/material/material31.png";
import material32Icon from "../../assets/common/material/material32.png";
import material33Icon from "../../assets/common/material/material33.png";
import material34Icon from "../../assets/common/material/material34.png";
import material35Icon from "../../assets/common/material/material35.png";
import material36Icon from "../../assets/common/material/material36.png";
import material37Icon from "../../assets/common/material/material37.png";
import material38Icon from "../../assets/common/material/material38.png";
import material39Icon from "../../assets/common/material/material39.png";
import material40Icon from "../../assets/common/material/material40.png";
import material41Icon from "../../assets/common/material/material41.png";
import material42Icon from "../../assets/common/material/material42.png";
import material43Icon from "../../assets/common/material/material43.png";
import material44Icon from "../../assets/common/material/material44.png";
import { Grid, Typography } from "@mui/material";

const materialMap = [
  "",
  material1Icon,
  material2Icon,
  material3Icon,
  material4Icon,
  material5Icon,
  material6Icon,
  material7Icon,
  material8Icon,
  material9Icon,
  material10Icon,
  material11Icon,
  material12Icon,
  material13Icon,
  material14Icon,
  material15Icon,
  material16Icon,
  material17Icon,
  material18Icon,
  material19Icon,
  material20Icon,
  material21Icon,
  material22Icon,
  material23Icon,
  material24Icon,
  material25Icon,
  material26Icon,
  material27Icon,
  material28Icon,
  material29Icon,
  material30Icon,
  material31Icon,
  material32Icon,
  material33Icon,
  material34Icon,
  material35Icon,
  material36Icon,
  material37Icon,
  material38Icon,
  material39Icon,
  material40Icon,
  material41Icon,
  material42Icon,
  material43Icon,
  material44Icon,
];

const MaterialIcon: React.FC<{
  materialId: number;
  quantity: number;
  mini?: boolean;
}> = ({ materialId, quantity, mini }) => (
  <Grid container direction="row" alignItems="center" spacing={1}>
    <Grid item xs={mini ? 4 : 12}>
      <Grid container justifyContent="flex-end">
        <Grid item>
          <Image
            src={materialMap[materialId]}
            alt={`material ${materialId}`}
            // aspectRatio={1}
            style={{
              height: mini ? "32px" : "64px",
              width: mini ? "32px" : "64px",
            }}
            bgColor=""
            duration={0}
          ></Image>
        </Grid>
      </Grid>
    </Grid>
    <Grid item xs={mini ? 8 : 12}>
      <Grid container justifyContent="flex-end">
        <Grid item>
          {!Number.isNaN(Number(quantity)) ? (
            <Typography variant="body2">{quantity}</Typography>
          ) : null}
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

export default MaterialIcon;
