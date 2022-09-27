import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { AnnouncementModel } from "../../strapi-model";
import { useStrapi } from "../../utils/apiClient";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";
import GridView from "./GridView";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";

const AnnouncementList: React.FC<{}> = observer(() => {
  const { t } = useTranslation();
  const {
    user: { metadata },
  } = useRootStore();
  const {
    settings: { languages, lang },
  } = useRootStore();
  const { getAnnouncementByLanguagesPage, getAnnouncementByLanguagesCount } =
    useStrapi();

  const [announcements, setAnnouncements] = useState<AnnouncementModel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [lastQueryFin, setLastQueryFin] = useState(false);
  const [page, setPage] = useState(0);
  const [limit] = useState(30);

  const langId = useMemo(() => {
    let id = 1;
    if (languages.length) {
      let currentLang =
        languages.find((elem) => elem.code === lang) ||
        languages.find((elem) => elem.code === lang.split("-")[0]);
      if (currentLang) {
        id = currentLang.id;
      }
    }
    return id;
  }, [lang, languages]);
  const targetLangs = useMemo(
    () =>
      metadata
        ? [langId, ...metadata?.languages.map((lang) => lang.id)]
        : [langId],
    [langId, metadata]
  );

  useLayoutEffect(() => {
    document.title = t("title:announcementList");
  }, [t]);

  useEffect(() => {
    getAnnouncementByLanguagesCount(targetLangs).then((data) => {
      setTotalCount(data);
      setIsReady(true);
    });
  }, [getAnnouncementByLanguagesCount, targetLangs]);

  useEffect(() => {
    (async () => {
      const data = await getAnnouncementByLanguagesPage(
        limit,
        page,
        targetLangs
      );
      setAnnouncements((announcements) => [...announcements, ...data]);
      setLastQueryFin(true);
    })();
  }, [getAnnouncementByLanguagesPage, limit, page, targetLangs]);

  const callback = useCallback(
    (
      entries: readonly IntersectionObserverEntry[],
      setHasMore: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (!isReady) return;
      if (
        entries[0].isIntersecting &&
        lastQueryFin &&
        (!totalCount || totalCount > page * limit)
      ) {
        setPage((page) => page + 1);
        setLastQueryFin(false);
      } else if (totalCount && totalCount <= page * limit) {
        setHasMore(false);
      }
    },
    [isReady, lastQueryFin, limit, page, totalCount]
  );

  return (
    <Fragment>
      <TypographyHeader>{t("common:announcement")}</TypographyHeader>
      <ContainerContent>
        <InfiniteScroll<AnnouncementModel>
          ViewComponent={GridView}
          callback={callback}
          data={announcements}
          gridSize={{
            xs: 12,
          }}
        />
      </ContainerContent>
    </Fragment>
  );
});

export default AnnouncementList;
