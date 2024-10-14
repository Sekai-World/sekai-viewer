import { Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import Image from "mui-image";
import { getRemoteAssetURL, useCachedData } from "../../utils";

import { IBoostItem, IGachaTicket, ISkillPracticeTicket } from "../../types";

const BoostItemIcon: React.FC<{
  id: number;
  height?: number;
  width?: number;
}> = ({ id, height = 64, width = 64 }) => {
  const [boostItems] = useCachedData<IBoostItem>("boostItems");

  const [boostItem, setBoostItem] = useState<IBoostItem>();
  const [materialImage, setMaterialImage] = useState("");

  useEffect(() => {
    if (boostItems) {
      setBoostItem(boostItems.find((bi) => bi.id === id));
    }

    return () => {
      setBoostItem(undefined);
    };
  }, [boostItems, id]);

  useEffect(() => {
    if (boostItem) {
      getRemoteAssetURL(
        `thumbnail/boost_item_rip/boost_item${boostItem.id}.webp`,
        setMaterialImage,
        "minio"
      );
    }

    return () => {
      setMaterialImage("");
    };
  }, [boostItem]);

  return (
    !!boostItem && (
      <Image
        src={materialImage}
        alt={boostItem.flavorText}
        height={height}
        width={width}
        bgColor=""
        duration={0}
      />
    )
  );
};

const GachaTicketIcon: React.FC<{
  id: number;
  height?: number;
  width?: number;
}> = ({ id, height = 64, width = 64 }) => {
  const [gachaTickets] = useCachedData<IGachaTicket>("gachaTickets");

  const [gachaTicket, setGachaTicket] = useState<IGachaTicket>();
  const [materialImage, setMaterialImage] = useState("");

  useEffect(() => {
    if (gachaTickets) {
      setGachaTicket(gachaTickets.find((gt) => gt.id === id));
    }

    return () => {
      setGachaTicket(undefined);
    };
  }, [gachaTickets, id]);

  useEffect(() => {
    if (gachaTicket) {
      getRemoteAssetURL(
        `thumbnail/gacha_ticket_rip/${gachaTicket.assetbundleName}.webp`,
        setMaterialImage,
        "minio"
      );
    }

    return () => {
      setMaterialImage("");
    };
  }, [gachaTicket]);

  return (
    !!gachaTicket && (
      <Image
        src={materialImage}
        alt={gachaTicket.name}
        height={height}
        width={width}
        bgColor=""
        duration={0}
      />
    )
  );
};

const SkillPracticeTicketIcon: React.FC<{
  id: number;
  height?: number;
  width?: number;
}> = ({ id, height = 64, width = 64 }) => {
  const [skillPracticeTickets] = useCachedData<ISkillPracticeTicket>(
    "skillPracticeTickets"
  );

  const [skillPracticeTicket, setSkillPracticeTicket] =
    useState<ISkillPracticeTicket>();
  const [materialImage, setMaterialImage] = useState("");

  useEffect(() => {
    if (skillPracticeTickets) {
      setSkillPracticeTicket(skillPracticeTickets.find((spt) => spt.id === id));
    }

    return () => {
      setSkillPracticeTicket(undefined);
    };
  }, [id, skillPracticeTickets]);

  useEffect(() => {
    if (skillPracticeTicket) {
      getRemoteAssetURL(
        `thumbnail/skill_practice_ticket_rip/ticket${skillPracticeTicket.id}.webp`,
        setMaterialImage,
        "minio"
      );
    }

    return () => {
      setMaterialImage("");
    };
  }, [skillPracticeTicket]);

  return (
    !!skillPracticeTicket && (
      <Image
        src={materialImage}
        alt={skillPracticeTicket.flavorText}
        height={height}
        width={width}
        bgColor=""
        duration={0}
      />
    )
  );
};

const CommonMaterialIcon: React.FC<{
  materialName: string;
  materialId?: number;
  quantity?: number | string;
  mini?: boolean;
  justify?: string;
  spacing?: number;
  maxWidth?: number | string;
}> = ({
  materialName,
  materialId,
  quantity,
  mini = false,
  justify = "center",
  spacing = 1,
  maxWidth,
}) => {
  const [materialImage, setMaterialImage] = useState("");

  useEffect(() => {
    switch (materialName) {
      case "ad_reward_random_box":
        getRemoteAssetURL(
          `thumbnail/ad_reward_rip/ad_reward${String(materialId).padStart(4, "0")}.webp`,
          setMaterialImage,
          "minio"
        );
        break;
      case "coin":
      case "ingamevoice":
      case "jewel":
      case "live_point":
      case "slot":
      case "virtual_coin":
        getRemoteAssetURL(
          `thumbnail/common_material_rip/${materialName}.webp`,
          setMaterialImage,
          "minio"
        );
        break;
      case "paid_jewel":
        getRemoteAssetURL(
          `thumbnail/common_material_rip/jewel.webp`,
          setMaterialImage,
          "minio"
        );
        break;
      case "honor":
        getRemoteAssetURL(
          `thumbnail/common_material_rip/honor_${materialId}.webp`,
          setMaterialImage,
          "minio"
        );
        break;
    }

    return () => {
      setMaterialImage("");
    };
  }, [materialId, materialName]);

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      spacing={spacing}
      sx={{ maxWidth }}
    >
      <Grid item xs={mini ? 4 : 12}>
        <Grid container justifyContent={justify}>
          <Grid item>
            {!!materialImage && (
              <Image
                src={materialImage}
                alt={`material ${materialName} ${materialId}`}
                height={mini ? 32 : 64}
                width={mini ? 32 : 64}
                bgColor=""
                duration={0}
              />
            )}
            {materialName === "skill_practice_ticket" && !!materialId && (
              <SkillPracticeTicketIcon
                id={materialId}
                width={mini ? 32 : 64}
                height={mini ? 32 : 64}
              />
            )}
            {materialName === "gacha_ticket" && !!materialId && (
              <GachaTicketIcon
                id={materialId}
                width={mini ? 32 : 64}
                height={mini ? 32 : 64}
              />
            )}
            {materialName === "boost_item" && !!materialId && (
              <BoostItemIcon
                id={materialId}
                width={mini ? 32 : 64}
                height={mini ? 32 : 64}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
      {(typeof quantity === "string" || !Number.isNaN(Number(quantity))) && (
        <Grid item xs={mini ? 8 : 12}>
          <Grid container direction="column" alignItems={justify}>
            <Grid item>
              <Typography variant="body2">{quantity}</Typography>
            </Grid>
            {materialName === "paid_jewel" && (
              <Grid item>
                <Typography variant="body2">(paid)</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default CommonMaterialIcon;
