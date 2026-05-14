import { Box, Card, CardProps, SxProps, Theme } from "@mui/material";
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import SpoilerTag from "../widgets/SpoilerTag";
import { Link } from "react-router-dom";
import { useIsTouchDevice } from "../../utils";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";

const SpoilerCard: React.FC<
  PropsWithChildren<{
    releaseTime: Date;
    toPath?: string;
  }> &
    CardProps
> = ({ children, releaseTime, toPath, ...props }) => {
  const {
    settings: { isSpoilerMosaicked },
  } = useRootStore();
  const isTouchDevice = useIsTouchDevice();

  const [isSpoiler, setIsSpoiler] = useState(false);
  const [touchTimes, setTouchTimes] = useState(0);

  useEffect(() => {
    setIsSpoiler(new Date() < releaseTime);

    return () => {
      setIsSpoiler(false);
    };
  }, [releaseTime]);

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> =
    useCallback(() => {
      setTouchTimes((prev) => prev + 1);
    }, []);

  const onLinkClick: React.MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      if (isSpoiler && isTouchDevice && isSpoilerMosaicked && touchTimes < 2) {
        e.preventDefault();
      }
    },
    [isSpoiler, isSpoilerMosaicked, isTouchDevice, touchTimes]
  );

  const sxSpoilerBox = useMemo(() => {
    let sx: SxProps<Theme> = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      display: "flex",
    };

    if (isSpoilerMosaicked) {
      sx = {
        ...sx,
        backdropFilter: "blur(20px)",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        transition: "opacity .3s ease",
        opacity: 1,
        "&:hover": {
          opacity: 0,
        },
        alignItems: "center",
        justifyContent: "center",
      };
    }

    return sx;
  }, [isSpoilerMosaicked]);

  const card = (
    <Card sx={{ cursor: "pointer", position: "relative" }} {...props}>
      {children}
      {isSpoiler && (
        <Box sx={sxSpoilerBox} onTouchEnd={onTouchEnd}>
          <Box>
            <SpoilerTag />
          </Box>
        </Box>
      )}
    </Card>
  );

  if (toPath) {
    return (
      <Link
        to={toPath}
        onClick={onLinkClick}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        {card}
      </Link>
    );
  }

  return card;
};

export default observer(SpoilerCard);
