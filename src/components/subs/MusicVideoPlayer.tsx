import React, { Fragment, useEffect, useRef, useState } from "react";

const MusicVideoPlayer: React.FC<{
  videoPath: string;
  audioPath: string;
  onPlay: CallableFunction;
  onPause: CallableFunction;
  onEnded: CallableFunction;
}> = (props) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlayable, setIsPlayable] = useState<boolean>(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("canplay", () => setIsPlayable(true));
      audioRef.current.addEventListener("loadstart", () =>
        setIsPlayable(false)
      );
    }
  }, []);

  function handleOnPlay(e: React.SyntheticEvent<HTMLVideoElement, Event>) {
    audioRef.current!.currentTime = e.currentTarget.currentTime;
    audioRef.current?.play();
    props.onPlay(e);
  }

  function handleOnPause(e: React.SyntheticEvent<HTMLVideoElement, Event>) {
    audioRef.current!.currentTime = e.currentTarget.currentTime;
    audioRef.current?.pause();
    props.onPause(e);
  }

  function handleOnEnded(e: React.SyntheticEvent<HTMLVideoElement, Event>) {
    audioRef.current!.currentTime = e.currentTarget.currentTime;
    audioRef.current?.pause();
    props.onEnded(e);
  }

  function handleOnSeeked(e: React.SyntheticEvent<HTMLVideoElement, Event>) {
    audioRef.current!.currentTime = e.currentTarget.currentTime;
    // audioRef.current?.pause()
  }

  return (
    <Fragment>
      <video
        src={props.videoPath}
        controls={isPlayable}
        autoPlay={false}
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        onEnded={handleOnEnded}
        onSeeked={handleOnSeeked}
        style={{ width: "100%" }}
      ></video>
      <audio src={props.audioPath} ref={audioRef}></audio>
    </Fragment>
  );
};

export default MusicVideoPlayer;
