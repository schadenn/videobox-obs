import * as React from "react";
import styled from "styled-components";
import { useCallback } from "react";

const HTML5Video = styled.video`
  width: 100%;
  height: 100%;
`;

const Video: React.FunctionComponent<{
  src: string;
  onPlaybackEnd?: () => void;
}> = ({ src, onPlaybackEnd }) => {
  const videoElm = useCallback(node => {
    if (node !== null) {
      node.addEventListener("ended", onPlaybackEnd);
    }
  }, []);

  return (
    <HTML5Video src={src} autoPlay controls={false} ref={videoElm}>
      Sorry, your browser doesn't support embedded videos, but don't worry, you can{" "}
      <a href="videofile.ogg">download it</a>
      and watch it with your favorite video player!
    </HTML5Video>
  );
};

export { Video };
