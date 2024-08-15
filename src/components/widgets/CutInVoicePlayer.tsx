import React, { useEffect, useState } from "react";
import AudioPlayButton from "./AudioPlayButton";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { IIngameCutinCharacters } from "../../types";
import { Grid } from "@mui/material";

export interface CutInVoicePlayButtonProps {
  id?: number;
  releaseConditionId?: number;
}

const CutInVoicePlayer: React.FC<CutInVoicePlayButtonProps> = ({
  id,
  releaseConditionId,
}) => {
  const [cutInVoices] = useCachedData<IIngameCutinCharacters>(
    "ingameCutinCharacters"
  );

  const [filteredVoices, setFilteredVoices] = useState<
    IIngameCutinCharacters[]
  >([]);
  const [voiceUrls, setVoiceUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!cutInVoices?.length) return;
    if (id) {
      const filtered = cutInVoices.filter((voice) => voice.id === id);
      setFilteredVoices(filtered);
    } else if (releaseConditionId) {
      const filtered = cutInVoices.filter(
        (voice) => voice.releaseConditionId === releaseConditionId
      );
      setFilteredVoices(filtered);
    }

    return () => {
      setFilteredVoices([]);
    };
  }, [id, releaseConditionId, cutInVoices]);

  useEffect(() => {
    const func = async () => {
      if (!filteredVoices?.length) return;
      const urls: string[] = [];
      for (const voice of filteredVoices) {
        const voiceUrl1 = `live/voice/cutin/${voice.assetbundleName1}_rip/${voice.assetbundleName1}.mp3`;
        urls.push(await getRemoteAssetURL(voiceUrl1, undefined, "minio"));

        const voiceUrl2 = `live/voice/cutin/${voice.assetbundleName2}_rip/${voice.assetbundleName2}.mp3`;
        urls.push(await getRemoteAssetURL(voiceUrl2, undefined, "minio"));
      }
      setVoiceUrls(urls);
    };
    func();

    return () => {
      setVoiceUrls([]);
    };
  }, [filteredVoices]);

  return (
    <Grid container columnGap={4} rowGap={2}>
      {voiceUrls.map((url, index) => (
        <Grid item key={index}>
          <AudioPlayButton url={url} />
        </Grid>
      ))}
    </Grid>
  );
};

export default CutInVoicePlayer;
