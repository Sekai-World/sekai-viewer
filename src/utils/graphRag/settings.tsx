import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Switch,
  Slider,
  LinearProgress,
  Typography,
  IconButton,
  Box,
  Paper,
  Stack,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Select,
  MenuItem,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import HubIcon from "@mui/icons-material/Hub";
import LinkIcon from "@mui/icons-material/Link";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import { GraphRAGIndexingOrchestrator } from "./indexing";
import { GraphRAGExport, graphRAGStore } from "./storage";
import { IndexingProgress } from "./types";
import { useCachedData } from "../index";
import {
  IUnitStory,
  IEventStory,
  ICharacter2D,
  IGameChara,
  ICharaProfile,
} from "../../types.d";
import { GraphViewer } from "./GraphViewer";
import { embeddingService, EMBEDDING_MODELS } from "./embeddings";
import { useSnackbar } from "notistack";

interface GraphRAGSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const GraphRAGSettingsDialog = observer(
  ({ open, onClose }: GraphRAGSettingsDialogProps) => {
    const {
      settings: {
        region,
        enableGraphRAG,
        graphRAGEventsPerCharacter,
        graphRAGMaxDirectCharacterRelations,
        graphRAGSimilarityThreshold,
        graphRAGIncludeFutureContext,
        graphRAGEmbeddingModel,
        llmTranslationProvider,
        llmConfigs,
        targetLanguage,
        enableApiRetry,
        maxApiRetries,
        setEnableGraphRAG,
        setGraphRAGEventsPerCharacter,
        setGraphRAGMaxDirectCharacterRelations,
        setGraphRAGSimilarityThreshold,
        setGraphRAGIncludeFutureContext,
        setGraphRAGEmbeddingModel,
      },
    } = useRootStore();

    const [unitStories] = useCachedData<IUnitStory>("unitStories");
    const [eventStories] = useCachedData<IEventStory>("eventStories");
    const [character2ds] = useCachedData<ICharacter2D>("character2ds");
    const [gameCharacters] = useCachedData<IGameChara>("gameCharacters");
    const [charaProfiles] = useCachedData<ICharaProfile>("characterProfiles");

    const [indexingProgress, setIndexingProgress] = useState<IndexingProgress>({
      total: 0,
      current: 0,
      currentEpisode: "",
      status: "idle",
      processedCount: 0,
    });
    const [indexingOrchestrator, setIndexingOrchestrator] =
      useState<GraphRAGIndexingOrchestrator | null>(null);
    const [graphStats, setGraphStats] = useState({ nodes: 0, edges: 0 });
    const [viewerOpen, setViewerOpen] = useState(false);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [pendingGraphImport, setPendingGraphImport] =
      useState<GraphRAGExport | null>(null);
    const [isImportingGraph, setIsImportingGraph] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const isRunning = indexingProgress.status === "running";
    const dataReady = Boolean(unitStories && eventStories && character2ds);

    // Load graph stats when dialog opens
    useEffect(() => {
      const loadGraphStats = async () => {
        try {
          await graphRAGStore.init();
          setGraphStats(await graphRAGStore.getVisualizationStats());
        } catch (error) {
          console.error("Failed to load graph stats:", error);
        }
      };
      if (open && enableGraphRAG) {
        loadGraphStats();
      }
    }, [open, enableGraphRAG]);

    // Auto-dismiss success message after 5 seconds
    useEffect(() => {
      if (indexingProgress.status === "completed") {
        const timer = setTimeout(() => {
          setIndexingProgress((prev) => ({ ...prev, status: "idle" }));
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [indexingProgress.status]);

    // Once indexing actually stops (aborted or otherwise), clear the
    // "cancelling" flag so the UI doesn't get stuck saying "will cancel
    // after this story finishes".
    useEffect(() => {
      if (indexingProgress.status !== "running") {
        setIsCancelling(false);
      }
    }, [indexingProgress.status]);

    const handleStartIndexing = useCallback(async () => {
      if (!unitStories || !eventStories) {
        console.error("Story data not loaded");
        return;
      }

      if (!gameCharacters || !charaProfiles) {
        console.error("Character data not loaded yet, waiting...");
        return;
      }

      setIsCancelling(false);

      // Calculate estimated time
      const totalStories =
        (unitStories?.length || 0) + (eventStories?.length || 0);
      const estimatedMinutes = Math.ceil(totalStories * 0.5); // ~30s per story
      setEstimatedTime(
        estimatedMinutes > 60
          ? `~${Math.ceil(estimatedMinutes / 60)}h`
          : `~${estimatedMinutes}min`
      );

      const config = {
        provider: llmTranslationProvider,
        model: llmConfigs[llmTranslationProvider].model,
        apiKey: llmConfigs[llmTranslationProvider].apiKey,
        apiEndpoint: llmConfigs[llmTranslationProvider].endpoint,
        enableRetry: enableApiRetry,
        maxRetries: maxApiRetries,
      };

      // Retry callback to show snackbar notifications
      const onRetry = (
        attempt: number,
        maxRetries: number,
        delayMs: number,
        error: string
      ) => {
        enqueueSnackbar(
          `API call failed. Retrying ${attempt}/${maxRetries} in ${delayMs / 1000}s... (${error})`,
          { variant: "warning", autoHideDuration: delayMs }
        );
      };

      const orchestrator = new GraphRAGIndexingOrchestrator(
        config,
        targetLanguage,
        graphRAGSimilarityThreshold,
        region,
        setIndexingProgress,
        onRetry
      );

      setIndexingOrchestrator(orchestrator);

      try {
        await orchestrator.indexAllStories(
          unitStories,
          eventStories,
          gameCharacters ?? [],
          charaProfiles ?? []
        );
        // Reload stats after indexing
        setGraphStats(await graphRAGStore.getVisualizationStats());
      } catch (error) {
        console.error("Indexing failed:", error);
      }
    }, [
      unitStories,
      eventStories,
      gameCharacters,
      charaProfiles,
      llmTranslationProvider,
      llmConfigs,
      targetLanguage,
      graphRAGSimilarityThreshold,
      region,
      enableApiRetry,
      maxApiRetries,
      enqueueSnackbar,
    ]);

    const handleCancelIndexing = useCallback(() => {
      if (indexingOrchestrator) {
        setIsCancelling(true);
        indexingOrchestrator.abort();
      }
    }, [indexingOrchestrator]);

    const handleClearGraph = useCallback(async () => {
      setIsClearing(true);
      try {
        await graphRAGStore.clear();
        setGraphStats({ nodes: 0, edges: 0 });
        setIndexingProgress({
          total: 0,
          current: 0,
          currentEpisode: "",
          status: "idle",
          processedCount: 0,
        });
      } catch (error) {
        console.error("Failed to clear graph:", error);
      } finally {
        setIsClearing(false);
        setClearConfirmOpen(false);
      }
    }, []);

    const handleExportGraph = useCallback(async () => {
      try {
        await graphRAGStore.init();
        const archive = await graphRAGStore.exportGraph();
        const blob = new Blob([JSON.stringify(archive, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `sekai-graph-rag-${new Date()
          .toISOString()
          .slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to export graph:", error);
        enqueueSnackbar("Failed to export the knowledge graph.", {
          variant: "error",
        });
      }
    }, [enqueueSnackbar]);

    const handleGraphImportFile = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        try {
          const archive = JSON.parse(await file.text()) as GraphRAGExport;
          setPendingGraphImport(archive);
        } catch (error) {
          console.error("Failed to read graph archive:", error);
          enqueueSnackbar("The selected file is not valid JSON.", {
            variant: "error",
          });
        }
      },
      [enqueueSnackbar]
    );

    const handleConfirmGraphImport = useCallback(async () => {
      if (!pendingGraphImport) return;

      setIsImportingGraph(true);
      try {
        await graphRAGStore.init();
        await graphRAGStore.importGraph(pendingGraphImport);
        setGraphStats(await graphRAGStore.getVisualizationStats());
        setPendingGraphImport(null);
        enqueueSnackbar("Knowledge graph imported successfully.", {
          variant: "success",
        });
      } catch (error) {
        console.error("Failed to import graph:", error);
        enqueueSnackbar(
          error instanceof Error
            ? error.message
            : "Failed to import the knowledge graph.",
          { variant: "error" }
        );
      } finally {
        setIsImportingGraph(false);
      }
    }, [pendingGraphImport, enqueueSnackbar]);

    const progressPercent = useMemo(
      () =>
        indexingProgress.total > 0
          ? Math.round(
              (indexingProgress.current / indexingProgress.total) * 100
            )
          : 0,
      [indexingProgress]
    );

    return (
      <>
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: "90vh",
            },
          }}
        >
          <DialogTitle
            sx={{ display: "flex", alignItems: "center", gap: 1.5, pr: 6 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                flexShrink: 0,
              }}
            >
              <AccountTreeIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>
                Knowledge Graph
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Give translations context about characters and events
              </Typography>
            </Box>
            <IconButton
              aria-label="Close dialog"
              onClick={onClose}
              sx={{
                position: "absolute",
                right: 12,
                top: 12,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ pt: 2 }}>
            <Stack spacing={2.5}>
              {/* Enable Toggle */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <FormControlLabel
                  sx={{ m: 0, width: "100%", alignItems: "flex-start" }}
                  labelPlacement="start"
                  control={
                    <Switch
                      checked={enableGraphRAG}
                      onChange={(_, v) => setEnableGraphRAG(v)}
                      sx={{ mt: -0.5 }}
                      inputProps={{ "aria-label": "Enable Graph RAG" }}
                    />
                  }
                  label={
                    <Box sx={{ pr: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Enable Graph RAG
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enhance translations with character relationships, past
                        events, and terminology.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              {enableGraphRAG && (
                <>
                  {/* Indexing Section - Primary Action Area */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                      border: "2px solid",
                      borderColor: "primary.main",
                    }}
                  >
                    <Stack spacing={2}>
                      {/* Header */}
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          gutterBottom
                        >
                          Build Knowledge Graph
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Index all Unit Stories and Event Stories to build the
                          knowledge graph. Each story is processed in a single
                          LLM call (all episodes combined).
                        </Typography>
                      </Box>

                      {!dataReady && (
                        <Alert severity="info" variant="outlined">
                          Waiting for story and character data to finish
                          loading…
                        </Alert>
                      )}

                      {/* Action Buttons */}
                      <Stack
                        direction="row"
                        spacing={1.5}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <LoadingButton
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={<AutoAwesomeIcon />}
                          loading={isRunning}
                          loadingPosition="start"
                          onClick={handleStartIndexing}
                          disabled={!dataReady}
                          sx={{ flex: "1 1 auto", minWidth: 200 }}
                        >
                          {indexingProgress.status === "completed"
                            ? "Re-index All Stories"
                            : `Index All Stories${estimatedTime && !isRunning ? ` (${estimatedTime})` : ""}`}
                        </LoadingButton>

                        {isRunning && (
                          <Button
                            variant="outlined"
                            color="warning"
                            size="large"
                            onClick={() => setCancelConfirmOpen(true)}
                            disabled={isCancelling}
                          >
                            {isCancelling ? "Cancelling…" : "Cancel"}
                          </Button>
                        )}

                        {graphStats.nodes > 0 && !isRunning && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="large"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => setClearConfirmOpen(true)}
                          >
                            Clear Graph
                          </Button>
                        )}
                      </Stack>

                      {/* Progress Display */}
                      {isRunning && (
                        <Box
                          role="status"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2" fontWeight={500}>
                              Processing story {indexingProgress.current} of{" "}
                              {indexingProgress.total}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={600}
                            >
                              {progressPercent}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progressPercent}
                            sx={{ borderRadius: 1, height: 8 }}
                            aria-label={`Indexing progress: ${progressPercent}%`}
                          />
                          {isCancelling && (
                            <Typography
                              variant="caption"
                              color="warning.main"
                              sx={{ mt: 0.5, display: "block" }}
                            >
                              Cancelling… the story currently in progress will
                              finish its LLM call first, then indexing will
                              stop.
                            </Typography>
                          )}
                          {indexingProgress.currentEpisode && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 0.5, display: "block" }}
                              noWrap
                            >
                              {indexingProgress.currentEpisode}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {indexingProgress.status === "completed" && (
                        <Alert
                          severity="success"
                          variant="outlined"
                          role="status"
                        >
                          Indexing completed successfully
                        </Alert>
                      )}

                      {indexingProgress.status === "error" && (
                        <Alert
                          severity="error"
                          variant="outlined"
                          role="alert"
                          action={
                            <Button
                              color="inherit"
                              size="small"
                              onClick={handleStartIndexing}
                              startIcon={<AutoAwesomeIcon />}
                            >
                              Retry
                            </Button>
                          }
                        >
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            gutterBottom
                          >
                            Indexing failed
                          </Typography>
                          <Typography variant="body2">
                            {indexingProgress.error ||
                              "An error occurred during indexing. Please try again."}
                          </Typography>
                        </Alert>
                      )}
                    </Stack>
                  </Paper>

                  {/* Stats + View Graph */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1.5,
                      transition: "border-color 150ms, box-shadow 150ms",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: 1,
                      },
                    }}
                  >
                    <Box sx={{ mr: "auto" }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        gutterBottom
                      >
                        Current Graph Status
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          icon={<HubIcon />}
                          label={`${graphStats.nodes} nodes`}
                          size="small"
                          variant="outlined"
                          color={graphStats.nodes > 0 ? "primary" : "default"}
                          sx={{
                            transition: "all 200ms ease-out",
                            "&:hover": {
                              borderColor: "primary.main",
                              backgroundColor: "action.hover",
                            },
                          }}
                        />
                        <Chip
                          icon={<LinkIcon />}
                          label={`${graphStats.edges} edges`}
                          size="small"
                          variant="outlined"
                          color={graphStats.edges > 0 ? "primary" : "default"}
                          sx={{
                            transition: "all 200ms ease-out",
                            "&:hover": {
                              borderColor: "primary.main",
                              backgroundColor: "action.hover",
                            },
                          }}
                        />
                      </Stack>
                    </Box>
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setViewerOpen(true)}
                      disabled={graphStats.nodes === 0}
                      sx={{
                        "&.Mui-disabled": {
                          cursor: "not-allowed",
                          pointerEvents: "auto",
                        },
                      }}
                      title={
                        graphStats.nodes === 0
                          ? "No graph data yet. Run indexing first."
                          : ""
                      }
                    >
                      View Graph
                    </Button>
                  </Paper>

                  {/* Advanced Settings */}
                  <Accordion
                    disableGutters
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      "&::before": { display: "none" },
                      transition: "border-color 150ms",
                      "&:hover": {
                        borderColor: "primary.light",
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TuneIcon fontSize="small" color="action" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Advanced Settings
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={3}>
                        {/* Events per character */}
                        <FormControl fullWidth>
                          <FormLabel>
                            Events per character: {graphRAGEventsPerCharacter}
                          </FormLabel>
                          <Slider
                            value={graphRAGEventsPerCharacter}
                            onChange={(_, v) =>
                              setGraphRAGEventsPerCharacter(v as number)
                            }
                            min={5}
                            max={20}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Maximum past events to retrieve per character
                            (default: 10)
                          </Typography>
                        </FormControl>

                        {/* Direct character relations */}
                        <FormControl fullWidth>
                          <FormLabel>
                            Direct character relations:{" "}
                            {graphRAGMaxDirectCharacterRelations}
                          </FormLabel>
                          <Slider
                            value={graphRAGMaxDirectCharacterRelations}
                            onChange={(_, v) =>
                              setGraphRAGMaxDirectCharacterRelations(
                                v as number
                              )
                            }
                            min={0}
                            max={20}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Maximum direct relationships between characters in
                            the current story, selected by similarity (default:
                            10)
                          </Typography>
                        </FormControl>

                        {/* Similarity threshold */}
                        <FormControl fullWidth>
                          <FormLabel>
                            Similarity threshold:{" "}
                            {graphRAGSimilarityThreshold.toFixed(2)}
                          </FormLabel>
                          <Slider
                            value={graphRAGSimilarityThreshold}
                            onChange={(_, v) =>
                              setGraphRAGSimilarityThreshold(v as number)
                            }
                            min={0.7}
                            max={0.95}
                            step={0.05}
                            marks
                            valueLabelDisplay="auto"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Higher values create more unique nodes; lower values
                            merge similar events (default: 0.85)
                          </Typography>
                        </FormControl>

                        <Divider />

                        {/* Include future context */}
                        <FormControlLabel
                          sx={{ m: 0, width: "100%", alignItems: "flex-start" }}
                          labelPlacement="start"
                          control={
                            <Switch
                              checked={graphRAGIncludeFutureContext}
                              onChange={(_, v) =>
                                setGraphRAGIncludeFutureContext(v)
                              }
                              sx={{ mt: -0.5 }}
                              inputProps={{
                                "aria-label": "Include Future Context",
                              }}
                            />
                          }
                          label={
                            <Box sx={{ pr: 2 }}>
                              <Typography variant="body2" fontWeight={600}>
                                Include Future Context
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Include events from future episodes (helps with
                                foreshadowing, but may contain spoilers)
                              </Typography>
                            </Box>
                          }
                        />

                        <Divider />

                        {/* Graph backup */}
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            gutterBottom
                          >
                            Graph Backup
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mb: 1.5 }}
                          >
                            Export or replace the indexed graph, including
                            embeddings and processed-story history.
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              onClick={handleExportGraph}
                            >
                              Export Graph
                            </Button>
                            <Button
                              component="label"
                              size="small"
                              variant="outlined"
                              color="warning"
                              startIcon={<UploadFileIcon />}
                            >
                              Import Graph
                              <input
                                hidden
                                type="file"
                                accept="application/json,.json"
                                onChange={handleGraphImportFile}
                              />
                            </Button>
                          </Stack>
                        </Box>

                        <Divider />

                        {/* Embedding Model Selection */}
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            gutterBottom
                          >
                            Embedding Model
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mb: 1.5 }}
                          >
                            Choose the model for generating embeddings (runs
                            locally in browser)
                          </Typography>

                          <FormControl fullWidth>
                            <FormLabel>Model</FormLabel>
                            <Select
                              value={graphRAGEmbeddingModel}
                              onChange={(e) =>
                                setGraphRAGEmbeddingModel(e.target.value)
                              }
                              size="small"
                            >
                              {EMBEDDING_MODELS.transformers.map((model) => (
                                <MenuItem key={model.id} value={model.id}>
                                  <Box>
                                    <Typography variant="body2">
                                      {model.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {model.dims} dims • {model.speed}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              Changing the model will require clearing
                              embeddings and re-indexing
                            </Typography>
                          </FormControl>

                          {graphStats.nodes > 0 && (
                            <Alert
                              severity="warning"
                              variant="outlined"
                              sx={{ mt: 2 }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="caption">
                                    Model changed? Clear embeddings and re-index
                                    to update.
                                  </Typography>
                                </Box>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={async () => {
                                    await graphRAGStore.clearEmbeddings();
                                    await embeddingService.clearCache();
                                  }}
                                >
                                  Clear Embeddings
                                </Button>
                              </Stack>
                            </Alert>
                          )}
                        </Box>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={onClose} variant="text" color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel indexing confirmation */}
        <Dialog
          open={cancelConfirmOpen}
          onClose={() => setCancelConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WarningAmberIcon color="warning" />
            Cancel indexing?
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              The story currently being processed has already started its LLM
              call and will finish before indexing stops. Stories already
              completed ({indexingProgress.current} of {indexingProgress.total})
              are saved and won&apos;t be re-processed next time.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCancelConfirmOpen(false)} variant="text">
              Continue Indexing
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() => {
                handleCancelIndexing();
                setCancelConfirmOpen(false);
              }}
            >
              Cancel Indexing
            </Button>
          </DialogActions>
        </Dialog>

        {/* Graph import confirmation */}
        <Dialog
          open={Boolean(pendingGraphImport)}
          onClose={() =>
            !isImportingGraph ? setPendingGraphImport(null) : undefined
          }
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WarningAmberIcon color="warning" />
            Replace knowledge graph?
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Importing will replace the current graph with the selected
              archive, including its indexed-story history. The current graph
              will be lost unless it has been exported.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setPendingGraphImport(null)}
              disabled={isImportingGraph}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              color="warning"
              loading={isImportingGraph}
              onClick={handleConfirmGraphImport}
            >
              Replace Graph
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* Clear graph confirmation */}
        <Dialog
          open={clearConfirmOpen}
          onClose={() => (!isClearing ? setClearConfirmOpen(false) : undefined)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WarningAmberIcon color="error" />
            Clear knowledge graph?
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              This will permanently delete all {graphStats.nodes} nodes and{" "}
              {graphStats.edges} edges from the knowledge graph. This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setClearConfirmOpen(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              color="error"
              loading={isClearing}
              onClick={handleClearGraph}
            >
              Clear Graph
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* Graph Viewer Dialog */}
        <GraphViewer open={viewerOpen} onClose={() => setViewerOpen(false)} />
      </>
    );
  }
);
