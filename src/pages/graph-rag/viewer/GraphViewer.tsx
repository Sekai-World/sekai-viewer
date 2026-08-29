import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { SigmaContainer } from "@react-sigma/core";
import { MultiDirectedGraph } from "graphology";
import { observer } from "mobx-react-lite";
import "@react-sigma/core/lib/style.css";
import { graphRAGStore } from "../../../utils/graphRag/storage";
import { embeddingService } from "../../../utils/graphRag/embeddings";
import {
  applyNodeEdit,
  getNodeEditEmbeddingText,
  type NodeEditDraft,
} from "../../../utils/graphRag/nodeEdit";
import {
  GraphNode,
  GraphEdge,
  CharacterNode,
  EventNode,
} from "../../../utils/graphRag/types";
import type { NodeType } from "../../../utils/graphRag/types";
import { byEpisode } from "../../../utils/graphRag/helpers";
import { useRootStore } from "../../../stores/root";
import { PairDetailsPanel, PairDetailState } from "./PairDetailsPanel";
import { NodeDetailsPanel, NodeDetailsState } from "./NodeDetailsPanel";
import {
  GraphEventHandler as ExtractedGraphEventHandler,
  type VisibleGraphStats,
} from "./GraphEventHandler";
import { getSharedSemanticNodeIds } from "../../../utils/graphRag/query";
import { ZoomResponsiveLabels as ExtractedZoomResponsiveLabels } from "./Label";
import { GraphLoader as ExtractedGraphLoader } from "./GraphLoader";
import { NodeClickHandler as ExtractedNodeClickHandler } from "./NodeClickHandler";
import { useMergeNodes } from "./useMergeNodes";
import { GraphViewerToolbarOverlay } from "./Toolbar";
import { NodeStats } from "./NodeStats";
import { NodeEditorDialog } from "./NodeEditorDialog";

interface GraphViewerProps {
  open: boolean;
  onClose: () => void;
}

// Store nodes and edges globally for click handlers
let allNodesMap: Map<string, GraphNode> = new Map();
let allEdgesArray: GraphEdge[] = [];

export const GraphViewer: React.FC<GraphViewerProps> = observer(
  ({ open, onClose }) => {
    const theme = useTheme();
    const {
      settings: {
        graphViewerSuppressLowImportanceNodes: suppressLowImportanceNodes,
        graphViewerLowImportanceConnectionLimit: lowImportanceConnectionLimit,
        graphViewerNodeSizeMultiplier: nodeSizeMultiplier,
        setGraphViewerSuppressLowImportanceNodes,
        setGraphViewerLowImportanceConnectionLimit,
        setGraphViewerNodeSizeMultiplier,
      },
    } = useRootStore();
    const isDark = theme.palette.mode === "dark";
    const graphLabelColor = theme.palette.text.primary;
    const graphFocusColor = theme.palette.primary.main;
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ nodes: 0, edges: 0 });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNodeTypes, setSelectedNodeTypes] = useState<
      Array<Exclude<NodeType, "fact">>
    >([]);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [graphRevision, setGraphRevision] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [toolbarCollapsed, setToolbarCollapsed] = useState(true);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [singleDetails, setSingleDetails] = useState<NodeDetailsState | null>(
      null
    );
    const [pairDetails, setPairDetails] = useState<PairDetailState | null>(
      null
    );
    const [detailsCollapsed, setDetailsCollapsed] = useState(false);
    const [editingNode, setEditingNode] = useState<GraphNode | null>(null);

    const [visibleStats, setVisibleStats] = useState<VisibleGraphStats | null>(
      null
    );
    const [, setGraphDataVersion] = useState(0);

    useEffect(() => {
      const loadStats = async () => {
        if (!open) return;

        setLoading(true);
        try {
          await graphRAGStore.init();
          setStats(await graphRAGStore.getVisualizationStats());
        } finally {
          setLoading(false);
        }
      };

      loadStats();
    }, [open]);

    useEffect(() => {
      const timer = window.setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
      }, 250);

      return () => window.clearTimeout(timer);
    }, [searchQuery]);

    const handleGraphDataLoaded = useCallback(
      (nodes: Map<string, GraphNode>, edges: GraphEdge[]) => {
        allNodesMap = nodes;
        allEdgesArray = edges;
        setGraphDataVersion((version) => version + 1);
      },
      []
    );

    const handleVisibleStatsChange = useCallback(
      (nextStats: VisibleGraphStats) => {
        setVisibleStats((currentStats) =>
          currentStats?.nodes === nextStats.nodes &&
          currentStats.edges === nextStats.edges
            ? currentStats
            : nextStats
        );
      },
      []
    );

    const handleNodesMerged = useCallback(async () => {
      setStats(await graphRAGStore.getVisualizationStats());
      setGraphRevision((revision) => revision + 1);
      setSelectedNodes([]);
      setSingleDetails(null);
      setPairDetails(null);
    }, []);

    const { mergeNodesDialog, openMergeNodesDialog } = useMergeNodes({
      getNodes: () => allNodesMap,
      onMerged: handleNodesMerged,
    });

    const handleNodeClick = useCallback(
      async (nodeId: string) => {
        if (!nodeId) {
          setSelectedNodes([]);
          setSingleDetails(null);
          setPairDetails(null);
          return;
        }

        const node = allNodesMap.get(nodeId);
        if (!node) return;

        // Facts are detail records owned by another entity. Keep the fact details
        // open, but focus the graph on that owner rather than treating the fact as
        // an independent relationship root.
        if (node.type === "fact") {
          const ownerEdge = allEdgesArray.find((edge) => {
            if (edge.type !== "FACT") return false;
            const ownerId =
              edge.sourceId === nodeId
                ? edge.targetId
                : edge.targetId === nodeId
                  ? edge.sourceId
                  : null;
            return (
              ownerId !== null && allNodesMap.get(ownerId)?.type !== "fact"
            );
          });
          const ownerId = ownerEdge
            ? ownerEdge.sourceId === nodeId
              ? ownerEdge.targetId
              : ownerEdge.sourceId
            : null;

          if (ownerId) {
            setSelectedNodes([ownerId]);
            setSingleDetails({
              node,
              edges: allEdgesArray
                .filter(
                  (edge) => edge.sourceId === nodeId || edge.targetId === nodeId
                )
                .sort(byEpisode),
            });
            setPairDetails(null);
            return;
          }
        }

        // If one character is already selected and we click a different character → pair mode
        if (selectedNodes.length === 1 && node.type === "character") {
          const firstNode = allNodesMap.get(selectedNodes[0]);
          if (firstNode?.type === "character" && selectedNodes[0] !== nodeId) {
            const nodeA = firstNode as CharacterNode;
            const nodeB = node as CharacterNode;

            // Direct CHARACTER_RELATION edges between the two
            const directEdges = allEdgesArray
              .filter(
                (e) =>
                  e.type === "CHARACTER_RELATION" &&
                  ((e.sourceId === nodeA.id && e.targetId === nodeB.id) ||
                    (e.sourceId === nodeB.id && e.targetId === nodeA.id))
              )
              .sort(byEpisode);

            // Pair mode is meaningful only for characters with an explicit
            // character relation. Otherwise, focus the newly clicked character
            // normally instead of creating an empty pair view.
            if (directEdges.length === 0) {
              setSelectedNodes([nodeId]);
              const edges = allEdgesArray
                .filter((e) => e.sourceId === nodeId || e.targetId === nodeId)
                .sort(byEpisode);
              setSingleDetails({ node, edges });
              setPairDetails(null);
              return;
            }

            // Events involving both characters
            const eventsToA = new Map<string, GraphEdge>();
            const eventsToB = new Map<string, GraphEdge>();
            for (const e of allEdgesArray) {
              if (e.type !== "INVOLVE") continue;
              if (e.targetId === nodeA.id) eventsToA.set(e.sourceId, e);
              if (e.targetId === nodeB.id) eventsToB.set(e.sourceId, e);
            }
            const sharedEvents: PairDetailState["sharedEvents"] = [];
            for (const [eventId, edgeToA] of eventsToA) {
              const edgeToB = eventsToB.get(eventId);
              if (edgeToB) {
                const ev = allNodesMap.get(eventId);
                if (ev?.type === "event") {
                  sharedEvents.push({
                    event: ev as EventNode,
                    edgeToA,
                    edgeToB,
                  });
                }
              }
            }

            sharedEvents.sort((a, b) => byEpisode(a.edgeToA, b.edgeToA));

            setSelectedNodes([selectedNodes[0], nodeId]);
            setSingleDetails(null);
            setPairDetails({ nodeA, nodeB, directEdges, sharedEvents });
            return;
          }
        }

        // Single selection
        setSelectedNodes([nodeId]);
        const edges = allEdgesArray
          .filter((e) => e.sourceId === nodeId || e.targetId === nodeId)
          .sort(byEpisode);
        setSingleDetails({ node, edges });
        setPairDetails(null);
      },
      [selectedNodes]
    );

    const handleCloseDetails = useCallback(() => {
      setSelectedNodes([]);
      setSingleDetails(null);
      setPairDetails(null);
    }, []);

    const handleEditSelectedNode = useCallback(() => {
      if (singleDetails) setEditingNode(singleDetails.node);
    }, [singleDetails]);

    const handleSaveNode = useCallback(
      async (node: GraphNode, draft: NodeEditDraft) => {
        let updatedNode = applyNodeEdit(node, draft);
        const previousEmbeddingText = getNodeEditEmbeddingText(node);
        const updatedEmbeddingText = getNodeEditEmbeddingText(updatedNode);
        if (
          updatedEmbeddingText !== null &&
          updatedEmbeddingText !== previousEmbeddingText
        ) {
          updatedNode = {
            ...updatedNode,
            embedding: await embeddingService.embed(updatedEmbeddingText),
          } as GraphNode;
        }
        await graphRAGStore.putNode(updatedNode);
        allNodesMap.set(updatedNode.id, updatedNode);
        setSingleDetails((details) =>
          details?.node.id === updatedNode.id
            ? { ...details, node: updatedNode }
            : details
        );
        setGraphRevision((revision) => revision + 1);
      },
      []
    );

    const toolbarProps = {
      searchQuery,
      onSearchQueryChange: setSearchQuery,
      selectedNodeTypes,
      onNodeTypeFilterChange: setSelectedNodeTypes,
      suppressLowImportanceNodes,
      onSuppressLowImportanceNodesChange:
        setGraphViewerSuppressLowImportanceNodes,
      lowImportanceConnectionLimit,
      onLowImportanceConnectionLimitChange:
        setGraphViewerLowImportanceConnectionLimit,
      nodeSizeMultiplier,
      onNodeSizeMultiplierChange: setGraphViewerNodeSizeMultiplier,
      onMergeNodes: openMergeNodesDialog,
      onEditSelectedNode: handleEditSelectedNode,
      canEditSelectedNode: Boolean(singleDetails),
    };

    const sigmaCanvas = (
      <SigmaContainer
        graph={MultiDirectedGraph}
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
        }}
        settings={{
          renderEdgeLabels: false,
          defaultEdgeType: "arrow",
          defaultEdgeColor: isDark ? "#334155" : "#cbd5e1",
          itemSizesReference: "positions",
          labelColor: { attribute: "labelColor", color: graphLabelColor },
          labelSize: 12,
          labelDensity: 0.5,
          labelGridCellSize: 120,
          labelRenderedSizeThreshold: 6,
        }}
      >
        <ExtractedGraphLoader
          searchQuery={debouncedSearchQuery}
          darkMode={isDark}
          labelColor={graphLabelColor}
          suppressLowImportanceNodes={suppressLowImportanceNodes}
          lowImportanceConnectionLimit={lowImportanceConnectionLimit}
          selectedNodeTypes={selectedNodeTypes}
          graphRevision={graphRevision}
          onGraphDataLoaded={handleGraphDataLoaded}
        />
        <ExtractedZoomResponsiveLabels />
        <ExtractedNodeClickHandler onNodeClick={handleNodeClick} />
        <ExtractedGraphEventHandler
          allNodes={allNodesMap}
          selectedNodes={selectedNodes}
          darkMode={isDark}
          fullscreen={fullscreen}
          nodeSizeMultiplier={nodeSizeMultiplier}
          labelColor={graphLabelColor}
          focusColor={graphFocusColor}
          surfaceColor={theme.palette.background.paper}
          onVisibleStatsChange={handleVisibleStatsChange}
          focusNodes={
            pairDetails
              ? getSharedSemanticNodeIds(
                  pairDetails.nodeA.id,
                  pairDetails.nodeB.id,
                  allNodesMap,
                  allEdgesArray
                )
              : undefined
          }
        />
      </SigmaContainer>
    );

    const loadingState = (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 2,
        }}
      >
        <CircularProgress
          sx={
            fullscreen ? { color: isDark ? "#60a5fa" : "#3b82f6" } : undefined
          }
        />
        <Typography
          sx={
            fullscreen ? { color: isDark ? "#94a3b8" : "#64748b" } : undefined
          }
        >
          Loading graph...
        </Typography>
      </Box>
    );

    const nodeStats = (
      <NodeStats
        nodes={stats.nodes}
        edges={stats.edges}
        visibleNodes={visibleStats?.nodes}
        visibleEdges={visibleStats?.edges}
        focused={selectedNodes.length > 0}
      />
    );

    const toolbar = (
      <GraphViewerToolbarOverlay
        {...toolbarProps}
        collapsed={toolbarCollapsed}
        onCollapsedChange={setToolbarCollapsed}
        fullscreen={fullscreen}
        isDark={isDark}
      />
    );

    const detailsPanel = (
      <Box
        sx={
          fullscreen
            ? {
                "& > *": {
                  bgcolor: isDark
                    ? "rgba(15,23,42,0.88) !important"
                    : "rgba(255,255,255,0.88) !important",
                  backdropFilter: "blur(8px)",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.08) !important"
                    : "1px solid rgba(0,0,0,0.08) !important",
                  color: isDark ? "#e2e8f0 !important" : "#1e293b !important",
                },
              }
            : undefined
        }
      >
        {pairDetails ? (
          <PairDetailsPanel
            pair={pairDetails}
            onClose={handleCloseDetails}
            onNodeClick={handleNodeClick}
            collapsed={detailsCollapsed}
            onCollapsedChange={setDetailsCollapsed}
          />
        ) : (
          <NodeDetailsPanel
            details={singleDetails}
            nodesById={allNodesMap}
            onClose={handleCloseDetails}
            onNodeClick={handleNodeClick}
            collapsed={detailsCollapsed}
            onCollapsedChange={setDetailsCollapsed}
          />
        )}
      </Box>
    );

    const graphSurface = (
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        {sigmaCanvas}
        {toolbar}
        {nodeStats}
        {detailsPanel}
      </Box>
    );

    const overlayControlStyle = fullscreen
      ? {
          bgcolor: isDark ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)",
          color: isDark ? "#94a3b8" : "#64748b",
          "&:hover": {
            color: isDark ? "#e2e8f0" : "#1e293b",
            bgcolor: isDark ? "rgba(30,41,59,0.9)" : "rgba(241,245,249,0.9)",
          },
        }
      : {
          color: (currentTheme: typeof theme) => currentTheme.palette.grey[500],
        };

    return (
      <>
        <Dialog
          open={open}
          onClose={onClose}
          fullScreen={fullscreen}
          maxWidth={fullscreen ? false : "lg"}
          fullWidth={!fullscreen}
          PaperProps={{
            sx: fullscreen
              ? { bgcolor: isDark ? "#0f172a" : "#ffffff" }
              : { height: "90vh", maxHeight: "90vh" },
          }}
        >
          <IconButton
            aria-label="close"
            onClick={onClose}
            size={fullscreen ? "small" : "medium"}
            sx={{
              position: "absolute",
              right: fullscreen ? 16 : 8,
              top: fullscreen ? 16 : 8,
              zIndex: 1200,
              ...overlayControlStyle,
            }}
          >
            <CloseIcon />
          </IconButton>
          <IconButton
            aria-label={fullscreen ? "exit fullscreen" : "enter fullscreen"}
            onClick={() => setFullscreen((current) => !current)}
            size={fullscreen ? "small" : "medium"}
            sx={{
              position: "absolute",
              right: 16,
              bottom: 16,
              zIndex: 1200,
              ...overlayControlStyle,
            }}
          >
            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>

          <DialogContent
            dividers={!fullscreen}
            sx={{
              p: 0,
              height: "100%",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {loading ? loadingState : graphSurface}
          </DialogContent>
        </Dialog>
        {mergeNodesDialog}
        <NodeEditorDialog
          node={editingNode}
          onClose={() => setEditingNode(null)}
          onSave={handleSaveNode}
        />
      </>
    );
  }
);
