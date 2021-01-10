import { IconButton } from "@material-ui/core";
import { Avatar, Chip } from "@material-ui/core";
import { ColDef, DataGrid, RowSelectedParams } from "@material-ui/data-grid";
import { OpenInNew } from "@material-ui/icons";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { UserContext } from "../../../context";
import {
  AnnouncementModel,
  LanguageModel,
  UserMetadatumModel,
} from "../../../strapi-model";
// import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../../utils/apiClient";

interface Props {
  languages: LanguageModel[];
  onSelected?: (param: RowSelectedParams) => void;
}

const TableMe: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  // const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const { jwtToken } = useContext(UserContext)!;
  const { getAnnouncementCount, getAnnouncementPage } = useStrapi(jwtToken);

  const [translations, setTranslations] = useState<AnnouncementModel[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setRowCount(await getAnnouncementCount());
    })();
  }, [getAnnouncementCount]);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);

      const newRows = await getAnnouncementPage(pageSize, page - 1);

      if (!active) return;

      setTranslations(newRows);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [getAnnouncementPage, page, pageSize]);

  const columns = useMemo(
    (): ColDef[] => [
      {
        field: "action",
        headerName: t("home:game-news.action"),
        width: 100,
        renderCell(params) {
          const id = params.getValue("id") as number;
          return (
            <Link target="_blank" to={`/announcement/${id}`}>
              <IconButton color="primary" disableRipple>
                <OpenInNew></OpenInNew>
              </IconButton>
            </Link>
          );
        },
        sortable: false,
        filterable: false,
      },
      { field: "id", headerName: "ID", width: 80 },
      {
        field: "title",
        headerName: t("announcement:title"),
        width: 200,
      },
      {
        field: "language",
        headerName: t("announcement:language"),
        width: 150,
        valueGetter(params) {
          return (params.value as LanguageModel).name;
        },
        sortable: false,
      },
      {
        field: "user",
        headerName: t("announcement:author"),
        width: 200,
        renderCell(params) {
          return (
            <Chip
              label={(params.value as UserMetadatumModel).nickname}
              avatar={
                <Avatar
                  src={
                    ((params.value as UserMetadatumModel).avatar || { url: "" })
                      .url
                  }
                />
              }
            />
          );
        },
      },
    ],
    [t]
  );

  return (
    <div style={{ height: "350px" }}>
      <DataGrid
        rows={translations}
        columns={columns}
        pagination
        pageSize={pageSize}
        rowCount={rowCount}
        paginationMode="server"
        onPageChange={({ page }) => setPage(page)}
        onPageSizeChange={({ pageSize }) => setPageSize(pageSize)}
        loading={loading}
        rowHeight={45}
        onRowSelected={props.onSelected}
      />
    </div>
  );
};

export default TableMe;
