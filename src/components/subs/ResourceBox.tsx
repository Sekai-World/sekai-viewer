import { Grid, GridJustification } from "@material-ui/core";
import React, { Fragment, useEffect, useState } from "react";
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
    if (resourceBoxes.length) {
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
          <Grid item>
            {detail.resourceType === "material" ? (
              <MaterialIcon
                materialId={detail.resourceId!}
                quantity={detail.resourceQuantity}
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
