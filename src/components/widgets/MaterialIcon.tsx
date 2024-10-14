import React, { useEffect, useState } from "react";
import Image from "mui-image";
import { Grid, Typography } from "@mui/material";
import { getRemoteAssetURL } from "../../utils";

const MaterialIcon: React.FC<{
  materialId: number;
  quantity: number;
  mini?: boolean;
  justify?: string;
}> = ({ materialId, quantity, mini, justify = "flex-end" }) => {
  const [materialImage, setMaterialImage] = useState("");

  useEffect(() => {
    if (materialId) {
      getRemoteAssetURL(
        `thumbnail/material_rip/material${materialId}.webp`,
        setMaterialImage,
        "minio"
      );
    }

    return () => {
      setMaterialImage("");
    };
  }, [materialId]);

  return (
    <Grid container direction="row" alignItems="center" spacing={1}>
      <Grid item xs={mini ? 4 : 12}>
        <Grid container justifyContent={justify}>
          <Grid item>
            <Image
              src={materialImage}
              alt={`material ${materialId}`}
              height={mini ? 32 : 64}
              width={mini ? 32 : 64}
              bgColor=""
              duration={0}
            ></Image>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={mini ? 8 : 12}>
        <Grid container justifyContent={justify}>
          <Grid item>
            {!Number.isNaN(Number(quantity)) ? (
              <Typography variant="body2">{quantity}</Typography>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MaterialIcon;
