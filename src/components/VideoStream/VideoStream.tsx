import * as React from "react";
import styled from "styled-components";

interface IVideoStreamProps {
  countdown?: number | false;
}

const VideoStreamWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  min-height: 100%;
  width: 100%;
  border-bottom: 1px lightgray solid;
`;

const Countdown = styled.div`
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 120px;
`;

const VideoStream: React.FunctionComponent<IVideoStreamProps> = ({
  countdown
}) => (
  <VideoStreamWrapper>
    {countdown && <Countdown>{countdown}</Countdown>}
  </VideoStreamWrapper>
);

export { VideoStream };
