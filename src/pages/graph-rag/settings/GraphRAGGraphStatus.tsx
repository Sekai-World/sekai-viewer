import React from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HubIcon from "@mui/icons-material/Hub";
import LinkIcon from "@mui/icons-material/Link";
type GraphStats = { nodes: number; edges: number };
export function GraphRAGGraphStatus({
  graphStats,
  onOpenViewer,
}: {
  graphStats: GraphStats;
  onOpenViewer: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1.5,
        transition: "border-color 150ms, box-shadow 150ms",
        "&:hover": { borderColor: "primary.main", boxShadow: 1 },
      }}
    >
      <Box sx={{ mr: "auto" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          gutterBottom
        >
          Current Graph Status
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<HubIcon />}
            label={`${graphStats.nodes} nodes`}
            size="small"
            variant="outlined"
            color={graphStats.nodes > 0 ? "primary" : "default"}
          />
          <Chip
            icon={<LinkIcon />}
            label={`${graphStats.edges} edges`}
            size="small"
            variant="outlined"
            color={graphStats.edges > 0 ? "primary" : "default"}
          />
        </Stack>
      </Box>
      <Button
        variant="contained"
        size="medium"
        startIcon={<VisibilityIcon />}
        onClick={onOpenViewer}
        disabled={graphStats.nodes === 0}
        title={
          graphStats.nodes === 0 ? "No graph data yet. Run indexing first." : ""
        }
      >
        View Graph
      </Button>
    </Paper>
  );
}
