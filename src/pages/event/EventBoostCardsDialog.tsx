import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import rarityNormal from "../../assets/rarity_star_normal.png";
import { ICardInfo } from "../../types";
import { cardRarityTypeToRarity } from "../../utils";
import { attrIconMap } from "../../utils/resources";
import LinkNoDecoration from "../../components/styled/LinkNoDecoration";
import { CardThumb } from "../../components/widgets/CardThumb";

export interface IBoostCardItem {
  card: ICardInfo;
  minBonus: number;
  maxBonus: number;
}

interface IEventBoostCardsDialogProps {
  open: boolean;
  onClose: () => void;
  boostCards: IBoostCardItem[];
  defaultAttribute?: string;
}

const ATTRIBUTES = ["cool", "cute", "happy", "mysterious", "pure"];
const INITIAL_RENDER_COUNT = 48;
const RENDER_CHUNK_SIZE = 24;

const EventBoostCardsDialog: React.FC<IEventBoostCardsDialogProps> = ({
  open,
  onClose,
  boostCards,
  defaultAttribute,
}) => {
  const { t } = useTranslation();
  const [attribute, setAttribute] = useState(defaultAttribute ?? "all");
  const [rarity, setRarity] = useState("rarity_4");
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    if (open) {
      setAttribute(defaultAttribute ?? "all");
      setRarity("rarity_4");
    }
  }, [defaultAttribute, open]);

  const rarityOptions = useMemo(
    () =>
      Array.from(new Set(boostCards.map((item) => item.card.cardRarityType)))
        .filter((it): it is string => !!it)
        .sort(
          (a, b) =>
            (cardRarityTypeToRarity[b] ?? 0) - (cardRarityTypeToRarity[a] ?? 0)
        ),
    [boostCards]
  );

  const filteredCards = useMemo(
    () =>
      boostCards.filter((item) => {
        if (attribute !== "all" && item.card.attr !== attribute) {
          return false;
        }
        if (rarity !== "all" && item.card.cardRarityType !== rarity) {
          return false;
        }
        return true;
      }),
    [attribute, boostCards, rarity]
  );

  const handleAttrChange = (event: SelectChangeEvent<string>) => {
    setAttribute(event.target.value);
  };

  const handleRarityChange = (event: SelectChangeEvent<string>) => {
    setRarity(event.target.value);
  };

  useEffect(() => {
    if (!open) {
      setRenderCount(0);
      return;
    }

    const initial = Math.min(INITIAL_RENDER_COUNT, filteredCards.length);
    setRenderCount(initial);

    if (initial >= filteredCards.length) {
      return;
    }

    const timer = window.setInterval(() => {
      setRenderCount((prev) => {
        const next = Math.min(prev + RENDER_CHUNK_SIZE, filteredCards.length);
        if (next >= filteredCards.length) {
          window.clearInterval(timer);
        }
        return next;
      });
    }, 16);

    return () => {
      window.clearInterval(timer);
    };
  }, [filteredCards, open]);

  const renderedCards = useMemo(
    () => filteredCards.slice(0, renderCount),
    [filteredCards, renderCount]
  );

  const renderRarityStars = (rarityType: string) => {
    const rarityValue = cardRarityTypeToRarity[rarityType] ?? 0;
    const starCount = rarityValue;

    return (
      <Grid container alignItems="center" wrap="nowrap">
        {Array.from({ length: starCount }).map((_, idx) => (
          <Grid
            item
            key={`rarity-star-${rarityType}-${idx}`}
            sx={{ height: 16 }}
          >
            <img src={rarityNormal} alt="rarity star" height="16" />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t("event:boostCards")}</DialogTitle>
      <DialogContent
        sx={{
          maxHeight: "80vh",
          overflowY: "auto",
          scrollbarGutter: "stable",
        }}
      >
        <Grid container spacing={2} style={{ marginBottom: 8, marginTop: 0 }}>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="event-boost-cards-attr-filter-label">
                {t("common:attribute")}
              </InputLabel>
              <Select
                labelId="event-boost-cards-attr-filter-label"
                value={attribute}
                label={t("common:attribute")}
                onChange={handleAttrChange}
                size="small"
              >
                <MenuItem value="all">{t("common:all")}</MenuItem>
                {ATTRIBUTES.map((attr) => (
                  <MenuItem key={`boost-cards-attr-${attr}`} value={attr}>
                    <Grid
                      container
                      alignItems="center"
                      wrap="nowrap"
                      spacing={1}
                    >
                      <Grid item>
                        <img
                          src={attrIconMap[attr as "cool"]}
                          alt={attr}
                          style={{ maxHeight: 16 }}
                        />
                      </Grid>
                      <Grid item>{attr}</Grid>
                    </Grid>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="event-boost-cards-rarity-filter-label">
                {t("common:rarity")}
              </InputLabel>
              <Select
                labelId="event-boost-cards-rarity-filter-label"
                value={rarity}
                label={t("common:rarity")}
                onChange={handleRarityChange}
                size="small"
              >
                <MenuItem value="all">{t("common:all")}</MenuItem>
                {rarityOptions.map((rarityType) => (
                  <MenuItem
                    key={`boost-cards-rarity-${rarityType}`}
                    value={rarityType}
                  >
                    {renderRarityStars(rarityType)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          {renderedCards.map((item) => (
            <Grid key={item.card.id} item xs={4} md={2}>
              <LinkNoDecoration to={`/card/${item.card.id}`} target="_blank">
                <Grid container direction="column">
                  <CardThumb cardId={item.card.id} card={item.card} />
                  <Typography align="center" style={{ whiteSpace: "pre-line" }}>
                    +{item.minBonus}
                    {item.maxBonus > item.minBonus ? `~${item.maxBonus}` : ""}%
                  </Typography>
                </Grid>
              </LinkNoDecoration>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default EventBoostCardsDialog;
