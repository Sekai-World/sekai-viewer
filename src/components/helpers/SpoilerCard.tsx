import { Box, Card, CardProps } from "@mui/material";
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import SpoilerTag from "../widgets/SpoilerTag";
import { useHistory } from "react-router-dom";

const SpoilerCard: React.FC<
  PropsWithChildren<{
    releaseTime: Date;
    toPath?: string;
  }> &
    CardProps
> = ({ children, releaseTime, toPath }) => {
  const history = useHistory();

  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsSpoiler(new Date() < releaseTime);

    return () => {
      setIsSpoiler(false);
    };
  }, [releaseTime]);

  const onBoxMouseOver: React.MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      setIsActive(true);
    }, []);

  const onBoxMouseOut: React.MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      setIsActive(false);
    }, []);

  const onCardClick: React.MouseEventHandler<HTMLDivElement> =
    useCallback(() => {
      console.log("card clicked", isSpoiler, isActive, toPath);
      if (isSpoiler && !isActive) {
        return;
      }

      if (toPath) {
        history.push(toPath);
        console.log("history pushed", isSpoiler, isActive, toPath);
      }
    }, [history, isActive, isSpoiler, toPath]);

  return (
    <Card
      sx={{ cursor: "pointer", position: "relative" }}
      onClick={onCardClick}
    >
      {children}
      {isSpoiler && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            transition: "opacity .3s ease",
            zIndex: 1,
            opacity: 1,
            "&:hover": {
              opacity: 0,
            },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseOver={onBoxMouseOver}
          onMouseOut={onBoxMouseOut}
        >
          <Box>
            <SpoilerTag />
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default SpoilerCard;
