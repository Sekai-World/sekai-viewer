import { Grid, GridJustification } from "@material-ui/core";
import React, { Fragment, useEffect, useState } from "react";
import Image from "material-ui-image";
import { IResourceBoxInfo } from "../../types";
import { useCachedData } from "../../utils";
import CommonMaterialIcon from "./CommonMaterialIcon";
import MaterialIcon from "./MaterialIcon";

const ResourceBox: React.FC<{
  resourceBoxId: number;
  resourceBoxPurpose: string;
  justify?: GridJustification;
}> = ({ resourceBoxId, resourceBoxPurpose, justify = "space-around" }) => {
  const [resourceBoxes] = useCachedData<IResourceBoxInfo>("resourceBoxes");

  const [resource, setResource] = useState<IResourceBoxInfo>();

  useEffect(() => {
    if (resourceBoxes) {
      setResource(
        resourceBoxes.find(
          (elem) =>
            elem.id === resourceBoxId &&
            elem.resourceBoxPurpose === resourceBoxPurpose
        )!
      );
    }
  }, [resourceBoxId, resourceBoxPurpose, resourceBoxes]);

  return resource ? (
    <Fragment>
      <Grid container spacing={1} justify={justify}>
        {resource.details.map((detail) => (
          <Grid item key={`${detail.resourceType}-${detail.resourceBoxId}`}>
            {detail.resourceType === "material" ? (
              <MaterialIcon
                materialId={detail.resourceId!}
                quantity={detail.resourceQuantity}
              />
            ) : detail.resourceType === "stamp" ? (
              <Image
                src={`${
                  process.env.REACT_APP_ASSET_DOMAIN_WW
                }/file/sekai-assets/stamp/stamp${String(
                  detail.resourceId
                ).padStart(4, "0")}_rip/stamp${String(
                  detail.resourceId
                ).padStart(4, "0")}/stamp${String(detail.resourceId).padStart(
                  4,
                  "0"
                )}.png`}
                aspectRatio={1}
                style={{ height: "64px", width: "64px" }}
                color=""
              />
            ) : detail.resourceType !== "honor" ? (
              <CommonMaterialIcon
                materialName={detail.resourceType}
                materialId={detail.resourceId}
                quantity={detail.resourceQuantity}
              />
            ) : null}
          </Grid>
        ))}
      </Grid>
    </Fragment>
  ) : null;
};

export default ResourceBox;
