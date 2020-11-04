import { useMediaQuery } from "@material-ui/core";
import React from "react";

const ColorPreview: React.FC<{ colorCode: string }> = ({ colorCode }) => {
  const displayMode =
    (localStorage.getItem("display-mode") as "dark" | "light" | "auto") ||
    "auto";
  const preferDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  return (
    <div
      style={{
        height: "26px",
        width: "26px",
        border:
          "solid 2px " +
          (displayMode === "auto"
            ? preferDarkMode
              ? "white"
              : "black"
            : displayMode === "dark"
            ? "white"
            : "black"),
        backgroundColor: colorCode,
      }}
    ></div>
  );
};

export default ColorPreview;
