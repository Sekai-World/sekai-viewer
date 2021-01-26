import {
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { ColDef, DataGrid } from "@material-ui/data-grid";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
import { SettingContext, UserContext } from "../../../context";
import { LanguageModel, TranslationModel } from "../../../strapi-model";
import { useInteractiveStyles } from "../../../styles/interactive";
// import { useLayoutStyles } from "../../styles/layout";
import { useStrapi } from "../../../utils/apiClient";

interface Props {
  languages: LanguageModel[];
  // onSelected?: (param: RowSelectedParams) => void;
}

const TableMe: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  // const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { jwtToken, usermeta } = useContext(UserContext)!;
  const { languages } = useContext(SettingContext)!;
  const { getTranslations, getTranslationCount, putTranslationId } = useStrapi(
    jwtToken
  );

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
          : usermeta?.languages.map((lang) => lang.id),
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
    page,
    pageSize,
    selectedSourceLanguage,
    selectedTargetLanguage,
    usermeta?.languages,
  ]);

  useEffect(() => {
    updateData();
  }, [getTranslations, page, pageSize, updateData]);

  const columns = useMemo(
    (): ColDef[] => [
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
                params.getValue("isFin") ? "" : "?preview=true"
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
            >
              <MenuItem value={0}>{t("filter:not_set")}</MenuItem>
              {usermeta?.languages.map((lang) => (
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
          onPageChange={({ page }) => setPage(page)}
          onPageSizeChange={({ pageSize }) => setPageSize(pageSize)}
          loading={loading}
          rowHeight={45}
          onRowSelected={(param) =>
            setSelectedWork(param.data as TranslationModel)
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
};

export default TableMe;
