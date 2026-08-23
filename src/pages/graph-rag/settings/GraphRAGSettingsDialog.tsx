import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  IconButton,
  Box,
  Paper,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../../stores/root";
import { GraphRAGIndexingOrchestrator } from "../../../utils/graphRag/indexing";
import { GraphRAGExport, graphRAGStore } from "../../../utils/graphRag/storage";
import { IndexingProgress } from "../../../utils/graphRag/types";
import { useCachedData } from "../../../utils/index";
import {
  IUnitStory,
  IEventStory,
  ICharacter2D,
  IGameChara,
  ICharaProfile,
} from "../../../types";
import { GraphViewer } from "../viewer/GraphViewer";
import { embeddingService } from "../../../utils/graphRag/embeddings";
import { useSnackbar } from "notistack";
import { GraphRAGIndexingPanel } from "./GraphRAGIndexingPanel";
import { GraphRAGGraphStatus } from "./GraphRAGGraphStatus";
import { GraphRAGAdvancedSettings } from "./GraphRAGAdvancedSettings";
import { GraphRAGConfirmDialogs } from "./GraphRAGConfirmDialogs";

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
    const [isIndexing, setIsIndexing] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const isRunning = isIndexing || indexingProgress.status === "running";
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
      if (isImportingGraph || pendingGraphImport) {
        return;
      }

      if (!unitStories || !eventStories) {
        console.error("Story data not loaded");
        return;
      }

      if (!gameCharacters || !charaProfiles) {
        console.error("Character data not loaded yet, waiting...");
        return;
      }

      setIsCancelling(false);
      setIsIndexing(true);

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
      };

      const orchestrator = new GraphRAGIndexingOrchestrator(
        config,
        targetLanguage,
        graphRAGSimilarityThreshold,
        region,
        setIndexingProgress
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
      } finally {
        setIsIndexing(false);
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
      isImportingGraph,
      pendingGraphImport,
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
        if (isRunning || isImportingGraph) {
          event.target.value = "";
          return;
        }

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
      [enqueueSnackbar, isImportingGraph, isRunning]
    );

    const handleConfirmGraphImport = useCallback(async () => {
      if (!pendingGraphImport || isRunning) return;

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
    }, [pendingGraphImport, enqueueSnackbar, isRunning]);

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
                  <GraphRAGIndexingPanel
                    dataReady={dataReady}
                    isRunning={isRunning}
                    isImportingGraph={isImportingGraph}
                    pendingGraphImport={pendingGraphImport}
                    indexingProgress={indexingProgress}
                    estimatedTime={estimatedTime}
                    isCancelling={isCancelling}
                    graphStats={graphStats}
                    onStartIndexing={handleStartIndexing}
                    onRequestCancel={() => setCancelConfirmOpen(true)}
                    onRequestClear={() => setClearConfirmOpen(true)}
                  />

                  <GraphRAGGraphStatus
                    graphStats={graphStats}
                    onOpenViewer={() => setViewerOpen(true)}
                  />

                  <GraphRAGAdvancedSettings
                    graphRAGEventsPerCharacter={graphRAGEventsPerCharacter}
                    graphRAGMaxDirectCharacterRelations={
                      graphRAGMaxDirectCharacterRelations
                    }
                    graphRAGSimilarityThreshold={graphRAGSimilarityThreshold}
                    graphRAGIncludeFutureContext={graphRAGIncludeFutureContext}
                    graphRAGEmbeddingModel={graphRAGEmbeddingModel}
                    graphStats={graphStats}
                    isRunning={isRunning}
                    isImportingGraph={isImportingGraph}
                    onSetEventsPerCharacter={setGraphRAGEventsPerCharacter}
                    onSetMaxDirectCharacterRelations={
                      setGraphRAGMaxDirectCharacterRelations
                    }
                    onSetSimilarityThreshold={setGraphRAGSimilarityThreshold}
                    onSetIncludeFutureContext={setGraphRAGIncludeFutureContext}
                    onSetEmbeddingModel={setGraphRAGEmbeddingModel}
                    onExportGraph={handleExportGraph}
                    onImportGraphFile={handleGraphImportFile}
                    onClearEmbeddings={async () => {
                      await graphRAGStore.clearEmbeddings();
                      await embeddingService.clearCache();
                    }}
                  />
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

        <GraphRAGConfirmDialogs
          cancelConfirmOpen={cancelConfirmOpen}
          clearConfirmOpen={clearConfirmOpen}
          pendingGraphImport={pendingGraphImport}
          isImportingGraph={isImportingGraph}
          isClearing={isClearing}
          indexingProgress={indexingProgress}
          onCloseCancel={() => setCancelConfirmOpen(false)}
          onConfirmCancel={() => {
            handleCancelIndexing();
            setCancelConfirmOpen(false);
          }}
          onCloseImport={() =>
            !isImportingGraph ? setPendingGraphImport(null) : undefined
          }
          onCancelImport={() => setPendingGraphImport(null)}
          onConfirmImport={handleConfirmGraphImport}
          onCloseClear={() =>
            !isClearing ? setClearConfirmOpen(false) : undefined
          }
          onCancelClear={() => setClearConfirmOpen(false)}
          onConfirmClear={handleClearGraph}
          graphStats={graphStats}
        />

        {/* Graph Viewer Dialog */}
        <GraphViewer open={viewerOpen} onClose={() => setViewerOpen(false)} />
      </>
    );
  }
);
