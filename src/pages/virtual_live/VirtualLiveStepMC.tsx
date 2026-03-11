import { Grid, Paper } from "@mui/material";
import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { IMasterOfCermonyData, VirtualLiveSetlist } from "../../types.d";
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

const VirtualLiveStepMC: React.FC<{
  data: VirtualLiveSetlist;
}> = observer(({ data }) => {
  const { region } = useRootStore();

  const [assetBundleURL, setAssetBundleURL] = useState("");
  const [mcSerialData, setMcSerialData] = useState<MCSerialData[]>([]);
  const [mcId, setMcId] = useState("");

  useEffect(() => {
    getRemoteAssetURL(
      `virtual_live/mc/scenario/${data.assetbundleName}/${data.assetbundleName}.asset`,
      setAssetBundleURL,
      "minio",
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
          data: elem,
          type: "spawn" as const,
        })),
        ...data.characterUnspawnEvents.map((elem) => ({
          data: elem,
          type: "unspawn" as const,
        })),
        ...data.characterTalkEvents.map((elem) => ({
          data: elem,
          type: "talk" as const,
        })),
      ];

      setMcSerialData(tmp.sort((a, b) => a.data.Time - b.data.Time));
    };

    func();
  }, [assetBundleURL]);

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

export default VirtualLiveStepMC;
