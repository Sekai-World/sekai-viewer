import React from "react";
import {
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  CharacterNode,
  GraphEdge,
  EventNode,
} from "../../../utils/graphRag/types";

export interface PairDetailState {
  nodeA: CharacterNode;
  nodeB: CharacterNode;
  directEdges: GraphEdge[];
  sharedEvents: Array<{
    event: EventNode;
    edgeToA: GraphEdge;
    edgeToB: GraphEdge;
  }>;
}

interface PairDetailsPanelProps {
  pair: PairDetailState;
  onClose: () => void;
  onNodeClick: (nodeId: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export const PairDetailsPanel: React.FC<PairDetailsPanelProps> = ({
  pair,
  onClose,
  onNodeClick,
  collapsed,
  onCollapsedChange,
}) => {
  const { nodeA, nodeB, directEdges, sharedEvents } = pair;
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [pair]);

  return (
    <Paper
      ref={ref}
      elevation={3}
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 360,
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
          <Typography variant="subtitle2" fontWeight="bold">
            Character Pair
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
            <IconButton
              size="small"
              aria-label="Close details"
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {[nodeA, nodeB].map((node) => (
            <Paper
              key={node.id}
              variant="outlined"
              sx={{
                flex: 1,
                p: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
              }}
              onClick={() => onNodeClick(node.id)}
            >
              <Chip
                label="CHARACTER"
                size="small"
                color="primary"
                sx={{ mb: 0.5 }}
              />
              <Typography variant="body2" fontWeight="bold">
                {node.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {node.gender}
              </Typography>
              {node.group && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {node.group}
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>

        <Collapse in={!collapsed} timeout={180}>
          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" gutterBottom>
            Direct Relations ({directEdges.length})
          </Typography>
          {directEdges.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No direct relations recorded
            </Typography>
          ) : (
            <List dense>
              {directEdges.map((edge, idx) => (
                <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="caption" color="text.secondary">
                        ↔ CHARACTER_RELATION
                      </Typography>
                    }
                    secondary={
                      <>
                        {edge.context && (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ fontStyle: "italic" }}
                          >
                            {edge.context}
                          </Typography>
                        )}
                        {edge.episodeTags?.length > 0 && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            Episodes: {edge.episodeTags.join(", ")}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" gutterBottom>
            Shared Events ({sharedEvents.length})
          </Typography>
          {sharedEvents.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No shared events recorded
            </Typography>
          ) : (
            <List dense>
              {sharedEvents.map(({ event, edgeToA, edgeToB }, idx) => (
                <ListItem
                  key={idx}
                  disablePadding
                  sx={{
                    py: 0.5,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => onNodeClick(event.id)}
                >
                  <ListItemText
                    primary={event.name}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {nodeA.name}: {edgeToA.context}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {nodeB.name}: {edgeToB.context}
                        </Typography>
                        {event.episodeTags.length > 0 && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            Episodes: {event.episodeTags.join(", ")}
                          </Typography>
                        )}
                      </>
                    }
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: "medium",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Collapse>
      </Box>
    </Paper>
  );
};
