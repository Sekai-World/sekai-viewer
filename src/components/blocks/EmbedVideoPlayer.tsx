import React, { Fragment, useEffect, useState } from "react";

const MusicVideoPlayer: React.FC<{
  videoUrl: string;
}> = (props) => {
  const [isYtbVideo, setIsYtbVideo] = useState(false);
  const [ytbVideoId, setYtbVideoId] = useState("");

  const [isNicoVideo, setIsNicoVideo] = useState(false);
  const [nicoVideoId, setNicoVideoId] = useState("");

  useEffect(() => {
    if (props.videoUrl.includes("youtube.com")) {
      setIsYtbVideo(true);
      setYtbVideoId(
        new URLSearchParams(new URL(props.videoUrl).search).get("v") || ""
      );
    } else if (props.videoUrl.includes("youtu.be")) {
      setIsYtbVideo(true);
      setYtbVideoId(new URL(props.videoUrl).pathname.split("/")[1] || "");
    } else if (props.videoUrl.includes("nicovideo.jp")) {
      setIsNicoVideo(true);
      setNicoVideoId(
        new URL(props.videoUrl).pathname.split("/")[2].split("?")[0] || ""
      );
    }
  }, [props.videoUrl]);

  return (
    <Fragment>
      {isYtbVideo && (
        <iframe
          width="100%"
          height="485"
          src={`https://www.youtube.com/embed/${ytbVideoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: "none" }}
        ></iframe>
      )}
      {isNicoVideo && (
        <iframe
          width="100%"
          height="485"
          src={`https://embed.nicovideo.jp/watch/${nicoVideoId}?autoplay=0`}
          title="niconico"
          allowFullScreen
          allow="encrypted-media *;"
          style={{ border: "none" }}
        ></iframe>
      )}
    </Fragment>
  );
};

export default MusicVideoPlayer;
