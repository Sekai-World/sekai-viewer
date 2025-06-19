import Axios from "axios";
import { useCallback, useMemo } from "react";
import {
  EventGraphRanking,
  EventPrediction,
  EventRankingResponse,
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
    getEventChapterRankingsByTimestamp: useCallback(
      async (eventId: number, charaId: number, timestamp: Date) => {
        return (
          await axios.get<{ data: { eventRankings: EventRankingResponse[] } }>(
            `/event/${eventId}/chapter_rankings`,
            {
              params: {
                charaId,
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
    getEventChapterTimePoints: useCallback(
      async (eventId: number, charaId: number) => {
        return (
          await axios.get<{ data: string[] }>(
            `/event/${eventId}/chapter_rankings/time`,
            {
              params: {
                charaId,
              },
            }
          )
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
    getChapterGraph: useCallback(
      async (eventId: number, charaId: number, ranking: EventGraphRanking) =>
        (
          await axios.get<{ data: { eventRankings: EventRankingResponse[] } }>(
            `/event/${eventId}/chapter_rankings/graph`,
            {
              params: { charaId, rank: ranking },
            }
          )
        ).data.data.eventRankings,
      [axios]
    ),
    getEventLastRankings: useCallback(
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
    getEventChapterLastRankings: useCallback(
      async (eventId: number, charaId: number) => {
        const lastRecord = (
          await axios.get<{ data: { eventRankings: EventRankingResponse[] } }>(
            `/event/${eventId}/chapter_rankings`,
            {
              params: {
                charaId,
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
            `/event/${eventId}/chapter_rankings`,
            {
              params: {
                charaId,
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
    getChapterLive: useCallback(
      async (charaId: number) =>
        (
          await axios.get<{ data: { eventRankings: EventRankingResponse[] } }>(
            "/event/live_chapter_rankings",
            {
              params: {
                charaId,
              },
            }
          )
        ).data.data.eventRankings,
      [axios]
    ),
  };
}
