import * as React from "react";
import styled from "styled-components";
import { AppMain } from "./components/AppMain/AppMain";
import { OneDriveAuth } from "./components/OneDriveAuth/OneDriveAuth";
import { SplashScreen } from "./components/SplashScreen/SplashScreen";
import { Confirmation } from "./components/Confirmation/Confirmation";
import { config, TScreenNames } from "./videobox.config";
import { ThankYou } from "./components/ThankYou/thankyou";

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-top: calc(100vh - (100vw * 9 / 16)) solid black;
  border-bottom: 60px solid black;
  border-left: 30px solid black;
  border-right: 30px solid black;
  box-sizing: border-box;
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
`;

const RootComponent = () => {
  const screenNav = config.screens
    .filter(screen => screen.show)
    .reduce((acc, curr) => ({ ...acc, [curr.name]: curr.goto }));
  const [token, setToken] = React.useState("");
  const [file, setFile] = React.useState("");
  const [path, setPath] = React.useState<Partial<TScreenNames>>(
    (config.screens.find(screen => screen.landing) || config.screens[0]).name,
  );
  const screens = {
    splash: (
      <SplashScreen
        onStart={() => {
          setPath(screenNav[path].goto.next);
        }}
      />
    ),
    app: (
      <AppMain
        playbackFile={file}
        onFileRecorded={recFile => setFile(recFile)}
        onPlaybackEnd={() => {
          setPath(screenNav[path].goto.next);
        }}
      />
    ),
    confirmation: (
      <Confirmation
        accessToken={token}
        filename={file}
        onDone={() => {
          setPath(screenNav[path].goto.next);
          setFile("");
        }}
        onRetry={() => {
          setPath(screenNav[path].goto.prev);
          setFile("");
        }}
      />
    ),
    thankyou: (
      <ThankYou
        onEnd={() => {
          setPath(screenNav[path].goto.next);
        }}
      />
    ),
  };

  return (
    <AppWrapper id={"appWrapper"}>
      <OneDriveAuth
        display={!token}
        onAuthorized={token => {
          console.log(token);
          setToken(token);
        }}
      />
      {token && screens[path]}
    </AppWrapper>
  );
};

export { RootComponent };
