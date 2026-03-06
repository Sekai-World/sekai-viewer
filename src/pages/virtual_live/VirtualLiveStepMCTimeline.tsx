import { Avatar, Chip, Grid, Paper, Typography } from "@mui/material";
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
  VirtualLiveSetlist,
} from "../../types.d";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { charaIcons } from "../../utils/resources";
import { useTranslation } from "react-i18next";
import { AudioPlayButton } from "../../components/widgets/AudioPlayButton";
import { useCharaName } from "../../utils/i18n";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import ContainerContent from "../../components/styled/ContainerContent";

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

interface MCTimelineCharacter {
  name: string;
  character3dId: number;
}

interface MCTimelineParsedData {
  meta?: {
    timelineName?: string;
    characters?: MCTimelineCharacter[];
  };
  events?: MCTimelineRawEvent[];
}

interface MCTimelineRawEvent {
  type: string;
  start?: number;
  duration?: number;
  character?: string;
  character3dId?: number;
  motionKey?: string;
  facialKey?: string;
  serif?: string;
  cueName?: string;
}

interface MCTimelinePlayableData {
  m_Name?: string;
  __timelineParse?: MCTimelineParsedData;
}

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

const toNumber = (value: unknown, defaultValue = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : defaultValue;

const parseMCTimeline = (
  timelineData: MCTimelinePlayableData
): MCSerialData[] => {
  const events = timelineData.__timelineParse?.events ?? [];
  const characterIdByName = new Map(
    (timelineData.__timelineParse?.meta?.characters ?? []).map((item) => [
      item.name,
      item.character3dId,
    ])
  );

  const serialData: MCSerialData[] = [];

  events.forEach((event, index) => {
    const commonData = {
      Id: index + 1,
      Time: toNumber(event.start),
      Duration: toNumber(event.duration),
      FaicialKey: event.facialKey ?? "",
      MotionKey: event.motionKey ?? "",
    };

    const character3dId =
      typeof event.character3dId === "number"
        ? event.character3dId
        : event.character
          ? characterIdByName.get(event.character)
          : undefined;

    if (typeof character3dId !== "number") return;

    if (event.type === "spawn") {
      serialData.push({
        type: "spawn",
        data: {
          ...commonData,
          Character3dId: character3dId,
          HeadCostume3dId: 0,
          BodyCostume3dId: 0,
        },
      });
      return;
    }

    if (event.type === "unspawn") {
      serialData.push({
        type: "unspawn",
        data: {
          ...commonData,
          Character3dId: character3dId,
        },
      });
      return;
    }

    if (event.type === "talk") {
      serialData.push({
        type: "talk",
        data: {
          ...commonData,
          Character3dId: character3dId,
          Serif: event.serif ?? "",
          VoiceKey: event.cueName ?? "",
        },
      });
    }
  });

  return serialData.sort((a, b) => a.data.Time - b.data.Time);
};

const VirtualLiveStepMCTimeline: React.FC<{
  data: VirtualLiveSetlist;
}> = observer(({ data }) => {
  const { region } = useRootStore();

  const [assetBundleURL, setAssetBundleURL] = useState("");
  const [mcSerialData, setMcSerialData] = useState<MCSerialData[]>([]);
  const [mcId, setMcId] = useState("");

  useEffect(() => {
    if (!data.assetbundleName) {
      setAssetBundleURL("");
      return;
    }
    getRemoteAssetURL(
      `virtual_live/mc/timeline/${data.assetbundleName}/${data.assetbundleName}.playable`,
      setAssetBundleURL,
      "minio",
      region
    );
  }, [data.assetbundleName, region]);

  useLayoutEffect(() => {
    if (!assetBundleURL) return;

    const func = async () => {
      const { data: timelineData } = await axios.get<MCTimelinePlayableData>(
        assetBundleURL,
        {
          responseType: "json",
        }
      );
      const timelineMcId =
        timelineData.m_Name ||
        timelineData.__timelineParse?.meta?.timelineName ||
        data.assetbundleName ||
        "";

      setMcId(timelineMcId);
      setMcSerialData(parseMCTimeline(timelineData));
    };

    func();
  }, [assetBundleURL, data.assetbundleName]);

  return (
    <Grid container spacing={2}>
      {mcSerialData.map((mc) => (
        <Grid item xs={12} key={mc.data.Id}>
          <Paper variant="outlined">
            <ContainerContent>
              <Grid container alignItems="center" spacing={1}>
                {mc.type === "spawn" && <MCCharacterSpawn data={mc.data} />}
                {mc.type === "unspawn" && <MCCharacterUnspawn data={mc.data} />}
                {mc.type === "talk" && (
                  <MCCharacterTalk data={mc.data} mcId={mcId} />
                )}
              </Grid>
            </ContainerContent>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
});

export default VirtualLiveStepMCTimeline;
