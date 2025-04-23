import {
  FormControl,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
} from "@mui/material";
import {
  GridColDef,
  DataGrid,
  GridSortItem,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { OpenInNew, Search } from "@mui/icons-material";
import React, { Fragment, useEffect } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IMusicDifficultyInfo, IMusicInfo, IMusicMeta } from "../../types.d";
import {
  addDataToMusicMeta,
  filterMusicMeta,
  useCachedData,
  useMusicMeta,
} from "../../utils";
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
  const [musicDifficulties] =
    useCachedData<IMusicDifficultyInfo>("musicDifficulties");

  const [validMetas, setValidMetas] = useState<IMusicMeta[]>([]);
  const [validMetasCache, setValidMetasCache] = useState<IMusicMeta[]>([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [sortModel, setSortModel] = useState<GridSortItem[]>([
    {
      field: "music_id",
      sort: "asc",
    },
  ]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 1,
    pageSize: 20,
  });

  const columns: GridColDef[] = [
    {
      field: "music_id",
      headerName: t("common:id"),
      width: 100,
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
      width: 300,
      sortable: false,
      renderCell(params) {
        return (
          <ContentTrans
            contentKey={`music_titles:${params.row["music_id"]}`}
            original={
              musics
                ? musics.find((music) => music.id === params.row["music_id"])!
                    .title
                : String(params.row["music_id"])
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
      field: "note_count",
      headerName: t("music:noteCount"),
      width: 110,
      align: "center",
    },
    {
      field: "base_score",
      headerName: t("music:baseScore"),
      width: 120,
      align: "center",
      valueFormatter(value: number) {
        return value.toFixed(3);
      },
    },
    {
      field: "fever_score",
      headerName: t("music:feverScore"),
      width: 120,
      align: "center",
      valueFormatter(value: number) {
        return value.toFixed(3);
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
    if (metas && musicDifficulties) {
      const filteredMetas = filterMusicMeta(metas, musicDifficulties);
      setValidMetas(addDataToMusicMeta(filteredMetas, musicDifficulties));
      setValidMetasCache(addDataToMusicMeta(filteredMetas, musicDifficulties));
    }
  }, [metas, musicDifficulties]);

  const filterBySongName = () => {
    if (searchTitle && musics?.length) {
      const filteredMetas = validMetasCache.filter((meta) =>
        musics.some(
          (music) =>
            music.id === meta.music_id &&
            music.title.toLowerCase().includes(searchTitle.toLowerCase())
        )
      );
      setValidMetas(filteredMetas);
    } else {
      setValidMetas(validMetasCache);
    }
  };

  return (
    <Fragment>
      <TypographyHeader>{t("common:musicMeta")}</TypographyHeader>
      <ContainerContent>
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <FormControl variant="standard" size="small">
              <InputLabel htmlFor="search-song-name">Song Name</InputLabel>
              <Input
                id="search-song-name"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") filterBySongName();
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="search button"
                      onClick={filterBySongName}
                    >
                      <Search />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Grid>
          <Grid item>
            <DataGrid
              rows={validMetas.map((elem, idx) =>
                Object.assign({}, elem, { id: idx })
              )}
              columns={columns}
              disableColumnMenu
              loading={!validMetas.length}
              sx={{ height: 700, width: "100%" }}
              sortModel={sortModel}
              onSortModelChange={(model) => setSortModel(model)}
              paginationModel={paginationModel}
              onPaginationModelChange={(model) => setPaginationModel(model)}
              pageSizeOptions={[10, 20, 50, 100]}
              pagination
            />
          </Grid>
        </Grid>
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
