import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";
import { attrIconMap } from "../../utils/resources";
import { useCharaName } from "../../utils/i18n";
import makeStyles from "@mui/styles/makeStyles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Button,
  FormControlLabel,
  Select,
  Switch,
  DialogProps,
} from "@mui/material";
import { ICardInfo, IGameChara, ISkillInfo } from "../../types";
import {
  useSkillMapping,
  useCachedData,
  cardRarityTypeToRarity,
  useLocalStorage,
} from "../../utils";
import { CardThumb } from "./CardThumb";
import { useTranslation } from "react-i18next";
import { ISekaiCardTeam } from "../../stores/sekai";

const useStyle = makeStyles((theme) => ({
  "rarity-star-img": {
    maxWidth: "16px",
    margin: theme.spacing(0, 0.25),
  },
  "dialog-paper": {
    padding: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      minWidth: "500px",
    },
    [theme.breakpoints.up("md")]: {
      minWidth: "700px",
    },
    [theme.breakpoints.up("lg")]: {
      minWidth: "900px",
    },
  },
}));

const FilterCardsModal: React.FC<
  {
    sekaiCardTeam?: ISekaiCardTeam;
    onCardSelected: (card: ICardInfo, isSyncCardState: boolean) => void;
  } & DialogProps
> = observer(({ sekaiCardTeam, onCardSelected, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyle();
  const getCharaName = useCharaName();
  const skillMapping = useSkillMapping();

  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [skills] = useCachedData<ISkillInfo>("skills");

  const [characterId, setCharacterId] = useState<number>(0);
  const [rarity, setRarity] = useState<number>(0);
  const [attr, setAttr] = useState<string>("all");
  const [filteredCards, setFilteredCards] = useState<ICardInfo[]>([]);
  const [skillSpriteName, setSkillSpriteName] = useState("any");

  const [isSyncCardState, setIsSyncCardState] = useLocalStorage(
    "team-build-use-sekai-card-state",
    false
  );

  const filterCards = useCallback(() => {
    if (!cards || !cards.length || !skills || !skills.length) return;
    const skillIds = skills
      .filter((skill) => {
        if (skillSpriteName === "perfect_score_up")
          return skill.skillEffects[0].activateNotesJudgmentType === "perfect";
        else if (skillSpriteName === "life_score_up")
          return (
            skill.skillEffects[0].skillEffectType === "score_up_condition_life"
          );
        else return skill.descriptionSpriteName === skillSpriteName;
      })
      .map((skill) => skill.id);
    setFilteredCards(
      cards.filter(
        (card) =>
          (rarity > 0
            ? (card.rarity || cardRarityTypeToRarity[card.cardRarityType!]) ===
              rarity
            : true) &&
          (attr !== "all" ? card.attr === attr : true) &&
          (skillIds.length ? skillIds.includes(card.skillId) : true) &&
          (characterId ? card.characterId === characterId : true)
      )
    );
  }, [attr, cards, characterId, rarity, skillSpriteName, skills]);

  return (
    <Dialog {...props}>
      <DialogTitle>{t("music_recommend:addCardDialog.title")}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <FormControl style={{ minWidth: 200 }}>
              <InputLabel id="add-card-dialog-select-chara-label">
                {t("common:character")}
              </InputLabel>
              <Select
                labelId="add-card-dialog-select-chara-label"
                value={characterId}
                label={t("common:character")}
                onChange={(e) => setCharacterId(e.target.value as number)}
              >
                <MenuItem value={0}>{t("common:all")}</MenuItem>
                {charas &&
                  charas.map((chara) => (
                    <MenuItem
                      key={`chara-select-item-${chara.id}`}
                      value={chara.id}
                    >
                      {getCharaName(chara.id)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl style={{ minWidth: 120 }}>
              <InputLabel id="add-card-dialog-select-rarity-label">
                {t("common:rarity")}
              </InputLabel>
              <Select
                labelId="add-card-dialog-select-rarity-label"
                value={rarity}
                label={t("common:rarity")}
                onChange={(e) => setRarity(e.target.value as number)}
              >
                <MenuItem key={`rarity-select-item-0`} value={0}>
                  {t("common:all")}
                </MenuItem>
                {Array.from({ length: 4 }).map((_, index) => (
                  <MenuItem
                    key={`rarity-select-item-${index + 1}`}
                    value={index + 1}
                  >
                    {index + 1 >= 3
                      ? Array.from({ length: index + 1 }).map((_, id) => (
                          <img
                            className={classes["rarity-star-img"]}
                            src={rarityAfterTraining}
                            alt={`star-${id}`}
                            key={`star-${id}`}
                          />
                        ))
                      : Array.from({ length: index + 1 }).map((_, id) => (
                          <img
                            className={classes["rarity-star-img"]}
                            src={rarityNormal}
                            alt={`star-${id}`}
                            key={`star-${id}`}
                          />
                        ))}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl style={{ minWidth: 60 }}>
              <InputLabel id="add-card-dialog-select-attr-label">
                {t("common:attribute")}
              </InputLabel>
              <Select
                labelId="add-card-dialog-select-attr-label"
                value={attr}
                label={t("common:attribute")}
                onChange={(e) => setAttr(e.target.value as string)}
              >
                <MenuItem key={`attr-select-item-0`} value={"all"}>
                  {t("common:all")}
                </MenuItem>
                {["cute", "mysterious", "cool", "happy", "pure"].map((name) => (
                  <MenuItem key={`attr-select-item-${name}`} value={name}>
                    <img
                      className={classes["rarity-star-img"]}
                      src={attrIconMap[name as "cool"]}
                      alt={`attr-${name}`}
                      key={`attr-${name}`}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl style={{ minWidth: 200 }}>
              <InputLabel id="add-card-dialog-select-skill-label">
                {t("card:skillName")}
              </InputLabel>
              <Select
                labelId="add-card-dialog-select-skill-label"
                value={skillSpriteName}
                label={t("card:skillName")}
                onChange={(e) => setSkillSpriteName(e.target.value as string)}
              >
                <MenuItem value={"any"}>{t("common:all")}</MenuItem>
                {skillMapping.map(({ name, descriptionSpriteName }, index) => (
                  <MenuItem
                    key={`skill-select-item-${index + 1}`}
                    value={descriptionSpriteName}
                  >
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => filterCards()}
            >
              {t("common:search")}
            </Button>
          </Grid>
        </Grid>
        {!!filteredCards.length && !!sekaiCardTeam ? (
          <Grid container spacing={1}>
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={isSyncCardState}
                    onChange={(_, checked) => setIsSyncCardState(checked)}
                  />
                }
                label={t("team_build:use_sekai_card_state") as string}
                disabled={!sekaiCardTeam.cards || !sekaiCardTeam.cards.length}
              />
            </Grid>
          </Grid>
        ) : (
          <br />
        )}
        <Grid container direction="row" spacing={1}>
          {filteredCards.map((card) => (
            <Grid key={`filtered-card-${card.id}`} item xs={4} md={3} lg={2}>
              <CardThumb
                cardId={card.id}
                onClick={() => onCardSelected(card, isSyncCardState)}
                style={{ cursor: "pointer" }}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      {/* <DialogActions></DialogActions> */}
    </Dialog>
  );
});

export default FilterCardsModal;
