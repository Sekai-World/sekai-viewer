import { Grid, Paper } from "@mui/material";
import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { VirtualLiveSetlist } from "../../types.d";
import { getRemoteAssetURL } from "../../utils";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import ContainerContent from "../../components/styled/ContainerContent";
import {
  MCCharacterSpawn,
  MCCharacterTalk,
  MCCharacterUnspawn,
  MCSerialData,
} from "./VirtualLiveMCCommon";

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
      setMcSerialData([]);
      setMcId("");
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
