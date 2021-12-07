import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Avatar, Chip } from "@mui/material";
import {
  GridColDef,
  DataGrid,
  GridSelectionModel,
  GridCallbackDetails,
} from "@mui/x-data-grid";
import { OpenInNew } from "@mui/icons-material";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  AnnouncementModel,
  LanguageModel,
  UserMetadatumModel,
} from "../../../strapi-model";
// import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../../utils/apiClient";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../../stores/root";

interface Props {
  languages: LanguageModel[];
  onSelected?: (
    selectionModel: GridSelectionModel,
    details: GridCallbackDetails
  ) => void;
}

const TableMe: React.FC<Props> = observer((props: Props) => {
  const { t } = useTranslation();
  // const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const {
    jwtToken,
    settings: { languages },
  } = useRootStore();
  const { getAnnouncementCount, getAnnouncementPage } = useStrapi(jwtToken);

  const [translations, setTranslations] = useState<AnnouncementModel[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(0);

  useEffect(() => {
    (async () => {
      setRowCount(
        await getAnnouncementCount(
          selectedLanguage
            ? {
                language: selectedLanguage,
              }
            : {}
        )
      );
    })();
  }, [getAnnouncementCount, selectedLanguage]);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);

      const newRows = await getAnnouncementPage(
        pageSize,
        page - 1,
        selectedLanguage
          ? {
              language: selectedLanguage,
            }
          : {}
      );

      if (!active) return;

      setTranslations(newRows);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [getAnnouncementPage, page, pageSize, selectedLanguage]);

  const columns = useMemo(
    (): GridColDef[] => [
      {
        field: "action",
        headerName: t("home:game-news.action"),
        width: 100,
        renderCell(params) {
          const id = params.getValue(params.id, "id") as number;
          return (
            <Link target="_blank" to={`/announcement/${id}`}>
              <IconButton color="primary" disableRipple size="large">
                <OpenInNew></OpenInNew>
              </IconButton>
            </Link>
          );
        },
        sortable: false,
        filterable: false,
      },
      { field: "id", headerName: t("common:id"), width: 80 },
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
    <Fragment>
      <FormControl>
        <InputLabel htmlFor="table-lang-filter">
          {t("filter:language.caption")}
        </InputLabel>
        <Select
          id="table-lang-filter"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value as number)}
          style={{ minWidth: "150px" }}
          label={t("filter:language.caption")}
        >
          <MenuItem value={0}>{t("filter:not_set")}</MenuItem>
          {languages.map((lang) => (
            <MenuItem value={lang.id}>{lang.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <br />
      <br />
      <div style={{ height: "350px" }}>
        <DataGrid
          rows={translations}
          columns={columns}
          pagination
          pageSize={pageSize}
          rowCount={rowCount}
          paginationMode="server"
          onPageChange={(page) => setPage(page)}
          onPageSizeChange={(pageSize) => setPageSize(pageSize)}
          loading={loading}
          rowHeight={45}
          onSelectionModelChange={props.onSelected}
          disableColumnFilter
        />
      </div>
    </Fragment>
  );
});

export default TableMe;
