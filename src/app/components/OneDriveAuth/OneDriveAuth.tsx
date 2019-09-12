import * as React from "react";
import styled from "styled-components";
import * as Electron from "electron";
import {oneDriveConfig} from "../../onedrive.config";
import {oneDriveSecrets} from "../../onedrive.secrets";
import BrowserWindow = Electron.remote.BrowserWindow;

const AuthWrapper = styled.div<{ display: boolean } & React.HTMLAttributes<HTMLDivElement>>`
  background-color: white;
  width: 100%;
  min-height: 100%;
  justify-content: center;
  align-items: center;
  display: ${({ display }) => (display ? "flex" : "none")};
` as React.FunctionComponent<{ display: boolean } & React.HTMLAttributes<HTMLDivElement>>;

const OneDriveAuth = ({ onAuthorized, display }) => {
  const getUrlStringFromParams = params => {
    const USP = new URLSearchParams();
    Object.keys(params).forEach(p => params[p] && USP.append(p, params[p]));
    return USP.toString();
  };

  const createLoginUrl = () => {
    const url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
    const params = {
      client_id: oneDriveSecrets.clientId,
      response_type: oneDriveConfig.response_type,
      redirect_uri: oneDriveConfig.redirectUri,
      response_mode: oneDriveConfig.response_mode,
      scope: oneDriveConfig.scope,
    };
    console.log(`${url}?${getUrlStringFromParams(params)}`);
    return `${url}?${getUrlStringFromParams(params)}`;
  };

  const fetchToken = async opt => {
    const params = {
      client_id: oneDriveSecrets.clientId,
      redirect_uri: oneDriveConfig.redirectUri,
      client_secret: oneDriveSecrets.secret,
      grant_type: opt.code ? "authorization_code" : "refresh_token",
      code: opt.code || "",
      refresh_token: opt.refresh || "",
    };
    return fetch(oneDriveConfig.tokenUri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: getUrlStringFromParams(params),
    })
      .catch(err => console.log(err))
      .then(response => response.json())
      .then(msg => {
        setTimeout(() => fetchToken({ refresh: msg.refresh_token }), 3200000);
        return msg;
      })
      .then(msg => onAuthorized(msg.access_token));
  };

  return (
    <AuthWrapper display={display}>
      <button
        onClick={() => {
          const win = new BrowserWindow();
          win.loadURL(createLoginUrl());
          win.webContents.addListener("did-fail-load", (_e, _c, _b, url) => {
            if (url.includes(oneDriveConfig.redirectUri)) {
              win.close();
              const params = new URLSearchParams(url.replace(oneDriveConfig.redirectUri, ""));
              fetchToken({ code: params.get("code") });
            }
          });
          win.webContents.addListener("will-navigate", (_e, url) => {
            if (url.includes(oneDriveConfig.redirectUri)) {
              win.close();
              const params = new URLSearchParams(url.replace(oneDriveConfig.redirectUri, ""));
              fetchToken({ code: params.get("code") });
            }
          });
        }}
      >
        Open OneDrive Auth
      </button>
    </AuthWrapper>
  );
};

export { OneDriveAuth };
