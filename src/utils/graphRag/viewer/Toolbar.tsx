import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import type { NodeType } from "../types";

type NodeTypeFilter = Exclude<NodeType, "fact">;

interface ToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedNodeTypes: NodeTypeFilter[];
  onNodeTypeFilterChange: (types: NodeTypeFilter[]) => void;
  suppressLowImportanceNodes: boolean;
  onSuppressLowImportanceNodesChange: (checked: boolean) => void;
  lowImportanceConnectionLimit: number;
  onLowImportanceConnectionLimitChange: (value: number) => void;
  nodeSizeMultiplier: number;
  onNodeSizeMultiplierChange: (value: number) => void;
  onMergeNodes: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface ToolbarOverlayProps extends ToolbarProps {
  isDark: boolean;
  fullscreen: boolean;
}

const NODE_TYPE_OPTIONS: Array<{
  type: NodeTypeFilter;
  label: string;
  color: string;
}> = [
  { type: "character", label: "Characters", color: "#3b82f6" },
  { type: "group", label: "Groups", color: "#8b5cf6" },
  { type: "event", label: "Events", color: "#10b981" },
  { type: "term", label: "Terms", color: "#f59e0b" },
];

export const GraphViewerToolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  onSearchQueryChange,
  selectedNodeTypes,
  onNodeTypeFilterChange,
  suppressLowImportanceNodes,
  onSuppressLowImportanceNodesChange,
  lowImportanceConnectionLimit,
  onLowImportanceConnectionLimitChange,
  nodeSizeMultiplier,
  onNodeSizeMultiplierChange,
  onMergeNodes,
  collapsed = true,
  onCollapsedChange,
}) => {
  const [displayControlsOpen, setDisplayControlsOpen] = useState(false);
  const [nodeOperationsOpen, setNodeOperationsOpen] = useState(false);
  const toolbarOpen = !collapsed;
  const searchField = (
    <TextField
      fullWidth
      label="Search graph nodes"
      size="small"
      variant="standard"
      value={searchQuery}
      onChange={(event) => onSearchQueryChange(event.target.value)}
      inputProps={{ "aria-label": "Search graph nodes" }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
      sx={{ minWidth: 0, flex: 1 }}
    />
  );

  const nodeTypeSection = (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        Node type
      </Typography>
      <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
        {NODE_TYPE_OPTIONS.map(({ type, label, color }) => {
          const active =
            selectedNodeTypes.length === 0 || selectedNodeTypes.includes(type);
          return (
            <Chip
              key={type}
              clickable
              onClick={() => {
                if (selectedNodeTypes.length === 0) {
                  onNodeTypeFilterChange(
                    NODE_TYPE_OPTIONS.map((option) => option.type).filter(
                      (option) => option !== type
                    )
                  );
                  return;
                }
                const nextTypes = selectedNodeTypes.includes(type)
                  ? selectedNodeTypes.filter((value) => value !== type)
                  : [...selectedNodeTypes, type];
                onNodeTypeFilterChange(nextTypes);
              }}
              size="small"
              label={label}
              aria-label={`Filter ${label}`}
              aria-pressed={active}
              sx={{
                bgcolor: color,
                color: "white",
                opacity: active ? 1 : 0.35,
                "&:hover": { bgcolor: color, opacity: 0.85 },
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );

  const viewerSettings = (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        Viewer settings
      </Typography>
      <Stack spacing={1.5}>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={suppressLowImportanceNodes}
                onChange={(_, checked) =>
                  onSuppressLowImportanceNodesChange(checked)
                }
                size="small"
                inputProps={{ "aria-label": "Suppress low-importance nodes" }}
              />
            }
            label="Hide low-importance nodes"
            sx={{
              m: 0,
              "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
            }}
          />
          <Typography variant="caption" color="text.secondary" display="block">
            Connection limit: {lowImportanceConnectionLimit}
          </Typography>
          <Slider
            value={lowImportanceConnectionLimit}
            onChange={(_, value) =>
              onLowImportanceConnectionLimitChange(value as number)
            }
            min={0}
            max={5}
            step={1}
            valueLabelDisplay="auto"
            size="small"
            disabled={!suppressLowImportanceNodes}
            aria-label="Low-importance connection limit"
          />
        </Box>
        <Divider />
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Node size: {Math.round(nodeSizeMultiplier * 100)}%
          </Typography>
          <Slider
            value={nodeSizeMultiplier}
            onChange={(_, value) => onNodeSizeMultiplierChange(value as number)}
            min={0.4}
            max={2.4}
            step={0.1}
            valueLabelDisplay="auto"
            size="small"
            aria-label="Node size"
          />
        </Box>
      </Stack>
    </Box>
  );

  const displayControls = (
    <Stack spacing={1.5}>
      {nodeTypeSection}
      <Divider />
      {viewerSettings}
    </Stack>
  );

  const nodeOperations = (
    <Box>
      <Button
        aria-label="Merge nodes"
        color="warning"
        fullWidth
        onClick={onMergeNodes}
        startIcon={<CallMergeIcon />}
        variant="text"
        sx={{
          justifyContent: "flex-start",
          minHeight: 40,
          px: 0.5,
          textTransform: "none",
          bgcolor: "transparent",
          "&:hover": { bgcolor: "transparent", color: "warning.main" },
        }}
      >
        Merge nodes
      </Button>
    </Box>
  );

  const toggleToolbar = () => {
    onCollapsedChange?.(toolbarOpen);
  };

  if (!toolbarOpen) {
    return (
      <IconButton
        aria-label="Expand toolbar"
        aria-controls="graph-viewer-controls-block"
        aria-expanded={false}
        onClick={toggleToolbar}
        sx={{
          minWidth: 44,
          minHeight: 44,
          bgcolor: "transparent",
          "&:hover": {
            bgcolor: "transparent",
            color: "primary.main",
          },
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    );
  }

  return (
    <Stack spacing={1.25} sx={{ p: 1 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ minWidth: 0, flexWrap: "nowrap" }}
      >
        <IconButton
          aria-label="Collapse toolbar"
          aria-controls="graph-viewer-controls-block"
          aria-expanded={toolbarOpen}
          onClick={toggleToolbar}
          sx={{
            minWidth: 44,
            minHeight: 44,
            flexShrink: 0,
            ml: -1,
            mt: -1,
            bgcolor: "transparent",
            "&:hover": {
              bgcolor: "transparent",
              color: "primary.main",
            },
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
        {searchField}
      </Stack>
      <Collapse in={toolbarOpen} timeout={180}>
        <Box id="graph-viewer-controls-block">
          <Stack spacing={0.75}>
            <Divider />
            <Button
              aria-controls="graph-viewer-display-controls"
              aria-expanded={displayControlsOpen}
              fullWidth
              onClick={() => setDisplayControlsOpen((current) => !current)}
              startIcon={<TuneIcon />}
              endIcon={
                displayControlsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
              }
              variant="text"
              sx={{
                justifyContent: "flex-start",
                minHeight: 44,
                whiteSpace: "nowrap",
                px: 0.5,
                textTransform: "none",
                color: "text.primary",
                bgcolor: "transparent",
                "& .MuiButton-endIcon": { ml: "auto" },
                "&:hover": {
                  bgcolor: "transparent",
                  color: "primary.main",
                },
              }}
            >
              Display controls
            </Button>
            <Collapse in={displayControlsOpen} timeout={180}>
              <Box
                id="graph-viewer-display-controls"
                sx={{ px: 0.5, pt: 0.75, pb: 1.25 }}
              >
                {displayControls}
              </Box>
            </Collapse>
            <Divider />
            <Button
              aria-controls="graph-viewer-node-operations"
              aria-expanded={nodeOperationsOpen}
              fullWidth
              onClick={() => setNodeOperationsOpen((current) => !current)}
              startIcon={<CallMergeIcon />}
              endIcon={
                nodeOperationsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
              }
              variant="text"
              sx={{
                justifyContent: "flex-start",
                minHeight: 44,
                whiteSpace: "nowrap",
                px: 0.5,
                textTransform: "none",
                color: "text.primary",
                bgcolor: "transparent",
                "& .MuiButton-endIcon": { ml: "auto" },
                "&:hover": {
                  bgcolor: "transparent",
                  color: "primary.main",
                },
              }}
            >
              Node operations
            </Button>
            <Collapse in={nodeOperationsOpen} timeout={180}>
              <Box id="graph-viewer-node-operations" sx={{ px: 0.5, pb: 1 }}>
                {nodeOperations}
              </Box>
            </Collapse>
          </Stack>
        </Box>
      </Collapse>
    </Stack>
  );
};

export const GraphViewerToolbarOverlay: React.FC<ToolbarOverlayProps> = ({
  collapsed = true,
  fullscreen,
  isDark,
  ...toolbarProps
}) => (
  <Paper
    elevation={0}
    sx={{
      position: "absolute",
      left: 16,
      top: 16,
      zIndex: 1000,
      bgcolor: collapsed
        ? "transparent"
        : isDark
          ? "rgba(10,15,27,0.78)"
          : "rgba(255,255,255,0.82)",
      backdropFilter: collapsed ? "none" : "blur(12px)",
      border: collapsed
        ? "none"
        : isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(15,23,42,0.1)",
      boxShadow: collapsed
        ? "none"
        : isDark
          ? "0 12px 32px rgba(0,0,0,0.3)"
          : "0 12px 32px rgba(15,23,42,0.16)",
      borderRadius: 1.5,
      p: 0,
      width: collapsed ? 44 : "min(320px, calc(100% - 32px))",
      maxHeight: fullscreen ? "calc(100dvh - 32px)" : "calc(100% - 32px)",
      overflowY: "auto",
      scrollbarWidth: "thin",
    }}
  >
    <GraphViewerToolbar {...toolbarProps} collapsed={collapsed} />
  </Paper>
);
