import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  createNodeEditDraft,
  type TranslatedNameDraft,
  type NodeEditDraft,
} from "../../../utils/GraphRag/nodeEdit";
import type { GraphNode } from "../../../utils/GraphRag/types";

interface NodeEditorDialogProps {
  node: GraphNode | null;
  onClose: () => void;
  onSave: (node: GraphNode, draft: NodeEditDraft) => Promise<void>;
}

export const NodeEditorDialog: React.FC<NodeEditorDialogProps> = ({
  node,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<NodeEditDraft>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(node ? createNodeEditDraft(node) : {});
    setError("");
  }, [node]);

  const update =
    (field: keyof NodeEditDraft) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDraft((current) => ({ ...current, [field]: event.target.value }));
      setError("");
    };

  const updateOriginalTextVariant = (index: number, value: string) => {
    setDraft((current) => {
      const originalTextVariants = [...(current.originalTextVariants ?? [])];
      originalTextVariants[index] = value;
      return { ...current, originalTextVariants };
    });
    setError("");
  };

  const removeOriginalTextVariant = (index: number) => {
    setDraft((current) => ({
      ...current,
      originalTextVariants: (current.originalTextVariants ?? []).filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const updateTranslatedName = (
    index: number,
    field: keyof TranslatedNameDraft,
    value: string
  ) => {
    setDraft((current) => ({
      ...current,
      translatedNames: (current.translatedNames ?? []).map(
        (entry, itemIndex) =>
          itemIndex === index ? { ...entry, [field]: value } : entry
      ),
    }));
    setError("");
  };

  const removeTranslatedName = (index: number) => {
    setDraft((current) => ({
      ...current,
      translatedNames: (current.translatedNames ?? []).filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const handleClose = () => {
    if (!saving) onClose();
  };

  const handleSave = async () => {
    if (!node) return;
    setSaving(true);
    setError("");
    try {
      await onSave(node, draft);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save the node."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(node)} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit {node?.type ?? "node"}</DialogTitle>
      <DialogContent>
        {node && (
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Identifier: {node.identifier ?? node.id}
            </Typography>
            {node.type !== "fact" && (
              <TextField
                autoFocus
                required
                label="Name"
                value={draft.name ?? ""}
                onChange={update("name")}
                disabled={saving}
                fullWidth
              />
            )}
            {(node.type === "character" ||
              node.type === "group" ||
              node.type === "term") && (
              <TextField
                required
                label="Original name"
                value={draft.originalName ?? ""}
                onChange={update("originalName")}
                disabled={saving}
                fullWidth
              />
            )}
            {node.type === "character" && (
              <>
                <TextField
                  required
                  select
                  label="Gender"
                  value={draft.gender ?? "unknown"}
                  onChange={update("gender")}
                  disabled={saving}
                  fullWidth
                >
                  {["male", "female", "secret", "unknown"].map((gender) => (
                    <MenuItem key={gender} value={gender}>
                      {gender}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Group"
                  value={draft.group ?? ""}
                  onChange={update("group")}
                  disabled={saving}
                  fullWidth
                />
              </>
            )}
            {"originalTextVariants" in node && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">
                  Original name variants
                </Typography>
                {(draft.originalTextVariants ?? []).map((variant, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <TextField
                      aria-label={"Original name variant " + (index + 1)}
                      value={variant}
                      onChange={(event) =>
                        updateOriginalTextVariant(index, event.target.value)
                      }
                      disabled={saving}
                      fullWidth
                    />
                    <IconButton
                      aria-label={"Remove original name variant " + (index + 1)}
                      onClick={() => removeOriginalTextVariant(index)}
                      disabled={saving}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      originalTextVariants: [
                        ...(current.originalTextVariants ?? []),
                        "",
                      ],
                    }))
                  }
                  disabled={saving}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Add original name variant
                </Button>
              </Stack>
            )}
            {"translatedNames" in node && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Translated names</Typography>
                {(draft.translatedNames ?? []).map((entry, index) => (
                  <Stack key={index} spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        label="Language"
                        value={entry.language}
                        onChange={(event) =>
                          updateTranslatedName(
                            index,
                            "language",
                            event.target.value
                          )
                        }
                        disabled={saving}
                        fullWidth
                      />
                      <IconButton
                        aria-label={"Remove translated name " + (index + 1)}
                        onClick={() => removeTranslatedName(index)}
                        disabled={saving}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                    <TextField
                      label="Original text"
                      value={entry.originalText}
                      onChange={(event) =>
                        updateTranslatedName(
                          index,
                          "originalText",
                          event.target.value
                        )
                      }
                      disabled={saving}
                      fullWidth
                    />
                    <TextField
                      label="Translation"
                      value={entry.translation}
                      onChange={(event) =>
                        updateTranslatedName(
                          index,
                          "translation",
                          event.target.value
                        )
                      }
                      disabled={saving}
                      fullWidth
                    />
                  </Stack>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      translatedNames: [
                        ...(current.translatedNames ?? []),
                        { language: "", originalText: "", translation: "" },
                      ],
                    }))
                  }
                  disabled={saving}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Add translated name
                </Button>
              </Stack>
            )}
            {node.type === "fact" && (
              <TextField
                autoFocus
                required
                multiline
                minRows={2}
                label="Statement"
                value={draft.statement ?? ""}
                onChange={update("statement")}
                disabled={saving}
                fullWidth
              />
            )}
            {(node.type === "event" ||
              node.type === "term" ||
              node.type === "fact") && (
              <TextField
                required
                multiline
                minRows={3}
                label="Description"
                value={draft.description ?? ""}
                onChange={update("description")}
                disabled={saving}
                fullWidth
              />
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
