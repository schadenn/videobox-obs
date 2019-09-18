import * as React from "react";
import styled from "styled-components";
import { config } from "../../videobox.config";
import * as path from "path";
import { Video } from "./Video";

interface IVideoStreamProps {
  showCountdown: boolean;
  file: string;
  onPlaybackEnd: () => void;
}

const VideoStreamWrapper = styled.div`
  display: inline-block;
  float: right;
  height: 720px;
  width: 100%;
  border-bottom: 1px lightgray solid;
`;

const PhotoWrapper = styled.img`
  display: flex;
  width: 100%;
  height: 100%;
`;

const OpacityWrapper = styled.div`
  opacity: 0.4;
`;

const VideoStream: React.FunctionComponent<IVideoStreamProps> = ({
  showCountdown,
  file,
  onPlaybackEnd,
}) => {
  const filePath = file && file.length && path.join(config.recordedFilesPath, file);

  React.useEffect(() => {
    if (file.includes("jpg")) {
      setTimeout(onPlaybackEnd, config.photoReviewTime * 1000);
    }
  }, [file]);

  return (
    <VideoStreamWrapper id={"videoStreamWrapper"}>
      {showCountdown && (
        <OpacityWrapper>
          <Video src={"assets/countdown.mp4"} />
        </OpacityWrapper>
      )}
      {filePath && filePath.includes("jpg") && <PhotoWrapper src={filePath} />}
      {filePath && filePath.includes("mp4") && (
        <Video src={filePath} onPlaybackEnd={onPlaybackEnd} />
      )}
    </VideoStreamWrapper>
  );
};

export { VideoStream };
