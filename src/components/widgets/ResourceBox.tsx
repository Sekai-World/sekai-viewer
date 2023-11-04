import { Grid } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import Image from "mui-image";
import {
  IResourceBoxInfo,
  ICompactResourceBox,
  ICompactResourceBoxDetail,
  ResourceBoxDetail,
} from "../../types.d";
import { useCachedData, useCompactData } from "../../utils";
import CommonMaterialIcon from "./CommonMaterialIcon";
import MaterialIcon from "./MaterialIcon";
import DegreeImage from "./DegreeImage";
import Costume3DThumbnail from "./Costume3DThumbnail";
import { useRootStore } from "../../stores/root";

const ResourceBox: React.FC<{
  resourceBoxId: number;
  resourceBoxPurpose: string;
  justifyContent?: string;
}> = ({
  resourceBoxId,
  resourceBoxPurpose,
  justifyContent = "space-around",
}) => {
  const { region } = useRootStore();

  const [resourceBoxes] = useCachedData<IResourceBoxInfo>("resourceBoxes");
  const [compactResourceBoxDetails] =
    useCompactData<ICompactResourceBoxDetail>("compactResourceBoxDetails");

  const [resourceDetails, setResourceDetails] = useState<ResourceBoxDetail[]>();

  useEffect(() => {
    if (["tw", "kr"].includes(region)) {
      if (compactResourceBoxDetails && resourceBoxId) {

        const purposeIndex =
          compactResourceBoxDetails.__ENUM__.resourceBoxPurpose.indexOf(
            resourceBoxPurpose
          );

        const itemTypeIndexes: number[] = [];
        for (let i = 0; i < compactResourceBoxDetails.resourceBoxId.length; i++) {
          if (
            compactResourceBoxDetails.resourceBoxPurpose[i] === purposeIndex &&
            compactResourceBoxDetails.resourceBoxId[i] === resourceBoxId
          ) {
            itemTypeIndexes.push(i);
          }
        }

        setResourceDetails(
          itemTypeIndexes.reduce((details, index, i) => {
            details.push({
              resourceId: compactResourceBoxDetails.resourceId[index],
              resourceType: compactResourceBoxDetails.__ENUM__.resourceType[
                compactResourceBoxDetails.resourceType[index]
              ],
              resourceQuantity: compactResourceBoxDetails.resourceQuantity[index],
              resourceLevel: compactResourceBoxDetails.resourceLevel[index],
              resourceBoxId,
              resourceBoxPurpose,
              seq: ++i,
            });
            return details;
          }, [] as ResourceBoxDetail[])
        );
      }
    } else {
      if (resourceBoxes) {
        setResourceDetails(
          resourceBoxes.find(
            (elem) =>
              elem.id === resourceBoxId &&
              elem.resourceBoxPurpose === resourceBoxPurpose
          )?.details
        );
      }
    }
  }, [
    resourceBoxId,
    resourceBoxPurpose,
    resourceBoxes,
    region,
    compactResourceBoxDetails,
  ]);

  return !!resourceDetails?.length ? (
    <Fragment>
      <Grid
        container
        spacing={1}
        justifyContent={justifyContent}
        alignItems="center"
      >
        {resourceDetails.map((detail) => (
          <Grid item key={`${detail.resourceType}-${detail.resourceId}`}>
            {detail.resourceType === "material" ? (
              <MaterialIcon
                materialId={detail.resourceId!}
                quantity={detail.resourceQuantity}
                justify={justifyContent}
              />
            ) : detail.resourceType === "stamp" ? (
              <Image
                src={`${
                  import.meta.env.VITE_ASSET_DOMAIN_WW
                }/sekai-assets/stamp/stamp${String(detail.resourceId).padStart(
                  4,
                  "0"
                )}_rip/stamp${String(detail.resourceId).padStart(
                  4,
                  "0"
                )}/stamp${String(detail.resourceId).padStart(4, "0")}.png`}
                fit="contain"
                style={{ height: "100px", width: "100px" }}
                bgColor=""
                duration={0}
                key={detail.resourceId}
              />
            ) : detail.resourceType === "honor" ? (
              <DegreeImage
                style={{ width: "160px" }}
                honorId={detail.resourceId}
                key={detail.resourceId}
              />
            ) : detail.resourceType === "costume_3d" ? (
              <Costume3DThumbnail costumeId={detail.resourceId!} />
            ) : detail.resourceType !== "honor" ? (
              <CommonMaterialIcon
                materialName={detail.resourceType}
                materialId={detail.resourceId}
                quantity={detail.resourceQuantity}
                key={detail.resourceId}
                justify={justifyContent}
              />
            ) : null}
          </Grid>
        ))}
      </Grid>
    </Fragment>
  ) : null;
};

export default ResourceBox;
