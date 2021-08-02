import {
  Chip,
  CircularProgress,
  Container,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { ColDef, DataGrid } from "@material-ui/data-grid";
import { OpenInNew } from "@material-ui/icons";
import React, { Fragment, useEffect } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useInteractiveStyles } from "../../styles/interactive";
import { useLayoutStyles } from "../../styles/layout";
import { IMusicInfo, IMusicMeta } from "../../types";
import { filterMusicMeta, useCachedData, useMusicMeta } from "../../utils";
// import AdSense from "../subs/AdSense";
import { ContentTrans } from "../subs/ContentTrans";

const useStyles = makeStyles((theme) => ({
  "diffi-easy": {
    backgroundColor: "#66DD11",
  },
  "diffi-normal": {
    backgroundColor: "#33BBEE",
  },
  "diffi-hard": {
    backgroundColor: "#FFAA00",
  },
  "diffi-expert": {
    backgroundColor: "#EE4466",
  },
  "diffi-master": {
    backgroundColor: "#BB33EE",
  },
}));

const MusicMeta = () => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  const [metas] = useMusicMeta();
  const [musics] = useCachedData<IMusicInfo>("musics");

  const [validMetas, setValidMetas] = useState<IMusicMeta[]>([]);

  const columns: ColDef[] = [
    {
      field: "music_id",
      headerName: t("common:id"),
      width: 90,
      renderCell(params) {
        return (
          <Link
            to={`/music/${params.value}`}
            target="_blank"
            className={interactiveClasses.noDecoration}
          >
            {params.value}
            <IconButton color="primary">
              <OpenInNew></OpenInNew>
            </IconButton>
          </Link>
        );
      },
    },
    {
      field: "music_name",
      headerName: t("music_recommend:result.musicName"),
      width: 350,
      renderCell(params) {
        return (
          <ContentTrans
            contentKey={`music_titles:${params.getValue("music_id")}`}
            original={
              musics
                ? musics.find(
                    (music) => music.id === params.getValue("music_id")
                  )!.title
                : String(params.getValue("music_id"))
            }
          />
        );
      },
    },
    {
      field: "level",
      headerName: t("music:difficulty"),
      width: 100,
      renderCell(params) {
        return (
          <Chip
            color="primary"
            size="small"
            classes={{
              colorPrimary:
                classes[
                  `diffi-${params.getValue("difficulty")}` as
                    | "diffi-easy"
                    | "diffi-normal"
                    | "diffi-hard"
                    | "diffi-expert"
                    | "diffi-master"
                ],
            }}
            label={params.value}
          ></Chip>
        );
      },
    },
    {
      field: "music_time",
      headerName: t("music:actualPlaybackTime"),
      width: 150,
      align: "center",
    },
    {
      field: "combo",
      headerName: t("music:noteCount"),
      width: 110,
      align: "center",
    },
    {
      field: "base_score",
      headerName: t("music:baseScore"),
      width: 120,
      align: "center",
      valueFormatter(params) {
        return (params.value as number).toFixed(3);
      },
    },
    {
      field: "fever_score",
      headerName: t("music:feverScore"),
      width: 120,
      align: "center",
      valueFormatter(params) {
        return (params.value as number).toFixed(3);
      },
    },
    {
      field: "event_rate",
      headerName: t("music:eventRate"),
      width: 120,
      align: "center",
    },
  ];

  useEffect(() => {
    if (metas && musics) setValidMetas(filterMusicMeta(metas, musics));
  }, [metas, musics]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:musicMeta")}
      </Typography>
      <Container className={layoutClasses.content}>
        {validMetas ? (
          <div style={{ height: 750 }}>
            <DataGrid
              rows={validMetas.map((elem, idx) =>
                Object.assign({}, elem, { id: idx })
              )}
              columns={columns}
              disableColumnMenu
            />
          </div>
        ) : (
          <CircularProgress size="30px" />
        )}
      </Container>
      {/* <AdSense
        client="ca-pub-7767752375383260"
        slot="8221864477"
        format="auto"
        responsive="true"
      /> */}
    </Fragment>
  );
};

export default MusicMeta;
