import React from "react";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IndexingProgress } from "../../../utils/graphRag/types";

type GraphStats = { nodes: number; edges: number };
interface Props {
  dataReady: boolean;
  isRunning: boolean;
  isImportingGraph: boolean;
  pendingGraphImport: unknown;
  indexingProgress: IndexingProgress;
  estimatedTime: string | null;
  isCancelling: boolean;
  graphStats: GraphStats;
  onStartIndexing: () => void;
  onRequestCancel: () => void;
  onRequestClear: () => void;
}
export function GraphRAGIndexingPanel(p: Props) {
  const progressPercent =
    p.indexingProgress.total > 0
      ? Math.round(
          (p.indexingProgress.current / p.indexingProgress.total) * 100
        )
      : 0;
  return (
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
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Build Knowledge Graph
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Index all Unit Stories and Event Stories to build the knowledge
            graph. Each story is processed in a single LLM call (all episodes
            combined).
          </Typography>
        </Box>
        {!p.dataReady && (
          <Alert severity="info" variant="outlined">
            Waiting for story and character data to finish loading.
          </Alert>
        )}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <LoadingButton
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AutoAwesomeIcon />}
            loading={p.isRunning}
            loadingPosition="start"
            onClick={p.onStartIndexing}
            disabled={
              !p.dataReady ||
              p.isImportingGraph ||
              Boolean(p.pendingGraphImport)
            }
            sx={{ flex: "1 1 auto", minWidth: 200 }}
          >
            {p.indexingProgress.status === "completed"
              ? "Re-index All Stories"
              : `Index All Stories${p.estimatedTime && !p.isRunning ? ` (${p.estimatedTime})` : ""}`}
          </LoadingButton>
          {p.isRunning && (
            <Button
              variant="outlined"
              color="warning"
              size="large"
              onClick={p.onRequestCancel}
              disabled={p.isCancelling}
            >
              {p.isCancelling ? "Cancelling…" : "Cancel"}
            </Button>
          )}
          {p.graphStats.nodes > 0 && !p.isRunning && (
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<DeleteOutlineIcon />}
              onClick={p.onRequestClear}
            >
              Clear Graph
            </Button>
          )}
        </Stack>
        {p.isRunning && (
          <Box role="status" aria-live="polite" aria-atomic="true">
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="body2" fontWeight={500}>
                Processing story {p.indexingProgress.current} of{" "}
                {p.indexingProgress.total}
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
            {p.isCancelling && (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ mt: 0.5, display: "block" }}
              >
                Cancelling—the story currently in progress will finish its LLM
                call first, then indexing will stop.
              </Typography>
            )}
            {p.indexingProgress.currentEpisode && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
                noWrap
              >
                {p.indexingProgress.currentEpisode}
              </Typography>
            )}
          </Box>
        )}
        {p.indexingProgress.status === "completed" && (
          <Alert severity="success" variant="outlined" role="status">
            Indexing completed successfully
          </Alert>
        )}
        {p.indexingProgress.status === "error" && (
          <Alert
            severity="error"
            variant="outlined"
            role="alert"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={p.onStartIndexing}
                startIcon={<AutoAwesomeIcon />}
              >
                Retry
              </Button>
            }
          >
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Indexing failed
            </Typography>
            <Typography variant="body2">
              {p.indexingProgress.error ||
                "An error occurred during indexing. Please try again."}
            </Typography>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
