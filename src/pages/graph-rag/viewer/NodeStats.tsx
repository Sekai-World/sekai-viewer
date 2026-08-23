import React from "react";
import { Paper, Stack, Typography } from "@mui/material";

interface NodeStatsProps {
  nodes: number;
  edges: number;
  visibleNodes?: number;
  visibleEdges?: number;
  focused: boolean;
}

const formatCount = (
  visible: number | undefined,
  total: number,
  focused: boolean
) =>
  focused && visible !== undefined ? `${visible}/${total}` : total.toString();

export const NodeStats: React.FC<NodeStatsProps> = ({
  nodes,
  edges,
  visibleNodes,
  visibleEdges,
  focused,
}) => (
  <Paper
    aria-label="Graph statistics"
    elevation={2}
    role="status"
    sx={{
      position: "absolute",
      bottom: 12,
      left: "50%",
      zIndex: 900,
      px: 1.5,
      py: 0.75,
      border: 1,
      borderColor: "divider",
      borderRadius: 1,
      bgcolor: "background.paper",
      transform: "translateX(-50%)",
      pointerEvents: "none",
      whiteSpace: "nowrap",
    }}
  >
    <Stack
      direction="row"
      spacing={1.5}
      divider={<span aria-hidden="true">|</span>}
    >
      <Typography variant="caption" sx={{ fontVariantNumeric: "tabular-nums" }}>
        {formatCount(visibleNodes, nodes, focused)} Nodes
      </Typography>
      <Typography variant="caption" sx={{ fontVariantNumeric: "tabular-nums" }}>
        {formatCount(visibleEdges, edges, focused)} Edges
      </Typography>
    </Stack>
  </Paper>
);
