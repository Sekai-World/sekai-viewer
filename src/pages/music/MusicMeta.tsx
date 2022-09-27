import { IconButton } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { OpenInNew } from "@mui/icons-material";
import React, { Fragment, useEffect } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IMusicInfo, IMusicMeta } from "../../types.d";
import { filterMusicMeta, useCachedData, useMusicMeta } from "../../utils";
// import AdSense from "../../components/blocks/AdSense";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import LinkNoDecoration from "../../components/styled/LinkNoDecoration";
import ChipDifficulty from "../../components/styled/ChipDifficulty";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";

const MusicMeta = () => {
  const { t } = useTranslation();

  const [metas] = useMusicMeta();
  const [musics] = useCachedData<IMusicInfo>("musics");

  const [validMetas, setValidMetas] = useState<IMusicMeta[]>([]);

  const columns: GridColDef[] = [
    {
      field: "music_id",
      headerName: t("common:id"),
      width: 90,
      renderCell(params) {
        return (
          <LinkNoDecoration to={`/music/${params.value}`} target="_blank">
            {params.value}
            <IconButton color="primary" size="large">
              <OpenInNew></OpenInNew>
            </IconButton>
          </LinkNoDecoration>
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
            contentKey={`music_titles:${params.getValue(
              params.id,
              "music_id"
            )}`}
            original={
              musics
                ? musics.find(
                    (music) =>
                      music.id === params.getValue(params.id, "music_id")
                  )!.title
                : String(params.getValue(params.id, "music_id"))
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
          <ChipDifficulty
            difficulty={params.row["difficulty"]}
            value={params.value}
          ></ChipDifficulty>
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
      <TypographyHeader>{t("common:musicMeta")}</TypographyHeader>
      <ContainerContent>
        <div style={{ height: 750 }}>
          <DataGrid
            rows={validMetas.map((elem, idx) =>
              Object.assign({}, elem, { id: idx })
            )}
            columns={columns}
            disableColumnMenu
            loading={!validMetas.length}
          />
        </div>
      </ContainerContent>
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
