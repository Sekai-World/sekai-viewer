import React, { Fragment } from "react";

import material1Icon from "../../assets/common/material/material1.webp";
import material2Icon from "../../assets/common/material/material2.webp";
import material3Icon from "../../assets/common/material/material3.webp";
import material4Icon from "../../assets/common/material/material4.webp";
import material5Icon from "../../assets/common/material/material5.webp";
import material6Icon from "../../assets/common/material/material6.webp";
import material7Icon from "../../assets/common/material/material7.webp";
import material8Icon from "../../assets/common/material/material8.webp";
import material9Icon from "../../assets/common/material/material9.webp";
import material10Icon from "../../assets/common/material/material10.webp";
import material11Icon from "../../assets/common/material/material11.webp";
import material12Icon from "../../assets/common/material/material12.webp";
import material13Icon from "../../assets/common/material/material13.webp";
import material14Icon from "../../assets/common/material/material14.webp";
import material15Icon from "../../assets/common/material/material15.webp";
import material16Icon from "../../assets/common/material/material16.webp";
import material17Icon from "../../assets/common/material/material17.webp";
import material18Icon from "../../assets/common/material/material18.webp";
import material19Icon from "../../assets/common/material/material19.webp";
import material20Icon from "../../assets/common/material/material20.webp";
import material21Icon from "../../assets/common/material/material21.webp";
import material22Icon from "../../assets/common/material/material22.webp";
import material23Icon from "../../assets/common/material/material23.webp";
import material24Icon from "../../assets/common/material/material24.webp";
import material25Icon from "../../assets/common/material/material25.webp";
import material26Icon from "../../assets/common/material/material26.webp";
import material27Icon from "../../assets/common/material/material27.webp";
import material28Icon from "../../assets/common/material/material28.webp";
import material29Icon from "../../assets/common/material/material29.webp";
import material30Icon from "../../assets/common/material/material30.webp";
import material31Icon from "../../assets/common/material/material31.webp";
import material32Icon from "../../assets/common/material/material32.webp";
import material33Icon from "../../assets/common/material/material33.webp";
import material34Icon from "../../assets/common/material/material34.webp";
import material35Icon from "../../assets/common/material/material35.webp";
import material36Icon from "../../assets/common/material/material36.webp";
import material37Icon from "../../assets/common/material/material37.webp";
import material38Icon from "../../assets/common/material/material38.webp";
import material39Icon from "../../assets/common/material/material39.webp";
import material40Icon from "../../assets/common/material/material40.webp";
import material41Icon from "../../assets/common/material/material41.webp";
import material42Icon from "../../assets/common/material/material42.webp";
import material43Icon from "../../assets/common/material/material43.webp";
import material44Icon from "../../assets/common/material/material44.webp";
import { Typography } from "@material-ui/core";

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

const MaterialIcon: React.FC<{ materialId: number; quantity: number }> = ({
  materialId,
  quantity,
}) => (
  <Fragment>
    <div>
      <img
        src={materialMap[materialId]}
        alt={`material ${materialId}`}
        style={{ maxHeight: "64px" }}
      ></img>
    </div>
    <Typography variant="body2" align="center">
      x {quantity}
    </Typography>
  </Fragment>
);

export default MaterialIcon;
