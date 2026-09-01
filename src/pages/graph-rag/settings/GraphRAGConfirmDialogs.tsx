import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { IndexingProgress } from "../../../utils/graphRag/types";
import { GraphRAGExport } from "../../../utils/graphRag/storage";
type GraphStats = { nodes: number; edges: number };
interface Props {
  cancelConfirmOpen: boolean;
  clearConfirmOpen: boolean;
  pendingGraphImport: GraphRAGExport | null;
  isImportingGraph: boolean;
  isClearing: boolean;
  indexingProgress: IndexingProgress;
  graphStats: GraphStats;
  onCloseCancel: () => void;
  onConfirmCancel: () => void;
  onCloseImport: () => void;
  onCancelImport: () => void;
  onConfirmImport: () => void;
  onCloseClear: () => void;
  onCancelClear: () => void;
  onConfirmClear: () => void;
}
export function GraphRAGConfirmDialogs(p: Props) {
  return (
    <>
      <Dialog
        open={p.cancelConfirmOpen}
        onClose={p.onCloseCancel}
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
            The story currently being processed has already started its LLM call
            and will finish before indexing stops. Stories already completed (
            {p.indexingProgress.current} of {p.indexingProgress.total}) are
            saved and won&apos;t be re-processed next time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={p.onCloseCancel} variant="text">
            Continue Indexing
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={p.onConfirmCancel}
          >
            Cancel Indexing
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(p.pendingGraphImport)}
        onClose={p.onCloseImport}
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
            Importing will replace the current graph with the selected archive,
            including its indexed-story history. The current graph will be lost
            unless it has been exported.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={p.onCancelImport} disabled={p.isImportingGraph}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={p.isImportingGraph}
            onClick={p.onConfirmImport}
          >
            Replace Graph
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={p.clearConfirmOpen}
        onClose={p.onCloseClear}
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
            This will permanently delete all {p.graphStats.nodes} nodes and{" "}
            {p.graphStats.edges} edges from the knowledge graph. This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={p.onCancelClear} disabled={p.isClearing}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            loading={p.isClearing}
            onClick={p.onConfirmClear}
          >
            Clear Graph
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
