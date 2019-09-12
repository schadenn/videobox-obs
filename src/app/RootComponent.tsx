import * as React from "react";
import styled from "styled-components";
import { AppMain } from "./components/AppMain/AppMain";
import { OneDriveAuth } from "./components/OneDriveAuth/OneDriveAuth";
import { SplashScreen } from "./components/SplashScreen/SplashScreen";
import { Confirmation } from "./components/Confirmation/Confirmation";

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
  const [token, setToken] = React.useState("");
  const [file, setFile] = React.useState("");
  const [path, setPath] = React.useState<"splashscreen" | "app" | "confirmation">("app");

  return (
    <AppWrapper id={"appWrapper"}>
        <OneDriveAuth
          display={!token}
          onAuthorized={token => {
            console.log(token);
            setToken(token);
          }}
        />
      {token && path === "splashscreen" && (
        <SplashScreen
          onStart={() => {
            setPath("app");
          }}
        />
      )}
      {token && path === "app" && (
        <AppMain
          token={token}
          onEnd={file => {
            setFile(file);
            setPath("confirmation");
          }}
        />
      )}
      {token && path === "confirmation" && (
        <Confirmation
          accessToken={token}
          filename={file}
          onDone={() => {
            setPath("splashscreen");
            setFile("");
          }}
          onRetry={() => {
            setPath("app");
            setFile("");
          }}
        />
      )}
    </AppWrapper>
  );
};

export { RootComponent };
