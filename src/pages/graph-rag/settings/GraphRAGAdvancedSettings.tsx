import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { EMBEDDING_MODELS } from "../../../utils/graphRag/embeddings";
type GraphStats = { nodes: number; edges: number };
interface Props {
  graphRAGEventsPerCharacter: number;
  graphRAGMaxDirectCharacterRelations: number;
  graphRAGSimilarityThreshold: number;
  graphRAGIncludeFutureContext: boolean;
  graphRAGEmbeddingModel: string;
  graphStats: GraphStats;
  isRunning: boolean;
  isImportingGraph: boolean;
  onSetEventsPerCharacter: (value: number) => void;
  onSetMaxDirectCharacterRelations: (value: number) => void;
  onSetSimilarityThreshold: (value: number) => void;
  onSetIncludeFutureContext: (value: boolean) => void;
  onSetEmbeddingModel: (value: string) => void;
  onExportGraph: () => void;
  onImportGraphFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearEmbeddings: () => void;
}
export function GraphRAGAdvancedSettings(p: Props) {
  return (
    <Accordion
      disableGutters
      variant="outlined"
      sx={{
        borderRadius: 2,
        "&::before": { display: "none" },
        transition: "border-color 150ms",
        "&:hover": { borderColor: "primary.light" },
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
          <FormControl fullWidth>
            <FormLabel>
              Events per character: {p.graphRAGEventsPerCharacter}
            </FormLabel>
            <Slider
              value={p.graphRAGEventsPerCharacter}
              onChange={(_, v) => p.onSetEventsPerCharacter(v as number)}
              min={5}
              max={20}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              Maximum past events to retrieve per character (default: 10)
            </Typography>
          </FormControl>
          <FormControl fullWidth>
            <FormLabel>
              Direct character relations:{" "}
              {p.graphRAGMaxDirectCharacterRelations}
            </FormLabel>
            <Slider
              value={p.graphRAGMaxDirectCharacterRelations}
              onChange={(_, v) =>
                p.onSetMaxDirectCharacterRelations(v as number)
              }
              min={0}
              max={20}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              Maximum direct relationships between characters in the current
              story, selected by similarity (default: 10)
            </Typography>
          </FormControl>
          <FormControl fullWidth>
            <FormLabel>
              Similarity threshold: {p.graphRAGSimilarityThreshold.toFixed(2)}
            </FormLabel>
            <Slider
              value={p.graphRAGSimilarityThreshold}
              onChange={(_, v) => p.onSetSimilarityThreshold(v as number)}
              min={0.7}
              max={0.95}
              step={0.05}
              marks
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              Higher values create more unique nodes; lower values merge similar
              events (default: 0.85)
            </Typography>
          </FormControl>
          <Divider />
          <FormControlLabel
            sx={{ m: 0, width: "100%", alignItems: "flex-start" }}
            labelPlacement="start"
            control={
              <Switch
                checked={p.graphRAGIncludeFutureContext}
                onChange={(_, v) => p.onSetIncludeFutureContext(v)}
                sx={{ mt: -0.5 }}
                inputProps={{ "aria-label": "Include Future Context" }}
              />
            }
            label={
              <Box sx={{ pr: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  Include Future Context
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Include events from future episodes (helps with foreshadowing,
                  but may contain spoilers)
                </Typography>
              </Box>
            }
          />
          <Divider />
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Graph Backup
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 1.5 }}
            >
              Export or replace the indexed graph, including embeddings and
              processed-story history.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={p.onExportGraph}
              >
                Export Graph
              </Button>
              <Button
                component="label"
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<UploadFileIcon />}
                disabled={p.isRunning || p.isImportingGraph}
              >
                Import Graph
                <input
                  hidden
                  type="file"
                  accept="application/json,.json"
                  onChange={p.onImportGraphFile}
                />
              </Button>
            </Stack>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Embedding Model
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 1.5 }}
            >
              Choose the model for generating embeddings (runs locally in
              browser)
            </Typography>
            <FormControl fullWidth>
              <FormLabel>Model</FormLabel>
              <Select
                value={p.graphRAGEmbeddingModel}
                onChange={(e) => p.onSetEmbeddingModel(e.target.value)}
                size="small"
              >
                {EMBEDDING_MODELS.transformers.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    <Box>
                      <Typography variant="body2">{model.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {model.dims} dims · {model.speed}
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
                Changing the model will require clearing embeddings and
                re-indexing
              </Typography>
            </FormControl>
            {p.graphStats.nodes > 0 && (
              <Alert severity="warning" variant="outlined" sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption">
                      Model changed? Clear embeddings and re-index to update.
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={p.onClearEmbeddings}
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
  );
}
