import { Container, Typography } from "@mui/material";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { SettingContext, UserContext } from "../../context";
import { AnnouncementModel } from "../../strapi-model";
import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../utils/apiClient";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";
import GridView from "./GridView";

const AnnouncementList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { usermeta } = useContext(UserContext)!;
  const { languages, lang } = useContext(SettingContext)!;
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
      usermeta
        ? [langId, ...usermeta?.languages.map((lang) => lang.id)]
        : [langId],
    [langId, usermeta]
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
  }, [
    getAnnouncementByLanguagesPage,
    lang,
    languages,
    limit,
    page,
    targetLangs,
    usermeta,
  ]);

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
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:announcement")}
      </Typography>
      <Container className={layoutClasses.content}>
        <InfiniteScroll<AnnouncementModel>
          ViewComponent={GridView}
          callback={callback}
          data={announcements}
          gridSize={{
            xs: 12,
          }}
        />
      </Container>
    </Fragment>
  );
};

export default AnnouncementList;
