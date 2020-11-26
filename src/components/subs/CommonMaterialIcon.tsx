import { Typography } from "@material-ui/core";
import React, { Fragment } from "react";

import coinIcon from "../../assets/common/material/coin.png";
import honor1Icon from "../../assets/common/material/honor_1.png";
import honor2Icon from "../../assets/common/material/honor_2.png";
import honor3Icon from "../../assets/common/material/honor_3.png";
import honor4Icon from "../../assets/common/material/honor_4.png";
import jewelIcon from "../../assets/common/material/jewel.png";
import livePointIcon from "../../assets/common/material/live_point.png";
import slotIcon from "../../assets/common/material/slot.png";
import virtualCoinIcon from "../../assets/common/material/virtual_coin.png";

const materialMap = {
  coin: coinIcon,
  honor: ["", honor1Icon, honor2Icon, honor3Icon, honor4Icon],
  jewel: jewelIcon,
  live_point: livePointIcon,
  slot: slotIcon,
  virtual_coin: virtualCoinIcon,
};

const CommonMaterialIcon: React.FC<{
  materialName: string;
  materialId?: number;
  quantity?: number;
}> = ({ materialName, materialId, quantity }) => (
  <Fragment>
    <div>
      <img
        src={
          materialId
            ? materialMap[materialName as "honor"][materialId]
            : materialMap[materialName as "coin"]
        }
        alt={`material ${materialName} ${materialId}`}
        style={{ maxHeight: "64px" }}
      ></img>
    </div>
    {quantity ? (
      <Typography variant="body2" align="center">
        x {quantity}
      </Typography>
    ) : null}
  </Fragment>
);

export default CommonMaterialIcon;
