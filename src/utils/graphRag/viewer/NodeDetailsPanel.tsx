import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popover,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import { GraphEdge, GraphNode } from "../types";

export interface NodeDetailsState {
  node: GraphNode;
  edges: GraphEdge[];
}

interface NodeDetailsPanelProps {
  details: NodeDetailsState | null;
  nodesById: Map<string, GraphNode>;
  onClose: () => void;
  onNodeClick: (nodeId: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const TranslatedNames: React.FC<{
  translatedNames: Record<string, Record<string, string>>;
}> = ({ translatedNames }) => {
  if (Object.keys(translatedNames).length === 0) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        <strong>Translated Names:</strong>
      </Typography>
      {Object.entries(translatedNames).map(([lang, variants]) => (
        <Box key={lang} sx={{ pl: 2, mb: 0.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="bold"
          >
            {lang}:
          </Typography>
          {Object.entries(variants).map(([variant, translated]) => (
            <Typography
              key={variant}
              variant="caption"
              display="block"
              color="text.secondary"
              sx={{ pl: 2 }}
            >
              {variant} → {translated}
            </Typography>
          ))}
        </Box>
      ))}
    </Box>
  );
};

const OriginalNameVariants: React.FC<{ variants: string[] }> = ({
  variants,
}) => {
  if (variants.length === 0) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        <strong>Original Name Variants:</strong>
      </Typography>
      <Typography
        variant="caption"
        display="block"
        color="text.secondary"
        sx={{ pl: 2 }}
      >
        {variants.join(", ")}
      </Typography>
    </Box>
  );
};

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  details,
  nodesById,
  onClose,
  onNodeClick,
  collapsed,
  onCollapsedChange,
}) => {
  const detailsRef = React.useRef<HTMLDivElement>(null);
  const [connectionSearch, setConnectionSearch] = React.useState("");
  const [selectedEdgeTypes, setSelectedEdgeTypes] = React.useState<Set<
    GraphEdge["type"]
  > | null>(null);
  const [filterAnchor, setFilterAnchor] = React.useState<HTMLElement | null>(
    null
  );

  React.useEffect(() => {
    if (details && detailsRef.current) detailsRef.current.scrollTop = 0;
  }, [details]);

  React.useEffect(() => {
    setConnectionSearch("");
    setSelectedEdgeTypes(null);
    setFilterAnchor(null);
  }, [details]);

  if (!details) return null;

  const { node, edges } = details;
  const label = node.type === "fact" ? node.statement : node.name;
  const edgeTypes = [...new Set(edges.map((edge) => edge.type))].sort();
  const activeTypeCount = selectedEdgeTypes?.size ?? edgeTypes.length;
  const searchTerm = connectionSearch.trim().toLocaleLowerCase();
  const filteredEdges = edges.filter((edge) => {
    if (selectedEdgeTypes && !selectedEdgeTypes.has(edge.type)) return false;
    if (!searchTerm) return true;
    const otherNodeId =
      edge.sourceId === node.id ? edge.targetId : edge.sourceId;
    const otherNode = nodesById.get(otherNodeId);
    const otherLabel = otherNode
      ? otherNode.type === "fact"
        ? otherNode.statement
        : otherNode.name
      : otherNodeId;
    return [
      otherLabel,
      otherNode?.type,
      edge.type,
      edge.context,
      ...edge.episodeTags,
    ]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLocaleLowerCase().includes(searchTerm));
  });

  const toggleEdgeType = (edgeType: GraphEdge["type"], checked: boolean) => {
    setSelectedEdgeTypes((previous) => {
      const next = new Set(previous ?? edgeTypes);
      if (checked) next.add(edgeType);
      else next.delete(edgeType);
      return next.size === edgeTypes.length ? null : next;
    });
  };

  return (
    <Paper
      ref={detailsRef}
      elevation={3}
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 320,
        maxHeight: "80%",
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Chip
            label={node.type.toUpperCase()}
            size="small"
            color={
              node.type === "character"
                ? "primary"
                : node.type === "group"
                  ? "secondary"
                  : node.type === "event"
                    ? "success"
                    : node.type === "fact"
                      ? "error"
                      : "warning"
            }
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title={collapsed ? "Expand details" : "Collapse details"}>
              <IconButton
                size="small"
                aria-label={collapsed ? "Expand details" : "Collapse details"}
                aria-expanded={!collapsed}
                onClick={() => onCollapsedChange(!collapsed)}
              >
                {collapsed ? (
                  <ExpandMoreIcon fontSize="small" />
                ) : (
                  <ExpandLessIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              aria-label="Close details"
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>
          {label}
        </Typography>

        {collapsed && node.type === "character" && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {node.gender}
            </Typography>
            {node.group && (
              <Typography variant="body2" color="text.secondary">
                {node.group}
              </Typography>
            )}
          </Box>
        )}

        <Collapse in={!collapsed} timeout={180}>
          {node.type === "character" && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Identifier:</strong> {node.identifier}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Original Name:</strong> {node.originalName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Gender:</strong> {node.gender}
              </Typography>
              {node.group && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Group:</strong> {node.group}
                </Typography>
              )}
              <TranslatedNames translatedNames={node.translatedNames} />
              <OriginalNameVariants variants={node.originalTextVariants} />
            </>
          )}

          {node.type === "group" && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Identifier:</strong> {node.identifier}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Original Name:</strong> {node.originalName}
              </Typography>
              <TranslatedNames translatedNames={node.translatedNames} />
              <OriginalNameVariants variants={node.originalTextVariants} />
            </>
          )}

          {node.type === "event" && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Description:</strong>
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ pl: 2, mb: 1 }}
              >
                {node.description}
              </Typography>
              {node.episodeTags.length > 0 && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Episodes:</strong> {node.episodeTags.join(", ")}
                </Typography>
              )}
            </>
          )}

          {node.type === "term" && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Identifier:</strong> {node.identifier}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Original Name:</strong> {node.originalName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Description:</strong>
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ pl: 2, mb: 1 }}
              >
                {node.description}
              </Typography>
              <TranslatedNames translatedNames={node.translatedNames} />
              <OriginalNameVariants variants={node.originalTextVariants} />
              {node.episodeTags.length > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mt: 1 }}
                >
                  <strong>Episodes:</strong> {node.episodeTags.join(", ")}
                </Typography>
              )}
            </>
          )}

          {node.type === "fact" && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Statement:</strong>
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ pl: 2, mb: 1 }}
              >
                {node.statement}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Description:</strong>
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ pl: 2, mb: 1 }}
              >
                {node.description}
              </Typography>
              {node.episodeTags.length > 0 && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Episodes:</strong> {node.episodeTags.join(", ")}
                </Typography>
              )}
            </>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Connections ({filteredEdges.length}/{edges.length})
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={connectionSearch}
              onChange={(event) => setConnectionSearch(event.target.value)}
              placeholder="Search connections"
              inputProps={{ "aria-label": "Search connections" }}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                ),
              }}
            />
            <Tooltip
              title={
                selectedEdgeTypes
                  ? `Filtering ${activeTypeCount} of ${edgeTypes.length} relationship types`
                  : "Filter connections"
              }
            >
              <IconButton
                aria-label={
                  selectedEdgeTypes
                    ? `Filter connections: ${activeTypeCount} of ${edgeTypes.length} relationship types selected`
                    : "Filter connections: all relationship types selected"
                }
                color={selectedEdgeTypes ? "primary" : "default"}
                onClick={(event) => setFilterAnchor(event.currentTarget)}
              >
                <TuneIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Popover
            open={Boolean(filterAnchor)}
            anchorEl={filterAnchor}
            onClose={() => setFilterAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box sx={{ p: 1.5, minWidth: 240 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="subtitle2">Relationship types</Typography>
                <Button
                  size="small"
                  onClick={() => setSelectedEdgeTypes(null)}
                  disabled={!selectedEdgeTypes}
                >
                  Clear
                </Button>
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={
                      selectedEdgeTypes === null ||
                      selectedEdgeTypes.size === edgeTypes.length
                    }
                    indeterminate={
                      selectedEdgeTypes !== null &&
                      selectedEdgeTypes.size > 0 &&
                      selectedEdgeTypes.size < edgeTypes.length
                    }
                    onChange={(_, checked) =>
                      setSelectedEdgeTypes(checked ? null : new Set())
                    }
                  />
                }
                label="All types"
                sx={{ display: "flex", m: 0, minHeight: 40 }}
              />
              <Divider sx={{ my: 0.5 }} />
              {edgeTypes.map((edgeType) => (
                <FormControlLabel
                  key={edgeType}
                  control={
                    <Checkbox
                      size="small"
                      checked={
                        selectedEdgeTypes === null ||
                        selectedEdgeTypes.has(edgeType)
                      }
                      onChange={(_, checked) =>
                        toggleEdgeType(edgeType, checked)
                      }
                    />
                  }
                  label={edgeType}
                  sx={{ display: "flex", m: 0, minHeight: 40 }}
                />
              ))}
            </Box>
          </Popover>
          <List dense>
            {filteredEdges.map((edge, idx) => {
              const isSource = edge.sourceId === node.id;
              const otherNodeId = isSource ? edge.targetId : edge.sourceId;
              const otherNode = nodesById.get(otherNodeId);
              const isFactConnection = otherNode?.type === "fact";
              const otherLabel = otherNode
                ? otherNode.type === "fact"
                  ? otherNode.statement
                  : otherNode.name
                : otherNodeId;

              return (
                <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={otherLabel}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {edge.type === "CHARACTER_RELATION"
                            ? "↔"
                            : isSource
                              ? "→"
                              : "←"}{" "}
                          {edge.type}
                          {otherNode && ` • ${otherNode.type}`}
                        </Typography>
                        {edge.episodeTags.length > 0 && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Episodes: {edge.episodeTags.join(", ")}
                          </Typography>
                        )}
                        {isFactConnection ? (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mt: 0.5 }}
                          >
                            <strong>Description:</strong>{" "}
                            {otherNode.description}
                          </Typography>
                        ) : edge.context ? (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ fontStyle: "italic", mt: 0.5 }}
                          >
                            {edge.context}
                          </Typography>
                        ) : null}
                      </>
                    }
                    primaryTypographyProps={{ variant: "body2" }}
                    sx={{
                      cursor: isFactConnection ? "default" : "pointer",
                      "&:hover": isFactConnection
                        ? {}
                        : { backgroundColor: "action.hover" },
                      borderRadius: 1,
                      px: 1,
                    }}
                    onClick={
                      isFactConnection
                        ? undefined
                        : () => onNodeClick(otherNodeId)
                    }
                  />
                </ListItem>
              );
            })}
          </List>
          {edges.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No connections
            </Typography>
          )}
          {edges.length > 0 && filteredEdges.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No matching connections
            </Typography>
          )}
        </Collapse>
      </Box>
    </Paper>
  );
};
