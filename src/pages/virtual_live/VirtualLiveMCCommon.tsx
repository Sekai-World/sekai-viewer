import { Avatar, Chip, Grid, Typography } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import Image from "mui-image";
import { useTranslation } from "react-i18next";
import {
  CharacterSpawnEvent,
  CharacterTalkEvent,
  CharacterUnspawnEvent,
  ICharacter3D,
  ICostume3DModel,
  IGameChara,
} from "../../types.d";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { charaIcons } from "../../utils/resources";
import { AudioPlayButton } from "../../components/widgets/AudioPlayButton";
import { useCharaName } from "../../utils/i18n";

export type MCSerialData =
  | {
      type: "spawn";
      data: CharacterSpawnEvent;
    }
  | {
      type: "unspawn";
      data: CharacterUnspawnEvent;
    }
  | {
      type: "talk";
      data: CharacterTalkEvent;
    };

export const MCCharacterSpawn: React.FC<{ data: CharacterSpawnEvent }> = ({
  data,
}) => {
  const getCharaName = useCharaName();

  const [character3ds] = useCachedData<ICharacter3D>("character3ds");
  const [characters] = useCachedData<IGameChara>("gameCharacters");
  const [costume3dModels] = useCachedData<ICostume3DModel>("costume3dModels");

  const [character3d, setCharacter3d] = useState<ICharacter3D>();
  const [character, setCharacter] = useState<IGameChara>();
  const [headCostume, setHeadCostume] = useState<ICostume3DModel>();
  const [bodyCostume, setBodyCostume] = useState<ICostume3DModel>();
  const [headThumbnail, setHeadThumbnail] = useState("");
  const [bodyThumbnail, setBodyThumbnail] = useState("");

  useEffect(() => {
    if (character3ds) {
      setCharacter3d(
        character3ds.find((elem) => elem.id === data.Character3dId)
      );
    }
  }, [character3ds, data.Character3dId]);

  useEffect(() => {
    if (character3d && characters) {
      setCharacter(
        characters.find((elem) => elem.id === character3d.characterId)
      );
    }
  }, [character3d, characters]);

  useEffect(() => {
    if (character3d && costume3dModels) {
      setHeadCostume(
        costume3dModels.find(
          (elem) => elem.costume3dId === character3d.headCostume3dId
        )
      );
      setBodyCostume(
        costume3dModels.find(
          (elem) => elem.costume3dId === character3d.bodyCostume3dId
        )
      );
    }
  }, [character3d, costume3dModels]);

  useEffect(() => {
    if (headCostume) {
      getRemoteAssetURL(
        `thumbnail/costume/${headCostume.thumbnailAssetbundleName}.webp`,
        setHeadThumbnail,
        "minio"
      );
    }
  }, [headCostume]);

  useEffect(() => {
    if (bodyCostume) {
      getRemoteAssetURL(
        `thumbnail/costume/${bodyCostume.thumbnailAssetbundleName}.webp`,
        setBodyThumbnail,
        "minio"
      );
    }
  }, [bodyCostume]);

  return character ? (
    <Fragment>
      <Grid item xs={12} md={4} lg={3}>
        <Chip
          label={getCharaName(character.id)}
          avatar={<Avatar src={charaIcons[`CharaIcon${character.id}`]} />}
        />
      </Grid>
      <Grid item xs={6} md={1}>
        <Image src={headThumbnail} bgColor="" />
      </Grid>
      <Grid item xs={6} md={1}>
        <Image src={bodyThumbnail} bgColor="" />
      </Grid>
    </Fragment>
  ) : null;
};

export const MCCharacterUnspawn: React.FC<{ data: CharacterUnspawnEvent }> = ({
  data,
}) => {
  const getCharaName = useCharaName();
  const { t } = useTranslation();

  const [character3ds] = useCachedData<ICharacter3D>("character3ds");
  const [characters] = useCachedData<IGameChara>("gameCharacters");

  const [character3d, setCharacter3d] = useState<ICharacter3D>();
  const [character, setCharacter] = useState<IGameChara>();

  useEffect(() => {
    if (character3ds) {
      setCharacter3d(
        character3ds.find((elem) => elem.id === data.Character3dId)
      );
    }
  }, [character3ds, data.Character3dId]);

  useEffect(() => {
    if (character3d && characters) {
      setCharacter(
        characters.find((elem) => elem.id === character3d.characterId)
      );
    }
  }, [character3d, characters]);

  return character ? (
    <Fragment>
      <Grid item xs={12} md={4} lg={3}>
        <Chip
          label={getCharaName(character.id)}
          avatar={<Avatar src={charaIcons[`CharaIcon${character.id}`]} />}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <Typography>{t("virtual_live:mc.character_unspawn")}</Typography>
      </Grid>
    </Fragment>
  ) : null;
};

export const MCCharacterTalk: React.FC<{
  data: CharacterTalkEvent;
  mcId: string;
}> = ({ data, mcId }) => {
  const getCharaName = useCharaName();

  const [character3ds] = useCachedData<ICharacter3D>("character3ds");
  const [characters] = useCachedData<IGameChara>("gameCharacters");

  const [character3d, setCharacter3d] = useState<ICharacter3D>();
  const [character, setCharacter] = useState<IGameChara>();
  const [voiceUrl, setVoiceUrl] = useState("");

  useEffect(() => {
    if (character3ds) {
      setCharacter3d(
        character3ds.find((elem) => elem.id === data.Character3dId)
      );
    }
  }, [character3ds, data.Character3dId]);

  useEffect(() => {
    if (character3d && characters) {
      setCharacter(
        characters.find((elem) => elem.id === character3d.characterId)
      );
    }
  }, [character3d, characters]);

  useEffect(() => {
    if (!data.VoiceKey || !mcId) {
      setVoiceUrl("");
      return;
    }
    getRemoteAssetURL(
      `virtual_live/mc/voice/${mcId}/${data.VoiceKey}.mp3`,
      setVoiceUrl,
      "minio"
    );
  }, [data.VoiceKey, mcId]);

  return character ? (
    <Fragment>
      <Grid item xs={10} md={11}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Chip
              label={getCharaName(character.id)}
              avatar={<Avatar src={charaIcons[`CharaIcon${character.id}`]} />}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography>{data.Serif}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={2} md={1}>
        <AudioPlayButton url={voiceUrl} />
      </Grid>
    </Fragment>
  ) : null;
};
