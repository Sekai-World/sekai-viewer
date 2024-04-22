import Axios from "axios";
import { useCallback, useMemo } from "react";
import {
  EventGraphRanking,
  EventPrediction,
  EventRankingResponse,
  IEventRealtimeRank,
  ServerRegion,
} from "../types";

export function useEventTrackerAPI(region: ServerRegion = "jp") {
  const axios = useMemo(() => {
    const axios = Axios.create({
      baseURL: import.meta.env.VITE_API_BACKEND_BASE,
      params: {
        region,
      },
    });

    return axios;
  }, [region]);

  return {
    getEventPred: useCallback(async () => {
      return (
        await Axios.get<EventPrediction>(
          `${import.meta.env.VITE_FRONTEND_ASSET_BASE}/sekai-event-predict.json`
        )
      ).data;
    }, []),
    getEventRankingsByTimestamp: useCallback(
      async (eventId: number, timestamp: Date) => {
        return (
          await axios.get<{ data: { eventRankings: EventRankingResponse[] } }>(
            `/event/${eventId}/rankings`,
            {
              params: {
                timestamp: timestamp.toISOString(),
              },
            }
          )
        ).data;
      },
      [axios]
    ),
    getEventTimePoints: useCallback(
      async (eventId: number) => {
        return (
          await axios.get<{ data: string[] }>(`/event/${eventId}/rankings/time`)
        ).data;
      },
      [axios]
    ),
    getGraph: useCallback(
      async (eventId: number, ranking: EventGraphRanking) =>
        (
          await axios.get<{ data: { eventRankings: EventRankingResponse[] } }>(
            `/event/${eventId}/rankings/graph`,
            {
              params: { rank: ranking },
            }
          )
        ).data.data.eventRankings,
      [axios]
    ),
    getLastEventRankings: useCallback(
      async (eventId: number) => {
        const lastRecord = (
          await axios.get<{ data: { eventRankings: EventRankingResponse[] } }>(
            `/event/${eventId}/rankings`,
            {
              params: {
                limit: 1,
                sort: JSON.stringify({ timestamp: "desc" }),
              },
            }
          )
        ).data;

        if (lastRecord.data.eventRankings.length === 0) {
          return null;
        }

        const { timestamp } = lastRecord.data.eventRankings[0];

        return (
          await axios.get<{ data: { eventRankings: EventRankingResponse[] } }>(
            `/event/${eventId}/rankings`,
            {
              params: {
                timestamp,
              },
            }
          )
        ).data.data.eventRankings;
      },
      [axios]
    ),
    getLive: useCallback(
      async () =>
        (
          await axios.get<{ data: { eventRankings: EventRankingResponse[] } }>(
            "/event/live"
          )
        ).data.data.eventRankings,
      [axios]
    ),
  };
}

export function useRealtimeEventData() {
  return useCallback(async (eventId: number, region: ServerRegion = "jp") => {
    const { data }: { data: IEventRealtimeRank } = await Axios.get(
      `https://bitbucket.org/sekai-world/sekai-event-track${
        region === "tw" ? "-tw" : region === "en" ? "-en" : ""
      }/raw/main/event${eventId}.json?t=${Date.now()}`
    );
    return data;
  }, []);
}
