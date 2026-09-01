import React, { useEffect } from "react";
import { useRegisterEvents } from "@react-sigma/core";

export const NodeClickHandler: React.FC<{
  onNodeClick: (nodeId: string) => void;
}> = ({ onNodeClick }) => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickNode: (event) => onNodeClick(event.node),
      clickStage: () => onNodeClick(""),
    });
  }, [registerEvents, onNodeClick]);

  return null;
};
