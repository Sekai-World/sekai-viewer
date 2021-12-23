import { OpenInNew } from "@mui/icons-material";
import {
  Paper,
  Tabs,
  Tab,
  Dialog,
  IconButton,
  Link,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInteractiveStyles } from "../../styles/interactive";
import { IUserInformationInfo, ServerRegion } from "../../types";
import { useCachedData } from "../../utils";

const useIframeStyle = makeStyles((theme) => ({
  iframe: {
    [theme.breakpoints.down("md")]: {
      width: "300px",
      height: "480px",
    },
    [theme.breakpoints.up("md")]: {
      width: "600px",
      height: "480px",
    },
  },
}));

function InfoInternal(props: { onClick: () => void }) {
  return (
    <IconButton color="primary" onClick={props.onClick} size="large">
      <OpenInNew></OpenInNew>
    </IconButton>
  );
}

function InfoInternalDialog(props: {
  url: string;
  open: boolean;
  onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
  title: string;
}) {
  const classes = useIframeStyle();
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <Typography>{props.title}</Typography>
      <iframe
        className={classes.iframe}
        title={props.title}
        src={props.url}
      ></iframe>
    </Dialog>
  );
}

const SekaiGameNews: React.FC<{
  isShowSpoiler: boolean;
  region: ServerRegion;
}> = ({ isShowSpoiler, region }) => {
  const theme = useTheme();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  const isUpMd = useMediaQuery(theme.breakpoints.up("md"));

  const [informations] =
    useCachedData<IUserInformationInfo>("userInformations");

  const [gameNewsTag, setGameNewsTag] = useState<string>("information");
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "startAt",
      sort: "desc",
    },
  ]);
  const [open, setOpen] = useState<boolean>(false);
  const [info, setInfo] = useState<IUserInformationInfo>();

  const columns: GridColDef[] = [
    {
      field: "action",
      headerName: t("home:game-news.action"),
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        const info = params.row as IUserInformationInfo;
        return info.browseType === "internal" ? (
          <InfoInternal
            onClick={() => {
              setInfo(info);
              setOpen(true);
            }}
          />
        ) : (
          <Link target="_blank" href={info.path} underline="hover">
            <IconButton color="primary" size="large">
              <OpenInNew></OpenInNew>
            </IconButton>
          </Link>
        );
      },
      sortable: false,
    },
    // { field: "id", headerName: "ID", width: 60 },
    {
      field: "startAt",
      headerName: t("home:game-news.show-from"),
      width: 200,
      valueFormatter: (params: GridValueFormatterParams) =>
        new Date(
          params.api.getCellValue(params.id, "startAt") as number
        ).toLocaleString(),
    },
    {
      field: "title",
      headerName: t("home:game-news.title-column"),
      width: isUpMd ? 600 : 150,
      sortable: false,
    },
    {
      field: "endAt",
      headerName: t("home:game-news.show-until"),
      width: 200,
      valueFormatter: (params: GridValueFormatterParams) =>
        new Date(
          params.api.getCellValue(params.id, "startAt") as number
        ).toLocaleString(),
    },
  ];

  return (
    <Fragment>
      <Paper className={interactiveClasses.container}>
        <Tabs
          value={gameNewsTag}
          onChange={(e, v) => setGameNewsTag(v)}
          variant="scrollable"
          scrollButtons
        >
          <Tab label={t("common:information")} value="information"></Tab>
          <Tab label={t("common:event")} value="event"></Tab>
          <Tab label={t("common:gacha")} value="gacha"></Tab>
          <Tab label={t("common:music")} value="music"></Tab>
          <Tab label={t("common:campaign")} value="campaign"></Tab>
          <Tab label={t("common:bug")} value="bug"></Tab>
          <Tab label={t("home:update")} value="update"></Tab>
        </Tabs>
      </Paper>
      <div style={{ height: 650 }}>
        <DataGrid
          pagination
          autoPageSize
          rows={
            informations
              ? informations.filter(
                  (info) =>
                    info.informationTag === gameNewsTag &&
                    (!isShowSpoiler
                      ? info.startAt < new Date().getTime()
                      : true)
                )
              : []
          }
          columns={columns}
          disableColumnMenu
          disableSelectionOnClick
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          loading={!informations}
        ></DataGrid>
      </div>
      <InfoInternalDialog
        url={
          info
            ? info.path.match(/^http/)
              ? info.path
              : region === "en"
              ? `https://n-production-web.sekai-en.com/${info.path}`
              : `https://production-web.sekai.colorfulpalette.org/${info.path}`
            : ""
        }
        open={open}
        onClose={() => setOpen(false)}
        title={info?.title || ""}
      />
    </Fragment>
  );
};

export default SekaiGameNews;
