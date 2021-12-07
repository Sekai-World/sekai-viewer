import {
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useRootStore } from "../../../stores/root";
// import { useTranslation } from "react-i18next";
import { LanguageModel, TranslationModel } from "../../../strapi-model";
import { useInteractiveStyles } from "../../../styles/interactive";
// import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../../utils/apiClient";
import { observer } from "mobx-react-lite";

interface Props {
  languages: LanguageModel[];
  // onSelected?: (param: RowSelectedParams) => void;
}

const TableMe: React.FC<Props> = observer((props: Props) => {
  const { t } = useTranslation();
  // const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const {
    jwtToken,
    user: { metadata },
    settings: { languages },
  } = useRootStore();
  const { getTranslations, getTranslationCount, putTranslationId } =
    useStrapi(jwtToken);

  const [translations, setTranslations] = useState<TranslationModel[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [selectedWork, setSelectedWork] = useState<TranslationModel>();
  const [selectedSourceLanguage, setSelectedSourceLanguage] = useState(0);
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState(0);

  const updateData = useCallback(async () => {
    setLoading(true);

    const params = Object.assign(
      {},
      {
        targetLang_in: selectedTargetLanguage
          ? [selectedTargetLanguage]
          : metadata?.languages.map((lang) => lang.id),
      },
      selectedSourceLanguage
        ? {
            sourceLang: selectedSourceLanguage,
          }
        : {}
    );
    setRowCount(await getTranslationCount(params));
    const newRows = await getTranslations(page - 1, pageSize, params);

    setTranslations(newRows);
    setLoading(false);
  }, [
    getTranslationCount,
    getTranslations,
    metadata?.languages,
    page,
    pageSize,
    selectedSourceLanguage,
    selectedTargetLanguage,
  ]);

  useEffect(() => {
    updateData();
  }, [getTranslations, page, pageSize, updateData]);

  const columns = useMemo(
    (): GridColDef[] => [
      { field: "id", headerName: t("common:id"), width: 80 },
      {
        field: "isFin",
        headerName: "Status",
        width: 150,
        renderCell(params) {
          return (
            <Chip
              label={
                params.value
                  ? t("translate:status.finished")
                  : t("translate:status.inprogress")
              }
              color={params.value ? "primary" : "secondary"}
            />
          );
        },
      },
      {
        field: "sourceSlug",
        headerName: "Source",
        width: 150,
        renderCell(params) {
          return (
            <Link
              className={interactiveClasses.noDecoration}
              to={`/${(params.value as string).replace(":", "/")}`}
              target="_blank"
            >
              {params.value}
            </Link>
          );
        },
      },
      {
        field: "sourceLang",
        headerName: "Language",
        width: 120,
        valueFormatter(params) {
          return (params.value as LanguageModel).name;
        },
      },
      {
        field: "targetSlug",
        headerName: "Target",
        width: 150,
        renderCell(params) {
          return (
            <Link
              className={interactiveClasses.noDecoration}
              to={`/${(params.value as string).replace(":", "/")}${
                params.getValue(params.id, "isFin") ? "" : "?preview=true"
              }`}
              target="_blank"
            >
              {params.value}
            </Link>
          );
        },
      },
      {
        field: "targetLang",
        headerName: "Language",
        width: 120,
        valueFormatter(params) {
          return (params.value as LanguageModel).name;
        },
      },
    ],
    [interactiveClasses.noDecoration, t]
  );

  return (
    <Fragment>
      <Grid container spacing={2}>
        <Grid item>
          <FormControl>
            <InputLabel htmlFor="table-lang-filter">
              {t("filter:language.source")}
            </InputLabel>
            <Select
              id="table-lang-filter"
              value={selectedSourceLanguage}
              onChange={(e) =>
                setSelectedSourceLanguage(e.target.value as number)
              }
              style={{ minWidth: "150px" }}
              label={t("filter:language.source")}
            >
              <MenuItem value={0}>{t("filter:not_set")}</MenuItem>
              {languages.map((lang) => (
                <MenuItem value={lang.id}>{lang.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl>
            <InputLabel htmlFor="table-lang-filter">
              {t("filter:language.target")}
            </InputLabel>
            <Select
              id="table-lang-filter"
              value={selectedTargetLanguage}
              onChange={(e) =>
                setSelectedTargetLanguage(e.target.value as number)
              }
              style={{ minWidth: "150px" }}
              label={t("filter:language.target")}
            >
              <MenuItem value={0}>{t("filter:not_set")}</MenuItem>
              {metadata?.languages.map((lang) => (
                <MenuItem value={lang.id}>{lang.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
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
          onSelectionModelChange={(param, { api }) =>
            setSelectedWork(
              api!.getCellValue(param[0], "data") as TranslationModel
            )
          }
          disableColumnFilter
        />
      </div>
      <br />
      <Grid container spacing={2}>
        <Grid item>
          {selectedWork?.isFin ? (
            <Button
              variant="contained"
              color="secondary"
              disabled={!selectedWork}
              onClick={() =>
                putTranslationId(selectedWork!.id, { isFin: false }).then(
                  () => {
                    setSelectedWork(
                      Object.assign({}, selectedWork, { isFin: false })
                    );
                    updateData();
                  }
                )
              }
            >
              {t("translate:button.mark_unfinished")}
            </Button>
          ) : (
            selectedWork?.isFin === false && (
              <Button
                variant="contained"
                color="primary"
                disabled={!selectedWork}
                onClick={() =>
                  putTranslationId(selectedWork!.id, { isFin: true }).then(
                    () => {
                      setSelectedWork(
                        Object.assign({}, selectedWork, { isFin: true })
                      );
                      updateData();
                    }
                  )
                }
              >
                {t("translate:button.mark_finished")}
              </Button>
            )
          )}
        </Grid>
        {selectedWork?.isFin === false && (
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedWork}
              component={Link}
              to={`/translation/${selectedWork?.sourceSlug}?targetLang=${selectedWork?.targetLang?.id}`}
            >
              {t("translate:button.continue_translate")}
            </Button>
          </Grid>
        )}
      </Grid>
    </Fragment>
  );
});

export default TableMe;
