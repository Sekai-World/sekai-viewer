import React, { useCallback, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { graphRAGStore } from "../../../utils/graphRag/storage";
import { GraphNode } from "../../../utils/graphRag/types";

interface UseMergeNodesOptions {
  getNodes: () => Map<string, GraphNode>;
  onMerged: () => Promise<void> | void;
}

export const useMergeNodes = ({ getNodes, onMerged }: UseMergeNodesOptions) => {
  const [isMergeNodesDialogOpen, setIsMergeNodesDialogOpen] = useState(false);
  const [retainedIdentifier, setRetainedIdentifier] = useState("");
  const [duplicateIdentifier, setDuplicateIdentifier] = useState("");
  const [mergeError, setMergeError] = useState("");
  const [isMerging, setIsMerging] = useState(false);

  const reset = useCallback(() => {
    setRetainedIdentifier("");
    setDuplicateIdentifier("");
    setMergeError("");
  }, []);

  const closeMergeNodesDialog = useCallback(() => {
    if (isMerging) return;
    reset();
    setIsMergeNodesDialogOpen(false);
  }, [isMerging, reset]);

  const openMergeNodesDialog = useCallback(() => {
    setIsMergeNodesDialogOpen(true);
  }, []);

  const handleMergeNodes = useCallback(async () => {
    const nodes = getNodes();
    const retained = [...nodes.values()].find(
      (node) =>
        "identifier" in node && node.identifier === retainedIdentifier.trim()
    );
    const duplicate = [...nodes.values()].find(
      (node) =>
        "identifier" in node && node.identifier === duplicateIdentifier.trim()
    );

    if (!retained || !duplicate) {
      setMergeError("Both identifiers must match existing nodes.");
      return;
    }
    if (retained.id === duplicate.id) {
      setMergeError("Choose two different node identifiers.");
      return;
    }
    if (retained.type !== duplicate.type) {
      setMergeError("Only nodes of the same type can be merged.");
      return;
    }

    setIsMerging(true);
    setMergeError("");
    try {
      await graphRAGStore.mergeNodes(retained.id, duplicate.id);
      await onMerged();
      reset();
      setIsMergeNodesDialogOpen(false);
    } catch (error) {
      setMergeError(
        error instanceof Error ? error.message : "Unable to merge the nodes."
      );
    } finally {
      setIsMerging(false);
    }
  }, [duplicateIdentifier, getNodes, onMerged, reset, retainedIdentifier]);

  const mergeNodesDialog = (
    <Dialog
      open={isMergeNodesDialogOpen}
      onClose={closeMergeNodesDialog}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Merge Nodes</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The first node is retained. The second node is removed and its
          connections are transferred to the retained node.
        </Typography>
        <Stack spacing={1.5}>
          <TextField
            autoFocus
            required
            label="Retain identifier"
            value={retainedIdentifier}
            onChange={(event) => {
              setRetainedIdentifier(event.target.value);
              setMergeError("");
            }}
            disabled={isMerging}
            fullWidth
          />
          <TextField
            required
            label="Remove identifier"
            value={duplicateIdentifier}
            onChange={(event) => {
              setDuplicateIdentifier(event.target.value);
              setMergeError("");
            }}
            disabled={isMerging}
            fullWidth
          />
          {mergeError && <Alert severity="error">{mergeError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeMergeNodesDialog} disabled={isMerging}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleMergeNodes}
          disabled={
            isMerging ||
            !retainedIdentifier.trim() ||
            !duplicateIdentifier.trim() ||
            retainedIdentifier.trim() === duplicateIdentifier.trim()
          }
        >
          {isMerging ? "Merging..." : "Merge Nodes"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { mergeNodesDialog, openMergeNodesDialog };
};
