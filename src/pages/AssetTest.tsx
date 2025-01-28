import Axios from "axios";
import React, { useCallback } from "react";
import { useCachedData, getRemoteAssetURL } from "../utils";
import { useRootStore } from "../stores/root";
import {
  useScenarioInfo,
  getProcessedScenarioDataForLive2D,
  useMediaUrlForLive2D,
} from "../utils/storyLoader";
import { PreloadQueue } from "../utils/Live2DPlayer/PreloadQueue";
import {
  IUnitStory,
  IUnitProfile,
  IEventStory,
  IEventInfo,
  ICharaProfile,
  ICardEpisode,
  ICardInfo,
  IActionSet,
  IArea,
  ISpecialStory,
  ServerRegion,
  IScenarioData,
} from "../types.d";

const TEXT_SERVICE_WORKER = `if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser.js");
  await worker.start();
}`;
const TEXT_ASSET_LIST = `[
  ["sekai-jp-assets", "actionset/group0_rip/as_2_007.asset", "2024-05-28 12:42:25", "4246"],
  ["sekai-jp-assets", "actionset/group0_rip/as_2_008.asset", "2024-05-28 12:42:25", "4265"]
]`;
const TEXT_DOWNLOAD = `from minio import Minio
import datetime
client = Minio("storage.sekai.best", secure=True)
objects = client.list_objects(
    "sekai-jp-assets",
    recursive=True
)
c = 0
rst = []
for obj in objects:
    rst.append(obj)
    c += 1
    if c % 1000 == 0:
        print(c)
db = []
for o in rst:
    if (o.is_dir):
        continue
    db.append([
      o.bucket_name,
      o.object_name,
      o.last_modified.strftime("%Y-%m-%d %H:%M:%S"),
      o.size,
    ])
with open("asset_list.json", "w") as f:
    json.dump(db, f)`;

const STATIC_SERVER = "/test-static";
const PATH_ASSET_LIST = "/asset_list-20250125.json";
const PATH_STORY_DIR = "/scenario_data/";
const PATH_MEDIA_LOST = "/media_lost-20250127.json";

function useAllScenario() {
  const [unitStories] = useCachedData<IUnitStory>("unitStories");
  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [events] = useCachedData<IEventInfo>("events");
  const [characterProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [actionSets] = useCachedData<IActionSet>("actionSets");
  const [areas] = useCachedData<IArea>("areas");
  const [specialStories] = useCachedData<ISpecialStory>("specialStories");
  const { region } = useRootStore();

  return useCallback(() => {
    const scenarioList: {
      storyType: string;
      storyId: string;
      region: ServerRegion;
    }[] = [];
    // eventStory -> components/story-selector/EventStory
    events?.forEach((ev) => {
      const eventId = ev.id;
      const chapter = eventStories?.find(
        (es) => es.eventId === Number(eventId)
      );
      chapter?.eventStoryEpisodes.forEach((episode) => {
        const episodeNo = episode.episodeNo;
        scenarioList.push({
          storyType: "eventStory",
          storyId: `/test/eventStory/${eventId}/${episodeNo}`,
          region,
        });
      });
    });
    // unitStory -> components/story-selector/UnitStory
    unitProfiles?.forEach((u) => {
      const unit = u.unit;
      const stories = unitStories?.find((us) => us.unit === unit);
      stories?.chapters.forEach((chapter) => {
        const chapterNo = chapter.chapterNo;
        chapter.episodes.forEach((episode) => {
          const episodeNo = episode.episodeNo;
          scenarioList.push({
            storyType: "unitStory",
            storyId: `/test/unitStory/${unit}/${chapterNo}/${episodeNo}`,
            region,
          });
        });
      });
    });
    // charaStory -> components/story-selector/CharaStory
    characterProfiles?.forEach((character) => {
      const charaId = character.characterId;
      scenarioList.push({
        storyType: "charaStory",
        storyId: `/test/charaStory/${charaId}`,
        region,
      });
    });
    // cardStory -> components/story-selector/CardStory
    characterProfiles?.forEach((character) => {
      const charaId = character.characterId;
      const filteredCards = cards?.filter(
        (card) => card.characterId === Number(charaId)
      );
      filteredCards?.forEach((card) => {
        const cardId = card.id;
        const episodes = cardEpisodes?.filter(
          (ce) => ce.cardId === Number(cardId)
        );
        episodes?.forEach((episode) => {
          const episodeId = episode.id;
          scenarioList.push({
            storyType: "cardStory",
            storyId: `/test/cardStory/${charaId}/${cardId}/${episodeId}`,
            region,
          });
        });
      });
    });
    // areaTalk -> components/story-selector/AreaTalk
    areas?.forEach((area) => {
      const areaId = area.id;
      actionSets
        ?.filter((as) => as.areaId === Number(areaId))
        .forEach((actionSet) => {
          const actionSetId = actionSet.id;
          scenarioList.push({
            storyType: "areaTalk",
            storyId: `/test/areaTalk/${areaId}/${actionSetId}`,
            region,
          });
        });
    });
    // specialStory -> components/story-selector/SpecialStory
    specialStories?.forEach((sp) => {
      const storyId = sp.id;
      const chapter = specialStories.find((sp) => sp.id === Number(storyId));
      chapter?.episodes.forEach((episode) => {
        const episodeNo = episode.episodeNo;
        scenarioList.push({
          storyType: "specialStory",
          storyId: `/test/specialStory/${storyId}/${episodeNo}`,
          region,
        });
      });
    });
    return scenarioList;
  }, [
    unitStories,
    unitProfiles,
    eventStories,
    events,
    characterProfiles,
    cardEpisodes,
    cards,
    actionSets,
    areas,
    specialStories,
    region,
  ]);
}

const Main: React.FC = () => {
  const getAllScenario = useAllScenario();
  const getScenarioInfo = useScenarioInfo();
  const getMediaUrlForLive2D = useMediaUrlForLive2D();

  const load_asset_list = async () => {
    console.log("load asset list start.");
    const res = await Axios.get(STATIC_SERVER + PATH_ASSET_LIST, {
      responseType: "json",
    });
    (window as any).assetList = res.data.map((d: string[]) => d[1]);
    console.log("load asset list finish.");
  };
  const get_all_stories = async () => {
    const stories = getAllScenario();
    const rst = [];
    for (const story of stories) {
      try {
        const info = await getScenarioInfo(
          story.storyType,
          story.storyId,
          story.region
        );
        if (info)
          rst.push(
            await getRemoteAssetURL(info.scenarioDataUrl, undefined, "minio")
          );
      } catch (err) {
        console.log(err);
      }
    }
    console.log(rst);
  };
  const check_stories_exist = async () => {
    const cant_load = [];
    const banner_not_exist = [];
    const story_not_exist = [];
    const all = getAllScenario();
    for (const scenario of all) {
      let sc;
      try {
        sc = await getScenarioInfo(
          scenario.storyType,
          scenario.storyId,
          scenario.region
        );
      } catch (error) {
        cant_load.push(scenario);
      }
      if (sc) {
        if (
          !((window as any).assetList as string[]).includes(sc.scenarioDataUrl)
        )
          story_not_exist.push(sc);
        if (
          sc.bannerUrl &&
          !((window as any).assetList as string[]).includes(
            sc.bannerUrl.replace(
              "https://storage.sekai.best/sekai-jp-assets/",
              ""
            )
          )
        ) {
          banner_not_exist.push(sc);
        }
      }
    }
    console.log("story can't load:", cant_load);
    console.log("story not exist", story_not_exist);
    console.log("banner not exist", banner_not_exist);
  };
  const check_story_media_all = async () => {
    const all = getAllScenario();
    let c = 0;
    const queue = new PreloadQueue();
    for (const sc of all) {
      await queue.wait();
      await queue.add(
        new Promise((resolve) => {
          check_story_media(sc).then((rst) => {
            c++;
            console.log(`total: ${all.length}, progress: ${c}`);
            if (rst.length > 0) {
              resolve([sc, rst]);
            } else resolve(undefined);
          });
        })
      );
    }
    const rst = (await queue.all()).filter((r) => !!r);
    console.log(`total: ${all.length}, progress: ${c}, media not exist: `, rst);
  };
  const check_story_media = async (scenario: {
    storyType: string;
    storyId: string;
    region: ServerRegion;
  }): Promise<string[]> => {
    const not_exist = [];
    let sc;
    try {
      sc = await getScenarioInfo(
        scenario.storyType,
        scenario.storyId,
        scenario.region
      );
    } catch (error: any) {
      return [error.message];
    }
    if (sc) {
      let data: IScenarioData | undefined;
      try {
        const res: { data: IScenarioData } = await Axios.get(
          STATIC_SERVER +
            PATH_STORY_DIR +
            sc.scenarioDataUrl.replace(/\//g, "-"),
          { responseType: "json" }
        );
        data = res.data;
      } catch (error: any) {
        console.log(`${sc.scenarioDataUrl} not in local. loading.`);
      }
      const processed = await getProcessedScenarioDataForLive2D(
        sc,
        scenario.region,
        data
      );
      const mediaUrl = await getMediaUrlForLive2D(
        sc,
        processed,
        scenario.region
      );
      // check
      for (const m of mediaUrl) {
        if (
          !((window as any).assetList as string[]).includes(
            m.url.replace("https://storage.sekai.best/sekai-jp-assets/", "")
          )
        )
          not_exist.push(
            m.url.replace("https://storage.sekai.best/sekai-jp-assets/", "")
          );
      }
    } else return ["story not found"];
    return not_exist;
  };
  const gather_media_lost = async () => {
    console.log("load media lost start.");
    const res = await Axios.get(STATIC_SERVER + PATH_MEDIA_LOST, {
      responseType: "json",
    });
    const mediaLost: [
      {
        storyType: string;
        storyId: string;
        region: ServerRegion;
      },
      string[],
    ][] = res.data;
    console.log("load media lost finish.");
    const rst = mediaLost.reduce((prev, curr) => {
      prev.push(...curr[1]);
      return prev;
    }, [] as string[]);
    console.log([...new Set(rst)].sort());
  };
  return (
    <>
      <button onClick={get_all_stories}>get_all_stories</button>
      <button onClick={load_asset_list}>load_asset_list</button>
      <button onClick={check_stories_exist}>check_stories_exist</button>
      <button onClick={check_story_media_all}>check_story_media</button>
      <button onClick={gather_media_lost}>gather_media_lost</button>
      <div>
        <h2>This page is debug only.</h2>
        <p>Please open console to get output.</p>
        <h4>Get ready</h4>
        <p>
          Create a local web server on port 8000 to host necessary files. Check
          denifinitions in <b>AssetTest.tsx</b>.
        </p>
        <p>
          Comment bellow codes in <b>index.tsx</b> to not use service work(or
          memory will overflow)
        </p>
        <pre>{TEXT_SERVICE_WORKER}</pre>
        <h4>Step1: Prepare asset list</h4>
        <p>
          The asset list is a list for all the asset in minio. File type json.
          Save to <b>PATH_ASSET_LIST</b>
        </p>
        <p>example:</p>
        <pre>{TEXT_ASSET_LIST}</pre>
        <p>This test page will only use assetList[][1], aka file name.</p>
        <p>Python code to download assetList (may take more than 2 hours):</p>
        <pre>{TEXT_DOWNLOAD}</pre>
        <h4>Step2 (optional): Prepare all story definition</h4>
        <p>
          Click <b>get_all_stories</b>, and download all the link, and rename it
          like: <b>character-member-res001_no002_rip-001002_ichika02.asset</b>{" "}
          (replace `&quot;/`&quot; with `&quot;-`&quot;)
        </p>
        <p>
          save to dir: <b>PATH_STORY_DIR</b>
        </p>
        <h4>Step3: Click and check!</h4>
        <p>
          <b>load_asset_list</b> → load assetList in window.assetList
        </p>
        <p>
          <b>check_stories_exist</b> → check story definitions exist in asset
          list.
        </p>
        <p>
          <b>check_story_media_all</b> → check all the media assets exist in
          each story definitions, may take more than 10 min.
        </p>
        <h4>Step4: Gather all lost media</h4>
        <p>
          Save the output of <b>check_story_media_all</b> into{" "}
          <b>PATH_MEDIA_LOST</b>, and click gather_media_lost, output unique
          lost media files.
        </p>
      </div>
    </>
  );
};

export default Main;
