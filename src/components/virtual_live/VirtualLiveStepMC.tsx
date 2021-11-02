import {
  Avatar,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { Fragment, useEffect, useLayoutEffect, useState } from "react";
import Image from "mui-image";
import {
  CharacterSpawnEvent,
  CharacterTalkEvent,
  CharacterUnspawnEvent,
  ICharacter3D,
  ICostume3DModel,
  IGameChara,
  IMasterOfCermonyData,
  VirtualLiveSetlist,
} from "../../types";
import { getRemoteAssetURL, useCachedData, useServerRegion } from "../../utils";
import { charaIcons } from "../../utils/resources";
import { useTranslation } from "react-i18next";
import { AudioPlayButton } from "../storyreader/StoryReaderSnippet";
import { useLayoutStyles } from "../../styles/layout";
import { useCharaName } from "../../utils/i18n";

type MCSerialData =
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

const MCCharacterSpawn: React.FC<{ data: CharacterSpawnEvent }> = ({
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
  }, [character3d, characters, costume3dModels]);

  useEffect(() => {
    if (headCostume) {
      getRemoteAssetURL(
        `thumbnail/costume_rip/${headCostume.thumbnailAssetbundleName}.webp`,
        setHeadThumbnail,
        window.isChinaMainland ? "cn" : "ww"
      );
    }
  }, [headCostume]);

  useEffect(() => {
    if (bodyCostume) {
      getRemoteAssetURL(
        `thumbnail/costume_rip/${bodyCostume.thumbnailAssetbundleName}.webp`,
        setBodyThumbnail,
        window.isChinaMainland ? "cn" : "ww"
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

const MCCharacterUnspawn: React.FC<{ data: CharacterUnspawnEvent }> = ({
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

const MCCharacterTalk: React.FC<{ data: CharacterTalkEvent; mcId: string }> = ({
  data,
  mcId,
}) => {
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
    getRemoteAssetURL(
      `virtual_live/mc/voice/${mcId}_rip/${data.VoiceKey}.mp3`,
      setVoiceUrl,
      window.isChinaMainland ? "cn" : "ww"
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

const VirtualLiveStepMC: React.FC<{
  data: VirtualLiveSetlist;
}> = ({ data }) => {
  const layoutClasses = useLayoutStyles();
  const [region] = useServerRegion();

  const [assetBundleURL, setAssetBundleURL] = useState("");
  const [mcSerialData, setMcSerialData] = useState<MCSerialData[]>([]);
  const [mcId, setMcId] = useState("");

  useEffect(() => {
    getRemoteAssetURL(
      `virtual_live/mc/scenario/${data.assetbundleName}_rip/${data.assetbundleName}.asset`,
      setAssetBundleURL,
      window.isChinaMainland ? "cn" : "ww",
      region
    );
  }, [data.assetbundleName, region]);

  useLayoutEffect(() => {
    if (!assetBundleURL) return;
    const func = async () => {
      const { data } = await axios.get<IMasterOfCermonyData>(assetBundleURL, {
        responseType: "json",
      });

      setMcId(data.Id);

      const tmp: MCSerialData[] = [
        ...data.characterSpawnEvents.map((elem) => ({
          type: "spawn" as "spawn",
          data: elem,
        })),
        ...data.characterUnspawnEvents.map((elem) => ({
          type: "unspawn" as "unspawn",
          data: elem,
        })),
        ...data.characterTalkEvents.map((elem) => ({
          type: "talk" as "talk",
          data: elem,
        })),
      ];

      setMcSerialData(tmp.sort((a, b) => a.data.Time - b.data.Time));
    };

    func();
  }, [assetBundleURL]);

  return (
    <Grid container spacing={2}>
      {mcSerialData.map((mc) => (
        <Grid item xs={12}>
          <Paper variant="outlined">
            <Container className={layoutClasses.content}>
              <Grid container key={mc.data.Id} alignItems="center" spacing={1}>
                {mc.type === "spawn" && <MCCharacterSpawn data={mc.data} />}
                {mc.type === "unspawn" && <MCCharacterUnspawn data={mc.data} />}
                {mc.type === "talk" && (
                  <MCCharacterTalk data={mc.data} mcId={mcId} />
                )}
              </Grid>
            </Container>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default VirtualLiveStepMC;
