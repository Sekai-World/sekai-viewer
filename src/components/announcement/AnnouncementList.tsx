import { Container, Typography } from "@material-ui/core";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { SettingContext, UserContext } from "../../context";
import { AnnouncementModel } from "../../strapi-model";
import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../utils/apiClient";
import InfiniteScroll from "../subs/InfiniteScroll";
import GridView from "./GridView";

const AnnouncementList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { usermeta } = useContext(UserContext)!;
  const { languages, lang } = useContext(SettingContext)!;
  const { getAnnouncementPage, getAnnouncementCount } = useStrapi();

  const [announcements, setAnnouncements] = useState<AnnouncementModel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [lastQueryFin, setLastQueryFin] = useState(false);
  const [page, setPage] = useState(0);
  const [limit] = useState(30);

  useLayoutEffect(() => {
    document.title = t("title:announcementList");
  }, [t]);

  useEffect(() => {
    getAnnouncementCount().then((data) => {
      setTotalCount(data);
      setIsReady(true);
    });
  }, [getAnnouncementCount]);

  useEffect(() => {
    (async () => {
      const enId = languages.find((lang) => lang.code === "en")!.id;
      const langId = languages.find((elem) => elem.code === lang)!.id;
      const data = await getAnnouncementPage(
        limit,
        page,
        usermeta
          ? {
              language_in: [
                enId,
                langId,
                ...usermeta?.languages.map((lang) => lang.id),
              ],
            }
          : {
              language_in: [enId, langId],
            }
      );
      setAnnouncements((announcements) => [...announcements, ...data]);
      setLastQueryFin(true);
    })();
  }, [getAnnouncementPage, lang, languages, limit, page, usermeta]);

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
